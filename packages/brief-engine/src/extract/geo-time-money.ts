/**
 * Extractor: geography, timing and money.
 *
 * Owns twelve keys from the canonical field map (src/fields.ts):
 *
 *   geo      countries · regions · metros · postal_areas
 *   timing   start_date · end_date
 *   budget   budget_total · budget_min · currency · pricing_currencies · is_fixed_price
 *   inventory delivery_type          (pricing-shaped, so it lives here rather than with channels)
 *
 * THE ONE RULE: no silent invention. Three consequences run through every
 * function below, and they are the reason this file is long:
 *
 *  1. Nothing is emitted that the reader cannot point at. Every `stated` and
 *     every `derived` value carries a Span — half-open offsets into the ORIGINAL
 *     input plus the substring — so the UI can highlight the words the value
 *     came from. All matching therefore happens on the original string; there is
 *     no lower-cased copy and no normalisation pass that could shift an offset.
 *
 *  2. Every `derived` value carries the rule that produced it, written as a
 *     sentence a buyer can read and disagree with. "£" -> GBP is a derivation,
 *     not a reading; so is "United States" -> "US"; so is carrying the year off
 *     the end of a date range onto its start.
 *
 *  3. Ambiguity is returned, never resolved. A bare figure ("$500,000") does not
 *     say whether it is a ceiling, a target or a floor, so the engine records the
 *     figure and pushes a warning rather than picking a bound. "3/4/2026" is
 *     either 3 April or 4 March depending on which side of the Atlantic wrote
 *     it, so it produces a warning and no date. "Georgia" is a country and a US
 *     state, so it produces a warning and no geo filter. This is the behaviour
 *     that distinguishes the product: the market leader invented a 60/25/15
 *     channel split and 14/28-day attribution windows and printed them as
 *     requirements. A brief is a document someone signs.
 *
 * Deliberately NOT done here, each an invention if it were:
 *  - No DMA name -> Nielsen code table. "Chicago metro" produces a warning
 *    naming the surface form, not `{system: 'nielsen_dma', code: '602'}`. A
 *    wrong metro code is silent invention with a media plan attached.
 *  - A bare number with no sign, no code and no currency word yields
 *    `currency: missing`, never USD.
 *  - Regions do not imply countries. "California" sets `filters.regions` and
 *    leaves `filters.countries` missing: adding a filter the buyer did not ask
 *    for changes the request, and redundancy is not a licence.
 *  - `pricing_currencies` is not derived from `currency`. fields.ts is explicit
 *    that the budget's denomination and the set the buyer can settle in are two
 *    different facts. It is offered as an assumption candidate instead, where it
 *    stays until a caller accepts it.
 *
 * Determinism: pure function of (text, opts). No clock read — relative dates
 * resolve only against `opts.referenceDate`, and without one they are `missing`
 * with a warning that says so. No I/O, no network, no LLM, ever.
 */

import type { Extraction, FieldValue, Span } from '../types.ts'
import { UNBOUNDED_BUDGET_NOTE } from '../fields.ts'

/* ==================================================================== *
 * Public shape
 * ==================================================================== */

export interface GeoTimeMoneyOptions {
  /**
   * ISO 8601 calendar date, `YYYY-MM-DD`, against which relative expressions
   * ("next quarter", a bare "November", a year-less "Q4") are resolved. Omit it
   * and those expressions stay `missing` with a warning naming what was said and
   * why it could not be resolved. The engine never reads a clock of its own.
   */
  referenceDate?: string
}

export interface GeoTimeMoneyExtraction extends Extraction {
  /** One entry per owned key — present even when `missing`, never sparse. */
  fields: Record<string, FieldValue<unknown>>
  /** Assumption candidates. Always `label: 'assumed'`; never emitted unaccepted. */
  offered: Record<string, FieldValue<unknown>>
  warnings: string[]
}

/** Keys this module is competent for. Must exist in fields.ts FIELD_KEYS. */
export const OWNED_KEYS = [
  'countries',
  'regions',
  'metros',
  'postal_areas',
  'start_date',
  'end_date',
  'budget_total',
  'budget_min',
  'currency',
  'pricing_currencies',
  'is_fixed_price',
  'delivery_type',
] as const

const EXTRACTOR = 'geo-time-money'

/* ==================================================================== *
 * FieldValue constructors
 * ==================================================================== */

function span(text: string, start: number, end: number): Span {
  return { start, end, text: text.slice(start, end) }
}

function stated<T>(value: T, spans: Span[], extra: Partial<FieldValue<T>> = {}): FieldValue<T> {
  return { label: 'stated', value, spans, extractor: EXTRACTOR, ...extra }
}

function derived<T>(
  value: T,
  spans: Span[],
  rule: string,
  extra: Partial<FieldValue<T>> = {},
): FieldValue<T> {
  return { label: 'derived', value, spans, rule, extractor: EXTRACTOR, ...extra }
}

function assumed<T>(value: T, rule: string, extra: Partial<FieldValue<T>> = {}): FieldValue<T> {
  return { label: 'assumed', value, spans: [], rule, extractor: EXTRACTOR, ...extra }
}

/** `missing` invariant: no value, no spans. `raw` and `note` may still carry evidence. */
function absent(extra: Partial<FieldValue<never>> = {}): FieldValue<never> {
  return { label: 'missing', spans: [], extractor: EXTRACTOR, ...extra, value: undefined }
}

/* ==================================================================== *
 * Calendar arithmetic — UTC only, no local timezone anywhere
 * ==================================================================== */

interface Ymd {
  y: number
  m: number // 1-12
  d: number // 1-31
}

/** Day 0 of month m+1 is the last day of month m. */
function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

function isValidYmd(v: Ymd): boolean {
  return (
    Number.isInteger(v.y) &&
    v.y >= 1900 &&
    v.y <= 2999 &&
    v.m >= 1 &&
    v.m <= 12 &&
    v.d >= 1 &&
    v.d <= daysInMonth(v.y, v.m)
  )
}

function iso(v: Ymd): string {
  return `${String(v.y).padStart(4, '0')}-${String(v.m).padStart(2, '0')}-${String(v.d).padStart(2, '0')}`
}

function cmpYmd(a: Ymd, b: Ymd): number {
  return a.y - b.y || a.m - b.m || a.d - b.d
}

/** Whole days from `a` to `b`, negative when `b` precedes `a`. */
function daysBetween(a: Ymd, b: Ymd): number {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000)
}

/**
 * Unicode-aware word fences, to be used with the `u` flag instead of `\b`.
 *
 * `\b` without `u` is an ASCII word boundary: its word class is `[A-Za-z0-9_]`
 * and every other code point, accented Latin letters included, reads as a
 * separator. So `\bMarch\b` matches inside "Marche" the moment the final `e`
 * carries an acute accent, and a French brief that named no dates at all came
 * back with a March flight window labelled `derived`. That is the same invented
 * value the fences at DATE_TOKEN_RE were added to refuse, arriving through the
 * character class rather than through a missing fence.
 */
const NO_WORD_BEFORE = '(?<![\\p{L}\\p{N}_])'
const NO_WORD_AFTER = '(?![\\p{L}\\p{N}_])'

function addDays(v: Ymd, n: number): Ymd {
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d) + n * 86_400_000)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

function addMonths(v: Ymd, n: number): Ymd {
  const total = v.y * 12 + (v.m - 1) + n
  const y = Math.floor(total / 12)
  const m = (total % 12) + 1
  return { y, m, d: Math.min(v.d, daysInMonth(y, m)) }
}

/** `YYYY-MM-DD` and nothing else: a reference date is a caller contract, not prose. */
const REFERENCE_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/* ==================================================================== *
 * Vocabularies
 * ==================================================================== */

/**
 * Currency signs, longest first so that `C$` and `US$` win over bare `$`.
 *
 * `ambiguity` is non-null where the sign genuinely denotes more than one
 * currency. Where it is set the mapping is one-to-many and the engine does NOT
 * resolve it: the code becomes an assumption candidate in `offered`, the field
 * stays `missing`, and the string below is both the warning and the rule shown
 * against the offer. A one-to-many mapping settled by picking the most common
 * member is a guess wearing a derivation's clothes, and `filters.budget_range.currency`
 * is money in a document someone signs.
 */
const CURRENCY_SIGNS: ReadonlyArray<{ sign: string; code: string; ambiguity?: string }> = [
  { sign: 'US$', code: 'USD' },
  { sign: 'CA$', code: 'CAD' },
  { sign: 'AU$', code: 'AUD' },
  { sign: 'NZ$', code: 'NZD' },
  { sign: 'HK$', code: 'HKD' },
  { sign: 'MX$', code: 'MXN' },
  { sign: 'C$', code: 'CAD' },
  { sign: 'A$', code: 'AUD' },
  { sign: 'S$', code: 'SGD' },
  { sign: 'R$', code: 'BRL' },
  {
    sign: '$',
    code: 'USD',
    ambiguity:
      "'$' is the sign for the US dollar and also for the Canadian, Australian, New Zealand, Singapore, Hong Kong and Mexican dollars, among others. A bare '$' therefore does not name a currency, and the engine did not pick one: `currency` is missing and USD is offered as an assumption you can accept. Write the ISO 4217 code to state it.",
  },
  { sign: '£', code: 'GBP' },
  { sign: '€', code: 'EUR' },
  {
    sign: '¥',
    code: 'JPY',
    ambiguity:
      "'¥' is used for both the Japanese yen (JPY) and the Chinese yuan (CNY), so it does not name a currency on its own. The engine did not pick one: `currency` is missing and JPY is offered as an assumption you can accept. Write JPY or CNY to state it.",
  },
  { sign: '₹', code: 'INR' },
  { sign: '₩', code: 'KRW' },
  { sign: '₺', code: 'TRY' },
  { sign: '₪', code: 'ILS' },
  { sign: '₽', code: 'RUB' },
]

const SIGN_ALTERNATION = CURRENCY_SIGNS.map((s) => s.sign.replace('$', '\\$')).join('|')

const SIGN_BY_TEXT: ReadonlyMap<string, (typeof CURRENCY_SIGNS)[number]> = new Map(
  CURRENCY_SIGNS.map((s) => [s.sign.toUpperCase(), s]),
)

/**
 * ISO 4217 codes the engine will recognise as a bare word. Deliberately a list
 * of real codes rather than `[A-Z]{3}`: both protocols enforce the `^[A-Z]{3}$`
 * shape without checking the code exists, so `NET`, `CPM` and `VAT` would sail
 * through a pattern test and arrive at a seller as a currency.
 */
// prettier-ignore
const ISO_4217 = new Set([
  'AED', 'ARS', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR',
  'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KES', 'KRW', 'MXN', 'MYR', 'NGN', 'NOK',
  'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'USD', 'VND',
  'ZAR',
])

/**
 * Currency words. A qualified word ("US dollars") is unambiguous; a bare one
 * ("dollars") is not, and says so.
 */
const CURRENCY_WORDS: ReadonlyArray<{ re: RegExp; code: string; ambiguity?: string }> = [
  { re: /^(?:US|U\.S\.)\s+dollars?/i, code: 'USD' },
  { re: /^(?:Canadian)\s+dollars?/i, code: 'CAD' },
  { re: /^(?:Australian)\s+dollars?/i, code: 'AUD' },
  {
    re: /^dollars?/i,
    code: 'USD',
    ambiguity:
      "'dollars' names the currency of the United States, Canada, Australia, New Zealand, Singapore and others, so on its own it does not name one. The engine did not pick one: `currency` is missing and USD is offered as an assumption you can accept. Write the ISO 4217 code to state it.",
  },
  { re: /^(?:pounds?(?:\s+sterling)?|sterling)/i, code: 'GBP' },
  { re: /^euros?/i, code: 'EUR' },
  { re: /^yen/i, code: 'JPY' },
  { re: /^rupees?/i, code: 'INR' },
]

/**
 * Countries whose names map to one ISO 3166-1 alpha-2 code with no contest.
 * Names only — bare alpha-2 codes are handled separately and case-sensitively,
 * because `us`, `in`, `it`, `is`, `no`, `at`, `be` and `so` are all English
 * words as well as country codes.
 */
