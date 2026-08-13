---
title: 'Sales Agent (AdCP)'
description: 'A sales agent is the AdCP server that exposes publisher inventory for discovery and purchase. Seven required tasks, at least one transport, and authorisation in adagents.json.'
answer: 'A sales agent is the seller-side server that exposes publisher inventory for discovery and purchase under AdCP, a role AAMP calls a seller agent and the newer AdCP schemas do too.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Sales Agent'
alternateNames: ['seller agent', 'sell-side agent', 'publisher agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'sales agent vs seller agent'
  - 'what is a sales agent in advertising'
  - 'adcp sales agent'
  - 'sales agent definition advertising'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/architecture.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/index.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/intro.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/seller-agent-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029/spec/jsonschema/Negotiation.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a154/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
related:
  - '/agents/seller-agent/'
  - '/agents/buyer-agent/'
  - '/realtime/trusted-match-protocol/'
  - '/agents/agent/'
  - '/agents/discovery-files/'
  - '/agents/governance-agent/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/discovery/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Seller Agent', 'Buyer Agent', 'Agent', 'adagents.json', 'Trusted Match Protocol']
reviewState: cto-reviewed
---

A sales agent is the seller-side server that exposes publisher inventory for discovery and purchase under AdCP. The seller is the commercial entity; the sales agent is the software it runs, and one seller may operate more than one [agent](/agents/agent/).

AdCP's glossary keeps the two apart. The sales agent "handles product discovery, media buy creation, and campaign management", with "publisher ad servers exposing AdCP interfaces, sales house platforms" given as examples; the seller is "the AdCP participant role that provides advertising inventory... In AdCP schemas, 'seller' is the standard term for this role (not 'platform')".

## What a sales agent must implement

AdCP's required-tasks reference heads its Media Buy section "Sales agent (seller)" and marks thirteen tasks Required, Conditional or Optional, seven of them Required.

| Task                           | Requirement | Notes                                                    |
| ------------------------------ | ----------- | -------------------------------------------------------- |
| `get_products`                 | Required    | Inventory discovery                                      |
| `get_adcp_capabilities`        | Required    | Agent capabilities; sellable formats stay product-scoped |
| `create_media_buy`             | Required    | Campaign creation and order confirmation                 |
| `update_media_buy`             | Required    | Budget, targeting, pause, cancel                         |
| `get_media_buys`               | Required    | Operational state retrieval                              |
| `get_media_buy_delivery`       | Required    | Package-level delivery metrics                           |
| `provide_performance_feedback` | Required    | Accept buyer optimisation signals                        |
| `sync_creatives`               | Conditional | When the sales agent hosts a creative library            |
| `log_event`                    | Conditional | When event sources are configured                        |
| `list_creatives`               | Optional    | Creative catalog browsing                                |
| `sync_catalogs`                | Optional    | Product/inventory catalog sync                           |
| `sync_event_sources`           | Optional    | Conversion tracking setup                                |
| `sync_audiences`               | Optional    | First-party CRM audience upload                          |

