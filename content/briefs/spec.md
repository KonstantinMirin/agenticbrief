---
title: 'What a Protocol-Conformant Brief Actually Is'
description: 'A protocol-conformant campaign brief is not a document. In AdCP 3.1.10 it is one string field on get_products, gated by buying_mode, sitting beside 30 typed filters.'
answer: 'A protocol-conformant campaign brief is the brief string on an AdCP get_products request, gated by buying_mode. It is a field inside a typed request object, not a standalone document, and create_media_buy has no brief field at all.'
pubDate: 2026-08-09
cluster: 'bg-format'
worked: false
keywords:
  - 'protocol-conformant campaign brief'
  - 'adcp brief format'
  - 'machine-readable campaign brief'
  - 'what is an adcp brief'
  - 'adcp buying_mode'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
related:
  - '/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/examples/ctv-guaranteed-launch/'
  - 'https://adcpexplorer.noetis.dev/operations/get-products/'
  - 'https://adtechglossary.noetis.dev/concepts/adcp/'
reviewState: cto-reviewed
---

## What is a protocol-conformant campaign brief?

In AdCP 3.1.10 the brief is a string. That is the whole of it. `brief` is one property on the `get_products` request object, typed as `"type": "string"`, with no length limit, no structure, no sub-fields, and no required companions. Everything a human brief template usually asks for lives somewhere else in the request, or nowhere.

"Protocol-conformant" therefore means something narrower than "well-written". It means: the request object that carries your brief validates against a published release of the protocol, the brief string is present in the mode that requires it and absent in the modes that forbid it, and the constraints you actually want enforced are in fields the seller can enforce.

Everything below is derived from `dist/schemas/3.1.10/`, the published stable release, at repository commit `f1a35ab` (2026-08-06). The AdCP version oracle is `dist/schemas/latest.json`, which reports `latest_stable: "3.1.10"`.

## Where does the brief live in an AdCP request?

In `get_products`, and nowhere else in the buying surface. One other operation in AdCP 3.1.10 has a field called `brief`: `list_transformers` takes a natural-language string to rank creative transformers. Same idea, different catalogue. It is not a second campaign brief.

The request has twenty fields: eighteen of its own plus `adcp_version` and `adcp_major_version`, composed in through `core/version-envelope.json`. Its `required` array has one entry:

```json
"required": ["buying_mode"]
```

That is worth sitting with. The one thing AdCP insists on in a discovery request is not the brief, not the brand, not the budget. It is a declaration of what kind of request this is.

## What does buying_mode do to the brief?

`buying_mode` is an enum with three values, and it is a gate on which of `brief` and `refine` may appear.

| `buying_mode` | `brief`   | `refine`  | What the seller does                                                                                          |
| ------------- | --------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `brief`       | Required  | Forbidden | Curates a product set and proposals from your description. May answer asynchronously.                         |
| `wholesale`   | Forbidden | Forbidden | Returns a raw product feed for you to target yourself. No curation, no proposals. Must not use the async arm. |
| `refine`      | Forbidden | Required  | Applies your change requests to a previous response, matched by array position.                               |

The timing rule attached to `buying_mode` is easy to miss and matters for anyone building a buyer agent. A `wholesale` request "MUST NOT" be routed through the async Submitted arm; partial results are signalled through the response's `incomplete[]` array instead. `brief` and `refine` may return a Submitted envelope when curation needs an upstream query or a human review. If you need a predictable fast answer, the spec tells you to use `wholesale` and give up curation.

`buying_mode` is also the field that pre-v3 clients did not send. The schema description says sellers receiving a request without it "SHOULD default to `brief`", which is the only backwards-compatibility affordance in the whole discovery surface.

## Why does create_media_buy have no brief?

Because by the time you call it, the brief has been answered.

`create_media_buy` in AdCP 3.1.10 has twenty properties and five required ones: `idempotency_key`, `account`, `brand`, `start_time`, `end_time`. There is no `brief`. There is no `filters`. The object carries `packages` or a `proposal_id`, `total_budget`, `po_number`, `io_acceptance`, `invoice_recipient`, and three webhook configurations.

