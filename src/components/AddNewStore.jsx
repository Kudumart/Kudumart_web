import React, { useEffect, useState } from "react";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import useApiMutation from "../api/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import NaijaStates from "naija-state-local-government";
import { Plus, Trash2, Truck } from "lucide-react";
import DeliveryAreaLocationFields from "./DeliveryAreaLocationFields";

const AddNewStore = () => {
  const [countries, setCountries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([
    {
      country: "Nigeria",
      countryCode: "NG",
      state: "",
      stateCode: "",
      city: "",
      scope: "city",
      price: "",
      arrival_day: "",
    },
  ]);
  const [deliveryErrors, setDeliveryErrors] = useState({});

  const { mutate } = useApiMutation();
  const navigate = useNavigate();

  const handleCountryChange = (country) => {
    const parsedCountry = JSON.parse(country);
    setSelectedCountry(parsedCountry);
    setSelectedState(null);
    setCities([]);
    setStates(State.getStatesOfCountry(parsedCountry.isoCode));
  };

  const handleStateChange = (state) => {
    const parsedState = JSON.parse(state);
    setSelectedState(parsedState);

    if (selectedCountry.name === "Nigeria") {
      const fetchedCities = NaijaStates.lgas(parsedState.name).lgas.map(
        (city) => ({ name: city }),
      );
      setCities(fetchedCities);
      return;
    }

    setCities(
      City.getCitiesOfState(selectedCountry.isoCode, parsedState.isoCode),
    );
  };

  const handleCityChange = (state) => {
    const parsedCity = JSON.parse(state);
    setSelectedCity(parsedCity);
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const handleDeliveryLocationChange = (index, location) => {
    setDeliveryOptions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...location,
      };
      return updated;
    });
    if (deliveryErrors[index]) {
      setDeliveryErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const handleDeliveryFieldChange = (index, field, value) => {
    setDeliveryOptions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    if (deliveryErrors[index]) {
      setDeliveryErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const addDeliveryOption = () => {
    setDeliveryOptions((prev) => [
      ...prev,
      {
        country: "Nigeria",
        countryCode: "NG",
        state: "",
        stateCode: "",
        city: "",
        scope: "city",
        price: "",
        arrival_day: "",
      },
    ]);
  };

  const removeDeliveryOption = (indexToRemove) => {
    if (deliveryOptions.length <= 1) return;
    setDeliveryOptions((prev) => prev.filter((_, i) => i !== indexToRemove));
    setDeliveryErrors((prev) => {
      const copy = { ...prev };
      delete copy[indexToRemove];
      return copy;
    });
  };

  const transformPayload = (input) => {
    return {
      currencyId: input.currencyId,
      name: input.name,
      location: {
        address: input.location.address,
        city: input.location.city,
        state: input.location.state,
        country: input.location.country,
      },
      businessHours: {
        monday_friday: input.business_hours.monday_friday,
        saturday: input.business_hours.saturday,
        sunday: input.business_hours.sunday,
      },
      deliveryOptions: deliveryOptions.map((opt) => ({
        country: opt.country || "",
        countryCode: opt.countryCode || "",
        state: opt.state || "",
        stateCode: opt.stateCode || "",
        city: opt.city || "",
        scope: opt.scope || "city",
        price: Number(opt.price) || 0,
        arrival_day: opt.arrival_day || "",
      })),
      tipsOnFinding: input.tipsOnFinding,
      logo: "",
    };
  };

  const onSubmit = (data) => {
    const errorsMap = {};
    deliveryOptions.forEach((opt, idx) => {
      if (!opt.country) {
        errorsMap[idx] = "Please select a country";
      } else if (opt.scope === "city" && !opt.city) {
        errorsMap[idx] = "Please select a city";
      } else if (opt.scope === "state" && !opt.state) {
        errorsMap[idx] = "Please select a state";
      } else if (opt.price === "" || opt.price === null || isNaN(Number(opt.price)) || Number(opt.price) < 0) {
        errorsMap[idx] = "Please enter a valid rate/price";
      } else if (!opt.arrival_day || !opt.arrival_day.trim()) {
        errorsMap[idx] = "Please enter an estimated delivery timeline";
      }
    });

    if (Object.keys(errorsMap).length > 0) {
      setDeliveryErrors(errorsMap);
      return;
    }
    setDeliveryErrors({});

    const {
      address,
      monday_friday,
      city,
      country,
      state,
      saturday,
      sunday,
      ...rest
    } = data;

    const payload = {
      ...rest,
      location: {
        address,
        country: selectedCountry?.name,
        state: selectedState?.name,
        city: selectedCity?.name,
      },
      business_hours: {
        monday_friday,
        saturday,
        sunday,
      },
    };

    const reformedPayload = transformPayload(payload);

    mutate({
      url: "/admin/store",
      method: "POST",
      data: reformedPayload,
      headers: true,
      onSuccess: () => {
        navigate(-1);
      },
      onError: () => {},
    });
  };

  const getCurrency = () => {
    mutate({
      url: `/admin/currencies`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCurrencies(response.data.data);
      },
      onError: () => {},
    });
  };

  useEffect(() => {
    getCurrency();
  }, []);

  return (
    <div className="All">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mt-4 mb-4">
          Add New Store
        </h2>
      </div>
      <div className="w-full flex grow mt-3">
        <div className="shadow-xl py-2 px-5 md:w-3/5 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            className="w-full flex flex-col items-center justify-center p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full p-6">
              {/* Plan Name */}
              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Store Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: "Store name is required" })}
                  placeholder="Enter store's name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Store Address
                </label>
                <input
                  type="text"
                  id="address"
                  {...register("address", {
                    required: "Store address is required",
                  })}
                  placeholder="Enter store address"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Country
                    </label>
                    <select
                      id="country"
                      {...register("country", {
                        required: "Country is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      onChange={(event) =>
                        handleCountryChange(event.target.value)
                      }
                      required
                    >
                      <option value="" disabled selected hidden>
                        Select a country
                      </option>
                      {countries.map((country) => (
                        <option
                          value={JSON.stringify(country)}
                          key={country.isoCode}
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      {...register("state", { required: "State is required" })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      onChange={(event) =>
                        handleStateChange(event.target.value)
                      }
                      required
                    >
                      <option value="" disabled selected hidden>
                        Select state
                      </option>
                      {states.map((state) => (
                        <option
                          value={JSON.stringify(state)}
                          key={state.isoCode}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      {...register("city", { required: "City is required" })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      onChange={(event) => handleCityChange(event.target.value)}
                      required
                    >
                      <option value="" disabled selected hidden>
                        Select city
                      </option>
                      {cities.map((city) => (
                        <option value={JSON.stringify(city)} key={city.isoCode}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Tips for finding store
                </label>
                <input
                  type="text"
                  id="findStore"
                  {...register("tipsOnFinding", {
                    required: "Tips on finding store is required",
                  })}
                  placeholder="Tips on finding store"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.tipsOnFinding && (
                  <p className="text-red-500 text-sm">
                    {errors.tipsOnFinding.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Store Currency
                    </label>
                    <select
                      id="currencyId"
                      {...register("currencyId", {
                        required: "Currency is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    >
                      {currencies.map((currency) => (
                        <option value={currency.id} key={currency.id}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold mb-4 uppercase">
                  Business Hours
                </p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Monday - Friday
                    </label>
                    <input
                      type="text"
                      id="monday_friday"
                      {...register("monday_friday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                  </div>

                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Saturday
                    </label>
                    <input
                      type="text"
                      id="saturday"
                      {...register("saturday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                  </div>

                  <div className="col-span-6 gap-1">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Sunday
                    </label>
                    <input
                      type="text"
                      id="sunday"
                      {...register("sunday", {
                        required: "Business Hours are required",
                      })}
                      placeholder="Start Time and End Time"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="mb-6 bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-kudu-orange" />
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800">
                        Delivery Options & Coverage
                      </h3>
                      <p className="text-xs text-gray-500">
                        Configure shipping fees and expected delivery timelines by destination
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addDeliveryOption}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-kudu-orange bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Delivery Option
                  </button>
                </div>

                <div className="space-y-4">
                  {deliveryOptions.map((option, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg border border-gray-200 shadow-xs space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Zone #{index + 1}
                        </span>
                        {deliveryOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDeliveryOption(index)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove delivery option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <DeliveryAreaLocationFields
                        value={option}
                        error={deliveryErrors[index]}
                        onChange={(location) => handleDeliveryLocationChange(index, location)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Rate / Price
                          </label>
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) => handleDeliveryFieldChange(index, "price", e.target.value)}
                            placeholder="e.g. 2500"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kudu-orange/20 focus:border-kudu-orange"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Estimated Arrival Timeline
                          </label>
                          <input
                            type="text"
                            value={option.arrival_day}
                            onChange={(e) => handleDeliveryFieldChange(index, "arrival_day", e.target.value)}
                            placeholder="e.g. 1-2 business days"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kudu-orange/20 focus:border-kudu-orange"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
              >
                Create New Store
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewStore;
