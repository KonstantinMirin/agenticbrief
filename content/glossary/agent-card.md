---
title: 'Agent Card'
description: "An agent card is an agent's machine-readable identity document, published at a well-known URL. AdCP removed it as a capability source in v3, and AAMP has published no card schema."
answer: 'An agent card is the JSON identity document an agent publishes at a well-known URL under the A2A protocol: who operates it, where its endpoints are, which protocol version it speaks, what skills it claims and how to authenticate against it.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Agent Card'
alternateNames:
  - '/.well-known/agent-card.json'
  - '/.well-known/agent.json'
  - 'A2A agent card'
  - 'adcp-extension.json'
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'agent card advertising'
  - 'well-known agent-card.json'
  - 'a2a agent card'
  - 'adcp agent card'
  - 'aamp agent card'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/whats-new-in-v3.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/by-layer/L0/a2a-guide.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/calling-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/managed-networks.mdx'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/agent_registry.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/models.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/a2a-client.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/RECONCILIATION.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/server/src/a2a/agent-card.ts'
  - 'https://a2a-protocol.org/latest/topics/agent-discovery/'
  - 'https://docs.adcontextprotocol.org/docs/protocol/get_adcp_capabilities'
related:
  - '/agents/agent-registry/'
  - '/agents/discovery-files/'
  - '/agents/seller-agent/'
  - '/agents/buyer-agent/'
  - '/agents/sales-agent/'
  - '/concepts/mcp-and-a2a/'
  - '/negotiation/trust-status/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/operations/get-adcp-capabilities/'
  - 'https://aampexplorer.com/repos/seller-agent/'
  - 'https://agenticadlab.com/guides/agent-discovery-files/'
seeAlso: ['Agent Registry', 'Discovery Files', 'Seller Agent', 'Buyer Agent', 'Trust Status']
reviewState: cto-reviewed
---

