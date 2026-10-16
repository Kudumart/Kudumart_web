const searchableText = value => String(value || '').replace(/<[^>]*>/g, ' ').toLowerCase();

export function streamlineSearchResults(groups, suggestions, query) {
  const phrase = query.trim().toLowerCase();
  const terms = phrase.split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const grouped = (groups || []).flatMap(group => Array.isArray(group.products) ? group.products : Array.isArray(group.items) ? group.items : []);
  const seen = new Set();
  return [...(suggestions || []), ...grouped]
    .filter(product => {
      if (!product?.id || seen.has(product.id)) return false;
      const text = searchableText([product.name, product.description, product.sku, product.brand].join(' '));
      if (!terms.every(term => text.includes(term))) return false;
      seen.add(product.id);
      return true;
    })
    .map((product, index) => {
      const name = searchableText(product.name);
      const score = name.includes(phrase) ? 2 : terms.every(term => name.includes(term)) ? 1 : 0;
      return { product, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.product);
}
