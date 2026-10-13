"use client";

import { KeyRound, Loader2, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CopyField } from "@/components/common/CopyField";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useCreateStudentLoginsMutation, useDeleteStudentMutation, useSetStudentStatusMutation } from "@/redux/api/studentApi";
import type { TLoginsResult, TStudentDetail, TStudentStatus } from "@/types";

const STATUSES: TStudentStatus[] = ["active", "transferred", "passed_out", "dropped", "inactive"];
type Mode = "status" | "logins" | "delete" | null;

export function StudentActions({ student }: { student: TStudentDetail }) {
  const { t, term } = useT();
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal aria-hidden="true" />
            {t("stu.act.more")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMode("status")}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("stu.act.changeStatus")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode("logins")}>
            <KeyRound className="size-4" aria-hidden="true" />
            {t("stu.act.logins")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode("delete")}>
            <Trash2 className="size-4" aria-hidden="true" />
            {t("stu.act.delete", { student: term("student") })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {mode === "status" ? <StatusDialog student={student} onClose={close} /> : null}
      {mode === "logins" ? <LoginsDialog student={student} onClose={close} /> : null}
      {mode === "delete" ? <DeleteDialog student={student} onClose={close} /> : null}
    </>
  );
}

function StatusDialog({ student, onClose }: { student: TStudentDetail; onClose: () => void }) {
  const { t } = useT();
  const [status, setStatus] = useState<TStudentStatus>(student.status);
  const [save, { isLoading }] = useSetStudentStatusMutation();
  const [confirming, setConfirming] = useState(false);

  const apply = async () => {
    try {
      await save({ id: student._id, status }).unwrap();
      toast.success(t("stu.act.statusChanged"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <ConfirmDialog
        open
        onOpenChange={(o) => !o && onClose()}
        title={t("stu.act.statusConfirm", { status: t(`stu.status.${status}`) })}
        description={t(status === "active" ? "stu.act.statusActiveBody" : "stu.act.statusLeaveBody")}
        confirmLabel={t("common.confirm")}
        destructive={status !== "active"}
        loading={isLoading}
        onConfirm={apply}
      />
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("stu.act.changeStatus")}</DialogTitle>
        <FormField label={t("stu.col.status")}>
          {(c) => (
            <Select {...c} value={status} onChange={(e) => setStatus(e.target.value as TStudentStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`stu.status.${s}`)}</option>
              ))}
            </Select>
          )}
        </FormField>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={status === student.status} onClick={() => setConfirming(true)}>
            {t("common.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoginsDialog({ student, onClose }: { student: TStudentDetail; onClose: () => void }) {
  const { t, term } = useT();
  const [create, { isLoading }] = useCreateStudentLoginsMutation();
  const [forStudent, setForStudent] = useState(true);
  const [guardianIds, setGuardianIds] = useState<string[]>(student.guardians.map((g) => g._id));
  const [result, setResult] = useState<TLoginsResult | null>(null);

  const run = async () => {
    try {
      setResult(await create({ id: student._id, student: forStudent, guardianIds }).unwrap());
    } catch (err) {
      // LOGIN_EXISTS when the student already has an account
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const toggle = (id: string) => setGuardianIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const phoneOf = (id: string) => student.guardians.find((g) => g._id === id)?.name ?? "";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("stu.act.logins")}</DialogTitle>
        {result ? (
          <div className="space-y-4">
            {result.student ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold">{t("stu.act.studentLogin", { student: term("student"), id: result.student.loginId })}</p>
                <CopyField label={t("st.tempPassword")} value={result.student.temporaryPassword} />
              </div>
            ) : null}
            {result.guardians.map((g) => (
              <div key={g.guardianId} className="space-y-1">
                <p className="text-sm font-semibold">{t("stu.act.guardianLogin", { name: phoneOf(g.guardianId), phone: g.phone })}</p>
                <CopyField label={t("st.tempPassword")} value={g.temporaryPassword} />
              </div>
            ))}
            {!result.student && result.guardians.length === 0 ? <p className="text-sm text-muted-foreground">{t("stu.act.nothingNew")}</p> : null}
            <p className="text-sm text-warning-deep">{t("st.tempOnce")}</p>
            <DialogFooter>
              <Button onClick={onClose}>{t("st.done")}</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogDescription>{t("stu.act.loginsBody", { student: term("student") })}</DialogDescription>
            <div className="space-y-1">
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" className="size-5 accent-primary" checked={forStudent} onChange={(e) => setForStudent(e.target.checked)} />
                {t("stu.act.forStudent", { student: term("student") })}
              </label>
              {student.guardians.map((g) => (
                <label key={g._id} className="flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" className="size-5 accent-primary" checked={guardianIds.includes(g._id)} onChange={() => toggle(g._id)} />
                  {g.name} <span className="tabular text-muted-foreground">{g.phone}</span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button onClick={run} disabled={isLoading || (!forStudent && guardianIds.length === 0)}>
                {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {t("stu.act.createLogins")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ student, onClose }: { student: TStudentDetail; onClose: () => void }) {
  const { t, term } = useT();
  const router = useRouter();
  const [remove, { isLoading }] = useDeleteStudentMutation();

  const run = async () => {
    try {
      await remove(student._id).unwrap();
      toast.success(t("stu.act.deleted"));
      router.push("/dashboard/students");
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={t("stu.act.deleteTitle", { name: student.name })}
      description={t("stu.act.deleteBody", { student: term("student") })}
      confirmLabel={t("common.delete")}
      destructive
      typedConfirmText={student.studentId}
      loading={isLoading}
      onConfirm={run}
    />
  );
}
