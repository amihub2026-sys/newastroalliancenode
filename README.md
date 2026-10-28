# Astro Alliance Matrimony — Angular Frontend

Frontend-only Angular 21 source delivery. Includes the matrimonial website and the administration workspace; no Node backend or MongoDB data is bundled here. This version is an incremental frontend refactor that preserves existing feature screens while modernizing the home screen, admin shell, and bulk import workflow.

> **Staging source, not production certification.** Backend APIs, live login, storage, imports, checkout and device-browser flows must be verified in your environment before launch. Customer login still depends on the current backend mobile + DOB mechanism and should be upgraded to verified login before production.

## Windows setup

1. Install Node.js 24 LTS, open PowerShell in the extracted folder.
2. Run `npm ci` (an internet connection is needed for the packages).
3. Start your **matching Node + MongoDB backend** on port `5000` (the backend was not modified in this package).
4. Run `npm start` and visit `http://localhost:4200`.
5. Admin login is `/admin-login`, customer login is `/login`, bulk profile import is `/admin/profile-import`.

### Production / staging API configuration — required

Edit `src/environments/environment.prod.ts` before building. Its default value `https://staging-api.example.invalid/api` is deliberately **not a running endpoint**, to prevent accidental connection to a live customer database. Set it to the HTTPS base URL of **your staging API**, including `/api`:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://your-staging-api.example.com/api'
};
```

Then run `npm run build`. Do **not** put MongoDB, Razorpay secret, storage secret or admin password into Angular environment files. The browser-facing Razorpay public ID can be returned by the backend's order creation response.

## Feature paths

| Area | URL | Notes |
|---|---|---|
| Home | `/` | Redesigned responsive Tamil/English homepage |
| Register | `/register` | Preserves existing registration feature |
| Customer login | `/login` | Current API uses mobile and DOB; replacement OTP integration is backend work |
| Profile browse | `/profiles` | Preserves existing search and profile cards |
| Biodata | `/biodata` | Protected, preserves original profile fields |
| Horoscope matching | `/horoscope-match` | Existing implementation retained |
| Plans / Payment | `/plans`, `/payment` | Existing Razorpay UI retained; requires staging checkout tests |
| Admin login | `/admin-login` | Separate email/password admin login |
| Admin profile manager | `/admin/profiles` | Original profile editor retained |
| Admin bulk import | `/admin/profile-import` | Preview, duplicate skipping and commit, JSON 1–100 new records |
| Admin billing | `/admin/payments` | Restored sidebar link |
| Admin accounts | `/admin/admin-users` | Sidebar owner-only; backend must enforce permissions |

## Source organization

- `src/app/core` — guards, HTTP interceptor, language state, token expiration helper.
- `src/app/services` — legacy existing API services; to migrate incrementally to domain-specific API clients.
- `src/app/home` — new public landing page with component-scoped styles.
- `src/app/admin` — new shared administration shell plus existing feature pages and new import screen.
- `src/app/{register,login,profiles,biodata,horoscope-match,plans}` — original feature screens retained for backwards compatibility.
- `src/environments` — API URL configuration.
- `docs` — architecture and handover checklists.

No Supabase runtime code is required by the delivered frontend.

## Known limitations

- Do not assume customer logins or payment callbacks work until staging backend is connected and integration tests pass.
- Existing profiles/photos live in MongoDB / remote object storage and are **not** shipped inside this zip.
- Bulk import adds **new** profiles only. It does **not** migrate historical profile IDs or media.
- Old feature code and global styles still contain legacy patterns; continue extracting one screen at a time while preserving functionality.
- The backend must enforce all membership limits, role permissions, profile visibility and payment verification.
- This delivery could not run an Angular production build in the authoring environment because npm dependencies were not available and the npm registry was unreachable. Run `npm ci`, `npm run build`, and `npm test` before staging.

See [`docs/FRONTEND_HANDOVER.md`](docs/FRONTEND_HANDOVER.md) for the remaining launch checks.

## Maintainable frontend styles

The SCSS styles have had a conservative cascade cleanup. Run `npm run styles:audit`
to see remaining `!important` usage and `npm run styles:check` to verify no new
superseded declarations were introduced. `npm run styles:clean` applies safe
cleanup automatically. See `docs/CSS_REFACTOR_REPORT.md` for the remaining
legacy CSS debt and the browser checks needed before deployment.

## Free Search — complete sidebar (October 2026)

The `/free-search` guest page now includes a responsive, bilingual, expandable filter sidebar. Existing backend fields work immediately; optional hobby and lifestyle filters are clearly disabled until their public API fields exist. Read `docs/SEARCH_FILTERS_IMPLEMENTATION.md` before updating the backend. Run `npm run test:search` for frontend filter-contract tests. Existing admin pages were not modified.
