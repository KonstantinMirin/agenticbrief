/**
 * The canonical worked example.
 *
 * The same brief the engine's extractor suites are written against, so what
 * the site shows is what the tests assert. It was a `const` inside
 * `pages/generate.astro` until the homepage needed to print the same
 * paragraph and the same classification; two literals would have drifted, and
 * a drift here is invisible (both pages still render, they just stop agreeing
 * about what the engine reads). One module, two importers.
 *
 * It is also quoted verbatim as a ```text fence in
 * `content/briefs/index-generator.md` — published copy, not editable from
 * here. If this string ever changes, that fence changes with it.
 *
 * NOTE for `/generate/`: only the Astro frontmatter reads this. The mirrored
 * client renderer in that page shares no scope with its frontmatter and takes
 * the brief from the textarea, so no import crosses that boundary.
 */
export const EXAMPLE_BRIEF =
  'Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display ' +
  'and online video. Budget: $500,000 net. Market: United States. Target demo: ' +
  'adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental ' +
  'household penetration and retail sales lift. Requirements: premium CTV inventory, ' +
  'brand safety controls, frequency cap 3 per week.'
