import type {
  TPaged,
  TPlan,
  TPlanInput,
  TPlatformStats,
  TSubscriptionPayment,
  TSubscriptionPaymentInput,
  TTenantDetail,
  TTenantPlanInput,
  TTenantRow,
  TTenantSlugInput,
  TTenantStatusInput,
} from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const platformApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformStats: build.query<TPlatformStats, void>({
      query: () => ({
        url: "/platform/stats",
        method: "GET",
      }),
      providesTags: [tagTypes.stats],
    }),

    getTenants: build.query<TPaged<TTenantRow>, Record<string, unknown>>({
      query: (params) => ({
        url: "/platform/tenants",
        method: "GET",
        params,
      }),
      transformResponse: withMeta<TTenantRow>,
      providesTags: [tagTypes.tenants],
    }),

    getTenantDetail: build.query<TTenantDetail, string>({
      query: (id) => ({
        url: `/platform/tenants/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.tenants],
    }),

    setTenantStatus: build.mutation<TTenantRow, { id: string; data: TTenantStatusInput }>({
      query: ({ id, data }) => ({
        url: `/platform/tenants/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.tenants, tagTypes.stats],
    }),

    setTenantPlan: build.mutation<TTenantRow, { id: string; data: TTenantPlanInput }>({
      query: ({ id, data }) => ({
        url: `/platform/tenants/${id}/plan`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.tenants],
    }),

    changeTenantSlug: build.mutation<TTenantRow, { id: string; data: TTenantSlugInput }>({
      query: ({ id, data }) => ({
        url: `/platform/tenants/${id}/slug`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.tenants],
    }),

    recordSubscriptionPayment: build.mutation<
      TSubscriptionPayment,
      { id: string; data: TSubscriptionPaymentInput }
    >({
      query: ({ id, data }) => ({
        url: `/platform/tenants/${id}/subscription-payments`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.tenants, tagTypes.stats],
    }),

    getPlatformPlans: build.query<TPlan[], void>({
      query: () => ({
        url: "/platform/plans",
        method: "GET",
      }),
      providesTags: [tagTypes.plans],
    }),

    createPlan: build.mutation<TPlan, TPlanInput>({
      query: (data) => ({
        url: "/platform/plans",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.plans],
    }),

    updatePlan: build.mutation<TPlan, { id: string; data: Partial<TPlanInput> }>({
      query: ({ id, data }) => ({
        url: `/platform/plans/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.plans],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetTenantsQuery,
  useGetTenantDetailQuery,
  useSetTenantStatusMutation,
  useSetTenantPlanMutation,
  useChangeTenantSlugMutation,
  useRecordSubscriptionPaymentMutation,
  useGetPlatformPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
} = platformApi;
