---
title: 'Preflight Checklist: What to Agree Before You Turn On a Sales Agent'
description: 'Eleven commercial decisions a publisher team settles before an AI sales agent quotes on its behalf, each with the answer format that counts as settled and the field that carries it.'
answer: 'Run this preflight before a sales agent quotes for you: settle floors, minimum deal size, discount authority, sign-off thresholds, and which agents may sell your inventory. Every answer must be a number or a name with an owner.'
pubDate: 2026-08-12
cluster: 'internal-agreement-preflight'
keywords:
  - 'what to agree before turning on an ai sales agent'
  - 'publisher floor price agent rules'
  - 'agentic advertising readiness checklist'
  - 'sales agent preflight checklist'
  - 'publisher agent approval gates'
citations:
  - 'https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/'
  - 'https://reddit.com/r/adops/comments/1uvbbne/vox_media_ran_a_full_sellside_deal_negotiated/'
  - 'https://www.exchangewire.com/blog/2026/01/14/agentic-ad-tech-confusion-revolution-or-evolution/'
  - 'https://digiday.com/sponsored/the-state-of-agentic-advertising/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/pricing-options/cpm-option.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/exclusivity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/creative-policy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/cancellation-policy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/measurement-terms.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/signal-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/config/settings.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/events/approval.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
related:
  - '/'
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - '/examples/ctv-guaranteed-launch/'
  - 'https://adtechglossary.com/agents/sales-agent/'
  - 'https://adcpexplorer.com/discovery/'
  - 'https://agenticadlab.com/'
faq:
  - question: 'What has to be agreed before a publisher turns on an AI sales agent?'
    answer: 'Eleven answers, each a number or a name with an owner against it: floors per product and currency, minimum deal size, discount authority, exclusions, what exclusivity costs, which products exist, whether a package can be subset, which signals are published, delivery and billing commitments, sign-off thresholds, and which agents may sell your inventory.'
  - question: 'What happens if we skip this and just switch the agent on?'
    answer: "Somebody else's defaults become your commercial policy. Four come from the AdCP product schema, including non-exclusive products and no buyer subsetting. Six come from the IAB reference seller agent, including a 5.00 CPM floor and automatic approval of any buyer agent listed in the registry."
  - question: 'Is this checklist useful if we are not deploying an agent?'
    answer: 'Yes. The output is a rate and rules document with a named owner on every row, and nothing in it depends on deploying an agent. It is the same set of answers a person on the phone needs.'
reviewState: cto-reviewed
---

Settle these eleven questions before a sales agent quotes on your behalf, and write the answers down. Every row here is something a buyer's `get_products` call will ask your agent about, so this is the sell-side mirror of composing a brief. Copy the table below into a sheet and add two columns: the name of the person who owns each answer, and the date it gets looked at again. Every answer has to be a number or a name, because an agent cannot act on "we don't discount much".

## Who has to be in the room

Three roles have to be present:

- Whoever sets rates.
- Whoever runs the ad server.
- Legal. Legal signs the lawful basis on each published signal and nobody else can.

Name a tie-breaker per row before you start, usually whoever carries the revenue number. When sales and yield hold different floors and neither moves, take the lower number, mark it provisional, put a date 30 days out against it, and move on.

TeqBlaze, announcing free AdCP sales agent testing on [r/programmatic](https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/):

> "So far the automation part works, but the challenge is getting teams to agree on the rules before the system runs. If goals or limits are vague, the agent simply scales that ambiguity faster."

## The eleven decisions

| Decide                                     | A settled answer looks like                                      | Where it lands                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| The floor, per product, per currency       | "18.00 USD on CTV guaranteed, 6.50 USD on display RoS"           | `floor_price` or `fixed_price` on each pricing option               |
| Minimum deal size                          | "No package below 25,000 USD"                                    | `min_spend_per_package`, also on each pricing option                |
| Discount authority                         | "Down to 12% off rate card without a human; below that it stops" | Vendor config; AdCP carries the result in `price_breakdown`         |
| Advertiser and category exclusions         | A named list                                                     | Your ad server, not the protocol                                    |
| What exclusivity is worth                  | "Category lock adds 35%, sole sponsorship doubles it"            | `exclusivity`: `none`, `category` or `exclusive`                    |
| Which products exist                       | Named packages with inventory attached                           | `product.json` entries: id, name, description, properties, pricing  |
| Whether a buyer can take a package apart   | "CTV bundle is all-or-nothing; display is subsettable"           | `property_targeting_allowed`, `collection_targeting_allowed`        |
| Which first-party signals are published    | A list, each with a lawful basis and a country list              | `signals[]` in `/.well-known/adagents.json`                         |
| What you commit to on delivery and billing | "70% viewable to MRC, IVT under 2%, DV counts"                   | `performance_standards`, `measurement_terms`, `cancellation_policy` |
| Who signs off, above what number           | A value threshold with a named approver against it               | Approval gates in your seller agent                                 |
| Which agents may sell your inventory       | A named list                                                     | `authorized_agents` in `/.well-known/adagents.json`                 |

AdCP's `adagents.json` comes in two forms: a pointer file carrying `authoritative_location`, or the inline form, which requires exactly one property, `authorized_agents`. That last row is the only thing the file format insists on.

## What applies if you skip the meeting

Until you replace them, these defaults are your commercial policy. Four are AdCP schema defaults. Six come from the IAB reference seller agent's `settings.py`, and a commercial vendor may ship entirely different numbers.

