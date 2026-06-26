# Architecture

## Stack

| Layer              | Tool                              | Purpose                                              |
| ------------------ | --------------------------------- | ---------------------------------------------------- |
| Framework          | Next.js 15 (App Router)           | Full stack framework                                 |
| Language           | TypeScript strict                 | Throughout                                           |
| Auth               | Clerk                             | Authentication, user management                      |
| Billing            | Clerk Billing (Beta)              | Subscriptions, checkout, customer portal             |
| Database           | Convex                            | Real-time database, file storage, server functions   |
| AI extraction      | Claude API (Sonnet)               | Document classification, field extraction — data entry into the system |
| Rule engine        | Custom TypeScript                 | Deterministic validation — never AI                  |
| Outlook Add-in     | Office.js (ReadItem)              | One-click document capture from Outlook              |
| Styling            | Tailwind CSS v4                   | Utility-first styling with design tokens             |
| UI components      | shadcn/ui                         | Base component primitives                            |
| Deployment         | Vercel                            | Hosting, edge functions                              |

---

## Folder Structure
```
/
├── AGENTS.md
├── addin/
│   ├── index.html                             → Add-in panel UI
│   ├── commands.js                            → Office.js logic (read email, send to API)
│   └── manifest.json                          → Office Add-in manifest
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── build-plan.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                              → Root layout, Clerk provider, fonts
│   ├── page.tsx                                → Marketing homepage (static)
│   ├── pricing/
│   │   └── page.tsx                           → Clerk <PricingTable />
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── [[...login]]/page.tsx          → Clerk sign-in
│   │   └── signup/
│   │       └── [[...signup]]/page.tsx         → Clerk sign-up
│   ├── (app)/
│   │   ├── layout.tsx                         → App shell — navbar, auth gate
│   │   ├── dashboard/
│   │   │   └── page.tsx                       → Main dashboard
│   │   ├── trades/
│   │   │   ├── page.tsx                       → Trade list
│   │   │   └── [id]/
│   │   │       └── page.tsx                   → Trade detail
│   │   ├── documents/
│   │   │   ├── page.tsx                       → Document inbox + upload
│   │   │   └── [id]/
│   │   │       └── page.tsx                   → Document detail
│   │   └── settings/
│   │       ├── page.tsx                       → General settings
│   │       ├── add-in/
│   │       │   └── page.tsx                   → Add-in installation instructions
│   │       ├── validation/
│   │       │   └── page.tsx                   → Tolerance and confidence threshold settings
│   │       └── billing/
│   │           └── page.tsx                   → Clerk Customer Portal redirect
│   └── api/
│       └── ingest/
│           └── route.ts                       → Receives email data from Outlook Add-in
├── convex/
│   ├── schema.ts                              → Convex schema definition
│   ├── documents.ts                           → Document mutations and queries
│   ├── trades.ts                              → Trade mutations and queries
│   ├── userSettings.ts                        → Tolerance and confidence threshold queries and mutations
│   ├── activity.ts                            → Activity log mutations and queries
│   ├── _generated/                            → Convex auto-generated types
│   └── lib/
│       ├── extraction.ts                      → Claude AI extraction logic
│       ├── classifier.ts                      → Document type classification
│       ├── ruleEngine.ts                      → Deterministic validation engine
│       └── types.ts                           → Shared Convex types
├── components/
│   ├── ui/                                    → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── AppShell.tsx
│   │   └── SetupChecklist.tsx
│   ├── dashboard/
│   │   ├── StatsBar.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── PendingItems.tsx
│   │   └── ExceptionSummary.tsx
│   ├── documents/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentViewer.tsx
│   │   └── ExtractionPanel.tsx
│   ├── trades/
│   │   ├── TradeList.tsx
│   │   ├── TradeCard.tsx
│   │   ├── TradeTimeline.tsx
│   │   └── TradeActions.tsx
│   ├── settings/
│   │   ├── AddInSetup.tsx
│   │   └── ValidationSettings.tsx
│   └── billing/
│       └── TierGate.tsx                       → Feature gate wrapper — checks plan, shows upgrade prompt
├── lib/
│   ├── claude.ts                              → Claude API client
│   ├── utils.ts                               → Shared utilities
│   └── constants.ts                           → App constants, document types, trade statuses
├── types/
│   └── index.ts                               → Global TypeScript types
└── public/
└── assets/                                → Static assets from marketing site
```

---

## System Boundaries

