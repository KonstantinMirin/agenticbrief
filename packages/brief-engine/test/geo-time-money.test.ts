/**
 * Tests for the geography / timing / money extractor.
 *
 * Half of these are negative: they assert that nothing was invented. That is the
 * product's only real claim, so it is the thing most worth a test.
 *
 *   node --test packages/brief-engine/test/geo-time-money.test.ts
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { extractGeoTimeMoney } from '../src/extract/geo-time-money.ts'
import type { FieldValue } from '../src/types.ts'

const CANONICAL =
  'Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display ' +
  'and online video. Budget: $500,000 net. Market: United States. Target demo: adults 25-54. ' +
  'Flight: November 1 - December 31, 2026. Goal: drive incremental household penetration and ' +
  'retail sales lift. Requirements: premium CTV inventory, brand safety controls, ' +
  'frequency cap 3 per week.'

const OWNED = [
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
]

function f(text: string, opts?: { referenceDate?: string }) {
  return extractGeoTimeMoney(text, opts)
}

/** Every span must quote the input exactly, or the UI cannot highlight it. */
function assertSpansRoundTrip(input: string, fields: Record<string, FieldValue<unknown>>) {
  for (const [key, fv] of Object.entries(fields)) {
    for (const s of fv.spans) {
      assert.equal(
        input.slice(s.start, s.end),
        s.text,
        `${key}: span [${s.start},${s.end}) does not quote the input`,
      )
      assert.ok(s.start >= 0 && s.end <= input.length && s.start < s.end, `${key}: bad span range`)
    }
  }
}

