# Project Overview

## About the Project

CommodityOps is the system of record where physical commodity trading teams manage every deal from confirmation to settlement. Every trade, every document, every status change, every exception, every approval — managed in one place with a full audit trail.

Data enters the system through a lightweight Outlook Add-in — one click inside any email sends it to CommodityOps. Claude AI classifies and extracts structured fields. A deterministic rule engine runs compliance checks. The ops team reviews, edits, and approves. The trade progresses through its lifecycle: draft → confirmed → in shipment → delivered → settled.

CommodityOps only processes emails the user explicitly sends. No silent inbox reading, no admin consent required, no data minimization concerns.

It is the self-serve equivalent of CommodityAI (YC W24). Same domain — physical commodity trade operations — but no enterprise sales calls, no implementation projects, no "Book a Call" gatekeeping. Sign up, install the add-in, start running your trades in minutes.

## What CommodityOps Is NOT

CommodityOps is not a document extraction agent. Extraction is how data enters the system — it is not the product. Anyone can paste a PDF into ChatGPT and get structured fields for free.

The product is the system where physical commodity trades live from confirmation to settlement. Documents accumulate on trades over time. Status progresses. The rule engine cross-checks documents against contract terms. Exceptions surface automatically. Every action is logged with an audit trail.

If extraction is all we build, we fall into the agent trap — too niche, no moat, easy to copy. The system of record — trade lifecycle, document compliance, operational visibility — is the moat.

## Vision

The future commodity trading firm runs on three people: a trader, an ops lead, and a trade finance lead — backed by AI. CommodityOps is the system they run on.

This is the north star. Layer 1 serves the ops lead today. Layer 2 adds trade finance compliance. Layer 3 connects logistics and counterparty intelligence. Each layer brings CommodityOps closer to being the single system all three roles work from.

---

## The Problem It Solves

Physical commodity trading moves tens of trillions of dollars annually in energy, metals, and agricultural products. Yet the operational backbone — trade confirmations, quality certificates, letters of credit, bills of lading, invoices — is still processed manually through email threads, spreadsheets, and PDF printouts.

Every shipment generates several documents that must be cross-checked against contract terms, regulatory rules, and counterparty data. A single missed clause in a Letter of Credit or a mismatched grade on a Certificate of Analysis can cost a trade desk six figures. Teams hire operations analysts to do this manually — reading emails, copying data into spreadsheets, eyeballing discrepancies. It's slow, error-prone, and doesn't scale.

CommodityOps replaces the spreadsheets and email threads with a proper system. Users send trade emails via a one-click Outlook Add-in, Claude AI classifies and extracts the data, and trades progress through their lifecycle from confirmation to settlement — with documents linking, exceptions surfacing, and a full audit trail at every step.

---

## Pages
```
/                        → Marketing homepage (current index.html, static)
/pricing                 → Public pricing page (Clerk <PricingTable /> component)
/login                   → Auth page (Clerk — Google + Microsoft + Email)
/dashboard               → Overview — stats, recent activity, pending items
/trades                  → Trade list — all captured trades with status
/trades/[id]             → Individual trade detail — documents, timeline, actions
/documents               → Document inbox — all ingested documents + manual upload
/documents/[id]          → Individual document detail — extracted data, validation
/settings                → Account settings, add-in setup, rules config
/settings/add-in         → Add-in installation instructions and status
/settings/rules          → Custom validation rules editor
/settings/billing        → Clerk Customer Portal redirect
```

---

## Navigation

Top navbar. Clean and minimal. Four navigation items:

```
Dashboard    Trades    Documents    Settings
```

Full width layout on all pages. No sidebar.

---

## Core User Flow

### Homepage

- Current marketing site (index.html) — hero, features, pricing, footer
- CTA → /login

### Onboarding

- User signs up via Clerk (Google OAuth, Microsoft OAuth, or email)
- On login → redirect to /dashboard
- Dashboard shows setup checklist prompting add-in installation

### Outlook Add-in

- User goes to Settings → Add-in
- Clicks download link or installs from Microsoft AppSource
- Add-in appears as a button in their Outlook toolbar
- Single mode: click on an email → click CommodityOps button → preview panel shows extraction → confirm
- Batch mode: select multiple emails → click CommodityOps button → all sent to CommodityOps → appear in dashboard
- No OAuth, no admin consent, no inbox access

### Document Ingestion

Two entry points, one pipeline:

