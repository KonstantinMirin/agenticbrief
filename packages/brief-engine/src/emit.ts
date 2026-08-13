/**
 * The two emitters: one AdCP `get_products` request, one AAMP `CampaignBrief`,
 * from the same labelled field map.
 *
 * Three rules govern everything below.
 *
 *  1. NO ASSUMED VALUE REACHES A PAYLOAD UNLESS THE CALLER NAMED ITS KEY.
 *     `EmitOptions.acceptAssumed` is the only door. It is enforced once, in
 *     `readable()`, which every field goes through — there is no second path
 *     into either payload. This is the rule the category fails: the best tool
 *     tested invented a 60/25/15 channel split and printed it as a requirement.
 *
 *  2. NOTHING IS DROPPED SILENTLY. Every field that does not reach the payload
 *     produces an `Omission` carrying the field's label and the reason, so the
 *     UI can show what was left out and why. A value the buyer stated that no
 *     protocol can carry is the most important thing this package has to say;
 *     swallowing it would repeat the failure the product exists to fix.
 *
 *  3. THE RESIDUE STAYS. `brief` carries the input verbatim in `brief` mode.
 *     The prose that mapped to no structured field is real — it is the part of
 *     the brief the protocol has no schema for — and reconstructing `brief`
 *     from the fields would delete it. `BriefAnalysis.residual` reports which
 *     character ranges those are; the string itself is not truncated, because
 *     an excerpted brief is an ungrammatical brief and the seller reads it.
 *
 * Deterministic: pure functions of (fields, options). No I/O, no clock.
 */

import type {
  AampCampaignBrief,
  AdcpGetProductsRequest,
  BriefAnalysis,
  FieldValue,
  Label,
  ResolvedAnalyzeOptions,
} from './types.ts'
import { isEmittable } from './types.ts'
import { FIELDS, FIELD_BY_KEY, UNBOUNDED_BUDGET_NOTE } from './fields.ts'

/* ==================================================================== *
 * Shapes
 * ==================================================================== */

export interface EmitOptions {
  /**
   * Field keys whose `assumed` value the caller has explicitly accepted.
   * Default: none. Anything not named here is omitted with a reason, however
   * confidently the engine could have filled it in.
   */
  acceptAssumed?: readonly string[]
}

/** One field that did not reach the payload, and why. */
export interface Omission {
  field: string
  label: Label
  reason: string
}

export interface EmitResult<P> {
  payload: P
  omitted: Omission[]
  /** Field keys that did reach the payload. Used by the scores and the blockers. */
  carried: string[]
  /**
   * Derivations the emitter itself made (never inventions): the cases where a
   * value had exactly one possible destination and was placed there.
   */
  notes: string[]
}

/**
 * What an emitter needs. A full `BriefAnalysis` satisfies it, and so does the
 * partial state `analyze()` holds before the scores exist — the scores are
 * computed from the payloads, so the emitters cannot require them.
 */
export interface EmitSource {
  input: string
  fields: Record<string, FieldValue<unknown>>
  options: ResolvedAnalyzeOptions
}

function source(a: EmitSource | BriefAnalysis): EmitSource {
  return 'options' in a ? a : { input: a.input, fields: a.fields, options: a.meta.options }
}

/* ==================================================================== *
 * The one gate
 * ==================================================================== */

type Readable =
  { ok: true; value: unknown; label: Label } | { ok: false; label: Label; reason: string }

/**
 * The single point at which a field is allowed into a payload. Every rule below
 * calls it; none of them reads `fields[key].value` directly.
 */
function readable(
  fields: Record<string, FieldValue<unknown>>,
  key: string,
  acceptAssumed: ReadonlySet<string>,
): Readable {
  const def = FIELD_BY_KEY[key]
  const fv = fields[key]
  if (!fv || fv.label === 'missing' || fv.value === undefined) {
    return {
      ok: false,
      label: 'missing',
      reason: def ? def.consequence : 'Not stated and not derivable from this brief.',
    }
  }
  if (fv.label === 'assumed' && !acceptAssumed.has(key)) {
    return {
      ok: false,
      label: 'assumed',
      reason:
        `The engine can supply this value (${fv.rule ?? 'engine default'}) and has not. ` +
        `Assumed values are off by default; accept '${key}' explicitly to include it. ` +
        'A brief is a document someone signs.',
    }
  }
  if (!isEmittable(fv.label)) {
    return { ok: false, label: fv.label, reason: 'Label is not emittable.' }
  }
  return { ok: true, value: fv.value, label: fv.label }
}

