---
title: 'Brief Completeness Rubric: What AdCP and AAMP Can Actually Read'
description: 'Twenty things a campaign brief contains, where each one lands in AdCP and in AAMP, which are enforced, and what a seller agent does with the ones you leave out.'
answer: "A brief completeness rubric scores a campaign brief on two axes: transactable, whether it carries every field a protocol refuses to book without, and expressive, how many of the receiving side's structured fields it fills rather than leaving to prose."
pubDate: 2026-08-12
cluster: 'agentic-brief-definition'
keywords:
  - 'campaign brief completeness'
  - 'what goes in an agentic campaign brief'
  - 'adcp brief field requirements'
  - 'aamp campaign brief schema'
  - 'brief vs structured filters adcp'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/proposal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/available-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/channels.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/flow_state.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/audience_plan.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/ucp.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/ProductAvailsSearch.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/adcontextprotocol/adcp/issues/5278'
  - 'https://github.com/adcontextprotocol/adcp/issues/2902'
  - 'https://github.com/adcontextprotocol/adcp/issues/843'
  - 'https://github.com/adcontextprotocol/adcp/issues/5754'
  - 'https://reddit.com/r/programmatic/comments/1sqyfu2/fullfunnel_campaign_engaged_visits_kpi/'
  - 'https://pubmatic.com/news/pubmatic-and-butler-till-launch-adcp-enabled-agentic-ai-campaign-across-ctv/'
related:
  - '/generate/'
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/examples/ctv-guaranteed-launch/'
faq:
  - question: 'How many fields does a complete agentic campaign brief need?'
    answer: "Eight are enforced by IAB Tech Lab's buyer agent before a campaign record exists: advertiser, campaign name, objective, total budget, currency, both flight dates, and at least one channel with a budget percentage. AdCP enforces only buying_mode at discovery."
  - question: 'Does a longer brief get better products back?'
    answer: 'Not reliably, and length is the wrong variable. A constraint moves the result only when it lands in a field the seller filters on, and AdCP filters are filter-not-fail, so a threshold that lands there removes products rather than flagging them.'
  - question: 'What should a brief generator do when a field is missing?'
    answer: 'Flag it as missing and stop. Filling a gap with a plausible default produces a document that validates, books, and commits spend to a number the planner never saw.'
reviewState: cto-reviewed
---

Score a brief on two axes before you send it anywhere. Transactable tells you whether the receiving side can book from it. Expressive tells you how much of it arrives as structured fields instead of prose. Score each axis separately: a brief can be transactable and still fill almost none of the structured fields.

**Transactable** is a pass or a fail, and there are two of them because there are two receivers. Score against the receiver you have.

- **Transactable (AAMP).** The eight fields IAB Tech Lab's reference buyer agent refuses to construct a campaign without. AAMP is a reference pair of buyer and seller agents rather than a released standard, so its constraints are one vendor's defaults.
- **Transactable (AdCP).** The three fields on `create_media_buy` that a brief author can supply: `brand`, `start_time`, `end_time`. That call requires five, but `idempotency_key` and `account` come from your session and your client, not from anything a planner writes. At discovery, AdCP requires `buying_mode` and nothing else.

A buyer transacting only over AdCP never runs AAMP's Python validator, so a failure against it is not a failure against the wire.

**Expressive** is a count out of thirty. AdCP 3.1.13's `product-filters.json` declares 30 filter fields. Denominator: all 30 properties, deprecated and `ext` included. [The generator](/generate/) scores against the same 30.

## Label every value: stated, derived, assumed, missing

Each of the twenty brief items in the crosswalk gets one of four labels, and the label is part of the artefact.

- **Stated.** The buyer wrote it. Quote the span. "Budget: $500,000 net" produces `total_budget: 500000` with the sentence attached.
- **Derived.** Unambiguously implied by something stated, with the derivation shown. "$500,000 net" plus a US market gives `currency: USD`. "November 1 - December 31, 2026" gives both flight dates. Write the derivation on one line. If it needs more than one line, label the value assumed.
- **Assumed.** The tool picked a value, so it starts off and it renders differently from everything else.
- **Missing.** Name the field, then name what happens without it.

The labels are for your side, not the seller's. Neither protocol carries them: on AAMP the brief never leaves the buyer agent, and `get-products-request.json` has no provenance channel anywhere in it. The only thing that travels is what you type into the brief string, so "channel split: not specified" is a sentence a seller might read and might not. The distinction exists in exactly one place, the accept step in your own agent: an assumed value stays out of the payload until someone accepts it explicitly.

