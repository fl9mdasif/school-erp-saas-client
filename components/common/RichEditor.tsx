"use client";

import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";
import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";

type Props = {
  /** Initial HTML. Later changes to this prop are ignored: the editor owns its content once mounted. */
  initialHtml: string;
  onChange: (html: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const COMMANDS = [
  { cmd: "bold", icon: Bold, label: "edit.bold" },
  { cmd: "italic", icon: Italic, label: "edit.italic" },
  { cmd: "insertUnorderedList", icon: List, label: "edit.bullets" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "edit.numbers" },
] as const;

/**
 * A small editor for notice text: bold, italic, lists and links. The browser's editing commands
 * produce the markup; the server and the viewer both sanitize it, so nothing here is trusted.
 */
export function RichEditor({ initialHtml, onChange, id, ...aria }: Props) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // set once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    onChange(ref.current?.innerHTML ?? "");
  };

  const link = () => {
    const url = window.prompt(t("edit.linkPrompt"), "https://");
    if (url && /^(https?:\/\/|mailto:|tel:)/i.test(url)) run("createLink", url);
  };

  const btn = "grid size-11 place-items-center rounded-md text-navy hover:bg-accent";

  return (
    <div className="rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
      <div role="toolbar" aria-label={t("edit.toolbar")} className="flex gap-1 border-b border-border p-1">
        {COMMANDS.map(({ cmd, icon: Icon, label }) => (
          <button key={cmd} type="button" className={btn} aria-label={t(label)} onMouseDown={(e) => e.preventDefault()} onClick={() => run(cmd)}>
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
        <button type="button" className={btn} aria-label={t("edit.link")} onMouseDown={(e) => e.preventDefault()} onClick={link}>
          <Link2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div
        ref={ref}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-label={t("edit.body")}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className={cn("min-h-40 space-y-2 p-3 text-sm outline-none [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5")}
        {...aria}
      />
    </div>
  );
}
