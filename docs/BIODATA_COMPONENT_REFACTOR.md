# Astro Alliance — Biodata modularization

This patch corrects the `NG5002` error on the progress-step number and **moves the original form markup** into individually maintained Angular standalone components. The admin screen is not redesigned. The existing parent (`biodata.ts`) remains responsible for API integration, form state, and most handlers; the family user-name UI handlers now live in the family component. This is a first structural refactor, **not** proof of complete production readiness.

## File layout

- `src/app/biodata/biodata.html` — small layout, wizard navigation, and submit action
- `src/app/biodata/biodata.ts` — existing shared form state and API handling
- `src/app/biodata/sections/personal-details/personal-details.{ts,html,scss}`
- `src/app/biodata/sections/family-details/family-details.{ts,html,scss}`
- `src/app/biodata/sections/education-career/education-career.{ts,html,scss}`
- `src/app/biodata/sections/location-details/location-details.{ts,html,scss}`
- `src/app/biodata/sections/horoscope-details/horoscope-details.{ts,html,scss}`
- `src/app/biodata/sections/partner-preferences/partner-preferences.{ts,html,scss}`
- `src/app/biodata/sections/media-upload/media-upload.{ts,html,scss}` (pre-existing)
- `src/app/biodata/sections/review-submit/review-submit.{ts,html,scss}`
- `src/app/biodata/sections/profile-preview/profile-preview.{ts,html,scss}`
- `src/app/biodata/_biodata-shared.scss` — original field/layout CSS in a shared Sass mixin, scoped via `app-biodata` from `src/styles.scss` so it reaches child component templates and doesn't affect other pages

The child sections accept the parent state with a typed input `vm: Biodata`, preserving the existing form fields. `ControlContainer` forwarding is used so their `ngModel` controls remain connected to the parent form. `:host { display: contents; }` retains the visual layout as much as possible. The user-only eight background files are still in `src/assets/biodata-wizard/`.

## Run locally on Windows

1. Extract the ZIP and open the `astro-alliance-frontend` directory. Use a fresh directory, not an in-place merge with old files.
2. Run `npm ci` (requires npm registry access and a supported Node.js version).
3. Run `npm run test:biodata` and `npm run test:biodata-images`.
4. Run `npm start`. For a production compilation check, run `npm run build`.
5. Check the complete flow in both languages, especially family names, city/rasi dropdowns, uploads and admin edit mode, using a staging backend and test data.

## What has / has not been verified

- TypeScript source syntax parsing and code structure are checked.
- Checks verify that the admin source folder is unchanged and that original input names and Angular binding counts are preserved.
- **An Angular CLI build, template type-check, actual UI rendering, and Node/Mongo integration have not been confirmed in this environment.** A functioning backend does not follow from these source checks.
- Backend login/privacy/upload issues discovered earlier are outside this frontend-only patch.
