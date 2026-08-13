/**
 * The emitters, validated against the real schemas.
 *
 * SCHEMA VALIDATION IS FULL, NOT STUBBED. The harness below loads every schema
 * file under `dist/schemas/<version>/` and registers it with ajv by its `$id`,
 * so `/schemas/3.1.13/core/product-filters.json` and every schema it references
 * resolves for real. Nothing is stubbed and no `$ref` is replaced with `true`.
 * Two facts made that possible and both are asserted below rather than assumed:
 *
 *   - `dist/schemas/<version>/bundled/` is a second copy of the same schemas
 *     with the same `$id`s, so it is excluded; ajv rejects a duplicate `$id`.
 *     `test('the excluded duplicate copies are byte-identical')` proves the
 *     exclusion loses nothing.
 *   - Twenty `$id`s appear twice outside `bundled/`: every
 *     `*-async-response-*.json` also exists under `core/async-response-refs/`.
 *     Whichever copy loads first wins and the other is skipped; the same
 *     byte-identity test covers them, and the skipped set is asserted to be
 *     exactly those files and nothing else.
 *
 * `format` keywords are enforced, not waived: `date` is checked against a real
 * ISO 8601 calendar-date test, and a negative control asserts that a payload
 * with a bad date and a three-letter country code is REJECTED. A validator that
 * accepts everything is not a validator, and this file would otherwise be
 * asserting nothing.
 *
 * The AAMP side has no published JSON Schema — `campaign_brief.py` is the
 * artefact — so it is checked against `validateAampCampaignBrief`, which
 * transcribes every validator in that file, plus direct assertions here on the
 * three documented cross-field rules: budget_pct sums to 100, flight_end is
 * after flight_start, and no duplicate channel types.
 *
 * Run:
 *
 *   node --test 'packages/brief-engine/test/*.test.ts'
 *
 * The glob, not the bare directory. Node 24.18 does not expand a directory
 * argument to `--test` — it tries to load the directory as a module and fails
 * before any test runs, which it does equally on an empty fixture directory.
 * The package's own `npm test` script already uses the glob form.
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

import { analyze, toAdcpGetProducts, toAampCampaignBrief } from '../src/index.ts'
import { mergeExtractions, validateAampCampaignBrief, builtinAdcpChecks } from '../src/score.ts'
import { ADCP_SCHEMA_VERSION, FIELD_BY_KEY } from '../src/fields.ts'
import type { FieldValue, ResolvedAnalyzeOptions } from '../src/types.ts'

const require = createRequire(import.meta.url)

/* ==================================================================== *
 * The schema harness
 * ==================================================================== */

const ADCP_REPO = process.env.ADCP_REPO ?? '/srv/ws/agenticbrief/adcp-current'
const SCHEMA_DIST = join(ADCP_REPO, 'dist/schemas')
const SCHEMA_ROOT = join(SCHEMA_DIST, ADCP_SCHEMA_VERSION)
const REQUEST_ID = `/schemas/${ADCP_SCHEMA_VERSION}/media-buy/get-products-request.json`
const haveSchemas = existsSync(SCHEMA_ROOT)

function schemaFiles(root: string): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) {
        // Excluded: a second copy of the same $ids. See the header.
        if (entry.name === 'bundled') continue
        walk(p)
      } else if (entry.name.endsWith('.json')) {
        out.push(p)
      }
    }
  }
  walk(root)
  return out.sort()
}

interface Harness {
  validate: (payload: unknown) => { valid: boolean; errors: string[] }
  /** $ids registered. */
  registered: number
  /** Files whose $id was already registered from another path. */
  duplicates: string[]
}

