---
title: 'AdCP vs AAMP: What the Specifications Actually Say'
description: "A file-level comparison of AdCP 3.1.10 and IAB Tech Lab's AAMP: capability matrix, governance, licensing, maturity, and the gaps both stacks share."
answer: 'AdCP and AAMP differ in kind. AdCP 3.1.10 is one versioned registry of 64 operations governed by AgenticAdvertising.org. AAMP is an IAB Tech Lab umbrella over eight independently versioned repositories spanning three planes that share no data type.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-comparison'
subjects: ['AdCP', 'AAMP']
keywords:
  - 'adcp vs aamp'
  - 'adcp aamp difference'
  - 'iab tech lab vs agenticadvertising.org'
  - 'should i implement adcp or aamp'
  - 'agentic advertising standards comparison'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/measurement/taxonomy.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/main/CHARTER.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/main/IPR_POLICY.md'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://iabtechlab.com/opendirect'
  - 'https://www.adexchanger.com/ad-exchange-news/the-agentic-advertising-organization-hands-development-of-its-sell-side-agent-to-prebid/'
related:
  - '/guides/how-a-machine-buys-media/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/protocols/aamp/'
  - 'https://adtechglossary.noetis.dev/concepts/adcp-vs-aamp-terminology/'
  - 'https://aampexplorer.noetis.dev/negotiation/'
  - 'https://aampexplorer.noetis.dev/what-does-aamp-stand-for/'
  - 'https://aampexplorer.noetis.dev/versions/'
  - 'https://adcpexplorer.noetis.dev/'
reviewState: cto-reviewed
---

## What is the difference between AdCP and AAMP?

AdCP is one specification with one version number. AAMP is a folder of repositories with eight.

That is the whole comparison in two sentences, and everything below is the evidence for it. I checked both corpora on 2026-08-08 and 2026-08-09 against local clones: `adcontextprotocol/adcp` at commit `f1a35ab` (2026-08-06) and the eight IAB Tech Lab repositories listed in section 4. Every claim on this page points at a file.

AdCP (Ad Context Protocol) publishes a version oracle at `dist/schemas/latest.json`, which reads `{"latest":"3.1.10","latest_stable":"3.1.10","channel":"stable"}`. The registry for that release, `dist/schemas/3.1.10/index.json`, is stamped `lastUpdated: 2026-08-04` and registers **64 operations** across 10 areas. One body governs it: AgenticAdvertising.org, a pending 501(c)(6) Delaware trade association described in `CHARTER.md`. One licence covers the repository: Apache-2.0.

AAMP is an umbrella. Its hub repository is a README, and that README says so: "This repository serves as the central hub for the AAMP framework with links to each AAMP repository outlined below." It lists six component repositories and states the release model in one line: "Each repository uses independent semantic versioning." There is no AAMP version number, because there is nothing for a version number to describe.

There is also an eighth repository. Both reference agents pin `iab-agentic-primitives` as a hard dependency in `pyproject.toml`, and that library holds the canonical buyer-to-seller wire contract: 48 JSON Schema files plus an OpenAPI 3.1 document with 13 operations. The AAMP hub README does not mention it. Its own README opens with "WORK IN PROGRESS — NOT YET RELEASED."

So the two stacks are not two versions of the same thing. AdCP is a published specification with an implementation. AAMP is a set of implementations with a specification emerging inside one of them.

## How do AdCP and AAMP compare, job by job?

The rows below are jobs a media transaction has to get done. The cells name the actual operation or object. Where a cell reads "no counterpart," that is the finding, not a formatting placeholder.

AdCP entries are from `dist/schemas/3.1.10/index.json` and the request and response schemas it references. AAMP entries name the repository, because AAMP has no single surface to cite.