/* ==================================================================== *
 * Small helpers
 * ==================================================================== */

function setPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let node = root
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i]!
    if (typeof node[p] !== 'object' || node[p] === null) node[p] = {}
    node = node[p] as Record<string, unknown>
  }
  node[parts[parts.length - 1]!] = value
}

const isNonEmptyArray = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0

/**
 * A `core/signal-ref.json` reference, as far as this engine can tell without a
 * signals agent: the discriminated form (`scope` + `signal_id`), the nested
 * `signal_ref` form, or the deprecated bare `signal_id` the 3.1.10 filter still
 * accepts during the migration window. Anything else is a segment name someone
 * typed, and a seller cannot resolve it.
 */
function isSignalRefShaped(v: unknown): v is Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false
  const o = v as Record<string, unknown>
  if (typeof o.signal_ref === 'object' && o.signal_ref !== null) return true
  return typeof o.signal_id === 'string' && o.signal_id.length > 0
}

/* ==================================================================== *
 * AdCP get_products
 * ==================================================================== */

/**
 * A conversion from the engine's value shape to the AdCP wire shape.
 * Returning `{ drop }` is how a rule refuses: the value exists, the protocol
 * has a field with that name, and the value as extracted cannot legally fill
 * it. Every refusal explains itself.
 */
type Convert = (value: unknown) => { value: unknown } | { drop: string }

interface AdcpRule {
  /** Dotted path from the root of the request. */
  path: string
  convert?: Convert
}

const passthrough: Convert = (v) => ({ value: v })

/** Non-empty array or nothing: every AdCP filter array carries `minItems: 1`. */
const arrayOnly: Convert = (v) =>
  isNonEmptyArray(v)
    ? { value: v }
    : { drop: 'Every AdCP filter array carries minItems: 1, and this value is empty.' }

/**
 * Field key -> location in the get_products request.
 *
 * Composites (`brand`, `filters.budget_range`) and the two request-shaping
 * fields (`buying_mode`, `brief`) are handled outside the table because they
 * read more than one key or none at all.
 */
