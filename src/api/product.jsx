import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "./apiFactory";
import { countryvalue } from "../store/clientStore";

export function useProductById(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      console.log("value", value);
      const response = await apiClient.get(
        `/product?productId=${id}&country=${countryvalue.value}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}