| Folder        | Owns                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------- |
| `app/`        | Pages and API routes only. No business logic.                                               |
| `convex/`     | All database logic, mutations, queries, and server-side processing (extraction, validation). |
| `components/` | UI only. No direct DB calls — uses Convex hooks (`useQuery`, `useMutation`).                |
| `lib/`        | Third party API clients (Claude) and shared utilities.                                      |
| `types/`      | TypeScript types shared across the project.                                                 |

---

## Data Flow

### Outlook Add-in Capture

```
User clicks CommodityOps button on an email in Outlook
        ↓
Office.js reads email subject, sender, body, attachments (ReadItem — this email only)
        ↓
Add-in POST /api/ingest with auth token + email content + attachments
        ↓
API route validates token, identifies user
        ↓
Convex action: store attachments, classify document type, extract via Claude
        ↓
Document record created with source: add-in, status: pending_review
        ↓
If trade_confirmation → Trade record auto-created with status: draft
        ↓
Activity log entry written
```

### Document Upload (Manual Fallback)
```
User drags PDF or image into Documents page
↓
Convex mutation stores file in Convex file storage
↓
Same pipeline: classify → extract → document record
↓
If trade_confirmation → Trade record auto-created
↓
Activity log entry written
```

### Trade Approval
```
User reviews extracted trade data on trade detail page
↓
User edits fields if needed
↓
User clicks Approve
↓
Convex mutation updates trade status: draft → confirmed
↓
Activity log entry written
```

### Document Validation (Layer 2)
```
COA document arrives for an existing trade
↓
Claude AI extracts grade, specs, test results
↓
Rule engine loads rules for this commodity type
↓
Rule engine compares extracted fields against contract terms
↓
Exceptions created for any mismatches
↓
Document card shows pass/fail with specific field highlights
```

### Subscription Upgrade
```
User clicks plan on <PricingTable /> or upgrade prompt
↓
Clerk Billing handles checkout (Stripe under the hood)
↓
Subscription status auto-synced to Clerk user object
↓
Feature gates read user.subscription.plan — no DB sync needed
↓
Convex functions check tier via Clerk user identity
```

---

## Convex Schema

### `documents`

| Field            | Type               | Notes                                                                       |
| ---------------- | ------------------ | --------------------------------------------------------------------------- |
| userId           | string             | Clerk user ID                                                               |
| fileName         | string             | Original filename or email subject                                          |
| fileId           | Id<"_storage">     | Convex file storage reference                                               |
| fileType         | string             | MIME type                                                                   |
| documentType     | string             | trade_confirmation, coa, letter_of_credit, bill_of_lading, invoice, unknown |
| extractedData    | object (any)       | Structured JSON from Claude extraction                                      |
| validationResult | object (optional)  | Rule engine output — pass/fail per field (Layer 2)                          |
| validationStatus | string (optional)  | auto_cleared, exception, or needs_review (Layer 2)                          |
| tradeId          | Id<"trades"> (opt) | Linked trade if applicable                                                  |
| status           | string             | pending_review, approved, rejected, exception                               |
| source           | string             | addin, upload                                                               |
| emailMessageId   | string (optional)  | Original email message ID for deduplication                                  |
| createdAt        | number             | Timestamp                                                                   |

### `trades`

| Field           | Type                 | Notes                                                        |
| --------------- | -------------------- | ------------------------------------------------------------ |
| userId          | string               | Clerk user ID                                                |
| commodity       | string               | e.g. Refined Sugar, Crude Oil, Wheat                         |
| counterparty    | string               | Trading counterparty name                                    |
| quantity        | string               | Amount + unit (e.g. "2,000 MT")                              |
| price           | string               | Price terms                                                  |
| deliveryTerms   | string               | Incoterms (e.g. FOB, CIF)                                   |
| contractMonth   | string               | Delivery month                                               |
| exchange        | string               | Reference exchange (e.g. ICE Refined No. 5)                  |
| differential    | string               | Premium/discount                                             |
| status          | string               | draft, confirmed, in_shipment, delivered, settled, cancelled |
| documentIds     | Id<"documents">[]    | All linked documents                                         |
| exceptions      | object[] (optional)  | Active exceptions from rule engine (Layer 2)                 |
| createdAt       | number               | Timestamp                                                    |
| updatedAt       | number               | Timestamp                                                    |

### `userSettings`

| Field                      | Type    | Notes                                            |
| -------------------------- | ------- | ------------------------------------------------- |
| userId                     | string  | Clerk user ID                                     |
| quantityTolerancePercent   | number  | Acceptable quantity deviation, e.g. 5             |
| amountTolerancePercent     | number  | Acceptable amount deviation, e.g. 5               |
| confidenceThreshold        | number  | Default 0.9 — controls auto_cleared vs needs_review |
| createdAt                  | number  | Timestamp                                         |
| updatedAt                  | number  | Timestamp                                         |