An agent card is the JSON document an agent publishes about itself at a well-known URL: who operates it, where its endpoints live, which protocol version it speaks, what skills it claims, and how to authenticate. The format comes from [A2A](/concepts/mcp-and-a2a/), the general agent-to-agent protocol, and advertising inherited it. [A2A 1.0's discovery documentation](https://a2a-protocol.org/latest/topics/agent-discovery/) gives the path as `/.well-known/agent-card.json`.

The fullest worked example in either corpus is the AAMP seller agent's card, served at `GET /.well-known/agent.json` without authentication in `IABTechLab/seller-agent` (v2.4.1).

| Field                                   | What it carries                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `name`, `description`, `url`, `version` | Identity and base URL for all protocol endpoints                                  |
| `provider.name`, `provider.url`         | The organisation operating the agent                                              |
| `capabilities.protocols`                | `opendirect21` today; `a2a` "will be listed once an inbound A2A server ships"     |
| `skills[]`                              | Five declared skills: `discovery`, `pricing`, `proposals`, `negotiation`, `deals` |
| `authentication.schemes`                | `api_key`, `bearer`                                                               |
| `inventory_types`                       | Populated dynamically from the live product catalog                               |
| `supported_deal_types`                  | `pg`, `pmp`, `preferred_deal`, `private_auction`                                  |

## Two A2A shapes and two live filenames

In A2A v0.3 the transport sits at the card root as `url` plus `protocolVersion`. In 1.0 it moves into `supportedInterfaces[]`, with per-interface `url`, `protocolBinding` and `protocolVersion`. A card is structurally an A2A card when it carries one of those two forms. AdCP targets 1.0 and notes that v0.3 "remains widely deployed and is supported through the compatibility period"; its A2A guide documents v0.3 compatibility as opt-in, through `enable_v0_3_compat=True`.

No document reconciles the two filenames in use. A2A 1.0's discovery documentation gives `/.well-known/agent-card.json` and never mentions `agent.json`. AdCP's A2A guide gives `agent.json` twice while showing 1.0-shaped samples; its governance specification and managed-networks guide use `agent-card.json`. The AAMP seller agent serves `agent.json` from its own router while its bundled A2A client fetches `agent-card.json`, and buyer-agent handles both filenames on two code paths inside one repository. A consumer that fetches only one path will miss agents serving the other.

## What a fetched card gives a caller

In AdCP the card still opens the discovery chain, and AdCP's guide to calling an agent is explicit about how little it hands over. An agent card or `tools/list` "returns tool _names_", and "AdCP MCP servers no longer publish per-tool parameter schemas in `tools/list` — every tool shows `{type: 'object', properties: {}}`. Don't try to infer shape from there."

The AAMP seller agent's OpenAPI declares the agent card's 200 response schema as `{}`, and `components.schemas` contains no `AgentCard` at all.

The card still carries the routing fields: operator identity, the transport URL, the protocol version behind it, and the auth scheme. Each of those is verifiable on the first request.

AdCP has a runtime call to fall back on when the card comes back thin. AAMP has none, because no AAMP operation asks an agent what it can do. In AAMP the card is the only capability source, and the file with the empty response schema is what defines it.

## Capability discovery in v3

AdCP v3 moved capability discovery off the file and onto the wire. From the v3 release notes:

> `get_adcp_capabilities` replaces both `adcp-extension.json` and the MCP agent card with runtime capability discovery. It returns supported protocols, account billing models, portfolio information, targeting systems, and governance features — all schema-validated.

Neither `agent-card` nor `agent_card` occurs anywhere in the 3.1.13 schema bundle, and the glossary has no entry for the term. AdCP's A2A guide opens its AdCP Extension section with a note recommending [`get_adcp_capabilities`](https://adcpexplorer.com/operations/get-adcp-capabilities/) and then documents the `extensions` array, on a worked sample carrying `"adcp_version": "2.6.0"` inside a v3 document. The governance property specification still shows a card declaring `capabilities.tasks[]` with seven tasks and `schema_version: "v1"`, which is the static capability declaration v3 removed for sales agents.

## Card shapes in AAMP

| Card                     | Where it lives                            | `capabilities` is                         | Trust field           | Structurally A2A? |
| ------------------------ | ----------------------------------------- | ----------------------------------------- | --------------------- | ----------------- |
| seller-agent `AgentCard` | `/.well-known/agent.json`                 | typed object                              | `trust_status`        | No                |
| buyer-agent `AgentCard`  | registry plus `agent.json`                | list of `AgentCapability`                 | `trust_level`         | No                |
| agentic-direct card      | `/a2a/{role}/.well-known/agent-card.json` | A2A `capabilities`                        | none                  | Yes, A2A v0.3.0   |
| `Agent.json`             | iab-agentic-primitives, unreleased        | typed `AgentCapabilities` plus `skills[]` | `trust_status`        | No                |
| `RegistryAgent`          | the live IAB registry record              | flat `capabilities[]`                     | `verification_status` | No                |

The seller agent serves what its own docstring calls an "A2A-protocol-compliant agent card" at an A2A well-known path, while a code comment in the same repository records that A2A "has no server yet; re-add `a2a` when an inbound A2A endpoint actually exists" — hence a protocol list of `opendirect21` and nothing else. [Trust](/negotiation/trust-status/) is `approved` in one enum and `verified` in the other. IAB Tech Lab's own reconciliation note describes them as "Two incompatible cards" and as "Card schemas incompatible across repos".

The `iab-agentic-primitives` library (v0.5.0) folds both into one `Agent` primitive at `spec/jsonschema/Agent.json`, published under the OpenAPI summary "ONE card schema for both agents". That library is unreleased, and the reconciliation does not reach the live IAB registry, whose record diverges field by field: `agent_id` as a string against `id` as an integer, `name` against `agent_name`, `url` against `endpoint_url` plus `repository_url`, a typed `AgentCapabilities` plus `skills[]` against a flat `capabilities[]` plus `iab_capabilities[]`, one `trust_status` enum against `verification_status` plus `domain_verified` plus `iab_member`.

The two are not being converged: "Rather than break that card ... EP-5.4 adds a new, additive `RegistryAgent` wire model ... the Agent Card is unchanged." IAB Tech Lab's own gap report then marks the card UNVERIFIED, because "trust_status semantics are asserted by our own spec, not against AAMP publications", the tooling having no AAMP card specification to test against.

## AdCP and AAMP side by side

| Question                           | AdCP 3.1.13                                                               | AAMP                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Is the card the capability source? | No. `get_adcp_capabilities` answers at runtime                            | Yes for the seller agent, and it is the only source                                      |
| Path                               | `agent.json` in the A2A guide, `agent-card.json` in governance            | `agent.json` for seller and primitives, `/a2a/{role}/agent-card.json` for agentic-direct |
| Who is found first                 | The publisher domain, through [`adagents.json`](/agents/discovery-files/) | The [registry](/agents/agent-registry/), through `GET /agents?agent_type=seller`         |
| Auth to read                       | Left to the operator                                                      | None. The seller documentation says "No authentication is required"                      |
| Published card schema              | None in the 3.1.13 bundle                                                 | None ratified; `Agent.json` is in an unreleased library                                  |
