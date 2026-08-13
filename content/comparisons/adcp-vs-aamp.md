---
title: 'AdCP vs AAMP: Which Standard to Implement'
description: 'Back AdCP for the campaign path and keep AAMP as a watch item. The two conditions that flip that call, what each stack does job by job, and the AGPL trap in ARTF.'
answer: 'AdCP and AAMP are the two agentic advertising protocol stacks. AdCP is one specification of 64 operations pinned at 3.1.13; AAMP is an IAB Tech Lab umbrella over eight independently versioned repositories that share no data type. Implement AdCP first.'
pubDate: 2026-08-09
updatedDate: 2026-08-12
cluster: 'hub-comparison'
subjects: ['AdCP', 'AAMP']
keywords:
  - 'adcp vs aamp'
  - 'adcp aamp difference'
  - 'iab tech lab vs agenticadvertising.org'
  - 'should i implement adcp or aamp'
  - 'agentic advertising standards comparison'
verdict: 'Implement AdCP, because it is the only one of the two you can pin in a contract. AAMP has no version number above the repository level, and the repository holding its wire contract still defers its own stability to a 1.0 with no date.'
faq:
  - question: 'Do AdCP and AAMP share any data types?'
    answer: 'None. They share ancestors, both reaching OpenRTB, AdCP through Trusted Match package activation and AAMP through OpenDirect 2.1, AdCOM and ARTF vendored OpenRTB 2.6. But no IAB Tech Lab repository mentions AdCP, and an AdCP media_buy and an AAMP Deal are unrelated types with unrelated lifecycles.'
  - question: 'Is "AAMP 2.3" a version?'
    answer: 'No. It comes from an IAB Tech Lab press release dated 30 July 2026 and matches no tag, release or version field in any of the eight repositories. The closest tags are one team application releases on the buyer and seller agents, and both have since been superseded.'
  - question: 'Can I implement both?'
    answer: 'Yes, and the second stack costs a second integration and a second conformance suite to keep green every release. The only layer that carries over is the MCP transport underneath both. Every object model, test fixture and vendor conversation is duplicated.'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/measurement/taxonomy.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trust.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/compliance/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/trust.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/main/CHARTER.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/main/IPR_POLICY.md'
  - 'https://adcontextprotocol.org/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/releases'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/main/README.md'
  - 'https://github.com/IABTechLab/buyer-agent/releases'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/CONFORMANCE.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/LICENSE'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://iabtechlab.com/press-releases/iab-tech-lab-releases-aamp-2-3-bringing-enterprise-grade-infrastructure-and-privacy-diligence-to-agentic-advertising/'
  - 'https://iabtechlab.com/opendirect'
  - 'https://www.adexchanger.com/ad-exchange-news/the-agentic-advertising-organization-hands-development-of-its-sell-side-agent-to-prebid/'
related:
  - '/protocols/aamp/'
  - '/protocols/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/guides/agent-discovery-files/'
  - 'https://adcpexplorer.com/guides/adcp-registry-measured/'
  - '/guides/who-is-running-agentic-buys/'
  - '/services/'
  - 'https://aampexplorer.com/versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://aampexplorer.com/repos/'
  - 'https://adtechglossary.com/concepts/adcp-vs-aamp-terminology/'
  - 'https://adtechglossary.com/negotiation/trust-status/'
  - 'https://adcpexplorer.com/'
  - 'https://whatisagenticbuying.com/'
reviewState: cto-reviewed
---

Back AdCP. If you have one integration budget for the next two quarters, spend it there and keep AAMP as a watch item with a named owner and no engineers attached.

