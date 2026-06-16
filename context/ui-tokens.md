# UI Tokens

Design tokens for CommodityOps. All values extracted from the delivered design (index.html). Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-bg` → `bg-bg`, `text-bg`, `border-bg`
- `--color-fg` → `bg-fg`, `text-fg`, `border-fg`

```tsx
// Correct — uses generated utility classes
className="bg-bg-2 text-fg border-line"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-fg-2)' }}

// Never — hardcoded values
className="bg-[oklch(95.5%_0.005_90)]"

// Never — raw Tailwind color classes
className="bg-gray-100 text-gray-800"
```

---

## Design System Origin

The CommodityOps design uses a dual-mode system: `paper` (light) and `ink` (dark). Both modes share the same semantic variable names (`--bg`, `--fg`, `--line`) but resolve to different values. The app defaults to `paper` mode.

The design is intentionally restrained — no brand colors, no gradients, no purple accents. Color comes from signal colors only (amber, green, red, blue) used sparingly for status, validation, and exceptions.

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-ui: "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --font-display: "Newsreader", "Times New Roman", serif;

  /* Paper mode (light — default) */
  --color-bg: oklch(98.2% 0.004 90);
  --color-bg-2: oklch(95.5% 0.005 90);
  --color-bg-3: oklch(92% 0.006 90);
  --color-line: oklch(85% 0.006 90);
  --color-line-soft: oklch(91% 0.005 90);
  --color-fg: oklch(18% 0.005 240);
  --color-fg-2: oklch(36% 0.005 240);
  --color-fg-3: oklch(52% 0.005 240);
  --color-fg-4: oklch(68% 0.005 240);

  /* Signal colors — used for status, validation, exceptions */
  --color-signal-amber: oklch(78% 0.155 75);
  --color-signal-amber-2: oklch(70% 0.155 75);
  --color-signal-pass: oklch(72% 0.155 145);
  --color-signal-fail: oklch(64% 0.215 25);
  --color-signal-info: oklch(70% 0.135 235);
  --color-signal-warn: oklch(80% 0.155 95);

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-7: 32px;
  --spacing-8: 40px;
  --spacing-9: 48px;
  --spacing-10: 64px;
  --spacing-11: 80px;
  --spacing-12: 120px;

  /* Border radius */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-pill: 999px;

  /* Shadow */
  --shadow-card: 0 1px 0 oklch(0% 0 0 / 0.02) inset, 0 0 0 1px var(--color-line);
}
```

Tailwind v4 generates utility classes automatically from every `--color-*` token above:

- `bg-bg`, `bg-bg-2`, `bg-bg-3`
- `text-fg`, `text-fg-2`, `text-fg-3`, `text-fg-4`
- `border-line`, `border-line-soft`
- `text-signal-pass`, `bg-signal-fail`, `border-signal-amber`
- etc.

---

## Ink Mode (Dark — Optional, Future)

If dark mode is implemented, add these as overrides via a `[data-mode="ink"]` selector or Tailwind dark mode:

```css
/* Ink mode overrides — not in @theme, applied via data attribute */
[data-mode="ink"] {
  --color-bg: oklch(16% 0.005 240);
  --color-bg-2: oklch(19% 0.005 240);
  --color-bg-3: oklch(23% 0.005 240);
  --color-line: oklch(32% 0.006 240);
  --color-line-soft: oklch(26% 0.005 240);
  --color-fg: oklch(96% 0.005 90);
  --color-fg-2: oklch(78% 0.006 90);
  --color-fg-3: oklch(58% 0.006 90);
  --color-fg-4: oklch(42% 0.006 90);
  --shadow-card: 0 1px 0 oklch(100% 0 0 / 0.03) inset, 0 0 0 1px var(--color-line);
}
```

Do not build dark mode until Layer 1 is shipped. Include the tokens here for reference only.

---

## Color Usage Guide

### Page Layout

| Element            | Token              |
| ------------------ | ------------------ |
| Page background    | `bg-bg`            |
| Card / surface     | `bg-bg-2`          |
| Secondary surface  | `bg-bg-3`          |
| Default border     | `border-line`      |
| Subtle border      | `border-line-soft` |

### Typography

