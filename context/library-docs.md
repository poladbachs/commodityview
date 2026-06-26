# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to CommodityOps.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## Convex

**Check first:** Check AGENTS.md for an installed Convex skill. If a Convex MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### React Provider Setup

```typescript
// app/layout.tsx
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

// Convex + Clerk share auth context — one provider wraps both
<ClerkProvider>
  <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>
</ClerkProvider>
```

### Client Usage (React Components)

```typescript
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// Read data — reactive, auto-updates
const documents = useQuery(api.documents.list);

// Write data — call from event handlers
const updateStatus = useMutation(api.documents.updateStatus);
await updateStatus({ documentId, status: "approved" });

// External API call — call from event handlers
const extract = useAction(api.documents.extractDocument);
await extract({ documentId });
```

### Server Functions

```typescript
// convex/documents.ts
import { query, mutation, action } from "./_generated/server";
import { v } from "convex-values";

// Query — deterministic reads only
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Mutation — transactional writes
export const create = mutation({
  args: {
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.db.insert("documents", {
      userId: identity.subject,
      fileName: args.fileName,
      fileId: args.fileId,
      fileType: args.fileType,
      documentType: "unknown",
      status: "pending_review",
      source: "upload",
      createdAt: Date.now(),
    });
  },
});

// Action — side effects, external APIs
export const extractDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Read via internal query
    const doc = await ctx.runQuery(api.documents.getById, {
      documentId: args.documentId,
    });
    // Call Claude API (external)
    const extracted = await classifyAndExtract(doc);
    // Write via internal mutation
    await ctx.runMutation(api.documents.saveExtraction, {
      documentId: args.documentId,
      documentType: extracted.type,
      extractedData: extracted.data,
    });
  },
});
```

### File Storage

```typescript
// Upload file — in a mutation or from client
const fileId = await ctx.storage.store(file);

// Get URL for display
const url = await ctx.storage.getUrl(fileId);
```

### Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex-values";

