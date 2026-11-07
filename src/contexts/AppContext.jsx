import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { accountApi } from '../api/account';
import { tokenStore } from '../api/client';
const AppContext = createContext(null);
const COUNTRIES = [
  { name: 'Nigeria', code: 'NG', currency: 'NGN', symbol: '₦' },
  { name: 'United States', code: 'US', currency: 'USD', symbol: '$' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£' },
];
const PROFILE_FIELDS = ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'accountType', 'isVerified', 'trackingId', 'location', 'photo', 'dateOfBirth', 'gender'];
const profileFrom = data => Object.fromEntries(PROFILE_FIELDS.filter(key => data?.[key] !== undefined).map(key => [key, data[key]]));
export function AppProvider({ children }) {
  const [country, setCountry] = useState(() => COUNTRIES.find(item => item.name === localStorage.getItem('kuduCountry')) || COUNTRIES[0]);
  const [user, setUser] = useState(() => {
    try {
      if (!tokenStore.get()) return null;
      const profile = profileFrom(JSON.parse(localStorage.getItem('kuduUser')));
      localStorage.setItem('kuduUser', JSON.stringify(profile));
      return profile;
    } catch { return null; }
  });
  const [cartCount, setCartCount] = useState(0);
  const [savedIds, setSavedIds] = useState(() => new Set());
  useEffect(() => {
    if (!user?.id) {
      setCartCount(0);
      setSavedIds(new Set());
      return;
    }
    const savedController = new AbortController();
    const cartController = new AbortController();
    setSavedIds(new Set());

    accountApi.savedProducts(savedController.signal).then(result => {
      const items = Array.isArray(result) ? result : result?.data || [];
      if (!savedController.signal.aborted) setSavedIds(new Set(items.map(item => item.productId || item.product?.id || item.id).filter(Boolean)));
    }).catch(() => {});

    const fetchCart = () => {
      accountApi.cart(cartController.signal).then(result => {
        if (!cartController.signal.aborted) {
          const list = Array.isArray(result) ? result : result?.data || [];
          const total = list.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
          setCartCount(total);
        }
      }).catch(() => {});
    };

    fetchCart();
    window.addEventListener('kudu:cart-changed', fetchCart);

    return () => {
      savedController.abort();
      cartController.abort();
      window.removeEventListener('kudu:cart-changed', fetchCart);
    };
  }, [user?.id]);
  const markSaved = productId => setSavedIds(ids => new Set([...ids, productId]));
  const markUnsaved = productId => setSavedIds(ids => { const next = new Set(ids); next.delete(productId); return next; });
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(null);
  useEffect(() => {
    const handleSessionExpired = event => setSessionExpired(current => current || {
      returnTo: event.detail?.returnTo || '/account',
    });
    window.addEventListener('kudu:session-expired', handleSessionExpired);
    return () => window.removeEventListener('kudu:session-expired', handleSessionExpired);
  }, []);
  const notify = (message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(items => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts(items => items.filter(item => item.id !== id)), 4200);
  };
  const changeCountry = value => { setCountry(value); localStorage.setItem('kuduCountry', value.name); };
  const signIn = data => {
    tokenStore.set(data.token);
    setSessionExpired(null);
    const profile = profileFrom(data);
    localStorage.setItem('kuduUser', JSON.stringify(profile));
    setUser(profile);
  };
  const updateUser = data => {
    if (data?.token) tokenStore.set(data.token);
    const profile = profileFrom({ ...user, ...data });
    localStorage.setItem('kuduUser', JSON.stringify(profile));
    setUser(profile);
  };
  const signOut = () => { tokenStore.clear(); localStorage.removeItem('kuduUser'); sessionStorage.removeItem('kuduPendingCheckout'); setUser(null); setCartCount(0); setSavedIds(new Set()); };
  const value = useMemo(() => ({ country, countries: COUNTRIES, changeCountry, user, signIn, updateUser, signOut, cartCount, setCartCount, savedIds, markSaved, markUnsaved, toasts, setToasts, notify, modal, setModal, sessionExpired, setSessionExpired }), [country, user, cartCount, savedIds, toasts, modal, sessionExpired]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