| Job to be done             | AdCP 3.1.10                                                                                                                                                                                                                                                                         | AAMP (per repository)                                                                                                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent discovery**        | `get_adcp_capabilities`; `adagents.json` at `/.well-known/adagents.json`; `brand.json` at `/.well-known/brand.json`. Discovery is domain-hosted.                                                                                                                                    | `GET /.well-known/agent.json` (Agent Card) and `POST /registry/agents/discover` in `iab-agentic-primitives`. Discovery is registry-mediated.                                                                                                                                                                  |
| **Trust**                  | No counterpart to a graded trust value. AdCP authorises through the publisher's `adagents.json` declaration plus RFC 9421 request signing, with AAO Verified as an out-of-band programme.                                                                                           | `Agent.trust_status`, a five-value lattice (`unknown`, `registered`, `approved`, `preferred`, `blocked`) that caps the buyer's access tier and therefore the prices it can see.                                                                                                                               |
| **Inventory discovery**    | `get_products` with `buying_mode` of `brief`, `wholesale` or `refine`; `list_creative_formats`.                                                                                                                                                                                     | `GET /products`, `GET /products/{product_id}`, `POST /products/avails` in `iab-agentic-primitives`; media kit and package endpoints in `seller-agent`.                                                                                                                                                        |
| **Negotiation**            | No counterpart to priced multi-round negotiation. The nearest surface is `get_products` with `buying_mode: "refine"`, where each entry carries a natural-language `ask` and a proposal-scoped `action` of `include`, `omit` or `finalize`.                                          | First class and numeric. `POST /api/v1/negotiations/messages` carries `action` (`accept`, `counter`, `final_offer`, `reject`), `buyer_price` and `round_number`; the seller returns a `NegotiationRound` with `concession_pct` and `cumulative_concession_pct`.                                               |
| **Transaction**            | `create_media_buy` with a required `idempotency_key`, `account`, `brand`, `start_time` and `end_time`, returning `media_buy_id`. `update_media_buy` applies PATCH semantics.                                                                                                        | Two steps. `POST /api/v1/quotes` mints a `quote_id`; `POST /api/v1/deals` books it and mints a `deal_id`. `POST /api/v1/change-requests` handles post-booking modification. Both quote and booking require `idempotency_key`.                                                                                 |
| **Creative**               | Eight operations: `build_creative`, `preview_creative`, `sync_creatives`, `list_creatives`, `list_transformers`, `get_creative_delivery`, `list_creative_formats`, `validate_input`.                                                                                                | No creative operation. `Creative`, `Assignment` and `CreativeApproval` exist as objects in `iab-agentic-primitives`; `agentic-direct` exposes `create_creative` and `create_assignment` MCP tools whose handlers call `generateMockResponse`. `seller-agent`'s 74 OpenAPI paths contain no creative endpoint. |
| **Signals and audiences**  | `get_signals`, `activate_signal`, and `sync_audiences` for hashed first-party CRM records.                                                                                                                                                                                          | `agentic-audiences`, a draft embedding-exchange format, plus `POST /agentic-audience/match` on `seller-agent`. The schema that would connect the format to a buyer or seller agent, `specs/v1.0/schema/agent_interface.schema.json`, is zero bytes.                                                           |
| **Serve-time decisioning** | Trusted Match Protocol: `context_match` and `identity_match`, two structurally separated operations carried over direct HTTP rather than MCP or A2A. Returns eligible packages.                                                                                                     | ARTF v1.0: `RTBExtensionPoint.GetMutations(RTBRequest)` returns `RTBResponse`, a list of JSON-Patch-shaped mutations keyed on an `Intent` enum with eight defined intents, applied inside the OpenRTB auction under `tmax`.                                                                                   |
| **Governance**             | 22 of the 64 operations, including `check_governance`, `sync_plans`, `report_plan_outcome`, `get_plan_audit_logs`, property and collection list CRUD, `calibrate_content` and `validate_content_delivery`.                                                                          | No governance operation. The nearest objects are `ConsentContext` (carrying `gpp_string`, `tcf_string`, `us_privacy`, `applicable_regimes`), `DecisionRecord`, and `seller-agent`'s `/approvals` human-review endpoints.                                                                                      |
| **Measurement**            | No measurement operation group. Delivery and outcome data move through `get_media_buy_delivery`, `provide_performance_feedback`, `sync_event_sources`, `log_event` and `report_usage`, plus the core objects `measurement-terms`, `measurement-readiness` and `measurement-window`. | No measurement object in the shared wire contract. Reporting is per-implementation: `/reports/{job_id}` on the buyer agent, `/api/v1/deals/{deal_id}/performance` and `/gam/report` on the seller agent.                                                                                                      |

