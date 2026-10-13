import { baseApi } from "./baseApi";

export type TUploadKind = "image" | "pdf";
export type TUploadFolder = "photos" | "gallery" | "notices" | "logo" | "staff";

export type TSignedUpload = {
  provider: "cloudinary" | "mock";
  uploadUrl: string;
  fields: Record<string, string>;
  cloudName?: string;
  publicUrlBase?: string;
  maxBytes: number;
  allowedMime: string[];
  expiresAt: string;
};

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // The file itself never goes through our API: the API only signs the request.
    signUpload: build.mutation<TSignedUpload, { kind: TUploadKind; folder: TUploadFolder }>({
      query: (data) => ({
        url: "/uploads/sign",
        method: "POST",
        data,
      }),
    }),
  }),
});

export const { useSignUploadMutation } = uploadApi;
