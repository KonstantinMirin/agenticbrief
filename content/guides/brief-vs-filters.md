---
title: 'Brief String or Filters: What Goes Where in AdCP get_products'
description: "Route each line of a campaign request to one of AdCP's 30 typed filters or to the brief string. Filters delete products silently. The brief only ranks them."
answer: 'In an AdCP get_products call, filters are hard constraints that silently delete every product missing them, and the brief string is intent a seller can only rank against and explain. Hard requirements go in filters, negotiable preferences in the brief.'
pubDate: 2026-08-09
keywords:
  - 'adcp brief vs filters'
  - 'what to put in an adcp brief'
  - 'adcp structured filters'
  - 'adcp buying_mode'
  - 'hard constraints campaign brief'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/supplements/buyer-briefs-and-get-products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/creative/task-reference/build_creative.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/creative/task-reference/list_creatives.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy-features.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/property-list-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/exclusivity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/'
related:
  - '/generate/'
  - '/spec/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/examples/ctv-guaranteed-launch/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - '/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adcpexplorer.com/schemas'
  - 'https://agenticadlab.com/'
faq:
  - question: 'What happens if a product does not match an AdCP filter?'
    answer: 'It is removed from the response with no error. AdCP calls this filter-not-fail. The only way to see what was removed is the optional `filter_diagnostics` block, which sellers are not required to send.'
  - question: 'How do I know a seller applied the filter I sent?'
    answer: 'You cannot. None of the 30 filters in `product-filters.json` can be declared in `get_adcp_capabilities` or confirmed in the response. The two applied-flags that exist, `property_list_applied` and `catalog_applied`, cover request-level parameters rather than filters.'
reviewState: cto-reviewed
---

Route every line of a campaign request to one of two places: the typed `filters` object, or the `brief` string. A preference encoded as a filter deletes inventory you would have taken. A hard constraint left in prose is one the seller is free to ignore.

A filter deletes products. The brief string cannot.

Ask of each requirement: should a product that misses this disappear, or show up and let you decide?

[The generator](/generate/) applies the split for you and labels each extracted value stated, derived, assumed or missing. Use the tables below to check a call you have already written.

`buying_mode` decides whether you get to ask the question at all. It is the one required property on the request, and it takes three values:

- `brief`. The brief string belongs here and nowhere else. The seller reads it, ranks against it, and may answer with proposals.
- `wholesale`. The description says the brief must not be provided. The seller returns no proposals and the answer is synchronous.
- `refine`. The description says the brief must not be provided here either, which neither brief document mentions.

## Rules to encode in your buyer agent

The specification does not settle the split, so encode these.

1. The typed field wins. Dates, budget, currency, countries, channels, formats, required metrics and exclusivity go in the typed field.
2. Restate a value in the brief only for a reason the value itself does not carry. "September 14 to November 8" belongs in `filters`. "The flight has to land before the route launches" belongs in the brief. In wholesale mode there is no brief, so the reason cannot travel.
3. Put a hard requirement in a filter and a preference in the brief. AdCP's own supplement states it: "If the buyer says 'ideally CTV, but display is okay,' keep that preference in the brief. If they say 'CTV only,' use `filters.channels`." Encode a soft preference as a filter and you never see the products you would have taken.
4. A requirement with no typed field goes in the brief and stays unauditable: brand safety adjacency, competitive separation, tone, creative rationale. In wholesale mode it cannot be sent at all.
5. Verify a filter by diffing. Send the request twice, once with your tightest filters and once without, and compare the product counts. A diff proves the filter was applied. A zero diff proves nothing, because the filter may have matched everything or the seller may have ignored it; to tell those apart, send a deliberately impossible value and confirm the set empties. It doubles your discovery calls, so run it on your first request against a new seller and on any filter whose absence would change the plan, once per seller rather than once per campaign.
6. Send each requirement once. The reference page's own "Budget and Date Filtering" example sends `brief: 'Q2 campaign for athletic footwear in North America'` alongside `start_date`, `end_date`, `budget_range`, `countries: ['US','CA']`, `channels` and `delivery_type`, so Q2, North America and the budget all travel twice. Filters run before ranking, so `['US','CA']` removes Mexico before the brief is read at all. The seller then ranks what is left against a brief describing a market it no longer has, and nothing in the response says which encoding shaped the set.

