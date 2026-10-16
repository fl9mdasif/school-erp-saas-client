import { cn } from "@/lib/utils";
import { ACCENT, type TAccent } from "./accents";
import type { TFeature } from "./featureData";

/** One feature. The featured card of an area is larger, tinted with a soft gradient, and spans two columns. */
export function FeatureCard({ feature, accent, lang, index }: { feature: TFeature; accent: TAccent; lang: "bn" | "en"; index: number }) {
  const a = ACCENT[accent];
  const Icon = feature.icon;
  return (
    <article
      style={{ "--mk-delay": `${Math.min(index, 8) * 60}ms` } as React.CSSProperties}
      className={cn(
        "mk-reveal group relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        "before:absolute before:inset-x-0 before:top-0 before:h-1",
        a.rule,
        a.glow,
        feature.featured ? cn("bg-gradient-to-br sm:col-span-2 sm:p-7", a.soft) : "bg-card"
      )}
    >
      <span
        className={cn(
          "mb-4 grid place-items-center rounded-xl transition-colors duration-200 group-hover:text-white",
          feature.featured ? "size-14" : "size-11",
          a.tint,
          a.text,
          a.hover
        )}
      >
        <Icon className={feature.featured ? "size-7" : "size-5"} aria-hidden="true" />
      </span>
      <h3 className={cn("font-semibold text-navy", feature.featured ? "text-xl" : "text-base")}>{feature.title[lang]}</h3>
      <p className={cn("mt-1.5 leading-relaxed text-muted-foreground", feature.featured ? "max-w-xl text-base" : "text-sm")}>{feature.body[lang]}</p>
    </article>
  );
}
