# Astro Alliance — Local Plan Selection / Full Profile UI Test

This frontend includes a **UI-only test mode**, not a payment feature. It is intentionally enabled in `src/environments/environment.ts` and disabled in `src/environments/environment.prod.ts`.

## What happens locally (`npm start`)

1. Log in with the *existing* member login flow and open **Plans**.
2. Choose an active plan. The plan-selection page shows **Test Plan Selected Successfully — No Payment Made** (EN/TA).
3. If you arrived from a particular profile, choose **View Full Profile Layout**. Otherwise choose **Choose a Profile to View**, select a person through Free Search, open the free basic preview, then select **Test Full Profile Layout (Demo Only)**.
4. The full-profile component renders with real *public-only* fields from the approved profile where available and clearly marked synthetic placeholders for private fields. This is for checking layout, translation and mobile responsiveness only.

## Security and payment

- Does not call Razorpay, collect card details, charge money or save a payment.
- Does not create/activate a membership and does not change any MongoDB records.
- Does not fetch another member's premium biodata in demo mode. Contacts, additional photos and horoscope files remain unavailable.
- Interest, shortlist, contact unlock and PDF download are disabled in the demo view.
- Production builds replace `environment.ts` with `environment.prod.ts` and disable the preview route. The normal full-profile endpoint is still protected by backend authorization.
- If you need to verify real paid entitlement behavior with real private data, use a **staging** backend and an admin-approved test entitlement; do not fake payments in production.

## API settings

- Local dev: `http://localhost:5000/api`
- Production: `https://astroalliance-backend.onrender.com/api`

If the backend is unavailable, plan selection falls back to clearly labeled **unverified demo plan** information from the current local page. The full-profile demo then shows placeholders rather than any private member fields.

## Verification required on Windows

```powershell
npm ci
npm run build
npm start
```

Then check at 320px, 360px, 390px, 430px and desktop widths. The full Angular compilation could not be run in the generation environment because its offline npm cache lacks a required dependency.
