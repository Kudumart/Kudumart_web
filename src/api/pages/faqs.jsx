import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export function useGetFaqsCategory() {
  return useQuery({
    queryKey: ["admin-faqs-category"],
    queryFn: async () => {
      const response = await axios.get(`/admin/faq/categories`);
      return response.data.data;
    },
  });
}

export function useCreateFaqsCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/admin/faq/category`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success("FAQ category created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs-category"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFaqCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`/admin/faq/category`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      toast.success("FAQ category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs-category"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useGetFaqs() {
  return useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const response = await axios.get(`/admin/faqs`);
      return response.data.data;
    },
  });
}

export function useGetFaqsPaginated(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin-faqs-paginated", page, limit],
    queryFn: async () => {
      const response = await axios.get(`/admin/faqs?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/admin/faq`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success("FAQ created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`/admin/faq`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      toast.success("FAQ updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useGetFaqClient() {
  return useQuery({
    queryKey: ["client-faqs"],
    queryFn: async () => {
      const response = await axios.get(`/faq/categories/with/faqs`);
      return response.data.data;
    },
  });
}
