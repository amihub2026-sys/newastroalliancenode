# Astro Alliance Matrimony — Member Frontend Review (10 October 2026)

This is **the complete Angular frontend source** built from `AstroAlliance_Basic_Profile_Access_Fixed_20261010`, which includes the responsive header fixes from the earlier user version. The existing original logo and 122 admin interface source files remain unchanged.

## What changed

1. Registration/Biodata: included the eight-step mobile spelling, DOB, review-column, Tamil and preview corrections from the prior combined patch. A review now includes horoscope, partner preferences and submitted photos where present.
2. Profiles: member names are prominent and IDs secondary, while the cards show available age, gender, marital status, religion, community, city, star, education and occupation. Main portrait uses `object-fit: contain` to avoid cropping hairlines or faces. Tap the main public photo to see it uncropped in a lightbox. My Biodata and authorized premium views show their gallery photos in the shared lightbox. **Additional photos are never exposed in public responses.**
3. Basic View Profile is free. The page calls the specific approved/public endpoint with a 12-second timeout and retry. For older backends that return `Endpoint not found`, it falls back to the existing public approved list endpoint. Private contact, family and gallery stay locked.
4. Tamil/English: restored the missing standalone display translation pipe. Known values are translated for display, without changing saved MongoDB fields. Unmapped names, addresses and qualifications are preserved as typed rather than guessed.
5. Account menu: clicking the avatar opens the account menu; the frontend checks the current `GET /api/profile/flow-status` stage, with a short in-flight/cache deduplication. Pending status shows Approval Status, approved/published shows Dashboard. Backend approval remains authoritative.
6. Payments: **Razorpay is NOT enabled** because you do not have a configured account. The fake card/CVV/UPI form is removed. Plans are read from the real `/api/masters/plans` endpoint. The selected plan page verifies its name/price against the real `/api/masters/plans` endpoint, is informational and NEVER activates a plan. The dashboard uses the authenticated `/api/subscription/user/:userId` endpoint to show an active plan only when backend confirmed. The official Razorpay service code remains behind `paymentEnabled: false`; do not enable until you have verified checkout, server orders, signatures and webhooks.
7. Responsive CSS: user-facing menu/photo/preview improvements and deduplicated five old SCSS declarations. `npm run styles:check` reports zero detected overrides by its checker.
8. Prevented multiple clicks on the Plan selection button and reused the app's existing navigation guard.

## API configuration (not placeholders)

- During `npm start`: `http://localhost:5000/api` in `src/environments/environment.ts`
- During `npm run build`: `https://astroalliance-backend.onrender.com/api` in `src/environments/environment.prod.ts`

The Render URL is taken from your existing backend deployment configuration. **Availability, MongoDB credentials, server CORS, stored photo URLs, payment merchant configuration, and network speed cannot be verified by static source checks.** Your previously reported MongoDB TLS connection issue must be fixed for the live profile data to load.

## Windows instructions

1. Back up your currently running `astro-alliance-frontend` folder. Extract the new ZIP into a **new folder**, and open its `astro-alliance-frontend` directory in VS Code. Do not copy a new zip over existing `node_modules` or mix old bundles.
2. Run `npm ci`, then `npm run build`, then `npm start`. Test the basic profile at `http://localhost:4200/free-profile/AAM-108` only if that member is approved/published in the database.
3. For local development, ensure `astro-alliance-backend` is started on port 5000 and MongoDB Atlas successfully connects. If using Render from localhost, update **only your local** `environment.ts` to the deployed API and make sure backend CORS permits `http://localhost:4200`. Do not put secrets in Angular.
4. The optional backend patch adds `GET /api/profile/public/:code`, a query that projects only approved/published **basic public fields**. Back up backend source, compare both patch files, apply them and restart only after verifying compatibility on staging. No database migration is required for that endpoint. Even without this patch the frontend falls back to existing `/api/profile` for servers that respond with a missing-route 404.
5. Use browser DevTools Network and Console to check any 401, 403, 404, timeout, CORS or image errors. If storage URLs are gone, Angular cannot recover an original uploaded photograph.

## Verified in this environment

- `npm run test:biodata` — PASS
- `npm run test:biodata-images` — PASS
- `npm run test:approval-flow` — PASS
- `npm run test:search` — PASS
- `npm run styles:check` — PASS (supported scanner scope)
- TypeScript parser — 164 source files, zero syntax errors
- All relative imports resolved in source scan
- Original logo unchanged, 122 admin source files unchanged
- JavaScript syntax for backend public-profile patch PASS; public-profile contract mock tests PASS

## NOT verified / remaining launch blockers

- Real `npm run build`: `npm ci --offline` failed with `ENOTCACHED` for an uncached dependency. Must run Angular build on your Windows machine.
- Browser end-to-end mobile/desktop testing, actual upload/display of all real photos, production MongoDB connectivity, payment webhook/merchant verification, existing-account login migration, deployment and CORS.
- This ZIP is **not a verified 100% production release**. Do not accept real payments or migrate old member passwords until those checks pass. Pricing and membership entitlement policy must be confirmed with the business owner.
