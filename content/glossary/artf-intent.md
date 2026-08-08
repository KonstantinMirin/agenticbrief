---
title: 'Intent (ARTF) — One Spec, One Word, Two Incompatible Vocabularies'
description: 'ARTF defines intent twice: an 8-value protobuf enum for mutations, and a separate 7-entry manifest vocabulary. They share no values. Both are documented here.'
answer: 'Intent in ARTF means two different things. The protobuf Intent enum has 8 usable values from ACTIVATE_SEGMENTS to ADD_CIDS. The Agent Manifest declares a separate intents list of 7 named capabilities. The two share no values.'
pubDate: 2026-08-09
term: 'Intent (ARTF)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames: ['ARTF intent', 'intent enum', 'agent manifest intents']
keywords:
  - 'artf intent enum'
  - 'agentic rtb framework intent'
  - 'artf agent manifest'
  - 'mutation intent advertising'
citations:
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/docs/00-EXAMPLE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/banner-basic.json'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/CLAUDE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/bid-shading.json'
related:
  - '/realtime/rtb-mutation/'
  - '/realtime/trusted-match-protocol/'
  - '/signals/activation/'
  - 'https://aampexplorer.noetis.dev/repos/agentic-rtb-framework/'
seeAlso: ['rtb-mutation', 'trusted-match-protocol', 'activation']
reviewState: cto-reviewed
---

## What does intent mean in ARTF?

That depends which file in the repository you opened, and the two answers do not reconcile.

The Agentic Real-Time Framework uses the word "intent" for two distinct things:

1. A **protobuf enum** called `Intent`, carried on every mutation and negotiated on every request. Eight usable values, all screaming snake case, all describing a specific edit to an OpenRTB payload.
2. A list called **`intents[]` in the Agent Manifest**, the JSON blob a container declares itself with. Seven entries, camel case, each describing a broad capability.

They share no values. Not one. The framework document, the protobuf and the example documentation all use the word without qualifying which one they mean.

