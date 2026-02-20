import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "./apiFactory";

let token = localStorage.getItem("kuduUserToken");

export function useNotification() {
  return useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      if (token) {
        const response = await apiClient.get(`/user/notifications`);
        return response.data.data;
      }
      return [];
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      return apiClient.patch(
        `/user/mark/notification/as/read?notificationId=${notificationId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notification"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
