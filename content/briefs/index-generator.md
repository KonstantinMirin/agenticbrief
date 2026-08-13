---
title: 'AdCP Brief Generator: Paste Prose, Get a get_products Request'
description: 'Paste a campaign brief and get the AdCP get_products request and AAMP CampaignBrief it produces, every field labelled stated, derived, assumed or missing. No account, no model.'
answer: 'Paste a campaign brief and Brief Gateway returns the AdCP get_products request and the AAMP CampaignBrief it produces, labelling each of 64 campaign concepts stated, derived, assumed or missing. Nothing leaves the browser.'
pubDate: 2026-08-09
updatedDate: 2026-08-12
keywords:
  - 'adcp brief generator'
  - 'get_products request builder'
  - 'agentic campaign brief generator'
  - 'protocol-conformant brief'
  - 'machine readable campaign brief'
faq:
  - question: 'Does this send my brief anywhere?'
    answer: 'No. The engine is rule-based JavaScript that runs in your browser. There is no API call, no model, no telemetry, and no account.'
  - question: 'What do you get back?'
    answer: 'An AdCP get_products request and an AAMP CampaignBrief built from the same paragraph, every field labelled stated, derived, assumed or missing, plus two scores and a ranked list of what a seller will guess or drop.'
  - question: 'Is it free, and is there a login?'
    answer: 'Free, and there is no login. The box arrives holding a worked example, the full result is on the first use, and no field is gated behind an account or an email address.'
  - question: 'Will a higher score get me better inventory?'
    answer: 'That is untested and the tool does not measure it. A score tells you which values in your brief reach a protocol field and which arrive at a seller as prose that may or may not be read.'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/flow_state.py'
  - 'https://agenticadvertising.org/api/registry/agents'
  - 'https://writecream.com/ai-powered-creative-brief-generator/'
  - 'https://docs.adcontextprotocol.org/'
related:
  - '/generate/'
  - '/guides/brief-completeness-rubric/'
  - '/guides/brief-preflight-checklist/'
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/examples/ctv-guaranteed-launch/'
  - '/crosswalk/creative-brief-to-adcp/'
  - 'https://adcpexplorer.com/operations/get-products/'
reviewState: cto-reviewed
---

Paste your brief. You get back the AdCP `get_products` request and the AAMP `CampaignBrief` it produces, with the words that produced each value quoted beside it, which is the parse a seller agent performs against a published schema.

**[Score a brief](/generate/).** The box arrives holding a worked example, so there is nothing to type.

Nothing leaves the browser. There is no network call and no account. The same brief and the same reference date always produce byte-identical JSON. Relative expressions like "next quarter" resolve against the browser's today, with no override, so absolute dates are the reproducible option; the result prints the date it used.

## Use it

1. Open [the generator](/generate/), paste your brief over the worked example in the box, and press **Score this brief** or Ctrl/Cmd + Enter from inside the box. Line breaks count as sentence breaks, so a bulleted brief reads the same as a paragraph.
2. Read the two scores: transactable (can a counterparty book this?) and expressive (how many AdCP filters hold a value?). Then read the field table. All 64 concepts get a row, including the ones your brief says nothing about; a toggle hides the empty rows.
3. Work the assumptions list. Each candidate has its own checkbox and prints the rule behind it. The worked example below produces one candidate, `currency`.
4. Copy either payload with the button above it.

## The worked example, scored

The [generator](/generate/) is loaded with this paragraph:

```text
Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display and online video. Budget: $500,000 net. Market: United States. Target demo: adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental household penetration and retail sales lift. Requirements: premium CTV inventory, brand safety controls, frequency cap 3 per week.
```

The AdCP `get_products` request that comes out:

```json
{
  "buying_mode": "brief",
  "brief": "Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display and online video. Budget: $500,000 net. Market: United States. Target demo: adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental household penetration and retail sales lift. Requirements: premium CTV inventory, brand safety controls, frequency cap 3 per week.",
  "filters": {
    "start_date": "2026-11-01",
    "end_date": "2026-12-31",
    "countries": ["US"],
    "channels": ["ctv", "display", "olv"]
  }
}
```

And the AAMP `CampaignBrief`, with `description` holding the same paragraph:

```json
{
  "channels": [{ "channel": "CTV" }, { "channel": "DISPLAY" }],
  "target_geo": [{ "geo_type": "COUNTRY", "geo_value": "US" }],
  "flight_start": "2026-11-01",
  "flight_end": "2026-12-31",
  "total_budget": 500000,
  "frequency_cap": { "max_impressions": 3, "period_hours": 168 }
}
```

