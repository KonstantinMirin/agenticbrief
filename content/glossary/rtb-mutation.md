---
title: 'Mutation (ARTF): the OpenRTB bidstream patch object'
description: "ARTF's Mutation carries an intent, an operation, a path and one of five typed payloads. The v1.0 repository ships six definitions of it, and the copies disagree."
answer: "A mutation is ARTF's proposed change to an OpenRTB bid request or response, carrying an intent, an operation, a path and at most one of five typed payloads, which the orchestrator may accept or reject."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Mutation (ARTF)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames: ['ARTF mutation', 'OpenRTB patch', 'bidstream mutation', 'OpenRTB Patch Protocol']
keywords:
  - 'artf mutation'
  - 'openrtb patch protocol'
  - 'bidstream mutation protobuf'
  - 'agentic rtb framework mutation'
citations:
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/pkg/pb/artf/agenticrtbframework.pb.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/src/com.iabtechlab.bidstream.mutation.v1.rs'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/docs/00-EXAMPLE.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/internal/handlers/handlers.go'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframeworkservices.proto'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Makefile'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://iabtechlab.com/standards/artf/'
related:
  - '/realtime/artf-intent/'
  - '/realtime/trusted-match-protocol/'
  - '/realtime/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/agentic-rtb-framework/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['artf-intent', 'trusted-match-protocol']
reviewState: cto-reviewed
---

A mutation is a proposed change to an OpenRTB bid request or bid response, sent by an in-path agent back to the orchestrator that called it. ARTF's name for the mechanism is the OpenRTB Patch Protocol, and the framework document treats a mutation as a request throughout: "Participant responses may request in-flight modifications via patch objects that include desired mutations which the orchestrator may accept or reject at their discretion."

No `Patch` message exists in the `.proto` files; the patch object of that sentence is prose, and what travels on the wire is `RTBResponse.mutations[]`, a flat repeated field.

ARTF v1.0 is a published IAB Tech Lab framework document, past a public comment period that closed 15 January 2026. It is not a ratified interoperability standard, and `v1.0` is a git tag on the ARTF repository.

## The Mutation message

The canonical message lives in `rust/proto/agenticrtbframework.proto`, package `com.iabtechlab.bidstream.mutation.v1`.

| Field    | Number  | Type        | Comment in the proto                                                                                |
| -------- | ------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `intent` | 1       | `Intent`    | "The purpose of the mutation"                                                                       |
| `op`     | 2       | `Operation` | "Defines the operation to perform (e.g. add, remove, replace) on the target data at the given path" |
| `path`   | 3       | string      | "The semantic business domain of where the operation will be applied"                               |
| `value`  | 100-104 | `oneof`     | "The structure of value depends on the specified intent"                                            |

The `oneof value` block has five branches — `ids` at 100, `adjust_deal` at 101, `adjust_bid` at 102, `metrics` at 103 and `content_data` at 104 — so a mutation carries one payload at most. Numbers 1000 to 1999 are reserved for experimental and test payloads, matching the [Intent enum](/realtime/artf-intent/).

`op` takes `OPERATION_ADD`, `OPERATION_REMOVE` or `OPERATION_REPLACE`, plus the `OPERATION_UNSPECIFIED` zero value proto3 requires. Those are JSON Patch's verbs without copy, move and test. Neither reference agent uses all three: `internal/handlers/handlers.go` emits `ADD` and `REPLACE` only.

## The five payloads

`IDsPayload` is a repeated string, `AdjustBidPayload` a `price` double, and `MetricsPayload` and `DataPayload` repeated OpenRTB objects. `AdjustDealPayload` carries a `bidfloor` double and a `Margin`, which holds a `value` double and a `calculation_type` of `CPM` or `PERCENT`.

`DataPayload` diverges across the repository. Both protos and the Rust bindings have it; the Go bindings and `docs/00-EXAMPLE.md` do not, and the Go handler is a stub returning nil with a comment pointing at `make bindings`, a target that runs `protoc` over two files not in the repository root.

## The margin discriminator

`Margin.CalculationType` has no `UNSPECIFIED` member and `CPM` is the zero value. An omitted discriminator decodes as an absolute adjustment, and a margin of 5 decodes as five CPM whether or not the sender set the field. A deliberate CPM cannot be distinguished from an unset field on the wire.

## Atomicity and ordering

The specification is explicit: "Each patch is atomic. A mutation must be accepted in whole or rejected in whole. Multiple patches may be independently accepted or rejected - there are no transactions or any ordering guarantees across mutations."

