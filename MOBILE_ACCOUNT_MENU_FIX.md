# Astro Alliance — mobile profile icon fix

## Why tapping the avatar appeared to do nothing

At phone widths <= 880px, the header avatar was a direct Angular router link to `/dashboard`. The auth guard correctly blocks dashboard access for members who have not completed Biodata or received approval, sending them back to `/biodata` or `/approval-pending`. Therefore tapping it while filling Biodata appeared to do nothing.

## Changes

- `src/app/app.html`: changed the round avatar to a menu button; added bilingual, status-aware account links. Applied the same navigation rules to desktop and mobile hamburger menu.
- `src/app/app.ts`: added menu state, toggle and derived user-facing account stage labels, ensuring only one mobile menu is open at a time.
- `src/app/app.scss`: responsive popup width, scrolling, touch-friendly targets and tap-away dismissal.
- No admin files, route guards, APIs, logo files, member data or backend files were edited.

## Expected behavior

- Draft/rejected: **Continue Biodata**, **My Profile**, **Free Search**, **Logout**.
- Pending: **Approval Status**, **My Profile**, **Free Search**, **Logout**.
- Approved: **My Dashboard**, **My Profile**, **Free Search**, **Logout**.
- The menu uses cached status only for labeling. Angular route guards and the Node backend MUST continue to enforce authorization.

## Local verification

- TypeScript source transpilation: no parse diagnostics.
- Focused mobile account and routing assertions: passed.
- Existing Biodata and approval-flow tests: passed.
- Angular production build and browser-device testing: **NOT performed in this environment** (Angular npm dependencies are not installed here). Run `npm ci`, `npm run build`, and test the popup at 320/360/390/430px after extracting.
