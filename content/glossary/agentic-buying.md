---
title: 'Agentic Buying'
description: 'Agentic buying is machine-to-machine media procurement: a buyer agent and a seller agent agree a media buy across product discovery, pricing, creative, signals and governance.'
answer: 'Agentic buying is media procurement performed by software agents: a buyer agent and a seller agent discover, price and agree a media buy, so the unit transacted is a booked buy rather than an impression won at auction.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Agentic Buying'
alternateNames: ['agentic media buying']
category: 'agentic'
cluster: gl-stacks
keywords:
  - 'what do the specs call agentic buying'
  - 'is agentic buying defined in a specification'
  - 'adcp agentic buying'
  - 'agentic buying agentic bidding'
  - 'adcp faq aamp comparison'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/decision-makers/l1-agentic-advertising.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/docs/faq'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Order.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Deal.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/README.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
related:
  - '/concepts/adcp/'
  - '/agents/buyer-agent/'
  - '/agents/seller-agent/'
  - '/concepts/aamp/'
  - '/concepts/agentic-advertising/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/media-buying/media-buy/'
  - '/negotiation/quote/'
  - 'https://whatisagenticbuying.com/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Agentic Advertising', 'Ad Context Protocol', 'AAMP', 'Media Buy', 'Quote']
reviewState: cto-reviewed
---

Agentic buying is media procurement performed by software agents. A [buyer agent](/agents/buyer-agent/) states what a campaign needs, a [seller agent](/agents/seller-agent/) replies with products and prices, and the two agree a [media buy](/media-buying/media-buy/) without human intervention at each step. The unit that changes hands is a booked buy agreed between two parties rather than an impression won against a bid.

[AdCP](/concepts/adcp/)'s FAQ gives the term its only definition in either specification corpus, with the same scope: "how a buyer agent and a seller agent negotiate, transact, and govern a media buy across product discovery, pricing, creative, signals, and governance."

That same answer draws the line between the two agentic advertising stacks — "AAMP is agentic bidding; AdCP is agentic buying" — a characterisation AdCP qualifies as "based on AAMP materials published to date", alongside "we do not yet publish a formal technical comparison because AAMP is still defining its normative surface". Neither phrase appears in the [AAMP](/concepts/aamp/) repositories, and AdCP's glossary carries neither the term nor [agentic advertising](/concepts/agentic-advertising/).

## Where the context sits at decision time

In AdCP's training material for decision makers, programmatic "sends thin signals out to a remote bidder without context", while agentic advertising "brings rich data in to the platform that holds the context and generates the response". A bid request carries a page URL, a device type and perhaps an identifier; the retailer, the CTV app or the assistant receiving it already holds the basket, the purchase history and the session. Agentic buying pushes brand rules, goals and product catalogue into that party instead of pulling a thin request out of it.

An end-to-end walkthrough of the transaction, before any protocol vocabulary, is at [whatisagenticbuying.com](https://whatisagenticbuying.com/).

## Where each stack sits relative to the auction

|                                          | AdCP 3.1.13                                | AAMP corpus                                       |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Operations                               | 64                                         | 143                                               |
| Serve-time operations                    | 2 (`context_match`, `identity_match`)      | 1 (`GetMutations`, ARTF)                          |
| Shared object schemas                    | published registry, `dist/schemas/3.1.13/` | 48, in `iab-agentic-primitives`                   |
| Repositories the stack's own index lists | one, the schema registry                   | six on the hub README, of which one is serve-time |

AdCP's total is one release; the AAMP total spans nine independently versioned repositories, so the totals are not equivalent. What compares is the share of each stack that runs at serve time: two operations of 64 on one side, one of 143 on the other.

Both of AdCP's impression-layer operations belong to the [Trusted Match Protocol](/realtime/trusted-match-protocol/). None of the 48 schemas in AAMP's shared wire contract describes a bid; they describe Order, Line, [Quote](/negotiation/quote/), Deal, Negotiation, Proposal, ChangeRequest and RateCard. `Order.json` describes itself as a "Campaign container (insertion order) holding one or more lines", and the seller agent's README describes that project as "An AI-powered inventory management system for publishers and SSPs to automate programmatic deal negotiation, booking, and distribution using IAB Tech Lab standards." The only bid-shaped field in those 48 schemas is `bidfloor`, on `Deal.json` and on the booking response that embeds it, which "adapters translate to the raw OpenRTB float ... at the DSP edge". AdCP's FAQ describes the same relationship when it says one `create_media_buy` can spawn thousands of impression-layer events.

[ARTF](https://aampexplorer.com/repos/agentic-rtb-framework/) is the one AAMP repository the agentic-bidding label fits and the only AAMP artifact stamped Version 1.0 FINAL, while `iab-agentic-primitives`, the repository carrying those 48 schemas, is neither linked from the hub README nor released. Both reference agents pin it as their wire contract. Whether that makes AAMP a [bid-request mutation](/realtime/rtb-mutation/) stack or a booking stack is argued at [Agentic Ad Lab](https://agenticadlab.com/protocols/adcp-vs-aamp/).

## What agentic buying is not

Google's Universal Commerce Protocol (UCP) and the Agentic Commerce Protocol (ACP) from OpenAI and Stripe standardise payment and fulfilment inside AI assistants; neither books media, and AdCP's FAQ files them under commerce in a separate answer. A conversational front end on a demand-side platform is a separate case: agentic buying requires a machine counterparty rather than a machine interface, and a chat window over a DSP leaves the buy assembled and executed by the same system, with the human in the same place.

The two object vocabularies — media buy, or Order and Line — are set side by side on the [terminology map](/concepts/adcp-vs-aamp-terminology/).
