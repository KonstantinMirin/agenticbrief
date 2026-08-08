---
title: 'Media Buy — the AdCP Campaign Object, Field by Field'
description: "Media buy is AdCP's campaign container: 17 fields, 6 required, packages nested inside. Definition from the 3.1.10 schema, with the AAMP Order counterpart."
answer: "A media buy is AdCP's purchased-campaign object. It holds the total budget, a status, a concurrency revision and an array of packages. AdCP 3.1.10 defines 17 fields on it, 6 required."
pubDate: 2026-08-09
term: 'Media Buy'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['media buy object', 'AdCP campaign object']
keywords:
  - 'media buy definition adcp'
  - 'adcp media buy'
  - 'media buy object'
  - 'adcp media buy schema'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/media-buy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/media-buy-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Order.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
related:
  - '/media-buying/package/'
  - '/media-buying/product/'
  - 'https://adcpexplorer.noetis.dev/operations/create-media-buy/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['package', 'product', 'account']
reviewState: cto-reviewed
---

## What is a media buy in AdCP?

A media buy is the object AdCP produces when a buyer commits to spend. `create_media_buy` returns one, `get_media_buys` lists them, `update_media_buy` changes them. The schema is `/schemas/3.1.10/core/media-buy.json`, and its own title line reads "Represents a purchased advertising campaign".

The media buy is a container. Money and lifecycle state sit on it. Inventory sits one level down, in the `packages[]` array. AdCP 3.1.10 puts 17 properties on it and marks 6 of them required.

The version pin matters here. `dist/schemas/latest.json` in the AdCP repository reports `{"latest":"3.1.10","latest_stable":"3.1.10","channel":"stable"}`, and every field count on this page is derived from `dist/schemas/3.1.10/`, not from the unreleased `main` branch.

## Which media buy fields are required?

| Field          | Type             | Required | What it holds                                         |
| -------------- | ---------------- | -------- | ----------------------------------------------------- |
| `media_buy_id` | string           | yes      | Seller's unique identifier for the media buy          |
| `status`       | media-buy-status | yes      | One of seven lifecycle states                         |
| `confirmed_at` | string \| null   | yes      | ISO 8601 timestamp when the seller committed          |
| `total_budget` | number           | yes      | Total budget amount                                   |
| `packages`     | package[]        | yes      | Array of packages within this media buy               |
| `revision`     | integer          | yes      | Monotonically increasing optimistic concurrency token |

`confirmed_at` is the one worth reading twice. It is required and nullable at the same time. The field has to be present on every media buy, carrying `null` until the seller commits. A buyer agent that treats "field absent" and "field null" as the same case will pass validation and still get the commitment state wrong.

The other eleven fields are optional: `account`, `health`, `impairments`, `rejection_reason`, `cancellation`, `context`, `invoice_recipient`, `creative_deadline`, `created_at`, `updated_at` and `ext`.

Note which side of that line the timestamps fall on. `created_at` and `updated_at` are optional. `revision` is required. AdCP treats concurrency control as protocol business and audit timestamps as a courtesy.

## What are the seven media buy statuses?

`media-buy-status.json` enumerates exactly seven values: `pending_creatives`, `pending_start`, `active`, `paused`, `completed`, `rejected`, `canceled`.

There is no draft state. A media buy does not exist until `create_media_buy` succeeds, so there is nothing to model before commitment. Planning happens against products, not against a half-built buy.

`rejected` pairs with the optional `rejection_reason` string, and `canceled` pairs with the optional `cancellation` object. Neither is required, so a seller can reject a buy without saying why and still be conformant.

## Why does a media buy carry a revision number?

Because AdCP assumes more than one agent may be operating the same account at the same time. `revision` is described in the schema as a "Monotonically increasing optimistic concurrency token" — a buyer agent reads a media buy at revision 7, submits a change conditioned on 7, and loses the race if another agent already moved it to 8.

This pairs with the idempotency key. AdCP's own glossary defines it as "a unique, unguessable identifier (UUID v4 or equivalent CSPRNG output) attached to every mutating AdCP request". Revision protects against concurrent writers. The idempotency key protects against the same writer retrying.

Neither mechanism is present on the AAMP side, which is the more interesting fact about them.

## What are impairments on a media buy?

`impairments[]` is described as "open impairments — upstream dependency state changes that affect delivery for at least one package on this buy", with a sibling `health` object holding an "aggregate health based on open impairments[]".

The scoping is deliberate and slightly counterintuitive. An impairment is caused at the package level and surfaced at the buy level, so a buyer agent polling one object learns that something downstream is degraded without walking every package.

Read the default carefully. `health` is optional but carries a schema default of `ok`, and the description says it "defaults to 'ok' when impairments[] is empty" — so an absent `health` reads as healthy, not as unreported. The schema also makes `health` orthogonal to `status`: a paused, pending or active buy can each be impaired.

## What is the AAMP counterpart to a media buy?

The closest object is the AAMP `Order`, defined in `iab-agentic-primitives` at `spec/jsonschema/Order.json` and summarised there as "Campaign container (insertion order) holding one or more lines". It derives from IAB OpenDirect 2.1.

|                   | AdCP Media Buy                            | AAMP Order                                                                    |
| ----------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| Schema            | `dist/schemas/3.1.10/core/media-buy.json` | `spec/jsonschema/Order.json`                                                  |
| Source status     | Published stable release 3.1.10           | Reference implementation library marked "WORK IN PROGRESS — NOT YET RELEASED" |
| Properties        | 17                                        | 14                                                                            |
| Required          | 6                                         | 6 (`order_id`, `account_id`, `name`, `budget`, `start_date`, `end_date`)      |
| Budget type       | `total_budget`, a plain number            | `budget`, a `Money` object in exact micros                                    |
| Children          | `packages[]` embedded in the object       | `Line` objects referencing `order_id`                                         |
| Concurrency token | `revision`, required                      | none                                                                          |
| Deal linkage      | none, AdCP has no deal object             | optional `deal_id`, "Deal this order fulfils, if deal-led"                    |
| Consent           | not carried on the object                 | optional `consent_context` carrying TCF, GPP and US Privacy strings           |

Two of those rows are the whole architectural difference in miniature. AAMP's Order can point at a deal because AAMP has a negotiation phase that produces one. AdCP has no negotiation object at any layer, so there is nothing for a media buy to reference. In the other direction, AAMP's Order carries privacy consent strings inline and AdCP's media buy does not.

Nothing in the AAMP corpus references AdCP, and nothing in AdCP references AAMP. This mapping is an outside reading of two codebases that have never acknowledged each other.

## How is this term sourced?

AdCP side: `dist/schemas/3.1.10/core/media-buy.json` and `dist/schemas/3.1.10/enums/media-buy-status.json`, from `adcontextprotocol/adcp` at commit `f1a35ab`. Version 3.1.10, the published stable release per `dist/schemas/latest.json`. Prose definitions quoted from `docs/reference/glossary.mdx`.

AAMP side: `spec/jsonschema/Order.json` from `IABTechLab/iab-agentic-primitives` at commit `2fc7029`, tag `v0.5.0-1-g2fc7029`. That repository's README opens with "WORK IN PROGRESS — NOT YET RELEASED. This library is under active construction ... It is not yet an official IAB Tech Lab release." It is also not listed in the AAMP hub README, even though both IAB reference agents pin it as their wire contract. Every AAMP term on this site comes from a reference implementation, not from a ratified specification.
