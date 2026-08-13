---
title: 'A Guaranteed CTV Launch Brief, Filled In'
description: 'A guaranteed CTV brand launch written out as an AdCP get_products payload: 13 filters, validated against the published 3.1.13 schema, plus the eight mistakes that validate anyway.'
answer: 'A guaranteed CTV launch brief in AdCP is one get_products request in brief mode: 13 typed filter keys covering delivery type, channel, flight, budget, currency, metrics and performance thresholds, plus the campaign described in prose in the brief string.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
channel: 'ctv'
cluster: 'bg-examples'
keywords:
  - 'adcp request payload examples'
  - 'ctv campaign brief example'
  - 'guaranteed ctv brief'
  - 'get_products example'
  - 'adcp filters object example'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/performance-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/committed-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/delivery-metric-aggregate.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/account-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/available-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/exclusivity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/performance-standard-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/viewability-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/task-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/duration.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-async-response-submitted.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/example-briefs.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/advanced-topics/accountability.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/measurement/taxonomy.mdx'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://agenticadlab.com/'
reviewState: cto-reviewed
---

A guaranteed CTV launch, written out as an AdCP `get_products` request: thirteen populated filter keys and a prose brief, valid against the published 3.1.13 schema. Copy the payload, swap the brand, the flight, the budget range and the metric list, and the shape holds for any guaranteed video buy.

## The scenario

Match these rows against your own campaign.

| Input           | This campaign                                                                            |
| --------------- | ---------------------------------------------------------------------------------------- |
| Advertiser      | Northwind Air, opening a nonstop transatlantic route out of the US east coast            |
| Markets         | US and Canada, budget booked in US dollars                                               |
| Flight          | Mid-September to the week before the mid-November first flight, ahead of booking windows |
| Budget          | Around a million dollars                                                                 |
| Audience        | Adults 25 to 54 who travel internationally at least once a year                          |
| Deal type       | Guaranteed                                                                               |
| Creative        | 30-second hero spot and a 15-second cutdown, English and French-Canadian                 |
| Success metrics | Completed views and verified viewability, plus a brand-lift readout at end of flight     |

Two lines are standing rules for this advertiser rather than preferences: no news and no hard-news adjacency at all, and no competing airline or online travel agency in the same pod.

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

Northwind Air doesn't exist and `northwindair.example` is a reserved name. The field names, the enum values and the shape rules are all from the published 3.1.13 schemas, and the payload validates against `media-buy/get-products-request.json` in that release. [The generator](/generate/) will emit the skeleton if you'd rather start from your own prose than from someone else's JSON.

The measurement block follows `docs/media-buy/advanced-topics/accountability.mdx`, which sends `delivery_type: "guaranteed"` with viewability at 0.70 MRC DoubleVerify and an ivt ceiling of 0.05. The block above is that snippet with a tighter ivt ceiling.

This payload is `brief` mode throughout, where you describe the campaign and the publisher recommends products against it. `brief` is required in that mode and forbidden in `wholesale` and `refine` — [the spec page](/spec/) has the full mode table, and the rule that `adcp_version` goes on the wire as `"3.1"` rather than `"3.1.13"`.

One key in that payload does not mean what it looks like. `is_fixed_price: true` does not mean "only fixed-price products". It returns products offering at least one fixed-price option, and a product carrying both fixed and auction options matches either value of the filter. What you get for sending it is on the response side: sellers "MUST return only the pricing_options entries matching the requested pricing type so buyers can deterministically select from the returned options".

## What each filter is doing

