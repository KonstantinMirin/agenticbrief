---
title: 'Agent Registry'
description: "Two agent registries are being built. AgenticAdvertising.org runs a member-gated catalog for AdCP agents. IAB Tech Lab's AAMP registry is stubbed pending a public API specification."
answer: "An agent registry is a directory of advertising agents with identity, capabilities and trust status. AgenticAdvertising.org runs one for AdCP agents; IAB Tech Lab's AAMP registry is stubbed pending a public API specification."
pubDate: 2026-08-09
term: 'Agent Registry'
alternateNames: ['AAMP registry', 'AAO registry', 'agent catalog']
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'ad agent registry'
  - 'aamp registry'
  - 'aao agent registry'
  - 'agent discovery advertising'
citations:
  - 'https://docs.adcontextprotocol.org/docs/registry/registering-an-agent'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/registry/registering-an-agent.mdx'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/registry-agent-example/blob/1ff8dda0e487a5a4b8699128c6396a8e116a82be/agent.ts'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
related:
  - '/agents/agent-card/'
  - '/agents/discovery-files/'
  - '/agents/buyer-agent/'
  - '/agents/seller-agent/'
  - '/negotiation/trust-status/'
  - 'https://agenticadlab.noetis.dev/guides/agent-discovery-files/'
  - 'https://aampexplorer.noetis.dev/repos/'
seeAlso: ['Agent Card', 'Trust Status', 'adagents.json', 'Access Tier']
reviewState: cto-reviewed
---

## What is an agent registry?

An agent registry is a directory of advertising agents: who they are, where their endpoints are, what they claim to do, and whether anyone has vouched for them. It answers the question a domain-hosted file cannot, which is "who else is out there."

Two are being built, by the two bodies working on agentic advertising standards. They are built on opposite assumptions, and only one of them has a documented public API today.

## The AAO registry, on the AdCP side

AgenticAdvertising.org runs a catalog at `/api/registry/agents` and `/api/registry/publishers`. Its enrollment rule is a single sentence in the AdCP documentation: the catalog "contains only AAO-attested, member-enrolled agents. To appear in the catalog, an AAO member must explicitly enroll the agent on their member profile."

There is exactly one path in, through the member profile, available from a dashboard or programmatically:

| Endpoint                      | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `GET /api/me/agents`          | List my registered agents                   |
| `POST /api/me/agents`         | Register an agent, idempotent on `url`      |
| `PATCH /api/me/agents/{url}`  | Update an agent, URL-encoded path parameter |
| `DELETE /api/me/agents/{url}` | Remove an agent                             |

Authentication is a WorkOS API key or an OAuth user JWT. New entries default to `visibility: "members_only"`; `public` requires a paid AAO tier and a `primary_brand_domain` on the member profile, and a request for `public` from an unqualified tier is stored as `members_only` with a `visibility_downgraded` warning rather than an error.

Agent type is resolved server-side. A caller does not declare it: `resolveAgentTypes()` reads the most recent capability snapshot from the crawler, and if no snapshot exists the next crawler probe overwrites whatever the client supplied. The documentation calls this "type smuggle-protection."

Two limits are stated plainly, and both matter more than the feature list.

**Crawling does not create entries.** "There is no auto-population from crawled `adagents.json` files." Agents listed in third-party `adagents.json` files populate the publisher-authorisation graph behind `GET /api/registry/operator?domain=X` and `/api/registry/lookup/domain`, but they do not become catalog records.

**Non-members cannot list themselves.** "You cannot self-register today. Your operator must be an AAO member to enroll your agent in the registry catalog."

So the AAO registry is a membership catalog with an attestation model, not an open index of the web. Whether that is the right trade is a judgement call. It is at least a legible one.

## The AAMP registry, on the IAB Tech Lab side

The AAMP registry is not finalised, and IAB Tech Lab's own reference implementation says so. From `seller-agent/docs/guides/agent-management.md`, under the heading "Current Limitations":

> The IAB Tech Lab AAMP (Agent-to-Agent Marketplace Protocol) registry integration is stubbed pending the public API specification. Currently, agent trust is managed locally by the operator. The `AAMPRegistryClient` will be updated once the AAMP spec is finalized.

Three further things are true of the AAMP registry at the commits inspected, and each is one grep away from being checkable.

**Three production base URLs, in one corpus.** The buyer agent defaults to `http://localhost:8080/agent-registry` and documents production as `https://registry.aamp.iab.com/agent-registry`. The seller agent's `AGENT_REGISTRY_URL` defaults to `https://tools.iabtechlab.com/agent-registry`. The shared contract library `iab-agentic-primitives` points `IAB_PROD` at `https://registry.iabtechlab.com` and states the base path is `/api/agents`, "NOT `/agents`", which is the path the buyer agent uses.

