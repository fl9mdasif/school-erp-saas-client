"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, MoreHorizontal, Pencil, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CopyField } from "@/components/common/CopyField";
import { FormField } from "@/components/common/FormField";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { normalizeBdPhone } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useResetStaffPasswordMutation, useSetStaffStatusMutation, useUpdateStaffMutation } from "@/redux/api/staffApi";
import type { TStaff } from "@/types";
import { staffEditSchema, type TStaffEditForm } from "@/utils/schemas/staff";

type Mode = "edit" | "status" | "reset" | null;

export function StaffActions({ user, isSelf }: { user: TStaff; isSelf: boolean }) {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("st.actions", { name: user.name })}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMode("edit")}>
            <Pencil className="size-4" aria-hidden="true" />
            {t("common.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode("reset")}>
            <KeyRound className="size-4" aria-hidden="true" />
            {t("st.resetPassword")}
          </DropdownMenuItem>
          {isSelf ? null : (
            <DropdownMenuItem onSelect={() => setMode("status")}>
              {user.status === "active" ? <UserX className="size-4" aria-hidden="true" /> : <UserCheck className="size-4" aria-hidden="true" />}
              {user.status === "active" ? t("st.deactivate") : t("st.activate")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {mode === "edit" ? <EditDialog user={user} onClose={close} /> : null}
      {mode === "status" ? <StatusDialog user={user} onClose={close} /> : null}
      {mode === "reset" ? <ResetDialog user={user} onClose={close} /> : null}
    </>
  );
}

function EditDialog({ user, onClose }: { user: TStaff; onClose: () => void }) {
  const { t, tv, term } = useT();
  const [update, { isLoading }] = useUpdateStaffMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<TStaffEditForm>({
    resolver: zodResolver(staffEditSchema),
    mode: "onTouched",
    defaultValues: { role: user.role, name: user.name, email: user.email ?? "", phone: user.phone ?? "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update({
        id: user._id,
        data: { role: v.role, name: v.name, email: v.email || undefined, phone: v.phone ? normalizeBdPhone(v.phone) ?? v.phone : undefined },
      }).unwrap();
      toast.success(t("st.saved"));
      onClose();
    } catch (err) {
      // Demoting the only admin is refused with LAST_ADMIN
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("st.edit")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("st.col.role")}>
            {(c) => (
              <Select {...c} {...register("role")}>
                {(["teacher", "accountant", "admin"] as const).map((r) => (
                  <option key={r} value={r}>{t(`st.role.${r}`, { teacher: term("teacher") })}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("st.col.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("st.email")} error={tv(errors.email?.message)}>
            {(c) => <Input type="email" {...c} {...register("email")} />}
          </FormField>
          <FormField label={t("st.phone")} error={tv(errors.phone?.message)}>
            {(c) => <PhoneInput {...c} {...register("phone")} />}
          </FormField>
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

function StatusDialog({ user, onClose }: { user: TStaff; onClose: () => void }) {
  const { t } = useT();
  const [setStatus, { isLoading }] = useSetStaffStatusMutation();
  const next = user.status === "active" ? "inactive" : "active";

  const confirm = async () => {
    try {
      await setStatus({ id: user._id, status: next }).unwrap();
      toast.success(t("st.statusChanged"));
    } catch (err) {
      // Deactivating the last active admin is refused with LAST_ADMIN
      toast.error(getApiErrorMessage(err, t));
    }
    onClose();
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={t(next === "inactive" ? "st.deactivateTitle" : "st.activateTitle", { name: user.name })}
      description={t(next === "inactive" ? "st.deactivateBody" : "st.activateBody")}
      confirmLabel={t(next === "inactive" ? "st.deactivate" : "st.activate")}
      destructive={next === "inactive"}
      loading={isLoading}
      onConfirm={confirm}
    />
  );
}

function ResetDialog({ user, onClose }: { user: TStaff; onClose: () => void }) {
  const { t } = useT();
  const [reset, { isLoading }] = useResetStaffPasswordMutation();
  const [temp, setTemp] = useState<string | null>(null);

  const run = async () => {
    try {
      const res = await reset(user._id).unwrap();
      setTemp(res.temporaryPassword);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("st.resetTitle", { name: user.name })}</DialogTitle>
        {temp ? (
          <>
            <CopyField label={t("st.tempPassword")} value={temp} />
            <p className="text-sm text-warning-deep">{t("st.tempOnce")}</p>
            <DialogFooter>
              <Button onClick={onClose}>{t("st.done")}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogDescription>{t("st.resetBody")}</DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button onClick={run} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {t("st.resetPassword")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
