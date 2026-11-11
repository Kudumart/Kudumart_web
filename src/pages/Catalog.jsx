import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  return params.get('q')?.trim() ? <SearchResults /> : <CatalogBrowse />;
}

function CatalogBrowse() {
  const [params, setParams] = useSearchParams();
  const { country } = useApp();
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const q = params.get('q') || '';
  const vendorId = params.get('vendor') || '';
  const storeName = params.get('store') || '';
  const categoryId = params.get('category') || '';
  const categoryName = params.get('name') || '';
  const popular = params.get('popular') === 'true';
  const condition = params.get('condition') || '';
  const conditionTitle = {
    brand_new: 'Brand new finds',
    refurbished: 'Refurbished finds',
    fairly_used: 'Pre-loved finds',
  }[condition];

  const categories = useResource(signal => catalogApi.categories(signal), []);
  const PAGE_LIMIT = 24;

  // Reset and fetch page 1 whenever filters change
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadFirstPage() {
      setLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      try {
        const data = q
          ? await catalogApi.search(q, controller.signal)
          : await catalogApi.products({
              country: country.name,
              categoryId,
              vendorId,
              popular,
              condition,
              page: 1,
              limit: PAGE_LIMIT,
              signal: controller.signal,
            });

        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        setHasMore(!q && list.length >= PAGE_LIMIT);
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [country.name, categoryId, vendorId, popular, condition, q]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || q) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    try {
      const data = await catalogApi.products({
        country: country.name,
        categoryId,
        vendorId,
        popular,
        condition,
        page: nextPage,
        limit: PAGE_LIMIT,
      });

      const list = Array.isArray(data) ? data : [];
      setItems(prev => {
        const seen = new Set(prev.map(p => p.id));
        const added = list.filter(p => !seen.has(p.id));
        return [...prev, ...added];
      });
      setPage(nextPage);
      if (list.length < PAGE_LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, q, page, country.name, categoryId, vendorId, popular, condition]);

  // IntersectionObserver for auto loading when user scrolls near the bottom
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const filtered = useMemo(() => {
    let list = items;
    if (q) list = list.filter(item => `${item.name} ${item.description || ''}`.toLowerCase().includes(q.toLowerCase()));
    if (condition) list = list.filter(item => item.condition === condition);
    if (sort === 'price-asc') list = [...list].sort((a, b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price));
    if (sort === 'price-desc') list = [...list].sort((a, b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price));
    return list;
  }, [items, q, condition, sort]);

  const changeCategory = value => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set('category', value.id);
      next.set('name', value.name);
    } else {
      next.delete('category');
      next.delete('name');
    }
    setParams(next);
  };

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
      <div className="page-intro">
        <span className="eyebrow">THE MARKETPLACE</span>
        <h1>
          {q
            ? `Results for “${q}”`
            : categoryName ||
              (vendorId ? `${storeName || 'Store'} products` : '') ||
              conditionTitle ||
              (popular ? 'Popular picks' : 'Explore everything')}
        </h1>
        <p>Find something that feels just right.</p>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar__title">
            <SlidersHorizontal size={18} /> Refine your view
          </div>
          <div className="filter-group">
            <h3>Categories</h3>
            <button className={!categoryId ? 'selected' : ''} onClick={() => changeCategory(null)}>
              All products
            </button>
            {categories.data?.map(item => (
              <button
                key={item.id}
                className={categoryId === String(item.id) ? 'selected' : ''}
                onClick={() => changeCategory(item)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h3>Condition</h3>
            <button
              className={!condition ? 'selected' : ''}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete('condition');
                setParams(next);
              }}
            >
              All conditions
            </button>
            {[
              ['brand_new', 'Brand new'],
              ['refurbished', 'Refurbished'],
              ['fairly_used', 'Pre-loved'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={condition === value ? 'selected' : ''}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set('condition', value);
                  setParams(next);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span>{loading ? 'Finding products...' : `${filtered.length} products`}</span>
            <label>
              Sort by{' '}
              <select value={sort} onChange={event => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          {loading ? (
            <div className="product-grid product-grid--catalog">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="product-skeleton" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Products couldn’t be loaded"
              description={error.message}
              action={<Button variant="outline" onClick={() => location.reload()}>Try again</Button>}
            />
          ) : filtered.length ? (
            <>
              <div className="product-grid product-grid--catalog">
                {filtered.map(item => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
              <div ref={sentinelRef} style={{ padding: '36px 0 16px', textAlign: 'center', minHeight: '60px' }}>
                {loadingMore ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                    <span className="spinner" /> Loading more products…
                  </div>
                ) : hasMore ? (
                  <Button variant="outline" size="sm" onClick={loadMore}>
                    Load more products
                  </Button>
                ) : filtered.length > 12 ? (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    You’ve reached the end of the catalog ({filtered.length} products)
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No matches found"
              description="Try a different search or category."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setParams({});
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
