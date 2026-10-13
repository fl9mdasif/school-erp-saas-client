"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  delay?: number;
};

/** Search box that waits for the typing to pause before it tells the page. */
export function SearchInput({ value, onChange, placeholder, className, delay = 300 }: Props) {
  const [text, setText] = useState(value);
  const last = useRef(value);

  // follow outside changes such as "clear filters"
  useEffect(() => {
    if (value !== last.current) {
      setText(value);
      last.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (text === last.current) return;
    const timer = setTimeout(() => {
      last.current = text;
      onChange(text.trim());
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay, onChange]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        autoComplete="off"
      />
    </div>
  );
}
