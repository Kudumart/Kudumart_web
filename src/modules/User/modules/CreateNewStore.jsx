import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import NaijaStates from "naija-state-local-government";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Button from "../../../components/Button";
import {
  Store,
  MapPin,
  Clock,
  Truck,
  DollarSign,
  Info,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";

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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      deliveryOptions: [{ city: "", price: "", arrival_day: "" }],
    },
  });

  const watchedStoreName = watch("name");

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

  const applySchedulePreset = (type) => {
    if (type === "standard") {
      setValue("monday_friday", "9:00 AM - 6:00 PM");
      setValue("saturday", "10:00 AM - 4:00 PM");
      setValue("sunday", "Closed");
    } else if (type === "always") {
      setValue("monday_friday", "Open 24 Hours");
      setValue("saturday", "Open 24 Hours");
      setValue("sunday", "Open 24 Hours");
    } else if (type === "weekdays") {
      setValue("monday_friday", "8:00 AM - 5:00 PM");
      setValue("saturday", "Closed");
      setValue("sunday", "Closed");
    }
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
    <div className="w-full min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to My Stores
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shrink-0">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create a New Store</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3" /> Vendor Onboarding
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Launch your storefront on Kudumart to start receiving customer orders and offers.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200/60">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Verified merchant protection enabled</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Main Column: Form Sections */}
            <div className="lg:col-span-2 space-y-6">

              {/* Section 1: Store Basics */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Store Profile</h2>
                    <p className="text-xs text-gray-500">Provide the fundamental identity of your shop</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Store name is required" })}
                      placeholder="e.g. Crown Gadgets & Tech Hub"
                      className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                        errors.name ? "border-red-400 bg-red-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Operating Currency <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("currencyId", { required: "Store currency is required" })}
                        className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer ${
                          errors.currencyId ? "border-red-400 bg-red-50/20" : "border-gray-200"
                        }`}
                        defaultValue=""
                      >
                        <option value="" disabled>Choose trading currency</option>
                        {currencies.map((currency) => (
                          <option value={currency.id} key={currency.id}>
                            {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    {errors.currencyId && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.currencyId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Landmark & Directions <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("tipsOnFinding", { required: "Landmark tips are required" })}
                      placeholder="e.g. Suite 12, 2nd Floor, Opposite Zenith Bank Plaza"
                      className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                        errors.tipsOnFinding ? "border-red-400 bg-red-50/20" : "border-gray-200"
                      }`}
                    />
                    <p className="text-xs text-gray-400 mt-1">Helps buyers locate your physical shop or pickup depot.</p>
                    {errors.tipsOnFinding && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.tipsOnFinding.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Physical Location */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Location & Address</h2>
                    <p className="text-xs text-gray-500">Where your store is registered and operates from</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("country", { required: "Country is required" })}
                        className={`w-full px-3.5 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                          errors.country ? "border-red-400 bg-red-50/20" : "border-gray-200"
                        }`}
                        onChange={handleCountryChange}
                        defaultValue=""
                      >
                        <option value="" disabled>Select country</option>
                        {countries.map((country) => (
                          <option value={JSON.stringify(country)} key={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        State / Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("state", { required: "State is required" })}
                        className={`w-full px-3.5 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                          errors.state ? "border-red-400 bg-red-50/20" : "border-gray-200"
                        }`}
                        onChange={handleStateChange}
                        defaultValue=""
                        disabled={!selectedCountry}
                      >
                        <option value="" disabled>Select state</option>
                        {states.map((state) => (
                          <option value={JSON.stringify(state)} key={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        City / LGA <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("city", { required: "City is required" })}
                        className={`w-full px-3.5 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                          errors.city ? "border-red-400 bg-red-50/20" : "border-gray-200"
                        }`}
                        onChange={handleCityChange}
                        defaultValue=""
                        disabled={!selectedState}
                      >
                        <option value="" disabled>Select city</option>
                        {cities.map((city, idx) => (
                          <option value={JSON.stringify(city)} key={idx}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("address", { required: "Street address is required" })}
                      placeholder="e.g. 14 Marina Street, Lagos Island"
                      className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm ${
                        errors.address ? "border-red-400 bg-red-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Business Hours */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Business Hours</h2>
                      <p className="text-xs text-gray-500">When your staff is available to process and dispatch orders</p>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applySchedulePreset("standard")}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-primary transition-colors text-gray-600 cursor-pointer"
                    >
                      9am - 6pm
                    </button>
                    <button
                      type="button"
                      onClick={() => applySchedulePreset("always")}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-primary transition-colors text-gray-600 cursor-pointer"
                    >
                      24/7
                    </button>
                    <button
                      type="button"
                      onClick={() => applySchedulePreset("weekdays")}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-primary transition-colors text-gray-600 cursor-pointer"
                    >
                      Mon - Fri Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Monday — Friday <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("monday_friday", { required: "Mon-Fri hours required" })}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Saturday <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("saturday", { required: "Saturday hours required" })}
                      placeholder="e.g. 10:00 AM - 4:00 PM"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Sunday <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("sunday", { required: "Sunday hours required" })}
                      placeholder="e.g. Closed or 12:00 PM - 5:00 PM"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Delivery Options */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Shipping & Delivery Rates</h2>
                      <p className="text-xs text-gray-500">Define shipping fees and expected delivery timelines by destination</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => append({ city: "", price: "", arrival_day: "" })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/60 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add City
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200/70 transition-all hover:border-gray-300"
                    >
                      <div className="w-full sm:flex-1">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Destination City
                        </label>
                        <input
                          type="text"
                          {...register(`deliveryOptions.${index}.city`, { required: true })}
                          placeholder="e.g. Lagos Mainland"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="w-full sm:w-36">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Rate (Fee)
                        </label>
                        <input
                          type="number"
                          {...register(`deliveryOptions.${index}.price`, { required: true })}
                          placeholder="e.g. 2500"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="w-full sm:w-44">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Estimated Timeline
                        </label>
                        <input
                          type="text"
                          {...register(`deliveryOptions.${index}.arrival_day`, { required: true })}
                          placeholder="e.g. 1-2 business days"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2 sm:mt-5 self-end sm:self-center cursor-pointer"
                          title="Remove delivery option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Guidance & Live Preview Card */}
            <div className="space-y-6">

              {/* Live Preview Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sticky top-28">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Preview</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">
                    Active Preview
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3.5 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-primary font-bold text-xl border border-white/10">
                      {watchedStoreName ? watchedStoreName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white truncate max-w-[170px]">
                        {watchedStoreName || "Your Store Name"}
                      </h3>
                      <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary" />
                        {selectedCity?.name || selectedState?.name || "Location Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Merchant Status</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Instant Listing
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Delivery Cities</span>
                      <span className="text-white font-medium">{fields.length} Configured</span>
                    </div>
                  </div>
                </div>

                {/* Merchant Checklist */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Merchant Checklist</h4>
                  
                  <div className="flex items-start gap-2.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Distinctive store name to build buyer recognition</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Accurate landmark for customer pickup trust</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Clear delivery fees to avoid checkout disputes</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    className="shadow-md shadow-primary/20"
                  >
                    Publish Storefront
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => navigate(-1)}
                    className="text-gray-500"
                  >
                    Cancel & Return
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default AddNewStore;
