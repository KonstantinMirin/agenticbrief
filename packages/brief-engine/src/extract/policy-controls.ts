/**
 * Extractor: policy controls — the control surface of a brief.
 *
 * Brand safety, frequency, pacing, approvals, deal floors and ceilings, seller
 * lists, capability requirements and KPIs. These are the fields that say what
 * the agent may *not* do, which is the half of a brief a human actually signs.
 *
 * THE ONE RULE: no silent invention. Every value below is traceable to a span
 * of the buyer's own text, or it is labelled `derived` and carries the rule
 * that produced it in words, or it is not emitted at all. The two places the
 * market's best generator invented requirements — a 60/25/15 channel split and
 * 14/28-day attribution windows — are handled explicitly:
 *
 *   - this module never writes a channel split (it is not its field), and
 *   - attribution windows are extracted ONLY when stated, and then only as a
 *     warning, because neither protocol has a field to put them in. See
 *     `attributionWindows()`.
 *
 * Determinism: pure function of (text, opts). No clock, no network, no I/O, no
 * module-level mutable state. Every global regex is consumed through
 * `String.prototype.matchAll`, which clones the regex rather than advancing the
 * shared `lastIndex`; nothing here calls `.test()` or `.exec()` on a `/g`
 * regex, and that is load-bearing for reentrancy.
 *
 * Vocabulary sources, read from disk rather than from memory:
 *   IAB Content Taxonomy 3.1 — /srv/ws/iab/buyer-agent/data/taxonomies/
 *                              content-3.1/Content Taxonomy 3.1.tsv
 *                              (the table AAMP itself validates against; note
 *                              that AAMP *documents* 3.0 and vendors 3.1)
 *   AAMP CampaignBrief        — /srv/ws/iab/buyer-agent/src/ad_buyer/models/
 *                              campaign_brief.py  (FrequencyCap, PacingModel,
 *                              ApprovalConfig, DealPreferences, BrandSafety, KPI)
 *   AdCP 3.1.10               — core/product-filters.json, core/performance-standard.json,
 *                              core/media-buy-features.json, enums/available-metric.json,
 *                              enums/performance-standard-metric.json,
 *                              enums/viewability-standard.json, enums/exclusivity.json,
 *                              enums/response-type.json
 *
 * Label conventions used throughout this module, stated once:
 *   stated   the value is the buyer's own token, or a 1:1 case/punctuation
 *            normalisation of it (`front-loaded` -> `FRONT_LOADED`).
 *   derived  a vocabulary or unit conversion fired (`per week` -> 168 hours,
 *            `hate speech` -> IAB `HxqYV1`, `70%` -> 0.70). `rule` says which.
 *            A list-valued field is `derived` when ANY element needed a
 *            conversion, and `stated` when none did.
 *   assumed  never written into `fields`. Candidates go to `offered`, where the
 *            caller must accept them explicitly (see AnalyzeOptions.assume).
 *   missing  emitted only to carry a `note` — an ambiguity the engine refuses
 *            to resolve, or a vocabulary the protocols cannot hold. A `missing`
 *            entry loses every merge, so it can never mask another extractor.
 */

import type { Extraction, FieldValue, Extractor, Span } from '../types.ts'

/** Value written to `FieldValue.extractor` on everything this module emits. */
const EXTRACTOR = 'policy-controls'

/** Options. `referenceDate` is accepted for signature parity with the other
 *  extractors; no rule in this module reads a clock or a calendar — a policy
 *  control has no relative-date form. It is validated and otherwise unused. */
export interface PolicyControlsOptions {
  /** ISO-8601 date, e.g. '2026-08-12'. Unused here; see above. */
  referenceDate?: string
}

/** What this module returns: an `Extraction` with the two maps always present. */
export interface PolicyControlsExtraction extends Extraction {
  fields: Record<string, FieldValue<unknown>>
  offered: Record<string, FieldValue<unknown>>
  warnings: string[]
}

/**
 * Every field key this module is competent for. All exist in `fields.ts`;
 * a test asserts that, so a rename there fails here loudly instead of silently
 * emitting a key nothing reads.
 */
export const POLICY_CONTROL_KEYS: readonly string[] = [
  'excluded_content_categories',
  'excluded_keywords',
  'excluded_domains',
  'frequency_cap',
  'pacing_model',
  'approval_plan_review',
  'approval_booking',
  'approval_creative',
  'approval_pacing_adjustment',
  'deal_max_cpm',
  'deal_min_impressions',
  'min_exposures',
  'exclusivity',
  'required_features',
  'required_metrics',
  'required_performance_standards',
  'trusted_match',
  'preferred_sellers',
  'excluded_sellers',
  'kpi_targets',
]

/* ==================================================================== *
 * Vocabularies
 * ==================================================================== */

/** One IAB Content Taxonomy node. `id` is the Unique ID column of the TSV. */
interface TaxonomyNode {
  id: string
  name: string
}

/**
 * Buyer phrase -> exactly one taxonomy node.
 *
 * Membership rule, applied by hand and deliberately conservative: a phrase
 * appears here only when one node in the taxonomy is the obvious and only
 * target for it. Everything a reasonable planner could route to two different
 * nodes lives in AMBIGUOUS_CATEGORY_TERMS below and is never resolved for them.
 *
 * Patterns are anchored on word boundaries and are matched against a
 * *blocklist clause* only (see `brandSafety()`), never against the whole input:
 * "our audience skews political" is not a brand-safety exclusion.
 */
const MAPPED_CATEGORY_TERMS: readonly { re: RegExp; node: TaxonomyNode }[] = [
  // GARM-aligned "Sensitive Topics" subtree — the brand-safety vocabulary
  // proper. These eleven nodes are what a buyer means by "brand safety".
  {
    // "adult content", "explicit sexual content", "porn(ography)", "NSFW".
    re: /\b(?:adult(?:\s+&\s+explicit\s+sexual)?\s+content|explicit\s+sexual\s+content|pornograph(?:y|ic)|porn|sexually\s+explicit|nsfw)\b/gi,
    node: { id: 'Rm3SiT', name: 'Adult & Explicit Sexual Content' },
  },
  {
    // "arms", "ammunition", "firearms", "guns", "weapons".
    re: /\b(?:arms\s+&\s+ammunition|ammunition|firearms?|gun\s+content|guns|weapons)\b/gi,
    node: { id: 'avbNf2', name: 'Arms & Ammunition' },
  },
  {
    re: /\b(?:hate\s+speech|hateful\s+content|acts\s+of\s+aggression)\b/gi,
    node: { id: 'HxqYV1', name: 'Hate Speech and Acts of Aggression' },
  },
  {
    re: /\bterroris(?:m|t\s+content)\b/gi,
    node: { id: '8FD8nI', name: 'Terrorism' },
  },
  {
    re: /\b(?:obscenity|profanity|foul\s+language|swearing)\b/gi,
    node: { id: 'j9PaO9', name: 'Obscenity and Profanity' },
  },
  {
    re: /\b(?:online\s+piracy|piracy|pirated\s+content)\b/gi,
    node: { id: 'mm3UXx', name: 'Online Piracy' },
  },
  {
    re: /\b(?:spam|malware)\b/gi,
    node: { id: '6i4dB6', name: 'Spam or Harmful Content' },
  },
  {
    // The node bundles five substances; each of these names only that node.
    // Bare "alcohol" does NOT: see AMBIGUOUS_CATEGORY_TERMS.
    re: /\b(?:tobacco|e-?cigarettes?|vaping|vapes?|illegal\s+drugs?|narcotics)\b/gi,
    node: { id: 'pg0WhF', name: 'Illegal Drugs, Tobacco, eCigarettes, Vaping, Alcohol' },
  },
  {
    re: /\bdeath,?\s+injury,?\s+(?:or\s+)?military\s+conflict\b/gi,
    node: { id: 'I4GWl6', name: 'Death, Injury, or Military Conflict' },
  },
  {
    re: /\bdebated\s+sensitive\s+social\s+issues\b/gi,
    node: { id: 'Z7rJBM', name: 'Debated Sensitive Social Issues' },
  },
  {
    re: /\bcrime\s+&\s+harmful\s+acts\b/gi,
    node: {
      id: 'XtODT3',
      name: 'Crime & Harmful Acts to Individuals, Society & Human Right Violations',
    },
  },
  { re: /\bsensitive\s+topics\b/gi, node: { id: 'v9i3On', name: 'Sensitive Topics' } },

  // A few tier-1/tier-2 nodes outside the sensitive subtree that buyers name
  // routinely and that the taxonomy holds exactly once.
  { re: /\bpolitics\b|\bpolitical\s+content\b/gi, node: { id: '386', name: 'Politics' } },
  { re: /\b(?:natural\s+)?disasters?\b/gi, node: { id: '381', name: 'Disasters' } },
  { re: /\btrue\s+crime\b/gi, node: { id: 'KHPC5A', name: 'True Crime' } },
  { re: /\bdating\s+(?:content|sites?|apps?)\b/gi, node: { id: '188', name: 'Dating' } },
  {
    re: /\bcasinos?\s+(?:&|and)\s+gambling\b/gi,
    node: { id: '181', name: 'Casinos & Gambling' },
  },
]

/**
 * Buyer phrase -> more than one plausible taxonomy node. The engine records the
 * phrase, lists the candidates in a warning and picks none of them. Choosing
 * here would be exactly the failure this product exists to avoid: the buyer
 * would find an ID in a document they signed that they never named.
 */
const AMBIGUOUS_CATEGORY_TERMS: readonly {
  re: RegExp
  candidates: readonly TaxonomyNode[]
}[] = [
  {
    // Sports poker, casino content and casino video games are three nodes.
    re: /\bgambling\b|\bcasinos?\b(?!\s+(?:&|and)\s+gambling)|\bbetting\b/gi,
    candidates: [
      { id: '181', name: 'Casinos & Gambling' },
      { id: '524', name: 'Poker and Professional Gambling' },
      { id: 'ZJG29S', name: 'Casino and Gambling Video Games' },
    ],
  },
  {
    // Content *about* drinks vs the GARM sensitive-substances node.
    re: /\balcohol(?:ic)?\b|\bbooze\b|\bliquor\b/gi,
    candidates: [
      { id: '211', name: 'Alcoholic Beverages' },
      { id: 'pg0WhF', name: 'Illegal Drugs, Tobacco, eCigarettes, Vaping, Alcohol' },
    ],
  },
  {
    re: /\bviolen(?:ce|t\s+content)\b/gi,
    candidates: [
      {
        id: 'XtODT3',
        name: 'Crime & Harmful Acts to Individuals, Society & Human Right Violations',
      },
      { id: 'I4GWl6', name: 'Death, Injury, or Military Conflict' },
      { id: 'HxqYV1', name: 'Hate Speech and Acts of Aggression' },
    ],
  },
  {
    re: /\bwar\b|\bmilitary\s+conflict\b|\bconflict\s+zones?\b/gi,
    candidates: [
      { id: '389', name: 'War and Conflicts' },
      { id: 'I4GWl6', name: 'Death, Injury, or Military Conflict' },
    ],
  },
  {
    re: /\bcrime\b(?!\s*&)/gi,
    candidates: [
      { id: '380', name: 'Crime' },
      {
        id: 'XtODT3',
        name: 'Crime & Harmful Acts to Individuals, Society & Human Right Violations',
      },
      { id: 'KHPC5A', name: 'True Crime' },
    ],
  },
  {
    re: /\breligio(?:n|us)\b|\bfaith\s+content\b/gi,
    candidates: [
      { id: '453', name: 'Religion & Spirituality' },
      { id: '361', name: 'Religious (Music and Audio)' },
    ],
  },
  {
    // Bare "drugs" is the pharmaceutical tree as often as the illegal one.
    re: /\bdrugs\b(?<!illegal\s+drugs)/gi,
    candidates: [
      { id: 'pg0WhF', name: 'Illegal Drugs, Tobacco, eCigarettes, Vaping, Alcohol' },
      { id: '320', name: 'Pharmaceutical Drugs' },
    ],
  },
]

