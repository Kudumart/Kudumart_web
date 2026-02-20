import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import ServiceCard from "./components/ServiceCard";
import SimplePaginator from "./components/SimplePagination";
import ServiceFilters from "./components/ServicesFilters";
import { useSearchParams } from "react-router-dom";

interface ServiceAttribute {
  name: string;
  values?: string[];
  value?: string | number | boolean;
}

interface ProviderLocation {
  city: string;
  state: string;
  street?: string;
  country: string;
  address?: string;
}

interface Provider {
  location: ProviderLocation;
  isVerified: boolean;
  id: string;
  trackingId: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  email: string;
  email_verified_at: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  photo: string | null;
  fcmToken: string;
  wallet: string | null;
  dollarWallet: string;
  facebookId: string | null;
  googleId: string | null;
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

export interface Service {
  additional_images: string[];
  attributes: ServiceAttribute[];
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
  subCategory: SubCategory | null;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PublicServicesResponse {
  message: string;
  data: Service[];
  pagination: Pagination;
}

export default function PublicServices() {
  const [searchParams] = useSearchParams();

  // Convert searchParams to an object
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const { data, isLoading, isError } = useQuery<PublicServicesResponse>({
    queryKey: ["listings", params],
    queryFn: async () => {
      let resp = await apiClient.get("/services", { params });
      return resp.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <div className="alert alert-error">Error loading services.</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-28" data-theme="kudu">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <div className="flex min-h-screen flex-col md:flex-row gap-2">
        <div className="flex-1  md:max-w-xs  shadow-xl h-fit">
          <ServiceFilters />
        </div>
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {data?.data.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">😕</div>
                <div className="text-xl font-semibold mb-2">
                  No services found
                </div>
                <div className="text-base text-base-content/70">
                  Try adjusting your filters or check back later.
                </div>
              </div>
            ) : (
              data?.data.map((service) => (
                <ServiceCard {...service} key={service.id} />
              ))
            )}
          </div>
          {data?.pagination && (
            <div className="py-4 grid place-items-center">
              {/*{data.pagination.totalPages}*/}
              {/*{data.pagination.totalPages}*/}
              <SimplePaginator limit={data.pagination.totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
