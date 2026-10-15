"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RoleGate } from "@/components/auth/RoleGate";
import { QuickSetupDialog } from "./QuickSetupDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import {
  useCreateClassMutation,
  useCreateSectionMutation,
  useDeleteClassMutation,
  useDeleteSectionMutation,
  useGetClassesQuery,
  useGetSectionsQuery,
  useUpdateClassMutation,
  useUpdateSectionMutation,
} from "@/redux/api/academicApi";
import { useAppSelector } from "@/redux/hooks";
import type { TClass, TSection } from "@/types";
import { classSchema, sectionSchema, type TClassForm, type TSectionForm } from "@/utils/schemas/academic";
import { cn } from "@/lib/utils";

type Editing = { kind: "quick" } | { kind: "class"; item: TClass | null } | { kind: "section"; item: TSection | null } | null;
type Removing = { kind: "class"; item: TClass } | { kind: "section"; item: TSection } | null;

export function ClassesManager() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();
  const [updateClass, { isLoading: reordering }] = useUpdateClassMutation();
  const [removeClass, removingClass] = useDeleteClassMutation();
  const [removeSection, removingSection] = useDeleteSectionMutation();
  const [selectedId, setSelectedId] = useState<string>("");
  const [editing, setEditing] = useState<Editing>(null);
  const [removing, setRemoving] = useState<Removing>(null);

  const list = classes.data?.rows ?? [];
  const selected = list.find((c) => c._id === selectedId) ?? list[0];
  const mine = (sections.data?.rows ?? []).filter((s) => s.classId === selected?._id);

  const move = async (index: number, dir: -1 | 1) => {
    const a = list[index];
    const b = list[index + dir];
    if (!a || !b) return;
    // Swap the two order values. When they are equal, nudge so the move still takes effect.
    const [oa, ob] = a.order === b.order ? [b.order + dir, b.order] : [b.order, a.order];
    try {
      await Promise.all([updateClass({ id: a._id, data: { order: oa } }).unwrap(), updateClass({ id: b._id, data: { order: ob } }).unwrap()]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      if (removing.kind === "class") await removeClass(removing.item._id).unwrap();
      else await removeSection(removing.item._id).unwrap();
      toast.success(t("ac.cls.deleted"));
      setRemoving(null);
    } catch (err) {
      // The server refuses with a reason such as "this class has enrolled students"
      toast.error(getApiErrorMessage(err, t));
      setRemoving(null);
    }
  };

  return (
    <>
      <PageHeader
        title={t("ac.cls.title", { class: term("class"), section: term("section") })}
        description={t("ac.cls.desc")}
        action={
          <RoleGate permission="academic.manage">
            <Button variant="outline" onClick={() => setEditing({ kind: "quick" })}>
              <Wand2 aria-hidden="true" />
              {t("ac.quick.open")}
            </Button>
            <Button onClick={() => setEditing({ kind: "class", item: null })}>
              <Plus aria-hidden="true" />
              {t("ac.cls.add", { class: term("class") })}
            </Button>
          </RoleGate>
        }
      />

      {classes.error ? (
        <ErrorState error={classes.error} onRetry={classes.refetch} />
      ) : classes.isLoading ? (
        <CardSkeleton count={2} />
      ) : list.length === 0 ? (
        <EmptyState title={t("ac.cls.empty", { class: term("class") })} description={t("ac.cls.emptyDesc")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{term("class")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {list.map((c, i) => (
                  <li key={c._id} className={cn("flex items-center gap-1 rounded-lg border border-transparent", selected?._id === c._id && "border-primary bg-primary-tint")}>
                    <button type="button" onClick={() => setSelectedId(c._id)} className="min-h-11 min-w-0 flex-1 truncate px-3 text-left text-sm font-medium">
                      {lang === "bn" && c.nameBn ? c.nameBn : c.name}
                      {c.group ? <Badge className="ml-2">{t(`ac.cls.group.${c.group}`)}</Badge> : null}
                      {!c.isActive ? <Badge className="ml-2">{t("ac.cls.inactive")}</Badge> : null}
                    </button>
                    <RoleGate permission="academic.manage">
                      <Button variant="ghost" size="icon" disabled={i === 0 || reordering} onClick={() => move(i, -1)} aria-label={t("ac.cls.moveUp")}>
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={i === list.length - 1 || reordering} onClick={() => move(i, 1)} aria-label={t("ac.cls.moveDown")}>
                        <ArrowDown aria-hidden="true" />
                      </Button>
                    </RoleGate>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {selected ? (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle>{selected.name}</CardTitle>
                  <p className="tabular text-xs text-muted-foreground">{t("ac.cls.sectionCount", { count: formatNumber(mine.length, fmt), section: term("section") })}</p>
                </div>
                <RoleGate permission="academic.manage">
                  <div className="flex shrink-0 gap-1">
                    <Button variant="outline" size="icon" onClick={() => setEditing({ kind: "class", item: selected })} aria-label={t("common.edit")}>
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setRemoving({ kind: "class", item: selected })} aria-label={t("common.delete")}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </RoleGate>
              </CardHeader>
              <CardContent className="space-y-3">
                {mine.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("ac.cls.noSections", { section: term("section") })}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {mine.map((s) => (
                      <li key={s._id} className="flex items-center justify-between gap-2 py-1">
                        <span className="min-w-0 text-sm">
                          <span className="font-medium">{s.name}</span>
                          {s.capacity ? <span className="tabular ml-2 text-xs text-muted-foreground">{t("ac.cls.capacity")}: {formatNumber(s.capacity, fmt)}</span> : null}
                        </span>
                        <RoleGate permission="academic.manage">
                          <span className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditing({ kind: "section", item: s })} aria-label={t("common.edit")}>
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setRemoving({ kind: "section", item: s })} aria-label={t("common.delete")}>
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </span>
                        </RoleGate>
                      </li>
                    ))}
                  </ul>
                )}
                <RoleGate permission="academic.manage">
                  <Button variant="outline" onClick={() => setEditing({ kind: "section", item: null })}>
                    <Plus aria-hidden="true" />
                    {t("ac.cls.addSection", { section: term("section") })}
                  </Button>
                </RoleGate>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {editing?.kind === "quick" ? <QuickSetupDialog startOrder={list.length + 1} onClose={() => setEditing(null)} /> : null}
      {editing?.kind === "class" ? <ClassDialog item={editing.item} nextOrder={list.length + 1} onClose={() => setEditing(null)} /> : null}
      {editing?.kind === "section" && selected ? <SectionDialog item={editing.item} classId={selected._id} onClose={() => setEditing(null)} /> : null}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("ac.cls.deleteTitle", { name: removing?.item.name ?? "" })}
        description={t(removing?.kind === "class" ? "ac.cls.deleteClassBody" : "ac.cls.deleteSectionBody")}
        confirmLabel={t("common.delete")}
        destructive
        loading={removingClass.isLoading || removingSection.isLoading}
        onConfirm={confirmRemove}
      />
    </>
  );
}

function ClassDialog({ item, nextOrder, onClose }: { item: TClass | null; nextOrder: number; onClose: () => void }) {
  const { t, tv, term } = useT();
  const [create, creating] = useCreateClassMutation();
  const [update, updating] = useUpdateClassMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<TClassForm>({
    resolver: zodResolver(classSchema),
    mode: "onTouched",
    defaultValues: { name: item?.name ?? "", nameBn: item?.nameBn ?? "", order: item?.order ?? nextOrder, group: item?.group ?? "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    const data = { name: v.name, nameBn: v.nameBn || undefined, order: v.order, group: v.group || null };
    try {
      if (item) await update({ id: item._id, data }).unwrap();
      else await create(data).unwrap();
      toast.success(t("ac.cls.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{item ? t("ac.cls.edit", { class: term("class") }) : t("ac.cls.add", { class: term("class") })}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("ac.cls.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("ac.cls.nameBn")} error={tv(errors.nameBn?.message)}>
            {(c) => <Input {...c} {...register("nameBn")} />}
          </FormField>
          <FormField label={t("ac.cls.order")} hint={t("ac.cls.orderHint")} error={tv(errors.order?.message)}>
            {(c) => <Input type="number" inputMode="numeric" min={0} {...c} {...register("order", { valueAsNumber: true })} />}
          </FormField>
          <FormField label={t("ac.cls.group")}>
            {(c) => (
              <Select {...c} {...register("group")}>
                <option value="">{t("ac.cls.group.none")}</option>
                <option value="science">{t("ac.cls.group.science")}</option>
                <option value="commerce">{t("ac.cls.group.commerce")}</option>
                <option value="arts">{t("ac.cls.group.arts")}</option>
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

function SectionDialog({ item, classId, onClose }: { item: TSection | null; classId: string; onClose: () => void }) {
  const { t, tv, term } = useT();
  const [create, creating] = useCreateSectionMutation();
  const [update, updating] = useUpdateSectionMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<TSectionForm>({
    resolver: zodResolver(sectionSchema),
    mode: "onTouched",
    defaultValues: { name: item?.name ?? "", capacity: item?.capacity ? String(item.capacity) : "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    const capacity = v.capacity ? Number(v.capacity) : undefined;
    try {
      if (item) await update({ id: item._id, data: { name: v.name, capacity } }).unwrap();
      else await create({ classId, name: v.name, capacity }).unwrap();
      toast.success(t("ac.cls.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{item ? t("ac.cls.editSection", { section: term("section") }) : t("ac.cls.addSection", { section: term("section") })}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("ac.cls.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("ac.cls.capacity")} error={tv(errors.capacity?.message)}>
            {(c) => <Input inputMode="numeric" {...c} {...register("capacity")} />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={creating.isLoading || updating.isLoading}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
