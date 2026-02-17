import { Link } from "react-router-dom";
import { formatNumberWithCommas } from "../helpers/helperFactory";

const ProductListing = ({
  productsArr = [],
  displayError = false,
  rowNo = 6,
}) => {
  const filteredProducts = productsArr;

  const capitalizeEachWord = (str) =>
    str
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  // Tailwind-safe dynamic column classes
  const gridColsClass =
    {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
      7: "md:grid-cols-7",
      8: "md:grid-cols-8",
    }[Number(rowNo)] || "md:grid-cols-6";

  if (filteredProducts.length === 0 && displayError) {
    return (
      <div className="w-full text-center">
        <img
          src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
          alt="Empty Store Illustration"
          className="w-80 h-80 mx-auto"
        />
        <h1 className="text-lg font-bold mb-4">No Product Found</h1>
        <p className="text-black-100 mb-6 leading-loose text-sm">
          Oops! It looks like we don’t have products available in your region at
          the moment. <br />
          Please check back later or try browsing other categories.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`grid grid-cols-[repeat(auto-fill,minmax(150px,auto))]
         md:grid-cols-[repeat(auto-fill,minmax(250px,auto))] gap-4`}
      >
        {filteredProducts.map((item) => {
          const isSoldOut = item.quantity === 0;
          const price = parseFloat(item?.price);
          const discountPrice = parseFloat(item?.discount_price);
          const hasValidDiscount = discountPrice > 0 && discountPrice < price;
          const currencySymbol = item?.store?.currency?.symbol || "₦";

          const card = (
            <div
              key={item.id}
              className={`bg-white shadow-lg p-1 border rounded-lg relative flex flex-col h-full ${
                isSoldOut ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Image & Badges */}
              <div className="flex justify-center relative h-[200px]">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-md"
                />

                {isSoldOut && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md">
                    <span className="text-white font-semibold text-lg">
                      Sold Out
                    </span>
                  </div>
                )}

                <div className="absolute w-full mt-3">
                  <button
                    className={`absolute top-0 right-0 px-2 py-1 text-xs rounded font-medium text-white ${
                      item?.vendor?.isVerified || item.admin
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {item?.vendor?.isVerified || item.admin
                      ? "Verified"
                      : "Not Verified"}
                  </button>

                  <span
                    className={`absolute top-0 left-0 px-2 py-1 text-xs rounded font-medium text-white ${
                      item.condition === "brand_new"
                        ? "bg-[#34A853]"
                        : "bg-orange-500"
                    }`}
                  >
                    {capitalizeEachWord(item?.condition?.replace(/_/g, " "))}
                  </span>
                </div>
              </div>
              {/* Info Section */}
              <div className="p-3 flex flex-col justify-between grow">
                <div>
                  <h3 className="text-base font-medium mt-1 leading-loose truncate">
                    {item.name}
                  </h3>

                  {hasValidDiscount ? (
                    <div className="flex flex-col mt-2">
                      <p className="text-sm font-semibold leading-loose text-red-500 line-through">
                        {currencySymbol} {formatNumberWithCommas(price)}
                      </p>
                      <p className="text-sm font-semibold leading-loose">
                        {currencySymbol} {formatNumberWithCommas(discountPrice)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold leading-loose">
                      {currencySymbol} {formatNumberWithCommas(price)}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <p className="text-sm text-kudu-roman-silver">
                      Qty Available: {item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );

          return isSoldOut ? (
            <div key={item.id} className="h-full">
              {card}
            </div>
          ) : (
            <Link
              to={`/${item.variants ? "product-dropship" : "product"}/${item.id}`}
              key={item.id}
              className="h-full"
            >
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductListing;
