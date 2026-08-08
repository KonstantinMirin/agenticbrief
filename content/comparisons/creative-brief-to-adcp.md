---
title: 'From Creative Brief to Agent Brief: A Field-by-Field Crosswalk'
description: 'Map every row of a normal agency creative brief onto AdCP 3.1.10 fields. Some rows become typed filters, some become prose, and several have no destination at all.'
answer: 'Most rows of a traditional creative brief map onto typed AdCP fields: budget to filters.budget_range, timing to start_date and end_date, KPIs to required_metrics. Tone, proposition, brand safety and approvals have no typed field and survive only as brief prose.'
pubDate: 2026-08-09
cluster: 'bg-crosswalk'
subjects:
  - 'Agency creative brief'
  - 'AdCP get_products request'
keywords:
  - 'creative brief to adcp'
  - 'convert brief for ai agent'
  - 'brief fields agents can read'
  - 'campaign brief fields machine readable'
  - 'agent readable brief'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/package-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/brand-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/protocol/get-adcp-capabilities-response.json'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/examples/ctv-guaranteed-launch/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://adtechglossary.noetis.dev/media-buying/'
reviewState: cto-reviewed
---

## How do I convert a creative brief into something an agent can read?

You do not convert it. You split it.

A creative brief is one document with sixteen or so headings, written for a human who will read all of it in order. An AdCP request is a typed object where each heading of your brief lands in a different place, and three or four of them land nowhere. The conversion is a routing exercise, and the interesting part is the rows with no destination.

This page maps a conventional agency brief onto AdCP 3.1.10, the published stable release, read from `dist/schemas/3.1.10/` at repository commit `f1a35ab` (2026-08-06).

## Which creative brief rows become typed AdCP fields?

These are the rows a seller agent can enforce mechanically. Put them here and a non-matching product is removed from the response before you see it.

| Creative brief row                          | AdCP field                                                                  | Where                              | Notes                                                                                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Advertiser / client                         | `brand` (`BrandRef`)                                                        | `get_products`, `create_media_buy` | Only `domain` is required. Optional `brand_id` and an `industries` override. Required on `create_media_buy`, optional on `get_products`.                                 |
| Agency / billing entity                     | `account` (`AccountRef`)                                                    | both                               | Switches returned pricing from list to your rate card.                                                                                                                   |
| Budget                                      | `filters.budget_range` `{min, max, currency}`                               | `get_products`                     | `currency` is required inside the object; `min` or `max` must be present. The committed number is `total_budget` on `create_media_buy`.                                  |
| Flight dates                                | `filters.start_date`, `filters.end_date`                                    | `get_products`                     | ISO dates, for availability checks. The committed flight is `start_time` / `end_time` on `create_media_buy`, which are required.                                         |
| Markets                                     | `filters.countries`, `regions`, `metros`, `postal_areas`, `geo_proximity`   | `get_products`                     | ISO 3166-1 alpha-2 and 3166-2. `metros` takes a `{system, code}` pair; `nielsen_dma` is one of five systems.                                                             |
| Channels                                    | `filters.channels`                                                          | `get_products`                     | A 20-value enum, from `display` and `ctv` through `dooh`, `retail_media` and `sponsored_intelligence`.                                                                   |
| Formats                                     | `filters.format_ids`, `filters.standard_formats_only`                       | `get_products`                     | Plus four placement vocabularies: `video_placement_types`, `audio_distribution_types`, `sponsored_placement_types`, `social_placement_surfaces`.                         |
| Guaranteed vs biddable                      | `filters.delivery_type` or `preferred_delivery_types`                       | `get_products`                     | The filter excludes. The preference array ranks and does not exclude. When both are present, the filter wins.                                                            |
| KPIs                                        | `filters.required_metrics`                                                  | `get_products`                     | A 36-value metric vocabulary. This is a capability filter: it returns products that commit to reporting those metrics, not products that promise a number.               |
| Verification thresholds                     | `filters.required_performance_standards`                                    | `get_products`                     | `{metric, threshold, vendor}` with `vendor` as a `BrandRef`. Viewability additionally requires `standard: "mrc"` or `"groupm"`. `ivt` is a ceiling; the rest are floors. |
| Competitive separation                      | `filters.exclusivity`                                                       | `get_products`                     | `none`, `category` or `exclusive`. Undocumented on the reference page (see below).                                                                                       |
| Currency                                    | `filters.pricing_currencies`                                                | `get_products`                     | ISO 4217. Products match only if they offer at least one pricing option in one of your currencies.                                                                       |
| Minimum scale for measurement               | `filters.min_exposures`                                                     | `get_products`                     | Integer floor for measurement validity.                                                                                                                                  |
| Industry classification                     | `advertiser_industry`                                                       | `create_media_buy`                 | An 81-value enum, one per media buy. Not available at discovery.                                                                                                         |
| PO number, IO acceptance, invoice recipient | `po_number`, `io_acceptance`, `invoice_recipient`, `agency_estimate_number` | `create_media_buy`                 | The commercial paperwork lives entirely at commit time.                                                                                                                  |

## Which rows only survive as brief prose?

These have no typed field anywhere in AdCP 3.1.10. If they matter, they go in the `brief` string and a seller's curation model interprets them. Nothing validates the result.

