import { useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button, IconButton } from './ui';
import SearchBox from './SearchBox';
export default function Layout() {
  const { country, countries, changeCountry, cartCount, user, signOut, notify } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const catalogParams = new URLSearchParams(location.search);
  const catalogMode = catalogParams.get('condition') === 'brand_new' ? 'brand-new' : catalogParams.get('popular') === 'true' ? 'popular' : 'shop-all';
  const catalogClass = mode => location.pathname === '/catalog' && catalogMode === mode ? 'active' : undefined;
  return <div className="site-shell"><div className="announcement"><span>Something great is always around the corner.</span><Link to="/catalog">Explore KuduMart <ArrowRight size={14}/></Link></div>
    <header className="header"><div className="header__top container"><Link to="/" className="brand" aria-label="KuduMart home"><img className="brand__image" src="/kudumart-logo.png" alt="Kudu — where convenience meets quality"/></Link>
      <SearchBox/>
      <div className="header__actions"><label className="country-picker"><span className="flag">{country.code === 'NG' ? '🇳🇬' : country.code === 'US' ? '🇺🇸' : '🇬🇧'}</span><select aria-label="Shopping country" value={country.name} onChange={event => changeCountry(countries.find(item => item.name === event.target.value))}>{countries.map(item => <option key={item.code}>{item.name}</option>)}</select><ChevronDown size={14}/></label>
        <Link to="/saved" className="desktop-only"><IconButton label="Saved items" icon={Heart}/></Link>
        <Link className="header-cart" to="/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingBag size={21}/>{cartCount > 0 && <b>{cartCount}</b>}</Link>
        <Link className="header-account" to={user ? '/account' : '/login'}><UserRound size={19}/><span>{user ? 'Account' : 'Sign in'}</span></Link>
        <IconButton label={menuOpen ? 'Close menu' : 'Open menu'} icon={menuOpen ? X : Menu} className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)}/>
      </div></div><div className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}><nav className="container" aria-label="Main navigation"><SearchBox mobile onNavigate={() => setMenuOpen(false)}/><Link className={catalogClass('shop-all')} to="/catalog" onClick={() => setMenuOpen(false)}>Shop all</Link><Link className={catalogClass('popular')} to="/catalog?popular=true" onClick={() => setMenuOpen(false)}>Popular picks</Link><Link className={catalogClass('brand-new')} to="/catalog?condition=brand_new" onClick={() => setMenuOpen(false)}>Brand new</Link><NavLink to="/auctions" onClick={() => setMenuOpen(false)}>Auctions</NavLink><NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink><span className="nav-spacer"/><Link className="nav-sell" to={user ? '/account' : '/register?type=Vendor'} onClick={() => setMenuOpen(false)}>Sell on KuduMart <ArrowRight size={15}/></Link></nav></div></header>
    <main><Outlet/></main><footer className="footer"><div className="container footer__top"><div><Link to="/" className="brand brand--footer"><img className="brand__image" src="/kudumart-logo.png" alt="Kudu — where convenience meets quality"/></Link><p>Great finds, real connections.<br/>Your marketplace for what’s next.</p></div><div><h4>Explore</h4><Link to="/catalog">Shop all</Link><Link to="/auctions">Auctions</Link><Link to="/services">Services</Link></div><div><h4>Your account</h4><Link to="/account">My account</Link><Link to="/saved">Saved items</Link><Link to="/account/orders">My orders</Link><Link to="/cart">My cart</Link><Link to="/login">Sign in</Link></div><div className="footer__newsletter"><h4>Stay in the loop</h4><p>Fresh finds and KuduMart updates.</p><form onSubmit={event => { event.preventDefault(); notify('Thanks! Newsletter signups are coming soon.', 'info'); }}><input type="email" placeholder="Your email address" aria-label="Email address" required/><button aria-label="Join newsletter"><ArrowRight size={19}/></button></form></div></div><div className="container footer__bottom"><span>© {new Date().getFullYear()} KuduMart. All rights reserved.</span><span>Made for the way you discover.</span></div></footer></div>;
}
