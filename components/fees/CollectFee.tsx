"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreatePaymentMutation } from "@/redux/api/paymentApi";
import { useGetInvoicesQuery } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TPaymentMethod, TStudent } from "@/types";
import { collectFeeSchema, type TCollectFeeForm } from "@/utils/schemas/payment";
import { Receipt } from "./Receipt";
import { StudentPicker } from "./StudentPicker";

const METHODS: TPaymentMethod[] = ["cash", "bank", "cheque", "bkash_manual", "nagad_manual", "rocket_manual"];
const DIGITAL = new Set<TPaymentMethod>(["bkash_manual", "nagad_manual", "rocket_manual"]);

export function CollectFee() {
  const { t } = useT();
  const [student, setStudent] = useState<TStudent | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);

  if (paidId) {
    return (
      <>
        <PageHeader title={t("fee.rc.title")} />
        <Receipt
          paymentId={paidId}
          onCollectAnother={() => {
            setPaidId(null);
            setStudent(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("fee.collect.title")} description={t("fee.collect.desc")} />
      <div className="mb-4 max-w-md">
        <FormField label={t("fee.adj.student")}>{() => <StudentPicker selected={student} onSelect={setStudent} />}</FormField>
      </div>
      {!student ? <EmptyState title={t("fee.adj.pickStudent")} /> : <CollectForm student={student} onPaid={setPaidId} />}
    </>
  );
}

function CollectForm({ student, onPaid }: { student: TStudent; onPaid: (id: string) => void }) {
  const { t, tv, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const invoices = useGetInvoicesQuery({ studentId: student._id, limit: 50 });
  const open = useMemo(
    () => (invoices.data?.rows ?? []).filter((i) => i.status === "unpaid" || i.status === "partial").sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [invoices.data]
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const checkedIds = open.filter((i) => checked[i._id] !== false).map((i) => i._id);
  const runningTotal = open.filter((i) => checked[i._id] !== false).reduce((n, i) => n + i.dueAmount, 0);

  const [create, creating] = useCreatePaymentMutation();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TCollectFeeForm>({
    resolver: zodResolver(collectFeeSchema),
    mode: "onTouched",
    defaultValues: { method: "cash", amount: runningTotal, providerRef: "", note: "" },
  });
  const method = watch("method");

  // The total follows the checked invoices until the accountant types a part amount themselves.
  useEffect(() => {
    setValue("amount", runningTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningTotal]);

  const onSubmit = handleSubmit(async (v) => {
    if (v.amount > runningTotal) return toast.error(t("fee.collect.overAmount"));
    try {
      const key = crypto.randomUUID();
      const allocations: { invoiceId: string; amount: number }[] = [];
      let remaining = v.amount;
      for (const inv of open.filter((i) => checkedIds.includes(i._id))) {
        if (remaining <= 0) break;
        const take = Math.min(inv.dueAmount, remaining);
        allocations.push({ invoiceId: inv._id, amount: take });
        remaining -= take;
      }
      const payment = await create({
        data: { studentId: student._id, amount: v.amount, method: v.method, allocations, providerRef: v.providerRef || undefined, note: v.note || undefined },
        key,
      }).unwrap();
      onPaid(payment._id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  if (invoices.isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (open.length === 0) return <EmptyState title={t("fee.collect.noDues")} description={t("fee.collect.noDuesDesc")} />;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="space-y-2 pt-5">
          <p className="mb-2 font-semibold text-navy">{t("fee.collect.invoices")}</p>
          {open.map((inv) => (
            <label key={inv._id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked[inv._id] !== false}
                  onChange={(e) => setChecked((c) => ({ ...c, [inv._id]: e.target.checked }))}
                  className="size-4"
                />
                <span>
                  <span className="block font-medium">{inv.invoiceNo} · {inv.periodLabel}</span>
                  <span className="block text-xs text-muted-foreground">{t("fee.gen.dueDate")}: {inv.dueDate}</span>
                </span>
              </span>
              <span className="tabular font-semibold text-navy">{formatMoney(inv.dueAmount, fmt)}</span>
            </label>
          ))}
          <p className="tabular pt-2 text-right text-lg font-bold text-navy" aria-live="polite">
            {t("fee.collect.runningTotal")}: {formatMoney(runningTotal, fmt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <FormField label={t("fee.collect.amount")} error={tv(errors.amount?.message)}>
            {(c) => <Input type="number" min={1} max={runningTotal} {...c} {...register("amount", { valueAsNumber: true })} />}
          </FormField>
          <FormField label={t("fee.collect.method")}>
            {(c) => (
              <Select {...c} {...register("method")}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{t(`fee.collect.method.${m}`)}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField
            label={t("fee.collect.ref")}
            hint={DIGITAL.has(method) ? undefined : t("fee.adj.optional")}
            error={tv(errors.providerRef?.message)}
          >
            {(c) => <Input {...c} {...register("providerRef")} />}
          </FormField>
          <FormField label={t("fee.collect.note")} className="sm:col-span-2" hint={t("fee.adj.optional")}>
            {(c) => <Textarea {...c} {...register("note")} />}
          </FormField>
        </CardContent>
      </Card>

      <Button type="submit" disabled={creating.isLoading || runningTotal <= 0}>
        {creating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {t("fee.collect.submit")}
      </Button>
    </form>
  );
}
