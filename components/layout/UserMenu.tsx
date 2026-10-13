"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { USER_ROLE } from "@/contains/role";
import { clearSessionFlag } from "@/lib/sessionFlag";
import { useT } from "@/lib/i18n/useT";
import { baseApi } from "@/redux/api/baseApi";
import { useLogoutMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSession } from "@/redux/slices/authSlice";

export function UserMenu() {
  const { t } = useT();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();
  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  const signOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      /* even if the call fails the local session must end */
    }
    // clear every trace of the session: token, user, cached server data, flag cookie
    clearSessionFlag();
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace(user.role === USER_ROLE.SUPER_ADMIN ? "/platform/login" : "/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={user.name}
          className="grid size-11 place-items-center rounded-full bg-primary-tint text-sm font-semibold text-primary-deep outline-offset-2"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block capitalize">{user.role}</span>
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
