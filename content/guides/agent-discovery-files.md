---
title: 'How Ad Agents Find Each Other — Two Trust Models'
description: 'AdCP authorizes agents with publisher-hosted well-known files. AAMP authorizes them with a central IAB registry and a five-value trust status. Side by side.'
answer: "How ad agents find each other: AdCP authorizes them through publisher-hosted files at /.well-known/adagents.json and /.well-known/brand.json. AAMP authorizes them through a central IAB registry plus per-agent cards, with a five-value trust status that caps each buyer's access tier."
pubDate: 2026-08-09
cluster: 'hub-discovery'
keywords:
  - 'agent discovery and trust models'
  - 'adagents.json'
  - 'aamp agent registry'
  - 'agent card advertising'
  - 'buyer agent trust status'
citations:
  - 'https://docs.adcontextprotocol.org/docs/governance/property/adagents'
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/brand-json'
  - 'https://docs.adcontextprotocol.org/docs/governance/property/managed-networks'
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/IABTechLab/buyer-agent/blob/main/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/main/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/main/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/main/src/ad_seller/config/settings.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/main/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/registry-agent-example'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/how-a-machine-buys-media/'
  - 'https://adcpexplorer.noetis.dev/discovery/adagents-json/'
  - 'https://adtechglossary.noetis.dev/agents/discovery-files/'
  - 'https://adtechglossary.noetis.dev/agents/agent-registry/'
  - 'https://adtechglossary.noetis.dev/negotiation/trust-status/'
reviewState: cto-reviewed
---

## How does an AdCP buyer agent learn who may sell a publisher's inventory?

It fetches a file from the publisher's own origin. AdCP puts authorization at `https://{publisher}/.well-known/adagents.json`, and the schema for it ships in the released registry as `/schemas/3.1.10/adagents.json` (verified in `dist/schemas/3.1.10/adagents.json`, published 2026-08-04).

The schema is a `oneOf` over two variants. The pointer variant carries one required field, `authoritative_location`, an HTTPS URL where the real file lives; `docs/governance/property/adagents.mdx` adds the rule that stops the indirection looping, under the heading "No Nested References": the authoritative file cannot itself be a URL reference. The inline variant carries fifteen top-level fields (`contact`, `properties`, `collections`, `placements`, `formats`, `signals`, `tags`, `catalog_etag`, `superseded_by`, `revoked_publisher_domains` and the rest) and requires exactly one of them: `authorized_agents`.

`authorized_agents[]` is where the trust actually lives. Each entry is discriminated on `authorization_type`, and an authorization can be narrowed to specific `property_ids`, `collections`, `placement_ids` or `placement_tags`, with a `delegation_type` of `direct`, `delegated` or `ad_network`. An empty `authorized_agents` array is legal and, per the schema description, asserts no sales authorization at all: validators must not read it as deny-all, authorize-all, or a revocation.

The companion file is `brand.json`, hosted at `/.well-known/brand.json` on a brand house domain. In 3.1.10 it has five variants: house portfolio, brand canonical document, brand agent, house redirect, and authoritative-location redirect. Same idea, opposite side of the transaction: the domain owner declares who speaks for the brand.

