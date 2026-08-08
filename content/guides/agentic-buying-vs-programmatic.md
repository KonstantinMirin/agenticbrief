---
title: 'Agentic Buying vs Programmatic Buying'
description: 'Programmatic clears impressions in an auction. Agentic buying negotiates campaigns over an agent protocol. The difference is the unit of exchange and the clock, not the intelligence.'
answer: 'Agentic buying and programmatic buying differ in unit and clock. Programmatic clears one impression per auction in milliseconds. Agentic buying negotiates a whole media buy over an agent protocol, asynchronously. They stack rather than compete.'
pubDate: 2026-08-09
cluster: 'wiab-vs-prog'
keywords:
  [
    'agentic buying vs programmatic',
    'is agentic buying just programmatic',
    'agentic vs rtb',
    'programmatic media buying automation',
    'agentic media buying',
  ]
citations:
  [
    'https://docs.adcontextprotocol.org/docs/faq',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json',
    'https://github.com/IABTechLab/agentic-rtb-framework',
    'https://github.com/InteractiveAdvertisingBureau/openrtb2.x',
    'https://iabtechlab.com/standards/real-time-bidding/',
    'https://docs.adcontextprotocol.org/docs/building/concepts/adcp-vs-openrtb',
    'https://docs.adcontextprotocol.org/docs/measurement/taxonomy',
    'https://docs.adcontextprotocol.org/docs/reference/known-limitations',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/performance-standard.json',
    'https://digiday.com/media-buying/the-case-against-ai-agents-for-programmatic-ad-buying/',
    'https://www.adexchanger.com/marketers/the-ad-context-protocol-aims-to-make-sense-of-agentic-ad-demand/',
  ]
related:
  [
    '/',
    '/how-it-works/',
    '/maturity/',
    'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/',
    'https://adcpexplorer.noetis.dev/operations/get-products/',
    'https://aampexplorer.noetis.dev/repos/agentic-rtb-framework/',
  ]
reviewState: cto-reviewed
---

## How is agentic buying different from programmatic buying?

Programmatic buying decides one impression at a time. A bid request arrives, a bidder scores it, a bid comes back, the auction clears, an ad serves. The unit of exchange is an impression and the budget for the whole decision is a few dozen milliseconds.

Agentic buying decides a campaign. A buyer's agent asks a seller's agent what inventory it has, gets back products with prices and formats, picks some, and creates a media buy. The unit of exchange is a media buy containing packages, and the operation can take long enough that the protocol has a formal way to say "still working".

That difference in unit and clock drives everything else. It is not a difference in how clever the software is.

## Agentic buying vs programmatic buying: what actually differs?

|                             | Programmatic (RTB)                                                                                                                                                                      | Agentic buying                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit of exchange            | One impression, one auction                                                                                                                                                             | A media buy containing packages                                                                                                                           |
| Normative wire format       | OpenRTB 2.6 bid request / bid response, IAB Tech Lab                                                                                                                                    | AdCP JSON Schema registry, 64 operations at version 3.1.10                                                                                                |
| Transport                   | HTTP POST to a bidder endpoint                                                                                                                                                          | MCP or A2A, per AdCP's transport docs                                                                                                                     |
| Latency budget              | Milliseconds. ARTF's protobuf `RTBRequest` carries `tmax`, commented "Maximum time in milliseconds the exchange allows for mutations to be received including latency to avoid timeout" | Asynchronous. 7 of AdCP 3.1.10's 64 operations publish `-async-response-submitted`, `-working` and `-input-required` schema arms                          |
| Who chooses                 | A bidder algorithm scoring an opportunity it was handed                                                                                                                                 | An agent choosing among products a seller returned in response to a brief                                                                                 |
| How intent is expressed     | Targeting parameters attached to a seat                                                                                                                                                 | `get_products` takes a `buying_mode` of `brief`, `wholesale` or `refine`, and an optional free-text `brief` string                                        |
| Discovery of counterparties | `ads.txt` and `sellers.json` on the publisher domain                                                                                                                                    | `adagents.json` at `/.well-known/adagents.json`, declaring authorised agents                                                                              |
| Negotiation                 | None. The auction is the negotiation                                                                                                                                                    | AdCP carries a `proposal` object moving from draft to committed; IAB Tech Lab's seller-agent defines actions `accept`, `counter`, `final_offer`, `reject` |
| Idempotency                 | Not applicable, requests are fire and forget                                                                                                                                            | `create_media_buy` requires an `idempotency_key`                                                                                                          |
| Governance check            | Post-hoc, via blocklists and verification vendors                                                                                                                                       | `check_governance` is a pre-flight operation with a required `caller` field                                                                               |

