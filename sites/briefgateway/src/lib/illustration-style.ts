/**
 * The full illustration generation prompt for briefgateway, assembled once
 * so every `<IllustrationPlaceholder>` call site on this site interpolates
 * the same style block rather than retyping it. Mirrors
 * `/srv/ws/out/illustration-prompts.md`'s `{style_prompt}` mechanic: the
 * portfolio-wide `house_style` block, folded into briefgateway's own
 * `_base/briefgateway-illustration-base.yaml` register (source:
 * `/srv/ws/out/illustration-prompts.md:88-142, 187-229`).
 *
 * This is a prompt string, not a design token — it lives here rather than
 * in `illustration-prompts-briefgateway.md` because a `prompt` prop must be
 * plain text, and duplicating it by hand in three `.astro` files would let
 * the pages and the catalogue file drift the way the catalogue file itself
 * warns against (§0 "append, never fork").
 */

const HOUSE_STYLE = `**Visual Aesthetic:** Technical diagram in a "senior engineer's whiteboard
sketch" style (Reference: Excalidraw, Dan Roam's "Back of the Napkin").
Digital napkin sketch, NOT a photo of a real whiteboard. Line-based,
2–3px strokes, hand-drawn feel with slightly imperfect, non-ruler-straight
corners. Flat 2D. NO isometric, NO 3D, NO shadows, NO gradients.

**Abstraction:** conceptual primitives only — rectangles, rough
circles/ovals, arrows, lines, text labels. Documents = rectangles. Folders
= rectangles. Everything = rectangles + text. Disambiguate flowchart
shapes explicitly in every diagram's content (e.g. "DIAMOND for decisions,
RECTANGLE for operations" — never "diamond or rectangle").

**Hard caps:** maximum 5–7 elements. Minimum 70% whitespace. Must pass a
3-second comprehension test.

**Negative constraints (forbidden, every site):**
- NO folded-corner document icons.
- NO laptop/computer illustrations (see each site's own hardware rule below).
- NO cute icons, mascots, stick figures, robots, or characters.
- NO shading, gradients, or fills beyond the one named accent.
- NO rounded corners on any drawn shape.
- NO multiple stroke weights.
- NO gray textured backgrounds.
- NO generic metaphors (walls, barriers, trash cans).
- NO flow diagrams that just restate the prose as boxes and arrows.
- NO jargon the site's own audience does not already use.
- NO more than 7 elements.
- NO captions baked into the image — captions belong to the surrounding
  page copy, never inside the generated pixels.
- NO IBM Blue #0f62fe (or #edf5ff, #0043ce, #002d9c) anywhere —
  portfolio-wide deletion (design-system-spec.md ruling 8) applies to
  illustrations too.`

const BRIEFGATEWAY_SITE_REGISTER = `**Site register:** briefgateway — the tool. Tight, UI-accurate line
formality; this is the ONE site where the house "no literal technology"
rule is deliberately relaxed for *interface* content (not hardware):
literal wireframe sketches of form fields, buttons, toggles, and empty
states are CORRECT here, the way Stripe and Vercel's own docs lean on
real UI mockups rather than concept art. Still NO laptops, monitors,
servers, or other physical hardware.

**Strict color palette:**
- Background: pure white (#ffffff).
- Lines & text: near-black (#161616).
- Accent: functional blue #0057c2 ONLY — this site carries no brand
  hue, so the accent reads as a status/state signal (e.g. "this field
  is filled," "this step is active"), never decoration.
- NO other colors, NO gradients.

**Aspect ratio:** wide (16:9) or 4:3.

**Motif library:** literal interface wireframes (rectangle = input
field, labeled; rounded-corner-free toggle/button primitives); pipeline
/ before-after / funnel diagrams mapped to the /generate/ flow
(brief text in → score + gaps out). A wireframe of a text field and a
score readout is a correct diagram here; a picture of a person typing
is not.`

/** `{style_prompt}` — house style plus this site's register, verbatim order. */
export const BRIEFGATEWAY_ILLUSTRATION_STYLE_PROMPT = `${HOUSE_STYLE}\n\n${BRIEFGATEWAY_SITE_REGISTER}`

/** Builds a full generation prompt: `{style_prompt}\n\nDIAGRAM CONTENT:\n{diagrams.content}`. */
export function illustrationPrompt(diagramContent: string): string {
  return `${BRIEFGATEWAY_ILLUSTRATION_STYLE_PROMPT}\n\nDIAGRAM CONTENT:\n${diagramContent.trim()}`
}
