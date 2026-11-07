import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { City, Country, State } from "country-state-city";
import { useNavigate, useParams } from 'react-router-dom';
import useApiMutation from '../../../api/hooks/useApiMutation';
import NaijaStates from 'naija-state-local-government';
import Loader from '../../../components/Loader';
import { Plus, Trash2, Truck } from 'lucide-react';
import DeliveryAreaLocationFields from '../../../components/DeliveryAreaLocationFields';

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
    const [deliveryErrors, setDeliveryErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutate } = useApiMutation();
    const navigate = useNavigate();
    const { id } = useParams();

    const watchCountry = watch("country");

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = async () => {
            try {
                const allCountries = Country.getAllCountries();
                setCountries(allCountries);
                await fetchCurrency();
                await fetchStoreData(allCountries);
            } catch (error) {
                console.error("Initialization error:", error);
                setLoading(false);
            }
        };

        initializeData();
    }, []);

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
                country: selectedCountry?.name || "Nigeria",
                countryCode: selectedCountry?.isoCode || "NG",
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

    // Transform form data for API submission
    const transformPayload = (formData) => {
        return {
            storeId: id,
            currencyId: formData.currencyId,
            name: formData.name,
            location: {
                address: formData.address,
                city: selectedCity?.name || '',
                state: selectedState?.name || '',
                country: selectedCountry?.name || '',
            },
            businessHours: {
                monday_friday: formData.monday_friday,
                saturday: formData.saturday,
                sunday: formData.sunday,
            },
            deliveryOptions: deliveryOptions.map((opt) => ({
                country: opt.country || '',
                countryCode: opt.countryCode || '',
                state: opt.state || '',
                stateCode: opt.stateCode || '',
                city: opt.city || '',
                scope: opt.scope || 'city',
                price: Number(opt.price) || 0,
                arrival_day: opt.arrival_day || '',
            })),
            tipsOnFinding: formData.tipsOnFinding,
            logo: "",
        };
    };

    // Handle form submission
    const onSubmit = async (formData) => {
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

        setIsSubmitting(true);
        try {
            const payload = transformPayload(formData);
            
            await mutate({
                url: '/admin/store',
                method: 'PUT',
                data: payload,
                headers: true,
            });
            
            navigate(-1);
        } catch (error) {
            console.error("Error updating store:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch currency data
    const fetchCurrency = async () => {
        return new Promise((resolve) => {
            mutate({
                url: `/admin/currencies`,
                method: "GET",
                headers: true,
                hideToast: true,
                onSuccess: (response) => {
                    setCurrencies(response.data.data);
                    resolve();
                },
                onError: () => resolve()
            });
        });
    };

    // Fetch store data with proper location initialization
    const fetchStoreData = async (allCountries) => {
        return new Promise((resolve) => {
            mutate({
                url: `/admin/store`,
                method: "GET",
                headers: true,
                hideToast: true,
                onSuccess: (response) => {
                    const store = response.data.data.find(s => s.id === id);
                    if (store) {
                        // Set basic fields
                        setValue("name", store.name);
                        setValue("address", store.location.address);
                        setValue("tipsOnFinding", store.tipsOnFinding);
                        setValue("currencyId", store.currencyId);
                        setValue("monday_friday", store.businessHours.monday_friday);
                        setValue("saturday", store.businessHours.saturday);
                        setValue("sunday", store.businessHours.sunday);

                        // Initialize location
                        const country = allCountries.find(c => c.name === store.location.country);
                        if (country) {
                            setSelectedCountry(country);
                            setValue("country", JSON.stringify(country));
                            
                            const countryStates = State.getStatesOfCountry(country.isoCode);
                            setStates(countryStates);

                            const state = countryStates.find(s => s.name === store.location.state);
                            if (state) {
                                setSelectedState(state);
                                setValue("state", JSON.stringify(state));

                                const stateCities = getCitiesForState(country, state);
                                setCities(stateCities);

                                const city = stateCities.find(c => c.name === store.location.city);
                                if (city) {
                                    setSelectedCity(city);
                                    setValue("city", JSON.stringify(city));
                                }
                            }
                        }

                        // Initialize delivery options
                        if (store.deliveryOptions?.length) {
                            const normalizedOptions = store.deliveryOptions.map((opt) => ({
                                country: opt.country || store.location?.country || "Nigeria",
                                countryCode: opt.countryCode || (opt.country === "United States" ? "US" : opt.country === "United Kingdom" ? "UK" : "NG"),
                                state: opt.state || store.location?.state || "",
                                stateCode: opt.stateCode || "",
                                city: opt.city || "",
                                scope: opt.scope || (opt.city ? "city" : opt.state ? "state" : "country"),
                                price: opt.price ?? 0,
                                arrival_day: opt.arrival_day || "",
                            }));
                            setDeliveryOptions(normalizedOptions);
                        } else {
                            setDeliveryOptions([{
                                country: "Nigeria",
                                countryCode: "NG",
                                state: "",
                                stateCode: "",
                                city: "",
                                scope: "city",
                                price: "",
                                arrival_day: "",
                            }]);
                        }
                    }
                    setLoading(false);
                    resolve();
                },
                onError: () => {
                    setLoading(false);
                    resolve();
                }
            });
        });
    };

    // Get cities for a state (handles Nigeria specially)
    const getCitiesForState = (country, state) => {
        if (country.name === "Nigeria") {
            return NaijaStates.lgas(state.name).lgas.map(name => ({ name }));
        }
        return City.getCitiesOfState(country.isoCode, state.isoCode);
    };

    // Handle country change
    const handleCountryChange = (e) => {
        if (!e.target.value) return;
        
        const country = JSON.parse(e.target.value);
        setSelectedCountry(country);
        setSelectedState(null);
        setSelectedCity(null);
        
        // Update form values
        setValue("country", e.target.value, { shouldValidate: true });
        setValue("state", "", { shouldValidate: true });
        setValue("city", "", { shouldValidate: true });
    
        const countryStates = State.getStatesOfCountry(country.isoCode);
        setStates(countryStates);
        setCities([]);
    };

    // Handle state change
    const handleStateChange = (e) => {
        if (!e.target.value || !selectedCountry) return;
        
        const state = JSON.parse(e.target.value);
        setSelectedState(state);
        setSelectedCity(null);
        setValue("city", "");

        const stateCities = getCitiesForState(selectedCountry, state);
        setCities(stateCities);
    };

    // Handle city change
    const handleCityChange = (e) => {
        if (!e.target.value) return;
        
        const city = JSON.parse(e.target.value);
        setSelectedCity(city);
    };


    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="All">
            <div className="rounded-md pb-2 w-full gap-5">
                <h2 className="text-lg font-semibold text-black-700 mt-4 mb-4">Update Store</h2>
            </div>
            
            <div className="w-full flex grow mt-3">
                <div className="shadow-xl py-2 px-5 md:w-3/5 w-full bg-white flex rounded-xl flex-col gap-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center justify-center p-4">
                        <div className="w-full p-6">
                            {/* Store Name */}
                            <div className="mb-4">
                                <label className="block text-md font-semibold mb-3">Store Name</label>
                                <input
                                    type="text"
                                    {...register("name", { required: "Store name is required" })}
                                    placeholder="Enter store's name"
                                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>

                            {/* Store Address */}
                            <div className="mb-4">
                                <label className="block text-md font-semibold mb-3">Store Address</label>
                                <input
                                    type="text"
                                    {...register("address", { required: "Store address is required" })}
                                    placeholder="Enter store address"
                                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                    required
                                />
                                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                            </div>

                            {/* Location */}
                            <div className="mb-4">
                                <div className="grid grid-cols-12 gap-3">
                                    {/* Country */}
                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">Country</label>
                                        <select
                                            {...register("country", { required: "Country is required" })}
                                            onChange={handleCountryChange}
                                            value={selectedCountry ? JSON.stringify(selectedCountry) : ""}
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                            required
                                        >
                                            <option value="" disabled>Select a country</option>
                                            {countries.map((country) => (
                                                <option value={JSON.stringify(country)} key={country.isoCode}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* State */}
                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">State</label>
                                        <select
                                            {...register("state", { required: "State is required" })}
                                            onChange={handleStateChange}
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                            required
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

                                    {/* City */}
                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">City</label>
                                        <select
                                            {...register("city", { required: "City is required" })}
                                            onChange={handleCityChange}
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                            required
                                            disabled={!selectedState}
                                        >
                                            <option value="" disabled>Select city</option>
                                            {cities.map((city, index) => (
                                                <option value={JSON.stringify(city)} key={city.isoCode || index}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tips for finding store */}
                            <div className="mb-4">
                                <label className="block text-md font-semibold mb-3">Tips for finding store</label>
                                <input
                                    type="text"
                                    {...register("tipsOnFinding", { required: "Tips on finding store is required" })}
                                    placeholder="Tips on finding store"
                                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                    required
                                />
                                {errors.tipsOnFinding && <p className="text-red-500 text-sm">{errors.tipsOnFinding.message}</p>}
                            </div>

                            {/* Store Currency */}
                            <div className="mb-4">
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">Store Currency</label>
                                        <select
                                            {...register("currencyId", { required: "Currency is required" })}
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
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

                            {/* Business Hours */}
                            <div className="mb-4">
                                <p className="text-sm font-semibold mb-4 uppercase">Business Hours</p>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">Monday - Friday</label>
                                        <input
                                            type="text"
                                            {...register("monday_friday", { required: "Business Hours are required" })}
                                            placeholder="Start Time and End Time"
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">Saturday</label>
                                        <input
                                            type="text"
                                            {...register("saturday", { required: "Business Hours are required" })}
                                            placeholder="Start Time and End Time"
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-6 gap-1">
                                        <label className="block text-md font-semibold mb-3">Sunday</label>
                                        <input
                                            type="text"
                                            {...register("sunday", { required: "Business Hours are required" })}
                                            placeholder="Start Time and End Time"
                                            className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
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
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-kudu-orange text-white py-2 px-4 rounded-md font-bold disabled:opacity-70"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Store'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateStore;