---
title: 'Buyer Agent'
description: 'A buyer agent is the demand-side software that turns a campaign brief into booked media. AAMP ships it as a registered, addressable service; AdCP calls the same role an orchestrator.'
answer: 'A buyer agent is the demand-side software in an agentic media transaction: it takes a campaign brief, finds sellers, decides what to buy, books it, and hands the deal ID to a DSP for activation. AdCP calls the role an orchestrator.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Buyer Agent'
alternateNames: ['orchestrator', 'demand-side agent', 'buy-side agent', 'buying agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'buyer agent advertising'
  - 'what is a buyer agent'
  - 'adcp orchestrator'
  - 'iab buyer agent'
citations:
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/README.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/pyproject.toml'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/models.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/client.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/orchestration/multi_seller.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/deps.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/foundations/a2-protocol-architecture.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/push-notification-config.json'
related:
  - '/agents/sales-agent/'
  - '/agents/seller-agent/'
  - '/agents/agent/'
  - '/agents/agent-registry/'
  - '/agents/agent-card/'
  - '/agents/brand-agent/'
  - '/agents/governance-agent/'
  - '/negotiation/trust-status/'
  - '/negotiation/access-tier/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/buyer-agent/'
  - 'https://briefgateway.com/compare/adcp-brief-vs-aamp-campaign-brief/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Sales Agent', 'Seller Agent', 'Agent Registry', 'Agent Card', 'Trust Status']
reviewState: cto-reviewed
---

A buyer agent is the demand-side software in an agentic media transaction: it takes a campaign brief, finds sellers, decides what to buy, and books it. It is not a DSP; it books the media and hands the deal ID to the DSP, which activates it. The AAMP buyer's README states that boundary itself: "Obtain Deal IDs for DSP activation in The Trade Desk, DV360, Amazon DSP, and other platforms."