**Outlook Add-in (primary):**
- User clicks CommodityOps button on an email in Outlook
- Add-in reads the email content and attachments via Office.js (ReadItem permission — current email only)
- Sends data to CommodityOps API
- Single mode: preview extraction in Outlook side panel before confirming
- Batch mode: select multiple emails, send all at once, review in dashboard

**Upload (secondary — manual fallback):**
- User drags a PDF or image into the Documents page
- Same extraction pipeline runs

Both paths produce the same result:
- Document classified by type: trade_confirmation, coa, letter_of_credit, bill_of_lading, invoice, unknown
- Claude AI extracts structured fields based on document type
- Document record created with status: pending_review

### Trade Capture (Layer 1)

- When a trade confirmation is processed, a trade record is created automatically
- Trade card shows: commodity, counterparty, quantity, price, delivery terms, contract month, exchange, differential
- Side-by-side view: original document on left, extracted structured data on right
- User can edit any extracted field before approving
- Approve → trade status moves to confirmed
- Reject → trade flagged for manual handling
- Other document types (COA, LC, BL, invoice) attach to existing trade records over time

### Document Validation (Layer 2)

- COA arrives → Claude extracts grade, specs, test results
- Rule engine checks COA specs against contract terms (e.g. Max 45 ICUMSA for refined sugar)
- Mismatches flagged as exceptions with specific field highlighted
- LC arrives → Claude extracts terms, amounts, dates, beneficiary
- Rule engine checks LC terms against trade contract
- BL arrives → Claude extracts vessel, port, quantity, dates
- Rule engine cross-references BL against trade and LC

### Validation Rule Engine

- Deterministic — never AI for compliance verdicts
- Rules defined per commodity type and document type
- Example rules:
  - COA grade must match contract grade
  - LC amount must be within 5% of contract value
  - BL quantity must match trade quantity ± tolerance
  - Delivery date must fall within contract window
- Users can add custom rules in Settings → Rules
- Rule violations surface as exceptions on the document card

### Dashboard

- Stats bar: Documents Processed, Trades Captured, Exceptions Flagged, Pending Review
- Recent activity feed — last 10 actions
- Pending items — documents awaiting review
- Exception summary — open exceptions by type
- Setup checklist if add-in not yet installed

---

## Billing

- Clerk Billing manages all subscriptions — no direct Stripe integration
- Plans configured in Clerk Dashboard, rendered via `<PricingTable />` component
- Clerk Customer Portal for managing subscription (cancel, update card, invoices)
- Four tiers enforced by feature gating:
  - **Layer 1 — Trade Capture**: $99/mo — trade lifecycle system of record, all document types captured and linked (trade confirmation, COA, LC, BL, invoice), full trade timeline, audit trail
  - **Layer 2 — Compliance**: $199/mo — full deterministic rule engine, COA/LC/BL cross-validation against contract terms, per-field exception flagging, custom rules editor
  - **Layer 3 — Connected Intelligence**: $499/mo — invoice reconciliation across full trade lifecycle, counterparty risk screening, vessel tracking
  - **Enterprise**: $2,999/mo — API access for CTRM integration, custom rule templates, dedicated support
- Tier checked via `user.subscription.plan` — no separate subscriptions table
- Upgrade prompts shown when user hits tier limit or accesses gated feature

---

## Data Architecture

### Documents

- Every ingested file (from email or upload) becomes a document record
- Raw file stored in Convex file storage
- Extracted data stored as structured JSON
- Linked to a trade record when applicable

### Trades

- Created when a trade confirmation is processed
- Accumulates linked documents over its lifecycle (confirmation → COA → LC → BL → invoice)
- Status progresses: draft → confirmed → in_shipment → delivered → settled

### Rules

- User-defined validation rules per workspace
- Applied deterministically — never by AI
- Stored as structured rule definitions, not code

---

## Trade Lifecycle

The trade lifecycle is not a separate feature — it is the backbone that everything else plugs into. Compliance, vessel tracking, reconciliation, counterparty intel are all things that happen at different points along one trade's timeline. They live inside the trade, not next to it.

Example — one sugar trade flowing through CommodityOps:

1. **Draft** — trade confirmation email arrives via Outlook Add-in, CommodityOps captures deal terms (commodity, counterparty, quantity, price, exchange, differential)
2. **Confirmed** — ops reviews the extracted data, edits if needed, approves. Trade is now official in the system.
3. **In Shipment** — BL arrives, vessel name extracted, Marine Traffic shows cargo position (vessel tracking). COA arrives, rule engine checks grade against contract — "ICUMSA 60 but contract says Max 45" → exception flagged (compliance).
4. **Delivered** — BL confirms arrival at destination port.
5. **Settled** — invoice arrives, system checks amounts against contract and LC terms (reconciliation). Counterparty intel shows risk signals about the counterparty on the trade detail page.

