/**
 * ADVERSARIAL AUDIT — written to break the one rule this package sells:
 *
 *   "no silent invention. Every emitted value traces to something the user
 *    typed, or it is labelled 'assumed' and excluded from output until
 *    explicitly accepted."
 *
 * Every test below asserts the rule as written. A failing test here is a value
 * the engine put in a payload that nobody typed, or a label that misdescribes
 * where a value came from. Nothing here is a fix; each test is a demonstration.
 *
 * Run: node --test 'test/adversary.test.ts'
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { analyze, toAdcpGetProducts } from '../src/index.ts'

const NOW = new Date('2026-08-12T00:00:00Z')
const run = (text: string, opts: Record<string, unknown> = {}) =>
  analyze(text, { now: NOW, ...opts })
const filtersOf = (a: ReturnType<typeof run>) => (a.adcp.filters ?? {}) as Record<string, unknown>

/* ==================================================================== *
 * 1. Money invented from things that are not money
 * ==================================================================== */

describe('ADV-1 a counted thing must not become money', () => {
  test('an impression floor reaches filters.budget_range.min', () => {
    const a = run('Budget: $500,000 USD. Minimum 250,000 impressions per deal.')
    const range = filtersOf(a).budget_range as Record<string, unknown>
    assert.equal(
      range.min,
      undefined,
      'filters.budget_range.min is committed money; "250,000 impressions" is a volume. ' +
        `The request carries min=${String(range.min)}, which nobody stated as a budget.`,
    )
  })

  test('a reach figure becomes the total budget', () => {
    const a = run('Reach 2,000,000 households in the United States.')
    assert.equal(
      a.fields.budget_total!.label,
      'missing',
      `budget_total was labelled '${a.fields.budget_total!.label}' with value ` +
        `${JSON.stringify(a.fields.budget_total!.value)} for a household count.`,
    )
  })
})

/* ==================================================================== *
 * 2. A geo filter invented from a content rating
 * ==================================================================== */

describe('ADV-2 ISO 3166-2 shaped tokens that are not places', () => {
  test('"PG-13" and "TV-MA" become filters.regions, labelled stated', () => {
    const a = run('Exclude PG-13 and TV-MA content.')
    assert.equal(
      a.fields.regions!.label,
      'missing',
      `regions = ${JSON.stringify(a.fields.regions!.value)} labelled '${a.fields.regions!.label}'. ` +
        'A film rating is not a subdivision, and the request now geo-targets it.',
    )
    assert.equal(filtersOf(a).regions, undefined)
    assert.equal(a.aamp.target_geo as unknown[] | undefined, undefined)
  })

  test('the invented region passes the built-in AdCP validation', () => {
    const a = run('Exclude PG-13 content.')
    assert.equal(
      a.scores.transactable.adcpValid && filtersOf(a).regions !== undefined,
      false,
      'the request validates while carrying a region nobody stated, so nothing downstream catches it',
    )
  })
})

/* ==================================================================== *
 * 3. A Nielsen DMA invented from a European statistical region
 * ==================================================================== */

describe('ADV-3 metro systems are not interchangeable', () => {
  test('NUTS2 / ITL codes are emitted to AAMP as geo_type DMA', () => {
    const a = run('Target NUTS2 UKI3 and ITL1 TLI.')
    const geo = (a.aamp.target_geo ?? []) as Array<Record<string, string>>
    const lie = geo.filter((g) => g.geo_type === 'DMA' && !/^\d{3}$/.test(g.geo_value))
    assert.deepEqual(
      lie,
      [],
      'a Eurostat NUTS2 / UK ITL code was written as a Nielsen DMA. ' +
        'The engine refuses to map a metro NAME to a DMA code and then relabels a ' +
        'different coding system as DMA anyway.',
    )
  })
})

/* ==================================================================== *
 * 4. USD assumed from an ambiguous sign, and called a derivation
 * ==================================================================== */

