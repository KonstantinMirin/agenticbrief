---
title: 'Audience Constraints and Selectors'
description: 'Audience constraints are AdCP plan-level include and exclude rules for targeting. The four selector shapes, and the places the schema stops checking.'
answer: 'Audience constraints in AdCP are the plan-level include and exclude rules a governance agent evaluates seller targeting against during check_governance, where exclusions take precedence over inclusions.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Audience Constraints'
alternateNames: ['audience selector', 'audience_constraints', 'plan audience', 'audience plan']
category: privacy
cluster: gl-governance
keywords:
  - 'audience constraints advertising'
  - 'adcp audience selector'
  - 'audience exclusion governance advertising'
  - 'k-anonymity audience size advertising'
  - 'check_governance targeting'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/audience-constraints.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/audience-selector.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/planned-delivery.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/governance-mode.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/restricted-attribute.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/concepts/security-model.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a154/docs/api/audience_plan_wire_format.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029/spec/jsonschema/protocol/DealBookingRequest.json'
related:
  - '/governance/policy-category/'
  - '/signals/audience-vs-signal/'
  - '/signals/signal-definition/'
  - '/agents/governance-agent/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/governance/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Policy Category', 'Governance Agent', 'Signal Definition', 'Audience vs Signal']
reviewState: cto-reviewed
---

Audience constraints in AdCP are the include and exclude rules a buyer attaches to a campaign plan so a [governance agent](/agents/governance-agent/) can judge whether the seller's targeting is allowed. The object has two properties, `include` and `exclude`, and no others.

`governance/audience-constraints.json` is the schema. `include`: "The combined targeting should satisfy at least one inclusion criterion", with no grouping and no nesting. `exclude`: "Exclusions take precedence over inclusions." Each is an array of audience selectors with `minItems: 1`, one of the two must be present (`minProperties: 1`), and `additionalProperties` is false, so an empty array and an empty object both fail. The schema also states what `exclude` is for: "protected groups, vulnerable communities, regulatory restrictions, or brand safety."

On a plan the property is named `audience`, not `audience_constraints`. The `$ref` in `governance/sync-plans-request.json` hangs off a plan property called `audience`, and a plan item is `additionalProperties: false`, so the other name — used in `docs/building/concepts/security-model.mdx`, "Plan-level `audience_constraints` and governance policies are machine-enforceable expressions of human judgment" — produces a rejected `sync_plans` call rather than a warning. Only `plan_id`, `brand`, `objectives`, `budget` and `flight` are required, so a plan can arrive carrying no constraint at all; the schema never says what an absent `audience` means, and unconstrained is the only reading available to an agent.

## The four audience selector shapes

`core/audience-selector.json` is a `oneOf` over four variants, discriminated by `type` (signal or description), then by `value_type`.

| `type`        | `value_type`  | Payload                                           | What it expresses                        |
| ------------- | ------------- | ------------------------------------------------- | ---------------------------------------- |
| `signal`      | `binary`      | `value: true \| false`                            | The user matches the signal, or does not |
| `signal`      | `categorical` | `values: string[]`, `minItems: 1`                 | Specific values of the signal            |
| `signal`      | `numeric`     | `min_value`, `max_value`, optional, inclusive     | A range                                  |
| `description` | —             | `description` (1–2000 chars), optional `category` | Natural language, when no signal exists  |

Every signal variant demands `signal_ref` or `signal_id` through an `anyOf`, and `signal_id` is `deprecated: true`, "retained for compatibility with older clients". New code points at a [signal definition](/signals/signal-definition/).

The description variant covers a buyer with an intent and no catalogue entry. Its schema examples are "likely EV buyers", "high net worth individuals" and "vulnerable communities", and "vulnerable communities" is also one of the phrases the container's own `exclude` description reserves for exclusions.

## Where the schema stops checking

`include` is an unordered OR, and the schema defines no AND and no nesting. A buyer who wants both in-market for EVs and a household-income floor writes two selectors with no operator to join them, and the plan records the union rather than the intersection.

