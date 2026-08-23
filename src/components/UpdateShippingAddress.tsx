import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Button from "./Button";
import apiClient from "../api/apiFactory";
import { toast } from "sonner";
import useAppState from "../hooks/appState";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../reducers/userSlice";

interface ShippingAddress {
  hasChildren: boolean;
  children: ShippingAddress[];
  name: string;
  type: "COUNTRY" | "PROVINCE" | "CITY";
}

interface FormValues {
  province: string;
  city: string;
  street: string;
  zipCode: string;
  country: {
    name: string;
    id: string;
  };
}

const country_list = [
  { name: "Nigeria", id: "NG" },
  { name: "United States", id: "US" },
  { name: "United Kingdom", id: "UK" },
];

export default function UpdateShipAdd({ onclose }: { onclose: () => void }) {
  const { user } = useAppState();
  const dispatch = useDispatch();

  // Parse existing user location for pre-fill
  const existingLocation = user?.location
    ? typeof user.location === "string"
      ? JSON.parse(user.location)
      : user.location
    : null;

  const existingCountry =
    country_list.find((c) => c.name === existingLocation?.country) ||
    { name: "Nigeria", id: "NG" };

  const { register, watch, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      country: existingCountry,
      province: existingLocation?.state || "",
      city: existingLocation?.city || "",
      street: existingLocation?.street || "",
      zipCode: existingLocation?.zipCode || "",
    },
  });

  const selectedCountry = watch("country");

  const { data: countryData, isLoading } = useQuery<{ data: ShippingAddress }>({
    queryKey: ["test-query", selectedCountry.name],
    queryFn: async () => {
      const response = await apiClient("user/shipping/addresses", {
        params: { shipToCountryCode: selectedCountry.id },
      });
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let resp = await apiClient.put("user/profile/update", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: String(Date.now()),
        ...data,
      });
      return resp.data;
    },
    onSuccess: (data) => {
      const user_data = data.data;
      dispatch(setKuduUser(user_data));
      onclose();
    },
  });

  const selectedProvinceName = watch("province");
  const provinces = countryData?.data?.children || [];
  const selectedProvince = provinces.find((p) => p.name === selectedProvinceName);
  const cities = selectedProvince?.children || [];

  const onSubmit = (data: FormValues) => {
    const formatted_data = {
      country: data.country.name,
      city: data.city,
      state: data.province,
      street: data.street,
      zipCode: data.zipCode,
    };
    toast.promise(() => mutation.mutateAsync({ location: formatted_data }), {
      loading: "Updating shipping address...",
      success: "Shipping address updated successfully",
      error: "Failed to update shipping address",
    });
  };

  return (
    <div data-theme="kudu" className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white">

        {/* Country */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Country</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedCountry.id}
            onChange={(e) => {
              const country = country_list.find((c) => c.id === e.target.value);
              if (country) {
                setValue("country", country);
                setValue("province", "");
                setValue("city", "");
              }
            }}
          >
            {country_list.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* State / Province */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">State / Province</span>
          </label>
          {isLoading ? (
            <div className="input input-bordered w-full flex items-center text-gray-400 text-sm">
              Loading states...
            </div>
          ) : provinces.length > 0 ? (
            <select
              {...register("province")}
              className="select select-bordered w-full"
            >
              <option value="">Select State</option>
              {provinces.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              {...register("province")}
              placeholder="Enter your state / province"
              className="input input-bordered w-full"
            />
          )}
        </div>

        {/* City */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">City</span>
          </label>
          {cities.length > 0 ? (
            <select
              {...register("city")}
              className="select select-bordered w-full"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              {...register("city")}
              placeholder="Enter your city"
              className="input input-bordered w-full"
            />
          )}
        </div>

        {/* Street Address */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Street Address</span>
          </label>
          <input
            type="text"
            {...register("street")}
            placeholder="Enter street address"
            className="input input-bordered w-full"
          />
        </div>

        {/* Zip Code */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Zip Code</span>
          </label>
          <input
            type="text"
            {...register("zipCode")}
            placeholder="Enter zip code"
            className="input input-bordered w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          variant="primary"
          fullWidth
        >
          {mutation.isPending ? "Saving..." : "Save Address"}
        </Button>
      </form>
    </div>
  );
}
