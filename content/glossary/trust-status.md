---
title: 'Trust Status — unknown, registered, approved, preferred, blocked'
description: 'Trust status in AAMP is a registry-verified five-value lattice that caps how much access a buyer agent can claim. The values, the ceiling map, and the registry that is not finalised.'
answer: 'Trust Status in AAMP is a registry-verified five-value label on an agent — unknown, registered, approved, preferred or blocked — that caps the maximum access tier that agent can claim. It is never self-asserted.'
pubDate: 2026-08-09
term: 'Trust Status'
alternateNames: ['trust lattice', 'agent trust status', 'TrustStatus']
category: identity
cluster: gl-negotiation
keywords:
  - 'buyer agent trust status'
  - 'aamp registry trust'
  - 'agent trust verification advertising'
  - 'trust lattice advertising agent'
  - 'agent registry advertising'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/AgentTrustVerification.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/registry-agent-example/blob/1ff8dda0e487a5a4b8699128c6396a8e116a82be/agent.ts'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/brand.json'
related:
  - '/negotiation/access-tier/'
  - '/negotiation/deal/'
  - '/agents/agent-registry/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/repos/iab-agentic-primitives/'
  - 'https://adcpexplorer.noetis.dev/discovery/adagents-json/'
seeAlso: ['Access Tier', 'Agent Registry', 'Agent Card', 'Deal']
reviewState: cto-reviewed
---

## What is trust status in AAMP?

Trust Status is a five-value label an AAMP seller agent holds about a counterparty agent, resolved against a registry rather than asserted by the agent itself. The canonical definition is in `spec/jsonschema/protocol/AgentTrustVerification.json` in `iab-agentic-primitives`: "Registry-verified trust status of an agent. Determines the maximum `AccessTier` an agent can claim… trust is verified against the AAMP registry (the IAB Tech Lab agent discovery and trust registry), never self-asserted."

The five values are `unknown`, `registered`, `approved`, `preferred` and `blocked`. The seller agent draws the lifecycle as a line with one exit:

```
unknown → registered → approved → preferred
                ↘ blocked
```

**Trust Status is defined by reference implementations, not by a ratified specification.** The schema lives in a library whose README says "WORK IN PROGRESS — NOT YET RELEASED", and the registry it verifies against is not finalised. More on that below.

## What do the five trust status values mean?

| Value        | Definition                                 | How an agent gets it                |
| ------------ | ------------------------------------------ | ----------------------------------- |
| `unknown`    | "Never seen before, not in any registry"   | Default on first contact            |
| `registered` | "Found in the IAB AAMP registry"           | Automatic verification against AAMP |
| `approved`   | "Manually approved by the seller operator" | Operator action                     |
| `preferred`  | "Strategic partner with premium access"    | Operator action                     |
| `blocked`    | "Explicitly blocked — zero data access"    | Operator action                     |

Three of the five are set by a human at the seller. Only `registered` is machine-derived, and only `unknown` is a default. Trust in AAMP is mostly an operator decision recorded in a machine-readable field, which is an honest design given that no registry contract has shipped.

## How does trust status cap an access tier?

Each trust status maps to a maximum access tier. The seller agent publishes the map:

| Trust status | Maximum access tier | Pricing visibility                |
| ------------ | ------------------- | --------------------------------- |
| `unknown`    | `public`            | Published rate card only          |
| `registered` | `seat`              | Seat-level pricing                |
| `approved`   | `advertiser`        | Full advertiser-level pricing     |
| `preferred`  | `advertiser`        | Full pricing plus priority access |
| `blocked`    | None — rejected     | No access, HTTP 403               |

The combination rule is a minimum, not a maximum: "The buyer's **effective tier** is the minimum of their trust-based ceiling and their claimed identity tier. For example, a buyer claiming `advertiser` tier but with `registered` trust status is capped at `seat` tier."

It works in the other direction too. A `preferred` agent presenting a `seat`-level API key gets `seat` access — high trust does not promote a weak credential. See [Access Tier](/negotiation/access-tier/) for what each tier then unlocks in price and in negotiation rounds.

