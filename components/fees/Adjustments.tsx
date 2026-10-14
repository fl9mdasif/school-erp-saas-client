"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { DatePicker } from "@/components/common/DatePicker";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetSessionsQuery } from "@/redux/api/academicApi";
import { useCreateAdjustmentMutation, useEndAdjustmentMutation, useGetAdjustmentsQuery, useGetFeeHeadsQuery } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TAdjustment, TStudent } from "@/types";
import { adjustmentSchema, type TAdjustmentForm } from "@/utils/schemas/fees";
import { StudentPicker } from "./StudentPicker";

export function Adjustments() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const sessions = useGetSessionsQuery();
  const picked = useAppSelector((s) => s.ui.selectedSessionId);
  const sessionId = picked || sessions.data?.rows.find((s) => s.isCurrent)?._id || "";
  const heads = useGetFeeHeadsQuery();
  const [student, setStudent] = useState<TStudent | null>(null);
  const [adding, setAdding] = useState(false);
  const [ending, setEnding] = useState<TAdjustment | null>(null);
  const [endAdjustment, endingState] = useEndAdjustmentMutation();

  const adjustments = useGetAdjustmentsQuery(
    { studentId: student?._id, sessionId },
    { skip: !student || !sessionId }
  );

  const headName = (id?: string) => (id ? heads.data?.rows.find((h) => h._id === id)?.name ?? id : t("fee.adj.feeHead.all"));
  const isActive = (a: TAdjustment) => !a.validTo || a.validTo >= new Date().toISOString().slice(0, 10);

  const columns: TColumn<TAdjustment>[] = [
    { key: "applies", header: t("fee.adj.col.applies"), cell: (a) => headName(a.feeHeadId) },
    { key: "amount", header: t("fee.adj.col.amount"), cell: (a) => (a.type === "percent" ? `${a.value}%` : formatMoney(a.value, fmt)) },
    { key: "reason", header: t("fee.adj.reason"), cell: (a) => <span className="line-clamp-2 max-w-xs">{a.reason}</span> },
    { key: "period", header: t("fee.adj.col.period"), cell: (a) => `${a.validFrom ?? "—"} → ${a.validTo ?? "…"}` },
    {
      key: "status",
      header: t("fee.adj.col.status"),
      cell: (a) => (
        <StatusChip tone={isActive(a) ? "success" : "muted"}>{isActive(a) ? t("fee.adj.status.active") : t("fee.adj.status.ended")}</StatusChip>
      ),
    },
  ];

  const confirmEnd = async () => {
    if (!ending) return;
    try {
      await endAdjustment(ending._id).unwrap();
      toast.success(t("fee.adj.ended"));
      setEnding(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <PageHeader
        title={t("fee.adj.title")}
        description={t("fee.adj.desc")}
        action={
          student ? (
            <Button onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" />
              {t("fee.adj.add")}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 max-w-md">
        <FormField label={t("fee.adj.student")}>{() => <StudentPicker selected={student} onSelect={setStudent} />}</FormField>
      </div>

      {!student ? (
        <EmptyState title={t("fee.adj.pickStudent")} />
      ) : (
        <DataTable
          columns={columns}
          rows={adjustments.data?.rows}
          meta={adjustments.data?.meta}
          rowKey={(a) => a._id}
          loading={adjustments.isLoading}
          error={adjustments.error}
          onRetry={adjustments.refetch}
          emptyTitle={t("fee.adj.empty")}
          emptyDescription={t("fee.adj.emptyDesc")}
          rowActions={(a) =>
            isActive(a) ? (
              <Button variant="outline" onClick={() => setEnding(a)}>
                {t("fee.adj.end")}
              </Button>
            ) : null
          }
        />
      )}

      {adding && student ? <AdjustmentDialog student={student} sessionId={sessionId} onClose={() => setAdding(false)} /> : null}

      <ConfirmDialog
        open={!!ending}
        onOpenChange={(o) => !o && setEnding(null)}
        title={t("fee.adj.endTitle")}
        description={t("fee.adj.endDesc")}
        confirmLabel={t("fee.adj.end")}
        onConfirm={confirmEnd}
        loading={endingState.isLoading}
        destructive
      />
    </>
  );
}

function AdjustmentDialog({ student, sessionId, onClose }: { student: TStudent; sessionId: string; onClose: () => void }) {
  const { t, tv } = useT();
  const heads = useGetFeeHeadsQuery();
  const [create, creating] = useCreateAdjustmentMutation();
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<TAdjustmentForm>({
    resolver: zodResolver(adjustmentSchema),
    mode: "onTouched",
    defaultValues: { feeHeadId: "", type: "percent", value: 0, reason: "", validFrom: "", validTo: "" },
  });
  const type = watch("type");

  const onSubmit = handleSubmit(async (v) => {
    try {
      await create({
        studentId: student._id,
        sessionId,
        feeHeadId: v.feeHeadId || undefined,
        type: v.type,
        value: Number(v.value),
        reason: v.reason,
        validFrom: v.validFrom || undefined,
        validTo: v.validTo || undefined,
      }).unwrap();
      toast.success(t("fee.adj.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("fee.adj.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("fee.adj.feeHead")}>
            {(c) => (
              <Select {...c} {...register("feeHeadId")}>
                <option value="">{t("fee.adj.feeHead.all")}</option>
                {(heads.data?.rows ?? []).filter((h) => h.isActive).map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("fee.adj.type")}>
              {(c) => (
                <Select {...c} {...register("type")}>
                  <option value="percent">{t("fee.adj.type.percent")}</option>
                  <option value="fixed">{t("fee.adj.type.fixed")}</option>
                </Select>
              )}
            </FormField>
            <FormField label={t("fee.adj.value")} error={tv(errors.value?.message)}>
              {(c) => <Input type="number" min={0} max={type === "percent" ? 100 : undefined} {...c} {...register("value", { valueAsNumber: true })} />}
            </FormField>
          </div>
          <FormField label={t("fee.adj.reason")} error={tv(errors.reason?.message)}>
            {(c) => <Input {...c} {...register("reason")} />}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("fee.adj.validFrom")} hint={t("fee.adj.optional")}>
              {(c) => (
                <Controller control={control} name="validFrom" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />
              )}
            </FormField>
            <FormField label={t("fee.adj.validTo")} hint={t("fee.adj.optional")}>
              {(c) => (
                <Controller control={control} name="validTo" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />
              )}
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={creating.isLoading}>
              {creating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
