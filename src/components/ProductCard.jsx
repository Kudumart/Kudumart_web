import { useRef, useState } from 'react';
import { ArrowUpRight, ImageOff, LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { useApp } from '../contexts/AppContext';
import { useCanonicalProduct, refreshCanonicalProduct } from '../hooks/useCanonicalProduct';
import { Badge } from './ui';
import SaveHeart from './SaveHeart';
import { imageFor, money, priceFor } from '../utils/format';
import { productAction, productActionLabel } from '../utils/productAction';
import { isVendorAccount } from '../utils/account';
export default function ProductCard({ product, savedOverride = false, onRemoved }) {
  const { user, notify, setCartCount } = useApp();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const canonical = useCanonicalProduct(product.id, cardRef);
  // Listing/search responses can disagree with the product detail. Until checked,
  // only offer navigation to the detail page; never show an unverified cart action.
  const action = canonical ? productAction(canonical) : 'details';
  const price = priceFor(product);
  const symbol = product?.store?.currency?.symbol || '₦';
  const routeAction = kind => {
    if (kind === 'sold-out') { notify('This item is sold out.', 'info'); return; }
    if (kind === 'details') { navigate(`/product/${product.id}`); return; }
    if (kind === 'offer' || kind === 'contact') {
      const destination = `/product/${product.id}?${kind}=1`;
      navigate(user ? destination : '/login', user ? undefined : { state: { from: destination } });
    }
  };
  const act = async () => {
    if (busy || action === 'sold-out') return;
    if (isVendorAccount(user) && action === 'cart') { notify('Seller accounts cannot purchase products. Use a customer account to shop.', 'info'); navigate('/seller'); return; }
    if (action !== 'cart') { routeAction(action); return; }
    if (!user) { notify('Sign in to add items to your cart.', 'info'); navigate('/login', { state: { from: location.pathname } }); return; }
    setBusy(true);
    try {
      const latest = await refreshCanonicalProduct(product.id);
      const latestAction = productAction(latest);
      if (latestAction !== 'cart') { routeAction(latestAction); return; }
      await accountApi.addToCart(product.id);
      setCartCount(value => value + 1);
      notify('Added to your cart.', 'success');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <article ref={cardRef} className={`product-card ${action === 'sold-out' ? 'product-card--sold-out' : ''}`}><Link to={`/product/${product.id}`} className="product-card__image" aria-label={`View ${product.name}`}>
    {imageFor(product) ? <img src={imageFor(product)} alt={product.name || 'Product'} loading="lazy"/> : <span className="image-fallback"><ImageOff size={30}/></span>}
    {action === 'sold-out' && <span className="product-card__sold-out">Sold out</span>}
    <span className="product-card__arrow"><ArrowUpRight size={18}/></span>
    {product.condition && <span className="product-card__badge"><Badge tone="light">{product.condition.replaceAll('_', ' ')}</Badge></span>}
  </Link><div className="product-card__body"><div className="product-card__meta"><span>{product?.store?.name || 'KuduMart seller'}</span><SaveHeart productId={product.id} savedOverride={savedOverride} onRemoved={onRemoved}/></div><Link to={`/product/${product.id}`} className="product-card__name">{product.name}</Link><div className="product-card__bottom"><div className="product-card__price"><strong>{money(price.current, symbol)}</strong>{price.discounted && <del>{money(price.original, symbol)}</del>}</div><button className={`product-card__add product-card__add--${action}`} onClick={act} disabled={busy || action === 'sold-out'} aria-busy={busy}>{busy ? <><LoaderCircle className="product-card__button-spinner" size={13}/> Checking</> : isVendorAccount(user) && action === 'cart' ? 'Seller account' : productActionLabel[action]}</button></div></div></article>;
}
