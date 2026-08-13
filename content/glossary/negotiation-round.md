---
title: 'Negotiation Round and Negotiation Action'
description: 'One recorded offer-and-counter exchange between two agents in AAMP: eight fields, four of them required, four actions, and a history that accumulates on a Negotiation container.'
answer: "A negotiation round in AAMP is one recorded offer-and-counter exchange between a buyer agent and a seller agent, carrying both prices, the seller's action and the concession taken, while AdCP has no negotiation protocol."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Negotiation Round'
alternateNames: ['negotiation action', 'counter-offer round', 'NegotiationRound']
category: commerce
cluster: gl-negotiation
keywords:
  - 'agentic negotiation round'
  - 'negotiation action accept counter final_offer reject'
  - 'agent to agent price negotiation'
  - 'negotiationround aamp schema'
  - 'automated media buying negotiation'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Negotiation.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationMessage.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationRoundResponse.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/protocol/NegotiationMessage.golden.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/primitives/Negotiation.golden.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/protocol/negotiation.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/services/negotiation_service.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/routers/negotiation.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/contract_mappers.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/engines/negotiation_engine.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/pricing_tiers.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/guides/negotiation.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/insertion-order.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-allowed-action.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/pricing-options/price-breakdown.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
related:
  - '/negotiation/access-tier/'
  - '/negotiation/quote/'
  - '/negotiation/deal/'
  - '/negotiation/trust-status/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://agenticadlab.com/guides/how-a-machine-buys-media/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Quote', 'Deal', 'Access Tier', 'Trust Status']
reviewState: cto-reviewed
---

A negotiation round is one recorded offer-and-counter exchange between two agents, appended to a persisted history. [AAMP](/concepts/aamp/), IAB Tech Lab's Agentic Advertising Management Protocols, defines it as `NegotiationRound` in `spec/jsonschema/Negotiation.json` and describes it in one sentence: "A single offer/counter round in a negotiation." A negotiation action is the verb a message carries: `accept`, `counter`, `reject` or `final_offer`. The library holding both is [unreleased](https://aampexplorer.com/versions/), at version 0.5.0.

Commercially the exchange is narrow. The seller's floor price and bargaining strategy stay on the seller's side, the buyer's target and walk-away stay on the buyer's, and the only things that cross are the two prices, the verb and the concession the seller has already given.

## How a round is exchanged

What is under negotiation is a [quote](/negotiation/quote/) or a proposal, and the buyer agent moves first. It sends a `NegotiationMessage` naming the quote or proposal, an action and a price. The seller answers with a round record holding both prices, the action it took and the concession that action represents. Rounds accumulate on a `Negotiation` container, which requires only `negotiation_id` and whose status runs `active`, `accepted`, `rejected`, `expired`. Accept the price and the quote becomes a [deal](/negotiation/deal/).

| Field                       | Required | What it holds                                     |
| --------------------------- | -------- | ------------------------------------------------- |
| `round_number`              | Yes      | Sequential, `minimum: 1`                          |
| `buyer_price`               | Yes      | `Money`, what the buyer offered this round        |
| `seller_price`              | Yes      | `Money`, what the seller countered or accepted at |
| `action`                    | Yes      | `NegotiationAction`                               |
| `concession_pct`            | No       | Seller concession this round, default 0.0         |
| `cumulative_concession_pct` | No       | Total seller concession so far, default 0.0       |
| `rationale`                 | No       | Free text, default empty string                   |
| `timestamp`                 | No       | Date-time, defaulted server-side                  |

Both prices are `Money`, integer micros at a million to the unit, and the schema is blunt about why: "Float is BANNED on the wire for money... that defect must not be fossilized into the spec." The seller agent's integration doc types both prices as `float` anyway. The one filled-in history the specification ships, in `Negotiation.golden.json`, is two rounds long: a counter, then an accept. No floor price appears anywhere in it.

## The four actions

`NegotiationAction` is a four-value enum. The enum exists because a price once shipped with no verb attached: `NegotiationMessage.json` blames its missing default on "the action-less bare-price payload that caused the historical 422".

