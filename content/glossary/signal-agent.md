---
title: 'Signal Agent (AdCP)'
description: "A signal agent is AdCP's two-operation data role: get_signals and activate_signal, authorised per signal on the data provider's own domain. AAMP has no equivalent role."
answer: 'A signal agent is an AdCP server that discovers and activates advertising signals over MCP or A2A, implementing get_signals and activate_signal, authorised signal by signal by data providers in adagents.json.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Signal Agent'
alternateNames: ['signals agent', 'data agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'signal agent advertising'
  - 'what is a signal agent'
  - 'adcp signal agent'
  - 'signals agent adcp'
  - 'get_signals activate_signal'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/signals/key-concepts'
  - 'https://docs.adcontextprotocol.org/docs/signals/data-providers'
  - 'https://scope3.com/'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/foundations/a2-protocol-architecture.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/signals/overview.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/signals/data-providers.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/adagents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/managed-networks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-definition-enrichment.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-request.json'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/README.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/audience_capabilities.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/services/deal_service.py'
related:
  - '/agents/sales-agent/'
  - '/agents/discovery-files/'
  - '/agents/agent/'
  - '/signals/signal-definition/'
  - '/signals/audience-vs-signal/'
  - '/signals/activation/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/operations/get-signals/'
  - 'https://aampexplorer.com/repos/agentic-audiences/'
seeAlso: ['Sales Agent', 'Signal Definition', 'Discovery Files', 'Audience vs Signal']
reviewState: cto-reviewed
---

A signal agent is an AdCP server that discovers and activates advertising signals over MCP or A2A, on behalf of the data provider that owns them. The data provider publishes the authorisation to resell a segment on its own domain, and the signal agent operates against a file it cannot edit.

The thing being resold is a signal, a named and licensable audience or contextual segment addressed by an id like `likely_tesla_buyers`. [Activating](/signals/activation/) one pushes it into a destination, a named seat on a named buying platform, so a campaign can target it.

AdCP's glossary gives the role two sentences: "A server (via MCP or A2A) that provides signal discovery and activation services. Enables natural language audience discovery and deploys signals to decisioning platforms." Authorisation gets one line: signal agents "are authorized by data providers via `adagents.json` to resell specific signals". AdCP writes the role both ways, "signal agent" and "signals agent", and has not settled on one.

## Required tasks and access control

AdCP's required-tasks reference heads a section "Signal agent" and marks two tasks Required: [`get_signals`](https://adcpexplorer.com/operations/get-signals/) for discovery and [`activate_signal`](https://adcpexplorer.com/operations/activate-signal/) for activation on decisioning platforms. With `get_adcp_capabilities`, which every AdCP agent implements, a minimal signal agent implements three operations. `docs/learning/foundations/a2-protocol-architecture.mdx` also attributes "measurement and audience data" to signal agents, though measurement appears in neither the glossary entry nor either required task.

`get_signals` takes a `signal_spec`, a "Natural language description of the desired signals" rather than a taxonomy code. `activate_signal` requires `signal_agent_segment_id`, `destinations[]` and an `idempotency_key`, and that segment id is an "Opaque activation handle returned in ... each get_signals response entry". The same section adds one obligation beyond the two tasks: "Signal agents MUST enforce access control for private signals and activation keys." A private deployment, in the glossary's terms, is visible only to one buyer's accounts and is what that rule protects; a marketplace deployment is licensed across accounts.

Disclosure of how a segment was built is optional throughout. A [signal definition](/signals/signal-definition/) requires only `id`, `name` and `value_type`, and the provenance fields in `core/signal-definition-enrichment.json` — `methodology`, `data_sources`, `segmentation_criteria` and a `criteria_url` — are projected into a listing only when the request's `fields` array asks for them.

## Who authorises a signal agent

`dist/schemas/3.1.13/adagents.json` states in its top-level description that the file lives at `/.well-known/adagents.json` "on publisher domains (for properties) or data provider domains (for signals)". A signal agent is therefore vouched for by the data provider whose segments it resells rather than by the publisher whose inventory a sales agent sells.

Two of the six `authorization_type` variants scope data rather than inventory, `signal_ids` and `signal_tags`, and both resolve against the top-level `signals[]` array in the same file, so the licence and the catalogue ship together. The other four scope inventory, and [discovery files](/agents/discovery-files/) covers those.

```json
"authorized_agents": [
  { "url": "https://liveramp.com/.well-known/adcp/signals",
    "authorization_type": "signal_tags", "signal_tags": ["automotive"] },
  { "url": "https://the-trade-desk.com/.well-known/adcp/signals",
    "authorization_type": "signal_ids", "signal_ids": ["likely_tesla_buyers"] }
]
```

One entry authorises a tag and everything under it, the other a single segment id. Each entry also inherits `url`, `authorized_for` and an optional `signing_keys` from `core/authorized-agent-base.json`, so the data provider attests the signal agent's public keys on its own domain rather than the buyer discovering keys from the agent's.

Deleting an id from `signal_ids` withdraws the named agent's authorisation to resell that segment. AdCP defines no notification to the agent and no `revoked_signal_ids[]`, and how fast a withdrawal takes effect is unspecified: `docs/governance/property/adagents.mdx` tells consumers to cache "for 24 hours minimum", and the one invalidation hint covering `signals[]` is `catalog_etag`, which publishers "should publish".

The obligations follow the same file:

| Party            | What it hosts                                                                                  | What it implements                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Data provider    | `/.well-known/adagents.json` on its own domain, carrying `signals[]` and `authorized_agents[]` | No agent at all                                                                                  |
| Signal agent     | Nothing on the provider's domain                                                               | `get_signals`, `activate_signal`, `get_adcp_capabilities`, and access control on private signals |
| Buyer            | Nothing                                                                                        | No signal-side obligation; verification is a fetch of the data provider's file                   |
| Publisher or SSP | `adagents.json` carrying `properties[]` rather than `signals[]`                                | Out of scope on the signals side                                                                 |

`docs/signals/data-providers.mdx` puts publishers and data providers in adjacent table rows, "Authorize agents to sell inventory" against "Authorize agents to resell signals". The buyer-side fetch is what `docs/signals/overview.mdx` means by "buyers don't have to take the signal agent's word for data provenance". AdCP names LiveRamp, The Trade Desk and Peer39 as example signal agents.

## Signals in AAMP

No AAMP repository defines a signal or data-provider role, and no schema in `iab-agentic-primitives` v0.5.0 is a signal or an audience object. [`agentic-audiences`](https://aampexplorer.com/repos/agentic-audiences/) carries a `producer.agent_role` enum of `publisher`, `seller`, `buyer`, `measurement`, `brand` and `other`: it has a value for measurement and none for a data provider. In that repository, `specs/v1.0/schema/agent_interface.schema.json` is zero bytes.

| Question                       | AdCP 3.1.13                                             | AAMP                                                                 |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Is there a role for data?      | Signal agent, two required tasks                        | None                                                                 |
| Who declares what data exists? | The data provider, in `signals[]` on its own domain     | The seller, in `supported_signal_types` on its own package media kit |
| Who vouches for the reseller?  | The data provider, per signal, in `authorized_agents[]` | Nobody. There is no reseller                                         |
| Can a buyer verify the claim?  | Fetch the data provider's `adagents.json`               | No mechanism exists                                                  |
| What does matching return?     | Typed signals, activated to a named destination         | A score bucketed STRONG / MODERATE / WEAK / POOR                     |

AAMP's only structured signal vocabulary belongs to a seller describing itself. The reference `seller-agent` declares `SignalType = Literal["identity", "contextual", "reinforcement"]`, carried on `supported_signal_types` in the package media kit and stamped `spec_version` `"draft-2026-01"`. The endpoint that consumes it does much less: `POST /agentic-audience/match` scores a match as `int(sha256(identifier).hexdigest()[:8], 16) / 0xFFFFFFFF`, a placeholder its OpenAPI description marks as awaiting the real embedding model in "Epic 2 (E2-2)".

AdCP's glossary names LiveRamp as an example signal agent, and `agentic-audiences/README.md` calls that repository "an open standard proposed by LiveRamp", with the embedding schema's `$id` pointing at `github.com/LiveRamp/user-context-protocol`. [AdCP vs AAMP](https://agenticadlab.com/protocols/adcp-vs-aamp/) runs the comparison across both protocols.
