---
title: 'Worked Example: Guaranteed CTV Brand Launch Brief'
description: 'A filled-in campaign brief for a guaranteed CTV route launch, shown as prose and as a get_products request payload that validates against the AdCP 3.1.10 schema.'
answer: 'Worked example of a filled-in AdCP brief for a guaranteed CTV brand launch: the prose brief, the routing decision behind every field, and a complete get_products request payload that validates against the published AdCP 3.1.10 schema.'
pubDate: 2026-08-09
channel: 'ctv'
cluster: 'bg-examples'
worked: true
keywords:
  - 'ctv campaign brief example'
  - 'adcp request payload examples'
  - 'filled media brief example'
  - 'guaranteed ctv brief'
  - 'get_products example'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/performance-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/available-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/exclusivity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/duration.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/task-reference/get_products.mdx'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://adcpexplorer.noetis.dev/operations/create-media-buy/'
reviewState: cto-reviewed
---

## What is this example?

Every campaign brief tool I looked at ships a blank template. This is the opposite — one campaign, filled in, routed field by field, down to the payload you can copy.

The campaign is fictional and the brand domain is a reserved example name. Everything else — field names, enum values, structural rules — is read from the AdCP 3.1.10 published schemas at `dist/schemas/3.1.10/`, repository commit `f1a35ab`, 2026-08-06.

## The campaign, in the words a planner would use

Northwind Air is opening a new nonstop transatlantic route out of the US east coast, first flight in mid-November. Marketing wants a national CTV awareness burst that lands before booking windows open, running from mid-September to the week before launch. The budget is around a million dollars, and it is guaranteed inventory: they want to know what they are getting before they commit.

The audience is adults 25 to 54 who travel internationally at least once a year, with a skew to people who research trips in the evening. Media has asked for premium full-episode streaming next to travel, food and documentary programming. No news, and no hard-news adjacency at all, which is a standing rule for this advertiser and not a preference. They want sole-category presence in the pod where a publisher can offer it, so no competing airline or online travel agency runs in the same break.

Creative is a 30-second hero spot with a 15-second cutdown, English and French-Canadian. Success is completed views and verified viewability, with a brand-lift readout at the end of the flight.

## How does that route into an AdCP request?

Seven routing decisions, each with a reason.

**Guaranteed goes in both places.** `filters.delivery_type: "guaranteed"` is the hard exclusion, and `preferred_delivery_types: ["guaranteed"]` states the ranking preference. They are different fields with different semantics: the filter removes non-guaranteed products before the seller ranks anything, the preference array only orders results. Sending both is redundant here and I have done it deliberately, because when both are present `filters.delivery_type` takes precedence and the preference array becomes documentation of intent for a human reading the request later.

**Sole-category presence is a filter, not prose.** `filters.exclusivity: "category"`. The enum is `none`, `category`, `exclusive`. This is a hard commercial requirement, so it belongs where it excludes. Worth knowing: the string "exclusivity" appears nowhere in the 1,772 lines of the `get_products` reference page, so you will not find this field by reading the docs. It is in `core/product-filters.json`.

**The flight, budget, geography and currency are filters.** Dates the seller cannot serve are wasted response payload. `budget_range` requires a `currency` inside the object, and `min` or `max` must be present. I have sent a range rather than a point number so the seller can propose above and below the target.

**Measurement splits across two fields.** `required_metrics` is a capability filter: it returns products that commit to reporting those metrics, and the product's declared `available_metrics` becomes the binding reporting contract carried into the resulting media buy. `required_performance_standards` is a threshold filter: `{metric, threshold, vendor}`, with `standard` additionally required when the metric is `viewability` because MRC and GroupM define materially different thresholds. Note the direction rule: viewability and completion rate are floors, `ivt` is a ceiling.

**The news exclusion stays in prose, and that is a known weakness.** There is no content-exclusion filter in `product-filters.json`. The structured options are `required_policies` (registry policy IDs that must already exist) or `property_list` (a list you create through a governance agent before you call this), and neither is set up for this advertiser. So the hardest rule in the brief travels as a sentence and the seller's curation model decides what it means. If this campaign were real, setting up a property list before the first `get_products` call would be the highest-value thing to do.

**The brand-lift readout also stays in prose.** `brand_lift` is in the 36-value metric enum, so it could go in `required_metrics`. I left it out because requiring it would silently exclude every product that does not declare brand-lift reporting, which on CTV is most of them, and the readout is negotiable at package level. Filters delete; preferences persuade. This is a preference.

**Creative durations and languages stay in prose.** They constrain what the buyer can deliver, not what the seller can sell. Format constraints belong in `filters.format_ids` when the requirement is "your product must accept this format"; here it is "we happen to have these cuts", which is context for curation.

## The payload

