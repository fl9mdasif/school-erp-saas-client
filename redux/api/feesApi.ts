import type {
  TAdjustment,
  TAdjustmentInput,
  TFeeHead,
  TFeeHeadInput,
  TFeeStructure,
  TFeeStructureInput,
  TGenerateInput,
  TGeneratePreview,
  TGenerateResult,
  TInvoice,
  TInvoiceDetail,
  TPaged,
} from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const ALL = { limit: 100 };

export const feesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Fee heads
    getFeeHeads: build.query<TPaged<TFeeHead>, void>({
      query: () => ({ url: "/fee-heads", method: "GET", params: ALL }),
      transformResponse: withMeta<TFeeHead>,
      providesTags: [tagTypes.feeHeads],
    }),
    createFeeHead: build.mutation<TFeeHead, TFeeHeadInput>({
      query: (data) => ({ url: "/fee-heads", method: "POST", data }),
      invalidatesTags: [tagTypes.feeHeads],
    }),
    updateFeeHead: build.mutation<TFeeHead, { id: string; data: Partial<Omit<TFeeHeadInput, "code">> }>({
      query: ({ id, data }) => ({ url: `/fee-heads/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.feeHeads],
    }),

    // Fee structures
    getFeeStructures: build.query<TPaged<TFeeStructure>, { sessionId?: string; classId?: string } | void>({
      query: (params) => ({ url: "/fee-structures", method: "GET", params: { ...ALL, ...(params ?? {}) } }),
      transformResponse: withMeta<TFeeStructure>,
      providesTags: [tagTypes.feeStructures],
    }),
    createFeeStructure: build.mutation<TFeeStructure, TFeeStructureInput>({
      query: (data) => ({ url: "/fee-structures", method: "POST", data }),
      invalidatesTags: [tagTypes.feeStructures],
    }),
    updateFeeStructure: build.mutation<TFeeStructure, { id: string; items: TFeeStructureInput["items"] }>({
      query: ({ id, items }) => ({ url: `/fee-structures/${id}`, method: "PATCH", data: { items } }),
      invalidatesTags: [tagTypes.feeStructures],
    }),

    // Waivers and scholarships
    getAdjustments: build.query<TPaged<TAdjustment>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/fee-adjustments", method: "GET", params: params ?? {} }),
      transformResponse: withMeta<TAdjustment>,
      providesTags: [tagTypes.feeAdjustments],
    }),
    createAdjustment: build.mutation<TAdjustment, TAdjustmentInput>({
      query: (data) => ({ url: "/fee-adjustments", method: "POST", data }),
      invalidatesTags: [tagTypes.feeAdjustments],
    }),
    endAdjustment: build.mutation<TAdjustment, string>({
      query: (id) => ({ url: `/fee-adjustments/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.feeAdjustments],
    }),

    // Invoices
    getInvoices: build.query<TPaged<TInvoice>, Record<string, unknown>>({
      query: (params) => ({ url: "/invoices", method: "GET", params }),
      transformResponse: withMeta<TInvoice>,
      providesTags: [tagTypes.invoices],
    }),
    getInvoice: build.query<TInvoiceDetail, string>({
      query: (id) => ({ url: `/invoices/${id}`, method: "GET" }),
      providesTags: [tagTypes.invoices],
    }),
    previewInvoices: build.mutation<TGeneratePreview, TGenerateInput>({
      query: (data) => ({ url: "/invoices/generate", method: "POST", params: { dryRun: "true" }, data }),
    }),
    generateInvoices: build.mutation<TGenerateResult, { input: TGenerateInput; key: string }>({
      query: ({ input, key }) => ({
        url: "/invoices/generate",
        method: "POST",
        params: { dryRun: "false" },
        data: input,
        headers: { "Idempotency-Key": key },
      }),
      invalidatesTags: [tagTypes.invoices, tagTypes.dues, tagTypes.feeReports],
    }),
    voidInvoice: build.mutation<TInvoice, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/invoices/${id}/void`, method: "POST", data: { reason } }),
      invalidatesTags: [tagTypes.invoices, tagTypes.dues, tagTypes.feeReports],
    }),
  }),
});

export const {
  useGetFeeHeadsQuery,
  useCreateFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useGetFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useGetAdjustmentsQuery,
  useCreateAdjustmentMutation,
  useEndAdjustmentMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  usePreviewInvoicesMutation,
  useGenerateInvoicesMutation,
  useVoidInvoiceMutation,
} = feesApi;
