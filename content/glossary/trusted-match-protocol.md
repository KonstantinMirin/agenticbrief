---
title: 'Trusted Match Protocol (TMP): context and identity in AdCP'
description: "TMP is AdCP's serve-time layer: context_match and identity_match, two operations held apart so that page context and user identity never share a request."
answer: "Trusted Match Protocol is AdCP's serve-time execution layer: two operations, context_match and identity_match, kept structurally apart so page context and user identity never share a request, with the publisher joining the two responses locally."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Trusted Match Protocol (TMP)'
category: 'protocol'
cluster: 'gl-realtime'
alternateNames:
  ['TMP', 'trusted match', 'AXE replacement', 'context match', 'identity match', 'TMP Router']
keywords:
  - 'trusted match protocol'
  - 'adcp tmp'
  - 'context_match identity_match'
  - 'tmp router'
  - 'adcp axe deprecated'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/context-match-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/identity-match-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/identity-match-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/provider-registration.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/experimental-status'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/privacy-architecture'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/router-architecture'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/specification'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/buyer-guide'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/migration-from-axe'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/samples/banner-basic.json'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
related:
  - '/realtime/'
  - '/realtime/rtb-mutation/'
  - '/realtime/artf-intent/'
  - '/signals/hashed-identifier/'
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/trusted-match/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['rtb-mutation', 'artf-intent', 'hashed-identifier', 'adcp', 'aamp']
reviewState: cto-reviewed
---

The Trusted Match Protocol (TMP) is AdCP's serve-time execution layer: two operations, `context_match` and `identity_match`, held structurally apart so that page context and user identity never travel in the same request, and neither operation can see what the other sees. Everything else in [AdCP](/concepts/adcp/) runs at planning time. TMP runs in the milliseconds while an impression is being decided.

## The two operations

An OpenRTB bid request carries page context and user identity in one payload — user, device and page — handed to every bidder, with no contract governing what ends up in it. TMP splits that payload into two requests, sent to the same providers and answered separately. The publisher legitimately holds both halves, since the user is on their page, so it fires both and joins the responses itself.

|                | Context path                                                                    | Identity path                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Operation      | `context_match`                                                                 | `identity_match`                                                                                                                  |
| Inputs         | property, placement, `artifact`, `context_signals`, coarse `geo`, `package_ids` | `identities` (1-3 [hashed or vendor IDs](/signals/hashed-identifier/)), `consent`, `country`, `sealed_credentials`, `package_ids` |
| Never receives | any user identity                                                               | any page context                                                                                                                  |
| Returns        | `offers[]`, one per activated package                                           | `eligible_package_ids[]`, `serve_window_sec`                                                                                      |

The publisher intersects the two responses: the packages the context call says are offered, against the packages the identity call says this user is eligible for. It "performs the intersection of context match offers and identity match eligibility locally, after both responses arrive", ranks whatever appears in both lists, and renders the winning offer's creative manifest. `serve_window_sec` caps what happens next: one impression per package, then a re-query of Identity Match before serving that package to that user again.

## Who does what

The publisher fires both calls and joins the responses on its own infrastructure. A buyer agent exposes two HTTP/2 endpoints under one base URL, `POST /context` and `POST /identity`. Router selection is a deployment decision the publisher makes in advance, and the specification assigns no operator to the router.

## What the schemas enforce

The separation is carried by the released request schemas, not only by the prose around them.

| Rule                                                                                                                              | Where it lives                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| "MUST NOT contain user identity" / "MUST NOT contain page context"                                                                | the two request descriptions                                                                                     |
| `additionalProperties: false`                                                                                                     | both requests, so a wrong field is rejected and not ignored                                                      |
| no `ext`, no `context`                                                                                                            | both requests: "extension data in the context path could inadvertently carry or correlate user identity signals" |
| `request_id` MUST NOT correlate across the two calls                                                                              | both requests, in both directions                                                                                |
| `package_ids` "MUST NOT vary by user"                                                                                             | context request                                                                                                  |
| `package_ids` "MUST be statistically independent of the current placement", so the list cannot be used to correlate the two calls | identity request: all-active, or fuzzed and "optionally padded with synthetic non-existent IDs"                  |
| `country` stripped before forwarding; `geo` "Coarsened ... no postcode, no coordinates"                                           | identity and context requests respectively                                                                       |

