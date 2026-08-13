---
title: 'The Autonomy Ladder for Agentic Media Buying'
description: 'Five rungs between read-only reporting and unattended spend, each mapped to the AdCP or AAMP field that enforces it, and what a live sales agent actually implements.'
answer: "The autonomy ladder is the five rungs between an agent that only reads your delivery data and one that moves money unattended. Vendors sell rung placement as a buyer-set dial; it is set by whichever counterparty's implementation is loosest."
pubDate: 2026-08-12
cluster: 'autonomy-boundary'
keywords:
  - 'how much autonomy to give ai agent media buying'
  - 'human in the loop agentic advertising'
  - 'ai agent approval workflow media buying'
  - 'agentic buying guardrails'
citations:
  - 'https://reddit.com/r/adops/comments/1rh8wyx/what_workflows_are_you_actually_automating_this/'
  - 'https://reddit.com/r/adops/comments/1sbvr8v/i_made_a_google_ads_plugin_for_claude_cowork_it/'
  - 'https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/'
  - 'https://digiday.com/marketing/marketers-put-up-guardrails-as-ai-agents-reshape-programmatic-buying/'
  - 'https://digiday.com/media-buying/why-duluth-trusts-ai-agents-with-bidding-but-not-brand-storytelling/'
  - 'https://github.com/adcontextprotocol/adcp/issues/6381'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/update-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/media-buy-action-mode.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/governance-mode.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/escalation-severity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/cancellation-policy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/account.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/account/sync-governance-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/task-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/calling-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/governance/embedded-human-judgment.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/governance/annex-iii-obligations.mdx'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/pipelines/approval.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/flows/deal_booking_flow.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/state_machine.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/guides/budget-pacing.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/pacing/engine.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/engines/negotiation_engine.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/DecisionRecord.json'
related:
  - '/guides/adcp-registry-measured/'
  - '/guides/who-is-running-agentic-buys/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/protocols/adcp-vs-aamp/'
  - 'https://adtechglossary.com/agents/governance-agent/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://aampexplorer.com/negotiation/'
reviewState: cto-reviewed
faq:
  - question: 'What is the safest rung to start an agentic media buying pilot on?'
    answer: 'Read-only. Agents that pull delivery data, normalise it across platforms and flag anomalies carry no spend risk, and every practitioner account of a working deployment in the r/adops thread below starts there. AdCP has no read-only mode on the wire, so you enforce it with key scoping.'
  - question: 'Can a seller see that a human approved my buy?'
    answer: 'Not today. Buyer-side approval happens inside your own orchestration, before create_media_buy is called, and leaves no trace on the wire. An open AdCP RFC filed on 11 August 2026 proposes carrying it as a signed claim in the governance token.'
  - question: 'Which protocol field caps how much budget an agent can move on its own?'
    answer: 'AdCP campaign governance plans carry budget.reallocation_threshold: the amount above which a reallocation must be escalated to a human. Set it to 0 and every reallocation needs approval. The field is on sync_plans, and the governance surface is still marked experimental.'
---

Every vendor deck in this category lands on the same sentence: humans set the rules, agents operate within them. Nobody publishes the rules. Five rungs sit between reading your campaign data and moving your money, and each one is enforced, or not enforced, by a specific field. Those fields invert the framing. Autonomy is not a dial the buyer sets. It is a property of whichever counterparty's implementation is loosest, and the buyer usually can't see it.

An ad ops lead put the question to r/adops directly:

> How much trust do you put in these new AI agents to execute optimizations and shift budgets, or are you also just using them as reporting assistants? What's a part of the process that is NEVER going to be taken by AI?

The top reply:

> we automate the boring plumbing, data pulls, normalization, anomaly alerts, basic pacing dashboards, because that's repeatable and easy to QA at scale. budget shifts and bid changes stay human since context like client politics, promo timing, and platform quirks still matter a lot.

## The five rungs