**The registry the hub lists is not the registry.** The AAMP hub README lists six repositories, one of which is "Registry Agent (Example)", described as demonstrating "agent discovery, registration, and coordination patterns." That repository is a 22-line `agent.ts` plus a 9-line prompt file. It defines no API. It consumes an external MCP server through `REGISTRY_MCP_URL` and `REGISTRY_MCP_TOKEN` and specifies nothing about what that server does.

The actual registry is a Node.js service named by `iab-agentic-primitives` as `github.com/IABTechLab/agent-registry`, with JWT auth proxied to IAB OAuth and enveloped `{"success": true, "data": ...}` responses. That repository is not listed in the AAMP hub README either, and the primitives library notes an upstream gap: the registry repo "does not ship a DB schema migration for a fresh database", which is why its own CI does not hard-depend on running it.

**The trust-to-tier mapping disagrees with itself.** Registry trust status caps how good a price a buyer can be shown, so this table is the registry's commercial output, not a detail:

| Trust status | `seller-agent/docs/api/agent-discovery.md` | `iab-agentic-primitives` `TRUST_TIER_CEILING` |
| ------------ | ------------------------------------------ | --------------------------------------------- |
| `unknown`    | `public`                                   | `public`                                      |
| `registered` | `seat`                                     | `seat`                                        |
| `approved`   | `advertiser`                               | **`agency`**                                  |
| `preferred`  | `advertiser`                               | `advertiser`                                  |
| `blocked`    | None, rejected                             | `public`                                      |

The seller agent pins `iab-agentic-primitives` as its canonical wire contract, and the two disagree on one row. An `approved` buyer is capped at advertiser pricing by the documentation and at agency pricing by the shared contract. That is a real money difference sitting inside one corpus.

## AAO registry vs AAMP registry

| Question                     | AAO registry (AdCP side)                                                    | AAMP registry (IAB side)                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Documented public API        | Yes, `/api/registry/*` and `/api/me/agents`                                 | Not finalised; client "stubbed pending the public API specification"                          |
| Who can be listed            | AAO members only, enrolled by a member                                      | Agents that register; gate not specified                                                      |
| Default visibility           | `members_only`; `public` needs a paid tier                                  | Not specified                                                                                 |
| Agent type                   | Resolved server-side from a crawler capability snapshot                     | Declared, from a five-value `AgentType` enum                                                  |
| What listing buys you        | Catalog presence and attestation                                            | `registered` [trust status](/negotiation/trust-status/), which raises the access-tier ceiling |
| Relationship to domain files | Crawled `adagents.json` feeds an authorisation graph but creates no entries | No domain-hosted discovery file in the corpus                                                 |
| Base URL                     | One                                                                         | Three, across three repositories                                                              |

Note the last row of the middle column against the middle row of the right. In AdCP, publisher authority stays on the publisher's domain in `adagents.json`, and the registry is a catalog on top. In AAMP, the registry is the authority: it is where trust comes from, and trust is what unlocks price.

The seller-agent documentation quotes the AAMP acronym as "Agent-to-Agent Marketplace Protocol" in the passage above. The AAMP hub README expands it differently. The full set of in-corpus expansions, with file and line evidence, is published on [AAMP Explorer](https://aampexplorer.noetis.dev/repos/).

## What neither registry does

Neither is a trust anchor for cryptographic verification of message contents. AdCP puts publisher-attested `signing_keys` in `adagents.json` rather than in the registry, and AAMP's registry returns a trust status rather than a key. Neither publishes a revocation feed. Neither is operated by a neutral third party: each is run by the body that stewards its own protocol.

If you are planning an integration, assume you will read a domain file, call a registry, fetch an [agent card](/agents/agent-card/), and still verify things yourself.

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`, `docs/registry/registering-an-agent.mdx`.
- `IABTechLab/seller-agent` at `v2.4.1`, commit `2bb7ebc`, `docs/guides/agent-management.md` and `docs/api/agent-discovery.md`.
- `IABTechLab/buyer-agent` at `v2.3.0`, commit `0c3a154`, `docs/api/seller-discovery.md`.
- `IABTechLab/iab-agentic-primitives` at commit `2fc7029`, `SANDBOX_REGISTRY.md` and `src/iab_agentic_primitives/registry_client.py`. The library's README declares it "WORK IN PROGRESS — NOT YET RELEASED".
- `IABTechLab/registry-agent-example` at commit `1ff8dda`, one commit total. AAMP hub README at commit `3b20e67`.
