---
title: 'Package (AdCP): the line item'
description: 'An AdCP package is one product inside a media buy, the equivalent of a line item, with its own budget, pacing, flight dates, format selection and creative assignments.'
answer: 'An AdCP package is one product inside a media buy, the equivalent of a line item in an ad server, carrying its own budget, pacing, flight dates, format selection and creative assignments.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Package'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['line item', 'AdCP package', 'package object']
keywords:
  - 'adcp package vs line item'
  - 'adcp package'
  - 'adcp package schema'
  - 'package definition advertising'
  - 'line item agentic advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/package-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/package-update.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/available-package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/canonical-format-kind.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/pacing.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://docs.adcontextprotocol.org/docs/media-buy/task-reference/create_media_buy'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Line.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Package.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Assignment.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/events/event_type.values.json'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/opendirect.json'
related:
  - '/media-buying/'
  - '/media-buying/media-buy/'
  - '/media-buying/product/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['media-buy', 'product', 'opendirect', 'audience-vs-signal', 'trusted-match-protocol']
reviewState: cto-reviewed
---

A package in AdCP is one product inside a [media buy](/media-buying/media-buy/), and it is what other ad systems call a line item. `dist/schemas/3.1.13/core/package.json` describes itself in one line: "A specific product within a media buy (line item)". Each package names a single [product](/media-buying/product/) and carries its own budget, pacing, flight dates, format selection, targeting overlay and creative assignments, so a campaign running three products is one buy holding three packages.

## What a package carries

| Group             | Fields                                                                                                                            | Note                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Identity          | `package_id`, `product_id`                                                                                                        | Only `package_id` is required                                                                                                    |
| Money             | `budget`, `pricing_option_id`, `bid_price`, `price_breakdown`, `impressions`                                                      | `bid_price` is "the exact bid/price to honor unless the selected pricing option has max_bid=true", in which case it is a ceiling |
| Pacing and flight | `pacing`, `start_time`, `end_time`, `paused`, `canceled`, `cancellation`                                                          | `pacing` is `even`, `asap` or `front_loaded`, and `even` is the documented default                                               |
| Creative          | `format_ids`, `format_option_refs`, `format_kind`, `params`, `creative_assignments`, `format_ids_to_provide`, `creative_deadline` | Three selectors may co-exist; precedence is defined in prose, not in the schema                                                  |
| Targeting         | `targeting_overlay`, `catalogs`                                                                                                   | Restriction overlays only                                                                                                        |
| Commitments       | `measurement_terms`, `performance_standards`, `committed_metrics`, `optimization_goals`                                           | `committed_metrics` is "the binding reporting contract for this package"                                                         |
| Bookkeeping       | `agency_estimate_number`, `context`, `ext`                                                                                        |                                                                                                                                  |

Three of those fields decide what the package spends. `budget` is a plain number in the media buy's currency, `pacing` sets how it is spent across the flight, and `bid_price` sets the unit price — fixed, unless the selected pricing option carries `max_bid=true`, in which case the same number is a ceiling.

## Targeting is an overlay, not the buy

`core/targeting.json` states the division: "Optional restriction overlays for media buys. Most targeting should be expressed in the brief and handled by the publisher." The buyer describes the audience in the brief, the seller selects the inventory, and the package layer only narrows what the seller selected. Its 28 properties, none required, are functional restrictions: geography, age verification, device platform, language, keyword targeting.

Three are marked `deprecated: true`: `axe_include_segment`, `axe_exclude_segment` and `signal_targeting`, whose replacement `signal_targeting_groups` is where grouped include and exclude composition moved. `audience_include` and `audience_exclude` take IDs minted by `sync_audiences` on the same seller account, and those IDs do not travel to another seller — the practical half of the [audience versus signal](/signals/audience-vs-signal/) distinction.

## How a package is created

AdCP 3.1.13 ships four package schemas with different required-field sets.

| Schema                                 | Direction                | Properties              | Required         | Accepts unknown keys |
| -------------------------------------- | ------------------------ | ----------------------- | ---------------- | -------------------- |
| `core/package.json`                    | seller to buyer          | 29                      | 1 (`package_id`) | yes                  |
| `media-buy/package-request.json`       | buyer to seller          | 24                      | 3                | yes                  |
| `media-buy/package-update.json`        | buyer to seller          | 21, 7 of them forbidden | 1                | yes                  |
| `trusted-match/available-package.json` | seller to match provider | 5                       | 3                | no                   |

The one sent on `create_media_buy` is `package-request.json`, and three fields make a complete package:

