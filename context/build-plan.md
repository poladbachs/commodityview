# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 0 — Test Document Set

Before building anything, create a set of realistic sample documents for testing every feature as it's built. These become both the test suite and demo data.

**Documents to create (use Claude to generate realistic content):**

- 3 trade confirmation emails (sugar, crude oil, wheat) — plain text email body with deal terms
- 2 COA PDFs — one that passes validation, one with a grade mismatch
- 2 LC PDFs — one clean, one with an amount discrepancy
- 1 BL PDF — vessel, port, quantity
- 1 invoice PDF — line items referencing a trade

Save all as files in a `/test-data` folder. These are used throughout development and in marketing screenshots.

---

## Phase 1 — Foundation

### 01 Project Setup

Initialize the project with all tooling configured.

**Setup:**

- Next.js 15 with App Router, TypeScript strict, Tailwind CSS v4
- Convex initialized and connected
- Clerk installed and configured (Google OAuth + Microsoft OAuth + email)
- Design tokens from index.html ported to `@theme` in globals.css
- shadcn/ui initialized with project theme
- Folder structure created matching architecture.md
- AGENTS.md configured with installed skills
- All context files in `/context`

---

### 02 Auth

Clerk authentication — Google OAuth, Microsoft OAuth, and email.

**UI:**

- Login page — Google OAuth button, Microsoft OAuth button, email input
- Sign-up page — same layout

**Logic:**

- Clerk provider wrapping app
- Clerk middleware protecting `/(app)/` routes
- After login → redirect to /dashboard
- Clerk `userId` available in all app routes

---

### 03 Database Schema

All Convex tables created before any data is written.

**Logic:**

- `documents` table with all columns from architecture.md
- `trades` table with all columns
- `userSettings` table — tolerance percentages and confidence threshold per user
- `activity` table with all columns
- Basic queries: list, get by ID (always scoped to userId)
- Basic mutations: create, update status

---

### 04 App Shell

Build the authenticated app layout — navbar, page container.

**UI:**

- Navbar — logo, Dashboard, Trades, Documents, Settings links
- Active nav item highlight
- User avatar + sign out from Clerk
- Page container with correct max-width and padding
- All nav items link to placeholder pages

---

### 05 Billing Setup

Clerk Billing integration for subscription management.

**UI:**

- Pricing page at /pricing — Clerk `<PricingTable />` component showing all 4 tiers
- TierGate component — wraps gated features, shows upgrade modal when user's plan is insufficient
- Settings → Billing redirects to Clerk Customer Portal
- Upgrade button in navbar for users without an active plan

**Logic:**

- Plans configured in Clerk Dashboard: layer_1 ($99/mo), layer_2 ($199/mo), layer_3 ($499/mo), enterprise ($2,999/mo)
- `<PricingTable />` renders plans with checkout — zero custom UI
- Tier check utility in Convex: reads plan from Clerk user identity
- Subscription status enforced — check active plan in Convex mutations before processing
- TierGate checks:
  - Layer 1: trade capture, document ingestion (all types), trade timeline, audit log
  - Layer 2: rule engine execution, COA/LC/BL cross-validation, exception flagging, tolerance/threshold settings
  - Layer 3: invoice reconciliation, counterparty screening, vessel tracking

---

## Phase 2 — Document Ingestion

### 06 Document Upload — Full UI

Build the document upload and inbox UI with mock data.

**UI:**

- Document inbox page — list of documents with: filename, document type badge, status badge, linked trade, source badge (email/upload), date
- Upload area — drag and drop zone, "Click to upload or drag and drop", PDF/image accepted
- Document detail page — original file viewer on left, extracted data panel on right
- Extracted data panel shows key-value pairs in an editable card layout
- Status badge: pending_review (amber), approved (green), rejected (red), exception (red outline)
- Empty state when no documents
- "Export CSV" button above the document inbox list — exports currently filtered/visible documents

---

### 07 Document Upload Logic

Wire document upload to Convex file storage.

**Logic:**

- Convex mutation uploads file to Convex storage
- Document record created with status: pending_review, documentType: unknown, source: upload
- File viewer renders PDF using browser native PDF viewer or image tag
- Document appears in inbox immediately after upload
- Activity log entry: document_uploaded

---

### 08 Document Classification + Extraction

Claude AI classifies and extracts structured data from uploaded documents.

**Logic:**

