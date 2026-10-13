"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import {
  useCreateClassSubjectMutation,
  useDeleteClassSubjectMutation,
  useGetClassSubjectsQuery,
  useGetClassesQuery,
  useGetSessionsQuery,
  useGetSubjectsQuery,
  useUpdateClassSubjectMutation,
} from "@/redux/api/academicApi";
import { useGetStaffQuery } from "@/redux/api/staffApi";
import { useAppSelector } from "@/redux/hooks";
import type { TClassSubject, TSubject } from "@/types";
import { classSubjectSchema, type TClassSubjectForm } from "@/utils/schemas/academic";

const KINDS = ["compulsory", "optional", "fourth"] as const;

export function ClassSubjectsManager() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const picked = useAppSelector((s) => s.ui.selectedSessionId);
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const subjects = useGetSubjectsQuery();
  const teachers = useGetStaffQuery({ role: "teacher", status: "active", limit: 100 });
  const [classId, setClassId] = useState("");
  const [editing, setEditing] = useState<TClassSubject | "new" | null>(null);
  const [deleting, setDeleting] = useState<TClassSubject | null>(null);
  const [remove, removing] = useDeleteClassSubjectMutation();

  const sessionId = picked || sessions.data?.rows.find((s) => s.isCurrent)?._id || "";
  const activeClass = classId || classes.data?.rows[0]?._id || "";
  const mapped = useGetClassSubjectsQuery({ sessionId, classId: activeClass }, { skip: !sessionId || !activeClass });

  const subjectById = new Map((subjects.data?.rows ?? []).map((s) => [s._id, s]));
  const teacherName = new Map((teachers.data?.rows ?? []).map((u) => [u._id, u.name]));

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting._id).unwrap();
      toast.success(t("ac.map.deleted"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
    setDeleting(null);
  };

  const columns: TColumn<TClassSubject>[] = [
    { key: "subject", header: t("ac.map.subject"), cell: (r) => <span className="font-medium">{subjectById.get(r.subjectId)?.name ?? "-"}</span> },
    { key: "kind", header: t("ac.map.kind"), cell: (r) => <Badge>{t(`ac.map.kind.${r.kind}`)}</Badge> },
    { key: "marks", header: t("ac.map.marks"), cell: (r) => <span className="tabular">{formatNumber(r.fullMarks, fmt)} / {formatNumber(r.passMarks, fmt)}</span> },
    { key: "teacher", header: t("ac.map.teacher", { teacher: term("teacher") }), cell: (r) => (r.teacherId ? teacherName.get(r.teacherId) ?? "-" : <span className="text-muted-foreground">{t("ac.map.noTeacher")}</span>) },
  ];

  const loadingAny = classes.isLoading || sessions.isLoading || subjects.isLoading || mapped.isLoading;

  return (
    <>
      <PageHeader
        title={t("ac.map.title")}
        description={t("ac.map.desc", { class: term("class") })}
        action={
          <Button onClick={() => setEditing("new")} disabled={!activeClass || !sessionId}>
            <Plus aria-hidden="true" />
            {t("ac.map.add")}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <FormField label={term("class")}>
          {(c) => (
            <Select {...c} value={activeClass} onChange={(e) => setClassId(e.target.value)}>
              {(classes.data?.rows ?? []).map((k) => (
                <option key={k._id} value={k._id}>{k.name}</option>
              ))}
            </Select>
          )}
        </FormField>
      </div>

      <DataTable
        columns={columns}
        rows={mapped.data?.rows}
        meta={mapped.data?.meta}
        rowKey={(r) => r._id}
        loading={loadingAny}
        error={mapped.error}
        onRetry={mapped.refetch}
        emptyTitle={t("ac.map.empty")}
        emptyDescription={t("ac.map.emptyDesc")}
        rowActions={(r) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditing(r)} aria-label={t("common.edit")}>
              <Pencil aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} aria-label={t("common.delete")}>
              <Trash2 aria-hidden="true" />
            </Button>
          </>
        )}
      />

      {editing ? (
        <MapDialog
          row={editing === "new" ? null : editing}
          sessionId={sessionId}
          classId={activeClass}
          subjects={subjects.data?.rows ?? []}
          taken={new Set((mapped.data?.rows ?? []).map((r) => r.subjectId))}
          teachers={teachers.data?.rows.map((u) => ({ id: u._id, name: u.name })) ?? []}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("ac.map.deleteTitle", { name: deleting ? subjectById.get(deleting.subjectId)?.name ?? "" : "" })}
        description={t("ac.map.deleteBody")}
        confirmLabel={t("common.delete")}
        destructive
        loading={removing.isLoading}
        onConfirm={confirmDelete}
      />
    </>
  );
}

