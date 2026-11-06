import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPinned, X } from "lucide-react";
import useAppState from "../../../hooks/appState";
import useApiMutation from "../../../api/hooks/useApiMutation";

// A delivery option is "structured" when it records its coverage scope and country.
const isStructured = (option) =>
  Boolean(option?.scope) && Boolean(option?.countryCode || option?.country);

const DISMISS_KEY = "kudu_delivery_zone_notice_dismissed";

/**
 * Nudges vendors whose stores still use the old free-text delivery setup to
 * re-pick their delivery coverage with the new country / state / city picker.
 * Hidden for customers and once every store is up to date.
 */
const DeliveryZoneNotice = () => {
  const { user } = useAppState();
  const { mutate } = useApiMutation();
  const [staleStores, setStaleStores] = useState([]);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1",
  );

  const isVendor = user?.accountType === "Vendor";

  useEffect(() => {
    if (!isVendor) return;
    mutate({
      url: `/vendor/store`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const stores = response?.data?.data || [];
        setStaleStores(
          stores.filter((store) => {
            const options = Array.isArray(store.deliveryOptions)
              ? store.deliveryOptions
              : [];
            return options.length === 0 || options.some((o) => !isStructured(o));
          }),
        );
      },
      onError: () => {},
    });
  }, [isVendor]);

  if (!isVendor || dismissed || staleStores.length === 0) return null;

  const target =
    staleStores.length === 1
      ? `/profile/stores/edit/${staleStores[0].id}`
      : "/profile/stores";

  return (
    <div className="w-full mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
      <MapPinned className="mt-0.5 shrink-0" size={20} />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Update your delivery zones</p>
        <p className="mt-1">
          We now match deliveries by country, state and city. Re-select where{" "}
          {staleStores.length === 1 ? "your store delivers" : "your stores deliver"}{" "}
          so customers can still check out your products.
        </p>
        <Link
          to={target}
          className="mt-2 inline-block rounded-md bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
        >
          Update delivery zones
        </Link>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="text-amber-700 hover:text-amber-900"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default DeliveryZoneNotice;
