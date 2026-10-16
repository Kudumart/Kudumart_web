import { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalog';

const cache = new Map();
const CACHE_MS = 2 * 60 * 1000;
const cached = id => {
  const entry = cache.get(id);
  if (!entry || !entry.product || Date.now() - entry.at > CACHE_MS) return null;
  return entry.product;
};
const load = id => {
  const entry = cache.get(id);
  if (entry?.promise) return entry.promise;
  const promise = catalogApi.product(id).then(product => {
    cache.set(id, { product, at: Date.now() });
    return product;
  }).catch(error => { cache.delete(id); throw error; });
  cache.set(id, { promise });
  return promise;
};
export async function refreshCanonicalProduct(id) {
  const product = await catalogApi.product(id);
  cache.set(id, { product, at: Date.now() });
  return product;
}
export function useCanonicalProduct(id, elementRef) {
  const [state, setState] = useState(() => ({ id, product: cached(id) }));
  useEffect(() => {
    let active = true;
    const known = cached(id);
    setState({ id, product: known });
    if (known) return () => { active = false; };
    const fetchDetail = () => load(id).then(product => { if (active) setState({ id, product }); }).catch(() => {});
    if (!elementRef.current || typeof IntersectionObserver === 'undefined') { fetchDetail(); return () => { active = false; }; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); fetchDetail(); }
    }, { rootMargin: '320px' });
    observer.observe(elementRef.current);
    return () => { active = false; observer.disconnect(); };
  }, [id, elementRef]);
  return state.id === id ? state.product : null;
}
