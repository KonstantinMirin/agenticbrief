---
title: 'What Is Agentic Buying?'
description: 'Agentic buying is a contested term. One specification defines it, inside its own FAQ, and the rival stack never uses the phrase. Here is the evidence, with file paths.'
answer: "Agentic buying is software agents transacting media on a buyer's behalf. No standards body has formally defined it. The only written definition sits in AdCP's own FAQ, which is one camp's positioning, stamped April 2026."
pubDate: 2026-08-09
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
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json',
    'https://github.com/IABTechLab/AAMP',
    'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/',
    'https://digiday.com/media-buying/wtf-ad-context-protocol/',
    'https://www.adexchanger.com/marketers/the-ad-context-protocol-aims-to-make-sense-of-agentic-ad-demand/',
  ]
related:
  [
    '/how-it-works/',
    '/agentic-buying-vs-programmatic/',
    '/maturity/',
    '/about/',
    'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/',
    'https://adtechglossary.noetis.dev/concepts/agentic-advertising/',
    'https://aampexplorer.noetis.dev/what-does-aamp-stand-for/',
  ]
reviewState: cto-reviewed
---

## Who has actually defined "agentic buying"?

One document has. The FAQ of the Ad Context Protocol, maintained by AgenticAdvertising.org, contains this sentence:

> Put simply: **AAMP is agentic bidding; AdCP is agentic buying.**

