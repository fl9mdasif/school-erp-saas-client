"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  /** Message already translated. Shown under the field and announced to screen readers. */
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Render prop gives the control the id and aria wiring it needs. */
  children: (control: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
};

/** Visible label, hint and error tied to the control. Never a placeholder-only label. */
export function FormField({ label, error, hint, required, className, children }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive" aria-hidden="true">*</span> : null}
      </Label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
