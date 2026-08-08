---
title: "Quote — AAMP's Non-Binding Price Offer"
description: "What a Quote is in IAB Tech Lab's AAMP agent stack: required fields, the 24-hour TTL, the three pricing types, and why AdCP has no equivalent object."
answer: "A Quote in AAMP is a seller agent's non-binding price offer for one product over one flight, valid for 24 hours and convertible into a Deal. AdCP defines no quote object."
pubDate: 2026-08-09
cluster: 'gl-negotiation'
keywords:
  - 'advertising quote agent'
  - 'aamp quote'
  - 'quote then book advertising'
  - 'seller agent quote api'
  - 'non-binding price offer advertising'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Quote.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/overview.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/deals.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/pricing-options/price-guidance.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/error-code.json'
related:
  - '/negotiation/deal/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/access-tier/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://adcpexplorer.noetis.dev/areas/media-buy/'
reviewState: cto-reviewed
term: 'Quote'
category: 'commerce'
alternateNames:
  - 'AAMP quote'
  - 'price quote'
seeAlso: ['Deal', 'Negotiation Round', 'Access Tier', 'Trust Status']
---

## What is a Quote in AAMP?

A Quote is the priced answer a seller agent gives a buyer agent for one product over one flight. The object is defined in `spec/jsonschema/Quote.json` in `iab-agentic-primitives`, the shared contract library that the AAMP buyer agent and seller agent both import. The seller agent's own reference is blunt about its status: "Quotes are non-binding price offers from the seller. They have a 24-hour TTL and can be converted into deals" (`docs/api/quotes.md`, seller-agent v2.4.1).

Non-binding is the load-bearing word. A Quote reserves nothing. It records a price the seller was willing to name at a moment in time, for a buyer at a particular identity level, and it decays.

**Every AAMP definition on this page comes from a reference implementation, not from a ratified specification.** `iab-agentic-primitives` — the repository that holds the canonical Quote schema — carries this banner in its own README: "WORK IN PROGRESS — NOT YET RELEASED. This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice."

## Which fields does an AAMP Quote carry?

Five of the sixteen properties on `Quote.json` are required.

| Field                                     | Required | What it holds                                                           |
| ----------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `quote_id`                                | Yes      | Seller-issued quote identifier                                          |
| `deal_type`                               | Yes      | `PG`, `PD` or `PA`                                                      |
| `product`                                 | Yes      | `ProductRef` — `product_id`, `name`, optional `inventory_type`          |
| `pricing`                                 | Yes      | `QuotePricing` — base and final CPM or CPP, pricing model, pricing type |
| `terms`                                   | Yes      | `QuoteTerms` — flight dates, impressions or GRPs, guaranteed flag       |
| `status`                                  | No       | `available`, `booked`, `expired` or `declined`                          |
| `expires_at`                              | No       | End of the acceptance window                                            |
| `buyer_tier`                              | No       | The `AccessTier` the price was computed for                             |
| `deal_id`                                 | No       | Set once the Quote has been booked                                      |
| `rate_card_id`                            | No       | Private rate card the Quote priced against                              |
| `consent_context`                         | No       | GPP, TCF and US Privacy strings riding with the offer                   |
| `media_type`                              | No       | `digital`, `ctv` or `linear_tv`                                         |
| `seller_id`                               | No       | Registry-issued id of the quoting agent                                 |
| `availability`, `created_at`, `linear_tv` | No       | Availability, issue time, linear TV detail                              |

## How long is an AAMP Quote valid?

Twenty-four hours. The seller agent documents a 24-hour TTL and stamps `expires_at` on issue; the example response in `docs/api/quotes.md` shows `created_at` of `2026-04-01T00:00:00Z` against `expires_at` of `2026-04-02T00:00:00Z`. `QuoteStatus` then carries the outcome: `available`, `booked`, `expired`, `declined`.

The TTL is a property of the reference implementation, not of a published standard. Nothing in the AAMP corpus states that 24 hours is normative for other implementers.

## What does the price on a Quote actually mean?

