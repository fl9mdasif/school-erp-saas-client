"use client";

import { Check, GraduationCap, Wallet, Users, CalendarCheck } from "lucide-react";
import { useT } from "@/lib/i18n/useT";

// Static, illustrative screens drawn with our own components (no screenshots to maintain).
// The numbers are sample data and are never shown as real statistics.

export function DashboardMock() {
  const { t } = useT();
  const stats = [
    { icon: GraduationCap, label: t("mk.mock.students"), value: "482" },
    { icon: CalendarCheck, label: t("mk.mock.todayAttendance"), value: "94%" },
    { icon: Wallet, label: t("mk.mock.collection"), value: "৳ 3,42,500" },
    { icon: Users, label: t("mk.mock.dues"), value: "৳ 1,18,000" },
  ];
  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-background text-foreground">
      <div className="hidden w-40 shrink-0 bg-sidebar p-3 sm:block" aria-hidden="true">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-white">অ</span>
          <span className="h-3 w-14 rounded bg-white/30" />
        </div>
        {[true, false, false, false, false, false].map((active, i) => (
          <div key={i} className={`mb-2 h-7 rounded-md ${active ? "bg-sidebar-primary" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-3 p-3 md:p-5">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-2 md:p-3">
              <Icon className="mb-1 size-4 text-primary" aria-hidden="true" />
              <p className="truncate text-[10px] text-muted-foreground md:text-xs">{label}</p>
              <p className="tabular text-sm font-semibold text-navy md:text-lg">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-2 md:p-3">
          <div className="mb-2 flex gap-2 text-[10px] font-semibold md:text-xs">
            <span className="rounded-full bg-success-tint px-2 py-0.5 text-success-deep">{t("mk.mock.present")} 38</span>
            <span className="rounded-full bg-destructive-tint px-2 py-0.5 text-destructive-deep">{t("mk.mock.absent")} 2</span>
            <span className="rounded-full bg-warning-tint px-2 py-0.5 text-warning-deep">{t("mk.mock.late")} 1</span>
          </div>
          {["Rahim Uddin", "Nusrat Jahan", "Tanvir Hasan", "Sadia Akter"].map((n, i) => (
            <div key={n} className="flex items-center justify-between border-t border-border py-1.5 text-[11px] md:py-2 md:text-sm">
              <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 px-3">{n}</span>
              <span className={`rounded-full px-2 text-[10px] font-semibold md:text-xs ${i === 2 ? "bg-destructive-tint text-destructive-deep" : "bg-success-tint text-success-deep"}`}>
                {i === 2 ? t("mk.mock.absent") : t("mk.mock.present")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResultMock() {
  const { t } = useT();
  const rows: [string, string, string][] = [
    ["Bangla", "82", "A+"],
    ["English", "76", "A"],
    ["Math", "91", "A+"],
    ["Science", "68", "A-"],
  ];
  return (
    <div className="flex h-full flex-col bg-background px-3 pb-3 pt-9 text-foreground">
      <p className="text-center text-[10px] text-muted-foreground">Bright Model School</p>
      <p className="mb-2 text-center text-xs font-semibold text-navy">{t("mk.mock.resultTitle")}</p>
      <div className="rounded-lg border border-border bg-card p-2">
        <p className="text-xs font-semibold text-navy">Rahim Uddin</p>
        <p className="text-[10px] text-muted-foreground">Class 8 · Roll 12</p>
      </div>
      <div className="mt-2 flex-1 rounded-lg border border-border bg-card">
        {rows.map(([s, m, g]) => (
          <div key={s} className="flex items-center justify-between border-b border-border px-2 py-1.5 text-[11px] last:border-0">
            <span>{s}</span>
            <span className="tabular flex gap-3">
              <span>{m}</span>
              <span className="w-6 text-right font-semibold text-primary">{g}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-md bg-primary-tint p-1.5">
          <p className="text-[9px] text-primary-deep">{t("mk.mock.gpa")}</p>
          <p className="tabular text-sm font-bold text-primary-deep">4.75</p>
        </div>
        <div className="rounded-md bg-primary-tint p-1.5">
          <p className="text-[9px] text-primary-deep">{t("mk.mock.position")}</p>
          <p className="tabular text-sm font-bold text-primary-deep">3</p>
        </div>
        <div className="rounded-md bg-success-tint p-1.5">
          <p className="text-[9px] text-success-deep">
            <Check className="mx-auto size-3" aria-hidden="true" />
          </p>
          <p className="text-[11px] font-bold text-success-deep">{t("mk.mock.passed")}</p>
        </div>
      </div>
    </div>
  );
}
