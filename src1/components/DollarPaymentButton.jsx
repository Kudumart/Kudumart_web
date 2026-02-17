import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripeKey } from "../config/paymentKeys";
import { Button } from "@material-tailwind/react";
import { useModal } from "../hooks/modal";
import useAppState from "../hooks/appState";
import useApiMutation from "../api/hooks/useApiMutation";

const CheckoutForm = ({ closeModal, amount, successCall }) => {
  const { user } = useAppState();
  const { mutate } = useApiMutation();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setLoading(false);
        return;
      }

      // 2. Create the PaymentIntent on the backend
      // We perform this on the server to prevent client-side manipulation of amounts
      mutate({
        url: "/create-payment-intent",
        method: "POST",
        data: { amount, currency: "usd" },
        headers: true,
        onSuccess: async (response) => {
          try {
            const clientSecret = response.data.data;

            if (!clientSecret) {
              throw new Error("Failed to retrieve client secret from backend.");
            }

            // 3. Confirm the payment on the client
            const { error: confirmError, paymentIntent } =
              await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                  return_url: window.location.href, // Required for some payment methods
                },
                redirect: "if_required", // Handle redirects only when necessary
              });

            if (confirmError) {
              setErrorMessage(confirmError.message || "Payment confirmation failed.");
              setLoading(false);
              return;
            }

            // 4. Check Payment Status
            if (paymentIntent && paymentIntent.status === "succeeded") {
              console.log("Payment Succeeded:", paymentIntent);
              setSuccess(true);

              const address = user?.location
                ? `${user.location.city || ''} ${user.location.state || ''}, ${user.location.country || ''}`.trim()
                : "Address Not Provided";

              // 5. Finalize Order on Backend
              if (successCall) {
                // If a custom success handler is provided (e.g. for specific workflows)
                successCall({ reference: paymentIntent.id });
                // Optional: Close modal after a delay
                setTimeout(() => closeModal(), 2500);
              } else {
                // Default order confirmation workflow
                mutate({
                  url: "/user/checkout/dollar",
                  method: "POST",
                  data: {
                    refId: paymentIntent.id,
                    shippingAddress: address || "Default Address",
                    shippingAddressZipCode: user?.location?.zipCode || "000000",
                  },
                  headers: true,
                  onSuccess: () => {
                    console.log("Backend Order Confirmed");
                    setTimeout(() => closeModal(), 2500); // Give user time to see success message
                  },
                  onError: (err) => {
                    console.error("Order Confirmation Error:", err);
                    setErrorMessage("Payment paid but order confirmation failed. Ref: " + paymentIntent.id);
                  }
                });
              }
            } else {
              // Handle other statuses like 'processing', 'requires_action', etc. if 'if_required' didn't catch them
              setErrorMessage(`Payment status: ${paymentIntent.status}`);
              setLoading(false);
            }
          } catch (innerError) {
            console.error("Payment Confirmation Process Error:", innerError);
            setErrorMessage(innerError.message || "An unexpected error occurred during payment.");
            setLoading(false);
          }
        },
        onError: (apiError) => {
          console.error("Payment Intent Creation Error:", apiError);
          setErrorMessage("Failed to initialize payment gateway. Please try again.");
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Unexpected Checkout Error:", err);
      setErrorMessage("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
        <p className="text-gray-500 text-center">Your transaction has been completed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-[10px] px-4">
      <div className="mb-4">
        {/* Reduced marginBottom for title section to fit better */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Pay with Card</h3>
        <p className="text-sm text-gray-500">Enter your card details to complete the payment.</p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pt-2 pb-1">
        {/* Added vertical padding to scroll area to prevent clipping */}
        <PaymentElement
          options={{
            wallets: {
              link: "never",
            },
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          className="bg-kudu-orange w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={!stripe || loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </div>
    </form>
  );
};

const DollarPaymentButton = ({
  amount,
  children,
  noWidth,
  bgColor,
  onSuccess,
}) => {
  const { openModal, closeModal } = useModal();
  const stripePromise = loadStripe(stripeKey);

  const options = {
    mode: "payment",
    amount: amount * 100,
    currency: "usd",
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#e76f51", // Your brand color
      },
    },
  };

  const handleModal = () => {
    openModal({
      size: "lg",
      content: (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            closeModal={closeModal}
            amount={amount}
            successCall={onSuccess}
          />
        </Elements>
      ),
    });
  };

  return (
    <Button
      onClick={handleModal}
      className={`${noWidth ? "" : "w-3/4"} py-3 px-4 flex justify-center gap-2 ${bgColor || "bg-kudu-orange"} shadow-md text-white rounded-lg font-medium transition-colors`}
    >
      {children}
    </Button>
  );
};

export default DollarPaymentButton;
