import { useEffect, useMemo } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import useAppState from "../../../hooks/appState";
import { useGeoLocatorCurrency } from "../../../hooks/geoLocatorProduct";
import { useModal } from "../../../hooks/modal";
import { Country } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { paystackKey } from "../../../config/paymentKeys";
import DollarPaymentButton from "../../../components/DollarPaymentButton";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { DropShipNairaPayment } from "../_components/DropShipNairaPyment";
import { calculate_dropship_price } from "../_components/helper";
import { useNewModal } from "../../../components/modals/modals";
import Modal from "../../../components/modals/DialogModal";
import UpdateShipAdd from "../../../components/UpdateShippingAddress";

// Define the structure of a product charge.
interface ProductCharge {
  id: number;
  name: string;
  description: string;
  calculation_type: "fixed" | "percentage";
  charge_currency: string;
  charge_amount: string | null;
  charge_percentage: string | null;
  minimum_product_amount: string;
  maximum_product_amount: string | null;
}

// Define the structure of the API response for product charges.
interface ProductChargesResponse {
  message: string;
  data: ProductCharge[];
}
// Define the structure for the user object within a product's store.
interface StoreCurrency {
  name: string;
  symbol: string;
}

// Define the structure for the store object within a product.
interface ProductStore {
  name: string;
  currency: StoreCurrency;
}

// Define the structure for a product object within a cart item.
interface ProductItem {
  additional_images: string[];
  id: string;
  vendorId: string;
  storeId: string;
  categoryId: string;
  name: string;
  sku: string;
  condition: string;
  description: string;
  specification: string;
  quantity: number;
  price: string;
  discount_price: string;
  image_url: string;
  video_url: string | null;
  warranty: string;
  return_policy: string;
  seo_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  store: ProductStore;
  type?: string; // Product type (e.g., "dropship", "regular")
}

// Define the structure for a user object within a cart item.
interface UserItem {
  location: any[]; // Placeholder for location structure, adjust if more specific details are known
  isVerified: boolean;
  id: string;
  trackingId: string | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  email: string;
  email_verified_at: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  photo: string | null;
  fcmToken: string;
  wallet: string | null;
  dollarWallet: string;
  facebookId: string | null;
  googleId: string | null;
  accountType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define the structure for a single cart item.
interface CartItemData {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: UserItem;
  product: ProductItem;
}

// Define the structure for the API response containing cart items.
interface CartResponseData {
  data: CartItemData[];
}
// Define the structure for the user object within a cart item.
interface UserInCart {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: any; // Placeholder for location structure, adjust if more specific details are known
  isVerified: boolean;
  googleId: string | null;
  accountType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  photo: string | null;
  fcmToken: string;
  wallet: string | null;
  dollarWallet: string;
  facebookId: string | null;
  gender: string | null;
  trackingId: string | null;
  dateOfBirth: string | null;
}

// Define the structure for the currency object within a product's store.
interface Currency {
  name: string;
  symbol: string;
}

// Define the structure for the store object within a product.
interface Store {
  name: string;
  currency: Currency;
}

// Define the structure for a product object within a cart item.
interface Product {
  additional_images: string[];
  id: string;
  vendorId: string;
  storeId: string;
  categoryId: string;
  name: string;
  sku: string;
  condition: string;
  description: string;
  specification: string;
  quantity: number;
  price: string;
  discount_price: string;
  image_url: string;
  video_url: string | null;
  warranty: string;
  return_policy: string;
  seo_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  store: Store;
  type?: string; // Product type (e.g., "dropship", "regular")
}

// Define the structure for a single cart item.
interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: UserInCart;
  product: Product;
}

// Define the structure for the API response containing cart items.

