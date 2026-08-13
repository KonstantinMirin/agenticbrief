---
title: 'Sponsored Intelligence (SI): a stable channel and an experimental chat protocol'
description: 'Sponsored Intelligence is two things in AdCP 3.1.13: a stable media channel bought with get_products, and a four-operation chat protocol whose 14 schemas are all experimental.'
answer: "Sponsored Intelligence (SI) is AdCP's name for advertising on AI surfaces, and it covers two things: a stable media channel bought through get_products, and an experimental four-operation chat protocol for brand-agent sessions."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Sponsored Intelligence'
alternateNames: ['SI', 'SI Chat Protocol', 'sponsored_intelligence']
category: 'agentic'
cluster: 'gl-stacks'
keywords:
  - 'sponsored intelligence advertising'
  - 'sponsored intelligence definition'
  - 'adcp sponsored intelligence'
  - 'sponsored_intelligence channel'
  - 'si_initiate_session'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/channels.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-ui-element.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-capabilities.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-sponsored-context.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-context-use.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/sponsored-intelligence/si-sponsored-context-receipt.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/sponsored-intelligence/overview.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/sponsored-intelligence/product-spectrum.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/sponsored-intelligence/specification.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.6/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.6/reference/glossary.mdx'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/index.md'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/agentic-advertising/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/agents/brand-agent/'
  - '/media-buying/product/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/sponsored-intelligence/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Ad Context Protocol', 'Agentic Advertising', 'Brand Agent', 'Product', 'Agent Card']
reviewState: cto-reviewed
---

Sponsored Intelligence (SI) is [AdCP](/concepts/adcp/)'s name for advertising on AI assistant surfaces. AdCP's glossary puts it by analogy: "Like VAST defines video ad serving, SI defines how to serve and interact with brand agent endpoints. SI handles the engagement; the Agentic Commerce Protocol (ACP) handles transactions."

The name covers two things: a media channel bought with the ordinary media-buy calls, and a four-operation chat protocol whose 14 schemas are all marked experimental.

In programmatic, a thin bid request describes an opportunity to a bidder that holds no context about the user. Under SI the party holding the user context selects the advertising: the brand publishes an offering and the assistant host pulls it, and `si_get_offering` returns "offering details, matching products, and an offering token for session continuity" with no user PII in the request.