Both protocols carry the role and shape it differently. AAMP ships a deployable, registered service; AdCP names the role orchestrator. [Scope3's published taxonomy](https://scope3.com/agentic-advertising/brands/) treats the buyer agent as a [brand agent](/agents/brand-agent/) instead; AdCP keeps the two apart, and the brand agent gets its own conformance section in the same file that refuses the buyer one.

## Buyer agent in AAMP

AAMP's buyer is software you deploy. It runs, holds an identity, pushes that identity to a registry other software can query, and answers on HTTP routes of its own. The AAMP hub README calls it a "Reference implementation of demand-side agent logic and decision workflows". Its input is a structured `CampaignBrief`, where AdCP's orchestrator sends a natural-language `brief` string on `get_products`; [Brief Gateway](https://briefgateway.com/compare/adcp-brief-vs-aamp-campaign-brief/) sets the two shapes out field by field.

The discovery flow, from the buyer agent's seller-discovery documentation:

1. Query the [agent registry](/agents/agent-registry/) for sellers: `GET /agents?agent_type=seller&capabilities=ctv`.
2. Fetch each seller's [agent card](/agents/agent-card/): `GET /.well-known/agent.json`.
3. Check its [trust status](/negotiation/trust-status/) at the registry: `GET /verify?agent_url=...`.
4. Transact: quote, negotiate, book.

Before any of that, the buyer publishes itself. `register_buyer(buyer_card)` POSTs the buyer's own card to `{registry}/agents` "so that seller agents can discover and verify this buyer", so a seller can run the same verification in the other direction. AdCP has no equivalent, because it has nothing for a registry to hold.

The buyer agent (`v2.3.0`) exposes 13 OpenAPI paths against the seller agent's 74, and [AAMP Explorer](https://aampexplorer.com/repos/buyer-agent/) reconciles the two vocabularies. Those 13 paths are a control plane for whoever operates the buyer, not an interface a seller calls: `/bookings` and its approvals, `/products/search`, `/events`, `/reports/{job_id}`, orders, two `/meta` routes, `/health`. Card serving is not among them, because `register_buyer()` pushes the card to the registry and the registry is what sellers query.

## Orchestrator in AdCP

The orchestrator is the only role in AdCP's conformance reference with no task table. Every other section opens with a `| Task | Requirement | Notes |` grid of operations the role must implement. "Orchestrator (buyer)" opens with a constraint instead:

> Orchestrators are not MCP/A2A servers — they call sales agent tasks.

In place of a table it gets five obligations, each about how to call somebody else's tasks. A conformant orchestrator MUST authenticate; send the required fields per request schema; handle async task states and webhook delivery of completion artifacts; use `media_buy_id` for every later operation; and respect `creative_deadline`. The constraint is on protocol surface, not on network listeners: no MCP or A2A tools, no agent card, no registry entry, nothing that addresses the orchestrator by name. An inbound listener exists anyway, since `push_notification_config` requires a `url`.

AdCP does not define the role. Its glossary has entries for "Sales Agent" and "Signal Agent" and none for "Buyer Agent" or "Orchestrator", while the phrase runs through the documentation. In the shipped schemas `buyer_agent` appears only inside a description string in `get-adcp-capabilities-response.json`.

The omission is visible in the schemas. `create-media-buy-request.json` requires `idempotency_key`, `account`, `brand`, `start_time` and `end_time`, and carries no buyer object. Identity is the auth token plus an account grant, which `account-authorization.json` calls "The authenticated caller's grant against a specific account". On the buy side the word AdCP uses is the bare "[agent](/agents/agent/)".

| Question                     | AdCP 3.1.13                                                                     | AAMP buyer-agent `v2.3.0`                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Normative role name          | Orchestrator (buyer); "buyer agent" only in learning docs                       | Buyer agent                                                               |
| Is it a server?              | No. "Orchestrators are not MCP/A2A servers"                                     | Yes. It deploys, registers a card, and answers on 13 OpenAPI paths        |
| Published identity           | None specified for the buy side                                                 | Registered in the agent registry with a buyer card                        |
| How it finds counterparties  | `adagents.json` on publisher domains, plus the AgenticAdvertising.org registry  | The AAMP agent registry, queried by `agent_type` and capability           |
| How its authority is bounded | A [governance agent](/agents/governance-agent/) validates the plan before spend | [Access tier](/negotiation/access-tier/), capped by registry trust status |
| Source type                  | Published specification                                                         | Reference implementation at one tag                                       |

AdCP's FAQ files AAMP at the impression layer, and [the hub's comparison](https://agenticadlab.com/protocols/adcp-vs-aamp/) takes that apart. The buyer repository is one of the counterexamples: it books programmatic direct over IAB OpenDirect 2.1 and hands deal IDs to DSPs, which is campaign-layer work.

## Card incompatibility

`iab-agentic-primitives/spec/jsonschema/Agent.json` is where AAMP types its agents, and its `agent_type` defaults to `"buyer"`. Its schema description says the model "Unifies the seller repo's `AgentCard` and `RegisteredAgent` (the buyer repo shipped an incompatible card schema; this model is the single replacement for both)." That replacement is not shipped, because the primitives library is unreleased, so the buyer's own card stays incompatible with the seller's: it calls the trust field `trust_level` where the primitives say `trust_status`. The [agent card](/agents/agent-card/) entry sets out all five shapes in use.

## What a buyer agent needs to transact

An AdCP buy needs a credential, an outbound MCP or A2A client, and a webhook receiver that verifies RFC 9421 signatures against the sales agent's published JWKS. There is no registration step and no published buy-side identity. An AAMP buyer needs the same, plus a deployed service, a published card and a `register_buyer()` call.

The difference shows up in the seller's pricing. `_verified_buyer_context` in the seller agent caps a claimed tier at what the seller can verify.

| What the buyer presents                 | What the seller can verify           | Resulting tier                           |
| --------------------------------------- | ------------------------------------ | ---------------------------------------- |
| An `agent_url` the registry resolves    | The registry record behind the URL   | The claimed tier, capped by trust status |
| A seller-issued API key, no `agent_url` | The key it issued                    | The claimed tier, "trusted as claimed"   |
| Neither                                 | Nothing. "the claim is unverifiable" | Floored to `PUBLIC`                      |

A buyer with only a credential still transacts, at the floor tier, and that tier does not carry to the next seller.
