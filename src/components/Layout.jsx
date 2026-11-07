import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bell, Check, ChevronDown, Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { accountApi } from '../api/account';
import { useResource } from '../hooks/useResource';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button, IconButton } from './ui';
import SearchBox from './SearchBox';

function CountrySelector({ country, countries, onChange, mobile, onSelect }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const flagFor = code => (code === 'NG' ? '🇳🇬' : code === 'US' ? '🇺🇸' : '🇬🇧');

  return (
    <div ref={containerRef} className={`custom-country-picker ${mobile ? 'custom-country-picker--mobile' : ''}`}>
      <button
        type="button"
        className="country-trigger"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Shopping country and currency"
      >
        <span className="flag">{flagFor(country.code)}</span>
        <span className="country-trigger__label">{mobile ? `${country.name} (${country.currency})` : country.name}</span>
        <ChevronDown size={14} className={`country-chevron ${open ? 'country-chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="country-dropdown-menu" role="listbox">
          {countries.map(item => {
            const isSelected = item.code === country.code;
            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`country-dropdown-item ${isSelected ? 'country-dropdown-item--selected' : ''}`}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  if (onSelect) onSelect(item);
                }}
              >
                <span className="flag">{flagFor(item.code)}</span>
                <span className="country-dropdown-item__text">
                  <span className="country-dropdown-item__name">{item.name}</span>
                  <span className="country-dropdown-item__curr">{item.currency}</span>
                </span>
                {isSelected && <Check size={16} className="country-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { country, countries, changeCountry, cartCount, user, signOut, notify } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationRevision, setNotificationRevision] = useState(0);
  const location = useLocation();
  useEffect(() => {
    const refresh = () => setNotificationRevision(value => value + 1);
    window.addEventListener('kudu:notifications-changed', refresh);
    return () => window.removeEventListener('kudu:notifications-changed', refresh);
  }, []);
  const unread = useResource(signal => user ? accountApi.notifications(false, signal) : Promise.resolve([]), [user?.id, location.pathname, notificationRevision]);
  const unreadCount = Array.isArray(unread.data) ? unread.data.length : 0;
  const catalogParams = new URLSearchParams(location.search);
  const catalogMode = catalogParams.get('condition') === 'brand_new' ? 'brand-new' : catalogParams.get('popular') === 'true' ? 'popular' : 'shop-all';
  const catalogClass = mode => location.pathname === '/catalog' && catalogMode === mode ? 'active' : undefined;
  return <div className="site-shell"><div className="announcement"><span>Something great is always around the corner.</span><Link to="/catalog">Explore KuduMart <ArrowRight size={14}/></Link></div>
    <header className="header"><div className="header__top container"><Link to="/" className="brand" aria-label="KuduMart home"><img className="brand__image" src="/kudumart-logo.png" alt="Kudu — where convenience meets quality"/></Link>
      <SearchBox/>
      <div className="header__actions"><CountrySelector country={country} countries={countries} onChange={changeCountry} />
        <Link to="/saved" className="desktop-only"><IconButton label="Saved items" icon={Heart}/></Link>
        {user && <Link className="header-cart desktop-only" to="/account/notifications" aria-label={`${unreadCount} unread notifications`}><Bell size={20}/>{unreadCount > 0 && <b>{Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}</b>}</Link>}
        <Link className="header-cart" to="/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingBag size={21}/>{cartCount > 0 && <b>{cartCount}</b>}</Link>
        <Link className="header-account" to={user ? '/account' : '/login'}><UserRound size={19}/><span>{user ? 'Account' : 'Sign in'}</span></Link>
        <IconButton label={menuOpen ? 'Close menu' : 'Open menu'} icon={menuOpen ? X : Menu} className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)}/>
      </div></div><div className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}><nav className="container" aria-label="Main navigation"><SearchBox mobile onNavigate={() => setMenuOpen(false)}/><Link className={catalogClass('shop-all')} to="/catalog" onClick={() => setMenuOpen(false)}>Shop all</Link><Link className={catalogClass('popular')} to="/catalog?popular=true" onClick={() => setMenuOpen(false)}>Popular picks</Link><Link className={catalogClass('brand-new')} to="/catalog?condition=brand_new" onClick={() => setMenuOpen(false)}>Brand new</Link><NavLink to="/auctions" onClick={() => setMenuOpen(false)}>Auctions</NavLink><NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink><span className="nav-spacer"/><Link className="nav-sell" to={user ? '/account' : '/register?type=Vendor'} onClick={() => setMenuOpen(false)}>Sell on KuduMart <ArrowRight size={15}/></Link><div className="mobile-nav-country"><span className="mobile-nav-country__label">Country & Currency</span><CountrySelector country={country} countries={countries} onChange={changeCountry} mobile onSelect={() => setMenuOpen(false)} /></div></nav></div></header>
    <main><Outlet/></main><footer className="footer"><div className="container footer__top"><div><Link to="/" className="brand brand--footer"><img className="brand__image" src="/kudumart-logo.png" alt="Kudu — where convenience meets quality"/></Link><p>Great finds, real connections.<br/>Your marketplace for what’s next.</p><a href="mailto:support@kudumart.com">support@kudumart.com</a></div><div><h4>Explore</h4><Link to="/catalog">Shop all</Link><Link to="/auctions">Auctions</Link><Link to="/services">Services</Link><Link to="/careers">Careers</Link><Link to="/download-app">Get the app</Link></div><div><h4>KuduMart</h4><Link to="/about">About us</Link><Link to="/contact">Contact us</Link><Link to="/faqs">FAQs</Link><Link to="/testimonials">Testimonials</Link><Link to="/return-policy">Returns</Link></div><div><h4>Your account</h4><Link to="/account">My account</Link><Link to="/saved">Saved items</Link><Link to="/account/orders">My orders</Link><Link to="/cart">My cart</Link><Link to="/login">Sign in</Link></div><div className="footer__newsletter"><h4>Stay in the loop</h4><p>Fresh finds and KuduMart updates.</p><form onSubmit={event => { event.preventDefault(); notify('Thanks! Newsletter signups are coming soon.', 'info'); }}><input type="email" placeholder="Your email address" aria-label="Email address" required/><button aria-label="Join newsletter"><ArrowRight size={19}/></button></form></div></div><div className="container footer__bottom"><span>© {new Date().getFullYear()} KuduMart. All rights reserved.</span><span className="footer__legal"><Link to="/privacy">Privacy</Link><Link to="/terms-condition">Terms</Link><Link to="/cookie-policy">Cookies</Link></span></div></footer></div>;
}
