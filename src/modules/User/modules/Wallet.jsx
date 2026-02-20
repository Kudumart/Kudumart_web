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

          <div className="mt-8 flex justify-end">
            <Button
              className="bg-kudu-orange px-8 py-3 rounded-xl shadow-lg shadow-kudu-orange/20"
              onClick={() => initiateWithdrawal()}
            >
              Request Payout
            </Button>
          </div>

          <div className="mt-12 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium capitalize text-gray-800">{tx.transactionType.replace("_", " ")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${tx.transactionType === "sale" ? "text-green-600" : "text-gray-800"}`}>
                          {tx.currency === "NGN" ? "₦" : "$"}{Number(tx.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${tx.status === "completed" ? "bg-green-100 text-green-700" :
                            tx.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {tx.note}
                      </td>
                    </tr>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-bold text-gray-800 mb-6">Bank Accounts</h3>
            {bankData?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bankData?.data?.map((bank, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{decodeURIComponent(bank?.bankInfo).split("&")[0].split("=")[1]}</h4>
                        <p className="text-sm text-gray-500">Bank Account Details</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gray-100 text-gray-600 shadow-none normal-case"
                        onClick={() => navigate(`edit-account/${bank.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {decodeURIComponent(bank?.bankInfo).split("&").map((item, i) => {
                        const [key, value] = item.split("=");
                        return value && value !== "undefined" ? (
                          <div key={i} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
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
        </div>
      )}
    </div>
  );
}
