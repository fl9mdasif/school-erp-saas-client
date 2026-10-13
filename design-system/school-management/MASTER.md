# Design system: School Management (source of truth)

Decided by the owner, with ui-ux-pro-max used for checks. The automatic recommendation (Claymorphism, indigo, Baloo 2) was **rejected**: the owner asked for a light, clean, aesthetic, professional dashboard in a warm brown and gur palette.

## Style

- **Minimalism / Swiss, warm light theme.** White cards on a cream page, thin borders, almost no shadow, generous but dense-enough spacing (density 6/10), one primary colour.
- Calm and trustworthy like a good accounting tool. No gradients on the dashboard, no glass, no playful chunky shapes.
- Motion: purposeful and small (150 to 250 ms). The only large motion is the **3D scroll hero on the marketing home page**. Every animation honours `prefers-reduced-motion`.

## Colours (use in this order)

| # | Role | Hex | Token | Use |
|---|---|---|---|---|
| 1 | Primary | `#5A3418` | `--primary` | Buttons, active navigation, headings accents, focus ring |
| 2 | Secondary (গুড়) | `#D98A1E` | `--secondary` | Highlights, dues, warnings, chart second series |
| 3 | Background | `#FFF3DC` | `--background` | Page background |
| 4 | Text | `#2A1608` | `--foreground` | Body text |
| 5 | Accent (green) | `#4E7A2E` | `--success` | Success, present, paid, positive trends. Named `--success` because shadcn already uses `--accent` for hover surfaces |

Derived tokens (computed from the five, not new brand colours):

| Token | Value | Notes |
|---|---|---|
| `--card` | `#FFFFFF` | Cards, tables, inputs sit on the cream page |
| `--border` | `#E8D9BC` | Warm hairline, darker than the page so it is visible |
| `--muted` | `#F7EAD0` | Subtle fills, table stripes |
| `--muted-foreground` | `#6B5440` | Secondary text |
| `--primary-hover` | `#46290F` | |
| `--primary-tint` | `#F1E6DA` | Active nav background |
| `--secondary-tint` | `#FBEBCB` | Due chips background |
| `--secondary-deep` | `#8A5710` | Text on the secondary tint |
| `--accent-tint` | `#E6F0DD` | Success chip background |
| `--accent-deep` | `#3C6122` | Text on the accent tint |
| `--destructive` | `#B91C1C` | Absent, errors, destructive actions |
| `--info` | `#1D4ED8` | Informational |
| `--ring` | `#5A3418` | Focus outline, 2 px with offset |

Contrast rules (verified numerically before use):

- White text on Primary passes. Text `#2A1608` on cream and white passes.
- **White text on the gur colour fails**, so gur buttons use dark text `#2A1608`; on gur tints use `--secondary-deep`.
- Status is never colour only: pair with a label or icon (Present, Absent, Due, Paid).

## Typography

- Bangla: **Hind Siliguri** (400, 500, 600, 700). Latin and numbers: **Inter**. Both with `font-display: swap`, subset.
- Body 16 px minimum, line height 1.6 for Bangla. Table text 14 px with tabular numbers for money. Headings by weight step, not size inflation.

## Shape and spacing

- Radius 8 px for controls, 12 px for cards. Spacing on a 4 px scale; no arbitrary pixel values.
- Touch targets at least 44 px. Phone first (320 px), then 768, 1024, 1440.

## Layout rules

- Dashboard: left sidebar (collapsible), top bar, content max width 1280. Phone: top bar and bottom navigation (4 items) plus drawer.
- Every data view has loading, empty, error and forbidden states.

## Home page 3D scroll (21st.dev components, adapted)

- Hero uses **Container Scroll Animation**: a dashboard screenshot tilts back in 3D (`rotateX` 20 to 0, scale, translate) as the page scrolls.
- A second section uses **Phone Scroll Hero**: a phone mockup showing the result lookup, tilts and climbs over the headline.
- Both rebuilt on our tokens (no hard-coded greys), `framer-motion` for scroll progress, disabled under reduced motion, phone-friendly sizes, images lazy loaded. Maximum two large scroll effects on the page.

## Anti-patterns to avoid

Emoji as icons, purple/indigo gradients, glass cards, stacked heavy shadows, colour-only status, hover-only actions, animating width/height, more than 1 to 2 large animations per view, text under 12 px.

## Pre-delivery checklist (per screen)

- [ ] Icons are lucide SVG, never emoji
- [ ] Every clickable element has `cursor-pointer` and a visible focus state
- [ ] Hover and press transitions 150 to 250 ms
- [ ] Text contrast 4.5:1 or better
- [ ] `prefers-reduced-motion` respected
- [ ] Works at 320, 768, 1024, 1440 px with no horizontal page scroll
- [ ] Bangla and English strings both present
