import { ArrowRight, Package } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { checkoutApi } from '../api/checkout';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { imageFor, money } from '../utils/format';
export default function Orders({ detail = false }) {
  const { user } = useApp(); const { id } = useParams();
  const resource = useResource(signal => !user ? Promise.resolve([]) : detail ? checkoutApi.orderItems(id, signal) : checkoutApi.orders(signal), [user?.id, id, detail]);
  if (!user) return <Navigate to="/login" replace/>;
  const items = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];
  return <div className="container orders-page"><div className="page-intro"><span className="eyebrow">YOUR KUDUMART ACCOUNT</span><h1>{detail ? 'Order details.' : 'Your orders.'}</h1><p>{detail ? 'A closer look at your purchase.' : 'Keep track of everything you’ve found.'}</p></div>{resource.loading ? <Skeleton className="cart-skeleton"/> : resource.error ? <EmptyState title="Orders couldn’t be loaded" description={resource.error.message}/> : items.length ? <div className="orders-list">{items.map((item, index) => detail ? <article className="order-card" key={item.id || index}><div className="order-card__image">{imageFor(item.product) && <img src={imageFor(item.product)} alt=""/>}</div><div className="order-card__main"><strong>{item.product?.name || 'Product'}</strong><span>Quantity {item.quantity || 1}</span><span>Status: {item.status || 'Processing'}</span></div><strong>{money(item.totalAmount || item.price || 0, item.product?.store?.currency?.symbol || '₦')}</strong></article> : <Link to={`/account/orders/${item.id}`} className="order-card" key={item.id || index}><div className="order-card__icon"><Package size={23}/></div><div className="order-card__main"><strong>Order {item.trackingNumber || item.refId || item.id}</strong><span>{item.orderItemsCount || 0} items · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent order'}</span><span>{item.shippingAddress}</span></div><strong>{money(item.totalAmount || 0, item.currency?.symbol || '₦')}</strong><ArrowRight size={18}/></Link>)}</div> : <EmptyState icon={Package} title={detail ? 'No items found' : 'No orders yet'} description={detail ? 'We couldn’t find items for this order.' : 'Your future finds will appear here.'} action={<Link to="/catalog"><Button>Explore products</Button></Link>}/>}</div>;
}
