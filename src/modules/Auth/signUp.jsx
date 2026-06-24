import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Checkbox } from "@material-tailwind/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useForm } from "react-hook-form";
import useApiMutation from "../../api/hooks/useApiMutation";
import { useDispatch } from "react-redux";
import useAppState from "../../hooks/appState";
import { setKuduUser } from "../../reducers/userSlice";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState("Customer");
  const dispatch = useDispatch();

  const { ipInfo } = useAppState();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const { mutate } = useApiMutation();

  const onSubmit = (data) => {
    setIsLoading(true);
    const url = accountType === "Vendor" ? "/auth/register/vendor" : "/auth/register/customer";
    mutate({
      url,
      method: "POST",
      data: { ...data, platform: "web" },
      onSuccess: (response) => {
        localStorage.setItem("kuduEmail", JSON.stringify(data.email));
        toast.success("Verification Sent to Email");
        setIsLoading(false);
        navigate("/login");
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const handleSignUpGoogle = async (data) => {
    try {
      const payload = {
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
        providerId: "google.com",
        accountType: "Customer",
        platform: "web",
      };
      setIsLoading(true);
      mutate({
        url: "/auth/google",
        method: "POST",
        data: payload,
        onSuccess: (response) => {
          localStorage.setItem("kuduUserToken", response.data.data.token);
          dispatch(setKuduUser(response.data.data));
          navigate("/profile");
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <div className="relative pt-12">
      <img
        src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736942330/Sign_Up_1_og6gq5.jpg"
        className="fixed inset-0"
      />
      {/* Form Card */}
      <div className="w-full max-w-xl  mx-auto px-6 py-6 bg-white/20 backdrop-blur-lg rounded-lg">
        <div className="w-full px-4 py-4 bg-white rounded-lg">
          {/* Logo Section */}
          <div className="mb-6 flex justify-center">
            <Link to={"/"}>
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737211689/kuduMart/kudum_1_urk9wm.png"
                alt="Kudu Logo"
                sizes="20vw"
                width={250}
                height={33}
              />
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-black-800">Sign Up</h2>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("Customer")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${accountType === "Customer"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("Vendor")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${accountType === "Vendor"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              Vendor
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* First Name Field */}
            <div>
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter First Name"
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter Last Name"
                {...register("lastName", { required: "Last name is required" })}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <PhoneInput
                country={ipInfo?.country?.toLowerCase()}
                inputProps={{
                  name: "phoneNumber",
                  required: true,
                }}
                onChange={(value) => {
                  // Ensure `+` is included and validate
                  if (!value.startsWith("+")) {
                    value = "+" + value;
                  }
                  setValue("phoneNumber", value, { shouldValidate: true });
                }}
                containerClass="w-full"
                dropdownClass="flex flex-col gap-2 text-black font-sans"
                buttonClass="bg-gray-100! border! border-gray-100! hover:bg-gray-100!"
                inputClass="w-full! px-4 font-sans h-[54px]! py-4! bg-gray-100! border! border-gray-100! rounded-lg! focus:outline-hidden placeholder-gray-400 text-sm! mb-3"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">Phone number is required</p>
              )}
            </div>
            {/* Add hidden input for validation */}
            <input
              type="hidden"
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
            />
            {/* Email Field */}
            <div>
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Your email address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                })}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <img
                      src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426587/kudu_mart/eye-password_yjivzt.png"
                      alt="Hide Password"
                      className="w-5"
                    />
                  ) : (
                    <img
                      src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426587/kudu_mart/eye-password_yjivzt.png"
                      alt="Show Password"
                      className="w-5"
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex flex-col text-sm md:mt-8">
              <Checkbox
                id="terms"
                {...register("terms", {
                  required: "You must agree to the terms",
                })}
                color="orange"
                label={
                  <>
                    <span className="cursor-default">I agree to </span>
                    <NavLink to={"/terms-condition"} className="underline">
                      terms and policies
                    </NavLink>
                    <span className="cursor-default"> from Kudu</span>
                  </>
                }
              />
              {errors.terms && (
                <p className="text-red-500 text-sm ml-2">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                data-theme="kudu"
                className="btn btn-primary btn-block"
              >
                Sign Up →
              </button>
            </div>
          </form>

          <div className="flex gap-4 w-full mb-4">
            <hr
              className="w-full flex mt-3"
              style={{ backgroundColor: "rgba(141, 141, 141, 1)" }}
            />
            <div className="flex text-gray-500">or</div>
            <hr
              className="w-full flex mt-3"
              style={{ backgroundColor: "rgba(141, 141, 141, 1)" }}
            />
          </div>

          <div className="flex flex-row justify-center gap-4 w-full">
            <div className="w-full bg-white text-black px-4 flex items-center justify-center gap-2 rounded-lg">
              <GoogleLogin
                size="large"
                text="signup_with"
                theme="outlined"
                onSuccess={(credentialResponse) => {
                  handleSignUpGoogle(jwtDecode(credentialResponse.credential));
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 leading-loose">
              <Link
                to={"/login"}
                className="text-orange-500 font-semibold hover:underline leading-loose"
              >
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  c;
}

export default SignUp;
