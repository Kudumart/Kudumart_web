import { BriefcaseBusiness, CalendarDays, Check, ChevronLeft, ChevronRight, ImagePlus, MapPin, Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sellerApi, sellerList, uploadSellerImage } from '../../api/seller';
import { Button, ConfirmModal, EmptyState, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { money } from '../../utils/format';
import { SellerHeading } from './SellerPages';

const titleCase = value => String(value || 'unknown').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const formatDate = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not provided';
const serviceImage = service => service?.image_url || service?.image || service?.additional_images?.[0];
const customerName = user => [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Customer';

function ServiceBookings() {
  const { user, notify } = useApp();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [busyId, setBusyId] = useState('');
  const resource = useResource(signal => sellerApi.serviceBookings(page, status, signal), [user?.id, page, status, revision]);
  const bookings = sellerList(resource.data);
  const total = Number(resource.data?.total || 0);
  const update = async (booking, action) => {
    setBusyId(booking.id);
    try {
      if (action === 'confirm') await sellerApi.confirmServiceBooking(booking.id);
      else await sellerApi.cancelServiceBooking(booking.id);
      notify(`Booking ${action === 'confirm' ? 'confirmed' : 'cancelled'}.`, 'success');
      setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusyId(''); }
  };
  return <section className="seller-services-section"><div className="seller-section-head"><div><span className="eyebrow">CUSTOMER REQUESTS</span><h2>Bookings</h2><p>Confirm new appointments and keep customers informed.</p></div><div className="seller-tabs" role="group" aria-label="Booking status">{[['','All'],['pending','Pending'],['confirmed','Confirmed'],['canceled','Canceled']].map(([value,label]) => <button type="button" key={value} className={status === value ? 'active' : ''} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>)}</div></div>{resource.loading ? <Skeleton className="seller-loading"/> : resource.error ? <p className="form-alert">{resource.error.message}</p> : bookings.length ? <div className="seller-booking-list">{bookings.map(booking => <article className="seller-booking-card" key={booking.id}><span className="seller-list-image">{serviceImage(booking.service) ? <img src={serviceImage(booking.service)} alt=""/> : <BriefcaseBusiness size={21}/>}</span><div className="seller-booking-card__main"><strong>{booking.service?.title || 'Service booking'}</strong><span><UserRound size={14}/>{customerName(booking.user)}</span><span><CalendarDays size={14}/>{formatDate(booking.bookingDate || booking.createdAt)}</span>{booking.message && <p>“{booking.message}”</p>}</div><span className={`seller-pill seller-pill--${booking.status}`}>{titleCase(booking.status)}</span>{booking.status === 'pending' && <div className="seller-booking-card__actions"><Button size="sm" icon={Check} loading={busyId === booking.id} onClick={() => update(booking, 'confirm')}>Confirm</Button><Button size="sm" variant="outline" icon={X} disabled={!!busyId} onClick={() => update(booking, 'cancel')}>Cancel</Button></div>}</article>)}</div> : <EmptyState icon={CalendarDays} title="No bookings found" description="Bookings matching this filter will appear here."/>}{total > 10 && <div className="seller-pagination"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}><ChevronLeft size={17}/> Previous</button><span>Page {page} of {Math.ceil(total / 10)}</span><button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(value => value + 1)}>Next <ChevronRight size={17}/></button></div>}</section>;
}

