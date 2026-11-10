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
  Building2,
  CheckCircle2,
  ArrowDownToLine,
  ChevronDown,
  Search,
  Check,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
function SearchableBankSelect({
  banks = [],
  value,
  onChange,
  placeholder = "Choose your Nigerian bank…",
  loading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedBank = banks.find((b) => String(b.code) === String(value));

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const filteredBanks = search.trim()
    ? banks.filter(
        (b) =>
          b.name?.toLowerCase().includes(search.toLowerCase()) ||
          String(b.code).includes(search.trim()),
      )
    : banks;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: "8px",
          border: isOpen ? "1.5px solid var(--orange)" : "1px solid #cbd5e1",
          background: "#fff",
          fontSize: "13px",
          color: selectedBank ? "#0f172a" : "#64748b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: loading ? "not-allowed" : "pointer",
          outline: "none",
          transition: "border-color 0.15s ease",
          boxSizing: "border-box",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            marginRight: "8px",
          }}
        >
          {loading
            ? "Loading banks list…"
            : selectedBank
              ? selectedBank.name
              : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: "#64748b",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search box inside dropdown */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search Nigerian bank…"
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "12px",
                color: "#0f172a",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List of options */}
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filteredBanks.length === 0 ? (
              <div
                style={{
                  padding: "14px 12px",
                  fontSize: "12px",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                No banks found matching "{search}"
              </div>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = String(bank.code) === String(value);
                return (
                  <button
                    key={`${bank.code}-${bank.name}`}
                    type="button"
                    onClick={() => {
                      onChange(bank.code);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "13px",
                      background: isSelected ? "#fff7ed" : "transparent",
                      color: isSelected ? "var(--orange-dark)" : "#1e293b",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                      borderBottom: "1px solid #f8fafc",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                      {bank.name}
                    </span>
                    {isSelected && <Check size={16} color="var(--orange)" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const { user, signOut, notify } = useApp();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletRevision, setWalletRevision] = useState(0);
  const walletResource = useResource((signal) => accountApi.wallet(signal), [user?.id, walletRevision]);
  const walletData = walletResource.data?.data || walletResource.data;
  const balance = Number(walletData?.balance ?? user?.wallet ?? 0);
  const transactions = walletData?.transactions || [];

  // Withdrawal form states
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [banksList, setBanksList] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");

  useEffect(() => {
    if (showWithdraw && banksList.length === 0) {
      setLoadingBanks(true);
      accountApi
        .banks()
        .then((res) => {
          const list = res?.data || res || [];
          setBanksList(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          setWithdrawalError(err?.message || "Failed to load bank list.");
        })
        .finally(() => setLoadingBanks(false));
    }
  }, [showWithdraw, banksList.length]);

  useEffect(() => {
    if (selectedBankCode && accountNumber.trim().length === 10) {
      setResolvingAccount(true);
      setWithdrawalError("");
      accountApi
        .resolveBank(accountNumber.trim(), selectedBankCode)
        .then((res) => {
          const info = res?.data || res;
          setAccountName(info?.accountName || "");
        })
        .catch((err) => {
          setAccountName("");
          setWithdrawalError(err?.message || "Could not resolve bank account details.");
        })
        .finally(() => setResolvingAccount(false));
    } else {
      setAccountName("");
    }
  }, [selectedBankCode, accountNumber]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalError("");
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawalError("Please enter a valid withdrawal amount.");
      return;
    }
    if (amt > balance) {
      setWithdrawalError(`Requested amount (${money(amt)}) exceeds your available balance (${money(balance)}).`);
      return;
    }
    const chosenBank = banksList.find((b) => String(b.code) === String(selectedBankCode));
    if (!chosenBank || !accountName) {
      setWithdrawalError("Please verify your bank and account details before submitting.");
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      await accountApi.withdrawWallet({
        amount: amt,
        accountNumber: accountNumber.trim(),
        bankCode: selectedBankCode,
        bankName: chosenBank.name,
        accountName,
      });
      notify(`Withdrawal request of ${money(amt)} submitted for review!`, "success");
      setWithdrawAmount("");
      setAccountNumber("");
      setAccountName("");
      setSelectedBankCode("");
      setShowWithdraw(false);
      setWalletRevision((r) => r + 1);
    } catch (err) {
      setWithdrawalError(err?.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

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
        {vendor ? (
          <>
            <Link to="/seller" className="account-card account-card--link">
              <Store size={28} />
              <h3>Seller workspace</h3>
              <p>Manage stores, listings, orders, offers, and earnings.</p>
              <ArrowRight size={20} />
            </Link>
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
            <button
              type="button"
              className="account-card account-card--link"
              style={{
                textAlign: "left",
                width: "100%",
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: "13px",
                padding: "27px",
                minHeight: "230px",
                font: "inherit",
                cursor: "pointer",
                color: "inherit",
              }}
              onClick={() => setWalletModalOpen(true)}
            >
              <Wallet size={28} />
              <h3>KuduMart Wallet</h3>
              <p>Balance: {money(balance)}. Track refunds and credits.</p>
              <ArrowRight size={20} />
            </button>
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
          icon={<Wallet size={20} />}
          onClose={() => {
            setWalletModalOpen(false);
            setShowWithdraw(false);
            setWithdrawalError("");
          }}
          footer={
            <Button
              variant="ghost"
              onClick={() => {
                setWalletModalOpen(false);
                setShowWithdraw(false);
                setWithdrawalError("");
              }}
            >
              Close
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ flex: "1 1 240px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
                    Current Wallet Balance
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, margin: "4px 0", color: "#0f172a" }}>
                    {money(balance)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>
                    Usable directly during checkout or withdrawable to your Nigerian bank account.
                  </div>
                </div>

                {balance > 0 && (
                  <div style={{ marginLeft: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant={showWithdraw ? "outline" : "primary"}
                      size="small"
                      icon={showWithdraw ? Wallet : ArrowDownToLine}
                      onClick={() => {
                        setShowWithdraw(!showWithdraw);
                        setWithdrawalError("");
                      }}
                    >
                      {showWithdraw ? "Cancel" : "Withdraw to Bank"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {showWithdraw && (
              <form
                onSubmit={handleWithdrawSubmit}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px",
                  border: "1.5px solid #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <Building2 size={18} color="#0f172a" />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Withdraw Funds to Bank</strong>
                </div>

                {withdrawalError && (
                  <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 12px", borderRadius: "6px", fontSize: "12px", border: "1px solid #fecaca" }}>
                    {withdrawalError}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Select Destination Bank
                  </label>
                  <SearchableBankSelect
                    banks={banksList}
                    value={selectedBankCode}
                    onChange={(code) => setSelectedBankCode(code)}
                    placeholder="Choose your Nigerian bank…"
                    loading={loadingBanks}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Account Number (10 digits)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g. 0123456789"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                  {resolvingAccount && (
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                      Verifying account details with Paystack…
                    </div>
                  )}
                  {accountName && !resolvingAccount && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", color: "#16a34a", fontSize: "12px", fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>Verified: {accountName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                      Withdrawal Amount (₦)
                    </label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(balance))}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Withdraw All ({money(balance)})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    max={balance}
                    step="any"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 2)"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  loading={submittingWithdrawal}
                  disabled={!accountName || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}
                  icon={ArrowDownToLine}
                >
                  Confirm Withdrawal {withdrawAmount ? `(${money(Number(withdrawAmount))})` : ""}
                </Button>
              </form>
            )}

            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Recent Wallet Activity
              </h4>
              {walletResource.loading ? (
                <Skeleton style={{ height: "120px", borderRadius: "8px" }} />
              ) : transactions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {transactions.map((tx) => {
                    const isDebit = tx.transactionType === "withdrawal" || String(tx.transactionType).startsWith("purchase_wallet");
                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 14px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "13px", color: "#0f172a", textTransform: "capitalize" }}>
                            {tx.transactionType?.replaceAll("_", " ") || "Transaction"}
                          </strong>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            {new Date(tx.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <strong style={{ fontSize: "14px", color: isDebit ? "#b91c1c" : "#15803d" }}>
                            {isDebit ? "-" : "+"}{money(tx.amount)}
                          </strong>
                          <div
                            style={{
                              fontSize: "10px",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              color: tx.status === "completed" ? "#16a34a" : tx.status === "pending" ? "#d97706" : "#dc2626",
                            }}
                          >
                            {tx.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No wallet transactions yet"
                  description="When a layaway plan is cancelled or store credit is issued, your refunds and withdrawal history will appear here."
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
