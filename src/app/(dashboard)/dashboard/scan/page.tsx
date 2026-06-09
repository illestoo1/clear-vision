"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MdCloudUpload,
  MdRemoveRedEye,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdArrowForward,
} from "react-icons/md";
import { createClient } from "../../../lib/supabase/client";
import { insertScan } from "../../../lib/supabase/queries";

// ── Types ─────────────────────────────────────────────────────
interface Condition {
  name: string;
  confidence: number;
  description: string;
}

interface ScanAnalysis {
  overall_result: "Healthy" | "Monitor" | "Concern";
  risk_level: "Low" | "Medium" | "High";
  conditions: Condition[];
  observations: string[];
  recommendations: string[];
  disclaimer: string;
}

async function isLikelyRetinalImage(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(true);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      const pixelCount = imageData.length / 4;
      for (let i = 0; i < imageData.length; i += 4) {
        red += imageData[i];
        green += imageData[i + 1];
        blue += imageData[i + 2];
      }
      const avgRed = red / pixelCount;
      const avgGreen = green / pixelCount;
      const avgBlue = blue / pixelCount;
      resolve(avgRed > 70 && avgRed > avgGreen && avgRed > avgBlue);
    };
    img.onerror = () => resolve(true);
    img.src = dataUrl;
  });
}

// ── Style maps ────────────────────────────────────────────────
const resultBanner = {
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Monitor: "border-amber-200  bg-amber-50  text-amber-800",
  Concern: "border-red-200    bg-red-50    text-red-800",
};

const riskBadge = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100   text-amber-700",
  High: "bg-red-100     text-red-700",
};

const ResultIcon = {
  Healthy: <MdCheckCircle size={22} className="text-emerald-600 shrink-0" />,
  Monitor: <MdWarning size={22} className="text-amber-600  shrink-0" />,
  Concern: <MdError size={22} className="text-red-600    shrink-0" />,
};

