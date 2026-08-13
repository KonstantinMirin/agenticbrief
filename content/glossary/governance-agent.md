---
title: 'Governance Agent'
description: 'A governance agent is an external service a buyer configures to validate campaign actions before they execute. In AdCP 3.1.13 the operations that gate a buy are experimental.'
answer: 'A governance agent is an external service a buyer configures to validate campaign actions before they execute; both the orchestrator and the seller call check_governance against it, and in AdCP 3.1.13 that surface is still marked experimental.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Governance Agent'
alternateNames: ['compliance agent', 'policy agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'advertising governance agent'
  - 'what is a governance agent'
  - 'check_governance adcp'
  - 'adcp governance protocol agent'
citations:
  - 'https://docs.adcontextprotocol.org/docs/trust'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://docs.adcontextprotocol.org/docs/faq'
  - 'https://docs.adcontextprotocol.org/docs/reference/experimental-status'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trust.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/whats-new-in-v3.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/governance-mode.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/account/sync-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/campaign/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/specification.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029/spec/jsonschema/DecisionRecord.json'
related:
  - '/agents/agent/'
  - '/agents/agent-card/'
  - '/agents/buyer-agent/'
  - '/agents/seller-agent/'
  - '/governance/policy-category/'
  - '/negotiation/trust-status/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/governance/'
  - 'https://agenticadlab.com/guides/what-agentic-ad-protocols-dont-standardize/'
seeAlso: ['Policy Category', 'Trust Status', 'Agent Card', 'Buyer Agent', 'Seller Agent']
reviewState: cto-reviewed
---

A governance agent is an external service a buyer configures on its account to validate campaign actions before they execute. AdCP's FAQ scopes the checks to "budget limits, brand safety, regulatory compliance".

`docs/trust.mdx` gives the reason for "external": "the agent that spends money is never the agent that approves the spend." Neither the buyer's [orchestrator](/agents/buyer-agent/) nor the seller's [sales agent](/agents/sales-agent/) qualifies, so both call the same third party.

In `dist/schemas/3.1.13/account/sync-governance-request.json`, `governance_agents` is an array with `minItems: 1` and `maxItems: 1`, so an account carries exactly one. The endpoint must be HTTPS (`"pattern": "^https://"`), and capabilities go at `.well-known/agent-card.json`, the same [agent card](/agents/agent-card/) path every other AdCP role uses.

AdCP assumes a third-party market without naming it: `docs/governance/campaign/specification.mdx` tells buyers to verify their own tokens so they can catch "a misbehaving governance vendor", and AdCP names no governance vendors and publishes no conformance list.

## What a `check_governance` call carries

`check_governance` takes a `phase`: purchase, modification, delivery. It answers approved, denied or conditions. A conditions verdict is a failure that names what would pass: the response carries a `field`, a `reason`, and a `required_value` where that value is machine-actionable, and the caller must "re-call check_governance with the adjusted parameters before proceeding". Denied and conditions put the seller under the same duty, to honor the verdict; the FAQ's wording is "you can't override a governance decision or modify budgets." Findings carry a severity of info, warning or critical, plus a confidence between 0 and 1.

The governance agent returns approval as `governance_context`, a compact JWS. The buyer attaches it to the protocol envelope on the purchase request; the seller persists it and replays it on every later `check_governance` call in that action's lifecycle. Verification was optional in 3.0; in 3.1 every seller must verify signature, `aud`, `exp`, `jti` replay and revocation against a JWKS resolved through `sync_governance`.

When `governance_agents` is present on the account, the seller "MUST call `check_governance` before confirming any media buy". The seller does not owe outcome reporting, which belongs to the orchestrator through `report_plan_outcome`, and it does not owe an audit-log store, since a seller is "not required to maintain or hand over" one.

## A governance check does not always block a buy

`docs/trust.mdx` and `docs/protocol/design-principles.mdx` both carry the same caveat:

> `check_governance` is a seam, not an enforcer. A seller that has not configured a governance agent, or a misconfigured one, will not call `check_governance` at all — the protocol does not prevent a non-conformant seller from transacting.

Three conditions stand between the protocol's MUSTs and a blocked buy. `sync_governance` is one of the five Accounts operations, and `required-tasks.mdx` marks it Conditional: "Required when the buyer uses campaign governance", so an account with nothing synced has no agent to call. Sellers implementing campaign governance "declare `governance.campaign` in `experimental_features`", and nothing compels the declaration. A configured agent can also run in a non-blocking mode: `enums/governance-mode.json` is `audit | advisory | enforce`, and audit means "Log all checks, never block ... the governance agent always returns approved." AdCP's walkthrough has the buyer starting there.

AdCP's two hardest schema triggers, on regulated `policy_categories` and on `eu_ai_act_annex_iii`, both bind the buyer's plan object and fire before a plan is synced, so a seller that never calls `check_governance` never meets either one.

## Governance operations in AdCP 3.1.13

AdCP 3.1.13 routes 22 [operations](https://adcpexplorer.com/areas/governance/) through governance, more than it gives any other area. The `x-status` field on each request schema marks four of them experimental.

| Sub-protocol      | Operations                                                                                                                       | Count | `x-status` in 3.1.13 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------- |
| Campaign          | `sync_plans`, `check_governance`, `report_plan_outcome`, `get_plan_audit_logs`                                                   | 4     | experimental         |
| Property lists    | `create_`/`get_`/`update_`/`delete_`/`list_property_lists`                                                                       | 5     | stable               |
| Collection lists  | `create_`/`get_`/`update_`/`delete_`/`list_collection_lists`                                                                     | 5     | stable               |
| Content standards | `create_`/`get_`/`update_`/`list_content_standards`, `calibrate_content`, `validate_content_delivery`, `get_media_buy_artifacts` | 7     | stable               |
| Creative          | `get_creative_features`                                                                                                          | 1     | stable               |

Only `check_governance` stands between a buy and its execution, "the universal validation gate". The other eighteen operations manage reusable lists; `calibrate_content` and `validate_content_delivery` do not gate execution. AdCP does not treat "governance agent" as a single role either: `docs/protocol/required-tasks.mdx` heads three sections "Governance agent", then switches to "Content standards agent" and "Creative governance agent" for the other two sub-protocols.

## Policy categories that force human review

The live constraint is an `if/then` on the plan object in `dist/schemas/3.1.13/governance/sync-plans-request.json`: put `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising` in `policy_categories` and `human_review_required` becomes required with `const: true`. A second `if/then` does the same for `policy_ids` containing `eu_ai_act_annex_iii`, and no prose page in the repository mentions it.

The authoritative [policy category](/governance/policy-category/) list is that enum, and the prose pages disagree with it: `docs/governance/annex-iii-obligations.mdx` and `docs/reference/whats-new-in-v3.mdx` give four categories, while `docs/trust.mdx` gives three, omitting `pharmaceutical_advertising`.

## Governance in AAMP

No AAMP repository names the role. `iab-agentic-primitives` v0.5.0 defines `DecisionRecord.json`, "a durable record of why a money/state decision was made", alongside `CreativeApproval` and `ConsentContext`, and none of the 13 operations in `spec/openapi/iab-agentic-api.yaml` references any of the three types.

The one gate AAMP operates is [trust status](/negotiation/trust-status/) inside the reference [seller agent](/agents/seller-agent/), a five-value enum capping a buyer's access tier, which governs who transacts rather than what may be bought. Both protocols are measured against the same question in [what agentic ad protocols don't standardize](https://agenticadlab.com/guides/what-agentic-ad-protocols-dont-standardize/).
