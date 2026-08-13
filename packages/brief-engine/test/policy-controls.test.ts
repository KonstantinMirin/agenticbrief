/**
 * Behaviour of the policy-controls extractor.
 *
 * The tests are written against the product's one rule rather than against the
 * implementation: for every case, whatever comes out must be traceable to a
 * span of the input, and nothing that was not said may appear at all. Half of
 * these assert an ABSENCE — that is the point.
 *
 *   node --test packages/brief-engine/test/policy-controls.test.ts
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  extractPolicyControls,
  policyControlsExtractor,
  POLICY_CONTROL_KEYS,
} from '../src/extract/policy-controls.ts'
import { FIELD_BY_KEY } from '../src/fields.ts'
import type { FieldValue } from '../src/types.ts'

/** The brief the product is specified against. */
const CANONICAL =
  'Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display ' +
  'and online video. Budget: $500,000 net. Market: United States. Target demo: ' +
  'adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental ' +
  'household penetration and retail sales lift. Requirements: premium CTV inventory, ' +
  'brand safety controls, frequency cap 3 per week.'

/**
 * Every invariant the type contract states, asserted on every result of every
 * test. If a field cannot be highlighted back to the input it is not `stated`,
 * whatever the value is.
 */
function assertInvariants(input: string, result: ReturnType<typeof extractPolicyControls>): void {
  for (const [key, field] of Object.entries({ ...result.fields, ...result.offered })) {
    assert.ok(POLICY_CONTROL_KEYS.includes(key), `${key} is outside this extractor's remit`)
    assert.ok(FIELD_BY_KEY[key], `${key} is not in the canonical field map`)
    for (const span of field.spans) {
      assert.equal(
        span.text,
        input.slice(span.start, span.end),
        `${key}: span [${span.start},${span.end}] does not round-trip to the input`,
      )
      assert.ok(span.start >= 0 && span.end <= input.length && span.start < span.end)
    }
    switch (field.label) {
      case 'stated':
        assert.notEqual(field.value, undefined, `${key}: stated with no value`)
        assert.ok(field.spans.length >= 1, `${key}: stated with no span`)
        break
      case 'derived':
        assert.notEqual(field.value, undefined, `${key}: derived with no value`)
        assert.ok(field.rule && field.rule.length > 10, `${key}: derived with no readable rule`)
        assert.ok(field.spans.length >= 1, `${key}: derived with no span`)
        break
      case 'assumed':
        assert.ok(field.rule && field.rule.length > 10, `${key}: assumed with no rule`)
        break
      case 'missing':
        assert.equal(field.value, undefined, `${key}: missing but carries a value`)
        assert.deepEqual(field.spans, [], `${key}: missing but carries spans`)
        assert.ok(field.note, `${key}: missing with nothing to say`)
        break
    }
  }
  // An `assumed` value never reaches the emitted payload.
  for (const field of Object.values(result.fields)) {
    assert.notEqual(field.label, 'assumed', 'an assumed value reached `fields`')
  }
  for (const field of Object.values(result.offered)) {
    assert.equal(field.label, 'assumed', '`offered` must hold assumptions only')
  }
}

/** Run the extractor and check the invariants in one step. */
function run(input: string, opts?: { referenceDate?: string }) {
  const result = extractPolicyControls(input, opts)
  assertInvariants(input, result)
  return result
}

function value<T>(field: FieldValue<unknown> | undefined): T {
  if (!field) throw new assert.AssertionError({ message: 'expected a field, got none' })
  return field.value as T
}

/* ------------------------------------------------------------------ */

