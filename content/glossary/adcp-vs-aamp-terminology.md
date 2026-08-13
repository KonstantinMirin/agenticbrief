---
title: 'AdCP and AAMP Terminology Map'
description: 'Eight words appear in both AdCP 3.1.13 and AAMP, and only two mean the same thing. The term-by-term map, with the schema file behind every row.'
answer: 'The AdCP to AAMP terminology map pairs the vocabularies of the two agentic advertising standards term by term, showing which words translate between them. Of the eight words both stacks use, only Product and Account mean the same thing in each.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'AdCP to AAMP terminology map'
alternateNames: ['AdCP AAMP crosswalk', 'AdCP AAMP mapping', 'AdCP AAMP terminology map']
category: protocol
cluster: gl-terminology
keywords:
  - 'adcp vs aamp terminology'
  - 'adcp aamp mapping'
  - 'adcp product vs aamp product'
  - 'adcp media buy vs opendirect order'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/account.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/proposal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/response-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.6/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.6/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.6/faq.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/opendirect/'
  - '/media-buying/package/'
  - '/media-buying/product/'
  - '/negotiation/quote/'
  - '/negotiation/deal/'
  - '/agents/agent/'
  - '/about/sources-and-versions/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
  - 'https://aampexplorer.com/versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://adcpexplorer.com/schemas/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'OpenDirect 2.1', 'Package', 'Proposal', 'Deal', 'Quote']
reviewState: cto-reviewed
---

The AdCP to AAMP terminology map is a term-by-term correspondence between the two agentic advertising vocabularies. Eight words appear in both. Two mean the same thing, four mean something different in each stack, and two exist as objects on only one side. Each row cites the schema file it comes from.

AdCP terms come from the stable 3.1.13 release; the AAMP terms come mostly from `iab-agentic-primitives` v0.5.0, the wire contract both agent repositories pin and which its own front page states is not released. [Neither corpus mentions the other](https://agenticadlab.com/protocols/adcp-vs-aamp/), so no equivalence here has been agreed by either body. The nearest thing to an official comparison is a six-row table in AdCP's FAQ headed "As of April 2026", which calls AdCP "3.0 GA" while the schema registry publishes 3.1.13 and describes AAMP's public schemas as "being defined" against 48 published JSON Schemas. No AAMP document describes AdCP.

## Four shared words that mean different things

| Term                              | In AdCP 3.1.13                                                                            | In AAMP                                                                | What breaks if they are mapped                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Package](/media-buying/package/) | "A specific product within a media buy (line item)"                                       | "Curated inventory package for media kit discovery"                    | AdCP's Package sits inside a buy that already exists. AAMP's is a bundle advertised before anyone has bought anything. |
| Proposal                          | The publisher's strategic recommendation; a committed one executes via `create_media_buy` | The buyer's offer under negotiation, `proposal_id` seller-issued       | The publisher writes one and the buyer writes the other, so the write path inverts.                                    |
| [Agent](/agents/agent/)           | "The authenticated entity making API calls", identified by the auth token                 | An A2A card plus a registry identity record                            | AdCP's Agent is whoever holds the token. AAMP's is a document published in advance.                                    |
| Rate card                         | `rate_card` on `core/account.json`, an opaque identifier with no schema behind it         | `RateCard.json`, a full object, "private to the pair ... NEVER public" | Only AAMP defines what is inside one, and then forbids publishing it.                                                  |

`get_products` returns "products with pricing specific to this account's rate card", so AdCP has rate cards without ever saying what is in one.

## Objects that map by function rather than by name

| AdCP                                         | AAMP                                       | Reading                                                                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Media buy, `core/media-buy.json`             | Order, `Order.json`                        | The campaign container. AAMP merges the buyer's OpenDirect `Order` into the seller's `ExecutionOrder` and the seller's record is authoritative, so after a change request the buyer's copy is a cache. |
| Package, `core/package.json`                 | Line, `Line.json`                          | `Line.json` states that "`Line` is the only execution unit on the wire".                                                                                                                               |
| [Product](/media-buying/product/)            | Product, `Product.json`                    | "Represents available advertising inventory" against "Sellable unit of publisher inventory".                                                                                                           |
| Account, `core/account.json`                 | Account, `Account.json`                    | AdCP's "determines rate cards, payment terms, and billing entity"; AAMP's does the same job.                                                                                                           |
| Natural-language `brief` on `get_products`   | Media kit, `MediaKit.json`                 | A prose brief against a catalogue with tier-gated views: public ranges, exact pricing once the caller authenticates.                                                                                   |
| Creative manifest, 13 canonical format kinds | Creative, `Creative.json`, plus Assignment | AAMP's is "Metadata only — never executable markup". Twelve of AdCP's 13 kinds have a schema under `formats/canonical/`; `custom` does not.                                                            |

