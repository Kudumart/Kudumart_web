import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import DropZone from "../../../components/DropZone";
import {
  Attributes,
  CategorySelect,
  SubCategorySelect,
} from "./vendor-services.create";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface VendorServiceResponse {
  message: string;
  data: {
    additional_images: string[];
    attributes: any[];
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
export default function VendorEditService() {
  const { id } = useParams();
  const query = useQuery<VendorServiceResponse>({
    queryKey: ["services", id],
    queryFn: async () => {
      const response = await apiClient.get(`vendor/services/${id}`);
      return response.data;
    },
  });

  const service = query.data?.data[0];
  // return <>{JSON.stringify(service)}</>;
  const { register, handleSubmit, control, watch, setValue } = useForm({
    values: service
      ? {
          title: service.title,
          description: service.description,
          image_url: service.image_url,
          video_url: service.video_url,
          service_category_id: service.service_category_id,
          service_subcategory_id: service.service_subcategory_id,
          location_city: service.location_city,
          location_state: service.location_state,
          location_country: service.location_country,
          is_negotiable: service.is_negotiable,
          work_experience_years: service.work_experience_years,
          additional_images: service.additional_images,
          price: service.price,
          discount_price: service.discount_price,
          attributes: service.attributes,
        }
      : {},
  });
  const nav = useNavigate();
  const cat_id = watch("service_category_id");
  useEffect(() => {
    setValue("attributes", []);
  }, [cat_id]);
  const mainImage = watch("image_url");
  const additionalImages = watch("additional_images");
  const edit_service = useMutation({
    mutationFn: async (data: any) => {
      let resp = await apiClient.put(`/vendor/services/${service?.id}`, data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Service updated successfully");
      query.refetch();
      nav("/profile/service/" + service?.id);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create service");
    },
  });

  const onSubmit = (data: any) => {
    const attributesArray = Object.entries(data.attributes || {}).map(
      ([id, value]) => ({
        attributeId: Number(id),
        value: value,
      }),
    );

    const payload = {
      ...data,
      attributes: attributesArray,
    };
    // JSON.stringify(payload());
    edit_service.mutate(payload);
  };
  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-w-4xl mx-auto"
        data-theme="kudu"
      >
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Service Details</h2>
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-semibold">Service Title</span>
              </label>
              <input
                type="text"
                {...register("title")}
                className="input input-bordered input-lg w-full"
                placeholder="e.g. Professional Deep Cleaning Service"
              />
            </div>

            <div className="form-control mt-4 w-full">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
                <span className="label-text-alt">
                  Describe your service in detail
                </span>
              </label>
              <textarea
                {...register("description")}
                className="textarea textarea-bordered h-40 mt-2 w-full"
                placeholder="Tell customers what makes your service special..."
              />
            </div>
            <div className="form-control flex flex-col mt-4 gap-2">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <div>
                <Controller
                  control={control}
                  name="service_category_id"
                  render={({ field: { onChange, value } }) => (
                    <CategorySelect
                      onChange={onChange}
                      initial={service?.category}
                    />
                  )}
                ></Controller>
              </div>
            </div>
            <div className="form-control flex flex-col mt-4 gap-2">
              <label className="label">
                <span className="label-text font-semibold">Sub Category</span>
              </label>
              <div>
                <Controller
                  control={control}
                  name="service_subcategory_id"
                  render={({ field: { onChange } }) => (
                    <SubCategorySelect
                      onChange={onChange}
                      categoryId={cat_id}
                      initial={service?.subCategory}
                    />
                  )}
                ></Controller>
              </div>
            </div>
            {/*ATTRIBUTES SELECT*/}
            <div className="form-control flex flex-col mt-4 gap-2">
              <label className="label">
                <span className="label-text font-semibold">Attributes</span>
              </label>
              <div>
                <Controller
                  control={control}
                  name="service_subcategory_id"
                  render={({ field: { onChange } }) => (
                    <>
                      <Attributes id={cat_id} control={control} />
                    </>
                    // <SubCategorySelect onChange={onChange} categoryId={cat_id} />
                  )}
                ></Controller>
              </div>
            </div>
            {/*ATTRIBUTES SELECT*/}
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Media</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Main Service Image
                </span>
              </label>
              <DropZone
                text="Drop your main service image here"
                single={true}
                onUpload={(url: string) => {
                  if (url.trim()) {
                    setValue("image_url", url);
                  }
                }}
              />
              {mainImage && (
                <div className="mt-4">
                  <img
                    src={mainImage}
                    alt="Main service preview"
                    className="rounded-lg object-cover h-48 w-full"
                  />
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Additional Images
                </span>
                <span className="label-text-alt">Showcase your work</span>
              </label>
              <DropZone
                text="Upload multiple images to showcase your service"
                single={false}
                onUpload={(urls: string) => {
                  if (!additionalImages) {
                    return;
                  }
                  if (additionalImages.length < 3) {
                    return setValue("additional_images", [
                      ...additionalImages,
                      urls[0],
                    ]);
                  }
                }}
              />
              {additionalImages && additionalImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Additional service preview ${idx + 1}`}
                        className="rounded-lg object-cover h-32 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = additionalImages.filter(
                            (_, i) => i !== idx,
                          );
                          setValue("additional_images", newImages);
                        }}
                        className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Pricing & Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control flex-col flex gap-2">
                <label className="label">
                  <span className="label-text font-semibold">Price (₦)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className="input input-bordered"
                  placeholder="0.00"
                />
              </div>

              <div className="form-control flex-col flex gap-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Discount Price (₦)
                  </span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("discount_price")}
                  className="input input-bordered"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text font-semibold">
                  Price is negotiable
                </span>
                <input
                  type="checkbox"
                  {...register("is_negotiable")}
                  className="checkbox checkbox-primary checkbox-lg"
                />
              </label>
            </div>

            <div className="divider">Location</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control flex-col flex gap-2">
                <label className="label">
                  <span className="label-text font-semibold">City</span>
                </label>
                <input
                  type="text"
                  {...register("location_city")}
                  className="input input-bordered"
                  placeholder="e.g. Lagos"
                />
              </div>

              <div className="form-control flex-col flex gap-2">
                <label className="label">
                  <span className="label-text font-semibold">State</span>
                </label>
                <input
                  type="text"
                  {...register("location_state")}
                  className="input input-bordered"
                  placeholder="e.g. Lagos State"
                />
              </div>

              <div className="form-control flex-col flex gap-2">
                <label className="label">
                  <span className="label-text font-semibold">Country</span>
                </label>
                <input
                  type="text"
                  {...register("location_country")}
                  className="input input-bordered"
                  placeholder="e.g. Nigeria"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Experience</h2>

            <div className="form-control flex-col flex gap-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Years of Experience
                </span>
              </label>
              <input
                type="number"
                {...register("work_experience_years")}
                className="input input-bordered"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="card-actions justify-end">
          <button
            disabled={edit_service.isPending}
            type="submit"
            className="btn btn-primary btn-lg"
          >
            Update Service Listing
          </button>
        </div>
      </form>
    </div>
  );
}
