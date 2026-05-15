"use client";

import { useState } from "react";
import {
  MdLightbulbOutline,
  MdRemoveRedEye,
  MdLocalDrink,
  MdBedtime,
  MdSunny,
  MdFitnessCenter,
  MdCheckCircle,
  MdArrowForward,
} from "react-icons/md";
import Link from "next/link";

const categories = [
  "All",
  "Lifestyle",
  "Nutrition",
  "Screen",
  "Exercise",
] as const;
type Category = (typeof categories)[number];

const recommendations = [
  {
    id: 1,
    title: "Follow the 20-20-20 rule",
    desc: "Every 20 minutes of screen time, look at something 20 feet away for at least 20 seconds. This relaxes your ciliary muscles and reduces digital eye strain significantly.",
    category: "Screen",
    priority: "High",
    icon: <MdRemoveRedEye size={20} className="text-[#185FA5]" />,
    bg: "bg-[#185FA5]/10",
    linked: "/dashboard/exercises",
    linkedLabel: "Try focus exercises",
  },
  {
    id: 2,
    title: "Stay well hydrated",
    desc: "Drink at least 8 glasses of water daily. Dehydration reduces tear production and can worsen dry eye symptoms, especially in air-conditioned environments.",
    category: "Nutrition",
    priority: "Medium",
    icon: <MdLocalDrink size={20} className="text-sky-500" />,
    bg: "bg-sky-50",
    linked: null,
    linkedLabel: null,
  },
  {
    id: 3,
    title: "Sleep 7–9 hours nightly",
    desc: "Your eyes repair and refresh during sleep. Chronic sleep deprivation leads to eye fatigue, redness, and blurred vision. Maintain a consistent sleep schedule.",
    category: "Lifestyle",
    priority: "High",
    icon: <MdBedtime size={20} className="text-violet-500" />,
    bg: "bg-violet-50",
    linked: null,
    linkedLabel: null,
  },
  {
    id: 4,
    title: "Wear UV-protective sunglasses",
    desc: "UV exposure is a leading cause of cataracts and macular degeneration. Wear sunglasses that block 99–100% of UVA and UVB rays whenever you're outdoors.",
    category: "Lifestyle",
    priority: "High",
    icon: <MdSunny size={20} className="text-amber-500" />,
    bg: "bg-amber-50",
    linked: null,
    linkedLabel: null,
  },
  {
    id: 5,
    title: "Increase omega-3 intake",
    desc: "Omega-3 fatty acids — found in salmon, sardines, flaxseed, and walnuts — support tear film stability and help prevent dry eye syndrome.",
    category: "Nutrition",
    priority: "Medium",
    icon: <MdLightbulbOutline size={20} className="text-emerald-500" />,
    bg: "bg-emerald-50",
    linked: null,
    linkedLabel: null,
  },
  {
    id: 6,
    title: "Do daily eye exercises",
    desc: "Structured eye exercises improve focusing ability, reduce tension headaches, and strengthen extraocular muscles. Even 5 minutes per day makes a measurable difference.",
    category: "Exercise",
    priority: "Medium",
    icon: <MdFitnessCenter size={20} className="text-rose-500" />,
    bg: "bg-rose-50",
    linked: "/dashboard/exercises",
    linkedLabel: "Open exercises",
  },
  {
    id: 7,
    title: "Reduce screen brightness after sunset",
    desc: "Blue light from screens suppresses melatonin and disrupts your circadian rhythm, indirectly affecting eye repair cycles. Use Night Mode or f.lux after 7PM.",
    category: "Screen",
    priority: "Medium",
    icon: <MdRemoveRedEye size={20} className="text-indigo-500" />,
    bg: "bg-indigo-50",
    linked: null,
    linkedLabel: null,
  },
  {
    id: 8,
    title: "Eat leafy greens and colourful vegetables",
    desc: "Lutein and zeaxanthin — found in kale, spinach, and sweet peppers — protect the macula from oxidative damage and lower the risk of age-related macular degeneration.",
    category: "Nutrition",
    priority: "Low",
    icon: <MdLightbulbOutline size={20} className="text-green-500" />,
    bg: "bg-green-50",
    linked: null,
    linkedLabel: null,
  },
];

const priorityStyle: Record<string, string> = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RecommendationsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [done, setDone] = useState<number[]>([]);

  const filtered =
    activeCategory === "All"
      ? recommendations
      : recommendations.filter((r) => r.category === activeCategory);

  function toggleDone(id: number) {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress banner */}
      <div className="bg-[#0B1120] rounded-3xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">
            Your progress today
          </p>
          <p className="text-[22px] font-bold text-white">
            {done.length}
            <span className="text-[14px] font-normal text-white/40">
              {" "}
              / {recommendations.length} recommendations followed
            </span>
          </p>
          <div className="mt-3 h-1.5 bg-white/10 rounded-full w-64 max-w-full overflow-hidden">
            <div
              className="h-full bg-[#378ADD] rounded-full transition-all duration-500"
              style={{
                width: `${(done.length / recommendations.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#185FA5]/20 flex items-center justify-center shrink-0">
          <MdCheckCircle size={26} className="text-[#85B7EB]" />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
              activeCategory === c
                ? "bg-[#185FA5] text-white"
                : "bg-white border border-slate-200 text-gray-500 hover:border-[#185FA5]/30 hover:text-gray-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((rec) => {
          const isDone = done.includes(rec.id);
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-3xl border shadow-sm p-6 transition-all ${
                isDone ? "border-emerald-200 opacity-70" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rec.bg}`}
                  >
                    {rec.icon}
                  </div>
                  <div>
                    <p
                      className={`text-[13px] font-semibold ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {rec.title}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${priorityStyle[rec.priority]}`}
                    >
                      {rec.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleDone(rec.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 hover:border-[#185FA5]"
                  }`}
                >
                  {isDone && <MdCheckCircle size={14} className="text-white" />}
                </button>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
                {rec.desc}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {rec.category}
                </span>
                {rec.linked && (
                  <Link
                    href={rec.linked}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#185FA5] hover:text-[#0f4a85] transition-colors"
                  >
                    {rec.linkedLabel} <MdArrowForward size={13} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