It sits at `docs/faq.mdx` line 141 in the AdCP repository, under the accordion heading "How does AdCP compare to AAMP?", and it is published at [docs.adcontextprotocol.org/docs/faq](https://docs.adcontextprotocol.org/docs/faq). I read the file. That is the whole formal definition of agentic buying in either standards stack.

Two things about that sentence matter more than the sentence itself.

It is one camp writing the other camp's job description. AgenticAdvertising.org stewards AdCP. IAB Tech Lab stewards AAMP. The sentence hands AAMP the impression layer and keeps the campaign layer, along with the word "buying", for AdCP. The same FAQ entry then says: "We do not yet publish a formal technical comparison because AAMP is still defining its normative surface." So the document that coins the split declines, in the next paragraph, to make the comparison formally.

And it is stamped. The comparison table under that sentence is introduced with the words "As of April 2026:". The authors dated their own claim, which is more honest than most of what has been written about this, and it means the definition you are reading is a snapshot of a fight, not a settled term.

## Does AdCP's own glossary define agentic buying?

No. AdCP publishes a glossary at `docs/reference/glossary.mdx`. I counted 119 term headings in it, 117 of them distinct, because "Signal Targeting Groups" and "Signal Targeting Rules" are each listed twice. The A section defines Account, Account Type, Audience, Audience Member, Audience Constraints, Audience Selector, Action Source, Activation, Ad Context Protocol, Agentic Commerce Protocol, Agentic eXecution Engine, AgenticAdvertising.org and Agent.

It does not define "agentic buying". It does not define "agentic advertising" either.

Across the entire `docs/` tree the phrase "agentic buying" appears three times, all three in `faq.mdx`, at lines 141, 147 and 195. A specification that formalises 64 operations in its published registry and writes 117 glossary entries has chosen not to formalise its own category label. That is a decision, not an oversight.

## Does the AAMP corpus use the phrase "agentic buying"?

No. Not once.

I ran `grep -ril "agentic buying"` across all eight IAB Tech Lab agentic repositories on disk: `AAMP`, `agentic-direct`, `buyer-agent`, `seller-agent`, `registry-agent-example`, `agentic-rtb-framework`, `agentic-audiences` and `iab-agentic-primitives`. Zero files matched.

The same grep for "adcp" also returns zero files. The AAMP corpus does not mention AdCP anywhere, in any repository, in any comment. The two stacks do not describe each other, which means every comparison you have read — this page included — is written from outside both of them by someone who does not sit on either working group. The zero-references finding is documented in full on [Agentic Ad Lab's AdCP vs AAMP page](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/).

## Where does the term "agentic buying" actually appear?

| Source                                        | Uses the phrase?    | Evidence                                                                      |
| --------------------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| AdCP FAQ (`docs/faq.mdx`)                     | Yes, 3 times        | Lines 141, 147, 195. Line 141 is the definition.                              |
| AdCP glossary (`docs/reference/glossary.mdx`) | No                  | 117 distinct terms, none is "agentic buying".                                 |
| AdCP published schema registry (3.1.10)       | No                  | 64 registered operations. The registry carries schemas, not term definitions. |
| AAMP hub README                               | No                  | The repository is a README and a licence.                                     |
| The other seven IAB agentic repositories      | No                  | `grep -ril` returns zero files across all of them.                            |
| IAB Tech Lab AAMP standards page              | Not as a definition | Uses "agentic advertising", not "agentic buying".                             |
| Trade press (AdExchanger, Digiday)            | Yes, freely         | Used as a category label, not defined against a spec.                         |

The pattern is clear enough. The phrase is a category label the press and the vendors use comfortably, that one specification body claims in a single positioning sentence, and that no normative document anywhere defines.

## So what is a working definition of agentic buying?

Here is the one I will defend, with its limits attached.

Agentic buying is the practice of a software agent, acting for an advertiser, discovering and transacting media against another software agent acting for a publisher, over a machine-readable protocol, without a human filling in the booking form.

Three things that definition deliberately does not do.

It does not name a protocol. AdCP is the stack with the most published surface: version 3.1.10 is the current stable release per `dist/schemas/latest.json`, and its registry lists 64 operations. AAMP is a set of reference implementations across eight repositories with no single version number. Neither owns the term.

It does not claim the seller is an AI model. Nothing in AdCP requires the agent on either end to be a language model. `get_products` accepts a natural-language `brief` string, and it also accepts structured `filters`. An agent that only ever sends filters is still an agent.

It does not claim the human is gone. AdCP's `check_governance` operation exists specifically so that a plan can be validated against budget and policy constraints before any campaign action runs, and it takes a required `caller` field naming who is asking. Approval gates are in the wire format.

## What is "agentic bidding", and is it different?

"Agentic bidding" comes from the same sentence in the same FAQ, and I can find it nowhere else that is not quoting that FAQ. It is meant to describe agents operating inside the real-time auction, at impression scale, rather than at campaign scale.

There is a real distinction underneath the coinage. IAB Tech Lab's Agentic Real-Time Framework, tagged `v1.0`, defines a protobuf `RTBRequest` carrying a `tmax` field, described in the proto as the maximum time in milliseconds the exchange allows for mutations to be received. That is auction-time work. AdCP's `create_media_buy` requires an `idempotency_key`, which is the signature of an operation you expect to retry over seconds or minutes. Different clocks, different failure modes.

But "agentic bidding" as a term has one author and one appearance. Treat it as AdCP's framing of AAMP rather than as AAMP's framing of itself.

## Is agentic buying the same as agentic commerce?

No, and the confusion is worth thirty seconds. Agentic commerce standards — the Agentic Commerce Protocol from OpenAI and Stripe, Google's Universal Commerce Protocol — handle checkout, payment and fulfilment when an assistant buys a product for a consumer. Agentic buying is an advertiser buying media inventory. AdCP's own glossary defines ACP as commerce and positions the handoff explicitly: its Sponsored Intelligence surface runs the brand conversation and hands to ACP or UCP at the point of purchase. Same adjective, different transaction, different counterparties.

## What would change this page?

The honest answer to "what is agentic buying" today starts with "nobody has ratified that". Three things would change it.

If IAB Tech Lab publishes a definition of agentic buying, or adopts the phrase in a tagged specification rather than a press release, there would be two definitions to compare instead of one to caveat. If AdCP promotes the term from its FAQ into its glossary, the definition becomes normative rather than positional. If a third party outside both camps — the IAB proper, an ISO working group, a trade body — writes one down, the term stops being contested.

None of that has happened as of 9 August 2026. I check the repositories rather than the announcements, and the [maturity page](/maturity/) is where I keep the running observation. If you want the sequence of protocol calls that sits behind the phrase, it is on [how it works](/how-it-works/).
