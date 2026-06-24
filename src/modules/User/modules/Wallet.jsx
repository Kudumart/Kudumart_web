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
import { toast } from "react-toastify";

export default function Wallet() {
  const { user } = useAppState();
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

  const { data: walletStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["wallet-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/vendor/wallet/stats");
      return response.data?.data;
    },
  });

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const response = await apiClient.get("/vendor/wallet/transactions");
      return response.data?.data;
    },
  });

  const { data: bankData, isLoading: isBankLoading } = useQuery({
    queryKey: ["bank-info", user.id],
    queryFn: async () => {
      const response = await apiClient.get("/vendor/bank/informations/");
      return response.data;
    },
  });

  const isLoading = isProfileLoading || isBankLoading || isStatsLoading;

  const onInitiateWithdrawal = (data) => {
    const payload = {
      ...data,
      bankInformationId: bankData?.data?.[0]?.id,
      currency: data.currency || (currency[0].name === "Naira" ? "NGN" : "USD"),
    };

    mutate({
      url: "/vendor/withdrawal",
      method: "POST",
      data: payload,
      headers: true,
      onSuccess: () => {
        closeModal();
        toast.success("Withdrawal initiated successfully");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to initiate withdrawal");
      },
    });
  };

  const initiateWithdrawal = () => {
    openModal({
      size: "sm",
      content: (
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={handleSubmit(onInitiateWithdrawal)}
        >
          <h2 className="text-xl font-bold">Request Payout</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Currency
            </label>
            <select
              {...register("currency", { required: true })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm"
              defaultValue={currency[0].name === "Naira" ? "NGN" : "USD"}
            >
              <option value="NGN">Naira (₦)</option>
              <option value="USD">Dollar ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount to Withdraw
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { required: "Amount is required" })}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg focus:outline-none text-sm"
              required
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="bg-kudu-orange text-white w-full py-3 normal-case text-sm font-medium rounded-md hover:bg-orange-600"
            >
              Initiate Withdrawal
            </Button>
          </div>
        </form>
      ),
    });
  };

  return (
    <div className="w-full p-6 bg-white shadow rounded-lg">
      <div className="flex w-full justify-between items-center">
        <h2 className="text-xl font-bold">Wallet</h2>
        <Button
          className="bg-kudu-blue normal-case py-2"
          onClick={() => navigate("add-account")}
          disabled={bankData?.data?.length > 0}
        >
          Add Bank Account
        </Button>
      </div>

      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="mt-8">
          {walletStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-blue-600 font-medium text-sm mb-2">Available (NGN)</p>
                <p className="text-2xl font-bold">₦{Number(walletStats?.availableNGN || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <p className="text-green-600 font-medium text-sm mb-2">Available (USD)</p>
                <p className="text-2xl font-bold">${Number(walletStats?.availableUSD || 0).toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <p className="text-orange-600 font-medium text-sm mb-2">Pending (NGN)</p>
                <p className="text-2xl font-bold">₦{Number(walletStats?.pendingNGN || 0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <p className="text-purple-600 font-medium text-sm mb-2">Pending (USD)</p>
                <p className="text-2xl font-bold">${Number(walletStats?.pendingUSD || 0).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {bankData?.data?.length > 0 ? (
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
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <img
                    src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                    alt="No bank account"
                    className="w-48 h-48 mx-auto opacity-50 mb-4"
                  />
                  <p className="text-gray-500 mb-6">No bank account added yet</p>
                  <Button
                    className="bg-kudu-blue normal-case"
                    onClick={() => navigate("add-account")}
                  >
                    Add Bank Account
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
