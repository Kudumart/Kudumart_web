import { useState } from "react";
import { useForm } from "react-hook-form";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../../../reducers/userSlice";
import { handleIncomingMessage } from "../../../App";

export default function ProfileSecurity() {
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useApiMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const changePassword = (passwordData) => {
    setIsLoading(true);
    delete passwordData.name;
    delete passwordData.email;
    mutate({
      url: "/user/profile/update/password",
      method: "PUT",
      data: passwordData,
      headers: true,
      onSuccess: (response) => {
        setIsLoading(false);
        dispatch(setKuduUser(null));
        localStorage.removeItem("kuduUserToken");
        navigate("/login");
      },
      onError: (error) => {
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 w-full gap-6">
      <div className="w-full bg-white rounded-lg p-6">
        <form
          className="grid grid-cols-2 gap-6"
          onSubmit={handleSubmit(changePassword)}
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-4 mt-4"
            >
              Current Passwords
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
      </div>
      {/* <div className="" data-theme="kudu">
        <div
          className="btn btn-primary"
          onClick={() => {
            const mockPayload = {
              notification: {
                title: "Mock",
                body: "This is a fake push message",
              },
              data: { custom: "toast" },
            };
            handleIncomingMessage(mockPayload);
            // window.dispatchEvent(
            //   new MessageEvent("message", { data: mockPayload }),
            // );
          }}
        >
          Test Push
        </div>
      </div>*/}
    </div>
  );
}