The trust root here is DNS plus HTTPS. If you control the origin, you control the authorization. Field-level reference for every one of these keys lives on [AdCP Explorer](https://adcpexplorer.noetis.dev/discovery/adagents-json/); this page is about the model, not the field list.

## How does an AAMP buyer agent find a seller agent?

It asks a registry first, then the agent. The AAMP flow documented in `buyer-agent/docs/api/seller-discovery.md` is three calls: `GET /agents?agent_type=seller&capabilities=ctv` against the registry, then `GET /.well-known/agent.json` against the seller it found, then `GET /verify?agent_url=...` back against the registry for a trust verdict. The buyer's `RegistryClient` caches registry results with a default TTL of 300 seconds.

The seller's agent card is a real machine-readable document. `seller-agent/docs/api/agent-discovery.md` lists `capabilities.protocols`, `authentication.schemes` (`api_key`, `bearer`), `skills[]` (`discovery`, `pricing`, `proposals`, `negotiation`, `deals`), `inventory_types`, and `supported_deal_types` (`pg`, `pmp`, `preferred_deal`, `private_auction`).

## Where is the AAMP registry? The corpus gives three different answers

This is the part that surprised me. Three files in the AAMP corpus name three different production registries:

| Source file                                         | Registry base URL                              |
| --------------------------------------------------- | ---------------------------------------------- |
| `buyer-agent/docs/api/seller-discovery.md:46`       | `https://registry.aamp.iab.com/agent-registry` |
| `seller-agent/src/ad_seller/config/settings.py:228` | `https://tools.iabtechlab.com/agent-registry`  |
| `iab-agentic-primitives/SANDBOX_REGISTRY.md`        | `https://registry.iabtechlab.com`              |

The third one is the interesting one, because it corrects the other two. `SANDBOX_REGISTRY.md` says the library's client "speaks the **actual** IAB Tech Lab agent-registry API (github.com/IABTechLab/agent-registry, a Node.js service)", that the base path is `/api/agents` rather than `/agents`, and that an earlier iteration had been built "against _assumed_ API shapes". Auth is a JWT bearer token, HS256, issuer `IAB`, with login proxied to `api.iabtechlab.com/oauth/authmobile`.

Meanwhile `seller-agent/docs/guides/agent-management.md:399-404` says the registry integration is "stubbed pending the public API specification" and that the client "will be updated once the AAMP spec is finalized."

And `registry-agent-example`, the repository the AAMP hub README lists as the registry component, is a 22-line `agent.ts` with one commit that consumes an external MCP server through two environment variables. It defines nothing. The registry contract is documented in the buyer and seller repositories instead.

## What does the AAMP trust status actually cap?

`seller-agent/docs/api/agent-discovery.md` publishes a five-value lattice and maps each value to a maximum access tier:

| Trust status | How it is reached              | Maximum access tier | Pricing visibility                |
| ------------ | ------------------------------ | ------------------- | --------------------------------- |
| `unknown`    | default on first contact       | `public`            | published rate card only          |
| `registered` | found in the IAB AAMP registry | `seat`              | seat-level pricing                |
| `approved`   | seller operator action         | `advertiser`        | full advertiser pricing           |
| `preferred`  | seller operator action         | `advertiser`        | full pricing plus priority access |
| `blocked`    | seller operator action         | none, rejected      | no access                         |

The rule that makes this a lattice rather than a label: the buyer's effective tier is the minimum of its trust-based ceiling and its claimed identity tier. A buyer claiming `advertiser` with `registered` trust is capped at `seat`.

One caveat worth carrying. `iab-agentic-primitives/SANDBOX_REGISTRY.md` states that the real registry "has **no self-asserted access-tier / trust-tier enum** — trust is the `verification_status` + `domain_verified` + `iab_member` triplet." So the five-value lattice above is the seller agent's local policy, computed partly from registry signals, not an attribute the registry issues. The same file flags the trust-tier method as legacy and pending migration.

## Does AdCP have a registry as well?

Yes, and pretending otherwise would be the easy mistake here. AgenticAdvertising.org runs a registry with a REST API described in `static/openapi/registry.yaml` (base URL `https://agenticadvertising.org`, over 100 paths). It has `POST /api/adagents/validate` to validate a domain's `adagents.json`, and an admin endpoint `POST /api/registry/publisher/{domain}/adagents/revalidate` that, per its own description, synchronously fetches a publisher's live `/.well-known/adagents.json`, runs the validator, and persists the refreshed verdict.

Read those two endpoints and the architecture states itself: the AAO registry is an index over files the publisher publishes. It caches, validates and reports on the authorization; it does not issue it. In AAMP the direction reverses. Agents register themselves into the registry (`POST /api/agents`, where the JWT's company domain must match the submitted `primary_domain`), and the registry's `verification_status` is the trust signal others consume.

## AdCP and AAMP discovery, side by side

| Axis                                     | AdCP 3.1.10                                                                                     | AAMP (per-repo, no umbrella version)                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Where authorization is published         | publisher origin, `/.well-known/adagents.json`; brand house origin, `/.well-known/brand.json`   | central registry, agent self-registers                                                      |
| Who is the authority                     | the domain owner                                                                                | the registry operator, IAB Tech Lab                                                         |
| What the registry does                   | validates and indexes files it fetches                                                          | holds the identity record and verification status                                           |
| Per-agent document                       | A2A agent card at `.well-known/agent.json`; governance agents use `.well-known/agent-card.json` | agent card at `/.well-known/agent.json`                                                     |
| Trust vocabulary                         | authorization scoped per property, collection, placement, plus `delegation_type`                | `unknown` / `registered` / `approved` / `preferred` / `blocked`, which caps the access tier |
| Failure mode when the authority is wrong | one publisher's file is wrong                                                                   | one registry outage or one bad record affects every participant                             |
| Status                                   | published schema in a stable release                                                            | registry contract explicitly not finalized                                                  |

## Do the two discovery models interoperate?

No, and there is no partial credit here. I grepped all eight IAB agentic repositories for `adagents`: zero hits. Nothing in the AAMP corpus reads a publisher-hosted AdCP authorization file, which is one instance of the broader result documented in [AdCP vs AAMP](/protocols/adcp-vs-aamp/): the AAMP corpus contains no reference to AdCP. Going the other way, AdCP's documentation mentions AAMP in exactly one place, a single FAQ accordion in `docs/faq.mdx`, where it notes that AAMP includes "an Agent Registry" work stream and declines a formal technical comparison because AAMP is "still defining its normative surface."

Both stacks do use A2A agent cards, so a seller that already publishes `/.well-known/agent.json` has one artifact that both models can read. That is a file format coincidence, not interoperability. Nothing maps an AAMP `registered` trust status onto an AdCP `authorized_agents` entry, and no file in either corpus proposes one.

## What I would do about it today

If you are a publisher, publish `adagents.json`. It costs one static file, it is validated by a public endpoint, and it is the only one of these two models where a released JSON Schema exists and you keep control of the answer.

If you are building a buyer agent against AAMP, do not hard-code a registry hostname. Three files in the corpus disagree about which one is real, the one that claims to be authoritative also says the earlier client was written against assumed shapes, and the seller repository says the whole integration is stubbed until the specification is finalized. Configure the URL, cache the verdicts, and expect the contract to move.

Both statements are dated 2026-08-09 and both are checkable. If `registry-agent-example` ever grows a normative contract, or a released AAMP specification names one registry, this page is the one to rewrite.
