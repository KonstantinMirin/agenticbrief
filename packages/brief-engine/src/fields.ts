/**
 * The canonical field map: one entry per concept a campaign brief can carry,
 * with where that concept lives in each protocol — or a null where it does not
 * live there at all.
 *
 * Read from source, not from memory:
 *   AdCP  3.1.13 (dist/schemas/latest.json -> latest_stable: "3.1.13")
 *         media-buy/get-products-request.json
 *         core/product-filters.json          — 30 properties in 3.1.13
 *         enums/*.json
 *   AAMP  /srv/ws/iab/buyer-agent/src/ad_buyer/models/campaign_brief.py
 *         class CampaignBrief + AudiencePlan / AudienceRef from audience_plan.py
 *
 * Two findings encoded in the data below, both material and both counter to
 * the numbers in circulation:
 *
 *  1. `core/product-filters.json` at 3.1.13 has **30** properties, not 31.
 *     (It had 22 through 3.0.18 and reached 30 at 3.1.0.) The commonly quoted
 *     "31 filter fields" enumerates 30 names; the count is off by one. The
 *     `expressive` score's denominator is ADCP_FILTER_FIELD_COUNT = 30.
 *
 *  2. AAMP's CampaignBrief is documented with **nine** required fields, but the
 *     pydantic model as written requires **eight** top-level fields:
 *     `target_audience` is declared `AudiencePlan | None = Field(default=None)`,
 *     so the model constructs without it. The ninth required *value* is
 *     `channels[].budget_pct`, which is required inside every ChannelAllocation
 *     and must sum to 100 — see `channel_budget_split` below.
 *
 * DIVERGENCE, recorded per the brief: the same repository carries a SECOND,
 * incompatible `CampaignBrief` in `models/flow_state.py` —
 *   name / objectives: list[str] / budget / start_date / end_date /
 *   target_audience: dict / kpis: dict / channels: list[str] / constraints: dict
 * against campaign_brief.py's
 *   campaign_name / objective: enum / total_budget + currency / flight_start /
 *   flight_end / target_audience: AudiencePlan / kpis: list[KPI] /
 *   channels: list[ChannelAllocation].
 * There is no adapter between them. Two brief shapes, one repo. This map
 * targets `campaign_brief.py` — the typed, validated one — throughout; nothing
 * here binds to flow_state.py.
 *
 * Rules for editing this file:
 *  - Where a concept exists in one protocol and not the other, the other side
 *    is `null`. The blank cell IS the finding. Do not invent a mapping.
 *  - Where a mapping is real but lossy, map it and say so in `note`. The
 *    extractor will label the converted value `derived`, never `stated`.
 *  - `consequence` is one sentence about what happens if the field is missing.
 *    It is user-facing copy; write it for a buyer, not for a validator.
 */

import type { FieldDef } from './types.ts'

/** The AdCP release this map was read from. Pinned; bump deliberately. */
export const ADCP_SCHEMA_VERSION = '3.1.13'

/** Where the schemas were read from (repo-external; also the parse-adcp.mjs default). */
export const ADCP_SCHEMA_ROOT = '/srv/ws/agenticbrief/adcp-current/dist/schemas/3.1.13'

/** The AAMP model this map targets. */
export const AAMP_SOURCE = '/srv/ws/iab/buyer-agent/src/ad_buyer/models/campaign_brief.py'

/** The other, incompatible CampaignBrief in the same repo. Not targeted. */
export const AAMP_DIVERGENT_SOURCE = '/srv/ws/iab/buyer-agent/src/ad_buyer/models/flow_state.py'

/**
 * Number of distinct properties on `core/product-filters.json` at 3.1.13.
 * Denominator of the `expressive` score. Verified by test against the schema.
 */
export const ADCP_FILTER_FIELD_COUNT = 30

/** Bumped when the shape or membership of FIELDS changes. */
export const FIELD_MAP_VERSION = '1'

/**
 * The `note` a single, unbounded budget figure carries.
 *
 * `$500,000` states a number and does not state what the number bounds. The
 * figure is `stated` — it is in the input, with a span — but the two places it
 * can go mean different things: AdCP `filters.budget_range.max` is a ceiling
 * and AAMP `total_budget` is committed money, and the brief chose neither. Both
 * the extractor that writes the note and the emitter that acts on it read this
 * constant, so the receipt shown next to the payload and the receipt shown next
 * to the field cannot drift apart.
 */
export const UNBOUNDED_BUDGET_NOTE =
  'One figure, no bound stated. Recorded as the total budget; whether it is a ceiling, a target or a floor is not in the input.'

/* ==================================================================== *
 * The map
 * ==================================================================== */