| The decision you did not make        | What applies instead                                    | Where it comes from                                                           |
| ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Exclusivity                          | Every product is non-exclusive                          | AdCP product schema: exclusivity "defaults to 'none' when absent"             |
| Buyers subsetting a package          | Not allowed; all-or-nothing                             | AdCP product schema, `property_targeting_allowed`, default false              |
| Buyers selecting signals             | Not allowed; signals are bundled into the product terms | AdCP product schema, `signal_targeting_allowed`, default false                |
| Delivery commitments                 | None; no structured performance standards apply         | AdCP product schema, `performance_standards` absent                           |
| Floor CPM                            | 5.00 in the default currency                            | IAB seller agent `settings.py`                                                |
| Minimum deal value                   | 1,000 in the default currency                           | IAB seller agent `settings.py`                                                |
| Preferred-deal discount ceiling      | 15%                                                     | IAB seller agent `settings.py`                                                |
| Human approval on a proposal         | Off                                                     | IAB seller agent `settings.py`, `approval_gate_enabled: bool = False`         |
| Approval above a deal value          | No threshold                                            | IAB seller agent `settings.py`, `approval_required_above_value: float = 0.0`  |
| A buyer agent listed in the registry | Approved automatically                                  | IAB seller agent `settings.py`, `auto_approve_registered_agents: bool = True` |

## Floors, minimums and discount authority

Assume every deal clears at the floor. Set it at your walk-away price.

Set it per product and per currency. Two currencies on the same product means two pricing options, each carrying its own floor and its own minimum, so decide both twice rather than converting one number at the last minute.

Minimum deal size stops the agent booking a 400 USD guaranteed order that costs more to traffic than it earns. Discount authority is how far below rate card the agent may go on its own. Say which one it does at the edge of that range: "it stops and asks" holds the deal open until someone reads the queue, and "it declines" ends it.

## Exclusivity and package structure

A product in AdCP is a commercial package: an id, a name, a description written for a machine to match a brief against, the properties it covers, and its pricing options. Which packages exist, and what each one includes, is a decision the agent inherits from you.

Two decisions per package. Can a buyer buy part of it, or is the bundle the product? And what does exclusivity cost, at each of the two levels above `none`? Price both levels before a buyer asks for one, because category lockout commits future revenue.

An ad ops practitioner on [r/adops](https://reddit.com/r/adops/comments/1uvbbne/vox_media_ran_a_full_sellside_deal_negotiated/), on a fully agent-negotiated sell-side deal:

> "The 2-minute deal automated trafficking and IO paperwork. That was never the job with a lot of value. Someone still needs to decide what packages exist, what the exclusivity is worth, and which first-party data is exposed to agents. Agents execute deals. They don't decide which deals deserve to exist."

## Advertiser and category exclusions

AdCP has no advertiser blocklist.

A product's `creative_policy` requires exactly three things, a co-branding requirement, a landing page requirement, and whether templates are available, and none of the optional fields it also carries is a list of advertisers either. `enforced_policies` holds registry policy IDs the seller enforces, which is a different mechanism with a different scope. So your list stays in the ad server or the order management system, and somebody has to own keeping it aligned with what the agent is out there offering. Name that person in the meeting.

## Published signals

Publishing a signal means declaring, on the record, where the data came from, the lawful basis you process it under, and which countries it may be used in. The schema is explicit that a seller must not expose a signal for media buys in countries outside the list declared on it. (`data_sources`, `consent_basis`, `restricted_attributes` and `countries` are four of the 31 fields a signal definition carries.)

Decide two things: which signals are published at all, and who signs the lawful basis on each. Both answers belong to legal rather than to yield.

## Delivery, measurement and cancellation

Viewability, IVT and completion thresholds sit in `performance_standards`. Who counts the billing metric, and what remedy applies when a threshold is breached, sit in `measurement_terms`. Settle whose number wins in advance. Two verification vendors measuring the same campaign will not report the same figure, and `measurement_terms` is where you say which one bills.

AdCP's `cancellation_policy` requires exactly two things, a notice period and a cancellation fee, and a buyer accepts both simply by booking against the product. Whoever signs off on revenue recognition owns that row.

## Approval gates and timeouts

Write down the value above which a proposal needs a person, and name that person. Name a deputy for each approver.

Your counterparty has gates of its own. In the IAB buyer agent, `ApprovalConfig` gates plan review and booking by default and leaves creative and pacing adjustments ungated, which tells you how much of the other side of your deal has nobody watching it.

An approval request in the seller agent expires 24 hours after it is raised, and once expired it can't be decided at all: the code marks it `TIMED_OUT` and rejects the decision. Nothing emits an expiry event. The status flips the next time someone tries to decide the request or lists the pending queue, so an expired approval is found by polling. Name who reads the pending queue outside working hours.

## Check that it landed

Two checks, neither of which needs more than an engineer and a terminal:

- Fetch your own `/.well-known/adagents.json` and read it. The authorised agent list and the published signals should match the sheet, name for name, with no extra rows.
- Run one `get_products` call against your own agent and read the response. Floor, minimum spend, exclusivity and the two targeting flags should come back as decided.

Run both again after any vendor change.

## Where to go next

- [See what a `get_products` request contains](/) — the buy-side mirror of this exercise, and the object a buyer's agent sends you.
- [What belongs in a brief and what belongs in filters](/spec/brief-vs-filters/) — how buyers are told to split the same decisions.
- [Publisher discovery files](https://adcpexplorer.com/discovery/) — the `adagents.json` fields the last row of the table lands in.