describe('the canonical brief', () => {
  const result = run(CANONICAL)

  test('the frequency cap is derived, with the hour conversion shown', () => {
    const cap = result.fields.frequency_cap
    assert.ok(cap)
    assert.equal(cap.label, 'derived')
    assert.deepEqual(cap.value, { max_impressions: 3, period_hours: 168 })
    assert.match(cap.rule!, /168/)
    assert.match(cap.rule!, /7 days x 24 hours/)
    assert.match(cap.rule!, /stated count 3/)
  })

  test('the cap quotes the exact source span', () => {
    const span = result.fields.frequency_cap!.spans[0]!
    assert.equal(span.text, CANONICAL.slice(span.start, span.end))
    assert.match(span.text, /frequency cap 3 per week/)
  })

  test('"brand safety controls" names no category, so none is emitted', () => {
    const field = result.fields.excluded_content_categories
    assert.ok(field)
    assert.equal(field.label, 'missing')
    assert.equal(field.value, undefined)
    assert.ok(
      result.warnings.some((w) => /no content category is named/.test(w)),
      'the empty brand-safety ask must be reported',
    )
  })

  test('both business outcomes are reported, and neither becomes a KPI', () => {
    assert.equal(result.fields.kpi_targets, undefined)
    assert.ok(result.warnings.some((w) => /household penetration/.test(w)))
    assert.ok(result.warnings.some((w) => /sales lift/.test(w)))
    // The nearest AdCP metric is named as adjacent, never substituted.
    const salesWarning = result.warnings.find((w) => /sales lift/.test(w))!
    assert.match(salesWarning, /incremental_sales_lift/)
    assert.match(salesWarning, /does not assume you meant it/)
  })

  test('nothing else is invented from it', () => {
    // No split, no currency, no attribution window, no pacing, no approvals.
    for (const key of [
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
    ]) {
      assert.equal(result.fields[key], undefined, `${key} was invented`)
    }
    assert.deepEqual(Object.keys(result.offered), [])
    const emitted = JSON.stringify(result.fields)
    assert.ok(!/currency|USD/i.test(emitted), 'currency must not appear')
    assert.ok(!/attribution/i.test(emitted), 'attribution must not appear')
    assert.ok(!/60|25|15/.test(JSON.stringify(result.fields.channel_budget_split ?? null)))
    assert.equal(result.fields.channel_budget_split, undefined, 'no channel split, ever')
  })
})

/* ------------------------------------------------------------------ */

describe('frequency caps', () => {
  test('"3x/user/week" parses to the same value as the canonical phrasing', () => {
    const result = run('Frequency: 3x/user/week.')
    assert.deepEqual(result.fields.frequency_cap!.value, { max_impressions: 3, period_hours: 168 })
  })

  test('"no more than 5 impressions per user per day" -> 24 hours', () => {
    const result = run('We want no more than 5 impressions per user per day.')
    assert.deepEqual(result.fields.frequency_cap!.value, { max_impressions: 5, period_hours: 24 })
    assert.match(result.fields.frequency_cap!.rule!, /'per day' -> period_hours: 24/)
  })

  test('a multi-week period multiplies the hours and says so', () => {
    const result = run('Cap at 6 impressions per user every 2 weeks.')
    assert.deepEqual(result.fields.frequency_cap!.value, { max_impressions: 6, period_hours: 336 })
    assert.match(result.fields.frequency_cap!.rule!, /x2/)
  })

  test('"per month" is offered, never written', () => {
    const input = 'Frequency cap 10 impressions per user per month.'
    const result = run(input)
    assert.equal(result.fields.frequency_cap!.label, 'missing')
    const offered = result.offered.frequency_cap
    assert.ok(offered, 'a candidate must be offered')
    assert.equal(offered.label, 'assumed')
    assert.deepEqual(offered.value, { max_impressions: 10, period_hours: 720 })
    assert.match(offered.rule!, /672\/720\/744/)
    assert.ok(result.warnings.some((w) => /no exact hour count/.test(w)))
  })

  test('two different caps are an ambiguity, not an average', () => {
    const result = run(
      'Frequency cap 3 per week on CTV, and no more than 10 impressions per user per week on display.',
    )
    assert.equal(result.fields.frequency_cap!.label, 'missing')
    assert.equal(result.offered.frequency_cap, undefined)
    assert.ok(result.warnings.some((w) => /different frequency caps/.test(w)))
  })

  test('a per-flight cap needs the flight length and is not guessed', () => {
    const result = run('Frequency cap of 8 impressions per user per flight.')
    assert.equal(result.fields.frequency_cap!.label, 'missing')
    assert.ok(result.warnings.some((w) => /per flight/.test(w)))
  })

  test('dates and demos are not frequency caps', () => {
    const result = run('Flight: November 1 - December 31, 2026. Target demo: adults 25-54.')
    assert.equal(result.fields.frequency_cap, undefined)
    assert.deepEqual(result.warnings, [])
  })
})

