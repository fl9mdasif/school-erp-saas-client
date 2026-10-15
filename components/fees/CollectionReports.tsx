"use client";

import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/common/DatePicker";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadFile } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney, todayLocal } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetCollectionReportQuery } from "@/redux/api/feeReportApi";
import { useAppSelector } from "@/redux/hooks";
import type { TCollectionGroupBy } from "@/types";

const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return todayLocal(d);
};

const GROUPS: TCollectionGroupBy[] = ["day", "method", "class", "feeHead"];
const DEFAULTS = { from: monthAgo(), to: todayLocal(), groupBy: "day" };

export function CollectionReports() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);
  const from = url.get("from");
  const to = url.get("to");
  const groupBy = url.get("groupBy") as TCollectionGroupBy;

  const { data, isLoading, error, refetch } = useGetCollectionReportQuery({ from, to, groupBy });

  const exportCsv = async () => {
    try {
      await downloadFile("/fees/reports/collection", "collection.csv", { from, to, groupBy, format: "csv" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const rows = (data?.rows ?? []).map((r) => ({ ...r, display: r.label ?? r.key }));

  return (
    <>
      <PageHeader
        title={t("fee.coll.title")}
        description={t("fee.coll.desc")}
        action={
          <Button variant="outline" onClick={exportCsv}>
            <Download aria-hidden="true" />
            {t("stu.export")}
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 md:max-w-2xl">
        <DatePicker aria-label={t("fee.pay.from")} value={from} onChange={(v) => url.set({ from: v })} />
        <DatePicker aria-label={t("fee.pay.to")} value={to} onChange={(v) => url.set({ to: v })} />
        <Select aria-label={t("fee.coll.groupBy")} value={groupBy} onChange={(e) => url.set({ groupBy: e.target.value })}>
          {GROUPS.map((g) => (
            <option key={g} value={g}>{t(`fee.coll.groupBy.${g}`)}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full max-w-3xl" />
      ) : rows.length === 0 ? (
        <EmptyState title={t("fee.coll.empty")} />
      ) : (
        <>
          <p className="tabular mb-3 text-lg font-bold text-navy">{t("fee.coll.total")}: {formatMoney(data?.total ?? 0, fmt)}</p>
          <div className="h-72 w-full max-w-3xl" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="display" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} formatter={(v) => formatMoney(Number(v), fmt)} />
                <Bar dataKey="collected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>{t("fee.coll.title")}</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{r.display}</th>
                  <td>{formatMoney(r.collected, fmt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
