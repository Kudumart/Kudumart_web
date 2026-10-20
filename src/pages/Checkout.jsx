import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import PaystackPop from '@paystack/inline-js';
import { accountApi } from '../api/account';
import { checkoutApi } from '../api/checkout';
import AddressForm from '../components/AddressForm';
import { StripePayment } from '../components/PaymentMethods';
import { Button, EmptyState, Modal, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { availableStock, calculateNairaQuote, formatAddress, hasDeliveryAddress, isDropship, parseLocation, paymentMode } from '../utils/checkout';
import { imageFor, money } from '../utils/format';
import './Checkout.css';

export default function Checkout() {
  const { user, country, setCartCount } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddress, setShowAddress] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('customer');
  const [paymentReady, setPaymentReady] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('kuduPendingCheckout') || 'null'); }
    catch { return null; }
  });

  const cart = useResource(signal => user ? accountApi.cart(signal) : Promise.resolve([]), [user?.id]);
  const items = Array.isArray(cart.data) ? cart.data : cart.data?.data || [];
  const location = parseLocation(user?.location);
  const hasAddress = hasDeliveryAddress(location);
  const mode = paymentMode({ country: location?.country || country.name });
  const countryCode = location?.country === 'Nigeria' ? 'NG' : location?.country === 'United Kingdom' ? 'UK' : country.code;
  const canPickup = mode === 'NGN' && !items.some(isDropship);
  const needsDelivery = deliveryOption !== 'store' || !canPickup;
  const charges = useResource(signal => user && items.length && mode === 'NGN' ? checkoutApi.charges(signal) : Promise.resolve([]), [user?.id, items.length, mode]);
  const deliveryFees = useResource(signal => user && items.length && mode === 'NGN' && needsDelivery && hasAddress ? checkoutApi.deliveryFees(countryCode, signal) : Promise.resolve(null), [user?.id, items.length, mode, needsDelivery, hasAddress, countryCode, location?.city, location?.zipCode]);
  const quote = useMemo(() => {
    if (mode !== 'NGN' || (needsDelivery && !hasAddress)) return null;
    try {
      return calculateNairaQuote(items, Array.isArray(charges.data) ? charges.data : charges.data?.data || [], needsDelivery ? Number(deliveryFees.data?.totalDeliveryFee || 0) : 0);
    } catch { return null; }
  }, [mode, items, charges.data, deliveryFees.data, needsDelivery, hasAddress]);
  const stockIssues = items.filter(item => {
    const stock = availableStock(item);
    return stock !== null && Number(item.quantity) > stock;
  });
  const addressText = needsDelivery ? formatAddress(location) : 'Pickup at Kudumart Store';
  const canPay = Boolean(user && items.length && (hasAddress || (!needsDelivery && canPickup)) && !stockIssues.length && !cart.loading && !cart.error && !pendingPayment && (mode !== 'NGN' || (!charges.loading && (!needsDelivery || !deliveryFees.loading) && !charges.error && (!needsDelivery || !deliveryFees.error) && quote?.total > 0)));

  const completeOrder = async payment => {
    if (!payment || confirming) return;
    const pending = typeof payment === 'string' ? { refId: payment, mode, shippingAddress: addressText, shippingAddressZipCode: location?.zipCode } : payment;
    if (!pending.refId) return;
    sessionStorage.setItem('kuduPendingCheckout', JSON.stringify(pending));
    setPendingPayment(pending);
    setConfirming(true);
    setConfirmationError('');
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          if (pending.mode === 'NGN') await checkoutApi.confirmNaira(pending);
          else await checkoutApi.confirmDollar(pending);
          break;
        } catch (error) {
          const referenceNotFound = pending.mode === 'NGN' && /transaction reference not found/i.test(error.message);
          if (!referenceNotFound || attempt === 2) throw error;
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        }
      }
      sessionStorage.removeItem('kuduPendingCheckout');
      setPendingPayment(null);
      setCartCount(0);
      setOrderSuccess(true);
    } catch (error) {
      setConfirmationError(`We could not verify payment reference ${pending.refId}: ${error.message}. Do not pay again. Retry verification or contact support with this reference.`);
    } finally { setConfirming(false); }
  };

  useEffect(() => {
    if (searchParams.get('stripe_return') !== '1' || !searchParams.get('payment_intent_client_secret') || !import.meta.env.VITE_STRIPE_PUBLIC_KEY) return;
    let active = true;
    loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY).then(async stripe => {
      if (!active || !stripe) return;
      const result = await stripe.retrievePaymentIntent(searchParams.get('payment_intent_client_secret'));
      if (!active) return;
      if (result.paymentIntent?.status === 'succeeded') await completeOrder(result.paymentIntent.id);
      else setConfirmationError(result.error?.message || `Payment status: ${result.paymentIntent?.status || 'unknown'}`);
      setSearchParams({}, { replace: true });
    });
    return () => { active = false; };
  }, []);

  const startNaira = async () => {
    if (!canPay) return;
    setPreparing(true);
    setConfirmationError('');
    try {
      const prepared = await checkoutApi.prepareNaira();
      const accessCode = prepared?.paystackDetails?.access_code;
      if (!prepared?.refId || !accessCode) throw new Error('Paystack did not return a secure payment session.');
      const pending = { refId: prepared.refId, mode: 'NGN', shippingAddress: addressText, shippingAddressZipCode: location?.zipCode };
      sessionStorage.setItem('kuduPendingCheckout', JSON.stringify(pending));
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onLoad: () => setPreparing(false),
        onSuccess: result => completeOrder({ ...pending, refId: result?.reference || pending.refId }),
        onCancel: () => { sessionStorage.removeItem('kuduPendingCheckout'); setPreparing(false); },
        onError: error => { sessionStorage.removeItem('kuduPendingCheckout'); setConfirmationError(error?.message || 'Paystack could not open the payment session.'); setPreparing(false); },
      });
    } catch (error) {
      setConfirmationError(error.message);
      setPreparing(false);
    }
  };

  const startDollar = async () => {
    if (!canPay) return;
    setPreparing(true);
    setConfirmationError('');
    try {
      const prepared = await checkoutApi.prepareDollar(addressText);
      if (!prepared?.clientSecret || !Number.isFinite(Number(prepared.totalAmount)) || Number(prepared.totalAmount) <= 0) throw new Error('The payment quote was incomplete.');
      setPaymentReady(prepared);
    } catch (error) { setConfirmationError(error.message); }
    finally { setPreparing(false); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout' }}/>;
  return <div className="container checkout-page">
    <Link to="/cart" className="back-link"><ArrowLeft size={16}/> Back to cart</Link>
    <div className="page-intro"><span className="eyebrow">THE FINAL DETAILS</span><h1>Checkout, made simple.</h1><p>Review everything before you place your order.</p></div>
    {cart.loading ? <Skeleton className="cart-skeleton"/> : cart.error ? <EmptyState title="We couldn’t load your cart" description={cart.error.message}/> : !items.length ? <EmptyState title="Your cart is empty" description="Find something you love before checking out." action={<Link to="/catalog"><Button>Explore products</Button></Link>}/> :
      <div className="checkout-layout"><div className="checkout-main">
        <section className="checkout-panel">
          <div className="checkout-panel__heading"><div className="checkout-step">1</div><div><h2>Delivery details</h2><p>Where should your order go?</p></div></div>
          {hasAddress ? <div className="delivery-options"><label className={needsDelivery ? 'selected' : ''}><input type="radio" name="delivery" checked={needsDelivery} onChange={() => { setDeliveryOption('customer'); setPaymentReady(null); }}/><MapPin size={20}/><span><strong>Deliver to my address</strong><small>{formatAddress(location)}</small></span></label></div> : <div className="checkout-address-empty"><span className="checkout-address-empty__icon"><MapPin size={24}/></span><div><h3>No delivery address yet</h3><p>Add your street, city, and postal code to calculate delivery and continue to payment.</p></div><Button type="button" onClick={() => setShowAddress(true)}>Add address</Button></div>}
          {canPickup && <div className="delivery-options"><label className={!needsDelivery ? 'selected' : ''}><input type="radio" name="delivery" checked={!needsDelivery} onChange={() => { setDeliveryOption('store'); setPaymentReady(null); }}/><PackageCheck size={20}/><span><strong>Pick up from KuduMart</strong><small>Abeokuta, Ogun State, Nigeria</small></span></label></div>}
          {hasAddress && <Button variant="outline" size="sm" onClick={() => setShowAddress(true)}>Change address</Button>}
        </section>
        <section className="checkout-panel">
          <div className="checkout-panel__heading"><div className="checkout-step">2</div><div><h2>Payment</h2><p>Protected payment, with your details reviewed first.</p></div></div>
          {stockIssues.length > 0 && <div className="form-alert" role="alert">Some items are no longer available in the requested quantity. <Link to="/cart">Update your cart</Link> before paying.</div>}
          {mode === 'NGN' && (hasAddress || !needsDelivery) && !quote && !charges.loading && !deliveryFees.loading && <div className="form-alert" role="alert">We couldn’t calculate a valid total. Review your cart before paying.</div>}
          {pendingPayment ? <div className="checkout-warning"><strong>Payment verification pending</strong><p>{confirmationError || `Checking reference ${pendingPayment.refId} with the payment provider. Do not pay again.`}</p><Button variant="outline" loading={confirming} onClick={() => completeOrder(pendingPayment)}>Retry verification</Button></div>
            : needsDelivery && !hasAddress ? <div className="checkout-warning"><MapPin size={20}/><div><strong>Add a delivery address to continue</strong><p>We’ll show the final delivery cost and unlock payment once your address is saved.</p></div></div>
            : mode === 'NGN' ? charges.error || (needsDelivery && deliveryFees.error) ? <div className="form-alert">We couldn’t verify the current charges or delivery fee. Please try again.</div> : <Button className="checkout-pay-button" type="button" icon={CreditCard} onClick={startNaira} disabled={!canPay} loading={preparing}>Continue to secure payment</Button>
            : paymentReady ? <StripePayment clientSecret={paymentReady.clientSecret} publicKey={paymentReady.publicKey} amount={money(paymentReady.totalAmount, '$')} onPaid={completeOrder} onError={setConfirmationError}/>
            : <Button loading={preparing} disabled={!canPay} onClick={startDollar} icon={CreditCard}>Continue to secure payment</Button>}
          {confirmationError && !pendingPayment && <div className="form-alert" role="alert">{confirmationError}</div>}
        </section>
      </div><aside className="checkout-summary"><h2>Order summary</h2><div className="checkout-summary__items">{items.map(item => <div className="checkout-summary__item" key={item.id}><div className="checkout-summary__image">{imageFor(item.product) && <img src={imageFor(item.product)} alt=""/>}</div><div><strong>{item.product?.name}</strong><span>Qty {item.quantity}</span></div></div>)}</div>
        {mode === 'NGN' ? quote ? <><div className="checkout-summary__row"><span>Items</span><strong>{money(quote.subtotal)}</strong></div><div className="checkout-summary__row"><span>Product charges</span><strong>{money(quote.charges)}</strong></div><div className="checkout-summary__row"><span>Delivery</span><strong>{needsDelivery && deliveryFees.loading ? 'Checking…' : money(quote.delivery)}</strong></div><div className="checkout-summary__total"><span>Total</span><strong>{charges.loading || (needsDelivery && deliveryFees.loading) ? 'Checking…' : money(quote.total)}</strong></div></> : <p className="checkout-summary__hint">{needsDelivery && !hasAddress ? 'Add a delivery address to see your final total.' : 'Calculating your total…'}</p>
          : paymentReady ? <><div className="checkout-summary__row"><span>Items</span><strong>{money(paymentReady.paymentBreakdown?.subtotal, '$')}</strong></div><div className="checkout-summary__row"><span>Charges</span><strong>{money(paymentReady.paymentBreakdown?.chargeAmount, '$')}</strong></div><div className="checkout-summary__total"><span>Total</span><strong>{money(paymentReady.totalAmount, '$')}</strong></div></> : <p className="checkout-summary__hint">{needsDelivery && !hasAddress ? 'Add a delivery address to see your final total.' : 'Your final dollar total comes from the payment quote before you pay.'}</p>}
        <p className="checkout-summary__assurance"><ShieldCheck size={17}/> Your order is confirmed only after payment is verified.</p></aside></div>}
    {showAddress && <Modal title="Delivery address" onClose={() => setShowAddress(false)}><AddressForm onSaved={() => { setShowAddress(false); setPaymentReady(null); }} onCancel={() => setShowAddress(false)}/></Modal>}
    {orderSuccess && <Modal title="Order confirmed" icon={<CheckCircle2 size={20}/>} onClose={() => navigate('/account/orders', { replace: true })} footer={<Button icon={PackageCheck} onClick={() => navigate('/account/orders', { replace: true })}>View my orders</Button>}><div className="checkout-success"><span className="checkout-success__icon"><CheckCircle2 size={38}/></span><h3>Thank you for your order!</h3><p>Your payment was verified and your order has been placed successfully. You can follow its progress from your orders page.</p></div></Modal>}
  </div>;
}
