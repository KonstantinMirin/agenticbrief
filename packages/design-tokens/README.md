# @agenticbrief/design-tokens

The shared token chassis for the six-site Agentic Brief portfolio —
**"Carbon Chassis, No IBM Blue."** IBM Carbon's `--cds-*` role vocabulary,
8px grid, and IBM Plex type scale, adopted as a semantic-token system (not a
look), with IBM Blue 60 deleted as an accent everywhere and each site
carrying its own ground, accent, radius and measure on top.

Read **`DESIGN.md`** first — it is the human/agent source of truth for
_why_ these values exist, with WCAG contrast notes and per-site rationale.
This README only explains the mechanics of the cascade.

## What's in here

```
src/
  tokens.css              the chassis: --cds-* roles, type scale, spacing,
                           grid, elevation, control geometry, the 14-line
                           alias block (--bg/--fg/--accent/... -> --cds-*)
  sites/
    agenticadlab.css       one file per site, each a :root[data-site="…"]
    briefgateway.css        block that overrides the chassis's ground,
    adcpexplorer.css        accent, radius, measure. Light-only — no site
    aampexplorer.css        carries a dark-mode block (removed portfolio-
    adtechglossary.css      wide, see "Light-only, portfolio-wide" below).
    whatisagenticbuying.css
  index.css                imports tokens.css + all six site files, in the
                           fixed order documented at the top of that file
```

No build step — these are plain CSS custom-property files. No JS, no
Tailwind config, nothing to compile. A consumer either imports
`index.css` (gets everything, only one site block ever applies) or a
specific site's stylesheet directly.

## How the cascade works

Every token value that is the **same on all six sites** lives in
`tokens.css`, on the bare `:root` selector (specificity `0,1,0`).

Every value that **differs per site** lives in that site's own file, under
`:root[data-site="<key>"]` (specificity `0,2,0`). Because an attribute
selector is always more specific than a bare `:root`, a site's own block
always wins over the chassis default — regardless of import order. Only
one `data-site` value is ever present on `<html>` in a given build, so only
one of the six blocks ever actually applies; the other five ship as a few
hundred bytes of inert, unmatched CSS.

### Light-only, portfolio-wide

Dark mode is **removed portfolio-wide** (orchestrator decision — AI design
converges on "black + neon" in dark mode, so all six-way differentiation
lives in light; see `/srv/ws/out/design-system-spec.md` §10 ruling 4, marked
**VOID**). No site file carries a `@media (prefers-color-scheme: dark)`
block. Do not add one back, per-site or global.

Two notes for the record:

- `aampexplorer`'s `--chrome-bg`/`--chrome-*` tokens (a `#161616`/`#262626`
  band) are **kept** — they are a permanent light-mode composition device
  (dark structural chrome on an otherwise-light page, in the register of
  Monocle/Bloomberg), not a `prefers-color-scheme` dark mode. It never
  toggles with the OS theme.
- `whatisagenticbuying` used to be dark **by default** (its only canvas,
  `#161616`), which is exactly the "black + neon" pattern this decision
  rejects. It has been reset to a neutral Carbon White ground as a
  buildable placeholder — see that file's TODO banner — pending a real
  light editorial identity designed in a later phase.

## How a site opts in

A site does exactly two things (both Phase C — this package does not touch
site code):

1. Import the tokens once, near the top of the global stylesheet chain:
   ```js
   import '@agenticbrief/design-tokens/index.css'
   ```
2. Set the `data-site` attribute on the root `<html>` element, matching the
   site's `key` in `packages/shared-ui/src/sites.ts`:
   ```astro
   <html lang="en" data-site="adcpexplorer"></html>
   ```

That's it — no per-site CSS file to import individually, no class to add
per page, no JS. The attribute is what selects the right override block at
render time.

### The alias layer — why nothing else needs to change

`tokens.css` ends with a block that maps the repo's EXISTING variable names
(`--bg`, `--fg`, `--accent`, `--accent-bright`, `--font-sans`, `--measure`,
`--radius`, …) onto the new `--cds-*` chassis. `global.css` and
`generate.astro` already consume those existing names throughout — so
wiring this package in requires deleting `global.css`'s own `:root` blocks
(the ones currently hard-coding `--bg: #ffffff` etc.) and nothing else.
Zero class renames, zero selector renames. See `DESIGN.md` and
`/srv/ws/out/design-system-spec.md` §11 for the full integration plan and
its named breakage risks — in particular, the `:root` deletion must land in
the same commit as the import, or per-site theming silently does nothing.

## What this package does NOT do

- It does not import any site's files, `shared-ui`, or `global.css`. Those
  edits are Phase C's.
- It does not self-host IBM Plex yet. `tokens.css`'s `--cds-font-*` stacks
  end in system fallbacks, so importing this package today changes zero
  bytes of font payload. Adding `fonts.css` + subsetted `.woff2` files is
  named as follow-up work in `DESIGN.md`.
- It does not restructure `packages/shared-ui/src/sites.ts` — that file is
  regex-read by `scripts/deploy.sh` and must keep its `key`/`deployDomain`
  adjacency.