/* ------------------------------------------------------------------ */

describe('brand safety', () => {
  test('unambiguous category names map to IAB Content Taxonomy IDs', () => {
    const input = 'Brand safety: block adult content, hate speech and terrorism.'
    const result = run(input)
    const field = result.fields.excluded_content_categories!
    assert.equal(field.label, 'derived')
    assert.deepEqual(field.value, ['Rm3SiT', 'HxqYV1', '8FD8nI'])
    assert.match(field.rule!, /'adult content' -> IAB Content Taxonomy Rm3SiT/)
    assert.equal(field.spans.length, 3)
    for (const span of field.spans) assert.equal(span.text, input.slice(span.start, span.end))
  })

  test("a term with no taxonomy node keeps the buyer's words and warns", () => {
    const result = run('Avoid news content entirely.')
    const field = result.fields.excluded_content_categories!
    assert.equal(field.label, 'stated')
    assert.deepEqual(field.value, ['news'])
    const warning = result.warnings.find((w) => /'news'/.test(w))!
    assert.match(warning, /no 'News' node/)
    assert.match(warning, /carried through as written/)
  })

  test('an ambiguous term is reported with its candidates and mapped to none', () => {
    const result = run('Please exclude gambling.')
    const field = result.fields.excluded_content_categories!
    assert.equal(field.label, 'stated')
    assert.deepEqual(field.value, ['gambling'])
    const warning = result.warnings.find((w) => /gambling/.test(w))!
    assert.match(warning, /3 IAB Content Taxonomy nodes/)
    assert.match(warning, /181 Casinos & Gambling/)
    assert.match(warning, /will not choose one/)
  })

  test('vendor names are recorded, mapped to nothing and kept out of the value', () => {
    const result = run('Brand safety is handled by DoubleVerify and IAS, and block hate speech.')
    const field = result.fields.excluded_content_categories!
    assert.deepEqual(field.value, ['HxqYV1'])
    assert.ok(
      result.warnings.some((w) => /DoubleVerify/.test(w) && /not an IAB content category/.test(w)),
    )
    assert.ok(result.warnings.some((w) => /Integral Ad Science/.test(w)))
    // No threshold was stated, so no performance standard was manufactured.
    assert.equal(result.fields.required_performance_standards, undefined)
  })

  test('an explicit category list carries unknown items through verbatim', () => {
    const result = run('Excluded categories: crypto, payday loans, terrorism.')
    const field = result.fields.excluded_content_categories!
    assert.equal(field.label, 'derived')
    assert.deepEqual(field.value, ['crypto', 'payday loans', '8FD8nI'])
    assert.match(field.note!, /list\[str\]/)
  })

  test('exclusion language outside a blocklist clause is not a blocklist', () => {
    const result = run('Our audience over-indexes on politics podcasts.')
    assert.equal(result.fields.excluded_content_categories, undefined)
  })

  test('a wrapped line does not truncate the blocklist', () => {
    // Regression: briefs arrive hard-wrapped. Treating the wrap as a full stop
    // dropped every category after the first line break.
    const result = run('Block adult content,\nhate speech, terrorism and gambling; avoid news.')
    assert.deepEqual(result.fields.excluded_content_categories!.value, [
      'Rm3SiT',
      'HxqYV1',
      '8FD8nI',
      'gambling',
      'news',
    ])
  })

  test('keywords and domains land in their own fields', () => {
    const input = 'Negative keywords: recall, lawsuit. Do not run on breitbart.com or infowars.com.'
    const result = run(input)
    assert.deepEqual(result.fields.excluded_keywords!.value, ['recall', 'lawsuit'])
    assert.deepEqual(result.fields.excluded_domains!.value, ['breitbart.com', 'infowars.com'])
    assert.equal(result.fields.excluded_domains!.label, 'stated')
  })
})