Wholesale mode narrows this to one rule. Every constraint is a typed filter or it does not exist, so every requirement with no typed home is unsendable on a wholesale request.

## Route the brief, line by line

`core/product-filters.json` at AdCP 3.1.13 has 30 properties. Twenty-seven of them are hard constraints on the product set. Three are not: `ext` carries vendor-namespaced keys, `required_geo_targeting` asks for a capability level rather than a target, and `required_axe_integrations` is deprecated. This is the whole list, with the brief line that belongs in each.

| The line in your brief                                 | Filter property                          | Shape                                                     |
| ------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------- |
| "Live 14 September"                                    | `filters.start_date`                     | ISO 8601 date                                             |
| "Off air 8 November"                                   | `filters.end_date`                       | ISO 8601 date                                             |
| "$500,000, and nothing under $50,000"                  | `filters.budget_range`                   | object; `currency` required, plus `min` or `max`          |
| "We transact in USD and CAD"                           | `filters.pricing_currencies`             | ISO 4217 array                                            |
| "Fixed rate card only"                                 | `filters.is_fixed_price`                 | boolean                                                   |
| "Guaranteed only"                                      | `filters.delivery_type`                  | `guaranteed` or `non_guaranteed`                          |
| "Category lock, or sole sponsorship"                   | `filters.exclusivity`                    | `none`, `category`, `exclusive`                           |
| "US and Canada"                                        | `filters.countries`                      | ISO 3166-1 alpha-2                                        |
| "New York State and Scotland"                          | `filters.regions`                        | ISO 3166-2                                                |
| "DMA 501 and 803"                                      | `filters.metros`                         | metro codes, for locally bound inventory                  |
| "These 40 postcodes"                                   | `filters.postal_areas`                   | country plus postal system                                |
| "Near these store locations, by drive time"            | `filters.geo_proximity`                  | travel time or radius per entry                           |
| "The seller has to be able to target metros at all"    | `filters.required_geo_targeting`         | capability level, not a target                            |
| "CTV and online video only"                            | `filters.channels`                       | 20-value enum                                             |
| "These format IDs"                                     | `filters.format_ids`                     | format-id array                                           |
| "IAB standard formats only"                            | `filters.standard_formats_only`          | boolean                                                   |
| "In-stream, not accompanying content"                  | `filters.video_placement_types`          | OpenRTB 2.6 `video.plcmt` names                           |
| "Broadcast and podcast audio"                          | `filters.audio_distribution_types`       | OpenRTB 2.6 `audio.feed` names                            |
| "Sponsored search and sponsored display"               | `filters.sponsored_placement_types`      | retail media enum                                         |
| "Feed and stories, not search"                         | `filters.social_placement_surfaces`      | social enum                                               |
| "Bid on these search terms"                            | `filters.keywords`                       | keyword array                                             |
| "These audience signals, and suppress that one"        | `filters.signal_targeting`               | signal refs; suppression uses `targeting_mode: "exclude"` |
| "Must report completed views and viewable impressions" | `filters.required_metrics`               | 36-value metric enum                                      |
| "70% viewability to MRC, IVT under 2%, DV counts"      | `filters.required_performance_standards` | metric, threshold, vendor                                 |
| "DoubleVerify's own attention metric"                  | `filters.required_vendor_metrics`        | vendor plus metric id                                     |
| "At least 2m impressions for the measurement to hold"  | `filters.min_exposures`                  | integer                                                   |
| "Seller must support inline creative management"       | `filters.required_features`              | four capability booleans                                  |
| "Clean-room match on hashed email"                     | `filters.trusted_match`                  | Trusted Match Protocol object                             |
| "Executable through this agentic exchange"             | `filters.required_axe_integrations`      | deprecated; use `trusted_match`                           |
| "This seller's own private criterion"                  | `filters.ext`                            | vendor-namespaced keys                                    |

