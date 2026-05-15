"use client";

import Link from "next/link";
import {
  MdRemoveRedEye,
  MdArrowForward,
  MdCheck,
  MdSecurity,
  MdSpeed,
  MdInsights,
} from "react-icons/md";

export default function LandingPage() {
  const features = [
    {
      icon: <MdRemoveRedEye size={22} className="text-[#85B7EB]" />,
      title: "Retinal AI Analysis",
      desc: "Upload a photo and get instant diagnostic insights powered by deep learning trained on 2M+ retinal scans.",
    },
    {
      icon: <MdSecurity size={22} className="text-[#85B7EB]" />,
      title: "HIPAA-Compliant Storage",
      desc: "Your scans and health data are encrypted at rest and in transit. Only you control access.",
    },
    {
      icon: <MdSpeed size={22} className="text-[#85B7EB]" />,
      title: "Results in Under 30s",
      desc: "No clinic visit needed. Get a preliminary assessment from your phone or computer in seconds.",
    },
    {
      icon: <MdInsights size={22} className="text-[#85B7EB]" />,
      title: "Trend Tracking",
      desc: "Monitor your eye health over time. Spot patterns before they become problems.",
    },
  ];

  const stats = [
    { value: "94.8%", label: "Diagnostic accuracy" },
    { value: "2M+", label: "Scans analysed" },
    { value: "<30s", label: "Time to results" },
    { value: "180+", label: "Countries supported" },
  ];

  const conditions = [
    "Diabetic Retinopathy",
    "Glaucoma Risk",
    "Macular Degeneration",
    "Cataracts",
    "Hypertensive Retinopathy",
    "Astigmatism",
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
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
            <span className="text-[14px] font-semibold text-gray-900">
              ClearVision
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold px-4 py-2 bg-[#185FA5] text-white rounded-lg hover:bg-[#0f4a85] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background radial */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#185FA5]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#185FA5]/8 border border-[#185FA5]/20 rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#185FA5] animate-pulse" />
            <span className="text-[12px] font-medium text-[#185FA5]">
              Now with GPT-4V retinal analysis
            </span>
          </div>

          <h1 className="text-[52px] sm:text-[64px] font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
            See your eye health
            <br />
            <span className="text-[#185FA5]">clearly.</span>
          </h1>

          <p className="text-[17px] text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
            Upload a retinal image. Get instant AI-powered analysis for 6+
            conditions — no clinic visit, no waiting room, no extra hardware.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 bg-[#185FA5] hover:bg-[#0f4a85] text-white text-[14px] font-semibold rounded-xl transition-colors shadow-lg shadow-[#185FA5]/20"
            >
              Start free scan <MdArrowForward size={16} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-[14px] font-semibold rounded-xl transition-colors"
            >
              Sign in to dashboard
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">
            No credit card required · Free for personal use
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-[#0B1120]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[32px] font-bold text-white mb-1">{s.value}</p>
              <p className="text-[12px] text-white/40 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[32px] font-bold text-gray-900 mb-3">
              Everything you need to monitor your vision
            </h2>
            <p className="text-[15px] text-gray-500">
              From scan to insights in under a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#0B1120] rounded-2xl p-6 hover:bg-[#111827] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#185FA5]/20 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[28px] font-bold text-gray-900 mb-3">
            Conditions we screen for
          </h2>
          <p className="text-[14px] text-gray-500 mb-10">
            Our model is trained to detect early markers of:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {conditions.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-[13px] font-medium text-gray-700 px-4 py-2 rounded-full shadow-sm"
              >
                <MdCheck size={14} className="text-[#185FA5]" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0B1120]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[32px] font-bold text-white mb-4">
            Start monitoring your eye health today
          </h2>
          <p className="text-[14px] text-white/40 mb-8">
            Free to use. No hardware. Results in seconds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#185FA5] hover:bg-[#0f4a85] text-white text-[14px] font-semibold rounded-xl transition-colors"
          >
            Create free account <MdArrowForward size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#185FA5] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <ellipse
                  cx="9"
                  cy="9"
                  rx="8"
                  ry="5"
                  stroke="white"
                  strokeWidth="1.6"
                  fill="none"
                />
                <circle cx="9" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-gray-700">
              ClearVision
            </span>
          </div>
          <p className="text-[12px] text-gray-400">
            © {new Date().getFullYear()} ClearVision · For informational use
            only. Not a substitute for clinical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
