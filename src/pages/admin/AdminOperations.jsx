import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, MapPin, Megaphone, Plus, Search, Store, Trash2, Truck, Wrench } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { Button, ConfirmModal, EmptyState, Modal, SelectField, Skeleton, TextField } from '../../components/ui';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useResource } from '../../hooks/useResource';
import { useApp } from '../../contexts/AppContext';
import { DeliveryRuleFields, countries, arrivalOptions } from '../seller/StoreHoursDelivery';

const rowsFrom = payload => (Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);
const personName = person => [person?.firstName, person?.lastName].filter(Boolean).join(' ') || person?.businessName || person?.email || 'Administrator';
const displayStatus = value => String(value || 'pending').replaceAll('_', ' ');
const goodStatus = value => ['active', 'approved', 'published', 'completed'].includes(String(value || '').toLowerCase());

function PageHead({ eyebrow, title, description, action }) {
  return (
    <div className="admin-page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Pager({ page, pages, loading, setPage }) {
  return <div className="admin-pagination"><span>{pages ? `Page ${page} of ${pages}` : ''}</span><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outline" disabled={loading || page >= (pages || 1)} onClick={() => setPage(value => value + 1)}>Next</Button></div>;
}

function OperationsToolbar({ query, setQuery, status, setStatus, statuses, extra, clear }) {
  return <div className="admin-product-toolbar"><label className="admin-search-field"><Search size={17}/><input aria-label="Search" placeholder="Search by name" value={query} onChange={event => { setQuery(event.target.value); clear(); }}/></label><select aria-label="Filter status" value={status} onChange={event => { setStatus(event.target.value); clear(); }}><option value="">All statuses</option>{statuses.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select>{extra}</div>;
}

function OperationState({ resource, rows, title, children }) {
  if (resource.loading) return <Skeleton className="admin-table-skeleton"/>;
  if (resource.error) return <div className="admin-error">{resource.error.message}</div>;
  if (!rows.length) return <EmptyState title={`No ${title} found`} description="Try changing the filters or check again later."/>;
  return children;
}

export function AdminStores() {
  const { notify } = useApp();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [revision, setRevision] = useState(0);
  const [storeModal, setStoreModal] = useState(null);
  const [storeModalError, setStoreModalError] = useState("");
  const [deletingStore, setDeletingStore] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const debounced = useDebouncedValue(query.trim(), 350);

  const allResource = useResource(
    (signal) =>
      tab === "all"
        ? adminApi.stores(page, signal, { name: debounced, country })
        : Promise.resolve({ data: [] }),
    [tab, page, debounced, country],
  );

  const myResource = useResource(
    (signal) => adminApi.myStores(signal),
    [revision],
  );

  const resource = tab === "all" ? allResource : myResource;
  const rawRows = rowsFrom(resource.data);

  const rows = useMemo(() => {
    if (tab === "all") return rawRows;
    const term = debounced.toLowerCase();
    return rawRows.filter((item) => {
      const matchName = !term || (item.name || "").toLowerCase().includes(term);
      const matchCountry =
        !country ||
        (item.country || "").toLowerCase().includes(country.toLowerCase());
      return matchName && matchCountry;
    });
  }, [tab, rawRows, debounced, country]);

  const pagination =
    tab === "all"
      ? allResource.data?.pagination || {}
      : { total: rows.length, pages: 1 };

  const handleSaveStore = async (formValues) => {
    setBusy(true);
    setStoreModalError("");
    setFeedback("");
    try {
      const payload = {
        name: formValues.name,
        currencyId: formValues.currencyId,
        location: {
          address: formValues.address,
          city: formValues.city,
          state: formValues.state,
          country: formValues.country,
        },
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        country: formValues.country,
        businessHours: {
          monday_friday: formValues.monday_friday,
          saturday: formValues.saturday,
          sunday: formValues.sunday,
        },
        business_hours: {
          monday_friday: formValues.monday_friday,
          saturday: formValues.saturday,
          sunday: formValues.sunday,
        },
        deliveryOptions: formValues.deliveryOptions || [],
        tipsOnFinding: formValues.tipsOnFinding,
        logo: formValues.logo || "",
      };

      if (storeModal?.item?.id) {
        await adminApi.updateStore({ ...payload, storeId: storeModal.item.id });
        notify("Store updated successfully.", "success");
      } else {
        await adminApi.createStore(payload);
        notify("Store created successfully.", "success");
      }
      setStoreModal(null);
      setStoreModalError("");
      setRevision((v) => v + 1);
    } catch (err) {
      const msg = err.message || "Failed to save store.";
      setStoreModalError(msg);
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!deletingStore) return;
    setBusy(true);
    setFeedback("");
    try {
      await adminApi.deleteStore(deletingStore.id);
      notify("Store deleted successfully.", "success");
      setDeletingStore(null);
      setRevision((v) => v + 1);
    } catch (err) {
      const msg = err.message || "Failed to delete store.";
      notify(msg, "error");
      setFeedback(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="MARKETPLACE LOCATIONS"
        title="Stores"
        description={
          tab === "all"
            ? `${Number(pagination.total || rows.length).toLocaleString()} marketplace stores`
            : `${rows.length} stores created by administrator`
        }
        action={
          <Button
            icon={Plus}
            onClick={() => {
              setStoreModalError("");
              setStoreModal({ open: true, item: null });
            }}
          >
            Create a store
          </Button>
        }
      />

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
          <Store size={16} /> All stores
        </button>
        <button
          type="button"
          className={tab === "my" ? "active" : ""}
          onClick={() => {
            setTab("my");
            setPage(1);
          }}
        >
          <Store size={16} /> My stores ({rowsFrom(myResource.data).length || 0})
        </button>
      </div>

      <section className="admin-card">
        <div className="admin-product-toolbar">
          <label className="admin-search-field">
            <Search size={17} />
            <input
              aria-label="Search stores"
              placeholder="Search store name"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <input
            aria-label="Filter country"
            placeholder="Country"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <OperationState resource={resource} rows={rows} title="stores">
          <div className="admin-ops-list">
            {rows.map((item) => (
              <article className="admin-ops-row" key={item.id}>
                <div className="admin-ops-icon">
                  <Store size={21} />
                </div>
                <div>
                  <strong>{item.name || "Untitled store"}</strong>
                  <small>
                    {item.address ||
                      [item.city, item.state, item.country]
                        .filter(Boolean)
                        .join(", ") ||
                      "Location unavailable"}
                  </small>
                </div>
                <div>
                  <span>Owner</span>
                  <strong>{personName(item.vendor || item.admin)}</strong>
                </div>
                <div>
                  <span>Catalogue</span>
                  <strong>
                    {Number(item.totalProducts || 0).toLocaleString()} products ·{" "}
                    {Number(item.totalAuctionProducts || 0).toLocaleString()} auctions
                  </strong>
                </div>
                <span
                  className={`admin-status ${item.status === "active" ? "admin-status--good" : ""}`}
                >
                  {displayStatus(item.status || "active")}
                </span>
                {tab === "my" && (
                  <div className="admin-ops-actions">
                    <button
                      onClick={() => {
                        setStoreModalError("");
                        setStoreModal({ open: true, item });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => setDeletingStore(item)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </OperationState>

        {tab === "all" && (
          <Pager
            page={page}
            pages={pagination.pages}
            loading={resource.loading}
            setPage={setPage}
          />
        )}
      </section>

      {storeModal && (
        <AdminStoreModal
          item={storeModal.item}
          busy={busy}
          error={storeModalError}
          onClose={() => {
            setStoreModal(null);
            setStoreModalError("");
          }}
          onSave={handleSaveStore}
        />
      )}

      {deletingStore && (
        <ConfirmModal
          title={`Delete “${deletingStore.name}”?`}
          description="This store will be permanently removed. Products assigned to this store will no longer be visible."
          confirmLabel="Delete store"
          tone="danger"
          loading={busy}
          onClose={() => setDeletingStore(null)}
          onConfirm={handleDeleteStore}
        />
      )}
    </>
  );
}

function AdminStoreModal({ item, busy, error, onClose, onSave }) {
  const { notify } = useApp();
  const currenciesResource = useResource(
    (signal) => adminApi.currencies(signal),
    [],
  );
  const currencyList = Array.isArray(currenciesResource.data?.data)
    ? currenciesResource.data.data
    : Array.isArray(currenciesResource.data)
      ? currenciesResource.data
      : [];

  const [form, setForm] = useState({
    name: item?.name || "",
    currencyId: item?.currencyId || item?.currency?.id || "",
    address: item?.address || item?.location?.address || "",
    city: item?.city || item?.location?.city || "",
    state: item?.state || item?.location?.state || "",
    country: item?.country || item?.location?.country || "Nigeria",
    tipsOnFinding: item?.tipsOnFinding || "",
    monday_friday:
      item?.business_hours?.monday_friday ||
      item?.businessHours?.monday_friday ||
      "9:00 AM – 6:00 PM",
    saturday:
      item?.business_hours?.saturday ||
      item?.businessHours?.saturday ||
      "10:00 AM – 4:00 PM",
    sunday:
      item?.business_hours?.sunday ||
      item?.businessHours?.sunday ||
      "Closed",
  });

  const [localError, setLocalError] = useState("");

  const initialDelivery = useMemo(() => {
    if (Array.isArray(item?.deliveryOptions) && item.deliveryOptions.length) {
      return item.deliveryOptions.map((opt) => ({
        scope:
          opt.scope ||
          (opt.state && !opt.city
            ? "state"
            : opt.city === opt.country
              ? "country"
              : "city"),
        country: opt.country || "Nigeria",
        countryCode:
          opt.countryCode ||
          countries.find((c) => c.name === opt.country)?.code ||
          "NG",
        state: opt.state || "",
        stateCode: opt.stateCode || "",
        city: opt.city || "",
        price: opt.price !== undefined ? String(opt.price) : "",
        arrival_day: opt.arrival_day || "",
      }));
    }
    return [
      {
        scope: "city",
        country: "Nigeria",
        countryCode: "NG",
        state: "",
        stateCode: "",
        city: item?.location?.city || item?.city || "",
        price: "1500",
        arrival_day: "2–3 days",
      },
    ];
  }, [item]);

  const [deliveryOptions, setDeliveryOptions] = useState(initialDelivery);

  // Auto-select currency if none selected
  useEffect(() => {
    if (!form.currencyId && currencyList.length) {
      const defaultCur =
        currencyList.find(
          (c) =>
            (c.code || "").toUpperCase() === "NGN" ||
            (c.name || "").toLowerCase().includes("naira"),
        ) || currencyList[0];
      if (defaultCur) {
        setForm((f) => ({ ...f, currencyId: defaultCur.id }));
      }
    }
  }, [currencyList, form.currencyId]);

  const updateDelivery = (index, field, value) => {
    setDeliveryOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex === index
          ? {
              ...option,
              ...(typeof field === "object" ? field : { [field]: value }),
            }
          : option,
      ),
    );
  };

  const addDelivery = () => {
    setDeliveryOptions((current) => [
      ...current,
      {
        scope: "city",
        country: form.country || "Nigeria",
        countryCode:
          countries.find((c) => c.name === form.country)?.code || "NG",
        state: "",
        stateCode: "",
        city: "",
        price: "",
        arrival_day: "2–3 days",
      },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!form.currencyId) {
      const msg = "Please select a store currency.";
      setLocalError(msg);
      notify(msg, "error");
      return;
    }

    const normalizedDelivery = deliveryOptions.map((option) => ({
      scope: option.scope || "city",
      country: option.country || form.country || "Nigeria",
      countryCode: option.countryCode || "",
      state: option.state || "",
      stateCode: option.stateCode || "",
      city: String(
        option.scope === "country"
          ? option.country || form.country || "Nigeria"
          : option.scope === "state"
            ? option.state || ""
            : option.city || "",
      ).trim(),
      price: Number(option.price),
      arrival_day: String(option.arrival_day || "").trim(),
    }));

    if (
      !normalizedDelivery.length ||
      normalizedDelivery.some(
        (opt) =>
          !opt.city ||
          !Number.isFinite(opt.price) ||
          opt.price < 0 ||
          !opt.arrival_day,
      )
    ) {
      const msg =
        "Add at least one complete delivery rule with coverage area, fee, and arrival time.";
      setLocalError(msg);
      notify(msg, "error");
      return;
    }

    onSave({ ...form, deliveryOptions: normalizedDelivery });
  };

  const activeError = error || localError;

  return (
    <Modal
      className="modal--wide"
      title={item ? "Edit store" : "Create a store"}
      onClose={onClose}
    >
      <form className="admin-content-form" onSubmit={handleSubmit}>
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

        <label>
          Store name *
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Official store name"
            required
          />
        </label>

        <div className="admin-form-row">
          <label>
            Currency *
            <select
              value={form.currencyId}
              onChange={(e) => setForm({ ...form, currencyId: e.target.value })}
              required
            >
              <option value="">
                {currenciesResource.loading
                  ? "Loading currencies…"
                  : "Choose currency"}
              </option>
              {currencyList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.code} ({c.symbol || c.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Country *
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. Nigeria"
              required
            />
          </label>
        </div>

        <div className="admin-form-row">
          <label>
            State / Region *
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="e.g. Lagos"
              required
            />
          </label>
          <label>
            City *
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Ikeja"
              required
            />
          </label>
        </div>

        <label>
          Street address *
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Physical pickup or warehouse address"
            required
          />
        </label>

        <label>
          Tips on finding (optional)
          <input
            value={form.tipsOnFinding}
            onChange={(e) =>
              setForm({ ...form, tipsOnFinding: e.target.value })
            }
            placeholder="Landmarks, suite numbers, gate instructions"
          />
        </label>

        {/* DELIVERY AREAS - PARITY WITH VENDOR STORE SETUP */}
        <div
          className="seller-delivery-section"
          style={{
            borderTop: "1px solid #e9edf1",
            paddingTop: 18,
            marginTop: 10,
          }}
        >
          <div className="seller-section-title" style={{ marginBottom: 14 }}>
            <span className="seller-section-icon">
              <Truck size={20} />
            </span>
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>
                Delivery areas <span aria-hidden="true">*</span>
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "#748092",
                }}
              >
                Add at least one city, state, or countrywide rule. Checkout uses
                these rules to calculate the fee.
              </p>
            </div>
          </div>

          {deliveryOptions.length ? (
            <div className="seller-delivery-list">
              {deliveryOptions.map((option, index) => (
                <div className="seller-delivery-card" key={index}>
                  <div className="seller-delivery-card__head">
                    <strong>
                      <MapPin size={16} /> Delivery rule {index + 1}
                    </strong>
                    {deliveryOptions.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove delivery rule ${index + 1}`}
                        onClick={() =>
                          setDeliveryOptions((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="seller-delivery-card__fields">
                    <DeliveryRuleFields
                      option={option}
                      onPatch={(patch) => updateDelivery(index, patch)}
                    />
                    <TextField
                      label="Delivery fee (₦)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0 for free"
                      required
                      value={option.price ?? ""}
                      onChange={(event) =>
                        updateDelivery(index, "price", event.target.value)
                      }
                    />
                    <SelectField
                      label="Estimated arrival"
                      required
                      value={option.arrival_day || ""}
                      onChange={(event) =>
                        updateDelivery(index, "arrival_day", event.target.value)
                      }
                    >
                      <option value="">Choose a timeframe</option>
                      {option.arrival_day &&
                        !arrivalOptions.includes(option.arrival_day) && (
                          <option value={option.arrival_day}>
                            {option.arrival_day}
                          </option>
                        )}
                      {arrivalOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="seller-delivery-empty">
              <MapPin size={20} />
              <span>
                <strong>No delivery areas added yet.</strong>
                <small>
                  Delivery checkout cannot calculate a fee until you add an
                  area.
                </small>
              </span>
            </div>
          )}

          <button
            className="seller-add-delivery"
            type="button"
            onClick={addDelivery}
          >
            <Plus size={17} /> Add delivery area
          </button>
        </div>

        {/* BUSINESS HOURS */}
        <div style={{ borderTop: "1px solid #e9edf1", paddingTop: 16 }}>
          <strong
            style={{
              fontSize: 13,
              color: "#172541",
              display: "block",
              marginBottom: 10,
            }}
          >
            Business Hours
          </strong>
          <label>
            Monday – Friday
            <input
              value={form.monday_friday}
              onChange={(e) =>
                setForm({ ...form, monday_friday: e.target.value })
              }
              placeholder="9:00 AM – 6:00 PM"
            />
          </label>

          <div className="admin-form-row" style={{ marginTop: 10 }}>
            <label>
              Saturday hours
              <input
                value={form.saturday}
                onChange={(e) => setForm({ ...form, saturday: e.target.value })}
                placeholder="10:00 AM – 4:00 PM"
              />
            </label>
            <label>
              Sunday hours
              <input
                value={form.sunday}
                onChange={(e) => setForm({ ...form, sunday: e.target.value })}
                placeholder="Closed"
              />
            </label>
          </div>
        </div>

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
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {item ? "Update store" : "Create store"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminAuctions() {
  const [page, setPage] = useState(1); const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [revision, setRevision] = useState(0); const [action, setAction] = useState(null); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState('');
  const debounced = useDebouncedValue(query.trim(), 350);
  const resource = useResource(signal => adminApi.auctions(page, signal, { name: debounced, status }), [page, debounced, status, revision]);
  const rows = rowsFrom(resource.data); const pagination = resource.data?.pagination || {};
  const execute = async () => { setBusy(true); setFeedback(''); try { if (action.type === 'delete') await adminApi.deleteAuction(action.item.id); else await adminApi.setAuctionStatus(action.item.id, action.status); setFeedback(action.type === 'delete' ? 'Auction deleted.' : 'Auction status updated.'); setAction(null); setRevision(value => value + 1); } catch (error) { setFeedback(error.message); } finally { setBusy(false); } };
  return <><PageHead eyebrow="BIDDING CONTROL" title="Auctions" description={`${Number(pagination.total || rows.length).toLocaleString()} auction listings`}/>{feedback && <div className={feedback.includes('updated') || feedback.includes('deleted') ? 'admin-success' : 'admin-error'}>{feedback}</div>}<section className="admin-card"><OperationsToolbar query={query} setQuery={setQuery} status={status} setStatus={setStatus} clear={() => setPage(1)} statuses={[{value:'upcoming',label:'Upcoming'},{value:'ongoing',label:'Ongoing'},{value:'ended',label:'Ended'},{value:'cancelled',label:'Cancelled'}]}/><OperationState resource={resource} rows={rows} title="auctions"><div className="admin-ops-list">{rows.map(item => { const auctionStatus = item.auctionStatus || item.status; return <article className="admin-ops-row" key={item.id}><div className="admin-ops-image">{item.image_url || item.image ? <img src={item.image_url || item.image} alt=""/> : <Box size={21}/>}</div><div><strong>{item.name || item.title || 'Untitled auction'}</strong><small>{item.sku || 'No SKU'} · {displayStatus(item.condition)}</small></div><div><span>Seller</span><strong>{personName(item.vendor || item.admin)}</strong></div><div><span>Current price</span><strong>{item.store?.currency?.symbol || '₦'}{Number(item.currentPrice || item.price || item.startingPrice || 0).toLocaleString()}</strong></div><span className={`admin-status ${['ongoing','upcoming'].includes(auctionStatus) ? 'admin-status--good' : ''}`}>{displayStatus(auctionStatus)}</span><div className="admin-ops-actions"><Link to={`/admin/auctions/${item.id}`}>Monitor</Link>{!['ended','cancelled'].includes(auctionStatus) && <button onClick={() => setAction({ type:'status', item, status:'cancelled' })}>Cancel</button>}<button className="danger" onClick={() => setAction({ type:'delete', item })}>Delete</button></div></article>; })}</div></OperationState><Pager page={page} pages={pagination.pages} loading={resource.loading} setPage={setPage}/></section>{action && <ConfirmModal title={action.type === 'delete' ? 'Delete auction?' : 'Cancel auction?'} description={action.type === 'delete' ? 'This permanently removes the auction listing.' : 'Customers will no longer be able to bid.'} confirmLabel={action.type === 'delete' ? 'Delete auction' : 'Cancel auction'} tone="danger" loading={busy} onClose={() => setAction(null)} onConfirm={execute}/>}</>;
}

export function AdminAuctionMonitor() {
  const id = window.location.pathname.split('/').pop();
  const auction = useResource(signal => adminApi.auction(id, signal), [id]);
  const bids = useResource(signal => adminApi.auctionBidders(id, signal), [id]);
  const item = auction.data?.data || auction.data; const bidRows = rowsFrom(bids.data);
  return <><Link className="admin-review-back" to="/admin/auctions">← Back to auctions</Link><PageHead eyebrow="LIVE BIDDING MONITOR" title={item?.name || 'Auction activity'} description={item ? `${displayStatus(item.auctionStatus)} · ${item.startDate ? new Date(item.startDate).toLocaleString() : 'Start unavailable'} to ${item.endDate ? new Date(item.endDate).toLocaleString() : 'end unavailable'}` : 'Loading auction activity'}/><section className="admin-card">{auction.loading || bids.loading ? <Skeleton className="admin-table-skeleton"/> : auction.error || bids.error ? <div className="admin-error">{auction.error?.message || bids.error?.message}</div> : bidRows.length ? <div className="admin-bid-list">{bidRows.map(bid => <article key={bid.id}><strong>{personName(bid.user)}</strong><span>{item?.store?.currency?.symbol || '₦'}{Number(bid.bidAmount || bid.amount || 0).toLocaleString()}</span><small>{bid.createdAt ? new Date(bid.createdAt).toLocaleString() : '—'}</small></article>)}</div> : <EmptyState title="No bids yet" description="Bids will appear here as customers participate."/>}</section></>;
}

export function AdminAdverts() {
  const [page, setPage] = useState(1); const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [revision, setRevision] = useState(0); const [action, setAction] = useState(null); const [note, setNote] = useState(''); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState('');
  const debounced = useDebouncedValue(query.trim(), 350);
  const resource = useResource(signal => adminApi.adverts(page, signal, { search: debounced, status }), [page, debounced, status, revision]);
  const rows = rowsFrom(resource.data); const pagination = resource.data?.pagination || {};
  const execute = async () => { setBusy(true); setFeedback(''); try { if (action.type === 'delete') await adminApi.deleteAdvert(action.item.id); else await adminApi.reviewAdvert(action.item.id, action.status, note.trim()); setFeedback(action.type === 'delete' ? 'Advert deleted.' : `Advert ${action.status}.`); setAction(null); setNote(''); setRevision(value => value + 1); } catch (error) { setFeedback(error.message); } finally { setBusy(false); } };
  return <><PageHead eyebrow="CAMPAIGN REVIEW" title="Adverts" description={`${Number(pagination.total || rows.length).toLocaleString()} advertising campaigns`}/>{feedback && <div className={feedback.includes('Advert ') && !feedback.toLowerCase().includes('failed') ? 'admin-success' : 'admin-error'}>{feedback}</div>}<section className="admin-card"><OperationsToolbar query={query} setQuery={setQuery} status={status} setStatus={setStatus} clear={() => setPage(1)} statuses={[{value:'pending',label:'Pending review'},{value:'approved',label:'Approved'},{value:'rejected',label:'Rejected'}]}/><OperationState resource={resource} rows={rows} title="adverts"><div className="admin-ops-list">{rows.map(item => <article className="admin-ops-row" key={item.id}><div className="admin-ops-image">{item.image_url || item.image ? <img src={item.image_url || item.image} alt=""/> : <Megaphone size={21}/>}</div><div><strong>{item.title || item.name || item.product?.name || 'Untitled advert'}</strong><small>{item.type || item.placement || 'Marketplace advert'}</small></div><div><span>Advertiser</span><strong>{personName(item.vendor || item.admin)}</strong></div><div><span>Schedule</span><strong>{item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'} – {item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}</strong></div><span className={`admin-status ${goodStatus(item.status) ? 'admin-status--good' : ''}`}>{displayStatus(item.status)}</span><div className="admin-ops-actions"><button onClick={() => setAction({ type:'review', item, status:'approved' })}>Approve</button><button onClick={() => setAction({ type:'review', item, status:'rejected' })}>Reject</button><button className="danger" onClick={() => setAction({ type:'delete', item })}>Delete</button></div></article>)}</div></OperationState><Pager page={page} pages={pagination.pages} loading={resource.loading} setPage={setPage}/></section>{action?.type === 'delete' ? <ConfirmModal title="Delete advert?" description="This permanently removes the advertising campaign." confirmLabel="Delete advert" loading={busy} onClose={() => setAction(null)} onConfirm={execute}/> : action && <Modal title={`${action.status === 'approved' ? 'Approve' : 'Reject'} advert`} onClose={() => !busy && setAction(null)} footer={<><Button variant="ghost" disabled={busy} onClick={() => setAction(null)}>Cancel</Button><Button loading={busy} disabled={action.status === 'rejected' && !note.trim()} onClick={execute}>Submit decision</Button></>}><div className="admin-review-note"><p>{action.status === 'rejected' ? 'Tell the advertiser what must be corrected before resubmission.' : 'You may include an optional internal note.'}</p><textarea aria-label="Review note" value={note} onChange={event => setNote(event.target.value)} placeholder="Review note"/></div></Modal>}</>;
}

export function AdminServices() {
  const [page, setPage] = useState(1); const [status, setStatus] = useState(''); const [categoryId, setCategoryId] = useState(''); const [revision, setRevision] = useState(0); const [action, setAction] = useState(null); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState('');
  const categoriesResource = useResource(signal => adminApi.serviceCategories(signal), []); const categories = rowsFrom(categoriesResource.data);
  const resource = useResource(signal => adminApi.services(page, signal, { status, categoryId }), [page, status, categoryId, revision]); const rows = rowsFrom(resource.data); const pagination = resource.data?.pagination || {};
  const execute = async () => { setBusy(true); setFeedback(''); try { await adminApi.setServiceStatus(action.item.id, action.active); setFeedback(`Service ${action.active ? 'activated' : 'suspended'}.`); setAction(null); setRevision(value => value + 1); } catch (error) { setFeedback(error.message); } finally { setBusy(false); } };
  return <><PageHead eyebrow="SERVICE MARKETPLACE" title="Services" description={`${Number(pagination.total || rows.length).toLocaleString()} service listings`}/>{feedback && <div className={feedback.includes('Service ') ? 'admin-success' : 'admin-error'}>{feedback}</div>}<section className="admin-card"><div className="admin-product-toolbar"><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="pending">Pending</option></select><select value={categoryId} onChange={event => { setCategoryId(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div><OperationState resource={resource} rows={rows} title="services"><div className="admin-ops-list">{rows.map(item => <article className="admin-ops-row" key={item.id}><div className="admin-ops-image">{item.image_url || item.image ? <img src={item.image_url || item.image} alt=""/> : <Wrench size={21}/>}</div><div><strong>{item.title || item.name || 'Untitled service'}</strong><small>{item.category?.name || 'Uncategorised'}{item.subCategory?.name ? ` · ${item.subCategory.name}` : ''}</small></div><div><span>Provider</span><strong>{personName(item.provider || item.vendor || item.user)}</strong></div><div><span>Price</span><strong>₦{Number(item.price || item.startingPrice || 0).toLocaleString()}</strong></div><span className={`admin-status ${goodStatus(item.status) ? 'admin-status--good' : ''}`}>{displayStatus(item.status)}</span><div className="admin-ops-actions"><button onClick={() => setAction({ item, active: !goodStatus(item.status) })}>{goodStatus(item.status) ? 'Suspend' : 'Activate'}</button></div></article>)}</div></OperationState><Pager page={page} pages={pagination.pages} loading={resource.loading} setPage={setPage}/></section>{action && <ConfirmModal title={`${action.active ? 'Activate' : 'Suspend'} service?`} description="The provider and customers will immediately see the updated availability." confirmLabel="Confirm change" tone="warning" loading={busy} onClose={() => setAction(null)} onConfirm={execute}/>}</>;
}
