import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosRequestConfig, AxiosError } from "axios";
import { instance as axiosInstance } from "./axiosInstance";
import { TMeta, TApiError } from "@/types/common";

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
      meta?: TMeta;
      contentType?: string;
    },
    unknown,
    unknown
  > =>
    async ({ url, method, data, params, contentType }) => {
      try {
        const result = await axiosInstance({
          url: baseUrl + url,
          method,
          data,
          params,
          headers: {
            "Content-Type": contentType || "application/json",
          },
        });
        return result;
      } catch (axiosError) {
        const error = axiosError as AxiosError;
        const err = (error.response?.data as TApiError) || error;
        return {
          error: {
            status: error.response?.status || 500,
            data: err.message || error.message || "An unexpected error occurred",
          },
        };
      }
    };
