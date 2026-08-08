---
title: 'The Agentic Advertising Standards Landscape'
description: 'Which agentic standards are advertising and which are payments. AdCP and AAMP versus AP2, ACP, UCP and x402, with a dated artifact-status table for each.'
answer: 'Two standards target agentic advertising: AdCP, stewarded by AgenticAdvertising.org, and AAMP, stewarded by IAB Tech Lab. AP2, ACP, UCP and x402 are agentic commerce protocols. They handle payment and checkout, not media buying.'
pubDate: 2026-08-09
cluster: 'hub-standards-index'
keywords:
  - 'agentic advertising standards landscape'
  - 'agentic advertising standards'
  - 'adcp vs acp'
  - 'agentic commerce vs agentic advertising'
  - 'agentic protocol list'
citations:
  - 'https://docs.adcontextprotocol.org/docs/faq'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/reference/versions'
  - 'https://docs.adcontextprotocol.org/docs/sponsored-intelligence/si-chat-protocol'
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://agenticcommerce.dev'
  - 'https://www.crossmint.com/learn/agentic-payments-protocols-compared'
  - 'https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/agent-discovery-files/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - 'https://adcpexplorer.noetis.dev/'
  - 'https://aampexplorer.noetis.dev/'
  - 'https://adtechglossary.noetis.dev/concepts/ucp/'
  - 'https://whatisagenticbuying.noetis.dev/'
reviewState: cto-reviewed
---

## Which standards actually cover agentic advertising?

Two, and they come from different organisations with different scopes.

**AdCP, the Ad Context Protocol**, is stewarded by AgenticAdvertising.org. It defines advertising tasks and JSON Schemas that run over MCP and A2A as transports. Its published stable release is 3.1.10, and the schemas under `dist/schemas/3.1.10/` cover 64 operations across ten protocol areas: media buy (11), creative (8), signals (2), governance (22), brand protocol (6), accounts (5), sponsored intelligence (4), protocol (3), trusted match (2) and compliance (1).

**AAMP**, stewarded by IAB Tech Lab, is an umbrella over eight repositories rather than one document. One of them, the Agentic Real Time Framework, is a released specification tagged `v1.0` and dated 12 November 2025. Most of the rest are reference implementations. The [AAMP status page](/protocols/aamp/) goes repository by repository.

Everything else people bring into this conversation is a transport, an older IAB standard the agents are built on, or a commerce protocol. The commerce ones get mistaken for advertising standards constantly, which is why they get a table below rather than a footnote.

## What is the current artifact status of each stack?

Verified against local clones on 2026-08-09.

| Stack                        | Steward                | Version oracle             | Current release                         | Machine-readable surface                                             |
| ---------------------------- | ---------------------- | -------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| AdCP                         | AgenticAdvertising.org | `dist/schemas/latest.json` | 3.1.10, channel `stable`                | 64 operations, 761 published draft-07 JSON Schema files              |
| AAMP: ARTF                   | IAB Tech Lab           | git tag                    | `v1.0`, released 2025-11-12             | 534-line specification plus protobuf, eight named `Intent` mutations |
| AAMP: Agentic Audiences      | IAB Tech Lab           | none, no tags              | "Draft v0.1" inside a `v1.0/` directory | one JSON Schema, four zero-byte spec files                           |
| AAMP: seller-agent           | IAB Tech Lab           | git tag                    | `v2.4.1`                                | OpenAPI 3.1.0, 74 paths, 91 schemas                                  |
| AAMP: buyer-agent            | IAB Tech Lab           | git tag                    | `v2.3.0` plus 24 commits                | OpenAPI 3.1.0, 13 paths, 8 schemas                                   |
| AAMP: iab-agentic-primitives | IAB Tech Lab           | git tag                    | `v0.5.0`, README says not yet released  | OpenAPI with 13 operations, plus 48 JSON Schema files                |

