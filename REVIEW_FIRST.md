# Astro Alliance — Original Home + Public Free Search + Approval-first Login

## What changed
- Original six-slide homepage restored from uploaded original source. Only one new sample wedding-couples gallery was added; no invented real success stories.
- Visitors: `/free-search` shows basic fields of approved, published profiles using GET `/api/profile`, no login.
- Register: user data is sent to original POST `/api/auth/register` route; returned JWT is intentionally not saved. User is directed to `/registration-submitted`.
- Login: original POST `/api/auth/login`; a browser session is saved ONLY if server response indicates `profile.profileStatus === 'approved'` and `profile.isPublished === true`.
- Approved members: can open `/profiles` and `/profile-view`; original header and footer now link public visitors to `/free-search`.
- Admin: no files changed in `src/app/admin/` (122 files).
- User Biodata: eight-step wizard with individually separated component files, eight couples' backgrounds, English/Tamil support retained.
- Double registration-click is prevented while a request is in progress.

## Run on Windows
```
cd astro-alliance-frontend
npm ci
npm run test:approval-flow
npm run test:biodata
npm run test:biodata-images
npm run build
npm start
```
Frontend base URL: `http://localhost:4200`; backend dev API: `http://localhost:5000/api`.

## Known limitations — do not launch this as production yet
- `npm run build` was **not verified here** because `npm ci` failed to install Angular dependencies; `ng` was unavailable. Run it locally and fix any compiler/build errors.
- This is FRONTEND gating only. The original backend still issues a JWT to a new, unapproved user at register and to unapproved users at login; it also has a publicly accessible full profile view API. Users can bypass browser checks and obtain private profile information. Enforce approval **on the backend** and redact private fields before launch.
- Mobile number + date of birth is weak authentication; a secure password-based login without OTP is needed before production.
- Paid contact/interest permissions and Razorpay must be enforced with backend checks; no paid production claims.
- Real wedding-photo testimonials should replace labeled sample images only with both subjects' consent.
- Live MongoDB-connected regression/browser tests remain mandatory.

See `docs/EXISTING_BACKEND_COMPATIBILITY.md` for API details.
