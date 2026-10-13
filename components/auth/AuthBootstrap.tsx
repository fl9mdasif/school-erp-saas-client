"use client";

import { useEffect } from "react";
import { refreshAccessToken, refreshUnreachable } from "@/helpers/axios/axiosInstance";
import { authApi } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSessionFlag } from "@/lib/sessionFlag";
import { setAccessToken, setAuthStatus } from "@/redux/slices/authSlice";

/**
 * On a full page load the in-memory token is gone. If the browser still holds the httpOnly refresh
 * cookie, one silent refresh restores the session; otherwise the visitor is signed out.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    if (status !== "idle") return;
    let cancelled = false;
    dispatch(setAuthStatus("loading"));
    (async () => {
      const token = await refreshAccessToken();
      if (cancelled) return;
      if (!token) {
        // The API being down is not a sign-out: keep the flag and let the visitor retry
        if (refreshUnreachable) {
          dispatch(setAuthStatus("offline"));
          return;
        }
        clearSessionFlag();
        dispatch(setAuthStatus("unauthenticated"));
        return;
      }
      dispatch(setAccessToken(token));
      // getMe's fulfilled matcher stores the user and tenant and marks the session authenticated
      const result = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      if (!cancelled && "error" in result && result.error) {
        const code = (result.error as { status?: number }).status ?? 0;
        // A dead or restarting API is not a sign-out
        dispatch(setAuthStatus(code === 0 || code >= 500 ? "offline" : "unauthenticated"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, status]);

  return null;
}
