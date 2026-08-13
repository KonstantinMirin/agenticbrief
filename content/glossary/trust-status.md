---
title: 'Trust Status: unknown, registered, approved, preferred, blocked'
description: "Trust status is AAMP's five-value label on a counterparty agent, capping the access tier it may claim. The values, who sets them, and how they map to pricing."
answer: "Trust status is AAMP's five-value label on a counterparty agent - unknown, registered, approved, preferred or blocked - that caps the maximum access tier that agent may claim. Three of the five are set by a seller operator."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Trust Status'
alternateNames: ['trust lattice', 'agent trust status', 'TrustStatus', 'TrustLevel']
category: identity
cluster: 'gl-negotiation'
keywords:
  - 'buyer agent trust status'
  - 'aamp trust status'
  - 'trust status enum aamp'
  - 'agent trust verification'
  - 'registry verified agent trust'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/AgentTrustVerification.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/PROTOCOL_RECONCILIATION.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/RECONCILIATION.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/agent_registry.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/registry/agent_registry.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/models.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/aamp_client.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
related:
  - '/negotiation/access-tier/'
  - '/agents/agent-registry/'
  - '/agents/buyer-agent/'
  - '/agents/seller-agent/'
  - '/agents/discovery-files/'
  - '/negotiation/deal/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
  - 'https://adcpexplorer.com/discovery/'
seeAlso: ['Access Tier', 'Agent Registry', 'Agent Card', 'Buyer Agent', 'Seller Agent']
reviewState: cto-reviewed
---

Trust status is the label an AAMP seller agent keeps on every counterparty it deals with, and it caps how much access that counterparty gets. There are five values: `unknown`, `registered`, `approved`, `preferred` and `blocked`. The definition sits in `spec/jsonschema/protocol/AgentTrustVerification.json`: "Registry-verified trust status of an agent. Determines the maximum `AccessTier` an agent can claim... trust is verified against the AAMP registry ... never self-asserted."

## The five values

| Value        | Definition                                 | How an agent gets it                |
| ------------ | ------------------------------------------ | ----------------------------------- |
| `unknown`    | "Never seen before, not in any registry"   | Default on first contact            |
| `registered` | "Found in the IAB AAMP registry"           | Automatic verification against AAMP |
| `approved`   | "Manually approved by the seller operator" | Operator action                     |
| `preferred`  | "Strategic partner with premium access"    | Operator action                     |
| `blocked`    | "Explicitly blocked — zero data access"    | Operator action                     |

`registered` is the one value a machine assigns, and the two seller-agent documents define it differently: `docs/api/agent-discovery.md` as a lookup in the IAB AAMP registry, `docs/api/authentication.md` as a fetched agent card that has not been verified against any registry.

The seller agent's reference implementation draws the lifecycle as a line with one exit:

```
unknown → registered → approved → preferred
                ↘ blocked
```

## Trust status caps the access tier

`TRUST_TO_TIER_MAP` in the seller agent is the mapping that runs:

| Trust status | Maximum access tier | Pricing visibility                |
| ------------ | ------------------- | --------------------------------- |
| `unknown`    | `public`            | Published rate card only          |
| `registered` | `seat`              | Seat-level pricing                |
| `approved`   | `advertiser`        | Full advertiser-level pricing     |
| `preferred`  | `advertiser`        | Full pricing plus priority access |
| `blocked`    | None, rejected      | No access, HTTP 403               |

The effective tier is the lower of the trust ceiling and the tier the buyer's credential carries. `docs/api/agent-discovery.md`: "The buyer's effective tier is the minimum of their trust-based ceiling and their claimed identity tier." [Access Tier](/negotiation/access-tier/) covers what each tier unlocks.

The map is not part of the wire contract. `RECONCILIATION.md`: "the `TRUST_TO_TIER_MAP` policy table stays out of the contract", which makes it the seller reference agent's own policy. `agency` is one of the four `AccessTier` values and no row of the map produces it, so it is reached only through the credential side of the minimum.

## How an agent gets a trust status

The normative protocol defines no operation that writes a trust status. `POST /registry/agents/discover` in `spec/openapi/iab-agentic-api.yaml` returns an `AgentTrustVerification`, and no operation there sets one.