/** The label invariants from types.ts, asserted on every result. */
function assertLabelInvariants(fields: Record<string, FieldValue<unknown>>) {
  for (const [key, fv] of Object.entries(fields)) {
    if (fv.label === 'stated') {
      assert.ok(fv.spans.length >= 1, `${key}: stated with no span`)
      assert.notEqual(fv.value, undefined, `${key}: stated with no value`)
    } else if (fv.label === 'derived') {
      assert.ok(fv.rule && fv.rule.length > 10, `${key}: derived with no readable rule`)
      assert.ok(fv.spans.length >= 1, `${key}: derived with no span`)
      assert.notEqual(fv.value, undefined, `${key}: derived with no value`)
    } else if (fv.label === 'missing') {
      assert.equal(fv.value, undefined, `${key}: missing but carries a value`)
      assert.equal(fv.spans.length, 0, `${key}: missing but carries spans`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * 1. The canonical input
 * ------------------------------------------------------------------ */

describe('canonical brief', () => {
  const r = f(CANONICAL)

  test('every owned key is reported, none is sparse', () => {
    for (const k of OWNED) assert.ok(k in r.fields, `${k} not reported`)
  })

  test('span and label invariants hold', () => {
    assertSpansRoundTrip(CANONICAL, r.fields)
    assertLabelInvariants(r.fields)
  })

  test("'United States' derives countries ['US'] with a readable rule", () => {
    const c = r.fields.countries!
    assert.equal(c.label, 'derived')
    assert.deepEqual(c.value, ['US'])
    assert.match(c.rule!, /ISO 3166-1/)
    assert.equal(c.spans[0]!.text, 'United States')
  })

  test('the flight end date is stated and the start date is derived from the range', () => {
    assert.equal(r.fields.end_date!.label, 'stated')
    assert.equal(r.fields.end_date!.value, '2026-12-31')
    assert.equal(r.fields.end_date!.spans[0]!.text, 'December 31, 2026')

    assert.equal(r.fields.start_date!.label, 'derived')
    assert.equal(r.fields.start_date!.value, '2026-11-01')
    assert.equal(r.fields.start_date!.spans[0]!.text, 'November 1')
    // The receipt: the year came off the other end of the range, and says so.
    assert.match(r.fields.start_date!.rule!, /2026 stated at the close of the range/)
  })

  test('explicit flight dates beat the bare Q4, and Q4 raises no contradiction', () => {
    assert.ok(
      !r.warnings.some((w) => w.includes('does not contain the explicit flight window')),
      'Q4 and the explicit window are consistent; no contradiction should be raised',
    )
  })

  test('the budget figure is stated and the bound is returned as an ambiguity, not chosen', () => {
    const b = r.fields.budget_total!
    assert.equal(b.label, 'stated')
    assert.equal(b.value, 500000)
    assert.equal(b.spans[0]!.text, '$500,000')
    assert.equal(r.fields.budget_min!.label, 'missing')
    assert.ok(
      r.warnings.some((w) => /ceiling .*target .*floor/.test(w)),
      'expected a warning that the bound is not stated',
    )
  })

  test("'$' names seven currencies, so USD is offered and nothing is written", () => {
    // A one-to-many sign resolved by picking the most common member is a guess,
    // not a derivation. `filters.budget_range.currency` is money.
    const c = r.fields.currency!
    assert.equal(c.label, 'missing')
    assert.equal(c.value, undefined)
    const o = r.offered.currency!
    assert.equal(o.label, 'assumed')
    assert.equal(o.value, 'USD')
    assert.equal(o.spans[0]!.text, '$')
    assert.match(o.rule!, /sign for the US dollar and also for/)
    assert.ok(r.warnings.some((w) => w.includes("'$' is the sign for the US dollar")))
  })

  test("'$500,000 USD' is stated: an ISO code beside the sign settles it", () => {
    const withCode = f('Budget: $500,000 USD net for the flight.')
    assert.equal(withCode.fields.currency!.label, 'stated')
    assert.equal(withCode.fields.currency!.value, 'USD')
    assert.equal(withCode.fields.currency!.spans[0]!.text, 'USD')
    assert.equal(withCode.offered.currency, undefined)
  })

  test("'net' is reported as a qualifier neither protocol carries", () => {
    assert.ok(r.warnings.some((w) => w.includes('commercial qualifier')))
  })

  test('nothing in the demo or the frequency cap becomes money', () => {
    // "adults 25-54" and "frequency cap 3 per week" are bare integers.
    assert.equal(r.fields.budget_min!.label, 'missing')
    assert.equal(r.fields.budget_total!.value, 500000)
  })
})

/* ------------------------------------------------------------------ *
 * 2-4. NEGATIVE CASES — proof that the extractor does not invent
 * ------------------------------------------------------------------ */

describe('negative: no currency stated', () => {
  const input = 'Budget: 500,000 for the full year. Market: United States.'
  const r = f(input)

  test('a bare number is money but the currency is missing, not USD', () => {
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'missing')
    assert.equal(r.fields.currency!.value, undefined)
    assert.notEqual(r.fields.currency!.value, 'USD')
  })

  test('the consequence is stated rather than papered over', () => {
    assert.ok(
      r.warnings.some((w) => w.includes('does not assume USD')),
      'expected an explicit refusal to default the currency',
    )
  })
})

describe('negative: no channel split stated', () => {
  const r = f(CANONICAL)

  test('this extractor proposes no channel split at all', () => {
    // The market leader invented 60/25/15 here. The engine's answer is that
    // `channel_budget_split` is not a key this extractor is competent for, so
    // it proposes nothing — and no assumption is offered for it either.
    assert.equal('channel_budget_split' in r.fields, false)
    assert.equal('channel_budget_split' in r.offered, false)
    assert.equal('channels' in r.fields, false)
  })

  test('a single budget figure does not become a per-channel allocation', () => {
    const values = Object.values(r.fields).map((v) => JSON.stringify(v.value ?? null))
    assert.ok(!values.some((v) => v.includes('60') && v.includes('25') && v.includes('15')))
  })
})

describe('negative: no attribution window stated', () => {
  const r = f(CANONICAL)

  test('no attribution or lookback field is emitted from anywhere', () => {
    // 14/28-day attribution windows were the other invention. There is no
    // attribution key in the field map, and none appears here.
    const keys = [...Object.keys(r.fields), ...Object.keys(r.offered)]
    assert.ok(!keys.some((k) => /attribution|lookback|window/i.test(k)))
    assert.deepEqual(Object.keys(r.fields).sort(), [...OWNED].sort())
  })

  test('the only offered assumption is one the caller must accept', () => {
    for (const fv of Object.values(r.offered)) {
      assert.equal(fv.label, 'assumed')
      assert.ok(fv.rule && fv.rule.length > 10)
    }
  })
})

describe('negative: nothing but nonsense', () => {
  const input = 'purple monkey dishwasher quantum bicycle'
  const r = f(input)

  test('everything is missing and nothing crashes', () => {
    for (const k of OWNED) {
      assert.equal(r.fields[k]!.label, 'missing', `${k} should be missing`)
      assert.equal(r.fields[k]!.value, undefined)
      assert.deepEqual(r.fields[k]!.spans, [])
    }
    assert.deepEqual(r.offered, {})
    assert.deepEqual(r.warnings, [])
  })

  test('the empty string is also survivable', () => {
    const e = f('')
    for (const k of OWNED) assert.equal(e.fields[k]!.label, 'missing')
    assert.deepEqual(e.warnings, [])
  })
})

/* ------------------------------------------------------------------ *
 * 5. Money — written forms
 * ------------------------------------------------------------------ */

describe('money: written forms', () => {
  test("'£500k' → 500000 GBP, currency derived from the sign", () => {
    const r = f('Budget is £500k across the flight.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'derived')
    assert.equal(r.fields.currency!.value, 'GBP')
    assert.equal(r.fields.currency!.spans[0]!.text, '£')
    assert.ok(!r.warnings.some((w) => w.includes('sign for the US dollar')))
  })

  test("'500,000 EUR' → currency stated, not derived", () => {
    const r = f('Total budget 500,000 EUR.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'stated')
    assert.equal(r.fields.currency!.value, 'EUR')
    assert.equal(r.fields.currency!.spans[0]!.text, 'EUR')
    assert.equal(r.fields.currency!.rule, undefined)
  })

  test("'USD 500,000' → currency stated from the leading code", () => {
    const r = f('The client has approved USD 500,000 of working media.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'stated')
    assert.equal(r.fields.currency!.value, 'USD')
  })

  test("'half a million dollars' → 500000, and 'dollars' is six currencies", () => {
    const r = f('We have half a million dollars to spend.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'missing')
    assert.equal(r.offered.currency!.value, 'USD')
    assert.equal(r.offered.currency!.label, 'assumed')
    assert.ok(r.warnings.some((w) => w.includes("'dollars' names the currency of")))
  })

  test("'half a million US dollars' IS a derivation, and is written", () => {
    // The control: 'US dollars' is one-to-one, so it is derived and emitted.
    const r = f('We have half a million US dollars to spend.')
    assert.equal(r.fields.currency!.label, 'derived')
    assert.equal(r.fields.currency!.value, 'USD')
    assert.equal(r.offered.currency, undefined)
  })

  test("'500k' with no sign and no code → amount stated, currency missing", () => {
    const r = f('Budget 500k.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.currency!.label, 'missing')
  })
})

/* ------------------------------------------------------------------ *
 * 6. Money — bounds
 * ------------------------------------------------------------------ */

describe('money: bounds are read, never guessed', () => {
  test("'between $200k and $500k' → min and max, both stated", () => {
    const r = f('Spend between $200k and $500k depending on availability.')
    assert.equal(r.fields.budget_min!.value, 200000)
    assert.equal(r.fields.budget_min!.label, 'stated')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.ok(
      r.warnings.some((w) => w.includes('AAMP `total_budget` is a single committed figure')),
    )
  })

  test("'up to $500,000' is a ceiling, so no bound ambiguity is raised", () => {
    const r = f('We can spend up to $500,000.')
    assert.equal(r.fields.budget_total!.value, 500000)
    assert.equal(r.fields.budget_total!.note, 'Stated as a ceiling.')
    assert.ok(!r.warnings.some((w) => /ceiling .*target .*floor/.test(w)))
  })

  test("'at least $250,000' sets the floor and leaves the total missing", () => {
    const r = f('We will commit at least $250,000.')
    assert.equal(r.fields.budget_min!.value, 250000)
    assert.equal(r.fields.budget_total!.label, 'missing')
  })

  test('a CPM ceiling is not a budget, and the protocol gap is reported', () => {
    const r = f('Do not pay more than a $45 CPM.')
    assert.equal(r.fields.budget_total!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('no unit-price ceiling')))
  })

  test('two unrelated figures produce no budget at all', () => {
    const r = f('Budget $500,000. Also $250,000 held in reserve.')
    assert.equal(r.fields.budget_total!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('does not choose one')))
  })
})

/* ------------------------------------------------------------------ *
 * 7. pricing_currencies is offered, never derived
 * ------------------------------------------------------------------ */

describe('pricing_currencies', () => {
  test('it is missing by default and offered as an assumption instead', () => {
    const r = f('Budget: 500,000 EUR.')
    assert.equal(r.fields.pricing_currencies!.label, 'missing')
    assert.equal(r.offered.pricing_currencies!.label, 'assumed')
    assert.deepEqual(r.offered.pricing_currencies!.value, ['EUR'])
    assert.match(r.offered.pricing_currencies!.rule!, /assumption, not a derivation/)
  })

  test('an assumption is not built on top of another assumption', () => {
    // '$' yields no currency, only an offer. Offering `pricing_currencies` from
    // it would stack a guess on a guess and print both as one receipt.
    const r = f('Budget: $500,000.')
    assert.equal(r.fields.pricing_currencies!.label, 'missing')
    assert.equal(r.offered.pricing_currencies, undefined)
    assert.equal(r.offered.currency!.value, 'USD')
  })

  test('an explicit statement makes it stated', () => {
    const r = f('Budget: 500,000 EUR. We can settle in USD and CAD.')
    assert.equal(r.fields.pricing_currencies!.label, 'stated')
    assert.deepEqual(r.fields.pricing_currencies!.value, ['USD', 'CAD'])
    assert.equal('pricing_currencies' in r.offered, false)
  })
})

/* ------------------------------------------------------------------ *
 * 8. Dates — quarters, relative dates, reference date
 * ------------------------------------------------------------------ */

describe('dates: quarters', () => {
  test("'Q4 2026' derives the calendar quarter", () => {
    const r = f('Q4 2026 push, national.')
    assert.equal(r.fields.start_date!.value, '2026-10-01')
    assert.equal(r.fields.end_date!.value, '2026-12-31')
    assert.equal(r.fields.start_date!.label, 'derived')
    assert.match(r.fields.start_date!.rule!, /calendar quarter 4 of 2026/)
  })

  test('a bare Q4 with no reference date is missing, and the warning says why', () => {
    const r = f('Q4 holiday campaign.')
    assert.equal(r.fields.start_date!.label, 'missing')
    assert.equal(r.fields.end_date!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('no reference date was supplied')))
  })

  test('a bare Q4 with a reference date resolves and records the reference', () => {
    const r = f('Q4 holiday campaign.', { referenceDate: '2026-08-12' })
    assert.equal(r.fields.start_date!.value, '2026-10-01')
    assert.equal(r.fields.end_date!.value, '2026-12-31')
    assert.match(r.fields.start_date!.rule!, /reference date 2026-08-12/)
  })

  test('a fiscal quarter is refused, not mapped onto the calendar', () => {
    const r = f('FY Q4 push.', { referenceDate: '2026-08-12' })
    assert.equal(r.fields.start_date!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('fiscal quarter')))
  })
})

describe('dates: relative and partial', () => {
  test("'next quarter' without a reference date is missing and says so", () => {
    const r = f('We want to be in market next quarter.')
    assert.equal(r.fields.start_date!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('relative date') && w.includes('referenceDate')))
  })

  test("'next quarter' with a reference date derives the window", () => {
    const r = f('We want to be in market next quarter.', { referenceDate: '2026-08-12' })
    assert.equal(r.fields.start_date!.value, '2026-10-01')
    assert.equal(r.fields.end_date!.value, '2026-12-31')
    assert.match(r.fields.start_date!.rule!, /reads no clock of its own/)
  })

  test("a bare 'November' becomes the whole month, and says that too", () => {
    const r = f('November is the priority.', { referenceDate: '2026-08-12' })
    assert.equal(r.fields.start_date!.value, '2026-11-01')
    assert.equal(r.fields.end_date!.value, '2026-11-30')
    assert.match(r.fields.end_date!.rule!, /names a month, not a window/)
  })

  test('a range that crosses the year boundary dates the start a year earlier', () => {
    const r = f('Flight: November 1 - January 31, 2027.')
    assert.equal(r.fields.start_date!.value, '2026-11-01')
    assert.equal(r.fields.end_date!.value, '2027-01-31')
    assert.match(r.fields.start_date!.rule!, /crosses the year boundary/)
  })

  test("'for six weeks' fills the end date from the start date", () => {
    const r = f('Starting November 1, 2026 for six weeks.')
    assert.equal(r.fields.start_date!.value, '2026-11-01')
    assert.equal(r.fields.end_date!.value, '2026-12-12')
    assert.match(r.fields.end_date!.rule!, /states a duration, not an end date/)
  })

  test('an ambiguous numeric date is refused, not resolved', () => {
    const r = f('Flight starts 3/4/2026.')
    assert.equal(r.fields.start_date!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('ambiguous') && w.includes('3/4/2026')))
  })

  test('an unambiguous numeric date is accepted', () => {
    const r = f('Flight starts 25/12/2026.')
    assert.equal(r.fields.start_date!.value, '2026-12-25')
  })

  test('an end date before the start date is reported as an AAMP validator failure', () => {
    const r = f('Flight: 2026-12-31 to 2026-11-01.')
    assert.ok(r.warnings.some((w) => w.includes('flight_end > flight_start')))
  })
})

/* ------------------------------------------------------------------ *
 * 9. Geography
 * ------------------------------------------------------------------ */

describe('geography', () => {
  test("'UK' maps to GB and the rule explains why it is not 'UK'", () => {
    const r = f('Market: UK and Canada.')
    assert.deepEqual(r.fields.countries!.value, ['GB', 'CA'])
    assert.equal(r.fields.countries!.label, 'derived')
    assert.match(r.fields.countries!.rule!, /not an assigned ISO 3166-1 alpha-2 code/)
  })

  test('lower-case "us" is a pronoun, not a country', () => {
    const r = f('Send us the plan for Canada.')
    assert.deepEqual(r.fields.countries!.value, ['CA'])
  })

  test('a literal ISO 3166-2 token is stated; a subdivision name is derived', () => {
    const r = f('Regions: US-NY. Also Scotland.')
    assert.equal(r.fields.regions!.label, 'derived')
    assert.deepEqual(r.fields.regions!.value, ['US-NY', 'GB-SCT'])
    assert.match(r.fields.regions!.rule!, /ISO 3166-2 subdivision name match within GB/)
  })

  test('an ISO-3166-2-SHAPED token that is not a place is refused, loudly', () => {
    // 'PG', 'TV', 'NC' and 'ID' are all assigned country codes, so the shape
    // alone reads a film rating as a subdivision. The suffix is checked, and
    // where the engine has no table for the country the sentence has to be
    // about geography before the token is believed.
    const r = f('Exclude PG-13 and TV-MA content. Creative: ID-42 tracking.')
    assert.equal(r.fields.regions!.label, 'missing')
    assert.equal(r.fields.regions!.value, undefined)
    for (const token of ['PG-13', 'TV-MA', 'ID-42']) {
      assert.ok(
        r.warnings.some((w) => w.includes(token) && /No region filter was emitted/.test(w)),
        `expected a refusal naming ${token}`,
      )
    }
  })

  test('a subdivision the engine cannot verify is emitted only in a geo sentence, and says so', () => {
    const geo = f('Target regions DE-BY and FR-IDF.')
    assert.deepEqual(geo.fields.regions!.value, ['DE-BY', 'FR-IDF'])
    assert.equal(geo.fields.regions!.label, 'stated')
    assert.match(geo.fields.regions!.note!, /could not be checked against a subdivision table/)
    assert.ok(
      geo.warnings.some((w) => /ships subdivision tables for US, GB, CA and AU only/.test(w)),
    )

    // The same token with nothing geographic around it is not a place.
    const not = f('Creative variant DE-BY was approved.')
    assert.equal(not.fields.regions!.label, 'missing')
  })

  test('a country the engine DOES have a table for is checked against it', () => {
    const bad = f('Target regions US-XX and US-NY.')
    assert.deepEqual(bad.fields.regions!.value, ['US-NY'])
    assert.ok(bad.warnings.some((w) => w.includes('US-XX')))
  })

  test('regions never silently add a country filter', () => {
    const r = f('Target California only.')
    assert.deepEqual(r.fields.regions!.value, ['US-CA'])
    assert.equal(r.fields.countries!.label, 'missing')
  })

  test("'Georgia' is ambiguous, so nothing is emitted", () => {
    const r = f('Market: Georgia.')
    assert.equal(r.fields.countries!.label, 'missing')
    assert.equal(r.fields.regions!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes("'Georgia' is both the country")))
  })

  test('a DMA code is read; a DMA name is refused with the reason', () => {
    const withCode = f('Buy DMA 501 and DMA 803.')
    assert.deepEqual(withCode.fields.metros!.value, [
      { system: 'nielsen_dma', code: '501' },
      { system: 'nielsen_dma', code: '803' },
    ])

    const withName = f('Focus on the Chicago metro.')
    assert.equal(withName.fields.metros!.label, 'missing')
    assert.deepEqual(withName.fields.metros!.raw, ['Chicago metro'])
    assert.ok(withName.warnings.some((w) => w.includes('no name-to-code table')))
  })

  test('ZIP codes carry the country the vocabulary implies, with the rule recorded', () => {
    const r = f('Target ZIP codes 90210, 10001 around the stores.')
    assert.deepEqual(r.fields.postal_areas!.value, [
      { country: 'US', system: 'zip', values: ['90210', '10001'] },
    ])
    assert.equal(r.fields.postal_areas!.label, 'derived')
    assert.match(r.fields.postal_areas!.rule!, /United States Postal Service/)
  })

  test('five bare digits are not a ZIP code', () => {
    const r = f('The reference number is 90210.')
    assert.equal(r.fields.postal_areas!.label, 'missing')
  })
})

/* ------------------------------------------------------------------ *
 * 10. Pricing shape
 * ------------------------------------------------------------------ */

describe('is_fixed_price and delivery_type', () => {
  test('fixed price is stated, rate card is derived', () => {
    assert.equal(f('Fixed price only.').fields.is_fixed_price!.value, true)
    assert.equal(f('Fixed price only.').fields.is_fixed_price!.label, 'stated')
    const rc = f('Buy at rate card.')
    assert.equal(rc.fields.is_fixed_price!.value, true)
    assert.equal(rc.fields.is_fixed_price!.label, 'derived')
  })

  test('auction pricing derives false', () => {
    const r = f('Biddable inventory please.')
    assert.equal(r.fields.is_fixed_price!.value, false)
    assert.equal(r.fields.is_fixed_price!.label, 'derived')
  })

  test('both fixed and auction stated → neither is emitted', () => {
    const r = f('Some fixed price, some biddable.')
    assert.equal(r.fields.is_fixed_price!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('single boolean')))
  })

  test('guaranteed / non-guaranteed / programmatic guaranteed', () => {
    assert.equal(f('Guaranteed inventory only.').fields.delivery_type!.value, 'guaranteed')
    assert.equal(f('Non-guaranteed is fine.').fields.delivery_type!.value, 'non_guaranteed')
    const pg = f('Programmatic guaranteed deals.')
    assert.equal(pg.fields.delivery_type!.value, 'guaranteed')
    assert.equal(pg.fields.delivery_type!.label, 'derived')
  })

  test('both delivery types stated → neither is emitted', () => {
    const r = f('Mix of guaranteed and non-guaranteed.')
    assert.equal(r.fields.delivery_type!.label, 'missing')
    assert.ok(r.warnings.some((w) => w.includes('takes one value')))
  })

  test("'guaranteed rate' is a price statement, not a delivery statement", () => {
    const r = f('We need a guaranteed rate.')
    assert.equal(r.fields.delivery_type!.label, 'missing')
    assert.equal(r.fields.is_fixed_price!.value, true)
  })
})