| Creative brief row               | Where it lands | What you give up                                                                                                                                                      |
| -------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business background, the problem | `brief` string | Nothing structured. This is what prose is for.                                                                                                                        |
| Campaign objective               | `brief` string | There is no objective enum in AdCP. Awareness, consideration and conversion are words, not values.                                                                    |
| Target audience description      | `brief` string | `filters.signal_targeting` exists but is a different mechanism: it filters to products where named signals are buyer-selectable. It is not a demographic description. |
| Single-minded proposition        | `brief` string | Everything.                                                                                                                                                           |
| Tone of voice                    | `brief` string | Everything.                                                                                                                                                           |
| Reasons to believe               | `brief` string | Everything.                                                                                                                                                           |
| Content adjacency to avoid       | `brief` string | This is the expensive one. See below.                                                                                                                                 |
| Sole-sponsorship rationale       | `brief` string | The `exclusivity` filter carries the ask, not the reason.                                                                                                             |

`brief-expectations.mdx` lists "Include brand safety requirements" in its DO list for briefs, with the worked example _"Avoid news, political content, and competitive automotive brands"_. There is no filter for it. `product-filters.json` has 30 properties and none of them is a content exclusion.

The two structured surfaces that come closest both need setting up before you can call `get_products`. `required_policies` takes registry policy IDs that must already exist in a policy registry. `property_list` takes a `property_list_id` you create through a property governance agent, using a separate `create_property_list` call, and the seller must declare `features.property_list_filtering: true` in its capabilities for the filter to work at all. Neither is something a brief writer reaches for on a Tuesday afternoon, and until one of them is set up, "no news adjacency" is a sentence in a paragraph.

## Which rows have no home at discovery time at all?

Four. Three of them move to buy time, and the fourth has no home in the protocol at all.

**Frequency cap.** Not in `get_products`, not in `product-filters.json`. It lives at `packages[].targeting_overlay.frequency_cap` on `create_media_buy`, one of 28 properties on `core/targeting.json`. The capabilities response has a `frequency_capping` object whose presence means the seller "honors `targeting.frequency_cap` on packages and MUST reject caps it cannot enforce rather than silently dropping them" — which tells you the failure mode this rule was written to prevent.

**Pacing.** Same story. `packages[].pacing`, a three-value enum: `even`, `asap`, `front_loaded`. Buy-time only.

**Audience targeting proper.** `core/targeting.json` carries the real targeting surface: geo includes and excludes at four levels, dayparts, device platform and type, language, keyword and negative keyword targets, store catchments, audience includes and excludes, signal targeting groups. All of it attaches to a package on `create_media_buy`. At discovery time you describe your audience in a sentence and the seller decides what that means.

That ordering is deliberate and it is the part of AdCP most likely to trip a planner used to a DSP. Discovery is about finding products. Targeting happens after you have bought one.

**Approvals and sign-off.** No field. Human review exists in AdCP only as a seller-side behaviour: a `brief` or `refine` request may return a Submitted envelope when curation needs "HITL review the seller cannot complete inside `time_budget`", and `refine` with `action: "finalize"` "may trigger seller-side approval". Your own approval chain is outside the protocol. If you need a buyer-side gate before commit, you build it into your buyer agent, or you use `refine` with a finalize call as the commit point and put a human in front of it.

## What does the conversion look like end to end?

Take a plain brief paragraph:

> Northwind Air, transatlantic route launch, national CTV, September 14 to November 8, roughly a million dollars, adults 25-54 who travel internationally, premium full-episode streaming, nothing near news, no other airline in the pod, 30s hero and 15s cutdown in English and French-Canadian, measured on completed views and verified viewability with a brand-lift readout.

Routed:

- `brand.domain` — the advertiser.
- `filters.channels: ["ctv"]`, `filters.video_placement_types: ["instream"]` — national CTV, full-episode.
- `filters.start_date` / `filters.end_date` — the flight.
- `filters.budget_range` — the money, with a currency.
- `filters.exclusivity: "category"` — no other airline in the pod.
- `filters.required_metrics` — completed views, completion rate, viewability.
- `filters.required_performance_standards` — the verified part, with a named vendor and an MRC standard.
- `brief` string — the route launch, the traveller audience, the premium-context preference, the news avoidance, the brand-lift readout, the creative inventory.

Two of those brief-string items are load-bearing and unenforceable: news avoidance and the brand-lift readout. That is the honest output of this crosswalk. The full payload is on the [worked CTV example](/examples/ctv-guaranteed-launch/).

## Is exclusivity really undocumented?

Yes, and it is worth flagging because sole-category sponsorship is a normal ask.

`filters.exclusivity` is in `dist/schemas/3.1.10/core/product-filters.json`, referencing `enums/exclusivity.json` with values `none`, `category` and `exclusive`. The string "exclusivity" does not appear anywhere in the 1,772 lines of `docs/media-buy/task-reference/get_products.mdx`. The Filters Object table on that page has 27 rows, and three of them — `format_kinds`, `format_option_refs` and `audience_evidence_requirements` — are not in the 3.1.10 release at all. So the table documents 24 of the 30 released filters. Alongside `exclusivity`, the ones it leaves out are `trusted_match`, `required_features`, `required_axe_integrations`, `required_geo_targeting` and the `ext` extension slot.

The docs track the unreleased `main` branch, which has 33 filters. The published release has 30. Where they differ, [brief vs filters](/spec/brief-vs-filters/) has the full diff.

## Does the other protocol do this differently?

IAB Tech Lab's buyer agent takes a different bet: it defines a standalone `CampaignBrief` object with `objective` as an enum and `channels` as budget allocations that must sum to 100. Structurally that is closer to a real brief. It is also not on the wire, and the shipped examples fail their own model. The [AdCP brief vs AAMP CampaignBrief comparison](/compare/adcp-brief-vs-aamp-campaign-brief/) has the execution trace.
