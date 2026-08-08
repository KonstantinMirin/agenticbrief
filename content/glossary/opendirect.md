---
title: 'OpenDirect 2.1: Why AAMP Is Built On It'
description: "OpenDirect 2.1 is the IAB standard for automated direct ad buying, and it is the spine of AAMP's control plane. What it supplies, what it does not, and why AdCP never mentions it."
answer: "OpenDirect 2.1 is the IAB Tech Lab standard for automating direct ad buying. AAMP's control plane is built on it: Account, Order, Line and Product come from OpenDirect rather than from anything AAMP invented."
pubDate: 2026-08-09
term: 'OpenDirect 2.1'
alternateNames: ['OpenDirect', 'IAB OpenDirect']
category: programmatic
cluster: gl-aamp
keywords:
  - 'why is aamp built on opendirect'
  - 'opendirect 2.1'
  - 'opendirect order line product'
  - 'iab opendirect agentic'
citations:
  - 'https://iabtechlab.com/standards/opendirect/'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
related:
  - '/concepts/aamp/'
  - '/concepts/adcp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/mcp-and-a2a/'
  - 'https://aampexplorer.noetis.dev/repos/agentic-direct/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['AAMP', 'Ad Context Protocol', 'Media Buy', 'Package']
reviewState: cto-reviewed
---

## What is OpenDirect 2.1?

OpenDirect is IAB Tech Lab's standard for automating direct ad buying: the guaranteed and reserved inventory that used to move by email and insertion order. It predates the agentic work by years and is licensed separately. The copy vendored into AAMP declares its own provenance in a metadata block:

```json
"metadata": {
  "specification": "OpenDirect v2.1 Final",
  "organization": "IAB Technology Laboratory",
  "license": "Creative Commons Attribution 3.0",
  "website": "https://iabtechlab.com/opendirect",
  "referencedSpecifications": ["AdCOM", "OpenRTB", "DP-AA DOOH Extension"]
}
```

OpenDirect 2.1 supplies a workflow vocabulary rather than an auction vocabulary. Its objects are commercial: an Account is a buyer-to-advertiser relationship, an Order carries dates and budget, a Line books a specific product, an Assignment binds a Creative to a Line, and a ChangeRequest modifies a booked Order.

## Why does AAMP run on OpenDirect 2.1 rather than inventing a model?

Because AAMP's control plane is direct and programmatic-direct buying, and IAB Tech Lab already owned a ratified object model for exactly that. Reusing it meant the agent repositories could start from Account, Order, Line and Product instead of arguing about them.

The reuse is visible in four places, at four different depths:

| Where                                     | Evidence                                                                                                                                                                                                                                                 | Depth                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `agentic-direct/opendirect.json`          | 40 schemas, 33 tools and 13 resources, 71,811 bytes, version `2.1.0`. Thirteen `OpenDirect.*` schemas plus 23 `AdCOM.*` and four `OpenRTB.*`                                                                                                             | The object model itself |
| `seller-agent` README                     | Declares the agent automates deal negotiation and booking "using IAB Tech Lab standards (OpenDirect 2.1, Deals API v1.0, sellers.json)"                                                                                                                  | A conformance claim     |
| `buyer-agent/docs/api/protocols.md`       | Lists REST over OpenDirect as one of three supported transports, for "operator dashboards and legacy integrations"                                                                                                                                       | A transport             |
| `iab-agentic-primitives/spec/jsonschema/` | `Line` is "Individual product booking within an order (OpenDirect Line)"; `Order` "merges the buyer's OpenDirect Order with the seller's ExecutionOrder"; `AvailsRequest` notes that "spec-named fields use the OpenDirect 2.1 all-lowercase wire names" | The wire contract       |

That last row is the important one. The shared library both AAMP reference agents pin does not merely reference OpenDirect, it inherits OpenDirect's field-naming dialect and its decimal convention. `Avails` keeps `price` as a float "per the OpenDirect 2.1 decimal dialect", called out as a deliberate exception to the library's own money-in-micros rule.

## What does OpenDirect 2.1 not supply to AAMP?

Everything the agentic layer added. OpenDirect gives AAMP the nouns of a booking system; it does not give it agent behaviour.

- No agent identity, agent card or registry.
- No access tier, trust status, or tier-gated pricing.
- No multi-round negotiation. Quote, NegotiationMessage and NegotiationRound are AAMP-side additions in `iab-agentic-primitives`, not OpenDirect objects.
- No embeddings, no bid-request mutation. Those are the other two AAMP planes and share no type with this one.

So OpenDirect is the floor, not the building. When someone says AAMP is "based on IAB standards", this is the accurate version of that claim: the control plane's object model is inherited, the agentic parts on top of it are new, and the new parts come from reference implementations rather than from a ratified specification.

## What is OpenDirect's counterpart in AdCP?

**No counterpart. AdCP does not reference OpenDirect at all.** I grepped the published `dist/docs/3.1.6/` documentation snapshot and the entire `dist/schemas/3.1.10/` registry for the string. Zero hits in either.

AdCP built its buying objects from scratch. Where OpenDirect gives AAMP Order and Line, AdCP defines `core/media-buy.json` ("Represents a purchased advertising campaign") and `core/package.json` ("A specific product within a media buy (line item)"). The parenthetical in AdCP's own package description is the only nod to the older vocabulary anywhere in the registry.

The two stacks therefore differ at the root, not at the edges. One inherits a decade-old IAB booking model and wraps agents around it. The other designed a new object model for agent-to-agent work and never looked at the booking model. The consequences, object by object, are on the [AdCP and AAMP terminology lookup](/concepts/adcp-vs-aamp-terminology/).

## What is OpenDirect 2.1 confused with?

**`opendirect.json` is not an OpenAPI document.** The `agentic-direct` README labels it "OpenAPI 3.0 Schema" in its architecture diagram (line 10) and "OpenAPI 3.0 spec" in its parser section (line 316). It is neither. Its top-level keys are `name`, `version`, `description`, `metadata`, `schemas`, `tools` and `resources`, which is an MCP server manifest. The repository's own parser confirms this by checking `schema.tools` first and only falling back to `schema.paths`, and there are no `paths` in the file. AAMP Explorer renders [the manifest itself](https://aampexplorer.noetis.dev/repos/agentic-direct/).

**`2.1.0` in that file is the OpenDirect version, not an AAMP version.** `agentic-direct` carries no git tag at all. Quoting "2.1" as AAMP's version number is a common and wrong reading.

**OpenDirect is not OpenRTB.** OpenRTB is the real-time auction protocol. OpenDirect is the direct-buying workflow standard. AAMP uses both, in different planes: OpenDirect in the control plane, OpenRTB 2.6 inside ARTF at serve time.
