---
title: 'How Agentic Buying Works, Call by Call'
description: "One media buy from the buyer's seat, traced through the AdCP operations that carry it, with the required fields named and the gaps in the sequence marked."
answer: 'How agentic buying works, call by call: find the seller through adagents.json, handshake with get_adcp_capabilities, discover with get_products, validate with check_governance, transact with create_media_buy, then report through get_media_buy_delivery and provide_performance_feedback.'
pubDate: 2026-08-09
cluster: 'wiab-mechanics'
keywords:
  [
    'how does agentic buying work',
    'agentic buying process',
    'agentic buying step by step',
    'adcp media buy flow',
    'buyer agent seller agent flow',
  ]
citations:
  [
    'https://docs.adcontextprotocol.org/docs/faq',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/performance-standard.json',
    'https://github.com/IABTechLab/seller-agent',
    'https://github.com/IABTechLab/buyer-agent',
    'https://github.com/IABTechLab/iab-agentic-primitives',
  ]
related:
  [
    '/',
    '/agentic-buying-vs-programmatic/',
    '/maturity/',
    '/about/',
    'https://adcpexplorer.noetis.dev/operations/get-products/',
    'https://adcpexplorer.noetis.dev/discovery/adagents-json/',
    'https://briefgateway.noetis.dev/spec/',
    'https://agenticadlab.noetis.dev/guides/how-a-machine-buys-media/',
  ]
reviewState: cto-reviewed
---

## How does agentic buying work, from the buyer's seat?

I am going to walk one buy. A brand wants connected-TV inventory on a publisher it has never transacted with directly. On the buyer's side there is an agent holding a budget and a brief. On the publisher's side there is a sales agent exposing an AdCP endpoint.

Everything below is traced against AdCP 3.1.10, which is the current published stable release per `dist/schemas/latest.json`. Field names, required flags and enum values come out of the released schema registry, not from the working branch. I have not run this sequence against a live seller agent, so treat it as the protocol's account of the buy rather than a packet capture. Where the protocol leaves something to the implementer, I say so instead of filling it in.

## How does the buyer's agent find the seller's agent?

It fetches a file. The publisher publishes `/.well-known/adagents.json` on its own domain, declaring which agents are authorised to sell its inventory. The schema is `dist/schemas/3.1.10/adagents.json`, titled "AdCP Agents Authorization", and it is a `oneOf`: either the full authorisation structure inline, or a pointer object carrying an `authoritative_location` HTTPS URL.

The pointer variant is where the interesting engineering is. Its own description explains the risk and the mitigation: because one deploy can change authorisation across every publisher in a network, validators must cap response size, refuse redirects on the fetch, enforce short timeouts, and fall back to the previously good copy. That is a supply-chain attack described in a schema description, with the defence written next to it.

This is the same trust move `ads.txt` and `sellers.json` make, applied to agent endpoints instead of seller IDs. AdCP's FAQ says so directly: `adagents.json` extends those relationship semantics rather than replacing them.

## What is the first call the buyer's agent makes?

`get_adcp_capabilities`. The schema description calls it "the first call a buyer makes to discover an AdCP seller's supported protocols, auth model, version, and feature capabilities". The request is small: an optional `protocols` array of strings, an optional `context` object, an optional `ext`.

Two of its fields tell you something about how the protocol is versioned. `adcp_version` is a release-precision string. `adcp_major_version` is an integer and is marked deprecated in favour of it. A buyer's agent that pins a major version is using an interface AdCP is trying to retire.

## How does the agent find inventory?

`get_products`, which is the operation the whole discovery story hangs on.

The one field it requires is `buying_mode`, an enum with three values: `brief`, `wholesale`, `refine`. That single field decides what kind of conversation this is. In `brief` mode the buyer sends a natural-language `brief` string describing the campaign and lets the seller propose. In `wholesale` mode the buyer sends structured `filters` and expects a catalogue back. In `refine` mode the buyer sends a `refine` array of change requests against products from a previous response, which is how iteration is expressed on the wire.

The rest of the request is context the seller can use to answer well: a `brand` reference, a `catalog` of items to promote, an `account` reference, `preferred_delivery_types` in priority order, a `property_list` reference for externally managed property lists, and a `fields` projection so a buyer can ask for a narrower response.

`get_products` is one of only 7 operations in the 64 that publish async response arms. If the seller cannot answer inline, it can answer `submitted`, then `working`, then possibly `input-required`. Product discovery is allowed to be slow, and the protocol says so structurally rather than in a note.

