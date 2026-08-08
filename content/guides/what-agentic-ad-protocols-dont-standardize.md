---
title: 'What Neither Stack Standardises: A Dated Risk Assessment'
description: 'Six things neither AdCP 3.1.10 nor AAMP specifies: measurement, fraud, billing settlement, cross-stack identity, disputes and the registry. Each gap evidenced by a named file.'
answer: "Neither AdCP 3.1.10 nor any AAMP repository standardises measurement, invalid-traffic detection, billing settlement, cross-stack identity or dispute resolution, and AAMP's agent registry is unfinalised. This page evidences what is absent, file by file."
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-limits'
keywords:
  - 'agentic advertising protocol limitations'
  - 'adcp non-goals'
  - 'what adcp does not standardize'
  - 'aamp gaps'
  - 'agentic advertising procurement risk'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/known-limitations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/measurement/taxonomy.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/measurement-terms.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/performance-standard.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/governance/sync-plans-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/trusted-match/identity-match-request.json'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/state/Reconciliation.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://github.com/IABTechLab/AAMP'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/agent-discovery-files/'
  - '/protocols/aamp/'
  - 'https://adcpexplorer.noetis.dev/areas/governance/'
  - 'https://aampexplorer.noetis.dev/repos/iab-agentic-primitives/'
  - 'https://adtechglossary.noetis.dev/concepts/adcp-vs-aamp-terminology/'
reviewState: cto-reviewed
---

## What do agentic advertising protocols not standardise?

Both stacks tell you what they do. Only one of them publishes a protocol-level list of what it deliberately does not do, and neither puts that list anywhere near the front page.

AdCP does publish it. `docs/reference/known-limitations.mdx` is 84 lines of explicit non-goals, and it opens with a sentence I wish more specifications wrote: "Knowing what a protocol doesn't do is part of evaluating it." A companion page, `docs/reference/experimental-status.mdx`, lists the surfaces that shipped in 3.x without being frozen.

AAMP has nothing at the umbrella level. The closest artifacts are scoped to one repository each: `STANDARDS_GAP_REPORT.md` in `iab-agentic-primitives`, which audits that library's fidelity to 12 external standards, and a short "Current Limitations" section in `seller-agent`'s agent-management guide. Both are good documents. Neither is a protocol-level non-goals list, so most of AAMP's gaps have to be established by absence, which is what most of this page does.

Six gaps, in the order a procurement review hits them.

| Gap                              | AdCP 3.1.10                               | AAMP                                          | Risk lands on    |
| -------------------------------- | ----------------------------------------- | --------------------------------------------- | ---------------- |
| Measurement and attribution      | Declared non-goal, in writing             | No object in the shared contract              | Buyer            |
| Invalid traffic and verification | Declared outside the protocol             | Absent; `cpmv` appears only as a pricing unit | Buyer            |
| Billing settlement               | Declared non-goal; usage reporting only   | No invoice, usage or payment object           | Both             |
| Cross-stack identity             | Opaque tokens, no cross-protocol mapping  | Three planes, no shared identity type         | Buyer            |
| Dispute resolution               | Terms declared, no operation to raise one | Divergence detected, resolution undefined     | Both             |
| Agent registry                   | Exists, no key transparency               | Stubbed pending a specification               | Seller and buyer |

Two of these are worse on the AdCP side than the marketing suggests, and two are worse on the AAMP side than a repository count suggests. I have tried to say which is which.

## Gap 1: who is responsible for measurement and attribution?

You are. Both stacks hand the problem back.

**AdCP** says so in one bullet under a heading that contains nothing else. `known-limitations.mdx`, section "Measurement and attribution": "**Not an attribution protocol.** AdCP carries exposure records, identifiers where permitted, and the outcome signals that feed attribution, but it does not specify an attribution model."

The same file puts "billing-grade metric accounting" in a list headed "What is outside the protocol," and adds: "AdCP itself is not MRC-accredited and does not seek accreditation; accreditation attaches to measurement systems, which sit downstream. AdCP is the wire and the contract, not the ledger."

