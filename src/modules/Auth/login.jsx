import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useApiMutation from "../../api/hooks/useApiMutation";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../../reducers/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { toast } from "react-toastify";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
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
  const login_mutation = useMutation({
    mutationFn: async () => {
      let resp = await apiClient.post("/auth/login", {
        email: getValues("email"),
        password: getValues("password"),
        platform: "web",
      });
      return resp;
    },
    onSuccess: (response) => {
      delete response.data.data.password;
      localStorage.setItem("kuduUserToken", response.data.data.token);
      dispatch(setKuduUser(response.data.data));
      window.location.href = "/profile";
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      if (
        error.response.data.message ===
        "Your email is not verified. A verification email has been sent to your email address."
      ) {
        localStorage.setItem("kuduEmail", JSON.stringify(data.email));
        toast.error(error.response.data.message);
      }
      setIsLoading(false);
    },
  });

  const onSubmit = (data) => {
    setIsLoading(true);
    toast.promise(
      async () => {
        return await login_mutation.mutateAsync();
      },
      {
        pending: "Logging in...",
        success: "Logged in successfully!",
        // error: (err) => {
        //   console.log(err, "err");
        //   return "Failed to login!";
        // },
      },
    );
    // mutate({
    //   url: "/auth/login",
    //   method: "POST",
    //   data: data,
    //   onSuccess: (response) => {
    //     delete response.data.data.password;
    //     localStorage.setItem("kuduUserToken", response.data.data.token);
    //     dispatch(setKuduUser(response.data.data));
    //     window.location.href = "/profile";
    //     setIsLoading(false);
    //   },
    //   onError: (error) => {
    //     if (
    //       error.response.data.message ===
    //       "Your email is not verified. A verification email has been sent to your email address."
    //     ) {
    //       localStorage.setItem("kuduEmail", JSON.stringify(data.email));
    //       toast.error(error.response.data.message);
    //     }
    //     setIsLoading(false);
    //   },
    // });
  };

  const handleSignInGoogle = async (data) => {
    try {
      const payload = {
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
        providerId: "google.com",
        accountType: "Customer",
      };
      setIsLoading(true);
      mutate({
        url: "/auth/google",
        method: "POST",
        data: payload,
        onSuccess: (response) => {
          localStorage.setItem("kuduUserToken", response.data.data.token);
          dispatch(setKuduUser(response.data.data));
          setTimeout(() => {
            window.location.href = "/profile";
          }, 2000);
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

  useEffect(() => {
    dispatch(setKuduUser(null));
    localStorage.removeItem("kuduUserToken");
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center"
      style={{
        backgroundImage: `
  url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736942330/Sign_Up_1_og6gq5.jpg
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
        <div className="w-full max-w-lg px-4 py-4 bg-white rounded-lg ">
          {/* Logo Section */}
          <div className="flex justify-center">
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
          <h2 className="text-2xl font-bold mb-6 text-black-800">Sign In</h2>
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
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Enter password"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
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
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center text-sm mb-4">
              <Link to={"/forget"} className="text-orange-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={login_mutation.isPending}
              data-theme="kudu"
              className="btn btn-primary"
            >
              Sign In →
            </button>
          </form>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <div className="w-full bg-white text-black px-4 flex items-center justify-center gap-2 rounded-lg">
              <GoogleLogin
                size="large"
                text="signin_with"
                theme="outlined"
                onSuccess={(credentialResponse) => {
                  handleSignInGoogle(jwtDecode(credentialResponse.credential));
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
              Don’t have an account? <br />
              <Link
                to={"/sign-up"}
                className="text-orange-500 font-semibold hover:underline leading-loose"
              >
                Sign Up →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
