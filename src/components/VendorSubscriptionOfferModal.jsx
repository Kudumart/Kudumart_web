import React, { useEffect, useMemo, useState } from "react";
import useApiMutation from "../api/hooks/useApiMutation";
import { useModal } from "../hooks/modal";
import Button from "./Button";

const VendorSubscriptionOfferModal = ({ vendor, onSaved }) => {
  const { mutate } = useApiMutation();
  const { closeModal } = useModal();
  const [plans, setPlans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [planId, setPlanId] = useState("");
  const [specialPrice, setSpecialPrice] = useState("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === planId), [plans, planId]);
  const activeOffers = offers.filter((offer) => offer.isActive && !offer.redeemedAt && (!offer.expiresAt || new Date(offer.expiresAt) > new Date()));

  const loadData = () => {
    setLoading(true);
    let plansDone = false;
    let offersDone = false;
    const done = () => {
      if (plansDone && offersDone) setLoading(false);
    };
    mutate({
      url: "/admin/subscription/plans",
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const nextPlans = response?.data?.data || [];
        setPlans(nextPlans);
        setPlanId((current) => current || nextPlans[0]?.id || "");
        plansDone = true;
        done();
      },
      onError: () => { plansDone = true; done(); },
    });
    mutate({
      url: `/admin/vendors/${vendor.id}/subscription-offers`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOffers(response?.data?.data?.offers || []);
        offersDone = true;
        done();
      },
      onError: () => { offersDone = true; done(); },
    });
  };

  useEffect(() => { loadData(); }, []);

  const saveOffer = () => {
    if (!planId || specialPrice === "" || !reason.trim()) return;
    setSaving(true);
    mutate({
      url: `/admin/vendors/${vendor.id}/subscription-offers`,
      method: "POST",
      headers: true,
      data: {
        subscriptionPlanId: planId,
        specialPrice: Number(specialPrice),
        reason: reason.trim(),
        expiresAt: expiresAt || null,
      },
      onSuccess: () => {
        setSaving(false);
        onSaved?.();
        closeModal();
      },
      onError: () => setSaving(false),
    });
  };

  const revokeOffer = (offerId) => {
    mutate({
      url: `/admin/subscription-offers/${offerId}/revoke`,
      method: "PATCH",
      headers: true,
      onSuccess: loadData,
    });
  };

  return (
    <div className="w-full px-2 py-3">
      <h2 className="text-xl font-semibold text-gray-900">Marketing subscription offer</h2>
      <p className="mt-1 text-sm text-gray-600">
        Set a one-time price for {vendor.name || `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim()}. Enter 0 to waive the fee.
      </p>

      {activeOffers.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-gray-800">Active offers</p>
          {activeOffers.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
              <div>
                <p className="font-semibold">{offer.subscriptionPlan?.name}: {offer.subscriptionPlan?.currency?.symbol || "₦"}{Number(offer.specialPrice).toLocaleString()}</p>
                <p className="text-gray-600">{offer.reason}{offer.expiresAt ? ` · expires ${new Date(offer.expiresAt).toLocaleDateString()}` : ""}</p>
              </div>
              <button type="button" className="font-semibold text-red-600" onClick={() => revokeOffer(offer.id)}>Revoke</button>
            </div>
          ))}
        </div>
      )}

      {loading ? <p className="py-8 text-center text-sm text-gray-500">Loading plans…</p> : (
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-medium text-gray-800">
            Subscription plan
            <select className="mt-1 w-full rounded-lg border border-gray-300 p-3" value={planId} onChange={(e) => { setPlanId(e.target.value); setSpecialPrice(""); }}>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {plan.currency?.symbol || "₦"}{Number(plan.price).toLocaleString()}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-800">
            Special price
            <input type="number" min="0" max={selectedPlan?.price} step="0.01" className="mt-1 w-full rounded-lg border border-gray-300 p-3" value={specialPrice} onChange={(e) => setSpecialPrice(e.target.value)} placeholder="0 waives the full fee" />
            {selectedPlan && <span className="mt-1 block text-xs text-gray-500">Normal price: {selectedPlan.currency?.symbol || "₦"}{Number(selectedPlan.price).toLocaleString()}</span>}
          </label>
          <label className="text-sm font-medium text-gray-800">
            Campaign or reason
            <input className="mt-1 w-full rounded-lg border border-gray-300 p-3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: Launch partner campaign" maxLength={255} />
          </label>
          <label className="text-sm font-medium text-gray-800">
            Expiry date (optional)
            <input type="datetime-local" min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} className="mt-1 w-full rounded-lg border border-gray-300 p-3" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button onClick={saveOffer} disabled={loading || saving || !planId || specialPrice === "" || !reason.trim()}>{saving ? "Saving…" : Number(specialPrice) === 0 ? "Waive fee" : "Save offer"}</Button>
      </div>
    </div>
  );
};

export default VendorSubscriptionOfferModal;
