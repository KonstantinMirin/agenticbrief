/**
 * Slug -> illustration slot map for term pages.
 *
 * Design brief §7 / F4: content/** is frozen, so illustration placement
 * cannot live in the markdown frontmatter. This site-local map is what
 * `[section]/[slug].astro` reads instead — two entries, matching the two
 * placements that survived the four QC gates in
 * /srv/ws/out/illustration-prompts-adtechglossary.md.
 *
 * Most entries need none (spec §6.5) — an unmapped slug renders no slot.
 */

export interface IllustrationSlot {
  /** catalogue key, matching illustration-prompts-adtechglossary.md */
  slug: string
  /** short, human, accessibility-grade description — never prompt jargon */
  alt: string
  /** CSS aspect-ratio value; this site's default is near-square 1:1 */
  ratio: string
  /** full generation prompt, carried verbatim into data-illustration-prompt */
  prompt: string
}

const STYLE_PROMPT = `Flat 2D diagram, hand-drawn line-art style, white #ffffff background,
near-square 1:1 composition, at most 4 elements, clinical and minimal —
single-concept micro-diagram only. Every line and label is near-black
#161616 except the one amber #845720 accent element named below.`

export const ILLUSTRATIONS: Record<string, IllustrationSlot> = {
  'audience-vs-signal': {
    slug: 'adtechglossary/audience-vs-signal/ownership-boundary',
    alt: 'Diagram: an audience reaches only the one seller it was uploaded to; a signal reaches every seller that discovers it.',
    ratio: '1 / 1',
    prompt: `${STYLE_PROMPT}

DIAGRAM CONTENT:
Four rectangles on a 2x2 arrangement, flat 2D, hand-drawn line work.
LEFT COLUMN, TOP: rectangle, text "AUDIENCE".
LEFT COLUMN, BOTTOM: rectangle, text "SIGNAL".
RIGHT COLUMN, TOP: rectangle, text "SELLER A".
RIGHT COLUMN, BOTTOM: rectangle, text "SELLER B".
ARROW 1: from AUDIENCE to SELLER A, horizontal, labeled "upload".
There is NO arrow of any kind from AUDIENCE to SELLER B.
ARROW 2: from SIGNAL to SELLER A, labeled "discover".
ARROW 3: from SIGNAL to SELLER B, labeled "discover".
BARRIER: one HARD THICK HORIZONTAL LINE drawn between SELLER A and
SELLER B, spanning the full width of the right column. Arrow 1 stops
dead at SELLER A and never crosses this line.
ACCENT: the barrier line, and only the barrier line, is drawn in amber
#845720. Every other line and all text is near-black #161616.
The visual contrast: one arrow reaching one box above an absolute
barrier, against two arrows reaching both boxes across it.`,
  },
  package: {
    slug: 'adtechglossary/package/package-name-collision',
    alt: 'Diagram: the word Package resolves to two unrelated objects, one on each side of an agentic media buy.',
    ratio: '1 / 1',
    prompt: `${STYLE_PROMPT}

DIAGRAM CONTENT:
Radial split, three rectangles, flat 2D, hand-drawn line work.
TOP CENTRE: one rectangle, text "PACKAGE".
BOTTOM LEFT: one rectangle, text "AdCP", subtext "one product inside
a media buy".
BOTTOM RIGHT: one rectangle, text "AAMP", subtext "a curation layer
over products".
ARROW 1: from TOP CENTRE box down-left to the AdCP box, labeled
"after the buy".
ARROW 2: from TOP CENTRE box down-right to the AAMP box, labeled
"before the buy".
Nothing connects the AdCP box to the AAMP box.
ACCENT: the TOP CENTRE rectangle's outline and the word "PACKAGE"
inside it are amber #845720. Both bottom rectangles, both arrows and
all other text are near-black #161616.
The visual contrast: one contested word resolving to two unrelated
objects on opposite sides of the same transaction.`,
  },
}
