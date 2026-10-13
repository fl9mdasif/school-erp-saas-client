"use client";

import { Select } from "@/components/ui/select";
import { useT } from "@/lib/i18n/useT";
import { useGetSessionsQuery } from "@/redux/api/academicApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedSession } from "@/redux/slices/uiSlice";

const STAFF = ["admin", "teacher", "accountant"];

/** Lets staff look at another session's data. Empty means the current session. */
export function SessionSwitcher() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const selected = useAppSelector((s) => s.ui.selectedSessionId);
  const { data } = useGetSessionsQuery(undefined, { skip: !role || !STAFF.includes(role) });

  if (!data?.rows.length) return null;

  return (
    <Select
      aria-label={t("ac.switcher.label")}
      value={selected}
      onChange={(e) => dispatch(setSelectedSession(e.target.value))}
      className="hidden w-40 md:block"
    >
      <option value="">{t("ac.switcher.current")}</option>
      {data.rows.map((s) => (
        <option key={s._id} value={s._id}>
          {s.name}
          {s.isCurrent ? " ✓" : ""}
        </option>
      ))}
    </Select>
  );
}