`QuotePricing` splits price into `base_cpm` and `final_cpm` (or `base_cpp` and `final_cpp` for linear TV), and both are nullable. The reason is `pricing_type`, a three-value enum that changes what a buyer agent is allowed to infer:

| `pricing_type` | Meaning in the schema                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fixed`        | "price is set by the seller, use as-is"                                                                                                                       |
| `floor`        | "minimum price; negotiation expected above this level"                                                                                                        |
| `on_request`   | "no price available; buyer must negotiate before any pricing exists (pricing fields are None — buyers must never fabricate a price for on_request inventory)" |

Money on an AAMP Quote is an integer, not a float. The shared `Money` type carries `amount_micros`, where 1,000,000 micros equals one currency unit, and the schema documentation says why: "Float is BANNED on the wire for money: IEEE 754 floating point is non-deterministic for money math… and the two source repos used `float` end-to-end; that defect must not be fossilized into the spec."

That is worth reading twice. The canonical contract exists partly to correct the two reference implementations it was extracted from.

## How does a Quote become a Deal?

The AAMP control plane is quote-then-book. `POST /api/v1/quotes` issues the Quote; `POST /api/v1/deals` books it. The booking request needs only two required fields, `quote_id` and `idempotency_key`, because everything priced already lives on the Quote.

The buyer agent's documentation explains the design choice directly: "Earlier versions of the buyer generated deal IDs locally and hoped the seller would accept them. The quote-then-book flow ensures the seller validates inventory availability, applies tier-based pricing, and issues the authoritative Deal ID. This matches the IAB OpenDirect pattern where the sell-side is the system of record."

Between quote and book, the buyer may open a negotiation. See [Negotiation Round](/negotiation/negotiation-round/) for the round mechanics and [Access Tier](/negotiation/access-tier/) for the caps that bound them.

## Does AdCP have a quote object?

No. AdCP 3.1.10 registers 64 operations across ten areas, and none of them issues, retrieves or expires a quote. There is no `Quote` schema in `dist/schemas/3.1.10/`.

AdCP prices inventory a different way. Price is a property of a product, expressed through nine pricing-option schemas registered in the 3.1.10 index (`cpm`, `cpc`, `cpa`, `cpv`, `cpcv`, `cpp`, `vcpm`, `flat-rate`, `time`). A CPM option carries `fixed_price` when the price is set and omits it when the inventory is auction-based, in which case `floor_price` and `price_guidance` may appear. `price-guidance.json` is four numbers — `p25`, `p50`, `p75`, `p90` — described as "Pricing guidance for auction-based bidding. Helps buyers calibrate bids with historical percentiles."

So the two stacks answer "what will this cost" with different artifacts. AAMP answers with a seller-issued, buyer-specific, expiring offer. AdCP answers with a published price or a distribution of historical clearing prices, and never with an object addressed to one buyer.

The gap is one AdCP has noticed. `enums/error-code.json` registers `REQUOTE_REQUIRED`, raised when an `update_media_buy` changes the budget, flight, volume or targeting envelope the original price was set against — "the seller is declining the requested shape at that price". The same entry closes with the admission: "AdCP 3.1 does not define an amendment-quote artifact that can be attached to `update_media_buy`." There is a failure mode named for a missing quote object, and no quote object to resolve it with.

## Where does this definition come from?

| Claim                                        | File                             | Version pin                                  |
| -------------------------------------------- | -------------------------------- | -------------------------------------------- |
| Quote object and field list                  | `spec/jsonschema/Quote.json`     | `iab-agentic-primitives` `v0.5.0-1-g2fc7029` |
| 24-hour TTL, deal types, pricing calculation | `docs/api/quotes.md`             | `seller-agent` `v2.4.1`                      |
| Quote and deal endpoints                     | `docs/api/overview.md`           | `seller-agent` `v2.4.1`                      |
| Sell-side as system of record                | `docs/api/deals.md`              | `buyer-agent` `v2.3.0-24-g0c3a154`           |
| Absence of a quote in AdCP                   | `dist/schemas/3.1.10/index.json` | AdCP `3.1.10` (published stable)             |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
