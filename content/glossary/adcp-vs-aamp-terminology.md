---
title: 'AdCP and AAMP Terminology Lookup'
description: 'A term-by-term map between AdCP 3.1.10 and the AAMP repositories, with a file path and version pin on every row and an explicit no-counterpart marker where one side has nothing.'
answer: 'This lookup maps AdCP 3.1.10 terms to their AAMP counterparts object by object, with explicit no-counterpart rows. AdCP terms come from a published schema registry; AAMP terms come from reference implementations, not a ratified specification.'
pubDate: 2026-08-09
term: 'AdCP to AAMP terminology map'
alternateNames: ['AdCP AAMP crosswalk', 'AdCP AAMP mapping']
category: protocol
cluster: gl-terminology
keywords:
  - 'adcp vs aamp terminology'
  - 'adcp aamp mapping'
  - 'adcp product vs aamp product'
  - 'adcp media buy vs aamp order'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/docs/3.1.6/reference/glossary.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/opendirect/'
  - '/concepts/mcp-and-a2a/'
  - '/about/sources-and-versions/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
  - 'https://aampexplorer.noetis.dev/versions/'
  - 'https://adcpexplorer.noetis.dev/schemas/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'OpenDirect 2.1', 'MCP and A2A']
reviewState: cto-reviewed
---

## How should you read this AdCP and AAMP terminology map?

Three things before the tables, because they determine how much weight each row carries.

**The two columns have different evidentiary status.** Every AdCP term is pinned to `dist/schemas/3.1.10/`, the published stable release named by `dist/schemas/latest.json`. Every AAMP term is pinned to a file in one of eight independently versioned repositories, and most of those files are reference implementations. The AAMP column describes how IAB Tech Lab's own agents behave; it does not describe a ratified specification. `iab-agentic-primitives`, the source of most AAMP rows below, is pinned at `v0.5.0` by both agent repositories and opens its README with "WORK IN PROGRESS, NOT YET RELEASED".

**Nothing in the AAMP corpus references AdCP.** Every mapping here is our inference across two bodies of work that have never acknowledged each other. Agentic Ad Lab publishes [the evidence for that claim and the architectural comparison](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/); this page is only the term-level lookup.

**Version pins used throughout:**

| Source                | Pin                                       | Path used                              |
| --------------------- | ----------------------------------------- | -------------------------------------- |
| AdCP                  | 3.1.10 (published stable)                 | `dist/schemas/3.1.10/`                 |
| AAMP wire contract    | `iab-agentic-primitives` v0.5.0           | `spec/jsonschema/`                     |
| AAMP seller reference | `seller-agent` v2.4.1                     | `docs/api/`                            |
| AAMP direct model     | `agentic-direct`, `opendirect.json` 2.1.0 | repository root                        |
| AAMP real-time        | ARTF v1.0                                 | `rust/proto/agenticrtbframework.proto` |

## What does each stack call the agents?

| AdCP term                     | AAMP term                 | What it actually means                                                                                                                                                                      |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sales agent                   | Seller agent              | The sell-side server exposing inventory. The phrase "sales agent" appears zero times in the AAMP corpus.                                                                                    |
| Seller (role)                 | Seller agent              | AdCP separates the commercial role ("Seller") from the software ("Sales agent"). AAMP does not.                                                                                             |
| Orchestrator / buyer agent    | Buyer agent               | The buy-side caller. AdCP's conformance page calls it an orchestrator and notes orchestrators are not MCP or A2A servers.                                                                   |
| Agent (`Agent`, AdCP context) | Agent (`Agent.json`)      | **False friend.** AdCP: "the authenticated entity making API calls", identified by auth token. AAMP: an A2A card plus registry identity. Auth principal versus published identity document. |
| Signal agent                  | _No counterpart_          | AdCP defines a separate agent role for signal discovery and activation. AAMP has no signal-agent role.                                                                                      |
| Brand agent                   | _No counterpart_          | Serves brand identity, rights and creative approval. No AAMP equivalent role.                                                                                                               |
| Governance agent              | _No counterpart_          | Attached to an account to validate purchases against a plan.                                                                                                                                |
| _No counterpart_              | Registry-registered agent | AAMP's registry issues a trust status that caps pricing access. AdCP has no central registry.                                                                                               |

## How do the buying objects map?

