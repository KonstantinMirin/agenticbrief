---
title: 'Seller Agent'
description: "A seller agent is AAMP's supply-side agent: it publishes a media kit, prices by buyer tier, negotiates and books deals. AdCP's glossary calls the same role a sales agent."
answer: "A seller agent is AAMP's supply-side agent: it publishes a media kit, prices by buyer tier, negotiates and books deals. AdCP's glossary calls the same role a sales agent while its schemas ship a seller_agent field."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Seller Agent'
alternateNames: ['supply-side agent', 'publisher agent', 'sell-side agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'seller agent advertising'
  - 'what is a seller agent'
  - 'iab seller agent'
  - 'aamp seller agent'
citations:
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/architecture/overview.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/reference/endpoints.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/buyer-guide.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/seller-agent-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/available-package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/media-buy-valid-action.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/pricing-options/cpm-option.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/specification'
related:
  - '/agents/sales-agent/'
  - '/agents/buyer-agent/'
  - '/agents/agent-card/'
  - '/agents/agent-registry/'
  - '/agents/discovery-files/'
  - '/negotiation/trust-status/'
  - '/negotiation/access-tier/'
  - '/negotiation/quote/'
  - '/realtime/trusted-match-protocol/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/seller-agent/'
  - 'https://aampexplorer.com/negotiation/'
seeAlso: ['Sales Agent', 'Buyer Agent', 'Agent Card', 'Trust Status', 'Access Tier']
reviewState: cto-reviewed
---

A seller agent is supply-side software that publishes a catalog of inventory, prices it by the buyer's verified identity tier, evaluates proposals, runs a bounded price negotiation, and mints a deal ID for DSP activation. No ratified specification defines the role. IAB Tech Lab's reference seller agent is the working definition, and it calls itself "an AI-powered inventory management system for publishers and SSPs ... using IAB Tech Lab standards (OpenDirect 2.1, Deals API v1.0, sellers.json)".

Seller agent and sales agent name the same job. AdCP's glossary has no entry for Seller Agent and defines [Sales Agent](/agents/sales-agent/) instead, while its documentation uses both words and its schemas ship a `seller_agent` field. The phrase "sales agent" does not appear in the IAB Tech Lab repositories. The term is tied to neither protocol: Magnite's SpringServe implementation is AdCP over MCP, announced as "Why We Built a Seller Agent Into SpringServe", and that post does not mention IAB Tech Lab.

## What the seller agent exposes

`GET /.well-known/agent.json` needs no authentication and declares five skills: `discovery`, `pricing`, `proposals`, `negotiation` and `deals`. Those cover searching and browsing inventory, media kits and packages; pricing by buyer identity; accepting and evaluating proposals including counter-offers; running automated multi-round price negotiation; and minting OpenRTB-compatible deal IDs for DSP activation. The [agent card](/agents/agent-card/) entry sets the file out field by field.

The card lists `supported_deal_types` as `pg`, `pmp`, `preferred_deal`, `private_auction`; the shared primitives schema documents the same field as `'PG'`, `'PD'`, `'PA'`. Nothing in either repository reconciles the two spellings. `capabilities.protocols` lists `opendirect21` and nothing else, and the discovery guide calls A2A "designed but not yet served". What ships today is REST and MCP, and nothing else in AAMP carries a buyer from discovery to a deal ID.

## Pricing by buyer tier

Price depends on the buyer's [access tier](/negotiation/access-tier/), which registry [trust status](/negotiation/trust-status/) caps. The buyer presents identity, the seller derives a tier, and the buyer's "effective tier is the minimum of their trust-based ceiling and their claimed identity tier". Of the five trust values only `registered` is automatic; the rest are operator decisions in the [agent registry](/agents/agent-registry/).

Tier then picks the negotiation strategy. The strategy name describes the seller's stance, so `aggressive` is the least generous of the four.

| Access tier  | Strategy     | Rounds | Concession cap per round | Cap across the negotiation |
| ------------ | ------------ | ------ | ------------------------ | -------------------------- |
| `public`     | `aggressive` | 3      | 3%                       | 8%                         |
| `advertiser` | `premium`    | 6      | 6%                       | 20%                        |

Two tiers sit between those two, and [AAMP Explorer](https://aampexplorer.com/negotiation/) has the full table.

`POST /proposals/{proposal_id}/counter` submits a counter-offer. Beside it sit `GET /proposals/{proposal_id}/negotiation` and a [quote](/negotiation/quote/) endpoint pair, quotes being "non-binding price offers" with a 24-hour TTL. The canonical negotiation surface, `POST /api/v1/negotiations/messages`, lists `idempotency_key` among the two required properties of `NegotiationMessage` and documents it as "Same key -> same response, no duplicate side effects". The negotiation router contains no idempotency handling: the key is required by the schema on every message and honoured on none.

## What a seller agent needs around it

The seller agent sits in front of the ad server rather than replacing it. An `AdServerClient` connector fronts the real one (Google Ad Manager, FreeWheel, or a CSV adapter for demos), and the agent keeps its own state in SQLite or Redis. What it adds is the selling. `POST /api/v1/deals/distribute` "routes the deal to the appropriate SSP based on routing rules": PubMatic over MCP, Index Exchange and Magnite over REST. `POST /api/v1/deals/push` sends deal terms straight to buyer DSPs over IAB Deals API v1.0. `GET /api/v1/supply-chain` parses a sellers.json into an OpenRTB-compatible schain. The ad server, the SSP relationship and the sellers.json entry are all assumed to be in place already.

## Seller agent in AdCP

AdCP models no negotiation surface: its media-buy action enum runs to 21 values and none is a negotiation. It registers that the haggling happens, since `pricing-options/cpm-option.json` says declared adjustments tell "buyer agents which adjustments are available before negotiation", and it does not model the negotiation itself.

AdCP's Trusted Match specification defines the term once, in its definitions table:

> **Seller agent** | The buyer-side agent that sold the package into a publisher. Identified by the agent URL declared in the publisher's `adagents.json` `authorized_agents[].url`.

That places the role on both sides of the trade at once, since `adagents.json` is a publisher's sell-side [authorization file](/agents/discovery-files/). Two other AdCP documents disagree: the Trusted Match buyer guide calls the counterparty "the publisher's sales agent", and `brand.json` describes its own `seller_agent_url` field as the "URL of the sales agent that sells inventory for this collection". The two available readings, an editorial slip or a platform-side reseller distinct from the publisher's own sales agent, are set out on [sales agent](/agents/sales-agent/).

The field is required whichever reading wins. `seller_agent` sits on `trusted-match/available-package.json` next to `package_id` and `media_buy_id`, carries `x-status: experimental` like [Trusted Match](/realtime/trusted-match-protocol/) itself, and holds an `agent_url` copied from the publisher's `adagents.json` plus an `id` "Reserved for a future registry-assigned stable seller identifier. Not used today". The field records which agent sold a package; no operation reads it.

## Where the wire contract lives

The shared types are not in the seller repository. `pyproject.toml` pins `iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0`, and that library holds `Quote`, `Negotiation`, `Proposal`, `MediaKit`, `Deal` and `Agent`. Its own README says it is unstable, [not yet released](https://aampexplorer.com/versions/) and not to be depended on in production; both shipping agents depend on it anyway, by git URL, at runtime, and it is not among the repositories the AAMP hub README lists.

Each AAMP repository versions independently, and the seller repository's own [version numbers disagree with each other](https://aampexplorer.com/versions/), so `v2.4.1` is a repository tag rather than an AAMP release.

## Roles AAMP does not define

AAMP has no brand agent, no governance agent, no signal agent and no creative agent. Three of those jobs still get done, as endpoints rather than agents. Identity is `PUT /registry/agents/{agent_id}/trust`, an operator raising or blocking a trust status by hand. Policy is `POST /approvals/{approval_id}/decide`, a human decision stamped with the principal from the authenticated API key. Signal is `POST /agentic-audience/match`, whose own description calls the score "mock-quality (deterministic from sha256 of `identifier`)" with the real embedding model deferred to a later epic. The fourth job has no endpoint: AAMP has no creative agent and nothing equivalent to AdCP's creative operations.
