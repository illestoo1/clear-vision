"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel ── */}
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
            See clearly,
            <br />
            live better.
          </h2>
          <p className="text-[13px] text-white/40 leading-relaxed">
            AI-powered retinal analysis from the comfort of your home.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "94.8% diagnostic accuracy",
              "Instant AI-driven insights",
              "No extra hardware required",
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

      {/* ── Form panel ── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="inline-flex items-center gap-1.5 bg-[#185FA5]/8 border border-[#185FA5]/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#185FA5]" />
            <span className="text-[11px] font-medium text-[#185FA5]">
              Secure patient login
            </span>
          </div>

          <h1 className="text-[22px] font-semibold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-gray-400 mb-7">
            Sign in to your ClearVision account
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#185FA5] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#185FA5] hover:bg-[#0f4a85] disabled:opacity-60 text-white text-[13px] font-semibold rounded-lg transition-colors mt-1"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Sign In <span className="text-base">→</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-300">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-[12px] text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#185FA5] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
