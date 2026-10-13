"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  /** Business date as YYYY-MM-DD (Asia/Dhaka). Empty string when not chosen. */
  value: string;
  onChange: (date: string) => void;
};

// The native date input gives phones their own picker and keeps the value a plain YYYY-MM-DD string,
// which is exactly what the API stores. No timezone conversion can shift the day.
export const DatePicker = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, ...props }, ref) => (
    <Input ref={ref} type="date" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  )
);
DatePicker.displayName = "DatePicker";
