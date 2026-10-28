# Astro Alliance — Eight Biodata Backgrounds

This update changes the **user-facing, eight-step Biodata wizard only**. The `/admin` source folder and admin-created/edited Biodata layout are unchanged.

## Step-to-image mapping

| Step | Page | Local asset |
|---|---|---|
| 1 | Personal Details | `src/assets/biodata-wizard/step-01.webp` |
| 2 | Family Details | `src/assets/biodata-wizard/step-02.webp` |
| 3 | Education & Career | `src/assets/biodata-wizard/step-03.webp` |
| 4 | Location | `src/assets/biodata-wizard/step-04.webp` |
| 5 | Horoscope | `src/assets/biodata-wizard/step-05.webp` |
| 6 | Partner Preferences | `src/assets/biodata-wizard/step-06.webp` |
| 7 | Photos & Video | `src/assets/biodata-wizard/step-07.webp` |
| 8 | Review & Submit | `src/assets/biodata-wizard/step-08.webp` |

Photos are generated **illustrative** images of happy South Indian couples, **not real Astro Alliance customer testimonials**. Replace image assets with permitted client photos later. To change an image, replace the matching `.webp` file while retaining its filename.

## Design and implementation

- Image selectors and responsive behavior are in `src/app/biodata/biodata-wizard-backgrounds.scss` (no global CSS overrides).
- A `data-step` binding on the decorative banner switches the image automatically as users select Next/Back.
- English/Tamil header text uses the existing form language state; photo rendering never alters form data.
- Mobile view shows the couple image above a high-contrast, readable explanatory section.
- WebP files are loaded locally by Angular's `src/assets` copy rule; no new external image API.
- The administrator interface and its CSS are not modified.

## Existing backend compatibility

Use the existing Node.js + MongoDB backend for core Biodata registration and editing with `src/environments/environment.ts` pointing to `http://localhost:5000/api`. Both source projects contain matching route definitions for `GET /api/profile/me`, `PUT /api/profile/biodata`, the admin profile management routes, and `POST /api/upload`.

**Limitations:** The original `astroalliance-backend-master` source does **not** expose the new Razorpay `/api/payments/orders` and `/api/payments/verify` endpoints called by the Angular frontend. Use the matching refactored backend payment module and test with Razorpay test keys before enabling payments. Original `mobile + date of birth` login needs a production authentication/security review even without SMS OTP. Production environment API URL must be configured. Live MongoDB, authentication, upload, payment, and browser testing was **not** performed by this asset update.

## Quick checks

```powershell
npm ci
npm run test:biodata
npm run test:biodata-images
npm run build
npm start
```

Do not deploy as fully production-verified until build, SSR, responsive browser, and API end-to-end checks pass.
