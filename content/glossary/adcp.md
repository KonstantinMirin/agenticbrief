---
title: 'Ad Context Protocol (AdCP)'
description: 'AdCP is the Ad Context Protocol, an open advertising standard whose published 3.1.10 release registers 64 operations. Where it is defined, what it covers, what it omits.'
answer: 'AdCP (Ad Context Protocol) is an open standard from AgenticAdvertising.org defining advertising tasks and JSON schemas for AI agents. Its published stable release, 3.1.10, registers 64 operations and runs over MCP or A2A as transport.'
pubDate: 2026-08-09
term: 'Ad Context Protocol'
alternateNames: ['AdCP']
category: protocol
cluster: gl-adcp
keywords:
  - 'ad context protocol'
  - 'what is adcp'
  - 'adcp definition'
  - 'adcp 3.1'
  - 'adcp 64 operations'
citations:
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/concepts/aamp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/mcp-and-a2a/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.noetis.dev/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['AAMP', 'MCP and A2A', 'Sponsored Intelligence', 'Sales Agent']
reviewState: cto-reviewed
---

## Who publishes AdCP, and where is it defined?

AdCP is published by AgenticAdvertising.org (AAO), an independent member organisation, under Apache 2.0. The specification surface is a JSON Schema registry plus a Mintlify documentation site, both in one repository: [`github.com/adcontextprotocol/adcp`](https://github.com/adcontextprotocol/adcp). Rendered docs are at [docs.adcontextprotocol.org](https://docs.adcontextprotocol.org/).

The repository's own glossary defines AdCP in one line: "An open standard for AI-powered advertising workflows" (`docs/reference/glossary.mdx`). That is thinner than the artifact deserves. What AdCP actually publishes is a set of named operations with request and response schemas, an envelope shared by all of them, and a conformance matrix stating which operations each role must implement.

AAO states plainly that it is not part of IAB Tech Lab: "AdCP is maintained by AgenticAdvertising.org (AAO), an independent specification body, not a subsidiary or working group of IAB Tech Lab" (`docs/faq.mdx:130`).

## Which AdCP version is current, and how do you check it?

Check `dist/schemas/latest.json`. On the commit I parsed it reads:

```json
{ "latest": "3.1.10", "latest_stable": "3.1.10", "channel": "stable", "path": "/schemas/3.1.10/" }
```

That file is the version oracle. Three other version surfaces in the same repository disagree with it and with each other, which is the single most common way AdCP gets misquoted:

| Surface                            | Value on the parsed commit | What it means                                            |
| ---------------------------------- | -------------------------- | -------------------------------------------------------- |
| `dist/schemas/latest.json`         | `3.1.10`                   | The published stable release. Use this.                  |
| `static/schemas/source/index.json` | `published_version: 3.1.1` | Unreleased `main`. The stamp only moves at release time. |
| `package.json`                     | `3.1.1`                    | Tracks `main`, not the release.                          |
| Wire pin in `adcp_version`         | `"3.1"`                    | Release precision only, never patch level.               |

One more trap: 3.1.3 is withdrawn. The version table says so in bold, giving two reasons, an added stable schema field in a patch release and an incorrect publisher-domain filter, and directs implementers to 3.1.2 instead (`docs/reference/versions.mdx:39`). The 3.1.3 artifacts remain downloadable for auditability, so a naive "highest number wins" script will pick a release the specification tells you not to use.

## What does AdCP 3.1.10 actually contain?

`dist/schemas/3.1.10/index.json` registers **64 operations** across ten schema groups. I counted them from the registry rather than from prose:

| Schema group           | Operations in 3.1.10 |
| ---------------------- | -------------------- |
| Governance             | 22                   |
| Media Buy              | 11                   |
| Creative               | 8                    |
| Brand Protocol         | 6                    |
| Accounts               | 5                    |
| Sponsored Intelligence | 4                    |
| Protocol (shared)      | 3                    |
| Signals                | 2                    |
| Trusted Match          | 2                    |
| Compliance             | 1                    |

You will see 65 quoted. That count comes from the unreleased `main` branch, which adds `sync_agent_notification_configs` to the protocol group. It exists in no published release, so any page citing 65 is describing a branch, not a standard.

The registry also declares two protocol layers. The negotiation layer covers planning-time work (media buy, creative, signals, accounts, governance, brand, sponsored intelligence). The decisioning and serving layer holds only the Trusted Match Protocol, which uses direct HTTP rather than an agent transport.

## What is AdCP's counterpart in the AAMP stack?

There is no single counterpart. AdCP is one specification with one version number and one registry. AAMP is an IAB Tech Lab umbrella over eight independently versioned repositories, most of which are reference implementations rather than ratified specifications. The nearest thing to an AdCP-shaped artifact on the AAMP side is `iab-agentic-primitives`, whose README declares itself "WORK IN PROGRESS, NOT YET RELEASED" while both IAB reference agents pin it as a dependency.

Object by object, some AdCP terms map cleanly (Product, Account) and some have no AAMP equivalent at all (Specialism, Sponsored Intelligence). The term-level mapping is on the [AdCP and AAMP terminology lookup](/concepts/adcp-vs-aamp-terminology/); the architectural comparison lives on [Agentic Ad Lab](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/).

## What is AdCP most often confused with?

**AdCP is not ACP.** The Agentic Commerce Protocol is an OpenAI and Stripe standard for checkout and payment delegation inside AI assistants. AdCP's own glossary lists ACP as a separate entry and positions the two as different layers rather than competitors.

**AdCP is not an IAB Tech Lab standard.** It coexists with OpenRTB, VAST, `ads.txt` and `sellers.json`, and its `adagents.json` file deliberately extends `ads.txt` and `sellers.json` relationship semantics, but the governance is separate.

**"AdCP 3.1" is not a patch version.** Wire pins are release precision. A client pinning `"3.1"` fails with `VERSION_UNSUPPORTED` against a server that speaks only 3.0, and there is no way to pin `3.1.10` on the wire.

**AdCP does not define a deal, a quote, or a negotiation object.** No file in `dist/schemas/3.1.10/` carries any of those names, and no property anywhere in the registry is named for one. The word `deal` does appear, twelve times across eight files, but only ever inside a description — except in `enums/response-type.json`, where it is one of four values a publisher can ask a Trusted Match context match to return. If you are looking for multi-round price negotiation, that vocabulary is on the AAMP side, and it comes from a reference implementation rather than a specification.

Every version number and count on this page was re-derived from `dist/schemas/3.1.10/` at commit `f1a35ab`. Method and pins: [how these definitions are sourced](/about/sources-and-versions/).