```json
{
  "product_id": "prod_ctv_primetime",
  "budget": 50000,
  "pricing_option_id": "po_cpm_guaranteed"
}
```

A package is created by reference: the buyer names a product and the seller fills in whatever that product already implies — pricing, formats, measurement terms, allowed actions. The request schema has no `package_id` property at all, because the seller mints the ID and returns it on the 29-property `core/package.json` object, which a buyer reads and never constructs.

`required` is not the whole obligation. `product_id` sits outside `required`, but its description carries a MUST: "sellers MUST echo the request package's product_id on every response package object that represents that requested package". One level up, `core/media-buy.json` lists `packages` in `required` but sets no `minItems`, so a media buy with zero packages validates clean.

`update_media_buy` uses both request shapes in a single payload. Existing packages go through `packages[]` as `package-update` objects, new ones through `new_packages[]` as full `package-request` objects. A package added mid-flight is a create, so its immutable fields are set then and freeze from that point.

`available-package.json` has five properties and is the only package object in the registry that rejects unknown keys. It is synced to [Trusted Match](/realtime/trusted-match-protocol/) providers, AdCP's serve-time layer, when the buy is created, so a match provider knows which packages exist on it; nothing sends it per request.

## Immutable fields after create

`package-update.json` has a root-level `not.anyOf` that rejects any payload containing `product_id`, `format_ids`, `format_option_refs`, `format_kind`, `params`, `capability_ids` or `pricing_option_id`. Its own description calls them "fully-immutable fields" and says the rule is "schema-enforced via the `not` constraint at the root of this object".

Product, pricing option and every format selector are therefore fixed at create. Changing the creative format on a live package means cancelling it and creating a replacement, which the seller mints as a new package under a new `package_id`. One rule in that description never made it into the constraint: `committed_metrics` is append-only, and sellers must reject edits to existing entries.

## Format selection

All three selectors can sit on one package and none is required: `format_ids` for "legacy named-format IDs", `format_option_refs` for "structured 3.1+ format option references", and `format_kind` plus `params` as the "direct canonical selector". `format_kind` draws from a 13-value enum: `image`, `html5`, `display_tag`, `image_carousel`, `video_hosted`, `video_vast`, `audio_hosted`, `audio_daast`, `sponsored_placement`, `native_in_feed`, `responsive_creative`, `agent_placement`, `custom`.

Precedence is defined in the [`create_media_buy` task reference](https://docs.adcontextprotocol.org/docs/media-buy/task-reference/create_media_buy): "Selector precedence is deterministic: `format_option_refs[]` wins when present; otherwise direct `format_kind`/`params` is used; otherwise the package defaults to all product options." Deprecated `format_ids[]` is interpreted only on a negotiated legacy compatibility path.

Because that rule lives in a task reference rather than in a constraint, two implementations reading `dist/schemas/` alone can disagree about which format was bought, and both payloads validate. The `pricing_option_id` that comes back carries no echo MUST and is not required on the response, so nothing ties it to the one that went out.

## AAMP's Package and Line

AdCP's package maps to AAMP's `Line`, "Individual product booking within an order (OpenDirect Line)", which says of itself that it "is the only execution unit on the wire". The object AAMP calls `Package` is something else: a "Curated inventory package for media kit discovery. A curation layer on top of products", carrying `is_featured`, `seasonal_label`, `tags` and a `layer` enum of `synced`, `curated` or `dynamic` — a pre-sale object, closer to an AdCP product. The library is [unreleased](https://aampexplorer.com/versions/) and the AAMP hub README does not list it.

AdCP's package has 29 properties and 1 required. AAMP's `Line` has 13 properties and 8 required: `line_id`, `order_id`, `product_id`, `name`, `start_date`, `end_date`, `rate` and `quantity`. AdCP's package requires one field because the seller fills the rest from the referenced product; `Line` requires eight because it is an [OpenDirect](/concepts/opendirect/) booking line that a booking system supplies.

The two objects also diverge below the field names.

- `Line.targeting` is `{"type": "object", "additionalProperties": true}`, nullable and defaulting to null, against AdCP's 28 typed properties.
- `events/event_type.values.json` defines four pacing events — `pacing.snapshot_taken`, `pacing.deviation_detected` and two reallocation events — while no property named `pacing` exists anywhere in `spec/jsonschema/`.
- Creative binding sits in a separate `Assignment` object. An AAMP buyer books the line, then makes a second call before anything can run; AdCP keeps `creative_assignments[]` on the package.

The full crosswalk, object by object, is at [AdCP vs AAMP terminology](/concepts/adcp-vs-aamp-terminology/).
