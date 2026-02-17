import { Control, Controller, useForm } from "react-hook-form";
import DropZone from "../../../components/DropZone";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { usePagination } from "../../../hooks/appState";
import { SimplePagination } from "../../../components/SimplePagination";

export default function VendorCreateService() {
  const { register, handleSubmit, setValue, control, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      video_url: "https://www.youtube.com/watch?v=cleaning_demo_123",
      service_category_id: 1,
      service_subcategory_id: 7,
      location_city: "Lagos",
      location_state: "Lagos State",
      location_country: "Nigeria",
      is_negotiable: true,
      work_experience_years: 5,
      additional_images: [],
      price: 0,
      discount_price: 0,
      attributes: [],
      // attributes: [
      //   { attributeId: 1, value: 12 },
      //   { attributeId: 3, value: "five years experience" },
      //   { attributeId: 6, value: true },
      // ],
    },
  });
  const cat_id = watch("service_category_id");
  useEffect(() => {
    setValue("attributes", []);
  }, [cat_id]);
  const mainImage = watch("image_url");
  const additionalImages = watch("additional_images");
  const create_service = useMutation({
    mutationFn: async (data: any) => {
      let resp = await apiClient.post("/vendor/services", data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Service created successfully");
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
        value,
      }),
    );
    const payload = {
      ...data,
      attributes: attributesArray,
    };

    toast.promise(create_service.mutateAsync(payload), {
      pending: "creating service",
    });
  };
  // const onSubmit = (data: any) => {
  //   const attributesArray = Object.entries(data.attributes || {}).map(
  //     ([id, value]) => {
  //       if (
  //         value === undefined ||
  //         value === null ||
  //         (Array.isArray(value) && value.length === 0) ||
  //         value === ""
  //       ) {
  //         return null;
  //       }

  //       return {
  //         attributeId: Number(id),
  //         value: Array.isArray(value) ? value.join(", ") : value,
  //       };
  //     },
  //   ); // remove nulls
  //   const payload = {
  //     ...data,
  //     attributes: attributesArray,
  //   };

  //   create_service.mutate(payload);
  // };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-8 max-w-4xl mx-auto"
      data-theme="kudu"
    >
      <button
        type="button"
        className="btn btn-neutral"
        onClick={() => {
          window.history.back();
        }}
      >
        Go back
      </button>
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
                render={({ field: { onChange } }) => (
                  <CategorySelect onChange={onChange} />
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
                  <SubCategorySelect onChange={onChange} categoryId={cat_id} />
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
        <button type="submit" className="btn btn-primary btn-lg">
          Create Service Listing
        </button>
      </div>
    </form>
  );
}

interface Category {
  id: string;
  name: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  data: Category[];
}

export const CategorySelect = ({
  onChange,
  initial,
}: {
  onChange: (item: any) => any;
  initial?: Category | null;
}) => {
  const [selected, setSelected] = useState<Category | null>(initial || null);
  const paginate = usePagination();
  const categories = useQuery<CategoryResponse>({
    queryKey: ["categories", "services", paginate.params],
    queryFn: () =>
      apiClient
        .get(`/service/categories`, {
          params: {
            ...paginate.params,
          },
        })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (initial) {
      setSelected(initial);
    }
  }, [initial]);

  const handleSelect = (item: Category) => {
    setSelected(item);
    onChange(item.id);
  };

  return (
    <div className="space-y-4">
      {selected && (
        <div className="card bg-primary text-primary-content shadow-md">
          <div className="card-body p-4">
            <h3 className="card-title text-lg">Selected Category</h3>
            <p className="font-medium">{selected.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.isFetching &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="btn btn-ghost h-12 animate-pulse bg-base-200"
            ></div>
          ))}

        {categories.data?.data?.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn ${selected?.id === item.id ? "btn-primary" : "btn-outline"}
              justify-start text-sm h-auto min-h-12 py-2`}
            onClick={() => handleSelect(item)}
          >
            <span className="truncate">{item.name}</span>
          </button>
        ))}
      </div>

      <SimplePagination
        paginate={paginate}
        total={categories.data?.data?.length || 0}
        className="mt-4 justify-center"
      />
    </div>
  );
};

export const SubCategorySelect = ({
  onChange,
  categoryId,
  initial,
}: {
  onChange: (item: any) => any;
  categoryId: string | number;
  initial?: Category | null;
}) => {
  const [selected, setSelected] = useState<Category | null>(initial || null);
  const paginate = usePagination();

  useEffect(() => {
    if (initial) {
      setSelected(initial);
    }
  }, [initial]);

  const categories = useQuery<CategoryResponse>({
    queryKey: ["sub-categories", "services", categoryId, paginate.params],
    queryFn: () =>
      apiClient
        .get(`/service/subcategories/${categoryId}`, {
          params: paginate.params,
        })
        .then((res) => res.data),
  });

  const handleSelect = (item: Category) => {
    setSelected(item);
    onChange(item.id);
  };

  return (
    <div className="space-y-4">
      {selected && (
        <div className="card bg-accent text-accent-content shadow-md">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-lg">Selected Sub-category</h3>
              <span className="badge badge-neutral">{selected.symbol}</span>
            </div>
            <p className="font-medium">{selected.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.isFetching ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="btn btn-ghost h-12 animate-pulse bg-base-200"
            ></div>
          ))
        ) : categories.data?.data?.length === 0 ? (
          <div className="col-span-full alert alert-info">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>No sub-categories available</span>
          </div>
        ) : (
          categories.data?.data?.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn ${selected?.id === item.id ? "btn-accent" : "btn-outline"}
                flex-col h-auto min-h-[5rem] py-3 normal-case`}
              onClick={() => handleSelect(item)}
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-xs opacity-75 mt-1">{item.symbol}</span>
            </button>
          ))
        )}
      </div>

      <SimplePagination
        paginate={paginate}
        total={categories.data?.data?.length || 0}
        className="mt-4 justify-center"
      />
    </div>
  );
};
interface AttributeOption {
  id: number;
  option_value: string;
}

