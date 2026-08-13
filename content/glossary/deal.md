---
title: 'Deal'
description: 'A deal is a negotiated buying arrangement identified by a seller-issued deal ID. In AAMP it is the booking a quote becomes: five required fields, three deal types, twelve statuses.'
answer: 'A deal is a negotiated buying arrangement between one buyer and one seller, identified by a seller-issued deal ID the buyer activates in its DSP. In AAMP it is the booking record a quote becomes; AdCP defines no deal object.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Deal'
alternateNames: ['deal ID', 'AAMP deal', 'booked deal']
category: commerce
cluster: gl-negotiation
keywords:
  - 'deal id agentic advertising'
  - 'aamp deal'
  - 'seller issued deal id'
  - 'deal booking agent'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Deal.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Quote.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/DealBookingRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/state/DealLifecycle.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/services/deal_service.py#L299'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/services/deals_api.py#L172'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/quotes.py#L30'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/com/iabtechlab/openrtb/v2.6/openrtb.proto#L1026'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/deals.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/proposal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/insertion-order.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/response-type.json'
related:
  - '/negotiation/quote/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/access-tier/'
  - '/negotiation/trust-status/'
  - '/realtime/artf-intent/'
  - '/media-buying/media-buy/'
  - '/concepts/opendirect/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Quote', 'Negotiation Round', 'Access Tier', 'Trust Status', 'Media Buy']
reviewState: cto-reviewed
---

A deal is a negotiated buying arrangement between one buyer and one seller, identified by a deal ID the seller issues and the buyer activates in its DSP. Seller-issued identifiers follow IAB [OpenDirect](/concepts/opendirect/), which the buyer agent's [documentation](https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/deals.md) names as the precedent: "the IAB OpenDirect pattern where the sell-side is the system of record".

