import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPinned, X } from 'lucide-react';
import { sellerApi } from '../../api/seller';
import { useResource } from '../../hooks/useResource';
import { useApp } from '../../contexts/AppContext';

const DISMISS_KEY = 'kudu_delivery_zone_notice_dismissed';

export const isStructured = option =>
  Boolean(option?.scope) &&
  Boolean(option?.countryCode || option?.country) &&
  Boolean(option?.city) &&
  Number(option?.price) >= 0;

export const hasValidDeliveryZones = store => {
  const options = Array.isArray(store?.deliveryOptions) ? store.deliveryOptions : [];
  return options.length > 0 && options.some(isStructured);
};

/** Nudges vendors whose stores still use free-text delivery rules to re-pick coverage. */
export default function DeliveryZoneNotice() {
  const { user } = useApp();
  const location = useLocation();
  const isVendor = user?.accountType?.toLowerCase() === 'vendor';
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
  const stores = useResource(
    signal => isVendor ? sellerApi.stores(signal) : Promise.resolve([]),
    [user?.id, isVendor, location.pathname, location.key]
  );
  const list = Array.isArray(stores.data) ? stores.data : Array.isArray(stores.data?.data) ? stores.data.data : [];
  const stale = list.filter(store => !hasValidDeliveryZones(store));

  if (!isVendor || dismissed || stores.loading || stores.error || !stale.length) return null;

  const target = stale.length === 1 ? `/seller/stores/${stale[0].id}` : '/seller/stores';
  const message = stale.length === 1
    ? `Your store "${stale[0].name}" needs delivery zones set so customers can check out your products.`
    : `${stale.length} of your stores need delivery zones set so customers can check out your products.`;

  return (
    <div className="seller-purchase-notice" role="status">
      <MapPinned size={20}/>
      <div>
        <strong>Update your delivery zones</strong>
        <p>{message}</p>
      </div>
      <Link className="button button--primary button--sm" to={target}>
        {stale.length === 1 ? 'Configure delivery' : 'Update delivery zones'}
      </Link>
      <button
        type="button"
        className="icon-button"
        aria-label="Dismiss"
        onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}
      >
        <X size={18}/>
      </button>
    </div>
  );
}
