---
title: 'Send a Campaign Brief on get_products'
description: 'In AdCP 3.1.13 the campaign brief is a single string on get_products, gated by buying_mode. create_media_buy has no brief field, and the migration docs say it does.'
answer: 'Send a campaign brief in AdCP 3.1.13 as one free-text string, the brief field of a get_products request: no sub-fields, no maximum length, required when buying_mode is brief and forbidden in wholesale and refine. create_media_buy has no brief field.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
keywords:
  - 'protocol-conformant campaign brief'
  - 'adcp brief format'
  - 'machine-readable campaign brief'
  - 'what is an adcp brief'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/version-envelope.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/brand-ref.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/creative-brief.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/creative/list-transformers-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/signals/get-signals-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/task-reference/get_products.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/product-discovery/brief-expectations.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/migration/catalogs.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/whats-new-in-v3.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
related:
  - '/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/compare/adcp-brief-vs-aamp-campaign-brief/'
  - '/examples/ctv-guaranteed-launch/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adcpexplorer.com/operations/create-media-buy/'
  - 'https://adtechglossary.com/concepts/adcp/'
  - 'https://agenticadlab.com/'
reviewState: cto-reviewed
---

Send the campaign brief as the `brief` string on a `get_products` request, and set `buying_mode` before you decide whether you are allowed to send one at all. Nothing else in [AdCP](https://adtechglossary.com/concepts/adcp/) 3.1.13 carries a campaign brief, and no validator will hold you to either rule.

## A conformant request, filled in

Copy this and swap the brand and the filters.

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

`brief` is typed `"type": "string"`. No sub-fields, no `maxLength`. That is the whole definition of the field, and the string does not persist: it is scoped to the one request that carries it, and no later operation can read it back.

Send `adcp_version` as `"3.1"`, not `"3.1.13"`. The envelope pattern allows two numeric segments plus an optional prerelease tag, so a full semver fails it, and patches aren't negotiated on the wire at all; they surface as `build_version` on capabilities.

These rules are mechanical, so [the generator](/generate/) applies them for you: paste prose, get this request back with each field marked as taken from your text, derived from it, or assumed. It leaves a field blank when your brief didn't say so. Check any generated number against your own brief before it reaches a seller, because a number in this payload is a number you can be held to.

There's a harder payload in the [worked CTV example](/examples/ctv-guaranteed-launch/), with exclusivity and viewability floors on a real flight.

## Before the request leaves

Five checks to put in the client:

1. `brief` present when `buying_mode` is `brief`, absent when it is `wholesale` or `refine`.
2. `adcp_version` equal to `"3.1"`.
3. Spelling of the top-level keys. `breif` and `fliters` are accepted by the schema and dropped by any seller that doesn't recognise them.
4. A character cap on `brief` that you choose. No `maxLength` exists on the field in any 3.1.13 schema, and `get_products.mdx` ships an `INVALID_REQUEST` row for "Brief too long or malformed filters", so the limit is seller-side and you cannot read it before you hit it.
5. The release directory your generated types came from, pinned to `dist/schemas/3.1.13/`. `static/schemas/source/` is a different tree with different property counts.

## Put the brief on get_products and nowhere else

`create-media-buy-request.json` has no `brief` property. The migration guide tells you to send one anyway: it validates, and nothing reads it.

The file, `media-buy/create-media-buy-request.json`, has twenty properties. Five are required: `idempotency_key`, `account`, `brand`, `start_time`, `end_time`. Neither `brief` nor `filters` is among the twenty. Because that schema sets `additionalProperties: true`, a payload carrying `brief` validates cleanly, with no error and no warning.

By the time you call [create_media_buy](https://adcpexplorer.com/operations/create-media-buy/) the products are already chosen, so a description of what you're trying to achieve has nothing left to steer. This is the call that commits: `idempotency_key` is required, its pattern is `^[A-Za-z0-9_.:-]{16,255}$`, and the description tells sellers to return the existing media buy rather than create a duplicate. The release marks 31 request schemas `x-mutates-state: true` and `create_media_buy` is one of them; `get_products` isn't.

`docs/reference/migration/catalogs.mdx` tells you to put a `brief` on `create_media_buy`:

> The `promoted_offering` string field is removed from media buy objects. What's being promoted is now expressed through the `brief` on `get_products`/`create_media_buy` and through catalog references on creatives.

The same guide names "The `brief` field on `get_products` and `create_media_buy`" as a replacement source of context, and a numbered migration step reads "Remove the `promoted_offering` string from `create_media_buy` requests. Use the `brief` field to describe what's being promoted." `docs/reference/whats-new-in-v3.mdx` carries it into its migration tables as "Removed — use `brand` + `brief`". `promoted_offering` really is gone; it appears in no request schema in 3.1.13.

Three things tell the seller what is being promoted at the moment of commitment, and none of them is prose:

- `brand`, which is required and is a domain.
- The `packages` or `proposal_id` you carry over from the `get_products` response the seller curated itself.
- Catalog references on the creatives.

A buyer that skips discovery and posts a media buy against a week-old `proposal_id` is handing over a domain and some IDs, and the promoted-offering context now lives in the seller's memory of the conversation rather than in the request. If your workflow allows that gap, carry the context yourself and re-send it as a `refine` or a fresh `get_products` before you commit.

## Every field on a get_products request

Read the last column before you rely on a field. Everything not held to more than its type is type-checked and otherwise yours.

| Field                       | Type                          | Required when           | Schema enforces it?                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | ----------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adcp_version`              | string (envelope)             | Never                   | Yes, pattern `^\d+\.\d+(-[a-zA-Z0-9.-]+)?$`                                                                                                                                                                                                                                                                                                 |
| `adcp_major_version`        | integer 1-99 (envelope)       | Never                   | Type only; deprecated, removed in 4.0                                                                                                                                                                                                                                                                                                       |
| `buying_mode`               | enum                          | Always                  | Yes, the single entry in `required`                                                                                                                                                                                                                                                                                                         |
| `brief`                     | string                        | `buying_mode: "brief"`  | No, prose only                                                                                                                                                                                                                                                                                                                              |
| `refine`                    | array                         | `buying_mode: "refine"` | Partly. `minItems: 1`, and the mode link and the finalize-exclusivity rule are prose only                                                                                                                                                                                                                                                   |
| `brand`                     | BrandRef                      | Never on this call      | Yes, `domain` required and `additionalProperties: false`                                                                                                                                                                                                                                                                                    |
| `catalog`                   | CatalogRef                    | Never                   | Yes, `dependencies` requires `brand` alongside it                                                                                                                                                                                                                                                                                           |
| `account`                   | AccountRef                    | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `preferred_delivery_types`  | array                         | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `filters`                   | ProductFilters, 30 properties | Never                   | Partly. `additionalProperties: true` at the object level, so a misspelled filter key is waved through, but the enums, the `countries` pattern, `min_exposures` `minimum: 1`, `threshold` `maximum: 1` and `budget_range`'s required `currency` plus its `min`-or-`max` `anyOf` all bite. [Worked example](/examples/ctv-guaranteed-launch/) |
| `property_list`             | ref                           | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `fields`                    | array                         | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `time_budget`               | Duration                      | Never                   | Yes, `{interval, unit}` with both required, `additionalProperties: false`, `unit` from a five-value enum. A bare integer is rejected                                                                                                                                                                                                        |
| `push_notification_config`  | ref                           | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `pagination`                | ref                           | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `if_wholesale_feed_version` | string                        | Never                   | Yes, forces `buying_mode: "wholesale"`                                                                                                                                                                                                                                                                                                      |
| `if_pricing_version`        | string                        | Never                   | Yes, requires `if_wholesale_feed_version` and forces wholesale                                                                                                                                                                                                                                                                              |
| `context`                   | ref                           | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `required_policies`         | array                         | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |
| `ext`                       | ref                           | Never                   | Type only                                                                                                                                                                                                                                                                                                                                   |

`adcp_version` and `adcp_major_version` are composed in from `core/version-envelope.json`; the rest are the request's own properties. The `filters` object carries thirty typed properties. `brief` is one untyped string, and the only field on the request a seller-side model interprets.

The `required` array has one entry, and it isn't `brief`:

```json
"required": ["buying_mode"]
```

## buying_mode decides whether the brief is required or forbidden

Set the mode first, then read this row before you attach a string.

| `buying_mode` | `brief`   | `refine`  | What the seller does                                                                                  |
| ------------- | --------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `brief`       | Required  | Forbidden | Curates products and proposals from your description. May answer asynchronously.                      |
| `wholesale`   | Forbidden | Forbidden | Returns a raw product feed for you to target yourself. Nothing is curated and no proposals come back. |
| `refine`      | Forbidden | Required  | Applies your change requests to a previous response, answered by array position.                      |

The rule itself is prose, in `brief-expectations.mdx`: "`buying_mode: "wholesale"` and `brief` are mutually exclusive — providing both is an error. If `buying_mode: "brief"` is set explicitly, `brief` is required."

The `buying_mode` enum description carries a timing rule too.

- A `wholesale` request MUST NOT be routed through the async Submitted arm. Partial completion comes back in the response's `incomplete[]` array instead.
- `brief` and `refine` mode MAY return a Submitted envelope when curation needs an upstream query or human review.

Wholesale is the only mode that cannot answer asynchronously. That is not a latency bound: nothing in the schema caps how long a synchronous answer takes. You do your own targeting in exchange.

`brief-expectations.mdx` is also the normative document on what goes inside the string. It asks for objectives, success metrics, flight dates, audience, budget, geography, creative constraints and brand safety requirements, grades briefs into quality levels, and tells sellers how to come back for clarification. That is a useful brief. A conformant brief is any non-empty string sent in the right mode, and no error code distinguishes the two. The document never mentions `refine` at all, so the third mode's prohibition on `brief` lives only inside a JSON `description` string.

See [brief vs filters](/spec/brief-vs-filters/) for which side of the request each line of a requirement goes on.

## What nothing validates for you

Run a draft-07 validator over an outbound request and four of the rules below still go unchecked. Rely on the official Python SDK alone and seven do. The last row is a deprecation notice rather than a rule to enforce.

| Rule                                                                    | Where it is written                                        | Schema | SDK model |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- | ------ | --------- |
| `brief` required in `brief` mode, forbidden in `wholesale` and `refine` | property descriptions, `brief-expectations.mdx`            | no     | no        |
| `refine[]` present at all in `refine` mode                              | prose, and `assert_buying_mode_consistent`                 | no     | no        |
| `refine[]` non-empty when sent                                          | `minItems: 1`                                              | yes    | yes       |
| `catalog` requires `brand`                                              | `dependencies`                                             | yes    | no        |
| `if_pricing_version` requires `if_wholesale_feed_version`               | `dependencies`                                             | yes    | no        |
| Version-feed tokens imply `buying_mode: "wholesale"`                    | `allOf[1]` `if`/`then`                                     | yes    | no        |
| `adcp_version` at release precision                                     | `pattern`                                                  | yes    | yes       |
| `required_axe_integrations`, a `filters` property, is deprecated        | its description string, "Use trusted_match filter instead" | no     | no        |

`get-products-request.json` does carry conditionals. One `if`/`then` inside `allOf[1]` binds `if_wholesale_feed_version` and `if_pricing_version` to `buying_mode: "wholesale"`, and two `dependencies` entries make `catalog` require `brand` and `if_pricing_version` require `if_wholesale_feed_version`. None of them constrains `brief`.

Don't treat a schema pass as a correctness check on this request. Three payloads that AdCP says in writing are illegal pass a draft-07 validator against the published 3.1.13 schemas: `{"buying_mode": "wholesale", "brief": "..."}`, which the property description says must not be provided; `{"buying_mode": "brief"}` with no `brief`, which the same description makes required; and `{"buying_mode": "brief", "breif": "...", "fliters": {...}}`, two misspelled top-level keys. The [full validator matrix](/spec/brief-vs-filters/) has the payloads that do fail.

`core/brand-ref.json` sets `additionalProperties: false`, so `{"brand": {"domian": "example.com"}}` is rejected while the identical typo one level up passes. Each object sets its own permissiveness, so check the object you are sending rather than assuming a validator covers the request.

`create-media-buy-request.json` has the same gap against its own prose: the description says "One of packages or proposal_id must be provided", and a request with neither passes.

`get_signals` runs the same design under different names: a `discovery_mode` enum gating a `signal_spec` string, described in the schema as symmetric with `get_products` `buying_mode`, with nothing at all in its `required` array.

## Python SDK

The official client is `adcp` on PyPI at `7.0.0rc1`, typed Pydantic models generated from these schemas by the organisation that publishes them. SDK versioning is independent of the protocol version, and `rc1` is a prerelease. Don't lean on the generated types: they catch less than a raw schema pass.

`GetProductsRequest` sets `model_config = ConfigDict(extra='allow')`, inherited from the schemas' own `additionalProperties: true`, and `brief` is not a required field on the model. All three broken payloads above construct without complaint, and `breif` and `fliters` survive into `model_dump()` as real keys. Consumers override that policy by hand on every subclass to get `extra='forbid'` back ([adcp-client-python#153](https://github.com/adcontextprotocol/adcp-client-python/issues/153)).

| Rule the schema declares                                                  | Model keeps it? |
| ------------------------------------------------------------------------- | --------------- |
| `pattern` on `adcp_version`                                               | yes             |
| `minItems: 1` on `refine`                                                 | yes             |
| `dependencies`: `catalog` requires `brand`                                | no              |
| `dependencies`: `if_pricing_version` requires `if_wholesale_feed_version` | no              |
| `if`/`then`: a version token forces `buying_mode: "wholesale"`            | no              |

Every conditional the schema declares is dropped, so the SDK and a plain schema pass reject exactly one identical input, `adcp_version: "3.1.13"`.

The `buying_mode` rule does exist in the SDK, in hand-written Python. `assert_buying_mode_consistent`, in `src/adcp/decisioning/refine.py`, raises `AdcpError("INVALID_REQUEST")` on exactly the cases the schema misses. Its only call site is the seller-side decisioning shim, so the check runs when a request arrives and not when a buyer builds one. The docstring's parenthetical for `buying_mode='brief'` says the check is "handled by Pydantic validation upstream". No `model_validator` in the package touches `buying_mode`.

Permissive-on-send is deliberate across AdCP's clients. Its own documentation describes the Go SDK's `adcp.AddTool` as generating a schema "while allowing additional protocol fields", explicitly against `mcp.AddTool`, "which rejects extra fields".

## What the brief string won't carry

### Tone, territory and messaging

If your existing template asks for tone or territory, don't look for those on `get_products`. AdCP does have a structured object for them: `core/creative-brief.json`, eight properties including `tone`, `territory` and a `messaging` block. It rides inside creative manifests as an asset and never touches the media-buy surface. The [crosswalk](/crosswalk/creative-brief-to-adcp/) takes a human brief field by field and says where each one lands.

### Two operations use the name brief

The creative surface declares a top-level `brief` too. `creative/list-transformers-request.json` takes a "Natural-language brief used to rank and filter transformers... e.g. 'warm female Spanish-language voiceover'", and its own description says it curates "the way get_products curates inventory".

| Operation           | Free-text field | What the text selects           |
| ------------------- | --------------- | ------------------------------- |
| `get_products`      | `brief`         | Inventory, in brief mode        |
| `get_signals`       | `signal_spec`   | Audience and contextual signals |
| `list_transformers` | `brief`         | Creative transformers           |

Generate client types from these schemas and two unrelated things arrive under one name. Rename one of them in your own code before they collide.

### AAMP's campaign brief has no overlap

AAMP's buyer agent models a campaign brief as eight required fields plus a `budget_pct` on every channel allocation, with no ratified JSON Schema behind any of them. That difference gets [its own comparison](/compare/adcp-brief-vs-aamp-campaign-brief/).
