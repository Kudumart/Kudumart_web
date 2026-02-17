import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import apiClient from "../../api/apiFactory";

interface ServiceAttribute {
  name: string;
  values: string[];
}

interface ProviderLocation {
  city: string;
  state: string;
  address: string;
  country: string;
}

interface KYC {
  isVerified: boolean;
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
  wallet: string | null;
  dollarWallet: string;
  facebookId: string | null;
  googleId: string | null;
  accountType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  kyc: KYC;
}

interface Category {
  id: number;
  name: string;
}

interface SingleServiceData {
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
  discount_price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider: Provider;
  category: Category;
  subCategory: Category | null;
}

interface SingleServiceResponse {
  data: SingleServiceData;
}

export default function PublicSingleService() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery<SingleServiceResponse>({
    queryKey: ["service", id],
    queryFn: async () => {
      let resp = await apiClient.get("/service/" + id);
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
    return <div className="alert alert-error">Error loading service.</div>;
  }

  const service = data?.data;

  if (!service) {
    return <div className="alert alert-warning">Service not found.</div>;
  }

  return (
    <div className="min-h-screen pt-28" data-theme="kudu">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={service.image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
            {service.additional_images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {service.additional_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${service.title} ${index + 1}`}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="badge badge-primary">
                  {service.category.name}
                </div>
                <div className="text-sm text-base-content/70">
                  {service.location_city}, {service.location_state}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card bg-base-200 p-4">
              <div className="flex items-center gap-4">
                {service.discount_price ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      ₦{parseFloat(service.discount_price).toLocaleString()}
                    </span>
                    <span className="text-lg line-through text-base-content/60">
                      ₦{parseFloat(service.price).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    ₦{parseFloat(service.price).toLocaleString()}
                  </span>
                )}
                {service.is_negotiable && (
                  <div className="badge badge-accent">Negotiable</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-base-content/80">{service.description}</p>
            </div>

            {/* Attributes */}
            {service.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Service Details</h3>
                <div className="space-y-2">
                  {service.attributes.map((attribute, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-base-300"
                    >
                      <span className="font-medium">{attribute.name}:</span>
                      <span className="text-base-content/80">
                        {attribute?.values?.join(", ")}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 border-b border-base-300">
                    <span className="font-medium">Experience:</span>
                    <span className="text-base-content/80">
                      {service.work_experience_years} years
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Info */}
            <div className="card bg-base-200 p-4">
              <h3 className="text-lg font-semibold mb-3">Service Provider</h3>
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full">
                    <img
                      src={service.provider.photo}
                      alt={`${service.provider.firstName} ${service.provider.lastName}`}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {service.provider.firstName} {service.provider.lastName}
                    </h4>
                    {service.provider.isVerified && (
                      <div className="badge badge-success badge-sm">
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-base-content/70">
                    {service.provider.location.city},{" "}
                    {service.provider.location.state}
                  </p>
                  <p className="text-sm text-base-content/70">
                    ID: {service.provider.trackingId}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1">
                Contact Provider
              </button>
              <button className="btn btn-outline">Save Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
