import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { City, Country, State } from "country-state-city";
import NaijaStates from "naija-state-local-government";
import useAppState from "../../../hooks/appState";
import useFileUpload from "../../../api/hooks/useFileUpload";
import { setKuduUser } from "../../../reducers/userSlice";
import { useDispatch } from "react-redux";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import Button from "../../../components/Button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function ProfileSettings() {
  const { user } = useAppState();

  // Extract location details from user object
  const parsedLocation = user.location ? user.location : {};

  const [isLoading, setIsLoading] = useState(true);
  const { mutate, isPending: isProfileSaving } = useApiMutation();
  const { mutate: updatePhone, isPending: isPhoneSaving } = useApiMutation();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      gender: user?.gender || "",
      country: parsedLocation.country || "",
      state: parsedLocation.state || "",
      city: parsedLocation.city || "",
    },
  });

  const [profilePicture, setProfilePicture] = useState(
    user.photo
      ? `${user.photo}`
      : "https://res.cloudinary.com/do2kojulq/image/upload/v1735426614/kudu_mart/victor-diallo_p03kd2.png",
  );
  const { uploadFiles, isLoadingUpload } = useFileUpload();

  const handlePictureChange = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      await uploadFiles(files, (uploadedUrl) => {
        mutate({
          url: "/user/profile/photo/update",
          method: "PATCH",
          data: { photo: uploadedUrl[0] },
          headers: true,
          onSuccess: (response) => {
            dispatch(setKuduUser(response.data.data));
            setProfilePicture(uploadedUrl);
          },
          onError: () => {},
        });
      });
    }
  };

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const selectedCountryName = watch("country");
  const selectedStateName = watch("state");

  // Handle Country Change
  useEffect(() => {
    if (selectedCountryName) {
      const country = countries.find((c) => c.name === selectedCountryName);
      if (country) {
        const fetchedStates = State.getStatesOfCountry(country.isoCode);
        setStates(fetchedStates);
      }
    } else {
      setStates([]);
    }
    setCities([]);
  }, [selectedCountryName, countries]);

  // Handle State Change
  useEffect(() => {
    if (selectedStateName && selectedCountryName) {
      const country = countries.find((c) => c.name === selectedCountryName);
      const state = states.find((s) => s.name === selectedStateName);

      if (country && state) {
        if (country.name === "Nigeria") {
          const fetchedCities = NaijaStates.lgas(state.name).lgas.map(
            (city) => ({
              name: city,
            }),
          );
          setCities(fetchedCities);
        } else {
          const fetchedCities = City.getCitiesOfState(
            country.isoCode,
            state.isoCode,
          );
          setCities(fetchedCities);
        }
      }
    } else {
      setCities([]);
    }
  }, [selectedStateName, selectedCountryName, states, countries]);

  // Initial Load and Sync
  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("gender", user.gender || "");

      if (parsedLocation.country) {
        setValue("country", parsedLocation.country);
        const countryObj = countries.find(
          (c) => c.name === parsedLocation.country,
        );
        if (countryObj) {
          const statesData = State.getStatesOfCountry(countryObj.isoCode);
          setStates(statesData);

          if (parsedLocation.state) {
            setValue("state", parsedLocation.state);
            const stateObj = statesData.find(
              (s) => s.name === parsedLocation.state,
            );
            if (stateObj) {
              let citiesData = [];
              if (countryObj.name === "Nigeria") {
                citiesData = NaijaStates.lgas(stateObj.name).lgas.map(
                  (city) => ({
                    name: city,
                  }),
                );
              } else {
                citiesData = City.getCitiesOfState(
                  countryObj.isoCode,
                  stateObj.isoCode,
                );
              }
              setCities(citiesData);
              if (parsedLocation.city) {
                setValue("city", parsedLocation.city);
              }
            }
          }
        }
      }
      setIsLoading(false);
    }
  }, [user, countries]);

  const saveProfile = (data) => {
    const payload = {
      ...data,
      location: { country: data.country, state: data.state, city: data.city },
      photo: profilePicture,
    };
    mutate({
      url: "/user/profile/update",
      method: "PUT",
      data: payload,
      headers: true,
      onSuccess: (response) => {
        dispatch(
          setKuduUser({
            ...response.data.data,
            location: response.data.data.location,
          }),
        );
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const onSubmit = (data) => {
    const normalizedPhoneNumber = data.phoneNumber
      ? `+${String(data.phoneNumber).replace(/\D/g, "")}`
      : "";
    const currentPhoneNumber = user?.phoneNumber
      ? `+${String(user.phoneNumber).replace(/\D/g, "")}`
      : "";

    if (normalizedPhoneNumber && normalizedPhoneNumber !== currentPhoneNumber) {
      updatePhone({
        url: "/user/profile/update/phone",
        method: "PUT",
        data: { newPhoneNumber: normalizedPhoneNumber },
        headers: true,
        onSuccess: () => saveProfile({ ...data, phoneNumber: normalizedPhoneNumber }),
      });
      return;
    }

    saveProfile(data);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 w-full gap-6">
      <div className="w-full bg-white rounded-lg p-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <label
            htmlFor="profilePicture"
            className="border rounded-lg px-4 py-2 text-sm text-gray-600 cursor-pointer"
          >
            {isLoadingUpload ? "Changing Picture" : "Change Picture"}
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              className="hidden"
              disabled={isLoadingUpload}
              onChange={handlePictureChange}
            />
          </label>
        </div>

        {/* Form */}
        <form
          className="grid grid-cols-2 gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium mb-4 mt-4"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className="border rounded-lg p-4 w-full bg-gray-50"
              placeholder="Enter first name"
              style={{ outline: "none" }}
              {...register("firstName")}
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium mb-4 mt-4"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className="border rounded-lg p-4 w-full bg-gray-50"
              placeholder="Enter last name"
              style={{ outline: "none" }}
              {...register("lastName")}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-4 mt-4"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="border rounded-lg p-4 w-full bg-gray-50"
              placeholder="Enter email address"
              style={{ outline: "none" }}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-4 mt-4"
            >
              Phone Number
            </label>
            <PhoneInput
              country="ng"
              value={watch("phoneNumber")}
              onChange={(value) =>
                setValue("phoneNumber", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              inputProps={{
                id: "phoneNumber",
                name: "phoneNumber",
                required: true,
                autoComplete: "tel",
              }}
              inputClass="!w-full !h-[58px] !bg-gray-50 !border-gray-200 !rounded-lg"
              buttonClass="!bg-gray-50 !border-gray-200 !rounded-l-lg"
              containerClass="!w-full"
              enableSearch
              countryCodeEditable={false}
            />
            <input
              type="hidden"
              {...register("phoneNumber", {
                required: "Phone number is required",
                validate: (value) =>
                  String(value || "").replace(/\D/g, "").length >= 10 ||
                  "Enter a valid phone number",
              })}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium mb-4 mt-4"
            >
              Gender
            </label>
            <select
              id="gender"
              className="border rounded-lg p-4 w-full bg-gray-50"
              style={{ outline: "none" }}
              {...register("gender", { required: "Gender is required" })}
            >
              <option value="" disabled>
                Tap to Select
              </option>
              <option value={"Male"}>Male</option>
              <option value={"Female"}>Female</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender.message}</p>
            )}
          </div>
          {/* Country Dropdown */}
          <div>
            <label className="block text-sm font-medium">Country</label>
            <select
              className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg"
              {...register("country", { required: "Country is required" })}
            >
              <option value="" disabled>
                Tap to Select
              </option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-medium">State</label>
            <select
              className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg"
              {...register("state", { required: "State is required" })}
              disabled={!selectedCountryName}
            >
              <option value="" disabled>
                Tap to Select
              </option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="col-span-2">
            <label className="block text-sm font-medium">City</label>
            <select
              className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg"
              {...register("city", { required: "City is required" })}
              disabled={!selectedStateName}
            >
              <option value="" disabled>
                Tap to Select
              </option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex justify-start">
            <Button
              type="submit"
              variant="primary"
              disabled={isProfileSaving || isPhoneSaving}
              isLoading={isProfileSaving || isPhoneSaving}
              className="py-4 px-4 text-xs"
            >
              Update Infos
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