export default defineSchema({
  documents: defineTable({
    userId: v.string(),
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileType: v.string(),
    documentType: v.string(),
    extractedData: v.optional(v.any()),
    validationResult: v.optional(v.any()),
    validationStatus: v.optional(v.union(
      v.literal("auto_cleared"),
      v.literal("exception"),
      v.literal("needs_review"),
    )),
    tradeId: v.optional(v.id("trades")),
    status: v.string(),
    source: v.string(),
    emailMessageId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_tradeId", ["tradeId"])
    .index("by_emailMessageId", ["emailMessageId"]),

  userSettings: defineTable({
    userId: v.string(),
    quantityTolerancePercent: v.number(),
    amountTolerancePercent: v.number(),
    confidenceThreshold: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // ... other tables follow same pattern
});
```

**Rules:**

- Always scope queries to authenticated user via `ctx.auth.getUserIdentity()`
- Always handle the case where identity is null — throw or redirect
- Use indexes for all frequently queried fields — never scan full tables
- Actions cannot read/write DB directly — always use `ctx.runQuery` / `ctx.runMutation`
- File storage uses Convex built-in `ctx.storage` — never external storage for MVP

---

## Clerk

**Check first:** Check AGENTS.md for an installed Clerk skill.

### Auth in Components

```typescript
// Server Component
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  // user.id is the Clerk userId used everywhere
}

// Client Component
import { useUser } from "@clerk/nextjs";

export function ProfileButton() {
  const { user } = useUser();
  // user.id, user.fullName, user.imageUrl
}
```

### Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/login(.*)",
  "/signup(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Billing — Tier Check

```typescript
// Check user's subscription plan
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
const plan = user?.publicMetadata?.plan;
// plan values: "layer_1" ($99/mo), "layer_2" ($199/mo), "layer_3" ($499/mo), "enterprise" ($2,999/mo)
// no plan → block access, redirect to /pricing
```

**Rules:**

- Clerk `userId` (from `user.id` or `identity.subject` in Convex) is the foreign key everywhere
- Tier checks in UI are cosmetic — always enforce in Convex mutations/queries too
- Never store subscription state in Convex — Clerk is the source of truth
- `<PricingTable />` is a drop-in component — no custom checkout UI

---

## Claude API

**Check first:** Check AGENTS.md for an installed Claude/Anthropic skill.

### Document Classification

```typescript
// lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function classifyDocument(
  text: string,
): Promise<{ type: DocumentType; confidence: number }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    temperature: 0,
    system: `You classify physical commodity trade documents.
Return JSON only: { "type": "...", "confidence": 0.0-1.0 }
Types: trade_confirmation, coa, coq, letter_of_credit, bill_of_lading, invoice, unknown
If unsure, return unknown with low confidence.`,
    messages: [{ role: "user", content: text }],
  });
  return JSON.parse(
    response.content[0].type === "text" ? response.content[0].text : "{}",
  );
}
```

### Trade Confirmation Extraction

```typescript
export async function extractTradeConfirmation(
  text: string,
): Promise<TradeExtractionResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    temperature: 0,
    system: `You extract structured data from physical commodity trade confirmations.
Return JSON only with these fields:
{
  "commodity": "string — full commodity name with origin if stated",
  "counterparty": "string — company name",
  "quantity": "string — amount with unit e.g. 60,000 MT",
  "price": "string — price with currency and unit e.g. USD 432.50/MT",
  "deliveryTerms": "string — incoterms e.g. FOB Santos",
  "contractMonth": "string — delivery period e.g. May 2026",
  "exchange": "string — reference exchange if any e.g. ICE No.5",
  "differential": "string — premium/discount if any e.g. +5",
  "payment": "string — payment terms e.g. LC at sight",
  "confidence": {
    "commodity": 0.0-1.0,
    "counterparty": 0.0-1.0,
    ... per field
  }
}
If a field is not found in the document, set it to null with confidence 0.
Never invent data — only extract what is explicitly stated.`,
    messages: [{ role: "user", content: text }],
  });
  return JSON.parse(
    response.content[0].type === "text" ? response.content[0].text : "{}",
  );
}
```

### Extraction Prompts Per Document Type

| Document Type       | Key Fields                                                          | Max Tokens |
| ------------------- | ------------------------------------------------------------------- | ---------- |
| trade_confirmation  | commodity, counterparty, quantity, price, delivery, exchange, terms  | 1000       |
| coa                 | commodity, grade, parameters (array), lab, date, certificate number | 800        |
| coq                 | commodity, grade, parameters (array — varies by commodity, e.g. moisture/protein/test weight for grains, ICUMSA/colour/pol for sugar), lab, date, certificate number | 800 |
| letter_of_credit    | beneficiary, applicant, amount, currency, expiry, terms, bank       | 800        |
| bill_of_lading      | vessel, port_loading, port_discharge, quantity, dates, shipper      | 800        |
| invoice             | line_items (array), total, currency, references, due_date           | 800        |

### COQ Extraction

```typescript
export async function extractCOQ(
  text: string,
): Promise<COQExtractionResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    temperature: 0,
    system: `You extract structured data from Certificate of Quality (COQ) documents for physical commodity trading.
Return JSON only with these fields:
{
  "commodity": "string — commodity name",
  "grade": "string — quality grade designation",
  "parameters": [{ "name": "string", "value": "string", "unit": "string" }],
  "lab": "string — laboratory or issuing body name",
  "date": "string — certificate date",
  "certificateNumber": "string — certificate reference number",
  "confidence": {
    "commodity": 0.0-1.0,
    "grade": 0.0-1.0,
    "parameters": 0.0-1.0,
    "lab": 0.0-1.0,
    "date": 0.0-1.0,
    "certificateNumber": 0.0-1.0
  }
}
Parameters vary by commodity — e.g. moisture/protein/test weight for grains, ICUMSA/colour/pol for sugar.
If a field is not found, set it to null with confidence 0.
Never invent data — only extract what is explicitly stated.`,
    messages: [{ role: "user", content: text }],
  });
  return JSON.parse(
    response.content[0].type === "text" ? response.content[0].text : "{}",
  );
}
```

**Rules:**

- Model is always `claude-sonnet-4-20250514` — never use other models without updating this file
- Temperature is always `0` for extraction and classification — deterministic results
- Always use `system` prompt for role definition — never inline in user message
- Always parse `response.content[0].text` — even with JSON instruction it returns a string
- Always wrap JSON.parse in try/catch — return fallback empty extraction on parse failure
- Never invent data — if Claude can't find a field, it returns null with confidence 0
- Per-field confidence scores enable the low-confidence UI highlight (amber border on fields below 0.9)

---

## OpenSanctions API

### Counterparty Screening

```typescript
export async function screenCounterparty(
  name: string,
): Promise<{ matched: boolean; matches: SanctionsMatch[] }> {
  const response = await fetch(
    `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}`,
  );
  const data = await response.json();
  // Filter results by relevance score threshold before returning
  return parseOpenSanctionsResponse(data);
}
```

**Rules:**

- Free tier, no API key required for basic search endpoint — confirm current rate limits before relying on it in production
- Called from a Convex action only — never from a query or mutation
- Always handle empty/no-match results as a normal case, not an error
- Store the raw match payload alongside the parsed summary in case manual review is needed later

---

## Nasdaq Data Link (Market Prices)

### Fetch Current Commodity Price

```typescript
export async function fetchCommodityPrice(
  datasetCode: string,
): Promise<{ price: number; date: string } | null> {
  const response = await fetch(
    `https://data.nasdaq.com/api/v3/datasets/${datasetCode}/data.json?rows=1&api_key=${process.env.NASDAQ_DATA_LINK_API_KEY}`,
  );
  if (!response.ok) return null;
  const data = await response.json();
  // Parse latest row — confirm exact response shape against live API before relying on field order
  return parseLatestPriceRow(data);
}
```

**Rules:**

- Free tier available — confirm current dataset codes for ICE No.11 sugar, CBOT wheat, NYMEX crude before implementation, as dataset codes can change
- Called from a Convex action only
- Cache results — do not fetch on every render, only on trade detail page load with a short TTL
- If fetch fails or commodity has no mapped dataset, fall back to manual price entry — never block the page on a failed price fetch

---

## Office.js (Outlook Add-in)

### Reading the Current Email

```javascript
Office.context.mailbox.item.body.getAsync(
  Office.CoercionType.Text,
  function (result) {
    const body = result.value;
    const subject = Office.context.mailbox.item.subject;
    const sender = Office.context.mailbox.item.from.emailAddress;
  }
);
```

### Reading Multiple Selected Emails (Batch)

```javascript
Office.context.mailbox.getSelectedItemsAsync(function (result) {
  const emails = result.value; // array
  // Send all to API in one POST
});
```

### Getting Attachments

```javascript
Office.context.mailbox.item.getAttachmentsAsync(function (result) {
  const attachments = result.value;
  // Each has: name, contentType, content (base64)
});
```

### Manifest

manifest.json defines the add-in: name, description, icon, source URL, permissions.
Permission is ReadItem — only the selected email, never the inbox.

### Distribution

- Sideloading: user loads manifest directly in Outlook settings (for testing and early users)
- AppSource: submit manifest to Microsoft for public listing (takes a few weeks for review)

**Rules:**

- ReadItem only — never request ReadWriteMailbox or other elevated permissions
- Add-in panel is static HTML/JS — no React, no build step, keep it minimal
- All processing happens server-side — add-in just reads and sends
- Auth: include Clerk session token in POST header for user identification
- Never store email content in the add-in — send immediately to API, discard

---

## pdf-parse

### Extract Text from Uploaded Document

```typescript
import pdf from "pdf-parse";

export async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; pages: number }> {
  try {
    const data = await pdf(buffer);
    return { text: data.text, pages: data.numpages };
  } catch (error) {
    console.error("[pdf-parse] extraction failed:", error);
    return { text: "", pages: 0 };
  }
}
```

**Rules:**

- Server-side only — never import in client components
- `data.text` is raw unformatted text — Claude handles structure
- If text is empty (image-based PDF) — flag for manual review, never crash
- Used in Convex actions only — never in queries or mutations

---

## shadcn/ui

### Component Installation

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tooltip
```

### Theming

shadcn/ui components are restyled to match the CommodityOps design system. After installing a component, update its classes to use project tokens from ui-tokens.md — never use shadcn defaults.

**Rules:**

- Install components one at a time as needed — never bulk install
- Always restyle to match CommodityOps design tokens after installing
- shadcn/ui is for primitives only (button, input, dialog) — never use complex shadcn layouts
- Never modify files inside `components/ui/` directly — override via className props or wrapper components
