---
title: 'What Goes in the Brief String and What Goes in Filters'
description: "AdCP's get_products takes a natural-language brief and a typed filters object. Two AdCP documents give opposite guidance on where budget, dates and geography belong."
answer: "What goes in the AdCP get_products brief string is intent a seller must interpret; what goes in filters is constraint a seller enforces by exclusion. AdCP's own brief-expectations and buyer-briefs pages disagree about budget, flight dates and geography."
pubDate: 2026-08-09
cluster: 'bg-placement'
keywords:
  - 'adcp brief vs filters'
  - 'what to put in an adcp brief'
  - 'adcp structured filters'
  - 'hard constraints campaign brief'
  - 'adcp buying_mode'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/learning/supplements/buyer-briefs-and-get-products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://docs.adcontextprotocol.org/'
related:
  - '/spec/'
  - '/'
  - '/examples/ctv-guaranteed-launch/'
  - '/crosswalk/creative-brief-to-adcp/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://adcpexplorer.noetis.dev/schemas/'
reviewState: cto-reviewed
---

## What is the difference between the AdCP brief string and the filters object?

The `brief` string on `get_products` is prose for a seller to interpret. The `filters` object is a set of typed conditions that remove products from the result. That distinction is clean in principle, and the AdCP schema states it clearly in one sentence in `product-filters.json`: filters are "structured filters for product discovery".

The practical difference is what happens when a product doesn't match. A filter deletes it, silently. The reference page calls this "filter-not-fail" and adds an optional `filter_diagnostics` block to the response so buyers can tell "nothing exists" from "you excluded everything". The brief string can't delete anything. All it can do is make a seller rank one product above another and explain itself in `brief_relevance`.

So the useful test is not "is this important?" It is: **if a product misses this, do I want it gone, or do I want to see it and decide?**

## Where do AdCP's own documents disagree?

They disagree about budget, flight dates, geography and creative formats: four of the things every campaign brief contains.

`docs/learning/supplements/buyer-briefs-and-get-products.mdx` states the split in its second paragraph:

> "The goal is not to make the brief verbose. The goal is to put intent in the brief and hard constraints in typed fields so the seller can curate inventory without guessing which parts are negotiable."

Its mental-model table then lists, in the `brief` row, under "Avoid putting here": "Machine-enforceable constraints that already have typed fields." Its "good filter candidates" list includes "budget ranges", "pricing currency constraints", "required geo targeting support", and "required channels or formats".

`docs/media-buy/product-discovery/brief-expectations.mdx` says the opposite, in more detail and at greater length. Under "Core Brief Components", which it introduces as "these essential elements", it lists Business Objectives, Success Metrics, and **Flight Dates**, with the worked line: _"Run from March 1-31, focusing on weekday morning commutes"_. Under "Optional Brief Components" it lists **Budget Information** (_"$50,000 total budget with flexibility to increase by 20% for high-performing inventory"_), **Geographic Markets** (_"Focus on California and New York, specifically Los Angeles and New York City metros"_), and **Creative Constraints** (_"We have 30-second and 15-second video creatives in English and Spanish"_).

Every one of those has a typed field in the released schema.

| Requirement          | `brief-expectations.mdx` says                         | `buyer-briefs-and-get-products.mdx` says                            | Typed field in AdCP 3.1.10                                                |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Flight dates         | Put it in the brief ("Core Brief Components")         | Not a brief item; constraints go in typed fields                    | `filters.start_date`, `filters.end_date`                                  |
| Budget               | Put it in the brief ("Optional Brief Components")     | Explicit "good filter candidate"                                    | `filters.budget_range` (with required `currency`)                         |
| Geography            | Put it in the brief, down to metro level              | Filter candidate ("required geo targeting support")                 | `filters.countries`, `regions`, `metros`, `postal_areas`, `geo_proximity` |
| Creative formats     | Put it in the brief ("we have 30s and 15s")           | Filter candidate ("required channels or formats")                   | `filters.format_ids`, `filters.standard_formats_only`, `filters.channels` |
| Success metrics      | Put it in the brief ("2% CTR and $50 CPA")            | Filter candidate ("required measurement or reporting capabilities") | `filters.required_metrics`, `filters.required_performance_standards`      |
| Brand safety         | Put it in the brief ("avoid news, political content") | Not addressed                                                       | No filter. Brief string, or `required_policies`, or `property_list`       |
| Audience description | Put it in the brief, in demographic detail            | Put it in the brief, "in human terms"                               | Both agree. `filters.signal_targeting` exists but is a different thing.   |

The last two rows are the interesting ones. Brand safety and audience description are the only requirements the two documents agree on, and they agree because the typed surface genuinely has no slot for them.

## Which document is right?

Neither is wrong on its own terms, and that is the problem. They are written for different readers.

`brief-expectations.mdx` is addressed to publishers implementing a curation engine. Its section "Natural Language Processing" tells publishers to extract "temporal expressions", "budget indicators" and "geographic references" from the brief text. From that seat, a brief that contains budget and dates is a richer input, and a publisher that cannot parse them has a worse product. Its comprehensive-brief example bakes all of it into one string:

> "Acme Corp project management software - cloud-based solution for remote teams with AI-powered automation. Drive 500 free trial signups from IT decision makers and project managers at tech companies (50-500 employees) in SF Bay Area and NYC. $25K budget for March 1-31, measured by $50 CPA. We have video and display creatives. Avoid competitor content and news sites."

`buyer-briefs-and-get-products.mdx` is addressed to buyer-agent implementers. From that seat, putting `$25K` and `March 1-31` in prose means the seller's parser decides your flight dates and your budget, and you have no recourse when it decides wrong.