- Convex action triggered after document upload
- Step 1: Extract text from PDF (pdf-parse or Convex-compatible alternative)
- Step 2: Claude API classifies document type (trade_confirmation, coa, coq, letter_of_credit, bill_of_lading, invoice, unknown)
- Step 3: Claude API extracts structured fields based on document type
- Trade confirmation extraction fields: commodity, counterparty, quantity, price, delivery terms, contract month, exchange, differential
- COA extraction fields: commodity, grade, specs, test results
- COQ extraction fields: commodity, grade, parameters (array, commodity-dependent), lab, date, certificate number
- LC extraction fields: beneficiary, amount, currency, terms, expiry date
- BL extraction fields: vessel name, port of loading, port of discharge, quantity, dates
- Invoice extraction fields: line items, amounts, references, due date
- Extracted data saved to document record
- Document type badge updates in inbox
- If trade_confirmation → auto-create linked trade record with status: draft
- Activity log entries: document_classified, trade_created (if applicable)
- All other document types (COA, LC, BL, invoice) → linked to matching trade by counterparty + commodity + date proximity, or user manually links from the trade detail page
- Rule engine does NOT run at this step — extraction only. Cross-validation is Layer 2.

---

### 09 Outlook Add-in — Build

Build the Outlook Add-in that lives inside the user's Outlook.

**Deliverables:**

- Add-in panel UI (HTML/JS) — hosted at addin.commodityops.com
- Office.js integration — read current email subject, sender, body, attachments
- Single mode: click button → preview extraction in side panel → confirm send
- Batch mode: select multiple emails → click button → send all without preview → progress indicator
- Manifest file (JSON) for sideloading and AppSource submission
- Settings → Add-in page with installation instructions and sideload link

**Logic:**

- Office.js ReadItem permission — reads only the selected email(s)
- POST /api/ingest with user auth token + email data + attachments
- Deduplication via emailMessageId — skip if already processed
- Activity log entry: document_captured

---

### 10 Outlook Add-in — API Endpoint

Build the API endpoint that receives data from the Outlook Add-in.

**Logic:**

- POST /api/ingest receives: auth token, email subject, sender, body, attachments
- Validate auth token against Clerk
- Check subscription status — reject if no active plan
- Store attachments in Convex file storage
- Trigger same classification + extraction pipeline as manual upload
- Document record created with source: addin
- If trade_confirmation → auto-create trade record
- Return extraction preview to add-in panel (for single mode)
- Activity log entry: document_captured

---

## Phase 3 — Trades

**This is the core product.** The trade lifecycle system — status progression, document linking, timeline, approval workflow — is what makes CommodityOps a system of record and not just another extraction agent. Phase 2 (extraction) is how data enters. Phase 3 is where the value lives. Build this with equal or greater care than extraction.

### 11 Trade List — Full UI

Build the trade list page with mock data.

**UI:**

- Trade list with columns: commodity, counterparty, quantity, status badge, # documents, date
- Status filter tabs: All, Draft, Confirmed, In Shipment, Delivered
- Each row clickable → trade detail page
- Empty state when no trades
- "Export CSV" button above the trade list table — exports currently filtered view (respects active status filter tab)

**Logic:**

- Export action generates CSV client-side from the already-loaded trade list query result — no new Convex query needed
- Column order matches the visible table columns

---

### 12 Trade Detail — Full UI

Build the trade detail page header and fields with mock data.

**UI:**

- Trade header card — commodity, counterparty, status badge, key terms (quantity, price, delivery, exchange, differential)
- All fields editable (inline edit on click)
- Action buttons: Approve (draft → confirmed), Reject, Upload Document
- Side panel or tab: original source document viewer

---

### 13 Trade Timeline + Document Linking

Build the trade lifecycle view with mock data.

**UI:**

- Trade timeline — vertical timeline showing document arrival and status changes
- Linked documents section — list of documents attached to this trade with type badges
- Status progression visualization: draft → confirmed → in_shipment → delivered → settled
- Each status change logged with timestamp and actor

---

### 14 Trade Approval Logic

Wire trade approval workflow to Convex.

**Logic:**

- Approve button: Convex mutation updates trade status draft → confirmed
- Reject button: Convex mutation updates trade status → cancelled
- Edited fields saved via Convex mutation before approval
- Activity log entries: trade_approved or trade_rejected
- Trade list updates in real-time (Convex reactivity)

---

## Phase 4 — Dashboard

### 15 Dashboard — Full UI

Build the complete dashboard with mock data.

**UI:**

- Setup checklist at top if add-in not installed — "Install the Outlook Add-in to start capturing trades"
- Stat cards: Documents Processed, Trades Captured, Exceptions Flagged, Pending Review, and Straight-Through Rate (Straight-Through Rate card only renders for Layer 2+ users — Layer 1 dashboards show four cards)
- Pending items — documents awaiting review, clickable → document detail
- Recent activity list — last 10 actions with timestamps and action type icons

---

### 16 Dashboard — Real Data

Wire dashboard to Convex queries.

**Logic:**

