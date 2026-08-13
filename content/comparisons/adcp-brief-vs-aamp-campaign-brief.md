---
title: 'AdCP Brief vs AAMP CampaignBrief: Two Objects, One Name'
description: "AdCP's brief is a string on get_products. AAMP's CampaignBrief is a Pydantic class defined five ways across two repos, published on the buyer agent's API, absent from the wire."
answer: "AdCP's brief is a natural-language string on the get_products request. AAMP's CampaignBrief is a Pydantic class with five declarations across two repositories, four of them in IAB Tech Lab's buyer-agent, and it is absent from the AAMP wire contract."
pubDate: 2026-08-09
updatedDate: 2026-08-09
subjects:
  - 'AdCP brief'
  - 'AAMP CampaignBrief'
keywords:
  - 'aamp campaign brief'
  - 'iab buyer agent campaign brief'
  - 'campaign brief json schema'
  - 'adcp brief vs aamp brief'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/creative-brief.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/assets/brief-asset.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/creative/list-transformers-request.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/policy-entry.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/channels.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/available-metric.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/campaign_brief.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/flow_state.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/interfaces/api/main.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/interfaces/cli/main.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/flows/deal_booking_flow.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/examples/buyer_demo.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/campaign_brief.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/examples/campaign_brief.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/data/campaign_briefs.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/architecture/models.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/harness/roles.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/ProductListRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/QuoteRequest.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/ProductAvailsSearch.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/openapi/iab-agentic-api.yaml'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/openapi.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/ucp.py'
  - 'https://github.com/IABTechLab/seller-agent/tree/2bb7ebce45891e3bdddd7a43198cb81d710b0916'
related:
  - '/spec/'
  - '/spec/brief-vs-filters/'
  - '/crosswalk/creative-brief-to-adcp/'
  - '/examples/ctv-guaranteed-launch/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
  - 'https://aampexplorer.com/repos/buyer-agent/'
  - 'https://aampexplorer.com/repos/iab-agentic-primitives/'
  - 'https://aampexplorer.com/what-does-aamp-stand-for/'
  - 'https://adtechglossary.com/agents/buyer-agent/'
reviewState: cto-reviewed
---

## Only one of these two briefs is on a wire

AdCP's `brief` is a string on a released schema. AAMP's `CampaignBrief` is a Python class inside a reference implementation, with five declarations across two repositories, four of them in the buyer agent, field names that disagree, and no presence in the wire contract those same repositories publish. AdCP's brief is the smaller object and the only one with a released schema behind it. Put your own campaign object on the AdCP side of that line and emit whatever AAMP shape you need out of it.

AdCP is the Ad Context Protocol, and it ships as versioned JSON Schema releases; 3.1.13 is the current stable one. AAMP is IAB Tech Lab's Agentic Advertising Management Protocols: eight repositories, versioned independently, no protocol-wide number anywhere, and a [shared wire contract that is unreleased](https://aampexplorer.com/versions/).

One property, on one operation. `get_products` carries `brief` as a `string`, and the schema tells you exactly how much structure to expect: "Natural language description of campaign requirements. Required when buying_mode is 'brief'. Must not be provided when buying_mode is 'wholesale' or 'refine'." A seller agent reads the prose and decides what it means. Both halves of that coupling live in the description text and nothing validates either one, so a brief sent in wholesale mode passes any validator you point at it and arrives at a seller that was told not to expect it. Check the pairing in your own code, because [nothing downstream does](/spec/).

`CampaignBrief` is a Pydantic class with eight enforced required fields in IAB Tech Lab's [buyer agent](https://adtechglossary.com/agents/buyer-agent/), an objective enum, cross-field validators, a typed brand-safety block and four human approval gates. As a model of what a planner hands over it is the better object, and AdCP has nothing close to it.

No brief schema exists in the normative spec. `iab-agentic-primitives` names the artifact that ought to sit above the code, in its own README:

> "The spec is the normative artifact; this package is its reference implementation."

