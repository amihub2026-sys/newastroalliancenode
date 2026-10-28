# CSS clean-up and remaining work

## What was corrected in this frontend package

The original frontend contained **1,784** `!important` declarations and long chains of repeated selectors. Those declarations were **not** removed in the initial frontend handover.

The second pass performed a **cascade-aware, conservative cleanup** across the Angular SCSS files:

- Removed **1,046 superseded declarations** where another declaration with the **identical selector and identical ancestor/media context** takes precedence; 347 removed declarations carried an unnecessary `!important`.
- Removed **245 completely empty rules** created by that cleanup.
- Reduced the total `!important` declarations from **1,784 to 1,437**.
- Formatted the new Home and Admin Shell SCSS as multi-line, readable source.
- Added reusable global brand custom properties for the new homepage.
- Added an idempotent cleanup script and a style audit script.

**Deliberate safety measures:** The clean-up does not indiscriminately strip `!important`, merge differently scoped selectors, change media breakpoints, or discard vendor fallback declarations. Component-specific overrides that may still affect the visual layout remain.

## Remaining technical debt

The legacy feature pages still contain **1,437 `!important` declarations** in aggregate. Most of this debt is concentrated in profile view, profile search, biodata, and admin profile/print components. It needs a page-by-page UI refactor supported by visual regression tests. Do **not** treat the application as fully CSS-refactored or production-certified yet.

The shared `ng-select` styles require special attention because they override a third-party component, and print styles need separate verification. Avoid blanket-replacing or deleting their `!important` rules.

## Commands

```powershell
npm ci
npm run styles:audit
npm run styles:check
npm run styles:clean
npm run build
```

`styles:check` returns a failing exit code if it finds new safe-to-remove superseded declarations. `styles:clean` is deliberately idempotent.

## Visual acceptance tests still required

1. Profiles — search/filter cards, actions, mobile (320, 375, 430px), tablet and desktop.
2. Profile view — two-column desktop layout, responsive stacking, chart labels, private-contact states, long Tamil text.
3. Biodata — registration form, all section steps, uploads and validations.
4. Admin profiles — search, import modal, edit/view screen, permissions, long tables on mobile.
5. Print and download — A4 print profile, horoscope, chart alignment, browser preview.
6. Shared dropdowns — opened/selected state and overlay stacking.
7. Global contrast, keyboard focus, accessibility and browser build.

A successful PostCSS parse and script-level cascade audit is **not** a substitute for an Angular production build and visual browser testing.
