---
title: 'AAMP Status: What IAB Tech Lab Has Actually Published'
description: 'One of the eight IAB Tech Lab repositories under the AAMP label holds a published specification. AAMP 2.3 appears in none of them, and Agentic Audiences is headed Draft v0.1.'
answer: 'AAMP is an umbrella over eight independently versioned IAB Tech Lab repositories: ARTF v1.0 is a published specification, the rest are drafts, reference implementations or demos, and no repository contains the string AAMP 2.3.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-aamp-status'
keywords:
  - 'is aamp a specification'
  - 'aamp maturity'
  - 'aamp protocol status'
  - 'aamp repository assessment'
citations:
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67/README.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f48161/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd6/README.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd6/specs/v1.0/embedding-exchange.md'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebc/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029/README.md'
  - 'https://iabtechlab.com/standards/artf/'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://iabtechlab.com/press-releases/iab-tech-lab-releases-aamp-2-3-bringing-enterprise-grade-infrastructure-and-privacy-diligence-to-agentic-advertising/'
related:
  - '/protocols/'
  - '/protocols/adcp-vs-aamp/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/guides/agent-discovery-files/'
  - 'https://aampexplorer.com/'
  - 'https://aampexplorer.com/versions/'
  - 'https://aampexplorer.com/what-does-aamp-stand-for/'
  - 'https://aampexplorer.com/repos/agentic-rtb-framework/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://adtechglossary.com/concepts/aamp/'
faq:
  - question: 'Is AAMP a specification?'
    answer: 'Partly. One of the eight AAMP repositories, the Agentic Real Time Framework, contains a published Version 1.0 specification. One more contains a self-labelled draft. The remaining six are reference implementations, a demo wrapper, a 22-line sample and a link page.'
  - question: 'What version is AAMP?'
    answer: 'There is no AAMP version. Each repository versions independently, four of the eight carry no git tags at all, and the string AAMP 2.3 that appears in the July 2026 press coverage appears in no AAMP repository.'
reviewState: cto-reviewed
---

AAMP is a label over eight IAB Tech Lab repositories. One of them, `agentic-rtb-framework`, carries a
numbered, dated, released specification, and it governs bid mutation rather than buying. The other
seven are reference implementations, drafts, a wrapper, a sample and a link page.

Outside ARTF there is no published document to conform to and no conformance suite anywhere in the
eight repositories, so "conforms to AAMP" is not an enforceable contract term. A repository and a git
tag named in the agreement make a minor release a change event under that agreement rather than a
field that moved without notice.

Two of the eight repositories carry the working surface: `iab-agentic-primitives`, the wire contract
both reference agents import, and then `seller-agent` or `buyer-agent` depending on which side of the
transaction an implementer sits. ARTF applies to exchange operators, and carries a licence
obligation. The hub, the 22-line sample, the OpenDirect wrapper and the draft embedding specification
hold no implementable contract.

## What the AAMP label covers

AAMP covers agent-to-agent media buying: a buyer's agent and a seller's agent discovering inventory,
agreeing a price, placing the order and reporting the delivery, over a shared vocabulary of objects
called `Product`, `Deal`, `Quote`, `Negotiation` and `Order`. The transaction has two parties and no
human intermediary.

The `AAMP` repository itself is an umbrella. Its README names six children. Counting the hub itself
and `iab-agentic-primitives`, which the README does not list and which both reference agents hard-pin
as a dependency, the set is eight. The README states a release model in four bullets:

> - Each repository uses independent semantic versioning.
> - Releases are published via GitHub tags and release notes.
> - Cross-repository alignment occurs via governance coordination.
> - The AAMP Hub references stable releases for ecosystem clarity.

## The eight repositories and what each one contains

| Repository                     | Version at HEAD                 | What it is                                                      | Primary artifact                                                                   |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `agentic-rtb-framework` (ARTF) | `v1.0`                          | Specification with Go and Rust reference implementations        | `Agentic_Real_Time_Framework_Version_1_0_FINAL.md`, plus protobuf                  |
| `agentic-audiences`            | no tags                         | Draft specification, a Prebid module example, a scoring service | `specs/v1.0/embedding-exchange.md`, headed "Draft v0.1"                            |
| `seller-agent`                 | `v2.4.1`                        | Reference implementation                                        | OpenAPI 3.1.0, 74 paths, 91 component schemas                                      |
| `buyer-agent`                  | `v2.3.0`                        | Reference implementation                                        | OpenAPI 3.1.0, 13 paths, 8 component schemas                                       |
| `iab-agentic-primitives`       | `v0.5.0`                        | Shared contract library; not listed in the hub README           | `spec/openapi/iab-agentic-api.yaml`, 48 JSON Schema files, 22 top-level primitives |
| `agentic-direct`               | no tags                         | A2A and MCP wrapper over OpenDirect 2.1                         | `opendirect.json`: 40 schemas, 33 tools, 13 resources                              |
| `AAMP` (hub)                   | no tags, last commit 2026-04-16 | Link page                                                       | README only                                                                        |
| `registry-agent-example`       | no tags                         | Sample                                                          | a single 22-line `agent.ts`                                                        |

