export const DropShipNairaPayment = ({
  total_price,
  paymentKey,
  hasDropShip,
  deliveryFee: passedDeliveryFee,
}: {
  total_price: number;
  paymentKey: string;
  hasDropShip: boolean;
  deliveryFee?: number;
}) => {
  const { user } = useAppState();
  const { data: cart, isLoading, refetch } = useCart();
  const {
    data: deliveryFeeData,
    error: deliveryFeeError,
    refetch: refetchDeliveryFee,
    isFetching,
  } = useQuery({
    queryKey: ["deliveryFee"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/user/delivery-fees?shipToCountryCode=NG",
      );
      return response.data;
    },
    enabled: passedDeliveryFee === undefined, // Only fetch if not passed as prop
  });

  // Use passed delivery fee if available, otherwise use fetched value
  const deliveryFee = passedDeliveryFee !== undefined ? passedDeliveryFee : (deliveryFeeData?.data?.totalDeliveryFee || 0);
  const finalTotal = total_price + deliveryFee;

  const config = useMemo(
    () => ({
      reference: new Date().getTime().toString(),
      email: user?.email || "user@example.com", // Use actual user email
      amount: finalTotal * 100, // Amount in kobo.
      publicKey: paymentKey,
      currency: "NGN", // Specify the currency.
    }),
    [paymentKey, finalTotal, user?.email],
  );

  const hasValidAddress = useMemo(() => {
    return !!(user?.location?.street && user?.location?.zipCode);
  }, [user?.location]);

  const mutate = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.post("/user/checkout/", {
        refId: id,
        shippingAddress: user?.location?.street,
        shippingAddressZipCode: user?.location?.zipCode,
      });
      return resp.data;
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
  });
  let lent = cart?.length || 0;

  const onSuccess = async (id: string) => {
    toast.promise(mutate.mutateAsync(id), {
      pending: "Processing payment...",
      success: "Payment successful",
      error: "Payment failed",
    });
  };

  const isPaymentDisabled =
    !hasValidAddress ||
    lent === 0 ||
    (hasDropShip && deliveryFee === 0 && !deliveryFeeError);

  const isServerError =
    deliveryFeeError && (deliveryFeeError as any).response?.status === 500;

  return (
    <div
      className="w-full max-w-md mx-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
      data-theme="kudu"
    >
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Dropship Fee</span>
          <span className="font-medium text-gray-900">
            NGN {deliveryFee?.toLocaleString()}
          </span>
        </div>
        <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">
            Total Amount
          </span>
          <span className="text-lg font-bold text-primary">
            ₦{finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {!hasValidAddress && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-xs text-red-600 text-center">
            Please update your profile with a valid street address and zip code
            to proceed.
          </p>
        </div>
      )}

      {hasDropShip && isFetching && !deliveryFeeError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-700 text-center">
            Calculating dropship fees. Please wait or ensure your address is
            correct.
          </p>
        </div>
      )}

      {deliveryFeeError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center">
          <p className="text-xs text-red-600 text-center mb-2">
            {isServerError
              ? "Dropship items not available at this moment."
              : "There was an error calculating dropship fees."}
          </p>
          {!isServerError && (
            <button
              onClick={() => refetchDeliveryFee()}
              className="btn btn-sm btn-outline-primary"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <DropShipPaymentButton
        config={config}
        onSuccess={onSuccess}
        disabled={isPaymentDisabled || !!deliveryFeeError}
      >
        <span className="flex items-center justify-center gap-2">
          Pay Now ₦{finalTotal.toLocaleString()}
        </span>
      </DropShipPaymentButton>

      <p className="text-[10px] text-center mt-3 text-gray-400 uppercase tracking-wider">
        Secure Payment via Paystack
      </p>
    </div>
  );
};

// PaymentButton.jsx
import { Button } from "@material-tailwind/react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "react-toastify";
import useAppState from "../../../hooks/appState";
import { useMemo } from "react";
import { testKey } from "../../../config/paymentKeys";
import apiClient from "../../../api/apiFactory";
import { useMutation, useQuery } from "@tanstack/react-query";
import { get_ali_location } from "./DropShipDollarPayment";
import { useCart } from "../../../api/cart";

const DropShipPaymentButton = ({
  config,
  disabled,
  children,
  onSuccess,
  onError,
  onClose,
}: any) => {
  // Initialize the payment function with the latest config.
  const { user } = useAppState();

  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    if (disabled) return;

    if (user) {
      if (user.location && user.location.street && user.location.zipCode) {
        if (!config.publicKey) {
          console.error("Payment key not loaded");
          return;
        }
        initializePayment({
          onSuccess: (data) => {
            onSuccess(data.reference);
          },
          onClose,
        });
      } else {
        toast.error(
          "Shipping Address or Zip Code not set, visit your profile to set up your details",
        );
      }
    } else {
      initializePayment({ onSuccess, onClose });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`btn btn-primary btn-block ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};
