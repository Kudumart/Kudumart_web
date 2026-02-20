import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query"; // Import useQuery and useMutation
import { useGeoLocatorCurrency } from "../../../hooks/geoLocatorProduct";
import Loader from "../../../components/Loader";
import apiClient from "../../../api/apiFactory";

const EditBankAccount = () => {
  const currency = useGeoLocatorCurrency();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Function to format payload as query string (if needed by the API)
  const formatPayloadAsQuery = (data) => {
    return Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&"); // Changed from "?" to "&" for valid query string construction
  };

  // Function to parse query string into an object
  const parseQueryString = (queryString) => {
    if (!queryString) return {};
    const obj = {};
    queryString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) obj[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
    return obj;
  };

  // TanStack Query for fetching bank information
  const {
    data: bankDetails,
    isLoading: isBankInfoLoading,
    isError: isBankInfoError,
  } = useQuery({
    queryKey: ["bankInformation", id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/vendor/bank/information?bankId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
          },
        },
      );
      return parseQueryString(response.data.data.bankInfo);
    },
    enabled: !!id, // Only run the query if id is available
    staleTime: Infinity, // Data won't become stale
  });

  // TanStack Query for editing bank account
  const { mutate: editAccountMutation, isLoading: isEditing } = useMutation({
    mutationFn: async (data) => {
      const query = formatPayloadAsQuery(data);
      const response = await apiClient.put(
        "/vendor/bank/informations",
        { bankId: id, bankInfo: query },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error editing bank account:", error);
      // You might want to show a toast notification here
    },
  });

  useEffect(() => {
    if (bankDetails) {
      setValue("bankName", bankDetails.bankName);
      setValue("accountNumber", bankDetails.accountNumber);
      setValue("accountName", bankDetails.accountName);
      setValue("swiftCode", bankDetails.swiftCode);
      setValue("routingNumber", bankDetails.routingNumber);
      setValue("bankAddress", bankDetails.bankAddress);
    }
  }, [bankDetails, setValue]);

  const onSubmit = (data) => {
    editAccountMutation(data);
  };

  if (isBankInfoLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isBankInfoError) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        Error loading bank details.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700">
          Edit Bank Account
        </h2>
      </div>
      <div className="w-full flex grow mt-3">
        <div className="shadow-xl py-2 px-5 md:w-3/4 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            className="w-full flex flex-col items-center justify-center p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full p-6">
              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="bankName"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  {...register("bankName", {
                    required: "Bank Name is required",
                  })}
                  placeholder="Enter bank name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.bankName && (
                  <p className="text-red-500 text-xs italic">
                    {errors.bankName.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="accountNumber"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  {...register("accountNumber", {
                    required: "Account Number is required",
                  })}
                  placeholder="Enter account number"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-xs italic">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="accountName"
                >
                  Bank Account Name (Full Name)
                </label>
                <input
                  type="text"
                  id="accountName"
                  {...register("accountName", {
                    required: "Account Name is required",
                  })}
                  placeholder="Enter account name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
                {errors.accountName && (
                  <p className="text-red-500 text-xs italic">
                    {errors.accountName.message}
                  </p>
                )}
              </div>

              {currency[0]?.name !== "Naira" && (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="swiftCode"
                    >
                      SWIFT/BIC CODE
                    </label>
                    <input
                      type="text"
                      id="swiftCode"
                      {...register("swiftCode")}
                      placeholder="Enter swift code"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="routingNumber"
                    >
                      Routing Number
                    </label>
                    <input
                      type="text"
                      id="routingNumber"
                      {...register("routingNumber")}
                      placeholder="Enter routing number"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="bankAddress"
                    >
                      Bank Address (Optional)
                    </label>
                    <input
                      type="text"
                      id="bankAddress"
                      {...register("bankAddress")}
                      placeholder="Enter bank address"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                    />
                  </div>
                </>
              )}
              <div className="w-full md:w-2/5">
                <button
                  type="submit"
                  disabled={isEditing}
                  className="btn btn-primary btn-block"
                  data-theme="kudu"
                >
                  {isEditing ? "Saving..." : "Edit Account"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBankAccount;
