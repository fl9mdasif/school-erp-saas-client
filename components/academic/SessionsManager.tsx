"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { DatePicker } from "@/components/common/DatePicker";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/errors";
import { addDays, formatLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreateSessionMutation, useGetSessionsQuery, useUpdateSessionMutation } from "@/redux/api/academicApi";
import { useAppSelector } from "@/redux/hooks";
import type { TSession } from "@/types";
import { sessionSchema, type TSessionForm } from "@/utils/schemas/academic";

export function SessionsManager() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetSessionsQuery();
  const [update, { isLoading: switching }] = useUpdateSessionMutation();
  const [adding, setAdding] = useState(false);
  const [target, setTarget] = useState<TSession | null>(null);

  const makeCurrent = async () => {
    if (!target) return;
    try {
      await update({ id: target._id, data: { isCurrent: true } }).unwrap();
      toast.success(t("ac.sessions.switched"));
      setTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const columns: TColumn<TSession>[] = [
    {
      key: "name",
      header: t("ac.sessions.name"),
      cell: (s) => (
        <span className="flex items-center gap-2 font-medium">
          {s.name}
          {s.isCurrent ? <Badge>{t("ac.sessions.current")}</Badge> : null}
        </span>
      ),
    },
    { key: "start", header: t("ac.sessions.start"), cell: (s) => <span className="tabular">{formatLocalDate(s.startDate, fmt)}</span> },
    { key: "end", header: t("ac.sessions.end"), cell: (s) => <span className="tabular">{formatLocalDate(s.endDate, fmt)}</span> },
  ];

  return (
    <>
      <PageHeader
        title={t("ac.sessions.title")}
        description={t("ac.sessions.desc")}
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            {t("ac.sessions.add")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(s) => s._id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={t("ac.sessions.empty")}
        emptyDescription={t("ac.sessions.emptyDesc")}
        rowActions={(s) =>
          s.isCurrent ? null : (
            <Button variant="outline" onClick={() => setTarget(s)}>
              {t("ac.sessions.makeCurrent")}
            </Button>
          )
        }
      />

      {adding ? <SessionDialog onClose={() => setAdding(false)} /> : null}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={t("ac.sessions.confirmTitle", { name: target?.name ?? "" })}
        description={t("ac.sessions.confirmBody")}
        confirmLabel={t("ac.sessions.makeCurrent")}
        loading={switching}
        onConfirm={makeCurrent}
      />
    </>
  );
}

function SessionDialog({ onClose }: { onClose: () => void }) {
  const { t, tv } = useT();
  const [create, { isLoading }] = useCreateSessionMutation();
  const year = new Date().getFullYear();
  const { register, control, handleSubmit, formState: { errors } } = useForm<TSessionForm>({
    resolver: zodResolver(sessionSchema),
    mode: "onTouched",
    defaultValues: { name: String(year), startDate: `${year}-01-01`, endDate: addDays(`${year}-01-01`, 364), isCurrent: false },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await create(v).unwrap();
      toast.success(t("ac.sessions.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("ac.sessions.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("ac.sessions.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("ac.sessions.start")} error={tv(errors.startDate?.message)}>
            {(c) => <Controller control={control} name="startDate" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />}
          </FormField>
          <FormField label={t("ac.sessions.end")} error={tv(errors.endDate?.message)}>
            {(c) => <Controller control={control} name="endDate" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />}
          </FormField>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-primary" {...register("isCurrent")} />
            {t("ac.sessions.setCurrent")}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
