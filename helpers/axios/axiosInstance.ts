import { tokenStore } from "@/lib/tokenStore";
import type { ResponseSuccessType, TApiError } from "@/types";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "/api/v1";

const instance = axios.create();
instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;
// The refresh cookie is httpOnly and same origin (Next rewrites /api/v1 to the API)
instance.defaults.withCredentials = true;

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Only one refresh runs at a time; every request that hit a 401 waits for the same one.
let refreshing: Promise<string | null> | null = null;

/** True when the last refresh failed because the API could not be reached (down, offline, 5xx), not because the session ended. */
export let refreshUnreachable = false;

export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshing) {
    refreshing = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true, headers: { "X-Requested-With": "fetch" }, timeout: 10000 }
      )
      .then((res) => {
        refreshUnreachable = false;
        const token: string | undefined = res.data?.data?.accessToken;
        if (token) tokenStore.tokenRefreshed(token);
        return token ?? null;
      })
      .catch((err: AxiosError) => {
        // 401/403 means the session really ended; anything else means we could not ask
        const status = err.response?.status ?? 0;
        refreshUnreachable = status === 0 || status >= 500;
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    const accessToken = tokenStore.get();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  function (response) {
    // Binary downloads (PDF, CSV) are passed through untouched
    if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer") {
      return { data: response.data, meta: undefined } as ResponseSuccessType;
    }
    const responseObject: ResponseSuccessType = {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    return responseObject;
  },
  async function (error: AxiosError<{ code?: string; message?: string; details?: unknown }>) {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status ?? 0;
    const isAuthCall = config?.url?.includes("/auth/") ?? false;

    // Silent refresh once on 401, then retry the original request
    if (status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return instance(config);
      }
      tokenStore.sessionExpired();
    }

    const retryAfterHeader = error.response?.headers?.["retry-after"];
    const apiError: TApiError = {
      status: status || 500,
      code: error.response?.data?.code ?? (error.response ? "UNKNOWN_ERROR" : "NETWORK_ERROR"),
      message: error.response?.data?.message ?? error.message ?? "Something went wrong",
      details: error.response?.data?.details,
      retryAfter: retryAfterHeader ? Number(retryAfterHeader) : undefined,
    };
    return Promise.reject(apiError);
  }
);

export { instance };
