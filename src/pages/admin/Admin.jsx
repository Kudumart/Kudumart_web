import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  CalendarClock,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Gavel,
  ImagePlus,
  KeyRound,
  Landmark,
  LogOut,
  Megaphone,
  Menu,
  Package,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Store,
  Tag,
  Tags,
  Trash2,
  User,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { adminAccess, adminApi, adminSession } from "../../api/admin";
import { uploadImage } from "../../api/upload";
import {
  Button,
  ConfirmModal,
  EmptyState,
  Modal,
  Skeleton,
  TextField,
} from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useResource } from "../../hooks/useResource";
import { useApp } from "../../contexts/AppContext";
import AdminPlanForm from "./AdminPlanForm";
import "./AdminNavigation.css";

const navigationSections = [
  { id: "people", label: "People & trust", links: [
    { to: "/admin/vendors", label: "Vendors", icon: Store },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/verification", label: "Verification", icon: ClipboardCheck },
  ] },
  { id: "marketplace", label: "Marketplace", links: [
    { to: "/admin/products", label: "Products", icon: Box },
    { to: "/admin/categories", label: "Categories", icon: ClipboardCheck },
    { to: "/admin/stores", label: "Stores", icon: Store },
    { to: "/admin/auctions", label: "Auctions", icon: Gavel },
    { to: "/admin/adverts", label: "Adverts", icon: Megaphone },
    { to: "/admin/services", label: "Services", icon: Wrench },
    { to: "/admin/service-taxonomy", label: "Service taxonomy", icon: Tags },
    { to: "/admin/dropshipping", label: "Dropshipping", icon: PackageSearch },
  ] },
  { id: "commerce", label: "Commerce", links: [
    { to: "/admin/orders", label: "Orders", icon: Package },
    { to: "/admin/installments", label: "Installments & Layaway", icon: CalendarClock },
    { to: "/admin/offers", label: "Offers", icon: Tag },
    { to: "/admin/transactions", label: "Transactions", icon: ArrowUpRight },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  ] },
  { id: "operations", label: "Operations", links: [
    { to: "/admin/reports", label: "Reports", icon: ReceiptText },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/content", label: "Content", icon: FileText },
  ] },
  { id: "settings", label: "Configuration", links: [
    { to: "/admin/settings", label: "Profile & Enquiry", icon: User },
    { to: "/admin/configuration", label: "Charges & attributes", icon: SlidersHorizontal },
    { to: "/admin/payment-gateways", label: "Payment gateways", icon: CreditCard },
    { to: "/admin/access", label: "Team & permissions", icon: KeyRound },
  ] },
];
// Permissions (as granted to sub-admin roles) required for each admin area.
// Areas without an entry are open to every signed-in administrator.
const routePermissions = {
  "/admin/customers": ["view-customers"],
  "/admin/vendors": ["view-vendors"],
  "/admin/verification": ["view-vendors"],
  "/admin/products": ["manage-products"],
  "/admin/categories": ["manage-products"],
  "/admin/auctions": ["manage-products"],
  "/admin/dropshipping": ["manage-products"],
  "/admin/stores": ["view-stores"],
  "/admin/services": ["view-services"],
  "/admin/service-taxonomy": ["view-services"],
  "/admin/adverts": ["view-adverts"],
  "/admin/orders": ["view-orders"],
  "/admin/offers": ["view-orders"],
  "/admin/transactions": ["view-transactions"],
  "/admin/withdrawals": ["view-withdrawals"],
  "/admin/content": ["view-pages", "view-jobs"],
  "/admin/access": ["view-subadmin", "view-role", "view-permission"],
};
const requiredFor = (pathname) => {
  const match = Object.keys(routePermissions)
    .filter((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? routePermissions[match] : null;
};
const linkAllowed = (link) => adminAccess.can(routePermissions[link.to]);
const linkMatches = (link, pathname) => link.end ? pathname === link.to : pathname.startsWith(link.to);
const rowsFrom = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
const totalFrom = (payload, name) =>
  payload?.meta?.[name] ??
  payload?.pagination?.total ??
  rowsFrom(payload).length;

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (adminSession.get()) return <Navigate to="/admin" replace />;
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminApi.login({ email, password });
      navigate("/admin", { replace: true });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="admin-login">
      <div className="admin-login__visual">
        <Link to="/">
          <img src="/kudumart-logo.png" alt="KuduMart" />
        </Link>
        <div>
          <span className="eyebrow">KUDUMART OPERATIONS</span>
          <h1>One clear view of your marketplace.</h1>
          <p>
            Manage the people, products, and orders behind every great find.
          </p>
        </div>
      </div>
      <div className="admin-login__form">
        <div className="admin-login__card">
          <span className="eyebrow">ADMIN ACCESS</span>
          <h2>Welcome back.</h2>
          <p>Sign in to continue to your workspace.</p>
          <form onSubmit={submit}>
            <TextField
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" loading={busy}>
              Sign in to dashboard
            </Button>
          </form>
          <Link className="back-link" to="/">
            ← Back to marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("kuduAdminSidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("kuduAdminSidebarCollapsed", String(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  };

  const [openSections, setOpenSections] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("kuduAdminNavSections") || "{}");
      if (Object.keys(saved).length) return saved;
    } catch {
      // Fall through to the active section.
    }
    const active = navigationSections.find((section) =>
      section.links.some((link) => linkMatches(link, location.pathname)),
    );
    return { [active?.id || "people"]: true };
  });
  useEffect(() => {
    const active = navigationSections.find((section) =>
      section.links.some((link) => linkMatches(link, location.pathname)),
    );
    if (active) setOpenSections((current) => current[active.id] ? current : { ...current, [active.id]: true });
  }, [location.pathname]);
  useEffect(() => {
    try {
      localStorage.setItem("kuduAdminNavSections", JSON.stringify(openSections));
    } catch {
      // Navigation remains usable when storage is unavailable.
    }
  }, [openSections]);
  if (!adminSession.get()) return <Navigate to="/auth/admin/login" replace />;
  const required = requiredFor(location.pathname);
  const blocked = required && !adminAccess.can(required);
  return (
    <div className={`admin-shell ${collapsed ? "admin-shell--collapsed" : ""}`}>
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <button
          className="admin-sidebar__collapse"
          type="button"
          aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <div className="admin-sidebar__brand">
          <Link to="/admin" title="KuduMart">
            <img src="/kudumart-logo.png" alt="KuduMart" />
          </Link>
          <button aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Admin workspace" className="admin-navigation">
          <NavLink
            to="/admin"
            end
            aria-label="Overview"
            title="Overview"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `admin-nav admin-nav--overview ${isActive ? "active" : ""}`}
          >
            <BarChart3 size={19} /> <span>Overview</span>
          </NavLink>
          {navigationSections.map((full) => ({ ...full, links: full.links.filter(linkAllowed) })).filter((section) => section.links.length).map((section) => {
            const sectionOpen = Boolean(openSections[section.id]);
            const active = section.links.some((link) => linkMatches(link, location.pathname));
            return <section className={`admin-nav-section ${active ? "admin-nav-section--active" : ""}`} key={section.id}>
              <button type="button" className="admin-nav-section__toggle" aria-expanded={sectionOpen} onClick={() => setOpenSections((current) => ({ ...current, [section.id]: !sectionOpen }))}>
                <span>{section.label}</span><ChevronDown size={15} />
              </button>
              <div className="admin-nav-section__links" hidden={!sectionOpen && !collapsed}>
                {section.links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} aria-label={label} title={label} onClick={() => setOpen(false)} className={({ isActive }) => `admin-nav ${isActive ? "active" : ""}`}>
                  <Icon size={19} /><span>{label}</span>
                </NavLink>)}
              </div>
            </section>;
          })}
        </nav>
        <div className="admin-sidebar__bottom">
          <button
            onClick={() => {
              adminSession.clear();
              navigate("/auth/admin/login", { replace: true });
            }}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} /> <span>Sign out</span>
          </button>
          <div className="admin-topbar__actions">
            <Link aria-label="Admin notifications" title="Notifications" to="/admin/notifications">
              <Bell size={18} />
            </Link>
            <Link to="/" title="View marketplace"><span>View marketplace ↗</span></Link>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <strong>Admin Workspace</strong>
          <Link to="/">View marketplace ↗</Link>
        </header>
        <main className="admin-content">
          {blocked ? (
            <EmptyState
              title="You don’t have access to this area"
              description="Ask a super administrator to grant your role the permission it needs."
              action={<Link to="/admin"><Button variant="outline">Back to overview</Button></Link>}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      {open && (
        <button
          className="admin-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function AdminTable({ rows, kind, compact = false }) {
  if (!rows.length)
    return (
      <EmptyState
        title={`No ${kind} to show`}
        description="New entries will appear here as they arrive."
      />
    );
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>
              {kind === "products"
                ? "Product"
                : kind === "orders"
                  ? "Order"
                  : "Name"}
            </th>
            <th>
              {kind === "products"
                ? "Store"
                : kind === "orders"
                  ? "Customer"
                  : "Email"}
            </th>
            <th>Status</th>
            {!compact && <th>Created</th>}
            {kind === "vendors" && !compact && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={item.id || index}>
              <td>
                <strong>
                  {item.name ||
                    [item.firstName, item.lastName].filter(Boolean).join(" ") ||
                    item.refId ||
                    item.title ||
                    "Untitled"}
                </strong>
              </td>
              <td>
                {item.email || item.store?.name || item.user?.email || "—"}
              </td>
              <td>
                <span
                  className={`admin-status ${String(item.status || "").toLowerCase() === "active" || item.isVerified ? "admin-status--good" : ""}`}
                >
                  {item.status || (item.isVerified ? "Verified" : "Unverified")}
                </span>
              </td>
              {!compact && (
                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              )}
              {kind === "vendors" && !compact && (
                <td>
                  <Link
                    className="admin-row-action"
                    to={`/admin/vendors/${item.id}`}
                  >
                    Manage →
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminOverview() {
  const customers = useResource((signal) => adminApi.customers(1, signal), []);
  const vendors = useResource((signal) => adminApi.vendors(1, signal), []);
  const products = useResource((signal) => adminApi.products(1, signal), []);
  const orders = useResource((signal) => adminApi.orders(1, signal), []);
  const cards = [
    {
      label: "Customers",
      value: totalFrom(customers.data, "totalCustomers"),
      to: "/admin/customers",
      state: customers,
      icon: Users,
    },
    {
      label: "Vendors",
      value: totalFrom(vendors.data, "totalVendors"),
      to: "/admin/vendors",
      state: vendors,
      icon: Store,
    },
    {
      label: "Products",
      value: totalFrom(products.data),
      to: "/admin/products",
      state: products,
      icon: Box,
    },
    {
      label: "Orders",
      value: totalFrom(orders.data),
      to: "/admin/orders",
      state: orders,
      icon: Package,
    },
  ];
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">MARKETPLACE PULSE</span>
          <h1>Good to see you.</h1>
          <p>Here’s what is happening across KuduMart.</p>
        </div>
        <span className="admin-live">
          <span /> Live data
        </span>
      </div>
      <div className="admin-stats">
        {cards.map(({ label, value, to, state, icon: Icon }) => (
          <Link className="admin-stat" to={to} key={label}>
            <span className="admin-stat__icon">
              <Icon size={22} />
            </span>
            <span>{label}</span>
            <strong>
              {state.loading
                ? "—"
                : state.error
                  ? "Unavailable"
                  : Number(value).toLocaleString()}
            </strong>
            <small>View {label.toLowerCase()} ↗</small>
          </Link>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-card">
          <div className="admin-card__head">
            <div>
              <span className="eyebrow">PEOPLE</span>
              <h2>Recent vendors</h2>
            </div>
            <Link to="/admin/vendors">View all ↗</Link>
          </div>
          {vendors.loading ? (
            <Skeleton className="admin-table-skeleton" />
          ) : vendors.error ? (
            <p className="admin-error">
              Vendors could not be loaded. {vendors.error.message}
            </p>
          ) : (
            <AdminTable
              rows={[...rowsFrom(vendors.data)]
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt || b.createdAt || 0) -
                    new Date(a.updatedAt || a.createdAt || 0),
                )
                .slice(0, 5)}
              kind="vendors"
              compact
            />
          )}
        </section>
        <section className="admin-card admin-quick">
          <span className="eyebrow">NEXT UP</span>
          <h2>Keep the marketplace moving.</h2>
          <p>
            Review seller verification, products, and incoming orders from one
            workspace.
          </p>
          <Link to="/admin/verification">Review verification ↗</Link>
          <Link to="/admin/orders">See orders ↗</Link>
        </section>
      </div>
    </>
  );
}

export function AdminList({ kind }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const source = {
    vendors: adminApi.vendors,
    customers: adminApi.customers,
    products: adminApi.products,
    orders: adminApi.orders,
  }[kind];
  const resource = useResource((signal) => source(page, signal), [kind, page]);
  const rows = rowsFrom(resource.data);
  const filtered = rows.filter((item) =>
    JSON.stringify([
      item.name,
      item.firstName,
      item.lastName,
      item.email,
      item.refId,
      item.title,
      item.status,
    ])
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const total = totalFrom(
    resource.data,
    kind === "vendors"
      ? "totalVendors"
      : kind === "customers"
        ? "totalCustomers"
        : undefined,
  );
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">MANAGE {kind.toUpperCase()}</span>
          <h1>{kind[0].toUpperCase() + kind.slice(1)}</h1>
          <p>
            {resource.error
              ? "The list could not be loaded."
              : `${Number(total).toLocaleString()} total`}
          </p>
        </div>
      </div>
      <section className="admin-card">
        <div className="admin-list-toolbar">
          <input
            aria-label={`Search ${kind} on this page`}
            placeholder={`Search ${kind} on this page`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span>Page {page}</span>
        </div>
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error" role="alert">
            {resource.error.message}
          </div>
        ) : (
          <AdminTable rows={filtered} kind={kind} />
        )}
        <div className="admin-pagination">
          <Button
            variant="outline"
            disabled={page === 1 || resource.loading}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={
              resource.loading ||
              !rows.length ||
              (resource.data?.pagination?.pages
                ? page >= resource.data.pagination.pages
                : false)
            }
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </>
  );
}

export function AdminVendorDetail() {
  const { vendorId } = useParams();
  const [refresh, setRefresh] = useState(0);
  const vendorResource = useResource(
    (signal) => adminApi.vendor(vendorId, signal),
    [vendorId, refresh],
  );
  const plansResource = useResource(
    (signal) => adminApi.subscriptionPlans(signal),
    [],
  );
  const offersResource = useResource(
    (signal) => adminApi.vendorOffers(vendorId, signal),
    [vendorId, refresh],
  );
  const [form, setForm] = useState({
    subscriptionPlanId: "",
    specialPrice: "0",
    reason: "",
    expiresAt: "",
  });
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState(null);
  const vendor = vendorResource.data?.data;
  const plans = rowsFrom(plansResource.data);
  const offers = offersResource.data?.data?.offers || [];
  const activeSubscription = [...(vendor?.subscriptions || [])]
    .sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) ||
        new Date(b.createdAt) - new Date(a.createdAt),
    )
    .find((item) => item.isActive);
  const run = async (key, action) => {
    setBusy(key);
    setFeedback(null);
    try {
      const response = await action();
      setFeedback({ message: response.message });
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy("");
    }
  };
  const submitOffer = (event) => {
    event.preventDefault();
    run("offer", () => adminApi.saveVendorOffer(vendorId, form));
  };
  if (vendorResource.loading)
    return <Skeleton className="admin-vendor-loading" />;
  if (vendorResource.error || !vendor)
    return (
      <>
        <Link className="admin-review-back" to="/admin/vendors">
          <ArrowLeft size={18} /> Back to vendors
        </Link>
        <div className="admin-error">
          {vendorResource.error?.message || "Vendor could not be found."}
        </div>
      </>
    );
  const fullName =
    [vendor.firstName, vendor.lastName].filter(Boolean).join(" ") ||
    "Unnamed vendor";
  const reviewStatus =
    vendor.kyc?.reviewStatus ||
    (vendor.kyc?.isVerified ? "approved" : "pending");
  return (
    <>
      <Link className="admin-review-back" to="/admin/vendors">
        <ArrowLeft size={18} /> Back to vendors
      </Link>
      <div className="admin-page-head admin-vendor-head">
        <div>
          <span className="eyebrow">VENDOR MANAGEMENT</span>
          <h1>{fullName}</h1>
          <p>
            {vendor.email} · Joined{" "}
            {vendor.createdAt
              ? new Date(vendor.createdAt).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="admin-vendor-head__actions">
          <span
            className={`admin-status ${vendor.status === "active" ? "admin-status--good" : "admin-status--changes_requested"}`}
          >
            {vendor.status || "inactive"}
          </span>
          <Button
            variant={vendor.status === "active" ? "danger" : "primary"}
            loading={busy === "status"}
            onClick={() =>
              run("status", () => adminApi.toggleUserStatus(vendorId))
            }
          >
            {vendor.status === "active"
              ? "Suspend account"
              : "Activate account"}
          </Button>
        </div>
      </div>
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
          role="status"
        >
          {feedback.message}
        </div>
      )}
      <div className="admin-vendor-grid">
        <section className="admin-card admin-vendor-profile">
          <div className="admin-card__head">
            <div>
              <span className="eyebrow">ACCOUNT</span>
              <h2>Vendor profile</h2>
            </div>
          </div>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>{vendor.phoneNumber || "—"}</dd>
            </div>
            <div>
              <dt>KYC status</dt>
              <dd>
                <span className={`admin-status admin-status--${reviewStatus}`}>
                  {reviewStatus === "approved"
                    ? "Verified"
                    : reviewStatus === "changes_requested"
                      ? "Changes requested"
                      : "Under review"}
                </span>
              </dd>
            </div>
            <div>
              <dt>Stores</dt>
              <dd>{vendor.stores?.length || 0}</dd>
            </div>
            <div>
              <dt>Tracking ID</dt>
              <dd>{vendor.trackingId || "—"}</dd>
            </div>
          </dl>
          {vendor.kyc && (
            <Link className="admin-inline-link" to="/admin/verification">
              Open verification workspace →
            </Link>
          )}
        </section>
        <section className="admin-card admin-vendor-subscription">
          <div className="admin-card__head">
            <div>
              <span className="eyebrow">SUBSCRIPTION</span>
              <h2>Plan and access</h2>
            </div>
          </div>
          {activeSubscription ? (
            <div className="admin-current-plan">
              <div>
                <span>Current plan</span>
                <strong>
                  {activeSubscription.subscriptionPlans?.name ||
                    "Subscription plan"}
                </strong>
              </div>
              <span className="admin-status admin-status--good">Active</span>
              <small>
                {activeSubscription.endDate
                  ? `Expires ${new Date(activeSubscription.endDate).toLocaleDateString()}`
                  : ""}
              </small>
            </div>
          ) : (
            <div className="admin-empty-inline">
              <strong>No active paid subscription</strong>
              <span>The vendor is currently using default access.</span>
            </div>
          )}
          <p className="admin-helper">
            Set a free waiver or discounted price for this vendor. They will be
            notified and can claim it from Subscriptions.
          </p>
          <form className="admin-offer-form" onSubmit={submitOffer}>
            <label>
              Plan
              <select
                value={form.subscriptionPlanId}
                onChange={(event) => {
                  const plan = plans.find(
                    (item) => item.id === event.target.value,
                  );
                  setForm((current) => ({
                    ...current,
                    subscriptionPlanId: event.target.value,
                    specialPrice: plan ? String(plan.price) : "0",
                  }));
                }}
                required
              >
                <option value="">Choose a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.currency?.symbol || "₦"}
                    {Number(plan.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <div className="admin-offer-form__row">
              <label>
                Special price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.specialPrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      specialPrice: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Expires (optional)
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expiresAt: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              Campaign reason
              <input
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                placeholder="e.g. Launch partner promotion"
                maxLength="255"
                required
              />
            </label>
            <Button
              type="submit"
              loading={busy === "offer"}
              disabled={plansResource.loading}
            >
              Save vendor offer
            </Button>
          </form>
        </section>
      </div>
      <section className="admin-card">
        <div className="admin-card__head">
          <div>
            <span className="eyebrow">HISTORY</span>
            <h2>Subscription offers</h2>
          </div>
        </div>
        {offersResource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : !offers.length ? (
          <EmptyState
            title="No subscription offers"
            description="Individual waivers and discounts will appear here."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const usable =
                    offer.isActive &&
                    !offer.redeemedAt &&
                    (!offer.expiresAt ||
                      new Date(offer.expiresAt) > new Date());
                  return (
                    <tr key={offer.id}>
                      <td>
                        <strong>
                          {offer.subscriptionPlan?.name || "Plan"}
                        </strong>
                      </td>
                      <td>
                        {offer.subscriptionPlan?.currency?.symbol || "₦"}
                        {Number(offer.specialPrice).toLocaleString()}
                      </td>
                      <td>{offer.reason}</td>
                      <td>
                        <span
                          className={`admin-status ${usable ? "admin-status--good" : ""}`}
                        >
                          {offer.redeemedAt
                            ? "Redeemed"
                            : usable
                              ? "Available"
                              : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {offer.expiresAt
                          ? new Date(offer.expiresAt).toLocaleDateString()
                          : "No expiry"}
                      </td>
                      <td>
                        {usable && (
                          <button
                            className="admin-row-action admin-row-action--danger"
                            disabled={busy === offer.id}
                            onClick={() =>
                              run(offer.id, () =>
                                adminApi.revokeVendorOffer(offer.id),
                              )
                            }
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export function AdminSubscriptions() {
  const [refresh, setRefresh] = useState(0);
  const resource = useResource(
    (signal) => adminApi.subscriptionPlans(signal),
    [refresh],
  );
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editing, setEditing] = useState(null);
  const plans = rowsFrom(resource.data);
  const toggle = async (plan) => {
    setBusy(plan.id);
    setFeedback(null);
    try {
      const response = await adminApi.setPlanWaiver(plan.id, !plan.isFeeWaived);
      setFeedback({ message: response.message });
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">REVENUE CONTROLS</span>
          <h1>Subscriptions</h1>
          <p>
            Create and edit plans, and manage plan-wide fee waivers.
          </p>
        </div>
        <Button onClick={() => setEditing({})}>New plan</Button>
      </div>
      {editing && (
        <AdminPlanForm
          plan={editing.id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            setFeedback({ message });
            setRefresh((value) => value + 1);
          }}
        />
      )}
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
        >
          {feedback.message}
        </div>
      )}
      <section className="admin-card">
        <div className="admin-waiver-note">
          <strong>Plan-wide waivers affect every vendor.</strong>
          <span>
            Use a vendor’s profile when a waiver or discount should apply to one
            business only.
          </span>
        </div>
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error">{resource.error.message}</div>
        ) : (
          <div className="admin-plan-grid">
            {plans.map((plan) => (
              <article
                className={`admin-plan-card ${plan.isFeeWaived ? "admin-plan-card--waived" : ""}`}
                key={plan.id}
              >
                <div>
                  <span className="eyebrow">{plan.duration} DAYS</span>
                  <h2>{plan.name}</h2>
                  <p>
                    {plan.currency?.symbol || "₦"}
                    {Number(plan.price).toLocaleString()}
                  </p>
                </div>
                <ul>
                  <li>{plan.productLimit} products</li>
                  <li>
                    {plan.allowsAuction
                      ? `${plan.auctionProductLimit || 0} auction listings`
                      : "No auction listings"}
                  </li>
                  <li>{plan.maxAds || 0} adverts</li>
                </ul>
                <div className="admin-plan-card__footer">
                  {plan.isFeeWaived && (
                    <span className="admin-status admin-status--good">
                      Fees waived globally
                    </span>
                  )}
                  <Button variant="outline" onClick={() => setEditing(plan)}>
                    Edit plan
                  </Button>
                  <Button
                    variant={plan.isFeeWaived ? "outline" : "primary"}
                    loading={busy === plan.id}
                    onClick={() => toggle(plan)}
                  >
                    {plan.isFeeWaived
                      ? "Restore normal fee"
                      : "Waive for all vendors"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function AdminOrders() {
  const { notify } = useApp();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const [statusModal, setStatusModal] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [busy, setBusy] = useState(false);

  const allResource = useResource(
    (signal) =>
      tab === "all"
        ? adminApi.orders(1, signal, { trackingNumber: query.trim() })
        : Promise.resolve({ data: [] }),
    [tab, query, revision],
  );

  const myResource = useResource(
    (signal) =>
      tab === "my"
        ? adminApi.myOrders(signal)
        : Promise.resolve({ data: [] }),
    [tab, revision],
  );

  const allRows = rowsFrom(allResource.data);
  const myRows = rowsFrom(myResource.data);

  const filteredAll = useMemo(() => {
    return allRows.filter(
      (order) =>
        !paymentStatus ||
        String(order.payment?.status || "unpaid").toLowerCase() === paymentStatus,
    );
  }, [allRows, paymentStatus]);

  const filteredMy = useMemo(() => {
    const term = query.trim().toLowerCase();
    return myRows.filter((item) => {
      const product =
        typeof item.product === "string"
          ? JSON.parse(item.product)
          : item.product || {};
      const order = item.order || {};
      const user = order.user || {};
      const matchesTerm =
        !term ||
        (product.name || item.productName || "").toLowerCase().includes(term) ||
        (product.sku || item.sku || "").toLowerCase().includes(term) ||
        (order.refId || "").toLowerCase().includes(term) ||
        (order.trackingNumber || "").toLowerCase().includes(term) ||
        (user.firstName || "").toLowerCase().includes(term) ||
        (user.lastName || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term);

      const matchesStatus =
        !orderStatus ||
        String(item.status || "").toLowerCase() === orderStatus.toLowerCase();

      return matchesTerm && matchesStatus;
    });
  }, [myRows, query, orderStatus]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModal) return;
    setBusy(true);
    try {
      await adminApi.updateOrderStatus(
        statusModal.item.id,
        statusModal.nextStatus,
        statusModal.nextStatus === "delivered" ? deliveryCode.trim() : undefined,
      );
      notify("Order status updated successfully.", "success");
      setStatusModal(null);
      setDeliveryCode("");
      setRevision((v) => v + 1);
    } catch (err) {
      notify(err.message || "Failed to update order status.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">ORDER OPERATIONS</span>
          <h1>Orders</h1>
          <p>
            {tab === "all"
              ? "Monitor all purchases, payments, fulfilment, and delivery across the marketplace."
              : `${myRows.length} customer orders placed for products in your administrator stores.`}
          </p>
        </div>
      </div>

      <div className="admin-content-tabs">
        <button
          type="button"
          className={tab === "all" ? "active" : ""}
          onClick={() => {
            setTab("all");
            setQuery("");
          }}
        >
          <ReceiptText size={16} /> All orders
        </button>
        <button
          type="button"
          className={tab === "my" ? "active" : ""}
          onClick={() => {
            setTab("my");
            setQuery("");
          }}
        >
          <ReceiptText size={16} /> My store orders ({myRows.length || 0})
        </button>
      </div>

      <section className="admin-card">
        {tab === "all" ? (
          <div className="admin-product-toolbar">
            <input
              aria-label="Search order tracking number"
              placeholder="Search tracking number"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Filter payment status"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
            >
              <option value="">All payment states</option>
              <option value="success">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="unpaid">No payment record</option>
            </select>
          </div>
        ) : (
          <div className="admin-product-toolbar">
            <input
              aria-label="Search my store orders"
              placeholder="Search product, customer, or order reference"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Filter order fulfillment status"
              value={orderStatus}
              onChange={(event) => setOrderStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {tab === "all" ? (
          allResource.loading ? (
            <Skeleton className="admin-table-skeleton" />
          ) : allResource.error ? (
            <div className="admin-error">{allResource.error.message}</div>
          ) : !filteredAll.length ? (
            <EmptyState
              title="No matching orders"
              description="Try a different tracking number or payment status."
            />
          ) : (
            <div className="admin-order-list">
              {filteredAll.map((order) => (
                <article
                  className="admin-order-row"
                  key={order.id}
                  style={{
                    gridTemplateColumns:
                      "minmax(220px, 2.2fr) minmax(180px, 1.6fr) 45px 105px 75px 85px 70px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span className="admin-product-label">Order reference</span>
                    <strong
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                      title={order.refId}
                    >
                      {order.refId}
                    </strong>
                    <small
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {order.trackingNumber || "Tracking not assigned"}
                    </small>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span className="admin-product-label">Customer</span>
                    <strong
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {order.user
                        ? [order.user.firstName, order.user.lastName]
                            .filter(Boolean)
                            .join(" ")
                        : "Customer"}
                    </strong>
                    <small
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {order.user?.email || "—"}
                    </small>
                  </div>
                  <div>
                    <span className="admin-product-label">Items</span>
                    <strong>{order.orderItemsCount || 0}</strong>
                  </div>
                  <div>
                    <span className="admin-product-label">Total</span>
                    <strong>
                      {order.payment?.currency || "₦"}
                      {Number(order.totalAmount).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-product-label">Payment</span>
                    <span
                      className={`admin-status ${String(order.payment?.status).toLowerCase() === "success" ? "admin-status--good" : String(order.payment?.status).toLowerCase() === "failed" ? "admin-status--changes_requested" : ""}`}
                      style={{
                        justifySelf: "start",
                        width: "fit-content",
                        padding: "3px 8px",
                      }}
                    >
                      {order.payment?.status || "No record"}
                    </span>
                  </div>
                  <div>
                    <span className="admin-product-label">Created</span>
                    <strong>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                    </strong>
                  </div>
                  <Link
                    className="admin-row-action"
                    to={`/admin/orders/${order.id}`}
                  >
                    Open →
                  </Link>
                </article>
              ))}
            </div>
          )
        ) : myResource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : myResource.error ? (
          <div className="admin-error">{myResource.error.message}</div>
        ) : !filteredMy.length ? (
          <EmptyState
            title="No orders for your products yet"
            description="When customers buy items listed in your admin stores, they will appear here."
          />
        ) : (
          <div className="admin-order-list">
            {filteredMy.map((item) => {
              const product =
                typeof item.product === "string"
                  ? JSON.parse(item.product)
                  : item.product || {};
              const order = item.order || {};
              const user = order.user || item.user || {};
              const currencySymbol =
                product.store?.currency?.symbol || item.currency || "₦";

              return (
                <article
                  className="admin-order-row"
                  key={item.id}
                  style={{
                    gridTemplateColumns:
                      "minmax(260px, 2.2fr) minmax(170px, 1.4fr) 45px 105px 75px 85px 135px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: "#edf1f3",
                        overflow: "hidden",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {product.image_url || product.image ? (
                        <img
                          src={product.image_url || product.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box size={18} />
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span
                        className="admin-product-label"
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                        title={product.sku || item.sku || order.refId || "ITEM"}
                      >
                        {product.sku || item.sku || order.refId || "ITEM"}
                      </span>
                      <strong
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                        }}
                        title={product.name || item.productName || "Product"}
                      >
                        {product.name || item.productName || "Product"}
                      </strong>
                      <small
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                          color: "#8593a5",
                        }}
                      >
                        {product.store?.name || item.storeName || "Admin Store"}
                      </small>
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <span className="admin-product-label">Customer</span>
                    <strong
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {[user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ") || "Customer"}
                    </strong>
                    <small
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {user.email || user.phoneNumber || "—"}
                    </small>
                  </div>

                  <div>
                    <span className="admin-product-label">Qty</span>
                    <strong>{item.quantity || 1}</strong>
                  </div>

                  <div>
                    <span className="admin-product-label">Total</span>
                    <strong>
                      {currencySymbol}
                      {(
                        Number(item.price || 0) * Number(item.quantity || 1)
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span className="admin-product-label">Status</span>
                    <span
                      className={`admin-status ${
                        item.status === "delivered"
                          ? "admin-status--good"
                          : item.status === "cancelled"
                            ? "admin-status--changes_requested"
                            : ""
                      }`}
                      style={{
                        justifySelf: "start",
                        width: "fit-content",
                        padding: "3px 8px",
                      }}
                    >
                      {item.status || "pending"}
                    </span>
                  </div>

                  <div>
                    <span className="admin-product-label">Date</span>
                    <strong>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    {!["delivered", "cancelled"].includes(item.status) && (
                      <Button
                        variant="outline"
                        style={{
                          minHeight: 30,
                          padding: "0 10px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                        onClick={() =>
                          setStatusModal({
                            item,
                            nextStatus:
                              item.status === "pending"
                                ? "processing"
                                : item.status === "processing"
                                  ? "shipped"
                                  : "delivered",
                          })
                        }
                      >
                        Update
                      </Button>
                    )}
                    <Link
                      className="admin-row-action"
                      to={`/admin/orders/${item.orderId || order.id || item.id}`}
                    >
                      Open →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {statusModal && (
        <Modal
          title={`Update Status: ${statusModal.item.product?.name || statusModal.item.productName || "Product"}`}
          onClose={() => {
            if (!busy) {
              setStatusModal(null);
              setDeliveryCode("");
            }
          }}
        >
          <form className="admin-content-form" onSubmit={handleStatusUpdate}>
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
              Current status:{" "}
              <strong style={{ color: "#172541" }}>
                {statusModal.item.status || "pending"}
              </strong>
            </p>

            <label>
              Next status
              <select
                value={statusModal.nextStatus}
                onChange={(e) =>
                  setStatusModal({
                    ...statusModal,
                    nextStatus: e.target.value,
                  })
                }
                required
              >
                {orderStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            {statusModal.nextStatus === "delivered" && (
              <label>
                Delivery confirmation code
                <input
                  type="text"
                  value={deliveryCode}
                  onChange={(e) => setDeliveryCode(e.target.value)}
                  placeholder="Enter customer delivery code"
                  required
                />
              </label>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 14,
              }}
            >
              <Button
                variant="outline"
                type="button"
                disabled={busy}
                onClick={() => {
                  setStatusModal(null);
                  setDeliveryCode("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Update status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

const orderStatuses = ["pending", "processing", "shipped", "delivered"];
export function AdminOrderDetail() {
  const { orderId } = useParams();
  const [refresh, setRefresh] = useState(0);
  const orderResource = useResource(
    (signal) => adminApi.orderDetails(orderId, signal),
    [orderId, refresh],
  );
  const itemsResource = useResource(
    (signal) => adminApi.orderItems(orderId, signal),
    [orderId, refresh],
  );
  const paymentsResource = useResource(
    (signal) => adminApi.orderPayments(orderId, signal),
    [orderId, refresh],
  );
  const [action, setAction] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [dropshipItem, setDropshipItem] = useState(null);
  const order = orderResource.data?.data;
  const items = rowsFrom(itemsResource.data);
  const payments = rowsFrom(paymentsResource.data);
  const update = async (item, status, code) => {
    setBusy(true);
    setFeedback(null);
    try {
      const response = await adminApi.updateOrderStatus(item.id, status, code);
      setFeedback({ message: response.message });
      setAction(null);
      setDeliveryCode("");
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy(false);
    }
  };
  if (orderResource.loading || itemsResource.loading)
    return <Skeleton className="admin-vendor-loading" />;
  if (orderResource.error || !order)
    return (
      <>
        <Link className="admin-review-back" to="/admin/orders">
          <ArrowLeft size={18} /> Back to orders
        </Link>
        <div className="admin-error">
          {orderResource.error?.message || "Order could not be found."}
        </div>
      </>
    );
  return (
    <>
      <Link className="admin-review-back" to="/admin/orders">
        <ArrowLeft size={18} /> Back to orders
      </Link>
      <div className="admin-page-head" style={{ flexWrap: "wrap", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ minWidth: 0, flex: "1 1 300px" }}>
          <span className="eyebrow">ORDER DETAILS</span>
          <h1 style={{ wordBreak: "break-word", overflowWrap: "anywhere", fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.25, margin: "4px 0 6px" }}>
            {order.trackingNumber || `Order #${order.id}`}
          </h1>
          <p style={{ wordBreak: "break-all", overflowWrap: "anywhere", margin: 0, color: "#64748b", fontSize: "13px" }}>
            Payment Ref: <span style={{ fontFamily: "monospace", color: "#334155" }}>{order.refId}</span> · Placed{" "}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
          </p>
        </div>
        <strong className="admin-order-total" style={{ flexShrink: 0 }}>
          ₦{Number(order.totalAmount).toLocaleString()}
        </strong>
      </div>
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
        >
          {feedback.message}
        </div>
      )}
      <div className="admin-order-detail-grid">
        <div className="admin-order-items">
          {itemsResource.error ? (
            <div className="admin-error">{itemsResource.error.message}</div>
          ) : (
            items.map((item) => {
              const product =
                typeof item.product === "string"
                  ? JSON.parse(item.product)
                  : item.product || {};
              const position = orderStatuses.indexOf(item.status);
              const final = ["delivered", "cancelled"].includes(item.status);
              const nextStatus =
                position >= 0 && position < orderStatuses.length - 1
                  ? orderStatuses[position + 1]
                  : null;
              return (
                <section className="admin-card admin-order-item" key={item.id}>
                  <div className="admin-order-item__head">
                    <div className="admin-order-item__image">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" />
                      ) : (
                        <Box />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span className="eyebrow" style={{ wordBreak: "break-all", overflowWrap: "anywhere" }}>
                        {product.sku || "ORDER ITEM"}
                      </span>
                      <h2>{product.name || "Product"}</h2>
                      <p>
                        {item.quantity} ×{" "}
                        {product.store?.currency?.symbol || "₦"}
                        {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`admin-status ${item.status === "delivered" ? "admin-status--good" : item.status === "cancelled" ? "admin-status--changes_requested" : ""}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="admin-order-progress">
                    {orderStatuses.map((status, index) => (
                      <div
                        className={`${index <= position ? "complete" : ""} ${status === item.status ? "current" : ""}`}
                        key={status}
                      >
                        <span />
                        {status}
                      </div>
                    ))}
                  </div>
                  <div className="admin-order-item__meta">
                    <span>
                      Vendor{" "}
                      <strong>
                        {item.vendor
                          ? [item.vendor.firstName, item.vendor.lastName]
                              .filter(Boolean)
                              .join(" ")
                          : product.store?.name || "Administrator"}
                      </strong>
                    </span>
                    <span>
                      Line total{" "}
                      <strong>
                        {product.store?.currency?.symbol || "₦"}
                        {(
                          Number(item.price) * Number(item.quantity)
                        ).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                  {(item.dropshipProductId || product.type === "dropship") && (
                    <div className="admin-dropship-bar">
                      <span>
                        <strong>Dropship fulfilment</strong>
                        <small>
                          Supplier order and tracking data are available.
                        </small>
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setDropshipItem(item)}
                      >
                        Monitor shipment
                      </Button>
                    </div>
                  )}
                  {!final && (
                    <div className="admin-order-item__actions">
                      <Button
                        variant="danger"
                        onClick={() => setAction({ type: "cancel", item })}
                      >
                        Cancel item
                      </Button>
                      {nextStatus && (
                        <Button
                          onClick={() =>
                            nextStatus === "delivered"
                              ? setAction({ type: "deliver", item })
                              : update(item, nextStatus)
                          }
                          loading={busy}
                        >
                          Mark as {nextStatus}
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
        <aside className="admin-order-aside">
          <section className="admin-card">
            <span className="eyebrow">CUSTOMER & DELIVERY</span>
            <dl>
              <div>
                <dt>Customer</dt>
                <dd>
                  {order.user
                    ? [order.user.firstName, order.user.lastName]
                        .filter(Boolean)
                        .join(" ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{order.user?.email || "—"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{order.user?.phoneNumber || "—"}</dd>
              </div>
              <div>
                <dt>Shipping address</dt>
                <dd>
                  {typeof order.shippingAddress === "object"
                    ? Object.values(order.shippingAddress)
                        .filter(Boolean)
                        .join(", ")
                    : order.shippingAddress}
                </dd>
              </div>
            </dl>
          </section>
          <section className="admin-card">
            <span className="eyebrow">PAYMENT RECORDS</span>
            {paymentsResource.loading ? (
              <Skeleton className="admin-payment-loading" />
            ) : paymentsResource.error || !payments.length ? (
              <div className="admin-empty-inline">
                <strong>No payment record</strong>
                <span>
                  Do not fulfil this order until payment is independently
                  verified.
                </span>
              </div>
            ) : (
              payments.map((payment) => (
                <div className="admin-payment" key={payment.id} style={{ minWidth: 0 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ wordBreak: "break-all", overflowWrap: "anywhere", display: "block" }}>{payment.refId}</strong>
                    <span>
                      {payment.channel || "Payment gateway"} ·{" "}
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <span
                    className={`admin-status ${String(payment.status).toLowerCase() === "success" ? "admin-status--good" : "admin-status--changes_requested"}`}
                    style={{ flexShrink: 0 }}
                  >
                    {payment.status}
                  </span>
                  <b>
                    {payment.currency || "₦"}
                    {Number(payment.amount).toLocaleString()}
                  </b>
                </div>
              ))
            )}
          </section>
        </aside>
      </div>
      {action?.type === "cancel" && (
        <ConfirmModal
          title="Cancel this order item?"
          description="This stops fulfilment, updates the related transaction, adjusts pending vendor funds, and notifies the customer."
          confirmLabel="Cancel item"
          loading={busy}
          onClose={() => setAction(null)}
          onConfirm={() => update(action.item, "cancelled")}
        />
      )}{" "}
      {action?.type === "deliver" && (
        <Modal
          title="Confirm delivery"
          onClose={() => !busy && setAction(null)}
          footer={
            <>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setAction(null)}
              >
                Back
              </Button>
              <Button
                loading={busy}
                disabled={!deliveryCode.trim()}
                onClick={() => update(action.item, "delivered", deliveryCode)}
              >
                Confirm delivery
              </Button>
            </>
          }
        >
          <div className="admin-delivery-code">
            <p>
              Enter the delivery code sent to the customer when this item was
              shipped.
            </p>
            <TextField
              label="Delivery confirmation code"
              name="deliveryCode"
              value={deliveryCode}
              onChange={(event) =>
                setDeliveryCode(event.target.value.toUpperCase())
              }
              autoFocus
              required
            />
          </div>
        </Modal>
      )}
      {dropshipItem && (
        <DropshipMonitor
          item={dropshipItem}
          onClose={() => setDropshipItem(null)}
        />
      )}
    </>
  );
}

function DropshipMonitor({ item, onClose }) {
  const details = useResource(
    (signal) => adminApi.dropshipOrderDetails(item.id, signal),
    [item.id],
  );
  const tracking = useResource(
    (signal) => adminApi.dropshipTracking(item.id, signal),
    [item.id],
  );
  const detailRows = rowsFrom(details.data);
  const trackingRows = rowsFrom(tracking.data);
  return (
    <Modal title="Dropship shipment monitor" onClose={onClose}>
      <div className="admin-dropship-monitor">
        <p>Supplier fulfilment and tracking for this order item.</p>
        {details.loading || tracking.loading ? (
          <Skeleton className="admin-payment-loading" />
        ) : details.error || tracking.error ? (
          <div className="admin-error">
            {details.error?.message || tracking.error?.message}
          </div>
        ) : (
          <>
            <section>
              <h3>Supplier orders</h3>
              {detailRows.length ? (
                detailRows.map((row, index) => (
                  <pre key={row.id || index}>
                    {JSON.stringify(row, null, 2)}
                  </pre>
                ))
              ) : (
                <p>No supplier order details returned.</p>
              )}
            </section>
            <section>
              <h3>Tracking</h3>
              {trackingRows.length ? (
                trackingRows.map((row, index) => (
                  <pre key={row.id || index}>
                    {JSON.stringify(row, null, 2)}
                  </pre>
                ))
              ) : (
                <p>No tracking events returned yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}

export function AdminProducts() {
  const { notify } = useApp();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [revision, setRevision] = useState(0);
  const [productModal, setProductModal] = useState(null);
  const [productModalError, setProductModalError] = useState("");
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const categoriesResource = useResource(
    (signal) => adminApi.categoryTree(signal),
    [],
  );
  const categories = [...rowsFrom(categoriesResource.data)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const allResource = useResource(
    (signal) =>
      tab === "all"
        ? adminApi.products(page, signal, {
            name: debouncedQuery,
            status,
            categoryId,
            limit: 20,
          })
        : Promise.resolve({ data: [] }),
    [tab, page, debouncedQuery, status, categoryId],
  );

  const myResource = useResource(
    (signal) =>
      tab === "my"
        ? adminApi.myProducts(signal)
        : Promise.resolve({ data: [] }),
    [tab, revision],
  );

  const resource = tab === "all" ? allResource : myResource;
  const rawRows = rowsFrom(resource.data);

  const rows = useMemo(() => {
    if (tab === "all") return rawRows;
    const term = debouncedQuery.toLowerCase();
    return rawRows.filter((item) => {
      const matchName = !term || (item.name || "").toLowerCase().includes(term);
      const matchStatus = !status || item.status === status;
      const matchCat =
        !categoryId ||
        item.categoryId === categoryId ||
        item.category?.id === categoryId ||
        item.sub_category?.categoryId === categoryId;
      return matchName && matchStatus && matchCat;
    });
  }, [tab, rawRows, debouncedQuery, status, categoryId]);

  const pagination =
    tab === "all"
      ? allResource.data?.pagination || {}
      : { total: rows.length, pages: 1 };
  const hasFilters = Boolean(query || status || categoryId);
  const clearFilters = () => {
    setQuery("");
    setStatus("");
    setCategoryId("");
    setPage(1);
  };

  const handleSaveProduct = async (formValues) => {
    setBusy(true);
    setProductModalError("");
    setFeedback("");
    try {
      const images =
        Array.isArray(formValues.images) && formValues.images.length > 0
          ? formValues.images
          : formValues.image
          ? [formValues.image]
          : [];
      const primaryImage = images[0] || "";

      const payload = {
        storeId: formValues.storeId,
        categoryId: formValues.categoryId,
        name: formValues.name.trim(),
        price: Number(formValues.price),
        discountPrice: formValues.discountPrice ? Number(formValues.discountPrice) : 0,
        discount_price: formValues.discountPrice ? Number(formValues.discountPrice) : 0,
        quantity: Number(formValues.quantity || 1),
        condition: formValues.condition || "brand_new",
        description: formValues.description.trim(),
        specification: formValues.specification || "",
        specifications: formValues.specification || "",
        warranty: formValues.warranty || "No warranty",
        return_policy: formValues.return_policy || "7 days return policy",
        photos: images,
        additional_images: images,
        image_url: primaryImage,
        image: primaryImage,
      };

      if (productModal?.item?.id) {
        await adminApi.updateProduct({ ...payload, productId: productModal.item.id });
        notify("Product updated successfully.", "success");
      } else {
        await adminApi.createProduct(payload);
        notify("Product created successfully.", "success");
      }
      setProductModal(null);
      setProductModalError("");
      setRevision((v) => v + 1);
    } catch (err) {
      const msg = err.message || "Failed to save product.";
      setProductModalError(msg);
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setBusy(true);
    setFeedback("");
    try {
      await adminApi.deleteMyProduct(deletingProduct.id);
      notify("Product deleted successfully.", "success");
      setDeletingProduct(null);
      setRevision((v) => v + 1);
    } catch (err) {
      const msg = err.message || "Failed to delete product.";
      notify(msg, "error");
      setFeedback(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">CATALOGUE CONTROL</span>
          <h1>Products</h1>
          <p>
            {resource.error
              ? "Products could not be loaded."
              : tab === "all"
                ? `${Number(pagination.total || rows.length).toLocaleString()} matching marketplace products`
                : `${rows.length} products owned by administrator`}
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setProductModalError("");
            setProductModal({ open: true, item: null });
          }}
        >
          Add a product
        </Button>
      </div>

      {feedback && (
        <div
          className={
            feedback.includes("successfully") ? "admin-success" : "admin-error"
          }
          style={{ marginBottom: 18 }}
        >
          {feedback}
        </div>
      )}

      <div className="admin-content-tabs">
        <button
          type="button"
          className={tab === "all" ? "active" : ""}
          onClick={() => {
            setTab("all");
            setPage(1);
          }}
        >
          <Package size={16} /> All products
        </button>
        <button
          type="button"
          className={tab === "my" ? "active" : ""}
          onClick={() => {
            setTab("my");
            setPage(1);
          }}
        >
          <Package size={16} /> My products ({rowsFrom(myResource.data).length || 0})
        </button>
      </div>

      <section className="admin-card">
        <div className="admin-product-toolbar">
          <input
            aria-label="Search products"
            placeholder="Search product name"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <select
            aria-label="Filter product status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="inactive">Unpublished</option>
            <option value="active">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            aria-label="Filter product category"
            value={categoryId}
            disabled={
              categoriesResource.loading || Boolean(categoriesResource.error)
            }
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              className="admin-filter-clear"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error">{resource.error.message}</div>
        ) : !rows.length ? (
          <EmptyState
            title="No matching products"
            description="Try a different name, status, or category."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="admin-product-list">
            {rows.map((product) => (
              <article className="admin-product-row" key={product.id}>
                <div className="admin-product-row__image">
                  {product.image_url || product.image ? (
                    <img src={product.image_url || product.image} alt="" />
                  ) : (
                    <Box size={22} />
                  )}
                </div>
                <div className="admin-product-row__name">
                  <strong>{product.name}</strong>
                  {product.isTrending && (
                    <small className="admin-trending-label">Trending</small>
                  )}
                  <span>
                    {product.sku || "No SKU"} ·{" "}
                    {String(product.condition || "").replaceAll("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="admin-product-label">Owner</span>
                  <strong>
                    {product.vendor
                      ? [product.vendor.firstName, product.vendor.lastName]
                          .filter(Boolean)
                          .join(" ")
                      : "Administrator"}
                  </strong>
                </div>
                <div>
                  <span className="admin-product-label">Price</span>
                  <strong>
                    {product.store?.currency?.symbol || "₦"}
                    {Number(product.price).toLocaleString()}
                  </strong>
                </div>
                <span
                  className={`admin-status ${product.status === "active" ? "admin-status--good" : product.status === "inactive" ? "admin-status--changes_requested" : ""}`}
                >
                  {product.status === "active"
                    ? "Published"
                    : product.status === "inactive"
                      ? "Unpublished"
                      : "Draft"}
                </span>
                <div className="admin-ops-actions">
                  {tab === "my" ? (
                    <>
                      <button
                        onClick={() => {
                          setProductModalError("");
                          setProductModal({ open: true, item: product });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => setDeletingProduct(product)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <Link
                      className="admin-row-action"
                      to={`/admin/products/${product.id}`}
                    >
                      Review →
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === "all" && (
          <div className="admin-pagination">
            <span>
              {pagination.total ? `Page ${page} of ${pagination.pages || 1}` : ""}
            </span>
            <Button
              variant="outline"
              disabled={page === 1 || resource.loading}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={resource.loading || page >= (pagination.pages || 1)}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>

      {productModal && (
        <AdminProductModal
          item={productModal.item}
          busy={busy}
          categories={categories}
          error={productModalError}
          onClose={() => {
            setProductModal(null);
            setProductModalError("");
          }}
          onSave={handleSaveProduct}
        />
      )}

      {deletingProduct && (
        <ConfirmModal
          title={`Delete “${deletingProduct.name}”?`}
          description="This product will be permanently removed from your catalog."
          confirmLabel="Delete product"
          tone="danger"
          loading={busy}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </>
  );
}

function AdminProductModal({ item, busy, categories, error, onClose, onSave }) {
  const storesResource = useResource((signal) => adminApi.myStores(signal), []);
  const myStores = rowsFrom(storesResource.data);

  const [mainCategoryId, setMainCategoryId] = useState(() => {
    if (item?.categoryId || item?.sub_category?.id) {
      const subId = item?.categoryId || item?.sub_category?.id;
      const found = categories.find((c) =>
        (c.subCategories || []).some((s) => s.id === subId),
      );
      if (found) return found.id;
    }
    return item?.category?.id || item?.sub_category?.categoryId || "";
  });

  const [form, setForm] = useState({
    storeId: item?.storeId || item?.store?.id || "",
    categoryId: item?.categoryId || item?.sub_category?.id || "",
    name: item?.name || "",
    price: item?.price || "",
    discountPrice: item?.discountPrice || item?.discount_price || "",
    quantity: item?.quantity || "1",
    condition: item?.condition || "brand_new",
    warranty: item?.warranty || "No warranty",
    return_policy: item?.return_policy || "7 days return policy",
    description: item?.description || "",
    specification: item?.specification || item?.specifications || "",
  });

  const [existingImages, setExistingImages] = useState(() => {
    if (!item) return [];
    let extra = [];
    if (Array.isArray(item.additional_images)) {
      extra = item.additional_images;
    } else if (typeof item.additional_images === "string") {
      try {
        const parsed = JSON.parse(item.additional_images);
        if (Array.isArray(parsed)) extra = parsed;
      } catch {
        extra = [item.additional_images];
      }
    } else if (Array.isArray(item.photos)) {
      extra = item.photos;
    }
    const all = [item.image_url, item.image, ...extra].filter(Boolean);
    return [...new Set(all)];
  });

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  useEffect(() => {
    if (!form.storeId && myStores.length) {
      setForm((f) => ({ ...f, storeId: myStores[0].id }));
    }
  }, [myStores]);

  const selectedCategory = categories.find((c) => c.id === mainCategoryId);
  const availableSubcategories = selectedCategory?.subCategories || [];

  const handleMainCategoryChange = (catId) => {
    setMainCategoryId(catId);
    setForm((f) => ({ ...f, categoryId: "" }));
  };

  const handleFilesAdded = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((current) => {
      const combined = [...current, ...selected];
      const maxAllowed = Math.max(0, 8 - existingImages.length);
      return combined.slice(0, maxAllowed);
    });
    e.target.value = "";
  };

  const removeExistingImage = (url) => {
    setExistingImages((current) => current.filter((img) => img !== url));
  };

  const removeNewFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.categoryId) {
      setFormError("Please select a subcategory for this product.");
      return;
    }
    const totalImages = existingImages.length + files.length;
    if (totalImages === 0) {
      setFormError("Please add at least one product photo.");
      return;
    }
    if (
      form.discountPrice &&
      Number(form.discountPrice) >= Number(form.price) &&
      Number(form.discountPrice) > 0
    ) {
      setFormError("Discount price must be less than regular price.");
      return;
    }

    try {
      setUploading(true);
      let uploadedUrls = [];
      if (files.length > 0) {
        uploadedUrls = await Promise.all(files.map((file) => uploadImage(file)));
      }
      const allImages = [...existingImages, ...uploadedUrls];
      onSave({
        ...form,
        images: allImages,
        image: allImages[0] || "",
      });
    } catch (err) {
      setFormError(err.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const activeError = formError || error;

  return (
    <Modal
      className="modal--wide"
      title={item ? "Edit product" : "Add a product"}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={busy || uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="admin-product-form"
            loading={busy || uploading}
            disabled={!myStores.length || busy || uploading}
          >
            {uploading
              ? "Uploading photos..."
              : item
              ? "Update product"
              : "Save product"}
          </Button>
        </>
      }
    >
      <form id="admin-product-form" className="admin-content-form" onSubmit={handleSubmit}>
        {activeError && (
          <div
            className="admin-error"
            role="alert"
            style={{
              background: "#fee2e2",
              border: "1px solid #f87171",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            {activeError}
          </div>
        )}

        {!myStores.length && !storesResource.loading && (
          <div className="admin-error">
            You must create an admin store first before adding products. Go to{" "}
            <strong>Stores</strong> and click <strong>Create a store</strong>.
          </div>
        )}

        <label>
          Admin store *
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            required
            disabled={!myStores.length}
          >
            <option value="">Select store</option>
            {myStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-form-row">
          <label>
            Category *
            <select
              value={mainCategoryId}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subcategory *
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              disabled={!mainCategoryId || !availableSubcategories.length}
            >
              <option value="">
                {!mainCategoryId
                  ? "Select a category first"
                  : availableSubcategories.length
                    ? "Select subcategory"
                    : "No subcategories found"}
              </option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Product name *
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Official product name"
            required
          />
        </label>

        <div className="admin-form-row">
          <label>
            Price (₦) *
            <input
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Discount price (₦, optional)
            <input
              type="number"
              min="0"
              step="any"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: e.target.value })
              }
              placeholder="0.00"
            />
          </label>
        </div>

        <div className="admin-form-row">
          <label>
            Stock quantity *
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </label>
          <label>
            Condition *
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              <option value="brand_new">Brand new</option>
              <option value="fairly_used">Fairly used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </label>
        </div>

        <div className="admin-form-row">
          <label>
            Warranty *
            <input
              value={form.warranty}
              onChange={(e) => setForm({ ...form, warranty: e.target.value })}
              placeholder="e.g. 1 year or No warranty"
              required
            />
          </label>
          <label>
            Return policy *
            <input
              value={form.return_policy}
              onChange={(e) =>
                setForm({ ...form, return_policy: e.target.value })
              }
              placeholder="e.g. 7 days return policy"
              required
            />
          </label>
        </div>

        <label>
          Description *
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the product"
            rows={3}
            required
          />
        </label>

        <label>
          Specifications (optional)
          <textarea
            value={form.specification}
            onChange={(e) =>
              setForm({ ...form, specification: e.target.value })
            }
            placeholder="Key technical specifications, dimensions, features..."
            rows={2}
          />
        </label>

        <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "var(--navy)", marginBottom: 0 }}>
            Product photos *
            <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#78869a", marginTop: 2 }}>
              Add up to 8 images. The first image will be used as the main cover photo.
            </span>
          </label>

          <div
            className="seller-upload"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            style={{
              minHeight: 110,
              padding: "16px 12px",
              cursor: uploading ? "wait" : "pointer",
              position: "relative",
              opacity: existingImages.length + files.length >= 8 ? 0.6 : 1,
            }}
          >
            <ImagePlus size={24} />
            <strong>Add product photos</strong>
            <span>JPG, PNG, or WebP · Select multiple photos (up to 8 total)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              style={{ display: "none" }}
              onChange={handleFilesAdded}
              disabled={uploading || existingImages.length + files.length >= 8}
            />
          </div>

          {(existingImages.length > 0 || previews.length > 0) && (
            <div className="seller-upload-preview" style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {existingImages.map((url, idx) => (
                <span key={url} className="seller-upload-image" style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={url}
                    alt={`Product photo ${idx + 1}`}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      display: "block",
                    }}
                  />
                  {idx === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "#172642",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 5px",
                        borderRadius: 4,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeExistingImage(url)}
                    disabled={uploading}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}

              {previews.map((item, idx) => {
                const isCover = existingImages.length === 0 && idx === 0;
                return (
                  <span key={item.url} className="seller-upload-image" style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        display: "block",
                      }}
                    />
                    {isCover && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          background: "#172642",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "2px 5px",
                          borderRadius: 4,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeNewFile(idx)}
                      disabled={uploading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export function AdminCategories() {
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const resource = useResource(
    (signal) => adminApi.categoryTree(signal),
    [revision],
  );
  const categories = rowsFrom(resource.data);

  const toggleCategory = (id) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allCollapsed =
    categories.length > 0 &&
    categories.every((cat) => Boolean(collapsedCategories[cat.id]));

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedCategories({});
    } else {
      const next = {};
      categories.forEach((cat) => {
        next[cat.id] = true;
      });
      setCollapsedCategories(next);
    }
  };

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map((cat) => {
        const catMatches = cat.name?.toLowerCase().includes(term);
        const matchingSubs = (cat.subCategories || []).filter((sub) =>
          sub.name?.toLowerCase().includes(term)
        );
        if (catMatches) {
          return cat;
        }
        if (matchingSubs.length > 0) {
          return {
            ...cat,
            subCategories: matchingSubs,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, search]);

  const save = async ({ name, file }) => {
    setBusy(true);
    setFeedback(null);
    try {
      const image = file ? await uploadImage(file) : editing?.item?.image;
      if (!image) throw new Error("Please add a category image.");
      const body =
        editing.kind === "category"
          ? {
              ...(editing.item?.id ? { categoryId: editing.item.id } : {}),
              name,
              image,
            }
          : {
              ...(editing.item?.id ? { subCategoryId: editing.item.id } : {}),
              categoryId: editing.categoryId,
              name,
              image,
            };
      const response =
        editing.kind === "category"
          ? await adminApi.saveCategory(body)
          : await adminApi.saveSubcategory(body);
      setFeedback({ message: response.message });
      setEditing(null);
      setRevision((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const response =
        deleting.kind === "category"
          ? await adminApi.deleteCategory(deleting.item.id)
          : await adminApi.deleteSubcategory(deleting.item.id);
      setFeedback({ message: response.message });
      setDeleting(null);
      setRevision((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">CATALOGUE STRUCTURE</span>
          <h1>Categories</h1>
          <p>Organise products into clear customer-facing groups.</p>
        </div>
        <Button onClick={() => setEditing({ kind: "category", item: null })}>
          Add category
        </Button>
      </div>
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
        >
          {feedback.message}
        </div>
      )}
      {resource.loading ? (
        <Skeleton className="admin-table-skeleton" />
      ) : resource.error ? (
        <div className="admin-error">{resource.error.message}</div>
      ) : (
        <>
          <div className="admin-taxonomy-toolbar">
            <div className="admin-taxonomy-search">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories or subcategories…"
                aria-label="Search categories or subcategories"
              />
              {search && (
                <button
                  type="button"
                  className="admin-taxonomy-search__clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="admin-taxonomy-toolbar__actions">
              <span className="admin-taxonomy-count">
                {filteredCategories.length === categories.length
                  ? `${categories.length} categories`
                  : `${filteredCategories.length} of ${categories.length} categories`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
              >
                {allCollapsed ? "Expand all" : "Collapse all"}
              </Button>
            </div>
          </div>

          {!filteredCategories.length ? (
            <EmptyState
              title="No categories found"
              description={
                search
                  ? `No categories or subcategories match “${search}”.`
                  : "No categories have been created yet."
              }
            />
          ) : (
            <div className="admin-taxonomy-grid">
              {filteredCategories.map((category) => {
                const isCollapsed = search.trim()
                  ? false
                  : Boolean(collapsedCategories[category.id]);
                return (
                  <section
                    className={`admin-card admin-taxonomy-card ${isCollapsed ? "admin-taxonomy-card--collapsed" : ""}`}
                    key={category.id}
                  >
                    <header>
                      <span className="admin-taxonomy-image">
                        {category.image ? (
                          <img src={category.image} alt="" />
                        ) : (
                          <Box size={22} />
                        )}
                      </span>
                      <div
                        className="admin-taxonomy-card__title"
                        onClick={() => toggleCategory(category.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCategory(category.id);
                          }
                        }}
                        title={isCollapsed ? "Click to expand" : "Click to collapse"}
                      >
                        <h2>{category.name}</h2>
                        <p>
                          {category.subCategories?.length || 0} subcategories
                          {isCollapsed ? " · Click to expand" : ""}
                        </p>
                      </div>
                      <div className="admin-taxonomy-actions">
                        <button
                          onClick={() =>
                            setEditing({ kind: "category", item: category })
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleting({ kind: "category", item: category })
                          }
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="admin-taxonomy-toggle-btn"
                          onClick={() => toggleCategory(category.id)}
                          aria-expanded={!isCollapsed}
                          aria-label={
                            isCollapsed
                              ? `Expand ${category.name}`
                              : `Collapse ${category.name}`
                          }
                          title={
                            isCollapsed
                              ? "Expand subcategories"
                              : "Collapse subcategories"
                          }
                        >
                          <ChevronDown
                            size={18}
                            className={`admin-taxonomy-chevron ${isCollapsed ? "admin-taxonomy-chevron--collapsed" : ""}`}
                          />
                        </button>
                      </div>
                    </header>
                    {!isCollapsed && (
                      <>
                        <div className="admin-subcategory-list">
                          {category.subCategories?.map((item) => (
                            <div key={item.id}>
                              <span className="admin-taxonomy-image admin-taxonomy-image--small">
                                {item.image ? (
                                  <img src={item.image} alt="" />
                                ) : (
                                  <Box size={15} />
                                )}
                              </span>
                              <strong>{item.name}</strong>
                              <button
                                onClick={() =>
                                  setEditing({
                                    kind: "subcategory",
                                    categoryId: category.id,
                                    item,
                                  })
                                }
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setDeleting({ kind: "subcategory", item })
                                }
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          {!category.subCategories?.length && (
                            <p>No subcategories yet.</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setEditing({
                              kind: "subcategory",
                              categoryId: category.id,
                              item: null,
                            })
                          }
                        >
                          Add subcategory
                        </Button>
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
      {editing && (
        <TaxonomyModal
          title={`${editing.item ? "Edit" : "Add"} ${editing.kind === "category" ? "category" : "subcategory"}`}
          item={editing.item}
          busy={busy}
          onClose={() => !busy && setEditing(null)}
          onSave={save}
        />
      )}{" "}
      {deleting && (
        <ConfirmModal
          title={`Delete “${deleting.item.name}”?`}
          description={
            deleting.kind === "category"
              ? "Categories with subcategories cannot be deleted."
              : "Subcategories connected to products cannot be deleted."
          }
          confirmLabel="Delete"
          tone="danger"
          loading={busy}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}

function TaxonomyModal({ title, item, busy, onClose, onSave }) {
  const [name, setName] = useState(item?.name || "");
  const [file, setFile] = useState(null);
  return (
    <Modal title={title} onClose={onClose}>
      <form
        className="admin-taxonomy-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), file });
        }}
      >
        <TextField
          label="Name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label className="seller-upload">
          <strong>{file || item?.image ? "Replace image" : "Add image"}</strong>
          <span>JPG, PNG, or WebP</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!item?.image}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        {(file || item?.image) && (
          <img
            className="admin-taxonomy-preview"
            src={file ? URL.createObjectURL(file) : item.image}
            alt="Preview"
          />
        )}
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const productText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function AdminProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const resource = useResource(
    (signal) => adminApi.product(productId, signal),
    [productId, refresh],
  );
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [feedback, setFeedback] = useState(null);
  const product = resource.data?.data;
  const changePublication = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const response =
        product.status === "active"
          ? await adminApi.unpublishProduct(product.id)
          : await adminApi.publishProduct(product.id);
      setFeedback({ message: response.message });
      setConfirm("");
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy(false);
    }
  };
  const changeTrending = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const response = await adminApi.setProductTrending(
        product.id,
        !product.isTrending,
      );
      setFeedback({ message: response.message });
      setConfirm("");
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await adminApi.deleteProduct(product.id);
      navigate("/admin/products", { replace: true });
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
      setConfirm("");
    } finally {
      setBusy(false);
    }
  };
  if (resource.loading) return <Skeleton className="admin-vendor-loading" />;
  if (resource.error || !product)
    return (
      <>
        <Link className="admin-review-back" to="/admin/products">
          <ArrowLeft size={18} /> Back to products
        </Link>
        <div className="admin-error">
          {resource.error?.message || "Product could not be found."}
        </div>
      </>
    );
  const images = [
    product.image_url,
    ...(Array.isArray(product.additional_images)
      ? product.additional_images
      : []),
  ].filter(Boolean);
  const vendorName = product.vendor
    ? [product.vendor.firstName, product.vendor.lastName]
        .filter(Boolean)
        .join(" ")
    : "Administrator";
  return (
    <>
      <Link className="admin-review-back" to="/admin/products">
        <ArrowLeft size={18} /> Back to products
      </Link>
      <div className="admin-page-head admin-product-head">
        <div>
          <span className="eyebrow">PRODUCT REVIEW</span>
          <h1>{product.name}</h1>
          <p>
            SKU {product.sku || "—"} · Submitted{" "}
            {product.createdAt
              ? new Date(product.createdAt).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <span
          className={`admin-status ${product.status === "active" ? "admin-status--good" : "admin-status--changes_requested"}`}
        >
          {product.status === "active"
            ? "Published"
            : product.status === "draft"
              ? "Draft"
              : "Unpublished"}
        </span>
      </div>
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
        >
          {feedback.message}
        </div>
      )}
      <div className="admin-product-detail">
        <section className="admin-card">
          <div className="admin-product-gallery">
            <div className="admin-product-gallery__main">
              {images[0] ? (
                <img src={images[0]} alt={product.name} />
              ) : (
                <Box size={40} />
              )}
            </div>
            {images.length > 1 && (
              <div className="admin-product-gallery__thumbs">
                {images.slice(1).map((image, index) => (
                  <img src={image} alt="" key={`${image}-${index}`} />
                ))}
              </div>
            )}
          </div>
          <div className="admin-product-copy">
            <span className="eyebrow">DESCRIPTION</span>
            <p>
              {productText(product.description) || "No description supplied."}
            </p>
            <span className="eyebrow">SPECIFICATIONS</span>
            <p>
              {productText(product.specification) ||
                "No specifications supplied."}
            </p>
          </div>
        </section>
        <aside className="admin-card admin-product-facts">
          <span className="eyebrow">LISTING DETAILS</span>
          <dl>
            <div>
              <dt>Vendor</dt>
              <dd>
                {product.vendor ? (
                  <Link to={`/admin/vendors/${product.vendor.id}`}>
                    {vendorName}
                  </Link>
                ) : (
                  vendorName
                )}
              </dd>
            </div>
            <div>
              <dt>Store</dt>
              <dd>{product.store?.name || "—"}</dd>
            </div>
            <div>
              <dt>Subcategory</dt>
              <dd>{product.sub_category?.name || "—"}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{String(product.condition || "—").replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{String(product.type || "—").replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>
                {product.store?.currency?.symbol || "₦"}
                {Number(product.price).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt>Discount price</dt>
              <dd>
                {product.discount_price
                  ? `${product.store?.currency?.symbol || "₦"}${Number(product.discount_price).toLocaleString()}`
                  : "None"}
              </dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{product.quantity ?? "—"}</dd>
            </div>
            <div>
              <dt>Warranty</dt>
              <dd>{product.warranty || "None"}</dd>
            </div>
            <div>
              <dt>Return policy</dt>
              <dd>{product.return_policy || "None"}</dd>
            </div>
            <div>
              <dt>Trending status</dt>
              <dd>
                <span className={`admin-status ${product.isTrending ? "admin-status--good" : ""}`}>
                  {product.isTrending ? "Trending" : "Standard"}
                </span>
              </dd>
            </div>
          </dl>
          <div className="admin-product-actions">
            <Button onClick={() => setConfirm("publication")}>
              {product.status === "active"
                ? "Unpublish product"
                : "Publish product"}
            </Button>
            <Button
              variant="outline"
              disabled={product.status !== "active"}
              onClick={() => setConfirm("trending")}
            >
              {product.isTrending ? "Remove from trending" : "Make trending"}
            </Button>
            <Button variant="danger" onClick={() => setConfirm("delete")}>
              Delete product
            </Button>
          </div>
          <p className="admin-helper">
            Publishing changes notify the vendor automatically. Unpublishing
            also removes this product from customer carts.
          </p>
        </aside>
      </div>
      {confirm === "publication" && (
        <ConfirmModal
          title={
            product.status === "active"
              ? "Unpublish this product?"
              : "Publish this product?"
          }
          description={
            product.status === "active"
              ? "Customers will no longer see this listing and it will be removed from existing carts."
              : "This listing will become visible to customers immediately."
          }
          confirmLabel={product.status === "active" ? "Unpublish" : "Publish"}
          loading={busy}
          onClose={() => setConfirm("")}
          onConfirm={changePublication}
        />
      )}{" "}
      {confirm === "trending" && (
        <ConfirmModal
          title={
            product.isTrending
              ? "Remove from trending?"
              : "Make this product trending?"
          }
          description={
            product.isTrending
              ? "The product will leave the curated trending section."
              : "The product will be featured in the curated trending section for customers."
          }
          confirmLabel={product.isTrending ? "Remove" : "Make trending"}
          tone="info"
          loading={busy}
          onClose={() => setConfirm("")}
          onConfirm={changeTrending}
        />
      )}{" "}
      {confirm === "delete" && (
        <ConfirmModal
          title="Delete this product?"
          description="This permanently removes the listing. The backend will block deletion when related carts, saved products, or reviews exist."
          confirmLabel="Delete permanently"
          tone="danger"
          loading={busy}
          onClose={() => setConfirm("")}
          onConfirm={remove}
        />
      )}
    </>
  );
}

const money = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(
    Number(amount || 0),
  );

export function AdminTransactions() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    refId: "",
    userName: "",
    status: "",
    transactionType: "",
  });
  const resource = useResource(
    (signal) => adminApi.transactions(page, signal, filters),
    [
      page,
      filters.refId,
      filters.userName,
      filters.status,
      filters.transactionType,
    ],
  );
  const rows = rowsFrom(resource.data);
  const pagination = resource.data?.pagination || {};
  const update = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">FINANCIAL LEDGER</span>
          <h1>Transactions</h1>
          <p>
            Audit marketplace payments, withdrawals, refunds, and subscription
            charges.
          </p>
        </div>
      </div>
      <section className="admin-card">
        <div className="admin-finance-filters">
          <input
            placeholder="Reference ID"
            aria-label="Filter by reference ID"
            value={filters.refId}
            onChange={(event) => update("refId", event.target.value)}
          />
          <input
            placeholder="Customer or vendor name"
            aria-label="Filter by user name"
            value={filters.userName}
            onChange={(event) => update("userName", event.target.value)}
          />
          <select
            aria-label="Transaction type"
            value={filters.transactionType}
            onChange={(event) => update("transactionType", event.target.value)}
          >
            <option value="">All transaction types</option>
            <option value="payment">Payment</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="refund">Refund</option>
            <option value="subscription">Subscription</option>
          </select>
          <select
            aria-label="Transaction status"
            value={filters.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error">{resource.error.message}</div>
        ) : !rows.length ? (
          <EmptyState
            title="No matching transactions"
            description="Try clearing one of the filters."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.refId || "—"}</strong>
                    </td>
                    <td>
                      {item.user ? (
                        <>
                          {[item.user.firstName, item.user.lastName]
                            .filter(Boolean)
                            .join(" ") || "Unnamed account"}
                          <small className="admin-table-subtitle">
                            {item.user.email}
                          </small>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {String(item.transactionType || "—").replaceAll("_", " ")}
                    </td>
                    <td>
                      <strong>{money(item.amount, item.currency)}</strong>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${item.status === "completed" ? "admin-status--good" : item.status === "failed" ? "admin-status--changes_requested" : ""}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="admin-pagination">
          <span>
            {pagination.total
              ? `${Number(pagination.total).toLocaleString()} transactions`
              : `Page ${page}`}
          </span>
          <Button
            variant="outline"
            disabled={page === 1 || resource.loading}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={
              resource.loading ||
              !rows.length ||
              (pagination.pages ? page >= pagination.pages : rows.length < 10)
            }
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </>
  );
}

function bankDetailsOf(withdrawal) {
  const raw =
    withdrawal?.bankInformation?.bankInfo ?? withdrawal?.bankInformation;
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return Object.fromEntries(
      new URLSearchParams(String(raw).replaceAll("?", "&")),
    );
  } catch {
    return { details: String(raw) };
  }
}

export function AdminWithdrawals() {
  const [filters, setFilters] = useState({ status: "", currency: "" });
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const requests = useResource(
    (signal) => adminApi.withdrawals(signal, filters),
    [filters.status, filters.currency, refresh],
  );
  const stats = useResource(
    (signal) => adminApi.payoutStats(signal),
    [refresh],
  );
  const rows = rowsFrom(requests.data);
  const aggregates = rowsFrom(stats.data);
  const stat = (currency, status) =>
    aggregates.find(
      (item) => item.currency === currency && item.status === status,
    )?.totalAmount || 0;
  const close = () => {
    if (!busy) {
      setSelected(null);
      setAction("");
      setReceipt(null);
      setNote("");
    }
  };
  const process = async () => {
    if (action === "approve" && !receipt) {
      setFeedback({
        error: true,
        message: "Attach the payment receipt before approving.",
      });
      return;
    }
    if (action === "reject" && !note.trim()) {
      setFeedback({ error: true, message: "Add a clear rejection reason." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const paymentReceipt =
        action === "approve" ? await uploadImage(receipt) : undefined;
      const response = await adminApi.updateWithdrawal(
        selected.id,
        action === "approve" ? "approved" : "rejected",
        action === "approve" ? { paymentReceipt } : { note: note.trim() },
      );
      setFeedback({ message: response.message });
      setSelected(null);
      setAction("");
      setReceipt(null);
      setNote("");
      setRefresh((value) => value + 1);
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">PAYOUT OPERATIONS</span>
          <h1>Withdrawal requests</h1>
          <p>Review payout instructions and keep a complete approval record.</p>
        </div>
      </div>
      <div className="admin-payout-stats">
        {[
          ["NGN", "pending"],
          ["USD", "pending"],
          ["NGN", "approved"],
          ["USD", "approved"],
        ].map(([currency, status]) => (
          <article className="admin-stat" key={`${currency}-${status}`}>
            <span>
              {status === "pending" ? "Pending" : "Approved"} · {currency}
            </span>
            <strong>
              {stats.loading ? "—" : money(stat(currency, status), currency)}
            </strong>
            <small>
              {status === "pending" ? "Awaiting action" : "Processed total"}
            </small>
          </article>
        ))}
      </div>
      {feedback && (
        <div
          className={
            feedback.error
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
        >
          {feedback.message}
        </div>
      )}
      <section className="admin-card">
        <div className="admin-finance-filters admin-finance-filters--compact">
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.currency}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
          >
            <option value="">All currencies</option>
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {requests.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : requests.error ? (
          <div className="admin-error">{requests.error.message}</div>
        ) : !rows.length ? (
          <EmptyState
            icon={Landmark}
            title="No withdrawal requests"
            description="Requests matching these filters will appear here."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Bank details</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.vendor
                          ? [item.vendor.firstName, item.vendor.lastName]
                              .filter(Boolean)
                              .join(" ") || "Unnamed vendor"
                          : "—"}
                      </strong>
                      <small className="admin-table-subtitle">
                        {item.vendor?.email}
                      </small>
                    </td>
                    <td>
                      <strong>{money(item.amount, item.currency)}</strong>
                    </td>
                    <td>
                      <button
                        className="admin-row-action"
                        onClick={() => {
                          setSelected(item);
                          setAction("details");
                        }}
                      >
                        View details
                      </button>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${item.status === "approved" ? "admin-status--good" : item.status === "rejected" ? "admin-status--changes_requested" : ""}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {item.status === "pending" ? (
                        <div className="admin-withdrawal-actions">
                          <button
                            className="admin-row-action"
                            onClick={() => {
                              setSelected(item);
                              setAction("approve");
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-row-action admin-row-action--danger"
                            onClick={() => {
                              setSelected(item);
                              setAction("reject");
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : item.paymentReceipt ? (
                        <a
                          className="admin-row-action"
                          href={item.paymentReceipt}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Receipt ↗
                        </a>
                      ) : (
                        item.note || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && action === "details" && (
        <Modal
          title="Payout bank details"
          onClose={close}
          footer={<Button onClick={close}>Close</Button>}
        >
          <dl className="admin-bank-details">
            {Object.entries(bankDetailsOf(selected)).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replaceAll("_", " ")}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
      {selected && ["approve", "reject"].includes(action) && (
        <Modal
          title={
            action === "approve" ? "Approve withdrawal" : "Reject withdrawal"
          }
          onClose={close}
          footer={
            <>
              <Button variant="ghost" disabled={busy} onClick={close}>
                Cancel
              </Button>
              <Button
                variant={action === "reject" ? "danger" : "primary"}
                loading={busy}
                onClick={process}
              >
                {action === "approve" ? "Approve payout" : "Reject and refund"}
              </Button>
            </>
          }
        >
          <div className="admin-withdrawal-modal">
            <p>
              <strong>{money(selected.amount, selected.currency)}</strong> for{" "}
              {selected.vendor
                ? [selected.vendor.firstName, selected.vendor.lastName]
                    .filter(Boolean)
                    .join(" ")
                : "this vendor"}
              .
            </p>
            {action === "approve" ? (
              <label>
                Payment receipt
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) =>
                    setReceipt(event.target.files?.[0] || null)
                  }
                />
                <small>
                  Required. This becomes the permanent proof of payout.
                </small>
              </label>
            ) : (
              <label>
                Reason for rejection
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Explain why the payout cannot be completed"
                />
                <small>
                  The amount will be returned to the vendor’s wallet.
                </small>
              </label>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function AdminVerification() {
  const resource = useResource((signal) => adminApi.kyc(signal), []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [updates, setUpdates] = useState({});
  const rows = rowsFrom(resource.data).map((item) =>
    updates[item.id] ? { ...item, ...updates[item.id] } : item,
  );
  const statusOf = (item) =>
    item.reviewStatus || (item.isVerified ? "approved" : "pending");
  const pendingCount = rows.filter(
    (item) => statusOf(item) === "pending",
  ).length;
  const changesCount = rows.filter(
    (item) => statusOf(item) === "changes_requested",
  ).length;
  const filtered = rows.filter(
    (item) =>
      (filter === "all" || statusOf(item) === filter) &&
      `${item.businessName || ""} ${item.vendorId || ""} ${item.user?.email || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const chooseFilter = (next) => {
    setFilter(next);
    setPage(1);
  };
  const fields = selected
    ? [
        ["businessName", "Business name", selected.businessName, true],
        ["contactEmail", "Contact email", selected.contactEmail, true],
        [
          "contactPhoneNumber",
          "Contact phone number",
          selected.contactPhoneNumber,
          true,
        ],
        [
          "businessDescription",
          "Business description",
          selected.businessDescription,
          true,
        ],
        ["businessLink", "Business website", selected.businessLink],
        ["businessAddress", "Business address", selected.businessAddress, true],
        [
          "businessRegistrationNumber",
          "Registration number",
          selected.businessRegistrationNumber,
        ],
        [
          "idVerification.name",
          "Identity document type",
          selected.idVerification?.name,
          true,
        ],
        [
          "idVerification.number",
          "Identity document number",
          selected.idVerification?.number,
          true,
        ],
        [
          "idVerification.expiryDate",
          "Identity document expiry",
          selected.idVerification?.expiryDate,
        ],
      ]
    : [];
  const openReview = (item) => {
    setSelected(item);
    setReviews(item.fieldReviews || {});
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setDecision = (field, status) =>
    setReviews((current) => ({
      ...current,
      [field]: {
        status,
        ...(status === "rejected"
          ? { reason: current[field]?.reason || "" }
          : {}),
      },
    }));
  const setReason = (field, reason) =>
    setReviews((current) => ({
      ...current,
      [field]: { status: "rejected", reason },
    }));
  const approveProvided = () =>
    setReviews(
      Object.fromEntries(
        fields
          .filter(([, , value]) => value)
          .map(([field]) => [field, { status: "approved" }]),
      ),
    );
  const submitReview = async () => {
    const missingReason = Object.entries(reviews).find(
      ([, review]) => review.status === "rejected" && !review.reason?.trim(),
    );
    if (missingReason) {
      setFeedback({
        error: true,
        message: "Add a reason for every rejected detail.",
      });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const response = await adminApi.reviewKyc(selected.id, reviews);
      const updated = response?.data || { ...selected, fieldReviews: reviews };
      setSelected(updated);
      setReviews(updated.fieldReviews || reviews);
      setUpdates((current) => ({ ...current, [updated.id]: updated }));
      setFeedback({
        message: response?.message || "Review saved successfully.",
      });
    } catch (cause) {
      setFeedback({ error: true, message: cause.message });
    } finally {
      setSaving(false);
    }
  };
  const labelForStatus = (status) =>
    status === "approved"
      ? "Verified"
      : status === "changes_requested"
        ? "Changes requested"
        : "Under review";
  if (selected)
    return (
      <>
        <button className="admin-review-back" onClick={() => setSelected(null)}>
          <ArrowLeft size={18} /> Back to verification
        </button>
        <div className="admin-page-head admin-review-head">
          <div>
            <span className="eyebrow">KYC REVIEW</span>
            <h1>{selected.businessName || "Vendor verification"}</h1>
            <p>
              {selected.user?.email || selected.contactEmail} · Submitted{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <span className={`admin-status admin-status--${statusOf(selected)}`}>
            {labelForStatus(statusOf(selected))}
          </span>
        </div>
        <div className="admin-review-layout">
          <section className="admin-card">
            <div className="admin-card__head">
              <div>
                <span className="eyebrow">SUBMITTED DETAILS</span>
                <h2>Review each detail</h2>
              </div>
              <Button variant="outline" onClick={approveProvided}>
                Approve all provided
              </Button>
            </div>
            <div className="admin-review-fields">
              {fields.map(([field, label, value, required]) => {
                const decision = reviews[field] || {};
                return (
                  <article
                    className={`admin-review-field admin-review-field--${decision.status || "pending"}`}
                    key={field}
                  >
                    <div className="admin-review-field__copy">
                      <span>
                        {label}
                        {required && <small>Required</small>}
                      </span>
                      <strong>{value || "Not provided"}</strong>
                    </div>
                    {value ? (
                      <div className="admin-review-actions">
                        <button
                          className={
                            decision.status === "approved"
                              ? "active approve"
                              : ""
                          }
                          onClick={() => setDecision(field, "approved")}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          className={
                            decision.status === "rejected"
                              ? "active reject"
                              : ""
                          }
                          onClick={() => setDecision(field, "rejected")}
                        >
                          <X size={16} /> Request change
                        </button>
                      </div>
                    ) : (
                      <span className="admin-not-provided">Optional</span>
                    )}
                    {decision.status === "rejected" && (
                      <label className="admin-review-reason">
                        Reason for the vendor
                        <textarea
                          value={decision.reason || ""}
                          onChange={(event) =>
                            setReason(field, event.target.value)
                          }
                          placeholder="Explain exactly what needs to be corrected"
                        />
                      </label>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          <aside className="admin-card admin-review-summary">
            <span className="eyebrow">DECISION</span>
            <h2>Review summary</h2>
            <div>
              <span>Approved</span>
              <strong>
                {
                  Object.values(reviews).filter(
                    (item) => item.status === "approved",
                  ).length
                }
              </strong>
            </div>
            <div>
              <span>Changes requested</span>
              <strong>
                {
                  Object.values(reviews).filter(
                    (item) => item.status === "rejected",
                  ).length
                }
              </strong>
            </div>
            <div>
              <span>Awaiting decision</span>
              <strong>
                {
                  fields
                    .filter(([, , value]) => value)
                    .filter(
                      ([field]) =>
                        !reviews[field] || reviews[field].status === "pending",
                    ).length
                }
              </strong>
            </div>
            <p>
              The vendor will receive an in-app notification and email after you
              submit.
            </p>
            {feedback && (
              <div
                className={feedback.error ? "admin-error" : "admin-success"}
                role="status"
              >
                {feedback.message}
              </div>
            )}
            <Button loading={saving} onClick={submitReview}>
              Submit field review
            </Button>
          </aside>
        </div>
      </>
    );
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">SELLER TRUST</span>
          <h1>Verification</h1>
          <p>Review the identity details submitted by vendors.</p>
        </div>
      </div>
      <section className="admin-card">
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error" role="alert">
            {resource.error.message}
          </div>
        ) : (
          <>
            <div className="admin-verify-toolbar">
              <div
                className="admin-verify-tabs"
                role="group"
                aria-label="Verification status"
              >
                {[
                  ["pending", `Under review (${pendingCount})`],
                  ["changes_requested", `Changes requested (${changesCount})`],
                  ["approved", "Verified"],
                  ["all", "All"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={filter === value ? "active" : ""}
                    onClick={() => chooseFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                aria-label="Search verification submissions"
                placeholder="Search business, email or vendor ID"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            {!visible.length ? (
              <EmptyState
                title="No matching submissions"
                description="Try another status or search term."
              />
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Business</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Vendor</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {item.businessName || "Unnamed business"}
                          </strong>
                          <small className="admin-table-subtitle">
                            {item.user?.email || item.contactEmail}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`admin-status admin-status--${statusOf(item)}`}
                          >
                            {labelForStatus(statusOf(item))}
                          </span>
                        </td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <span
                            className="admin-verify-id"
                            title={item.vendorId}
                          >
                            {item.vendorId
                              ? `${String(item.vendorId).slice(0, 8)}…`
                              : "—"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-row-action"
                            onClick={() => openReview(item)}
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="admin-pagination">
              <span>
                {filtered.length
                  ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`
                  : "0 results"}
              </span>
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
