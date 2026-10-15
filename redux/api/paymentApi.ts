import type { TPaged, TPayment, TPaymentInput } from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPayment: build.mutation<TPayment, { data: TPaymentInput; key: string }>({
      query: ({ data, key }) => ({ url: "/payments", method: "POST", data, headers: { "Idempotency-Key": key } }),
      invalidatesTags: [tagTypes.payments, tagTypes.invoices, tagTypes.dues, tagTypes.feeReports, tagTypes.students],
    }),
    getPayments: build.query<TPaged<TPayment>, Record<string, unknown>>({
      query: (params) => ({ url: "/payments", method: "GET", params }),
      transformResponse: withMeta<TPayment>,
      providesTags: [tagTypes.payments],
    }),
    getPayment: build.query<TPayment, string>({
      query: (id) => ({ url: `/payments/${id}`, method: "GET" }),
      providesTags: [tagTypes.payments],
    }),
    reversePayment: build.mutation<TPayment, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/payments/${id}/reverse`, method: "POST", data: { reason } }),
      invalidatesTags: [tagTypes.payments, tagTypes.invoices, tagTypes.dues, tagTypes.feeReports],
    }),
  }),
});

export const { useCreatePaymentMutation, useGetPaymentsQuery, useGetPaymentQuery, useReversePaymentMutation } = paymentApi;