function buildHarness(): Harness {
  const Ajv = require('ajv') as typeof import('ajv').default
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: true })

  // Formats used across the schema graph. `date` is enforced properly because
  // the engine emits dates; the rest are registered so ajv does not silently
  // ignore an unknown format, and are permissive because this file is testing
  // the brief engine, not ajv's URI parser.
  ajv.addFormat('date', {
    type: 'string',
    validate: (s: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)),
  })
  for (const f of [
    'date-time',
    'time',
    'duration',
    'uri',
    'uri-reference',
    'uri-template',
    'email',
    'idn-email',
    'hostname',
    'idn-hostname',
    'ipv4',
    'ipv6',
    'uuid',
    'regex',
    'json-pointer',
    'relative-json-pointer',
    'iri',
    'iri-reference',
    'byte',
    'binary',
    'int32',
    'int64',
    'float',
    'double',
    'password',
  ]) {
    ajv.addFormat(f, () => true)
  }

  const duplicates: string[] = []
  let registered = 0
  for (const file of schemaFiles(SCHEMA_ROOT)) {
    let doc: Record<string, unknown>
    try {
      doc = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      continue
    }
    if (!doc || typeof doc !== 'object' || typeof doc.$id !== 'string') continue
    try {
      ajv.addSchema(doc)
      registered += 1
    } catch {
      duplicates.push(file)
    }
  }

  const compiled = ajv.getSchema(REQUEST_ID)
  assert.ok(compiled, `${REQUEST_ID} did not compile; every $ref must resolve`)

  return {
    registered,
    duplicates,
    validate: (payload: unknown) => {
      const valid = compiled(payload) === true
      const errors = (compiled.errors ?? []).map(
        (e) => `${e.instancePath || '(root)'} ${e.message ?? ''} ${JSON.stringify(e.params)}`,
      )
      return { valid, errors }
    },
  }
}

const harness = haveSchemas ? buildHarness() : null

function assertValidRequest(payload: unknown, what: string): void {
  assert.ok(harness, 'schema harness')
  const { valid, errors } = harness.validate(payload)
  assert.ok(valid, `${what} does not validate against ${REQUEST_ID}:\n  ${errors.join('\n  ')}`)
}

/* ==================================================================== *
 * Fixtures
 * ==================================================================== */

/** The same brief the three extractor suites use. */
const CANONICAL =
  'Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display ' +
  'and online video. Budget: $500,000 net. Market: United States. Target demo: ' +
  'adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental ' +
  'household penetration and retail sales lift. Requirements: premium CTV inventory, ' +
  'brand safety controls, frequency cap 3 per week.'

/** A brief that states enough to exercise most of the AdCP filter surface. */
const RICH =
  'Allocate 60% to CTV and 40% to digital display. Budget: $500,000 USD. ' +
  'Market: United States and Canada. Flight: 2026-11-01 to 2026-12-31. ' +
  'Guaranteed delivery only, fixed price. Do not run on badsite.com or example.org. ' +
  'Frequency cap 3 per week. Front-loaded pacing. Max CPM $45. Exclusive sponsorship only. ' +
  'In-stream video only. Preferred sellers: pubmatic. We can settle in USD or EUR. ' +
  'Brand safety: exclude Politics. Booking requires approval.'

const NOW = new Date('2026-08-12T00:00:00Z')

const run = (text: string, opts = {}) => analyze(text, { now: NOW, ...opts })

/* ==================================================================== *
 * 0. The harness itself
 * ==================================================================== */

describe('schema harness', { skip: haveSchemas ? false : 'AdCP checkout absent' }, () => {
  test('every schema under the pinned version is registered and the request compiles', () => {
    assert.ok(harness!.registered > 600, `only ${harness!.registered} schemas registered`)
    // Nothing was skipped for any reason other than a $id already registered
    // from another path, and the next test proves those copies are identical.
    assert.ok(
      harness!.duplicates.every((f) => /-async-response-[\w-]+\.json$/.test(f)),
      `a schema was skipped for an unexplained reason: ${harness!.duplicates.join(', ')}`,
    )
  })

  test('the excluded duplicate copies are byte-identical, so excluding them loses nothing', () => {
    const byId = new Map<string, string>()
    const differing: string[] = []
    const all = schemaFiles(SCHEMA_ROOT).concat(
      existsSync(join(SCHEMA_ROOT, 'bundled')) ? schemaFiles(join(SCHEMA_ROOT, 'bundled')) : [],
    )
    for (const file of all) {
      let doc: Record<string, unknown>
      try {
        doc = JSON.parse(readFileSync(file, 'utf8'))
      } catch {
        continue
      }
      if (!doc || typeof doc.$id !== 'string') continue
      const body = JSON.stringify(doc)
      const held = byId.get(doc.$id)
      if (held === undefined) byId.set(doc.$id, body)
      else if (held !== body) differing.push(file)
    }
    assert.deepEqual(differing, [], 'a duplicate $id carries different content')
  })

  test('NEGATIVE CONTROL: the validator rejects a bad country code and a bad date', () => {
    const bad = {
      buying_mode: 'brief',
      brief: 'x',
      filters: { countries: ['USA'], start_date: 'November 1, 2026' },
    }
    const { valid, errors } = harness!.validate(bad)
    assert.equal(valid, false, 'a validator that accepts this is asserting nothing')
    assert.ok(
      errors.some((e) => e.includes('pattern')),
      'expected the ISO 3166-1 pattern to fire',
    )
    assert.ok(
      errors.some((e) => e.includes('format')),
      'expected the date format to fire',
    )
  })

  test('NEGATIVE CONTROL: buying_mode is required', () => {
    assert.equal(harness!.validate({ brief: 'x' }).valid, false)
  })
})

