---
title: 'Discovery Files: adagents.json and brand.json'
description: 'Discovery files are domain-hosted declarations about agents. AdCP defines two under /.well-known/: adagents.json for selling rights, brand.json for identity.'
answer: 'Discovery files are documents a domain owner publishes at a fixed /.well-known/ path to declare which agents may act for that domain; AdCP defines two, adagents.json and brand.json, and AAMP defines none.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Discovery Files'
alternateNames: ['brand.json', 'adagents.json', 'well-known files']
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'brand.json'
  - 'well-known brand.json'
  - 'adagents.json brand.json'
  - 'agent discovery files advertising'
citations:
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/brand-json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/authorized-agent-base.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/brand-json.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/verification/overview.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/managed-networks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/registry/index.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trust.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/sandbox_registry/real_double.py'
  - 'https://datatracker.ietf.org/doc/html/rfc8615'
related:
  - '/agents/agent-card/'
  - '/agents/agent-registry/'
  - '/agents/brand-agent/'
  - '/agents/sales-agent/'
  - '/agents/signal-agent/'
  - '/negotiation/trust-status/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/discovery/'
  - 'https://agenticadlab.com/guides/agent-discovery-files/'
seeAlso: ['Agent Card', 'Agent Registry', 'Brand Agent', 'Sales Agent', 'Trust Status']
reviewState: cto-reviewed
---

A discovery file is a document a domain owner publishes at a fixed `/.well-known/` path to declare which agents may act for that domain. An [agent card](/agents/agent-card/), served from the same `/.well-known/` prefix, is the reverse: an agent's statement about itself. AdCP defines two discovery files, and AAMP defines none.

| File            | Hosted by                                    | Schema title              | Answers                                                        |
| --------------- | -------------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `adagents.json` | Publisher domains, and data provider domains | AdCP Agents Authorization | Which agents may sell this inventory, or resell these signals? |
| `brand.json`    | Brand and house domains                      | Brand Discovery           | Who is this brand, and who speaks for it?                      |

Other strings share the namespace and none has a schema. `/.well-known/adcp/sales` and `/adcp/signals` are agent endpoints that appear only in examples. `adcp-ownership.txt` carries the domain-control challenge: the [registry](/agents/agent-registry/) issues a single-use nonce, echoed back from that path inside fifteen minutes, or the same proof runs through a `_adcp-owner.{domain}` DNS TXT record. Neither of the two schemas has changed across the stable 3.1.x releases.

## What a buyer computes from the two files

The two files are read against each other, and validation "checks both sides": the publisher's `adagents.json` (does it authorise this agent with the claimed `delegation_type`?) and the operator's `brand.json` (does it declare this property with a matching `relationship`?). The result is a five-state signal with one documented buyer action per state.

| State              | Meaning                                                                                          | Buyer action                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `inline`           | The seller is the brand owner, no delegation involved                                            | Proceed                                                                           |
| `mutual_assertion` | Both sides published matching declarations                                                       | Proceed                                                                           |
| `one_sided_brand`  | The seller's `brand.json` claims a publisher that hasn't reciprocated                            | "Do not treat as authorization. Any domain can claim any publisher unilaterally." |
| `one_sided_house`  | The publisher's `adagents.json` names a seller whose `brand.json` doesn't acknowledge it         | Hold for human review                                                             |
| `standalone`       | Neither side publishes, bearer-token trust only, which is where a silent domain puts every buyer | Out-of-band authorisation, or refuse                                              |

AdCP credits the mutual-assertion pattern to `ads.txt` and `sellers.json`, and what it adds is the second side: an entry in a publisher's `adagents.json` counts as authorisation only when the named agent's own `brand.json` declares the same property back.

The string `mutual_assertion` appears in no published schema, in 3.1.13 or earlier. The five states live in three `.mdx` documents and nowhere else, and `docs/trust.mdx` labels the model an RFC linked to a GitHub issue rather than settled specification. Two conformant implementations can compute different verdicts about the same publisher without either violating a schema.

