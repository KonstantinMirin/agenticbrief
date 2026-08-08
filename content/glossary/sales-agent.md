---
title: 'Sales Agent'
description: 'AdCP calls the seller-side agent a sales agent. AAMP calls the same role a seller agent and never once uses the phrase sales agent. One role, two vocabularies.'
answer: "In AdCP, a sales agent is the seller-side server that exposes publisher inventory for discovery and purchase. AAMP's corpus never uses the phrase; it calls the same role a seller agent."
pubDate: 2026-08-09
term: 'Sales Agent'
alternateNames: ['sell-side agent', 'publisher agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'sales agent vs seller agent'
  - 'what is a sales agent in advertising'
  - 'adcp sales agent'
  - 'sales agent definition advertising'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/authorized-agent-base.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
related:
  - '/agents/seller-agent/'
  - '/agents/buyer-agent/'
  - '/agents/agent/'
  - '/agents/discovery-files/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.noetis.dev/discovery/adagents-json/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Seller Agent', 'Buyer Agent', 'Agent', 'adagents.json']
reviewState: cto-reviewed
---

## What is a sales agent in AdCP?

The AdCP glossary defines a sales agent as "an MCP server that exposes publisher inventory for discovery and purchase. Handles product discovery, media buy creation, and campaign management. Examples: Publisher ad servers exposing AdCP interfaces, sales house platforms."

That definition is from `docs/reference/glossary.mdx` in the Ad Context Protocol repository, checked at commit `f1a35ab`. The version pin for everything on this page is AdCP **3.1.10**, which `dist/schemas/latest.json` reports as both `latest` and `latest_stable` on the `stable` channel.

A sales agent is software, not a company. The company is the _seller_, which AdCP treats as a separate glossary term: "the AdCP participant role that provides advertising inventory." One seller can run one sales agent, or several.

### What must a sales agent implement?

`docs/protocol/required-tasks.mdx` organises AdCP operations by agent role. Under Media Buy Protocol, the section is headed "Sales agent (seller)" and marks seven operations Required:

| Operation                      | Requirement | What it covers                                             |
| ------------------------------ | ----------- | ---------------------------------------------------------- |
| `get_adcp_capabilities`        | Required    | Runtime capability discovery, required of every AdCP agent |
| `get_products`                 | Required    | Inventory discovery                                        |
| `create_media_buy`             | Required    | Campaign creation and order confirmation                   |
| `update_media_buy`             | Required    | Budget, targeting, pause, cancel                           |
| `get_media_buys`               | Required    | Operational state retrieval                                |
| `get_media_buy_delivery`       | Required    | Package-level delivery metrics                             |
| `provide_performance_feedback` | Required    | Accepting buyer optimisation signals                       |

`sync_creatives` and `log_event` are Conditional. `list_creatives`, `sync_catalogs`, `sync_event_sources` and `sync_audiences` are Optional. The published 3.1.10 registry carries 64 operations in total across ten protocol areas, so a sales agent implements a small, named subset rather than the whole protocol.

## Is a sales agent the same thing as a seller agent?

Yes. A sales agent (AdCP) and a [seller agent](/agents/seller-agent/) (AAMP) are two stacks' names for the same role: the piece of software on the supply side that publishes inventory, prices it, and books the order.

I checked whether the vocabularies overlap. They do not. Case-insensitively, the string "sales agent" appears in 134 files under `docs/`, `specs/` and `static/` in the AdCP repository at commit `f1a35ab`. Across all eight IAB Tech Lab agentic repositories, the same string appears in **zero** files. The reverse also holds in a weaker form: nothing in the AAMP corpus references AdCP at all, so IAB's repositories have never had to name AdCP's term.

| Question                      | AdCP 3.1.10                                                       | AAMP (seller-agent v2.4.1)                                        |
| ----------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| Name for the sell-side agent  | Sales agent                                                       | Seller agent                                                      |
| Where the name is defined     | `docs/reference/glossary.mdx`, `docs/protocol/required-tasks.mdx` | `seller-agent` reference implementation docs                      |
| Occurrences of "sales agent"  | 134 files                                                         | 0 files across all eight repos                                    |
| Occurrences of "seller agent" | 81 files, none of them normative                                  | 158 files                                                         |
| Source type                   | Published specification with a versioned schema registry          | Reference implementation, not a ratified specification            |
| Capability discovery          | `get_adcp_capabilities`, a runtime task                           | An [agent card](/agents/agent-card/) at `/.well-known/agent.json` |
| Price negotiation             | No negotiation object in the protocol                             | Quote, proposal, then multi-round negotiation                     |
| Sell-side authorisation       | `adagents.json` on the publisher domain                           | Trust status held in an [agent registry](/agents/agent-registry/) |

