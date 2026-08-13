---
title: 'Brand Agent'
description: 'A brand agent answers identity questions and licenses rights in AdCP. In 3.1.13 the brand_agent field is deprecated in favour of an agents[] entry with type brand. AAMP has none.'
answer: 'A brand agent is the AdCP agent that answers questions about a brand identity and licenses its rights. In AdCP 3.1.13 it is declared as an agents[] entry with type "brand" in brand.json. AAMP has no equivalent.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Brand Agent'
alternateNames: ['brand identity agent', 'rights agent', 'brand.json agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'brand agent advertising'
  - 'what is a brand agent'
  - 'adcp brand protocol agent'
  - 'brand agent vs buying agent'
citations:
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/brand-json'
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/key-concepts'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://docs.adcontextprotocol.org/docs/reference/experimental-status'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/brand-agent-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/brand-json.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/tasks/get_brand_identity.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/walkthrough-rights-licensing.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/experimental-status.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/intro.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/foundations/a2-protocol-architecture.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/specialist/brand.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/learning/decision-makers/explaining-agentic-advertising.mdx'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/config/agents.yaml'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/protocol/avails.py'
  - 'https://scope3.com/agentic-advertising/brands/'
  - 'https://brandcontextprotocol.dev/spec/v0.7/'
related:
  - '/agents/agent/'
  - '/agents/discovery-files/'
  - '/agents/sales-agent/'
  - '/agents/governance-agent/'
  - '/concepts/sponsored-intelligence/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/brand-protocol/'
  - 'https://adcpexplorer.com/areas/sponsored-intelligence/'
  - 'https://aampexplorer.com/repos/buyer-agent/'
seeAlso: ['Agent', 'Discovery Files', 'Sales Agent', 'Sponsored Intelligence', 'Governance Agent']
reviewState: cto-reviewed
---

A brand agent is the AdCP agent that answers questions about a brand: who owns it, what it looks like, and whose likeness or voice may be generated on its behalf. AdCP's architecture module describes the role as: "Manages brand identity and guidelines via `brand.json`".

Four different things go by the name. This entry covers the first.

| Sense                                                                   | What it is                                                       | Where it is specified                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Brand identity agent                                                    | Answers identity questions about a brand and licenses its rights | AdCP `brand.json`, as an `agents[]` entry with `type: "brand"`                          |
| [Sponsored Intelligence](/concepts/sponsored-intelligence/) brand agent | Sits inside an AI assistant and talks to a user                  | AdCP's Sponsored Intelligence tasks, registered separately from the identity operations |
| Buy-side brand agent                                                    | Executes media buying on the brand's behalf                      | Scope3's published taxonomy; `type: "buying"` in the same AdCP enum                     |
| Branded assistant                                                       | An assistant with a company logo in the chat window              | Nothing                                                                                 |

The term is not in AdCP's own glossary, which defines `Agent`, `Sales Agent` and `Signal Agent`, and uses "brand agent" only inside other terms' definitions.

## What a brand agent answers

Creative agents are the main callers, and they call before generation rather than during a buy. From AdCP's brand specialist guide: "A creative agent fetches `brand.json` (or calls `get_brand_identity` authorized), then pulls the wordmark, applies the exact palette and type scale, adopts the tone of voice, and obeys the restrictions." The rights-licensing walkthrough has a buyer agent calling it too.

Answers come in two tiers. Any caller gets the public baseline unauthenticated: house, names, description, industries, `keller_type` (the brand-architecture classification), basic logos, tagline. Assets, voice synthesis, tone, restrictions and rights availability need a linked account, set up once by calling `sync_accounts`. Until then the response lists the withheld sections in `available_fields`, so a caller can tell an unauthorised response from an incomplete file.

## How a brand agent is declared

A brand agent is declared in one file, `brand.json`, fetched from `https://example.com/.well-known/brand.json` under RFC 8615. There is no registry to join. Two shapes declare one: a standalone brand agent document, or a `type: "brand"` entry in the `agents[]` array of a fuller file, either a house portfolio or a brand's canonical document. AdCP's brand.json reference treats the two routes as equivalent, and all five file variants are laid out on [discovery files](/agents/discovery-files/).

In `dist/schemas/3.1.13/brand.json`, `properties.brand_agent` carries `"deprecated": true` and this note:

> Deprecated: use agents array with type 'brand' instead. Brand agent that provides dynamic brand data via MCP.

`rights_agent` goes the same way. The replacement is an `agents[]` entry whose `type` comes from an eight-value enum titled "Brand Agent Type".

| `type`        | What that agent does                                            |
| ------------- | --------------------------------------------------------------- |
| `brand`       | Brand identity data (logos, colors, tone, guidelines) via MCP   |
| `rights`      | Rights discovery, pricing and acquisition for licensable assets |
| `measurement` | Campaign measurement, attribution and reporting                 |
| `governance`  | Brand safety, compliance and policy enforcement                 |
| `creative`    | Creative asset generation, review and approval                  |
| `sales`       | Sells inventory for publishers and media owners                 |
| `buying`      | Executes media buying for the brand                             |
| `signals`     | Audience signal discovery and activation                        |

Both `sales` and `buying` appear in the same enum, so an entry records only that the brand declared the agent, not which side of the trade it sits on. The [sales agent](/agents/sales-agent/) entry sets out the same collision in AdCP's role names.

Mechanically the change is a rename with a discriminator added: `{"url": ..., "id": ...}` under `brand_agent` becomes `{"type": "brand", "url": ..., "id": ...}` inside `agents[]`. `type`, `url` and `id` are required, everything else is optional, and an unset `jwks_uri` defaults to `/.well-known/jwks.json` on the origin of `url`.

AdCP's `brand-json.mdx` reference still tables `brand_agent` as an ordinary optional object, `agents` has no row in that table, and the file's one deprecation note is about `rights_agent`. The schema says deprecated rather than removed and names no removal version, so both shapes stay readable: a producer writing new files uses `agents[]`, and a consumer has to accept either.

## Operations and conformance

Six AdCP operations are registered to the brand agent. The four Sponsored Intelligence operations are registered separately and are not in this table.

| Operation             | What it does                                              | In `required-tasks.mdx` |
| --------------------- | --------------------------------------------------------- | ----------------------- |
| `get_brand_identity`  | Identity data; core public, more for authorised callers   | Required                |
| `verify_brand_claim`  | Verify one claim: subsidiary, parent, property, trademark | Absent                  |
| `verify_brand_claims` | Bulk variant, results positionally aligned                | Absent                  |
| `get_rights`          | Search licensable rights, natural-language first          | Conditional             |
| `acquire_rights`      | Binding acquisition; pick a `pricing_option_id`           | Conditional             |
| `update_rights`       | Lifecycle of an existing grant                            | Conditional             |

The conformance table and the registered operations do not line up in either direction. `creative_approval` is listed Conditional, "required when the agent reviews AI-generated content", with no operation of that name behind it; it is the payload a buyer submits to the `approval_webhook` from `acquire_rights`. `verify_brand_claim` and `verify_brand_claims` are the reverse case: both are callable, and neither appears in the conformance table, so nothing in 3.1.13 says whether they have to ship. The one hard requirement stated is that brand agents MUST declare `brand` in `supported_protocols`.

## The rights half is flagged experimental

`acquire_rights` can issue scoped `generation_credentials`, bounded by a `rights_constraint` on uses, countries and an impression cap, after which generation stops. AdCP's brand specialist guide names Midjourney for likeness and ElevenLabs for voice as providers that verify those credentials at generation time. Both names appear in documentation, not in the schemas.

All of it sits in the `brand.rights_lifecycle` experimental cluster under a strict declaration rule: any implementation of a task in it MUST declare the cluster id. "Partial implementation is allowed; silent implementation is not." AdCP gives its reason for the flag as a "Legal-construct surface added late in the 3.0 cycle" whose first deployments will expose edge cases in partial rights, sublicensing and revocation.

## Brand agent in AAMP

AAMP defines no brand agent. Three artifacts in the IAB Tech Lab repositories use the word, and none is a callable brand service.

| What AAMP has         | Where                                                  | What it actually is                                                                                                    |
| --------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `branding_agent`      | `buyer-agent`, in its CrewAI agent config              | An LLM persona, `role: "Branding Specialist"`, picking premium display and video placements                            |
| `advertiser_brand_id` | `iab-agentic-primitives`, on the avails request        | A 36-character string, with no schema behind it and nothing to call                                                    |
| `agent_role: "brand"` | `agentic-audiences`, in `embedding_format.schema.json` | One member of a six-value enum, in a draft whose sibling `specs/v1.0/schema/agent_interface.schema.json` is zero bytes |

The first row is the one a search surfaces, and it is a persona inside the [buyer agent](https://aampexplorer.com/repos/buyer-agent/) rather than a service anyone can call. The nearest thing AAMP has to brand identity on the wire is the `advertiser_brand_id` string.

## The buy-side sense

[Scope3's published definition](https://scope3.com/agentic-advertising/brands/) is the buy-side one: "an AI buying agent that acts on behalf of a brand — translating objectives, budgets, and brand standards into advertising decisions". That is `type: "buying"`, another value in the same Brand Agent Type enum. AdCP's own decision-maker material reaches for the buy-side reading too, calling a brand agent "a personal shopper". AdCP's schemas implement the identity sense.

The well-known path is contested as well. [Brand Context Protocol v0.7](https://brandcontextprotocol.dev/spec/v0.7/), published by Encoded Brands and dated 2026-07-05, serves `/.well-known/brand.md`. Its specification says the `brand.json` output projects into AdCP's "`brand_agent`/`get_brand_identity` contract", which is the field AdCP deprecated, and neither corpus acknowledges the other. A document can be valid BCP output and still carry the shape AdCP is retiring.