describe('ADV-4 "the engine will not assume USD"', () => {
  test('a bare "$" writes USD into both payloads', () => {
    const a = run('Budget $500,000. Canadian campaign, Toronto and Vancouver.')
    const range = (filtersOf(a).budget_range ?? {}) as Record<string, unknown>
    assert.notEqual(
      range.currency,
      'USD',
      "emit.ts says 'the engine will not assume USD'; CURRENCY_SIGNS carries the " +
        "ambiguity note for '$' itself and the value is still emitted, labelled 'derived'.",
    )
  })

  test('a bare "dollars" writes USD, unaccepted', () => {
    const a = run('Spend 2 million dollars.')
    assert.equal(
      a.fields.currency!.label === 'derived' && a.fields.currency!.value === 'USD',
      false,
      'an acknowledged ambiguity (USD/CAD/AUD/NZD/SGD) resolved to one value and ' +
        "labelled 'derived' rather than offered as an assumption, unlike 'per month' -> 720 hours",
    )
    assert.equal((a.aamp as Record<string, unknown>).currency, undefined)
  })
})

/* ==================================================================== *
 * 5. The 60/25/15 split — the invention this package was built against
 * ==================================================================== */

describe('ADV-5 a channel budget split nobody stated per channel', () => {
  test('positional pairing writes budget_pct into the AAMP payload, ungated', () => {
    const a = run('Run CTV, display and audio. Budget split 60/25/15.')
    const allocations = (a.aamp.channels ?? []) as Array<Record<string, unknown>>
    const withPct = allocations.filter((c) => c.budget_pct !== undefined)
    assert.deepEqual(
      withPct,
      [],
      'the brief states three numbers and three channels and never says which number ' +
        'belongs to which channel. The engine\'s own rule string admits it ("the brief does ' +
        'not state the pairing; check it before signing") and the value is still labelled ' +
        "'derived', so EmitOptions.acceptAssumed never sees it. " +
        JSON.stringify(withPct),
    )
  })

  test('the guessed pairing is not offered as an assumption either', () => {
    const a = run('Run CTV, display and audio. Budget split 60/25/15.')
    assert.equal(
      Object.prototype.hasOwnProperty.call(a.offered, 'channel_budget_split'),
      true,
      'a value the engine chose should sit in `offered` until a caller accepts it; ' +
        `it is instead in fields with label '${a.fields.channel_budget_split!.label}'`,
    )
  })
})

/* ==================================================================== *
 * 6. The clock
 * ==================================================================== */

describe('ADV-6 hidden I/O: analyze() reads the system clock', () => {
  test('omitting `now` makes the output wall-clock dependent', () => {
    const RealDate = globalThis.Date
    const fake = (iso: string) =>
      class extends RealDate {
        constructor(...args: unknown[]) {
          // @ts-expect-error variadic passthrough
          if (args.length === 0) super(iso)
          else super(...(args as []))
        }
      } as unknown as DateConstructor

    globalThis.Date = fake('2026-08-12T00:00:00Z')
    const first = analyze('The flight is next quarter.')
    globalThis.Date = fake('2027-03-01T00:00:00Z')
    const second = analyze('The flight is next quarter.')
    globalThis.Date = RealDate

    assert.deepEqual(
      [first.fields.start_date!.value, first.fields.end_date!.value],
      [second.fields.start_date!.value, second.fields.end_date!.value],
      'index.ts:101 `now: opts.now ?? new Date()` makes the same input produce different ' +
        'flight dates on different days. types.ts promises "no clock read except the `now` ' +
        'the caller passes in"; sites/briefgateway/src/pages/generate.astro:1278 calls ' +
        'analyze(text, { assume }) with no `now`, so the shipped UI takes this path.',
    )
  })

  test('the recorded rule calls a clock read a caller-supplied reference date', () => {
    const a = analyze('The flight is next quarter.')
    const rule = String(a.fields.start_date!.rule ?? '')
    assert.equal(
      /caller-supplied|reads no clock of its own/.test(rule),
      false,
      `no \`now\` was passed, yet the receipt shown to the user reads: ${JSON.stringify(rule)}. ` +
        'The reference date came from new Date() in resolveOptions, not from any caller.',
    )
  })

  test('relative dates are never left missing, so the documented refusal is unreachable', () => {
    const a = analyze('The flight is next quarter.')
    assert.equal(
      a.fields.start_date!.label,
      'missing',
      'geo-time-money.ts documents that without a reference date a relative expression ' +
        'stays `missing` with a warning. analyze() always manufactures one, so that path ' +
        'cannot be reached through the public entry point.',
    )
  })
})

