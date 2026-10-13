import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
  <div className="relative w-full overflow-x-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);
export const TableHeader = ({ className, ...props }: React.ComponentProps<"thead">) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
);
export const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
export const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr
    className={cn(
      "border-b border-border transition-colors hover:bg-muted/60 data-[state=selected]:bg-primary-tint",
      className
    )}
    {...props}
  />
);
export const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "h-11 whitespace-nowrap px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
);
export const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td className={cn("tabular px-3 py-3 align-middle", className)} {...props} />
);
