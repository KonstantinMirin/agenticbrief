---
title: 'MCP and A2A: the agent transports under AdCP and AAMP'
description: "MCP and A2A are the agent transports under AdCP and AAMP: what each stack requires, which A2A version each targets, and how an agent's transport is established."
answer: 'MCP and A2A are general-purpose agent transports with no advertising semantics: AdCP requires a sales agent to support at least one, AAMP adds REST over OpenDirect 2.1, and neither protocol requires an agent to declare which transport it speaks.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'MCP and A2A'
alternateNames: ['Model Context Protocol', 'Agent2Agent Protocol', 'A2A', 'MCP']
category: protocol
cluster: gl-stacks
keywords:
  - 'ad context protocol'
  - 'adcp transport'
  - 'mcp vs a2a advertising'
  - 'what does adcp run on'
  - 'aamp transport protocols'
  - 'adcp a2a version'
citations:
  - 'https://modelcontextprotocol.io/'
  - 'https://a2a-protocol.org/latest/'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/calling-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/by-layer/L0/a2a-guide.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/concepts/protocol-comparison.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/concepts/industry-landscape.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/operating/transport-errors.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/foundations/a2b-testing-your-first-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/primitives/Agent.golden.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/protocols.md'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/server/src/a2a/agent-card.ts'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/agenticrtbframeworkservices.proto'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/opendirect/'
  - '/concepts/sponsored-intelligence/'
  - '/agents/agent-card/'
  - '/realtime/trusted-match-protocol/'
  - '/realtime/artf-intent/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
  - 'https://adcpexplorer.com/areas/protocol/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'OpenDirect 2.1', 'Agent Card', 'Trusted Match Protocol']
reviewState: cto-reviewed
---

MCP and A2A are general-purpose agent transports. MCP, the Model Context Protocol, is Anthropic's specification for how a model calls an external tool. A2A, Agent2Agent, covers how autonomous agents send each other messages and run long tasks; Google donated it to the Linux Foundation, and a technical steering committee governs it now.

Both define message framing and task lifecycle only. Operations, field names and obligations come from [AdCP](/concepts/adcp/) and [AAMP](/concepts/aamp/). Supporting MCP or A2A does not by itself imply support for any AdCP operation, because neither transport specification defines advertising operations.

Neither stack requires an agent to say which of the two it speaks: AdCP has no general field for it, and AAMP has an unconstrained one. AdCP and AAMP also target different major versions of A2A, so a buying client reaching both parses both agent card shapes.

With no declaration to read, the transport has to be probed. `/.well-known/agent.json` first: a card that parses means A2A, and the card's shape says which A2A, root `url` for v0.3 or `supportedInterfaces[]` for 1.0. No card, and an MCP session carries `protocolVersion` on `initialize`. `get_adcp_capabilities` over whichever one answered confirms the domains and says nothing about the transport underneath. Neither specification defines this sequence.

## Transport requirements in each stack

AdCP requires a sales agent to support MCP or A2A; which one is the implementer's choice. Its required-tasks page reads: "Sales agents MUST also support at least one transport (MCP or A2A) and declare `media_buy` in `supported_protocols`." `supported_protocols` lists AdCP domains (`media_buy`, `signals`, `governance`, `sponsored_intelligence`, `creative`, `brand`, `measurement`), and a transport never appears in it.

|                        | MCP                                                 | A2A                                                        |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Framing                | JSON-RPC 2.0 over Streamable HTTP, responses as SSE | `message/send` carrying a `DataPart` of `{ skill, input }` |
| Discovery              | `tools/list`                                        | [Agent card](/agents/agent-card/)                          |
| Typed response sits at | Tool result / `structuredContent`                   | `task.artifacts[0].parts[0].data`                          |
| Conversation context   | Manual, the client passes `context_id`              | Protocol-managed                                           |
| Webhooks               | `push_notification_config` in the tool arguments    | Native `PushNotificationConfig`                            |
| Version handshake      | MCP `protocolVersion` on `initialize`               | None                                                       |

AdCP's protocol-comparison page states that the two "provide identical AdCP capabilities using the same unified status system. They differ only in transport format and async handling". The difference lands in the code the implementer owns: under MCP the client threads `context_id` through every call by hand, and under A2A the protocol carries it.

MCP's `protocolVersion` versions the MCP wire and says nothing about the AdCP payload riding inside it, and A2A offers no `initialize` to hang a handshake on, so `adcp_version` travels in the payload instead. No conformance rule sets an MCP version floor, though `structuredContent` needs MCP 2025-03-26 or later, a requirement recorded in AdCP's operating guidance rather than in its conformance rules.

