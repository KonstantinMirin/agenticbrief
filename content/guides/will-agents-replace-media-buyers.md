---
title: 'Will Agents Replace Media Buyers? Role by Role'
description: 'Six ad roles read against what AdCP 3.1.13 and the AAMP seller agent actually implement: which tasks a protocol both carries and decides, which it carries but leaves to you, and what is left.'
answer: 'Agents will not replace media buyers. AdCP and AAMP automate the tasks their schemas both carry and decide: creative sync, pacing writes, counter-offers, IO paperwork. Tasks where a person still supplies the number, the floor or the policy stay human.'
pubDate: 2026-08-12
cluster: 'career-impact'
keywords:
  - 'will ai replace media buyers'
  - 'ad ops jobs agentic advertising'
  - 'programmatic trader career agentic'
  - 'ai burnout marketing team'
  - 'agentic advertising jobs'
citations:
  - 'https://reddit.com/r/adops/comments/1uvbbne/vox_media_ran_a_full_sellside_deal_negotiated/'
  - 'https://reddit.com/r/adops/comments/1r8jfob/will_claude_code_replace_performance_marketers/'
  - 'https://reddit.com/r/programmatic/comments/1u7z8az/ai_vibe_check/'
  - 'https://reddit.com/r/adops/comments/1ry60h7/what_parts_of_the_ops_process_do_you_think_would/'
  - 'https://reddit.com/r/adops/comments/1qgoxwk/mapping_our_ad_opscampaign_workflow_publisher/'
  - 'https://github.com/adcontextprotocol/adcp/issues/6381'
  - 'https://github.com/IABTechLab/seller-agent/issues/51'
  - 'https://github.com/IABTechLab/seller-agent/issues/57'
  - 'https://www.einpresswire.com/article/916606885/boostr-and-vox-media-execute-landmark-agentic-adcp-media-buy-signaling-a-new-era-for-automated-advertising'
  - 'https://digiday.com/media/the-case-for-and-against-agentic-media-buying/'
  - 'https://digiday.com/marketing/digiday-programmatic-marketing-summit-may-recap-how-marketers-are-navigating-agentic-ad-buying/'
  - 'https://ppc.land/magnite-ceo-caps-2027-agentic-ad-spend-near-700m-as-ai-cuts-contractor-tasks/'
related:
  - '/guides/autonomy-ladder/'
  - '/guides/who-is-running-agentic-buys/'
  - '/guides/adcp-registry-measured/'
  - '/guides/how-a-machine-buys-media/'
  - '/protocols/adcp-vs-aamp/'
  - 'https://adcpexplorer.com/areas/media-buy/'
faq:
  - question: 'Which ad tech role is most exposed to agentic buying?'
    answer: 'The trafficker. AdCP sync_creatives takes a bulk creatives array with idempotency_key, dry_run and delete_missing, which covers upload, assignment and reconciliation. The residual work is judging what the seller sends back, since the creative status machine stops at pending_review and an approved creative can be pulled back into that queue mid-flight.'
  - question: 'Is there anything a protocol cannot automate?'
    answer: 'Yield policy. AdCP sales agents can generate a priced product from a brief, flagged is_custom with an expires_at, so product authoring is partly machine work already. What no operation in either corpus sets is the floor, the discount ladder and the exclusivity terms that generation prices against.'
  - question: 'Are agentic tools making ad ops work lighter right now?'
    answer: 'Not for the people posting about it. The r/programmatic AI vibe check thread describes agent rollouts as a second job, and the top reply reports doing far more work than before with no reduction in responsibility. Running the agents is currently additive to the role, not subtractive.'
reviewState: cto-reviewed
---

Agents are not going to replace media buyers, and the useful question is which half of your week they take. An agent will hold a floor. It won't tell you the floor is wrong.

Almost everything you do is already a field in somebody's schema, and only some of those fields have a decision procedure behind them. That is the sort: a task is going when the protocol carries the value and decides it, and it stays yours when the protocol carries the value and a person still has to supply it.

AdCP's `core/product.json` is where the split first shows. `pricing_options`, `exclusivity` and `signal_targeting_allowed` are properties of a product, all read by `get_products`, and `signal_targeting_allowed` defaults to `false`, so signals stay bundled into product terms unless a publisher deliberately opens them. Nothing in 3.1.13 is a buyer-facing write against a product.