/* ==================================================================== *
 * 1. The emitted AdCP request validates
 * ==================================================================== */

describe('AdCP get_products', { skip: haveSchemas ? false : 'AdCP checkout absent' }, () => {
  test('the canonical brief emits a request that validates', () => {
    assertValidRequest(run(CANONICAL).adcp, 'the canonical request')
  })

  test('the rich brief emits a request that validates', () => {
    assertValidRequest(run(RICH).adcp, 'the rich request')
  })

  test('an empty input still emits a schema-shaped request, and the score says it is not sendable', () => {
    const a = run('')
    // buying_mode alone satisfies `required`; `brief` is conditionally required
    // and the conditional lives in prose, not in the schema's `required` array.
    assert.deepEqual(Object.keys(a.adcp), ['buying_mode'])
    assertValidRequest(a.adcp, 'the empty request')
    assert.equal(a.scores.transactable.adcpValid, false)
    assert.ok(
      a.scores.transactable.adcpErrors.some((e) => e.includes('brief is required')),
      'the engine must catch the conditional the schema cannot express in `required`',
    )
  })

  test('wholesale mode drops `brief`, which the schema forbids, and says what was lost', () => {
    const a = run(CANONICAL, { buyingMode: 'wholesale' })
    assert.equal(a.adcp.brief, undefined)
    assertValidRequest(a.adcp, 'the wholesale request')
    const omission = a.omitted.adcp.find((o) => o.field === 'brief_prose')
    assert.ok(omission)
    assert.match(omission.reason, /forbids brief/)
  })

  test('every populated filter path exists in the pinned product-filters schema', () => {
    const filters = JSON.parse(
      readFileSync(join(SCHEMA_ROOT, 'core/product-filters.json'), 'utf8'),
    ) as { properties: Record<string, unknown> }
    for (const brief of [CANONICAL, RICH]) {
      const emitted = (run(brief).adcp.filters ?? {}) as Record<string, unknown>
      for (const key of Object.keys(emitted)) {
        assert.ok(
          filters.properties[key],
          `filters.${key} is not a property of product-filters.json`,
        )
      }
    }
  })

  test('the residual prose stays in `brief` verbatim', () => {
    const a = run(CANONICAL)
    assert.equal(a.adcp.brief, CANONICAL)
    // The residue is reported separately, and it is not empty: prose that
    // mapped to no field is exactly what AdCP has no schema for.
    assert.ok(a.residual.length > 0)
    for (const span of a.residual) {
      assert.equal(span.text, CANONICAL.slice(span.start, span.end))
    }
    assert.ok(
      a.residual.some((s) => s.text.includes('household penetration')),
      'the business outcome maps to no field and must survive in the string',
    )
  })
})

/* ==================================================================== *
 * 2. The AAMP CampaignBrief satisfies campaign_brief.py's validators
 * ==================================================================== */

/**
 * `advertiser_id`, `campaign_name` and `objective` have no extractor and never
 * will: no rule reads a client's account ID out of prose. A UI collects them.
 * This helper is that UI — it adds them as `stated`, which is what a form field
 * is, and re-emits. It never adds a value the tests then assert was extracted.
 */
function withIdentity(
  text: string,
  identity: Record<string, unknown> = {
    advertiser_id: 'ADV-1001',
    campaign_name: 'Q4 Holiday',
    objective: 'AWARENESS',
  },
): { fields: Record<string, FieldValue<unknown>>; options: ResolvedAnalyzeOptions; input: string } {
  const a = run(text)
  const fields = { ...a.fields }
  for (const [key, value] of Object.entries(identity)) {
    fields[key] = {
      label: 'stated',
      value,
      spans: [{ start: 0, end: 1, text: text.slice(0, 1) }],
      note: 'Supplied by the caller, not extracted.',
      extractor: 'test-harness',
    }
  }
  return { input: a.input, fields, options: a.meta.options }
}

