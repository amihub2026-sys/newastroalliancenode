# Astro Alliance — Dashboard and My Profile navigation fix

## Fixed in this package

- `/my-biodata` no longer waits for the extra status HTTP request; the OWN profile API is still responsible for validating the session and ownership.
- Protected-route approval checks share in-flight requests and use a short 12-second client-side navigation cache (not an authorization mechanism). Cache is invalidated at login, logout, and Biodata submission.
- Authentication guard has an eight-second timeout and an explicit retry page for connectivity errors; it no longer treats an unavailable backend as an expired login.
- Fixed the `approved` but unpublished route loop: such profiles remain awaiting publication.
- Removed an unconditional `/profile/me` call from app startup.
- Removed the artificial 600ms lock in header navigation and own Biodata Edit.
- Added retry states for My Biodata and dashboard requests (12-second timeout).
- Calculated dashboard matching arrays once per API response instead of sorting on each change-detection pass.
- Made user-facing routes lazy-loaded to reduce initial download and parsing work.
- Preserved the original logo and admin source files.

## Install on Windows

1. Back up your existing frontend folder and extract this ZIP into a NEW folder.
2. In the project folder run `npm ci` then `npm run build` then `npm start`.
3. Start your actual Node backend and ensure the frontend's API environment points at it.
4. Log in with an approved, published member and open Dashboard then My Profile.
5. Check an applicant with submitted Biodata: My Profile must show their own record, while public search must not expose it before admin publishes.
6. If navigation says Connection is taking too long, open Browser DevTools > Network, check `/api/profile/flow-status`, `/api/profile/me`, and `/api/profile`; investigate HTTP status codes and timings.

## Before production deployment

**Critical:** `src/environments/environment.prod.ts` in the supplied project currently uses `https://staging-api.example.invalid/api`, which is a placeholder and will NOT connect to your live Node server. Replace it with the REAL HTTPS backend API address for your deployment. Do not invent a URL.

The following must be tested with a running backend/database: token validity, owner-only `/profile/me`, server-side admin-approval and `isPublished` enforcement, membership access, and returned profile-photo URLs.

The Angular production build could not be run in this environment because dependencies could not be installed (`npm ci --offline`: ENOTCACHED). Run it on your Windows computer before publishing. An Angular syntax check and focused source tests are not equivalent to a successful Angular build or real-world performance benchmark.
