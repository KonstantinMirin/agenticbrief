---
title: 'What Is Agentic Buying?'
description: 'Agentic buying is software buying advertising from software. What it automates that programmatic never did, whether it needs a language model, and what it does to fees.'
answer: 'Agentic buying is software buying advertising from software: an agent representing the advertiser and an agent representing the publisher agree terms over a machine-readable protocol and book the campaign, with no human rekeying a brief or an insertion order.'
pubDate: 2026-08-09
updatedDate: 2026-08-12
cluster: 'wiab-term'
keywords:
  [
    'agentic buying',
    'what is agentic buying',
    'agentic buying definition',
    'agentic media buying',
    'ai agent media buying',
  ]
citations:
  [
    'https://docs.adcontextprotocol.org/docs/faq',
    'https://docs.adcontextprotocol.org/docs/reference/glossary',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json',
    'https://github.com/IABTechLab/AAMP',
    'https://github.com/IABTechLab/iab-agentic-primitives',
    'https://digiday.com/media-buying/butler-tills-first-agentic-media-buying-tests-cut-media-and-supply-chain-costs/',
    'https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/',
    'https://digiday.com/media-buying/that-is-an-objective-omnicom-tests-ai-agents-to-cut-out-the-ad-tech-middlemen/',
    'https://ppc.land/magnite-ceo-caps-2027-agentic-ad-spend-near-700m-as-ai-cuts-contractor-tasks/',
    'https://digiday.com/media-buying/wtf-ad-context-protocol/',
    'https://www.adexchanger.com/marketers/the-ad-context-protocol-aims-to-make-sense-of-agentic-ad-demand/',
  ]
related:
  [
    '/how-it-works/',
    '/agentic-buying-vs-programmatic/',
    '/maturity/',
    '/about/',
    'https://agenticadlab.com/guides/autonomy-ladder/',
    'https://agenticadlab.com/guides/who-is-running-agentic-buys/',
    'https://agenticadlab.com/guides/questions-to-ask-an-agentic-vendor/',
    'https://agenticadlab.com/guides/will-agents-replace-media-buyers/',
    'https://agenticadlab.com/protocols/adcp-vs-aamp/',
    'https://adcpexplorer.com/guides/adcp-registry-measured/',
    'https://adtechglossary.com/concepts/agentic-buying/',
  ]
reviewState: cto-reviewed
---

Agentic buying is software buying advertising from software. One program works for the advertiser and holds the campaign: the budget, the flight dates, the audience, what counts as success. Another works for the publisher and holds what is available and what it costs. The two exchange structured messages, settle the terms and book the buy, with nobody retyping a brief into a second system.

An agent here is a program with a mandate: allowed to ask for things and, inside limits somebody set in advance, allowed to commit to them. The commitment is the whole difference from the automation already sitting on the desk. A dashboard that recommends is not an agent. A script that books is.

Advertisers do have automation, and it stops in a specific place. Programmatic automated the auction and only the auction: one impression, one bid, decided in milliseconds, against a plan a person built in a spreadsheet weeks earlier.

Everything on either side of that auction is still people. The brief that goes out by email. The availability deck that comes back. The call about the rate, the insertion order, the trafficking sheet, the argument at the end of the month about whose numbers are right. Those are what agentic buying is aimed at, so the unit of the trade changes with it: programmatic settles one impression at a time, and an agentic buy settles a whole campaign. Whether that counts as a real change or a relabelling is [an argument the two standards bodies have already had in public](/agentic-buying-vs-programmatic/).