const ADCP_RULES: Record<string, AdcpRule> = {
  brand_domain: { path: 'brand.domain' },
  brand_industries: { path: 'brand.industries', convert: arrayOnly },

  start_date: { path: 'filters.start_date' },
  end_date: { path: 'filters.end_date' },

  pricing_currencies: { path: 'filters.pricing_currencies', convert: arrayOnly },
  is_fixed_price: { path: 'filters.is_fixed_price' },
  delivery_type: { path: 'filters.delivery_type' },
  preferred_delivery_types: { path: 'preferred_delivery_types', convert: arrayOnly },
  exclusivity: { path: 'filters.exclusivity' },

  countries: { path: 'filters.countries', convert: arrayOnly },
  regions: { path: 'filters.regions', convert: arrayOnly },
  metros: { path: 'filters.metros', convert: arrayOnly },
  postal_areas: { path: 'filters.postal_areas', convert: arrayOnly },
  geo_proximity: { path: 'filters.geo_proximity', convert: arrayOnly },
  required_geo_targeting: { path: 'filters.required_geo_targeting', convert: arrayOnly },

  channels: {
    path: 'filters.channels',
    convert: (v) => {
      const list = (v as Array<{ adcp: string | null; surface: string }>) ?? []
      const adcp = list.filter((c) => c.adcp !== null).map((c) => c.adcp as string)
      const unique = Array.from(new Set(adcp))
      if (unique.length === 0) {
        const surfaces = list.map((c) => c.surface).join(', ')
        return {
          drop: `No channel named in this brief (${surfaces}) has a value in AdCP enums/channels.json, so the filter would be empty.`,
        }
      }
      return { value: unique }
    },
  },

  format_ids: {
    path: 'filters.format_ids',
    convert: (v) => {
      const list = (v as Array<{ surface: string; adcpFormatId: unknown }>) ?? []
      const ids = list.map((f) => f.adcpFormatId).filter((id) => id !== null && id !== undefined)
      if (ids.length === 0) {
        const surfaces = list.map((f) => f.surface).join(', ')
        return {
          drop:
            `AdCP format_ids takes a core/format-id.json object (agent_url + id), and a size or a duration is not one. ` +
            `The brief names ${surfaces || 'no format'}; the engine will not synthesise the agent_url half of a format ID, ` +
            'because the AdCP v1-canonical mapping registry explicitly forbids inverting it.',
        }
      }
      return { value: ids }
    },
  },
  standard_formats_only: { path: 'filters.standard_formats_only' },

  video_placement_types: { path: 'filters.video_placement_types', convert: arrayOnly },
  audio_distribution_types: { path: 'filters.audio_distribution_types', convert: arrayOnly },
  sponsored_placement_types: { path: 'filters.sponsored_placement_types', convert: arrayOnly },
  social_placement_surfaces: { path: 'filters.social_placement_surfaces', convert: arrayOnly },
  keywords: { path: 'filters.keywords', convert: arrayOnly },
  property_list: { path: 'property_list' },

  // audience_primary is handled outside the table too, with audience_exclusions:
  // the two share one array and the composition is written once, below.

  // audience_exclusions is NOT in this table. It shares `filters.signal_targeting`
  // with audience_primary — AdCP expresses a suppression audience as an entry in
  // the same array carrying `targeting_mode: 'exclude'` — and two rules writing
  // one dotted path means the second setPath overwrites the first. That silently
  // turned an exclusion into a target: the request asked to buy the audience the
  // buyer had suppressed, with both keys reported as carried. It is composed
  // into the array below instead.

  min_exposures: { path: 'filters.min_exposures' },
  required_metrics: { path: 'filters.required_metrics', convert: arrayOnly },
  required_performance_standards: {
    path: 'filters.required_performance_standards',
    convert: (v) => {
      const list = (v as Array<Record<string, unknown>>) ?? []
      const complete = list.filter((e) => e.vendor !== undefined && e.threshold !== undefined)
      if (complete.length === 0) {
        return {
          drop:
            'core/performance-standard.json requires metric + threshold + vendor. No entry in this brief names a ' +
            'measuring vendor, and the engine will not pick one for you.',
        }
      }
      return { value: complete }
    },
  },
  required_vendor_metrics: { path: 'filters.required_vendor_metrics', convert: arrayOnly },
  required_features: { path: 'filters.required_features' },
  trusted_match: { path: 'filters.trusted_match' },
  required_axe_integrations: { path: 'filters.required_axe_integrations', convert: arrayOnly },
  filters_ext: { path: 'filters.ext' },
}

/**
 * Build the AdCP `get_products` request.
 *
 * `buying_mode` is the only unconditionally required property of the schema and
 * comes from the run options, not from the prose: it declares what kind of call
 * this is, not what the campaign is. It is recorded as such.
 */
