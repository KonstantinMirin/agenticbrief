---
title: 'Negotiation Round and Negotiation Action'
description: 'A negotiation round in AAMP records one offer-and-counter exchange between buyer and seller agents. The four actions, the fields a round persists, and the caps that end it.'
answer: "A Negotiation Round in AAMP is one recorded offer-and-counter exchange between a buyer agent and a seller agent, carrying both prices, the seller's action, and the concession taken. AdCP has no negotiation protocol."
pubDate: 2026-08-09
term: 'Negotiation Round'
alternateNames: ['negotiation action', 'counter-offer round']
category: commerce
cluster: gl-negotiation
keywords:
  - 'agentic negotiation round'
  - 'negotiation action accept counter final_offer reject'
  - 'agent to agent price negotiation'
  - 'concession cap advertising agent'
  - 'automated media buying negotiation'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Negotiation.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationMessage.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/NegotiationRoundResponse.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/guides/negotiation.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/pricing-options/price-breakdown.json'
related:
  - '/negotiation/access-tier/'
  - '/negotiation/quote/'
  - '/negotiation/deal/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://agenticadlab.noetis.dev/guides/how-a-machine-buys-media/'
seeAlso: ['Quote', 'Deal', 'Access Tier', 'Trust Status']
reviewState: cto-reviewed
---

## What is a negotiation round in AAMP?

A negotiation round is one recorded exchange in a price argument between two agents. The buyer sends a price, the seller answers with a price and an action, and the pair is appended to a persisted history. AAMP defines the record as `NegotiationRound` inside `spec/jsonschema/Negotiation.json` in `iab-agentic-primitives`.

This is, as far as I can find, the only quantified agent-to-agent negotiation model any advertising standards body has published. It is also, and this matters more than the novelty, a reference implementation rather than a ratified specification — `iab-agentic-primitives` states in its README that it is "WORK IN PROGRESS — NOT YET RELEASED" and that its schemas "will change without notice", while both AAMP agent repositories pin it at `v0.5.0`.

## What does a negotiation round record?

Four fields are required on `NegotiationRound`; four more are optional but always populated by the seller agent reference implementation.

| Field                       | Required | What it holds                                      |
| --------------------------- | -------- | -------------------------------------------------- |
| `round_number`              | Yes      | Sequential, minimum 1                              |
| `buyer_price`               | Yes      | `Money` — what the buyer offered this round        |
| `seller_price`              | Yes      | `Money` — what the seller countered or accepted at |
| `action`                    | Yes      | `NegotiationAction`                                |
| `concession_pct`            | No       | Seller concession this round, 0–1, default 0       |
| `cumulative_concession_pct` | No       | Total seller concession so far, 0–1, default 0     |
| `rationale`                 | No       | Free text explanation of the seller's decision     |
| `timestamp`                 | No       | When the round occurred                            |

Rounds accumulate on the `Negotiation` container, which carries `negotiation_id`, `rounds[]`, `buyer_tier`, `status` and the quote, proposal, product or package under discussion. `NegotiationStatus` has four values: `active`, `accepted`, `rejected`, `expired`.

## What are the four negotiation actions?

`NegotiationAction` is a four-value enum. The `NegotiationMessage` schema describes it as the "REQUIRED move discriminator".

| Action        | Sent by     | Meaning                                    |
| ------------- | ----------- | ------------------------------------------ |
| `counter`     | Either side | A new price, negotiation continues         |
| `accept`      | Either side | Agreement at the other side's price        |
| `final_offer` | Either side | A price with no further movement behind it |
| `reject`      | Either side | Walk away                                  |

`final_offer` is the interesting one. It is a distinct wire value rather than a flag on a counter, so an agent on the other end can distinguish "here is a better number" from "this is the last number" without inferring it from concession behaviour.

## How does a buyer agent send a round?

`NegotiationMessage` is the buyer's move. It requires `idempotency_key` and `action`, and carries `buyer_price`, `rationale`, plus whichever of `negotiation_id`, `quote_id` or `proposal_id` identifies what is being negotiated. When `negotiation_id` is absent, the message opens a new negotiation on the referenced quote or proposal.

`round_number` on the message is optimistic concurrency control. The schema describes it as "the round the sender believes it is answering… a mismatch is a 'contention' error." Two buyer moves racing against the same round do not silently overwrite one another.

