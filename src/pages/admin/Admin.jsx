import { useState } from 'react';
import { ArrowLeft, BarChart3, Box, ClipboardCheck, CreditCard, LogOut, Menu, Package, Store, Users, X } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { adminApi, adminSession } from '../../api/admin';
import { Button, EmptyState, Skeleton, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Box },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/verification', label: 'Verification', icon: ClipboardCheck },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
];
const rowsFrom = payload => Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
const totalFrom = (payload, name) => payload?.meta?.[name] ?? payload?.pagination?.total ?? rowsFrom(payload).length;

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (adminSession.get()) return <Navigate to="/admin" replace/>;
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await adminApi.login({ email, password }); navigate('/admin', { replace: true }); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  return <main className="admin-login"><div className="admin-login__visual"><Link to="/"><img src="/kudumart-logo.png" alt="KuduMart"/></Link><div><span className="eyebrow">KUDUMART OPERATIONS</span><h1>One clear view of your marketplace.</h1><p>Manage the people, products, and orders behind every great find.</p></div></div><div className="admin-login__form"><div className="admin-login__card"><span className="eyebrow">ADMIN ACCESS</span><h2>Welcome back.</h2><p>Sign in to continue to your workspace.</p><form onSubmit={submit}><TextField label="Email address" type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required/><TextField label="Password" type="password" name="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required/>{error && <div className="form-alert" role="alert">{error}</div>}<Button type="submit" loading={busy}>Sign in to dashboard</Button></form><Link className="back-link" to="/">← Back to marketplace</Link></div></div></main>;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!adminSession.get()) return <Navigate to="/auth/admin/login" replace/>;
  return <div className="admin-shell"><aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}><div className="admin-sidebar__brand"><Link to="/admin"><img src="/kudumart-logo.png" alt="KuduMart"/><span>Admin Studio</span></Link><button aria-label="Close menu" onClick={() => setOpen(false)}><X size={20}/></button></div><p className="admin-sidebar__label">WORKSPACE</p><nav aria-label="Admin workspace">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `admin-nav ${isActive ? 'active' : ''}`}><Icon size={19}/>{label}</NavLink>)}</nav><div className="admin-sidebar__bottom"><button onClick={() => { adminSession.clear(); navigate('/auth/admin/login', { replace: true }); }}><LogOut size={18}/> Sign out</button><Link to="/">View marketplace ↗</Link></div></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={22}/></button><strong>Admin Studio</strong><Link to="/">View marketplace ↗</Link></header><main className="admin-content"><Outlet/></main></div>{open && <button className="admin-backdrop" aria-label="Close menu" onClick={() => setOpen(false)}/>}</div>;
}

function AdminTable({ rows, kind, compact = false }) {
  if (!rows.length) return <EmptyState title={`No ${kind} to show`} description="New entries will appear here as they arrive."/>;
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{kind === 'products' ? 'Product' : kind === 'orders' ? 'Order' : 'Name'}</th><th>{kind === 'products' ? 'Store' : kind === 'orders' ? 'Customer' : 'Email'}</th><th>Status</th>{!compact && <th>Created</th>}{kind === 'vendors' && !compact && <th/>}</tr></thead><tbody>{rows.map((item, index) => <tr key={item.id || index}><td><strong>{item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || item.refId || item.title || 'Untitled'}</strong></td><td>{item.email || item.store?.name || item.user?.email || '—'}</td><td><span className={`admin-status ${String(item.status || '').toLowerCase() === 'active' || item.isVerified ? 'admin-status--good' : ''}`}>{item.status || (item.isVerified ? 'Verified' : 'Unverified')}</span></td>{!compact && <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>}{kind === 'vendors' && !compact && <td><Link className="admin-row-action" to={`/admin/vendors/${item.id}`}>Manage →</Link></td>}</tr>)}</tbody></table></div>;
}

