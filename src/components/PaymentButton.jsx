// PaymentButton.jsx
import Button from "./Button";
import { usePaystackPayment } from "react-paystack";
import { toast } from "react-toastify";

const PaymentButton = ({
  config,
  onSuccess,
  disabled,
  user,
  onClose,
  children,
  bgColor,
  noWidth,
}) => {
  // Initialize the payment function with the latest config.
  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    if (user) {
      if (user.location) {
        if (!config.publicKey) {
          console.error("Payment key not loaded");
          return;
        }
        initializePayment({ onSuccess, onClose });
      } else {
        toast.error(
          "Default Shipping Address not set, visit your profile to set up one",
        );
      }
    } else {
      initializePayment({ onSuccess, onClose });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="primary"
      fullWidth={!noWidth}
    >
      {children}
    </Button>
  );
};

export default PaymentButton;