Four more constraints sit on the request rather than inside `filters`, and behave the same way:

| The line in your brief                            | Where it goes                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| "Only these approved properties"                  | `property_list`, a reference another agent holds                       |
| "Only sellers enforcing these registry policies"  | `required_policies`                                                    |
| "The advertiser is Acme, at acme.com"             | `brand.domain`, `brand.industries`                                     |
| "Guaranteed if you have it, but show me the rest" | `preferred_delivery_types`, which steers curation instead of excluding |

## What a filter does that the brief string cannot

`required_metrics` tells sellers to "silently exclude products that cannot meet this list (filter-not-fail; do not return an error)", and the other `required_*` filters carry the same clause. Send a filter and the products that miss it are gone before the response is built.

The brief string buys you ranking and one sentence back. A seller that reads it can order the results and return `brief_relevance` per product, defined as "Why this product matches the brief (when brief provided)". `brief_relevance` is the only field in which a seller explains a match.

The response MAY carry one optional window into what was cut, `filter_diagnostics`:

- `excluded_by`, an object keyed by the filter property name as you sent it, each value carrying a `count` plus optional filter-specific detail.
- `total_candidates`, the products the seller considered before applying `filters`.
- `semantics`, one of `only`, `any` or `approximate`. Read it before doing arithmetic on the counts: `only` attributes each exclusion to a single filter, `any` counts a product against every filter that excluded it, `approximate` means the seller could not attribute cleanly.

`excluded_by` and `total_candidates` are independently optional, and only filters that "meaningfully narrowed the set need appear", so a filter missing from the block either matched everything or never ran. `get_products.mdx` is careful about its purpose: "This is observability — not error reporting; sellers still silently exclude unmatched products per the filter-not-fail convention."

No filter can be declared in advance or confirmed afterwards. `get_adcp_capabilities` declares four optional media-buy features — `inline_creative_management`, `property_list_filtering`, `catalog_management` and `committed_metrics_supported` — and the only one that narrows a product set covers `property_list`, a request-level parameter. `product-filters.json` is `additionalProperties: true`, so a filter name a seller has never heard of is accepted rather than refused.

Assume a seller over-returns on any filter it has not implemented, and verify it with the diff in rule 5. The creative protocol is the only place AdCP settles the question, in `list_creatives.mdx`: "Agents that do not implement `asset_types` MUST ignore that field and apply all other active filters." Those agents "deliberately over-return". Nothing on the media-buy side says what a seller must do with a filter it has not implemented, so post-filter the response yourself and treat that filter as advisory for that seller.

## Requirements with no typed home

These go in the brief string because no field holds them. Nothing in the response records how the seller handled them.

| The line in your brief                                            | Nearest structured home                                                                                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| "Adults 25-54"                                                    | none. `targeting.age_restriction` is legal compliance for alcohol and gambling, not planning                                      |
| "Awareness campaign"                                              | none at discovery. `packages[].optimization_goals` exists at buy time, in a different vocabulary                                  |
| "60% CTV, 25% OLV, 15% display"                                   | no request field. The seller answers with `proposals[].allocations`, which must sum to 100                                        |
| "$50,000, with flexibility to add 20% for high performers"        | `budget_range` holds the number, nothing holds the contingency                                                                    |
| "2% CTR and $50 CPA"                                              | none. `required_metrics` asks who can report a metric; no discovery field carries a target value                                  |
| "Avoid news, political content and competitive automotive brands" | none. `required_policies` takes registry policy IDs that must already exist; `property_list` points at a list another agent holds |
| "Keep our ads three pages away from a competitor's"               | none                                                                                                                              |
| "Cap at three per week"                                           | `packages[].targeting_overlay.frequency_cap`, at buy time only                                                                    |
| "Front-load the first fortnight"                                  | `packages[].pacing`: `even`, `asap`, `front_loaded`                                                                               |
| "Q4 Holiday Push, for Butler/Till"                                | none. `get_products` has no campaign name and no agency field                                                                     |
| "The flight has to land before the route launches"                | the brief string, and it belongs there: no seller infers urgency from two dates                                                   |

