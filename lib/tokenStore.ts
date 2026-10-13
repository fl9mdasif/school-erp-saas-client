// The access token is kept in memory only. axios reads it from here so that the HTTP layer
// does not have to import the Redux store (which would be a circular import).
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  setHandlers: (handlers: {
    onSessionExpired: () => void;
    onTokenRefreshed: (token: string) => void;
  }) => {
    onSessionExpired = handlers.onSessionExpired;
    onTokenRefreshed = handlers.onTokenRefreshed;
  },
  sessionExpired: () => onSessionExpired?.(),
  tokenRefreshed: (token: string) => onTokenRefreshed?.(token),
};