Brian O'Kelley, Scope3's CEO, published ["Sponsored Intelligence and the Trillion Dollar Sentence"](https://bokonads.com/p/sponsored-intelligence-and-the-trillion) on 19 January 2026, and AdCP adopted the phrase in its SI chat protocol document.

## One name, two stability levels

|                   | The channel                                                                                                                                      | The chat protocol                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Where it lives    | `enums/channels.json`, 1 of 20 values                                                                                                            | the [`sponsored-intelligence`](https://adcpexplorer.com/areas/sponsored-intelligence/) schema group, 14 files |
| How it is used    | `channels: ["sponsored_intelligence"]` on a [product](/media-buying/product/), then `get_products`, `create_media_buy`, `get_media_buy_delivery` | `si_get_offering`, `si_initiate_session`, `si_send_message`, `si_terminate_session`                           |
| Stability marking | no `x-status`; ordinary 3.x guarantee                                                                                                            | `x-status: experimental` on all 14                                                                            |
| Runtime gate      | none                                                                                                                                             | seller MUST declare `sponsored_intelligence.core` in `experimental_features`                                  |
| What it carries   | sponsored responses, AI search results, generative display and video                                                                             | brand experience handoffs                                                                                     |

AdCP publishes this split once, in `overview.mdx`: "SI uses two protocol layers... Most SI products... only involve the buying layer." Most SI inventory is bought with the ordinary media-buy calls and never touches the chat protocol: only one of the four SI product types AdCP lists calls an `si_*` operation.

## What the experimental stamp permits

An experimental marking permits breaking changes inside a minor release. Inside 3.x an experimental surface can rename or remove fields, change types, drop enum values and rename tasks, on six weeks of notice; a stable surface gets six months and cannot break inside the major line. AdCP requires two markers for one: `x-status` in the schema, and a runtime declaration by the seller. `experimental-status.mdx` is blunt about the second:

> A seller that implements any experimental surface MUST list it in `experimental_features`... there is no "silently experimental" mode.

Buying the channel is ordinary 3.x work, because `x-status` does not inherit through `$ref` by explicit rule and neither `core/product.json` nor the `media-buy` group carries one. Implementing the chat protocol means pinning a schema version, re-validating on each minor release, and budgeting for a rename nobody on the implementer's side chose.

No SI schema has changed since 3.1.0, so the experimental marking has not yet been exercised. The experimental note appears on 11 documentation files; `product-spectrum.mdx`, which distinguishes the two layers, does not carry it.

## Sponsored context and disclosure

Three schemas landed in 3.1.0 and turned paid context into a typed object. `si-sponsored-context` names the `paying_principal`, the `context_use` and a `disclosure_obligation` with label text and timing. `si-context-use` is a three-value enum, `presentation_only`, `comparison_set`, `reasoning_context`, and it sets how far into the assistant's own reasoning the paid material may travel.

`si-sponsored-context-receipt` is the host's recorded answer, and the one link where the schema constrains behaviour. The host answers `accepted` or `rejected`, and an acceptance has to echo back the same `context_use` it was handed and carry a `disclosure_commitment` that promises to satisfy the disclosure obligation. There is no room to negotiate downward: "a host that cannot honor the declared use mode rejects the sponsored context instead of down-scoping it."

The receipt is an audit artifact. AdCP names no enforcement body and leaves the obligation to the parties, and `si-context-use` says as much, calling itself "a boundary declaration, not a claim that AdCP can inspect hidden model reasoning..."

## UI components

Six components are MUST-render — text, link, image, product_card, carousel and action_button — and `app_handoff` and `integration_actions` are MAY. `specification.mdx` sets the split: six "Standard components", then "Hosts MAY support additional components". Only the six are safe on a core path, because `specification.mdx` makes a core dependency on the other two a MUST NOT.

Three files in the same release list different component sets.

| File                                          | Count | What it lists                                                                              |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| `sponsored-intelligence/si-ui-element.json`   | 8     | text, link, image, product_card, carousel, action_button, app_handoff, integration_actions |
| `si-capabilities.json`, `components.standard` | 6     | the same list minus `app_handoff` and `integration_actions`                                |
| `index.json`, supporting-schemas description  | 7     | drops `integration_actions`, calls `app_handoff` standard                                  |

The registry index is wrong under either reading, and where the index and a schema disagree the schema wins.

## Sponsored Intelligence in AAMP

[AAMP](/concepts/aamp/) defines no counterpart. Its repositories treat AI assistants as operator consoles for media professionals rather than as surfaces that carry an ad: seller-agent's documentation offers 46 MCP tools driven "from Claude, ChatGPT, or any MCP-compatible AI assistant".

AAMP's planes are direct booking, bidstream mutation and an embedding exchange. None models a session or a disclosure receipt, so there is nothing to map `si_initiate_session` onto, and the [AdCP-versus-AAMP comparison](https://agenticadlab.com/protocols/adcp-vs-aamp/) covers the rest of the divergence.

## Common confusions

The generic sense of the phrase owns no artifacts. A Sponsored Intelligence Summit was announced 21 July 2026, and the phrase is widely used for all advertising inside AI with no reference to AdCP; Scope3's own AdCP explainer does not mention Sponsored Intelligence.

[Compute Sponsoring v1.0](https://compute-sponsoring.org/), published by wavebird in February 2026, is a separate proposal for advertising inside generative AI, priced on compute units. It states that its technical specifications and audit mechanisms remain to be introduced.

ACP is a different protocol. OpenAI and Stripe's Agentic Commerce Protocol handles checkout and payment delegation after the engagement, which is the other half of the same transaction rather than a rival.

Inside SI itself, the channel and the chat protocol get conflated. A sponsored link in a generated answer may be the channel without being the chat protocol: the chat protocol applies only when the placement went through the session handshake and carries the sponsored-context declaration.
