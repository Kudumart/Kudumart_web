import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { imageFor, money } from '../utils/format';

export default function SearchBox({ mobile = false, onNavigate }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const routeQuery = params.get('q') || '';
  const root = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState(routeQuery);
  const [debounced, setDebounced] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => { setQuery(routeQuery); }, [routeQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) { setSuggestions([]); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    catalogApi.autocomplete(debounced, controller.signal)
      .then(items => { setSuggestions(items); setActive(-1); })
      .catch(error => { if (error.name !== 'AbortError') setSuggestions([]); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const dismiss = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  const term = query.trim();
  const currentSuggestions = debounced === term ? suggestions : [];
  const pending = term !== debounced || loading;
  const visible = open && term.length >= 2;
  const go = url => { setOpen(false); input.current?.blur(); navigate(url); onNavigate?.(); };
  const allResults = () => { if (term) go(`/catalog?q=${encodeURIComponent(term)}`); };
  const onKeyDown = event => {
    if (!visible) return;
    if (event.key === 'Escape') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const count = currentSuggestions.length + 1;
      setActive(index => event.key === 'ArrowDown' ? (index + 1) % count : (index <= 0 ? count - 1 : index - 1));
    }
    if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      const item = currentSuggestions[active];
      if (item) go(`/product/${item.id}`); else allResults();
    }
  };

  return <div className={`search-box${mobile ? ' search-box--mobile' : ''}`} ref={root}>
    <form className={mobile ? 'mobile-search' : 'header-search'} role="search" onSubmit={event => { event.preventDefault(); allResults(); }}>
      <Search size={mobile ? 17 : 19}/>
      <input ref={input} value={query} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} placeholder={mobile ? 'Search KuduMart' : 'Search products, brands, and more'} aria-label="Search products" role="combobox" aria-expanded={visible} aria-controls={mobile ? 'mobile-search-suggestions' : 'desktop-search-suggestions'} aria-autocomplete="list" autoComplete="off"/>
      <button type="submit">{mobile ? 'Go' : 'Search'}</button>
    </form>
    {visible && <div className="search-suggestions" id={mobile ? 'mobile-search-suggestions' : 'desktop-search-suggestions'} role="listbox" aria-label="Search suggestions">
      {pending && <div className="search-suggestions__status" role="status">Finding suggestions…</div>}
      {!pending && currentSuggestions.map((item, index) => <button className={`search-suggestions__item${index === active ? ' active' : ''}`} role="option" aria-selected={index === active} type="button" key={item.id} onMouseDown={event => event.preventDefault()} onClick={() => go(`/product/${item.id}`)}><span className="search-suggestions__image">{imageFor(item) && <img src={imageFor(item)} alt=""/>}</span><span><strong>{item.name}</strong><small>{money(Number(item.discount_price) > 0 && Number(item.discount_price) < Number(item.price) ? item.discount_price : item.price, item.store?.currency?.symbol || '₦')}</small></span>{item.sub_category?.name && <em>{item.sub_category.name}</em>}</button>)}
      {!pending && !currentSuggestions.length && <div className="search-suggestions__status">No quick matches. Try all results.</div>}
      <button className={`search-suggestions__all${active === currentSuggestions.length ? ' active' : ''}`} role="option" aria-selected={active === currentSuggestions.length} type="button" onMouseDown={event => event.preventDefault()} onClick={allResults}>View all results for “{term}”</button>
    </div>}
  </div>;
}
