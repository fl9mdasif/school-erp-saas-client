"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/helpers/axios/axiosInstance";
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
        clearSessionFlag();
        dispatch(setAuthStatus("unauthenticated"));
        return;
      }
      dispatch(setAccessToken(token));
      // getMe's fulfilled matcher stores the user and tenant and marks the session authenticated
      const result = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      if (!cancelled && "error" in result && result.error) {
        dispatch(setAuthStatus("unauthenticated"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, status]);

  return null;
}
