"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ALLOWED = {
  ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a", "h3", "blockquote"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

/**
 * Shows notice text that may contain basic formatting. The server already sanitizes on save; this
 * sanitizes again in the browser. DOMPurify needs a DOM, so nothing is rendered until mounted
 * (on the server it would pass the input through untouched).
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  const [safe, setSafe] = useState<string | null>(null);

  useEffect(() => {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    setSafe(DOMPurify.sanitize(html, ALLOWED));
    return () => {
      DOMPurify.removeHook("afterSanitizeAttributes");
    };
  }, [html]);

  if (safe === null) return null;
  return (
    <div
      className={cn("space-y-2 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
