---
title: 'OpenDirect 2.1: the direct-booking standard under AAMP'
description: "OpenDirect 2.1 is IAB Tech Lab's REST standard for booking guaranteed inventory. AAMP's control plane inherits it in three different subsets, and AdCP references it nowhere."
answer: "OpenDirect 2.1 is IAB Tech Lab's REST standard for booking guaranteed ad inventory, and AAMP's control plane inherits its Account, Order, Line and Product objects, though no AAMP repository implements more than 13 of the standard's 23 objects."
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'OpenDirect 2.1'
alternateNames: ['OpenDirect', 'IAB OpenDirect', 'OpenDirect v2.1 Final']
category: programmatic
cluster: gl-stacks
keywords:
  - 'why is aamp built on opendirect'
  - 'is aamp opendirect compliant'
  - 'opendirect vs adcp'
citations:
  - 'https://iabtechlab.com/standards/opendirect/'
  - 'https://github.com/InteractiveAdvertisingBureau/OpenDirect/blob/82bc294314aba017fc639ba634aecc53adfd675f/OpenDirect.v2.1.final.md'
  - 'https://github.com/InteractiveAdvertisingBureau/OpenDirect/commits/82bc294314aba017fc639ba634aecc53adfd675f/OpenDirect.v2.1.final.md'
  - 'https://github.com/IABTechLab/agentic-direct/blob/915bda98f4de986aa0bbafe1d64df52fae974e62/opendirect.json'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/tests/unit/test_opendirect_wire_conformance.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/protocols.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/conformance/standards.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/Avails.json'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/media-buy.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/package.json'
related:
  - '/concepts/aamp/'
  - '/concepts/adcp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/mcp-and-a2a/'
  - '/media-buying/media-buy/'
  - '/media-buying/package/'
  - '/negotiation/quote/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/repos/agentic-direct/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso: ['AAMP', 'Ad Context Protocol', 'Media Buy', 'Package', 'Quote']
reviewState: cto-reviewed
---

OpenDirect 2.1 is IAB Tech Lab's REST standard for booking guaranteed and reserved advertising inventory: the direct deals that used to move by email and spreadsheet. It defines 23 objects covering accounts, orders, inventory, creative and reporting. It predates agentic buying and defines no agent behaviour.

[AAMP](/concepts/aamp/) is built on it because IAB Tech Lab already owned a ratified object model for the transaction AAMP's control plane automates, so the agent repositories started from Account, Order, Line and Product rather than inventing four nouns of their own.

The object graph is a booking workflow. Accounts own Orders, Orders hold Lines, Lines book Products. An Assignment attaches a Creative to a Line, and a ChangeRequest amends one already booked. The nesting is in the path: `/accounts/{id}/orders/{id}/lines`.

Version 1.0 shipped in January 2015 and 2.1 in April 2024. The [standard's page on iabtechlab.com](https://iabtechlab.com/standards/opendirect/) is stamped "last updated 8 July 2024", lists no implementers and runs no conformance programme, and it does not mention agentic work or AAMP.

## AAMP's inheritance from OpenDirect

seller-agent's README claims it books "using IAB Tech Lab standards (OpenDirect 2.1, Deals API v1.0, sellers.json)". buyer-agent lists "REST (OpenDirect 2.1)" as one of [three transports](/concepts/mcp-and-a2a/), the one for "operator dashboards and legacy integrations", with MCP as the default. The AAMP hub repository, a README index and a licence file, makes no reference to OpenDirect, OpenRTB or AdCOM.

The copy vendored into `agentic-direct` keeps the standard's own metadata block, naming OpenDirect v2.1 Final under Creative Commons Attribution 3.0 and referencing AdCOM, OpenRTB and the DP-AA DOOH Extension, with the example base URL `https://opendirect.example.com/v2.1` still in place.

## Three implementation subsets

`agentic-direct/opendirect.json` defines 13 `OpenDirect.*` schemas, and its `2.1.0` is OpenDirect's version number rather than its own. (The file is an MCP server manifest, keyed on `schemas`, `tools` and `resources`; the repository's README describes it as an OpenAPI 3.0 schema and it has no `paths` key.) `iab-agentic-primitives` is the schema library both reference agents import, v0.5.0 and unreleased, and it inherits more than the shapes: its `Order` "merges the buyer's OpenDirect Order with the seller's ExecutionOrder", and its `AvailsRequest` notes that "spec-named fields use the OpenDirect 2.1 all-lowercase wire names". seller-agent is the running reference server, 74 OpenAPI paths, and the only one that answers a request. All three are IAB Tech Lab repositories, and none is designated as the one to build against.