/**
 * Phrases every planner uses that the vendored taxonomy simply does not
 * contain. The buyer's words are kept verbatim in the field and the absence is
 * reported: this is a vocabulary gap, not a buyer error, and it is the single
 * most common brand-safety instruction in the corpus ("no news").
 */
const UNMAPPED_CATEGORY_TERMS: readonly { re: RegExp; why: string }[] = [
  {
    re: /\bnews\b|\bcurrent\s+affairs\b|\bbreaking\s+news\b/gi,
    why: "the vendored IAB Content Taxonomy 3.1 table has no 'News' node at any tier; 'Politics' (386) is the nearest tree and is not the same thing",
  },
  {
    re: /\bmisinformation\b|\bfake\s+news\b|\bdisinformation\b/gi,
    why: "the vendored IAB Content Taxonomy 3.1 table carries eleven of GARM's Sensitive Topics and 'Misinformation' is not among them",
  },
  {
    re: /\bcontroversial\s+content\b|\bunsuitable\s+content\b|\bbrand[- ]unsafe\b/gi,
    why: 'this is a policy label, not a taxonomy node; no IAB category corresponds to it',
  },
  {
    re: /\buser[- ]generated\s+content\b|\bugc\b/gi,
    why: 'UGC is an inventory property, not a content category; the IAB Content Taxonomy has no node for it',
  },
]

/**
 * Verification vendors. A vendor name is not a content category and is not a
 * taxonomy ID; when one turns up in a blocklist it is recorded and mapped to
 * nothing. The domain form is only used to build an AdCP `performance-standard`
 * `vendor` BrandRef, and only when a threshold was also stated.
 */
const VENDORS: readonly { re: RegExp; name: string; domain: string }[] = [
  { re: /\bdouble\s?verify\b|\bdv\b/gi, name: 'DoubleVerify', domain: 'doubleverify.com' },
  {
    re: /\bintegral\s+ad\s+science\b|\bias\b/gi,
    name: 'Integral Ad Science',
    domain: 'integralads.com',
  },
  { re: /\bzefr\b/gi, name: 'Zefr', domain: 'zefr.com' },
  { re: /\bmoat\b/gi, name: 'Moat', domain: 'moat.com' },
  { re: /\bpeer\s?39\b/gi, name: 'Peer39', domain: 'peer39.com' },
  { re: /\bcomscore\b/gi, name: 'Comscore', domain: 'comscore.com' },
  {
    re: /\bhuman\s?security\b|\bwhite\s+ops\b/gi,
    name: 'HUMAN Security',
    domain: 'humansecurity.com',
  },
]

/** `period_hours` for the units that have exactly one hour count. */
const EXACT_PERIOD_HOURS: Readonly<Record<string, { hours: number; rule: string }>> = {
  hour: { hours: 1, rule: "'per hour' -> period_hours: 1" },
  day: { hours: 24, rule: "'per day' -> period_hours: 24 (24 hours)" },
  week: { hours: 168, rule: "'per week' -> period_hours: 168 (7 days x 24 hours)" },
}

/**
 * Units with no exact hour count. AAMP's `FrequencyCap.period_hours` is an
 * integer, so "per month" has to become a number and there are three defensible
 * ones (672 / 720 / 744). The engine offers a value and writes none.
 */
const APPROX_PERIOD_HOURS: Readonly<Record<string, { hours: number; rule: string }>> = {
  month: {
    hours: 720,
    rule: "'per month' has no exact hour count (28/30/31 days = 672/720/744 hours); 720 is a 30-day month",
  },
  quarter: {
    hours: 2160,
    rule: "'per quarter' has no exact hour count (89-92 days); 2160 is a 90-day quarter",
  },
  year: {
    hours: 8760,
    rule: "'per year' has no exact hour count (365/366 days); 8760 is a 365-day year",
  },
}

/** AAMP `PacingModel` — the whole enum. AdCP has no pacing filter at all. */
const PACING_PATTERNS: readonly { re: RegExp; value: string; exact: boolean; rule?: string }[] = [
  {
    re: /\bfront[- ]?load(?:ed|ing)?\b|\bfront[- ]?weighted\b/gi,
    value: 'FRONT_LOADED',
    exact: true,
  },
  {
    re: /\bback[- ]?load(?:ed|ing)?\b|\bback[- ]?weighted\b/gi,
    value: 'BACK_LOADED',
    exact: true,
  },
  {
    re: /\beven(?:ly)?\s+(?:paced|pacing|spread|distributed|delivered)\b|\bpacing:?\s*even\b|\bflat\s+pacing\b/gi,
    value: 'EVEN',
    exact: true,
  },
  {
    re: /\bcustom\s+pacing\b|\bcustom\s+(?:delivery|pacing)\s+(?:curve|schedule)\b|\bweekly\s+pacing\s+curve\b/gi,
    value: 'CUSTOM',
    exact: true,
  },
  {
    // Semantic, not lexical: the buyer described a shape, the enum has a name
    // for it. Labelled `derived` with the rule shown.
    re: /\bheavy\s?up\s+(?:at|in|for)\s+(?:launch|the\s+start|week\s+one)\b|\bweight(?:ed)?\s+to\s+(?:launch|the\s+front)\b/gi,
    value: 'FRONT_LOADED',
    exact: false,
    rule: 'a launch-weighted delivery shape is AAMP PacingModel.FRONT_LOADED (the enum has no finer grain)',
  },
]

/**
 * Pacing the buyer can say and AAMP cannot hold. AdCP's `enums/pacing.json` has
 * `asap`; AAMP's `PacingModel` does not, and `pacing_model` has no AdCP binding
 * in `get_products` anyway, so the instruction is unrepresentable on both wires.
 */
const PACING_UNREPRESENTABLE_RE =
  /\basap\b|\bas\s+(?:fast|quickly)\s+as\s+possible\b|\bspend\s+it\s+out\s+early\b/gi

/** AAMP `KPIMetric`. Surface forms -> enum value; `exact` drives the label. */
const KPI_METRICS: readonly { re: RegExp; value: string; exact: boolean; rule?: string }[] = [
  { re: /\bcpcv\b|\bcost\s+per\s+completed\s+view\b/gi, value: 'CPCV', exact: true },
  { re: /\bcpm\b/gi, value: 'CPM', exact: true },
  { re: /\bcpc\b|\bcost\s+per\s+click\b/gi, value: 'CPC', exact: true },
  { re: /\bctr\b|\bclick[- ]through\s+rate\b/gi, value: 'CTR', exact: true },
  { re: /\bvcr\b|\bvideo\s+completion\s+rate\b/gi, value: 'VCR', exact: true },
  { re: /\broas\b|\breturn\s+on\s+ad\s+spend\b/gi, value: 'ROAS', exact: true },
  { re: /\bgrps?\b|\bgross\s+rating\s+points?\b/gi, value: 'GRP', exact: true },
  {
    re: /\bcompletion\s+rate\b/gi,
    value: 'VCR',
    exact: false,
    rule: "'completion rate' -> AAMP KPIMetric.VCR (AAMP's only completion metric; AdCP calls the same thing `completion_rate`)",
  },
]

/**
 * Business outcomes. Real goals, and neither protocol has a field for them:
 * AAMP's `kpis` accepts seven media metrics and AdCP's `get_products` carries
 * no goal at all. Reporting this is the point; forcing it into a field is not.
 * `adjacent` names the nearest AdCP *reporting capability*, where one exists —
 * a capability is not a target, and the engine does not substitute one for the
 * other.
 */
const BUSINESS_OUTCOMES: readonly { re: RegExp; label: string; adjacent?: string }[] = [
  { re: /\b(?:household|hh)\s+penetration\b/gi, label: 'household penetration' },
  {
    re: /\b(?:incremental\s+|retail\s+)?sales\s+lift\b/gi,
    label: 'sales lift',
    adjacent: 'incremental_sales_lift',
  },
  { re: /\bbrand\s+lift\b|\bawareness\s+lift\b/gi, label: 'brand lift', adjacent: 'brand_lift' },
  {
    re: /\bfoot\s?fall\b|\bfoot\s+traffic\b|\bstore\s+visits?\b/gi,
    label: 'store visitation',
    adjacent: 'foot_traffic',
  },
  { re: /\bmarket\s+share\b/gi, label: 'market share' },
  { re: /\bpurchase\s+intent\b/gi, label: 'purchase intent' },
  { re: /\bbrand\s+equity\b|\bmental\s+availability\b/gi, label: 'brand equity' },
  { re: /\bincrementality\b/gi, label: 'incrementality' },
  { re: /\b(?:trial|repeat)\s+rate\b|\bbasket\s+size\b/gi, label: 'shopper behaviour' },
]

/** AdCP `enums/available-metric.json` — the subset with unambiguous prose forms. */
const AVAILABLE_METRICS: readonly { re: RegExp; value: string; exact: boolean; rule?: string }[] = [
  { re: /\bcompleted\s+views\b/gi, value: 'completed_views', exact: true },
  { re: /\bcompletion\s+rate\b/gi, value: 'completion_rate', exact: true },
  { re: /\bviewability\b/gi, value: 'viewability', exact: true },
  { re: /\bimpressions\b/gi, value: 'impressions', exact: true },
  { re: /\bspend\b/gi, value: 'spend', exact: true },
  { re: /\bclicks\b/gi, value: 'clicks', exact: true },
  { re: /\bctr\b|\bclick[- ]through\s+rate\b/gi, value: 'ctr', exact: true },
  { re: /\bconversions\b/gi, value: 'conversions', exact: true },
  { re: /\broas\b/gi, value: 'roas', exact: true },
  { re: /\breach\b/gi, value: 'reach', exact: true },
  { re: /\bgrps?\b/gi, value: 'grps', exact: true },
  { re: /\bbrand\s+lift\b/gi, value: 'brand_lift', exact: true },
  { re: /\bfoot\s+traffic\b/gi, value: 'foot_traffic', exact: true },
  { re: /\bquartile\s+data\b/gi, value: 'quartile_data', exact: true },
  {
    re: /\bvcr\b/gi,
    value: 'completion_rate',
    exact: false,
    rule: "'VCR' -> AdCP available-metric `completion_rate` (the same measure under the AdCP name)",
  },
  {
    re: /\bcpa\b|\bcost\s+per\s+acquisition\b/gi,
    value: 'cost_per_acquisition',
    exact: false,
    rule: "'CPA' -> AdCP available-metric `cost_per_acquisition`",
  },
]

/** AdCP `enums/performance-standard-metric.json`, with each metric's direction. */
const PERFORMANCE_METRICS: readonly {
  re: RegExp
  value: string
  direction: 'floor' | 'ceiling'
  exact: boolean
  rule?: string
}[] = [
  {
    re: /\bviewability\b|\bviewable\s+rate\b/gi,
    value: 'viewability',
    direction: 'floor',
    exact: true,
  },
  { re: /\bivt\b|\binvalid\s+traffic\b/gi, value: 'ivt', direction: 'ceiling', exact: true },
  {
    re: /\bcompletion\s+rate\b/gi,
    value: 'completion_rate',
    direction: 'floor',
    exact: true,
  },
  {
    re: /\bbrand\s+safety\s+(?:rate|score|threshold)\b/gi,
    value: 'brand_safety',
    direction: 'floor',
    exact: true,
  },
  { re: /\battention\s+score\b/gi, value: 'attention_score', direction: 'floor', exact: true },
  {
    re: /\bvcr\b/gi,
    value: 'completion_rate',
    direction: 'floor',
    exact: false,
    rule: "'VCR' -> AdCP performance-standard metric `completion_rate`",
  },
]

