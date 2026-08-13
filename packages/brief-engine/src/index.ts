/**
 * @agenticbrief/brief-engine — public API.
 *
 * Deterministic decomposition of a prose campaign brief into an AdCP
 * `get_products` request and an AAMP `CampaignBrief`, with every field
 * labelled stated / derived / assumed / missing.
 *
 * One entry point:
 *
 *   analyze(text, opts?)  ->  fields, scores, blockers, both payloads
 *
 * Nothing here calls a network or an LLM, now or later. The only clock read is
 * the `now` the caller passes; omit it and relative dates stay `missing` with a
 * warning that says why. Same input and options in, byte-identical output out.
 */

import type {
  AnalyzeOptions,
  BriefAnalysis,
  FieldValue,
  ResolvedAnalyzeOptions,
  Scores,
} from './types.ts'
import {
  ADCP_FILTER_PATHS_COVERED,
  ADCP_SCHEMA_VERSION,
  FIELD_KEYS,
  FIELD_MAP_VERSION,
  FIELDS,
} from './fields.ts'
import { OWNED_KEYS as GEO_TIME_MONEY_KEYS, extractGeoTimeMoney } from './extract/geo-time-money.ts'
import {
  OWNED_KEYS as CHANNELS_AUDIENCE_KEYS,
  extractChannelsAudience,
} from './extract/channels-audience.ts'
import { POLICY_CONTROL_KEYS, extractPolicyControls } from './extract/policy-controls.ts'
import type {
  AdcpValidator,
  Blocker,
  Conflict,
  TransactableDetail,
  ExpressiveDetail,
  Score,
} from './score.ts'
import {
  builtinAdcpChecks,
  computeBlockers,
  countLabels,
  mergeExtractions,
  residualSpans,
  scoreExpressive,
  scoreTransactable,
} from './score.ts'
import type { Omission } from './emit.ts'
import { toAampCampaignBrief, toAdcpGetProducts } from './emit.ts'

/* ==================================================================== *
 * Result
 * ==================================================================== */

/**
 * `BriefAnalysis` plus the things the UI needs that predate this revision's
 * type file: the ranked blocker list, the extractor conflicts, and what each
 * emitter left out. It is a `BriefAnalysis`, so anything typed against that
 * contract keeps working.
 */
export interface EngineAnalysis extends BriefAnalysis {
  /** The things that will make a seller guess or drop, worst first. */
  blockers: Blocker[]
  /** Fields two extractors both claimed, and how the merge settled each one. */
  conflicts: Conflict[]
  /** What each emitter left out of its payload, and why. */
  omitted: { adcp: Omission[]; aamp: Omission[] }
  /** Field keys that actually reached each payload. */
  carried: { adcp: string[]; aamp: string[] }
  scores: Scores & {
    transactable: Score<TransactableDetail> & TransactableDetail
    expressive: Score<ExpressiveDetail> & ExpressiveDetail
  }
}

export interface EngineOptions extends AnalyzeOptions {
  /**
   * Full JSON Schema validation of the emitted request, injected by the caller.
   * Omit it and the engine uses `builtinAdcpChecks`, a documented subset — a
   * static site cannot ship 761 schema files to check one object, and pretending
   * the subset is the schema would be the same species of lie the rest of this
   * package exists to catch. test/emit.test.ts injects the real thing.
   */
  validateAdcp?: AdcpValidator
}

/* ==================================================================== *
 * Options
 * ==================================================================== */

function resolveOptions(opts: EngineOptions = {}): ResolvedAnalyzeOptions {
  const buyingMode = opts.buyingMode ?? 'brief'
  const assumeAll = opts.assume === true
  const assume = Array.isArray(opts.assume) ? [...opts.assume] : []
  return {
    assume,
    assumeAll,
    // NO CLOCK. `now` is whatever the caller passed and nothing else: omit it
    // and relative expressions stay `missing` with a warning naming the words
    // that could not be resolved. `new Date()` here would make the same brief
    // produce different flight dates on different days, and would print a
    // receipt saying the reference date was "caller-supplied" when no caller
    // supplied anything. A caller who wants today's date passes today's date.
    now: opts.now,
    buyingMode,
    // The schema forbids `brief` outside 'brief' mode, so the option cannot
    // override the protocol here.
    includeResidualBrief: buyingMode === 'brief' ? (opts.includeResidualBrief ?? true) : false,
    adcpVersion: opts.adcpVersion ?? ADCP_SCHEMA_VERSION,
  }
}

