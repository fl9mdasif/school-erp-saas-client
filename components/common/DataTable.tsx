"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/Skeletons";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import type { TMeta } from "@/types";

export type TColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hide this column in the phone card layout. */
  hideOnCard?: boolean;
};

type Props<T> = {
  columns: TColumn<T>[];
  rows?: T[];
  meta?: TMeta;
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  /** Empty state copy. The primary action goes in emptyAction. */
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Row actions menu or buttons, rendered last. */
  rowActions?: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Server paginated table. Desktop shows a real table with a sticky header; phones show one card per
 * row. Never loads more than the page the server returned (max 100 rows).
 */
export function DataTable<T>({
  columns,
  rows,
  meta,
  rowKey,
  loading,
  error,
  onRetry,
  onPageChange,
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyAction,
  rowActions,
  className,
}: Props<T>) {
  const { t } = useT();

  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (loading || !rows) return <TableSkeleton rows={6} columns={Math.min(columns.length, 5)} />;
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const pages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
  const from = meta ? (meta.page - 1) * meta.limit + 1 : 1;
  const to = meta ? Math.min(meta.total, meta.page * meta.limit) : rows.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* desktop and tablet */}
      <Card className="hidden overflow-hidden md:block">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
              {rowActions ? <TableHead className="text-right">{t("common.actions")}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(row)}
                  </TableCell>
                ))}
                {rowActions ? (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {rowActions(row)}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* phone */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            <Card
              className={cn("space-y-2 p-3", onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns
                .filter((c) => !c.hideOnCard)
                .map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                    <span className="shrink-0 text-muted-foreground">{c.header}</span>
                    <span className="tabular min-w-0 text-right">{c.cell(row)}</span>
                  </div>
                ))}
              {rowActions ? (
                <div className="flex justify-end pt-1" onClick={(e) => e.stopPropagation()}>
                  {rowActions(row)}
                </div>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>

      {meta && onPageChange ? (
        <nav aria-label="Pagination" className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="tabular text-sm text-muted-foreground">
            {t("common.showing", { from, to, total: meta.total })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
            >
              <ChevronLeft aria-hidden="true" />
              {t("common.previous")}
            </Button>
            <span className="tabular text-sm">{t("common.page", { page: meta.page, pages })}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= pages}
              onClick={() => onPageChange(meta.page + 1)}
            >
              {t("common.next")}
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
