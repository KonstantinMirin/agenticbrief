---
title: 'Mutation (ARTF) — the Bidstream Patch Object, Field by Field'
description: "A mutation is ARTF's unit of change: an intent, an operation, a path and one typed payload, proposed to an orchestrator that may reject it. From the v1.0 protobuf."
answer: "A mutation is ARTF's proposed change to an OpenRTB bid request or bid response. It carries an intent, an operation, a path and one of five typed payloads. The orchestrator may accept or reject it."
pubDate: 2026-08-09
term: 'Mutation (ARTF)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames: ['ARTF mutation', 'OpenRTB patch', 'bidstream mutation']
keywords:
  - 'artf mutation'
  - 'openrtb patch protocol'
  - 'bidstream mutation protobuf'
  - 'agentic rtb framework mutation'
citations:
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/docs/00-EXAMPLE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/bid-shading.json'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframeworkservices.proto'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
related:
  - '/realtime/artf-intent/'
  - '/realtime/trusted-match-protocol/'
  - 'https://aampexplorer.noetis.dev/repos/agentic-rtb-framework/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['artf-intent', 'trusted-match-protocol']
reviewState: cto-reviewed
---

## What is a mutation in ARTF?

A mutation is a proposed change to an OpenRTB bid request or bid response, sent by an in-path agent back to the orchestrator that called it.

The framework document calls the mechanism the OpenRTB Patch Protocol and is explicit that a mutation is a request, not an instruction: "Participant responses may request in-flight modifications via patch objects that include desired mutations which the orchestrator may accept or reject at their discretion."

That sentence carries the whole design. An ARTF agent never mutates anything. It asks. The orchestrator decides. Everything else in the message is a way of making the ask machine-readable enough that the orchestrator can decide quickly.

The message is defined in `rust/proto/agenticrtbframework.proto`, package `com.iabtechlab.bidstream.mutation.v1`, in `agentic-rtb-framework` at tag `v1.0`.

## What fields does a Mutation carry?

Four, and the fourth is a `oneof`.

| Field    | Number  | Type        | Comment in the proto                                                                                |
| -------- | ------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `intent` | 1       | `Intent`    | "The purpose of the mutation"                                                                       |
| `op`     | 2       | `Operation` | "Defines the operation to perform (e.g. add, remove, replace) on the target data at the given path" |
| `path`   | 3       | string      | "The semantic business domain of where the operation will be applied"                               |
| `value`  | 100-104 | `oneof`     | "The structure of value depends on the specified intent"                                            |

The `oneof value` block has five branches, and field numbers 100 and up are reserved for them by convention stated in the proto itself:

| Branch         | Field number | Type                |
| -------------- | ------------ | ------------------- |
| `ids`          | 100          | `IDsPayload`        |
| `adjust_deal`  | 101          | `AdjustDealPayload` |
| `adjust_bid`   | 102          | `AdjustBidPayload`  |
| `metrics`      | 103          | `MetricsPayload`    |
| `content_data` | 104          | `DataPayload`       |

Field numbers 1000 to 1999 are reserved for experimental payloads, matching the same reservation on the `Intent` enum.

Because `value` is a `oneof`, a mutation carries exactly zero or one payload. Every field on `Mutation` is a proto3 singular field with no `required` semantics, so a syntactically valid mutation can arrive with an unspecified intent, no operation and no payload. Validation is the receiver's problem.

## What operations can a mutation perform?

Three, plus the zero placeholder that proto3 requires:

| Value | Name                    |
| ----- | ----------------------- |
| 0     | `OPERATION_UNSPECIFIED` |
| 1     | `OPERATION_ADD`         |
| 2     | `OPERATION_REMOVE`      |
| 3     | `OPERATION_REPLACE`     |

Add, remove, replace. The same three verbs as JSON Patch, minus copy, move and test. The proto notes that "more operations can be added in the future".

## What does the path field actually address?

The proto describes `path` as "the semantic business domain of where the operation will be applied", which is vaguer than a JSON Pointer and deliberately so. The repository's example documentation pairs each intent with the path shape it expects:

| Intent               | Expected payload    | Path example                   |
| -------------------- | ------------------- | ------------------------------ |
| `ACTIVATE_SEGMENTS`  | `IDsPayload`        | `/user/data/segment`           |
| `ACTIVATE_DEALS`     | `IDsPayload`        | `/imp/{id}`                    |
| `SUPPRESS_DEALS`     | `IDsPayload`        | `/imp/{id}`                    |
| `ADJUST_DEAL_FLOOR`  | `AdjustDealPayload` | `/imp/{id}/pmp/deals/{dealId}` |
| `ADJUST_DEAL_MARGIN` | `AdjustDealPayload` | `/imp/{id}/pmp/deals/{dealId}` |
| `BID_SHADE`          | `AdjustBidPayload`  | `/seatbid/{seat}/bid/{bidId}`  |
| `ADD_METRICS`        | `MetricsPayload`    | `/imp/{id}/metric`             |

