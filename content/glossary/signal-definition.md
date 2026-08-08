---
title: 'Signal Definition (AdCP) — the Disclosure Record Behind a Targeting Segment'
description: "A signal definition is one entry in a data provider's adagents.json signals[] array. 31 fields, 3 required, most of them provenance and consent disclosure."
answer: "A signal definition is one entry in a data provider's published adagents.json signals[] array. AdCP 3.1.10 gives it 31 fields and requires three: id, name and value_type. Most of the rest are provenance disclosure."
pubDate: 2026-08-09
term: 'Signal Definition'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['signal', 'signal definition record']
keywords:
  - 'signal definition advertising'
  - 'adcp signal definition'
  - 'adagents.json signals'
  - 'signal provenance disclosure'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/signal-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/signal-value-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/signal-listing.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/signal-ref.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
related:
  - '/signals/audience-vs-signal/'
  - '/signals/activation/'
  - 'https://adcpexplorer.noetis.dev/areas/signals/'
  - 'https://adcpexplorer.noetis.dev/discovery/adagents-json/'
seeAlso: ['audience-vs-signal', 'activation', 'hashed-identifier']
reviewState: cto-reviewed
---

## What is a signal definition in AdCP?

A signal definition is the authoritative record of one targeting signal, published by the domain that owns it. The schema says where it lives: "Definition of a signal in published `adagents.json` `signals[]`. The publishing domain supplies the namespace, so this definition carries a local `id` rather than a `signal_ref`."

That is the mechanism in one sentence. A data provider hosts `adagents.json` on its own domain. Inside it, `signals[]` holds signal definitions. A product elsewhere in the ecosystem points at one with a `signal_ref` of scope `data_provider`, naming the provider domain and the signal id. Authorization is verifiable by fetching the provider's file.

AdCP 3.1.10 puts 31 properties on a signal definition and requires three: `id`, `name` and `value_type`.

## Which three fields are required, and why so few?

| Field        | Type   | Purpose                                                      |
| ------------ | ------ | ------------------------------------------------------------ |
| `id`         | string | Signal identifier within the publishing domain's `signals[]` |
| `name`       | string | Human-readable signal name                                   |
| `value_type` | enum   | `binary`, `categorical` or `numeric`                         |

`value_type` is required because it determines how the signal can be targeted at all. The enum descriptions spell out the three shapes: binary means the user matches or does not, categorical means the user has one of a defined set of values, numeric means the user has a score within a range. A buyer agent cannot construct a targeting expression without knowing which of the three it is dealing with.

The other 28 fields are optional because they are disclosure, and disclosure is a policy question rather than a wire-format question. AdCP encodes the fields and leaves the enforcement to governance agents and to contracts.

## What does a signal definition disclose about provenance?

This is the part of the schema that repays reading. A large block of fields exists to describe where a segment came from, and several align explicitly with the IAB Data Transparency Standard:

| Field                   | Values or shape                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `methodology`           | `observed`, `declared`, `derived`, `inferred`, `modeled`                                       |
| `data_sources`          | 17 values, from `web_usage` and `loyalty_card` to `public_record_voter_file`                   |
| `subject_type`          | `individual`, `household`, `business`, `contextual`, `none`                                    |
| `resolution_method`     | `deterministic_id`, `probabilistic_device`, `browser`, `geographic`, `content_signal`, `mixed` |
| `audience_scope`        | `single_domain`, `cross_domain_owned`, `cross_domain_unowned`, `offline`                       |
| `id_types`              | `cookie`, `mobile_id`, `platform_id`, `user_enabled_id`                                        |
| `refresh_cadence`       | 8 values from `intra_day` to `annually`                                                        |
| `lookback_window`       | Time window in which a qualifying event can occur                                              |
| `segmentation_criteria` | Free text, aligned with IAB Data Transparency audience criteria disclosure                     |
| `criteria_url`          | Pointer to a longer methodology document                                                       |
| `dts_compliant_version` | The IAB Data Transparency Standard version the definition self-attests to                      |

Two conditional rules tie the block together. `methodology: modeled` requires the `modeling` object. `audience_expansion: true` also requires `modeling`, and the field itself asks whether "look-alike or similar-audience expansion was used to include additional identifiers".

