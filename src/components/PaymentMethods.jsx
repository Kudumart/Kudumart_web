import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePaystackPayment } from 'react-paystack';
import { Button } from './ui';

export function PaystackPayment({ amount, email, onPaid, disabled }) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const config = { reference: `kudu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, email, amount: Math.round(amount * 100), publicKey: key, currency: 'NGN' };
  const launch = usePaystackPayment(config);
  const [opening, setOpening] = useState(false);
  const start = () => { setOpening(true); launch({ onSuccess: result => { setOpening(false); if (result?.reference) onPaid(result.reference); }, onClose: () => setOpening(false) }); };
  return <Button className="checkout-pay-button" type="button" onClick={start} disabled={disabled || opening} loading={opening}>Pay securely with Paystack</Button>;
}

function StripeForm({ onPaid, onError, amount }) {
  const stripe = useStripe(); const elements = useElements(); const [busy, setBusy] = useState(false);
  const submit = async event => { event.preventDefault(); if (!stripe || !elements) return; setBusy(true); try { const submitted = await elements.submit(); if (submitted.error) throw new Error(submitted.error.message); const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/checkout?stripe_return=1` }, redirect: 'if_required' }); if (result.error) throw new Error(result.error.message); if (result.paymentIntent?.status === 'succeeded') await onPaid(result.paymentIntent.id); else if (result.paymentIntent?.status !== 'processing') throw new Error('Payment was not completed.'); } catch (error) { onError(error.message); } finally { setBusy(false); } };
  return <form onSubmit={submit} className="stripe-form"><PaymentElement/><Button className="checkout-pay-button" type="submit" loading={busy} disabled={!stripe || busy}>Pay {amount}</Button></form>;
}

export function StripePayment({ clientSecret, amount, onPaid, onError }) {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const [stripePromise] = useState(() => loadStripe(key));
  return <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#f36b31', borderRadius: '10px', fontFamily: 'DM Sans, sans-serif' } } }}><StripeForm amount={amount} onPaid={onPaid} onError={onError}/></Elements>;
}
