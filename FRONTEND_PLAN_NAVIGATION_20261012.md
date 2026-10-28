# Astro Alliance — Plan Selection Navigation (Frontend Only)

## Changed
- Choose Plan no longer calls `/api/subscription/complimentary-activate`, payment, Razorpay, or admin subscription endpoints.
- From a selected profile: Choose Plan routes directly to `/profile-view?profileId=<original profile id>`.
- Without a selected profile: Choose Plan routes to `/free-search`.
- Prevents duplicate navigations while a plan card is being selected.
- Retires the old `/plan-success` link by redirecting to Plans.
- Original logo, admin UI, backend code, MongoDB, and registration/login remain untouched.

## Important limitation
**Choosing a plan does not activate it.** This is frontend navigation only. The existing protected `/api/profile/view/:id` endpoint decides whether full details are available. If no eligible membership exists, the frontend's existing profile-view handler redirects to the free basic preview.

Only the existing admin workflow (or a future verified Razorpay integration) can activate a real plan on the unchanged backend. We do not fake activation, display false payment success, or expose private profile fields via the browser.

## Windows
`npm ci` then `npm run build` then `npm start`. For member data locally, keep the existing Node.js backend and MongoDB running.

## Manual checks
1. Log in as approved member with existing active plan, open a basic profile, click View Plans and Choose Plan: full profile opens.
2. Repeat without an active plan: basic public profile opens after the backend denies full access.
3. Choose Plan from the standalone Plans screen: opens Free Search.
4. Repeated clicks must not send multiple navigation actions.
5. Inspect browser Network: no call to `/subscription/complimentary-activate`, `/payments/orders`, or `/payment-success`.
