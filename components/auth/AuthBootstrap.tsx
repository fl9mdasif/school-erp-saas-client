"use client";

import { useEffect, useRef } from "react";
import { refreshAccessToken, refreshUnreachable } from "@/helpers/axios/axiosInstance";
import { authApi } from "@/redux/api/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { clearSessionFlag } from "@/lib/sessionFlag";
import { setAccessToken, setAuthStatus } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";

/** Module-level so a retry click and a fresh mount can never race each other. */
let inFlight = false;

/**
 * One silent refresh, used on mount and by the "try again" button. Never depends on redux
 * `status`: dispatching "loading" here must not be able to cancel the run it belongs to.
 */
export async function runAuthBootstrap(dispatch: AppDispatch) {
  if (inFlight) return;
  inFlight = true;
  dispatch(setAuthStatus("loading"));
  try {
    const token = await refreshAccessToken();
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
    if ("error" in result && result.error) {
      const code = (result.error as { status?: number }).status ?? 0;
      // A dead or restarting API is not a sign-out
      dispatch(setAuthStatus(code === 0 || code >= 500 ? "offline" : "unauthenticated"));
    }
  } finally {
    inFlight = false;
  }
}

/**
 * On a full page load the in-memory token is gone. If the browser still holds the httpOnly refresh
 * cookie, one silent refresh restores the session; otherwise the visitor is signed out.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void runAuthBootstrap(dispatch);
  }, [dispatch]);

  return null;
}
