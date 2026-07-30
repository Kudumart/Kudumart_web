import { useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, Tag, PhoneIcon, Eye } from "lucide-react";
import useAppState from "../hooks/appState";
import { useAddToCart } from "../api/cart";

const stop = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

// Decides which purchase action(s) a product card should show, so every
// listing grid (home, trending, bookmarks, search, category, vendor store)
// renders the same, correct action instead of each card guessing on its own.
//
//  - Sold out            -> no actions (card already shows a sold-out overlay)
//  - Dropship product     -> "View Details" (SKU must be chosen on the product page)
//  - Unverified vendor    -> "Contact Seller" (goes to the product page's contact flow)
//  - Offer-only category  -> "Request an Offer"
//  - Otherwise            -> "Add to Cart" + "Buy Now"
export default function ProductCardActions({ product, className = "" }) {
  const navigate = useNavigate();
  const { user } = useAppState();
  const { mutate: addItemToCart } = useAddToCart();

  if (!product || product.quantity === 0) return null;

  const isVerified = !!product?.vendor?.isVerified || !!product?.admin;
  const isDropship = !!(product?.variants && product.variants.length > 0);
  const productPath = isDropship
    ? `/product-dropship/${product.id}`
    : `/product/${product.id}`;

  const requireLogin = (fn) => (e) => {
    stop(e);
    if (!user) {
      navigate("/login");
      return;
    }
    fn(e);
  };

  if (isDropship) {
    return (
      <div className={`flex ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(productPath);
          }}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className={`flex ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(productPath);
          }}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-md bg-kudu-orange text-white hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <PhoneIcon size={16} />
          Contact Seller
        </button>
      </div>
    );
  }

  if (product.purchaseType === "offer") {
    return (
      <div className={`flex ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(user ? `${productPath}?offer=1` : "/login");
          }}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-md border border-kudu-orange text-kudu-orange hover:bg-kudu-orange hover:text-white transition-colors text-sm font-medium"
        >
          <Tag size={16} />
          Request an Offer
        </button>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        type="button"
        onClick={requireLogin(() =>
          addItemToCart({ productId: product.id, quantity: 1 }),
        )}
        className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md border border-kudu-orange text-kudu-orange hover:bg-kudu-orange hover:text-white transition-colors text-sm font-medium"
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>
      <button
        type="button"
        onClick={requireLogin(() =>
          addItemToCart(
            { productId: product.id, quantity: 1 },
            { onSuccess: () => navigate("/cart") },
          ),
        )}
        className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md bg-kudu-orange text-white hover:opacity-90 transition-opacity text-sm font-medium"
      >
        <Zap size={16} />
        Buy Now
      </button>
    </div>
  );
}
