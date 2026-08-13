---
title: 'Ad Context Protocol (AdCP)'
description: 'AdCP is the Ad Context Protocol, an open standard from AgenticAdvertising.org. The published 3.1.13 release registers 64 operations, and there is no deal object anywhere in it.'
answer: 'AdCP (Ad Context Protocol) is an open advertising standard from AgenticAdvertising.org whose stable 3.1.13 release registers 64 operations across ten schema groups, carried over MCP and A2A at planning time and plain HTTP at serve time.'
pubDate: 2026-08-09
term: 'Ad Context Protocol'
alternateNames: ['AdCP', 'Advertising Context Protocol']
category: protocol
cluster: 'gl-stacks'
keywords:
  - 'ad context protocol'
  - 'what is adcp'
  - 'adcp definition'
  - 'what does adcp stand for'
  - 'advertising context protocol'
  - 'adcp 64 operations'
citations:
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/proposal.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/insertion-order.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/README.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CHARTER.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/concepts/aamp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/mcp-and-a2a/'
  - '/concepts/sponsored-intelligence/'
  - '/negotiation/deal/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['AAMP', 'MCP and A2A', 'Sponsored Intelligence', 'Trusted Match Protocol', 'Deal']
updatedDate: 2026-08-09
reviewState: cto-reviewed
---

AdCP, the Ad Context Protocol, is an open advertising standard published by AgenticAdvertising.org: a vocabulary of tasks a buyer's agent calls on a seller's agent to buy media. On the sell side, a sales agent is an MCP (Model Context Protocol) server exposing a publisher's inventory. The buy side is what AdCP calls an orchestrator: a client that calls sales agent tasks and exposes no server of its own.

The whole standard is one GitHub repository: a versioned JSON Schema registry and a documentation site, licensed Apache 2.0. `CHARTER.md` calls AgenticAdvertising.org "a pending 501(c)(6) nonprofit trade association incorporated in Delaware", and the FAQ states the relationship with the other standards body directly: "AdCP is maintained by AgenticAdvertising.org (AAO), an independent specification body — not a subsidiary or working group of IAB Tech Lab".

The README names the normative surface: "The schemas in `static/schemas/source/` and the protocol documents in `docs/` define the normative AdCP contract." The acronym is expanded both ways inside that repository: `docs/` and the glossary say Ad Context Protocol, while the README's first line, `CHARTER.md`, `governance/membership-agreement.md` and the 2.0.0 release-notes entry say Advertising Context Protocol. [AAMP](/concepts/aamp/)'s acronym has four expansions in circulation.

## AdCP 3.1.13 registers 64 operations

One media buy is `get_products` to find inventory, `create_media_buy` to book it, `sync_creatives` if the seller hosts the creative library, then `get_media_buy_delivery` to read back what ran. All but the creative step are Required for a Media Buy sales agent in `docs/protocol/required-tasks.mdx`. The other 60 operations sit around that spine, registered in `dist/schemas/3.1.13/index.json` across ten schema groups.

| Schema group           | Operations in 3.1.13 | What the group covers                                                                        |
| ---------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| Governance             | 22                   | Property governance, brand and content standards, and the checks run against them            |
| Media Buy              | 11                   | Finding, booking and reporting on inventory, `get_products` through `get_media_buy_delivery` |
| Creative               | 8                    | Building, previewing and syncing creative, and the formats it is built to                    |
| Brand Protocol         | 6                    | Brand identity retrieval, rights discovery, acquisition and lifecycle                        |
| Accounts               | 5                    | Account listing, usage reporting and account financials                                      |
| Sponsored Intelligence | 4                    | Conversational brand experiences inside AI assistants                                        |
| Protocol (shared)      | 3                    | Tasks common to every role: `get_adcp_capabilities`, `get_task_status`, `list_tasks`         |
| Signals                | 2                    | `get_signals` and `activate_signal`                                                          |
| Trusted Match          | 2                    | Serve-time activation of pre-negotiated packages: `context_match`, `identity_match`          |
| Compliance             | 1                    | The compliance testing tool, `comply_test_controller`                                        |

Governance is a third of the surface on its own. Fourteen of its 22 operations are create, update, get, list and delete over three objects — property lists, collection lists and content standards, which has no delete. The other eight calibrate content against a standard, check a plan against governance, validate what actually delivered, and pull the plan audit log.

