---
version: alpha
name: Carbon Chassis, No IBM Blue
description: IBM Carbon's layer-ramp theming, 8px grid and IBM Plex type adopted as a semantic-token chassis for six visually distinct sites, with IBM Blue 60 deleted as an accent everywhere it appears.
colors:
  primary: '#161616' # cds-text-primary / Gray 100 — ink, headings, dark chrome (ibm.md:39,42)
  secondary: '#525252' # cds-text-secondary / Gray 70 (ibm.md:45)
  neutral: '#ffffff' # cds-background / White — page ground, chassis default (ibm.md:38)
  surface: '#f4f4f4' # cds-layer-01 / Gray 10 — card/rail ground, chassis default (ibm.md:50)
  border: '#e0e0e0' # cds-border-subtle / Gray 20 (ibm.md:49)
  on-primary: '#ffffff'
  support-error: '#da1e28' # Red 60 — 5.00:1 on white, passes verbatim as text
  support-success: '#24a148' # Green 50 — 3.35:1 on white, FILL ONLY
  support-success-text: '#0e6027' # WCAG text-safe companion
  support-warning: '#f1c21b' # Yellow 30 — 1.68:1 on white, FILL ONLY
  support-warning-text: '#8e6a00' # WCAG text-safe companion
  support-info-fill-only: '#0f62fe' # ibm.md Blue 60 — FILL ONLY. Never text, link, focus ring, or brand mark.
typography:
  display-01:
    fontFamily: IBM Plex Sans
    fontSize: 3.75rem
    fontWeight: 300
    lineHeight: 1.17
    letterSpacing: '0px'
  display-02:
    fontFamily: IBM Plex Sans
    fontSize: 3rem
    fontWeight: 300
    lineHeight: 1.17
  heading-01:
    fontFamily: IBM Plex Sans
    fontSize: 2.625rem
    fontWeight: 300
    lineHeight: 1.19
  heading-02:
    fontFamily: IBM Plex Sans
    fontSize: 2rem
    fontWeight: 400
    lineHeight: 1.25
  heading-03:
    fontFamily: IBM Plex Sans
    fontSize: 1.5rem
    fontWeight: 400
    lineHeight: 1.33
  heading-04:
    fontFamily: IBM Plex Sans
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  heading-05:
    fontFamily: IBM Plex Sans
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.4
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  body-long-01:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-short-01:
    fontFamily: IBM Plex Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.29
    letterSpacing: '0.16px'
  caption-01:
    fontFamily: IBM Plex Sans
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: '0.32px'
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.69
  code-01:
    fontFamily: IBM Plex Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: '0.16px'
  code-02:
    fontFamily: IBM Plex Mono
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  mono-display:
    fontFamily: IBM Plex Mono
    fontSize: 2.625rem
    fontWeight: 400
    lineHeight: 1.19
rounded:
  none: 0px
  xs: 2px
  sm: 3px
  md: 4px
  lg: 6px
  xl: 8px
  pill-tag: 24px
  pill: 99999px
spacing:
  space-01: 2px
  space-02: 4px
  space-03: 8px
  space-04: 12px
  space-05: 16px
  space-06: 24px
  space-07: 32px
  space-08: 40px
  space-09: 48px
  space-layout-01: 16px
  space-layout-02: 24px
  space-layout-03: 32px
  space-layout-04: 48px
  space-layout-05: 64px
  space-layout-06: 80px
  space-layout-07: 96px
  space-layout-08: 160px
components:
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    rounded: '{rounded.none}'
    padding: 16px
  card-hover:
    backgroundColor: '#e8e8e8'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    height: 40px
    padding: 16px
  input-large:
    height: 48px
  button-default:
    height: 48px
    padding: 16px
  button-compact:
    height: 40px
  tag-pill:
    rounded: '{rounded.pill-tag}'
    padding: 4px
  page:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.primary}'
  divider:
    backgroundColor: '{colors.border}'
  status-label-error:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.support-error}'
  status-label-success:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.support-success-text}'
  status-label-warning:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.support-warning-text}'
  status-dot-info:
    backgroundColor: '{colors.support-info-fill-only}'
    rounded: '{rounded.pill}'
    size: 8px
