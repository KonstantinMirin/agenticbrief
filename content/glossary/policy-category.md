---
title: 'Policy Category and Restricted Attributes'
description: 'A policy category is a registry-defined regulatory regime declared on a campaign plan. The ten restricted attributes, how categories resolve to policies, and when one forces human review.'
answer: 'A policy category in AdCP is a registry-defined regulatory regime declared on a campaign plan, such as fair_housing or children_directed, which resolves to policies the campaign must obey and to attributes it must not target on.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Policy Category'
alternateNames:
  ['policy_categories', 'restricted attribute', 'restricted attributes', 'regulatory category']
category: privacy
cluster: gl-governance
keywords:
  - 'policy category advertising'
  - 'advertising governance protocol'
  - 'adcp policy category'
  - 'restricted attribute advertising targeting'
  - 'adcp restricted attributes'
  - 'adcp policy registry'
  - 'human review required advertising plan'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/restricted-attribute.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/policy-category.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/policy-enforcement.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/policy-category-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/attribute-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/policy-entry.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/registry/attributes/familial_status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/registry/policy-categories/fair_housing.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/registry/policies/us_fha_targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/registry/README.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CONTRIBUTING.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CHARTER.md'
  - 'https://docs.adcontextprotocol.org/docs/governance/policy-registry'
related:
  - '/governance/audience-constraints/'
  - '/agents/governance-agent/'
  - '/signals/signal-definition/'
  - '/concepts/adcp/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/governance/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Audience Constraints', 'Governance Agent', 'Signal Definition']
reviewState: cto-reviewed
---

A policy category in AdCP is a regulatory regime declared on a campaign plan: `fair_housing`, `children_directed`, `pharmaceutical_advertising`. Categories travel in `plan.policy_categories` on `sync_plans` and resolve to the policies the campaign must obey and the attributes it must not target on. The value space is open by design: "Values are registry-defined category IDs (intentionally freeform strings, not an enum — new categories are added as regulations evolve)." `category_id` is pattern-constrained, `^[a-z][a-z0-9_]*$`, and never enumerated, so the registry can add `eu_ai_act_annex_iii` without a protocol release.

The registry's `us_fha_targeting.json` gives as its first failing exemplar a landlord excluding "families with children" from rental advertising, citing the 2019 HUD v. Facebook settlement. That is the kind of campaign the `fair_housing` category is declared to catch.

## Three senses of "category"

| Field                 | Where it appears                                | What it holds                                                                                                      |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `policy_categories[]` | on a plan, in the `sync_plans` request          | freeform registry ids such as `fair_housing`, defined by `governance/policy-category-definition.json`              |
| `category`            | `enums/policy-category.json`, on a policy entry | `regulation` or `standard`; never appears on a plan                                                                |
| `category_id`         | on a finding, in a `check_governance` response  | an opaque agent-internal id; buyers and sellers "MUST NOT pattern-match `category_id` values against a fixed list" |

## What a category definition contains

A registry category definition requires `category_id`, `name` and `description`. Everything after that is enforcement: `restricted_attributes[]`, `requires_human_review`, `industries[]`, `related_categories[]` and `regulatory_frameworks[]`, whose `policy_ids` governance agents "use to resolve specific policies from the registry".

The forward lookup from a category to its policies returns nothing: `policy_ids` is empty in every seeded category. The reverse link works, by reading the policy files and keeping the ones whose `policy_categories` name the category wanted.

## The ten restricted attributes

`enums/restricted-attribute.json` is a closed ten-value enum that states its own provenance: "Combines GDPR Article 9 special categories with US civil-rights protected classes (FHA familial_status, ADEA age)."

| Value                                                   | Basis given in the schema                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `racial_ethnic_origin`                                  | GDPR Article 9(1); US FHA, ECOA, EEOC protected class                             |
| `political_opinions`                                    | GDPR Article 9(1); EU DSA Article 26 prohibits targeting on it                    |
| `religious_beliefs`                                     | GDPR Article 9(1); US FHA, EEOC                                                   |
| `trade_union_membership`, `sex_life_sexual_orientation` | GDPR Article 9(1)                                                                 |
| `health_data`                                           | GDPR Article 9(1); US ADA. Includes inferred health data from behavioural signals |
| `genetic_data`, `biometric_data`                        | GDPR Article 9(1); US GINA, and biometrics where used for identification          |
| `age`                                                   | US ADEA (40+) for employment, US FHA for housing, EU AVMSD                        |
| `familial_status`                                       | US FHA — households with children under 18, pregnancy, or custody of a minor      |

