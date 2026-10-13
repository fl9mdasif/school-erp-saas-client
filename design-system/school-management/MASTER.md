# Design system: School Management (source of truth)

Decided by the owner. ui-ux-pro-max was used for checks; its automatic recommendation (Claymorphism, indigo, Baloo 2) was **rejected** because the owner asked for a light, clean, professional dashboard.

The palette below is the owner's final decision. Earlier drafts (brown and gur, then teal with amber) were replaced because earthy brown, gold and orange did not look professional for school software. Changing palette later means editing only `app/globals.css`.

## Style

- **Minimalism / Swiss, light content area with a navy sidebar and header.** White cards on a cool white page, hairline borders, almost no shadow, one brand colour (teal). Serious and tidy like a good accounting tool.
- No gradients on the dashboard, no glass, no playful chunky shapes.
- Motion is small and purposeful (150 to 250 ms). The only large motion is the **3D scroll hero on the marketing home page**. Everything honours `prefers-reduced-motion`.

## 1. Platform brand (dashboard, marketing site, logo)

| Token | Hex | Use |
|---|---|---|
| `--primary` | `#0F766E` | Main button, active nav |
| `--primary-hover` | `#115E59` | Hover |
| `--primary-tint` | `#CCFBF1` | Selected row, chip background |
| `--primary-deep` | `#115E59` | Text on the tint |
| `--navy` | `#0B2A4A` | Header, sidebar, logo, headings |
| `--highlight` | `#0369A1` | Links, info, highlights (blue replaces the old amber) |
| `--background` | `#F8FAFC` | App background |
| `--card` | `#FFFFFF` | Cards, tables, inputs |
| `--border` | `#E2E8F0` | Dividers |
| `--input` | `#8091A7` | Form field borders (3:1 for UI components) |
| `--foreground` | `#0F172A` | Main text |
| `--muted-foreground` | `#64748B` | Secondary text |

Sidebar (navy): text `#CBD5E1` (9.8:1), muted `#94A3B8` (5.7:1), active item teal `#0F766E` with white text (5.5:1), hover `#12385F`, border `#1E3A5F`.

Contrast (measured): white on teal 5.47, white on navy 14.54, navy on page 13.9, blue on page 5.67, muted on page 4.55, primary-deep on tint 6.73. The logo (A, অ, ا) uses teal and navy.

Dark mode is v1.1: background `#0B1220`, text `#E2E8F0`, primary `#2DD4BF`.

## 2. Tenant presets (public school site only, via `data-tenant-theme`)

| Preset | Primary | Accent | Page | Text | Contrast |
|---|---|---|---|---|---|
| School "Scholar Blue" | `#1E40AF` | `#0369A1` | `#F8FAFC` | `#0F172A` | white on primary 8.72 |
| Madrasa "Heritage Green" | `#166534` | deep teal `#0F766E` | `#F7FAF7` | `#14231B` | white on primary 7.13, green on page 6.78, accent on page 5.21 |
| Coaching "Crimson Navy" | `#BE123C` | slate `#1E293B` | `#F8FAFC` | `#1E293B` | white on crimson 6.29, slate on page 13.98 |

Launch decision: **School is the default and the only preset polished for launch.** Madrasa and Coaching exist as configuration and are not shown in demos until the owner reviews them. The dashboard always uses the platform brand.

## 3. Status colours (identical in every preset)

| Meaning | Text | Chip background | Contrast |
|---|---|---|---|
| Present, Paid (`--success`) | `#166534` (solid `#15803D`) | `#DCFCE7` | 6.49 on chip (solid on white 5.02) |
| Absent, Error (`--destructive`) | `#B91C1C` | `#FEE2E2` | 5.30 on chip |
| Due, Warning (`--warning`) | `#92400E` | `#FEF3C7` | 6.37 on chip |
| Info (`--info`) | `#0369A1` | `#E0F2FE` | 5.17 on chip, 5.93 on white |

Amber appears only in the small Due / Warning chip, never on a large button, banner or brand area. Status is never colour only: every chip carries a word or an icon (Present, Absent, Due, Paid). Absent (red) and Due (amber) stay different on purpose so they cannot be confused.

## Typography

- Bangla: **Hind Siliguri** (400 to 700). Latin and numbers: **Inter**. `font-display: swap`, subset.
- Body 16 px minimum, line height 1.6. Tables 14 px with tabular numbers for money. Headings in navy, by weight not size inflation.

## Shape and spacing

- Radius 8 px controls, 12 px cards. 4 px spacing scale. Touch targets at least 44 px. Phone first (320), then 768, 1024, 1440.

## Layout

- Dashboard: collapsible navy left sidebar, top bar, content max width 1280. Phone: top bar, bottom navigation (4 items) and a drawer.
- Every data view has loading, empty, error and forbidden states.

## Home page 3D scroll (21st.dev components, adapted)

- **Container Scroll Animation**: a dashboard screenshot tilts back in 3D (`rotateX` 20 to 0, scale, translate) as the page scrolls.
- **Phone Scroll Hero**: a phone mockup showing the result lookup tilts and climbs over the headline.
- Rebuilt on our tokens, `framer-motion` for scroll progress, disabled under reduced motion, phone-friendly sizes, lazy images. At most two large scroll effects on the page.

## Anti-patterns

Emoji as icons, brown/gold/orange brand areas, purple gradients, glass cards, stacked heavy shadows, colour-only status, hover-only actions, animating width/height, more than 1 to 2 large animations per view, text under 12 px.

## Pre-delivery checklist (per screen)

- [ ] lucide SVG icons only
- [ ] `cursor-pointer` and a visible focus state on everything clickable
- [ ] Hover and press transitions 150 to 250 ms
- [ ] Text contrast 4.5:1 or better
- [ ] `prefers-reduced-motion` respected
- [ ] Works at 320, 768, 1024, 1440 px with no horizontal page scroll
- [ ] Bangla and English strings both present