export function SellerServices() {
  const { user, notify } = useApp();
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [busyId, setBusyId] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const resource = useResource(signal => sellerApi.services(1, signal), [user?.id, revision]);
  const services = useMemo(() => sellerList(resource.data).filter(service => `${service.title} ${service.category?.name} ${service.subCategory?.name}`.toLowerCase().includes(query.toLowerCase())), [resource.data, query]);
  const changeStatus = async service => {
    setBusyId(service.id);
    try {
      if (service.status === 'active') await sellerApi.unpublishService(service.id);
      else await sellerApi.publishService(service.id);
      notify(service.status === 'active' ? 'Service unpublished.' : 'Service published.', 'success');
      setRevision(value => value + 1);
    } catch (error) { notify(error.message, 'error'); if (/subscription|upgrade your plan/i.test(error.message)) navigate('/seller/subscriptions'); }
    finally { setBusyId(''); }
  };
  const remove = async service => {
    setBusyId(service.id);
    try { await sellerApi.deleteService(service.id); notify('Service deleted.', 'success'); setServiceToDelete(null); setRevision(value => value + 1); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusyId(''); }
  };
  return <><SellerHeading eyebrow="YOUR EXPERTISE" title="Services" description="Create service listings, control what is live, and manage customer bookings." action={<Link to="/seller/services/new"><Button icon={Plus}>Add a service</Button></Link>}/><div className="seller-toolbar"><div className="seller-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your services" aria-label="Search your services"/></div></div>{resource.loading ? <Skeleton className="seller-loading"/> : resource.error ? <EmptyState icon={BriefcaseBusiness} title="Couldn’t load your services" description={resource.error.message}/> : services.length ? <div className="seller-service-grid">{services.map(service => <article className="seller-service-card" key={service.id}><div className="seller-service-card__image">{serviceImage(service) ? <img src={serviceImage(service)} alt=""/> : <BriefcaseBusiness size={34}/>}<span className={`seller-pill seller-pill--${service.status}`}>{titleCase(service.status)}</span></div><div className="seller-service-card__body"><small>{service.category?.name || 'Service'} · {service.subCategory?.name || 'General'}</small><h2>{service.title}</h2><p>{service.description}</p><div className="seller-service-card__meta"><span><MapPin size={14}/>{[service.location_city, service.location_state].filter(Boolean).join(', ') || 'Location not set'}</span><strong>{money(service.discount_price || service.price)}</strong></div><div className="seller-service-card__actions"><Button size="sm" variant={service.status === 'active' ? 'outline' : 'primary'} loading={busyId === service.id} onClick={() => changeStatus(service)}>{service.status === 'active' ? 'Unpublish' : 'Publish'}</Button><Link className="seller-row-link" to={`/seller/services/${service.id}`}><Pencil size={15}/> Edit</Link><button type="button" className="seller-danger-link" disabled={!!busyId || service.status === 'active'} title={service.status === 'active' ? 'Unpublish this service before deleting it' : 'Delete service'} onClick={() => setServiceToDelete(service)}><Trash2 size={15}/> Delete</button></div></div></article>)}</div> : <EmptyState icon={BriefcaseBusiness} title={query ? 'No matching services' : 'Share what you do'} description={query ? 'Try another search.' : 'Create a service listing so customers can discover and book your expertise.'} action={!query && <Link to="/seller/services/new"><Button>Add a service</Button></Link>}/>}<ServiceBookings/>{serviceToDelete && <ConfirmModal title="Delete service?" description={<>You’re about to permanently delete <strong>“{serviceToDelete.title}”</strong>. This action cannot be undone.</>} confirmLabel="Delete service" loading={busyId === serviceToDelete.id} onClose={() => setServiceToDelete(null)} onConfirm={() => remove(serviceToDelete)}/>}</>;
}

const emptyForm = { title: '', description: '', image_url: '', video_url: '', service_category_id: '', service_subcategory_id: '', location_city: '', location_state: '', location_country: 'Nigeria', work_experience_years: '', price: '', discount_price: '', is_negotiable: false };

function AttributeFields({ attributes, values, setValues }) {
  const set = (id, value) => setValues(current => ({ ...current, [id]: value }));
  if (!attributes.length) return null;
  return <section className="seller-panel"><h2>Service details</h2><p>Add details that help customers choose the right provider.</p><div className="seller-form-grid">{attributes.map(attribute => {
    const type = attribute.input_type;
    const options = sellerList(attribute.options);
    if (type === 'boolean' || type === 'bool_input') return <label className="seller-check" key={attribute.id}><input type="checkbox" checked={!!values[attribute.id]} onChange={event => set(attribute.id, event.target.checked)}/><span>{attribute.name}</span></label>;
    if (type === 'single_select') return <SelectField key={attribute.id} label={attribute.name} value={values[attribute.id] || ''} onChange={event => set(attribute.id, Number(event.target.value))}><option value="">Choose an option</option>{options.map(option => <option key={option.id} value={option.id}>{option.option_value}</option>)}</SelectField>;
    if (type === 'multi_select') return <label className="field seller-multi" key={attribute.id}><span className="field__label">{attribute.name}</span>{options.map(option => <span key={option.id}><input type="checkbox" checked={(values[attribute.id] || []).includes(option.id)} onChange={event => set(attribute.id, event.target.checked ? [...(values[attribute.id] || []), option.id] : (values[attribute.id] || []).filter(id => id !== option.id))}/>{option.option_value}</span>)}</label>;
    return <TextField key={attribute.id} label={attribute.name} type={type === 'number' || type === 'int_input' ? 'number' : 'text'} value={values[attribute.id] ?? ''} onChange={event => set(attribute.id, type === 'number' || type === 'int_input' ? Number(event.target.value) : event.target.value)}/>;
  })}</div></section>;
}