describe('AAMP CampaignBrief', () => {
  test('a fully-stated brief satisfies every validator in campaign_brief.py', () => {
    const { payload } = toAampCampaignBrief(withIdentity(RICH))
    assert.deepEqual(validateAampCampaignBrief(payload), [])
  })

  test('budget_pct sums to 100 when channels are present', () => {
    const { payload } = toAampCampaignBrief(withIdentity(RICH))
    const channels = payload.channels as Array<{ channel: string; budget_pct: number }>
    assert.ok(channels.length >= 1)
    const sum = channels.reduce((n, c) => n + c.budget_pct, 0)
    assert.ok(Math.abs(sum - 100) <= 0.01, `budget_pct sums to ${sum}, not 100`)
  })

  test('flight_end is strictly after flight_start', () => {
    const { payload } = toAampCampaignBrief(withIdentity(RICH))
    assert.ok(
      String(payload.flight_end) > String(payload.flight_start),
      `${String(payload.flight_end)} is not after ${String(payload.flight_start)}`,
    )
  })

  test('there are no duplicate channel types, even when AdCP distinguishes them', () => {
    // AAMP's ChannelType has six values against AdCP's twenty, so 'audio' and
    // 'podcast' both land on AUDIO. The emitter merges them rather than
    // emitting a list campaign_brief.py would reject.
    const a = run('Split the budget 60% CTV, 25% display, 15% audio. Podcast inventory too.')
    const channels = (a.aamp.channels ?? []) as Array<{ channel: string }>
    const types = channels.map((c) => c.channel)
    assert.deepEqual(types, [...new Set(types)], `duplicate channel types: ${types.join(', ')}`)
    assert.ok(types.includes('AUDIO'))
    assert.ok(
      a.warnings.some((w) => w.includes('AAMP ChannelType has one value')),
      'the collapse must be reported, not performed quietly',
    )
  })

  test('every emitted geo target is a valid GeoTarget', () => {
    const a = run(RICH)
    const geo = (a.aamp.target_geo ?? []) as Array<{ geo_type: string; geo_value: string }>
    assert.deepEqual(geo, [
      { geo_type: 'COUNTRY', geo_value: 'US' },
      { geo_type: 'COUNTRY', geo_value: 'CA' },
    ])
  })

  test('an unstated channel split is left absent, not invented, and the model is reported broken', () => {
    const { payload } = toAampCampaignBrief(withIdentity(CANONICAL))
    const channels = payload.channels as Array<Record<string, unknown>>
    assert.ok(channels.length > 0)
    for (const c of channels) {
      assert.equal(c.budget_pct, undefined, 'a budget_pct nobody stated is an invented requirement')
    }
    const violations = validateAampCampaignBrief(payload)
    assert.ok(violations.some((v) => v.includes('no budget_pct')))
    // The thing this product exists to refuse.
    assert.ok(!JSON.stringify(payload).includes('60'), 'no 60/25/15 split, ever')
  })

  test('target_audience is omitted rather than half-built when no taxonomy ID resolves', () => {
    const a = run(CANONICAL)
    assert.equal(a.aamp.target_audience, undefined)
    const omission = a.omitted.aamp.find((o) => o.field === 'audience_primary')
    assert.ok(omission)
    assert.equal(omission.label, 'stated')
    assert.match(omission.reason, /AudiencePlan.primary is a required AudienceRef/)
  })
})

/* ==================================================================== *
 * 3. THE ONE RULE: no assumed value without an explicit accept
 * ==================================================================== */