/* ------------------------------------------------------------------ */

describe('approvals', () => {
  test('a named stage with an explicit polarity is stated, and only that stage', () => {
    const result = run(
      'The agent may book without human sign-off. The media plan must be reviewed by the team.',
    )
    assert.equal(result.fields.approval_booking!.label, 'stated')
    assert.equal(result.fields.approval_booking!.value, false)
    assert.equal(result.fields.approval_plan_review!.value, true)
    // AAMP's defaults for these two are false. Copying a default would be
    // exactly the silent invention this engine exists to prevent.
    assert.equal(result.fields.approval_creative, undefined)
    assert.equal(result.fields.approval_pacing_adjustment, undefined)
  })

  test('a global waiver sets all four gates and shows the derivation', () => {
    const result = run('Run it fully automated, no human in the loop.')
    for (const key of [
      'approval_plan_review',
      'approval_booking',
      'approval_creative',
      'approval_pacing_adjustment',
    ]) {
      const field = result.fields[key]!
      assert.equal(field.label, 'derived')
      assert.equal(field.value, false)
      assert.match(field.rule!, /all four AAMP approval gates/)
    }
  })

  test('a contradiction is reported and nothing is emitted', () => {
    const result = run(
      'Booking requires approval from the client. The agent may book without approval when pacing slips.',
    )
    assert.equal(result.fields.approval_booking!.label, 'missing')
    assert.ok(result.warnings.some((w) => /both required and waived/.test(w)))
  })

  test('a sentence naming two gates governs neither', () => {
    // "Plan review is required before booking" states a gate on the plan and
    // merely mentions booking; closing the booking gate too would be invention.
    const result = run('Plan review by the client is required before booking.')
    assert.equal(result.fields.approval_plan_review, undefined)
    assert.equal(result.fields.approval_booking, undefined)
    assert.ok(result.warnings.some((w) => /names 2 approval gates/.test(w)))
  })

  test('prose with no approval language sets no gate', () => {
    const result = run('Q4 holiday campaign for a CPG snack brand.')
    assert.equal(result.fields.approval_booking, undefined)
    assert.equal(result.fields.approval_plan_review, undefined)
  })
})

/* ------------------------------------------------------------------ */

describe('deal floors and ceilings', () => {
  test('a CPM ceiling is a deal preference and brings no currency with it', () => {
    const result = run('Max CPM 32. Minimum 2,000,000 impressions per deal.')
    assert.equal(result.fields.deal_max_cpm!.value, 32)
    assert.equal(result.fields.deal_max_cpm!.label, 'stated')
    assert.equal(result.fields.deal_min_impressions!.value, 2_000_000)
    // NEGATIVE: no currency symbol in the input, so no currency anywhere.
    assert.equal(result.fields.currency, undefined)
    assert.ok(!/USD/.test(JSON.stringify(result.fields)))
  })

  test('a CPM with no ceiling-or-target word is not filed under either', () => {
    const result = run('The CPM is 28 on this package.')
    assert.equal(result.fields.deal_max_cpm, undefined)
    assert.equal(result.fields.kpi_targets, undefined)
    assert.ok(result.warnings.some((w) => /whether it is a ceiling or a target/.test(w)))
  })

  test('an impression floor with no scope belongs to two fields, so it gets neither', () => {
    const result = run('We need a minimum of 1M impressions.')
    assert.equal(result.fields.deal_min_impressions!.label, 'missing')
    assert.equal(result.fields.min_exposures!.label, 'missing')
    const warning = result.warnings.find((w) => /impression floor/.test(w))!
    assert.match(warning, /min_impressions/)
    assert.match(warning, /min_exposures/)
    assert.match(warning, /will not guess/)
  })

  test('a measurement threshold goes to min_exposures alone', () => {
    const result = run('At least 250,000 exposures are needed for measurement validity.')
    assert.equal(result.fields.min_exposures!.value, 250_000)
    assert.equal(result.fields.deal_min_impressions, undefined)
  })
})