portfolioSites:
  agenticadlab:
    role: hub
    ground: '#f5f4ed page / #faf9f5 surface / #e8e6dc deep (warm, imported from Claude)'
    accent: '#a84c33 terracotta (5.08:1 on ground)'
    radius: 8px
    measure: 68ch
  briefgateway:
    role: tool
    ground: '#ffffff / #f4f4f4 / #e0e0e0 (Carbon White theme, verbatim)'
    accent: 'none — the only achromatic site; functional status only, #0057c2'
    radius: 6px
    measure: '66ch (form column caps at 640px)'
  adcpexplorer:
    role: explorer
    ground: '#ffffff / #f4f4f4 / #e0e0e0 (surfaces darker than page)'
    accent: '#0a7d52 green (5.16:1 on white) / vivid fill-only companion #18e299'
    radius: '24px pill on chrome, 2px on cards (deliberate exception)'
    measure: 'minmax(0, 48rem) hard cap'
  aampexplorer:
    role: explorer
    ground: 'dual — #ffffff content column inside a permanent #161616/#262626 chrome band (a light-mode composition device, not a dark-mode state)'
    accent: '#6c3aa6 violet (content column) / #b197ff (chrome-band pair, 7.53:1 on #161616)'
    radius: '4px, never pill'
    measure: 60ch
  adtechglossary:
    role: glossary
    ground: '#f4f4f4 page / #ffffff surfaces — INVERTED relative to the other five [our extension]'
    accent: '#845720 amber (5.67:1) — links are separately #3366cc / visited #6a60b0'
    radius: '0px, single 24px category-chip exception'
    measure: 72ch
  whatisagenticbuying:
    role: answer
    ground: 'TODO — reset to Carbon White (#ffffff / #f4f4f4 / #e0e0e0) as a buildable placeholder; was dark BY DEFAULT (#161616/#262626/#393939), rejected as "black + neon" convergence (orchestrator decision). Light editorial identity not yet designed.'
    accent: 'TODO — neutralised to achromatic ink pending a real light-ground hue; was #5b8cff (5.73:1 on #161616, dark-canvas only, not reusable on light)'
    radius: '99999px pill CTA against 3px secondary'
    measure: "62ch (display exemption: 96px at -0.03em, the portfolio's one named departure from the 60px chassis ceiling — this typographic ruling is unaffected by the ground reset)"
---

**Dark mode is removed, portfolio-wide** (orchestrator decision, dated
2026-08-14: AI design converges on "black + neon" in dark mode, so all
six-way differentiation now lives in light only). No site carries a
`@media (prefers-color-scheme: dark)` block. Where this file's prose below
still describes a site's "dark pair" or "dark mode behavior", treat it as
historical record, superseded — `/srv/ws/out/design-system-spec.md` §10
ruling 4 is marked **VOID** and is the canonical pointer for what changed
and why.

## Overview

Six Astro sites — a hub, a free tool, two reference-docs sites, a glossary
and a magazine-style explainer — share one publisher (Agentic Brief) and
must never be confused with one another, especially the three
reference-flavoured sites (`adcpexplorer`, `aampexplorer`,
`adtechglossary`), which sit in adjacent territory by archetype.

This spec does not invent a palette to solve that. It adopts **IBM Carbon**
as a chassis: not for its look (corporate blue-on-white), but for its
_mechanism_ — a documented three-step background-layer ramp
(`--cds-background` / `--cds-layer-01` / `--cds-layer-02`) with a
documented dark inversion, an 8px spacing grid, a 16-column layout grid,
and a `--cds-*` role-token vocabulary the existing codebase can adopt with
zero renames. Every one of the six sites gets its own ramp, its own
accent, its own radius and its own measure layered on top of that one
mechanism — see `portfolioSites:` above and §"Per-Site Overrides" below for the
full table.

The one thing explicitly **not** carried over from Carbon is its own
identity: **IBM Blue 60 (`#0f62fe`) is deleted as an accent on all six
sites.** It survives only as `support-info-fill-only` above — a fill, never
text, a link, a focus ring or a brand mark. The existing codebase already
ships a near-identical stock blue (`--accent-bright: #2f6feb`); adopting
Carbon without this deletion would ship the same defect under a new name.
See "Do's and Don'ts" for the enforcement grep.

