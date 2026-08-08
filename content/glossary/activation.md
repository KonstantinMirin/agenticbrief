---
title: 'Signal Activation, Deployment and Seat — What activate_signal Actually Does'
description: 'Signal activation makes a discovered signal usable on a named destination. Definition of activate_signal, deployment, activation key and seat from AdCP 3.1.10.'
answer: 'Signal activation is the AdCP step that makes a discovered signal usable on a named destination platform or agent. activate_signal takes a segment handle and destinations, and returns an activation key once the deployment is live.'
pubDate: 2026-08-09
term: 'Signal Activation'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['activation', 'signal deployment', 'seat']
keywords:
  - 'signal activation advertising'
  - 'activate_signal adcp'
  - 'signal deployment'
  - 'activation key advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/signals/activate-signal-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/destination.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/deployment.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/activation-key.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
related:
  - '/signals/signal-definition/'
  - '/signals/audience-vs-signal/'
  - '/realtime/artf-intent/'
  - 'https://adcpexplorer.noetis.dev/areas/signals/'
seeAlso: ['signal-definition', 'audience-vs-signal', 'artf-intent']
reviewState: cto-reviewed
---

## What is signal activation in AdCP?

Signal activation is the step between finding a signal and being able to target with it. AdCP's glossary defines it as "the process of making a signal available for targeting on a specific platform and seat".

Discovery and activation are separate operations for a good reason: a signal can exist, be described, be priced, and still not be usable in your DSP seat. `get_signals` tells you it exists. `activate_signal` makes it usable somewhere specific.

These two are the entire AdCP Signals area — 2 of the 64 operations in release 3.1.10.

## What does an activate_signal request require?

Three fields, per `activate-signal-request.json`:

| Field                     | Type          | Purpose                                                                                                         |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `idempotency_key`         | string        | Client-generated unique key for this request                                                                    |
| `signal_agent_segment_id` | string        | "Opaque activation handle returned in the `signal_agent_segment_id` field of each `get_signals` response entry" |
| `destinations`            | destination[] | Where to activate, at least one                                                                                 |

Optional fields are `action`, `pricing_option_id`, `governance_context`, `account`, `context` and `ext`.

`action` takes `activate` or `deactivate` and defaults to `activate`. The deactivate branch is not an afterthought — the schema explains it as "required when campaigns end to comply with data governance policies (GDPR, CCPA)". Turning a segment off is a compliance obligation, and AdCP gives it a first-class verb rather than leaving it to a support ticket.

`signal_agent_segment_id` is the handle, not the signal. You cannot construct it. It comes back from `get_signals`, is passed verbatim into `activate_signal`, and is echoed in package targeting. It is the one string that ties discovery, activation and delivery together.

## What is a destination, and how does it differ from a deployment?

A destination is where you are asking to activate. A deployment is the state of an activation that already happened. Both are discriminated unions on `type`, with the same two branches.

|                  | Destination                                                                   | Deployment                                                                           |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Schema           | `core/destination.json`                                                       | `core/deployment.json`                                                               |
| Summary          | "A deployment target where signals can be activated (DSP, sales agent, etc.)" | "A signal deployment to a specific deployment target with activation status and key" |
| `type: platform` | requires `platform`                                                           | requires `platform`, `is_live`                                                       |
| `type: agent`    | requires `agent_url`                                                          | requires `agent_url`, `is_live`                                                      |
| Optional         | `account`                                                                     | `account`, `activation_key`, `estimated_activation_duration_minutes`, `deployed_at`  |

The `platform` branch names a DSP with a string identifier, using `the-trade-desk` and `amazon-dsp` as its examples. The `agent` branch names an agent by URL. Both carry an optional `account`, which is where the seat concept lands in practice.

## What is an activation key, and why might it be missing?

The activation key is what you actually put into a campaign. `activation-key.json` calls it a "universal identifier for using a signal on a destination platform" and gives it two shapes:

