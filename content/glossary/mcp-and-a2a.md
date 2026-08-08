---
title: 'MCP and A2A: What AdCP and AAMP Actually Run On'
description: 'MCP and A2A are the agent transports under AdCP and AAMP. What each stack pins, why AdCP versions ride on the payload, and the task-state trap that breaks callers.'
answer: 'MCP (Model Context Protocol) and A2A (Agent2Agent Protocol) are agent transports, not advertising standards. AdCP runs its 64 operations over either one. AAMP adds a third path, REST over OpenDirect 2.1, alongside MCP and A2A.'
pubDate: 2026-08-09
term: 'MCP and A2A'
alternateNames: ['Model Context Protocol', 'Agent2Agent Protocol', 'A2A', 'MCP']
category: protocol
cluster: gl-adcp
keywords:
  - 'adcp transport'
  - 'mcp vs a2a advertising'
  - 'what does adcp run on'
  - 'aamp transport protocols'
citations:
  - 'https://modelcontextprotocol.io/'
  - 'https://a2a-protocol.org/latest/'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/calling-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/building/by-layer/L0/a2a-guide.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/building/concepts/industry-landscape.mdx'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/opendirect/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.noetis.dev/areas/protocol/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'OpenDirect 2.1', 'Agent Card']
reviewState: cto-reviewed
---

## What are MCP and A2A, and why do advertising protocols need them?

MCP is the Model Context Protocol, published by Anthropic, which defines how a model calls external tools. A2A is the Agent2Agent Protocol, originated at Google and now tracked under Linux Foundation governance, which defines how autonomous agents exchange messages and long-running tasks.

Neither knows anything about advertising. They carry bytes and task lifecycle. AdCP and AAMP define the advertising payloads that travel over them. Getting this boundary right removes most of the confusion in the category: "we support MCP" is a statement about plumbing, not about whether a system can sell inventory.

AdCP's own documentation calls itself transport-agnostic. `docs/protocol/required-tasks.mdx:49` makes the requirement concrete: "Sales agents MUST also support at least one transport (MCP or A2A) and declare `media_buy` in `supported_protocols`." One transport, either one.

## What does AdCP run on?

Both, at the implementer's choice, with the same task definitions on each.

|                               | MCP                                                                | A2A                                                              |
| ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Framing                       | JSON-RPC 2.0 over Streamable HTTP, responses as server-sent events | `message/send` carrying a `DataPart` of shape `{ skill, input }` |
| Discovery                     | `tools/list`                                                       | Agent card                                                       |
| Where the typed response sits | Tool result                                                        | `task.artifacts[0].parts[0].data`                                |
| Version handshake             | MCP `protocolVersion` on `initialize`                              | None                                                             |

That last row explains a design decision people ask about. MCP carries its own `protocolVersion` on the `initialize` handshake, which versions the MCP wire, not the AdCP payload. A2A has no equivalent to `initialize`. So AdCP puts `adcp_version` on the payload itself, where both transports can carry it (`docs/reference/versioning.mdx:108-110`). An MCP server negotiated at `2025-06-18` can speak AdCP 3.0 or 3.1; the two version numbers are independent.

On the A2A side AdCP tracks the published specification rather than pinning a frozen copy. The A2A guide states that A2A 1.0 is the target wire format while v0.3 "remains widely deployed and is supported through the compatibility period", and documents the migration: the root `url` and `protocolVersion` of v0.3 are replaced in 1.0 by a `supportedInterfaces[]` array with per-interface bindings.

One inconsistency to check before you cite AdCP on A2A governance: the industry overview page still gives A2A's maintainer as Google, while the A2A implementation guide in the same repository says AdCP tracks the specification "under Linux Foundation governance". The guide is the more current of the two.

## What does AAMP run on?

Three transports in parallel, which is one more than AdCP, and the extra one is the reason AAMP's object model looks different.

The buyer agent's protocol overview lists them with an explicit selection rule:

- **MCP** is the default for automated tool operations. Deterministic, structured tool calls.
- **A2A** carries JSON-RPC 2.0 and natural language, used for "exploratory discovery and complex negotiations where natural language interpretation adds value". Non-deterministic by design.
- **REST over OpenDirect 2.1** exists for operator dashboards and legacy integrations.

`agentic-direct` pins A2A explicitly: its agent card sets `protocolVersion: '0.3.0'` (`server/src/a2a/agent-card.ts:39`), the version AdCP treats as the compatibility tier rather than the target.

ARTF, AAMP's real-time plane, uses neither of the above as its primary path. It defines a gRPC service, `RTBExtensionPoint.GetMutations`, on port 50051, and exposes an MCP tool called `extend_rtb` on port 50052 as a secondary surface.

## What is the counterpart mapping between the stacks?

MCP and A2A are the one part of the two stacks that genuinely is shared. Both use the same two transports for their control plane. Everything above them differs.

| Concern                          | AdCP                                                | AAMP                                    |
| -------------------------------- | --------------------------------------------------- | --------------------------------------- |
| Structured tool calls            | MCP                                                 | MCP (default)                           |
| Natural-language agent messaging | A2A                                                 | A2A                                     |
| Direct HTTP path                 | Trusted Match Protocol, direct HTTP, not MCP or A2A | REST over OpenDirect 2.1                |
| Serve-time transport             | Trusted Match over HTTP                             | gRPC, ARTF `RTBExtensionPoint`          |
| Where the version rides          | `adcp_version` on the payload                       | Per-repository, no shared version field |

## What goes wrong with MCP and A2A in advertising?

**Transport task state is not application task state.** This is the trap AdCP documents most loudly. An A2A `Task.status.state` of `completed` describes the transport call, not the buy. A completed A2A task can carry an AdCP payload whose status is still `submitted`, and it can also carry a structured business rejection: A2A stays `completed` while the artifact contains `status: "rejected"` with a reason (`docs/protocol/calling-an-agent.mdx:165`). Treating transport completion as protocol completion produces media buys your system believes exist and the seller does not.

**Do not infer request shape from `tools/list`.** AdCP MCP servers no longer publish per-tool parameter schemas there. Every tool advertises `{type: 'object', properties: {}}`. The shape comes from the schema registry, not from discovery.

**MCP `tasks/get` is not AdCP `tasks/get`.** They share a name and use different payload shapes. AdCP's polling surface uses its own snake_case shape and its own `task_id`.

**Supporting MCP does not make a product AdCP-compliant or AAMP-compatible.** Conformance is defined by which operations an agent implements and what it declares, not by which transport it speaks.
