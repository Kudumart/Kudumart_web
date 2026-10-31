import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Check, Copy, MapPin, Share2, Star, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { plainText } from '../utils/format';

const humanize = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const locationText = location => [location?.address, location?.city, location?.state, location?.country].filter(Boolean).join(', ');

export function ProductFacts({ product }) {
  const facts = [
    ['Condition', humanize(product.condition)],
    ['Item code', product.sku],
    ['Available', product.quantity == null ? '' : `${product.quantity} in stock`],
    ['Warranty', product.warranty],
    ['Returns', product.return_policy],
  ].filter(([, value]) => value);
  if (!facts.length && !product.specification) return null;
  return <section className="detail-section" aria-labelledby="product-facts-title"><div className="detail-section__heading"><span className="eyebrow">THE DETAILS</span><h2 id="product-facts-title">Product information</h2></div>{facts.length > 0 && <dl className="product-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}{product.specification && <div className="product-specification"><h3>Specifications</h3><p>{plainText(product.specification)}</p></div>}</section>;
}

export function SellerProfile({ product }) {
  const vendor = product.vendor;
  const store = product.store;
  const vendorId = vendor?.id || product.vendorId;
  if (!vendor && !store) return null;
  const name = store?.name || [vendor?.firstName, vendor?.lastName].filter(Boolean).join(' ') || 'KuduMart seller';
  const address = locationText(store?.location);
  return <section className="detail-section seller-profile" aria-labelledby="seller-title"><div className="detail-section__heading"><span className="eyebrow">THE SELLER</span><h2 id="seller-title">Meet the store</h2></div><div className="seller-profile__body"><div className="seller-profile__identity">{store?.logo ? <img src={store.logo} alt=""/> : <span className="seller-profile__placeholder"><Store size={25}/></span>}<div><strong>{name}</strong>{(vendor?.isVerified || product.admin) && <span className="seller-profile__verified"><BadgeCheck size={15}/> Verified seller</span>}</div></div>{address && <p className="seller-profile__location"><MapPin size={17}/>{address}</p>}{vendorId && <Link className="seller-profile__link" to={`/store/${encodeURIComponent(vendorId)}`}>Explore this store →</Link>}</div></section>;
}

function Rating({ value }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < Math.round(rating) ? 'currentColor' : 'none'}/>)}</span>;
}

export function ProductReviews({ reviews }) {
  const items = Array.isArray(reviews) ? reviews : [];
  return <section className="detail-section" aria-labelledby="reviews-title"><div className="detail-section__heading"><span className="eyebrow">CUSTOMER VOICES</span><h2 id="reviews-title">Reviews <span className="detail-section__count">{items.length}</span></h2></div>{items.length ? <div className="product-reviews">{items.map((review, index) => { const name = [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || 'KuduMart customer'; const date = review.createdAt ? new Date(review.createdAt) : null; return <article className="product-review" key={review.id || index}><div className="product-review__top"><strong>{name}</strong>{date && !Number.isNaN(date.getTime()) && <time dateTime={review.createdAt}>{date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time>}</div><Rating value={review.rating}/>{review.comment && <p>{review.comment}</p>}</article>; })}</div> : <p className="detail-section__empty">No reviews yet for this product.</p>}</section>;
}

const socialIcons = {
  WhatsApp: <svg viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Facebook: <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
  X: <svg viewBox="0 0 24 24" fill="#111827" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  LinkedIn: <svg viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
};

export function ShareProduct({ product }) {
  const { notify } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const url = `${String(import.meta.env.VITE_API_BASE_URL || 'https://api.kudumart.com/api').replace(/\/$/, '')}/products/${product.id}/share`;
  const title = `Check out ${product.name} on KuduMart`;
  const encodedUrl = encodeURIComponent(url);
  const options = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title}: ${url}`)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];
  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const closeEscape = event => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [open]);
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setOpen(false); notify('Product link copied.', 'success'); window.setTimeout(() => setCopied(false), 2000); } catch { notify('Could not copy the link.', 'error'); } };
  return <div className="product-share" ref={menuRef}><button ref={triggerRef} type="button" aria-expanded={open} aria-controls="product-share-menu" onClick={() => setOpen(value => !value)}><Share2 size={18}/> Share</button><button type="button" onClick={copy}>{copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? 'Copied' : 'Copy link'}</button>{open && <div id="product-share-menu" className="product-share__menu"><p>Share this product</p>{options.map(({ name, href }) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{socialIcons[name]}{name}</a>)}</div>}</div>;
}
