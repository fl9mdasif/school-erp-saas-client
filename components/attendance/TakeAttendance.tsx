"use client";

import { Loader2, WifiOff } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/common/DatePicker";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getApiCode, getApiErrorMessage, isApiError } from "@/lib/errors";
import { dayOfWeek, formatNumber, todayLocal } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { useEditSheetMutation, useGetSheetQuery, useGetTakeableSectionsQuery, useSubmitSheetMutation } from "@/redux/api/attendanceApi";
import { useAppSelector } from "@/redux/hooks";
import type { TAttendanceStatus, TSheet } from "@/types";

const STATUSES: TAttendanceStatus[] = ["present", "absent", "late", "leave"];
const TONE: Record<TAttendanceStatus, string> = {
  present: "data-[on=true]:bg-success data-[on=true]:text-success-foreground",
  absent: "data-[on=true]:bg-destructive data-[on=true]:text-destructive-foreground",
  late: "data-[on=true]:bg-warning-deep data-[on=true]:text-white",
  leave: "data-[on=true]:bg-highlight data-[on=true]:text-white",
};
const DEFAULT_WINDOW_HOURS = 24;

const draftKey = (sectionId: string, date: string) => `asm.attendance.draft.${sectionId}.${date}`;
const readDraft = (key: string): Record<string, TAttendanceStatus> | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, TAttendanceStatus>) : null;
  } catch {
    return null;
  }
};
const writeDraft = (key: string, value: Record<string, TAttendanceStatus> | null) => {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    /* private mode: the draft just is not kept */
  }
};

export function TakeAttendance() {
  const { t, term } = useT();
  const sections = useGetTakeableSectionsQuery();
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayLocal());
  const active = sectionId || sections.data?.[0]?.sectionId || "";
  const sheet = useGetSheetQuery({ sectionId: active, date }, { skip: !active || !date });

  return (
    <>
      <PageHeader title={t("att.take.title")} description={t("att.take.desc")} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <FormField label={`${term("class")} / ${term("section")}`}>
          {(c) => (
            <Select {...c} value={active} onChange={(e) => setSectionId(e.target.value)}>
              {(sections.data ?? []).map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.className}
                  {s.name ? ` · ${s.name}` : ""} {s.takenToday ? "✓" : ""}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("att.take.date")}>
          {(c) => <DatePicker {...c} max={todayLocal()} value={date} onChange={(d) => d && setDate(d)} />}
        </FormField>
      </div>

      {sections.error ? (
        <ErrorState error={sections.error} onRetry={sections.refetch} />
      ) : sections.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !sections.data?.length ? (
        <EmptyState title={t("att.take.noSections", { section: term("section") })} description={t("att.take.noSectionsDesc")} />
      ) : sheet.error ? (
        <ErrorState error={sheet.error} onRetry={sheet.refetch} />
      ) : sheet.isFetching || !sheet.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <SheetEditor key={`${active}|${date}|${sheet.data.sheetId ?? "new"}|${sheet.data.takenAt ?? ""}`} sheet={sheet.data} />
      )}
    </>
  );
}

