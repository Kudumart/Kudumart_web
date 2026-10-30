import { ChevronLeft, ChevronRight, ImagePlus, Megaphone, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sellerApi, sellerList, uploadSellerImage } from '../../api/seller';
import { Button, ConfirmModal, EmptyState, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { SellerHeading } from './SellerPages';

const statusLabel = value => String(value || 'pending').replace(/\b\w/g, letter => letter.toUpperCase());
const emptyForm = { title: '', description: '', media_url: '', link: '', categoryGroupId: '', categoryId: '', productId: '', showOnHomepage: false };

export function SellerAdverts() {
  const { user, notify } = useApp();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const resource = useResource(signal => sellerApi.adverts(page, search, signal), [user?.id, page, search, revision]);
  const adverts = sellerList(resource.data);
  const pagination = resource.data?.pagination || {};
  const remove = async () => {
    try { await sellerApi.deleteAdvert(deleting.id); notify('Advert deleted.', 'success'); setDeleting(null); setRevision(value => value + 1); }
    catch (error) { notify(error.message, 'error'); }
  };
  const submitSearch = event => { event.preventDefault(); setPage(1); setSearch(query.trim()); };
  return <><SellerHeading eyebrow="GROW YOUR REACH" title="Adverts" description="Create campaigns, follow their review status, and keep promotions current." action={<Link to="/seller/adverts/new"><Button icon={Plus}>Create advert</Button></Link>}/><form className="seller-toolbar" onSubmit={submitSearch}><div className="seller-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search adverts or status" aria-label="Search adverts"/></div><Button type="submit" variant="outline">Search</Button></form>{resource.loading ? <Skeleton className="seller-loading"/> : resource.error ? <EmptyState icon={Megaphone} title="Couldn’t load your adverts" description={resource.error.message}/> : adverts.length ? <div className="seller-advert-grid">{adverts.map(advert => <article className="seller-advert-card" key={advert.id}><div className="seller-advert-card__media">{advert.media_url ? <img src={advert.media_url} alt=""/> : <Megaphone size={34}/>}<span className={`seller-pill seller-pill--${advert.status}`}>{statusLabel(advert.status)}</span></div><div className="seller-advert-card__body"><small>{advert.sub_category?.name || 'Promotion'}{advert.product?.name ? ` · ${advert.product.name}` : ''}</small><h2>{advert.title}</h2><p>{advert.description}</p>{advert.status === 'rejected' && <div className="seller-advert-note"><strong>Changes requested</strong><span>{advert.adminNote || 'Review the advert details and resubmit it.'}</span></div>}<div className="seller-advert-card__meta"><span>{advert.showOnHomepage ? 'Homepage placement requested' : 'Standard placement'}</span><span>{advert.expiresAt ? `Ends ${new Date(advert.expiresAt).toLocaleDateString()}` : 'Review determines schedule'}</span></div><div className="seller-service-card__actions"><Link className="seller-row-link" to={`/seller/adverts/${advert.id}`}><Pencil size={15}/> Edit</Link><button type="button" className="seller-danger-link" onClick={() => setDeleting(advert)}><Trash2 size={15}/> Delete</button></div></div></article>)}</div> : <EmptyState icon={Megaphone} title={search ? 'No matching adverts' : 'Promote your listings'} description={search ? 'Try another title or status.' : 'Create an advert and submit it for marketplace review.'} action={!search && <Link to="/seller/adverts/new"><Button>Create advert</Button></Link>}/>} {Number(pagination.pages || 0) > 1 && <div className="seller-pagination"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}><ChevronLeft size={17}/> Previous</button><span>Page {page} of {pagination.pages}</span><button disabled={page >= pagination.pages} onClick={() => setPage(value => value + 1)}>Next <ChevronRight size={17}/></button></div>}{deleting && <ConfirmModal title="Delete advert?" description={<>You’re about to permanently delete <strong>“{deleting.title}”</strong>.</>} confirmLabel="Delete advert" onClose={() => setDeleting(null)} onConfirm={remove}/>}</>;
}

