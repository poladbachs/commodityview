# UI Rules

Concise rules for building CommodityOps UI. The design system is defined in index.html — use it as the source of truth for visual decisions. These rules cover the most important patterns and constraints to keep the UI consistent without over-specifying every detail.

---

## Fonts

Always import Inter Tight, JetBrains Mono, and Newsreader via `next/font/google` in the root layout.

```typescript
import { Inter_Tight, JetBrains_Mono, Newsreader } from "next/font/google";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["italic"],
  weight: ["400", "500"],
});
```

Apply all three variable classes to the `<html>` tag in root layout. Set `font-feature-settings: "ss01", "cv11", "tnum"` on the root surface element. Never use system fonts as the primary font.

**Font roles:**

- `--font-ui` (Inter Tight) — all UI text: headings, body, buttons, nav
- `--font-mono` (JetBrains Mono) — data values, labels, tags, eyebrows, inputs, extracted fields
- `--font-display` (Newsreader) — editorial accents, italic callouts (used sparingly)

---

## Layout

- Page max-width: 1200px, centered
- Main content area padding: 32px on sides, 48px top
- Gap between page sections: 24px
- Header height: 48px, full width, `bg-bg` background, `border-bottom: 1px solid var(--line)`
- All pages use top navbar only — no sidebar, no drawer

---

## Navbar

Four nav items: Dashboard, Trades, Documents, Settings.

- Active item: `color: var(--fg)`, font-weight 500, 13px
- Inactive item: `color: var(--fg-3)`, font-weight 500, 13px
- No underline — active state is color change only
- Navbar uses `bg-bg` background, full viewport width
- Logo on left: logo mark (28x28) + "CommodityOps" in `--font-ui`, 14px, weight 600
- User avatar on right from Clerk

---

## Cards

Every content section lives in a card.

```
background: var(--bg-2)
border: 1px solid var(--line)
border-radius: var(--radius-md)  →  4px
padding: 16-24px
box-shadow: var(--shadow-card)
```

Never use colored card backgrounds — always `bg-bg-2`. Color goes inside cards via tags, dots, and text, never on the card surface itself.

---

## Typography Hierarchy

Three levels used consistently throughout:

**Section headings** — card titles, page section titles

```
font-family: var(--font-ui)
font-size: 16px
font-weight: 600
color: var(--fg)
line-height: 24px
letter-spacing: -0.01em
```

**Body / primary content text**

```
font-family: var(--font-ui)
font-size: 14px
font-weight: 400-500
color: var(--fg)
line-height: 20px
```

**Labels / eyebrows / muted text**

```
font-family: var(--font-mono)
font-size: 10.5px
letter-spacing: 0.1-0.12em
text-transform: uppercase
color: var(--fg-3)
line-height: 16px
```

Data values (quantities, prices, percentages) use `--font-mono` at 13px.

---

## Tags / Badges

All tags use `border-radius: var(--radius-pill)` (pill shape).

```
font-family: var(--font-mono)
font-size: 10.5px
letter-spacing: 0.08em
text-transform: uppercase
padding: 3px 8px
border: 1px solid var(--line)
color: var(--fg-2)
```

Signal variants (amber, pass, fail, info, warn) change text color and border color only — never add background fills to tags.

---

## Buttons

**Default (outlined):**

```
background: transparent
border: 1px solid var(--line)
color: var(--fg)
border-radius: var(--radius-sm)  →  2px
padding: 10px 16px
font-size: 13px
font-weight: 500
letter-spacing: 0.02em
```

**Primary (filled):**

```
background: var(--fg)
color: var(--bg)
border: 1px solid var(--fg)
```

**Approve:**

```
background: var(--signal-pass)
color: oklch(15% 0.05 145)
border: 1px solid var(--signal-pass)
```

**Reject (outlined):**

```
background: transparent
color: var(--signal-fail)
border: 1px solid color-mix(in oklch, var(--signal-fail) 50%, var(--line))
```

---

## Form Inputs

```
font-family: var(--font-mono)
font-size: 13px
background: var(--bg)
border: 1px solid var(--line)
color: var(--fg)
padding: 9px 12px
border-radius: var(--radius-sm)  →  2px
placeholder color: var(--fg-3)
focus: outline 1px solid var(--signal-amber), border-color var(--signal-amber)
```

**Low confidence fields** (extraction confidence < 0.9):

```
background: color-mix(in oklch, var(--signal-warn) 10%, var(--bg))
border-color: color-mix(in oklch, var(--signal-warn) 50%, var(--line))
```

---

## Tables (Trade List, Document Inbox)

