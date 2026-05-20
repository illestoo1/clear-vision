"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MdRemoveRedEye, MdTrendingUp, MdLightbulbOutline,
  MdCalendarMonth, MdCheckCircle, MdArrowForward, MdFitnessCenter,
} from "react-icons/md";
import { getScans, getAppointments, getProfile } from "@/app/lib/supabase/queries";
import type { Scan, Appointment, Profile } from "@/app/lib/supabase/queries";

const riskStyle: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

const quickActions = [
  { href: "/dashboard/scan", title: "New Eye Scan", desc: "Analyse your eyes in 2 minutes", dark: true, icon: <MdRemoveRedEye size={26} className="text-white/70" />, iconBg: "bg-[#185FA5]/30" },
  { href: "/dashboard/history", title: "Scan History", desc: "View past results and trends", dark: false, icon: <MdTrendingUp size={26} className="text-[#185FA5]" />, iconBg: "bg-[#185FA5]/8" },
  { href: "/dashboard/recommendations", title: "Recommendations", desc: "Personalised care guidance", dark: false, icon: <MdLightbulbOutline size={26} className="text-[#185FA5]" />, iconBg: "bg-[#185FA5]/8" },
  { href: "/dashboard/exercises", title: "Eye Exercises", desc: "Guided daily routines", dark: false, icon: <MdFitnessCenter size={26} className="text-[#185FA5]" />, iconBg: "bg-[#185FA5]/8" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function SkeletonCard() {
  return <div className="bg-white rounded-2xl border border-slate-100 h-24 animate-pulse" />;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, s, a] = await Promise.all([getProfile(), getScans(), getAppointments()]);
      setProfile(p);
      setScans(s);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setAppointments(a.filter((apt) => apt.status !== "cancelled" && new Date(apt.date) >= today));
      setLoading(false);
    }
    void load();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const recentScans = scans.slice(0, 3);
  const upcomingAppts = appointments.slice(0, 2);

  const avgRisk = scans.length === 0 ? "—"
    : scans.some((s) => s.risk_level === "High") ? "High"
    : scans.filter((s) => s.risk_level === "Medium").length > 1 ? "Medium"
    : "Low";

  const lastScanLabel = scans[0]
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(scans[0].created_at).getTime()) / 86_400_000);
        return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff}d ago`;
      })()
    : "No scans";

  const thisMonth = scans.filter(
    (s) => new Date(s.created_at).getMonth() === new Date().getMonth(),
  ).length;

  const nextAppt = appointments[0]
    ? new Date(appointments[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "None booked";

  const stats = [
    { label: "Total Scans", value: String(scans.length), sub: `+${thisMonth} this month` },
    { label: "Avg Risk", value: avgRisk, sub: "Based on all scans" },
    { label: "Last Scan", value: lastScanLabel, sub: scans[0]?.result ?? "—" },
    { label: "Appointments", value: String(appointments.length), sub: `Next: ${nextAppt}` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-7">

      {/* Welcome */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
          Good {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">Here&apos;s your eye health overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[24px] font-bold text-gray-900 leading-tight">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all ${
              a.dark ? "bg-[#0B1120] hover:bg-[#111827]" : "bg-white border border-slate-100 hover:border-[#185FA5]/30"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.iconBg}`}>
              {a.icon}
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${a.dark ? "text-white" : "text-gray-900"}`}>{a.title}</p>
              <p className={`text-[11px] mt-0.5 ${a.dark ? "text-white/40" : "text-gray-400"}`}>{a.desc}</p>
            </div>
            <MdArrowForward size={14} className={`mt-auto transition-colors ${a.dark ? "text-white/30 group-hover:text-white/60" : "text-gray-300 group-hover:text-[#185FA5]"}`} />
          </Link>
        ))}
      </div>

      {/* Recent scans + appointments */}
      <div className="grid md:grid-cols-2 gap-5">

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
              <MdRemoveRedEye size={15} className="text-[#185FA5]" /> Recent Scans
            </h2>
            <Link href="/dashboard/history" className="text-[11px] text-[#185FA5] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-14 mx-5 my-2 bg-slate-100 rounded-xl animate-pulse" />)
            ) : recentScans.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12px] text-gray-400 mb-2">No scans yet</p>
                <Link href="/dashboard/scan" className="text-[12px] font-semibold text-[#185FA5] hover:underline">Run your first scan →</Link>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800">
                      {new Date(scan.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{scan.condition_notes ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-gray-600">{scan.result ?? "—"}</span>
                    {scan.risk_level && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskStyle[scan.risk_level]}`}>
                        {scan.risk_level}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
              <MdCalendarMonth size={15} className="text-[#185FA5]" /> Upcoming Appointments
            </h2>
            <Link href="/dashboard/appointments" className="text-[11px] text-[#185FA5] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              [...Array(2)].map((_, i) => <div key={i} className="h-14 mx-5 my-2 bg-slate-100 rounded-xl animate-pulse" />)
            ) : upcomingAppts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12px] text-gray-400 mb-2">No upcoming appointments</p>
                <Link href="/dashboard/appointments" className="text-[12px] font-semibold text-[#185FA5] hover:underline">Book one →</Link>
              </div>
            ) : (
              upcomingAppts.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#185FA5]/8 flex items-center justify-center shrink-0">
                    <MdCalendarMonth size={16} className="text-[#185FA5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800">{apt.doctor}</p>
                    <p className="text-[11px] text-gray-400 truncate">{apt.specialty ?? apt.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold text-gray-700">
                      {new Date(apt.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[10px] text-gray-400">{apt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <div className="bg-[#0B1120] rounded-3xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#185FA5]/30 flex items-center justify-center shrink-0">
            <MdCheckCircle size={20} className="text-[#85B7EB]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">20-20-20 reminder</p>
            <p className="text-[11px] text-white/40 mt-0.5">Every 20 min of screen time, look 20 ft away for 20 seconds.</p>
          </div>
        </div>
        <Link href="/dashboard/exercises" className="shrink-0 text-[12px] font-semibold text-[#85B7EB] hover:text-white transition-colors flex items-center gap-1">
          Exercises <MdArrowForward size={14} />
        </Link>
      </div>
    </div>
  );
}