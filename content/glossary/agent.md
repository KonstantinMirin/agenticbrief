---
title: 'Agent'
description: 'In AdCP an agent is the authenticated caller, distinct from a sales agent and from an AI assistant. In AAMP an agent is a party record the registry issues.'
answer: 'In AdCP an agent is the authenticated caller identified by its auth token, distinct from a Sales Agent (the server exposing inventory) and an AI Agent (the assistant), while AAMP makes an agent a registry-issued record instead.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Agent'
alternateNames: ['authenticated caller', 'principal']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'agent definition advertising'
  - 'what is an agent in adcp'
  - 'adcp principal deprecated'
  - 'agent vs ai agent advertising'
  - 'adcp authenticated caller'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/building/by-layer/L2/accounts-and-agents'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/by-layer/L2/accounts-and-agents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/sync_agent_notification_configs.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/quickstart.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/advanced-topics/accounts-and-security.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-scope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/account-scope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/billing-party.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/signal-source.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/aao/agent-publishers.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/primitives/identity.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/primitives/Agent.golden.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
related:
  - '/agents/sales-agent/'
  - '/agents/buyer-agent/'
  - '/agents/agent-registry/'
  - '/agents/agent-card/'
  - '/agents/discovery-files/'
  - '/negotiation/trust-status/'
  - '/negotiation/access-tier/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.com/areas/account/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
seeAlso: ['Sales Agent', 'Buyer Agent', 'Agent Card', 'Agent Registry', 'Trust Status']
reviewState: cto-reviewed
---

An agent, in AdCP, is the authenticated entity making API calls, identified by its authentication token. The definition is narrow: it covers a brand's in-house team and an unattended buying system equally. An AdCP agent can be a cron job holding an API key, with no model anywhere in the loop. AdCP's FAQ describes AdCP as a protocol that lets AI agents collaborate across advertising platforms, but the glossary definition covers whatever software authenticates.

| Term                                | What it is                                  | How it is identified                      |
| ----------------------------------- | ------------------------------------------- | ----------------------------------------- |
| Agent                               | The authenticated entity making API calls   | Authentication token                      |
| [Sales Agent](/agents/sales-agent/) | The MCP server exposing publisher inventory | Endpoint URL, declared in `adagents.json` |
| AI Agent                            | The AI assistant a human talks to           | Not a protocol object                     |

AAMP uses `agent` for a registry record. The two definitions differ on four points:

| Question                       | AdCP 3.1.13                                                                     | AAMP                                                                |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| What "agent" primarily denotes | The authenticated caller                                                        | A registry-issued party record                                      |
| Identity comes from            | A token, plus a signature or a per-seller onboarding record                     | An `agent_id` minted by the registry at registration                |
| Enumerated?                    | No. Role qualifiers are documentation headings and `supported_protocols` values | Yes. `AgentType` has five values                                    |
| Does identity affect price?    | No                                                                              | Yes. `trust_status` caps the tier, the tier caps pricing visibility |

## Agent in AAMP

In AAMP an agent is a record the registry issues at registration. In the unreleased `iab-agentic-primitives` library (v0.5.0), `identity.py` makes `agent_id` required on the `Agent` model, and the [registry](/agents/agent-registry/) mints it. `AgentType` is a closed enum of `buyer`, `seller`, `tool_provider`, `data_provider` and `other`, so [`buyer`](/agents/buyer-agent/) is one of its values; AdCP's role names are documentation headings. [`TrustStatus`](/negotiation/trust-status/) has five values, is "never self-asserted", and caps the [access tier](/negotiation/access-tier/) an agent can trade at.

AAMP publishes no glossary, and the record itself is specified only in that unreleased library. AdCP's published schemas contain no equivalent to `agent_id`.

## Role qualifiers

AdCP's conformance reference organises the protocol by role, and its section headings are the canonical list. Each role is defined by the operations it must implement, and an agent declares which it plays through `supported_protocols`.