const COUNTRY_NAMES: ReadonlyArray<[string, string]> = [
  ['United States of America', 'US'],
  ['United States', 'US'],
  ['United Kingdom', 'GB'],
  ['Great Britain', 'GB'],
  ['United Arab Emirates', 'AE'],
  ['Saudi Arabia', 'SA'],
  ['South Africa', 'ZA'],
  ['South Korea', 'KR'],
  ['New Zealand', 'NZ'],
  ['Hong Kong', 'HK'],
  ['Czech Republic', 'CZ'],
  ['Netherlands', 'NL'],
  ['Switzerland', 'CH'],
  ['Philippines', 'PH'],
  ['Indonesia', 'ID'],
  ['Argentina', 'AR'],
  ['Australia', 'AU'],
  ['Colombia', 'CO'],
  ['Singapore', 'SG'],
  ['Germany', 'DE'],
  ['Portugal', 'PT'],
  ['Malaysia', 'MY'],
  ['Thailand', 'TH'],
  ['Vietnam', 'VN'],
  ['Belgium', 'BE'],
  ['Denmark', 'DK'],
  ['Finland', 'FI'],
  ['Ireland', 'IE'],
  ['Nigeria', 'NG'],
  ['Britain', 'GB'],
  ['Austria', 'AT'],
  ['Brazil', 'BR'],
  ['Canada', 'CA'],
  ['France', 'FR'],
  ['Mexico', 'MX'],
  ['Norway', 'NO'],
  ['Poland', 'PL'],
  ['Sweden', 'SE'],
  ['Taiwan', 'TW'],
  ['China', 'CN'],
  ['Egypt', 'EG'],
  ['India', 'IN'],
  ['Italy', 'IT'],
  ['Japan', 'JP'],
  ['Kenya', 'KE'],
  ['Spain', 'ES'],
  ['Chile', 'CL'],
  ['Israel', 'IL'],
  ['Türkiye', 'TR'],
]

/**
 * Names that resolve to a country only if you already know which sense was
 * meant. Each produces a warning and no value. The alternative — picking — is
 * how a US state becomes a national buy.
 */
const AMBIGUOUS_PLACE_NAMES: ReadonlyArray<[string, string]> = [
  [
    'Georgia',
    "'Georgia' is both the country (ISO 3166-1 'GE') and a US state (ISO 3166-2 'US-GA'). No geo filter was emitted — write 'US-GA' or 'Georgia (country)'.",
  ],
  [
    'Turkey',
    "'Turkey' is both a country (ISO 3166-1 'TR', officially Türkiye) and an ordinary noun. No geo filter was emitted — write 'TR' or 'Türkiye' if you meant the market.",
  ],
  [
    'Korea',
    "'Korea' does not identify a country on its own: ISO 3166-1 has 'KR' (South Korea) and 'KP' (North Korea). No geo filter was emitted.",
  ],
  [
    'Jordan',
    "'Jordan' is both a country (ISO 3166-1 'JO') and a common name. No geo filter was emitted — write 'JO' if you meant the market.",
  ],
  [
    'Washington',
    "'Washington' is both a US state (ISO 3166-2 'US-WA') and the District of Columbia (ISO 3166-2 'US-DC'). No region filter was emitted — write 'Washington State' or 'Washington, D.C.'.",
  ],
]

/** ISO 3166-2 subdivisions, by country. Full names only, for the same reason. */
// prettier-ignore
const US_STATES: ReadonlyArray<[string, string]> = [
  ['Alabama', 'AL'], ['Alaska', 'AK'], ['Arizona', 'AZ'], ['Arkansas', 'AR'],
  ['California', 'CA'], ['Colorado', 'CO'], ['Connecticut', 'CT'], ['Delaware', 'DE'],
  ['District of Columbia', 'DC'], ['Florida', 'FL'], ['Hawaii', 'HI'], ['Idaho', 'ID'],
  ['Illinois', 'IL'], ['Indiana', 'IN'], ['Iowa', 'IA'], ['Kansas', 'KS'], ['Kentucky', 'KY'],
  ['Louisiana', 'LA'], ['Maine', 'ME'], ['Maryland', 'MD'], ['Massachusetts', 'MA'],
  ['Michigan', 'MI'], ['Minnesota', 'MN'], ['Mississippi', 'MS'], ['Missouri', 'MO'],
  ['Montana', 'MT'], ['Nebraska', 'NE'], ['Nevada', 'NV'], ['New Hampshire', 'NH'],
  ['New Jersey', 'NJ'], ['New Mexico', 'NM'], ['New York', 'NY'], ['North Carolina', 'NC'],
  ['North Dakota', 'ND'], ['Ohio', 'OH'], ['Oklahoma', 'OK'], ['Oregon', 'OR'],
  ['Pennsylvania', 'PA'], ['Rhode Island', 'RI'], ['South Carolina', 'SC'],
  ['South Dakota', 'SD'], ['Tennessee', 'TN'], ['Texas', 'TX'], ['Utah', 'UT'],
  ['Vermont', 'VT'], ['Virginia', 'VA'], ['West Virginia', 'WV'], ['Wisconsin', 'WI'],
  ['Wyoming', 'WY'],
]

const GB_NATIONS: ReadonlyArray<[string, string]> = [
  ['Northern Ireland', 'NIR'],
  ['Scotland', 'SCT'],
  ['England', 'ENG'],
  ['Wales', 'WLS'],
]

// prettier-ignore
const CA_PROVINCES: ReadonlyArray<[string, string]> = [
  ['Newfoundland and Labrador', 'NL'], ['Prince Edward Island', 'PE'],
  ['Northwest Territories', 'NT'], ['British Columbia', 'BC'], ['Saskatchewan', 'SK'],
  ['New Brunswick', 'NB'], ['Nova Scotia', 'NS'], ['Manitoba', 'MB'], ['Ontario', 'ON'],
  ['Alberta', 'AB'], ['Quebec', 'QC'], ['Nunavut', 'NU'], ['Yukon', 'YT'],
]

/**
 * Australian states. `Victoria` is omitted on purpose: it is a state, a city in
 * British Columbia, and a first name.
 */
// prettier-ignore
const AU_STATES: ReadonlyArray<[string, string]> = [
  ['Australian Capital Territory', 'ACT'], ['Western Australia', 'WA'],
  ['Northern Territory', 'NT'], ['South Australia', 'SA'], ['New South Wales', 'NSW'],
  ['Queensland', 'QLD'], ['Tasmania', 'TAS'],
]

const MONTH_SRC =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'

// prettier-ignore
const MONTH_INDEX: Readonly<Record<string, number>> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function monthNumber(name: string): number {
  return MONTH_INDEX[name.slice(0, 3).toLowerCase()] ?? 0
}

// prettier-ignore
const NUMBER_WORDS: Readonly<Record<string, number>> = {
  'three quarters': 0.75,
  'a quarter': 0.25,
  'one quarter': 0.25,
  half: 0.5,
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
}

const SCALE_WORDS: Readonly<Record<string, number>> = {
  hundred: 100,
  thousand: 1_000,
  million: 1_000_000,
  billion: 1_000_000_000,
}

const MULTIPLIERS: Readonly<Record<string, number>> = {
  k: 1_000,
  thousand: 1_000,
  m: 1_000_000,
  mm: 1_000_000,
  mn: 1_000_000,
  mil: 1_000_000,
  million: 1_000_000,
  bn: 1_000_000_000,
  billion: 1_000_000_000,
}

/* ==================================================================== *
 * Small shared helpers
 * ==================================================================== */

interface Candidate {
  start: number
  end: number
  payload: unknown
}

/**
 * Greedy non-overlap: sort by start, then by length descending, and keep a match
 * only if it does not overlap one already kept. This is what makes
 * "Northern Ireland" beat "Ireland" and "United States" beat nothing at all.
 */
function dropOverlaps<T extends Candidate>(cands: T[]): T[] {
  const sorted = [...cands].sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const kept: T[] = []
  // Linear sweep, not a scan of everything kept so far. Because `sorted` is in
  // start order, every kept match starts at or before the candidate, so the
  // candidate overlaps one exactly when it starts before the furthest end
  // reached — no pairwise test is needed. The pairwise version was quadratic
  // and cost eight seconds on a 5 MB brief, which the UI runs on the main
  // thread; the result it produces is identical.
  let furthestEnd = -1
  for (const c of sorted) {
    if (c.start < furthestEnd) continue
    kept.push(c)
    if (c.end > furthestEnd) furthestEnd = c.end
  }
  return kept
}

/** Build a Unicode-fenced `(?:Alt1|Alt2|…)` from literal names, longest first. */
function namesRegex(names: readonly string[]): RegExp {
  const alts = [...names]
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  return new RegExp(`${NO_WORD_BEFORE}(?:${alts})${NO_WORD_AFTER}`, 'giu')
}

function uniq<T>(xs: readonly T[]): T[] {
  return [...new Set(xs)]
}

/* ==================================================================== *
 * GEOGRAPHY
 * ==================================================================== */

interface GeoHit extends Candidate {
  payload: {
    kind: 'country' | 'region'
    value: string
    raw: string
    rule?: string
    /** The buyer typed a code the engine could not check against a table. */
    unverified?: boolean
  }
}

const COUNTRY_NAME_RE = namesRegex(COUNTRY_NAMES.map(([n]) => n))
const COUNTRY_BY_NAME = new Map(COUNTRY_NAMES.map(([n, c]) => [n.toLowerCase(), c]))

/**
 * Country abbreviations, matched CASE-SENSITIVELY. `\bUS\b` is a country;
 * `\bus\b` is a pronoun, and there is no third reading worth the false positive.
 * `USA` is alpha-3 and `UK` is not an assigned alpha-2 at all (`GB` is), so both
 * are derivations with a rule, not transcriptions.
 */
const COUNTRY_ABBR_RE = /\b(?:U\.S\.A\.|U\.S\.|U\.K\.|USA|UAE|USA|US|UK)\b/g
const COUNTRY_ABBR: Readonly<Record<string, { code: string; rule: string }>> = {
  US: {
    code: 'US',
    rule: "'US' is the ISO 3166-1 alpha-2 code for the United States and was recorded as written.",
  },
  'U.S.': {
    code: 'US',
    rule: "'U.S.' is the punctuated abbreviation for the United States; ISO 3166-1 alpha-2 for it is 'US'.",
  },
  USA: {
    code: 'US',
    rule: "'USA' is the ISO 3166-1 alpha-3 code for the United States; the alpha-2 code AdCP requires is 'US'.",
  },
  'U.S.A.': {
    code: 'US',
    rule: "'U.S.A.' abbreviates the United States of America; ISO 3166-1 alpha-2 for it is 'US'.",
  },
  UK: {
    code: 'GB',
    rule: "'UK' is the common abbreviation for the United Kingdom, but it is not an assigned ISO 3166-1 alpha-2 code — the code is 'GB'.",
  },
  'U.K.': {
    code: 'GB',
    rule: "'U.K.' abbreviates the United Kingdom; the assigned ISO 3166-1 alpha-2 code is 'GB', not 'UK'.",
  },
  UAE: {
    code: 'AE',
    rule: "'UAE' abbreviates the United Arab Emirates; ISO 3166-1 alpha-2 for it is 'AE'.",
  },
}

/**
 * A token SHAPED like ISO 3166-2: `US-NY`, `GB-SCT`, `CA-ON`. The shape alone
 * decides nothing — `PG-13`, `TV-MA`, `NC-17` and `ID-42` all match it, and
 * `PG`, `TV`, `NC` and `ID` are all assigned ISO 3166-1 alpha-2 codes, so a
 * content rating and a tracking code parse as places. Every match is checked
 * against `subdivisionVerdict` below before it becomes a region.
 */
const ISO_3166_2_RE = /\b([A-Z]{2})-([A-Z0-9]{1,3})\b/g

/**
 * Every assigned ISO 3166-1 alpha-2 code. A two-letter prefix that is not one
 * of these cannot be a subdivision of anything.
 */