Both TMP requests omit `ext` and `context`, which every other AdCP operation carries. The package-set rule blocks an inference: a per-user package list would let a buyer correlate the two calls while both requests stayed within their field lists. Field-by-field tables for both operations sit on [AdCP Explorer](https://adcpexplorer.com/areas/trusted-match/).

## The TMP Router

Both requests go to a router. It fans each one out to the providers the publisher configured, merges the answers per path, and returns two responses. Both streams cross a single process: "a single binary with two structurally separate code paths: one for context, one for identity", where "The two paths share no state: no shared memory, no shared database, no communication channel, no shared logs or telemetry."

Without a trusted execution environment, that isolation rests on code audit. Providers cannot check the router's filtering themselves, and the default deployment asks every participant to trust that whoever runs the router runs the published binary unmodified. AdCP's position: "TEE is an upgrade path, not a prerequisite. The protocol works without it."

The router ships as a stateless container image, `ghcr.io/adcontextprotocol/tmp-router:latest`, so a publisher can self-host one per point of presence; the privacy pages also assume a "router operator" the publisher takes on trust. It runs on a 50ms clock, and if every provider misses, the response comes back empty.

## Scope of the guarantee

AdCP scopes its own claim:

> This is not an end-to-end guarantee that buyers can never correlate identity and context: in TMPX deployments, the buyer's impression tracker receives decrypted identity alongside a creative selected using page context.

TMPX is an optional extension that re-links the two halves at impression time. Each value is "an HPKE-encrypted exposure token that flows through creative tracking URLs to the buyer's impression pixel", the mechanism for per-user frequency capping. Neither `tmpx` nor `tmpx_providers` is required on the response, so a publisher that omits it gives up per-user exposure counting.

AdCP names two further limits: multiple `identities` in one request give the buyer cross-identity equivalence it did not have before, and a narrowly targeted package implies the page context.

## An experimental surface inside a stable release

All twelve files in `dist/schemas/3.1.13/trusted-match/` are stamped `"x-status": "experimental"`, and 3.1.13 is the stable channel.

The flag lets AdCP rename fields, remove them or change their type on six weeks' notice in the release notes, "a deliberate relaxation of the 6-month deprecation notice that applies to stable surfaces". It has been exercised: `tmpx_macros` sat on `identity-match-response.json` from 3.1.1 through 3.1.8 and was removed at 3.1.9, inside a patch line.

AdCP's register gives the reason the flag is still on: "Privacy architecture is thinly specified relative to what a regulator deep-dive will demand." Release notes promised a "stable surface targeted for 3.1.0". The reference documentation has drifted with it: `docs/reference/glossary.mdx` says Identity Match "Returns a boolean `eligible` flag and optional `intent_score` per package", and neither identifier appears in any released schema.

## AXE, and why TMP replaced it

AXE is the Agentic eXecution Engine. `migration-from-axe.mdx` has the pair solving "the same problem — impression-time execution for pre-negotiated packages — with different architectures. AXE sends a full request (user + context + device) and returns opaque segment IDs." The deprecation ships in the schemas too: `axe_include_segment`, `axe_exclude_segment`, `required_axe_integrations` and `axe_integrations` are all flagged `"deprecated": true`. AXE was deprecated at 3.0.0.

## Serve time in AAMP

[AAMP](/concepts/aamp/) hands the OpenRTB payload itself to in-path containerised agents, which return [mutations](/realtime/rtb-mutation/) with a declared [intent](/realtime/artf-intent/) attached. The join TMP forbids is ARTF's normal case: `samples/banner-basic.json` puts `user.id`, `yob`, `gender`, DMP segments, device `ua`, `ip`, `geo` and the full page URL in one message. AdCP removed `ext` from both TMP requests because extension data could correlate identity; ARTF keeps it as a design principle, "including use of 'ext' objects for any nonstandard, extended signaling". Neither specification references the other.