## Five checks against your last brief

1. Mark each of the twenty items in the crosswalk stated, derived, assumed or missing, strictly on derived. This is the input to both scores.
2. Count the eight AAMP-enforced fields, plus a `budget_pct` on every channel, plus `brand`, `start_time` and `end_time` for `create_media_buy`. All present is transactable. One gap is a brief that can't become a campaign record, and there's no partial credit.
3. Count how many of AdCP's 30 filters you can fill from stated and derived values. That is your expressive score.
4. Find every number in the brief that no planner ever said out loud. Channel splits and attribution windows are where they hide. Report that count next to both scores: an invented split raises transactable, an invented CTR floor raises expressive, and nobody signed either one.
5. Check your KPI against the enums. A planner on r/programmatic described a full-funnel brief whose KPIs were Cost-per-Engaged-Visit and Engaged Visit Rate; AdCP's 36-value metric list has `engagements` and `engagement_rate`, and AAMP's seven-value list has neither. If your KPI is not in the enum, decide now what it degrades to, because otherwise the seller decides. A goal with no objective field may still have a metric field: `incremental_sales_lift` is one of the 36 in `enums/available-metric.json`.

Run the five checks on this brief:

> Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display and online video. Budget: $500,000 net. Market: United States. Target demo: adults 25-54. Flight: November 1 - December 31, 2026. Goal: drive incremental household penetration and retail sales lift. Requirements: premium CTV inventory, brand safety controls, frequency cap 3 per week.

**Transactable: no, against either receiver.** The advertiser is "a CPG snack brand", so `advertiser_id` is absent on the AAMP side and `brand.domain` is absent on the AdCP side. There is no campaign name. Three channels are named with no percentage on any of them, so `ChannelAllocation` can't construct and the sum-to-100 check never gets to run.

**Expressive: six of thirty.** `channels`, `budget_range`, `pricing_currencies`, `countries`, `start_date`, `end_date`.

**Assumed: two, both AAMP defaults.** EVEN pacing, and human approval on plan review and booking. Nothing in the brief itself is invented.

Ten of the twenty rows come back missing: advertiser identity, agency, campaign name, channel budget split, audience segments, KPIs, brand safety, formats, seller preferences and deal type. The stated goal, incremental household penetration and retail sales lift, matches none of AAMP's four objectives, and AdCP has no objective field at discovery to fail against.

Fill those gaps rather than marking them and the arithmetic still passes. A fabricated 60/25/15 split across CTV, online video and display clears AAMP's validator: it sums to 100 inside the 0.01 tolerance, no channel type repeats, `budget_amount` computes off each percentage, and the buyer agent writes a campaign record in DRAFT. The validator checks arithmetic only. A fabricated split that sums to 100 passes. A missing split does not.

## Where every part of a brief lands

Twenty things a real brief contains, and where each one goes, plus a last row for everything with no home on either side. AdCP splits them across two calls and three places, `get_products` at discovery, then `create_media_buy` and its nested `packages[]` at execution. AAMP holds them in one Python class inside the buyer agent, `CampaignBrief`, which never crosses the wire to a seller. A blank in the AdCP or AAMP column means the concept has no home on that side.

