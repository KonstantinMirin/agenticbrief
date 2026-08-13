---
title: 'Protocol Integration and Agent Readiness Work'
description: 'AdCP and AAMP implementation reviews, agent readiness audits, discovery-file validation and buyer or seller agent builds, scoped against what each stack has not verified about itself.'
answer: 'Protocol integration work is the L4 business logic no SDK ships: implementation reviews against a named AdCP release, readiness audits, adagents.json and brand.json validation, and buyer or seller agent builds. Unaffiliated with AgenticAdvertising.org and IAB Tech Lab, and not a certification.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-services'
keywords:
  - 'agentic advertising consulting'
  - 'adcp implementation partner'
  - 'buyer agent development'
  - 'agentic readiness audit'
citations:
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://docs.adcontextprotocol.org/docs/building'
  - 'https://docs.adcontextprotocol.org/docs/building/cross-cutting/sdk-stack'
  - 'https://docs.adcontextprotocol.org/docs/building/verification/aao-verified'
  - 'https://docs.adcontextprotocol.org/docs/building/verification/conformance'
  - 'https://docs.adcontextprotocol.org/docs/aao/directory-api'
  - 'https://docs.adcontextprotocol.org/docs/ai-disclosure'
  - 'https://docs.adcontextprotocol.org/docs/faq'
  - 'https://docs.adcontextprotocol.org/docs/accounts/overview'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
  - 'https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/guides/agent-discovery-files/'
  - '/guides/how-a-machine-buys-media/'
  - '/protocols/aamp/'
  - '/about/'
faq:
  - question: 'Are you affiliated with AgenticAdvertising.org or IAB Tech Lab?'
    answer: 'No. Neither organisation has reviewed, endorsed or funded this work, and nothing here confers AAO or IAB status.'
  - question: 'Can you get my agent AAO Verified?'
    answer: 'No. AAO Verified eligibility requires an active AAO membership at an API-access tier, and a membership lapse revokes the badge immediately regardless of storyboard results. I can get you to a passing storyboard run. The membership is between you and AAO.'
reviewState: cto-reviewed
---

The protocol layer of an agentic integration is nearly free, and AdCP is the one saying so. The layer underneath it, the one that decides whether your agent sells anything worth selling, has never been priced by anybody, AAO included. Every quote you receive this year blurs the two together, which is how the expensive half gets billed as though it were the cheap one.

So split any integration proposal in half before you read the number on it. Ask which of the two layers the figure covers, ask for the second half itemised, and treat a single blended total as a refusal to answer.

Four pieces of work sit against that split, and each one ends in something written down:

| Engagement                  | What it ends in                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Implementation review       | Your requirement level per operation, the deprecated fields you are still sending, and the operations you built that nobody asked you for |
| Readiness audit             | A written finding on role, transport, requirement level, discovery model and registry access, plus a build-or-wait recommendation         |
| Discovery file work         | `adagents.json` and `brand.json` in the correct one of the two permitted shapes, validating against a named release                       |
| Buyer or seller agent build | L4 written against the published schemas, on top of the SDKs at L0 to L3                                                                  |

## Your engineering lead is pricing the whole build. The standards body is pricing the three-quarters an SDK already ships.

The cheap number is a card on the front page of AdCP's [building docs](https://docs.adcontextprotocol.org/docs/building):

> Point a coding agent at a skill file, get a storyboard-compliant AdCP agent in 2–8 minutes (protocol layer only — see Operating an agent for the full going-live scope).

Leave that parenthetical in and the number covers a quarter of the engineering. AdCP numbers its own stack L0 to L4 — wire and transport, identity and signing, auth and registry, protocol semantics, and your business logic — and every SDK on either side of the industry stops at L3. Storyboard-compliant is a narrow claim about the first four of those: storyboards are AdCP's executable conformance suite, YAML scripts a compliance runner replays against a live agent, and the [conformance page](https://docs.adcontextprotocol.org/docs/building/verification/conformance) says flatly that "the storyboards ARE the conformance specification."

