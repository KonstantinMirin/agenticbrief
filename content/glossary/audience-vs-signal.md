---
title: 'Audience vs Signal in AdCP — Two Objects People Constantly Conflate'
description: 'An AdCP audience is buyer-owned CRM data uploaded via sync_audiences. A signal is a seller-side or provider-side targeting dimension discovered via get_signals.'
answer: 'An Audience is buyer-owned CRM data uploaded to one seller account with sync_audiences. A Signal is a targeting dimension published by a seller, signal source or data provider and discovered with get_signals. Different owners, different operations.'
pubDate: 2026-08-09
term: 'Audience vs Signal'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['audience', 'first-party audience', 'CRM audience', 'signal vs audience']
keywords:
  - 'signal vs audience advertising'
  - 'adcp audience vs signal'
  - 'sync_audiences vs get_signals'
  - 'first party audience adcp'
citations:
  - 'https://docs.adcontextprotocol.org/docs/media-buy/task-reference/sync_audiences'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/sync-audiences-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/audience-member.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/signals/get-signals-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/signal-catalog-type.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/embedding-exchange.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/signal-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/signal-source.json'
related:
  - '/signals/signal-definition/'
  - '/signals/activation/'
  - '/signals/hashed-identifier/'
  - 'https://adcpexplorer.noetis.dev/areas/signals/'
seeAlso: ['signal-definition', 'activation', 'hashed-identifier']
reviewState: cto-reviewed
---

## What is the difference between an audience and a signal in AdCP?

AdCP draws the line by ownership and by operation, and it says so in one sentence in the `sync_audiences` reference page:

> Audiences are distinct from signals: signals are named targeting dimensions discovered through product signal options, provider-published signal definitions, or `get_signals`; audiences are data you own and upload.

An Audience is yours. You upload it. A Signal is somebody else's. You find it.

|                            | Audience                                    | Signal                                         |
| -------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Who owns the data          | The buyer                                   | A seller, signal source, or data provider      |
| How it enters the protocol | Uploaded with `sync_audiences`              | Discovered with `get_signals`                  |
| Protocol area              | Media Buy                                   | Signals                                        |
| Scope                      | One seller account                          | The publishing domain, source or product       |
| Identifier                 | Buyer-assigned `audience_id`                | `signal_ref`, with a scope discriminator       |
| Members                    | Hashed emails, hashed phones, universal IDs | Not enumerable by the buyer                    |
| Applied at buy time via    | `audience_include` / `audience_exclude`     | `signal_targeting_groups`                      |
| Needs an activation step   | No                                          | Often yes, via `activate_signal`               |
| Priced                     | No                                          | Sometimes, via `pricing_options` on the signal |

The operations sit in different protocol areas, which is the clearest structural evidence that AdCP treats them as different things. `sync_audiences` is a Media Buy operation. `get_signals` and `activate_signal` are the entire Signals area — 2 of the 64 operations in AdCP 3.1.10.

## What exactly is an AdCP audience?

An audience is a named list of people the buyer already knows about, uploaded to one seller account.

`sync-audiences-request.json` requires two things: an `idempotency_key` and an `account`. Each audience in the request carries a buyer-assigned `audience_id`, optional `name`, `description` and `tags`, and delta arrays `add` and `remove`. AdCP's glossary defines an audience member as "a hashed identifier record representing one person in a CRM audience".

Three types are allowed, and they are not interchangeable:

- `crm` — target these users.
- `suppression` — exclude these users from delivery.
- `lookalike_seed` — use as a seed for the seller's lookalike modelling.

The schema explains why the distinction is operational rather than cosmetic: sellers "may handle audiences differently based on type (e.g., suppression lists bypass minimum size requirements on some platforms)".

An optional `consent_basis` field takes one of four GDPR Article 6 bases: `consent`, `legitimate_interest`, `contract`, `legal_obligation`. The schema is candid that this is "informational — not validated by the protocol", and that when it is omitted "the buyer asserts they have a lawful basis appropriate to their jurisdiction".

## Why is an audience account-scoped?

Because it is uploaded to a seller, not to the protocol. `targeting.json` says `audience_include` "references `audience_id` values from `sync_audiences` on the same seller account".

The consequence for a buyer agent running across five sellers: the same customer list has to be uploaded five times, matched five times, and reconciled five times. There is no cross-seller audience identity in AdCP, and no audience registry. The list is buyer-owned but seller-resident.

There is also a footgun in the sync semantics that deserves naming. `delete_missing: true` removes every buyer-managed audience on the account that is not in the request, and the schema warns: "Do not combine with an omitted audiences array or all buyer-managed audiences will be deleted." The schema encodes a conditional requiring `audiences` when `delete_missing` is true, so the worst case is blocked, but the near miss is not.

## Is audience targeting a hint or a hard rule?

Hard. The `sync_audiences` page states it plainly: "`audience_include` is a hard constraint — only users on the list are eligible."

