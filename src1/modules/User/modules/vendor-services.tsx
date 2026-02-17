import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { SimplePagination } from "../../../components/SimplePagination";
import { usePagination } from "../../../hooks/appState";

interface ServiceCategory {
  id: number;
  name: string;
}

interface ServiceSubCategory {
  id: number;
  name: string;
}

interface VendorService {
  additional_images: string[];
  attributes: { name: string; values: string[] | number | boolean }[];
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  vendorId: string;
  service_category_id: number;
  service_subcategory_id: number;
  location_city: string;
  location_state: string;
  location_country: string;
  work_experience_years: number;
  is_negotiable: boolean;
  price: string;
  discount_price: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: ServiceCategory;
  subCategory: ServiceSubCategory;
}

interface VendorServicesResponse {
  message: string;
  data: VendorService[];
}
export default function VendorServices() {
  const page_params = usePagination();

  const query = useQuery<VendorServicesResponse>({
    queryKey: [
      "vendorServices",
      page_params.params.page,
      page_params.params.limit,
    ],
    queryFn: async () => {
      const response = await apiClient.get("/vendor/services", {
        params: page_params.params,
      });
      return response.data;
    },
  });
  const publish_service = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.patch(`/vendor/services/${id}/publish`);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Service published successfully");
      query.refetch();
      // nav("/profile/service/" + service?.id);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create service");
    },
  });
  const unpublish_service = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.patch(`/vendor/services/${id}/unpublish`);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Service unpublished successfully");
      query.refetch();
      // nav("/profile/service/" + service?.id);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create service");
    },
  });
  if (query.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-lg">
            <figure className="h-56 w-full bg-base-200"></figure>
            <div className="card-body space-y-4">
              <div className="h-4 bg-base-200 rounded w-3/4"></div>
              <div className="h-3 bg-base-200 rounded w-full"></div>
              <div className="h-3 bg-base-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="alert alert-error shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Error loading services!</h3>
          <div className="text-xs">{query.error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="kudu" className="container mx-auto px-4 py-12 w-full">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Link
          className="btn btn-accent btn-sm md:btn-md gap-2 ml-auto"
          to={"/profile/services/create"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {query.data?.data?.map((service: VendorService) => (
          <div
            key={service.id}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <figure className="relative h-48 overflow-hidden">
              <img
                src={service.image_url}
                alt={service.title}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <div className="badge badge-primary badge-lg badge-ghost">
                  ${service.price}
                  {service.discount_price && ` | $${service.discount_price}`}
                </div>
              </div>
            </figure>

            <div className="card-body p-4">
              <h2 className="card-title text-lg line-clamp-1">
                {service.title}
                {service.status === "active" && (
                  <div className="badge badge-success badge-sm ml-2"></div>
                )}
              </h2>

              <p className="text-base-content/70 text-sm line-clamp-2 mb-2">
                {service.description}
              </p>

              <div className="flex items-center gap-1.5 text-sm text-base-content/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1">
                  {service.location_city}, {service.location_state}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <div className="badge badge-outline badge-sm badge-primary">
                  {service.category.name}
                </div>
                <div className="badge badge-outline badge-sm badge-secondary">
                  {service.subCategory.name}
                </div>
              </div>

              <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-200">
                <Link
                  to={`/profile/service/${service.id}`}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  Details
                </Link>

                <div className="flex items-center gap-2">
                  {service.status === "active" ? (
                    <button
                      onClick={() => unpublish_service.mutate(service.id)}
                      disabled={
                        unpublish_service.isPending || publish_service.isPending
                      }
                      className="btn btn-outline btn-success btn-sm gap-2"
                    >
                      {unpublish_service.isPending && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => publish_service.mutate(service.id)}
                      disabled={
                        unpublish_service.isPending || publish_service.isPending
                      }
                      className="btn btn-outline btn-error btn-sm gap-2"
                    >
                      {publish_service.isPending && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                      Inactive
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SimplePagination
          paginate={page_params}
          total={query.data?.data?.length || 0}
        />
      </div>
    </div>
  );
}
