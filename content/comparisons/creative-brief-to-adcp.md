---
title: 'Creative Brief to AdCP: A Field-by-Field Crosswalk'
description: 'Every row of an agency creative brief routed onto AdCP 3.1.13: budget and KPIs become typed filters, tone and mandatories move to brand.json, and the proposition has no home.'
answer: "A creative brief doesn't convert into one AdCP object; it scatters across five: typed filters on get_products, the free-text brief string, the advertiser's hosted brand.json, package fields on create_media_buy, and the message field on build_creative."
pubDate: 2026-08-09
updatedDate: 2026-08-09
subjects:
  - 'Agency creative brief'
  - 'AdCP 3.1.13 request surface'
keywords:
  - 'creative brief to adcp'
  - 'convert brief for ai agent'
  - 'brief fields agents can read'
  - 'campaign brief fields machine readable'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/package-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/brand-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/build-creative-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/creative/video-brief.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/optimization-goal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/performance-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy-features.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/available-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/content-standards/content-standards.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/brand-json.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/by-layer/L2/accounts-and-agents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trust.mdx'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/examples/ctv-guaranteed-launch/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adtechglossary.com/agents/discovery-files/'
reviewState: cto-reviewed
---

## A creative brief splits five ways

A creative brief does not convert into one AdCP object. It splits across five destinations: typed filters on `get_products`, the `brief` string, a hosted `brand.json`, the package fields on `create_media_buy`, and `message` on `build_creative` at production time. Take a filled-in brief, the ordinary kind, with objective, audience, single-minded proposition, tone, mandatories, deliverables, budget, flight, KPIs and an approver list, and those rows land in five separate places. Four are fields on three different requests. The fifth is a file you host on your own domain.

The proposition, the reasons to believe and the rationale under the tone have no enforceable counterpart anywhere in AdCP. They go in the prose field.

| Destination                             | What it is                              | Who enforces it          | How long it lives |
| --------------------------------------- | --------------------------------------- | ------------------------ | ----------------- |
| `filters.*` on `get_products`           | 30 typed properties                     | the seller, by exclusion | one request       |
| `brief` string on `get_products`        | one prose field                         | nobody                   | one request       |
| `/.well-known/brand.json`               | a hosted discovery file                 | nobody, but it's typed   | the brand         |
| `create_media_buy` and its `packages[]` | the commitment, plus the real targeting | schema `required`        | the campaign      |
| `message` on `build_creative`           | one prose field, read at production     | nobody                   | one creative      |

`get_products` has exactly one required property, `buying_mode`, whose enum is `brief`, `wholesale` or `refine`. `create_media_buy` requires five: `idempotency_key`, `account`, `brand`, `start_time`, `end_time`. It has no `brief` property at all, and it does carry `additionalProperties: true`, so you can attach one, a validator will pass it, and it will be dropped without a word.

Content adjacency is the row with no typed home at discovery. "Nothing near news" reaches a seller as prose unless you build it a home first, and there are two routes. `create_content_standards` produces a standards object of `policies[]` addressable by `policy_id`, which the top-level `required_policies` array then references as "Registry policy IDs that the buyer requires to be enforced for products in this response". Or `create_property_list` produces a list that the top-level `property_list` references, and that route only works where the seller has declared `features.property_list_filtering: true` in `get_adcp_capabilities`. That is four content-standards operations or five property-list operations before the words are enforceable, so start the build before the campaign rather than during it.

Publish `brand.json` first. It is the discovery file the advertiser hosts at `/.well-known/brand.json`, and the persistent half of the brief only has to be published once. Route everything else on the day.

The destinations have four different owners. The advertiser publishes brand.json and keeps it current. Your buyer agent assembles the filters and the prose, holds the sign-off chain, and registers any content standards it wants enforced. The seller enforces the filters mechanically and runs a language model over the brief string. Nobody on either side owns the proposition.

