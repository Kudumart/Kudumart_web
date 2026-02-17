import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { useNavigate } from "react-router-dom";
import {
  NewPaginator,
  use_new_paginate,
} from "../../../components/paginate/NewPaginator";

interface Attribute {
  name: string;
  values?: string[];
  value?: boolean;
}

interface ProviderLocation {
  city?: string;
  state?: string;
  country?: string;
  street?: string;
}

interface Provider {
  location: ProviderLocation | ProviderLocation[];
  isVerified: boolean;
  id: string;
  trackingId: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  email: string;
  email_verified_at: string | null;
  phoneNumber: string;
  dateOfBirth: string | null;
  photo: string | null;
  fcmToken: string | null;
  wallet: string | null;
  dollarWallet: string;
  facebookId: null;
  googleId: null;
  accountType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface Service {
  additional_images: string[];
  attributes: Attribute[];
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
  provider: Provider;
  category: Category;
  subCategory: SubCategory;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

interface SuperAdmin {
  message: string;
  data: Service[];
  pagination: Pagination;
}

export default function AdminServices() {
  const paginate = use_new_paginate();
  const services = useQuery<SuperAdmin>({
    queryKey: ["services", paginate.page],
    queryFn: async () => {
      const response = await apiClient("admin/services", {
        params: {
          limit: 30,
          page: paginate.page,
          // status: "suspended",
        },
      });
      return response.data;
    },
  });
  const data = services.data?.data;
  return (
    <div data-theme="kudu" id="root" className="p-2">
      <div className="p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <h1 className="text-3xl font-bold">All Services</h1>
          {services.isFetching && (
            <span className="ml-4 loading text-primary"></span>
          )}
          {services.isError && (
            <div>
              <button className="btn ml-3" onClick={() => services.refetch()}>
                Reload
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary">Add New Service</button>
      </div>
      {services.isLoading && (
        <div className="flex justify-center items-center h-96">
          <p>Loading services...</p>
        </div>
      )}
      {services.isError && (
        <div className="flex justify-center items-center h-96">
          <p>Error loading services.</p>
        </div>
      )}
      {!services.isLoading && !services.isError && data?.length === 0 && (
        <div className="flex justify-center items-center h-96">
          <p>No services found.</p>
        </div>
      )}
      {!services.isLoading && !services.isError && data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
      <div className="my-3">
        <NewPaginator paginate={paginate} />
      </div>
    </div>
  );
}

const ServiceCard = ({ service }: { service: Service }) => {
  const navigate = useNavigate();
  const navigateToService = () => {
    navigate(`/admin/services/${service.id}`);
  };

  return (
    <div
      key={service.id}
      className="card w-full bg-base-100 border border-base-200 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
    >
      <figure className="relative overflow-hidden">
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`badge badge-sm font-medium py-3 px-3 border-none shadow-sm ${
              service.status === "active"
                ? "bg-success/10 text-success"
                : "bg-base-300/50 text-base-content"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.status === "active" ? "bg-success" : "bg-base-content"}`}
            ></span>
            {service.status}
          </span>
        </div>
      </figure>
      <div className="card-body p-5 gap-3">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h2 className="card-title text-lg font-semibold leading-tight text-base-content group-hover:text-primary transition-colors">
              {service.title}
            </h2>
          </div>
          <p className="text-base-content/70 line-clamp-2 text-sm mt-1">
            {service.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <div className="badge badge-ghost bg-base-200 text-base-content/80 text-[10px] uppercase tracking-wider font-bold border-none">
            {service.category.name}
          </div>
          {service.subCategory?.name && (
            <div className="badge badge-ghost bg-base-200 text-base-content/80 text-[10px] uppercase tracking-wider font-bold border-none">
              {service.subCategory.name}
            </div>
          )}
        </div>

        <div className="mt-2 pt-3 border-t border-base-200 flex flex-col gap-0.5">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] uppercase font-bold text-base-content/50 tracking-widest">
              Price
            </span>
            <span className="font-black text-xl text-primary">
              {service.price !== "0.00"
                ? `₦${parseFloat(service.price).toLocaleString()}`
                : "Negotiable"}
            </span>
          </div>
          {service.discount_price && service.discount_price !== "0.00" && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-base-content/50 tracking-widest">
                Original
              </span>
              <span className="text-sm line-through text-base-content/40 decoration-1">
                ₦{parseFloat(service.discount_price).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="card-actions mt-2">
          <button
            className="btn btn-primary btn-md w-full shadow-md hover:shadow-lg normal-case font-bold"
            onClick={navigateToService}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
