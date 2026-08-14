/**
 * Illustration slot content for aampexplorer (design brief §7).
 *
 * `STYLE_PROMPT` is this site's `_base` style block, carried verbatim from
 * /srv/ws/out/illustration-prompts-aampexplorer.md (this site's own catalogue
 * file — a shared prompts file is not touched, per the file contract). The
 * `{house_style}` token is left unresolved, exactly as the catalogue itself
 * leaves it — a downstream generation pipeline concern, not this site's.
 *
 * Each entry's `prompt` is the catalogue's `base_prompt` template
 * (`{style_prompt}\n\nDIAGRAM CONTENT:\n{diagrams.content}`) with both
 * placeholders resolved, matching what `IllustrationPlaceholder.prompt`
 * documents it should carry.
 */

const STYLE_PROMPT = `{house_style}

**Site register:** aampexplorer — same reference-docs register as
adcpexplorer (straightest line formality, rigid grid), same motif
library, differentiated ONLY at the accent layer — per
design-research.md §6.5, "identical base template except accent."

**Strict color palette (light-ground diagrams):**
- Background: pure white (#ffffff).
- Lines & text: near-black (#161616).
- Accent: violet #6c3aa6 ONLY.

**Strict color palette (dark-ground / inverted variant — REQUIRED for
any diagram placed inside this site's dark chrome band, per
design-research.md §6.5's dark-canvas note):**
- Background: near-black (#161616), matching the chrome band exactly.
- Lines & text: light gray (#f4f4f4) / mid gray (#c6c6c6).
- Accent: lifted violet #b197ff ONLY (the light-mode #6c3aa6 fails
  contrast on a dark ground — do not reuse it).
- Pick ONE variant per diagram, matching the ground it will actually
  render on. Never place a white-ground diagram inside the dark chrome
  band — it punches a white rectangle into the page (§6.5 dark note).

**Aspect ratio:** 4:3 or 1:1, inline — same placement rule as adcpexplorer.

**Motif library:** request-response, schema/object, sequence-flow
arrows (identical to adcpexplorer's library).`

function basePrompt(content: string): string {
  return `${STYLE_PROMPT}\n\nDIAGRAM CONTENT:\n${content}`
}

export interface IllustrationSlot {
  slug: string
  ratio: string
  alt: string
  prompt: string
}

export const ILLUSTRATIONS = {
  dependencyReality: {
    slug: 'aampexplorer/index/dependency-reality',
    ratio: '1 / 1',
    alt: 'Diagram: buyer-agent and seller-agent both pin iab-agentic-primitives at v0.5.0; three other repositories connect to nothing a build resolves.',
    prompt: basePrompt(`LIGHT-GROUND VARIANT (pure white background, near-black #161616
lines, violet #6c3aa6 accent). Square composition, split by one
horizontal line across the full width at roughly two-thirds height.
ABOVE THE LINE, three rectangles in a row: LEFT rectangle, text
"buyer-agent". CENTER rectangle, text "iab-agentic-primitives".
RIGHT rectangle, text "seller-agent". One arrow from the LEFT
rectangle to the CENTER rectangle, label "pins v0.5.0". One arrow
from the RIGHT rectangle to the CENTER rectangle, label
"pins v0.5.0". THE DIVIDING LINE is a single HARD horizontal rule,
with the text "nothing a build resolves" sitting just below it on
the left. BELOW THE LINE, three smaller rectangles in a row, evenly
spaced, with NO arrows of any kind touching them: "agentic-direct",
"registry-agent-example", "agentic-rtb-framework". The absence of
arrows below the line is the point of the diagram and must be
preserved exactly. Accent highlight (violet #6c3aa6) on the CENTER
rectangle's border only. Six rectangles and one line, nothing else.`),
  },
  threeLayerStack: {
    slug: 'aampexplorer/repos/three-layer-stack',
    ratio: '4 / 3',
    alt: "Diagram: AAMP's control, real-time and data planes drawn as three equal-width bands, though they hold 4, 1 and 1 repository respectively.",
    prompt: basePrompt(`LIGHT-GROUND VARIANT (pure white background, near-black #161616
lines, violet #6c3aa6 accent). Three stacked horizontal rectangles,
top to bottom, EXACTLY THE SAME WIDTH and the same height as each
other — no size difference may imply hierarchy. Text inside each,
left-aligned: top "Control plane — 4 repos", middle
"Real-time plane — 1 repo", bottom "Data plane — 1 repo". Use those
exact strings, no synonyms. A single thin vertical arrow runs down
the LEFT edge of the stack from the top rectangle to the bottom
one, with the label "separately versioned" written beside it,
rotated to read normally (horizontal text, not vertical). Accent
highlight (violet #6c3aa6) on the TOP rectangle's border only.
Four elements total.`),
  },
  negotiationHandshake: {
    slug: 'aampexplorer/negotiation/negotiation-handshake',
    ratio: '4 / 3',
    alt: 'Diagram: the buyer and seller agents propose and counter terms, with trust status gating both directions of the exchange.',
    prompt: basePrompt(`LIGHT-GROUND VARIANT (white background, violet #6c3aa6 accent —
this diagram is placed in the white content column, not the dark
chrome band). Sequence-flow, two boxes. LEFT: rectangle, text
"Buyer agent". RIGHT: rectangle, text "Seller agent". Arrow left
to right, label "propose terms". Arrow right to left, label
"counter or accept". A small circle sits between the two arrows
labeled "trust status", since negotiation in AAMP is gated on
trust state, not just price. Accent highlight (violet #6c3aa6) on
the trust-status circle only.`),
  },
  tagVsBranch: {
    slug: 'aampexplorer/versions/tag-vs-branch',
    ratio: '4 / 3',
    alt: 'Diagram: the tag v2.3.0 sits 24 commits behind the branch head it points into.',
    prompt: basePrompt(`LIGHT-GROUND VARIANT (pure white background, near-black #161616
lines, violet #6c3aa6 accent). One horizontal line running left to
right across the middle of the frame, with five small rough circles
spaced along it representing commits. A rectangle sits ABOVE the
line on the far LEFT, text "tag v2.3.0", with a short arrow
pointing DOWN from it to the FIRST circle. A second rectangle sits
ABOVE the line on the far RIGHT, text "branch head", with a short
arrow pointing DOWN from it to the LAST circle. BELOW the line,
spanning the distance between the first and last circles, draw a
simple horizontal bracket with the text "24 commits" written under
its center. Accent highlight (violet #6c3aa6) on the
"tag v2.3.0" rectangle's border only. Two rectangles, one commit
line, one bracket.`),
  },
} as const satisfies Record<string, IllustrationSlot>