## Where AdCP's two brief documents disagree

AdCP has two brief documents. They send five of these seven requirements to opposite places; brand safety has no typed field at all, and audience description is the one row they agree on.

| Requirement          | `brief-expectations.mdx` says                         | `buyer-briefs-and-get-products.mdx` says                            | Typed field in AdCP 3.1.13                                                |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Flight dates         | Put it in the brief ("Core Brief Components")         | Not a brief item; constraints go in typed fields                    | `filters.start_date`, `filters.end_date`                                  |
| Budget               | Put it in the brief ("Optional Brief Components")     | Explicit "good filter candidate"                                    | `filters.budget_range` (with required `currency`)                         |
| Geography            | Put it in the brief, down to metro level              | Filter candidate ("required geo targeting support")                 | `filters.countries`, `regions`, `metros`, `postal_areas`, `geo_proximity` |
| Creative formats     | Put it in the brief ("we have 30s and 15s")           | Filter candidate ("required channels or formats")                   | `filters.format_ids`, `filters.standard_formats_only`, `filters.channels` |
| Success metrics      | Put it in the brief ("2% CTR and $50 CPA")            | Filter candidate ("required measurement or reporting capabilities") | `filters.required_metrics`, `filters.required_performance_standards`      |
| Brand safety         | Put it in the brief ("avoid news, political content") | Not addressed                                                       | No filter. Brief string, or `required_policies`, or `property_list`       |
| Audience description | Put it in the brief, in demographic detail            | Put it in the brief, "in human terms"                               | Both agree. `filters.signal_targeting` exists but is a different thing.   |

The two documents address different readers. `buyer-briefs-and-get-products.mdx` is written for the buyer composing a request, and it is the one to follow: "The goal is not to make the brief verbose. The goal is to put intent in the brief and hard constraints in typed fields so the seller can curate inventory without guessing which parts are negotiable." `brief-expectations.mdx` is written for the publisher parsing a request, and tells that reader to pull "temporal expressions", "budget indicators" and "geographic references" out of the brief text, with worked examples putting flight dates, budget, metro-level geography and creative constraints in prose. Follow that one as a buyer and `$25K` and `March 1-31` go to somebody else's parser.

Take one of its own examples through both encodings. _"$50,000 total budget with flexibility to increase by 20% for high-performing inventory"_ becomes `budget_range: {"currency":"USD","min":50000,"max":60000}`, and the prose never named a currency, which `budget_range` requires, so a seller parsing it picks one for you. The contingency is the part the typed form cannot hold, and it stays in the brief.

Both documents are also behind the schema in two places. `brief-expectations.mdx` opens its Required Components section with "Every `get_products` and `create_media_buy` request MUST include:" and then lists Brand and the Brief Field, while `create-media-buy-request.json` has no `brief` property among its 20. And both warn you off sending a brief in wholesale mode and stop there, while the schema also forbids it in `refine`.

[The crosswalk](/crosswalk/creative-brief-to-adcp/) walks a whole creative brief through this fork, field by field.

## The schema will not catch a misrouted brief

The `brief` property in `get-products-request.json` is described as "Required when buying_mode is 'brief'. Must not be provided when buying_mode is 'wholesale' or 'refine'." No `if/then` binds it. No `not`, no `oneOf`, no `dependencies` entry. The file's three Draft-07 conditionals are all spent on cache-version plumbing: a top-level `if/then` requiring `buying_mode` to be `"wholesale"` whenever `if_wholesale_feed_version` or `if_pricing_version` is present, and a `dependencies` block making `brand` mandatory when `catalog` appears and `if_wholesale_feed_version` mandatory when `if_pricing_version` appears.

Against the released 3.1.13 schemas:

