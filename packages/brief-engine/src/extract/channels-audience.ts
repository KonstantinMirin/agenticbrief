/**
 * Extractor: channels, formats, placements and audience.
 *
 * THE ONE RULE: no silent invention. Every value this module emits is either
 * a span of text the buyer typed (`stated`), or a value produced by a named
 * rule that fired on such a span (`derived`). Nothing else is emitted. Where a
 * concept is stated but has nowhere to go on the wire, the concept is recorded
 * with the loss written down — it is never rounded to the nearest enum value
 * that happens to exist.
 *
 * The three inventions this file exists to refuse:
 *
 *  1. A channel budget split nobody stated. AAMP's `ChannelAllocation.budget_pct`
 *     is required on every allocation and the values must sum to 100, so a brief
 *     that names channels without a split cannot construct. The tempting repair
 *     — divide evenly, or write 60/25/15 — turns a gap into a commitment. This
 *     module labels the split `missing` and says why. It never distributes.
 *  2. A format ID from a pixel size. `core/format-id.json` is an object with a
 *     required `agent_url`; "300x250" is not one and cannot become one. The
 *     pinned registry (`registries/v1-canonical-mapping.json`) is normatively
 *     one-directional and states that SDKs MUST NOT synthesize a v1 `format_id`
 *     from it, precisely because the slugs lack the `agent_url` half. So the
 *     size is recorded as stated-and-unmappable, with the registry's observed
 *     slug reported as evidence rather than as an answer.
 *  3. An audience taxonomy ID from a demo string. "adults 25-54" is not an IAB
 *     Audience Taxonomy 1.1 identifier and no lookup in either protocol's
 *     schemas turns it into one. The demo is recorded structurally; the fact
 *     that neither `filters.signal_targeting` (SignalRefs, resolved against a
 *     signals agent) nor `AudiencePlan.primary` (a typed AudienceRef) can carry
 *     it is a warning, not a guess.
 *
 * Ambiguity is returned, never resolved. "outstream", bare "video", bare "TV",
 * bare "streaming" and a bare "$" all name more than one protocol value; each
 * produces a warning and no value.
 *
 * Determinism: pure function of its arguments. No I/O, no network, no clock,
 * no module-level mutable state. Every regex is module-scope and consumed only
 * through `String.prototype.matchAll`, which iterates over an internal clone
 * and therefore never mutates the shared literal's `lastIndex`.
 *
 * Vocabularies transcribed from, and only from:
 *   AdCP 3.1.10  enums/channels.json, enums/video-placement-type.json,
 *                enums/audio-distribution-type.json,
 *                enums/sponsored-placement-type.json,
 *                enums/social-placement-surface.json,
 *                core/product-filters.json, core/format-id.json,
 *                registries/v1-canonical-mapping.json (registry v1.3.0,
 *                last_updated 2026-08-03)
 *   AAMP         models/campaign_brief.py (ChannelType, ChannelAllocation),
 *                models/audience_plan.py (AudiencePlan, AudienceRef)
 */

import type { Extraction, FieldValue, Span } from '../types.ts'

/** Value of `FieldValue.extractor` on everything this module proposes. */
const EXTRACTOR = 'channels-audience'

/* ==================================================================== *
 * Public value shapes
 *
 * The field map binds several of these keys to BOTH protocols with
 * different vocabularies, so a single scalar cannot carry the answer.
 * Each value below therefore carries the AdCP view and the AAMP view
 * side by side, with `null` where a protocol has no value — the null is
 * the finding, and the emitters must not paper over it.
 * ==================================================================== */

/** A value of AdCP `enums/channels.json` (20 values at 3.1.10). */
export type AdcpChannel =
  | 'display'
  | 'olv'
  | 'social'
  | 'search'
  | 'ctv'
  | 'linear_tv'
  | 'radio'
  | 'streaming_audio'
  | 'podcast'
  | 'dooh'
  | 'ooh'
  | 'print'
  | 'cinema'
  | 'email'
  | 'gaming'
  | 'retail_media'
  | 'influencer'
  | 'affiliate'
  | 'product_placement'
  | 'sponsored_intelligence'

/** A value of AAMP `ChannelType` (6 values). */
export type AampChannel = 'CTV' | 'DISPLAY' | 'AUDIO' | 'NATIVE' | 'DOOH' | 'LINEAR_TV'

/** One channel the buyer named, in both vocabularies. */
export interface ChannelValue {
  /** AdCP channel enum value, or null when AdCP has no channel for this concept. */
  adcp: AdcpChannel | null
  /** AAMP ChannelType value, or null when AAMP has no channel for this concept. */
  aamp: AampChannel | null
  /** The words the buyer actually typed, verbatim. */
  surface: string
}

/** One AAMP `ChannelAllocation`, as far as the brief actually states it. */
export interface ChannelAllocationValue {
  channel: ChannelValue
  /** Percentage of total budget, exactly as stated. Never computed, never normalised. */
  budget_pct: number
}

/**
 * One creative format the buyer named. `adcpFormatId` is always null: a pixel
 * size or a duration is not a `format-id` object and the engine will not invent
 * the `agent_url` half of one.
 */
export interface FormatValue {
  /** Verbatim surface form ("300x250", "30s"). */
  surface: string
  kind: 'pixel_size' | 'duration'
  width?: number
  height?: number
  duration_ms?: number
  /**
   * Slug observed in AdCP `registries/v1-canonical-mapping.json` (v1.3.0) for
   * this size/duration, or null when the registry lists none. Evidence only:
   * the registry is authoritative for v1 -> v2 projection and explicitly
   * forbids synthesizing a v1 `format_id` by inverting it.
   */
  observedV1Slug: string | null
  /** v2 canonical format kind that registry entry projects to, or null. */
  canonicalFormat: string | null
  /** Always null. See `observedV1Slug`. */
  adcpFormatId: null
  /** What AAMP `channels[].format_prefs` can carry: the buyer's own string. */
  aampFormatPref: string
}

/** One structured piece of a demographic statement. */
export interface AudienceDescriptor {
  kind: 'age_range' | 'gender' | 'household_income' | 'unparsed'
  /** Verbatim surface form. */
  surface: string
  /** age_range: inclusive lower bound. */
  ageMin?: number
  /** age_range: inclusive upper bound; absent for open-ended ("25+"). */
  ageMax?: number
  /** gender: as stated. The engine never writes 'all' for an unstated gender. */
  gender?: 'female' | 'male'
  /** household_income: normalised floor, or null when the magnitude is ambiguous. */
  incomeMin?: number | null
  /** household_income: the symbol as typed. Never an ISO 4217 code — '$' is not one. */
  currencySymbol?: string | null
}

/** The audience as this engine can honestly hold it. */
export interface AudienceValue {
  descriptors: AudienceDescriptor[]
  /**
   * Always null. AdCP `filters.signal_targeting` takes SignalRefs that are
   * resolved against a signals agent at runtime; a demo string is not one and
   * the engine makes no network call to find out.
   */
  adcpSignalTargeting: null
  /**
   * What AAMP could hold. `AudiencePlan.primary` is a required `AudienceRef`
   * carrying type + identifier + taxonomy + version + source; no taxonomy
   * identifier is derivable from a demo string, so `primary` stays null and
   * the plan does not construct. `rationale` is the only free-text slot.
   */
  aampAudiencePlan: { primary: null; rationale: string }
}

/** What this extractor returns. Assignable to `Extraction`. */
export interface ChannelsAudienceExtraction extends Extraction {
  fields: Record<string, FieldValue<unknown>>
  /** Assumption candidates. Always `label: 'assumed'`; never emitted unaccepted. */
  offered: Record<string, FieldValue<unknown>>
  warnings: string[]
}

/** Options. `referenceDate` is accepted for signature parity with the sibling
 * extractors; no rule in this module reads a date, so it does not affect the
 * output. Stated here rather than silently ignored. */
export interface ChannelsAudienceOptions {
  referenceDate?: string
}

/** The nine field-map keys this extractor is competent for. Always all present. */
export const OWNED_KEYS = [
  'channels',
  'channel_budget_split',
  'format_ids',
  'standard_formats_only',
  'video_placement_types',
  'audio_distribution_types',
  'sponsored_placement_types',
  'social_placement_surfaces',
  'audience_primary',
] as const

/* ==================================================================== *
 * Span helpers
 * ==================================================================== */

function makeSpan(text: string, start: number, end: number): Span {
  return { start, end, text: text.slice(start, end) }
}

/** Every match of `re` (which must be global) as a Span, in text order. */
function scan(text: string, re: RegExp): Array<{ span: Span; groups: string[] }> {
  const out: Array<{ span: Span; groups: string[] }> = []
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0
    out.push({
      span: makeSpan(text, start, start + m[0].length),
      groups: m.slice(1).map((g) => g ?? ''),
    })
  }
  return out
}

/** Half-open sentence ranges, used to keep a percentage from binding to a
 * channel in a different sentence. Split on `.`/`;`/newline followed by
 * whitespace or end-of-input, so "60.5%" and "$500,000." do not split. */
