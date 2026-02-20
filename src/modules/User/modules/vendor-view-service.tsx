import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/apiFactory";
import { toast } from "react-toastify";

interface VendorService {
  message: string;
  data: {
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
    discount_price: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    category: {
      id: number;
      name: string;
    };
    subCategory: {
      id: number;
      name: string;
    };
  }[];
}

export const VendorViewService = () => {
  const { id } = useParams();
  const query = useQuery<VendorService>({
    queryKey: ["services", id],
    queryFn: async () => {
      const response = await apiClient.get(`vendor/services/${id}`);
      return response.data;
    },
  });

  const nav = useNavigate();
  const delete_service = useMutation({
    mutationFn: async (data: any) => {
      let resp = await apiClient.delete(
        `/vendor/services/${service?.id}`,
        data,
      );
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Service deleted successfully");
      nav("/profile/services");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create service");
    },
  });

  if (query.isLoading)
    return (
      <div className="w-full p-4 space-y-8 animate-pulse">
        <div className="skeleton h-96 w-full rounded-xl"></div>
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4"></div>
          <div className="skeleton h-6 w-1/2"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-2/3"></div>
          <div className="flex gap-4">
            <div className="skeleton h-6 w-24"></div>
            <div className="skeleton h-6 w-24"></div>
          </div>
        </div>
      </div>
    );

  if (query.isError)
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-8">
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
          <h3 className="font-bold">Error loading service details!</h3>
          <div className="text-xs">Failed to fetch service data</div>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => query.refetch()}
        >
          Retry
        </button>
      </div>
    );

  const service = query.data?.data[0];

  return (
    <div className="w-full p-4" data-theme="kudu">
      <div className="card bg-base-100 shadow-xl">
        <figure className="px-4 pt-4">
          <img
            src={service?.image_url}
            alt={service?.title}
            className="rounded-xl w-full h-96 object-cover"
          />
        </figure>

        <div className="card-body">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl capitalize font-bold mb-4">
              {service?.title}
            </h1>
          </div>
          <div>
            <div className="text-xl font-semibold mb-2 badge p-2 h-auto w-auto badge-primary badge-soft border">
              {service?.category?.name}
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="badge badge-outline">
              {service?.subCategory?.name}
            </div>
            <div className="badge badge-ghost">
              📍 {service?.location_city}, {service?.location_country}
            </div>
          </div>

          <div className="text-2xl font-bold mb-4">
            ${Number(service?.price).toLocaleString()}
            {service?.discount_price && (
              <span className="text-lg line-through ml-2 text-gray-500">
                ${Number(service?.discount_price).toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-4 text-xl font-semibold">Description</div>
          <p className="mb-6 bg-base-300 p-4 rounded-md text-base-content">
            {service?.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Experience:</span>
              <span className="badge badge-info">
                {service?.work_experience_years} years
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Negotiable:</span>
              <span
                className={`badge ${service?.is_negotiable ? "badge-success" : "badge-error"}`}
              >
                {service?.is_negotiable ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {service?.attributes && service.attributes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.attributes.map((attr, index) => (
                  <div key={index} className="card bg-base-200 p-4">
                    <div className="font-semibold">{attr.name}</div>
                    <div className="text-base-content/70">
                      {attr.values &&
                        (Array.isArray(attr.values)
                          ? attr.values.join(", ")
                          : String(attr.values))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service?.additional_images?.length > 0 && (
            <div className="carousel rounded-box mb-6">
              {service?.additional_images.map((img, index) => (
                <div key={index} className="carousel-item">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-64 h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="card-actions justify-end">
            <Link
              to={`/profile/service/edit/${service?.id}`}
              className="btn btn-primary px-8"
            >
              Edit Service
            </Link>
            <button
              onClick={() => delete_service.mutate()}
              className="btn btn-error px-8"
            >
              Delete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
