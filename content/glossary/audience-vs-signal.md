---
title: 'Audience vs Signal'
description: 'In AdCP an audience is buyer-uploaded CRM data whose ID cannot cross sellers. A signal is a targeting dimension someone else publishes. AAMP has neither object.'
answer: 'An audience is buyer-owned CRM data uploaded to one seller account with sync_audiences and not portable across sellers, while a signal is a targeting dimension published by someone else and discovered with get_signals.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Audience vs Signal'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['audience', 'first-party audience', 'CRM audience', 'signal vs audience']
keywords:
  - 'signal vs audience advertising'
  - 'adcp audience vs signal'
  - 'sync_audiences vs get_signals'
  - 'first party audience adcp'
  - 'audience signal difference'
citations:
  - 'https://docs.adcontextprotocol.org/docs/media-buy/task-reference/sync_audiences'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/sync-audiences-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/sync-audiences-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/audience-status.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/package-signal-targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-pricing.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/signal-catalog-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/consent-basis.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/migration-from-axe.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.0-beta.3/media-buy/task-reference/sync_audiences.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/docs/3.1.0-beta.4/media-buy/task-reference/sync_audiences.mdx'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/protocol/DealBookingRequest.golden.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/RECONCILIATION.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/audience_plan_wire_format.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/audience_ref.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
related:
  - '/signals/signal-definition/'
  - '/signals/activation/'
  - '/signals/hashed-identifier/'
  - '/governance/audience-constraints/'
  - 'https://adcpexplorer.com/areas/signals/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['signal-definition', 'activation', 'hashed-identifier', 'audience-constraints']
reviewState: cto-reviewed
---

An audience is data the buyer owns and uploads to a seller account. A signal is a named targeting dimension that somebody else publishes and the buyer discovers. AdCP's `sync_audiences` reference page draws the line in one sentence:

> Audiences are distinct from signals: signals are named targeting dimensions discovered through product signal options, provider-published signal definitions, or `get_signals`; audiences are data you own and upload.

|                            | Audience                                                                   | Signal                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Who owns the data          | The buyer                                                                  | A seller, signal source, or data provider                                                                                              |
| How it enters the protocol | Uploaded with `sync_audiences`                                             | Discovered with `get_signals`                                                                                                          |
| Protocol area              | Media Buy                                                                  | Signals                                                                                                                                |
| Identifier                 | Buyer-assigned `audience_id`                                               | `signal_ref`, with a `scope` discriminator                                                                                             |
| Kind                       | `audience_type`: `crm`, `suppression`, `lookalike_seed`                    | `signal_type`: `marketplace`, `custom`, `owned`                                                                                        |
| Portable across sellers    | No, by schema                                                              | Two of three scopes resolve outside the seller                                                                                         |
| Members                    | [Hashed emails](/signals/hashed-identifier/), hashed phones, universal IDs | Not enumerable by the buyer                                                                                                            |
| Applied at buy time via    | `audience_include` / `audience_exclude`                                    | `signal_targeting_groups` (flat `signal_targeting` is deprecated)                                                                      |
| Priced in the protocol     | No price field on the request or the response                              | `pricing_options[]` at discovery, resolving to `core/signal-pricing.json`: `cpm`, `percent_of_media`, `flat_fee`, `per_unit`, `custom` |
| Needs an activation step   | No                                                                         | Often, via [`activate_signal`](/signals/activation/)                                                                                   |

`core/package-signal-targeting.json` tells implementers not to cross the two: "Use `audience_include`/`audience_exclude` only for buyer-managed first-party audiences registered through `sync_audiences`."

## How an audience enters the protocol

