---
title: 'Audience Constraints and Selectors'
description: 'Audience constraints in AdCP are plan-level include and exclude rules a governance agent checks seller targeting against. The four selector shapes and the field-name trap.'
answer: 'Audience Constraints in AdCP are plan-level include and exclude rules that a governance agent evaluates seller targeting against, built from audience selectors. Exclusions take precedence over inclusions.'
pubDate: 2026-08-09
term: 'Audience Constraints'
alternateNames: ['audience selector', 'audience_constraints', 'plan audience']
category: privacy
cluster: gl-governance
keywords:
  - 'audience constraints advertising'
  - 'adcp audience selector'
  - 'audience exclusion governance advertising'
  - 'k-anonymity audience size advertising'
  - 'check_governance targeting'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/audience-constraints.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/audience-selector.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/check-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/restricted-attribute.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/embedding-exchange.md'
related:
  - '/governance/policy-category/'
  - '/signals/audience-vs-signal/'
  - '/agents/governance-agent/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.noetis.dev/areas/governance/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Policy Category', 'Governance Agent', 'Signal Ref', 'Audience vs Signal']
reviewState: cto-reviewed
---

## What are audience constraints in AdCP?

Audience Constraints are the include and exclude rules a buyer attaches to a campaign plan so that a governance agent can decide whether a seller's proposed targeting is allowed. The schema `governance/audience-constraints.json` describes them as "Buyer-defined audience targeting constraints for a campaign plan. Specifies who the campaign should and should not reach. The governance agent evaluates seller targeting against these constraints during `check_governance`."

The object has exactly two properties, `include` and `exclude`, each an array of audience selectors with `minItems: 1`. At least one of the two must be present (`minProperties: 1`), and `additionalProperties` is false.

The precedence rule is stated once and is unambiguous: "Exclusions take precedence over inclusions." Inclusions are looser than they look — "the combined targeting should satisfy at least one inclusion criterion", so `include` is a disjunction, not a conjunction.

## What is the field actually called on a plan?

`audience`. Not `audience_constraints`.

This is the single most likely thing to break a first `sync_plans` payload. The schema file is `audience-constraints.json`, the schema title is "Audience Constraints", AdCP's own glossary lists the term as "Audience Constraints" — and the property on the plan object is `audience`, carrying a `$ref` to that schema. I checked the plan item's property list in `governance/sync-plans-request.json` at 3.1.10: `plan_id`, `brand`, `objectives`, `budget`, `channels`, `flight`, `countries`, `regions`, `policy_ids`, `policy_categories`, `audience`, `restricted_attributes`, `restricted_attributes_custom`, `min_audience_size`, `human_review_required`, `custom_policies`, `approved_sellers`, `delegations`, `portfolio`, `ext`.

There is no `audience_constraints` key anywhere in the released registry.

## What are the four audience selector shapes?

`core/audience-selector.json` is a `oneOf` over four variants. Two discriminators drive it: `type` distinguishes a signal from a description, and `value_type` then distinguishes the three signal shapes.

| `type`        | `value_type`  | Payload                                               | Use                                               |
| ------------- | ------------- | ----------------------------------------------------- | ------------------------------------------------- |
| `signal`      | `binary`      | `value: true \| false`                                | User matches the signal or does not               |
| `signal`      | `categorical` | `values: string[]`, `minItems: 1`                     | Target specific values of the signal              |
| `signal`      | `numeric`     | `min_value`, `max_value`, both optional and inclusive | Target a range                                    |
| `description` | —             | `description` (1–2000 chars), optional `category`     | Natural language, when no signal reference exists |

Every signal variant requires either `signal_ref` or `signal_id`, expressed as an `anyOf`. `signal_id` is marked `deprecated: true` in the schema — "DEPRECATED. Use signal_ref instead. Legacy SignalId retained for compatibility with older clients."

The description variant exists for the case where a buyer has an intent but no catalogue entry. The schema's own examples are worth reading as a sign of what these constraints are for: "likely EV buyers", "high net worth individuals", "vulnerable communities". The third is not a targeting idea. It is an exclusion.

One validation caveat for anyone building a linter: all four variants set `additionalProperties: true`. A misspelled key on an audience selector will pass a plain JSON Schema validation run and then mean nothing to the governance agent.

## What else on a plan constrains targeting?

Audience Constraints are one of three plan fields that bound who a campaign can reach, and they operate at different levels.

`restricted_attributes` is horizontal. It lists personal-data categories that must not be used for targeting anywhere in the campaign, drawn from a ten-value enum that combines GDPR Article 9 special categories with US protected classes. The schema cites "EU DSA Article 26 compliance (prohibits targeting on GDPR Article 9 special categories)". See [Policy Category and Restricted Attributes](/governance/policy-category/).

`min_audience_size` is a k-anonymity floor, and its description is more careful than most: it "Applies to the estimated combined (intersection) audience when multiple criteria are used, not just individual criterion sizes." The failure mode is handled explicitly too — "When segment size data is unavailable, the governance agent SHOULD produce a finding with reduced confidence rather than silently passing." A governance check that cannot measure the audience is required to say so rather than wave it through.

## How does a governance agent use audience constraints?

Indirectly. `check_governance` requests do not carry the constraints; they carry `plan_id` plus whatever action is being checked, and the agent resolves the stored plan. The request schema distinguishes an intent check (`tool` plus `payload`, orchestrator-side, proposed) from an execution check (`planned_delivery`, seller-side, committed).

The response carries a `verdict`, an `explanation`, `conditions`, and `findings[]` where each finding names the `policy_id` that triggered it. Findings also carry `category_id`, which is deliberately not a protocol enum — the schema tells implementers not to pattern-match it.

The constraint object is therefore a policy artifact stored once through `sync_plans` and referenced by every later check, rather than a filter shipped with each request. It is also referenced exactly once in the whole 3.1.10 registry, from `sync-plans-request.json` — a small surface for a construct doing this much work.

## Does AAMP have audience constraints?

No. I grepped all eight IAB AAMP repositories for `audience_constraint`, `policy_categor` and `restricted_attribute` across JSON, Python and markdown, and got zero hits.

AAMP's audience surface is a different problem entirely. The buyer agent carries an `audience_plan` on a deal booking request, and `agentic-audiences` proposes an embedding-exchange data plane where consent travels in the envelope with a TTL and permissible-use list. That specification is self-labelled "Draft v0.1" while sitting in a `specs/v1.0/` directory, and the file that would define the buyer and seller agent interface for it, `specs/v1.0/schema/agent_interface.schema.json`, is zero bytes.

So there is no AAMP term to map Audience Constraints onto. The nearest thing in the AAMP corpus is consent metadata riding with a transaction, not a rule set a third agent evaluates targeting against.

## Where does this definition come from?

| Claim                                                                     | File                                                           | Version pin                            |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| Include and exclude, precedence rule                                      | `dist/schemas/3.1.10/governance/audience-constraints.json`     | AdCP `3.1.10`                          |
| Four selector variants, deprecated `signal_id`                            | `dist/schemas/3.1.10/core/audience-selector.json`              | AdCP `3.1.10`                          |
| Plan field named `audience`, `min_audience_size`, `restricted_attributes` | `dist/schemas/3.1.10/governance/sync-plans-request.json`       | AdCP `3.1.10`                          |
| Intent versus execution check                                             | `dist/schemas/3.1.10/governance/check-governance-request.json` | AdCP `3.1.10`                          |
| Term wording                                                              | `docs/reference/glossary.mdx`                                  | commit `f1a35ab`                       |
| No AAMP counterpart                                                       | grep across all eight IAB repositories                         | commits listed in Sources and Versions |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
