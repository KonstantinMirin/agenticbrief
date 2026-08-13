/**
 * Tests for the channels / formats / placements / audience extractor.
 *
 * Half of these are negative: they assert that a value the buyer did NOT type
 * is NOT in the output. That is the product's whole claim, so it is the half
 * that matters. If a future change makes the extractor "helpful" — an even
 * channel split, a format ID synthesised from a pixel size, USD inferred from
 * a dollar sign — these fail.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { extractChannelsAudience } from '../src/extract/channels-audience.ts'
import type { FieldValue, Label, Span } from '../src/types.ts'
import { FIELD_BY_KEY } from '../src/fields.ts'

/** The brief from the landscape study, verbatim. */
const CANONICAL =
  'Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display ' +
  'and online video. Budget: $500,000 net. Market: United States. Target demo: ' +
  'adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental ' +
  'household penetration and retail sales lift. Requirements: premium CTV inventory, ' +
  'brand safety controls, frequency cap 3 per week.'

const OWNED_KEYS = [
  'channels',
  'channel_budget_split',
  'format_ids',
  'standard_formats_only',
  'video_placement_types',
  'audio_distribution_types',
  'sponsored_placement_types',
  'social_placement_surfaces',
  'audience_primary',
]

function field(text: string, key: string): FieldValue<unknown> {
  const f = extractChannelsAudience(text).fields[key]
  assert.ok(f, `expected the extractor to propose "${key}"`)
  return f
}

function labelOf(text: string, key: string): Label {
  return field(text, key).label
}

function warningsOf(text: string): string[] {
  return extractChannelsAudience(text).warnings
}

function anyWarning(text: string, pattern: RegExp): boolean {
  return warningsOf(text).some((w) => pattern.test(w))
}

