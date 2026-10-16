import { useState } from 'react';
import { Heart, LoaderCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { useApp } from '../contexts/AppContext';

export default function SaveHeart({ productId, savedOverride = false, onRemoved, showText = false }) {
  const { user, notify, savedIds, markSaved, markUnsaved } = useApp();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const saved = savedOverride || savedIds.has(productId);
  const label = saved ? 'Remove from saved items' : 'Save for later';
  const toggle = async () => {
    if (!user) { navigate('/login', { state: { from: `${location.pathname}${location.search}` } }); return; }
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await accountApi.removeSavedProduct(productId);
        const result = await accountApi.savedProducts();
        const items = Array.isArray(result) ? result : result?.data || [];
        if (items.some(item => (item.productId || item.product?.id) === productId)) throw new Error('This item is still saved. Please try again.');
        markUnsaved(productId);
        onRemoved?.(productId);
        notify('Removed from your saved items.', 'success');
      } else {
        await accountApi.saveProduct(productId);
        markSaved(productId);
        notify('Saved to your items.', 'success');
      }
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  const Icon = busy ? LoaderCircle : Heart;
  return <button type="button" className={`${showText ? 'product-save' : 'icon-button product-card__heart'} ${saved ? 'product-card__heart--saved' : ''} ${busy ? 'product-card__heart--busy' : ''}`} aria-label={busy ? (saved ? 'Removing saved item' : 'Saving item') : label} aria-pressed={saved} aria-busy={busy} title={label} disabled={busy} onClick={toggle}><Icon size={showText ? 18 : 20} strokeWidth={1.9}/>{showText && <span>{saved ? 'Saved' : 'Save item'}</span>}</button>;
}
