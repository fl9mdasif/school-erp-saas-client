import type { TMyFees, TStudent, TStudentResult } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const portalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyStudents: build.query<TStudent[], void>({
      query: () => ({ url: "/me/students", method: "GET" }),
      providesTags: [tagTypes.students],
    }),
    getMyFees: build.query<TMyFees, void>({
      query: () => ({ url: "/me/fees", method: "GET" }),
      providesTags: [tagTypes.invoices, tagTypes.payments],
    }),
    getMyResults: build.query<TStudentResult[], void>({
      query: () => ({ url: "/me/results", method: "GET" }),
      providesTags: [tagTypes.results],
    }),
  }),
});

export const { useGetMyStudentsQuery, useGetMyFeesQuery, useGetMyResultsQuery } = portalApi;
