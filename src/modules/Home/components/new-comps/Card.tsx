import { formatNumberWithCommas } from "../../../../helpers/helperFactory";

export default function NewCard({ item }: { item: any }) {
  const currencySymbol = item?.store?.currency?.symbol || "₦";
  const isSoldOut = item.quantity === 0;
  const hasValidDiscount =
    item.discountPrice > 0 && item.discountPrice < item.price;

  const card = (
    <div
      key={item.id}
      className={`bg-white shadow-lg p-1 border rounded-lg relative flex flex-col h-full ${
        isSoldOut ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/*{JSON.stringify(item.variants)}*/}
      {/* Image & Badges */}
      <div className="flex justify-center relative h-[200px]">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover rounded-md"
        />

        {item.isSoldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md">
            <span className="text-white font-semibold text-lg">Sold Out</span>
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
              item.condition === "brand_new" ? "bg-[#34A853]" : "bg-orange-500"
            }`}
          >
            {/*{capitalizeEachWord(item?.condition?.replace(/_/g, " "))}*/}
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
                {/*{currencySymbol} {formatNumberWithCommas(item.price)}*/}
              </p>
              <p className="text-sm font-semibold leading-loose">
                {/*{currencySymbol} {formatNumberWithCommas(item.discountPrice)}*/}
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold leading-loose">
              {/*{currencySymbol} {formatNumberWithCommas(item.price)}*/}
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
  return card;
}