AdCP's own three-layer model, in `docs/measurement/taxonomy.mdx`, separates metrics ("did it happen?", seller is the source of truth), verification ("did it count properly?", third party), and attribution ("did it cause an outcome?", buyer). The third layer is deliberately out: "The model itself (clean rooms, MMM, causal inference, agentic outcome attribution) lives entirely outside the protocol."

What AdCP does carry is real and worth knowing about: `get_media_buy_delivery` for delivery facts, `sync_event_sources` and `log_event` for the buyer's event handoff, `provide_performance_feedback` for a normalised `performance_index`, and the core objects `measurement-terms`, `measurement-readiness` and `measurement-window`. None of the 64 operations returns an attributed outcome.

**AAMP** carries less. There is no measurement object among the 22 primitives in `iab-agentic-primitives/spec/jsonschema/`. Reporting exists only as implementation endpoints outside the shared contract: `/reports/{job_id}` on the buyer agent, `/api/v1/deals/{deal_id}/performance` and `/gam/report` on the seller agent. ARTF's protobuf has an `ADD_METRICS` intent with a `MetricsPayload`, which lets an in-path agent inject metrics into a bid request without defining what any of them mean.

`agentic-audiences` gets closest and then stops. Its embedding schema lists `measurement` as a valid `producer.agent_role`. The schema that would carry a measurement agent's request, `specs/v1.0/schema/agent_interface.schema.json`, is zero bytes.

**Assessment.** This is the largest gap and it is not going to close, because neither body is trying to close it. Both are correct that attribution is a modelling problem rather than a wire problem. The practical consequence is that "we implemented the protocol" and "we agree on what delivered" are unrelated statements, and your contract has to bridge them.

## Gap 2: which protocol detects invalid traffic?

Neither. Both point at the same third-party vendors.

**AdCP** names them. From `known-limitations.mdx`: "GIVT/SIVT filtration (per MRC), viewability measurement (per the MRC Viewable Ad Impression standard), and brand-safety verification execute in the delivery stack or the chosen vendor layer (e.g., DoubleVerify, IAS, HUMAN)."

AdCP does give you a place to write the requirement down. `performance-standard.json` binds a metric, a threshold, a standard and a vendor into the buy contract, `get_products` accepts `required_performance_standards`, and when a standard is committed the creative manifest must carry that vendor's `tracker_script` or `tracker_pixel` assets. So AdCP standardises the contracting of verification and not the verification.

**AAMP** does not do even that much. Search the shared wire contract for viewability and every hit is the same one: `cpmv`, an option in the pricing-model enum that eleven schemas repeat, defined as "cost per thousand viewable impressions." That is a pricing unit. It names a metric that someone else measures and says nothing about who or how. ARTF's prose specification mentions "fraud or viewability signals" inside an example agent manifest description, which is a string in a JSON example rather than a schema.

**Assessment.** Symmetric on paper, asymmetric in practice. AdCP's `performance_standards` plus `committed_metrics` gives you a machine-readable record of who promised what and a `missing_metrics` array when a committed metric does not show up. AAMP gives you a price with a "v" in it. If verification matters to your buy, the AdCP path is contractible today and the AAMP path is a purchase order clause.

## Gap 3: what happens when the invoice does not match delivery?

Nothing, protocol-side. Both stacks stop at the boundary of money moving.

**AdCP** has a section headed "Commerce and settlement" with three bullets, and the first is "**No in-protocol payment or settlement.** `report_usage` provides the consumption data that feeds invoicing, but invoicing and settlement happen out-of-band through the buyer/seller commercial relationship." The second forbids cross-currency buys: each media buy uses one ISO 4217 currency, and a budget in a different currency is rejected rather than converted. The third is the dispute bullet, which gets its own section below.

None of the 64 operations in `dist/schemas/3.1.10/index.json` has `invoice`, `payment` or `settle` in its name. `report_usage` pushes consumption to a vendor agent, and `get_account_financials` returns spend summaries, credit balances, payment status and invoice history from a vendor that already computed them.

**AAMP** models money more carefully at the primitive level and less at the process level. Its flagged decision FD-11 requires money as integer micros and rejects float-typed money on the wire, which is a better default than AdCP's and is one of only four claims `STANDARDS_GAP_REPORT.md` marks as verified by executed checks. There is a `RateCard` primitive holding privately negotiated rates. There is no `Invoice`, no `Usage` and no `Payment` object among the 22 primitives.