describe('assumed values are off by default', () => {
  /** A minimal hand-made source carrying one assumed field. */
  function assumedSource(key: string, value: unknown) {
    const a = run(CANONICAL)
    const fields = { ...a.fields }
    fields[key] = {
      label: 'assumed',
      value,
      spans: [],
      rule: 'Engine default, for the test.',
      extractor: 'test-harness',
    }
    return { input: a.input, fields, options: a.meta.options }
  }

  test('the canonical brief offers an assumption and does not take it', () => {
    const a = run(CANONICAL)
    // The brief writes '$500,000', which names no currency: seven currencies
    // share the sign. USD is offered and nothing is emitted.
    assert.ok(a.offered.currency, 'expected an offered assumption')
    assert.equal(a.offered.currency!.label, 'assumed')
    assert.equal(a.fields.currency!.label, 'missing')
    assert.equal((a.adcp.filters as Record<string, unknown>).budget_range, undefined)
    assert.equal(a.aamp.currency, undefined)
  })

  test('accepting the key by name is the only thing that changes that', () => {
    const a = run(CANONICAL, { assume: ['currency'] })
    assert.equal(a.fields.currency!.label, 'assumed')
    assert.deepEqual((a.adcp.filters as Record<string, unknown>).budget_range, {
      currency: 'USD',
      max: 500000,
    })
    assert.ok(
      a.warnings.some((w) => w.includes('was set to') && w.includes('accepted assumption')),
      'an accepted assumption must still announce itself',
    )
  })

  test('accepting a DIFFERENT key does not let this one through', () => {
    const a = run(CANONICAL, { assume: ['delivery_type'] })
    assert.equal(a.fields.currency!.label, 'missing')
    assert.equal((a.adcp.filters as Record<string, unknown>).budget_range, undefined)
  })

  test('a stated ISO 4217 code needs no assumption at all', () => {
    // Control for the two tests above: the gate is on the guess, not on money.
    const a = run('Budget: $500,000 USD for CTV in the United States.')
    assert.equal(a.fields.currency!.label, 'stated')
    assert.equal(a.offered.currency, undefined)
    assert.deepEqual((a.adcp.filters as Record<string, unknown>).budget_range, {
      currency: 'USD',
      max: 500000,
    })
  })

  test('toAdcpGetProducts refuses an assumed value with no acceptAssumed', () => {
    const src = assumedSource('is_fixed_price', true)
    const { payload, omitted } = toAdcpGetProducts(src)
    assert.equal((payload.filters as Record<string, unknown>).is_fixed_price, undefined)
    const o = omitted.find((x) => x.field === 'is_fixed_price')
    assert.ok(o)
    assert.equal(o.label, 'assumed')
    assert.match(o.reason, /Assumed values are off by default/)
  })

  test('toAdcpGetProducts admits it once, and only once, the key is accepted', () => {
    const src = assumedSource('is_fixed_price', true)
    const { payload } = toAdcpGetProducts(src, { acceptAssumed: ['is_fixed_price'] })
    assert.equal((payload.filters as Record<string, unknown>).is_fixed_price, true)
    const other = toAdcpGetProducts(src, { acceptAssumed: ['countries'] })
    assert.equal((other.payload.filters as Record<string, unknown>).is_fixed_price, undefined)
  })

  test('toAampCampaignBrief refuses an assumed value with no acceptAssumed', () => {
    const src = assumedSource('pacing_model', 'EVEN')
    const { payload, omitted } = toAampCampaignBrief(src)
    assert.equal(
      payload.pacing_model,
      undefined,
      "AAMP's own EVEN default is still nobody's decision",
    )
    const o = omitted.find((x) => x.field === 'pacing_model')
    assert.ok(o)
    assert.equal(o.label, 'assumed')
    const accepted = toAampCampaignBrief(src, { acceptAssumed: ['pacing_model'] })
    assert.equal(accepted.payload.pacing_model, 'EVEN')
  })

  test('no assumed field reaches either payload across the whole map, unaccepted', () => {
    const a = run(CANONICAL)
    const fields = { ...a.fields }
    // Poison every currently-missing field with an assumed value.
    for (const [key, fv] of Object.entries(fields)) {
      if (fv.label === 'missing') {
        fields[key] = {
          label: 'assumed',
          value: `POISON-${key}`,
          spans: [],
          rule: 'test',
          extractor: 'test-harness',
        }
      }
    }
    const src = { input: a.input, fields, options: a.meta.options }
    const adcp = JSON.stringify(toAdcpGetProducts(src).payload)
    const aamp = JSON.stringify(toAampCampaignBrief(src).payload)
    assert.ok(!adcp.includes('POISON'), 'an assumed value reached the AdCP payload')
    assert.ok(!aamp.includes('POISON'), 'an assumed value reached the AAMP payload')
  })
})

/* ==================================================================== *
 * 4. Merge and the conflict rule
 * ==================================================================== */

