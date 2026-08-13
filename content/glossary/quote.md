---
title: "Quote (AAMP): the seller's non-binding price offer"
description: "A quote in AAMP is a seller agent's non-binding, expiring price offer: 16 fields, five required, booked into a deal by quote_id. AdCP defines no equivalent object."
answer: "A Quote in AAMP is a seller agent's non-binding, expiring price offer for one product over one flight, which a buyer books into a Deal by quote_id. AdCP defines no equivalent object."
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'gl-negotiation'
keywords:
  - 'advertising quote agent'
  - 'aamp quote'
  - 'quote then book advertising'
  - 'seller agent quote api'
  - 'non-binding price offer advertising'
  - 'get_price_quote adcp'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Quote.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteResponse.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/PROTOCOL_RECONCILIATION.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/services/quote_service.py'
  - 'https://iabtechlab.com/standards/dealsapi/'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/design-principles.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/pricing-options/price-breakdown.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/package-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/package-update.json'
related:
  - '/negotiation/deal/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/access-tier/'
  - '/media-buying/product/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://adcpexplorer.com/areas/media-buy/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
reviewState: cto-reviewed
term: 'Quote'
category: 'commerce'
alternateNames:
  - 'AAMP quote'
  - 'price quote'
  - 'get_price_quote'
seeAlso: ['Deal', 'Negotiation Round', 'Access Tier', 'Product']
---

A quote in AAMP is the priced answer a seller agent gives for one product over one flight. The schema leads with the word non-binding: "A non-binding price quote from a seller (Deals API v1.0 quote phase)." A quote is a price and not a reservation — the seller has priced a window and holds nothing inside it, and the same availability can be quoted to another buyer. `Quote.json` states that "`quote_id` is seller-issued", and `QuoteRequest.json` states that the buyer never proposes one. The object belongs to the IAB Tech Lab's Agentic Advertising Management Protocols and sits in the `iab-agentic-primitives` v0.5.0 contract library, [unreleased](https://aampexplorer.com/versions/) at that version.

The price is buyer-specific. The base number comes from the private rate card named in `rate_card_id`, and the seller recomputes both discount percentages on every request, the first from the buyer's [access tier](/negotiation/access-tier/) and the second from the impressions asked for, so two buyers requesting the same product over the same flight get different numbers.

The lineage the description claims is thinner than it sounds. IAB Tech Lab's [published overview of Deals API v1.0](https://iabtechlab.com/standards/dealsapi/), finalised on 6 February 2026, says the MVP "does NOT support proposals, revisions, or negotiations", so the quote phase AAMP names is not in the published specification it names it from.

## What a quote contains

