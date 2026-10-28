# Astro Alliance — Biodata user wizard update

## Scope
- `/biodata` shows the eight-step customer form for ordinary users.
- Admin create and edit (`adminCreate=true` or edit ID) retain the previous extended accordion layout, and existing admin templates and routing were not modified.
- Original database field names and API submission payload shape are preserved.
- Existing sections were conditionally shown one by one; the large legacy parent component is **not yet fully decomposed** into individual Angular form components. Navigation configuration and name transliteration now have separate modules, but more refactoring is necessary.

## Languages and name handling
- Enter the name once in either Tamil or English. Suggested spelling for the opposite language appears underneath, and can be corrected optionally.
- Common Tamil name spellings, including `தாமரை செல்வி -> Thamarai Selvi`, are provided offline without sending names to an external translation API. Unknown English-script names are left unchanged when a credible Tamil transliteration is unavailable; user can correct them. These suggestions are **not guaranteed to be linguistically correct**.
- The paired `fullName.en` and `fullName.ta` fields remain in the original API payload.
- Switching the form language changes interface labels without deliberately resetting the current values.
- Some other free-text fields in the legacy form still use separate language-specific values. Those require further review before claiming complete bilingual consistency.

## Validation and form safety
- Next validates key required fields for that step; Back allows correction.
- Only the review step shows submit for customers. Duplicate clicks while a save is running are ignored in the frontend.
- The form does **not** claim to have secure autosave or backend idempotency; those require backend changes.
- All admin routes and UI remain as they were.

## Required production verification
- Run `npm ci && npm run build` in a network-enabled environment with the correct Node and Angular toolchain.
- Test user registration/edit and admin create/edit against staging Node/MongoDB API, English/Tamil switch with populated form, browser refresh/back, mobile views, photo upload, backend double-submit protection, permission checks, and profile previews.
- Verify the public website and all admin screens visually; no production guarantee is implied by source checks.
