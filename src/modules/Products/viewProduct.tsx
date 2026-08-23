//@ts-nocheck

import { useEffect, useState } from "react";
import Imgix from "react-imgix";
import Loader from "../../components/Loader";
import useApiMutation from "../../api/hooks/useApiMutation";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  currencyFormat,
  formatNumberWithCommas,
  formatString,
} from "../../helpers/helperFactory";
import { getDateDifference } from "../../helpers/dateHelper";
import useAppState from "../../hooks/appState";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useModal } from "../../hooks/modal";
import { Carousel } from "@material-tailwind/react";
import Button from "../../components/Button";
import { sendMessage } from "../../api/message";
import ProductReview from "./productReviews";
import { useAddToCart } from "../../api/cart";
import {
  Bookmark,
  MessageCircle,
  PhoneIcon,
  ShoppingCart,
  Share2,
  Link,
  Check,
  X,
  Tag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Store,
  Info,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Award,
  Sparkles,
} from "lucide-react";
import SafeHTML from "../../helpers/safeHTML";
import { IoCart, IoChatbox } from "react-icons/io5";
import type { Product } from "../../types";

export default function ViewProduct() {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | {}>({});
  const [quantity, setQuantity] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "safety" | "reviews">("description");
  const { openModal } = useModal();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [currentOffer, setCurrentOffer] = useState<any>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);

  const { mutate: addItemToCart, isLoading } = useAddToCart();

  const { user } = useAppState();

  const { mutate } = useApiMutation();

  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const fetchVendorProducts = (vendorId: string) => {
    mutate({
      url: `/products?vendorId=${vendorId}&limit=12`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (res) => {
        const list = res.data?.data || [];
        setVendorProducts(list.filter((p: any) => p.id !== id));
      },
      onError: () => {},
    });
  };

  const getProductDetails = async () => {
    try {
      const productRequest = new Promise((resolve, reject) => {
        mutate({
          url: `/product?productId=${id}`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
            const productData = response.data.data;
            // Attach recommendedProducts from the top-level response to the product object
            productData.recommendedProducts = response.data.recommendedProducts || [];
            const vId = productData.vendor?.id || productData.vendorId;
            if (vId) {
              fetchVendorProducts(vId);
            }
            resolve(productData);
          },
          onError: reject,
        });
      });
      const [product] = await Promise.all([productRequest]);
      setProduct(product);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSavedProducts = async () => {
    try {
      const savedProducts = new Promise((resolve, reject) => {
        mutate({
          url: `/user/saved/products`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
            const isBookmarked = response.data.data.some(
              (item) => item.productId === id,
            );
            setBookmarked(isBookmarked);
          },
          onError: reject,
        });
      });
      const [product] = await Promise.all([savedProducts]);
      //setProduct(product);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOffer = () => {
    mutate({
      url: `/user/offers?limit=50`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const offers: any[] = response.data.data || [];
        const offer = offers.find((o) => o.productId === id);
        if (offer) {
          setCurrentOffer(offer);
          const stored = localStorage.getItem(`kudu_offer_${id}`);
          if (stored && offer.status === "accepted") {
            setPendingCheckout(true);
          }
        }
      },
      onError: () => { },
    });
  };

  const submitOffer = () => {
    if (!offerPrice || isNaN(parseFloat(offerPrice))) {
      toast.error("Please enter a valid offer price");
      return;
    }
    setOfferLoading(true);
    mutate({
      url: `/user/products/${id}/offers`,
      method: "POST",
      headers: true,
      data: {
        offeredPrice: parseFloat(offerPrice),
        ...(offerMessage.trim() && { message: offerMessage }),
      },
      onSuccess: (response) => {
        setCurrentOffer(response.data.data);
        setOfferLoading(false);
      },
      onError: () => setOfferLoading(false),
    });
  };

  const respondToCounter = (status: "accepted" | "rejected") => {
    setOfferLoading(true);
    mutate({
      url: `/user/offers/${currentOffer.id}/respond`,
      method: "PUT",
      headers: true,
      data: { status },
      onSuccess: (response) => {
        setCurrentOffer(response.data.data);
        setOfferLoading(false);
      },
      onError: () => setOfferLoading(false),
    });
  };

  const handleInitiatePayment = () => {
    setOfferLoading(true);
    mutate({
      url: `/user/offers/${currentOffer.id}/initiate-payment`,
      method: "POST",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const { refId, paystackDetails } = response.data.data;
        localStorage.setItem(
          `kudu_offer_${id}`,
          JSON.stringify({ offerId: currentOffer.id, refId }),
        );
        setOfferLoading(false);
        window.location.href = paystackDetails.authorization_url;
      },
      onError: () => setOfferLoading(false),
    });
  };

  const handleCheckout = () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter your shipping address");
      return;
    }
    const stored = localStorage.getItem(`kudu_offer_${id}`);
    const refId = stored ? JSON.parse(stored).refId : searchParams.get("refId");
    if (!refId) {
      toast.error("Payment reference not found. Please retry payment.");
      return;
    }
    setOfferLoading(true);
    mutate({
      url: `/user/offers/${currentOffer.id}/checkout`,
      method: "POST",
      headers: true,
      data: { refId, shippingAddress: shippingAddress.trim() },
      onSuccess: (response) => {
        setCurrentOffer((prev: any) => ({
          ...prev,
          status: "completed",
          trackingNumber: response.data.data.trackingNumber,
        }));
        localStorage.removeItem(`kudu_offer_${id}`);
        setPendingCheckout(false);
        setOfferLoading(false);
      },
      onError: () => setOfferLoading(false),
    });
  };

  useEffect(() => {
    // Reset all product-level state whenever the product id changes
    // so navigating from one product to another (Similar Products / More from Store)
    // shows the correct data without stale flashes.
    setProduct({});
    setLoading(true);
    setQuantity(0);
    setDisabled(true);
    setBookmarked(false);
    setVendorProducts([]);
    setCurrentOffer(null);
    setPendingCheckout(false);
    setSelectedImgIndex(0);
    setActiveTab("description");

    getProductDetails();
    if (user) {
      getSavedProducts();
      fetchMyOffer();
    }
    const refId = searchParams.get("refId");
    if (refId) {
      setPendingCheckout(true);
      setShowOfferModal(true);
    } else if (searchParams.get("offer") === "1" && user) {
      setShowOfferModal(true);
    }
  }, [id]); // re-run whenever the product id changes

  // Inject OG meta tags for social sharing after product loads.
  // NOTE: This is a best-effort client-side injection for platforms that
  // execute JavaScript (e.g. WhatsApp on Android, Telegram, Slack).
  // Platforms like Facebook/Twitter crawlers do NOT execute JS on SPAs,
  // so true OG metadata for those platforms requires server-side rendering
  // or a pre-rendering/SSR solution (e.g. Next.js, a proxy pre-renderer).
  useEffect(() => {
    const p = product as Product;
    if (!p?.name) return;
    const productTitle = p.name || "Product on Kudumart";
    const productImage = (p as any).additional_images?.[0] || (p as any).image_url || "";
    const productDesc = p.description?.replace(/<[^>]+>/g, "").slice(0, 160) || `Check out ${productTitle} on Kudumart`;
    const productUrl = `${window.location.origin}/product/${id}`;

    document.title = `${productTitle} | Kudumart`;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("og:title", productTitle);
    setMeta("og:description", productDesc);
    setMeta("og:image", productImage);
    setMeta("og:url", productUrl);
    setMeta("og:type", "product");
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", productTitle);
    setMetaName("twitter:description", productDesc);
    setMetaName("twitter:image", productImage);
    setMetaName("description", productDesc);

    return () => {
      document.title = "Kudu";
    };
  }, [product, id]);

  const addToBookMark = () => {
    mutate({
      url: `/user/save/product`,
      method: "POST",
      headers: true,
      data: { productId: id },
      onSuccess: (response) => setBookmarked(true),
    });
  };

  const handleAddToCart = () => {
    if (user) {
      const payload = { productId: id, quantity };
      addItemToCart(payload);
    } else {
      navigate("/login");
    }
  };

  const handleBuyNow = () => {
    if (user) {
      const payload = { productId: id, quantity };
      addItemToCart(payload, {
        onSuccess: () => navigate("/cart"),
      });
    } else {
      navigate("/login");
    }
  };

  const handleIncrease = () => {
    setQuantity((prevState) => prevState + 1);
    setDisabled(false);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity((prevState) => prevState - 1);
    }
    if (quantity === 1) {
      setDisabled(true);
    }
  };

  const [copied, setCopied] = useState(false);

  // The backend is the single source of truth for whether this product can be
  // added to a cart or should be offer/inquiry-only (see getProductPurchaseType
  // in the API). Reading it here instead of re-deriving it from category
  // name/id keeps the detail page, listing cards, and the cart endpoint from
  // ever disagreeing with each other.
  const isNonCartCategory = () => (product as any)?.purchaseType === "offer";

  const shareUrl = `${window.location.origin}/product/${id}`;
  const shareTitle = (product as Product)?.name || "Check out this product";

  const sharePlatforms = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "(Twitter)",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const { mutate: initiate, isLoading: isInitiating } = sendMessage();
  const initiateChat = () => {
    initiate(
      {
        productId: id,
        receiverId: product.vendor.id ? product.vendor.id : product.vendorId,
        content: `Hello ${product.vendor.firstName ? product.vendor.firstName : ""
          }`,
      },
      {
        onSuccess: () => {
          navigate(`/messages?productId=${id}`);
          toast.success("Chat initiated successfully!");
        },
      },
    );
  };

  const showContact = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    openModal({
      size: "sm",
      content: (
        <>
          <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
            <div className="flex gap-5 justify-center w-full">
              <p className="font-semibold text-center text-lg">
                Vendor Contact
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm gap-2 flex leading-[1.7rem]">
                <svg
                  className="mt-1"
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5253 1.30599C11.5508 1.21081 11.5947 1.12158 11.6547 1.04339C11.7147 0.965204 11.7894 0.899598 11.8748 0.850321C11.9601 0.801044 12.0543 0.769061 12.152 0.7562C12.2496 0.743339 12.3489 0.749852 12.4441 0.775367C13.8344 1.13813 15.103 1.86497 16.119 2.88103C17.1351 3.89708 17.8619 5.16562 18.2247 6.55599C18.2502 6.65116 18.2567 6.75042 18.2439 6.84811C18.231 6.94579 18.199 7.03999 18.1497 7.12531C18.1005 7.21063 18.0349 7.28541 17.9567 7.34536C17.8785 7.40532 17.7893 7.44928 17.6941 7.47474C17.6307 7.49138 17.5655 7.49989 17.5 7.50005C17.3347 7.50005 17.1741 7.44545 17.043 7.34475C16.912 7.24405 16.8179 7.10288 16.7753 6.94318C16.4795 5.80817 15.8863 4.77259 15.0569 3.9432C14.2275 3.11381 13.1919 2.52061 12.0569 2.22474C11.9616 2.19938 11.8723 2.15549 11.794 2.09558C11.7157 2.03566 11.65 1.9609 11.6006 1.87557C11.5513 1.79024 11.5192 1.69601 11.5063 1.59828C11.4933 1.50054 11.4998 1.40122 11.5253 1.30599ZM11.3069 5.22474C12.5997 5.56974 13.4303 6.40037 13.7753 7.69318C13.8179 7.85288 13.912 7.99405 14.043 8.09475C14.1741 8.19545 14.3347 8.25005 14.5 8.25005C14.5655 8.24989 14.6307 8.24138 14.6941 8.22474C14.7893 8.19928 14.8785 8.15532 14.9567 8.09536C15.0349 8.03541 15.1005 7.96063 15.1497 7.87531C15.199 7.78999 15.231 7.69579 15.2439 7.59811C15.2567 7.50042 15.2502 7.40116 15.2247 7.30599C14.7447 5.50974 13.4903 4.25537 11.6941 3.77537C11.5019 3.72402 11.2971 3.75113 11.1249 3.85073C10.9527 3.95033 10.8271 4.11426 10.7758 4.30646C10.7244 4.49866 10.7516 4.70338 10.8512 4.87559C10.9508 5.04781 11.1147 5.1734 11.3069 5.22474ZM18.9888 14.1638C18.8216 15.4341 18.1977 16.6002 17.2337 17.4442C16.2696 18.2882 15.0313 18.7523 13.75 18.7501C6.30626 18.7501 0.250008 12.6938 0.250008 5.25005C0.247712 3.96876 0.711903 2.73045 1.55588 1.76639C2.39986 0.802337 3.56592 0.178467 4.83626 0.0113044C5.1575 -0.0279197 5.4828 0.0378001 5.76362 0.198653C6.04444 0.359506 6.2657 0.606865 6.39438 0.903804L8.37438 5.32412V5.33537C8.4729 5.56267 8.51359 5.81083 8.49282 6.05769C8.47204 6.30455 8.39044 6.54242 8.25532 6.75005C8.23845 6.77537 8.22063 6.7988 8.20188 6.82224L6.25001 9.13599C6.9522 10.5629 8.4447 12.0422 9.89032 12.7463L12.1722 10.8047C12.1946 10.7859 12.2181 10.7684 12.2425 10.7522C12.45 10.6139 12.6887 10.5294 12.937 10.5065C13.1853 10.4836 13.4354 10.5229 13.6647 10.621L13.6769 10.6266L18.0934 12.6057C18.3909 12.7339 18.6389 12.955 18.8003 13.2358C18.9616 13.5167 19.0278 13.8422 18.9888 14.1638ZM17.5 13.9763C17.5 13.9763 17.4934 13.9763 17.4897 13.9763L13.0834 12.0029L10.8006 13.9444C10.7785 13.9632 10.7553 13.9807 10.7313 13.9969C10.5154 14.1409 10.2659 14.2265 10.0071 14.2452C9.74828 14.2639 9.48904 14.2152 9.2547 14.1038C7.49876 13.2554 5.74845 11.5182 4.89907 9.78099C4.7866 9.54836 4.73613 9.29061 4.75255 9.03274C4.76898 8.77486 4.85174 8.5256 4.99282 8.30912C5.00872 8.2837 5.02659 8.25956 5.04626 8.23693L7.00001 5.92037L5.03126 1.51412C5.03089 1.51038 5.03089 1.50661 5.03126 1.50287C4.12212 1.62146 3.28739 2.0674 2.68339 2.75716C2.0794 3.44693 1.74755 4.33322 1.75001 5.25005C1.75348 8.43159 3.01888 11.4818 5.26856 13.7315C7.51825 15.9812 10.5685 17.2466 13.75 17.2501C14.6663 17.2532 15.5523 16.9225 16.2425 16.3198C16.9327 15.7171 17.3797 14.8837 17.5 13.9754V13.9763Z"
                    fill="rgba(255, 111, 34, 1)"
                  />
                </svg>
                <span className="flex flex-col justify-center h-full text-black items-center">
                  {product.vendor.phoneNumber}
                </span>
              </span>

              <span className="text-sm gap-2 flex leading-[1.7rem]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="rgba(255, 111, 34, 1)"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 0a2 2 0 012-2h14a2 2 0 012 2m-18 0v8a2 2 0 002 2h14a2 2 0 002-2V8"
                  />
                </svg>
                <span className="flex flex-col justify-center h-full text-black items-center">
                  {product.vendor.email}
                </span>
              </span>
            </div>
          </div>
        </>
      ),
    });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  } else {
    if (Object.keys(product).length === 0) {
      return (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="empty-store">
            <div className="text-center">
              <img
                src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                alt="Empty Store Illustration"
                className="w-80 h-80 mx-auto"
              />
            </div>
            <h1 className="text-center text-lg font-bold mb-4">
              Product Not Found
            </h1>
          </div>
        </div>
      );
    }
  }

  const price = parseFloat(product?.price || "0");
  const discountPrice = parseFloat(product?.discount_price || "0");
  const currencySymbol = product?.store?.currency?.symbol || "₦";
  const hasValidDiscount = discountPrice > 0 && discountPrice < price;

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(Array.isArray(product.additional_images) ? product.additional_images : []),
  ].filter(Boolean);
  const productImages = allImages.length > 0
    ? [...new Set(allImages)]
    : ["https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"];

  return (
    <>
      <div className="w-full bg-[#f8f9fa] min-h-screen py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 overflow-x-auto py-1">
          <span
            onClick={() => navigate("/")}
            className="hover:text-[#FF6F22] cursor-pointer transition-colors"
          >
            Home
          </span>
          <span>/</span>
          {product.sub_category?.categoryId && (
            <>
              <span
                onClick={() => navigate(`/products/categories/${product.sub_category.categoryId}/${product.sub_category.name || 'Category'}`)}
                className="hover:text-[#FF6F22] cursor-pointer transition-colors whitespace-nowrap"
              >
                {product.sub_category?.name || "Category"}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-xs md:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Gallery & Detailed Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 md:p-6 shadow-xs flex flex-col gap-4">
              {/* Main Image Preview */}
              <div className="relative w-full h-[380px] md:h-[480px] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center group">
                <img
                  src={productImages[selectedImgIndex] || productImages[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                  {product.condition && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-xs uppercase tracking-wider">
                      {formatString(product.condition)}
                    </span>
                  )}
                  {hasValidDiscount && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white shadow-xs">
                      SALE
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex flex-wrap gap-2 pointer-events-none">
                  {product.vendor?.isVerified ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                      <Check size={13} className="stroke-[3]" /> Verified
                    </span>
                  ) : null}
                </div>

                {/* Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImgIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-white hover:text-black transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImgIndex((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-white hover:text-black transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Rail */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border-2 transition-all shrink-0 ${
                        selectedImgIndex === idx
                          ? "border-[#FF6F22] ring-2 ring-[#FF6F22]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabbed Product Details */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col gap-6">
              {/* Tab Header Bar */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "description"
                      ? "border-[#FF6F22] text-[#FF6F22]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Overview & Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("specifications")}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "specifications"
                      ? "border-[#FF6F22] text-[#FF6F22]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("safety")}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "safety"
                      ? "border-[#FF6F22] text-[#FF6F22]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Store & Safety
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "reviews"
                      ? "border-[#FF6F22] text-[#FF6F22]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Reviews ({product.reviews?.length || 0})
                </button>
              </div>

              {/* Tab 1: Description */}
              {activeTab === "description" && (
                <div className="flex flex-col gap-4 text-gray-700 leading-relaxed text-sm md:text-base">
                  {product.description ? (
                    <SafeHTML htmlContent={product.description} />
                  ) : (
                    <p className="text-gray-400 italic">No description provided for this product.</p>
                  )}
                </div>
              )}

              {/* Tab 2: Specifications */}
              {activeTab === "specifications" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.condition && (
                      <div className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Condition</span>
                        <span className="text-sm font-bold text-gray-900">{formatString(product.condition)}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">SKU / Item Code</span>
                        <span className="text-sm font-bold text-gray-900">{product.sku}</span>
                      </div>
                    )}
                    <div className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Quantity In Stock</span>
                      <span className="text-sm font-bold text-gray-900">{product.quantity ?? "Available"}</span>
                    </div>
                    {product.warranty && (
                      <div className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Warranty</span>
                        <span className="text-sm font-bold text-gray-900">{product.warranty}</span>
                      </div>
                    )}
                    {product.return_policy && (
                      <div className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Return Policy</span>
                        <span className="text-sm font-bold text-gray-900">{product.return_policy}</span>
                      </div>
                    )}
                  </div>
                  {product.specification && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Detailed Specifications</span>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <SafeHTML htmlContent={product.specification} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Store & Safety */}
              {activeTab === "safety" && (
                <div className="flex flex-col gap-6">
                  {product.store?.location && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Store size={18} className="text-[#FF6F22]" />
                        Store Location & Address
                      </div>
                      <p className="text-sm text-gray-600 pl-6">
                        {[
                          product.store.location.address,
                          product.store.location.city,
                          product.store.location.state,
                          product.store.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                      <ShieldCheck size={18} className="text-amber-600" />
                      Safety & Verification Tips
                    </div>
                    <ul className="text-sm text-amber-800 flex flex-col gap-2 pl-6 list-disc">
                      <li>Meet with the seller in a safe, public place during daylight hours.</li>
                      <li>Inspect the item thoroughly and ensure it matches your requirements before making payment.</li>
                      <li>Never send payments in advance to unverified private accounts outside the platform.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 4: Reviews */}
              {activeTab === "reviews" && (
                <div>
                  <ProductReview reviews={product.reviews || []} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Unified Buy Box & Seller Info */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
            
            {/* Unified Buy Box Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-7 shadow-xs flex flex-col gap-5">
              
              {/* Product Header */}
              <div className="flex flex-col gap-2">
                {product.sub_category?.name && (
                  <span className="text-xs font-bold text-[#FF6F22] uppercase tracking-wider">
                    {product.sub_category.name}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & Status Row */}
              <div className="flex items-baseline justify-between flex-wrap gap-3 pt-1">
                <div className="flex items-baseline gap-3">
                  {hasValidDiscount ? (
                    <>
                      <span className="text-3xl md:text-4xl font-black text-gray-900">
                        {currencySymbol} {formatNumberWithCommas(discountPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through font-semibold">
                        {currencySymbol} {formatNumberWithCommas(price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl md:text-4xl font-black text-gray-900">
                      {currencySymbol} {formatNumberWithCommas(price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {product.quantity > 0 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      In Stock ({product.quantity})
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Purchase Actions & Quantity */}
              {(product.vendor?.isVerified || product.admin) && !isNonCartCategory() ? (
                <div className="flex flex-col gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={handleDecrease}
                        disabled={quantity <= 0 || product.quantity === 0}
                        className="w-10 h-10 flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrease}
                        disabled={product.quantity === 0 || quantity >= product.quantity}
                        className="w-10 h-10 flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Main Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={disabled || product.quantity === 0}
                      onClick={() => handleAddToCart()}
                      icon={<ShoppingCart size={18} />}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      disabled={disabled || product.quantity === 0}
                      onClick={() => handleBuyNow()}
                      icon={<Zap size={18} />}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              ) : (
                /* Contact Seller for Unverified / Direct Contact Products */
                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => showContact()}
                    icon={<PhoneIcon size={18} />}
                  >
                    Contact Seller / Display Contact
                  </Button>
                </div>
              )}

              {/* Secondary Actions: Make an Offer & Save to Favorites */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {((product.vendor?.isVerified || product.admin) || isNonCartCategory()) && (
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      if (user) {
                        setShowOfferModal(true);
                      } else {
                        navigate("/login");
                      }
                    }}
                    icon={<Tag size={16} />}
                  >
                    {currentOffer
                      ? `Offer: ${currentOffer.status.toUpperCase()}`
                      : "Make an Offer"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled={bookmarked}
                  onClick={() => addToBookMark()}
                  icon={<Bookmark size={16} className={bookmarked ? "fill-current text-[#FF6F22]" : ""} />}
                >
                  {bookmarked ? "Saved in Favorites" : "Save to Favorites"}
                </Button>
              </div>

              {/* Trust Badges Bar */}
              <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>100% Protected Kudu Purchase Guarantee</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <Truck size={16} className="text-blue-600 shrink-0" />
                  <span>Direct Dispatch & Delivery Tracking</span>
                </div>
                {product.return_policy && (
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <RotateCcw size={16} className="text-[#FF6F22] shrink-0" />
                    <span>Return Policy: {product.return_policy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller / Store Profile Card */}
            {product.vendor && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Imgix
                      sizes="100vw"
                      src={product.store?.logo || "https://res.cloudinary.com/do2kojulq/image/upload/v1735426601/kudu_mart/profile_icon_yq3gnr.png"}
                      alt="avatar"
                      width={52}
                      height={52}
                      className="w-13 h-13 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/store/${product.vendor.id}/products`, {
                              state: {
                                vendor: product.vendor,
                                store: product.store,
                              },
                            })
                          }
                          className="font-bold text-gray-900 hover:text-[#FF6F22] transition-colors text-base text-left"
                        >
                          {product.store?.name || `${product.vendor.firstName} ${product.vendor.lastName}`}
                        </button>
                        {product.vendor.isVerified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {getDateDifference(product?.vendor?.createdAt)} on Kudu
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/store/${product.vendor.id}/products`, {
                        state: {
                          vendor: product.vendor,
                          store: product.store,
                        },
                      })
                    }
                    className="text-xs font-bold text-[#FF6F22] hover:underline"
                  >
                    View Store →
                  </button>
                </div>

                {user && product.vendor?.isVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={initiateChat}
                    icon={<MessageCircle size={16} />}
                  >
                    Start Chat with Seller
                  </Button>
                )}
              </div>
            )}

            {/* Social Share Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 size={15} />
                Share This Product
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {sharePlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Share on ${platform.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700"
                  >
                    {platform.icon}
                    <span>{platform.name}</span>
                  </a>
                ))}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 ml-auto"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* More from this Store Section */}
        {vendorProducts && vendorProducts.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">More from this Store</h2>
                <p className="text-xs text-gray-500 mt-1">Other products available from this merchant</p>
              </div>
              {product.vendor && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/store/${product.vendor.id}/products`, {
                      state: { vendor: product.vendor, store: product.store },
                    })
                  }
                  className="text-sm font-bold text-[#FF6F22] hover:underline"
                >
                  View All Products →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {vendorProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 8)
                .map((vp) => (
                  <div
                    key={vp.id}
                    onClick={() => {
                      navigate(`/product/${vp.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-white rounded-xl border border-gray-200/75 p-3 cursor-pointer hover:shadow-md hover:border-[#FF6F22]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-50 mb-3 flex items-center justify-center">
                        <img
                          src={vp.image_url || vp.image || vp.additional_images?.[0] || "https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"}
                          alt={vp.name || "Product"}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png";
                          }}
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#FF6F22] transition-colors">
                        {vp.name}
                      </p>
                    </div>
                    <p className="text-base font-black text-gray-900 mt-2">
                      {vp.store?.currency?.symbol || product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(parseFloat(vp.price || "0"))}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        {product.recommendedProducts && product.recommendedProducts.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Similar Products</h2>
                <p className="text-xs text-gray-500 mt-1">Recommended items based on your browsing</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {product.recommendedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 8)
                .map((rp) => (
                  <div
                    key={rp.id}
                    onClick={() => {
                      navigate(`/product/${rp.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-white rounded-xl border border-gray-200/75 p-3 cursor-pointer hover:shadow-md hover:border-[#FF6F22]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-50 mb-3 flex items-center justify-center">
                        <img
                          src={rp.image_url || rp.additional_images?.[0] || "https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"}
                          alt={rp.name || "Product"}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png";
                          }}
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#FF6F22] transition-colors">
                        {rp.name}
                      </p>
                    </div>
                    <p className="text-base font-black text-gray-900 mt-2">
                      {rp.store?.currency?.symbol || product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(parseFloat(rp.price || "0"))}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>

      {/* Make an Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-2">
              <h2 className="text-lg font-bold">Make an Offer</h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-4">
              {/* Product summary */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                {product.additional_images?.[0] && (
                  <img
                    src={product.additional_images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Listed at {product?.store?.currency?.symbol || "₦"}{" "}
                    {formatNumberWithCommas(parseFloat(product?.price))}
                  </p>
                </div>
              </div>

              {/* Offer form — no offer yet */}
              {!currentOffer && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      Your Offer Price
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-kudu-orange transition-colors">
                      <span className="px-3 py-2 bg-gray-50 text-sm font-medium border-r border-gray-300">
                        {product?.store?.currency?.symbol || "₦"}
                      </span>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="Enter your offer"
                        className="flex-1 px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      Message{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="e.g. Can you do this price?"
                      rows={3}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-kudu-orange resize-none transition-colors"
                    />
                  </div>
                  <button
                    data-theme="kudu"
                    className="btn btn-primary w-full"
                    onClick={submitOffer}
                    disabled={offerLoading || !offerPrice}
                  >
                    {offerLoading ? "Submitting..." : "Submit Offer"}
                  </button>
                </div>
              )}

              {/* Pending */}
              {currentOffer?.status === "pending" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Tag size={24} className="text-yellow-600" />
                  </div>
                  <p className="font-semibold text-lg">Offer Under Review</p>
                  <p className="text-sm text-gray-500">
                    Your offer of{" "}
                    <strong>
                      {product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(
                        parseFloat(currentOffer.offeredPrice),
                      )}
                    </strong>{" "}
                    is being reviewed by the seller.
                  </p>
                  <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-700">
                      You'll receive a notification once the seller responds.
                    </p>
                  </div>
                </div>
              )}

              {/* Accepted — initiate payment */}
              {currentOffer?.status === "accepted" && !pendingCheckout && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-lg">Offer Accepted!</p>
                  <p className="text-sm text-gray-500">
                    Your offer of{" "}
                    <strong>
                      {product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(
                        parseFloat(currentOffer.offeredPrice),
                      )}
                    </strong>{" "}
                    has been accepted. Proceed to payment to complete your
                    order.
                  </p>
                  <button
                    data-theme="kudu"
                    className="btn btn-primary w-full"
                    onClick={handleInitiatePayment}
                    disabled={offerLoading}
                  >
                    {offerLoading ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              )}

              {/* Accepted — checkout form (returning from Paystack) */}
              {currentOffer?.status === "accepted" && pendingCheckout && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <Check size={16} className="text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">
                      Payment received! Enter your shipping address to complete
                      the order.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">
                      Shipping Address
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. 12 Allen Avenue, Lagos"
                      rows={3}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-kudu-orange resize-none transition-colors"
                    />
                  </div>
                  <button
                    data-theme="kudu"
                    className="btn btn-primary w-full"
                    onClick={handleCheckout}
                    disabled={offerLoading || !shippingAddress.trim()}
                  >
                    {offerLoading ? "Placing Order..." : "Complete Order"}
                  </button>
                </div>
              )}

              {/* Countered */}
              {currentOffer?.status === "countered" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Tag size={24} className="text-blue-600" />
                    </div>
                    <p className="font-semibold text-lg">
                      Counter Offer Received
                    </p>
                    <p className="text-sm text-gray-500">
                      The seller has countered your offer of{" "}
                      <strong>
                        {product?.store?.currency?.symbol || "₦"}{" "}
                        {formatNumberWithCommas(
                          parseFloat(currentOffer.offeredPrice),
                        )}
                      </strong>
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">Counter Price</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(
                        parseFloat(currentOffer.counterPrice),
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    Do you accept this counter offer?
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-2 px-4 rounded-md border border-red-300 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                      onClick={() => respondToCounter("rejected")}
                      disabled={offerLoading}
                    >
                      {offerLoading ? "..." : "Decline"}
                    </button>
                    <button
                      data-theme="kudu"
                      className="flex-1 btn btn-primary"
                      onClick={() => respondToCounter("accepted")}
                      disabled={offerLoading}
                    >
                      {offerLoading ? "..." : "Accept"}
                    </button>
                  </div>
                </div>
              )}

              {/* Rejected */}
              {currentOffer?.status === "rejected" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={24} className="text-red-600" />
                  </div>
                  <p className="font-semibold text-lg">Offer Declined</p>
                  <p className="text-sm text-gray-500">
                    Unfortunately your offer of{" "}
                    <strong>
                      {product?.store?.currency?.symbol || "₦"}{" "}
                      {formatNumberWithCommas(
                        parseFloat(currentOffer.offeredPrice),
                      )}
                    </strong>{" "}
                    was not accepted.
                  </p>
                  <button
                    className="w-full py-2 px-4 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setShowOfferModal(false)}
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Completed */}
              {currentOffer?.status === "completed" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-lg">Order Placed!</p>
                  <p className="text-sm text-gray-500">
                    Your order has been placed successfully.
                  </p>
                  {currentOffer.trackingNumber && (
                    <div className="w-full p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">
                        Tracking Number
                      </p>
                      <p className="text-base font-bold text-green-700">
                        {currentOffer.trackingNumber}
                      </p>
                    </div>
                  )}
                  <button
                    className="w-full py-2 px-4 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setShowOfferModal(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