Full selection rationale — why Carbon over HashiCorp, Vercel, Notion and
Cal.com, the four criteria it was scored against, and the field it beat —
lives in `/srv/ws/out/design-system-spec.md` §§1–2. This file is the
consumable token layer that document's §§3–12 compile down to.

## Colors

Dark mode is removed, portfolio-wide (see the note under `portfolioSites:`
above). Every colour below is a **light-mode** value; there is no dark
counterpart to any of them any more.

- **Primary (`#161616`):** Ink. Headings, body text on every site, and —
  as a permanent, non-toggling structural device, not a dark-mode state —
  `aampexplorer`'s chrome band. Also Carbon's own Gray 100.
- **Secondary (`#525252`):** Muted text — helper copy, captions, the
  Postindustria footer credit on every site (contrast verified ≥7:1 on
  every footer ground in the portfolio).
- **Neutral (`#ffffff`) / Surface (`#f4f4f4`):** The two-step light ramp.
  On five of six sites, surface sits _darker_ than neutral (Carbon's native
  direction). `adtechglossary` runs it the other way — page `#f4f4f4`,
  surfaces `#ffffff` — an explicit extension of Carbon's own layering
  doctrine (ibm.md:30, 342), not a template quotation; recorded as ours.
- **Support quartet:** error/success/warning/info. Three of the four fail
  WCAG as text at their native Carbon hex (warning 1.68:1, success 3.35:1,
  info structurally excluded) — `support-success-text` and
  `support-warning-text` are the fix; error passes verbatim at 5.00:1.
- **No portfolio-wide accent.** Each site's hue lives in `portfolioSites:` above and
  in its own `src/sites/<site>.css` file: terracotta, none (achromatic),
  green, violet, amber. No hue repeats. `briefgateway` is the one site with
  none at all — its identity is typographic (weight-300 display) and
  structural (Stripe-style form states), not chromatic.
  `whatisagenticbuying` is currently ALSO achromatic (`--site-accent` aliased
  to ink) — not by design, but as an explicit TODO placeholder pending its
  light-identity redesign; see that file's banner comment.

## Typography

One sans family (IBM Plex Sans) carries display, heading, body and UI text
at three weights only — 300, 400, 600. Weight 700 does not exist anywhere
in this system; where a site's source voice wants "bold" (adtechglossary's
h3+, following Wikipedia's own live rule), it gets Carbon's own ceiling,
600, not an invented 700.

The single most load-bearing fact in this scale: **Heading 02 (32px) and
Heading 03 (24px) are weight 400 in Carbon's own shipped scale** — not a
subtraction. `adtechglossary`'s un-bolded h1/h2, which mirrors Wikipedia's
live CSS (`h1 { font-weight: normal }`), is a chassis default reused, not
a removal invented for this project.

Micro-tracking is a law, not a style choice: 0 above 14px, +0.16px at
14px, +0.32px at 12px, never on display text. The one portfolio-wide
exception is the wayfinding label primitive (grafted from HashiCorp,
13px/600/uppercase/mono, tracking as the per-site variable) — it sits at
11–13px, inside the tracking law, not breaking it.

**Body floor, protected:** 18px / 1.65 line-height on all six sites,
_not_ Carbon's own 16px/1.50 Body Long 01. This regresses nothing —
`global.css:61-62` already ships 18px/1.65 as a documented legibility fix,
and Carbon's own density doctrine is honored instead through line-height
_mode_ (`--lh-ui: 1.5` for chrome vs `--lh-body: 1.65` for prose),
measure, section rhythm and scale flatness. `adcpexplorer` alone runs
prose at 1.75 (`--lh-prose`), MDN's own live value — the one site above
the floor, not below it.

**Font loading:** self-hosted, not Google Fonts — `Seo.astro` emits zero
third-party preconnects today and this system does not change that. See
"Font Loading" below; the actual `fonts.css` + subsetted `.woff2` files are
not shipped by this package yet (tracked as follow-up work, not invented
here since the metric-matched fallback overrides require measurement
against the real subset files).

