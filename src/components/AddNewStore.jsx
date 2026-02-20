import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import useApiMutation from "../api/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import NaijaStates from "naija-state-local-government";

const AddNewStore = () => {
  const [countries, setCountries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);

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
      deliveryOptions: Object.keys(input)
        .filter((key) => key.startsWith("city"))
        .map((key) => {
          const index = key.match(/\d+/)[0]; // Extract the number from the key
          return {
            city: input[`city${index}`],
            price: Number(input[`price${index}`]),
            arrival_day: input[`arrival_day${index}`],
          };
        }),
      tipsOnFinding: input.tipsOnFinding,
      logo: "",
    };
  };

  const onSubmit = (data) => {
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
      onSuccess: (response) => {
        navigate(-1);
      },
      onError: () => {
        closeModal();
      },
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

  const populateDeliveryOption = () => {
    setDeliveryOptions((prevOptions) => [
      ...prevOptions,
      {
        city: null,
        price: null,
        arrival_day: null,
      },
    ]);
  };

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

              <div className="mb-4">
                <p className="text-sm font-semibold mb-4 uppercase">
                  Delivery Options
                </p>
                {deliveryOptions.map((deliveryOption, index) => (
                  <div className="grid grid-cols-12 gap-3" key={index}>
                    <div className="col-span-6 gap-1">
                      <label
                        className="block text-md font-semibold mb-3"
                        htmlFor="email"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        {...register(`city${index}`, {
                          required: "Delivery City is required",
                        })}
                        placeholder="Enter delivery city"
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
                        Price
                      </label>
                      <input
                        type="text"
                        id="price"
                        {...register(`price${index}`, {
                          required: "Price is required",
                        })}
                        placeholder="Enter price"
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
                        Arrival Day
                      </label>
                      <input
                        type="text"
                        id="arrival_day"
                        {...register(`arrival_day${index}`, {
                          required: "Arrival day is required",
                        })}
                        placeholder="Enter arrival day"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        style={{ outline: "none" }}
                        required
                      />
                    </div>
                  </div>
                ))}
                <span
                  className="bg-kudu-orange mt-2 hover:bg-blue-700 cursor-pointer text-white text-sm  py-2 px-4 rounded-sm"
                  onClick={() => populateDeliveryOption()}
                >
                  + Add Delivery Option
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-block"
                data-theme="kudu"
              >
                Create New Store
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewStore;
