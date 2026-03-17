import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatNumberWithCommas } from "../helpers/helperFactory";

const SharePanel = ({ itemId, itemName, itemPath, onClose }) => {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${itemPath}`;
  const shareTitle = itemName || "Check out this product";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const platforms = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-full"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <p className="text-xs font-semibold text-gray-500 mb-2">Share via</p>
      <div className="flex gap-2 flex-wrap mb-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            title={p.name}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            {p.icon}
            <span>{p.name}</span>
          </a>
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 w-full px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium"
      >
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-green-500">Link copied!</span>
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};

const ProductListing = ({
  productsArr = [],
  displayError = false,
  rowNo = 6,
}) => {
  const filteredProducts = productsArr;
  const [activeShare, setActiveShare] = useState(null);

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
          Oops! It looks like we don't have products available in your region at
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
          const itemPath = `/${item.variants ? "product-dropship" : "product"}/${item.id}`;

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

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-kudu-roman-silver">
                      Qty Available: {item.quantity}
                    </p>

                    {/* Share button */}
                    <div className="relative">
                      <button
                        title="Share product"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveShare(
                            activeShare === item.id ? null : item.id,
                          );
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-xs text-gray-500"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span>Share</span>
                      </button>

                      {activeShare === item.id && (
                        <SharePanel
                          itemId={item.id}
                          itemName={item.name}
                          itemPath={itemPath}
                          onClose={() => setActiveShare(null)}
                        />
                      )}
                    </div>
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
            <Link to={itemPath} key={item.id} className="h-full">
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductListing;