The split feels lossy because a creative brief mixes two lifetimes in one document. Budget, flight, market and KPI are campaign-scoped and belong on the wire. Tone, colours, disclaimers and do-nots are brand-scoped, they change once a year at most, and AdCP declines to accept them per request. Which row belongs in `filters` and which stays in the prose is its own decision with its own rule: [brief vs filters](/spec/brief-vs-filters/). Format vocabulary is in the [spec reference](/spec/).

## Every brief row, and where it goes

| Creative brief row                          | AdCP field                                                                  | Where              | Notes                                                                                                                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advertiser / client                         | `brand` (`BrandRef`)                                                        | both               | Only `domain` is required. Optional `brand_id`, plus an `industries` inline override.                                                                                                                                                   |
| Agency / billing entity                     | `account` (`AccountRef`)                                                    | both               | Switches returned pricing from list to your rate card.                                                                                                                                                                                  |
| Budget                                      | `filters.budget_range` `{min, max, currency}`                               | `get_products`     | `currency` is required inside the object. The committed number is `total_budget` on `create_media_buy`.                                                                                                                                 |
| Flight dates                                | `filters.start_date`, `filters.end_date`                                    | `get_products`     | Availability check only. The committed flight is `start_time` / `end_time`, both required at buy time.                                                                                                                                  |
| Markets                                     | `filters.countries`, `regions`, `metros`, `postal_areas`, `geo_proximity`   | `get_products`     | `metros` takes a `{system, code}` pair. `nielsen_dma` is one of five systems, alongside two UK ITL levels, Eurostat NUTS2 and `custom`.                                                                                                 |
| Channels                                    | `filters.channels`                                                          | `get_products`     | A 20-value enum, from `display` and `ctv` through `dooh`, `retail_media` and `sponsored_intelligence`.                                                                                                                                  |
| Formats                                     | `filters.format_ids`, `filters.standard_formats_only`                       | `get_products`     | Plus four placement vocabularies: `video_placement_types`, `audio_distribution_types`, `sponsored_placement_types`, `social_placement_surfaces`.                                                                                        |
| Guaranteed vs biddable                      | `filters.delivery_type`                                                     | `get_products`     | Excludes. `preferred_delivery_types` is a different thing, and the two should not travel together; see the call-sequencing section.                                                                                                     |
| Fixed vs auction pricing                    | `filters.is_fixed_price`                                                    | `get_products`     | Boolean. True returns products with at least one fixed-price option.                                                                                                                                                                    |
| KPIs                                        | `filters.required_metrics`                                                  | `get_products`     | A 36-value vocabulary. A capability filter: it matches products whose `reporting_capabilities.available_metrics` is a superset of yours. It does not make anyone promise a number.                                                      |
| Verification thresholds                     | `filters.required_performance_standards`                                    | `get_products`     | `{metric, threshold, vendor}`, all three required. Viewability also needs `standard: "mrc"` or `"groupm"`. `ivt` is a ceiling; viewability, completion rate, brand safety and attention score are floors.                               |
| Competitive separation                      | `filters.exclusivity`                                                       | `get_products`     | `none`, `category` or `exclusive`. Real, released, and absent from the reference docs.                                                                                                                                                  |
| Search / retail keywords                    | `filters.keywords`                                                          | `get_products`     | `{keyword, match_type}` pairs, for search and retail media supply.                                                                                                                                                                      |
| Currency                                    | `filters.pricing_currencies`                                                | `get_products`     | ISO 4217. Products match only if they price in one of yours.                                                                                                                                                                            |
| Minimum scale for measurement               | `filters.min_exposures`                                                     | `get_products`     | Integer floor for measurement validity. Minimum 1.                                                                                                                                                                                      |
| Audience description                        | nothing here                                                                | —                  | `filters.signal_targeting` looks like the home for it and is not. It filters to products where named signals are buyer-selectable and jointly composable. It is not a demographic description, and passing one will not match anything. |
| Industry classification                     | `advertiser_industry`                                                       | `create_media_buy` | An 81-value enum, one per buy. At discovery the nearest equivalent is `BrandRef.industries`, an inline override for callers who "cannot modify the brand's canonical brand.json".                                                       |
| PO number, IO acceptance, invoice recipient | `po_number`, `io_acceptance`, `invoice_recipient`, `agency_estimate_number` | `create_media_buy` | The commercial paperwork lives entirely at commit time.                                                                                                                                                                                 |

