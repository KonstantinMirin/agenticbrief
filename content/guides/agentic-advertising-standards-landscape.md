---
title: 'Agentic Advertising Standards: Two Cover Advertising, One Ships a Contract'
description: 'Two agentic standards cover advertising and four cover commerce. AdCP publishes 3.1.13 stable and a released contract; AAMP is eight repositories with no shared version number.'
answer: 'Two standards target agentic advertising: AdCP, one versioned registry from AgenticAdvertising.org, published at 3.1.13 stable; and AAMP, an IAB Tech Lab umbrella over eight repositories with no shared version number. ACP, UCP, AP2 and x402 are commerce and payments protocols.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-landscape'
keywords:
  - 'agentic advertising standards landscape'
  - 'agentic advertising artifact status table'
  - 'adcp vs acp'
  - 'agentic commerce vs agentic advertising'
  - 'agentic protocol list'
citations:
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versioning.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CHANGELOG.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CHARTER.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/CONTRIBUTORS.md'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/building/concepts/industry-landscape.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/sponsored-intelligence/si-chat-protocol.mdx'
  - 'https://docs.adcontextprotocol.org/docs/building/concepts/industry-landscape'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/agentic-rtb-framework'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent'
  - 'https://github.com/IABTechLab/buyer-agent'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/catalog-info.yaml'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://www.crossmint.com/learn/agentic-payments-protocols-compared'
  - 'https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/guides/agent-discovery-files/'
  - 'https://adcpexplorer.com/'
  - 'https://aampexplorer.com/versions/'
  - 'https://whatisagenticbuying.com/maturity/'
  - 'https://adtechglossary.com/concepts/mcp-and-a2a/'
reviewState: cto-reviewed
---

Two of the standards in this conversation cover advertising, and only one of them has a contract you
can write code against. AdCP is a single versioned JSON Schema registry: 3.1.13 stable, 64 operations
across ten areas, and one machine-readable file that says which release is current. AAMP is an
umbrella over eight repositories that tag on their own schedules, four of which have never been
tagged at all. Outside its bidstream framework there is nothing normative in it to conform to, so
"we support AAMP" today means "we match somebody's Python". There is nothing to point a contract at.

Back AdCP for anything on the campaign path, and treat everything below as the version evidence for
that call. Put `"3.1"` on the wire for AdCP and read the release pointer for whichever patch the registry is
serving. When a vendor quotes you 3.0 GA off the docs site, the registry is serving 3.1.13 and the
wire contract only cares about `"3.1"` — that is a correction, not a re-scoping. On the AAMP side,
write the vendor's name into the integration plan instead of the standard's, because the vendor is
what you are integrating with. And keep the other four acronyms out of that budget line entirely.
ACP, UCP, AP2 and x402 settle transactions, and no operation in either advertising stack moves money.

## AdCP is one registry. AAMP is eight repositories.

AdCP, the Ad Context Protocol, comes from AgenticAdvertising.org. One repository, one version number.
It standardises a buyer agent buying media from a seller agent, and the two operations you meet first
are `get_products`, which asks a seller what inventory it has (natural-language brief or structured
filters, your choice), and `create_media_buy`, which turns whatever comes back into a campaign.
Twenty-two of its 64 operations are governance, twice the size of the media buy area they sit next
to: AdCP's authors think the hard part of an agentic buy is proving what the agent was allowed to
do. You implement it as an MCP server or an A2A endpoint.

AgenticAdvertising.org is the half of this that needs an introduction. `CHARTER.md` describes a
Delaware trade association with 501(c)(6) status still pending, four voting classes with equal board
representation (brands, agencies, publishers, technology providers), and a first AGM dated 6 May 2026. `CONTRIBUTORS.md` names an interim board of four, two of them from Scope3, and says outright
that "Scope3 seeded AAO with foundational IP, funding, and the initial property-catalog knowledge
graph". That is a single-vendor protocol with a trade association forming around it, disclosed by
the vendor, and I would rather price a published imbalance than guess at an unpublished one.
Mediaocean, The Washington Post, Magnite, PubMatic and Yahoo appear on the external contributor
list, which is participation rather than adoption; who actually runs an endpoint in production is
a separate question with a separate answer, and the [deployments
ledger](/guides/who-is-running-agentic-buys/) is where it gets kept.