That request is the body of a `get_products` call to a sales agent. The [get_products operation](https://adcpexplorer.com/operations/get-products/) has the request and the response it comes back with. Nothing here sends it for you.

That brief scores 5 of 10 transactable and 4 of 30 expressive. Separately, of the 64 concepts in the field table, 4 are stated, 5 derived and 55 missing. The five transactable checks it fails are advertiser, campaign name, objective, currency and the per-channel budget split, each printed with the reason. The four filters it populates are `start_date`, `end_date`, `countries` and `channels`. A populated filter is a constraint and every one of them deletes products, so the expressive score is coverage: [brief vs filters](/spec/brief-vs-filters/) has the routing rule.

Online video reaches AdCP as `channels: ["olv"]` and reaches AAMP as nothing. AAMP has six channel values, CTV, DISPLAY, AUDIO, NATIVE, DOOH and LINEAR_TV, and 13 AdCP channels have no AAMP equivalent. "adults 25-54" is `stated` and lands in neither payload, because `filters.signal_targeting` takes a SignalRef resolved against a signals agent rather than a demographic, and the phrase resolves to no IAB Audience Taxonomy 1.1 identifier for the AAMP side. AAMP takes `max_impressions` and `period_hours`. `get_products` has no frequency field at all, so "3 per week" travels to a seller only as prose inside `brief`. AdCP does define a frequency cap scope, but it applies to a media buy's packages, so it cannot influence which products come back.

## What you get back

| You get                                           | What it is                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Every field, labelled                             | 64 concepts, the union of what the two protocols can express about a campaign, each one `stated`, `derived`, `assumed` or `missing`. |
| A ranked list of what a seller will guess or drop | Every gap in the brief, ranked `blocks`, then `drops`, then `degrades`.                                                              |
| What each payload left out                        | The values that reached one protocol and not the other, with one sentence on what that costs.                                        |

Four rows of the field table, from the worked example:

| Concept         | Label     | What the row carries                                                                                                                           |
| --------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `budget_total`  | `stated`  | `500000`, quoted from "$500,000".                                                                                                              |
| `countries`     | `derived` | `["US"]`, with the rule: "'United States' -> countries: ['US'] (ISO 3166-1 alpha-2 name match)."                                               |
| `currency`      | `assumed` | `"USD"`, offered with the reason and out of both payloads until you tick it.                                                                   |
| `advertiser_id` | `missing` | Nothing to read and nothing to derive, plus the consequence: the AAMP brief will not construct, so nothing downstream of the buyer agent runs. |

The ranking has three levels:

| Rank       | What it means                                                                     |
| ---------- | --------------------------------------------------------------------------------- |
| `blocks`   | Nothing constructs without it.                                                    |
| `drops`    | You wrote it, and neither protocol has anywhere to put it.                        |
| `degrades` | The field exists, your brief is silent, and the seller fills it however it likes. |

The worked example produces 56 ranked gaps: 5 `blocks`, 1 `drops`, 50 `degrades`. The first three, and the one `drops`:

| Rank | Field              | Level    | Consequence printed beside it                                                                                          |
| ---- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | `advertiser_id`    | `blocks` | The AAMP brief will not construct, so nothing downstream of the buyer agent runs.                                      |
| 2    | `campaign_name`    | `blocks` | On the AdCP side the campaign has no human-readable handle in any artefact the seller sees.                            |
| 3    | `objective`        | `blocks` | No downstream allocation logic knows whether to optimise for reach or for conversion.                                  |
| 6    | `audience_primary` | `drops`  | The buy runs untargeted: AdCP returns run-of-network products, and AAMP treats a null plan as "no audience targeting". |

The 64 concepts are the union, so the count includes concepts only one protocol can express: frequency cap, pacing and approval gates have no AdCP discovery-time home. [The completeness rubric](/guides/brief-completeness-rubric/) has the concept-by-concept map.

The AdCP side is built against release 3.1.13. The AAMP side targets the `CampaignBrief` in the IAB Tech Lab buyer agent's `src/ad_buyer/models/campaign_brief.py`, the typed and validated one; that repository defines a second, incompatible `CampaignBrief` in `models/flow_state.py` with no adapter between them, so the output names the model it emitted.

## The four labels

| Label     | What it means                                                             | Reaches the payloads      |
| --------- | ------------------------------------------------------------------------- | ------------------------- |
| `stated`  | You wrote the value. The words that produced it are quoted beside it.     | Yes, where a field exists |
| `derived` | Your words imply the value. The rule that fired is printed beside it.     | Yes                       |
| `assumed` | The engine picked a default and names where the default came from.        | Only after you accept it  |
| `missing` | Nothing to read and nothing to derive, plus what the seller does instead. | No                        |

A `stated` field can still miss both payloads, because neither protocol has a field to carry it.

## The two scores

A score tells you which of your sentences cannot reach a protocol field.

**Transactable, out of ten.** Nine of the ten checks are the values a counterparty has to be given before a campaign can be booked, whichever protocol carries it, and AAMP's `CampaignBrief` is where they are written down: it will not construct without them. Eight are required fields on the model itself: advertiser, campaign name, objective, total budget, currency, flight start, flight end, and at least one channel. The ninth is `budget_pct`, which is required on every `ChannelAllocation` and validated to sum to 100. If you are buying AdCP-only, read the tenth check on its own and treat the other nine as the decisions still open.

The tenth is an AdCP request check: `buying_mode` present and inside its enum, `brief` present in brief mode and absent in wholesale and refine, `if_pricing_version` only alongside `if_wholesale_feed_version`, the `budget_range` object contract, the `minItems: 1` arrays, the ISO 4217, ISO 3166-1, ISO 3166-2 and date patterns, and the required keys of `performance-standard`.

That tenth check is a subset of `get-products-request.json`, not the schema itself. Full JSON Schema validation does not run in your browser, so a payload that clears it here can still fail a seller's validator on a rule outside the subset.

All ten count what reached the payloads, not what your sentences promised, because a value can be read correctly, labelled `stated`, and still have no field to travel in.

**Expressive, out of thirty.** `core/product-filters.json` carries 30 properties at AdCP 3.1.13: 29 filters, one of them (`required_axe_integrations`) deprecated in favour of `trusted_match`, plus `ext` for vendor keys. The score is how many hold a value. The rest arrive at the seller empty and filter nothing. Two of the 30 are not fields you would ordinarily fill, the deprecated one and `ext`, so treat 28 as the working ceiling. Every filter you populate is a hard constraint that deletes products before the seller ranks anything.

## It will not invent a value

The $500,000 in the worked brief does not reach the AdCP request. `filters.budget_range` requires an ISO 4217 currency, and `$`is the sign for the US, Canadian, Australian, New Zealand, Singapore, Hong Kong and Mexican dollars among others, so`currency`comes back`missing`and the whole`budget_range`object is omitted. USD sits in a separate list with the reason attached. Tick it and both payloads are emitted again,`budget_range`carrying`{"currency": "USD", "max": 500000}`and labelled`assumed` everywhere it appears, and transactable moves to 6 of 10.

AAMP makes the gap unavoidable: `budget_pct` is required on every channel allocation and the values must sum to 100, so a brief that never stated a split cannot transact until a person decides what it is. Write "60/25/15" with three channels and the engine pairs them positionally, says it has done so, and offers the result; the split stays `assumed` until you tick it.

[Writecream](https://writecream.com/ai-powered-creative-brief-generator/) took the same paragraph and returned a 60/25/15 channel split, a 14-day view-through window for display and 28 days for CTV, a click-through floor and a completion-rate target, none of it in the input. [The completeness rubric](/guides/brief-completeness-rubric/) has what the other generators returned.

A month named in an exclusion, as in "October is excluded", is still read as an October flight window. It is labelled `derived` with the rule printed beside the dates, so you see it before you send.

## You cannot verify what the seller did

Nothing in an AdCP response reports what a seller did with your prose. `get-products-request.json` sets `additionalProperties: true`, so a misspelled `fliters` key is accepted as an extension and ignored. A `brief` sent in `wholesale` mode passes validation while breaking the rule its own field description states, because that rule was never written as a conditional. The one field that reports narrowing, `filter_diagnostics.excluded_by`, is optional, counts-only, and keyed by the names of your `filters`.

Three sales agents in the public [AdCP registry](https://agenticadvertising.org/api/registry/agents) answer an anonymous `get_products`, and the [registry sweep](https://adcpexplorer.com/guides/adcp-registry-measured/) has what they returned, including a four-product catalogue that answered a US-only brief with Korean CTV.

Whether a better brief wins better inventory is untested.

## Where to go next

- [What a protocol-conformant brief actually is](/spec/): the brief is one string typed `{"type": "string"}` and gated by `buying_mode`. Three payloads there pass a schema validator without being conformant, and the official SDK is looser than the schema it was generated from.
- [The brief completeness rubric](/guides/brief-completeness-rubric/): the field map the scores implement, concept by concept, including the cells left blank because no mapping exists.
- [The pre-flight checklist](/guides/brief-preflight-checklist/): the decisions to settle with the people who have to agree, before any of this is a JSON problem.
