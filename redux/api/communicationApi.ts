import type { TInquiry, TInquiryStatus, TNotice, TNoticeInput, TPaged } from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const communicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Notices
    getNotices: build.query<TPaged<TNotice>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/notices", method: "GET", params: params ?? {} }),
      transformResponse: withMeta<TNotice>,
      providesTags: [tagTypes.notices],
    }),
    getNotice: build.query<TNotice, string>({
      query: (id) => ({ url: `/notices/${id}`, method: "GET" }),
      providesTags: [tagTypes.notices],
    }),
    createNotice: build.mutation<TNotice, TNoticeInput>({
      query: (data) => ({ url: "/notices", method: "POST", data }),
      invalidatesTags: [tagTypes.notices, tagTypes.dashboard],
    }),
    updateNotice: build.mutation<TNotice, { id: string; data: Partial<TNoticeInput> }>({
      query: ({ id, data }) => ({ url: `/notices/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.notices, tagTypes.dashboard],
    }),
    deleteNotice: build.mutation<unknown, string>({
      query: (id) => ({ url: `/notices/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.notices, tagTypes.dashboard],
    }),

    // Inquiries from the public site
    getInquiries: build.query<TPaged<TInquiry>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/inquiries", method: "GET", params: params ?? {} }),
      transformResponse: withMeta<TInquiry>,
      providesTags: [tagTypes.inquiries],
    }),
    setInquiryStatus: build.mutation<TInquiry, { id: string; status: TInquiryStatus }>({
      query: ({ id, status }) => ({ url: `/inquiries/${id}`, method: "PATCH", data: { status } }),
      invalidatesTags: [tagTypes.inquiries, tagTypes.dashboard],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useGetNoticeQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useGetInquiriesQuery,
  useSetInquiryStatusMutation,
} = communicationApi;
