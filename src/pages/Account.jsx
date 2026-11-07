import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Box,
  CalendarDays,
  Gavel,
  Landmark,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  UserRound,
  MapPinned,
} from "lucide-react";
import { sellerApi, sellerList } from "../api/seller";
import { useResource } from "../hooks/useResource";
import { Skeleton } from "../components/ui";
import { Link, Navigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useApp } from "../contexts/AppContext";
import { isKycRecord, kycStatus } from "../utils/kyc";
import { parseLocation, hasDeliveryAddress } from "../utils/checkout";
import DeliveryZoneNotice from "./seller/DeliveryZoneNotice";
function VendorOnboarding({ user }) {
  const progress = useResource(
    async (signal) => {
      const [kyc, stores, products, auctions, banks] = await Promise.allSettled(
        [
          sellerApi.kyc(signal),
          sellerApi.stores(signal),
          sellerApi.products(signal),
          sellerApi.auctionProducts(signal),
          sellerApi.banks(signal),
        ],
      );
      return {
        kyc: kyc.status === "fulfilled" ? kyc.value : null,
        kycError: kyc.status === "rejected" && kyc.reason?.status !== 404,
        stores: stores.status === "fulfilled" ? sellerList(stores.value) : null,
        products:
          products.status === "fulfilled" && auctions.status === "fulfilled"
            ? [...sellerList(products.value), ...sellerList(auctions.value)]
            : null,
        banks: banks.status === "fulfilled" ? sellerList(banks.value) : null,
      };
    },
    [user.id],
  );
  if (progress.loading)
    return <Skeleton className="vendor-onboarding-skeleton" />;
  const data = progress.data || {};
  const verificationStatus = kycStatus(data.kyc);
  const approved = Boolean(
    user.isVerified || verificationStatus === "approved",
  );
  const submitted = isKycRecord(data.kyc);
  const changesRequested = verificationStatus === "changes_requested";
  const hasStore = Boolean(data.stores?.length);
  const hasProduct = Boolean(data.products?.length);
  const hasBank = Boolean(data.banks?.length);
  if (approved && hasStore && hasProduct && hasBank) return null;
  const steps = [
    {
      title: "Verify your business",
      description: changesRequested
        ? "Correct the details highlighted by the review team."
        : approved
          ? "Your seller identity has been approved."
          : submitted
            ? "Your details are being reviewed."
            : data.kycError
              ? "Check your verification status."
              : "Submit your business and identity details.",
      state: approved
        ? "Done"
        : changesRequested
          ? "Changes requested"
          : submitted
            ? "Under review"
            : "To do",
      icon: ShieldCheck,
      to: "/seller/verification",
      action: approved
        ? "View"
        : changesRequested
          ? "Review changes"
          : submitted
            ? "Check status"
            : "Start verification",
    },
    {
      title: "Create a store",
      description: "Set up your storefront, hours, and delivery options.",
      state:
        data.stores === null ? "Check status" : hasStore ? "Done" : "To do",
      icon: Store,
      to: hasStore ? "/seller/stores" : "/seller/stores/new",
      action: hasStore ? "View stores" : "Create store",
    },
    {
      title: "List a product",
      description: "Add your first item for buyers to discover.",
      state:
        data.products === null ? "Check status" : hasProduct ? "Done" : "To do",
      icon: Box,
      to: hasProduct ? "/seller/products" : "/seller/products/new",
      action: hasProduct ? "View products" : "Add product",
    },
    {
      title: "Link payout account",
      description: approved
        ? "Add the bank account used for withdrawals."
        : "Available after your verification is approved.",
      state:
        data.banks === null
          ? "Check status"
          : hasBank
            ? "Done"
            : approved
              ? "To do"
              : "Locked",
      icon: Landmark,
      to: approved ? "/seller/finance" : "/seller/verification",
      action: hasBank
        ? "View account"
        : approved
          ? "Add account"
          : "Complete verification",
    },
  ];
  return (
    <section
      className="vendor-onboarding"
      aria-labelledby="vendor-onboarding-title"
    >
      <div className="vendor-onboarding__intro">
        <span className="eyebrow">GET READY TO SELL</span>
        <h2 id="vendor-onboarding-title">Set up your seller account</h2>
        <p>
          Pick up where you left off. Verification can be completed while you
          prepare your store.
        </p>
      </div>
      <div className="vendor-onboarding__steps">
        {steps.map(({ title, description, state, icon: Icon, to, action }) => (
          <article key={title} className="vendor-onboarding__step">
            <div className="vendor-onboarding__step-top">
              <span className="vendor-onboarding__icon">
                <Icon size={20} />
              </span>
              <span
                className={`vendor-onboarding__state ${state === "Done" ? "vendor-onboarding__state--done" : ""}`}
              >
                {state === "Done" && <BadgeCheck size={14} />} {state}
              </span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <Link to={to}>
              {action} <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
export default function Account() {
  const { user, signOut } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  const vendor = user.accountType?.toLowerCase() === "vendor";
  const location = parseLocation(user?.location);
  const hasAddress = hasDeliveryAddress(location);
  return (
    <div className="container account-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR SPACE</span>
        <h1>Welcome, {user.firstName || "friend"}.</h1>
        <p>Make your next move from here.</p>
      </div>
      {vendor && <DeliveryZoneNotice />}
      {!vendor && !hasAddress && (
        <div className="seller-purchase-notice" role="status">
          <MapPinned size={20} />
          <div>
            <strong>Add your delivery address</strong>
            <p>Save your delivery street, city and state to calculate shipping automatically when you shop.</p>
          </div>
          <Link className="button button--primary button--sm" to="/account/settings">Add address</Link>
        </div>
      )}
      {vendor && <VendorOnboarding user={user} />}
      <div className="account-grid">
        <div className="account-card account-card--welcome">
          <div className="account-avatar">
            <UserRound size={31} />
          </div>
          <h2>
            {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.email}
          </h2>
          <p>{user.email}</p>
          <span className="account-role">
            {user.accountType || "Customer"} account
          </span>
        </div>
        <Link
          to="/account/settings"
          className="account-card account-card--link"
        >
          <Settings size={28} />
          <h3>Profile & security</h3>
          <p>
            Update your personal details, contact information, password and
            address.
          </p>
          <ArrowRight size={20} />
        </Link>
        {vendor ? (
          <>
            <Link to="/seller" className="account-card account-card--link">
              <Store size={28} />
              <h3>Seller workspace</h3>
              <p>Manage stores, listings, orders, offers, and earnings.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/notifications"
              className="account-card account-card--link"
            >
              <Bell size={28} />
              <h3>Notifications</h3>
              <p>
                See updates about orders, offers, reviews, and your account.
              </p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/messages"
              className="account-card account-card--link"
            >
              <MessageCircle size={28} />
              <h3>Messages</h3>
              <p>Talk with customers about your listings.</p>
              <ArrowRight size={20} />
            </Link>
          </>
        ) : (
          <>
            <Link to="/catalog" className="account-card account-card--link">
              <ShoppingBag size={28} />
              <h3>Keep exploring</h3>
              <p>Find your next favorite thing in the marketplace.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/orders"
              className="account-card account-card--link"
            >
              <Package size={28} />
              <h3>Your orders</h3>
              <p>Track every order in one place.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/offers"
              className="account-card account-card--link"
            >
              <Tag size={28} />
              <h3>Your offers</h3>
              <p>Follow seller responses and pay an agreed price.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/notifications"
              className="account-card account-card--link"
            >
              <Bell size={28} />
              <h3>Notifications</h3>
              <p>See updates about orders, offers, and your account.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/messages"
              className="account-card account-card--link"
            >
              <MessageCircle size={28} />
              <h3>Messages</h3>
              <p>Talk with sellers about products you are considering.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/services"
              className="account-card account-card--link"
            >
              <CalendarDays size={28} />
              <h3>Service bookings</h3>
              <p>Manage appointments and review completed services.</p>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/account/auctions"
              className="account-card account-card--link"
            >
              <Gavel size={28} />
              <h3>Your auctions</h3>
              <p>Return to auctions you joined and continue bidding.</p>
              <ArrowRight size={20} />
            </Link>
            <Link to="/cart" className="account-card account-card--link">
              <Package size={28} />
              <h3>Your cart</h3>
              <p>Pick up where you left off.</p>
              <ArrowRight size={20} />
            </Link>
          </>
        )}
      </div>
      <Button variant="outline" icon={LogOut} onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