export const FIELDS: readonly FieldDef[] = [
  /* ---------------- identity ---------------- */
  {
    key: 'advertiser_id',
    label: 'Advertiser identifier',
    group: 'identity',
    aliases: ['advertiser', 'advertiser id', 'client', 'account id', 'advertiser code'],
    adcp: null,
    aamp: { path: 'advertiser_id', required: true, kind: 'str' },
    enumSource: null,
    consequence:
      'The AAMP brief will not construct, so nothing downstream of the buyer agent runs.',
    note: 'AdCP identifies the buyer by brand domain (`brand.domain`), not by an opaque advertiser ID; no field in `get_products` carries this value.',
  },
  {
    key: 'brand_domain',
    label: 'Brand domain',
    group: 'identity',
    aliases: ['brand', 'brand domain', 'website', 'advertiser website', 'company site'],
    adcp: { path: 'brand.domain', kind: 'string' },
    aamp: null,
    enumSource: 'core/brand-ref.json',
    consequence:
      'The seller cannot resolve brand identity at execution time, so category exclusivity and competitive separation cannot be applied to your buy.',
    note: 'The only required key of `brand-ref`. AAMP carries `advertiser_id` instead — an opaque identifier with no domain form; the two do not convert.',
  },
  {
    key: 'brand_industries',
    label: 'Advertiser industry',
    group: 'identity',
    aliases: ['industry', 'vertical', 'category', 'sector'],
    adcp: { path: 'brand.industries', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/advertiser-industry.json',
    consequence:
      'Publishers holding category-exclusive inventory cannot tell whether your buy conflicts with a competitor already on the property.',
    note: 'No AAMP equivalent; AAMP has no advertiser-category vocabulary anywhere in the brief.',
  },
  {
    key: 'agency_id',
    label: 'Agency identifier',
    group: 'identity',
    aliases: ['agency', 'agency id', 'buying agency', 'media agency'],
    adcp: null,
    aamp: { path: 'agency_id', required: false, kind: 'str' },
    enumSource: null,
    consequence: 'Billing and seat attribution fall to whatever the buying platform infers.',
    note: 'AdCP models the agency relationship out of band (agent identity and auth), not in the discovery request.',
  },
  {
    key: 'campaign_name',
    label: 'Campaign name',
    group: 'identity',
    aliases: ['campaign', 'campaign name', 'project name', 'initiative'],
    adcp: null,
    aamp: { path: 'campaign_name', required: true, kind: 'str' },
    enumSource: null,
    consequence:
      'The AAMP brief will not construct, and on the AdCP side the campaign has no human-readable handle in any artefact the seller sees.',
    note: '`get_products` has no campaign-name field: discovery is stateless, and naming happens later at `create_media_buy`.',
  },
  {
    key: 'buying_mode',
    label: 'Buying mode',
    group: 'identity',
    aliases: ['buying mode', 'discovery mode', 'curated', 'wholesale', 'refine'],
    adcp: { path: 'buying_mode', kind: 'enum', required: true },
    aamp: null,
    enumSource: 'media-buy/get-products-request.json',
    consequence:
      "AdCP 3.x rejects the request outright; pre-v3 sellers fall back to 'brief', which is not always what you meant.",
    note: "Values: 'brief' (publisher curates), 'wholesale' (raw feed, and `brief` MUST NOT be sent), 'refine' (iterate on a prior response). The only unconditionally required property of the request. AAMP has no equivalent because its brief is not a discovery call.",
  },
  {
    key: 'brief_prose',
    label: 'Campaign description (residual prose)',
    group: 'identity',
    aliases: ['brief', 'description', 'summary', 'objective statement', 'background'],
    adcp: { path: 'brief', kind: 'string' },
    aamp: { path: 'description', required: false, kind: 'str' },
    enumSource: null,
    consequence:
      'In `brief` mode AdCP rejects the request; anything you said that no structured filter can hold is simply lost.',
    note: 'Required when `buying_mode` is "brief" (conditional, so not in the schema\'s `required` array) and forbidden when it is "wholesale" or "refine". It is also the only field AdCP never validates — `{"type": "string"}` is the entire contract — and `create_media_buy` does not carry it forward.',
  },
  {
    key: 'internal_notes',
    label: 'Internal notes',
    group: 'identity',
    aliases: ['notes', 'internal notes', 'caveats', 'context for the team'],
    adcp: null,
    aamp: { path: 'notes', required: false, kind: 'str' },
    enumSource: null,
    consequence: 'Internal caveats stay in email instead of travelling with the brief.',
    note: 'No AdCP equivalent, which is arguably correct: this is buyer-internal and should not reach a seller.',
  },
  {
    key: 'objective',
    label: 'Campaign objective',
    group: 'identity',
    aliases: ['objective', 'goal', 'awareness', 'consideration', 'conversion', 'reach'],
    adcp: null,
    aamp: { path: 'objective', required: true, kind: 'enum' },
    enumSource: 'aamp:campaign_brief.CampaignObjective',
    consequence:
      'The AAMP brief will not construct, and no downstream allocation logic knows whether to optimise for reach or for conversion.',
    note: 'AWARENESS | CONSIDERATION | CONVERSION | REACH, case-insensitive. AdCP has no objective field at all: `get_products` discovers inventory, not intent, so the objective survives only as prose inside `brief`.',
  },

  /* ---------------- timing ---------------- */
  {
    key: 'start_date',
    label: 'Flight start date',
    group: 'timing',
    aliases: ['start', 'start date', 'flight start', 'live date', 'in market from', 'launch'],
    adcp: { path: 'filters.start_date', kind: 'iso8601-date' },
    aamp: { path: 'flight_start', required: true, kind: 'date' },
    enumSource: 'iso8601',
    consequence:
      'AAMP rejects the brief, and the AdCP seller checks availability against its own default window, so forecasts and holds may be for the wrong dates.',
    note: 'Same value, different meaning: AdCP treats it as an availability filter for discovery, AAMP as the committed flight.',
  },
  {
    key: 'end_date',
    label: 'Flight end date',
    group: 'timing',
    aliases: ['end', 'end date', 'flight end', 'finish', 'in market until', 'through'],
    adcp: { path: 'filters.end_date', kind: 'iso8601-date' },
    aamp: { path: 'flight_end', required: true, kind: 'date' },
    enumSource: 'iso8601',
    consequence:
      'AAMP rejects the brief (`flight_end` must be strictly after `flight_start`) and the seller cannot forecast or hold inventory for your window.',
    note: 'AAMP enforces `flight_end > flight_start` as a cross-field validator; AdCP validates neither the order nor the presence of either date.',
  },

  /* ---------------- budget ---------------- */
  {
    key: 'budget_total',
    label: 'Total budget',
    group: 'budget',
    aliases: ['budget', 'total budget', 'spend', 'investment', 'working media'],
    adcp: { path: 'filters.budget_range.max', kind: 'money' },
    aamp: { path: 'total_budget', required: true, kind: 'float' },
    enumSource: null,
    consequence:
      'AAMP rejects the brief, and AdCP sellers return products at every price point including ones you cannot afford.',
    note: 'Lossy in both directions. AdCP `budget_range` is a product-selection filter ("show me products that suit this spend"); AAMP `total_budget` is committed money with a `> 0` constraint. Writing total budget into `budget_range.max` is a derivation, and the engine labels it as one.',
  },
  {
    key: 'budget_min',
    label: 'Minimum budget threshold',
    group: 'budget',
    aliases: ['minimum budget', 'budget floor', 'at least', 'minimum spend'],
    adcp: { path: 'filters.budget_range.min', kind: 'money' },
    aamp: null,
    enumSource: null,
    consequence:
      'Sellers may return low-minimum products that cannot absorb your spend, so the plan fragments across too many line items.',
    note: 'AAMP has no minimum-spend concept; `deal_preferences.min_impressions` is a volume floor, not a spend floor.',
  },
  {
    key: 'currency',
    label: 'Budget currency',
    group: 'budget',
    aliases: ['currency', 'usd', 'eur', 'gbp', 'denominated in'],
    adcp: { path: 'filters.budget_range.currency', kind: 'iso4217' },
    aamp: { path: 'currency', required: true, kind: 'str' },
    enumSource: 'iso4217',
    consequence:
      'AAMP rejects the brief, and AdCP rejects `budget_range` entirely — `currency` is its only required key.',
    note: 'Both sides enforce the ISO 4217 `^[A-Z]{3}$` pattern; neither checks that the code is a real currency.',
  },
  {
    key: 'pricing_currencies',
    label: 'Transactable currencies',
    group: 'budget',
    aliases: ['pricing currency', 'currencies', 'settle in', 'can transact in'],
    adcp: { path: 'filters.pricing_currencies', kind: 'iso4217[]' },
    aamp: null,
    enumSource: 'iso4217',
    consequence:
      'Sellers may return products priced only in currencies you cannot settle in, and mandatory signal charges may turn out to be unsatisfiable at buy time.',
    note: "Derivable from `currency` but not the same thing — one is the budget's denomination, the other the set the buyer can transact in. AAMP has a single `currency` and no set.",
  },
  {
    key: 'is_fixed_price',
    label: 'Fixed price or auction',
    group: 'budget',
    aliases: ['fixed price', 'rate card', 'auction', 'biddable', 'guaranteed rate'],
    adcp: { path: 'filters.is_fixed_price', kind: 'boolean' },
    aamp: null,
    enumSource: null,
    consequence:
      'Fixed-rate and auction products come back mixed, and the returned `pricing_options` are not pruned to the kind you intended to buy.',
    note: 'AAMP expresses an adjacent idea as `deal_preferences.preferred_deal_types` (PG/PD/PA), which is deal mechanics rather than a pricing-availability flag.',
  },
  {
    key: 'deal_max_cpm',
    label: 'Maximum CPM',
    group: 'budget',
    aliases: ['max cpm', 'cpm ceiling', 'no more than', 'price cap', 'floor price'],
    adcp: null,
    aamp: { path: 'deal_preferences.max_cpm', required: false, kind: 'DealPreferences' },
    enumSource: null,
    consequence:
      'Nothing in the discovery request stops the seller proposing inventory above your price ceiling; you find out at quote time.',
    note: 'One of the sharpest gaps in the map: AdCP has no unit-price ceiling anywhere in `get_products`. `budget_range` bounds total spend, not CPM.',
  },
  {
    key: 'deal_min_impressions',
    label: 'Minimum impressions per deal',
    group: 'budget',
    aliases: ['minimum impressions', 'min impressions per deal', 'minimum volume'],
    adcp: null,
    aamp: { path: 'deal_preferences.min_impressions', required: false, kind: 'DealPreferences' },
    enumSource: null,
    consequence: 'Deals too small to be worth trafficking get proposed and then rejected by hand.',
    note: 'Deliberately not mapped to `filters.min_exposures`: that is a measurement-validity threshold, this is a commercial floor. The engine keeps them as two fields rather than pretending they are one.',
  },
  {
    key: 'deal_types',
    label: 'Preferred deal types',
    group: 'budget',
    aliases: [
      'deal type',
      'pg',
      'programmatic guaranteed',
      'preferred deal',
      'private auction',
      'pmp',
    ],
    adcp: null,
    aamp: {
      path: 'deal_preferences.preferred_deal_types',
      required: false,
      kind: 'DealPreferences',
      defaultsTo: '[]',
    },
    enumSource: null,
    consequence:
      'The seller proposes whatever deal mechanics suit it — PG, PD or PA — and the buyer negotiates backwards from there.',
    note: 'Free strings in AAMP, documented as "PG, PD, PA" with no enum enforcing it. It overlaps AdCP `filters.delivery_type` and `filters.is_fixed_price` in part, but no single AdCP field carries it.',
  },
  {
    key: 'pacing_model',
    label: 'Pacing model',
    group: 'budget',
    aliases: ['pacing', 'even', 'front loaded', 'back loaded', 'flighting'],
    adcp: null,
    aamp: { path: 'pacing_model', required: false, kind: 'enum', defaultsTo: 'EVEN' },
    enumSource: 'aamp:campaign_brief.PacingModel',
    consequence:
      'AAMP silently applies EVEN pacing, so a launch-weighted campaign delivers flat unless someone notices.',
    note: 'EVEN | FRONT_LOADED | BACK_LOADED | CUSTOM. AdCP has `enums/pacing.json`, but it is a media-buy package field, not a product filter — pacing cannot influence which products come back.',
  },

  /* ---------------- geo ---------------- */
  {
    key: 'countries',
    label: 'Countries',
    group: 'geo',
    aliases: ['country', 'countries', 'market', 'markets', 'us', 'uk', 'national', 'geography'],
    adcp: { path: 'filters.countries', kind: 'iso3166-1' },
    aamp: { path: 'target_geo[] (geo_type=COUNTRY)', required: false, kind: 'list[GeoTarget]' },
    enumSource: 'iso3166-1',
    consequence:
      'The seller returns products for every market it sells, and geo mismatch surfaces after booking rather than during discovery.',
    note: 'AdCP enforces `^[A-Z]{2}$`; AAMP\'s `GeoTarget.geo_value` is any non-empty string, so a round trip through AAMP loses the code system. AAMP\'s `target_geo` defaults to an empty list its own docstring reads as "national", without saying national to what.',
  },
  {
    key: 'regions',
    label: 'Regions, states or provinces',
    group: 'geo',
    aliases: ['state', 'states', 'province', 'region', 'california', 'scotland'],
    adcp: { path: 'filters.regions', kind: 'iso3166-2' },
    aamp: { path: 'target_geo[] (geo_type=STATE)', required: false, kind: 'list[GeoTarget]' },
    enumSource: 'iso3166-2',
    consequence:
      'Region-bound inventory (regional OOH, local TV) cannot be matched, so the seller offers national products you then have to re-cut.',
    note: 'AdCP requires ISO 3166-2 (`US-NY`, `GB-SCT`); AAMP takes a bare string with no country prefix and no code system.',
  },
  {
    key: 'metros',
    label: 'Metros and DMAs',
    group: 'geo',
    aliases: ['dma', 'metro', 'msa', 'nielsen dma', 'local market'],
    adcp: { path: 'filters.metros', kind: 'metro[]' },
    aamp: { path: 'target_geo[] (geo_type=DMA|METRO)', required: false, kind: 'list[GeoTarget]' },
    enumSource: 'enums/metro-system.json',
    consequence:
      'DMA-level inventory cannot be filtered, so you get national products that will not clear a local plan.',
    note: 'AdCP requires `{system, code}` where system is nielsen_dma | uk_itl1 | uk_itl2 | eurostat_nuts2 | custom. AAMP carries a bare string and has two overlapping geo types (DMA and METRO) with no rule for choosing between them.',
  },
  {
    key: 'postal_areas',
    label: 'Postal areas',
    group: 'geo',
    aliases: ['zip', 'zip code', 'postcode', 'postal code', 'catchment'],
    adcp: { path: 'filters.postal_areas', kind: 'postal-area[]' },
    aamp: { path: 'target_geo[] (geo_type=ZIP)', required: false, kind: 'list[GeoTarget]' },
    enumSource: 'core/postal-area.json',
    consequence:
      'Postcode-level inventory (direct mail, DOOH, local activation) is invisible to the request.',
    note: "AdCP prefers the native country + postal-system form and still accepts deprecated country-fused tokens; AAMP's `ZIP` is US-shaped and carries no country.",
  },
  {
    key: 'geo_proximity',
    label: 'Proximity to locations',
    group: 'geo',
    aliases: ['radius', 'near', 'within', 'drive time', 'store locations', 'catchment area'],
    adcp: { path: 'filters.geo_proximity', kind: 'geo-point[]' },
    aamp: null,
    enumSource: 'enums/transport-mode.json',
    consequence:
      'Store-radius and drive-time buys cannot be expressed, so proximity inventory is neither found nor priced.',
    note: 'Each entry uses exactly one method: travel_time + transport_mode, radius, or GeoJSON geometry. AAMP has no equivalent at any granularity — its `GeoType` stops at ZIP.',
  },
  {
    key: 'required_geo_targeting',
    label: 'Required geo-targeting capability',
    group: 'geo',
    aliases: ['geo targeting capability', 'can target by', 'targeting granularity'],
    adcp: { path: 'filters.required_geo_targeting', kind: 'geo-capability[]' },
    aamp: null,
    enumSource: 'enums/geo-level.json',
    consequence:
      'Digital products from sellers that cannot target at your granularity stay in the result set and fail at setup.',
    note: 'A capability filter, not a targeting instruction — it asks "can this seller target metros at all", where `filters.metros` asks "does this product cover metro 501". AAMP has no capability-negotiation surface, so the distinction does not exist there.',
  },

  /* ---------------- inventory ---------------- */
  {
    key: 'channels',
    label: 'Channels',
    group: 'inventory',
    aliases: [
      'channel',
      'channels',
      'ctv',
      'display',
      'audio',
      'dooh',
      'video',
      'social',
      'search',
      'retail media',
    ],
    adcp: { path: 'filters.channels', kind: 'enum[]' },
    aamp: { path: 'channels[].channel', required: true, kind: 'list[ChannelAllocation]' },
    enumSource: 'enums/channels.json',
    consequence:
      'AAMP rejects the brief, and AdCP sellers return every channel they sell for the buyer to re-filter by hand.',
    note: "Vocabulary mismatch, and it is large. AdCP has 20 channel values; AAMP has 6 (CTV, DISPLAY, AUDIO, NATIVE, DOOH, LINEAR_TV). AAMP's AUDIO collapses AdCP's radio / streaming_audio / podcast; AAMP's NATIVE has no AdCP channel at all (native is a format there); and 13 AdCP channels — olv, social, search, ooh, print, cinema, email, gaming, retail_media, influencer, affiliate, product_placement, sponsored_intelligence — have no AAMP value. AAMP also forbids duplicate channel types.",
  },
  {
    key: 'channel_budget_split',
    label: 'Budget split by channel',
    group: 'inventory',
    aliases: ['split', 'allocation', 'mix', 'percentage', 'weighting', '60/25/15'],
    adcp: null,
    aamp: { path: 'channels[].budget_pct', required: true, kind: 'list[ChannelAllocation]' },
    enumSource: null,
    consequence:
      'The AAMP brief will not construct: `budget_pct` is required on every channel allocation, must be `0 < pct <= 100`, and the values must sum to 100.',
    note: "This is the field the market's best brief generator invented (60/25/15) and presented as a requirement. AAMP forces a split to exist, so a brief that never stated one cannot be transacted until a human decides — which is exactly why the engine offers a split and never writes one. AdCP has no allocation concept in `get_products`; budget splits appear later, per package, in `create_media_buy`.",
  },

  /* ---------------- creative ---------------- */
  {
    key: 'format_ids',
    label: 'Ad formats',
    group: 'creative',
    aliases: ['format', 'formats', 'creative sizes', '30s spot', '300x250', 'units'],
    adcp: { path: 'filters.format_ids', kind: 'format-id[]' },
    aamp: { path: 'channels[].format_prefs', required: false, kind: 'list[str]', defaultsTo: '[]' },
    enumSource: 'core/format-id.json',
    consequence:
      'Sellers return products whose creative specs you cannot fill, and the mismatch is discovered when creative is due.',
    note: 'AdCP format IDs are structured (`agent_url` + `id`, optionally width / height / duration_ms) and resolve against a creative agent; AAMP `format_prefs` are free strings scoped to one channel. Conversion loses information in both directions, so the engine labels it `derived`.',
  },
  {
    key: 'standard_formats_only',
    label: 'IAB standard formats only',
    group: 'creative',
    aliases: ['standard formats', 'iab standard', 'no custom units', 'standard sizes'],
    adcp: { path: 'filters.standard_formats_only', kind: 'boolean' },
    aamp: null,
    enumSource: null,
    consequence:
      'Bespoke and publisher-custom units stay in the result set even when you can only ship IAB standard sizes.',
    note: 'No AAMP equivalent; AAMP has no notion of format standardisation.',
  },
  {
    key: 'creative_ids',
    label: 'Existing creative assets',
    group: 'creative',
    aliases: ['creative', 'assets', 'creative ids', 'existing creative', 'we have'],
    adcp: null,
    aamp: { path: 'creative_ids', required: false, kind: 'list[str]', defaultsTo: '[]' },
    enumSource: null,
    consequence:
      'The plan is built without knowing which creative exists, so products get chosen for formats nobody has assets for.',
    note: 'AdCP handles creative through creative agents and `create_media_buy`; `get_products` carries formats, not assets.',
  },

  /* ---------------- inventory, continued ---------------- */
  {
    key: 'delivery_type',
    label: 'Guaranteed or non-guaranteed',
    group: 'inventory',
    aliases: ['guaranteed', 'non guaranteed', 'reserved', 'delivery type'],
    adcp: { path: 'filters.delivery_type', kind: 'enum' },
    aamp: null,
    enumSource: 'enums/delivery-type.json',
    consequence:
      'Guaranteed and non-guaranteed products come back together and the buyer sorts out which is which.',
    note: "AAMP's nearest expression is `deal_preferences.preferred_deal_types` — 'PG' overlaps `guaranteed`, but 'PD' and 'PA' describe mechanics AdCP models elsewhere, so the engine does not map one onto the other.",
  },
  {
    key: 'preferred_delivery_types',
    label: 'Preferred delivery types',
    group: 'inventory',
    aliases: ['prefer guaranteed', 'leaning', 'ideally guaranteed', 'preference'],
    adcp: { path: 'preferred_delivery_types', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/delivery-type.json',
    consequence:
      'The seller cannot tell a preference from a hard constraint, so it either over-filters or ignores your leaning entirely.',
    note: 'Top-level sibling of `filters`, deliberately weaker than `filters.delivery_type`: it steers curation instead of excluding products. AAMP has no preference-versus-constraint distinction anywhere in the brief.',
  },
  {
    key: 'exclusivity',
    label: 'Exclusivity',
    group: 'inventory',
    aliases: ['exclusive', 'sole sponsor', 'sponsorship', 'category exclusive', 'takeover'],
    adcp: { path: 'filters.exclusivity', kind: 'enum' },
    aamp: null,
    enumSource: 'enums/exclusivity.json',
    consequence:
      'Sole-sponsorship and category-exclusive products are not distinguished from ordinary inventory, so an exclusivity ask never reaches the seller as a filter.',
    note: 'none | category | exclusive. AAMP has no exclusivity concept; a category conflict is unrepresentable in its brief.',
  },
  {
    key: 'video_placement_types',
    label: 'Video placement types',
    group: 'inventory',
    aliases: ['instream', 'pre roll', 'outstream', 'interstitial', 'accompanying content'],
    adcp: { path: 'filters.video_placement_types', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/video-placement-type.json',
    consequence:
      'Instream budget can be spent on accompanying-content or standalone inventory without the request ever saying otherwise.',
    note: 'instream | accompanying_content | interstitial | standalone — OpenRTB 2.6 `video.plcmt` semantics under AdCP-native names. AAMP has no video placement axis at all.',
  },
  {
    key: 'audio_distribution_types',
    label: 'Audio distribution types',
    group: 'inventory',
    aliases: ['podcast', 'streaming audio', 'broadcast radio', 'music streaming', 'catch up radio'],
    adcp: { path: 'filters.audio_distribution_types', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/audio-distribution-type.json',
    consequence:
      'Podcast, broadcast and music-streaming inventory are treated as one pool, so a podcast-only buy can deliver on FM simulcast.',
    note: 'Seven values from OpenRTB 2.6 `audio.feed`. AAMP collapses all of them into the single channel value AUDIO.',
  },
  {
    key: 'sponsored_placement_types',
    label: 'Sponsored placement types',
    group: 'inventory',
    aliases: [
      'sponsored search',
      'sponsored display',
      'sponsored native',
      'retail media placement',
    ],
    adcp: { path: 'filters.sponsored_placement_types', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/sponsored-placement-type.json',
    consequence:
      'Retail-media requests cannot distinguish sponsored search from sponsored display, and the seller picks for you.',
    note: 'AAMP has no retail-media channel, so there is nothing on that side to bind to.',
  },
  {
    key: 'social_placement_surfaces',
    label: 'Social placement surfaces',
    group: 'inventory',
    aliases: ['feed', 'stories', 'reels', 'short video', 'explore'],
    adcp: { path: 'filters.social_placement_surfaces', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/social-placement-surface.json',
    consequence:
      'Feed, stories and short-video surfaces are indistinguishable in the request, so delivery lands wherever the seller has supply.',
    note: 'AAMP has no social channel.',
  },
  {
    key: 'keywords',
    label: 'Target keywords',
    group: 'inventory',
    aliases: ['keyword', 'keywords', 'search terms', 'queries', 'match type'],
    adcp: { path: 'filters.keywords', kind: 'keyword[]' },
    aamp: null,
    enumSource: 'enums/match-type.json',
    consequence:
      'Search and retail-media products cannot be matched to your terms, so keyword availability is never assessed.',
    note: "Positive targeting only, with match_type broad | phrase | exact and no negation — which is why AAMP's `brand_safety.excluded_keywords` has nowhere to go in `get_products`.",
  },
  {
    key: 'property_list',
    label: 'Approved property list',
    group: 'inventory',
    aliases: ['inclusion list', 'allow list', 'approved sites', 'whitelist', 'property list'],
    adcp: { path: 'property_list', kind: 'property-list-ref' },
    aamp: null,
    enumSource: 'core/property-list-ref.json',
    consequence:
      'Discovery is not restricted to your approved inventory, so products on unvetted properties come back as candidates.',
    note: "A reference (`agent_url` + `list_id`, optional `auth_token`), not an inline list, and an allow-list only. AAMP's `exclusion_list` is the mirror image and has no AdCP counterpart.",
  },
  {
    key: 'preferred_sellers',
    label: 'Preferred sellers',
    group: 'inventory',
    aliases: ['preferred publishers', 'preferred sellers', 'prioritise', 'favour'],
    adcp: null,
    aamp: { path: 'preferred_sellers', required: false, kind: 'list[str]', defaultsTo: '[]' },
    enumSource: null,
    consequence:
      'Buying-platform routing ignores your preferred supply partners and treats all sellers alike.',
    note: 'AdCP is a per-seller protocol — you call one agent, so "which sellers" is a buyer-side routing decision that never appears in the request.',
  },
  {
    key: 'excluded_sellers',
    label: 'Excluded sellers',
    group: 'inventory',
    aliases: ['blocked publishers', 'excluded sellers', 'do not buy', 'seller block list'],
    adcp: null,
    aamp: { path: 'excluded_sellers', required: false, kind: 'list[str]', defaultsTo: '[]' },
    enumSource: null,
    consequence: 'Sellers you have blocked are still called and their inventory still returned.',
    note: 'Same asymmetry as `preferred_sellers`: AdCP has no cross-seller surface in `get_products`.',
  },

  /* ---------------- audience ---------------- */
  {
    key: 'audience_primary',
    label: 'Primary audience',
    group: 'audience',
    aliases: ['audience', 'target audience', 'demo', 'segment', 'who we are targeting'],
    adcp: { path: 'filters.signal_targeting', kind: 'signal-ref[]' },
    aamp: { path: 'target_audience.primary', required: false, kind: 'AudienceRef' },
    enumSource: 'iab-audience-1.1',
    consequence:
      'The buy runs untargeted: AdCP returns run-of-network products, and AAMP treats a null plan as "no audience targeting".',
    note: "Documented as one of AAMP's nine required fields; in code `target_audience` is `AudiencePlan | None = Field(default=None)`, so the model constructs without it — required by docs, optional by code. On the AdCP side the value is a SignalRef, not a taxonomy ID, and it must be buyer-selectable on the product: `included_signals` and bundled provider signals explicitly do not satisfy `signal_targeting`. AAMP validates contextual refs against IAB Content Taxonomy 3.x and rejects pre-3.x IDs.",
  },
  {
    key: 'audience_constraints',
    label: 'Audience constraints (narrowing)',
    group: 'audience',
    aliases: ['must also be', 'narrow to', 'intersect', 'and only'],
    adcp: null,
    aamp: {
      path: 'target_audience.constraints',
      required: false,
      kind: 'list[AudienceRef]',
      defaultsTo: '[]',
    },
    enumSource: 'iab-audience-1.1',
    consequence:
      'Precision constraints are dropped and the campaign reaches the primary audience unnarrowed.',
    note: "AdCP `filters.signal_targeting` is a flat list with no role algebra: intersect-for-precision cannot be distinguished from union-for-reach, and how a requested set composes is decided by the product's own `signal_targeting_rules`. The role is lost on the wire.",
  },
  {
    key: 'audience_extensions',
    label: 'Audience extensions (reach)',
    group: 'audience',
    aliases: ['extend reach', 'also reach', 'lookalike', 'union', 'broaden to'],
    adcp: null,
    aamp: {
      path: 'target_audience.extensions',
      required: false,
      kind: 'list[AudienceRef]',
      defaultsTo: '[]',
    },
    enumSource: 'iab-audience-1.1',
    consequence:
      'Reach-extension audiences are silently dropped and the plan under-delivers against its reach goal.',
    note: "Worse than merely unmapped: putting an extension ref into `filters.signal_targeting` would read as an additional requirement — the opposite of a union. The engine leaves it blank rather than inverting the buyer's meaning.",
  },
  {
    key: 'audience_exclusions',
    label: 'Audience exclusions (suppression)',
    group: 'audience',
    aliases: ['exclude', 'suppress', 'existing customers', 'converters', 'do not target'],
    adcp: { path: "filters.signal_targeting[].targeting_mode='exclude'", kind: 'signal-ref[]' },
    aamp: {
      path: 'target_audience.exclusions',
      required: false,
      kind: 'list[AudienceRef]',
      defaultsTo: '[]',
    },
    enumSource: 'iab-audience-1.1',
    consequence:
      'Suppression audiences (existing customers, recent converters) are not excluded, and budget is spent re-reaching people you already have.',
    note: 'The one audience role that survives to AdCP: `signal_targeting` entries take `targeting_mode: "exclude"`, and the product must allow the signal in a none-group for the filter to match.',
  },
  {
    key: 'audience_strictness',
    label: 'Audience degradation policy',
    group: 'audience',
    aliases: ['must have', 'nice to have', 'strictness', 'if unavailable', 'fall back'],
    adcp: null,
    aamp: {
      path: 'audience_strictness',
      required: false,
      kind: 'AudienceStrictness',
      defaultsTo: 'primary=required, constraints=preferred, extensions=optional, agentic=optional',
    },
    enumSource: null,
    consequence:
      'The buyer agent falls back to its default degradation policy, so a seller that cannot honour part of your plan may have it dropped without anyone being asked.',
    note: "No AdCP equivalent: the protocol has no notion of how much of the buyer's targeting may be discarded to make a match. This is a governance field wearing an audience field's clothes.",
  },

  /* ---------------- measurement ---------------- */
  {
    key: 'kpi_targets',
    label: 'KPI targets',
    group: 'measurement',
    aliases: ['kpi', 'kpis', 'target cpm', 'ctr', 'vcr', 'roas', 'cost per', 'success metric'],
    adcp: null,
    aamp: { path: 'kpis', required: false, kind: 'list[KPI]', defaultsTo: '[]' },
    enumSource: 'aamp:campaign_brief.KPIMetric',
    consequence:
      'Nobody can tell whether the campaign succeeded, and the seller optimises to whichever metric it prefers.',
    note: 'CPM | CPC | CPCV | CTR | VCR | ROAS | GRP, each with a `target_value > 0`. AdCP has no goal field at discovery: `filters.required_metrics` asks who can *report* a metric and `filters.required_performance_standards` sets a threshold with a vendor, but neither carries a target value for CPM, CPC, CTR, ROAS or GRP.',
  },
  {
    key: 'min_exposures',
    label: 'Minimum exposures for measurement',
    group: 'measurement',
    aliases: ['minimum impressions', 'measurement validity', 'read threshold', 'min exposures'],
    adcp: { path: 'filters.min_exposures', kind: 'integer' },
    aamp: null,
    enumSource: null,
    consequence:
      'Products too small to reach measurement validity stay in the result set and the study is under-powered.',
    note: 'Deliberately not mapped to AAMP `deal_preferences.min_impressions`, which is a commercial floor rather than a measurement threshold. Two numbers that look alike and mean different things.',
  },
  {
    key: 'required_metrics',
    label: 'Required reporting metrics',
    group: 'measurement',
    aliases: ['must report', 'reporting', 'completed views', 'metrics we need'],
    adcp: { path: 'filters.required_metrics', kind: 'enum[]' },
    aamp: null,
    enumSource: 'enums/available-metric.json',
    consequence:
      'Products that cannot report the metric your KPI is measured in are returned, and the gap shows up as `missing_metrics` on delivery reports.',
    note: "The product's declared `available_metrics` becomes the binding reporting contract for the resulting media buy. AAMP states KPI targets but has no way to require that anyone can report them.",
  },
  {
    key: 'required_performance_standards',
    label: 'Required performance standards',
    group: 'measurement',
    aliases: [
      'viewability',
      'ivt',
      'mrc',
      'attention',
      'brand safety threshold',
      'doubleverify',
      'ias',
    ],
    adcp: { path: 'filters.required_performance_standards', kind: 'performance-standard[]' },
    aamp: null,
    enumSource: 'enums/performance-standard-metric.json',
    consequence:
      'Viewability, IVT and attention thresholds are never stated up front, so they become a post-campaign argument instead of a discovery filter.',
    note: "viewability | ivt | completion_rate | brand_safety | attention_score, each with a threshold and a required vendor. Of AAMP's KPI vocabulary only VCR overlaps (as completion_rate), and AAMP has no threshold-with-vendor shape.",
  },
  {
    key: 'required_vendor_metrics',
    label: 'Required vendor metrics',
    group: 'measurement',
    aliases: ['vendor', 'third party measurement', 'attention vendor', 'panel'],
    adcp: { path: 'filters.required_vendor_metrics', kind: 'vendor-metric[]' },
    aamp: null,
    enumSource: 'core/vendor-metric-id.json',
    consequence:
      "Products that cannot report your measurement vendor's metrics are returned, and the vendor discovers the gap in flight.",
    note: "Each entry pins a vendor, a metric_id, or both. Cross-vendor discovery is the buyer agent's job — AdCP carries no vendor-side metric metadata. AAMP has no vendor concept in the brief at all.",
  },
  {
    key: 'required_features',
    label: 'Required protocol features',
    group: 'measurement',
    aliases: ['capabilities', 'must support', 'feature support', 'committed metrics'],
    adcp: { path: 'filters.required_features', kind: 'capability-flags' },
    aamp: null,
    enumSource: 'core/media-buy-features.json',
    consequence:
      'Sellers that cannot support inline creative management, property-list filtering, catalog management or committed metrics are still returned, and the buy fails at execution.',
    note: 'Exactly four flags exist at 3.1.13, and only features set to true filter. A seller declaring a feature true MUST honour requests using it — which makes this the one place a brief can state a capability requirement and expect enforcement.',
  },
  {
    key: 'trusted_match',
    label: 'Trusted Match capability',
    group: 'measurement',
    aliases: ['clean room', 'identity match', 'context match', 'tmp', 'trusted match'],
    adcp: { path: 'filters.trusted_match', kind: 'trusted-match' },
    aamp: null,
    enumSource: 'enums/response-type.json',
    consequence:
      'Products without the identity or context match capability you rely on are returned as if they were interchangeable with ones that have it.',
    note: 'Providers are pinned by `agent_url` from the registry; response types are activation | catalog_items | creative | deal. Supersedes the deprecated `required_axe_integrations`. AAMP has no TMP concept.',
  },
  {
    key: 'required_axe_integrations',
    label: 'Required agentic exchange integrations (deprecated)',
    group: 'measurement',
    aliases: ['axe', 'agentic exchange', 'exchange integration'],
    adcp: { path: 'filters.required_axe_integrations', kind: 'uri[]', deprecated: true },
    aamp: null,
    enumSource: null,
    consequence:
      'Nothing at 3.1.13 — the field is deprecated in favour of `trusted_match`, and populating it is a compatibility choice rather than a requirement.',
    note: 'Kept in the map because sellers still accept it and briefs written against AdCP 3.0 still carry it. The engine reads it and does not write it.',
  },
  {
    key: 'filters_ext',
    label: 'Vendor-specific filter extensions',
    group: 'measurement',
    aliases: ['custom', 'seller specific', 'extension', 'gam', 'platform specific'],
    adcp: { path: 'filters.ext', kind: 'ext' },
    aamp: null,
    enumSource: 'core/ext.json',
    consequence:
      'Seller-specific criteria with no standard field have nowhere to go and end up as prose the seller may never parse.',
    note: 'Keys must be namespaced under a vendor or platform. Note the trap next door: `filters` and the request itself are both `additionalProperties: true`, so anything you invent outside `ext` is accepted and silently ignored.',
  },

  /* ---------------- safety ---------------- */
  {
    key: 'excluded_content_categories',
    label: 'Excluded content categories',
    group: 'safety',
    aliases: [
      'brand safety',
      'avoid',
      'no news',
      'exclusions',
      'blocked categories',
      'unsuitable content',
    ],
    adcp: null,
    aamp: {
      path: 'brand_safety.excluded_categories',
      required: false,
      kind: 'BrandSafety',
      defaultsTo: '[]',
    },
    enumSource: 'iab-content-3.0',
    consequence:
      'Your ads run beside content you told someone you would avoid, and the first evidence is a screenshot.',
    note: 'One of the largest gaps in the map: AdCP 3.1.13 `product-filters` has no brand-safety exclusion field. `required_policies` (top-level) names registry policy IDs the seller must already enforce, and `enums/policy-category.json` is a seller-side declaration vocabulary; neither accepts buyer category exclusions.',
  },
  {
    key: 'excluded_keywords',
    label: 'Excluded keywords',
    group: 'safety',
    aliases: ['blocked keywords', 'negative keywords', 'keyword block list', 'avoid terms'],
    adcp: null,
    aamp: {
      path: 'brand_safety.excluded_keywords',
      required: false,
      kind: 'BrandSafety',
      defaultsTo: '[]',
    },
    enumSource: null,
    consequence:
      'Keyword-level blocks are not applied and unsuitable adjacency is caught after delivery, if at all.',
    note: '`filters.keywords` is positive targeting with no negation, so there is no AdCP field to carry this.',
  },
  {
    key: 'excluded_domains',
    label: 'Excluded domains and brands',
    group: 'safety',
    aliases: ['block list', 'blacklist', 'excluded domains', 'competitors', 'do not run on'],
    adcp: null,
    aamp: { path: 'exclusion_list', required: false, kind: 'list[str]', defaultsTo: '[]' },
    enumSource: null,
    consequence:
      'Blocked domains and brands remain eligible, and the block list has to be re-applied in the DSP — if there is one in the path.',
    note: 'AdCP `property_list` is an allow-list reference; the inverse is not expressible in `get_products`.',
  },
  {
    key: 'frequency_cap',
    label: 'Frequency cap',
    group: 'safety',
    aliases: [
      'frequency',
      'frequency cap',
      'times per week',
      'impressions per user',
      'reach and frequency',
    ],
    adcp: null,
    aamp: { path: 'frequency_cap', required: false, kind: 'FrequencyCap' },
    enumSource: null,
    consequence:
      "Users are hit as often as the seller's own pacing allows, and cross-channel frequency is nobody's job.",
    note: "AAMP takes `max_impressions` + `period_hours`, both `> 0`. `get_products` has no frequency field: AdCP has `enums/frequency-cap-scope.json`, but it applies to a media buy's packages, so a frequency requirement cannot influence which products are returned.",
  },

  /* ---------------- governance ---------------- */
  {
    key: 'approval_plan_review',
    label: 'Human approval: plan review',
    group: 'governance',
    aliases: ['approve the plan', 'plan review', 'sign off the plan', 'review before'],
    adcp: null,
    aamp: {
      path: 'approval_config.plan_review',
      required: false,
      kind: 'ApprovalConfig',
      defaultsTo: 'true',
    },
    enumSource: null,
    consequence:
      "AAMP's default applies and the pipeline halts at an approval gate the brief never discussed.",
    note: 'AdCP has no approval-gate surface in `get_products`; governance vocabularies exist elsewhere in the protocol but nothing in the discovery request records what the agent may do unsupervised.',
  },
  {
    key: 'approval_booking',
    label: 'Human approval: booking',
    group: 'governance',
    aliases: ['approve before booking', 'sign off spend', 'human in the loop', 'authorise the buy'],
    adcp: null,
    aamp: {
      path: 'approval_config.booking',
      required: false,
      kind: 'ApprovalConfig',
      defaultsTo: 'true',
    },
    enumSource: null,
    consequence:
      "AAMP's default applies and the agent will not book without a human, whatever the brief implied about autonomy.",
    note: 'The single highest-stakes bit in the brief — whether software may spend money unattended — and it has no AdCP representation at all.',
  },
  {
    key: 'approval_creative',
    label: 'Human approval: creative assignment',
    group: 'governance',
    aliases: ['approve creative', 'creative sign off', 'review assets'],
    adcp: null,
    aamp: {
      path: 'approval_config.creative',
      required: false,
      kind: 'ApprovalConfig',
      defaultsTo: 'false',
    },
    enumSource: null,
    consequence:
      "AAMP's default applies and creative is assigned to placements with nobody signing it off.",
    note: 'Defaults to false — the permissive direction — which is exactly the kind of unstated value this engine exists to surface.',
  },
  {
    key: 'approval_pacing_adjustment',
    label: 'Human approval: pacing and reallocation',
    group: 'governance',
    aliases: ['reallocate', 'move budget', 'pacing changes', 'shift spend'],
    adcp: null,
    aamp: {
      path: 'approval_config.pacing_adjustment',
      required: false,
      kind: 'ApprovalConfig',
      defaultsTo: 'false',
    },
    enumSource: null,
    consequence:
      "AAMP's default applies and the agent reallocates budget between channels without asking.",
    note: 'Also defaults to false. Together with `approval_creative`, these are the two gates a team most often assumes are closed and which ship open.',
  },
]

/* ==================================================================== *
 * Derived indexes — data, not logic
 * ==================================================================== */

/** Every key in FIELDS, as a literal union. Downstream code should use this. */
export type FieldKey = (typeof FIELDS)[number]['key']

export const FIELD_BY_KEY: Readonly<Record<string, FieldDef>> = Object.freeze(
  Object.fromEntries(FIELDS.map((f) => [f.key, f])),
)

export const FIELD_KEYS: readonly string[] = FIELDS.map((f) => f.key)

/** Keys whose AAMP binding is required — the transactable-score numerator. */
export const AAMP_REQUIRED_KEYS: readonly string[] = FIELDS.filter(
  (f) => f.aamp?.required === true,
).map((f) => f.key)

/** Keys that write into `filters.*` — the expressive-score numerator. */
export const ADCP_FILTER_KEYS: readonly string[] = FIELDS.filter((f) =>
  f.adcp?.path.startsWith('filters.'),
).map((f) => f.key)

/** Keys AdCP can express and AAMP cannot. */
export const ADCP_ONLY_KEYS: readonly string[] = FIELDS.filter(
  (f) => f.adcp !== null && f.aamp === null,
).map((f) => f.key)

/** Keys AAMP can express and AdCP cannot. */
export const AAMP_ONLY_KEYS: readonly string[] = FIELDS.filter(
  (f) => f.aamp !== null && f.adcp === null,
).map((f) => f.key)

/** Keys both protocols can express, however lossily. */
export const BOTH_KEYS: readonly string[] = FIELDS.filter(
  (f) => f.adcp !== null && f.aamp !== null,
).map((f) => f.key)

/**
 * The distinct `filters.*` property names this map writes to, normalised
 * (`filters.budget_range.max` -> `budget_range`). Compared against the pinned
 * schema in test/fields.test.ts so a new AdCP release cannot silently add a
 * filter the map does not know about.
 */
export const ADCP_FILTER_PATHS_COVERED: readonly string[] = Array.from(
  new Set(
    FIELDS.filter((f) => f.adcp?.path.startsWith('filters.')).map(
      (f) => f.adcp!.path.slice('filters.'.length).split(/[.[]/)[0]!,
    ),
  ),
).sort()
