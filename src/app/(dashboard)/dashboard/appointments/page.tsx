"use client";

import { useEffect, useState } from "react";
import {
  MdCalendarMonth, MdLocationOn, MdPerson, MdCheckCircle,
  MdSchedule, MdAdd, MdChevronRight, MdVideoCall, MdPhone,
  MdClose, MdEdit, MdDelete,
} from "react-icons/md";
import {
  getAppointments, insertAppointment, updateAppointment, deleteAppointment,
} from "@/app/lib/supabase/queries";
import type { Appointment } from "@/app/lib/supabase/queries";

type AType   = "In-person" | "Video call" | "Phone";
type AStatus = "confirmed" | "pending" | "cancelled";

const typeIcon: Record<AType, React.ReactNode> = {
  "In-person": <MdPerson    size={13} className="text-[#185FA5]"    />,
  "Video call": <MdVideoCall size={13} className="text-violet-500"  />,
  "Phone":      <MdPhone     size={13} className="text-emerald-500" />,
};

const statusStyle: Record<AStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-50   text-amber-700   border-amber-200",
  cancelled: "bg-red-50     text-red-700     border-red-200",
};

const avatarColors = [
  "bg-[#185FA5]", "bg-violet-600", "bg-rose-500", "bg-emerald-600", "bg-amber-500",
];

