"use client";

import { LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n/useT";
import { useSignOut } from "@/lib/useSignOut";
import { useAppSelector } from "@/redux/hooks";

export function UserMenu() {
  const { t } = useT();
  const user = useAppSelector((s) => s.auth.user);
  const tenant = useAppSelector((s) => s.auth.tenant);
  const signOut = useSignOut();
  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.signedInAs", { name: user.name })}
          className="grid size-11 place-items-center rounded-full bg-primary-tint text-sm font-semibold text-primary-deep outline-offset-2"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block">{t(`role.${user.role}`)}</span>
          {tenant ? <span className="block">{tenant.name}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut aria-hidden="true" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