Inside a selector, validation is loose. All four variants are `additionalProperties: true` and the numeric branch requires only `type` and `value_type`, so an unknown key, a selector with no bounds at all, and `min_value: 100` with `max_value: 5` all validate — the last because the ordering rule is stated in prose only. Nothing downstream can distinguish a mistyped range field from an absent one. The `oneOf` rejects only a mistyped `value_type`, which matches no branch.

A binary selector with `value: false` inside `exclude` also validates. `value` means "whether to include (true) or exclude (false) users matching this signal", and the container's rule is already "must not overlap with these", so the payload carries two negations and 3.1.13 does not say which wins.

## How a governance agent reads the constraints

A `check_governance` request carries `plan_id` and the action under review, never the constraint object itself, so the agent has to resolve the stored plan before it can judge anything. The schema splits an intent check (`tool` plus `payload`, proposed) from an execution check (`planned_delivery`, committed). `core/planned-delivery.json` has `audience_targeting`, built from the same `audience-selector.json` the buyer wrote the constraint in, and governance agents "MUST use this for bias/fairness validation and SHOULD ignore audience_summary". Both sides speak one type, and the governance agent diffs them.

The reply cannot name what failed. A `findings[]` item is `additionalProperties: false`, `policy_id` is optional, and `category_id` is agent-internal with callers told they "MUST NOT pattern-match" it. No field in the object can name the offending selector. `mode` on the response is optional and `x-status: experimental`, and in `audit` mode "the governance agent always returns approved", so an `approved` verdict does not indicate whether the agent was enforcing.

## min_audience_size and restricted_attributes

`min_audience_size` is a k-anonymity floor on the plan, and an agent that cannot size the audience must "produce a finding with reduced confidence rather than silently passing".

The floor "Applies to the estimated combined (intersection) audience when multiple criteria are used", while `include` is an OR and a union is never smaller than its parts. The specification does not reconcile the two: "criteria" may mean the seller's combined targeting or the plan's inclusion list, and nothing in 3.1.13 states which reading applies.

`restricted_attributes` bars personal-data categories from targeting anywhere in the campaign, from a ten-value enum cited to "EU DSA Article 26 compliance"; that enum belongs to [policy categories](/governance/policy-category/).

## AAMP's audience plan

AAMP has no field of that name. What it has is an `AudiencePlan`, specified in `buyer-agent/docs/api/audience_plan_wire_format.md`, marked "Status: Active" and implemented in Pydantic on both sides. The AAMP column below describes that document rather than a published schema.

|                           | AdCP `audience` (3.1.13)  | AAMP `AudiencePlan`                                  |
| ------------------------- | ------------------------- | ---------------------------------------------------- |
| Roles                     | `include`, `exclude`      | `primary`, `constraints`, `extensions`, `exclusions` |
| Set algebra               | undefined; include is OR  | intersect / union / subtract, per role               |
| Ref provenance            | none                      | `explicit` / `resolved` / `inferred`, required       |
| Confidence                | none                      | 0–1, MUST be null when `explicit`                    |
| Consent metadata          | none                      | `compliance_context` on `agentic` refs               |
| Content hash              | none                      | canonicalised SHA-256 over the four roles            |
| Capability negotiation    | none                      | `400 audience_plan_unsupported`, per-path            |
| Published schema          | yes, `$id`-pinned, strict | no                                                   |
| k-anonymity floor         | `min_audience_size`       | prose only, in a draft                               |
| Restricted-attribute enum | 10 values                 | none                                                 |

On the wire, `DealBookingRequest.audience_plan` is `{"type": "object", "additionalProperties": true}`, described as "open object; typed model lands with the audience-plan bead", and `iab-agentic-primitives` v0.5.0 carries no audience schema file at all. The two protocols are set against each other in [AdCP vs AAMP](https://agenticadlab.com/protocols/adcp-vs-aamp/).

An audience selector is not AdCP's `Audience` object, the buyer-uploaded list registered through `sync_audiences`; the two are set out side by side under [audience vs signal](/signals/audience-vs-signal/).
