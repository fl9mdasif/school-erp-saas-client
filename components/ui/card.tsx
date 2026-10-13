import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("rounded-lg border border-border bg-card text-card-foreground", className)}
    {...props}
  />
);
export const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-1 p-4 md:p-5", className)} {...props} />
);
export const CardTitle = ({ className, ...props }: React.ComponentProps<"h3">) => (
  <h3 className={cn("text-base font-semibold leading-tight", className)} {...props} />
);
export const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
export const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("p-4 pt-0 md:p-5 md:pt-0", className)} {...props} />
);
export const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex items-center p-4 pt-0 md:p-5 md:pt-0", className)} {...props} />
);
