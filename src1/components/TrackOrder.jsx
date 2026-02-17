import { useEffect, useState } from "react";
import { Button, Step, Stepper } from "@material-tailwind/react";
import { toast } from "react-toastify";
import useApiMutation from "../api/hooks/useApiMutation";

const TrackOrder = ({ userType, orderId, status, admin, refetch }) => {
  const { mutate } = useApiMutation();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState("");

  const statusArr = ["pending", "processing", "shipped", "delivered"];
  const statusIndex = statusArr.indexOf(status);

  const [activeStep, setActiveStep] = useState(statusIndex);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(false);

  const handleNext = () => {
    // If moving from shipped to delivered and user is admin, show delivery code modal
    if (
      status === "shipped" &&
      statusArr[statusIndex + 1] === "delivered" &&
      userType
    ) {
      setShowDeliveryModal(true);
      return;
    }

    // Regular status update without delivery code
    updateOrderStatus();
  };

  const updateOrderStatus = (code = null) => {
    const requestData = {
      orderItemId: orderId,
      status: `${statusArr[statusIndex + 1]}`,
    };

    // Add delivery code if provided
    if (code) {
      requestData.deliveryCode = code;
    }

    mutate({
      url: admin
        ? `/admin/order/item/update/status`
        : `/user/order/item/update/status`,
      method: "POST",
      headers: true,
      data: requestData,
      onSuccess: (response) => {
        console.log(
          "✅ [TrackOrder] Order status updated successfully:",
          response.data,
        );
        if (code) {
          toast.success("Order marked as delivered successfully!");
        }
        setShowDeliveryModal(false);
        setDeliveryCode("");
        refetch();
      },
      onError: (error) => {
        console.error("❌ [TrackOrder] Error updating order status:", error);
      },
    });
  };

  const handleDeliveryCodeSubmit = () => {
    if (!deliveryCode.trim()) {
      toast.error("Please enter a delivery code");
      return;
    }
    updateOrderStatus(deliveryCode.trim());
  };

  const handlePrev = () => {
    mutate({
      url: admin
        ? `/admin/order/item/update/status`
        : `/user/order/item/update/status`,
      method: "POST",
      headers: true,
      data: {
        orderItemId: orderId,
        status: `cancelled`,
      },
      onSuccess: (response) => {
        refetch();
      },
    });
  };

  return (
    <div className="w-full p-6 bg-white h-full shadow rounded-lg">
      <div className="flex w-full justify-between">
        <h2 className="text-lg font-bold mb-4">Track Order</h2>
      </div>
      <div className="w-full py-4 mt-8 px-2 sm:px-4 md:px-8">
        <Stepper
          activeStep={activeStep}
          isLastStep={(value) => setIsLastStep(value)}
          isFirstStep={(value) => setIsFirstStep(value)}
        >
          <Step className="h-4 w-4">
            <div className="absolute -bottom-14 w-max text-center">
              <span
                className={activeStep === 0 ? "text-kudu-orange" : "text-black"}
              >
                Pending
              </span>
            </div>
          </Step>
          <Step className="h-4 w-4">
            <div className="absolute -bottom-14 w-max text-center">
              <span
                className={activeStep === 1 ? "text-kudu-orange" : "text-black"}
              >
                Processing
              </span>
            </div>
          </Step>
          <Step className="h-4 w-4">
            <div className="absolute -bottom-14 w-max text-center">
              <span
                className={activeStep === 2 ? "text-kudu-orange" : "text-black"}
              >
                Shipped
              </span>
            </div>
          </Step>
          <Step className="h-4 w-4">
            <div className="absolute -bottom-14 w-max text-center">
              <span className={activeStep === 3 ? "text-kudu-orange" : ""}>
                Delivered
              </span>
            </div>
          </Step>
        </Stepper>
      </div>
      {status !== "cancelled" ? (
        userType ? (
          <div className="mt-20 flex justify-between">
            <Button
              className="bg-red-500"
              onClick={handlePrev}
              disabled={isLastStep}
            >
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={isLastStep}>
              Next
            </Button>
          </div>
        ) : (
          status !== "shipped" && (
            <div className="mt-20 flex justify-between">
              <Button
                className="bg-red-500"
                onClick={handlePrev}
                disabled={isLastStep}
              >
                Cancel
              </Button>
            </div>
          )
        )
      ) : (
        <></>
      )}
      <div className="mt-20 flex justify-between"></div>

      {/* Delivery Code Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Delivery Confirmation
              </h3>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryCode("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please enter the delivery confirmation code to mark this order
                as delivered.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Code *
                </label>
                <input
                  type="text"
                  value={deliveryCode}
                  onChange={(e) => setDeliveryCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleDeliveryCodeSubmit();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter delivery code"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryCode("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliveryCodeSubmit}
                className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
