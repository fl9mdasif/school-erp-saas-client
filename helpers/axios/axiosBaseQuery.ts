import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosRequestConfig } from "axios";
import { instance as axiosInstance } from "./axiosInstance";
import { TMeta, TApiError } from "@/types";

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      responseType?: AxiosRequestConfig["responseType"];
      meta?: TMeta;
      contentType?: string;
    },
    unknown,
    TApiError
  > =>
    async ({ url, method, data, params, headers, responseType, contentType }) => {
      try {
        const result = await axiosInstance({
          url: baseUrl + url,
          method,
          data,
          params,
          responseType,
          headers: {
            // FormData sets its own multipart boundary
            ...(data instanceof FormData
              ? {}
              : { "Content-Type": contentType || "application/json" }),
            ...headers,
          },
        });
        return result;
      } catch (error) {
        // axiosInstance already turned every failure into a TApiError
        const err = error as TApiError;
        return {
          error: {
            status: err.status ?? 500,
            code: err.code ?? "UNKNOWN_ERROR",
            message: err.message ?? "An unexpected error occurred",
            details: err.details,
            retryAfter: err.retryAfter,
          },
        };
      }
    };