| Role                                          | Domain claim in `supported_protocols`                   |
| --------------------------------------------- | ------------------------------------------------------- |
| Sales agent (seller)                          | `media_buy`                                             |
| Orchestrator (buyer)                          | none; orchestrators are not servers                     |
| Creative agent                                | `creative`                                              |
| [Signal agent](/agents/signal-agent/)         | `signals`                                               |
| [Brand agent](/agents/brand-agent/)           | `brand`, plus `sponsored_intelligence` for the SI tasks |
| [Governance agent](/agents/governance-agent/) | `governance`                                            |
| Content standards agent                       | `governance`                                            |
| Creative governance agent                     | `governance`                                            |

The three governance roles all claim the same `governance` domain. Nothing in `supported_protocols` tells them apart; they are separated only by the documentation sections that define them.

In 3.1.13 `supported_protocols` accepts `media_buy`, `signals`, `governance`, `sponsored_intelligence`, `creative`, `brand` and `measurement`. `measurement` is experimental and scoped to catalog discovery. The qualifier records which operations the agent is expected to serve; the entity itself is an agent as soon as it authenticates.

## Agent, account, brand and operator

AdCP's accounts and agents guide separates four entities that a billable operation involves, and Agent is the one most often collapsed into the other three. Brand answers whose products are advertised, resolved via `/.well-known/brand.json`. Account answers who gets billed and at what rates. Operator answers who acts on the brand's behalf, identified by domain. Agent answers what software is placing the buy, identified by the authenticated session, and its gloss adds that an agent "may operate on behalf of multiple operators and brands."

Consolidated billing has a value of its own: `agent` is one of three accepted values of [`supported_billing`](https://adcpexplorer.com/areas/account/), the agent that "consolidates billing across brands and is invoiced by the seller". One credential can therefore be invoiced for buys placed across several brands.

## How AdCP identifies the caller

Nothing in an AdCP request body names the caller. A `tools/call` for `get_products` carries a bearer token in the header and campaign arguments in the payload, and AdCP's accounts and security guide describes what happens next: "The server validates this token and identifies the agent making the request." `enums/error-scope.json` defines a per-buyer-agent rejection scope and attaches a condition to it:

> Sellers MUST emit per-agent scope only when buyer-agent identity has been established via signed-request derivation or a credential-to-agent mapping in the seller's onboarding record; emitting it without established identity is a cross-tenant onboarding oracle.

The condition is on established identity, not on a successful login. Emitting the scope without established identity discloses whether the caller's credential maps to an onboarded agent.

Three things carry identity. A token arrives on the request. An [`authorized_agents[].url` entry](/agents/discovery-files/) sits on the publisher's domain. A commercial mapping sits in an onboarding record the caller cannot read. The AAO directory maps `agent_url` to publishers and its schema declines to let that mapping confer trust, since "The publisher's own adagents.json remains the trust root". No AdCP document states which of the three is authoritative.

## `principal` (deprecated)

AdCP retired the word in its glossary, flagged the entry _Deprecated term_, and split it into Account (billing, rate cards, platform mappings) and Agent (authentication and API access). The term remains in the documentation, including inside MUST clauses: the `sync_agent_notification_configs` reference states that "This task MUST only be accepted when the transport request resolves to a stable authenticated principal". It also survives in schema descriptions in the 3.1.13 registry, where `error-code.json` explains `CREDENTIAL_IN_ARGS` in terms of "buyer-principal credentials that should arrive on the inbound transport". It is never a JSON key, so no parser breaks on it. Each surviving use has to be read as either the Account sense or the Agent sense.

## `agent` as an enum value

The literal string `agent` is an enum value in the 3.1.13 schema bundle, and it denotes something different in each file that carries it.

| Enum file                  | What `agent` means there                                        |
| -------------------------- | --------------------------------------------------------------- |
| `enums/billing-party.json` | The party the seller invoices                                   |
| `enums/account-scope.json` | An account with no brand or operator split                      |
| `enums/error-scope.json`   | The per-buyer-agent authorization axis                          |
| `enums/signal-source.json` | A signal source addressed by `agent_url`, not the caller at all |

In `signal-source.json` alone, `agent` denotes the signal vendor addressed by `agent_url`, "Signal native to a signal source identified by agent_url", and not the caller.
