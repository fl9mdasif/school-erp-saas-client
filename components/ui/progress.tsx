import { cn } from "@/lib/utils";

export const Progress = ({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  label: string;
}) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
    className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
  >
    <div
      className="h-full rounded-full bg-primary transition-[width] duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