Four of the eight have never carried a git tag. Field-level inventories for each repository are on
[AAMP Explorer](https://aampexplorer.com/).

## AAMP has no version number, and AAMP 2.3 appears in no repository

On 30 July 2026 IAB Tech Lab
[announced AAMP 2.3](https://iabtechlab.com/press-releases/iab-tech-lab-releases-aamp-2-3-bringing-enterprise-grade-infrastructure-and-privacy-diligence-to-agentic-advertising/),
promising enterprise-ready deployment, integrated privacy diligence, stronger pricing integrity and
broader platform support. The release was picked up by MediaPost, ExchangeWire, TV Tech and
thedesk.net, the last describing these as "finalized standards designed for production use".
Adgentek, a founding member of AdCP, calls 2.3 "a hardening release".

The number is absent from all eight repositories: from the git tags, the changelog lines, the READMEs
and the schema `$id` values alike. No IAB Tech Lab document defines what 2.3 denotes, and the
announced version does not resolve to a commit.

Tags were cut in the same fortnight. `seller-agent` was tagged `v2.3.1` on 22 July and `v2.3.3` on 29
July, the day before the announcement, and reached `v2.4.1` by 5 August. `buyer-agent` tagged `v2.3.0`
on 22 July. `iab-agentic-primitives` cut five tags between 14 and 22 July. The hub README, whose
stated job is to reference stable releases for ecosystem clarity, was last committed on 2026-04-16,
before the release cycle it describes.

AAMP Explorer keeps a [version matrix](https://aampexplorer.com/versions/) with a row per
repository, and the [AdCP versus AAMP](/protocols/adcp-vs-aamp/) comparison sets the two release
models side by side.

## ARTF is the one released specification in the set

`Agentic_Real_Time_Framework_Version_1_0_FINAL.md` opens with four lines: "A specification for using
agent-driven containers in OpenRTB and Digital Advertising", then "Version 1.0", then "Released
November 12, 2025", then "© 2025 IAB Technology Laboratory". Glossary, table of contents, agent
manifest section, API design section. It is tagged `v1.0` in git and published at
[iabtechlab.com/standards/artf](https://iabtechlab.com/standards/artf/).

"Agent-driven containers in OpenRTB" means an agent changes a bid request or a bid response while it
is in flight, and the change rides inside the bid object stamped with the intent behind it, so the
system on the other end reads what was done instead of inferring it from the numbers. Both sides may
do it, and the enum carries sell-side and buy-side entries in one list.

Machine-readable work sits under the prose. The protobuf package
`com.iabtechlab.bidstream.mutation.v1` defines `RTBRequest`, `RTBResponse` and `Mutation`. The
`Intent` enum names eight mutations plus an unspecified zero value: activate segments, activate
deals, suppress deals, adjust deal floor, adjust deal margin, bid shade, add metrics, add CIDs. Five
worked `RTBRequest` payloads sit in `samples/`, covering banner, bid shading, multi-impression,
native and video deals.

The repository's `LICENSE` is the GNU AGPL v3 text, and its README states that the Go reference
implementation "is Copyright (c) 2025 Index Exchange Inc. and is licensed under the GNU Affero
General Public License v3.0 (AGPL-3.0)". Section 13 of that licence, "Remote Network Interaction",
extends the source-offer obligation to users who interact with a modified version over a network, so
an exchange that vendors the Go implementation into a hosted service brings its own users into scope.
A proprietary exchange has two routes to ARTF: reimplement from the CC BY 3.0 specification text, or
open the service.

The document is dated "Released November 12, 2025". The `v1.0` git tag was cut on 14 July 2026.
Neither the document nor the tag states which date governs. Two competing "intent" vocabularies
coexist inside the one specification: the protobuf enum says what a single edit is for, the
container's Agent Manifest declares broad capability categories, and no published mapping joins the
two, so an orchestrator matching one against the other is guessing. AAMP Explorer pulls them apart
[field by field](https://aampexplorer.com/repos/agentic-rtb-framework/).

## Agentic Audiences was declared v1.0 while calling itself Draft v0.1

The 30 July release says "Agentic Audiences v1.0 ready for transactions".
`specs/v1.0/embedding-exchange.md` line 1 reads "Agentic Audiences Contextual Embedding Exchange
Specification (Draft v0.1)" and line 3 reads "Status: Draft". `specs/v1.0/` is a directory name; the
repository carries no git tags. Its README describes the work as "LiveRamp's initial proposal".

Four files under `agentic-audiences/specs/` are zero bytes:

- `specs/roadmap.md`
- `specs/v1.0/schema/agent_interface.schema.json`
- `specs/v1.0/examples/buyer_agent_request.json`
- `specs/v1.0/examples/seller_agent_response.json`

`agent_interface.schema.json` would define how a buyer or seller agent exchanges these embeddings,
which is what connects this repository to the rest of AAMP. The embedding format and its taxonomy are
written out in `specs/v1.0/embedding-exchange.md`. The agent interface for audience activation over
AAMP has no published definition.

## The shared wire contract sits in a repository the hub does not list

Both `buyer-agent/pyproject.toml` and `seller-agent/pyproject.toml` carry the same dependency string,
character for character:
`iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0`.
That library holds the primitives the two agents share — `Product`, `Deal`, `Quote`, `Negotiation`,
`Order`, `Proposal`, `RateCard`, `MediaKit`, `Creative`, `DecisionRecord` and the rest. It contains 48
JSON Schema files, of which 22 are top-level primitives; the others are event, protocol and state
types, held in subdirectories of those names. Those objects are what
[a machine buy](/guides/how-a-machine-buys-media/) moves back and forth.

Its README opens with a release-status banner:

> **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the
> buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change
> without notice. It is **not yet an official IAB Tech Lab release** and should not be depended on
> for production use until this notice is removed.

The same README states: "The spec is the normative artifact; this package is its reference
implementation."

`v0.1.0` through `v0.5.0` were cut between 14 and 22 July 2026.
`spec/openapi/iab-agentic-api.yaml` still stamps `info.version: 0.1.0` while the package tag says
0.5.0, with 13 operations and zero `components.schemas`, because the schemas live as separate files.

Both reference agents therefore depend on a 0.5.0 pre-release whose README states it is not an
official IAB Tech Lab release. Schema-by-schema detail is on
[AAMP Explorer](https://aampexplorer.com/repos/iab-agentic-primitives/).

## Every AAMP term outside ARTF is implementation-derived

A term written into an agreement can move on a minor release with no deprecation cycle and no
obligation to announce it, because the definition lives in a reference implementation rather than in
a ratified document. [Access tier](https://adtechglossary.com/negotiation/access-tier/),
[trust status](https://adtechglossary.com/negotiation/trust-status/), negotiation round, media
kit, quote and avails all trace to Python and generated OpenAPI in `seller-agent`. `seller-agent`
itself moved from `v2.3.1` to `v2.4.1` inside a fortnight.

Two implementers can also read the same repository and reach different conclusions, with nothing to
arbitrate between them: no conformance document exists in the eight repositories.
[Negotiation](https://aampexplorer.com/negotiation/) is the widest case, 74 OpenAPI paths and
the Python behind them, with no prose definition anywhere.

`seller-agent/docs/guides/agent-management.md` states the registry position, under an H2 titled
"Current Limitations":

> The IAB Tech Lab AAMP (Agent-to-Agent Marketplace Protocol) registry integration is stubbed pending
> the public API specification. Currently, agent trust is managed locally by the operator. The
> `AAMPRegistryClient` will be updated once the AAMP spec is finalized.

Trust is managed by the operator locally until the registry API is published.
[Agent discovery files](/guides/agent-discovery-files/) cover the alternative: the same claims,
published on the publisher's own domain.

The AAMP acronym is expanded four different ways across the hub, both reference agents and the
primitives library, and no document in the eight repositories picks between them. AAMP Explorer keeps
the [file-and-line account](https://aampexplorer.com/what-does-aamp-stand-for/).

## What can be implemented from a published document today

ARTF is the only repository in the set with a published document to implement from. It is a numbered
document with a protobuf schema and five worked payloads behind it, implementable from the published
text without reading anyone's Python. The specification text is CC BY 3.0; the Go reference
implementation is AGPL-3.0, so code that starts from it inherits the Section 13 network clause.

The buyer/seller control plane has no document to implement, only running code. Nothing in the eight
repositories promises that a minor release will leave a field in place, so an integration tracks an
exact tag rather than a branch. Trust has to be carried locally, because `AAMPRegistryClient` is a
stub until the registry API is published.
[What neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/) covers the
rest of the ground both leave to the implementer.

## The artifacts that carry this status

Four artifacts hold the current status, and each moves independently of any announcement:

- the hub README, which currently names no version
- the "NOT YET RELEASED" banner in the `iab-agentic-primitives` README, and that repository's absence
  from the hub index
- the four zero-byte files under `agentic-audiences/specs/`, in a repository with no tags
- the unpublished registry API specification that `AAMPRegistryClient` is stubbed against

A normative IAB Tech Lab document for the buyer/seller control plane, of the kind published for ARTF,
is what would make "supports AAMP" a claim a counterparty can test.

One standards venue is named in the eight repositories, in ARTF: "This document is developed by the
IAB Tech Lab Container Project Task Force which is a subgroup of the Programmatic Supply Chain Working
Group." The other seven name none, and a version number for them would surface first in a git tag, in
the hub README or on the
[AAMP standards page](https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/),
last updated 23 April 2026. No repository in the set publishes a roadmap or a meeting calendar:
`agentic-audiences/specs/roadmap.md` is zero bytes, and that repository's README says to "Join or
start a working group under `/community`", a directory whose only file is also zero bytes.
