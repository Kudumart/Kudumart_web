import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import NaijaStates from "naija-state-local-government";

const UpdateStore = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const { mutate } = useApiMutation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Initialize countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
    getCurrency();
    getStoreData(id, allCountries);
  }, []);

  const transformPayload = (input) => {
    const country = input.country ? JSON.parse(input.country) : null;
    const state = input.state ? JSON.parse(input.state) : null;
    const city = input.city ? JSON.parse(input.city) : null;

    return {
      storeId: id,
      currencyId: input.currencyId,
      name: input.name,
      location: {
        address: input.address,
        city: city?.name || "",
        state: state?.name || "",
        country: country?.name || "",
      },
      businessHours: {
        monday_friday: input.monday_friday,
        saturday: input.saturday,
        sunday: input.sunday,
      },
      deliveryOptions: deliveryOptions.map((_, index) => ({
        city: input[`city${index}`],
        price: Number(input[`price${index}`] || 0),
        arrival_day: input[`arrival_day${index}`] || "",
      })),
      tipsOnFinding: input.tipsOnFinding,
      logo: "",
    };
  };

  const onSubmit = (data) => {
    setDisabled(true);
    const payload = transformPayload(data);

    mutate({
      url: "/vendor/store",
      method: "PUT",
      data: payload,
      headers: true,
      onSuccess: () => {
        navigate(-1);
        setDisabled(false);
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  const getCurrency = () => {
    mutate({
      url: `/vendor/currencies`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCurrencies(response.data.data);
      },
    });
  };

  const getStoreData = (id, allCountries) => {
    mutate({
      url: `/vendor/store`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const store = response.data.data.find((s) => s.id === id);
        setStoreData(store);
        initializeFormValues(store, allCountries);
        setLoading(false);
      },
    });
  };

  const initializeFormValues = (store, allCountries) => {
    if (!store) return;

    // Set basic fields
    setValue("name", store.name);
    setValue("address", store.location.address);
    setValue("tipsOnFinding", store.tipsOnFinding);
    setValue("currencyId", store.currencyId);
    setValue("monday_friday", store.businessHours.monday_friday);
    setValue("saturday", store.businessHours.saturday);
    setValue("sunday", store.businessHours.sunday);

    // Initialize location fields
    const country = allCountries.find((c) => c.name === store.location.country);
    if (country) {
      setSelectedCountry(country);
      setValue("country", JSON.stringify(country));

      const countryStates = State.getStatesOfCountry(country.isoCode);
      setStates(countryStates);

      const state = countryStates.find((s) => s.name === store.location.state);
      if (state) {
        setSelectedState(state);
        setValue("state", JSON.stringify(state));

        const stateCities = City.getCitiesOfState(
          country.isoCode,
          state.isoCode,
        );
        setCities(stateCities);

        const city = stateCities.find((c) => c.name === store.location.city);
        if (city) {
          setSelectedCity(city);
          setValue("city", JSON.stringify(city));
        }
      }
    }

    // Initialize delivery options
    if (store.deliveryOptions && store.deliveryOptions.length > 0) {
      store.deliveryOptions.forEach((option, index) => {
        setValue(`city${index}`, option.city);
        setValue(`price${index}`, option.price);
        setValue(`arrival_day${index}`, option.arrival_day);
      });
      setDeliveryOptions(store.deliveryOptions);
    }
  };

  const handleCountryChange = (e) => {
    if (!e.target.value) return;

    const country = JSON.parse(e.target.value);
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setValue("state", "");
    setValue("city", "");
    setValue("country", e.target.value);

    const countryStates = State.getStatesOfCountry(country.isoCode);
    setStates(countryStates);
    setCities([]);
  };

  const handleStateChange = (e) => {
    if (!e.target.value || !selectedCountry) return;

    const state = JSON.parse(e.target.value);
    setSelectedState(state);
    setSelectedCity(null);
    setValue("city", "");
    setValue("state", e.target.value);

    if (selectedCountry.name === "Nigeria") {
      const fetchedCities = NaijaStates.lgas(state.name).lgas.map((city) => ({
        name: city,
      }));
      setCities(fetchedCities);
      return;
    }

    const stateCities = City.getCitiesOfState(
      selectedCountry.isoCode,
      state.isoCode,
    );
    setCities(stateCities);
  };

  const handleCityChange = (e) => {
    if (!e.target.value) return;

    const city = JSON.parse(e.target.value);
    setSelectedCity(city);
    setValue("city", e.target.value);
  };

  const addDeliveryOption = () => {
    const newIndex = deliveryOptions.length;
    setDeliveryOptions([
      ...deliveryOptions,
      { city: "", price: 0, arrival_day: "" },
    ]);
    setValue(`city${newIndex}`, "");
    setValue(`price${newIndex}`, 0);
    setValue(`arrival_day${newIndex}`, "");
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mb-4">
          Update Store
        </h2>
      </div>
      <div className="w-full flex grow">
        <div className="shadow-xl py-2 px-5 md:w-3/4 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col items-center justify-center p-4"
          >
            <div className="w-full p-6">
              {/* Store Name */}
              <div className="mb-4">
                <label className="block text-md font-semibold mb-3">
                  Store Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Store name is required" })}
                  placeholder="Enter store's name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Store Address */}
              <div className="mb-4">
                <label className="block text-md font-semibold mb-3">
                  Store Address
                </label>
                <input
                  type="text"
                  {...register("address", {
                    required: "Store address is required",
                  })}
                  placeholder="Enter store address"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  {/* Country */}
                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      Country
                    </label>
                    <select
                      {...register("country", {
                        required: "Country is required",
                      })}
                      onChange={handleCountryChange}
                      value={
                        selectedCountry ? JSON.stringify(selectedCountry) : ""
                      }
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    >
                      <option value="" disabled>
                        Select a country
                      </option>
                      {countries.map((country) => (
                        <option
                          key={country.isoCode}
                          value={JSON.stringify(country)}
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      State
                    </label>
                    <select
                      {...register("state", { required: "State is required" })}
                      onChange={handleStateChange}
                      value={selectedState ? JSON.stringify(selectedState) : ""}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {states.map((state) => (
                        <option
                          key={state.isoCode}
                          value={JSON.stringify(state)}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      City
                    </label>
                    <select
                      {...register("city", { required: "City is required" })}
                      onChange={handleCityChange}
                      value={selectedCity ? JSON.stringify(selectedCity) : ""}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    >
                      <option value="" disabled>
                        Select city
                      </option>
                      {cities.map((city) => (
                        <option key={city.name} value={JSON.stringify(city)}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tips for finding store */}
              <div className="mb-4">
                <label className="block text-md font-semibold mb-3">
                  Tips for finding store
                </label>
                <input
                  type="text"
                  {...register("tipsOnFinding", {
                    required: "Tips on finding store is required",
                  })}
                  placeholder="Tips on finding store"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  required
                />
                {errors.tipsOnFinding && (
                  <p className="text-red-500 text-sm">
                    {errors.tipsOnFinding.message}
                  </p>
                )}
              </div>

              {/* Store Currency */}
              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      Store Currency
                    </label>
                    <select
                      {...register("currencyId", {
                        required: "Currency is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    >
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-4 uppercase">
                  Business Hours
                </p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      Monday - Friday
                    </label>
                    <input
                      type="text"
                      {...register("monday_friday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    />
                  </div>

                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      Saturday
                    </label>
                    <input
                      type="text"
                      {...register("saturday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    />
                  </div>

                  <div className="col-span-6 gap-1">
                    <label className="block text-md font-semibold mb-3">
                      Sunday
                    </label>
                    <input
                      type="text"
                      {...register("sunday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-4 uppercase">
                  Delivery Options
                </p>
                {deliveryOptions.map((_, index) => (
                  <div className="grid grid-cols-12 gap-3 mb-4" key={index}>
                    <div className="col-span-6 gap-1">
                      <label className="block text-md font-semibold mb-3">
                        City
                      </label>
                      <input
                        type="text"
                        {...register(`city${index}`, {
                          required: "Delivery City is required",
                        })}
                        placeholder="Enter delivery city"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        required
                      />
                    </div>

                    <div className="col-span-6 gap-1">
                      <label className="block text-md font-semibold mb-3">
                        Price
                      </label>
                      <input
                        type="number"
                        {...register(`price${index}`, {
                          required: "Price is required",
                        })}
                        placeholder="Enter price"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        required
                      />
                    </div>

                    <div className="col-span-6 gap-1">
                      <label className="block text-md font-semibold mb-3">
                        Arrival Day
                      </label>
                      <input
                        type="text"
                        {...register(`arrival_day${index}`, {
                          required: "Arrival day is required",
                        })}
                        placeholder="Enter arrival day"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDeliveryOption}
                  className="bg-kudu-orange mt-2 hover:bg-blue-700 cursor-pointer text-white text-sm py-2 px-4 rounded-sm"
                >
                  + Add Delivery Option
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={disabled}
                className="btn btn-primary btn-block"
                data-theme="kudu"
              >
                Update Store
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStore;