Campaigns have already run this way. Butler/Till and PubMatic bought connected TV for a beverage brand across two flights in December 2025 and January 2026. NBCUniversal, the agency RPA and FreeWheel put [a single premium video investment across linear and streaming through agents](https://www.freewheel.com/news/nbcuniversal-rpa-freewheel-and-newton-research-introduce-agentic-ai-buying-across-linear-and-digital-for-premium-video) in the first quarter of 2026, live NFL playoff inventory included. Both were announced by the companies that ran them.

## What the first campaigns saved came out of a fee, not out of a plan

The beverage brand in that first campaign was Geloso Beverage Group, and it is still the only advertiser anywhere to have put its name on an agentic buy. Agents did the planning and the execution off a written brief. A person at the agency signed off the curated inventory before anything ran.

The saving came from the plumbing rather than from the agents. The buyer's agent talks to the publisher's agent directly, so the demand-side platform that used to sit between them, and charge for sitting there, is not in the path at all. That is what the headline number measures. PubMatic's [case study](https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/) calls it roughly an 80% cut in buy-side costs and [Digiday puts it at 82% of DSP tech fees](https://digiday.com/media-buying/butler-tills-first-agentic-media-buying-tests-cut-media-and-supply-chain-costs/), with [the deployment ledger](https://agenticadlab.com/guides/who-is-running-agentic-buys/) setting the two side by side. Both figures are a percentage of what the intermediary charged, not of the media budget, so neither converts into money on its own. On your own account the conversion is simple enough: whatever your DSP charges you as a share of spend is the ceiling on what removing it can save.

Both of those figures came from the company that removed the fee, which is the norm rather than the exception. Nearly every number attached to agentic buying so far was published by a firm with something to sell.

One measurement on that campaign came from outside it, and it was about quality rather than cost. Digiday reported that the verification firm Jounce audited the inventory and put made-for-advertising junk, the sites that exist only to carry ads, below 1% of what ran. It is the only independently produced number in the story so far. Nobody outside the two companies has isolated how much of the cost saving the agents themselves earned. The budget was never disclosed, nobody ran the same money the old way alongside it, and those two things are what an honest test would have to supply. Omnicom told investors in April 2026 that shrinking the intermediary take is the objective, so the buy side is chasing the same fee the sell side just removed.

Publishers have their own version of the trade. In June 2026 a seller agent built by Boostr received, negotiated and closed a campaign-level buy for Vox Media covering budget, audience and delivery schedule, and Vox's ad operations team accepted it and checked it in the ad server. No performance figure was published, and the claim that hours of manual setup went away comes from [Boostr's own announcement](https://www.einpresswire.com/article/916606885/boostr-and-vox-media-execute-landmark-agentic-adcp-media-buy-signaling-a-new-era-for-automated-advertising).

If the take rate is the target, the next question lands on the agency: what happens to a retainer priced on the labour of executing buys, once the executing gets cheap?

The plan itself changes in one concrete way well before it changes in any grand one. The brief stops being a document a colleague reads and becomes an input a machine parses. "Premium environments, ideally CTV, sensible frequency" gets interpreted generously by a human planner and literally, or not at all, by a parser, so whoever writes the brief inherits more of the outcome than they used to.

Now the timing. The forecasts Magnite's chief executive gathered from the industry at Cannes topped out at [600 to 700 million dollars of agentic ad spend in the whole of 2027](https://ppc.land/magnite-ceo-caps-2027-agentic-ad-spend-near-700m-as-ai-cuts-contractor-tasks/). Magnite alone puts through more than 9 billion dollars of ad spend a year, so the optimistic industry-wide figure for 2027 amounts to four weeks of one company's pipe. There is no case for re-planning a 2027 budget around that. There is a case for one small test, and the reason is not efficiency: it is finding out where your own approval thresholds sit before a counterparty's defaults decide for you.

## Does agentic buying need a language model?

The obvious guess is that this means typing a campaign into a chatbot. It does not. "Agentic" is a claim about autonomy: who decides, who commits, inside what limits. Whether a language model is anywhere in the picture is a separate question. By that test a rules engine holding an API key qualifies, and a chat window that waits for a person to press send does not.

The protocol most live deployments run on says so in its own request format. AdCP, the Ad Context Protocol, asks a publisher what it can sell with a request that takes either a written brief or a structured filter: countries, channels, budget range, start and end date, creative format IDs, delivery type.

One field is required whichever of those two you send: a mode flag with three values, brief, wholesale and refine. It declares what kind of buying you are doing rather than what you want. In the two modes that are not brief, prose is not merely optional. The brief is forbidden outright. So a buyer that never sends a sentence of English is an agent by every definition the protocol itself uses, and the protocol has deliberately built the path that lets it be one.

That distinction has a commercial edge. A vendor demonstrating a conversational interface has shown you an interface, and whether anything behind it can transact is a different question, answerable against [the published operation list](https://adcpexplorer.com/operations/get-products/).

## Where the human sign-off actually sits

The call that books a campaign carries a key that stops the same order being placed twice, plus the account, the brand, a start time and an end time. Every machine-to-machine API worth using has that key. The account, the brand and the two dates rule out anonymous buying and open-ended commitments in one go.

Before that call, a pre-flight check asks about a media plan that already exists, and the caller has to identify itself. So an agent cannot conjure a campaign out of nothing: something authenticated has to point at a plan somebody already made. The wire format stops there. It never asks whether the somebody was a person, and by the definition above an agent has an identity too.

Every specification here leaves the amount of delegation to you, which makes the human gate a matter of your own policy rather than the protocol's. [The call sequence](/how-it-works/) shows where the decision points fall.

## One side of the argument coined the term

For a phrase this heavily used, the paper trail is one sentence, and it sits in [AdCP's own FAQ](https://docs.adcontextprotocol.org/docs/faq):

> Put simply: **AAMP is agentic bidding; AdCP is agentic buying.**

AAMP, the Agentic Advertising Management Protocols, is IAB Tech Lab's competing programme. Agentic bidding, in that sentence, means agents working inside the real-time auction, one impression at a time, on a clock measured in milliseconds. Agentic buying means agents working at campaign level, over minutes and days. That split is real.

One camp named both halves, and IAB Tech Lab has never used either label about itself, in either direction. AdCP is stewarded by AgenticAdvertising.org, which discloses that two of its four interim board seats are held by Scope3 people and that Scope3 donated both the foundational IP and the seed property registry. Scope3 sells agentic advertising products built on AdCP. The disclosure is more thorough than most standards bodies manage, and it still leaves the category's only written definition authored by a commercial participant about a competitor.

So "agentic buying" in a pitch points at no ratified document. Treat the adjective as marketing until the vendor names a protocol and a version.

## Agentic commerce is a different business

The two get mixed up constantly. Search the phrase and much of what comes back is Stripe, IBM, Shopify and PwC writing about an assistant completing a consumer checkout. That is agentic commerce: checkout, payment and fulfilment, on behalf of a shopper.

Agentic buying is an advertiser buying media from a publisher. The adjective is the only thing the two have in common, and they run on separate protocols.

They do meet, and the seam is written down. AdCP describes the Agentic Commerce Protocol (OpenAI and Stripe) and the Universal Commerce Protocol (Google, with Shopify, Walmart and Target) as the commerce layer that complements its own advertising layer. Its FAQ spells out the handoff: a Sponsored Intelligence conversation runs the brand experience inside an assistant, and when the user decides to buy, the host passes the session identifier to one of the commerce protocols, which owns the purchase from there.

## Three questions for a vendor who says "agentic"

The layer underneath the word is checkable, and three dull questions get you most of the way.

**Which protocol, and which version?** A good answer is a name and a number, such as AdCP 3.1.13. A weak one is "we support the agentic standards". An AAMP compliance claim needs a follow-up, because the repository carrying AAMP's shared wire schemas sits at v0.5.0 and unreleased, so in 2026 the claim is about membership rather than about a shipped contract. Both stacks move, and where each has got to is tracked at [maturity](/maturity/).

**Which operations have you implemented?** AdCP publishes a versioned schema registry with the request and response shape of every operation in it, so a good answer is a list of names whose payloads you can validate today. A demonstration is not a list.

**What can your agent do with no human in the loop?** Press on what it may spend unattended, whether it can approve inventory, and who can cancel. If the demonstration was conversational, ask which values of `buying_mode` it sends in production, because the two that are not `brief` carry no English at all.

One check needs no vendor at all. AdCP publishes a public registry of agents, and on 12 August 2026 it listed 23. Three of them handed an actual list of products to a caller with no credentials: Cora AI, Equativ and No Fluff Advisory. Two of the three send back the same catalogue whatever you ask for, including a brief one character long. Being listed is not the same as having implemented anything, and [the agent-by-agent results](https://adcpexplorer.com/guides/adcp-registry-measured/) are worth ten minutes before a vendor call.
