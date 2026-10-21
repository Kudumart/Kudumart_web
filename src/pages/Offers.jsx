import { useState } from 'react';
import PaystackPop from '@paystack/inline-js';
import { CheckCircle2, Clock3, CreditCard, PackageCheck, Tag, XCircle } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import AddressForm from '../components/AddressForm';
import { Button, EmptyState, Modal, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { formatAddress, hasDeliveryAddress, parseLocation } from '../utils/checkout';
import { imageFor, money } from '../utils/format';
import './Offers.css';

const statusCopy = {
  pending: ['Waiting for seller', Clock3],
  countered: ['Seller countered', Tag],
  accepted: ['Ready for payment', CheckCircle2],
  rejected: ['Offer declined', XCircle],
  completed: ['Order placed', PackageCheck],
};

export default function Offers() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const resource = useResource(signal => user ? accountApi.offers(signal) : Promise.resolve([]), [user?.id, revision]);
  const offers = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];
  const location = parseLocation(user?.location);
  const address = formatAddress(location);

  const respond = async status => {
    setBusy(true);
    try {
      await accountApi.respondToOffer(selected.id, status);
      notify(status === 'accepted' ? 'Counteroffer accepted. You can now complete payment.' : 'Counteroffer declined.', 'success');
      setSelected(null);
      setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  const pay = async offer => {
    if (!hasDeliveryAddress(location)) { setSelected(offer); setShowAddress(true); return; }
    setBusy(true);
    try {
      const prepared = await accountApi.initiateOfferPayment(offer.id);
      const accessCode = prepared?.paystackDetails?.access_code;
      const refId = prepared?.refId;
      if (!accessCode || !refId) throw new Error('Paystack did not return a secure payment session.');
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onLoad: () => setBusy(false),
        onSuccess: async result => {
          setBusy(true);
          try {
            const order = await accountApi.checkoutOffer(offer.id, result?.reference || refId, address);
            setSuccess(order);
            setRevision(value => value + 1);
          } catch (error) { notify(`${error.message} Do not pay again; contact support with reference ${result?.reference || refId}.`, 'error'); }
          finally { setBusy(false); }
        },
        onCancel: () => setBusy(false),
        onError: error => { setBusy(false); notify(error?.message || 'Paystack could not open the payment session.', 'error'); },
      });
    } catch (error) { setBusy(false); notify(error.message, 'error'); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/account/offers' }}/>;
  return <div className="container offers-page"><div className="page-intro"><span className="eyebrow">AGREED YOUR WAY</span><h1>Your offers.</h1><p>See seller responses and complete purchases at the agreed price.</p></div>
    {resource.loading ? <Skeleton className="offers-skeleton"/> : resource.error ? <EmptyState icon={Tag} title="Your offers couldn’t be loaded" description={resource.error.message}/> : !offers.length ? <EmptyState icon={Tag} title="No offers yet" description="Products that allow negotiation will appear here after you send an offer." action={<Link to="/catalog"><Button>Explore products</Button></Link>}/> : <div className="offers-list">{offers.map(offer => {
      const [label, Icon] = statusCopy[offer.status] || [offer.status, Tag];
      const agreedPrice = offer.counterPrice ?? offer.offeredPrice;
      return <article className="offer-card" key={offer.id}><div className="offer-card__image">{imageFor(offer.product) && <img src={imageFor(offer.product)} alt=""/>}</div><div className="offer-card__body"><div className={`offer-card__status offer-card__status--${offer.status}`}><Icon size={15}/>{label}</div><h2>{offer.product?.name || 'Product offer'}</h2><div className="offer-card__prices"><span>Listed <strong>{money(offer.product?.price)}</strong></span><span>Your offer <strong>{money(offer.offeredPrice)}</strong></span>{offer.counterPrice && <span>Seller price <strong>{money(offer.counterPrice)}</strong></span>}</div>{offer.message && <p className="offer-card__message">“{offer.message}”</p>}</div><div className="offer-card__action">{offer.status === 'countered' && <Button variant="outline" onClick={() => setSelected(offer)}>Review counteroffer</Button>}{offer.status === 'accepted' && <><strong>{money(agreedPrice)}</strong><Button icon={CreditCard} loading={busy} onClick={() => pay(offer)}>Pay securely</Button></>}{offer.status === 'completed' && <Button variant="outline" onClick={() => navigate('/account/orders')}>View orders</Button>}</div></article>;
    })}</div>}
    {selected && !showAddress && selected.status === 'countered' && <Modal title="Seller counteroffer" icon={<Tag size={20}/>} onClose={busy ? () => {} : () => setSelected(null)} footer={<><Button variant="ghost" disabled={busy} onClick={() => respond('rejected')}>Decline</Button><Button loading={busy} onClick={() => respond('accepted')}>Accept {money(selected.counterPrice)}</Button></>}><div className="offer-counter"><p>The seller responded to your offer for <strong>{selected.product?.name}</strong>.</p><div><span>Your offer <strong>{money(selected.offeredPrice)}</strong></span><span>Seller’s counteroffer <strong>{money(selected.counterPrice)}</strong></span></div><small>Accepting unlocks secure payment. No charge is made until you continue to payment.</small></div></Modal>}
    {showAddress && <Modal title="Add a delivery address" onClose={() => setShowAddress(false)}><p className="offer-address-note">Add the address where this product should be delivered, then return here to pay.</p><AddressForm onSaved={() => { setShowAddress(false); notify('Address saved. You can now continue to payment.', 'success'); }} onCancel={() => setShowAddress(false)}/></Modal>}
    {success && <Modal title="Offer order confirmed" icon={<CheckCircle2 size={20}/>} onClose={() => navigate('/account/orders')} footer={<Button icon={PackageCheck} onClick={() => navigate('/account/orders')}>View my orders</Button>}><div className="checkout-success"><span className="checkout-success__icon"><CheckCircle2 size={38}/></span><h3>Thank you for your order!</h3><p>Your agreed price was paid and your order has been placed. You can follow its progress from your orders page.</p>{success.trackingNumber && <small>Tracking number: {success.trackingNumber}</small>}</div></Modal>}
  </div>;
}