The counts above are greps over local checkouts, pinned to the commits listed at the foot of this page. Rerun them and you should get the same numbers.

One asymmetry is worth pulling out, because it is the strongest single piece of evidence that these are one role and not two. AdCP's own prose uses "seller agent" freely: the phrase turns up in 46 files under `docs/`, including `docs/faq.mdx:141`, where AdCP describes "how a buyer agent and a seller agent negotiate, transact, and govern a media buy." Its normative glossary entry is still **Sales Agent**. So AdCP will happily call the thing a seller agent in a sentence and a sales agent in a schema. AAMP never returns the favour.

## Why does AdCP say "sales agent" when AAMP says "seller agent"?

AdCP has already spent the word "seller" on the business role. Its glossary is explicit: "In AdCP schemas, 'seller' is the standard term for this role (not 'platform')." Having named the participant _seller_, AdCP names the participant's software _sales agent_.

AAMP does not draw that line. Its seller agent is the software and, in practice, the participant too. The AAMP hub README describes the repository as a "reference implementation of supply-side coordination and marketplace interaction" and does not define a separate business-role noun.

Neither body has published a mapping between the two terms. This page is the mapping, made from outside both. Treat it as our reading of two corpora that do not cite each other, not as a statement either standards body has endorsed.

## How does a publisher authorise a sales agent?

Through `adagents.json`, a file the publisher hosts at `/.well-known/adagents.json`. Its 3.1.10 schema (`$id: /schemas/3.1.10/adagents.json`, title "AdCP Agents Authorization") has two top-level variants: a pointer file carrying `authoritative_location`, or the inline file carrying the real data.

The inline variant's `authorized_agents` array is described in the schema as an "array of sales agents authorized to make inventory from this file available to buyers." Each entry is discriminated on `authorization_type` and comes in six shapes: `property_ids`, `property_tags`, `inline_properties`, `publisher_properties`, `signal_ids` and `signal_tags`. The first four authorise inventory; the last two authorise a [signal agent](/agents/signal-agent/) to resell named signals from a data provider's domain.

Every variant inherits three fields from `core/authorized-agent-base.json`: `url` (the agent endpoint), `authorized_for` (a free-text label, 1 to 500 characters) and optional `signing_keys` that let a buyer verify signed responses against a publisher-attested key rather than trusting key discovery on the agent's own domain.

One rule is easy to get wrong. An empty `authorized_agents: []` is legal, and the schema says validators "MUST NOT read it as deny-all, authorize-all, or a revocation." It means a catalog-only file for a platform that has not adopted AdCP.

Field-level reference for the whole file lives on [AdCP Explorer's adagents.json page](https://adcpexplorer.noetis.dev/discovery/adagents-json/).

## What a sales agent does not do

A sales agent does not negotiate. AdCP 3.1.10 has pricing options and rate cards; it has no quote object, no counter-offer, and no concession model. If you need agent-to-agent price negotiation, that machinery exists on the AAMP side, in the seller agent, and it is implementation-derived rather than ratified.

A sales agent also does not approve its own spend. Plan validation belongs to a [governance agent](/agents/governance-agent/), and brand identity belongs to a [brand agent](/agents/brand-agent/). AdCP splits these deliberately.

## Sources and version pins

- AdCP 3.1.10, `dist/schemas/latest.json` and `dist/schemas/3.1.10/index.json`, repository `adcontextprotocol/adcp` at commit `f1a35ab` (parsed 2026-08-08).
- IAB Tech Lab `seller-agent` at tag `v2.4.1`, commit `2bb7ebc`. AAMP hub README at commit `3b20e67`.
- AAMP has no single version number. Each repository versions independently, so "seller agent v2.4.1" is a per-repo tag, not an AAMP release.
