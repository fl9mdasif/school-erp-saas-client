"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useCreateFeeHeadMutation, useGetFeeHeadsQuery, useUpdateFeeHeadMutation } from "@/redux/api/feesApi";
import type { TFeeHead } from "@/types";
import { feeHeadSchema, type TFeeHeadForm } from "@/utils/schemas/fees";

export function FeeHeadsManager() {
  const { t, lang } = useT();
  const { data, isLoading, error, refetch } = useGetFeeHeadsQuery();
  const [update, updating] = useUpdateFeeHeadMutation();
  const [editing, setEditing] = useState<TFeeHead | "new" | null>(null);

  const toggle = async (h: TFeeHead) => {
    try {
      await update({ id: h._id, data: { isActive: !h.isActive } }).unwrap();
      toast.success(t("fee.head.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const columns: TColumn<TFeeHead>[] = [
    {
      key: "name",
      header: t("fee.head.name"),
      cell: (h) => (
        <span className="block min-w-0">
          <span className="block truncate font-semibold text-navy">{lang === "bn" && h.nameBn ? h.nameBn : h.name}</span>
          <span className="tabular block text-xs text-muted-foreground">{h.code}</span>
        </span>
      ),
    },
    { key: "kind", header: t("fee.head.kind"), cell: (h) => t(`fee.head.kind.${h.kind}`) },
    {
      key: "status",
      header: t("stu.col.status"),
      cell: (h) => <StatusChip tone={h.isActive ? "success" : "muted"}>{h.isActive ? t("st.status.active") : t("st.status.inactive")}</StatusChip>,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("fee.head.title")}
        description={t("fee.head.desc")}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            {t("fee.head.add")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(h) => h._id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={t("fee.head.empty")}
        emptyDescription={t("fee.head.emptyDesc")}
        rowActions={(h) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditing(h)} aria-label={t("common.edit")}>
              <Pencil aria-hidden="true" />
            </Button>
            <Button variant="outline" disabled={updating.isLoading} onClick={() => toggle(h)}>
              {h.isActive ? t("st.deactivate") : t("st.activate")}
            </Button>
          </>
        )}
      />
      {editing ? <HeadDialog head={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function HeadDialog({ head, onClose }: { head: TFeeHead | null; onClose: () => void }) {
  const { t, tv } = useT();
  const [create, creating] = useCreateFeeHeadMutation();
  const [update, updating] = useUpdateFeeHeadMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<TFeeHeadForm>({
    resolver: zodResolver(feeHeadSchema),
    mode: "onTouched",
    defaultValues: { name: head?.name ?? "", nameBn: head?.nameBn ?? "", code: head?.code ?? "", kind: head?.kind ?? "recurring" },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      if (head) await update({ id: head._id, data: { name: v.name, nameBn: v.nameBn || undefined, kind: v.kind } }).unwrap();
      else await create({ name: v.name, nameBn: v.nameBn || undefined, code: v.code, kind: v.kind }).unwrap();
      toast.success(t("fee.head.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{head ? t("fee.head.edit") : t("fee.head.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("fee.head.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("ac.sub.nameBn")}>
            {(c) => <Input {...c} {...register("nameBn")} />}
          </FormField>
          <FormField label={t("fee.head.code")} hint={t("fee.head.codeHint")} error={tv(errors.code?.message)}>
            {(c) => <Input autoCapitalize="characters" spellCheck={false} disabled={!!head} {...c} {...register("code")} />}
          </FormField>
          <FormField label={t("fee.head.kind")}>
            {(c) => (
              <Select {...c} {...register("kind")}>
                <option value="recurring">{t("fee.head.kind.recurring")}</option>
                <option value="one_time">{t("fee.head.kind.one_time")}</option>
              </Select>
            )}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={creating.isLoading || updating.isLoading}>
              {creating.isLoading || updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