One system. One trade page. Features activate as documents arrive and the trade progresses through its lifecycle.

---

## Features In Scope (Layer 1 — $99/mo — Launch)

Layer 1 is a complete system of record. Not a teaser. Every document type captured, extracted, and linked to trades. Full trade lifecycle. Full audit trail.

- Marketing homepage (existing index.html)
- Public pricing page with Clerk `<PricingTable />`
- Clerk authentication (Google OAuth + Microsoft OAuth + email)
- Clerk Billing (paid plans)
- Outlook Add-in for one-click document capture from Outlook (single + batch)
- Manual document upload (PDF, images) as fallback
- Document classification via Claude AI — all types: trade_confirmation, coa, letter_of_credit, bill_of_lading, invoice, unknown
- Document extraction via Claude AI — structured fields per document type
- Document inbox page with status filters
- Document detail page — side-by-side original file + extracted data
- Editable extracted fields before approval
- All document types (COA, LC, BL, invoice) captured, extracted, and linked to trades — documents accumulate on the trade timeline as they arrive
- Trade list page with status filters
- Trade detail page — trade card, linked documents, full timeline
- Approve / Reject workflow
- Activity log — all actions tracked
- Dashboard with stats, recent activity, pending items
- Settings page with add-in installation instructions

**What Layer 1 does NOT include:** rule engine does not run, no cross-validation, no exception flagging. Documents land on trades and are visible — but nothing checks them against each other automatically. That is Layer 2.

## Features In Scope (Layer 2 — $199/mo)

Layer 2 is where the manual cross-checking work gets automated. The rule engine runs. Documents get validated against contract terms. Exceptions surface automatically.

- Full deterministic rule engine (COA, LC, BL cross-validated against trade contract terms)
- COA: grade, specs, test results checked against contract commodity specs
- LC: amount, currency, terms, expiry checked against trade contract
- BL: vessel, port, quantity, dates cross-referenced against trade and LC
- Per-field pass/fail with exception reason
- Custom validation rules editor in Settings → Rules
- Exception summary on dashboard — open exceptions by type
- Exception badge on document cards and trade timeline

## Features In Scope (Layer 3 — $499/mo)

- Invoice reconciliation — quantity chain and amount chain validated across full trade lifecycle
- Counterparty intelligence — public risk signals surfaced on trade detail page
- Multi-commodity rule templates
- Vessel tracking via Marine Traffic embed on trade detail page

## Features In Scope (Enterprise — $2,999/mo)

- API access for CTRM integration
- Custom rule templates
- Dedicated support

---

## Features Out of Scope

- CTRM/ERP direct integration — not in Layer 1
- Futures & pricing execution — not self-serve viable
- SSO / SAML — enterprise feature, not Layer 1
- SOC 2 compliance — premature for solo founder
- Custom billing UI — Clerk handles checkout, invoices, portal
- Direct Stripe integration — Clerk Billing wraps Stripe
- Mobile app
- Multi-language document support — English only for Layer 1
- Real-time collaboration — single user per workspace for Layer 1
- Team workspaces with role-based access — Layer 3 or Enterprise
- Silent inbox reading — by design, CommodityOps only processes emails the user explicitly sends
- Gmail inbox integration — ingestion is via Outlook Add-in only, not inbox reading

---

## Target User

An operations analyst, trade ops manager, or trader at a small-to-mid-size commodity trading firm who:

- Processes trade documents manually today (email → spreadsheet)
- Handles 10-100+ trades per month across energy, metals, or agriculture
- Wants to eliminate copy-paste data entry from documents
- Needs an audit trail without building one manually
- Does not have budget or patience for a 6-month enterprise implementation
- Wants to install an add-in and start capturing trades in minutes, not months
- Needs a proper system to manage trade lifecycle — not just an AI that reads PDFs

---

## Success Criteria

- User can sign up, install the Outlook Add-in, and see their first trade captured in under 5 minutes
- Users manage their active trades through CommodityOps instead of spreadsheets within the first week
- Trade lifecycle works end-to-end: draft → confirmed → in_shipment → delivered → settled
- Document → trade linking works correctly — documents accumulate on trades over time
- Claude AI extraction accuracy is high enough that users edit < 20% of fields
- Validation rules catch real exceptions (grade mismatch, amount deviation) in Layer 2
- Dashboard shows meaningful operational metrics after a week of use
- The product feels like a system built for commodity trading, not a generic document processing tool