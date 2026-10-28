# Astro Alliance Matrimony — integrated source release candidate (2026-10-09)

**Not certified production-ready. Do not replace the live system before the release gates below pass.**

## Source packages

- `frontend/astro-alliance-frontend/`: updated existing Angular project. The original `malogo.png` and all 122 admin UI source files are byte-identical to the previous frontend ZIP.
- `backend/astro-alliance-backend/`: Node.js + Express + MongoDB source from the existing Node/Mongo/Razorpay project, plus integrated onboarding and password-login patches. No `.env` or credentials are included.

## What is implemented / corrected in this candidate

- Production Angular API environment now points at the **previously configured** Render URL: `https://astroalliance-backend.onrender.com/api`. Local development remains `http://localhost:5000/api`. This address was not externally reachable during review, **so verify it before deployment**.
- Registration issues a **restricted onboarding token**, opens the eight-step Biodata form, submission marks the profile pending, and admin-approved/published status controls other-member visibility.
- Pending members can authenticate for their **own submitted Biodata and approval status**, but cannot browse protected member endpoints. Rejected/draft members can edit their own Biodata.
- Signup and member login now use a bcrypt-hashed password (mobile + password). Admin login UI and routes were not redesigned.
- Public cards show name prominently, profile ID secondarily; basic preview shows the same. Public models contain no telephone number/email/birth date.
- Public profile images support existing HTTPS URLs and relative legacy paths. Actual images still require functioning storage/CDN URLs. A generic gender-appropriate avatar remains the fallback.
- Biodata Live Preview no longer relies on a floating `position: fixed` in the user wizard. Review labels have Tamil equivalents; the name `abisha` suggests `அபிஷா` with confirmation.
- Added mobile-specific safeguards for sticky header, member avatar, login and signup forms, member dashboard, and My Biodata, without changing the admin UI styles.
- Removed more superseded CSS declarations using a conservative identical-selector cleanup.

## CRITICAL LIVE RELEASE BLOCKER — EXISTING USER PASSWORDS

Previous member login used mobile number + **DOB**, not a password. Existing member records therefore generally have no `passwordHash`. This candidate intentionally disallows DOB as a login secret. **Existing members cannot log in until they receive an identity-verified password setup / recovery path.** Never roll this change out to existing accounts without a completed migration and a tested recovery system. See `backend/astro-alliance-backend/PRODUCTION_PASSWORD_MIGRATION.md`. Administrator accounts are separate.

## Steps on Windows for local review

1. Back up the existing backend, frontend, MongoDB and hosting configuration. Do not edit the production database when smoke testing.
2. Extract both folders separately. Install Node version compatible with Angular 21 and the respective package-lock files.
3. In `backend/astro-alliance-backend`, configure a local `.env` using `.env.example`, start a replica-set-enabled local MongoDB (or use a staging Atlas database), then run `npm ci` and `npm start`.
4. In `frontend/astro-alliance-frontend`, run `npm ci`, `npm run build`, and `npm start` (for local testing).
5. For deployed frontend build, verify the real backend endpoint first; update `src/environments/environment.prod.ts` if hosting URL differs, then rebuild.
6. Configure backend `CORS_ORIGINS` with exact real production frontend origin(s), no wildcard. In `NODE_ENV=production` this is mandatory.
7. Set up R2 credentials/public storage URL and check historic Mongo image URLs before expecting existing profile photos to appear.
8. Configure production Razorpay credentials only in backend environment variables; use test credentials for testing. Never place secret keys in Angular.

## Smoke testing before launch (must be run on staging)

- [ ] `/` header/footer, 320/360/390/430px and desktop layout, touch navigation.
- [ ] Signup: mobile + password, age ≥18, duplicate mobile validation.
- [ ] New account redirects to `/biodata` immediately; save eight sections; Live Preview doesn't overlay the submit button.
- [ ] Pending user sees their own Biodata and Pending Approval, but does not appear in Free Search.
- [ ] Admin approves and publishes; public listing appears **only now**.
- [ ] Approved member login opens dashboard; dashboard -> My Biodata -> edit navigation works.
- [ ] Public/basic profile view shows allowed fields only; no API response leaks mobile/email/full DOB.
- [ ] Mobile/desktop profile image URLs load or gender placeholder displays (check R2).
- [ ] Active paid plan unlocks only permitted information; contact allowance is tracked separately and backend enforced.
- [ ] Failed/expired/duplicate Razorpay payment and webhook cannot falsely activate membership.
- [ ] Tamil/English labels (including names and the preview) are readable and values aren't unexpectedly changed.
- [ ] Existing-member password migration is complete, tested, and approved before switching login.
- [ ] Admin dashboard and uploads work unchanged; print A4 tested on actual browsers.

## Verified here (source-level only)

- `test:search`, `test:biodata`, `test:biodata-images`, and `test:approval-flow`: pass.
- 10 mocked backend onboarding permission scenarios: pass.
- Node syntax checks for modified backend files: pass.
- TypeScript parsing: 161 TS files with no syntax diagnostics, no unresolved relative imports.
- Admin Angular source: 122 files unchanged; original logo unchanged.
- CSS cleanup scan: no superseded identical-context declarations remaining in supported user-file scan.

**Not verified**: Angular production compilation, TypeScript semantic template checks, live backend and MongoDB connectivity, real payment flow, actual mobile browser screenshots, full accessibility audit, full integration/security testing, or performance benchmarking. `npm ci` failed in this container (npm error: `Exit handler never called!`).

## Functionality not completed by this source pass

- The marriage-status reporting workflow and genuine opt-in success-story publishing are not implemented end to end.
- Full structured Hobby Match/lifestyle search requires backend model fields, data migration and query support (existing source can display filter controls but cannot make missing backend data appear).
- Daily recommendations use existing basic eligible-profile ranking, not a fully validated match algorithm.
- Existing member password recovery and migration still require approved implementation.
- A4 print and every admin/backend flow need real browser/database regression tests.
- UI has received focused mobile fixes; a complete mobile UI redesign of **every** screen has not been browser-verified.

Prioritize live staging flow validation and password migration before any public launch. Do not claim 100% production readiness until the release gates are completed.
