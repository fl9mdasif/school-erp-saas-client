import { TOrder } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation({
      query: (data: TOrder) => ({
        url: "/orders",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.orders],
    }),

    getAllOrders: build.query({
      query: (params: Record<string, unknown>) => ({
        url: "/orders",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.orders],
    }),

    updateOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.orders],
    }),

    deleteOrder: build.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.orders],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