AdCP launched as three protocols: Signals Activation, Curation and Media Buy. Signals Activation and Media Buy shipped, Curation is still a README row reading "Coming soon", and the two groups that landed instead, [Sponsored Intelligence](/concepts/sponsored-intelligence/) and Governance, were not on the original list.

The groups split across two protocol layers, and the reason is latency: "Planning-time tasks use MCP and A2A transports; serve-time decisions use the Trusted Match HTTP profile where the latency budget is impression-time" (`README.md`). Seven groups sit in the negotiation layer, over [MCP or A2A](/concepts/mcp-and-a2a/), the two agent transports AdCP runs on; [Trusted Match](/realtime/trusted-match-protocol/) is alone on the serving side, on plain HTTP. The whole surface, operation by operation, is at [AdCP Explorer](https://adcpexplorer.com/).

The documentation site renders from unreleased `main`, so it also describes `sync_agent_notification_configs` as a shared conditional task for every agent role. No release registers that operation.

## One file carries the version

`dist/schemas/latest.json` names the published release, 3.1.13. Three other surfaces in the same repository state a version, and each states a different one.

| Surface                            | Version stated | Status                                                               |
| ---------------------------------- | -------------- | -------------------------------------------------------------------- |
| `dist/schemas/latest.json`         | 3.1.13         | The published stable release                                         |
| `docs/reference/versions.mdx`      | 3.1.12         | The "which version should I use" page, one patch behind the registry |
| `static/schemas/source/index.json` | 3.1.1          | Unreleased `main`; the source stamp moves only when a release is cut |
| Wire field `adcp_version`          | `"3.1"`        | Release precision. Patches are never negotiated                      |

3.1.3 shipped on 13 July 2026 and is marked "Do not use" for adding a stable schema field in a patch. Its artifacts stay downloadable for auditability, so a version directory existing in the registry does not mean that release is safe to build against.

What a `"3.1"` pin does against a seller that speaks only 3.0 is stated two incompatible ways inside one file, `docs/reference/versioning.mdx`. One passage has the client fail with `VERSION_UNSUPPORTED`. The negotiation algorithm earlier in the same file downshifts to the highest supported release at or below the pin, which for a 3.0-only seller means serving 3.0 and proceeding. `core/version-envelope.json` sides with the downshift; [get_adcp_capabilities](https://adcpexplorer.com/operations/get-adcp-capabilities/) has the argument in full.

## Proposals and insertion orders, and no deal object

What a buyer actually handles is a proposal and, if the buy is signed, an insertion order. `core/proposal.json` is "a proposed media plan with budget allocations" whose committed form executes via `create_media_buy`, and `core/insertion-order.json` is "a signing wrapper attached to a committed proposal" that "does not introduce new deal terms". A proposal is accepted or refused rather than negotiated: price does not move across rounds, and a price that does move before signature is settled out of band.

The 3.1.13 release contains no deal, quote or negotiation object — no schema file and no property name. The word `deal` appears only as prose inside schema descriptions and as one value of `enums/response-type.json`, where it is one of four things a publisher can ask a Trusted Match context match to return. Multi-round price movement is an AAMP behaviour, and even there it is reference-implementation behaviour with no ratified spec, which is why [deal](/negotiation/deal/) and [quote](/negotiation/quote/) differ by stack.

## What AdCP is often confused with

Two protocols are frequently confused with AdCP and operate one layer below it. ACP is OpenAI and Stripe's Agentic Commerce Protocol; UCP is Google's Universal Commerce Protocol, built with Shopify, Walmart and Target. Both standardise checkout rather than media, and AdCP's FAQ classifies them as commerce protocols. AdCP also declines to replace the files a publisher already serves: `adagents.json` "extends the `ads.txt`/`sellers.json` relationship semantics rather than replacing them" (see [discovery files](/agents/discovery-files/)).

[AAMP](/concepts/aamp/) is the other stack rather than another layer. Term-by-term mapping, and which way the citation between the two runs, is on the [terminology lookup](/concepts/adcp-vs-aamp-terminology/); the architectural comparison is at [Agentic Ad Lab](https://agenticadlab.com/protocols/adcp-vs-aamp/).

Related terms: [AAMP](/concepts/aamp/), [MCP and A2A](/concepts/mcp-and-a2a/), [Sponsored Intelligence](/concepts/sponsored-intelligence/), [Trusted Match Protocol](/realtime/trusted-match-protocol/), [deal](/negotiation/deal/).
