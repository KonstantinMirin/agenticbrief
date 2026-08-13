---
title: 'Five Gaps Neither AdCP Nor AAMP Fills, and the Registry That Should Police Them'
description: "Measurement, invalid traffic, settlement, cross-stack identity and disputes are contract work in both agentic ad stacks, and AdCP's own non-goals page is stale against its schemas."
answer: 'Neither AdCP 3.1.13 nor any AAMP repository standardises measurement, invalid-traffic detection, billing settlement, cross-stack identity or dispute resolution. All five land in a contract you renegotiate with every counterparty, which is what makes them expensive.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-limits'
keywords:
  - 'agentic advertising protocol limitations'
  - 'adcp non-goals'
  - 'aamp gaps'
  - 'agentic advertising procurement risk'
citations:
  - 'https://docs.adcontextprotocol.org/docs/reference/known-limitations'
  - 'https://docs.adcontextprotocol.org/docs/reference/experimental-status'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/measurement/taxonomy.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/attribution-methodology.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/available-metric.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/measurement-terms.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/performance-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/account/get-account-financials-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/identity-match-request.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/state/Reconciliation.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Agent.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/ConsentContext.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Proposal.json'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/main/specs/v1.0/schema/agent_interface.schema.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://www.prnewswire.com/news-releases/iab-tech-lab-releases-aamp-2-3--bringing-enterprise-grade-infrastructure-and-privacy-diligence-to-agentic-advertising-302838652.html'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/agent-discovery-files/'
  - 'https://aampexplorer.com/repos/agentic-audiences/'
  - 'https://aampexplorer.com/repos/seller-agent/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
  - 'https://adcpexplorer.com/areas/governance/'
  - 'https://adtechglossary.com/negotiation/trust-status/'
faq:
  - question: 'Is a gap the same as a flaw?'
    answer: 'No. AdCP declining to specify an attribution model is a scoping decision, and docs/measurement/taxonomy.mdx argues it: attribution changes faster than delivery reporting, and putting it in delivery schemas would force a schema break every cycle. The risk is a buyer assuming the protocol covers it.'
  - question: 'Which stack is riskier to adopt today?'
    answer: "AdCP publishes its weaknesses, dates them and schedules the fixes, so you can price them. AAMP's risk is different in kind: its announcements and its repositories describe different products, and the announcement is the more finished of the two."
  - question: "Does AAMP's ConsentContext close the privacy gap AdCP leaves open?"
    answer: 'Partly. ConsentContext carries GPP, TCF and US Privacy strings, but its own description says strings are carried opaque, with no decoding or vendor-list validation claimed, and STANDARDS_GAP_REPORT.md lists both GPP and TCF as unverified. AdCP carries no normative consent tag at all.'
  - question: 'Should I wait for the gaps to close?'
    answer: 'Waiting has its own cost. Ask instead whether the part you need is specified. Discovery and transaction are, on both sides. Creative and governance are, on the AdCP side. Measurement, settlement and disputes are custom work whenever you start.'
reviewState: cto-reviewed
---

Measurement, invalid-traffic detection, billing settlement, cross-stack identity and dispute resolution. Neither AdCP nor AAMP standardises any of the five, so each of them ends up in a contract instead of a schema, and that is what makes them expensive. A schema is a one-time integration cost. A contract is one you pay again with every counterparty you sign.

The single finding I would carry into a procurement review is smaller than any of the five and sits underneath all of them. AdCP has one human-review rule that a schema enforces rather than a policy document requests, covering fair housing, fair lending, fair employment, pharmaceutical advertising and EU AI Act Annex III, and it fires only for buyers who have opted into plan registration. Nothing in the protocol notices when a counterparty doesn't.

