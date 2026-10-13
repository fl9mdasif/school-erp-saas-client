import type { TApiError } from "@/types";
import type { TKey } from "@/lib/i18n";
import { dictionary } from "@/lib/i18n";
import type { TVars } from "@/lib/i18n/useT";

type Translate = (key: TKey, vars?: TVars) => string;

/** RTK Query hands us the TApiError that axiosBaseQuery returned (status, code, message, details). */
export const isApiError = (e: unknown): e is TApiError =>
  !!e && typeof e === "object" && "code" in e && "status" in e;

export const getApiCode = (e: unknown): string => (isApiError(e) ? e.code : "UNKNOWN_ERROR");

/** One human sentence for any failure, in the user's language. */
export const getApiErrorMessage = (e: unknown, t: Translate): string => {
  if (!isApiError(e)) return t("error.UNKNOWN_ERROR");
  if (e.code === "RATE_LIMITED" && e.retryAfter) {
    return t("error.RATE_LIMITED_WAIT", { seconds: e.retryAfter });
  }
  const key = `error.${e.code}` as TKey;
  return key in dictionary.en ? t(key) : t("error.UNKNOWN_ERROR");
};

/** Field level errors from VALIDATION_ERROR details: { fieldPath: message }. */
export const getFieldErrors = (e: unknown): Record<string, string> => {
  if (!isApiError(e) || !Array.isArray(e.details)) return {};
  const out: Record<string, string> = {};
  for (const d of e.details as { path?: string; message?: string }[]) {
    if (d?.path && d.message && !out[d.path]) out[d.path] = d.message;
  }
  return out;
};

export const isForbidden = (e: unknown): boolean => isApiError(e) && e.status === 403;
export const isNotFound = (e: unknown): boolean => isApiError(e) && e.status === 404;
export const isPlanLimit = (e: unknown): boolean => isApiError(e) && e.code === "PLAN_LIMIT_REACHED";