AdCP's MCP servers publish tools with empty `inputSchema` objects, so a client takes its request shapes from the published schema files under `dist/schemas/3.1.13/` rather than from `tools/list`. The calling-an-agent page says those servers no longer publish per-tool parameter schemas, so every tool comes back as `{type: 'object', properties: {}}`; the known-limitations page defers a runtime `get_schema` tool on the grounds that the decision "depends on MCP `tools/list` continuing to carry `inputSchema`" and warns that stripping it "would create the exact wire-surface gap `get_schema` was meant to close."

[Trusted Match](/realtime/trusted-match-protocol/) is a serving-path surface rather than a buying transport, and it runs over "JSON over HTTP/2 POST. All implementations MUST use this transport".

## AAMP's three transport paths

AAMP has three paths, and the rule for picking between them sits in a reference implementation's docs rather than in a specification. buyer-agent's protocols document, which governs that framework's own tool calls, makes MCP "the default for all CrewAI tool operations", reaches for A2A on "exploratory discovery and complex negotiations where natural language interpretation adds value", and leaves REST over [OpenDirect 2.1](/concepts/opendirect/) to operator dashboards and legacy integrations.

`agentic-direct` hardcodes `protocolVersion: '0.3.0'` in `server/src/a2a/agent-card.ts`. [ARTF](/realtime/artf-intent/), the Agentic Real Time Framework, appears only in the RTB path and leads with gRPC: one service, `RTBExtensionPoint.GetMutations`, on port 50051, plus an MCP tool `extend_rtb` on 50052 as the standalone secondary. The AAMP hub README does not mention MCP, A2A or transport.

## Which transport an agent speaks

`get_adcp_capabilities` is the first call made against any AdCP agent. Its response schema requires exactly two things, `adcp` and `supported_protocols`, and `supported_protocols` is the domain list. The only place the transport vocabulary is constrained is the [Sponsored Intelligence](/concepts/sponsored-intelligence/) surface, inside an optional block. A sales agent must support MCP or A2A, but unless it also offers Sponsored Intelligence there is no field in which to say which one it chose.

AAMP defines `capabilities.protocols` but constrains nothing in it: `iab-agentic-primitives/spec/jsonschema/Agent.json` declares the field as `{"items": {"type": "string"}, "type": "array"}` — no enum, nothing pinning those strings to MCP or A2A or to anything. `capabilities` is absent from `Agent.required`, so a card with no declared transport validates clean.

|                        | AdCP 3.1.13                                       | AAMP                                                                                                                                    |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Transport required?    | Yes, MCP or A2A                                   | Not required                                                                                                                            |
| Field that declares it | `sponsored_intelligence.endpoint.transports[]`    | `Agent.capabilities.protocols`                                                                                                          |
| Constrained?           | `enum: ["mcp", "a2a"]`, `minItems: 1`             | Bare array of string                                                                                                                    |
| Required?              | Only if the agent declares Sponsored Intelligence | No, `capabilities` is absent from `Agent.required`                                                                                      |
| What the API binds     | Endpoints are deployment-specific                 | `POST /a2a/jsonrpc`, `GET /.well-known/agent.json`, no `/mcp` path, from the shared OpenAPI rather than from a specification obligation |

AAMP's artifacts point three ways: the shared OpenAPI binds A2A and REST across 13 operations with no MCP path in it, all four golden vectors declare `["a2a"]`, and the reference agents' docs call MCP the default.

## A2A version targets

AdCP targets A2A 1.0, with v0.3 supported "through the compatibility period". 1.0 replaces the root `url` and `protocolVersion` with a `supportedInterfaces[]` array carrying per-interface `url`, `protocolBinding` and `protocolVersion`, and drops the `kind` discriminator that v0.3 puts on every Part.

`agentic-direct` hardcodes `0.3.0`, the tier AdCP files under compatibility. Neither AdCP's docs nor the A2A project's own site gives that compatibility period an end date, so a client reaching both stacks parses both card shapes. Backward compatibility is "not enabled by default", and a v0.3 client hitting a 1.0-only server fails unless that server opted in.

AdCP's protocol-comparison page shows A2A examples carrying `"kind": "text"` and `"kind": "data"`, the v0.3 form, and names no A2A version. Its industry overview credits A2A to Google as maintainer.

## Common confusions

An A2A `Task.status.state` of `completed` describes the call, not the buy. A completed A2A task can come back carrying a rejected artifact, with a `reason` and `suggestions[]`. A client that reads the task state as the commercial outcome records media buys the seller never agreed to.

AdCP's polling surface reuses the `tasks/*` names from MCP and A2A, and the wire shapes differ, so the shared names do not indicate a shared message format.
