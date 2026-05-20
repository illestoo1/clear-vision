"use client";

import { useEffect, useState } from "react";
import {
  MdPerson,
  MdLock,
  MdNotifications,
  MdRemoveRedEye,
  MdDeleteForever,
  MdCheckCircle,
  MdChevronRight,
  MdEdit,
  MdLanguage,
  MdDarkMode,
  MdShield,
} from "react-icons/md";
import { getProfile, updateProfile } from "../../../lib/supabase/queries";
import { createClient } from "../../../lib/supabase/client";

type Tab = "profile" | "security" | "notifications" | "privacy" | "appearance";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <MdPerson size={16} /> },
  { id: "security", label: "Security", icon: <MdLock size={16} /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <MdNotifications size={16} />,
  },
  { id: "privacy", label: "Privacy", icon: <MdShield size={16} /> },
  { id: "appearance", label: "Appearance", icon: <MdDarkMode size={16} /> },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${checked ? "bg-[#185FA5]" : "bg-slate-200"}`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("profile");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    language: "English",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwStatus, setPwStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [notifs, setNotifs] = useState({
    scanResults: true,
    appointments: true,
    reminders: true,
    recommendations: false,
    marketing: false,
    sms: false,
  });
  const [privacy, setPrivacy] = useState({
    shareAnonymous: true,
    storageConsent: true,
    thirdParty: false,
  });
  const [appearance, setAppearance] = useState({
    theme: "light" as "light" | "dark" | "system",
    density: "default" as "compact" | "default",
    language: "English",
  });

  useEffect(() => {
    void getProfile().then((p) => {
      if (p)
        setProfile({
          fullName: p.full_name ?? "",
          email: p.email ?? "",
          phone: "",
          dob: "",
          gender: "",
          language: "English",
        });
    });
  }, []);

  async function saveProfile() {
    setSaveStatus("saving");
    try {
      await updateProfile({
        full_name: profile.fullName,
        email: profile.email,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  }

  async function updatePassword() {
    setPwError(null);
    if (passwords.next !== passwords.confirm) {
      setPwError("Passwords don't match");
      return;
    }
    if (passwords.next.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwStatus("saving");
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    });
    if (error) {
      setPwError(error.message);
      setPwStatus("error");
    } else {
      setPwStatus("saved");
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 2500);
    }
  }

  const initials =
    profile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap ${
              tab === t.id
                ? "bg-[#185FA5] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {tab === "profile" && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#185FA5] flex items-center justify-center">
                <span className="text-[22px] font-bold text-white">
                  {initials}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50">
                <MdEdit size={12} className="text-gray-500" />
              </button>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900">
                {profile.fullName || "—"}
              </p>
              <p className="text-[12px] text-gray-400">{profile.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#185FA5]/10 text-[#185FA5]">
                Patient
              </span>
            </div>
          </div>

          <SectionCard title="Personal Information">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Full Name",
                  key: "fullName",
                  type: "text",
                  placeholder: "Jane Doe",
                },
                {
                  label: "Email Address",
                  key: "email",
                  type: "email",
                  placeholder: "you@example.com",
                },
                {
                  label: "Phone Number",
                  key: "phone",
                  type: "tel",
                  placeholder: "+234 800 000 0000",
                },
                {
                  label: "Date of Birth",
                  key: "dob",
                  type: "date",
                  placeholder: "",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={profile[f.key as keyof typeof profile]}
                    onChange={(e) =>
                      setProfile({ ...profile, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                >
                  <option value="">Prefer not to say</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Language
                </label>
                <select
                  value={profile.language}
                  onChange={(e) =>
                    setProfile({ ...profile, language: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                >
                  {[
                    "English",
                    "French",
                    "Yoruba",
                    "Igbo",
                    "Hausa",
                    "Pidgin",
                  ].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            {saveStatus === "error" && (
              <p className="text-[12px] text-red-500 mt-3">
                Failed to save. Please try again.
              </p>
            )}
            <div className="flex justify-end mt-5">
              <button
                onClick={saveProfile}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] hover:bg-[#0f4a85] disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors"
              >
                {saveStatus === "saving" ? (
                  "Saving…"
                ) : saveStatus === "saved" ? (
                  <>
                    <MdCheckCircle size={15} /> Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Security ── */}
      {tab === "security" && (
        <div className="space-y-5">
          <SectionCard title="Change Password">
            <div className="space-y-4 max-w-sm">
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password", key: "next" },
                { label: "Confirm New Password", key: "confirm" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type="password"
                    value={passwords[f.key as keyof typeof passwords]}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [f.key]: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                  />
                </div>
              ))}
              {pwError && <p className="text-[12px] text-red-500">{pwError}</p>}
              <button
                onClick={updatePassword}
                disabled={pwStatus === "saving"}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] hover:bg-[#0f4a85] disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors"
              >
                {pwStatus === "saving" ? (
                  "Updating…"
                ) : pwStatus === "saved" ? (
                  <>
                    <MdCheckCircle size={15} /> Updated!
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Active Sessions">
            {[
              {
                device: "Chrome · MacOS",
                location: "Lagos, Nigeria",
                time: "Active now",
                current: true,
              },
              {
                device: "Safari · iPhone 14",
                location: "Lagos, Nigeria",
                time: "2 hours ago",
                current: false,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <MdRemoveRedEye size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800">
                      {s.device}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {s.location} · {s.time}
                    </p>
                  </div>
                </div>
                {s.current ? (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    This device
                  </span>
                ) : (
                  <button className="text-[11px] font-semibold text-red-500 hover:text-red-700">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </SectionCard>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === "notifications" && (
        <div className="space-y-5">
          <SectionCard title="Email Notifications">
            <div className="space-y-1">
              {[
                {
                  key: "scanResults",
                  label: "Scan results",
                  desc: "When your AI analysis is ready",
                },
                {
                  key: "appointments",
                  label: "Appointment reminders",
                  desc: "24 hours before each visit",
                },
                {
                  key: "reminders",
                  label: "Exercise reminders",
                  desc: "Daily eye exercise nudges",
                },
                {
                  key: "recommendations",
                  label: "New recommendations",
                  desc: "When new advice is available",
                },
                {
                  key: "marketing",
                  label: "Product updates",
                  desc: "News about ClearVision features",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <Toggle
                    checked={notifs[item.key as keyof typeof notifs]}
                    onChange={() =>
                      setNotifs({
                        ...notifs,
                        [item.key]: !notifs[item.key as keyof typeof notifs],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="SMS Notifications">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">
                  SMS alerts
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Appointment reminders via text message
                </p>
              </div>
              <Toggle
                checked={notifs.sms}
                onChange={() => setNotifs({ ...notifs, sms: !notifs.sms })}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Privacy ── */}
      {tab === "privacy" && (
        <div className="space-y-5">
          <SectionCard title="Data & Privacy">
            <div className="space-y-1">
              {[
                {
                  key: "shareAnonymous",
                  label: "Contribute anonymised data",
                  desc: "Help improve our AI model with de-identified scan data",
                },
                {
                  key: "storageConsent",
                  label: "Store scan history",
                  desc: "Keep your retinal images and analysis in ClearVision",
                },
                {
                  key: "thirdParty",
                  label: "Share with care providers",
                  desc: "Allow your doctor to access your scan history",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <Toggle
                    checked={privacy[item.key as keyof typeof privacy]}
                    onChange={() =>
                      setPrivacy({
                        ...privacy,
                        [item.key]: !privacy[item.key as keyof typeof privacy],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Your Data">
            <div className="space-y-3">
              {[
                {
                  label: "Download my data",
                  desc: "Export all scans, history and account data as a ZIP",
                  action: "Request export",
                  color: "text-[#185FA5]",
                },
                {
                  label: "Delete all scan history",
                  desc: "Permanently remove all retinal images and results",
                  action: "Delete scans",
                  color: "text-red-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <button
                    className={`text-[12px] font-semibold ${item.color} flex items-center gap-1 shrink-0 hover:opacity-70`}
                  >
                    {item.action} <MdChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="bg-red-50 rounded-3xl border border-red-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <MdDeleteForever size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-red-800">
                  Delete Account
                </p>
                <p className="text-[11px] text-red-600/70 mt-1 leading-relaxed">
                  Permanently delete your account and all associated data. This
                  cannot be undone.
                </p>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="mt-3 text-[12px] font-semibold text-red-600 hover:text-red-800 underline"
                >
                  I understand, delete my account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Appearance ── */}
      {tab === "appearance" && (
        <div className="space-y-5">
          <SectionCard title="Theme">
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAppearance({ ...appearance, theme: t })}
                  className={`relative rounded-2xl border-2 p-4 text-center transition-all ${appearance.theme === t ? "border-[#185FA5]" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div
                    className={`w-full h-14 rounded-xl mb-3 overflow-hidden ${t === "light" ? "bg-white border border-slate-200" : t === "dark" ? "bg-[#0B1120]" : "bg-gradient-to-br from-white to-[#0B1120]"}`}
                  >
                    <div
                      className={`h-3 w-full ${t === "dark" ? "bg-[#185FA5]/30" : "bg-slate-100"}`}
                    />
                  </div>
                  <p className="text-[12px] font-semibold text-gray-700 capitalize">
                    {t}
                  </p>
                  {appearance.theme === t && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#185FA5] flex items-center justify-center">
                      <MdCheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Language & Region">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MdLanguage size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    Display Language
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {appearance.language}
                  </p>
                </div>
              </div>
              <select
                value={appearance.language}
                onChange={(e) =>
                  setAppearance({ ...appearance, language: e.target.value })
                }
                className="px-3 py-2 text-[12px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
              >
                {["English", "French", "Yoruba", "Igbo", "Hausa"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