Activating a deal and changing its floor are two mutations — `ACTIVATE_DEALS` carrying an `IDsPayload`, `ADJUST_DEAL_FLOOR` carrying an `AdjustDealPayload` — and the `oneof` allows one payload per mutation, so an orchestrator can take one and drop the other.

No accept, reject or acknowledgement message exists in any of the three protos, and the transport is one unary method, `rpc GetMutations (RTBRequest) returns (RTBResponse)`. The specification leaves the return path open: "Whether and how orchestrators will communicate choices to accept or reject patches to agent providers is left to the parties."

## The path field

A path is a string such as `/imp/{id}/pmp/deals/{dealId}`. In the specification's own words, paths "identify business level entities rather than specific JSON locations". `docs/00-EXAMPLE.md` pairs each intent with a shape:

| Intent                                    | Expected payload    | Path example                   |
| ----------------------------------------- | ------------------- | ------------------------------ |
| `ACTIVATE_SEGMENTS`                       | `IDsPayload`        | `/user/data/segment`           |
| `ACTIVATE_DEALS`, `SUPPRESS_DEALS`        | `IDsPayload`        | `/imp/{id}`                    |
| `ADJUST_DEAL_FLOOR`, `ADJUST_DEAL_MARGIN` | `AdjustDealPayload` | `/imp/{id}/pmp/deals/{dealId}` |
| `BID_SHADE`                               | `AdjustBidPayload`  | `/seatbid/{seat}/bid/{bidId}`  |
| `ADD_METRICS`                             | `AddMetricsPayload` | `/imp/{id}/metric`             |

Seven intents are documented; the enum carries eight plus the zero placeholder, and the undocumented one is `ADD_CIDS`. The [intent vocabulary](/realtime/artf-intent/) is its own entry.

No grammar constrains that string and no schema validates it, so two implementations can disagree about whether `{id}` is an impression index or an impression ID and both will compile. A mutation can land on the wrong impression, and no message in the protos reports back what the orchestrator did with it. The repository's own Go agent already diverges: for `ADJUST_DEAL_FLOOR` it emits `/imp/{impID}/pmp/deals`, dropping the `{dealId}` segment.

## Which definition of Mutation to build against

`rust/proto/agenticrtbframework.proto` is the only self-consistent copy in the repository. The root proto matches it column for column except on the import: it asks for `com/iabtechlab/openrtb/v2.6/openrtb.proto`, no file sits at that path under `proto/`, so it cannot resolve its own import.

| Definition                         | `intent` / `op` type            | Payload branches | Intents            |
| ---------------------------------- | ------------------------------- | ---------------- | ------------------ |
| Tagged v1.0 specification document | `string`                        | 4                | prose strings only |
| Root `proto/` (edition 2023)       | enum                            | 5                | 9                  |
| `rust/proto/` (proto3)             | enum                            | 5                | 9                  |
| Checked-in Go bindings             | `*Intent` / `*Operation`, `req` | 4                | 8                  |
| Checked-in Rust bindings           | `i32`, no presence              | 5                | 9                  |
| `docs/00-EXAMPLE.md`               | enum                            | 4                | 8                  |

`AddMetricsPayload`, the metrics branch in the specification document and in `docs/00-EXAMPLE.md`, is not a message any proto defines; the message is `MetricsPayload`, and the Go bindings generate the branch as `Mutation_AddMetrics`. The bindings disagree on `intent`, `op` and `path` as well: the Rust bindings type them `i32`, `i32` and `String` with no presence, so a mutation carrying no intent decodes cleanly as `INTENT_UNSPECIFIED`, while the Go bindings mark the same three fields required in the proto2 style and make them pointers, so the same bytes come back as a decode error.

The tagged specification document assigns `ext = 3` and `tmax = 6` where the proto assigns `tmax = 3` and `originator = 6`, so a doc-conformant encoder and a proto-conformant decoder mis-parse each other. It declares `repeated mutation mutations = 2;` with a type name that resolves to nothing, and gives worked JSON with intent strings like `expireDeals` that are not enum members under any spelling. The `v1.0` tag points at this document.

## AdCP has no counterpart

AdCP's FAQ answers "Does AdCP replace OpenRTB?" with "No. AdCP and OpenRTB operate at different layers and are complementary." No AdCP operation touches the bidstream: none of the 64 published tasks is auction-shaped, and the release defines no bid request, bid response or bid floor. AdCP's nearest real-time surface is the [Trusted Match Protocol](/realtime/trusted-match-protocol/), a request-and-response identity check with no patch mechanism in it.
