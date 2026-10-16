import { PHONE_COUNTRIES, nationalPhoneInput } from '../utils/phone';

export default function PhoneField({ countryCode, onCountryChange, value, onChange }) {
  const country = PHONE_COUNTRIES.find(item => item.code === countryCode) || PHONE_COUNTRIES[0];
  return <div className="field"><label className="field__label" htmlFor="phoneNumber">Phone number</label><div className="phone-field"><select aria-label="Country calling code" value={country.code} onChange={event => onCountryChange(event.target.value)}>{PHONE_COUNTRIES.map(item => <option key={item.code} value={item.code}>{item.flag} {item.code}</option>)}</select><span className="phone-field__prefix" aria-hidden="true">+{country.dialCode}</span><input id="phoneNumber" name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel-national" value={value} onChange={event => onChange(nationalPhoneInput(event.target.value, country.code))} placeholder={country.placeholder} required/></div></div>;
}
