import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export function useGetAdminTestimonials() {
  return useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const response = await axios.get(`/admin/testimonials`);
      return response.data.data;
    },
  });
}

export function useGetAdminTestimonialById(id) {
  return useQuery({
    queryKey: ["admin-testimonial", id],
    queryFn: async () => {
      const response = await axios.get(`/admin/testimonial?id=${id}`);
      return response.data.data;
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/admin/testimonial`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      console.log(res);
      toast.success("Testimonial created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`/admin/testimonial`, data);
      return response.data.data;
    },
    onSuccess: (res) => {
      toast.success("Testimonial updated successfully");
      const id = res.id
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials", "admin-testimonial", id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useGetTestimonialsClient() {
  return useQuery({
    queryKey: ["client-testimonials"],
    queryFn: async () => {
      const response = await axios.get(`/testimonials`);
      return response.data.data;
    },
  });
}