## Layout

- **8px base unit.** Component spacing: 2/4/8/12/16/24/32/40/48px. Layout
  spacing: 16/24/32/48/64/80/96/160px. Every value on both scales is
  divisible by 8 (2px and 4px reserved for micro-adjustments).
- **16-column grid, 1584px max, 32px gutters** (16px mobile). This is the
  one thing that made Carbon win the selection outright: it's the only
  candidate template of five that ships a column grid at all, and 16
  columns is the only count both sites in the hardest pair need — AdCP's
  prose read is 4/8/4, AAMP's split-pane read is 4/6/6, both integers on
  16 (on a 12-column grid the second is 3/4.5/4.5 and does not divide).
- **Section rhythm:** 48px is the default major transition; hero sections
  run 80–96px. `agenticadlab` (the hub) runs at the _top_ of this same
  scale — 80/96/160px — rather than departing from it; every other site
  runs closer to the 48px default, in service of Carbon's own "functional
  density" doctrine, which is correct for four of six sites and wrong for
  exactly one (the hub, an essay/editorial surface).
- **Control geometry:** buttons 48px default / 40px compact / 64px
  expressive; inputs 40px default / 48px large, padding `0 16px`
  horizontal only; nav rows and icon buttons 48px. All comfortably clear
  the ≥44px touch-target floor.
- **Measure is per-site, not a uniform 68ch** — see `portfolioSites:` above. The one
  hard-coded exception is `adcpexplorer`'s `minmax(0, 48rem)`, an MDN
  live value that behaves as a cap rather than a character count.

## Elevation & Depth

Carbon's stated doctrine — "background-color layering, not shadows" — is
adopted as portfolio law, reinforced independently by this codebase's own
research (Stratechery: zero box-shadows across the whole site; The Verge:
two, in roughly 300KB of CSS). Concretely:

- `--elev-flat` / `--elev-layer`: **`none`.** Hierarchy is a background
  color change, never a shadow.
- `--elev-raised` / `--elev-overlay`: `0 2px 6px rgba(0,0,0,0.3)`,
  reserved _exclusively_ for elements that genuinely float — dropdowns,
  tooltips, modals. None of the six sites currently has one; the tokens
  exist so that if Phase C ever needs one, it reaches for this value
  instead of inventing a new shadow recipe.
- `adtechglossary` writes its own flatness down as an explicit triple —
  `--elev-raised: none; --elev-overlay: none; --elev-ring: none` — each
  with a comment, so that zero elevation reads in the source as a
  selected level of the system, not a gap a future agent "fixes" by
  adding a shadow. Grafted from Cal.com, the one template of five that
  names flatness as a level rather than an omission.
- **Focus:** Carbon's own `2px solid #0f62fe` inset focus ring is deleted
  along with the rest of Blue 60. It is replaced portfolio-wide by a
  neutral ring — `0 0 0 1px var(--fg-muted), 0 0 0 4px var(--focus-ring-halo)`
  — grafted from Vercel. A box-shadow ring, not an inset border, was
  chosen specifically because an inset hairline on a scrollable table
  (`display: block; overflow-x: auto`, load-bearing per `global.css:598-615`)
  can re-trigger a documented 390px-viewport table blowout; a ring does
  not participate in the box model and cannot.

## Shapes

Carbon ships four radius values: `{0, 2, 24, 50%}`, with 0px as the
dominant, near-universal treatment and 24px as its one named exception
(pill tags). This system extends that to eight values —
`{0, 2, 3, 4, 6, 8, 24, 99999}` — and allocates exactly one (plus, on two
sites, one deliberate secondary exception) per site, with no two sites
adjacent on the scale:

| Site                | Radius                                        | Note                                                                                              |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| adtechglossary      | **0px**                                       | Carbon's own dominant treatment, made this site's exclusive signature; single 24px chip exception |
| adcpexplorer        | 2px (cards) / **24px pill** (chrome)          | Carbon's own pill-tag exception, promoted to the whole nav                                        |
| aampexplorer        | **4px**, never pill                           | opposite axis to adcpexplorer                                                                     |
| briefgateway        | **6px**                                       | shared by controls and inputs                                                                     |
| agenticadlab        | **8px**                                       | the softest register in the portfolio                                                             |
| whatisagenticbuying | 3px (secondary) / **99999px pill** (CTA only) | 3px chosen specifically so it does not sit adjacent to adtechglossary's 0px                       |

