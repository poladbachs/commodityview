# Memory — CommodityOps Landing Page

Last updated: 2026-06-16

## What was built

All work is in a single file: `index.html` — self-contained React (Babel/CDN) marketing landing page. Also added:
- `api/waitlist.js` — Vercel serverless function, receives form POST, calls Resend to email info@commodityops.com
- `package.json` — minimal, only dep is `resend`
- `.gitignore` — includes `node_modules/`

### Completed this session

**Layer 1 (TradeCaptureDemo) — rebuilt as 2×2 premium grid:**
- Top-left: inbound email card slides in + extraction status
- Top-right: confidence % counter animates to 97%, 8 fields populate in 2-col grid
- Bottom-left: audit trail entries appear one by one (SYSTEM → CLAUDE → PENDING)
- Bottom-right: APPROVE button → "✓ TRADE RECORD CREATED · SOY-2604" with lifecycle bar + "8 fields · 1.4s" stat

**Layer 2 (CompliancePipelineDemo) — rebuilt as 2×2 premium grid:**
- Top-left: 3 doc cards (COA, BL, LC) slide in sequentially
- Top-right: rule engine counter animates 0→24 checks, "DONE · 22ms" badge
- Bottom-left: big scorecard — 22 (green) PASSED, 2 (red) EXCEPTIONS
- Bottom-right: discharge port mismatch exception — CONTRACT vs BL — "⚠ LC WILL NOT PAY — HOLD SHIPMENT"

**Layer 3 (ConnectedIntelligenceDemo) — already built last session, untouched**

**LifecycleStrip — cinematic spotlight animation:**
- Beats through 10 events in the trade lifecycle, one at a time
- Each beat: small event chip (mono) + italic display headline + mono sub-description
- Sweeping progress line at top, stage labels below, vertical pips on right
- Background flushes amber on exception beat, green on SETTLED
- Reduced padding this session: center section 28px/32px, headline max 56px

**Resend email integration:**
- `api/waitlist.js` uses CommonJS (`require`), not ESM — required for Vercel serverless
- Posts to Resend from `noreply@commodityops.com` → to `info@commodityops.com`
- `RESEND_API_KEY` env var added to Vercel dashboard
- `commodityops.com` domain verified in Resend (DNS via Vercel auto-config)
- Form in `index.html` posts to `/api/waitlist` (constant `WAITLIST_ENDPOINT`)

**Nav/routing fixes:**
- Waitlist page always scrolls to top (even when coming from `/waitlist#layer1` etc.)
- Nav clicks always trigger scroll even when route hasn't changed — `scrollKey` counter forces useEffect re-run

**Bug fixes:**
- Duplicate `transition:` key in CompliancePipelineDemo style object — was crashing Babel parse (white screen)
- Broken string literal with newlines in pricing plan `cta` field — also crashed page
- `STAGES` name collision — lifecycle strip now uses `LC_STAGES` to avoid redeclaration conflict with app's `STAGES`
- Form submission success text cleaned up: "We'll be in touch at {email} when your access is ready."

## Decisions made

- **Resend over Formspree** — no submission cap, own endpoint, same Resend package reusable in future Next.js app
- **CommonJS for api/waitlist.js** — Vercel serverless needs `module.exports`, not ES `export default`
- **`from` address = `noreply@commodityops.com`** — doesn't need to be a real mailbox, just domain must be verified in Resend
- **LifecycleStrip is a spotlight/beat animation** — one event at a time, not all stages visible, background color reacts to event kind
- **Layer demos are lo-fi marketing animation, not hi-fi product** — 2×2 grid layout with animated numbers as the "money shot"

## Problems solved

- White screen from duplicate `transition:` property key in JSX style object — Babel strict mode rejects duplicate object keys
- White screen from multiline string literal in JS object (`cta: "Join Layer 1 \n\n"`) — can't have unescaped newlines in JS strings
- `STAGES` redeclared — original `STAGES` (used by LifecycleBar) is in a different script block but same Babel scope; renamed lifecycle one to `LC_STAGES`
- Vercel not finding `/api/waitlist` — was using ESM `import/export`, Vercel serverless needs CommonJS
- Resend domain: used Vercel auto-config to add DNS records (TXT + MX for `send` subdomain, DKIM for `resend._domainkey`)

## Current state

- **Works**: Full marketing page with all 3 animated layer demos, waitlist form, Resend email delivery, navbar, footer, pricing, lifecycle strip animation
- **Deployed on Vercel**: commodityops.com
- **Resend**: domain verified, API key in Vercel env vars, function deployed
- **Lifecycle strip**: spotlight beat animation, tighter padding — user found previous iterations too large/whitespace-heavy, current version is compact

## Next session starts with

The lifecycle strip padding was just tightened — verify it looks right on the live site. If the user is happy, move on to whatever comes next (likely the Next.js app in the other repo, or further index.html polish).

## Open questions

- Does the lifecycle strip look right now? User was unhappy with multiple iterations — may want further tweaks
- Should the tweaks panel (`.` key) be removed before going live, or kept as a hidden debug tool?
- Formspree constant was renamed to `WAITLIST_ENDPOINT` pointing to `/api/waitlist` — old `FORMSPREE_ENDPOINT` name is gone
