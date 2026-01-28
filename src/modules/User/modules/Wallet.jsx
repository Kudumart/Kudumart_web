import { useState } from "react";
import Loader from "../../../components/Loader";
import useApiMutation from "../../../api/hooks/useApiMutation";
import useAppState from "../../../hooks/appState";
import { useGeoLocatorCurrency } from "../../../hooks/geoLocatorProduct";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../hooks/modal";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";

export default function Wallet() {
  const { user } = useAppState();
  // const [userProfile, setProfile] = useState(user);

  const { register, handleSubmit } = useForm();

  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  const currency = useGeoLocatorCurrency();
  const { mutate } = useApiMutation();

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/user/profile");
      return response.data;
    },
  });

  const { data: bankData, isLoading: isBankLoading } = useQuery({
    queryKey: ["bank-info", user.id],
    queryFn: async () => {
      const response = await apiClient.get("/vendor/bank/informations/");
      return response.data;
    },
  });

  const isLoading = isProfileLoading || isBankLoading;

  const onInitiateWithdrawal = (data) => {
    const payload = {
      ...data,
      bankInformationId: bankData?.data?.[0]?.id,
      currency: currency[0].name === "Naira" ? "NGN" : "USD",
    };

    mutate({
      url: "/vendor/withdrawal",
      method: "POST",
      data: payload,
      headers: true,
      onSuccess: () => {
        closeModal();
      },
      onError: () => {
        // Handle error
      },
    });
  };

  const initiateWithdrawal = () => {
    openModal({
      size: "sm",
      content: (
        <form
          className="grid grid-cols-2 gap-1"
          onSubmit={handleSubmit(onInitiateWithdrawal)}
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium mt-4 mb-2">
              Amount to Withdraw
            </label>
            <input
              type="number"
              id="amount"
              {...register("amount", { required: "Amount is required" })}
              placeholder="Enter amount"
              className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              style={{ outline: "none" }}
              required
            />
          </div>
          <div className="col-span-2 flex justify-center">
            <Button
              type="submit"
              className="bg-kudu-orange text-white normal-case text-sm font-medium rounded-md hover:bg-orange-600"
            >
              Initiate Withdrawal
            </Button>
          </div>
        </form>
      ),
    });
  };

  return (
    <>
      <div className="w-full p-6 bg-white shadow rounded-lg">
        <div className="flex w-full justify-between">
          <h2 className="text-lg font-bold mb-4">Wallet</h2>
          <Button
            className="bg-kudu-blue"
            onClick={() => navigate("add-account")}
            disabled={bankData?.data?.length > 0}
          >
            Add BANK ACCOUNT
          </Button>
        </div>

        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mt-4">
            <div className="w-full flex md:flex-row flex-col gap-3 justify-between">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-kudu-roman-silver font-semibold text-sm md:text-base">
                    Wallet Balance
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {currency[0].symbol}
                    {currency[0].name === "Naira"
                      ? Number(profileData?.data?.wallet || 0).toLocaleString(
                          "en-US",
                        )
                      : Number(
                          profileData?.data?.dollarWallet || 0,
                        ).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-kudu-roman-silver font-semibold text-sm md:text-base">
                    Pending Balance
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-orange-400">
                    {currency[0].symbol}
                    {currency[0].name === "Naira"
                      ? Number(
                          profileData?.data?.pendingWallet || 0,
                        ).toLocaleString("en-US")
                      : Number(
                          profileData?.data?.pendingDollarWallet || 0,
                        ).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
              <div className="">
                <Button
                  className="bg-kudu-orange"
                  onClick={() => initiateWithdrawal()}
                >
                  Withdraw
                </Button>
              </div>
            </div>

            <div className="mt-20 md:mt-10 w-full">
              {/* {JSON.stringify(bankData.data)}*/}
              {bankData?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                  {bankData?.data?.map((bank, index) => (
                    <div
                      data-theme="kudu"
                      key={index}
                      className="card bg-base-100 shadow-xl border border-gray-200"
                    >
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="card-title text-md text-gray-800">
                            {/* {JSON.stringify(bank)}*/}
                            {/* {bank.bankName}*/}
                          </h3>
                          <button
                            className="btn btn-primary btn-soft btn-sm"
                            onClick={() => navigate(`edit-account/${bank.id}`)}
                          >
                            Edit
                          </button>
                        </div>
                        <div className="card-title wrap-anywhere">
                          {decodeURIComponent(bank?.bankInfo)}
                        </div>
                        {/* <p className="text-sm text-gray-600">
                          <span className="font-medium">Account Number:</span>{" "}
                          {bank.accountNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Account Name:</span>{" "}
                          {bank.accountName}
                        </p>*/}
                        {/* {bank.swiftCode && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Swift/BIC Code:</span>{" "}
                            {bank.swiftCode}
                          </p>
                        )}
                        {bank.routingNumber && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Routing Number:</span>{" "}
                            {bank.routingNumber}
                          </p>
                        )}
                        {bank.bankAddress && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Bank Address:</span>{" "}
                            {bank.bankAddress}
                          </p>
                        )}*/}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-store">
                  <div className="text-center">
                    <img
                      src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                      alt="Empty Store Illustration"
                      className="w-80 h-80 mx-auto"
                    />
                  </div>
                  <h1 className="text-center text-lg font-bold mb-4">
                    No Account Added
                  </h1>

                  <div className="w-full flex justify-center p-1">
                    <Button
                      className="text-white"
                      onClick={() => navigate("add-account")}
                    >
                      ADD BANK ACCOUNT
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
