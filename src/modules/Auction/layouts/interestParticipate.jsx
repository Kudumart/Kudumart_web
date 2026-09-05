import { useEffect, useMemo, useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import PaymentButton from "../../../components/PaymentButton";
import useAppState from "../../../hooks/appState";
import { paystackKey } from "../../../config/paymentKeys";
import DollarPaymentButton from "../../../components/DollarPaymentButton";
import Button from "../../../components/Button";
import { toast } from "react-toastify";

const InterestParticipate = ({ content, reload }) => {
    const { ipInfo, user } = useAppState();
    const { mutate } = useApiMutation();

    const paymentKey = paystackKey;

    const totalPrice = Number(content.participantsInterestFee || 0);

    // Create a config object for Paystack payment.
    const config = useMemo(
        () => ({
            reference: new Date().getTime().toString(),
            email: user?.email || "customer@kudumart.com",
            amount: Math.round(totalPrice * 100), // Amount in kobo.
            publicKey: paymentKey,
            currency: content.store?.currency?.symbol === '$' ? "USD" : "NGN",
        }),
        [paymentKey, totalPrice, user?.email, content.store]
    );

    // Callback when the payment is successful or registering free interest
    const registerInterest = (amount) => {
        const payload = {
            auctionProductId: content.id,
            amountPaid: amount,
        };

        mutate({
            url: "/user/auction/interest",
            method: "POST",
            data: payload,
            headers: true,
            onSuccess: () => {
                toast.success("Interest registered successfully!");
                if (typeof reload === "function") {
                    reload();
                }
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || "Failed to record interest.");
            },
        });
    };

    const onSuccess = () => {
        registerInterest(totalPrice);
    };

    // Callback when the payment modal is closed.
    const onClose = () => {
        console.log("Payment closed");
    };

    return (
        <>
            {!content.interest && (content.auctionStatus === 'upcoming' || content.auctionStatus === 'ongoing') ?
                <div className="max-w-md mx-auto rounded-lg mt-3 bg-[rgba(245,249,253,1)] p-4">
                    <p className="text-[13px] font-semibold">
                        {totalPrice > 0 
                            ? "If you're interested in placing a bid, an interest fee is required to participate. Secure your spot now and get a chance to win!"
                            : "Register your interest to join the bidding when the auction is active. Free participation!"}
                    </p>
                    <div className="flex my-2 gap-2 py-2 w-full justify-center">
                        {totalPrice <= 0 ? (
                            <Button 
                                variant="primary" 
                                fullWidth 
                                onClick={() => registerInterest(0)}
                                className="py-2.5"
                            >
                                <span className="text-sm font-medium">
                                    Join Auction (Free)
                                </span>
                            </Button>
                        ) : ipInfo?.currency_name === 'Naira' ? (
                            <PaymentButton noWidth config={config} onSuccess={onSuccess} onClose={onClose} bgColor="bg-white w-full border-[rgba(0,0,0,0.1)] text-[rgba(66,133,244,1)]!">
                                <span className="text-sm font-medium normal-case">
                                    Show Interest & Pay Fee
                                </span>
                            </PaymentButton>
                        ) : (
                            <DollarPaymentButton onSuccess={onSuccess} bgColor="bg-white w-full border-[rgba(0,0,0,0.1)] text-[rgba(66,133,244,1)]!" amount={totalPrice}>
                                <span className="text-sm font-medium normal-case">
                                    Show Interest & Pay Fee
                                </span>
                            </DollarPaymentButton>
                        )}
                    </div>
                </div>
                :
                <>
                    {content.interest && content.auctionStatus === 'upcoming' ?
                        <div className="max-w-md mx-auto rounded-lg mt-3 bg-[rgba(245,249,253,1)] p-4">
                            <p className="text-[13px] font-semibold">
                                You have successfully declared your interest in this auction. You will be notified as soon as the auction begins. Stay tuned!
                            </p>
                        </div>
                        :
                        <></>
                    }
                </>
            }
        </>
    );
};
export default InterestParticipate;
