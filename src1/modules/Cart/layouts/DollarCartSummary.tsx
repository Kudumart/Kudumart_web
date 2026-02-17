import { useMutation, useQuery } from "@tanstack/react-query";
import { CartSummaryType } from "./cartSummary";
import apiClient from "../../../api/apiFactory";
import useAppState from "../../../hooks/appState";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";
import { Button } from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import TestDollarPayment from "../_components/TestDollarPayment";
import DropShipDollarPayment from "../_components/DropShipDollarPayment";
import UpdateShipAdd from "../../../components/UpdateShippingAddress";

interface StripePaymentBreakdown {
  currency: string;
  chargeAmount: number;
  subtotal: number;
}

export interface StripeResponse {
  id: string;
  clientSecret: string;
  totalAmount: number;
  paymentBreakdown: StripePaymentBreakdown;
}

export default function DollarCartSummary({
  cart,
  refetch,
}: {
  cart: CartSummaryType["cart"];
  refetch?: () => void;
}) {
  const { user } = useAppState();
  const { openModal, closeModal } = useModal();

  const query = useQuery<StripeResponse>({
    queryKey: ["cart_summary_dollar", cart],
    queryFn: async () => {
      const shippingAddress =
        typeof user.location !== "string"
          ? [user.location.city, user.location.state, user.location.country]
              .filter(Boolean)
              .join(" ")
          : null;
      let resp = await apiClient.post("/user/checkout/dollar/prepare", {
        shippingAddress: shippingAddress,
      });
      return resp.data;
    },
    enabled: !!user.location && cart.length > 0, // Only run query if user has a location and cart is not empty
  });

  const handleModal = () => {
    openModal({
      size: "sm",
      content: <UpdateShipAdd onclose={handleCloseModal} />,
    });
  };

  const handleCloseModal = () => {
    closeModal();
    refetch?.();
  };

  if (query.isLoading)
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 rounded-lg bg-white py-6">
        <div className="animate-spin  text-xl font-bold opacity-80">...</div>
      </div>
    );

  if (query.isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 rounded-lg bg-white py-6">
        <div>
          <div className="">Error Loading Checkout Info</div>
          <button
            onClick={() => query.refetch()}
            className="bg-kudu-orange text-white font-bold py-2 px-4 rounded-sm hover:bg-kuduDarkOrange focus:outline-hidden focus:ring-2 focus:ring-kuduDarkOrange"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stripeData = query.data;
  const hasDropShip = cart.some(
    (item: any) => item["product"]["type"] == "dropship",
  );

  return (
    <div className="card w-full bg-base-100 shadow-xl" data-theme="kudu">
      <div className="card-body p-4">
        <h2 className="card-title text-lg font-semibold uppercase mb-4">
          CART Summary
        </h2>
        <div className="divider my-0"></div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Item's Total ({cart.length})
            </span>
            <span className="text-sm text-gray-500">
              $
              {formatNumberWithCommas(
                stripeData?.paymentBreakdown.subtotal || 0,
              )}
            </span>
          </div>

          {(stripeData?.paymentBreakdown.chargeAmount || 0) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Charges</span>
              <span className="text-sm text-gray-500">
                $
                {formatNumberWithCommas(
                  stripeData?.paymentBreakdown.chargeAmount || 0,
                )}
              </span>
            </div>
          )}

          {(stripeData?.totalAmount || 0) > 0 && (
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <span className="text-base font-semibold text-black">Total</span>
              <span className="text-base font-semibold text-black">
                ${formatNumberWithCommas(stripeData?.totalAmount || 0)}
              </span>
            </div>
          )}
        </div>
        <div className="divider my-0"></div>
        {user.location ? (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-semibold">Delivery Address</p>
              <button
                onClick={handleModal}
                className="btn btn-link btn-xs text-kudu-orange no-underline"
              >
                Change default address
              </button>
            </div>
            <p className="text-base text-gray-500">
              {user.location.city} {user.location.state},{" "}
              {user.location.country}
            </p>
          </>
        ) : (
          <p className="text-base text-error mt-2">
            Please set a delivery address to proceed.
          </p>
        )}
        <div className="card-actions justify-center mt-4">
          {user.location ? (
            <>
              {hasDropShip ? (
                <>
                  <DropShipDollarPayment
                    stripeData={stripeData}
                    amount={stripeData?.totalAmount || 0}
                    disabled={cart.length === 0 || !stripeData?.clientSecret}
                  >
                    <span className="text-sm font-medium normal-case">
                      Checkout $
                      {formatNumberWithCommas(stripeData?.totalAmount || 0)}
                    </span>
                  </DropShipDollarPayment>
                </>
              ) : (
                <>
                  <TestDollarPayment
                    data={stripeData as StripeResponse}
                    amount={stripeData?.totalAmount || 0}
                    disabled={cart.length === 0 || !stripeData?.clientSecret}
                  >
                    <span className="text-sm font-medium normal-case">
                      Checkout $
                      {formatNumberWithCommas(stripeData?.totalAmount || 0)}
                    </span>
                  </TestDollarPayment>
                </>
              )}
            </>
          ) : (
            <Button
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
              className="btn btn-primary bg-kudu-orange"
              onClick={handleModal}
            >
              Set Delivery Location
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
