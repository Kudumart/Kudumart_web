import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PulseLoader from "react-spinners/PulseLoader";

const CreateSubscription = ({ closeAddNewSubModal }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setIsLoading(true);

    const payload = { ...data };

    console.log(payload);

    // updatedKYC(payload)
    // .then((res) => {
    //     if(res.status !== 200) throw res

    //     toast.success(res.data.message);
    //     setIsLoading(false)
    // }).catch((error) => {
    //     toast.error(error.error.data.message);
    //     setIsLoading(false)
    // })
  };

  return (
    <>
      <div className="min-h-screen w-full">
        <div className="All">
          <div className="rounded-md pb-2 w-full flex justify-between gap-5">
            <h2 className="text-lg font-semibold text-black-700 mt-4 ml-8">
              Create Subscription Plan
            </h2>
            <MdClose
              className="text-[orangered] text-[30px] font-bold cursor-pointer mt-4 mr-8"
              onClick={closeAddNewSubModal}
            />
          </div>
          <div className="w-full flex grow">
            <div className="shadow-xl py-2 px-5 w-full bg-white flex rounded-xl flex-col gap-10">
              <form
                className="w-full flex flex-col items-center justify-center px-4"
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

                  {/* Email Address and Billing Cycle */}
                  <div>
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
                    className="btn btn-primary btn-block"
                    data-theme="kudu"
                  >
                    {isLoading ? (
                      <PulseLoader color="#ffffff" size={10} />
                    ) : (
                      "Create New Subscription Plan"
                    )}
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
