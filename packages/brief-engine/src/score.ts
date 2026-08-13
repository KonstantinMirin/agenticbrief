/**
 * Merge, score, and blockers.
 *
 * Three jobs, in order:
 *
 *  1. `mergeExtractions` folds the partial results of the three extractor
 *     modules into one `Record<string, FieldValue>` covering every key in the
 *     field map. The conflict rule is written down below and every conflict
 *     produces a warning naming both extractors — a silent overwrite here would
 *     be exactly the failure mode this package exists to prevent.
 *
 *  2. `scoreTransactable` and `scoreExpressive` answer the two headline
 *     questions. Both return `{ score, of, detail }` and both count what
 *     actually reached the emitted payload, not what the labels promise. A
 *     field can be `stated` and still not survive the wire — `audience_primary`
 *     on the canonical brief is exactly that — and a score computed off labels
 *     would report intent that never left the building.
 *
 *  3. `computeBlockers` ranks what will make a seller guess or drop, each entry
 *     carrying the `consequence` sentence from fields.ts verbatim.
 *
 * THE ONE RULE, restated for this file: nothing here invents a value. The
 * scorer never fills a gap to improve a number, and `assumed` values are only
 * ever counted when the caller has accepted them by key.
 *
 * No I/O. No network. No clock. `builtinAdcpChecks` is a hand-written subset of
 * `get-products-request.json` so the engine can run in a browser with no schema
 * bundle; full JSON Schema validation against the published schema is injected
 * by the caller (see `AdcpValidator`) and is exercised in test/emit.test.ts.
 */

import type {
  ExpressiveScore,
  FieldValue,
  Label,
  LabelCounts,
  Span,
  TransactableScore,
} from './types.ts'
import { LABEL_PRECEDENCE, isEmittable } from './types.ts'
import {
  AAMP_REQUIRED_KEYS,
  ADCP_FILTER_FIELD_COUNT,
  FIELDS,
  FIELD_BY_KEY,
  FIELD_KEYS,
} from './fields.ts'

/* ==================================================================== *
 * Merge
 * ==================================================================== */

/** One extractor's output, tagged with the module that produced it. */
export interface NamedExtraction {
  /** Module name, as it will appear in a conflict warning. */
  name: string
  fields?: Record<string, FieldValue<unknown>>
  offered?: Record<string, FieldValue<unknown>>
  warnings?: string[]
  /**
   * Every key this extractor is competent for, whether or not it proposed one
   * this run. Some modules emit a `missing` placeholder for each owned key and
   * some write a key only when they find something; without this list the merge
   * cannot tell "nobody looked at this field" from "somebody looked and found
   * nothing", and it stamped the first sentence on both. They are different
   * facts and only one of them is an excuse.
   */
  owns?: readonly string[]
}

/** A field two extractors both claimed, and how it was settled. */
export interface Conflict {
  key: string
  /** Extractor whose value is in `fields`. */
  winner: string
  /** Extractor whose value was dropped. */
  loser: string
  /** Which clause of the conflict rule fired. */
  rule: 'label-precedence' | 'longer-span' | 'first-registered'
  /** The warning pushed onto the merge result, verbatim. */
  warning: string
}

export interface MergeResult {
  /** Every key in FIELD_KEYS, never sparse. Unclaimed keys are `missing`. */
  fields: Record<string, FieldValue<unknown>>
  /** Assumption candidates, merged the same way. Never promoted here. */
  offered: Record<string, FieldValue<unknown>>
  /** Extractor warnings, in extractor order, followed by conflict warnings. */
  warnings: string[]
  conflicts: Conflict[]
}

/** Total characters of source evidence behind a value. */
function spanWeight(fv: FieldValue<unknown>): number {
  let n = 0
  for (const s of fv.spans) n += Math.max(0, s.end - s.start)
  return n
}

function describe(fv: FieldValue<unknown>): string {
  const v = fv.value === undefined ? 'no value' : JSON.stringify(fv.value)
  return `${fv.label} ${v} (${spanWeight(fv)} chars of evidence)`
}

/**
 * THE CONFLICT RULE, in full, because a merge that resolves silently is the
 * same defect as a generator that invents silently.
 *
 *   0. A `missing` proposal is not a claim. It never displaces a claim and it
 *      never raises a conflict — an extractor reporting that it looked and
 *      found nothing must not erase what another extractor found.
 *
 *   1. Between two claims, the higher `LABEL_PRECEDENCE` wins: `stated` beats
 *      `derived` beats `assumed`. A reading of the buyer's own words is never
 *      overridden by an inference, however much text the inference matched.
 *
 *   2. Same label: the longer total stated span wins. The extractor that
 *      matched more of the sentence saw more of the sentence.
 *
 *   3. Exact tie: the first extractor registered wins, so the merge is a pure
 *      function of the registration order and not of object key order.
 *
 * Clauses 1-3 all push a warning naming both extractors, both values and the
 * clause that decided it. The loser's value is reported in the warning, so a
 * reader can see what was discarded rather than being told a number.
 */
