import PaystackPop from '@paystack/inline-js';
import { BadgeCheck, Check, CreditCard, Gavel, Megaphone, Package, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { sellerApi, sellerList } from '../../api/seller';
import { Button, ConfirmModal, EmptyState, Skeleton } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { money } from '../../utils/format';
import { SellerHeading } from './SellerPages';

const feature = (Icon, text, enabled = true) => <li className={enabled ? '' : 'disabled'}><Icon size={17}/><span>{text}</span></li>;

export default function SellerSubscriptions() {
  const { user, notify } = useApp();
  const [revision, setRevision] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const plansResource = useResource(signal => sellerApi.subscriptionPlans(signal), [user?.id, revision]);
  const gatewayResource = useResource(signal => sellerApi.paymentGateways(signal), [user?.id]);
  const plans = sellerList(plansResource.data);
  const activePlan = plans.find(plan => plan.isActiveForVendor);
  const paystack = sellerList(gatewayResource.data).find(gateway => gateway.name?.toLowerCase().includes('paystack') && gateway.isActive !== false);

  const activatePaidPlan = async (plan, reference) => {
    setBusy(true);
    try {
      await sellerApi.subscribe(plan.id, reference);
      notify(`${plan.name} is now active.`, 'success');
      setSelectedPlan(null);
      setRevision(value => value + 1);
    } catch (error) {
      notify(`Payment reference ${reference} could not be applied: ${error.message}. Do not pay again; retry or contact support with this reference.`, 'error');
    } finally { setBusy(false); }
  };
  const startPayment = plan => {
    if (!paystack?.publicKey) { notify('Secure subscription payment is unavailable right now. Please try again later.', 'error'); return; }
    setSelectedPlan(plan);
    const popup = new PaystackPop();
    popup.newTransaction({
      key: paystack.publicKey,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      amount: Math.round(Number(plan.price) * 100),
      currency: 'NGN',
      reference: `KUDU-SUB-${Date.now()}-${String(user.id).slice(0, 8)}`,
      metadata: { subscriptionPlanId: plan.id, purpose: 'KuduMart vendor subscription' },
      onLoad: () => setBusy(false),
      onSuccess: result => activatePaidPlan(plan, result.reference),
      onCancel: () => { setSelectedPlan(null); setBusy(false); },
      onError: error => { setSelectedPlan(null); setBusy(false); notify(error?.message || 'Payment could not be opened.', 'error'); },
    });
  };
  const cancel = async () => {
    setBusy(true);
    try { await sellerApi.cancelSubscription(); notify('Your paid plan was cancelled. The Free Plan is now active.', 'success'); setCancelOpen(false); setRevision(value => value + 1); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  return <><SellerHeading eyebrow="GROW YOUR BUSINESS" title="Subscriptions" description="Choose the limits and selling tools that fit your business."/>{plansResource.loading ? <Skeleton className="seller-loading"/> : plansResource.error ? <EmptyState icon={CreditCard} title="Couldn’t load subscription plans" description={plansResource.error.message} action={<Button variant="outline" onClick={() => setRevision(value => value + 1)}>Try again</Button>}/> : plans.length ? <><div className="subscription-current"><span className="subscription-current__icon"><BadgeCheck size={23}/></span><div><span>Current plan</span><strong>{activePlan?.name || 'No active plan'}</strong><small>{activePlan ? `${activePlan.duration} month${Number(activePlan.duration) === 1 ? '' : 's'} per subscription period` : 'Choose a plan below to continue'}</small></div>{activePlan && Number(activePlan.price) > 0 && <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>Cancel plan</Button>}</div><div className="subscription-grid">{plans.map(plan => { const active = !!plan.isActiveForVendor; const isFree = Number(plan.price) <= 0; return <article className={`subscription-card ${active ? 'subscription-card--active' : ''}`} key={plan.id}>{active && <span className="subscription-card__active"><Check size={14}/> Active</span>}<span className="eyebrow">{isFree ? 'STARTER' : 'SELLER PLAN'}</span><h2>{plan.name}</h2><div className="subscription-card__price"><strong>{money(plan.price, plan.currency?.symbol || '₦')}</strong><span>for {plan.duration} month{Number(plan.duration) === 1 ? '' : 's'}</span></div><ul>{feature(Package, `Up to ${plan.productLimit ?? 0} products`)}{feature(Gavel, plan.allowsAuction ? `Up to ${plan.auctionProductLimit ?? 'unlimited'} auction listings` : 'Auction listings unavailable', plan.allowsAuction)}{feature(Sparkles, plan.allowsServiceAds ? `Up to ${plan.serviceAdsLimit ?? 'unlimited'} published services` : 'Service publishing unavailable', plan.allowsServiceAds)}{feature(Megaphone, plan.maxAds ? `${plan.maxAds} adverts for ${plan.adsDurationDays || 0} days` : 'Advertising unavailable', !!plan.maxAds)}</ul>{active ? <Button variant="outline" disabled>Current plan</Button> : isFree ? <Button variant="outline" disabled>Free fallback plan</Button> : <Button icon={CreditCard} loading={busy && selectedPlan?.id === plan.id} disabled={busy || gatewayResource.loading} onClick={() => startPayment(plan)}>Choose {plan.name}</Button>}</article>; })}</div></> : <EmptyState icon={CreditCard} title="No plans available" description="Subscription plans will appear here when configured."/>}{cancelOpen && <ConfirmModal title="Cancel paid subscription?" description="Your current paid plan will be deactivated and your account will move to the Free Plan immediately. Paid plan features and publishing limits will no longer apply." confirmLabel="Move to Free Plan" loading={busy} onClose={() => setCancelOpen(false)} onConfirm={cancel}/>}</>;
}
