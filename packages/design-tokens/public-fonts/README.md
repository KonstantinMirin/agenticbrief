# Self-hosted IBM Plex subsets

Three `.woff2` files, subset to latin and served from each site's `dist/_astro/`.

| File                             | Bytes  | Used by                                          |
| -------------------------------- | ------ | ------------------------------------------------ |
| `ibm-plex-sans-var-latin.woff2`  | 39,912 | all six sites (variable, `font-weight: 300 600`) |
| `ibm-plex-mono-400-latin.woff2`  | 10,204 | all six sites (weight 400 ONLY — see below)      |
| `ibm-plex-serif-300-latin.woff2` | 15,432 | **agenticadlab only** (weight 300 only)          |

Portfolio distinct payload: 65,548 B across 3 files. Per site: 50,116 B
(Sans + Mono), or 55,344 B on agenticadlab (Sans + Serif).

## Licence

IBM Plex is licensed under the **SIL Open Font License 1.1** — see `OFL.txt`,
copied verbatim from the upstream `google/fonts` repository. The OFL requires
that this notice travel with the font files wherever they are redistributed,
which includes every built `dist/`. Do not delete `OFL.txt`.

Copyright © 2017 IBM Corp. with Reserved Font Name "Plex".

## How these were produced

Source TTFs from the `google/fonts` repository (`ofl/ibmplexsans`,
`ofl/ibmplexmono`, `ofl/ibmplexserif`), then:

- `fonttools varLib.instancer` — pinned `wdth=100`, restricted `wght` to 300–600
- `pyftsubset` — latin plus `U+2192,U+2198`

`U+26A0` (⚠) is deliberately NOT declared in `unicode-range`: IBM Plex contains
no glyph at that codepoint in any weight. Declaring it would claim coverage the
font does not have, block fallback to a system font that does, and render
`.notdef`.

## The weight constraint that bit us once

**Mono and Serif ship ONE weight each (400 and 300).** Asking for any other
weight used to make Chrome paint a synthetic bold — measured at +41.8% ink with
an identical advance width, live on 2,252 elements across four sites, landing
squarely on the mono metadata face that three sites use as a differentiator.

Two guards now prevent it: the chassis sets `--label-weight: 400`, and
`global.css` sets `font-synthesis-weight: none` on `body`, so a request for a
weight that does not exist degrades to the real one instead of being faked.
Sans is unaffected — it is variable across 300–600, and 700 clamps to the axis
cap rather than synthesising.