export function mergeExtractions(extractions: readonly NamedExtraction[]): MergeResult {
  const fields: Record<string, FieldValue<unknown>> = Object.create(null)
  const offered: Record<string, FieldValue<unknown>> = Object.create(null)
  const owner: Record<string, string> = Object.create(null)
  const offeredOwner: Record<string, string> = Object.create(null)
  const warnings: string[] = []
  const conflicts: Conflict[] = []

  for (const ex of extractions) warnings.push(...(ex.warnings ?? []))

  for (const ex of extractions) {
    for (const [key, incoming] of Object.entries(ex.fields ?? {})) {
      const held = fields[key]
      const stamped = incoming.extractor ? incoming : { ...incoming, extractor: ex.name }

      if (held === undefined) {
        fields[key] = stamped
        owner[key] = ex.name
        continue
      }

      // Clause 0: `missing` is not a claim in either direction.
      if (incoming.label === 'missing') continue
      if (held.label === 'missing') {
        fields[key] = stamped
        owner[key] = ex.name
        continue
      }

      // Clauses 1-3.
      const heldRank = LABEL_PRECEDENCE[held.label]
      const inRank = LABEL_PRECEDENCE[incoming.label]
      let incomingWins: boolean
      let rule: Conflict['rule']
      if (inRank !== heldRank) {
        incomingWins = inRank > heldRank
        rule = 'label-precedence'
      } else {
        const heldWeight = spanWeight(held)
        const inWeight = spanWeight(incoming)
        if (inWeight !== heldWeight) {
          incomingWins = inWeight > heldWeight
          rule = 'longer-span'
        } else {
          incomingWins = false
          rule = 'first-registered'
        }
      }

      const winnerName = incomingWins ? ex.name : (owner[key] ?? 'unknown')
      const loserName = incomingWins ? (owner[key] ?? 'unknown') : ex.name
      const winnerVal = incomingWins ? stamped : held
      const loserVal = incomingWins ? held : stamped
      const because =
        rule === 'label-precedence'
          ? `label precedence (${winnerVal.label} outranks ${loserVal.label})`
          : rule === 'longer-span'
            ? `the longer stated span (${spanWeight(winnerVal)} chars against ${spanWeight(loserVal)})`
            : 'registration order, because the two claims are indistinguishable on label and on span length'
      const warning =
        `Two extractors claimed '${key}': ${winnerName} proposed ${describe(winnerVal)} and ` +
        `${loserName} proposed ${describe(loserVal)}. ${winnerName} was kept on ${because}. ` +
        `The discarded value is reported here rather than dropped.`

      if (incomingWins) {
        fields[key] = stamped
        owner[key] = ex.name
      }
      conflicts.push({ key, winner: winnerName, loser: loserName, rule, warning })
      warnings.push(warning)
    }

    for (const [key, incoming] of Object.entries(ex.offered ?? {})) {
      const held = offered[key]
      const stamped = incoming.extractor ? incoming : { ...incoming, extractor: ex.name }
      if (held === undefined) {
        offered[key] = stamped
        offeredOwner[key] = ex.name
        continue
      }
      const keepIncoming = spanWeight(incoming) > spanWeight(held)
      const winnerName = keepIncoming ? ex.name : (offeredOwner[key] ?? 'unknown')
      const loserName = keepIncoming ? (offeredOwner[key] ?? 'unknown') : ex.name
      if (keepIncoming) {
        offered[key] = stamped
        offeredOwner[key] = ex.name
      }
      warnings.push(
        `Two extractors offered an assumption for '${key}': ${winnerName} and ${loserName}. ` +
          `${winnerName}'s candidate was kept. Neither reaches a payload unless you accept the key.`,
      )
    }
  }

  // Every field in the map that no extractor populated becomes `missing` — and
  // says which kind of missing it is.
  const searchedBy: Record<string, string> = Object.create(null)
  for (const ex of extractions) {
    for (const key of ex.owns ?? []) searchedBy[key] ??= ex.name
  }
  for (const key of FIELD_KEYS) {
    if (fields[key] === undefined) {
      const owner = searchedBy[key]
      fields[key] = {
        label: 'missing',
        spans: [],
        extractor: owner,
        note: owner
          ? `The ${owner} extractor is competent for this field, looked for it and found nothing in this brief.`
          : 'No extractor in this engine is competent for this field, so it was not looked for. ' +
            'A field nobody looked for and a field that was looked for and not found are different ' +
            'facts; this is the first kind.',
      }
    }
  }

  return { fields, offered, warnings, conflicts }
}

