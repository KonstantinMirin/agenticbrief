---
title: 'Discovery Files: adagents.json and brand.json'
description: 'AdCP publishes two domain-hosted discovery files, adagents.json and brand.json, both schema-registered. AAMP discovers agents through a registry instead, and names a .txt file it never specifies.'
answer: "AdCP defines two domain-hosted discovery files: adagents.json declares which agents may sell a publisher's inventory or resell its signals, and brand.json declares brand identity. Both live under /.well-known/. AAMP has neither."
pubDate: 2026-08-09
term: 'Discovery Files'
alternateNames: ['brand.json', 'adagents.json', 'well-known files']
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'brand.json'
  - 'adagents.json brand.json'
  - 'agent discovery files advertising'
  - 'well-known brand.json'
citations:
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/brand-json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/authorized-agent-base.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/brand-protocol/brand-json.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://datatracker.ietf.org/doc/html/rfc8615'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/sandbox_registry/real_double.py'
related:
  - '/agents/agent-registry/'
  - '/agents/agent-card/'
  - '/agents/brand-agent/'
  - '/agents/sales-agent/'
  - '/agents/signal-agent/'
  - 'https://adcpexplorer.noetis.dev/discovery/adagents-json/'
  - 'https://agenticadlab.noetis.dev/guides/agent-discovery-files/'
seeAlso: ['Agent Registry', 'Agent Card', 'Brand Agent', 'Sales Agent']
reviewState: cto-reviewed
---

## What are agent discovery files?

Discovery files are documents a domain owner publishes at a fixed path so that any agent can find out, without asking permission, who is authorised to act on that domain's behalf. AdCP defines two, both under `/.well-known/` per RFC 8615, and both registered in the published 3.1.10 schema registry:

| File            | Hosted by                                    | Schema `$id`                    | Answers                                                        |
| --------------- | -------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `adagents.json` | Publisher domains, and data provider domains | `/schemas/3.1.10/adagents.json` | Which agents may sell this inventory, or resell these signals? |
| `brand.json`    | Brand and house domains                      | `/schemas/3.1.10/brand.json`    | Who is this brand, and who speaks for it?                      |

Version pin: AdCP **3.1.10**, per `dist/schemas/latest.json`, repository at commit `f1a35ab`.

The model is the thing that separates the two stacks. AdCP puts authority on the domain. Whoever controls `example.com` decides what `example.com/.well-known/adagents.json` says, and that assertion needs no intermediary. AAMP puts authority in an [agent registry](/agents/agent-registry/) instead.

## What is brand.json?

`brand.json` is the brand identity file, hosted at `https://example.com/.well-known/brand.json`. Its 3.1.10 schema is titled "Brand Discovery" and defines five variants:

| #   | Variant                             | Use when                                           |
| --- | ----------------------------------- | -------------------------------------------------- |
| 1   | Authoritative Location Redirect     | The canonical document is hosted at another URL    |
| 2   | House Redirect                      | This brand domain rolls up into a larger house     |
| 3   | [Brand Agent](/agents/brand-agent/) | An MCP agent serves authoritative brand identity   |
| 4   | House Portfolio                     | A house publishes its brands, inline or by pointer |
| 5   | Brand Canonical Document            | A brand self-publishes its own identity            |

Variants 1 to 3 are mutually exclusive with each other and with 4 and 5. Variants 4 and 5 compose, through `brand_refs[]` pointing down and `house_domain` pointing back up. The hierarchy is one level deep: "only a house declares ownership; a brand cannot itself have children."

That composition is the interesting design choice, and the specification explains why it exists in a sentence worth quoting: "If Converse wants to update its logo, someone edits Nike, Inc.'s file." Inline `brands[]` keeps the parent in control; `brand_refs[]` lets a subsidiary own its own canonical document while the house remains the authority on who is in the family. AdCP calls the two-sided version of this a mutual-assertion trust model, because the house names the brand and the brand names the house.

Redirects carry a reason. `redirect_reason` is an enum with `acquisition`, `rebrand`, `regional`, `legacy`, `consolidation` and `other`, which exists so a cache can tell a corporate restructure from a CDN change.

## What is adagents.json?

`adagents.json` is the authorisation file. The schema description: "Declaration of authorized agents for advertising inventory and data signals. Hosted at `/.well-known/adagents.json` on publisher domains (for properties) or data provider domains (for signals)."

