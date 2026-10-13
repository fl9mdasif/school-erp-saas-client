"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/useT";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
  /** Strong confirm: the button stays disabled until the user types exactly this text. */
  typedConfirmText?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading,
  destructive,
  typedConfirmText,
}: Props) {
  const { t } = useT();
  const [typed, setTyped] = useState("");
  const blocked = !!typedConfirmText && typed.trim() !== typedConfirmText;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
        {typedConfirmText ? (
          <label className="space-y-1.5 text-sm">
            <span>{t("common.typeToConfirm", { text: typedConfirmText })}</span>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </label>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={blocked || loading}
            onClick={() => onConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
