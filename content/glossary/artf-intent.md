---
title: 'Intent (ARTF)'
description: 'ARTF v1.0 gives intent a protobuf enum on the wire, camelCase strings in the spec document, capability objects in the manifest, and enum names in the Dockerfiles.'
answer: 'Intent in ARTF is the reason an agent gives for an edit to a live bid request, carried on the wire as an 8-value protobuf enum that the framework document and the Agent Manifest both contradict.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Intent (ARTF)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames: ['ARTF intent', 'ARTF intent enum', 'agent manifest intents', 'applicable_intents']
keywords:
  - 'artf intent enum'
  - 'agentic rtb framework intent'
  - 'artf agent manifest'
  - 'applicable_intents artf'
citations:
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/pkg/pb/artf/agenticrtbframework.pb.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/src/com.iabtechlab.bidstream.mutation.v1.rs'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/agent/agent.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/handlers/handlers.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/federation/config.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/federation/manager.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/mcp/mcp.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Dockerfile'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/Dockerfile'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/docs/00-EXAMPLE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/CLAUDE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/multi-impression.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/session.py'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-get-offering-request.json'
  - 'https://github.com/IABTechLab/agentic-real-time-framework/issues/10'
related:
  - '/realtime/rtb-mutation/'
  - '/realtime/trusted-match-protocol/'
  - '/signals/activation/'
  - '/concepts/sponsored-intelligence/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/agentic-rtb-framework/'
  - 'https://agenticadlab.com/'
seeAlso: ['rtb-mutation', 'trusted-match-protocol', 'activation', 'sponsored-intelligence']
reviewState: cto-reviewed
---

Intent in ARTF is the reason an agent gives for an edit it wants to make to a bid request in flight. ARTF is the Agentic Real-Time Framework, one of the repositories in IAB Tech Lab's AAMP programme and the only one released as a Tech Lab standard, at v1.0 in November 2025. It is published as `agentic-rtb-framework`, since renamed `agentic-real-time-framework`, and the old URL redirects.

Agents ship as container images, and an orchestrator runs them against live traffic and accepts or rejects each mutation they propose. That orchestrator is the party running the auction: `RTBRequest` carries a `tmax` described as the time "the exchange allows for mutations to be received", and the originating party is typed `TYPE_PUBLISHER`, `TYPE_SSP`, `TYPE_EXCHANGE` or `TYPE_DSP`. The wire field is a protobuf enum, the framework document and the Agent Manifest each name intents their own way, and only the enum is compiled.

## The Intent enum

Nine members are defined. `INTENT_UNSPECIFIED` is the proto3 zero value, leaving eight usable.

| Value | Name                 | Comment in the proto                                 |
| ----- | -------------------- | ---------------------------------------------------- |
| 0     | `INTENT_UNSPECIFIED` | proto3 placeholder, no comment                       |
| 1     | `ACTIVATE_SEGMENTS`  | Activate user segments by their external segment IDs |
| 2     | `ACTIVATE_DEALS`     | Activate deals by their external deal IDs            |
| 3     | `SUPPRESS_DEALS`     | Suppress deals by their external deal IDs            |
| 4     | `ADJUST_DEAL_FLOOR`  | Adjust the bid floor of a specific deal              |
| 5     | `ADJUST_DEAL_MARGIN` | Adjust the deal margin of a specific deal            |
| 6     | `BID_SHADE`          | Adjust the bid price of a specific bid               |
| 7     | `ADD_METRICS`        | Add metrics to an impression                         |
| 8     | `ADD_CIDS`           | Add extended content IDs                             |

The enum lives in `rust/proto/agenticrtbframework.proto`, package `com.iabtechlab.bidstream.mutation.v1`, which reserves 1000 to 1999 "for experimental/test intents". It reaches the wire twice. `Mutation.intent` says what one proposed edit is for, one intent per edit, on the [bidstream mutation object](/realtime/rtb-mutation/) (field 1). `RTBRequest.applicable_intents` is the list the orchestrator will accept, sent before the agent replies (repeated field 7).

## The framework document declares a different type

`Agentic_Real_Time_Framework_Version_1_0_FINAL.md` declares `string intent = 1;` where the shipped proto declares `Intent intent = 1;`. The Go and Rust bindings are generated from the proto; nothing is generated from the framework document.

None of the five names the document uses in its examples and glossary exists in the enum:

| Name in the framework document | Nearest enum value                        | Exact match |
| ------------------------------ | ----------------------------------------- | ----------- |
| `activateSegments`             | `ACTIVATE_SEGMENTS`                       | no          |
| `activateDeals`                | `ACTIVATE_DEALS`                          | no          |
| `expireDeals`                  | `SUPPRESS_DEALS`                          | no          |
| `adjustDeals`                  | `ADJUST_DEAL_FLOOR`, `ADJUST_DEAL_MARGIN` | no          |
| `adjustBid`                    | `BID_SHADE`                               | no          |

