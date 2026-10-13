"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/utils/drawerItems";
import { Brand } from "./Brand";
import { NavList } from "./NavList";

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
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "lg:justify-center lg:px-0")}>
        <span className="lg:hidden">
          <Brand compact />
        </span>
        <span className="hidden lg:block">
          <Brand compact={collapsed} />
        </span>
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

      <div className="hidden border-t border-sidebar-border p-3 lg:block">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
          {collapsed ? null : <span>{t("nav.collapse")}</span>}
        </button>
      </div>
    </aside>
  );
}
