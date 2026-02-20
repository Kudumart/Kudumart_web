import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import apiClient from "../api/apiFactory";

interface ShippingAddress {
  hasChildren: boolean;
  children: ShippingAddress[];
  name: string;
  type: "COUNTRY" | "PROVINCE" | "CITY";
}

interface FormValues {
  province: string;
  city: string;
}

export default function TestPage() {
  const { register, watch, handleSubmit } = useForm<FormValues>();

  const { data: countryData, isLoading } = useQuery<{ data: ShippingAddress }>({
    queryKey: ["test-query"],
    queryFn: async () => {
      const response = await apiClient(
        "user/shipping/addresses?shipToCountryCode=NG",
      );
      return response.data;
    },
  });

  const selectedProvinceName = watch("province");

  const provinces = countryData?.data?.children || [];
  const selectedProvince = provinces.find(
    (p) => p.name === selectedProvinceName,
  );
  const cities = selectedProvince?.children || [];

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <div data-theme="kudu" className="pt-26 min-h-screen p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">State / Province</span>
          </label>
          <select
            {...register("province")}
            className="select select-bordered w-full"
            disabled={isLoading}
          >
            <option value="">Select State</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">City</span>
          </label>
          <select
            {...register("city")}
            className="select select-bordered w-full"
            disabled={!selectedProvinceName || cities.length === 0}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </div>
  );
}