The seller answers with `NegotiationRoundResponse`, which embeds the same `NegotiationRound` primitive that gets appended to the history "so the two sides cannot disagree about what a round contains", plus `rounds_remaining` and `status`.

One structural gap is worth flagging: the schema tree ships `NegotiationRoundResponse.json` with no matching `NegotiationRoundRequest.json`. The request side is `NegotiationMessage`, named differently. Anyone generating clients by pairing `*Request`/`*Response` filenames will produce a broken negotiation client.

## What ends a negotiation round sequence?

The seller agent's negotiation engine is keyed off the buyer's access tier. Each tier gets a strategy with a maximum round count, a per-round concession cap and a cumulative concession cap. A `public`-tier buyer gets three rounds and cannot extract more than eight percent in total; an `advertiser`-tier buyer gets six rounds and up to twenty percent. The full four-row table, including the `gap_split_buyer_share` column, is on [Access Tier](/negotiation/access-tier/), and the worked walkthrough is on [AAMP Explorer's negotiation reference](https://aampexplorer.noetis.dev/negotiation/).

Three things can terminate the sequence: the seller accepts, either side rejects, or the round budget runs out. The buyer's `SimpleThresholdStrategy` adds a fourth trigger, walking away when "seller hasn't moved since last round".

## Can every tier negotiate? The AAMP repositories disagree

Three statements, two repositories, one topic, no reconciliation:

| Source                                         | What it says about `public` and `seat` tiers                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `seller-agent/docs/api/authentication.md`      | Negotiation column: `public` = "No", `seat` = "Limited"                                                                                                            |
| `seller-agent/docs/integration/negotiation.md` | `public` gets the `aggressive` strategy with 3 rounds; `seat` gets `standard` with 4 rounds                                                                        |
| `buyer-agent/docs/guides/negotiation.md`       | "Only **Agency** and **Advertiser** tier buyers can negotiate. Public and Seat tier buyers cannot — the seller will reject negotiation attempts from those tiers." |

The seller agent's own two reference pages contradict each other, and the buyer agent takes the stricter reading. An implementer building against AAMP today has to pick one and test against a live seller. This is the kind of thing a ratified specification resolves and a pair of reference implementations does not.

## Does AdCP have a negotiation protocol?

No. AdCP 3.1.10 publishes 64 operations and none of them makes, answers or records an offer. There is no negotiation object, no round, no counter-offer and no concession field anywhere in `dist/schemas/3.1.10/`.

The word does appear, about fifty times across the registry, and never as a surface for making an offer. AdCP even names its planning-time protocol layer the "negotiation layer" in `index.json`, covering discovery, buying, creative and governance rather than price argument. Where the past participle shows up it points outward at an agreement struck somewhere else: `core/product.json`, `core/media-buy-available-action.json` and `media-buy/get-media-buys-response.json` all resolve what a buyer may do on a buy "against the buy's current status, negotiated terms, account tier, and any buy-level overrides", and `pricing-options/price-breakdown.json` lists `negotiated` as one of the reasons a price can differ from list. The rest is version negotiation and error-recovery advice to go negotiate offline. AdCP records the consequences of a negotiation it did not conduct.

So the comparison is not "AdCP negotiates differently". It is that price agreement sits outside AdCP's scope entirely, and inside AAMP's with numbers attached.

## Where does this definition come from?

| Claim                                                        | File                                                     | Version pin                                  |
| ------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------- |
| `NegotiationRound`, `NegotiationAction`, `NegotiationStatus` | `spec/jsonschema/Negotiation.json`                       | `iab-agentic-primitives` `v0.5.0-1-g2fc7029` |
| Buyer move, idempotency, contention error                    | `spec/jsonschema/protocol/NegotiationMessage.json`       | same                                         |
| Seller answer, `rounds_remaining`                            | `spec/jsonschema/protocol/NegotiationRoundResponse.json` | same                                         |
| Tier strategies and caps                                     | `docs/integration/negotiation.md`                        | `seller-agent` `v2.4.1`                      |
| Tier negotiation permissions                                 | `docs/api/authentication.md`                             | `seller-agent` `v2.4.1`                      |
| Buyer strategy and walk-away rule                            | `docs/guides/negotiation.md`                             | `buyer-agent` `v2.3.0-24-g0c3a154`           |
| Absence of negotiation in AdCP                               | `dist/schemas/3.1.10/index.json`                         | AdCP `3.1.10` (published stable)             |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