/* ==================================================================== *
 * 7. Nothing is dropped silently
 * ==================================================================== */

describe('ADV-7 the AAMP emitter reports a value it did not emit', () => {
  test('postal_areas is `carried` while target_geo has no entry for it', () => {
    const a = run('ZIP codes 90210, 10001.')
    const geo = (a.aamp.target_geo ?? []) as Array<Record<string, string>>
    const claimed = a.carried.aamp.includes('postal_areas')
    const emitted = geo.some((g) => g.geo_type === 'ZIP')
    assert.equal(
      claimed && !emitted,
      false,
      'emit.ts rule 2 says nothing is dropped silently. postal_areas values are ' +
        '{country, system, values[]} objects with no `code` key, so the geo loop skips every ' +
        'item and then reports the key as carried: no Omission, no blocker, no warning, and ' +
        'the ZIP targeting is gone from the AAMP brief.',
    )
  })
})

/* ==================================================================== *
 * 8. Two engine keys, one AdCP path
 * ==================================================================== */

describe('ADV-8 audience exclusions overwrite audience targeting', () => {
  test('filters.signal_targeting is written twice and the exclusions win', () => {
    const base = run('x')
    const fields = {
      audience_primary: {
        label: 'stated' as const,
        value: { adcpSignalTargeting: [{ id: 'seg-primary' }] },
        spans: [],
      },
      audience_exclusions: {
        label: 'stated' as const,
        value: [{ id: 'seg-EXCLUDED' }],
        spans: [],
      },
    }
    const r = toAdcpGetProducts({ input: 'x', fields, options: base.meta.options }, {})
    assert.deepEqual(
      (r.payload.filters as Record<string, unknown>).signal_targeting,
      [{ id: 'seg-primary' }],
      'ADCP_RULES maps both audience_primary and audience_exclusions to ' +
        "'filters.signal_targeting' (emit.ts:241 and emit.ts:255). The second setPath " +
        'overwrites the first, so the request asks to TARGET the audience the buyer ' +
        'excluded, and both keys are reported as carried.',
    )
  })
})

/* ==================================================================== *
 * 8b. A hostname nobody typed
 * ==================================================================== */

describe('ADV-8b vendor domains come from a table, not from the brief', () => {
  test('"DV" becomes vendor.domain doubleverify.com in the request', () => {
    const a = run('Minimum 70% viewability measured by DV, MRC standard.')
    const ps = (filtersOf(a).required_performance_standards ?? []) as Array<Record<string, unknown>>
    const domains = ps.map((e) => (e.vendor as Record<string, unknown> | undefined)?.domain)
    assert.deepEqual(
      domains.filter((d) => d !== undefined),
      [],
      'emit.ts:268 refuses the whole entry when no vendor is named because "the engine will ' +
        'not pick one for you", yet policy-controls.ts:296 ships a name -> hostname table and ' +
        `writes ${JSON.stringify(domains)} into the payload from the two letters "DV".`,
    )
  })
})

/* ==================================================================== *
 * 9. Span integrity — the highlight UI quotes these
 * ==================================================================== */

const CORPUS = [
  'Budget: £500,000. CTV and display in the UK, Q4 2026. Adults 25-54. 3x per user per week.',
  'Reach 2,000,000 households in the United States. Split 60/25/15 across CTV, display and audio.',
  'naïve café “smart quotes” — RTL: مرحبا بالعالم — budget €1.2m, flight November 1 - December 31, 2026',
  'ZIP codes 90210, 10001 and NUTS2 UKI3 and DMA 501. postcodes EC1, SW1',
  'Emoji 😀😀 budget $250,000 in Canada. 70% viewability per MRC via DoubleVerify.',
  'Target audience: millennials. Max CPM $32. No news, no politics. Do not run on breitbart.com.',
  'flight: February 30 2026 to March 45 2026. budget: $NaN',
  'channels: CTV, CTV, CTV. allocate 200% to CTV and 300% to display.',
  'Preferred sellers: Hulu, Roku and Peacock. Excluded sellers: Taboola.',
  'Frequency cap 3 per month. Pacing: even. Nothing books without sign-off.',
]