/** AdCP `core/media-buy-features.json` — exactly four flags exist at 3.1.10. */
const MEDIA_BUY_FEATURES: readonly { re: RegExp; flag: string }[] = [
  {
    re: /\binline\s+creatives?\b|\bcreatives?\s+inline\b|\binline\s+creative\s+management\b/gi,
    flag: 'inline_creative_management',
  },
  {
    re: /\bproperty\s+list\b|\ballow[- ]?list\b|\binclusion\s+list\b|\bwhitelist\b|\bapproved\s+(?:site|property|domain)\s+list\b/gi,
    flag: 'property_list_filtering',
  },
  {
    re: /\bcatalog(?:ue)?\s+(?:management|sync|feed)\b|\bsync_catalogs\b/gi,
    flag: 'catalog_management',
  },
  {
    re: /\bcommitted\s+metrics\b|\breporting\s+contract\b|\bmetric\s+commitments?\b/gi,
    flag: 'committed_metrics_supported',
  },
]

/** Multipliers accepted on any count: "2M impressions", "500k", "1.5 million". */
const NUMBER_MULTIPLIERS: Readonly<Record<string, number>> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  mm: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9,
}

/* ==================================================================== *
 * Primitive helpers
 * ==================================================================== */

function mkSpan(input: string, start: number, end: number): Span {
  return { start, end, text: input.slice(start, end) }
}

/** Human-readable evidence appended to a warning: `[chars 12-30: "…"]`. */
function cite(spans: Span[]): string {
  if (spans.length === 0) return ''
  return ' ' + spans.map((s) => `[chars ${s.start}-${s.end}: ${JSON.stringify(s.text)}]`).join(' ')
}

/**
 * "2,000,000" -> 2000000, "1.5M" -> 1500000, "500 k" -> 500000.
 * Returns null when the token is not a number this engine will vouch for.
 */
function toNumber(raw: string): number | null {
  const m = /^\s*([\d,]+(?:\.\d+)?)\s*([a-z]{1,7})?\s*$/i.exec(raw)
  if (!m) return null
  const base = Number(m[1]!.replace(/,/g, ''))
  if (!Number.isFinite(base)) return null
  const suffix = m[2]?.toLowerCase()
  if (!suffix) return base
  const mult = NUMBER_MULTIPLIERS[suffix]
  return mult === undefined ? null : base * mult
}

/**
 * True when `input[i]` ends a clause.
 *
 * Three terminators, and each exclusion is deliberate:
 *   `;`               always.
 *   `.` + whitespace  a period *inside* `breitbart.com` or `0.35%` is not a
 *                     terminator, and both turn up in policy clauses.
 *   a newline that starts a blank line or a list item — a single newline in
 *                     wrapped prose is NOT a terminator. Briefs arrive wrapped,
 *                     and treating the wrap as a full stop truncates the
 *                     blocklist at the first line break, which silently drops
 *                     every category after it.
 */
function terminatesClause(input: string, i: number): boolean {
  const c = input[i]
  if (c === ';') return true
  if (c === '.') return i + 1 >= input.length || /\s/.test(input[i + 1]!)
  if (c !== '\n') return false
  const rest = input.slice(i + 1)
  return /^\s*$/.test(rest) || /^[ \t]*(?:\n|[-*•·]\s|\d+[.)]\s)/.test(rest)
}

/** Sentence spans, whitespace-trimmed. See `terminatesClause` for the rule. */
function sentenceSpans(input: string): Span[] {
  const out: Span[] = []
  let start = 0
  const push = (from: number, to: number): void => {
    let s = from
    while (s < to && /\s/.test(input[s]!)) s++
    let e = to
    while (e > s && /\s/.test(input[e - 1]!)) e--
    if (e > s) out.push(mkSpan(input, s, e))
  }
  for (let i = 0; i < input.length; i++) {
    if (terminatesClause(input, i)) {
      push(start, i + 1)
      start = i + 1
    }
  }
  push(start, input.length)
  return out
}

/** The clause running from `from` to the next clause terminator, capped. */
function clauseFrom(input: string, from: number, cap = 240): Span {
  const limit = Math.min(input.length, from + cap)
  for (let i = from; i < limit; i++) {
    if (terminatesClause(input, i)) return mkSpan(input, from, i)
  }
  return mkSpan(input, from, limit)
}

/** The sentence containing `span`, or the span itself if none contains it. */
function sentenceContaining(input: string, span: Span): Span {
  for (const sentence of sentenceSpans(input)) {
    if (sentence.start <= span.start && span.end <= sentence.end) return sentence
  }
  return span
}

/**
 * The candidate span that belongs to `target`: the first one that starts after
 * it, else the last one that ends before it. Direction matters — in "target CPM
 * of 25 and a CTR target of 0.35%" the number nearest CTR by distance is 25,
 * which belongs to the CPM in front of it.
 */
/** The candidate span closest to `target` by character distance, either side. */
function nearestSpan(target: Span, candidates: Span[]): Span | undefined {
  const distance = (c: Span): number =>
    c.start >= target.end ? c.start - target.end : target.start - c.end
  return [...candidates].sort((a, b) => distance(a) - distance(b) || a.start - b.start)[0]
}

function attachedSpan(target: Span, candidates: Span[]): Span | undefined {
  const after = candidates.filter((c) => c.start >= target.end).sort((a, b) => a.start - b.start)
  if (after.length > 0) return after[0]
  const before = candidates.filter((c) => c.end <= target.start).sort((a, b) => b.end - a.end)
  return before[0]
}

/** A window of `radius` characters either side of a span, clamped to the input. */
function windowAround(input: string, span: Span, radius: number): Span {
  return mkSpan(input, Math.max(0, span.start - radius), Math.min(input.length, span.end + radius))
}

/** All matches of `re` inside `region`, with offsets translated to the input. */
function findIn(input: string, region: Span, re: RegExp): Span[] {
  const out: Span[] = []
  for (const m of region.text.matchAll(re)) {
    const start = region.start + m.index
    out.push(mkSpan(input, start, start + m[0].length))
  }
  return out
}

/** Drop spans covered by an earlier, longer match. Keeps text order. */
function dropOverlaps(spans: Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end)
  const kept: Span[] = []
  for (const s of sorted) {
    if (kept.some((k) => s.start < k.end && k.start < s.end)) continue
    kept.push(s)
  }
  return kept
}

