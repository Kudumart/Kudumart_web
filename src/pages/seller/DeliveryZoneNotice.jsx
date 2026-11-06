import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinned, X } from 'lucide-react';
import { sellerApi } from '../../api/seller';
import { useResource } from '../../hooks/useResource';
import { useApp } from '../../contexts/AppContext';

const DISMISS_KEY = 'kudu_delivery_zone_notice_dismissed';
// A delivery rule is "structured" once it records its coverage scope and country.
const isStructured = option => Boolean(option?.scope) && Boolean(option?.countryCode || option?.country);

/** Nudges vendors whose stores still use free-text delivery rules to re-pick coverage. */
export default function DeliveryZoneNotice() {
  const { user } = useApp();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
  const stores = useResource(signal => sellerApi.stores(signal), [user?.id]);
  const list = Array.isArray(stores.data) ? stores.data : Array.isArray(stores.data?.data) ? stores.data.data : [];
  const stale = list.filter(store => { const options = Array.isArray(store.deliveryOptions) ? store.deliveryOptions : []; return !options.length || options.some(option => !isStructured(option)); });
  if (dismissed || stores.loading || stores.error || !stale.length) return null;
  const target = stale.length === 1 ? `/seller/stores/${stale[0].id}` : '/seller/stores';
  return <div className="seller-purchase-notice" role="status">
    <MapPinned size={20}/>
    <div><strong>Update your delivery zones</strong><p>We now match deliveries by country, state and city. Re-select where {stale.length === 1 ? 'your store delivers' : 'your stores deliver'} so customers can still check out your products.</p></div>
    <Link className="button button--primary button--sm" to={target}>Update delivery zones</Link>
    <button type="button" className="icon-button" aria-label="Dismiss" onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}><X size={18}/></button>
  </div>;
}