describe('ADV-9 every span slices back to the text it claims', () => {
  for (const input of CORPUS) {
    test(`spans round-trip: ${input.slice(0, 40)}…`, () => {
      const a = run(input)
      for (const [key, fv] of Object.entries(a.fields)) {
        for (const s of fv.spans) {
          assert.equal(
            input.slice(s.start, s.end),
            s.text,
            `${key}: span ${s.start}-${s.end} claims ${JSON.stringify(s.text)}`,
          )
          assert.ok(s.start >= 0 && s.end <= input.length && s.end >= s.start, `${key}: bad range`)
        }
        if (fv.label === 'stated') {
          assert.ok(fv.spans.length > 0, `${key}: stated with no span`)
        }
        if (fv.label === 'derived') {
          assert.ok(fv.rule !== undefined, `${key}: derived with no rule`)
        }
        if (fv.label === 'missing') {
          assert.equal(fv.value, undefined, `${key}: missing with a value`)
          assert.equal(fv.spans.length, 0, `${key}: missing with spans`)
        }
      }
      for (const s of a.residual) {
        assert.equal(input.slice(s.start, s.end), s.text, 'residual span drift')
      }
    })
  }
})

/* ==================================================================== *
 * 10. The assumed gate itself — this one holds; kept as a regression fence
 * ==================================================================== */

describe('ADV-10 the assumed gate', () => {
  test('an offered assumption never reaches a payload unaccepted', () => {
    const a = run('Budget $500,000 USD. Frequency cap 3 per month.')
    assert.equal(a.aamp.frequency_cap, undefined)
    assert.equal((filtersOf(a) as Record<string, unknown>).pricing_currencies, undefined)
    assert.ok(Object.keys(a.offered).includes('frequency_cap'))
  })

  test('accepting one key does not promote another', () => {
    const a = run('Budget $500,000 USD. Frequency cap 3 per month.', { assume: ['frequency_cap'] })
    assert.deepEqual(a.aamp.frequency_cap, { max_impressions: 3, period_hours: 720 })
    assert.equal((filtersOf(a) as Record<string, unknown>).pricing_currencies, undefined)
  })

  test('a hand-made assumed field is gated in the emitter too', () => {
    const base = run('x')
    const fields = {
      currency: { label: 'assumed' as const, value: 'USD', spans: [], rule: 'engine default' },
      budget_total: { label: 'stated' as const, value: 500000, spans: [] },
    }
    const blocked = toAdcpGetProducts({ input: 'x', fields, options: base.meta.options }, {})
    assert.equal(blocked.payload.filters as Record<string, unknown> | undefined, undefined)
  })
})

/* ==================================================================== *
 * 11. Adversarial inputs must not crash
 * ==================================================================== */

describe('ADV-11 adversarial inputs', () => {
  const hostile: Array<[string, string]> = [
    ['nested quotes', 'Audience: "the \\"real\\" \'core\' buyer". Exclude "news".'],
    ['RTL + bidi override', 'الميزانية budget: $500,000 مرحبا CTV‮evil‬'],
    ['NaN budget', 'budget: $NaN and CPM of $NaN'],
    ['impossible dates', 'flight: February 30 2026 to March 45 2026'],
    ['repeated channels', 'channels: CTV, CTV, CTV'],
    ['whitespace only', '   \n\n  '],
    ['1e400', 'budget $999999999999999999999999 and 1e400'],
    ['zero width', 'C​TV budget $1,000'],
    ['percent over 100', 'allocate 200% to CTV and 300% to display'],
  ]
  for (const [name, input] of hostile) {
    test(name, () => {
      const a = run(input)
      assert.equal(typeof a.adcp.buying_mode, 'string')
      for (const fv of Object.values(a.fields)) {
        for (const s of fv.spans) assert.equal(input.slice(s.start, s.end), s.text)
        if (typeof fv.value === 'number')
          assert.ok(Number.isFinite(fv.value), `${String(fv.value)}`)
      }
      assert.equal(JSON.parse(JSON.stringify(a.adcp)).buying_mode, 'brief')
    })
  }

  test('a 5 MB brief completes', () => {
    const big = 'Budget $500,000 for CTV in the United States. '
      .repeat(120_000)
      .slice(0, 5 * 1024 * 1024)
    const t0 = Date.now()
    const a = run(big)
    const ms = Date.now() - t0
    assert.equal(typeof a.adcp.brief, 'string')
    assert.ok(
      ms < 3_000,
      `5 MB took ${ms}ms of synchronous work; the UI calls analyze() on the main thread`,
    )
  })
})

