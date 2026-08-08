---
title: 'Agent — and the Three Things It Can Mean'
description: 'In AdCP the bare word agent means the authenticated caller, not the AI and not the sales agent. Three meanings, one word, and the schemas only ever mean one of them.'
answer: 'AdCP uses the word agent three ways. Agent is the authenticated caller identified by its auth token; Sales Agent is the server exposing inventory; AI Agent is the assistant. The glossary distinguishes all three.'
pubDate: 2026-08-09
term: 'Agent'
alternateNames: ['authenticated caller', 'principal (deprecated)']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'agent definition advertising'
  - 'what is an agent in adcp'
  - 'adcp principal deprecated'
  - 'ai agent vs sales agent'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/building/by-layer/L2/accounts-and-agents'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/building/by-layer/L2/accounts-and-agents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/primitives/identity.py'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
related:
  - '/agents/sales-agent/'
  - '/agents/buyer-agent/'
  - '/agents/agent-registry/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.noetis.dev/areas/accounts/'
seeAlso: ['Sales Agent', 'Buyer Agent', 'Agent Card', 'Agent Registry']
reviewState: cto-reviewed
---

## What does "agent" mean in AdCP?

It means the authenticated caller. Nothing more.

AdCP's glossary carries an entry headed **Agent (AdCP Context)**, and the definition is deliberately narrow. The authenticated entity making API calls, which may be a brand's internal team, an agency's trading desk, or an automated buying system. It is identified by the authentication token. The entry then rules out the two things a reader is most likely to assume it means:

> Distinct from "Sales Agent" (the MCP server exposing inventory) and "AI Agent" (the AI assistant).

That single sentence is why this page exists. Three concepts share one word inside one specification, and only one of them is what a schema means when it says `agent`.

| Term                                | What it is                                | How it is identified                      |
| ----------------------------------- | ----------------------------------------- | ----------------------------------------- |
| Agent                               | The authenticated entity making API calls | Authentication token                      |
| [Sales Agent](/agents/sales-agent/) | The server exposing publisher inventory   | Endpoint URL, declared in `adagents.json` |
| AI Agent                            | The AI assistant a human talks to         | Not a protocol object                     |

An AI agent can be an agent. A sales agent is always an agent when it calls someone else. But "agent" in an AdCP request means the credential on the wire, and it is perfectly possible for the agent to be a cron job with an API key and no model in the loop at all.

## Why does the distinction matter in practice?

Because AdCP bills it. `docs/building/by-layer/L2/accounts-and-agents.mdx` names four entities in every billable operation, and agent is one of them:

| Entity   | The question it answers             | How it is identified                                      |
| -------- | ----------------------------------- | --------------------------------------------------------- |
| Brand    | Whose products are advertised?      | `brand` reference, resolved via `/.well-known/brand.json` |
| Account  | Who gets billed, and at what rates? | Account reference                                         |
| Operator | Who operates on the brand's behalf? | Domain, for example `pinnacle-media.com`                  |
| Agent    | What software is placing the buy?   | Authenticated session                                     |

The specification's own gloss for the fourth row: "The software placing buys and managing campaigns. Authenticates with the seller and may operate on behalf of multiple operators and brands."

That last clause is the operational consequence. One agent, many operators, many brands. A seller declares `supported_billing` in `get_adcp_capabilities`, and `agent` is one of the accepted values, meaning the agent itself is invoiced and "consolidates billing across brands." Model the agent as the AI and your billing model will be wrong for every agency trading desk.

### What happened to "principal"?

AdCP retired it. The glossary entry now reads, in full: "_Deprecated term._ See Account (billing relationship) and Agent (authenticated caller)."

One word used to carry both the billing relationship and the calling identity. AdCP split it into two, and the split is the reason the four-entity table above has four rows rather than three. If you are reading older AdCP material or a v2 integration, `principal` maps onto `account` plus `agent`, and you have to decide which half each usage meant.

## Which agents does AdCP actually name?

Role-qualified agents, each defined by the operations it must implement rather than by a job title. `docs/protocol/required-tasks.mdx` organises AdCP by role, and the section headings are the canonical list:

- Sales agent (seller)
- Orchestrator (buyer)
- Creative agent
- Signal agent
- Brand agent
- Governance agent
- Content standards agent
- Creative governance agent

Every one of them is an agent in the narrow sense as soon as it authenticates. The role qualifier tells you which of the 64 operations in AdCP 3.1.10 it is expected to serve. A domain claim in `supported_protocols` (`media_buy`, `creative`, `signals`, `governance`, `brand`, `sponsored_intelligence`) is how an agent declares which of those roles it plays.

## Does AAMP use the word the same way?

No, and the difference will bite you the first time you read across the two corpora.

In AAMP, "agent" is primarily a registry record with a type. The shared contract library `iab-agentic-primitives` defines an `AgentType` enum with five values: `buyer`, `seller`, `tool_provider`, `data_provider` and `other`. An agent in that sense has an identity in the [agent registry](/agents/agent-registry/), a [trust status](/negotiation/trust-status/), and an [agent card](/agents/agent-card/). It is a party in a directory, not a credential on a request.

| Question                       | AdCP 3.1.10                                                                 | AAMP                                |
| ------------------------------ | --------------------------------------------------------------------------- | ----------------------------------- |
| What "agent" primarily denotes | The authenticated caller                                                    | A typed party in the registry       |
| Identified by                  | Authentication token                                                        | Registry record plus agent card URL |
| Enumerated?                    | No. Role qualifiers appear as doc headings and `supported_protocols` values | Yes. `AgentType` has five values    |
| Is the AI meaning called out?  | Yes, and explicitly excluded                                                | Not called out                      |

Neither corpus references the other, so the row above is a comparison made from outside both. AAMP's enum is sourced from a library whose README says it is not yet released.

## The failure mode this term causes

Someone reads "agent" in an AdCP schema, pictures an LLM, and builds an integration where the model holds the credential. AdCP's model is the opposite: the credential belongs to the software system, the account determines the rates, the operator determines whose behalf, and the AI is not a protocol object at any point. Whether an AI wrote the request is invisible on the wire and outside the specification's scope.

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Definitions from `docs/reference/glossary.mdx` (entries **Agent (AdCP Context)**, **Sales Agent**, **Principal**), the four-entity table from `docs/building/by-layer/L2/accounts-and-agents.mdx`, and the role list from `docs/protocol/required-tasks.mdx`.
- Operation count from `dist/schemas/3.1.10/index.json`, the registry named by `dist/schemas/latest.json`.
- `AgentType` from `IABTechLab/iab-agentic-primitives` at commit `2fc7029`, `src/iab_agentic_primitives/primitives/identity.py`.
