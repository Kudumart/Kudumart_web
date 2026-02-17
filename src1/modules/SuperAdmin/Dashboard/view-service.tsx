import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import apiClient from "../../../api/apiFactory";
import { toast } from "react-toastify";

interface Attribute {
  name: string;
  values?: string[];
  value?: boolean;
}

interface ProviderLocation {
  city: string;
  state: string;
  country: string;
}

interface Provider {
  location: ProviderLocation;
  isVerified: boolean;
  id: string;
  trackingId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  email_verified_at: string;
  phoneNumber: string;
  dateOfBirth: string;
  photo: string;
  fcmToken: string;
  wallet: string;
  dollarWallet: string;
  facebookId: null;
  googleId: null;
  accountType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  kyc: {
    isVerified: boolean;
  };
}

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface ServiceData {
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
  discount_price: null;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider: Provider;
  category: Category;
  subCategory: SubCategory;
}

interface ServicesQueryResponse {
  data: ServiceData;
}

export default function AdminViewService() {
  const { id } = useParams();
  const services = useQuery<ServicesQueryResponse>({
    queryKey: ["services", id],
    queryFn: async () => {
      const response = await apiClient.get(`admin/services/${id}`);
      return response.data;
    },
  });

  const suspendServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/admin/service/${id}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service suspended successfully");
      services.refetch();
    },
  });

  const activateServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/admin/service/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service activated successfully");
      services.refetch();
    },
  });

  if (services.isLoading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center bg-base-100"
        data-theme="kudu"
      >
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (services.isError) {
    return (
      <div
        className="min-h-screen flex justify-center items-center p-4 bg-base-100"
        data-theme="kudu"
      >
        <div className="alert alert-error shadow-lg max-w-md rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0-2l-2 2m1-2h.01M12 17.5h.01"
            />
          </svg>
          <span>Error loading service. Please try again later.</span>
        </div>
      </div>
    );
  }

  const service = services.data?.data;

  return (
    <div className="min-h-screen bg-base-200/50 pb-12" data-theme="kudu">
      {/* Header / Top Bar */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`badge badge-sm font-medium uppercase tracking-wider ${getStatusBadgeClass(service?.status)}`}
              >
                {service?.status}
              </span>
              <span className="text-xs text-base-content/50 font-mono">
                ID: {service?.id}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight">
              {service?.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {service?.status === "active" ? (
              <button
                onClick={() => suspendServiceMutation.mutate()}
                disabled={suspendServiceMutation.isPending}
                className="btn btn-error btn-md rounded-full shadow-sm normal-case"
              >
                {suspendServiceMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : null}
                Suspend Service
              </button>
            ) : (
              <button
                onClick={() => activateServiceMutation.mutate()}
                disabled={activateServiceMutation.isPending}
                className="btn btn-success btn-md rounded-full shadow-sm normal-case"
              >
                {activateServiceMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : null}
                Activate Service
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Media Card */}
            <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden rounded-3xl">
              <figure>
                <img
                  src={service?.image_url}
                  alt={service?.title}
                  className="w-full object-cover"
                  style={{ aspectRatio: "16/9" }}
                />
              </figure>
              <div className="card-body p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Description
                </h3>
                <p className="text-base-content/80 leading-relaxed whitespace-pre-line">
                  {service?.description}
                </p>
              </div>
            </div>

            {/* Video Section */}
            {service?.video_url && (
              <div className="card bg-base-100 shadow-sm border border-base-300 rounded-3xl overflow-hidden">
                <div className="card-body p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-secondary rounded-full"></span>
                    Service Video
                  </h3>
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                    <video controls className="w-full h-full">
                      <source src={service.video_url} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery */}
            {service?.additional_images &&
              service.additional_images.length > 0 && (
                <div className="card bg-base-100 shadow-sm border border-base-300 rounded-3xl">
                  <div className="card-body p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-accent rounded-full"></span>
                      Gallery
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {service.additional_images.map((img, index) => (
                        <div
                          key={index}
                          className="group relative rounded-2xl overflow-hidden aspect-square border border-base-200"
                        >
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Pricing Card */}
            <div className="card bg-primary text-primary-content shadow-lg rounded-3xl">
              <div className="card-body p-6">
                <span className="text-xs uppercase font-bold opacity-70 tracking-widest">
                  Service Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-4xl font-black">{service?.price}</h2>
                  {service?.discount_price && (
                    <span className="text-lg line-through opacity-60">
                      {service.discount_price}
                    </span>
                  )}
                </div>
                {service?.is_negotiable && (
                  <div className="badge badge-ghost mt-2 border-primary-content/20 bg-primary-content/10">
                    Negotiable
                  </div>
                )}
              </div>
            </div>

            {/* Provider Card */}
            <div className="card bg-base-100 shadow-sm border border-base-300 rounded-3xl">
              <div className="card-body p-6">
                <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-4">
                  Provider
                </h3>
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-2xl ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={service?.provider.photo} alt="Provider" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-lg leading-tight">
                        {service?.provider.firstName}{" "}
                        {service?.provider.lastName}
                      </p>
                      {service?.provider.isVerified && (
                        <svg
                          className="w-5 h-5 text-info"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60">
                      {service?.provider.location.city},{" "}
                      {service?.provider.location.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="card bg-base-100 shadow-sm border border-base-300 rounded-3xl">
              <div className="card-body p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-1">
                    Category
                  </h4>
                  <p className="font-medium">
                    {service?.category?.name} / {service?.subCategory?.name}
                  </p>
                </div>
                <div className="divider my-0 opacity-50"></div>
                <div>
                  <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-1">
                    Location
                  </h4>
                  <p className="font-medium">
                    {service?.location_city}, {service?.location_state}
                  </p>
                </div>

                {service?.attributes && service.attributes.length > 0 && (
                  <>
                    <div className="divider my-0 opacity-50"></div>
                    <div>
                      <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-3">
                        Attributes
                      </h4>
                      <div className="space-y-3">
                        {service.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-base-content/60">
                              {attr.name}
                            </span>
                            <span className="font-semibold text-right">
                              {attr.values
                                ? attr.values.join(", ")
                                : String(attr.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string | undefined): string {
  switch (status) {
    case "active":
      return "badge-success text-success-content";
    case "inactive":
      return "badge-warning text-warning-content";
    case "pending":
      return "badge-info text-info-content";
    case "rejected":
      return "badge-error text-error-content";
    default:
      return "badge-ghost";
  }
}
