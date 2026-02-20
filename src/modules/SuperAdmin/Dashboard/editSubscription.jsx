import { useForm } from "react-hook-form";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import { toast } from "react-toastify";
import apiClient from "../../../api/apiFactory";
import { useMutation } from "@tanstack/react-query";

const EditSubscription = () => {
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
  const { id } = useParams();
  const [plans, setPlans] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const edit_mutation = useMutation({
    mutationFn: async (data) => {
      let resp = await apiClient.put("/admin/subscription/plan/update", data);
      return resp;
    },
    onSuccess: (response) => {
      toast.success("Subscription plan updated successfully");
      navigate(-1);
    },
    onError: () => {
      toast.error("Failed to update subscription plan");
    },
  });
  const onSubmit = (data) => {
    console.log(data);
    data.planId = plans[0].id;
    data.duration = Number(data.duration);
    data.productLimit = Number(data.productLimit);
    data.auctionProductLimit = Number(data.auctionProductLimit);
    data.price = Number(data.price);
    data.allowsAuction = data.allowsAuction === "true";
    data.allowsServiceAds = data.allowsServiceAds === "true";
    data.serviceAdsLimit = Number(data.serviceAdsLimit);
    delete data.allowsAdvert;
    edit_mutation.mutate(data);
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

  const handleAllowServiceAds = (value) => {
    if (value === "false") {
      setValue("serviceAdsLimit", ""); // Reset the field value if "allowsServiceAds" is false
    }
  };

  const getPlan = () => {
    mutate({
      url: `admin/subscription/plans?name=${id}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setPlans(response.data.data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  const getAdminCurrencies = () => {
    mutate({
      url: "/admin/currencies",
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCurrencies(response.data.data);
        getPlan();
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    getAdminCurrencies();
  }, []);

  useEffect(() => {
    if (plans.length === 0) return;

    setValue("name", plans[0].name);
    setValue("duration", plans[0].duration);
    setValue("productLimit", plans[0].productLimit);
    setValue("auctionProductLimit", plans[0].auctionProductLimit);
    setValue("allowsAuction", plans[0].allowsAuction);
    setValue("allowsAdvert", (plans[0].maxAds !== 0).toString());
    setAdverts(plans[0].maxAds === 0);
    setAuctions(!plans[0].allowsAuction);
    setValue("maxAds", plans[0].maxAds);
    setValue("adsDurationDays", plans[0].adsDurationDays);
    setValue("currencyId", plans[0].currencyId);
    setValue("price", plans[0].price);
    // Set values for new fields
    setValue("allowsServiceAds", plans[0].allowsServiceAds);
    setValue("serviceAdsLimit", plans[0].serviceAdsLimit);
    setLoading(false);
  }, [plans, setValue]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" data-theme="kudu">
        <div className="All">
          <div className="rounded-md pb-2 w-full flex justify-between gap-5">
            <h2 className="text-lg font-semibold text-black-700 mt-4">
              Edit Subscription Plan
            </h2>
          </div>
          <div className="w-full flex grow mt-3">
            <div className="shadow-xl py-2 px-5 md:w-3/5 w-full bg-white flex rounded-xl flex-col gap-10">
              <form
                onSubmit={handleSubmit(onSubmit, (errors) => {
                  // Loop over all validation errors
                  Object.values(errors).forEach((err) => {
                    if (err?.message) {
                      toast.error(err.message);
                    }
                  });
                })}
              >
                <div className="w-full p-6">
                  {/* Plan Name */}
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="name"
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
                      htmlFor="productLimit"
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

                  {/* New fields for Service Ads */}
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
                      {...register("allowsServiceAds")}
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

                  {!hideAdverts && (
                    <div className="mb-4">
                      <label
                        className="block text-md font-semibold mb-3"
                        htmlFor="serviceAdsLimit"
                      >
                        Service Ads Limit
                      </label>
                      <input
                        type="number" // Use type="number" for numeric input
                        id="serviceAdsLimit"
                        {...register("serviceAdsLimit", {
                          valueAsNumber: true, // Ensure the value is treated as a number
                        })}
                        placeholder="Enter service ads limit"
                        className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                        style={{ outline: "none" }}
                      />
                      {errors.serviceAdsLimit && (
                        <p className="text-red-500 text-sm">
                          {errors.serviceAdsLimit.message}
                        </p>
                      )}
                    </div>
                  )}
                  {/* End of new fields for Service Ads */}

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="allowsAuction"
                    >
                      Allow Auctions
                    </label>
                    <select
                      id="allowsAuction"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("allowsAuction")}
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
                        htmlFor="auctionProductLimit"
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
                      htmlFor="allowsAdvert"
                    >
                      Allow Adverts
                    </label>
                    <select
                      id="allowsAdvert"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      {...register("allowsAdvert", {
                        required: "Allow Adverts is required",
                      })}
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
                          htmlFor="maxAds"
                        >
                          Maximum Number of Ads
                        </label>
                        <input
                          type="text"
                          id="maxAds"
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
                          htmlFor="adsDurationDays"
                        >
                          Advert Duration
                        </label>
                        <div className="mb-4 flex gap-4">
                          <input
                            type="text"
                            id="adsDurationDays"
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
                      htmlFor="duration"
                    >
                      Plan Duration
                    </label>
                    <div className="mb-4 flex gap-4">
                      <input
                        type="text"
                        id="duration"
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
                      htmlFor="currencyId"
                    >
                      Currency
                    </label>
                    <select
                      id="currencyId"
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
                        <option key={currency.id} value={currency.id}>
                          {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="price"
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
                    disabled={edit_mutation.isPending}
                    className="btn btn-primary btn-block"
                  >
                    {edit_mutation.isPending
                      ? "Updating..."
                      : "Edit Subscription Plan"}
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

export default EditSubscription;
