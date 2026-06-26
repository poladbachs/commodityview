# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 02 Auth
**Next:** 03 Database Schema

---

## Progress

### Phase 0 — Test Data

- [x] Create test document set (trade confirmations, COAs, LCs, BLs, invoices) — 9 files in /test-data

### Phase 1 — Foundation

- [x] 01 Project Setup
- [x] 02 Auth
- [ ] 03 Database Schema
- [ ] 04 App Shell
- [ ] 05 Billing Setup

### Phase 2 — Document Ingestion

- [ ] 06 Document Upload — Full UI
- [ ] 07 Document Upload Logic
- [ ] 08 Document Classification + Extraction
- [ ] 09 Outlook Add-in — Build
- [ ] 10 Outlook Add-in — API Endpoint

### Phase 3 — Trades

- [ ] 11 Trade List — Full UI
- [ ] 12 Trade Detail — Full UI
- [ ] 13 Trade Timeline + Document Linking
- [ ] 14 Trade Approval Logic

### Phase 4 — Dashboard

- [ ] 15 Dashboard — Full UI
- [ ] 16 Dashboard — Real Data

### Phase 5 — Validation (Layer 2)

- [ ] 17 Rule Engine — Core
- [ ] 18 Validation UI
- [ ] 19 Tolerance & Threshold Settings

### Phase 6 — Reconciliation (Layer 3)

- [ ] 20 Invoice Reconciliation
- [ ] 21 Counterparty Intelligence
- [ ] 22 Vessel Tracking

---

## Layer 1 Ship Checklist

- [ ] Features 01-16 complete
- [ ] Test document set passes all extraction tests
- [ ] Outlook Add-in works (single + batch mode)
- [ ] Add-in sideloading tested in Outlook
- [ ] Manifest submitted to Microsoft AppSource (or sideload link ready)
- [ ] Subscription gate enforced — no access without active plan
- [ ] Clerk Billing plans configured and working
- [ ] Deployed to Vercel production
- [ ] commodityops.com pointed to production app

---

## Decisions Made During Build

- `create-next-app` skipped — directory name `commodityOps` violates npm naming. Scaffolded manually; same outcome.
- `convex/_generated/` is stubbed with `.d.ts` + `.js` files matching real Convex output. Run `npx convex dev` once to authenticate and overwrite with real generated types.
- `experimental.dynamicIO` removed from next.config.ts — only available in canary, not needed for Layer 1.
- `clsx` + `tailwind-merge` added to dependencies for `cn()` utility (shadcn/ui requires them).

---

## Notes

- shadcn/ui components in `components/ui/` have been restyled at init time to use project tokens. Do not reset them via `npx shadcn add`.
- `convex/react-clerk` is a subpath export of the `convex` package — not a separate npm package.
- All 9 test documents live in `/test-data/` and cover one complete sugar trade lifecycle (STC-2026-0441) plus crude oil and wheat confirmations.