- Documents Processed — count of documents for current user
- Trades Captured — count of trades for current user
- Exceptions Flagged — count of documents with status: exception (0 until Layer 2)
- Pending Review — count of documents with status: pending_review
- Recent activity — query activity table, last 10, sorted by createdAt desc
- Pending items — query documents where status = pending_review, limit 5
- Straight-Through Rate — percentage of documents with status `auto_cleared` out of all documents processed in the last 30 days: `auto_cleared count / total documents count`. Hidden for Layer 1-only users.
- Setup checklist — shown until user's first document is captured via add-in

---

**Layer 1 ships here. Features 01-16. $99/mo. Complete system of record — all document types captured and linked, full trade lifecycle. Not a teaser. Real users.**

---

## Phase 5 — Validation (Layer 2)

### 17 Rule Engine — Core

Build the deterministic validation engine.

**Logic:**

- Rule engine in `convex/lib/ruleEngine.ts`
- Takes: extracted document data + linked trade data + applicable rules
- Returns: per-field pass/fail with reason
- Each document also receives an overall status: `auto_cleared` (all checks pass, all field confidence ≥ 0.9), `exception` (one or more rule failures), or `needs_review` (checks pass but one or more field confidence < 0.9)
- Only `exception` and `needs_review` documents surface in the Pending Review queue — `auto_cleared` documents post directly to the trade timeline with a system log entry
- Operators: equals, not_equals, greater_than, less_than, within_range, contains
- Tolerance support for numeric comparisons
- Comparison baseline is the linked trade's own contract fields (quantity, price, grade/spec, delivery window) — captured once at trade creation in Layer 1
- Tolerance values and confidence threshold loaded from the user's settings object (Feature 19)
- Rule engine runs automatically after extraction completes (for Layer 2+ users only — tier gated)
- Validation results saved to document record
- Exceptions written to linked trade record

---

### 18 Validation UI

Show validation results on document detail page.

**UI:**

- Each extracted field shows pass/fail indicator
- Failed fields highlighted with red border and exception reason
- Summary badge on document card: "2 exceptions" or "All checks passed"
- Exception details expandable per field
- Exception summary card on dashboard now shows real data
- Documents with status `auto_cleared` show a compact "Auto-cleared" tag instead of the full pass/fail field breakdown — full breakdown still available on click

---

### 19 Tolerance & Threshold Settings

Build the settings page where users adjust tolerance values and the confidence threshold.

**UI:**

- Settings → Validation page
- Per-commodity tolerance settings: quantity tolerance (%), amount tolerance (%) — defaults pre-filled (e.g. 5%), editable
- Single confidence threshold slider (default 0.9) — controls what auto-clears vs. surfaces as needs_review
- No rule builder, no rule list — a small fixed set of tolerance values and one threshold

**Logic:**

- Convex mutation: update user's tolerance/threshold settings (one settings object per user)
- Settings scoped to userId
- Tier gated — Layer 2+ only
- Activity log: settings_updated

---

## Phase 6 — Reconciliation (Layer 3)

### 20 Invoice Reconciliation

Full lifecycle reconciliation from confirmation to invoice.

**Logic:**

