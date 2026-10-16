/** Cool accent set for the marketing pages. Class names are literal so Tailwind keeps them. */
export type TAccent = "teal" | "blue" | "indigo" | "violet" | "emerald" | "cyan" | "rose" | "sky" | "slate";

export const ACCENT: Record<TAccent, { tint: string; soft: string; solid: string; text: string; dot: string; rule: string; hover: string; glow: string }> = {
  teal: { tint: "bg-teal-50", soft: "from-teal-50 to-white", solid: "bg-teal-600", text: "text-teal-700", dot: "bg-teal-500", rule: "before:bg-teal-500", hover: "group-hover:bg-teal-600", glow: "hover:shadow-teal-200/70" },
  blue: { tint: "bg-blue-50", soft: "from-blue-50 to-white", solid: "bg-blue-600", text: "text-blue-700", dot: "bg-blue-500", rule: "before:bg-blue-500", hover: "group-hover:bg-blue-600", glow: "hover:shadow-blue-200/70" },
  indigo: { tint: "bg-indigo-50", soft: "from-indigo-50 to-white", solid: "bg-indigo-600", text: "text-indigo-700", dot: "bg-indigo-500", rule: "before:bg-indigo-500", hover: "group-hover:bg-indigo-600", glow: "hover:shadow-indigo-200/70" },
  violet: { tint: "bg-violet-50", soft: "from-violet-50 to-white", solid: "bg-violet-600", text: "text-violet-700", dot: "bg-violet-500", rule: "before:bg-violet-500", hover: "group-hover:bg-violet-600", glow: "hover:shadow-violet-200/70" },
  emerald: { tint: "bg-emerald-50", soft: "from-emerald-50 to-white", solid: "bg-emerald-600", text: "text-emerald-700", dot: "bg-emerald-500", rule: "before:bg-emerald-500", hover: "group-hover:bg-emerald-600", glow: "hover:shadow-emerald-200/70" },
  cyan: { tint: "bg-cyan-50", soft: "from-cyan-50 to-white", solid: "bg-cyan-600", text: "text-cyan-700", dot: "bg-cyan-500", rule: "before:bg-cyan-500", hover: "group-hover:bg-cyan-600", glow: "hover:shadow-cyan-200/70" },
  rose: { tint: "bg-rose-50", soft: "from-rose-50 to-white", solid: "bg-rose-600", text: "text-rose-700", dot: "bg-rose-500", rule: "before:bg-rose-500", hover: "group-hover:bg-rose-600", glow: "hover:shadow-rose-200/70" },
  sky: { tint: "bg-sky-50", soft: "from-sky-50 to-white", solid: "bg-sky-600", text: "text-sky-700", dot: "bg-sky-500", rule: "before:bg-sky-500", hover: "group-hover:bg-sky-600", glow: "hover:shadow-sky-200/70" },
  slate: { tint: "bg-slate-100", soft: "from-slate-100 to-white", solid: "bg-slate-700", text: "text-slate-700", dot: "bg-slate-500", rule: "before:bg-slate-500", hover: "group-hover:bg-slate-700", glow: "hover:shadow-slate-200/70" },
};
