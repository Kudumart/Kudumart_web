import { BadgeCheck, BriefcaseBusiness, CalendarDays, Clock3, Gavel, ImageOff, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
import PaystackPop from '@paystack/inline-js';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { accountApi } from '../api/account';
import { catalogApi } from '../api/catalog';
import { Button, EmptyState, Modal, Skeleton, TextField } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { money, plainText } from '../utils/format';

const providerName = provider => [provider?.firstName, provider?.lastName].filter(Boolean).join(' ') || provider?.businessName || 'Service provider';
const imageList = item => [item?.image_url || item?.image, ...(Array.isArray(item?.additional_images) ? item.additional_images : Array.isArray(item?.additionalImages) ? item.additionalImages : [])].filter(Boolean);
const reviewList = value => Array.isArray(value) ? value : value?.data || value?.reviews || value?.rows || [];

function BookingModal({ service, onClose }) {
  const { notify } = useApp();
  const navigate = useNavigate();
  const [bookingDate, setBookingDate] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const minimum = useMemo(() => { const date = new Date(Date.now() + 30 * 60 * 1000); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }, []);
  const submit = async event => {
    event.preventDefault();
    const selected = new Date(bookingDate);
    if (!bookingDate || Number.isNaN(selected.getTime()) || selected <= new Date()) { notify('Choose a future date and time.', 'error'); return; }
    const vendorId = service.vendorId || service.provider?.id;
    if (!vendorId) { notify('This provider could not be identified. Please try again later.', 'error'); return; }
    setBusy(true);
    try {
      await accountApi.bookService(service.id, { vendorId, bookingDate: selected.toISOString(), ...(message.trim() ? { message: message.trim() } : {}) });
      notify('Booking request sent to the provider.', 'success');
      onClose();
      navigate('/account/services');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <Modal title="Request a booking" icon={<CalendarDays size={20}/>} onClose={busy ? () => {} : onClose} footer={<><Button variant="ghost" disabled={busy} onClick={onClose}>Cancel</Button><Button form="service-booking-form" type="submit" loading={busy}>Send request</Button></>}><form id="service-booking-form" className="booking-form" onSubmit={submit}><p>Choose when you would like <strong>{service.title}</strong> and add any useful details for the provider.</p><TextField label="Preferred date and time" type="datetime-local" min={minimum} required value={bookingDate} onChange={event => setBookingDate(event.target.value)}/><label className="field"><span className="field__label">Message (optional)</span><textarea className="field__input booking-form__message" rows="4" maxLength="500" placeholder="Describe what you need or ask a question" value={message} onChange={event => setMessage(event.target.value)}/></label></form></Modal>;
}

const auctionStatusLabel = status => ({ upcoming: 'Upcoming', ongoing: 'Live now', ended: 'Ended', cancelled: 'Cancelled' }[status] || 'Scheduled');
const dateTime = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not announced';

function AuctionDetail({ item, images, user, notify, location, navigate }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');
  const [interested, setInterested] = useState(Boolean(item.interest));
  const [busy, setBusy] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const bidState = useResource(signal => user && item.auctionStatus === 'ongoing' ? accountApi.auctionBidState(item.id, signal) : Promise.resolve(null), [item.id, item.auctionStatus, user?.id, refreshKey]);
  useEffect(() => { setSelectedImage(images[0] || ''); }, [images[0]]);
  const symbol = item.store?.currency?.symbol || '₦';
  const startingPrice = Number(item.price || item.startingPrice || 0);
  const increment = Number(item.bidIncrement || 0);
  const bids = Array.isArray(bidState.data?.bids) ? bidState.data.bids : [];
  const highestBid = bids.reduce((highest, bid) => Math.max(highest, Number(bid.bidAmount || 0)), 0);
  const minimumBid = highestBid > 0 ? highestBid + increment : startingPrice;
  const participationFee = Number(item.participantsInterestFee || 0);
  const ownAuction = user?.id && String(user.id) === String(item.vendorId || item.vendor?.id);
  const requireLogin = action => {
    if (user) return true;
    navigate('/login', { state: { from: location.pathname } });
    notify(`Sign in to ${action}.`, 'info');
    return false;
  };
  const registerInterest = async () => {
    if (!requireLogin('join this auction') || ownAuction) return;
    setBusy(true);
    try {
      if (participationFee <= 0) {
        await accountApi.registerAuctionInterest(item.id);
        setInterested(true);
        notify('You have joined this auction.', 'success');
        return;
      }
      const prepared = await accountApi.initiateAuctionInterestPayment(item.id);
      const accessCode = prepared?.paystackDetails?.access_code;
      const refId = prepared?.refId;
      if (!accessCode || !refId) throw new Error('Paystack did not return a secure payment session.');
      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onLoad: () => setBusy(false),
        onSuccess: async result => {
          setBusy(true);
          try { await accountApi.registerAuctionInterest(item.id, result?.reference || refId); setInterested(true); notify('Payment confirmed. You have joined this auction.', 'success'); }
          catch (error) { notify(`${error.message} Do not pay again; contact support with reference ${result?.reference || refId}.`, 'error'); }
          finally { setBusy(false); }
        },
        onCancel: () => setBusy(false),
        onError: error => { setBusy(false); notify(error?.message || 'Paystack could not open the payment session.', 'error'); },
      });
    }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  const openBid = async () => {
    if (!requireLogin('place a bid') || ownAuction) return;
    if (!interested) {
      if (participationFee > 0) { notify('Join the auction and complete the participation payment before bidding.', 'info'); return; }
      setBusy(true);
      try { await accountApi.registerAuctionInterest(item.id); setInterested(true); }
      catch (error) { notify(error.message, 'error'); setBusy(false); return; }
      setBusy(false);
    }
    setBidAmount(String(minimumBid || ''));
    setBidOpen(true);
  };
  const submitBid = async event => {
    event.preventDefault();
    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount < minimumBid) { notify(`Your bid must be at least ${money(minimumBid, symbol)}.`, 'error'); return; }
    setBusy(true);
    try { await accountApi.placeAuctionBid(item.id, amount); notify('Your bid was placed successfully.', 'success'); setBidOpen(false); setRefreshKey(key => key + 1); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  const canJoin = ['upcoming', 'ongoing'].includes(item.auctionStatus) && !interested && !ownAuction;
  return <div className="container product-page auction-detail-page"><Link to="/auctions" className="back-link">← Back to auctions</Link><div className="product-detail"><div className="product-detail__gallery"><div className="product-detail__main-image">{selectedImage ? <img src={selectedImage} alt={item.title || item.name}/> : <ImageOff size={48}/>}</div>{images.length > 1 && <div className="product-detail__thumbs">{images.map(image => <button key={image} type="button" className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)}><img src={image} alt="Auction item"/></button>)}</div>}</div><div className="product-detail__info"><div className="auction-detail__heading"><span className="eyebrow">KUDUMART AUCTIONS</span><span className={`discovery-status discovery-status--${item.auctionStatus || 'ended'}`}>{auctionStatusLabel(item.auctionStatus)}</span></div><h1>{item.title || item.name}</h1><div className="auction-price-panel"><span>{highestBid > 0 ? 'Current highest bid' : 'Starting price'}</span><strong>{money(highestBid || startingPrice, symbol)}</strong>{highestBid > 0 && increment > 0 && <small>Next bid from {money(minimumBid, symbol)}</small>}</div><p className="product-detail__description">{plainText(item.description)}</p><div className="auction-facts"><span><CalendarDays size={17}/><b>Starts</b>{dateTime(item.startDate)}</span><span><Clock3 size={17}/><b>Ends</b>{dateTime(item.endDate)}</span><span><Gavel size={17}/><b>Bid increment</b>{money(increment, symbol)}</span><span><ShieldCheck size={17}/><b>Participation</b>{participationFee > 0 ? money(participationFee, symbol) : 'Free'}</span></div>{ownAuction ? <div className="auction-notice">This is your auction listing, so you cannot participate or bid.</div> : item.auctionStatus === 'ongoing' && interested ? <Button size="lg" icon={Gavel} loading={busy || bidState.loading} onClick={openBid}>Place a bid</Button> : canJoin ? <Button size="lg" icon={ShieldCheck} loading={busy} onClick={registerInterest}>{participationFee > 0 ? `Join securely · ${money(participationFee, symbol)}` : 'Join auction for free'}</Button> : interested && item.auctionStatus === 'upcoming' ? <div className="auction-notice auction-notice--success"><BadgeCheck size={18}/> You have joined. We’ll notify you when bidding starts.</div> : <div className="auction-notice">This auction is {auctionStatusLabel(item.auctionStatus).toLowerCase()} and is not accepting participation.</div>}</div></div>{bidOpen && <Modal title="Place your bid" icon={<Gavel size={20}/>} onClose={busy ? () => {} : () => setBidOpen(false)} footer={<><Button variant="ghost" disabled={busy} onClick={() => setBidOpen(false)}>Cancel</Button><Button form="auction-bid-form" type="submit" loading={busy}>Confirm bid</Button></>}><form id="auction-bid-form" className="auction-bid-form" onSubmit={submitBid}><p>Bids are final. Enter at least <strong>{money(minimumBid, symbol)}</strong>.</p><TextField label={`Bid amount (${symbol})`} type="number" min={minimumBid} step="0.01" required autoFocus value={bidAmount} onChange={event => setBidAmount(event.target.value)}/></form></Modal>}</div>;
}

export default function DiscoveryDetail({ type }) {
  const { id } = useParams();
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const isAuction = type === 'auction';
  const resource = useResource(signal => isAuction ? catalogApi.auction(id, signal) : catalogApi.service(id, signal), [id, type]);
  const reviews = useResource(signal => isAuction ? Promise.resolve([]) : catalogApi.serviceReviews(id, signal), [id, type]);
  const item = resource.data;
  const images = imageList(item);
  useEffect(() => { if (images[0]) setSelectedImage(images[0]); }, [images[0]]);
  useEffect(() => { if (!isAuction && item && searchParams.get('book') === '1' && user) { setBookingOpen(true); setSearchParams({}, { replace: true }); } }, [isAuction, item, searchParams, setSearchParams, user]);
  if (resource.loading) return <div className="container product-page"><Skeleton className="product-detail-skeleton"/></div>;
  if (resource.error || !item) return <div className="container page-space"><EmptyState title="This listing is unavailable" description={resource.error?.message || 'Please try another listing.'} action={<Link to={isAuction ? '/auctions' : '/services'}><Button variant="outline">Explore more</Button></Link>}/></div>;
  if (isAuction) return <AuctionDetail item={item} images={images} user={user} notify={notify} location={location} navigate={navigate}/>;
  const provider = item.provider || item.vendor;
  const ownService = user?.id && String(user.id) === String(item.vendorId || provider?.id);
  const openBooking = () => {
    if (!user) { navigate('/login', { state: { from: `${location.pathname}?book=1` } }); return; }
    if (ownService) { notify('You cannot book your own service.', 'info'); return; }
    setBookingOpen(true);
  };
  const attributes = Array.isArray(item.attributes) ? item.attributes : [];
  const serviceReviews = reviewList(reviews.data);
  return <div className="container service-detail-page"><Link to="/services" className="back-link">← Back to services</Link><div className="product-detail service-detail"><div className="product-detail__gallery"><div className="product-detail__main-image">{selectedImage ? <img src={selectedImage} alt={item.title}/> : <ImageOff size={48}/>}</div>{images.length > 1 && <div className="product-detail__thumbs">{images.map(image => <button key={image} type="button" className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)}><img src={image} alt="Service example"/></button>)}</div>}</div><div className="product-detail__info"><span className="eyebrow">{item.category?.name || 'KUDUMART SERVICES'}{item.subCategory?.name ? ` · ${item.subCategory.name}` : ''}</span><h1>{item.title}</h1><div className="service-provider"><span className="service-provider__avatar"><UserRound size={20}/></span><div><strong>{providerName(provider)}</strong><span>{provider?.isVerified && <><BadgeCheck size={14}/> Verified provider</>}</span></div></div><div className="product-detail__price"><strong>{money(item.discount_price || item.price)}</strong>{item.discount_price && <del>{money(item.price)}</del>}</div><p className="product-detail__description">{plainText(item.description)}</p><div className="service-facts"><span><MapPin size={17}/>{[item.location_city, item.location_state, item.location_country].filter(Boolean).join(', ') || 'Location arranged with provider'}</span><span><BriefcaseBusiness size={17}/>{Number(item.work_experience_years || 0)} years experience</span>{item.is_negotiable && <span>Price is negotiable</span>}</div>{attributes.length > 0 && <div className="service-attributes">{attributes.map((attribute, index) => <div key={attribute.id || `${attribute.name}-${index}`}><span>{attribute.name || attribute.attribute?.name}</span><strong>{Array.isArray(attribute.values) ? attribute.values.join(', ') : String(attribute.values ?? attribute.value ?? '')}</strong></div>)}</div>}<Button size="lg" icon={CalendarDays} disabled={ownService} onClick={openBooking}>{ownService ? 'Your service' : 'Request a booking'}</Button></div></div><section className="service-reviews"><div><span className="eyebrow">CUSTOMER FEEDBACK</span><h2>Reviews</h2></div>{reviews.loading ? <Skeleton className="service-reviews__loading"/> : serviceReviews.length ? <div className="service-review-list">{serviceReviews.map((review, index) => <article key={review.id || index}><div><strong>{providerName(review.user)}</strong><span>{Array.from({ length: 5 }, (_, star) => <Star key={star} size={14} fill={star < Number(review.rating || 0) ? 'currentColor' : 'none'}/>)}</span></div><p>{review.comment || review.review}</p></article>)}</div> : <p className="service-reviews__empty">No reviews yet. Completed bookings can leave the first review.</p>}</section>{bookingOpen && <BookingModal service={item} onClose={() => setBookingOpen(false)}/>}</div>;
}
