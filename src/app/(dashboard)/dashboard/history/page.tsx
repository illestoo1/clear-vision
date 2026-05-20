"use client";

import { useEffect, useState } from "react";
import {
  MdRemoveRedEye,
  MdFilterList,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdChevronRight,
  MdSearch,
  MdDelete,
} from "react-icons/md";
import { getScans, deleteScan } from "../../../lib/supabase/queries";
import type { Scan } from "../../../lib/supabase/queries";

type Filter = "All" | "Healthy" | "Monitor" | "Concern";

// ── Typed shape of the ai_analysis jsonb column ───────────────
interface AiAnalysis {
  overall_result?: string;
  risk_level?: string;
  conditions?: Array<{ name: string; confidence: number; description: string }>;
  observations?: string[];
  recommendations?: string[];
  disclaimer?: string;
}

// Safely narrows Record<string, unknown> → AiAnalysis
// Every field is explicitly cast so nothing stays `unknown` in JSX
function parseAnalysis(raw: Record<string, unknown> | null): AiAnalysis | null {
  if (!raw) return null;
  return {
    overall_result:
      typeof raw.overall_result === "string" ? raw.overall_result : undefined,
    risk_level: typeof raw.risk_level === "string" ? raw.risk_level : undefined,
    disclaimer: typeof raw.disclaimer === "string" ? raw.disclaimer : undefined,
    observations: Array.isArray(raw.observations)
      ? (raw.observations as unknown[]).map(String)
      : undefined,
    recommendations: Array.isArray(raw.recommendations)
      ? (raw.recommendations as unknown[]).map(String)
      : undefined,
    conditions: Array.isArray(raw.conditions)
      ? (raw.conditions as unknown[]).map((c) => {
          const item = c as Record<string, unknown>;
          return {
            name: typeof item.name === "string" ? item.name : "",
            description:
              typeof item.description === "string" ? item.description : "",
            confidence:
              typeof item.confidence === "number" ? item.confidence : 0,
          };
        })
      : undefined,
  };
}
// ─────────────────────────────────────────────────────────────

const riskStyle: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50   text-amber-700   border-amber-200",
  High: "bg-red-50     text-red-700     border-red-200",
};

const resultIcon: Record<string, React.ReactNode> = {
  Healthy: <MdCheckCircle size={15} className="text-emerald-500" />,
  Monitor: <MdWarning size={15} className="text-amber-500" />,
  Concern: <MdError size={15} className="text-red-500" />,
};

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    void getScans().then((s) => {
      setScans(s);
      setLoading(false);
    });
  }, []);

  const filters: Filter[] = ["All", "Healthy", "Monitor", "Concern"];

  const filtered = scans.filter((s) => {
    const matchFilter = filter === "All" || s.result === filter;
    const matchSearch =
      (s.condition_notes ?? "").toLowerCase().includes(search.toLowerCase()) ||
      new Date(s.created_at)
        .toLocaleDateString()
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    Healthy: scans.filter((s) => s.result === "Healthy").length,
    Monitor: scans.filter((s) => s.result === "Monitor").length,
    Concern: scans.filter((s) => s.result === "Concern").length,
  };

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Healthy",
            count: counts.Healthy,
            color: "text-emerald-600",
            icon: <MdCheckCircle size={16} className="text-emerald-500" />,
          },
          {
            label: "Monitor",
            count: counts.Monitor,
            color: "text-amber-600",
            icon: <MdWarning size={16} className="text-amber-500" />,
          },
          {
            label: "Concern",
            count: counts.Concern,
            color: "text-red-600",
            icon: <MdError size={16} className="text-red-500" />,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {c.icon}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {c.label}
              </p>
            </div>
            <p className={`text-[28px] font-bold ${c.color}`}>
              {loading ? "—" : c.count}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <MdFilterList size={16} className="text-gray-400" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filter === f
                    ? "bg-[#185FA5] text-white"
                    : "bg-slate-100 text-gray-500 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <MdSearch
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search scans…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#185FA5]/30 focus:border-[#185FA5] w-44 transition-all"
            />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 mx-5 my-3 bg-slate-100 rounded-xl animate-pulse"
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <MdRemoveRedEye
                size={32}
                className="text-slate-200 mx-auto mb-3"
              />
              <p className="text-[13px] text-gray-400">
                {scans.length === 0
                  ? "No scans yet. Run your first scan to see results here."
                  : "No scans match your filter."}
              </p>
            </div>
          ) : (
            filtered.map((scan) => {
              const result = scan.result ?? "—";
              // parseAnalysis converts every field from `unknown` to a concrete type
              const analysis = parseAnalysis(
                scan.ai_analysis as Record<string, unknown> | null,
              );

              return (
                <div key={scan.id}>
                  {/* Row */}
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                    <button
                      onClick={() =>
                        setExpanded(expanded === scan.id ? null : scan.id)
                      }
                      className="flex items-center gap-4 flex-1 min-w-0 text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {resultIcon[result] ?? (
                          <MdRemoveRedEye size={15} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800">
                          {new Date(scan.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {scan.condition_notes ?? "No notes"}
                        </p>
                      </div>
                      {scan.risk_level && (
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 hidden sm:block ${riskStyle[scan.risk_level]}`}
                        >
                          {scan.risk_level}
                        </span>
                      )}
                      <MdChevronRight
                        size={16}
                        className={`text-slate-300 shrink-0 transition-transform ${expanded === scan.id ? "rotate-90" : ""}`}
                      />
                    </button>

                    {/* Delete button — visible on row hover */}
                    <button
                      onClick={() => handleDelete(scan.id)}
                      disabled={deleting === scan.id}
                      title="Delete scan"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40 shrink-0"
                    >
                      <MdDelete size={13} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Expanded detail panel */}
                  {expanded === scan.id && (
                    <div className="px-5 pb-5 ml-12">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        {/* Result + risk badge */}
                        <div className="flex items-center gap-2">
                          {resultIcon[result]}
                          <span className="text-[12px] font-semibold text-gray-800">
                            {result}
                          </span>
                          {scan.risk_level && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskStyle[scan.risk_level]}`}
                            >
                              {scan.risk_level} risk
                            </span>
                          )}
                        </div>

                        {/* Condition notes */}
                        {scan.condition_notes && (
                          <p className="text-[12px] text-gray-600 leading-relaxed">
                            {scan.condition_notes}
                          </p>
                        )}

                        {/* Conditions with confidence bars */}
                        {analysis?.conditions &&
                          analysis.conditions.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Detected Conditions
                              </p>
                              <div className="space-y-2">
                                {analysis.conditions.map((c, i) => (
                                  <div key={i}>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-[11px] font-medium text-gray-700">
                                        {c.name}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {Math.round(c.confidence * 100)}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#185FA5] rounded-full"
                                        style={{
                                          width: `${c.confidence * 100}%`,
                                        }}
                                      />
                                    </div>
                                    {c.description && (
                                      <p className="text-[10px] text-gray-400 mt-0.5">
                                        {c.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Recommendations — each `r` is string, safe to render */}
                        {analysis?.recommendations &&
                          analysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Recommendations
                              </p>
                              <ul className="space-y-1">
                                {analysis.recommendations.map((r, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-[11px] text-gray-500"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-[#185FA5] mt-1.5 shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {/* Disclaimer — typed as string, no String() needed */}
                        {analysis?.disclaimer && (
                          <p className="text-[10px] text-gray-400 italic border-t border-slate-200 pt-2">
                            {analysis.disclaimer}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