| Payload                                                             | Validator result                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `{"buying_mode":"wholesale","brief":"reach runners"}`               | **valid** — the docs call this an error                                             |
| `{"buying_mode":"refine","brief":"reach runners"}`                  | **valid** — the description says must not be provided                               |
| `{"buying_mode":"brief"}` with no `brief`                           | **valid** — the docs say brief is required here                                     |
| `{"buying_mode":"brief","breif":"x","fliters":{"contries":["US"]}}` | **valid** — `additionalProperties: true`                                            |
| no `adcp_version` at all                                            | **valid**                                                                           |
| `catalog` present, no `brand`                                       | **invalid** — "'brand' is a dependency of 'catalog'"                                |
| `if_pricing_version` without `if_wholesale_feed_version`            | **invalid** — "'if_wholesale_feed_version' is a dependency of 'if_pricing_version'" |
| `if_wholesale_feed_version` in brief mode                           | **invalid** — "'wholesale' was expected"                                            |
| `filters.budget_range = {"min":1000}`                               | **invalid** — "'currency' is a required property"                                   |
| `filters.budget_range = {"currency":"USD"}`                         | **invalid** — fails the min-or-max `anyOf`                                          |

Nothing in the file binds `brief` to `buying_mode`. The rule the brief docs repeat in four places is the one rule the schema does not carry.

Both request schemas set `additionalProperties: true`, so a misspelled `fliters` block is ignored and you get back a full, unfiltered result set with nothing saying you asked for something else. Validate your own requests in a test against a local copy of `get-products-request.json` and `product-filters.json` with `additionalProperties` forced to `false`, because nothing downstream will.

`create-media-buy-request.json` has the same permissiveness. It has no `brief` property among its 20 and sets `additionalProperties: true`, so a brief attached to the buy is accepted, dropped, and never mentioned again.

Elsewhere AdCP settles conflicts like this in the prose. When `budget_range.currency` and `pricing_currencies` conflict, `get_products.mdx` says sellers "SHOULD return zero matching products rather than reject the request solely because of the conflict", and the creative protocol resolves the prose-versus-structured question outright in `build_creative.mdx`: "When both provide conflicting direction, `message` takes precedence as the most specific instruction." The media-buy side has no equivalent sentence.

## The doc table and the released filter list disagree

The Filters Object table in `get_products.mdx` has 27 rows against the 30 properties in the release. Three filters in the doc table exist in no release. Six released filters are missing from it.

| Filter                           | In the 27-row doc table | In released 3.1.13 |
| -------------------------------- | ----------------------- | ------------------ |
| `format_kinds`                   | yes                     | no                 |
| `format_option_refs`             | yes                     | no                 |
| `audience_evidence_requirements` | yes                     | no                 |
| `exclusivity`                    | no                      | yes                |
| `trusted_match`                  | no                      | yes                |
| `required_features`              | no                      | yes                |
| `required_axe_integrations`      | no                      | yes                |
| `required_geo_targeting`         | no                      | yes                |
| `ext`                            | no                      | yes                |

Two of the six missing filters are worth checking by hand.

`exclusivity` resolves to `enums/exclusivity.json`, three values: `none`, `category` ("only one advertiser per industry category") and `exclusive` ("Sole sponsorship"). Category exclusivity is a routine ask on a guaranteed buy. A buyer working from the reference page writes it into the brief as prose, where a seller may ignore it, while a working hard filter sits in the release.

`required_features` `$ref`s the same `media-buy-features.json` that `get_adcp_capabilities` declares, and that file promises "If a seller declares a feature as true, they MUST honor requests using that feature". It is the one place a filter turns a declared capability into an enforceable requirement, and the reference page never names it.

`format_ids` has the mismatch in the other direction. The doc table labels it "Deprecated 3.x named-format compatibility filter". In released 3.1.13 it carries no `deprecated` flag and its description is four words: "Filter by specific format IDs". AdCP's documentation marks it "Deprecated in AdCP 3.2; removed in AdCP 4.0."

## Where to go next

- [The CTV guaranteed launch example](/examples/ctv-guaranteed-launch/) runs the whole rule set over a real payload, exclusivity filter and all.
- [The brief format comparison](/compare/adcp-brief-vs-aamp-campaign-brief/) covers AAMP, whose `CampaignBrief` is a typed object with no prose field at all, so a requirement with no typed home has nowhere to go.
- [The `get_products` operation reference](https://adcpexplorer.com/operations/get-products/) lists the request and response fields on their own.
