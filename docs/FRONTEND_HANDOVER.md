# Frontend implementation notes — October 2026

## Improved in this frontend-only package

- Replaced the heavy six-slide homepage with a focused, responsive home page using existing owned image assets, real links, simple calls to action, Tamil and English copy, and no invented member counts or testimonials.
- Replaced the 290-line admin menu template with data-driven module groups. Restored links to profile import, payments and admin accounts. Admin account link is displayed only for the owner; the server remains the actual gatekeeper.
- Rebuilt admin bulk profile import as a two-stage workflow. Server preview is required before commit; erroneous rows prevent commit; existing mobile numbers are skipped; a basic downloadable JSON example is available.
- Removed placeholder social network links from the footer; retained the supplied WhatsApp contact link.
- Fixed stale logout keys and checked JWT expiry in customer/admin guards (client-only convenience, not an authentication guarantee).
- Guarded the export route that previously opened outside the admin route.
- Updated admin login error handling so users see inline feedback instead of browser alerts.
- Switched the Angular production API setting away from the existing live backend to a staging placeholder. This must be set to your own API before deployment.

## Not finished; do not claim production-ready

1. Proper OTP/mobile verification and account recovery, requiring backend changes and provider integration.
2. Replace browser-stored bearer tokens with an appropriately protected session/cookie model; requires matching backend changes and CSRF policy.
3. Comprehensive route and component unit tests plus verified `ng build` using installed dependencies.
4. End-to-end flows across registration, biodata, profile search, privacy, interest, plan, payment and admin approval.
5. Keyboard and screen-reader audit of all legacy feature screens; newly updated screens received accessibility improvements, but this is not an app-wide audit.
6. A safe SCSS cleanup removed 1,046 superseded declarations, but 1,437 legacy `!important` rules remain. See `docs/CSS_REFACTOR_REPORT.md`; the remaining page layouts need regression-tested refactoring.
7. Actual data migration and media links require source database and object-storage access.
8. Configure production API, HTTPS/CORS, DNS, SEO, analytics/privacy disclosures and monitoring.

## JSON import example

The sample file downloads a single profile object. The actual backend performs additional Mongoose schema validation. Complete all required fields to match your profile creation form; validate via Preview before importing. Uploaded JSON must have the shape `[ { "basic": {...}, ... } ]` with nested field groups. The original `/admin/profile-import` Node route accepts `POST {profiles: Array, commit: boolean}` and returns `{data: Array<{row,status,message}>}`.

## Staging acceptance checks

- npm dependencies installed with `npm ci`; production build completes.
- Test at mobile widths 320, 375, 430px and desktop 768, 1280px; mobile admin menu and modal overlays work.
- Customer and admin can sign in/out independently; unauthorized calls receive 401/403.
- One real new profile passes preview and import, can be approved, searched and viewed subject to privacy rules.
- Existing duplicate mobile number is skipped; invalid JSON and invalid DOB show understandable errors.
- Razorpay test-mode: success, failure, cancel, delayed capture, duplicate callback, entitlements and admin ledger reconcile.
- Media upload/preview, Tamil language switch, report download and horoscope pages work end-to-end.
