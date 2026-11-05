/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/apiFactory";

const supportedCountries = [
  { name: "Nigeria", id: "NG" },
  { name: "United States", id: "US" },
  { name: "United Kingdom", id: "UK" },
];

const selectClassName =
  "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

const DeliveryAreaLocationFields = ({ value = {}, onChange, error }) => {
  const selectedCountry =
    supportedCountries.find(
      (country) =>
        country.id === value.countryCode || country.name === value.country,
    ) || null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shipping-address-options", selectedCountry?.id],
    enabled: Boolean(selectedCountry?.id),
    queryFn: async () => {
      const response = await apiClient("user/shipping/addresses", {
        params: { shipToCountryCode: selectedCountry.id },
      });
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const states = data?.data?.children || [];
  const selectedState =
    states.find((state) => state.name === value.state) || null;
  const cities = selectedState?.children || [];
  const legacyCity =
    value.city && !cities.some((city) => city.name === value.city)
      ? value.city
      : "";

  const updateValue = (updates) => onChange({ ...value, ...updates });

  return (
    <div className="w-full">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Delivery destination
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <select
          className={selectClassName}
          value={selectedCountry?.id || ""}
          onChange={(event) => {
            const country = supportedCountries.find(
              (item) => item.id === event.target.value,
            );
            updateValue({
              country: country?.name || "",
              countryCode: country?.id || "",
              state: "",
              stateCode: "",
              city: "",
              scope: "city",
            });
          }}
          aria-label="Delivery country"
        >
          <option value="">Country</option>
          {supportedCountries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>

        <select
          className={selectClassName}
          value={selectedState?.name || ""}
          disabled={!selectedCountry || isLoading || isError}
          onChange={(event) =>
            updateValue({
              state: event.target.value,
              stateCode: event.target.value,
              city: "",
              scope: "city",
            })
          }
          aria-label="Delivery state"
        >
          <option value="">
            {isLoading ? "Loading states…" : "State / region"}
          </option>
          {states.map((state) => (
            <option key={state.name} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>

        <select
          className={selectClassName}
          value={cities.some((city) => city.name === value.city) ? value.city : ""}
          disabled={!selectedState || isLoading || isError}
          onChange={(event) =>
            updateValue({ city: event.target.value, scope: "city" })
          }
          aria-label="Delivery city"
        >
          <option value="">City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <p className="mt-1.5 text-xs text-red-500">
          Address options could not be loaded. Please retry before saving.
        </p>
      )}
      {legacyCity && !isLoading && !isError && (
        <p className="mt-1.5 text-xs text-amber-700">
          Existing destination: {legacyCity}. Select its country, state, and city
          before saving so customer addresses can be matched reliably.
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DeliveryAreaLocationFields;
