---
title: 'Agentic Buying in the Specifications'
description: 'What the AdCP and AAMP source files actually say about agentic buying: one FAQ line, no glossary entry, and zero occurrences anywhere in the IAB Tech Lab corpus.'
answer: "Agentic buying is the campaign-layer half of agentic advertising: an AI agent discovering inventory, negotiating terms and booking a media buy. No specification defines it. The only in-corpus definition is one line in AdCP's FAQ."
pubDate: 2026-08-09
term: 'Agentic Buying'
alternateNames: ['agentic media buying']
category: 'agentic'
cluster: gl-adcp
keywords:
  - 'what do the specs call agentic buying'
  - 'is agentic buying defined in a specification'
  - 'adcp agentic buying'
  - 'agentic buying source'
citations:
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/seller-agent'
related:
  - '/concepts/agentic-advertising/'
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://whatisagenticbuying.noetis.dev/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Agentic Advertising', 'Ad Context Protocol', 'AAMP', 'Media Buy']
reviewState: cto-reviewed
---

## Which specification defines agentic buying?

No specification defines agentic buying. The phrase has exactly one definitional appearance across both corpora, and it is in an FAQ answer where AdCP is positioning itself against a rival.

`docs/faq.mdx:141`, under the question "How does AdCP compare to AAMP?":

> Put simply: **AAMP is agentic bidding; AdCP is agentic buying.**

Two lines later the same answer stamps itself: "As of April 2026". That stamp is doing real work, because the comparison table underneath it describes AdCP's maturity as "3.0 GA (released April 2026)" while the version oracle at `dist/schemas/latest.json` now reads `3.1.10`. The framing has not been refreshed since it was written.

AdCP's own glossary declines to formalise the term. All 123 bolded entries in `docs/reference/glossary.mdx` were parsed; neither "agentic buying" nor "agentic bidding" is among them. The specification defines `create_media_buy`, `get_products` and a Media Buy object. It does not define the marketing category those operations sit in.

## Does AAMP use the term agentic buying?

No. Grepping all eight IAB Tech Lab repositories in the AAMP corpus for "agentic buying" or "agentic bidding" across markdown, Python, TypeScript and JSON returns zero hits.

This is worth stating carefully, because the AdCP FAQ line asserts a claim about AAMP that AAMP has never made about itself. IAB Tech Lab's agent repositories describe what they do in terms of orders, quotes, negotiation rounds and deals. The seller agent's README calls itself "an AI-powered inventory management system for publishers and SSPs to automate programmatic deal negotiation, booking, and distribution". The word "bidding" is not the frame it chose.

So the "AAMP is agentic bidding" half of the line is one standards body's characterisation of another's, published by the first, and unendorsed by the second.

## What does agentic buying refer to in practice?

The useful content in the FAQ line is the layer split, which is checkable against both corpora even if the labels are not.

|              | Impression layer                                           | Campaign layer                           |
| ------------ | ---------------------------------------------------------- | ---------------------------------------- |
| Time budget  | Sub-200ms, one auction                                     | Hours to weeks, one campaign             |
| AdCP surface | Trusted Match Protocol (`context_match`, `identity_match`) | Media Buy, Creative, Signals, Governance |
| AAMP surface | ARTF bid-request mutation                                  | Quote, negotiation, deal booking         |
| Typical unit | One bid request                                            | One media buy or one deal                |

"Agentic buying" points at the right-hand column. A buyer agent reads a brief, discovers inventory, agrees terms and books. AdCP's FAQ also notes what the split implies: a single `create_media_buy` can spawn thousands of impression-layer events, so campaign-layer agentic buying does not replace the auction, it sits above one.

For the answer-shaped version of this question, with the full sequence of calls, see [whatisagenticbuying.noetis.dev](https://whatisagenticbuying.noetis.dev/). This page only records what the source files say.

## What is agentic buying's counterpart in the AAMP stack?

There is no counterpart term. There are counterpart objects. What AdCP calls a media buy, AAMP's shared wire contract calls an Order with Lines; what AdCP handles by publishing pricing options on a product, AAMP handles with a Quote and a multi-round negotiation. Every mapping, including the rows where one side has nothing, is on the [AdCP and AAMP terminology lookup](/concepts/adcp-vs-aamp-terminology/).

Remember the provenance asymmetry. The AdCP objects come from a published, versioned schema registry. The AAMP objects come from reference implementations and a library that says it is not yet released.

## What is agentic buying confused with?

**Agentic buying is not agentic commerce.** Commerce protocols cover checkout and payment inside an AI assistant. Agentic buying is media procurement.

**Agentic buying is not "programmatic with an LLM on top".** The distinction the specifications draw is about who holds the context and what unit is being transacted, not about whether a model is in the loop. A dashboard with a chat box is not agentic buying by any definition either corpus offers.

**Do not cite "AAMP is agentic bidding" as neutral.** It is a dated line from one party's FAQ. If you need it, quote it with its source and its April 2026 stamp, as this page does.