The paths are OpenRTB object paths with template segments. There is no formal grammar for them in the specification, and no schema constrains the string. Two implementations can disagree about whether `{id}` is an impression index or an impression ID and both will compile.

## What are the payload types?

Small and specific. That is the point.

| Payload             | Fields                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `IDsPayload`        | `id` — a repeated string, "list of IDs"                          |
| `AdjustDealPayload` | `bidfloor` (double), `margin` (`Margin`)                         |
| `Margin`            | `value` (double), plus a `CalculationType` of `CPM` or `PERCENT` |
| `AdjustBidPayload`  | `price` (double), "the adjusted bid price"                       |
| `MetricsPayload`    | repeated OpenRTB metric objects                                  |
| `DataPayload`       | repeated OpenRTB data objects                                    |

`Margin.CalculationType` is the one to notice: `CPM` means an absolute margin adjustment, `PERCENT` means a relative one. A receiver that ignores the discriminator will apply a 5 as five cents or five percent with equal confidence.

## How does a mutation get back to the orchestrator?

Inside an `RTBResponse`, which has three fields: `id` echoing the request, `mutations[]`, and a `Metadata` object carrying `api_version` and `model_version`.

The request side is `RTBRequest`, carrying `lifecycle`, `id`, `tmax`, the OpenRTB `bid_request` or `bid_response`, an `originator`, `applicable_intents[]` and `ext`. `tmax` is described as the "maximum time in milliseconds the exchange allows for mutations to be received including latency to avoid timeout" — the agent's entire budget, latency included.

`lifecycle` has two real values, `LIFECYCLE_PUBLISHER_BID_REQUEST` and `LIFECYCLE_DSP_BID_RESPONSE`, so an agent knows which side of the auction it is sitting on. `Originator.Type` has four: `PUBLISHER`, `SSP`, `EXCHANGE`, `DSP`.

The transport is a single gRPC method, declared in `agenticrtbframeworkservices.proto`: `service RTBExtensionPoint { rpc GetMutations (RTBRequest) returns (RTBResponse); }`. One call, one response, one deadline.

## What should implementers know before parsing the proto?

Three things, all verified at commit `7f48161`.

**There are two copies of the proto and they are not identical.** `proto/agenticrtbframework.proto` opens with `edition = "2023";`. `rust/proto/agenticrtbframework.proto` opens with `syntax = "proto3";`. Most Node and JavaScript protobuf parsers reject the edition form, so the Rust copy is the one that parses with ordinary tooling.

**The two copies disagree about one field type.** `MetricsPayload.metric` is `com.iabtechlab.openrtb.v2.BidRequest.Metric` in the root copy and `com.iabtechlab.openrtb.v2.BidRequest.Imp.Metric` in the Rust copy. OpenRTB 2.6 nests `Metric` under `Imp`, so the Rust copy is the correct one and the root copy will not resolve.

**The root copy's OpenRTB import path does not exist in its own tree.** It imports `com/iabtechlab/openrtb/v2.6/openrtb.proto`, while the file under `proto/` sits at `com/iabtechlab/openrtb/v2/openrtb.proto`. Only the Rust tree has a file at the imported path. The README also states that the OpenRTB 2.6 proto must be downloaded manually from IAB's OpenRTB repository.

There is also a documentation drift worth naming. The intent-to-payload table in `docs/00-EXAMPLE.md` names the metrics payload `AddMetricsPayload`. No such message exists. Both proto copies call it `MetricsPayload`. The same table stops at intent value 7 and omits `ADD_CIDS`, which is value 8 in both protos.

None of these is fatal. All of them cost an implementer an afternoon if nobody wrote them down.

## Is there an AdCP counterpart to a mutation?

No. AdCP has no bidstream mutation surface at all.

The nearest AdCP construct by position is the Trusted Match Protocol, and it is a different kind of object. TMP's `context_match` returns offers and `identity_match` returns eligible package IDs. Neither returns a patch, neither addresses a path inside another party's payload, and neither is expressed as a proposed change an orchestrator may reject. TMP asks a question and gets an answer. ARTF proposes an edit and gets a verdict.

That is the cleanest single illustration of how differently the two stacks understand serve time.

## How is this term sourced?

ARTF: `rust/proto/agenticrtbframework.proto`, `proto/agenticrtbframework.proto`, `agenticrtbframeworkservices.proto`, `Agentic_Real_Time_Framework_Version_1_0_FINAL.md`, `docs/00-EXAMPLE.md` and `samples/` in `IABTechLab/agentic-rtb-framework` at commit `7f48161`, tag `v1.0-1-g7f48161`. ARTF is an IAB Tech Lab framework document with two reference implementations, not a ratified interoperability standard, and AAMP has no single version number covering it.

AdCP: absence verified against the operation registry at `dist/schemas/3.1.10/index.json` in `adcontextprotocol/adcp` at commit `f1a35ab`. None of the 64 published operations mutates a bid request or bid response.
