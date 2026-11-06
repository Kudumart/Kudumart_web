import { useState } from "react";
import { adminApi } from "../../api/admin";
import { Button, Modal, SelectField, TextField } from "../../components/ui";
import { useResource } from "../../hooks/useResource";

const asNumber = (value) => (value === "" || value === undefined ? 0 : Number(value));
const yesNo = (value) => (value ? "true" : "false");

/** Create or edit a vendor subscription plan. `plan` is undefined when creating. */
export default function AdminPlanForm({ plan, onClose, onSaved }) {
  const currencies = useResource((signal) => adminApi.currencies(signal), []);
  const currencyList = Array.isArray(currencies.data?.data) ? currencies.data.data : Array.isArray(currencies.data) ? currencies.data : [];
  const [values, setValues] = useState({
    name: plan?.name || "",
    duration: plan?.duration ?? "",
    price: plan?.price ?? "",
    currencyId: plan?.currencyId || plan?.currency?.id || "",
    productLimit: plan?.productLimit ?? "",
    allowsAuction: yesNo(plan?.allowsAuction),
    auctionProductLimit: plan?.auctionProductLimit ?? "",
    allowsServiceAds: yesNo(plan?.allowsServiceAds),
    serviceAdsLimit: plan?.serviceAdsLimit ?? "",
    allowsAdvert: yesNo(plan ? Number(plan.maxAds) > 0 : true),
    maxAds: plan?.maxAds ?? "",
    adsDurationDays: plan?.adsDurationDays ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const auctions = values.allowsAuction === "true";
  const serviceAds = values.allowsServiceAds === "true";
  const adverts = values.allowsAdvert === "true";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      ...(plan ? { planId: plan.id } : {}),
      name: values.name.trim(),
      duration: asNumber(values.duration),
      price: asNumber(values.price),
      currencyId: values.currencyId,
      productLimit: asNumber(values.productLimit),
      allowsAuction: auctions,
      auctionProductLimit: auctions ? asNumber(values.auctionProductLimit) : 0,
      allowsServiceAds: serviceAds,
      serviceAdsLimit: serviceAds ? asNumber(values.serviceAdsLimit) : 0,
      maxAds: adverts ? asNumber(values.maxAds) : 0,
      adsDurationDays: adverts ? asNumber(values.adsDurationDays) : 0,
    };
    try {
      const response = await adminApi.saveSubscriptionPlan(body);
      onSaved(response?.message || (plan ? "Subscription plan updated." : "Subscription plan created."));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={plan ? "Edit subscription plan" : "New subscription plan"} onClose={onClose}>
      <form className="offer-form" onSubmit={submit}>
        <TextField label="Plan name" name="name" required value={values.name} onChange={change} />
        <div className="form-row">
          <TextField label="Duration (days)" name="duration" type="number" min="1" required value={values.duration} onChange={change} />
          <TextField label="Price" name="price" type="number" min="0" step="0.01" required value={values.price} onChange={change} />
        </div>
        <SelectField label="Currency" name="currencyId" required value={values.currencyId} onChange={change}>
          <option value="">{currencies.loading ? "Loading…" : "Choose currency"}</option>
          {currencyList.map((item) => (<option key={item.id} value={item.id}>{item.code || item.name} {item.symbol ? `(${item.symbol})` : ""}</option>))}
        </SelectField>
        <TextField label="Product limit" name="productLimit" type="number" min="0" required value={values.productLimit} onChange={change} />
        <div className="form-row">
          <SelectField label="Allow auctions" name="allowsAuction" value={values.allowsAuction} onChange={change}><option value="true">Yes</option><option value="false">No</option></SelectField>
          <TextField label="Auction listing limit" name="auctionProductLimit" type="number" min="0" disabled={!auctions} required={auctions} value={auctions ? values.auctionProductLimit : ""} onChange={change} />
        </div>
        <div className="form-row">
          <SelectField label="Allow service adverts" name="allowsServiceAds" value={values.allowsServiceAds} onChange={change}><option value="true">Yes</option><option value="false">No</option></SelectField>
          <TextField label="Service advert limit" name="serviceAdsLimit" type="number" min="0" disabled={!serviceAds} required={serviceAds} value={serviceAds ? values.serviceAdsLimit : ""} onChange={change} />
        </div>
        <SelectField label="Allow product adverts" name="allowsAdvert" value={values.allowsAdvert} onChange={change}><option value="true">Yes</option><option value="false">No</option></SelectField>
        {adverts && <div className="form-row">
          <TextField label="Maximum adverts" name="maxAds" type="number" min="1" required value={values.maxAds} onChange={change} />
          <TextField label="Advert duration (days)" name="adsDurationDays" type="number" min="1" required value={values.adsDurationDays} onChange={change} />
        </div>}
        {error && <div className="form-alert" role="alert">{error}</div>}
        <div className="modal__actions">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{plan ? "Save changes" : "Create plan"}</Button>
        </div>
      </form>
    </Modal>
  );
}