AdCP, the Ad Context Protocol, is one versioned registry, currently 3.1.13, and it publishes its own non-goals, which more specs should. [`docs/reference/known-limitations.mdx`](https://docs.adcontextprotocol.org/docs/reference/known-limitations) opens with a line worth stealing: "Knowing what a protocol doesn't do is part of evaluating it." Hold that page against the schemas the same repository ships and it undersells AdCP in one place, and in another it describes a mechanism that no longer exists. The shipped half is not frozen either: every schema file under `trusted-match` and every one under `sponsored-intelligence` carries an `experimental` `x-status` marker, so identity matching and sponsored discovery are both still moving under anyone building on them.

[AAMP](/protocols/aamp/) is IAB Tech Lab's programme of eight independently versioned repositories, whose own files disagree about what the acronym stands for, and there is nothing at the umbrella level to hold anyone to. The nearest artifact is `STANDARDS_GAP_REPORT.md` inside `iab-agentic-primitives`, which is at v0.5.0 and unreleased by its own README. It audits that library against 12 external standards, marks 8 unverified, and writes down a rule I have not seen another spec put in writing: "'We model a field named after a standard' is never treated as 'we verified conformance against the published standard'."

Disclosure, because it colours everything below: [drafting those clauses against the schemas](/services/) is work we sell.

| Gap                              | AdCP 3.1.13                                                        | AAMP                                                                | Risk lands on |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------- |
| Measurement and attribution      | Non-goal, beside an empty `measurement` protocol                   | No measurement object in the shared contract                        | Buyer         |
| Invalid traffic and verification | Outside the protocol; contractible via `performance-standard.json` | Viewability priced and goal-tracked, never attested                 | Buyer         |
| Billing settlement               | Non-goal; usage reporting only                                     | No invoice, usage or payment primitive                              | Both          |
| Cross-stack identity             | Opaque tokens, no cross-protocol mapping                           | Audience, bidstream and account identities, no mapping between them | Buyer         |
| Dispute resolution               | Terms declared, no operation to raise one                          | Divergence classified, resolution undefined                         | Both          |
| Agent registry                   | Exists; no key transparency until 4.0                              | Trust rooted in a registry with no published spec                   |               |

Programmatic never standardised these five either: invalid traffic sat with MRC accreditation and the vendor layer, settlement sat in the insertion order, and a shortfall was argued out between two account teams. AdCP says so in the flattest sentence on its limitations page: "AdCP is the wire and the contract, not the ledger." Read that as a boast and it is half right. The wire is real; the contract it means is the deal terms a buy carries, not the counting authority, the verification vendor or the remedy for a shortfall. What changes is the human. An insertion order gets drafted because a person is about to press buy; an agent presses buy on its own schedule, so the clauses have to exist first.

Neither corpus names a deployment. The named, dated ones are in the [deployments ledger](/guides/who-is-running-agentic-buys/); what the repositories tell you is the state of the parts those deployments are built on.

The last cell in the registry row is empty because no risk lands there on its own. The registry is the enforcement point for the other five. On the AAMP side trust status caps the access tier, which caps the price a buyer is allowed to see. On the AdCP side the registry binds a counterparty domain to a verification key. If the registry can be spoofed or mocked, every contractual control resting on it becomes advisory.

## Where the published statements and the repositories disagree

| Published statement                                                                                                               | What the repository contains                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IAB Tech Lab, 30 July 2026: Agentic Audiences v1.0 is "ready for fully programmatic and agentic transactions"                     | `specs/v1.0/schema/agent_interface.schema.json` is 0 bytes on `main`, as are both example payloads and `specs/roadmap.md`                                               |
| `known-limitations.mdx`: "3.0 rejects `authority_level: agent_full` at the schema level" on three policy categories               | `authority_level` is not a field anywhere in `dist/schemas/3.1.13/`, so the rejection survives only in prose                                                            |
| Same file: pharmaceutical advertising "relies on the governance-agent implementation rather than a schema invariant"              | `governance/sync-plans-request.json` forces `human_review_required: true` on four categories including `pharmaceutical_advertising`, and again on `eu_ai_act_annex_iii` |
| `docs/faq.mdx` line 165: AdCP's advertising scope is "Sponsored discovery, media buying, creative, brand governance, attribution" | Line 53 of the same file: "AdCP does not specify attribution or viewability." No published operation sits behind the `measurement` protocol                             |

Three of the four rows are AdCP against itself, and it goes stale in both directions. The non-goals page is stamped "AdCP 3.0" while the published release is 3.1.13. It describes a rejection mechanism that no longer ships and undersells the human-review invariant that does. Its FAQ claims a scope the same file denies a hundred lines earlier.

The AAMP row costs a buyer more, and it doesn't stand alone. [What each of those repositories actually holds](/protocols/aamp/) is the wider version of that one line.

Documentation lags schemas and announcements lead them, which is true of every standards organisation I have read. The prices differ. A stale non-goals page wastes an afternoon of your implementer's time; an announcement running a year ahead of an empty schema file can waste a slot on your roadmap.

## Measurement: AdCP has opened a protocol with nothing in it

In 3.1.13, `measurement` is the seventh value in the `supported_protocols` enum of `get-adcp-capabilities-response.json`, and no published operation sits behind it. The schema is candid about this: the protocol "is experimental in 3.1 and currently scoped to `get_adcp_capabilities` catalog discovery," and "additional measurement tasks (reporting, attribution, etc.)... land in subsequent minors." So a seller can advertise a measurement protocol with no tasks in it, and a buyer's capability check will pass. The same repository's limitations page says AdCP "does not specify an attribution model." One of those two files has to give.

The non-goal undersells what AdCP actually carries. `enums/attribution-methodology.json` is a closed four-value vocabulary: `deterministic_purchase`, `probabilistic`, `panel_based`, `modeled`. Its description of `modeled` names Media Mix Modeling, Multi-Touch Attribution and incrementality testing outright. `enums/available-metric.json` carries 36 metrics, `roas` and `incremental_sales_lift` among them. So the wire transports attributed numbers and refuses to compute them, and the vocabulary exists to stop anyone summing a panel number with an MMM number, which is the right line to draw.

Nothing in `iab-agentic-primitives/spec/jsonschema/` is a measurement, report or delivery object. The corpus has one delivery-performance endpoint, `/api/v1/deals/{deal_id}/performance` on the [seller agent](https://aampexplorer.com/repos/seller-agent/), described in its own OpenAPI document as returning "placeholder/mock stats initially — real ad server integration comes in a future phase." `agentic-audiences` gets closer, listing `measurement` as a valid `agent_role`. The file that would carry that agent's request, `specs/v1.0/schema/agent_interface.schema.json`, is zero bytes on `main`.

## Neither protocol detects invalid traffic

Both standardise the paperwork around detection and leave the detecting to the vendor layer, which AdCP names outright: GIVT/SIVT filtration, viewability and brand-safety verification "execute in the delivery stack or the chosen vendor layer (e.g., DoubleVerify, IAS, HUMAN)."

The asymmetry is in the paperwork. `core/performance-standard.json` binds a metric to a threshold and a named vendor, requires a `standard` whenever the metric is `viewability`, and adds a rule with teeth: "when specified on a confirmed package, creatives MUST include tracker_script or tracker_pixel assets from this vendor." `ivt` is the only metric in it measured as a ceiling, and `get_products` filters accept `required_performance_standards`, so the requirement travels with discovery. You can write verification into the deal. Measuring it is somebody else's job.

AAMP's wire prices viewability, bills on it and sets goals against it, and can't say who measured any of it. `cpmv` is a pricing model across its schemas, and `Proposal.json` carries `viewable_impressions` as a `GoalType` and `viewable_impression` as a `BillableEvent`. That is worse than having only a price, because a goal type invites a commitment nothing in the corpus can adjudicate. ARTF, the `agentic-rtb-framework` repository and AAMP's in-auction agent layer, goes further. `ADD_METRICS = 7` in its protobuf lets an in-path agent write OpenRTB `Metric` objects into a bid request, and `Metric.type` is "exchange curated string names," an open string curated by whoever runs the exchange. AAMP's first measurement primitive is a mechanism for injecting unattested viewability numbers into a live auction.

## The money never touches the wire

An agent can commit a budget over the protocol and there is no protocol underneath the money, so the finance half of an agentic buy stays manual on both stacks.

AdCP's "Commerce and settlement" section is three bullets long. Two of them: no in-protocol payment, because "`report_usage` provides the consumption data that feeds invoicing" and everything after that happens out-of-band; and one ISO 4217 currency per buy, so "the buy either uses a matching currency or is rejected." No operation in the registry is named for an invoice, a payment or a settlement. `get_account_financials`, which sounds like it might help, guarantees "only account, currency, and period" on success.

AAMP models money better at the primitive level and not at all at the process level. FD-11, one of the numbered flagged decisions the primitives repository uses to record a binding choice, requires integer micros and rejects float-typed money on the wire, which is a better default than AdCP's. `RateCard` is then the only money primitive in the corpus: no `Invoice`, no `Usage`, no `Payment`.

A publisher reading this should notice which way the absence cuts. AAMP makes the seller's count authoritative when the two sides diverge, and AdCP has the seller proposing the remedy from an agreed menu, so an unspecified settlement path leaves the party that already holds the numbers holding them. Neither body wants to be in payments and neither should be, but the cost of that decision lands on a finance team rather than on a standards body. The [wire trace](/guides/how-a-machine-buys-media/) shows where the automation stops and accounts payable picks it up.

## No identity crosses between the stacks, or inside AAMP

AAMP carries three identities and no file maps any one onto another. There is an audience-side identity, `{namespace, value_hash, confidence}` inside an `agentic-audiences` embedding envelope. There is a bidstream identity, `ADD_CIDS = 8` in ARTF, which injects extended content identifiers into a bid request. And there is an account identity, `BuyerIdentity` in the control plane, optional fields running from `seat_id` to `campaign_name`, whose docstring says what AAMP thinks identity is for: "buyer identity revealed progressively to unlock better pricing." An organisation is being described there, not a person.

AdCP keeps identity opaque and enforces it structurally rather than by policy: `identity-match-request.json` returns `eligible_package_ids` and a `serve_window_sec` and carries no page context, while `context_match` carries page context and no identity. `sync_audiences` takes `hashed_email` and `hashed_phone`, SHA-256 only. Then `known-limitations.mdx` narrows its own claim twice, in a lawyer's language rather than a spec author's: "AdCP authenticates agents, not the humans they act for," and "SHA-256 hashes of email and phone remain pseudonymous identifiers under GDPR and CPRA."

Across the two stacks there is nothing at all, which follows from the finding underneath the whole [protocol comparison](/protocols/adcp-vs-aamp/). Hold one audience definition for both sides and you translate it by hand, every time, with nothing published to check it against.

## The dispute flow both stacks describe and neither ships

You pick up the phone. AdCP's schemas describe the whole dispute and implement none of it.

`core/measurement-terms.json` hands you the vocabulary. `billing_measurement.vendor` is the party "whose measurement of the billing metric is authoritative for invoicing." `max_variance_percent` is the divergence between the two parties' counts "before resolution is triggered." `makegood_policy` reads: "when a breach occurs, the seller proposes a remedy from this menu; the buyer accepts or disputes." Then it stops. The schema tells two autonomous agents the exact percentage at which they should disagree and ships no message for the disagreement: "No protocol-level delivery-dispute flow... A structured dispute task is a candidate for future work."

AAMP has the state machine AdCP lacks and stops one step earlier. `state/Reconciliation.json` encodes FD-8 as a full state-pair table across change requests, deals and orders, classifying every pair as `consistent`, `buyer_behind`, `seller_behind` or `divergent`, with the seller authoritative and the policy stated outright: "divergence is reported, not silently resolved." AdCP has no equivalent. What happens after `divergent` is undefined, and the word "dispute" survives in AAMP only as prose inside the two agent implementations, never in the shared wire contract. Whatever either body means by autonomous buying, it stops at the first disagreement.

## Can either registry be trusted with autonomous spend?

`Agent.json` is emphatic about trust. It defines `TrustStatus` — `unknown`, `registered`, `approved`, `preferred`, `blocked` — as "verified against the AAMP registry... never self-asserted." The same repository's `STANDARDS_GAP_REPORT.md` files that registry as UNVERIFIED: "No check against the AAMP registry specification... trust_status semantics are asserted by our own spec, not against AAMP publications." The canonical wire contract cannot verify the registry its own trust model is rooted in.

Downstream, the reference implementation is blunter than its documentation: the default `AAMPRegistryClient` says `verify_registration()` and `lookup_agent()` "return realistic mock data", and the real client only runs when an environment variable points it somewhere. The mock is the default, so five graded trust levels collapse into whatever list the operator keeps locally. The [discovery guide](/guides/agent-discovery-files/) has the registry hostnames and what each one answers.

AdCP's registry works, and its own limitations page tells you how to defeat it. There is no enrollment ceremony binding a domain to a root verification key and no append-only rotation record, so "an attacker who controls a counterparty's CDN, DNS, or `/.well-known` path can serve attacker-controlled keys." Trust-on-first-use with continuity is the mitigation, "detectably raising the bar, but not cryptographically closing the gap," and the full fix is a 4.0 deliverable. So the answer is no, in two different ways: underwrite autonomous spend against either registry and your control is a domain takeover away in one case and an operator's local list in the other.

## AdCP's strongest control is the one you have to volunteer for

AdCP's [governance protocol](https://adcpexplorer.com/areas/governance/) is the largest area in the registry, and it holds AdCP's only human-review rules that a schema enforces rather than a policy document requests. `governance/sync-plans-request.json` sets `human_review_required` to a constant `true` when a plan declares fair housing, fair lending, fair employment or pharmaceutical advertising, and again when it declares `eu_ai_act_annex_iii`.

Then `check_governance` validates against a `plan_id`. An implementer who never calls `sync_plans` has no plan to check against, so the invariants never fire and nothing in the protocol notices. The rule that could stop an agent buying fair-housing inventory with no human in the loop only fires if you opt in, and anything you opt into is a feature.

## The five clauses you write yourself

One per gap, and nobody writes them for you.

1. Name the counting authority and the tolerance. `billing_measurement.vendor` and `max_variance_percent` put both on the wire; the remedy for a breach is yours to draft, because no schema in either corpus carries one.
2. Name your verification vendor and its thresholds. `core/performance-standard.json` carries the metric, threshold, standard and vendor once you have agreed them, and agreeing them is contract work.
3. State the settlement mechanism and the currency. One ISO 4217 currency per buy or the buy is rejected, and everything downstream of `report_usage` leaves the wire.
4. Put a name on the audience crosswalk. One person owns the mapping between an AAMP `{namespace, value_hash, confidence}` identity and the SHA-256 hashes `sync_audiences` accepts, in writing, because nobody else publishes it.
5. Attach a phone number to `divergent`. `Reconciliation.json` will tell you the two agents disagree and will not tell you who to call.

All five are per-counterparty. Ten partners is ten sets of clauses, and no schema release reduces that number.

## Each gap closes as a file changing, not as an announcement

| Gap                  | What has to change                                                             | Where you would see it                                                               |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Measurement          | A task appears under the `measurement` protocol AdCP has already declared      | The current release's `index.json`                                                   |
| Verification         | A wire attestation replaces contract terms                                     | `core/performance-standard.json`, or a new AAMP primitive that names a measurer      |
| Settlement           | An invoice or payment object, or an explicit handoff to a commerce protocol    | AdCP's "Commerce and settlement" bullets; `iab-agentic-primitives/spec/jsonschema/`  |
| Cross-stack identity | Either corpus admits the other exists                                          | The first mention of AdCP anywhere in the eight IAB repositories                     |
| Disputes             | AdCP's promised dispute task, or an AAMP policy for what follows `divergent`   | `known-limitations.mdx`; `state/Reconciliation.json`                                 |
| Registry             | Key transparency lands in AdCP 4.0; IAB publishes a registry API specification | AdCP release notes; `AAMPRegistryClient` in `seller-agent` stops returning mock data |

One of those you can delegate today. Ask any vendor selling you AAMP measurement to show you a non-empty `agent_interface.schema.json` on `main` in [`agentic-audiences`](https://aampexplorer.com/repos/agentic-audiences/). Until they can, AAMP has no measurement agent that talks to the rest of the corpus, whatever the press release says.

And whichever stack you sign for, require plan registration: `sync_plans` before `check_governance`, or the human-review invariants are decoration your counterparty can skip.
