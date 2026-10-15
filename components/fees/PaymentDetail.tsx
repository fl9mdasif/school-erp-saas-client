"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hooks";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetPaymentQuery, useReversePaymentMutation } from "@/redux/api/paymentApi";
import { Receipt } from "./Receipt";

export function PaymentDetail({ id }: { id: string }) {
  const { t } = useT();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { data: payment, isLoading, error, refetch } = useGetPaymentQuery(id);
  const [reverse, reversing] = useReversePaymentMutation();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (error || !payment) return <ErrorState error={error} onRetry={refetch} />;

  const confirmReverse = async (reason: string) => {
    try {
      await reverse({ id, reason }).unwrap();
      toast.success(t("fee.pay.reversed"));
      setOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <PageHeader
        title={t("fee.pay.detailTitle", { no: payment.receiptNo })}
        action={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/fees/payments">
                <ArrowLeft aria-hidden="true" />
                {t("common.back")}
              </Link>
            </Button>
            {role === "admin" && payment.status === "succeeded" ? (
              <Button variant="destructive" onClick={() => setOpen(true)}>
                {t("fee.pay.reverse")}
              </Button>
            ) : null}
          </>
        }
      />
      <div className="mb-4">
        <StatusChip tone={payment.status === "reversed" ? "muted" : "success"}>{t(`fee.pay.status.${payment.status}`)}</StatusChip>
      </div>
      {payment.reversalReason ? (
        <p className="mb-4 max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {t("fee.pay.reversalReason")}: {payment.reversalReason}
        </p>
      ) : null}
      <Receipt paymentId={id} />
      <ReasonDialog
        open={open}
        onOpenChange={setOpen}
        title={t("fee.pay.reverseTitle")}
        description={t("fee.pay.reverseDesc")}
        reasonLabel={t("fee.pay.reversalReason")}
        confirmLabel={t("fee.pay.reverse")}
        destructive
        loading={reversing.isLoading}
        onConfirm={confirmReverse}
      />
    </>
  );
}