/** Every span must quote the input exactly — a span the UI cannot highlight is a lie. */
function assertSpansQuoteInput(text: string, fields: Record<string, FieldValue<unknown>>): void {
  for (const [key, f] of Object.entries(fields)) {
    for (const s of f.spans as Span[]) {
      assert.equal(
        text.slice(s.start, s.end),
        s.text,
        `${key}: span ${s.start}-${s.end} does not quote the input`,
      )
      assert.ok(s.start >= 0 && s.end <= text.length && s.start < s.end, `${key}: bad span range`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * 1. The canonical brief
 * ------------------------------------------------------------------ */

describe('the canonical brief', () => {
  it('extracts CTV, display and online video against the AdCP channel enum', () => {
    const f = field(CANONICAL, 'channels')
    const value = f.value as Array<{ adcp: string | null; aamp: string | null; surface: string }>
    assert.deepEqual(
      value.map((c) => c.adcp),
      ['ctv', 'display', 'olv'],
    )
    assert.deepEqual(
      value.map((c) => c.surface),
      ['CTV', 'digital display', 'online video'],
    )
    // 'online video' needed a mapping rule, so the field is derived, not stated,
    // and the rule is readable.
    assert.equal(f.label, 'derived')
    assert.match(String(f.rule), /online video/)
    assert.match(String(f.rule), /olv/)
  })

  it('records spans that quote the input exactly', () => {
    const result = extractChannelsAudience(CANONICAL)
    assertSpansQuoteInput(CANONICAL, result.fields)
    const spans = result.fields.channels!.spans
    assert.equal(spans.length, 3)
    assert.equal(CANONICAL.slice(spans[0]!.start, spans[0]!.end), 'CTV')
  })

  it('reports that `olv` has no AAMP channel rather than dropping it', () => {
    const value = field(CANONICAL, 'channels').value as Array<{ adcp: string; aamp: string | null }>
    assert.equal(value.find((c) => c.adcp === 'olv')!.aamp, null)
    assert.ok(anyWarning(CANONICAL, /olv.*no AAMP ChannelType/s))
  })

  it('extracts the demo as an age range with no gender invented', () => {
    const f = field(CANONICAL, 'audience_primary')
    assert.equal(f.label, 'stated')
    const value = f.value as { descriptors: Array<Record<string, unknown>> }
    assert.deepEqual(value.descriptors, [
      { kind: 'age_range', surface: 'adults 25-54', ageMin: 25, ageMax: 54 },
    ])
    // "adults" names no gender. The engine does not read that as "target all
    // genders" and does not emit a gender descriptor.
    assert.equal(
      value.descriptors.filter((d) => d.kind === 'gender').length,
      0,
      'no gender descriptor may be invented from "adults"',
    )
  })

  it('says out loud that the demo reaches neither protocol as a typed value', () => {
    const f = field(CANONICAL, 'audience_primary')
    const value = f.value as {
      adcpSignalTargeting: null
      aampAudiencePlan: { primary: null; rationale: string }
    }
    assert.equal(value.adcpSignalTargeting, null)
    assert.equal(value.aampAudiencePlan.primary, null)
    assert.equal(value.aampAudiencePlan.rationale, 'adults 25-54')
    assert.ok(anyWarning(CANONICAL, /signal_targeting/))
    assert.ok(anyWarning(CANONICAL, /AudiencePlan\.primary/))
  })

  it('proposes exactly its nine keys, all of which exist in the field map', () => {
    const fields = extractChannelsAudience(CANONICAL).fields
    assert.deepEqual(Object.keys(fields).sort(), [...OWNED_KEYS].sort())
    for (const key of Object.keys(fields)) {
      assert.ok(FIELD_BY_KEY[key], `${key} is not in fields.ts`)
      assert.equal(fields[key]!.extractor, 'channels-audience')
    }
  })
})

/* ------------------------------------------------------------------ *
 * 2. NEGATIVE — the extractor does not invent
 * ------------------------------------------------------------------ */

describe('negative: no channel split is invented', () => {
  it('labels the split missing when channels are named without percentages', () => {
    const f = field(CANONICAL, 'channel_budget_split')
    assert.equal(f.label, 'missing')
    assert.equal(f.value, undefined)
    assert.deepEqual(f.spans, [])
    assert.ok(anyWarning(CANONICAL, /no budget split was stated/))
    assert.ok(anyWarning(CANONICAL, /does not distribute the budget evenly/))
  })

  it('emits no 60/25/15 and no even split anywhere in the payload', () => {
    const json = JSON.stringify(extractChannelsAudience(CANONICAL).fields)
    assert.ok(!/\b60\b/.test(json), 'a 60 appeared in a brief that never said 60')
    assert.ok(!/33\.3/.test(json), 'an evenly distributed split appeared')
    assert.ok(!/budget_pct/.test(json), 'an allocation appeared with no allocation stated')
  })

  it('offers nothing: `offered` stays empty, so nothing can be accepted by accident', () => {
    const result = extractChannelsAudience(CANONICAL)
    assert.deepEqual(result.offered, {})
  })
})

describe('negative: no currency is inferred', () => {
  it('never proposes a currency field, even from "$500,000"', () => {
    const fields = extractChannelsAudience(CANONICAL).fields
    assert.equal(fields.currency, undefined)
    assert.equal(fields.budget_total, undefined)
    assert.ok(!JSON.stringify(fields).includes('USD'))
  })

  it('records "$" on an income floor without turning it into an ISO 4217 code', () => {
    const text = 'Target demo: adults 25-54, HHI $100k+.'
    const value = field(text, 'audience_primary').value as {
      descriptors: Array<Record<string, unknown>>
    }
    const income = value.descriptors.find((d) => d.kind === 'household_income')!
    assert.equal(income.incomeMin, 100000)
    assert.equal(income.currencySymbol, '$')
    assert.ok(!JSON.stringify(value).includes('USD'))
    assert.ok(anyWarning(text, /does not identify a currency/))
  })

  it('records no income floor when the magnitude is ambiguous', () => {
    const text = 'Audience: HHI 100.'
    const value = field(text, 'audience_primary').value as {
      descriptors: Array<Record<string, unknown>>
    }
    const income = value.descriptors.find((d) => d.kind === 'household_income')!
    assert.equal(income.incomeMin, null)
    assert.ok(anyWarning(text, /whether it means 100 or 100,000/))
  })
})

describe('negative: nothing is emitted that was not asked for', () => {
  it('emits no attribution window, because none was stated and none is a field', () => {
    const json = JSON.stringify(extractChannelsAudience(CANONICAL))
    assert.ok(!/attribution/i.test(json))
    assert.ok(!/\b14[-\s]day\b/i.test(json))
    assert.ok(!/\b28[-\s]day\b/i.test(json))
    // And the concept is not in the field map at all, so no extractor can smuggle it in.
    assert.equal(
      Object.keys(FIELD_BY_KEY).filter((k) => k.includes('attribution')).length,
      0,
      'fields.ts has grown an attribution field; this extractor must be revisited',
    )
  })

  it('emits no KPI, viewability or performance-standard values from a brief full of them', () => {
    const text = 'CTV campaign. VCR floor of 90%, viewability above 70% per MRC, CTR target 0.8%.'
    const fields = extractChannelsAudience(text).fields
    assert.equal(fields.kpi_targets, undefined)
    assert.equal(fields.required_performance_standards, undefined)
    // and none of those percentages became a channel allocation
    assert.equal(fields.channel_budget_split!.label, 'missing')
  })

  it('returns everything missing for nonsense, and does not crash', () => {
    const text = 'purple monkey dishwasher quantum bicycle'
    const result = extractChannelsAudience(text)
    assert.deepEqual(Object.keys(result.fields).sort(), [...OWNED_KEYS].sort())
    for (const [key, f] of Object.entries(result.fields)) {
      assert.equal(f.label, 'missing', `${key} should be missing`)
      assert.equal(f.value, undefined)
      assert.deepEqual(f.spans, [])
    }
    assert.deepEqual(result.warnings, [])
  })

  it('survives an empty string and other edge inputs', () => {
    for (const text of ['', ' ', '\n\n', '%%%', '///', '25-54', '$', 'x']) {
      const result = extractChannelsAudience(text)
      assert.deepEqual(Object.keys(result.fields).sort(), [...OWNED_KEYS].sort())
      assertSpansQuoteInput(text, result.fields)
    }
    // A bare age range with no demo word is not an audience statement.
    assert.equal(labelOf('25-54', 'audience_primary'), 'missing')
  })
})

/* ------------------------------------------------------------------ *
 * 3. Channel splits, when they ARE stated
 * ------------------------------------------------------------------ */

describe('channel budget split', () => {
  it('records a stated split verbatim', () => {
    const text = 'Budget split: CTV 60%, display 25%, online video 15%.'
    const f = field(text, 'channel_budget_split')
    assert.equal(f.label, 'stated')
    const value = f.value as Array<{ channel: { adcp: string }; budget_pct: number }>
    assert.deepEqual(
      value.map((a) => [a.channel.adcp, a.budget_pct]),
      [
        ['ctv', 60],
        ['display', 25],
        ['olv', 15],
      ],
    )
    assert.ok(!anyWarning(text, /sums to/), 'a split summing to 100 needs no warning')
  })

  it('does not rescale a split that fails AAMP’s sum-to-100 validator', () => {
    const text = 'Channel mix: CTV 60%, display 30%.'
    const value = field(text, 'channel_budget_split').value as Array<{ budget_pct: number }>
    assert.deepEqual(
      value.map((a) => a.budget_pct),
      [60, 30],
    )
    assert.ok(anyWarning(text, /sums to 90, not 100/))
  })

  it('offers a positionally paired ratio as an assumption and writes nothing', () => {
    // THE 60/25/15 CASE. The numbers are stated; which channel each belongs to
    // is not, and the engine's own rule string says so. A guess that admits it
    // is a guess is an assumption, so it goes to `offered` and reaches a
    // payload only when a caller accepts `channel_budget_split` by name.
    const text = 'Channels: CTV, display, online video. Budget split 60/25/15.'
    const result = extractChannelsAudience(text)
    assert.equal(result.fields.channel_budget_split!.label, 'missing')
    assert.equal(result.fields.channel_budget_split!.value, undefined)
    const o = result.offered.channel_budget_split!
    assert.equal(o.label, 'assumed')
    assert.match(String(o.rule), /in the order the brief named them/)
    assert.match(String(o.rule), /the engine's guess, not a reading of your words/)
    assert.deepEqual(
      (o.value as Array<{ budget_pct: number }>).map((x) => x.budget_pct),
      [60, 25, 15],
    )
    assert.ok(anyWarning(text, /paired with the channels positionally/))
  })

  it('an explicit per-channel split is still stated, and still emitted', () => {
    // The control: when the brief binds each number to a channel, nothing is
    // guessed and nothing is gated.
    const text = 'Allocate 60% to CTV and 40% to display.'
    const result = extractChannelsAudience(text)
    assert.equal(result.fields.channel_budget_split!.label, 'stated')
    assert.equal(result.offered.channel_budget_split, undefined)
  })

  it('refuses a bare ratio whose part count does not match the channel count', () => {
    const text = 'Channels: CTV and display. Allocation 60/25/15.'
    assert.equal(labelOf(text, 'channel_budget_split'), 'missing')
    assert.ok(anyWarning(text, /will not guess which number belongs to which channel/))
  })

  it('does not read a date as a split', () => {
    const text = 'Channels: CTV and display. Flight 11/1 - 12/31.'
    assert.equal(labelOf(text, 'channel_budget_split'), 'missing')
    assert.ok(!anyWarning(text, /positionally/))
  })

  it('flags channels left without a percentage', () => {
    const text = 'Channel mix: CTV 100%, plus some display.'
    assert.equal(labelOf(text, 'channel_budget_split'), 'stated')
    assert.ok(anyWarning(text, /No percentage was stated for `display`/))
  })
})

/* ------------------------------------------------------------------ *
 * 4. Formats
 * ------------------------------------------------------------------ */

describe('formats', () => {
  it('never invents a format ID from a pixel size', () => {
    const text = 'Creative: 300x250 and 728x90.'
    const f = field(text, 'format_ids')
    assert.equal(f.label, 'stated')
    const value = f.value as Array<Record<string, unknown>>
    assert.equal(value.length, 2)
    for (const v of value) assert.equal(v.adcpFormatId, null)
    // No `{agent_url, id}` object anywhere in the emitted value — the note may
    // and does discuss agent_url, but nothing serialisable carries one.
    assert.ok(!JSON.stringify(f.value).includes('agent_url'))
    assert.ok(anyWarning(text, /not an AdCP format ID/))
  })

  it('reports the registry slug as evidence, and the AAMP string that does survive', () => {
    const value = field('Creative: 300x250.', 'format_ids').value as Array<Record<string, unknown>>
    assert.equal(value[0]!.observedV1Slug, 'display_300x250')
    assert.equal(value[0]!.canonicalFormat, 'image')
    assert.equal(value[0]!.width, 300)
    assert.equal(value[0]!.height, 250)
    assert.equal(value[0]!.aampFormatPref, '300x250')
  })

  it('reports no slug at all for a size the registry does not list', () => {
    const text = 'Creative: 160x600 skyscraper.'
    const value = field(text, 'format_ids').value as Array<Record<string, unknown>>
    assert.equal(value[0]!.observedV1Slug, null)
    assert.equal(value[0]!.canonicalFormat, null)
    assert.ok(anyWarning(text, /lists no slug for 160x600/))
  })

  it('reads a duration without turning it into a format ID', () => {
    const value = field('One 30s spot.', 'format_ids').value as Array<Record<string, unknown>>
    assert.equal(value[0]!.kind, 'duration')
    assert.equal(value[0]!.duration_ms, 30000)
    assert.equal(value[0]!.observedV1Slug, 'video_30s')
    assert.equal(value[0]!.adcpFormatId, null)
  })

  it('does not read a clock time as a creative duration', () => {
    assert.equal(labelOf('Live at 9:30 on launch day.', 'format_ids'), 'missing')
  })

  it('reads standard-formats-only, and refuses to choose when the brief contradicts itself', () => {
    assert.equal(field('IAB standard formats only.', 'standard_formats_only').value, true)
    assert.equal(labelOf('IAB standard formats only.', 'standard_formats_only'), 'stated')

    const custom = field('We want bespoke units.', 'standard_formats_only')
    assert.equal(custom.value, false)
    assert.equal(custom.label, 'derived')

    const contradiction = 'Standard sizes only. We also want custom units.'
    assert.equal(labelOf(contradiction, 'standard_formats_only'), 'missing')
    assert.ok(anyWarning(contradiction, /will not choose between them/))
  })
})

/* ------------------------------------------------------------------ *
 * 5. Placement axes
 * ------------------------------------------------------------------ */

describe('placement axes', () => {
  it('maps pre-roll to instream and says roll position does not survive', () => {
    const f = field('Pre-roll video only.', 'video_placement_types')
    assert.deepEqual(f.value, ['instream'])
    assert.equal(f.label, 'derived')
    assert.match(String(f.rule), /plcmt=1/)
    assert.match(String(f.note), /pre-, mid- and post-roll alike/)
  })

  it('returns the ambiguity of "outstream" instead of picking a value', () => {
    const text = 'Outstream placements.'
    assert.equal(labelOf(text, 'video_placement_types'), 'missing')
    assert.ok(anyWarning(text, /accompanying_content.*standalone/s))
  })

  it('maps audio distribution words and keeps "streaming audio" ambiguous on that axis', () => {
    assert.deepEqual(field('Podcast and broadcast radio.', 'audio_distribution_types').value, [
      'podcast',
      'fm_am_broadcast',
    ])
    const text = 'Streaming audio buy.'
    assert.equal(labelOf(text, 'audio_distribution_types'), 'missing')
    assert.ok(anyWarning(text, /music_streaming_service.*web_radio/s))
  })

  it('maps social surfaces, including the brand names AdCP folds into short_video', () => {
    const f = field('Reels, in-feed placements and the explore tab.', 'social_placement_surfaces')
    assert.deepEqual(f.value, ['short_video', 'feed', 'explore'])
    assert.match(String(f.rule), /subsumes the platform brand names/)
  })

  it('keeps "sponsored products" ambiguous and does not claim the display channel from "sponsored display"', () => {
    const ambiguous = 'Retail media: sponsored products.'
    assert.equal(labelOf(ambiguous, 'sponsored_placement_types'), 'missing')
    assert.ok(anyWarning(ambiguous, /sponsored_search.*sponsored_display/s))

    const text = 'Retail media: sponsored display only.'
    assert.deepEqual(field(text, 'sponsored_placement_types').value, ['sponsored_display'])
    const channels = field(text, 'channels').value as Array<{ adcp: string }>
    assert.deepEqual(
      channels.map((c) => c.adcp),
      ['retail_media'],
      '"sponsored display" must not be read as the display channel',
    )
  })
})

/* ------------------------------------------------------------------ *
 * 6. Vocabulary gaps between the two protocols
 * ------------------------------------------------------------------ */

describe('protocol vocabulary gaps', () => {
  it('maps buyers’ words for CTV without pretending OTT is exact', () => {
    for (const text of ['Connected TV buy.', 'OTT campaign.', 'Streaming TV push.']) {
      const value = field(text, 'channels').value as Array<{ adcp: string; aamp: string }>
      assert.deepEqual(
        value.map((c) => c.adcp),
        ['ctv'],
      )
      assert.equal(value[0]!.aamp, 'CTV')
      assert.equal(labelOf(text, 'channels'), 'derived')
    }
    assert.match(String(field('OTT campaign.', 'channels').note), /broader than `ctv`/)
  })

  it('gives bare "audio" an AAMP channel and no AdCP channel', () => {
    const text = 'Audio and display.'
    const value = field(text, 'channels').value as Array<{ adcp: string | null; aamp: string }>
    const audio = value.find((c) => c.aamp === 'AUDIO')!
    assert.equal(audio.adcp, null)
    assert.ok(anyWarning(text, /AdCP splits audio into/))
  })

  it('gives "native" an AAMP channel and no AdCP channel', () => {
    const text = 'Native units across the site.'
    const value = field(text, 'channels').value as Array<{ adcp: string | null; aamp: string }>
    assert.equal(value[0]!.adcp, null)
    assert.equal(value[0]!.aamp, 'NATIVE')
    assert.ok(anyWarning(text, /AdCP has no native channel/))
  })

  it('warns when two AdCP audio channels collapse onto one AAMP channel type', () => {
    const text = 'Podcast and streaming audio.'
    const value = field(text, 'channels').value as Array<{ adcp: string; aamp: string }>
    assert.deepEqual(
      value.map((c) => c.adcp),
      ['podcast', 'streaming_audio'],
    )
    assert.ok(value.every((c) => c.aamp === 'AUDIO'))
    assert.ok(anyWarning(text, /AAMP forbids duplicate channel types/))
  })

  it('returns the ambiguity of bare "video", "TV" and "streaming"', () => {
    const text = 'Run it on video across TV, streaming.'
    assert.equal(labelOf(text, 'channels'), 'missing')
    const warnings = warningsOf(text)
    assert.equal(warnings.length, 3)
    assert.ok(warnings.some((w) => /'video' alone/.test(w)))
    assert.ok(warnings.some((w) => /'TV' alone/.test(w)))
    assert.ok(warnings.some((w) => /'streaming' alone/.test(w)))
  })
})

/* ------------------------------------------------------------------ *
 * 7. Audience
 * ------------------------------------------------------------------ */

describe('audience', () => {
  it('reads Nielsen shorthand as derived, with the shorthand spelled out', () => {
    const f = field('Target demo: W18-34.', 'audience_primary')
    assert.equal(f.label, 'derived')
    const descriptors = (f.value as { descriptors: Array<Record<string, unknown>> }).descriptors
    assert.deepEqual(descriptors, [
      { kind: 'age_range', surface: 'W18-34', ageMin: 18, ageMax: 34 },
      { kind: 'gender', surface: 'W18-34', gender: 'female' },
    ])
    assert.match(String(f.rule), /Nielsen demo shorthand/)
  })

  it('reads a worded demo as stated, gender included only when the words name one', () => {
    const women = (
      field('Women 18-34.', 'audience_primary').value as {
        descriptors: Array<Record<string, unknown>>
      }
    ).descriptors
    assert.equal(women.filter((d) => d.kind === 'gender')[0]!.gender, 'female')
    assert.equal(labelOf('Women 18-34.', 'audience_primary'), 'stated')

    const people = (
      field('People 25-54.', 'audience_primary').value as {
        descriptors: Array<Record<string, unknown>>
      }
    ).descriptors
    assert.equal(people.filter((d) => d.kind === 'gender').length, 0)
  })

  it('records an open-ended demo without inventing an upper bound', () => {
    const descriptors = (
      field('Adults 25+.', 'audience_primary').value as {
        descriptors: Array<Record<string, unknown>>
      }
    ).descriptors
    assert.equal(descriptors[0]!.ageMin, 25)
    assert.equal(descriptors[0]!.ageMax, undefined)
  })

  it('keeps an unparseable audience verbatim rather than dropping or resolving it', () => {
    const text = 'Target audience: millennials who love snacks.'
    const f = field(text, 'audience_primary')
    assert.equal(f.label, 'stated')
    const descriptors = (f.value as { descriptors: Array<Record<string, unknown>> }).descriptors
    assert.deepEqual(descriptors, [{ kind: 'unparsed', surface: 'millennials who love snacks' }])
    assert.ok(anyWarning(text, /cannot structure into an age, gender or income descriptor/))
    // No birth-year window was invented for "millennials".
    assert.ok(!JSON.stringify(f).includes('ageMin'))
  })

  it('does not assign AAMP audience roles when several demos are stated', () => {
    const text = 'Primary: adults 25-54. Secondary: women 18-34.'
    assert.ok(anyWarning(text, /assigns each audience a role/))
    assert.ok(!JSON.stringify(extractChannelsAudience(text).fields).includes('extensions'))
  })
})

/* ------------------------------------------------------------------ *
 * 8. Contract: purity, determinism, label invariants
 * ------------------------------------------------------------------ */

describe('extractor contract', () => {
  it('is deterministic and free of regex lastIndex state across calls', () => {
    const a = extractChannelsAudience(CANONICAL)
    const b = extractChannelsAudience(CANONICAL)
    const c = extractChannelsAudience(CANONICAL, { referenceDate: '2026-08-12' })
    assert.deepEqual(b, a)
    assert.deepEqual(c, a, 'referenceDate must not change the output of this extractor')
  })

  it('does not mutate its input or leak state between different inputs', () => {
    const first = extractChannelsAudience('Podcast and streaming audio.')
    extractChannelsAudience('Completely different text with display banners.')
    assert.deepEqual(extractChannelsAudience('Podcast and streaming audio.'), first)
  })

  it('honours the FieldValue invariants from types.ts on every field it proposes', () => {
    const inputs = [
      CANONICAL,
      'purple monkey dishwasher quantum bicycle',
      'Budget split: CTV 60%, display 25%, online video 15%. Creative 300x250, 30s. ' +
        'Pre-roll, in-feed, sponsored search, podcast. Target demo: A25-54, HHI $100k+. ' +
        'IAB standard formats only.',
    ]
    for (const text of inputs) {
      const { fields, warnings } = extractChannelsAudience(text)
      assertSpansQuoteInput(text, fields)
      for (const [key, f] of Object.entries(fields)) {
        switch (f.label) {
          case 'stated':
            assert.ok(f.spans.length >= 1, `${key}: stated needs a span`)
            assert.notEqual(f.value, undefined, `${key}: stated needs a value`)
            break
          case 'derived':
            assert.ok(f.rule, `${key}: derived needs a rule`)
            assert.ok(f.spans.length >= 1, `${key}: derived needs a span`)
            assert.notEqual(f.value, undefined, `${key}: derived needs a value`)
            break
          case 'missing':
            assert.equal(f.value, undefined, `${key}: missing must carry no value`)
            assert.deepEqual(f.spans, [], `${key}: missing must carry no spans`)
            break
          default:
            assert.fail(`${key}: this extractor must never emit ${f.label}`)
        }
      }
      // Every warning is user-facing copy: a non-empty sentence, never a code.
      for (const w of warnings) {
        assert.equal(typeof w, 'string')
        assert.ok(w.trim().length > 20, `warning too terse to act on: ${w}`)
      }
    }
  })

  it('proposes no key outside its nine, whatever the input', () => {
    const noisy =
      'Advertiser Acme, agency Foo, budget $1m USD in EUR, flight Q4, US and UK, DMA 501, ' +
      'frequency cap 3/week, no news, viewability 70%, PG deals, approval required.'
    assert.deepEqual(
      Object.keys(extractChannelsAudience(noisy).fields).sort(),
      [...OWNED_KEYS].sort(),
    )
  })
})