That pair is the useful one for a buyer. It means a provider cannot quietly ship a modelled lookalike as if it were an observed segment without either populating a modelling disclosure or shipping something the schema rejects.

The `criteria_url` field carries a caution I have not seen elsewhere in a schema: "This is a disclosure pointer; buyers should not branch programmatically on the linked document." A field that tells you not to parse it.

## How does a signal definition connect to governance?

Through four fields that governance agents match against, rather than through anything the signal itself enforces:

- `restricted_attributes` — restricted attribute categories the signal touches, declared "so governance agents can structurally match signals against" plan-level constraints.
- `policy_categories` — policy categories the signal is sensitive for. The schema's example is a children's interest signal declaring `children_directed`.
- `consent_basis` — declared GDPR Article 6 lawful basis, as an array.
- `art9_basis` — GDPR Article 9 basis, taking `explicit_consent`, `manifestly_made_public`, `substantial_public_interest` or `vital_interests`, required by policy when `restricted_attributes` is non-empty in jurisdictions where Article 9 applies.

The Article 9 field is a small, concrete example of a protocol encoding a legal regime directly. Eight of the ten values in AdCP's restricted-attribute registry are GDPR Article 9 special categories.

`last_updated` carries its own disclaimer: it "indicates freshness of the definition record, not an attestation that the underlying data or model is current". A provider can keep the paperwork fresh while the segment rots, and the schema declines to pretend otherwise.

## What is the difference between a signal definition, a signal listing and a signal ref?

Three schemas, three jobs, and mixing them up is the most common way to misread the Signals area.

| Schema                   | Role                                                                              | Where it appears                                   |
| ------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| `signal-definition.json` | The authoritative record                                                          | A data provider's `adagents.json` `signals[]`      |
| `signal-listing.json`    | A copy of identity metadata used when a signal is listed away from its definition | Product `included_signals`, `get_signals` results  |
| `signal-ref.json`        | A pointer with a scope discriminator                                              | Targeting expressions, product options, activation |

The listing schema states the boundary directly: "Product-local signals use the listing as the definition boundary and MUST include `name` and `value_type`. Data-provider and signal-source refs MAY omit definition metadata." A product-local signal has no upstream definition, so the listing has to be one. A provider-published signal has one, so the listing is display text.

`signal-ref.json` adds the third axis with its `scope` discriminator: `product`, `data_provider`, or `signal_source`. Its own description warns that "scope is the resolution path, not provenance".

Also note the deprecation. `signal_id` is marked "DEPRECATED. Use `signal_ref` instead", retained "for compatibility with older Signals Protocol clients". A buyer agent written against an older AdCP release will still be sending the deprecated shape.

## Does AAMP have a signal definition?

No. There is no equivalent object anywhere in the AAMP corpus, and the reason is that AAMP's audience work is not built on named segments.

The nearest artifact is the embedding message in `agentic-audiences`, defined by `specs/v1.0/schema/embedding_format.schema.json`. It describes a vector rather than a segment: a `model` descriptor with `dimension`, `metric`, `embedding_space_id`, `pooling`, `normalization` and `quantization`; an `embeddings[]` array with dtypes; a `consent` block; a `security` block with signature and attestation. There is no id namespace, no provider domain, no verifiable authorization path, and no disclosure of methodology in the IAB Data Transparency sense.

The two models are not competing implementations of one idea. They are different ideas about what an audience signal is.

## How is this term sourced?

AdCP side, at commit `f1a35ab`, release 3.1.10 per `dist/schemas/latest.json`: `dist/schemas/3.1.10/core/signal-definition.json`, `core/signal-listing.json`, `core/signal-ref.json`, `enums/signal-value-type.json`, `enums/signal-source.json`. Prose quoted from `docs/reference/glossary.mdx`.

AAMP side: `specs/v1.0/schema/embedding_format.schema.json` in `IABTechLab/agentic-audiences` at commit `106ebd6`. That repository has no git tags, its specification is self-labelled "Draft v0.1" while living under a `v1.0` directory, and its README states that the specification "represents LiveRamp's initial proposal". It is a draft contribution, not a ratified IAB specification.
