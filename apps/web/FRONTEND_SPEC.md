# Edvoura Learning Hub — Frontend Build Specification

> **Nigeria's Premier K-12 Online Tutoring Platform**
> "Learn. Grow. Excel."

---

## Brand Identity

| Property | Value |
|----------|-------|
| Platform | Edvoura Learning Hub |
| Domain | edvouralearninghub.com |
| Tagline | "Learn. Grow. Excel." |
| Audience | K-12 Students (ages 6-18), Parents, Tutors — Nigerian market |
| Tone | Trustworthy, warm, modern, aspirational. Not childish. Not cold. Not generic. |

---

## Colour System

```css
--navy:          #0A1628   /* Primary background, hero sections */
--navy-mid:      #112240   /* Cards on dark backgrounds */
--navy-light:    #1B3461   /* Borders, subtle navy tints */
--yellow:        #F5C518   /* Primary CTA, accents, highlights */
--yellow-light:  #FFD84D   /* Hover states on yellow */
--yellow-dim:    #C9A012   /* Tags, secondary yellow elements */
--white:         #FFFFFF
--off-white:     #F7F8FC   /* Alternating section backgrounds */
--grey:          #8892A4   /* Body text, labels */
--grey-light:    #E8ECF2   /* Borders on white backgrounds */
--dark:          #060E1C   /* Footer, deepest backgrounds */
--success:       #22C55E
--warning:       #F59E0B
--error:         #EF4444
--info:          #3B82F6
```

---

## Typography

```
Display / Headings:   Syne — weights 700, 800
Body / UI:            DM Sans — weights 400, 500, 600

Scale:
  Hero H1:      clamp(2.8rem, 5vw, 4.2rem) — Syne 800, letter-spacing -1.5px
  Section H2:   clamp(2rem, 3.5vw, 2.8rem) — Syne 800, letter-spacing -1px
  Card H3:      1.2rem–1.4rem — Syne 700
  Body:         0.9rem–1.05rem — DM Sans 400/500
  Label/Tag:    0.75rem–0.8rem — DM Sans 600/700, letter-spacing 0.5px
  CTA Button:   0.9rem–1rem — Syne 700
```

---

## Logo System

```
Mark:       Square yellow (#F5C518) rounded rectangle
            containing bold white/navy "E" in Syne 800

Wordmark:   "Edvoura" in Syne 800, followed by a yellow full stop "."
            e.g. → Edvoura.

On dark:    White wordmark + yellow dot + yellow E-mark
On light:   Navy wordmark + yellow dot + navy E-mark
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts (dashboards only) |
| Forms | React Hook Form + Zod |
| Fonts | next/font/google (Syne + DM Sans) |

---

## Design References

| Source | Extract |
|--------|---------|
| Brighterly | Hero structure, K-12 tone, tutor cards, progress display |
| Cambly | Yellow dominance without cheapness, goal-oriented hero copy |
| GoStudent | Multi-role homepage explanation, parent-facing trust copy |
| Preply | Tutor card design, search/filter UX, review credibility |
| Khan Academy | Age-appropriate dashboards, subject cards, mastery display |
| LiveSchool | K-12 classroom aesthetic, educator data display |
| Coursera | Grade 7-12 dashboard feel, professional progress tracking |
| Padlet | Playful-yet-professional balance, smooth section transitions |

---

## Marketing Pages

### Navbar
- Fixed top, backdrop blur, darkens on scroll
- Logo + nav links (Home, About, Services, Blog, Pricing, Careers, Contact)
- Sign In (ghost) + Get Started (yellow) CTAs
- Mobile: hamburger → full-screen overlay with staggered animation

### Homepage Sections
1. **Hero** — Navy bg, badge pill, headline with yellow underline, dual CTAs, floating UI cards
2. **How It Works** — Off-white, 3-step cards (Create Account → Match Tutor → Start Learning)
3. **Features** — Navy bg, 2×2 cards (Live Sessions, Quizzes, Assignments, Parent Dashboard)
4. **Subjects** — White bg, 4×2 subject grid
5. **Testimonials** — Navy bg, 3 testimonial cards with star ratings
6. **Pricing** — White bg, 3 plan cards (Starter/Growth/Premium)
7. **CTA Banner** — Full yellow, conversion push
8. **Footer** — Dark bg, 4-column links

### Auth Pages
- **Sign In**: Split screen (navy brand panel + white form)
- **Sign Up**: 3-step flow (Role → Details → Personalise) with Framer Motion transitions

---

## Dashboard Bands

| Band | Grades | Codename | Design Tone |
|------|--------|----------|-------------|
| Explorer | 1-3 | The Explorer | Playful, icon-heavy, big touch targets |
| Builder | 4-6 | The Builder | Structured, badge-driven, engaging |
| Achiever | 7-12 | The Achiever | Clean, professional, data-forward |

---

## Component Rules

1. Mobile first (375px base)
2. Skeleton loaders for all data components
3. Empty states with friendly copy + CTA
4. Loading buttons with spinner
5. Accessible (keyboard nav, aria-labels, 4.5:1 contrast)
6. Mock data with `// TODO: Replace with Supabase query → [table]` comments
7. Framer Motion for all transitions
8. No inline styles — Tailwind only
9. Recharts with brand colours in dashboards

---

## Animation Spec

| Element | Animation |
|---------|-----------|
| Page enter | opacity 0→1, translateY 24→0, 0.3s ease |
| Stagger children | 0.1s delay each |
| Hero float cards | translateY ±12px, 3s infinite |
| Live pulse | opacity 1→0.4→1, 1.5s infinite |
| Progress bar | width animate on mount, 1s ease |
| Modal | scale 0.95→1, opacity 0→1, 0.2s |
| KPI numbers | count up from 0 on viewport enter |

---

## Build Status

### ✅ Completed
- Dashboard shell (layout, sidebar, band context)
- Student dashboards (Explorer, Builder, Achiever) — basic versions
- Parent, Tutor, Admin dashboards — basic versions
- 36+ route pages with solid UI templates
- Lucide React iconography throughout
- Band persistence (localStorage)

### 🔨 Phase 9 — In Progress
- Marketing homepage (full rebuild)
- Premium auth flow (sign-in / sign-up)
- Navbar + Footer components
- Design system upgrade (Syne + DM Sans fonts, new colour palette)
