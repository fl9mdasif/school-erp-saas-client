"use client";

import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadFile } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { formatLocalDate, formatMoney, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetMyFeesQuery } from "@/redux/api/portalApi";
import { useAppSelector } from "@/redux/hooks";

export function PortalFees() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetMyFeesQuery();

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const download = async (id: string) => {
    try {
      await downloadFile(`/payments/${id}/receipt.pdf`, `receipt-${id}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <PageHeader title={t("pt.fees.title")} />
      <p className="tabular mb-4 text-lg font-bold text-navy">{t("fee.dues.totalDue")}: {formatMoney(data.totalDue, fmt)}</p>

      <Card className="mb-4 max-w-2xl">
        <CardContent className="space-y-2 pt-5">
          <p className="mb-1 font-semibold text-navy">{t("pt.fees.due")}</p>
          {data.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("fee.collect.noDues")}</p>
          ) : (
            data.invoices.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span>
                  <span className="block font-medium">{inv.invoiceNo} · {inv.periodLabel}</span>
                  <span className="block text-xs text-muted-foreground">{t("fee.gen.dueDate")}: {inv.dueDate}</span>
                </span>
                <span className="tabular font-semibold text-destructive">{formatMoney(inv.dueAmount, fmt)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardContent className="space-y-2 pt-5">
          <p className="mb-1 font-semibold text-navy">{t("pt.fees.receipts")}</p>
          {data.receipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("fee.pay.empty")}</p>
          ) : (
            data.receipts.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span>
                  <span className="block font-medium">{p.receiptNo}</span>
                  <span className="block text-xs text-muted-foreground">{formatLocalDate(isoToLocalDate(p.receivedAt), fmt)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular font-semibold text-navy">{formatMoney(p.amount, fmt)}</span>
                  {p.status === "reversed" ? <StatusChip tone="muted">{t("fee.pay.status.reversed")}</StatusChip> : null}
                  <Button variant="ghost" size="icon" onClick={() => download(p._id)} aria-label={t("fee.rc.download")}>
                    <Download aria-hidden="true" />
                  </Button>
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
