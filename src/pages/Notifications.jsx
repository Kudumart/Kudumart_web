import { useState } from 'react';
import { BadgeCheck, Bell, BriefcaseBusiness, Check, CreditCard, MessageCircle, Package, Settings, Tag, WalletCards } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import './Notifications.css';

const notificationMeta = (notification, user) => {
  const type = String(notification.type || '').toLowerCase();
  const vendor = String(user?.accountType || '').toLowerCase() === 'vendor';
  if (type.includes('offer')) return { to: vendor && ['new_offer', 'offer_buyer_response'].includes(type) ? '/seller/offers' : '/account/offers', Icon: Tag };
  if (type.includes('order') || type.includes('deliver')) return { to: vendor ? '/seller/orders' : '/account/orders', Icon: Package };
  if (['service_inquiry', 'service_review', 'service_booking_completed', 'service_booking_cancelled'].includes(type)) return { to: '/seller/services', Icon: BriefcaseBusiness };
  if (type.includes('service') || type.includes('booking')) return { to: '/account/services', Icon: BriefcaseBusiness };
  if (type.includes('kyc')) return { to: '/seller/verification', Icon: BadgeCheck };
  if (type.includes('subscription')) return { to: '/seller/subscriptions', Icon: CreditCard };
  if (type.includes('withdrawal')) return { to: '/seller/finance', Icon: WalletCards };
  if (type.includes('message')) return { to: '/account/messages', Icon: MessageCircle };
  if (type.includes('email') || type.includes('phone') || type.includes('password')) return { to: '/account/settings', Icon: Settings };
  if (type === 'vendor') return { to: '/seller', Icon: BriefcaseBusiness };
  if (type === 'welcome') return { to: '/account', Icon: Bell };
  return { to: '', Icon: Bell };
};

const announceNotificationChange = () => window.dispatchEvent(new Event('kudu:notifications-changed'));

export default function Notifications() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [revision, setRevision] = useState(0);
  const [busyId, setBusyId] = useState('');
  const resource = useResource(signal => user ? accountApi.notifications(filter === 'all' ? undefined : filter === 'read', signal) : Promise.resolve([]), [user?.id, filter, revision]);
  const items = Array.isArray(resource.data) ? resource.data : resource.data?.data || [];
  const unreadCount = items.filter(item => !item.isRead).length;

  const markRead = async notification => {
    if (notification.isRead) return true;
    setBusyId(notification.id);
    try {
      await accountApi.markNotificationRead(notification.id);
      announceNotificationChange();
      setRevision(value => value + 1);
      return true;
    } catch (error) {
      notify(error.message, 'error');
      return false;
    } finally { setBusyId(''); }
  };

  const openNotification = async (notification, to) => {
    if (!to || busyId) return;
    if (await markRead(notification)) navigate(to);
  };

  const markAllRead = async () => {
    setBusyId('all');
    try {
      await accountApi.markAllNotificationsRead();
      announceNotificationChange();
      setRevision(value => value + 1);
      notify('All notifications marked as read.', 'success');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusyId(''); }
  };

  if (!user) return <Navigate to="/login" replace state={{ from: '/account/notifications' }}/>;
  return <div className="container notifications-page">
    <div className="page-intro"><span className="eyebrow">STAY UP TO DATE</span><h1>Notifications.</h1><p>Order, offer, and account updates in one place.</p></div>
    <div className="notification-toolbar">
      <div className="notification-tabs" role="tablist">{[['all','All'],['unread','Unread'],['read','Read']].map(([value,label]) => <button type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
      {unreadCount > 0 && <Button size="sm" variant="ghost" icon={Check} loading={busyId === 'all'} onClick={markAllRead}>Mark all as read</Button>}
    </div>
    {resource.loading ? <Skeleton className="notifications-skeleton"/> : resource.error ? <EmptyState icon={Bell} title="Notifications couldn’t be loaded" description={resource.error.message} action={<Button variant="outline" onClick={() => setRevision(value => value + 1)}>Try again</Button>}/> : !items.length ? <EmptyState icon={Bell} title={filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`} description="Updates about your activity will appear here."/> : <div className="notification-list">{items.map(item => {
      const { to, Icon } = notificationMeta(item, user);
      return <article className={`notification-card ${item.isRead ? '' : 'notification-card--unread'}`} key={item.id}>
        <span className="notification-card__icon"><Icon size={20}/></span>
        <div><div className="notification-card__title"><h2>{item.title}</h2>{!item.isRead && <span>New</span>}</div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</small></div>
        <div className="notification-card__actions">{!item.isRead && <Button size="sm" variant="ghost" icon={Check} loading={busyId === item.id} onClick={() => markRead(item)}>Mark read</Button>}{to && <Button size="sm" variant="outline" disabled={!!busyId} onClick={() => openNotification(item, to)}>View</Button>}</div>
      </article>;
    })}</div>}
  </div>;
}