AdCP publishes one number for the whole specification in a file you can fetch: [`dist/schemas/latest.json`](https://adcontextprotocol.org/schemas/latest.json) reads 3.1.13 stable, and that release carries 64 operations across 10 areas. Freeze the directory, run a conformance suite against it, re-run the same suite next quarter against a byte-identical artifact. AAMP is eight repositories versioning independently, and the one holding the buyer-to-seller wire contract, `iab-agentic-primitives`, calls itself a pre-release whose "APIs, schemas, and package layout may still change between releases until a 1.0 IAB Tech Lab standardization". A supply contract needs a conformance clause, and that sentence will not carry one.

The umbrella version does not close the gap. IAB Tech Lab announced AAMP 2.3 on 30 July 2026 and the number matches no tag, no release and no version field in any of the eight repositories; the hub had zero tags on the day of the announcement and has zero tags now.

A counterparty that publishes only an AAMP agent card flips the call, because you implement what they serve. So does serve-time work. ARTF lets a third-party agent patch the bid object while the auction clock is running, inside somebody else's OpenRTB auction under `tmax`, and AdCP has nothing at that layer to compete with it. That work goes to your general counsel before it reaches an engineer: the Go implementation is AGPL-3.0 under Index Exchange copyright.

## Your first move, by side

If you sell inventory, publish two static documents this week. `adagents.json` and `brand.json` at `/.well-known/` make you discoverable to a buying agent before you implement a single operation, and no protocol decision blocks them. The AAMP equivalent is an agent card plus a registry entry to resolve it, which costs more and reaches fewer buyers today.

If you buy, run one HTTP request per counterparty domain before the protocol argument starts. Does the domain serve `/.well-known/adagents.json`, or hand you an agent card and a registry to resolve against? The responses decide your order of work, and [the discovery file guide](/guides/agent-discovery-files/) covers what comes back. If nothing resolves across your top twenty partners, you are early: put a date in the calendar and spend the budget elsewhere.

## The two stacks, job by job

AAMP has no single surface to cite, so its column names repositories: naming operations would imply a coherence that is not there.

| Job to be done            | AdCP 3.1.13                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | AAMP (per repository)                                                                                                                                                                                                                                                                                                             | What it costs you                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Agent discovery           | `get_adcp_capabilities`, plus `adagents.json` at `/.well-known/adagents.json` and `brand.json` at `/.well-known/brand.json`, all hosted on the domain itself.                                                                                                                                                                                                                                                                                                                                                   | `GET /.well-known/agent.json` (Agent Card) and `POST /registry/agents/discover` in `iab-agentic-primitives`, resolved through a registry.                                                                                                                                                                                         | Two static files on your own origin, against a registry entry somebody else has to grant.                                 |
| Trust                     | Authorisation and grading are separate mechanisms. What authorises a transaction is the publisher's `adagents.json` declaration plus RFC 9421 request signing, normative in 3.1, with AAO Verified as an out-of-band conformance mark. The graded value is derived by the consumer, never issued: five states, `inline`, `mutual_assertion`, `one_sided_brand`, `one_sided_house`, `standalone`, computed from `brand.json` `parent_house` against the publisher's `brand_refs[]`, and left to deployer policy. | Five states, issued: `Agent.trust_status` enum `unknown`, `registered`, `approved`, `preferred`, `blocked`. Its own description: "Registry-verified trust status. Caps the effective AccessTier; never self-asserted by the agent."                                                                                               | AdCP's grade is advisory. AAMP's caps the price you are shown.                                                            |
| Inventory discovery       | `get_products`, with a **required** `buying_mode` of `brief`, `wholesale` or `refine`; `list_creative_formats`.                                                                                                                                                                                                                                                                                                                                                                                                 | `GET /products`, `GET /products/{product_id}`, `POST /products/avails` in `iab-agentic-primitives`; media kit and package endpoints on `seller-agent`.                                                                                                                                                                            | The one job both stacks do, and the only one a vendor demo will show you.                                                 |
| Negotiation               | No priced multi-round negotiation. The nearest surface is `get_products` with `buying_mode: "refine"`, where each entry carries a natural-language `ask` and a proposal-scoped `action` of `include`, `omit` or `finalize`.                                                                                                                                                                                                                                                                                     | First class and numeric. `POST /api/v1/negotiations/messages` carries `action` (`accept`, `counter`, `final_offer`, `reject`), `buyer_price` and `round_number`; the response returns `concession_pct` and `cumulative_concession_pct`.                                                                                           | A concession budget on the AAMP side, spent in rounds. On AdCP, a seller you have to trust to re-price honestly.          |
| Transaction               | `create_media_buy` with a required `idempotency_key`, `account`, `brand`, `start_time` and `end_time`, returning `media_buy_id`. `update_media_buy` applies PATCH semantics.                                                                                                                                                                                                                                                                                                                                    | Two steps. `POST /api/v1/quotes` mints a `quote_id`; `POST /api/v1/deals` books it and mints a `deal_id`; `POST /api/v1/change-requests` handles modification after booking. `idempotency_key` is required on both quote and booking.                                                                                             | Two round trips on AAMP where AdCP takes one, and a second idempotency surface to test.                                   |
| Creative                  | `build_creative`, `preview_creative`, `sync_creatives`, `list_creatives`, `list_transformers`, `get_creative_delivery`, `list_creative_formats`, `validate_input`.                                                                                                                                                                                                                                                                                                                                              | No creative operation. `Creative`, `Assignment` and `CreativeApproval` exist as objects in `iab-agentic-primitives`; `agentic-direct` exposes `create_creative` and `create_assignment` MCP tools whose handlers call `generateMockResponse`. `seller-agent`'s API has no creative endpoint anywhere in it.                       | AAMP has none, so creative review stays a manual process sitting next to the agent.                                       |
| Signals and audiences     | `get_signals`, `activate_signal`, and `sync_audiences` for hashed first-party CRM records.                                                                                                                                                                                                                                                                                                                                                                                                                      | `agentic-audiences`, a draft embedding exchange using `application/vnd.ucp.embedding+json; v=1`, plus `POST /agentic-audience/match` on `seller-agent`. The schema that would connect the format to either agent, `specs/v1.0/schema/agent_interface.schema.json`, is zero bytes.                                                 | Any delivery date quoted for audience activation over AAMP is a date for somebody to write the empty file first.          |
| Serve-time decisioning    | Trusted Match Protocol, AdCP's serve-time layer: `context_match` and `identity_match`, two structurally separated operations carried over direct HTTP instead of MCP or A2A. Returns eligible packages, no auction.                                                                                                                                                                                                                                                                                             | ARTF v1.0 (the Agentic Real Time Framework, in the `agentic-rtb-framework` repository): `RTBExtensionPoint.GetMutations(RTBRequest)` returns `RTBResponse`, a list of JSON-Patch-shaped mutations keyed on an `Intent` enum with eight defined intents plus an unspecified zero, applied inside the OpenRTB auction under `tmax`. | A general counsel review before an engineer opens the ARTF repository.                                                    |
| Governance and consent    | 22 of the 64 registry entries, including `check_governance`, `sync_plans`, `report_plan_outcome`, `get_plan_audit_logs`, property and collection CRUD, `calibrate_content` and `validate_content_delivery`. No consent tag on the wire.                                                                                                                                                                                                                                                                         | No governance operation. `ConsentContext` carries eight fields (`applicable_regimes`, `diligence_status`, `gdpr_applies`, `gpp_section_ids`, `gpp_string`, `tcf_string`, `us_privacy`, `verified_at`) and is optional everywhere it appears. Plus `DecisionRecord` and `seller-agent`'s `/approvals` human-review endpoints.      | AdCP gives you an audit trail and no consent tag; AAMP gives you a consent object that is optional everywhere it appears. |
| Measurement and reporting | No measurement operation group. Delivery and outcome data move through `get_media_buy_delivery`, `provide_performance_feedback`, `sync_event_sources`, `log_event` and `report_usage`, alongside four core objects: `measurement-terms`, `measurement-readiness`, `measurement-window`, `outcome-measurement`.                                                                                                                                                                                                  | No measurement object in the wire contract. Reporting is per implementation: `/gam/report`, `/api/v1/deals/{deal_id}/performance` and `/api/v1/orders/report` on the seller agent, `/reports/{job_id}` and `/meta/report` on the buyer agent.                                                                                     | A per-vendor reporting integration either way.                                                                            |

AdCP has no priced negotiation. AAMP has no creative operation, no governance operation and no measurement object in its wire contract, which is three blanks against one. Two groups made different bets about which part of a media transaction is the hard part. [How a machine buys media](/guides/how-a-machine-buys-media/) traces one purchase at the wire level; [AAMP Explorer](https://aampexplorer.com/repos/) breaks the right-hand column out repo by repo.

## The object models do not compose

The transports compose. The object models do not: an AdCP `media_buy` and an AAMP `Deal` are unrelated types with unrelated lifecycles, so an agent that already speaks MCP is adding a vocabulary, while a buyer who wants both stacks is buying two integrations and two conformance suites.

Negotiation is where that costs money. AdCP negotiates in sentences: a buyer who wants a cheaper plan sends `refine` with `ask: "reduce total by 10%"` and lets the seller re-price. AAMP negotiates in numbers, bounded by an access tier the seller assigns to your API key rather than one you claim. The caps are percentages of the seller's own opening price: `public` gets three rounds, 3% per round and 8% cumulative; `advertiser` six rounds, 6% and 20% ([AAMP Explorer](https://aampexplorer.com/negotiation/) reproduces the table). AdCP's model is more expressive and much harder to test, and on price I want the numbers.

`NegotiationMessage` makes `idempotency_key` required and the seller agent's handler never reads it, so a retried request counts as a fresh round. On the public tier that is one of your three rounds and 3 of your 8 cumulative points gone to a timeout nobody logged.

AAMP's registry issues its five trust states and they cap the prices a buyer is shown. AdCP's five are computed by the consumer from two self-published documents, advisory by design, and they touch no price at any point. The [trust status entry](https://adtechglossary.com/negotiation/trust-status/) has both enums side by side.

AdCP's own FAQ files the rivalry away in one line: "Put simply: **AAMP is agentic bidding; AdCP is agentic buying.**" ARTF fits that sentence. The rest of AAMP does not, because its wire contract exposes `/products`, `/api/v1/quotes`, `/api/v1/deals`, `/api/v1/change-requests` and `/api/v1/negotiations/messages` over OpenDirect 2.1, which is quote, negotiate, book and amend, the campaign layer AdCP occupies. The same table, stamped "As of April 2026", calls AAMP's public schemas "Being defined"; there are 48.

<details>
<summary>The two stacks do not share a noun for the sell side.</summary>

AdCP's glossary defines a sales agent as "an MCP server that exposes publisher inventory for discovery and purchase". AAMP calls the same role a seller agent and named a repository after it. That matters when your RFP asks a vendor whether they support agentic buying and both sides answer yes. The [term map](https://adtechglossary.com/concepts/adcp-vs-aamp-terminology/) lines the two sets of nouns up.

</details>

Anthony Katsur is right that "standards proliferation is a real cost to the industry", and right that "when you remodel the kitchen, you don't burn down the house" — AAMP is built on OpenDirect 2.1, AdCOM and OpenRTB, all IAB Tech Lab work. What the metaphor hides is that his remodel shipped as eight rooms with eight release schedules and no plan covering the house. Andrew Casale calls the category "a soup of confusion" and the evidence backs him, though the soup is thickest inside AAMP: eight repositories, four with no tag at all, a press-release version that matches none of them, and one component that nobody can route around shipped under a licence that reaches its host's users.

Craig Tuck's objection, that "the biggest risk we see with an innovation like AdCP is decreasing transparency and control", and Paul Bannister's claim that agentic trading "puts the buyer directly in touch with the publisher's ad server and removes other middlemen", are both true, of different planes. The campaign path is buyer to publisher, with a record of who agreed what. The auction path is a mutation applied to somebody else's bid inside somebody else's auction under a timeout. Which path you buy on decides which of the two you get.

## Governance, licensing and the AGPL problem

|                          | AdCP                                                                                                                                                                                                                                                                    | AAMP                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Steward                  | AgenticAdvertising.org (AAO), a pending 501(c)(6) Delaware trade association                                                                                                                                                                                            | IAB Tech Lab                                                                                                                                                                                                                                                                                                                                                        |
| Governance documents     | `CHARTER.md` and `IPR_POLICY.md` in the repository, with Bylaws, Membership Agreement and Antitrust Policy published at agenticadvertising.org                                                                                                                          | The hub README, four bullet points: contributions go to the child repository, architectural proposals to the hub, cross-cutting changes discussed first, IAB Tech Lab policies apply                                                                                                                                                                                |
| Release model            | Single semantic version. `dist/schemas/latest.json` is the oracle. Wire pins are release-precision (`"3.1"`), never patch-level                                                                                                                                         | "Each repository uses independent semantic versioning. Cross-repository alignment occurs via governance coordination."                                                                                                                                                                                                                                              |
| Versioning oracle        | Published, machine-readable, currently 3.1.13                                                                                                                                                                                                                           | None. Eight `git tag` outputs, four of them empty                                                                                                                                                                                                                                                                                                                   |
| Licence                  | Apache-2.0 across the repository                                                                                                                                                                                                                                        | Mixed. Apache-2.0 for the hub, `buyer-agent`, `seller-agent`, `agentic-direct` and `iab-agentic-primitives`. ARTF's Go implementation is **AGPL-3.0**, copyright Index Exchange; the ARTF specification is CC BY 3.0. `agentic-audiences` is CC BY 4.0 for specs and Apache-2.0 for code, copyright LiveRamp. `registry-agent-example` ships no licence file at all |
| Reference implementation | Handed to the Prebid community in February 2026, [reported by AdExchanger](https://www.adexchanger.com/ad-exchange-news/the-agentic-advertising-organization-hands-development-of-its-sell-side-agent-to-prebid/). AAO owns the specification, Prebid owns the software | The reference implementations are the deliverable. `buyer-agent` and `seller-agent` are where the protocol currently lives                                                                                                                                                                                                                                          |

"AAMP is Apache-2.0" is a reasonable assumption and it is false. ARTF's `LICENSE` file is the GNU AGPL v3 text, and the README spells it out: copyright Index Exchange Inc., AGPL-3.0. Vendor that Go implementation into a hosted exchange and section 13 puts your users in scope, reaching every buyer that hits your endpoint. That belongs in the first vendor call.

AAO's interim board is half one vendor and its own FAQ says so: four interim directors, two of them Scope3-affiliated, and a first Annual General Meeting dated 6 May 2026. That is more than a body still calling its own incorporation pending has to publish. I price that concentration in and take the disclosure, because a published imbalance is one you can write a contract clause against. IAB Tech Lab wrote OpenRTB, AdCOM, OpenDirect and GPP, and both stacks stand on those. Neither fact shows up in a schema diff, and both matter more to a five-year bet than any operation count.

The press release version number is worth pinning down, because the hub is where a buyer would look for one. Its stated job is to reference stable releases for ecosystem clarity, and it has zero tags and zero releases, its last commit predates the AAMP 2.3 announcement by three and a half months, and its README still omits the wire contract that both reference agents pin in their `pyproject.toml`. Here is what the tags said on the day of the announcement, and what they say now.

| Repository               | Tag on 2026-07-30                     | Tag now                        | Listed in hub README |
| ------------------------ | ------------------------------------- | ------------------------------ | -------------------- |
| `AAMP` (hub)             | none                                  | none                           | is the hub           |
| `iab-agentic-primitives` | `v0.5.0`, tag only, no GitHub release | `v0.5.1`, published 2026-08-10 | no                   |
| `seller-agent`           | `v2.3.3`, published 2026-07-29        | `v2.4.1`, published 2026-08-05 | yes                  |
| `buyer-agent`            | `v2.3.0`, published 2026-07-22        | `v2.4.1`, published 2026-08-10 | yes                  |
| `agentic-rtb-framework`  | `v1.0`, published 2026-07-20          | `v1.0`                         | yes                  |
| `agentic-direct`         | none                                  | none                           | yes                  |
| `agentic-audiences`      | none                                  | none                           | yes                  |
| `registry-agent-example` | none                                  | none                           | yes                  |

The closest things to 2.3 are the buyer agent's `v2.3.0`, already out for eight days when the announcement landed, and the seller agent's `v2.3.3`. Both are one team's application tag, and both are gone. Three independent releases followed within twelve days, and no number covers any two of them. The [per-repository breakdown](https://aampexplorer.com/versions/) has the rest.

AdCP will cost a person's attention every month, permanently. It published four patch releases in the first eleven days of August and it dates its removals in advance: `format_ids` deprecated in 3.2 and removed in 4.0, package `bid_price` deprecated in 3.2 in favour of `bidding`. One release, 3.1.3, is marked "Withdrawn. Do not use." with the reason attached and still sitting in the tree. I would take that trade every time, and I would put the owner's name on it before the first integration ships.

AdCP is stale about itself too. `docs/reference/versions.mdx` names 3.1.12 as current stable, `dist/schemas/` in the same checkout carries 3.1.13, and the AAMP comparison table in `docs/faq.mdx` still calls AdCP "3.0 GA (released April 2026)". Both projects drift from their own code in their own prose. The difference is that one of them publishes an oracle you can fetch and diff the prose against.

## Where each stack thins

AdCP's full surface is public and needs no membership. An engineer integrating against it can answer "what does this field mean, and what happens if I omit it" without booking a call with a working group.

AAMP's control plane carries a warning label with real work underneath it: 13 operations and 48 JSON Schema files in `iab-agentic-primitives`, a large OpenAPI surface and an MCP tool set on each reference agent, a 534-line ARTF specification with a protobuf contract. Most of that is one team's application, and it moves on the next minor release.

`registry-agent-example` is a 22-line `agent.ts`. Six files in `agentic-audiences` are zero bytes, including the schema that would join the embedding format to either agent, `specs/v1.0/schema/agent_interface.schema.json`, and the specification that does have content titles itself "Draft v0.1" from inside a directory named `v1.0`. The client that would make registry-mediated discovery work is called "the legacy stub retained as the default" in the seller agent's own source. Discovery is where AAMP is least finished; [the AAMP page](/protocols/aamp/) has the repo-level verdicts.

`iab-agentic-primitives` also ships a standards gap report whose stated rule is the best sentence in either corpus: "'We model a field named after a standard' is never treated as 'we verified conformance against the published standard'." AdCP's conformance suite is bigger and points inward, testing AdCP against AdCP. And `ConsentContext` gives a GPP or TCF string somewhere to sit on the wire, where AdCP's limitations page says it "does not carry a normative consent tag".

Neither stack standardises measurement or attribution. AdCP carries exposure records and outcome signals "but it does not specify an attribution model", and says it "is not MRC-accredited and does not seek accreditation"; AAMP's wire contract has no measurement object at all. Amy Porter's worry that agents "could obscure critical decision-making if advertisers rely too much on AI" lands on exactly that seam: on the question a CFO asks first, both stacks hand the problem back and reporting stays a per-vendor integration. [What neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/) has the rest.

None of that volume measures deployed traffic, and neither corpus carries an adoption figure. What is measurable from outside is thin and real: of the 23 agents in AdCP's public registry on 12 August, 13 completed an anonymous MCP handshake and three sales agents returned a product catalogue to a caller with no credentials ([the full sweep](https://adcpexplorer.com/guides/adcp-registry-measured/)).

Three sales agents handing a product catalogue to an unauthenticated caller is a security finding as much as an adoption one. Early deployments are running open, which is itself an argument for moving now, while the norms about who gets to see a rate card are still being set. Every named agentic buy that has run in public so far ran on AdCP or on raw MCP, and none of it is large ([the deployment ledger](/guides/who-is-running-agentic-buys/)).

## What would change this analysis

Each of these is a file change, checkable without waiting for a press release.

1. `iab-agentic-primitives` tags at 1.0 or above. That moves AAMP from implementations-with-an-emerging-contract to contract-with-implementations, and it is the trigger to watch.
2. A first tag on the hub. The umbrella carries no tags at all, which is what the whole pinning argument above rests on.
3. A non-empty `agentic-audiences/specs/v1.0/schema/agent_interface.schema.json`, the join between AAMP's data plane and everything else.
4. `seller-agent`'s `AAMPRegistryClient` stops being the legacy stub, which registry-mediated discovery needs before a buyer can rely on it.
5. Either corpus references the other. The first `adcp` string in an IAB Tech Lab repository would be the first sign that anyone intends the two to interoperate.

If you would rather not watch them yourself, that is [the work I sell](/services/).
