import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripeKey, testKey } from "../../../config/paymentKeys";
import { Button } from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import useAppState from "../../../hooks/appState";
import apiClient from "../../../api/apiFactory";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StripeResponse } from "../layouts/DollarCartSummary";
import { toast } from "react-toastify";
import { useReModal } from "../../../hooks/new_hooks";
import ReModal from "../../../components/ReModal";
import { useCart } from "../../../api/cart";

const CheckoutForm = ({
  closeModal,
  amount,
  successCall,
  data,
}: {
  closeModal: () => void;
  amount: number;
  successCall: () => void;
  data: StripeResponse;
}) => {
  const { user } = useAppState();
  const stripe = useStripe();
  const { data: cart, isLoading, refetch } = useCart();

  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const confirmOrderMutation = useMutation({
    mutationFn: async (payload: { refId: string; shippingAddress: string }) => {
      const res = await apiClient.post("/user/checkout/dollar", payload);
      return res.data;
    },
  });
  const submit_mutation = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe is not initialized");
      const pay_data = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Prevent page reload by omitting return_url
          // If you want to handle the result in JS, do not set return_url
        },
        clientSecret: data?.clientSecret, // Pass the client secret here
        redirect: "if_required", // Prevents automatic redirect/reload
      });
      return pay_data;
    },
    onSuccess: async (data) => {
      console.log(data.paymentIntent, "data");
      let resp = await apiClient
        .post("/user/checkout/dollar", {
          refId: data.paymentIntent?.id,
          shippingAddress: `${user.location.city} ${user.location.state}, ${user.location.country}`,
        })
        .then((res) => {
          toast.success("Payment successful");
          (closeModal(), close());
          window.location.href = "/profile/orders";
          return res;
        });
      console.log(resp.data);
      // Optionally handle payment result here, e.g. show success/failure message
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    try {
      let submitResult = await elements.submit();
      if (submitResult?.error) {
        toast.error(
          submitResult.error.message ||
            "An unexpected error occurred during submission.",
        );
        throw new Error("Submission failed");
      }
      toast.promise(submit_mutation.mutateAsync(), {
        pending: "Submitting...",
        success: "Submitted!",
        error: "Submission failed!",
      });
    } catch (error) {
      console.error(error);
    }
  };
  // return <>{JSON.stringify(cart)}</>;
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <PaymentElement
        options={{
          wallets: {
            // link: "never", // Disable Link wallet - This option might not be available or correctly typed in all Stripe.js versions
          },
        }}
      />
      <div className="mt-4 flex justify-center w-full p-2">
        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={!stripe || loading}
        >
          {loading ? "Processing..." : "Pay"}
        </button>
      </div>
      {errorMessage && (
        <div className="text-red-500 mt-2">
          {errorMessage} (Closing in 3 seconds...)
        </div>
      )}
    </form>
  );
};

const TestDollarPaymentButton = ({
  amount,
  children,
  noWidth,
  bgColor,
  // onSuccess,
  data,
}: {
  amount: number;
  children: React.ReactNode;
  noWidth?: boolean;
  bgColor?: string;
  // onSuccess?: (data: any) => void;
  data: StripeResponse;
}) => {
  const stripePromise = loadStripe(stripeKey);
  // const { openModal, closeModal } = useModal();
  const { modalRef: modalRef, openModal, closeModal } = useReModal();
  const {
    modalRef: editModalRef,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useReModal();
  const handlePayment = () => {
    openEditModal();
    // openModal({
    //   size: "md",
    //   content: (
    //     <div className="pt-24 z-20">
    //       <Elements
    //         stripe={stripePromise}
    //         options={{ clientSecret: data.clientSecret }}
    //       >
    //         <CheckoutForm
    //           closeModal={closeModal}
    //           amount={amount}
    //           successCall={() => {
    //             // Handle success logic here, e.g., refetch cart
    //             console.log("Payment successful!");
    //           }}
    //           data={data}
    //         />
    //       </Elements>
    //     </div>
    //   ),
    // });
  };

  return (
    <>
      <button
        className={`btn btn-primary bg-kudu-orange ${noWidth ? "" : "w-full"}`}
        onClick={handlePayment}
        disabled={!data?.clientSecret || amount === 0}
        style={{ backgroundColor: bgColor }}
      >
        {children}
      </button>
      <ReModal ref={editModalRef}>
        <div className=" z-20">
          <div></div>
          {data?.clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: data.clientSecret }}
            >
              <CheckoutForm
                closeModal={closeEditModal}
                amount={amount}
                successCall={() => {
                  closeEditModal();
                  // Handle success logic here, e.g., refetch cart
                  console.log("Payment successful!");
                }}
                data={data}
              />
            </Elements>
          )}
        </div>
      </ReModal>
    </>
  );
};

export default TestDollarPaymentButton;
