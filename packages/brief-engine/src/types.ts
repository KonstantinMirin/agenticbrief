/**
 * Shared types for the brief engine.
 *
 * THE ONE RULE: no silent invention. Every value the engine emits is traceable
 * to something the user typed, or it is labelled. Nothing here has a default
 * that quietly becomes a requirement in a document someone signs.
 *
 * Runtime shape of the engine:
 *
 *   analyze(input, opts)
 *     -> extractors (pure functions, one module each) each return an Extraction
 *     -> the assembler merges Extractions into BriefAnalysis.fields by label
 *        precedence (stated > derived > assumed > missing)
 *     -> score.ts reads fields, emit.ts serialises fields to the two payloads
 *
 * Everything is deterministic: no LLM call, no network, no clock read except
 * the `now` the caller passes in (AnalyzeOptions.now). Same input, same
 * options, byte-identical output — that is the property the product sells.
 */

/* ------------------------------------------------------------------ *
 * Labels
 * ------------------------------------------------------------------ */

/**
 * The four states a field can be in. Every field in BriefAnalysis.fields
 * carries exactly one.
 *
 * - `stated`   the user said it. `spans` records the exact source offsets.
 * - `derived`  unambiguously implied. `rule` records, in words, the derivation
 *              that fired; `spans` records the text it fired on.
 * - `assumed`  the engine picked the value. OFF BY DEFAULT. An assumed value
 *              only reaches `fields` (and therefore the emitted payloads) when
 *              the caller explicitly accepted the key via AnalyzeOptions.assume.
 *              Un-accepted candidates sit in BriefAnalysis.offered instead.
 * - `missing`  not present and not derivable. The seller will guess or drop it.
 */
export type Label = 'stated' | 'derived' | 'assumed' | 'missing'

/** Iteration order for reports; also the display order. */
export const LABELS: readonly Label[] = ['stated', 'derived', 'assumed', 'missing']

/**
 * Merge precedence. When two extractors propose the same key, the higher
 * number wins; on a tie the first proposal wins and the second is recorded as
 * a conflict warning rather than silently overwriting. Extractors must never
 * downgrade a `stated` field.
 */
export const LABEL_PRECEDENCE: Readonly<Record<Label, number>> = {
  stated: 3,
  derived: 2,
  assumed: 1,
  missing: 0,
}

/** True for labels whose values may be serialised into the emitted payloads. */
export function isEmittable(label: Label): boolean {
  return label === 'stated' || label === 'derived' || label === 'assumed'
}

/* ------------------------------------------------------------------ *
 * Provenance
 * ------------------------------------------------------------------ */

/**
 * A half-open character range into the analyzed input string, plus the exact
 * substring it covers. `text` is redundant with `input.slice(start, end)` and
 * that is deliberate: the UI quotes it, and a round-trip test asserts the two
 * agree, which is how span drift gets caught.
 */
export interface Span {
  /** Inclusive start offset into the input string (UTF-16 code units). */
  start: number
  /** Exclusive end offset into the input string. */
  end: number
  /** input.slice(start, end) — the quoted evidence. */
  text: string
}

/**
 * One field's value plus its provenance.
 *
 * Invariants (enforced by the assembler, asserted in tests):
 * - `label: 'stated'`  => spans.length >= 1 and value !== undefined
 * - `label: 'derived'` => rule is set, and spans.length >= 1 unless the rule
 *                          derives from another field rather than from text
 *                          (then `from` names the source fields)
 * - `label: 'assumed'` => rule is set and states where the default came from
 * - `label: 'missing'` => value === undefined and spans is empty
 */
