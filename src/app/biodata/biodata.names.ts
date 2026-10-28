/**
 * Offline transliteration suggestions; never translate the meaning of names.
 * Spellings are not guaranteed: the user can correct the suggested script.
 * This file makes no request to an external third-party name service.
 */
const knownTamilToEnglish: Record<string, string> = {
  'தாமரை': 'Thamarai', 'செல்வி': 'Selvi', 'தாமரை செல்வி': 'Thamarai Selvi',
  'அருண்': 'Arun', 'குமார்': 'Kumar', 'அருண் குமார்': 'Arun Kumar',
  'லட்சுமி': 'Lakshmi', 'லக்ஷ்மி': 'Lakshmi', 'மீனா': 'Meena',
  'சரவணன்': 'Saravanan', 'பிரியா': 'Priya', 'கார்த்திக்': 'Karthik',
  'முருகன்': 'Murugan', 'ராஜா': 'Raja', 'வெண்ணிலா': 'Vennila',
  'தேவி': 'Devi', 'செந்தில்': 'Senthil', 'மாலதி': 'Malathi'
};
const knownEnglishToTamil: Record<string, string> = {
  'thamarai': 'தாமரை', 'selvi': 'செல்வி', 'thamarai selvi': 'தாமரை செல்வி',
  'arun': 'அருண்', 'kumar': 'குமார்', 'arun kumar': 'அருண் குமார்',
  'lakshmi': 'லட்சுமி', 'meena': 'மீனா', 'saravanan': 'சரவணன்',
  'priya': 'பிரியா', 'karthik': 'கார்த்திக்', 'murugan': 'முருகன்',
  'raja': 'ராஜா', 'vennila': 'வெண்ணிலா', 'devi': 'தேவி',
  'senthil': 'செந்தில்', 'malathi': 'மாலதி',
  'abisha': 'அபிஷா', 'abhisha': 'அபிஷா', 'abisaha': 'அபிஷா'
};
const independentVowels: Record<string, string> = {
  'அ':'a','ஆ':'aa','இ':'i','ஈ':'ee','உ':'u','ஊ':'oo',
  'எ':'e','ஏ':'e','ஐ':'ai','ஒ':'o','ஓ':'o','ஔ':'au'
};
const consonants: Record<string, string> = {
  'க':'k','ங':'ng','ச':'s','ஞ':'nj','ட':'t','ண':'n','த':'th',
  'ந':'n','ப':'p','ம':'m','ய':'y','ர':'r','ல':'l','வ':'v',
  'ழ':'zh','ள':'l','ற':'r','ன':'n','ஜ':'j','ஷ':'sh',
  'ஸ':'s','ஹ':'h','ஶ':'sh'
};
const vowels: Record<string, string> = {
  'ா':'aa','ி':'i','ீ':'ee','ு':'u','ூ':'oo',
  'ெ':'e','ே':'e','ை':'ai','ொ':'o','ோ':'o','ௌ':'au','்':''
};
export function hasTamilScript(input: string): boolean { return /[\u0B80-\u0BFF]/u.test(input); }
export function tamilNameToEnglish(input: string): string {
  return input.trim().split(/(\s+)/u).map(part => {
    if (!part.trim()) return part;
    if (knownTamilToEnglish[part]) return knownTamilToEnglish[part];
    const chars = Array.from(part);
    let result = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (independentVowels[ch]) { result += independentVowels[ch]; continue; }
      if (consonants[ch]) {
        const sign = chars[i+1];
        if (sign && Object.prototype.hasOwnProperty.call(vowels, sign)) {
          result += consonants[ch] + vowels[sign]; i++;
        } else result += consonants[ch] + 'a';
      } else result += ch;
    }
    return result.charAt(0).toUpperCase() + result.slice(1);
  }).join('');
}

// Conservative dictionary suggestions for English names. Other spellings are
// intentionally kept as entered instead of being converted inaccurately.
export function englishNameToTamil(input: string): string {
  const clean = input.trim();
  if (!clean) return '';
  if (knownEnglishToTamil[clean.toLocaleLowerCase('en-IN')]) {
    return knownEnglishToTamil[clean.toLocaleLowerCase('en-IN')];
  }
  const parts = clean.split(/\s+/u);
  // An unknown spelling has no verified Tamil equivalent. Show the correction
  // field instead of silently saving the English original as Tamil.
  if (parts.some(part => !knownEnglishToTamil[part.toLocaleLowerCase('en-IN')])) return '';
  return parts.map(part => knownEnglishToTamil[part.toLocaleLowerCase('en-IN')]).join(' ');
}
export function suggestBilingualName(input: string): { en: string; ta: string; needsReview: boolean } {
  const clean = input.trim().replace(/\s+/gu,' ');
  if (!clean) return {en:'',ta:'',needsReview:false};
  if (hasTamilScript(clean)) {
    return { en:tamilNameToEnglish(clean), ta:clean, needsReview: true };
  }
  const ta = englishNameToTamil(clean);
  return { en:clean, ta, needsReview: ta === clean || /[A-Za-z]/u.test(ta) };
}
