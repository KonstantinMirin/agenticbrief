---
title: 'Trusted Match Protocol (TMP) — Why AdCP Splits Context From Identity'
description: "TMP is AdCP's serve-time layer. Its two operations are structurally separated so page context and user identity never appear in one request. It replaces the deprecated AXE."
answer: "Trusted Match Protocol is AdCP's serve-time execution layer. Two operations, context_match and identity_match, are structurally separated so that page context and user identity never travel in the same request. TMP replaces the deprecated AXE."
pubDate: 2026-08-09
term: 'Trusted Match Protocol (TMP)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames: ['TMP', 'trusted match', 'AXE replacement']
keywords:
  - 'trusted match protocol'
  - 'adcp tmp'
  - 'context_match identity_match'
  - 'adcp axe deprecated'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/trusted-match/context-match-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/trusted-match/identity-match-request.json'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/privacy-architecture'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/migration-from-axe'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/banner-basic.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
related:
  - '/realtime/rtb-mutation/'
  - '/realtime/artf-intent/'
  - '/signals/hashed-identifier/'
  - 'https://adcpexplorer.noetis.dev/areas/trusted-match/'
seeAlso: ['rtb-mutation', 'artf-intent', 'hashed-identifier']
reviewState: cto-reviewed
---

## What is the Trusted Match Protocol?

The Trusted Match Protocol is AdCP's serve-time layer. Everything else in AdCP happens at planning time: discovering products, creating media buys, activating signals. TMP is what runs in the milliseconds when an impression is decided.

AdCP's glossary defines it in four words — "AdCP's real-time execution layer" — which is accurate and tells you nothing. The interesting part is its shape. TMP is two operations, `context_match` and `identity_match`, and they are deliberately built so that neither one can see what the other one sees.

Those two operations are the whole trusted-match area: 2 of the 64 operations in AdCP 3.1.10.

## Why are there two operations instead of one?

Because the combination of page context and user identity in a single request is the specific thing TMP exists to prevent.

An OpenRTB-style bid request bundles the user, the device and the page into one payload and hands it to every bidder. Everyone who sees the request learns both halves. That is the privacy harm, and it is structural rather than accidental — no amount of contractual language changes what is in the payload.

TMP splits the payload instead. The publisher, who legitimately has both halves because the user is on their page, sends two requests. One asks "which packages match this content?" The other asks "which packages is this user eligible for?" The publisher joins the two answers locally. No counterparty ever holds both.

|                            | Context path                                                       | Identity path                                   |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| Operation                  | `context_match`                                                    | `identity_match`                                |
| Inputs                     | Property, placement, content artifact, content signals, coarse geo | Opaque identity tokens, package IDs             |
| Never receives             | Any user identity                                                  | Any page context                                |
| Returns                    | `offers[]`, one per activated package                              | `eligible_package_ids[]` and `serve_window_sec` |
| `ext` and `context` fields | Omitted from the schema                                            | Omitted from the schema                         |

## How is the separation actually enforced?

Four mechanisms, and all four are visible in the schemas rather than left to prose.

**The schemas forbid the wrong field.** `context-match-request.json` states: "MUST NOT contain user identity." `identity-match-request.json` states: "MUST NOT contain page context." These are not comments on a wiki page, they are in the request schema descriptions that ship in the release.

**Extension fields are removed.** Both schemas omit `ext` and `context`, which every other AdCP operation carries. The context request explains why: "extension data in the context path could inadvertently carry or correlate user identity signals". The identity request says the same in the other direction. Removing an extension point is a real cost, and AdCP paid it here and nowhere else.

**Request IDs must not correlate.** Both schemas carry the same rule: "The `request_id` MUST NOT correlate with any identity match `request_id`." If the two IDs were derived from a common seed, or were sequential, the separation would be cosmetic — anyone holding both streams could rejoin them.

**Package sets must not correlate either.** This is the subtle one. `identity_match` accepts an optional `package_ids` array, and the schema requires that "its composition MUST be independent of the current placement (e.g., all-active or fuzzed; see field description) to prevent set-correlation attacks". If a publisher sent exactly the packages that had matched the current page, the identity request would leak the page through the shape of its own package list.

That last rule is the tell that someone thought about this properly. The first three block the obvious leak. The fourth blocks the inference.

## What does the TMP Router do?

The router is the fan-out point. AdCP's glossary calls it "infrastructure that fans out TMP requests to buyer agents and merges responses".

Architecturally it is "a single binary with two structurally separate code paths: one for context, one for identity". The privacy architecture page is specific about what separate means: "The two paths share no state: no shared memory, no shared database, no communication channel, no shared logs or telemetry."

Without a trusted execution environment, that guarantee rests on code audit. The router is open source, the isolation is readable, and you are trusting the operator to run the published binary unmodified. With TEE attestation, a publisher can verify the running code cryptographically against the vendor's root CA. The page is careful about the upgrade: "TEE is an upgrade path, not a prerequisite. The protocol works without it."