The same documentation prices that path for anyone who is not pointing a coding agent at a skill file. An agent "enforces the protocol (~3–4 person-months at L0–L3)" while a caller "consumes it (weeks of handler glue)". Then: "SDKs absorb L0–L3; **L4 is the part you write either way.**"

AdCP decomposes L3 to the week: six to seven weeks for the seven lifecycle state machines, a week for the idempotency cache, one or two each for the async-task store, the error catalog and the `comply_test_controller` surface. That totals a from-scratch agent at 14 to 18 weeks for one senior engineer, with an instruction to multiply by two or three at publisher scale. Against L4 the same document writes one line: "Out of scope for any SDK. The adopter writes this."

I don't publish an L4 range either, and I'd distrust anyone who does. A band is honest at L0 to L3 because it is the same work at every shop, which is exactly why AdCP could publish one and why you can hold any vendor to it. At L4 the same job title covers a two-file review and a full sell-side build. Sell-side L4 is inventory forecasting against your real ad server, pricing and deal terms, creative review policy, and upstream calls to GAM, FreeWheel, Kevel or your own decisioning engine. Ask your ad ops lead one question before you scope anything: are forecast and rate card available over an API today? That answer sizes the project more than the protocol choice does. If they are, L4 is wiring. If they are not, the first half of your agentic project is exposing them, and that half is not an AdCP project at all. Buy-side L4 is smaller by construction — planning, budgeting, agent selection, reporting ingest — with no server to stand up and, in AdCP's own words, "no conformance bar to certify against on the consumer side". Ask me for a number once that scope is written, and apply the same rule to anyone who offers you one before it is.

AdCP ships one versioned registry, maintained by AgenticAdvertising.org (AAO), a Delaware nonprofit trade association. AAMP, Agentic Advertising Management Protocols, is IAB Tech Lab's umbrella over eight repositories that version independently of each other, so an AAMP integration has nothing single to pin. That difference is most of why the two stacks cost different amounts to adopt.

| Layer                     | What it covers                                                                                                   | AdCP  | AAMP                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------- |
| L0 — wire and transport   | JSON-over-HTTP framing, MCP envelopes, A2A SSE streams, schema validation                                        | SDK   | `iab-agentic-primitives` v0.5.0, installed from a git tag |
| L1 — identity and signing | RFC 9421 HTTP message signatures, key rotation, replay windows                                                   | SDK   | same package                                              |
| L2 — auth and registry    | Agent identity verification, brand resolution, AAO bridge, multi-tenant account resolution                       | SDK   | registry is an external service with a credential gate    |
| L3 — protocol semantics   | Lifecycle state machines, idempotency, error catalog, async-task contract, webhook emission, conformance surface | SDK   | 48 JSON Schemas, three of them half-built                 |
| L4 — business logic       | Inventory, pricing, creative review, decisioning; or planning, buying, reporting                                 | yours | yours                                                     |

