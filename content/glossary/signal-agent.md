---
title: 'Signal Agent'
description: "A signal agent is AdCP's audience and data agent: two operations, get_signals and activate_signal, authorised signal by signal through adagents.json. AAMP has no counterpart term."
answer: 'A signal agent is an AdCP server that provides signal discovery and activation over MCP or A2A. It implements two operations, get_signals and activate_signal, and is authorised by data providers through adagents.json.'
pubDate: 2026-08-09
term: 'Signal Agent'
alternateNames: ['signals agent', 'data agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'signal agent advertising'
  - 'what is a signal agent'
  - 'adcp signals protocol agent'
  - 'signal activation agent'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/signals/key-concepts'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/architecture.mdx'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/authorized-agent-base.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/learning/foundations/a2-protocol-architecture.mdx'
related:
  - '/agents/sales-agent/'
  - '/agents/agent/'
  - '/agents/discovery-files/'
  - '/signals/audience-vs-signal/'
  - '/signals/activation/'
  - 'https://adcpexplorer.noetis.dev/areas/signals/'
  - 'https://aampexplorer.noetis.dev/repos/agentic-audiences/'
seeAlso: ['Sales Agent', 'Signal Definition', 'Signal Activation', 'Audience']
reviewState: cto-reviewed
---

## What is a signal agent?

AdCP's glossary defines a signal agent as "a server (via MCP or A2A) that provides signal discovery and activation services. Enables natural language audience discovery and deploys signals to decisioning platforms."

The same entry adds two things that matter more than the definition. A signal agent "can be private (owned by a single buyer and visible only to that buyer's accounts) or marketplace (licensing data across multiple accounts)." And: "Signal agents are authorized by data providers via `adagents.json` to resell specific signals." The named examples in the specification are LiveRamp, The Trade Desk and Peer39.

Version pin for this page: AdCP **3.1.10**, per `dist/schemas/latest.json`, repository at commit `f1a35ab`.

## What operations does a signal agent implement?

Two. That is the whole Signals Protocol in the published 3.1.10 registry.

| Operation         | Requirement | What it does                                                                       |
| ----------------- | ----------- | ---------------------------------------------------------------------------------- |
| `get_signals`     | Required    | Signal discovery, driven by a natural-language description of what the buyer needs |
| `activate_signal` | Required    | Activation of a signal on a named decisioning platform and seat                    |

Both are marked Required under the "Signal agent" heading in `docs/protocol/required-tasks.mdx`. Every AdCP agent also implements `get_adcp_capabilities`, so a minimal signal agent serves three operations out of the 64 registered in 3.1.10. It is the smallest role surface in the protocol.

The interesting design decision is what sits between them. `get_signals` takes a natural-language brief rather than a taxonomy code, and the signal agent searches across the data providers it is authorised for plus its own proprietary inventory. `activate_signal` then pushes segment membership to the platform, after which the buyer targets it with that platform's normal tools. The signals docs are explicit that signal agents "integrate directly with decisioning platforms (DSPs, orchestration platforms), eliminating intermediary reporting and usage tracking."

## How is a signal agent authorised?

Through the same file that authorises a [sales agent](/agents/sales-agent/), hosted on a different domain. `adagents.json` lives at `/.well-known/adagents.json` on publisher domains for inventory, and on **data provider domains** for signals. The schema description says exactly that.

Inside the file, `authorized_agents[]` is discriminated on `authorization_type`. Four of the six variants scope inventory. Two scope data:

| `authorization_type` | Scope                                                | Resolved against                                 |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `signal_ids`         | Named signals this agent may resell                  | The top-level `signals[]` array in the same file |
| `signal_tags`        | Signals carrying any of these publisher-defined tags | Tag metadata in the same file                    |

Each entry also inherits `url`, `authorized_for` and optional `signing_keys` from `core/authorized-agent-base.json`, so the data provider can attest the signal agent's public keys rather than leaving a buyer to discover keys from the signal agent's own domain.

The scoping is per signal, not per agent. A data provider can authorise one signal agent to resell three of its segments and nothing else, and revoke that by editing one array.

## Is it "signal agent" or "signals agent"?

AdCP uses both, and neither is wrong so much as neither is enforced. The normative glossary entry and the role heading in `docs/protocol/required-tasks.mdx` say **Signal agent**. The key-terms table in `docs/learning/foundations/a2-protocol-architecture.mdx` says **Signals agent**, as does `docs/protocol/architecture.mdx` ("Signals agent — MCP servers exposing audience and targeting data discovery and activation") and `docs/intro.mdx`.

The protocol area is `signals` and the operations are `get_signals` and `activate_signal`, so the plural is the safer bet when you are naming a directory. The singular is the safer bet when you are quoting the glossary. We use the singular here because the glossary is the normative source.

## Does AAMP have a signal agent?

No. The string "signal agent" returns zero files across all eight IAB Tech Lab agentic repositories.

The nearest thing is `agentic-audiences`, which describes a data plane where agents exchange embeddings rather than named segments. Its message envelope carries a `producer.agent_role` field with six values: `publisher`, `seller`, `buyer`, `measurement`, `brand`, `other`. No value in that enum corresponds to a signal or data agent, and the repository's own agent interface schema is a zero-byte file. On the seller side, `POST /agentic-audience/match` exists in the seller agent's OpenAPI, and the schema description states it "returns a deterministic mock-quality match score" with the real model deferred to a later epic.

So the honest comparison row is: AdCP has a specified signal agent role with two required operations and a per-signal authorisation model; AAMP has a draft embedding exchange, a stub match endpoint, and no agent role for data at all.

Assessment of that repository, including which of its files are empty, lives on [AAMP Explorer](https://aampexplorer.noetis.dev/repos/agentic-audiences/).

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Definition from `docs/reference/glossary.mdx`; required operations from `docs/protocol/required-tasks.mdx`; behaviour from `docs/signals/key-concepts.mdx`; authorisation variants from `dist/schemas/3.1.10/adagents.json` and `dist/schemas/3.1.10/core/authorized-agent-base.json`.
- `IABTechLab/agentic-audiences` at commit `106ebd6`, untagged. `IABTechLab/seller-agent` at `v2.4.1`, commit `2bb7ebc`.
- The `agentic-audiences` material is a draft. Its own `specs/v1.0/embedding-exchange.md` is self-labelled Draft v0.1 despite the `v1.0` path.
