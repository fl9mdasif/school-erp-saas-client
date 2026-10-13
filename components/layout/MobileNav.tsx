"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMobileDrawer } from "@/redux/slices/uiSlice";
import { bottomNavItems, sidebarItems } from "@/utils/drawerItems";
import { Brand } from "./Brand";
import { NavList } from "./NavList";
import { AccountCard } from "./AccountCard";

/** Phone navigation: a drawer with everything, plus a bottom bar with the four most used destinations. */
export function MobileNav() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const role = useAppSelector((s) => s.auth.user?.role);
  const open = useAppSelector((s) => s.ui.mobileDrawerOpen);
  if (!role) return null;

  const bottom = bottomNavItems(role);
  const all = sidebarItems(role);
  const close = () => dispatch(setMobileDrawer(false));
  const isHere = (href: string, exact: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => dispatch(setMobileDrawer(o))}>
        <SheetContent closeLabel={t("common.close")}>
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <SheetTitle asChild>
              <span>
                <Brand />
              </span>
            </SheetTitle>
          </div>
          <nav aria-label={t("nav.menu")} className="flex-1 overflow-y-auto p-3">
            <NavList items={all} onNavigate={close} />
          </nav>
          <AccountCard />
          <div className="border-t border-sidebar-border p-3 sm:hidden">
            <LanguageToggle inverted />
          </div>
        </SheetContent>
      </Sheet>

      <nav
        aria-label={t("nav.menu")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {bottom.map((item) => {
          const Icon = item.icon;
          const href = item.children?.[0]?.href ?? item.href;
          const active = isHere(item.href, item.href === "/dashboard" || item.href === "/platform");
          return (
            <Link
              key={item.key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate px-1">{t(item.labelKey)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => dispatch(setMobileDrawer(true))}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
          {t("nav.more")}
        </button>
      </nav>
    </>
  );
}