- No alternating row colors — `bg-bg-2` rows, separated by border
- Row border: `1px solid var(--line)` between rows
- Column headers: `--font-mono`, uppercase, 10.5px, letter-spacing 0.1em, color `var(--fg-3)`
- Row text: `--font-ui`, 14px, color `var(--fg)`
- Data columns (quantity, price): `--font-mono`, 13px, `font-variant-numeric: tabular-nums`
- Hover state: `background: var(--bg-3)`
- Clickable rows show `cursor: pointer`

---

## Status Dots

Small colored dots used in activity feeds and trade timelines.

```
width: 6px
height: 6px
border-radius: 50%
```

| Type    | Color               | Extra                                                                |
| ------- | ------------------- | -------------------------------------------------------------------- |
| default | `var(--fg-3)`       | —                                                                    |
| amber   | `var(--signal-amber)` | `box-shadow: 0 0 0 3px color-mix(in oklch, var(--signal-amber) 25%, transparent)` |
| pass    | `var(--signal-pass)` | —                                                                   |
| fail    | `var(--signal-fail)` | —                                                                   |

---

## Activity Feed

Each activity entry shows:

- Status dot (colored by actor type)
- Timestamp in `--font-mono`, 12px, `var(--fg-4)`
- Actor name in `--font-mono`, 12px, uppercase, `var(--fg-3)`
- Action description in `--font-ui`, 13px, `var(--fg)`
- Result/detail in `--font-ui`, 13px, `var(--fg-2)`

Actor type dot colors:

| Actor       | Dot Color            |
| ----------- | -------------------- |
| AI (Claude) | `var(--signal-info)` |
| Rule Engine | `var(--signal-amber)`|
| Human       | `var(--signal-pass)` |
| System      | `var(--fg-3)`        |

---

## Document Detail — Side by Side

Left panel: original document viewer (PDF embed or image)
Right panel: extracted data as labeled key-value pairs

```
Left panel: 55% width, bg-bg, border-right 1px solid var(--line)
Right panel: 45% width, bg-bg-2, padding 24px
```

Each extracted field:

```
Label: --font-mono, 10.5px, uppercase, var(--fg-3), letter-spacing 0.1em
Value: --font-mono, 13px, var(--fg), editable input on click
Confidence < 0.9: amber background tint on the value
```

---

## Trade Timeline

Vertical timeline showing document arrival and status changes.

```
Line: 1px solid var(--line), vertical, left-aligned
Dot: 6px, positioned on the line
Entry: timestamp + action text to the right of the dot
```

---

## Empty States

Every section that can be empty must have an empty state. Keep it minimal:

- Short descriptive text in `color: var(--fg-3)`, `--font-ui`, 14px
- Optional icon above text in `color: var(--fg-4)`
- CTA button if there's a logical next action (e.g. "Upload your first document")

---

## Setup Checklist

Shown on dashboard when add-in is not yet installed (until first document is captured via add-in).

```
background: color-mix(in oklch, var(--signal-amber) 8%, var(--bg))
border: 1px solid color-mix(in oklch, var(--signal-amber) 30%, var(--line))
border-radius: var(--radius-md)
padding: 16px
```

Checklist items: checkbox + label, completed items have `var(--signal-pass)` check.

---

## Tier Gate Modal

Shown when user accesses a feature above their current plan.

```
Overlay: var(--fg) at 50% opacity
Modal: bg-bg-2, border var(--line), border-radius var(--radius-md), padding 24px
Heading: dynamic — "Upgrade to Layer 2" / "Upgrade to Layer 3" / "Upgrade to Enterprise" depending on which gate triggered, --font-ui, 16px, weight 600
Body: what this feature does, --font-ui, 14px, var(--fg-2)
CTA: primary button "Upgrade"
```

---

## Tailwind v4 Note

This project uses Tailwind v4. Tokens are defined with `@theme` in globals.css — no `tailwind.config.ts` needed. Never define colors in a config file. Always use `@theme` for new tokens.

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-gray-100`, `text-slate-600`) — use project tokens only
- Never define colors in `tailwind.config.ts` — use `@theme` in globals.css
- Never add gradients to anything — the design is flat and restrained
- Never use brand/accent colors — there are none. Color = status signals only.
- Never use more than one font weight in a single UI element
- Never show raw error messages to users — always show human readable text
- Never stack more than 2 levels of border radius inside each other
- Never use `position: fixed` for UI elements — use normal flow layout
- Never use shadcn/ui default colors — always override with project tokens
- Never use `--font-ui` for labels, tags, or data values — those use `--font-mono`
- Never use blue focus rings — focus is always `--signal-amber`
