"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { roleHome } from "@/lib/permissions";
import { authApi } from "@/redux/api/authApi";
import { useAppDispatch } from "@/redux/hooks";

/**
 * After a login or signup the token is in the store, but the user and the school summary (name,
 * terminology, plan flags) come from /auth/me. Load them, then go to the role's home page.
 */
export function useStartSession() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(
    async (opts: { fallback?: string } = {}) => {
      const result = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      const role = result.data?.user.role;
      const user = result.data?.user;
      if (user?.mustChangePassword) return router.replace("/change-password");
      router.replace(role ? roleHome(role) : (opts.fallback ?? "/dashboard"));
    },
    [dispatch, router]
  );
}
