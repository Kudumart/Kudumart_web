import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import apiClient from "./apiFactory";

export function useGetAdminJobs() {
  return useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/jobs`);
      return response.data.data;
    },
  });
}

export function useGetAdminJobById(id) {
  return useQuery({
    queryKey: ["admin-job", id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/job?jobId=${id}`);
      return response.data.data;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/admin/job/post`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success("Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put(`/admin/job/update`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      toast.success("Job updated successfully");
      const id = res.id;
      queryClient.invalidateQueries({
        queryKey: ["admin-jobs", "admin-job", id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeactivateJob(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.patch(
        `/admin/job/close?jobId=${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (res) => {
      toast.success("Job updated successfully");
      const id = res.id;
      queryClient.invalidateQueries({
        queryKey: ["admin-jobs", "admin-job", id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useGetJobClient() {
  return useQuery({
    queryKey: ["client-jobs"],
    queryFn: async () => {
      const response = await apiClient.get(`/fetch/jobs`);
      return response.data.data;
    },
  });
}

export function useViewJobClient(jobId) {
  return useQuery({
    queryKey: ["client-job", jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/view/job?jobId=${jobId}`);
      return response.data.data;
    },
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/apply/job`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success("Application sent successfully");
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