| Element                   | Token              |
| ------------------------- | ------------------ |
| Headings, primary text    | `text-fg`          |
| Secondary text, labels    | `text-fg-2`        |
| Muted text, placeholders  | `text-fg-3`        |
| Disabled text             | `text-fg-4`        |

### Status / Validation

| Status      | Text Token            | Border / Background                                           |
| ----------- | --------------------- | ------------------------------------------------------------- |
| Pending     | `text-signal-amber`   | `border-signal-amber` at 40% mix with line                    |
| Pass        | `text-signal-pass`    | `border-signal-pass` at 40% mix with line                     |
| Fail        | `text-signal-fail`    | `border-signal-fail` at 40% mix with line                     |
| Info        | `text-signal-info`    | `border-signal-info` at 40% mix with line                     |
| Warning     | `text-signal-warn`    | `border-signal-warn` at 50% mix with line                     |

Signal colors are never used as backgrounds — only as text, borders, and dots. The one exception is buttons (approve = pass bg, reject = fail outline).

### Low Confidence Highlight

Fields with extraction confidence below 0.9 use a warm background tint:

```
background: color-mix(in oklch, var(--signal-warn) 10%, var(--bg))
border-color: color-mix(in oklch, var(--signal-warn) 50%, var(--line))
```

---

## Typography

| Element              | Font             | Size  | Weight | Line Height | Letter Spacing | Color Token |
| -------------------- | ---------------- | ----- | ------ | ----------- | -------------- | ----------- |
| Display heading      | `--font-ui`      | clamp | 500    | 0.95        | -0.035em       | `text-fg`   |
| Section heading      | `--font-ui`      | 16px  | 600    | 24px        | -0.01em        | `text-fg`   |
| Body text            | `--font-ui`      | 14px  | 400    | 20px        | 0              | `text-fg`   |
| Body medium          | `--font-ui`      | 14px  | 500    | 20px        | 0              | `text-fg`   |
| Small text           | `--font-ui`      | 13px  | 400    | 18px        | 0              | `text-fg-2` |
| Eyebrow / label      | `--font-mono`    | 10.5px| —      | 16px        | 0.12em         | `text-fg-3` |
| Mono data            | `--font-mono`    | 13px  | 400    | 18px        | -0.01em        | `text-fg`   |
| Tag text             | `--font-mono`    | 10.5px| —      | 14px        | 0.08em         | `text-fg-2` |
| Editorial / italic   | `--font-display` | —     | 400    | —           | -0.02em        | `text-fg`   |

Font family imports via `next/font/google` in root layout:

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

Apply all three variable classes to `<html>` tag.

---

## Component Tokens

### Cards

```
background: bg-bg-2
border: 1px solid var(--line)
border-radius: var(--radius-md)  →  4px
shadow: var(--shadow-card)
padding: 16-24px depending on content
```

### Buttons

**Default (outlined):**

```
background: transparent
border: 1px solid var(--line)
color: text-fg
border-radius: var(--radius-sm)  →  2px
padding: 10px 16px
font-size: 13px
font-weight: 500
letter-spacing: 0.02em
hover: bg-bg-2, border-color fg-3
```

**Primary (filled):**

```
background: bg-fg
color: text-bg
border: 1px solid var(--fg)
hover: bg-fg-2
```

**Approve:**

```
background: bg-signal-pass
color: oklch(15% 0.05 145)
border: 1px solid var(--signal-pass)
```

**Reject (outlined):**

```
background: transparent
color: text-signal-fail
border: 1px solid color-mix(in oklch, var(--signal-fail) 50%, var(--line))
hover: bg color-mix(in oklch, var(--signal-fail) 10%, transparent)
```

**Small:**

```
padding: 6px 10px
font-size: 12px
```

**Large:**

```
padding: 14px 22px
font-size: 14px
```

### Tags / Badges

```
font-family: var(--font-mono)
font-size: 10.5px
letter-spacing: 0.08em
text-transform: uppercase
padding: 3px 8px
border: 1px solid var(--line)
border-radius: var(--radius-pill)  →  999px
color: text-fg-2
```

**Variants** — same structure, different colors:

