---
title: The AdCP agent registry, measured
description: 'Full results for all 23 AdCP registry listings: three of the six sales-agent listings that expose get_products returned a product catalogue to an anonymous caller.'
answer: The AdCP agent registry is AgenticAdvertising.org's catalogue of member-enrolled agents. On 12 August 2026 it listed 23 public agents. Thirteen accepted an anonymous MCP handshake, and three sales agents returned a product catalogue.
pubDate: 2026-08-12
keywords:
  - AdCP agent registry
  - AdCP sales agent endpoints
  - anonymous MCP discovery
  - AAO Verified badge
  - registry compliance verdicts
citations:
  - https://agenticadvertising.org/api/registry/agents
  - https://agenticadvertising.org/api/registry/stats
  - https://github.com/adcontextprotocol/adcp/blob/main/docs/registry/registering-an-agent.mdx
  - https://github.com/adcontextprotocol/adcp/blob/main/static/openapi/registry.yaml
  - https://adcontextprotocol.org/schemas/latest.json
  - https://adcontextprotocol.org/schemas/3.1.13/core/product.json
  - https://adcontextprotocol.org/schemas/3.1.13/media-buy/get-products-request.json
  - https://github.com/adcontextprotocol/adcp/blob/main/docs/reference/migration/catalogs.mdx
  - https://github.com/adcontextprotocol/adcp/issues/6268
  - https://github.com/adcontextprotocol/adcp/issues/6374
  - https://github.com/adcontextprotocol/adcp/issues/6375
  - https://github.com/adcontextprotocol/adcp/issues/6383
  - https://reddit.com/r/programmatic/comments/1p9wm53/adcp_artf/
  - https://reddit.com/r/programmatic/comments/1rqtk2s/free_adcp_sales_agent_testing/
related:
  - /operations/get-products/
  - /operations/get-signals/
  - /operations/get-adcp-capabilities/
  - /discovery/
faq:
  - question: How many companies actually support AdCP?
    answer: More than the registry shows. The public catalogue held 23 agents on 12 August 2026, but it lists only agents an AgenticAdvertising.org member has enrolled at public visibility. The same API reported 68 agents discovered by crawling adagents.json, a set it does not publish and which may overlap the 23.
  - question: Which AdCP agents can a publisher or buyer test against without credentials?
    answer: Three sales agents returned products to an anonymous get_products (Cora AI, Equativ, No Fluff Advisory), two signals agents answered get_signals (Dstillery, Affinity Answers), and two creative agents answered list_creative_formats (Celtra, Advertible).
reviewState: cto-reviewed
---

Three of the 23 listings in the public AdCP registry returned a product catalogue to a caller with no credentials on 12 August 2026. Thirteen completed an anonymous MCP `initialize`, seven returned a discovery payload of some kind, and six listings typed `sales` exposed `get_products` to an unauthenticated caller.

The sweep was read-only. Each endpoint received `initialize`, then `notifications/initialized`, then `tools/list`, then one call to whichever discovery tool it advertised: `get_products` for sales agents, `get_signals` for signals agents, `list_creative_formats` for creative agents. No write tool was called. Every sales agent received the same brief:

```
Q4 holiday campaign for a CPG snack brand. Channels: CTV plus digital display and
online video. Budget: $500,000 net. Market: United States. Target demo: adults 25-54.
```

Each agent that answered was then re-run against an incompatible brief (German-language B2B podcast sponsorship, EUR 20,000, audio only) and against a brief one character long. Every count and status below is the 12 August 2026 state.

| Stage                                     | Count | Listings                                                                                                                                                   |
| ----------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Listed in the public catalogue            | 23    | every row in the sweep table                                                                                                                               |
| Completed an anonymous `initialize`       | 13    | Advertible, both Adzymic listings, Affinity Answers, Celtra, Cora AI, Dstillery, Equativ, goTom Sandbox, both No Fluff Advisory listings, Swivel, vastlint |
| Returned a discovery payload anonymously  | 7     | Advertible, Affinity Answers, Celtra, Cora AI, Dstillery, Equativ, No Fluff Advisory (sales)                                                               |
| Typed `sales` and exposing `get_products` | 6     | both Adzymic listings, Cora AI, Equativ, goTom Sandbox, No Fluff Advisory (sales)                                                                          |
| Returned a product array                  | 3     | Cora AI, Equativ, No Fluff Advisory (sales)                                                                                                                |

