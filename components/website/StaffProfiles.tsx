"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import {
  useCreateStaffProfileMutation,
  useDeleteStaffProfileMutation,
  useGetStaffProfilesQuery,
  useUpdateStaffProfileMutation,
} from "@/redux/api/websiteApi";
import { ImageUploader } from "@/services/ImageUploader";
import type { TStaffProfile } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "val.required").max(100),
  designation: z.string().trim().min(2, "val.required").max(100),
  photoUrl: z.string(),
  bio: z.string().trim().max(1000),
  showOnPublicSite: z.boolean(),
});
type TForm = z.infer<typeof schema>;

export function StaffProfiles() {
  const { t } = useT();
  const { data, isLoading, error, refetch } = useGetStaffProfilesQuery();
  const [update] = useUpdateStaffProfileMutation();
  const [del, deleting] = useDeleteStaffProfileMutation();
  const [editing, setEditing] = useState<TStaffProfile | "new" | null>(null);
  const [removing, setRemoving] = useState<TStaffProfile | null>(null);

  const toggleShow = async (p: TStaffProfile) => {
    try {
      await update({ id: p._id, data: { showOnPublicSite: !p.showOnPublicSite } }).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await del(removing._id).unwrap();
      setRemoving(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const columns: TColumn<TStaffProfile>[] = [
    {
      key: "name",
      header: t("web.staff.name"),
      cell: (p) => (
        <span className="block min-w-0">
          <span className="block truncate font-semibold text-navy">{p.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{p.designation}</span>
        </span>
      ),
    },
    {
      key: "visible",
      header: t("web.staff.visible"),
      cell: (p) => <StatusChip tone={p.showOnPublicSite ? "success" : "muted"}>{p.showOnPublicSite ? t("web.staff.shown") : t("web.staff.hidden")}</StatusChip>,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("web.staff.title")}
        description={t("web.staff.desc")}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            {t("web.staff.add")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(p) => p._id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={t("web.staff.empty")}
        rowActions={(p) => (
          <>
            <Button variant="outline" onClick={() => toggleShow(p)}>
              {p.showOnPublicSite ? t("web.staff.hide") : t("web.staff.show")}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label={t("common.edit")}>
              <Pencil aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setRemoving(p)} aria-label={t("common.delete")}>
              <Trash2 aria-hidden="true" />
            </Button>
          </>
        )}
      />
      {editing ? <ProfileDialog profile={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} title={t("web.staff.deleteTitle")} confirmLabel={t("common.delete")} onConfirm={confirmDelete} loading={deleting.isLoading} destructive />
    </>
  );
}

function ProfileDialog({ profile, onClose }: { profile: TStaffProfile | null; onClose: () => void }) {
  const { t, tv } = useT();
  const [create, creating] = useCreateStaffProfileMutation();
  const [update, updating] = useUpdateStaffProfileMutation();
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<TForm>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: profile?.name ?? "", designation: profile?.designation ?? "", photoUrl: profile?.photoUrl ?? "", bio: profile?.bio ?? "", showOnPublicSite: profile?.showOnPublicSite ?? true },
  });
  const photoUrl = watch("photoUrl");

  const onSubmit = handleSubmit(async (v) => {
    try {
      const payload = { name: v.name, designation: v.designation, photoUrl: v.photoUrl || undefined, bio: v.bio || undefined, showOnPublicSite: v.showOnPublicSite, order: profile?.order ?? 0 };
      if (profile) await update({ id: profile._id, data: payload }).unwrap();
      else await create(payload).unwrap();
      toast.success(t("web.staff.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{profile ? t("web.staff.edit") : t("web.staff.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("web.staff.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("web.staff.designation")} error={tv(errors.designation?.message)}>
            {(c) => <Input {...c} {...register("designation")} />}
          </FormField>
          <FormField label={t("web.staff.bio")}>
            {(c) => <Textarea {...c} {...register("bio")} />}
          </FormField>
          <ImageUploader folder="staff" initialImageUrl={photoUrl || undefined} onUploadSuccess={(url) => setValue("photoUrl", url)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" {...register("showOnPublicSite")} />
            {t("web.staff.showOnSite")}
          </label>
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
