/** Guest-facing allowlisted view model. Keep private contact details OUT of search results. */
export interface PublicProfile {
  code: string;
  name: string;
  nameTa: string;
  age: number | null;
  gender: string;
  city: string;
  district: string;
  state: string;
  country: string;
  religion: string;
  caste: string;
  subCaste: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  profession: string;
  heightCm: number | null;
  annualIncome: string;
  rasi: string;
  nakshatra: string;
  dosham: string;
  diet: string;
  smoking: string;
  drinking: string;
  familyType: string;
  familyValues: string;
  hobbies: string[];
  image: string;
  updatedAt: string;
  latitude: number | null;
  longitude: number | null;
}

export type FilterStringKey =
  | 'gender' | 'maritalStatus' | 'religion' | 'caste' | 'subCaste'
  | 'motherTongue' | 'country' | 'state' | 'district' | 'city' | 'education'
  | 'profession' | 'annualIncome' | 'rasi' | 'nakshatra' | 'dosham'
  | 'diet' | 'smoking' | 'drinking' | 'familyType' | 'familyValues';

export interface SearchFilters {
  gender: string; ageFrom: number | null; ageTo: number | null;
  heightFrom: number | null; heightTo: number | null;
  maritalStatus: string; religion: string; caste: string; subCaste: string;
  motherTongue: string; country: string; state: string; district: string; city: string;
  education: string; profession: string; annualIncome: string;
  rasi: string; nakshatra: string; dosham: string;
  diet: string; smoking: string; drinking: string;
  familyType: string; familyValues: string;
  hobbies: string[]; sharedHobbiesOnly: boolean;
  photoOnly: boolean; nearbyKm: number | null;
}

export type FilterOptions = Record<FilterStringKey, string[]>;
export const STRING_FILTERS: readonly FilterStringKey[] = [
  'gender', 'maritalStatus', 'religion', 'caste', 'subCaste', 'motherTongue',
  'country', 'state', 'district', 'city', 'education', 'profession', 'annualIncome',
  'rasi', 'nakshatra', 'dosham', 'diet', 'smoking', 'drinking', 'familyType', 'familyValues'
];
export const EMPTY_FILTERS: Readonly<SearchFilters> = Object.freeze({
  gender: '', ageFrom: null, ageTo: null, heightFrom: null, heightTo: null,
  maritalStatus: '', religion: '', caste: '', subCaste: '', motherTongue: '',
  country: '', state: '', district: '', city: '', education: '', profession: '', annualIncome: '',
  rasi: '', nakshatra: '', dosham: '', diet: '', smoking: '', drinking: '',
  familyType: '', familyValues: '', hobbies: [], sharedHobbiesOnly: false,
  photoOnly: false, nearbyKm: null
});

export const HOBBIES: { value: string; en: string; ta: string }[] = [
  {value:'Music', en:'Music', ta:'இசை'}, {value:'Travel', en:'Travel', ta:'பயணம்'},
  {value:'Reading', en:'Reading', ta:'வாசிப்பு'}, {value:'Cooking', en:'Cooking', ta:'சமையல்'},
  {value:'Movies', en:'Movies', ta:'திரைப்படங்கள்'}, {value:'Sports', en:'Sports', ta:'விளையாட்டு'},
  {value:'Fitness', en:'Fitness', ta:'உடற்பயிற்சி'}, {value:'Gardening', en:'Gardening', ta:'தோட்டக்கலை'},
  {value:'Dance', en:'Dance', ta:'நடனம்'}, {value:'Art', en:'Art', ta:'கலை'},
  {value:'Photography', en:'Photography', ta:'புகைப்படக்கலை'}, {value:'Yoga', en:'Yoga', ta:'யோகா'},
  {value:'Volunteering', en:'Volunteering', ta:'தன்னார்வ சேவை'}, {value:'Spirituality', en:'Spirituality', ta:'ஆன்மிகம்'},
  {value:'Pets', en:'Pets', ta:'செல்லப்பிராணிகள்'}, {value:'Technology', en:'Technology', ta:'தொழில்நுட்பம்'}
];

import { categoryKey } from '../../shared/public-value-dictionary';
import { profileMediaUrl } from '../../shared/profile-media';
export const normalized = categoryKey;
const stringValue = (v: unknown): string => {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return stringValue(obj['en']) || stringValue(obj['ta']);
  }
  return '';
};
const value = (raw: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) { const candidate = stringValue(raw[key]); if (candidate) return candidate; }
  return '';
};
const number = (x: unknown): number | null => {
  if (x === null || x === undefined || x === '') return null;
  const num = typeof x === 'number' ? x : Number(x);
  return Number.isFinite(num) ? num : null;
};
const stringArray = (x: unknown): string[] => {
  if (Array.isArray(x)) return x.map(stringValue).filter(Boolean);
  if (typeof x === 'string') return x.split(/[,;|]/g).map(s => s.trim()).filter(Boolean);
  return [];
};

