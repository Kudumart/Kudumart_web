import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
  {
    name: "Nigeria",
    id: "NG",
  },
  {
    name: "United States",
    id: "US",
  },
  {
    name: "United Kingdom",
    id: "UK",
  },
];
export default function UpdateShipAdd({ onclose }: { onclose: () => void }) {
  const { user } = useAppState();
  const dispatch = useDispatch();

  const { register, watch, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      country: {
        name: "Nigeria",
        id: "NG",
      },
    },
  });
  const selectedCountry = watch("country");
  const { data: countryData, isLoading } = useQuery<{ data: ShippingAddress }>({
    queryKey: ["test-query", selectedCountry.name],
    queryFn: async () => {
      const response = await apiClient("user/shipping/addresses", {
        params: {
          shipToCountryCode: selectedCountry.id,
        },
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
      // toast.success("Shipping address updated successfully");
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
    const formatted_data = {
      country: data.country.name,
      city: `${data.city}`,
      state: data.province,
      street: data.street,
      zipCode: data.zipCode,
    };
    console.log(formatted_data);
    toast.promise(() => mutation.mutateAsync({ location: formatted_data }), {
      loading: "Updating shipping address...",
      success: "Shipping address updated successfully",
      error: "Failed to update shipping address",
    });
  };

  return (
    <div data-theme="kudu" className="w-ful">
      <form onSubmit={handleSubmit(onSubmit)} className=" space-y-4 bg-white">
        {/*{JSON.stringify(user, null, 2)}*/}
        <div className="form-control w-full ">
          <label className="label">
            <span className="label-text">Country</span>
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Street Address</span>
          </label>
          <input
            type="text"
            {...register("street")}
            placeholder="Enter street address"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Zip Code</span>
          </label>
          <input
            type="text"
            {...register("zipCode")}
            placeholder="Enter zip code"
            className="input input-bordered w-full"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </div>
  );
}
