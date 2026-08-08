---
title: 'How a Machine Actually Buys Media, End to End'
description: "A wire-level trace of one campaign through AdCP 3.1.10, with real operation and field names, then the same buy walked through AAMP's canonical contract."
answer: "How a machine buys media in AdCP 3.1.10: get_adcp_capabilities, sync_plans, get_products, refine to a committed proposal, sync_creatives, check_governance, create_media_buy, then get_media_buy_delivery. AAMP's contract replaces the middle with quote, negotiate, book."
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-workflow'
keywords:
  - 'agentic media buying workflow'
  - 'how do ai agents buy ads'
  - 'machine readable media buy'
  - 'buyer agent seller agent flow'
  - 'adcp create_media_buy example'
steps:
  - name: 'Ask the seller what it supports'
    text: "Call get_adcp_capabilities to read supported_protocols, auth model, specialisms and the seller's declared properties before sending anything else."
  - name: 'Register the campaign plan with a governance agent'
    text: 'Call sync_plans with plan_id, brand, objectives, budget and flight so later spend can be checked against a declared authority.'
  - name: 'Discover inventory from a brief'
    text: "Call get_products with buying_mode 'brief' and a natural-language brief; read products[] and proposals[] from the response."
  - name: 'Refine and commit a proposal'
    text: "Call get_products again with buying_mode 'refine' and a proposal-scoped entry with action 'finalize' to convert a draft proposal to committed with a hold window."
  - name: 'Attach audience signals'
    text: 'Call get_signals to discover signals, then activate_signal against the destination platform and seat.'
  - name: 'Load creatives into the library'
    text: 'Call sync_creatives with an idempotency_key, the creatives array and optional package assignments; use build_creative when the creative does not exist yet.'
  - name: 'Get a governance verdict before spending'
    text: "Call check_governance with plan_id, caller, tool 'create_media_buy' and the payload; read verdict of approved, denied or conditions."
  - name: 'Commit the buy'
    text: 'Call create_media_buy with idempotency_key, account, brand, packages, start_time and end_time; receive media_buy_id and media_buy_status.'
  - name: 'Watch it start and read delivery'
    text: 'Call get_media_buys for creative approvals and configuration state, then get_media_buy_delivery for impressions, spend and pacing.'
  - name: 'Close the reporting, governance and billing loops'
    text: 'Call provide_performance_feedback with a performance_index, report_plan_outcome to the governance agent, and report_usage to the vendor agent.'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/check-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/creative/sync-creatives-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/protocol-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/compliance/3.1.10/index.json'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/DealBookingRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationMessage.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/openapi.json'
  - 'https://iabtechlab.com/opendirect'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://adcpexplorer.noetis.dev/areas/protocol/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://aampexplorer.noetis.dev/repos/iab-agentic-primitives/'
  - 'https://briefgateway.noetis.dev/'
reviewState: cto-reviewed
---

## What does this trace cover, and what is invented?

One campaign, walked call by call. The buyer is an agent acting for an advertiser that wants connected TV and online video for a product launch. Every operation name, every field name and every enum value below comes from AdCP release 3.1.10 as published in `dist/schemas/3.1.10/`, or from `iab-agentic-primitives` at commit `2fc7029`.

Invented: the advertiser, the budget numbers, the identifiers and the brief text. Not invented: the shape around them. If a field isn't in this trace, it's because the schema doesn't have it.

Two things to fix before the first call.

**Pin the version at release precision.** `core/version-envelope.json` is explicit: `adcp_version` takes values like `"3.1"`, and "Patches are not negotiated." Sending `"3.1.10"` is wrong even though 3.1.10 is the release you read the schemas from. The envelope also advises emitting the deprecated `adcp_major_version` alongside it through the 3.x line, for sellers that only read the legacy field.

