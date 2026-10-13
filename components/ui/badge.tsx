import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Chips always carry a word, never colour alone.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary-tint text-primary-deep",
        success: "bg-success-tint text-success-deep",
        destructive: "bg-destructive-tint text-destructive-deep",
        warning: "bg-warning-tint text-warning-deep",
        info: "bg-info-tint text-info-deep",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
