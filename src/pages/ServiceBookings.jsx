import { BriefcaseBusiness, CalendarDays, ImageOff, MapPin, MessageSquare, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, ConfirmModal, EmptyState, Modal, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';

const list = value => Array.isArray(value) ? value : value?.data || value?.bookings || value?.rows || [];
const formatDate = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not provided';
const image = service => service?.image_url || service?.image || service?.additional_images?.[0];
const titleCase = value => String(value || 'pending').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

function ReviewModal({ booking, onClose, onSaved }) {
  const { notify } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault(); setBusy(true);
    try { await accountApi.reviewService({ serviceId: booking.serviceId || booking.service?.id, rating: Number(rating), comment: comment.trim() }); notify('Thank you for reviewing this service.', 'success'); onSaved(); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <Modal title="Review this service" icon={<Star size={20}/>} onClose={busy ? () => {} : onClose} footer={<><Button variant="ghost" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" form="service-review-form" loading={busy}>Submit review</Button></>}><form id="service-review-form" className="booking-review-form" onSubmit={submit}><p>How was <strong>{booking.service?.title || 'this service'}</strong>?</p><label className="field"><span className="field__label">Rating</span><select className="field__input" value={rating} onChange={event => setRating(event.target.value)}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}</select></label><label className="field"><span className="field__label">Your review</span><textarea className="field__input booking-form__message" minLength="3" maxLength="1000" required rows="4" value={comment} onChange={event => setComment(event.target.value)} placeholder="Tell others about your experience"/></label></form></Modal>;
}

export default function ServiceBookings() {
  const { user, notify } = useApp();
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState('');
  const [action, setAction] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const resource = useResource(signal => user ? accountApi.serviceBookings(signal) : Promise.resolve([]), [user?.id, revision]);
  const bookings = useMemo(() => list(resource.data).filter(item => !status || item.status === status), [resource.data, status]);
  if (!user) return <Navigate to="/login" replace state={{ from: '/account/services' }}/>;
  const perform = async () => {
    setBusy(true);
    try {
      if (action.kind === 'complete') await accountApi.completeServiceBooking(action.booking.id);
      else await accountApi.cancelServiceBooking(action.booking.id);
      notify(action.kind === 'complete' ? 'Booking marked as completed.' : 'Booking cancelled.', 'success');
      setAction(null); setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <div className="container customer-bookings-page"><div className="page-intro"><span className="eyebrow">YOUR APPOINTMENTS</span><h1>Service bookings</h1><p>Manage your requests and keep track of completed services.</p></div><div className="customer-bookings-toolbar"><div className="seller-tabs" role="group" aria-label="Filter service bookings">{[['','All'],['pending','Pending'],['confirmed','Confirmed'],['completed','Completed'],['canceled','Canceled']].map(([value, label]) => <button type="button" key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{label}</button>)}</div><Link to="/services"><Button variant="outline">Find services</Button></Link></div>{resource.loading ? <Skeleton className="customer-bookings-loading"/> : resource.error ? <EmptyState icon={CalendarDays} title="Couldn’t load your bookings" description={resource.error.message} action={<Button variant="outline" onClick={() => setRevision(value => value + 1)}>Try again</Button>}/> : bookings.length ? <div className="customer-booking-list">{bookings.map(booking => <article className="customer-booking-card" key={booking.id}><Link to={`/services/${booking.serviceId || booking.service?.id}`} className="customer-booking-card__image">{image(booking.service) ? <img src={image(booking.service)} alt=""/> : <ImageOff size={27}/>}</Link><div className="customer-booking-card__body"><div className="customer-booking-card__heading"><div><span className="eyebrow">{booking.service?.category?.name || 'SERVICE'}</span><h2>{booking.service?.title || 'Service booking'}</h2></div><span className={`seller-pill seller-pill--${booking.status}`}>{titleCase(booking.status)}</span></div><div className="customer-booking-card__facts"><span><CalendarDays size={15}/>{formatDate(booking.bookingDate)}</span>{booking.service && <span><MapPin size={15}/>{[booking.service.location_city, booking.service.location_state].filter(Boolean).join(', ') || 'Location arranged with provider'}</span>}{booking.message && <span><MessageSquare size={15}/>{booking.message}</span>}</div><div className="customer-booking-card__actions"><Link to={`/services/${booking.serviceId || booking.service?.id}`}>View service</Link>{['pending','confirmed'].includes(booking.status) && <Button size="sm" variant="outline" onClick={() => setAction({ kind: 'cancel', booking })}>Cancel booking</Button>}{booking.status === 'confirmed' && <Button size="sm" onClick={() => setAction({ kind: 'complete', booking })}>Mark completed</Button>}{booking.status === 'completed' && <Button size="sm" variant="outline" icon={Star} onClick={() => setReviewing(booking)}>Write a review</Button>}</div></div></article>)}</div> : <EmptyState icon={BriefcaseBusiness} title={status ? `No ${status} bookings` : 'No service bookings yet'} description="When you request a service, its progress will appear here." action={<Link to="/services"><Button>Explore services</Button></Link>}/>} {action && <ConfirmModal title={action.kind === 'complete' ? 'Was the service completed?' : 'Cancel this booking?'} description={action.kind === 'complete' ? 'Confirm that the provider has completed this service. You can then leave a review.' : 'The provider will be notified that you no longer need this appointment.'} confirmLabel={action.kind === 'complete' ? 'Mark completed' : 'Cancel booking'} tone={action.kind === 'complete' ? 'primary' : 'danger'} loading={busy} onClose={() => setAction(null)} onConfirm={perform}/>} {reviewing && <ReviewModal booking={reviewing} onClose={() => setReviewing(null)} onSaved={() => { setReviewing(null); setRevision(value => value + 1); }}/>}</div>;
}