describe('merge', () => {
  const span = (n: number) => [{ start: 0, end: n, text: 'x'.repeat(n) }]

  test('every field in the map is present after a merge of nothing', () => {
    const merged = mergeExtractions([])
    for (const key of Object.keys(FIELD_BY_KEY)) {
      assert.equal(merged.fields[key]!.label, 'missing', `${key} is not missing`)
    }
  })

  test('a `missing` proposal never displaces a claim, and raises no conflict', () => {
    const merged = mergeExtractions([
      { name: 'a', fields: { countries: { label: 'stated', value: ['US'], spans: span(2) } } },
      { name: 'b', fields: { countries: { label: 'missing', spans: [] } } },
    ])
    assert.deepEqual(merged.fields.countries!.value, ['US'])
    assert.deepEqual(merged.conflicts, [])
  })

  test('label precedence decides first: stated beats derived however long the span', () => {
    const merged = mergeExtractions([
      { name: 'a', fields: { countries: { label: 'derived', value: ['CA'], spans: span(40) } } },
      { name: 'b', fields: { countries: { label: 'stated', value: ['US'], spans: span(2) } } },
    ])
    assert.deepEqual(merged.fields.countries!.value, ['US'])
    assert.equal(merged.conflicts[0]!.rule, 'label-precedence')
    assert.equal(merged.conflicts[0]!.winner, 'b')
  })

  test('same label: the longer stated span wins, and the warning names both', () => {
    const merged = mergeExtractions([
      { name: 'a', fields: { countries: { label: 'stated', value: ['CA'], spans: span(2) } } },
      { name: 'b', fields: { countries: { label: 'stated', value: ['US'], spans: span(13) } } },
    ])
    assert.deepEqual(merged.fields.countries!.value, ['US'])
    assert.equal(merged.conflicts[0]!.rule, 'longer-span')
    const w = merged.warnings.find((x) => x.includes("Two extractors claimed 'countries'"))!
    assert.ok(w.includes('a'), 'the warning must name the loser')
    assert.ok(w.includes('b'), 'the warning must name the winner')
    assert.ok(w.includes('["CA"]'), 'the discarded value must be reported, not just dropped')
  })

  test('an exact tie falls to registration order, so the merge is deterministic', () => {
    const merged = mergeExtractions([
      { name: 'a', fields: { countries: { label: 'stated', value: ['CA'], spans: span(2) } } },
      { name: 'b', fields: { countries: { label: 'stated', value: ['US'], spans: span(2) } } },
    ])
    assert.deepEqual(merged.fields.countries!.value, ['CA'])
    assert.equal(merged.conflicts[0]!.rule, 'first-registered')
  })
})

/* ==================================================================== *
 * 5. Scores and blockers
 * ==================================================================== */

describe('scores', () => {
  test('transactable counts nine AAMP requirements plus the request check', () => {
    const a = run(CANONICAL)
    assert.equal(a.scores.transactable.of, 10)
    assert.equal(a.scores.transactable.score, 5)
    assert.deepEqual(a.scores.transactable.missing, [
      'advertiser_id',
      'campaign_name',
      'objective',
      'currency',
      'channel_budget_split',
    ])
    assert.equal(a.scores.transactable.adcpValid, true)
    assert.equal(a.scores.transactable.ok, false)
  })

  test('the absent required fields are reported by name in the detail', () => {
    const a = run(CANONICAL)
    const failed = a.scores.transactable.detail.checks.filter((c) => !c.passed).map((c) => c.name)
    assert.deepEqual(failed, [
      'advertiser_id',
      'campaign_name',
      'objective',
      'currency',
      'channel_budget_split',
    ])
    for (const check of a.scores.transactable.detail.checks) {
      if (!check.passed && FIELD_BY_KEY[check.name]) {
        assert.equal(check.reason, FIELD_BY_KEY[check.name]!.consequence)
      }
    }
  })

  test('expressive counts filter properties in the payload, out of the pinned 30', () => {
    const a = run(CANONICAL)
    assert.equal(a.scores.expressive.of, 30)
    assert.deepEqual(a.scores.expressive.used, ['channels', 'countries', 'end_date', 'start_date'])
    assert.equal(a.scores.expressive.score, 4)
    assert.ok(Math.abs(a.scores.expressive.ratio - 4 / 30) < 1e-9)
  })

  test('a richer brief scores higher on expressive', () => {
    assert.ok(run(RICH).scores.expressive.score > run(CANONICAL).scores.expressive.score)
  })

  test('a stated value that survives no wire is NOT counted as expressive', () => {
    const a = run(CANONICAL)
    assert.equal(a.fields.audience_primary!.label, 'stated')
    assert.ok(!a.scores.expressive.used.includes('signal_targeting'))
  })

  test('the label counts cover the whole map exactly once', () => {
    const a = run(CANONICAL)
    const { stated, derived, assumed, missing } = a.scores.labels
    assert.equal(stated + derived + assumed + missing, a.scores.fieldsTotal)
  })

  test('output is byte-identical across runs with the same options', () => {
    const one = run(CANONICAL)
    const two = run(CANONICAL)
    assert.equal(JSON.stringify(one.adcp), JSON.stringify(two.adcp))
    assert.equal(JSON.stringify(one.aamp), JSON.stringify(two.aamp))
    assert.equal(JSON.stringify(one.blockers), JSON.stringify(two.blockers))
  })

  test(
    'an injected full-schema validator agrees with the built-in subset here',
    {
      skip: haveSchemas ? false : 'AdCP checkout absent',
    },
    () => {
      const a = analyze(CANONICAL, {
        now: NOW,
        validateAdcp: (payload) => {
          const r = harness!.validate(payload)
          return { valid: r.valid, errors: r.errors }
        },
      })
      assert.equal(a.scores.transactable.adcpValid, true)
      assert.deepEqual(a.scores.transactable.adcpErrors, [])
      assert.equal(builtinAdcpChecks(a.adcp).valid, true)
    },
  )
})