| Filter                           | Value here                                                 | Why it is in this payload                                                               |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `delivery_type`                  | `"guaranteed"`                                             | Excludes every non-guaranteed product outright.                                         |
| `channels`                       | `["ctv"]`                                                  | CTV only.                                                                               |
| `video_placement_types`          | `["instream"]`                                             | Instream video, not outstream units.                                                    |
| `exclusivity`                    | `"category"`                                               | The pod requirement: "only one advertiser per industry category".                       |
| `countries`                      | `["US", "CA"]`                                             | The two markets the route sells into.                                                   |
| `start_date`, `end_date`         | `2026-09-14`, `2026-11-08`                                 | The flight. A product the seller can't serve in those weeks is wasted response payload. |
| `budget_range`                   | 900000-1200000 USD                                         | The order of magnitude, so the seller doesn't return price points nobody can transact.  |
| `pricing_currencies`             | `["USD"]`                                                  | The buy is transacted in dollars in both markets.                                       |
| `is_fixed_price`                 | `true`                                                     | Guaranteed at a fixed rate, not an auction floor.                                       |
| `required_metrics`               | impressions, completed views, completion rate, viewability | Capability filter, and the binding reporting contract on the resulting media buy.       |
| `required_performance_standards` | viewability 0.70 MRC DoubleVerify, ivt 0.01                | Threshold filter. The floors and ceilings the invoice turns on.                         |
| `min_exposures`                  | `25000000`                                                 | Measurement-validity floor for the brand-lift study.                                    |

The [crosswalk](/crosswalk/creative-brief-to-adcp/) walks a full agency brief row by row.

Reach for `exclusivity: "category"` by name, because you won't find it by reading the docs. The enum in `enums/exclusivity.json` is `none`, `category`, `exclusive`. The [`get_products` reference page](https://adcpexplorer.com/operations/get-products/) upstream never mentions `exclusivity`; the field is discoverable only by reading the properties of `core/product-filters.json` directly.

Measurement splits across two filters that do different jobs, which is why `viewability` appears in both. `required_metrics` is the capability filter: sellers "MUST silently exclude products that cannot meet this list (filter-not-fail; do not return an error)", and "the product's declared `available_metrics` becomes the binding reporting contract carried into the resulting media buy". `required_performance_standards` is the threshold filter, `{metric, threshold, vendor}` with `standard` for viewability, and direction matters: "viewability, completion_rate, brand_safety, and attention_score are floors (must exceed); ivt is a ceiling (must not exceed)." Send a metric in the first to have it reported at all, and in the second to set the floor.

Keep `brand_lift` out of `required_metrics`, and keep it in the prose. It is a reportable metric, listed in `available-metric.json`, so it would validate there; it is not in `performance-standard-metric.json`, so it could never carry a threshold anyway. Requiring it would silently delete every CTV product that doesn't declare brand-lift reporting, which is most of them, to secure a readout that's negotiable at package level. The [crosswalk](/crosswalk/creative-brief-to-adcp/) routes it the same way.

`min_exposures: 25000000` is what carries the brand-lift ask instead. Its description is the only one in `product-filters.json` about measurement rather than money: "Minimum exposures/impressions needed for measurement validity." Twenty-five million is what this budget buys at a $40 CTV CPM. Nothing in the schema says whether that floor is read per product or across the whole response, and the difference decides what comes back: read per product, a whole-campaign number matches only products that could carry the flight on their own. Size it to what one product plausibly delivers if you want a wider set returned.

`filters.delivery_type` excludes, `preferred_delivery_types` ranks: "Unlike `filters.delivery_type` which excludes non-matching products, this signals preference for curation — the publisher may still include other delivery types when they match the brief well." Sending guaranteed twice is safe here only because both name the same value: the filter decides, and the preference array documents intent for whoever reads the request later. No precedence rule is published anywhere, and a request that filters for `guaranteed` while preferring `non_guaranteed` validates cleanly.

## Content exclusions have no filter

`product-filters.json` has no content-exclusion filter. No blocklist, no category exclusion, nothing that expresses "no news". The two structured surfaces that come close sit at the top level of the request, outside `filters`: `required_policies`, an array of registry policy IDs that must already exist, and `property_list`, a `PropertyListRef` of `{agent_url, list_id, auth_token?}` pointing at a list you build first through the property domain (`create_property_list` and its four siblings are labelled "Property domain" in the task-type enum). Neither is set up for this advertiser, and the upstream `get_products` reference page never mentions `required_policies` either. Either budget engineering time for the "no news" line months before the campaign, or accept that a curation model decides what it means.

