# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap agent operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 15 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - useState or useReducer
  - useEffect
  - Browser APIs
  - Event listeners
  - Convex hooks (useQuery, useMutation, useAction)
  - Clerk client hooks (useUser, useAuth)
- Never add `"use client"` to layout files unless absolutely required
- Route handlers live in `app/api/` — only for external receivers (Outlook Add-in ingest endpoint)
- Caching is uncached by default — all dynamic code runs at request time
- Always read Next.js documentation before implementing any Next.js specific feature — APIs may differ from training data

---

## Convex Conventions

- All database reads use `useQuery` in client components — never fetch in Server Components directly
- All database writes use `useMutation` or `useAction` in client components
- All Convex functions (queries, mutations, actions) live in `convex/` — never in `app/` or `components/`
- Queries are for reading data — they must be deterministic, no side effects
- Mutations are for writing data — they run transactionally
- Actions are for external API calls (Claude) — they can have side effects but cannot directly read/write DB (must call mutations/queries internally via `ctx.runMutation` / `ctx.runQuery`)
- Every query and mutation must validate `userId` — never return data without user scope
- Schema defined in `convex/schema.ts` using Convex schema builder — never raw SQL

---

## File and Folder Naming

- Folders: kebab-case — `trade-detail`, `email-connection`
- Component files: PascalCase — `StatsBar.tsx`, `TradeCard.tsx`
- Convex files: camelCase — `documents.ts`, `trades.ts`
- Utility files: camelCase — `claude.ts`, `utils.ts`
- Type files: camelCase — `index.ts`
- API route files: always `route.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { TradeCard } from "@/components/trades/TradeCard";
import { api } from "@/convex/_generated/api";

// 3. Type definitions
type Props = {
  tradeId: string;
  status: TradeStatus;
};

// 4. Component
export function ComponentName({ tradeId, status }: Props) {
  // state
  // convex queries/mutations
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md

---

## Convex Functions

```typescript
// convex/documents.ts

import { query, mutation, action } from "./_generated/server";
import { v } from "convex-values";

// Query — read only, deterministic
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    return ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Mutation — write, transactional
export const updateStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    await ctx.db.patch(args.documentId, { status: args.status });
  },
});

// Action — external API calls
export const extractDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.runQuery(/* internal query */);
    // Call Claude API
    // Write results back via ctx.runMutation
  },
});
```

- Every function validates authentication via `ctx.auth.getUserIdentity()`
- Every function scopes data to the authenticated user
- Actions never read/write DB directly — always via `ctx.runQuery` / `ctx.runMutation`

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[convex/documents]`, `[lib/claude]`
- User-facing errors must be human readable — never expose raw error messages
- Convex action errors are caught and returned as structured results — never let actions throw unhandled
- Claude API errors return fallback empty extraction with a flag for manual review — never crash the pipeline

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable                           | Used In                 |
| ---------------------------------- | ----------------------- |
| `CONVEX_DEPLOYMENT`                | Convex client           |
| `NEXT_PUBLIC_CONVEX_URL`           | Convex React provider   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`| Clerk React provider    |
| `CLERK_SECRET_KEY`                 | Clerk server-side       |
| `ANTHROPIC_API_KEY`                | lib/claude.ts           |

`NEXT_PUBLIC_` prefix means the variable is exposed to the browser. Never add `NEXT_PUBLIC_` to secret keys.

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Claude extraction prompts may have brief comments explaining the strategy
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Does Convex already handle this?
4. Is there a simpler native solution?

Approved dependencies for this project:

- `convex` — Database, file storage, server functions
- `@clerk/nextjs` — Authentication and billing
- `@anthropic-ai/sdk` — Claude API
- `zod` — Schema validation
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives
- `pdf-parse` — Extract text from uploaded PDFs

Do not install any other packages without updating this list first.