describe('blockers', () => {
  test('they are ranked, contiguous, and worst first', () => {
    const a = run(CANONICAL)
    assert.deepEqual(
      a.blockers.map((b) => b.rank),
      a.blockers.map((_, i) => i + 1),
    )
    const order = { blocks: 0, drops: 1, degrades: 2 }
    for (let i = 1; i < a.blockers.length; i += 1) {
      assert.ok(
        order[a.blockers[i - 1]!.severity] <= order[a.blockers[i]!.severity],
        'blockers are out of severity order',
      )
    }
  })

  test('every field-anchored blocker carries the consequence sentence from fields.ts verbatim', () => {
    for (const b of run(CANONICAL).blockers) {
      if (b.field === null) continue
      assert.equal(
        b.consequence,
        FIELD_BY_KEY[b.field]!.consequence,
        `${b.field}: the blocker paraphrases its own rubric`,
      )
    }
  })

  test('the five AAMP requirements this brief lacks lead the list', () => {
    const a = run(CANONICAL)
    assert.deepEqual(
      a.blockers.filter((b) => b.severity === 'blocks').map((b) => b.field),
      ['advertiser_id', 'campaign_name', 'objective', 'currency', 'channel_budget_split'],
    )
  })

  test('the stated demo is reported as dropped, not as missing', () => {
    const b = run(CANONICAL).blockers.find((x) => x.field === 'audience_primary')!
    assert.equal(b.kind, 'stated_but_undeliverable')
    assert.equal(b.severity, 'drops')
    assert.equal(b.label, 'stated')
  })

  test('an unaccepted assumption is a blocker, and names the value it did not use', () => {
    const b = run(CANONICAL).blockers.find((x) => x.kind === 'unaccepted_assumption')!
    assert.equal(b.field, 'currency')
    assert.equal(b.severity, 'degrades')
    assert.match(b.detail, /could set/)
    assert.match(b.detail, /"USD"/)

    // And the pricing_currencies offer, which needs a currency the brief
    // actually stated, still behaves the same way when there is one.
    const p = run('Budget: 500,000 EUR.').blockers.find(
      (x) => x.kind === 'unaccepted_assumption' && x.field === 'pricing_currencies',
    )!
    assert.ok(p, 'pricing_currencies is still offered when a currency is stated')
    assert.equal(p.severity, 'degrades')
  })

  test('a blocker list is not a duplicate list: one entry per field per kind', () => {
    const seen = new Set<string>()
    for (const b of run(CANONICAL).blockers) {
      const k = `${b.kind}:${b.field}:${b.detail}`
      assert.ok(!seen.has(k), `duplicate blocker ${k}`)
      seen.add(k)
    }
  })
})

/* ==================================================================== *
 * 6. Omissions
 * ==================================================================== */

