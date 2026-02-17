import React, { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";

const CartItem = ({ item, removeFromCart, refetch }) => {
  const [disabled, setDisabled] = useState(false);

  let quantity = item.quantity;

  const { mutate } = useApiMutation();

  const handleIncrease = (data) => {
    setDisabled(true);
    mutate({
      url: `/user/cart/update`,
      method: "PUT",
      headers: true,
      data: {
        cartId: item.id,
        quantity: (quantity += 1),
      },
      onSuccess: (response) => {
        refetch();
        setDisabled(false);
      },
      onError: (error) => {
        setDisabled(false);
      },
    });
  };

  const handleDecrease = (data) => {
    if (quantity > 1) {
      setDisabled(true);
      mutate({
        url: `/user/cart/update`,
        method: "PUT",
        headers: true,
        data: {
          cartId: item.id,
          quantity: (quantity -= 1),
        },
        onSuccess: (response) => {
          refetch();
          setDisabled(false);
        },
        onError: (error) => {
          setDisabled(false);
        },
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-gray-300 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Product Image and Info */}
          <div className="flex md:w-[70%] items-center gap-4">
            <div className="relative rounded-md">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                width={100}
                height={100}
                className={`rounded-md object-cover ${item.product.quantity === 0 ? "opacity-40" : ""}`}
              />

              {/* Sold Out Overlay on Image */}
              {item.product.quantity === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-md">
                  <span className="text-white font-bold text-xl">Sold Out</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div
              className={`flex flex-col gap-3 ${item.product.quantity === 0 ? "opacity-50" : ""}`}
            >
              <div className="flex flex-col gap-1 w-full">
                <h2 className="font-bold md:text-lg text-base">
                  {item.product.name}
                </h2>

                <div className="flex items-center gap-2 text-sm">
                  <span className="py-1 px-2 gap-1 rounded-full flex bg-[rgba(52,168,83,1)] text-white">
                    <span className="text-xs">Verified</span>
                  </span>
                  {item.productType === "dropship" && (
                    <div
                      data-theme="kudu"
                      className="badge badge-info  badge-sm badge-soft ring"
                    >
                      Dropshipped
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="w-full">
                    <div className="flex gap-2 mt-2">
                      <p className="text-sm font-bold text-kudu-roman-silver">
                        Quantity Available: {item.product.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Quantity Controls */}
          <div
            className={`flex flex-col items-center gap-4 md:ml-10 ${item.product.quantity === 0 ? "opacity-50" : ""}`}
          >
            <div>
              {(() => {
                const price = parseFloat(item?.product.price);
                const discountPrice = parseFloat(item?.product.discount_price);
                const currencySymbol =
                  item?.product?.store?.currency?.symbol || "₦";
                const hasValidDiscount =
                  discountPrice > 0 && discountPrice < price;

                return hasValidDiscount ? (
                  <div className="flex flex-col mt-2 text-center">
                    <p className="text-lg font-bold leading-loose text-red-500 line-through">
                      {currencySymbol} {formatNumberWithCommas(price)}
                    </p>
                    <p className="text-lg font-bold leading-loose">
                      {currencySymbol} {formatNumberWithCommas(discountPrice)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold leading-loose text-center">
                    {currencySymbol} {formatNumberWithCommas(price)}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-between">
          <div className="flex gap-2 mt-3">
            {/* Remove Button */}
            <svg
              className="mt-2"
              width="14"
              height="16"
              viewBox="0 0 20 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.9375 3.77655H1.0625C0.847012 3.77655 0.640349 3.86215 0.487976 4.01453C0.335603 4.1669 0.25 4.37356 0.25 4.58905C0.25 4.80454 0.335603 5.0112 0.487976 5.16357C0.640349 5.31595 0.847012 5.40155 1.0625 5.40155H1.875V20.0266C1.875 20.4575 2.0462 20.8709 2.35095 21.1756C2.6557 21.4803 3.06902 21.6516 3.5 21.6516H16.5C16.931 21.6516 17.3443 21.4803 17.649 21.1756C17.9538 20.8709 18.125 20.4575 18.125 20.0266V5.40155H18.9375C19.153 5.40155 19.3597 5.31595 19.512 5.16357C19.6644 5.0112 19.75 4.80454 19.75 4.58905C19.75 4.37356 19.6644 4.1669 19.512 4.01453C19.3597 3.86215 19.153 3.77655 18.9375 3.77655ZM16.5 20.0266H3.5V5.40155H16.5V20.0266ZM5.125 1.33905C5.125 1.12356 5.2106 0.916899 5.36298 0.764526C5.51535 0.612153 5.72201 0.52655 5.9375 0.52655H14.0625C14.278 0.52655 14.4847 0.612153 14.637 0.764526C14.7894 0.916899 14.875 1.12356 14.875 1.33905C14.875 1.55454 14.7894 1.7612 14.637 1.91357C14.4847 2.06595 14.278 2.15155 14.0625 2.15155H5.9375C5.72201 2.15155 5.51535 2.06595 5.36298 1.91357C5.2106 1.7612 5.125 1.55454 5.125 1.33905Z"
                fill="#FF6F22"
              />
            </svg>
            <button
              onClick={() => removeFromCart(item)}
              className="text-kudu-orange mt-2 font-medium hover:underline text-sm"
            >
              REMOVE
            </button>
          </div>

          <div className="flex">
            {/* Quantity Controls */}
            {/* Show Sold Out or Quantity Controls */}
            {item.product.quantity === 0 ? (
              <button className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed">
                Sold Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  disabled={disabled}
                  onClick={() => handleDecrease(item)}
                  className="bg-kudu-orange text-white px-3 py-1 rounded-sm hover:bg-orange-600"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-semibold rounded-sm">
                  {item.quantity}
                </span>
                <button
                  disabled={disabled}
                  onClick={() => handleIncrease(item)}
                  className="bg-kudu-orange text-white px-3 py-1 rounded-sm hover:bg-orange-600"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItem;
