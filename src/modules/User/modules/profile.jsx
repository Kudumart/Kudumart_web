import React, { useEffect, useState } from "react";
import useAppState from "../../../hooks/appState";
import { useModal } from "../../../hooks/modal";
import { Country } from "country-state-city";
import { useGetSubcriptionsPlanQuery } from "../../../reducers/storeSlice";
import AddShippingAddress from "../../../components/AddShippingAddress";
import { useNewModal } from "../../../components/modals/modals";
import Modal from "../../../components/modals/DialogModal";
import { useQuery } from "@tanstack/react-query";
import UpdateShipAdd from "../../../components/UpdateShippingAddress";

const AccountProfile = () => {
  const { user } = useAppState();
  const { openModal, closeModal } = useModal();
  console.log(user.location);

  const [subscriptionPlan, setSubscriptionPlan] = useState([]);

  const { data: subscriptions, refetch } = useGetSubcriptionsPlanQuery({
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (subscriptions) {
      const activePlan = subscriptions.data.filter(
        (plan) => plan.isActiveForVendor,
      );
      setSubscriptionPlan(activePlan);
    }
  }, [subscriptions]);

  const countries = Country.getAllCountries();

  const modalRef = useNewModal();
  // const handleModal = () => {
  //   openModal({
  //     size: "sm",
  //     content: (

  //     ),
  //   });
  // };

  const handleViewModal = (plan) => {
    openModal({
      size: "md",
      content: (
        <>
          <div className="grid grid-cols-2 gap-1 px-4">
            <div className="">
              <label className="block text-sm font-medium mt-4">
                Plan Name
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.name}
              </div>
            </div>
            <div className="">
              <label className="block text-sm font-medium mt-4">
                Plan Amount
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.price}
              </div>
            </div>
            <div className="">
              <label className="block text-sm font-medium mt-4">
                Plan Validity
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.duration} month(s)
              </div>
            </div>
            <div className="">
              <label className="block text-sm font-medium mt-4">
                Product Limit
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.productLimit}
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium mt-4">
                Allows Auction
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.allowsAuction ? "Yes" : "No"}
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium mt-4">
                Auction Product Limit
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.auctionProductLimit}
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium mt-4">
                Maximum Number of Ads
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.maxAds}
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium mt-4">
                Ads duration days
              </label>
              <div className="w-full p-2 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-1">
                {plan.adsDurationDays}
              </div>
            </div>
          </div>
          <div className="flex justify-end w-full mt-5 gap-4">
            <button
              onClick={closeModal}
              className="bg-gray-300 text-black px-4 py-2 font-medium rounded-lg"
            >
              Cancel
            </button>
          </div>
        </>
      ),
    });
  };
  const location =
    typeof user["location"] === "string"
      ? JSON.parse(user["location"])
      : user["location"];
  return (
    <div className="bg-white w-full rounded-lg">
      <Modal ref={modalRef.ref} title="Update Shipping Address">
        <UpdateShipAdd onclose={modalRef.closeModal} />
        {/* <AddShippingAddress
          isOpen={true}
          countries={countries}
          closeModal={modalRef.closeModal()}
        />*/}
      </Modal>
      <h2 className="text-lg font-bold p-6">Profile</h2>
      <div className="w-full h-px border" />

      <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-4">
        <div className="border rounded-lg">
          <div className="flex justify-between p-4">
            <h3 className="text-lg font-semibold mb-2">Account Details</h3>
          </div>
          <div className="w-full h-px -mt-3 border" />
          <div className="flex flex-col gap-2 p-4">
            <p className="text-base font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="flex justify-between p-4">
            <h3 className="text-lg font-semibold mb-2">Address Book</h3>
          </div>
          <div className="w-full h-px -mt-3 border" />
          <div className="flex flex-col gap-2 p-4">
            <p className="text-base font-semibold">
              Your default shipping address:
            </p>
            <p className="text-gray-500 font-medium">
              {location
                ? `${location.city} ${location.state}, ${location.country}`
                : "No default shipping address available."}
            </p>
          </div>
          <div className="p-4">
            <button
              className="text-sm text-kudu-orange font-semibold underline"
              onClick={() => modalRef.showModal()}
            >
              {user?.location
                ? "CHANGE DEFAULT ADDRESS"
                : "ADD DEFAULT ADDRESS"}
            </button>
          </div>
        </div>

        {user?.accountType !== "Customer" && (
          <div className="border rounded-lg">
            <div className="flex justify-between p-4">
              <h3 className="text-lg font-semibold mb-2">Subscription Plan</h3>
            </div>
            <div className="w-full h-px -mt-3 border" />
            <div className="flex justify-between gap-2 p-4">
              <p className="text-gray-500 font-medium">
                {subscriptionPlan?.length > 0
                  ? subscriptionPlan[0].name
                  : "You are currently not subscribed to any of our plans."}
              </p>
              {subscriptionPlan?.length > 0 ? (
                <p className="flex">
                  <span
                    onClick={() => handleViewModal(subscriptionPlan[0])}
                    className="text-underline cursor-pointer text-sm font-semibold text-kudu-orange"
                  >
                    View Details
                  </span>
                </p>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountProfile;
