import { useEffect, useMemo, useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import PaymentButton from "../../../components/PaymentButton";
import useAppState from "../../../hooks/appState";
import { paystackKey } from "../../../config/paymentKeys";
import DollarPaymentButton from "../../../components/DollarPaymentButton";

const InterestParticipate = ({ content, reload }) => {
    const { ipInfo } = useAppState();
    const { mutate } = useApiMutation();

    const paymentKey = paystackKey;

    const totalPrice = Number(content.participantsInterestFee);



    // Create a config object for Paystack payment.
    // useMemo will update the config when paymentKey or effectiveTotalPrice changes.
    const config = useMemo(
        () => ({
            reference: new Date().getTime().toString(),
            email: "greenmousedev@gmail.com", // or use user.email if available.
            amount: totalPrice * 100, // Amount in kobo.
            publicKey: paymentKey,
            currency: content.store.currency.symbol === '#' ? "NGN" : "NGN", // Specify the currency.
        }),
        [paymentKey, totalPrice]
    );



    // Payment gateway key fetch function.
    /* const getPaymentKeys = () => {
         mutate({
             url: `/user/payment/gateway`,
             method: "GET",
             headers: true,
             hideToast: true,
             onSuccess: (response) => {
                 setPaymentKey(response.data.data.find((key) => key.isActive));
             },
             onError: (error) => {
                 console.error("Error fetching payment keys:", error);
             },
         });
     };
 
     useEffect(() => {
         getPaymentKeys();
         // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []); */




    // Callback when the payment is successful.
    const onSuccess = (reference) => {
        const payload = {
            auctionProductId: content.id,
            amountPaid: totalPrice,
        };

        mutate({
            url: "/user/auction/interest",
            method: "POST",
            data: payload,
            headers: true,
            onSuccess: (response) => {
                reload();
            },
            onError: (error) => {
            },
        });
    };



    // Callback when the payment modal is closed.
    const onClose = () => {
        console.log("Payment closed");
    }


    return (
        <>
            {!content.interest && content.auctionStatus === 'upcoming' ?
                <div className="max-w-md mx-auto rounded-lg mt-3 bg-[rgba(245,249,253,1)] p-4">
                    <p className="text-[13px] font-semibold">
                        If you're interested in placing a bid, an interest fee is required to participate. Secure your spot now and get a chance to win!
                    </p>
                    <div className="flex my-2 gap-2 py-2 w-full justify-center">
                        {ipInfo.currency_name === 'Naira' ?
                            <PaymentButton noWidth config={config} onSuccess={onSuccess} onClose={onClose} bgColor="bg-white w-full border-[rgba(0,0,0,0.1)] text-[rgba(66,133,244,1)]!">
                                <span className="text-sm font-medium normal-case">
                                    Show Interest & Pay Fee
                                </span>
                            </PaymentButton>
                            :
                            <DollarPaymentButton onSuccess={onSuccess} bgColor="bg-white w-full border-[rgba(0,0,0,0.1)] text-[rgba(66,133,244,1)]!" amount={totalPrice}>
                                <span className="text-sm font-medium normal-case">
                                    Show Interest & Pay Fee
                                </span>
                            </DollarPaymentButton>
}
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
    )
};
export default InterestParticipate