They line up this well because AAMP's direct-buying model came from OpenDirect: `agentic-direct` ships `opendirect.json` at version 2.1.0, and `Order.json` describes the AAMP order as a container that "merges the buyer's OpenDirect `Order` with the seller's `ExecutionOrder`". Media buy to Order and Package to Line hold up once the seller's record is accepted as authoritative, which `Order.json` states explicitly. The brief-to-media-kit row is the exception: a prose brief and a tier-gated catalogue answer different questions.

## Agent and seller roles do not line up

| AdCP                                | AAMP                                  | Notes                                                                                                                                |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [Sales agent](/agents/sales-agent/) | [Seller agent](/agents/seller-agent/) | AdCP's is "An MCP server that exposes publisher inventory for discovery and purchase". The phrase "sales agent" is absent from AAMP. |
| Seller (the role)                   | Seller agent                          | AdCP keeps the commercial role and the software apart. AAMP does not.                                                                |
| Orchestrator                        | [Buyer agent](/agents/buyer-agent/)   | `protocol/required-tasks.mdx`: "Orchestrators are not MCP/A2A servers — they call sales agent tasks."                                |

Two of those rows are renamings and survive an integration untouched: sales agent to seller agent, orchestrator to buyer agent. The third is not. AdCP's `seller` is the commercial party and its sales agent is the MCP server answering on that party's behalf. AAMP mints one `agent_id` per agent, hangs trust status off it, and the endpoint becomes the identity, so one seller agent fronting two publishers books both publishers' inventory under a single identity. AAMP publishes no field binding an `agent_id` to a commercial party.

The registry that mints every AAMP `agent_id` has one published implementation, an eight-file example repository, and no conformance suite runs anywhere in the corpus. AdCP publishes a numbered stable release and a compliance runner that reports a pass or a fail.

## Terms with no counterpart

Eleven concepts exist in AdCP with nothing to map onto in AAMP:

- [Signal agent](/agents/signal-agent/)
- [Brand agent](/agents/brand-agent/)
- [Governance agent](/agents/governance-agent/), 22 operations
- [`adagents.json` and `brand.json`](/agents/discovery-files/)
- Specialism, plus a compliance runner that executes storyboards
- [Signal definition](/signals/signal-definition/) and `signal_ref`
- [Audience](/signals/audience-vs-signal/), hashed identifiers, `sync_audiences`
- [Policy categories](/governance/policy-category/), a ten-value enum
- [Sponsored Intelligence](/concepts/sponsored-intelligence/), 4 operations
- Nine `*-option.json` pricing models under `pricing-options/`
- AXE, deprecated in AdCP's first year and replaced by [Trusted Match](/realtime/trusted-match-protocol/)

Ten exist in AAMP with nothing to map onto in AdCP:

- Registry-registered agent, `agent_id` minted at registration
- Media kit, `MediaKit.json`, tier-gated catalogue
- [Quote](/negotiation/quote/), `Quote.json`, non-binding, carries `expires_at`
- Negotiation: `accept`, `counter`, `final_offer`, `reject`, with a round counter
- [Deal](/negotiation/deal/), `Deal.json`, `deal_id` seller-issued
- [Access tier](/negotiation/access-tier/) and [trust status](/negotiation/trust-status/)
- `ChangeRequest.json`, post-booking change with its own lifecycle
- Mutation and the nine-value [Intent](/realtime/artf-intent/) enum
- Embedding and `embedding_space_id`, in `agentic-audiences`
- `ConsentContext.json`, carrying all three interoperable consent-string carriers

AdCP's buy is a purchase against published terms, and nothing moves between the published price and the signature. AAMP's is a bilateral negotiation that ends holding a deal object which did not exist when the conversation started. In the other direction, AdCP's governance and signals vocabulary has no AAMP counterpart of any kind: `CreativeApproval` and `DecisionRecord` exist inside the seller reference implementation, on no wire, and AAMP's audience work is a vector-scoring prototype whose `specs/v1.0/schema/agent_interface.schema.json` is zero bytes.

## What breaks if the two vocabularies are swapped

Three points do not survive a translation layer. AdCP can name the commercial party behind a call and AAMP names the endpoint, so one agent representing two sellers collapses them. A `get_products` brief and a tier-gated media kit are different transactions rather than two spellings of one. Quote, negotiation round and deal are AAMP objects with no AdCP equivalent, so a build on AdCP's vocabulary has nowhere to record a price that moves before signature.

The stack-level argument is at [Agentic Ad Lab](https://agenticadlab.com/protocols/adcp-vs-aamp/). The AAMP pins behind this map are listed in [AAMP Explorer](https://aampexplorer.com/versions/), the AdCP schema surface in [AdCP Explorer](https://adcpexplorer.com/schemas/). Related terms: [package](/media-buying/package/), [product](/media-buying/product/), [quote](/negotiation/quote/), [deal](/negotiation/deal/), [agent](/agents/agent/), [OpenDirect 2.1](/concepts/opendirect/).
