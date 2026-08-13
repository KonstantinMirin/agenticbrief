---
title: 'Product (AdCP): the unit of sellable inventory'
description: 'In AdCP a product is a unit of sellable inventory returned by get_products, carrying its publisher properties, delivery type, pricing options and reporting capabilities.'
answer: 'In AdCP, a product is a unit of sellable advertising inventory offered by a seller and returned by get_products, describing the properties it runs on, how it delivers, what it costs and what the seller can report on.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Product'
category: 'programmatic'
cluster: 'gl-objects'
alternateNames: ['AdCP product', 'inventory product', 'media product']
keywords:
  - 'adcp product'
  - 'adcp product schema'
  - 'adcp product required fields'
  - 'get_products product object'
  - 'product definition advertising'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/delivery-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/exclusivity.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/reporting-capabilities.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/media-products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/tree/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/examples/products/canonical'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Product.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/RateCard.json'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/opendirect.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/routers/products.py'
related:
  - '/media-buying/'
  - '/media-buying/package/'
  - '/media-buying/media-buy/'
  - '/concepts/opendirect/'
  - '/signals/audience-vs-signal/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/operations/get-products/'
seeAlso: ['package', 'media-buy', 'opendirect', 'signal-definition']
reviewState: cto-reviewed
---

A product in AdCP is a unit of inventory a seller is willing to sell. It is returned by [`get_products`](https://adcpexplorer.com/operations/get-products/) and turned into [packages](/media-buying/package/) inside a [media buy](/media-buying/media-buy/). The schema at `dist/schemas/3.1.13/core/product.json` describes it in four words: "Represents available advertising inventory". AdCP's [glossary](https://docs.adcontextprotocol.org/docs/reference/glossary) adds the part that separates it from a rate card line: inventory "discovered through natural language queries".

Commercially, a product is the seller's own definition of what it sells: which publisher properties it runs on, whether delivery is guaranteed, which pricing models are available on it, and what the seller undertakes to report. A buyer does not browse a catalog to find it; it describes a campaign and the seller returns the products it considers a match.

## How many fields a valid product needs

`core/product.json` carries 49 properties, more than any other object in the release, and its `required` array lists seven. An `anyOf` adds a format field, so eight are needed to validate, and every shipped fixture also carries `channels`.

| Field                    | Status                          | What it holds                                         |
| ------------------------ | ------------------------------- | ----------------------------------------------------- |
| `product_id`             | required                        | Unique identifier for the product                     |
| `name`                   | required                        | Human-readable product name                           |
| `description`            | required                        | Detailed description of the product and its inventory |
| `publisher_properties`   | required, `minItems: 1`         | The properties the product runs on                    |
| `delivery_type`          | required                        | `guaranteed` or `non_guaranteed`                      |
| `pricing_options`        | required, `minItems: 1`         | Available pricing models for this product             |
| `reporting_capabilities` | required                        | What the seller can report on                         |
| `format_options`         | `anyOf`, absent from `required` | Inline format declarations, the 3.1+ path             |
| `channels`               | optional, in every fixture      | The channels the product is sold as                   |
| `format_ids`             | `anyOf`, legacy                 | Named-format references                               |

An object carrying only the seven required fields fails validation, because an `anyOf` demands `format_ids` or `format_options` as well. The rule that governs the eighth is prose inside the `format_ids` description: "Products MUST carry `format_ids`, `format_options`, or BOTH; at least one is required." Either field satisfies it. The two paths are not equal: `format_ids` is legacy, on a published deprecation calendar, and when both are present the schema says "prefer `format_options`".

Eight is a count of top-level keys. `reporting_capabilities` is an object with six required sub-fields of its own, so thirteen named values are needed before a single publisher property or pricing option is filled in.

`publisher_properties` carries a normative instruction addressed to SDK implementers: "SDK implementers MUST enforce singular-only at runtime: each entry uses the singular `publisher_domain` form; the compact `publisher_domains[]` form is rejected on products". It names four toolchains that often drop the restriction silently and emit an unrestricted type, so a generated client will accept the compact form and a conformant seller will reject it.

## Where the schema and the documentation differ

Both declare seven required fields, and they name different sevens. The docs page lists 39 fields against the schema's 49: `reporting_capabilities` is required in the schema and absent from the docs, `format_options` is an `anyOf` branch in the schema and required in the docs, `collections` and `installments` are documented under the names `shows` and `episodes`, and five documented fields do not exist in the release at all. The live docs site carries the same omissions.

Because `additionalProperties` is true, a product written from the documentation validates clean, its invented `shows` key riding along as an ignored extra, and nothing tells the author that the targeting they wrote was dropped.

## Custom and expiring products

Three optional fields say a product need not be a fixed catalog row. `is_custom` is "Whether this is a custom product". `expires_at` is an "Expiration timestamp. After this time, the product may no longer be available for purchase and create_media_buy may reject packages referencing it." `brief_relevance` carries an "Explanation of why this product matches the brief (only included when brief is provided)". Nothing pushes a notice when the window closes, and the firmest statement of what happens next is the `PRODUCT_EXPIRED` error, correctable by re-running `get_products`.

None of the three appears in any example payload in the repository. The canonical product fixtures under `static/examples/products/canonical/` are static catalog rows carrying the same small set of keys, and `nytimes_homepage_takeover_custom.json` is named custom without setting `is_custom`.

## Targeting permissions

Three booleans default to `false`: `signal_targeting_allowed`, `property_targeting_allowed`, `collection_targeting_allowed`. Each bundles something a buyer might have assumed they could filter on. With `signal_targeting_allowed` false, signals "are bundled into the product terms". With `collection_targeting_allowed` false, "the product is a bundle — buyers get all listed collections". With `property_targeting_allowed` false, the product goes "all or nothing".

Only `signal_targeting_allowed` has a schema conditional behind it: an `allOf` rejects any product that declares `signal_targeting_options` without `signal_targeting_allowed: true`. The other two read `false` whether or not the seller set them. What the surviving signal fields address is on [audience vs signal](/signals/audience-vs-signal/).

## Three protocols define an object called Product

A field-name crosswalk breaks at `delivery_type`, the first field anyone would map: the three enums hold two, three and seven values. AdCP keeps delivery and exclusivity in separate enums, the second holding `none`, `category` and `exclusive`. AAMP folds exclusivity into `DeliveryType`, and OpenDirect folds deal type in on top of that. AdCP's FAQ names AAMP but publishes no mapping to it, saying "AAMP is still defining its normative surface."

|                       | AdCP Product                                 | AAMP primitives Product                                          | [OpenDirect](/concepts/opendirect/) Product                                   |
| --------------------- | -------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Properties / required | 49 / 7 listed, 8 to validate                 | 16 / 3: `product_id`, `seller_organization_id`, `name`           | 31 / 7                                                                        |
| `delivery_type`       | `guaranteed`, `non_guaranteed`               | `Exclusive`, `Guaranteed`, `PMP`                                 | 7 values, including three PMP flavours and two OpenRTB deal types             |
| Where price lives     | `pricing_options`, required on the object    | `base_price` optional list price; negotiated rate on `RateCard`  | `baseprice` required, "Base retail price (not rate card)"                     |
| Per-brief minting     | `is_custom`, `brief_relevance`, `expires_at` | not modelled                                                     | `activedate` and `retirementdate`, catalog lifecycle rather than offer expiry |
| Artifact and status   | published release 3.1.13                     | [unreleased library](https://aampexplorer.com/versions/), v0.5.0 | MCP tool manifest, `version` 2.1.0                                            |
