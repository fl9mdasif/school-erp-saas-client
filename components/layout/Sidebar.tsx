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
 * Navy sidebar. 1024 px and up: full width, collapsible to icons. 768 to 1023 px: icons only.
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
        "sticky top-0 hidden h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex md:w-[4.5rem]",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-64"
      )}
    >
      <div className={cn("flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4", collapsed && "lg:justify-center lg:px-0")}>
        <span className="lg:hidden">
          <Brand compact />
        </span>
        {/* on desktop the brand is hidden when collapsed so the expand icon takes its place at the top */}
        <span className={cn("hidden min-w-0 lg:block", collapsed && "lg:hidden")}>
          <Brand />
        </span>
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!collapsed}
          className="hidden size-11 shrink-0 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:grid"
        >
          {collapsed ? <ChevronsRight className="size-5" aria-hidden="true" /> : <ChevronsLeft className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <nav aria-label={t("nav.menu")} className="flex-1 overflow-y-auto p-3">
        {/* icons only on tablet, and on desktop when collapsed */}
        <div className="lg:hidden">
          <NavList items={items} compact />
        </div>
        <div className="hidden lg:block">
          <NavList items={items} compact={collapsed} />
        </div>
      </nav>

      <div className="lg:hidden">
        <AccountCard compact />
      </div>
      <div className="hidden lg:block">
        <AccountCard compact={collapsed} />
      </div>

    </aside>
  );
}
