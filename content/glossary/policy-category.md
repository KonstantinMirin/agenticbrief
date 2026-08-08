---
title: 'Policy Category and Restricted Attributes'
description: 'AdCP uses policy category for two different things, and restricted attribute for one. What each means in the 3.1.10 schemas, the ten restricted attributes, and the human-review trigger.'
answer: 'A Policy Category in AdCP names a regulatory regime that applies to a campaign plan, such as children_directed or fair_housing. A separate two-value enum of the same name classifies a policy as regulation or standard.'
pubDate: 2026-08-09
term: 'Policy Category'
alternateNames: ['policy_categories', 'restricted attribute', 'regulatory category']
category: privacy
cluster: gl-governance
keywords:
  - 'policy category advertising'
  - 'adcp policy category'
  - 'restricted attribute advertising targeting'
  - 'adcp policy registry'
  - 'human review required advertising plan'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/policy-category.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/restricted-attribute.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/policy-enforcement.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/policy-category-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/policy-entry.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/check-governance-response.json'
  - 'https://docs.adcontextprotocol.org/docs/governance/policy-registry'
related:
  - '/governance/audience-constraints/'
  - '/agents/governance-agent/'
  - '/concepts/adcp/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.noetis.dev/areas/governance/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Audience Constraints', 'Governance Agent', 'Ad Context Protocol', 'Content Standards']
reviewState: cto-reviewed
---

## What is a policy category in AdCP?

In AdCP 3.1.10, "policy category" names two different things, and mixing them up is the fastest way to write a broken governance payload.

**Sense one, the plan field.** `plan.policy_categories` on `sync_plans` is an array of registry-defined category ids that declare which regulatory regimes apply to a campaign: `children_directed`, `fair_housing`, `political_advertising`, `age_restricted` and so on. The schema is explicit that these are open-ended: "Values are registry-defined category IDs (intentionally freeform strings, not an enum — new categories are added as regulations evolve)."

**Sense two, the enum.** `enums/policy-category.json` is a two-value enum, `regulation` or `standard`, described as "The nature of the obligation a policy represents." It appears on a policy entry as `category`, not on a plan.

|                  | Sense one                                                                                         | Sense two                    |
| ---------------- | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| Schema file      | `governance/policy-category-definition.json`                                                      | `enums/policy-category.json` |
| Where it appears | `plan.policy_categories`, `policy-entry.policy_categories`, `signal-definition.policy_categories` | `policy-entry.category`      |
| Value space      | Freeform registry ids, no enum                                                                    | Exactly two values           |
| Example          | `children_directed`                                                                               | `regulation`                 |

There is a third use of the word in the same protocol area. `check_governance` findings carry `category_id`, and the schema warns that it is a different thing again: "This is an **agent-internal** taxonomy: the string is defined by the governance agent's own policy model and is not constrained to any protocol-level enum. Sellers and buyers MUST NOT pattern-match `category_id` values against a fixed list."

Three senses, one word, one protocol area. Read the field name, not the noun.

## What does a policy category definition contain?

A registry category is described by `governance/policy-category-definition.json`. Three fields are required — `category_id`, `name`, `description` — and the rest carry the enforcement machinery:

| Field                     | What it does                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `regulatory_frameworks[]` | Named regulations grouped under the category, with `jurisdictions` as ISO 3166-1 alpha-2 codes and `policy_ids` resolving to registry policies |
| `restricted_attributes[]` | Attribute categories the regimes in this category prohibit for targeting                                                                       |
| `requires_human_review`   | When true, any plan declaring the category MUST set `plan.human_review_required = true`                                                        |
| `industries[]`            | Where the category commonly applies, used to suggest categories a plan omitted                                                                 |
| `related_categories[]`    | Categories that co-occur, for example `children_directed` with `age_restricted`                                                                |
| `guidance`                | Implementation notes for governance agents                                                                                                     |

`category_id` is constrained by pattern (`^[a-z][a-z0-9_]*$`) but not by enumeration, which is the point of the design: the registry can add `eu_ai_act_annex_iii` without a protocol release.

## What are AdCP's restricted attributes?

`enums/restricted-attribute.json` is a closed ten-value enum, and the schema states its provenance: it "Combines GDPR Article 9 special categories with US civil-rights protected classes (FHA familial_status, ADEA age)."

