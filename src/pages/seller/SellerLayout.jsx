import { ArrowLeft, BarChart3, Box, BriefcaseBusiness, Handshake, Landmark, Menu, Package, ShieldCheck, Store, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const links = [
  { to: '/seller', label: 'Overview', icon: BarChart3, end: true },
  { to: '/seller/products', label: 'Products', icon: Box },
  { to: '/seller/orders', label: 'Orders', icon: Package },
  { to: '/seller/offers', label: 'Offers', icon: Handshake },
  { to: '/seller/stores', label: 'Stores', icon: Store },
  { to: '/seller/services', label: 'Services', icon: BriefcaseBusiness },
  { to: '/seller/finance', label: 'Finance', icon: Landmark },
  { to: '/seller/verification', label: 'Verification', icon: ShieldCheck },
];

export default function SellerLayout() {
  const { user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace state={{ from: '/seller' }}/>;
  if (user.accountType?.toLowerCase() !== 'vendor') return <Navigate to="/account" replace/>;
  return <div className="seller-shell"><aside className={`seller-sidebar ${mobileOpen ? 'seller-sidebar--open' : ''}`}><div className="seller-sidebar__top"><Link to="/seller" className="seller-brand"><img src="/kudumart-logo.png" alt="KuduMart"/><span>Seller Studio</span></Link><button className="seller-sidebar__close" aria-label="Close seller menu" onClick={() => setMobileOpen(false)}><X size={20}/></button></div><p className="seller-sidebar__label">WORKSPACE</p><nav aria-label="Seller workspace">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `seller-nav-link ${isActive ? 'active' : ''}`}><Icon size={19}/>{label}</NavLink>)}</nav><div className="seller-sidebar__bottom"><Link to="/account"><ArrowLeft size={17}/> Back to my account</Link><span>{user.email}</span></div></aside><div className="seller-main"><header className="seller-topbar"><button className="seller-menu-button" aria-label="Open seller menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><span>Seller Studio</span><Link to="/" className="seller-topbar__market">View marketplace ↗</Link></header><main className="seller-content"><Outlet/></main></div>{mobileOpen && <button className="seller-sidebar-backdrop" aria-label="Close seller menu" onClick={() => setMobileOpen(false)}/>}</div>;
}
