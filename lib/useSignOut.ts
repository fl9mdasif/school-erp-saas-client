"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { USER_ROLE } from "@/contains/role";
import { clearSessionFlag } from "@/lib/sessionFlag";
import { baseApi } from "@/redux/api/baseApi";
import { useLogoutMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSession } from "@/redux/slices/authSlice";

/** One sign-out for every place that offers it: the user menu, the sidebar, the drawer and the site header. */
export function useSignOut() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const [logout] = useLogoutMutation();

  return useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      /* even if the call fails the local session must end */
    }
    // clear every trace of the session: token, user, cached server data, flag cookie
    clearSessionFlag();
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace(role === USER_ROLE.SUPER_ADMIN ? "/platform/login" : "/login");
  }, [logout, dispatch, router, role]);
}
