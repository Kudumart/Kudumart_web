import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, CreditCard, Info, MapPin, MessageCircle, PackageCheck, Phone, ShieldCheck } from 'lucide-react';
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
import { availableStock, calculateNairaQuote, countryCodeForLocation, formatAddress, hasDeliveryAddress, isDropship, parseLocation, paymentMode } from '../utils/checkout';
import { imageFor, money } from '../utils/format';
import './Checkout.css';

export default function Checkout() {
  const { user, country, setCartCount, notify } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddress, setShowAddress] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('customer');
  const [paymentReady, setPaymentReady] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [selectedStoreVendor, setSelectedStoreVendor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' | 'installment'
  const [selectedTenureId, setSelectedTenureId] = useState(null);
  const [selectedDepositPct, setSelectedDepositPct] = useState(null);
  const [installmentSuccess, setInstallmentSuccess] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('kuduPendingCheckout') || 'null'); }
    catch { return null; }
  });

  const installmentConfigResource = useResource(
    (signal) => checkoutApi.installmentConfig(signal),
    [],
  );

  const cart = useResource(signal => user ? accountApi.cart(signal) : Promise.resolve([]), [user?.id]);
  const items = Array.isArray(cart.data) ? cart.data : cart.data?.data || [];
  const location = parseLocation(user?.location);
  const hasAddress = hasDeliveryAddress(location);
  const mode = paymentMode({ items, country: location?.country || country.name });
  const countryCode = countryCodeForLocation(location, country.code);
  const canPickup = mode === 'NGN' && !items.some(isDropship);
  const needsDelivery = deliveryOption !== 'store' || !canPickup;
  const charges = useResource(signal => user && items.length && mode === 'NGN' ? checkoutApi.charges(signal) : Promise.resolve([]), [user?.id, items.length, mode]);
  const deliveryFees = useResource(signal => user && items.length && mode === 'NGN' && needsDelivery && hasAddress ? checkoutApi.deliveryFees(countryCode, signal) : Promise.resolve(null), [user?.id, items.length, mode, needsDelivery, hasAddress, countryCode, location?.city, location?.zipCode]);
  const deliveryError = needsDelivery ? deliveryFees.error : null;
  const quoteError = charges.error || deliveryError;
  const supportPhone = items.find(i => i.product?.admin?.phoneNumber)?.product?.admin?.phoneNumber || '+2348133059324';
  const supportPhoneDisplay = supportPhone.replace(/^(\+234|0)(\d{3})(\d{3})(\d{4})$/, '+234 $2 $3 $4');
  // Group cart items by store / vendor so multi-vendor carts are cleanly separated
  const storeVendors = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const vendor = item.product?.vendor;
      const vendorId = vendor?.id || item.product?.vendorId;
      const storeName = item.product?.store?.name || [vendor?.firstName, vendor?.lastName].filter(Boolean).join(' ') || 'the seller';
      const storeId = item.product?.store?.id || vendorId || item.id;
      if (!map.has(storeId)) {
        map.set(storeId, {
          storeId,
          storeName,
          vendorId,
          productId: item.productId || item.product?.id,
          productNames: [item.product?.name].filter(Boolean),
          items: [item]
        });
      } else {
        const entry = map.get(storeId);
        entry.items.push(item);
        if (item.product?.name && !entry.productNames.includes(item.product.name)) {
          entry.productNames.push(item.product.name);
        }
      }
    }
    return Array.from(map.values());
  }, [items]);

  // Identify if a specific store is mentioned in the delivery/rate error (e.g. "${store.name} does not have a delivery rate for...")
  const troubledStore = useMemo(() => {
    if (!quoteError?.message) return null;
    const msg = quoteError.message.toLowerCase();
    return storeVendors.find(sv =>
      (sv.storeName && msg.includes(sv.storeName.toLowerCase())) ||
      sv.items.some(item => item.product?.name && msg.includes(item.product.name.toLowerCase()))
    ) || null;
  }, [quoteError, storeVendors]);

  const activeStoreVendor = selectedStoreVendor || troubledStore || storeVendors[0];
  const sellerStoreName = activeStoreVendor?.storeName || 'the seller';
  const sellerVendorId = activeStoreVendor?.vendorId;
  const sellerProductId = activeStoreVendor?.productId;

  const openMessageModalForStore = (sv) => {
    const target = sv || troubledStore || storeVendors[0];
    if (!target) return;
    setSelectedStoreVendor(target);
    const productList = target.productNames?.length ? `"${target.productNames.join(', ')}"` : 'items in my cart';
    setMessageText(`Hi ${target.storeName}, I'd like to order ${productList}, but delivery to ${location?.city || 'my location'} is unavailable. Could you provide a delivery rate?`);
    setMessageModal(true);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!sellerVendorId || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      await accountApi.sendMessage({
        productId: sellerProductId,
        receiverId: sellerVendorId,
        content: messageText.trim()
      });
      notify(`Message sent to ${sellerStoreName}. Their reply will appear in your messages.`, 'success');
      setMessageText('');
      setMessageModal(false);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSendingMessage(false);
    }
  };
  const chargeQuote = useMemo(() => {
    if (mode !== 'NGN' || charges.error) return null;
    try { return calculateNairaQuote(items, Array.isArray(charges.data) ? charges.data : charges.data?.data || [], 0); }
    catch { return null; }
  }, [mode, items, charges.data, charges.error]);
  const quote = useMemo(() => {
    if (mode !== 'NGN' || quoteError || (needsDelivery && !hasAddress)) return null;
    try {
      return calculateNairaQuote(items, Array.isArray(charges.data) ? charges.data : charges.data?.data || [], needsDelivery ? Number(deliveryFees.data?.totalDeliveryFee || 0) : 0);
    } catch { return null; }
  }, [mode, items, charges.data, deliveryFees.data, needsDelivery, hasAddress, quoteError]);
  const stockIssues = items.filter(item => {
    const stock = availableStock(item);
    return stock !== null && Number(item.quantity) > stock;
  });
  const addressText = needsDelivery ? formatAddress(location) : 'Pickup at Kudumart Store';
  const canPay = Boolean(user && items.length && (hasAddress || (!needsDelivery && canPickup)) && !stockIssues.length && !cart.loading && !cart.error && !pendingPayment && (mode !== 'NGN' || (!charges.loading && (!needsDelivery || !deliveryFees.loading) && !charges.error && (!needsDelivery || !deliveryFees.error) && quote?.total > 0)));

  const instConfig = installmentConfigResource.data?.data;
  const isInstallmentEligible = Boolean(
    mode === 'NGN' &&
    instConfig &&
    instConfig.system_mode !== 'disabled' &&
    items.length === 1 &&
    quote?.total >= Number(instConfig.min_order_amount) &&
    quote?.total <= Number(instConfig.max_order_amount)
  );

  const activeTenures = useMemo(() => {
    return (instConfig?.allowed_tenures || []).filter((t) => t.is_active !== false);
  }, [instConfig]);

  const activeTenure = activeTenures.find((t) => t.id === selectedTenureId) || activeTenures[0];
  const effectiveDepositPct = selectedDepositPct || instConfig?.min_deposit_percentage || 25;

  const installmentBreakdown = useMemo(() => {
    if (!quote?.total || !activeTenure) return null;
    const total = quote.total;
    const deposit = Math.round((total * (effectiveDepositPct / 100)) * 100) / 100;
    const remaining = Math.round((total - deposit) * 100) / 100;
    const subCount = Math.max(1, activeTenure.installments - 1);
    const subAmount = Math.round((remaining / subCount) * 100) / 100;
    return {
      deposit,
      remaining,
      subCount,
      subAmount,
      tenure: activeTenure,
      total,
    };
  }, [quote?.total, activeTenure, effectiveDepositPct]);

  const completeOrder = async payment => {
    if (!payment || confirming) return;
    const pending = typeof payment === 'string' ? { refId: payment, mode, shippingAddress: addressText, shippingAddressZipCode: location?.zipCode, deliveryMethod: needsDelivery ? 'delivery' : 'pickup' } : payment;
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
      const method = needsDelivery ? 'delivery' : 'pickup';
      const prepared = await checkoutApi.prepareNaira(method);
      const accessCode = prepared?.paystackDetails?.access_code;
      if (!prepared?.refId || !accessCode) throw new Error('Paystack did not return a secure payment session.');
      const pending = { refId: prepared.refId, mode: 'NGN', shippingAddress: addressText, shippingAddressZipCode: location?.zipCode, deliveryMethod: method };
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

  const startInstallment = async () => {
    if (!canPay || !activeTenure || !items.length || !installmentBreakdown) return;
    setPreparing(true);
    setConfirmationError('');
    try {
      const firstItem = items[0];
      const method = needsDelivery ? 'delivery' : 'pickup';
      const payload = {
        productId: firstItem.productId || firstItem.product?.id,
        quantity: firstItem.quantity,
        tenureId: activeTenure.id,
        depositPercentage: effectiveDepositPct,
        shippingAddress: addressText,
        deliveryMethod: method,
        deliveryFee: needsDelivery ? Number(deliveryFees.data?.totalDeliveryFee || 0) : 0,
      };

      const prepared = await checkoutApi.prepareInstallment(payload);
      const accessCode = prepared?.data?.paystackDetails?.access_code;
      const refId = prepared?.data?.refId;

      if (!accessCode || !refId) throw new Error('Paystack did not return a valid checkout session.');

      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onLoad: () => setPreparing(false),
        onSuccess: async (result) => {
          try {
            setConfirming(true);
            const confirmedRef = result?.reference || refId;
            await checkoutApi.confirmInstallment({
              ...payload,
              refId: confirmedRef,
            });
            setCartCount(0);
            setInstallmentSuccess(true);
          } catch (err) {
            setConfirmationError(`Deposit was charged (${result?.reference}), but layaway plan recording encountered an error: ${err.message}. Please contact support.`);
          } finally {
            setConfirming(false);
          }
        },
        onCancel: () => setPreparing(false),
        onError: (err) => {
          setConfirmationError(err?.message || 'Payment provider encountered an error.');
          setPreparing(false);
        },
      });
    } catch (err) {
      setConfirmationError(err.message);
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

  useEffect(() => {
    if (mode === 'NGN' || !user || !items.length || (needsDelivery && !hasAddress) || stockIssues.length > 0 || paymentReady) return;
    let active = true;
    setPreparing(true);
    setConfirmationError('');
    checkoutApi.prepareDollar(addressText)
      .then(prepared => {
        if (!active) return;
        if (!prepared?.clientSecret || !Number.isFinite(Number(prepared.totalAmount)) || Number(prepared.totalAmount) <= 0) {
          throw new Error('The payment quote was incomplete.');
        }
        setPaymentReady(prepared);
      })
      .catch(err => {
        if (!active) return;
        setConfirmationError(err.message || 'Failed to calculate payment quote.');
      })
      .finally(() => {
        if (active) setPreparing(false);
      });
    return () => { active = false; };
  }, [mode, user?.id, items.length, hasAddress, needsDelivery, addressText, stockIssues.length, paymentReady]);

  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout' }}/>;
  return <div className="container checkout-page">
    <Link to="/cart" className="back-link"><ArrowLeft size={16}/> Back to cart</Link>
    <div className="page-intro"><span className="eyebrow">THE FINAL DETAILS</span><h1>Checkout, made simple.</h1><p>Review everything before you place your order.</p></div>
    {cart.loading ? <Skeleton className="cart-skeleton"/> : cart.error ? <EmptyState title="We couldn’t load your cart" description={cart.error.message}/> : !items.length ? <EmptyState title="Your cart is empty" description="Find something you love before checking out." action={<Link to="/catalog"><Button>Explore products</Button></Link>}/> :
      <div className="checkout-layout"><div className="checkout-main">
        <section className="checkout-panel">
          <div className="checkout-panel__heading"><div className="checkout-step">1</div><div><h2>Delivery details</h2><p>Where should your order go?</p></div></div>
          {hasAddress ? <div className="delivery-options"><label className={needsDelivery ? 'selected' : ''}><input type="radio" name="delivery" checked={needsDelivery} onChange={() => { setDeliveryOption('customer'); setPaymentReady(null); }}/><MapPin size={20}/><span><strong>Deliver to my address</strong><small>{formatAddress(location)}</small></span></label></div> : <div className="checkout-address-empty"><span className="checkout-address-empty__icon"><MapPin size={24}/></span><div><h3>No delivery address yet</h3><p>Add your street, city, and postal code to calculate delivery and continue to payment.</p></div><Button type="button" onClick={() => setShowAddress(true)}>Add address</Button></div>}
          {canPickup && <div className="delivery-options"><label className={!needsDelivery ? 'selected' : ''}><input type="radio" name="delivery" checked={!needsDelivery} onChange={() => { setDeliveryOption('store'); setPaymentReady(null); }}/><PackageCheck size={20}/><span><strong>Pick up from KuduMart</strong><small>52, Gbemisola Adenubi Street, Off Ago Palace Way, by Jemtok Bus Stop, Ago-Okota, Lagos</small></span></label></div>}
          {hasAddress && <Button variant="outline" size="sm" onClick={() => setShowAddress(true)}>Change address</Button>}
        </section>
        <section className="checkout-panel">
          <div className="checkout-panel__heading"><div className="checkout-step">2</div><div><h2>Payment</h2><p>Protected payment, with your details reviewed first.</p></div></div>
          {stockIssues.length > 0 && <div className="form-alert" role="alert">Some items are no longer available in the requested quantity. <Link to="/cart">Update your cart</Link> before paying.</div>}
          {mode === 'NGN' && (hasAddress || !needsDelivery) && !quote && !charges.loading && !deliveryFees.loading && <div className="form-alert" role="alert">We couldn’t calculate a valid total. Review your cart before paying.</div>}
          {pendingPayment ? <div className="checkout-warning"><strong>Payment verification pending</strong><p>{confirmationError || `Checking reference ${pendingPayment.refId} with the payment provider. Do not pay again.`}</p><Button variant="outline" loading={confirming} onClick={() => completeOrder(pendingPayment)}>Retry verification</Button></div>
            : needsDelivery && !hasAddress ? <div className="checkout-warning"><MapPin size={20}/><div><strong>Add a delivery address to continue</strong><p>We’ll show the final delivery cost and unlock payment once your address is saved.</p></div></div>
            : mode === 'NGN' ? quoteError ? <div className="checkout-warning"><div><strong>{deliveryError ? 'Delivery is unavailable for this address' : 'We couldn’t verify the current product charges'}</strong><p>{(quoteError.message || 'Please try again before continuing to payment.').replace(/contact the seller\.?/i, 'choose contact options.')}</p><div className="checkout-warning__actions">{deliveryError && canPickup && <Button variant="outline" size="sm" onClick={() => { setDeliveryOption('store'); setPaymentReady(null); }}>Use pickup instead</Button>}{activeStoreVendor?.vendorId && <Button variant="outline" size="sm" icon={MessageCircle} onClick={() => openMessageModalForStore(troubledStore || activeStoreVendor)}>Message {troubledStore ? troubledStore.storeName : 'seller'}</Button>}<a className="button button--outline button--sm checkout-support-btn" href={`tel:${supportPhone}`}><Phone size={14}/> Contact support ({supportPhoneDisplay})</a></div></div></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isInstallmentEligible && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div
                      onClick={() => setPaymentPlan('full')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: paymentPlan === 'full' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        background: paymentPlan === 'full' ? '#f8fafc' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Pay in Full</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Pay {money(quote.total)} now in full
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentPlan('installment')}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: paymentPlan === 'installment' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        background: paymentPlan === 'installment' ? '#f8fafc' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarClock size={16} color="#e11d48" /> Layaway / Installment
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Reserve item with deposit; pay in parts
                      </div>
                    </div>
                  </div>
                )}

                {isInstallmentEligible && paymentPlan === 'installment' && installmentBreakdown ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                        Payment Duration
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {activeTenures.map((tenure) => (
                          <button
                            key={tenure.id}
                            type="button"
                            onClick={() => setSelectedTenureId(tenure.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: activeTenure?.id === tenure.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                              background: activeTenure?.id === tenure.id ? '#0f172a' : '#fff',
                              color: activeTenure?.id === tenure.id ? '#fff' : '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            {tenure.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                        Initial Deposit Down
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[instConfig.min_deposit_percentage, 35, 50]
                          .filter((v, i, a) => a.indexOf(v) === i && v >= instConfig.min_deposit_percentage)
                          .map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setSelectedDepositPct(pct)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                                border: effectiveDepositPct === pct ? '2px solid #0f172a' : '1px solid #cbd5e1',
                                background: effectiveDepositPct === pct ? '#0f172a' : '#fff',
                                color: effectiveDepositPct === pct ? '#fff' : '#334155',
                                cursor: 'pointer',
                              }}
                            >
                              {pct}% ({money(Math.round(quote.total * (pct / 100)))})
                            </button>
                          ))}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Deposit due today:</span>
                        <strong style={{ color: '#0f172a' }}>{money(installmentBreakdown.deposit)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Remaining ({installmentBreakdown.subCount} payments of {money(installmentBreakdown.subAmount)}):</span>
                        <span>{money(installmentBreakdown.remaining)}</span>
                      </div>
                      <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                        🔒 <strong>Holding reservation:</strong> Stock is reserved exclusively for you. Order fulfills immediately upon final payment settlement.
                      </div>
                    </div>

                    <Button
                      className="checkout-pay-button"
                      type="button"
                      icon={CalendarClock}
                      onClick={startInstallment}
                      disabled={!canPay}
                      loading={preparing}
                    >
                      Pay Deposit & Reserve Item ({money(installmentBreakdown.deposit)})
                    </Button>
                  </div>
                ) : (
                  <Button className="checkout-pay-button" type="button" icon={CreditCard} onClick={startNaira} disabled={!canPay} loading={preparing}>
                    Continue to secure payment
                  </Button>
                )}
              </div>
            )
            : paymentReady ? <StripePayment clientSecret={paymentReady.clientSecret} publicKey={paymentReady.publicKey} amount={money(paymentReady.totalAmount, '$')} onPaid={completeOrder} onError={setConfirmationError}/>
            : preparing ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: '#64748b', fontSize: 13 }}><span className="spinner" /><span>Calculating quote and preparing payment options…</span></div>
            : <div><Button loading={preparing} disabled={!canPay} onClick={startDollar} icon={CreditCard}>Proceed to payment options</Button><small style={{ display: 'block', marginTop: 8, color: '#64748b', fontSize: 12 }}>You will review your final quote and enter payment details before any charge is made.</small></div>}
          {confirmationError && !pendingPayment && <div className="form-alert" role="alert">{confirmationError}</div>}
        </section>
      </div><aside className="checkout-summary"><h2>Order summary</h2><div className="checkout-summary__items">{items.map(item => <div className="checkout-summary__item" key={item.id}><div className="checkout-summary__image">{imageFor(item.product) && <img src={imageFor(item.product)} alt=""/>}</div><div><strong>{item.product?.name}</strong><span>Qty {item.quantity}</span></div></div>)}</div>
        {mode === 'NGN' ? quote ? <><div className="checkout-summary__row"><span>Items</span><strong>{money(quote.subtotal)}</strong></div><div className="checkout-summary__row"><span>Product charges</span><strong>{money(quote.charges)}</strong></div><div className="checkout-summary__row"><span>Delivery</span><strong>{needsDelivery && deliveryFees.loading ? 'Checking…' : money(quote.delivery)}</strong></div><div className="checkout-summary__total"><span>Total</span><strong>{charges.loading || (needsDelivery && deliveryFees.loading) ? 'Checking…' : money(quote.total)}</strong></div></> : quoteError ? <><div className="checkout-summary__row"><span>Items</span><strong>{chargeQuote ? money(chargeQuote.subtotal) : '—'}</strong></div><div className="checkout-summary__row"><span>Product charges</span><strong>{chargeQuote ? money(chargeQuote.charges) : '—'}</strong></div><div className="checkout-summary__row"><span>Delivery</span><strong>Unavailable</strong></div><div className="checkout-summary__total"><span>Total</span><strong>—</strong></div></> : <p className="checkout-summary__hint">{needsDelivery && !hasAddress ? 'Add a delivery address to see your final total.' : 'Calculating your total…'}</p>
          : paymentReady ? <><div className="checkout-summary__row"><span>Items</span><strong>{money(paymentReady.paymentBreakdown?.subtotal, '$')}</strong></div><div className="checkout-summary__row"><span>Product charges</span><strong>{money(paymentReady.paymentBreakdown?.chargeAmount, '$')}</strong></div><div className="checkout-summary__total"><span>Total</span><strong>{money(paymentReady.totalAmount, '$')}</strong></div></> : preparing ? <p className="checkout-summary__hint">Calculating your payment quote…</p> : <p className="checkout-summary__hint">{needsDelivery && !hasAddress ? 'Add a delivery address to see your final total.' : 'Your final dollar total comes from the payment quote before you pay.'}</p>}
        <p className="checkout-summary__assurance"><ShieldCheck size={17}/> Your order is confirmed only after payment is verified.</p></aside></div>}
    {showAddress && <Modal title="Delivery address" onClose={() => setShowAddress(false)}><AddressForm onSaved={() => { setShowAddress(false); setPaymentReady(null); }} onCancel={() => setShowAddress(false)}/></Modal>}
    {messageModal && <Modal title={`Message ${sellerStoreName}`} onClose={() => setMessageModal(false)}><form className="offer-form" onSubmit={handleSendMessage}>{storeVendors.length > 1 && <label className="field" htmlFor="selectStoreVendor"><span className="field__label">Store / Seller to contact</span><select id="selectStoreVendor" className="field__input" value={activeStoreVendor?.storeId || ''} onChange={event => { const chosen = storeVendors.find(sv => sv.storeId === event.target.value); if (chosen) { setSelectedStoreVendor(chosen); const productList = chosen.productNames?.length ? `"${chosen.productNames.join(', ')}"` : 'items in my cart'; setMessageText(`Hi ${chosen.storeName}, I'd like to order ${productList}, but delivery to ${location?.city || 'my location'} is unavailable. Could you provide a delivery rate?`); } }}>{storeVendors.map(sv => <option key={sv.storeId} value={sv.storeId}>{sv.storeName} {sv.storeId === troubledStore?.storeId ? '(needs delivery rate update)' : ''}</option>)}</select></label>}<p>Ask <strong>{sellerStoreName}</strong> about delivery to your address or alternative options. Their reply will appear in your messages.</p><label className="field" htmlFor="checkoutMessage"><span className="field__label">Message</span><textarea id="checkoutMessage" className="field__input" rows="4" maxLength="2000" required value={messageText} onChange={event => setMessageText(event.target.value)} placeholder="What would you like to ask the seller?"/></label><Button type="submit" loading={sendingMessage} disabled={!messageText.trim()}>Send message</Button></form></Modal>}
    {orderSuccess && <Modal title="Order confirmed" icon={<CheckCircle2 size={20}/>} onClose={() => navigate('/account/orders', { replace: true })} footer={<Button icon={PackageCheck} onClick={() => navigate('/account/orders', { replace: true })}>View my orders</Button>}><div className="checkout-success"><span className="checkout-success__icon"><CheckCircle2 size={38}/></span><h3>Thank you for your order!</h3><p>Your payment was verified and your order has been placed successfully. You can follow its progress from your orders page.</p></div></Modal>}
    {installmentSuccess && (
      <Modal
        title="Layaway Reservation Confirmed"
        icon={<CheckCircle2 size={20} />}
        onClose={() => navigate('/account/installments', { replace: true })}
        footer={
          <Button icon={CalendarClock} onClick={() => navigate('/account/installments', { replace: true })}>
            View my layaways
          </Button>
        }
      >
        <div className="checkout-success">
          <span className="checkout-success__icon">
            <CheckCircle2 size={38} color="#16a34a" />
          </span>
          <h3>Your item is reserved!</h3>
          <p>
            Your initial deposit was verified and the product has been placed on hold exclusively for you. You can track upcoming due dates and make payments from your Installments page.
          </p>
        </div>
      </Modal>
    )}
  </div>;
}