// prettier-ignore
const ISO_3166_1_ALPHA2 = new Set([
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD',
  'BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA',
  'CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE',
  'DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA',
  'GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK',
  'HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT',
  'LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS',
  'MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS',
  'RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST',
  'SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW',
  'TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA',
  'ZM','ZW',
])

/**
 * Words that say the sentence is about geography. Required before an
 * unverifiable subdivision token is read as a place: this engine ships
 * subdivision tables for four countries, and for the other 245 it cannot tell
 * `DE-BY` (Bavaria) from `PG-13` (a film rating) by the token alone.
 */
const GEO_CONTEXT_RE =
  /\b(?:ISO\s*3166|subdivisions?|regions?|states?|provinces?|prefectures?|counties|counties|territor(?:y|ies)|geo(?:graph\w*|s)?|geotarget\w*|target(?:s|ed|ing)?|markets?|nations?|countr(?:y|ies)|localit\w*|dma|metros?)\b/i

/**
 * Should this ISO-3166-2-shaped token be read as a region?
 *
 * Three verdicts, because the three cases have different consequences:
 *
 *  - `region`   the prefix is a real country and the suffix is in a subdivision
 *               table this engine ships. The buyer typed the emitted value.
 *  - `unverified` the prefix is a real country, the engine has no table for it,
 *               and the sentence is about geography. Emitted, with a warning
 *               saying the code was not checked against ISO 3166-2.
 *  - `reject`   anything else. No region, and a warning naming the token, so a
 *               film rating never becomes a geo filter and a dropped code never
 *               disappears in silence.
 */
function subdivisionVerdict(
  country: string,
  suffix: string,
  sentence: string,
): 'region' | 'unverified' | 'reject' {
  if (!ISO_3166_1_ALPHA2.has(country)) return 'reject'
  const table = SUBDIVISION_CODES[country]
  // Where the engine ships a table, membership decides and the sentence does
  // not get a vote: 'US-XX' is a code that does not exist, however geographic
  // the words around it are.
  if (table) return table.has(suffix) ? 'region' : 'reject'
  return GEO_CONTEXT_RE.test(sentence) ? 'unverified' : 'reject'
}

/** The sentence a character offset falls in. Cheap, and enough for a cue test. */
function sentenceAround(text: string, at: number): string {
  let s = at
  let e = at
  while (s > 0 && !/[.;\n!?]/.test(text[s - 1]!)) s -= 1
  while (e < text.length && !/[.;\n!?]/.test(text[e]!)) e += 1
  return text.slice(s, e)
}

const SUBDIVISION_SETS: ReadonlyArray<{ country: string; names: ReadonlyArray<[string, string]> }> =
  [
    { country: 'US', names: US_STATES },
    { country: 'GB', names: GB_NATIONS },
    { country: 'CA', names: CA_PROVINCES },
    { country: 'AU', names: AU_STATES },
  ]

/**
 * Subdivision codes this engine can positively verify, by country. Built from
 * the name tables above plus the codes that have no name entry (US territories
 * have ISO 3166-2 codes and are not states). A token whose suffix is in here is
 * a place; a token whose suffix is not is checked against the sentence instead,
 * because these four tables are not ISO 3166-2 — they are the part of it this
 * engine ships.
 */
const SUBDIVISION_CODES: Readonly<Record<string, ReadonlySet<string>>> = {
  US: new Set([...US_STATES.map(([, c]) => c), 'PR', 'VI', 'GU', 'AS', 'MP', 'UM']),
  GB: new Set(GB_NATIONS.map(([, c]) => c)),
  CA: new Set(CA_PROVINCES.map(([, c]) => c)),
  AU: new Set(AU_STATES.map(([, c]) => c)),
}

const AMBIGUOUS_PLACE_RE = namesRegex(AMBIGUOUS_PLACE_NAMES.map(([n]) => n))
const AMBIGUOUS_PLACE_BY_NAME = new Map(
  AMBIGUOUS_PLACE_NAMES.map(([n, msg]) => [n.toLowerCase(), msg]),
)

function extractGeo(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const hits: GeoHit[] = []

  // --- ambiguous names first, so they occupy the span and block a wrong read ---
  const ambiguousHits: Candidate[] = []
  for (const m of text.matchAll(AMBIGUOUS_PLACE_RE)) {
    const surface = m[0]
    // 'Washington State' / 'Washington, D.C.' disambiguate themselves; let the
    // subdivision matcher below handle those and do not block them here.
    const after = text.slice(m.index + surface.length, m.index + surface.length + 12)
    if (/^\s*(?:State\b|state\b|,?\s*D\.?C\.?\b)/.test(after)) continue
    ambiguousHits.push({ start: m.index, end: m.index + surface.length, payload: null })
    warnings.push(AMBIGUOUS_PLACE_BY_NAME.get(surface.toLowerCase())!)
  }

  // --- countries by name: a mapping, therefore `derived` ---
  for (const m of text.matchAll(COUNTRY_NAME_RE)) {
    const code = COUNTRY_BY_NAME.get(m[0].toLowerCase())
    if (!code) continue
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      payload: {
        kind: 'country',
        value: code,
        raw: m[0],
        rule: `'${m[0]}' → countries: ['${code}'] (ISO 3166-1 alpha-2 name match).`,
      },
    })
  }

  // --- countries by abbreviation, case-sensitive ---
  for (const m of text.matchAll(COUNTRY_ABBR_RE)) {
    const entry = COUNTRY_ABBR[m[0]]
    if (!entry) continue
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      payload: {
        kind: 'country',
        value: entry.code,
        raw: m[0],
        // 'US' is literally the emitted value; anything else is a conversion.
        rule: m[0] === entry.code ? undefined : entry.rule,
      },
    })
  }

  // --- literal ISO 3166-2 tokens: `US-NY`. The buyer typed the emitted value,
  //     but only once the token is checked: the same shape covers `PG-13` and
  //     `TV-MA`, and `PG` and `TV` are assigned country codes. ---
  for (const m of text.matchAll(ISO_3166_2_RE)) {
    const country = m[1]!
    const suffix = m[2]!
    const verdict = subdivisionVerdict(country, suffix, sentenceAround(text, m.index))
    if (verdict === 'reject') {
      warnings.push(
        `'${m[0]}' is shaped like an ISO 3166-2 subdivision code, and ${
          !ISO_3166_1_ALPHA2.has(country)
            ? `'${country}' is not an ISO 3166-1 alpha-2 country code`
            : SUBDIVISION_CODES[country]
              ? `'${suffix}' is not a subdivision of ${country} in this engine's table for that country`
              : 'nothing in the sentence reads as geography'
        }. No region filter was emitted — a content rating, a creative code or a product SKU has the same shape as a place, and an invented region is a request for inventory somewhere that does not exist. Write the country and subdivision in words if you meant a place.`,
      )
      continue
    }
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      payload: {
        kind: 'region',
        value: m[0],
        raw: m[0],
        unverified: verdict === 'unverified',
      },
    })
    if (verdict === 'unverified') {
      warnings.push(
        `'${m[0]}' was read as an ISO 3166-2 region because the sentence is about geography, but this engine ships subdivision tables for US, GB, CA and AU only and could not check '${suffix}' against ISO 3166-2 for ${country}. It is emitted as you wrote it; verify the code before you send the request.`,
      )
    }
  }

  // --- subdivisions by name, per country ---
  for (const set of SUBDIVISION_SETS) {
    const re = namesRegex(set.names.map(([n]) => n))
    const byName = new Map(set.names.map(([n, c]) => [n.toLowerCase(), c]))
    for (const m of text.matchAll(re)) {
      const code = byName.get(m[0].toLowerCase())
      if (!code) continue
      const value = `${set.country}-${code}`
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        payload: {
          kind: 'region',
          value,
          raw: m[0],
          rule: `'${m[0]}' → regions: ['${value}'] (ISO 3166-2 subdivision name match within ${set.country}).`,
        },
      })
    }
  }

  // 'Washington State' → US-WA needs the whole phrase to own the span so the
  // ambiguity warning above does not also fire on the same words.
  for (const m of text.matchAll(/\bWashington\s+[Ss]tate\b/g)) {
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      payload: {
        kind: 'region',
        value: 'US-WA',
        raw: m[0],
        rule: "'Washington State' → regions: ['US-WA'] (ISO 3166-2; the phrase distinguishes the state from the District of Columbia).",
      },
    })
  }
  for (const m of text.matchAll(/\bWashington,?\s*D\.?C\.?\b/g)) {
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      payload: {
        kind: 'region',
        value: 'US-DC',
        raw: m[0],
        rule: "'Washington, D.C.' → regions: ['US-DC'] (ISO 3166-2 code for the District of Columbia).",
      },
    })
  }

  const kept = dropOverlaps<GeoHit>(
    hits.filter((h) => !ambiguousHits.some((a) => h.start < a.end && a.start < h.end)),
  )

  // 'New York' is a state and the largest Nielsen DMA. Emit the region — it is
  // the reading the words support — and say the other reading exists.
  if (kept.some((h) => h.payload.kind === 'region' && h.payload.value === 'US-NY')) {
    warnings.push(
      "'New York' was read as the state (ISO 3166-2 'US-NY'). If you meant the metro, state the Nielsen DMA code — AdCP `filters.metros` needs {system, code} and the two filters select different inventory.",
    )
  }

  emitGeoField(text, fields, kept, 'country', 'countries')
  emitGeoField(text, fields, kept, 'region', 'regions')
  extractMetros(text, fields, warnings)
  extractPostalAreas(text, fields, warnings)
}

function emitGeoField(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  kept: GeoHit[],
  kind: 'country' | 'region',
  key: string,
): void {
  const mine = kept.filter((h) => h.payload.kind === kind)
  if (mine.length === 0) return
  const values = uniq(mine.map((h) => h.payload.value))
  const spans = mine.map((h) => span(text, h.start, h.end))
  const raw = mine.map((h) => h.payload.raw)
  const rules = uniq(mine.map((h) => h.payload.rule).filter((r): r is string => Boolean(r)))
  const unverified = mine.filter((h) => h.payload.unverified).map((h) => h.payload.value)
  const extra: Partial<FieldValue<string[]>> = { raw }
  if (unverified.length > 0) {
    extra.note = `${unverified.join(', ')} ${unverified.length === 1 ? 'was' : 'were'} typed as ISO 3166-2 and could not be checked against a subdivision table for that country; ${unverified.length === 1 ? 'it is' : 'they are'} emitted exactly as written.`
  }
  // A list is only `stated` when every member was written as the code itself.
  // One name match makes the whole array a mapping.
  fields[key] =
    rules.length === 0
      ? stated(values, spans, extra)
      : derived(values, spans, rules.join(' '), extra)
}

/* ---------------------------- metros ---------------------------- */

/** `DMA 501`, `Nielsen DMAs 501, 803 and 602`, `DMA code 501`. */
const DMA_CODE_RE =
  /\b(?:Nielsen\s+)?DMAs?\b\s*(?:codes?|numbers?)?\s*[:#]?\s*(\d{3}(?:\s*(?:,|and|&)\s*\d{3})*)/gi

/** Eurostat NUTS 2 (`NUTS2 UKI3`) and UK ITL (`ITL1 TLI`). */
const NUTS2_RE = /\bNUTS[-\s]?2\b\s*[:#]?\s*([A-Z]{2}[A-Z0-9]{1,3})\b/g
const ITL_RE = /\bITL[-\s]?([12])\b\s*[:#]?\s*([A-Z]{2,5})\b/g

/**
 * A metro named in prose with no code: `Chicago metro`, `New York DMA`,
 * `top 10 DMAs`. Captured so the warning can quote it, never converted.
 */
const METRO_NAME_RE =
  /\b((?:top\s+\d+|[A-Z][A-Za-z.]+(?:[ -][A-Z][A-Za-z.]+){0,3}))\s+(DMAs?|metro(?:politan)?(?:\s+area)?s?|local\s+markets?)\b/g

function extractMetros(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const values: Array<{ system: string; code: string }> = []
  const spans: Span[] = []
  const raws: string[] = []

  for (const m of text.matchAll(DMA_CODE_RE)) {
    for (const code of m[1].split(/\s*(?:,|and|&)\s*/)) {
      values.push({ system: 'nielsen_dma', code })
    }
    spans.push(span(text, m.index, m.index + m[0].length))
    raws.push(m[0])
  }
  for (const m of text.matchAll(NUTS2_RE)) {
    values.push({ system: 'eurostat_nuts2', code: m[1] })
    spans.push(span(text, m.index, m.index + m[0].length))
    raws.push(m[0])
  }
  for (const m of text.matchAll(ITL_RE)) {
    values.push({ system: m[1] === '1' ? 'uk_itl1' : 'uk_itl2', code: m[2] })
    spans.push(span(text, m.index, m.index + m[0].length))
    raws.push(m[0])
  }

  // Named metros with no code. This is the table the engine refuses to ship.
  const named: string[] = []
  for (const m of text.matchAll(METRO_NAME_RE)) {
    if (spans.some((s) => m.index < s.end && s.start < m.index + m[0].length)) continue
    named.push(m[0])
  }
  if (named.length > 0) {
    warnings.push(
      `${named.map((n) => `'${n}'`).join(', ')} names a metro area but no metro code was stated. AdCP \`filters.metros\` requires {system, code} (e.g. {system: 'nielsen_dma', code: '501'}), and this engine ships no name-to-code table — an invented DMA code is a media plan pointed at the wrong city. State the code, or the metro filter is dropped.`,
    )
  }

  if (values.length > 0) {
    fields.metros = derived(
      values,
      spans,
      `Metro codes were read as {system, code} pairs for AdCP \`filters.metros\`; '${raws.join("', '")}' names the system explicitly.`,
      { raw: raws },
    )
  } else if (named.length > 0) {
    fields.metros = absent({
      raw: named,
      note: 'A metro was named in prose but carries no code, so no `filters.metros` entry could be built.',
    })
  }
}