What goes in the brief string versus what goes in the filters is the single most common authoring mistake in this operation, and [Brief Gateway](https://briefgateway.noetis.dev/spec/) covers that split. The per-field reference is on [AdCP Explorer](https://adcpexplorer.noetis.dev/operations/get-products/).

## What happens between finding inventory and buying it?

Creative, then governance.

The creative side runs through `list_creative_formats` to discover what the seller accepts, and `build_creative` to produce something that fits. `build_creative` takes a `message`, an optional `creative_manifest`, a `target_format_id` or a list of them, an optional `transformer_id`, and a `mode`. Its description says it generates, transforms or retrieves creative manifests "from a natural language brief to production-ready assets". `sync_creatives` then uploads and manages the assets in the seller's creative library. `build_creative` and `sync_creatives` both carry async arms, which is the correct call for anything that renders video.

Then the governance gate. `check_governance` is described in the schema as "the universal validation gate in AdCP", and the description says orchestrators and sellers call it before executing any campaign action. Two fields are required: `plan_id` and `caller`. The caller has to name itself. Around those sit `purchase_type`, `tool`, `payload`, `governance_context`, `phase`, `planned_delivery` and `modification_summary`.

This is the part of the flow that has no programmatic equivalent at all. There is no pre-flight budget-and-policy validation call in OpenRTB, because there is nothing to validate a plan against when the unit is one impression.

## How is the buy actually placed?

`create_media_buy`. Three fields are required, and each one is a design decision worth noticing.

`idempotency_key` is required. The protocol assumes this call will be retried and refuses to make double-spending the buyer's problem. `account` is required, because the billing relationship has to exist before the buy does. `brand` is required, which means AdCP will not let an anonymous agent create a media buy on behalf of nobody.

Everything else is the media plan: `packages` as an array of package requests, `total_budget`, `plan_id` tying it back to the governance check, `proposal_id`, and a set of fields that exist purely because real media buying has paperwork — `po_number`, `agency_estimate_number`, `invoice_recipient`, `io_acceptance`, `advertiser_industry`.

That paperwork block is, to me, the most persuasive evidence that this protocol was written by people who have actually booked media. A purchase order number is not a feature you invent from first principles.

## What happens when the seller cannot answer immediately?

It answers `submitted`, and the buy becomes a task.

In the released 3.1.10 registry, exactly 7 of the 64 operations carry `-async-response-submitted`, `-async-response-working` and `-async-response-input-required` schema arms: `build_creative`, `create_media_buy`, `get_products`, `get_signals`, `sync_catalogs`, `sync_creatives` and `update_media_buy`. The other 57 are expected to answer inline. That ratio is useful when you are sizing a client: most of the surface is a request-response API, and the long-running part is a short, known list.

The buyer's agent then polls with `get_task_status` or enumerates with `list_tasks`. `input-required` is the arm that matters operationally, because it is the protocol admitting that a human or an upstream system has to supply something before the buy can proceed. An agentic buying client that cannot handle `input-required` will hang on its first real campaign.

## How does the buyer close the loop?

`get_media_buy_delivery` returns impressions, spend, pacing and dimensional breakdowns, with a date range, a `time_granularity`, an `attribution_window` and optional per-package daily breakdown. `update_media_buy` modifies an active campaign with PATCH semantics, and is one of the 7 async operations, because changing a live buy is not instant.

Then `provide_performance_feedback` sends the buyer's own view of outcomes back to the seller. It requires `media_buy_id`, an `idempotency_key`, a `measurement_period` and a single `performance_index` number, with optional `package_id`, `creative_id`, `metric_type` and `feedback_source`.

One number. That is the entire outcome channel from buyer back to seller in AdCP 3.1.10, and it is a deliberate reduction: the buyer normalises its own measurement and shares a score rather than raw conversions.

The traffic in the other direction is much richer, which surprised me. `core/performance-standard.json` in the same release requires a `metric`, a `threshold` and a `vendor`, with an optional `standard` field so that MRC viewability and GroupM viewability are distinguishable on the wire. Buyers can filter products on `required_performance_standards` back at `get_products`, and a committed standard obliges the creative to carry that vendor's tracker assets. AdCP does not define measurement. It writes the measurement vendor into the buy contract and enforces the tracker path, which is a narrower and more achievable job.

## What does the same buy look like on the AAMP side?

Different shape, and worth one paragraph rather than a parallel column, because the two do not line up cleanly enough for a column to be honest.

In IAB Tech Lab's reference implementations, the buyer's agent finds the seller through an agent card served at `GET /.well-known/agent.json`, listing skills such as discovery, pricing, proposals, negotiation and deals, alongside supported deal types. It requests availability against a media kit, receives a quote, and the quote is explicitly non-binding with a 24-hour TTL. Then the two agents negotiate: the seller-agent documentation defines negotiation actions of `accept`, `counter`, `final_offer` and `reject`, with round limits and concession caps keyed off the buyer's access tier and its trust status in the registry. When they agree, the quote converts into a deal and the order walks a state machine of 12 states and 20 transitions.

Two asymmetries fall out of that. AAMP names the bargaining on the wire, and none of the strings `final_offer`, `counter_offer` or `negotiation_round` appears anywhere in AdCP's released 3.1.10 registry; AdCP's nearest equivalent is a `proposal` object that moves from draft to committed, finalised through the `refine` action on `get_products` and then executed by passing its `proposal_id` to `create_media_buy`. Going the other way, AdCP has a pre-flight governance gate and AAMP has no counterpart to it. Every AAMP term in this paragraph is sourced from a reference implementation rather than a ratified specification, and the tier table itself, with its round limits and concession caps, is published on [AAMP Explorer](https://aampexplorer.noetis.dev/negotiation/).

## What does this trace not show?

Several things, and the omissions are load-bearing.

It does not show a real payload. I traced required fields, enums and descriptions out of the released schemas; I did not capture traffic between two live agents.

It does not show error handling. The released 3.1.10 registry carries a `core/error.json` schema and 15 typed entries under `error-details/` — `budget-too-low`, `creative-rejected`, `stale-response` and `version-unsupported` among them — and a production client spends more code there than on the happy path.

It does not show authentication. The handshake advertises an auth model; how you actually hold credentials for a hundred publisher agents is an operations problem the protocol does not solve.

And it does not show the two stacks interoperating, because they do not. Neither corpus references the other. If you want the full wire-level comparison of both stacks side by side, it lives on [Agentic Ad Lab](https://agenticadlab.noetis.dev/guides/how-a-machine-buys-media/). What the term itself means, and who gets to define it, is on [what is agentic buying](/).
