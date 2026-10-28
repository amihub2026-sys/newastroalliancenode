# Astro Alliance — Advanced Free Search (English + Tamil)

## Included frontend source

- `src/app/free-search/free-search.ts|html|scss` — visitor results, sorting, pagination, responsive sidebar and backend load/error states
- `src/app/free-search/search-filters/search-filters.ts|html|scss` — expandable sidebar, bilingual labels and validated, controlled filter values
- `src/app/free-search/models/search.models.ts` — explicitly allowlisted public profile model, normalization, matching, options and hobby comparison
- `tools/test-public-search.cjs` — source and pure behavior checks; run `npm run test:search`

Route: `/free-search`. Homepage and admin source files are preserved.

## Working with the current Node.js backend

The existing `GET /api/profile` returns **approved and published** profiles with profile code, age, gender, marital status, religion, caste, state, city, education, occupation, Rasi, Nakshatra, photograph URL and update timestamp. These filters are active now: Profile ID/keyword, gender, age range, marital status, religion, caste, state, city, education, profession, Rasi, Nakshatra, profile-photo only and sort by date or age. Nearby radius is offered once location permission is granted and the backend returns profile coordinates. Unlike the profile count, it excludes profiles with missing coordinates instead of assuming a match.

The frontend shows disabled selectors instead of fake results when the existing public API lacks data for: subcaste, mother tongue, height, country, income, dosham, family type/values, diet, smoking, drinking and hobbies. The Hobby Match section is present but disabled until the backend returns a consented, public `hobbies_public` array. When returned, selecting hobbies filters to profiles sharing at least one chosen interest, and the card displays the number shared; this is **shared-interest matching, not a compatibility prediction**.

### Optional public API fields for future backend work

After adding these to the profile schema and Biodata registration, return ONLY data authorized for public viewing:

```json
{
  "height_cm": 165,
  "sub_caste_text": "...",
  "mother_tongue_text": "Tamil",
  "country_text": "India",
  "annual_income_text": "...",
  "dosham_text": "...",
  "family_type_text": "...",
  "family_values_text": "...",
  "diet_text": "...",
  "smoking_text": "...",
  "drinking_text": "...",
  "hobbies_public": ["Travel", "Music", "Reading"]
}
```

Back-end changes must enforce member/visitor permissions, validate consent for publishing these optional fields, normalize enum codes and index frequently searched values. The user profile wizard must also collect optional hobbies and lifestyle information, and the backend must persist them before Hobby Match can be fully live. Do not rely on Angular to hide private data returned by an API.

## Production blockers outside this frontend change

1. **Guest privacy**: the original backend's `GET /api/profile/:id` can disclose full private data; protect the endpoint server-side, enforce admin approval and membership/contact permissions, and never return phone, email, precise address, full DOB or private documents to guests.
2. **Approval-first login**: the original backend issues tokens before approval. Restrict token issuance server-side; frontend checks are not sufficient.
3. **Razorpay**: the frontend's payment endpoints do not exist in the original backend; integrate and verify server-side payments before launch.
4. **Build + browser validation**: run `npm ci`, `npm run test:search`, `npm run test:approval-flow`, `npm run test:biodata`, `npm run build`, and cross-device tests on Windows with the actual API. Backend database access and profile data required.

No original admin source files were changed by this search update. This is a source-checked **review build**, not a security-certified production release.