Swivel exposes `get_products` as well and is typed `buying`, which puts it outside the six.

Neither Scope3 nor Accuweather appears in the public catalogue. An enrolled agent defaults to `members_only` and public visibility requires a paid AgenticAdvertising.org (AAO) tier, so the catalogue does not separate an agent that was never listed from one that is listed and hidden.

## `get_products` responses from three sales agents

Cora AI, Equativ and No Fluff Advisory returned product arrays without credentials, and the brief barely changes the answer.

| Agent             | CPG CTV brief | German B2B podcast brief   | Brief of `x`               |
| ----------------- | ------------- | -------------------------- | -------------------------- |
| Cora AI           | 4 products    | same 4                     | same 4                     |
| Equativ           | `deal_yyz`    | `deal_yyz`                 | `deal_yyz`                 |
| No Fluff Advisory | 5 products    | 4 identical, 1 regenerated | 4 identical, 1 regenerated |

Cora AI's four products are Korean FAST CTV and Korean display inventory with `countries: ["KR","US"]`. Against the German audio-only brief the response reported `filter_diagnostics: {"total_candidates": 4, "matched_candidates": 4, "no_match_targeting": false, "semantics": "approximate"}`, and each product's `brief_relevance` read "Matched against buyer brief:" followed by the brief itself. `core/product.json` defines that field as "Explanation of why this product matches the brief"; the value returned is the request text.

Equativ's single product is named "High CTR APAC Video Always-On Equativ DV360 - CTR Segment" and describes itself as "Synthetic data for demo purposes only." It also omits `reporting_capabilities`, which the 3.1.13 product schema lists as required, so a buyer validating strictly against `core/product.json` will reject the only product on offer. No Fluff Advisory's four static products include one called "Interop test — display ($1 CPM)"; the fifth is generated per brief and does track the brief's topic.

Cora AI's catalogue is four products, Equativ's is one, No Fluff Advisory's is five. At that size "return everything" and "match everything" are indistinguishable on a single query, so an anonymous discovery call exercises the transport and the response shape. Two of the three catalogues are labelled demo or interop inventory by their own operators.

## Request shapes sent to `get_products`

`get-products-request.json` in 3.1.13 lists `buying_mode` as its only required property. Every `get_products` call in the sweep went out first as `{brief, promoted_offering}` and, on failure, as `{brief}` alone, so neither shape sent the one required field and neither is valid against 3.1.13. `promoted_offering` is not a field on `get_products` in any 3.x schema: AdCP's [catalogs migration guide](https://github.com/adcontextprotocol/adcp/blob/main/docs/reference/migration/catalogs.mdx) records that "AdCP 3.0 removes the `promoted_offerings` creative asset type and the `promoted_offering` string field".

The schema-valid call, as sent to Equativ at `https://adcp.equativ.com/v1/discover`:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_products",
    "arguments": { "buying_mode": "brief", "brief": "Q4 holiday campaign for a CPG snack brand." }
  }
}
```

Cora AI and No Fluff Advisory accept the extra field silently, since `get-products-request.json` sets `additionalProperties: true`. Adzymic rejects it and leaks the framework error to the wire: `1 validation error for call[get_products] promoted_offering Unexpected keyword argument`, with a link to the Pydantic docs. Re-sent as `{"buying_mode": "brief", "brief": ...}`, both Adzymic listings answer `("AUTHENTICATION_ERROR", "Authentication required by tenant policy", "terminal")`. The two Adzymic rows in the sweep table therefore record an argument-shape failure ahead of a credential check.

Re-checked with the schema-valid shape, the three answering agents return exactly what they returned before: Cora AI the same four products, Equativ the same `deal_yyz`, No Fluff Advisory the same five. Swivel returns `{"products": []}` to the valid shape too.

## Endpoints that answer without credentials

Seven endpoints returned a non-error payload to an anonymous discovery call.

| Agent                     | Endpoint                                       | Tool that answered                                    |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Cora AI                   | `https://sales-agent.coraai.org/mcp`           | `get_products`, returning 4 CTV and display products  |
| No Fluff Advisory (sales) | `https://sell.nofluffadvisory.com/mcp`         | `get_products`, returning 5 products                  |
| Equativ                   | `https://adcp.equativ.com/v1/discover`         | `get_products`, returning 1 product                   |
| Dstillery                 | `https://adcp-signals-agent.dstillery.com/mcp` | `get_signals`                                         |
| Affinity Answers          | `https://mcp.affinityanswers.com/mcp`          | `get_signals`                                         |
| Celtra                    | `https://adcp-mcp.celtra.com/mcp`              | `list_creative_formats`, alongside `preview_creative` |
| Advertible Inc.           | `https://adcp.4dvertible.com/mcp`              | `list_creative_formats`, alongside `preview_creative` |