function getInitials(name: string) {
  return name.split(" ").filter((w) => w.length > 1).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getColor(name: string) {
  const i = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[i];
}

// Compare dates safely — strips time so "2026-05-22" >= today always works
function isUpcoming(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

const emptyForm = {
  doctor: "", specialty: "", date: "", time: "",
  type: "In-person" as AType, location: "", notes: "",
};

export default function AppointmentsPage() {
  const [all,      setAll]      = useState<Appointment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    void getAppointments().then((a) => { setAll(a); setLoading(false); });
  }, []);

  // Separate upcoming vs past using the safe comparison
  const upcoming = all.filter((a) => a.status !== "cancelled" && isUpcoming(a.date));
  const past     = all.filter((a) => a.status === "cancelled" || !isUpcoming(a.date));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openBook() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(a: Appointment) {
    setEditId(a.id);
    setForm({
      doctor:    a.doctor,
      specialty: a.specialty  ?? "",
      date:      a.date,
      time:      a.time,
      type:      a.type       as AType,
      location:  a.location   ?? "",
      notes:     a.notes      ?? "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.doctor || !form.date || !form.time) return;
    setSaving(true);
    try {
      if (editId) {
        await updateAppointment(editId, {
          doctor:    form.doctor,
          specialty: form.specialty,
          date:      form.date,
          time:      form.time,
          type:      form.type,
          location:  form.location,
          notes:     form.notes,
        });
        // Update in place immediately
        setAll((prev) =>
          prev.map((a) =>
            a.id === editId
              ? { ...a, doctor: form.doctor, specialty: form.specialty, date: form.date, time: form.time, type: form.type, location: form.location, notes: form.notes }
              : a,
          ),
        );
        showToast("Appointment updated ✓");
      } else {
        // insertAppointment returns the full row from Supabase including id + created_at
        const created = await insertAppointment({
          doctor:    form.doctor,
          specialty: form.specialty,
          date:      form.date,
          time:      form.time,
          type:      form.type,
          location:  form.location,
          notes:     form.notes,
          status:    "pending",
        });
        // Prepend so it appears immediately at the top of upcoming
        setAll((prev) => [created, ...prev]);
        showToast(`Appointment booked with ${form.doctor} ✓`);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (e) {
      console.error(e);
      showToast("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAppointment(id);
      setAll((prev) => prev.filter((a) => a.id !== id));
      showToast("Appointment removed");
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  }

  const stats = [
    {
      label: "Upcoming",
      value: upcoming.length,
      icon: <MdSchedule size={16} className="text-[#185FA5]" />,
    },
    {
      label: "This month",
      value: all.filter((a) => new Date(a.date).getMonth() === new Date().getMonth()).length,
      icon: <MdCalendarMonth size={16} className="text-amber-500" />,
    },
    {
      label: "Total visits",
      value: all.length,
      icon: <MdCheckCircle size={16} className="text-emerald-500" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 bg-[#0B1120] text-white text-[13px] font-medium px-4 py-3 rounded-2xl shadow-xl animate-fade-in">
          <MdCheckCircle size={16} className="text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              {s.icon}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-[28px] font-bold text-gray-900">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Upcoming appointments ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
            <MdCalendarMonth size={17} className="text-[#185FA5]" />
            Upcoming Appointments
          </h2>
          <button
            onClick={openBook}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#185FA5] px-4 py-1.5 rounded-xl hover:bg-[#0f4a85] transition-colors"
          >
            <MdAdd size={15} /> Book New
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="h-16 mx-6 my-3 bg-slate-100 rounded-xl animate-pulse" />
            ))
          ) : upcoming.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <MdCalendarMonth size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-[13px] text-gray-400 mb-2">No upcoming appointments.</p>
              <button
                onClick={openBook}
                className="text-[13px] font-semibold text-[#185FA5] hover:underline"
              >
                Book your first one →
              </button>
            </div>
          ) : (
            upcoming.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors group"
              >
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full ${getColor(appt.doctor)} flex items-center justify-center text-white text-[12px] font-semibold shrink-0`}>
                  {getInitials(appt.doctor)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">{appt.doctor}</p>
                  <p className="text-[11px] text-gray-400">{appt.specialty ?? appt.type}</p>
                </div>

                {/* Date */}
                <div className="text-center shrink-0 hidden sm:block">
                  <p className="text-[12px] font-semibold text-gray-700">{formatDate(appt.date)}</p>
                  <p className="text-[11px] text-gray-400">{appt.time}</p>
                </div>

                {/* Type + location */}
                <div className="hidden lg:block shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                    {typeIcon[appt.type as AType] ?? <MdPerson size={13} />}
                    <span>{appt.type}</span>
                  </div>
                  {appt.location && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <MdLocationOn size={11} />
                      <span className="truncate max-w-[130px]">{appt.location}</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle[appt.status as AStatus] ?? statusStyle.pending}`}>
                  {appt.status}
                </span>

                {/* Edit / delete — show on hover */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(appt)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#185FA5]/10 flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <MdEdit size={13} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteId(appt.id)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <MdDelete size={13} className="text-gray-500" />
                  </button>
                </div>

                <MdChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Visit history ── */}
      {(loading || past.length > 0) && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-gray-800">Visit History</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="h-14 mx-6 my-3 bg-slate-100 rounded-xl animate-pulse" />
              ))
            ) : (
              past.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/40 transition-colors">
                  <div className={`w-9 h-9 rounded-full ${getColor(appt.doctor)} flex items-center justify-center text-white text-[11px] font-semibold shrink-0 opacity-70`}>
                    {getInitials(appt.doctor)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-600">{appt.doctor}</p>
                    <p className="text-[11px] text-gray-400">{appt.specialty ?? appt.type}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                    {typeIcon[appt.type as AType] ?? <MdPerson size={13} />}
                    <span>{appt.type}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-gray-500">{formatDate(appt.date)} · {appt.time}</p>
                    {appt.notes && (
                      <p className="text-[11px] text-gray-400 italic mt-0.5 max-w-[200px] truncate">{appt.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Book / Edit modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-gray-800">
                {editId ? "Edit Appointment" : "Book Appointment"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <MdClose size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Doctor */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Doctor / Specialist
                </label>
                <input
                  type="text"
                  placeholder="Dr. Full Name"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ophthalmologist"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                  />
                </div>
              </div>

              {/* Visit type */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Visit Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["In-person", "Video call", "Phone"] as AType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`py-2 text-[12px] font-semibold rounded-xl border transition-colors ${
                        form.type === t
                          ? "bg-[#185FA5] text-white border-[#185FA5]"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#185FA5]/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Location / Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos Eye Centre, VI"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any details for this visit…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-gray-600 text-[13px] rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.doctor || !form.date || !form.time || saving}
                className="flex-1 py-2.5 bg-[#185FA5] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0f4a85] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : editId ? "Save Changes" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <MdDelete size={22} className="text-red-500" />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-800 mb-2">Cancel appointment?</h3>
            <p className="text-[12px] text-gray-400 mb-6">
              This will permanently remove the appointment. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-gray-600 text-[13px] rounded-xl hover:bg-slate-50 transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 text-white text-[13px] font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}