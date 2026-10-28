# Astro Alliance — frontend-only repair handover (12 October 2026)

## Scope and preservation

This is an update to the attached **existing Angular frontend**, not a new website. The original app, router, logo, assets and all files under `src/app/admin/` are preserved. **No backend source files or MongoDB data are included or changed.** Original mobile number + date-of-birth login, the existing eight-step Biodata and admin UI have not been replaced. Razorpay / OTP / password fields were not added.

## Actual files changed

- `src/app/home/home-discovery/home-discovery.{ts,html,scss}` — up to eight real approved-and-published entries from the existing `GET /api/profile` public API, timeout, skeleton/loading/error/empty handling, retry and Show More → `/free-search`.
- `src/app/free-search/free-search.{ts,html}` — filter/keyword/sort/result-count persistence in a validated `s` URL query parameter, search debounce, backend timeout, and scroll-position restoration on return; public cards receive their return state.
- `src/app/free-search/search-filters/search-filters.{ts,html}` — state→district→city selections (only where `district_text` is actually exposed), bilingual gender display.
- `src/app/free-search/models/search.models.ts` — optional district public field, canonical comparison across Tamil/English historical category values, improved public keyword search, safe shared image resolution. Still only maps an explicit list of public fields.
- `src/app/shared/public-value-dictionary.ts` **(new)** and `src/app/shared/public-profile-value.pipe.ts` — centralized, reversible English/Tamil display mapping without altering stored records.
- `src/app/shared/public-card/{public-card.ts,public-card.html}` — guest/member route link includes search state and source route, captures scroll before navigating, neutral missing-name message instead of giant profile IDs.
- `src/app/public-profile/{public-profile.ts,public-profile.html}` — return to preserved filters and the right guest/member search route, normal 404 fallback to the known-safe `/api/profile` list when the unverified public single-profile route is unavailable, clearer missing-name and district display. The page never calls a raw full-profile endpoint as a guest.
- `src/app/plans/{plans.ts,plans.html,plans.scss}` — selecting a plan shows **selected, not activated**, and offers the free profile. It does not call Razorpay or a non-existent `/subscription/complimentary-activate` API.
- `src/app/my-biodata/my-biodata.ts` — reuse centralized categorical translations while leaving personal free-text as entered.
- `src/app/profile-view/{profile-view.ts,profile-view.html}` — localized categorical values without rewriting personal names; marriage-status logic handles translated stored categories.
- `tools/test-public-search.cjs` — adapt isolated test location for the new shared pure modules.

## Backend/API contract and necessary limits

The attached project documentation identifies `GET /api/profile` as the existing public endpoint listing approved/published profiles. The frontend independently filters out records unless `profile_status === 'approved'` and `is_published === true`, then projects them to an explicit safe view model. **A browser-side filter is not a security boundary.** The Node backend must enforce approval/publication, access control and privacy before production launch. The existing docs warn that a raw full-profile endpoint can disclose private information, and early token issuance may let pending accounts reach protected APIs. Backend fixes require separate authorization and were **not** made here.

- Public names and images appear only **if the existing public API actually provides** `full_name` / `full_name_ta` and `profile_image_url` with publication consent. If the API omits a name, the UI says `Name not available` rather than inventing a person.
- Optional district requires `district_text`; unsupported search fields stay disabled unless the API actually provides values. Premium data/extra gallery access requires backend-confirmed permissions. Never grant real premium access through local storage, browser toggles or a fake success screen.
- A public single-profile API `/api/profile/public/:code` is **not independently verified**. This UI first tries it and falls back on 404 to the allowlisted public list. We intentionally do **not** call the documented raw full-detail API for guests.
- Existing admin-assigned membership remains the supported interim path if the backend has no authorized self-activation API. Selecting a plan in this frontend does not create a backend entitlement.
- The public API, MongoDB records, actual runtime subscriptions, photos and browser layouts could not be integration-tested here, since no active backend access or live test account was provided in this upload.

## Install / run on Windows

```powershell
cd astro-alliance-frontend
npm ci
npm start
```

Configure `src/environments/environment.ts` (`http://localhost:5000/api`) and `environment.prod.ts` for the correct existing backend. Run **existing** Node backend on port 5000 separately. Do not use a new backend.

```powershell
npm run test:search
npm run test:approval-flow
npm run test:biodata
npm run test:biodata-images
npm run build
```

## Verification carried out in this environment

**Passed:** pure TypeScript public-search/filter test; static approval-flow test; Biodata wizard and images tests; navigation tests; source/route tests; TypeScript parser checks of all modified `.ts` files. Admin file contents match the uploaded original byte-for-byte.

**Not completed:** `npm ci` and Angular production build. The sandbox could not resolve `registry.npmjs.org`, and its npm cache was incomplete. Therefore Angular type/template compilation and live desktop/mobile browser tests **are not certified**. You must execute `npm ci && npm run build` and the live API/device checklist locally, fix anything they reveal, and verify backend security before deployment. This is a tested source-level **review package**, not a claim of 100% production readiness.

## Mobile/browser acceptance checklist

- With a working public backend: Home → eight or fewer real profiles → Show More → Free Search, logged out.
- Free Search: choose a gender, city, religion, range, sort, type a keyword; open member → Back to Search → filters, keyword, loaded batch and scroll position survive.
- Confirm EN/தமிழ் display in profile cards, search selectors, basic profile, My Biodata and full view.
- Confirm private data, unapproved/hidden members and galleries are not available from direct **network API calls**, not just hidden on screen.
- Test 320, 360, 375, 390, 430, 768, 1024 and desktop widths; run actual uploads/gallery tests and check original photos.
- Test registration → Biodata → admin approval → mobile+DOB login with the existing backend, without changing the admin interface.
- Test plan selection: no `complimentary-activate`, no checkout, no browser-side premium unlock.
