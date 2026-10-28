# Astro Alliance: Dashboard header / responsive menu fix

## Reported issue
At desktop widths, the mobile hamburger navigation could stay open after a breakpoint transition and render a giant full-width list above dashboard content. A desktop screenshot showed the six links Home, Find your match, Plans, Approval Status, My profile and Logout in that block.

## Actual corrections
- `src/app/app.scss`: mobile navigation and backdrop are now hidden by default and displayed only at viewport widths of 880px or less. Removed the accidental duplicate `display:flex` from the desktop base `.mobile-nav` rule. The mobile panel scrolls within the viewport height.
- `src/app/app.ts`: close expanded navigation on navigation completion, Escape and resize to desktop; prevent opening mobile menus at desktop widths; restore the previous body overflow value when closing.
- `tools/verify-source.cjs`: updated outdated assertion expecting an invalid staging API, so it instead verifies the existing configured production API endpoint.

Original member/admin routes, logos, admin components, and backend have not been modified for this header-only repair.

## Verification completed
- Playwright static-layout smoke test of actual component SCSS at 1440, 1024, 880, 430, 390, 360 and 320px: PASS (correct breakpoint visibility and no horizontal overflow of test header).
- Header/navigation, profile routes, Biodata, search, approval-flow and source-only checks: PASS.
- TypeScript parser: 156 source TS files, 0 syntax errors.
- CSS override scanner: 38 SCSS files checked, 0 superseded declarations reported.

## Limitations
These are static layout/source tests. `npm ci --offline` failed due an unavailable dependency (`zod-to-json-schema` tarball), so Angular production compilation and live behavior against Node.js/MongoDB were not verified in this environment. No claim of production readiness is made.

## Local verification on Windows
In the extracted `astro-alliance-frontend` folder:

```
npm ci
npm run build
npm start
```

Open `http://localhost:4200/dashboard` at desktop width. The full-width mobile link list must not appear. Click `My Account`: a small anchored dropdown must open. On a 390px phone viewport, the hamburger menu opens as a mobile navigation panel and closes on selection, tapping the backdrop or Escape. Also verify My profile route separately as that may depend on backend permissions.