### `activity`

| Field      | Type   | Notes                                                                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| userId     | string | Clerk user ID                                                                                                                                  |
| action     | string | document_uploaded, document_captured, document_classified, trade_created, trade_approved, trade_rejected, exception_flagged, settings_updated |
| entityType | string | document, trade, settings                                                                                                                  |
| entityId   | string | ID of the related record                                                                                                                       |
| details    | string | Human-readable description                                                                                                                     |
| createdAt  | number | Timestamp                                                                                                                                      |

---

## Convex File Storage

| Purpose         | Storage            | Contents                 |
| --------------- | ------------------ | ------------------------ |
| Trade documents | Convex file storage | PDFs, images, .eml files |

Access: authenticated users only, own files only (enforced in Convex queries/mutations).

---

## Authentication

- Provider: Clerk
- Methods: Google OAuth, Microsoft OAuth, Email (magic link or password)
- Protected routes: everything under `/(app)/`
- Public routes: `/`, `/pricing`, `/login`, `/signup`, `/api/ingest`
- Clerk middleware protects app routes
- On login → redirect to /dashboard
- Clerk `userId` used as the foreign key in all Convex tables

---

## Convex Client Pattern

```typescript
// Client component — React hooks
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const trades = useQuery(api.trades.list);
const createTrade = useMutation(api.trades.create);
```

```typescript
// Convex server function (action) — for external API calls
import { action } from "./_generated/server";
import { v } from "convex-values";

export const extractDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Read document from DB
    // Call Claude API
    // Write extracted data back
  },
});
```

---

## Claude API Pattern

```typescript
// lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Document classification
export async function classifyDocument(text: string): Promise<DocumentType> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{ role: "user", content: `Classify this commodity trade document...` }],
  });
  // parse response
}

// Field extraction — different prompts per document type
export async function extractTradeConfirmation(text: string): Promise<TradeData> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: `Extract structured trade data...` }],
  });
  // parse JSON response
}
```

---

## Outlook Add-in Pattern

The Outlook Add-in is a small web app hosted at addin.commodityops.com.
It uses Office.js to read the currently open email.

```javascript
// Read single email
Office.context.mailbox.item.body.getAsync(
  Office.CoercionType.Text,
  function (result) {
    const emailBody = result.value;
    const subject = Office.context.mailbox.item.subject;
    const sender = Office.context.mailbox.item.from.emailAddress;
    // POST to /api/ingest
  }
);

// Read multiple selected emails (batch mode)
Office.context.mailbox.getSelectedItemsAsync(function (result) {
  const emails = result.value;
  // POST all to /api/ingest in one batch
});

// Get attachments
Office.context.mailbox.item.getAttachmentsAsync(function (result) {
  // Download each, include in POST
});
```

Permission: ReadItem — reads only the email(s) the user selected. Never the inbox.
No OAuth tokens stored. No polling. No cron jobs.

---

## Invariants

- CommodityOps is a system of record, not an extraction agent. The trade lifecycle system is the product. Extraction is just how data enters. If Claude Code is spending more effort on extraction prompts than on trade management, the priorities are wrong.
- Convex mutations and queries always filter by `userId` — never query without user scope.
- Claude AI handles extraction only — all compliance/validation verdicts come from the deterministic rule engine. Never use AI for pass/fail decisions.
- Components never call Claude API directly — all AI calls happen in Convex actions.
- Components never write to DB directly — all writes go through Convex mutations.
- Document extraction always returns structured data — never return empty. If extraction fails, return fields with empty values and flag for manual review.
- Every user action is logged to the activity table — no silent mutations.
- Trade status transitions are enforced: draft → confirmed → in_shipment → delivered → settled. No skipping steps.
- File storage uses Convex built-in storage — never write files to disk or use external storage.
- All environment variables are in `.env.local` — never hardcode keys.
- Design tokens come from the index.html design system — never use raw Tailwind color classes or invent new colors.
- The Outlook Add-in only reads emails the user explicitly selects — never the inbox. ReadItem is the only permission.
- Tier checks use Clerk's `user.subscription.plan` — never store subscription state in Convex.
- Feature gating enforced in Convex mutations, not UI only — UI gates are cosmetic, server gates are real.
- Check active subscription status before processing — reject if no active plan.
- `/api/ingest` is excluded from Clerk middleware protection — it authenticates via Bearer token in the request header, not session cookie. The route handler validates the token manually before processing.