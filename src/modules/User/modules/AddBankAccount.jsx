import { useForm } from "react-hook-form";
import { useGeoLocatorCurrency } from "../../../hooks/geoLocatorProduct";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddBankAccount = () => {
  const currency = useGeoLocatorCurrency();
  const [disabled, setDisabled] = useState(false);

  const navigate = useNavigate();

  const { mutate } = useApiMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const createAccount = (data) => {
    setDisabled(true);
    const payload = {
      bankInfo: { ...data },
    };

    const query = formatPayloadAsQuery(payload.bankInfo);

    mutate({
      url: "/vendor/bank/informations",
      method: "POST",
      data: { bankInfo: query },
      headers: true,
      onSuccess: (response) => {
        navigate(-1);
        setDisabled(false);
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  const formatPayloadAsQuery = (data) => {
    return Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("?");
  };

  return (
    <div className="w-full">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700">
          Add Bank Account
        </h2>
      </div>
      <div className="w-full flex grow mt-3">
        <div className="shadow-xl py-2 px-5 md:w-3/4 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            className="w-full flex flex-col items-center justify-center p-4"
            onSubmit={handleSubmit(createAccount)}
          >
            <div className="w-full p-6">
              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="title"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("bankName", {
                    required: "Bank Name is required",
                  })}
                  placeholder="Enter bank name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="title"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("accountNumber", {
                    required: "Account Number is required",
                  })}
                  placeholder="Enter account number"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="title"
                >
                  Bank Account Name (Full Name)
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("accountName", {
                    required: "Account Name is required",
                  })}
                  placeholder="Enter account name"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              {currency[0].name !== "Naira" && (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="title"
                    >
                      SWIFT/BIC CODE
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register("swiftCode", {
                        required: "Swift Code is required",
                      })}
                      placeholder="Enter swift code"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="title"
                    >
                      Routing Number
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register("routingNumber", {
                        required: "Routing Number is required",
                      })}
                      placeholder="Enter routing number"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="title"
                    >
                      Bank Address (Optional)
                    </label>
                    <input
                      type="text"
                      id="title"
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
                  disabled={disabled}
                  className="btn btn-primary btn-block"
                  data-theme="kudu"
                >
                  Create Account
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBankAccount;