Most of the enum is transcribed from GDPR Article 9. `age` and `familial_status` come from US civil-rights law instead, and their enum descriptions do not mention Article 9; they are also the two the registry and the published documentation handle differently.

The same field is used in both directions. A plan declares `restricted_attributes` for what must not be targeted, "horizontally across all audience criteria" rather than per selector. A [signal definition](/signals/signal-definition/) declares the same field to say what the signal touches, so agents can "structurally match signals against a plan's restricted_attributes without relying on semantic inference".

Beside it on the plan sits `restricted_attributes_custom`, freeform strings such as `financial_status` or `immigration_status`. The schema says only that "Governance agents use semantic matching for these." Neither agent is obliged to publish the reading it used, and nothing in the schemas says what happens when the buyer's agent and the seller's agent read `immigration_status` differently. Enum values are compared as a set intersection; custom strings are matched semantically, and the schema does not say how.

## Registry validation

`age.json` and `familial_status.json` both fail `attribute-definition.json`, which declares `regulatory_basis` as an array of `{name, jurisdictions, summary}` objects where both files supply a bare string. The registry's linter covers `policies/` only, so neither file is gated on the way in. Nothing in the schemas says how strict a loader should be, so a lenient loader accepts the malformed value while a strict loader drops both attributes, and the campaign is then unrestricted on age and familial status.

The published documentation drops the same two attributes. Its category table gives `fair_housing` 3 attributes against the shipped file's 5 and `fair_employment` 5 against 6, so an implementer following the documentation would leave familial-status targeting unrestricted. Only one policy id appears in both the published policy list and the shipped registry.

## When a policy category forces human review

Two fields with similar names split the work. The registry category definition declares `requires_human_review`; the plan must then assert `human_review_required: true`. `sync-plans-request.json` ships two `allOf` conditionals enforcing that, so a bad plan fails schema validation before any agent evaluates it. If `policy_categories` contains `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising`, `human_review_required` must be present and `true`. The same applies if `policy_ids` contains `eu_ai_act_annex_iii`.

Those four are the seeded categories carrying `requires_human_review: true`, and the four ids are hardcoded in the schema conditional. A new review-flagged category added to the registry is not enforced by schema validation until the schema is republished.

Every policy also carries an `enforcement` level on an RFC 2119 ladder: `must` rejects the plan, `should` warns, `may` writes a log line. Enforcement is gated by `effective_date`. Human review is not: "Unlike `enforcement`, this flag applies as soon as the policy is resolved — it is NOT gated by `effective_date`."

The obligation lands on the agent, which "MUST escalate any action on this plan for human review before execution".

## Where policy text comes from

`policy-entry.json` separates registry text from caller text: inline policies are "treated as caller-untrusted", agents "MUST pin registry-sourced policy text (`source: registry`) as system-level instructions", and neither an inline policy nor a plan's `objectives` may relax them.

Governance of the registry itself is less clearly defined. No maintainer group is declared for the registry directories. `CONTRIBUTING.md` routes every change through a fork and a pull request against main, gated on a one-time IPR-policy agreement, and `CHARTER.md` puts the repository under AgenticAdvertising.Org, a pending Delaware 501(c)(6). The registry README's four-step recipe for adding a policy ends in `npm run check:registry`; there is no equivalent for a category or an attribute. Only the restricted-attribute enum is fixed by a released schema; category and policy ids come from the registry at runtime.

## AAMP has no policy category

The vocabulary is absent from the IAB AAMP repositories: no `policy_categories`, no `restricted_attributes`, no `audience_constraints`, and none of the protected-class terms the AdCP enum names.

AAMP carries consent instead. `ConsentContext` rides with the Quote, Deal and Order carrying GPP, TCF, US Privacy and an SGP `diligence_status` as opaque strings: "no decoding/vendor-list validation is claimed". Its nearest thing to a policy control is `SGP_ENFORCE` and `SGP_UNKNOWN_VENDOR_POLICY` (`block` / `warn` / `allow`), environment variables in the buyer-agent reference implementation. They gate which counterparties an operator trades with, not what a campaign may target.