/* -------------------------- postal areas -------------------------- */

/** `ZIP codes 90210, 10001` — the cue is required; five bare digits are not a ZIP. */
const US_ZIP_RE =
  /\b(?:ZIP|zip)(?:\s*\+\s*4|\s*codes?|codes?)?s?\b\s*[:#]?\s*(\d{5}(?:-\d{4})?(?:\s*(?:,|and|&|\/)\s*\d{5}(?:-\d{4})?)*)/g

/** `postcodes EC1, SW1` / `outward codes M1, B1`. */
const GB_OUTWARD_RE =
  /\b(?:post\s?codes?|outward\s?codes?)\b\s*[:#]?\s*([A-Z]{1,2}\d[A-Z\d]?(?:\s*(?:,|and|&|\/)\s*[A-Z]{1,2}\d[A-Z\d]?)*)\b/g

function extractPostalAreas(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const areas: Array<{ country: string; system: string; values: string[] }> = []
  const spans: Span[] = []
  const rules: string[] = []
  const raws: string[] = []

  for (const m of text.matchAll(US_ZIP_RE)) {
    const codes = m[1].split(/\s*(?:,|and|&|\/)\s*/)
    const plusFour = codes.some((c) => c.includes('-'))
    areas.push({ country: 'US', system: plusFour ? 'zip_plus_four' : 'zip', values: codes })
    spans.push(span(text, m.index, m.index + m[0].length))
    raws.push(m[0])
    rules.push(
      `'ZIP code' is the United States Postal Service term, so country: 'US' and system: '${plusFour ? 'zip_plus_four' : 'zip'}' follow from the vocabulary used (AdCP core/postal-area.json prefers the country + postal-system form).`,
    )
  }

  for (const m of text.matchAll(GB_OUTWARD_RE)) {
    const codes = m[1].split(/\s*(?:,|and|&|\/)\s*/)
    areas.push({ country: 'GB', system: 'outward', values: codes })
    spans.push(span(text, m.index, m.index + m[0].length))
    raws.push(m[0])
    rules.push(
      `The codes match the UK outward-code shape (one or two letters, a digit, an optional third character), so country: 'GB' and system: 'outward'.`,
    )
    warnings.push(
      "'postcode' is also the everyday term in Australia, New Zealand and Ireland. The engine read these as UK outward codes on the shape of the values alone — name the country if that is wrong.",
    )
  }

  if (areas.length > 0) {
    fields.postal_areas = derived(areas, spans, rules.join(' '), { raw: raws })
  }
}

/* ==================================================================== *
 * MONEY
 * ==================================================================== */

/**
 * A numeric amount with an optional attached currency sign and an optional
 * scale suffix. Built from SIGN_ALTERNATION so the sign table stays the single
 * source of truth.
 *
 *   (?:(sign)\s?)?   sign and its optional space, together, so that a missing
 *                    sign cannot leave the leading space inside the span
 *   (num)            1,234,567.89 | 1234567.89 — a comma group is one of the
 *                    things that qualifies a bare number as money
 *   (?:\s?(mult)\b)? k | m | mm | mn | bn | thousand | million | billion,
 *                    with \b so that "500 meters" is not 500 million
 */
const MONEY_RE = new RegExp(
  `(?:(${SIGN_ALTERNATION})\\s?)?` +
    `(\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?)` +
    `(?:\\s?(k|mm|mn|mil|m|bn|thousand|million|billion)\\b)?`,
  'gi',
)

/** `half a million`, `a million`, `three quarters of a billion`. */
const WORD_MONEY_RE = new RegExp(
  `\\b(${Object.keys(NUMBER_WORDS)
    .sort((a, b) => b.length - a.length)
    .join('|')})\\s+(?:of\\s+)?(?:an?\\s+)?(${Object.keys(SCALE_WORDS).join('|')})\\b`,
  'gi',
)

/** An ISO 4217 code immediately before an amount: `USD 500,000`. Case-sensitive. */
const CODE_BEFORE_RE = /([A-Z]{3})[\s ]{0,2}$/
/**
 * An ISO 4217 code immediately after an amount: `500,000 EUR`, `$500,000 (USD)`.
 * Case-sensitive, and the optional bracket matters: putting the code in
 * parentheses after a `$` is the commonest way a buyer disambiguates the sign,
 * and refusing to read it would leave the budget with no currency at all.
 */
const CODE_AFTER_RE = /^[\s ]{0,2}[([]?\s?([A-Z]{3})\b/

/** Cues before an amount that make it a unit price rather than a budget. */
const UNIT_PRICE_BEFORE_RE =
  /(?:CPM|CPC|CPCV|CPV|cost[\s-]per|priced?\s+at|price\s+of|floor(?:\s+price)?(?:\s+of)?|rate\s+of)\W{0,6}$/i
/** The same cue trailing the amount: `$45 CPM`, `£20 CPMs`. */
const UNIT_PRICE_AFTER_RE = /^\W{0,3}(?:CPM|CPC|CPCV|CPV)s?\b/i

/** Cues that bind an amount to the lower bound. */
const MIN_CUE_RE =
  /\b(?:at\s+least|no\s+less\s+than|not\s+less\s+than|minimum(?:\s+(?:budget|spend|of))?|min(?:\s+of)?|budget\s+floor|floor\s+of|starting\s+(?:at|from)|upwards\s+of|north\s+of)\W{0,4}$/i

/** Cues that bind an amount to the upper bound. */
const MAX_CUE_RE =
  /\b(?:up\s+to|no\s+more\s+than|not\s+more\s+than|not\s+to\s+exceed|maximum(?:\s+(?:budget|spend|of))?|max(?:\s+of)?|capped\s+at|cap\s+of|budget\s+cap|ceiling\s+of|at\s+most|under|below|less\s+than)\W{0,4}$/i

/** `between $200k and $500k` — only then does `and` join two amounts into a range. */
const BETWEEN_RE = /\bbetween\W{0,4}$/i

/** Commercial qualifiers neither protocol can carry. */
const NET_GROSS_RE = /^[\s,]{0,3}(net|gross|net\s+net|nett)\b/i

/**
 * Nouns that name a thing being COUNTED. A number followed by one of these is a
 * volume — impressions, households, plays — and it is not money, however it is
 * punctuated. Thousands separators say nothing about the unit: `250,000
 * impressions` and `250,000 dollars` are separated by the noun and by nothing
 * else, and writing the first to `budget_min` puts a number nobody committed
 * into `filters.budget_range.min`, which is committed money in a document
 * someone signs.
 *
 * `per deal` impression floors have their own home — AAMP
 * `deal_preferences.min_impressions`, extracted in policy-controls.ts — so
 * refusing them here loses nothing.
 */
const COUNTED_NOUN_AFTER_RE =
  /^[\s,]{0,3}(?:\+\s*)?(?:more\s+|additional\s+|incremental\s+|net[\s-]new\s+|unique\s+|qualified\s+|monthly\s+|weekly\s+|daily\s+|total\s+)?(?:impressions?|imps?|impr|views?|viewers?|viewings?|households?|homes?|people|persons?|users?|uniques?|adults?|kids?|clicks?|conversions?|actions?|installs?|downloads?|signups?|sign[\s-]ups?|sessions?|visits?|visitors?|subscribers?|members?|fans?|followers?|streams?|plays?|listens?|completions?|engagements?|leads?|units?|stores?|locations?|sites?|domains?|placements?|creatives?|spots?|panels?|screens?|GRPs?|TRPs?|eyeballs?)\b/i

/**
 * Words that make a bare number money. A number with no currency sign, no ISO
 * 4217 code and no currency word is only a budget if something in the sentence
 * says it is one — `Budget: 500,000` is money, `Reach 2,000,000` is not. The
 * engine reads the words rather than the punctuation.
 */
const MONEY_CUE_BEFORE_RE =
  /\b(?:budgets?|budgeted|budgeting|spend(?:s|ing)?|spent|invest(?:s|ing|ment)?|working\s+media|media\s+(?:spend|budget|dollars)|cost(?:s|ing)?|fees?|prices?|priced|pricing|allocat(?:e|es|ed|ing|ion)|commit(?:s|ted|ment)?|approved?|funds?|funded|funding|pay|paying|paid|worth|value\s+of|net|gross)\b[^.;\n]{0,28}$/i

interface Money {
  start: number
  end: number
  amount: number
  code?: string
  /** How the currency was established, which decides `stated` versus `derived`. */
  source?: 'sign' | 'code' | 'word'
  /** Span of the currency evidence alone, for the `currency` field. */
  currencySpan?: [number, number]
  currencyRule?: string
  currencyAmbiguity?: string
  qualifier?: string
  unitPrice: boolean
}

function scanMoney(text: string): Money[] {
  const found: Money[] = []

  for (const m of text.matchAll(MONEY_RE)) {
    const signText = m[1]
    const numText = m[2]
    const multText = m[3]

    let start = m.index
    let end = m.index + m[0].length
    let amount = Number(numText.replace(/,/g, ''))
    if (!Number.isFinite(amount)) continue
    if (multText) amount *= MULTIPLIERS[multText.toLowerCase()] ?? 1

    let code: string | undefined
    let source: Money['source']
    let currencySpan: [number, number] | undefined
    let currencyRule: string | undefined
    let currencyAmbiguity: string | undefined

    if (signText) {
      const sign = SIGN_BY_TEXT.get(signText.toUpperCase())
      if (sign) {
        code = sign.code
        source = 'sign'
        currencySpan = [m.index, m.index + signText.length]
        currencyRule = `'${signText}' is the currency sign for ${sign.code}; a sign on the amount fixes the ISO 4217 code both protocols require.`
        currencyAmbiguity = sign.ambiguity
      }
    }

    // `USD 500,000`.
    //
    // Also runs when a sign already set the code AMBIGUOUSLY: '$500,000 USD'
    // says USD outright, and an explicit ISO 4217 code next to the amount
    // settles what the sign could not. The code wins because it is the thing
    // both protocols carry and the buyer wrote it.
    if (!code || currencyAmbiguity) {
      const before = text.slice(Math.max(0, start - 6), start)
      const bm = CODE_BEFORE_RE.exec(before)
      if (bm && ISO_4217.has(bm[1])) {
        code = bm[1]
        source = 'code'
        const cStart = Math.max(0, start - 6) + bm.index
        currencySpan = [cStart, cStart + 3]
        currencyRule = undefined
        currencyAmbiguity = undefined
        start = cStart
      }
    }

    // `500,000 EUR` / `500,000 dollars`
    if (!code || currencyAmbiguity) {
      const after = text.slice(end, end + 24)
      const am = CODE_AFTER_RE.exec(after)
      if (am && ISO_4217.has(am[1])) {
        code = am[1]
        source = 'code'
        const cStart = end + am[0].length - 3
        currencySpan = [cStart, cStart + 3]
        currencyRule = undefined
        currencyAmbiguity = undefined
        end = cStart + 3
      } else if (currencyAmbiguity === undefined) {
        const trimmed = after.replace(/^[\s ]{0,2}/, '')
        const lead = after.length - trimmed.length
        for (const w of CURRENCY_WORDS) {
          const wm = w.re.exec(trimmed)
          if (!wm) continue
          code = w.code
          source = 'word'
          currencySpan = [end + lead, end + lead + wm[0].length]
          currencyRule = `'${wm[0]}' names the currency ${w.code} (ISO 4217).`
          currencyAmbiguity = w.ambiguity
          end = end + lead + wm[0].length
          break
        }
      }
    }

    const before = text.slice(Math.max(0, start - 32), start)

    // Qualification, in two clauses.
    //
    //  1. A currency sign, an ISO 4217 code or a currency word makes it money.
    //     Nothing else does on its own: a scale suffix and a thousands
    //     separator are typography, and `250,000 impressions` is typed exactly
    //     like `250,000 dollars`.
    //  2. Without one of those, the number is money only if the words around it
    //     say so — a budget cue before it, and no counted noun after it. A
    //     count with a budget cue in front ("budget covers 2,000,000
    //     impressions") is still a count, so the noun test is the stronger one
    //     and is applied to signed amounts too.
    //
    // This is what keeps "adults 25-54", "frequency cap 3 per week" and
    // "minimum 250,000 impressions per deal" out of the budget fields. The
    // impression floor has its own field — AAMP `deal_preferences.min_impressions`,
    // extracted in policy-controls.ts — and reaches it there.
    if (COUNTED_NOUN_AFTER_RE.test(text.slice(end, end + 32))) continue
    const qualified =
      Boolean(code) ||
      (Boolean(multText || numText.includes(',')) && MONEY_CUE_BEFORE_RE.test(before))
    if (!qualified) continue

    const qm = NET_GROSS_RE.exec(text.slice(end, end + 12))

    found.push({
      start,
      end,
      amount: Math.round(amount * 100) / 100,
      code,
      source,
      currencySpan,
      currencyRule,
      currencyAmbiguity,
      qualifier: qm?.[1],
      unitPrice:
        UNIT_PRICE_BEFORE_RE.test(before) || UNIT_PRICE_AFTER_RE.test(text.slice(end, end + 8)),
    })
  }

  // Written amounts: `half a million dollars`, `a million`.
  for (const m of text.matchAll(WORD_MONEY_RE)) {
    const n = NUMBER_WORDS[m[1].toLowerCase()]
    const scale = SCALE_WORDS[m[2].toLowerCase()]
    if (n === undefined || scale === undefined) continue
    let end = m.index + m[0].length
    let code: string | undefined
    let source: Money['source']
    let currencySpan: [number, number] | undefined
    let currencyRule: string | undefined
    let currencyAmbiguity: string | undefined

    const after = text.slice(end, end + 24)
    const trimmed = after.replace(/^[\s ]{0,2}/, '')
    const lead = after.length - trimmed.length
    const am = CODE_AFTER_RE.exec(after)
    if (am && ISO_4217.has(am[1])) {
      code = am[1]
      source = 'code'
      const cStart = end + am[0].length - 3
      currencySpan = [cStart, cStart + 3]
      end = cStart + 3
    } else {
      for (const w of CURRENCY_WORDS) {
        const wm = w.re.exec(trimmed)
        if (!wm) continue
        code = w.code
        source = 'word'
        currencySpan = [end + lead, end + lead + wm[0].length]
        currencyRule = `'${wm[0]}' names the currency ${w.code} (ISO 4217).`
        currencyAmbiguity = w.ambiguity
        end = end + lead + wm[0].length
        break
      }
    }

    // A written amount with a sign in front of it (`$half a million`) is not a
    // thing anyone writes, so the sign path is not repeated here.
    const before = text.slice(Math.max(0, m.index - 32), m.index)
    if (found.some((f) => m.index < f.end && f.start < end)) continue
    // Same two clauses as the digit path: 'two million households' is a reach
    // figure, and 'a million' with nothing around it is not a budget either.
    if (COUNTED_NOUN_AFTER_RE.test(text.slice(end, end + 32))) continue
    if (!code && !MONEY_CUE_BEFORE_RE.test(before)) continue

    found.push({
      start: m.index,
      end,
      amount: Math.round(n * scale * 100) / 100,
      code,
      source,
      currencySpan,
      currencyRule,
      currencyAmbiguity,
      qualifier: NET_GROSS_RE.exec(text.slice(end, end + 12))?.[1],
      unitPrice:
        UNIT_PRICE_BEFORE_RE.test(before) || UNIT_PRICE_AFTER_RE.test(text.slice(end, end + 8)),
    })
  }

  return found.sort((a, b) => a.start - b.start)
}

function extractMoney(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  offered: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const all = scanMoney(text)
  const budgets = all.filter((m) => !m.unitPrice)

  // --- ranges: two amounts joined by a connector ---
  const pairedAsRange = new Set<number>()
  const ranges: Array<{ lo: Money; hi: Money }> = []
  for (let i = 0; i + 1 < budgets.length; i++) {
    const a = budgets[i]!
    const b = budgets[i + 1]!
    const between = text.slice(a.end, b.start)
    const isDash = /^\s*(?:-|–|—|to|through|thru)\s*$/i.test(between)
    const isAnd =
      /^\s*and\s*$/i.test(between) &&
      BETWEEN_RE.test(text.slice(Math.max(0, a.start - 16), a.start))
    if (!isDash && !isAnd) continue
    pairedAsRange.add(i)
    pairedAsRange.add(i + 1)
    ranges.push(a.amount <= b.amount ? { lo: a, hi: b } : { lo: b, hi: a })
    i++
  }

  const singles = budgets.filter((_, i) => !pairedAsRange.has(i))

  // --- classify each single by the words immediately before it ---
  const mins: Money[] = []
  const maxes: Money[] = []
  const totals: Money[] = []
  for (const m of singles) {
    const before = text.slice(Math.max(0, m.start - 32), m.start)
    if (MIN_CUE_RE.test(before)) mins.push(m)
    else if (MAX_CUE_RE.test(before)) maxes.push(m)
    else totals.push(m)
  }

  const used: Money[] = []

  for (const r of ranges) {
    fields.budget_min = stated(r.lo.amount, [span(text, r.lo.start, r.lo.end)], {
      note: 'Lower bound of a stated budget range.',
    })
    fields.budget_total = stated(r.hi.amount, [span(text, r.hi.start, r.hi.end)], {
      note: 'Upper bound of a stated budget range. AdCP carries it as `filters.budget_range.max`; AAMP `total_budget` is committed money, and a range does not say which end of it is committed.',
    })
    warnings.push(
      `A budget range was stated (${r.lo.amount}–${r.hi.amount}). AAMP \`total_budget\` is a single committed figure with no range form, so emitting an AAMP brief will require choosing one end of it.`,
    )
    used.push(r.lo, r.hi)
  }

  if (mins.length === 1 && !fields.budget_min) {
    fields.budget_min = stated(mins[0]!.amount, [span(text, mins[0]!.start, mins[0]!.end)], {
      note: 'Stated as a floor.',
    })
    used.push(mins[0]!)
  } else if (mins.length > 1) {
    warnings.push(
      `${mins.length} different minimum-budget figures were stated. The engine does not choose between them, so \`budget_min\` is missing.`,
    )
    used.push(...mins)
  }

  const upper = [...maxes, ...totals]
  if (!fields.budget_total && upper.length === 1) {
    const m = upper[0]!
    const isCeiling = maxes.length === 1
    fields.budget_total = stated(m.amount, [span(text, m.start, m.end)], {
      note: isCeiling ? 'Stated as a ceiling.' : UNBOUNDED_BUDGET_NOTE,
    })
    if (!isCeiling) {
      // The documented decision. A single figure is genuinely ambiguous:
      // AdCP `budget_range` wants a bound, AAMP `total_budget` wants committed
      // money, and "$500,000 net" says neither. The engine labels the value
      // `stated` — the number IS in the input — and returns the ambiguity as a
      // warning rather than inventing `min` or `max`.
      warnings.push(
        `'${text.slice(m.start, m.end)}' states one budget figure and no bound. The engine records it as the total budget and does not decide whether it is a ceiling (spend no more), a target (spend this) or a floor: AdCP \`filters.budget_range\` requires min or max, so that choice must be made explicitly before the request is sent.`,
      )
    }
    used.push(m)
  } else if (!fields.budget_total && upper.length > 1) {
    warnings.push(
      `${upper.length} budget figures were stated with no range or bound cue between them (${upper.map((m) => text.slice(m.start, m.end)).join(', ')}). The engine does not choose one, so \`budget_total\` is missing.`,
    )
    used.push(...upper)
  }

  // --- commercial qualifiers ---
  for (const m of used) {
    if (!m.qualifier) continue
    warnings.push(
      `'${text.slice(m.start, m.end)} ${m.qualifier}' carries a commercial qualifier. Neither AdCP \`budget_range\` nor AAMP \`total_budget\` has a net/gross flag, so only the number travels — whether it is net of commission is lost on the wire.`,
    )
  }

  // --- unit prices are recorded as a gap, not as a budget ---
  for (const m of all.filter((x) => x.unitPrice)) {
    warnings.push(
      `'${text.slice(m.start, m.end)}' reads as a unit price rather than a budget, so it was not written to \`budget_total\`. AdCP \`get_products\` has no unit-price ceiling anywhere — \`budget_range\` bounds total spend, not CPM — and AAMP carries it only as \`deal_preferences.max_cpm\`.`,
    )
  }

  // --- currency ---
  extractCurrency(text, fields, offered, warnings, used.length > 0 ? used : all)
}

function extractCurrency(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  offered: Record<string, FieldValue<unknown>>,
  warnings: string[],
  relevant: Money[],
): void {
  const carriers = relevant.filter((m) => m.code)
  const codes = uniq(carriers.map((m) => m.code!))

  if (codes.length > 1) {
    warnings.push(
      `More than one currency was stated for the budget (${codes.join(', ')}). AdCP \`budget_range.currency\` and AAMP \`currency\` are both single-valued, so the engine emits neither.`,
    )
  } else if (codes.length === 1) {
    const m = carriers[0]!
    const spans = carriers
      .filter((c) => c.currencySpan)
      .map((c) => span(text, c.currencySpan![0], c.currencySpan![1]))
    if (m.currencyAmbiguity) {
      // THE AMBIGUOUS SIGN. '$' is the sign of at least seven currencies and
      // 'dollars' names at least six; '¥' is yen and yuan. Resolving one of
      // those to its most common member is a GUESS, not a derivation — the
      // vocabulary table carries the ambiguity string precisely because the
      // mapping is one-to-many — so it goes where every other guess in this
      // engine goes: `offered`, unemitted, until a caller accepts the key.
      //
      // `filters.budget_range.currency` is required, so an unaccepted
      // assumption here costs the whole budget on the wire. That is the
      // correct price: a brief that says '$500,000' to a Toronto seller has
      // not said USD, and emit.ts promises in two places that the engine will
      // not assume USD.
      fields.currency = absent({
        raw: spans.map((s) => s.text),
        note: `The amount carries ${spans[0] ? `'${spans[0].text}'` : 'an ambiguous currency marker'}, which names more than one currency. The engine will not pick one; accept the \`currency\` assumption or write the ISO 4217 code.`,
      })
      offered.currency = assumed(codes[0], m.currencyAmbiguity, {
        raw: spans.map((s) => s.text),
        spans,
      })
      warnings.push(m.currencyAmbiguity)
    } else {
      fields.currency =
        m.source === 'code'
          ? stated(codes[0], spans, { raw: spans.map((s) => s.text) })
          : derived(codes[0], spans, m.currencyRule!, { raw: spans.map((s) => s.text) })
    }
  } else {
    // A standalone declaration with no amount attached: "Currency: EUR".
    const decl =
      /\b(?:currency|denominated\s+in|priced\s+in|billed\s+in|reported\s+in)\b\W{0,12}([A-Z]{3})\b/.exec(
        text,
      )
    if (decl && ISO_4217.has(decl[1]!)) {
      const s = decl.index + decl[0].length - 3
      fields.currency = stated(decl[1], [span(text, s, s + 3)])
    } else {
      // THE NEGATIVE CASE. A number with no sign, no code and no currency word
      // does not imply USD, however American the rest of the brief looks.
      const anyBudget = relevant.length > 0
      fields.currency = absent({
        note: anyBudget
          ? 'A budget figure was stated with no currency sign, ISO 4217 code or currency word. The engine does not default to USD.'
          : undefined,
      })
      if (anyBudget) {
        warnings.push(
          'A budget amount was stated with no currency. `currency` is the only required key of AdCP `filters.budget_range` and is required by AAMP `CampaignBrief`, so the budget cannot be transacted until a currency is stated. The engine does not assume USD.',
        )
      }
    }
  }

  extractPricingCurrencies(text, fields, offered, warnings)
}

/** `we can transact in USD and EUR`, `pricing currencies: USD, CAD`. */
const PRICING_CURRENCY_CUE_RE =
  /\b(?:pricing\s+currenc(?:y|ies)|(?:can|able\s+to)\s+(?:transact|settle|pay|be\s+billed|be\s+invoiced)\s+in|transactable\s+in|settle\s+in|billed\s+in|invoiced\s+in)\b/gi

function extractPricingCurrencies(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  offered: Record<string, FieldValue<unknown>>,
  _warnings: string[],
): void {
  const values: string[] = []
  const spans: Span[] = []
  for (const cue of text.matchAll(PRICING_CURRENCY_CUE_RE)) {
    const from = cue.index + cue[0].length
    const window = text.slice(from, from + 60).split(/[.;]/)[0] ?? ''
    for (const cm of window.matchAll(/\b([A-Z]{3})\b/g)) {
      if (!ISO_4217.has(cm[1]!)) continue
      values.push(cm[1]!)
      spans.push(span(text, from + cm.index, from + cm.index + 3))
    }
  }

  if (values.length > 0) {
    fields.pricing_currencies = stated(uniq(values), spans, { raw: spans.map((s) => s.text) })
    return
  }

  // Not derived from `currency`: fields.ts is explicit that the denomination of
  // the budget and the set the buyer can settle in are different facts. It is
  // offered, and stays offered until a caller accepts it.
  const cur = fields.currency
  if (cur && cur.label !== 'missing' && typeof cur.value === 'string') {
    offered.pricing_currencies = assumed(
      [cur.value],
      `The budget is denominated in ${cur.value}, so the buyer can presumably transact in ${cur.value}. This is an assumption, not a derivation: \`filters.pricing_currencies\` is the set of currencies you can settle in, which may be wider or narrower than the one your budget is written in.`,
    )
  }
}

/* ==================================================================== *
 * PRICING SHAPE — is_fixed_price, delivery_type
 * ==================================================================== */

/** Explicit statements of fixed pricing. `\brate card\b` is the inferred one. */
const FIXED_PRICE_RE = /\bfixed[\s-]?(?:price|rate|cpm|pricing)\b|\bguaranteed\s+rate\b/gi
const RATE_CARD_RE = /\brate[\s-]?card\b/gi
const AUCTION_RE =
  /\bauction[\s-]?(?:based|pricing)?\b|\bbiddable\b|\breal[\s-]?time\s+bidding\b|\bopen\s+market\b|\bRTB\b/gi

/** Order matters: non-guaranteed must be consumed before `guaranteed` is looked for. */
const NON_GUARANTEED_RE = /\bnon[\s-]?guaranteed\b|\bpre[\s-]?emptible\b|\bnon[\s-]?reserved\b/gi
/** `guaranteed rate` is a price statement, not a delivery statement — excluded. */
const GUARANTEED_RE = /\bguaranteed\b(?!\s+(?:rate|price|cpm))|\breserved\s+inventory\b/gi
/**
 * Two patterns, not one alternation: the phrase is case-insensitive, but the
 * initialism must not be, or `pg` inside a lower-cased word becomes a delivery
 * type. They are scanned separately and merged.
 */
const PG_PHRASE_RE = /\bprogrammatic\s+guaranteed\b/gi
/**
 * `\b` closes on a hyphen, so a bare `\bPG\b` also matches the `PG` of a
 * content rating and "avoid PG-13 content" emitted
 * `filters.delivery_type: 'guaranteed'` — a brand-safety instruction read as a
 * deal type, which is both invented and close to its own opposite. A rating is
 * the only common `PG` followed by a number, so the number is the fence.
 */
const PG_ABBR_RE = /\bPG\b(?![-\s]?\d)/g

function extractPricingShape(
  text: string,
  fields: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const fixed = [...text.matchAll(FIXED_PRICE_RE)]
  const rateCard = [...text.matchAll(RATE_CARD_RE)]
  const auction = [...text.matchAll(AUCTION_RE)]

  if ((fixed.length > 0 || rateCard.length > 0) && auction.length > 0) {
    warnings.push(
      `The brief says both fixed price ('${(fixed[0] ?? rateCard[0])![0]}') and auction ('${auction[0]![0]}'). AdCP \`filters.is_fixed_price\` is a single boolean, so the engine emits neither — say which one the request should filter on, or send two requests.`,
    )
  } else if (fixed.length > 0) {
    fields.is_fixed_price = stated(
      true,
      fixed.map((m) => span(text, m.index, m.index + m[0].length)),
      { raw: fixed.map((m) => m[0]) },
    )
  } else if (rateCard.length > 0) {
    fields.is_fixed_price = derived(
      true,
      rateCard.map((m) => span(text, m.index, m.index + m[0].length)),
      "'rate card' means the seller transacts at a published fixed rate, which is what AdCP `filters.is_fixed_price: true` selects.",
      { raw: rateCard.map((m) => m[0]) },
    )
  } else if (auction.length > 0) {
    fields.is_fixed_price = derived(
      false,
      auction.map((m) => span(text, m.index, m.index + m[0].length)),
      `'${auction[0]![0]}' describes auction pricing, which AdCP expresses as \`filters.is_fixed_price: false\` (products offering at least one option without a fixed price).`,
      { raw: auction.map((m) => m[0]) },
    )
  }

  // Longest-match wins: 'non-guaranteed' consumes its own 'guaranteed', and
  // 'programmatic guaranteed' consumes the bare 'guaranteed' inside it, so the
  // more specific term decides both the value and the label.
  const nonGuar = [...text.matchAll(NON_GUARANTEED_RE)]
  const pg = [...text.matchAll(PG_PHRASE_RE), ...text.matchAll(PG_ABBR_RE)]
    .filter(
      (p) =>
        !nonGuar.some((n) => p.index < n.index + n[0].length && n.index < p.index + p[0].length),
    )
    .sort((a, b) => a.index - b.index)
  const guar = [...text.matchAll(GUARANTEED_RE)].filter(
    (g) =>
      !nonGuar.some((n) => g.index < n.index + n[0].length && n.index < g.index + g[0].length) &&
      !pg.some((p) => g.index < p.index + p[0].length && p.index < g.index + g[0].length),
  )

  if (nonGuar.length > 0 && (guar.length > 0 || pg.length > 0)) {
    warnings.push(
      'The brief asks for both guaranteed and non-guaranteed inventory. AdCP `filters.delivery_type` takes one value, so the engine emits none — use `preferred_delivery_types` for a leaning, or send one request per type.',
    )
  } else if (nonGuar.length > 0) {
    fields.delivery_type = stated(
      'non_guaranteed',
      nonGuar.map((m) => span(text, m.index, m.index + m[0].length)),
      { raw: nonGuar.map((m) => m[0]) },
    )
  } else if (guar.length > 0) {
    fields.delivery_type = stated(
      'guaranteed',
      guar.map((m) => span(text, m.index, m.index + m[0].length)),
      { raw: guar.map((m) => m[0]) },
    )
  } else if (pg.length > 0) {
    fields.delivery_type = derived(
      'guaranteed',
      pg.map((m) => span(text, m.index, m.index + m[0].length)),
      "'programmatic guaranteed' is reserved inventory with guaranteed delivery, which is AdCP `filters.delivery_type: 'guaranteed'`. The deal mechanics the term also implies have no AdCP filter.",
      { raw: pg.map((m) => m[0]) },
    )
  }
}

/* ==================================================================== *
 * DATES
 * ==================================================================== */

/**
 * One pass over the text finds every date-shaped token. Numbered groups rather
 * than named ones because several alternatives capture the same concept and
 * duplicate group names across alternatives is a newer language feature than
 * this file wants to depend on.
 *
 *   1-3    ISO            2026-11-01
 *   4-6    numeric        11/1/2026            (ambiguous unless one part > 12)
 *   7-8    month + year   November 2026        (before MDY, or "November 2026"
 *                                               parses as day 20 with "26" left)
 *   9-11   month d[, y]   November 1, 2026
 *   12-14  d month[, y]   1 November 2026
 *   15     bare month     November
 *
 * Every month alternative is fenced by `\b` on both sides. Without the closing
 * fence on the bare-month alternative, "Marketing" contains "Mar" and a brief
 * that named no dates at all came back with a March flight window labelled
 * `derived` — an invented value of exactly the class this engine exists to
 * refuse. Market, Junior, Julia, Decision, Novelty, Aprilia, Augmented and
 * Janitorial all did the same, and without the opening fence so did Trojan.
 * test/adversary.test.ts holds one case per month abbreviation.
 */
const M_OPEN = NO_WORD_BEFORE
const M_CLOSE = NO_WORD_AFTER
const DATE_TOKEN_RE = new RegExp(
  [
    '(\\d{4})-(\\d{2})-(\\d{2})',
    '(\\d{1,2})\\/(\\d{1,2})\\/(\\d{2,4})',
    `${M_OPEN}(${MONTH_SRC})${M_CLOSE}\\s+(\\d{4})${M_CLOSE}`,
    `${M_OPEN}(${MONTH_SRC})${M_CLOSE}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4})${M_CLOSE})?`,
    `${M_OPEN}(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTH_SRC})${M_CLOSE}(?:\\s*,?\\s*(\\d{4})${M_CLOSE})?`,
    `${M_OPEN}(${MONTH_SRC})${M_CLOSE}`,
  ].join('|'),
  'giu',
)

interface DateToken {
  start: number
  end: number
  text: string
  /** Absent when the surface form carried no year. */
  y?: number
  m: number
  d?: number
  /** True when only a month was named: the day comes from the range end used. */
  monthOnly: boolean
  /** Numeric form whose day/month order cannot be settled from the text. */
  ambiguousOrder?: boolean
}

function scanDateTokens(text: string, warnings: string[]): DateToken[] {
  const out: DateToken[] = []
  for (const m of text.matchAll(DATE_TOKEN_RE)) {
    const start = m.index
    const end = m.index + m[0].length
    const push = (t: Omit<DateToken, 'start' | 'end' | 'text'>) =>
      out.push({ start, end, text: m[0], ...t })

    if (m[1]) {
      push({ y: Number(m[1]), m: Number(m[2]), d: Number(m[3]), monthOnly: false })
    } else if (m[4]) {
      const a = Number(m[4])
      const b = Number(m[5])
      const y = Number(m[6]!.length === 2 ? `20${m[6]}` : m[6])
      if (a > 12 && b <= 12) push({ y, m: b, d: a, monthOnly: false })
      else if (b > 12 && a <= 12) push({ y, m: a, d: b, monthOnly: false })
      else {
        // Both readings are valid calendar dates. Return the ambiguity.
        warnings.push(
          `'${m[0]}' is ambiguous: it is ${a} ${monthName(b)} read the international way and ${b} ${monthName(a)} read the US way. No date was emitted — write it as ${String(y)}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')} or spell the month.`,
        )
        push({ y, m: a, d: b, monthOnly: false, ambiguousOrder: true })
      }
    } else if (m[7]) {
      push({ y: Number(m[8]), m: monthNumber(m[7]), monthOnly: true })
    } else if (m[9]) {
      push({
        y: m[11] ? Number(m[11]) : undefined,
        m: monthNumber(m[9]),
        d: Number(m[10]),
        monthOnly: false,
      })
    } else if (m[12]) {
      push({
        y: m[14] ? Number(m[14]) : undefined,
        m: monthNumber(m[13]!),
        d: Number(m[12]),
        monthOnly: false,
      })
    } else if (m[15]) {
      // A bare month name. Only trusted when capitalised: `may`, `march` and
      // `august` are all ordinary English words in lower case.
      if (!/^[A-Z]/.test(m[15])) continue
      push({ m: monthNumber(m[15]), monthOnly: true })
    }
  }
  return out
}

function monthName(m: number): string {
  // prettier-ignore
  return (
    [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ][m - 1] ?? String(m)
  )
}

/** Precedence: a lower rank wins. Specificity beats vagueness, never silently. */
const RANK_RANGE = 1
const RANK_LABELLED = 2
const RANK_QUARTER = 3
const RANK_MONTH = 4
const RANK_RELATIVE = 5
const RANK_DURATION = 6

interface DateCandidate {
  key: 'start_date' | 'end_date'
  ymd: Ymd
  rank: number
  label: 'stated' | 'derived'
  rule?: string
  spans: Span[]
  note?: string
}

const RANGE_CONNECTOR_RE = /^\s*(?:-|–|—|to|through|thru|until|till)\s*$/i
const BETWEEN_DATE_RE = /\bbetween\W{0,4}$/i

const START_CUE_RE =
  /\b(?:flight\s+start|start(?:s|ing)?(?:\s+date)?|begin(?:s|ning)?|launch(?:es|ing)?|live(?:\s+date)?|in\s+market\s+from|kick(?:s|ing)?\s+off|from|effective)\W{0,4}$/i
const END_CUE_RE =
  /\b(?:flight\s+end|end(?:s|ing)?(?:\s+date)?|through|thru|until|till|finish(?:es|ing)?|in\s+market\s+until|wraps?(?:\s+up)?|concludes?|to)\W{0,4}$/i

const QUARTER_RE =
  /\b(?:(FY|fiscal(?:\s+year)?)\s*)?Q([1-4])\b(?:\s*[,']?\s*(?:FY\s*)?(\d{4})\b)?/gi
const YEAR_QUARTER_RE = /\b(\d{4})\s*Q([1-4])\b/g
const ORDINAL_QUARTER_RE = /\b(first|second|third|fourth)\s+quarter\b(?:\s+(?:of\s+)?(\d{4})\b)?/gi
const RELATIVE_RE = /\b(next|this|the\s+coming|current|upcoming)\s+(quarter|month|year)\b/gi
const SEASON_RE = /\b(?:this|next|the\s+coming)\s+(spring|summer|fall|autumn|winter)\b/gi
const DURATION_RE =
  /\bfor\s+(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(day|week|month)s?\b/gi

function extractDates(
  text: string,
  ref: Ymd | undefined,
  fields: Record<string, FieldValue<unknown>>,
  warnings: string[],
): void {
  const tokens = scanDateTokens(text, warnings).filter((t) => !t.ambiguousOrder)
  const candidates: DateCandidate[] = []
  /** Warnings that are only worth printing if the field ends up missing. */
  const deferred: Array<{ key: 'start_date' | 'end_date' | 'both'; text: string }> = []
  const consumed = new Set<DateToken>()

  const refRule = (what: string) =>
    `${what} was resolved to the next occurrence on or after the reference date ${iso(ref!)} supplied by the caller. Without a reference date a relative expression has no calendar meaning, so the engine would have left it missing.`

  /** Smallest year for which (m,d) falls on or after the reference date. */
  const nextOccurrence = (m: number, d: number): Ymd => {
    const same = { y: ref!.y, m, d: Math.min(d, daysInMonth(ref!.y, m)) }
    return cmpYmd(same, ref!) >= 0
      ? same
      : { y: ref!.y + 1, m, d: Math.min(d, daysInMonth(ref!.y + 1, m)) }
  }

  /* ---- 1. explicit ranges: two date tokens joined by a connector ---- */
  for (let i = 0; i + 1 < tokens.length; i++) {
    const a = tokens[i]!
    const b = tokens[i + 1]!
    const between = text.slice(a.end, b.start)
    const joined =
      RANGE_CONNECTOR_RE.test(between) ||
      (/^\s*and\s*$/i.test(between) &&
        BETWEEN_DATE_RE.test(text.slice(Math.max(0, a.start - 16), a.start)))
    if (!joined) continue

    const aStart = resolveTokenAsBoundary(a, 'start')
    const bEnd = resolveTokenAsBoundary(b, 'end')
    if (!aStart || !bEnd) continue

    // Year carrying. A range written "November 1 - December 31, 2026" states the
    // year once; the opening date's year is a derivation, and a named one.
    let startYmd = aStart.ymd
    let startLabel: 'stated' | 'derived' = a.y === undefined ? 'derived' : 'stated'
    let startRule = aStart.rule
    if (a.y === undefined && b.y !== undefined) {
      const sameYear = { ...startYmd, y: b.y }
      const wraps = cmpYmd(sameYear, bEnd.ymd) > 0
      if (wraps) {
        // Two readings compete, and only one of them is stated. Either the
        // range crosses the year boundary ("November 1 - February 28, 2027"
        // opens in 2026), or the two dates were written in the wrong order
        // ("December 31 - November 1, 2026" is a Q4 flight typed backwards).
        // Carrying the year back is a derivation the buyer never wrote, so it
        // is only credible when it is also the shorter flight: the wrap reading
        // of the Q4 typo spans ten months against sixty days for the transposed
        // reading, while a genuine year-crossing flight is shorter wrapped than
        // it would be swapped. Where the swap wins, both dates are refused.
        // Picking the likelier of two readings is still picking, and the field
        // it would fill is one a media plan is costed against.
        const wrapped = { ...sameYear, y: b.y - 1 }
        if (daysBetween(bEnd.ymd, sameYear) < daysBetween(wrapped, bEnd.ymd)) {
          warnings.push(
            `'${a.text} - ${b.text}' closes before it opens. Read in order it spans ${iso(wrapped)} to ${iso(bEnd.ymd)}, and read as two dates typed in the wrong order it spans ${iso(bEnd.ymd)} to ${iso(sameYear)}. The second is the shorter flight and neither is written down, so no dates were emitted. Write both years, or put the earlier date first.`,
          )
          consumed.add(a)
          consumed.add(b)
          continue
        }
        startYmd = wrapped
        startRule = `'${a.text}' carries no year. The range closes on ${iso(bEnd.ymd)} and ${a.text} falls after that date within a single year, so the range crosses the year boundary and the start was dated ${startYmd.y}.`
      } else {
        startYmd = sameYear
        startRule = `'${a.text}' carries no year; the year ${b.y} stated at the close of the range was applied to its opening date.${aStart.rule ? ' ' + aStart.rule : ''}`
      }
    } else if (a.y === undefined && ref) {
      const occ = nextOccurrence(startYmd.m, startYmd.d)
      startYmd = occ
      startRule = refRule(`'${a.text}' carries no year, so it`)
    } else if (a.y === undefined) {
      deferred.push({
        key: 'both',
        text: `'${a.text} – ${b.text}' states a flight window with no year, and no reference date was supplied, so neither date could be resolved. Pass a reference date or write the year.`,
      })
      continue
    }

    let endYmd = bEnd.ymd
    let endLabel: 'stated' | 'derived' = b.y === undefined ? 'derived' : 'stated'
    let endRule = bEnd.rule
    if (b.y === undefined) {
      const sameYear = { ...endYmd, y: startYmd.y }
      const wraps = cmpYmd(sameYear, startYmd) < 0
      endYmd = wraps ? { ...sameYear, y: startYmd.y + 1 } : sameYear
      endYmd = { ...endYmd, d: Math.min(endYmd.d, daysInMonth(endYmd.y, endYmd.m)) }
      endRule = `'${b.text}' carries no year; it was dated ${endYmd.y} from the start of the range${wraps ? ', which it precedes within a single year, so the range crosses the year boundary' : ''}.${bEnd.rule ? ' ' + bEnd.rule : ''}`
    }
    if (b.monthOnly && bEnd.rule) endLabel = 'derived'
    if (a.monthOnly && aStart.rule) startLabel = 'derived'

    if (!isValidYmd(startYmd) || !isValidYmd(endYmd)) continue
    consumed.add(a)
    consumed.add(b)
    candidates.push({
      key: 'start_date',
      ymd: startYmd,
      rank: RANK_RANGE,
      label: startLabel,
      rule: startLabel === 'derived' ? startRule : undefined,
      spans: [span(text, a.start, a.end)],
    })
    candidates.push({
      key: 'end_date',
      ymd: endYmd,
      rank: RANK_RANGE,
      label: endLabel,
      rule: endLabel === 'derived' ? endRule : undefined,
      spans: [span(text, b.start, b.end)],
    })
    i++
  }

  /* ---- 2. labelled singles: "start date: X", "through X" ---- */
  for (const t of tokens) {
    if (consumed.has(t)) continue
    const before = text.slice(Math.max(0, t.start - 28), t.start)
    const isStart = START_CUE_RE.test(before)
    const isEnd = END_CUE_RE.test(before)
    if (!isStart && !isEnd) continue
    const key = isEnd && !isStart ? 'end_date' : 'start_date'
    const res = resolveTokenAsBoundary(t, key === 'start_date' ? 'start' : 'end')
    if (!res) continue
    let ymd = res.ymd
    let label: 'stated' | 'derived' = t.y === undefined || res.rule ? 'derived' : 'stated'
    let rule = res.rule
    if (t.y === undefined) {
      if (!ref) {
        deferred.push({
          key,
          text: `'${t.text}' carries no year and no reference date was supplied, so it could not be resolved to a calendar date.`,
        })
        continue
      }
      ymd = nextOccurrence(ymd.m, ymd.d)
      rule = refRule(`'${t.text}' carries no year, so it`) + (res.rule ? ' ' + res.rule : '')
      label = 'derived'
    }
    if (!isValidYmd(ymd)) continue
    consumed.add(t)
    candidates.push({
      key,
      ymd,
      rank: RANK_LABELLED,
      label,
      rule: label === 'derived' ? rule : undefined,
      spans: [span(text, t.start, t.end)],
    })
  }

  /* ---- 3. quarters ---- */
  const quarters: Array<{
    q: number
    y?: number
    start: number
    end: number
    text: string
    fiscal: boolean
  }> = []
  for (const m of text.matchAll(QUARTER_RE)) {
    quarters.push({
      q: Number(m[2]),
      y: m[3] ? Number(m[3]) : undefined,
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      fiscal: Boolean(m[1]),
    })
  }
  for (const m of text.matchAll(YEAR_QUARTER_RE)) {
    quarters.push({
      q: Number(m[2]),
      y: Number(m[1]),
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      fiscal: false,
    })
  }
  for (const m of text.matchAll(ORDINAL_QUARTER_RE)) {
    const q = { first: 1, second: 2, third: 3, fourth: 4 }[m[1]!.toLowerCase()]!
    quarters.push({
      q,
      y: m[2] ? Number(m[2]) : undefined,
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      fiscal: /\bfiscal\b|\bFY\b/i.test(text.slice(Math.max(0, m.index - 12), m.index)),
    })
  }

  for (const qq of dropOverlaps(quarters.map((q) => ({ ...q, payload: q })))) {
    const q = qq.payload
    if (q.fiscal) {
      warnings.push(
        `'${q.text}' is a fiscal quarter. Fiscal years start in different months at different companies, so it does not map to a calendar range and no flight dates were emitted from it.`,
      )
      continue
    }
    const m1 = (q.q - 1) * 3 + 1
    let year = q.y
    if (year === undefined) {
      if (ref) {
        // The next occurrence of that quarter that has not already closed on
        // the reference date. Stated as a rule below, so the reader can check it.
        year =
          cmpYmd({ y: ref.y, m: m1 + 2, d: daysInMonth(ref.y, m1 + 2) }, ref) >= 0
            ? ref.y
            : ref.y + 1
      } else {
        deferred.push({
          key: 'both',
          text: `'${q.text}' names a quarter with no year, and no reference date was supplied. A quarter without a year is not a date range, so no flight dates were derived from it. Pass a reference date, or write 'Q${q.q} 2026'.`,
        })
        continue
      }
    }
    const startYmd = { y: year, m: m1, d: 1 }
    const endYmd = { y: year, m: m1 + 2, d: daysInMonth(year, m1 + 2) }
    const rule =
      `'${q.text}' → ${iso(startYmd)} to ${iso(endYmd)} (calendar quarter ${q.q} of ${year}` +
      (q.y === undefined
        ? `, the next occurrence on or after the reference date ${iso(ref!)}`
        : '') +
      ').'
    candidates.push({
      key: 'start_date',
      ymd: startYmd,
      rank: RANK_QUARTER,
      label: 'derived',
      rule,
      spans: [span(text, q.start, q.end)],
    })
    candidates.push({
      key: 'end_date',
      ymd: endYmd,
      rank: RANK_QUARTER,
      label: 'derived',
      rule,
      spans: [span(text, q.start, q.end)],
    })
  }

  /* ---- 4. a bare month, or a month with a year ---- */
  for (const t of tokens) {
    if (consumed.has(t) || !t.monthOnly) continue
    let year = t.y
    if (year === undefined) {
      if (!ref) {
        deferred.push({
          key: 'both',
          text: `'${t.text}' names a month with no year, and no reference date was supplied, so it could not be turned into a flight window.`,
        })
        continue
      }
      year = nextOccurrence(t.m, 1).y
    }
    const startYmd = { y: year, m: t.m, d: 1 }
    const endYmd = { y: year, m: t.m, d: daysInMonth(year, t.m) }
    const rule =
      `'${t.text}' names a month, not a window; it was read as the whole of ${monthName(t.m)} ${year} (${iso(startYmd)} to ${iso(endYmd)})` +
      (t.y === undefined
        ? `, the next occurrence on or after the reference date ${iso(ref!)}`
        : '') +
      '.'
    candidates.push({
      key: 'start_date',
      ymd: startYmd,
      rank: RANK_MONTH,
      label: 'derived',
      rule,
      spans: [span(text, t.start, t.end)],
    })
    candidates.push({
      key: 'end_date',
      ymd: endYmd,
      rank: RANK_MONTH,
      label: 'derived',
      rule,
      spans: [span(text, t.start, t.end)],
    })
  }

  /* ---- 5. relative expressions ---- */
  for (const m of text.matchAll(RELATIVE_RE)) {
    const which = m[1]!.toLowerCase()
    const unit = m[2]!.toLowerCase()
    if (!ref) {
      deferred.push({
        key: 'both',
        text: `'${m[0]}' is a relative date. It cannot be resolved without a reference date — pass \`referenceDate\` (YYYY-MM-DD) and the engine will derive the window and record the rule. Nothing was emitted.`,
      })
      continue
    }
    const forward = /next|coming|upcoming/.test(which) ? 1 : 0
    let startYmd: Ymd
    let endYmd: Ymd
    if (unit === 'quarter') {
      const qIndex = Math.floor((ref.m - 1) / 3) + forward
      const y = ref.y + Math.floor(qIndex / 4)
      const q = ((qIndex % 4) + 4) % 4
      startYmd = { y, m: q * 3 + 1, d: 1 }
      endYmd = { y, m: q * 3 + 3, d: daysInMonth(y, q * 3 + 3) }
    } else if (unit === 'month') {
      const base = addMonths({ y: ref.y, m: ref.m, d: 1 }, forward)
      startYmd = base
      endYmd = { ...base, d: daysInMonth(base.y, base.m) }
    } else {
      const y = ref.y + forward
      startYmd = { y, m: 1, d: 1 }
      endYmd = { y, m: 12, d: 31 }
    }
    const rule = `'${m[0]}' was resolved against the caller-supplied reference date ${iso(ref)} to ${iso(startYmd)} – ${iso(endYmd)}. The engine reads no clock of its own; change the reference date and this value changes with it.`
    candidates.push({
      key: 'start_date',
      ymd: startYmd,
      rank: RANK_RELATIVE,
      label: 'derived',
      rule,
      spans: [span(text, m.index, m.index + m[0].length)],
    })
    candidates.push({
      key: 'end_date',
      ymd: endYmd,
      rank: RANK_RELATIVE,
      label: 'derived',
      rule,
      spans: [span(text, m.index, m.index + m[0].length)],
    })
  }

  for (const m of text.matchAll(SEASON_RE)) {
    warnings.push(
      `'${m[0]}' names a season. Seasons run at opposite times in the northern and southern hemispheres and have no ISO 8601 definition, so no flight dates were derived from it.`,
    )
  }

  /* ---- resolve by precedence ---- */
  const chosen: Partial<Record<'start_date' | 'end_date', DateCandidate>> = {}
  for (const key of ['start_date', 'end_date'] as const) {
    const mine = candidates.filter((c) => c.key === key)
    if (mine.length === 0) continue
    const best = Math.min(...mine.map((c) => c.rank))
    const top = mine.filter((c) => c.rank === best)
    const distinct = uniq(top.map((c) => iso(c.ymd)))
    if (distinct.length > 1) {
      warnings.push(
        `Two different ${key === 'start_date' ? 'start' : 'end'} dates were stated with equal weight (${distinct.join(' and ')}). The engine does not choose between them, so \`${key}\` is missing.`,
      )
      continue
    }
    chosen[key] = top[0]
  }

  /* ---- 6. duration fills a missing end date ---- */
  if (chosen.start_date && !chosen.end_date) {
    const dm = DURATION_RE.exec(text)
    DURATION_RE.lastIndex = 0
    if (dm) {
      const n = Number.isNaN(Number(dm[1])) ? NUMBER_WORDS[dm[1]!.toLowerCase()] : Number(dm[1])
      const unit = dm[2]!.toLowerCase()
      if (n !== undefined) {
        const s = chosen.start_date.ymd
        const end =
          unit === 'day'
            ? addDays(s, n - 1)
            : unit === 'week'
              ? addDays(s, n * 7 - 1)
              : addDays(addMonths(s, n), -1)
        chosen.end_date = {
          key: 'end_date',
          ymd: end,
          rank: RANK_DURATION,
          label: 'derived',
          rule: `'${dm[0]}' states a duration, not an end date; counting ${n} ${unit}${n === 1 ? '' : 's'} inclusive from ${iso(s)} gives ${iso(end)}.`,
          spans: [span(text, dm.index, dm.index + dm[0].length)],
        }
      }
    }
  }

  /* ---- emit ---- */
  for (const key of ['start_date', 'end_date'] as const) {
    const c = chosen[key]
    if (!c) continue
    fields[key] =
      c.label === 'stated'
        ? stated(iso(c.ymd), c.spans, c.note ? { note: c.note } : {})
        : derived(iso(c.ymd), c.spans, c.rule!, c.note ? { note: c.note } : {})
  }

  // AAMP rejects a brief whose flight_end is not strictly after flight_start.
  if (
    chosen.start_date &&
    chosen.end_date &&
    cmpYmd(chosen.end_date.ymd, chosen.start_date.ymd) <= 0
  ) {
    warnings.push(
      `The end date (${iso(chosen.end_date.ymd)}) is not after the start date (${iso(chosen.start_date.ymd)}). AAMP's CampaignBrief enforces flight_end > flight_start as a cross-field validator and will refuse to construct.`,
    )
  }

  // A lower-precedence quarter that disagrees with the explicit window is worth
  // saying; one that contains it is not.
  const explicit = chosen.start_date?.rank !== undefined && chosen.start_date.rank <= RANK_LABELLED
  if (explicit) {
    for (const c of candidates.filter((x) => x.rank === RANK_QUARTER && x.key === 'start_date')) {
      const qEnd = candidates.find(
        (x) =>
          x.rank === RANK_QUARTER &&
          x.key === 'end_date' &&
          x.spans[0]?.start === c.spans[0]?.start,
      )
      if (!qEnd || !chosen.end_date) continue
      const contained =
        cmpYmd(chosen.start_date!.ymd, c.ymd) >= 0 && cmpYmd(chosen.end_date.ymd, qEnd.ymd) <= 0
      if (!contained) {
        warnings.push(
          `'${c.spans[0]!.text}' (${iso(c.ymd)} – ${iso(qEnd.ymd)}) does not contain the explicit flight window ${iso(chosen.start_date!.ymd)} – ${iso(chosen.end_date.ymd)}. The explicit dates were used; check which is right.`,
        )
      }
    }
  }

  for (const d of deferred) {
    const relevant = d.key === 'both' ? !chosen.start_date && !chosen.end_date : !chosen[d.key]
    if (relevant) warnings.push(d.text)
  }
}

/**
 * Turn one token into a boundary date. A month-only token becomes the first day
 * of the month at the opening of a range and the last day at its close — which
 * is a derivation, so it returns a rule.
 */
function resolveTokenAsBoundary(
  t: DateToken,
  side: 'start' | 'end',
): { ymd: Ymd; rule?: string } | undefined {
  if (!t.monthOnly && t.d !== undefined) {
    const ymd = { y: t.y ?? 2000, m: t.m, d: t.d }
    if (t.m < 1 || t.m > 12 || t.d < 1 || t.d > 31) return undefined
    return { ymd }
  }
  const y = t.y ?? 2000
  const ymd = side === 'start' ? { y, m: t.m, d: 1 } : { y, m: t.m, d: daysInMonth(y, t.m) }
  return {
    ymd,
    rule: `'${t.text}' names a month, not a day; at the ${side} of a flight window it was read as ${side === 'start' ? 'the first' : 'the last'} day of that month.`,
  }
}

/* ==================================================================== *
 * Entry point
 * ==================================================================== */

/**
 * Extract geography, timing and money from a prose brief.
 *
 * Pure: the same `(text, opts)` always returns the same object. No clock, no
 * network, no I/O, no LLM.
 *
 * @param text  the brief, verbatim. All spans index into this exact string.
 * @param opts  `referenceDate` (YYYY-MM-DD) enables relative-date derivation and
 *              nothing else. Omitted, relative expressions stay `missing` and
 *              the warnings say which words could not be resolved and why.
 */
export function extractGeoTimeMoney(
  text: string,
  opts: GeoTimeMoneyOptions = {},
): GeoTimeMoneyExtraction {
  const fields: Record<string, FieldValue<unknown>> = {}
  const offered: Record<string, FieldValue<unknown>> = {}
  const warnings: string[] = []

  let ref: Ymd | undefined
  if (opts.referenceDate !== undefined) {
    const m = REFERENCE_DATE_RE.exec(opts.referenceDate)
    const parsed = m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : undefined
    if (parsed && isValidYmd(parsed)) {
      ref = parsed
    } else {
      warnings.push(
        `The reference date '${opts.referenceDate}' is not a valid ISO 8601 calendar date (YYYY-MM-DD). Relative dates were left unresolved rather than guessed.`,
      )
    }
  }

  if (typeof text === 'string' && text.length > 0) {
    extractGeo(text, fields, warnings)
    extractMoney(text, fields, offered, warnings)
    extractPricingShape(text, fields, warnings)
    extractDates(text, ref, fields, warnings)
  }

  // Every owned key is reported, including the ones that found nothing. A field
  // the engine never looked for and a field it looked for and did not find are
  // different facts, and only the second one is `missing`.
  for (const key of OWNED_KEYS) {
    if (!(key in fields)) fields[key] = absent()
  }

  return { fields, offered, warnings }
}
