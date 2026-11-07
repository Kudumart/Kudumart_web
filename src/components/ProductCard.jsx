import { useRef, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Flame, ImageOff, LoaderCircle, ShoppingBag, Store } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { useApp } from '../contexts/AppContext';
import { useCanonicalProduct, refreshCanonicalProduct } from '../hooks/useCanonicalProduct';
import { Badge } from './ui';
import SaveHeart from './SaveHeart';
import { imageFor, money, priceFor } from '../utils/format';
import { productAction, productActionLabel } from '../utils/productAction';

export default function ProductCard({ product, savedOverride = false, onRemoved, rank }) {
  const { user, notify, setCartCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const canonical = useCanonicalProduct(product.id, cardRef);
  // Listing/search responses can disagree with the product detail. Until checked,
  // only offer navigation to the detail page; never show an unverified cart action.
  const action = canonical ? productAction(canonical) : 'details';
  const price = priceFor(product);
  const symbol = product?.store?.currency?.symbol || '₦';
  const discountPct =
    price.discounted && price.original > price.current
      ? Math.round(((price.original - price.current) / price.original) * 100)
      : 0;
  const isVerified = Boolean(product?.vendor?.isVerified || product?.store?.isVerified || product?.admin);
  const categoryName = product?.sub_category?.name || product?.category?.name;
  const conditionText = product?.condition ? String(product.condition).replaceAll('_', ' ') : '';

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

  return (
    <article
      ref={cardRef}
      className={`product-card ${action === 'sold-out' ? 'product-card--sold-out' : ''} ${product.isTrending ? 'product-card--trending' : ''}`}
    >
      <div className="product-card__media">
        <Link to={`/product/${product.id}`} className="product-card__image" aria-label={`View ${product.name}`}>
          {imageFor(product) ? (
            <img src={imageFor(product)} alt={product.name || 'Product'} loading="lazy" />
          ) : (
            <span className="image-fallback"><ImageOff size={30} /></span>
          )}
          {action === 'sold-out' && <span className="product-card__sold-out">Sold out</span>}
          <div className="product-card__badges">
            {rank && <span className="product-card__rank">#{String(rank).padStart(2, '0')}</span>}
            {product.isTrending && !rank && (
              <span className="product-card__pill product-card__pill--trending">
                <Flame size={12} /> Hot
              </span>
            )}
            {discountPct > 0 && (
              <span className="product-card__pill product-card__pill--discount">-{discountPct}%</span>
            )}
            {conditionText && (
              <span className="product-card__badge">
                <Badge tone="light">{conditionText}</Badge>
              </span>
            )}
          </div>
          <span className="product-card__quick-view">
            <span>View details</span>
            <ArrowUpRight size={15} />
          </span>
        </Link>
        <div className="product-card__save">
          <SaveHeart productId={product.id} savedOverride={savedOverride} onRemoved={onRemoved} />
        </div>
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__store">
            <Store size={12} />
            <span>{product?.store?.name || 'KuduMart seller'}</span>
            {isVerified && <BadgeCheck size={13} className="product-card__verified" aria-label="Verified seller" />}
          </span>
          {categoryName && <span className="product-card__category">{categoryName}</span>}
        </div>

        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        <div className="product-card__bottom">
          <div className="product-card__price">
            <strong>{money(price.current, symbol)}</strong>
            {price.discounted && <del>{money(price.original, symbol)}</del>}
          </div>
          <button
            className={`product-card__add product-card__add--${action}`}
            onClick={act}
            disabled={busy || action === 'sold-out'}
            aria-busy={busy}
          >
            {busy ? (
              <>
                <LoaderCircle className="product-card__button-spinner" size={13} /> Checking
              </>
            ) : (
              <>
                {action === 'cart' ? <ShoppingBag size={13} /> : <ArrowUpRight size={13} />}
                <span>{productActionLabel[action]}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
