// Shapes of what the Express API sends. Success: { success: true, data, meta? }.
// Error: { success: false, code, message, details? }. Clients translate by `code`.

export type TMeta = {
  limit: number;
  page: number;
  total: number;
};

export type TApiErrorDetail = { path?: string; message: string };

export type TApiError = {
  status: number;
  code: string;
  message: string;
  details?: TApiErrorDetail[] | Record<string, unknown> | unknown;
  /** Seconds to wait when the server rate limited the request. */
  retryAfter?: number;
};

/** A paginated list: rows plus the meta the server sent. */
export type TPaged<T> = { rows: T[]; meta: TMeta };

export type ResponseSuccessType = {
  data: unknown;
  meta?: TMeta;
};
