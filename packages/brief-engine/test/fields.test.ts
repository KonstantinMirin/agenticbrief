/**
 * Invariants of the canonical field map.
 *
 * The schema-backed tests read the pinned AdCP release from the working copy
 * at ADCP_REPO (same convention as scripts/spec-parser/parse-adcp.mjs). They
 * skip, loudly, when that checkout is absent — a machine without the schemas
 * cannot verify the map, and pretending otherwise would be its own silent
 * invention.
 *
 *   node --test packages/brief-engine/test/
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import {
  FIELDS,
  FIELD_BY_KEY,
  ADCP_FILTER_FIELD_COUNT,
  ADCP_FILTER_PATHS_COVERED,
  ADCP_SCHEMA_VERSION,
  AAMP_REQUIRED_KEYS,
} from '../src/fields.ts'
import { LABEL_PRECEDENCE, LABELS } from '../src/types.ts'

const ADCP_REPO = process.env.ADCP_REPO ?? '/srv/ws/agenticbrief/adcp-current'
const SCHEMA_ROOT = join(ADCP_REPO, 'dist/schemas', ADCP_SCHEMA_VERSION)
const haveSchemas = existsSync(SCHEMA_ROOT)

function schema(rel: string): Record<string, any> {
  return JSON.parse(readFileSync(join(SCHEMA_ROOT, rel), 'utf8'))
}

describe('field map shape', () => {
  test('keys are unique', () => {
    const keys = FIELDS.map((f) => f.key)
    assert.equal(new Set(keys).size, keys.length)
  })

  test('every entry binds to at least one protocol', () => {
    for (const f of FIELDS) {
      assert.ok(f.adcp !== null || f.aamp !== null, `${f.key} binds to neither protocol`)
    }
  })

  test('every entry has a consequence sentence and at least one alias', () => {
    for (const f of FIELDS) {
      assert.ok(f.consequence.length > 20, `${f.key} consequence too thin`)
      assert.ok(f.aliases.length > 0, `${f.key} has no aliases`)
    }
  })

  test('every one-sided entry explains the blank cell', () => {
    for (const f of FIELDS) {
      if (f.adcp === null || f.aamp === null) {
        assert.ok(f.note && f.note.length > 20, `${f.key} has a blank cell and no note`)
      }
    }
  })

  test('FIELD_BY_KEY covers every entry', () => {
    for (const f of FIELDS) assert.equal(FIELD_BY_KEY[f.key], f)
  })

  test('label precedence orders stated above derived above assumed above missing', () => {
    assert.deepEqual(LABELS, ['stated', 'derived', 'assumed', 'missing'])
    assert.ok(
      LABEL_PRECEDENCE.stated > LABEL_PRECEDENCE.derived &&
        LABEL_PRECEDENCE.derived > LABEL_PRECEDENCE.assumed &&
        LABEL_PRECEDENCE.assumed > LABEL_PRECEDENCE.missing,
    )
  })
})

describe(
  'AdCP bindings match the pinned schemas',
  { skip: !haveSchemas && `no checkout at ${SCHEMA_ROOT}` },
  () => {
    test('pinned version is the published stable release', () => {
      const latest = JSON.parse(readFileSync(join(ADCP_REPO, 'dist/schemas/latest.json'), 'utf8'))
      assert.equal(latest.latest_stable, ADCP_SCHEMA_VERSION)
    })

    test('product-filters really has ADCP_FILTER_FIELD_COUNT properties', () => {
      const filters = schema('core/product-filters.json')
      assert.equal(Object.keys(filters.properties).length, ADCP_FILTER_FIELD_COUNT)
    })

    test('the map covers every filter property, and invents none', () => {
      const filters = schema('core/product-filters.json')
      const actual = Object.keys(filters.properties).sort()
      assert.deepEqual([...ADCP_FILTER_PATHS_COVERED], actual)
    })

    test('non-filter AdCP paths exist on the get_products request', () => {
      const req = schema('media-buy/get-products-request.json')
      const top = new Set(Object.keys(req.properties))
      for (const f of FIELDS) {
        const path = f.adcp?.path
        if (!path || path.startsWith('filters.')) continue
        const root = path.split(/[.[]/)[0]!
        assert.ok(top.has(root), `${f.key}: '${root}' is not a get_products property`)
      }
    })

    test('buying_mode is the only unconditionally required request property', () => {
      const req = schema('media-buy/get-products-request.json')
      assert.deepEqual(req.required, ['buying_mode'])
    })

    test('every referenced enum or core schema file exists', () => {
      for (const f of FIELDS) {
        const src = f.enumSource
        if (!src || !/^(enums|core|media-buy)\//.test(src)) continue
        assert.ok(existsSync(join(SCHEMA_ROOT, src)), `${f.key}: missing schema ${src}`)
      }
    })

    test('required_axe_integrations is still deprecated upstream', () => {
      const filters = schema('core/product-filters.json')
      assert.equal(filters.properties.required_axe_integrations.deprecated, true)
      assert.equal(FIELD_BY_KEY.required_axe_integrations!.adcp!.deprecated, true)
    })
  },
)

describe('AAMP bindings', () => {
  test('the required set is the eight top-level fields plus budget_pct', () => {
    assert.deepEqual([...AAMP_REQUIRED_KEYS].sort(), [
      'advertiser_id',
      'budget_total',
      'campaign_name',
      'channel_budget_split',
      'channels',
      'currency',
      'end_date',
      'objective',
      'start_date',
    ])
  })

  test('target_audience is optional in code however the docstring counts it', () => {
    // campaign_brief.py: `target_audience: AudiencePlan | None = Field(default=None)`.
    // The nine-required-fields docstring is wrong about this one, and the map
    // records the code, not the prose.
    assert.equal(FIELD_BY_KEY.audience_primary!.aamp!.required, false)
  })
})