export function AdminOverview() {
  const customers = useResource(signal => adminApi.customers(1, signal), []);
  const vendors = useResource(signal => adminApi.vendors(1, signal), []);
  const products = useResource(signal => adminApi.products(1, signal), []);
  const orders = useResource(signal => adminApi.orders(1, signal), []);
  const cards = [
    { label: 'Customers', value: totalFrom(customers.data, 'totalCustomers'), to: '/admin/customers', state: customers, icon: Users },
    { label: 'Vendors', value: totalFrom(vendors.data, 'totalVendors'), to: '/admin/vendors', state: vendors, icon: Store },
    { label: 'Products', value: totalFrom(products.data), to: '/admin/products', state: products, icon: Box },
    { label: 'Orders', value: totalFrom(orders.data), to: '/admin/orders', state: orders, icon: Package },
  ];
  return <><div className="admin-page-head"><div><span className="eyebrow">MARKETPLACE PULSE</span><h1>Good to see you.</h1><p>Here’s what is happening across KuduMart.</p></div><span className="admin-live"><span/> Live data</span></div><div className="admin-stats">{cards.map(({ label, value, to, state, icon: Icon }) => <Link className="admin-stat" to={to} key={label}><span className="admin-stat__icon"><Icon size={22}/></span><span>{label}</span><strong>{state.loading ? '—' : state.error ? 'Unavailable' : Number(value).toLocaleString()}</strong><small>View {label.toLowerCase()} ↗</small></Link>)}</div><div className="admin-overview-grid"><section className="admin-card"><div className="admin-card__head"><div><span className="eyebrow">PEOPLE</span><h2>Recent vendors</h2></div><Link to="/admin/vendors">View all ↗</Link></div>{vendors.loading ? <Skeleton className="admin-table-skeleton"/> : vendors.error ? <p className="admin-error">Vendors could not be loaded. {vendors.error.message}</p> : <AdminTable rows={[...rowsFrom(vendors.data)].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 5)} kind="vendors" compact/>}</section><section className="admin-card admin-quick"><span className="eyebrow">NEXT UP</span><h2>Keep the marketplace moving.</h2><p>Review seller verification, products, and incoming orders from one workspace.</p><Link to="/admin/verification">Review verification ↗</Link><Link to="/admin/orders">See orders ↗</Link></section></div></>;
}

export function AdminList({ kind }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const source = { vendors: adminApi.vendors, customers: adminApi.customers, products: adminApi.products, orders: adminApi.orders }[kind];
  const resource = useResource(signal => source(page, signal), [kind, page]);
  const rows = rowsFrom(resource.data);
  const filtered = rows.filter(item => JSON.stringify([item.name, item.firstName, item.lastName, item.email, item.refId, item.title, item.status]).toLowerCase().includes(query.toLowerCase()));
  const total = totalFrom(resource.data, kind === 'vendors' ? 'totalVendors' : kind === 'customers' ? 'totalCustomers' : undefined);
  return <><div className="admin-page-head"><div><span className="eyebrow">MANAGE {kind.toUpperCase()}</span><h1>{kind[0].toUpperCase() + kind.slice(1)}</h1><p>{resource.error ? 'The list could not be loaded.' : `${Number(total).toLocaleString()} total`}</p></div></div><section className="admin-card"><div className="admin-list-toolbar"><input aria-label={`Search ${kind} on this page`} placeholder={`Search ${kind} on this page`} value={query} onChange={event => setQuery(event.target.value)}/><span>Page {page}</span></div>{resource.loading ? <Skeleton className="admin-table-skeleton"/> : resource.error ? <div className="admin-error" role="alert">{resource.error.message}</div> : <AdminTable rows={filtered} kind={kind}/>}<div className="admin-pagination"><Button variant="outline" disabled={page === 1 || resource.loading} onClick={() => setPage(current => current - 1)}>Previous</Button><Button variant="outline" disabled={resource.loading || !rows.length || (resource.data?.pagination?.pages ? page >= resource.data.pagination.pages : false)} onClick={() => setPage(current => current + 1)}>Next</Button></div></section></>;
}

