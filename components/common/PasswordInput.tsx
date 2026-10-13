"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/useT";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<React.ComponentProps<typeof Input>, "type">>(
  ({ className, ...props }, ref) => {
    const { t } = useT();
    const [shown, setShown] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={shown ? "text" : "password"} className={`pr-12 ${className ?? ""}`} {...props} />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? t("common.hidePassword") : t("common.showPassword")}
          aria-pressed={shown}
          className="absolute right-0 top-0 grid size-11 place-items-center text-muted-foreground hover:text-foreground"
        >
          {shown ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
