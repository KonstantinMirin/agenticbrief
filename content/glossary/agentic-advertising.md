---
title: 'Agentic Advertising'
description: 'Agentic advertising is the category term for advertising run by AI agents. Neither AdCP nor AAMP defines it normatively. Here is what each corpus actually says, with file paths.'
answer: 'Agentic advertising is the category term for advertising workflows executed by AI agents rather than by humans operating dashboards. Neither AdCP nor AAMP defines it normatively; both use the phrase in positioning text and leave it undefined.'
pubDate: 2026-08-09
term: 'Agentic Advertising'
alternateNames: ['agentic ads', 'AI agent advertising']
category: 'agentic'
cluster: gl-adcp
keywords:
  - 'agentic advertising'
  - 'agentic advertising definition'
  - 'what is agentic advertising'
  - 'agentic vs programmatic advertising'
citations:
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/learning/decision-makers/l1-agentic-advertising.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/building/concepts/industry-landscape.mdx'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
related:
  - '/concepts/agentic-buying/'
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/sponsored-intelligence/'
  - 'https://whatisagenticbuying.noetis.dev/'
  - 'https://agenticadlab.noetis.dev/'
seeAlso: ['Agentic Buying', 'Ad Context Protocol', 'AAMP', 'Sponsored Intelligence']
reviewState: cto-reviewed
---

## Which specification defines agentic advertising?

None of them.

AdCP's published glossary carries 123 bolded term entries. Three of them begin with "Agentic": Agentic Commerce Protocol, Agentic eXecution Engine, and AgenticAdvertising.org, which is an organisation. There is no entry for agentic advertising itself (`docs/reference/glossary.mdx`).

The AAMP hub README does not define it either. Its closest sentence describes the umbrella as a framework "to support the evolution of agentic transactions within digital advertising ecosystems", which uses a different phrase and defines neither.

So the term is category vocabulary. Both standards bodies use it in positioning material, neither ratifies it, and no schema field anywhere in either corpus is named for it. If a vendor tells you their product is "AdCP-compliant agentic advertising", the second half of that claim is not checkable against anything.

## What does agentic advertising mean in practice?

The most usable working definition inside either corpus is in an AdCP training module rather than in the specification. `docs/learning/decision-makers/l1-agentic-advertising.mdx` states it as a data-flow inversion:

> programmatic sends a thin request out; agentic advertising brings your data in.

The module's expansion: a bid request carries a page URL, a device type and maybe a user ID out to a remote decision-maker that does not hold the conversation context. The AI platform closest to the user does hold that context. So the buyer pushes brand identity, rules, goals and product catalogue in, and the platform generates the response.

The same page quotes Ben Masse of Triton Digital, speaking at the egta CEO Summit, compressing the shift to three moves:

> From bidding to reasoning. From impressions to relationships. From milliseconds to months.

That is a good framing and it is also marketing. Note what it quietly concedes: the thing being described is a change in where the decision happens, not a new transport, a new auction, or a new measurement standard.

## How does agentic advertising differ from programmatic advertising?

|                 | Programmatic                            | Agentic advertising                                                    |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Who decides     | A remote bidder, per impression         | The platform holding the user context, or a pair of negotiating agents |
| What moves      | A thin bid request out                  | Catalogues, brand rules, goals and constraints in                      |
| Unit of work    | One impression, sub-second              | A campaign, a media buy, a negotiation                                 |
| Standard in use | OpenRTB, VAST, `ads.txt`                | AdCP 3.1.10, or the AAMP repositories                                  |
| Human role      | Configures a dashboard, then supervises | States intent, then reviews what an agent did                          |

The two do not replace one another. AdCP's own FAQ points out that a single `create_media_buy` call can spawn thousands of impression-layer events, so an agentic buy usually terminates in a programmatic auction.

## What is agentic advertising's counterpart in the other stack?

There is no counterpart, because there is no term to map. Both AdCP and AAMP use the phrase as an umbrella for what they are building, and both define the concrete objects underneath it instead. On the AdCP side those objects are media buy, package, product and signal; on the AAMP side they are order, line, product, quote and deal. The [AdCP and AAMP terminology lookup](/concepts/adcp-vs-aamp-terminology/) maps them one by one.

## What is agentic advertising confused with?

**Agentic advertising is broader than agentic buying.** Buying is the transaction half. Agentic advertising as used by AdCP also covers creative generation, signal activation, brand governance and conversational brand experiences. See [agentic buying in the specifications](/concepts/agentic-buying/).

**Agentic advertising is not agentic commerce.** The Agentic Commerce Protocol from OpenAI and Stripe, and Google's Universal Commerce Protocol, standardise checkout, payment and fulfilment inside AI assistants. Advertising is how an offer gets surfaced; commerce is what happens after someone accepts it. AdCP's glossary lists ACP and UCP as separate entries and calls them a complementary layer.

**"Agentic" is not a conformance claim.** Nothing in either corpus tests whether a system is agentic. What is testable is whether an implementation answers `get_adcp_capabilities` correctly, or whether it satisfies the storyboard bundle for a declared specialism. Ask for that instead.