/* ==================================================================== *
 * 12. A flight window invented from an ordinary English word
 * ==================================================================== */

describe('ADV-12 a month abbreviation inside a longer word is not a month', () => {
  /** One per abbreviation the bare-month alternative of DATE_TOKEN_RE accepts. */
  const words: Array<[string, string]> = [
    ['Jan', 'Janitorial supplies brand, national US display.'],
    ['Feb', 'Febreze-adjacent home care brand, national US display.'],
    ['Mar', 'Marketing budget of $500,000 USD for a CPG snack brand across CTV and display.'],
    ['Apr', 'Aprilia dealer network, US display and online video.'],
    ['May', 'Mayonnaise line extension, US display.'],
    ['Jun', 'Junior apparel line, US display and CTV.'],
    ['Jul', 'Julia the brand mascot returns, US display.'],
    ['Aug', 'Augmented reality unit, US display.'],
    ['Sep', 'Separation anxiety pet brand, US display.'],
    ['Oct', 'Octopus-shaped gummy launch, US display.'],
    ['Nov', 'Novelty confection launch, US display.'],
    ['Dec', 'Decision-stage retargeting, US display.'],
  ]

  for (const [abbr, text] of words) {
    test(`${abbr} inside a word derives no flight window`, () => {
      const a = run(text)
      for (const key of ['start_date', 'end_date'] as const) {
        assert.equal(
          a.fields[key]!.label,
          'missing',
          `${key} came back '${a.fields[key]!.label}' as ${JSON.stringify(a.fields[key]!.value)} ` +
            `from a brief that names no date. Rule given: ${String(a.fields[key]!.rule)}`,
        )
      }
      const f = filtersOf(a)
      assert.equal(f.start_date, undefined)
      assert.equal(f.end_date, undefined)
      assert.equal(a.aamp.flight_start, undefined)
      assert.equal(a.aamp.flight_end, undefined)
    })
  }

  test('a month abbreviation preceded by letters is not a month either', () => {
    const a = run('Trojan condoms brand campaign, US display.')
    assert.equal(a.fields.start_date!.label, 'missing')
    assert.equal(a.fields.end_date!.label, 'missing')
  })

  test('a day number before a longer word is not a date', () => {
    const a = run('Run 3 Marketing units in the United States on display.')
    assert.equal(a.fields.start_date!.label, 'missing')
    assert.equal(a.fields.end_date!.label, 'missing')
  })

  test('a month that really was written still reads as that month', () => {
    const a = run('Flight: March. National US display.')
    assert.equal(a.fields.start_date!.value, '2027-03-01')
    assert.equal(a.fields.end_date!.value, '2027-03-31')
    assert.equal(a.fields.start_date!.label, 'derived')
    assert.equal(a.fields.start_date!.spans[0]!.text, 'March')
  })

  test('an abbreviated month that really was written still reads as that month', () => {
    const a = run('Flight: 1 Nov to 31 Dec 2026. National US display.')
    assert.equal(a.fields.start_date!.value, '2026-11-01')
    assert.equal(a.fields.end_date!.value, '2026-12-31')
  })
})