/* ------------------------------------------------------------------ *
 * 11. Purity and invariants across every case above
 * ------------------------------------------------------------------ */

describe('purity and invariants', () => {
  const INPUTS = [
    CANONICAL,
    'purple monkey dishwasher quantum bicycle',
    'Budget: 500,000 for the full year. Market: United States.',
    'Spend between $200k and $500k. Flight: 1 November 2026 to 31 December 2026. Regions: US-NY, US-CA. ZIP codes 90210.',
    'Q4 holiday campaign.',
    'FY Q4 push next quarter, half a million pounds, DMA 501, non-guaranteed.',
  ]

  test('same input, same output — twice, deeply equal', () => {
    for (const i of INPUTS) {
      assert.deepEqual(f(i, { referenceDate: '2026-08-12' }), f(i, { referenceDate: '2026-08-12' }))
    }
  })

  test('spans and labels are valid for every input', () => {
    for (const i of INPUTS) {
      for (const ref of [undefined, '2026-08-12']) {
        const r = f(i, ref ? { referenceDate: ref } : undefined)
        assertSpansRoundTrip(i, r.fields)
        assertLabelInvariants(r.fields)
        for (const fv of Object.values(r.offered)) assert.equal(fv.label, 'assumed')
        for (const w of r.warnings) assert.ok(w.length > 20, `thin warning: ${w}`)
      }
    }
  })

  test('the input is never mutated and the caller options are never written to', () => {
    const opts = { referenceDate: '2026-08-12' }
    const before = JSON.stringify(opts)
    f(CANONICAL, opts)
    assert.equal(JSON.stringify(opts), before)
  })

  test('an invalid reference date is reported, not silently ignored', () => {
    const r = f('Q4 holiday campaign.', { referenceDate: 'next tuesday' })
    assert.ok(r.warnings.some((w) => w.includes('not a valid ISO 8601 calendar date')))
    assert.equal(r.fields.start_date!.label, 'missing')
  })

  test('every emitted value carries an extractor name for the conflict report', () => {
    const r = f(CANONICAL)
    for (const fv of Object.values(r.fields)) assert.equal(fv.extractor, 'geo-time-money')
  })
})