export function SellerServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, notify } = useApp();
  const serviceResource = useResource(signal => id ? sellerApi.service(id, signal) : Promise.resolve(null), [id, user?.id]);
  const categories = useResource(signal => sellerApi.serviceCategories(signal), [user?.id]);
  const existing = sellerList(serviceResource.data)[0] || null;
  const [form, setForm] = useState(emptyForm);
  const [attributeValues, setAttributeValues] = useState({});
  const [mainFile, setMainFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const subcategories = useResource(signal => form.service_category_id ? sellerApi.serviceSubCategories(form.service_category_id, signal) : Promise.resolve([]), [form.service_category_id]);
  const attributesResource = useResource(signal => form.service_category_id ? sellerApi.serviceAttributes(form.service_category_id, signal) : Promise.resolve([]), [form.service_category_id]);
  const attributes = sellerList(attributesResource.data);
  useEffect(() => { if (!existing) return; setForm({ ...emptyForm, ...Object.fromEntries(Object.keys(emptyForm).map(key => [key, existing[key] ?? emptyForm[key]])) }); setExistingImages(existing.additional_images || []); }, [existing]);
  useEffect(() => { if (!existing || !attributes.length) return; const byName = Object.fromEntries((existing.attributes || []).map(item => [item.name, item.values ?? item.value])); const mapped = {}; attributes.forEach(attribute => { const old = byName[attribute.name]; if (old === undefined) return; if (attribute.input_type === 'single_select') mapped[attribute.id] = sellerList(attribute.options).find(option => option.option_value === old)?.id || ''; else if (attribute.input_type === 'multi_select') mapped[attribute.id] = sellerList(attribute.options).filter(option => (old || []).includes(option.option_value)).map(option => option.id); else mapped[attribute.id] = old; }); setAttributeValues(mapped); }, [existing, attributesResource.data]);
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const removeMainImage = () => { setMainFile(null); setForm(current => ({ ...current, image_url: '' })); };
  const addSupportingImages = event => {
    const remaining = Math.max(0, 3 - existingImages.length - extraFiles.length);
    const selected = Array.from(event.target.files || []).slice(0, remaining);
    setExtraFiles(current => [...current, ...selected]);
    event.target.value = '';
  };
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const imageUrl = mainFile ? await uploadSellerImage(mainFile) : form.image_url;
      if (!imageUrl) throw new Error('Add a main service image.');
      const uploaded = await Promise.all(extraFiles.map(uploadSellerImage));
      const additionalImages = [...existingImages, ...uploaded];
      const serviceAttributes = attributes.map(attribute => ({ attributeId: Number(attribute.id), value: attributeValues[attribute.id] })).filter(item => item.value !== '' && item.value !== undefined && item.value !== null && (!Array.isArray(item.value) || item.value.length));
      const payload = { ...form, image_url: imageUrl, price: Number(form.price), discount_price: form.discount_price ? Number(form.discount_price) : null, work_experience_years: Number(form.work_experience_years), service_category_id: Number(form.service_category_id), service_subcategory_id: Number(form.service_subcategory_id), is_negotiable: !!form.is_negotiable, ...(additionalImages.length ? { additional_images: additionalImages } : {}), ...(serviceAttributes.length ? { attributes: serviceAttributes } : {}) };
      if (id) await sellerApi.updateService(id, payload); else await sellerApi.createService(payload);
      notify(id ? 'Service updated.' : 'Service created as an unpublished listing.', 'success');
      navigate('/seller/services');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  if (id && serviceResource.loading) return <Skeleton className="seller-loading"/>;
  if (serviceResource.error) return <EmptyState icon={BriefcaseBusiness} title="Couldn’t load this service" description={serviceResource.error.message}/>;
  if (existing?.status === 'active') return <><Link className="seller-back" to="/seller/services"><ChevronLeft size={17}/> All services</Link><EmptyState icon={BriefcaseBusiness} title="Unpublish before editing" description="Active services are protected from changes. Return to your services, unpublish this listing, then edit it."/></>;
  return <><Link className="seller-back" to="/seller/services"><ChevronLeft size={17}/> All services</Link><SellerHeading eyebrow={id ? 'EDIT LISTING' : 'NEW LISTING'} title={id ? 'Edit service' : 'Create a service'} description="Give customers the information they need to book with confidence."/><form className="seller-form" onSubmit={submit}><section className="seller-panel"><h2>Basics</h2><p>Use a clear title and explain exactly what the customer receives.</p><TextField label="Service title" name="title" minLength="5" maxLength="100" required value={form.title} onChange={change}/><label className="field"><span className="field__label">Description</span><textarea className="field__input seller-textarea" name="description" minLength="10" maxLength="1000" rows="6" required value={form.description} onChange={change}/></label>{(categories.error || subcategories.error) && <div className="form-alert" role="alert">Service categories could not be loaded. Refresh the page and try again.</div>}<div className="seller-form-grid"><SelectField label="Category" name="service_category_id" required disabled={categories.loading || !!categories.error} value={form.service_category_id} onChange={event => { change(event); setForm(current => ({ ...current, service_subcategory_id: '' })); setAttributeValues({}); }}><option value="">{categories.loading ? 'Loading categories…' : 'Choose a category'}</option>{sellerList(categories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField><SelectField label="Subcategory" name="service_subcategory_id" required disabled={!form.service_category_id || subcategories.loading || !!subcategories.error} value={form.service_subcategory_id} onChange={change}><option value="">{subcategories.loading ? 'Loading subcategories…' : 'Choose a subcategory'}</option>{sellerList(subcategories.data).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></div></section><AttributeFields attributes={attributes} values={attributeValues} setValues={setAttributeValues}/><section className="seller-panel"><h2>Photos</h2><p>The main image appears in search. Add up to three more examples of your work.</p><label className="seller-upload"><ImagePlus size={25}/><strong>{mainFile || form.image_url ? 'Replace main image' : 'Add main image'}</strong><span>JPG, PNG, or WebP</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { setMainFile(event.target.files?.[0] || null); event.target.value = ''; }}/></label>{(mainFile || form.image_url) && <div className="seller-service-preview"><img src={mainFile ? URL.createObjectURL(mainFile) : form.image_url} alt="Service preview"/><button type="button" aria-label="Remove main image" title="Remove main image" onClick={removeMainImage}><Trash2 size={17}/></button></div>}<label className="seller-upload seller-upload--compact"><ImagePlus size={21}/><strong>Add supporting images</strong><span>{existingImages.length + extraFiles.length}/3 added</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={existingImages.length + extraFiles.length >= 3} onChange={addSupportingImages}/></label>{(existingImages.length > 0 || extraFiles.length > 0) && <div className="seller-upload-preview">{existingImages.map(url => <span className="seller-upload-image" key={url}><img src={url} alt="Current service"/><button type="button" aria-label="Remove image" onClick={() => setExistingImages(images => images.filter(image => image !== url))}><Trash2 size={15}/></button></span>)}{extraFiles.map((file, index) => <span className="seller-upload-image" key={`${file.name}-${file.size}-${index}`}><img src={URL.createObjectURL(file)} alt="New service"/><button type="button" aria-label="Remove image" onClick={() => setExtraFiles(files => files.filter((_, fileIndex) => fileIndex !== index))}><Trash2 size={15}/></button></span>)}</div>}</section><section className="seller-panel"><h2>Price and location</h2><p>Set your standard price and where this service is available.</p><div className="seller-form-grid"><TextField label="Price (₦)" name="price" type="number" min="1" step="0.01" required value={form.price} onChange={change}/><TextField label="Discount price (optional)" name="discount_price" type="number" min="0" step="0.01" value={form.discount_price} onChange={change}/><TextField label="Years of experience" name="work_experience_years" type="number" min="0" step="1" required value={form.work_experience_years} onChange={change}/><label className="seller-check"><input name="is_negotiable" type="checkbox" checked={form.is_negotiable} onChange={change}/><span>Customers may negotiate the price</span></label></div><div className="seller-form-grid seller-form-grid--three"><TextField label="City" name="location_city" required value={form.location_city} onChange={change}/><TextField label="State" name="location_state" required value={form.location_state} onChange={change}/><TextField label="Country" name="location_country" required value={form.location_country} onChange={change}/></div></section><div className="seller-form-actions"><Link to="/seller/services">Cancel</Link><Button type="submit" loading={busy} disabled={!!(categories.error || subcategories.error)}>{id ? 'Save changes' : 'Create service'}</Button></div></form></>;
}