Both vocabularies are documented below. The fuller treatment of ARTF as a whole lives on [AAMP Explorer](https://aampexplorer.noetis.dev/repos/agentic-rtb-framework/); this page is about the collision.

## What is the ARTF Intent enum?

The protobuf enum, defined in `rust/proto/agenticrtbframework.proto` at package `com.iabtechlab.bidstream.mutation.v1`. Nine declared values, of which the zero value is the proto3 placeholder:

| Value | Name                 | Comment in the proto                                 |
| ----- | -------------------- | ---------------------------------------------------- |
| 0     | `INTENT_UNSPECIFIED` | placeholder                                          |
| 1     | `ACTIVATE_SEGMENTS`  | Activate user segments by their external segment IDs |
| 2     | `ACTIVATE_DEALS`     | Activate deals by their external deal IDs            |
| 3     | `SUPPRESS_DEALS`     | Suppress deals by their external deal IDs            |
| 4     | `ADJUST_DEAL_FLOOR`  | Adjust the bid floor of a specific deal              |
| 5     | `ADJUST_DEAL_MARGIN` | Adjust the deal margin of a specific deal            |
| 6     | `BID_SHADE`          | Adjust the bid price of a specific bid               |
| 7     | `ADD_METRICS`        | Add metrics to an impression                         |
| 8     | `ADD_CIDS`           | Add extended content IDs                             |

The proto adds "more intents can be added in the future" and reserves numbers 1000 to 1999 "for experimental/test intents".

This enum appears in two places on the wire. `Mutation.intent` states the purpose of one proposed change. `RTBRequest.applicable_intents` is a repeated field the orchestrator sends ahead of time, which the proto comment describes as the list of intents the server is eligible to send back. So the enum is both the vocabulary of a mutation and the vocabulary of the pre-flight negotiation.

The sample payloads use it that way. `samples/banner-basic.json` sets `"applicable_intents": ["ACTIVATE_SEGMENTS", "ACTIVATE_DEALS"]`, and `samples/bid-shading.json` sets `"applicable_intents": ["BID_SHADE"]`.

## What is the Agent Manifest intents list?

A completely separate vocabulary, defined only by example in the framework document.

The Agent Manifest is JSON attached to a container image as a label. The specification describes its purpose directly: agents must declare "the intents they will invoke", and "if the orchestrating entity cannot support the requirements and intents of a container, it should not be started."

The manifest example in the specification lists seven intents, each an object with a `name` and a `description`:

| Name                     | Description in the specification                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `bidResponseGeneration`  | Generate bid responses in real time based on request data                                |
| `bidValuation`           | Evaluate incoming bid requests and determine bid amount                                  |
| `bidRequestModification` | Propose mutations to a bid request prior to auction execution                            |
| `auctionOrchestration`   | Route or prioritize bid requests across multiple buyers                                  |
| `metadataEnhancement`    | Insert or modify auction metadata such as fraud or viewability signals                   |
| `dynamicDealCuration`    | Curate deals in real time, optimize margins or enforce dynamic inclusion/exclusion lists |
| `audienceSegmentation`   | Activate or enrich user cohorts and audience segments                                    |

These are capability categories. They describe what kind of agent this is, not what edit it wants to make.

## Do the two vocabularies overlap at all?

Not as identifiers. Functionally they are adjacent, which is exactly what makes the collision expensive rather than merely untidy.

| Manifest intent          | Nearest enum values                                                           | Exact match |
| ------------------------ | ----------------------------------------------------------------------------- | ----------- |
| `audienceSegmentation`   | `ACTIVATE_SEGMENTS`                                                           | no          |
| `dynamicDealCuration`    | `ACTIVATE_DEALS`, `SUPPRESS_DEALS`, `ADJUST_DEAL_FLOOR`, `ADJUST_DEAL_MARGIN` | no          |
| `bidValuation`           | `BID_SHADE`                                                                   | no          |
| `metadataEnhancement`    | `ADD_METRICS`, `ADD_CIDS`                                                     | no          |
| `bidRequestModification` | all of them, arguably                                                         | no          |
| `bidResponseGeneration`  | none                                                                          | no          |
| `auctionOrchestration`   | none                                                                          | no          |

Two manifest intents have no enum counterpart at all, and no enum value maps cleanly onto a single manifest intent. An orchestrator that reads a manifest and then filters runtime requests by `applicable_intents` is translating between two vocabularies with no published mapping.

## Which shape does the manifest intents field actually take?

Here the repository contradicts itself, and this is the part that will break an implementation.

In the framework document's container manifest example, `intents` is an **array of objects**, each with `name` and `description`.

In `docs/00-EXAMPLE.md`, the same field in the same manifest is an **array of strings**, and the strings are protobuf enum values:

```json
"intents": [
  "ACTIVATE_SEGMENTS",
  "ACTIVATE_DEALS",
  "SUPPRESS_DEALS",
  "ADJUST_DEAL_FLOOR",
  "BID_SHADE"
]
```

The repository's `CLAUDE.md` does the same, with `"intents": ["ACTIVATE_SEGMENTS", "ACTIVATE_DEALS"]`.

So one field name, in one repository, at one commit, has two incompatible JSON types and two incompatible value vocabularies. A parser written against the specification will fail on the documentation's manifests, and vice versa.

There is nothing to arbitrate the disagreement. I searched the repository for a JSON Schema describing the Agent Manifest and there is none — no `*.schema.json` file exists anywhere in the tree. The protobuf constrains the wire messages; the manifest is constrained by nothing but two examples that disagree.

The label naming has the same texture. The specification says the manifest key is `agent-manifest`, then adds later that "the manifest may be stored as a string with the container label `com.iabtechlab.artf.descriptor` with a Base64 value", alongside `com.iabtechlab.artf.container-version`. Two label names, one optional, described in two sections.

## Why does this collision matter in practice?

Because the manifest vocabulary and the runtime vocabulary are supposed to be the same negotiation, seen at two moments.

At deploy time, the orchestrator reads the manifest and decides whether it can host the container. The specification is unambiguous that failing this check should stop the container from starting.

At request time, the orchestrator sends `applicable_intents` and the agent replies with mutations whose `intent` must be in that set.

If the vocabularies differ, the deploy-time check cannot be expressed in the terms the runtime check uses. An orchestrator either implements a private mapping table, or it accepts protobuf enum names in the manifest and quietly ignores the specification's own example. Both choices are undocumented behaviour that will differ between implementations, which is the outcome a framework document exists to prevent.

Renaming one of the two would cost the specification nothing and would remove the ambiguity entirely.

## Is there an AdCP counterpart to ARTF intents?

No, in both senses.

AdCP has no serve-time mutation vocabulary, because it has no mutation object. Its serve-time layer is the Trusted Match Protocol, which returns offers and eligible package IDs rather than proposed edits.

AdCP also has no container manifest. Capability declaration happens through the `get_adcp_capabilities` operation, which an agent answers over the wire at runtime, rather than through metadata attached to an image at build time. The two stacks disagree about where an agent's self-description lives, not just about what it says.

Note also that the word "activate" crosses the two stacks with different meanings. `ACTIVATE_SEGMENTS` in ARTF is a request to modify one auction in flight. `activate_signal` in AdCP is a planning-time provisioning call that returns a durable activation key. Same verb, different time horizon, no relationship.

## How is this term sourced?

`rust/proto/agenticrtbframework.proto`, `Agentic_Real_Time_Framework_Version_1_0_FINAL.md`, `docs/00-EXAMPLE.md`, `CLAUDE.md` and `samples/*.json`, all in `IABTechLab/agentic-rtb-framework` at commit `7f48161`, tag `v1.0-1-g7f48161`. The absence of a manifest schema was verified by searching the repository tree for `*.schema.json` at that commit.

ARTF is an IAB Tech Lab framework document with Go and Rust reference implementations. It is not a ratified interoperability standard, and AAMP has no single version number that covers it — each AAMP repository versions independently. Nothing in the AAMP corpus references AdCP.
