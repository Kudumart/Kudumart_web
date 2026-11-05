/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { City, State } from "country-state-city";
import apiClient from "../api/apiFactory";

const supportedCountries = [
  { name: "Nigeria", id: "NG", libraryId: "NG" },
  { name: "United States", id: "US", libraryId: "US" },
  { name: "United Kingdom", id: "UK", libraryId: "GB" },
];

const coverageOptions = [
  { value: "country", label: "Entire country" },
  { value: "state", label: "Entire state / region" },
  { value: "city", label: "Specific city" },
];

const fieldClass =
  "w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

const DeliveryAreaLocationFields = ({ value = {}, onChange, error }) => {
  const scope = value.scope || "city";
  const selectedCountry = supportedCountries.find(
    (country) =>
      country.id === value.countryCode || country.name === value.country,
  );

  const { data, isError } = useQuery({
    queryKey: ["delivery-address-options", selectedCountry?.id],
    queryFn: async () => {
      const response = await apiClient("user/shipping/addresses", {
        params: { shipToCountryCode: selectedCountry.id },
      });
      return response.data;
    },
    enabled: Boolean(selectedCountry),
    retry: false,
    staleTime: 30 * 60 * 1000,
  });

  const localStates = useMemo(() => {
    if (!selectedCountry) return [];

    return State.getStatesOfCountry(selectedCountry.libraryId).map((state) => ({
      name: state.name,
      code: state.isoCode,
      children: City.getCitiesOfState(
        selectedCountry.libraryId,
        state.isoCode,
      ).map((city) => ({ name: city.name })),
    }));
  }, [selectedCountry]);

  const remoteStates = (data?.data?.children || []).map((state) => ({
    ...state,
    code: state.code || state.name,
  }));
  const states = remoteStates.length > 0 ? remoteStates : localStates;
  const selectedState = states.find(
    (state) => state.code === value.stateCode || state.name === value.state,
  );
  const cities = selectedState?.children || [];

  const updateCoverage = (nextScope) => {
    onChange({
      ...value,
      scope: nextScope,
      state: nextScope === "country" ? "" : value.state || "",
      stateCode: nextScope === "country" ? "" : value.stateCode || "",
      city:
        nextScope === "country"
          ? selectedCountry?.name || value.country || ""
          : nextScope === "state"
            ? value.state || ""
            : "",
    });
  };

  const updateCountry = (countryCode) => {
    const country = supportedCountries.find((item) => item.id === countryCode);
    onChange({
      ...value,
      country: country?.name || "",
      countryCode: country?.id || "",
      state: "",
      stateCode: "",
      city: scope === "country" ? country?.name || "" : "",
      scope,
    });
  };

  const updateState = (stateCode) => {
    const state = states.find((item) => item.code === stateCode);
    onChange({
      ...value,
      state: state?.name || "",
      stateCode: state?.code || "",
      city: scope === "state" ? state?.name || "" : "",
      scope,
    });
  };

  const updateCity = (cityName) => {
    onChange({ ...value, city: cityName, scope: "city" });
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        Delivery coverage
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        <select
          value={scope}
          onChange={(event) => updateCoverage(event.target.value)}
          className={fieldClass}
          aria-label="Delivery coverage"
        >
          {coverageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry?.id || ""}
          onChange={(event) => updateCountry(event.target.value)}
          className={fieldClass}
          aria-label="Delivery country"
        >
          <option value="">Country</option>
          {supportedCountries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>

        {scope === "country" ? (
          <input
            value={selectedCountry ? `All of ${selectedCountry.name}` : "Select a country"}
            disabled
            className={`${fieldClass} sm:col-span-2`}
            aria-label="Nationwide delivery coverage"
          />
        ) : (
          <>
            <select
              value={selectedState?.code || ""}
              onChange={(event) => updateState(event.target.value)}
              disabled={!selectedCountry || states.length === 0}
              className={fieldClass}
              aria-label="Delivery state or region"
            >
              <option value="">State / region</option>
              {states.map((state) => (
                <option key={`${state.code}-${state.name}`} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>

            {scope === "state" ? (
              <input
                value={selectedState ? `All cities in ${selectedState.name}` : "Select a state"}
                disabled
                className={fieldClass}
                aria-label="Statewide delivery coverage"
              />
            ) : (
              <select
                value={cities.some((city) => city.name === value.city) ? value.city : ""}
                onChange={(event) => updateCity(event.target.value)}
                disabled={!selectedState || cities.length === 0}
                className={fieldClass}
                aria-label="Delivery city"
              >
                <option value="">City</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {isError && (
        <p className="text-[11px] text-amber-700">
          Using the standard address list while the live catalogue is unavailable.
        </p>
      )}
      {scope === "country" && selectedCountry && (
        <p className="text-[11px] text-gray-500">
          This rate will apply to every customer address in {selectedCountry.name}.
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default DeliveryAreaLocationFields;
