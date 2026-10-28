# Frontend compatibility with existing Node.js backend

Source inspected: `astroalliance-backend-master (1).zip` and current `AstroAlliance_Biodata_Wizard_Bilingual_Update.zip`.

| Angular feature / API request | Original backend route evidence | Assessment |
|---|---|---|
| Login: `POST /api/auth/login` | `src/routes/auth.routes.js` | Route exists; do integration testing |
| User Biodata: `GET /api/profile/me` | `src/routes/profile.routes.js` | Route exists, bearer auth required |
| User Biodata: `PUT /api/profile/biodata` | `src/routes/profile.routes.js` | Route exists, bearer auth required |
| Admin Biodata: `POST /api/admin/profiles/create` | `src/routes/admin.routes.js` | Route exists, admin auth required |
| Admin profile editing / viewing | `/api/admin/profiles/:profileId` | Route exists; admin layout is untouched |
| Upload: `POST /api/upload` | `src/app.js` + `src/routes/upload.routes.js` | Route exists; storage/cloud credentials must be tested |
| Subscription plans | `src/routes/subscription.routes.js` | Route exists; response fields and records must be tested |
| Checkout: `POST /api/payments/orders` | No matching route in original backend | **NOT supported** by original backend |
| Checkout verification: `POST /api/payments/verify` | No matching route in original backend | **NOT supported** by original backend |

The API base URL defaults to `http://localhost:5000/api` for local development. Set a real backend URL in `src/environments/environment.prod.ts` before deployment.

**Important:** Matching source route definitions is not a full integration test. To finish production verification, run the Angular production build, perform browser testing with the actual MongoDB-backed API, check security and user permissions, validate upload storage, and use Razorpay test mode end-to-end. The original backend's mobile+date-of-birth-only login is too weak for a high-trust public production launch; no mobile SMS OTP is needed to implement a stronger password-based or other verified login method.

This release contains the **complete updated Angular frontend source**, not the Node.js backend, MongoDB data, or a completed payment migration.
