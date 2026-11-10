import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarClock, Check, ChevronLeft, ChevronRight, ImageOff, MessageCircle, Minus, Phone, Plus, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { accountApi } from '../api/account';
import { catalogApi } from '../api/catalog';
import { checkoutApi } from '../api/checkout';
import { Button, EmptyState, Modal, Skeleton, TextField } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { imageFor, money, priceFor, plainText } from '../utils/format';
import { productAction } from '../utils/productAction';
import { variantDisplayPrice, variantLabel } from '../utils/productVariant';
import { recordRecentlyViewed } from '../utils/recentlyViewed';
import ProductCard from '../components/ProductCard';
import SaveHeart from '../components/SaveHeart';
import SEO from '../components/SEO';
import { ProductFacts, ProductReviews, SellerProfile, ShareProduct } from '../components/ProductDetailSections';
import './Product.css';
export default function Product() {
  const { id } = useParams(); const navigate = useNavigate(); const [searchParams, setSearchParams] = useSearchParams(); const { user, notify, setCartCount } = useApp();
  const [quantity, setQuantity] = useState(1); const [busy, setBusy] = useState(false); const [activeImage, setActiveImage] = useState('');
  const [offerPrice, setOfferPrice] = useState(''); const [offerMessage, setOfferMessage] = useState(''); const [offer, setOffer] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const installmentConfigResource = useResource((signal) => checkoutApi.installmentConfig(signal), []);
  useEffect(() => { window.scrollTo(0, 0); setActiveImage(''); setSelectedVariant(''); }, [id]);
  const { data: product, loading, error } = useResource(signal => catalogApi.product(id, signal), [id]);
  useEffect(() => { if (product?.id) recordRecentlyViewed(product); }, [product]);
  const vendorId = product?.vendor?.id || product?.vendorId;
  const canMessageVendor = !!vendorId && String(vendorId) !== String(user?.id || '');
  const categoryId = product?.categoryId || product?.category?.id;
  const storeProducts = useResource(signal => vendorId ? catalogApi.products({ vendorId, limit: 12, signal }) : Promise.resolve([]), [vendorId]);
  const categoryProducts = useResource(signal => product && !product.recommendedProducts?.length && categoryId ? catalogApi.products({ categoryId, limit: 12, signal }) : Promise.resolve([]), [id, categoryId, product?.recommendedProducts?.length]);
  const action = productAction(product); const price = priceFor(product); const symbol = product?.store?.currency?.symbol || '₦';
  const images = product ? [...new Set([imageFor(product), ...(product.additional_images || [])].filter(Boolean))] : [];
  const imageIndex = Math.max(0, images.indexOf(activeImage));
  const changeImage = step => setActiveImage(images[(imageIndex + step + images.length) % images.length]);
  const dialog = searchParams.has('offer') ? 'offer' : searchParams.has('contact') ? 'contact' : '';
  useEffect(() => { if (dialog && !user) navigate('/login', { replace: true, state: { from: `/product/${id}?${dialog}=1` } }); }, [dialog, user, id, navigate]);
  const closeDialog = () => { const next = new URLSearchParams(searchParams); next.delete('offer'); next.delete('contact'); setSearchParams(next, { replace: true }); };
  const openDialog = (kind) => { if (!user) { navigate('/login', { state: { from: `/product/${id}?${kind}=1` } }); return; } setSearchParams({ [kind]: '1' }); };
  useEffect(() => {
    if (!user || !id || action !== 'offer') return;
    const controller = new AbortController();
    accountApi.offers(controller.signal).then(result => {
      const items = Array.isArray(result) ? result : result?.offers || result?.data || [];
      if (!controller.signal.aborted) setOffer(items.find(item => item.productId === id || item.product?.id === id) || null);
    }).catch(() => {});
    return () => controller.abort();
  }, [user, id, action]);
  const add = async () => {
    if (!user) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
    setBusy(true);
    try { await accountApi.addToCart(id, quantity, action === 'details' ? product.variants[Number(selectedVariant)] : undefined); setCartCount(value => value + quantity); notify('Added to your cart.', 'success'); }
    catch (error) { notify(error.message, 'error'); } finally { setBusy(false); }
  };
  const buyNow = async () => {
    if (!user) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
    setBusy(true);
    try {
      await accountApi.addToCart(id, quantity, action === 'details' ? product.variants[Number(selectedVariant)] : undefined);
      setCartCount(value => value + quantity);
      navigate('/checkout');
    } catch (error) {
      notify(error.message, 'error');
      setBusy(false);
    }
  };
  const submitOffer = async (event) => {
    event.preventDefault(); const amount = Number(offerPrice);
    if (!Number.isFinite(amount) || amount <= 0) { notify('Enter a valid offer amount.', 'error'); return; }
    setBusy(true);
    try { const result = await accountApi.submitOffer(id, amount, offerMessage); setOffer(result?.offer || result || { status: 'pending', offeredPrice: amount }); notify('Your offer has been sent to the seller.', 'success'); closeDialog(); }
    catch (error) { notify(error.message, 'error'); } finally { setBusy(false); }
  };
  const contactSeller = async event => {
    event.preventDefault();
    if (!vendorId || !contactMessage.trim()) return;
    setBusy(true);
    try {
      await accountApi.sendMessage({ productId: id, receiverId: vendorId, content: contactMessage.trim() });
      notify('Your message has been sent to the seller.', 'success');
      navigate('/account/messages');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  if (loading) return <div className="container product-page"><Skeleton className="product-detail-skeleton"/></div>;
  if (error || !product) return <div className="container page-space"><EmptyState title="Product unavailable" description={error?.message || 'This product could not be found.'} action={<Link to="/catalog"><Button variant="outline">Back to products</Button></Link>}/></div>;
  const variants = product.variants || [];
  const isAvailable = Number(product.quantity) > 0;
  const variant = selectedVariant !== '' ? variants[Number(selectedVariant)] : null;
  const variantPrice = variantDisplayPrice(action === 'details' ? product : null, selectedVariant, price.current, symbol);
  const displayPrice = variantPrice.amount;
  const displaySymbol = variantPrice.symbol;
  const variantSoldOut = variant && Number(variant.sku_available_stock) === 0;

  const instConfig = installmentConfigResource.data?.data || installmentConfigResource.data;
  const minAmount = Number(instConfig?.min_order_amount ?? 25000);
  const maxAmount = Number(instConfig?.max_order_amount ?? 2000000);
  const isInstallmentEligible = Boolean(
    instConfig &&
    instConfig.system_mode &&
    instConfig.system_mode !== 'disabled' &&
    displaySymbol === '₦' &&
    displayPrice >= minAmount &&
    displayPrice <= maxAmount
  );

  const depositPct = Number(instConfig?.min_deposit_percentage || 25);
  const estimatedDeposit = isInstallmentEligible
    ? Math.round(displayPrice * (depositPct / 100))
    : 0;
  const estimatedMonthly = isInstallmentEligible
    ? Math.round((displayPrice - estimatedDeposit) / 2)
    : 0;

  const moreFromStore = (storeProducts.data || []).filter(item => item.id && item.id !== id).slice(0, 4);
  const similarProducts = (product.recommendedProducts?.length ? product.recommendedProducts : categoryProducts.data || []).filter(item => item.id && item.id !== id).slice(0, 4);
  const seoDescription = plainText(product.description || '').slice(0, 160) || `Buy ${product.name} at the best price on KuduMart Nigeria. Fast delivery and secure layaway installments.`;
  const seoImage = images[0] || product.image_url;

  return (
    <div className="container product-page">
      <SEO
        title={`${product.name} — Buy Online`}
        description={seoDescription}
        image={seoImage}
        type="product"
        product={{
          name: product.name,
          description: seoDescription,
          image: seoImage,
          price: displayPrice,
          currency: displaySymbol === '₦' ? 'NGN' : 'USD',
          inStock: isAvailable && !variantSoldOut,
          condition: product.condition,
          seller: product.store?.name || (product.vendor ? `${product.vendor.firstName || ''} ${product.vendor.lastName || ''}`.trim() : 'KuduMart Marketplace'),
          sku: product.sku || String(product.id),
        }}
      />
      <Link to="/catalog" className="back-link"><ArrowLeft size={16}/> Back to shopping</Link><div className="product-detail"><div className="product-detail__gallery"><div className="product-detail__main-image">{images.length ? <img src={activeImage || images[0]} alt={product.name}/> : <ImageOff size={48}/>}{images.length > 1 && <><button className="product-gallery__arrow product-gallery__arrow--left" onClick={() => changeImage(-1)} aria-label="Previous image"><ChevronLeft size={20}/></button><button className="product-gallery__arrow product-gallery__arrow--right" onClick={() => changeImage(1)} aria-label="Next image"><ChevronRight size={20}/></button></>}</div>{images.length > 1 && <div className="product-detail__thumbs">{images.map((image, index) => <button className={(activeImage || images[0]) === image ? 'active' : ''} onClick={() => setActiveImage(image)} key={`${image}-${index}`} aria-label={`View product image ${index + 1}`}><img src={image} alt=""/></button>)}</div>}</div><div className="product-detail__info"><span className="eyebrow">{product.store?.name || 'KUDUMART MARKETPLACE'}</span><h1>{product.name}</h1><div className="product-detail__status"><span><Check size={15}/> {isAvailable ? 'Available now' : 'Out of stock'}</span><span>{product.condition?.replaceAll('_',' ') || 'Product'}</span></div><div className="product-detail__price"><strong>{action === 'details' && variantPrice.starting ? 'From ' : ''}{money(displayPrice, displaySymbol)}</strong>{!variant && price.discounted && <del>{money(price.original, symbol)}</del>}</div>
    {isInstallmentEligible && (
      <button
        type="button"
        onClick={() => setShowInstallmentModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          color: '#c2410c',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          marginTop: '6px',
          marginBottom: '8px',
          textAlign: 'left',
          width: 'fit-content',
          transition: 'all 0.15s ease',
        }}
      >
        <CalendarClock size={15} color="#ea580c" />
        <span>Pay in installments with Layaway • Reserve from {depositPct}% down</span>
        <span style={{ fontWeight: 700, marginLeft: '4px', color: '#ea580c' }}>Learn more →</span>
      </button>
    )}<p className="product-detail__description">{plainText(product.description) || 'Discover more about this item and make it yours today.'}</p>
    {action === 'sold-out' && <div className="product-detail__purchase"><Button disabled>Sold out</Button></div>}
    {action === 'contact' && <div className="product-detail__purchase"><Button onClick={() => openDialog('contact')}>Contact seller</Button></div>}
    {action === 'offer' && <div className="product-detail__purchase"><Button onClick={() => openDialog('offer')}>{offer ? 'View your offer' : 'Request an offer'}</Button></div>}
    {action === 'details' && <div className="product-detail__variant"><p>Select an option to see availability and add this item to your cart.</p>{variants.length ? <div className="product-detail__variant-list">{variants.map((variant, index) => <button key={variant.sku_id || index} className={selectedVariant === String(index) ? 'active' : ''} onClick={() => { setSelectedVariant(String(index)); setQuantity(1); }}>{variantLabel(variant)}</button>)}</div> : <p>Available options are not listed yet. Contact the seller for details.</p>}{variant && <div className="product-detail__variant-summary"><span>{variantSoldOut ? 'This option is sold out' : `${variant.sku_available_stock ?? product.quantity} available`}</span><strong>{money(displayPrice * quantity, displaySymbol)}</strong></div>}{variant && !variantSoldOut && <div className="product-detail__purchase"><div className="quantity-picker"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={17}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(Number(variant.sku_available_stock) || 99, quantity + 1))} aria-label="Increase quantity"><Plus size={17}/></button></div><Button icon={ShoppingBag} variant="outline" loading={busy} onClick={add}>Add to cart</Button><Button icon={Zap} loading={busy} onClick={buyNow}>Buy now</Button></div>}</div>}
    {action === 'cart' && <div className="product-detail__purchase"><div className="quantity-picker"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={17}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(Number(product.quantity) || 99, quantity + 1))} aria-label="Increase quantity"><Plus size={17}/></button></div><Button icon={ShoppingBag} variant="outline" loading={busy} onClick={add}>Add to cart</Button><Button icon={Zap} loading={busy} onClick={buyNow}>Buy now</Button></div>}
    {product.admin && !product.vendor && product.admin.phoneNumber && <a className="button button--outline product-enquiry" href={`tel:${product.admin.phoneNumber}`}><Phone size={18}/> Call / Enquire: {product.admin.phoneNumber}</a>}
    <div className="product-detail__secondary"><SaveHeart productId={product.id} showText/>{canMessageVendor && action !== 'contact' && <button type="button" className="product-message" onClick={() => openDialog('contact')}><MessageCircle size={18}/> Message vendor</button>}<ShareProduct product={product}/></div><div className="product-detail__benefits"><span><ShieldCheck size={20}/> Shop with confidence</span><span><Truck size={20}/> Delivery options at checkout</span>{product.return_policy && <span>Returns: {product.return_policy}</span>}</div><SellerProfile product={product}/></div></div>
    <div className="product-information-grid"><ProductFacts product={product}/><ProductReviews reviews={product.reviews}/></div>
    <div className="product-related">
      {moreFromStore.length > 0 && <section className="product-related__section" aria-labelledby="more-from-store"><div className="product-related__heading"><div><span className="eyebrow">FROM THE SAME SELLER</span><h2 id="more-from-store">More from {product.store?.name || 'this store'}</h2><p>More finds from the seller behind this item.</p></div>{vendorId && <Link className="section-link" to={`/store/${encodeURIComponent(vendorId)}`}>View all products →</Link>}</div><div className="product-grid product-related__grid">{moreFromStore.map(item => <ProductCard key={item.id} product={item}/>)}</div></section>}
      {similarProducts.length > 0 && <section className="product-related__section" aria-labelledby="similar-products"><div className="product-related__heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2 id="similar-products">Similar products</h2><p>Other products you might like.</p></div></div><div className="product-grid product-related__grid">{similarProducts.map(item => <ProductCard key={item.id} product={item}/>)}</div></section>}
    </div>
    {user && dialog === 'contact' && <Modal title="Message vendor" onClose={closeDialog}><form className="offer-form" onSubmit={contactSeller}><p>Ask the vendor about <strong>{product.name}</strong>. Their reply will appear in your messages.</p><label className="field" htmlFor="contactMessage"><span className="field__label">Message</span><textarea id="contactMessage" className="field__input" rows="4" maxLength="2000" required value={contactMessage} onChange={event => setContactMessage(event.target.value)} placeholder="What would you like to know?"/></label><Button type="submit" loading={busy} disabled={!contactMessage.trim()}>Send message</Button></form></Modal>}
    {user && dialog === 'offer' && <Modal title={offer ? 'Your offer' : 'Request an offer'} onClose={closeDialog}>{offer ? <div className="offer-status"><p>You have already made an offer for this product.</p><p><strong>Status:</strong> {offer.status || 'Pending seller response'}</p>{offer.offeredPrice && <p><strong>Your price:</strong> {money(offer.offeredPrice, symbol)}</p>}<Link className="button button--primary button--md" to="/account/offers">Manage my offers</Link></div> : <form className="offer-form" onSubmit={submitOffer}><p>Send your proposed price to the seller for <strong>{product.name}</strong>.</p><TextField label={`Your offer (${symbol})`} name="offeredPrice" type="number" min="1" step="0.01" required value={offerPrice} onChange={event => setOfferPrice(event.target.value)}/><label className="field" htmlFor="offerMessage"><span className="field__label">Message (optional)</span><textarea id="offerMessage" className="field__input" rows="3" value={offerMessage} onChange={event => setOfferMessage(event.target.value)} placeholder="Add a note for the seller"/></label><Button type="submit" loading={busy}>Send offer</Button></form>}</Modal>}
    {showInstallmentModal && (
      <Modal
        title="Pay in Installments & Layaway"
        icon={<CalendarClock size={20} />}
        onClose={() => setShowInstallmentModal(false)}
        footer={
          <Button
            onClick={() => {
              setShowInstallmentModal(false);
              buyNow();
            }}
          >
            Proceed to Checkout
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
              How Layaway Works on KuduMart
            </h4>
            <ol style={{ margin: 0, paddingLeft: '18px', color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>
              <li>Select <strong>Pay in Installments</strong> during checkout.</li>
              <li>Pay your initial <strong>{depositPct}% deposit</strong> today to secure and lock in the item.</li>
              <li>The product is immediately removed from public stock and <strong>held exclusively for you</strong>.</li>
              <li>Pay your remaining milestones at your own pace within the agreed timeframe.</li>
              <li>Once fully paid, your order is dispatched immediately for delivery!</li>
            </ol>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
            * Delivery and fulfillment details will be calculated at checkout. A 5-day grace period is provided after each due date. If a plan is cancelled or defaulted, the held item returns to inventory with an 8% restocking fee deducted from your deposit refund.
          </p>
        </div>
      </Modal>
    )}
    </div>
  );
}
