/** Consistent UI labels for existing categorical values; never write translations to MongoDB. */
export const DISPLAY_TAMIL: Readonly<Record<string, string>> = {
  'male':'ஆண்', 'female':'பெண்', 'man':'ஆண்', 'woman':'பெண்',
  'bride':'மணமகள்', 'groom':'மணமகன்',
  'first marriage':'முதல் திருமணம்', 'never married':'திருமணமாகாதவர்',
  'second marriage':'இரண்டாம் திருமணம்', 'divorced':'விவாகரத்தானவர்',
  'widowed':'துணையை இழந்தவர்', 'hindu':'இந்து', 'christian':'கிறிஸ்தவர்',
  'muslim':'இஸ்லாமியர்', 'islam':'இஸ்லாம்', 'brahmin':'பிராமணர்',
  'pillaimar':'பிள்ளைமார்', 'viswakarma':'விஸ்வகர்மா', 'yadava':'யாதவர்',
  'naidu':'நாயுடு', 'tamil':'தமிழ்', 'telugu':'தெலுங்கு',
  'thanjavur':'தஞ்சாவூர்', 'trichy':'திருச்சி', 'tiruchirappalli':'திருச்சிராப்பள்ளி',
  'madurai':'மதுரை', 'chennai':'சென்னை', 'salem':'சேலம்',
  'coimbatore':'கோயம்புத்தூர்', 'tamilnadu':'தமிழ்நாடு', 'tamil nadu':'தமிழ்நாடு',
  'india':'இந்தியா', 'karthigai':'கார்த்திகை', 'uthradam':'உத்திராடம்',
  'hastham':'ஹஸ்தம்', 'ashwini':'அஸ்வினி', 'bharani':'பரணி',
  'rohini':'ரோகிணி', 'revathi':'ரேவதி', 'poosam':'பூசம்',
  'civil engineer':'சிவில் பொறியாளர்', 'software engineer':'மென்பொருள் பொறியாளர்',
  'business owner':'தொழில் உரிமையாளர்', 'teacher':'ஆசிரியர்',
  'private':'தனியார்', 'pvt':'தனியார்', 'government':'அரசு',
  'self employed':'சுயதொழில்', 'unemployed':'வேலை இல்லை',
  'no':'இல்லை', 'none':'இல்லை', 'yes':'ஆம்', 'nil':'இல்லை',
  'b.e.':'பி.இ.', 'be':'பி.இ.', 'bca':'பி.சி.ஏ.', 'b.com':'பி.காம்.',
  'm.sc':'எம்.எஸ்சி.', 'msc':'எம்.எஸ்சி.', 'm.a.':'எம்.ஏ.', 'ma':'எம்.ஏ.',
  'music':'இசை', 'travel':'பயணம்', 'reading':'வாசிப்பு',
  'cooking':'சமையல்', 'sports':'விளையாட்டு', 'movies':'திரைப்படங்கள்'
};
const ENGLISH_CASE: Record<string, string> = {
  male:'Male', female:'Female', 'first marriage':'First Marriage',
  'second marriage':'Second Marriage', 'never married':'Never Married',
  hindu:'Hindu', christian:'Christian', muslim:'Muslim', brahmin:'Brahmin',
  pillaimar:'Pillaimar', hastham:'Hastham', uthradam:'Uthradam',
  'tamil nadu':'Tamil Nadu', tamilnadu:'Tamil Nadu',
  be:'BE', 'b.e.':'BE', 'b.com':'B.Com', bca:'BCA', msc:'MSc'
};
// First known spelling wins; both languages may exist in old DB rows.
const reverse = new Map<string, string>();
for (const [key, tamil] of Object.entries(DISPLAY_TAMIL)) {
  if (!reverse.has(tamil)) reverse.set(tamil, key);
}
export function categoryKey(value: unknown): string {
  const raw = String(value ?? '').trim().toLocaleLowerCase('en-IN');
  return reverse.get(raw) ?? raw;
}
export function publicDisplayValue(value: unknown, lang: 'en'|'ta'): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return publicDisplayValue(obj[lang] ?? obj['en'] ?? obj['ta'], lang);
  }
  const original = String(value).trim();
  const key = categoryKey(original);
  if (lang === 'ta') return DISPLAY_TAMIL[key] ?? original;
  return reverse.has(original) ? (ENGLISH_CASE[key] ?? key.replace(/\b\w/g, c => c.toUpperCase())) : original;
}