describe('ADV-13 a month fenced by a non-ASCII letter is not a month', () => {
  /**
   * ADV-12 fenced every month token with `\b`. `\b` without the `u` flag is an
   * ASCII word boundary, so an accented letter reads as a separator and the
   * fence opens: "Marche" with an acute accent contains a closing boundary
   * after "March". One case per accented language a brief plausibly arrives in.
   */
  const words: Array<[string, string]> = [
    ['Marché (fr)', 'Marché : France. Canaux : CTV et display.'],
    ['Março (pt)', 'Março campanha, mercado Brasil, display.'],
    ['Märkte (de)', 'Märkte in Deutschland, CTV und display.'],
    ['Junípero (es)', 'Mission Junípero Serra retail push, US display.'],
    ['Augé (fr)', 'Augé brand relaunch, France, display.'],
  ]
  for (const [label, text] of words) {
    test(`${label} emits no flight window`, () => {
      const a = run(text)
      for (const key of ['start_date', 'end_date'] as const) {
        assert.equal(
          a.fields[key]!.label,
          'missing',
          `${key} came back '${a.fields[key]!.label}' as ${JSON.stringify(a.fields[key]!.value)} ` +
            `from a brief that names no date. Rule given: ${String(a.fields[key]!.rule)}`,
        )
      }
    })
  }
})

describe('ADV-14 a range that closes before it opens is refused, not reordered', () => {
  /**
   * Carrying an unstated year backwards is what makes "November 1 - February
   * 28, 2027" open in 2026, and it is right. Applied to two dates typed in the
   * wrong order it silently produced a flight starting 2025-12-31 from a brief
   * whose only written year was 2026 — an invented value in the field a media
   * plan is costed against. The wrap survives only where it is also the shorter
   * flight.
   */
  test('a transposed flight emits neither date and says why', () => {
    const a = run('Flight: December 31 - November 1, 2026. National US display.')
    assert.equal(a.fields.start_date!.label, 'missing')
    assert.equal(a.fields.end_date!.label, 'missing')
    const w = a.warnings.find((x) => /closes before it opens/.test(x))
    assert.ok(w, `no warning named the reversed range. Warnings: ${JSON.stringify(a.warnings)}`)
    assert.ok(/2025-12-31/.test(w!), 'the warning should name the reading it refused')
  })

  test('the year 2025 appears in no emitted value', () => {
    const a = run('Flight: December 31 - November 1, 2026. National US display.')
    assert.ok(
      !JSON.stringify(a.adcp).includes('2025') && !JSON.stringify(a.aamp).includes('2025'),
      'a year absent from the brief reached a payload',
    )
  })

  test('a genuine year-crossing flight still carries the year back', () => {
    const a = run('Flight: November 1 - February 28, 2027. National US display.')
    assert.equal(a.fields.start_date!.value, '2026-11-01')
    assert.equal(a.fields.end_date!.value, '2027-02-28')
    assert.equal(a.fields.start_date!.label, 'derived')
  })

  test('an ordinary same-year flight is untouched', () => {
    const a = run('Flight: November 1 - December 31, 2026. National US display.')
    assert.equal(a.fields.start_date!.value, '2026-11-01')
    assert.equal(a.fields.end_date!.value, '2026-12-31')
  })
})

describe('ADV-15 a content rating is not a deal type', () => {
  test('"avoid PG-13 content" emits no delivery_type', () => {
    const a = run('Avoid PG-13 content. Market: United States. Channels: CTV.')
    assert.equal(
      a.fields.delivery_type!.label,
      'missing',
      `delivery_type came back ${JSON.stringify(a.fields.delivery_type!.value)} from a ` +
        'brand-safety instruction',
    )
  })

  test('programmatic guaranteed written as PG still reads as guaranteed', () => {
    const a = run('We want PG inventory only. Market: United States. Channels: CTV.')
    assert.equal(a.fields.delivery_type!.value, 'guaranteed')
  })

  test('the phrase in full still reads as guaranteed', () => {
    const a = run('Programmatic guaranteed only. Market: United States. Channels: CTV.')
    assert.equal(a.fields.delivery_type!.value, 'guaranteed')
  })
})
