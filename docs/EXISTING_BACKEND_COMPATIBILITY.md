# Restored homepage & existing backend contract

## Requested behavior

1. Visitors may open `/free-search` without registration and see only basic UI fields from published approved listings.
2. Registration POST `/api/auth/register` creates a draft profile. The frontend **discards** the early JWT and shows `/registration-submitted`.
3. The admin may approve a profile using its existing workflow, which sets `profileStatus: approved`, `isPublished: true`.
4. After approval, mobile + date-of-birth login can open the member account. **No OTP** added.
5. Members use the existing `/profiles`, `/profile-view`, the separated Biodata wizard, and the original admin UI.

## Actual API endpoints used

- `POST /api/auth/register`: existing register payload unchanged. Frontend ignores returned JWT.
- `POST /api/auth/login`: existing payload `{ mobile, dob }`. Frontend refuses to persist a session unless response profile has `profileStatus==='approved' && isPublished===true`.
- `GET /api/profile`: public listing; backend currently returns only profiles with `profileStatus:'approved'` and `isPublished:true`.
- `GET /api/profile/view/:id`: **BACKEND SECURITY ISSUE — public raw full profile including phone/email**. Avoid this endpoint for public Free Search. Backend MUST restrict or redact it before production.
- Admin approve: existing backend sets `profileStatus:'approved'`, `isPublished:true`.

## REQUIRED BACKEND CHANGES BEFORE DEPLOYMENT

**Frontend-only approval checks are NOT security controls.** Current backend `registerUser()` issues a JWT immediately and `loginUser()` issues JWT for pending profiles. Update backend authentication to reject unapproved account sessions, and protect profile detail, print, interest, like, subscription, and uploads. Restrict public responses to a basic allowlist. A browser user could otherwise call the backend directly. Current mobile number + date of birth is also weak authentication; add password-based login without OTP for production. Razorpay verification separately requires backend implementation.

## What is unchanged

The entire `src/app/admin` folder and existing admin UI markup are untouched. User Biodata wizard's separate section files, 8 couple backgrounds, and existing backend API paths remain.

## Run

`npm ci && npm start`; backend must be running on localhost:5000 with MongoDB for live listings, registration, and login. Production build: `npm run build` (must be executed and fixed if it reports errors). Do not deploy until backend-side access control and payment checks pass.

## Browser testing checklist

- Log out, open `/free-search`: approved listings only, limited UI fields.
- Register a new mobile number: see Registration Received; no token should remain in localStorage.
- Before admin approves: user login should refuse to save a token; public Free Search should still work.
- In existing admin `/admin/profiles`: approve that new draft profile. (Admin UI unchanged.)
- Login again with the same credentials: navigate to member `/profiles`.
- Verify biodata wizard 8 steps; verify back/next and EN/Tamil do not clear form inputs.
- Do not deploy: original backend still returns a JWT to a pending user and has a public full-detail endpoint. Backend authentication, redaction and permission checks are essential.
- `npm run test:approval-flow` runs focused static checks; also run full Angular build and browser tests.
