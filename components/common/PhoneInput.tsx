"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

/** Bangladesh mobile number. Digits only on screen; validation happens in the form schema. */
export const PhoneInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ onChange, ...props }, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="01XXXXXXXXX"
      maxLength={14}
      onChange={(e) => {
        e.target.value = e.target.value.replace(/[^\d+]/g, "");
        onChange?.(e);
      }}
      {...props}
    />
  )
);
PhoneInput.displayName = "PhoneInput";
