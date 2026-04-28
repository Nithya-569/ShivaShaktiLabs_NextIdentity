# NextIdentity — Frontend

A premium professional network UI for people reinventing their careers.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui patterns

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, Nav, footer
│   ├── globals.css         # Design tokens + base styles
│   ├── page.tsx            # Home — hero, features, testimonials
│   ├── connect/
│   │   └── page.tsx        # Connect — filter panel + member grid
│   ├── grow/
│   │   └── page.tsx        # Grow — progress tracker + resources
│   ├── support/
│   │   └── page.tsx        # Support — FAQ accordion + chat widget
│   └── find/
│       └── page.tsx        # Find — search + opportunity cards
├── components/
│   ├── Nav.tsx             # Sticky nav with active link detection
│   └── ui/
│       └── index.tsx       # Shared UI: Avatar, Badge, Chip, Button,
│                           #            Card, ProgressBar, SectionHeader…
└── lib/
    ├── mock-data.ts        # All mock data + color/status maps
    └── utils.ts            # cn() helper (clsx + tailwind-merge)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero, feature grid, stats, testimonials |
| `/connect` | Filter sidebar + member card grid |
| `/grow` | Progress tracker + curated resource cards |
| `/support` | FAQ accordion + live chat widget |
| `/find` | Search + filterable opportunity results |

## Design System

All design tokens live in `globals.css` as CSS variables:

```css
--ink:        #0A0A0F   /* page background */
--ink2:       #12121A   /* card backgrounds */
--surface:    #22222F   /* input backgrounds */
--border:     #3A3A50   /* all borders */
--amber:      #F5A623   /* primary accent */
--text:       #F0EEE8   /* body text */
--muted:      #8E8EA0   /* secondary text */
```

**Fonts:** Syne (headings, display) + DM Sans (body, UI)

## Adding Backend / Data

Replace mock data in `src/lib/mock-data.ts` with API calls.
All pages are typed — `Member`, `Resource`, `Opportunity` interfaces are exported.

## shadcn/ui Components

To add official shadcn components:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add accordion
```

---

Built with ✦ by NextIdentity