const SENTENCE_BREAK_RE = /[.;\n](?=\s|$)/g

function sentenceRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  let start = 0
  for (const m of text.matchAll(SENTENCE_BREAK_RE)) {
    const end = (m.index ?? 0) + 1
    ranges.push([start, end])
    start = end
  }
  if (start < text.length) ranges.push([start, text.length])
  return ranges
}

function sentenceAt(ranges: Array<[number, number]>, index: number): [number, number] {
  for (const r of ranges) if (index >= r[0] && index < r[1]) return r
  return [0, 0]
}

/* ==================================================================== *
 * Lexicon machinery
 *
 * A lexicon is an ordered list of (regex -> protocol value) entries. All
 * entries are matched, then overlapping matches are resolved longest-first
 * so that "connected TV" beats "TV" and "sponsored display" beats "display".
 * `disposition` decides the label:
 *   'name'      the buyer typed the vocabulary's own word     -> stated
 *   'synonym'   a mapping rule had to fire                    -> derived
 *   'ambiguous' the word names more than one value            -> no value + warning
 *   'block'     the words belong to another axis entirely     -> consumed, silent
 * ==================================================================== */

interface Lexeme<V> {
  /** Global, case-insensitive unless the vocabulary is genuinely case-bearing. */
  re: RegExp
  /** The protocol value, or null for 'ambiguous'/'block'. */
  value: V | null
  disposition: 'name' | 'synonym' | 'ambiguous' | 'block'
  /** For 'synonym': the derivation, written for a human. Required. */
  rule?: string
  /** For 'ambiguous': what the reader must decide. Required. */
  warning?: string
  /** Extra caveat carried into the field note even when a value is produced. */
  note?: string
}

interface LexMatch<V> {
  span: Span
  lex: Lexeme<V>
}

function matchLexicon<V>(text: string, lexicon: Array<Lexeme<V>>): Array<LexMatch<V>> {
  const all: Array<LexMatch<V> & { order: number }> = []
  lexicon.forEach((lex, order) => {
    for (const { span } of scan(text, lex.re)) all.push({ span, lex, order })
  })
  // Longest match wins at a given start; earlier start wins overall; the
  // lexicon's own order breaks any remaining tie. Deterministic sort.
  all.sort(
    (a, b) =>
      a.span.start - b.span.start ||
      b.span.end - b.span.start - (a.span.end - a.span.start) ||
      a.order - b.order,
  )
  const accepted: Array<LexMatch<V>> = []
  let consumedTo = -1
  for (const m of all) {
    if (m.span.start < consumedTo) continue // overlaps an already-accepted, longer match
    accepted.push({ span: m.span, lex: m.lex })
    consumedTo = m.span.end
  }
  return accepted
}

/* ==================================================================== *
 * Channels — AdCP enums/channels.json x AAMP ChannelType
 * ==================================================================== */

/**
 * AAMP has six channel values to AdCP's twenty. Three AdCP audio channels
 * collapse onto AAMP AUDIO (and AAMP forbids duplicate channel types, so the
 * collapse is not merely lossy — it can make the brief unconstructable);
 * thirteen AdCP channels have no AAMP value at all; AAMP's NATIVE has no AdCP
 * channel, because AdCP models native as a format.
 */
const AAMP_FOR_ADCP: Readonly<Record<AdcpChannel, AampChannel | null>> = {
  ctv: 'CTV',
  display: 'DISPLAY',
  dooh: 'DOOH',
  linear_tv: 'LINEAR_TV',
  radio: 'AUDIO',
  streaming_audio: 'AUDIO',
  podcast: 'AUDIO',
  olv: null,
  social: null,
  search: null,
  ooh: null,
  print: null,
  cinema: null,
  email: null,
  gaming: null,
  retail_media: null,
  influencer: null,
  affiliate: null,
  product_placement: null,
  sponsored_intelligence: null,
}

/** Channel lexicon. Order is documentation; overlap is resolved by length. */
const CHANNEL_LEXICON: Array<Lexeme<AdcpChannel | 'AAMP_AUDIO_ONLY' | 'AAMP_NATIVE_ONLY'>> = [
  /* --- blockers: words that look like channels but name another axis --- */
  {
    // "sponsored display" / "sponsored search" / "sponsored products" are
    // retail-media placement types, not the display or search channel.
    re: /\bsponsored\s+(?:search|display|native|products?|brands?)\b/gi,
    value: null,
    disposition: 'block',
  },
  {
    // "native in-feed" is a canonical creative format, not a channel.
    re: /\bnative\s+in[-\s]?feed\b/gi,
    value: null,
    disposition: 'block',
  },

  /* --- CTV --- */
  { re: /\bctv\b/gi, value: 'ctv', disposition: 'name' },
  {
    re: /\bconnected[-\s]+(?:tv|television)\b/gi,
    value: 'ctv',
    disposition: 'synonym',
    rule: "'connected TV' is the expansion of the AdCP channel value `ctv` (enums/channels.json: 'Connected TV and streaming on television screens').",
  },
  {
    re: /\bstreaming[-\s]+(?:tv|television)\b/gi,
    value: 'ctv',
    disposition: 'synonym',
    rule: "'streaming TV' names streaming on a television screen, which is the AdCP channel `ctv`.",
  },
  {
    re: /\bsmart[-\s]tvs?\b/gi,
    value: 'ctv',
    disposition: 'synonym',
    rule: "'smart TV' names a television screen running streaming apps, which AdCP counts as `ctv`.",
  },
  {
    re: /\bott\b/gi,
    value: 'ctv',
    disposition: 'synonym',
    rule: "'OTT' (over-the-top) is mapped to the AdCP channel `ctv`, the only television-screen streaming value in enums/channels.json.",
    note: "'OTT' is broader than `ctv`: it also covers over-the-top viewing on phones and desktops, which AdCP counts as `olv`. The narrowing is the engine's, not the buyer's.",
  },

  /* --- linear TV --- */
  { re: /\blinear[-\s](?:tv|television)\b/gi, value: 'linear_tv', disposition: 'name' },
  {
    re: /\b(?:broadcast|cable)[-\s](?:tv|television)\b/gi,
    value: 'linear_tv',
    disposition: 'synonym',
    rule: "'broadcast/cable TV' is the AdCP channel `linear_tv` ('Traditional broadcast and cable television').",
  },

  /* --- display --- */
  { re: /\b(?:digital\s+|programmatic\s+)?displays?\b/gi, value: 'display', disposition: 'name' },
  {
    re: /\bbanners?\b/gi,
    value: 'display',
    disposition: 'synonym',
    rule: "'banner' names a display unit; AdCP's channel for it is `display` ('banners, native, rich media').",
  },
  {
    re: /\brich\s+media\b/gi,
    value: 'display',
    disposition: 'synonym',
    rule: "'rich media' is named in the AdCP `display` channel description.",
  },

  /* --- online video --- */
  { re: /\bolv\b/gi, value: 'olv', disposition: 'name' },
  {
    re: /\bonline\s+video\b/gi,
    value: 'olv',
    disposition: 'synonym',
    rule: "'online video' is the expansion of the AdCP channel value `olv` ('Online video advertising outside CTV').",
  },
  {
    re: /\bdigital\s+video\b/gi,
    value: 'olv',
    disposition: 'synonym',
    rule: "'digital video' outside the TV screen is the AdCP channel `olv`.",
  },

  /* --- social / search / retail media --- */
  { re: /\bsocial(?:\s+media)?\b/gi, value: 'social', disposition: 'name' },
  {
    // Bare "search" is far too common in prose to read as a channel, so the
    // channel is claimed only from an unambiguous media phrase.
    re: /\b(?:paid\s+search|search\s+(?:advertising|ads|campaigns?)|sem)\b/gi,
    value: 'search',
    disposition: 'synonym',
    rule: "'paid search'/'SEM' names the AdCP channel `search`.",
  },
  { re: /\bretail\s+media(?:\s+networks?)?\b/gi, value: 'retail_media', disposition: 'name' },
  {
    re: /\bcommerce\s+media\b/gi,
    value: 'retail_media',
    disposition: 'synonym',
    rule: "'commerce media' is named in the AdCP `retail_media` channel description ('Retail media networks and commerce marketplaces').",
  },

  /* --- audio: AdCP splits it three ways, AAMP has one value --- */
  { re: /\bpodcasts?\b/gi, value: 'podcast', disposition: 'name' },
  { re: /\bstreaming\s+audio\b/gi, value: 'streaming_audio', disposition: 'name' },
  {
    re: /\b(?:digital\s+audio|music\s+streaming)\b/gi,
    value: 'streaming_audio',
    disposition: 'synonym',
    rule: "'digital audio'/'music streaming' is the AdCP channel `streaming_audio` ('Spotify, Pandora, etc.').",
  },
  {
    re: /\b(?:web|internet|online)\s+radio\b/gi,
    value: 'streaming_audio',
    disposition: 'synonym',
    rule: "'web radio' is live audio available only online, which sits under the AdCP channel `streaming_audio`; `radio` is reserved for AM/FM broadcast.",
  },
  {
    re: /\bcatch[-\s]?up\s+radio\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'catch-up radio' is an audio *distribution* type (`catch_up_radio`), not an AdCP channel; the brief does not say whether it should be bought as `radio` or as `streaming_audio`, so no channel is recorded.",
  },
  {
    re: /\b(?:broadcast|terrestrial|am\/fm|fm|am)\s+radio\b/gi,
    value: 'radio',
    disposition: 'synonym',
    rule: "'broadcast/AM/FM radio' is the AdCP channel `radio` ('Traditional AM/FM radio broadcast').",
  },
  { re: /\bradio\b/gi, value: 'radio', disposition: 'name' },
  {
    // AdCP has NO generic audio channel. AAMP does. This asymmetry is the value.
    re: /\baudio\b/gi,
    value: 'AAMP_AUDIO_ONLY',
    disposition: 'synonym',
    rule: "'audio' populates AAMP's ChannelType.AUDIO; AdCP has no generic audio channel, splitting audio into `radio`, `streaming_audio` and `podcast`, and the brief does not say which.",
  },

  /* --- out of home --- */
  { re: /\bdooh\b/gi, value: 'dooh', disposition: 'name' },
  {
    re: /\bdigital\s+out[-\s]of[-\s]home\b/gi,
    value: 'dooh',
    disposition: 'synonym',
    rule: "'digital out-of-home' is the AdCP channel `dooh`.",
  },
  { re: /\booh\b/gi, value: 'ooh', disposition: 'name' },
  {
    re: /\bout[-\s]of[-\s]home\b/gi,
    value: 'ooh',
    disposition: 'name',
    note: 'AdCP splits out-of-home into `ooh` (classic) and `dooh` (digital screens). Only `ooh` was recorded; if digital screens were meant, the brief has to say so.',
  },
  {
    re: /\bbillboards?\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'billboard' does not say whether the inventory is classic (`ooh`) or digital (`dooh`); AdCP keeps them as separate channels, so no channel is recorded.",
  },

  /* --- long tail --- */
  { re: /\bcinema\b/gi, value: 'cinema', disposition: 'name' },
  {
    re: /\bmovie\s+theat(?:er|re)s?\b/gi,
    value: 'cinema',
    disposition: 'synonym',
    rule: "'movie theater' is the AdCP channel `cinema`.",
  },
  { re: /\bprint\b/gi, value: 'print', disposition: 'name' },
  {
    re: /\b(?:newspapers?|magazines?)\b/gi,
    value: 'print',
    disposition: 'synonym',
    rule: "'newspaper'/'magazine' is the AdCP channel `print` ('Newspapers, magazines, and other print publications').",
  },
  {
    // Bare "email" is skipped on purpose: an email address in a brief is not a
    // channel statement. Only advertising phrasings claim the channel.
    re: /\b(?:email\s+(?:advertising|marketing|newsletters?)|sponsored\s+newsletters?|newsletters?)\b/gi,
    value: 'email',
    disposition: 'synonym',
    rule: "'email advertising'/'sponsored newsletter' is the AdCP channel `email`.",
  },
  { re: /\bgaming\b/gi, value: 'gaming', disposition: 'name' },
  {
    re: /\bin[-\s]game\b/gi,
    value: 'gaming',
    disposition: 'synonym',
    rule: "'in-game' is the AdCP channel `gaming` ('In-game advertising across platforms').",
  },
  { re: /\binfluencers?\b/gi, value: 'influencer', disposition: 'name' },
  {
    re: /\bcreator\s+marketing\b/gi,
    value: 'influencer',
    disposition: 'synonym',
    rule: "'creator marketing' is the AdCP channel `influencer` ('Creator and influencer marketing partnerships').",
  },
  { re: /\baffiliates?\b/gi, value: 'affiliate', disposition: 'name' },
  { re: /\bproduct\s+placement\b/gi, value: 'product_placement', disposition: 'name' },
  {
    re: /\bbranded\s+content\b/gi,
    value: 'product_placement',
    disposition: 'synonym',
    rule: "'branded content' is named in the AdCP `product_placement` channel description.",
  },
  { re: /\bsponsored\s+intelligence\b/gi, value: 'sponsored_intelligence', disposition: 'name' },

  /* --- native: AAMP-only --- */
  {
    re: /\bnative\b/gi,
    value: 'AAMP_NATIVE_ONLY',
    disposition: 'synonym',
    rule: "'native' populates AAMP's ChannelType.NATIVE; AdCP has no native channel — it treats native as a creative format inside `display`.",
  },

  /* --- genuinely ambiguous single words --- */
  {
    re: /\bvideo\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'video' alone does not name an AdCP channel: `ctv`, `olv` and `linear_tv` are all video. No channel recorded.",
  },
  {
    re: /\b(?:tv|television)\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'TV' alone does not say `ctv` (streaming on a TV screen) or `linear_tv` (broadcast and cable). No channel recorded.",
  },
  {
    re: /\bstreaming\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'streaming' alone does not say video (`ctv`/`olv`) or audio (`streaming_audio`). No channel recorded.",
  },
]

