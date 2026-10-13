import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentActivities: builder.query({
      query: () => ({
        url: "/activities",
        method: "GET",
      }),
      providesTags: [tagTypes.orders, tagTypes.products], // Refresh when orders or products change
    }),
  }),
});

export const { useGetRecentActivitiesQuery } = activityApi;
