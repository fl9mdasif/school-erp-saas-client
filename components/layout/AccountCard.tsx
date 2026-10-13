"use client";

import { LogOut } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useSignOut } from "@/lib/useSignOut";
import { useAppSelector } from "@/redux/hooks";
import { cn } from "@/lib/utils";

/**
 * Who is signed in and to which school, with the sign-out button. Sits at the bottom of the
 * sidebar and the phone drawer. `compact` keeps just the avatar and the button (icon rail).
 */
export function AccountCard({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const user = useAppSelector((s) => s.auth.user);
  const tenant = useAppSelector((s) => s.auth.tenant);
  const signOut = useSignOut();
  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const school = tenant?.name ?? t("common.appName");

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className={cn("flex items-center gap-3 rounded-md px-1 py-2", compact && "justify-center px-0")}>
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
          {initial}
        </span>
        {compact ? null : (
          <span className="min-w-0 text-sm leading-tight">
            <span className="block truncate font-semibold text-sidebar-foreground">{user.name}</span>
            <span className="block truncate text-xs text-sidebar-muted">{t(`role.${user.role}`)}</span>
            <span className="block truncate text-xs text-sidebar-muted">{school}</span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label={t("nav.signOut")}
        className={cn(
          "mt-1 flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          compact && "justify-center px-0"
        )}
      >
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        {compact ? null : <span>{t("nav.signOut")}</span>}
      </button>
    </div>
  );
}
