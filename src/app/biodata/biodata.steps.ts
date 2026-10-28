/** User-only navigation. Admin layout and workflow are intentionally unchanged. */
export type BiodataLanguage = 'en' | 'ta';
export interface BiodataStep {
  readonly id: string;
  readonly en: string;
  readonly ta: string;
  readonly helpEn: string;
  readonly helpTa: string;
}
export const BIODATA_STEPS: readonly BiodataStep[] = [
  { id: 'personal', en: 'Personal Details', ta: 'தனிப்பட்ட விவரங்கள்', helpEn: 'Start with the bride or groom’s basic details', helpTa: 'மணமகன் அல்லது மணமகளின் அடிப்படை விவரங்களை உள்ளிடவும்' },
  { id: 'family', en: 'Family Details', ta: 'குடும்ப விவரங்கள்', helpEn: 'Tell us about your family', helpTa: 'உங்கள் குடும்பத்தைப் பற்றிய விவரங்கள்' },
  { id: 'education', en: 'Education & Career', ta: 'கல்வி மற்றும் தொழில்', helpEn: 'Education and work information', helpTa: 'கல்வி மற்றும் பணி விவரங்கள்' },
  { id: 'address', en: 'Location', ta: 'இருப்பிட விவரங்கள்', helpEn: 'Where do you live?', helpTa: 'நீங்கள் வசிக்கும் இடம் எது?' },
  { id: 'horoscope', en: 'Horoscope', ta: 'ஜாதக விவரங்கள்', helpEn: 'Birth details and horoscope', helpTa: 'பிறப்பு மற்றும் ஜாதக விவரங்கள்' },
  { id: 'preferences', en: 'Partner Preferences', ta: 'வாழ்க்கைத்துணை எதிர்பார்ப்புகள்', helpEn: 'Tell us about your expectations', helpTa: 'உங்கள் எதிர்பார்ப்புகளைப் பகிரவும்' },
  { id: 'photos', en: 'Photos & Video', ta: 'புகைப்படங்கள் மற்றும் காணொளி', helpEn: 'Add a clear photograph', helpTa: 'தெளிவான புகைப்படத்தைச் சேர்க்கவும்' },
  { id: 'review', en: 'Review & Submit', ta: 'சரிபார்த்து சமர்ப்பிக்கவும்', helpEn: 'Check your details before submitting', helpTa: 'சமர்ப்பிக்கும் முன் விவரங்களைச் சரிபார்க்கவும்' }
] as const;

export interface StepField { key: string; labelEn: string; labelTa: string; value: unknown }
export function firstMissingStepField(fields: readonly StepField[]): StepField | undefined {
  return fields.find(field => !String(field.value ?? '').trim());
}