| Variant | Text Color          | Border                                         |
| ------- | ------------------- | ---------------------------------------------- |
| default | `text-fg-2`         | `border-line`                                  |
| amber   | `text-signal-amber` | `color-mix(in oklch, var(--signal-amber) 40%, var(--line))` |
| pass    | `text-signal-pass`  | `color-mix(in oklch, var(--signal-pass) 40%, var(--line))`  |
| fail    | `text-signal-fail`  | `color-mix(in oklch, var(--signal-fail) 40%, var(--line))`  |
| info    | `text-signal-info`  | `color-mix(in oklch, var(--signal-info) 40%, var(--line))`  |
| warn    | `text-signal-warn`  | `color-mix(in oklch, var(--signal-warn) 50%, var(--line))`  |

### Input Fields

```
font-family: var(--font-mono)
font-size: 13px
background: bg-bg
border: 1px solid var(--line)
color: text-fg
padding: 9px 12px
border-radius: var(--radius-sm)  →  2px
width: 100%
focus: outline 1px solid var(--signal-amber), border-color var(--signal-amber)
```

### Labels (Eyebrow)

```
font-family: var(--font-mono)
font-size: 10.5px
letter-spacing: 0.1em
text-transform: uppercase
color: text-fg-3
```

### Status Dots

```
width: 6px
height: 6px
border-radius: 50%
background: var(--fg-3)
```

**Variants:**

| Variant | Background          | Extra                                                      |
| ------- | ------------------- | ---------------------------------------------------------- |
| default | `bg-fg-3`           | —                                                          |
| amber   | `bg-signal-amber`   | box-shadow: 0 0 0 3px color-mix(in oklch, var(--signal-amber) 25%, transparent) |
| pass    | `bg-signal-pass`    | —                                                          |
| fail    | `bg-signal-fail`    | —                                                          |

### Dividers

```
Horizontal: height 1px, background var(--line)
Vertical: width 1px, background var(--line)
```

### Keyboard Shortcuts (kbd)

```
font-family: var(--font-mono)
font-size: 10.5px
background: bg-bg-3
border: 1px solid var(--line)
padding: 2px 6px
border-radius: var(--radius-sm)
color: text-fg-2
```

---

## Spacing Scale

Use Tailwind spacing utilities mapped to the design system:

| Token | Value | Tailwind     | Usage                    |
| ----- | ----- | ------------ | ------------------------ |
| s-1   | 4px   | `gap-1`      | Tight inline gaps        |
| s-2   | 8px   | `gap-2`      | Tag and badge gaps       |
| s-3   | 12px  | `gap-3`      | Form field gaps          |
| s-4   | 16px  | `gap-4 p-4`  | Card padding, section    |
| s-5   | 20px  | `gap-5`      | Between components       |
| s-6   | 24px  | `gap-6 p-6`  | Large card padding       |
| s-7   | 32px  | `gap-8`      | Between page sections    |
| s-8   | 40px  | `gap-10`     | Major section spacing    |
| s-9   | 48px  | `gap-12`     | Page top padding         |
| s-10  | 64px  | `p-16`       | Hero section padding     |

---

## Background Patterns

The design uses two subtle background patterns:

**Grid:**

```css
background-image:
  linear-gradient(to right, var(--line-soft) 1px, transparent 1px),
  linear-gradient(to bottom, var(--line-soft) 1px, transparent 1px);
background-size: 32px 32px;
```

**Dots:**

```css
background-image: radial-gradient(var(--line) 1px, transparent 1px);
background-size: 16px 16px;
```

Use sparingly — only on hero sections or empty states. Never on cards or content areas.

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Fonts are Inter Tight (UI), JetBrains Mono (data/labels), Newsreader (editorial) — always import via next/font/google
- Never use raw Tailwind color classes like `bg-gray-100` or `text-slate-600` — use project tokens only
- Signal colors are for status only — never use them for decorative purposes
- No brand color — the design is intentionally neutral. Color = status.
- Tags/badges always use `--font-mono` uppercase — never UI font
- Input focus state is always `--signal-amber` — never blue or default browser focus
- Cards use `--shadow-card` — never default Tailwind shadow classes
- `color-mix(in oklch, ...)` is used for tinted borders and backgrounds — never opacity hacks
- `font-feature-settings: "ss01", "cv11", "tnum"` on the root surface element — ensures correct Inter Tight rendering
