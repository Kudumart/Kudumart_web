import React from "react";
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
          <div className="md:w-[68%] w-full mt-10 md:mt-0 flex">
            <CartBlock
              cart={cart}
              reload={refetch}
              removeFromCart={removeItem}
            />
          </div>
          <div className="md:w-[32%] w-full flex">
            {/* {country.value}*/}
            {user_country != "Nigeria" || !country.label ? (
              <>
                {/* {country.value}*/}
                <DollarCartSummary cart={cart} refetch={refetch} />
              </>
            ) : (
              <>
                {/* {country.value}*/}
                <CartSummary cart={cart} refetch={refetch} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
