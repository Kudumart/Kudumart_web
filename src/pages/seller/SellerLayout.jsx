import { ArrowLeft, BarChart3, Box, BriefcaseBusiness, CreditCard, Gavel, Handshake, Landmark, Megaphone, Menu, Package, PanelLeftClose, PanelLeftOpen, ShieldCheck, Store, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './SellerLayout.css';

const links = [
  { to: '/seller', label: 'Overview', icon: BarChart3, end: true },
  { to: '/seller/products', label: 'Products', icon: Box },
  { to: '/seller/auctions', label: 'Auctions', icon: Gavel },
  { to: '/seller/orders', label: 'Orders', icon: Package },
  { to: '/seller/offers', label: 'Offers', icon: Handshake },
  { to: '/seller/stores', label: 'Stores', icon: Store },
  { to: '/seller/services', label: 'Services', icon: BriefcaseBusiness },
  { to: '/seller/adverts', label: 'Adverts', icon: Megaphone },
  { to: '/seller/finance', label: 'Finance', icon: Landmark },
  { to: '/seller/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/seller/verification', label: 'Verification', icon: ShieldCheck },
];

export default function SellerLayout() {
  const { user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('kuduSellerSidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem('kuduSellerSidebarCollapsed', String(next));
      } catch {
        // The sidebar still works when storage is unavailable.
      }
      return next;
    });
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/seller' }}/>;
  if (user.accountType?.toLowerCase() !== 'vendor') return <Navigate to="/account" replace/>;
  return <div className={`seller-shell ${collapsed ? 'seller-shell--collapsed' : ''}`}><aside className={`seller-sidebar ${mobileOpen ? 'seller-sidebar--open' : ''}`}><button className="seller-sidebar__collapse" type="button" aria-label={collapsed ? 'Expand seller sidebar' : 'Collapse seller sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={toggleSidebar}>{collapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}</button><div className="seller-sidebar__top"><Link to="/seller" className="seller-brand" title={collapsed ? 'Seller Studio' : undefined}><img src="/kudumart-logo.png" alt="KuduMart"/><span>Seller Studio</span></Link><button className="seller-sidebar__close" aria-label="Close seller menu" onClick={() => setMobileOpen(false)}><X size={20}/></button></div><p className="seller-sidebar__label">WORKSPACE</p><nav aria-label="Seller workspace">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined} aria-label={label} onClick={() => setMobileOpen(false)} className={({ isActive }) => `seller-nav-link ${isActive ? 'active' : ''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav><div className="seller-sidebar__bottom"><Link to="/account" title={collapsed ? 'Back to my account' : undefined}><ArrowLeft size={17}/><span>Back to my account</span></Link><span>{user.email}</span></div></aside><div className="seller-main"><header className="seller-topbar"><button className="seller-menu-button" aria-label="Open seller menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><span>Seller Studio</span><Link to="/" className="seller-topbar__market">View marketplace ↗</Link></header><main className="seller-content"><Outlet/></main></div>{mobileOpen && <button className="seller-sidebar-backdrop" aria-label="Close seller menu" onClick={() => setMobileOpen(false)}/>}</div>;
}
