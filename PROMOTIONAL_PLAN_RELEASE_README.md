# Astro Alliance temporary membership activation (until Razorpay)

This is NOT a mock checkout or a fake payment success. The selected plan becomes an actual backend-controlled complimentary promotional subscription after admin approval. The success page confirms it with GET /api/subscription/current before showing active status. No payment is represented as paid. Existing backend profile/contacts access checks still apply.

## Owner deployment decision
Set COMPLIMENTARY_PLAN_ACTIVATION_ENABLED=true in the backend environment **only if you want approved users to receive no-charge memberships when selecting a plan**. Default false. This can reveal real members' family/horoscope details to approved users under the plan limits. Set COMPLIMENTARY_CONTACT_ACCESS_ENABLED=true only if you wish to give no-charge contact allowances; default false. Confirm privacy expectations. Disable complimentary activation when Razorpay launches.

Must deploy the matching updated Node backend before enabling this frontend. Do not deploy just the frontend.

Local Angular uses http://localhost:5000/api; production uses https://astroalliance-backend.onrender.com/api. Verify the actual server, database and CORS settings. Member login uses mobile+DOB as requested, which is weaker than OTP.

Flow: approved login -> select active plan -> POST /subscription/complimentary-activate -> server saves an auditable complimentary subscription -> /plan-success verifies active plan -> /profile-view?profileId=CODE requests secured /profile/view/CODE -> server enforces quota and contact permissions. Basic profile viewing stays free.

Do not claim a successful payment. Razorpay/card/UPI collection is disabled. Run npm ci && npm run build for Angular, npm ci && npm test for backend, and check phone-browser views and a staging MongoDB.
