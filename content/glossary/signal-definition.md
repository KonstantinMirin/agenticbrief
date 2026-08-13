---
title: 'Signal Definition (AdCP)'
description: "A signal definition is one entry in a data provider's adagents.json signals[]. AdCP 3.1.13 gives it 31 fields: seven of identity and shape, and 24 optional disclosures."
answer: "A signal definition is one entry in a data provider's published adagents.json signals[]: AdCP 3.1.13 gives it 31 fields, seven of identity and shape, three of them required (id, name, value_type), and 24 optional provenance and consent disclosures."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Signal Definition'
category: 'identity'
cluster: 'gl-signals'
alternateNames: ['signal', 'signal definition record', 'adagents.json signal entry']
keywords:
  - 'signal definition advertising'
  - 'signal vs audience advertising'
  - 'adcp signal definition'
  - 'adagents.json signals'
  - 'signal provenance disclosure'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-definition.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-definition-enrichment.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-listing.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/signal-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/restricted-attribute.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://docs.adcontextprotocol.org/docs/signals/data-providers'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Product.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/fixtures/primitives/Product.golden.json'
  - 'https://iabtechlab.com/standards/data-transparency-standard/'
related:
  - '/signals/audience-vs-signal/'
  - '/signals/activation/'
  - '/signals/hashed-identifier/'
  - '/governance/policy-category/'
  - '/agents/discovery-files/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/signals/'
  - 'https://adcpexplorer.com/discovery/'
seeAlso: ['audience-vs-signal', 'activation', 'hashed-identifier', 'policy-category']
reviewState: cto-reviewed
---

A signal definition is the authoritative record of one targeting signal, published by the domain that owns the data. AdCP 3.1.13 puts 31 properties on the object and requires three: `id`, pattern `^[a-zA-Z0-9_-]+$` and local to the domain; `name`; and `value_type`, one of `binary`, `categorical` or `numeric`, which determines the shape of any targeting expression written against the signal.

`core/signal-definition.json` says where the record lives in its opening line: "Definition of a signal in published adagents.json signals[]. The publishing domain supplies the namespace, so this definition carries a local id rather than a signal_ref." A data provider hosts [`adagents.json`](/agents/discovery-files/) on its own domain, and `signals[]` inside it holds the definitions. A product that offers the signal points at it with a `signal_ref` of scope `data_provider`. The buyer resolves that ref to the provider's domain, fetches the file and reads the entry its owner published, so a seller's account of a segment can be checked against the owner's record. That check is what separates a signal from an [audience the buyer uploaded](/signals/audience-vs-signal/).

## Definition, listing and ref are three different schemas

| Schema                   | Role                                   | Where it appears                                          |
| ------------------------ | -------------------------------------- | --------------------------------------------------------- |
| `signal-definition.json` | the record the provider publishes      | a data provider's `adagents.json` `signals[]`             |
| `signal-listing.json`    | identity metadata lifted out of it     | product `included_signals`, `get_signals` results         |
| `signal-ref.json`        | a pointer with a `scope` discriminator | targeting expressions, [activation](/signals/activation/) |

`signal-listing.json` states the boundary: "Product-local signals use the listing as the definition boundary and MUST include name and value_type." `signal-ref.json` adds three scopes, `product`, `data_provider` and `signal_source`, and states that "scope is the resolution path, not provenance".

`get-signals-response.json` carries a fourth shape, `signal_id`, marked "DEPRECATED. Use `signal_ref` instead. Legacy SignalId retained for compatibility with older Signals Protocol clients." A buyer agent written against an older release still sends that shape, and a seller that reads only `signal_ref` will not see it.

## Provenance and consent fields

Seven fields are identity and shape: `id`, `name`, `description`, `value_type`, `tags`, `allowed_values`, `range`. The other 24 describe where the segment came from and under what legal basis. AdCP factors 19 of those 24 into `core/signal-definition-enrichment.json`, the file the `get_signals` response reuses; the remaining five live on the definition and nowhere else.

Some of the 24 resolve to a value a buyer agent can branch on. The table below groups the ones that share an enum; the rest are URLs, nested objects, country lists and timestamps.