Zero radius as a Carbon-wide default is explicitly demoted to
`adtechglossary`'s override alone — applying it to all six sites would
collapse this entire axis, which is one of the five axes the hardest pair
(reference-docs vs. glossary) is separated on.

## Components

This spec's `components:` block above covers the chassis-level shapes that
are genuinely the same everywhere (card, input, button, pill tag). Every
component that renders differently per site — the AnswerBox, the nav
masthead slot, the docs sidebar tree, the letter rail, the layer/component
switcher — has its **token inputs** defined per-site in
`src/sites/<site>.css` and is built (not merely themed) in Phase C. The
ownership map for who edits what is `/srv/ws/out/design-system-spec.md`
§9.8; the token names each of those components should consume are listed
inline in `tokens.css` under "AnswerBox recipe tokens" and throughout each
site file.

**AnswerBox — the slop-tell-#4 replacement.** The current
`.answer-box { border-left: 4px solid var(--accent) }` treatment fires
generic-web-slop tell #4 (the accent-rail cliché) on every one of the six
sites. It is deleted everywhere. Its structural precedence is untouched —
the AnswerBox still renders before body prose, a deliberate GEO decision
(machine-citable definitions surface first) — only its _visual_ treatment
changes, to Carbon's own precedence device: a one-step background-layer
shift plus the uppercase wayfinding label. `--answerbox-term-weight` drops
from the old hard-coded 700 to Carbon's ceiling, 600. No site may
reintroduce a left rule thicker than 2px; the one exception in the whole
portfolio is `adcpexplorer`'s sticky-TOC active-item marker, which is a
state indicator, not decoration.

## Do's and Don'ts

- **Do** treat `tokens.css` as append-only for chassis-wide values and
  every site's own file as the only place its ground, accent, radius or
  measure changes. Do not fork a second copy of the alias block.
- **Do** measure every accent against every ground it can actually render
  on, including a site's own non-toggling dark furniture (`aampexplorer`'s
  chrome band still needs its own on-chrome pair — `--site-accent-on-dark`,
  despite the name, is NOT a dark-mode token; it is that pair, consumed
  unconditionally). There is no OS dark mode to design a second pair for
  any more — dark mode is removed, portfolio-wide.
- **Do** run `grep -rn '0f62fe|edf5ff|0043ce|002d9c' packages/ sites/`
  before merging any change that touches color. Any hit that is not the
  `support-info-fill-only` declaration in this file is a regression to
  the exact stock-blue defect this system exists to remove.
- **Don't** introduce a seventh accent hue, a second sans-serif family, or
  a bold (700) weight anywhere. The type-personality axis between the
  three reference-flavoured sites is intentionally thin (one sans + one
  serif, differentiated by weight placement, line-height mode and
  tracking) — the fix for "these look too similar" is a louder ground,
  grid or radius separation, never a second typeface.
- **Don't** let `whatisagenticbuying`'s 96px display exemption propagate.
  It is named, commented, and scoped to exactly one site
  (`src/sites/whatisagenticbuying.css`). No other site may add display
  tracking beyond 14px or a display size beyond Carbon's own 60px
  ceiling.
- **Don't** reuse `adcpexplorer`'s 2px left-rule TOC marker's exception as
  precedent for a thicker rail elsewhere. It is the _only_ permitted 2px
  left rule in the portfolio.
- **Don't** let `adtechglossary`'s zero-radius, zero-elevation, zero-
  tracking declarations read as absence. They are named levels
  (`--elev-raised: none`, `--site-radius: var(--radius-0)`,
  `--track-display: 0`), each with a comment explaining why, specifically
  so nobody "completes" them by adding rounding or a shadow.
