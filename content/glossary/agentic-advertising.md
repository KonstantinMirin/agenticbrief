---
title: 'Agentic Advertising'
description: 'Agentic advertising is the category name for advertising planned, bought and sold by AI agents. Neither the AdCP nor the AAMP corpus defines the phrase.'
answer: 'Agentic advertising is the category name for advertising planned, bought and sold by AI agents acting for a buyer and a seller, rather than by humans in dashboards.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Agentic Advertising'
alternateNames: ['agentic ads', 'AI agent advertising', 'agent-to-agent advertising']
category: 'agentic'
cluster: gl-stacks
keywords:
  - 'agentic advertising'
  - 'agentic advertising definition'
  - 'what is agentic advertising'
  - 'agentic vs programmatic advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/decision-makers/l1-agentic-advertising.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/decision-makers/explaining-agentic-advertising.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/concepts/industry-landscape.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/verification/compliance-catalog.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/verification/aao-verified.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/server/src/mcp/mcp-server.ts'
  - 'https://www.thecurrent.com/marketing/how-6-ad-tech-execs-define-agentic-advertising'
  - 'https://www.indexexchange.com/index-explains/what-agentic-advertising-means-for-marketers/'
related:
  - '/concepts/agentic-buying/'
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/concepts/sponsored-intelligence/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/about/sources-and-versions/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
  - 'https://whatisagenticbuying.com/'
seeAlso: ['Agentic Buying', 'Ad Context Protocol', 'AAMP', 'Sponsored Intelligence']
reviewState: cto-reviewed
---

Agentic advertising is the category name for advertising planned, bought and sold by AI agents acting for a buyer and a seller, rather than by people working in dashboards. It is a category label rather than a specification, and no document in either the AdCP or the AAMP corpus defines it.

## Agentic advertising and programmatic advertising

|                 | Programmatic                            | Agentic advertising                                                    |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Who decides     | A remote bidder, per impression         | The platform holding the user context, or a pair of negotiating agents |
| What moves      | A thin bid request out                  | Catalogues, brand rules, goals and constraints in                      |
| Unit of work    | One impression, sub-second              | A campaign, a media buy, a negotiation                                 |
| Standard in use | OpenRTB, VAST, `ads.txt`                | AdCP 3.1.13, or the AAMP repositories                                  |
| Human role      | Configures a dashboard, then supervises | States intent, then reviews what an agent did                          |

Neither replaces the other, and AdCP's FAQ says so: "The layers compose — a single AdCP `create_media_buy` can spawn thousands of impression-layer events. A platform can implement both." An agentic buy usually terminates in a programmatic auction. That FAQ answer is also the only place in either corpus that says what [agentic buying](/concepts/agentic-buying/) means, and it is AdCP describing AAMP. The data flow behind the second row is set out under [agentic buying](/concepts/agentic-buying/).

## What can be checked instead of a definition

"Agentic" is not a conformance claim, and three checkable things stand in for it. `get_adcp_capabilities` is a Required task in `docs/protocol/required-tasks.mdx`, and `docs/reference/versioning.mdx` tells buyers that a seller not exposing it is a pre-v3 implementation. A specialism is a named capability a seller lists in `get_adcp_capabilities.specialisms`, with a wire ID such as `sales-guaranteed`; each one carries a bundle of YAML compliance tests that AgenticAdvertising.org (AAO) runs against a live agent, so a specialism listed without a run result is untested. On the AAMP side the unit is a repository and a tag, since there is no AAMP version: four AAMP repositories carry git tags and four carry none, the hub included, and [AAMP Explorer](https://aampexplorer.com/) tracks what each is pinned to.

Neither corpus can yet attest a production deployment, because both sides are still building the mechanism that would. AdCP's trust mark, AAO Verified, is stamped "Request for Comments". Its (Spec) axis is available now, and what it is earned against is a "test deployment, local dev, sandbox-only stack", explicitly "not production tolerance"; the axis that covers a real production endpoint is called (Sandbox), and it is "Foundation shipping" rather than available. On the AAMP side, `iab-agentic-primitives` v0.5.0 is unreleased and `agentic-direct`'s MCP handlers call `generateMockResponse`. Named deployments do exist, and are catalogued in a [sourced ledger on the hub](https://agenticadlab.com/guides/who-is-running-agentic-buys/).

## Where the term is used

The closest thing to a definition in either corpus is a line in an AdCP course for decision makers: "programmatic sends a thin request out; agentic advertising brings your data in." The line appears in a training module rather than in the schema registry. The same module quotes Ben Masse of Triton Digital, one of the four interim board directors of AgenticAdvertising.org, from the egta CEO Summit: "From bidding to reasoning. From impressions to relationships. From milliseconds to months."

AdCP's glossary, `docs/reference/glossary.mdx`, carries the Agentic Commerce Protocol (ACP), another body's protocol covering checkout rather than media; the Agentic eXecution Engine (AXE), deprecated and "Replaced by the Trusted Match Protocol (TMP)"; and AgenticAdvertising.org, the member organisation that stewards AdCP itself. The phrase agentic advertising is not among them, and the nearest thing to it in the specification is a parenthetical on `docs/building/concepts/industry-landscape.mdx`, "agentic (AI agents managing full campaign lifecycles)".

The phrase is the first two words of the AAMP hub README, `# **AAMP - Agentic Advertising Management Protocols**`, whose opening calls AAMP "an open-source framework developed under IAB Tech Lab to support the evolution of agentic transactions within digital advertising ecosystems" — a different phrase, also undefined. AAMP publishes no glossary. Two repositories, `agentic-rtb-framework` and `agentic-direct`, never use the phrase, and the acronym itself does not hold steady: `iab-agentic-primitives/SANDBOX_REGISTRY.md` expands AAMP as "Agentic Advertising Marketplace Protocol". [AAMP](/concepts/aamp/) has the rest of that list.

Vendors publish definitions of their own.

| Who                                 | Their definition                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Anthony Katsur, CEO of IAB Tech Lab | "agentic is just systems executing and interacting across advertising workflows"                                  |
| Index Exchange                      | Systems that "act independently to achieve defined goals within set guardrails"                                   |
| Adgentek                            | "the planning, buying, and selling of advertising by AI agents that transact with each other over open protocols" |
| Scope3, an AdCP member              | A taxonomy of agent types: buying, sales, signals, creative, governance                                           |

None of these cites a version or a conformance test. Index Exchange's names MCP, AdCP and ARTF without a version for any of them; the other three name no specification at all. Index Exchange calls the state of the term "agentic confusion".

Agentic advertising is broader than [agentic buying](/concepts/agentic-buying/), which covers the procurement step and has [a site of its own](https://whatisagenticbuying.com/). It is separate again from agentic commerce: ACP and UCP standardise checkout and payment inside AI assistants, and AdCP's glossary calls them the layer complementing its own. Related terms: [AdCP](/concepts/adcp/), [AAMP](/concepts/aamp/), [Sponsored Intelligence](/concepts/sponsored-intelligence/), and [the terminology map](/concepts/adcp-vs-aamp-terminology/) for the object vocabularies rather than the category words.
