import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import apiClient from "../../../api/apiFactory";
import useAppState from "../../../hooks/appState";
import { toast } from "sonner";
import { StripeResponse } from "../layouts/DollarCartSummary";
import { useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useElements } from "@stripe/react-stripe-js";
import { useNewModal } from "../../../components/modals/modals";
import Modal from "../../../components/modals/DialogModal";
import { Elements } from "@stripe/react-stripe-js";
import { stripeKey, testKey } from "../../../config/paymentKeys";
import { loadStripe } from "@stripe/stripe-js";

export const get_ali_location = (location: any) => {
  const city = location["city"] as string;
  const arr = city.split(",");

  const zip = arr[3];
  const shippingAddress: string = `${arr[0]}, ${arr[1]}, ${arr[2]}`;
  const parsed_addres = shippingAddress.replaceAll(",", "");
  return { zip, shippingAddress, parsed_addres };
};
export default function DropShipDollarPayment({
  stripeData,
  amount,
  disabled,
  children,
}: PropsWithChildren<{
  stripeData: any;
  amount: number;
  disabled: boolean;
}>) {
  const { user } = useAppState();
  const stripePromise = loadStripe(testKey);

  const ref = useNewModal();
  const location = user.location;
  const city = location["city"] as string;
  const arr = city.split(",");

  const zip = arr[3];
  const shippingAddress: string = `${arr[0]}, ${arr[1]}, ${arr[2]}`;

  const mutate = useMutation({
    mutationFn: async () => {
      let resp = await apiClient.post("/user/checkout/dollar", {
        refId: stripeData.id,
        shippingAddress: user["location"]["street"],
        shippingAddressZipCode: user["location"]["zipCode"],
      });
      return resp.data;
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return (
    <>
      <Modal title="Payment" ref={ref.ref}>
        <>
          {stripeData?.clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: stripeData.clientSecret }}
            >
              <CheckoutForm
                closeModal={ref.closeModal}
                amount={amount}
                successCall={() => {
                  try {
                    toast.promise(mutate.mutateAsync(), {
                      loading: "Processing payment...",
                      success: "Payment successful!",
                      error: "Payment failed",
                    });
                    ref.closeModal();
                  } catch (error) {
                    throw error;
                  }
                  // Handle success logic here, e.g., refetch cart
                  console.log("Payment successful!");
                }}
                data={stripeData}
              />
            </Elements>
          )}
        </>
      </Modal>
      <button
        onClick={() => {
          ref.showModal();
        }}
        data-theme="kudu"
        className="btn btn-primary btn-block"
      >
        {" "}
        {zip}
        {/*{JSON.stringify(location.city)}*/}
        {children}
      </button>
    </>
  );
}

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

  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const confirmOrderMutation = useMutation({
    mutationFn: async (payload: { refId: string; shippingAddress: string }) => {
      const res = await apiClient.post("/user/checkout/dollar", payload);
      return res.data;
    },
  });
  const { parsed_addres, zip } = get_ali_location(user.location);
  const mutate = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.post("/user/checkout/dollar", {
        refId: id,
        shippingAddress: parsed_addres,
        shippingAddressZipCode: zip,
      });
      return resp.data;
    },
    onSuccess: (data) => {
      console.log(data);
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
    onSuccess: async (data: any) => {
      console.log(data.paymentIntent, "data");
      toast.promise(mutate.mutateAsync(data?.paymentIntent.id as string), {
        loading: "Processing payment...",
        success: "Payment successful",
        error: "Payment failed",
      });
      // let resp = await apiClient
      // .post("/user/checkout/dollar", {
      //   refId: data.paymentIntent?.id,
      //   shippingAddress: `${user.location.city} ${user.location.state}, ${user.location.country}`,
      // })
      // .then((res) => {
      //   toast.success("Payment successful");
      //   (closeModal(), close());
      //   window.location.href = "/profile/orders";
      //   return res;
      // });
      // console.log(resp.data);
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
        loading: "Submitting...",
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