interface ChannelResult {
  field: FieldValue<ChannelValue[]>
  warnings: string[]
  /** Accepted channel matches in text order, for the split parser. */
  matches: Array<{ span: Span; channel: ChannelValue }>
}

function extractChannels(text: string): ChannelResult {
  const warnings: string[] = []
  const accepted = matchLexicon(text, CHANNEL_LEXICON)

  const values: ChannelValue[] = []
  const spans: Span[] = []
  const raw: string[] = []
  const rules: string[] = []
  const notes: string[] = []
  const matches: Array<{ span: Span; channel: ChannelValue }> = []
  let anySynonym = false
  const seen = new Set<string>()

  for (const m of accepted) {
    const lex = m.lex
    if (lex.disposition === 'block') continue
    if (lex.disposition === 'ambiguous') {
      warnings.push(`${lex.warning} (input ${m.span.start}-${m.span.end}: "${m.span.text}")`)
      continue
    }
    let channel: ChannelValue
    if (lex.value === 'AAMP_AUDIO_ONLY') {
      channel = { adcp: null, aamp: 'AUDIO', surface: m.span.text }
      warnings.push(
        `"${m.span.text}" (input ${m.span.start}-${m.span.end}) populates AAMP ChannelType.AUDIO but no AdCP channel: AdCP splits audio into \`radio\`, \`streaming_audio\` and \`podcast\` and the brief does not say which, so \`filters.channels\` carries nothing for it.`,
      )
    } else if (lex.value === 'AAMP_NATIVE_ONLY') {
      channel = { adcp: null, aamp: 'NATIVE', surface: m.span.text }
      warnings.push(
        `"${m.span.text}" (input ${m.span.start}-${m.span.end}) populates AAMP ChannelType.NATIVE but no AdCP channel: AdCP has no native channel, so \`filters.channels\` carries nothing for it.`,
      )
    } else {
      const adcp = lex.value as AdcpChannel
      channel = { adcp, aamp: AAMP_FOR_ADCP[adcp], surface: m.span.text }
      if (channel.aamp === null) {
        warnings.push(
          `AdCP channel \`${adcp}\` (from "${m.span.text}", input ${m.span.start}-${m.span.end}) has no AAMP ChannelType value — AAMP has only CTV, DISPLAY, AUDIO, NATIVE, DOOH and LINEAR_TV — so this channel cannot appear as a ChannelAllocation, and any budget the brief puts against it cannot be represented in the AAMP split.`,
        )
      }
    }

    raw.push(m.span.text)
    matches.push({ span: m.span, channel })

    const dedupeKey = `${channel.adcp ?? ''}|${channel.aamp ?? ''}`
    if (seen.has(dedupeKey)) continue // same channel named twice; first span is the evidence
    seen.add(dedupeKey)
    values.push(channel)
    spans.push(m.span)
    if (lex.disposition === 'synonym') {
      anySynonym = true
      if (lex.rule) rules.push(`"${m.span.text}" -> ${lex.rule}`)
    }
    if (lex.note) notes.push(`"${m.span.text}": ${lex.note}`)
  }

  // AAMP forbids duplicate channel types. Two distinct AdCP channels that both
  // collapse to AUDIO produce a brief the AAMP validator rejects.
  const byAamp = new Map<AampChannel, ChannelValue[]>()
  for (const v of values) {
    if (!v.aamp) continue
    const list = byAamp.get(v.aamp) ?? []
    list.push(v)
    byAamp.set(v.aamp, list)
  }
  for (const [aamp, list] of byAamp) {
    if (list.length > 1) {
      warnings.push(
        `AAMP forbids duplicate channel types, and ${list
          .map((v) => `\`${v.adcp ?? v.surface}\``)
          .join(
            ' and ',
          )} ${list.length === 2 ? 'both' : 'all'} collapse to AAMP ${aamp}. The AAMP brief cannot carry them as separate allocations; someone has to decide how to merge them and how to split the budget.`,
      )
    }
  }

  if (values.length === 0) {
    return {
      field: missingField(
        'No channel was named. AAMP requires at least one ChannelAllocation, so the brief will not construct; AdCP sellers return every channel they sell.',
      ),
      warnings,
      matches,
    }
  }

  const note = notes.length > 0 ? notes.join(' ') : undefined
  return {
    field: {
      label: anySynonym ? 'derived' : 'stated',
      value: values,
      spans,
      raw,
      extractor: EXTRACTOR,
      ...(anySynonym
        ? {
            rule: `Channel names were matched against AdCP enums/channels.json and AAMP ChannelType. ${rules.join(' ')}`,
          }
        : {}),
      ...(note ? { note } : {}),
    },
    warnings,
    matches,
  }
}

/* ==================================================================== *
 * Channel budget split — the field this product exists to refuse to invent
 * ==================================================================== */

/** "60%", "60 percent", "60.5%". */
const PERCENT_RE = /(\d{1,3}(?:\.\d+)?)\s*(?:%|per\s?cent\b)/gi

/**
 * A bare ratio: "60/25/15". Only read as a split when the sentence also
 * carries a split cue, because "11/1" and "12/31" are dates.
 */
const RATIO_RE = /\b(\d{1,3})\s*\/\s*(\d{1,3})(?:\s*\/\s*(\d{1,3}))?(?:\s*\/\s*(\d{1,3}))?\b/g

/** Cue that a sentence is talking about a budget split at all. Non-global: `test` is stateless. */
const SPLIT_CUE_RE =
  /\b(?:split|allocations?|allocate[ds]?|allocating|mix|weighting|weighted|breakdown|share\s+of\s+budget|budget|spend|channels?)\b/i

/** Strict cue for the bare-ratio form, which is otherwise date-shaped. */
const RATIO_CUE_RE =
  /\b(?:split|allocations?|allocate[ds]?|allocating|mix|weighting|breakdown|share\s+of\s+budget)\b/i

/** Text allowed between a channel name and the percentage that follows it. */
const GAP_CHANNEL_THEN_PCT = /^[\s:=@–—-]*(?:at\s+|gets\s+|takes\s+)?$/i
/** Text allowed between a percentage and the channel name that follows it. */
const GAP_PCT_THEN_CHANNEL = /^[\s:=@–—-]*(?:to\s+|for\s+|on\s+|in\s+|of\s+)?$/i

interface SplitResult {
  field: FieldValue<ChannelAllocationValue[]>
  warnings: string[]
  /**
   * A split the engine PAIRED rather than read. Always `label: 'assumed'`, and
   * never written to `fields`: it reaches a payload only through
   * AnalyzeOptions.assume.
   */
  offered?: FieldValue<ChannelAllocationValue[]>
}

function extractChannelBudgetSplit(
  text: string,
  channelMatches: Array<{ span: Span; channel: ChannelValue }>,
): SplitResult {
  const warnings: string[] = []
  const sentences = sentenceRanges(text)

  const allocations: ChannelAllocationValue[] = []
  const spans: Span[] = []
  const raw: string[] = []
  const usedChannelSpans = new Set<number>()

  /* --- form 1: a percentage adjacent to a channel name --- */
  for (const pct of scan(text, PERCENT_RE)) {
    const [sStart, sEnd] = sentenceAt(sentences, pct.span.start)
    const sentenceText = text.slice(sStart, sEnd)
    // A percentage in a sentence about viewability or completion rate is not a
    // budget split. Require the sentence to be about budget/channels at all.
    if (!SPLIT_CUE_RE.test(sentenceText)) continue

    const inSentence = channelMatches.filter(
      (c) => c.span.start >= sStart && c.span.end <= sEnd && c.channel.adcp !== null,
    )
    const before = inSentence
      .filter(
        (c) =>
          c.span.end <= pct.span.start &&
          GAP_CHANNEL_THEN_PCT.test(text.slice(c.span.end, pct.span.start)),
      )
      .pop()
    const after = inSentence.find(
      (c) =>
        c.span.start >= pct.span.end &&
        GAP_PCT_THEN_CHANNEL.test(text.slice(pct.span.end, c.span.start)),
    )

    if (before && after) {
      warnings.push(
        `"${pct.span.text}" (input ${pct.span.start}-${pct.span.end}) sits between two channel names ("${before.span.text}" and "${after.span.text}") and could belong to either. No allocation recorded.`,
      )
      continue
    }
    const hit = before ?? after
    if (!hit) continue

    if (usedChannelSpans.has(hit.span.start)) {
      warnings.push(
        `Channel "${hit.span.text}" (input ${hit.span.start}-${hit.span.end}) has more than one percentage attached to it. Only the first was recorded; the rest are an ambiguity for a human.`,
      )
      continue
    }
    usedChannelSpans.add(hit.span.start)
    allocations.push({ channel: hit.channel, budget_pct: Number(pct.groups[0]) })
    spans.push(hit.span, pct.span)
    raw.push(`${hit.span.text} ${pct.span.text}`)
  }

  if (allocations.length > 0) {
    const sum = allocations.reduce((a, b) => a + b.budget_pct, 0)
    if (Math.abs(sum - 100) > 1e-9) {
      warnings.push(
        `The stated channel split sums to ${sum}, not 100. AAMP's CampaignBrief validator rejects allocations that do not sum to 100; the engine records what the brief says and does not rescale it.`,
      )
    }
    const unallocated = channelMatches
      .filter(
        (c) =>
          c.channel.adcp !== null &&
          !allocations.some((a) => a.channel.adcp === c.channel.adcp) &&
          !allocations.some((a) => a.channel.surface === c.channel.surface),
      )
      .map((c) => c.channel.adcp)
    const uniqueUnallocated = Array.from(new Set(unallocated))
    if (uniqueUnallocated.length > 0) {
      warnings.push(
        `No percentage was stated for ${uniqueUnallocated.map((c) => `\`${c}\``).join(', ')}. AAMP requires \`budget_pct\` on every ChannelAllocation, so these channels cannot be carried until someone states a number.`,
      )
    }
    return {
      field: {
        label: 'stated',
        value: allocations,
        spans,
        raw,
        extractor: EXTRACTOR,
        note: `Stated allocations sum to ${sum}. AdCP has no allocation concept in \`get_products\`; the split reaches a seller only later, per package, in \`create_media_buy\`.`,
      },
      warnings,
    }
  }

  /* --- form 2: a bare ratio, e.g. "split 60/25/15" --- */
  const distinctChannels = dedupeChannels(channelMatches.map((c) => c.channel))
  for (const ratio of scan(text, RATIO_RE)) {
    const [sStart, sEnd] = sentenceAt(sentences, ratio.span.start)
    if (!RATIO_CUE_RE.test(text.slice(sStart, sEnd))) continue
    const parts = ratio.groups.filter((g) => g !== '').map(Number)
    if (parts.length < 2) continue

    if (parts.length !== distinctChannels.length) {
      warnings.push(
        `"${ratio.span.text}" (input ${ratio.span.start}-${ratio.span.end}) looks like a budget split of ${parts.length} parts, but ${distinctChannels.length} channel${
          distinctChannels.length === 1 ? ' was' : 's were'
        } named. The engine will not guess which number belongs to which channel, so no split is recorded.`,
      )
      return { field: missingSplitField(distinctChannels.length), warnings }
    }

    const sum = parts.reduce((a, b) => a + b, 0)
    const paired: ChannelAllocationValue[] = distinctChannels.map((c, i) => ({
      channel: c,
      budget_pct: parts[i]!,
    }))
    warnings.push(
      `"${ratio.span.text}" (input ${ratio.span.start}-${ratio.span.end}) was paired with the channels positionally, in the order they were named (${distinctChannels
        .map((c) => c.surface)
        .join(', ')}). The brief does not state the pairing; check it before signing.`,
    )
    if (Math.abs(sum - 100) > 1e-9) {
      warnings.push(
        `The stated channel split sums to ${sum}, not 100. AAMP's CampaignBrief validator rejects allocations that do not sum to 100; the engine records what the brief says and does not rescale it.`,
      )
    }
    // THE 60/25/15 CASE, and the reason this package exists.
    //
    // The three NUMBERS are stated. The pairing of number to channel is not:
    // "CTV, display and audio, split 60/25/15" never says which channel gets
    // 60, and reading them left to right is a guess about the writer's habits.
    // A guess that admits it is a guess — the rule string below says so in
    // words — is an ASSUMPTION, and assumptions are off by default. Labelling
    // it `derived` walked it straight through readable() and into
    // `channels[].budget_pct`, which is committed money per channel in a
    // document someone signs.
    //
    // So: the field stays missing and the pairing is offered. Accept
    // `channel_budget_split` and it is emitted, labelled `assumed`, everywhere
    // it appears.
    return {
      field: missingField(
        `A ${parts.length}-part split ("${ratio.span.text}") and ${parts.length} channels were stated, but not which number belongs to which channel. The engine pairs them positionally and offers the result; it does not write it. Accept \`channel_budget_split\` or state the split per channel ("CTV 60%, display 25%").`,
      ),
      offered: {
        label: 'assumed',
        value: paired,
        spans: [ratio.span, ...distinctChannelSpans(channelMatches)],
        raw: [ratio.span.text],
        extractor: EXTRACTOR,
        rule: `The ${parts.length} numbers in "${ratio.span.text}" were assigned to the ${parts.length} channels in the order the brief named them (${paired
          .map((p) => `${p.channel.surface} ${p.budget_pct}%`)
          .join(
            ', ',
          )}). Positional pairing only — the brief does not say which number belongs to which channel, so this is the engine's guess, not a reading of your words.`,
        note: `The numbers sum to ${sum}.`,
      },
      warnings,
    }
  }

  /* --- nothing stated: the split is MISSING. It is not evenly distributed,
         it is not 60/25/15, and it is not offered as an assumption here. --- */
  if (distinctChannels.length > 0) {
    warnings.push(
      `${distinctChannels.length} channel${distinctChannels.length === 1 ? ' was' : 's were'} named (${distinctChannels
        .map((c) => c.surface)
        .join(
          ', ',
        )}) but no budget split was stated. AAMP requires \`budget_pct\` on every ChannelAllocation, 0 < pct <= 100, summing to 100, so the brief cannot be transacted until a human states the split. The engine does not distribute the budget evenly and does not invent one.`,
    )
  }
  return { field: missingSplitField(distinctChannels.length), warnings }
}

