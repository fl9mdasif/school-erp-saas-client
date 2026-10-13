"use client";

import { useT } from "@/lib/i18n/useT";
import { useAppDispatch } from "@/redux/hooks";
import { setLanguage } from "@/redux/slices/uiSlice";
import { cn } from "@/lib/utils";

/** বাংলা / English switch. A segmented control so both choices are always visible. */
export function LanguageToggle({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const dispatch = useAppDispatch();
  const { t, lang } = useT();

  const option = (value: "bn" | "en", label: string) => (
    <button
      type="button"
      lang={value}
      aria-pressed={lang === value}
      onClick={() => dispatch(setLanguage(value))}
      className={cn(
        "min-h-9 rounded-md px-3 text-sm font-medium transition-colors duration-200",
        lang === value
          ? inverted
            ? "bg-white text-navy"
            : "bg-primary text-primary-foreground"
          : inverted
            ? "text-sidebar-foreground hover:bg-sidebar-accent"
            : "text-foreground hover:bg-accent"
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={cn(
        "inline-flex gap-1 rounded-lg border p-1",
        inverted ? "border-sidebar-border" : "border-border bg-card",
        className
      )}
    >
      {option("bn", t("common.bangla"))}
      {option("en", t("common.english"))}
    </div>
  );
}
