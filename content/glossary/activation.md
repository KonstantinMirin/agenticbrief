---
title: 'Signal Activation in AdCP (activate_signal)'
description: 'Signal activation is the AdCP call that makes a discovered signal usable on a named destination. The request, the response, the activation key, and where the documentation differs.'
answer: 'Signal activation is the AdCP call that makes a discovered signal usable on a named destination, taking a segment handle and a list of destinations and returning an activation key once the deployment is live.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Signal Activation'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['activation', 'signal deployment', 'activate_signal']
keywords:
  - 'signal activation advertising'
  - 'activate_signal adcp'
  - 'signal deployment'
  - 'activation key advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/activate-signal-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/activate-signal-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/destination.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/deployment.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/activation-key.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/task-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/signals/tasks/activate_signal.mdx'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/rust/proto/agenticrtbframework.proto'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Deal.json'
related:
  - '/signals/signal-definition/'
  - '/signals/audience-vs-signal/'
  - '/agents/signal-agent/'
  - '/realtime/artf-intent/'
  - 'https://adcpexplorer.com/areas/signals/'
seeAlso: ['signal-definition', 'audience-vs-signal', 'signal-agent', 'artf-intent']
reviewState: cto-reviewed
---

Signal activation is the AdCP call that makes a discovered signal usable on a named destination. AdCP's glossary puts it as "the process of making a signal available for targeting on a specific platform and seat". The Signals area has two operations: `get_signals` reports that a signal exists and returns a handle, and `activate_signal` turns that handle into something a DSP will accept.

## Destination, Deployment, and the activation key

Destination and Deployment are discriminated unions on `type` with the same two branches: a `platform` names a DSP by string identifier (`the-trade-desk`, `amazon-dsp`), an `agent` names one by URL. Deployment adds `is_live`, `activation_key`, `estimated_activation_duration_minutes` and `deployed_at`. All four — both Destination branches and both Deployment branches — allow additional properties.

`activation-key.json` calls the key a "universal identifier for using a signal on a destination platform", arriving as `type: segment_id` or `type: key_value`, because AdCP does not normalise how platforms express targeting.

The visibility rule sits on both Deployment branches: "The key to use for targeting. Only present if `is_live=true` AND requester has access to this deployment." The field is simply absent, so the caller cannot distinguish "not live yet" from "not yours".

`estimated_activation_duration_minutes` is the only clock the protocol offers, and activation is asynchronous rather than immediate: the glossary's "Estimated Activation Time" entry describes "typically 24-48 hours for new activations", which is 1,440 to 2,880 in the field's unit. Deployments also arrive with neither a key nor an estimate, and the schema says nothing about the interval there.

## What an activate_signal request requires

`activate-signal-request.json` lists exactly `["idempotency_key", "signal_agent_segment_id", "destinations"]` in `required`. Two further fields are required by conditions written in field descriptions that nothing in the file can check: no `if`/`then`, no `dependentRequired`, and the only `oneOf` is the version envelope the request inherits.

| Tier                                  | Fields                                                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Enforced by `required[]`              | `idempotency_key`, `signal_agent_segment_id`, `destinations` (`minItems: 1`)                                                       |
| Required by a sentence, unenforceable | `pricing_option_id`, when the signal has pricing options; `governance_context`, when the account has a registered governance agent |

That leaves `action`, `account`, `context` and `ext` optional. `action` defaults to `activate`. Its other value, `deactivate`, exists because ending a campaign requires the segment to be torn down: the schema gives the reason as "required when campaigns end to comply with data governance policies (GDPR, CCPA)".

Both conditional fields are stated in prose and enforced nowhere. `governance_context` carries the description "signal agents MUST reject governed activations that omit a valid context", and `pricing_option_id` is required when the `get_signals` response carried `pricing_options` "when it has an incremental price"; in both cases the request schema constrains the value once it appears and says nothing about whether it was sent. Omitted on a priced signal, the seller has to catch it, with `INVALID_PRICING_MODEL` per the task page, a code that is not in the released enum.

