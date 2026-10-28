# Astro Alliance — Dummy Plan UI Testing (October 2026)

This ZIP replaces the old payment-style page with a **local development-only dummy plan success flow**. It does not require Razorpay, accepts no card or UPI details, creates no payment or membership in MongoDB and **does not expose private details of real members**.

## Test in Windows PowerShell

1. Extract this ZIP to a **new folder**. Open the `astro-alliance-frontend` folder in VS Code.
2. Run `npm ci` (if dependencies are not already installed), then `npm start`.
3. Open `http://localhost:4200`, sign in if required, open Free Search and click `View Profile` on an approved member.
4. Click `View Plans`, choose a plan, and confirm you see **Test Plan Selected Successfully!** at `/plan-success` instead of `/payment`.
5. Click **View Full Profile Preview**. You will see the profile layout with permitted basic data and labeled sample protected sections.
6. If a plan is selected without a member first, the button is **Choose a Profile to Preview**, which opens Free Search.
7. Directly visiting the old `/payment` URL redirects to Plans.

## What changed

- `src/app/plans/plans.ts` — Choose Plan goes directly to dummy success and blocks double clicks. It does not call Razorpay.
- `src/app/app.routes.ts` — introduces `/plan-success` in local development, retires `/payment`.
- `src/app/plan-success/*` — new responsive Tamil/English success component.
- `src/app/payment-page/*` — removed obsolete payment-style page.

## Environment and safety

- `npm start` uses the development environment where the UI-only dummy flow is enabled.
- `npm run build` creates a **production** build where dummy success is intentionally disabled. It must not be used as payment verification.
- The site continues to use the existing local backend `http://localhost:5000/api` for normal data; the dummy success itself is client-only.
- Plan cards load from the existing `/api/masters/plans` endpoint. If MongoDB is offline, actual plans may not appear: fix the backend connection rather than inventing real pricing.
- No changes were made to the admin UI, original logo, database, payment services or backend.
- Razorpay integration and real membership activation must be implemented and tested separately before launch.

## Verification

The following were tested: TypeScript source parsing and relative imports; `npm run test:search`; `npm run test:biodata`; `npm run test:approval-flow`; and a route-flow/static safety check. Full Angular production compilation was not possible in the editing environment because `npm ci --offline` failed due to missing cached package `zod-to-json-schema`. Please run `npm ci && npm run build` on your computer.
