---
title: 'Media Buy: the AdCP campaign object'
description: "A media buy is AdCP's purchased-campaign container: total budget, lifecycle status, an optimistic-concurrency revision, and the packages that carry the inventory."
answer: 'In AdCP, a media buy is the purchased-campaign object created by create_media_buy, carrying the total budget, lifecycle status, an optimistic-concurrency revision and an array of packages.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Media Buy'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['media buy object', 'AdCP campaign object', 'media_buy']
keywords:
  - 'agentic media buying objects'
  - 'media buy definition adcp'
  - 'adcp media buy'
  - 'media buy object'
  - 'adcp media buy schema'
  - 'create_media_buy response fields'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-media-buys-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/update-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/update-media-buy-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/proposal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy-available-action.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/media-buy-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/media-buy-health.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Order.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
related:
  - '/media-buying/package/'
  - '/media-buying/product/'
  - '/negotiation/deal/'
  - '/concepts/opendirect/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['package', 'product', 'deal']
reviewState: cto-reviewed
---

A media buy is the object AdCP produces when a buyer commits to spend: money and lifecycle on the buy, inventory one level down in [`packages[]`](/media-buying/package/). [`create_media_buy`](https://adcpexplorer.com/operations/create-media-buy/) mints one; `get_media_buys` and `update_media_buy` read and edit it. The canonical schema is `dist/schemas/3.1.13/core/media-buy.json`, titled "Represents a purchased advertising campaign": 17 properties, 6 required.

AdCP's own [glossary](https://docs.adcontextprotocol.org/docs/reference/glossary) describes it more broadly, as "a complete advertising campaign containing packages, budget, targeting, and creative assets". The object carries neither targeting nor creative fields; both live on the package.

## How a media buy is created

`create_media_buy` takes the total budget as `{"amount": 50000, "currency": "USD"}`, requires both halves and both flight dates, and carries the packages inline. The seller mints `media_buy_id` and returns the buy.

The request also accepts a `proposal_id`: a proposal in the `committed` state means firm pricing with inventory reserved until its `expires_at`, so a buyer that has already agreed terms passes the proposal rather than re-stating it.

## Required fields and response shapes

The six required fields in `core/media-buy.json` are `media_buy_id`, `status`, `confirmed_at`, `total_budget`, `packages` and `revision`. The other eleven are optional — `account`, `health`, `impairments`, `rejection_reason`, `cancellation`, `context`, `invoice_recipient`, `creative_deadline`, `created_at`, `updated_at`, `ext` — so `revision` is guaranteed on every buy and the timestamps are not.

`confirmed_at` is required but may be null: the key is present on every media buy and carries `null` until "seller commitment occurs in deferred/manual approval flows". A client that treats a missing key and a null value alike reads a buy still awaiting approval as committed.

No operation payload in the release refers to `core/media-buy.json`. Only the file's own `$id` and the schema registry index point at it, each of the three operations that return a media buy inlines its own object, and nothing marks `core/media-buy.json` deprecated.

| Shape                             | Where it lives      | Properties | Required |
| --------------------------------- | ------------------- | ---------- | -------- |
| `core/media-buy.json`             | registry index only | 17         | 6        |
| `get_media_buys` → `media_buys[]` | inline              | 25         | 7        |
| `create_media_buy` success        | inline              | 17         | 4        |
| `update_media_buy` success        | inline              | 14         | 2        |

The create response drops six core fields (`cancellation`, `created_at`, `health`, `impairments`, `rejection_reason`, `updated_at`) and stops requiring `status` and `total_budget`. `update_media_buy` guarantees `media_buy_id` and `revision` and nothing else. `get-media-buys-response.json` is a strict superset of core and it is the shape that lands in the handler; its eight extra fields are `currency` (a required ISO 4217 code, the denomination `total_budget` lacks), `start_time` and `end_time` derived from the packages, `available_actions` and `valid_actions`, `status_as_of` for when the seller last refreshed `status`, and the on-request `history` and `webhook_activity`.

`available_actions` tells a buyer which operations this buy will accept now and on what terms. Each entry carries a `mode` of `self_serve`, `conditional_self_serve` or `requires_approval`, so a client knows before it calls whether a change needs seller approval. `valid_actions` is the same list as bare strings, carries a "Removed in 4.0" note, and consumers MUST prefer `available_actions`.

## Currency and flight dates

`core/media-buy.json` types `total_budget` as `{"type": "number", "minimum": 0}` and carries no `currency` property, while the request requires a currency and the response schema states the flattening: "this response field is the flattened scalar amount, with currency promoted to the sibling currency field." That sibling is required on `get_media_buys` and absent from core, so a budget modelled off core alone has no denomination. AAMP models the same money as a `Money` object in integer micro-units, on a schema that bans float for money outright: "IEEE 754 floating point is non-deterministic for money math."

`create_media_buy` requires both flight dates and neither appears on `core/media-buy.json`, while `core/package.json` still says of its own `start_time` that "When omitted, the package inherits the media buy's start_time."

## Status and health

`enums/media-buy-status.json` lists seven values: `pending_creatives`, `pending_start`, `active`, `paused`, `completed`, `rejected`, `canceled`. There is no `draft`. A media buy does not exist until `create_media_buy` succeeds, so planning happens against [products](/media-buying/product/) and proposals.

`health` runs on a second axis: `ok` or `impaired`, aggregated from `impairments[]` and independent of `status` — "Orthogonal to status — a paused, pending, or active buy can each be impaired." `impairments[]` is scoped one level down, "open impairments — upstream dependency state changes that affect delivery for at least one package on this buy", so one poll of the buy surfaces downstream degradation without walking every package.

`health` is optional on `core/media-buy.json`, omitted from the create response, and described as "Always set" in the enum file. It carries `"default": "ok"` with a description scoped to "when impairments[] is empty", so an absent `health` reads as healthy rather than as unreported. Nothing ties `rejection_reason` to `rejected` or `cancellation` to `canceled` either, so both may be absent on a conformant payload.

## Updating a media buy

`update-media-buy-request.json` carries 16 properties and requires three: `idempotency_key`, `account`, `media_buy_id`. Pause and resume run through `paused`, `canceled` is "irreversible" and a seller MAY refuse it with `NOT_CANCELLABLE`, both flight dates move, and `new_packages[]` adds inventory mid-flight against sellers advertising `add_packages`. The update request carries no `total_budget`; the buy's money is fixed at create.

`revision` is the "monotonically increasing optimistic concurrency token", `minimum: 1`, and the only field present on all four shapes. On the update request it is optional, "for backward compatibility", so a seller owes a `CONFLICT` only when the client supplies it. The `idempotency_key` is required on the same request and stops a retry from booking the same change twice.

## AAMP's Order

`Order`, defined in `spec/jsonschema/Order.json` as a "Campaign container (insertion order) holding one or more lines", is derived from IAB [OpenDirect](/concepts/opendirect/) 2.1 and sits in a library that is [unreleased](https://aampexplorer.com/versions/), against AdCP's published 3.1.13.

`spec/openapi/iab-agentic-api.yaml`, the AAMP wire contract, has 13 paths and never names `Order`. The seller agent, the only implementation that creates orders, exposes `POST /api/v1/orders` with a body of three optional fields and a 200 response schema of `{}`.

|                            | AdCP media buy                         | AAMP Order                                                                   |
| -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| Properties / required      | 17 / 6                                 | 14 / 6: `order_id`, `account_id`, `name`, `budget`, `start_date`, `end_date` |
| Flight dates on the object | absent                                 | `start_date`, `end_date`, both required                                      |
| Budget                     | `total_budget`, a bare number          | `budget`, a `Money` object in integer micros                                 |
| Children                   | `packages[]` embedded by value         | `Line` objects referencing `order_id`                                        |
| Status vocabulary          | 7 values, no `draft`, spelt `canceled` | 11 values, has `draft`, spelt `cancelled`                                    |
| Concurrency token          | `revision`, required                   | none                                                                         |
| Deal linkage and consent   | neither on the object                  | optional [`deal_id`](/negotiation/deal/) and `consent_context`               |
| Referenced by an operation | no                                     | no                                                                           |
