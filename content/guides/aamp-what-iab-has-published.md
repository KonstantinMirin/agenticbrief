---
title: 'AAMP: What IAB Tech Lab Has Actually Published'
description: 'Is AAMP a specification? Partly. One of its eight repositories is a released spec, one is a self-labelled draft, and the rest are reference implementations.'
answer: 'AAMP: partly a specification. It is an umbrella over eight repositories. One, ARTF v1.0, is published; Agentic Audiences is a self-labelled draft; the rest are reference implementations, a demo wrapper and a 22-line sample.'
pubDate: 2026-08-09
cluster: 'hub-aamp-status'
keywords:
  - 'is aamp a specification'
  - 'aamp maturity'
  - 'aamp protocol status'
  - 'aamp repository assessment'
  - 'iab tech lab agentic'
citations:
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://iabtechlab.com/standards/artf/'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
related:
  - '/protocols/'
  - '/protocols/adcp-vs-aamp/'
  - '/guides/agent-discovery-files/'
  - 'https://aampexplorer.noetis.dev/'
  - 'https://aampexplorer.noetis.dev/what-does-aamp-stand-for/'
  - 'https://aampexplorer.noetis.dev/versions/'
  - 'https://aampexplorer.noetis.dev/repos/iab-agentic-primitives/'
  - 'https://adtechglossary.noetis.dev/concepts/aamp/'
reviewState: cto-reviewed
---

## Is AAMP a specification?

Partly, and the honest answer needs a repository-by-repository breakdown rather than a yes or no.

AAMP is an umbrella, not a document. Its hub repository is a README of roughly 270 words that links out to six child repositories and states the release model: "Each repository uses independent semantic versioning. Releases are published via GitHub tags and release notes. Cross-repository alignment occurs via governance coordination."

Of the eight repositories I have on disk (six listed by the hub, plus `agentic-audiences` and one the hub does not list), exactly one contains a document that presents itself as a finished specification. One more contains a draft. The rest are reference implementations, a demo, and a sample.

## What is in each AAMP repository, as of 2026-08-09?

Every row below is from a local clone, with the version taken from `git describe` rather than from a press release.

| Repository                     | Version at HEAD          | What it actually is                                                        | Normative artifact                                                                             |
| ------------------------------ | ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `agentic-rtb-framework` (ARTF) | `v1.0`                   | **Specification** plus Go and Rust reference implementations               | `Agentic_Real_Time_Framework_Version_1_0_FINAL.md`, 534 lines, plus protobuf                   |
| `agentic-audiences`            | no tags                  | **Draft specification** plus a Prebid module example and a scoring service | `specs/v1.0/embedding-exchange.md`, headed "Draft v0.1"                                        |
| `seller-agent`                 | `v2.4.1`                 | Reference implementation                                                   | OpenAPI 3.1.0, 74 paths, 91 component schemas                                                  |
| `buyer-agent`                  | `v2.3.0` plus 24 commits | Reference implementation                                                   | OpenAPI 3.1.0, 13 paths, 8 component schemas                                                   |
| `iab-agentic-primitives`       | `v0.5.0`                 | Shared contract library, **not listed by the hub**                         | `spec/openapi/iab-agentic-api.yaml` plus 48 JSON Schema files, 22 of them top-level primitives |
| `agentic-direct`               | no tags                  | Demo-grade A2A and MCP wrapper over OpenDirect 2.1                         | `opendirect.json`, 40 schemas, 33 tools, 13 resources                                          |
| `AAMP` (hub)                   | no tags                  | Link page                                                                  | README only                                                                                    |
| `registry-agent-example`       | no tags                  | Sample                                                                     | none; `agent.ts` is 22 lines, one commit                                                       |

## Which AAMP repository is a real specification?