export interface CartSummaryType {
  cart: CartItem[];
  [key: string]: any;
}
const CartSummary = ({ cart, refetch }: CartSummaryType) => {
  const currency = useGeoLocatorCurrency();

  const { user } = useAppState();
  const query = useQuery<ProductChargesResponse>({
    queryKey: ["charges", cart],
    queryFn: async () => {
      let resp = await apiClient.get("/user/cart/charges");
      console.log(resp.data, "data");
      return resp.data;
    },
  });
  // const [paymentKey, setPaymentKey] = useState({});
  useEffect(() => {
    console.log(cart);
  }, []);
  const { mutate } = useApiMutation();
  const modalRef = useNewModal();

  const { ipInfo } = useAppState();

  const navigate = useNavigate();

  const paymentKey = paystackKey;

  const handleCloseModal = () => {
    modalRef.closeModal();
    refetch();
  };
  const charges = query.data?.data;
  const item_amounts = cart.map((cart_items) => {
    const quantity = cart_items.quantity;

    const discount = parseFloat(cart_items.product.discount_price);
    let basePrice =
      discount != 0 ? discount : parseFloat(cart_items.product.price);
    console.log(basePrice, "price");
    let initial_price = basePrice * quantity; // Calculate total for this item without charges
    if ((cart_items as any).productType === "dropship") {
      initial_price = calculate_dropship_price(cart_items as any);
      // For dropship, the basePrice per unit is the calculated price divided by quantity
      basePrice = initial_price / quantity;
    }
    // Early return if charges are not available
    if (!charges || charges?.length < 1) {
      return {
        full_price: initial_price,
        base_price: initial_price,
        charge_amount: 0,
        cart_items,
      };
    }
    console.log(charges, "ss");

    // Find the appropriate charge based on quantity
    const charge = charges?.find((char) => {
      const minAmount = parseFloat(char.minimum_product_amount);
      const maxAmount = char.maximum_product_amount
        ? parseFloat(char.maximum_product_amount)
        : null;

      // Base price should be >= minimum
      const meetsMinimum = basePrice >= minAmount;

      // If there's a maximum, base price should be <= maximum
      // If no maximum, then any price above minimum is valid
      const meetsMaximum = maxAmount ? basePrice <= maxAmount : true;

      return meetsMinimum && meetsMaximum;
    });

    if (!charge) {
      return {
        full_price: initial_price,
        base_price: initial_price,
        charge_amount: 0,
        cart_items,
      };
    }

    let price;
    let chargeAmount = 0;

    if (charge.calculation_type === "fixed") {
      chargeAmount = parseFloat(charge.charge_amount!);
      // Use rounding to match backend precision
      chargeAmount = Math.round(chargeAmount * 100) / 100;
      price = (basePrice + chargeAmount) * quantity;
    } else if (charge.calculation_type === "percentage") {
      chargeAmount = (basePrice * parseFloat(charge.charge_percentage!)) / 100;
      // Round per-unit charge to 2 decimal places to match backend
      chargeAmount = Math.round(chargeAmount * 100) / 100;
      price = (basePrice + chargeAmount) * quantity;
    } else {
      price = initial_price;
      chargeAmount = 0;
    }

    return {
      full_price: Math.round(price * 100) / 100,
      base_price: initial_price,
      charge_amount: chargeAmount * quantity,
      cart_items,
    };
  });
  console.log(charges);

  const total_price = Math.round(item_amounts.reduce((total, item) => {
    return total + (item.full_price || 0);
  }, 0) * 100) / 100;

  const total_price_without_charges = Math.round(item_amounts.reduce((total, item) => {
    return total + (item.base_price || 0);
  }, 0) * 100) / 100;

  const hasDropShip = cart.some(
    (item) => item.product.type === "dropship",
  );

  const countryCode = useMemo(() => {
    if (!user?.location) return "UK";
    let country = "";
    if (typeof user.location === "string") {
      try {
        const locObj = JSON.parse(user.location);
        country = locObj.country || "";
      } catch (e) {
        country = user.location;
      }
    } else {
      country = (user as any).location?.country || "";
    }

    country = country.toString().toLowerCase();
    if (country.includes("nigeria")) return "NG";
    if (country.includes("united states") || country.includes("usa")) return "US";
    return "UK";
  }, [user?.location]);

  const deliveryFeeQuery = useQuery({
    queryKey: ["deliveryFee", countryCode, hasDropShip],
    queryFn: async () => {
      if (!hasDropShip) return 0;
      const response = await apiClient.get(
        `/user/delivery-fees?shipToCountryCode=${countryCode}`,
      );
      return response.data?.data?.totalDeliveryFee || 0;
    },
    enabled: !!user?.location && hasDropShip,
  });

  const deliveryFee = deliveryFeeQuery.data || 0;
  // Final price with rounding - delivery fee is always added for both Naira and Dollar
  const final_total_price = Math.round((total_price + deliveryFee) * 100) / 100;

  const config = useMemo(
    () => ({
      reference: new Date().getTime().toString(),
      email: user?.email || "user@example.com",
      amount: Math.round(total_price * 100),
      publicKey: paymentKey,
      currency: "NGN",
    }),
    [paymentKey, total_price, user?.email],
  );

  const onSuccess = (reference: any) => {
    const isNaira = ipInfo.currency_name === "Naira";

    // Parse location details
    let zipCode = "000000";
    let addressStr = "";

    if (typeof user.location === "string") {
      try {
        const locObj = JSON.parse(user.location);
        zipCode = locObj.zipCode || "000000";
        addressStr = `${locObj.city} ${locObj.state}, ${locObj.country}`;
      } catch (e) {
        addressStr = user.location;
      }
    } else if (user.location) {
      zipCode = user.location.zipCode || "000000";
      addressStr = [user.location.city, user.location.state, user.location.country]
        .filter(Boolean)
        .join(" ");
    }

    const payload = {
      refId: reference.reference,
      shippingAddress: addressStr || "Default Address",
      shippingAddressZipCode: zipCode,
    };

    mutate({
      url: isNaira ? "/user/checkout" : "/user/checkout/dollar",
      method: "POST",
      data: payload,
      headers: true,
      onSuccess: (response: any) => {
        navigate("/profile/orders");
      },
      onError: (error: any) => { },
    } as any);
  };

  const onClose = () => {
    console.log("Payment closed");
    // Handle modal closure if necessary.
  };

  if (query.isFetching || (hasDropShip && deliveryFeeQuery.isFetching))
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
            className="btn btn-block btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const charges_total = total_price - total_price_without_charges;
  // return <></>;
  return (
    <div
      className="card w-full bg-base-100 shadow-sm rounded-lg"
      data-theme="kudu"
    >
      <Modal ref={modalRef.ref} title="Update Shipping Address">
        <UpdateShipAdd onclose={handleCloseModal} />
      </Modal>
      <div className="card-body p-4 gap-2">
        <h2 className="card-title text-lg font-semibold uppercase mb-2">
          CART Summary
        </h2>

        <div className="divider my-0"></div>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-base-content/60">
              Item's Total (
              {
                item_amounts.filter(
                  (item) => item.cart_items.product.quantity > 0,
                ).length
              }
              )
            </span>
            <span className="text-sm text-base-content/60">
              {currency[0].symbol}
              {total_price_without_charges.toLocaleString("en-US")}
            </span>
          </div>

          {total_price > 0 && charges_total > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-base-content/60">Charges</span>
              <span className="text-sm text-base-content/60">
                {currency[0].symbol}
                {charges_total.toLocaleString("en-US")}
              </span>
            </div>
          )}

          {hasDropShip && deliveryFee > 0 && ipInfo.currency_name !== "Naira" && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-base-content/60">Delivery Fee</span>
              <span className="text-sm text-base-content/60">
                $ {deliveryFee.toLocaleString("en-US")}
              </span>
            </div>
          )}

          {total_price > 0 && (
            <div className="flex justify-between items-center border-t border-base-200 pt-3">
              <span className="text-base font-bold">Total</span>
              <span className="text-base font-bold">
                {currency[0].symbol}
                {final_total_price.toLocaleString("en-US")}
              </span>
            </div>
          )}
        </div>

        <div className="divider my-0"></div>

        {user.location && (() => {
          let locationData = user.location;
          if (typeof user.location === 'string') {
            try {
              locationData = JSON.parse(user.location);
            } catch (e) {
              return null; // Don't render if location string is invalid
            }
          }

          return (
            <div className="py-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold">Delivery Address</p>
                <button
                  onClick={() => modalRef.showModal()}
                  className="btn btn-link btn-xs text-kudu-orange no-underline hover:underline p-0 min-h-0 h-auto"
                >
                  Change default address
                </button>
              </div>
              <p className="text-sm text-base-content/60">
                {locationData.city} {locationData.state},{" "}
                {locationData.country}
              </p>
            </div>
          );
        })()}


        <div className="card-actions justify-center mt-4">
          {user.location ? (
            ipInfo.currency_name === "Naira" ? (
              <div data-theme="kudu" className="w-full">
                <DropShipNairaPayment
                  hasDropShip={hasDropShip}
                  total_price={total_price}
                  deliveryFee={deliveryFee}
                  paymentKey={paymentKey}
                ></DropShipNairaPayment>
              </div>
            ) : (
              <DollarPaymentButton
                amount={final_total_price}
                noWidth={false}
                bgColor="bg-kudu-orange"
                onSuccess={onSuccess}
              >
                <span className="text-sm font-medium normal-case">
                  Checkout ${formatNumberWithCommas(final_total_price)}
                </span>
              </DollarPaymentButton>
            )
          ) : (
            <button
              className="btn bg-kudu-orange hover:bg-kudu-orange/90 border-none text-white w-full"
              onClick={() => modalRef.showModal()}
            >
              Set Delivery Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
