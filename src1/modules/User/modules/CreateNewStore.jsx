import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import NaijaStates from "naija-state-local-government";
import useApiMutation from "../../../api/hooks/useApiMutation";

const AddNewStore = () => {
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currencies, setCurrencies] = useState([]);

  const { mutate, isLoading } = useApiMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      deliveryOptions: [{ city: "", price: "", arrival_day: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "deliveryOptions",
  });

  const handleCountryChange = (e) => {
    const country = JSON.parse(e.target.value);
    setSelectedCountry(country);
    setSelectedState(null);
    setCities([]);
    setStates(State.getStatesOfCountry(country.isoCode));
  };

  const handleStateChange = (e) => {
    const state = JSON.parse(e.target.value);
    setSelectedState(state);

    if (selectedCountry?.name === "Nigeria") {
      const stateName = state.name.includes("Abuja") ? "Abuja" : state.name;
      const fetchedCities = NaijaStates.lgas(stateName).lgas.map((city) => ({
        name: city,
      }));
      setCities(fetchedCities);
    } else {
      setCities(City.getCitiesOfState(selectedCountry.isoCode, state.isoCode));
    }
  };

  const handleCityChange = (e) => {
    setSelectedCity(JSON.parse(e.target.value));
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      currencyId: data.currencyId,
      tipsOnFinding: data.tipsOnFinding,
      logo: "",
      location: {
        address: data.address,
        country: selectedCountry?.name,
        state: selectedState?.name,
        city: selectedCity?.name,
      },
      businessHours: {
        monday_friday: data.monday_friday,
        saturday: data.saturday,
        sunday: data.sunday,
      },
      deliveryOptions: data.deliveryOptions.map((opt) => ({
        city: opt.city,
        price: Number(opt.price),
        arrival_day: opt.arrival_day,
      })),
    };

    mutate({
      url: "/vendor/store",
      method: "POST",
      data: payload,
      headers: true,
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  useEffect(() => {
    mutate({
      url: `/vendor/currencies`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCurrencies(response.data.data);
      },
    });
  }, [mutate]);

  return (
    <div className="w-full">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mb-4">
          Add New Store
        </h2>
      </div>
      <div className="w-full flex grow">
        <div className="shadow-xl py-2 px-5 md:w-3/4 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            className="w-full flex flex-col items-center justify-center p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full p-6">
              <div className="mb-4">
                <label className="block text-md font-semibold mb-3">
                  Store Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Store name is required" })}
                  placeholder="Enter store's name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none placeholder-gray-400 text-sm mb-3"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

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
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none placeholder-gray-400 text-sm mb-3"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      Country
                    </label>
                    <select
                      {...register("country", {
                        required: "Country is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                      onChange={handleCountryChange}
                      defaultValue=""
                    >
                      <option value="" disabled>
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

                  <div className="col-span-6 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      State
                    </label>
                    <select
                      {...register("state", { required: "State is required" })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                      onChange={handleStateChange}
                      defaultValue=""
                    >
                      <option value="" disabled>
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

                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      City
                    </label>
                    <select
                      {...register("city", { required: "City is required" })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                      onChange={handleCityChange}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select city
                      </option>
                      {cities.map((city, idx) => (
                        <option value={JSON.stringify(city)} key={idx}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none placeholder-gray-400 text-sm mb-3"
                />
                {errors.tipsOnFinding && (
                  <p className="text-red-500 text-sm">
                    {errors.tipsOnFinding.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <label className="block text-md font-semibold mb-3">
                      Store Currency
                    </label>
                    <select
                      {...register("currencyId", {
                        required: "Currency is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select Currency
                      </option>
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
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      Monday - Friday
                    </label>
                    <input
                      type="text"
                      {...register("monday_friday", {
                        required: "Required",
                      })}
                      placeholder="9am - 5pm"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      Saturday
                    </label>
                    <input
                      type="text"
                      {...register("saturday", { required: "Required" })}
                      placeholder="9am - 5pm"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-md font-semibold mb-3">
                      Sunday
                    </label>
                    <input
                      type="text"
                      {...register("sunday", { required: "Required" })}
                      placeholder="9am - 5pm"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm mb-3"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold mb-4 uppercase">
                  Delivery Options
                </p>
                {fields.map((field, index) => (
                  <div
                    className="grid grid-cols-12 gap-3 mb-4 items-end"
                    key={field.id}
                  >
                    <div className="col-span-4">
                      <label className="block text-xs font-semibold mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        {...register(`deliveryOptions.${index}.city`, {
                          required: true,
                        })}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        {...register(`deliveryOptions.${index}.price`, {
                          required: true,
                        })}
                        placeholder="Price"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-semibold mb-1">
                        Timeline
                      </label>
                      <input
                        type="text"
                        {...register(`deliveryOptions.${index}.arrival_day`, {
                          required: true,
                        })}
                        placeholder="e.g 2-3 days"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-kudu-orange mt-2 hover:bg-orange-600 cursor-pointer text-white text-sm py-2 px-4 rounded-sm"
                  onClick={() =>
                    append({ city: "", price: "", arrival_day: "" })
                  }
                >
                  + Add Delivery Option
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary btn-block ${isLoading ? "loading" : ""}`}
                data-theme="kudu"
              >
                {isLoading ? "Creating..." : "Create New Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewStore;
