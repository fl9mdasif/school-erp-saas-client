"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/errors";
import { formatLocalDate, formatMoney, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetInvoiceQuery, useVoidInvoiceMutation } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TInvoice } from "@/types";

const TONE: Record<TInvoice["status"], TTone> = { unpaid: "warning", partial: "info", paid: "success", voided: "muted" };

export function InvoiceDetail({ id }: { id: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data: invoice, isLoading, error, refetch } = useGetInvoiceQuery(id);
  const [voidInvoice, voiding] = useVoidInvoiceMutation();
  const [voidOpen, setVoidOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error || !invoice) return <ErrorState error={error} onRetry={refetch} />;

  const confirmVoid = async (reason: string) => {
    try {
      await voidInvoice({ id, reason }).unwrap();
      toast.success(t("fee.inv.voided"));
      setVoidOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const student = typeof invoice.studentId === "object" ? invoice.studentId : null;

  return (
    <>
      <PageHeader
        title={t("fee.inv.detailTitle", { no: invoice.invoiceNo })}
        description={student ? `${student.name} · ${student.studentId}` : undefined}
        action={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/fees/invoices">
                <ArrowLeft aria-hidden="true" />
                {t("common.back")}
              </Link>
            </Button>
            {invoice.status !== "voided" ? (
              <Button variant="destructive" onClick={() => setVoidOpen(true)}>
                {t("fee.inv.void")}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="max-w-3xl space-y-4">
        <Card>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-4">
            <Fact label={t("fee.inv.period")} value={invoice.periodLabel} />
            <Fact label={t("fee.gen.dueDate")} value={formatLocalDate(isoToLocalDate(invoice.dueDate), fmt)} />
            <Fact label={t("stu.col.status")} value={<StatusChip tone={TONE[invoice.status]}>{t(`fee.inv.status.${invoice.status}`)}</StatusChip>} />
            <Fact label={t("fee.inv.total")} value={<span className="tabular font-semibold text-navy">{formatMoney(invoice.total, fmt)}</span>} />
            {invoice.voidReason ? <Fact label={t("fee.inv.voidReason")} value={invoice.voidReason} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="mb-3 font-semibold text-navy">{t("fee.inv.lines")}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2">{t("fee.adj.feeHead")}</th>
                  <th className="tabular py-2 text-right">{t("fee.str.amount")}</th>
                  <th className="tabular py-2 text-right">{t("fee.inv.discount")}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-2">{l.label}</td>
                    <td className="tabular py-2 text-right">{formatMoney(l.amount, fmt)}</td>
                    <td className="tabular py-2 text-right">{l.discount ? `−${formatMoney(l.discount, fmt)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold text-navy">
                  <td className="py-2">{t("fee.inv.total")}</td>
                  <td className="tabular py-2 text-right" colSpan={2}>{formatMoney(invoice.total, fmt)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-muted-foreground">{t("fee.inv.due")}</td>
                  <td className="tabular py-1 text-right text-muted-foreground" colSpan={2}>{formatMoney(invoice.dueAmount, fmt)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="mb-3 font-semibold text-navy">{t("fee.inv.ledger")}</p>
            {invoice.ledger.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("fee.inv.ledgerEmpty")}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {invoice.ledger.map((l) => (
                  <li key={l._id} className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2">
                    <span>
                      <span className="block font-medium">{l.type}</span>
                      <span className="block text-xs text-muted-foreground">{formatLocalDate(isoToLocalDate(l.occurredAt), fmt)}{l.note ? ` · ${l.note}` : ""}</span>
                    </span>
                    <span className={`tabular font-semibold ${l.direction === "credit" ? "text-success" : "text-destructive"}`}>
                      {l.direction === "credit" ? "+" : "−"}{formatMoney(l.amount, fmt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ReasonDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        title={t("fee.inv.voidTitle")}
        description={t("fee.inv.voidDesc")}
        reasonLabel={t("fee.inv.voidReason")}
        confirmLabel={t("fee.inv.void")}
        destructive
        loading={voiding.isLoading}
        onConfirm={confirmVoid}
      />
    </>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
