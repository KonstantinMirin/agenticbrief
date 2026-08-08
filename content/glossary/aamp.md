---
title: 'AAMP (Agentic Advertising Management Protocols)'
description: "AAMP is IAB Tech Lab's umbrella for eight independently versioned agentic advertising repositories. What it contains, why it has no version, and what is implementation not specification."
answer: "AAMP is IAB Tech Lab's umbrella for its agentic advertising work: eight independently versioned GitHub repositories spanning a control plane, a bidstream mutation framework and an embedding exchange. AAMP has no single version number."
pubDate: 2026-08-09
term: 'AAMP'
alternateNames:
  - 'Agentic Advertising Management Protocols'
  - 'IAB Agent & API Management Protocol'
  - 'Agent-to-Agent Marketplace Protocol'
category: protocol
cluster: gl-aamp
keywords:
  - 'aamp protocol'
  - 'aamp definition'
  - 'aamp umbrella'
  - 'aamp components'
  - 'iab tech lab aamp'
citations:
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/registry-agent-example'
related:
  - '/concepts/adcp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/opendirect/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.noetis.dev/what-does-aamp-stand-for/'
  - 'https://aampexplorer.noetis.dev/versions/'
  - 'https://agenticadlab.noetis.dev/protocols/aamp/'
seeAlso: ['Ad Context Protocol', 'OpenDirect 2.1', 'Seller Agent', 'Buyer Agent']
reviewState: cto-reviewed
---

## Who publishes AAMP, and where is it defined?

AAMP is published by IAB Tech Lab. Its definition lives in a single README at [`github.com/IABTechLab/AAMP`](https://github.com/IABTechLab/AAMP), which is the entire repository apart from a licence file. The README opens:

> AAMP is the umbrella initiative under which all of Tech Lab's Agentic work is being developed in partnership with the advertising ecosystem. AAMP (Agentic Advertising Management Protocols) is an open-sourceframework [sic] developed under IAB Tech Lab to support the evolution of agentic transactions within digital advertising ecosystems.

That README also sets the release model, and it is the sentence that matters most for anyone citing AAMP: "Each repository uses independent semantic versioning." AAMP is a governance label over a set of repositories, not a document you can read end to end.

The corpus does not agree with itself on what the acronym expands to. The hub README says Agentic Advertising Management Protocols; other files in the same corpus say something else. AAMP Explorer publishes [the enumeration with file and line numbers](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/). This page uses the hub expansion because the hub is the naming authority, not because the contradiction is settled.

## What version is AAMP?

There is no AAMP version. Asking for one produces a wrong answer in every direction.

Each repository tags on its own schedule. The three repositories that carry normative artifacts rather than demo code sit at very different maturity points:

| Repository                     | Version at the parsed commit | What it publishes                                             |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------- |
| `agentic-rtb-framework` (ARTF) | `v1.0-1-g7f48161`            | A 534-line prose specification plus a protobuf contract       |
| `iab-agentic-primitives`       | `v0.5.0-1-g2fc7029`          | JSON Schema and OpenAPI for the buyer-to-seller wire contract |
| `agentic-audiences`            | untagged, `106ebd6`          | An embedding exchange spec self-labelled "Draft v0.1"         |

The reference implementations version separately again: `seller-agent` at `v2.4.1`, `buyer-agent` at `v2.3.0-24-g0c3a154`. The full eight-repository matrix is on [AAMP Explorer](https://aampexplorer.noetis.dev/versions/).

Never write "AAMP 2.3". No artifact carries that number. It is a reading of the buyer or seller agent tag applied to the whole umbrella, and it implies a coordinated release that the hub README explicitly says does not exist.

## Is AAMP a ratified specification?

Mostly no, and this matters for every AAMP term defined on this site.

Of the eight repositories, one is a 270-word README, one is a 22-line sample agent, one is a demo-grade MCP and A2A wrapper, two are reference implementations in Python, and three carry specification-shaped artifacts. Two of those three are unfinished: `agentic-audiences` ships four zero-byte files in its specification tree, including `specs/v1.0/schema/agent_interface.schema.json`, the schema that would connect it to the rest of AAMP; `iab-agentic-primitives` opens its README with a banner.

> **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice. It is **not yet an official IAB Tech Lab release** and should not be depended on for production use until this notice is removed.

Both reference agents pin that library as their canonical wire contract. The AAMP hub README does not list it among the AAMP repositories.

**So: every AAMP term on this glossary is sourced from a reference implementation or a work-in-progress library, not from a ratified specification.** Words like access tier, trust status, quote and negotiation round describe how IAB Tech Lab's own agents behave today. They are documented, they are consistent across the two agent repositories, and they can change on the next minor tag without a deprecation process.

## What does the AAMP corpus actually contain?

Parsing all eight repositories yields 143 operations and 82 distinct objects, spread across three planes that share no type with one another:

- **Control plane.** Planning and transaction time. Discovery, avails, quotes, multi-round negotiation, deal booking and change requests, built on IAB OpenDirect 2.1 and carried over MCP, A2A and REST. Lives in `agentic-direct`, `buyer-agent`, `seller-agent` and `iab-agentic-primitives`.
- **Real-time plane.** Serve time. ARTF lets a host platform call in-path agents that return mutations to an OpenRTB bid request or response.
- **Data plane.** Signal exchange. `agentic-audiences` defines an embedding envelope carrying consent, TTL and attestation metadata.

No file in the corpus maps an ARTF deal identifier to a seller-agent `Deal`, or an `agentic-audiences` embedding to a buyer-agent audience segment. The planes are assembled only inside the two reference agents, and they are assembled as an application.

## What is AAMP's counterpart in AdCP?

None at the umbrella level. AdCP is one specification with one registry and one version oracle; AAMP is a portfolio. The comparison only becomes tractable one object at a time, which is what the [AdCP and AAMP terminology lookup](/concepts/adcp-vs-aamp-terminology/) does.

## What is AAMP most often confused with?

**AAMP is not AAO.** AgenticAdvertising.org stewards AdCP. IAB Tech Lab stewards AAMP. The initialisms are close and the two bodies are unrelated.

**The AAMP registry is not finalised.** Both agent repositories document a registry API and point at `AAMPRegistryClient`, and the seller agent's own guide says that client "will be updated once the AAMP spec is finalized". The one repository named for the registry, `registry-agent-example`, is a 22-line sample that consumes an external MCP server and defines nothing.

**AAMP does not reference AdCP anywhere.** Grepping all eight repositories for AdCP naming returns no substantive hits. Any comparison between the two stacks, including the ones on this site, is made from outside both of them.
