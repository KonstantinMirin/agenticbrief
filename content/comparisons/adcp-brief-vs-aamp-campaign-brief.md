---
title: 'AdCP Brief vs AAMP CampaignBrief: Two Objects, One Name'
description: "AdCP's brief is a string field on get_products. AAMP's CampaignBrief is a Python class in a reference implementation, defined four incompatible ways, and absent from the wire contract."
answer: "AdCP's brief is a natural-language string field on the get_products request. AAMP's CampaignBrief is a Pydantic model in IAB Tech Lab's buyer-agent reference implementation. They share no fields, and CampaignBrief appears in no AAMP wire schema."
pubDate: 2026-08-09
cluster: 'bg-aamp'
subjects:
  - 'AdCP brief'
  - 'AAMP CampaignBrief'
keywords:
  - 'aamp campaign brief'
  - 'iab buyer agent campaign brief'
  - 'campaign brief json schema'
  - 'adcp brief vs aamp brief'
  - 'campaign_brief.json'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/campaign_brief.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/examples/campaign_brief.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/data/campaign_briefs.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/interfaces/cli/main.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/flow_state.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/interfaces/api/main.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/ProductListRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/harness/roles.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
  - 'https://aampexplorer.noetis.dev/repos/iab-agentic-primitives/'
  - 'https://aampexplorer.noetis.dev/what-does-aamp-stand-for/'
reviewState: cto-reviewed
---

## Are the AdCP brief and the AAMP CampaignBrief the same thing?

No, and they are not even the same kind of thing.

AdCP's brief is a `string` property on a request object. The campaign brief appears on exactly one operation, `get_products`, and its content is unstructured prose that a seller agent interprets. (A second `brief` string exists on `list_transformers`, but it ranks creative transformers rather than inventory.) Published, versioned, released as part of AdCP 3.1.10.

AAMP's `CampaignBrief` is a Pydantic class in the Python source of IAB Tech Lab's buyer-agent reference implementation. It has typed required fields, cross-field validators, and an enum for the campaign objective. It is a richer object by a wide margin. It is also not in any AAMP wire schema, it is defined three different ways inside the buyer agent and a fourth inside the wire library that agent depends on, and the example files the repository ships against it do not validate.

One framing note before the comparison. AdCP's brief comes from a released specification. Every AAMP term on this page comes from a reference implementation, not a ratified specification. There is no AAMP document that defines a campaign brief normatively, so I am describing code.

## How do the two objects compare field by field?

|                     | AdCP `brief`                                                           | AAMP `CampaignBrief`                                                                                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What it is          | A `string` property                                                    | A Pydantic `BaseModel` class                                                                                                                                                                                                      |
| Where it is defined | `dist/schemas/3.1.10/media-buy/get-products-request.json`              | `buyer-agent/src/ad_buyer/models/campaign_brief.py`                                                                                                                                                                               |
| Artifact type       | Published JSON Schema, released version                                | Python source in a reference implementation                                                                                                                                                                                       |
| On the wire?        | Yes. It is a request field.                                            | No. No `CampaignBrief` schema exists in the AAMP wire contract.                                                                                                                                                                   |
| Required fields     | None inside it. The parent request requires only `buying_mode`.        | Eight, enforced: `advertiser_id`, `campaign_name`, `objective`, `total_budget`, `currency`, `flight_start`, `flight_end`, `channels[]`. The module docstring claims a ninth, `target_audience`, but the field defaults to `None`. |
| Objective           | Free text inside the string. No enum.                                  | `CampaignObjective` enum: `AWARENESS`, `CONSIDERATION`, `CONVERSION`, `REACH`                                                                                                                                                     |
| Budget              | Sibling field `filters.budget_range` `{min, max, currency}`            | `total_budget: float` plus `currency` as ISO 4217, validated by pattern                                                                                                                                                           |
| Channels            | Sibling field `filters.channels`, a 20-value enum                      | `list[ChannelAllocation]`, each `{channel, budget_pct, format_prefs[]}`, `budget_pct` values must sum to 100                                                                                                                      |
| Channel vocabulary  | 20 values including `retail_media`, `dooh`, `sponsored_intelligence`   | 6 values: `CTV`, `DISPLAY`, `AUDIO`, `NATIVE`, `DOOH`, `LINEAR_TV`                                                                                                                                                                |
| Flight              | Sibling fields `filters.start_date` / `end_date`                       | `flight_start` / `flight_end` as `date`, with a validator that `flight_end > flight_start`                                                                                                                                        |
| KPIs                | Sibling field `filters.required_metrics`, a 36-value capability filter | `list[KPI]` of `{metric, target_value}`, metric from a 7-value enum                                                                                                                                                               |
| Brand safety        | No field anywhere                                                      | `BrandSafety` object: `excluded_categories[]` (IAB Content Taxonomy 3.0), `excluded_keywords[]`                                                                                                                                   |
| Frequency cap       | Buy time only, `packages[].targeting_overlay.frequency_cap`            | In the brief: `FrequencyCap {max_impressions, period_hours}`                                                                                                                                                                      |
| Pacing              | Buy time only, `packages[].pacing`                                     | In the brief: `PacingModel` enum                                                                                                                                                                                                  |
| Human approval      | Not modelled. Seller-side HITL only.                                   | `ApprovalConfig` with four gates: `plan_review`, `booking`, `creative`, `pacing_adjustment`                                                                                                                                       |
| Version             | AdCP 3.1.10, published stable                                          | No AAMP-wide version. `buyer-agent` is at `v2.3.0-24-g0c3a154`.                                                                                                                                                                   |