export function toAdcpGetProducts(
  analysis: EmitSource | BriefAnalysis,
  opts: EmitOptions = {},
): EmitResult<AdcpGetProductsRequest> {
  const { input, fields, options } = source(analysis)
  const accept = new Set(opts.acceptAssumed ?? [])
  const payload: Record<string, unknown> = {}
  const omitted: Omission[] = []
  const carried: string[] = []
  const notes: string[] = []

  payload.buying_mode = options.buyingMode
  carried.push('buying_mode')

  // Rule 3: the residue stays. `brief` is the input verbatim.
  const wantsBrief = options.buyingMode === 'brief' && options.includeResidualBrief
  if (wantsBrief && input.length > 0) {
    payload.brief = input
    carried.push('brief_prose')
    notes.push(
      'brief carries the input verbatim, not a reconstruction from the extracted fields. The prose that ' +
        'mapped to no structured field is reported in BriefAnalysis.residual and is deliberately still in the string.',
    )
  } else if (options.buyingMode === 'brief') {
    omitted.push({
      field: 'brief_prose',
      label: fields.brief_prose?.label ?? 'missing',
      reason:
        input.length === 0
          ? 'The input is empty, and get-products-request.json requires brief when buying_mode is "brief".'
          : 'The caller set includeResidualBrief: false, and get-products-request.json requires brief when buying_mode is "brief".',
    })
  } else {
    omitted.push({
      field: 'brief_prose',
      label: fields.brief_prose?.label ?? 'missing',
      reason: `get-products-request.json forbids brief when buying_mode is "${options.buyingMode}". Everything the prose said that no filter carries is lost on this call.`,
    })
  }

  // budget_range is one object built from three keys, and the schema requires
  // `currency` on it. A budget with no currency is not a budget the protocol
  // can hold, and the engine will not default it to USD.
  const budgetMax = readable(fields, 'budget_total', accept)
  const budgetMin = readable(fields, 'budget_min', accept)
  const currency = readable(fields, 'currency', accept)
  const hasAmount = budgetMax.ok || budgetMin.ok
  if (hasAmount && currency.ok) {
    const range: Record<string, unknown> = { currency: currency.value }
    if (budgetMin.ok) range.min = budgetMin.value
    if (budgetMax.ok) range.max = budgetMax.value
    setPath(payload, 'filters.budget_range', range)
    // The figure is the buyer's; calling it a ceiling is the engine's. When the
    // brief stated one amount and no bound, `budget_range.max` and AAMP
    // `total_budget` say two different commercial things about it and the brief
    // said neither, so the placement is reported as a placement.
    if (budgetMax.ok && fields.budget_total?.note === UNBOUNDED_BUDGET_NOTE) {
      notes.push(
        `filters.budget_range.max = ${JSON.stringify(budgetMax.value)} is where the engine PUT a figure the brief stated ` +
          'without a bound. The number is yours; reading it as a ceiling is not. AdCP requires min or max on ' +
          'budget_range and has no "target" form, so a seller receiving this request reads it as a spend ceiling. ' +
          'Say "up to" or "at least" if that is wrong.',
      )
    }
    if (budgetMax.ok) carried.push('budget_total')
    if (budgetMin.ok) carried.push('budget_min')
    carried.push('currency')
  } else {
    const why = !hasAmount
      ? 'No budget amount is stated.'
      : 'filters.budget_range requires an ISO 4217 currency and this brief states none; the engine will not assume USD.'
    for (const [key, r] of [
      ['budget_total', budgetMax],
      ['budget_min', budgetMin],
      ['currency', currency],
    ] as const) {
      omitted.push({ field: key, label: r.label, reason: r.ok ? why : r.reason })
    }
  }

  // filters.signal_targeting is ONE array fed by TWO keys. Include entries come
  // from audience_primary; suppression entries come from audience_exclusions and
  // carry `targeting_mode: 'exclude'` (core/product-filters.json: "may include
  // targeting_mode='include' or 'exclude'"). They are composed here, in one
  // place, because two table rules pointing at one path is an overwrite, and an
  // overwrite here inverts the buyer's intent.
  const primary = readable(fields, 'audience_primary', accept)
  const exclusions = readable(fields, 'audience_exclusions', accept)
  const signalTargeting: unknown[] = []

  if (primary.ok) {
    const plan = primary.value as { adcpSignalTargeting?: unknown } | null
    const st = plan?.adcpSignalTargeting
    if (isNonEmptyArray(st)) {
      signalTargeting.push(...st)
      carried.push('audience_primary')
    } else {
      omitted.push({
        field: 'audience_primary',
        label: primary.label,
        reason:
          'AdCP filters.signal_targeting takes SignalRefs resolved against a signals agent. A demographic ' +
          'phrase is not a SignalRef, and this engine makes no network call to turn one into one.',
      })
    }
  } else {
    omitted.push({ field: 'audience_primary', label: primary.label, reason: primary.reason })
  }

  if (exclusions.ok) {
    const raw = Array.isArray(exclusions.value) ? (exclusions.value as unknown[]) : []
    // An exclusion joins an array whose default mode is `include`. If an entry
    // is not a resolvable signal reference it cannot be stamped as a suppression
    // and must not join the array at all: an unstamped entry reads as a target,
    // which is the opposite of what the buyer said.
    const refs = raw.filter(isSignalRefShaped)
    if (refs.length > 0 && refs.length === raw.length) {
      signalTargeting.push(...refs.map((e) => ({ ...e, targeting_mode: 'exclude' })))
      carried.push('audience_exclusions')
    } else {
      omitted.push({
        field: 'audience_exclusions',
        label: exclusions.label,
        reason:
          'AdCP carries a suppression audience as an entry in filters.signal_targeting with ' +
          "targeting_mode: 'exclude', so every excluded audience must be a SignalRef (scope + signal_id, " +
          'or the deprecated signal_id) resolved against a signals agent. ' +
          `${raw.length - refs.length} of ${raw.length} entries here are not, and an entry that cannot be ` +
          'stamped as an exclusion would be read as a target — the buy would chase the audience you suppressed.',
      })
    }
  } else {
    omitted.push({
      field: 'audience_exclusions',
      label: exclusions.label,
      reason: exclusions.reason,
    })
  }

  if (signalTargeting.length > 0) setPath(payload, 'filters.signal_targeting', signalTargeting)

  const handled = new Set([
    'buying_mode',
    'brief_prose',
    'budget_total',
    'budget_min',
    'currency',
    'audience_primary',
    'audience_exclusions',
  ])

  for (const def of FIELDS) {
    if (handled.has(def.key)) continue
    const rule = ADCP_RULES[def.key]
    const r = readable(fields, def.key, accept)

    if (!rule) {
      // AdCP has no field for this concept at all. The blank cell is the finding.
      if (r.ok) {
        omitted.push({
          field: def.key,
          label: r.label,
          reason:
            `AdCP get_products has no field for ${def.label.toLowerCase()}. ` +
            (def.note ?? 'This value travels on the AAMP side only.'),
        })
      }
      continue
    }

    if (!r.ok) {
      omitted.push({ field: def.key, label: r.label, reason: r.reason })
      continue
    }

    const converted = (rule.convert ?? passthrough)(r.value)
    if ('drop' in converted) {
      omitted.push({ field: def.key, label: r.label, reason: converted.drop })
      continue
    }
    setPath(payload, rule.path, converted.value)
    carried.push(def.key)
  }

  return { payload, omitted, carried, notes }
}

