import { BRAND_MARK, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const platformName = BRAND_NAME;

/** Logo mark and the product name, both from lib/brand.ts. */
export function Brand({
  compact = false,
  onLight = false,
  className,
}: {
  compact?: boolean;
  /** Navy text for use on a light header instead of white text on navy. */
  onLight?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-base font-bold text-white"
      >
        {BRAND_MARK}
      </span>
      {compact ? null : <span className={cn("truncate text-base font-semibold", onLight ? "text-navy" : "text-white")}>{platformName}</span>}
    </span>
  );
}
