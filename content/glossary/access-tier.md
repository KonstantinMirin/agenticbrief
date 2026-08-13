---
title: 'Access Tier — public, seat, agency, advertiser'
description: "AAMP's access tier is a four-value enum deciding what price, negotiation and availability detail a buyer agent sees. What sets it, and how the seller caps it."
answer: "Access Tier is AAMP's four-value enum (public, seat, agency, advertiser) that gates what price, negotiation and availability detail a buyer agent gets. It travels as buyer_tier, is capped server-side by the calling agent's trust status, and is never self-asserted."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Access Tier'
alternateNames: ['buyer tier', 'buyer_tier', 'pricing tier', 'AccessTier']
category: commerce
cluster: gl-negotiation
keywords:
  - 'access tier advertising agent'
  - 'aamp access tier'
  - 'buyer tier pricing advertising'
  - 'buyer_tier aamp schema'
citations:
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Quote.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/Session.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/buyer_identity.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/models/pricing_tiers.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/engines/negotiation_engine.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/deps.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/interfaces/api/routers/media_kit.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/flows/discovery_inquiry_flow.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/authentication.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/models/buyer_identity.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/media-kit.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/guides/multi-seller.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/account.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/account-authorization.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/product.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/account-scope.json'
related:
  - '/negotiation/trust-status/'
  - '/negotiation/negotiation-round/'
  - '/negotiation/quote/'
  - '/negotiation/deal/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/negotiation/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['Trust Status', 'Quote', 'Deal', 'Negotiation Round']
reviewState: cto-reviewed
---

Access Tier is AAMP's four-value string enum for what a buyer agent is allowed to see and pay. On the wire it is `buyer_tier`, carried on the [Quote](/negotiation/quote/), [Deal](/negotiation/deal/) and Negotiation objects and glossed "Access tier for tiered pricing, derived from revealed buyer identity".

| Value (schema) | Identity revealed       | What the schema says                            |
| -------------- | ----------------------- | ----------------------------------------------- |
| `public`       | None                    | "no identity — price ranges only"               |
| `seat`         | DSP seat, authenticated | "authenticated DSP (demand-side platform) seat" |
| `agency`       | Agency                  | "agency identity revealed"                      |
| `advertiser`   | Advertiser              | "advertiser identity revealed (best rates)"     |

All three objects declare it identically: `{"$ref": "#/$defs/AccessTier", "default": "public"}`. A buyer that sends no identity is priced at the `public` tier rather than rejected.

The schema derives the tier from revealed buyer identity. In the reference implementations the seller's API key fixes it instead, and an identity sent in the payload can only confirm what the key already allows.