| Action        | Must carry a price | Ends the negotiation |
| ------------- | ------------------ | -------------------- |
| `counter`     | Yes                | No                   |
| `final_offer` | Yes                | No                   |
| `accept`      | Optional echo      | Yes                  |
| `reject`      | Must not           | Yes                  |

`TERMINAL_ACTIONS` in `protocol/negotiation.py` is a frozen set of two, `accept` and `reject`, with the comment "final_offer is NOT terminal — it invites exactly one more response." The reference seller agent allows more than one: its engine leaves the negotiation `active` after a `final_offer` ("COUNTER and FINAL_OFFER keep status as 'active'") and its router sends both priced actions down one path, so a buyer can answer as often as its round budget allows.

## What the schema enforces

`NegotiationMessage` is the buyer's move. It requires `idempotency_key` and `action`, and carries `buyer_price`, `rationale`, plus whichever of `negotiation_id`, `quote_id` or `proposal_id` identifies what is being negotiated. When `negotiation_id` is absent, the message opens a new negotiation on the referenced quote or proposal.

The schema checks nothing else. The price grammar sits in a `description` string where no validator will reach it — "REQUIRED for 'counter'/'final_offer'; optional echo on 'accept'; omitted on 'reject'" — with no `if`, `allOf`, `oneOf` or `dependentRequired` behind it. The specification's own golden vectors bear that out: both of the vectors it marks `invalid` validate against `NegotiationMessage.json`. The rule is enforced in one place only, a `@model_validator` in the reference Python package, whose README tells implementers to "conform to the _spec_, not to this package". `reject` inherits the same gap: the round record wants a `buyer_price` on every round and the message that walks away is forbidden to send one, so `negotiation_service.py` falls back to the seller's price and a walk-away is persisted as the buyer having offered the seller's own number, while the other mapping path, `contract_mappers.py`, records $0.00. No golden vector covers a `reject` round.

The endpoint ignores two fields the wire requires. `POST /api/v1/negotiations/messages` never reads `idempotency_key`, though the same seller honours one for deal booking, and it never reads `round_number`, so the contention error it documents cannot be raised.

## Round and concession limits

The schema defines no round limit, no concession ceiling and no lifetime, though `status` can reach `expired`. The numbers belong to the reference seller agent, which gives a `public` buyer three rounds and an 8 percent cumulative concession ceiling and an `advertiser` buyer six rounds and 20 percent. [Per-round caps for all four tiers](/negotiation/access-tier/) and a worked walkthrough sit on [AAMP Explorer](https://aampexplorer.com/negotiation/). On the other side, the buyer runs its own clock and quits when "seller hasn't moved since last round".

The container states why those numbers are missing: the seller's floor price, base price, strategy and concession limits are "seller-internal guardrails ... deliberately absent from the shared schema", and even `rounds_remaining` is optional, "Rounds left before the seller walks away, if disclosed".

The reference seller's documentation contradicts itself about whether `public` and `seat` tier buyers may negotiate at all: one page gives both a strategy, at three rounds and four, another marks `public` "No" and `seat` "Limited", its default rate card sets `negotiation_enabled=False` for both, and the buyer agent's guide says the two tiers "cannot" negotiate. The shipped code lets them. `negotiation_engine.py` maps every tier to a strategy with no gate above it, neither it nor the service reads `negotiation_enabled`, and any unmapped tier falls through to the most aggressive strategy. Which tier a buyer is granted in the first place is capped by its [trust status](/negotiation/trust-status/).

## Negotiation in AdCP

`core/product-allowed-action.json` reserves a slot for one: `terms_ref`, an "Optional pointer into buy-terms negotiation" that "accepts any string for now" pending a buy-terms RFC. That RFC has not shipped, and AdCP's FAQ is ahead of it, telling buyers they can require fee disclosure "through `buy_terms`", a field that appears nowhere in `dist/schemas/3.1.13/`.

Otherwise AdCP 3.1.13 defines no negotiation surface and says so in its own schema text. `core/insertion-order.json`: "These are read-only summaries, not negotiation surfaces — deal terms live on products and packages." None of the 64 published operations makes or answers an offer, and no schema file has "negoti" in its name. Where the word appears it is a planning-layer concept rather than an offer, and in dispute the documented recovery is to "negotiate offline".
