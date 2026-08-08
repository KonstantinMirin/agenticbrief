---
title: 'Sponsored Intelligence (SI)'
description: "Sponsored Intelligence is AdCP's protocol for advertising inside AI assistant conversations. Four operations, every schema marked experimental, and no counterpart anywhere in AAMP."
answer: "Sponsored Intelligence (SI) is AdCP's standard for conversational brand experiences inside AI assistants. AdCP 3.1.10 registers four SI operations, and every SI schema carries x-status experimental, so the surface can change inside the 3.x line."
pubDate: 2026-08-09
term: 'Sponsored Intelligence'
alternateNames: ['SI']
category: 'agentic'
cluster: gl-adcp
keywords:
  - 'sponsored intelligence advertising'
  - 'sponsored intelligence definition'
  - 'si_initiate_session'
  - 'adcp sponsored intelligence'
citations:
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/docs/3.1.6/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/docs/3.1.6/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/sponsored-intelligence/overview.mdx'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/concepts/adcp/'
  - '/concepts/agentic-advertising/'
  - '/concepts/aamp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.noetis.dev/areas/sponsored-intelligence/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Ad Context Protocol', 'Agentic Advertising', 'Brand Agent', 'Agent Card']
reviewState: cto-reviewed
---

## What is Sponsored Intelligence in AdCP?

AdCP's published glossary defines it in three sentences:

> An open standard for conversational brand experiences in AI assistants. Like VAST defines video ad serving, SI defines how to serve and interact with brand agent endpoints. SI handles the engagement; the Agentic Commerce Protocol (ACP) handles transactions.

Concretely: an AI assistant holding a user conversation opens a consented session with a brand's agent, exchanges messages, and renders the brand's structured response using a fixed component vocabulary. There is no creative file, no bid request and no ad server in the path. The brand supplies catalogue, identity and rules in advance; the assistant generates the surface.

The overview page calls this the reversed data flow: in programmatic the platform sends a thin request out to a bidder that lacks context, and in Sponsored Intelligence the buyer pushes rich context in to the platform that already holds the conversation.

## Where is Sponsored Intelligence defined, and what does it register?

`dist/schemas/3.1.10/index.json`, schema group `sponsored-intelligence`, described as the "Sponsored Intelligence Protocol for conversational brand experiences in AI assistants". It registers four of AdCP's 64 operations:

| Operation              | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `si_get_offering`      | Pre-session offering lookup against a brand agent |
| `si_initiate_session`  | Open a consented conversational session           |
| `si_send_message`      | Exchange messages within that session             |
| `si_terminate_session` | Tear the session down                             |

The group also registers supporting schemas that carry most of the design: `si-capabilities` (modality, component and commerce categories each side supports), `si-identity` (user identity with explicit consent), `si-ui-element` (the component vocabulary: text, link, image, product card, carousel, action button, app handoff), plus `si-context-use`, `si-sponsored-context` and `si-sponsored-context-receipt`, which declare the paying principal and the disclosure obligation attached to sponsored context entering an SI boundary.

That disclosure chain is the part worth reading if you only read one thing. SI treats "this was paid for" as a typed object with a receipt, not as a rendering convention.

## Is Sponsored Intelligence stable?

No, and AdCP says so twice over.

Every schema I checked in `dist/schemas/3.1.10/sponsored-intelligence/` carries `x-status: experimental` at the schema root. AdCP's experimental contract requires two markers, not one: the schema annotation, plus a runtime declaration by the seller of the feature id `sponsored_intelligence.core` in `experimental_features` on its `get_adcp_capabilities` response. The specification is blunt about the second:

> A seller that implements any experimental surface MUST list it in `experimental_features`. Sellers that do not list an experimental surface MUST NOT implement it — there is no "silently experimental" mode.

What that buys the surface is permission to break. Inside 3.x, an experimental surface may rename or remove fields, change types, remove enum values and rename tasks, with at least 6 weeks of published notice. Stable surfaces get a 6-month deprecation notice and cannot break inside a major line at all.

So Sponsored Intelligence ships in a stable release without inheriting that release's stability guarantee. If you are budgeting an SI integration, budget for the shape changing.

## What is Sponsored Intelligence's counterpart in AAMP?

**No counterpart exists.** Searching all eight IAB Tech Lab repositories in the AAMP corpus for "sponsored intelligence" returns zero occurrences.

The gap is structural rather than terminological. AAMP's three planes are a control plane for booking direct inventory, a bidstream mutation framework and an embedding exchange. None of them models a conversation, a consented session, a UI component vocabulary, or a paid-context disclosure receipt. There is no AAMP object to map `si_initiate_session` onto, and no AAMP repository whose scope would contain one.

This is one of the clearest asymmetries between the two stacks, and it runs the other way from most of them. On negotiation vocabulary AAMP is far ahead of AdCP; on advertising inside an AI assistant, AdCP is the only stack with anything at all.

## What is Sponsored Intelligence confused with?

**SI is not ACP.** The Agentic Commerce Protocol, from OpenAI and Stripe, handles checkout and payment delegation. SI handles the engagement that precedes it. AdCP's glossary lists the two as separate entries and describes the split in one line. AdCP Explorer publishes the [operation-level comparison](https://adcpexplorer.noetis.dev/areas/sponsored-intelligence/).

**SI is not sponsored search or an answer-engine ad unit.** It defines a session between an assistant and a brand agent, with declared capabilities on both sides. A sponsored link injected into a generated answer is not SI unless it went through that handshake and carries the sponsored-context declaration.

**SI is not the brand protocol.** They are adjacent and often confused because both involve a brand agent. AdCP's Brand Protocol registers six separate operations covering identity, claim verification and rights licensing. Sponsored Intelligence registers four covering the conversational session. Different schema groups, different feature ids.