/* ==================================================================== *
 * Label counts and residue
 * ==================================================================== */

export function countLabels(fields: Record<string, FieldValue<unknown>>): LabelCounts {
  const counts: LabelCounts = { stated: 0, derived: 0, assumed: 0, missing: 0 }
  for (const key of FIELD_KEYS) {
    const fv = fields[key]
    if (fv) counts[fv.label] += 1
  }
  return counts
}

/**
 * Character ranges of the input that no field's spans cover. The residue is
 * real: it is the part of the brief that mapped to no structured field, and it
 * is why `brief` is emitted verbatim rather than reconstructed from the fields.
 * Whitespace-only fragments are dropped; every returned span is trimmed and
 * quotes the input exactly.
 */
export function residualSpans(
  input: string,
  fields: Record<string, FieldValue<unknown>>,
  /**
   * Keys whose spans do not count as a claim. `brief_prose` is here because its
   * span is the whole input by construction — it is the carrier of the residue,
   * not a claim on it, and counting it would make the residue always empty.
   */
  ignore: readonly string[] = ['brief_prose'],
): Span[] {
  const skip = new Set(ignore)
  const claimed: Array<[number, number]> = []
  for (const [key, fv] of Object.entries(fields)) {
    if (skip.has(key)) continue
    for (const s of fv.spans) {
      if (s.end > s.start) claimed.push([s.start, s.end])
    }
  }
  claimed.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  const merged: Array<[number, number]> = []
  for (const range of claimed) {
    const last = merged[merged.length - 1]
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([range[0], range[1]])
  }

  const out: Span[] = []
  let cursor = 0
  const push = (start: number, end: number): void => {
    let s = start
    let e = end
    while (s < e && /\s/.test(input[s]!)) s += 1
    while (e > s && /\s/.test(input[e - 1]!)) e -= 1
    if (e > s) out.push({ start: s, end: e, text: input.slice(s, e) })
  }
  for (const [start, end] of merged) {
    if (start > cursor) push(cursor, start)
    cursor = Math.max(cursor, end)
  }
  if (cursor < input.length) push(cursor, input.length)
  return out
}

/* ==================================================================== *
 * AdCP request validation
 * ==================================================================== */

export interface AdcpValidationResult {
  valid: boolean
  /** One readable sentence per failure. Empty when valid. */
  errors: string[]
}

/**
 * A validator for the emitted `get_products` request. The engine ships a
 * hand-written subset (`builtinAdcpChecks`) so it can run in a browser with no
 * schema bundle; the caller may inject a real JSON Schema validator instead,
 * which is what test/emit.test.ts does against the published 3.1.10 schema.
 */
export type AdcpValidator = (payload: Record<string, unknown>) => AdcpValidationResult

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_4217 = /^[A-Z]{3}$/
const ISO_3166_1 = /^[A-Z]{2}$/
const ISO_3166_2 = /^[A-Z]{2}-[A-Z0-9]+$/

/**
 * The subset of `media-buy/get-products-request.json` and
 * `core/product-filters.json` that this engine is capable of violating.
 *
 * DELIBERATELY PARTIAL, and it says so: it checks the request-level required
 * property, the conditional `brief` rule, the `budget_range` object contract,
 * the `minItems: 1` arrays, the four ISO patterns and the required keys of
 * `performance-standard`. It does not walk every `$ref` in the schema graph.
 * The full validation is a test, not a runtime dependency, because a static
 * site cannot ship 761 schema files to check one object.
 */
