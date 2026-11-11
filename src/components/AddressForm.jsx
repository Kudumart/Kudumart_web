import { useState } from 'react';
import { checkoutApi } from '../api/checkout';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { parseLocation } from '../utils/checkout';
import { getBuiltInStates, supportedCountries } from '../utils/locations';
import { Button, SelectField, TextField } from './ui';

export default function AddressForm({ onSaved, onCancel }) {
  const { user, updateUser, notify } = useApp();
  const existing = parseLocation(user?.location) || {};
  const [values, setValues] = useState({
    country: existing.country || 'Nigeria',
    state: existing.state || '',
    city: existing.city || '',
    street: existing.street || existing.address || '',
    zipCode: existing.zipCode || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [customCity, setCustomCity] = useState(false);

  const countryQuery = String(values.country || '').trim().toLowerCase();
  const countryObj = supportedCountries.find(
    item => item.name.toLowerCase() === countryQuery || item.code.toLowerCase() === countryQuery
  ) || supportedCountries[0];
  const code = countryObj.code;
  const regions = useResource(signal => checkoutApi.shippingRegions(code, signal), [code]);

  const remoteStates = Array.isArray(regions.data?.children) && regions.data.children.length > 0 ? regions.data.children : [];
  const fallbackStates = getBuiltInStates(code);
  const states = remoteStates.length > 0 ? remoteStates : fallbackStates;

  const normState = String(values.state || '').trim().toLowerCase().replace(/\s+state$/i, '');
  const selectedState = states.find(item => {
    const itemName = String(item.name || '').trim().toLowerCase().replace(/\s+state$/i, '');
    const itemCode = String(item.code || '').trim().toLowerCase();
    return itemName === normState || itemCode === normState;
  });
  const cities = selectedState?.children || [];

  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await checkoutApi.updateAddress(user, values);
      updateUser({ ...response, location: response?.location || values });
      notify('Delivery address saved.', 'success');
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="address-form" onSubmit={submit}>
      <SelectField
        label="Country"
        name="country"
        value={values.country}
        onChange={event => {
          setValues(current => ({ ...current, country: event.target.value, state: '', city: '' }));
          setCustomCity(false);
        }}
      >
        {supportedCountries.map(item => (
          <option key={item.code} value={item.name}>
            {item.name}
          </option>
        ))}
      </SelectField>

      <div className="form-row">
        {states.length > 0 ? (
          <SelectField
            label="State / province"
            name="state"
            value={selectedState ? selectedState.name : values.state}
            onChange={event => {
              setValues(current => ({ ...current, state: event.target.value, city: '' }));
              setCustomCity(false);
            }}
            required
          >
            <option value="">Choose a state</option>
            {states.map(item => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </SelectField>
        ) : (
          <TextField
            label="State / province"
            name="state"
            value={values.state}
            onChange={change}
            placeholder="Your state"
            required
          />
        )}

        {cities.length > 0 && !customCity ? (
          <div>
            <SelectField
              label="City"
              name="city"
              value={
                cities.some(c => c.name.toLowerCase() === String(values.city || '').trim().toLowerCase())
                  ? (cities.find(c => c.name.toLowerCase() === String(values.city || '').trim().toLowerCase())?.name || values.city)
                  : values.city
                    ? '__other__'
                    : ''
              }
              onChange={event => {
                if (event.target.value === '__other__') {
                  setCustomCity(true);
                  setValues(current => ({ ...current, city: '' }));
                } else {
                  setValues(current => ({ ...current, city: event.target.value }));
                }
              }}
              required
            >
              <option value="">Choose a city</option>
              {cities.map(item => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
              <option value="__other__">Other / Enter manually…</option>
            </SelectField>
          </div>
        ) : (
          <div>
            <TextField
              label="City"
              name="city"
              value={values.city}
              onChange={change}
              placeholder="Your city"
              required
            />
            {cities.length > 0 && customCity && (
              <button
                type="button"
                className="address-form__switch"
                onClick={() => {
                  setCustomCity(false);
                  setValues(current => ({ ...current, city: '' }));
                }}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--orange, #e9612c)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 0',
                  display: 'inline-block',
                }}
              >
                ← Back to city list
              </button>
            )}
          </div>
        )}
      </div>

      <TextField
        label="Street address"
        name="street"
        value={values.street}
        onChange={change}
        placeholder="House number and street"
        required
      />

      <TextField
        label="Postal / ZIP code"
        name="zipCode"
        value={values.zipCode}
        onChange={change}
        placeholder="Postal code"
        required
      />

      {regions.error && !states.length && (
        <p className="address-form__note">Location suggestions are unavailable. You can enter your address manually.</p>
      )}

      {error && <div className="form-alert" role="alert">{error}</div>}

      <div className="address-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Save address
        </Button>
      </div>
    </form>
  );
}