/* ==================================================================== *
 * AAMP CampaignBrief
 * ==================================================================== */

/** Field key -> top-level CampaignBrief property, for the one-to-one cases. */
const AAMP_SIMPLE: Record<string, string> = {
  advertiser_id: 'advertiser_id',
  agency_id: 'agency_id',
  campaign_name: 'campaign_name',
  objective: 'objective',
  internal_notes: 'notes',
  budget_total: 'total_budget',
  currency: 'currency',
  start_date: 'flight_start',
  end_date: 'flight_end',
  kpi_targets: 'kpis',
  frequency_cap: 'frequency_cap',
  pacing_model: 'pacing_model',
  preferred_sellers: 'preferred_sellers',
  excluded_sellers: 'excluded_sellers',
  creative_ids: 'creative_ids',
  excluded_domains: 'exclusion_list',
  audience_strictness: 'audience_strictness',
  deal_types: 'deal_preferences.preferred_deal_types',
  deal_max_cpm: 'deal_preferences.max_cpm',
  deal_min_impressions: 'deal_preferences.min_impressions',
  approval_plan_review: 'approval_config.plan_review',
  approval_booking: 'approval_config.booking',
  approval_creative: 'approval_config.creative',
  approval_pacing_adjustment: 'approval_config.pacing_adjustment',
  excluded_content_categories: 'brand_safety.excluded_categories',
  excluded_keywords: 'brand_safety.excluded_keywords',
}

/**
 * One engine geo value -> zero or more AAMP `GeoTarget`s.
 *
 * `GeoTarget` is `{geo_type, geo_value}` and nothing else: no coding system, no
 * country. So the conversion has to refuse more often than a table lookup
 * would, and each refusal names what could not be said.
 *
 * `metros` is the case that matters. The engine's metro value is
 * `{system, code}` across four coding systems — `nielsen_dma`,
 * `eurostat_nuts2`, `uk_itl1`, `uk_itl2` — and only one of them is a DMA.
 * Stamping `geo_type: 'DMA'` on a Eurostat NUTS 2 code relabels a European
 * statistical region as a Nielsen market, which is the same invention as the
 * name-to-DMA-code table this engine refuses to ship.
 */
type GeoConvert = (value: unknown) => { targets: string[]; dropped: string[] }

