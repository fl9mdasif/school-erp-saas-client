import { configureStore } from "@reduxjs/toolkit";
import { clearSessionFlag, setSessionFlag } from "@/lib/sessionFlag";
import { tokenStore } from "@/lib/tokenStore";
import { baseApi } from "./api/baseApi";
import { reducer } from "./rootReducer";
import { clearSession, setAccessToken } from "./slices/authSlice";

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Keep the in-memory token holder (used by axios) and the non-secret session flag cookie
// (read by proxy.ts) in step with the store
let hadToken = false;
store.subscribe(() => {
  const token = store.getState().auth.accessToken;
  tokenStore.set(token);
  if (token && !hadToken) setSessionFlag();
  if (!token && hadToken) clearSessionFlag();
  hadToken = !!token;
});

// A silent refresh updates the token; a failed refresh ends the session and drops cached data
tokenStore.setHandlers({
  onTokenRefreshed: (token) => store.dispatch(setAccessToken(token)),
  onSessionExpired: () => {
    clearSessionFlag();
    store.dispatch(clearSession());
    store.dispatch(baseApi.util.resetApiState());
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