Read down the AAMP column and it looks like the better object. It has the enums AdCP lacks, it models approval gates AdCP leaves outside the protocol, and it puts brand safety in a typed field where AdCP has nothing at all. If you were designing a campaign brief object from scratch you would probably design this one.

Then you go looking for it on the wire.

## Is CampaignBrief part of the AAMP wire contract?

It is not.

`iab-agentic-primitives` is the shared contract library both IAB agent repositories pin as their canonical wire contract. Its own README states the relationship: "The spec is the normative artifact; this package is its reference implementation." Its `spec/jsonschema/` directory holds 22 primitive schemas (Account, Agent, Deal, Line, MediaKit, Order, Package, Product, Proposal, Quote, RateCard and so on) and `spec/jsonschema/protocol/` holds 20 message schemas.

There is no `CampaignBrief.json` in either directory.

The one `CampaignBrief` inside `iab-agentic-primitives` is a frozen dataclass in `src/iab_agentic_primitives/harness/roles.py`, and its own docstring says what it is:

> "Not a wire primitive: it is the buyer agent's internal objective."

So the AAMP campaign brief is an input to a test harness and to a buyer agent's internal pipeline. It never crosses the boundary between two agents.

## What does AAMP send at discovery time instead?

Two things, and neither carries campaign intent.

`ProductListRequest`, the query object for `GET /products`, has exactly two properties: `limit` and `offset`. Its description is explicit about why:

> "Deliberately carries no filter fields: filtering is client-side over the returned Product records."

The OpenAPI document repeats it as a design decision in a header comment: "There is deliberately NO POST /products/search (plan §7 amendment 3): the buyer filters client-side over the ProductListResponse fields."

The closest AAMP analogue to a brief is `QuoteRequest`, which does carry `flight_start`, `flight_end`, `impressions`, `target_cpm`, `audience_plan` and `deal_type`. But its required fields are `idempotency_key`, `product_id` and `deal_type` — you must already know which product you want. Intent enters the conversation after product selection, not before it.

That is the architectural difference underneath the object comparison:

|                                     | AdCP                                           | AAMP                                                  |
| ----------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Who filters inventory               | The seller, from a brief and 30 typed filters  | The buyer, client-side, over a paginated catalog dump |
| Server-side product search          | `get_products`, the protocol's first operation | Deliberately absent                                   |
| Where campaign intent enters        | Discovery                                      | Quote, per product, after selection                   |
| What the buyer's campaign object is | A field in a request                           | A structure inside the buyer agent                    |

AdCP made curation a protocol surface. AAMP made it a client concern. Everything about where a brief lives follows from that one choice.

## Do the shipped campaign_brief.json examples validate?

No. I executed the model rather than eyeballing it, because this is the sort of claim that is embarrassing to get wrong.

`buyer-agent` ships two brief files: `campaign_brief.json` at the repository root and `examples/campaign_brief.json`. Both fail `CampaignBrief` with **12 validation errors each**.

Reproduction, against `buyer-agent` at `0c3a154` and `iab-agentic-primitives` at `2fc7029` with pydantic 2.13.4:

```bash
git clone https://github.com/IABTechLab/buyer-agent
git clone https://github.com/IABTechLab/iab-agentic-primitives

PYTHONPATH=buyer-agent/src:iab-agentic-primitives/src python3 - <<'PY'
import json
from ad_buyer.models.campaign_brief import parse_campaign_brief
for p in ["buyer-agent/campaign_brief.json",
          "buyer-agent/examples/campaign_brief.json"]:
    try:
        parse_campaign_brief(json.load(open(p)))
        print(p, "VALID")
    except Exception as e:
        print(p, type(e).__name__, str(e).splitlines()[0])
PY
```