const GEO_RULES: Record<string, { type: string; convert: GeoConvert }> = {
  countries: {
    type: 'COUNTRY',
    convert: (v) =>
      typeof v === 'string' ? { targets: [v], dropped: [] } : { targets: [], dropped: [] },
  },
  regions: {
    type: 'STATE',
    convert: (v) =>
      typeof v === 'string' ? { targets: [v], dropped: [] } : { targets: [], dropped: [] },
  },
  metros: {
    type: 'DMA',
    convert: (v) => {
      const m = v as { system?: unknown; code?: unknown } | null
      if (!m || typeof m.code !== 'string') return { targets: [], dropped: [] }
      if (m.system === 'nielsen_dma') return { targets: [m.code], dropped: [] }
      return { targets: [], dropped: [`${String(m.system)} ${m.code}`] }
    },
  },
  postal_areas: {
    type: 'ZIP',
    convert: (v) => {
      const a = v as { country?: unknown; system?: unknown; values?: unknown } | null
      const values = Array.isArray(a?.values) ? (a!.values as unknown[]).map(String) : []
      if (values.length === 0) return { targets: [], dropped: [] }
      // 'ZIP' is the United States Postal Service system. A UK outward code is
      // not a ZIP, and GeoTarget has nowhere to put the country, so sending one
      // as ZIP asks a seller to match US postal codes against British ones.
      if (a?.country === 'US') return { targets: values, dropped: [] }
      return {
        targets: [],
        dropped: [`${String(a?.country)} ${String(a?.system)}: ${values.join(', ')}`],
      }
    },
  },
}

/**
 * Build the AAMP `CampaignBrief` per campaign_brief.py.
 *
 * Two places where the honest answer is to emit less than the model wants:
 *
 *  - `channels[].budget_pct` is required by `ChannelAllocation` and must sum to
 *    100. When the brief states no split, the allocation is emitted WITHOUT
 *    `budget_pct` and the omission says so. The model will refuse to construct.
 *    That refusal is correct and is the score's job to report — inventing
 *    60/25/15 to make the model construct is the exact defect this package was
 *    built against.
 *
 *  - `target_audience` is an `AudiencePlan` whose `primary` is a required
 *    `AudienceRef` (type + identifier + taxonomy + version + source). No
 *    taxonomy identifier is derivable from a demographic phrase, so the plan is
 *    omitted rather than half-built.
 */