Reusing one `idempotency_key` across two sellers hands both of them a join key, so the schema requires it to be unique per (seller, request) pair "to prevent cross-seller correlation".

## Partial failure

`activate-signal-response.json`: "Returns either complete success data OR error information, never both. This enforces atomic operation semantics - the signal is either fully activated or not activated at all."

The `oneOf` enforces it: the success branch requires `deployments` and adds `not: {required: ["errors"]}`, the error branch requires `errors` with `minItems: 1` and excludes both `deployments` and `sandbox`. A payload carrying both matches neither branch.

Only one destination per call keeps the error branch usable. A call with three destinations and one hard failure has no representation: reporting the failure loses the two successes, and reporting the successes leaves the failure with no reason attached. The only way out is `is_live: false` on the failed deployment inside a success response, which carries no error code and no `recovery` classification, and `core/error.json` has no destination pointer to scope an error to one entry of `destinations[]`.

## Documentation and schema divergence

`docs/signals/tasks/activate_signal.mdx` describes the operation in terms the released schemas do not support. It reads as though five fields are required where `required[]` names three. Its "Response Data" section shows one object carrying both `deployments[]` and `errors[]`, and its "Error Handling Philosophy" says a signal "can be `deployed` while still having warnings in `errors` array", where the `oneOf` forbids both shapes; only its `<Note>` that the two are "mutually exclusive" matches the schema. It names error codes — `ACTIVATION_FAILED`, `ALREADY_ACTIVATED`, `DEPLOYMENT_UNAUTHORIZED`, `INVALID_PRICING_MODEL`, `SUBOPTIMAL_CONFIGURATION`, `SLOW_ACTIVATION`, `FREQUENCY_CAP_RESTRICTIVE` — that `enums/error-code.json` does not carry, and task statuses `deployed`, `pending` and `processing` that `enums/task-status.json` does not carry. On key visibility it states only the access half of the rule. Implement against the schemas; the field-level comparison is on [AdCP Explorer](https://adcpexplorer.com/areas/signals/).

Codes outside the enum are still conformant: the enum's description lets sellers "return codes not listed here" and tells agents to fall back "to the recovery classification". No `recovery` class is published for the codes the task page names, so the fallback has nothing to read. Task status does not report liveness either: a `completed` task can carry a deployment with `is_live: false`.

## Segment identifiers

`signal_agent_segment_id` addresses the signal at the signal agent, and `activation_key.segment_id` addresses it at the platform. One goes out on the request, the other comes back on the response, and neither substitutes for the other. AdCP's glossary entry for Segment ID names both without distinguishing them.

No released schema in 3.1.13 contains the string `seat`. `docs/reference/glossary.mdx` defines it anyway, as "a specific advertising account within a decisioning platform", and that same page scopes two error codes as "platform/seat" where the task page says "platform/account". The field carrying the meaning on the wire is `account`, the optional string on both destination branches. No spec file connects `seat` to `account`.

## Activation in AAMP

AAMP defines no equivalent provisioning operation.

ARTF's protobuf `Intent` enum has `ACTIVATE_SEGMENTS = 1`, "activate user segments by their external segment IDs". That is a serve-time mutation at `/user/data/segment` on a bid request already in flight, rejectable by the orchestrator and dead when the auction closes, where AdCP activation is planning-time provisioning that yields a durable key. The nearest wire-level counterpart, `POST /agentic-audience/match` in the seller agent, scores a match `STRONG | MODERATE | WEAK | POOR` and calls its own score "mock-quality (deterministic from sha256 of `identifier`)".

`Deal.activation_instructions`, an untyped string map carrying no description, is the only field named for activation in `iab-agentic-primitives` v0.5.0. AdCP's destination object, deployment status and `deactivate` verb have no counterpart there.