Its `spec/` directory holds 48 JSON Schemas and an OpenAPI document, and none of them is a brief. The buyer agent's only upstream pointer is to a "Campaign Automation Strategic Plan, Sections 6.1 and 7.1" that appears in none of the eight public repositories. So whichever `CampaignBrief` you build against is an implementation detail with no versioning promise attached, and this one has no version to bump.

The integration cost is inside one Python package: five incompatible declarations of one class name.

## Which one to build against: AdCP, with AAMP's model vendored internally

AdCP, and take the non-determinism with it knowing that you are taking it. The same brief string sent to two seller agents comes back as two different product sets, and AdCP promises nothing about that: 3.1.13 released the field, not the interpretation.

What makes the trade worth it is where the determinism sits. The parts you can hold a counterparty to travel in `filters` as typed properties: a 20-value channel enum, a 36-value metric enum, a budget range with a required currency. Diff those against what came back. The prose carries the residue, the part no enum was ever going to hold. AAMP moves that problem instead of solving it, because the matching runs inside your own process where no counterparty can see it, and the only brief-derived field on its wire is an open object. [The worked CTV payload](/examples/ctv-guaranteed-launch/) is a real request you can send today.

Two conditions still make AAMP the right call: a counterparty you need has picked it, or what you want is a planning object and not a wire contract. Since `CampaignBrief` never touches the wire, vendoring it as your internal planning model costs you nothing on the AdCP side. If you do vendor it, pin the commit, write down which of the five definitions you mean, and own the drift, because [the wire contract is unreleased](https://aampexplorer.com/versions/) and nobody is versioning the model for you. AAMP Explorer tracks [the buyer agent](https://aampexplorer.com/repos/buyer-agent/) and [the wire contract](https://aampexplorer.com/repos/iab-agentic-primitives/) commit by commit if you want to watch it move.

Supporting both is two integrations. They share no type and no endpoint, and [neither corpus references the other](https://agenticadlab.com/protocols/adcp-vs-aamp/). [The generator](/generate/) will emit both objects from a paragraph of prose, with every field marked as stated in your text, derived from it, or assumed, and [the front page](/) writes out the seven rules the official Python SDK leaves you to check by hand.

## AAMP deleted server-side product search on purpose

AdCP sends an 18-property request. AAMP sends `limit` and `offset`.

`ProductListRequest` in `iab-agentic-primitives` has exactly two properties, and its description states the decision instead of hiding it:

> "Deliberately carries no filter fields: filtering is client-side over the returned Product records"

The OpenAPI document repeats it in a header comment: "There is deliberately NO POST /products/search (plan §7 amendment 3): the buyer filters client-side over the ProductListResponse fields."

`POST /products/avails` is not a way around this. It requires `productids`, `accountid`, `advertiserbrandid`, `startdate` and `enddate`. You name the products first. `QuoteRequest` requires `idempotency_key`, `product_id` and `deal_type` before it will look at `flight_start`, `impressions` or `target_cpm`. And the single piece of brief-derived structure that does cross the AAMP wire is `audience_plan` on `QuoteRequest`, typed as `anyOf[{object, additionalProperties: true}, null]` with the description "Audience plan slot (open object; the typed model lands with the audience-plan bead)", and it attaches after product selection.

The seller side confirms it. No file in the AAMP seller agent names `CampaignBrief`. The phrase "campaign brief" survives there only as a comment inside `AudiencePlan`, above its targeting fields: "Requirements from campaign brief."

|                                | AdCP                                                 | AAMP                                                |
| ------------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| Who filters inventory          | The seller, from a prose brief and 30 typed filters  | The buyer, client-side, over a paginated catalog    |
| Server-side product search     | `get_products`, the protocol's first operation       | Deliberately absent                                 |
| Discovery request shape        | 18 top-level properties                              | `limit`, `offset`                                   |
| Where campaign intent enters   | Discovery                                            | Quote, per product, after selection                 |
| Brief-derived data on the wire | The `brief` string, `filters`, `required_policies[]` | An untyped `audience_plan` object on `QuoteRequest` |

AdCP runs curation on the seller. AAMP leaves it to the client. `limit` defaults to 50 and caps at 500, so filtering client-side means paging the whole catalog, holding it somewhere, deciding how stale you will let it get, and writing the matching logic that AdCP's seller runs on its own inventory. Nothing in the eight repositories says how large that catalog gets or how often it changes. On AdCP's side the same choice sets [what belongs in the brief string versus the typed filters](/spec/brief-vs-filters/).

On the sell side the question inverts. AdCP puts the brief on your doorstep: `get_products` arrives carrying prose, 30 typed filters and `required_policies[]`, and turning all of that into a product list against your own inventory is your implementation, the harder build and also the surface you compete on. AAMP asks for nothing of the kind. The seller agent's `GET /products` takes `limit` and `offset`, the string "brief" doesn't appear anywhere in its 74-path OpenAPI document, and quoting happens per product after the buyer has already chosen. Serving a paginated catalog is a smaller job than reading intent.

## Where each object lives

|                     | AdCP `brief`                                                                                            | AAMP `CampaignBrief`                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What it is          | A `string` property                                                                                     | A Pydantic `BaseModel` class                                                                                                                                                                                                                           |
| Where it is defined | `dist/schemas/3.1.13/media-buy/get-products-request.json`                                               | `buyer-agent/src/ad_buyer/models/campaign_brief.py`                                                                                                                                                                                                    |
| Artifact type       | Published JSON Schema, released version                                                                 | Python source in a reference implementation                                                                                                                                                                                                            |
| On the wire?        | Yes. It is a request field.                                                                             | No. No `CampaignBrief` schema exists in the AAMP wire contract.                                                                                                                                                                                        |
| Required fields     | None inside it. The parent request requires only `buying_mode`.                                         | Eight, enforced: `advertiser_id`, `campaign_name`, `objective`, `total_budget`, `currency`, `flight_start`, `flight_end`, `channels[]`. A ninth value, `budget_pct`, is required on every `ChannelAllocation` by a validator rather than by the brief. |
| Objective           | Free text inside the string. The 5-value enum lives on a different object, `core/creative-brief.json`.  | `CampaignObjective` enum: `AWARENESS`, `CONSIDERATION`, `CONVERSION`, `REACH`                                                                                                                                                                          |
| Budget              | Sibling field `filters.budget_range` `{min, max, currency}`, `currency` required inside it              | `total_budget: float` plus `currency` as ISO 4217, validated by pattern                                                                                                                                                                                |
| Channels            | Sibling field `filters.channels`, a 20-value enum                                                       | `list[ChannelAllocation]`, each `{channel, budget_pct, format_prefs[]}`, `budget_pct` values must sum to 100                                                                                                                                           |
| Channel vocabulary  | 20 values including `retail_media`, `dooh`, `sponsored_intelligence`                                    | 6 values: `CTV`, `DISPLAY`, `AUDIO`, `NATIVE`, `DOOH`, `LINEAR_TV`                                                                                                                                                                                     |
| Flight              | Sibling fields `filters.start_date` / `end_date`                                                        | `flight_start` / `flight_end` as `date`, with a validator that `flight_end > flight_start`                                                                                                                                                             |
| KPIs                | Sibling field `filters.required_metrics`, a 36-value capability filter                                  | `list[KPI]` of `{metric, target_value}`, metric from a 7-value enum                                                                                                                                                                                    |
| Brand safety        | `required_policies[]` on the request: registry policy IDs, resolving to prose a governance agent judges | `BrandSafety` object: `excluded_categories[]` as IAB Content Taxonomy 3.0 IDs, `excluded_keywords[]` as strings                                                                                                                                        |
| Frequency cap       | Buy time only, `packages[].targeting_overlay.frequency_cap`                                             | In the brief: `FrequencyCap {max_impressions, period_hours}`                                                                                                                                                                                           |
| Pacing              | Buy time only, `packages[].pacing`                                                                      | In the brief: `PacingModel` enum                                                                                                                                                                                                                       |
| Human approval      | Not modelled. Seller-side HITL only.                                                                    | `ApprovalConfig` with four gates: `plan_review`, `booking`, `creative`, `pacing_adjustment`                                                                                                                                                            |
| Version             | AdCP 3.1.13, published stable                                                                           | No AAMP-wide version. `buyer-agent` is at `v2.3.0-24-g0c3a154`.                                                                                                                                                                                        |

The brand-safety row holds two different mechanisms. AAMP's `BrandSafety` is category IDs and keyword strings: machine-checkable, and only as complete as the list. AdCP hands over registry policy IDs, and a governance agent reads the policy text and judges, which is the only one of the two routes that can carry a rule like "nothing adjacent to conflict reporting."

Buyer-side approval is the row with an operational cost behind it. AdCP doesn't model it, so plan sign-off, booking sign-off and creative sign-off are workflow you build, run and audit outside the protocol. AAMP names four gates in `ApprovalConfig` and defaults two of them on, `plan_review` and `booking`, on the model that only the demo script and the test suite ever construct. The approval pipeline imports the `ApprovalConfig` type and then reads its configuration off a stored campaign record, not off a typed brief. The one pipeline module that does annotate `brief: CampaignBrief` is the audience planner, and the only function reaching it says in its own docstring that it is the path "used by tests and demos that don't go through the canonical flow (DealBookingFlow)". Neither protocol exposes your sign-off chain to the counterparty. Budget for it as headcount.

Both protocols name frequency cap and pacing. AAMP takes them in the brief; AdCP only at buy time, on packages. If your planning system decides pacing, you carry that decision yourself from brief to buy, because AdCP's discovery call has nowhere to put it.

## Five objects, one name

| Definition        | Where                                         | Kind                                                    | What anchors it                                                                              | Does the shipped `campaign_brief.json` validate? |
| ----------------- | --------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Pipeline model    | `models/campaign_brief.py`                    | Pydantic `BaseModel`, 8 required                        | `campaign_name`, `total_budget`, `flight_start`, `flight_end`, `channels[ChannelAllocation]` | **No.**                                          |
| Flow-state model  | `models/flow_state.py`                        | Pydantic `BaseModel`, camelCase aliases                 | `name`, `budget`, `start_date`, `end_date`, `channels[str]`                                  | Yes                                              |
| HTTP API model    | `interfaces/api/main.py`                      | Pydantic `BaseModel`, the published one                 | `name`, `objectives[]`, `budget`, `start_date`, `end_date`, `target_audience{}`              | Yes                                              |
| Demo dataclass    | `examples/buyer_demo.py`                      | `dataclass`, docstring "Parsed campaign brief from PDF" | its own key set                                                                              | Not JSON-fed                                     |
| Harness dataclass | `iab-agentic-primitives/.../harness/roles.py` | frozen `dataclass`, 15 fields                           | `campaign_name`, `deal_type`, `impressions`, `max_cpm`, `budget` as `Money`                  | Different repo, not JSON-fed                     |

The five share no field name. The sharpest collision is the pair sitting in one package: `models/campaign_brief.py` and `models/flow_state.py` both declare a class called `CampaignBrief`, and they agree on almost nothing — `campaign_name` against `name`, `total_budget` against `budget`, `flight_start` / `flight_end` against `start_date` / `end_date`, `objective` as an enum against `objectives` as a list of bare strings, `channels` as typed allocations against `channels` as a list of strings. No adapter converts between them, and `models/__init__.py` re-exports only the first, so which class you get depends on which import path you typed.

Only the harness dataclass documents its own scope, in its docstring:

> "Not a wire primitive: it is the buyer agent's internal objective."

Both `campaign_brief.json` files the repository ships fail the model that defines them, and they fail it identically: 12 validation errors each. Seven required fields absent, all three `channels` entries as bare strings where the model wants `ChannelAllocation` objects, `target_audience` missing its `primary` key, `kpis` a dict where the model wants a list. The shipped `channels: ["branding", "ctv", "performance"]` goes up against a six-value enum containing neither `branding` nor `performance`. A third file, `data/campaign_briefs.json`, carries three more demo briefs on a fourth key set, with `flight_dates` as the string `"2026-09-01 to 2026-12-31"`, and those validate against none of the buyer agent's three JSON-fed models.

None of it stops anything, because the model that validates and the model that runs are different objects. `ad-buyer init` writes that failing template, hard-coded in the CLI, then prints:

> "Edit this file with your campaign details, then run: `ad-buyer book campaign_brief.json`"

And `book` never calls the parser. It loads the JSON, reads `name`, `budget` and `start_date` straight off the dict, and hands the raw dict to `DealBookingFlow`, which keeps treating it as a dict all the way down. The documentation describes a third shape again: the CampaignBrief field table under `docs/` is the API model, and the string `campaign_name` never appears as a brief field anywhere in the documentation. The module docstring of `campaign_brief.py` adds a discrepancy of its own, listing a ninth required field, `target_audience`, which the class defines with a default of `None`.

No code path in the repository connects the two. The strictest of the five, the one carrying the enums and the approval gates, is documented nowhere and reached from a single test-and-demo path. The documented shape and the annotated shape are different classes, and neither route leads to the strict one.

## There is exactly one published CampaignBrief schema and it is the loosest one

`buyer-agent/docs/api/openapi.json` carries `components.schemas.CampaignBrief`, `info.version` 1.0.0, contact "IAB Tech Lab", description "Campaign brief for booking." The committed document is served live from IAB Tech Lab's GitHub Pages site. It documents the buyer agent's own inbound HTTP API, not anything that crosses the buyer-to-seller wire, and it is not the Pydantic class in `campaign_brief.py`. If you searched for a campaign brief JSON Schema and found nothing, this is what you were looking for.

Six required fields: `name`, `objectives`, `budget`, `start_date`, `end_date`, `target_audience`. Two optional: `kpis`, `channels`. It carries no objective enum at all — `objectives` is an array of bare strings with `minItems: 1` — no channel allocation, no sum-to-100 rule, no approval gates, no brand safety. `target_audience` is `{"type": "object", "additionalProperties": true}`, an open bag, and it is required, where the pipeline model makes it optional and typed.

So the only fetchable `CampaignBrief` schema is the loosest of the five, and it describes what you POST to a buyer agent you are running yourself. Nothing travelling the other way carries a brief at all.

## AdCP has a structured brief too, and it's for creative

`dist/schemas/3.1.13/core/creative-brief.json` ships inside the release and you can validate a payload against it today. It cannot reach discovery. Title "Creative Brief", eight properties, only `name` required, `objective` a five-value enum, `tone` and `audience` and `territory` as prose, `messaging` holding `headline`, `tagline`, `cta` and an ordered `key_messages[]`, plus a `compliance` block of `required_disclosures[]` and `prohibited_claims[]` that AAMP's brand-safety object has no equivalent for.

Its only route to the wire is `core/assets/brief-asset.json`, `{"asset_type": {"const": "brief"}}` plus an `allOf` on the creative brief, wrapped in a creative manifest. The manifest is referenced by `build_creative`, `preview_creative`, `get_creative_features` and `validate_input`, and by neither `get-products-request` nor `create-media-buy-request`. Discovery still gets a string. The release carries one more `brief` string, on `list_transformers`, ranking creative transformers by intent: prose again, creative side again.

AdCP and AAMP share three objective values and diverge on three.

| AdCP `core/creative-brief.json` | AAMP `CampaignObjective` |
| ------------------------------- | ------------------------ |
| `awareness`                     | `AWARENESS`              |
| `consideration`                 | `CONSIDERATION`          |
| `conversion`                    | `CONVERSION`             |
| `retention`                     | no counterpart           |
| `engagement`                    | no counterpart           |
| no counterpart                  | `REACH`                  |

AAMP kept `REACH`; AdCP kept `retention` and `engagement`. The [creative-brief crosswalk](/crosswalk/creative-brief-to-adcp/) maps the agency-brief rows onto AdCP media-buy fields, and that mapping is where the loss happens.