| OpenDirect 2.1 object group                                                                     | `opendirect.json` manifest | `iab-agentic-primitives`    | seller-agent REST             |
| ----------------------------------------------------------------------------------------------- | -------------------------- | --------------------------- | ----------------------------- |
| Booking chain: Account, Order, Line, Product, Creative, Assignment, Organization, ChangeRequest | all 8                      | all 8                       | Product, Order, ChangeRequest |
| Avails and search: Avails, AvailsStatus, ProductAvailsSearch, ProductSearch, ProductTargeting   | none                       | Avails, ProductAvailsSearch | `POST /products/avails`       |
| Inventory detail: Placement, AdUnit                                                             | both                       | neither                     | neither                       |
| Party detail: Address, Contact, AdvertiserBrand                                                 | Address, Contact           | none                        | none                          |
| Comms and reporting: Message, Stats, ProviderData, EID, UID                                     | Message                    | none                        | none                          |
| Objects present                                                                                 | 13 of 23                   | 10 of 23                    | 4 of 23                       |

The first two columns count schema definitions; the third counts entities with a REST path. AdvertiserBrand, ProductSearch, AvailsStatus, ProductTargeting, ProviderData, Stats, EID and UID appear in none of the three, which is the reporting and identity half of the standard.

The manifest carries Address and Contact but no Avails or search objects; `iab-agentic-primitives` carries Avails and ProductAvailsSearch but no party-detail objects. Neither body publishes a crosswalk of what survived.

Conformance testing runs to one file. `seller-agent/tests/unit/test_opendirect_wire_conformance.py` covers a single endpoint, `POST /products/avails`, and what it pins is spelling: `productid`, `startdate` and `enddate` have to parse under their lowercase spec names, and the camelCase aliases must not be accepted or emitted. It pins lowercase because the source document ships both: OpenDirect's Account attribute table is all lowercase, while the normative `/accounts` example returns "Accounts", "AdvertiserId" and "Id" in PascalCase, plus an `AgencyId` the table never defines. Three of that endpoint's six request fields are spec-named; `requestedImpressions`, `budget` and `targeting` have, the docstring says, "no spec name to converge to".

## What OpenDirect does not define

Negotiation, quote, access tier, trust status, agent card and embedding appear nowhere in the standard, which is why 14 of the 22 core primitives in `iab-agentic-primitives` have no OpenDirect ancestor by name, Agent, [Quote](/negotiation/quote/), Negotiation and MediaKit among them.

Inheriting the standard also carried a cost on money typing. OpenDirect 2.1 carries price as a decimal float. `iab-agentic-primitives` numbers its contested design calls in the schema descriptions, and FD-11 bans float money on the wire, because binary floating point cannot hold decimal money exactly; the ban is an executable check in `src/iab_agentic_primitives/conformance/standards.py`. Across four Avails schemas, `price` "stays a float per the OpenDirect 2.1 decimal dialect".

## OpenDirect and AdCP

[AdCP](/concepts/adcp/)'s published docs and schema registry never mention OpenDirect, while naming IAB Tech Lab in dozens of files and referencing OpenRTB, AdCOM and VAST throughout. Its documentation tooling does index the OpenDirect repository, alongside roughly 28 others; the objects AdCP publishes are defined independently of it.

[Media Buy](/media-buying/media-buy/) and [Package](/media-buying/package/) are where Order and Line went, and the two stacks line up object by object on the [terminology lookup](/concepts/adcp-vs-aamp-terminology/).

## Common confusions

OpenDirect and OpenRTB do not sit in the same plane. OpenDirect belongs to AAMP's control plane, where a human would once have signed an insertion order; OpenRTB 2.6 belongs to the agentic RTB framework at serve time, imported as `com/iabtechlab/openrtb/v2.6/openrtb.proto`. AAMP is credited to "OpenRTB, AdCOM and OpenDirect", three inheritances in three different planes, and the [full stack comparison](https://agenticadlab.com/protocols/adcp-vs-aamp/) separates them.