Every row is checkable against a file. The AdCP rows come from `dist/schemas/3.1.10/`, which is the released registry rather than the working branch. The ARTF row comes from `proto/agenticrtbframework.proto` in IAB Tech Lab's agentic-rtb-framework repository, tagged `v1.0`.

## Is agentic buying just programmatic with a chat box on top?

That is the sharpest version of the objection, and it is partly fair.

The fair part: an agent that sends a natural-language brief and gets back products is doing product discovery, which programmatic direct and PMP deal negotiation have done through sales reps and Excel for two decades. The brief string in `get_products` is optional. A buyer can send only structured `filters` and never write a sentence.

The unfair part: the protocol surface is genuinely wider than a targeting layer. AdCP 3.1.10's 64 registered operations span media buy, creative, signals, governance, accounts, brand and a real-time match layer. Creative generation is in the wire format — `build_creative` takes a `message` and a `target_format_id` and returns a creative manifest. Governance is in the wire format. Payment terms are in the wire format, through `get_account_financials`. None of that is expressible in a bid request.

So the honest read is that agentic buying automates the parts of the buy that were never programmatic in the first place: the brief, the negotiation, the creative spec, the insertion order, the approval. The auction was already automated.

## Does agentic buying replace real-time bidding?

No, and the specifications say so directly. AdCP's FAQ describes a publisher's AdCP agent accepting a `create_media_buy` from a buyer agent and then using OpenRTB internally for impression-level delivery, and states that a single `create_media_buy` can spawn thousands of impression-layer events.

The stacking is visible in the artifacts too. ARTF does not replace OpenRTB; it defines mutations applied to an OpenRTB bid request or bid response, with a `Mutation` message carrying an `intent`, an `op` of `ADD`, `REMOVE` or `REPLACE`, and a JSON-Patch-style `path`. The repository imports the OpenRTB 2.6 protobuf. Agents are being inserted into the auction, not put in place of it.

If anyone tells you agentic buying kills RTB, ask them which schema field they are pointing at.

## What does agentic buying not standardise that programmatic already does?

This is the part vendors skip, and it is also the part where I had to correct myself while writing this page.

Measurement is delegated, not reproduced. AdCP does not define a viewability standard, and it is explicit about that: its own comparison doc lists Open Measurement SDK under IAB Tech Lab's portfolio, and the FAQ says AdCP coexists with those standards rather than replacing them. What AdCP does instead is bind third-party measurement into the contract. `core/performance-standard.json` in the released registry requires a `metric`, a `threshold` and a `vendor`, with an optional `standard` so MRC and GroupM viewability are distinguishable. Buyers filter products on `required_performance_standards` at `get_products`, and when a standard is committed, the creative has to carry that vendor's tracker assets. That is a real answer to verification, and it is a different answer from programmatic's: programmatic runs the measurement, agentic buying writes the measurement vendor into the purchase order.

The buyer's own outcome channel is much thinner. `provide_performance_feedback` sends a single normalised `performance_index` number back to the seller. One float, per measurement period, is the entire buyer-to-seller outcome signal.

Fraud and invalid traffic sit outside both agentic stacks. AdCP is not silent on IVT — it turns up across twenty documentation pages, and `ivt` is one of five values in the `performance-standard-metric` enum — but it is always something a vendor detects and AdCP contracts for. `known-limitations.mdx` puts GIVT/SIVT filtration in "the delivery stack or the chosen vendor layer". Across all eight IAB Tech Lab agentic repositories, `grep -ril` for "invalid traffic", "IVT" and "ad fraud" returns zero files. Billing reconciliation between what an agent bought and what an ad server delivered is also unaddressed, beyond the reporting fields on `get_media_buy_delivery`.

Supply-chain transparency is partial. `adagents.json` extends the `ads.txt` and `sellers.json` relationship model to agents, per AdCP's own FAQ, but the object it authorises is an agent endpoint rather than a seller ID, and adoption of a well-known file depends entirely on publishers deploying it.

Agencies at Digiday's Programmatic Marketing Summit in May 2026 named hallucination as their main reason for keeping language-model agents away from live activation, with a decimal-point error framed as the specific fear. That is a governance gap, not a protocol gap, and no schema fixes it.

## Which one should a buyer be running today?

Programmatic, still, for anything at scale. The agentic stack that has a published, versioned schema registry is AdCP at 3.1.10, and the stack with reference implementations rather than ratified specifications is AAMP. IAB's 2026 Digital Video Ad Spend and Strategy Report, published 5 May 2026, put 21% of digital video buyers live with agentic AI. That is a real number and it is also a minority.

The useful question is not which one wins. It is which parts of your buy are still a human retyping a media plan into a booking form, because those are the parts an agent protocol addresses first. The [call-by-call trace](/how-it-works/) shows which operations cover which parts, and the [maturity page](/maturity/) tracks what is actually shipped.
