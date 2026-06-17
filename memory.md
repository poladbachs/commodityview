# Memory — CommodityOps Landing Page

Last updated: 2026-06-17

## What was built

All work is in a single file: `index.html` — self-contained React (Babel/CDN) marketing landing page.

### Completed previous sessions
Hero, LifecycleStrip, WaitlistPage, MarketingFooter, CTA, Navbar — fully built desktop. Full mobile responsive pass completed last session.

### Completed this session: mobile footer alignment

Rewrote the `@media (max-width: 800px)` footer block in `index.html` many times. Final working state:

**Footer mobile layout — final CSS (inside `@media (max-width: 800px)`):**
```css
footer { padding: 24px 16px 28px !important; }
footer > div { flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; }
footer > div > div:first-child {
  display: flex !important; flex-direction: column !important;
  align-items: center !important; gap: 8px !important;
  width: 100% !important; padding-bottom: 16px !important;
}
footer > div > div:first-child > span:first-child { align-self: center !important; display: inline-flex !important; }
footer .logo-lockup { display: inline-flex !important; font-size: 20px !important; gap: 4px !important; align-items: center !important; }
footer .logo-mark { width: 32px !important; height: 32px !important; }
footer > div > div:first-child > a:not(.hero-social-proof) { font-size: 13px !important; opacity: 0.6 !important; }
footer > div > div:first-child > a.hero-social-proof { width: auto !important; flex: unset !important; }
footer > div > div:last-child {
  width: 100% !important; justify-content: center !important;
  flex-wrap: wrap !important; font-size: 11px !important;
  gap: 6px 14px !important;
  border-top: 1px solid oklch(28% 0.005 240 / 0.7) !important;
  padding-top: 16px !important;
}
footer > div > div:last-child > :nth-child(even) { display: none !important; }
```

**Footer global CSS (outside media query) — LinkedIn blue glass:**
```css
footer .hero-social-proof {
  background: oklch(56% 0.18 235 / 0.18) !important;
  border-color: oklch(56% 0.18 235 / 0.38) !important;
  color: oklch(82% 0.10 235) !important;
}
footer .hero-social-proof svg { fill: oklch(82% 0.10 235) !important; }
```

## Decisions made

- **Footer mobile layout**: Everything centered — logo lockup, email, LinkedIn, legal links all `align-items: center`
- **Logo in footer**: `logo-mark` at 32px, `font-size: 20px`, `gap: 4px` — mark slightly larger than text, same line
- **Legal links**: dots hidden via `:nth-child(even) { display: none }`, centered, `font-size: 11px`
- **LinkedIn button**: kept as auto-width pill, centered, blue glass styling preserved
- **Footer JSX**: `Logo size={20}` in MarketingFooter (unchanged from default)

- **Nav**: `position: fixed` (NOT sticky) — critical, sticky caused white bg on mobile
- **Hero mobile**: `min-height: 100svh`, bg-img `position: absolute; object-fit: cover`, glass panel `position: absolute; top: 72px`
- **Nav color inversion**: `lightIds = ['lifecycle-strip', 'product', 'pricing']` — dark text over light sections
- **Nav dark glass formula**: `oklch(10% 0.012 230 / 0.48)` to `oklch(10% 0.012 230 / 0.32)`
- **Pricing mobile**: 1-column at ≤560px, `white-space: normal` on `.btn`

## Problems solved

- **Footer alignment iterations**: Tried grid, display:contents, negative margins, full-width button — all failed. Final answer: simple flex column with `align-items: center` on the container, everything centered naturally.
- **LinkedIn pill alignment**: Don't try to align button content with text — just center everything in the column.
- **Logo mark vs text size**: mark=32px, font=20px gives right visual balance. 24px mark was too small, 48px was too big and inflated row height causing large gaps.
- **Legal dots on mobile**: `:nth-child(even)` hides dot separators (dots always at even positions 2,4,6,8,10).
- **Nav white bg on mobile**: was `position: sticky` in CSS override, fixed by removing that override so nav stays `position: fixed`.

## Current state

- **Marketing landing page**: Hero, Lifecycle, Product, Pricing, CTA, Footer — fully responsive on mobile ✓
- **WaitlistPage**: responsive form, stacked name fields on mobile ✓
- **Footer mobile**: Logo + CommodityOps centered, email centered, LinkedIn centered, legal centered with hairline divider ✓
- **Deployed on Vercel**: commodityops.com
- **Resend email**: Working, domain verified

## Next session starts with

Everything is complete and shipped. No pending items.

## Open questions

None.
