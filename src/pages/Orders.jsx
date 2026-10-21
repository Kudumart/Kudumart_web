import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, Package, Star, Truck, XCircle } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import { Button, ConfirmModal, EmptyState, Modal, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { imageFor, money } from '../utils/format';
import './Orders.css';

const stages = ['pending', 'processing', 'shipped', 'delivered'];
const title = value => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const date = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent order';

function StatusJourney({ status }) {
  const cancelled = status === 'cancelled';
  const active = stages.indexOf(status);
  return <div className={`order-journey ${cancelled ? 'order-journey--cancelled' : ''}`}>{cancelled ? <div className="order-journey__cancelled"><XCircle size={19}/><span><strong>Cancelled</strong><small>This item will not be fulfilled.</small></span></div> : stages.map((stage, index) => {
    const complete = active >= index;
    const Icon = stage === 'pending' ? Clock3 : stage === 'processing' ? Package : stage === 'shipped' ? Truck : CheckCircle2;
    return <div className={`order-stage ${complete ? 'order-stage--complete' : ''}`} key={stage}><span><Icon size={16}/></span><small>{title(stage)}</small></div>;
  })}</div>;
}

function OrderDetail({ id, user }) {
  const { notify } = useApp();
  const [revision, setRevision] = useState(0);
  const [action, setAction] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const resource = useResource(signal => checkoutApi.orderItems(id, signal), [user?.id, id, revision]);
  const reviewsResource = useResource(signal => checkoutApi.reviews(signal), [user?.id, revision]);
  const items = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];
  const first = items[0];
  const order = first?.order || {};
  const reviews = Array.isArray(reviewsResource.data) ? reviewsResource.data : reviewsResource.data?.data || [];

  const update = async (item, status, code = '') => {
    setBusy(true);
    try {
      await checkoutApi.updateOrderStatus(item.id, status, code.trim());
      notify(status === 'cancelled' ? 'Order item cancelled.' : 'Delivery confirmed.', 'success');
      setAction(null); setDeliveryCode(''); setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  const submitReview = async item => {
    if (!rating) return;
    setBusy(true);
    try {
      await checkoutApi.addReview({ orderId: id, productId: item.product?.id, rating, comment: comment.trim() });
      notify('Thanks for reviewing your purchase.', 'success');
      setAction(null); setRating(0); setComment(''); setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  if (resource.loading) return <Skeleton className="cart-skeleton"/>;
  if (resource.error) return <EmptyState title="Order couldn’t be loaded" description={resource.error.message}/>;
  if (!items.length) return <EmptyState icon={Package} title="No items found" description="We couldn’t find items for this order."/>;

  const itemTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const symbol = first.product?.store?.currency?.symbol || '₦';
  return <>
    <Link className="orders-back" to="/account/orders"><ArrowLeft size={17}/> All orders</Link>
    <section className="order-detail-summary"><div><span className="eyebrow">ORDER</span><h2>{order.trackingNumber || id}</h2><p><CalendarDays size={15}/> Placed {date(order.createdAt || first.createdAt)}</p></div><div className="order-detail-summary__total"><span>Order total</span><strong>{money(order.totalAmount || itemTotal, symbol)}</strong></div></section>
    {order.shippingAddress && <div className="order-address"><MapPin size={19}/><span><strong>Delivery address</strong><small>{order.shippingAddress}</small></span></div>}
    <div className="order-detail-items">{items.map(item => <article className="order-detail-item" key={item.id}>
      <div className="order-detail-item__top"><div className="order-card__image">{imageFor(item.product) && <img src={imageFor(item.product)} alt=""/>}</div><div className="order-card__main"><strong>{item.product?.name || 'Product'}</strong><span>Quantity {item.quantity || 1}</span><span>{money(Number(item.price || 0) * Number(item.quantity || 1), item.product?.store?.currency?.symbol || symbol)}</span></div><span className={`order-status order-status--${item.status}`}>{title(item.status)}</span></div>
      <StatusJourney status={item.status}/>
      {(item.status === 'pending' || item.status === 'shipped' || item.status === 'delivered') && <div className="order-detail-item__actions">{item.status === 'pending' && <Button variant="ghost" onClick={() => setAction({ type: 'cancel', item })}>Cancel item</Button>}{item.status === 'shipped' && <Button onClick={() => setAction({ type: 'delivery', item })}>Confirm delivery</Button>}{item.status === 'delivered' && (reviews.some(review => review.productId === item.product?.id) ? <span className="order-reviewed"><CheckCircle2 size={16}/> Reviewed</span> : <Button variant="outline" icon={Star} onClick={() => setAction({ type: 'review', item })}>Write a review</Button>)}</div>}
    </article>)}</div>
    {action?.type === 'cancel' && <ConfirmModal title="Cancel this item?" description="The seller will stop processing this item. This action cannot be reversed." confirmLabel="Cancel item" loading={busy} onClose={() => setAction(null)} onConfirm={() => update(action.item, 'cancelled')}/>} 
    {action?.type === 'delivery' && <Modal title="Confirm your delivery" icon={<CheckCircle2 size={20}/>} onClose={busy ? () => {} : () => { setAction(null); setDeliveryCode(''); }} footer={<><Button variant="ghost" disabled={busy} onClick={() => { setAction(null); setDeliveryCode(''); }}>Back</Button><Button loading={busy} disabled={!deliveryCode.trim()} onClick={() => update(action.item, 'delivered', deliveryCode)}>Confirm delivery</Button></>}><p>Enter the delivery code sent when your order was shipped. Confirm only after you have received the item.</p><label className="field"><span className="field__label">Delivery code</span><input className="field__input" autoFocus value={deliveryCode} onChange={event => setDeliveryCode(event.target.value.toUpperCase())} placeholder="Enter delivery code"/></label></Modal>}
    {action?.type === 'review' && <Modal title="Review your purchase" icon={<Star size={20}/>} onClose={busy ? () => {} : () => { setAction(null); setRating(0); setComment(''); }} footer={<><Button variant="ghost" disabled={busy} onClick={() => { setAction(null); setRating(0); setComment(''); }}>Cancel</Button><Button loading={busy} disabled={!rating} onClick={() => submitReview(action.item)}>Submit review</Button></>}><p>How was your experience with <strong>{action.item.product?.name || 'this product'}</strong>?</p><div className="order-rating" role="radiogroup" aria-label="Rating">{[1,2,3,4,5].map(value => <button type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value === 1 ? '' : 's'}`} className={value <= rating ? 'active' : ''} onClick={() => setRating(value)} key={value}><Star size={25} fill={value <= rating ? 'currentColor' : 'none'}/></button>)}</div><label className="field"><span className="field__label">Your review (optional)</span><textarea className="field__input order-review-comment" rows="4" maxLength="1000" value={comment} onChange={event => setComment(event.target.value)} placeholder="Tell other customers about your purchase"/></label></Modal>}
  </>;
}

export default function Orders({ detail = false }) {
  const { user } = useApp(); const { id } = useParams();
  const resource = useResource(signal => !user || detail ? Promise.resolve([]) : checkoutApi.orders(signal), [user?.id, detail]);
  if (!user) return <Navigate to="/login" replace/>;
  const orders = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];
  return <div className="container orders-page"><div className="page-intro"><span className="eyebrow">YOUR KUDUMART ACCOUNT</span><h1>{detail ? 'Order details.' : 'Your orders.'}</h1><p>{detail ? 'Track fulfilment and manage your purchase.' : 'Keep track of everything you’ve found.'}</p></div>{detail ? <OrderDetail id={id} user={user}/> : resource.loading ? <Skeleton className="cart-skeleton"/> : resource.error ? <EmptyState title="Orders couldn’t be loaded" description={resource.error.message}/> : orders.length ? <div className="orders-list">{orders.map((order, index) => <Link to={`/account/orders/${order.id}`} className="order-card" key={order.id || index}><div className="order-card__icon"><Package size={23}/></div><div className="order-card__main"><strong>Order {order.trackingNumber || order.refId || order.id}</strong><span>{order.orderItemsCount || 0} items · {date(order.createdAt)}</span><span>{order.shippingAddress}</span></div><strong>{money(order.totalAmount || 0, order.currency?.symbol || '₦')}</strong><ArrowRight size={18}/></Link>)}</div> : <EmptyState icon={Package} title="No orders yet" description="Your future finds will appear here." action={<Link to="/catalog"><Button>Explore products</Button></Link>}/>}</div>;
}
