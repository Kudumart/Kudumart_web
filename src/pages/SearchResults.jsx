import { ArrowRight, ImageOff, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useResource } from '../hooks/useResource';
import { plainText } from '../utils/format';
import { streamlineSearchResults } from '../utils/searchResults';

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() || '';
  const [tab, setTab] = useState('products');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 12;
  useEffect(() => { setProductPage(1); }, [query]);
  const products = useResource(async signal => {
    const [groups, suggestions] = await Promise.all([
      catalogApi.searchGrouped(query, signal),
      catalogApi.autocomplete(query, signal),
    ]);
    return streamlineSearchResults(groups, suggestions, query);
  }, [query]);
  const services = useResource(signal => tab === 'services' ? catalogApi.searchServices(query, page, signal) : Promise.resolve([]), [query, tab, page]);
  const sortedProducts = useMemo(() => {
    const items = products.data || [];
    if (sort === 'featured') return items;
    const price = item => Number(item.discount_price) > 0 && Number(item.discount_price) < Number(item.price) ? Number(item.discount_price) : Number(item.price);
    return [...items].sort((a, b) => sort === 'price-asc' ? price(a) - price(b) : price(b) - price(a));
  }, [products.data, sort]);
  const productPageCount = Math.ceil(sortedProducts.length / productsPerPage);
  const visibleProducts = sortedProducts.slice((productPage - 1) * productsPerPage, productPage * productsPerPage);

  return (
    <div className="catalog-page container search-results-page">
      <SEO
        title={query ? `Results for “${query}”` : 'Search Products & Services'}
        description={`Find "${query || 'products'}" on KuduMart Nigeria with verified sellers, best prices, and secure layaway installment options.`}
      />
      <div className="page-intro"><span className="eyebrow">THE MARKETPLACE</span><h1>Results for “{query}”</h1><p>Explore the finds and services matching your search.</p></div>
    <div className="search-results-tabs" role="tablist" aria-label="Search result type"><button type="button" role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button><button type="button" role="tab" aria-selected={tab === 'services'} className={tab === 'services' ? 'active' : ''} onClick={() => { setTab('services'); setPage(1); }}>Services</button></div>
    {tab === 'products' ? products.loading ? <div className="product-grid product-grid--catalog">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="product-skeleton"/>)}</div> : products.error ? <EmptyState icon={Search} title="Search is unavailable" description={products.error.message}/> : sortedProducts.length ? <>
      <div className="catalog-toolbar"><span>{sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found</span><label>Sort by <select value={sort} onChange={event => { setSort(event.target.value); setProductPage(1); }}><option value="featured">Most relevant</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
      <div className="product-grid product-grid--catalog search-results-grid">{visibleProducts.map(item => <ProductCard key={item.id} product={item}/>)}</div>
      {productPageCount > 1 && <div className="catalog-pagination"><Button variant="outline" disabled={productPage <= 1} onClick={() => { setProductPage(value => value - 1); window.scrollTo(0, 0); }}>Previous</Button><span>Page {productPage} of {productPageCount}</span><Button variant="outline" disabled={productPage >= productPageCount} onClick={() => { setProductPage(value => value + 1); window.scrollTo(0, 0); }}>Next</Button></div>}
    </> : <EmptyState icon={Search} title="No product matches" description="Try another search term." action={<Link to="/catalog"><Button variant="outline">Browse all products</Button></Link>}/> : services.loading ? <div className="discovery-grid">{[1,2,3,4].map(index => <Skeleton key={index} className="discovery-skeleton"/>)}</div> : services.error ? <EmptyState icon={Search} title="Services couldn’t be loaded" description={services.error.message}/> : services.data?.length ? <><div className="discovery-grid">{services.data.map(item => { const itemImg = item.image_url || item.image; const itemTitle = item.name || item.title || 'Service'; return <article className="discovery-card" key={item.id}><Link to={`/services/${item.id}`} className="discovery-card__image" aria-label={`View ${itemTitle}`}>{itemImg ? <img src={itemImg} alt={itemTitle} loading="lazy"/> : <span className="image-fallback"><ImageOff size={32}/></span>}</Link><div className="discovery-card__body"><span className="eyebrow">SERVICE</span><h3>{itemTitle}</h3><p>{plainText(item.description).slice(0, 140)}</p><Link to={`/services/${item.id}`} className="discovery-card__link">View details <ArrowRight size={16}/></Link></div></article>; })}</div><div className="catalog-pagination"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page}</span><Button variant="outline" disabled={services.data.length < 10} onClick={() => setPage(value => value + 1)}>Next</Button></div></> : <EmptyState icon={Search} title="No service matches" description="Try another search term."/>}
    </div>
  );
}
