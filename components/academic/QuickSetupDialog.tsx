"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useCreateClassMutation, useCreateSectionMutation } from "@/redux/api/academicApi";

const parseSections = (raw: string) =>
  Array.from(new Set(raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean))).slice(0, 10);

/** Creates "Class 1 ... Class N" with the same sections under each, one request at a time so a failure is easy to report. */
export function QuickSetupDialog({ startOrder, onClose }: { startOrder: number; onClose: () => void }) {
  const { t, term } = useT();
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("10");
  const [sections, setSections] = useState("A, B");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [createClass] = useCreateClassMutation();
  const [createSection] = useCreateSectionMutation();

  const a = Number(from);
  const b = Number(to);
  const valid = Number.isInteger(a) && Number.isInteger(b) && a >= 1 && b >= a && b - a < 20;
  const names = parseSections(sections);

  const run = async () => {
    if (!valid) return;
    const count = b - a + 1;
    const total = count * (1 + names.length);
    let done = 0;
    setProgress({ done, total });
    try {
      for (let n = a; n <= b; n++) {
        const cls = await createClass({ name: `${term("class")} ${n}`, order: startOrder + (n - a) }).unwrap();
        setProgress({ done: ++done, total });
        for (const name of names) {
          await createSection({ classId: cls._id, name }).unwrap();
          setProgress({ done: ++done, total });
        }
      }
      toast.success(t("ac.quick.done", { count }));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
      setProgress(null);
    }
  };

  const busy = progress !== null;

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("ac.quick.title", { class: term("class") })}</DialogTitle>
        <DialogDescription>{t("ac.quick.body")}</DialogDescription>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("ac.quick.from")}>
              {(c) => <Input inputMode="numeric" value={from} onChange={(e) => setFrom(e.target.value)} {...c} />}
            </FormField>
            <FormField label={t("ac.quick.to")} error={!valid ? t("ac.quick.invalid") : undefined}>
              {(c) => <Input inputMode="numeric" value={to} onChange={(e) => setTo(e.target.value)} {...c} />}
            </FormField>
          </div>
          <FormField label={t("ac.quick.sections", { section: term("section") })} hint={t("ac.quick.sectionsHint")}>
            {(c) => <Input value={sections} onChange={(e) => setSections(e.target.value)} {...c} />}
          </FormField>
          {valid ? (
            <p className="text-sm text-muted-foreground">
              {t("ac.quick.preview", { classes: b - a + 1, sections: names.length, total: (b - a + 1) * names.length })}
            </p>
          ) : null}
          {progress ? (
            <p role="status" className="tabular text-sm font-medium text-navy">
              {progress.done} / {progress.total}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={run} disabled={!valid || busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("ac.quick.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