/** Guest allowlist: names are public only when provided by the public API; never expose contact details, full DOB or precise address. */
export function toPublicProfile(rawInput: unknown, apiOrigin: string): PublicProfile | null {
  if (!rawInput || typeof rawInput !== 'object') return null;
  const p = rawInput as Record<string, unknown>;
  if (p['profile_status'] !== 'approved' || p['is_published'] !== true) return null;
  const code = value(p, 'profile_code');
  if (!code) return null;
  const image = profileMediaUrl(value(p, 'profile_image_url')); // public API image only
  const ageValue = number(p['age']);
  const get = (...keys: string[]) => value(p, ...keys);
  const h = number(p['height_cm']);
  return {
    code, name: get('full_name'), nameTa: get('full_name_ta'), age: ageValue !== null && ageValue >= 18 && ageValue <= 100 ? ageValue : null,
    gender: get('gender_text'), city: get('city_text', 'location_text'),
    district: get('district_text'), state: get('state_text'), country: get('country_text'),
    religion: get('religion_text'), caste: get('caste_text'),
    subCaste: get('sub_caste_text'), motherTongue: get('mother_tongue_text'),
    maritalStatus: get('marital_status_text'), education: get('education_text'),
    profession: get('occupation_text'), heightCm: h && h >= 90 && h <= 250 ? h : null,
    annualIncome: get('annual_income_text'), rasi: get('rasi_text'),
    nakshatra: get('nakshatra_text'), dosham: get('dosham_text'),
    diet: get('diet_text'), smoking: get('smoking_text'), drinking: get('drinking_text'),
    familyType: get('family_type_text'), familyValues: get('family_values_text'),
    hobbies: stringArray(p['hobbies_public']), image,
    updatedAt: get('updated_at'), latitude: number(p['latitude']), longitude: number(p['longitude'])
  };
}

export function makeOptions(profiles: readonly PublicProfile[]): FilterOptions {
  const items = {} as FilterOptions;
  for (const key of STRING_FILTERS) {
    items[key] = Array.from(new Set(profiles.map(profile => profile[key]).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
  }
  return items;
}

export function sharedHobbyCount(profile: PublicProfile, selected: readonly string[]): number {
  const own = new Set(profile.hobbies.map(normalized));
  return selected.filter(h => own.has(normalized(h))).length;
}

export function greatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const a = Math.sin((lat2-lat1)*r/2)**2 + Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin((lon2-lon1)*r/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export interface GeoPoint {lat: number; lng: number}
export function matchesProfile(p: PublicProfile, f: SearchFilters, search: string, geo: GeoPoint | null): boolean {
  const q = normalized(search);
  if (q && ![p.code,p.name,p.city,p.district,p.state,p.education,p.profession,p.religion,p.caste,p.rasi,p.nakshatra]
      .some(x => normalized(x).includes(q))) return false;
  for (const field of STRING_FILTERS) {
    if (f[field] && normalized(p[field]) !== normalized(f[field])) return false;
  }
  if (f.ageFrom !== null && (p.age === null || p.age < f.ageFrom)) return false;
  if (f.ageTo !== null && (p.age === null || p.age > f.ageTo)) return false;
  if (f.heightFrom !== null && (p.heightCm === null || p.heightCm < f.heightFrom)) return false;
  if (f.heightTo !== null && (p.heightCm === null || p.heightCm > f.heightTo)) return false;
  if (f.photoOnly && !p.image) return false;
  if (f.hobbies.length && f.sharedHobbiesOnly && !sharedHobbyCount(p,f.hobbies)) return false;
  if (f.nearbyKm !== null) {
    if (!geo || p.latitude === null || p.longitude === null ||
       greatCircleKm(geo.lat,geo.lng,p.latitude,p.longitude)>f.nearbyKm) return false;
  }
  return true;
}

export function countFilters(f: SearchFilters): number {
  return Object.entries(f).reduce((count, [key, val]) => {
    if (key === 'sharedHobbiesOnly' || key === 'hobbies') return count;
    return count + (val !== '' && val !== false && val !== null ? 1 : 0);
  }, 0) + (f.hobbies.length ? 1 : 0);
}
