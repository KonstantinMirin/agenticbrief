---
title: 'Seller Agent'
description: "A seller agent is AAMP's supply-side agent, defined by IAB Tech Lab's seller-agent reference implementation rather than by a ratified specification. AdCP calls the same role a sales agent."
answer: "A seller agent is the supply-side agent in IAB Tech Lab's AAMP work: it publishes a media kit, prices inventory by buyer tier, negotiates, and books deals. AdCP calls the same role a sales agent."
pubDate: 2026-08-09
term: 'Seller Agent'
alternateNames: ['supply-side agent', 'publisher agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'seller agent advertising'
  - 'iab seller agent'
  - 'aamp seller agent'
  - 'what is a seller agent'
citations:
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/quotes.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/README.md'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
related:
  - '/agents/sales-agent/'
  - '/agents/buyer-agent/'
  - '/agents/agent-card/'
  - '/agents/agent-registry/'
  - '/negotiation/trust-status/'
  - 'https://aampexplorer.noetis.dev/repos/reference-agents/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
seeAlso: ['Sales Agent', 'Buyer Agent', 'Agent Card', 'Trust Status']
reviewState: cto-reviewed
---

## What is a seller agent?

A seller agent is the supply-side software in IAB Tech Lab's AAMP work. It publishes a catalog of inventory, prices that inventory according to who is asking, evaluates proposals, runs a bounded price negotiation, and mints a deal ID the buyer can activate in a DSP.

The definition comes from a codebase, not a standard. `IABTechLab/seller-agent` describes itself as "an AI-powered inventory management system for publishers and SSPs to automate programmatic deal negotiation, booking, and distribution using IAB Tech Lab standards (OpenDirect 2.1, Deals API v1.0, sellers.json)", and its README opens with the banner `> **V2 — Feature Complete**`. Every seller agent term on this page is sourced from that reference implementation. None of it is a ratified specification.

Version pin: tag `v2.4.1`, commit `2bb7ebc`. AAMP itself has no single version. Each repository in the umbrella versions independently, which the AAMP hub README states directly: "Each repository uses independent semantic versioning."

### Is a seller agent the same as a sales agent?

Yes, and the naming split is the more interesting half of the question. AdCP's normative term for this role is **sales agent**, and the string "sales agent" does not appear anywhere in IAB's eight agentic repositories. The evidence, the counts and the comparison table live on our [sales agent page](/agents/sales-agent/), which is the page to read if that is the question you arrived with.

## What does a seller agent actually expose?

The seller agent publishes a generated OpenAPI 3.1.0 document at `docs/api/openapi.json` with **74 paths and 91 component schemas**. That is the largest machine-readable API surface anywhere in the AAMP corpus. Its generated reference pages report 88 REST endpoints, 46 MCP tools and 22 canonical event types.

The public entry point is the [agent card](/agents/agent-card/) at `GET /.well-known/agent.json`, which needs no authentication and returns identity plus five declared skills:

| Skill id      | What the seller agent claims it can do                        |
| ------------- | ------------------------------------------------------------- |
| `discovery`   | Search and browse inventory, media kits and packages          |
| `pricing`     | Return pricing based on buyer identity, with volume discounts |
| `proposals`   | Accept and evaluate proposals, including counter-offers       |
| `negotiation` | Run automated multi-round price negotiation                   |
| `deals`       | Mint OpenRTB-compatible deal IDs for DSP activation           |

The same card carries `capabilities.protocols`, `inventory_types` (populated from the live product catalog) and `supported_deal_types`, which are `pg`, `pmp`, `preferred_deal` and `private_auction`.

Note what the card says about transport. `capabilities.protocols` lists `opendirect21`, and the field documentation adds that `a2a` "will be listed once an inbound A2A server ships." The discovery guide is blunter still: A2A is "designed but not yet served." A seller agent today is reached over REST and MCP.

## How does a seller agent decide what price to show?

By tier, and the tier is capped by trust. A buyer agent presents an identity; the seller derives an access tier from it (`public`, `seat`, `agency`, `advertiser`); and the registry-verified [trust status](/negotiation/trust-status/) of that buyer sets a ceiling the buyer cannot claim past. The seller-agent docs put it plainly: the effective tier "is the minimum of their trust-based ceiling and their claimed identity tier."

Trust status itself takes five values: `unknown`, `registered`, `approved`, `preferred` and `blocked`. Only `registered` is automatic, awarded when the agent is found in the AAMP [agent registry](/agents/agent-registry/). The other three non-default states are operator actions.

Negotiation strategy is then selected from the tier, with a per-round concession cap and a round limit that both widen as the tier improves. The quantified four-row table is published once, on [AAMP Explorer's negotiation page](https://aampexplorer.noetis.dev/negotiation/), and cited rather than reproduced here.

A quote is the object that carries a price: the seller-agent quotes documentation describes quotes as "non-binding price offers from the seller" with a 24-hour TTL, later converted into deals. AdCP has no equivalent object.

## Where does a seller agent's wire contract come from?

Not from the seller agent repository. `seller-agent/pyproject.toml` pins `iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0`, and that library is the canonical home for the shared types: `Money`, `Product`, `Quote`, `Deal`, `Negotiation`, `Avails`, the error envelope, the access tier and trust status enums.

The library's own README opens with this:

> **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice.

Two consequences follow, and both are worth stating out loud. First, the seller agent's object model is pinned to a dependency that says it is not released. Second, `iab-agentic-primitives` is not listed among the six repositories in the AAMP hub README, so a reader working from the hub will never find it.

## What a seller agent is not

It is not a specification. It is a working Python service with generated documentation, and IAB Tech Lab has not published a normative seller-side wire specification distinct from it. Anyone writing "AAMP requires X" about seller behaviour is describing one implementation at one tag.

It also has no counterpart to AdCP's separation of concerns. AdCP splits identity into a [brand agent](/agents/brand-agent/) and policy into a [governance agent](/agents/governance-agent/); neither phrase appears anywhere in the AAMP corpus. The seller agent holds inventory, pricing, negotiation and booking in one service.

## Sources and version pins

- `IABTechLab/seller-agent` at tag `v2.4.1`, commit `2bb7ebc`. Agent card, trust lifecycle and tier mapping from `docs/api/agent-discovery.md`; quote semantics from `docs/api/quotes.md`; path and schema counts from `docs/api/openapi.json`.
- `IABTechLab/iab-agentic-primitives` at `v0.5.0-1-g2fc7029`, commit `2fc7029`.
- AAMP hub README at commit `3b20e67`, which lists six repositories and does not list `iab-agentic-primitives`.
- AdCP terminology from `docs/reference/glossary.mdx` at commit `f1a35ab`, AdCP 3.1.10.