- Invoice arrives → extract line items, amounts, references
- Rule engine cross-checks invoice against trade contract, COA, LC, BL
- Quantity chain: trade quantity → BL quantity → invoice quantity — must align within tolerance
- Amount chain: trade price × quantity → LC amount → invoice total — must align
- Exceptions flagged per field with source document reference
- Reconciliation result per chain (quantity chain, amount chain) is one of three outcomes: `clean` (within tight tolerance, posts straight through, no review needed), `within_tolerance` (outside tight tolerance but within the configured acceptable range — posts with a visible note on the trade timeline, non-blocking), or `break` (outside acceptable tolerance — becomes an exception requiring review)
- `within_tolerance` results are visible but non-blocking — they inform the trade finance lead without demanding action
- Vendor invoices (from inspection companies, surveyors, freight forwarders) are a separate invoice sub-type, distinguished by sender/issuer rather than a new documentType — classification step should detect "vendor invoice" vs. "customer invoice" pattern and tag accordingly
- Vendor invoices matched against the shipment they reference (by vessel name, BL number, or date proximity — same matching logic as Feature 08's document linking)
- Match validates: vendor invoice amount within expected range for that service type, invoice references a valid shipment/trade in the system
- Unmatched or out-of-range vendor invoices flagged as exceptions, same UI pattern as customer-side reconciliation exceptions
- Tier gated — Layer 3+ only

---

### 21 Counterparty Intelligence

Basic counterparty risk signals from public data.

**Logic:**

- Convex action calls OpenSanctions API (https://api.opensanctions.org) with counterparty name on trade creation/update
- Match results stored on trade record: matched entity name, list source (OFAC/EU/UN/UK), match confidence
- No match → counterparty marked "Clear" on trade detail page
- Match found → counterparty marked with a warning tag, full match detail expandable
- Re-check on a schedule (e.g. weekly) for trades still in_shipment or confirmed status, since sanctions lists update independently of trade state
- Tier gated — Layer 3+ only

---

### 22 Market Position — Unrealised P&L

Show live market price vs. contract price per trade, with unrealised gain/loss.

**UI:**

- Market Position card on trade detail page: Contract Locked (price from trade record) vs. Market Now (live price)
- Unrealised gain/loss calculated and displayed: `(market price - contract price) × quantity`
- Color-coded per existing signal tokens — gain uses signal-pass, loss uses signal-fail
- If no live price source configured for that commodity, show manual price input field instead (fallback mode)

**Logic:**

- Convex action fetches current price for the trade's commodity from Nasdaq Data Link (ICE No.11 sugar, CBOT wheat, NYMEX crude — confirm exact dataset codes before implementation)
- Price fetched on trade detail page load, cached for a short interval (e.g. 15 min) to avoid excessive API calls
- Fallback: if commodity has no mapped price feed, allow manual entry of current market price, store with a timestamp, calculate unrealised P&L from that manual value
- Tier gated — Layer 3+ only

---

### 23 Vessel Tracking

Embedded Marine Traffic map on trade detail page for shipments in transit.

**UI:**

- Marine Traffic iframe embed on trade detail page
- Shows vessel position when BL vessel name is available
- Tier gated — Layer 3+ only

---

### 24 Trade Brief

On-demand Claude-generated summary of a trade's current state, synthesizing vessel position, market position, and counterparty risk into one paragraph.

**UI:**

- "Generate Trade Brief" button on trade detail page (Layer 3+ only)
- Output rendered as a short paragraph in `--font-display` (Newsreader italic), matching the editorial accent style already defined in ui-tokens.md
- Regeneration allowed — not cached permanently, since underlying data (market price, vessel position) changes over time

**Logic:**

- Convex action gathers: trade core fields, latest vessel position (Feature 23), latest market position (Feature 22), counterparty screening result (Feature 21)
- Single Claude API call, temperature 0, system prompt instructs Claude to synthesize the above into a 2-4 sentence brief in the style already shown on the marketing site (factual, no speculation, cites concrete numbers)
- Never invent data not present in the gathered fields — same "never invent data" rule as all other extraction prompts in this codebase
- Tier gated — Layer 3+ only

---

### 25 Draft Provisional Invoice

Generate a draft provisional invoice from trade data, for the trade finance lead to review and send.

**UI:**

- "Generate Provisional Invoice" button on trade detail page (Layer 3+ only), available once trade status is `confirmed` or later
- Draft rendered as an editable document preview — line items, amounts, references all editable before export
- "Download" action exports as PDF

**Logic:**

- Convex action gathers trade core fields (commodity, quantity, price, counterparty, delivery terms) and any linked BL/COA data already in the system
- Single Claude API call, temperature 0, drafts line items and totals from the gathered structured data only — never invent figures not present in the source trade/document records
- Output stored as a draft on the trade record, editable, not auto-sent anywhere
- PDF generation — confirm available library/approach before implementation; do not add a new dependency without first updating the approved dependencies list in code-standards.md
- Tier gated — Layer 3+ only

---

### 26 Draft Outbound Email

Generate a draft email from trade data — confirming terms, chasing a missing document, or updating a counterparty on status — for the user to review and send themselves.

**UI:**

- "Draft Email" button on trade detail page (Layer 3+ only)
- Small picker for email type: Confirm terms / Chase missing document / Status update
- Draft rendered as editable text in a modal — subject + body, fully editable before the user copies it or opens it in their own mail client
- No send capability inside CommodityOps — the user copies the draft or it opens a pre-filled `mailto:` link

**Logic:**

- Convex action gathers trade core fields, linked document data (which documents are present vs. missing, for the "chase missing document" type), and current trade status
- Single Claude API call, temperature 0, drafts subject + body from the gathered structured data only — never invent figures, counterparty names, or document references not present in the source trade/document records
- Three system prompt variants matching the three email types, selected by the UI picker
- Tier gated — Layer 3+ only

---

## Feature Count

| Phase                           | Features |
| ------------------------------- | -------- |
| Phase 0 — Test Data             | —        |
| Phase 1 — Foundation            | 5        |
| Phase 2 — Document Ingestion    | 5        |
| Phase 3 — Trades                | 4        |
| Phase 4 — Dashboard             | 2        |
| Phase 5 — Validation (Layer 2)  | 3        |
| Phase 6 — Reconciliation (Layer 3) | 7     |
| **Total**                       | **26**   |