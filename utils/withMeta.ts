import type { TMeta, TPaged } from "@/types";

// axiosBaseQuery returns { data, meta }. RTK Query hands `meta` only to transformResponse,
// so list endpoints use this to keep the pagination info next to the rows:
//   transformResponse: withMeta
export const withMeta = <T>(response: T[], meta: unknown): TPaged<T> => ({
  rows: response,
  meta: (meta as TMeta) ?? { page: 1, limit: response.length, total: response.length },
});
