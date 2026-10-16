import { Clock3, MapPin, Plus, Trash2, Truck } from 'lucide-react';
import { SelectField, TextField } from '../../components/ui';

const schedules = [
  { key: 'monday_friday', label: 'Monday–Friday', start: '09:00', end: '18:00' },
  { key: 'saturday', label: 'Saturday', start: '10:00', end: '16:00' },
  { key: 'sunday', label: 'Sunday', start: '10:00', end: '16:00' },
];

const arrivalOptions = ['Same day', 'Next day', '2–3 days', '3–5 days', '5–7 days'];

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

export default function StoreHoursDelivery({ values, onHoursChange, deliveryOptions, onDeliveryChange }) {
  const updateDelivery = (index, field, value) => onDeliveryChange(current => current.map((option, itemIndex) => itemIndex === index ? { ...option, [field]: value } : option));
  const addDelivery = () => onDeliveryChange(current => [...current, { city: '', price: '', arrival_day: '' }]);

  return <section className="seller-panel seller-hours-delivery">
    <div className="seller-section-title"><span className="seller-section-icon"><Clock3 size={20}/></span><div><h2>Opening hours</h2><p>Let buyers know when your store is available.</p></div></div>
    <div className="seller-hours-list">{schedules.map(config => <HoursRow key={config.key} config={config} value={values[config.key]} onChange={value => onHoursChange(config.key, value)}/>)}</div>
    <div className="seller-delivery-section">
      <div className="seller-section-title"><span className="seller-section-icon"><Truck size={20}/></span><div><h2>Delivery areas</h2><p>Add the places you deliver to, with the fee and expected arrival.</p></div></div>
      {deliveryOptions.length ? <div className="seller-delivery-list">{deliveryOptions.map((option, index) => <div className="seller-delivery-card" key={index}>
        <div className="seller-delivery-card__head"><strong><MapPin size={16}/> Area {index + 1}</strong><button type="button" aria-label={`Remove delivery area ${index + 1}`} onClick={() => onDeliveryChange(current => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16}/> Remove</button></div>
        <div className="seller-delivery-card__fields"><TextField label="City or area" placeholder="e.g. Lagos" required value={option.city || ''} onChange={event => updateDelivery(index, 'city', event.target.value)}/><TextField label="Delivery fee (₦)" type="number" min="0" step="0.01" placeholder="0 for free" required value={option.price ?? ''} onChange={event => updateDelivery(index, 'price', event.target.value)}/><SelectField label="Estimated arrival" required value={option.arrival_day || ''} onChange={event => updateDelivery(index, 'arrival_day', event.target.value)}><option value="">Choose a timeframe</option>{option.arrival_day && !arrivalOptions.includes(option.arrival_day) && <option value={option.arrival_day}>{option.arrival_day}</option>}{arrivalOptions.map(option => <option key={option} value={option}>{option}</option>)}</SelectField></div>
      </div>)}</div> : <div className="seller-delivery-empty"><MapPin size={20}/><span>No delivery areas added yet.</span></div>}
      <button className="seller-add-delivery" type="button" onClick={addDelivery}><Plus size={17}/> Add delivery area</button>
    </div>
  </section>;
}