`get_adcp_capabilities` is required of every AdCP agent rather than of sales agents specifically. The same section sets the transport rule: "Sales agents MUST also support at least one transport (MCP or A2A) and declare `media_buy` in `supported_protocols`." [MCP and A2A](/concepts/mcp-and-a2a/) are the two agent transports AdCP runs on, and a sales agent picks at least one. These tasks are the [media_buy](https://adcpexplorer.com/areas/media-buy/) subset of AdCP's operation registry.

The operators in scope are listed in `docs/protocol/architecture.mdx`: "publishers, sales houses, rep firms, SSPs, and ad networks". Buy-side-only participants call sales agents rather than operating them.

## Authorisation is published in adagents.json

A publisher declares which sales agents may sell its inventory in `adagents.json`, served at `/.well-known/adagents.json` alongside the other [discovery files](/agents/discovery-files/). One entry names a URL, what it covers, and how the authorisation is scoped:

```json
{
  "url": "https://sales.news.example.com",
  "authorized_for": "All news properties",
  "authorization_type": "property_tags",
  "property_tags": ["news"]
}
```

`authorization_type` takes six values. Four of them scope inventory; the other two, `signal_ids` and `signal_tags`, authorise a [signal agent](/agents/signal-agent/) instead. The full field list is in [AdCP Explorer's discovery view](https://adcpexplorer.com/discovery/).

## Sales agent and seller agent

Both names denote the same role, and both resolve to the same identifier: the `agent_url` declared in the publisher's `adagents.json`. AdCP's prose uses "sales agent" and the AAMP repositories use [seller agent](/agents/seller-agent/); AdCP schemas added since 3.0.1 use "seller agent" as well. `core/seller-agent-ref.json`, titled "Seller Agent Reference" and stamped `x-status: experimental`, carries one required property, `agent_url`, "as declared in the property publisher's adagents.json `authorized_agents[].url`". [Trusted Match](/realtime/trusted-match-protocol/) binds every available package to one of those references at sync time.

AdCP uses the two names inconsistently across its own sources:

| Where AdCP says it                     | What it calls the role   | What it says there                                                                       |
| -------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `docs/reference/glossary.mdx`          | Sales Agent              | An MCP server exposing publisher inventory. Supply side, the publisher's own software.   |
| `docs/trusted-match/specification.mdx` | Seller agent             | "The buyer-side agent that sold the package into a publisher."                           |
| `dist/schemas/3.1.13/adagents.json`    | sales agents             | "Array of sales agents authorized to make inventory from this file available to buyers." |
| `docs/governance/property/index.mdx`   | `SELLER AGENT (DSP/SSP)` | A diagram box, which reads the seller agent as whichever platform sold the package.      |
| `docs/intro.mdx`                       | seller agent             | Describes a repository named `salesagent` as "a full-stack seller agent".                |

The specification does not reconcile the readings. The [word pair](/concepts/adcp-vs-aamp-terminology/) is treated at length on the terminology page.

"Sales agent" also predates the protocol. In media it means a rep firm or sales house selling inventory on a publisher's behalf, staffed by people, a sense that remains in common use and that AdCP's glossary entry nods to when its examples end on "sales house platforms".

## AdCP and AAMP side by side

| Question                     | AdCP 3.1.13                                                                              | AAMP                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Name for the sell-side agent | Sales agent                                                                              | Seller agent                                                                         |
| Source type                  | Published specification with a versioned schema registry                                 | Reference implementations, no ratified wire spec                                     |
| Capability discovery         | `get_adcp_capabilities`, a runtime task                                                  | An [agent card](/agents/agent-card/) at `/.well-known/agent.json`                    |
| Price negotiation            | Pricing options and rate cards, no counter-offer surface or quote object in the registry | `Quote.json`, `Proposal.json`, `Negotiation.json` in `iab-agentic-primitives` v0.5.0 |
| Sell-side authorisation      | `adagents.json` on the publisher domain                                                  | Trust status in an [agent registry](/agents/agent-registry/)                         |

AAMP's schemas do not use the phrase "sales agent". `iab-agentic-primitives/spec/jsonschema/Agent.json` defines `AgentType` as a five-value enum, `buyer`, `seller`, `tool_provider`, `data_provider` and `other`, defaulting to `buyer`. AAMP also has no single release number: each of its repositories versions independently, so "seller agent v2.4.1" is a per-repo tag rather than an AAMP version.

AdCP's buy-side counterpart is an orchestrator, the buyer-side client that drives the buy, and required-tasks is explicit that orchestrators "are not MCP/A2A servers — they call sales agent tasks." AAMP's [buyer agent](/agents/buyer-agent/) ships an HTTP API of its own, titled "Ad Buyer Agent API".

Related roles: plan validation belongs to a [governance agent](/agents/governance-agent/) and brand identity to a [brand agent](/agents/brand-agent/), following the separation `docs/trust.mdx` draws between the agent that spends money and the agent that approves the spend. The protocols are compared side by side at [AdCP vs AAMP](https://agenticadlab.com/protocols/adcp-vs-aamp/).
