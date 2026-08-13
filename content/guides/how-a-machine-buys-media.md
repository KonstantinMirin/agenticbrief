---
title: 'How a Machine Actually Buys Media, End to End'
description: "One CTV campaign traced call by call through AdCP 3.1.13 and AAMP's shared contract: the payloads, and which rules each stack actually enforces rather than merely describes."
answer: "How a machine buys media: one CTV campaign runs 13 of AdCP 3.1.13's 64 operations, from get_adcp_capabilities through create_media_buy to get_media_buy_delivery. AAMP's shared contract begins at the quote and stops at the deal ID, leaving creative, delivery and spending authority outside it."
pubDate: 2026-08-09
cluster: 'hub-workflow'
keywords:
  - 'agentic media buying workflow'
  - 'how do ai agents buy ads'
  - 'machine readable media buy'
  - 'buyer agent seller agent flow'
  - 'adcp create_media_buy example'
steps:
  - name: 'Ask the seller what it supports'
    text: "Call get_adcp_capabilities and read supported_protocols, the adcp block's supported_versions, and request_signing before sending anything else."
  - name: 'The plan has to exist before anything can be checked against it'
    text: 'sync_plans carries plan_id, brand, objectives, budget and flight, so later spend can be checked against a declared authority.'
  - name: 'Discover inventory from a brief'
    text: "Call get_products with buying_mode 'brief' and a natural-language brief; read products[] and proposals[] from the response."
  - name: 'Refine and commit a proposal'
    text: "get_products again, this time with buying_mode 'refine' and a proposal-scoped entry carrying action 'finalize'. A draft proposal becomes committed, with a hold window."
  - name: 'Attach audience signals'
    text: 'Call get_signals to discover signals, then activate_signal against the destination platform and seat.'
  - name: 'Load creatives into the library'
    text: 'Call sync_creatives with an idempotency_key, the creatives array and optional package assignments; use build_creative when the creative does not exist yet.'
  - name: 'Get a governance verdict before spending'
    text: 'Call check_governance with plan_id and caller, plus the tool name and payload, and read verdict of approved, denied or conditions.'
  - name: 'Commit the buy'
    text: 'Call create_media_buy with idempotency_key, account, brand, start_time and end_time, plus either packages or a proposal_id; receive media_buy_id and media_buy_status.'
  - name: 'Watch it start and read delivery'
    text: 'Call get_media_buys for creative approvals and configuration state, then get_media_buy_delivery for impressions, spend and pacing.'
  - name: 'Close the reporting, governance and billing loops'
    text: 'Three reports, three recipients: provide_performance_feedback with a performance_index to the seller, report_plan_outcome to the governance agent, report_usage to the vendor agent.'
faq:
  - question: 'Can this trace be run today?'
    answer: 'The AdCP half, yes: every schema is published under dist/schemas/3.1.13/, and the same release ships 38 universal compliance storyboards under dist/compliance/3.1.13/ to test an implementation against. The AAMP half, no: its library README says it is not yet released, so re-check the field names before you ship.'
  - question: 'Which calls take an idempotency_key?'
    answer: '28 of the 64 AdCP operations take an idempotency_key, and the response envelope marks a replay with replayed: true. Two operations that mutate state, comply_test_controller and si_terminate_session, do not take one. That reads as a gap rather than a design. AAMP requires one on quote, book and change request.'
  - question: 'Do I need a governance agent?'
    answer: 'Only if a plan is registered. check_governance validates against a plan_id, so with no plan there is nothing to check against. AdCP ships its strongest control as opt-in. Once a plan exists, four policy categories force human_review_required at the schema level.'
  - question: 'Does either stack define a standard error shape?'
    answer: 'Both do. AdCP requires code and message on core/error.json, publishes 92 documented codes as an open vocabulary, and carries a three-value recovery classification plus retry_after. AAMP publishes one envelope over a closed 11-code enum, with no recovery hint and no retry timing.'
  - question: 'Why is there no auction step?'
    answer: "Neither stack is an auction protocol. AdCP's FAQ argues that OpenRTB already works at the impression layer and targets direct-sold inventory, guaranteed deals and commerce media instead. An AAMP deal reaches the auction by handing openrtb_params to a DSP that already bids."
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/protocol-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/task-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/error.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/creative/sync-creatives-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/registry/policy-categories/fair_housing.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/compliance/3.1.13/index.json'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationMessage.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/DealBookingRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/ErrorEnvelope.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Negotiation.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/openapi.json'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/guides/agent-discovery-files/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://adcpexplorer.com/areas/protocol/'
  - 'https://adcpexplorer.com/areas/creative/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
  - 'https://briefgateway.com/'
  - 'https://whatisagenticbuying.com/how-it-works/'