| Rung          | What the agent may do                                          | What breaks if it is wrong                                       | How you undo it                              | Wire mechanism                                                                                                                    |
| ------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1. Read       | Pull delivery, forecasts, product catalogues; normalise; alert | A wrong number in a client deck                                  | Resend the deck                              | None. Your own key scoping, plus MCP `readOnlyHint` where a seller sets it                                                        |
| 2. Propose    | Assemble the exact buy and stop before the write               | Nothing. No spend committed                                      | Discard the draft                            | `paused: true` on `create_media_buy`. The gate itself is buyer-local                                                              |
| 3. Envelope   | Mutate a live buy inside tolerances the seller declares        | Over-delivery on the wrong package at your own CPM               | `update_media_buy` mid-flight                | `available_actions[].mode: conditional_self_serve`; `budget.reallocation_threshold`                                               |
| 4. Post-hoc   | Commit spend; findings logged, not blocked                     | A weekend of budget in the wrong place                           | Pause, then argue about the cancellation fee | Governance `mode: advisory`, reported not set; `PACING_HOLD` in IAB Tech Lab's buyer agent, which is reference code               |
| 5. Unattended | Reallocate freely up to the plan total                         | The cap is the only thing between the agent and the whole budget | Nothing below the cap                        | `budget.reallocation_unlimited: true`; `floor_price` and round caps, which are seller-agent constants rather than protocol fields |

The fourth column matters more than the second. Between rungs 3 and 4 the undo stops being a keystroke and becomes a contract negotiation.

Two dials are in play in that table and only one of them is a ladder. Rungs 1, 2, 3 and 5 grade how much the agent may write. Rung 4 grades when a human looks, and post-hoc review attaches to any rung above the first: a plan can carry unlimited budget reallocation and still escalate every targeting decision, and conflating the two dials is the most common misreading of this layer.

## Picking a rung

Start at 1. Move up only when the next rung's entry condition — a tolerance document, a cancellation policy that is not `full_commitment`, a declared aggregation window — is true of the specific buy in front of you.