| AdCP term                           | AAMP term                               | What it actually means                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Media buy (`core/media-buy.json`)   | Order (`Order.json`)                    | The campaign container. AdCP: "represents a purchased advertising campaign". AAMP: "campaign container (insertion order) holding one or more lines", merging OpenDirect's Order with the seller's ExecutionOrder. |
| Package (`core/package.json`)       | Line (`Line.json`)                      | The bookable unit inside the campaign. AdCP calls a package "a specific product within a media buy (line item)". AAMP calls a line "the only execution unit on the wire".                                         |
| Product (`core/product.json`)       | Product (`Product.json`)                | The cleanest true match in the whole map. Both mean sellable publisher inventory. AAMP's merges OpenDirect's Product with a taxonomy-driven one.                                                                  |
| Account (`core/account.json`)       | Account (`Account.json`)                | Also a clean match. AdCP: "a billing relationship between a buyer and a seller". AAMP: "commercial relationship between a specific buyer and seller organization", with `account_id` seller-issued.               |
| Proposal (`core/proposal.json`)     | Proposal (`Proposal.json`)              | **False friend.** AdCP: the publisher's recommended plan, where a committed proposal can be executed by `create_media_buy`. AAMP: the buyer's structured offer while a negotiation is open. Opposite authors.     |
| _No counterpart_                    | Package (`Package.json`)                | **False friend the other way.** AAMP's Package is "a curated inventory package for media kit discovery", a bundle offered before any buy exists. AdCP's Package sits inside a buy. Same word, opposite side.      |
| _No counterpart_                    | Media kit (`MediaKit.json`)             | The seller's buyer-facing discovery catalogue, with tier-gated views. AdCP discovers inventory by sending a natural-language brief to `get_products` instead of browsing a catalogue.                             |
| Creative manifest, canonical format | Creative (`Creative.json`) + Assignment | AAMP keeps creative metadata only, "never executable markup". AdCP defines a 13-value canonical format vocabulary, twelve of which have their own schema under `formats/canonical/`, plus a manifest structure.   |

## How do price, quote and negotiation map?

This section is the widest gap in the map, and it runs in AAMP's favour.