Lookalike expansion is the opposite, and AdCP says so with unusual honesty. To find users similar to an audience, you describe that intent in the campaign brief and the seller decides how to expand. The documentation then adds: "lookalike intent expressed in the brief cannot be verified through the protocol; confirm via seller-side reporting."

That is a standards body writing down the limit of its own guarantee. Worth quoting when someone claims agentic buying makes media measurable end to end.

## Is a signal always third-party data?

No, and this is where most explanations go wrong.

The released enum in AdCP 3.1.10 is `signal-catalog-type.json`, titled "Signal Availability Type", and it has three values:

| Value         | Definition in the schema                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `marketplace` | "Resold third-party segments (provider authorization verifiable via the provider's adagents.json)"                                                |
| `custom`      | "Source-native segment built on demand from models, composites, or buyer inputs — not attributable to a standing upstream provider"               |
| `owned`       | "First-party segments derived from data the signal agent or seller directly owns (retailer purchase data, publisher behavioral data, telco data)" |

So a signal can be first-party data. The distinction is whose first party. An `owned` signal is first-party to the seller or the signal agent — the retailer's purchase history, the publisher's behavioural data. An Audience is first-party to the buyer. That is the line, and it holds for every case.

The AdCP glossary uses the term "Third-Party Signal" and then defines it as "signal data licensed from external providers, also known as marketplace signals", confirming that third-party and marketplace are synonyms in this vocabulary rather than separate categories.

### A divergence worth knowing about

The prose glossary at `docs/reference/glossary.mdx:340` defines Signal Type as a classification into six values: "marketplace" (third-party), "owned" (first-party), "destination" (bundled with media), "contextual", "geographical", and "temporal".

The released schema enum has three: `marketplace`, `custom`, `owned`. It does not contain `destination`, `contextual`, `geographical` or `temporal`, and it contains `custom`, which the glossary does not mention.

I checked both files at the same commit. If you are writing a validator, follow `dist/schemas/3.1.10/enums/signal-catalog-type.json`. If you are reading the glossary, treat the six-value list as descriptive prose that the wire format does not implement.

## How does a buyer find a signal?

`get_signals` accepts either a natural-language `signal_spec` or an array of `signal_refs`, and can be filtered by `destinations`, `countries` and a `filters` object. It has a `discovery_mode` of `brief` or `wholesale`, and returns cache tokens (`wholesale_feed_version`, `pricing_version`) so a buyer agent can skip re-fetching an unchanged catalog.

A `signal_ref` carries a `scope` discriminator with three values, which is really three different trust models:

- `product` — the signal is local to the selected product.
- `data_provider` — the signal resolves through a domain's published `adagents.json` `signals[]`, so authorization is externally verifiable.
- `signal_source` — the signal is native to the issuing source and, per the `signal-source.json` enum, is "not externally verifiable through an upstream catalog — buyer trusts the issuing source's claim about the signal".

Audiences have nothing equivalent, because there is nothing to verify. The buyer uploaded the list.

## Does AAMP have an audience-versus-signal distinction?

Not in a form that maps across.

AAMP's control plane has no CRM upload operation and no audience object. Its `Product` and `Package` schemas in `iab-agentic-primitives` carry taxonomy targeting intents (IAB Content, Audience and Ad Product taxonomies) and an `audience_capabilities` declaration, which is a capability statement rather than a data object.

AAMP's audience work lives in a separate repository, `agentic-audiences`, and it is a different model entirely: agents exchange embedding vectors, not segment identifiers or hashed lists. Its specification file is self-labelled "Draft v0.1" despite sitting under `specs/v1.0/`, its JSON Schema `$id` still points at `raw.githubusercontent.com/LiveRamp/user-context-protocol`, and four files in its specification tree are zero bytes — including `specs/v1.0/schema/agent_interface.schema.json`, which is the file that would define how a buyer agent and a seller agent actually talk to each other.

So the honest counterpart entry is: no counterpart. AdCP separates buyer-uploaded audiences from discovered signals. AAMP has neither construct in its control plane, and its data plane proposes a third thing that has not been connected to either.

## How is this term sourced?

AdCP side, all at commit `f1a35ab`, release 3.1.10 per `dist/schemas/latest.json`: `dist/schemas/3.1.10/media-buy/sync-audiences-request.json`, `core/audience-member.json`, `core/targeting.json`, `core/signal-ref.json`, `signals/get-signals-request.json`, `enums/signal-catalog-type.json`, `enums/signal-source.json`, `enums/consent-basis.json`. Prose quoted from `docs/media-buy/task-reference/sync_audiences.mdx` and `docs/reference/glossary.mdx`.

AAMP side: `IABTechLab/agentic-audiences` at commit `106ebd6` (no git tags), and `IABTechLab/iab-agentic-primitives` at commit `2fc7029`. Both are reference or draft artifacts, not ratified specifications. The zero-byte files were confirmed by byte count at that commit.