Then adjust for the account. [Duluth Trading](https://digiday.com/media-buying/why-duluth-trusts-ai-agents-with-bidding-but-not-brand-storytelling/) hands bidding and creative iteration management to agents through its agency and its marketing director reports being comfortable with it. The risk profile of a bid adjustment on a retail account is not that of a pharmaceutical campaign at Bayer, whose digital media activation lead told Digiday's Programmatic Marketing Summit in May 2026, "I want a person overseeing the bot."

## Rung 1: read-only is where nearly everyone is

A wrong read costs you a correction. That's the whole risk, and it is where every practitioner in that thread reported shipping. A TeqBlaze engineer: "Anything involving pacing, budgets, or major decisions - still remains fully human." When a marketer posted an open-source plugin letting Claude reallocate budget through the Google Ads API, the first reply was one line: "The official Google ads mcp server is read only." One line from one reply is the closest thing there is to a public statement of where a large platform put its own connector.

AdCP has no read-only mode for production data. `account.sandbox` looks like one and does something else, marking "a sandbox account — no real platform calls, no real spend," a separate test account returning fake delivery. Rung 1 is pulling real delivery and alerting on real anomalies, so sandbox cannot express it.

What holds this rung is out-of-band. Your credential is scoped to discovery and reporting calls, and nothing in the request or the response says so. The one machine-readable hint is MCP's `readOnlyHint` annotation, and [of the 13 registered agents that answer `tools/list`](/guides/adcp-registry-measured/) only three set it. Every agent exposing `create_media_buy` leaves it blank, so a client cannot tell a read from a write by inspection.

## Rung 2: propose the diff, spend on a second call

A tool author in the same thread put up a proposal and asked practitioners to shoot it down:

> i'd automate reads, normalization, anomaly checks and draft actions. for spend-changing writes, i'd let the agent prepare the exact before/after but require a second call with identical args. that's the line i'm testing in adport; i'm the author and would love adops people to tell me where the approval gets too annoying.

The shape is right. Approving "shift 15% from CTV to display" is not the same act as approving the twelve-field object that shift turns into, and a second call with identical arguments makes the human's approval refer to the object. Every buy with a spend-changing write in scope belongs here, whatever anyone's maturity model says, and it costs you one extra call.

AdCP doesn't give you this. There is no `dry_run` on `create_media_buy`; the only `dry_run` in the media-buy domain of 3.1.13 sits on `sync_catalogs`, which is inventory housekeeping. The nearest affordance is `paused: true` on `create_media_buy`, which commits you contractually and then withholds impressions.

Issue #6381 on the AdCP repository, filed 11 August 2026, states the gap exactly:

> Today the only way to honor this is inside the buyer's own agent orchestration — simply not calling `create_media_buy` until a human clicks approve. That gate is invisible to the counterparty, can't be verified by a heterogeneous partner, and leaves no shared record.

Rung 2 is real, widely intended, and lives entirely off the wire: your approval log and your seller's booking log are disconnected silos. The RFC proposes having the governance agent mint a `human_approval` claim, with an opaque `approver_ref`, inside the signed token that already travels with the buy.

AAMP's buyer agent ships rung 2 as a default, in code, and the default fails closed: `wait_for_approval` times out after 3600 seconds, an unseen request silently becomes a rejection, and the campaign stalls rather than errors, which means it stops without paging anyone. `ApprovalConfig` in `models/campaign_brief.py` has four booleans: `plan_review` and `booking` default to `True`, `creative` and `pacing_adjustment` to `False`. Plan and spend gated, creative and pacing not, which is close to what the thread describes.

Those defaults answer the tool author's question about where approval gets too annoying, and the answer is milder than the fear. Pacing adjustment, the high-frequency stage, is ungated, so approval volume scales with deals booked rather than with days the campaign runs: a ten-line plan costs a couple of clicks at the front and nothing after until somebody changes the plan.

Check two things before citing the config as a standard. `check_approval_required` is called nowhere outside the approval module; the flow that books deals, `flows/deal_booking_flow.py`, has its own hard-coded stop at `AWAITING_APPROVAL` plus an `approve_all()` method, and the `CampaignBrief` class that flow consumes, in `models/flow_state.py`, carries no `approval_config` field. The repository has two brief classes and one gate config, and the config is attached to the class the booking flow does not use.

## Rung 3: the mode is on the wire, the numbers are not

This is the rung the market is selling: the agent operates freely inside a pre-agreed boundary and escalates outside it. AdCP models it properly, giving each action a seller allows on a buy a mode from a three-value enum. The column that matters is the third.

| Mode                     | What the seller does with your mutation                                             | Can you predict the outcome before you call?       |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| `self_serve`             | Honours it synchronously, no approval                                               | Yes                                                |
| `conditional_self_serve` | Auto-approves inside declared tolerances, escalates outside them                    | No. The tolerances are not on this surface         |
| `requires_approval`      | Puts a human on its own side in the loop, asynchronous, resolved by poll or webhook | Yes, in the sense that the answer is always "wait" |

The middle value is where programmatic guaranteed lives, and the mode description names FreeWheel, Magnite and GAM as the platforms "where small mutations clear automatically but large ones queue for human review." The same description then concedes the problem:

> Constraint metadata defining the tolerances is out of scope for v1 [...] until #4425 lands, tolerances are declared out-of-band and buyers cannot statically predict which mutations will auto-approve from this surface alone.

An envelope whose edges you can't read is a surprise with paperwork on it, and your agent finds the edge by trying, in production, on a live guaranteed buy. So the entry condition for this rung is a document rather than a field: the seller's `conditional_self_serve` tolerances, in numbers, in writing. If nobody has sent you one, you are on rung 4 with extra steps.

The third mode deserves more than the joke, because publisher-direct sellers will live on it. `requires_approval` is "human-in-the-loop, asynchronous, no proposal artifact," and the call returns `status: 'submitted'` with a `task_id` covering "long-running execution (hours to days)," resolved by polling `tasks/get` or by webhook. No schema carries a deadline: no expiry on a pending approval, no field for how long the seller's operator has, no terminal state for a request nobody opens. The clock that decides when a pending approval has gone stale has to live in your own orchestration, and somebody has to be paid to watch it.

The buyer-side half is better specified. A campaign governance plan pushed through `sync_plans` carries `budget.reallocation_threshold`: "Amount above which budget reallocations require human escalation. The orchestrator can reallocate spend across sellers, channels, or purchase types up to this threshold per change without asking a human [...] set to 0 to require approval for every reallocation." A numeric autonomy dial denominated in the plan's currency, and the single field here I would most want an agency to fill in deliberately. Both of the `check_governance` schemas that consume it, request and response, carry `"x-status": "experimental"`.

AdCP reads "per change" literally. An agent under a `reallocation_threshold` of 5,000 moves 4,999 as often as it likes. The defence sits on a different surface: `get_adcp_capabilities` lets a governance agent declare an `aggregation_window_days`, the trailing window over which it sums committed spend before testing any dollar threshold. Without it, the schema warns, "a buyer can split a single large spend into many sub-threshold commits across plans / task surfaces / time and bypass every dollar-gated escalation," and silence implies nothing: absence "indicates the governance agent has not committed to any aggregation window and buyers MUST assume per-commit evaluation only." Ask for the declared window before you pick a threshold, because against an agent that declares none the number you set caps one change and nothing else.

AAMP's envelope parameters constrain your own agent and nobody else's, because none of them are asserted to the seller: `DealPreferences.max_cpm`, `FrequencyCap` as a `max_impressions` plus `period_hours` pair, and `PacingModel` with four values (`EVEN`, `FRONT_LOADED`, `BACK_LOADED`, `CUSTOM`).

## Rung 4: spend first, review after

AdCP's governance mode enum is the cleanest description of this rung in either corpus. `audit` always returns approved, `advisory` returns findings but does not block ("Human reviews happen post-hoc"), `enforce` blocks. Escalation severity sits alongside it with three values, of which two gate behaviour: `warning` means "agent may proceed but human should review within a deadline," `critical` means "agent must not proceed until human approves." The third, `info`, is "logged for audit, no action required."

Neither enum is a control a buyer can set. Both appear only on responses: `mode` on `check_governance_response` and `get_plan_audit_logs_response`, severity on those plus `report_plan_outcome_response`. No request field carries either, and the mode description says what it is for, letting "counterparties, regulators, and auditors distinguish whether a finding blocked execution (enforce) or was logged silently (audit)." You configure the mode inside your own governance agent, and the wire reports which one was in force once it no longer matters.

What makes rung 4 expensive is the contract underneath it, not the protocol. `cancellation-policy.json` gives sellers a `notice_period` and a `cancellation_fee` whose type may be `full_commitment`: "buyer owes the full committed budget regardless of delivery." Canceled buys cannot be reactivated. Post-hoc review of a guaranteed buy means reviewing something you may have to pay for either way, so the rung is only defensible on a buy whose cancellation policy is something other than `full_commitment`.

Henry Webster of Kelly Scott Madison put the fear in the form every agency lead will recognise, at Digiday's Programmatic Marketing Summit in May 2026: "Would it blow a quarter's worth of budget in a weekend?"

The nearest thing to an answer is thinner than it looks, and it is not in AdCP. IAB Tech Lab's buyer agent declares a campaign state called `PACING_HOLD`, distinct from a manual `PAUSED`, with legal transitions `ACTIVE → PACING_HOLD` labelled "automated pacing deviation threshold" and `PACING_HOLD → ACTIVE` labelled "deviation resolved, auto-resume." Separately, `pacing/engine.py` measures deviation against configurable thresholds, 10% for a warning and 25% for critical in both directions, and on breach emits a `PACING_DEVIATION_DETECTED` event and returns a `PacingAlert`.

Nothing joins the two. Outside `models/state_machine.py` and a status-string map in `storage/campaign_store.py`, `PACING_HOLD` appears nowhere in the source, and no code performs the transition. The pacing guide hedges to match, saying the state machine "can transition" the campaign. The industry's strongest automated brake on this rung is an unwired enum sitting next to a detector that files a report, and 25% is a critical alert threshold rather than a hold trigger.

Above rung 3, AAMP has nothing at all: no governance mode, no escalation severity, no automated hold. Rungs 4 and 5 are an AdCP-only conversation. What an AAMP buyer gets instead is `DecisionRecord`, an audit object carrying a `DecisionActor` whose `kind` discriminates `human` from `machine`, plus rationale, policy refs and a `money_effect`. It records who decided and why, after the fact, and it is never embedded on a Deal, Order or Quote, so it documents the spend without being able to interrupt any of it.

## Rung 5: unattended, inside a cap

AdCP has a field for declaring this on purpose. `budget.reallocation_unlimited: true` is mutually exclusive with `reallocation_threshold`, and the schema says why it exists rather than letting you set the threshold to the total: "Use this for deliberate full-autonomy declarations rather than setting `reallocation_threshold: total` (which silently tightens when `total` changes)." Someone thought about the failure mode where a budget cut quietly revokes an autonomy grant.

`plan.human_review_required` is orthogonal to the money dial and the buyer can't switch it off. When a resolved policy carries `requires_human_review` the governance agent must set the flag: "A buyer cannot opt out of human review by omitting the flag." It exists for GDPR Article 22 and EU AI Act Annex III verticals, which is why the money dial and the review dial move independently of each other.

On the sell side, rung 5 is already the default in the reference code. Any publisher deploying IAB Tech Lab's seller agent unmodified has put price negotiation on rung 5 while their buy-side counterpart is still arguing about rung 2. Its negotiation engine accepts, counters or walks away with no human in the path, guarded only by a `floor_price` and a per-tier round limit: three rounds and an 8% total concession cap for a public buyer, six rounds and 20% for a known advertiser.

## Which rung a live sales agent actually enforces

Schemas describe what a seller may implement. Whether one did is a separate question, and Cora AI, at `sales-agent.coraai.org/mcp` and whose [product catalogue is measured elsewhere](/guides/adcp-registry-measured/), is the one AdCP sales agent that answers anonymously. Of the 24 tools it publishes, one carries a governance surface, and the buying surface is missing three fields this ladder depends on while publishing a required-field list that went from five to zero.

| Field                              | In AdCP 3.1.13                                           | On the live agent |
| ---------------------------------- | -------------------------------------------------------- | ----------------- |
| `create_media_buy.paused`          | Present                                                  | Absent            |
| `create_media_buy.plan_id`         | Present, required when the account has governance agents | Absent            |
| `update_media_buy.revision`        | Present, optional, optimistic concurrency                | Absent            |
| `create_media_buy` required fields | 5                                                        | 0                 |

`sync_governance` binds a governance agent to an account, so it is the wire path every control on rungs 3 through 5 arrives by. On this agent it takes `accounts` as an array of bare untyped objects with no inner structure published at all, and requires only `accounts` where AdCP 3.1.13 also requires `idempotency_key`, so the deduplication key that stops one retry firing two approval flows is optional.

This agent publishes populated schemas elsewhere: 20 properties on `create_media_buy`, 18 on `get_products`, `media_buy_id` marked required on `update_media_buy`. `docs/protocol/calling-an-agent.mdx` warns that some AdCP MCP servers publish no per-tool parameter schemas at all, where "every tool shows `{type: 'object', properties: {}}`", and this is not one of those. The absences are chosen, and so is the empty required list, which is the worst line in the table. A `create_media_buy` that requires nothing accepts a call with no budget, no dates and no packages, and whatever happens next is decided somewhere the buyer cannot see.

The missing fields cost specific rungs. Rung 2's book-it-paused move is unavailable. So is binding the buy to a governance plan, which is how `reallocation_threshold` and `human_review_required` reach the seller at all. And without `revision`, two agents, or an agent and a human, can both write to the same buy with no conflict detection: sellers MUST reject on a revision mismatch, but only when the buyer sends one, and this schema has nowhere to put it.

Run the same check against whatever agent you are buying from: send `initialize`, then `notifications/initialized`, then `tools/list`, and read each `inputSchema`. Those schemas tell you which rung that seller can hold you to.

## Why the dial belongs to the counterparty

I trust the practitioners in that r/adops thread over the vendor framing, because agreeing the rules turns out to be the hard part and they are the only people describing it. The TeqBlaze engineer running an AdCP sales agent pilot reported that "the challenge is getting teams to agree on the rules before the system runs. If goals or limits are vague, the agent simply scales that ambiguity faster." A publisher replying to him: "most publisher teams can't even agree on their floor prices lol. we spent 3 weeks just trying to get sales and ops to align on what a 'good deal' looked like."

Every mechanism above fails in the same direction, and what is left when they fail is whatever each counterparty happened to implement.

AdCP's own governance documentation is closer to those practitioners than its vendors are, and it has the same problem. Its central idea, escalate when confidence is insufficient for the risk, has no wire representation, because no field lets a buyer declare a confidence threshold.

So run the ladder against the counterparties you actually trade with, one at a time.

## Five questions for the vendor call

1. Which rung does your default configuration sit on, and which field sets it?
2. If the agent proposes a spend-changing write, what exactly do I approve: a sentence, or the payload?
3. Does my approval leave any record the seller can verify, or only a row in your database?
4. For `conditional_self_serve` actions, what are the tolerances, in numbers, in writing?
5. What is your `reallocation_threshold` default, what aggregation window is it evaluated over, and does it reset when I change the campaign total?

Question 4 decides which rung you are actually on, and the answer has to come back in numbers and in writing before the buy goes live.