| AdCP term                                   | AAMP term                                                                          | What it actually means                                                                                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pricing option (`core/pricing-option.json`) | Rate card (`RateCard.json`)                                                        | AdCP publishes pricing options on a product, discriminated by `pricing_model`, with nine pricing-model schemas in `pricing-options/`. AAMP's rate card is "private to the pair" and never public.                              |
| _No counterpart_                            | Quote (`Quote.json`, `protocol/QuoteRequest.json`)                                 | A non-binding seller price offer, Deals API v1.0 quote phase, 24-hour TTL, convertible into a deal.                                                                                                                            |
| _No counterpart_                            | Negotiation (`Negotiation.json`), `NegotiationMessage`, `NegotiationRoundResponse` | Multi-turn offer history with four actions and per-round and cumulative concession caps.                                                                                                                                       |
| _No counterpart_                            | Deal (`Deal.json`)                                                                 | "A confirmed deal booked from a quote", `deal_id` seller-issued. In AdCP 3.1.10 no schema file and no property is named for a deal; the only structured use of the string is one of four values in `enums/response-type.json`. |
| _No counterpart_                            | Access tier, trust status                                                          | Four tiers gating catalogue visibility and price, capped by a five-value trust lattice. AAMP Explorer publishes [the tier and concession table](https://aampexplorer.noetis.dev/negotiation/).                                 |
| `update_media_buy` (operation)              | ChangeRequest (`ChangeRequest.json`)                                               | AdCP models post-booking modification as an operation. AAMP models it as a first-class object with its own lifecycle.                                                                                                          |

The asymmetry is the finding. AdCP's buy is a purchase against published terms. AAMP's buy is a bilateral negotiation that produces a deal. Neither stack can express the other's transaction without inventing objects.

## How does discovery and trust map?

| AdCP term               | AAMP term                                                                  | What it actually means                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `adagents.json`         | AAMP agent registry                                                        | AdCP publishes authorisation at a domain the publisher controls. AAMP queries a central registry. Domain-hosted versus registry-hosted trust. |
| `brand.json`            | _No counterpart_                                                           | Operator-declared property portfolio with a `relationship` field.                                                                             |
| `get_adcp_capabilities` | Agent card at `/.well-known/agent.json`                                    | Both answer "what can you do". AdCP's is an operation with a schema; AAMP's is a static document.                                             |
| Specialism, storyboard  | _No counterpart_                                                           | A kebab-case capability claim verified by an executable compliance bundle. AAMP has no conformance runner.                                    |
| _No counterpart_        | Trust status (`unknown`, `registered`, `approved`, `preferred`, `blocked`) | Registry-issued, and it caps the buyer's effective access tier.                                                                               |

## How does the real-time layer map?

| AdCP term                         | AAMP term                                                   | What it actually means                                                                                                                                                 |
| --------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trusted Match Protocol (TMP)      | ARTF (Agentic Real-Time Framework)                          | Both are the serve-time layer. They are not compatible and solve different problems.                                                                                   |
| `context_match`, `identity_match` | `RTBExtensionPoint.GetMutations`                            | TMP asks which pre-negotiated packages activate, splitting context from identity for privacy. ARTF asks an in-path agent to mutate an OpenRTB bid request or response. |
| _No counterpart_                  | Mutation, Intent enum (8 values), Operation enum (3 values) | JSON-Patch-shaped edits to a bid object.                                                                                                                               |
| AXE (deprecated)                  | _No counterpart_                                            | AdCP's own predecessor to TMP, deprecated inside the protocol's first year.                                                                                            |
| Transport: direct HTTP            | Transport: gRPC on 50051, MCP tool `extend_rtb` on 50052    | Neither uses the control-plane transport.                                                                                                                              |

## How do signals, audiences and governance map?

| AdCP term                                              | AAMP term                                           | What it actually means                                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Signal definition, `signal_ref`                        | _No counterpart_                                    | AdCP signals are named, referenceable and activatable on a platform and seat.                                                              |
| Audience, audience member, hashed identifier           | _No counterpart in the control plane_               | AdCP uploads first-party hashed CRM audiences via `sync_audiences`.                                                                        |
| _No counterpart_                                       | Embedding, `embedding_space_id` (agentic-audiences) | AAMP's data plane exchanges vectors with consent, TTL and attestation metadata. The two stacks do not model audiences the same way at all. |
| Policy category, restricted attribute                  | _No counterpart_                                    | AdCP encodes regulatory regimes such as `children_directed` and `fair_housing` as registry entries.                                        |
| Audience constraints, property list, content standards | _No counterpart_                                    | 22 of AdCP's 64 operations are governance. AAMP has none.                                                                                  |
| _No counterpart_                                       | ConsentContext (`ConsentContext.json`)              | Privacy consent signals travelling with a deal, carrying GPP and other consent strings.                                                    |
| Sponsored Intelligence (4 operations)                  | _No counterpart_                                    | The phrase returns zero hits across the AAMP corpus.                                                                                       |

## Which terms have no counterpart at all?

| AdCP-only                                                 | AAMP-only                              |
| --------------------------------------------------------- | -------------------------------------- |
| Sponsored Intelligence, `si_initiate_session`             | Quote, Deal, Negotiation round         |
| Specialism, storyboard, compliance runner                 | Access tier, trust status              |
| Policy category, restricted attribute, content standards  | Media kit, avails                      |
| Signal ref, signal activation, seat                       | Embedding space id, embedding taxonomy |
| Brand protocol, rights acquisition                        | ARTF mutation, Intent enum             |
| Trusted Match Protocol, `context_match`, `identity_match` | Change request as an object            |
| `adagents.json`, `brand.json`                             | Central agent registry                 |

## Which pairs are the dangerous ones?

Four rows above are false friends, and they are the ones most likely to survive into a slide deck and cause a design error:

1. **Package.** In AdCP it is a line item inside a purchased buy. In AAMP it is a curated bundle a seller advertises before any buy exists.
2. **Proposal.** In AdCP the publisher writes it. In AAMP the buyer writes it.
3. **Agent.** In AdCP it is the authenticated caller. In AAMP it is a published identity card plus a registry record.
4. **Deal.** AAMP's Deal is the booked outcome and the system of record. AdCP has no deal object, so a mapping table with a Deal row on the AdCP side is wrong.

For how these object-level differences add up to two incompatible architectures, and for the decision framing, read [AdCP vs AAMP on Agentic Ad Lab](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/). For the pins behind every row, see [how these definitions are sourced](/about/sources-and-versions/).