export function toAampCampaignBrief(
  analysis: EmitSource | BriefAnalysis,
  opts: EmitOptions = {},
): EmitResult<AampCampaignBrief> {
  const { input, fields, options } = source(analysis)
  const accept = new Set(opts.acceptAssumed ?? [])
  const payload: Record<string, unknown> = {}
  const omitted: Omission[] = []
  const carried: string[] = []
  const notes: string[] = []
  const handled = new Set<string>()

  // description carries the prose, same residue rule as the AdCP `brief`.
  if (options.includeResidualBrief && input.length > 0) {
    payload.description = input
    carried.push('brief_prose')
  } else {
    omitted.push({
      field: 'brief_prose',
      label: fields.brief_prose?.label ?? 'missing',
      reason:
        input.length === 0
          ? 'The input is empty.'
          : 'The caller suppressed the residual prose, so CampaignBrief.description is not set.',
    })
  }
  handled.add('brief_prose')
  handled.add('buying_mode')

  /* ---- channels: the composite the model's validators care about ---- */
  handled.add('channels')
  handled.add('channel_budget_split')
  handled.add('format_ids')

  const channelsR = readable(fields, 'channels', accept)
  const splitR = readable(fields, 'channel_budget_split', accept)
  const formatsR = readable(fields, 'format_ids', accept)

  if (channelsR.ok) {
    const list = channelsR.value as Array<{
      adcp: string | null
      aamp: string | null
      surface: string
    }>
    const withAamp = list.filter((c) => c.aamp !== null)
    const droppedSurfaces = list.filter((c) => c.aamp === null).map((c) => c.surface)

    const splits = splitR.ok
      ? (splitR.value as Array<{
          channel: { adcp: string | null; aamp: string | null; surface: string }
          budget_pct: number
        }>)
      : []

    const allocations: Array<Record<string, unknown>> = []
    const collapsed: Record<string, string[]> = {}
    for (const c of withAamp) {
      const type = c.aamp as string
      const existing = allocations.find((a) => a.channel === type)
      if (existing) {
        ;(collapsed[type] ??= []).push(c.surface)
        continue
      }
      const alloc: Record<string, unknown> = { channel: type }
      const match = splits.find(
        (s) =>
          s.channel.surface.toLowerCase() === c.surface.toLowerCase() ||
          (s.channel.aamp !== null && s.channel.aamp === c.aamp),
      )
      if (match) alloc.budget_pct = match.budget_pct
      allocations.push(alloc)
    }

    if (allocations.length > 0) {
      payload.channels = allocations
      carried.push('channels')
    } else {
      omitted.push({
        field: 'channels',
        label: channelsR.label,
        reason: `None of the channels named (${list.map((c) => c.surface).join(', ')}) has an AAMP ChannelType; AAMP's enum has six values against AdCP's twenty.`,
      })
    }

    for (const [type, surfaces] of Object.entries(collapsed)) {
      notes.push(
        `AAMP ChannelType has one value for ${surfaces.concat(type).join(' and ')}: ${type}. ` +
          'The allocations were merged because campaign_brief.py rejects duplicate channel types; ' +
          'the distinction the brief drew is not expressible on this side.',
      )
    }
    if (droppedSurfaces.length > 0) {
      omitted.push({
        field: 'channels',
        label: channelsR.label,
        reason: `${droppedSurfaces.join(', ')} has no AAMP ChannelType (the enum is CTV, DISPLAY, AUDIO, NATIVE, DOOH, LINEAR_TV), so it is absent from the AAMP brief while present in the AdCP request.`,
      })
    }

    const withPct = (payload.channels as Array<Record<string, unknown>> | undefined) ?? []
    if (splitR.ok && withPct.some((a) => a.budget_pct !== undefined)) {
      carried.push('channel_budget_split')
    } else if (withPct.length > 0) {
      omitted.push({
        field: 'channel_budget_split',
        label: splitR.label,
        reason:
          'ChannelAllocation requires budget_pct and the percentages must sum to 100. This brief states no split, ' +
          'so the allocations are emitted without it and the model will refuse to construct. The engine does not ' +
          'invent a split to make the model happy.',
      })
    }

    // format_prefs live per channel. Attaching them requires knowing which
    // channel each format is for, which the brief does not say unless there is
    // exactly one channel — then there is nothing to guess.
    if (formatsR.ok) {
      const formats = formatsR.value as Array<{ aampFormatPref: string; surface: string }>
      const prefs = formats.map((f) => f.aampFormatPref)
      if (withPct.length === 1 && prefs.length > 0) {
        withPct[0]!.format_prefs = prefs
        carried.push('format_ids')
        notes.push(
          `format_prefs ${JSON.stringify(prefs)} were attached to the only channel in the brief (${String(withPct[0]!.channel)}). ` +
            'With one channel there is one destination and nothing to guess.',
        )
      } else if (prefs.length > 0) {
        omitted.push({
          field: 'format_ids',
          label: formatsR.label,
          reason: `AAMP carries formats per channel (channels[].format_prefs). This brief names ${prefs.length} format(s) and ${withPct.length} channels, and never says which format belongs to which channel; distributing them would be invention.`,
        })
      }
    } else {
      omitted.push({ field: 'format_ids', label: formatsR.label, reason: formatsR.reason })
    }
  } else {
    omitted.push({ field: 'channels', label: channelsR.label, reason: channelsR.reason })
    omitted.push({
      field: 'channel_budget_split',
      label: splitR.label,
      reason: splitR.ok
        ? 'A budget split is stated but no channel is, so there is nothing to allocate against.'
        : splitR.reason,
    })
    omitted.push({
      field: 'format_ids',
      label: formatsR.label,
      reason: formatsR.ok
        ? 'AAMP carries formats per channel and this brief names no channel.'
        : formatsR.reason,
    })
  }

  /* ---- target_geo: four engine keys, one list ---- */
  const geoTargets: Array<Record<string, unknown>> = []
  for (const key of ['countries', 'regions', 'metros', 'postal_areas']) {
    handled.add(key)
    const r = readable(fields, key, accept)
    if (!r.ok) {
      omitted.push({ field: key, label: r.label, reason: r.reason })
      continue
    }
    const values = r.value as unknown[]
    if (!isNonEmptyArray(values)) {
      omitted.push({ field: key, label: r.label, reason: 'The list is empty.' })
      continue
    }
    const rule = GEO_RULES[key]!
    let emittedHere = 0
    const dropped: string[] = []
    for (const item of values) {
      const out = rule.convert(item)
      dropped.push(...out.dropped)
      for (const geoValue of out.targets) {
        if (geoValue.length === 0) continue
        geoTargets.push({ geo_type: rule.type, geo_value: geoValue })
        emittedHere += 1
      }
    }
    // Rule 2: nothing is dropped silently — including by this loop. Reporting
    // the key as `carried` while every item fell through it is the same lie in
    // the other direction: the score and the UI say the targeting travelled
    // and the payload has no entry for it.
    if (emittedHere > 0) carried.push(key)
    if (dropped.length > 0 || emittedHere === 0) {
      omitted.push({
        field: key,
        label: r.label,
        reason:
          key === 'metros'
            ? `AAMP GeoTarget carries {geo_type, geo_value} and no coding system, and its GeoType enum has one metro value, DMA. ${dropped.join('; ') || 'These values'} ${dropped.length === 1 ? 'is' : 'are'} not Nielsen DMA code${dropped.length === 1 ? '' : 's'}, and writing ${dropped.length === 1 ? 'it' : 'them'} as DMA would relabel one coding system as another. ${emittedHere > 0 ? 'The Nielsen DMA codes in this brief were emitted; these were not.' : 'Nothing was emitted for this key.'}`
            : key === 'postal_areas'
              ? `AAMP GeoType 'ZIP' names the United States Postal Service system and GeoTarget has no country field, so a non-US postal code cannot be told apart from a US one. ${dropped.join('; ') || 'No postal value'} could not be carried. ${emittedHere > 0 ? 'The US ZIP codes were emitted.' : ''}`
              : `No value under ${key} could be turned into a GeoTarget (geo_type + geo_value).`,
      })
    }
  }
  if (geoTargets.length > 0) payload.target_geo = geoTargets

  /* ---- target_audience ---- */
  handled.add('audience_primary')
  const audienceR = readable(fields, 'audience_primary', accept)
  if (audienceR.ok) {
    const plan = (
      audienceR.value as { aampAudiencePlan?: { primary: unknown; rationale?: string } }
    ).aampAudiencePlan
    if (plan && plan.primary != null) {
      payload.target_audience = plan
      carried.push('audience_primary')
    } else {
      omitted.push({
        field: 'audience_primary',
        label: audienceR.label,
        reason:
          'AudiencePlan.primary is a required AudienceRef carrying type + identifier + taxonomy + version + source. ' +
          `The brief says "${plan?.rationale ?? 'a demographic'}", which resolves to no IAB Audience Taxonomy 1.1 identifier. ` +
          'The plan is omitted rather than half-built, so nothing downstream mistakes a phrase for a segment.',
      })
    }
  } else {
    omitted.push({ field: 'audience_primary', label: audienceR.label, reason: audienceR.reason })
  }
  for (const key of ['audience_constraints', 'audience_extensions', 'audience_exclusions']) {
    handled.add(key)
    const r = readable(fields, key, accept)
    if (!r.ok) {
      omitted.push({ field: key, label: r.label, reason: r.reason })
      continue
    }
    // These are roles inside an AudiencePlan. Writing one without `primary` would
    // build the half-plan the previous block just refused to build.
    if (payload.target_audience === undefined) {
      omitted.push({
        field: key,
        label: r.label,
        reason:
          'This is a role inside AudiencePlan, and the plan has no `primary` to hang it on. ' +
          'Emitting the role alone would produce a plan the model rejects and a downstream reader half-trusts.',
      })
      continue
    }
    setPath(payload, `target_audience.${key.replace('audience_', '')}`, r.value)
    carried.push(key)
  }

  /* ---- everything one-to-one ---- */
  for (const def of FIELDS) {
    if (handled.has(def.key)) continue
    const path = AAMP_SIMPLE[def.key]
    const r = readable(fields, def.key, accept)

    if (path === undefined) {
      if (r.ok) {
        omitted.push({
          field: def.key,
          label: r.label,
          reason:
            `AAMP CampaignBrief has no field for ${def.label.toLowerCase()}. ` +
            (def.note ?? 'This value travels on the AdCP side only.'),
        })
      }
      continue
    }
    if (!r.ok) {
      omitted.push({ field: def.key, label: r.label, reason: r.reason })
      continue
    }
    setPath(payload, path, r.value)
    carried.push(def.key)
  }

  return { payload, omitted, carried, notes }
}
