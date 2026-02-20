import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiMutation from "../api/hooks/useApiMutation";
import useFileUpload from "../api/hooks/useFileUpload";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../reducers/userSlice";
import useAppState from "../hooks/appState";
import { useNavigate } from "react-router-dom";
import PaymentGateway from "../modules/SuperAdmin/Dashboard/PaymentGateway";
import Charges from "./admin/Charges";

const Setting = () => {
  const { user } = useAppState();
  const [activeTab, setActiveTab] = useState("profile");
  const [gateway, setGateway] = useState([]);
  const [profilePicture, setProfilePicture] = useState(
    user?.photo
      ? `${user?.photo}`
      : "https://res.cloudinary.com/greenmouse-tech/image/upload/v1737659699/kuduMart/Ellipse_1004_ouet7u.png",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { uploadFiles, isLoadingUpload } = useFileUpload();
  const navigate = useNavigate();

  const handlePictureChange = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      await uploadFiles(files, (uploadedUrl) => {
        setProfilePicture(uploadedUrl);
      });
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();

  const { mutate } = useApiMutation();

  const onSubmit = (data) => {
    const payload = { ...data, photo: profilePicture };
    setIsLoading(true);
    mutate({
      url: "/admin/profile/update",
      method: "PUT",
      data: payload,
      headers: true,
      onSuccess: (response) => {
        setIsLoading(false);
        dispatch(setKuduUser(response.data.data));
      },
      onError: (error) => {
        setIsLoading(false);
      },
    });
  };

  const changePassword = (passwordData) => {
    setIsLoading(true);
    delete passwordData.name;
    delete passwordData.email;
    mutate({
      url: "/admin/profile/update/password",
      method: "PUT",
      data: passwordData,
      headers: true,
      onSuccess: (response) => {
        setIsLoading(false);
        dispatch(setKuduUser(null));
        localStorage.removeItem("kuduUserToken");
        navigate("/auth/admin/login");
      },
      onError: (error) => {
        setIsLoading(false);
      },
    });
  };

  const getGateways = () => {
    mutate({
      url: `/admin/payment-gateways`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setGateway(response.data.data);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  useEffect(() => {
    getGateways();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="All">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-5">
          Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 bg-white rounded-lg p-6">
            <div className="flex md:flex-col space-x-4 md:space-x-0 md:m-5 md:space-y-4">
              <button
                className={`px-4 py-4 rounded-md ${activeTab === "profile" ? "bg-[#FFF1E9] text-black font-semibold" : "bg-gray-100"}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`px-4 py-4 rounded-md ${activeTab === "security" ? "bg-[#FFF1E9] text-black font-semibold" : "bg-gray-100"}`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
              <button
                className={`px-4 py-4 rounded-md ${activeTab === "paymentGateway" ? "bg-[#FFF1E9] text-black font-semibold" : "bg-gray-100"}`}
                onClick={() => setActiveTab("paymentGateway")}
              >
                Payment Gateway
              </button>
              <button
                className={`px-4 py-4 rounded-md ${activeTab === "Charges" ? "bg-[#FFF1E9] text-black font-semibold" : "bg-gray-100"}`}
                onClick={() => setActiveTab("Charges")}
              >
                Charges
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3 bg-white rounded-lg p-6">
            {activeTab === "profile" && (
              <>
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
                <tab
                  className="grid grid-cols-2 gap-6"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-4 mt-4"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="border rounded-lg p-4 w-full bg-gray-50"
                      placeholder="Enter last name"
                      value={user?.name}
                      style={{ outline: "none" }}
                      disabled
                      {...register("name")}
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
                      value={user?.email}
                      className="border rounded-lg p-4 w-full bg-gray-50"
                      placeholder="Enter email address"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-start">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-orange-500 text-white text-xs font-medium py-4 px-4 rounded-md hover:bg-orange-600"
                    >
                      Update Info
                    </button>
                  </div>
                </tab>
              </>
            )}

            {activeTab === "security" && (
              <>
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                <form
                  className="grid grid-cols-2 gap-6"
                  onSubmit={handleSubmit(changePassword)}
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium mb-4 mt-4"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      {...register("oldPassword")}
                      className="border rounded-lg p-4 w-full bg-gray-50"
                      placeholder="Enter current password"
                      style={{ outline: "none" }}
                    />
                    {errors.oldPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.oldPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium mb-4 mt-4"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      {...register("newPassword")}
                      className="border rounded-lg p-4 w-full bg-gray-50"
                      placeholder="Enter new password"
                      style={{ outline: "none" }}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-4 mt-4"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      {...register("confirmNewPassword")}
                      className="border rounded-lg p-4 w-full bg-gray-50"
                      placeholder="Confirm new password"
                      style={{ outline: "none" }}
                    />
                    {errors.confirmNewPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-start">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-orange-500 text-white text-xs font-medium py-4 px-4 rounded-md hover:bg-orange-600"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "paymentGateway" && (
              <PaymentGateway data={gateway} refetch={getGateways} />
            )}
            {activeTab == "Charges" && <Charges />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
