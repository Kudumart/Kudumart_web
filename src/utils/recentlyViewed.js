const STORAGE_KEY = 'kudumart_recently_viewed';
const MAX_ITEMS = 12;

export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(product) {
  if (typeof window === 'undefined' || !product || !product.id) return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(item => String(item.id) !== String(product.id));
    const next = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('kudu:recently-viewed-changed', { detail: next }));
  } catch {
    // Ignore storage quota or security errors
  }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kudu:recently-viewed-changed', { detail: [] }));
  } catch {
    // Ignore storage errors
  }
}
