---
title: 'Agent Card'
description: "An agent card is an agent's machine-readable identity document. AAMP builds discovery on it. AdCP removed its agent card extension in v3 and replaced it with a runtime capability call."
answer: "An agent card is a machine-readable identity and capability document an agent publishes at a well-known URL, defined by the A2A protocol. AAMP's seller agent serves one. AdCP removed its own agent card extension in v3."
pubDate: 2026-08-09
term: 'Agent Card'
alternateNames: ['/.well-known/agent.json', 'agent-card.json', 'A2A agent card']
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'agent card advertising'
  - 'well-known agent.json'
  - 'a2a agent card'
  - 'adcp agent card'
citations:
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/a2a-client.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/whats-new-in-v3.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/building/by-layer/L0/a2a-guide.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/calling-an-agent.mdx'
  - 'https://docs.adcontextprotocol.org/docs/protocol/get_adcp_capabilities'
  - 'https://a2a-protocol.org/latest/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/governance/property/specification.mdx'
related:
  - '/agents/agent-registry/'
  - '/agents/discovery-files/'
  - '/agents/seller-agent/'
  - '/agents/sales-agent/'
  - '/concepts/mcp-and-a2a/'
  - 'https://adcpexplorer.noetis.dev/operations/get-adcp-capabilities/'
  - 'https://agenticadlab.noetis.dev/guides/agent-discovery-files/'
seeAlso: ['Agent Registry', 'adagents.json', 'brand.json', 'Seller Agent']
reviewState: cto-reviewed
---

## What is an agent card?

An agent card is a machine-readable document an agent publishes about itself: who operates it, where its endpoints are, which protocol versions it speaks, what skills it claims, and how to authenticate. It comes from the A2A protocol, which AdCP tracks under Linux Foundation governance, and it is fetched over plain HTTP with no authentication.

Both agentic advertising stacks touch agent cards, and they have arrived at opposite conclusions about how much weight to put on one.

## What does an AAMP agent card contain?

AAMP's [seller agent](/agents/seller-agent/) serves one at `GET /.well-known/agent.json`. The documentation calls it "a machine-readable description of the seller agent's identity, capabilities, skills, supported deal types, and authentication requirements. No authentication is required."

| Field                                   | What it carries                                                                                    |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `name`, `description`, `url`, `version` | Identity and base URL for all protocol endpoints                                                   |
| `provider.name`, `provider.url`         | The organisation operating the agent                                                               |
| `capabilities.protocols`                | Supported protocols. `opendirect21` today; `a2a` "will be listed once an inbound A2A server ships" |
| `skills[]`                              | Five declared skills: `discovery`, `pricing`, `proposals`, `negotiation`, `deals`                  |
| `authentication.schemes`                | `api_key`, `bearer`                                                                                |
| `inventory_types`                       | Populated dynamically from the live product catalog                                                |
| `supported_deal_types`                  | `pg`, `pmp`, `preferred_deal`, `private_auction`                                                   |

The card is load-bearing in AAMP. A buyer agent's discovery flow is: query the [agent registry](/agents/agent-registry/) for sellers, fetch each seller's agent card, verify trust, then transact. Take the card away and the flow has no capability step.

`agentic-direct`, the AAMP repository the hub lists as core orchestration, serves cards at a different path: `{base_url}/a2a/{agent_type}/.well-known/agent-card.json`, under A2A protocol version 0.3.0. The buyer agent's A2A client documents the same shape.

## Why did AdCP remove its agent card extension?

Because it decided a static file was the wrong place to declare capabilities that change.

AdCP v2 published capability data as an agent card extension called `adcp-extension.json`. The v3 release notes are unambiguous:

> `get_adcp_capabilities` replaces both `adcp-extension.json` and the MCP agent card with runtime capability discovery. It returns supported protocols, account billing models, portfolio information, targeting systems, and governance features — all schema-validated.

And, in the migration table: "Agent cards and `adcp-extension.json` are no longer needed. Buyers discover sellers through `adagents.json` and call `get_adcp_capabilities` at runtime."

AdCP went further and stopped publishing tool shapes through MCP introspection as well. From `docs/protocol/calling-an-agent.mdx`: "AdCP MCP servers no longer publish per-tool parameter schemas in `tools/list` — every tool shows `{type: 'object', properties: {}}`. Don't try to infer shape from there."

Agent cards have not disappeared from AdCP. They persist at the transport layer, where A2A requires them, and in specific roles: `docs/governance/property/specification.mdx` states that governance agents expose capabilities at `.well-known/agent-card.json`, and the managed-networks troubleshooting guide tells you to `curl` a sales agent's `agent-card.json` to check reachability. What changed is that the card is no longer where AdCP capability data lives.

## Agent card in AdCP vs AAMP

| Question                                 | AdCP 3.1.10                                                                                       | AAMP (seller-agent v2.4.1)                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Is the agent card the capability source? | No. `get_adcp_capabilities` is, at runtime                                                        | Yes. The card is the public capability surface                                                    |
| Path                                     | `.well-known/agent.json` (A2A) and `.well-known/agent-card.json` (governance, sales agent checks) | `/.well-known/agent.json` (seller) and `/a2a/{role}/.well-known/agent-card.json` (agentic-direct) |
| Who is found first                       | The publisher domain, through `adagents.json`                                                     | The registry, through `GET /agents?agent_type=seller`                                             |
| Auth required to read                    | No                                                                                                | No                                                                                                |
| Version negotiation                      | A2A v0.3 and 1.0, with different card shapes                                                      | A2A v0.3.0 in agentic-direct; seller card advertises `opendirect21`                               |

## The filename problem

Two filenames are in circulation for the same concept: `agent.json` and `agent-card.json`. Both appear inside each stack. AdCP's A2A guide says "A2A agents advertise capabilities via Agent Cards at `.well-known/agent.json`", while its governance property specification and its managed-networks guide both use `.well-known/agent-card.json`. On the AAMP side the seller agent serves `agent.json` and `agentic-direct` serves `agent-card.json`.

Neither corpus reconciles this, so a client that only probes one filename will miss half the agents it meets. If you are writing a fetcher, probe both.

## The version shape also changes under you

A2A 1.0 restructured the card. In v0.3 the transport lives at the root as `url` plus `protocolVersion`; in 1.0 it moves into a `supportedInterfaces[]` array with a per-interface `url`, `protocolBinding` and `protocolVersion`. AdCP names 1.0 as the target and notes v0.3 "remains widely deployed and is supported through the compatibility period", with backward compatibility off by default.

So parsing an agent card means handling two card shapes and two filenames before you have learned anything about the agent. That is the actual state of agent discovery in 2026, and no amount of protocol prose changes it.

## Sources and version pins

- `IABTechLab/seller-agent` at `v2.4.1`, commit `2bb7ebc`, `docs/api/agent-discovery.md`. `IABTechLab/buyer-agent` at `v2.3.0`, commit `0c3a154`, `docs/api/a2a-client.md`. `IABTechLab/agentic-direct` at commit `915bda9`.
- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`: `docs/reference/whats-new-in-v3.mdx`, `docs/building/by-layer/L0/a2a-guide.mdx`, `docs/protocol/calling-an-agent.mdx`, `docs/governance/property/specification.mdx`.
- AAMP terms here are sourced from reference implementations, not from a ratified specification.
