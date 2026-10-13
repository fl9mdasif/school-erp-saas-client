"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import type { TNavItem } from "@/utils/drawerItems";

const isActive = (pathname: string, href: string, exact = false) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

type Props = {
  items: TNavItem[];
  /** Icon-only layout (collapsed desktop sidebar and tablet). */
  compact?: boolean;
  onNavigate?: () => void;
};

/** The list of sidebar links for a role. Groups open and close; compact mode shows icons only. */
export function NavList({ items, compact = false, onNavigate }: Props) {
  const pathname = usePathname();
  const { t } = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = !!item.children?.length;
        const childActive = hasChildren && item.children!.some((c) => isActive(pathname, c.href));
        const active = hasChildren ? childActive : isActive(pathname, item.href, item.href === "/dashboard" || item.href === "/platform");
        const expanded = open[item.key] ?? childActive;
        const label = t(item.labelKey);

        const base =
          "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-200";
        const state = active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

        if (hasChildren && !compact) {
          return (
            <li key={item.key}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen((o) => ({ ...o, [item.key]: !expanded }))}
                className={cn(base, state)}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">{label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
                />
              </button>
              {expanded ? (
                <ul className="mt-1 space-y-0.5 border-l border-sidebar-border pl-3 ml-5">
                  {item.children!.map((c) => (
                    <li key={c.key}>
                      <Link
                        href={c.href}
                        onClick={onNavigate}
                        aria-current={isActive(pathname, c.href) ? "page" : undefined}
                        className={cn(
                          "flex min-h-10 items-center rounded-md px-3 text-sm transition-colors duration-200",
                          isActive(pathname, c.href)
                            ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                            : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {t(c.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        }

        // single link, or a group collapsed to its icon (goes to the first sub-page)
        const href = hasChildren ? item.children![0].href : item.href;
        return (
          <li key={item.key}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={compact ? label : undefined}
              title={compact ? label : undefined}
              className={cn(base, state, compact && "justify-center px-0")}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {compact ? <span className="sr-only">{label}</span> : <span>{label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