function missingSplitField(channelCount: number): FieldValue<never> {
  return missingField(
    channelCount > 0
      ? 'Channels were named but no split was stated. AAMP will not construct the brief without one; the engine leaves it missing rather than distributing the budget.'
      : 'No channel split stated, and no channels to split across.',
  )
}

function dedupeChannels(channels: ChannelValue[]): ChannelValue[] {
  const seen = new Set<string>()
  const out: ChannelValue[] = []
  for (const c of channels) {
    const key = `${c.adcp ?? ''}|${c.aamp ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
  }
  return out
}

function distinctChannelSpans(matches: Array<{ span: Span; channel: ChannelValue }>): Span[] {
  const seen = new Set<string>()
  const out: Span[] = []
  for (const m of matches) {
    const key = `${m.channel.adcp ?? ''}|${m.channel.aamp ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m.span)
  }
  return out
}

/* ==================================================================== *
 * Formats
 *
 * `filters.format_ids` items are `core/format-id.json` objects with a REQUIRED
 * `agent_url`. A pixel size has no agent_url and the pinned registry says in
 * terms that SDKs MUST NOT synthesize one. So: the size is stated, the format
 * ID is not emitted, and the registry's observed slug is reported as evidence.
 * ==================================================================== */

/**
 * Transcribed from AdCP 3.1.13 `registries/v1-canonical-mapping.json`
 * (registry version 1.3.1, last_updated 2026-08-05), unsuffixed
 * `display_<W>x<H>` entries only. Values are the observed v1 slug and the v2
 * canonical format kind the registry projects it to. This table is evidence
 * that a slug exists, not a licence to build a FormatId from it.
 */
