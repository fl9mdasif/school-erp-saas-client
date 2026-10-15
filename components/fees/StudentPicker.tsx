"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import type { TStudent } from "@/types";

type Props = {
  selected: TStudent | null;
  onSelect: (student: TStudent | null) => void;
};

/** Search-and-pick by name, student ID or roll. Shared by Adjustments and Collect fee. */
export function StudentPicker({ selected, onSelect }: Props) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const search = useGetStudentsQuery({ q, limit: 8 }, { skip: q.trim().length < 2 });

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy">{selected.name}</p>
          <p className="tabular text-xs text-muted-foreground">{selected.studentId}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => onSelect(null)} aria-label={t("common.clear")}>
          <X aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <SearchInput value={q} onChange={setQ} placeholder={t("fee.pick.search")} />
      {q.trim().length >= 2 ? (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {search.isLoading ? (
            <p className="p-3 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : (search.data?.rows.length ?? 0) === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">{t("fee.pick.noMatch")}</p>
          ) : (
            search.data?.rows.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => onSelect(s)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-navy">{s.name}</span>
                  <span className="tabular block text-xs text-muted-foreground">{s.studentId}</span>
                </span>
                <Check className="size-4 shrink-0 opacity-0" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
