"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/useT";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label of the reason box, for example "Reason (kept in the audit log)". */
  reasonLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  /** Called with the trimmed reason (at least 3 characters). */
  onConfirm: (reason: string) => void | Promise<void>;
};

/** Irreversible or audited actions need a written reason before the confirm button works. */
export function ReasonDialog({ open, onOpenChange, title, description, reasonLabel, confirmLabel, destructive, loading, onConfirm }: Props) {
  const { t } = useT();
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 3;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("");
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
        <div className="space-y-1.5">
          <Label htmlFor="reason-box">{reasonLabel}</Label>
          <Textarea id="reason-box" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={!valid || loading} onClick={() => onConfirm(reason.trim())}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