A publisher looking for a counterparty gets one listing: Swivel, the only record typed `buying`. It completes an anonymous handshake, exposes `get_products`, `create_media_buy` and nine other tools, and returns `{"products": []}` to every brief tested. Everything else in the catalogue that answers anonymously is sell-side.

goTom Sandbox is not in the table above. Its `tools/list` at `https://dev-demo-mcp.gotom.io/mcp` is open and annotated: `get_products` carries `readOnlyHint: true`, `create_media_buy` carries `false`. The tool call itself needs a key or an RFC 9421 signature.

Three of the 13 agents that answered `tools/list` annotate their tools with `readOnlyHint`: goTom, No Fluff Advisory's sales agent and vastlint. Four of the other ten expose `create_media_buy` without the annotation (both Adzymic listings, Cora AI and Swivel), so on those a client cannot tell a read from a write by inspection.

## Signal responses by `signal_spec`

Dstillery and Affinity Answers both answered `get_signals` without credentials, and both responses track the `signal_spec` sent.

| `signal_spec`                                                           | Dstillery                                       | Affinity Answers                                      |
| ----------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| US adults 25-54 who buy salty snacks                                    | 10 signals, led by "Mid-Range Grocery Shoppers" | 20 signals, led by "Intent > Food & Beverage > Chips" |
| German IT decision makers evaluating enterprise data warehouse software | 10 signals, led by "IT Decision Makers"         | 1 signal, "Intent > Electronics > IBM"                |

## What a registry listing attests

The catalogue lists agents an AAO member has enrolled and set to public visibility. `GET https://agenticadvertising.org/api/registry/agents` returns it: 23 records, all of them MCP. Eighteen are typed `sales`. The remaining five are three `signals`, one `creative` and one `buying`. Each record carries `name`, `url`, `type`, `protocol`, `description`, `mcp_endpoint`, a `contact` block and the `member` that owns the listing. It carries no protocol version and no last-seen timestamp.

