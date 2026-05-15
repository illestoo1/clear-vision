"use client";

import { useState, useEffect, useRef } from "react";
import {
  MdPlayArrow,
  MdPause,
  MdRefresh,
  MdCheckCircle,
  MdFitnessCenter,
  MdTimer,
} from "react-icons/md";

const exercises = [
  {
    id: 1,
    name: "Focus Shifting",
    duration: 60,
    reps: "10 reps",
    description:
      "Hold your finger 10 inches from your face. Focus on it for 3 seconds, then shift focus to an object in the distance. Repeat.",
    benefit: "Strengthens focusing muscles",
    color: "text-[#185FA5]",
    bg: "bg-[#185FA5]/10",
  },
  {
    id: 2,
    name: "Figure-8 Tracking",
    duration: 45,
    reps: "5 reps each side",
    description:
      "Imagine a large figure-8 about 10 feet away. Slowly trace it with your eyes — clockwise, then counter-clockwise.",
    benefit: "Improves eye muscle flexibility",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: 3,
    name: "Palming",
    duration: 120,
    reps: "2 min",
    description:
      "Rub your palms together to generate warmth. Cup them gently over closed eyes without pressing. Breathe deeply and relax.",
    benefit: "Relieves eye strain & fatigue",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: 4,
    name: "Eye Rolling",
    duration: 30,
    reps: "5 reps each direction",
    description:
      "Slowly roll your eyes clockwise in a full circle. Pause. Repeat counter-clockwise. Keep movement smooth and controlled.",
    benefit: "Loosens extraocular muscles",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: 5,
    name: "Near & Far Focus",
    duration: 60,
    reps: "10 reps",
    description:
      "Place a thumb 6 inches from your face. Focus on it, then focus on something 20 feet away. Alternate every 3 seconds.",
    benefit: "Prevents accommodation spasm",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function ExercisesPage() {
  const [active, setActive] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startExercise(ex: (typeof exercises)[0]) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(ex.id);
    setTimeLeft(ex.duration);
    setRunning(true);
  }

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone((d) =>
              active !== null && !d.includes(active) ? [...d, active] : d,
            );
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, active]);

  function togglePause() {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      setRunning(true);
    }
  }

  const activeEx = exercises.find((e) => e.id === active);
  const pct = activeEx
    ? ((activeEx.duration - timeLeft) / activeEx.duration) * 100
    : 0;
  const totalTimeDone = done.reduce(
    (a, id) => a + (exercises.find((e) => e.id === id)?.duration ?? 0),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Active exercise timer */}
      {active && (
        <div className="bg-[#0B1120] text-white rounded-3xl p-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="relative shrink-0 w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#378ADD"
                strokeWidth="8"
                strokeDasharray={`${pct * 2.638} 263.8`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{timeLeft}s</span>
              <span className="text-[10px] text-white/40">remaining</span>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <p className="text-[11px] text-[#85B7EB] uppercase tracking-widest mb-1">
              Now Active
            </p>
            <h3 className="text-[20px] font-semibold mb-2">{activeEx?.name}</h3>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-md">
              {activeEx?.description}
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={togglePause}
              className="w-12 h-12 rounded-full bg-[#185FA5] hover:bg-[#0f4a85] flex items-center justify-center transition-colors"
            >
              {running ? <MdPause size={22} /> : <MdPlayArrow size={22} />}
            </button>
            <button
              onClick={() => {
                setActive(null);
                setRunning(false);
                clearInterval(intervalRef.current!);
              }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <MdRefresh size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Completed today",
            value: `${done.length}/${exercises.length}`,
            icon: <MdCheckCircle size={16} className="text-emerald-500" />,
          },
          {
            label: "Time spent",
            value: `${totalTimeDone}s`,
            icon: <MdTimer size={16} className="text-[#185FA5]" />,
          },
          {
            label: "Streak",
            value: "4 days",
            icon: <MdFitnessCenter size={16} className="text-amber-500" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {s.icon}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
            <p className="text-[20px] font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Exercise cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {exercises.map((ex) => {
          const isDone = done.includes(ex.id);
          const isActive = active === ex.id;
          return (
            <div
              key={ex.id}
              className={`bg-white rounded-3xl border shadow-sm p-6 transition-all ${
                isActive
                  ? "border-[#185FA5]/40 ring-2 ring-[#185FA5]/10"
                  : isDone
                    ? "border-emerald-200"
                    : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${ex.bg}`}
                  >
                    <MdFitnessCenter size={20} className={ex.color} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {ex.reps} · {ex.duration}s
                    </p>
                  </div>
                </div>
                {isDone && (
                  <MdCheckCircle
                    size={20}
                    className="text-emerald-500 shrink-0"
                  />
                )}
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
                {ex.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {ex.benefit}
                </span>
                <button
                  onClick={() => startExercise(ex)}
                  className={`flex items-center gap-1.5 text-[12px] font-semibold px-4 py-1.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#185FA5] text-white"
                      : "bg-[#185FA5]/10 text-[#185FA5] hover:bg-[#185FA5]/20"
                  }`}
                >
                  <MdPlayArrow size={14} />
                  {isActive ? "Running…" : isDone ? "Repeat" : "Start"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
