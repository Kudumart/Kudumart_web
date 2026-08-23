import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import NaijaStates from "naija-state-local-government";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Button from "../../../components/Button";

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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Add New Store</h2>
        <p className="text-gray-500 mt-1">Provide the details below to list a new store on Kudumart.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Card 1: Store Information */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Store Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                {...register("name", { required: "Store name is required" })}
                placeholder="Enter store name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Currency</label>
              <select
                {...register("currencyId", { required: "Currency is required" })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                defaultValue=""
              >
                <option value="" disabled>Select Currency</option>
                {currencies.map((currency) => (
                  <option value={currency.id} key={currency.id}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              {errors.currencyId && <p className="text-red-500 text-xs mt-1">{errors.currencyId.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tips for finding store</label>
              <input
                type="text"
                {...register("tipsOnFinding", { required: "Tips on finding store is required" })}
                placeholder="e.g. Opposite the main bank building"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
              {errors.tipsOnFinding && <p className="text-red-500 text-xs mt-1">{errors.tipsOnFinding.message}</p>}
            </div>
          </div>
        </div>

        {/* Card 2: Location Details */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Location Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <select
                {...register("country", { required: "Country is required" })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                onChange={handleCountryChange}
                defaultValue=""
              >
                <option value="" disabled>Select a country</option>
                {countries.map((country) => (
                  <option value={JSON.stringify(country)} key={country.isoCode}>{country.name}</option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <select
                {...register("state", { required: "State is required" })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                onChange={handleStateChange}
                defaultValue=""
              >
                <option value="" disabled>Select state</option>
                {states.map((state) => (
                  <option value={JSON.stringify(state)} key={state.isoCode}>{state.name}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <select
                {...register("city", { required: "City is required" })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                onChange={handleCityChange}
                defaultValue=""
              >
                <option value="" disabled>Select city</option>
                {cities.map((city, idx) => (
                  <option value={JSON.stringify(city)} key={idx}>{city.name}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Address</label>
            <input
              type="text"
              {...register("address", { required: "Store address is required" })}
              placeholder="Enter full street address"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
        </div>

        {/* Card 3: Business Hours */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monday - Friday</label>
              <input
                type="text"
                {...register("monday_friday", { required: "Required" })}
                placeholder="e.g. 9am - 5pm"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Saturday</label>
              <input
                type="text"
                {...register("saturday", { required: "Required" })}
                placeholder="e.g. 10am - 4pm or Closed"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sunday</label>
              <input
                type="text"
                {...register("sunday", { required: "Required" })}
                placeholder="e.g. Closed"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Delivery Options */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Delivery Options</h3>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => append({ city: "", price: "", arrival_day: "" })}
            >
              + Add Option
            </Button>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100"
                key={field.id}
              >
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    {...register(`deliveryOptions.${index}.city`, { required: true })}
                    placeholder="e.g. Lagos"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    {...register(`deliveryOptions.${index}.price`, { required: true })}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="col-span-10 md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Timeline</label>
                  <input
                    type="text"
                    {...register(`deliveryOptions.${index}.arrival_day`, { required: true })}
                    placeholder="e.g. 2-3 days"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end items-end h-full pb-1">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                      title="Remove Option"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-4 pb-12">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate(-1)}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="sm:w-auto px-8"
            isLoading={isLoading}
          >
            Create New Store
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewStore;
