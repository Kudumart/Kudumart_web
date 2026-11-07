import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  PackageSearch,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { Button, EmptyState, Modal, Skeleton } from "../../components/ui";
import { useResource } from "../../hooks/useResource";

const rows = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : payload?.data?.products ||
        payload?.products ||
        payload?.data?.category ||
        payload?.category ||
        payload?.data?.aliexpress_ds_text_search_response?.data?.products
          ?.selection_search_product ||
        payload?.aliexpress_ds_text_search_response?.data?.products
          ?.selection_search_product ||
        [];
const feedbackInitial = { busy: false, error: "", success: "" };

export function AdminPaymentGateways() {
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [feedback, setFeedback] = useState(feedbackInitial);
  const resource = useResource(
    (signal) => adminApi.paymentGateways(signal),
    [revision],
  );
  const act = async (action, success) => {
    setFeedback({ busy: true, error: "", success: "" });
    try {
      await action();
      setFeedback({ busy: false, error: "", success });
      setRevision((v) => v + 1);
    } catch (error) {
      setFeedback({ busy: false, error: error.message, success: "" });
    }
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">PAYMENT INFRASTRUCTURE</span>
          <h1>Payment gateways</h1>
          <p>
            Manage credentials and choose the active integration for each
            provider.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setEditor({})}>
          Add gateway
        </Button>
      </div>
      {feedback.error && <p className="admin-error">{feedback.error}</p>}
      {feedback.success && <p className="admin-success">{feedback.success}</p>}
      <section className="admin-card">
        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : rows(resource.data).length ? (
          <div className="admin-content-list">
            {rows(resource.data).map((item) => (
              <article key={item.id}>
                <div className="admin-content-list__image">
                  <CreditCard />
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <small>Public key · {mask(item.publicKey)}</small>
                </div>
                <span
                  className={`admin-status ${item.isActive ? "admin-status--good" : ""}`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
                <div className="admin-ops-actions">
                  <button onClick={() => setEditor(item)}>Edit</button>
                  {!item.isActive && (
                    <button
                      onClick={() =>
                        act(
                          () => adminApi.activatePaymentGateway(item.id),
                          `${item.name} activated.`,
                        )
                      }
                    >
                      Activate
                    </button>
                  )}
                  <button
                    className="danger"
                    onClick={() =>
                      confirm("Delete this gateway?") &&
                      act(
                        () => adminApi.deletePaymentGateway(item.id),
                        "Gateway deleted.",
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No gateways configured"
            description="Add Paystack or Stripe credentials to begin."
          />
        )}
      </section>
      {editor && (
        <GatewayEditor
          value={editor}
          busy={feedback.busy}
          onClose={() => setEditor(null)}
          onSave={(form) =>
            act(async () => {
              await adminApi.savePaymentGateway(form);
              setEditor(null);
            }, "Gateway saved.")
          }
        />
      )}
    </>
  );
}
const mask = (value) =>
  value
    ? `${String(value).slice(0, 7)}••••${String(value).slice(-4)}`
    : "Not provided";
function GatewayEditor({ value, busy, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "paystack",
    publicKey: "",
    secretKey: "",
    ...value,
  });
  return (
    <Modal
      title={`${form.id ? "Edit" : "Add"} payment gateway`}
      onClose={onClose}
    >
      <form
        className="admin-content-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <label>
          Provider
          <select
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          >
            <option value="paystack">Paystack</option>
            <option value="stripe">Stripe</option>
          </select>
        </label>
        <label>
          Public key
          <input
            value={form.publicKey}
            onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
            required
          />
        </label>
        <label>
          Secret key
          <input
            type="password"
            value={form.secretKey}
            onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
            required
          />
        </label>
        <p className="admin-helper">
          Credentials are sent directly to the KuduMart API and are never
          displayed in full here.
        </p>
        <div className="admin-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save gateway
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminDropshipping() {
  const [filters, setFilters] = useState({
    keywords: "",
    categoryId: "",
    currency: "NGN",
    page: 1,
    pageSize: 20,
    shippingCountry: "NG",
  });
  const [query, setQuery] = useState(null);
  const [feedback, setFeedback] = useState(feedbackInitial);
  const [importing, setImporting] = useState(null);
  const [account, setAccount] = useState("");
  const credentials = useResource(
    (signal) => adminApi.dropshipCredentials(signal),
    [],
  );
  const categories = useResource(
    (signal) => adminApi.dropshipCategories(signal),
    [],
  );
  const kuduCategories = useResource(
    (signal) => adminApi.categories(signal),
    [],
  );
  const stores = useResource((signal) => adminApi.stores(1, signal), []);
  const products = useResource(
    (signal) =>
      query
        ? adminApi.dropshipProducts(query, signal)
        : Promise.resolve({ data: [] }),
    [query],
  );
  const storeRows = rows(stores.data);
  const categoryRows = rows(categories.data);
  const kuduCategoryRows = rows(kuduCategories.data);
  const items = useMemo(() => rows(products.data), [products.data]);
  const connection = credentials.data?.data || credentials.data || {};
  const isConnected = Boolean(connection.isConnected || connection.connected);
  const statusBadge =
    connection.statusBadge ||
    (connection.status ? String(connection.status) : isConnected ? "Active" : "Not connected");
  const statusColor =
    connection.statusColor ||
    (statusBadge.toLowerCase().includes("expired") ? "red" : isConnected ? "green" : "red");
  const isExpired =
    statusColor === "red" ||
    statusBadge.toLowerCase().includes("expired") ||
    Boolean(connection.showReconnectButton) ||
    Boolean(connection.expiryInfo?.accessToken?.isExpired);
  const showReconnect = Boolean(connection.showReconnectButton || isExpired);
  const accountEmail =
    connection.account?.email ||
    connection.accountEmail ||
    (typeof connection.account === "string" ? connection.account : "") ||
    "";
  const timestamps = connection.timestamps || {};
  const message =
    connection.message ||
    (isExpired
      ? "Your AliExpress connection has expired. Please reconnect your account to continue dropshipping."
      : "");
  const hasAccount = Boolean(isConnected || accountEmail);
  const cleanStatusBadge = String(statusBadge || "")
    .replace(/^[^a-zA-Z0-9]+/, "")
    .trim();
  const badgeText =
    cleanStatusBadge ||
    (isExpired ? "Expired" : isConnected ? "Active" : "Not connected");

  const connect = async () => {
    try {
      setFeedback({ busy: true, error: "", success: "" });
      if (!isConnected && !accountEmail) {
        if (!account.trim()) {
          throw new Error("Enter the AliExpress account email before connecting.");
        }
        await adminApi.registerDropshipAccount(account.trim());
      }
      const result = await adminApi.dropshipAuth();
      const url = result.authUrl || result.data?.authUrl;
      if (url) window.location.assign(url);
      else throw new Error("AliExpress did not return an authorization link.");
    } catch (error) {
      setFeedback({ busy: false, error: error.message, success: "" });
    }
  };
  const importProduct = async (product) => {
    if (!storeRows.length)
      return setFeedback({
        busy: false,
        error: "Create a KuduMart store before importing a product.",
        success: "",
      });
    setImporting(product);
  };
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">DROPSHIPPING CATALOG</span>
          <h1>AliExpress products</h1>
          <p>
            Check the connection, search the supplier catalog, and import
            products into a KuduMart store.
          </p>
        </div>
      </div>
      {feedback.error && <p className="admin-error">{feedback.error}</p>}
      {feedback.success && <p className="admin-success">{feedback.success}</p>}

      <section className="admin-card admin-dropship-card">
        <div className="admin-card__head">
          <h2>AliExpress Account Details</h2>
          {hasAccount && showReconnect ? (
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              loading={feedback.busy}
              onClick={connect}
            >
              Reconnect Account
            </Button>
          ) : !isConnected && !hasAccount ? (
            <Button
              variant="primary"
              size="sm"
              icon={ExternalLink}
              loading={feedback.busy}
              onClick={connect}
            >
              Add Account
            </Button>
          ) : null}
        </div>

        {credentials.loading ? (
          <Skeleton className="admin-table-skeleton" style={{ height: 140 }} />
        ) : hasAccount ? (
          <div className="admin-dropship-details">
            {accountEmail && (
              <div className="admin-dropship-line">
                <span className="admin-dropship-label">Account Email:</span>
                <span className="admin-dropship-value">{accountEmail}</span>
              </div>
            )}
            <div className="admin-dropship-line">
              <span className="admin-dropship-label">Status:</span>
              <span className={`admin-dropship-badge admin-dropship-badge--${statusColor}`}>
                {badgeText}
              </span>
            </div>
            {message && <p className="admin-dropship-message">{message}</p>}

            {(timestamps.connectedAt || timestamps.lastUpdated) && (
              <>
                <div className="admin-dropship-divider">
                  <span>Timestamps</span>
                </div>
                <div className="admin-dropship-timestamps">
                  <div>
                    <span className="admin-dropship-sublabel">Connected At:</span>
                    <span className="admin-dropship-subvalue">
                      {timestamps.connectedAt || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="admin-dropship-sublabel">Last Updated:</span>
                    <span className="admin-dropship-subvalue">
                      {timestamps.lastUpdated || "—"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="admin-dropship-empty">
            <div className="admin-dropship-info-box">
              <AlertCircle size={20} />
              <span>
                No AliExpress account connected. Please add an account to get started.
              </span>
            </div>
            <label className="admin-specialist-account">
              AliExpress account email
              <input
                type="email"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="account@example.com"
                autoComplete="email"
              />
              <small>
                This must match the AliExpress account you authorize on the next
                screen.
              </small>
            </label>
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2>Supplier catalog</h2>
            <p style={{ color: "#7c8ca3", fontSize: "14px", margin: "4px 0 0" }}>
              Search the supplier catalog and import products into a KuduMart store.
            </p>
          </div>
        </div>

        {isExpired && (
          <div className="admin-dropship-warning-callout">
            <AlertTriangle size={18} />
            <span>
              Your AliExpress connection has expired. Please reconnect your account above to search live products and import them.
            </span>
          </div>
        )}

        <form
          className="admin-filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ ...filters });
          }}
        >
          <input
            value={filters.keywords}
            onChange={(e) =>
              setFilters({ ...filters, keywords: e.target.value })
            }
            placeholder="Search supplier products"
            required
          />
          <select
            value={filters.categoryId}
            onChange={(e) =>
              setFilters({ ...filters, categoryId: e.target.value })
            }
          >
            <option value="">All AliExpress categories</option>
            {categoryRows.map((item) => (
              <option
                value={item.id || item.categoryId || item.category_id}
                key={item.id || item.categoryId || item.category_id}
              >
                {item.name || item.categoryName || item.category_name}
              </option>
            ))}
          </select>
          <Button type="submit" icon={PackageSearch}>
            Search
          </Button>
        </form>
        {products.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : items.length ? (
          <div className="admin-content-list">
            {items.map((item, index) => (
              <article key={item.productId || item.id || index}>
                <div className="admin-content-list__image">
                  {item.image || item.productMainImageUrl || item.itemMainPic ? (
                    <img
                      src={item.image || item.productMainImageUrl || item.itemMainPic}
                      alt=""
                    />
                  ) : (
                    <PackageSearch />
                  )}
                </div>
                <div>
                  <strong>
                    {item.title || item.productTitle || item.name}
                  </strong>
                  <small>
                    {item.price ||
                      item.targetSalePrice ||
                      item.salePrice ||
                      "Supplier price unavailable"}
                  </small>
                </div>
                <span className="admin-status">Supplier</span>
                <div className="admin-ops-actions">
                  <button onClick={() => importProduct(item)}>Import</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              query
                ? "No supplier products found"
                : "Search the supplier catalog"
            }
            description={
              query
                ? "Try different keywords or another category."
                : "Enter a product name to begin."
            }
          />
        )}
      </section>
      {importing && (
        <ImportEditor
          product={importing}
          stores={storeRows}
          categories={kuduCategoryRows}
          busy={feedback.busy}
          onClose={() => setImporting(null)}
          onSave={async (body) => {
            setFeedback({ busy: true, error: "", success: "" });
            try {
              await adminApi.importDropshipProduct(body);
              setImporting(null);
              setFeedback({
                busy: false,
                error: "",
                success: "Product imported successfully.",
              });
            } catch (error) {
              setFeedback({ busy: false, error: error.message, success: "" });
            }
          }}
        />
      )}
    </>
  );
}
function ImportEditor({ product, stores, categories, busy, onClose, onSave }) {
  const [form, setForm] = useState({
    productId: product.productId || product.itemId || product.id,
    shippingCountry: "NG",
    currency: "NGN",
    storeId: stores[0]?.id || "",
    categoryId: "",
    priceIncrementPercent: 20,
  });
  return (
    <Modal title="Import supplier product" onClose={onClose}>
      <form
        className="admin-content-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <p>
          <strong>
            {product.title || product.productTitle || product.name}
          </strong>
        </p>
        <label>
          KuduMart store
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            required
          >
            {stores.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name || item.storeName}
              </option>
            ))}
          </select>
        </label>
        <label>
          KuduMart category
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option
                value={item.id || item.categoryId}
                key={item.id || item.categoryId}
              >
                {item.name || item.categoryName || item.category_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price markup (%)
          <input
            type="number"
            min="0"
            value={form.priceIncrementPercent}
            onChange={(e) =>
              setForm({
                ...form,
                priceIncrementPercent: Number(e.target.value),
              })
            }
            required
          />
        </label>
        <div className="admin-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Import product
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AliExpressCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    if (!code) {
      setState({ loading: false, error: "AliExpress did not return an authorization code." });
      return () => controller.abort();
    }
    adminApi
      .completeDropshipAuth(code, controller.signal)
      .then(() => setState({ loading: false, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ loading: false, error: error.message });
        }
      });
    return () => controller.abort();
  }, [code]);

  return (
    <main className="oauth-result-page">
      <section className="oauth-result-card">
        {state.loading ? (
          <>
            <span className="spinner" />
            <h1>Connecting AliExpress…</h1>
            <p>Please wait while we securely finish the authorization.</p>
          </>
        ) : state.error ? (
          <>
            <AlertCircle className="oauth-result-icon oauth-result-icon--error" />
            <h1>Connection unsuccessful</h1>
            <p>{state.error}</p>
            <Button onClick={() => navigate("/admin/dropshipping", { replace: true })}>
              Return to dropshipping
            </Button>
          </>
        ) : (
          <>
            <CheckCircle2 className="oauth-result-icon" />
            <h1>AliExpress connected</h1>
            <p>The supplier catalog and product importing tools are now ready.</p>
            <Button onClick={() => navigate("/admin/dropshipping", { replace: true })}>
              Continue to dropshipping
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
