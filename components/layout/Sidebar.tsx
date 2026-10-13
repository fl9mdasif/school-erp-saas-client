"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/utils/drawerItems";
import { Brand } from "./Brand";
import { NavList } from "./NavList";
import { AccountCard } from "./AccountCard";

/**
 * Navy sidebar from 768 px up: full width, or collapsed to icons with the toggle in the header.
 * The toggle is always the top-most control, so it stays reachable in both states.
 * Phones do not show it (they use the drawer and the bottom navigation).
 */
export function Sidebar() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  if (!role) return null;
  const items = sidebarItems(role);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "md:w-[4.5rem]" : "md:w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "justify-between px-4"
        )}
      >
        {collapsed ? null : <Brand />}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!collapsed}
          className="grid size-11 shrink-0 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronsRight className="size-5" aria-hidden="true" /> : <ChevronsLeft className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <nav aria-label={t("nav.menu")} className="flex-1 overflow-y-auto p-3">
        <NavList items={items} compact={collapsed} />
      </nav>

      <AccountCard compact={collapsed} />
    </aside>
  );
}
