---
title: 'Agent Registry'
description: "An agent registry lists advertising agents, their endpoints and their trust signals. AgenticAdvertising.org's is public to read and enrolment-only to join; IAB Tech Lab's is the reverse."
answer: "An agent registry is a directory of advertising agents, their endpoints, capabilities and trust signals. Two run: AgenticAdvertising.org's catalog for AdCP, which confers no authority, and IAB Tech Lab's for AAMP, where trust status caps price."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Agent Registry'
alternateNames: ['AAMP registry', 'IAB Tech Lab Agent Registry', 'AAO registry', 'agent catalog']
category: 'protocol'
cluster: 'gl-roles'
keywords:
  - 'ad agent registry'
  - 'iab tech lab agent registry'
  - 'aamp registry'
  - 'aao agent registry'
  - 'agent registry advertising trust'
citations:
  - 'https://docs.adcontextprotocol.org/docs/registry/registering-an-agent'
  - 'https://docs.adcontextprotocol.org/docs/registry'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/registry/registering-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/registry/index.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/aao/directory-api.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/adagents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/aao/org-admins.mdx'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/agent_registry.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/registry/agent_registry.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/clients/agent_registry_client.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/config/settings.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/media-kit.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/primitives/identity.py'
  - 'https://iabtechlab.com/introducing-the-iab-tech-lab-agent-registry/'
related:
  - '/agents/agent-card/'
  - '/agents/discovery-files/'
  - '/agents/seller-agent/'
  - '/agents/buyer-agent/'
  - '/negotiation/trust-status/'
  - '/negotiation/access-tier/'
  - '/concepts/mcp-and-a2a/'
  - '/about/sources-and-versions/'
  - 'https://agenticadlab.com/guides/agent-discovery-files/'
  - 'https://aampexplorer.com/repos/'
seeAlso: ['Agent Card', 'Trust Status', 'Access Tier', 'adagents.json']
reviewState: cto-reviewed
---

An agent registry is a directory of advertising agents: who they are, where their endpoints live, what they claim to do, and whether anyone has vouched for them. Two are running: the catalog of AgenticAdvertising.org (AAO), the paid-membership trade association that stewards [AdCP](/concepts/adcp/), and the Agent Registry of IAB Tech Lab, the standards body behind [AAMP](/concepts/aamp/). They take opposite positions on whether a registry may grant trust. In AAMP, trust status caps the price tier an agent can be quoted; the AAO catalog carries no trust signal at all.

|                 | AAO catalog (AdCP)                               | Agent Registry (AAMP)                        |
| --------------- | ------------------------------------------------ | -------------------------------------------- |
| Read the list   | anonymous `GET`, `200`, full public catalog      | `401 Authentication required`, JWT needed    |
| Get listed      | an AAO member enrols you; no self-registration   | free and open, members and non-members       |
| Public API spec | `openapi/registry.yaml`, 456 KB, no auth         | "documented in the Portal", behind a login   |
| Entries         | 23 visible to an anonymous caller, every one MCP | 40 shown in the portal UI, per the hub guide |

Neither registry is a precondition for transacting. No AdCP operation touches the directory, and in AAMP an unregistered counterparty resolves to `unknown` and trades at the `public` tier.

## How an agent gets listed

AAO enrolment buys discovery. It confers no authority: a publisher's own [adagents.json](/agents/discovery-files/) stays the trust root whether or not an agent appears in the catalog.

The catalog "contains only AAO-attested, member-enrolled agents", and an AAO member "must explicitly enroll the agent on their member profile". The same documentation states: "You cannot self-register today." Entries default to `visibility: "members_only"`, and reaching `public` requires a `primary_brand_domain` and a paid membership tier.

A `public` request from an account below that tier is stored as `members_only` with a `visibility_downgraded` warning, and reported to the caller as success.

The catalog itself is readable without credentials, and every visible entry declares `protocol: "mcp"`. AdCP defines its tasks over both [MCP and A2A](/concepts/mcp-and-a2a/), and the catalog carries a field to tell them apart. Anonymous callers see only the `public` records, so the visible list is a floor rather than a total.

