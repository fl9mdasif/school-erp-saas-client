"use client";

import { cn } from "@/lib/utils";
import { useReveal } from "./useReveal";

/** A grid whose .mk-reveal children fade up (staggered) once the grid scrolls into view. */
export function RevealGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
