import type { TAuditLog, TPaged } from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<TPaged<TAuditLog>, Record<string, unknown>>({
      query: (params) => ({ url: "/audit-logs", method: "GET", params }),
      transformResponse: withMeta<TAuditLog>,
      providesTags: [tagTypes.auditLogs],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