export function AdminVendorDetail() {
  const { vendorId } = useParams();
  const [refresh, setRefresh] = useState(0);
  const vendorResource = useResource(signal => adminApi.vendor(vendorId, signal), [vendorId, refresh]);
  const plansResource = useResource(signal => adminApi.subscriptionPlans(signal), []);
  const offersResource = useResource(signal => adminApi.vendorOffers(vendorId, signal), [vendorId, refresh]);
  const [form, setForm] = useState({ subscriptionPlanId: '', specialPrice: '0', reason: '', expiresAt: '' });
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState(null);
  const vendor = vendorResource.data?.data;
  const plans = rowsFrom(plansResource.data);
  const offers = offersResource.data?.data?.offers || [];
  const activeSubscription = [...(vendor?.subscriptions || [])].sort((a, b) => Number(b.isActive) - Number(a.isActive) || new Date(b.createdAt) - new Date(a.createdAt)).find(item => item.isActive);
  const run = async (key, action) => { setBusy(key); setFeedback(null); try { const response = await action(); setFeedback({ message: response.message }); setRefresh(value => value + 1); } catch (cause) { setFeedback({ error: true, message: cause.message }); } finally { setBusy(''); } };
  const submitOffer = event => { event.preventDefault(); run('offer', () => adminApi.saveVendorOffer(vendorId, form)); };
  if (vendorResource.loading) return <Skeleton className="admin-vendor-loading"/>;
  if (vendorResource.error || !vendor) return <><Link className="admin-review-back" to="/admin/vendors"><ArrowLeft size={18}/> Back to vendors</Link><div className="admin-error">{vendorResource.error?.message || 'Vendor could not be found.'}</div></>;
  const fullName = [vendor.firstName, vendor.lastName].filter(Boolean).join(' ') || 'Unnamed vendor';
  const reviewStatus = vendor.kyc?.reviewStatus || (vendor.kyc?.isVerified ? 'approved' : 'pending');
  return <><Link className="admin-review-back" to="/admin/vendors"><ArrowLeft size={18}/> Back to vendors</Link><div className="admin-page-head admin-vendor-head"><div><span className="eyebrow">VENDOR MANAGEMENT</span><h1>{fullName}</h1><p>{vendor.email} · Joined {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</p></div><div className="admin-vendor-head__actions"><span className={`admin-status ${vendor.status === 'active' ? 'admin-status--good' : 'admin-status--changes_requested'}`}>{vendor.status || 'inactive'}</span><Button variant={vendor.status === 'active' ? 'danger' : 'primary'} loading={busy === 'status'} onClick={() => run('status', () => adminApi.toggleUserStatus(vendorId))}>{vendor.status === 'active' ? 'Suspend account' : 'Activate account'}</Button></div></div>{feedback && <div className={feedback.error ? 'admin-error admin-vendor-feedback' : 'admin-success admin-vendor-feedback'} role="status">{feedback.message}</div>}<div className="admin-vendor-grid"><section className="admin-card admin-vendor-profile"><div className="admin-card__head"><div><span className="eyebrow">ACCOUNT</span><h2>Vendor profile</h2></div></div><dl><div><dt>Phone</dt><dd>{vendor.phoneNumber || '—'}</dd></div><div><dt>KYC status</dt><dd><span className={`admin-status admin-status--${reviewStatus}`}>{reviewStatus === 'approved' ? 'Verified' : reviewStatus === 'changes_requested' ? 'Changes requested' : 'Under review'}</span></dd></div><div><dt>Stores</dt><dd>{vendor.stores?.length || 0}</dd></div><div><dt>Tracking ID</dt><dd>{vendor.trackingId || '—'}</dd></div></dl>{vendor.kyc && <Link className="admin-inline-link" to="/admin/verification">Open verification workspace →</Link>}</section><section className="admin-card admin-vendor-subscription"><div className="admin-card__head"><div><span className="eyebrow">SUBSCRIPTION</span><h2>Plan and access</h2></div></div>{activeSubscription ? <div className="admin-current-plan"><div><span>Current plan</span><strong>{activeSubscription.subscriptionPlans?.name || 'Subscription plan'}</strong></div><span className="admin-status admin-status--good">Active</span><small>{activeSubscription.endDate ? `Expires ${new Date(activeSubscription.endDate).toLocaleDateString()}` : ''}</small></div> : <div className="admin-empty-inline"><strong>No active paid subscription</strong><span>The vendor is currently using default access.</span></div>}<p className="admin-helper">Set a free waiver or discounted price for this vendor. They will be notified and can claim it from Subscriptions.</p><form className="admin-offer-form" onSubmit={submitOffer}><label>Plan<select value={form.subscriptionPlanId} onChange={event => { const plan = plans.find(item => item.id === event.target.value); setForm(current => ({ ...current, subscriptionPlanId: event.target.value, specialPrice: plan ? String(plan.price) : '0' })); }} required><option value="">Choose a plan</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} — {plan.currency?.symbol || '₦'}{Number(plan.price).toLocaleString()}</option>)}</select></label><div className="admin-offer-form__row"><label>Special price<input type="number" min="0" step="0.01" value={form.specialPrice} onChange={event => setForm(current => ({ ...current, specialPrice: event.target.value }))} required/></label><label>Expires (optional)<input type="datetime-local" value={form.expiresAt} onChange={event => setForm(current => ({ ...current, expiresAt: event.target.value }))}/></label></div><label>Campaign reason<input value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} placeholder="e.g. Launch partner promotion" maxLength="255" required/></label><Button type="submit" loading={busy === 'offer'} disabled={plansResource.loading}>Save vendor offer</Button></form></section></div><section className="admin-card"><div className="admin-card__head"><div><span className="eyebrow">HISTORY</span><h2>Subscription offers</h2></div></div>{offersResource.loading ? <Skeleton className="admin-table-skeleton"/> : !offers.length ? <EmptyState title="No subscription offers" description="Individual waivers and discounts will appear here."/> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plan</th><th>Price</th><th>Reason</th><th>Status</th><th>Expires</th><th/></tr></thead><tbody>{offers.map(offer => { const usable = offer.isActive && !offer.redeemedAt && (!offer.expiresAt || new Date(offer.expiresAt) > new Date()); return <tr key={offer.id}><td><strong>{offer.subscriptionPlan?.name || 'Plan'}</strong></td><td>{offer.subscriptionPlan?.currency?.symbol || '₦'}{Number(offer.specialPrice).toLocaleString()}</td><td>{offer.reason}</td><td><span className={`admin-status ${usable ? 'admin-status--good' : ''}`}>{offer.redeemedAt ? 'Redeemed' : usable ? 'Available' : 'Inactive'}</span></td><td>{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'No expiry'}</td><td>{usable && <button className="admin-row-action admin-row-action--danger" disabled={busy === offer.id} onClick={() => run(offer.id, () => adminApi.revokeVendorOffer(offer.id))}>Revoke</button>}</td></tr>; })}</tbody></table></div>}</section></>;
}