export interface FieldValue<T = unknown> {
  label: Label
  /** Absent for `missing`. Already normalised to the protocol's value shape. */
  value?: T
  /** Source evidence. Empty array for `missing`, and for cross-field derivations. */
  spans: Span[]
  /**
   * For `derived` and `assumed`: the rule that fired, written for a human
   * ("'US market' -> countries: ['US'] (ISO 3166-1 alpha-2 name match)").
   * This string is shown to the user verbatim; it is the receipt.
   */
  rule?: string
  /** Free-text caveat shown next to the value (vocabulary loss, protocol gap). */
  note?: string
  /** Field keys this value was derived from, when the derivation is cross-field. */
  from?: string[]
  /** Which extractor module produced this, for debugging and conflict reports. */
  extractor?: string
  /**
   * Raw surface forms the extractor matched before normalisation
   * (e.g. ['United States'] for value ['US']). Diagnostic only.
   */
  raw?: string[]
}

/** A field value known to carry a value (everything except `missing`). */
export type PresentFieldValue<T = unknown> = FieldValue<T> & { value: T }

/* ------------------------------------------------------------------ *
 * Extraction — what an extractor module returns
 * ------------------------------------------------------------------ */

/**
 * The partial result of one extractor. Every extractor is a pure function of
 * (input, ctx); it proposes only the keys it is competent for and leaves every
 * other key alone. The assembler merges the proposals — an extractor never
 * sees, and never mutates, another extractor's output.
 *
 * An extractor MUST NOT put a value it invented into `fields`. Defaults go in
 * `offered`, where they stay unless the caller accepts them.
 */
export interface Extraction {
  /** Proposed field values, keyed by FieldDef.key. */
  fields?: Record<string, FieldValue<unknown>>
  /**
   * Assumption candidates: values the engine COULD supply but has not. Always
   * `label: 'assumed'`. Promoted into `fields` only for keys named in
   * AnalyzeOptions.assume. This is where a 60/25/15 channel split belongs, and
   * why it never appears in a payload nobody accepted.
   */
  offered?: Record<string, FieldValue<unknown>>
  /** Human-readable problems found while extracting (ambiguity, conflict, unsupported vocabulary). */
  warnings?: string[]
}

/** Read-only context handed to every extractor. Deterministic by construction. */
export interface ExtractContext {
  /** The full input string. Spans index into this. */
  input: string
  /** A lower-cased copy, offset-identical to `input`, for case-insensitive matching. */
  lower: string
  /** Reference date for relative-date derivation ("next quarter"). Caller-supplied. */
  now: Date
  /** The resolved options for this run. */
  options: ResolvedAnalyzeOptions
}

/** Every extractor module exports one of these. */
export type Extractor = (ctx: ExtractContext) => Extraction

/* ------------------------------------------------------------------ *
 * The field map (data lives in fields.ts)
 * ------------------------------------------------------------------ */

/** Where an enumerated vocabulary is defined. `null` = free value, no vocabulary. */
export type EnumSource =
  | 'iso3166-1'
  | 'iso3166-2'
  | 'iso4217'
  | 'iso8601'
  | 'iab-content-3.0'
  | 'iab-audience-1.1'
  /** An AdCP enum file, path relative to the pinned schema root. */
  | `enums/${string}.json`
  /** An AdCP core schema that constrains the value shape rather than an enum. */
  | `core/${string}.json`
  /** An AdCP operation schema carrying an inline enum (e.g. `buying_mode`). */
  | `media-buy/${string}.json`
  /** A Python enum in the AAMP reference implementation, `aamp:<module>.<Class>`. */
  | `aamp:${string}`

/** The value shape a field takes on the AdCP wire. */
export type AdcpKind =
  | 'string'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'enum'
  | 'enum[]'
  | 'string[]'
  | 'uri[]'
  | 'iso3166-1'
  | 'iso3166-2'
  | 'iso4217'
  | 'iso4217[]'
  | 'iso8601-date'
  | 'money'
  | 'brand-ref'
  | 'format-id[]'
  | 'metro[]'
  | 'postal-area[]'
  | 'geo-point[]'
  | 'geo-capability[]'
  | 'keyword[]'
  | 'signal-ref[]'
  | 'capability-flags'
  | 'performance-standard[]'
  | 'vendor-metric[]'
  | 'trusted-match'
  | 'property-list-ref'
  | 'ext'