describe('omissions', () => {
  test('every omission names a real field and gives a reason', () => {
    const a = run(CANONICAL)
    for (const o of [...a.omitted.adcp, ...a.omitted.aamp]) {
      assert.ok(FIELD_BY_KEY[o.field], `${o.field} is not in the field map`)
      assert.ok(o.reason.length > 20, `${o.field}: reason too thin`)
      assert.ok(['stated', 'derived', 'assumed', 'missing'].includes(o.label))
    }
  })

  test('nothing is both carried and silently dropped', () => {
    const a = run(CANONICAL)
    for (const key of a.carried.adcp) {
      const o = a.omitted.adcp.find((x) => x.field === key)
      // `channels` may appear in both lists on the AAMP side (some values
      // carried, some not); on AdCP a carried key must not also be omitted.
      assert.ok(!o, `${key} is reported as both carried and omitted`)
    }
  })

  test('a value AdCP cannot express is reported, with the protocol gap named', () => {
    const o = run(CANONICAL).omitted.adcp.find((x) => x.field === 'frequency_cap')!
    assert.equal(o.label, 'derived')
    assert.match(o.reason, /AdCP get_products has no field for frequency cap/)
  })

  test('a value AAMP cannot express is reported, with the protocol gap named', () => {
    const o = run(RICH).omitted.aamp.find((x) => x.field === 'exclusivity')!
    assert.match(o.reason, /AAMP CampaignBrief has no field for/)
  })

  test('a key is `carried` on the AAMP side only when a GeoTarget was actually built', () => {
    // US ZIPs become GeoTargets; a UK outward code cannot, because GeoTarget is
    // {geo_type, geo_value} with no country and 'ZIP' is the US system. The
    // second case must be an omission, not a key reported as carried with
    // nothing behind it.
    const us = run('ZIP codes 90210, 10001.')
    assert.deepEqual(us.aamp.target_geo, [
      { geo_type: 'ZIP', geo_value: '90210' },
      { geo_type: 'ZIP', geo_value: '10001' },
    ])
    assert.ok(us.carried.aamp.includes('postal_areas'))

    const gb = run('Target postcodes EC1, SW1.')
    assert.equal(gb.aamp.target_geo, undefined)
    assert.ok(!gb.carried.aamp.includes('postal_areas'))
    assert.ok(
      gb.omitted.aamp.some(
        (o) => o.field === 'postal_areas' && /United States Postal Service/.test(o.reason),
      ),
    )
  })

  test('only a Nielsen DMA code is written as geo_type DMA', () => {
    const a = run('Buy DMA 501. Also NUTS2 UKI3 and ITL1 TLI.')
    assert.deepEqual(a.aamp.target_geo, [{ geo_type: 'DMA', geo_value: '501' }])
    assert.ok(
      a.omitted.aamp.some((o) => o.field === 'metros' && /eurostat_nuts2/.test(o.reason)),
      'the Eurostat code must be reported as unsendable, not relabelled',
    )
  })
})

describe('filters.signal_targeting is one array with two sources', () => {
  const base = run('x')
  const emit = (fields: Record<string, FieldValue<unknown>>) =>
    toAdcpGetProducts({ input: 'x', fields, options: base.meta.options }, {})

  const primary = {
    label: 'stated' as const,
    value: { adcpSignalTargeting: [{ scope: 'data_provider', signal_id: 'seg-primary' }] },
    spans: [],
  }

  test('a suppression audience joins the array as an exclusion, and does not replace it', () => {
    const r = emit({
      audience_primary: primary,
      audience_exclusions: {
        label: 'stated' as const,
        value: [{ scope: 'data_provider', signal_id: 'seg-excluded' }],
        spans: [],
      },
    })
    assert.deepEqual((r.payload.filters as Record<string, unknown>).signal_targeting, [
      { scope: 'data_provider', signal_id: 'seg-primary' },
      { scope: 'data_provider', signal_id: 'seg-excluded', targeting_mode: 'exclude' },
    ])
    assert.ok(r.carried.includes('audience_primary'))
    assert.ok(r.carried.includes('audience_exclusions'))
  })

  test('an exclusion that is not a SignalRef is refused, not silently included', () => {
    // Without `targeting_mode` an entry reads as a target, so an entry that
    // cannot be stamped as an exclusion must not join the array at all.
    const r = emit({
      audience_primary: primary,
      audience_exclusions: { label: 'stated' as const, value: [{ id: 'seg-excluded' }], spans: [] },
    })
    assert.deepEqual((r.payload.filters as Record<string, unknown>).signal_targeting, [
      { scope: 'data_provider', signal_id: 'seg-primary' },
    ])
    assert.ok(!r.carried.includes('audience_exclusions'))
    assert.ok(
      r.omitted.some((o) => o.field === 'audience_exclusions' && /targeting_mode/.test(o.reason)),
    )
  })
})