| Field                                                                                                | Required | What it holds                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quote_id`                                                                                           | Yes      | Seller-minted identifier; the buyer never proposes one                                                                                                                                                                                                            |
| `deal_type`                                                                                          | Yes      | `PG` (programmatic guaranteed), `PD` (preferred deal) or `PA` (private auction). The long-form strings are not valid wire values                                                                                                                                  |
| `product`                                                                                            | Yes      | `ProductRef`: `product_id`, `name`, optional `inventory_type`                                                                                                                                                                                                     |
| `pricing`                                                                                            | Yes      | `QuotePricing`: base and final CPM or CPP as `Money`, `pricing_model`, `pricing_type` — `fixed` to use as-is, `floor` to invite negotiation above the number, `on_request` to leave the price fields empty — two discount percentages and a free-text `rationale` |
| `terms`                                                                                              | Yes      | `QuoteTerms`: flight dates, impressions or GRPs, guaranteed flag                                                                                                                                                                                                  |
| `status`                                                                                             | No       | `available`, `booked`, `expired`, `declined`; defaults to `available`                                                                                                                                                                                             |
| `expires_at`                                                                                         | No       | Nullable, `default: null`                                                                                                                                                                                                                                         |
| `buyer_tier`                                                                                         | No       | The `AccessTier` the price was computed for; defaults to `public`                                                                                                                                                                                                 |
| `media_type`                                                                                         | No       | `digital`, `ctv` or `linear_tv`; defaults to `digital`                                                                                                                                                                                                            |
| `deal_id`, `rate_card_id`, `consent_context`, `seller_id`, `availability`, `created_at`, `linear_tv` | No       | Booking linkage, rate card, consent strings, quoting agent, availability, issue time, linear TV detail                                                                                                                                                            |

Four of the five required fields are nested objects defined in the same library. `on_request` pricing carries an instruction with it: "buyers must never fabricate a price for `on_request` inventory".

Eleven of the sixteen fields are optional and most carry defaults, so an unset field and a deliberately defaulted one are indistinguishable on the wire. The minimum viable quote is a public-tier digital offer marked available.

The shared `Money` type carries `amount_micros` and a three-letter `currency`, so every price on the wire is an integer: "Float is BANNED on the wire for money [...] that defect must not be fossilized into the spec."

## Quote lifecycle

A quote runs through four states. `status` defaults to `available`, moves to `booked` when a buyer commits, and ends at `expired` or `declined`.

No schema field fixes a lifetime. `QuoteResponse.json` says only that quotes "are ephemeral — the seller enforces a TTL and answers a `quote_expired` error after it elapses", and `expires_at` is `anyOf [date-time, null]` with `default: null`, so a quote carrying no expiry validates. The only number anywhere is 24 hours, in one line of `src/ad_seller/services/quote_service.py`: `expires_at = now + timedelta(hours=24)`.

Two status codes kill a quote: `quote_expired`, HTTP 410, once it elapses, and `contention`, HTTP 409, "the quote was already booked". Either one sends the buyer back for a new quote, and because the discounts are recomputed per request the replacement can carry a different price. [Deal](/negotiation/deal/) covers what a quote turns into at booking, and a [negotiation round](/negotiation/negotiation-round/) anchors on the same `quote_id` in between.

## Requesting a quote

`QuoteRequest.required` is `idempotency_key`, `product_id` and `deal_type`, and `QuoteResponse.required` is `["quote"]`, a single wrapped object.

`docs/api/quotes.md` in the seller agent is the only public prose description of the endpoint, and it predates that contract: it types `target_cpm` as a `float` and shows a response of `"base_cpm": 12.0, "final_cpm": 10.26` where the schema requires integer `amount_micros`, it documents a request table with no `idempotency_key`, and it puts the quote at the top level of the response. The code in the same repository moved to the canonical contract and the prose did not — `docs/api/openapi.json` types `QuotePricing.base_cpm` as a `$ref` to `Money`.

## AdCP defines no quote object

AdCP 3.1.13 contains no quote schema, none of its 64 published operations issues one, and `docs/protocol/design-principles.mdx` rules the idea out under Principle 2. It quotes the proposal it rejects — "Proposing a `get_price_quote` task between `get_products` and `create_media_buy` — a configure-price-quote step where the buyer submits targeting and the seller returns a firm rate" — and answers it with composition: "Most of what that proposal asks for already exists: account-scoped rate cards via `account`, firm prices via `pricing_options`, the `pricing_option_id` lock at commit time, and `buying_mode: "refine"` for the iteration loop." The [product](/media-buying/product/) does that work instead, through `is_custom`, `brief_relevance` and an `expires_at` that says only that the product "may no longer be available for purchase", with no status machine behind it.

The same document lists three conditions under which a quote step would be justified and concedes "Those three are real gaps". AAMP's quote answers all three, through `terms.flight_start`, `flight_end` and `impressions` as pricing inputs, through `expires_at` with a four-state status behind it, and through `pricing.rationale`. AdCP 3.1.13 stands differently on each:

- Pricing that depends on flight dates and budget the buyer has not committed yet is partly covered. `volume` is a named adjustment, but the price lives on the product, across nine pricing-option schemas: `cpm`, `cpc`, `cpa`, `cpv`, `cpcv`, `cpp`, `vcpm`, `flat-rate` and `time`.
- A time-bound firm rate before commitment is open. `valid_until` appears nowhere under `pricing-options/`, and `enums/error-code.json` records the consequence as `REQUOTE_REQUIRED`, raised when an `update_media_buy` breaks the envelope the original price was set against: "AdCP 3.1 does not define an amendment-quote artifact that can be attached to update_media_buy."
- An auditable explanation of what drove the price is closed, and machine-checkable. The `rate_basis` field the condition asked for never shipped under that name; `price-breakdown.json` landed instead, an ordered adjustment array whose invariant is that list price plus adjustments in sequence equals fixed price.
