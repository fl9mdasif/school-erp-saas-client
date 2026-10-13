"use client";

import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { poishaToTakaInput, takaToPoisha } from "@/lib/format";

type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  /** Integer poisha, or null when empty. */
  value: number | null;
  onChange: (poisha: number | null) => void;
};

/** Taka in, poisha out. The user types 1250.50 and the form holds 125050. */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, className, ...props }, ref) => {
    const [text, setText] = useState(value === null ? "" : poishaToTakaInput(value));

    // follow outside changes (form reset, loaded data) without fighting the user's typing
    useEffect(() => {
      if (value === null) {
        if (takaToPoisha(text) !== null) setText("");
      } else if (takaToPoisha(text) !== value) {
        setText(poishaToTakaInput(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          ৳
        </span>
        <Input
          ref={ref}
          inputMode="decimal"
          autoComplete="off"
          className={`tabular pl-8 ${className ?? ""}`}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            if (next !== "" && !/^[\d,]*\.?\d{0,2}$/.test(next)) return; // ignore characters that can never be money
            setText(next);
            onChange(next === "" ? null : takaToPoisha(next));
          }}
          {...props}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";
