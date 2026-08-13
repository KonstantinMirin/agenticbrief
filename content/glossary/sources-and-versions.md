---
title: 'Sources and versions: how this glossary cites specifications'
description: 'Every definition here points at a repository, a commit and a file: AdCP pinned at published stable 3.1.13, and AAMP at eight independently versioned repositories.'
answer: 'A pinned source commit is the exact repository revision a definition was written from. This glossary sources AdCP terms from published stable release 3.1.13, and AAMP terms from eight independently versioned repositories with no shared version number.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Sources and Versions'
alternateNames: ['version pinning', 'spec citation policy', 'pinned commit']
category: protocol
cluster: 'gl-sources'
keywords:
  - 'agentic advertising glossary sources'
  - 'glossary spec citation policy'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/schemas/source/index.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/architecture/overview.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/pyproject.toml'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/embedding-exchange.md'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
related:
  - '/'
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/negotiation/quote/'
  - 'https://aampexplorer.com/versions/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'Quote', 'Deal', 'Policy Category']
reviewState: cto-reviewed
---

Every definition in this glossary is sourced from a named specification file at a pinned commit, the exact repository revision the definition was written from. [AdCP](/concepts/adcp/), the Ad Context Protocol, is pinned to published stable 3.1.13 at commit `a0fd0b5`, Apache 2.0, copyright AgenticAdvertising.Org. [AAMP](/concepts/aamp/) cannot be pinned the same way: the hub README expands the acronym as Agentic Advertising Management Protocols and ships no version number of any kind, so AAMP terms are pinned to eight commits instead.

Two rules decide which number a page carries. A published release is preferred to a working tree, and a machine-readable registry to documentation prose. For AdCP that picks 3.1.13, from `dist/schemas/latest.json`, which reads `{ "latest": "3.1.13", "latest_stable": "3.1.13", "channel": "stable" }`; `static/schemas/source/` is never read as a version, because it self-labels `stability: "development"`. Operation counts come from the same registry, which puts 64 operations across ten areas in that release.

## The eight AAMP repositories

There is no AAMP equivalent of `latest.json`, so every AAMP definition in [this glossary](/) traces back to one of these:

| Repository               | What it ships                     | Tag      | Commit    | Commit date |
| ------------------------ | --------------------------------- | -------- | --------- | ----------- |
| `AAMP` (hub)             | README index                      | untagged | `3b20e67` | 2026-04-16  |
| `iab-agentic-primitives` | 48 JSON Schemas, OpenAPI 3.1      | `v0.5.0` | `2fc7029` | 2026-07-28  |
| `seller-agent`           | Reference implementation          | `v2.4.1` | `2bb7ebc` | 2026-08-05  |
| `buyer-agent`            | Reference implementation          | `v2.3.0` | `0c3a154` | 2026-08-05  |
| `agentic-rtb-framework`  | Prose specification plus protobuf | `v1.0`   | `7f48161` | 2026-07-21  |
| `agentic-audiences`      | Draft specification               | untagged | `106ebd6` | 2026-07-27  |
| `agentic-direct`         | Mock-backed demo                  | untagged | `915bda9` | 2026-01-27  |
| `registry-agent-example` | Sample registry agent             | untagged | `1ff8dda` | 2026-02-24  |

Four of the eight carry no tag. `buyer-agent` declares `version = "0.1.0"` in its `pyproject.toml` against a `v2.3.0` git tag; this glossary cites the tag.

`registry-agent-example` and `agentic-direct` have not been touched since February and January 2026 respectively. They stay because definitions here cite them for what they do not contain: an `agent.ts` with no registry contract in it, and MCP tool handlers that return `generateMockResponse`.

## AdCP version numbers by surface

Five first-party files at the pinned commit carry five different numbers.

