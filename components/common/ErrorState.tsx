"use client";

import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, isForbidden, isPlanLimit } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";

type Props = {
  /** The error object RTK Query returned (a TApiError), or any unknown failure. */
  error?: unknown;
  onRetry?: () => void;
};

/** Error and forbidden states for any data view. Plan limits add the upgrade note. */
export function ErrorState({ error, onRetry }: Props) {
  const { t } = useT();
  const forbidden = isForbidden(error);
  const Icon = forbidden ? Lock : AlertTriangle;
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-12 text-center"
    >
      <span
        className={`grid size-12 place-items-center rounded-full ${
          forbidden ? "bg-muted text-muted-foreground" : "bg-destructive-tint text-destructive-deep"
        }`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-navy">
        {forbidden ? t("common.forbidden.title") : t("common.somethingWrong")}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {forbidden ? t("common.forbidden.body") : getApiErrorMessage(error, t)}
        {isPlanLimit(error) ? ` ${t("common.planLimit.upgrade")}` : ""}
      </p>
      {onRetry && !forbidden ? (
        <Button variant="outline" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}
