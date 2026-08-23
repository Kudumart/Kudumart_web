import { useEffect, useMemo, useState } from "react";
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
import Button from "../../../components/Button";

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

interface ProductChargesResponse {
  message: string;
  data: ProductCharge[];
}

interface StoreCurrency {
  name: string;
  symbol: string;
}

interface ProductStore {
  name: string;
  currency: StoreCurrency;
}

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
}

interface UserItem {
  location: any[];
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

interface CartResponseData {
  data: CartItemData[];
}

interface UserInCart {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: any;
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

interface Currency {
  name: string;
  symbol: string;
}

interface Store {
  name: string;
  currency: Currency;
}

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
}

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

export interface CartSummaryType {
  cart: CartItem[];
  cartItemIds?: string[];
  [key: string]: any;
}

const CartSummary = ({ cart, refetch, cartItemIds }: CartSummaryType) => {
  const currency = useGeoLocatorCurrency();
  const [deliveryOption, setDeliveryOption] = useState<"customer" | "store">("customer");

  const { user } = useAppState();
  const query = useQuery<ProductChargesResponse>({
    queryKey: ["charges", cart],
    queryFn: async () => {
      let resp = await apiClient.get("/user/cart/charges");
      console.log(resp.data, "data");
      return resp.data;
    },
  });
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
    let initial_price = basePrice * quantity;
    if ((cart_items as any).productType === "dropship") {
      initial_price = calculate_dropship_price(cart_items as any);
      basePrice = initial_price / quantity;
    }
    if (!charges || charges?.length < 1) {
      return {
        full_price: initial_price,
        base_price: initial_price,
        charge_amount: 0,
        cart_items,
      };
    }
    console.log(charges, "ss");

    const charge = charges?.find((char) => {
      const minAmount = parseFloat(char.minimum_product_amount);
      const maxAmount = char.maximum_product_amount
        ? parseFloat(char.maximum_product_amount)
        : null;

      const meetsMinimum = basePrice >= minAmount;
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
      chargeAmount = parseFloat(charge.charge_amount!) * quantity;
      price = (basePrice + parseFloat(charge.charge_amount!)) * quantity;
    } else if (charge.calculation_type === "percentage") {
      const percentagePerUnit =
        (basePrice * parseFloat(charge.charge_percentage!)) / 100;
      chargeAmount = percentagePerUnit * quantity;
      price = (basePrice + percentagePerUnit) * quantity;
    } else {
      price = initial_price;
      chargeAmount = 0;
    }

    return {
      full_price: price,
      base_price: initial_price,
      charge_amount: chargeAmount,
      cart_items,
    };
  });
  console.log(charges);

  const total_price = item_amounts.reduce((total, item) => {
    return total + (item.full_price || 0);
  }, 0);

  const total_price_without_charges = item_amounts.reduce((total, item) => {
    return total + (item.base_price || 0);
  }, 0);

  const config = useMemo(
    () => ({
      reference: new Date().getTime().toString(),
      email: user?.email || "user@example.com",
      amount: total_price * 100,
      publicKey: paymentKey,
      currency: "NGN",
    }),
    [paymentKey, total_price, user?.email],
  );

  const onSuccess = (reference: any) => {
    const location =
      user.location && typeof user.location !== "string"
        ? [user.location.city, user.location.state, user.location.country]
            .filter(Boolean)
            .join(" ")
        : null;
    const payload = {
      refId: reference.reference,
      shippingAddress:
        deliveryOption === "store"
          ? "Pickup at Kudumart Store"
          : typeof user.location === "string"
          ? `${JSON.parse(user.location).city} ${
              JSON.parse(user.location).state
            }, ${JSON.parse(user.location).country}`
          : `${location}`,
      ...(cartItemIds ? { cartItemIds } : {}),
    };
    mutate({
      url: "/user/checkout",
      method: "POST",
      data: payload,
      headers: true,
      onSuccess: (response: any) => {
        navigate("/profile/orders");
      },
      onError: (error: any) => {},
    } as any);
  };

  const onClose = () => {
    console.log("Payment closed");
  };

  if (query.isFetching)
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
          <Button
            onClick={() => query.refetch()}
            variant="primary"
            fullWidth
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  const charges_total = total_price - total_price_without_charges;
  const hasDropShip = cart.some(
    (item: any) => item["product"]["type"] == "dropship",
  );
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

          {ipInfo.currency_name === "Naira" && total_price > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-base-content/60">Charges</span>
              <span className="text-sm text-base-content/60">
                ₦{charges_total.toLocaleString("en-US")}
              </span>
            </div>
          )}

          {total_price > 0 && (
            <div className="flex justify-between items-center border-t border-base-200 pt-3">
              <span className="text-base font-bold">Total</span>
              <span className="text-base font-bold">
                {currency[0].symbol}
                {(ipInfo.currency_name === "Naira"
                  ? total_price
                  : total_price_without_charges
                ).toLocaleString("en-US")}
              </span>
            </div>
          )}
        </div>

        <div className="divider my-0"></div>

        <div className="py-2">
          <p className="text-sm font-semibold mb-2">Delivery Option</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="deliveryOption" 
                checked={deliveryOption === "customer"} 
                onChange={() => setDeliveryOption("customer")}
                className="radio radio-sm radio-primary"
              />
              <span className="text-sm">Home Delivery (Customer Address)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="deliveryOption" 
                checked={deliveryOption === "store"} 
                onChange={() => setDeliveryOption("store")}
                className="radio radio-sm radio-primary"
              />
              <span className="text-sm">Pickup at Kudumart Store</span>
            </label>
          </div>
        </div>

        {deliveryOption === "store" && (
          <div className="py-3 px-4 bg-orange-50 border border-orange-100 rounded-lg mt-2 mb-2">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kudu-orange mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-bold text-gray-800">Kudumart Store Location</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Abeokuta, Ogun State, Nigeria.<br/>
                  <span className="text-xs text-gray-500">(Main Office)</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 font-medium bg-white px-2 py-1 rounded inline-block border border-orange-100">
                  Please bring your order confirmation email for pickup.
                </p>
              </div>
            </div>
          </div>
        )}

        {deliveryOption === "customer" && user.location && (
          <div className="py-2 border-t border-base-200 mt-2 pt-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold">Delivery Address</p>
              <Button
                variant="ghost"
                onClick={() => modalRef.showModal()}
                className="text-kudu-orange no-underline hover:underline p-0 h-auto min-h-0 text-xs font-normal"
              >
                Change default address
              </Button>
            </div>
            <p className="text-sm text-base-content/60">
              {user.location.city} {user.location.state},{" "}
              {user.location.country}
            </p>
          </div>
        )}

        <div className="card-actions justify-center mt-4">
          {deliveryOption === "store" || user.location ? (
            ipInfo.currency_name === "Naira" ? (
              <div data-theme="kudu" className="w-full">
                <DropShipNairaPayment
                  hasDropShip={hasDropShip}
                  total_price={total_price}
                  paymentKey={paymentKey}
                  cartItemIds={cartItemIds}
                ></DropShipNairaPayment>
              </div>
            ) : (
              <DollarPaymentButton
                amount={total_price}
                noWidth={false}
                bgColor="bg-kudu-orange"
                onSuccess={onSuccess}
              >
                <span className="text-sm font-medium normal-case">
                  Checkout ${formatNumberWithCommas(total_price)}
                </span>
              </DollarPaymentButton>
            )
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={() => modalRef.showModal()}
            >
              Set Delivery Location
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