// ── Call Python backend /analyze ──────────────────────────────
async function analyseImage(file: File): Promise<ScanAnalysis> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const url = apiUrl ? `${apiUrl}/analyze` : "/analyze";

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    // No Content-Type header — browser sets it automatically with boundary for FormData
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Server error ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.detail || json.message || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const text = await res.text();
  let data: { success: boolean; analysis: ScanAnalysis };
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response from analyze endpoint: ${text}`);
  }

  if (!data.success || !data.analysis) {
    throw new Error("Invalid response from AI server.");
  }

  return data.analysis;
}

// ── Component ─────────────────────────────────────────────────
export default function ScanPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      setWarning(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      setWarning(null);
      return;
    }
    setFile(f);
    setAnalysis(null);
    setError(null);
    setWarning(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setPreview(src);
      if (src) {
        const isRetinal = await isLikelyRetinalImage(src);
        if (!isRetinal) {
          setWarning(
            "This image may not be a retinal scan. Please upload a clear eye image.",
          );
        }
      }
    };
    reader.readAsDataURL(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function runAnalysis() {
    if (!file) return;
    if (warning) {
      setError(
        warning ||
          "This image does not appear to be a retinal scan. Please upload a retinal image.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyseImage(file);
      setAnalysis(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed.";
      // Give a helpful hint if backend is not running
      setError(
        msg.includes("fetch") || msg.includes("Failed to fetch")
          ? "Cannot reach the AI server. Make sure your Python backend is running on port 8000."
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveScan() {
    if (!analysis) return;
    setSaving(true);
    try {
      // Upload image to Supabase Storage
      let imageUrl: string | null = null;
      if (file) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("scans")
            .upload(path, file);
          if (!upErr) {
            const { data: urlData } = supabase.storage
              .from("scans")
              .getPublicUrl(path);
            imageUrl = urlData.publicUrl;
          }
        }
      }

      // Save scan record to DB
      await insertScan({
        image_url: imageUrl,
        result: analysis.overall_result,
        risk_level: analysis.risk_level,
        condition_notes:
          analysis.conditions.length > 0
            ? analysis.conditions.map((c) => c.name).join(", ")
            : "No conditions detected",
        ai_analysis: analysis as unknown as Record<string, unknown>,
      });

      setSaved(true);
      setTimeout(() => router.push("/dashboard/history"), 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("saveScan:", msg);
      setError(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setAnalysis(null);
    setError(null);
    setSaved(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* ── Upload zone ── */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !file && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 transition-all ${
          file
            ? "border-[#185FA5]/40 bg-[#185FA5]/5 cursor-default"
            : "border-slate-200 bg-white hover:border-[#185FA5]/50 hover:bg-slate-50/80 cursor-pointer"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Retinal scan preview"
              className="max-h-72 rounded-2xl object-contain shadow-md"
            />
            <p className="text-[12px] text-gray-400">
              {file?.name} · {((file?.size ?? 0) / 1024).toFixed(0)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
            >
              Remove image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#185FA5]/10 flex items-center justify-center">
              <MdCloudUpload size={32} className="text-[#185FA5]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-800">
                Drop a retinal image here
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                or click to browse · JPEG, PNG, WebP · max 10 MB
              </p>
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap justify-center">
              {["Clear image", "Good lighting", "Centred retina"].map((tip) => (
                <span
                  key={tip}
                  className="flex items-center gap-1 text-[11px] text-gray-400"
                >
                  <MdCheckCircle size={12} className="text-[#185FA5]" /> {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Analyse button ── */}
      {file && !loading && !analysis && (
        <button
          onClick={runAnalysis}
          disabled={!!warning}
          className={`w-full py-3.5 text-white text-[14px] font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#185FA5]/20 ${
            warning
              ? "bg-slate-300 text-slate-600 cursor-not-allowed"
              : "bg-[#185FA5] hover:bg-[#0f4a85]"
          }`}
        >
          <MdRemoveRedEye size={18} /> Analyse this scan
        </button>
      )}

      {/* ── Warning ── */}
      {warning && !analysis && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <MdWarning size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-700 leading-relaxed">
            {warning}
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-[#185FA5]/15 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#185FA5] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#185FA5]/20 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-gray-800">
              Analysing your retinal image
            </p>
            <p className="text-[12px] text-gray-400 mt-1">
              AI is reviewing for 6+ conditions — this takes 10–30 seconds
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Preprocessing", "Detecting features", "Generating report"].map(
              (step, i) => (
                <span
                  key={step}
                  className="flex items-center gap-1.5 text-[11px] text-gray-400"
                >
                  {i > 0 && <span className="text-gray-200">→</span>}
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#185FA5] animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                  {step}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <MdError size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Results ── */}
      {analysis && (
        <div className="space-y-4">
          {/* Overall result banner */}
          <div
            className={`rounded-3xl border p-5 flex items-start justify-between gap-4 ${resultBanner[analysis.overall_result]}`}
          >
            <div className="flex items-center gap-3">
              {ResultIcon[analysis.overall_result]}
              <div>
                <p className="text-[16px] font-bold">
                  {analysis.overall_result}
                </p>
                <p className="text-[11px] opacity-60 mt-0.5 max-w-sm leading-relaxed">
                  {analysis.disclaimer}
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ${riskBadge[analysis.risk_level]}`}
            >
              {analysis.risk_level} risk
            </span>
          </div>

          {/* Detected conditions */}
          {analysis.conditions.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-[13px] font-semibold text-gray-800 mb-4">
                Detected conditions
              </h3>
              <div className="space-y-4">
                {analysis.conditions.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-semibold text-gray-800">
                        {c.name}
                      </p>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#185FA5] rounded-full transition-all duration-700"
                        style={{ width: `${c.confidence * 100}%` }}
                      />
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observations + Recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Observations
              </h3>
              <ul className="space-y-2">
                {analysis.observations.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-gray-600"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#185FA5] mt-1.5 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-gray-600"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Save + new scan */}
          <div className="flex gap-3">
            <button
              onClick={saveScan}
              disabled={saving || saved}
              className={`flex-1 py-3 text-[13px] font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-[#185FA5] hover:bg-[#0f4a85] text-white disabled:opacity-60 shadow-lg shadow-[#185FA5]/20"
              }`}
            >
              {saved ? (
                <>
                  <MdCheckCircle size={16} /> Saved! Redirecting to history…
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Saving…
                </>
              ) : (
                <>
                  <MdArrowForward size={16} /> Save to my history
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 border border-slate-200 text-gray-600 text-[13px] font-medium rounded-2xl hover:bg-slate-50 transition-colors"
            >
              New scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
