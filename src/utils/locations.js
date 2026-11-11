// Comprehensive built-in location dataset for Nigeria, United States, and United Kingdom.
// Ensures dropdown selects for State and City are always available,
// even when AliExpress or network services are unavailable.

export const supportedCountries = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
];

export const nigeriaStates = [
  {
    name: 'Abia',
    code: 'AB',
    cities: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu', 'Bende', 'Isiala Ngwa', 'Osisioma', 'Ukwa'],
  },
  {
    name: 'Adamawa',
    code: 'AD',
    cities: ['Yola', 'Mubi', 'Jimeta', 'Numan', 'Ganye', 'Michika'],
  },
  {
    name: 'Akwa Ibom',
    code: 'AK',
    cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak', 'Etinan', 'Ikot Abasi'],
  },
  {
    name: 'Anambra',
    code: 'AN',
    cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Ihiala', 'Ogidi'],
  },
  {
    name: 'Bauchi',
    code: 'BA',
    cities: ['Bauchi', 'Azare', 'Misau', 'Jama\'are', 'Katagum'],
  },
  {
    name: 'Bayelsa',
    code: 'BY',
    cities: ['Yenagoa', 'Brass', 'Ogbia', 'Sagbama', 'Nembe', 'Amassoma'],
  },
  {
    name: 'Benue',
    code: 'BE',
    cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya'],
  },
  {
    name: 'Borno',
    code: 'BO',
    cities: ['Maiduguri', 'Biu', 'Bama', 'Monguno'],
  },
  {
    name: 'Cross River',
    code: 'CR',
    cities: ['Calabar', 'Ikom', 'Ogoja', 'Ugep', 'Obudu', 'Akamkpa'],
  },
  {
    name: 'Delta',
    code: 'DE',
    cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor', 'Oghara', 'Effurun'],
  },
  {
    name: 'Ebonyi',
    code: 'EB',
    cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ishielu'],
  },
  {
    name: 'Edo',
    code: 'ED',
    cities: ['Benin City', 'Auchi', 'Uromi', 'Ekpoma', 'Sabongida-Ora'],
  },
  {
    name: 'Ekiti',
    code: 'EK',
    cities: ['Ado-Ekiti', 'Ikere-Ekiti', 'Ijero-Ekiti', 'Oye-Ekiti', 'Efon-Alaaye'],
  },
  {
    name: 'Enugu',
    code: 'EN',
    cities: ['Enugu', 'Nsukka', 'Awgu', 'Oji River', 'Udi'],
  },
  {
    name: 'FCT - Abuja',
    code: 'FC',
    cities: ['Abuja', 'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jabi', 'Utako', 'Apo', 'Lugbe', 'Bwari', 'Kuje', 'Gwagwalada'],
  },
  {
    name: 'Gombe',
    code: 'GO',
    cities: ['Gombe', 'Kaltungo', 'Billiri', 'Bajoga'],
  },
  {
    name: 'Imo',
    code: 'IM',
    cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Oguta'],
  },
  {
    name: 'Jigawa',
    code: 'JI',
    cities: ['Dutse', 'Hadejia', 'Kazaure', 'Gumel', 'Ringim'],
  },
  {
    name: 'Kaduna',
    code: 'KD',
    cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Sabon Gari'],
  },
  {
    name: 'Kano',
    code: 'KN',
    cities: ['Kano', 'Wudil', 'Rano', 'Bichi'],
  },
  {
    name: 'Katsina',
    code: 'KT',
    cities: ['Katsina', 'Daura', 'Funtua', 'Malumfashi'],
  },
  {
    name: 'Kebbi',
    code: 'KE',
    cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
  },
  {
    name: 'Kogi',
    code: 'KO',
    cities: ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Anyigba'],
  },
  {
    name: 'Kwara',
    code: 'KW',
    cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba', 'Lafiagi'],
  },
  {
    name: 'Lagos',
    code: 'LA',
    cities: [
      'Lagos',
      'Ikeja',
      'Lekki',
      'Victoria Island',
      'Ikoyi',
      'Yaba',
      'Surulere',
      'Ajah',
      'Festac',
      'Maryland',
      'Alimosho',
      'Oshodi',
      'Agege',
      'Ikorodu',
      'Epe',
      'Badagry',
      'Gbagada',
      'Magodo',
      'Ogba',
      'Ojota',
      'Somolu',
      'Apapa',
      'Mushin',
      'Isolo',
      'Egbeda',
    ],
  },
  {
    name: 'Nasarawa',
    code: 'NA',
    cities: ['Lafia', 'Keffi', 'Karu', 'Akwanga', 'Nasarawa'],
  },
  {
    name: 'Niger',
    code: 'NI',
    cities: ['Minna', 'Bida', 'Suleja', 'Kontagora'],
  },
  {
    name: 'Ogun',
    code: 'OG',
    cities: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota', 'Ilaro', 'Mowe', 'Ibafo'],
  },
  {
    name: 'Ondo',
    code: 'ON',
    cities: ['Akure', 'Ondo Town', 'Owo', 'Ikare', 'Okitipupa'],
  },
  {
    name: 'Osun',
    code: 'OS',
    cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Ikirun', 'Iwo'],
  },
  {
    name: 'Oyo',
    code: 'OY',
    cities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki'],
  },
  {
    name: 'Plateau',
    code: 'PL',
    cities: ['Jos', 'Bukuru', 'Pankshin', 'Shendam'],
  },
  {
    name: 'Rivers',
    code: 'RI',
    cities: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny', 'Okrika', 'Oyigbo'],
  },
  {
    name: 'Sokoto',
    code: 'SO',
    cities: ['Sokoto', 'Tambuwal', 'Wurno'],
  },
  {
    name: 'Taraba',
    code: 'TA',
    cities: ['Jalingo', 'Wukari', 'Bali', 'Gembu'],
  },
  {
    name: 'Yobe',
    code: 'YO',
    cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'],
  },
  {
    name: 'Zamfara',
    code: 'ZA',
    cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara'],
  },
];