**Expect async.** Seven of the 64 operations in 3.1.10 ship async response arms: `get_products`, `create_media_buy`, `update_media_buy`, `sync_creatives`, `sync_catalogs`, `build_creative` and `get_signals`. Those are the calls that can return `status: "submitted"` with a `task_id` instead of a result. The other 57 answer in line. The [protocol envelope reference](https://adcpexplorer.noetis.dev/areas/protocol/) has the full lifecycle.

## Step 1: what does this seller actually support?

`get_adcp_capabilities` is the first call, and it is the only one that is required of every AdCP agent regardless of which protocols it implements.

```json
{
  "adcp_version": "3.1",
  "adcp_major_version": 3,
  "protocols": ["media_buy", "creative", "signals", "governance"]
}
```

`protocols` is optional and narrows the answer; omit it and the seller returns everything it supports. Its enum takes five values, `media_buy`, `signals`, `governance`, `sponsored_intelligence` and `creative`, in snake_case. The schema registry uses kebab-case group keys for the same areas, which is a naming split worth knowing about before you generate client code from directory names.

The response carries `supported_protocols` as its one other required field beyond the envelope, plus per-protocol capability blocks: `media_buy`, `creative`, `signals`, `governance`, `brand`, `sponsored_intelligence`, `account`, `identity`, `measurement`, `compliance_testing`. It also carries `specialisms`, `request_signing`, `experimental_features` and `last_updated`.

Read `request_signing` before anything else. It tells you whether the seller requires RFC 9421 signed HTTP requests on mutating calls, and a buyer that discovers that after sending `create_media_buy` has already failed.

## Step 2: does the buyer have authority to spend this money?

Governance in AdCP is a separate agent with its own operations, and the plan is registered before the buying starts. `sync_plans` pushes it.

```json
{
  "adcp_version": "3.1",
  "idempotency_key": "0f0d1b2c-4a1e-4c7f-8f6a-9a1f2c3d4e5f",
  "plans": [
    {
      "plan_id": "plan_q4_launch",
      "brand": { "domain": "example-advertiser.com" },
      "objectives": "Launch awareness across CTV and online video",
      "budget": { "total": 400000, "currency": "USD", "per_seller_max_pct": 40 },
      "flight": { "start": "2026-09-01T00:00:00Z", "end": "2026-10-15T23:59:59Z" },
      "channels": { "allowed": ["ctv", "olv"] },
      "human_review_required": false
    }
  ]
}
```

`plan_id`, `brand`, `objectives`, `budget` and `flight` are the required members of a plan. The optional members are where the interesting constraints live: `policy_ids`, `policy_categories`, `restricted_attributes`, `min_audience_size`, `approved_sellers`, `audience` and `custom_policies`.

`policy_categories` is the field with teeth. Its values are registry-defined strings rather than an enum, deliberately, so new categories can be added as regulation moves. The registry at `static/registry/policy-categories/` carries ten: `age_restricted`, `children_directed`, `fair_employment`, `fair_housing`, `fair_lending`, `firearms_weapons`, `gambling_advertising`, `health_wellness`, `pharmaceutical_advertising`, `political_advertising`.

Four of those bite at the schema level. `sync-plans-request.json` carries an `if/then` that fires when `policy_categories` contains `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising`: the plan must then also carry `human_review_required: true`, or it fails validation. A second `if/then` does the same for the `eu_ai_act_annex_iii` policy ID. Every other category, political advertising included, depends on the governance agent's implementation rather than a schema invariant. That distinction is the difference between a control and an intention.

## Step 3: how does an agent find inventory from a brief?

`get_products` is the discovery call, and `buying_mode` is required on every v3 request. Three values: `brief`, `wholesale`, `refine`.

```json
{
  "adcp_version": "3.1",
  "buying_mode": "brief",
  "brief": "Connected TV and online video for a September product launch. Adults 25-54, US only, brand-safe premium video, no news adjacency.",
  "brand": { "domain": "example-advertiser.com" },
  "account": { "account_id": "acct_8842" },
  "filters": { "channels": ["ctv", "olv"] },
  "preferred_delivery_types": ["guaranteed"],
  "pagination": { "max_results": 25 }
}
```

The response returns `products[]` and, when the seller curates rather than just filters, `proposals[]`. A `product` requires seven fields: `product_id`, `name`, `description`, `publisher_properties`, `delivery_type`, `pricing_options` and `reporting_capabilities`. Everything else on it is optional, including `forecast`, `measurement_terms`, `performance_standards`, `creative_policy` and `format_options`.

`pricing_options` is where the money starts. It is a discriminated array keyed on `pricing_model`, with one schema per model under `pricing-options/`: CPM, vCPM, CPC, CPCV, CPV, CPP, CPA, flat rate and time-based. A product can offer several. The buyer picks one by `pricing_option_id` at package time, which is the AdCP equivalent of accepting a rate.

Note what did not happen here. The buyer did not send targeting parameters and get back a filtered list. It sent a paragraph of English and got back a curated set with a publisher's recommendation attached. That is the actual design difference between AdCP discovery and an ad server query, and it is why the [brief itself is a structured artifact worth getting right](https://briefgateway.noetis.dev/).

## Step 4: how does a buyer push back on a proposal?

`refine` is a second `get_products` call, not a separate operation.

```json
{
  "adcp_version": "3.1",
  "buying_mode": "refine",
  "refine": [
    { "scope": "request", "ask": "more CTV, less mid-roll online video" },
    {
      "scope": "product",
      "product_id": "prod_ctv_premium_01",
      "action": "more_like_this",
      "ask": "same audience, longer ad pods"
    },
    { "scope": "product", "product_id": "prod_olv_run_of_site", "action": "omit" }
  ]
}
```

Each entry is discriminated on `scope`. Request-scoped entries carry only an `ask`. Product-scoped entries take `action` of `include`, `omit` or `more_like_this`. Proposal-scoped entries take `include`, `omit` or `finalize`.

`finalize` is the commit, and it has two rules that will bite an implementer. First, exclusivity: if any entry carries `action: "finalize"`, every entry in the array has to be proposal-scoped and finalize, or the seller rejects with `INVALID_REQUEST`. Second, atomicity: multiple finalize entries against different proposals must all commit or none commit, and the seller must not return success until every named proposal is persisted as committed.

```json
{
  "adcp_version": "3.1",
  "buying_mode": "refine",
  "refine": [{ "scope": "proposal", "proposal_id": "prop_q4_ctv_mix_v3", "action": "finalize" }]
}
```

A finalized proposal moves from `proposal_status: "draft"` to `"committed"` and carries `expires_at`, the hold window. `proposal-status.json` has exactly two values, so there is no "pending" state to poll: a proposal is draft or it is committed.

This is the closest thing AdCP has to negotiation, and it negotiates in prose. The buyer writes "reduce total by 10%" into `ask` and the seller re-prices. There is no `buyer_price` field, no round counter and no concession. Hold that thought until the AAMP section.

## Step 5: how do audience signals get attached?

`get_signals` and `activate_signal`. Between them, that is the entire Signals protocol.

`get_signals` takes a `signal_spec` in natural language, or `signal_refs`, or `signal_ids`, plus `destinations`, `countries` and `filters`. `activate_signal` then makes a discovered signal targetable on a specific platform.

```json
{
  "adcp_version": "3.1",
  "action": "activate",
  "signal_agent_segment_id": "seg_auto_intenders_us",
  "destinations": [{ "type": "platform", "platform": "example-dsp", "account": "seat_44120" }],
  "idempotency_key": "8c1b0d4e-77aa-4f19-9a02-3d5e6f7a8b90"
}
```

`signal_agent_segment_id`, `destinations` and `idempotency_key` are all required, and each destination is discriminated on `type`: `platform` with a `platform` string, or `agent` with an `agent_url`. `action` also takes `deactivate`, which the schema ties to data governance: removing a segment from downstream platforms when a campaign ends.

Signals are third-party or marketplace data. First-party CRM records go somewhere else entirely: `sync_audiences`, which takes SHA-256 `hashed_email` and `hashed_phone` and will not accept cleartext. Confusing the two is the most common modelling error I see people make in AdCP, because both end up as targeting.

## Step 6: how do creatives get into the buy?

`sync_creatives` is an upsert against a creative library, capped at 100 creatives per call.

```json
{
  "adcp_version": "3.1",
  "idempotency_key": "c41f9b02-1e33-4a58-bb70-2f9c8d1e0a45",
  "account": { "account_id": "acct_8842" },
  "creatives": [
    {
      "creative_id": "cr_launch_15s_v1",
      "name": "Launch 15s cutdown",
      "format_kind": "video_vast",
      "assets": {
        "vast_tag": {
          "asset_type": "vast",
          "delivery_type": "url",
          "url": "https://vast.example-agency.com/tag?cid=launch15&cb=[CACHEBUSTER]",
          "vast_version": "4.2",
          "duration_ms": 15000
        }
      }
    }
  ],
  "assignments": [
    { "creative_id": "cr_launch_15s_v1", "package_id": "pkg_ctv_primary", "weight": 100 }
  ],
  "dry_run": false,
  "validation_mode": "strict"
}
```

`creative_id`, `name` and `assets` are the required members of a creative asset. Two shapes catch people out. `assets` is an object keyed by the format's `asset_group_id`, not an array, and each value carries an `asset_type` discriminator that selects the matching asset schema. And `format_id`, the legacy named-format path, is always a structured object of `{agent_url, id}` and never a plain string; `format_kind` is the 3.1 canonical path and takes one of 13 values, which is what the example above uses.

`delete_missing` turns the call into a full replacement, and `dry_run` validates without writing, which is the flag to use the first time you point at a new seller.

When the creative does not exist yet, `build_creative` generates it from a `message` brief plus a `target_format_id`, with `max_spend`, `max_creatives` and `max_variants` as the guard rails, and `preview_creative` renders a manifest before anything is assigned. AdCP has eight creative operations in total, which makes Creative the third-largest area in the protocol behind Governance with 22 and Media Buy with 11. It is also the part of the protocol with no counterpart anywhere in AAMP.

## Step 7: does the plan allow this specific purchase?

`check_governance` is the gate. The orchestrator or the seller calls it before executing, and it is a read: it does not mutate state.

```json
{
  "adcp_version": "3.1",
  "plan_id": "plan_q4_launch",
  "caller": "https://buyer.example-agency.com/agent",
  "tool": "create_media_buy",
  "phase": "purchase",
  "purchase_type": "media_buy",
  "payload": { "total_budget": { "amount": 250000, "currency": "USD" } }
}
```

The response requires `check_id`, `verdict`, `plan_id` and `explanation`. `verdict` takes three values: `approved`, `denied`, `conditions`. When it returns `conditions`, the `conditions` array tells you what has to be true, and `expires_at` tells you how long the verdict is good for.

One naming trap in this schema. The verdict field was called `status` in 3.0 and was renamed to `verdict` in 3.1 so the top-level `status` key could carry the envelope's task status under MCP flat-on-the-wire serialisation. The enum values did not change; only the property name moved. Code written against 3.0 reads the wrong key and sees the task status instead of the governance decision.

## Step 8: what actually commits the money?

`create_media_buy`. Required: `idempotency_key`, `account`, `brand`, `start_time`, `end_time`, and either `packages` or a `proposal_id`.

```json
{
  "adcp_version": "3.1",
  "idempotency_key": "7ab3f5d1-9c02-4e6b-a1f8-0c4d2e5b7a99",
  "account": { "account_id": "acct_8842" },
  "brand": { "domain": "example-advertiser.com" },
  "proposal_id": "prop_q4_ctv_mix_v3",
  "start_time": "2026-09-01T00:00:00Z",
  "end_time": "2026-10-15T23:59:59Z",
  "po_number": "PO-2026-4417"
}
```

Three optional webhook slots sit alongside those: `reporting_webhook`, `artifact_webhook` and `push_notification_config`. `reporting_webhook` is not just a URL; it requires `url`, `authentication` and a `reporting_frequency` of `hourly`, `daily` or `monthly`, and that frequency has to be supported by every product in the buy.

Executing a committed proposal by `proposal_id` lets you omit `packages` entirely; the seller derives them from the proposal's allocations. Building packages by hand instead means each entry needs `product_id`, `budget` and `pricing_option_id`, with `impressions`, `pacing`, `targeting_overlay`, `optimization_goals`, `performance_standards` and `creative_assignments` available on top.

The response is one of exactly three shapes, and the schema says so in its description. Synchronous success returns `media_buy_id` and `packages` in line with a `media_buy_status` of `pending_creatives`, `pending_start`, `active` or `paused`. Terminal failure returns an `errors` array with no media-buy artifact. The submitted branch returns `status: "submitted"` with a `task_id`, and `media_buy_id` lands on the task's completion artifact rather than on this response. A client that reads `media_buy_id` unconditionally breaks on the third shape, which is the shape you get whenever a human has to sign an insertion order.

`idempotency_key` is the field that makes retries safe. Its own description sets the rule: a repeat with the same key and account returns the existing media buy rather than creating a duplicate. The flag that tells you which happened lives one level up, on `core/protocol-envelope.json` — `replayed: true` means the response came out of the idempotency cache rather than a fresh execution.

## Step 9: how does the buyer know it is running?

Two different calls for two different questions.

`get_media_buys` answers "what state is this in?" It returns `media_buys[]` with creative approval status, missing assets and configuration, and takes `include_snapshot`, `include_history` and `include_webhook_activity` to widen the answer.

`get_media_buy_delivery` answers "what has it delivered?" Its response requires `reporting_period`, `currency` and `media_buy_deliveries`, and offers `include_package_daily_breakdown`, `time_granularity`, `include_window_breakdown`, `attribution_window` and `reporting_dimensions`. It also carries `partial_data`, `unavailable_count` and `next_expected_at`, which exist because delivery data for some channels arrives in stages rather than final on day one.

```json
{
  "adcp_version": "3.1",
  "media_buy_ids": ["mb_9f31c7"],
  "start_date": "2026-09-01",
  "end_date": "2026-09-30",
  "time_granularity": "daily",
  "include_package_daily_breakdown": true
}
```

If the buy needs changing rather than watching, `update_media_buy` applies PATCH semantics against `media_buy_id` with a `revision`, and can pause, cancel, move dates or add `new_packages`.

## Step 10: which loops have to be closed after delivery?

Three loops, and they go to three different counterparties, which is the part people miss when they build only the seller-facing half.

`provide_performance_feedback` goes back to the seller. It requires `media_buy_id`, `idempotency_key`, `measurement_period` and `performance_index` — a normalised score, not raw conversions — so the seller can optimise without the buyer handing over its outcome data.

`report_plan_outcome` goes back to the governance agent. It requires `plan_id`, `idempotency_key`, `outcome` and `governance_context`, and returns `outcome_id`, `outcome_state` and `committed_budget`. This is the call that moves budget from reserved to spent in the governance agent's ledger.

`report_usage` goes to the vendor agent. It requires `idempotency_key`, `reporting_period` and `usage`, and it exists so vendors can bill: impressions served, signals queried, governance checks run. AdCP does not settle payment. It reports the consumption that an invoice is built from, and the invoice happens off-protocol.

That is one campaign, ten steps, thirteen distinct operations out of the 64 in the release.

## Where does AAMP's path differ?

AAMP's canonical buyer-to-seller contract lives in `iab-agentic-primitives`, whose OpenAPI document declares 13 operations total. Here is the same buy through it.

**Discovery.** `GET /.well-known/agent.json` returns the Agent Card: `capabilities.protocols`, `skills[]`, `inventory_types`, `supported_deal_types`. Then `POST /registry/agents/discover` with `{"agent_url": "https://seller.example.com"}` fetches and registers the counterparty. There is no per-protocol capability negotiation and no version pin in the envelope.

**Inventory.** `GET /products` takes `limit` and `offset` and returns `products[]` with `total_count`. Filtering is client-side; the OpenAPI summary says so. Then `POST /products/avails` asks whether a specific product can deliver:

```json
{
  "productid": "prd_ctv_primetime",
  "startdate": "2026-09-01",
  "enddate": "2026-10-15",
  "budget": 250000,
  "requestedImpressions": 18000000,
  "targeting": { "geo": ["US"] }
}
```

The response requires `productid`, `availableImpressions`, `estimatedCpm` and `totalCost`, with `guaranteedImpressions`, `deliveryConfidence` and `availableTargeting` optional. The field names are lowercase and unseparated because they are OpenDirect 2.1's wire names, carried through unchanged.

**Quote.** `POST /api/v1/quotes` requires `product_id`, `deal_type` and `idempotency_key`. `deal_type` is a three-value enum: `PG` for programmatic guaranteed, `PD` for preferred deal, `PA` for private auction. The optional fields are the ones that set the price: `buyer_identity`, `impressions`, `target_cpm`, `rate_card_id`, `agent_url` and `consent_context`.

`buyer_identity` deserves a sentence. The buyer reveals identity progressively, and pricing follows: four access tiers from `public` through `advertiser`. But the schema description says the effective tier "is capped server-side by registry-verified trust," so claiming to be an advertiser does not make you one. Trust status caps the tier; the tier caps the price.

**Negotiation.** This is the step AdCP does not have.

```json
{
  "action": "counter",
  "quote_id": "qt_7712",
  "buyer_price": { "amount_micros": 41500000, "currency": "USD" },
  "round_number": 2,
  "rationale": "Comparable primetime CTV at 40.00 elsewhere in the plan",
  "idempotency_key": "3f8c2a11-6b04-4d90-9c77-11de5f0a2b34"
}
```

That price object is not decoration. AAMP's flagged decision FD-11 makes `Money` an integer micros amount and bans floats on the wire, and the schema says why: "IEEE 754 floating point is non-deterministic for money math (`0.1 + 0.2 != 0.3`, and repeated CPM arithmetic accumulates error), and the two source repos used `float` end-to-end; that defect must not be fossilized into the spec." Sending `41.50` is rejected at validation rather than truncated. The one exception is `POST /products/avails`, whose `budget` stays a plain number because it inherits OpenDirect 2.1's float dialect.

`action` takes `accept`, `counter`, `final_offer` or `reject`, and it has no default: the schema notes that "the action-less bare-price payload that caused the historical 422 does not validate." `buyer_price` is required for `counter` and `final_offer`, an optional echo on `accept`, and omitted on `reject`. The response returns a `NegotiationRound` with `concession_pct` and `cumulative_concession_pct`, plus `rounds_remaining` when the seller chooses to disclose it, and a `status` that goes terminal on `accepted`, `rejected` or `expired`. The reference seller bounds all of this with per-tier round limits and concession caps, published on [AAMP Explorer's negotiation page](https://aampexplorer.noetis.dev/negotiation/).

**Booking.** `POST /api/v1/deals` requires only `quote_id` and `idempotency_key`. Everything commercial was settled in the quote; booking binds it. The response wraps a `Deal` carrying `deal_id`, `openrtb_params`, `activation_instructions`, `pricing`, `supply_chain`, `terms` and `expires_at`. That `openrtb_params` field is the handoff: an AAMP deal terminates in an OpenRTB deal ID that a DSP bids against.

**After booking.** `POST /api/v1/change-requests` with `change_type`, `proposed_values`, `severity` and a `makegood` flag. Reporting is not in the shared contract at all: `/api/v1/deals/{deal_id}/performance` on the seller agent, `/reports/{job_id}` on the buyer agent, and neither is a standard.

### Step-by-step correspondence

| Step                 | AdCP 3.1.10                                                           | AAMP canonical contract                                                                                                              |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Capability discovery | `get_adcp_capabilities`                                               | `GET /.well-known/agent.json`, then `POST /registry/agents/discover`                                                                 |
| Spending authority   | `sync_plans`, then `check_governance` before each action              | No counterpart. `ConsentContext` rides on the quote; `seller-agent` has `/approvals` for human review                                |
| Inventory discovery  | `get_products` with a natural-language `brief`                        | `GET /products` with pagination, then `POST /products/avails` per product                                                            |
| Price agreement      | `refine` with a prose `ask`, then `action: "finalize"`                | `POST /api/v1/quotes`, then `POST /api/v1/negotiations/messages` with a numeric `buyer_price`                                        |
| Audience attachment  | `get_signals`, `activate_signal`, `sync_audiences`                    | `audience_plan` as an open object on the quote and booking; `POST /agentic-audience/match` on `seller-agent`                         |
| Creative             | `sync_creatives`, `build_creative`, `preview_creative` and five more  | No counterpart in the wire contract. `Creative` and `Assignment` exist as objects; `agentic-direct`'s tool handlers return mock data |
| Commit               | `create_media_buy` returning `media_buy_id`                           | `POST /api/v1/deals` returning `deal_id` and `openrtb_params`                                                                        |
| Modification         | `update_media_buy` with PATCH semantics                               | `POST /api/v1/change-requests` with a seller-owned lifecycle                                                                         |
| Delivery reporting   | `get_media_buy_delivery`, `get_media_buys`                            | No counterpart in the wire contract. Per-implementation endpoints only                                                               |
| Closing the loop     | `provide_performance_feedback`, `report_plan_outcome`, `report_usage` | No counterpart                                                                                                                       |

### Three differences that change how you build

**Where the price is settled.** AdCP settles price by picking a `pricing_option_id` off a product the seller already published, optionally after a prose refinement. AAMP settles it by exchanging numbers until one side says `accept`. If your business runs on negotiated rates, AAMP models what you already do. If it runs on rate cards, AdCP does.

**Where the commit point is.** AdCP commits in one call, `create_media_buy`, guarded by an `idempotency_key` and, when the plan requires it, a governance verdict. AAMP commits in two, quote then book, with the quote acting as a priced, expiring option. Two-phase commit is more work and gives you a document to hand a finance team.

**What the buy terminates in.** An AdCP media buy terminates in a media buy: packages, creative assignments, delivery reporting, and optionally Trusted Match activation at serve time. An AAMP deal terminates in `openrtb_params`, which is to say in a deal ID that an existing DSP already knows how to bid against. AAMP's path is shorter because it stops at the boundary of infrastructure that already exists.

One thing worth saying plainly: the AAMP side of this trace comes from a repository whose README says "WORK IN PROGRESS — NOT YET RELEASED," pinned at `v0.5.0` by both reference agents. The endpoints are real and the schemas are real. The stability promise is not there yet.

## What is missing from both traces?

Neither path above contains a measurement call, because neither protocol has one. AdCP carries delivery facts and outcome signals and explicitly declines to specify an attribution model; AAMP has no measurement object in its shared contract at all. Neither path contains a payment or settlement call. Neither contains a dispute flow for the case where the buyer's numbers and the seller's numbers disagree.

Those gaps have their own page: [what neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/).

## Common questions

**Can this trace be run today?**
The AdCP half can be written against a frozen artifact: every schema in it is published under `dist/schemas/3.1.10/`, and the same release ships a compliance suite — 38 universal storyboards plus per-protocol and per-specialism scenarios under `dist/compliance/3.1.10/` — to test an implementation against. Whether a given seller answers is a separate question from whether the protocol is specified. The AAMP half is written against an unreleased library, so treat the field names as accurate at commit `2fc7029` and re-check them before you ship.

**Which of these calls are required?**
In AdCP, `get_adcp_capabilities` is required of every agent. The rest depend on role and on which protocols the agent implements; `docs/protocol/required-tasks.mdx` is the per-role conformance matrix. In the AAMP contract, nothing is formally required, because there is no conformance level to be required by.

**Do I need a governance agent?**
Only if a plan is registered. `check_governance` validates against a `plan_id`, so with no plan there is nothing to check against. That means the strongest control in AdCP is opt-in. Once you do register a plan, one rule is enforced by the schema rather than the agent: declaring `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising` forces `human_review_required: true`.

**What happens on a retry?**
Twenty-nine AdCP request schemas take an `idempotency_key` — every mutating operation in the release — and the response envelope marks a repeat with `replayed`. AAMP does the same on all three money-mutating endpoints, quote, book and change request, and the schemas label them with the internal flag `FD-12`. Both stacks got this right, which is not something you can say about most REST APIs in advertising.

**Why is there no auction step?**
Because neither of these is an auction protocol. AdCP's FAQ argues the point directly: OpenRTB already works at the impression layer, and AdCP targets direct-sold inventory, guaranteed deals and commerce media. AAMP reaches the auction by handing a deal ID to one. The serve-time layers, AdCP's Trusted Match and AAMP's ARTF, are covered in the [protocol comparison](/protocols/adcp-vs-aamp/).

## How was this trace checked?

Every AdCP field name was read from `dist/schemas/3.1.10/` in `adcontextprotocol/adcp` at commit `f1a35ab` (2026-08-06), which is the published stable release per `dist/schemas/latest.json`. Every AAMP field name was read from `spec/jsonschema/` and `spec/openapi/iab-agentic-api.yaml` in `IABTechLab/iab-agentic-primitives` at commit `2fc7029` (2026-07-28), with the negotiation strategy table from `IABTechLab/seller-agent` v2.4.1 and the booking workflow from `IABTechLab/buyer-agent` at `0c3a154`.

The payloads are illustrative, not executed. I read schemas; I did not run a conformance suite against a live agent. Where a payload omits optional fields it does so for readability, and where it includes one it is because the field exists in the schema at that path. **Verified 2026-08-09.**