A listing does not guarantee a reachable endpoint. Around half of the publicly listed agents complete an anonymous MCP handshake, and three listed sales agents return a product catalogue to an unauthenticated `get_products`. The agent-by-agent result is in [the AdCP registry, measured](https://adcpexplorer.com/guides/adcp-registry-measured/).

IAB Tech Lab's launch announcement says its Tools Portal "is open to both members and non-members and is free to register and use", validating each company against its GPP ID and TCF Global Vendor List ID. Reading it is a different matter: `GET https://registry.iabtechlab.ai/api/agents` answers `{"error":"Authentication required"}`. Three base URLs for that registry circulate in the AAMP repositories, and `registry.iabtechlab.ai` is the one that answers; the [agent discovery files guide](https://agenticadlab.com/guides/agent-discovery-files/) untangles them and is also the source of the 40-agent portal figure. The registry's routes, auth envelope and record shape are documented in `iab-agentic-primitives` rather than by IAB Tech Lab directly.

## Whether a registry confers trust

AdCP's registry documentation refuses the job:

> This endpoint is **discovery**, not **authorization**. The publisher's own `adagents.json` remains the trust root.

Publisher-attested `signing_keys` live in [adagents.json](/agents/discovery-files/) on the publisher's own domain, and a verifier "MUST reject any signature whose `keyid` is not in that pinned set, regardless of `jwks_uri` contents". The registry never holds key material, and none of AdCP's operations is a registry operation: the directory sits outside the protocol surface entirely.

AAMP takes the other position and prices it. Registry presence sets [trust status](/negotiation/trust-status/), and trust status caps the [access tier](/negotiation/access-tier/) an agent can claim.

| Trust status | Ceiling in `seller-agent` | What that tier is shown        | Ceiling in `iab-agentic-primitives` | What that tier is shown        |
| ------------ | ------------------------- | ------------------------------ | ----------------------------------- | ------------------------------ |
| `unknown`    | `public`                  | price ranges only, no discount | `public`                            | price ranges only, no discount |
| `registered` | `seat`                    | exact prices, no discount      | `seat`                              | exact prices, no discount      |
| `approved`   | `advertiser`              | full discounts plus volume     | `agency`                            | tier discounts                 |
| `preferred`  | `advertiser`              | full discounts plus volume     | `advertiser`                        | full discounts plus volume     |
| `blocked`    | none, hard reject         | nothing                        | `public`                            | price ranges only              |

Of the five statuses only `registered` is automatic; the rest are operator decisions. On the sample rate card in the buyer agent's media-kit documentation, under a column headed "Typical Discount", the ladder is worth roughly 5 percent at `seat`, 10 at `agency` and 15 at `advertiser` off the same base CPM.

The library both IAB reference agents pin calls the ladder legacy. `iab-agentic-primitives` annotates `TRUST_TIER_CEILING` "(Legacy AAMP trust-tier model; retained for the EP-7.1 harness)", and its sandbox registry note records that the real registry "does not implement" that model and has "no self-asserted access-tier / trust-tier enum". The two maps disagree in two rows. On `approved` it is advertiser tier against agency tier, 15 percent off a live deal against 10. On `blocked` it is a hard reject against a `public` ceiling: one map refuses the agent, the other prices it at rate card.

In the shipped seller agent the ladder is not wired up. The registry client is a stub: agent search returns `[]` unconditionally, lookups hand back mock data stamped `"[STUB] Pending AAMP API integration"`, and the real-API client in the same file is switched off because `aamp_registry_url` defaults to `""`. The seller agent's documentation states this under "Current Limitations": the integration "is stubbed pending the public API specification. Currently, agent trust is managed locally by the operator."

Out of the box every counterparty resolves to `UNKNOWN`, and `UNKNOWN` buys at the `public` tier. A counterparty is added through `POST /registry/agents/discover`. Because trust is held locally, each deployment ends up with its own list.

## Revocation and change feeds

AdCP's registry ships a cursor-based change feed at `GET /api/registry/feed`, with an SSE variant, 90-day retention and `410 Gone` when a cursor expires. Event types include `agent.removed`, `agent.verification_lost` and `authorization.revoked`. AAMP has nothing in that shape: the seller agent files "Automatic trust refresh (periodic re-verification against registries)" under planned improvements. Trust status has no expiry and no re-verification step.

The two registries store different things. The AAO catalog takes an agent `url`, is idempotent on create, and carries no trust signal; a submitted agent type is overwritten with the crawler's latest snapshot. The IAB record takes `agent_name` and `primary_domain` and carries three trust signals, `verification_status`, `domain_verified` and `iab_member`, of which only `domain_verified` says anything about the agent's own infrastructure. An IAB `registered` records a validated GPP ID and TCF Global Vendor List ID, not a check of the agent's endpoint. An AAO listing records member enrolment.