Two version traps are worth naming because both appear in published third-party writing. AdCP release 3.1.3, dated 2026-07-13, is withdrawn: `docs/reference/versions.mdx` marks it "Withdrawn. Do not use." AAMP has no umbrella version at all, so "AAMP 2.3" points at no artifact you can check out. Release-by-release detail lives upstream: AdCP publishes [`docs/reference/versions.mdx`](https://github.com/adcontextprotocol/adcp/blob/main/docs/reference/versions.mdx), and each AAMP repository tags independently — see the [AAMP version matrix](https://aampexplorer.noetis.dev/versions/).

## Which of these protocols are advertising and which are payments?

| Protocol                          | Steward                                          | Category    | What it standardises                                                                        |
| --------------------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------- |
| AdCP                              | AgenticAdvertising.org                           | Advertising | Media buying, creative, signals, brand governance, real-time matching                       |
| AAMP                              | IAB Tech Lab                                     | Advertising | Agent discovery and trust, buyer/seller negotiation, bidstream mutation, embedding exchange |
| ACP (Agentic Commerce Protocol)   | OpenAI and Stripe                                | Commerce    | Checkout, payment delegation without becoming merchant of record                            |
| UCP (Universal Commerce Protocol) | Google, with Shopify, Walmart, Target and others | Commerce    | Checkout, payments, fulfilment primitives                                                   |
| AP2 (Agent Payments Protocol)     | originated at Google                             | Payments    | Mandates authorising an agent to pay on a user's behalf                                     |
| x402                              | originated at Coinbase                           | Payments    | Settlement over HTTP, built on the 402 status code                                          |

The AdCP and AAMP rows are traceable to files in the two corpora. The ACP and UCP definitions above are taken from AdCP's own glossary, which defines ACP as "an open standard developed by OpenAI and Stripe for programmatic commerce flows in AI assistants" and UCP as "an open standard developed by Google with Shopify, Walmart, Target, and others for commerce in AI assistants".

The AP2 and x402 rows are different, and I am flagging them rather than quietly levelling them up. I have not read either specification against a local clone. Both are described in secondary comparisons, including [Crossmint's protocol comparison](https://www.crossmint.com/learn/agentic-payments-protocols-compared) and the [Applied Technology Index 2026 analysis](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/), which also report governance moves during 2026 (AP2 toward the FIDO Alliance, an x402 Foundation under the Linux Foundation). Treat those two rows as orientation, not as sourced protocol facts.

## Where do the advertising and commerce layers meet?

At one handoff, and AdCP documents it. Sponsored Intelligence runs a conversational brand experience inside an AI assistant; when the user decides to buy, `docs/sponsored-intelligence/si-chat-protocol.mdx` describes the host initiating checkout via ACP when the termination reason is `handoff_transaction`, carrying the SI `session_id` through so the purchase can be attributed back to the sponsored conversation.

AdCP's FAQ puts the boundary in one line: "AdCP owns the path up to the handoff; the commerce protocol owns the transaction." That framing comes from one of the two advertising standards rather than from a neutral party, but it matches what the schemas do. No operation in AdCP's 64 takes a payment, and no file in the AAMP corpus does either.

## Why do people confuse these protocols?

Three reasons, and one of them is a genuine collision rather than sloppiness.

The acronyms overlap. AdCP and ACP differ by one letter and both describe agent-to-agent transactions in AI assistants.

UCP means two different things inside this subject area. AdCP's glossary uses UCP for Google's Universal Commerce Protocol. The AAMP repository `agentic-audiences` was formerly the User Context Protocol, contributed by LiveRamp; its surviving JSON Schema still carries an `$id` pointing at `raw.githubusercontent.com/LiveRamp/user-context-protocol`, and its `catalog-info.yaml` still declares the LiveRamp project slug. So a document saying "UCP" may mean a commerce protocol or an advertising data plane, depending on who wrote it. The [glossary disambiguation](https://adtechglossary.noetis.dev/concepts/ucp/) keeps both.

And the vendor announcements arrived within months of each other in 2025 and 2026, which flattened them into one story in trade coverage even though they solve different problems for different buyers.

## What is underneath both advertising stacks?

Neither stack invented its transport, and AAMP did not invent most of its object model.

AdCP runs over MCP and A2A. Its glossary defines the protocol itself as "domain-specific tasks and schemas that work over MCP and A2A as transports", and the Trusted Match operations sit outside both: `docs/trusted-match/router-architecture.mdx` puts them on a direct HTTP/2 API.

AAMP runs over MCP, A2A JSON-RPC 2.0 and REST, with gRPC for ARTF. Its control plane is built on IAB standards that predate the agentic work: OpenDirect 2.1 supplies Account, Order, Line, Product, Creative, Assignment and ChangeRequest; AdCOM and OpenRTB 2.6 supply the creative and bidstream shapes; `sellers.json` supplies supply-chain transparency.

That is the practical difference in one sentence. AdCP wrote a new object model and published schemas for it; AAMP wrapped existing IAB standards in agent interfaces. Which approach ages better is not something I can answer from a file, and I would not trust anyone who claims otherwise this early.

## Where to go next

- [AdCP vs AAMP: what the specifications actually say](/protocols/adcp-vs-aamp/), the full architectural comparison.
- [AAMP: what IAB Tech Lab has actually published](/protocols/aamp/), the repository-by-repository status.
- [How ad agents find each other](/guides/agent-discovery-files/), the two discovery and trust models.
- [AdCP Explorer](https://adcpexplorer.noetis.dev/) for the 64 operations and the schema registry.
- [AAMP Explorer](https://aampexplorer.noetis.dev/) for the eight repositories and the ARTF specification.