`pb.Intent_activateSegments` does not exist, so Go source carrying a document name will not compile, and the Go agent's federation config rejects the same string in a config file. [Issue #10](https://github.com/IABTechLab/agentic-real-time-framework/issues/10), opened in March 2026 and unanswered, asks how to prevent a container mutating deals it does not own, phrasing the question around "expireDeals or adjustDeals". Both names come out of the normative document.

## The Agent Manifest, a third vocabulary

A separate vocabulary rides on the container image: JSON in an image label keyed `agent-manifest`, where a container declares "the intents they will invoke". The spec adds: "If the orchestrating entity cannot support the requirements and intents of a container, it should not be started."

| Name                     | Description in the specification                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `bidResponseGeneration`  | Generate bid responses in real time based on request data                                |
| `bidValuation`           | Evaluate incoming bid requests and determine bid amount                                  |
| `bidRequestModification` | Propose mutations to a bid request prior to auction execution                            |
| `auctionOrchestration`   | Route or prioritize bid requests across multiple buyers                                  |
| `metadataEnhancement`    | Insert or modify auction metadata such as fraud or viewability signals                   |
| `dynamicDealCuration`    | Curate deals in real time, optimize margins or enforce dynamic inclusion/exclusion lists |
| `audienceSegmentation`   | Activate or enrich user cohorts and audience segments                                    |

These are capability categories: what kind of agent this is, not what edit it wants. `bidResponseGeneration` and `auctionOrchestration` have no enum counterpart, and no enum value maps onto exactly one manifest intent, so an orchestrator matching a manifest against `applicable_intents` has no published mapping to follow.

The specification gives the manifest two label names. The key is `agent-manifest`, and a later section says "the manifest may be stored as a string with the container label `com.iabtechlab.artf.descriptor` with a Base64 value", alongside `com.iabtechlab.artf.container-version`.

The manifest's own `intents` list — a different field from `Mutation.intent` — differs in every file that declares one. The framework specification lists seven `{name, description}` capability objects, `docs/00-EXAMPLE.md` lists five enum names, the Go `Dockerfile` lists seven and omits `ADD_CIDS`, and `rust/Dockerfile` lists three in a label that is not valid JSON. No schema and no code validate the manifest, so the malformed label is never caught.

## Which values each reference agent implements

The Rust bindings carry every value in the enum. The Go const block and both name maps stop at `ADD_METRICS = 7`, and the Go handler for the missing value says why: "ADD_CIDS intent requires protobuf regeneration to be fully supported." That handler returns `nil, nil`.

`applicable_intents` matters more, because pre-flight negotiation is where ARTF's governance story lives. The field is present in the Rust bindings at tag 7 and absent from the Go ones: the Go reference agent hardcodes an empty slice under the comment "For now, pass nil which means all intents are applicable", and all five samples set a field it cannot read. A `ValidIntents` list in its federation config carries all eight names and matches with `strings.EqualFold`, so the binary accepts `add_cids` as configuration for a value its own bindings cannot express.

The JSON path drops the field instead. The MCP tool pulls `applicable_intents` out of a request as raw strings, validates none of them, and never puts them on the `pb.RTBRequest` it builds. Under federation those strings reach `filterMutationsByIntent`, which matches case-sensitively against enum names, so a request asking for `activateSegments` gets back zero mutations and no error.

## Intent in AdCP and in AAMP's seller agent

Four schema properties in AdCP 3.1.13 have names containing "intent", all four inside [Sponsored Intelligence](/concepts/sponsored-intelligence/), and all four free text describing a human's request rather than an agent's capability. `si-get-offering-request.json` calls its `intent` an "Optional natural language description of user intent for personalized results". AdCP has no mutation vocabulary because it has no mutation object; its serve-time layer is the [Trusted Match Protocol](/realtime/trusted-match-protocol/), and capability is declared at runtime through `get_adcp_capabilities` rather than stamped into image metadata at build time. The verbs collide too: `ACTIVATE_SEGMENTS` edits one auction in flight, while [`activate_signal`](/signals/activation/) provisions a durable `activation_key`.

Within AAMP the term is not shared either. `seller-agent` v2.4.1 carries `NegotiationState.last_intent`, an untyped `Optional[str]` that a chat classifier sets to `pricing_inquiry`, `availability_inquiry`, `deal_request` or `counter_offer`. It shares no type with ARTF in either direction.

Related terms: [bidstream mutation](/realtime/rtb-mutation/), [Trusted Match Protocol](/realtime/trusted-match-protocol/), [activation](/signals/activation/), [Sponsored Intelligence](/concepts/sponsored-intelligence/). The repository is covered file by file in [AAMP Explorer](https://aampexplorer.com/repos/agentic-rtb-framework/).
