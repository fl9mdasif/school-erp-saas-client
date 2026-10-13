import type { TDashboardSummary } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<TDashboardSummary, void>({
      query: () => ({
        url: "/dashboard/summary",
        method: "GET",
      }),
      providesTags: [tagTypes.dashboard],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
