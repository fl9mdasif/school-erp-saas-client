import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Logo and the product name, both from lib/brand.ts and public/logo.svg. */
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" width={36} height={36} className="size-9 shrink-0 rounded-lg" />
      {compact ? null : <span className={cn("truncate text-base font-semibold", onLight ? "text-navy" : "text-white")}>{BRAND_NAME}</span>}
    </span>
  );
}