| Brief item           | AdCP                                                                                                                   | AAMP `CampaignBrief`                                                                 | If you leave it out                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Advertiser identity  | `brand.domain`, required on `create_media_buy`                                                                         | `advertiser_id`, required                                                            | AdCP cannot resolve `/.well-known/brand.json`; AAMP raises before a campaign record exists                              |
| Agency               |                                                                                                                        | `agency_id`, optional                                                                | The buying agency is invisible to the seller on both sides                                                              |
| Campaign name        | no field; a `buyer_note` was proposed and closed                                                                       | `campaign_name`, required                                                            | Nothing to reconcile against later                                                                                      |
| Objective            | `packages[].optimization_goals`, at buy time, different vocabulary                                                     | `objective`, required, one of AWARENESS / CONSIDERATION / CONVERSION / REACH         | The seller ranks on relevance alone                                                                                     |
| Total budget         | `filters.budget_range` at discovery, `packages[].budget` at buy                                                        | `total_budget`, must be > 0                                                          | AdCP returns products you can't afford                                                                                  |
| Currency             | `filters.budget_range.currency`, required whenever you send a range; `filters.pricing_currencies`                      | `currency`, ISO 4217, required                                                       | AdCP rejects the filter object                                                                                          |
| Flight dates         | `filters.start_date` / `end_date`, then `start_time` / `end_time` required on `create_media_buy`                       | `flight_start` / `flight_end`, end must be after start                               | Availability is unchecked; sellers forecast against nothing                                                             |
| Channels             | `filters.channels`, 20 enum values                                                                                     | `channels[].channel`, 6 enum values                                                  | AAMP raises; AdCP returns the full catalogue                                                                            |
| Channel budget split | no request field; the seller answers with `proposals[].allocations`, across products, percentages must sum to 100      | `channels[].budget_pct`, across channels, must sum to 100                            | AAMP validates a split you didn't choose; AdCP has no request field, so the seller proposes one                         |
| Geography            | `filters.countries` / `regions` / `metros` / `postal_areas` / `geo_proximity`, then `targeting_overlay.geo_*`          | `target_geo[]`, `geo_type` of COUNTRY / STATE / DMA / METRO / ZIP                    | National by default in AAMP; unfiltered in AdCP                                                                         |
| Target demographic   | no filter field; prose or a signal reference                                                                           | inside `target_audience`, an `AudiencePlan`                                          | The seller guesses, or ignores it                                                                                       |
| Audience segments    | `filters.signal_targeting`, `targeting_overlay.audience_include` / `audience_exclude`                                  | `target_audience`                                                                    | AdCP returns a product set no signal narrowed; AAMP's audience plan is null and the pipeline reads that as no targeting |
| KPIs                 | `filters.required_metrics`, 36 enum values; `filters.required_performance_standards` with metric, threshold and vendor | `kpis[]`, 7 metric values, each with a `target_value`                                | No reporting contract is carried into the buy                                                                           |
| Frequency cap        | not a filter; `packages[].targeting_overlay.frequency_cap`, buy time only                                              | `frequency_cap`, max impressions per period in hours                                 | Uncapped                                                                                                                |
| Pacing               | `packages[].pacing`: even, asap, front_loaded                                                                          | `pacing_model`: EVEN, FRONT_LOADED, BACK_LOADED, CUSTOM                              | AAMP defaults to EVEN. BACK_LOADED has no AdCP equivalent                                                               |
| Brand safety         | `filters.required_performance_standards` with `metric: brand_safety` and a named vendor; `required_policies`           | `brand_safety.excluded_categories` (IAB Content Taxonomy) and `excluded_keywords`    | Seller policy applies, not yours                                                                                        |
| Formats              | `filters.format_ids`, `standard_formats_only`, `packages[].format_ids_to_provide`                                      | `channels[].format_prefs`, free-text strings                                         | Format mismatch surfaces at creative assignment                                                                         |
| Seller preferences   | `property_list`, `required_policies`                                                                                   | `preferred_sellers[]`, `excluded_sellers[]`                                          | An excluded seller can win the buy; the blocklist never leaves your side                                                |
| Deal type            | `filters.delivery_type` (guaranteed / non_guaranteed), `filters.is_fixed_price`                                        | `deal_preferences.preferred_deal_types` (PG / PD / PA), `max_cpm`, `min_impressions` | AAMP's `QuoteRequest` requires `deal_type`, so something must supply it                                                 |
| Approval gates       | `check_governance`, `plan_id` when the account has a governance agent                                                  | `approval_config`, four booleans                                                     | AAMP defaults to human approval on plan review and booking, none on creative or pacing                                  |
| Everything else      | the `brief` string, unbounded                                                                                          | `description` and `notes`, free text                                                 | Nothing. The content was free text on both sides                                                                        |

The budget split is the row where the two stacks disagree about whose job it is. AAMP puts it in the buyer's brief and validates it there. AdCP puts it in the seller's answer: issue #843 reported a Swiss buyer's brief reading "50% desktop / 20% mobile / 30% in-app, language splits: 40% German / 60% French" with no way for the publisher to respond with a line-item plan, and 3.1 answers it with `proposals[]`, whose `allocations` are across products and must also sum to 100. So write the split into your brief prose, then read it back off the proposal. Ask for `brief_alignment` too, a 2,000-character field where the seller explains what it made of what you sent, and the only structured place a seller tells you how it read your brief.

The target demographic has no dedicated field on either side. There is no age or gender filter in `product-filters.json`, and `targeting.age_restriction` is for legal compliance on alcohol and gambling, not for planning. "Adults 25-54" is prose in AdCP, and in AAMP it goes inside an open audience-plan object that the buyer agent passes through without a demographic schema of its own. [Brief string or filters](/spec/brief-vs-filters/) has the full list of requirements with no typed home.

