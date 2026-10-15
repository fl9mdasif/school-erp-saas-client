import type { TSchoolProfile, TSchoolProfileInput, TSchoolSettingsInput, TSchoolUsage } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSchoolProfile: build.query<TSchoolProfile, void>({
      query: () => ({ url: "/school/profile", method: "GET" }),
      providesTags: [tagTypes.school],
    }),
    updateSchoolProfile: build.mutation<TSchoolProfile, TSchoolProfileInput>({
      query: (data) => ({ url: "/school/profile", method: "PATCH", data }),
      invalidatesTags: [tagTypes.school, tagTypes.me],
    }),
    updateSchoolSettings: build.mutation<TSchoolProfile["settings"], TSchoolSettingsInput>({
      query: (data) => ({ url: "/school/settings", method: "PATCH", data }),
      invalidatesTags: [tagTypes.school, tagTypes.me],
    }),
    getSchoolUsage: build.query<TSchoolUsage, void>({
      query: () => ({ url: "/school/usage", method: "GET" }),
      providesTags: [tagTypes.school],
    }),
  }),
});

export const { useGetSchoolProfileQuery, useUpdateSchoolProfileMutation, useUpdateSchoolSettingsMutation, useGetSchoolUsageQuery } = settingsApi;
