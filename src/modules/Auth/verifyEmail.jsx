import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useApiMutation from "../../api/hooks/useApiMutation";
import { Link, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const email = localStorage.getItem("kuduEmail");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    const payload = { ...data, email: JSON.parse(email) };
    mutate({
      url: "/auth/verify/email",
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
      className="w-full h-screen flex flex-col justify-center items-center"
      style={{
        backgroundImage: `
  url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736937255/Sign_Up_oip09b.jpg
`,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
      }}
    >
      {/* Form Card */}
      <div className="w-full max-w-lg px-6 py-6 bg-white/20 backdrop-blur-lg rounded-lg">
        <div className="w-full max-w-lg px-8 py-10 bg-white rounded-lg ">
          <div className="flex justify-center mb-6">
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
          <h2 className="text-2xl font-bold mb-6 text-black-800">
            Verify Account
          </h2>
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
                OTP
              </label>
              <input
                type="text"
                id="email"
                {...register("otpCode", { required: "OTP Code is required" })}
                placeholder="Enter OTP sent to your email address"
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                style={{ outline: "none" }}
                required
              />
              {errors.otpCode && (
                <p className="text-red-500 text-sm">{errors.otpCode.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center text-sm mb-4">
              <span
                className="text-orange-500 cursor-pointer"
                onClick={() => handleResend()}
              >
                Resend Verification OTP
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-theme="kudu"
              className="btn btn-primary"
            >
              Verify →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