ARTF. `Agentic_Real_Time_Framework_Version_1_0_FINAL.md` opens with "A specification for using agent-driven containers in OpenRTB and Digital Advertising", "Version 1.0", "Released November 12, 2025", and "© 2025 IAB Technology Laboratory". It has a glossary, a table of contents, an agent manifest section and an API design section. It is tagged `v1.0` in git and published at [iabtechlab.com/standards/artf](https://iabtechlab.com/standards/artf/).

It is also backed by machine-readable artifacts rather than prose alone: a protobuf package `com.iabtechlab.bidstream.mutation.v1` defining `RTBRequest`, `RTBResponse` and `Mutation`, an `Intent` enum with eight named mutations plus an unspecified zero value, and five worked `RTBRequest` sample payloads. If someone tells you AAMP has published nothing normative, ARTF is the counterexample. Field-level detail is on [AAMP Explorer](https://aampexplorer.noetis.dev/repos/agentic-rtb-framework/), including the two competing "intent" vocabularies inside that one specification.

## Which parts are not specifications?

`agentic-audiences` is a draft that has not resolved its own status. The file at `specs/v1.0/embedding-exchange.md` is titled "Agentic Audiences Contextual Embedding Exchange Specification (Draft v0.1)" and its second line reads "Status: Draft", while sitting in a directory named `v1.0`. Its README describes the work as "LiveRamp's initial proposal". The repository has no git tags.

It also has holes you can measure. Four files in `agentic-audiences/specs/` are zero bytes:

- `specs/roadmap.md`
- `specs/v1.0/schema/agent_interface.schema.json`
- `specs/v1.0/examples/buyer_agent_request.json`
- `specs/v1.0/examples/seller_agent_response.json`

The second one matters more than the other three. `agent_interface.schema.json` is the file that would define how a buyer or seller agent exchanges these embeddings, which is the thing that would connect this repository to the rest of AAMP. It is empty.

`buyer-agent` and `seller-agent` are reference implementations, and they say so. The seller repository carries a "V2 — Feature Complete" banner, the buyer repository "V2 — Active Development". They are substantial: 74 OpenAPI paths and 53,000 words of documentation on the seller side. But an implementation with generated API docs is not a ratified specification, and every AAMP term people quote (access tier, trust status, negotiation round, media kit, quote, avails) comes from these two repositories rather than from a standards document.

`agentic-direct` is demo-grade. Its tool handlers return mock data from a `generateMockResponse` function, and its README describes `opendirect.json` as an "OpenAPI 3.0 Schema" when the file has no `paths` key and is an MCP server manifest. `registry-agent-example` is 22 lines.

## Where does AAMP's shared wire contract live?

In a repository the hub README does not list. Both `buyer-agent/pyproject.toml` and `seller-agent/pyproject.toml` pin `iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0`. That library holds the cross-agent primitives: `Product`, `Money`, `Deal`, `Quote`, `Negotiation`, `Avails`, `Order`, `ErrorCode`, plus state machines and event types.

Its own README says, at the top:

> **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice. It is **not yet an official IAB Tech Lab release** and should not be depended on for production use until this notice is removed.

So the canonical object model shared by both AAMP reference agents is a `0.5.0` pre-release that describes itself as unreleased, is hard-pinned by both agents, and is absent from the hub's own repository list. That is not a criticism of the engineering; the library exists precisely because the alternative was per-repo drift. It is a statement about what "AAMP" currently guarantees to an outside implementer.

## What version is AAMP?

There is no AAMP version. The hub README says each repository versions independently, and the tags bear that out: `seller-agent` at `v2.4.1`, `buyer-agent` past `v2.3.0`, `agentic-rtb-framework` at `v1.0`, `iab-agentic-primitives` at `v0.5.0`, and four repositories with no tags at all.

If you see "AAMP 2.3" quoted as a version of the whole umbrella, it does not correspond to any single artifact you can check out. Per-repository detail is on [AAMP Explorer's version matrix](https://aampexplorer.noetis.dev/versions/).

## What does AAMP stand for?

The corpus answers four different ways:

- "Agentic Advertising Management Protocols" (hub `README.md`, line 1)
- "IAB Agent & API Management Protocol" (`seller-agent/docs/architecture/overview.md:143`)
- "Agent-to-Agent Marketplace Protocol" (`seller-agent/docs/guides/agent-management.md:401` and `buyer-agent/docs/ai-assistant/slash-commands.md:79`)
- "Agentic Advertising Marketplace Protocol" (`iab-agentic-primitives/SANDBOX_REGISTRY.md:9`, `src/iab_agentic_primitives/registry_client.py:3` and `harness/roles.py:6`)

The full account, with file and line for each, is on [AAMP Explorer](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/). I'm not resolving it here, because the source hasn't resolved it either.

## How should an implementer read an AAMP term?

As implementation-derived until proven otherwise. When a glossary, this site included, defines "access tier" or "trust status", the definition traces to Python and generated OpenAPI in `seller-agent`, not to a document IAB Tech Lab has ratified. That has two consequences worth stating plainly.

It can change on a minor release without a deprecation cycle, because reference implementations version on their own schedule. And a second implementer reading the same repository may reach a different conclusion, because there is no conformance document to arbitrate. `seller-agent/docs/guides/agent-management.md:399-404` makes this concrete for one subsystem: the registry integration is "stubbed pending the public API specification", and the client "will be updated once the AAMP spec is finalized."

## What would change this assessment

Four things, each checkable:

1. `agentic-audiences` fills its four zero-byte files and tags a release.
2. `iab-agentic-primitives` drops its "NOT YET RELEASED" banner, or the hub README lists it.
3. IAB Tech Lab publishes a normative document for the buyer/seller control plane, the way it did for ARTF.
4. The agent registry contract gets a published API specification.

Until one of those happens, the accurate sentence is the one at the top of this page. AAMP has published a specification. It has not published a specification for most of what people mean when they say AAMP.
