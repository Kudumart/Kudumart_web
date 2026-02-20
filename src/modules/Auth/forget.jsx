import React, { useState } from "react";
import useApiMutation from "../../api/hooks/useApiMutation";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

function Forget() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordBlock, setPasswordBlock] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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
    localStorage.setItem("kuduEmail", JSON.stringify(data.email));
    setIsLoading(true);
    mutate({
      url: "/auth/password/forgot",
      method: "POST",
      data: data,
      onSuccess: (response) => {
        setIsLoading(false);
        setPasswordBlock(true);
        // navigate('/login');
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const resetPassword = (data) => {
    const email = localStorage.getItem("kuduEmail");
    const payload = { ...data, email: JSON.parse(email) };
    setIsLoading(true);
    mutate({
      url: "/auth/password/reset",
      method: "POST",
      data: payload,
      onSuccess: (response) => {
        setIsLoading(false);
        navigate("/login");
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const handleResend = () => {
    const email = localStorage.getItem("kuduEmail");
    const payload = { email: JSON.parse(email) };
    mutate({
      url: "/auth/resend/verification/email",
      method: "POST",
      data: payload,
      onSuccess: (response) => {},
      onError: () => {},
    });
  };

  return (
    <div
      className={`w-full ${passwordBlock ? "h-full" : "h-screen"} flex flex-col justify-center items-center`}
      style={{
        backgroundImage: `
  url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736943190/Reset_Password_xqqki7.jpg
`,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      {/* Form Card */}
      <div className="w-full max-w-lg px-6 py-6 bg-white/20 backdrop-blur-lg rounded-lg">
        {!passwordBlock ? (
          <div className="w-full max-w-lg px-4 py-4 bg-white rounded-lg">
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
            <h2 className="text-2xl font-bold mb-3 text-black-800">
              Reset Password{" "}
            </h2>
            <p className="leading-loose text-sm mb-3">
              Enter the email address associated with your account and we’ll
              send a link to reset your password
            </p>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email Field */}
              <div>
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Enter a valid email address",
                    },
                  })}
                  placeholder="Your email address"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                data-theme="kudu"
                className="btn btn-primary"
              >
                Get Reset Password Link →
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <Link
                to={"/login"}
                className="text-sm text-gray-600 leading-loose"
              >
                Back to Login{" "}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/** RESET PASSWORD BLOCK **/}
            <div className="w-full max-w-lg px-8 py-10 bg-white rounded-lg ">
              <h2 className="text-2xl font-bold mb-6 text-black-800">
                Reset Password
              </h2>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(resetPassword)}
              >
                {/* Email Field */}
                <div>
                  <label
                    className="block text-md font-semibold mb-3"
                    htmlFor="email"
                  >
                    OTP
                  </label>
                  <input
                    type="text"
                    id="email"
                    {...register("otpCode", {
                      required: "OTP Code is required",
                    })}
                    placeholder="Enter OTP sent to your email address"
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                    style={{ outline: "none" }}
                    required
                  />
                  {errors.otpCode && (
                    <p className="text-red-500 text-sm">
                      {errors.otpCode.message}
                    </p>
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
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("newPassword", {
                        required: "newPassword is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      required
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
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    className="block text-md font-semibold mb-3"
                    htmlFor="password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirm password"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("confirmPassword", {
                        required: "Confirm Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      required
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
                </div>

                <div className="flex justify-between items-center text-sm mb-4">
                  <span
                    className="text-orange-500 cursor-pointer"
                    onClick={() => handleResend()}
                  >
                    Resend OTP
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  data-theme="kudu"
                  className="btn btn-primary"
                >
                  Reset Password →
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Forget;