reviewState: cto-reviewed
---

AAMP's shared buyer-to-seller contract begins at the quote and stops at the deal ID. Creative, delivery reporting and spending authority fall outside it, which puts all three inside your integration budget, per counterparty, forever.

AdCP's surface runs the other way, from who authorised the spend through to what it delivered and who gets billed for the tooling. One connected-TV campaign uses 13 of the 64 operations it publishes in 3.1.13. The procurement decision is settled before the first payload, by where each contract starts and where it gives up.

## The two stacks, step for step

| Step                 | AdCP 3.1.13                                                                                                 | AAMP canonical contract                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Capability discovery | `get_adcp_capabilities`                                                                                     | `/.well-known/agent.json`, then `/registry/agents/discover`                                                     |
| Spending authority   | `sync_plans`, then `check_governance`                                                                       | None. `ConsentContext` rides on the quote                                                                       |
| Inventory discovery  | `get_products` with a prose `brief`                                                                         | `GET /products`, then `/products/avails`                                                                        |
| Price agreement      | `refine` with an `ask`, then `finalize`                                                                     | `/api/v1/quotes`, then a numeric `buyer_price`                                                                  |
| Audience attachment  | `get_signals`, `activate_signal`, `sync_audiences`                                                          | `audience_plan`, an open object                                                                                 |
| Creative             | `sync_creatives`, `build_creative` and six more                                                             | None in the wire contract                                                                                       |
| Commit               | `create_media_buy` returning `media_buy_id`                                                                 | `/api/v1/deals` returning `deal_id`                                                                             |
| Modification         | `update_media_buy`, PATCH semantics                                                                         | `/api/v1/change-requests`                                                                                       |
| Delivery reporting   | `get_media_buy_delivery`, `get_media_buys`                                                                  | None. `/deals/{id}/performance` on the seller agent, `/reports/{job_id}` on the buyer agent, neither a standard |
| Closing the loop     | `provide_performance_feedback`, `report_plan_outcome`, `report_usage`                                       | No counterpart                                                                                                  |
| Errors               | `core/error.json`, 92 documented codes, open vocabulary, `recovery`, `retry_after`, 15 typed detail schemas | `ErrorEnvelope`, closed 11-code enum, no recovery or retry hint                                                 |

Four of those eleven rows are empty on the AAMP side, and the two questions a finance team asks first, who authorised this spend and what did it deliver, are two of the four. That is my case for putting AdCP first on an integration roadmap and treating AAMP as the negotiation layer it is good at. The [longer version of that argument](/protocols/adcp-vs-aamp/) sits with the version evidence.

The price of the call is the negotiation record. AdCP has no field for a counter-offer, so a desk that wants a machine-checkable concession trail builds one in its own orchestration, and AAMP is the stack that already has one. Governance is the second qualification: `check_governance` validates against a registered plan, so with no plan there is nothing to check, and AdCP ships its strongest control as opt-in.

## Who is in the trace

AdCP is the Ad Context Protocol, one versioned registry out of the adcontextprotocol project, and you call its operations as tool calls over MCP and A2A. AAMP is Agentic Advertising Management Protocols, IAB Tech Lab's umbrella over eight independently versioned repositories, and its shared contract is an OpenAPI 3.1 document you hit over plain HTTP, so where one stack has operation names the other has URL paths.

Five parties show up: a buyer agent for the advertiser, a seller agent for the publisher, and AdCP's governance agent (spending authority), signals agent (segments) and vendor agent (invoicing). AAMP's shared contract knows about two.

`build_creative`, `preview_creative`, `update_media_buy` and `sync_audiences` get named in passing and never called, which leaves 51 operations a straightforward campaign never touches. A campaign that changes mid-flight adds `update_media_buy` to the count. Anyone quoting you a per-operation implementation estimate for all 64 is quoting you for a surface you will not use.