const OBSERVED_DISPLAY_SLUGS: Readonly<Record<string, string>> = {
  '300x250': 'display_300x250',
  '728x90': 'display_728x90',
  '320x50': 'display_320x50',
  '300x600': 'display_300x600',
  '970x250': 'display_970x250',
  '250x250': 'display_250x250',
  '200x200': 'display_200x200',
  '300x50': 'display_300x50',
  '320x480': 'display_320x480',
  '320x400': 'display_320x400',
  '320x320': 'display_320x320',
  '320x250': 'display_320x250',
}

/** Same registry, duration entries: video_30s / video_15s / audio_15s. */
const OBSERVED_DURATION_SLUGS: Readonly<Record<string, { slug: string; canonical: string }>> = {
  '30000': { slug: 'video_30s', canonical: 'video_hosted' },
  '15000': { slug: 'video_15s', canonical: 'video_hosted' },
}

/** "300x250", "728 x 90", "300×250". Two to four digits a side. */
const PIXEL_SIZE_RE = /\b(\d{2,4})\s*[x×]\s*(\d{2,4})\b/gi

/**
 * ":30", "30s", "30 sec", "30-second". The `:30` form is guarded by a
 * lookbehind so a clock time ("9:30") is not read as a creative duration.
 */
const DURATION_RE =
  /(?:(?<!\d):(\d{1,3})\b|\b(\d{1,3})\s*(?:s\b|secs?\b|seconds?\b|-second\b|-sec\b))(?=[\s,.;)]|$)/gi

interface FormatResult {
  field: FieldValue<FormatValue[]>
  warnings: string[]
}

function extractFormats(text: string): FormatResult {
  const warnings: string[] = []
  const values: FormatValue[] = []
  const spans: Span[] = []
  const raw: string[] = []
  const claimed: Array<[number, number]> = []

  for (const m of scan(text, PIXEL_SIZE_RE)) {
    const width = Number(m.groups[0])
    const height = Number(m.groups[1])
    const key = `${width}x${height}`
    const slug = OBSERVED_DISPLAY_SLUGS[key] ?? null
    values.push({
      surface: m.span.text,
      kind: 'pixel_size',
      width,
      height,
      observedV1Slug: slug,
      canonicalFormat: slug ? 'image' : null,
      adcpFormatId: null,
      aampFormatPref: m.span.text,
    })
    spans.push(m.span)
    raw.push(m.span.text)
    claimed.push([m.span.start, m.span.end])
    warnings.push(
      slug
        ? `"${m.span.text}" (input ${m.span.start}-${m.span.end}) is a creative size, not an AdCP format ID. AdCP \`core/format-id.json\` requires an object with \`agent_url\` and \`id\`; the pinned registry lists the slug \`${slug}\` (canonical \`image\`, ${width}x${height}) but is authoritative for v1->v2 projection only and states that SDKs MUST NOT synthesize a format_id by inverting it, because the slugs carry no \`agent_url\`. Nothing is written to \`filters.format_ids\`; the size survives verbatim in AAMP \`channels[].format_prefs\`.`
        : `"${m.span.text}" (input ${m.span.start}-${m.span.end}) is a creative size, not an AdCP format ID, and the pinned registry lists no slug for ${width}x${height} at all. Nothing is written to \`filters.format_ids\`; the size survives verbatim in AAMP \`channels[].format_prefs\`.`,
    )
  }

  for (const m of scan(text, DURATION_RE)) {
    if (claimed.some(([s, e]) => m.span.start < e && m.span.end > s)) continue
    const seconds = Number(m.groups[0] !== '' ? m.groups[0] : m.groups[1])
    if (!Number.isFinite(seconds) || seconds <= 0) continue
    const durationMs = seconds * 1000
    const observed = OBSERVED_DURATION_SLUGS[String(durationMs)] ?? null
    values.push({
      surface: m.span.text,
      kind: 'duration',
      duration_ms: durationMs,
      observedV1Slug: observed?.slug ?? null,
      canonicalFormat: observed?.canonical ?? null,
      adcpFormatId: null,
      aampFormatPref: m.span.text,
    })
    spans.push(m.span)
    raw.push(m.span.text)
    warnings.push(
      `"${m.span.text}" (input ${m.span.start}-${m.span.end}) states a creative duration${
        observed
          ? `, and the pinned registry lists the slug \`${observed.slug}\` (canonical \`${observed.canonical}\`, duration_ms ${durationMs})`
          : ', for which the pinned registry lists no slug'
      }. A duration is not a format ID — \`core/format-id.json\` requires \`agent_url\` and \`id\`, and \`duration_ms\` only parameterises an id that already exists — so nothing is written to \`filters.format_ids\`.`,
    )
  }

  if (values.length === 0) {
    return {
      field: missingField(
        'No creative format stated. Sellers return products whose creative specs you may not be able to fill.',
      ),
      warnings,
    }
  }

  warnings.push(
    'AAMP scopes format preferences to a channel (`channels[].format_prefs`), but the brief states formats without saying which channel each belongs to. The engine does not assign them.',
  )

  return {
    field: {
      label: 'stated',
      value: values,
      spans,
      raw,
      extractor: EXTRACTOR,
      note: 'Stated but unmappable to AdCP: `filters.format_ids` takes `{agent_url, id}` objects and no agent_url is derivable from a size or a duration. Recorded so the loss is visible, not so it can be filled in.',
    },
    warnings,
  }
}

/* ==================================================================== *
 * standard_formats_only — a boolean with a real contradiction case
 * ==================================================================== */

/** "IAB standard formats only", "standard sizes only", "no custom units". */
const STANDARD_ONLY_TRUE_RE =
  /\b(?:iab[-\s]standard(?:\s+(?:formats?|sizes?|units?))?|standard\s+(?:formats?|sizes?|units?)\s+only|only\s+standard\s+(?:formats?|sizes?|units?)|no\s+(?:custom|bespoke)\s+(?:formats?|sizes?|units?|creative))\b/gi

/** "custom units", "bespoke formats", "high-impact custom creative". */
const STANDARD_ONLY_FALSE_RE = /\b(?:custom|bespoke)\s+(?:formats?|sizes?|units?|creative)\b/gi