It has two top-level shapes. A pointer file carries `authoritative_location` and nothing else of substance. An inline file carries the real data: `properties[]`, `collections[]`, `placements[]`, `formats[]`, `signals[]`, `contact`, `catalog_etag` and the array that gives the file its name, `authorized_agents[]`.

Entries in `authorized_agents[]` are discriminated on `authorization_type` and come in six shapes. Four scope inventory (`property_ids`, `property_tags`, `inline_properties`, `publisher_properties`) and two scope data (`signal_ids`, `signal_tags`). Every shape inherits `url`, `authorized_for` and optional `signing_keys` and `encryption_keys` from `core/authorized-agent-base.json`, so a publisher can attest an agent's public keys rather than leaving buyers to discover keys on the agent's own domain.

Two rules catch people out.

**An empty array is not a denial.** `authorized_agents: []` is legal and means a catalog-only file for a platform that has not adopted AdCP. The schema instructs validators that they "MUST NOT read it as deny-all, authorize-all, or a revocation" and MUST still consume the catalog arrays.

**Fetching is treated as a security operation.** Because one deploy at an authoritative location can change authorisation for every publisher in a network, the schema tells validators to cap response size, refuse redirects on the fetch, enforce short timeouts, and serve the previously cached file on a transient 5xx. It sets a two-tier size cap: 5 MB for the pointer file served at the well-known path, and a recommended 20 MB for the dereferenced authoritative file, because that origin has explicitly opted into fanning out.

Field-by-field reference for the whole file lives on [AdCP Explorer](https://adcpexplorer.noetis.dev/discovery/adagents-json/).

## Does AAMP have discovery files?

Not in the same sense. AAMP discovery runs through a registry lookup followed by an [agent card](/agents/agent-card/) fetch, and the card is served by the agent about itself rather than by the domain owner about the agent.

There is one exception, and it is a thin one. The shared contract library `iab-agentic-primitives` documents a public registry endpoint, `POST /api/agents/validate/agent`, that answers "whether a publisher domain authorizes a given agent URL, per the publisher's `/.well-known/authorized-agents.txt` file."

So AAMP does have the concept of a publisher-hosted authorisation file. What it does not have is a specification of one. That filename appears in a Python docstring, and in a test that asserts the unauthorised result. There is no schema, no example file, no field list, and no other mention anywhere in the eight repositories. The library's own test double "does not fetch the publisher's authorized-agents.txt" at all.

| Question                            | AdCP 3.1.10                                                         | AAMP                                                                      |
| ----------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Publisher-hosted authorisation file | `adagents.json`, JSON Schema registered, six authorisation variants | `/.well-known/authorized-agents.txt`, named in one docstring, unspecified |
| Brand identity file                 | `brand.json`, five variants, hierarchy and trademark fields         | None                                                                      |
| Primary discovery mechanism         | Domain file, then runtime capability call                           | Registry query, then agent card fetch                                     |
| Where authority lives               | The domain owner                                                    | The registry operator                                                     |
| Key attestation                     | `signing_keys` and `encryption_keys` inside the authorisation entry | Not in the discovery path                                                 |

## Which model should you build against?

Both, if you are building for either. They fail differently, and that is the practical point.

A domain file is self-serve, cacheable and cheap to verify, and it goes stale silently when nobody edits it. A registry is queryable and can carry trust state that changes without a publisher redeploying, and it puts the registry operator in the path of every discovery. AdCP's registry documentation makes the split explicit on its side: crawled `adagents.json` files feed an authorisation graph, but they never create catalog entries. The domain file and the registry answer different questions on purpose.

The two-model comparison in full is on the [Agentic Ad Lab hub](https://agenticadlab.noetis.dev/guides/agent-discovery-files/).

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Schemas from `dist/schemas/3.1.10/{adagents.json, brand.json, core/authorized-agent-base.json}`; prose from `docs/brand-protocol/brand-json.mdx`.
- `IABTechLab/iab-agentic-primitives` at commit `2fc7029`, `src/iab_agentic_primitives/registry_client.py` and `src/iab_agentic_primitives/sandbox_registry/real_double.py`. That library declares itself "WORK IN PROGRESS — NOT YET RELEASED".
- RFC 8615 for the `/.well-known/` URI convention.
