"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { DatePicker } from "@/components/common/DatePicker";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { TableSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetAuditLogsQuery } from "@/redux/api/auditApi";

const DEFAULTS = { page: "1", action: "", entityType: "", from: "", to: "" };

export function AuditLogTable() {
  const { t, lang, banglaDigits } = useT();
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const params = {
    page: Number(url.get("page")),
    limit: 25,
    action: url.get("action") || undefined,
    entityType: url.get("entityType") || undefined,
    from: url.get("from") || undefined,
    to: url.get("to") || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetAuditLogsQuery(params);

  return (
    <>
      <PageHeader title={t("audit.title")} description={t("audit.desc")} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 md:max-w-3xl md:grid-cols-4">
        <SearchInput value={url.get("action")} onChange={(v) => url.set({ action: v })} placeholder={t("audit.action")} />
        <Input placeholder={t("audit.entityType")} value={url.get("entityType")} onChange={(e) => url.set({ entityType: e.target.value })} />
        <DatePicker aria-label={t("fee.pay.from")} value={url.get("from")} onChange={(v) => url.set({ from: v })} />
        <DatePicker aria-label={t("fee.pay.to")} value={url.get("to")} onChange={(v) => url.set({ to: v })} />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading || (isFetching && !data) ? (
        <TableSkeleton />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState title={t("audit.empty")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="w-8 px-2 py-2" />
                <th className="px-2 py-2">{t("audit.when")}</th>
                <th className="px-2 py-2">{t("audit.action")}</th>
                <th className="px-2 py-2">{t("audit.entityType")}</th>
                <th className="px-2 py-2">{t("audit.actor")}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <Fragment key={row._id}>
                  <tr className="border-b border-border/60">
                    <td className="px-2 py-1">
                      {row.before || row.after || row.reason ? (
                        <Button variant="ghost" size="icon" onClick={() => setExpanded(expanded === row._id ? null : row._id)} aria-label={t("audit.expand")}>
                          {expanded === row._id ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                        </Button>
                      ) : null}
                    </td>
                    <td className="tabular px-2 py-1">{formatLocalDate(isoToLocalDate(row.createdAt), fmt)}</td>
                    <td className="px-2 py-1 font-medium">{row.action}</td>
                    <td className="px-2 py-1">{row.entityType}</td>
                    <td className="px-2 py-1 text-muted-foreground">{row.actorRole}</td>
                  </tr>
                  {expanded === row._id ? (
                    <tr className="border-b border-border/60 bg-muted/20">
                      <td />
                      <td colSpan={4} className="px-2 py-3">
                        {row.reason ? <p className="mb-2 text-sm"><span className="font-medium">{t("audit.reason")}:</span> {row.reason}</p> : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-semibold text-muted-foreground">{t("audit.before")}</p>
                            <pre className="overflow-x-auto rounded-md bg-background p-2 text-xs">{JSON.stringify(row.before ?? {}, null, 2)}</pre>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-muted-foreground">{t("audit.after")}</p>
                            <pre className="overflow-x-auto rounded-md bg-background p-2 text-xs">{JSON.stringify(row.after ?? {}, null, 2)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
