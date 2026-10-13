import { AlertTriangle, Check, CircleSlash, Clock, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type TTone = "success" | "destructive" | "warning" | "info" | "default" | "muted";

const ICON = {
  success: Check,
  destructive: X,
  warning: AlertTriangle,
  info: Info,
  default: Clock,
  muted: CircleSlash,
};

// A chip always shows a word AND an icon, so status is never conveyed by colour alone.
export function StatusChip({ tone, children }: { tone: TTone; children: React.ReactNode }) {
  const Icon = ICON[tone];
  return (
    <Badge variant={tone}>
      <Icon className="size-3" aria-hidden="true" />
      {children}
    </Badge>
  );
}