**Assessment.** Even, and both are defensible. Neither standards body wants to be in the payments business, and both have adjacent commerce protocols circling that problem already. The risk is not that settlement is missing; it is that an autonomous agent can commit a budget through a wire protocol and there is no wire path for the money, so the finance side of an agentic buy is exactly as manual as it was before.

## Gap 4: can an identity cross from one stack to the other?

No, and inside AAMP it cannot cross between its own planes either.

**AdCP** deliberately keeps identity opaque. `identity_match` takes an `identities` array and returns `eligible_package_ids` plus a `serve_window_sec`, carrying no page context; `context_match` carries page context and no identity. The separation is structural, enforced by the schemas. `sync_audiences` accepts SHA-256 `hashed_email` and `hashed_phone` and will not accept cleartext.

`known-limitations.mdx` then narrows the claim twice. "AdCP authenticates agents, not the humans they act for." And: "SHA-256 hashes of email and phone remain pseudonymous identifiers under GDPR and CPRA and inherit the regulatory treatment of the underlying PII. AdCP does not claim de-identification." That second sentence is more honest than most privacy documentation in this industry and it means the hashing buys you less than a compliance reviewer might assume.

**AAMP** has three identity shapes that do not meet. `agentic-audiences` defines `identity` as `{namespace, value_hash, confidence}` inside an embedding envelope. ARTF has an `ADD_CIDS` intent for injecting extended content identifiers into a bid request. The control plane has `buyer_identity`, eleven optional fields including `seat_id`, `agency_id`, `advertiser_id` and `dsp_platform`, which identify the buying organisation rather than a person. No file in the corpus maps any of these to any other.

**Cross-stack** there is nothing at all, which follows from a finding on the [protocol comparison](/protocols/adcp-vs-aamp/): no schema file in either corpus references a schema file in the other. An AdCP `signal_ref` and an Agentic Audiences `embedding_space_id` are unrelated identifiers with unrelated semantics.

**Assessment.** Highest asymmetry between how it looks and how it is. Both stacks have credible privacy engineering. Neither has an interoperability story, and the buyer holding a single audience definition that has to work across both is doing that translation by hand, with no specification to point at when the translation is wrong.

## Gap 5: how do you dispute a delivery shortfall?

You call someone. This is the gap where AdCP's schemas most clearly describe a process the protocol does not implement.

**AdCP** gives you the terms and withholds the operation. `core/measurement-terms.json` carries `billing_measurement` with a `vendor` whose count "is authoritative for invoicing," a `max_variance_percent` described as the "maximum acceptable variance between the billing vendor's count and the other party's count before resolution is triggered," a `measurement_window` to reconcile against, and a `finalization_deadline_hours` after which "the counterparty MAY fall back to its own attestation for invoicing."

It also carries `makegood_policy`, whose description reads: "When a breach occurs, the seller proposes a remedy from this menu; the buyer accepts or disputes."

There is no operation for disputing. I checked all 64 names in the release registry: none contains `dispute`. `known-limitations.mdx` confirms it: "**No protocol-level delivery-dispute flow.** When buyer and seller delivery numbers disagree, reconciliation happens out-of-band through the commercial relationship (backed by the audit trail on both sides). A structured dispute task is a candidate for future work."

So the schema tells two autonomous agents the exact percentage at which they should disagree, and then has no message for the disagreement.

**AAMP** does better on detection and no better on resolution. `spec/jsonschema/state/Reconciliation.json` encodes flagged decision FD-8 as a lookup table of every buyer-state and seller-state pair, classifying each as `consistent`, `buyer_behind`, `seller_behind` or `divergent`, for change requests, deals and orders. Its description sets the policy: "both agents track state independently; the seller's record is authoritative for every shared lifecycle; divergence is reported, not silently resolved."

That is a real artifact and AdCP has nothing equivalent. What AAMP does not have is what happens after `divergent`. The word "dispute" appears in `seller-agent`'s API documentation once, describing a logged `audience_plan_id` hash on both sides as "the cross-system anchor for dispute resolution." A shared log line is evidence for a human argument, not a protocol.

