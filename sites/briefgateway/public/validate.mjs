// Reproduces every validation claim on https://briefgateway.com/examples/ctv-guaranteed-launch/
// Published at /validate.mjs. Run: ADCP_SCHEMAS=<adcp-repo>/dist/schemas/3.1.13 node validate.mjs
// Requires ajv@8 and a clone of adcontextprotocol/adcp at commit a0fd0b5f (schema release 3.1.13).
// NOTE: ajv-formats is NOT installed, so `format` keywords ("date", "uri") are ignored.
// Do not publish any finding that depends on format validation being off.

import Ajv from 'ajv'
import fs from 'node:fs'
import path from 'node:path'

// Point ADCP_SCHEMAS at your own clone: <adcp-repo>/dist/schemas/3.1.13
const ROOT = process.env.ADCP_SCHEMAS || '/srv/ws/agenticbrief/adcp-current/dist/schemas/3.1.13'
const ajv = new Ajv({ strict: false, allErrors: true, logger: false })

const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) {
      if (e.name === 'bundled') continue
      walk(p)
    } else if (e.name.endsWith('.json')) {
      const s = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (s.$id) {
        try {
          ajv.addSchema(s, s.$id)
        } catch {
          /* duplicate $id */
        }
      }
    }
  }
}
walk(ROOT)

const validate = ajv.getSchema('/schemas/3.1.13/media-buy/get-products-request.json')

const P = {
  adcp_version: '3.1',
  buying_mode: 'brief',
  brief: 'Northwind Air is launching a new nonstop transatlantic route and needs a national CTV awareness burst around it.',
  brand: { domain: 'northwindair.example', industries: ['travel'] },
  account: { account_id: 'nw-air-2026' },
  preferred_delivery_types: ['guaranteed'],
  filters: {
    delivery_type: 'guaranteed',
    channels: ['ctv'],
    video_placement_types: ['instream'],
    exclusivity: 'category',
    countries: ['US', 'CA'],
    start_date: '2026-09-14',
    end_date: '2026-11-08',
    budget_range: { min: 900000, max: 1200000, currency: 'USD' },
    pricing_currencies: ['USD'],
    is_fixed_price: true,
    required_metrics: ['impressions', 'completed_views', 'completion_rate', 'viewability'],
    required_performance_standards: [
      { metric: 'viewability', threshold: 0.7, standard: 'mrc', vendor: { domain: 'doubleverify.com' } },
      { metric: 'ivt', threshold: 0.01, vendor: { domain: 'doubleverify.com' } },
    ],
    min_exposures: 25000000,
  },
  time_budget: { interval: 120, unit: 'seconds' },
}

const F = (o) => ({ ...P, filters: { ...P.filters, ...o } })
const drop = (k) => {
  const c = structuredClone(P)
  delete c[k]
  return c
}

console.log(validate(P) ? 'VALID   base payload' : 'INVALID base payload')
if (!validate(P)) console.log(JSON.stringify(validate.errors, null, 1))
console.log(`filters keys on the base payload: ${Object.keys(P.filters).length}\n`)

