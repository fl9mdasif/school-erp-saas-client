"use client";

import { Menu } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useT } from "@/lib/i18n/useT";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMobileDrawer } from "@/redux/slices/uiSlice";
import { Brand } from "./Brand";
import { UserMenu } from "./UserMenu";

/** Institution name on the left, language and user menu on the right. The session switcher is added with the Academic module. */
export function Topbar({ children }: { children?: React.ReactNode }) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const tenant = useAppSelector((s) => s.auth.tenant);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-3 md:px-6">
      <button
        type="button"
        onClick={() => dispatch(setMobileDrawer(true))}
        aria-label={t("nav.menu")}
        className="grid size-11 place-items-center rounded-md text-navy hover:bg-accent md:hidden"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="rounded-lg bg-navy p-1 md:hidden">
          <Brand compact />
        </span>
        <p className="truncate text-base font-semibold text-navy">{tenant?.name ?? t("common.appName")}</p>
      </div>

      {children}
      <LanguageToggle className="hidden sm:inline-flex" />
      <UserMenu />
    </header>
  );
}