function SheetEditor({ sheet }: { sheet: TSheet }) {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const role = useAppSelector((s) => s.auth.user?.role);
  const weekendDays = useAppSelector((s) => s.auth.tenant?.settings.weekendDays) ?? [5];
  const [submit, submitting] = useSubmitSheetMutation();
  const [edit, editing] = useEditSheetMutation();
  const key = draftKey(sheet.sectionId, sheet.date);

  const base = useMemo(() => Object.fromEntries(sheet.records.map((r) => [r.studentId, r.status])) as Record<string, TAttendanceStatus>, [sheet]);
  const [statuses, setStatuses] = useState<Record<string, TAttendanceStatus>>(() => {
    // A draft only applies to a sheet that was never submitted, and only for the same students
    const draft = sheet.exists ? null : readDraft(key);
    if (draft && Object.keys(draft).every((id) => id in base)) return { ...base, ...draft };
    return base;
  });
  const [restored] = useState(() => !sheet.exists && readDraft(key) !== null);
  const [allowWeekend, setAllowWeekend] = useState(false);
  const [failed, setFailed] = useState(false);

  const weekend = weekendDays.includes(dayOfWeek(sheet.date));
  const windowHours = DEFAULT_WINDOW_HOURS;
  // eslint-disable-next-line -- the edit window must compare against the real current time
  const closed = sheet.exists && role !== "admin" && !!sheet.takenAt && Date.now() - new Date(sheet.takenAt).getTime() > windowHours * 3_600_000;

  const counts = STATUSES.reduce((o, s) => ({ ...o, [s]: sheet.records.filter((r) => statuses[r.studentId] === s).length }), {} as Record<TAttendanceStatus, number>);

  const set = (id: string, status: TAttendanceStatus) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    if (!sheet.exists) writeDraft(key, next);
  };
  const markAll = () => {
    setStatuses(base && Object.fromEntries(sheet.records.map((r) => [r.studentId, "present" as const])));
    if (!sheet.exists) writeDraft(key, null);
  };

  const save = async () => {
    setFailed(false);
    try {
      if (sheet.exists && sheet.sheetId) {
        await edit({ id: sheet.sheetId, records: sheet.records.map((r) => ({ studentId: r.studentId, status: statuses[r.studentId] })) }).unwrap();
        toast.success(t("att.take.updated"));
      } else {
        const res = await submit({
          sectionId: sheet.sectionId,
          date: sheet.date,
          records: sheet.records.filter((r) => statuses[r.studentId] !== "present").map((r) => ({ studentId: r.studentId, status: statuses[r.studentId] })),
          allowWeekend: weekend ? allowWeekend : undefined,
        }).unwrap();
        writeDraft(key, null);
        toast.success(res.existing ? t("att.take.alreadyTaken") : t("att.take.saved"));
      }
    } catch (err) {
      // No connection or a server hiccup: keep everything on screen and offer a retry
      setFailed(!isApiError(err) || err.status === 0 || err.status >= 500);
      toast.error(getApiErrorMessage(err, t));
      if (getApiCode(err) === "WEEKEND_DATE") setAllowWeekend(false);
    }
  };

  if (sheet.records.length === 0) {
    return <EmptyState title={t("att.take.noStudents", { student: term("student") })} />;
  }

  const busy = submitting.isLoading || editing.isLoading;
  const needsWeekendOk = weekend && !sheet.exists && !allowWeekend;

  return (
    <div className="pb-24">
      {sheet.exists ? (
        <p className="mb-3 rounded-lg border border-info bg-info-tint p-3 text-sm text-info-deep">
          {closed ? t("att.take.closed", { hours: formatNumber(windowHours, fmt) }) : t("att.take.editing")}
        </p>
      ) : null}
      {restored ? <p className="mb-3 rounded-lg border border-border bg-muted p-3 text-sm">{t("att.take.draftRestored")}</p> : null}
      {weekend && !sheet.exists ? (
        <label className="mb-3 flex min-h-11 items-center gap-3 rounded-lg border border-warning bg-warning-tint p-3 text-sm text-warning-deep">
          <input type="checkbox" className="size-5 accent-primary" checked={allowWeekend} onChange={(e) => setAllowWeekend(e.target.checked)} />
          {t("att.take.weekend")}
        </label>
      ) : null}

      <Card className="divide-y divide-border p-0">
        {sheet.records.map((r) => (
          <div key={r.studentId} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">
                <span className="tabular mr-2 text-muted-foreground">{formatNumber(r.roll, fmt)}</span>
                {r.name}
              </p>
              <p className="tabular text-xs text-muted-foreground">{r.studentCode}</p>
            </div>
            <div role="radiogroup" aria-label={r.name} className="grid grid-cols-4 gap-1 sm:w-80">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={statuses[r.studentId] === s}
                  data-on={statuses[r.studentId] === s}
                  disabled={closed}
                  onClick={() => set(r.studentId, s)}
                  className={cn(
                    "min-h-11 rounded-md border border-border bg-card px-1 text-xs font-semibold text-muted-foreground transition-colors disabled:opacity-60",
                    "data-[on=true]:border-transparent",
                    TONE[s]
                  )}
                >
                  {t(`att.status.${s}`)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <div className="fixed inset-x-0 bottom-14 z-20 border-t border-border bg-card px-3 py-2 md:sticky md:bottom-0 md:mt-4 md:rounded-lg md:border md:px-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <p className="tabular flex flex-wrap gap-x-4 text-sm" aria-live="polite">
            {STATUSES.map((s) => (
              <span key={s}>
                {t(`att.status.${s}`)}: <b>{formatNumber(counts[s], fmt)}</b>
              </span>
            ))}
          </p>
          <div className="flex gap-2">
            {closed ? null : (
              <Button variant="outline" onClick={markAll} disabled={busy}>
                {t("att.take.allPresent")}
              </Button>
            )}
            <Button onClick={save} disabled={busy || closed || needsWeekendOk}>
              {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : failed ? <WifiOff aria-hidden="true" /> : null}
              {failed ? t("att.take.retry") : sheet.exists ? t("att.take.update") : t("att.take.submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
