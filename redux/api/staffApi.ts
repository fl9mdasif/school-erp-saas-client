import type { TPaged, TStaff, TStaffCreated, TStaffInput } from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<TPaged<TStaff>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/users", method: "GET", params: params ?? {} }),
      transformResponse: withMeta<TStaff>,
      providesTags: [tagTypes.users],
    }),
    createStaff: build.mutation<TStaffCreated, TStaffInput>({
      query: (data) => ({ url: "/users", method: "POST", data }),
      invalidatesTags: [tagTypes.users, tagTypes.dashboard],
    }),
    updateStaff: build.mutation<TStaff, { id: string; data: Partial<Omit<TStaffInput, "password">> }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.users],
    }),
    setStaffStatus: build.mutation<TStaff, { id: string; status: "active" | "inactive" }>({
      query: ({ id, status }) => ({ url: `/users/${id}/status`, method: "PATCH", data: { status } }),
      invalidatesTags: [tagTypes.users, tagTypes.dashboard],
    }),
    resetStaffPassword: build.mutation<{ temporaryPassword: string }, string>({
      query: (id) => ({ url: `/users/${id}/reset-password`, method: "POST" }),
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useSetStaffStatusMutation,
  useResetStaffPasswordMutation,
} = staffApi;
