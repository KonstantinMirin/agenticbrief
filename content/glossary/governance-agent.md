---
title: 'Governance Agent'
description: 'A governance agent validates campaign actions before they execute. AdCP gives it 22 of 64 operations, calls the campaign surface experimental, and admits check_governance is a seam, not an enforcer.'
answer: 'A governance agent is an external service a buyer configures to validate campaign actions before they execute. Both the orchestrator and the seller call check_governance against it. AdCP marks the campaign governance surface experimental.'
pubDate: 2026-08-09
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
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/trust.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/governance/property/specification.mdx'
related:
  - '/agents/agent/'
  - '/agents/agent-card/'
  - '/governance/policy-category/'
  - '/agents/buyer-agent/'
  - 'https://adcpexplorer.noetis.dev/areas/governance/'
  - 'https://agenticadlab.noetis.dev/guides/what-agentic-ad-protocols-dont-standardize/'
seeAlso: ['Policy Category', 'Audience Constraints', 'Agent', 'Buyer Agent']
reviewState: cto-reviewed
---

## What is a governance agent?

AdCP's FAQ gives the cleanest definition in the corpus: "A governance agent is an external service that an advertiser/buyer configures on their account to validate campaign actions before they execute — budget limits, brand safety, regulatory compliance."

The word doing the work is **external**. The governance agent is not the buyer's orchestrator and not the seller's [sales agent](/agents/sales-agent/). AdCP's trust document states the principle as a structural rule: "the agent that spends money is never the agent that approves the spend."

Both sides call it. The FAQ: "Both the orchestrator (buy side) and the seller call `check_governance` against it; it is the universal validation gate."

Version pin: AdCP **3.1.10**, per `dist/schemas/latest.json`, repository at commit `f1a35ab`.

## What does a governance agent do?

Governance is the largest protocol area in AdCP by operation count. The 3.1.10 registry puts **22 of the 64 registered operations** under `governance`, which is more than the Media Buy area (11) and more than Creative (8).

They fall into four groups:

| Group                            | Operations                                                                                                                                                   | Count |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Campaign governance              | `sync_plans`, `check_governance`, `report_plan_outcome`, `get_plan_audit_logs`                                                                               | 4     |
| Property lists                   | `create_`, `get_`, `update_`, `delete_`, `list_property_lists`                                                                                               | 5     |
| Collection lists                 | `create_`, `get_`, `update_`, `delete_`, `list_collection_lists`                                                                                             | 5     |
| Content standards and inspection | `list_`, `get_`, `create_`, `update_content_standards`, `calibrate_content`, `validate_content_delivery`, `get_media_buy_artifacts`, `get_creative_features` | 8     |

`docs/protocol/required-tasks.mdx` marks all four campaign governance operations Required for a governance agent, and marks the property-list and collection-list CRUD sets Required as well. The role heading "Governance agent" appears three times on that page, once per governance sub-protocol.

The control loop in one pass: the orchestrator proposes a plan through `sync_plans`; the governance agent validates each planned action through `check_governance` before the orchestrator proceeds; the seller also calls `check_governance` before processing a media buy and, per the FAQ, cannot "override a governance decision or modify budgets"; the orchestrator, not the seller, reports acceptance and delivery through `report_plan_outcome`; and every decision lands in an immutable entry retrievable through `get_plan_audit_logs`.

The audit trail lives with the governance agent, not the seller. AdCP is explicit that a seller "is **not** required to maintain or hand over a governance audit-log store."

## How does a seller find the governance agent?

Through `sync_governance`, one of the five operations in the Accounts area. The seller receives the governance agent's endpoint and credentials when the account is synced. Credential rotation is the same path: re-sync the account with updated authentication, and the new configuration replaces the prior one.

Governance agents also publish an [agent card](/agents/agent-card/). `docs/governance/property/specification.mdx` states that governance agents expose capabilities at `.well-known/agent-card.json`.

Approvals travel as signed tokens. A `governance_context` is carried per the AdCP JWS profile so a seller can verify authenticity and freshness without trusting the buyer's assertion.

## What the governance agent does not guarantee

AdCP says this itself, and it is the most useful sentence on the whole surface:

> `check_governance` is a seam, not an enforcer. A seller that has not configured a governance agent, or a misconfigured one, will not call `check_governance` at all — the protocol does not prevent a non-conformant seller from transacting.

Two more limits are worth carrying into any procurement conversation.

**The campaign surface is experimental.** The FAQ labels campaign governance (`sync_plans`, `check_governance`, `report_plan_outcome`, `get_plan_audit_logs`) an "AdCP 3.0 experimental" surface, and sellers implementing it "declare `governance.campaign` in `experimental_features`." A published operation in the registry is not the same as a settled one.

**Schema-level enforcement covers three categories.** AdCP names `fair_housing`, `fair_lending` and `fair_employment` as regulated categories with schema-level enforcement. Every other regulated category, including political, pharmaceutical, gambling and financial promotions, "relies on the governance-agent implementation." The protocol defines where the check happens. What the check decides is the implementer's problem.

The wider question of what neither stack standardises is covered on the [Agentic Ad Lab hub](https://agenticadlab.noetis.dev/guides/what-agentic-ad-protocols-dont-standardize/).

## Does AAMP have a governance agent?

No. The string "governance agent" returns zero files across all eight IAB Tech Lab agentic repositories.

AAMP's nearest analogue is operator gating inside the [seller agent](/agents/seller-agent/): a human operator moves a counterparty's trust status to `approved` or `preferred`, or to `blocked`, and that status caps the buyer's access tier. That is counterparty admission control, not campaign policy validation. There is no plan object, no pre-execution validation call, and no separately-operated approver in the AAMP corpus.

So the honest framing is not "AdCP's governance is stronger than AAMP's." It is that AdCP has specified a governance seam and named its limits, and AAMP has not specified one at all.

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Operation counts from `dist/schemas/3.1.10/index.json`; role requirements from `docs/protocol/required-tasks.mdx`; the three-party structure and the "seam, not an enforcer" quotation from `docs/trust.mdx`; the definition, seller obligations, audit-trail ownership and experimental status from `docs/faq.mdx`.
- The AAMP comparison is drawn from `IABTechLab/seller-agent` at `v2.4.1`, commit `2bb7ebc`, which is a reference implementation rather than a ratified specification.
