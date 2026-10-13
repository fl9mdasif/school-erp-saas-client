import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TAuthUser, TMe, TTenantSummary } from "@/types";
import { authApi } from "../api/authApi";

export type TAuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "offline";

type TAuthState = {
  /** Kept in memory only. Never written to localStorage, a cookie or a URL. */
  accessToken: string | null;
  user: TAuthUser | null;
  tenant: TTenantSummary | null;
  status: TAuthStatus;
};

const initialState: TAuthState = {
  accessToken: null,
  user: null,
  tenant: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setMe: (state, action: PayloadAction<TMe>) => {
      state.user = action.payload.user;
      state.tenant = action.payload.tenant ?? null;
      state.status = "authenticated";
    },
    setAuthStatus: (state, action: PayloadAction<TAuthStatus>) => {
      state.status = action.payload;
    },
    /** Sign out: clears every trace of the session in memory. */
    clearSession: () => ({ ...initialState, status: "unauthenticated" as TAuthStatus }),
  },
  extraReducers: (builder) => {
    const store = (state: TAuthState, token: string, user?: TAuthUser) => {
      state.accessToken = token;
      if (user) state.user = user;
      state.status = "authenticated";
    };
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) =>
        store(state, payload.accessToken, payload.user)
      )
      .addMatcher(authApi.endpoints.platformLogin.matchFulfilled, (state, { payload }) =>
        store(state, payload.accessToken, payload.user)
      )
      .addMatcher(authApi.endpoints.registerInstitution.matchFulfilled, (state, { payload }) =>
        store(state, payload.accessToken)
      )
      .addMatcher(authApi.endpoints.changePassword.matchFulfilled, (state, { payload }) =>
        store(state, payload.accessToken)
      )
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.tenant = payload.tenant ?? null;
        state.status = "authenticated";
      });
  },
});

export const { setAccessToken, setMe, setAuthStatus, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
