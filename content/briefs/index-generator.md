---
title: 'Generate a Protocol-Conformant Campaign Brief'
description: 'Brief Gateway turns a campaign brief into a get_products request an AdCP seller agent can consume. Built against the published 3.1.10 schemas, not a PDF template.'
answer: 'A protocol-conformant campaign brief is an AdCP get_products request: a buying_mode, a natural-language brief string, and a typed filters object. Brief Gateway emits that JSON object, validated against the published AdCP 3.1.10 schema, instead of a PDF.'
pubDate: 2026-08-09
cluster: 'bg-generator'
worked: false
keywords:
  - 'adcp brief generator'
  - 'get_products request builder'
  - 'agentic campaign brief generator'
  - 'protocol-conformant brief'
  - 'machine readable campaign brief'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/version-envelope.json'
  - 'https://docs.adcontextprotocol.org/'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - '/examples/ctv-guaranteed-launch/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://agenticadlab.noetis.dev/'
reviewState: cto-reviewed
---

## What does Brief Gateway actually produce?

Brief Gateway produces one thing: a JSON object shaped like an AdCP `get_products` request. Not a document about a campaign. The request itself, ready to POST at a sales agent.

I went looking for a campaign-brief generator that emits something a machine could consume, and did not find one. The tools that surface for "campaign brief generator" — QuillBot, Storyflow, Mailmodo, Uplifted, Template.net — all stop at a document for a human to read. That is a reasonable product if the reader is a media planner. It is worth nothing if the reader is a seller agent, because a seller agent does not parse a PDF; it parses a request against a published schema and rejects what does not fit. Survey done 2026-08, from each tool's own description of its output.

So this site is built around a narrower question than "how do I write a good brief". The question is: **what does an agent-readable brief look like, field by field, in a released version of a real protocol?**

## Which protocol version does the generator target?

AdCP 3.1.10, the current published stable release. The version oracle is `dist/schemas/latest.json` in the `adcontextprotocol/adcp` repository, which reads:

```json
{
  "latest": "3.1.10",
  "latest_stable": "3.1.10",
  "channel": "stable",
  "path": "/schemas/3.1.10/",
  "index": "/schemas/3.1.10/index.json"
}
```

That release registers 64 operations. Two other version numbers exist in the same repository and neither is the release: `package.json` and `static/schemas/source/index.json` both carry a stale `3.1.1` stamp, because the changesets tooling only bumps them at release time. Anything generated here is derived from `dist/schemas/3.1.10/`, never from the working branch. Where an operation exists only on the unreleased `main` branch, this site says so explicitly.

Checked against commit `f1a35ab`, 2026-08-06.

## Which get_products fields carry a brief?

`get_products` has twenty request fields: eighteen properties of its own, plus `adcp_version` and `adcp_major_version` composed in through `core/version-envelope.json`. Exactly one of the twenty is required, and it is not the brief.

| Field                      | Required    | What it is for                                                                                   |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `buying_mode`              | **Yes**     | `brief`, `wholesale` or `refine`. Declares what kind of request this is.                         |
| `brief`                    | Conditional | The natural-language campaign description. Required in `brief` mode, forbidden in the other two. |
| `filters`                  | No          | Typed constraints. 30 properties in 3.1.10; they exclude rather than rank.                       |
| `brand`                    | No          | `BrandRef` (a domain, plus optional brand id and industries). Drives policy and eligibility.     |
| `account`                  | No          | Rate-card identity, so returned pricing is yours rather than list.                               |
| `preferred_delivery_types` | No          | Ordered preference for guaranteed or non-guaranteed, which does not exclude anything.            |
| `catalog`                  | No          | Item set for catalog-driven buying, mostly retail media.                                         |
| `refine`                   | Conditional | Change requests against a previous response. Required in `refine` mode.                          |
| `time_budget`              | No          | How long the buyer will wait before the seller should return what it has.                        |
| `fields`                   | No          | Response projection, for lightweight discovery calls.                                            |

The remaining ten are `property_list`, `pagination`, `push_notification_config`, `if_wholesale_feed_version`, `if_pricing_version`, `context`, `required_policies`, `ext`, `adcp_version` and `adcp_major_version`. Field-level reference for all of them lives on [AdCP Explorer](https://adcpexplorer.noetis.dev/operations/get-products/); this site is about what goes in them.

## Does create_media_buy carry a brief too?

No. This is the fact the whole site is built on, and it is easy to check.

`create_media_buy` in AdCP 3.1.10 has twenty properties and five required ones: `idempotency_key`, `account`, `brand`, `start_time` and `end_time`. There is no `brief` property. There is no `filters` property either. `create_media_buy` carries a commitment, not a description: packages or a `proposal_id`, budget, flight, invoicing details, webhooks.

The campaign brief exists at exactly one point in the AdCP buying surface, in `get_products`, and its job is to be replaced by a product selection. Once the seller has answered, the brief has done its work.

## What will a JSON Schema validator not catch?

More than you would expect, and this is why the checks here are a linter rather than a plain schema pass. Three payloads I ran against `dist/schemas/3.1.10/media-buy/get-products-request.json` with a Draft-07 validator, all of which passed:

```json
{
  "buying_mode": "wholesale",
  "brief": "Reach travellers on CTV",
  "brand": { "domain": "northwindair.example" }
}
```

The `buying_mode` description says a brief "must not be provided" in wholesale mode, and `brief-expectations.mdx` calls the combination "an error". No `if`/`then`, no `not`, no `oneOf` encodes it. The validator accepts it.

```json
{ "buying_mode": "brief", "breif": "typo in the field name", "fliters": { "channels": ["ctv"] } }
```

`get-products-request.json` sets `additionalProperties: true`. Misspelled field names are not errors, they are extensions. The seller silently ignores them and returns something that looks fine.

```json
{ "buying_mode": "brief" }
```

The docs say `brief` is "Required when `buying_mode` is `brief`". The schema's `required` array contains one entry, `buying_mode`. A brief-mode request with no brief validates.

Rules that live only in prose need a checker that reads prose. That is the part no generic validator will do for you.

## Where should I go from here?

- [What a protocol-conformant brief actually is](/spec/) — the definition, the three modes, and what the object contains.
- [What goes in the brief string and what goes in filters](/spec/brief-vs-filters/) — where AdCP's own two documents disagree, and how to decide.
- [From creative brief to agent brief](/crosswalk/creative-brief-to-adcp/) — a row-by-row crosswalk from the brief you already write, including the rows that have no destination.
- [Worked example: guaranteed CTV brand launch](/examples/ctv-guaranteed-launch/) — a filled-in brief and the exact payload it compiles to.
- [AdCP brief vs AAMP CampaignBrief](/compare/adcp-brief-vs-aamp-campaign-brief/) — two objects with the same name that share no fields.

Brief Gateway is not affiliated with AgenticAdvertising.org or IAB Tech Lab. It reads their published artifacts and says which file each claim came from.