function extractStandardFormatsOnly(text: string): {
  field: FieldValue<boolean>
  warnings: string[]
} {
  const warnings: string[] = []
  // The TRUE pattern contains "no custom units", which the FALSE pattern also
  // matches; drop FALSE matches that sit inside a TRUE match.
  const trues = scan(text, STANDARD_ONLY_TRUE_RE)
  const falses = scan(text, STANDARD_ONLY_FALSE_RE).filter(
    (f) => !trues.some((t) => f.span.start >= t.span.start && f.span.end <= t.span.end),
  )

  if (trues.length > 0 && falses.length > 0) {
    warnings.push(
      `The brief both restricts to standard formats ("${trues[0]!.span.text}", input ${trues[0]!.span.start}-${trues[0]!.span.end}) and asks for custom units ("${falses[0]!.span.text}", input ${falses[0]!.span.start}-${falses[0]!.span.end}). \`filters.standard_formats_only\` is one boolean and the engine will not choose between them, so no value is emitted.`,
    )
    return {
      field: missingField(
        'Contradictory statements about standard versus custom formats; no boolean emitted.',
      ),
      warnings,
    }
  }

  if (trues.length > 0) {
    const m = trues[0]!
    return {
      field: {
        label: 'stated',
        value: true,
        spans: [m.span],
        raw: [m.span.text],
        extractor: EXTRACTOR,
        note: 'No AAMP equivalent: AAMP has no notion of format standardisation.',
      },
      warnings,
    }
  }

  if (falses.length > 0) {
    const m = falses[0]!
    return {
      field: {
        label: 'derived',
        value: false,
        spans: [m.span],
        raw: [m.span.text],
        extractor: EXTRACTOR,
        rule: `"${m.span.text}" asks for non-standard creative, so \`standard_formats_only\` is false — sending true would exclude the inventory the brief asks for.`,
      },
      warnings,
    }
  }

  return {
    field: missingField(
      'Not stated. Bespoke and publisher-custom units stay in the result set even if you can only ship IAB standard sizes.',
    ),
    warnings,
  }
}

/* ==================================================================== *
 * Placement axes — four small enum vocabularies
 * ==================================================================== */

const VIDEO_PLACEMENT_LEXICON: Array<Lexeme<string>> = [
  { re: /\bin[-\s]?stream\b/gi, value: 'instream', disposition: 'name' },
  {
    re: /\b(?:pre|mid|post)[-\s]?rolls?\b/gi,
    value: 'instream',
    disposition: 'synonym',
    rule: 'pre-, mid- and post-roll all run inside requested video content, which is OpenRTB 2.6 video.plcmt=1 — AdCP `instream`.',
    note: 'Roll position is not carried by AdCP: `instream` covers pre-, mid- and post-roll alike, so "pre-roll only" cannot be expressed in `get_products`.',
  },
  { re: /\baccompanying[-\s]content\b/gi, value: 'accompanying_content', disposition: 'name' },
  { re: /\binterstitials?\b/gi, value: 'interstitial', disposition: 'name' },
  {
    re: /\bstandalone(?:\s+video)?\b/gi,
    value: 'standalone',
    disposition: 'name',
  },
  {
    // OpenRTB folds outstream into two different plcmt values depending on
    // whether there is accompanying video content. The brief does not say.
    re: /\bout[-\s]?stream\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'outstream' does not map to one AdCP video placement type: it is `accompanying_content` (OpenRTB plcmt=2) when there is video content alongside it and `standalone` (plcmt=4) when there is not. No placement type recorded.",
  },
]

const AUDIO_DISTRIBUTION_LEXICON: Array<Lexeme<string>> = [
  { re: /\bpodcasts?\b/gi, value: 'podcast', disposition: 'name' },
  {
    re: /\bmusic[-\s]streaming(?:\s+services?)?\b/gi,
    value: 'music_streaming_service',
    disposition: 'synonym',
    rule: "'music streaming' is OpenRTB 2.6 audio.feed=1 — AdCP `music_streaming_service`.",
  },
  {
    re: /\b(?:fm\/am|am\/fm|fm|am|broadcast|terrestrial)\s+radio\b/gi,
    value: 'fm_am_broadcast',
    disposition: 'synonym',
    rule: "'broadcast/AM/FM radio' is OpenRTB 2.6 audio.feed=2 — AdCP `fm_am_broadcast`.",
  },
  { re: /\bcatch[-\s]?up\s+radio\b/gi, value: 'catch_up_radio', disposition: 'name' },
  {
    re: /\b(?:web|internet|online)\s+radio\b/gi,
    value: 'web_radio',
    disposition: 'synonym',
    rule: "'web/internet radio' is live audio available only online — OpenRTB 2.6 audio.feed=5, AdCP `web_radio`.",
  },
  {
    re: /\b(?:in[-\s]game\s+audio|video\s+game\s+audio)\b/gi,
    value: 'video_game',
    disposition: 'synonym',
    rule: "'in-game audio' is OpenRTB 2.6 audio.feed=6 — AdCP `video_game`.",
  },
  {
    re: /\b(?:text[-\s]to[-\s]speech|audiobooks?|article\s+narration)\b/gi,
    value: 'text_to_speech',
    disposition: 'synonym',
    rule: "'text-to-speech'/'audiobook' is OpenRTB 2.6 audio.feed=7 — AdCP `text_to_speech`.",
  },
  {
    // Not the same as the *channel* `streaming_audio`: on this axis the phrase
    // could be a music service or an online-only radio station.
    re: /\bstreaming\s+audio\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'streaming audio' does not pick one AdCP audio distribution type: `music_streaming_service` (audio.feed=1) and `web_radio` (audio.feed=5) are both streamed. No distribution type recorded.",
  },
]

const SPONSORED_PLACEMENT_LEXICON: Array<Lexeme<string>> = [
  { re: /\bsponsored[-\s]search\b/gi, value: 'sponsored_search', disposition: 'name' },
  { re: /\bsponsored[-\s]display\b/gi, value: 'sponsored_display', disposition: 'name' },
  { re: /\bsponsored[-\s]native\b/gi, value: 'sponsored_native', disposition: 'name' },
  {
    // Amazon's "Sponsored Products" renders both on search results and on
    // browse/product-detail pages; the AdCP axis separates those.
    re: /\bsponsored[-\s]products?\b/gi,
    value: null,
    disposition: 'ambiguous',
    warning:
      "'sponsored products' spans two AdCP sponsored placement types — `sponsored_search` (on the retailer's search results) and `sponsored_display` (browse and product-detail slots). No placement type recorded.",
  },
]

const SOCIAL_SURFACE_LEXICON: Array<Lexeme<string>> = [
  {
    // Bare "feed" is too common; require a qualifier so the surface is claimed
    // only when the buyer meant it.
    re: /\b(?:in[-\s]?feed|news\s+feed|home\s+feed|social\s+feed|feed\s+placements?)\b/gi,
    value: 'feed',
    disposition: 'synonym',
    rule: "'in-feed'/'news feed' is the AdCP social placement surface `feed` (the primary scrolling timeline).",
  },
  {
    // "success stories" / "case stories" are not a placement.
    re: /(?<!\b(?:success|case|news|brand)\s)\bstories\b/gi,
    value: 'stories',
    disposition: 'name',
  },
  { re: /\bshort[-\s](?:form\s+)?video\b/gi, value: 'short_video', disposition: 'name' },
  {
    re: /\b(?:reels|shorts)\b/gi,
    value: 'short_video',
    disposition: 'synonym',
    rule: "AdCP's `short_video` surface explicitly subsumes the platform brand names for it (Reels, Shorts, Spotlight, TikTok's For You), because platform identity belongs to the property axis, not the surface axis.",
  },
  {
    re: /\bexplore\s+(?:tab|surface|page|feed)\b/gi,
    value: 'explore',
    disposition: 'synonym',
    rule: "'explore tab' is the AdCP social placement surface `explore` (the discovery surface outside the followed graph).",
  },
  {
    re: /\b(?:in[-\s]app|social)\s+search\b/gi,
    value: 'search',
    disposition: 'synonym',
    rule: "'in-app search' is the AdCP social placement surface `search` (the in-app search-results surface), which is a different axis from the `search` channel.",
  },
]

/** Fold a placement lexicon into one enum[] field. */
function extractEnumAxis(
  text: string,
  lexicon: Array<Lexeme<string>>,
  missingConsequence: string,
  aampNote: string,
): { field: FieldValue<string[]>; warnings: string[] } {
  const warnings: string[] = []
  const values: string[] = []
  const spans: Span[] = []
  const raw: string[] = []
  const rules: string[] = []
  const notes: string[] = []
  let anySynonym = false
  const seen = new Set<string>()

  for (const m of matchLexicon(text, lexicon)) {
    const lex = m.lex
    if (lex.disposition === 'block') continue
    if (lex.disposition === 'ambiguous') {
      warnings.push(`${lex.warning} (input ${m.span.start}-${m.span.end}: "${m.span.text}")`)
      continue
    }
    raw.push(m.span.text)
    if (seen.has(lex.value!)) continue
    seen.add(lex.value!)
    values.push(lex.value!)
    spans.push(m.span)
    if (lex.disposition === 'synonym') {
      anySynonym = true
      if (lex.rule) rules.push(`"${m.span.text}" -> ${lex.rule}`)
    }
    if (lex.note) notes.push(`"${m.span.text}": ${lex.note}`)
  }

  if (values.length === 0) return { field: missingField(missingConsequence), warnings }

  const note = [aampNote, ...notes].join(' ')
  return {
    field: {
      label: anySynonym ? 'derived' : 'stated',
      value: values,
      spans,
      raw,
      extractor: EXTRACTOR,
      ...(anySynonym ? { rule: rules.join(' ') } : {}),
      note,
    },
    warnings,
  }
}