interface Attribute {
  id: number;
  name: string;
  input_type:
    | "single_select"
    | "bool_input"
    | "text_input"
    | "number_input"
    | "multi_select"
    | "int_input";
  data_type: "str_array" | "bool" | "string" | "number";
  options: AttributeOption[];
}

interface AttributesResponse {
  data: Attribute[];
}

export const Attributes = ({
  id,
  control,
  initial = [],
}: {
  id: string | number;
  control: Control<any>;
  initial?: Array<{ attributeId: number; value: any }>;
}) => {
  const { data, isFetching, isError } = useQuery<AttributesResponse>({
    queryKey: ["attributes", id],
    queryFn: () =>
      apiClient
        .get(`/services/categories/${id}/attributes`, {
          params: {
            limit: 30,
          },
        })
        .then((res) => res.data),
  });

  const getInitialValue = (attributeId: number, fallback: any) => {
    if (!Array.isArray(initial)) return fallback;
    const found = initial.find((i) => i.attributeId === attributeId);
    return found !== undefined ? found.value : fallback;
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-200 shadow-sm animate-pulse">
            <div className="card-body p-4">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-base-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
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
        <span>Failed to load attributes. Please try again later.</span>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="alert alert-info shadow-lg">
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>No additional specifications required for this category</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.data.map((attribute) => (
        <div key={attribute.id} className="card bg-base-100 shadow-sm border">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {attribute.name}
                <div className="badge badge-ghost badge-sm">
                  {attribute.input_type.replace("_", " ")}
                </div>
              </h3>
            </div>

            {attribute.input_type === "single_select" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(
                  attribute.id,
                  attribute.options?.[0]?.option_value || "",
                )}
                render={({ field }) => (
                  <select
                    {...field}
                    className="select select-bordered w-full select-md"
                    disabled={attribute.options.length === 0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    value={field.value ?? ""}
                  >
                    <option value="">Select an option</option>
                    {attribute.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.option_value}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}

            {attribute.input_type === "multi_select" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(attribute.id, [])}
                render={({ field }) => (
                  <div className="space-y-2">
                    {attribute.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(option.id)} // ✅ compare with numeric id
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...field.value, option.id] // ✅ store numeric id
                              : field.value.filter(
                                  (v: number) => v !== option.id,
                                );
                            field.onChange(newValue);
                          }}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="label-text">
                          {option.option_value}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              />
            )}
            {attribute.input_type === "bool_input" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(attribute.id, false)}
                render={({ field }) => (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...field}
                      className="toggle toggle-primary"
                      checked={field.value}
                    />
                    <span className="label-text">
                      {field.value ? "Yes" : "No"}
                    </span>
                  </label>
                )}
              />
            )}

            {attribute.input_type === "text_input" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(attribute.id, "")}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    className="input input-bordered w-full"
                  />
                )}
              />
            )}

            {attribute.input_type === "number_input" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(attribute.id, 0)}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    className="input input-bordered w-full"
                  />
                )}
              />
            )}

            {attribute.input_type === "int_input" && (
              <Controller
                control={control}
                name={`attributes.${attribute.id}`}
                defaultValue={getInitialValue(attribute.id, "")}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    step="1"
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    } // 👈 force number
                    value={field.value ?? ""}
                  />
                )}
              />
            )}

            {attribute.options?.length > 0 &&
              !["single_select", "multi_select"].includes(
                attribute.input_type,
              ) && (
                <div className="mt-2 text-sm text-base-content/60">
                  Available options:{" "}
                  {attribute.options.map((o) => o.option_value).join(", ")}
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};
