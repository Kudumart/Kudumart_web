import { ArrowRight, BadgeCheck, Box, LogOut, Package, ShieldCheck, ShoppingBag, Store, UserRound } from 'lucide-react';
import { sellerApi, sellerList } from '../api/seller';
import { useResource } from '../hooks/useResource';
import { Skeleton } from '../components/ui';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { useApp } from '../contexts/AppContext';
function VendorOnboarding({ user }) {
  const progress = useResource(async signal => {
    const [kyc, stores, products] = await Promise.allSettled([sellerApi.kyc(signal), sellerApi.stores(signal), sellerApi.products(signal)]);
    return {
      kyc: kyc.status === 'fulfilled' ? kyc.value : null,
      kycError: kyc.status === 'rejected' && kyc.reason?.status !== 404,
      stores: stores.status === 'fulfilled' ? sellerList(stores.value) : null,
      products: products.status === 'fulfilled' ? sellerList(products.value) : null,
    };
  }, [user.id]);
  if (progress.loading) return <Skeleton className="vendor-onboarding-skeleton"/>;
  const data = progress.data || {};
  const approved = Boolean(user.isVerified || data.kyc?.isVerified || String(data.kyc?.status || '').toLowerCase() === 'approved');
  const submitted = Boolean(data.kyc?.id || data.kyc?.kycId || (data.kyc?.businessName && data.kyc?.idVerification?.number));
  const rejected = String(data.kyc?.status || '').toLowerCase() === 'rejected';
  const hasStore = Boolean(data.stores?.length);
  const hasProduct = Boolean(data.products?.length);
  if (approved && hasStore && hasProduct) return null;
  const steps = [
    { title: 'Verify your business', description: rejected ? 'Review your details and submit them again.' : approved ? 'Your seller identity has been approved.' : submitted ? 'Your details are being reviewed.' : data.kycError ? 'Check your verification status.' : 'Submit your business and identity details.', state: approved ? 'Done' : rejected ? 'Needs attention' : submitted ? 'Under review' : 'To do', icon: ShieldCheck, to: '/seller/verification', action: approved ? 'View' : submitted && !rejected ? 'Check status' : 'Start verification' },
    { title: 'Create a store', description: 'Set up your storefront, hours, and delivery options.', state: data.stores === null ? 'Check status' : hasStore ? 'Done' : 'To do', icon: Store, to: hasStore ? '/seller/stores' : '/seller/stores/new', action: hasStore ? 'View stores' : 'Create store' },
    { title: 'List a product', description: 'Add your first item for buyers to discover.', state: data.products === null ? 'Check status' : hasProduct ? 'Done' : 'To do', icon: Box, to: hasProduct ? '/seller/products' : '/seller/products/new', action: hasProduct ? 'View products' : 'Add product' },
  ];
  return <section className="vendor-onboarding" aria-labelledby="vendor-onboarding-title"><div className="vendor-onboarding__intro"><span className="eyebrow">GET READY TO SELL</span><h2 id="vendor-onboarding-title">Set up your seller account</h2><p>Pick up where you left off. Verification can be completed while you prepare your store.</p></div><div className="vendor-onboarding__steps">{steps.map(({ title, description, state, icon: Icon, to, action }) => <article key={title} className="vendor-onboarding__step"><div className="vendor-onboarding__step-top"><span className="vendor-onboarding__icon"><Icon size={20}/></span><span className={`vendor-onboarding__state ${state === 'Done' ? 'vendor-onboarding__state--done' : ''}`}>{state === 'Done' && <BadgeCheck size={14}/>} {state}</span></div><h3>{title}</h3><p>{description}</p><Link to={to}>{action} <ArrowRight size={15}/></Link></article>)}</div></section>;
}
export default function Account() {
  const { user, signOut } = useApp(); if (!user) return <Navigate to="/login" replace/>;
  return <div className="container account-page"><div className="page-intro"><span className="eyebrow">YOUR SPACE</span><h1>Welcome, {user.firstName || 'friend'}.</h1><p>Make your next move from here.</p></div>{user.accountType?.toLowerCase() === "vendor" && <VendorOnboarding user={user}/>}<div className="account-grid"><div className="account-card account-card--welcome"><div className="account-avatar"><UserRound size={31}/></div><h2>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</h2><p>{user.email}</p><span className="account-role">{user.accountType || 'Customer'} account</span></div><Link to="/catalog" className="account-card account-card--link"><ShoppingBag size={28}/><h3>Keep exploring</h3><p>Find your next favorite thing in the marketplace.</p><ArrowRight size={20}/></Link><Link to="/account/orders" className="account-card account-card--link"><Package size={28}/><h3>Your orders</h3><p>Track every order in one place.</p><ArrowRight size={20}/></Link><Link to="/cart" className="account-card account-card--link"><Package size={28}/><h3>Your cart</h3><p>Pick up where you left off.</p><ArrowRight size={20}/></Link>{user.accountType === 'Vendor' && <Link to="/seller" className="account-card account-card--link"><Store size={28}/><h3>Seller workspace</h3><p>Manage products, orders, offers, and stores.</p><ArrowRight size={20}/></Link>}</div><Button variant="outline" icon={LogOut} onClick={signOut}>Sign out</Button></div>;
}
