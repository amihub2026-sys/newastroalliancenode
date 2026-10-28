# Astro Alliance Profile Navigation — Focused Fix

This version is based on `AstroAlliance_Final_Biodata_Approval_Flow_Frontend.zip` and fixes the navigation back to the OLD `/profiles` page shown in the user's screenshot. It does NOT redesign all pages and does NOT modify the admin UI.

## Updated navigation

- `/free-search`: public search, approved/published profiles of either gender, basic data.
- `/free-profile/:code`: basic public profile view, visible without a membership.
- `/profiles`: approved-member match search using the existing modern Free Search cards/filters, restricted on the client to the opposite gender saved in `matrimony_user`. This route remains protected by `authGuard`.
- `/profile-activity?tab=liked`: legacy Likes/Shortlist activity (preserved rather than deleted); other tabs remain accessible.
- `/my-biodata`: approved, pending and rejected members can view their own submitted profile; draft members resume the Biodata wizard.
- `/profile-view?profileId=AAM-XXX`: full-details attempt, only if existing backend access control permits it. No URL parameter unlocks premium data.
- If the full-detail endpoint returns a plan/access error, navigate to `/free-profile/:code` instead of the old listing.

## IMPORTANT backend prerequisites

- The API `/api/profile` must return **only safe public fields** from approved + published profiles. Client-side mapping is NOT a privacy boundary.
- `/api/profile/view/:code` MUST enforce verified paid access, approval, gender restrictions, subscription limits, and profile consent on the SERVER. Never use `unlocked=true` from the URL as authorization.
- `/api/profile/me` should allow the authenticated owner to view their own submitted Biodata when pending/rejected; only their own record.
- Search gender filtering on the client is visual UX, not an authorization boundary. The backend MUST filter protected member searches and exclude own/ineligible profiles.
- The onboarding and approval backend patch delivered previously is still needed to fully secure these flows.

## Source tests run

- `npm run test:search`: passed
- `npm run test:biodata`: passed
- `npm run test:approval-flow`: passed
- `node tools/verify-source.cjs`: passed
- `node tools/test-route-navigation.cjs`: passed

Angular production build was NOT run here because project node_modules are not installed and the Angular CLI is unavailable in this runtime. Run `npm ci` and `npm run build` locally and send any errors. Runtime backend and browser scenarios also need verification.