/** Split a captured list — "Hulu, Roku and Peacock" — into item spans. */
function listItems(input: string, region: Span): Span[] {
  const out: Span[] = []
  const parts = region.text.split(/,|\band\b|&|\/|\bor\b/gi)
  let cursor = region.start
  for (const part of parts) {
    const idx = input.indexOf(part, cursor)
    cursor = idx === -1 ? cursor : idx + part.length
    if (idx === -1) continue
    let s = idx
    let e = idx + part.length
    while (s < e && /[\s'"“”‘’:–—-]/.test(input[s]!)) s++
    while (e > s && /[\s'"“”‘’.:–—-]/.test(input[e - 1]!)) e--
    if (e - s < 2) continue
    if (/^(?:etc|the|any|all|others?)$/i.test(input.slice(s, e))) continue
    out.push(mkSpan(input, s, e))
  }
  return out
}

/* ==================================================================== *
 * The accumulator
 * ==================================================================== */

interface Acc {
  input: string
  fields: Record<string, FieldValue<unknown>>
  offered: Record<string, FieldValue<unknown>>
  warnings: string[]
}

function warn(acc: Acc, message: string, spans: Span[] = []): void {
  acc.warnings.push(`${EXTRACTOR}: ${message}${cite(spans)}`)
}

function put(acc: Acc, key: string, value: FieldValue<unknown>): void {
  // First writer wins within this module; every section owns distinct keys, and
  // a conflict inside one key is resolved by that section before it gets here.
  if (acc.fields[key] === undefined) acc.fields[key] = { ...value, extractor: EXTRACTOR }
}

function stated<T>(value: T, spans: Span[], extra: Partial<FieldValue<T>> = {}): FieldValue<T> {
  return { label: 'stated', value, spans, ...extra }
}

function derived<T>(
  value: T,
  rule: string,
  spans: Span[],
  extra: Partial<FieldValue<T>> = {},
): FieldValue<T> {
  return { label: 'derived', value, rule, spans, ...extra }
}

function missing(note: string): FieldValue<never> {
  return { label: 'missing', spans: [], note }
}

/* ==================================================================== *
 * 1. Brand safety — excluded content categories, keywords, domains
 * ==================================================================== */

/**
 * Clauses that open a blocklist. Only text *after* one of these is searched for
 * category names, so "our audience is political junkies" is never read as an
 * exclusion. `no` is included because "no news, no politics" is how planners
 * write, and it is safe: only curated category terms are matched inside.
 */
const BLOCK_TRIGGER_RE =
  /\b(?:brand[- ]safety|block(?:list|ing|ed)?|blacklist|exclu(?:de|ding|sions?|ded)|avoid(?:ing)?|suppress|steer\s+clear\s+of|keep\s+(?:us\s+)?(?:away\s+from|off)|do\s+not\s+(?:run|appear)|not\s+appear\s+(?:next\s+to|alongside|near)|unsuitable|no)\b/gi

/** "excluded categories: a, b, c" — an explicit list, whatever the words are. */
const CATEGORY_LIST_RE =
  /\b(?:excluded?|blocked?|prohibited|banned)\s+(?:content\s+)?categor(?:y|ies)\b\s*[:\-–—]?\s*([^.;\n]+)/gi

/** "negative keywords: x, y" / "keywords to avoid: x, y". */
const KEYWORD_LIST_RE =
  /\b(?:negative|blocked?|excluded?|banned|prohibited)\s+keywords?\b\s*[:\-–—]?\s*([^.;\n]+)|\bkeywords?\s+to\s+(?:block|avoid|exclude)\b\s*[:\-–—]?\s*([^.;\n]+)/gi

/** "do not run on x.com", "exclusion list: …", "block list: …". */
const DOMAIN_BLOCK_RE =
  /\b(?:do\s+not\s+run\s+(?:on|next\s+to|alongside)|exclusion\s+list|block\s?list|blacklist|no\s+ads?\s+on|exclude\s+the\s+(?:domains?|sites?|brands?))\b\s*[:\-–—]?\s*([^;\n]+)/gi

/** A bare domain token. Deliberately loose on TLD; the buyer typed it. */
const DOMAIN_TOKEN_RE = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]{2,})+\b/gi

interface CategoryHit {
  span: Span
  /** Present only for an unambiguous mapping. */
  node?: TaxonomyNode
  /** Present when more than one node is plausible. */
  candidates?: readonly TaxonomyNode[]
  /** Present when the taxonomy has no node at all. */
  why?: string
  /** Present when the phrase is a verification vendor rather than a category. */
  vendor?: string
}

function brandSafetyCategories(acc: Acc): void {
  const input = acc.input
  const clauses: Span[] = []

  for (const trig of input.matchAll(BLOCK_TRIGGER_RE)) {
    clauses.push(clauseFrom(input, trig.index + trig[0].length))
  }
  // An explicit "excluded categories: …" list is its own clause, so the items
  // are read even when none of them is in the taxonomy.
  const explicitLists: Span[] = []
  for (const m of input.matchAll(CATEGORY_LIST_RE)) {
    const listStart = input.indexOf(m[1]!, m.index)
    if (listStart >= 0) explicitLists.push(mkSpan(input, listStart, listStart + m[1]!.length))
  }

  const hits: CategoryHit[] = []
  const seenStarts = new Set<number>()
  const addHits = (found: Span[], make: (s: Span) => CategoryHit): void => {
    for (const s of found) {
      if (seenStarts.has(s.start)) continue
      seenStarts.add(s.start)
      hits.push(make(s))
    }
  }

  for (const clause of [...clauses, ...explicitLists]) {
    for (const entry of MAPPED_CATEGORY_TERMS) {
      addHits(findIn(input, clause, entry.re), (span) => ({ span, node: entry.node }))
    }
    for (const entry of AMBIGUOUS_CATEGORY_TERMS) {
      addHits(findIn(input, clause, entry.re), (span) => ({ span, candidates: entry.candidates }))
    }
    for (const entry of UNMAPPED_CATEGORY_TERMS) {
      addHits(findIn(input, clause, entry.re), (span) => ({ span, why: entry.why }))
    }
    for (const entry of VENDORS) {
      addHits(findIn(input, clause, entry.re), (span) => ({ span, vendor: entry.name }))
    }
  }

  // Items of an explicit list that no pattern above claimed: the buyer's words,
  // kept verbatim. This is the "keep the buyer's words and warn" path.
  for (const list of explicitLists) {
    for (const item of listItems(input, list)) {
      const claimed = hits.some((h) => h.span.start < item.end && item.start < h.span.end)
      if (claimed) continue
      if (seenStarts.has(item.start)) continue
      seenStarts.add(item.start)
      hits.push({
        span: item,
        why: 'no node of the vendored IAB Content Taxonomy 3.1 table carries this name',
      })
    }
  }

  const ordered = dropOverlaps(hits.map((h) => h.span)).map((s) =>
    hits.find((h) => h.span.start === s.start && h.span.end === s.end)!,
  )

  if (ordered.length === 0) {
    // "brand safety controls" with nothing named is the single most common way
    // a brief loses its brand-safety requirement: AAMP's excluded_categories
    // defaults to [] and the seller hears nothing at all.
    const asked = [
      ...input.matchAll(/\bbrand[- ]safety\b(?:\s+(?:controls?|requirements?|standards?))?/gi),
    ]
    if (asked.length > 0) {
      const spans = asked.map((m) => mkSpan(input, m.index, m.index + m[0].length))
      put(
        acc,
        'excluded_content_categories',
        missing(
          'Brand safety was requested but no categories were named, so nothing is emitted; AAMP `brand_safety.excluded_categories` defaults to [] and AdCP `get_products` has no brand-safety field at all.',
        ),
      )
      warn(
        acc,
        'brand safety is asked for but no content category is named. AAMP `brand_safety.excluded_categories` defaults to an empty list, so the requirement reaches the seller as nothing; name the categories to exclude.',
        spans,
      )
    }
    return
  }

  const values: string[] = []
  const raws: string[] = []
  const spans: Span[] = []
  const rules: string[] = []
  let anyMapped = false
  let anyVerbatim = false

  for (const hit of ordered) {
    if (hit.vendor) {
      warn(
        acc,
        `'${hit.span.text}' is a verification vendor (${hit.vendor}), not an IAB content category; it is recorded here and mapped to no taxonomy ID. Name the categories you want blocked, and put the vendor on a performance standard (metric + threshold + vendor) if you need it enforced.`,
        [hit.span],
      )
      continue
    }
    spans.push(hit.span)
    raws.push(hit.span.text)
    if (hit.node) {
      anyMapped = true
      values.push(hit.node.id)
      rules.push(`'${hit.span.text}' -> IAB Content Taxonomy ${hit.node.id} (${hit.node.name})`)
      continue
    }
    anyVerbatim = true
    values.push(hit.span.text)
    if (hit.candidates) {
      warn(
        acc,
        `'${hit.span.text}' matches ${hit.candidates.length} IAB Content Taxonomy nodes (${hit.candidates
          .map((c) => `${c.id} ${c.name}`)
          .join(
            '; ',
          )}); the engine will not choose one, so your words are carried through unmapped.`,
        [hit.span],
      )
    } else if (hit.why) {
      warn(
        acc,
        `'${hit.span.text}' has no IAB Content Taxonomy ID: ${hit.why}. Your words are carried through as written; a seller matching on taxonomy IDs will not act on them.`,
        [hit.span],
      )
    }
  }

  if (values.length === 0) return

  const note = anyVerbatim
    ? "Entries that are not taxonomy IDs are the buyer's own words. AAMP's `brand_safety.excluded_categories` is `list[str]` and accepts them without validation; a seller matching on IAB IDs will ignore them. AdCP `get_products` has no field for any of this."
    : 'AdCP `get_products` has no brand-safety exclusion field, so these travel on the AAMP side only (or as prose in the AdCP `brief` string).'

  put(
    acc,
    'excluded_content_categories',
    anyMapped
      ? derived(values, `IAB Content Taxonomy 3.1 lookup: ${rules.join('; ')}`, spans, {
          note,
          raw: raws,
        })
      : stated(values, spans, { note, raw: raws }),
  )
}

function excludedKeywords(acc: Acc): void {
  const input = acc.input
  const spans: Span[] = []
  const values: string[] = []
  for (const m of input.matchAll(KEYWORD_LIST_RE)) {
    const captured = m[1] ?? m[2]
    if (!captured) continue
    const start = input.indexOf(captured, m.index)
    if (start < 0) continue
    for (const item of listItems(input, mkSpan(input, start, start + captured.length))) {
      spans.push(item)
      values.push(item.text)
    }
  }
  if (values.length === 0) return
  put(
    acc,
    'excluded_keywords',
    stated(values, spans, {
      note: 'AdCP `filters.keywords` is positive targeting with no negation, so keyword blocks travel on the AAMP side only.',
    }),
  )
}

function excludedDomains(acc: Acc): void {
  const input = acc.input
  const spans: Span[] = []
  const values: string[] = []
  const seen = new Set<string>()
  for (const m of input.matchAll(DOMAIN_BLOCK_RE)) {
    const captured = m[1]
    if (!captured) continue
    const start = input.indexOf(captured, m.index)
    if (start < 0) continue
    const region = mkSpan(input, start, start + captured.length)
    const domains = findIn(input, region, DOMAIN_TOKEN_RE)
    const items = domains.length > 0 ? domains : listItems(input, region)
    for (const item of items) {
      if (seen.has(item.text.toLowerCase())) continue
      seen.add(item.text.toLowerCase())
      spans.push(item)
      values.push(item.text)
    }
  }
  if (values.length === 0) return
  put(
    acc,
    'excluded_domains',
    stated(values, spans, {
      note: 'AdCP `property_list` is an allow-list reference; the inverse is not expressible in `get_products`, so this travels on the AAMP side only.',
    }),
  )
}

/* ==================================================================== *
 * 2. Frequency cap
 * ==================================================================== */

/**
 * A frequency cap, assembled from six optional-ish parts. Built from an array
 * of commented fragments because a single literal at this size is unreadable,
 * and this file is the product.
 *
 *   1 prefix   the cap intent: "frequency cap", "no more than", "max"
 *   2 count    the impression count      -> FrequencyCap.max_impressions
 *   3 noun     "x", "impressions", "exposures" — evidence this is a cap
 *   4 scope    "per user", "/user", "per household" — same
 *   5 multiple "per 2 weeks"             -> multiplies the period
 *   6 unit     hour | day | week | month | quarter | year | flight | campaign
 *
 * A match is only accepted when at least one of prefix / noun / scope is
 * present, so "November 1 - December 31" and "adults 25-54" cannot become caps.
 */
const FREQUENCY_CAP_RE = new RegExp(
  [
    // 1 — cap intent (optional)
    '(frequency\\s*cap(?:ped)?|freq\\.?\\s*cap|cap(?:ped)?|no\\s+more\\s+than|limit(?:ed)?|max(?:imum)?|up\\s+to)?',
    // connector after the intent: "of", "at", ":", "="
    '(?:\\s*(?:of|at|to|is|:|=))?\\s*',
    // 2 — the count
    '(\\d{1,4})\\s*',
    // 3 — unit noun / multiplication sign (optional)
    '(x|times|impressions?|imps?|exposures?|views?|ads?|spots?)?',
    // 4 — per-user scope (optional): " per user", "/user", ", per household"
    '(?:(?:\\s*[/,]\\s*|\\s*per\\s+)(users?|persons?|people|households?|hh|devices?|viewers?|cookies?|profiles?)\\b)?',
    // period connector: a slash on its own means "per"
    '(?:\\s*[/,]\\s*|\\s*(?:per|a|an|every|each)\\s+)',
    // 5 — period multiple (optional): "per 2 weeks"
    '(\\d{1,2}\\s*)?',
    // 6 — the period unit
    '(hour|day|week|month|quarter|year|flight|campaign)s?\\b',
  ].join(''),
  'gi',
)

function frequencyCap(acc: Acc): void {
  const input = acc.input
  interface Candidate {
    span: Span
    max: number
    unit: string
    multiple: number
  }
  const candidates: Candidate[] = []

  for (const m of input.matchAll(FREQUENCY_CAP_RE)) {
    const [whole, prefix, count, noun, scope, multiple, unit] = m
    // Guard: something in the sentence has to say "this is a cap".
    if (!prefix && !noun && !scope) continue
    const max = Number(count)
    if (!Number.isInteger(max) || max <= 0) continue
    const mult = multiple ? Number(multiple.trim()) : 1
    if (!Number.isInteger(mult) || mult <= 0) continue
    candidates.push({
      span: mkSpan(input, m.index, m.index + whole.length),
      max,
      unit: unit!.toLowerCase(),
      multiple: mult,
    })
  }

  if (candidates.length === 0) return

  // Two different caps in one brief is an ambiguity, not an average.
  const signature = (c: Candidate): string => `${c.max}/${c.multiple}${c.unit}`
  const distinct = new Map<string, Candidate>()
  for (const c of candidates) if (!distinct.has(signature(c))) distinct.set(signature(c), c)
  if (distinct.size > 1) {
    const all = [...distinct.values()]
    put(
      acc,
      'frequency_cap',
      missing(
        `Two or more different frequency caps are stated (${all
          .map((c) => c.span.text.trim())
          .join(' / ')}); AAMP carries exactly one \`FrequencyCap\`, so the engine emits none.`,
      ),
    )
    warn(
      acc,
      `${all.length} different frequency caps are stated and AAMP's \`frequency_cap\` holds one. Nothing was emitted; state a single cross-channel cap, or split the campaign.`,
      all.map((c) => c.span),
    )
    return
  }

  const c = [...distinct.values()][0]!

  if (c.unit === 'flight' || c.unit === 'campaign') {
    put(
      acc,
      'frequency_cap',
      missing(
        "A per-flight frequency cap needs the flight length in hours, which depends on the flight dates rather than on this clause; AAMP's `period_hours` cannot be filled from the text alone.",
      ),
    )
    warn(
      acc,
      "the frequency cap is expressed per flight. AAMP's `FrequencyCap.period_hours` is an integer count of hours, so this needs the flight length; state the cap per day or per week, or accept a computed value once the dates are fixed.",
      [c.span],
    )
    return
  }

  const exact = EXACT_PERIOD_HOURS[c.unit]
  if (exact) {
    const hours = exact.hours * c.multiple
    const rule =
      c.multiple === 1
        ? `${exact.rule}; max_impressions is the stated count ${c.max}`
        : `${exact.rule}, x${c.multiple} for '${c.multiple} ${c.unit}s' -> period_hours: ${hours}; max_impressions is the stated count ${c.max}`
    put(
      acc,
      'frequency_cap',
      derived({ max_impressions: c.max, period_hours: hours }, rule, [c.span], {
        raw: [c.span.text],
        note: "AdCP `get_products` has no frequency field — `enums/frequency-cap-scope.json` applies to a media buy's packages — so a frequency requirement cannot influence which products are returned.",
      }),
    )
    return
  }

  const approx = APPROX_PERIOD_HOURS[c.unit]
  if (approx) {
    const hours = approx.hours * c.multiple
    // OFF BY DEFAULT: an engine-picked number goes to `offered`, never `fields`.
    acc.offered.frequency_cap = {
      label: 'assumed',
      value: { max_impressions: c.max, period_hours: hours },
      rule: `${approx.rule}; max_impressions is the stated count ${c.max}`,
      spans: [c.span],
      extractor: EXTRACTOR,
      raw: [c.span.text],
    }
    put(
      acc,
      'frequency_cap',
      missing(
        `'${c.span.text.trim()}' has no exact hour count. ${approx.rule}. A value is offered but not written; accept it explicitly to use it.`,
      ),
    )
    warn(
      acc,
      `the frequency cap period '${c.unit}' has no exact hour count and AAMP's \`period_hours\` is an integer. ${approx.rule}. The engine offers ${hours} and writes nothing; state the cap in days or weeks to remove the ambiguity.`,
      [c.span],
    )
  }
}

/* ==================================================================== *
 * 3. Pacing
 * ==================================================================== */

function pacing(acc: Acc): void {
  const input = acc.input
  const found: { span: Span; value: string; exact: boolean; rule?: string }[] = []
  for (const entry of PACING_PATTERNS) {
    for (const m of input.matchAll(entry.re)) {
      found.push({
        span: mkSpan(input, m.index, m.index + m[0].length),
        value: entry.value,
        exact: entry.exact,
        rule: entry.rule,
      })
    }
  }

  const unrepresentable = [...input.matchAll(PACING_UNREPRESENTABLE_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )

  if (found.length === 0) {
    if (unrepresentable.length > 0) {
      put(
        acc,
        'pacing_model',
        missing(
          'ASAP pacing has no AAMP `PacingModel` value (EVEN | FRONT_LOADED | BACK_LOADED | CUSTOM) and `pacing_model` has no AdCP `get_products` binding, so the instruction is unrepresentable on both wires. AAMP will apply its EVEN default.',
        ),
      )
      warn(
        acc,
        "ASAP pacing is stated and cannot be expressed: AdCP's `enums/pacing.json` has `asap` but that enum is a media-buy package field, and AAMP's `PacingModel` has no ASAP value. AAMP will silently apply EVEN.",
        unrepresentable,
      )
    }
    return
  }

  const values = new Set(found.map((f) => f.value))
  if (values.size > 1) {
    put(
      acc,
      'pacing_model',
      missing(
        `Two different pacing models are stated (${[...values].join(', ')}); the engine picks neither.`,
      ),
    )
    warn(
      acc,
      `pacing is stated ${values.size} different ways (${[...values].join(
        ', ',
      )}). AAMP carries one \`pacing_model\`; nothing was emitted, and AAMP's EVEN default will apply unless you resolve it.`,
      found.map((f) => f.span),
    )
    return
  }

  const first = found[0]!
  const spans = found.map((f) => f.span)
  put(
    acc,
    'pacing_model',
    first.exact
      ? stated(first.value, spans, { raw: [first.span.text] })
      : derived(first.value, first.rule!, spans, { raw: [first.span.text] }),
  )
  if (unrepresentable.length > 0) {
    warn(
      acc,
      'ASAP-style pacing language appears alongside a pacing model AAMP can hold; only the AAMP value was emitted, and the ASAP instruction is lost.',
      unrepresentable,
    )
  }
}

/* ==================================================================== *
 * 4. Approval gates
 * ==================================================================== */

/** Any clause worth reading for approval intent. */
const APPROVAL_CONTEXT_RE =
  /\bapprov(?:e|es|ed|al|als)\b|\bsign[- ]?off\b|\bsigns?\s+off\b|\bhuman\s+in\s+the\s+loop\b|\bautonomous(?:ly)?\b|\bautomat(?:ed|ic|ically)\b|\bunattended\b|\bwithout\s+asking\b|\breview(?:ed|s)?\b/i

/** Negative polarity: the gate is OPEN (no human required) -> false. */
const APPROVAL_NEGATIVE_RE =
  /\bwithout\s+(?:human\s+)?(?:approval|sign[- ]?off|review|asking|us|a\s+human)\b|\bno\s+(?:human\s+)?(?:approval|sign[- ]?off|review)\s+(?:is\s+)?(?:required|needed)?\b|\bdoes\s?n[o']?t\s+(?:need|require)\s+(?:approval|sign[- ]?off|review)\b|\bfully\s+automat(?:ed|ic)\b|\bno\s+human\s+in\s+the\s+loop\b|\bunattended\b|\bautonomous(?:ly)?\b|\bmay\s+\w+\s+without\b/i

/**
 * Positive polarity: the gate is CLOSED (a human must act) -> true.
 * The lookbehind on "human in the loop" is load-bearing: without it, "no human
 * in the loop" fires both polarities and every gate reads as contradictory.
 */
const APPROVAL_POSITIVE_RE =
  /\bmust\s+be\s+(?:approved|reviewed|signed\s+off)\b|\brequires?\s+(?:human\s+)?(?:approval|sign[- ]?off|review)\b|\b(?:approvals?|sign[- ]?off|review)\b[^.;\n]{0,40}?\bis\s+(?:required|needed|mandatory)\b|(?<!\bno\s)(?<!\bwithout\s(?:any\s)?)\bhuman\s+in\s+the\s+loop\b|\bnothing\s+\w+\s+without\s+(?:approval|sign[- ]?off)\b|\bmust\s+(?:be\s+)?(?:reviewed|approved)\b|\bwe\s+(?:sign\s+off|approve)\b/i

/** Which of the four gates a clause names. */
const APPROVAL_STAGES: readonly { key: string; re: RegExp; label: string }[] = [
  {
    key: 'approval_plan_review',
    re: /\bplan\s+(?:review|approval|sign[- ]?off)\b|\b(?:review|approve|sign\s+off\s+on)\s+the\s+(?:media\s+)?plan\b|\bthe\s+plan\s+must\s+be\s+reviewed\b|\bmedia\s+plan\b/i,
    label: 'plan_review',
  },
  {
    key: 'approval_booking',
    re: /\bbook(?:ing|s|ed)?\b|\bpurchase\s+order\b|\bplace\s+the\s+(?:buy|order)\b|\bcommit\s+(?:the\s+)?(?:spend|budget)\b|\btraffick?(?:ing)?\b/i,
    label: 'booking',
  },
  {
    key: 'approval_creative',
    re: /\bcreatives?\b/i,
    label: 'creative',
  },
  {
    key: 'approval_pacing_adjustment',
    re: /\bpacing\s+(?:adjust(?:ment)?s?|changes?)\b|\breallocat(?:e|ion|ing)\b|\bshift(?:ing)?\s+(?:budget|spend)\b|\bmove\s+budget\b|\bre-?balanc(?:e|ing)\b/i,
    label: 'pacing_adjustment',
  },
]

/** "fully automated", "no human in the loop" — applies to all four gates. */
const APPROVAL_GLOBAL_RE =
  /\bfully\s+automat(?:ed|ic)\b|\bend[- ]to[- ]end\s+automat(?:ed|ion)\b|\bno\s+human\s+(?:in\s+the\s+loop|involvement|oversight)\b|\bwithout\s+any\s+human\b|\bhuman\s+in\s+the\s+loop\s+(?:on|for|at)\s+(?:everything|every\s+stage|all\s+stages)\b|\ball\s+(?:four\s+)?approval\s+gates\b|\bevery\s+stage\s+(?:needs|requires)\s+(?:approval|sign[- ]?off)\b/i

function approvals(acc: Acc): void {
  const input = acc.input
  // key -> { value, spans, derivedRule? }
  const decisions = new Map<string, { value: boolean; spans: Span[]; rule?: string }>()
  const conflicts = new Set<string>()

  for (const sentence of sentenceSpans(input)) {
    if (!APPROVAL_CONTEXT_RE.test(sentence.text)) continue

    // Polarity. Positive is tested first so "nothing books without sign-off"
    // reads as a closed gate rather than an open one.
    const positive = APPROVAL_POSITIVE_RE.test(sentence.text)
    const negative = APPROVAL_NEGATIVE_RE.test(sentence.text)
    if (positive === negative) {
      // Either both readings fire or neither does. Both is a real ambiguity;
      // neither means the sentence mentions approval without deciding anything.
      if (positive && negative) {
        warn(
          acc,
          'this sentence reads both ways on human approval (it contains a requirement and a waiver); no approval gate was set from it.',
          [sentence],
        )
      }
      continue
    }
    const value = positive

    const named = APPROVAL_STAGES.filter((s) => s.re.test(sentence.text))
    const global = APPROVAL_GLOBAL_RE.test(sentence.text)

    // One polarity, two named stages: "plan review is required before booking"
    // states a gate on the plan and merely mentions booking. Which one the
    // buyer meant is not recoverable from the sentence, so the engine sets
    // neither. Setting both would close a gate nobody asked to close.
    if (!global && named.length > 1) {
      warn(
        acc,
        `this sentence names ${named.length} approval gates (${named
          .map((s) => s.label)
          .join(
            ', ',
          )}) and one polarity, so it is not clear which gate it governs. None was set; state one gate per sentence.`,
        [sentence],
      )
      continue
    }

    const targets = named.length > 0 && !global ? named : global ? APPROVAL_STAGES : []
    if (targets.length === 0) continue

    const rule =
      named.length > 0 && !global
        ? undefined
        : `'${sentence.text.trim()}' names no single stage, so all four AAMP approval gates (plan_review, booking, creative, pacing_adjustment) are set to ${value}`

    for (const target of targets) {
      const prior = decisions.get(target.key)
      if (prior && prior.value !== value) {
        conflicts.add(target.key)
        continue
      }
      if (prior) {
        prior.spans.push(sentence)
        continue
      }
      decisions.set(target.key, { value, spans: [sentence], rule })
    }
  }

  for (const key of conflicts) {
    decisions.delete(key)
    const stage = APPROVAL_STAGES.find((s) => s.key === key)!
    put(
      acc,
      key,
      missing(
        `The brief both requires and waives human approval for ${stage.label}; the engine emits neither, and AAMP's own default (${
          key === 'approval_creative' || key === 'approval_pacing_adjustment' ? 'false' : 'true'
        }) will apply.`,
      ),
    )
    warn(
      acc,
      `human approval for ${stage.label} is both required and waived in the same brief. Nothing was emitted; AAMP's default applies, which is the outcome nobody agreed to.`,
    )
  }

  for (const [key, decision] of decisions) {
    put(
      acc,
      key,
      decision.rule
        ? derived(decision.value, decision.rule, decision.spans)
        : stated(decision.value, decision.spans),
    )
  }
}

/* ==================================================================== *
 * 5. Deal preferences: CPM ceiling, impression floors
 * ==================================================================== */

/** A CPM mention with a number attached, either order: "$32 CPM", "CPM of 32". */
const CPM_RE =
  /(?:\bcpm\b\s*(?:of|at|is|:|=)?\s*[$£€]?\s*(\d[\d,]*(?:\.\d+)?)|[$£€]?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:usd|eur|gbp)?\s*\bcpms?\b)/gi

/** Words that make a CPM a ceiling (a DealPreferences.max_cpm). */
const CPM_CEILING_RE =
  /\bmax(?:imum)?\b|\bceiling\b|\bcap(?:ped)?\b|\bno\s+more\s+than\b|\bnot\s+(?:to\s+)?exceed\b|\bunder\b|\bbelow\b|\bup\s+to\b|\bat\s+most\b/i

/** Words that make a CPM a target (a KPI), which is a different field entirely. */
const CPM_TARGET_RE = /\btarget\b|\bgoal\b|\bkpi\b|\bbenchmark\b|\bdeliver\s+at\b|\baiming\s+for\b/i

function cpmCeiling(acc: Acc): void {
  const input = acc.input
  const hits: { span: Span; value: number; ceiling: boolean; target: boolean }[] = []
  for (const m of input.matchAll(CPM_RE)) {
    const raw = m[1] ?? m[2]
    if (!raw) continue
    const value = toNumber(raw)
    if (value === null || value <= 0) continue
    const span = mkSpan(input, m.index, m.index + m[0].length)
    const context = windowAround(input, span, 40).text
    hits.push({
      span,
      value,
      ceiling: CPM_CEILING_RE.test(context),
      target: CPM_TARGET_RE.test(context),
    })
  }
  if (hits.length === 0) return

  const ceilings = hits.filter((h) => h.ceiling && !h.target)
  const ambiguous = hits.filter((h) => h.ceiling && h.target)
  const bare = hits.filter((h) => !h.ceiling && !h.target)

  for (const h of ambiguous) {
    warn(
      acc,
      `this CPM is described as both a target and a ceiling; a target is an AAMP KPI (kpis[].metric = CPM) and a ceiling is \`deal_preferences.max_cpm\`. The engine emits neither.`,
      [h.span],
    )
  }
  for (const h of bare) {
    warn(
      acc,
      `a CPM of ${h.value} is stated with no word saying whether it is a ceiling or a target. AAMP holds those in two different fields (\`deal_preferences.max_cpm\` vs \`kpis[]\`), so the engine emits neither; say "max CPM" or "target CPM".`,
      [h.span],
    )
  }

  const distinct = [...new Set(ceilings.map((h) => h.value))]
  if (distinct.length > 1) {
    put(
      acc,
      'deal_max_cpm',
      missing(
        `Two different CPM ceilings are stated (${distinct.join(', ')}); the engine picks neither.`,
      ),
    )
    warn(
      acc,
      'more than one CPM ceiling is stated; nothing was emitted.',
      ceilings.map((h) => h.span),
    )
    return
  }
  if (distinct.length === 1) {
    const spans = ceilings.map((h) => h.span)
    put(
      acc,
      'deal_max_cpm',
      stated(distinct[0]!, spans, {
        raw: spans.map((s) => s.text),
        note: 'AdCP has no unit-price ceiling anywhere in `get_products` — `filters.budget_range` bounds total spend, not CPM — so this travels on the AAMP side only. The currency comes from the brief-level `currency` field, not from this clause.',
      }),
    )
  }
}

/** A count of impressions or exposures, with optional k/M/bn multiplier. */
const IMPRESSION_COUNT_RE =
  /(\d[\d,]*(?:\.\d+)?)\s*(k|m|mm|bn|b|thousand|million|billion)?\s*(impressions?|imps?|exposures?)\b/gi

/** Words that make a count a floor rather than a forecast. */
const FLOOR_TRIGGER_RE =
  /\bmin(?:imum|\.)?\b|\bat\s+least\b|\bno\s+(?:less|fewer)\s+than\b|\bfloor\b|\bnothing\s+(?:under|below)\b|\bunder\b|\bbelow\b/i

/** Signals the floor is commercial: AAMP `deal_preferences.min_impressions`. */
const DEAL_SCOPE_RE =
  /\bper\s+deal\b|\bdeals?\b|\bper\s+(?:line|package|placement)\b|\bworth\s+trafficking\b/i

/** Signals the floor is a measurement threshold: AdCP `filters.min_exposures`. */
const MEASUREMENT_SCOPE_RE =
  /\bmeasurement\b|\bvalidity\b|\bstatistical\b|\bsignificance\b|\blift\s+study\b|\bcell\s+size\b|\bread\b|\bpowered?\b|\bexposures?\b/i

function impressionFloors(acc: Acc): void {
  const input = acc.input
  for (const m of input.matchAll(IMPRESSION_COUNT_RE)) {
    const span = mkSpan(input, m.index, m.index + m[0].length)
    const context = windowAround(input, span, 60)
    if (!FLOOR_TRIGGER_RE.test(context.text)) continue
    const value = toNumber(`${m[1]!}${m[2] ? ' ' + m[2] : ''}`)
    if (value === null || value <= 0) continue
    const rounded = Math.round(value)

    const commercial = DEAL_SCOPE_RE.test(context.text)
    const measurement = MEASUREMENT_SCOPE_RE.test(context.text)

    // The field map keeps these apart on purpose: `min_exposures` is a
    // measurement-validity threshold, `deal_preferences.min_impressions` is a
    // commercial floor. Two numbers that look alike and mean different things.
    if (commercial && !measurement) {
      put(
        acc,
        'deal_min_impressions',
        stated(rounded, [span], {
          raw: [span.text],
          note: 'A commercial floor. Deliberately not written to AdCP `filters.min_exposures`, which is a measurement-validity threshold; AdCP has no commercial volume floor.',
        }),
      )
      continue
    }
    if (measurement && !commercial) {
      put(
        acc,
        'min_exposures',
        stated(rounded, [span], {
          raw: [span.text],
          note: 'A measurement-validity threshold. Deliberately not written to AAMP `deal_preferences.min_impressions`, which is a commercial floor.',
        }),
      )
      continue
    }
    const note = commercial
      ? 'The clause reads as both a commercial floor and a measurement threshold.'
      : 'The clause says neither "per deal" nor "for measurement".'
    put(
      acc,
      'deal_min_impressions',
      missing(
        `${note} AAMP \`deal_preferences.min_impressions\` (a commercial floor) and AdCP \`filters.min_exposures\` (a measurement threshold) are different fields; the engine will not choose between them.`,
      ),
    )
    put(
      acc,
      'min_exposures',
      missing(
        `${note} See \`deal_min_impressions\`: the same number could belong to either field and the engine picks neither.`,
      ),
    )
    warn(
      acc,
      `an impression floor of ${rounded.toLocaleString('en-US')} is stated without saying whether it is a commercial minimum per deal (AAMP \`deal_preferences.min_impressions\`) or a measurement-validity threshold (AdCP \`filters.min_exposures\`). Those are different fields and the engine will not guess.`,
      [span],
    )
  }
}

/* ==================================================================== *
 * 6. Exclusivity
 * ==================================================================== */

const EXCLUSIVITY_CATEGORY_RE =
  /\bcategory[- ]exclusiv(?:e|ity)\b|\bexclusive\s+(?:to|within)\s+(?:our|the|my)\s+(?:category|vertical)\b|\bone\s+(?:advertiser|brand)\s+per\s+category\b|\bcategory\s+exclusivity\b/gi
const EXCLUSIVITY_SOLE_RE =
  /\bsole\s+sponsor(?:ship)?\b|\bonly\s+advertiser\b|\bexclusive\s+sponsorship\b|\b100%\s+share\s+of\s+voice\b/gi
const EXCLUSIVITY_NONE_RE =
  /\bno\s+exclusivity\s+(?:required|needed)\b|\bexclusivity\s+(?:is\s+)?not\s+(?:required|needed)\b|\bnon[- ]exclusive\b/gi
/** Bare mentions: real intent, two possible enum values, so the engine stops. */
const EXCLUSIVITY_BARE_RE = /\bexclusiv(?:e|ity)\b|\btakeover\b|\broad\s?block\b/gi

function exclusivity(acc: Acc): void {
  const input = acc.input
  const category = [...input.matchAll(EXCLUSIVITY_CATEGORY_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )
  const sole = [...input.matchAll(EXCLUSIVITY_SOLE_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )
  const none = [...input.matchAll(EXCLUSIVITY_NONE_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )

  const decided = [
    ...category.map((s) => ({ span: s, value: 'category' })),
    ...sole.map((s) => ({ span: s, value: 'exclusive' })),
    ...none.map((s) => ({ span: s, value: 'none' })),
  ].sort((a, b) => a.span.start - b.span.start)

  if (decided.length > 0) {
    const values = new Set(decided.map((d) => d.value))
    if (values.size > 1) {
      put(
        acc,
        'exclusivity',
        missing(
          `Exclusivity is stated ${values.size} different ways (${[...values].join(
            ', ',
          )}); \`filters.exclusivity\` is a single enum and the engine picks none.`,
        ),
      )
      warn(
        acc,
        `exclusivity is stated as ${[...values].join(' and ')}; AdCP \`filters.exclusivity\` takes one value. Nothing was emitted.`,
        decided.map((d) => d.span),
      )
      return
    }
    put(
      acc,
      'exclusivity',
      stated(
        decided[0]!.value,
        decided.map((d) => d.span),
        {
          raw: decided.map((d) => d.span.text),
          note: 'AAMP has no exclusivity concept, so a category conflict is unrepresentable in its brief.',
        },
      ),
    )
    return
  }

  const bare = [...input.matchAll(EXCLUSIVITY_BARE_RE)]
    .map((m) => mkSpan(input, m.index, m.index + m[0].length))
    .filter((s) => !decided.some((d) => d.span.start <= s.start && s.end <= d.span.end))
  if (bare.length === 0) return
  put(
    acc,
    'exclusivity',
    missing(
      "Exclusivity is asked for without saying which kind. AdCP `enums/exclusivity.json` is none | category | exclusive — 'category' is one advertiser per industry, 'exclusive' is sole sponsorship — and the engine will not choose.",
    ),
  )
  warn(
    acc,
    "exclusivity is mentioned but not specified. AdCP `filters.exclusivity` is none | category | exclusive; 'category' (one advertiser per industry) and 'exclusive' (sole sponsorship) are different asks and price differently.",
    bare,
  )
}

/* ==================================================================== *
 * 7. Required protocol features
 * ==================================================================== */

/** A capability requirement needs a requirement verb; a passing mention is not one. */
const FEATURE_REQUIREMENT_RE =
  /\bmust\b|\brequires?\b|\brequired\b|\bneeds?\b|\bhonou?rs?\b|\bsupports?\b|\bhas\s+to\b|\bshould\b/i

function requiredFeatures(acc: Acc): void {
  const input = acc.input
  const flags: Record<string, boolean> = {}
  const spans: Span[] = []
  for (const sentence of sentenceSpans(input)) {
    if (!FEATURE_REQUIREMENT_RE.test(sentence.text)) continue
    for (const feature of MEDIA_BUY_FEATURES) {
      for (const span of findIn(input, sentence, feature.re)) {
        flags[feature.flag] = true
        spans.push(span)
      }
    }
  }
  if (spans.length === 0) return
  put(
    acc,
    'required_features',
    stated(flags, spans, {
      raw: spans.map((s) => s.text),
      note: 'Exactly four flags exist at AdCP 3.1.10 and only flags set to true filter. A seller declaring a feature true MUST honour requests using it.',
    }),
  )
}

/* ==================================================================== *
 * 8. Required reporting metrics
 * ==================================================================== */

/** The clause has to be about reporting, or every metric noun is a false hit. */
const REPORTING_TRIGGER_RE =
  /\b(?:must|has\s+to|have\s+to|need\s+to|needs\s+to|should|able\s+to|required\s+to)\s+(?:be\s+able\s+to\s+)?report\b|\breporting\s+(?:must|should|has\s+to)\s+(?:include|cover|carry)\b|\breport(?:ing)?\s+on\b|\bdelivery\s+reports?\s+(?:must\s+)?includ\w*\b|\brequire\s+reporting\b|\breporting\s+requirements?\b/gi

function requiredMetrics(acc: Acc): void {
  const input = acc.input
  const values: string[] = []
  const spans: Span[] = []
  const rules: string[] = []
  let anyMapped = false

  for (const trigger of input.matchAll(REPORTING_TRIGGER_RE)) {
    const clause = clauseFrom(input, trigger.index + trigger[0].length)
    const hits: { span: Span; value: string; exact: boolean; rule?: string }[] = []
    for (const metric of AVAILABLE_METRICS) {
      for (const span of findIn(input, clause, metric.re)) {
        hits.push({ span, value: metric.value, exact: metric.exact, rule: metric.rule })
      }
    }
    for (const span of dropOverlaps(hits.map((h) => h.span))) {
      const hit = hits.find((h) => h.span.start === span.start && h.span.end === span.end)!
      if (values.includes(hit.value)) continue
      values.push(hit.value)
      spans.push(span)
      if (!hit.exact) {
        anyMapped = true
        rules.push(hit.rule!)
      }
    }
  }

  if (values.length === 0) return
  put(
    acc,
    'required_metrics',
    anyMapped
      ? derived(values, `AdCP available-metric vocabulary: ${rules.join('; ')}`, spans, {
          raw: spans.map((s) => s.text),
        })
      : stated(values, spans, {
          raw: spans.map((s) => s.text),
          note: "The product's declared `available_metrics` becomes the binding reporting contract for the resulting media buy. AAMP has no way to require that anyone can report a metric.",
        }),
  )
}

/* ==================================================================== *
 * 9. Required performance standards — and the attribution-window trap
 * ==================================================================== */

/** A percentage: "70%", "70 %", "0.5%". */
const PERCENT_RE = /(\d{1,3}(?:\.\d+)?)\s*%/g
/** MRC / GroupM, required by AdCP whenever the metric is `viewability`. */
const VIEWABILITY_STANDARD_RE = /\b(mrc)\b|\b(group\s?m)\b/gi
/**
 * A word that turns a number next to a metric into a requirement.
 *
 * Threshold-flavoured words only: a bare "must" or "required" is not enough.
 * "The seller must report viewability" is a *reporting* requirement — it
 * belongs to `filters.required_metrics` — and reading it as a performance
 * standard would attach whatever percentage happened to be in the sentence to
 * a threshold nobody stated.
 */
const PERF_REQUIREMENT_RE =
  /\bmin(?:imum|\.)?\b|\bat\s+least\b|\bfloor\b|\bthreshold\b|\bguarantee\w*\b|\bno\s+(?:less|lower|more|higher)\s+than\b|\bunder\b|\bbelow\b|\babove\b|\bover\b|\bstandard\b|\bnot\s+(?:to\s+)?exceed\b|\bcapped\s+at\b/i

function performanceStandards(acc: Acc): void {
  const input = acc.input
  const entries: Record<string, unknown>[] = []
  const spans: Span[] = []
  const rules: string[] = []
  const claimed: Span[] = []
  /** Vendors named by brand name with no domain in the brief. See below. */
  const vendorOffers: { metric: string; name: string; domain: string; span: Span }[] = []

  const metricHits: { span: Span; metric: (typeof PERFORMANCE_METRICS)[number] }[] = []
  for (const metric of PERFORMANCE_METRICS) {
    for (const m of input.matchAll(metric.re)) {
      metricHits.push({ span: mkSpan(input, m.index, m.index + m[0].length), metric })
    }
  }
  for (const span of dropOverlaps(metricHits.map((h) => h.span))) {
    const hit = metricHits.find((h) => h.span.start === span.start && h.span.end === span.end)!
    // Sentence-scoped, not window-scoped. A percentage in the *next* sentence
    // belongs to that sentence; borrowing it invents a threshold.
    const context = sentenceContaining(input, span)
    if (!PERF_REQUIREMENT_RE.test(context.text)) continue
    if (entries.some((e) => e.metric === hit.metric.value)) continue

    // Nearest percentage, not the first one after: "70% viewability ... IVT
    // below 1%" must pair each metric with the number written against it.
    const percents = findIn(input, context, PERCENT_RE)
    const attachedPercent = nearestSpan(span, percents)
    if (!attachedPercent) {
      warn(
        acc,
        `'${span.text}' is stated as a requirement with no threshold. AdCP \`core/performance-standard.json\` requires metric + threshold + vendor, so no filter was emitted.`,
        [span],
      )
      continue
    }
    const percentSpan = attachedPercent
    const pct = Number(/(\d{1,3}(?:\.\d+)?)/.exec(percentSpan.text)![1]!)
    const threshold = pct / 100
    if (!(threshold >= 0 && threshold <= 1)) continue

    const entry: Record<string, unknown> = { metric: hit.metric.value, threshold }
    rules.push(
      `'${percentSpan.text}' -> threshold: ${threshold} (AdCP performance-standard thresholds are decimals 0-1; ${hit.metric.value} is a ${hit.metric.direction})`,
    )
    if (!hit.metric.exact) rules.push(hit.metric.rule!)

    // Vendor, if the buyer named one in the same sentence.
    let vendorFound: { name: string; domain: string; span: Span } | undefined
    for (const vendor of VENDORS) {
      const found = findIn(input, context, vendor.re)
      if (found.length > 0) {
        vendorFound = { name: vendor.name, domain: vendor.domain, span: found[0]! }
        break
      }
    }
    // A hostname the buyer typed IS the BrandRef. A hostname read off this
    // module's seven-row table is not: `vendor` is a `core/brand-ref.json`
    // whose `domain` is where the measurement agent is discovered, so it
    // points a downstream agent at a machine, and two letters ("DV") is not
    // consent to name one. The domain therefore goes to `offered` with the
    // rest of the entry, and the field carries the standard without it.
    const typedDomain = vendorFound
      ? findIn(
          input,
          context,
          new RegExp(`\\b${vendorFound.domain.replace(/\./g, '\\.')}\\b`, 'gi'),
        )[0]
      : undefined
    if (vendorFound && typedDomain) {
      entry.vendor = { domain: vendorFound.domain }
      rules.push(
        `'${typedDomain.text}' -> vendor: { domain: '${vendorFound.domain}' } (AdCP BrandRef, transcribed from the domain in the brief)`,
      )
      claimed.push(typedDomain)
    } else if (vendorFound) {
      vendorOffers.push({
        metric: hit.metric.value,
        name: vendorFound.name,
        domain: vendorFound.domain,
        span: vendorFound.span,
      })
      claimed.push(vendorFound.span)
      warn(
        acc,
        `'${vendorFound.span.text}' names ${vendorFound.name} as the measuring vendor, but AdCP \`vendor\` is a BrandRef whose only required property is \`domain\`, and the brief states no domain. The engine will not write a hostname you did not type — it is the discovery point for a measurement agent — so the standard is emitted without \`vendor\` and will not validate. Write '${vendorFound.domain}' in the brief, or accept the offered \`required_performance_standards\` to use it.`,
        [vendorFound.span],
      )
    } else {
      warn(
        acc,
        `a ${hit.metric.value} threshold of ${pct}% is stated with no measurement vendor. AdCP requires \`vendor\` on every performance standard, so this entry will not validate against \`core/performance-standard.json\` until you name one.`,
        [span, percentSpan],
      )
    }

    // `standard` is required by AdCP when the metric is viewability.
    if (hit.metric.value === 'viewability') {
      const stdMatch = findIn(input, context, VIEWABILITY_STANDARD_RE)[0]
      if (stdMatch) {
        entry.standard = /group/i.test(stdMatch.text) ? 'groupm' : 'mrc'
        rules.push(
          `'${stdMatch.text}' -> standard: '${entry.standard}' (AdCP enums/viewability-standard.json)`,
        )
        claimed.push(stdMatch)
      } else {
        warn(
          acc,
          'a viewability threshold is stated without a measurement standard. AdCP requires `standard` (mrc | groupm) on viewability because the two define materially different thresholds; the entry is emitted without it and will not validate.',
          [span, percentSpan],
        )
      }
    }

    entries.push(entry)
    for (const s of [span, percentSpan, ...claimed.splice(0)]) {
      if (!spans.some((k) => k.start === s.start && k.end === s.end)) spans.push(s)
    }
  }

  if (entries.length === 0) return
  put(
    acc,
    'required_performance_standards',
    derived(entries, rules.join('; '), spans, {
      note: 'AAMP has no threshold-with-vendor shape at all; of its KPI vocabulary only VCR overlaps, as `completion_rate`.',
    }),
  )

  // The same standards WITH the vendor domains this module's table knows, as an
  // assumption the caller can accept by key. Off by default: accepting it is
  // the caller saying "yes, DoubleVerify means doubleverify.com" — which is
  // true, and is still not something the brief said.
  if (vendorOffers.length > 0) {
    const withVendor = entries.map((e) => {
      const offer = vendorOffers.find((v) => v.metric === e.metric)
      return offer ? { ...e, vendor: { domain: offer.domain } } : e
    })
    acc.offered.required_performance_standards = {
      label: 'assumed',
      value: withVendor,
      spans,
      extractor: EXTRACTOR,
      rule: `${vendorOffers
        .map(
          (v) =>
            `'${v.span.text}' was read as ${v.name}, whose operating domain this engine's table gives as '${v.domain}'`,
        )
        .join(
          '; ',
        )}. The brief names the vendor and not the domain, and AdCP \`vendor\` is a BrandRef requiring one. Accepting this key writes the hostname into the request; the vendor's brand.json there is what a measurement agent is discovered through.`,
    }
  }
}

/**
 * Attribution and lookback windows.
 *
 * This is the exact field the market's best brief generator invented: 14-day
 * click and 28-day view windows that were nowhere in its input, presented as
 * requirements. Two rules apply, and they are the whole product in miniature:
 *
 *   1. never emit one that was not stated — there is no default here, and
 *   2. when one IS stated, there is still no field for it. AdCP's
 *      `get_products` has no attribution surface and AAMP's `CampaignBrief`
 *      has none either, so the honest output is a warning, not a value.
 */
const ATTRIBUTION_RE =
  /\b(\d{1,3})\s*[- ]?days?\s+(?:post[- ]?)?(click|view|impression)\b|\battribution\s+window\b|\blook[- ]?back\s+window\b|\b(?:click|view)[- ]?through\s+attribution\b/gi

function attributionWindows(acc: Acc): void {
  const input = acc.input
  const spans = [...input.matchAll(ATTRIBUTION_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )
  if (spans.length === 0) return
  warn(
    acc,
    "an attribution or lookback window is stated and neither protocol can carry it: AdCP `get_products` has no attribution surface and AAMP `CampaignBrief` has no attribution field. It survives only as prose in the AdCP `brief` string, and no value was written. (This is the field the market's best generator invented and presented as a requirement — the engine will not emit one you did not state, and cannot emit the one you did.)",
    spans,
  )
}

/* ==================================================================== *
 * 10. Trusted Match
 * ==================================================================== */

const TMP_MENTION_RE =
  /\btrusted\s+match\b|\btmp\b|\bidentity\s+match\b|\bcontext(?:ual)?\s+match\b|\bclean\s?room\s+match\b/gi
const TMP_RESPONSE_TYPES_RE = /\bresponse\s+types?\b\s*[:\-–—]?\s*([^.;\n]+)/gi
const TMP_RESPONSE_VALUE_RE = /\b(activation|catalog[_ ]items|creative|deal)s?\b/gi
const URL_RE = /\bhttps?:\/\/[^\s,;)"']+/gi

function trustedMatch(acc: Acc): void {
  const input = acc.input
  const mentions = [...input.matchAll(TMP_MENTION_RE)].map((m) =>
    mkSpan(input, m.index, m.index + m[0].length),
  )
  if (mentions.length === 0) return

  const value: Record<string, unknown> = {}
  const spans: Span[] = []
  const rules: string[] = []

  // response_types — only from an explicit "response types: …" list, because
  // 'creative' and 'deal' are ordinary words everywhere else in a brief.
  const responseTypes: string[] = []
  for (const m of input.matchAll(TMP_RESPONSE_TYPES_RE)) {
    const captured = m[1]!
    const start = input.indexOf(captured, m.index)
    if (start < 0) continue
    const region = mkSpan(input, start, start + captured.length)
    for (const span of findIn(input, region, TMP_RESPONSE_VALUE_RE)) {
      const normalised = span.text.toLowerCase().replace(/\s+/g, '_').replace(/s$/, '')
      const canonical = normalised === 'catalog_item' ? 'catalog_items' : normalised
      if (responseTypes.includes(canonical)) continue
      responseTypes.push(canonical)
      spans.push(span)
      if (canonical !== span.text.toLowerCase()) {
        rules.push(`'${span.text}' -> response type '${canonical}' (AdCP enums/response-type.json)`)
      }
    }
  }
  if (responseTypes.length > 0) value.response_types = responseTypes

  // providers — every entry requires an `agent_url`, so a provider can only be
  // built when the buyer supplied one. A vendor's brand name is not a URL.
  const providers: Record<string, unknown>[] = []
  for (const mention of mentions) {
    const context = windowAround(input, mention, 120)
    const url = findIn(input, context, URL_RE)[0]
    if (!url) continue
    const provider: Record<string, unknown> = { agent_url: url.text }
    if (/identity\s+match/i.test(context.text)) provider.identity_match = true
    if (/context(?:ual)?\s+match/i.test(context.text)) provider.context_match = true
    if (providers.some((p) => p.agent_url === provider.agent_url)) continue
    providers.push(provider)
    spans.push(mention, url)
    rules.push(
      `'${url.text}' in the same clause as '${mention.text}' -> trusted_match.providers[].agent_url`,
    )
  }
  if (providers.length > 0) value.providers = providers

  if (Object.keys(value).length === 0) {
    put(
      acc,
      'trusted_match',
      missing(
        'Trusted Match is asked for and cannot be expressed: `filters.trusted_match.providers[]` requires an `agent_url` from the registry, and `identity_match` / `context_match` are flags inside a provider entry rather than standalone requirements.',
      ),
    )
    warn(
      acc,
      'a Trusted Match capability is requested but no provider `agent_url` is stated. AdCP pins TMP providers by registry URL, so `identity_match` / `context_match` cannot be expressed on their own and no filter was emitted.',
      mentions,
    )
    return
  }

  put(
    acc,
    'trusted_match',
    rules.length > 0
      ? derived(value, rules.join('; '), spans, {
          note: 'Supersedes the deprecated `required_axe_integrations`. AAMP has no TMP concept.',
        })
      : stated(value, spans),
  )
  if (providers.length === 0 && /identity\s+match|context(?:ual)?\s+match/i.test(input)) {
    warn(
      acc,
      'identity or context match is named but no provider `agent_url` was stated, so only `response_types` was emitted; the match-type requirement is lost.',
      mentions,
    )
  }
}

/* ==================================================================== *
 * 11. Seller lists
 * ==================================================================== */

/**
 * "Preferred sellers: Hulu, Roku and Peacock" — the labelled form,
 * case-insensitive because the label is prose.
 */
const PREFERRED_SELLERS_LABELLED_RE =
  /\b(?:preferred|priorit(?:y|ised|ized)|favou?red)\s+(?:sellers?|publishers?|ssps?|supply\s+partners?|vendors?)\b\s*[:\-–—]?\s*([^.;\n]+)/gi
/**
 * "prefer Hulu and Roku" — the unlabelled form. Case-SENSITIVE on purpose: the
 * only thing marking a seller name here is its capital letter, and lower-casing
 * the pattern would swallow the rest of the sentence as if it were a seller.
 */
const PREFERRED_SELLERS_NAMED_RE =
  /\b(?:prefer|priorit(?:ise|ize)|favou?r)\s+(?:buying\s+(?:from|through)\s+)?([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*)*(?:\s*(?:,|and)\s*[A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*)*)*)/g
const EXCLUDED_SELLERS_RE =
  /\b(?:excluded?|blocked?|banned|no)\s+(?:sellers?|publishers?|ssps?|supply\s+partners?)\b\s*[:\-–—]?\s*([^.;\n]+)|\bdo\s+not\s+(?:buy|work|trade)\s+(?:from|with|through)\s+([^.;\n]+)/gi

function sellerLists(acc: Acc): void {
  const input = acc.input
  const collect = (patterns: RegExp[], key: string, note: string): void => {
    const spans: Span[] = []
    const values: string[] = []
    const seen = new Set<string>()
    for (const re of patterns) {
      for (const m of input.matchAll(re)) {
        const captured = m[1] ?? m[2]
        if (!captured) continue
        const start = input.indexOf(captured, m.index)
        if (start < 0) continue
        for (const item of listItems(input, mkSpan(input, start, start + captured.length))) {
          const norm = item.text.toLowerCase()
          if (seen.has(norm)) continue
          seen.add(norm)
          spans.push(item)
          values.push(item.text)
        }
      }
    }
    if (values.length === 0) return
    spans.sort((a, b) => a.start - b.start)
    put(acc, key, stated(values, spans, { raw: values, note }))
  }
  collect(
    [PREFERRED_SELLERS_LABELLED_RE, PREFERRED_SELLERS_NAMED_RE],
    'preferred_sellers',
    'AdCP is a per-seller protocol — you call one agent — so "which sellers" is a buyer-side routing decision that never appears in `get_products`.',
  )
  collect(
    [EXCLUDED_SELLERS_RE],
    'excluded_sellers',
    'Same asymmetry as `preferred_sellers`: AdCP has no cross-seller surface in `get_products`.',
  )
}

/* ==================================================================== *
 * 12. KPIs — media metrics in, business outcomes reported
 * ==================================================================== */

/** A number attached to a KPI: "$25", "70%", "of 3.5". */
const KPI_VALUE_RE =
  /(?:[$£€]\s*(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)\s*%|\b(?:of|at|:|=)\s*(\d[\d,]*(?:\.\d+)?)\b)/g
/** A word that makes a number a target rather than a passing figure. */
const KPI_TARGET_RE =
  /\btargets?\b|\bgoals?\b|\bkpis?\b|\bbenchmark\b|\bat\s+least\b|\bminimum\b|\bof\b|\bhit\b/i

function kpis(acc: Acc): void {
  const input = acc.input

  // 12a. Media metrics AAMP can hold.
  const hits: { span: Span; value: string; exact: boolean; rule?: string }[] = []
  for (const metric of KPI_METRICS) {
    for (const m of input.matchAll(metric.re)) {
      hits.push({
        span: mkSpan(input, m.index, m.index + m[0].length),
        value: metric.value,
        exact: metric.exact,
        rule: metric.rule,
      })
    }
  }

  const entries: { metric: string; target_value: number }[] = []
  const spans: Span[] = []
  const rules: string[] = []
  const notes: string[] = []
  let anyMapped = false

  for (const span of dropOverlaps(hits.map((h) => h.span))) {
    const hit = hits.find((h) => h.span.start === span.start && h.span.end === span.end)!
    const context = windowAround(input, span, 45)
    // A CPM ceiling is a DealPreferences field, not a KPI. Leave it alone.
    if (
      hit.value === 'CPM' &&
      CPM_CEILING_RE.test(context.text) &&
      !CPM_TARGET_RE.test(context.text)
    ) {
      continue
    }
    const numbers = findIn(input, context, KPI_VALUE_RE)
    const numberSpan = attachedSpan(span, numbers)
    if (!numberSpan || !KPI_TARGET_RE.test(context.text)) {
      warn(
        acc,
        `'${span.text}' is named as a metric with no target value. AAMP's \`KPI.target_value\` is required and must be > 0, so no KPI entry was created.`,
        [span],
      )
      continue
    }
    const digits = /(\d[\d,]*(?:\.\d+)?)/.exec(numberSpan.text)
    if (!digits) continue
    const target = toNumber(digits[1]!)
    if (target === null || target <= 0) continue
    if (entries.some((e) => e.metric === hit.value)) continue

    // The percent sign can fall just outside the matched number ("of 0.35" + "%"),
    // so look one character past it before deciding the unit was lost.
    const trailingPercent = /^\s*%/.test(input.slice(numberSpan.end, numberSpan.end + 2))
    const valueSpan = trailingPercent
      ? mkSpan(input, numberSpan.start, input.indexOf('%', numberSpan.end) + 1)
      : numberSpan

    entries.push({ metric: hit.value, target_value: target })
    spans.push(span, valueSpan)
    if (!hit.exact) {
      anyMapped = true
      rules.push(hit.rule!)
    }
    if (/%/.test(valueSpan.text)) {
      anyMapped = true
      rules.push(
        `'${valueSpan.text.trim()}' -> target_value: ${target} (AAMP's KPI.target_value is a bare float with no unit; the percent sign is not carried)`,
      )
      notes.push(
        `${hit.value} was stated as a percentage; AAMP records ${target} with no unit, so a seller may read it as a rate rather than a percent.`,
      )
    }
  }

  if (entries.length > 0) {
    put(
      acc,
      'kpi_targets',
      anyMapped
        ? derived(entries, rules.join('; '), spans, { note: notes.join(' ') || undefined })
        : stated(entries, spans, {
            note: 'AdCP has no goal field at discovery: `filters.required_metrics` asks who can report a metric and `filters.required_performance_standards` sets a threshold with a vendor, but neither carries a target value.',
          }),
    )
    // Verbatim: these open with a metric acronym, and lower-casing it for
    // sentence flow would print 'vCR'.
    for (const note of notes) warn(acc, note)
  }

  // 12b. Business outcomes. Real goals with no field in either protocol. This
  // is a finding for the user, not a value to force into `kpis`.
  const outcomeHits: { span: Span; entry: (typeof BUSINESS_OUTCOMES)[number] }[] = []
  for (const outcome of BUSINESS_OUTCOMES) {
    for (const m of input.matchAll(outcome.re)) {
      outcomeHits.push({ span: mkSpan(input, m.index, m.index + m[0].length), entry: outcome })
    }
  }
  for (const span of dropOverlaps(outcomeHits.map((h) => h.span))) {
    const hit = outcomeHits.find((h) => h.span.start === span.start && h.span.end === span.end)!
    const adjacent = hit.entry.adjacent
      ? ` The nearest thing on the wire is the AdCP available-metric \`${hit.entry.adjacent}\`, which is a reporting capability rather than a target; the engine does not assume you meant it.`
      : ''
    warn(
      acc,
      `'${span.text}' is a business outcome, and neither protocol carries one: AAMP's \`kpis\` accepts only CPM | CPC | CPCV | CTR | VCR | ROAS | GRP, and AdCP's \`get_products\` has no goal field at all. It survives only as prose in the AdCP \`brief\` string.${adjacent}`,
      [span],
    )
  }
}

/* ==================================================================== *
 * The extractor
 * ==================================================================== */

/**
 * Extract the policy-control surface of a brief.
 *
 * Pure: same (text, opts) in, deep-equal output, always. No clock, no network,
 * no file system, no mutation of the input.
 *
 * @param text the buyer's brief, verbatim. Every Span indexes into THIS string.
 * @param opts `referenceDate` is accepted for parity with the date-bearing
 *             extractors and is unused here (see PolicyControlsOptions).
 */
export function extractPolicyControls(
  text: string,
  opts: PolicyControlsOptions = {},
): PolicyControlsExtraction {
  const input = typeof text === 'string' ? text : ''
  const acc: Acc = { input, fields: {}, offered: {}, warnings: [] }

  if (opts.referenceDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(opts.referenceDate)) {
    warn(
      acc,
      `referenceDate ${JSON.stringify(opts.referenceDate)} is not an ISO-8601 date (YYYY-MM-DD). No rule in this module reads it, so nothing changed.`,
    )
  }

  if (input.trim().length === 0) return acc

  brandSafetyCategories(acc)
  excludedKeywords(acc)
  excludedDomains(acc)
  frequencyCap(acc)
  pacing(acc)
  approvals(acc)
  cpmCeiling(acc)
  impressionFloors(acc)
  exclusivity(acc)
  requiredFeatures(acc)
  requiredMetrics(acc)
  performanceStandards(acc)
  attributionWindows(acc)
  trustedMatch(acc)
  sellerLists(acc)
  kpis(acc)

  return acc
}

/*
 * NOTE ON UNCLAIMED KEYS. This module writes a key only when it finds
 * something, so twenty owned keys can be absent from `fields` entirely. That is
 * deliberate — an extractor's silence is not a claim — but the assembler must
 * not then describe them as fields nobody looked at. `analyze()` declares this
 * module's POLICY_CONTROL_KEYS to mergeExtractions(), which is what tells the
 * two cases apart in the note it writes. See score.ts.
 */

/**
 * `Extractor`-shaped adapter for the assembler in `analyze()`. The context
 * carries a resolved `now`, which this module does not use; the adapter exists
 * so the module can be registered alongside the date-bearing extractors.
 */
export const policyControlsExtractor: Extractor = (ctx) => extractPolicyControls(ctx.input)

export default extractPolicyControls
