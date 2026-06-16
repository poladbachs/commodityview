# Memory — CommodityOps Marketing Landing Page

Last updated: 2026-06-16

## What was built

All work is in a single file: `index.html` — a self-contained React (Babel/CDN) marketing landing page.

### Completed this session

- **Removed all app/prototype pages** — `DemoPage`, `DealsListPage`, `NewDealPage`, `InboxScreen`, `SettingsScreen`, `DealDetailL1/L2/L3`, `DealDetailPage` all removed. Router now only handles `/home` and `/waitlist`.
- **MarketingNav** — fixed centering via `grid-template-columns: 1fr auto 1fr` (brand left, links truly centered, CTA right). Mobile uses single-row grid `"brand links actions"`.
- **Ticker removed** — the scrolling market price carousel above the navbar is gone from all pages.
- **MarketingFooter** — extracted as shared component used in `HomePage`, `WaitlistPage` (form state), and `WaitlistPage` (success state). LinkedIn link now says "Follow us on LinkedIn" with icon + text (`hero-social-proof--cta` class).
- **WaitlistPage** — fully implemented with footer on both states. Form submits via `fetch` POST to Formspree (`FORMSPREE_ENDPOINT` constant on line ~2010). Has loading/error states. `SELECT_STYLE` constant avoids duplicating the arrow SVG. **ACTION NEEDED: replace `YOUR_FORMSPREE_ID` with actual Formspree form ID.**
- **Layer 1 interactive** → `TradeCaptureDemo` component: lo-fi animated 2-column demo. Left: wireframe email slides in + "CLAUDE EXTRACTING…" indicator. Right: 6 fields tick in one by one. Ends with interactive APPROVE button → "TRADE RECORD CREATED · SOY-2604" confirmation.
- **Layer 2 interactive** → `CompliancePipelineDemo` component: 4-step animated pipeline (INBOUND DOC → AI EXTRACTION → RULE ENGINE → EXCEPTIONS). Steps use `flex: 1` so they fill full width equally. Lines appear one by one per step. Summary bar (3 docs · 24 fields · 22 passed · 2 exceptions) fades in when complete.
- **Layer 3 interactive** → `ConnectedIntelligenceDemo` component: 5 intelligence signals slide in sequentially (vessel position, sanctions screen, market context, counterparty news, freight delta). Each has an icon, detail text, and a color-coded status tag. Amber/pass/warn color coding per signal type.
- **Mobile scroll** — `scrollMarginTop: 70` on `#active-layer-interactive` so sticky navbar doesn't overlap after smooth scroll.
- **Cross-doc reconcile data fixed** — discharge port BL was incorrectly "Qingdao" (PASS), now "Tianjin" (FAIL).
- **Broken script block removed** — leftover InboxScreen/SettingsScreen JSX that was inside a babel script tag and causing parse errors.

## Decisions made

- **Self-serve, not sales** — waitlist form has no phone, job title, or timeline fields. Fields: First Name, Last Name, Work Email, Company, Business Type (dropdown), Target Layer (dropdown), Workflow Bottleneck (optional textarea).
- **Form backend = Formspree** — production-standard for static pages. POSTs JSON, emails land at info@commodityops.com. No backend needed. Free tier = 50 submissions/month.
- **Layer interactive demos = lo-fi marketing animation, not hi-fi product** — show the concept/flow, not real data tables. Each layer auto-plays on selection and has a ↺ REPLAY button.
- **Ticker removed permanently** — user decided the scrolling market price bar above the navbar is not wanted.
- **All 3 layer demos** are separate React components in their own `<script type="text/babel">` block (the "COMPLIANCE PIPELINE DEMO" block, before the PAGE: 02 block).

## Problems solved

- Broken `<!-- comment -->` inside `<script type="text/babel">` block caused parse errors — replaced with an HTML comment outside the script tag.
- `Object.assign(window, { DealDetailL1, ... })` referenced undefined variables after app pages were removed — fixed by removing the whole broken block.
- Navbar links were not truly centered — `justify-content: space-between` with unequal-width brand/CTA pushed links off-center. Fixed with CSS grid 3-column layout.
- Layer 2 step boxes were `width: 160px` fixed with `flex: 0 0 auto` — caused whitespace on right. Fixed with `flex: 1; minWidth: 0`.

## Current state

- **Works**: Full marketing page (Hero, Lifecycle strip, Product/Layers section with 3 animated demos, Pricing, CTA, Footer), Waitlist page with Formspree form, mobile responsive, dark/light mode toggle (tweaks panel via `.` key).
- **Partial**: Formspree not activated — `YOUR_FORMSPREE_ID` is a placeholder. Form will fail until replaced.
- **Removed**: All app prototype screens, ticker, demo/try-now routes.

## Next session starts with

Replace `YOUR_FORMSPREE_ID` on line ~2010 of `index.html` with the real Formspree form ID from formspree.io (sign up → create form → point to info@commodityops.com → copy ID).

Then consider: does Layer 3 need an interactive CTA/endpoint at the end like Layer 1's approve button? Currently it just plays through and offers replay.

## Open questions

- Should the tweaks panel (`.` key) be removed before going live, or kept as a hidden debug tool?
- Is the `scrollMarginTop: 70px` sufficient for all mobile screen sizes, or does the navbar get taller on very small screens?
- Next.js/Convex app — is there a `build-plan.md` with the full architecture? Referenced in implementation_plan.md but not read this session.