/* ------------------------------------------------------------------ */

describe('pacing and exclusivity', () => {
  test('front-loaded pacing is stated verbatim', () => {
    const result = run('Front-loaded pacing across the flight.')
    assert.equal(result.fields.pacing_model!.label, 'stated')
    assert.equal(result.fields.pacing_model!.value, 'FRONT_LOADED')
  })

  test('ASAP pacing has no AAMP value and is reported as a vocabulary gap', () => {
    const result = run('Pace it ASAP so we clear the budget.')
    assert.equal(result.fields.pacing_model!.label, 'missing')
    assert.ok(result.warnings.some((w) => /no ASAP value/.test(w)))
  })

  test('category exclusivity maps to the AdCP enum', () => {
    const result = run('We need category exclusivity on the sponsorship.')
    assert.equal(result.fields.exclusivity!.value, 'category')
  })

  test('bare "exclusivity" is two different asks and the engine picks neither', () => {
    const result = run('Exclusivity would be nice to have.')
    assert.equal(result.fields.exclusivity!.label, 'missing')
    assert.ok(result.warnings.some((w) => /none \| category \| exclusive/.test(w)))
  })
})

/* ------------------------------------------------------------------ */

describe('measurement requirements', () => {
  test('a vendor named by brand name does not become a hostname in the value', () => {
    // `vendor` is a core/brand-ref.json and its only required property is
    // `domain` — the host whose brand.json is the discovery point for a
    // measurement agent. 'DoubleVerify' is not that hostname, and this module's
    // seven-row name -> domain table is not the brief. The mapping is offered.
    const result = run('Minimum 70% viewability measured by DoubleVerify to the MRC standard.')
    const field = result.fields.required_performance_standards!
    assert.equal(field.label, 'derived')
    assert.deepEqual(field.value, [{ metric: 'viewability', threshold: 0.7, standard: 'mrc' }])
    assert.match(field.rule!, /'70%' -> threshold: 0\.7/)
    assert.ok(!JSON.stringify(field.value).includes('doubleverify.com'))
    assert.ok(result.warnings.some((w) => /will not write a hostname you did not type/.test(w)))

    const offer = result.offered.required_performance_standards!
    assert.equal(offer.label, 'assumed')
    assert.deepEqual(offer.value, [
      {
        metric: 'viewability',
        threshold: 0.7,
        standard: 'mrc',
        vendor: { domain: 'doubleverify.com' },
      },
    ])
    assert.match(offer.rule!, /doubleverify\.com/)
  })

  test('a domain the buyer typed IS transcribed, and nothing is offered', () => {
    const result = run(
      'Minimum 70% viewability to the MRC standard, measured by DoubleVerify (doubleverify.com).',
    )
    assert.deepEqual(result.fields.required_performance_standards!.value, [
      {
        metric: 'viewability',
        threshold: 0.7,
        standard: 'mrc',
        vendor: { domain: 'doubleverify.com' },
      },
    ])
    assert.equal(result.offered.required_performance_standards, undefined)
  })

  test('two letters do not name a vendor in the payload', () => {
    // '\\bdv\\b' matching two characters is the whole evidence here.
    const result = run('Minimum 70% viewability measured by DV, MRC standard.')
    assert.ok(!JSON.stringify(result.fields.required_performance_standards!.value).includes('.com'))
  })

  test('a floor with no vendor is emitted with the gap reported, not with a vendor invented', () => {
    const result = run('Viewability must be at least 65%.')
    const entries = value<Record<string, unknown>[]>(result.fields.required_performance_standards)
    assert.equal(entries.length, 1)
    assert.equal(entries[0]!.threshold, 0.65)
    assert.equal(entries[0]!.vendor, undefined)
    assert.ok(result.warnings.some((w) => /no measurement vendor/.test(w)))
    assert.ok(result.warnings.some((w) => /without a measurement standard/.test(w)))
  })

  test('two metrics in one sentence keep their own thresholds', () => {
    // Regression: pairing each metric with the first percentage after it gave
    // viewability the IVT threshold — an invented number in a signed document.
    const result = run('Minimum 70% viewability measured by IAS to the MRC standard, IVT below 1%.')
    assert.deepEqual(result.fields.required_performance_standards!.value, [
      { metric: 'viewability', threshold: 0.7, standard: 'mrc' },
      { metric: 'ivt', threshold: 0.01 },
    ])
    // The vendor domain is offered, per metric, and written to neither entry.
    assert.deepEqual(result.offered.required_performance_standards!.value, [
      {
        metric: 'viewability',
        threshold: 0.7,
        standard: 'mrc',
        vendor: { domain: 'integralads.com' },
      },
      { metric: 'ivt', threshold: 0.01, vendor: { domain: 'integralads.com' } },
    ])
  })

  test('a reporting requirement is not a performance standard', () => {
    // Regression: "must report viewability" plus a percentage anywhere in the
    // brief used to manufacture a threshold nobody stated.
    const result = run('IVT below 1%. The seller must report completed views and viewability.')
    const entries = value<Record<string, unknown>[]>(result.fields.required_performance_standards)
    assert.equal(entries.length, 1)
    assert.equal(entries[0]!.metric, 'ivt')
    assert.deepEqual(result.fields.required_metrics!.value, ['completed_views', 'viewability'])
  })

  test('a metric named as a requirement with no threshold produces no filter', () => {
    const result = run('An attention score standard is required on all placements.')
    assert.equal(result.fields.required_performance_standards, undefined)
    assert.ok(result.warnings.some((w) => /no threshold/.test(w)))
  })

  test('required reporting metrics come from the AdCP vocabulary, with mappings shown', () => {
    const result = run('The seller must report completed views and VCR.')
    const field = result.fields.required_metrics!
    assert.deepEqual(field.value, ['completed_views', 'completion_rate'])
    assert.equal(field.label, 'derived')
    assert.match(field.rule!, /'VCR' -> AdCP available-metric `completion_rate`/)
  })

  test('required features map to the four flags that exist, and only when required', () => {
    const result = run('The seller must honour our property list and support committed metrics.')
    assert.deepEqual(result.fields.required_features!.value, {
      property_list_filtering: true,
      committed_metrics_supported: true,
    })
  })

  test('a stated attribution window is reported and never emitted as a value', () => {
    const input = 'Use a 14-day click and 28-day view attribution window.'
    const result = run(input)
    for (const key of Object.keys(result.fields)) {
      assert.ok(!/attribution/i.test(key))
    }
    assert.ok(!/14|28/.test(JSON.stringify(result.fields)), 'no window may reach a field')
    const warning = result.warnings.find((w) => /attribution or lookback window/.test(w))!
    assert.match(warning, /neither protocol can carry it/)
  })

  test('NEGATIVE: a brief with no attribution window produces no attribution anything', () => {
    const result = run(CANONICAL)
    assert.ok(!result.warnings.some((w) => /attribution/i.test(w)))
    assert.ok(!/attribution/i.test(JSON.stringify(result.fields)))
  })

  test('Trusted Match without a provider URL cannot be expressed', () => {
    const result = run('We require identity match through our clean room.')
    assert.equal(result.fields.trusted_match!.label, 'missing')
    assert.ok(result.warnings.some((w) => /provider `agent_url`/.test(w)))
  })

  test('Trusted Match with a registry URL builds a provider entry', () => {
    const result = run(
      'Trusted match via https://tmp.example.com/agent with identity match. Response types: deal, activation.',
    )
    const tm = value<Record<string, unknown>>(result.fields.trusted_match)
    assert.deepEqual(tm.response_types, ['deal', 'activation'])
    assert.deepEqual(tm.providers, [
      { agent_url: 'https://tmp.example.com/agent', identity_match: true },
    ])
  })
})