A write path exists only in the seller agent, which puts list, get, discover, `PUT .../trust` and `DELETE` under `/registry/agents` behind an operator API key. A buyer key does not open it. `spec/fixtures/protocol/AgentTrustVerification.golden.json` carries conformance vectors for `approved_by_registry` and `unknown_unregistered` only.

## The AAMP registry

The registry that verifies trust status is not publicly readable, and the three repositories name three different hosts: `https://tools.iabtechlab.com/agent-registry` in `seller-agent`, `https://registry.aamp.iab.com/agent-registry` in `buyer-agent`, and `https://registry.iabtechlab.com` in `iab-agentic-primitives`. The normative schema allows for more than one: `AgentTrustVerification` requires only `agent_url` and hangs four optional fields off it, `agent_id`, `trust_status`, `verified_at` and `registry_id`, documented as the "Registry that answered, e.g. `iab_aamp`".

Against the live [agent registry](/agents/agent-registry/) the five-value enum collapses to two. `SANDBOX_REGISTRY.md` records that "The registry has no self-asserted access-tier / trust-tier enum — trust is the `verification_status` + `domain_verified` + `iab_member` triplet", and the buyer's adapter for that registry maps `verification_status == "active"` to `VERIFIED` and everything else to `REGISTERED`. `STANDARDS_GAP_REPORT.md` records that trust status semantics are asserted by the AAMP reference specification rather than against published IAB AAMP material.

## Where the enum is defined

The normative definition is `iab-agentic-primitives`, which states that "The spec is the normative artifact; this package is its reference implementation" and has [no released version](https://aampexplorer.com/versions/). Each reference agent then redeclares the values, with no shared type between them.

| File                                                                                        | Values                                                | `approved` ceiling | `blocked`           |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ | ------------------- |
| `iab-agentic-primitives` `spec/jsonschema/protocol/AgentTrustVerification.json` (normative) | unknown, registered, approved, preferred, blocked     | schema is silent   | schema is silent    |
| `seller-agent` `src/ad_seller/models/agent_registry.py`                                     | same five                                             | `advertiser`       | `None`, hard reject |
| `iab-agentic-primitives` `src/iab_agentic_primitives/registry_client.py` (LEGACY)           | same five                                             | `agency`           | `public`            |
| `buyer-agent` `src/ad_buyer/registry/models.py`                                             | unknown, registered, **verified**, preferred, blocked | no tier map        | no tier map         |

The buyer agent writes `verified` where the other three write `approved`, in `src/ad_buyer/registry/models.py`, and `docs/api/seller-discovery.md` mirrors it. `PROTOCOL_RECONCILIATION.md` (2026-07-28) resolves `verified` down to `approved` and records "Buyer's card model and `TrustLevel.VERIFIED` retired". The buyer agent ships `TrustLevel.VERIFIED` in its 2026-08-05 commit.

The two ceiling maps differ on what `approved` unlocks and on whether `blocked` is a rejection or a floor. The seller's map is the one enforced at request time: `compute_effective_tier` stamps the ceiling onto every `BuyerContext` and the pricing engines read it from there, while the library's `TRUST_TIER_CEILING` feeds only its own sandbox and the buyer agent reads no ceiling at all.

## AdCP has no trust status

AdCP 3.1.13 defines no trust enum and nothing that grades a counterparty on a scale. The nearest-looking field, `status` in `trusted-match/provider-registration.json`, takes `active`, `inactive` or `draining`, which is lifecycle rather than trust.

It proves relationships pairwise instead, through signed declaration files: a publisher declares its sellers in `/.well-known/adagents.json`, a brand declares itself in `/.well-known/brand.json`, where `agents[].jwks_uri` anchors the signing key, and a named house's `brand_refs[]` "MUST reciprocate for mutual-assertion trust. Single-hop only." [Discovery files](/agents/discovery-files/) covers the mechanics.

## Trust status, access tier and verification status

Trust status is the ceiling a seller keeps on a counterparty agent. [Access tier](/negotiation/access-tier/) is what that agent is allowed to see and pay on a given request, once the ceiling and its credential have been combined. Verification status is a field of the live registry, beside `domain_verified` and `iab_member`, and is the input the buyer agent's adapter turns into a trust status.
