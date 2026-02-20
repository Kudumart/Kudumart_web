import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const token = localStorage.getItem("kuduUserToken");

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
};

export const storeSlice = createApi({
  reducerPath: "store",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, 
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  keepUnusedDataFor: 0,
  tagTypes: ["Store", "Product", "Currencies", "Countries", "Categories"],

  endpoints: (builder) => {
    return {
     getAllStore: builder.query({
        query: () => ({
            url: `/vendor/store`,
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Store"],
      }),
          
      getSingleStore: builder.query({
        query: (storeId) => ({
          url: `/vendor/view/store?storeId=${storeId}`,
          method: "GET",
          headers: { ...headers },
        }),
        providesTags: ["Store"],
      }),

      createStore: builder.mutation({
        query: (data) => ({
          url: `/vendor/store`,
          method: "POST",
          headers: { ...headers },
          body: data,
        }),
        invalidatesTags: ["Store"],
      }),

      createProduct: builder.mutation({
        query: (data) => ({
          url: `/vendor/products`,
          method: "POST",
          headers: { ...headers },
          body: data,
        }),
        invalidatesTags: ["Product"],
      }),

      createAuctionProduct: builder.mutation({
        query: (data) => ({
          url: `/vendor/auction/products`,
          method: "POST",
          headers: { ...headers },
          body: data,
        }),
        invalidatesTags: ["Product"],
      }),

      editStore: builder.mutation({
        query: (data) => {
            return{
              url: `/vendor/store`,
              method: "PUT",
              headers: { ...headers },
              body: data,
            }
        },
        invalidatesTags: ["Store"],
      }),

      deleteStore: builder.mutation({
        query: (storeId) => ({
          url: `/vendor/store?storeId=${storeId}`,
          method: "DELETE",
          headers: { ...headers },
        }),
        invalidatesTags: ["Store"],
      }),

      deleteProduct: builder.mutation({
        query: (productId) => ({
          url: `/vendor/products?productId=${productId}`,
          method: "DELETE",
          headers: { ...headers },
        }),
        invalidatesTags: ["Product"],
      }),

      getCurrencies: builder.query({
        query: () => ({
            url: `/vendor/currencies`,
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Currencies"],
      }),

      getMyProduct: builder.query({
        query: () => ({
            url: `/vendor/vendors/products`,
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Product"],
      }),

      getCountries: builder.query({
        query: () => ({
            url: "https://countriesnow.space/api/v0.1/countries/states",
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Countries"],
      }),

      getCategories: builder.query({
        query: () => ({
            url: `/categories/with/sub-categories`,
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Categories"],
      }),

      updateKyc: builder.mutation({
        query: (data) => ({
          url: `/vendor/kyc`,
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["Kyc"],
      }),

      getSubcriptionsPlan: builder.query({
        query: () => ({
            url: `/vendor/subscription/plans`,
            method: "GET",
            headers: { ...headers },
        }),
        providesTags: ["Subcriptions"],
      }),

    };
  },
});

export const {
  useGetAllStoreQuery,
  useGetSingleStoreQuery,
  useCreateStoreMutation,
  useCreateProductMutation,
  useCreateAuctionProductMutation,
  useEditStoreMutation,
  useDeleteStoreMutation,
  useDeleteProductMutation,
  useGetCurrenciesQuery,
  useGetCountriesQuery,
  useGetCategoriesQuery,
  useGetMyProductQuery,
  useUpdateKycMutation,
  useGetSubcriptionsPlanQuery
} = storeSlice;
