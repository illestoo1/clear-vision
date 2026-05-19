"use client";

import { useState } from "react";
import {
  MdCalendarMonth,
  MdLocationOn,
  MdPerson,
  MdCheckCircle,
  MdSchedule,
  MdAdd,
  MdChevronRight,
  MdVideoCall,
  MdPhone,
  MdClose,
  MdEdit,
  MdDelete,
} from "react-icons/md";

type AppointmentType = "In-person" | "Video call" | "Phone";
type AppointmentStatus = "confirmed" | "pending" | "cancelled";

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: AppointmentType;
  location: string;
  status: AppointmentStatus;
  initials: string;
  color: string;
}

interface PastAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: AppointmentType;
  result: string;
  initials: string;
  color: string;
}

const initialUpcoming: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Adaeze Okonkwo",
    specialty: "Ophthalmologist",
    date: "Thu, 22 May 2026",
    time: "10:30 AM",
    type: "In-person",
    location: "Lagos Eye Centre, VI",
    status: "confirmed",
    initials: "AO",
    color: "bg-[#185FA5]",
  },
  {
    id: 2,
    doctor: "Dr. Emeka Nwosu",
    specialty: "Optometrist",
    date: "Mon, 2 Jun 2026",
    time: "2:00 PM",
    type: "Video call",
    location: "ClearVision Telehealth",
    status: "pending",
    initials: "EN",
    color: "bg-violet-600",
  },
];

const past: PastAppointment[] = [
  {
    id: 3,
    doctor: "Dr. Adaeze Okonkwo",
    specialty: "Ophthalmologist",
    date: "Mon, 18 Mar 2026",
    time: "11:00 AM",
    type: "In-person",
    result: "Routine check — all clear",
    initials: "AO",
    color: "bg-[#185FA5]",
  },
  {
    id: 4,
    doctor: "Dr. Ngozi Eze",
    specialty: "Retinal Specialist",
    date: "Fri, 7 Feb 2026",
    time: "9:00 AM",
    type: "In-person",
    result: "Referred for IOP monitoring",
    initials: "NE",
    color: "bg-rose-500",
  },
  {
    id: 5,
    doctor: "Dr. Emeka Nwosu",
    specialty: "Optometrist",
    date: "Tue, 14 Jan 2026",
    time: "3:30 PM",
    type: "Video call",
    result: "Prescription updated",
    initials: "EN",
    color: "bg-violet-600",
  },
];

const typeIcon: Record<AppointmentType, React.ReactNode> = {
  "In-person": <MdPerson size={13} className="text-[#185FA5]" />,
  "Video call": <MdVideoCall size={13} className="text-violet-500" />,
  Phone: <MdPhone size={13} className="text-emerald-500" />,
};

const statusStyle: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const emptyForm = {
  doctor: "",
  date: "",
  time: "",
  type: "In-person" as AppointmentType,
  location: "",
  notes: "",
};

export default function AppointmentsPage() {
  const [upcoming, setUpcoming] = useState<Appointment[]>(initialUpcoming);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openBook() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(appt: Appointment) {
    setEditId(appt.id);
    setForm({
      doctor: appt.doctor,
      date: "",
      time: appt.time,
      type: appt.type,
      location: appt.location,
      notes: "",
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.doctor || !form.date || !form.time) return;

    const initials = form.doctor
      .split(" ")
      .filter((w) => w.length > 1)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const colors = ["bg-[#185FA5]", "bg-violet-600", "bg-rose-500", "bg-emerald-600", "bg-amber-500"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (editId !== null) {
      setUpcoming((prev) =>
        prev.map((a) =>
          a.id === editId
            ? { ...a, doctor: form.doctor, time: form.time, type: form.type, location: form.location, initials, }
            : a,
        ),
      );
    } else {
      const newAppt: Appointment = {
        id: Date.now(),
        doctor: form.doctor,
        specialty: "Specialist",
        date: new Date(form.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
        time: form.time,
        type: form.type,
        location: form.location || "To be confirmed",
        status: "pending",
        initials,
        color,
      };
      setUpcoming((prev) => [...prev, newAppt]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  }

  function handleDelete(id: number) {
    setUpcoming((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  }

  function cancelAppointment(id: number) {
    setUpcoming((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a)),
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Upcoming", value: upcoming.filter((a) => a.status !== "cancelled").length, icon: <MdSchedule size={16} className="text-[#185FA5]" /> },
          { label: "This month", value: 1, icon: <MdCalendarMonth size={16} className="text-amber-500" /> },
          { label: "Total visits", value: past.length + upcoming.length, icon: <MdCheckCircle size={16} className="text-emerald-500" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              {s.icon}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-[28px] font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
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
          {upcoming.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13px] text-gray-400">No upcoming appointments.</div>
          ) : (
            upcoming.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors group">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full ${appt.color} flex items-center justify-center text-white text-[12px] font-semibold shrink-0`}>
                  {appt.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">{appt.doctor}</p>
                  <p className="text-[11px] text-gray-400">{appt.specialty}</p>
                </div>

                {/* Date */}
                <div className="text-center shrink-0 hidden sm:block">
                  <p className="text-[12px] font-semibold text-gray-700">{appt.date}</p>
                  <p className="text-[11px] text-gray-400">{appt.time}</p>
                </div>

                {/* Type + location */}
                <div className="hidden lg:block shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                    {typeIcon[appt.type]}
                    <span>{appt.type}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MdLocationOn size={11} />
                    <span className="truncate max-w-[130px]">{appt.location}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle[appt.status]}`}>
                  {appt.status}
                </span>

                {/* Actions */}
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
                    title="Cancel"
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

      {/* Visit history */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-gray-800">Visit History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {past.map((appt) => (
            <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/40 transition-colors">
              <div className={`w-9 h-9 rounded-full ${appt.color} flex items-center justify-center text-white text-[11px] font-semibold shrink-0 opacity-70`}>
                {appt.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-600">{appt.doctor}</p>
                <p className="text-[11px] text-gray-400">{appt.specialty}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                {typeIcon[appt.type]}
                <span>{appt.type}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-gray-500">{appt.date} · {appt.time}</p>
                <p className="text-[11px] text-gray-400 italic mt-0.5">{appt.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
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
                  {(["In-person", "Video call", "Phone"] as AppointmentType[]).map((t) => (
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
                disabled={!form.doctor || !form.date || !form.time}
                className="flex-1 py-2.5 bg-[#185FA5] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0f4a85] disabled:opacity-50 transition-colors"
              >
                {editId ? "Save Changes" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <MdDelete size={22} className="text-red-500" />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-800 mb-2">Cancel appointment?</h3>
            <p className="text-[12px] text-gray-400 mb-6">This will remove the appointment from your schedule. This action cannot be undone.</p>
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