| Surface at `a0fd0b5`                                                  | Number it carries |
| --------------------------------------------------------------------- | ----------------- |
| `dist/schemas/latest.json`                                            | 3.1.13            |
| `docs/reference/versions.mdx`, the version-status table               | 3.1.12            |
| `dist/docs/3.1.13/reference/versions.mdx`, the newest built docs tree | 3.1.0             |
| `static/schemas/source/index.json`                                    | 1.0.0             |
| `package.json`                                                        | 3.1.1             |

A number quoted from a documentation page is out of date on arrival, which is how third-party comparisons end up citing 3.1 or 3.1.2 while the schema registry has moved on.

The source tree registers a 65th operation the release does not, `sync_agent_notification_configs`: present under `static/`, documented in its own doc page, absent from `dist/`, and outside the totals used here.

## AAMP has no version number to pin

The hub README explains why: "Each repository uses independent semantic versioning." It also claims "The AAMP Hub references stable releases for ecosystem clarity", then references no release and no tag anywhere in the file, only six repository URLs.

IAB Tech Lab's standards page uses the link text "AAMP 2.3". The pattern `AAMP <number>` appears in none of [the eight repositories](https://aampexplorer.com/versions/) that same body publishes.

## AAMP's wire contract is a pre-release library that neither IAB index lists

Quote, Deal, Negotiation Round, Access Tier, Trust Status, Avails and Media Kit all come out of one repository, `iab-agentic-primitives`: 48 JSON Schemas and an OpenAPI 3.1.0 document with 13 paths, against a hub repository that holds a README and a licence file. The library's README opens:

> ⚠️ **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice. It is **not yet an official IAB Tech Lab release** and should not be depended on for production use until this notice is removed.

Both shipping agents depend on it by git URL at runtime, pinned to `v0.5.0` in `seller-agent/pyproject.toml` and `buyer-agent/pyproject.toml`.

It appears in neither of IAB's own indexes: not in the hub README's six repositories, not in the four listed on iabtechlab.com. The size of an AAMP integration is set by this library, not by the hub. Every AAMP term page here repeats the pre-release caveat inline.

## What this glossary leaves out

A claim that spans both corpora is a reading of both rather than a statement either party makes: no file in the eight AAMP repositories mentions AdCP under any spelling, so the term-by-term correspondences are [mapped separately](/concepts/adcp-vs-aamp-terminology/) and the [architectural argument](https://agenticadlab.com/protocols/adcp-vs-aamp/) is on Agentic Ad Lab.

Four files in the `agentic-audiences` specification tree are zero bytes, including `specs/v1.0/schema/agent_interface.schema.json`. Three operations in the AAMP wire contract define one side of the exchange only: `AgentDiscovery` has a request schema and no response, `ChangeRequest` and `NegotiationRound` a response and no request. Where a term would depend on an empty file, the entry states that the specification does not define it.

CPM, CPC and the rest of the commodity vocabulary get no entry. A commodity term appears only inside the entry that owns its non-obvious encoding: money on the AAMP wire is an integer count of micros with float explicitly banned, so that sits on [Quote](/negotiation/quote/), and the `PG` / `PD` / `PA` deal-type enum sits on [Deal](/negotiation/deal/).

## Corrections and version drift

Where a page here disagrees with the file it cites, the file is correct. A correction needs a file path and a commit to be actionable, and where the defect is upstream an issue on the specification repository is the better fix.

Pinning a commit does not mean the pinned release is current. AdCP cuts patch releases every few weeks, and what matters is whether a patch moved anything defined here. Between 3.1.10 and 3.1.13 nothing moved: the registry is unchanged across the two releases, 64 operations across ten areas in both, and `get-products-request.json`, `product-filters.json` and `create-media-buy-request.json` are identical apart from the version string in `$id` and `$ref`.

## Non-affiliation

Ad Tech Glossary is part of the Agentic Ad Lab portfolio and independent of everyone it writes about. No affiliation with, sponsorship from or endorsement by AgenticAdvertising.org, IAB Technology Laboratory, or any company contributing to their repositories. AdCP, AAMP, OpenRTB, OpenDirect, AdCOM and the IAB name belong to their owners.