**Assessment.** Both stacks assume a commercial relationship underneath, which is reasonable for direct-sold inventory between named counterparties and unreasonable for the fully autonomous buying both are marketed on. Autonomy stops at the first disagreement.

## Gap 6: is there a working agent registry?

AdCP has one with a known cryptographic weakness. AAMP has one that is not specified yet.

**AAMP's** is the plainer statement. `seller-agent/docs/guides/agent-management.md`, under a heading literally called "Current Limitations": "The IAB Tech Lab AAMP ... registry integration is stubbed pending the public API specification. Currently, agent trust is managed locally by the operator. The `AAMPRegistryClient` will be updated once the AAMP spec is finalized."

This matters more than a normal to-do, because AAMP's whole trust model runs through the registry. `Agent.trust_status` moves from `unknown` to `registered` when the agent is "Found in the IAB AAMP registry," and trust caps the access tier, which caps the price the buyer can see. With the registry stubbed and trust "managed locally by the operator," the graded trust lattice degrades to an allowlist. Meanwhile the repository AAMP publishes for this, `registry-agent-example`, is a 22-line `agent.ts` that consumes an external MCP server and defines nothing. The [discovery guide](/guides/agent-discovery-files/) has the full picture, including the several different registry URLs the corpus offers.

**AdCP's** registry exists and resolves brand identity, property authorization and agent discovery. `known-limitations.mdx` then describes what it does not do, at length and without softening: "there is no enrollment ceremony binding a domain to a root verification key, no append-only rotation record, and no cryptographic commitment that every verifier sees the same key history. So in 3.x, RFC 9421 buyer keys, governance JWS keys, agent signing keys, and pointer files are still ultimately rooted in the counterparty's own infrastructure — an attacker who controls a counterparty's CDN, DNS, or `/.well-known` path can serve attacker-controlled keys, and TLS does not close this because the certificate is valid for the compromised hostname."

The full fix is scheduled for 4.0. Until then AdCP offers trust-on-first-use with continuity checks, which the same paragraph describes as "detectably raising the bar, but not cryptographically closing the gap."

**Assessment.** The most under-discussed risk in either stack. AdCP's version is a documented, scheduled cryptographic limitation in a system that otherwise signs a great deal. AAMP's version is that the component the trust model depends on has no published contract. If you are underwriting autonomous spend against either registry, the control is a domain takeover away in one case and an operator's local list in the other.

## What does this leave in your contract?

Everything above lands in paper, so the paper needs clauses the protocol will not give you. Six of them, in the order of the gaps.

Name the counting authority and the tolerance. AdCP's `billing_measurement.vendor` and `max_variance_percent` give you the fields; the remedy when they are breached is yours to write. Name your verification vendor and thresholds explicitly, because neither protocol will. Agree a settlement mechanism and a currency, since AdCP rejects cross-currency buys outright and AAMP has no invoice object. Write down how an audience definition maps between stacks if you use both, because no file does. Agree an escalation path for `divergent`, since AAMP detects it and neither stack resolves it. And decide what an agent may commit without a human, because the only schema-enforced limit in either stack is AdCP's `sync_plans` rule that a plan declaring `fair_housing`, `fair_lending`, `fair_employment` or `pharmaceutical_advertising` must also carry `human_review_required: true`.

There is a second-order point in that last item. AdCP's governance protocol is 22 of its 64 operations and it is genuinely good, but `check_governance` validates against a `plan_id`, so an implementer that never calls `sync_plans` has nothing to check against. The strongest control in either stack is opt-in.

## What would close each gap, and how would you notice?

Each row is a file changing, so none of them requires an announcement to detect.

| Gap                  | What would close it                                                                          | Where to watch                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Measurement          | An attribution operation in either registry, which neither body has proposed                 | `dist/schemas/latest.json` operation count; `iab-agentic-primitives/spec/jsonschema/` |
| Invalid traffic      | Verification moving from contract terms to a wire attestation                                | AdCP `performance-standard.json`; any new AAMP primitive                              |
| Settlement           | An invoice or payment object, or an explicit handoff to a commerce protocol                  | AdCP "Commerce and settlement" non-goals; AAMP primitives directory                   |
| Cross-stack identity | The first reference from either corpus to the other, or a published crosswalk                | `grep -ri adcp` across the IAB Tech Lab repositories                                  |
| Disputes             | AdCP's "candidate for future work" dispute task; an AAMP resolution policy after `divergent` | `known-limitations.mdx`; `state/Reconciliation.json`                                  |
| Registry             | AdCP key transparency, scheduled for 4.0; the AAMP registry API specification                | AdCP 4.0 release notes; `AAMPRegistryClient` in `seller-agent`                        |