Stand the property list up before the first `get_products` call, and treat it as a build rather than a checkbox. `PropertyListRef` points at an `agent_url`, so somebody has to host an agent answering `create_property_list`, `update_property_list`, `get_property_list`, `list_property_lists` and `delete_property_list`, and keep the list current as publishers change. That is buyer-side engineering, or a vendor you contract to hold it.

The payload targets nobody. Every property of `core/targeting.json` is buy-time, attached to packages at `create_media_buy` through `targeting_overlay`: dayparts, device type, language, frequency cap, geo includes and excludes at four levels, signal targeting groups. None of them belong in a discovery request, and nothing here commits. The commitment is [`create_media_buy`](https://adcpexplorer.com/operations/create-media-buy/), which requires `idempotency_key`, `account`, `brand`, `start_time` and `end_time`, and which has no `brief` property at all.

Nothing records an internal approval. `create_media_buy` carries `io_acceptance` with `{io_id, accepted_at, signatory}`, and `signatory` is "Who accepted the IO — agent identifier or human name", so a human sign-off is representable, but what it records is acceptance of the seller's insertion order, and only "when the proposal's insertion_order has requires_signature: true". A media director signing off the plan before anyone books it has no field anywhere in the protocol. Enforce that gate in your own system before you issue `create_media_buy`.

## What validates but should not

Don't ship on a green validator. Every mutation below is a change to the payload above that the released schema accepts.

| Mutation                                                                          | Validator | What it costs on this campaign                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"filters"` misspelled `"filter"`                                                 | valid     | All 13 constraints vanish at once. Guaranteed-only, category exclusivity, the flight, the budget floor, the viewability standard, gone. The seller returns non-guaranteed FAST inventory and the response looks legitimate. |
| Viewability standard omitted                                                      | valid     | 0.70 viewable now means MRC or GroupM, seller's choice, on the term the invoice turns on.                                                                                                                                   |
| `delivery_type: "guaranteed"` plus `preferred_delivery_types: ["non_guaranteed"]` | valid     | No diagnostic, and no published precedence rule to say which one the seller honours.                                                                                                                                        |
| `start_date` after `end_date`                                                     | valid     | An impossible flight. Draft-07 can't compare two sibling values, so this one is on the schema language.                                                                                                                     |
| Misspelled key inside `filters` (`exclusivty`)                                    | valid     | That one constraint is dropped silently. `product-filters.json` is also `additionalProperties: true`.                                                                                                                       |
| `adcp_version` omitted                                                            | valid     | Falls back to the deprecated `adcp_major_version` or a server default.                                                                                                                                                      |
| `brief` sent in `wholesale` mode                                                  | valid     | Forbidden in the field descriptions and enforced by nothing. [The spec page](/spec/) covers the rule.                                                                                                                       |
| `brief` sent in `refine` mode                                                     | valid     | Same rule, same silence.                                                                                                                                                                                                    |

### What the released schema does catch

`threshold: 70` instead of `0.70` fails on "must be <= 1"; the field is a rate, not a percentage. `exclusivity: "sole"`, `channels: ["CTV"]` in caps, `countries: ["us"]` in lowercase and `video_placement_types: ["pre-roll"]` all fail their enums or patterns. `min_exposures: -5` fails its `minimum: 1`. `AccountRef` is a `oneOf` with `additionalProperties: false` on both branches, so an `account` carrying `account_id` alongside `brand` and `operator` is rejected.

`budget_range` has structure of its own, and it is one of the few conditionals AdCP encodes inside `filters` at all: `currency` is required, and an `anyOf` demands at least one of `min` and `max`, so `{"currency": "USD"}` alone is rejected.

`time_budget` is a `Duration`, not a number of seconds. `{interval, unit}`, both required, `additionalProperties: false`, and `unit` from `seconds`, `minutes`, `hours`, `days`, `campaign`. It fails twice, once for a missing `unit` and once for a bare `120`. The interval is a trade: 120 seconds leaves curation room, and a shorter one makes the async Submitted envelope likelier.

Run the whole set yourself. [validate.mjs](/validate.mjs) takes a clone of the AdCP repository and prints every mutation with its result:

```bash
ADCP_SCHEMAS=<adcp-repo>/dist/schemas/3.1.13 node validate.mjs
```

Read the viewability row against the measurement docs. `docs/measurement/taxonomy.mdx` says viewability is the canonical Tier 1 metric and that MRC and GroupM "define materially different thresholds and require schema-enforced disambiguation via `qualifier.viewability_standard`". At 3.1.13, nothing enforces it. `core/performance-standard.json` requires `metric`, `threshold` and `vendor`; `standard` sits outside that list with a description that says "Required when metric is 'viewability'" and no `if`/`then` to make it so. `core/committed-metric.json` leaves `qualifier` out of both of its `required` arrays. Send the `standard` yourself on every viewability threshold.

## Tighten the schema locally

Use your own copy of it, tightened. Wrap the released request schema in an `allOf` that closes `additionalProperties` at the top level and inside `filters`, and add the `if`/`then` that `performance-standard.json` doesn't carry. Run every outbound request through that before it goes on the wire. Three of the eight misses fail immediately: the `"filter"` typo, the `exclusivty` typo, and the omitted viewability `standard`. Because the overlay only ever adds constraints, anything that clears it still validates against the published schema, so you're not inventing a private dialect.

Two misses need imperative code. Assert `start_date <= end_date`, and assert `filters.delivery_type` is in `preferred_delivery_types` when you send both. Three lines each, and they cover the contradictions Draft-07 structurally can't see.

Downstream, the response won't do it for you. `get-products-response.json` carries no echo of the filters you sent. The nearest thing is `filter_diagnostics`, and it's deliberately weak evidence: sellers "MAY populate this when meaningful narrowing occurred; buyers MAY use it for triage UX without depending on its presence", it is "Counts only — products are not enumerated by name", and its `semantics` enum is `only`, `any` or `approximate`, so the same integer means three different things depending on a sibling field ("Buyers SHOULD inspect `semantics` before doing arithmetic on counts"). `property_list_applied` and `catalog_applied` are booleans covering those two surfaces and nothing else.

Re-check each returned product against your own constraint list before you commit. `core/product.json` requires `delivery_type`, and carries `exclusivity`, `performance_standards` and `enforced_policies`, the same vocabulary the filters use. Read the defaults carefully: `exclusivity` "Defaults to 'none' when absent", and for `performance_standards`, "When absent, no structured performance standards apply", so an absent field is not a guarantee.

## Refine, then commit, in separate calls

The seller answers with products, and probably with proposals. If the mix is wrong, follow up with a `refine` call:

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

The seller answers each entry through `refinement_applied`, "matched by position", so the order you send them in decides which answer maps to which ask.

Once any entry carries `action: "finalize"`, "ALL entries in the array MUST be proposal-scoped with `action: 'finalize'` — mixing finalize entries with `include`/`omit` entries or with request- / product-scoped entries MUST be rejected by the seller with `INVALID_REQUEST`. Finalize is a commit, not a refinement."

Plan for the Submitted envelope, because it is a second code path. In `brief` and `refine` modes the seller MAY answer with one instead of products, when curation needs an upstream query or human review it can't finish inside `time_budget`. The envelope carries `status: "submitted"` and a `task_id`, and the products land on the completion artifact rather than on the envelope, so the buyer either polls `get_task_status` with that handle or registers a `push_notification_config` up front and takes the terminal callback. `wholesale` never uses this arm; it signals shortfall through `incomplete[]` instead.

Next: [brief vs filters](/spec/brief-vs-filters/) argues each line of a brief onto one side of the request.