There is no GA SDK in that right-hand column, and the shared wire contract is [unreleased by its own statement](https://aampexplorer.com/versions/). Both IAB reference agents pin it from a git URL rather than a package index: `iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0`, identically, in `seller-agent/pyproject.toml` and `buyer-agent/pyproject.toml`. Three of its schema pairs are missing a half: `AgentDiscovery` has a request and no response, `ChangeRequest` and `NegotiationRound` have responses and no requests. You write those halves yourself, so does everyone else integrating against AAMP, and nothing forces two of those implementations to land on the same shape.

## Your role needs seven operations. The buyer's role needs none.

AdCP 3.1.13 registers 64 operations. That is the number a vendor will scope against, and it is the wrong one. The [required-tasks specification](https://docs.adcontextprotocol.org/docs/protocol/required-tasks) breaks the surface down by role, and the per-role sets are small.

| Role                                    | Required | Conditional | Optional |
| --------------------------------------- | -------- | ----------- | -------- |
| Media Buy — sales agent (seller)        | 7        | 2           | 4        |
| Media Buy — orchestrator (buyer)        | 0        | 0           | 0        |
| Creative agent                          | 1        | 3           | 3        |
| Signal agent                            | 2        | 0           | 0        |
| Brand agent                             | 1        | 4           | 0        |
| Governance — campaign                   | 4        | 0           | 0        |
| Governance — property                   | 5        | 0           | 1        |
| Governance — collection                 | 5        | 0           | 0        |
| Governance — content standards          | 4        | 0           | 3        |
| Governance — creative                   | 1        | 0           | 0        |
| Sponsored Intelligence                  | 3        | 0           | 1        |
| Accounts (any agent accepting accounts) | 0        | 4           | 1        |

Every agent also owes the shared `get_adcp_capabilities`. The media buy and creative rows already count it; add one to every other row, so a signal agent's real Required set is three operations rather than the two printed above.

The specification is blunt about the buyer: "Orchestrators are not MCP/A2A servers — they call sales agent tasks." Buy-side conformance is five numbered obligations and not one implemented operation: authenticate, send required fields, handle async task responses and webhook delivery, carry `media_buy_id` forward, respect `creative_deadline`. A readiness score that grades a DSP on operation count therefore has nothing to count, and will report a zero that says nothing about the DSP.

Two operations in that requirement matrix are not in the published registry at all. `sync_agent_notification_configs` is listed Conditional for every AdCP agent; `validate_property_delivery` is listed Optional for property governance. Neither name appears anywhere in the 3.1.13 schema index. The document you'd be graded against lists operations the release never registered, and the full registered-versus-shipped split is [on adcpexplorer](https://adcpexplorer.com/schemas/).

## The work is at the boundaries neither stack has verified

AAO and IAB Tech Lab have each published an inventory of what they have not checked. Neither inventory mentions the other stack, which is the [wider asymmetry](/protocols/adcp-vs-aamp/) in one specific form. Put the two inventories side by side and you have the scope of an integration.

AAMP's inventory is machine-generated, and that is the only reason I trust the numbers in it. [`STANDARDS_GAP_REPORT.md`](https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md) in `iab-agentic-primitives` is rendered by the library's own conformance runner, with a drift-guard test asserting the committed file matches a fresh render. It tracks 12 standards: 4 fully self-conformant, 0 partial, 8 unverified pending external spec. Its own executive summary names the worst one: "Highest-priority gap: IAB OpenDirect 2.1 — field-level fidelity for the core commercial booking surface (Orders / Lines / Products) is the most consequential unverified claim."

I'd go further than they do. The unverified list includes AAMP's own [agent registry](https://adtechglossary.com/agents/agent-registry/) specification, and the remediation step reads: "Obtain the IAB Tech Lab AAMP (agent discovery and trust registry) specification." The people who wrote the wire contract couldn't get the registry spec either.

| Boundary                   | AdCP                                                                                                    | AAMP                                                                                                                                       | Where it bites                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Commercial booking         | 64 operations registered at 3.1.13, with a storyboard suite that grades an agent's declared specialisms | OpenDirect 2.1 UNVERIFIED, named the highest-priority gap                                                                                  | Reconciling an agentic order with the system that bills it |
| Discovery and trust root   | `adagents.json` on the publisher's own domain; the AAO directory is "discovery, not authorization"      | `GET /.well-known/agent.json`, public, no auth, self-declared capabilities                                                                 | Deciding whether an agent may sell what it is offering     |
| Registry entry             | a file you host                                                                                         | a live service at `registry.iabtechlab.ai`, JWT bearer, company domain must match `primary_domain`                                         | Whether you can onboard without an IAB credential          |
| Verification status        | AAO Verified is still Request for Comments, membership-gated, qualifiers half-renamed                   | [`trust_status`](https://adtechglossary.com/negotiation/trust-status/) semantics "asserted by our own spec, not against AAMP publications" | Every contract clause that says "verified agent"           |
| Consent strings (GPP, TCF) | not audited                                                                                             | carried as opaque values on the EP-10.4 ConsentContext; no section validation, no TC-string decode, no GVL check                           | EU and California delivery                                 |

AdCP's problem is internal drift. The [verification page](https://docs.adcontextprotocol.org/docs/building/verification/aao-verified) says plainly that "The (Sandbox) qualifier replaces the earlier draft's `Verified (Live)` framing", citing issue #4379 for the reframe verdict. Five other doc files still use `(Live)` normatively, and one of them turns it into a requirement: the [accounts specification](https://docs.adcontextprotocol.org/docs/accounts/overview) says media-buy sales agents advertising "AAO Verified (Live)" readiness "MUST support a named scope identified by `scope_name: "attestation_verifier"`". Read that specification front to back and you'll build a named authorisation scope to qualify for a badge tier the verification page says was replaced. Closing that MUST is a reading job for you and an open issue for them.

Those rows don't cost the same to close. The trust-mark drift is findable in your accounts implementation in an afternoon, and the finding is which scope you built for nothing. OpenDirect fidelity only surfaces in a build, because it is a field-by-field reconciliation between an agentic order and the system that bills it, and nobody grades that from the outside. The registry specification stays open whatever anyone does: IAB Tech Lab hasn't published it, and what is documented anywhere about `registry.iabtechlab.ai` comes from the AAMP client library's own sandbox notes rather than from a specification. Until that changes, no work on your side closes that row, and any vendor who tells you otherwise is quoting you for a document they do not have either.

## Every engagement ends in a written finding against a named release

Scope follows your role in the transaction. The size of the protocol has almost nothing to do with it, which is why the four engagements below differ more by which side of the transaction you sit on than by which stack you picked.

**An implementation review** is a second reader on an integration you've already started. I grade what you've built against the required-tasks specification for your role, and against the 3.1.13 schema index for the operations, rather than against whatever `main` happens to contain that week. It ends in a list: deprecated fields you are still sending, your requirement level per operation, your transport declaration, and the operations you implemented that nobody asked you for.

**A readiness audit** is the same exercise before any code exists. Role in the transaction, transport, requirement level, discovery model, and whether the registry you'd federate into will let you in. It ends in a written finding on each of those five, a gap list against a named release, and a build-or-wait recommendation with the reasoning attached. There is no maturity score in it.

The cheapest useful thing a publisher can do is get `adagents.json` and `brand.json` right, and it is the thing most often wrong on the first attempt. The file has two mutually exclusive shapes, a URL-reference variant requiring `authoritative_location` and an inline variant, and picking the wrong one is the most common first error I see. `delegation_type` takes exactly three values, `direct`, `delegated` and `ad_network`, before you get to `collections`, `placement_ids` and `placement_tags` scoping. Scale is why the AdCP directory API exists at all: the [directory-API docs](https://docs.adcontextprotocol.org/docs/aao/directory-api) say CafeMedia alone delegates around 6,800 publisher domains under a single manager file. I wrote [how the discovery files fit together](/guides/agent-discovery-files/) as the free version of this. The paid version is me reading yours.

Builds are the rest of it, and the largest part. Sell-side that means inventory, pricing, creative review and decisioning, wired to the seven operations a sales agent owes and to whichever of its two Conditional and four Optional ones your business actually needs. Buy-side there is no server to stand up at all, so a buyer agent build is planning, buying and reporting against someone else's operations, plus the five orchestrator obligations the specification puts on the caller. I use the AdCP SDKs at L0 to L3 and write L4 against the published schemas, not against a commercial vendor's abstraction over them, because the schemas are the thing that carries a version number. [How a machine buys media](/guides/how-a-machine-buys-media/) traces the wire-level path one of those builds follows, end to end.

## The bills that arrive when nobody does this work

Anthony Katsur, IAB Tech Lab's chief executive, says standards proliferation is a real cost to the industry. Katsur is describing a cost his own organisation is generating: eight repositories versioning apart from each other, no GA SDK, and a registry specification his own wire-contract authors have filed a remediation step asking to be sent. Neither standards body pays for the split it creates. You do, in four places, and all four are cheap to close early and expensive to close late.

The first is internal, and it is the one that actually stops projects. From a publisher running an AdCP sales agent trial, on [r/programmatic](https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/):

> "we spent 3 weeks just trying to get sales and ops to align on what a 'good deal' looked like before we could automate anything useful"

There is no protocol in that work. Floor prices by format and daypart, which advertisers get exclusivity and on what terms, which first-party segments an agent may expose to a stranger, what a house account is allowed to undercut: none of that is in a schema, none of it ships in an SDK, and every one of those decisions is currently made by a person applying judgement they have never had to write down. An agent applies the policy it can read, so either somebody writes those decisions down or the defaults in your handler code become your commercial policy. Three weeks is what the alignment costs when sales and ops sit in the same building and both want the project. It is a quarter when the two functions report into different P&Ls and the answer moves someone's commission, and that is the version I see more often. The integration ships either way, on whatever the engineer picked, and starts executing terms nobody signed off.

The other three are quicker to name. Building against documentation instead of against a release gets you an authorisation scope written for a retired badge tier and handlers for two operations the registry never carried, with no way to tell which is which until you read the schema index yourself. A discovery file in the wrong shape fails silently: nothing errors, your inventory is simply not attributable to the agent you authorised, and a buyer that validates strictly has grounds to ignore the file entirely. And a blended quote hides which half of the stack you are paying for until the invoice for the second phase arrives.

## Can anyone sell you an AAO Verified badge?

AAO Verified eligibility requires "an active AAO membership with API-access tier", and AAO's own registry documentation is blunt about what happens next: "Membership lapse revokes the entire badge immediately, regardless of storyboard results." The mark is also explicit that it is "Not certification beyond AAO membership". AAO runs both things: the trust mark, which grades an agent's wire behaviour against the storyboards, and a graded certification track in its Academy, where the [AI disclosure page](https://docs.adcontextprotocol.org/docs/ai-disclosure) says AAO "is both the issuer and the grader of these credentials". Passing one gets you nothing in the other. I can get you to a passing storyboard run. I can't sell you the membership, and neither can any other vendor.

Worth knowing whose incentives are in that paragraph: AAO sells the membership the badge depends on, and I don't buy media, plan it or resell it, and take no commission on spend, so the only thing I have to sell you is the reading. [About](/about/) sets out how the verification here is done and who pays for it.

## The AdCP SDKs cover L0 to L3 for nothing

AAO handed development of the reference sell-side agent to the Prebid community in February 2026, described in the [SDK stack docs](https://docs.adcontextprotocol.org/docs/building/cross-cutting/sdk-stack) as an open-source seller-side agent publishers run as their AdCP-facing implementation, "hand-rolled at L0–L3 today". What that free path doesn't cover is pointing it at your actual inventory and finding out which boundary breaks.

There is also a threshold below which the honest finding is to wait. If your role's Required set is two operations, and the registry you'd federate into is specified by a document the standard's own authors have asked to be sent a copy of, that is what the audit says, and it says it in writing.

## If you want the L0 to L3 code written, hire someone else

Publishers and platforms deciding whether to expose a sales agent. Agencies and DSPs weighing a buyer agent build against holding for one more release, where the audit costs less than the quarter you'd otherwise spend guessing. Vendors who want a reader from outside both standards processes, which is most of my work.

Not you, if what you want is an implementation partner to write the protocol layer. The SDK already ships it, and any line item covering it is a line item you can strike before you sign.

[AdCP vs AAMP](/protocols/adcp-vs-aamp/) compares them row by row. If you only want the boundary list, that is [what neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/). [AAMP](/protocols/aamp/) is the maturity read on the IAB side, and the gap report itself is [here](https://aampexplorer.com/repos/iab-agentic-primitives/).

Email hello@agenticadlab.com with your role in the transaction, your current integration state, and which stack. That's enough for me to say whether there's an engagement here or whether you get a two-line reply telling you to wait.