export function builtinAdcpChecks(payload: Record<string, unknown>): AdcpValidationResult {
  const errors: string[] = []
  const mode = payload.buying_mode

  if (mode === undefined) {
    errors.push('buying_mode is required by get-products-request.json and is not present.')
  } else if (mode !== 'brief' && mode !== 'wholesale' && mode !== 'refine') {
    errors.push(`buying_mode '${String(mode)}' is not one of 'brief', 'wholesale', 'refine'.`)
  }

  const brief = payload.brief
  if (mode === 'brief' && (typeof brief !== 'string' || brief.length === 0)) {
    errors.push("brief is required when buying_mode is 'brief' and is not present.")
  }
  if ((mode === 'wholesale' || mode === 'refine') && brief !== undefined) {
    errors.push(`brief must not be provided when buying_mode is '${String(mode)}'.`)
  }
  if (payload.if_pricing_version !== undefined && payload.if_wholesale_feed_version === undefined) {
    errors.push('if_pricing_version depends on if_wholesale_feed_version, which is not present.')
  }

  const filters = payload.filters
  if (filters !== undefined) {
    if (typeof filters !== 'object' || filters === null || Array.isArray(filters)) {
      errors.push('filters must be an object.')
    } else {
      const f = filters as Record<string, unknown>

      const budget = f.budget_range
      if (budget !== undefined) {
        const b = budget as Record<string, unknown>
        if (typeof b.currency !== 'string' || !ISO_4217.test(b.currency)) {
          errors.push(
            'filters.budget_range.currency is required and must be an ISO 4217 alpha-3 code.',
          )
        }
        if (b.min === undefined && b.max === undefined) {
          errors.push('filters.budget_range requires at least one of min or max.')
        }
      }

      for (const key of [
        'countries',
        'regions',
        'metros',
        'postal_areas',
        'channels',
        'format_ids',
        'pricing_currencies',
        'video_placement_types',
        'audio_distribution_types',
        'sponsored_placement_types',
        'social_placement_surfaces',
        'keywords',
        'signal_targeting',
        'required_metrics',
        'required_performance_standards',
        'required_vendor_metrics',
        'required_geo_targeting',
        'required_axe_integrations',
        'geo_proximity',
      ]) {
        const v = f[key]
        if (v !== undefined && (!Array.isArray(v) || v.length === 0)) {
          errors.push(`filters.${key} must be a non-empty array (minItems: 1).`)
        }
      }

      for (const c of (f.countries as string[] | undefined) ?? []) {
        if (!ISO_3166_1.test(c))
          errors.push(`filters.countries entry '${c}' is not ISO 3166-1 alpha-2.`)
      }
      for (const r of (f.regions as string[] | undefined) ?? []) {
        if (!ISO_3166_2.test(r)) errors.push(`filters.regions entry '${r}' is not ISO 3166-2.`)
      }
      for (const c of (f.pricing_currencies as string[] | undefined) ?? []) {
        if (!ISO_4217.test(c))
          errors.push(`filters.pricing_currencies entry '${c}' is not ISO 4217.`)
      }
      for (const key of ['start_date', 'end_date']) {
        const v = f[key]
        if (v !== undefined && (typeof v !== 'string' || !ISO_DATE.test(v))) {
          errors.push(`filters.${key} must be an ISO 8601 calendar date (YYYY-MM-DD).`)
        }
      }
      if (f.min_exposures !== undefined && !Number.isInteger(f.min_exposures)) {
        errors.push('filters.min_exposures must be an integer.')
      }
      for (const ps of (f.required_performance_standards as
        Array<Record<string, unknown>> | undefined) ?? []) {
        for (const req of ['metric', 'threshold', 'vendor']) {
          if (ps[req] === undefined) {
            errors.push(
              `filters.required_performance_standards entry is missing '${req}', which core/performance-standard.json requires.`,
            )
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/* ==================================================================== *
 * AAMP CampaignBrief validation
 * ==================================================================== */

const AAMP_OBJECTIVES = new Set(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'REACH'])
const AAMP_KPI_METRICS = new Set(['CPM', 'CPC', 'CPCV', 'CTR', 'VCR', 'ROAS', 'GRP'])
const AAMP_PACING = new Set(['EVEN', 'FRONT_LOADED', 'BACK_LOADED', 'CUSTOM'])
const AAMP_GEO_TYPES = new Set(['COUNTRY', 'STATE', 'DMA', 'METRO', 'ZIP'])
const AAMP_CHANNELS = new Set(['CTV', 'DISPLAY', 'AUDIO', 'NATIVE', 'DOOH', 'LINEAR_TV'])

/**
 * Every validator `campaign_brief.py` actually runs, transcribed from the
 * source at AAMP_SOURCE. Field-level constraints (`gt=0`, the ISO 4217
 * `pattern`, `min_length`) and the three cross-field validators in
 * `_validate_brief`: flight_end strictly after flight_start, channel
 * `budget_pct` summing to 100 within 0.01, and no duplicate channel types.
 *
 * Returns one readable sentence per violation; empty means pydantic would
 * construct the model.
 */
export function validateAampCampaignBrief(payload: Record<string, unknown>): string[] {
  const v: string[] = []
  const str = (k: string): string | undefined =>
    typeof payload[k] === 'string' ? (payload[k] as string) : undefined

  for (const k of ['advertiser_id', 'campaign_name']) {
    const s = str(k)
    if (s === undefined || s.length === 0)
      v.push(`${k} is required and must be a non-empty string.`)
  }
  const objective = str('objective')
  if (objective === undefined) v.push('objective is required.')
  else if (!AAMP_OBJECTIVES.has(objective))
    v.push(
      `objective '${objective}' is not a CampaignObjective (AWARENESS, CONSIDERATION, CONVERSION, REACH).`,
    )

  const budget = payload.total_budget
  if (budget === undefined) v.push('total_budget is required.')
  else if (typeof budget !== 'number' || !(budget > 0))
    v.push('total_budget must be a number greater than 0.')

  const currency = str('currency')
  if (currency === undefined) v.push('currency is required.')
  else if (!ISO_4217.test(currency))
    v.push(`currency '${currency}' does not match the ISO 4217 pattern ^[A-Z]{3}$.`)

  const start = str('flight_start')
  const end = str('flight_end')
  if (start === undefined || !ISO_DATE.test(start))
    v.push('flight_start is required and must be YYYY-MM-DD.')
  if (end === undefined || !ISO_DATE.test(end))
    v.push('flight_end is required and must be YYYY-MM-DD.')
  if (start && end && ISO_DATE.test(start) && ISO_DATE.test(end) && !(end > start)) {
    v.push(`flight_end must be after flight_start (got flight_start ${start}, flight_end ${end}).`)
  }

  const channels = payload.channels
  if (!Array.isArray(channels) || channels.length === 0) {
    v.push('channels is required and must contain at least one ChannelAllocation.')
  } else {
    let sum = 0
    let everyPctPresent = true
    const seen = new Set<string>()
    const dupes: string[] = []
    for (const raw of channels as Array<Record<string, unknown>>) {
      const ch = typeof raw.channel === 'string' ? raw.channel : undefined
      if (ch === undefined) v.push('a ChannelAllocation has no channel.')
      else {
        if (!AAMP_CHANNELS.has(ch)) v.push(`channel '${ch}' is not a ChannelType.`)
        if (seen.has(ch)) dupes.push(ch)
        seen.add(ch)
      }
      const pct = raw.budget_pct
      if (pct === undefined) {
        everyPctPresent = false
        v.push(
          `channel '${ch ?? '?'}' has no budget_pct, which ChannelAllocation requires; the brief states no split and the engine will not invent one.`,
        )
      } else if (typeof pct !== 'number' || !(pct > 0) || pct > 100) {
        v.push(`channel '${ch ?? '?'}' has budget_pct ${String(pct)}, outside 0 < pct <= 100.`)
      } else {
        sum += pct
      }
    }
    if (dupes.length > 0) v.push(`Duplicate channel types are not allowed: ${dupes.join(', ')}.`)
    if (everyPctPresent && Math.abs(sum - 100) > 0.01) {
      v.push(`Channel budget_pct values must sum to 100 (got ${sum.toFixed(2)}).`)
    }
  }

  const geo = payload.target_geo
  if (geo !== undefined) {
    if (!Array.isArray(geo)) v.push('target_geo must be a list of GeoTarget.')
    else
      for (const g of geo as Array<Record<string, unknown>>) {
        if (typeof g.geo_type !== 'string' || !AAMP_GEO_TYPES.has(g.geo_type))
          v.push(`target_geo entry has geo_type '${String(g.geo_type)}', which is not a GeoType.`)
        if (typeof g.geo_value !== 'string' || g.geo_value.length === 0)
          v.push('target_geo entry has an empty geo_value.')
      }
  }

  const kpis = payload.kpis
  if (kpis !== undefined) {
    if (!Array.isArray(kpis)) v.push('kpis must be a list of KPI.')
    else
      for (const k of kpis as Array<Record<string, unknown>>) {
        if (typeof k.metric !== 'string' || !AAMP_KPI_METRICS.has(k.metric))
          v.push(`kpis entry has metric '${String(k.metric)}', which is not a KPIMetric.`)
        if (typeof k.target_value !== 'number' || !(k.target_value > 0))
          v.push('kpis entry has a target_value that is not greater than 0.')
      }
  }

  const pacing = str('pacing_model')
  if (pacing !== undefined && !AAMP_PACING.has(pacing))
    v.push(`pacing_model '${pacing}' is not a PacingModel.`)

  const cap = payload.frequency_cap as Record<string, unknown> | undefined
  if (cap !== undefined) {
    if (typeof cap.max_impressions !== 'number' || !(cap.max_impressions > 0))
      v.push('frequency_cap.max_impressions must be greater than 0.')
    if (typeof cap.period_hours !== 'number' || !(cap.period_hours > 0))
      v.push('frequency_cap.period_hours must be greater than 0.')
  }

  const deal = payload.deal_preferences as Record<string, unknown> | undefined
  if (deal !== undefined) {
    if (deal.max_cpm !== undefined && (typeof deal.max_cpm !== 'number' || !(deal.max_cpm > 0)))
      v.push('deal_preferences.max_cpm must be greater than 0.')
    if (
      deal.min_impressions !== undefined &&
      (typeof deal.min_impressions !== 'number' || !(deal.min_impressions > 0))
    )
      v.push('deal_preferences.min_impressions must be greater than 0.')
  }

  const audience = payload.target_audience as Record<string, unknown> | undefined
  if (audience !== undefined && audience !== null && audience.primary == null) {
    v.push('target_audience is present but AudiencePlan.primary is required and is not set.')
  }

  return v
}

/* ==================================================================== *
 * Scores
 * ==================================================================== */

/** Headline number plus the structured reason for it. */
export interface Score<D> {
  /** How many checks passed. */
  score: number
  /** How many checks there were. */
  of: number
  detail: D
}

/** One transactability check and its outcome. */
export interface TransactableCheck {
  /** Field key for the nine AAMP requirements; a sentinel for the tenth check. */
  name: string
  /** Plain English, for the UI. */
  label: string
  passed: boolean
  /** Why it failed. Empty when it passed. */
  reason: string
}

export interface TransactableDetail extends TransactableScore {
  checks: TransactableCheck[]
}

/**
 * The tenth check. Named, so a report can say which of the ten failed rather
 * than reporting nine-of-nine next to an unsendable request.
 */
export const ADCP_REQUEST_CHECK = 'adcp_get_products_validates'

/**
 * Transactable: AAMP CampaignBrief's nine required values, plus a get_products
 * request that validates. Ten checks, one number.
 *
 * The nine are counted against the EMITTED AAMP payload, not against the field
 * labels: a field can be `stated` and still fail to reach the payload — a demo
 * with no taxonomy ID does exactly that — and counting labels would report
 * intent the seller never receives.
 *
 * `channel_budget_split` is the ninth: the model requires eight top-level
 * fields, and `budget_pct` inside every ChannelAllocation is the ninth required
 * value. See the note at the head of fields.ts.
 */
export function scoreTransactable(
  aampPayload: Record<string, unknown>,
  adcpPayload: Record<string, unknown>,
  validateAdcp: AdcpValidator = builtinAdcpChecks,
): Score<TransactableDetail> & TransactableDetail {
  const violations = validateAampCampaignBrief(aampPayload)
  const adcp = validateAdcp(adcpPayload)

  const satisfied: string[] = []
  const missing: string[] = []
  const checks: TransactableCheck[] = []

  for (const key of AAMP_REQUIRED_KEYS) {
    const def = FIELD_BY_KEY[key]!
    const path = def.aamp!.path
    const ok = aampRequiredPresent(aampPayload, key)
    if (ok) satisfied.push(key)
    else missing.push(key)
    checks.push({
      name: key,
      label: `${def.label} (CampaignBrief.${path})`,
      passed: ok,
      reason: ok ? '' : def.consequence,
    })
  }

  checks.push({
    name: ADCP_REQUEST_CHECK,
    label: 'The AdCP get_products request validates',
    passed: adcp.valid,
    reason: adcp.valid ? '' : adcp.errors.join(' '),
  })

  const score = checks.filter((c) => c.passed).length
  const of = checks.length
  const detail: TransactableDetail = {
    ok: score === of && violations.length === 0,
    satisfied,
    missing,
    violations,
    adcpValid: adcp.valid,
    adcpErrors: adcp.errors,
    checks,
  }
  return { ...detail, score, of, detail }
}

/** Whether the AAMP payload actually carries the value this required key names. */
function aampRequiredPresent(payload: Record<string, unknown>, key: string): boolean {
  if (key === 'channels') {
    const c = payload.channels
    return Array.isArray(c) && c.length > 0
  }
  if (key === 'channel_budget_split') {
    const c = payload.channels
    return (
      Array.isArray(c) &&
      c.length > 0 &&
      (c as Array<Record<string, unknown>>).every((a) => typeof a.budget_pct === 'number')
    )
  }
  const path = FIELD_BY_KEY[key]!.aamp!.path
  const v = payload[path]
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.length > 0
  return true
}

export interface ExpressiveDetail extends ExpressiveScore {
  /** The `filters.*` properties the pinned schema defines and this brief does not use. */
  unused: string[]
}

/**
 * Expressive: how much of the buyer's intent survives the wire.
 *
 * Numerator is the number of distinct `filters.*` properties actually present
 * in the emitted request; denominator is ADCP_FILTER_FIELD_COUNT, the property
 * count of `core/product-filters.json` at the pinned version. Counting the
 * payload and not the labels is the whole point: a value that was extracted,
 * labelled and then dropped by the emitter because no AdCP field can hold it
 * has not survived the wire, and a score that counted it would be lying in the
 * buyer's favour.
 */
export function scoreExpressive(
  adcpPayload: Record<string, unknown>,
  allFilterProperties: readonly string[],
): Score<ExpressiveDetail> & ExpressiveDetail {
  const filters = (adcpPayload.filters ?? {}) as Record<string, unknown>
  const used = Object.keys(filters)
    .filter((k) => filters[k] !== undefined)
    .sort()
  const total: number = ADCP_FILTER_FIELD_COUNT
  const unused = allFilterProperties.filter((p) => !used.includes(p)).sort()
  const detail: ExpressiveDetail = {
    used,
    usedCount: used.length,
    total,
    ratio: total === 0 ? 0 : used.length / total,
    unused,
  }
  return { ...detail, score: used.length, of: total, detail }
}

/* ==================================================================== *
 * Blockers
 * ==================================================================== */

export type BlockerKind =
  /** An AAMP required value is absent, so the pydantic model will not construct. */
  | 'aamp_required_missing'
  /** A documented cross-field validator in campaign_brief.py would raise. */
  | 'aamp_validator_violation'
  /** The get_products request does not satisfy the request schema. */
  | 'adcp_invalid'
  /** The buyer said it, the engine read it, and no payload can carry it. */
  | 'stated_but_undeliverable'
  /** A protocol has a field for this and the brief says nothing. */
  | 'expressible_but_missing'
  /** The engine could supply a value and the caller has not accepted it. */
  | 'unaccepted_assumption'

/** What the seller does about it. */
export type BlockerSeverity =
  /** The request or the model does not construct. Nothing ships. */
  | 'blocks'
  /** It ships, and the value does not travel. The seller never sees it. */
  | 'drops'
  /** It ships and the seller fills the gap with its own default. */
  | 'degrades'

export interface Blocker {
  /** 1-based position in priority order. */
  rank: number
  kind: BlockerKind
  severity: BlockerSeverity
  /** Field key this anchors to, or null for request-level failures. */
  field: string | null
  label: Label | null
  /** What happens, in this brief's terms. */
  detail: string
  /** The consequence sentence from fields.ts, verbatim. */
  consequence: string
}

const REQUEST_LEVEL_CONSEQUENCE =
  'The request does not validate, so a conforming seller rejects it and no products come back at all.'

const SEVERITY_RANK: Record<BlockerSeverity, number> = { blocks: 0, drops: 1, degrades: 2 }

export interface BlockerInput {
  fields: Record<string, FieldValue<unknown>>
  offered: Record<string, FieldValue<unknown>>
  transactable: TransactableDetail
  /** Field keys that reached the AdCP payload. */
  adcpCarried: readonly string[]
  /** Field keys that reached the AAMP payload. */
  aampCarried: readonly string[]
}

/**
 * The specific things that will make a seller guess or drop, in priority order.
 *
 * Order is severity first — `blocks` before `drops` before `degrades` — and
 * within a severity, the order of fields.ts, so the list is stable across runs
 * and reads top to bottom as a fix list.
 *
 * Every field-anchored entry carries `consequence` from fields.ts verbatim.
 * That sentence is the product's answer to "so what?" and it is not rewritten
 * here, because a scorer that paraphrases its own rubric is a scorer that has
 * two rubrics.
 */
export function computeBlockers(input: BlockerInput): Blocker[] {
  const { fields, offered, transactable, adcpCarried, aampCarried } = input
  const adcpSet = new Set(adcpCarried)
  const aampSet = new Set(aampCarried)
  const out: Array<Omit<Blocker, 'rank'> & { order: number }> = []
  const orderOf = (key: string): number => FIELDS.findIndex((f) => f.key === key)

  // 1. blocks — the AAMP model will not construct.
  for (const key of transactable.missing) {
    const def = FIELD_BY_KEY[key]!
    out.push({
      order: orderOf(key),
      kind: 'aamp_required_missing',
      severity: 'blocks',
      field: key,
      label: fields[key]?.label ?? 'missing',
      detail: `${def.label} is one of AAMP CampaignBrief's required values and no value reached the payload.`,
      consequence: def.consequence,
    })
  }

  // 1b. blocks — a documented cross-field validator would raise.
  //
  // A validator sentence about a field already reported above as
  // `aamp_required_missing` is the same finding said twice, so it is dropped:
  // a blocker list that repeats itself is a blocker list nobody reads to the end.
  const alreadyReported = new Set(transactable.missing)
  for (const violation of transactable.violations) {
    const key = anchorViolation(violation)
    if (key !== null && alreadyReported.has(key)) continue
    const def = key ? FIELD_BY_KEY[key] : undefined
    out.push({
      order: key ? orderOf(key) : 1_000,
      kind: 'aamp_validator_violation',
      severity: 'blocks',
      field: key,
      label: key ? (fields[key]?.label ?? 'missing') : null,
      detail: violation,
      consequence:
        def?.consequence ??
        'The AAMP brief will not construct, so nothing downstream of the buyer agent runs.',
    })
  }

  // 1c. blocks — the AdCP request itself does not validate.
  for (const error of transactable.adcpErrors) {
    out.push({
      order: 2_000,
      kind: 'adcp_invalid',
      severity: 'blocks',
      field: null,
      label: null,
      detail: error,
      consequence: REQUEST_LEVEL_CONSEQUENCE,
    })
  }

  // 2. drops — the buyer said it and no payload carries it.
  for (const def of FIELDS) {
    const fv = fields[def.key]
    if (!fv || !isEmittable(fv.label)) continue
    if (adcpSet.has(def.key) || aampSet.has(def.key)) continue
    out.push({
      order: orderOf(def.key),
      kind: 'stated_but_undeliverable',
      severity: 'drops',
      field: def.key,
      label: fv.label,
      detail:
        `${def.label} is ${fv.label} in this brief and reaches neither payload. ` +
        (def.note ?? 'Neither protocol has a field that can carry this value as extracted.'),
      consequence: def.consequence,
    })
  }

  // 3. degrades — a protocol has a field for it and the brief says nothing.
  for (const def of FIELDS) {
    const fv = fields[def.key]
    if (!fv || fv.label !== 'missing') continue
    if (def.adcp === null && def.aamp === null) continue
    if (def.adcp?.deprecated === true && def.aamp === null) continue
    if (transactable.missing.includes(def.key)) continue // already reported as `blocks`
    out.push({
      order: orderOf(def.key),
      kind: 'expressible_but_missing',
      severity: 'degrades',
      field: def.key,
      label: 'missing',
      detail: `${def.label} is not stated and not derivable from this brief.`,
      consequence: def.consequence,
    })
  }

  // 4. degrades — an assumption is on offer and nobody has accepted it.
  for (const [key, fv] of Object.entries(offered)) {
    const def = FIELD_BY_KEY[key]
    if (!def) continue
    if (fields[key] && isEmittable(fields[key]!.label)) continue
    out.push({
      order: orderOf(key),
      kind: 'unaccepted_assumption',
      severity: 'degrades',
      field: key,
      label: 'assumed',
      detail:
        `The engine could set ${def.label} to ${JSON.stringify(fv.value)} — ${fv.rule ?? 'no rule recorded'} — ` +
        'and has not, because nobody accepted it. Accept the key to include it.',
      consequence: def.consequence,
    })
  }

  out.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.order - b.order)
  return out.map(({ order: _order, ...rest }, i) => ({ rank: i + 1, ...rest }))
}

/** Map a validator sentence back to the field it is about, for the consequence. */
function anchorViolation(violation: string): string | null {
  if (violation.includes('flight_end must be after flight_start')) return 'end_date'
  if (violation.includes('budget_pct')) return 'channel_budget_split'
  if (violation.includes('Duplicate channel types')) return 'channels'
  if (violation.startsWith('channels is required')) return 'channels'
  if (violation.includes('target_audience')) return 'audience_primary'
  if (violation.startsWith('total_budget')) return 'budget_total'
  if (violation.startsWith('currency')) return 'currency'
  if (violation.startsWith('objective')) return 'objective'
  if (violation.startsWith('advertiser_id')) return 'advertiser_id'
  if (violation.startsWith('campaign_name')) return 'campaign_name'
  if (violation.startsWith('flight_start')) return 'start_date'
  if (violation.startsWith('flight_end')) return 'end_date'
  if (violation.startsWith('pacing_model')) return 'pacing_model'
  if (violation.startsWith('frequency_cap')) return 'frequency_cap'
  if (violation.startsWith('kpis')) return 'kpi_targets'
  return null
}