/* ------------------------------------------------------------------ */

describe('KPIs', () => {
  test('media metrics with targets become AAMP KPI entries', () => {
    const result = run('KPI: target CPM of 25 and a CTR target of 0.35%.')
    const entries = value<{ metric: string; target_value: number }[]>(result.fields.kpi_targets)
    assert.deepEqual(entries, [
      { metric: 'CPM', target_value: 25 },
      { metric: 'CTR', target_value: 0.35 },
    ])
    assert.ok(
      result.warnings.some((w) => /no unit/.test(w)),
      'the unit loss must be reported',
    )
  })

  test('a metric with no target value produces no KPI', () => {
    const result = run('We will measure VCR across the flight.')
    assert.equal(result.fields.kpi_targets, undefined)
    assert.ok(result.warnings.some((w) => /no target value/.test(w)))
  })
})

/* ------------------------------------------------------------------ */

describe('seller lists', () => {
  test('preferred and excluded sellers are split into items with spans', () => {
    const input = 'Preferred sellers: Hulu, Roku and Peacock. Excluded sellers: Foo SSP.'
    const result = run(input)
    assert.deepEqual(result.fields.preferred_sellers!.value, ['Hulu', 'Roku', 'Peacock'])
    assert.deepEqual(result.fields.excluded_sellers!.value, ['Foo SSP'])
    for (const span of result.fields.preferred_sellers!.spans) {
      assert.equal(span.text, input.slice(span.start, span.end))
    }
  })
})