`sync-audiences-request.json` requires `idempotency_key` and `account`, plus one field per audience, `audience_id`; everything else is optional, including `audience_type`, which is what changes the seller's behaviour. `delete_missing: true` removes every buyer-managed audience not in the request. When a list falls under a platform minimum, sellers "MUST emit 'too_small' (not 'ready' with a low `matched_count`)" and populate `minimum_size`. The field list is in AdCP's [sync_audiences reference](https://docs.adcontextprotocol.org/docs/media-buy/task-reference/sync_audiences).

## Portability across sellers

An `audience_id` cannot cross sellers. `core/targeting.json` states the rule on `audience_include` and again on `audience_exclude`: "References `audience_id` values from `sync_audiences` on the same seller account — audience IDs are not portable across sellers." The glossary puts it as "Audiences are account-scoped." Each seller relationship requires its own upload and produces its own match rate, and the protocol offers no path to ask whether the same person was reached on two of them.

What an uploaded audience does buy is a binding rule at delivery: "`audience_include` is a hard constraint — only users on the list are eligible." Lookalike expansion is the opposite, and AdCP says so: "lookalike intent expressed in the brief cannot be verified through the protocol; confirm via seller-side reporting."

[Trusted Match](/realtime/trusted-match-protocol/) evaluates membership buyer-side per impression rather than making `audience_id` portable. The publisher sends an opaque identity token, the buyer's own Identity Match endpoint returns eligible package IDs, and the list is never uploaded. It requires a TMP router at the publisher, and all ten Trusted Match schemas carry `"x-status": "experimental"`.

Support is a capability check on either path. `targeting.json` says "Seller must declare support in `get_adcp_capabilities`", and the declaration is a presence check on `media_buy.audience_targeting`. No object means no audiences, and no error code in 3.1.13 is scoped to unsupported audience targeting.

Signals are only slightly more portable. A `signal_ref` carries a `scope` discriminator with three branches, `product`, `data_provider` and `signal_source`, and only `product` is confined to one seller relationship, which is where every audience already lives. The three scopes are set out under [signal definition](/signals/signal-definition/).

## Signal types

A signal is not always third-party data. The wire field is `signal_type`, resolving to `enums/signal-catalog-type.json`, whose title is "Signal Availability Type", and validators follow that enum:

| Value         | enumDescription                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `marketplace` | "Resold third-party segments (provider authorization verifiable via the provider's adagents.json)"                                                |
| `custom`      | "Source-native segment built on demand from models, composites, or buyer inputs - not attributable to a standing upstream provider"               |
| `owned`       | "First-party segments derived from data the signal agent or seller directly owns (retailer purchase data, publisher behavioral data, telco data)" |

A signal can therefore be first-party data. `owned` means the seller or the signal agent holds it; an audience means the buyer does.

`lookalike_seed` sits on the boundary. The buyer uploads the seed, the seller models on it, and the result is derived from data the seller now holds, which matches the `owned` description. AdCP does not settle it: the seed list is the audience, and the modelled segment never gets an `audience_id`.

AdCP also widened its own definition mid-release. Documentation shipped up to `3.1.0-beta.3` reads "signals are third-party data products you discover and activate"; from `3.1.0-beta.4` onward it reads "named targeting dimensions".

`glossary.mdx` disagrees with the enum: it gives Signal Type six values, four of which exist nowhere in 3.1.13, while omitting `custom`. That same glossary defines Audience and ten `Signal *` compounds and has no entry for Signal itself. The field-level detail is in [signal definition](/signals/signal-definition/).

## Audiences and signals in AAMP

No signal object exists in any AAMP repository, and no CRM upload path: neither the wire contract nor either reference agent has a `signal`-shaped field.

Audience-shaped fields do exist, and every one of them in `iab-agentic-primitives` is typed `{"type": "object", "additionalProperties": true}` or the nullable version of that, with no sub-schema behind it. `QuoteRequest.json` says why: "Audience plan slot (open object; the typed model lands with the audience-plan bead)." `RECONCILIATION.md` files it under "Explicitly out of scope (stated, not accidental)". Two incompatible shapes are already in use.

| Source                                                                                               | What an audience plan is                                                                      |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `iab-agentic-primitives` conformance golden vector                                                   | `{"plan_id": "ap-9", "segments": [{"id": "1001", "role": "reach"}]}`                          |
| `buyer-agent/docs/api/audience_plan_wire_format.md` §2.1, "the authoritative wire-format definition" | `{schema_version, audience_plan_id, primary, constraints, extensions, exclusions, rationale}` |

The two shapes share no field names, both validate against the open object, and neither has been ratified as the format.

`AudienceRef`, the one typed audience object AAMP has, points at an IAB Audience Taxonomy ID, an IAB Content Taxonomy ID, or an embedding URI. All three are data somebody else published, which by AdCP's definition makes them signals. The reference seller agent's one audience endpoint is `POST /agentic-audience/match`. The protocol-level comparison is at [AdCP vs AAMP](https://agenticadlab.com/protocols/adcp-vs-aamp/).