The repository that defines it is [unreleased](https://aampexplorer.com/versions/) and warns that its schemas will change without notice. There is no canonical `AccessTier.json`: the same block is copied into five schema files, and the two reference agents no longer derive the tier the same way.

## Entitlements at each tier

Pricing visibility, negotiation and availability detail all move together. The discounts below are the reference seller agent's `_default_tiers()` fallback, which an operator overrides, rather than a published rate.

| Tier         | Pricing visibility         | Negotiation | Default discount | Avails granularity |
| ------------ | -------------------------- | ----------- | ---------------- | ------------------ |
| `public`     | Price ranges only          | No          | 0%               | `high_level`       |
| `seat`       | Exact prices, no discounts | Limited     | 5%               | `moderate`         |
| `agency`     | Tier discounts applied     | Standard    | 10%              | `detailed`         |
| `advertiser` | Full discounts plus volume | Premium     | 15%              | `detailed`         |

The reference seller agent also maps the effective tier to a named negotiation strategy, with three hard limits and one behavioural parameter. These are that agent's defaults, not protocol.

| Tier         | Strategy        | Max rounds | Per-round cap | Cumulative cap | Buyer gap share |
| ------------ | --------------- | ---------- | ------------- | -------------- | --------------- |
| `public`     | `aggressive`    | 3          | 3%            | 8%             | 30%             |
| `seat`       | `standard`      | 4          | 4%            | 12%            | 40%             |
| `agency`     | `collaborative` | 5          | 5%            | 15%            | 50%             |
| `advertiser` | `premium`       | 6          | 6%            | 20%            | 65%             |

Buyer gap share, `gap_split_buyer_share` on the wire, rises with the tier: at `advertiser` the seller expects the buyer to close 65 percent of the remaining gap, alongside the widest concession budget. `docs/integration/negotiation.md` glosses the field as "How much of the price gap the seller expects the buyer to close (higher = more favorable to seller)". The worked example is on [AAMP Explorer](https://aampexplorer.com/negotiation/); the round record is a [Negotiation Round](/negotiation/negotiation-round/).

The tier also controls how much availability detail a caller sees, which the tier documentation does not cover. A `public` caller is told a product is `Available`, a `seat` caller that availability is `High`, and `agency` and `advertiser` callers get numbers: `estimated_monthly_impressions` of `10M-50M`, a `fill_rate` of `85-95%`.

The default rate card sets `negotiation_enabled=False` for `public` and `seat`, and the seller's negotiation engine never reads the flag.

## What sets the tier

`BuyerIdentity` has eleven properties and no `required` array, so an empty `BuyerIdentity {}` validates. Only `seat_id`, `agency_id` and `advertiser_id` change the tier; neither reference implementation branches on `dsp_platform`, `advertiser_name` or the campaign fields.

A brand buying direct, with no agency and no seat, computes `advertiser` on its own agent while the seller walks the same identity down to `ANONYMOUS` and quotes a range. Neither agent raises an error, and the buyer is quoted at the lower tier. The two agents disagree about how many IDs the top tier needs: the seller requires both an advertiser ID and an agency ID, and its `identity_level` reaches `AGENCY_AND_ADVERTISER` only when both are present, while the buyer treats an advertiser ID alone as enough. The buyer's model carries the seller's rule as a comment, `# Agency + Advertiser - 15% discount`, and does not implement it.

The revelation mechanism the buyer's documentation describes is not wired up. `to_header_dict()` builds `X-DSP-Seat-ID`, `X-Agency-ID` and `X-Advertiser-ID`, no code in the repository calls it, and the seller reads only `Authorization` and `X-Api-Key`. `docs/api/authentication.md` states the arithmetic: "The effective tier is the **minimum** of the API key tier and the agent trust tier. A `preferred` agent with a `seat`-level API key gets `seat` access." A `BuyerIdentity` sent afterwards cannot raise the tier above what the key allows. The ceiling side of that minimum is [Trust Status](/negotiation/trust-status/).

The schema states that the tier is "capped server-side by the registry-verified trust status of the calling agent — it is never self-asserted", over the order `public < seat < agency < advertiser`. Quotes, deals and negotiation all go through `_verified_buyer_context`, which floors the effective tier to `public` when the claim is unverifiable.

One discovery endpoint in the reference seller agent does not apply that cap. `POST /media-kit/search` bypasses `_verified_buyer_context`, builds a buyer context whenever `api_key_record is not None or request.buyer_tier != "public"`, and leaves `max_access_tier` unset, so an unauthenticated caller claiming `advertiser` is answered at that tier: `exact_price` at the top-tier discount, `floor_price`, placements, audience segment IDs and `negotiation_enabled: true`. It is a defect in that repository rather than a reading of the schema.

## Access tier in AdCP

AdCP 3.1.13 defines no access tier, and no `tier`, `access_tier`, `buyer_tier` or `account_tier` property in `dist/schemas/3.1.13/`. The relationship is modelled under another name: `core/account.json` describes "the relationship between a buyer and seller", an account that "determines rate cards, payment terms, and billing entity", and its `rate_card` is `{"type": "string"}`, so the rate card is named and its contents are left to the parties. Capability lives in `core/account-authorization.json`, an allowlist of task names in `allowed_tasks[]` plus `field_scopes` and `read_only`.

AdCP's `account_scope` is also a four-value enum on the buyer relationship — `operator`, `brand`, `operator_brand`, `agent` — but its values are categories, not levels, so they do not compose into a ceiling. The rest of that shape difference is in the [protocol comparison](https://agenticadlab.com/protocols/adcp-vs-aamp/).
