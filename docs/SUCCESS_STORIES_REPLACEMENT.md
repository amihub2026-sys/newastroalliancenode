# Success stories: temporary photo replacements

The homepage currently displays **illustrative South Indian wedding photos only**.
They are not represented as Astro Alliance customer marriages or verified testimonials.

## Later: use genuine Astro Alliance wedding photographs

1. Obtain explicit permission from both adults to publish each photo and any related story.
2. Replace the corresponding JPG file while keeping its filename:
   - `src/assets/success-stories/story-01.jpg`
   - `src/assets/success-stories/story-02.jpg`
   - `src/assets/success-stories/story-03.jpg`
3. Edit `src/app/home/success-stories.data.ts` to update alt text and the bilingual captions.
4. When the actual approved story publishing workflow is complete, replace the sample label and disclosure with accurate claims; do not simply hide the label without verification.
5. Use images ideally 1000–1400 px wide, under 300 KB each for performance; use browser-supported JPG/WebP.
6. Check English/Tamil, mobile layout, alt text, and permissions before deploying.

**Security note:** Real customer details must come from a reviewed admin workflow and must not be hard-coded in public templates without consent. No fabricated ratings, wedding counts, or testimonials are included.

## Astro Match

The homepage now links to the existing `/horoscope-match` route. It does **not** create or enforce the requested independent Astro Match subscription plan. That requires the backend plan and entitlement APIs, Razorpay verification, and matching limits to be fully implemented and tested.
