---
title: 'Deal — The Booked Outcome in AAMP'
description: 'A Deal in AAMP is the seller-issued booking a Quote turns into. Deal ID, the three deal types, the twelve-value status vocabulary, and what AdCP has instead.'
answer: 'A Deal in AAMP is the seller-issued booking a Quote converts into, carrying a deal_id, OpenRTB activation parameters and a twelve-value status. AdCP has no Deal object; deal terms are assumed already agreed.'
pubDate: 2026-08-09
term: 'Deal'
alternateNames: ['deal ID', 'AAMP deal', 'programmatic deal']
category: commerce
cluster: gl-negotiation
keywords:
  - 'deal id agentic advertising'
  - 'aamp deal'
  - 'seller issued deal id'
  - 'programmatic guaranteed preferred deal private auction'
  - 'deal booking agent'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Deal.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/DealBookingRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/overview.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/deals.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/response-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/insertion-order.json'
related:
  - '/negotiation/quote/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/access-tier/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Quote', 'Negotiation Round', 'Access Tier', 'Trust Status']
reviewState: cto-reviewed
---

## What is a Deal in AAMP?

A Deal is what a Quote becomes when a buyer agent commits. The seller issues the `deal_id`; the buyer never mints one. The object lives in `spec/jsonschema/Deal.json` in `iab-agentic-primitives`, the shared contract library both AAMP reference agents import, and it is created by `POST /api/v1/deals` on the seller agent.

The buyer agent's documentation records why the direction of issuance matters: "Earlier versions of the buyer generated deal IDs locally and hoped the seller would accept them. The quote-then-book flow ensures the seller validates inventory availability, applies tier-based pricing, and issues the authoritative Deal ID. This matches the IAB OpenDirect pattern where the sell-side is the system of record."

**This is a reference implementation, not a ratified specification.** The repository holding the canonical Deal schema declares in its own README: "WORK IN PROGRESS — NOT YET RELEASED… APIs, schemas, and package layout are unstable and will change without notice."

## How does an AAMP Deal differ from an AAMP Quote?

Structurally, barely. `Deal.json` and `Quote.json` require the same five things, with the identifier swapped:

|                   | Quote                                                  | Deal                                                        |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| Required          | `quote_id`, `deal_type`, `product`, `pricing`, `terms` | `deal_id`, `deal_type`, `product`, `pricing`, `terms`       |
| Back-reference    | `deal_id` (set once booked)                            | `quote_id` (the quote this booked)                          |
| Activation fields | none                                                   | `openrtb_params`, `activation_instructions`, `supply_chain` |
| Status vocabulary | `QuoteStatus` (4 values)                               | `DealStatus` (12 values)                                    |

The difference is activation. A Deal carries the OpenRTB parameters and supply-chain (`schain`) object needed to make the agreement executable in a bidstream; a Quote carries only price and terms. Both carry `buyer_tier`, `rate_card_id` and `consent_context`.

## What are the three AAMP deal types?

`DealType` is a three-value enum, and the schema is explicit that the short form is the wire form: "The short wire encoding is canonical."

| Value | Name                    | Pricing     | Guarantee                             | OpenRTB `at`             |
| ----- | ----------------------- | ----------- | ------------------------------------- | ------------------------ |
| `PG`  | Programmatic Guaranteed | Fixed price | Guaranteed impressions                | `at=1` (first price)     |
| `PD`  | Preferred Deal          | Fixed price | Non-guaranteed, buyer gets first look | `at=1`                   |
| `PA`  | Private Auction         | Floor price | Competitive, invited buyers           | `at=3` (private auction) |

The `at` values and the guarantee semantics come from the seller agent's `docs/api/quotes.md`. The retired long-form encodings (`programmaticguaranteed`, `preferreddeal`, `privateauction`) are recorded in the schema as aliases and marked "NOT valid wire values" — a migration artifact left visible on purpose.

## What does a Deal status mean in AAMP?

`DealStatus` has twelve values: `proposed`, `negotiating`, `accepted`, `booked`, `active`, `makegood_pending`, `partially_cancelled`, `completed`, `rejected`, `failed`, `cancelled`, `expired`.

The schema documents where they came from, and this is the most useful sentence on the page for anyone assessing AAMP's maturity: "ONE deal status vocabulary, unioned from the four competing sets." The four were the buyer's `DealResponse.status`, the seller's `DealBookingStatus`, the buyer's `BuyerDealStatus`, and the linear TV extensions. Retired aliases are recorded rather than deleted — `delivering` maps to `active`, `booking` maps to `booked`, `quoted` is represented by `QuoteStatus` instead.

Two AAMP reference agents shipped four incompatible deal-status vocabularies between them, and the shared contract library exists in part to reconcile that. Treat any AAMP deal-status claim sourced from the agent repos alone as pre-reconciliation.

## What does booking a Deal actually require?

`DealBookingRequest` requires only two fields: `quote_id` and `idempotency_key`. Everything priced already lives on the referenced Quote. The optional fields are `buyer_identity`, `consent_context`, `audience_plan` and `notes`.

`buyer_identity` is where progressive identity revelation happens, and the schema states the guardrail: "The tier derived from these fields is capped server-side by the registry-verified trust status of the calling agent — it is never self-asserted." See [Access Tier](/negotiation/access-tier/) and [Trust Status](/negotiation/trust-status/).

## Does AdCP have a Deal object?

No. AdCP 3.1.10 registers no `Deal` schema and no deal-booking operation among its 64 published operations, and no property anywhere in the registry is named for a deal.

The word itself appears twelve times across eight files, almost always as an aside inside a description. Two of those uses carry weight, and neither is an object:

- `enums/response-type.json` includes `deal` as one of four things a publisher can ask a Trusted Match context match to return: "Deal ID for programmatic execution. Offers include deal metadata." That is a response shape, not a deal record.
- `core/insertion-order.json` describes AdCP's signing wrapper and says the opposite of a deal protocol: "The IO does not introduce new deal terms — all negotiated terms (performance standards, measurement terms, cancellation policy, pricing) live on the product and package."

AdCP's own Trusted Match description calls TMP a "real-time execution layer for activating pre-negotiated packages." Pre-negotiated. AdCP assumes the commercial agreement already exists and standardises what happens after it. AAMP standardises the agreement itself. That is the clearest structural split between the two stacks, and neither corpus acknowledges the other — nothing in the AAMP repositories references AdCP at all.

## Where does this definition come from?

| Claim                                                  | File                                               | Version pin                                  |
| ------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------- |
| Deal object, required fields, `DealType`, `DealStatus` | `spec/jsonschema/Deal.json`                        | `iab-agentic-primitives` `v0.5.0-1-g2fc7029` |
| Booking request fields                                 | `spec/jsonschema/protocol/DealBookingRequest.json` | same                                         |
| `at` values, guarantee semantics                       | `docs/api/quotes.md`                               | `seller-agent` `v2.4.1`                      |
| Sell-side as system of record                          | `docs/api/deals.md`                                | `buyer-agent` `v2.3.0-24-g0c3a154`           |
| No AdCP deal object                                    | `dist/schemas/3.1.10/` registry                    | AdCP `3.1.10` (published stable)             |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
