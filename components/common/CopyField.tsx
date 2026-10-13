"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";

/** Shows a value with a copy button. Used for temporary passwords (shown once, never stored). */
export function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("common.copied"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("error.UNKNOWN_ERROR"));
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3">
        <code className="tabular min-w-0 flex-1 break-all py-2 text-base font-semibold text-navy">{value}</code>
        <Button type="button" variant="ghost" size="icon" onClick={copy} aria-label={t("common.copy")}>
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}