export const usStates = [
  { name: 'California', code: 'CA', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'] },
  { name: 'New York', code: 'NY', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany'] },
  { name: 'Texas', code: 'TX', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio'] },
  { name: 'Florida', code: 'FL', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
  { name: 'Illinois', code: 'IL', cities: ['Chicago', 'Aurora', 'Naperville'] },
  { name: 'Georgia', code: 'GA', cities: ['Atlanta', 'Savannah', 'Augusta'] },
  { name: 'Washington', code: 'WA', cities: ['Seattle', 'Spokane', 'Tacoma'] },
  { name: 'Pennsylvania', code: 'PA', cities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
  { name: 'Massachusetts', code: 'MA', cities: ['Boston', 'Cambridge', 'Worcester'] },
  { name: 'District of Columbia', code: 'DC', cities: ['Washington'] },
];

export const ukRegions = [
  { name: 'England', code: 'ENG', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'] },
  { name: 'Scotland', code: 'SCT', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'] },
  { name: 'Wales', code: 'WLS', cities: ['Cardiff', 'Swansea', 'Newport'] },
  { name: 'Northern Ireland', code: 'NIR', cities: ['Belfast', 'Derry', 'Lisburn'] },
];

export function getBuiltInStates(countryCodeOrName) {
  const norm = String(countryCodeOrName || '').trim().toUpperCase();
  if (norm === 'NG' || norm === 'NIGERIA') {
    return nigeriaStates.map(s => ({
      name: s.name,
      code: s.code,
      children: s.cities.map(c => ({ name: c })),
    }));
  }
  if (norm === 'US' || norm === 'USA' || norm === 'UNITED STATES') {
    return usStates.map(s => ({
      name: s.name,
      code: s.code,
      children: s.cities.map(c => ({ name: c })),
    }));
  }
  if (norm === 'GB' || norm === 'UK' || norm === 'UNITED KINGDOM') {
    return ukRegions.map(s => ({
      name: s.name,
      code: s.code,
      children: s.cities.map(c => ({ name: c })),
    }));
  }
  return [];
}
