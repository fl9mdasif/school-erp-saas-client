import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        highlight: "bg-highlight text-white hover:opacity-90",
        outline: "border border-input bg-card text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "min-h-0 px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        sm: "min-h-9 px-3 text-sm",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