Enrollment has one path, stated in [AdCP's registry documentation](https://github.com/adcontextprotocol/adcp/blob/main/docs/registry/registering-an-agent.mdx): "an AAO member adds the agent to their member profile." The doc is explicit about what that establishes: "the member has signed AAO terms; the URL, name, and contact are explicitly declared; the type is probe-verified." It is equally explicit about who is excluded: "You cannot self-register today. Your operator must be an AAO member to enroll your agent in the registry catalog."

Anonymous callers see only listings set to `public`. Agents at `members_only` or `private` visibility exist in the catalogue and are invisible from outside. `GET /api/registry/stats` on the same morning reported 23 registered agents alongside 68 discovered agents, 399 discovered publishers, 22,328 discovered properties and 7,612 authorizations. The registered count comes from enrollment; the discovered counts come from crawling `adagents.json` files.

## The sweep, listing by listing

`AAO compliance` is the registry's roll-up verdict for the agent: `passing`, `degraded`, `failing`, or `opted out` of monitoring. It is assembled from storyboards, scripted multi-step scenarios the crawler runs against the agent (`capability_discovery` and `get_media_buys_pagination_integrity` are two of up to 39), grouped into six tracks: core, products, media_buy, signals, error_handling and security_transport. Each track resolves to pass, partial, silent or skip, and the agent verdict is the roll-up of the tracks. `AAO Verified badge` names a role and the protocol version it was issued against, such as `media-buy 3.0`. Both columns carry the registry's own values.

| Agent                       | Type     | Anonymous `initialize` | Tools listed | Anonymous discovery call | AAO compliance | AAO Verified badge            |
| --------------------------- | -------- | ---------------------- | ------------ | ------------------------ | -------------- | ----------------------------- |
| Advertible Inc.             | sales *  | 200                    | 2            | formats returned         | degraded       |                               |
| Adzymic (sph)               | sales    | 200                    | 14           | AUTHENTICATION_ERROR     | opted out      |                               |
| Adzymic (mediacorp)         | sales    | 200                    | 14           | AUTHENTICATION_ERROR     | failing        |                               |
| Affinity Answers            | signals  | 200                    | 2            | 20 signals               | degraded       |                               |
| vastlint                    | sales *  | 200                    | 14           | no product tool          | passing        | governance 3.1                |
| BidMachine                  | sales    | 503                    |              |                          | degraded       | media-buy 3.0                 |
| AdCP Test Agent             | sales    | 401                    |              |                          | degraded       |                               |
| Celtra                      | creative | 200                    | 7            | formats returned         | failing        |                               |
| Content Ignite              | sales    | 500                    |              |                          | failing        |                               |
| Cora AI                     | sales    | 200                    | 24           | 4 products               | degraded       | governance 3.0, media-buy 3.0 |
| Dstillery                   | sales *  | 200                    | 1            | 10 signals               | failing        |                               |
| Equativ                     | sales    | 200                    | 1            | 1 product                | failing        |                               |
| goTom Sandbox               | sales    | 200                    | 12           | 401 on the tool call     | degraded       |                               |
| InMobi NonProd              | sales    | 401                    |              |                          | passing        |                               |
| InMobi Sales Agent          | sales    | 401                    |              |                          | passing        |                               |
| LoopMe                      | sales    | 401                    |              |                          | failing        | media-buy 3.1                 |
| Purrsonality Seller         | sales    | 401                    |              |                          | degraded       | media-buy 3.0                 |
| Purrsonality Signals        | signals  | 401                    |              |                          | passing        | signals 3.1, signals 3.0      |
| No Fluff Advisory (signals) | signals  | 200                    | 8            | 401 on the tool call     | passing        | signals 3.1, signals 3.0      |
| No Fluff Advisory (sales)   | sales    | 200                    | 11           | 5 products               | degraded       |                               |
| pubX AI                     | sales    | 401                    |              |                          | degraded       |                               |
| Rediads                     | sales    | 522                    |              |                          | failing        |                               |
| Swivel                      | buying   | 200                    | 11           | empty product array      | failing        |                               |

\* Typed `sales` in the registry. Advertible's tools are creative checks, vastlint's are content-standards checks, and Dstillery's single tool is a signals lookup.

Ten listings returned nothing to an anonymous caller. Three of those failures were at the transport layer: BidMachine `503`, Content Ignite `500`, Rediads `522` from Cloudflare.

## Authentication refusals

Seven of the ten failures are credential checks, and each came back with an error body a client can read. LoopMe returns `Jwt is missing`. goTom asks for "a valid API key or an RFC 9421 request signature". The official AdCP Test Agent asks for "an AAO API key (from your dashboard) or a static test token".

Calling `/api/registry/agents?health=true&capabilities=true` returns `health.online: true` with a tool inventory for several agents that answer `401` anonymously: Purrsonality Seller at 15 tools, pubX AI at 14, InMobi NonProd at 9. The registry's crawler holds the credentials the operator supplied at registration, so `health.online` records that the crawler authenticated, and it grades the operator's configuration.

BidMachine's crawled snapshot is timestamped 04:48 UTC the same morning and records 37 tools, while anonymous `initialize` returned `503`. Equativ's record runs the other way: `health.online: false`, and a compliance record graded `failing` with the headline "Agent unreachable - MCP error -32001: Request timed out", for an endpoint that answered a stranger's `get_products` on the first attempt and returned a product.

## Compliance verdicts and AAO Verified badges

`GET /api/registry/agents/{encodedUrl}/compliance` returns the storyboard-based verdict per agent, and `/verification` returns the AAO Verified badges. `degraded` means at least one track is partial or silent while others pass, which is why Cora AI's headline reads "3 passing, 1 partial, 2 silent" and BidMachine's reads "2 passing, 2 partial, 2 silent", both counted in tracks. Re-checks run on a per-agent interval: 6 or 12 hours for 21 of the 23, and 168 hours for the two InMobi listings.

Across the 23 listings: 5 passing, 9 degraded, 8 failing, 1 opted out of monitoring entirely. Seven agents hold at least one AAO Verified badge.

The badge is pinned to a role and a protocol version. AdCP 3.1.13 is the current stable release. BidMachine's badge is `media-buy` at 3.0, issued 1 June. Cora AI holds `governance` and `media-buy`, both at 3.0, both issued 25 June. Purrsonality Seller holds `media-buy` at 3.0. A badge attests conformance to the version it names on the date it was issued, and three of the seven badged agents are badged against 3.0 rather than the current 3.1 line, under a versioning policy that permits field-level schema change between releases.

LoopMe is verified `media-buy` at 3.1, issued 24 June; its compliance record reads `status: failing`, headline "Agent unreachable - Failed to discover MCP endpoint", last successful check 10 August. BidMachine, verified at 3.0, is graded `degraded` with 21 of 37 storyboards passing, and its endpoint served `503` to every anonymous request in the sweep.

Of the 23 listings, 14 are graded against the 3.0.18 compliance cache, four against 3.1.13 and four against 3.1.11; the agent that opted out carries no target at all. Sellers have filed against both halves of this. AdCP issue [#6375](https://github.com/adcontextprotocol/adcp/issues/6375) reports "no way to change compliance cache/target after agent registration", and [#6383](https://github.com/adcontextprotocol/adcp/issues/6383) reports sellers migrating from 3.0 to 3.1 "stuck with failing health check". Issue [#6374](https://github.com/adcontextprotocol/adcp/issues/6374) asks the compliance API to "expose per-role eligibility blockers so sellers can see why a badge is withheld", because `verified` is a bare boolean today. The badge names a role, a version and an issue date, and the record carries no field for current state.

`status_changed_at` records five of the 23 listings changing compliance verdict in the seven days to 12 August: Adzymic's mediacorp listing and Swivel on the 10th, BidMachine, LoopMe and No Fluff Advisory's sales agent on the 11th.

## Stale and contradictory fields in the registry record

The enriched listing mixes snapshots taken minutes apart with snapshots taken months apart, and marks the difference only in `verified_at`. Most `capabilities` blocks were stamped 04:48 that morning. Celtra's was stamped 16 May 2026, and records five tools against the seven its endpoint listed to an anonymous caller. Both arrived in the same response, formatted identically.

Adzymic's mediacorp listing reports `health.tools_count: 14` and `capabilities.tools_count: 0` in the same response. That failure mode has a ticket: AdCP issue [#6268](https://github.com/adcontextprotocol/adcp/issues/6268), "Registry card renders stale tool count (5) despite crawler recording 10".

Types are resolved server-side from the crawler's capability snapshot. Three listings typed `sales` expose no product or media-buy tool:

- Advertible Inc. is a creative agent by its tool list: `list_creative_formats` and `preview_creative`, with `serverInfo` reporting `mcp-p1`.
- Dstillery exposes one tool, `get_signals`, and identifies itself as `AdCP Signals Discovery Agent - Public Catalog`.
- vastlint's 14 tools are VAST and content-standards checks. It holds a `governance` badge and is still typed `sales`.

Content Ignite's listed URL, `https://sales-agent.contentignite.com`, has no MCP path on it. The registry's own monitor records "Agent unreachable - Failed to discover MCP endpoint" and lists the four paths it tried, and the listing remains in the catalogue. The catalogue also carries an agent named "InMobi Exchange ADCP NonProd" and another named "goTom Sandbox", and the compliance API reports `lifecycle_stage: production` for both.

## Reproducing the sweep

```bash
# the catalogue
curl -s https://agenticadvertising.org/api/registry/agents | jq '.count, .agents[].url'

# the catalogue plus the registry's own crawler snapshot and verdict
curl -s 'https://agenticadvertising.org/api/registry/agents?health=true&capabilities=true&compliance=true'

# per-agent verdict and badges (URL-encode the agent url)
curl -s https://agenticadvertising.org/api/registry/agents/$ENC/compliance
curl -s https://agenticadvertising.org/api/registry/agents/$ENC/verification
```

The agent calls are JSON-RPC 2.0 over Streamable HTTP: `initialize`, the `notifications/initialized` notification, `tools/list`, then `tools/call`. Each request carries `Content-Type: application/json`, `Accept: application/json, text/event-stream` and `MCP-Protocol-Version: 2025-06-18`, and the `Mcp-Session-Id` returned by `initialize` goes back on every later request. A response arrives either as a JSON body or as an SSE stream whose `data:` lines each hold one JSON-RPC message.

The registry API returns current state on every call, so a re-run reproduces the catalogue and the verdicts as they stand on the day it runs.
