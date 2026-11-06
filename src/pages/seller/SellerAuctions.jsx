import { ArrowRight, ChevronLeft, Gavel, ImagePlus, Pencil, Plus, Sparkles, Trash2, UsersRound, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AIProductCreator, { takeAiDraft } from './AIProductCreator';
import { sellerApi, sellerList, uploadSellerImage } from '../../api/seller';
import { Button, ConfirmModal, EmptyState, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { money } from '../../utils/format';
import { SellerHeading } from './SellerPages';

const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const localDate = value => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const emptyForm = { storeId: '', categoryGroupId: '', categoryId: '', name: '', condition: '', description: '', specification: '', price: '', bidIncrement: '', maxBidsPerUser: '', participantsInterestFee: '0', startDate: '', endDate: '', image: '', additionalImages: [] };

export function SellerAuctions() {
  const { user, notify } = useApp();
  const [revision, setRevision] = useState(0);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const resource = useResource(signal => sellerApi.auctionProducts(signal), [user?.id, revision]);
  const auctions = sellerList(resource.data);
  const confirm = async () => {
    setBusy(true);
    try {
      if (action.kind === 'cancel') await sellerApi.cancelAuctionProduct(action.item.id);
      else await sellerApi.deleteAuctionProduct(action.item.id);
      notify(action.kind === 'cancel' ? 'Auction cancelled.' : 'Auction deleted.', 'success');
      setAction(null); setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <><SellerHeading eyebrow="SELL BY BIDDING" title="Auctions" description="Schedule listings, monitor bids, and manage every auction event." action={<><Button variant="outline" icon={Sparkles} onClick={() => setAi(true)}>Create with AI</Button>{ai && <AIProductCreator onClose={() => setAi(false)}/>}<Link to="/seller/auctions/new"><Button icon={Plus}>Create auction</Button></Link></>}/>{resource.loading ? <Skeleton className="seller-loading"/> : resource.error ? <EmptyState icon={Gavel} title="Couldn’t load your auctions" description={resource.error.message}/> : auctions.length ? <div className="seller-auction-grid">{auctions.map(item => { const status = item.auctionStatus; return <article className="seller-auction-card" key={item.id}><div className="seller-auction-card__image">{item.image ? <img src={item.image} alt=""/> : <Gavel size={34}/>}<span className={`seller-pill seller-pill--${status}`}>{titleCase(status)}</span></div><div className="seller-auction-card__body"><small>{item.sub_category?.name || 'Auction'} · {item.store?.name || 'Store'}</small><h2>{item.name}</h2><strong>{money(item.price, item.store?.currency?.symbol || '₦')} starting price</strong><div className="seller-auction-dates"><span>Starts <b>{new Date(item.startDate).toLocaleString()}</b></span><span>Ends <b>{new Date(item.endDate).toLocaleString()}</b></span></div><div className="seller-service-card__actions"><Link className="seller-row-link" to={`/seller/auctions/${item.id}/bids`}><UsersRound size={15}/> Bids</Link>{status === 'upcoming' && <Link className="seller-row-link" to={`/seller/auctions/${item.id}/edit`}><Pencil size={15}/> Edit</Link>}{['upcoming','ongoing'].includes(status) && <button className="seller-danger-link" onClick={() => setAction({ kind: 'cancel', item })}><XCircle size={15}/> Cancel</button>}{['cancelled','ended'].includes(status) && <button className="seller-danger-link" onClick={() => setAction({ kind: 'delete', item })}><Trash2 size={15}/> Delete</button>}<Link className="seller-row-link" to={`/auction/product/${item.id}`}>View <ArrowRight size={15}/></Link></div></div></article>; })}</div> : <EmptyState icon={Gavel} title="Start your first auction" description="Schedule a verified listing and let customers compete with transparent bids." action={<Link to="/seller/auctions/new"><Button>Create auction</Button></Link>}/>} {action && <ConfirmModal title={action.kind === 'cancel' ? 'Cancel this auction?' : 'Delete this auction?'} description={action.kind === 'cancel' ? 'Customers will no longer be able to bid, and the auction cannot be resumed.' : 'This permanently removes the auction record.'} confirmLabel={action.kind === 'cancel' ? 'Cancel auction' : 'Delete auction'} loading={busy} onClose={() => setAction(null)} onConfirm={confirm}/>}</>;
}

export function SellerAuctionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, notify } = useApp();
  const auctionResource = useResource(signal => id ? sellerApi.auctionProduct(id, signal) : Promise.resolve(null), [id, user?.id]);
  const stores = useResource(signal => sellerApi.stores(signal), [user?.id]);
  const categories = useResource(signal => sellerApi.categories(signal), [user?.id]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const subcategories = useResource(signal => form.categoryGroupId ? sellerApi.subCategories(form.categoryGroupId, signal) : Promise.resolve([]), [form.categoryGroupId]);
  useEffect(() => {
    const item = auctionResource.data;
    if (!item) return;
    setForm({ storeId: item.storeId || '', categoryGroupId: item.sub_category?.categoryId || item.sub_category?.category_id || '', categoryId: item.categoryId || '', name: item.name || '', condition: item.condition || '', description: item.description || '', specification: item.specification || '', price: item.price || '', bidIncrement: item.bidIncrement || '', maxBidsPerUser: item.maxBidsPerUser || '', participantsInterestFee: item.participantsInterestFee ?? '0', startDate: localDate(item.startDate), endDate: localDate(item.endDate), image: item.image || '', additionalImages: item.additionalImages || [] });
  }, [auctionResource.data]);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (id || searchParams.get('ai') !== '1') return;
    const draft = takeAiDraft();
    if (!draft) return;
    setForm(current => ({ ...current, name: draft.name || current.name, price: draft.price || current.price, condition: draft.condition || current.condition, bidIncrement: draft.bidIncrement || current.bidIncrement, maxBidsPerUser: draft.maxBidsPerUser || current.maxBidsPerUser, participantsInterestFee: draft.participantsInterestFee ?? current.participantsInterestFee, description: draft.description || current.description, specification: draft.specification || draft.specifications || current.specification, image: draft.imagePreview || current.image }));
    notify('AI has pre-filled your auction details. Review and adjust as needed.', 'success');
  }, []);
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault(); setBusy(true);
    try {
      if (new Date(form.startDate) <= new Date()) throw new Error('Auction start time must be in the future.');
      if (new Date(form.endDate) <= new Date(form.startDate)) throw new Error('Auction end time must be after its start time.');
      const image = imageFile ? await uploadSellerImage(imageFile) : form.image;
      if (!image) throw new Error('Add a main auction image.');
      const payload = { ...form, image, additionalImages: Array.from(new Set([image, ...form.additionalImages])), price: Number(form.price), bidIncrement: Number(form.bidIncrement), maxBidsPerUser: Number(form.maxBidsPerUser), participantsInterestFee: Number(form.participantsInterestFee), startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() };
      delete payload.categoryGroupId;
      if (id) await sellerApi.updateAuctionProduct({ auctionProductId: id, ...payload }); else await sellerApi.createAuctionProduct(payload);
      notify(id ? 'Auction updated.' : 'Auction scheduled.', 'success'); navigate('/seller/auctions');
    } catch (error) { notify(error.message, 'error'); if (/subscription|limit|upgrade/i.test(error.message)) navigate('/seller/subscriptions'); }
    finally { setBusy(false); }
  };
  const existing = auctionResource.data;
  if (id && auctionResource.loading) return <Skeleton className="seller-loading"/>;
  if (auctionResource.error) return <EmptyState icon={Gavel} title="Couldn’t load this auction" description={auctionResource.error.message}/>;
  if (id && existing?.auctionStatus !== 'upcoming') return <EmptyState icon={Gavel} title="This auction can no longer be edited" description="Only upcoming auctions can be changed."/>;
  return <><Link className="seller-back" to="/seller/auctions"><ChevronLeft size={17}/> All auctions</Link><SellerHeading eyebrow={id ? 'EDIT AUCTION' : 'NEW AUCTION'} title={id ? 'Edit auction' : 'Schedule an auction'} description="Set clear bidding rules and allow enough time for customers to participate."/><form className="seller-form" onSubmit={submit}><section className="seller-panel"><h2>Listing details</h2><div className="seller-form-grid"><SelectField label="Store" name="storeId" required value={form.storeId} onChange={change}><option value="">Choose store</option>{sellerList(stores.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField><SelectField label="Condition" name="condition" required value={form.condition} onChange={change}><option value="">Choose condition</option><option value="brand_new">Brand new</option><option value="fairly_used">Fairly used</option><option value="fairly_foreign">Fairly foreign</option><option value="refurbished">Refurbished</option></SelectField><SelectField label="Category" name="categoryGroupId" required value={form.categoryGroupId} onChange={event => { change(event); setForm(current => ({ ...current, categoryId: '' })); }}><option value="">Choose category</option>{sellerList(categories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField><SelectField label="Subcategory" name="categoryId" required disabled={!form.categoryGroupId} value={form.categoryId} onChange={change}><option value="">Choose subcategory</option>{sellerList(subcategories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></div><TextField label="Product name" name="name" required minLength="3" value={form.name} onChange={change}/><label className="field"><span className="field__label">Description</span><textarea className="field__input seller-textarea" name="description" required minLength="10" rows="5" value={form.description} onChange={change}/></label><label className="field"><span className="field__label">Specifications</span><textarea className="field__input seller-textarea" name="specification" required rows="4" value={form.specification} onChange={change}/></label></section><AuctionRules form={form} change={change}/><section className="seller-panel"><h2>Primary image</h2><label className="seller-upload"><ImagePlus size={25}/><strong>{imageFile || form.image ? 'Replace image' : 'Add image'}</strong><span>JPG, PNG, or WebP</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { setImageFile(event.target.files?.[0] || null); event.target.value = ''; }}/></label>{(imageFile || form.image) && <div className="seller-advert-preview"><img src={imageFile ? URL.createObjectURL(imageFile) : form.image} alt="Auction preview"/></div>}</section><div className="seller-form-actions"><Link to="/seller/auctions">Cancel</Link><Button type="submit" loading={busy}>{id ? 'Save changes' : 'Schedule auction'}</Button></div></form></>;
}

function AuctionRules({ form, change }) {
  return <section className="seller-panel"><h2>Bidding rules</h2><p>All amounts use the selected store’s currency.</p><div className="seller-form-grid"><TextField label="Starting price" name="price" type="number" min="1" step="0.01" required value={form.price} onChange={change}/><TextField label="Minimum bid increment" name="bidIncrement" type="number" min="1" step="0.01" required value={form.bidIncrement} onChange={change}/><TextField label="Maximum bids per customer" name="maxBidsPerUser" type="number" min="1" required value={form.maxBidsPerUser} onChange={change}/><TextField label="Participation fee" name="participantsInterestFee" type="number" min="0" step="0.01" required value={form.participantsInterestFee} onChange={change}/><TextField label="Start date and time" name="startDate" type="datetime-local" required value={form.startDate} onChange={change}/><TextField label="End date and time" name="endDate" type="datetime-local" required value={form.endDate} onChange={change}/></div></section>;
}

export function SellerAuctionBids() {
  const { id } = useParams();
  const { user } = useApp();
  const auction = useResource(signal => sellerApi.auctionProduct(id, signal), [id, user?.id]);
  const bidsResource = useResource(signal => sellerApi.auctionBids(id, signal), [id, user?.id]);
  const bids = sellerList(bidsResource.data);
  return <><Link className="seller-back" to="/seller/auctions"><ChevronLeft size={17}/> All auctions</Link><SellerHeading eyebrow="LIVE ACTIVITY" title={auction.data?.name || 'Auction bids'} description="Newest bids appear first."/>{auction.loading || bidsResource.loading ? <Skeleton className="seller-loading"/> : bidsResource.error ? <EmptyState icon={UsersRound} title="Couldn’t load bids" description={bidsResource.error.message}/> : bids.length ? <div className="seller-table-wrap"><table className="seller-table"><thead><tr><th>Bidder</th><th>Bid amount</th><th>Placed</th></tr></thead><tbody>{bids.map(bid => <tr key={bid.id}><td><strong>{[bid.user?.firstName, bid.user?.lastName].filter(Boolean).join(' ') || bid.user?.email || 'Customer'}</strong></td><td>{money(bid.bidAmount || bid.amount, auction.data?.store?.currency?.symbol || '₦')}</td><td>{new Date(bid.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <EmptyState icon={UsersRound} title="No bids yet" description="Customer bids will appear here once the auction opens."/>}</>;
}