With one exception anyone in a pricing role should know about, because it is the closest thing in either corpus to automating a task that looks like it stays yours. `is_custom` is a product field, documented as `true` if the product was generated for a specific brief and paired with an `expires_at`; AdCP's product documentation calls these "dynamically generated products," and the worked example there carries `is_custom: true` on the same object as a `floor_price` of $5.00 and a `price_guidance` of p50 $8.00, p75 $12.00. Machines do author priced products, on demand, today. What they do not do is decide the yield policy they price against. Custom products move product authoring from per-deal to per-policy, and the per-policy version is the better-paid one.

A publisher-side operator on r/adops, [reacting to news that Vox Media had run a sell-side deal negotiated agent to agent](https://reddit.com/r/adops/comments/1uvbbne/vox_media_ran_a_full_sellside_deal_negotiated/):

> "The 2-minute deal automated trafficking and IO paperwork. That was never the job with a lot of value. Someone still needs to decide what packages exist, what the exclusivity is worth, and which first-party data is exposed to agents. Agents execute deals. They don't decide which deals deserve to exist."

## Which of your own tasks is on the path?

Take your week and sort it: does a protocol carry the value and decide it, or carry the value and wait for you?

| Your task                                                           | Operation pointed at it                             | Verdict |
| ------------------------------------------------------------------- | --------------------------------------------------- | ------- |
| Uploading and assigning creatives                                   | `sync_creatives` (AdCP only)                        | Going   |
| Budget, pacing and bid changes                                      | `update_media_buy` / `package-update`               | Going   |
| Building the IO and the deal record                                 | `POST /api/v1/quotes`, `/deals`, `/orders`          | Going   |
| Sending a counter-offer                                             | `POST /proposals/{id}/counter`                      | Going   |
| Pulling delivery and pacing reports                                 | `get_media_buy_delivery`, `get_media_buys`          | Going   |
| Assembling a product against a specific brief                       | `is_custom` products, priced by the seller          | Going   |
| Applying tier discounts and volume adjustments                      | the AAMP pricing engine                             | Going   |
| Setting the base rate card and the floors                           | `PUT /api/v1/rate-card`, values supplied by you     | Yours   |
| Deciding what a package contains and what exclusivity is worth      | none                                                | Yours   |
| Deciding which first-party signals agents may target                | `signal_targeting_allowed`, default `false`         | Yours   |
| Approving a creative, and holding the queue when one is pulled back | stops at `pending_review`; `impairment` on reversal | Yours   |
| Judging whether a returned product actually matches the brief       | `brief_relevance`, which nothing verifies           | Yours   |
| Handover, ownership, escalation, makegoods                          | none                                                | Yours   |
| Deciding whether the campaign was worth running                     | `performance_index`, which nothing computes         | Yours   |

Six roles carry those rows: trafficker, trader, planner, ad ops manager, account executive, yield analyst.

## If your week is search and paid social

The question that brings a lot of people here came from r/adops: [will Claude Code and similar tools "eventually replace performance marketers, or will they just make great performance marketers even more powerful?"](https://reddit.com/r/adops/comments/1r8jfob/will_claude_code_replace_performance_marketers/) Neither protocol answers it. AdCP's `channels` enum does contain `search` and `social`, there is a `sales-social` specialism defined as a "social media advertising platform with self-service flows," and `package-update` even carries `keyword_targets_add` and `negative_keywords_add` — all of it addressed to a publisher's sales agent. The self-service auction accounts where a performance marketer's day happens are not sales agents, do not speak MCP, and are not party to either specification: the AdCP registry's sales side is publishers, SSPs and ad networks, and nothing named Google, Meta, Amazon or TikTok is in it. Whatever automates that job ships from inside those platforms, on their schedule, with no schema you get to read first.

The test still transfers. Inside Performance Max or Advantage+, the tasks with a decision procedure behind them went years ago. What is left is the brief, the budget split, the creative call and the judgement about whether the reported number means anything, which is the same list as everyone else's.

## Trafficking is the strongest case, and it stops at pending_review

The trafficker is the most exposed role here and I'd say so to anyone hiring into one, though not on AAMP's account. AAMP models creatives and gives you no way to move them. The seller agent's core models define `Creative`, `CreativeManifest`, `CreativeAsset`, a `ReviewStatus` of pending, approved and rejected, a `RotationMode`, and an `Assignment` that "links creative to placement with rotation rules." None of the 74 paths in the seller agent's OpenAPI document mentions a creative, so a buyer's agent cannot hand a creative to an AAMP seller at all. That part stays in email.

AdCP is where the job goes. `sync_creatives` takes an array of creative assets plus `assignments`, an `idempotency_key`, `delete_missing`, `dry_run` and `validation_mode`: bulk upload, package assignment, and reconciliation of a library against a source of truth, in one call, safely retryable. The tag-sheet reformatting an r/adops poster built a GPT for, [because doing it in Excel "would also introduce the risk of manual errors"](https://reddit.com/r/adops/comments/1ry60h7/what_parts_of_the_ops_process_do_you_think_would/), is the task it was designed to delete.

Where the two stacks disagree is on whether creative approval is human work at all. AdCP's `creative-status` enum has six values, and the interesting ones are the reverse transitions: an `approved` creative can be sent back to `pending_review`, to `suspended` on a recoverable authorization loss, or to `rejected` on post-approval revocation, and in the last two cases sellers MUST surface an `impairment` against any active media buy referencing it. A creative can be pulled back into the queue mid-flight, on somebody else's policy call, while money is running.

AAMP's answer to the same question is its change-request model, which maps `ChangeType.CREATIVE` to `ChangeSeverity.MINOR`, and `docs/api/change-requests.md`, which marks minor changes auto-approved with "creative swap" as its example. One protocol treats a creative change as a live risk to an in-flight buy; the other waves it through as low impact. Which one your counterparty implemented decides whether you staff a review queue at all.

[Boostr's announcement of the Vox deal](https://www.einpresswire.com/article/916606885/boostr-and-vox-media-execute-landmark-agentic-adcp-media-buy-signaling-a-new-era-for-automated-advertising) has Lauren Winter, Vox Media's head of advertising operations, saying her team "simply accepted the buy and verified it in their ad server to launch the campaign." That is a vendor press release about the vendor's own launch deal: evidence the deal happened, and a record of what the parties chose to claim.

## The trader's daily loop

`update_media_buy` carries a `packages` array of `package-update` objects, and a `package-update` has `budget`, `pacing`, `bid_price`, `impressions`, `start_time`, `end_time`, `paused`, `optimization_goals`, `targeting_overlay`, `keyword_targets_add` and `negative_keywords_add`. Read that list next to what a trader does between nine and six. It's a complete description of daily optimisation, it fits in one payload, and the request carries an optimistic-concurrency `revision` that sellers must reject on mismatch, so two agents can't clobber each other.

The r/adops poster who said they [used to spend two hours a day "manually tweaking CPMs and budgets across 40+ line items to hit delivery targets"](https://reddit.com/r/adops/comments/1ry60h7/what_parts_of_the_ops_process_do_you_think_would/) was describing `budget` and `bid_price` on a loop. I don't think that survives, and I wouldn't spend career capital defending it.

`provide_performance_feedback` is the counterexample in the same protocol. It carries a `performance_index` from buyer back to seller, and nothing in AdCP computes that index or decides whether the campaign it summarises was worth running. Carried, not decided. Emily Proctor of OMD, [at Digiday's Programmatic Marketing Summit](https://digiday.com/marketing/digiday-programmatic-marketing-summit-may-recap-how-marketers-are-navigating-agentic-ad-buying/), said the quiet part for anyone two years into this job: the skill being automated is the same skill that qualifies you to supervise the automation, so having "those manual skills, or at minimum understanding what it takes to get it done manually" stays essential.

## What a planner still owes the response

Amy Porter of RPA, an agency that has actually run an agentic buy, told Digiday there is a ["real risk they could also obscure critical decision-making if advertisers rely too much on AI."](https://digiday.com/media/the-case-for-and-against-agentic-media-buying/) She is describing a governance problem and I'd call it a QA problem, which is a demotion and also a promotion: nobody writes a policy that catches this, and one person running one check does.

Three of the 23 agents in the public AdCP registry answer an anonymous `get_products` with a product array: Cora AI, Equativ and No Fluff Advisory. Cora AI returns the same four products to a US CPG connected-TV brief, to a German-language B2B podcast brief specifying audio only, and to a brief one character long. Those four are Korean FAST CTV and Korean display, carrying `countries: ["KR","US"]`. Each product's `brief_relevance`, which `core/product.json` defines as "Explanation of why this product matches the brief," reads "Matched against buyer brief:" followed by the brief echoed back. These are small catalogues, one to five products, two of them self-labelled demo or interop, and on a catalogue of four, returning everything and matching everything are indistinguishable until the brief is meaningless. The [full sweep is here](/guides/adcp-registry-measured/).

So make the check standing rather than occasional. Send every agent you are asked to trust a brief its inventory cannot possibly match, then read `countries`, `publisher_properties` and `delivery_type` on what comes back; an agent that returns its whole catalogue to a one-character brief is one you gate or drop, not one you put in front of a planner. Opacity is what happens when nobody runs that check before a response becomes a plan.

The operation underneath is real capability. `get_products` accepts a natural-language `brief` and a structured `filters` object and returns products with `brief_relevance`, `forecast` and `pricing_options`, so a planner can put a campaign in prose to a dozen sellers and get structured availability back, in fields, on the same call. What comes back is a claim. A planner who reads it as a shortlist has been handed someone else's inventory.

## Ad ops management is the role with no operations at all

Take the workflow an ad ops lead at a mid-sized publisher [posted to r/adops while mapping their team's process](https://reddit.com/r/adops/comments/1qgoxwk/mapping_our_ad_opscampaign_workflow_publisher/): pre-sale feasibility and packaging, campaign handover, chasing missing assets and approvals, QA across sites and devices, delivery troubleshooting, post-campaign wrap and makegoods. Their stated pain was "a lot of time lost to 'who owns this bit' and 'where do I find the source of truth'."

Neither protocol has anything for that. I'd put this role at the bottom of the exposure list, because the coordination an ad ops manager does all day is what both stacks assume has already happened by the time a request goes out. AdCP's governance layer has `check_governance`, `sync_plans`, `get_plan_audit_logs` and `report_plan_outcome`, which record whether a spend was authorised against a declared plan. Ownership, escalation, handover and makegood policy are modelled nowhere. The one open RFC in the area, [adcp#6381](https://github.com/adcontextprotocol/adcp/issues/6381), asks that buyer-side human approval at least travel as a claim in the governance token. It has not shipped.

The headcount question is not settled here either, and it will not be settled by a schema. If the agents remove the hours and your scope of work is priced in hours, the answer gets written into a remuneration negotiation between a client and a holding company, which is why the holding companies have the strongest incentive of anyone to make this work and the least incentive to publish what it did to their staffing.

## The AE's negotiation is a state machine, and a retry can spend your rounds

AAMP's seller agent is where negotiation actually lives. `POST /proposals/{id}/counter` evaluates a buyer's offer, appends a round to a persisted `NegotiationHistory` and emits a `NEGOTIATION_ROUND` event, bounded by a `max_rounds` budget of three to six depending on the buyer's tier. `POST /api/v1/quotes`, `/deals`, `/orders` and `/api/v1/change-requests` cover the rest of the paper trail. The IO is an API call now, and if your week is IO throughput, that week is going.

The machinery is young in a way that matters commercially. The newer entry point, `POST /api/v1/negotiations/messages`, takes a shared `NegotiationMessage` that inherits a required `idempotency_key` and returns a 422 without it. [seller-agent#51](https://github.com/IABTechLab/seller-agent/issues/51) showed that nothing reads it: two identical posts, same key, same body, minted two rounds and spent two units of a budget that starts at three. That issue is closed. On v2.4.1 the negotiation service that mints those rounds contains no reference to `idempotency_key` at all. A closed issue and an unread field live in the same repository, so the way anyone finds out is a client retrying a timed-out counter and walking a real deal into a rejection it never intended.

Greg Langer of Havas Media Network, at the same Digiday summit, on what agents bring to a negotiation: "There's no human emotion in it. They don't know the relationship." What that leaves an AE is the half of the week that was never in the paperwork, plus an obligation nobody has staffed: watching a state machine spend rounds on your behalf.

## Yield analysis: the rate card is a PUT nobody prices from

The yield analyst's split is the cleanest of the six. The tiering and the discount ladder are code. The base card and the floors are a human PUT.

AAMP's seller agent exposes `GET` and `PUT /api/v1/rate-card`. The `PUT`'s description: "Publishers should update this when their ad server rate cards change. The pricing engine uses these values as base prices before applying tier discounts and volume adjustments."

In the reference implementation nobody has supplied a rate card, and nothing would read one if they had. The `PUT` writes a storage key `rate_card:current`, and `src/ad_seller/flows/deal_request_flow.py`, which actually prices a deal, never reads that key. Its `apply_tiered_pricing` step holds two literals instead: a five-entry price table (`display` 12.0, `video` 25.0, `ctv` 35.0, `mobile_app` 18.0, `native` 10.0) and a tier discount table topping out at fifteen per cent for an advertiser-tier buyer. The endpoint that writes the rate card and the code that prices a deal do not share a variable.

The consequence has already been reported. In [seller-agent#57](https://github.com/IABTechLab/seller-agent/issues/57), a contributor showed that `POST /api/v1/deals/curated` accepts an arbitrary `product_id` with no existence check and no auth dependency, falls back to the hardcoded twelve-dollar default, and mints a persisted deal with `status: "confirmed"`. His reproduction typos one letter of a real product priced at $45 base and $35 floor, and gets a live deal at $13.20 total CPM. The function's own docstring promises "never a fabricated price." The yield analyst's failure mode is not a floor that gets missed. It is a floor that is confidently wrong and enforced at machine speed, on every deal, until somebody reads the number.

## What is shipped, what is registered, what is running

A schema is not a deployment, and the distance between the two is most of your risk calculation. AdCP 3.1.13 is the current stable release with every operation named here in the box and the AAMP seller agent is on v2.4.1; the public AdCP registry listed 23 agents on 12 August 2026, of which thirteen completed an anonymous MCP handshake, six exposed `get_products` to an unauthenticated caller, three returned a product array and two of those three catalogues are self-labelled demo or interop by their operators; and eight named deployments have actually transacted since December 2025, with nearly every number attached to them published by a company that sells agentic software. That [ledger is its own page](/guides/who-is-running-agentic-buys/).

Read the middle number carefully, because it is easy to over-read. Gating discovery behind authentication is a defensible choice and plenty of sellers will make it deliberately, so the funnel measures how open the registry is rather than how real it is. A catalogue its own operator labels a demo is a different matter.

The most optimistic 2027 forecast anyone has collected, from Magnite's chief executive Michael Barrett [in July 2026](https://ppc.land/magnite-ceo-caps-2027-agentic-ad-spend-near-700m-as-ai-cuts-contractor-tasks/), is a rounding error against a single SSP's annual volume; the ledger page runs that arithmetic. The direction is settled and the timing is not, and anyone quoting you a number of months is guessing.

## The agents added a shift

Sorting tasks into going and staying assumes the agents are net subtractive from a workload. For the people posting about them, they aren't. The r/programmatic thread that asked ["Are we all burnt out from AI yet or is it actually helping anyone or anything?"](https://reddit.com/r/programmatic/comments/1u7z8az/ai_vibe_check/) opens with a complaint that internal rollouts are "actually exhausting and time consuming and feels like a second job," and the poster asks the career question directly: "Will my new job be creating/maintaining/managing AI agents instead of completing the work to service clients myself?"

The most-upvoted reply is not about the tools at all:

> "AI has enabled me to do a LOT more than I was doing a few years ago, which lead to massive increases in my salary... But it doesn't help me at all with the stress of being responsible for more, if that makes sense. Lately my best days at work are the ones where I've stopped caring."

That is the failure mode the protocols make more likely. Watching a round budget spend itself is new work. So is holding a creative queue that can reopen while money is running, and both land on the same people whose manual work was removed, with no published headcount model in which the two cancel.

One commenter in that thread puts programmatic roles that paid $160,000 to $190,000 two years ago at $110,000 to $140,000 now. It is a single anonymous data point and the only salary figure anywhere in these threads. The same commenter, further down the Vox thread: "We saw this movie with RTB. Everyone said programmatic would kill sales teams. It killed fax machines. The sellers who moved up the stack did OK."

So if most of your week sits in the Going block of that table, spend this quarter buying yourself one task from the Yours block: take the floor-setting off your yield lead, or own the QA pass on what a sales agent returns. Getting faster at the Going block is worth very little, because the thing getting faster is the thing being automated.