type DialogProps = {
  row: TClassSubject | null;
  sessionId: string;
  classId: string;
  subjects: TSubject[];
  taken: Set<string>;
  teachers: { id: string; name: string }[];
  onClose: () => void;
};

function MapDialog({ row, sessionId, classId, subjects, taken, teachers, onClose }: DialogProps) {
  const { t, tv, term } = useT();
  const [create, creating] = useCreateClassSubjectMutation();
  const [update, updating] = useUpdateClassSubjectMutation();
  const available = row ? subjects : subjects.filter((s) => !taken.has(s._id));
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TClassSubjectForm>({
    resolver: zodResolver(classSubjectSchema),
    mode: "onTouched",
    defaultValues: {
      subjectId: row?.subjectId ?? "",
      kind: row?.kind ?? "compulsory",
      teacherId: row?.teacherId ?? "",
      fullMarks: row && !row.components.length ? String(row.fullMarks) : "",
      passMarks: row && !row.components.length ? String(row.passMarks) : "",
    },
  });
  const subject = subjects.find((s) => s._id === watch("subjectId"));
  // Subjects with parts take their marks from the parts, so the box is only for single-mark subjects
  const needsMarks = !!subject && subject.components.length === 0;

  const onSubmit = handleSubmit(async (v) => {
    if (needsMarks && (!v.fullMarks || !v.passMarks)) return toast.error(t("ac.map.marksRequired"));
    const marks = needsMarks ? { fullMarks: Number(v.fullMarks), passMarks: Number(v.passMarks) } : {};
    try {
      if (row) {
        await update({ id: row._id, data: { kind: v.kind, teacherId: v.teacherId || undefined, ...marks } }).unwrap();
      } else {
        await create({ sessionId, classId, subjectId: v.subjectId, kind: v.kind, teacherId: v.teacherId || undefined, ...marks }).unwrap();
      }
      toast.success(t("ac.map.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{row ? t("ac.map.edit") : t("ac.map.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("ac.map.subject")} error={tv(errors.subjectId?.message)}>
            {(c) => (
              <Select {...c} disabled={!!row} {...register("subjectId")}>
                <option value="">{t("ac.map.pick")}</option>
                {available.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("ac.map.kind")}>
            {(c) => (
              <Select {...c} {...register("kind")}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{t(`ac.map.kind.${k}`)}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("ac.map.teacher", { teacher: term("teacher") })}>
            {(c) => (
              <Select {...c} {...register("teacherId")}>
                <option value="">{t("ac.map.noTeacher")}</option>
                {teachers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          {needsMarks ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("ac.sub.full")} error={tv(errors.fullMarks?.message)}>
                {(c) => <Input inputMode="numeric" {...c} {...register("fullMarks")} />}
              </FormField>
              <FormField label={t("ac.sub.pass")} error={tv(errors.passMarks?.message)}>
                {(c) => <Input inputMode="numeric" {...c} {...register("passMarks")} />}
              </FormField>
            </div>
          ) : subject ? (
            <p className="text-sm text-muted-foreground">{t("ac.map.fromParts")}</p>
          ) : null}
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
