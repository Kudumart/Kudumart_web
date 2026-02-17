import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useErrorHandler from "./errorHooks";
import apiClient from "../apiFactory";

const useApiMutation = () => {
  const handleError = useErrorHandler();

  const logoutUser = () => {
    toast.error("Session expired, please login again");
    localStorage.clear();
    window.location.href = "/login";
  };

  const mutation = useMutation({
    mutationFn: async ({
      url,
      data = null,
      method = "POST",
      headers = false,
    }) => {
      const token = localStorage.getItem("kuduUserToken");

      const config = headers
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        : {};

      switch (method.toUpperCase()) {
        case "GET":
          return apiClient.get(url, { params: data, ...config });
        case "POST":
          return data
            ? apiClient.post(url, data, config)
            : apiClient.post(url, undefined, config);
        case "PUT":
          return data
            ? apiClient.put(url, data, config)
            : apiClient.put(url, undefined, config);
        case "DELETE":
          return data
            ? apiClient.delete(url, { data, ...config })
            : apiClient.delete(url, { undefined, ...config });
        case "PATCH":
          return data
            ? apiClient.patch(url, data, config)
            : apiClient.patch(url, undefined, config);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data, variables) => {
      if (variables.onSuccess) {
        variables.onSuccess(data);
      }

      if (!variables.hideToast && data.data?.message) {
        toast.success(data.data.message);
      }
    },
    onError: (error, variables) => {
      // Check if error is a 401 response
      if (error.response && error.response.status === 401) {
        logoutUser();
        return;
      }

      if (!variables.hideToast) {
        handleError(error);
      }

      if (variables.onError) {
        variables.onError(error);
      }
    },
  });

  return mutation;
};

export default useApiMutation;
