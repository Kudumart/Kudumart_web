import { useForm } from "react-hook-form";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSubscription = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { mutate } = useApiMutation();
  const navigate = useNavigate();

  const [hideAuctions, setAuctions] = useState(false);
  const [hideAdverts, setAdverts] = useState(false);
  const [hideServiceAds, setHideServiceAds] = useState(false); // Added state for service ads
  const [currencies, setCurrencies] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    getAdminCurrencies();
  }, []);

  const getAdminCurrencies = () => {
    mutate({
      url: "/admin/currencies",
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCurrencies(response.data.data);
      },
      onError: () => {},
    });
  };

  const onSubmit = (data) => {
    data.duration = Number(data.duration);
    data.productLimit = Number(data.productLimit);
    data.auctionProductLimit = Number(data.auctionProductLimit);
    data.price = Number(data.price);
    data.allowsAuction = data.allowsAuction === "true";
    // data.serviceLimit = Number(data.serviceLimit);
    data.allowsServiceAds = data.allowsServiceAds === "true"; // Added parsing for allowsServiceAds
    data.serviceAdsLimit = Number(data.serviceAdsLimit); // Added parsing for serviceAdsLimit

    setDisabled(true);
    mutate({
      url: "/admin/subscription/plan/create",
      method: "POST",
      data: data,
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

  const handleAllowAuctions = (value) => {
    if (value === "true") {
      setAuctions(false);
    } else {
      setAuctions(true);
      setValue("auctionProductLimit", ""); // Reset the field value
    }
  };

  const handleAllowAdverts = (value) => {
    if (value === "true") {
      setAdverts(false);
    } else {
      setAdverts(true);
      setValue("maxAds", ""); // Reset the field value
      setValue("adsDurationDays", ""); // Reset the field value
    }
  };

  // Handler for Allow Service Ads
  const handleAllowServiceAds = (value) => {
    if (value === "true") {
      setHideServiceAds(false);
    } else {
      setHideServiceAds(true);
      setValue("serviceAdsLimit", ""); // Reset the field value
    }
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="All">
          <div className="rounded-md pb-2 w-full flex justify-between gap-5">
            <h2 className="text-lg font-semibold text-black-700 mt-4">
              Create Subscription Plan
            </h2>
          </div>
          <div className="w-full flex grow mt-3">
            <div className="shadow-xl py-2 px-5 md:w-3/5 w-full bg-white flex rounded-xl flex-col gap-10">
              <form
                className="w-full flex flex-col items-center justify-center p-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="w-full p-6">
                  {/* Plan Name */}
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Plan Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name", {
                        required: "Plan name is required",
                      })}
                      placeholder="Enter plan name"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Product Limit
                    </label>
                    <input
                      type="text"
                      id="productLimit"
                      {...register("productLimit", {
                        required: "Product Limit is required",
                      })}
                      placeholder="Enter product limit"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.productLimit && (
                      <p className="text-red-500 text-sm">
                        {errors.productLimit.message}
                      </p>
                    )}
                  </div>

                  {/* New fields: Allow Service Ads and Service Ads Limit */}
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="allowsServiceAds"
                    >
                      Allow Service Ads
                    </label>
                    <select
                      id="allowsServiceAds"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("allowsServiceAds", {
                        required: "This field is required",
                      })}
                      onChange={(e) => handleAllowServiceAds(e.target.value)}
                    >
                      <option value="" disabled>
                        Tap to Select
                      </option>
                      <option value={"true"}>True</option>
                      <option value={"false"}>False</option>
                    </select>
                    {errors.allowsServiceAds && (
                      <p className="text-red-500 text-sm">
                        {errors.allowsServiceAds.message}
                      </p>
                    )}
                  </div>

                  {!hideServiceAds && (
                    <div className="mb-4">
                      <label
                        className="block text-md font-semibold mb-3"
                        htmlFor="serviceAdsLimit"
                      >
                        Service Ads Limit
                      </label>
                      <input
                        type="text"
                        id="serviceAdsLimit"
                        {...register("serviceAdsLimit", {
                          required: "Service Ads Limit is required",
                        })}
                        placeholder="Enter service ads limit"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        style={{ outline: "none" }}
                        required
                      />
                      {errors.serviceAdsLimit && (
                        <p className="text-red-500 text-sm">
                          {errors.serviceAdsLimit.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Service Limit
                    </label>
                    <input
                      type="text"
                      id="serviceLimit"
                      {...register("serviceLimit", {
                        required: "Service limit is required",
                      })}
                      placeholder="Enter service limit"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.serviceLimit && (
                      <p className="text-red-500 text-sm">
                        {errors.serviceLimit.message}
                      </p>
                    )}
                  </div>*/}

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Allow Auctions
                    </label>
                    <select
                      id="allowsAuction"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("allowsAuction", {
                        required: "This field is required",
                      })}
                      onChange={(e) => handleAllowAuctions(e.target.value)}
                    >
                      <option value="" disabled>
                        Tap to Select
                      </option>
                      <option value={"true"}>True</option>
                      <option value={"false"}>False</option>
                    </select>
                    {errors.allowsAuction && (
                      <p className="text-red-500 text-sm">
                        {errors.allowsAuction.message}
                      </p>
                    )}
                  </div>

                  {!hideAuctions && (
                    <div className="mb-4">
                      <label
                        className="block text-md font-semibold mb-3"
                        htmlFor="email"
                      >
                        Auction Product Limit
                      </label>
                      <input
                        type="text"
                        id="auctionProductLimit"
                        {...register("auctionProductLimit", {
                          required: "Auction Product Limit is required",
                        })}
                        placeholder="Enter auction product limit"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        style={{ outline: "none" }}
                        required
                      />
                      {errors.auctionProductLimit && (
                        <p className="text-red-500 text-sm">
                          {errors.auctionProductLimit.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Allow Adverts
                    </label>
                    <select
                      id="allowsAuction"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      onChange={(e) => handleAllowAdverts(e.target.value)}
                    >
                      <option value="" disabled>
                        Tap to Select
                      </option>
                      <option value={"true"}>True</option>
                      <option value={"false"}>False</option>
                    </select>
                  </div>

                  {!hideAdverts && (
                    <>
                      <div className="mb-4">
                        <label
                          className="block text-md font-semibold mb-3"
                          htmlFor="email"
                        >
                          Maximum Number of Ads
                        </label>
                        <input
                          type="text"
                          id="auctionProductLimit"
                          name="maxAds"
                          {...register("maxAds", {
                            required: "Maximum number of ads is required",
                          })}
                          placeholder="Enter number of Ads"
                          className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                          style={{ outline: "none" }}
                          required
                        />
                        {errors.maxAds && (
                          <p className="text-red-500 text-sm">
                            {errors.maxAds.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block text-md font-semibold mb-3"
                          htmlFor="email"
                        >
                          Advert Duration
                        </label>
                        <div className="mb-4 flex gap-4">
                          <input
                            type="text"
                            name="adsDurationDays"
                            {...register("adsDurationDays", {
                              required: "Advert duration is required",
                            })}
                            placeholder="Enter duration"
                            className="md:w-1/2 w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                            required
                          />
                          <select
                            name="billingCycle"
                            disabled
                            className="md:w-1/2 w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                          >
                            <option value="Monthly">Days</option>
                          </select>
                        </div>
                        {errors.adsDurationDays && (
                          <p className="text-red-500 text-sm">
                            {errors.adsDurationDays.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Email Address and Billing Cycle */}
                  <div>
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Plan Duration
                    </label>
                    <div className="mb-4 flex gap-4">
                      <input
                        type="text"
                        name="duration"
                        {...register("duration", {
                          required: "Subscription duration is required",
                        })}
                        placeholder="Enter duration"
                        className="md:w-1/2 w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        required
                      />
                      <select
                        name="billingCycle"
                        disabled
                        className="md:w-1/2 w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      >
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    {errors.duration && (
                      <p className="text-red-500 text-sm">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Currency
                    </label>
                    <select
                      id="planCurrency"
                      {...register("currencyId", {
                        required: "Currency is required",
                      })}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                    >
                      <option value="" disabled>
                        Tap to Select
                      </option>
                      {currencies.map((currency) => (
                        <option value={currency.id}>{currency.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Plan Price
                    </label>
                    <input
                      type="text"
                      id="price"
                      {...register("price", {
                        required: "Plan Price is required",
                      })}
                      placeholder="Enter price"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={disabled}
                    className="btn btn-primary btn-block"
                    data-theme="kudu"
                  >
                    Create New Subscription Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSubscription;