/** The value shape a field takes in the AAMP CampaignBrief pydantic model. */
export type AampKind =
  | 'str'
  | 'int'
  | 'float'
  | 'bool'
  | 'date'
  | 'enum'
  | 'list[str]'
  | 'list[ChannelAllocation]'
  | 'list[GeoTarget]'
  | 'list[KPI]'
  | 'AudiencePlan'
  | 'AudienceRef'
  | 'list[AudienceRef]'
  | 'AudienceStrictness'
  | 'BrandSafety'
  | 'FrequencyCap'
  | 'ApprovalConfig'
  | 'DealPreferences'

/** Binding of a concept to its AdCP `get_products` location. */
export interface AdcpBinding {
  /**
   * Dotted path from the root of the get_products request, e.g.
   * 'filters.countries', 'brand.domain', 'preferred_delivery_types'.
   * `[]` in a segment means "one entry per value in an array".
   */
  path: string
  kind: AdcpKind
  /** Required by the request schema (only `buying_mode` is, plus `brief` conditionally). */
  required?: boolean
  /** Marked deprecated in the pinned schema. */
  deprecated?: boolean
}

/** Binding of a concept to its AAMP `CampaignBrief` location. */
export interface AampBinding {
  /** Dotted path from the root of the CampaignBrief model, e.g. 'brand_safety.excluded_categories'. */
  path: string
  /** Required by the pydantic model as written (not as documented — see fields.ts notes). */
  required: boolean
  kind: AampKind
  /**
   * The model's own default when the field is omitted. Present here as a
   * finding, not as a licence to fill it in: an unstated AAMP default that
   * arrives at a seller is still a value nobody in the room agreed to.
   */
  defaultsTo?: string
}

/** Coarse grouping, for rendering the map and grouping the UI. */
export type FieldGroup =
  | 'identity'
  | 'timing'
  | 'budget'
  | 'geo'
  | 'inventory'
  | 'creative'
  | 'audience'
  | 'measurement'
  | 'safety'
  | 'governance'

/** One concept a campaign brief can carry. The canonical list is in fields.ts. */
export interface FieldDef {
  /** Stable engine key. Never a protocol path — the two protocols disagree on names. */
  key: string
  /** Plain English, sentence case, no protocol jargon. */
  label: string
  group: FieldGroup
  /** Words a buyer would actually type. Lower case. Used by extractors, not by the emitters. */
  aliases: string[]
  /** Where it goes in an AdCP get_products request, or null if AdCP cannot express it. */
  adcp: AdcpBinding | null
  /** Where it goes in an AAMP CampaignBrief, or null if AAMP cannot express it. */
  aamp: AampBinding | null
  /** The vocabulary the value must come from, or null for free values. */
  enumSource: EnumSource | null
  /** One sentence: what happens if this field is missing. */
  consequence: string
  /** Protocol-gap commentary. Present on every entry where one side is null. */
  note?: string
}

/* ------------------------------------------------------------------ *
 * Scores
 * ------------------------------------------------------------------ */

export interface LabelCounts {
  stated: number
  derived: number
  assumed: number
  missing: number
}

/**
 * Transactable: can this brief be transacted at all?
 * Two conditions, both reported separately because they fail for different reasons:
 * the AAMP CampaignBrief constructs, and the AdCP get_products request validates.
 */
export interface TransactableScore {
  ok: boolean
  /** Field keys whose AAMP binding is required and which have an emittable value. */
  satisfied: string[]
  /** Field keys whose AAMP binding is required and which do not. */
  missing: string[]
  /** AAMP cross-field validators that would raise (flight_end <= flight_start, budget_pct sum != 100, duplicate channel). */
  violations: string[]
  /** The AdCP request satisfies get-products-request.json for the chosen buying_mode. */
  adcpValid: boolean
  /** Why it does not, when it does not. */
  adcpErrors: string[]
}

/**
 * Expressive: how much of the buyer's intent survives the wire?
 * Denominator is the number of distinct `filters.*` fields in the pinned
 * product-filters schema; numerator is how many carry an emittable value.
 */