Two cells are worth reading twice. AdCP has no counterpart to AAMP's numeric negotiation, and AAMP has no counterpart to AdCP's creative and governance surfaces. Those are not gaps either side has hidden; they are different bets about which part of a media transaction is hard.

## Where do AdCP and AAMP differ in kind rather than in naming?

Three differences survive any renaming exercise.

**AdCP is one registry; AAMP is three planes with no shared type.** AdCP's `index.json` declares two protocol layers, `negotiation` and `decisioning-serving`, and every operation in both resolves against the same `core/` schema directory. AAMP's control plane (`iab-agentic-primitives`, `buyer-agent`, `seller-agent`, `agentic-direct`) is JSON Schema and OpenAPI over OpenDirect 2.1. Its real-time plane (ARTF) is protobuf over gRPC. Its data plane (`agentic-audiences`) is a JSON Schema draft over HTTPS with a custom media type, `application/vnd.ucp.embedding+json; v=1`. I looked for a file that maps an ARTF deal identifier to a `seller-agent` `Deal`, or an Agentic Audiences embedding to a buyer-agent audience segment. There is none.

**AdCP negotiates in sentences; AAMP negotiates in numbers.** An AdCP buyer that wants a cheaper plan sends `refine` with `ask: "reduce total by 10%"` and lets the seller re-price. An AAMP buyer sends `buyer_price` and gets back a `concession_pct`, bounded by per-round and cumulative caps that vary by access tier. AAMP's model is the only quantified agent-to-agent price negotiation published by any advertising standards body I am aware of, and the tier table that drives it is documented on [AAMP Explorer](https://aampexplorer.noetis.dev/negotiation/). AdCP's model is more expressive and much harder to test.

**AdCP puts consent off the wire; AAMP puts it on.** `known-limitations.mdx` states plainly: "AdCP does not carry a normative consent tag (e.g., IAB TCF, GPP, or equivalents ...)." AAMP's `ConsentContext` primitive holds `gpp_string`, `tcf_string`, `us_privacy` and `applicable_regimes`, and it is an optional member of the quote request, the deal booking request and the `Quote` and `Deal` objects that come back. Optional is not mandatory, so this is a carrier rather than a requirement. If your compliance review wants the consent string in the message, AAMP has somewhere to put it and AdCP has declared it future work.

## How are AdCP and AAMP governed and licensed?

This is the row most comparisons skip, and it is the row a procurement team reads first.