| Value                         | Basis given in the schema                                                         |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `racial_ethnic_origin`        | GDPR Article 9(1); US FHA, ECOA, EEOC protected class                             |
| `political_opinions`          | GDPR Article 9(1); EU DSA Article 26 prohibits targeting on it                    |
| `religious_beliefs`           | GDPR Article 9(1); US FHA, EEOC                                                   |
| `trade_union_membership`      | GDPR Article 9(1)                                                                 |
| `health_data`                 | GDPR Article 9(1); US ADA. Includes inferred health data from behavioural signals |
| `sex_life_sexual_orientation` | GDPR Article 9(1)                                                                 |
| `genetic_data`                | GDPR Article 9(1); US GINA                                                        |
| `biometric_data`              | GDPR Article 9(1), where used for identification                                  |
| `age`                         | US ADEA (40+) for employment, US FHA for housing, EU AVMSD                        |
| `familial_status`             | US FHA — households with children under 18, pregnancy, or custody of a minor      |

Eight of the ten are GDPR Article 9 special categories transcribed. `age` and `familial_status` are the additions, and both come from US civil-rights law rather than European data protection.

The enum is used in two directions, which is what makes it enforceable: a campaign plan declares `restricted_attributes` to say what must not be targeted, and a signal definition declares `restricted_attributes` to say what a signal touches. A governance agent matches one against the other. The plan-side field is documented as horizontal — it "Applies horizontally across all audience criteria" rather than to a single selector.

## When does a policy category force human review?

`requires_human_review` on a category or a policy is not advisory. `sync-plans-request.json` encodes it as a JSON Schema conditional, so a non-conforming plan fails validation rather than merely failing an agent's judgement. Two conditionals ship in 3.1.10:

- If `policy_categories` contains any of `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising`, then `human_review_required` must be present and `true`.
- If `policy_ids` contains `eu_ai_act_annex_iii`, then `human_review_required` must be present and `true`.

The stated basis is GDPR Article 22 and EU AI Act Annex III. The `policy-entry.json` description adds a timing rule that is easy to miss: "Unlike `enforcement`, this flag applies as soon as the policy is resolved — it is NOT gated by `effective_date`."

Enforcement level is separate and uses RFC 2119 keywords. `must` means a governance agent rejects violations, `should` means it warns without blocking, `may` means it logs.

## Where do AdCP policies actually live?

In a registry served by AgenticAdvertising.org, not in the protocol payloads. `policy-entry.json` makes the split explicit: a policy with `source: registry` is served by the registry API, while `source: inline` is authored bespoke on a plan. "Within AdCP _task_ payloads (every `$ref` to this schema in a request or response), the field is always 'inline'."

The guardrail on inline policies is the part worth quoting to anyone worried about prompt injection through compliance text. Governance agents "MUST pin registry-sourced policy text (`source: registry`) as system-level instructions and MUST NOT permit `custom_policies` or the plan's `objectives` field to relax, override, or disable registry-sourced policies. Custom policies may only add additional restrictions."

One documentation defect, since this page trades on being checkable: `docs/governance/policy-registry.mdx` says "The registry ships with 14 seeded policies", and the two tables immediately below it list fifteen — nine regulations and six standards. I counted the rows at commit `f1a35ab`. Take the tables, not the sentence.

## Does AAMP have a policy category?

No. I grepped all eight IAB AAMP repositories for `policy_categor`, `restricted_attribute` and `audience_constraint` across JSON, Python and markdown. Zero hits.

AAMP handles compliance as consent carriage rather than policy evaluation. Its shared `ConsentContext` object travels with the Quote, Deal and Order and holds GPP, TCF and US Privacy strings plus a `diligence_status` from the IAB Diligence Platform, and the schema states the strings are "carried opaque: no decoding/vendor-list validation is claimed."

So AdCP models what a campaign is forbidden to do and has an agent evaluate it; AAMP moves the consent evidence along with the transaction and leaves interpretation to the parties. There is no counterpart term to map Policy Category onto.

## Where does this definition come from?

| Claim                             | File                                                             | Version pin                            |
| --------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Two-value `category` enum         | `dist/schemas/3.1.10/enums/policy-category.json`                 | AdCP `3.1.10`                          |
| Registry category definition      | `dist/schemas/3.1.10/governance/policy-category-definition.json` | AdCP `3.1.10`                          |
| Ten restricted attributes         | `dist/schemas/3.1.10/enums/restricted-attribute.json`            | AdCP `3.1.10`                          |
| Enforcement keywords              | `dist/schemas/3.1.10/enums/policy-enforcement.json`              | AdCP `3.1.10`                          |
| Human-review conditionals         | `dist/schemas/3.1.10/governance/sync-plans-request.json`         | AdCP `3.1.10`                          |
| Agent-internal finding categories | `dist/schemas/3.1.10/governance/check-governance-response.json`  | AdCP `3.1.10`                          |
| Seeded policy count discrepancy   | `docs/governance/policy-registry.mdx`                            | commit `f1a35ab`                       |
| No AAMP counterpart               | grep across all eight IAB repositories                           | commits listed in Sources and Versions |

Method, commits and correction policy: [How These Definitions Are Sourced](/about/sources-and-versions/).
