import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Search, Store } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useResource } from '../hooks/useResource';

const locationText = value => {
  let location = value;
  if (typeof value === 'string') { try { location = JSON.parse(value); } catch { return value; } }
  return [location?.address, location?.city, location?.state, location?.country].filter(Boolean).join(', ');
};

const memberSince = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export default function Storefront() {
  const { vendorId } = useParams();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const resource = useResource(signal => catalogApi.vendorProducts(vendorId, page, 20, signal), [vendorId, page]);
  useEffect(() => { setPage(1); setQuery(''); window.scrollTo(0, 0); }, [vendorId]);
  const items = resource.data?.items || [];
  const pagination = resource.data?.pagination || {};
  const first = items[0];
  const vendor = first?.vendor;
  const store = first?.store;
  const storeName = store?.name || [vendor?.firstName, vendor?.lastName].filter(Boolean).join(' ') || 'KuduMart store';
  const address = locationText(store?.location);
  const joined = memberSince(vendor?.createdAt);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter(item => `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(search));
  }, [items, query]);
  const totalPages = Number(pagination.totalPages || 1);
  const totalCount = Number(pagination.totalCount ?? items.length);

  return (
    <div className="storefront-page">
      <SEO
        title={`${storeName} — Official Storefront`}
        description={`Explore verified products from ${storeName} on KuduMart Nigeria. Fast delivery, secure payments, and layaway installment plans.`}
        image={store?.logo}
      />
      <div className="container storefront-back"><Link to="/catalog" className="back-link"><ArrowLeft size={16}/> Back to shopping</Link></div>
    {resource.loading && !resource.data ? <div className="container"><Skeleton className="storefront-hero-skeleton"/><div className="product-grid product-grid--catalog storefront-grid">{Array.from({ length: 8 }, (_, index) => <Skeleton className="product-skeleton" key={index}/>)}</div></div>
      : resource.error ? <div className="container page-space"><EmptyState icon={Store} title="Store unavailable" description={resource.error.message} action={<Link to="/catalog"><Button variant="outline">Explore other products</Button></Link>}/></div>
      : !items.length ? <div className="container page-space"><EmptyState icon={Store} title="This store has no active products" description="There is nothing available from this seller right now." action={<Link to="/catalog"><Button>Explore the marketplace</Button></Link>}/></div>
      : <>
        <section className="storefront-hero"><div className="container storefront-hero__inner"><div className="storefront-logo">{store?.logo ? <img src={store.logo} alt=""/> : <Store size={35}/>}</div><div className="storefront-identity"><span className="eyebrow">KUDUMART STOREFRONT</span><h1>{storeName}</h1><div className="storefront-meta">{vendor?.isVerified ? <span className="storefront-verified"><BadgeCheck size={16}/> Verified seller</span> : <span className="storefront-unverified">Unverified seller</span>}{joined && <span><CalendarDays size={15}/> Selling since {joined}</span>}{address && <span><MapPin size={15}/>{address}</span>}</div></div></div></section>
        <main className="container storefront-products"><div className="storefront-products__head"><div><span className="eyebrow">SHOP THE STORE</span><h2>Products from {storeName}</h2><p>{totalCount} active {totalCount === 1 ? 'product' : 'products'}</p></div><label className="storefront-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this page" aria-label="Search products in this store"/></label></div>
          {filtered.length ? <div className="product-grid product-grid--catalog storefront-grid">{filtered.map(product => <ProductCard product={product} key={product.id}/>)}</div> : <EmptyState icon={Search} title="No products match" description="Try another search term." action={<Button variant="outline" onClick={() => setQuery('')}>Clear search</Button>}/>} 
          {totalPages > 1 && <nav className="catalog-pagination" aria-label="Store products pagination"><Button variant="outline" disabled={page <= 1 || resource.loading} onClick={() => { setPage(value => value - 1); window.scrollTo(0, 0); }}>Previous</Button><span>Page {page} of {totalPages}</span><Button variant="outline" disabled={page >= totalPages || resource.loading} onClick={() => { setPage(value => value + 1); window.scrollTo(0, 0); }}>Next</Button></nav>}
        </main>
      </>}
    </div>
  );
}