Output:

```
buyer-agent/campaign_brief.json ValidationError 12 validation errors for CampaignBrief
buyer-agent/examples/campaign_brief.json ValidationError 12 validation errors for CampaignBrief
```

The errors are not near-misses. Seven required fields are absent (`advertiser_id`, `campaign_name`, `objective`, `total_budget`, `currency`, `flight_start`, `flight_end`), all three `channels` entries are bare strings where the model wants `ChannelAllocation` objects, `target_audience` is missing its `primary` key, and `kpis` is a dict where the model wants a list.

The shipped file uses `name`, `budget`, `start_date`, `end_date`. The model wants `campaign_name`, `total_budget`, `flight_start`, `flight_end`. Three names do survive the mismatch — `channels`, `target_audience` and `kpis` — and the file and the model disagree on the type of all three. `channels: ["branding", "ctv", "performance"]` in the file, against a six-value enum in the model that has no `branding` and no `performance`.

## Why does the repository ship a brief its own model rejects?

Because `CampaignBrief` is defined three times inside `buyer-agent`, a fourth time in the wire library it depends on, and the failing files validate cleanly against two of the other three.

| Definition            | File                                              | Shape                                                                                        | Does `campaign_brief.json` validate?         |
| --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| The pipeline model    | `src/ad_buyer/models/campaign_brief.py`           | `campaign_name`, `total_budget`, `flight_start`, `flight_end`, `channels[ChannelAllocation]` | **No.** 12 errors.                           |
| The flow-state model  | `src/ad_buyer/models/flow_state.py`               | `name`, `budget`, `start_date`, `end_date`, `channels[str]`, camelCase aliases               | Yes                                          |
| The HTTP API model    | `src/ad_buyer/interfaces/api/main.py`             | `name`, `objectives[]`, `budget`, `start_date`, `end_date`, `channels[str]`                  | Yes                                          |
| The harness dataclass | `iab-agentic-primitives/src/.../harness/roles.py` | `campaign_name`, `deal_type`, `impressions`, `max_cpm`, `budget` as `Money`                  | Not applicable, different repo, not JSON-fed |

The CLI closes the loop. `ad-buyer init` writes a template file, and the template is hard-coded in `src/ad_buyer/interfaces/cli/main.py` as exactly the shape that fails the pipeline model. It then prints:

> "Edit this file with your campaign details, then run: `ad-buyer book campaign_brief.json`"

And `book` never calls `parse_campaign_brief`. It does `json.load`, then reads `brief.get('name')`, `brief.get('budget')`, `brief.get('start_date')` straight off the dict. So the CLI path is internally consistent and never touches the typed model at all. The two never meet, which is why nobody noticed.

A fifth shape exists for completeness: `data/campaign_briefs.json` holds three demo briefs with their own key set, including `id`, `vertical`, `brand`, `target_cpm`, `max_cpm`, `preferred_package` and a `flight_dates` string like `"2026-09-01 to 2026-12-31"`. All three also fail the pipeline model, with 10, 11 and 10 errors.

## What does this mean if I have to pick one?

Practical guidance, stated as opinion because the evidence only supports so much.

If you are building against a seller today, AdCP's brief is the one that exists as a published, versioned, released contract you can validate a payload against. The object is thinner than you want, and [where its own docs contradict each other](/spec/brief-vs-filters/) is a real problem, but the artifact is real.

AAMP's `CampaignBrief` is the better model of a campaign brief and the worse contract. If you adopt it, you are adopting a Python class from a reference implementation whose canonical wire library still carries "WORK IN PROGRESS — NOT YET RELEASED" at the top of its README, at tag `v0.5.0`. Pin the commit, vendor the model, and expect to own the drift yourself.

There is no cross-walk to inherit, either. Nothing in the AAMP corpus references AdCP anywhere: a grep for "adcp" and "ad context protocol" across all eight IAB Tech Lab agentic repositories returns zero files. Any mapping between these two objects, including the table on this page, is made from outside both projects. The full architectural comparison lives on [Agentic Ad Lab](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/).

One naming caution before you go looking. "AAMP" is expanded more than one way inside its own corpus, and the repositories do not agree on which expansion is correct. That is documented in full at [AAMP Explorer](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/). There is also no single AAMP version number: each repository versions independently, so "AAMP 2.3" names no artifact.

Checked 2026-08-09 against `adcontextprotocol/adcp` at `f1a35ab` (schema release 3.1.10), `IABTechLab/buyer-agent` at `0c3a154` (`v2.3.0-24-g0c3a154`), and `IABTechLab/iab-agentic-primitives` at `2fc7029` (`v0.5.0-1-g2fc7029`).
