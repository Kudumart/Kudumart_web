import React, { useEffect, useState } from "react";
import useAppState from "../../../hooks/appState";
import { useModal } from "../../../hooks/modal";
import { useGetSubcriptionsPlanQuery } from "../../../reducers/storeSlice";
import { useNewModal } from "../../../components/modals/modals";
import Modal from "../../../components/modals/DialogModal";
import UpdateShipAdd from "../../../components/UpdateShippingAddress";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";
import useApiMutation from "../../../api/hooks/useApiMutation";
import {
  User,
  ShieldCheck,
  Store,
  PackagePlus,
  Landmark,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

const AccountProfile = () => {
  const { user } = useAppState();
  const { openModal, closeModal } = useModal();
  const { mutate } = useApiMutation();

  const [subscriptionPlan, setSubscriptionPlan] = useState([]);
  const [storesCount, setStoresCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [bankAccountsCount, setBankAccountsCount] = useState(0);
  const [kycApproved, setKycApproved] = useState(false);

  const { data: subscriptions } = useGetSubcriptionsPlanQuery({
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

  // Fetch status metrics for onboarding checklist
  useEffect(() => {
    mutate({
      url: `/vendor/store`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (res) => {
        setStoresCount(res.data?.data?.length || 0);
      },
    });

    mutate({
      url: `/vendor/products`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (res) => {
        setProductsCount(res.data?.data?.length || 0);
      },
    });

    mutate({
      url: `/user/kyc`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (res) => {
        setKycApproved(res.data?.data?.status === "Approved");
      },
    });

    mutate({
      url: `/user/bank-account`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (res) => {
        setBankAccountsCount(res.data?.data?.length || 0);
      },
    });
  }, [mutate]);

  const modalRef = useNewModal();

  const handleViewModal = (plan) => {
    openModal({
      size: "md",
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Plan Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Plan Name</p>
              <p className="font-semibold text-gray-900 mt-0.5">{plan.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Plan Amount</p>
              <p className="font-semibold text-primary mt-0.5">₦{plan.price?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Validity</p>
              <p className="font-semibold text-gray-900 mt-0.5">{plan.duration} month(s)</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Product Limit</p>
              <p className="font-semibold text-gray-900 mt-0.5">{plan.productLimit} items</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Allows Auction</p>
              <p className="font-semibold text-gray-900 mt-0.5">{plan.allowsAuction ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Max Adverts</p>
              <p className="font-semibold text-gray-900 mt-0.5">{plan.maxAds} ads</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="secondary" size="sm" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      ),
    });
  };

  const location =
    typeof user["location"] === "string"
      ? JSON.parse(user["location"] || "{}")
      : user["location"];

  // Onboarding Steps Definition
  const isVendor = user?.accountType !== "Customer";
  const steps = [
    {
      id: "store",
      title: "Create your Storefront",
      description: "Setup your public storefront identity and delivery rates.",
      completed: storesCount > 0,
      link: "/profile/stores/create",
      actionText: "Create Store",
      icon: Store,
    },
    {
      id: "kyc",
      title: "Complete Identity KYC",
      description: "Verify your business credentials to get the Verified Vendor badge.",
      completed: kycApproved,
      link: "/profile/updated-kyc",
      actionText: "Verify Identity",
      icon: ShieldCheck,
    },
    {
      id: "product",
      title: "List your First Product",
      description: "Upload items to start receiving customer orders and offers.",
      completed: productsCount > 0,
      link: "/profile/products/create",
      actionText: "Add Product",
      icon: PackagePlus,
    },
    {
      id: "payout",
      title: "Link Payout Bank Account",
      description: "Connect your local bank account for fast escrow withdrawals.",
      completed: bankAccountsCount > 0,
      link: "/profile/wallet/add-account",
      actionText: "Add Account",
      icon: Landmark,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="w-full space-y-6">
      <Modal ref={modalRef.ref} title="Update Shipping Address">
        <UpdateShipAdd onclose={modalRef.closeModal} />
      </Modal>

      {/* ── 1. VENDOR GETTING STARTED CHECKLIST / ONBOARDING STEPPER ── */}
      {isVendor && progressPercent < 100 && (
        <div className="bg-white rounded-2xl border border-orange-200/80 shadow-xs p-6 md:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  <Sparkles className="w-3.5 h-3.5" /> Vendor Onboarding Guide
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {completedCount} of {steps.length} Steps Completed
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1.5">
                Ready to start selling on Kudumart?
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete these key setup steps to unlock your full merchant capabilities and receive buyer orders.
              </p>
            </div>

            {/* Progress Bar Widget */}
            <div className="w-full md:w-48 bg-gray-50 p-3 rounded-xl border border-gray-200/70 shrink-0">
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                <span>Setup Progress</span>
                <span className="text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stepper Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    step.completed
                      ? "bg-emerald-50/40 border-emerald-200 text-gray-800"
                      : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          step.completed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-50 text-primary"
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      {step.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-400">
                          Step {idx + 1}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    {step.completed ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <Link
                        to={step.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group"
                      >
                        {step.actionText}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. MAIN PROFILE OVERVIEW CARDS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Account Profile</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your personal details, shipping address, and active plan</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
            {user?.accountType || "Customer"} Account
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Account Details */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/40">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-200">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-gray-900">Account Details</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Full Name</span>
                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Email Address</span>
                <p className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {user?.email}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Phone Number</span>
                <p className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {user?.phoneNumber || "No phone number added"}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Address Book */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-200">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-gray-900">Default Shipping Address</h3>
              </div>
              <div className="text-sm">
                <p className="text-gray-700 font-medium leading-relaxed">
                  {location?.address
                    ? `${location.address}, ${location.city || ""} ${location.state || ""}, ${location.country || ""}`
                    : "No default shipping address recorded yet."}
                </p>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-200/80">
              <button
                type="button"
                className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                onClick={() => modalRef.showModal()}
              >
                {location?.address ? "Change Default Address" : "+ Add Default Address"}
              </button>
            </div>
          </div>

          {/* Card: Subscription Plan */}
          {user?.accountType !== "Customer" && (
            <div className="md:col-span-2 p-5 rounded-xl border border-gray-200 bg-gray-50/40">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">Active Vendor Subscription</h3>
                </div>
                <Link to="/profile/subscription" className="text-xs text-primary font-bold hover:underline">
                  Manage Plans
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">
                    {subscriptionPlan?.length > 0
                      ? subscriptionPlan[0].name
                      : "No active paid plan"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {subscriptionPlan?.length > 0
                      ? `Includes up to ${subscriptionPlan[0].productLimit} products and ${subscriptionPlan[0].maxAds} ads`
                      : "You are currently operating on the basic vendor free tier."}
                  </p>
                </div>
                {subscriptionPlan?.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewModal(subscriptionPlan[0])}
                  >
                    View Plan Features
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