export function AdminSubscriptions() {
  const [refresh, setRefresh] = useState(0);
  const resource = useResource(signal => adminApi.subscriptionPlans(signal), [refresh]);
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState(null);
  const plans = rowsFrom(resource.data);
  const toggle = async plan => { setBusy(plan.id); setFeedback(null); try { const response = await adminApi.setPlanWaiver(plan.id, !plan.isFeeWaived); setFeedback({ message: response.message }); setRefresh(value => value + 1); } catch (cause) { setFeedback({ error: true, message: cause.message }); } finally { setBusy(''); } };
  return <><div className="admin-page-head"><div><span className="eyebrow">REVENUE CONTROLS</span><h1>Subscriptions</h1><p>Manage plan-wide fee waivers for campaigns and marketplace growth.</p></div></div>{feedback && <div className={feedback.error ? 'admin-error admin-vendor-feedback' : 'admin-success admin-vendor-feedback'}>{feedback.message}</div>}<section className="admin-card"><div className="admin-waiver-note"><strong>Plan-wide waivers affect every vendor.</strong><span>Use a vendor’s profile when a waiver or discount should apply to one business only.</span></div>{resource.loading ? <Skeleton className="admin-table-skeleton"/> : resource.error ? <div className="admin-error">{resource.error.message}</div> : <div className="admin-plan-grid">{plans.map(plan => <article className={`admin-plan-card ${plan.isFeeWaived ? 'admin-plan-card--waived' : ''}`} key={plan.id}><div><span className="eyebrow">{plan.duration} DAYS</span><h2>{plan.name}</h2><p>{plan.currency?.symbol || '₦'}{Number(plan.price).toLocaleString()}</p></div><ul><li>{plan.productLimit} products</li><li>{plan.allowsAuction ? `${plan.auctionProductLimit || 0} auction listings` : 'No auction listings'}</li><li>{plan.maxAds || 0} adverts</li></ul><div className="admin-plan-card__footer"><span className={`admin-status ${plan.isFeeWaived ? 'admin-status--good' : ''}`}>{plan.isFeeWaived ? 'Fees waived globally' : 'Normal pricing'}</span><Button variant={plan.isFeeWaived ? 'outline' : 'primary'} loading={busy === plan.id} onClick={() => toggle(plan)}>{plan.isFeeWaived ? 'Restore normal fee' : 'Waive for all vendors'}</Button></div></article>)}</div>}</section></>;
}