- `type: segment_id` — a platform-specific segment identifier.
- `type: key_value` — a targeting key and value pair.

Two shapes, because platforms differ in how targeting is expressed. AdCP declines to normalise that and instead makes the discriminator explicit.

The visibility rule on the deployment object is the part worth remembering: `activation_key` is "only present if `is_live=true` AND requester has access to this deployment". A missing key is therefore ambiguous by design. It can mean not yet live, or live but not yours. The request schema completes the picture from the other side: "If the authenticated caller matches one of these destinations, activation keys will be included in the response."

So authorization is enforced by omission. There is no denial message, just an absent field. A buyer agent has to treat "no key" as a branch, not as an error.

## What is a seat?

AdCP's glossary defines a seat as "a specific advertising account within a decisioning platform, typically representing a brand or campaign".

There is no `seat` field in the released schemas. The concept is carried by the optional `account` string on both destination branches. Seat is vocabulary in the documentation and a generic account identifier on the wire.

The related glossary entry, Segment ID, is defined as "the specific identifier used for signal activation", which is the activation key's `segment_id` branch rather than the `signal_agent_segment_id` handle. Two similarly named strings, two different jobs. The handle addresses the signal at the signal agent; the segment ID addresses it at the destination platform.

## How long does an activation take, and does the protocol say?

The protocol carries an estimate, not a guarantee, and the naming is inconsistent between the two places it appears.

The deployment object has `estimated_activation_duration_minutes`, described as "estimated time to activate if not live, or to complete activation if in progress". The glossary entry is called "Estimated Activation Time" and describes a "predicted timeframe for signal deployment, typically 24-48 hours for new activations".

Different name, different unit, different order of magnitude in the example. If you are implementing, follow the schema field and its unit. If you are planning, note that the documented expectation is measured in days while the field is measured in minutes.

`activate_signal` is asynchronous in either case. Its response carries the standard task envelope, whose `status` enum includes `submitted`, `working`, `input-required`, `completed`, `canceled`, `failed`, `rejected`, `auth-required` and `unknown`.

## Where does governance fit into activation?

Through one optional field: `governance_context`, "opaque governance context returned by `check_governance` for this signal activation".

The pattern is a token handoff. A governance agent evaluates the activation against plan-level policy, issues a context token, and the buyer presents it to the signal agent. The protocol does not require it. Whether a signal agent refuses activation without one is a deployment decision, not a schema rule.

## Does AAMP have signal activation?

Not as an operation, but it has the word — used for something else entirely.

ARTF's protobuf `Intent` enum contains `ACTIVATE_SEGMENTS`, defined in the proto as "activate user segments by their external segment IDs". That is not a provisioning step. It is a serve-time mutation: an in-path agent proposing that segment IDs be added to a bid request already in flight, at `/user/data/segment`, with the orchestrator free to reject it.

The distinction matters because the two words describe opposite time horizons. AdCP activation is a planning-time provisioning call whose result is a durable key you target with later. ARTF `ACTIVATE_SEGMENTS` is a request to modify one auction, and it expires with that auction.

AAMP has no counterpart to AdCP's activation model. There is no destination object, no activation key, no deployment status, and no deactivation verb.

## How is this term sourced?

AdCP side, at commit `f1a35ab`, release 3.1.10 per `dist/schemas/latest.json`: `dist/schemas/3.1.10/signals/activate-signal-request.json`, `core/destination.json`, `core/deployment.json`, `core/activation-key.json`. Prose quoted from `docs/reference/glossary.mdx`.

AAMP side: the `Intent` enum in `rust/proto/agenticrtbframework.proto` from `IABTechLab/agentic-rtb-framework` at commit `7f48161`, tag `v1.0-1-g7f48161`. ARTF is one of the two AAMP repositories that ships a written specification alongside code; even so, it is an IAB Tech Lab framework document rather than a ratified interoperability standard, and nothing in it references AdCP.