/* ==================================================================== *
 * Audience
 *
 * AdCP expresses audience through `filters.signal_targeting`: a list of
 * SignalRefs that must be buyer-selectable on the product and are resolved
 * against a signals agent. A demographic string is not a SignalRef and this
 * engine makes no network call, so nothing this section produces reaches the
 * AdCP request. AAMP's AudiencePlan is the target — but `AudiencePlan.primary`
 * is a required AudienceRef (type + identifier + taxonomy + version + source)
 * and no IAB Audience Taxonomy 1.1 identifier is derivable from "adults 25-54"
 * without inventing one. So the demo is recorded structurally and the loss is
 * stated. That is the whole honest answer.
 * ==================================================================== */

/**
 * Nielsen-style shorthand: A25-54, W18-34, M25+, P2+. Case-sensitive on the
 * prefix letter, because lower-case "a 25-54" is not the shorthand and the
 * letter would otherwise match any stray word.
 */
const NIELSEN_RANGE_RE = /\b([AWMP])\s?(\d{1,2})\s*[-–]\s*(\d{1,2})\b/g
const NIELSEN_OPEN_RE = /\b([AWMP])\s?(\d{1,2})\+/g

/** "adults 25-54", "women aged 18 to 34", "persons 2-11". */
const WORDED_RANGE_RE =
  /\b(adults?|men|males?|women|females?|people|persons?|shoppers?|viewers?|consumers?|households?)\s+(?:aged?\s+)?(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\b/gi

/**
 * "adults 25+", "women 35 and over". The word alternative carries its own `\b`;
 * a trailing `\b` on the whole group would fail on "25+." (two non-word chars).
 */
const WORDED_OPEN_RE =
  /\b(adults?|men|males?|women|females?|people|persons?|shoppers?|viewers?|consumers?|households?)\s+(?:aged?\s+)?(\d{1,2})\s*(?:\+|and\s+(?:over|older|above)\b)/gi

/** "aged 25-54" with no noun in front. */
const AGED_RANGE_RE = /\bage[ds]?\s+(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\b/gi

/** "25-54 year olds". */
const YEAR_OLDS_RE = /\b(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})[-\s]?year[-\s]olds?\b/gi

/** "HHI $100k+", "household income over $75,000". */
const HHI_LEADING_RE =
  /\b(?:hhi|household\s+income|hh\s+income)\s*(?:of|:|at)?\s*(over|above|greater\s+than|at\s+least|>=?)?\s*(\$|£|€)?\s*(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(k|m)?\s*(\+)?/gi

/** "$100k+ HHI", "100k+ household income". */
const HHI_TRAILING_RE =
  /(\$|£|€)?\s*(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(k|m)?\s*(\+)?\s*(?:hhi|household\s+income)/gi

/** A labelled audience clause, whose tail is captured so an unparseable
 * audience ("millennials", "snack lovers") is still reported as stated. */
const AUDIENCE_CUE_RE =
  /\b(?:target\s+(?:audience|demos?|demographics?)|audience|demo)\s*[:–—-]\s*([^.;\n]{1,120})/gi

/** Gendered nouns, for the worded patterns. */
function genderOf(noun: string): 'female' | 'male' | undefined {
  const n = noun.toLowerCase()
  if (n.startsWith('women') || n.startsWith('female')) return 'female'
  if (n.startsWith('men') || n.startsWith('male')) return 'male'
  return undefined
}

/** Nielsen prefix letter -> gender. A (adults) and P (persons) name no gender. */
function genderOfNielsen(letter: string): 'female' | 'male' | undefined {
  if (letter === 'W') return 'female'
  if (letter === 'M') return 'male'
  return undefined
}

interface AudienceHit {
  span: Span
  descriptors: AudienceDescriptor[]
  /** Set when a mapping rule had to fire (Nielsen shorthand, magnitude suffix). */
  rule?: string
  warning?: string
}

function parseIncome(amount: string, suffix: string): { value: number | null; warning?: string } {
  const base = Number(amount.replace(/,/g, ''))
  if (!Number.isFinite(base)) return { value: null }
  const s = suffix.toLowerCase()
  if (s === 'k') return { value: base * 1000 }
  if (s === 'm') return { value: base * 1_000_000 }
  if (base < 1000) {
    // "HHI 100" — thousands or units? The brief does not say, so neither does
    // the engine.
    return {
      value: null,
      warning: `"${amount}" carries no magnitude suffix and no thousands separator, so the brief does not say whether it means ${base} or ${base},000. No income floor recorded.`,
    }
  }
  return { value: base }
}

function extractAudience(text: string): { field: FieldValue<AudienceValue>; warnings: string[] } {
  const warnings: string[] = []
  const hits: AudienceHit[] = []

  for (const m of scan(text, NIELSEN_RANGE_RE)) {
    const [letter, lo, hi] = [m.groups[0]!, Number(m.groups[1]), Number(m.groups[2])]
    if (!(hi > lo)) continue
    const descriptors: AudienceDescriptor[] = [
      { kind: 'age_range', surface: m.span.text, ageMin: lo, ageMax: hi },
    ]
    const gender = genderOfNielsen(letter)
    if (gender) descriptors.push({ kind: 'gender', surface: m.span.text, gender })
    hits.push({
      span: m.span,
      descriptors,
      rule: `"${m.span.text}" is Nielsen demo shorthand: ${letter} = ${
        letter === 'A' ? 'adults' : letter === 'W' ? 'women' : letter === 'M' ? 'men' : 'persons'
      }, ages ${lo}-${hi}.`,
    })
  }

  for (const m of scan(text, NIELSEN_OPEN_RE)) {
    const [letter, lo] = [m.groups[0]!, Number(m.groups[1])]
    const descriptors: AudienceDescriptor[] = [
      { kind: 'age_range', surface: m.span.text, ageMin: lo },
    ]
    const gender = genderOfNielsen(letter)
    if (gender) descriptors.push({ kind: 'gender', surface: m.span.text, gender })
    hits.push({
      span: m.span,
      descriptors,
      rule: `"${m.span.text}" is Nielsen demo shorthand: ${letter} = ${
        letter === 'A' ? 'adults' : letter === 'W' ? 'women' : letter === 'M' ? 'men' : 'persons'
      }, ages ${lo} and over (no upper bound stated).`,
    })
  }

  for (const m of scan(text, WORDED_RANGE_RE)) {
    const lo = Number(m.groups[1])
    const hi = Number(m.groups[2])
    if (!(hi > lo)) continue
    const descriptors: AudienceDescriptor[] = [
      { kind: 'age_range', surface: m.span.text, ageMin: lo, ageMax: hi },
    ]
    const gender = genderOf(m.groups[0]!)
    if (gender) descriptors.push({ kind: 'gender', surface: m.span.text, gender })
    hits.push({ span: m.span, descriptors })
  }

  for (const m of scan(text, WORDED_OPEN_RE)) {
    const lo = Number(m.groups[1])
    const descriptors: AudienceDescriptor[] = [
      { kind: 'age_range', surface: m.span.text, ageMin: lo },
    ]
    const gender = genderOf(m.groups[0]!)
    if (gender) descriptors.push({ kind: 'gender', surface: m.span.text, gender })
    hits.push({ span: m.span, descriptors })
  }

  for (const m of scan(text, AGED_RANGE_RE)) {
    const lo = Number(m.groups[0])
    const hi = Number(m.groups[1])
    if (!(hi > lo)) continue
    hits.push({
      span: m.span,
      descriptors: [{ kind: 'age_range', surface: m.span.text, ageMin: lo, ageMax: hi }],
    })
  }

  for (const m of scan(text, YEAR_OLDS_RE)) {
    const lo = Number(m.groups[0])
    const hi = Number(m.groups[1])
    if (!(hi > lo)) continue
    hits.push({
      span: m.span,
      descriptors: [{ kind: 'age_range', surface: m.span.text, ageMin: lo, ageMax: hi }],
    })
  }

  const addIncome = (
    span: Span,
    qualifier: string,
    symbol: string,
    amount: string,
    suffix: string,
    plus: string,
  ): void => {
    // A floor is only a floor when the brief says so ("over", "at least", "+").
    // "HHI $100k" on its own could be a median or a band midpoint.
    const bounded = qualifier !== '' || plus !== ''
    const parsed = parseIncome(amount, suffix)
    const descriptor: AudienceDescriptor = {
      kind: 'household_income',
      surface: span.text,
      incomeMin: bounded ? parsed.value : null,
      currencySymbol: symbol === '' ? null : symbol,
    }
    const notes: string[] = []
    if (parsed.warning) notes.push(parsed.warning)
    if (!bounded) {
      notes.push(
        `"${span.text}" states a household income without saying whether it is a floor, a median or a band. Recorded as stated; no bound is assumed.`,
      )
    }
    if (symbol === '$') {
      notes.push(
        `"$" in "${span.text}" does not identify a currency (USD, CAD, AUD and others all use it). No ISO 4217 code is inferred and no currency field is written from the audience.`,
      )
    }
    hits.push({
      span,
      descriptors: [descriptor],
      rule:
        suffix.toLowerCase() === 'k'
          ? `"${span.text}": the 'k' suffix multiplies ${amount} by 1,000 -> ${parsed.value}.`
          : suffix.toLowerCase() === 'm'
            ? `"${span.text}": the 'm' suffix multiplies ${amount} by 1,000,000 -> ${parsed.value}.`
            : undefined,
      warning: notes.length > 0 ? notes.join(' ') : undefined,
    })
  }

  for (const m of scan(text, HHI_LEADING_RE)) {
    addIncome(m.span, m.groups[0]!, m.groups[1]!, m.groups[2]!, m.groups[3]!, m.groups[4]!)
  }
  for (const m of scan(text, HHI_TRAILING_RE)) {
    addIncome(m.span, '', m.groups[0]!, m.groups[1]!, m.groups[2]!, m.groups[3]!)
  }

  // Resolve overlaps between the demo patterns (longest span wins), keeping
  // text order so the descriptor list reads the way the brief does.
  hits.sort((a, b) => a.span.start - b.span.start || b.span.end - a.span.end)
  const kept: AudienceHit[] = []
  let consumedTo = -1
  for (const h of hits) {
    if (h.span.start < consumedTo) continue
    kept.push(h)
    consumedTo = h.span.end
  }

  // A labelled audience clause with nothing parseable inside it is still an
  // audience the buyer stated; record it verbatim rather than dropping it.
  for (const cue of scan(text, AUDIENCE_CUE_RE)) {
    const tailText = cue.groups[0]!
    const tailStart = cue.span.end - tailText.length
    const trimmed = tailText.replace(/[\s,;:]+$/, '')
    const tailSpan = makeSpan(text, tailStart, tailStart + trimmed.length)
    if (trimmed.length === 0) continue
    const covered = kept.some((h) => h.span.start < tailSpan.end && h.span.end > tailSpan.start)
    if (covered) continue
    kept.push({
      span: tailSpan,
      descriptors: [{ kind: 'unparsed', surface: tailSpan.text }],
      warning: `The brief names an audience ("${tailSpan.text}", input ${tailSpan.start}-${tailSpan.end}) that the engine cannot structure into an age, gender or income descriptor. It is recorded verbatim; it is not converted into a taxonomy identifier.`,
    })
  }
  kept.sort((a, b) => a.span.start - b.span.start)

  if (kept.length === 0) {
    return {
      field: missingField(
        'No audience stated. The buy runs untargeted: AdCP returns run-of-network products and AAMP treats a null plan as no audience targeting.',
      ),
      warnings,
    }
  }

  const descriptors = kept.flatMap((h) => h.descriptors)
  const spans = kept.map((h) => h.span)
  const rules = kept.map((h) => h.rule).filter((r): r is string => Boolean(r))
  for (const h of kept) if (h.warning) warnings.push(h.warning)

  // AAMP gives audiences roles (primary / constraints / extensions /
  // exclusions) and AdCP's signal_targeting is a flat list with no role
  // algebra. Which of several stated demos is the primary is a decision, not a
  // derivation, so the engine reports the plurality and stops.
  const ageDescriptors = descriptors.filter((d) => d.kind === 'age_range')
  if (ageDescriptors.length > 1) {
    warnings.push(
      `More than one demographic is stated (${ageDescriptors
        .map((d) => `"${d.surface}"`)
        .join(
          ', ',
        )}). AAMP's AudiencePlan assigns each audience a role — primary, constraint (narrowing), extension (reach) or exclusion — and the brief does not say which is which, so the engine records them all against the primary audience field and assigns no roles.`,
    )
  }

  warnings.push(
    `The audience is stated ("${spans.map((s) => s.text).join('", "')}") but neither protocol can carry it as typed: AdCP \`filters.signal_targeting\` takes SignalRefs that must be buyer-selectable on the product and resolved through a signals agent, and AAMP \`AudiencePlan.primary\` is a required AudienceRef needing an IAB Audience Taxonomy 1.1 identifier. The engine holds no taxonomy lookup and makes no network call, so no ref is invented and the AAMP AudiencePlan does not construct.`,
  )

  const value: AudienceValue = {
    descriptors,
    adcpSignalTargeting: null,
    aampAudiencePlan: { primary: null, rationale: spans.map((s) => s.text).join('; ') },
  }

  return {
    field: {
      label: rules.length > 0 ? 'derived' : 'stated',
      value,
      spans,
      raw: spans.map((s) => s.text),
      extractor: EXTRACTOR,
      ...(rules.length > 0 ? { rule: rules.join(' ') } : {}),
      note: 'Recorded as a demographic. `filters.signal_targeting` and `AudiencePlan.primary` both need a resolved reference, which a demo string is not; the descriptors travel as prose (AdCP `brief`, AAMP `AudiencePlan.rationale`) or not at all.',
    },
    warnings,
  }
}

/* ==================================================================== *
 * Assembly
 * ==================================================================== */

function missingField(consequence: string): FieldValue<never> {
  // Invariant from types.ts: missing => no value, no spans. Which means a
  // contradiction that yields no value cannot carry its evidence here; those
  // offsets go into the warning text instead.
  return { label: 'missing', spans: [], extractor: EXTRACTOR, note: consequence }
}

/**
 * Extract channels, formats, placement axes and audience from a prose brief.
 *
 * Pure: same input, byte-identical output. No I/O, no network, no clock.
 *
 * @param text  the brief, verbatim. All spans index into this string.
 * @param opts  `referenceDate` is accepted for parity with sibling extractors
 *              and is not read: no rule in this module depends on a date.
 */
export function extractChannelsAudience(
  text: string,
  opts?: ChannelsAudienceOptions,
): ChannelsAudienceExtraction {
  void opts // documented above: no rule here reads a date

  const warnings: string[] = []
  const fields: Record<string, FieldValue<unknown>> = {}
  const offered: Record<string, FieldValue<unknown>> = {}

  if (typeof text !== 'string' || text.length === 0) {
    for (const key of OWNED_KEYS) {
      fields[key] = missingField(
        'The input is empty, so nothing is stated and nothing is derivable.',
      )
    }
    return { fields, offered, warnings }
  }

  const channels = extractChannels(text)
  fields.channels = channels.field
  warnings.push(...channels.warnings)

  const split = extractChannelBudgetSplit(text, channels.matches)
  fields.channel_budget_split = split.field
  if (split.offered) offered.channel_budget_split = split.offered
  warnings.push(...split.warnings)

  const formats = extractFormats(text)
  fields.format_ids = formats.field
  warnings.push(...formats.warnings)

  const standardOnly = extractStandardFormatsOnly(text)
  fields.standard_formats_only = standardOnly.field
  warnings.push(...standardOnly.warnings)

  const video = extractEnumAxis(
    text,
    VIDEO_PLACEMENT_LEXICON,
    'No video placement type stated. Instream budget can be spent on accompanying-content or standalone inventory without the request saying otherwise.',
    'AAMP has no video placement axis, so this survives only on the AdCP side.',
  )
  fields.video_placement_types = video.field
  warnings.push(...video.warnings)

  const audio = extractEnumAxis(
    text,
    AUDIO_DISTRIBUTION_LEXICON,
    'No audio distribution type stated. Podcast, broadcast and music-streaming inventory are treated as one pool.',
    'AAMP collapses every audio distribution type into the single channel value AUDIO, so this axis exists only on the AdCP side.',
  )
  fields.audio_distribution_types = audio.field
  warnings.push(...audio.warnings)

  const sponsored = extractEnumAxis(
    text,
    SPONSORED_PLACEMENT_LEXICON,
    'No sponsored placement type stated. Retail-media requests cannot distinguish sponsored search from sponsored display.',
    'AAMP has no retail-media channel, so there is nothing on that side to bind to.',
  )
  fields.sponsored_placement_types = sponsored.field
  warnings.push(...sponsored.warnings)

  const social = extractEnumAxis(
    text,
    SOCIAL_SURFACE_LEXICON,
    'No social placement surface stated. Feed, stories and short-video surfaces are indistinguishable in the request.',
    'AAMP has no social channel, so this survives only on the AdCP side.',
  )
  fields.social_placement_surfaces = social.field
  warnings.push(...social.warnings)

  const audience = extractAudience(text)
  fields.audience_primary = audience.field
  warnings.push(...audience.warnings)

  return { fields, offered, warnings }
}
