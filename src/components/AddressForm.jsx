import { useState } from 'react';
import { checkoutApi } from '../api/checkout';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { parseLocation } from '../utils/checkout';
import { Button, SelectField, TextField } from './ui';
const countries = [{ code: 'NG', name: 'Nigeria' }, { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' }];
export default function AddressForm({ onSaved, onCancel }) {
  const { user, updateUser, notify } = useApp();
  const existing = parseLocation(user?.location) || {};
  const [values, setValues] = useState({ country: existing.country || 'Nigeria', state: existing.state || '', city: existing.city || '', street: existing.street || existing.address || '', zipCode: existing.zipCode || '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const code = countries.find(item => item.name === values.country)?.code || 'NG';
  const regions = useResource(signal => checkoutApi.shippingRegions(code, signal), [code]);
  const states = Array.isArray(regions.data?.children) ? regions.data.children : [];
  const cities = states.find(item => item.name === values.state)?.children || [];
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => { event.preventDefault(); setBusy(true); setError(''); try { const response = await checkoutApi.updateAddress(user, values); updateUser({ ...response, location: response?.location || values }); notify('Delivery address saved.', 'success'); onSaved?.(); } catch (error) { setError(error.message); } finally { setBusy(false); } };
  return <form className="address-form" onSubmit={submit}><SelectField label="Country" name="country" value={values.country} onChange={event => setValues(current => ({ ...current, country: event.target.value, state: '', city: '' }))}>{countries.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</SelectField><div className="form-row">{states.length ? <SelectField label="State / province" name="state" value={values.state} onChange={event => setValues(current => ({ ...current, state: event.target.value, city: '' }))} required><option value="">Choose a state</option>{states.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</SelectField> : <TextField label="State / province" name="state" value={values.state} onChange={change} placeholder="Your state" required/>}{cities.length ? <SelectField label="City" name="city" value={values.city} onChange={change} required><option value="">Choose a city</option>{cities.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</SelectField> : <TextField label="City" name="city" value={values.city} onChange={change} placeholder="Your city" required/>}</div><TextField label="Street address" name="street" value={values.street} onChange={change} placeholder="House number and street" required/><TextField label="Postal / ZIP code" name="zipCode" value={values.zipCode} onChange={change} placeholder="Postal code" required/>{regions.error && <p className="address-form__note">Location suggestions are unavailable. You can enter your address manually.</p>}{error && <div className="form-alert" role="alert">{error}</div>}<div className="address-form__actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" loading={busy}>Save address</Button></div></form>;
}