One trigger would rewrite this page rather than update it. If `agentic-audiences` fills its four zero-byte files, including `agent_interface.schema.json`, the measurement and identity sections both change, because the file that is missing is precisely the one that would connect a measurement agent and an identity namespace to the rest of AAMP.

**Verified 2026-08-09. Next scheduled re-check: 2026-11-09.** If the date above is more than a quarter old, re-derive the AdCP operation count from `dist/schemas/latest.json` before quoting anything here.

## Common questions

**Is a gap the same as a flaw?**
No, and treating it that way produces bad procurement decisions. AdCP declining to specify an attribution model is a scoping decision most standards bodies would make, and `docs/measurement/taxonomy.mdx` argues the case: attribution changes on a much faster cycle than delivery reporting, and putting it in delivery schemas would force a schema break every cycle. The risk is not that the gap exists. It is that a buyer assumes the protocol covers it.

**Which stack is riskier to adopt today?**
Different risks, not more or less. AdCP's risks are documented, dated and scheduled, which means you can plan around them; its registry weakness is the one to price in. AAMP's risks are structural: the canonical wire contract says it is not released, the registry the trust model depends on has no published specification, and four files in the data plane are empty. AdCP's risk is that the roadmap slips. AAMP's is that there is no artifact to hold anyone to.

**Does the AdCP governance protocol cover any of this?**
Some of it, at the plan level. `sync_plans` registers budget limits, policy categories and audience constraints; `check_governance` returns `approved`, `denied` or `conditions` before an action; `report_plan_outcome` commits budget; `get_plan_audit_logs` returns the trail. That is spend control and policy compliance, and it is the most complete governance surface in either stack. It is not measurement, not fraud detection, not settlement and not dispute resolution.

**Does AAMP's `ConsentContext` close the privacy gap?**
It closes one part of it that AdCP leaves open. `ConsentContext` holds `gpp_string`, `tcf_string`, `us_privacy` and `applicable_regimes`, and it is available on the quote request, the deal booking request and the `Quote` and `Deal` objects; AdCP's `known-limitations.mdx` states that it "does not carry a normative consent tag (e.g., IAB TCF, GPP, or equivalents)" and lists a structured consent signal as future work. Two qualifications. `ConsentContext` is optional on every one of those messages, so the wire allows a deal with no consent context at all. And carrying a consent string is not the same as verifying it, which is why the primitive also has a `diligence_status` field recording who checked.

**Should I wait?**
Waiting is a position with its own cost, and I would not sell it as the safe one. The narrow version of the question is more useful: is the part you need specified? Discovery and transaction are specified on both sides. Creative and governance are specified on the AdCP side only. Measurement, settlement and disputes are specified on neither, so those parts of your integration are custom work whenever you start.

## How was this checked?

Every AdCP claim was read from `adcontextprotocol/adcp` at commit `f1a35ab` (2026-08-06): the non-goals from `docs/reference/known-limitations.mdx`, the layer model from `docs/measurement/taxonomy.mdx`, and the operation names and field descriptions from the published release under `dist/schemas/3.1.10/`. Where the prose and the schemas disagreed I used the schemas.

Every AAMP claim was read from local clones of the eight IAB Tech Lab repositories: `iab-agentic-primitives` at `2fc7029`, `seller-agent` v2.4.1, `buyer-agent` at `0c3a154`, `agentic-rtb-framework` at `7f48161`, `agentic-audiences` at `106ebd6`, plus the hub, `agentic-direct` and `registry-agent-example`.

Absence claims were established by `grep` across whole corpora and by reading the operation registries directly, not by failing to find something in documentation. Two limits: the AdCP checkout is unreleased `main`, so its prose can lead or lag the published artifacts, and the AAMP corpus has no released artifact directory at all, so every AAMP count is a working-tree count at the commit above.
