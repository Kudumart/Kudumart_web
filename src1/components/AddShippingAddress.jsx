import { useState } from "react";
import { State, City } from "country-state-city";
import useAppState from "../hooks/appState";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import NaijaStates from "naija-state-local-government";
import useApiMutation from "../api/hooks/useApiMutation";
import { setKuduUser } from "../reducers/userSlice";

const AddShippingAddress = ({ isOpen, closeModal, countries }) => {
  const { user } = useAppState();
  const dispatch = useDispatch();

  const { mutate } = useApiMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const handleCountryChange = (isoCode) => {
    if (!isoCode) return;
    const country = countries.find((c) => c.name === isoCode);
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates(State.getStatesOfCountry(country.isoCode));
    setCities([]);
  };

  const handleStateChange = (isoCode) => {
    if (!isoCode || !selectedCountry) return;

    const state = states.find((s) => s.name === isoCode);

    setSelectedState(state);
    setSelectedCity(null);

    if (selectedCountry.name === "Nigeria") {
      const fetchedCities = NaijaStates.lgas(state.name).lgas.map((city) => ({
        name: city,
      }));
      setCities(fetchedCities);
    } else {
      // Fetch cities using isoCode directly
      const fetchedCities = City.getCitiesOfState(
        selectedCountry?.isoCode,
        isoCode,
      );
      setCities(fetchedCities);
    }
  };

  const handleCityChange = (cityName) => {
    if (!cityName || !selectedState) return;
    setSelectedCity(cities.find((c) => c.name === cityName));
  };

  const onSubmit = (formData) => {
    formData.city = `${formData.street}, ${formData.city}`;
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: null,
      gender: null,
      location: { ...formData },
    };

    mutate({
      url: "/user/profile/update",
      method: "PUT",
      data: payload,
      headers: true,
      onSuccess: (response) => {
        dispatch(setKuduUser(response.data.data));
        closeModal();
      },
      onError: (error) => {},
    });
  };

  return isOpen ? (
    <form className="grid grid-cols-2 gap-1" onSubmit={handleSubmit(onSubmit)}>
      {/* Country Selection */}
      <div className="col-span-2">
        <label className="block text-sm font-medium mt-4">Country</label>
        <select
          className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden text-sm mb-3"
          {...register("country", { required: "Country is required" })}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="" disabled selected>
            Tap to Select
          </option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="text-red-500 text-sm">{errors.country.message}</p>
        )}
      </div>

      {/* State Selection */}
      <div className="col-span-2">
        <label className="block text-sm font-medium mt-4">State</label>
        <select
          className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden text-sm mb-3"
          {...register("state", { required: "State is required" })}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={!selectedCountry}
        >
          <option value="" disabled selected>
            Tap to Select
          </option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="text-red-500 text-sm">{errors.state.message}</p>
        )}
      </div>

      {/* City Selection */}
      <div className="col-span-2">
        <label className="block text-sm font-medium mt-4">City</label>
        <select
          className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden text-sm mb-3"
          onChange={(e) => handleCityChange(e.target.value)}
          {...register("city", { required: "City is required" })}
          disabled={!selectedState}
        >
          <option value="" disabled selected>
            Tap to Select
          </option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="text-red-500 text-sm">{errors.city.message}</p>
        )}
      </div>

      {/* Street Field */}
      <div className="col-span-2">
        <label className="block text-md font-medium mb-3" htmlFor="email">
          Street
        </label>
        <input
          type="text"
          id="email"
          {...register("street", {
            required: "Address is required",
          })}
          placeholder="Your house address"
          className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
          style={{ outline: "none" }}
          required
        />
        {errors.street && (
          <p className="text-red-500 text-sm">{errors.street.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="col-span-2 mb-4 flex justify-start">
        <button
          type="submit"
          className="bg-kudu-orange text-white text-sm font-medium py-4 px-4 rounded-md hover:bg-orange-600"
        >
          Create Shipping Address
        </button>
      </div>
    </form>
  ) : null;
};

export default AddShippingAddress;