One more router rule matters for anyone building one. When the router filters `identities[]` per provider, it "MUST NOT add, substitute, or transform identity tokens", and the forwarded array "MUST be a subset of the publisher-origin array". Providers cannot verify this themselves, so it is a deliberate trust placement rather than a proof.

## What does TMP not protect against?

AdCP answers this itself, which is unusual and worth quoting rather than paraphrasing:

> This is not an end-to-end guarantee that buyers can never correlate identity and context: in TMPX deployments, the buyer's impression tracker receives decrypted identity alongside a creative selected using page context.

The privacy architecture page extends the list. A buyer learns cross-identity equivalence when a publisher sends multiple `identities` entries in one request, which is identity-graph enrichment the buyer did not previously have. A creative or package with narrow contextual targeting can reveal the page context by implication. Deployments are told to "treat that correlation as part of the buyer's data surface rather than relying on router separation as an end-to-end privacy guarantee".

So the honest claim is narrow and defensible: TMP prevents any single counterparty from receiving context and identity in one request. It does not prevent every downstream inference, and it says so.

<a id="axe"></a>

## What was AXE, and why did TMP replace it?

AXE is the Agentic eXecution Engine. AdCP's own glossary entry for it is one word long: "Deprecated."

The migration page describes the two as solving "the same problem — impression-time execution for pre-negotiated packages — with different architectures. AXE sends a full request (user + context + device) and returns opaque segment IDs. TMP splits the request into two structurally separated operations and returns offers and eligibility."

The concept mapping is a compact summary of what changed:

| AXE                               | TMP                                                       |
| --------------------------------- | --------------------------------------------------------- |
| `axei` (include segment)          | Context Match offer                                       |
| `axex` (exclude segment)          | Package absent from `eligible_package_ids`                |
| `axem` (macro data)               | Creative manifest, offer `macros`, and the `{TMPX}` macro |
| Orchestrator AXE endpoint         | TMP Router                                                |
| `axe_integrations` URL            | `trusted_match` capability                                |
| One bundled OpenRTB-style request | Two requests                                              |

The deprecation is visible in the released schemas, not only in documentation. `core/targeting.json` carries `axe_include_segment` and `axe_exclude_segment`, both described as "Deprecated: Use TMP provider fields instead". `core/product-filters.json` carries `required_axe_integrations` with `"deprecated": true` and the note "Use `trusted_match` filter instead".

AXE was deprecated inside the lifetime of a protocol that is itself barely a year into its 3.x line. That is the fastest a serve-time integration surface has been replaced in this space that I am aware of, and it is a reason to treat any AXE-based integration guide you find as historical.

## Does AAMP have a Trusted Match Protocol equivalent?

AAMP has a serve-time layer, and it is built on the opposite assumption.

ARTF, the Agentic Real-Time Framework, is AAMP's bidstream component. It passes an OpenRTB bid request or bid response to in-path containerised agents, which return proposed mutations. The transported object is the OpenRTB payload itself.

Which means the identity-context join TMP was designed to prevent is the normal case in ARTF. Its own sample payload `samples/banner-basic.json` carries, in one message, a `user` object with `id`, `yob` and `gender`, a `device` object with user agent and IP, and a `site` object with `domain` and the full article URL. That is not a criticism of ARTF's correctness — it is an OpenRTB extension framework, and OpenRTB works that way. It is a statement of scope. ARTF's design goal is multi-party mutation with orchestrator control. Privacy separation is not among the properties it claims.

|                                     | AdCP TMP                                         | AAMP ARTF                                                         |
| ----------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| Unit of work                        | Two separated match requests                     | One mutation exchange over an OpenRTB payload                     |
| Identity and context in one message | Forbidden by schema                              | Present in the reference samples                                  |
| What the caller gets back           | Offers and eligible package IDs                  | Proposed mutations the orchestrator may reject                    |
| Privacy guarantee claimed           | Structural separation, auditable, TEE-upgradable | None claimed                                                      |
| Source status                       | Published stable release 3.1.10                  | Framework document tagged v1.0 plus two reference implementations |

They are not competing implementations of the same layer. They are two different answers to what the serve-time problem even is.

## How is this term sourced?

AdCP side, at commit `f1a35ab`, release 3.1.10 per `dist/schemas/latest.json`: `dist/schemas/3.1.10/trusted-match/context-match-request.json`, `trusted-match/identity-match-request.json`, `core/targeting.json`, `core/product-filters.json`. Normative prose quoted from `docs/trusted-match/privacy-architecture.mdx`, `docs/trusted-match/migration-from-axe.mdx` and `docs/reference/glossary.mdx` at the same commit.

AAMP side: `samples/banner-basic.json` and the framework document `Agentic_Real_Time_Framework_Version_1_0_FINAL.md` in `IABTechLab/agentic-rtb-framework` at commit `7f48161`, tag `v1.0-1-g7f48161`. Nothing in the AAMP corpus references AdCP, and nothing in AdCP references AAMP; the comparison above is made from outside both.
