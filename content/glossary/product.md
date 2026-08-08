---
title: 'Product (AdCP) — 49 Fields, and Why It Is Not a Catalog Row'
description: "Product is AdCP's unit of sellable inventory: 49 fields, 7 required, discovered by natural language through get_products. Definition from the 3.1.10 schema."
answer: 'A product is a unit of advertising inventory a seller offers, discovered through get_products. AdCP 3.1.10 defines 49 fields on it, 7 required, including delivery type, pricing options and reporting capabilities.'
pubDate: 2026-08-09
term: 'Product'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['AdCP product', 'inventory product']
keywords:
  - 'adcp product'
  - 'adcp product schema'
  - 'product definition advertising'
  - 'get_products product object'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/delivery-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/exclusivity.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Product.json'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/opendirect.json'
related:
  - '/media-buying/package/'
  - '/media-buying/media-buy/'
  - '/signals/audience-vs-signal/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
seeAlso: ['package', 'media-buy', 'signal-definition']
reviewState: cto-reviewed
---

## What is a product in AdCP?

A product is a unit of advertising inventory a seller is willing to sell. The schema at `/schemas/3.1.10/core/product.json` describes it in four words: "Represents available advertising inventory". AdCP's glossary adds the part that actually distinguishes it: inventory "discovered through natural language queries".

Products are the output of `get_products`. A buyer agent sends a brief, structured filters, or both, and the seller returns products. Packages are then created against those products inside a media buy.

The product object is the largest core object in the protocol: 49 properties, 7 required.

## Which product fields are required?

| Field                    | Type                   | What it holds                                         |
| ------------------------ | ---------------------- | ----------------------------------------------------- |
| `product_id`             | string                 | Unique identifier for the product                     |
| `name`                   | string                 | Human-readable product name                           |
| `description`            | string                 | Detailed description of the product and its inventory |
| `publisher_properties`   | array                  | The properties the product runs on                    |
| `delivery_type`          | enum                   | `guaranteed` or `non_guaranteed`                      |
| `pricing_options`        | pricing-option[]       | Available pricing models for this product             |
| `reporting_capabilities` | reporting-capabilities | What the seller can report on                         |

Two of those are worth pausing on.

`delivery_type` is a two-value enum and it is required, which means every AdCP product declares up front whether it is guaranteed. There is no "it depends" branch. `exclusivity` sits next to it as an optional three-value enum (`none`, `category`, `exclusive`).

`publisher_properties` carries a warning aimed directly at code generators: "SDK implementers MUST enforce singular-only at runtime: each entry uses the singular `publisher_domain` form; the compact `publisher_domains[]` form is rejected on products." The schema then says that common codegen toolchains flatten the constraint away silently. That is a specification telling implementers not to trust their own tooling.

## Is an AdCP product a fixed catalog row?

No, and three optional fields say so.

- `is_custom` — "Whether this is a custom product".
- `expires_at` — "Expiration timestamp. After this time, the product may no longer be available for purchase and create_media_buy may reject packages referencing it."
- `brief_relevance` — "Explanation of why this product matches the brief (only included when brief is provided)".

Put together, a seller agent may synthesise a product in response to a specific brief, attach a natural-language justification for why it fits, and stamp it with an expiry. The buyer agent then has a limited window to convert it into a package before the offer goes stale.

This is the structural difference between AdCP's product and a traditional rate-card row. The rate card is a catalog you browse. An AdCP product can be an answer to a question you asked.

## How do signals attach to a product?

Five separate fields govern that, and the defaults are restrictive:

| Field                      | Meaning                                                 |
| -------------------------- | ------------------------------------------------------- |
| `included_signals`         | Non-selectable signal metadata bundled into the product |
| `data_provider_signals`    | Third-party provider signals the product can apply      |
| `signal_targeting_options` | Inline signal options a buyer may select                |
| `signal_targeting_rules`   | How selected signals are applied                        |
| `signal_targeting_allowed` | Whether the package-level signal surface exists at all  |

`signal_targeting_allowed` defaults to false. The schema spells out the consequence: when false, "signals are bundled into the product terms and cannot be selected or explicitly echoed as package signal groups". `property_targeting_allowed` behaves the same way, defaulting to false and making the product "all or nothing" for property filtering.

A buyer agent that assumes it can narrow any product will be wrong by default on both axes.

## What is the AAMP counterpart to a product?

Both AAMP layers define a Product, and neither is close to AdCP's in size.

|                            | AdCP Product                                       | AAMP Product (primitives)                                       | OpenDirect Product (agentic-direct)                        |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Source                     | `dist/schemas/3.1.10/core/product.json`            | `spec/jsonschema/Product.json`                                  | `opendirect.json` schemas block                            |
| Summary                    | "Represents available advertising inventory"       | "Sellable unit of publisher inventory"                          | "Product catalog item from ad placement to Run of Network" |
| Properties                 | 49                                                 | 16                                                              | OpenDirect 2.1 shape                                       |
| Required                   | 7                                                  | 3 (`product_id`, `seller_organization_id`, `name`)              | —                                                          |
| Discovery mode             | Natural-language brief plus structured filters     | Media kit and avails search                                     | CRUD plus `search_products` tool                           |
| Can be generated per brief | yes (`is_custom`, `brief_relevance`, `expires_at`) | not modelled                                                    | not modelled                                               |
| Taxonomy hooks             | none on the object itself                          | IAB Content, Audience and Ad Product taxonomy targeting intents | AdCOM and OpenRTB references                               |

The gap in field count is not padding on AdCP's side. It is measurement, governance and signal machinery that AAMP's control plane puts somewhere else or does not have. AAMP's Product, in exchange, binds directly to IAB's own taxonomies, which AdCP's does not.

Note the source status difference as well. AdCP's product schema ships in a versioned stable release. AAMP's ships in a library whose README says "WORK IN PROGRESS — NOT YET RELEASED", and the `agentic-direct` copy lives in a file the repository's own README calls an "OpenAPI 3.0 Schema" when it is in fact an MCP tool manifest.

## How is this term sourced?

AdCP side: `dist/schemas/3.1.10/core/product.json` plus the `delivery-type` and `exclusivity` enums, from `adcontextprotocol/adcp` at commit `f1a35ab`, release 3.1.10 as reported by `dist/schemas/latest.json`. Prose quoted from `docs/reference/glossary.mdx`.

AAMP side: `spec/jsonschema/Product.json` from `IABTechLab/iab-agentic-primitives` at commit `2fc7029`, and `opendirect.json` from `IABTechLab/agentic-direct` at commit `915bda9`. Both are reference implementations rather than ratified specifications, and neither repository references AdCP anywhere.
