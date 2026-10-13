"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";

type Point = { weekStart: string; count: number };

/** Signups per week. Loaded lazily; a visually hidden table gives screen readers the same numbers. */
export default function SignupsChart({ data }: { data: Point[] }) {
  const { t, lang } = useT();
  const rows = data.map((d) => ({ label: formatLocalDate(isoToLocalDate(d.weekStart), { lang }).slice(0, 6), count: d.count, full: formatLocalDate(isoToLocalDate(d.weekStart), { lang }) }));

  return (
    <>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
            <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{t("pf.signups.title")}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.full}>
              <th scope="row">{r.full}</th>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
