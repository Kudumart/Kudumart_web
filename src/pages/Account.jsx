import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Box,
  CalendarClock,
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
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { accountApi } from "../api/account";
import { sellerApi, sellerList } from "../api/seller";
import { useResource } from "../hooks/useResource";
import { Button, EmptyState, Modal, Skeleton } from "../components/ui";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { isKycRecord, kycStatus } from "../utils/kyc";
import { parseLocation, hasDeliveryAddress } from "../utils/checkout";
import { money } from "../utils/format";
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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const walletResource = useResource((signal) => accountApi.wallet(signal), [user?.id]);
  const walletData = walletResource.data?.data || walletResource.data;
  const balance = Number(walletData?.balance ?? user?.wallet ?? 0);
  const transactions = walletData?.transactions || [];

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
        <div
          className="account-card account-card--link"
          style={{ cursor: "pointer" }}
          onClick={() => setWalletModalOpen(true)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <Wallet size={28} color="#059669" />
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "12px", background: "#ecfdf5", color: "#059669" }}>
              Available
            </span>
          </div>
          <h3 style={{ marginTop: "10px", marginBottom: "2px" }}>KuduMart Wallet</h3>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "2px 0 6px 0" }}>
            {money(balance)}
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Refunds & store credits. Tap to view transaction history.
          </p>
          <ArrowRight size={20} />
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
              to="/account/installments"
              className="account-card account-card--link"
            >
              <CalendarClock size={28} />
              <h3>Installments & Layaway</h3>
              <p>Track your layaway reservations and pay upcoming milestones.</p>
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

      {walletModalOpen && (
        <Modal
          title="KuduMart Wallet & Credits"
          icon={<Wallet size={20} color="#059669" />}
          onClose={() => setWalletModalOpen(false)}
          footer={<Button variant="ghost" onClick={() => setWalletModalOpen(false)}>Close</Button>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)", borderRadius: "12px", padding: "22px", color: "#ffffff", boxShadow: "0 4px 14px rgba(4, 120, 87, 0.2)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.9 }}>
                Available Balance
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, margin: "6px 0" }}>
                {money(balance)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                Funds are immediately usable on KuduMart purchases and installment milestone settlements.
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Recent Wallet Activity
              </h4>
              {walletResource.loading ? (
                <Skeleton style={{ height: "120px", borderRadius: "8px" }} />
              ) : transactions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "13px", color: "#0f172a", textTransform: "capitalize" }}>
                          {tx.transactionType?.replaceAll("_", " ") || "Credit"}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                          {new Date(tx.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "14px", color: "#059669" }}>
                          +{money(tx.amount)}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#16a34a", textTransform: "uppercase", fontWeight: 600 }}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No wallet transactions yet"
                  description="When a layaway plan is cancelled or store credit is issued, your refunds will appear here."
                />
              )}
            </div>
          </div>
        </Modal>
      )}

      <Button variant="outline" icon={LogOut} onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