The payloads below are the wire view: real field names at the paths the schemas put them, with the budgets and identifiers invented. There is a [prose version of the same buy](https://whatisagenticbuying.com/how-it-works/), no field names in it, if you want the story first.

## Before the first call

The envelope will not let you pin the wire version at release precision. `core/version-envelope.json` takes `adcp_version` as a major and a minor with an optional prerelease suffix, so `"3.1"` validates and `"3.1.13"`, the release you read the schemas from, does not. The file says why: "Patches are not negotiated; surface them as build_version on capabilities for operational visibility." Keep emitting the deprecated `adcp_major_version` through 3.x anyway, for sellers that read only the legacy field.

## Capability discovery, then spending authority

`get_adcp_capabilities` is the only unconditionally required task in AdCP. The Shared table in `docs/protocol/required-tasks.mdx` has one other row, `sync_agent_notification_configs`, and it is conditional.

Two things come back that you have to read: `supported_protocols`, and an `adcp` block whose `supported_versions` is the authoritative list of releases the seller speaks. Read `request_signing` off the same response before you send anything mutating. It says whether RFC 9421 signed HTTP requests are required, and finding that out from a failed `create_media_buy` is finding it out too late.

The request's `protocols` enum is snake_case: `media_buy`, `signals`, `governance`, `sponsored_intelligence`, `creative`. The registry directories for those areas are kebab-case. A client that generates its constants from directory names ships strings the seller rejects.

Spending authority lives with the governance agent, and the plan gets registered there before any buying happens.

```json
{
  "plan_id": "plan_q4_launch",
  "brand": { "domain": "example-advertiser.com" },
  "objectives": "Launch awareness across CTV and online video",
  "budget": { "total": 400000, "currency": "USD", "per_seller_max_pct": 40 },
  "flight": { "start": "2026-09-01T00:00:00Z", "end": "2026-10-15T23:59:59Z" },
  "policy_categories": ["fair_housing"],
  "human_review_required": true
}
```

One entry in `plans[]`, alongside a required `idempotency_key`. The first five members are required; the optional ones carry the teeth. `static/registry/policy-categories/` holds ten categories as registry strings rather than an enum, so a new category can arrive without a release. Only four of the ten are enforced by the validator itself, and they are the four you would guess from a compliance memo: `fair_housing`, `fair_lending`, `fair_employment`, `pharmaceutical_advertising`. The other six, `political_advertising` included, are strings no code reads, so the extensibility is currently a place to file categories that do nothing. If your compliance officer is relying on one of those six, tell them today rather than in the incident review.

## How AdCP negotiates a price: in English, and in nothing else

`get_products` is discovery, and `buying_mode` is required on every 3.x request, taking `brief`, `wholesale` or `refine`.

```json
{
  "adcp_version": "3.1",
  "buying_mode": "brief",
  "brief": "Connected TV and online video for a September product launch. Adults 25-54, US only, brand-safe premium video, no news adjacency.",
  "brand": { "domain": "example-advertiser.com" },
  "account": { "account_id": "acct_8842" },
  "filters": { "channels": ["ctv", "olv"] }
}
```

The response carries `products[]` and, when the seller curates rather than filters, `proposals[]`. A product has 44 properties, requires seven, and carries `pricing_options` as a discriminated array with nine models on disk, CPM through flat rate and time. Choosing a `pricing_option_id` is how an AdCP buyer accepts a rate; the [get_products reference](https://adcpexplorer.com/operations/get-products/) has the other 43 fields, and [what belongs in the brief string rather than in `filters`](https://briefgateway.com/spec/brief-vs-filters/) is a decision with money on it.

Pushing back happens inside `get_products` too, on a second call with `buying_mode: "refine"`. Entries are discriminated on `scope`: request-scoped carries only a prose `ask`, product-scoped adds `more_like_this`, and only proposal-scoped takes `finalize`. Finalize is exclusive: "if any entry has `action: 'finalize'`, ALL entries in the array MUST be proposal-scoped with `action: 'finalize'`", or the seller returns `INVALID_REQUEST`. Multiple finalizes all land or none do. There is no rollback, and `proposal_status` has exactly two values, so a half-finished finalize is neither visible nor recoverable.

That prose `ask` is the whole negotiation vocabulary. Nowhere in the published schemas is there a `buyer_price`, a `round_number` or a `concession_pct`. A trading desk that wants a machine-checkable concession trail out of AdCP is going to build it in its own orchestration or not have one.

## Creative, and the two shapes that catch people out

Creative is eight operations in AdCP, third-largest behind Governance's 22 and Media Buy's 11, and zero operations in AAMP's shared contract. Build against AAMP and the creative pipeline is yours to invent.

`sync_creatives` upserts into a library capped at 100 creatives per call.

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

A creative requires `creative_id`, `name` and `assets`, and two of those three have a shape that catches everyone once. `assets` is an object keyed by the format's `asset_group_id` rather than an array, with each value carrying an `asset_type` discriminator that selects the matching asset schema. `format_id` is always a `{agent_url, id}` object rather than a plain string, mutually exclusive with `format_kind`.

`dry_run`, `validation_mode` and `delete_missing` are the flags worth knowing before the first run against a new counterparty, and the [creative area reference](https://adcpexplorer.com/areas/creative/) has the other seven operations. `dry_run` rehearses the sync without applying it, validating library upsert semantics and creative IDs against the seller's current context. `validation_mode` defaults to `strict`, which fails the entire sync on any error, against `lenient`, which processes the valid creatives and reports the rest. And `delete_missing` turns the call into a full library replacement by archiving everything not named in this request, which the schema flags "use with caution" and refuses to combine with `creative_ids`.

## Signals attach on a discriminated destination

Third-party segments and first-party CRM records take different operations. `get_signals` and `activate_signal` handle segments; CRM records go to `sync_audiences`, whose SHA-256 `hashed_email` the schema calls "Pseudonymous PII, not anonymous". Both roads end in targeting, which is why [signal and audience](https://adtechglossary.com/signals/audience-vs-signal/) get conflated.

```json
{
  "adcp_version": "3.1",
  "action": "activate",
  "signal_agent_segment_id": "seg_auto_intenders_us",
  "destinations": [{ "type": "platform", "platform": "example-dsp", "account": "seat_44120" }],
  "idempotency_key": "8c1b0d4e-77aa-4f19-9a02-3d5e6f7a8b90"
}
```

`idempotency_key`, `signal_agent_segment_id` and `destinations` are all required, and `core/destination.json` is a `oneOf` discriminated on `type`: a `platform` branch requiring a `platform` string, or an `agent` branch requiring an `agent_url`. Both take an optional `account`. `action` also takes `deactivate`, which the schema ties to data governance, "removing the segment from downstream platforms, required when campaigns end to comply with data governance policies (GDPR, CCPA)". The teardown is in the contract rather than in a runbook.

## The verdict before the money

`check_governance` is the gate, and it is read-only.

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

The response requires `check_id`, `verdict`, `plan_id` and `explanation`. `verdict` takes `approved`, `denied` or `conditions`; on `conditions` the `conditions` array says what has to become true, and `expires_at` says how long the verdict is good for. Porting 3.0 code, read that field's description first: "Renamed from `status` in 3.1 to free the top-level `status` key for the envelope task-status ..." The enum values did not move, only the property name, so a 3.0 client reads the task status and treats it as the decision.

Then the money.

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

Five fields are required and neither `packages` nor `proposal_id` is one of them. Executing a committed proposal by `proposal_id` lets you skip `packages`; the seller derives them from the proposal's allocations.

`reporting_webhook`, `artifact_webhook` and `push_notification_config` are optional and sit alongside those, and the first has a requirement inside it. `reporting_webhook` resolves to `core/reporting-webhook.json`, which requires `url`, `authentication` and a `reporting_frequency` of `hourly`, `daily` or `monthly`, and that frequency "must be supported by all products in the media buy". An `hourly` setting across a mixed CTV and online-video buy can be invalidated by a single product. The other two slots take a URL and its auth.

The response is one of exactly three mutually exclusive shapes, [all three worth reading in full](https://adcpexplorer.com/operations/create-media-buy/) before you write the client. Sync success returns `media_buy_id`, `packages` and a `media_buy_status` of `pending_creatives`, `pending_start`, `active` or `paused`. Terminal failure returns an `errors` array and no media-buy artifact. The submitted branch returns a `task_id`, and `media_buy_id` lands on the task's completion artifact. A client that reads `media_buy_id` unconditionally breaks on that third shape, which is what you get whenever a human signs an insertion order. A repeat of the key returns the existing buy, marked `replayed: true` on the envelope.

That third shape is the general case for seven of the 64 operations: `get_products`, `create_media_buy`, `update_media_buy`, `sync_creatives`, `sync_catalogs`, `build_creative` and `get_signals` all ship async response arms and can return `status: "submitted"` and a `task_id` instead of a result. The other 57 answer in line, so a client that treats all 64 as async keeps books for 57 that never need them. Retrieval is specified either way: `enums/task-status.json` says the client "can always poll `get_task_status` (legacy `tasks/get`) with `task_id`", webhooks through `push_notification_config` are A2A and REST only because "MCP uses progress notifications instead of webhooks", and a `submitted` task is queued for "hours to days", so the polling interval comes off a human's calendar rather than a request timeout.

## The reporting loop runs to three different agents

`get_media_buys` answers what state the buy is in. `get_media_buy_delivery` answers what it delivered, and requires nothing at all.

```json
{
  "adcp_version": "3.1",
  "media_buy_ids": ["mb_9f21c0"],
  "start_date": "2026-09-01",
  "end_date": "2026-09-30",
  "time_granularity": "daily",
  "include_package_daily_breakdown": true
}
```

Every field there is optional, including the buy you are asking about, so an empty request is a schema-valid way to ask a seller for everything. The response carries `partial_data` and `next_expected_at`, because some channels report in stages.

The three reports that close the campaign do not all go to the same place. `provide_performance_feedback` goes back to the seller carrying a normalised `performance_index` rather than raw conversions, and that single float is the entire quantitative channel from buyer to seller in 3.1.13. The governance agent gets `report_plan_outcome`. `report_usage` is for the vendor agent, and it exists because AdCP does not settle payment: it reports the consumption an off-protocol invoice gets built from. Build only the seller-facing half and you have built a third of the loop.

## Most of a client's code lives in the error model

Both stacks publish one error shape and then disagree about what a code is for. AdCP's `core/error.json` requires `code` and `message` and carries a `retry_after` the client "MUST clamp" to 1 through 3600 seconds. Its vocabulary is 92 documented codes in `enums/error-code.json`, deliberately open: `error.code` is wire-typed `string`, sellers may emit codes outside the list, and receivers "MUST decode unknown codes" by falling back to `error.recovery`, one of `transient`, `correctable`, `terminal`. So the code list is documentation and the recovery classification is the contract. When `recovery` is absent it defaults to `transient`, which means an error that forgot to say what kind of error it is gets retried.

Underneath that sit 15 typed schemas in `error-details/`, one per failure a client can do something about. The three that change client behaviour most are `budget-too-low`, `version-unsupported` and `rate-limited`, each carrying the field that makes the next attempt different from a repeat: a minimum budget, the version the seller does speak, a wait. A production client spends more code against those 15 than against the happy path.

AAMP's `ErrorEnvelope` is one shape over a closed 11-value enum, with no recovery classification and no retry timing. A closed enum is easier to switch on, and a client built on one ships a release the day the spec adds a code.

## The same buy through AAMP's contract

The wire contract underneath everything in this section is [unreleased](https://aampexplorer.com/versions/): both reference agents pin the package at `v0.5.0`, and the OpenAPI document's own `info.version` reads `0.1.0`. Read the field names below as intent rather than as an integration target.

Discovery is a file plus a registry call. `GET /.well-known/agent.json` returns the Agent Card with `capabilities`, `skills`, `inventory_types`, `supported_deal_types` and `trust_status`; `POST /registry/agents/discover` registers the counterparty with a one-field body. No capability negotiation, no version pin, nothing saying which release you are talking to. [Agent discovery files](/guides/agent-discovery-files/) has both models side by side.

`GET /products` takes `limit` and `offset` and nothing else, because "filtering is client-side; no /products/search". Then `POST /products/avails` per product, in the lowercase unseparated field names (`productid`, `startdate`, `enddate`) inherited from OpenDirect 2.1. `POST /api/v1/quotes` requires `idempotency_key`, `product_id` and `deal_type`, one of `PG`, `PD` or `PA`, and `buyer_identity` sets the access tier, though "the effective tier is capped server-side by registry-verified trust" and that ceiling is code rather than schema, `TRUST_TIER_CEILING` in `registry_client.py`. So the tier your agent asks for is a claim the seller's registry lookup can quietly downgrade, and the round limits and concession caps you thought you had move with it.

Here AAMP has a step AdCP doesn't.

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

That price object is the most opinionated thing in either corpus. Flagged decision FD-11 makes `Money` an integer micros amount and bans floats: "IEEE 754 floating point is non-deterministic for money math ... that defect must not be fossilized into the spec." Sending `41.50` gets rejected rather than truncated. The one float left on the wire is `avails.budget`. `action` takes `accept`, `counter`, `final_offer` or `reject` and has no default, and a round requires `round_number`, `buyer_price`, `seller_price` and `action`, with the response adding `concession_pct` and `cumulative_concession_pct`. Round limits and concession caps vary by trust tier, four rows of them, on [AAMP Explorer](https://aampexplorer.com/negotiation/).

Booking is thin because the quote did the work: `POST /api/v1/deals` requires only `quote_id` and `idempotency_key`, and the `Deal` it returns requires `deal_id`, `deal_type`, `product`, `pricing` and `terms` while carrying `openrtb_params` optionally. `openrtb_params` is the field that hands the buy to a DSP, and a seller can return a valid, booked `Deal` without it.

## What the schema enforces, and what it only describes

53 AdCP schema files carry an `if` conditional. Zero of AAMP's 48 shared-contract schemas do. An `if` is a rule a validator will hold your counterparty to; a description is a rule you will be arguing about over email.

| Stack                     | Payload                                                                    | Result                                                     |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| AdCP `sync_plans`         | `policy_categories: ["fair_housing"]`, no `human_review_required`          | rejected: "'human_review_required' is a required property" |
| AdCP `sync_plans`         | same plan, `human_review_required: false`                                  | rejected: "True was expected"                              |
| AdCP `sync_plans`         | `policy_ids: ["eu_ai_act_annex_iii"]`, no `human_review_required`          | rejected                                                   |
| AdCP `sync_plans`         | `policy_categories: ["political_advertising"]`, no `human_review_required` | accepted                                                   |
| AdCP `create_media_buy`   | the required five, neither `packages` nor `proposal_id`                    | accepted                                                   |
| AAMP `NegotiationMessage` | `action: "counter"`, no `buyer_price`                                      | accepted                                                   |
| AAMP `NegotiationMessage` | `action: "reject"` carrying a `buyer_price`                                | accepted                                                   |
| AAMP `NegotiationMessage` | `buyer_price.amount_micros: 41.5`                                          | rejected: "41.5 is not of type 'integer'"                  |
| AAMP `NegotiationMessage` | a price with no `action`                                                   | rejected: "'action' is a required property"                |

AdCP's hardest governance rule compiles. Declare `fair_housing` and the validator makes you declare human review, and it will not take `false` for an answer either. Declare `political_advertising` and nothing happens.

FD-11 holds up on the AAMP side, so floats bounce. The negotiation rules go the other way: `buyer_price` is described as "REQUIRED for 'counter'/'final_offer'" and "omitted on 'reject'", and the validator enforces neither, so a counter with no price and a rejection carrying one both sail through. Anyone building against `NegotiationMessage` is implementing that state machine in application code, whether they planned to or not.

`create-media-buy-request.json` says "One of packages or proposal_id must be provided" and has no `oneOf` to make it so, which is why the call that commits the money accepts a request with nothing to buy in it. Run both stacks' schemas against your own fixtures before you trust a description.

Neither trace measures delivery against a conversion, and neither settles a payment. AdCP says the first part about itself in `known-limitations.mdx`: "Not an attribution protocol." The list of [everything else neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/) is longer than the trace above. So the thirteen calls get you a booked, delivering, governed campaign and stop one step short of the number your CFO cares about, which stays where it is today: in your measurement stack, reconciled by hand.

If you are scoping one of these integrations, [I do that for money](/services/).