- **Don't** reintroduce a `@media (prefers-color-scheme: dark)` block,
  per-site or global. Dark mode is removed portfolio-wide by orchestrator
  decision — see the note under `portfolioSites:` above and
  `/srv/ws/out/design-system-spec.md` §10 ruling 4 (marked VOID). The one
  thing that looks like dark mode but isn't: `aampexplorer`'s
  `--chrome-*` band, a permanent, non-toggling structural device.

## Font Loading

Three families, self-hosted, latin subset only, once shipped:

| Family                   | Weights     | Sites               | Measured latin payload |
| ------------------------ | ----------- | ------------------- | ---------------------- |
| IBM Plex Sans (variable) | 300/400/600 | all six             | 44.6 KB                |
| IBM Plex Mono            | 400         | all six             | 14.4 KB                |
| IBM Plex Serif           | 300         | `agenticadlab` only | 19.7 KB                |

Five sites pay 59.0 KB (Sans + Mono); the hub pays 64.3 KB (Sans + Serif);
distinct portfolio payload is 78.7 KB across three files — against today's
literal zero. Requesting weights 300/400/600 on the variable Sans file
returns the same latin URL for all three, so the whole three-weight system
costs one request. `latin-ext` must **not** be declared (+30.2 KB of
glyphs this corpus never uses). The content tree contains U+2192 (→),
U+2198 (↘) and U+26A0 (⚠), which sit outside Google's standard latin
`unicode-range` — any subsetting pass must add them explicitly or thirteen
glyphs fall back mid-line.

This package does **not** ship `fonts.css` or the subsetted `.woff2` files
yet. `size-adjust` / `ascent-override` / `descent-override` values for the
metric-matched fallback faces must be measured against the actual shipped
subset files, not invented — that measurement, plus the conditional
`<link rel="preload">` wiring keyed on `site`, is Phase C work.

## Per-Site Overrides

The full override table — ground ramp, ink, accent (with contrast
figures), radius, separation mechanic, structure and illustration direction
for all six sites — is authored once, in full, at
`/srv/ws/out/design-system-spec.md` §7.2, and implemented token-by-token in
this package's `src/sites/<site>.css` files (each of which carries its own
commented WCAG contrast table, per that document's ruling 6). This file's
`portfolioSites:` YAML block above is a condensed index into that table for quick
agent lookup — treat the CSS files as the executable source of truth and
`design-system-spec.md` §7 as the narrative one.

The three-site acid test — `adcpexplorer` / `aampexplorer` /
`adtechglossary`, the hardest pair-of-pairs in the portfolio because all
three sit in reference-flavoured territory — separates on five simultaneous
axes before a single word is read: page ground value, layer direction,
radius, separation mechanic, and structure (nav tree + capped prose vs.
plane switcher + schema-compare pane vs. letter rail + flowing inline
links). Two of those five are enforced by the underlying data, not by
choice: `data/adcp-specs.json` has one version and no per-component
licences (`components: []`), so a version tag can exist there and nowhere
else; `data/aamp-specs.json` has three named layers and per-component
licences but no single version to select, so a plane switcher can exist
there and nowhere else.

## Provenance

- **Source system:** IBM Carbon —
  `/usr/local/lib/hermes-agent/skills/creative/popular-web-designs/templates/ibm.md`
  (345 lines), cited above as `ibm.md:N`.
- **Selection document:** `/srv/ws/out/design-system-spec.md` (827 lines)
  — the full four-criteria scoring against HashiCorp, Vercel, Notion and
  Cal.com, every graft from a runner-up template, the 15-pair
  non-confusion proof, and the 13 resolved rulings Phase C may not
  re-litigate.
- **Research base:** `/srv/ws/out/design-research.md` (850 lines) — live-
  verified values from the current codebase, tagged `[live]` / `[skill]`
  / `[inferred]` by provenance.
- Every color value in this file and in `src/sites/*.css` is either (a)
  quoted from `ibm.md` verbatim, (b) a live-verified figure from the
  current repo, or (c) marked `[ADAPTATION]` with a stated reason and,
  where it is a new WCAG pairing this package computed rather than the
  selection document, marked `[computed]` with the resulting ratio.
  Nothing here is an invented hex with no reason attached.
