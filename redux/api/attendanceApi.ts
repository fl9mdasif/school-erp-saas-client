import type { TSectionReport, TSheet, TSubmitSheetInput, TTakeableSection } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTakeableSections: build.query<TTakeableSection[], void>({
      query: () => ({ url: "/attendance/sections", method: "GET" }),
      providesTags: [tagTypes.attendance],
    }),
    getSheet: build.query<TSheet, { sectionId: string; date: string }>({
      query: (params) => ({ url: "/attendance/sheet", method: "GET", params }),
      providesTags: [tagTypes.attendance],
    }),
    submitSheet: build.mutation<{ existing: boolean; sheet: { _id: string } }, TSubmitSheetInput>({
      query: (data) => ({ url: "/attendance", method: "POST", data }),
      invalidatesTags: [tagTypes.attendance, tagTypes.dashboard],
    }),
    editSheet: build.mutation<unknown, { id: string; records: TSubmitSheetInput["records"] }>({
      query: ({ id, records }) => ({ url: `/attendance/${id}`, method: "PATCH", data: { records } }),
      invalidatesTags: [tagTypes.attendance, tagTypes.dashboard],
    }),
    getSectionReport: build.query<TSectionReport, { sectionId: string; from: string; to: string }>({
      query: (params) => ({ url: "/attendance/report/section", method: "GET", params }),
      providesTags: [tagTypes.attendance],
    }),
  }),
});

export const {
  useGetTakeableSectionsQuery,
  useGetSheetQuery,
  useSubmitSheetMutation,
  useEditSheetMutation,
  useGetSectionReportQuery,
} = attendanceApi;
