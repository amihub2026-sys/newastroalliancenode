# Astro Alliance user frontend UI delivery

**Original logo:** `src/assets/malogo.png` unchanged. **Admin folder:** `src/app/admin/` unchanged.

## Implemented in this update
- Free Search uses professional premium black profile cards that show existing public attributes and a View Profile action.
- Public View Profile route `/free-profile/:code` shows basic details and a clearly labeled membership lock.
- Homepage retains its existing sections and adds a dark approved-profile discovery section using API data; no fake member records.
- Approved member dashboard `/dashboard`: bilingual Voice Guide, New Members, Nearby Matches, deterministic daily selection of up to 5 suitable opposite-gender profiles, links to the existing activity screens.
- Gender-based local avatar image in header and fallback avatars for profile cards.
- Eight-step Biodata now has prerecorded Tamil/English audio buttons.
- Updated responsive styles at widths 350, 520, 720, 900, 1120px; adjust after browser testing.

## Important backend work still required
1. Existing `GET /api/profile` may return more than public fields; the backend MUST return only approved published safe public fields. Angular projection does not secure API responses. Add dedicated `/api/public/profiles` and `/api/public/profiles/:code` as appropriate.
2. Enforce member approval, profile visibility, paid entitlements, gender restrictions, likes/interests/view counters SERVER SIDE.
3. Login still uses mobile+DOB in existing backend and requires stronger secure non-OTP authentication.
4. `GET /api/profile` must provide photo URLs/age/gender/city/education/occupation and a publication status. New hobbies/height etc require backend schema + API updates.
5. Current dashboard daily selection is deterministic and best-effort on available public data. For true cross-device daily recommendations and exclusions store recommendation history server side.
6. Razorpay order creation and verification endpoints still need implementing / integration testing. Do not treat UI as payment verification.
7. Marriage status reporting and personal user activity counters are not newly connected here; existing admin and activity screens remain.

## Running
````
npm ci
npm run test:search
npm run test:biodata
npm run build
npm start
````

## Verification limits
- npm ci may fail in this environment due to npm CLI exit-handler errors.
- Angular full compilation, browser tests, live-backend and payments cannot be called verified unless rerun successfully.
- Voice-guide MP3s are offline synthesized placeholders with no per-play API charge; they should be replaced with natural reviewed Tamil/English recordings for the final release.
