import type { TPaged, TSite, TSiteInput, TStaffProfile, TStaffProfileInput } from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const websiteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSite: build.query<TSite, void>({
      query: () => ({ url: "/site", method: "GET" }),
      providesTags: [tagTypes.site],
    }),
    updateSite: build.mutation<TSite, TSiteInput>({
      query: (data) => ({ url: "/site", method: "PATCH", data }),
      invalidatesTags: [tagTypes.site],
    }),
    publishSite: build.mutation<TSite, void>({
      query: () => ({ url: "/site/publish", method: "POST" }),
      invalidatesTags: [tagTypes.site],
    }),
    unpublishSite: build.mutation<TSite, void>({
      query: () => ({ url: "/site/unpublish", method: "POST" }),
      invalidatesTags: [tagTypes.site],
    }),

    getStaffProfiles: build.query<TPaged<TStaffProfile>, void>({
      query: () => ({ url: "/staff-profiles", method: "GET", params: { limit: 100 } }),
      transformResponse: withMeta<TStaffProfile>,
      providesTags: [tagTypes.staffProfiles],
    }),
    createStaffProfile: build.mutation<TStaffProfile, TStaffProfileInput>({
      query: (data) => ({ url: "/staff-profiles", method: "POST", data }),
      invalidatesTags: [tagTypes.staffProfiles],
    }),
    updateStaffProfile: build.mutation<TStaffProfile, { id: string; data: Partial<TStaffProfileInput> }>({
      query: ({ id, data }) => ({ url: `/staff-profiles/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.staffProfiles],
    }),
    deleteStaffProfile: build.mutation<void, string>({
      query: (id) => ({ url: `/staff-profiles/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.staffProfiles],
    }),
  }),
});

export const {
  useGetSiteQuery,
  useUpdateSiteMutation,
  usePublishSiteMutation,
  useUnpublishSiteMutation,
  useGetStaffProfilesQuery,
  useCreateStaffProfileMutation,
  useUpdateStaffProfileMutation,
  useDeleteStaffProfileMutation,
} = websiteApi;
