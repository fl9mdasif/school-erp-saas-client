import type { TCollectionReport, TDuesResult, TMeta } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const feeReportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDues: build.query<TDuesResult & { meta: TMeta }, Record<string, unknown>>({
      query: (params) => ({ url: "/fees/dues", method: "GET", params: { ...params, format: "json" } }),
      transformResponse: (response: TDuesResult, meta) => ({
        ...response,
        meta: (meta as TMeta) ?? { page: 1, limit: response.rows.length, total: response.rows.length },
      }),
      providesTags: [tagTypes.dues],
    }),
    getCollectionReport: build.query<TCollectionReport, { from: string; to: string; groupBy: string }>({
      query: (params) => ({ url: "/fees/reports/collection", method: "GET", params: { ...params, format: "json" } }),
      providesTags: [tagTypes.feeReports],
    }),
  }),
});

export const { useGetDuesQuery, useGetCollectionReportQuery } = feeReportApi;