/* ------------------------------------------------------------------ */

describe('degenerate input', () => {
  test('nonsense produces nothing and does not throw', () => {
    const result = run('purple monkey dishwasher quantum bicycle')
    assert.deepEqual(result.fields, {})
    assert.deepEqual(result.offered, {})
    assert.deepEqual(result.warnings, [])
  })

  test('empty and whitespace input produce nothing', () => {
    for (const input of ['', '   ', '\n\n']) {
      const result = run(input)
      assert.deepEqual(result.fields, {})
      assert.deepEqual(result.warnings, [])
    }
  })

  test('a bad referenceDate is reported and changes no value', () => {
    const withBad = extractPolicyControls(CANONICAL, { referenceDate: 'Q4' })
    const withGood = extractPolicyControls(CANONICAL, { referenceDate: '2026-08-12' })
    assert.deepEqual(withBad.fields, withGood.fields)
    assert.ok(withBad.warnings.some((w) => /not an ISO-8601 date/.test(w)))
  })
})

/* ------------------------------------------------------------------ */

describe('the function is pure and deterministic', () => {
  test('same input, deep-equal output, twice', () => {
    assert.deepEqual(extractPolicyControls(CANONICAL), extractPolicyControls(CANONICAL))
  })

  test('interleaved calls do not leak regex state between them', () => {
    const a1 = extractPolicyControls(CANONICAL)
    extractPolicyControls('Block adult content and terrorism. Frequency cap 9 per day.')
    const a2 = extractPolicyControls(CANONICAL)
    assert.deepEqual(a1, a2)
  })

  test('the input string is never mutated and every key is in the field map', () => {
    const before = CANONICAL
    const result = extractPolicyControls(CANONICAL)
    assert.equal(CANONICAL, before)
    for (const key of POLICY_CONTROL_KEYS) assert.ok(FIELD_BY_KEY[key], `${key} not in fields.ts`)
    for (const key of Object.keys(result.fields)) assert.ok(POLICY_CONTROL_KEYS.includes(key))
  })

  test('the Extractor adapter returns the same extraction', () => {
    const direct = extractPolicyControls(CANONICAL)
    const viaCtx = policyControlsExtractor({
      input: CANONICAL,
      lower: CANONICAL.toLowerCase(),
      now: new Date('2026-08-12T00:00:00Z'),
      options: {
        assume: [],
        assumeAll: false,
        now: new Date('2026-08-12T00:00:00Z'),
        buyingMode: 'brief',
        includeResidualBrief: true,
        adcpVersion: '3.1.10',
      },
    })
    assert.deepEqual(viaCtx.fields, direct.fields)
    assert.deepEqual(viaCtx.warnings, direct.warnings)
  })

  test('every emitted field records which extractor produced it', () => {
    const result = extractPolicyControls('Block adult content. Frequency cap 3 per week.')
    for (const field of Object.values(result.fields)) {
      assert.equal(field.extractor, 'policy-controls')
    }
  })
})
