export const PHONE_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '234', placeholder: '801 234 5678' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '1', placeholder: '202 555 0123' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '44', placeholder: '7700 900123' },
];

export function nationalPhoneInput(value, countryCode) {
  const country = PHONE_COUNTRIES.find(item => item.code === countryCode) || PHONE_COUNTRIES[0];
  const raw = String(value || '').trim();
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith(country.dialCode) && (raw.startsWith('+') || digits.length > (country.code === 'NG' ? 11 : 10))) digits = digits.slice(country.dialCode.length);
  if (raw.startsWith('00') && digits.startsWith(`00${country.dialCode}`)) digits = digits.slice(country.dialCode.length + 2);
  return digits.slice(0, 15);
}

export function internationalPhone(value, countryCode) {
  const country = PHONE_COUNTRIES.find(item => item.code === countryCode) || PHONE_COUNTRIES[0];
  let digits = nationalPhoneInput(value, countryCode);
  if (country.code !== 'US') digits = digits.replace(/^0+/, '');
  if (country.code === 'US' && digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length < 7 || digits.length > 12) return null;
  return `+${country.dialCode}${digits}`;
}

export function phoneCountryFor(value, fallback = 'NG') {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!raw.startsWith('+') && !raw.startsWith('00')) return fallback;
  const internationalDigits = raw.startsWith('00') ? digits.slice(2) : digits;
  return [...PHONE_COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find(country => internationalDigits.startsWith(country.dialCode))?.code || fallback;
}
