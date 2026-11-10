import { useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import SearchResults from './SearchResults';
export default function Catalog() {
  const [params] = useSearchParams();
  return params.get('q')?.trim() ? <SearchResults/> : <CatalogBrowse/>;
}
function CatalogBrowse() {
  const [params, setParams] = useSearchParams(); const { country } = useApp();
  const [sort, setSort] = useState('featured'); const [page, setPage] = useState(1);
  const q = params.get('q') || ''; const vendorId = params.get('vendor') || ''; const storeName = params.get('store') || ''; const categoryId = params.get('category') || ''; const categoryName = params.get('name') || '';
  const popular = params.get('popular') === 'true'; const condition = params.get('condition') || '';
  const conditionTitle = { brand_new: 'Brand new finds', refurbished: 'Refurbished finds', fairly_used: 'Pre-loved finds' }[condition];
  const products = useResource(signal => q ? catalogApi.search(q, signal) : catalogApi.products({ country: country.name, categoryId, vendorId, popular, condition, page, limit: 24, signal }), [country.name, categoryId, vendorId, popular, condition, page, q]);
  const categories = useResource(signal => catalogApi.categories(signal), []);
  const filtered = useMemo(() => { let items = products.data || []; if (q) items = items.filter(item => `${item.name} ${item.description || ''}`.toLowerCase().includes(q.toLowerCase())); if (condition) items = items.filter(item => item.condition === condition); if (sort === 'price-asc') items = [...items].sort((a,b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price)); if (sort === 'price-desc') items = [...items].sort((a,b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price)); return items; }, [products.data, q, vendorId, condition, sort]);
  const changeCategory = value => { const next = new URLSearchParams(params); if (value) { next.set('category', value.id); next.set('name', value.name); } else { next.delete('category'); next.delete('name'); } setParams(next); setPage(1); };
  const pageTitle = q
    ? `Search: ${q}`
    : categoryName
      ? `${categoryName} — Products`
      : vendorId
        ? `${storeName || 'Store'} Products`
        : conditionTitle || (popular ? 'Popular Picks' : 'Shop All Products');
  const pageDesc = categoryName
    ? `Browse ${categoryName} on KuduMart Nigeria. Enjoy verified sellers, best prices, fast delivery, and layaway installment plans.`
    : `Shop thousands of products across fashion, electronics, gadgets, and home goods on KuduMart Nigeria.`;

  return (
    <div className="catalog-page container">
      <SEO title={pageTitle} description={pageDesc} />
      <div className="page-intro"><span className="eyebrow">THE MARKETPLACE</span><h1>{q ? `Results for “${q}”` : categoryName || (vendorId ? `${storeName || 'Store'} products` : '') || conditionTitle || (popular ? 'Popular picks' : 'Explore everything')}</h1><p>Find something that feels just right.</p></div><div className="catalog-layout"><aside className="catalog-sidebar"><div className="catalog-sidebar__title"><SlidersHorizontal size={18}/> Refine your view</div><div className="filter-group"><h3>Categories</h3><button className={!categoryId ? 'selected' : ''} onClick={() => changeCategory(null)}>All products</button>{categories.data?.map(item => <button key={item.id} className={categoryId === String(item.id) ? 'selected' : ''} onClick={() => changeCategory(item)}>{item.name}</button>)}</div><div className="filter-group"><h3>Condition</h3><button className={!condition ? 'selected' : ''} onClick={() => { const next = new URLSearchParams(params); next.delete('condition'); setParams(next); }}>All conditions</button>{[['brand_new', 'Brand new'], ['refurbished', 'Refurbished'], ['fairly_used', 'Pre-loved']].map(([value, label]) => <button key={value} className={condition === value ? 'selected' : ''} onClick={() => { const next = new URLSearchParams(params); next.set('condition', value); setParams(next); setPage(1); }}>{label}</button>)}</div></aside><div className="catalog-results"><div className="catalog-toolbar"><span>{products.loading ? 'Finding products...' : `${filtered.length} products`}</span><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>{products.loading ? <div className="product-grid product-grid--catalog">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="product-skeleton"/>)}</div> : products.error ? <EmptyState title="Products couldn’t be loaded" description={products.error.message} action={<Button variant="outline" onClick={() => location.reload()}>Try again</Button>}/> : filtered.length ? <div className="product-grid product-grid--catalog">{filtered.map(item => <ProductCard key={item.id} product={item}/>)}</div> : <EmptyState icon={Search} title="No matches found" description="Try a different search or category." action={<Button variant="outline" onClick={() => { setParams({}); setPage(1); }}>Clear filters</Button>}/>}        </div>
      </div>
    </div>
  );
}