/** UTC `YYYY-MM-DD`. The extractors take a date string, never a Date. */
function isoDate(d: Date | undefined): string | undefined {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return undefined
  return d.toISOString().slice(0, 10)
}

/* ==================================================================== *
 * analyze
 * ==================================================================== */

/**
 * Decompose a prose brief.
 *
 * Order of operations, and why each step is where it is:
 *
 *  1. Run the three extractors. Each is a pure function of the text and sees
 *     none of the others' output, so no extractor can be biased by a value
 *     another one guessed.
 *  2. Merge under the conflict rule in score.ts. Every collision produces a
 *     warning naming both extractors and reporting the discarded value.
 *  3. Promote only the assumptions the caller accepted by key. Everything else
 *     stays in `offered`, visible and unemitted.
 *  4. Record the two request-shaping fields (`buying_mode`, `brief_prose`).
 *  5. Emit both payloads. The emitters gate `assumed` values a second time, on
 *     the same accepted-key list, so a payload built directly from a hand-made
 *     field map is under the same rule as one built here.
 *  6. Score off the PAYLOADS, not off the labels: a value that was extracted
 *     and then dropped for want of a protocol field has not survived the wire.
 *  7. Rank the blockers.
 */
export function analyze(text: string, opts: EngineOptions = {}): EngineAnalysis {
  const input = typeof text === 'string' ? text : ''
  const options = resolveOptions(opts)
  const referenceDate = isoDate(options.now)

  // `owns` is each module's declared competence, so a key nothing populated can
  // be reported as "looked for and not found" rather than as a field no part of
  // this engine understands. policy-controls writes a key only when it finds
  // one, and without the list its twenty keys were described as never examined.
  const merged = mergeExtractions([
    {
      name: 'geo-time-money',
      owns: GEO_TIME_MONEY_KEYS,
      ...extractGeoTimeMoney(input, { referenceDate }),
    },
    {
      name: 'channels-audience',
      owns: CHANNELS_AUDIENCE_KEYS,
      ...extractChannelsAudience(input, { referenceDate }),
    },
    {
      name: 'policy-controls',
      owns: POLICY_CONTROL_KEYS,
      ...extractPolicyControls(input, { referenceDate }),
    },
  ])

  const fields = merged.fields
  const offered: Record<string, FieldValue<unknown>> = {}
  const warnings = [...merged.warnings]

  // Step 3. `assumed` values move into `fields` only for keys the caller named.
  for (const [key, candidate] of Object.entries(merged.offered)) {
    const accepted = options.assumeAll || options.assume.includes(key)
    if (accepted && candidate.value !== undefined) {
      fields[key] = { ...candidate, label: 'assumed' }
      warnings.push(
        `'${key}' was set to ${JSON.stringify(candidate.value)} by an accepted assumption, not by the brief. ` +
          `${candidate.rule ?? 'No rule recorded.'} It is labelled 'assumed' everywhere it appears.`,
      )
    } else {
      offered[key] = { ...candidate, label: 'assumed' }
    }
  }

  // Step 4. Two fields that describe the request rather than the campaign.
  //
  // `buying_mode` is not in the prose and never will be: it declares what kind
  // of call this is. It is labelled `derived` with the rule naming the option
  // it came from, which is the honest reading — the alternative is a payload
  // property with no entry in the field map, and an unexplained value in a
  // payload is the defect this package is about.
  fields.buying_mode = {
    label: 'derived',
    value: options.buyingMode,
    spans: [],
    from: [],
    rule:
      `buying_mode: '${options.buyingMode}' comes from AnalyzeOptions.buyingMode, not from the brief. ` +
      'It is the only unconditionally required property of get-products-request.json and it describes the ' +
      'call, not the campaign.',
    note: 'Request-shaping field: no span, because no words in the brief produced it.',
    extractor: 'analyze',
  }
  // A brief that is nothing but whitespace satisfies get-products-request.json —
  // `brief` is `type: string` with no minLength — and satisfies no seller. The
  // engine does not pretend the request is invalid, because a conforming seller
  // would not reject it; it says what will actually happen.
  if (input.length > 0 && input.trim().length === 0) {
    warnings.push(
      'The brief is whitespace only. get-products-request.json requires `brief` to be a string and ' +
        'sets no minimum length, so this request validates and carries no requirements at all: every ' +
        'product the seller has matches it equally, which is indistinguishable from the seller ignoring ' +
        'the brief.',
    )
  }

  if (input.length > 0) {
    fields.brief_prose = {
      label: 'stated',
      value: input,
      spans: [{ start: 0, end: input.length, text: input }],
      note:
        'The whole input. AdCP `brief` and AAMP `description` carry it verbatim so the prose that mapped to ' +
        'no structured field is not lost; `residual` reports which ranges those are.',
      extractor: 'analyze',
    }
  }

  // Every key in the map is present, including the ones nothing populated.
  for (const key of FIELD_KEYS) {
    if (fields[key] === undefined) {
      fields[key] = { label: 'missing', spans: [] }
    }
  }

  const residual = residualSpans(input, fields)

  // Step 5.
  const acceptAssumed = options.assumeAll ? Object.keys(fields) : options.assume
  const emitSource = { input, fields, options }
  const adcp = toAdcpGetProducts(emitSource, { acceptAssumed })
  const aamp = toAampCampaignBrief(emitSource, { acceptAssumed })
  warnings.push(...adcp.notes, ...aamp.notes)

  // Step 6.
  const transactable = scoreTransactable(
    aamp.payload,
    adcp.payload,
    opts.validateAdcp ?? builtinAdcpChecks,
  )
  const expressive = scoreExpressive(adcp.payload, ADCP_FILTER_PATHS_COVERED)

  const scores = {
    transactable,
    expressive,
    labels: countLabels(fields),
    fieldsTotal: FIELDS.length,
  }

  // Step 7.
  const blockers = computeBlockers({
    fields,
    offered,
    transactable: transactable.detail,
    adcpCarried: adcp.carried,
    aampCarried: aamp.carried,
  })

  return {
    input,
    fields,
    offered,
    scores,
    adcp: adcp.payload,
    aamp: aamp.payload,
    residual,
    warnings,
    blockers,
    conflicts: merged.conflicts,
    omitted: { adcp: adcp.omitted, aamp: aamp.omitted },
    carried: { adcp: adcp.carried, aamp: aamp.carried },
    meta: {
      adcpVersion: options.adcpVersion,
      fieldMapVersion: FIELD_MAP_VERSION,
      // Verbatim, so re-running analyze() with exactly these options reproduces
      // this result byte for byte.
      options,
    },
  }
}

