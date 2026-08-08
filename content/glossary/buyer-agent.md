---
title: 'Buyer Agent'
description: 'A buyer agent is the demand-side agent in agentic advertising. AAMP ships one as a registered, discoverable service. AdCP calls the buy side an orchestrator and says it is not a server.'
answer: 'A buyer agent is the demand-side agent that turns a campaign brief into media buys. In AAMP it is a registered, discoverable service; in AdCP the same role is called an orchestrator and is a client only.'
pubDate: 2026-08-09
term: 'Buyer Agent'
alternateNames: ['orchestrator', 'demand-side agent', 'buy-side agent']
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
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/learning/foundations/a2-protocol-architecture.mdx'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/pyproject.toml'
related:
  - '/agents/sales-agent/'
  - '/agents/seller-agent/'
  - '/agents/agent/'
  - '/agents/agent-registry/'
  - '/agents/agent-card/'
  - 'https://aampexplorer.noetis.dev/repos/reference-agents/'
  - 'https://briefgateway.noetis.dev/compare/adcp-brief-vs-aamp-campaign-brief/'
seeAlso: ['Sales Agent', 'Seller Agent', 'Agent Registry', 'Agent Card']
reviewState: cto-reviewed
---

## What is a buyer agent?

A buyer agent is the demand-side software in an agentic media transaction. It takes a campaign brief, finds sellers, asks them what they have, decides what to buy, and books it.

Both stacks have this role. They disagree about whether it is a server.

## What does AAMP's buyer agent do?

`IABTechLab/buyer-agent` is "an AI-powered media buying system for DSPs, agencies, and advertisers to automate programmatic direct purchases using IAB OpenDirect 2.1 standards." Its README carries the banner `> **V2 — Active Development**`. Version pin: tag `v2.3.0`, commit `0c3a154`, which is 24 commits past that tag. Do not read the version from `pyproject.toml`, which still says `0.1.0`.

The buyer agent's own flow, from `docs/api/seller-discovery.md`:

1. Query the AAMP [agent registry](/agents/agent-registry/) for sellers, optionally filtered by capability, for example `GET /agents?agent_type=seller&capabilities=ctv`.
2. Fetch each seller's [agent card](/agents/agent-card/) from `GET /.well-known/agent.json`.
3. Verify the seller's trust status through the registry's `/verify` endpoint.
4. Transact: request quotes, negotiate, book.

Step 3 goes both ways. The buyer agent also calls `register_buyer()` with its own card, so that sellers can discover and verify it in turn. In AAMP the buyer is a first-class registry citizen with a published identity, not an anonymous caller.

Its surface is much smaller than the seller's, and the gap is the number worth remembering:

| Machine-readable surface             | AAMP buyer-agent       | AAMP seller-agent |
| ------------------------------------ | ---------------------- | ----------------- |
| OpenAPI paths                        | 13                     | 74                |
| OpenAPI component schemas            | 8                      | 91                |
| REST endpoints (generated inventory) | 14                     | 88                |
| MCP tools                            | 43                     | 46                |
| Canonical event types                | 40                     | 22                |
| Tag at the commit inspected          | `v2.3.0` (+24 commits) | `v2.4.1`          |

The event-type row is the odd one out: the buyer declares 40 event types and the seller 22, for two halves of the same transaction. The reconciliation of those two vocabularies is published on [AAMP Explorer's reference-agents page](https://aampexplorer.noetis.dev/repos/reference-agents/).

The buyer agent's input object is a `CampaignBrief`. Its shape and how it differs from AdCP's brief string is covered on [Brief Gateway](https://briefgateway.noetis.dev/compare/adcp-brief-vs-aamp-campaign-brief/).

## What does AdCP call a buyer agent?

Two things, in two different documents, which is the trap on this term.

AdCP's protocol architecture page lists a **buyer agent** in its key-terms table: "Represents a brand or agency and purchases media via `create_media_buy`." But `docs/protocol/required-tasks.mdx`, the page that actually assigns operations to roles, heads the buy-side section **"Orchestrator (buyer)"** and opens with a constraint the AAMP buyer agent does not share:

> Orchestrators are not MCP/A2A servers — they call sales agent tasks.

The same section lists five conformance obligations. A conformant orchestrator MUST authenticate with sales agents, include required fields per request schemas, handle asynchronous task responses (`submitted`, `working`, `input-required`) plus webhook delivery of completion artifacts, use `media_buy_id` for subsequent operations, and respect `creative_deadline` for creative uploads.

Read those together and the AdCP buy side is a client with obligations, not a service with an address. There is no orchestrator agent card, no orchestrator endpoint, and no orchestrator entry in the operation registry. The 64 operations in AdCP 3.1.10 are things a buyer calls, not things a buyer serves.

## Buyer agent in AAMP vs orchestrator in AdCP

| Question                     | AdCP 3.1.10                                                                  | AAMP buyer-agent `v2.3.0`                                       |
| ---------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Normative role name          | Orchestrator (buyer); "buyer agent" used in learning docs                    | Buyer agent                                                     |
| Is it a server?              | No. "Orchestrators are not MCP/A2A servers"                                  | Yes. 13 OpenAPI paths, its own agent card                       |
| Published identity           | None specified for the buy side                                              | Registered in the agent registry with a buyer card              |
| How it finds counterparties  | `adagents.json` on publisher domains, plus the AAO registry catalog          | The AAMP agent registry, queried by `agent_type` and capability |
| How its authority is bounded | A [governance agent](/agents/governance-agent/) validates plans before spend | Access tier, capped by registry trust status                    |
| Source type                  | Published specification                                                      | Reference implementation                                        |

That last row governs how much weight each column carries. Everything in the AAMP column is one team's Python service at one tag. Everything in the AdCP column is a released specification with a versioned schema registry, which does not make it more widely deployed, only more precisely written down.

## What a buyer agent is not

A buyer agent is not a DSP, and neither corpus claims it is. In AAMP the buyer agent books programmatic direct against OpenDirect 2.1 and hands a deal ID to a DSP for activation. In AdCP the orchestrator issues `create_media_buy` and the seller executes.

It is also not the thing AdCP means by the bare word "agent". AdCP reserves that word for the authenticated caller, which is a narrower idea covering both buy-side and sell-side software. See [Agent](/agents/agent/).

## Sources and version pins

- `IABTechLab/buyer-agent` at tag `v2.3.0`, commit `0c3a154`. Counts from `docs/api/openapi.json` and the auto-generated `docs/reference/{endpoints,mcp-tools,event-types}.md`.
- `IABTechLab/seller-agent` at tag `v2.4.1`, commit `2bb7ebc`, for the comparison column.
- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Role assignments from `docs/protocol/required-tasks.mdx`; key terms from `docs/learning/foundations/a2-protocol-architecture.mdx`.
- AAMP terms on this page are sourced from a reference implementation, not from a ratified specification.