AAMP comes from IAB Tech Lab, which wrote OpenRTB, AdCOM, OpenDirect and the Global Privacy Platform.
That provenance normally settles a standards question on its own, which is what makes the current
state of AAMP surprising: it is a name over [eight separate GitHub
repositories](/protocols/adcp-vs-aamp/), each tagging on its own schedule, sharing no common type
system and no common release. The work is the same shape approached from the other end: a
seller-agent SDK over OpenDirect 2.1, Deals API and `sellers.json`, a buyer-agent SDK to talk to it,
a bidstream framework underneath. One of the eight, the Agentic Real Time Framework (ARTF, in the
repository `agentic-rtb-framework`), is a finished specification with a release date on it. Most of
the rest are reference implementations.

Anthony Katsur, who runs IAB Tech Lab, says standards proliferation is a real cost to the industry.
He is right, and the bill lands on the buyer rather than on either standards body: two object models
with no shared type between them, and one of the two has no conformance suite to fail. Half the
repositories under his own umbrella have never been tagged, which is the cost arriving inside the
body that named it.

Which leaves the question he does not answer. If proliferation costs what he says it costs, and he
runs the body saying so, does this resolve into one stack before the money you spend this quarter has
depreciated? I do not expect a merger inside eighteen months. The tell that would change my mind is
AdCP-shaped work — a versioned schema registry with a release pointer in front of it — appearing
under an IAB Tech Lab tag, and nothing in the eight repositories is moving that way.

Everything else people bring into this conversation is a transport, an older IAB standard the agents
are built on, or a commerce protocol.

## Four of the six acronyms in this conversation settle transactions

| Protocol                          | Steward                                          | Category    | What it standardises                                                                        |
| --------------------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------- |
| AdCP                              | AgenticAdvertising.org                           | Advertising | Media buying, creative, signals, brand governance, real-time matching                       |
| AAMP                              | IAB Tech Lab                                     | Advertising | Agent discovery and trust, buyer/seller negotiation, bidstream mutation, embedding exchange |
| ACP (Agentic Commerce Protocol)   | OpenAI and Stripe                                | Commerce    | Checkout, payment delegation without becoming merchant of record                            |
| UCP (Universal Commerce Protocol) | Google, with Shopify, Walmart, Target and others | Commerce    | Checkout, payments, fulfilment primitives                                                   |
| AP2 (Agent Payments Protocol)     | originated at Google                             | Payments    | Mandates authorising an agent to pay on a user's behalf                                     |
| x402                              | originated at Coinbase                           | Payments    | Settlement over HTTP, built on the 402 status code                                          |

