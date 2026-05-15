"use client";

import Link from "next/link";
import {
  MdRemoveRedEye,
  MdTrendingUp,
  MdLightbulbOutline,
  MdCalendarMonth,
  MdCheckCircle,
  MdArrowForward,
  MdFitnessCenter,
} from "react-icons/md";

const recentScans = [
  {
    date: "May 13, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "No issues detected",
  },
  {
    date: "Apr 28, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "Mild digital eye strain",
  },
  {
    date: "Apr 14, 2026",
    result: "Monitor",
    risk: "Medium",
    condition: "Slight astigmatism noted",
  },
];

const upcomingAppointments = [
  {
    date: "May 22, 2026",
    time: "10:30 AM",
    provider: "Dr. Adaeze Okonkwo",
    type: "Follow-up Consultation",
  },
  {
    date: "Jun 5, 2026",
    time: "2:00 PM",
    provider: "Dr. Emeka Nwosu",
    type: "Comprehensive Eye Exam",
  },
];

const stats = [
  { label: "Total Scans", value: "12", sub: "+2 this month" },
  { label: "Avg Risk", value: "Low", sub: "Stable trend" },
  { label: "Last Scan", value: "2d ago", sub: "Healthy result" },
  { label: "Doctor Visits", value: "3", sub: "Next: May 22" },
];

const quickActions = [
  {
    href: "/dashboard/scan",
    title: "New Eye Scan",
    desc: "Analyse your eyes in 2 minutes",
    icon: <MdRemoveRedEye size={28} className="text-white/70" />,
    dark: true,
  },
  {
    href: "/dashboard/history",
    title: "Scan History",
    desc: "View past results and trends",
    icon: <MdTrendingUp size={28} className="text-[#185FA5]" />,
    dark: false,
  },
  {
    href: "/dashboard/recommendations",
    title: "Recommendations",
    desc: "Personalised care guidance",
    icon: <MdLightbulbOutline size={28} className="text-[#185FA5]" />,
    dark: false,
  },
  {
    href: "/dashboard/exercises",
    title: "Eye Exercises",
    desc: "Guided daily routines",
    icon: <MdFitnessCenter size={28} className="text-[#185FA5]" />,
    dark: false,
  },
];

const riskStyle: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* ── Welcome ── */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
          Good morning 👋
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">
          Here's your eye health overview for today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
          >
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className="text-[24px] font-bold text-gray-900 leading-tight">
              {s.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all ${
              a.dark
                ? "bg-[#0B1120] hover:bg-[#111827]"
                : "bg-white border border-slate-100 hover:border-[#185FA5]/30"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.dark ? "bg-[#185FA5]/30" : "bg-[#185FA5]/8"}`}
            >
              {a.icon}
            </div>
            <div>
              <p
                className={`text-[13px] font-semibold ${a.dark ? "text-white" : "text-gray-900"}`}
              >
                {a.title}
              </p>
              <p
                className={`text-[11px] mt-0.5 ${a.dark ? "text-white/40" : "text-gray-400"}`}
              >
                {a.desc}
              </p>
            </div>
            <MdArrowForward
              size={14}
              className={`mt-auto ${a.dark ? "text-white/30 group-hover:text-white/60" : "text-gray-300 group-hover:text-[#185FA5]"} transition-colors`}
            />
          </Link>
        ))}
      </div>

      {/* ── Recent scans + Appointments ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent scans */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
              <MdRemoveRedEye size={16} className="text-[#185FA5]" /> Recent
              Scans
            </h2>
            <Link
              href="/dashboard/history"
              className="text-[11px] text-[#185FA5] hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentScans.map((scan, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800">
                    {scan.date}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {scan.condition}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-gray-600">
                    {scan.result}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskStyle[scan.risk]}`}
                  >
                    {scan.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
              <MdCalendarMonth size={16} className="text-[#185FA5]" /> Upcoming
              Appointments
            </h2>
            <Link
              href="/dashboard/appointments"
              className="text-[11px] text-[#185FA5] hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingAppointments.map((apt, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#185FA5]/8 flex items-center justify-center shrink-0">
                  <MdCalendarMonth size={16} className="text-[#185FA5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800">
                    {apt.provider}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {apt.type}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-semibold text-gray-700">
                    {apt.date}
                  </p>
                  <p className="text-[10px] text-gray-400">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Health tip banner ── */}
      <div className="bg-[#0B1120] rounded-3xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#185FA5]/30 flex items-center justify-center shrink-0">
            <MdCheckCircle size={20} className="text-[#85B7EB]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">
              20-20-20 reminder
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Every 20 minutes, look at something 20 feet away for 20 seconds.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/exercises"
          className="shrink-0 text-[12px] font-semibold text-[#85B7EB] hover:text-white transition-colors flex items-center gap-1"
        >
          Exercises <MdArrowForward size={14} />
        </Link>
      </div>
    </div>
  );
}
