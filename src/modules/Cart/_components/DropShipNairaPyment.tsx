export const DropShipNairaPayment = ({
  total_price,
  paymentKey,
  hasDropShip,
  deliveryFee: passedDeliveryFee,
  cartItemIds,
  deliveryMethod,
  onSelectPickup,
}: {
  total_price: number;
  paymentKey: string;
  hasDropShip: boolean;
  deliveryFee?: number;
  cartItemIds?: string[];
  deliveryMethod: "delivery" | "pickup";
  onSelectPickup?: () => void;
}) => {
  const { user } = useAppState();
  const { data: cart, refetch } = useCart();
  const navigate = useNavigate();
  const {
    data: deliveryFeeData,
    error: deliveryFeeError,
    refetch: refetchDeliveryFee,
    isFetching,
  } = useQuery({
    queryKey: ["deliveryFee", cartItemIds, deliveryMethod],
    queryFn: async () => {
      const params = new URLSearchParams({ shipToCountryCode: "NG" });
      if (cartItemIds?.length) {
        params.set("cartItemIds", cartItemIds.join(","));
      }
      const response = await apiClient.get(
        `/user/delivery-fees?${params.toString()}`,
      );
      return response.data;
    },
    enabled: deliveryMethod === "delivery" && passedDeliveryFee === undefined,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      return status >= 500 && failureCount < 1;
    },
  });

  // Use passed delivery fee if available, otherwise use fetched value
  const deliveryFee = deliveryMethod === "pickup"
    ? 0
    : passedDeliveryFee !== undefined
      ? passedDeliveryFee
      : (deliveryFeeData?.data?.totalDeliveryFee || 0);
  const finalTotal = total_price + deliveryFee;

  const hasValidAddress = useMemo(() => {
    return deliveryMethod === "pickup" || !!(user?.location?.street && user?.location?.zipCode);
  }, [deliveryMethod, user?.location]);

  const mutate = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.post("/user/checkout/", {
        refId: id,
        shippingAddress:
          deliveryMethod === "pickup"
            ? "Pickup at Kudumart Store"
            : user?.location?.street,
        ...(deliveryMethod === "delivery"
          ? { shippingAddressZipCode: user?.location?.zipCode }
          : {}),
        deliveryMethod,
        ...(cartItemIds ? { cartItemIds } : {}),
      });
      return resp.data;
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
  });
  let lent = cart?.length || 0;

  const onSuccess = async (reference: string) => {
    if (!reference) return;
    const pendingToast = toast.loading("Confirming your payment...");
    try {
      await mutate.mutateAsync(reference);
      toast.update(pendingToast, {
        render: "Payment successful. Your order has been created.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      navigate("/profile/orders");
    } catch (error: any) {
      toast.update(pendingToast, {
        render:
          error?.response?.data?.message ||
          "We could not complete this order. Your payment reference is safe; please contact support.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const isPaymentDisabled =
    !hasValidAddress ||
    lent === 0 ||
    (deliveryMethod === "delivery" && hasDropShip && deliveryFee === 0 && !deliveryFeeError);

  const isServerError =
    deliveryFeeError && (deliveryFeeError as any).response?.status === 500;
  const deliveryErrorStatus = (deliveryFeeError as any)?.response?.status;
  const isDeliveryUnavailable =
    deliveryErrorStatus >= 400 && deliveryErrorStatus < 500;
  const rawDeliveryErrorMessage = String(
    (deliveryFeeError as any)?.response?.data?.message || "",
  ).replace(/dropship/gi, "delivery");
  const deliveryErrorMessage = /(?:there was|an?)\s+(?:an\s+)?error|occurred while calculating/i.test(
    rawDeliveryErrorMessage,
  )
    ? ""
    : rawDeliveryErrorMessage;

  return (
    <div
      className="w-full max-w-md mx-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
      data-theme="kudu"
    >
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Delivery Fee</span>
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

      {deliveryMethod === "delivery" && isFetching && !deliveryFeeError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-700 text-center">
            Calculating the delivery fee for this order...
          </p>
        </div>
      )}

      {deliveryMethod === "delivery" && deliveryFeeError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center">
          <p className="text-xs text-amber-800 text-center mb-2">
            {isDeliveryUnavailable
              ? deliveryErrorMessage ||
                "Home delivery is not available for this order or address."
              : isServerError
                ? "Home delivery is temporarily unavailable. You can use store pickup or try again."
                : deliveryErrorMessage ||
                  "We could not confirm home delivery for this order."}
          </p>
          <div className="flex items-center justify-center gap-2">
            {onSelectPickup && (
              <button
                type="button"
                onClick={onSelectPickup}
                className="btn btn-sm btn-primary"
              >
                Choose pickup
              </button>
            )}
            {!isDeliveryUnavailable && (
            <button
              type="button"
              onClick={() => refetchDeliveryFee()}
              className="btn btn-sm btn-outline-primary"
            >
              Try again
            </button>
            )}
          </div>
        </div>
      )}

      <DropShipPaymentButton
        onSuccess={onSuccess}
        disabled={
          isPaymentDisabled ||
          (deliveryMethod === "delivery" && !!deliveryFeeError)
        }
        cartItemIds={cartItemIds}
        deliveryMethod={deliveryMethod}
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
import PaystackPop from "@paystack/inline-js";
import { toast } from "react-toastify";
import useAppState from "../../../hooks/appState";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/apiFactory";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "../../../api/cart";

const DropShipPaymentButton = ({
  disabled,
  children,
  onSuccess,
  onError,
  onClose,
  cartItemIds,
  deliveryMethod,
}: any) => {
  const { user } = useAppState();

  const preparePayment = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/user/checkout/naira/prepare", {
        ...(cartItemIds ? { cartItemIds } : {}),
        deliveryMethod,
      });
      return response.data;
    },
    onSuccess: (response) => {
      const details = response?.data;
      const accessCode = details?.paystackDetails?.access_code;
      const reference = details?.refId || details?.paystackDetails?.reference;
      if (!accessCode || !reference) {
        toast.error("Paystack did not return a secure payment session.");
        return;
      }

      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onSuccess: (result: any) => onSuccess(result?.reference || reference),
        onCancel: () => {
          toast.info("Payment cancelled.");
          onClose?.();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Paystack could not open the payment session.");
          onError?.(error);
        },
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "We could not prepare this payment. Please try again.",
      );
    },
  });

  const handleClick = () => {
    if (disabled) return;

    if (user) {
      if (
        deliveryMethod === "pickup" ||
        (user.location && user.location.street && user.location.zipCode)
      ) {
        preparePayment.mutate();
      } else {
        toast.error(
          "Shipping Address or Zip Code not set, visit your profile to set up your details",
        );
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || preparePayment.isPending}
      className={`btn btn-primary btn-block ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {preparePayment.isPending ? "Preparing secure payment..." : children}
    </button>
  );
};