```json
{
  "adcp_version": "3.1",
  "buying_mode": "brief",
  "brief": "Northwind Air is launching a new nonstop transatlantic route and needs a national CTV awareness burst around it. Reach adults 25-54 who travel internationally at least once a year, with a strong skew to people who research trips in the evening. Favour premium, full-episode streaming environments next to travel, food and documentary programming; keep us away from news and hard-news adjacency entirely. We want sole-category presence where the publisher can offer it, so no other airline or OTA runs in the same pod. The creative is a 30-second hero spot with a 15-second cutdown, both in English and French-Canadian. Success is measured on completed views and verified viewability, and we need a brand-lift readout at the end of the flight.",
  "brand": {
    "domain": "northwindair.example",
    "industries": ["travel"]
  },
  "account": {
    "account_id": "nw-air-2026"
  },
  "preferred_delivery_types": ["guaranteed"],
  "filters": {
    "delivery_type": "guaranteed",
    "channels": ["ctv"],
    "video_placement_types": ["instream"],
    "exclusivity": "category",
    "countries": ["US", "CA"],
    "start_date": "2026-09-14",
    "end_date": "2026-11-08",
    "budget_range": {
      "min": 900000,
      "max": 1200000,
      "currency": "USD"
    },
    "pricing_currencies": ["USD"],
    "is_fixed_price": true,
    "required_metrics": ["impressions", "completed_views", "completion_rate", "viewability"],
    "required_performance_standards": [
      {
        "metric": "viewability",
        "threshold": 0.7,
        "standard": "mrc",
        "vendor": { "domain": "doubleverify.com" }
      },
      {
        "metric": "ivt",
        "threshold": 0.01,
        "vendor": { "domain": "doubleverify.com" }
      }
    ],
    "min_exposures": 25000000
  },
  "time_budget": { "interval": 120, "unit": "seconds" }
}
```

## Does it validate?

Yes. Against `dist/schemas/3.1.10/media-buy/get-products-request.json` with a Draft-07 validator and a local registry built from every schema in the release that declares a `$id`:

```
VALID against /schemas/3.1.10/media-buy/get-products-request.json
```

Three details in that payload are the ones people get wrong.

`adcp_version` is `"3.1"`, not `"3.1.10"`. The envelope pattern is `^\d+\.\d+(-[a-zA-Z0-9.-]+)?$`, so the release number you looked up in `latest.json` does not match it. Patches are not negotiated; they surface as `build_version` on the capabilities response.

`is_fixed_price: true` does not mean "only fixed-price products". It means the seller returns products offering at least one fixed-price option, and must return only the `pricing_options` entries matching that pricing type, so the buyer can select deterministically from discovery. A product with both fixed and auction options matches either value of this filter.

`time_budget` is a `Duration` object, `{interval, unit}`, and both are required. Two minutes is generous, which is the point: curated `brief` mode may return a Submitted envelope instead of an answer when the seller needs an upstream query or a human review, and a short budget makes that more likely.

## What the payload does not say

Worth being explicit, because a filled-in example invites the reader to think it is complete.

It does not target anybody. Discovery in AdCP finds products; targeting attaches to packages at `create_media_buy` through `targeting_overlay`, which is where geo includes and excludes, dayparts, device type, language, frequency cap and signal targeting groups live. The 28 properties of `core/targeting.json` are all buy-time.

It does not cap frequency. Same reason. `packages[].targeting_overlay.frequency_cap`, buy time.

It does not commit anything. `get_products` returns products and proposals. Commitment is `create_media_buy`, which requires `idempotency_key`, `account`, `brand`, `start_time` and `end_time`, and which has no `brief` field at all.

It does not encode approval. AdCP has no buyer-side approval object. If Northwind's media director signs off before booking, that gate lives in the buyer agent, not in the protocol.

## What happens next in the conversation?

The seller answers with products, and probably with proposals. If the mix is wrong, the follow-up is not a new brief. It is a `refine` call:

```json
{
  "adcp_version": "3.1",
  "buying_mode": "refine",
  "refine": [
    { "scope": "request", "ask": "more full-episode inventory, less mid-tier FAST" },
    { "scope": "product", "product_id": "prd_fast_bundle_02", "action": "omit" }
  ]
}
```

`brief` must not be present in `refine` mode. The seller answers each entry through `refinement_applied`, matched by position.

One rule to know before you get there. Once any entry carries `action: "finalize"`, every entry in the array must be proposal-scoped and must also be `finalize`; mixing finalize with `include` or `omit` entries has to be rejected with `INVALID_REQUEST`. Finalize is a commit, not a refinement. Refine and commit are separate calls, in that order.

## Reusing this

Swap the brand domain, the flight, the budget range and the metric list, and the shape holds for any guaranteed video buy. The two decisions worth re-making each time are which constraints you are willing to have silently deleted, and which of your genuinely hard rules have no field to live in. On this campaign the answer to the second question was "the most important one", which is the honest state of AdCP 3.1.10 for brand-safety-led advertisers.

The reasoning behind each routing decision is on [brief vs filters](/spec/brief-vs-filters/). The row-by-row map from a normal agency brief is the [crosswalk](/crosswalk/creative-brief-to-adcp/).
