"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdRemoveRedEye,
  MdHistory,
  MdLightbulbOutline,
  MdFitnessCenter,
  MdCalendarMonth,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: MdDashboard },
  {
    label: "Eye Scan",
    href: "/dashboard/scan",
    icon: MdRemoveRedEye,
    badge: "New",
  },
  { label: "Diagnosis History", href: "/dashboard/history", icon: MdHistory },
  {
    label: "Recommendations",
    href: "/dashboard/recommendations",
    icon: MdLightbulbOutline,
  },
  {
    label: "Eye Exercises",
    href: "/dashboard/exercises",
    icon: MdFitnessCenter,
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: MdCalendarMonth,
  },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: MdSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#0B1120] text-white transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#3B8BD4] to-transparent opacity-60" />

      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-5 py-6 border-b border-white/6 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center">
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
        {!collapsed && (
          <div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              ClearVision
            </span>
            <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
              Eye Care AI
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-[#185FA5] border border-[#0B1120] flex items-center justify-center hover:bg-[#378ADD] transition-colors shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <MdChevronRight size={14} className="text-white" />
        ) : (
          <MdChevronLeft size={14} className="text-white" />
        )}
      </button>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain">
        {!collapsed && (
          <p className="text-[10px] font-medium text-white/30 tracking-widest uppercase px-3 mb-3">
            Main Menu
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 relative ${
                collapsed ? "justify-center px-0 py-3" : ""
              } ${isActive ? "bg-[#185FA5]/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#378ADD] rounded-r-full" />
              )}
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${isActive ? "text-[#85B7EB]" : "text-white/40 group-hover:text-white/70"}`}
              />
              {!collapsed && (
                <>
                  <span className="text-[13.5px] font-medium flex-1 truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#185FA5] text-[#85B7EB]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-white/6 pt-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ${
                collapsed ? "justify-center px-0 py-3" : ""
              } ${isActive ? "bg-[#185FA5]/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${isActive ? "text-[#85B7EB]" : "text-white/40 group-hover:text-white/70"}`}
              />
              {!collapsed && (
                <span className="text-[13.5px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/4 border border-white/6">
            <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">
                User
              </p>
              <p className="text-[10px] text-white/40 truncate">Patient</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center pt-2">
            <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white">U</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