Note that `approved` and `preferred` share the same ceiling. The distinction between them buys priority and custom pricing rules, not a higher tier.

## Which registry verifies AAMP trust status?

That question does not have a settled answer, and the honest version of this definition has to say so.

The seller agent's own documentation states the position: "The IAB Tech Lab AAMP (Agent-to-Agent Marketplace Protocol) registry integration is stubbed pending the public API specification. Currently, agent trust is managed locally by the operator. The `AAMPRegistryClient` will be updated once the AAMP spec is finalized."

The two reference agents also point at different hostnames:

| Repository     | Configured registry URL                                                                      |
| -------------- | -------------------------------------------------------------------------------------------- |
| `seller-agent` | `https://tools.iabtechlab.com/agent-registry` (default for `AGENT_REGISTRY_URL`)             |
| `buyer-agent`  | `https://registry.aamp.iab.com/agent-registry` (production example in seller-discovery docs) |

The AAMP repository that looks like it should define the registry, `registry-agent-example`, defines nothing. It is a 22-line chat agent that consumes an external MCP server through `REGISTRY_MCP_URL`. The registry contract that does exist in the corpus is documented inside the buyer and seller agent repositories, as `GET /agents?agent_type=seller&capabilities=…` and `GET /verify?agent_url=…`.

So: a trust model whose verifying authority is stubbed, addressed by two different hostnames, and specified in neither of the repositories named after it. Anyone planning against AAMP trust today is planning against operator-managed local state.

## Where does the seller store trust status?

Locally, through four operator-facing endpoints: `GET /registry/agents`, `GET /registry/agents/{agent_id}`, `PUT /registry/agents/{agent_id}/trust`, and `POST /registry/agents/discover`. Mutations require an operator API key rather than a buyer key.

The `AgentTrustVerification` object records the result of a lookup: `agent_url` (required), plus optional `agent_id`, `registry_id` ("Registry that answered"), `trust_status` and `verified_at`. The presence of `registry_id` implies more than one registry may answer, which the corpus never resolves.

## Does AdCP have a trust status?

No. AdCP 3.1.10 has no trust enum, no agent trust object and no registry that grades counterparties. Its authorization model is domain-hosted rather than registry-mediated.

An AdCP publisher declares which agents may sell its inventory in a file at `/.well-known/adagents.json`, and a brand declares its identity in `/.well-known/brand.json`. Verification is DNS plus file retrieval plus, for brand relationships, mutual assertion — `brand.json` requires the named house to reciprocate before a claimed relationship counts, and states that house declarations "MUST NOT be used for trust or authorization decisions" on their own. AdCP also anchors signing keys in `adagents.json` rather than in a registry.

The two models differ in where authority sits. AAMP puts it in a central IAB registry that has not shipped. AdCP puts it in files the publisher and brand host themselves, which ship today and can be fetched by anyone. Neither corpus mentions the other; the comparison is made from outside both.

## Where does this definition come from?

| Claim                                           | File                                                   | Version pin                                  |
| ----------------------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `TrustStatus` enum, never self-asserted         | `spec/jsonschema/protocol/AgentTrustVerification.json` | `iab-agentic-primitives` `v0.5.0-1-g2fc7029` |
| Lifecycle, value definitions, trust-to-tier map | `docs/api/agent-discovery.md`                          | `seller-agent` `v2.4.1`                      |
| Effective tier as a minimum                     | `docs/api/authentication.md`                           | `seller-agent` `v2.4.1`                      |
| Registry stubbed pending specification          | `docs/guides/agent-management.md`                      | `seller-agent` `v2.4.1`                      |
| Second registry hostname                        | `docs/api/seller-discovery.md`                         | `buyer-agent` `v2.3.0-24-g0c3a154`           |
| Registry example defines nothing                | `agent.ts`                                             | `registry-agent-example` `1ff8dda`           |
| AdCP domain-hosted authorization                | `dist/schemas/3.1.10/adagents.json`, `brand.json`      | AdCP `3.1.10` (published stable)             |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