The ACP and UCP rows are AdCP's own glossary talking about its neighbours. AP2 and x402 are the only
two with no primary specification behind them, taken from
[Crossmint's protocol comparison](https://www.crossmint.com/learn/agentic-payments-protocols-compared)
and the [Applied Technology Index 2026
analysis](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/).

The two layers meet at one documented handoff, in Sponsored Intelligence, where
`docs/sponsored-intelligence/si-chat-protocol.mdx` has the host initiating ACP checkout when the
termination reason is `handoff_transaction`. AdCP's FAQ compresses that to one line: "AdCP owns the
path up to the handoff; the commerce protocol owns the transaction." No AdCP operation settles
anything, and no operation anywhere in the AAMP corpus mentions payment, checkout or a merchant of
record.

One collision in that table is real rather than sloppy. UCP means two different things inside this
one subject area: AdCP's glossary uses it for Google's Universal Commerce Protocol, while the AAMP
repository `agentic-audiences` was formerly the User Context Protocol, contributed by LiveRamp. Its
surviving JSON Schema still carries an `$id` pointing at
`raw.githubusercontent.com/LiveRamp/user-context-protocol`, and its `catalog-info.yaml` still
declares the project slug `LiveRamp/user-context-protocol` and the name `user-context-protocol`. A
document saying "UCP" may therefore mean a commerce protocol or an advertising data plane, and
nothing on the page will tell you which unless you ask who wrote it.

## Which version number is real, and which is a press release

AdCP has one machine-readable answer. It lives in `dist/schemas/latest.json`:

```json
{
  "latest": "3.1.13",
  "latest_stable": "3.1.13",
  "channel": "stable",
  "path": "/schemas/3.1.13/",
  "index": "/schemas/3.1.13/index.json"
}
```

That file is five lines and none of them is ambiguous. Follow the pointer and
`dist/schemas/3.1.13/manifest.json` stamps its generation time and lists 64 tools.

Four other surfaces in that same repository answer the same question differently:
`docs/reference/versions.mdx` says 3.1.12, `package.json` and `static/schemas/source/index.json` both
say 3.1.1, and `docs/building/concepts/industry-landscape.mdx`, the page a search engine is most
likely to hand a buyer, prints "Current version | 3.0 (GA, April 2026)". That last one is a whole
minor line and thirty-odd patches behind the registry sitting beside it. The two branch artifacts are
the ones that catch people out, because they are also the first files a reader opens.

The spread does not break a client, and AdCP's own rules say why. Negotiation runs at release
precision: buyers send `adcp_version` as `"3.0"` or `"3.1"`, never a patch number.
`docs/reference/versioning.mdx` puts the build string outside the wire contract entirely, calling
`adcp.build_version` "optional advisory metadata for incident triage — not part of the wire
contract". The same file promises that "implementations built against 3.0 will continue to function
against any 3.x release", `versions.mdx` adds that "3.1 remains additive over 3.0", and every release
from 3.1.4 to 3.1.13 is filed in `CHANGELOG.md` under "Patch Changes".

That patch classification is the project's own, applied to its own changes. The one time it slipped,
release 3.1.3 was withdrawn for adding a stable schema field in a patch release, a semver violation
against AdCP's own versioning document, caught by the body that wrote both. Somebody caught it, which
is the system working. It also means the stable surface was loose enough for a patch to widen it 25
days after 3.1.0 shipped, and nothing has changed that. Release-by-release detail sits on the
[maturity assessment](https://whatisagenticbuying.com/maturity/).

AAMP has no equivalent file at all, and the hub README concedes it in one line: "Each repository uses
independent semantic versioning." Four of the eight repositories have never been tagged. The four
that have agree on nothing: the spread runs from `v0.5.0` to `v2.4.1`, and no two sit on the same
version line.

Three AAMP repos ship an API document, and in all three the document's own `info.version`
contradicts the newest git tag: `seller-agent` tags `v2.4.1` against an OpenAPI `1.0.0`,
`buyer-agent` tags `v2.3.0` against `1.0.0`, `iab-agentic-primitives` tags `v0.5.0` against `0.1.0`.
Generate a client from the OpenAPI file, pin the git tag, and you carry two different version numbers
for the same component, both read correctly. The per-repository matrix is at [AAMP
Explorer](https://aampexplorer.com/versions/).

None of that reaches the trade press. Four AdCP numbers are circulating — 3.0 GA, 3.0 RC, 3.1 and
3.1.2 — and not one of the eight published sources covering this opens a repository: the protocol
directory at `advertisingprotocols.com` has AdCP at "3.0 RC" and AAMP at v2.0, and `adgentek.ai` runs
a full "AdCP 3.1 vs IAB AAMP 2.3" comparison and takes 3.1.2 from the docs site. "AAMP 2.3" is a
genuine IAB Tech Lab release announcement dated 30 July 2026, so nobody invented it; what it lacks is
a tag, because no repository in the corpus carries a `2.3` at the AAMP level and the closest string
in any tag list is `buyer-agent v2.3.0`. [What the repositories held on the day of that
announcement](/protocols/aamp/) is a page of its own, and it does not match. A release number tracks
a programme of work while the tags track engineering, nobody has declared either authoritative, and
so every trade article has a defensible source for a different number. When a version gets quoted at
you, ask which file it came out of. A clause in a signed agreement naming "AdCP 3.0 GA" pins a line
the registry moved off months ago, and nobody finds out until the first deprecation.

## The AAMP half ships code where AdCP ships contracts

| Artifact               | Steward                | Newest git tag | Version it declares about itself               | What you get                                                             |
| ---------------------- | ---------------------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| AdCP                   | AgenticAdvertising.org | n/a            | `latest.json` says 3.1.13 stable               | 64 operations, 761 JSON Schema files                                     |
| ARTF                   | IAB Tech Lab           | `v1.0`         | "Version 1.0, Released November 12, 2025"      | a published specification plus protobuf, eight named `Intent` mutations  |
| seller-agent           | IAB Tech Lab           | `v2.4.1`       | OpenAPI `info.version` 1.0.0                   | OpenAPI 3.1.0, 74 paths, 91 schemas                                      |
| buyer-agent            | IAB Tech Lab           | `v2.3.0`       | OpenAPI `info.version` 1.0.0                   | OpenAPI 3.1.0, 13 paths, 8 schemas                                       |
| iab-agentic-primitives | IAB Tech Lab           | `v0.5.0`       | OpenAPI `info.version` 0.1.0                   | 48 JSON Schemas; README says not yet released; absent from the hub index |
| agentic-audiences      | IAB Tech Lab           | none           | "Draft v0.1", inside a `specs/v1.0/` directory | one JSON Schema, four zero-byte spec files                               |
| agentic-direct         | IAB Tech Lab           | none           | n/a                                            | MCP and A2A wrapper over OpenDirect 2.1                                  |
| registry-agent-example | IAB Tech Lab           | none           | n/a                                            | a single 22-line `agent.ts`                                              |

Two SDKs, a wrapper and a 22-line example. The specification documents in the set come to one
released standard and two that describe themselves as unfinished.

One name in that table does not mean what buyers assume it means. ARTF imports OpenRTB 2.6 into its
protobuf and mutates live bid objects inside the auction through eight named `Intent` operations.
Nothing in it negotiates, and nothing in it needs a language model. The r/programmatic [thread that
exists only to ask the difference](https://reddit.com/r/programmatic/comments/1p9wm53/adcp_artf/) got
there first: "ARTF: Protocol framework to allow custom algorithm companies to standardize how
container services are built on ad tech. Has nothing to do with AI agents. Don't ask me why it got
the word agent in its name." It is also the one AAMP artifact with a finished specification and a
release date, which produces an awkward result: the most complete thing published under the agentic
banner is the piece furthest from anything a buyer would call an agent. AdCP's FAQ files it
"alongside OpenRTB at the impression layer".

It is also the one that goes to your general counsel before it goes to an engineer. ARTF's Go
implementation is AGPL-3.0 under Index Exchange copyright, while the specification document itself is
CC BY 3.0. Vendor that Go code into a hosted exchange and section 13 puts every counterparty hitting
your endpoint in scope for the source. If your exchange is proprietary the choice is binary:
reimplement from the CC BY 3.0 specification, or open the service. Finding that out after the
integration is written is the expensive version.

The row that matters most is `iab-agentic-primitives`, unreleased by its own statement and absent
from a hub README that lists six component repositories. The wire contract, the piece every other
repository would have to agree on, is the piece you cannot reach from the index. The
repository-by-repository read is at [AAMP: what IAB Tech Lab has published](/protocols/aamp/).

## Neither stack invented its transport

AAMP did not invent most of its object model either.

AdCP runs over [MCP and A2A](https://adtechglossary.com/concepts/mcp-and-a2a/). Its glossary
defines the protocol itself as "domain-specific tasks and schemas that work over MCP and A2A as
transports", and the Trusted Match operations sit outside both, on a direct HTTP/2 API per
`docs/trusted-match/router-architecture.mdx`.

AAMP runs over MCP, A2A JSON-RPC 2.0 and REST, with gRPC for ARTF. Its control plane is assembled
from IAB standards that predate the agentic work. OpenDirect 2.1 supplies Account, Order, Line,
Product, Creative, Assignment and ChangeRequest; AdCOM and OpenRTB 2.6 supply the creative and
bidstream shapes; `sellers.json` supplies supply-chain transparency.

AdCP wrote a new object model and published schemas for it, where AAMP wrapped existing IAB standards
in agent interfaces. Which of those two bets ages better is not answerable from a file, and I would
not trust anyone claiming it this early. What is answerable is which one you can build against this
quarter, and my money is on the stack that can be frozen and re-tested. Fund AdCP for anything on the
campaign path, name the vendor rather than the standard for anything on the AAMP side, and get the
licence question in front of legal before an engineer opens ARTF's repository.

Read next: [AdCP vs AAMP](/protocols/adcp-vs-aamp/) costs the two against each other, and [what IAB
Tech Lab has published](/protocols/aamp/) reads AAMP repository by repository.