Field-level reference for the whole request is on [get_products](https://adcpexplorer.com/operations/get-products/).

## The conversion, end to end

A plain brief paragraph:

> Northwind Air, transatlantic route launch, national CTV, September 14 to November 8, roughly a million dollars, adults 25-54 who travel internationally, premium full-episode streaming, nothing near news, no other airline in the pod, 30s hero and 15s cutdown in English and French-Canadian, measured on completed views and verified viewability with a brand-lift readout.

Channel, placement, market, flight, currency and budget go on the first call, because a product that fails one of those is no use on this campaign, and `brand`, `preferred_delivery_types` and the `brief` string ride as siblings of `filters` rather than members of it.

```json
{
  "adcp_version": "3.1",
  "buying_mode": "brief",
  "brand": { "domain": "northwindair.example" },
  "preferred_delivery_types": ["guaranteed"],
  "brief": "Transatlantic route launch. Adults 25-54 who travel internationally. Premium full-episode streaming context, nothing adjacent to news. Brand-lift readout alongside delivery reporting.",
  "filters": {
    "channels": ["ctv"],
    "video_placement_types": ["instream"],
    "countries": ["US", "CA"],
    "start_date": "2026-09-14",
    "end_date": "2026-11-08",
    "budget_range": { "min": 900000, "max": 1200000, "currency": "USD" },
    "pricing_currencies": ["USD"]
  }
}
```

The `brief` string and `buying_mode: "brief"` have to travel together: the field is required in this mode and forbidden in the other two, and that rule lives in the description text where no validator will ever apply it. `budget_range` is the one filter here with rules inside it, `currency` required plus an `anyOf` demanding at least one of `min` and `max`, so a range with neither bound is rejected. And `adcp_version` is `"3.1"` and not `"3.1.13"` because the envelope pattern takes two numeric segments and a full release number fails it, which makes the version you read the schemas from the one string that won't validate; [the spec reference](/spec/) has the pattern.

Read the response, then narrow. The filters describing what a seller can measure and promise go in a second call, and `delivery_type` joins them because this client will not take biddable. Same envelope, same `brief`, this `filters` block replacing the first one, and `preferred_delivery_types` dropped from the request now that the filter excludes:

```json
{
  "filters": {
    "delivery_type": "guaranteed",
    "exclusivity": "category",
    "required_metrics": ["completed_views", "completion_rate", "viewability"],
    "required_performance_standards": [
      {
        "metric": "viewability",
        "threshold": 0.7,
        "standard": "mrc",
        "vendor": { "domain": "doubleverify.com" }
      }
    ]
  }
}
```

`vendor` is a `BrandRef` like any other, which is how a measurement company ends up needing a brand.json of its own. `threshold` is a rate with `maximum: 1`, so 70 percent is `0.7` and typing `70` fails validation.

`brand_lift` stays out of `required_metrics` on purpose. It is one of the 36 values in the metric vocabulary, so it would validate, and it would silently exclude every CTV product that doesn't declare brand-lift reporting. Keep the lift readout in the prose and negotiate it at package level; the worked CTV example sets out the arithmetic, including the `min_exposures` floor that makes a lift study readable.

`brand.json` on northwindair.example takes nothing at all from this paragraph. The tone, the logo lockup and the fare disclaimers were published once, before this campaign existed, and they arrive through `brand: {domain: "northwindair.example"}`. `create_media_buy` and its packages get the committed budget and flight, the PO number, any frequency cap on the 30s hero, and the cutdowns themselves once they exist, as `creative_assignments` on the package.

The full payload, with all 13 filters and the constraint mistakes the schema accepts, is in the [worked CTV example](/examples/ctv-guaranteed-launch/). To route your own brief, paste it into [the generator](/generate/): it applies the rules on this page mechanically, marks each field as stated, derived or assumed, and leaves the rows with no destination blank instead of filling them in with something plausible.

## Send half your filters on the first call, not all of them

Every filter you set can only shrink the response. `core/product-filters.json` publishes 30 properties in the 3.1.13 release. Set one wrong and the response comes back short and clean, missing the thing you'd have bought. That is the specified behaviour, not a bug: the docs entry for `required_metrics` says sellers "MUST silently exclude products that cannot meet the list — filter-not-fail; do not return an error."

You cannot ask a seller which filters it honours. `get_adcp_capabilities` carries 17 blocks under `media_buy`, and the one `filters.required_features` reads holds four booleans: `inline_creative_management`, `property_list_filtering`, `catalog_management`, `committed_metrics_supported`. Nothing in the response enumerates support for the 30 filters themselves. A response _may_ carry a `filter_diagnostics` block attributing exclusions to named filters, and "may" is the docs' word for it: observability, not error reporting. There is no compatibility matrix to look up. The one carve-out is `audience_evidence`, where sellers "MUST NOT silently ignore unsupported hard requirement or presence modes".

The control you can get costs one extra round trip. Send the unbuyable-if-wrong filters first: currency, flight dates, countries, channels. A product that fails those is genuinely no use on this campaign. Hold back `required_performance_standards`, `required_metrics` and `exclusivity`, read what came back, then narrow. Those three describe what the seller can measure and promise, not anything about your campaign, and they are exactly the three a planner will set straight off the brief.

The count of 30 is the released tree. AdCP's unreleased branch carries four filters that are not in 3.1.13 (`audience_evidence_requirements`, `format_kinds`, `format_option_refs`, `pricing_structures`), so a filter someone demos to you may not exist in the version you are sending.

And don't send `filters.delivery_type` and `preferred_delivery_types` together: one excludes and one ranks, they sit at different levels of the request, and no precedence rule is published for the case where they disagree. Set the filter only when the other kind is genuinely unbuyable, a guaranteed-only client or a biddable-only pipe. Otherwise state the preference and let the response tell you what exists. The [worked CTV example](/examples/ctv-guaranteed-launch/) sends both deliberately and shows what that buys and what it costs.

## Tone and mandatories live in a hosted file

Tone, colour, logo lockups and legal lines go into a file the advertiser publishes. `dist/schemas/3.1.13/brand.json` opens with: "Brand identity and discovery file. Hosted at /.well-known/brand.json on house domains." It's a released AdCP schema, and it types `tone` as either a plain string or an object of `{voice, attributes[], dos[], donts[]}`. The array for guardrails is literally named `donts`. An agency brief's mandatories section has a field waiting for it, spelled the way the planner would spell it.

| Agency brief section                        | brand.json field                                      |
| ------------------------------------------- | ----------------------------------------------------- |
| Tone of voice                               | `tone.voice`, `tone.attributes[]`                     |
| Do's and do-nots                            | `tone.dos[]`, `tone.donts[]`                          |
| Mandatories: logo, colour, type             | `logos[]`, `colors`, `fonts`, `visual_guidelines`     |
| Legal lines                                 | `disclaimers[]`, items of `{text, context, required}` |
| Endline / strapline                         | `tagline`                                             |
| Who we are talking to, the standing version | `target_audience`                                     |
| Products in scope                           | `product_catalog`                                     |

Every AdCP request reaches all of that through exactly one field. `core/brand-ref.json` requires `domain` and nothing else, described as "Domain where /.well-known/brand.json is hosted, or the brand's operating domain". More on the pattern under [discovery files](https://adtechglossary.com/agents/discovery-files/).

Whether a seller agent in production reads your `tone.donts` and acts on it is a different question. Publish the file anyway: it is one static document on a domain you already own, and it costs one deploy. To find out whether a counterparty resolved it, watch your own access log for a fetch of `/.well-known/brand.json` around the time you sent the request. A vendor's compliance claim is not evidence that anything on the other end parsed the field.

`BrandRef.brand_kit_override` exists because the file is often wrong. Its description says to use it when brand.json is "missing, stale, or inappropriate for this specific call", with a campaign-scoped tagline and a freshly-rebranded colour palette as the worked examples. The merge is field-level: override `colors.primary` and you still inherit `colors.secondary`. Freshness elsewhere is advisory: 24-hour cache TTLs recommended for canonical and redirect files, an hour for failed lookups, with one MUST, that `redirect_effective_at` invalidates anything cached before it. The resolution algorithm is three steps and a three-hop cap, and it has no failure branch: it says what to do when the fetch works and stays silent on what to do when it 404s.

`brand` is optional on `get_products` and required on `create_media_buy`, so the brand layer only becomes mandatory when you commit. A discovery call can go out with no brand identity at all and the seller will still curate.

## What verifies `brand.domain`

Nothing at discovery. A house publishes `authorized_operators[]`, "Entities authorized to represent brands from this house. Third parties (sellers, platforms) can verify an operator's authorization by checking this list", scoped by brand, country, activity and a validity window. Checking it is a SHOULD, and the docs hang it on `sync_accounts`, account provisioning, well away from `get_products`. Removing an operator doesn't kill live accounts either: "Revocation is eventual, not immediate."

AdCP's own trust page names the residue, "no buyer-side authorization primitive symmetric to `adagents.json`", and spells out the consequence: "A compromised agent at an authorized operator's domain can transact unilaterally on every brand that lists that operator." That is a vendor-risk line, not a schema quibble. If you are the operator on that list, your agent's compromise is your client's brand transacting without them; if you are the advertiser, your exposure is the length of your `authorized_operators[]` array and the memory of whoever last pruned it.

## `build_creative` carries a second brief field

This is the fifth destination. A creative agent reads it at production time, long after discovery and commit, so a brief row can land here on top of one of the other four.

The `message` property on `media-buy/build-creative-request.json` reads: "Natural language instructions for the transformation or generation. For pure generation, this is the creative brief." So AdCP has two fields that both mean brief, sitting on different operations and read by different agents. `build_creative`'s only required property is `idempotency_key`, and its `brand` reference resolves "to full brand identity (colors, logos, tone) at execution time", which is the same brand.json arriving by the same route.

Script, duration and cutdown structure land here, as `creative/video-brief.json` segments of `{order, duration_ms, prompt}` with optional voiceover and caption. The deliverables list itself, the 30s hero and the 15s cutdown and the two language versions, has no discovery-time home at all. It attaches at commit, on `packages[].creatives` for assets you upload inline or `packages[].creative_assignments` for library creatives that already exist.

The storyboard row is refused outright, in `creative/video-brief.json`'s own description: "This is a _generation_ brief, not a creative-direction storyboard: there is no camera direction, shot type, mood, or reference-asset attachment." Direction does travel, as an attachment: buyers who want camera, lighting or reference-image conditioning send a `reference-asset.json` with `purpose: "storyboard"`.

## Which rows are buy-time only: frequency cap, pacing, targeting, optimisation goals

Four of the most familiar brief rows have no discovery-time home. All four attach to the package at buy time.

- Frequency cap is absent from `product-filters.json` entirely. It lives at `packages[].targeting_overlay.frequency_cap`, one of 28 properties on `core/targeting.json`. The capabilities response carries a `frequency_capping` object whose presence means the seller "honors targeting.frequency_cap on packages and MUST reject caps it cannot enforce rather than silently dropping them".
- Pacing is `packages[].pacing`, three values: `even`, `asap`, `front_loaded`.
- The real targeting surface is `core/targeting.json`: geo includes and excludes at four levels, dayparts, device platform and type, language, keyword and negative keyword targets, store catchments, audience includes and excludes, signal targeting groups. All of it attaches to a package.
- Your optimisation target is `packages[].optimization_goals[]`, a discriminated union with three kinds. `metric` draws on an 11-value seller-native list from `clicks` and `completed_views` to `attention_seconds` and `reach`. `event` covers advertiser-tracked conversions, `vendor_metric` covers the rest. Goals carry a `priority`, where 1 is primary and duplicate values are explicitly undefined behaviour.

Full request shape at [create_media_buy](https://adcpexplorer.com/operations/create-media-buy/), and the object itself at [media buy](https://adtechglossary.com/media-buying/media-buy/).

## Eight rows survive only as prose

Write these into the `brief` string and expect nothing back that confirms they were read. None has a typed field anywhere in AdCP 3.1.13. `brief` is a bare `string`, "Natural language description of campaign requirements", so a curation model on the seller's side decides what each one meant and nothing validates the answer.

| Creative brief row               | Where it lands | What you give up                                                                                                                                                                                            |
| -------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business background, the problem | `brief` string | Nothing structured. This is what prose is for.                                                                                                                                                              |
| Campaign objective               | `brief` string | There is no objective enum on the media-buy surface. Awareness, consideration and conversion are words, not values. The five-value enum lives on `core/creative-brief.json`, which never reaches discovery. |
| Target audience description      | `brief` string | `filters.signal_targeting` is a different mechanism; the crosswalk row above has the detail.                                                                                                                |
| Single-minded proposition        | `brief` string | No enum, no validation, and no confirmation the seller read it.                                                                                                                                             |
| Tone of voice                    | `brief` string | Nothing carries it at request time. The standing version has a home in `brand.json`.                                                                                                                        |
| Reasons to believe               | `brief` string | No enum, no validation, and no confirmation the seller read it.                                                                                                                                             |
| Content adjacency to avoid       | `brief` string | This is the expensive one. It has two structured routes and both are builds.                                                                                                                                |
| Sole-sponsorship rationale       | `brief` string | `filters.exclusivity` carries the ask. Nothing carries the reason.                                                                                                                                          |

IAB Tech Lab's buyer agent types several of them where AdCP does not: `objective` as a four-value enum, `brand_safety` with `excluded_categories[]` and `excluded_keywords[]`, a `frequency_cap`, a `pacing_model` enum, `kpis[]` over a seven-value metric list, and an `approval_config` with four gates. None of it is on a wire — no `CampaignBrief` schema exists anywhere in the AAMP wire contract, whose 22 object schemas run Account through SupplyChain with no brief among them — and the same repository declares two `CampaignBrief` classes with incompatible field names, so you would also have to pick one. It is a planning model, not a wire contract. The full execution trace is in [AdCP brief vs AAMP CampaignBrief](/compare/adcp-brief-vs-aamp-campaign-brief/).

`brief-expectations.mdx` puts "Include brand safety requirements" in its DO list for brief authors, with the worked example _"Avoid news, political content, and competitive automotive brands"_. No discovery field carries it; the two routes that do are the content-standards and property-list builds.

Buyer-side approval is the other hole, and it is a headcount problem. AdCP models human review only on the seller's side: a `brief` or `refine` call may return Submitted "when curation requires upstream-system queries or HITL review the seller cannot complete inside `time_budget`", and `refine` with `action: "finalize"` "may trigger seller-side approval (HITL)". Your own sign-off chain, the one with the client lead and the legal reviewer on it, is your buyer agent's problem entirely, and nobody on the other side of the wire can see whether it ran.