The shape of the pair is the argument. `get_products` is the describe-and-discover call, and it is the only place a natural-language description belongs. `create_media_buy` is the commit call, and it carries an idempotency key precisely because committing twice is the failure mode that matters. A "brief" that a system sends at commit time is a brief nobody is going to read.

## What is in the request besides the brief?

The typed half. `filters` is a `product-filters` object with 30 properties in the 3.1.10 release, covering delivery type, exclusivity, pricing currency, fixed-price versus auction, formats, flight dates, budget range, four levels of geography, channels, four placement-type vocabularies, keyword matching, signal targeting, and required measurement capability.

The filter contract has one rule that shapes everything else: **filters exclude, they do not fail.** The reference page states it as "filter-not-fail" for `required_metrics`, and the response carries an optional `filter_diagnostics` block with `total_candidates` and per-filter `excluded_by` counts so a buyer can tell "no inventory exists" from "your own filter removed everything". If you put a constraint in `filters`, products that miss it disappear silently.

That is the difference the brief string cannot express and the reason both halves exist. Which half a given requirement belongs in is the subject of [brief vs filters](/spec/brief-vs-filters/), where AdCP's own documentation gives two incompatible answers.

Alongside those, three fields carry identity rather than intent: `brand` (a `BrandRef`, requiring only a `domain`), `account` (which switches returned pricing from list to your rate card), and `catalog` (an item set for catalog-driven retail media, which the reference page says requires `brand`).

## What does a schema pass fail to check?

I ran four payloads against `dist/schemas/3.1.10/media-buy/get-products-request.json` with a Draft-07 validator and a local registry built from every schema in the release that declares a `$id` (760 of the 761 JSON files; only `manifest.json` has none). Three passed that should not have.

| Payload                                                      | Should it be legal?                                      | Draft-07 result  |
| ------------------------------------------------------------ | -------------------------------------------------------- | ---------------- |
| `{"buying_mode": "wholesale", "brief": "..."}`               | No. The docs call it "an error".                         | Passes           |
| `{"buying_mode": "brief", "breif": "...", "fliters": {...}}` | No. Two misspelled fields.                               | Passes           |
| `{"buying_mode": "brief"}`                                   | No. `brief` is "Required when `buying_mode` is `brief`". | Passes           |
| `{"buying_mode": "refine", "refine": []}`                    | No. `minItems: 1`.                                       | Fails, correctly |

Two structural reasons. First, `get-products-request.json` sets `additionalProperties: true`, so an unknown key is an extension rather than a typo. Second, the brief-mode exclusivity rules live in the `description` string of `buying_mode` and of `brief`, and in the prose of `brief-expectations.mdx`. No `if`/`then`, no `not`, no `oneOf` encodes them. The schema's only conditional is unrelated: it requires `buying_mode: "wholesale"` when `if_wholesale_feed_version` or `if_pricing_version` is present.

There is one more prose-only rule with no schema anywhere. The error table in `get_products.mdx` lists `INVALID_REQUEST` for "Brief too long or malformed filters". No `maxLength` exists on `brief` in any 3.1.10 schema, so "too long" is a seller-side number that no buyer can discover before being rejected.

## What a conformant brief looks like when it is finished

```json
{
  "adcp_version": "3.1",
  "buying_mode": "brief",
  "brief": "Regional grocery chain launching a private-label ready-meal range. Reach household grocery decision-makers who cook on weeknights. Favour recipe, food and lifestyle contexts; avoid weight-loss and diet adjacency.",
  "brand": { "domain": "example-grocer.example" },
  "filters": {
    "channels": ["ctv", "olv"],
    "countries": ["US"],
    "start_date": "2026-10-05",
    "end_date": "2026-11-29",
    "pricing_currencies": ["USD"],
    "required_metrics": ["impressions", "completed_views"]
  }
}
```

Note `adcp_version: "3.1"` and not `"3.1.10"`. The envelope's `adcp_version` is release precision, and its pattern is `^\d+\.\d+(-[a-zA-Z0-9.-]+)?$` — two numeric segments plus an optional prerelease tag, so `"3.1.10"` does not match it. Patches are not negotiated; they surface as `build_version` on capabilities. Sending a full semver here is a common client bug.

A longer, harder one with exclusivity, viewability standards and a real flight is in the [worked CTV example](/examples/ctv-guaranteed-launch/).
