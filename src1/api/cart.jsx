import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import apiClient from "./apiFactory";

let token = localStorage.getItem("kuduUserToken");

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (token) {
        const response = await apiClient.get(`/user/cart`);
        return response.data.data;
      }
      return [];
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return apiClient.post(`/user/cart/add`, payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["cart"]);
      toast.success(response.data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId) => {
      return apiClient.delete(`/user/cart/remove?cartId=${cartId}`);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["cart"]);
      toast.success(response.data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
