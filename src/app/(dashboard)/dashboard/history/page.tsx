"use client";

import { useState } from "react";
import {
  MdRemoveRedEye,
  MdFilterList,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdChevronRight,
  MdSearch,
} from "react-icons/md";

const allScans = [
  {
    id: 1,
    date: "May 13, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "No issues detected",
    notes: "Clear retinal image. No abnormalities observed.",
    eye: "Both",
  },
  {
    id: 2,
    date: "Apr 28, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "Mild digital eye strain",
    notes:
      "Minor signs of eye fatigue consistent with screen use. Recommended 20-20-20 rule.",
    eye: "Both",
  },
  {
    id: 3,
    date: "Apr 14, 2026",
    result: "Monitor",
    risk: "Medium",
    condition: "Slight astigmatism",
    notes:
      "Irregular corneal curvature detected. Follow-up with optometrist advised.",
    eye: "Left",
  },
  {
    id: 4,
    date: "Mar 28, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "No issues detected",
    notes: "Healthy optic disc and macula. Good retinal vasculature.",
    eye: "Both",
  },
  {
    id: 5,
    date: "Mar 10, 2026",
    result: "Monitor",
    risk: "Medium",
    condition: "Early dry eye markers",
    notes: "Reduced tear film detected. Lubricating drops recommended.",
    eye: "Right",
  },
  {
    id: 6,
    date: "Feb 18, 2026",
    result: "Concern",
    risk: "High",
    condition: "Elevated IOP markers",
    notes:
      "Possible early glaucoma indicators. Referred for tonometry and specialist review.",
    eye: "Left",
  },
  {
    id: 7,
    date: "Feb 2, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "No issues detected",
    notes: "Routine scan — all clear.",
    eye: "Both",
  },
  {
    id: 8,
    date: "Jan 15, 2026",
    result: "Healthy",
    risk: "Low",
    condition: "No issues detected",
    notes: "Post-visit follow-up scan — unchanged from last visit.",
    eye: "Both",
  },
];

type Filter = "All" | "Healthy" | "Monitor" | "Concern";

const riskStyle: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

const resultIcon: Record<string, React.ReactNode> = {
  Healthy: <MdCheckCircle size={15} className="text-emerald-500" />,
  Monitor: <MdWarning size={15} className="text-amber-500" />,
  Concern: <MdError size={15} className="text-red-500" />,
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filters: Filter[] = ["All", "Healthy", "Monitor", "Concern"];

  const filtered = allScans.filter((s) => {
    const matchFilter = filter === "All" || s.result === filter;
    const matchSearch =
      s.condition.toLowerCase().includes(search.toLowerCase()) ||
      s.date.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    Healthy: allScans.filter((s) => s.result === "Healthy").length,
    Monitor: allScans.filter((s) => s.result === "Monitor").length,
    Concern: allScans.filter((s) => s.result === "Concern").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Healthy",
            count: counts.Healthy,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: <MdCheckCircle size={16} className="text-emerald-500" />,
          },
          {
            label: "Monitor",
            count: counts.Monitor,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: <MdWarning size={16} className="text-amber-500" />,
          },
          {
            label: "Concern",
            count: counts.Concern,
            color: "text-red-600",
            bg: "bg-red-50",
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
            <p className={`text-[28px] font-bold ${c.color}`}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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

        {/* Scan rows */}
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-gray-400">
              No scans match your filter.
            </div>
          ) : (
            filtered.map((scan) => (
              <div key={scan.id}>
                <button
                  onClick={() =>
                    setExpanded(expanded === scan.id ? null : scan.id)
                  }
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {resultIcon[scan.result]}
                  </div>

                  {/* Date + condition */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800">
                      {scan.date}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {scan.condition}
                    </p>
                  </div>

                  {/* Eye */}
                  <span className="text-[10px] text-gray-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 hidden sm:block">
                    {scan.eye} eye
                  </span>

                  {/* Risk badge */}
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${riskStyle[scan.risk]}`}
                  >
                    {scan.risk}
                  </span>

                  <MdChevronRight
                    size={16}
                    className={`text-slate-300 shrink-0 transition-transform ${expanded === scan.id ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded notes */}
                {expanded === scan.id && (
                  <div className="px-5 pb-4 ml-12">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                        AI Analysis Notes
                      </p>
                      <p className="text-[12px] text-gray-600 leading-relaxed">
                        {scan.notes}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-gray-400">
                          Result:
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                          {resultIcon[scan.result]} {scan.result}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="text-[10px] text-gray-400">
                          Eye: {scan.eye}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
