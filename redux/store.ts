import { configureStore } from "@reduxjs/toolkit";
import { tokenStore } from "@/lib/tokenStore";
import { baseApi } from "./api/baseApi";
import { reducer } from "./rootReducer";
import { clearSession, setAccessToken } from "./slices/authSlice";

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Keep the in-memory token holder (used by axios) in step with the store
store.subscribe(() => {
  tokenStore.set(store.getState().auth.accessToken);
});

// A silent refresh updates the token; a failed refresh ends the session and drops cached data
tokenStore.setHandlers({
  onTokenRefreshed: (token) => store.dispatch(setAccessToken(token)),
  onSessionExpired: () => {
    store.dispatch(clearSession());
    store.dispatch(baseApi.util.resetApiState());
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
