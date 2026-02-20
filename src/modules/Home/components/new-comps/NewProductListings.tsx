import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface ProductCard {
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
  vendor: {
    location: {
      city: string;
      state: string;
      country: string;
    };
    isVerified: boolean;
    id: string;
    trackingId: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    email_verified_at: string;
    phoneNumber: string;
    dateOfBirth: string;
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
  };
  admin: string | null;
  sub_category: {
    id: string;
    name: string;
    categoryId: string;
  };
  store: {
    location: {
      city: string;
      state: string;
      address: string;
      country: string;
    };
    businessHours: {
      sunday: string;
      saturday: string;
      monday_friday: string;
    };
    deliveryOptions: any[];
    id: string;
    vendorId: string;
    currencyId: string;
    name: string;
    tipsOnFinding: string;
    logo: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    currency: {
      id: string;
      symbol: string;
    };
  };
}

export default function NewProductListing({ data }: { data: ProductCard[] }) {
  const navigate = useNavigate();

  return (
    <div
      className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2"
      data-theme="kudu"
    >
      {data.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center p-8">
          <p className="text-xl font-semibold text-base-content mb-4">
            No items found.
          </p>
          <p className="text-base text-base-content/70">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        data.map((product: ProductCard, index: number) => {
          const isSoldOut = product.quantity === 0;
          const price = parseFloat(product?.price);
          const discountPrice = parseFloat(product?.discount_price);
          const currencySymbol = product?.store?.currency?.symbol || "₦";
          const hasValidDiscount = discountPrice > 0 && discountPrice < price;

          return (
            <div
              onClick={() => {
                if (product.variants) {
                  return navigate(`/product-dropship/${product.id}`);
                }
                navigate(`/product/${product.id}`);
              }}
              className={`card w-full bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 ${
                isSoldOut ? "opacity-70" : ""
              }`}
              key={index}
            >
              <figure className="relative h-48 overflow-hidden">
                <img
                  src={product.image_url || "https://picsum.photos/400/225"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasValidDiscount && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-secondary-content text-xs font-semibold rounded">
                    SALE
                  </div>
                )}
                {isSoldOut && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-error text-error-content text-lg font-bold rounded-lg z-10">
                    SOLD OUT
                  </div>
                )}
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-base font-semibold mb-1 line-clamp-2">
                  {product.name}
                </h2>
                <p className="text-sm text-base-content/70 mb-2">
                  {product.store.name} - {product.store.location.city}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-primary">
                    {currencySymbol}
                    {price.toFixed(2)}
                  </span>
                  {hasValidDiscount && (
                    <span className="text-sm line-through text-base-content/50">
                      {currencySymbol}
                      {discountPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="card-actions justify-start gap-2 text-xs">
                  <span className="px-2 py-1 border border-base-300 rounded">
                    {product.condition}
                  </span>
                  <span className="px-2 py-1 border border-base-300 rounded">
                    Qty: {product.quantity}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