In AAMP the deal is a schema object: the booking record a [quote](/negotiation/quote/) becomes once a buyer agent commits to it. [`spec/jsonschema/Deal.json`](https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Deal.json) requires five fields — `deal_id`, `deal_type`, `product`, `pricing`, `terms` — and settles who mints the identifier in a single line: "ID minting: `deal_id` is seller-issued." The seller agent creates one at `POST /api/v1/deals`. The schema sits in `iab-agentic-primitives` v0.5.0, [unreleased](https://aampexplorer.com/versions/) at that version.

## Three deal types

`deal_type` is a three-value enum, and the schema states that the short form is the wire form: "The short wire encoding is canonical."

| Value | Expansion               | Pricing     | Guarantee                             |
| ----- | ----------------------- | ----------- | ------------------------------------- |
| `PG`  | Programmatic Guaranteed | Fixed price | Guaranteed impressions                |
| `PD`  | Preferred Deal          | Fixed price | Non-guaranteed, buyer gets first look |
| `PA`  | Private Auction         | Floor price | Competitive, invited buyers           |

The retired long-form encodings (`programmaticguaranteed`, `preferreddeal`, `privateauction`) are recorded in the schema as aliases and marked "NOT valid wire values".

## What booking adds to a quote

A booked deal carries the same five required fields as the quote it came from, with `deal_id` in place of `quote_id`, and each object back-references the other. What booking adds is activation — `openrtb_params`, `activation_instructions` and `supply_chain` — plus a status vocabulary of twelve values against the quote's four. The only property that does not survive booking is `availability`, which a booked deal has already consumed.

Three fields carry activation. `openrtb_params` holds the bidstream parameters and `supply_chain` is the OpenRTB `schain` object, "optional so pre-schain deals still validate". `activation_instructions` is a string-to-string map with no schema description; the seller agent fills it with a sentence of English per DSP, keyed `ttd`, `dv360` and `xandr`, telling a trader where to paste the deal ID.

## How a deal is booked

`DealBookingRequest` asks for `quote_id` and an `idempotency_key`, and nothing else. Its description: "This is the commit point — the referenced quote becomes bound." `buyer_identity`, `consent_context`, `audience_plan` and `notes` are optional, because everything priced already sits on the quote. `buyer_identity` holds the identifying details a buyer chooses to reveal, which set the [access tier](/negotiation/access-tier/) its price is computed at, and the schema caps what they can buy: "The tier derived from these fields is capped server-side by the registry-verified trust status of the calling agent — it is never self-asserted."

The `deal_id` then becomes a bidstream object: the RTB framework's [intent](/realtime/artf-intent/) enum includes `ACTIVATE_DEALS`, `SUPPRESS_DEALS`, `ADJUST_DEAL_FLOOR` and `ADJUST_DEAL_MARGIN`.

## Deal status

`DealStatus` enumerates `proposed`, `negotiating`, `accepted`, `booked`, `active`, `makegood_pending`, `partially_cancelled`, `completed`, `rejected`, `failed`, `cancelled`, `expired`. Its docstring describes the enum as "ONE deal status vocabulary, unioned from the four competing sets", and it records retired aliases rather than dropping them, including `partially_canceled` to `partially_cancelled`, a US/UK spelling split that appears in two agents' enums.

`DealStatus` does not cover every status in circulation. The seller agent's own `DealBookingStatus` in `models/quotes.py` carries a fifth value, `confirmed`, that the twelve do not include, and the deal export and push paths in that repository compare a status against the same literal. Its ad server client works from a fourth vocabulary again, normalising ad server statuses to `draft`, `active`, `paused` and `archived`, three of which have no counterpart in `DealStatus`.

`state/DealLifecycle.json` is the one file that says what the ad ops states are for, moving `active` to `makegood_pending` on "Makegood requested for under-delivery" and back on "Makegood resolved, delivery resumed".

## Auction type on a booked deal

`openrtb_params.at` tells a DSP whether to bid a booked deal's agreed price or bid into an auction. OpenRTB 2.6, vendored by IAB Tech Lab into the agentic RTB framework, defines field 6 of the [`Deal` message](https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/com/iabtechlab/openrtb/v2.6/openrtb.proto#L1026) as "1 = First Price, 2 = Second Price Plus, 3 = the value passed in bidfloor is the agreed upon deal price", so `at=3` is the fixed price and `at=1` is the first-price auction a private auction runs. `Deal.json` defaults `OpenRTBParams.at` to 3, and the seller agent's `deals_api.py` follows that mapping.

The published prose disagrees, and it is the side that is wrong: [`docs/api/quotes.md`](https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md) and the `deal_service.py` path that `POST /api/v1/deals` calls send `at=1` for programmatic guaranteed and preferred deals and gloss `at=3` as "private auction". At `at=1` the agreed number is only a floor, the bidder re-values the impression and skips it whenever its valuation lands under the floor, and a guaranteed line tagged `at=1` underdelivers into a makegood. `Deal.json` declares no conditional between `deal_type` and `at`, so the inverted pairing validates as a well-formed deal.

## Deal, quote and campaign container

| Object                                         | What it is                                       | Binding                                          |
| ---------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| [Quote](/negotiation/quote/)                   | A seller's price for one product over one flight | Non-binding, expires, reserves nothing           |
| Deal                                           | The booking that quote becomes                   | Seller-issued `deal_id`, activatable in a DSP    |
| [Media buy](/media-buying/media-buy/) or Order | The campaign container a booking sits under      | AdCP's `create_media_buy` object; AAMP's `Order` |

## AdCP has no deal object

[AdCP](/concepts/adcp/) 3.1.13 defines no deal schema. None of its 64 published operations books one, and no property in the registry is named for a deal. The word appears in two descriptions: `enums/response-type.json` lists `deal` as one of four Trusted Match response types, "Deal ID for programmatic execution", and `core/insertion-order.json` describes AdCP's signing wrapper by what it refuses to do, "The IO does not introduce new deal terms".

|                      | AAMP                             | AdCP 3.1.13                                           |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| Priced artifact      | Quote, `quote_id`                | Proposal, `proposal_id`, `proposal_status: committed` |
| Commit call          | `POST /api/v1/deals`             | `create_media_buy`                                    |
| Seller mints         | `deal_id`                        | `media_buy_id`, `confirmed_at`                        |
| Signature wrapper    | none                             | `insertion_order` / `io_acceptance`                   |
| Bidstream activation | `openrtb_params`, `supply_chain` | none                                                  |

AAMP's `deal_id` is carried in bid requests. AdCP 3.1.13 registers no `bidfloor`, `wseat` or `schain` property, and its commit point produces a media buy rather than a deal.
