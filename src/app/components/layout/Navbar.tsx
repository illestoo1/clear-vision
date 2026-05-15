"use client";

import { usePathname, useRouter } from "next/navigation";
import { MdNotificationsNone, MdSearch, MdLogout } from "react-icons/md";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back — here's your eye health overview",
  },
  "/dashboard/scan": {
    title: "Eye Scan",
    subtitle: "Upload a retinal image for AI-powered analysis",
  },
  "/dashboard/history": {
    title: "Diagnosis History",
    subtitle: "Review all your past scans and results",
  },
  "/dashboard/recommendations": {
    title: "Recommendations",
    subtitle: "Evidence-based self-care for your conditions",
  },
  "/dashboard/exercises": {
    title: "Eye Exercises",
    subtitle: "Guided exercises to strengthen and protect your vision",
  },
  "/dashboard/appointments": {
    title: "Appointments",
    subtitle: "Manage your upcoming eye care visits",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Preferences, privacy and account management",
  },
};

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  const matchedKey = Object.keys(pageTitles).find(
    (key) => pathname === key || pathname?.startsWith(key + "/"),
  );
  const page = matchedKey
    ? pageTitles[matchedKey]
    : { title: "ClearVision", subtitle: "AI-powered eye care" };

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? "U");

  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">
          {page.title}
        </h1>
        <p className="text-[12px] text-gray-400 mt-0.5">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <MdSearch
            size={15}
            className="absolute left-2.5 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-[13px] rounded-lg bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 w-44 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <MdNotificationsNone size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100 ml-1">
          <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white">
              {initials}
            </span>
          </div>
          <span className="text-[13px] font-medium text-gray-700 hidden sm:block">
            {displayName}
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          disabled={signingOut}
          title="Sign out"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <MdLogout size={16} />
        </button>
      </div>
    </header>
  );
}
