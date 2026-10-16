import { useState } from 'react';
import { BarChart3, Box, ClipboardCheck, LogOut, Menu, Package, Store, Users, X } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{kind === 'products' ? 'Product' : kind === 'orders' ? 'Order' : 'Name'}</th><th>{kind === 'products' ? 'Store' : kind === 'orders' ? 'Customer' : 'Email'}</th><th>Status</th>{!compact && <th>Created</th>}</tr></thead><tbody>{rows.map((item, index) => <tr key={item.id || index}><td><strong>{item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || item.refId || item.title || 'Untitled'}</strong></td><td>{item.email || item.store?.name || item.user?.email || '—'}</td><td><span className={`admin-status ${String(item.status || '').toLowerCase() === 'active' || item.isVerified ? 'admin-status--good' : ''}`}>{item.status || (item.isVerified ? 'Verified' : 'Unverified')}</span></td>{!compact && <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>}</tr>)}</tbody></table></div>;
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

export function AdminVerification() {
  const resource = useResource(signal => adminApi.kyc(signal), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const rows = rowsFrom(resource.data);
  const pendingCount = rows.filter(item => !item.isVerified).length;
  const filtered = rows.filter(item => (filter === 'all' || (filter === 'pending' ? !item.isVerified : item.isVerified)) && `${item.businessName || ''} ${item.vendorId || ''}`.toLowerCase().includes(query.toLowerCase()));
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const chooseFilter = next => { setFilter(next); setPage(1); };
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">SELLER TRUST</span><h1>Verification</h1><p>Review the identity details submitted by vendors.</p></div></div>
    <section className="admin-card">
      {resource.loading ? <Skeleton className="admin-table-skeleton"/> : resource.error ? <div className="admin-error" role="alert">{resource.error.message}</div> : <>
        <div className="admin-verify-toolbar"><div className="admin-verify-tabs" role="group" aria-label="Verification status">{[['pending', `Under review (${pendingCount})`], ['verified', 'Verified'], ['all', 'All']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => chooseFilter(value)}>{label}</button>)}</div><input aria-label="Search verification submissions" placeholder="Search business or vendor ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div>
        {!visible.length ? <EmptyState title="No matching submissions" description="Try another status or search term."/> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Business</th><th>Status</th><th>Submitted</th><th>Vendor</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{item.businessName || 'Unnamed business'}</strong></td><td><span className={`admin-status ${item.isVerified ? 'admin-status--good' : ''}`}>{item.isVerified ? 'Verified' : 'Under review'}</span></td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td><td><span className="admin-verify-id" title={item.vendorId}>{item.vendorId ? `${String(item.vendorId).slice(0, 8)}…` : '—'}</span></td></tr>)}</tbody></table></div>}
        <div className="admin-pagination"><span>{filtered.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}` : '0 results'}</span><Button variant="outline" disabled={page === 1} onClick={() => setPage(current => current - 1)}>Previous</Button><Button variant="outline" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}>Next</Button></div>
      </>}
    </section>
  </>;
}
