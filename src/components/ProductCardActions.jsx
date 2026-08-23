import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { ShoppingCart, Tag, PhoneIcon, Eye } from "lucide-react";
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
//  - Otherwise            -> "Add to Cart" only — Buy Now is intentionally
//    limited to the product detail page (viewProduct.tsx), not listing cards.
export default function ProductCardActions({ product, className = "" }) {
  const navigate = useNavigate();
  const { user } = useAppState();
  const { mutate: addItemToCart } = useAddToCart();

  if (!product || product.quantity === 0) return null;

  const isVerified = !!product?.vendor?.isVerified || !!product?.admin || !!product?.isVerified;
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
      <div className={`flex w-full mt-2 ${className}`}>
        <Button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(productPath);
          }}
          variant="outline"
          size="sm"
          fullWidth
          icon={<Eye size={16} />}
        >
          View Details
        </Button>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className={`flex w-full mt-2 ${className}`}>
        <Button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(productPath);
          }}
          variant="primary"
          size="sm"
          fullWidth
          icon={<PhoneIcon size={16} />}
        >
          Contact Seller
        </Button>
      </div>
    );
  }

  if (product.purchaseType === "offer") {
    return (
      <div className={`flex w-full mt-2 ${className}`}>
        <Button
          type="button"
          onClick={(e) => {
            stop(e);
            navigate(user ? `${productPath}?offer=1` : "/login");
          }}
          variant="outline"
          size="sm"
          fullWidth
          icon={<Tag size={16} />}
        >
          Request an Offer
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex w-full mt-2 ${className}`}>
      <Button
        type="button"
        onClick={requireLogin(() =>
          addItemToCart({ productId: product.id, quantity: 1 }),
        )}
        variant="primary"
        size="sm"
        fullWidth
        icon={<ShoppingCart size={16} />}
      >
        Add to Cart
      </Button>
    </div>
  );
}
