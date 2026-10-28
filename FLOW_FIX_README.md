# Astro Alliance — registration/Biodata flow and CSS correction

This project is based on `AstroAlliance_Premium_User_Frontend_TS7006_Fixed.zip`.
The existing Admin Panel UI and original logo asset are unchanged. No broad user-UI redesign was made.

## Intended workflow

1. Guest uses Free Search and sees approved/published basic profiles.
2. Registration `POST /api/auth/register` creates a `draft` profile and returns a restricted onboarding token.
3. Frontend saves onboarding session and navigates to `/biodata` immediately; existing eight-step form loads the registered user's data.
4. Biodata submission `PUT /api/profile/biodata` changes profile status to `pending` and redirects to `/approval-pending`.
5. Pending profiles cannot access member dashboard or profile-unlock services. Rejected profiles may resume the Biodata form for corrections.
6. After admin approval **and publication**, member logs in and navigates to `/dashboard`.
7. Basic details remain free, premium private details require verified server-side entitlements. Plans are **not** required before approval.

## IMPORTANT: Backend patch must be deployed with this frontend

The older backend issues normal member tokens during registration and before approval.
To avoid a security bypass, install the three-file backend patch (delivered separately) BEFORE deploying this frontend.
The patch changes token scope, server protection, and the route precedence in `/api/profile/flow-status`.
Do not deploy the frontend alone and assume browser route guards provide server security.

## Source changes

- `src/app/register/register.ts`: use registration response for onboarding; move directly to `/biodata`.
- `src/app/login/login.ts`: approved members enter dashboard, draft/rejected members resume Biodata, pending shows approval notice without a member session.
- `src/app/core/auth.guard.ts`: validate fresh backend flow status for each protected navigation. Onboarding status only allows Biodata, approval notice, and correction screen.
- `src/app/biodata/biodata.ts`: completion goes to approval rather than male-only plans.
- `src/app/account-status/account-status.ts`: pending accounts cannot reopen submitted Biodata, rejected accounts can correct it.
- `scripts/clean-styles.cjs`: new `--user-only` option to avoid modifying Admin Panel.
- SCSS: conservative removal of 133 superseded user-facing declarations; no blanket deletion of CSS `!important`.
- `tools/verify-approval-flow.cjs`: correct the regression expectations to match the new workflow.

## Local Windows instructions

From `astro-alliance-frontend` in PowerShell:

```powershell
npm ci
npm run build
npm run test:search
npm run test:biodata
npm run test:biodata-images
npm run test:approval-flow
npm start
```

If `ng` is not recognized, `npm ci` did not finish successfully. Run it first and share installation errors.

Test: register a fresh phone number -> Biodata step 1 -> complete all 8 steps -> awaiting approval -> admin approves and publishes -> login -> dashboard. Also test rejected profile corrections, no photo fallback, and a non-paying approved member opening basic profile details.

## Verification / limitations

Passed in this work environment:
- 4 existing focused source test scripts (search, Biodata, wizard photos, approval flow)
- 160 TypeScript files parse without syntax diagnostics
- CSS conservative cleanup: 133 superseded declarations, 13 redundant `!important` occurrences, 34 empty rules
- Backend patch syntax and 10 mocked token-access scenarios
- ZIP validity and preservation of original admin files and logo

Not verified here:
- `npm ci` failed in this environment with an npm internal error (`Exit handler never called!`)
- As a result an Angular production build, actual MongoDB integration, Razorpay, uploads, and real browser navigation were not executed.
- The existing login uses mobile + DOB, not a password. Replacing that with secure password-based login is a separate backend migration.
- Other API modules' approval and subscription controls require a complete production authorization audit. This patch is not a full penetration test.
- Bad/missing profile images still depend on real backend media URLs and R2 configuration.

Do not treat this ZIP as an independently verified production deployment until the backend patch is integrated, Angular build succeeds, and end-to-end QA passes.
