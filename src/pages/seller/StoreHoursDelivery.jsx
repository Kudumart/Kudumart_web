import { Clock3, MapPin, Plus, Trash2, Truck } from 'lucide-react';
import { SelectField, TextField } from '../../components/ui';
import { checkoutApi } from '../../api/checkout';
import { useResource } from '../../hooks/useResource';

const schedules = [
  { key: 'monday_friday', label: 'Monday–Friday', start: '09:00', end: '18:00' },
  { key: 'saturday', label: 'Saturday', start: '10:00', end: '16:00' },
  { key: 'sunday', label: 'Sunday', start: '10:00', end: '16:00' },
];

const arrivalOptions = ['Same day', 'Next day', '2–3 days', '3–5 days', '5–7 days'];
const countries = [{ code: 'NG', name: 'Nigeria' }, { code: 'US', name: 'United States' }, { code: 'UK', name: 'United Kingdom' }];

function toTwentyFourHour(time, period) {
  const [hours, minutes] = time.split(':').map(Number);
  if (!period) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const hour = (hours % 12) + (period.toUpperCase() === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toTwelveHour(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

function readSchedule(value, defaults) {
  if (!value || /^closed$/i.test(value.trim())) return { open: false, start: defaults.start, end: defaults.end };
  const match = value.match(/(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–—]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i);
  return match
    ? { open: true, start: toTwentyFourHour(match[1], match[2]), end: toTwentyFourHour(match[3], match[4]) }
    : { open: true, start: defaults.start, end: defaults.end, legacy: value };
}

function HoursRow({ config, value, onChange }) {
  const schedule = readSchedule(value, config);
  const update = (start, end) => onChange(`${toTwelveHour(start)} – ${toTwelveHour(end)}`);

  return <div className={`seller-hours-row${schedule.open ? '' : ' seller-hours-row--closed'}`}>
    <div className="seller-hours-row__day"><Clock3 size={17}/><strong>{config.label}</strong></div>
    <div className="seller-hours-row__control">
      <span>{schedule.open ? 'Open' : 'Closed'}</span>
      <button type="button" role="switch" aria-label={`${config.label} open`} aria-checked={schedule.open} className={`seller-hours-switch${schedule.open ? ' active' : ''}`} onClick={() => onChange(schedule.open ? 'Closed' : `${toTwelveHour(schedule.start)} – ${toTwelveHour(schedule.end)}`)}><span/></button>
    </div>
    {schedule.open && <div className="seller-hours-row__times">
      <label><span>Opens</span><input type="time" aria-label={`${config.label} opens`} value={schedule.start} onChange={event => update(event.target.value, schedule.end)} required/></label>
      <span className="seller-hours-row__dash">—</span>
      <label><span>Closes</span><input type="time" aria-label={`${config.label} closes`} value={schedule.end} onChange={event => update(schedule.start, event.target.value)} required/></label>
    </div>}
    {schedule.legacy && <small className="seller-hours-row__legacy">Current schedule: {schedule.legacy}. Select times to replace it.</small>}
  </div>;
}


function DeliveryRuleFields({ option, onPatch }) {
  const scope = option.scope || 'city';
  const country = countries.find(item => item.code === option.countryCode || item.name === option.country);
  const regions = useResource(signal => country ? checkoutApi.shippingRegions(country.code, signal) : Promise.resolve(null), [country?.code]);
  const states = Array.isArray(regions.data?.children) ? regions.data.children.map(state => ({ ...state, code: state.code || state.name })) : [];
  const state = states.find(item => item.code === option.stateCode || item.name === option.state);
  const cities = state?.children || [];
  const pickCountry = code => { const next = countries.find(item => item.code === code); onPatch({ country: next?.name || '', countryCode: next?.code || '', state: '', stateCode: '', city: scope === 'country' ? next?.name || '' : '' }); };
  const pickState = code => { const next = states.find(item => item.code === code); onPatch({ state: next?.name || '', stateCode: next?.code || '', city: scope === 'state' ? next?.name || '' : '' }); };
  const pickScope = next => onPatch({ scope: next, city: next === 'country' ? country?.name || '' : next === 'state' ? option.state || '' : '', ...(next === 'country' ? { state: '', stateCode: '' } : {}) });
  const manual = !states.length && !regions.loading;
  return <>
    <SelectField label="Coverage" required value={scope} onChange={event => pickScope(event.target.value)}><option value="city">Specific city</option><option value="state">Entire state / region</option><option value="country">Entire country</option></SelectField>
    <SelectField label="Country" required value={country?.code || ''} onChange={event => pickCountry(event.target.value)}><option value="">Choose a country</option>{countries.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</SelectField>
    {scope === 'country' ? <TextField label="Applies to" readOnly value={country ? `All of ${country.name}` : 'Select a country'}/> : manual
      ? <TextField label={scope === 'state' ? 'State / region' : 'City'} required value={scope === 'state' ? option.state || '' : option.city || ''} onChange={event => onPatch(scope === 'state' ? { state: event.target.value, city: event.target.value } : { city: event.target.value })}/>
      : <>
        <SelectField label="State / region" required disabled={!country} value={state?.code || ''} onChange={event => pickState(event.target.value)}><option value="">{regions.loading ? 'Loading…' : 'Choose a state'}</option>{states.map(item => <option key={`${item.code}-${item.name}`} value={item.code}>{item.name}</option>)}</SelectField>
        {scope === 'city' && <SelectField label="City" required disabled={!state} value={cities.some(item => item.name === option.city) ? option.city : ''} onChange={event => onPatch({ city: event.target.value })}><option value="">Choose a city</option>{cities.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</SelectField>}
      </>}
  </>;
}

export default function StoreHoursDelivery({ values, country, onHoursChange, deliveryOptions, onDeliveryChange }) {
  const updateDelivery = (index, field, value) => onDeliveryChange(current => current.map((option, itemIndex) => itemIndex === index ? { ...option, ...(typeof field === 'object' ? field : { [field]: value }) } : option));
  const addDelivery = () => onDeliveryChange(current => [...current, { scope: 'city', country, countryCode: countries.find(item => item.name === country)?.code || '', state: '', stateCode: '', city: '', price: '', arrival_day: '' }]);

  return <section className="seller-panel seller-hours-delivery">
    <div className="seller-section-title"><span className="seller-section-icon"><Clock3 size={20}/></span><div><h2>Opening hours</h2><p>Let buyers know when your store is available.</p></div></div>
    <div className="seller-hours-list">{schedules.map(config => <HoursRow key={config.key} config={config} value={values[config.key]} onChange={value => onHoursChange(config.key, value)}/>)}</div>
    <div className="seller-delivery-section">
      <div className="seller-section-title"><span className="seller-section-icon"><Truck size={20}/></span><div><h2>Delivery areas <span aria-hidden="true">*</span></h2><p>Add at least one city, state, or countrywide rule. Checkout uses these rules to calculate the fee.</p></div></div>
      {deliveryOptions.length ? <div className="seller-delivery-list">{deliveryOptions.map((option, index) => <div className="seller-delivery-card" key={index}>
        <div className="seller-delivery-card__head"><strong><MapPin size={16}/> Delivery rule {index + 1}</strong>{deliveryOptions.length > 1 && <button type="button" aria-label={`Remove delivery rule ${index + 1}`} onClick={() => onDeliveryChange(current => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16}/> Remove</button>}</div>
        <div className="seller-delivery-card__fields"><DeliveryRuleFields option={option} onPatch={patch => updateDelivery(index, patch)}/><TextField label="Delivery fee (₦)" type="number" min="0" step="0.01" placeholder="0 for free" required value={option.price ?? ''} onChange={event => updateDelivery(index, 'price', event.target.value)}/><SelectField label="Estimated arrival" required value={option.arrival_day || ''} onChange={event => updateDelivery(index, 'arrival_day', event.target.value)}><option value="">Choose a timeframe</option>{option.arrival_day && !arrivalOptions.includes(option.arrival_day) && <option value={option.arrival_day}>{option.arrival_day}</option>}{arrivalOptions.map(option => <option key={option} value={option}>{option}</option>)}</SelectField></div>
      </div>)}</div> : <div className="seller-delivery-empty"><MapPin size={20}/><span><strong>No delivery areas added yet.</strong><small>Delivery checkout cannot calculate a fee until you add an area. Customers can still choose pickup.</small></span></div>}
      <button className="seller-add-delivery" type="button" onClick={addDelivery}><Plus size={17}/> Add delivery area</button>
    </div>
  </section>;
}