/* ==================================================================== *
 * Re-exports
 * ==================================================================== */

export type {
  Label,
  Span,
  FieldValue,
  PresentFieldValue,
  Extraction,
  ExtractContext,
  Extractor,
  EnumSource,
  AdcpKind,
  AampKind,
  AdcpBinding,
  AampBinding,
  FieldGroup,
  FieldDef,
  LabelCounts,
  TransactableScore,
  ExpressiveScore,
  Scores,
  AdcpGetProductsRequest,
  AampCampaignBrief,
  AnalyzeOptions,
  ResolvedAnalyzeOptions,
  BriefAnalysis,
} from './types.ts'

export { LABELS, LABEL_PRECEDENCE, isEmittable } from './types.ts'

export type { FieldKey } from './fields.ts'

/** The field map, for the UI. This is the published rubric the tool implements. */
export {
  FIELDS,
  FIELD_BY_KEY,
  FIELD_KEYS,
  AAMP_REQUIRED_KEYS,
  ADCP_FILTER_KEYS,
  ADCP_ONLY_KEYS,
  AAMP_ONLY_KEYS,
  BOTH_KEYS,
  ADCP_FILTER_PATHS_COVERED,
  ADCP_FILTER_FIELD_COUNT,
  ADCP_SCHEMA_VERSION,
  ADCP_SCHEMA_ROOT,
  AAMP_SOURCE,
  AAMP_DIVERGENT_SOURCE,
  FIELD_MAP_VERSION,
} from './fields.ts'

export type {
  AdcpValidationResult,
  AdcpValidator,
  Blocker,
  BlockerKind,
  BlockerSeverity,
  Conflict,
  ExpressiveDetail,
  MergeResult,
  NamedExtraction,
  Score,
  TransactableCheck,
  TransactableDetail,
} from './score.ts'

export {
  ADCP_REQUEST_CHECK,
  builtinAdcpChecks,
  computeBlockers,
  countLabels,
  mergeExtractions,
  residualSpans,
  scoreExpressive,
  scoreTransactable,
  validateAampCampaignBrief,
} from './score.ts'

export type { EmitOptions, EmitResult, EmitSource, Omission } from './emit.ts'
export { toAampCampaignBrief, toAdcpGetProducts } from './emit.ts'

export { extractGeoTimeMoney } from './extract/geo-time-money.ts'
export { extractChannelsAudience } from './extract/channels-audience.ts'
export { extractPolicyControls } from './extract/policy-controls.ts'