## What AAMP won't book without

`models/campaign_brief.py` enforces eight fields, and three cross-field checks on top of them.

| Field           | What the validator requires                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `advertiser_id` | present                                                                                                              |
| `campaign_name` | present                                                                                                              |
| `objective`     | present; AWARENESS, CONSIDERATION, CONVERSION or REACH                                                               |
| `total_budget`  | present, greater than 0                                                                                              |
| `currency`      | present, ISO 4217                                                                                                    |
| `flight_start`  | present                                                                                                              |
| `flight_end`    | present, strictly after `flight_start`                                                                               |
| `channels[]`    | non-empty; every entry carries its own `budget_pct`; the percentages sum to 100 within 0.01; no channel type repeats |

Plan against those eight. The module docstring lists nine, adding `target_audience[]`, and the field declaration below it defaults to `None`, so a consumer that trusts the docstring will expect an audience the code never demands. Two further validators fire only when `target_audience` is present: `validate_content_taxonomy_version` raises `ContentTaxonomyMigrationRequired` on any contextual audience reference from before Content Taxonomy 3.0, and `validate_no_global_agentic` raises `GlobalAgenticUnsupported` on a GLOBAL-scoped agentic reference. With no audience neither runs, and the null plan is read downstream as no targeting.

Everything past those eight is optional and defaulted. Omit `pacing_model` and AAMP applies EVEN.

Nothing re-checks the eight fields after that first validation. The booking flow holds the brief as `campaign_brief: dict[str, Any]` on `BookingState`, an untyped dictionary in a second module carrying [its own incompatible `CampaignBrief`](/compare/adcp-brief-vs-aamp-campaign-brief/).

## What get_products requires

Send a `get_products` request and the only thing that has to be in it is `buying_mode`. That is the whole `required` array in `get-products-request.json`. The `brief` property is `{"type": "string"}` with no minimum length and no structure; its description says it is required when `buying_mode` is `brief` and must not be provided otherwise, and the schema enforces neither of those sentences. `additionalProperties` is `true` on both the request and the filter object, so misspell a filter name and your request still validates, with no seller obliged to notice. The [brief-versus-filters placement rules](/spec/brief-vs-filters/) cover the rest, including filter-not-fail: a threshold that lands in `required_metrics` or `required_performance_standards` deletes products instead of flagging them, with no explanation of which constraint emptied the array.

No conformance test covers whether a seller read your brief. Issue #2902 asks AdCP's compliance storyboards to start testing that filters actually filter, because today "an endpoint can accept `start_date`/`end_date`, return a correctly-shaped response, pass all compliance checks — and silently return the same data regardless of what dates were passed". So read the returned products back against the constraints you sent, and keep the mismatches for your next call with that seller. Probe more than one seller before you conclude anything: three registered sales agents return products to an anonymous `get_products` call, Cora AI, Equativ and No Fluff Advisory, and [the registry, measured](https://adcpexplorer.com/guides/adcp-registry-measured/) has the endpoint-by-endpoint result.

Issue #5278 lays out the choice when no structured field exists: know the seller's format IDs in advance, which breaks cross-seller discovery; accept whatever the seller maps you to; or use the brief string, which its author calls "non-deterministic across sellers". Issue #5754 found a brief line reading `Budget Type: Affiliate / Commission: 4%` with no AdCP pricing option to map to, handled out of band instead.

On the AAMP side the brief does not travel at all. `ProductAvailsSearch` requires `productids`, `accountid`, `advertiserbrandid` and both dates; `QuoteRequest` requires `idempotency_key`, `product_id` and `deal_type`. Both start from products the buyer already chose. The seller agent's only reference to a brief anywhere in its source is a comment in `models/ucp.py` marking three fields on the seller's audience plan as "requirements from campaign brief": `target_demographics`, an untyped `dict[str, Any]`, and `target_interests` and `target_behaviors`, both bare `list[str]`. That comment is the whole of the seller's brief interface, a note above the fields where brief-derived targeting is expected to arrive, with no schema saying what it looks like.

## Where to go next

- [Paste a brief into the generator](/generate/) and read the two scores off the same twenty rows, with every value labelled.
- [Brief string or filters](/spec/brief-vs-filters/) covers which requirements belong in `filters` and which belong in the prose.
- [The two brief formats, field by field](/compare/adcp-brief-vs-aamp-campaign-brief/) is where the second, incompatible `CampaignBrief` in the same repository is laid out.
