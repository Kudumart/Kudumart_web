import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import apiClient from "apiClient";
import { toast } from "react-toastify";
import apiClient from "./apiFactory";

let token = localStorage.getItem("kuduUserToken");

export function useConversation() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (token) {
        const response = await apiClient.get(`/user/conversations`);
        return response.data.data;
      }
      return [];
    },
  });
}

export function getMessage(conversationId) {
  return useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/user/messages?conversationId=${conversationId}`,
      );
      return response.data.data;
    },
    enabled: !!conversationId,
  });
}

export function sendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/user/messages`, data);
      return response.data.data;
    },
    onSuccess: () => {
      // toast.success("");
      queryClient.invalidateQueries({ queryKey: ["message"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
