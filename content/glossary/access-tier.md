---
title: 'Access Tier — public, seat, agency, advertiser'
description: 'Access tier in AAMP is a four-value enum that gates what price a buyer agent can see and how hard it can negotiate. The tiers, the caps, and why AdCP has no equivalent.'
answer: "Access Tier in AAMP is a four-value enum — public, seat, agency, advertiser — derived from how much identity a buyer agent reveals. It gates price visibility and selects the seller's negotiation strategy."
pubDate: 2026-08-09
term: 'Access Tier'
alternateNames: ['buyer tier', 'pricing tier', 'AccessTier']
category: commerce
cluster: gl-negotiation
keywords:
  - 'access tier advertising agent'
  - 'aamp access tier'
  - 'buyer tier pricing advertising'
  - 'progressive identity revelation advertising'
  - 'tier based discount media buying'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Quote.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/DealBookingRequest.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/media-kit.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/action-not-allowed-reason.json'
related:
  - '/negotiation/trust-status/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/quote/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Trust Status', 'Quote', 'Deal', 'Negotiation Round']
reviewState: cto-reviewed
---

## What is an access tier in AAMP?

Access Tier is a four-value string enum carried on the AAMP Quote, Deal and Negotiation objects as `buyer_tier`. The shared schema defines it as "Access tier for tiered pricing, derived from revealed buyer identity" and documents the four values inline:

| Value        | Identity revealed       | What the schema says                            |
| ------------ | ----------------------- | ----------------------------------------------- |
| `public`     | None                    | "no identity — price ranges only"               |
| `seat`       | DSP seat, authenticated | "authenticated DSP (demand-side platform) seat" |
| `agency`     | Agency                  | "agency identity revealed"                      |
| `advertiser` | Advertiser              | "advertiser identity revealed (best rates)"     |

The mechanism is progressive identity revelation. A buyer agent browsing anonymously sees ranges. The more it discloses through `BuyerIdentity` — `seat_id`, `agency_id`, `advertiser_id`, `dsp_platform` — the more exact and the cheaper the price it is quoted.

**Access Tier comes from a reference implementation, not a ratified specification.** The enum is defined in `iab-agentic-primitives`, whose README states: "WORK IN PROGRESS — NOT YET RELEASED… APIs, schemas, and package layout are unstable and will change without notice."

## What does an access tier actually control?

Two things: what price a buyer agent can see, and how a negotiation with it will be run.

On visibility, the seller agent's authentication reference gives this table:

| Tier         | Pricing visibility         | Negotiation |
| ------------ | -------------------------- | ----------- |
| `public`     | Price ranges only          | No          |
| `seat`       | Exact prices, no discounts | Limited     |
| `agency`     | Tier discounts applied     | Standard    |
| `advertiser` | Full discounts plus volume | Premium     |

On price level, the buyer agent's media-kit reference gives indicative discounts of roughly 0 percent for `public`, 5 percent for `seat`, 10 percent for `agency` and 15 percent for `advertiser`. Note the column heading in the source is "Typical Discount" — these are illustrative numbers from a reference implementation's sample rate card, not a rate any implementer is obliged to honour. The worked example in the seller agent's quote documentation shows a 10 percent agency tier discount stacked with a 5 percent volume discount, taking a $12.00 base CPM to $10.26.

## How does access tier drive negotiation?

This is the part with real numbers behind it. The seller agent maps each tier to a named negotiation strategy with three hard limits and one behavioural parameter.

| Access tier  | Strategy        | Max rounds | Per-round concession cap | Cumulative cap | Buyer gap share |
| ------------ | --------------- | ---------- | ------------------------ | -------------- | --------------- |
| `public`     | `aggressive`    | 3          | 3%                       | 8%             | 30%             |
| `seat`       | `standard`      | 4          | 4%                       | 12%            | 40%             |
| `agency`     | `collaborative` | 5          | 5%                       | 15%            | 50%             |
| `advertiser` | `premium`       | 6          | 6%                       | 20%            | 65%             |

Read the columns as the source defines them. Max rounds is the walk-away point. The per-round cap is the largest concession the seller will make in one round; the cumulative cap is the ceiling across the whole negotiation. Buyer gap share is "how much of the price gap the seller expects the buyer to close (higher = more favorable to seller)" — counter-intuitively, the `advertiser` tier is expected to close the largest share of the remaining gap, at 65 percent, in exchange for the widest concession budget.

The practical reading: identity buys you rounds and room, and the seller's total exposure is bounded before the conversation starts. A `public` buyer cannot argue a price down by more than eight percent no matter how it bids, because the engine will not concede past the cap.

Rounds are recorded on the [Negotiation Round](/negotiation/negotiation-round/) object. The full walkthrough with a worked three-round example is on [AAMP Explorer](https://aampexplorer.noetis.dev/negotiation/).

## Can a buyer agent just claim a higher tier?

No. The tier a buyer asserts is capped by what the registry says about it. The `BuyerIdentity` schema states the rule directly: "The tier derived from these fields is capped server-side by the registry-verified trust status of the calling agent — it is never self-asserted."

The seller agent's authentication reference gives the arithmetic: "The effective tier is the **minimum** of the API key tier and the agent trust tier. A `preferred` agent with a `seat`-level API key gets `seat` access. A `public` API key with an `approved` agent gets `public` access."

That second sentence is the one people misread. Trust does not upgrade a weak credential; it only caps a strong one. See [Trust Status](/negotiation/trust-status/) for the five-value lattice and the trust-to-tier ceiling map.

One caveat carried from the sources: the seller agent's authentication page says `public` tier gets no negotiation, while the same repository's negotiation page assigns `public` a three-round `aggressive` strategy, and the buyer agent says only `agency` and `advertiser` can negotiate at all. Those three statements have not been reconciled in the corpus.

## Does AdCP have an access tier?

No. There is no `tier`, `access_tier` or `buyer_tier` field anywhere in the published AdCP 3.1.10 schema registry. I checked every JSON file under `dist/schemas/3.1.10/` outside the bundled copies; the string appears zero times as a property name.

"Account tier" does appear, five times across five files, and only in prose. `core/product.json` says a buyer should pre-flight its actions against a live endpoint "which resolves modes against current buy state, account tier, and negotiated terms." `enums/action-not-allowed-reason.json` explains that an action may be unavailable because "the specific buy was negotiated without this capability (account tier, IO terms, or buy-level override)."

AdCP therefore acknowledges that tiering exists and treats it as an input it does not model. AAMP models it as an enum and derives pricing and negotiation behaviour from it. Same commercial reality, opposite decisions about what belongs in the protocol.

## Where does this definition come from?

| Claim                                    | File                                                                       | Version pin                                  |
| ---------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| `AccessTier` enum and value descriptions | `spec/jsonschema/Quote.json` (`$defs.AccessTier`)                          | `iab-agentic-primitives` `v0.5.0-1-g2fc7029` |
| Tier never self-asserted                 | `spec/jsonschema/protocol/DealBookingRequest.json` (`$defs.BuyerIdentity`) | same                                         |
| Strategy, round and concession caps      | `docs/integration/negotiation.md`                                          | `seller-agent` `v2.4.1`                      |
| Visibility table, effective-tier rule    | `docs/api/authentication.md`                                               | `seller-agent` `v2.4.1`                      |
| Indicative tier discounts                | `docs/api/media-kit.md`                                                    | `buyer-agent` `v2.3.0-24-g0c3a154`           |
| Absence of a tier field in AdCP          | `dist/schemas/3.1.10/` registry                                            | AdCP `3.1.10` (published stable)             |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
