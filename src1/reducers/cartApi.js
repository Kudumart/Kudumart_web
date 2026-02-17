import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const token = localStorage.getItem("kuduUserToken");
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

export const cartApi = createApi({
  reducerPath: "cart",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  keepUnusedDataFor: 0,
  tagTypes: ["Cart"],

  endpoints: (builder) => {
    return {

      addToCart: builder.mutation({
        query: (data) => ({
          url: `/user/cart/add`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["Cart"],
      }),

    };
  },
});

export const {
  useAddToCartMutation

} = cartApi;