const cases = {
  // --- caught ---
  'adcp_version "3.1.13" (patch precision)': { ...P, adcp_version: '3.1.13' },
  'exclusivity "sole"': F({ exclusivity: 'sole' }),
  'channels ["CTV"] uppercase': F({ channels: ['CTV'] }),
  'countries ["us"] lowercase': F({ countries: ['us'] }),
  'video_placement_types ["pre-roll"]': F({ video_placement_types: ['pre-roll'] }),
  'threshold 70 instead of 0.70': F({
    required_performance_standards: [
      { metric: 'viewability', threshold: 70, standard: 'mrc', vendor: { domain: 'doubleverify.com' } },
    ],
  }),
  'perf standard with no vendor': F({ required_performance_standards: [{ metric: 'ivt', threshold: 0.01 }] }),
  'perf metric "brand_lift" (not a perf metric)': F({
    required_performance_standards: [{ metric: 'brand_lift', threshold: 0.7, vendor: { domain: 'doubleverify.com' } }],
  }),
  'required_metrics ["brand_awareness"] (not in enum)': F({ required_metrics: ['brand_awareness'] }),
  'budget_range with no currency': F({ budget_range: { min: 900000, max: 1200000 } }),
  'min_exposures -5': F({ min_exposures: -5 }),
  'time_budget missing unit': { ...P, time_budget: { interval: 120 } },
  'time_budget 120 (bare integer)': { ...P, time_budget: 120 },
  'account_id mixed with brand+operator': { ...P, account: { account_id: 'x', brand: { domain: 'a.com' }, operator: 'a.com' } },
  'buying_mode absent': drop('buying_mode'),

  // --- missed ---
  'filters misspelled as "filter"': (() => {
    const c = { ...P, filter: P.filters }
    delete c.filters
    return c
  })(),
  'viewability standard omitted (MRC vs GroupM)': F({
    required_performance_standards: [{ metric: 'viewability', threshold: 0.7, vendor: { domain: 'doubleverify.com' } }],
  }),
  'filter guaranteed + prefer non_guaranteed': { ...P, preferred_delivery_types: ['non_guaranteed'] },
  'start_date after end_date': F({ start_date: '2026-11-08', end_date: '2026-09-14' }),
  'brief present in wholesale mode': { ...P, buying_mode: 'wholesale' },
  'brief present in refine mode': { ...P, buying_mode: 'refine', refine: [{ scope: 'request', ask: 'more FEP' }] },
  'misspelled filter key "exclusivty"': F({ exclusivty: 'category' }),
  'adcp_version omitted': drop('adcp_version'),
}

for (const [name, payload] of Object.entries(cases)) {
  const ok = validate(payload)
  const first = ok ? '' : '  :: ' + validate.errors[0].instancePath + ' ' + validate.errors[0].message
  console.log(`${ok ? 'ACCEPTED' : 'REJECTED'}  ${name}${first}`)
}

// --- strict local pre-flight overlay -----------------------------------------
// The released request schema wrapped in an allOf that (a) closes additionalProperties
// at the top level and inside `filters`, and (b) adds the if/then that
// core/performance-standard.json does not carry. Strictly narrower than the released
// schema, so anything clearing it still validates upstream.

const req = JSON.parse(fs.readFileSync(`${ROOT}/media-buy/get-products-request.json`, 'utf8'))
const filt = JSON.parse(fs.readFileSync(`${ROOT}/core/product-filters.json`, 'utf8'))
const env = JSON.parse(fs.readFileSync(`${ROOT}/core/version-envelope.json`, 'utf8'))
const topKeys = [...Object.keys(req.properties), ...Object.keys(env.properties)]

const preflight = ajv.compile({
  $id: 'local/preflight.json',
  allOf: [
    { $ref: '/schemas/3.1.13/media-buy/get-products-request.json' },
    { type: 'object', additionalProperties: false, properties: Object.fromEntries(topKeys.map((k) => [k, true])) },
    {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(Object.keys(filt.properties).map((k) => [k, true])),
        },
      },
    },
    {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          properties: {
            required_performance_standards: {
              type: 'array',
              items: {
                if: { properties: { metric: { const: 'viewability' } }, required: ['metric'] },
                then: { required: ['standard'] },
              },
            },
          },
        },
      },
    },
  ],
})

const preflightCases = {
  'base payload': P,
  'filters misspelled as "filter"': cases['filters misspelled as "filter"'],
  'misspelled filter key "exclusivty"': cases['misspelled filter key "exclusivty"'],
  'viewability standard omitted (MRC vs GroupM)': cases['viewability standard omitted (MRC vs GroupM)'],
  'start_date after end_date': cases['start_date after end_date'],
  'filter guaranteed + prefer non_guaranteed': cases['filter guaranteed + prefer non_guaranteed'],
}

console.log('\n-- strict local pre-flight overlay --')
for (const [name, payload] of Object.entries(preflightCases)) {
  console.log(
    `released=${validate(payload) ? 'VALID  ' : 'INVALID'}  strict=${preflight(payload) ? 'VALID  ' : 'INVALID'}  ${name}`,
  )
}