export function AdminVerification() {
  const resource = useResource(signal => adminApi.kyc(signal), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [updates, setUpdates] = useState({});
  const rows = rowsFrom(resource.data).map(item => updates[item.id] ? { ...item, ...updates[item.id] } : item);
  const statusOf = item => item.reviewStatus || (item.isVerified ? 'approved' : 'pending');
  const pendingCount = rows.filter(item => statusOf(item) === 'pending').length;
  const changesCount = rows.filter(item => statusOf(item) === 'changes_requested').length;
  const filtered = rows.filter(item => (filter === 'all' || statusOf(item) === filter) && `${item.businessName || ''} ${item.vendorId || ''} ${item.user?.email || ''}`.toLowerCase().includes(query.toLowerCase()));
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const chooseFilter = next => { setFilter(next); setPage(1); };
  const fields = selected ? [
    ['businessName', 'Business name', selected.businessName, true],
    ['contactEmail', 'Contact email', selected.contactEmail, true],
    ['contactPhoneNumber', 'Contact phone number', selected.contactPhoneNumber, true],
    ['businessDescription', 'Business description', selected.businessDescription, true],
    ['businessLink', 'Business website', selected.businessLink],
    ['businessAddress', 'Business address', selected.businessAddress, true],
    ['businessRegistrationNumber', 'Registration number', selected.businessRegistrationNumber],
    ['idVerification.name', 'Identity document type', selected.idVerification?.name, true],
    ['idVerification.number', 'Identity document number', selected.idVerification?.number, true],
    ['idVerification.expiryDate', 'Identity document expiry', selected.idVerification?.expiryDate],
  ] : [];
  const openReview = item => {
    setSelected(item);
    setReviews(item.fieldReviews || {});
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const setDecision = (field, status) => setReviews(current => ({ ...current, [field]: { status, ...(status === 'rejected' ? { reason: current[field]?.reason || '' } : {}) } }));
  const setReason = (field, reason) => setReviews(current => ({ ...current, [field]: { status: 'rejected', reason } }));
  const approveProvided = () => setReviews(Object.fromEntries(fields.filter(([, , value]) => value).map(([field]) => [field, { status: 'approved' }])));
  const submitReview = async () => {
    const missingReason = Object.entries(reviews).find(([, review]) => review.status === 'rejected' && !review.reason?.trim());
    if (missingReason) { setFeedback({ error: true, message: 'Add a reason for every rejected detail.' }); return; }
    setSaving(true); setFeedback(null);
    try {
      const response = await adminApi.reviewKyc(selected.id, reviews);
      const updated = response?.data || { ...selected, fieldReviews: reviews };
      setSelected(updated);
      setReviews(updated.fieldReviews || reviews);
      setUpdates(current => ({ ...current, [updated.id]: updated }));
      setFeedback({ message: response?.message || 'Review saved successfully.' });
    } catch (cause) { setFeedback({ error: true, message: cause.message }); }
    finally { setSaving(false); }
  };
  const labelForStatus = status => status === 'approved' ? 'Verified' : status === 'changes_requested' ? 'Changes requested' : 'Under review';
  if (selected) return <>
    <button className="admin-review-back" onClick={() => setSelected(null)}><ArrowLeft size={18}/> Back to verification</button>
    <div className="admin-page-head admin-review-head"><div><span className="eyebrow">KYC REVIEW</span><h1>{selected.businessName || 'Vendor verification'}</h1><p>{selected.user?.email || selected.contactEmail} · Submitted {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}</p></div><span className={`admin-status admin-status--${statusOf(selected)}`}>{labelForStatus(statusOf(selected))}</span></div>
    <div className="admin-review-layout"><section className="admin-card"><div className="admin-card__head"><div><span className="eyebrow">SUBMITTED DETAILS</span><h2>Review each detail</h2></div><Button variant="outline" onClick={approveProvided}>Approve all provided</Button></div><div className="admin-review-fields">{fields.map(([field, label, value, required]) => { const decision = reviews[field] || {}; return <article className={`admin-review-field admin-review-field--${decision.status || 'pending'}`} key={field}><div className="admin-review-field__copy"><span>{label}{required && <small>Required</small>}</span><strong>{value || 'Not provided'}</strong></div>{value ? <div className="admin-review-actions"><button className={decision.status === 'approved' ? 'active approve' : ''} onClick={() => setDecision(field, 'approved')}><Check size={16}/> Approve</button><button className={decision.status === 'rejected' ? 'active reject' : ''} onClick={() => setDecision(field, 'rejected')}><X size={16}/> Request change</button></div> : <span className="admin-not-provided">Optional</span>}{decision.status === 'rejected' && <label className="admin-review-reason">Reason for the vendor<textarea value={decision.reason || ''} onChange={event => setReason(field, event.target.value)} placeholder="Explain exactly what needs to be corrected"/></label>}</article>; })}</div></section><aside className="admin-card admin-review-summary"><span className="eyebrow">DECISION</span><h2>Review summary</h2><div><span>Approved</span><strong>{Object.values(reviews).filter(item => item.status === 'approved').length}</strong></div><div><span>Changes requested</span><strong>{Object.values(reviews).filter(item => item.status === 'rejected').length}</strong></div><div><span>Awaiting decision</span><strong>{fields.filter(([, , value]) => value).filter(([field]) => !reviews[field] || reviews[field].status === 'pending').length}</strong></div><p>The vendor will receive an in-app notification and email after you submit.</p>{feedback && <div className={feedback.error ? 'admin-error' : 'admin-success'} role="status">{feedback.message}</div>}<Button loading={saving} onClick={submitReview}>Submit field review</Button></aside></div>
  </>;
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">SELLER TRUST</span><h1>Verification</h1><p>Review the identity details submitted by vendors.</p></div></div>
    <section className="admin-card">
      {resource.loading ? <Skeleton className="admin-table-skeleton"/> : resource.error ? <div className="admin-error" role="alert">{resource.error.message}</div> : <>
        <div className="admin-verify-toolbar"><div className="admin-verify-tabs" role="group" aria-label="Verification status">{[['pending', `Under review (${pendingCount})`], ['changes_requested', `Changes requested (${changesCount})`], ['approved', 'Verified'], ['all', 'All']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => chooseFilter(value)}>{label}</button>)}</div><input aria-label="Search verification submissions" placeholder="Search business, email or vendor ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div>
        {!visible.length ? <EmptyState title="No matching submissions" description="Try another status or search term."/> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Business</th><th>Status</th><th>Submitted</th><th>Vendor</th><th/></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{item.businessName || 'Unnamed business'}</strong><small className="admin-table-subtitle">{item.user?.email || item.contactEmail}</small></td><td><span className={`admin-status admin-status--${statusOf(item)}`}>{labelForStatus(statusOf(item))}</span></td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td><td><span className="admin-verify-id" title={item.vendorId}>{item.vendorId ? `${String(item.vendorId).slice(0, 8)}…` : '—'}</span></td><td><button className="admin-row-action" onClick={() => openReview(item)}>Review →</button></td></tr>)}</tbody></table></div>}
        <div className="admin-pagination"><span>{filtered.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}` : '0 results'}</span><Button variant="outline" disabled={page === 1} onClick={() => setPage(current => current - 1)}>Previous</Button><Button variant="outline" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}>Next</Button></div>
      </>}
    </section>
  </>;
}
