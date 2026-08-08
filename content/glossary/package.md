---
title: 'Package (AdCP) — the Line Item, and Why Only One Field Is Required'
description: "A package is AdCP's line item: one product inside a media buy, with its own budget, pacing and creative. 29 fields, one required. Plus the AAMP false friend."
answer: 'A package is one product inside an AdCP media buy, carrying its own budget, pacing, flight dates, format selection and creative assignments. AdCP 3.1.10 defines 29 fields on it and requires exactly one, package_id.'
pubDate: 2026-08-09
term: 'Package'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['line item', 'AdCP package']
keywords:
  - 'adcp package vs line item'
  - 'adcp package'
  - 'package definition advertising'
  - 'line item agentic advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/package.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/targeting.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/canonical-format-kind.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Line.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Package.json'
related:
  - '/media-buying/media-buy/'
  - '/media-buying/product/'
  - 'https://adcpexplorer.noetis.dev/areas/media-buy/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['media-buy', 'product']
reviewState: cto-reviewed
---

## What is a package in AdCP?

A package is one product bought inside one media buy. The schema at `/schemas/3.1.10/core/package.json` summarises it as "A specific product within a media buy (line item)", and AdCP's own glossary is blunter still: a line item is "the basic unit of inventory in ad servers like Google Ad Manager, represented as packages in AdCP".

So the answer to the question everyone asks first is yes. An AdCP package is the line item. The name changed, the concept did not.

A package carries 29 properties in AdCP 3.1.10. Exactly one of them is required: `package_id`.

## Why does a package require only one field?

Because a package is created by reference, not by declaration. The buyer names a `product_id`, and the seller fills in everything the product already implies: pricing, formats, measurement terms, allowed actions. The package schema describes the shape of a package that has been returned by a seller, not a form the buyer has to complete.

That has a practical consequence. JSON Schema validation will accept a package that is nothing but an ID, so validity tells a buyer agent almost nothing about whether the package is usable. Every meaningful precondition — did the seller echo the pricing option I selected, did it accept my format, did it commit to the metrics I asked for — has to be checked in application code.

## What are the main package fields?

| Field group       | Fields                                                                                                                            | Notes                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity          | `package_id`, `product_id`                                                                                                        | Only `package_id` is required                                                                                    |
| Money             | `budget`, `pricing_option_id`, `bid_price`, `price_breakdown`, `impressions`                                                      | `bid_price` is the exact price to honour unless the pricing option sets `max_bid`, in which case it is a ceiling |
| Pacing and flight | `pacing`, `start_time`, `end_time`, `paused`, `canceled`, `cancellation`                                                          | `pacing` is a three-value enum                                                                                   |
| Creative          | `format_ids`, `format_option_refs`, `format_kind`, `params`, `creative_assignments`, `format_ids_to_provide`, `creative_deadline` | Three parallel format paths, see below                                                                           |
| Targeting         | `targeting_overlay`, `catalogs`                                                                                                   | Restriction overlays, not the primary targeting surface                                                          |
| Commitments       | `measurement_terms`, `performance_standards`, `committed_metrics`, `optimization_goals`                                           | `committed_metrics` is "the binding reporting contract for this package"                                         |
| Bookkeeping       | `agency_estimate_number`, `context`, `ext`                                                                                        |                                                                                                                  |

`pacing` takes `even`, `asap` or `front_loaded`. Nothing else.

## Why does a package have three different ways to select a creative format?

Because AdCP 3.1 introduced a new format model without removing the old one, and then added a shortcut. All three live on the package at once:

| Path             | Field                    | Schema description                                                                       |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Legacy           | `format_ids`             | "Legacy named-format IDs supplied for this package on create_media_buy"                  |
| 3.1 structured   | `format_option_refs`     | "Structured 3.1+ format option references supplied for this package on create_media_buy" |
| Direct canonical | `format_kind` + `params` | "Direct canonical selector supplied for this package on create_media_buy"                |

`format_kind` draws from a 13-value enum: `image`, `html5`, `display_tag`, `image_carousel`, `video_hosted`, `video_vast`, `audio_hosted`, `audio_daast`, `sponsored_placement`, `native_in_feed`, `responsive_creative`, `agent_placement`, `custom`.

None of the three is required, and the schema does not encode an exclusivity rule between them at the package level. A buyer agent that populates two of them is producing a schema-valid package with an ambiguous meaning.

## What is targeting_overlay, and why is it called an overlay?

Because in AdCP, targeting is mostly not the buyer's job. The `targeting.json` schema opens by saying so: "Most targeting should be expressed in the brief and handled by the publisher. These fields are for functional restrictions."

The overlay exists for constraints that are functional rather than strategic: geographic restriction for regulatory or test reasons, age restriction for alcohol and gambling, device platform for app compatibility, language, keyword targeting on search and retail media surfaces. It also carries `audience_include` and `audience_exclude`, which reference first-party CRM audiences uploaded through `sync_audiences` on the same seller account.

Two deprecated fields still sit in that overlay: `axe_include_segment` and `axe_exclude_segment`, both marked "Deprecated: Use TMP provider fields instead".

## What is the AAMP counterpart to a package?

This is the trap. AAMP has an object literally named `Package`, and it is not the counterpart.

| Object         | Source                                                | Summary in the schema                                          | Maps to   |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------- | --------- |
| AdCP `Package` | `dist/schemas/3.1.10/core/package.json`               | "A specific product within a media buy (line item)"            | post-sale |
| AAMP `Line`    | `iab-agentic-primitives/spec/jsonschema/Line.json`    | "Individual product booking within an order (OpenDirect Line)" | post-sale |
| AAMP `Package` | `iab-agentic-primitives/spec/jsonschema/Package.json` | "Curated inventory package for media kit discovery"            | pre-sale  |

An AdCP Package maps to an AAMP `Line`. An AAMP `Package` is a discovery-time construct closer to an AdCP Product — something a seller publishes in a media kit so buyers can find it, carrying `is_featured`, `seasonal_label`, `tags` and a `PackageLayer`.

The two post-sale objects also disagree about strictness in the opposite direction from what you would expect. AdCP's Package has 29 fields and requires 1. AAMP's Line has 13 fields and requires 8: `line_id`, `order_id`, `product_id`, `name`, `start_date`, `end_date`, `rate` and `quantity`. The richer schema is the more permissive one.

The reason is architectural rather than sloppy. AAMP's Line is an OpenDirect insertion-order line, filled in by a booking system. AdCP's Package is the seller's reply to a buyer that already agreed to a product, so most of its content is inherited rather than stated.

## How is this term sourced?

AdCP side: `dist/schemas/3.1.10/core/package.json`, `core/targeting.json` and `core/canonical-format-kind.json`, from `adcontextprotocol/adcp` at commit `f1a35ab`, release 3.1.10. Line item wording quoted from `docs/reference/glossary.mdx`.

AAMP side: `spec/jsonschema/Line.json` and `spec/jsonschema/Package.json` from `IABTechLab/iab-agentic-primitives` at commit `2fc7029`. That repository is marked "WORK IN PROGRESS — NOT YET RELEASED" by its own README and is absent from the AAMP hub README. AAMP terms on this site come from reference implementations, not from a ratified specification.