export function SellerAdvertForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, notify } = useApp();
  const advertResource = useResource(signal => id ? sellerApi.advert(id, signal) : Promise.resolve(null), [id, user?.id]);
  const categories = useResource(signal => sellerApi.categories(signal), [user?.id]);
  const products = useResource(signal => sellerApi.products(signal), [user?.id]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const subcategories = useResource(signal => form.categoryGroupId ? sellerApi.subCategories(form.categoryGroupId, signal) : Promise.resolve([]), [form.categoryGroupId]);
  useEffect(() => {
    const advert = advertResource.data;
    if (!advert) return;
    setForm({ title: advert.title || '', description: advert.description || '', media_url: advert.media_url || '', link: advert.link || '', categoryGroupId: advert.sub_category?.categoryId || advert.sub_category?.category_id || '', categoryId: advert.categoryId || '', productId: advert.productId || '', showOnHomepage: !!advert.showOnHomepage });
  }, [advertResource.data]);
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const submit = async event => {
    event.preventDefault(); setBusy(true);
    try {
      const mediaUrl = file ? await uploadSellerImage(file) : form.media_url;
      if (!mediaUrl) throw new Error('Add an advert image.');
      const payload = { title: form.title.trim(), description: form.description.trim(), media_url: mediaUrl, link: form.link.trim(), categoryId: form.categoryId, productId: form.productId || null, showOnHomepage: form.showOnHomepage };
      if (id) await sellerApi.updateAdvert({ advertId: id, ...payload }); else await sellerApi.createAdvert(payload);
      notify(id ? 'Advert updated and resubmitted for review.' : 'Advert submitted for review.', 'success');
      navigate('/seller/adverts');
    } catch (error) { notify(error.message, 'error'); if (/subscription|maximum number|upgrade/i.test(error.message)) navigate('/seller/subscriptions'); }
    finally { setBusy(false); }
  };
  if (id && advertResource.loading) return <Skeleton className="seller-loading"/>;
  if (advertResource.error) return <EmptyState icon={Megaphone} title="Couldn’t load this advert" description={advertResource.error.message}/>;
  return <><Link className="seller-back" to="/seller/adverts"><ChevronLeft size={17}/> All adverts</Link><SellerHeading eyebrow={id ? 'EDIT CAMPAIGN' : 'NEW CAMPAIGN'} title={id ? 'Edit advert' : 'Create an advert'} description="Your advert will be reviewed before it appears in the marketplace."/><form className="seller-form" onSubmit={submit}><section className="seller-panel"><h2>Campaign details</h2><p>Use a concise message and link customers to a relevant destination.</p><TextField label="Advert title" name="title" minLength="3" maxLength="100" required value={form.title} onChange={change}/><label className="field"><span className="field__label">Description</span><textarea className="field__input seller-textarea" name="description" minLength="10" maxLength="600" rows="5" required value={form.description} onChange={change}/></label><TextField label="Destination URL" name="link" type="url" placeholder="https://kudumart.com/product/..." required value={form.link} onChange={change}/><div className="seller-form-grid"><SelectField label="Category" name="categoryGroupId" required value={form.categoryGroupId} disabled={categories.loading} onChange={event => { change(event); setForm(current => ({ ...current, categoryId: '' })); }}><option value="">Choose a category</option>{sellerList(categories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField><SelectField label="Subcategory" name="categoryId" required value={form.categoryId} disabled={!form.categoryGroupId || subcategories.loading} onChange={change}><option value="">Choose a subcategory</option>{sellerList(subcategories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></div><SelectField label="Related product (optional)" name="productId" value={form.productId} onChange={change}><option value="">No specific product</option>{sellerList(products.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></section><section className="seller-panel"><h2>Creative</h2><p>Upload a clear promotional image. Editing an approved advert sends it back for review.</p><label className="seller-upload"><ImagePlus size={25}/><strong>{file || form.media_url ? 'Replace advert image' : 'Add advert image'}</strong><span>JPG, PNG, or WebP</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { setFile(event.target.files?.[0] || null); event.target.value = ''; }}/></label>{(file || form.media_url) && <div className="seller-advert-preview"><img src={file ? URL.createObjectURL(file) : form.media_url} alt="Advert preview"/></div>}<label className="seller-check"><input name="showOnHomepage" type="checkbox" checked={form.showOnHomepage} onChange={change}/><span>Request homepage placement</span></label><p className="seller-muted">Placement is subject to admin review and your active plan.</p></section><div className="seller-form-actions"><Link to="/seller/adverts">Cancel</Link><Button type="submit" loading={busy}>{id ? 'Save and resubmit' : 'Submit for review'}</Button></div></form></>;
}
