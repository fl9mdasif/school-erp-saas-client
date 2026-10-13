import type {
  TLoginInput,
  TMe,
  TPlatformLoginInput,
  TRegisterInput,
  TSlugCheck,
  TAuthUser,
} from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

type TSession = { accessToken: string };

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    slugAvailable: build.query<TSlugCheck, string>({
      query: (slug) => ({
        url: "/auth/slug-available",
        method: "GET",
        params: { slug },
      }),
    }),

    registerInstitution: build.mutation<
      TSession & { tenant: { id: string; slug: string; name: string } },
      TRegisterInput
    >({
      query: (data) => ({
        url: "/auth/register-institution",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.me],
    }),

    login: build.mutation<TSession & { user: TAuthUser }, TLoginInput>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.me],
    }),

    platformLogin: build.mutation<TSession & { user: TAuthUser }, TPlatformLoginInput>({
      query: (data) => ({
        url: "/platform/auth/login",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.me],
    }),

    logout: build.mutation<{ loggedOut: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    getMe: build.query<TMe, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: [tagTypes.me],
    }),

    changePassword: build.mutation<TSession, { oldPassword: string; newPassword: string }>({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.me],
    }),

    forgotPassword: build.mutation<{ message: string }, { tenantSlug: string; email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        data,
      }),
    }),

    resetPassword: build.mutation<
      { message: string },
      { tenantSlug: string; token: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        data,
      }),
    }),
  }),
});

export const {
  useSlugAvailableQuery,
  useLazySlugAvailableQuery,
  useRegisterInstitutionMutation,
  useLoginMutation,
  usePlatformLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