|                              | AdCP                                                                                                                                                                                                                                                                     | AAMP                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Steward**                  | AgenticAdvertising.org (AAO), pending 501(c)(6) Delaware trade association                                                                                                                                                                                               | IAB Tech Lab                                                                                                                                                                                                                                                                                                                                                                                   |
| **Governance documents**     | `CHARTER.md` and `IPR_POLICY.md` in the repository, with Bylaws, Membership Agreement and Antitrust Policy at agenticadvertising.org/governance                                                                                                                          | AAMP hub README, four bullet points: contributions to the child repository, architectural proposals to the hub, cross-cutting changes discussed first, IAB Tech Lab policies apply                                                                                                                                                                                                             |
| **Release model**            | Single semantic version. `dist/schemas/latest.json` is the oracle. Wire pins are release-precision (`"3.1"`), never patch-level.                                                                                                                                         | "Each repository uses independent semantic versioning. Cross-repository alignment occurs via governance coordination."                                                                                                                                                                                                                                                                         |
| **Licence**                  | Apache-2.0 across the repository                                                                                                                                                                                                                                         | Mixed. Apache-2.0 for the hub, `buyer-agent`, `seller-agent`, `agentic-direct` and `iab-agentic-primitives`. ARTF's Go reference implementation is **AGPL-3.0**, copyright Index Exchange; the ARTF specification itself is CC BY 3.0. `agentic-audiences` is CC BY 4.0 for specifications and Apache-2.0 for code, copyright LiveRamp. `registry-agent-example` ships no licence file at all. |
| **Reference implementation** | Handed to the Prebid community in February 2026, [reported by AdExchanger](https://www.adexchanger.com/ad-exchange-news/the-agentic-advertising-organization-hands-development-of-its-sell-side-agent-to-prebid/). AAO owns the specification; Prebid owns the software. | The reference implementations are the deliverable. `buyer-agent` and `seller-agent` are where the protocol currently lives.                                                                                                                                                                                                                                                                    |

The licence row is the one that will surprise people. "AAMP is Apache-2.0" is a reasonable thing to assume and it is not true. If you vendor ARTF's Go implementation into a hosted exchange, AGPL-3.0 §13 applies to your users. Check the specific repository, not the umbrella.

The governance row cuts the other way. AAO's structure is documented in the repository, and `docs/faq.mdx` names the four interim directors, says two of them are Scope3-affiliated, and dates the first Annual General Meeting to 6 May 2026. That is unusually legible for a body still describing its own incorporation as pending. IAB Tech Lab, on the other side, is the body behind OpenRTB, AdCOM, OpenDirect and GPP — the standards both stacks are built on top of. Neither of those facts is visible in a schema diff.

## How mature is each stack, honestly?

What can you actually build against today, without asking anyone for anything?

**On AdCP:** the full surface. 64 operations with request and response schemas, 761 JSON files under `dist/schemas/3.1.10/`, 339 documentation pages (333 `.mdx` and 6 `.md`), a published glossary, and 137 unique conformance storyboard ids under `dist/compliance/3.1.10/`. Versions are pinned, deprecations are dated, and one release (3.1.3, 2026-07-13) is marked "Withdrawn. Do not use." in `docs/reference/versions.mdx`. You can write a client against a frozen artifact.

One caveat on that. The prose versions page in the checkout I read lists releases only through 3.1.3, while `dist/schemas/` contains published artifacts for 3.1.4 through 3.1.10. Trust `latest.json`, not the table.

**On AAMP:** the control plane, with a warning label. `iab-agentic-primitives` gives you 13 operations, 48 JSON Schema files and 46 golden fixtures. `seller-agent` v2.4.1 gives you 74 OpenAPI paths, 91 component schemas, 46 MCP tools and 22 event types. `buyer-agent` gives you 13 paths and 43 MCP tools. ARTF v1.0 gives you a 534-line specification, a protobuf contract and two implementations. That is a lot of real surface.

The warning label is that `iab-agentic-primitives` says it is "not yet an official IAB Tech Lab release and should not be depended on for production use until this notice is removed," and both agents pin it at `v0.5.0`. Outside the control plane the picture thins fast. `registry-agent-example` is a 22-line `agent.ts`. Four files under `agentic-audiences/specs/` are zero bytes: the agent interface schema, both worked examples, and the roadmap. `seller-agent`'s own documentation says the registry client "will be updated once the AAMP spec is finalized."

**The documentation asymmetry, and what it does not mean.** The asymmetry is not raw word count. AAMP's reference implementations are heavily documented: 58 Markdown files under `buyer-agent/docs/` and 42 under `seller-agent/docs/`. The asymmetry is what the documentation is _of_. AdCP's 339 pages document a protocol that is versioned as a unit. AAMP's 100 pages document two applications, and the umbrella that is supposed to sit above them is 270 words long.

That makes AdCP far easier to describe, and it makes any symmetric table flattering to AdCP for reasons that have nothing to do with protocol design.

So be careful what you read into the volume. It tells you that AdCP can be implemented from documents alone, that its conformance claims are checkable against a released artifact, and that you can pin a version. It tells you nothing about deployed volume, or about which protocol your counterparties actually speak. On design quality it is silent.

Two places where the thinner side is ahead. First, honesty about external fidelity. `iab-agentic-primitives` ships `STANDARDS_GAP_REPORT.md`, a machine-generated self-audit with a drift-guard test asserting the file matches a fresh render, tracking 12 standards and marking 4 self-conformant and 8 "unverified (pending external spec)." Its stated rule: "'We model a field named after a standard' is never treated as 'we verified conformance against the published standard'." AdCP's 137 storyboards test conformance to AdCP; there is no comparable audit of AdCP's fidelity to the standards it borrows from. Second, `ConsentContext` gives AAMP somewhere to put a GPP or TCF string on the wire, which AdCP has explicitly deferred.

Credit the other way too. AdCP publishes `docs/reference/known-limitations.mdx` and `docs/reference/experimental-status.mdx`, an explicit non-goals list and an explicit not-yet-frozen list. Nothing in the AAMP corpus does that.

## Does either AdCP or AAMP standardise measurement?

No. Neither AdCP nor AAMP defines a measurement or attribution protocol, and both say so in their own words.

AdCP is explicit. `docs/reference/known-limitations.mdx` carries a section headed "Measurement and attribution" containing exactly one bullet: "**Not an attribution protocol.** AdCP carries exposure records, identifiers where permitted, and the outcome signals that feed attribution, but it does not specify an attribution model." The same page puts "billing-grade metric accounting" outside the protocol and states that "AdCP itself is not MRC-accredited and does not seek accreditation."

AdCP does have measurement structure. `docs/measurement/taxonomy.mdx` separates metrics ("did it happen?", seller-attested), verification ("did it count properly?", third-party attested) and attribution ("did it cause an outcome?", buyer-owned), and the third layer is deliberately left outside. The core objects `measurement-terms`, `measurement-readiness` and `measurement-window` exist. What does not exist is an operation you call to get an attributed outcome.

AAMP has less than that. There is no measurement object in `iab-agentic-primitives` at all. Reporting exists only as implementation endpoints: `/reports/{job_id}` on the buyer agent, `/api/v1/deals/{deal_id}/performance` and `/gam/report` on the seller agent. `agentic-audiences` names `measurement` as a valid `producer.agent_role`, and the schema that would carry a measurement agent's request is one of the four zero-byte files under `specs/`.

So on the single question a CFO asks first, both stacks hand the problem back to you. That is covered in more depth in [what neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/).

## Why are "sales agent" and "seller agent" not the same word?

AdCP calls the sell side a **sales agent**. `docs/reference/glossary.mdx` defines it as "an MCP server that exposes publisher inventory for discovery and purchase." AAMP calls the sell side a **seller agent**, and its repository is literally named `seller-agent`.

I grepped all eight AAMP repositories for `sales agent` and `sales_agent` across Markdown, Python, JSON, TypeScript, YAML and protobuf. Zero hits. The term does not appear anywhere in the AAMP corpus.

This matters more than a vocabulary footnote, because searching one corpus with the other's word returns nothing and reads as absence of the concept. The concepts overlap heavily; the strings do not. Term-by-term mapping is maintained on the [AdCP to AAMP terminology lookup](https://adtechglossary.noetis.dev/concepts/adcp-vs-aamp-terminology/).

While we are counting strings: I ran the same grep in the other direction, for `adcp`, `adcontextprotocol` and `ad context protocol` across all eight AAMP repositories including `iab-agentic-primitives`. Zero hits there too. **Nothing in the AAMP corpus references AdCP.** The corpus is not isolated from standards generally — `CONFORMANCE.md` tracks OpenRTB, AdCOM, GPP and TCF — it is isolated from AdCP specifically. Any comparison between these two stacks, including this one, is made from outside both.

## What does AdCP's own comparison say, and what does it leave out?

AdCP ships a comparison. `docs/faq.mdx` contains an accordion headed "How does AdCP compare to AAMP?" with a six-row table, and it closes with: "We do not yet publish a formal technical comparison because AAMP is still defining its normative surface."

Its one-line thesis: "Put simply: **AAMP is agentic bidding; AdCP is agentic buying.**"

That is right about one of AAMP's three planes and wrong about the largest one. ARTF is genuinely impression-layer: mutations applied inside an OpenRTB auction under `tmax`. But `iab-agentic-primitives`, `agentic-direct`, `buyer-agent` and `seller-agent` are campaign-layer. Quote, negotiate, book a deal, raise a change request, over OpenDirect 2.1. That is the same layer AdCP occupies, and it is where most of AAMP's code and documentation sit.

Two more rows in that table have moved. It is dated "As of April 2026." It lists AAMP's public schemas as "Being defined" — as of `iab-agentic-primitives` commit `2fc7029` (2026-07-28) there are 48 published JSON Schema files and an OpenAPI 3.1 document, in a repository marked not yet released. And it lists AdCP's maturity as "3.0 GA (released April 2026)," which was true when written and is now four minor-line patches out of date.

I am not calling the AdCP FAQ dishonest. It is a partisan source that labels itself as one, dates itself, and declines to overclaim. It is also the highest-authority comparison currently in print, which is why its layer framing propagates. Read it, then check the layer claim against `spec/openapi/iab-agentic-api.yaml`.

## What would change this analysis?

Six triggers. Each one is a file changing, so each one is checkable without a press release.

1. **`iab-agentic-primitives` drops its "NOT YET RELEASED" banner**, or gets a tag at or above 1.0. That single change moves AAMP from "implementations with an emerging contract" to "contract with implementations," and rewrites the maturity section.
2. **The AAMP hub README lists `iab-agentic-primitives`.** Today the canonical wire contract is invisible from the umbrella's own index.
3. **`agentic-audiences/specs/v1.0/schema/agent_interface.schema.json` stops being zero bytes.** That file is the join between AAMP's data plane and everything else. Until it exists, the three-planes-no-shared-type finding holds by construction.
4. **The AAMP registry API specification is published**, and `seller-agent`'s `AAMPRegistryClient` stops being described as stubbed. Agent discovery is the row where AAMP's design is most different from AdCP's and least finished.
5. **AdCP ships 3.2 or 4.0.** Deprecations are already scheduled: `format_ids` is deprecated in 3.2 and removed in 4.0, package `bid_price` is deprecated in 3.2 in favour of `bidding`, and `adcp_major_version` is removed in 4.0. The operation count in the first row of every table on this page will change.
6. **Either corpus references the other.** The first `adcp` string in an IAB Tech Lab repository, or the first normative AAMP reference in an AdCP schema, converts this page from an outside comparison into a documented relationship.

**Verified:** 2026-08-09, against `adcontextprotocol/adcp` at `f1a35ab` and the eight IAB Tech Lab repositories at the commits listed below. **Next scheduled re-check: 2026-11-09.** If the date above is more than a quarter stale, treat the counts as indicative and re-derive them from `dist/schemas/latest.json`.

## Common questions

**Is AAMP a competitor to AdCP?**
Not in any sense a lawyer would recognise, and not yet in a sense an engineer would. They are stewarded by different bodies, licensed differently, and neither references the other in any file. On the control plane they solve the same problem with incompatible types, which makes them alternatives for an implementer even though neither is positioned against the other.

**Can I implement both?**
Yes, and the transports make it cheaper than it sounds. AdCP runs over MCP and A2A. AAMP's agents expose MCP, A2A JSON-RPC and REST. An agent that already speaks MCP is adding a second vocabulary, not a second stack. What does not compose is the object model: an AdCP `media_buy` and an AAMP `Deal` are unrelated types with unrelated lifecycles, and nothing in either corpus maps between them.

**Which one has more operations?**
AdCP, by the only measure that compares like with like. AdCP registers 64 operations in one release artifact. AAMP's canonical wire contract registers 13. Counting the reference implementations instead gives AAMP 87 REST operations across 74 paths and 46 MCP tools on the seller side alone, but those are one team's application surface, not a standard, and they will change on the next minor release.

**Is AAMP a specification?**
Partly. ARTF is a specification: 534 lines of prose, a protobuf contract, a version tag. `agentic-audiences` is a draft specification that labels itself "Draft v0.1" while sitting in a directory named `v1.0`. `iab-agentic-primitives` is a specification that says it is not released yet. The rest is reference implementation. The umbrella as a whole is not one specification, and its own README does not claim to be.

**Is "AAMP 2.3" a version?**
No. That number is `buyer-agent`'s tag. AAMP has no umbrella version. Per-repository versions at the time of checking: `seller-agent` v2.4.1, `buyer-agent` v2.3.0 plus 24 commits, ARTF v1.0, `iab-agentic-primitives` v0.5.0, and no tags at all on the hub, `agentic-direct`, `registry-agent-example` or `agentic-audiences`. The [per-repository matrix](https://aampexplorer.noetis.dev/versions/) has the full list.

**Which should I implement first?**
Answer it with two questions about your counterparties rather than about the protocols. First: are you transacting direct or programmatic-direct inventory with named partners, or mutating bids inside an auction? Auction-path work has one candidate, ARTF, and AdCP does not compete for it. Second: does your counterparty publish an `adagents.json`, or does it hand you an agent card URL? Discovery is where the two stacks are least compatible and the cheapest thing to check. If neither question resolves, the honest answer is that both are early, and the AdCP side is the one you can build against without asking permission.

**Do AdCP and AAMP share any data types?**
None. They share ancestors. Both reach OpenRTB: AdCP through Trusted Match's package activation, AAMP through OpenDirect 2.1, AdCOM and the ARTF protobuf's vendored OpenRTB 2.6 import. But no schema file in either corpus references a schema file in the other.

**Does AdCP work over OpenRTB?**
No, and it says why. `docs/faq.mdx` carries an accordion headed "Why isn't AdCP an auction protocol?" arguing that OpenRTB already works at the impression layer and that AdCP targets direct-sold inventory, guaranteed deals and commerce media. Trusted Match is the serve-time layer, and it decides which pre-negotiated packages activate rather than running an auction.

## How was this page checked?

Method: local clones, direct file reads, and `grep` across whole corpora. No claim on this page comes from a vendor summary or a press release.

| Repository                          | Commit                 | Tag                                                 |
| ----------------------------------- | ---------------------- | --------------------------------------------------- |
| `adcontextprotocol/adcp`            | `f1a35ab` (2026-08-06) | released artifacts read from `dist/schemas/3.1.10/` |
| `IABTechLab/AAMP`                   | `3b20e67` (2026-04-16) | none                                                |
| `IABTechLab/agentic-direct`         | `915bda9` (2026-01-27) | none                                                |
| `IABTechLab/buyer-agent`            | `0c3a154` (2026-08-05) | v2.3.0 plus 24 commits                              |
| `IABTechLab/seller-agent`           | `2bb7ebc` (2026-08-05) | v2.4.1                                              |
| `IABTechLab/registry-agent-example` | `1ff8dda` (2026-02-24) | none                                                |
| `IABTechLab/agentic-rtb-framework`  | `7f48161` (2026-07-21) | v1.0 plus 1 commit                                  |
| `IABTechLab/agentic-audiences`      | `106ebd6` (2026-07-27) | none                                                |
| `IABTechLab/iab-agentic-primitives` | `2fc7029` (2026-07-28) | v0.5.0 plus 1 commit                                |

Three limits worth stating. The AdCP checkout is unreleased `main`, so prose pages in it can be ahead of or behind the published `dist/` artifacts; where they disagree I used `dist/`. The AAMP corpus has no released artifact directory, so every AAMP figure is a working-tree count at the commit above. And this page is written by a party with no relationship to either standards body, which means it has no inside information about either roadmap and no reason to flatter either.