| Field                         | Value space                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `methodology`                 | `observed`, `declared`, `derived`, `inferred`, `modeled`                                                                    |
| `data_sources`                | 17 values, `web_usage` and `loyalty_card` through `public_record_voter_file`                                                |
| `subject_type`                | `individual`, `household`, `business`, `contextual`, `none`                                                                 |
| `resolution_method`           | `deterministic_id`, `probabilistic_device`, `browser`, `geographic`, `content_signal`, `mixed`                              |
| `audience_scope`              | `single_domain`, `cross_domain_owned`, `cross_domain_unowned`, `offline`                                                    |
| `id_types`                    | `cookie`, `mobile_id`, `platform_id`, [`user_enabled_id`](/signals/hashed-identifier/)                                      |
| `refresh_cadence`             | 8 values, `intra_day` to `annually`; `lookback_window` shares the enum                                                      |
| `consent_basis`, `art9_basis` | 4 GDPR Article 6 bases; then `explicit_consent`, `manifestly_made_public`, `substantial_public_interest`, `vital_interests` |
| `restricted_attributes`       | the closed 10-value registry, 8 of them [Article 9 special categories](/governance/policy-category/)                        |

Two of these fields tell a buyer what not to do with them. `criteria_url` points at a longer methodology document and then closes off the obvious use: "This is a disclosure pointer; buyers should not branch programmatically on the linked content." `last_updated` "indicates freshness of the definition record, not an attestation that the underlying data or model was refreshed at that time".

The five fields that live only on the definition — `subject_type`, `resolution_method`, `id_types`, `audience_scope` and `originating_domain` — never reach the wire. `get_signals` returns an `allOf` of exactly two schemas, `signal-listing.json` and `signal-definition-enrichment.json`, and the `fields` projection on `get-signals-request.json` enumerates 18 field names a buyer can ask for, none of them these five. The projection is not an entitlement: "fields is a projection request, not an entitlement grant; agents MAY redact requested definition fields unless the caller is authorized", and AdCP does not define what authorises a caller. Establishing whether a segment resolves deterministically or probabilistically therefore means fetching the provider's `adagents.json` directly.

## The disclosure fields come from the IAB Data Transparency Standard

The 19 enrichment fields track the [IAB Data Transparency Standard](https://iabtechlab.com/standards/data-transparency-standard/) almost item for item. DTS v1.2, published April 2024, defines up to 20 standardised disclosure fields and ships them as a human-readable Data Label backed by an annual business audit. AdCP carries the same fields as JSON without the audit, replacing it with `dts_compliant_version`: the "IAB Data Transparency Standard version this signal definition self-attests as satisfying, when applicable." `dts_compliant_version` is self-asserted; no party countersigns it and nothing revokes it.

## When the conditional disclosure rules fire

All five of the `allOf` conditionals on `signal-definition.json` wait for the provider to declare something first.

| If the definition declares                                                                                                                  | It must then carry        |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `value_type: categorical` with a `taxonomy`                                                                                                 | `taxonomy.value_mappings` |
| `audience_scope: single_domain`                                                                                                             | `originating_domain`      |
| `methodology: modeled`                                                                                                                      | a `modeling` block        |
| `audience_expansion: true`                                                                                                                  | the same `modeling` block |
| any of `offline_survey`, `public_record_census`, `public_record_voter_file`, `public_record_other`, `offline_transaction` in `data_sources` | an `onboarder`            |

Each conditional puts a `required` on its own trigger field — `{"if": {"properties": {"methodology": {"const": "modeled"}}, "required": ["methodology"]}}` — so each keys on a field the provider is free to omit. A definition that omits `methodology`, `audience_expansion` and `data_sources` triggers none of the five, and a modelled lookalike validates clean as `{"id": "auto_intenders_q3", "name": "Auto Intenders Q3", "value_type": "binary"}`. `additionalProperties` is `true` on the definition, so unknown keys pass validation as well. `policy_categories` is typed as a bare `{"type": "string"}` array while the documentation says "Values MUST match the canonical definitions in the Policy Registry", a constraint that exists in prose only; its neighbour `restricted_attributes` does `$ref` its enum.

AdCP states the consequence itself: "Without governance metadata, a governance agent must infer sensitivity from signal names — this is fragile and produces false positives."

## Audience targeting in AAMP

AAMP's version of this object is one untyped field. `Product.audience_targeting` in `iab-agentic-primitives` v0.5.0 is typed `{"anyOf": [{"additionalProperties": true, "type": "object"}, {"type": "null"}], "default": null}` with the description "IAB Audience Taxonomy targeting intent". No properties, no required keys. `content_targeting` and `ad_product_targeting` are shaped identically, and the seller-agent OpenAPI repeats the typing.

The only place a shape is committed to is `Product.golden.json`, the conformance fixture generated from that schema: `"audience_targeting": {"segment_ids": ["1001"]}`, an array of opaque strings. The [Agentic Real-Time Framework](/realtime/artf-intent/), another repository in the same programme, reduces segments to a single protobuf enum value, `ACTIVATE_SEGMENTS = 1`.

The IAB Data Transparency Standard appears in no AAMP repository, under any of its names, though IAB Tech Lab wrote that standard and AdCP encoded 19 of its fields.