export interface ExpressiveScore {
  /** Distinct filter paths populated. */
  used: string[]
  usedCount: number
  /** Count of distinct `filters.*` properties in the pinned schema. */
  total: number
  /** usedCount / total, 0..1. */
  ratio: number
}

export interface Scores {
  transactable: TransactableScore
  expressive: ExpressiveScore
  /** Counts across every field in the map. */
  labels: LabelCounts
  /** Total concepts in the field map, i.e. the denominator for `labels`. */
  fieldsTotal: number
}

/* ------------------------------------------------------------------ *
 * Emitted payloads
 * ------------------------------------------------------------------ */

/**
 * An AdCP get_products request. Loosely typed on purpose: the engine validates
 * against the real JSON Schema at the pinned version rather than against a
 * hand-written interface that would drift from it.
 */
export type AdcpGetProductsRequest = Record<string, unknown>

/** An AAMP CampaignBrief object, as JSON the pydantic model would accept. */
export type AampCampaignBrief = Record<string, unknown>

/* ------------------------------------------------------------------ *
 * Options and result
 * ------------------------------------------------------------------ */

export interface AnalyzeOptions {
  /**
   * Explicit acceptance of engine-picked values. Default: none.
   * `true` accepts every offered assumption (for tests and for a deliberate
   * "fill it in" button); an array accepts only the named field keys.
   * Nothing else moves an `assumed` value into the emitted payloads.
   */
  assume?: boolean | readonly string[]
  /**
   * Reference date for relative-date derivation ("next quarter", "for six
   * weeks"). THERE IS NO DEFAULT: omit it and every relative expression stays
   * `missing`, with a warning naming the words that could not be resolved.
   * The engine reads no clock of its own, so the same input and options always
   * produce byte-identical output — including on a different day.
   */
  now?: Date
  /** AdCP buying mode for the emitted request. Defaults to 'brief'. */
  buyingMode?: 'brief' | 'wholesale' | 'refine'
  /**
   * Emit the residual prose in `brief`. Defaults to true, and is forced false
   * for buying_mode 'wholesale' / 'refine', where the schema forbids `brief`.
   */
  includeResidualBrief?: boolean
  /** Schema version to validate against. Defaults to ADCP_SCHEMA_VERSION in fields.ts. */
  adcpVersion?: string
}

/** AnalyzeOptions after defaulting; what extractors actually see. */
export interface ResolvedAnalyzeOptions {
  assume: readonly string[]
  assumeAll: boolean
  /** Exactly what the caller passed. `undefined` means no reference date exists. */
  now: Date | undefined
  buyingMode: 'brief' | 'wholesale' | 'refine'
  includeResidualBrief: boolean
  adcpVersion: string
}

/**
 * The whole result. `fields` is the authoritative per-field view; `adcp` and
 * `aamp` are serialisations of it and contain nothing that is not in it.
 */
export interface BriefAnalysis {
  /** The input, verbatim. Spans index into this and are meaningless without it. */
  input: string
  /** One entry per FieldDef in the map — including `missing` ones. Never sparse. */
  fields: Record<string, FieldValue<unknown>>
  /**
   * Assumption candidates the caller did NOT accept. Always `label: 'assumed'`.
   * Rendered as an offer ("we could set this to X"); never serialised.
   */
  offered: Record<string, FieldValue<unknown>>
  scores: Scores
  /** The AdCP get_products request built from `fields`. */
  adcp: AdcpGetProductsRequest
  /** The AAMP CampaignBrief built from `fields`. */
  aamp: AampCampaignBrief
  /** Character ranges of the input that no extractor claimed — the residual `brief` string. */
  residual: Span[]
  /** Ambiguities, vocabulary losses, protocol gaps, extractor conflicts. */
  warnings: string[]
  /** Provenance of the run itself. */
  meta: {
    adcpVersion: string
    /** Field map revision, bumped when fields.ts changes shape. */
    fieldMapVersion: string
    /** Options as resolved, so a result can be reproduced exactly. */
    options: ResolvedAnalyzeOptions
  }
}