The two cross-checked enums are different lengths. `delegation_type` has three values: `direct`, `delegated`, `ad_network`. `relationship` has those three plus `owned`, which the schema documents as having "no adagents.json delegation_type counterpart", and no rule says what a validator does with the leftover. [AAMP's trust status](/negotiation/trust-status/) is a typed field on the wire; AdCP's five states are not in any schema.

## The five brand.json variants

| #   | Variant                             | Use when                                   |
| --- | ----------------------------------- | ------------------------------------------ |
| 1   | Authoritative Location Redirect     | The canonical document is hosted elsewhere |
| 2   | House Redirect                      | The brand domain rolls up into a house     |
| 3   | [Brand Agent](/agents/brand-agent/) | An MCP agent serves brand identity         |
| 4   | House Portfolio                     | A house publishes its brands               |
| 5   | Brand Canonical Document            | A brand self-publishes its own identity    |

A canonical document is the schema's `brand` definition: `id` and `names` required, the rest optional, plus `house_domain` for a brand in a house. Variant 4 wraps that definition in `brands[]`, inline or by pointer, and adds house-level `trademarks` and `authorized_operators`.

Variants 1 to 3 are mutually exclusive with each other and with 4 and 5. Variants 4 and 5 compose: `brand_refs[]` points down from the house, `house_domain` points back up, and each side must name the other. Nesting stops there — "A brand cannot itself declare brand_refs[]" — so a house that lists its brands inline keeps editorial control: "If Converse wants to update its logo, someone edits Nike, Inc.'s file".

Both redirect variants take an optional `redirect_reason` with seven values, four of which "suggest the resolved target is in transition and consumers SHOULD shorten cache TTL until stable".

The schema's own top-level `description` lists four of the five. Brand Canonical Document is missing from it, and the same sentence says the file is hosted "on house domains" when variant 5 puts it at the brand's own `/.well-known/brand.json`. A reader working from that description rather than from the definitions under it will miss a valid variant.

## adagents.json: six authorisation variants over one base

A pointer file carries `authoritative_location`; an inline file carries the catalog arrays, `contact`, `catalog_etag` and `authorized_agents[]`.

Entries in `authorized_agents[]` are discriminated on `authorization_type`: four variants scope inventory (`property_ids`, `property_tags`, `inline_properties`, `publisher_properties`), two scope data (`signal_ids`, `signal_tags`). All six inherit `url`, `authorized_for`, `signing_keys`, `encryption_keys` and `last_updated` from `core/authorized-agent-base.json`, "centralized to prevent drift across all authorization-type variants". Because the publisher rather than the agent publishes those keys, a buyer can check an agent's signature against the domain's own declaration.

`authorized_agents: []` carries no authorisation meaning. Validators "MUST NOT read it as deny-all, authorize-all, or a revocation, MUST NOT treat its presence as an error, and MUST still consume the catalog arrays." The registry emits exactly this shape: its writes are "an identity-only write surface: the stored document always carries `authorized_agents: []`". A validator that reads an empty array as deny-all rejects every publisher the registry has written.

Fetching carries its own risk: one deploy at an authoritative location changes authorisation for every publisher in the network. AdCP's managed-networks guidance writes the fetch rules at MUST: the response is capped at 5 MB for the pointer and a recommended 20 MB for the dereferenced file, redirects are refused, and both hops carry short timeouts. On a transient 5xx the cached file is served rather than failing closed, a deliberate availability choice.

## Discovery files in AAMP

AAMP defines no domain-hosted authorisation file and no brand identity file. It does use `/.well-known/` for the agent's own card, the opposite direction of assertion. The nearest approach is a docstring: `iab-agentic-primitives` documents a registry endpoint answering "whether a publisher domain authorizes a given agent URL, per the publisher's `/.well-known/authorized-agents.txt` file." No schema or field list for that file is published, and the test double "does not fetch the publisher's authorized-agents.txt".

Authority sits in a different place in each stack. AdCP's discovery path starts at a file the domain owner publishes and moves on to a runtime capability call, and the authorisation entry carries the agent's `signing_keys` and `encryption_keys`. AAMP's starts at a [registry](/agents/agent-registry/) query and moves on to an agent card fetch, with no key attestation in the discovery path, so the registry operator holds the position the domain owner holds in AdCP.