The spec's own reference page splits the difference by doing both at once. The "Budget and Date Filtering" example in `get_products.mdx` sends `brief: 'Q2 campaign for athletic footwear in North America'` alongside `filters.start_date`, `filters.end_date`, `filters.countries: ['US', 'CA']` and a `budget_range`. Q2, North America and the budget appear on both sides of the request, in two different encodings, with no stated rule for which wins if they conflict.

I haven't found that rule anywhere in the 3.1.10 documentation. `preferred_delivery_types` is the only field for which a precedence rule is written down: `brief-expectations.mdx` states that "when both are present, `filters.delivery_type` takes precedence (it removes non-matching products before preference is applied)". No equivalent sentence exists for the brief string against any filter.

## What rule should a buyer agent actually use?

This is the rule I would encode, and it is opinionated because the specification does not settle it.

1. **Anything with a typed field goes in the typed field, always.** Dates, budget, currency, countries, channels, formats, required metrics, viewability thresholds. If the constraint is real, make it enforceable.
2. **Restate the constraint in the brief only when the reason is not derivable from the value.** "September 14 to November 8" belongs in `filters`. "The flight has to land before the route launches" belongs in the brief, because the seller cannot infer urgency from two dates.
3. **Put the negotiable version of a constraint in the brief and leave it out of filters.** The supplement gives the cleanest example: _"If the buyer says 'ideally CTV, but display is okay,' keep that preference in the brief. If they say 'CTV only,' use `filters.channels`."_
4. **Never encode a soft preference as a filter.** A filter silently deletes inventory. If you would have looked at the product, the filter cost you money and you will not see the bill.
5. **Anything with no typed field goes in the brief and is your risk.** Brand safety adjacency, competitive separation, tone, creative direction, sole-sponsorship rationale. The seller will do its best and you have no way to verify what it did.

Rule 5 is the one that should worry a buyer. "Avoid news, political content, and competitive automotive brands" is a compliance requirement in most organisations, it appears in AdCP's own DO list for briefs, and there is no field in `product-filters.json` that expresses it. The nearest structured surfaces are `required_policies` (registry policy IDs, which must already exist in a policy registry) and `property_list` (an externally managed list you create through a governance agent before you call `get_products`). Both take real setup. Neither is what a brief writer reaches for.

## Does the schema enforce any of this?

No. Not one rule on this page is enforceable by a validator.

I ran the payloads against `dist/schemas/3.1.10/media-buy/get-products-request.json` with a Draft-07 validator. `{"buying_mode": "wholesale", "brief": "..."}` validates, despite `brief-expectations.mdx` saying the pair is "an error" and the schema's own description saying `brief` "must not be provided". `{"buying_mode": "brief"}` with no brief validates, despite the docs marking `brief` "Required when `buying_mode` is `brief`". A request with `breif` and `fliters` misspelled validates, because `additionalProperties: true`.

The exclusivity rules live entirely in `description` strings. That is a design decision with a cost: the constraint is readable by a human and by a language model, and invisible to every JSON Schema tool in the ecosystem.

## Is the documented filter list the same as the released one?

It is not, and this is worth checking before you copy a field name out of the reference page.

The Filters Object table in `docs/media-buy/task-reference/get_products.mdx` has 27 rows. `dist/schemas/3.1.10/core/product-filters.json` has 30 properties. The unreleased `main` branch has 33.

Three rows in the documented table do not exist in the published 3.1.10 schema: `format_kinds`, `format_option_refs` and `audience_evidence_requirements`. All three exist on `main`. The same table marks `format_ids` as "Deprecated 3.x named-format compatibility filter"; in the released 3.1.10 schema `format_ids` carries no `deprecated` flag and is described simply as "Filter by specific format IDs". The deprecation is on `main`, where the description reads "Deprecated in AdCP 3.2; removed in AdCP 4.0."

Six filters that are in the released schema have no row in that table at all: `exclusivity`, `trusted_match`, `required_features`, `required_geo_targeting`, `required_axe_integrations` and `ext`. Four of them — `exclusivity`, `trusted_match`, `required_features` and `required_axe_integrations` — do not appear anywhere in the 1,772 lines of `get_products.mdx`. `exclusivity` is the one that stings, because sole-category sponsorship is a normal ask on a guaranteed buy and the filter for it is undocumented on the page you would look at.

The rule that resolves all of this: `dist/schemas/latest.json` names the release, `dist/schemas/<latest_stable>/` is the schema of record, and the prose docs track `main`. When they differ, the docs are describing a version you cannot buy against yet.

## Does brief-expectations get the required fields right?

One more mismatch, small but load-bearing for anyone writing a client.

`brief-expectations.mdx` opens its Required Components section with: "Every `get_products` and `create_media_buy` request MUST include:" and then lists Brand and the Brief Field.

In the published schemas, `get-products-request.json` has `"required": ["buying_mode"]`. `brand` is optional; the reference page's own parameter table marks it Required: No. `create-media-buy-request.json` has `"required": ["idempotency_key", "account", "brand", "start_time", "end_time"]`, so `brand` really is required there — and `create_media_buy` has no `brief` property at all, so the second half of that MUST cannot be satisfied on that operation under any circumstances.

## Why is this page here and not on docs.adcontextprotocol.org?

Because a standards body cannot easily publish a page whose subject is a contradiction between two of its own pages. The fix upstream is to edit one of them, and until somebody does, an implementer reading either page in isolation will build the wrong thing.

Both documents are worth reading in full. `brief-expectations.mdx` is the better guide to writing brief prose; `buyer-briefs-and-get-products.mdx` is the better guide to deciding where a requirement goes. Read the second one first.

Checked against `adcontextprotocol/adcp` at commit `f1a35ab`, 2026-08-06, schema release 3.1.10.
