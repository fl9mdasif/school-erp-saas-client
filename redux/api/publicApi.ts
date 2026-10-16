import type { TPlan } from "@/types";
import { baseApi } from "./baseApi";

export type TPublicPlan = TPlan;

export type TSchoolHit = { name: string; slug: string; district?: string };

export const publicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicPlans: build.query<TPublicPlan[], void>({
      query: () => ({
        url: "/public/platform/plans",
        method: "GET",
      }),
    }),

    findSchool: build.query<TSchoolHit[], string>({
      query: (q) => ({
        url: "/public/platform/find-school",
        method: "GET",
        params: { q },
      }),
    }),
  }),
});

export const { useGetPublicPlansQuery, useFindSchoolQuery } = publicApi;
