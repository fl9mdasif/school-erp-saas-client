import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  loading?: boolean;
  tone?: "default" | "warning" | "success";
  className?: string;
};

const toneClass = {
  default: "bg-primary-tint text-primary-deep",
  warning: "bg-warning-tint text-warning-deep",
  success: "bg-success-tint text-success-deep",
};

export function StatCard({ label, value, hint, icon: Icon, loading, tone = "default", className }: Props) {
  return (
    <Card className={cn("flex items-start gap-3 p-4", className)}>
      {Icon ? (
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", toneClass[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-7 w-24" />
        ) : (
          <p className="tabular text-2xl font-semibold text-navy">{value}</p>
        )}
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  );
}
