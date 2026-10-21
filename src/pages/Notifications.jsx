import { useState } from 'react';
import { Bell, Check, Package, Tag } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import './Notifications.css';

const destination = notification => {
  const type = String(notification.type || '').toLowerCase();
  if (type.includes('offer')) return '/account/offers';
  if (type.includes('order') || type.includes('deliver')) return '/account/orders';
  if (type.includes('service') || type.includes('booking')) return '/account/services';
  return '';
};

export default function Notifications() {
  const { user, notify } = useApp();
  const [filter, setFilter] = useState('all');
  const [revision, setRevision] = useState(0);
  const [busyId, setBusyId] = useState('');
  const resource = useResource(signal => user ? accountApi.notifications(filter === 'all' ? undefined : filter === 'read', signal) : Promise.resolve([]), [user?.id, filter, revision]);
  const items = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];

  const markRead = async notification => {
    if (notification.isRead) return;
    setBusyId(notification.id);
    try { await accountApi.markNotificationRead(notification.id); setRevision(value => value + 1); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusyId(''); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/account/notifications' }}/>;
  return <div className="container notifications-page"><div className="page-intro"><span className="eyebrow">STAY UP TO DATE</span><h1>Notifications.</h1><p>Order, offer, and account updates in one place.</p></div><div className="notification-tabs" role="tablist">{[['all','All'],['unread','Unread'],['read','Read']].map(([value,label]) => <button type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
    {resource.loading ? <Skeleton className="notifications-skeleton"/> : resource.error ? <EmptyState icon={Bell} title="Notifications couldn’t be loaded" description={resource.error.message}/> : !items.length ? <EmptyState icon={Bell} title={filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`} description="Updates about your activity will appear here."/> : <div className="notification-list">{items.map(item => { const to = destination(item); const Icon = String(item.type || '').toLowerCase().includes('offer') ? Tag : String(item.type || '').toLowerCase().includes('order') ? Package : Bell; return <article className={`notification-card ${item.isRead ? '' : 'notification-card--unread'}`} key={item.id}><span className="notification-card__icon"><Icon size={20}/></span><div><div className="notification-card__title"><h2>{item.title}</h2>{!item.isRead && <span>New</span>}</div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</small></div><div className="notification-card__actions">{!item.isRead && <Button size="sm" variant="ghost" icon={Check} loading={busyId === item.id} onClick={() => markRead(item)}>Mark read</Button>}{to && <Link to={to}><Button size="sm" variant="outline">View</Button></Link>}</div></article>; })}</div>}
  </div>;
}
