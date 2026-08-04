import React, { useState } from "react";
import CartBlock from "./layouts/cartsBlock";
import { useCart, useRemoveFromCart } from "../../api/cart";
import Loader from "../../components/Loader";
import CartSummary from "./layouts/cartSummary";
import { useCountrySelect } from "../../store/clientStore";
import DollarCartSummary from "./layouts/DollarCartSummary";
import useAppState from "../../hooks/appState";

export default function Cart() {
  const { data: cart, isLoading, refetch } = useCart();
  const { mutate: removeFromCart } = useRemoveFromCart();
  const { country } = useCountrySelect();
  const { user } = useAppState();
  const user_country = user?.location["country"];

  // "Buy It Now": when set, checkout is scoped to just this one cart item
  // instead of the whole cart.
  const [buyNowItem, setBuyNowItem] = useState(null);
  const effectiveCart =
    buyNowItem && cart?.some((item) => item.id === buyNowItem.id)
      ? cart.filter((item) => item.id === buyNowItem.id)
      : cart;
  const cartItemIds = buyNowItem ? [buyNowItem.id] : undefined;

  const removeItem = async (data) => {
    try {
      removeFromCart(data.id);
    } catch (error) {
      console.error("Error removing item:", error);
      // Handle error (show toast, etc.)
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full bg-kudu-light-blue mt-12">
      <div className="w-full flex flex-col xl:px-80 lg:pl-44 lg:pr-36 md:px-4 px-3 md:py-0 lg:gap-10 md:gap-8 gap-5 bg-kudu-light-blue h-full">
        <div className="w-full flex md:flex-row flex-col gap-10 items-start md:my-24 my-20">
          <div className="md:w-[68%] w-full mt-10 md:mt-0 flex flex-col gap-3">
            {buyNowItem && (
              <div className="w-full flex items-center justify-between gap-3 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                <span className="text-sm text-gray-700">
                  Checking out <strong>{buyNowItem.product?.name}</strong> only.
                </span>
                <button
                  onClick={() => setBuyNowItem(null)}
                  className="text-sm font-medium text-kudu-orange hover:underline shrink-0"
                >
                  Checkout full cart instead
                </button>
              </div>
            )}
            <CartBlock
              cart={cart}
              reload={refetch}
              removeFromCart={removeItem}
              onBuyNow={setBuyNowItem}
            />
          </div>
          <div className="md:w-[32%] w-full flex">
            {/* {country.value}*/}
            {user_country != "Nigeria" || !country.label ? (
              <>
                {/* {country.value}*/}
                <DollarCartSummary
                  cart={effectiveCart}
                  refetch={refetch}
                  cartItemIds={cartItemIds}
                />
              </>
            ) : (
              <>
                {/* {country.value}*/}
                <CartSummary
                  cart={effectiveCart}
                  refetch={refetch}
                  cartItemIds={cartItemIds}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
