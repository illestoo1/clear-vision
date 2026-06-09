"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900 mb-2">
            Reset link sent
          </h1>
          <p className="text-[13px] text-gray-500">
            Check your inbox for a password reset email and follow the link to
            set a new password.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-[13px] text-[#185FA5] hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-[#0B1120] px-10 py-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#3B8BD4] to-transparent opacity-70" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(56,138,221,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-lg bg-[#185FA5] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <ellipse
                cx="9"
                cy="9"
                rx="8"
                ry="5"
                stroke="white"
                strokeWidth="1.4"
                fill="none"
              />
              <circle cx="9" cy="9" r="2.5" fill="white" />
              <circle cx="9.8" cy="8.2" r="0.8" fill="#185FA5" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-white">
              ClearVision
            </p>
            <p className="text-[10px] text-white/35 tracking-widest uppercase mt-0.5">
              Eye Care AI
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-[28px] font-semibold text-white leading-snug mb-3">
            Forgot your password?
            <br />
            We’ve got you covered.
          </h2>
          <p className="text-[13px] text-white/40 leading-relaxed">
            Enter the email address associated with your account and we’ll send
            a reset link.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Secure reset process",
              "Email sent instantly",
              "Continue your scans quickly",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#378ADD] shrink-0" />
                <span className="text-[12px] text-white/50">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] text-white/20 relative">
          © {new Date().getFullYear()} ClearVision · All rights reserved
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 mb-8 transition-colors"
          >
            ← Back to sign in
          </Link>

          <h1 className="text-[22px] font-semibold text-gray-900 mb-1">
            Reset your password
          </h1>
          <p className="text-[13px] text-gray-400 mb-7">
            We’ll send a password reset link to your email address.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#185FA5] hover:bg-[#0f4a85] disabled:opacity-60 text-white text-[13px] font-semibold rounded-lg transition-colors mt-1"
            >
              {loading ? "Sending reset link…" : "Send reset link"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
