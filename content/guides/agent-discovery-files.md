---
title: 'Agent Discovery Files: Publish adagents.json and Pin the Signing Keys'
description: 'Publish adagents.json at a known path on your own domain, naming the agents allowed to sell your inventory and pinning the keys they must sign with. What goes in it, and what AAMP has instead.'
answer: 'A publisher makes inventory discoverable to a buying agent by serving /.well-known/adagents.json on its own domain: a released JSON Schema listing which sales agents may sell which properties, and pinning the signing keys those agents must use.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'hub-discovery-trust'
keywords:
  - 'agent discovery and trust models'
  - 'do adcp and aamp agent discovery interoperate'
  - 'domain hosted vs registry agent discovery'
citations:
  - 'https://docs.adcontextprotocol.org/docs/governance/property/adagents'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/authorized-agent-base.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/agent-signing-key.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/property/adagents.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/brand-protocol/seller-setup.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/test-vectors/index.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/static/openapi/registry.yaml'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/docs/api/seller-discovery.md'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/src/ad_buyer/registry/client.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/api/agent-discovery.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/STANDARDS_GAP_REPORT.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/protocol/AgentDiscoveryRequest.json'
  - 'https://github.com/IABTechLab/registry-agent-example'
  - 'https://iabtechlab.com/introducing-the-iab-tech-lab-agent-registry/'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/how-a-machine-buys-media/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - 'https://adcpexplorer.com/discovery/'
  - 'https://adtechglossary.com/agents/discovery-files/'
  - 'https://adtechglossary.com/agents/agent-registry/'
  - 'https://adtechglossary.com/agents/agent-card/'
  - 'https://adtechglossary.com/negotiation/trust-status/'
  - 'https://adtechglossary.com/negotiation/access-tier/'
faq:
  - question: 'Do AdCP and AAMP agent discovery interoperate?'
    answer: 'No. The eight IAB agentic repositories contain zero references to adagents.json and zero references to AdCP, and AdCP mentions AAMP only in one FAQ accordion. Nothing maps an AAMP trust status onto an AdCP authorized_agents entry.'
  - question: 'Should I use a domain-hosted discovery file or a registry?'
    answer: 'Publish the domain-hosted file. In AdCP the registry is an index over that file, and in AAMP the equivalent file has never been specified, so the registry can confirm an agent exists but not that a publisher authorized it.'
reviewState: cto-reviewed
---

If you own inventory and anyone has asked you for a file, publish `adagents.json` on your own origin
this week and populate its `signing_keys`. If neither is true, read the schema and wait. One static
file at `https://{yourdomain}/.well-known/adagents.json`, a released JSON Schema, a free public
validator, no account to open, and the answer to "who is allowed to sell my inventory" stays on your
domain instead of in somebody else's database. It is the cheapest useful thing a publisher can do in
this whole category and the thing most often wrong on the first attempt.

## Publish the file, then pin the keys

The keys are the part publishers skip, including the largest publisher currently doing this at all.
Skipping them is the mistake. The pin is the only mechanism in either stack that still holds when an
agent's own domain is compromised, AdCP already makes it a MUST for the four mutating operations, and
the rotation rules cost you one coordination step.

On the buy side, publish `brand.json` for the same reason. Then read every registry listing in either
stack as a catalog entry, because neither registry has a field that means "a publisher agreed to
this". If you are building against AAMP, do not hard-code a registry hostname: one of the three named
across its own repositories has no DNS record at all. Configure it, cache the verdicts, decide your
own access tiers and treat the registry's answer as one input to them, and build nothing that depends
on `authorized-agents.txt` until that file has a schema.

There is one production `adagents.json` of any size, the same path 404s on `adcontextprotocol.org`,
`agenticadvertising.org` and `sovrn.com`, and no buying agent has been observed fetching any of them
at decision time. What publishing buys you today is a record the registry will validate on request,
plus the option on the day a buyer starts reading them. That is a model worth being ready for, not a
deadline.

## Both stacks copied ads.txt. One of them shipped the file.

A buying agent arrives at a publisher's domain with one question: who is allowed to sell this
inventory? Both protocol stacks landed on the same two-layer answer. A file the publisher hosts on
its own origin, then a registry that fetches that file, validates it, and keeps the agents' own
identity records. Both descend from ads.txt and both say so: AdCP specifies an ads.txt
`managerdomain` fallback for when the well-known file returns 404, and IAB Tech Lab's registry
announcement lists "Creating the ability to verify that seller agent actually represents a property
(like ads.txt for agents)" as a roadmap item. They shipped opposite halves of it.

| Layer                               | AdCP                                                                                                          | AAMP                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Publisher-hosted authorization file | `/.well-known/adagents.json`, released JSON Schema in 3.1.13, in production                                   | `/.well-known/authorized-agents.txt`, named three times in eight repositories, all three in Python |
| Registry over the top               | `agenticadvertising.org`, 105 API paths, reads unauthenticated (`security: []` on the whole OpenAPI document) | `registry.iabtechlab.ai`, 40 agents listed, reads gated by an HS256 JWT with issuer `IAB`          |

Files versus registry is the wrong axis to argue about. AdCP's registry has something authoritative
to index and AAMP's does not, which is why the instruction above comes out the same whichever stack
your counterparty is on.

Neither stack has read the other. Zero files across the eight IAB agentic repositories mention
`adagents`, zero lines mention AdCP, and nothing maps an AAMP `registered` status onto an AdCP
`authorized_agents` entry; the same silence runs across the whole of both corpora, priced in
[AdCP vs AAMP](/protocols/adcp-vs-aamp/). Both stacks do serve an A2A card at
`.well-known/agent.json`, and that one shared artifact is a format coincidence. The one detailed
comparison anybody has published, `adgentek.ai/blog/adcp-vs-aamp/`, describes a hybrid flow in which
a buyer resolves `brand.json` and `adagents.json` and then cross-checks the IAB
[agent registry](https://adtechglossary.com/agents/agent-registry/), and no file in either
corpus implements it.

## What goes in adagents.json

One file at one path. Its schema ships in the released registry as `dist/schemas/3.1.13/adagents.json`,
generated 2026-08-04, a `oneOf` over two variants.

The pointer variant has three properties and requires one, `authoritative_location`, an HTTPS URL
where the real file lives. Three rules in `docs/governance/property/adagents.mdx` stop that redirect
turning into a maze: "Same Schema", "No Nested References", and "Single Hop", which reads "Only one
level of URL indirection is allowed."

The inline variant carries sixteen top-level fields and requires exactly one of them,
`authorized_agents`. A complete one from `docs/brand-protocol/seller-setup.mdx`, with the `contact`
block dropped for length:

```json
{
  "$schema": "https://adcontextprotocol.org/schemas/v3/adagents.json",
  "properties": [
    {
      "property_id": "streamhaus_ctv",
      "property_type": "ctv_app",
      "name": "StreamHaus CTV App",
      "publisher_domain": "streamhaus.example",
      "identifiers": [{ "type": "bundle_id", "value": "com.streamhaus.ctv" }]
    }
  ],
  "authorized_agents": [
    {
      "authorization_type": "property_ids",
      "url": "https://ads.streamhaus.example/mcp",
      "authorized_for": "StreamHaus direct CTV inventory",
      "property_ids": ["streamhaus_ctv"],
      "signing_keys": [
        {
          "kid": "streamhaus-sales-prod-2026",
          "kty": "OKP",
          "alg": "EdDSA",
          "crv": "Ed25519",
          "x": "w8zcY1LZqV4n1oKbfyq3n2q3sL2uV3z7kEw1m9Qjv4A",
          "use": "sig"
        }
      ]
    }
  ]
}
```

That is the whole thing. Everything else is scope: `authorization_type` discriminates six ways, an
entry narrows by collection, placement, placement tag, country or an `effective_from` /
`effective_until` window, and `delegation_type` is one of `direct`, `delegated`, `ad_network`. An
empty array is legal, and the schema spends four negative clauses telling validators not to read it
as deny-all, authorize-all, a revocation, or an error. Nobody writes that for a hypothetical;
somebody hit all four readings in the wild and the schema carries the scar.

Field-by-field reference lives on [AdCP Explorer](https://adcpexplorer.com/discovery/). On the
buy side, [`brand.json`](https://adtechglossary.com/agents/discovery-files/) sits at
`/.well-known/brand.json`: five variants in 3.1.13, split the way `adagents.json` splits, two
redirects and three actual documents.

## The signing key pin inverts key discovery

Every authorized agent inherits `core/authorized-agent-base.json`, whose key objects require a `kid`
and a `kty`, and the governance documentation makes the pin normative:

> if the publisher's `adagents.json` entry for an agent contains `signing_keys`, the verifier MUST reject any signature whose `keyid` is not in that pinned set, regardless of `jwks_uri` contents. The pin is authoritative; the agent-hosted JWKS is advisory and MUST NOT override it.

Normally the agent tells you its keys and you believe it. Here the publisher pins them and the
agent's own JWKS loses the argument. Publishers MUST populate the pins for the four mutating scopes:
`create_media_buy`, `update_media_buy`, `sync_creatives`, `update_performance_index`.

Rotation is the obvious operational objection, and the same document answers it. The agent mints
its own keypair and publishes it under its own `jwks_uri`; the publisher pins the public half, so a
rotation needs both parties to move. It does not turn into a lockout, though. Verifiers SHOULD cache
the pinned set no longer than the `Cache-Control` `max-age` on `adagents.json`, one hour by default.
On an unknown `keyid` a verifier MUST force-refresh before rejecting for good. And publishers MAY
carry both keys through the window, since the pinned set is unordered and presence in it is
sufficient. Keys also take an optional `revoked_at` that verifiers MUST honour.

Two things are left loose. `adagents.mdx` defaults the pin cache to an hour while
`core/agent-signing-key.json` reasons about revocation on a "recommended: 5 minutes" TTL for the same
document; use the shorter one. And the pin says nothing about publisher-domain compromise. Rewrite
`adagents.json` and you rewrite the pin, so the first retrieval is trusted on TLS alone.

## The largest adagents.json in production carries no signing keys

`https://mediavine.com/.well-known/adagents.json` is a 301 to `www.mediavine.com`, where the same
path answers 200 to an unauthenticated GET. A resolver that refuses redirects — which is what the
`authoritative_location` rules tell validators to do one layer up — sees the 301 and nothing else.
Follow it and you get 3,272,011 bytes, last updated 2026-07-06, covering 8,865 properties under 24
tags. One publisher can carry that much in this format without the model falling over.

Now the uncomfortable half. It has two `authorized_agents` entries, both pointing at
`https://interchange.io/`, both `authorization_type: property_tags` with
`property_tags: ["scope3_aee"]`, both `delegation_type: ad_network`. They differ only in the
free-text `authorized_for` string: display inventory on one, video on the other. Machine-readably
they are identical, and the distinction the publisher meant sits in prose no resolver can act on.

And there are no `signing_keys` in it. Zero, in the largest live file in production, the one the
spec's MUST is aimed at. One file of that size against 404s everywhere else says the model ships.

The `agenticadvertising.org` registry reads it, demonstrably. `POST /api/adagents/validate` checks
any domain's file on request, and its revalidate endpoint will "synchronously fetch a publisher's
live `/.well-known/adagents.json`, run the registry validator, persist the refreshed verdict".
Validation needs no account, because `security: []` sits at the top of that 105-path OpenAPI
document, while writes still need a bearer token. What is missing is a buying agent fetching the file
at decision time. On the write side there is a released schema with a validator in front of it; on
the read side, the validator is the whole of the evidence. That registry lists 23 public agents, and
[three sales agents will answer an anonymous product call](https://adcpexplorer.com/guides/adcp-registry-measured/).

If you are a publisher, you are done. What follows is for anyone being asked to integrate against
AAMP.

## Registry membership is worth money

`seller-agent/docs/api/agent-discovery.md` publishes a five-value
[trust status](https://adtechglossary.com/negotiation/trust-status/) and maps each value to a
maximum [access tier](https://adtechglossary.com/negotiation/access-tier/).

| Trust status | How it is reached                                      | Maximum access tier | Pricing visibility                |
| ------------ | ------------------------------------------------------ | ------------------- | --------------------------------- |
| `unknown`    | default on first contact                               | `public`            | published rate card only          |
| `registered` | found in the IAB AAMP registry, verified automatically | `seat`              | seat-level pricing                |
| `approved`   | seller operator action                                 | `advertiser`        | full advertiser pricing           |
| `preferred`  | seller operator action                                 | `advertiser`        | full pricing plus priority access |
| `blocked`    | seller operator action                                 | none                | no access                         |

The five values are ordered, and the effective tier is the minimum of the trust ceiling and the tier
the buyer claims. Claim `advertiser` on `registered` trust and you get `seat`.

Read the second row commercially. `registered` is granted by registry membership alone, and it moves
a buyer from published rate card to seat-level pricing. Being in the registry is worth money, and
that is the best argument for the registry-first direction in either corpus.

Then the wire contract contradicts itself. `AgentTrustVerification.json` hard-codes the five values
and states that trust "is verified against the AAMP registry (the IAB Tech Lab agent discovery and
trust registry), never self-asserted". `SANDBOX_REGISTRY.md`, in the same repository, says the real
registry "has no self-asserted access-tier / trust-tier enum — trust is the `verification_status` +
`domain_verified` + `iab_member` triplet", and files the whole trust-tier surface under "Legacy AAMP
trust-tier surface", "a compatibility layer". That ordering is the seller agent's local policy. The
registry does not issue it.

## AAMP discovery is three calls, and the default points at localhost

Nobody has run this against a production registry. The buyer agent's default registry URL is
`http://localhost:8080/agent-registry`, so an unconfigured deployment discovers nobody, and the
production hostname the same repository documents was never created.

The flow is three calls, per `buyer-agent/docs/api/seller-discovery.md`. `GET
/agents?agent_type=seller&capabilities=ctv` against the registry, then `GET /.well-known/agent.json`
against whichever seller came back, then `GET /verify?agent_url=...` back to the registry for a trust
verdict. The client caches verdicts for 300 seconds by default.

The [agent card](https://adtechglossary.com/agents/agent-card/) it fetches is a real document:
`authentication.schemes` (`api_key`, `bearer`), `skills[]` (`discovery`, `pricing`, `proposals`,
`negotiation`, `deals`), `inventory_types`, `supported_deal_types` (`pg`, `pmp`, `preferred_deal`,
`private_auction`), and `capabilities.protocols`, which is `["opendirect21"]`. That is OpenDirect
2.1, the pre-agentic direct-buy API. The doc notes that "`a2a` will be listed once an inbound A2A
server ships". That path, `.well-known/agent.json`, is the Agent2Agent card convention: the address
itself advertises that an agent speaks A2A, and the card parked there lists one protocol, the legacy
one.

Which registry it calls is unsettled. Three files name three different production bases.

| Named in                                        | Base URL                                       | What it does today                       |
| ----------------------------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `buyer-agent/docs/api/seller-discovery.md`      | `https://registry.aamp.iab.com/agent-registry` | no DNS record at all                     |
| `seller-agent/src/ad_seller/config/settings.py` | `https://tools.iabtechlab.com/agent-registry`  | 200                                      |
| `iab-agentic-primitives/SANDBOX_REGISTRY.md`    | `https://registry.iabtechlab.com`              | 302 to `https://registry.iabtechlab.ai/` |

The first row is the one to stop on. `registry.aamp.iab.com` is the production registry hostname in
the buyer agent's own documentation, and it was never created. `iab.com` resolves fine. The subdomain
does not exist. The third row is the base the primitives library pins as `IAB_PROD`, and it now
redirects to a top-level domain no file in the corpus mentions.

The live service is real. `GET https://registry.iabtechlab.ai/api/agents` returns a `401` with
`"error":"Authentication required"`, and that enveloped shape matches what `SANDBOX_REGISTRY.md`
documents. The public UI lists 40 agents with Domain, GPP and Endpoint verification indicators. GPP
is IAB Tech Lab's own Global Privacy Platform consent framework, so a third of the trust signal is
"carries an ID from another IAB standard". Whether the reference client's `iab_member` field exists
on the live service is unconfirmed.

The repository the AAMP hub README names as its registry component, `registry-agent-example`, is a
22-line `agent.ts` with one commit that wraps an external MCP server and defines no contract. The
Node.js service that does run the registry, `IABTechLab/agent-registry`, is not in that README at
all. The [AAMP maturity verdict](/protocols/aamp/) has the rest of that split.

Then the file the whole model would rest on. AAMP's answer to `adagents.json` has a name and nothing
else. `iab_agentic_primitives/registry_client.py` defines a class called `AgentAuthorization` with
this docstring: "Result of `POST /api/agents/validate/agent` (public endpoint). Whether a publisher
domain authorizes a given agent URL, per the publisher's `/.well-known/authorized-agents.txt` file."

That filename occurs three times across eight repositories, and the other two occurrences are an
admission and a test. IAB's own sandbox test double does not fetch the publisher's
`authorized-agents.txt`, and IAB's own reference client ships a test asserting that a publisher
authorization check returns false, because there is no file to check. No schema for the file exists
in the repository, and nothing anywhere in the corpus describes its syntax, so two implementations
would have nothing to agree on.

The corroboration comes from IAB Tech Lab's own wire contract. `STANDARDS_GAP_REPORT.md` is
machine-generated and guarded by a drift test, so it is not an offhand remark in a README. It lists
"IAB Tech Lab AAMP agent discovery and trust registry" as UNVERIFIED and gives the action to close
it: "Obtain the IAB Tech Lab AAMP (agent discovery and trust registry) specification". That is IAB
Tech Lab's own reference implementation recording that it could not obtain IAB Tech Lab's discovery
specification, and two-thirds of the standards that report tracks are blocked the same way, on a
specification IAB has not published.

Discovery has a request shape and no answer shape: `AgentDiscoveryRequest.json` exists with a single
required field, `agent_url`, and there is no `AgentDiscoveryResponse.json` anywhere in the
repository.

The AAMP registry is real, live, and better engineered than the documentation around it suggests. It
has nothing authoritative to index. It can tell you an agent exists and that someone DNS-verified its
domain; it cannot tell you a publisher authorized it, and there is no cryptographic fallback either,
because no file across the eight repositories mentions signing keys. That missing file is the largest
single item in [what these protocols don't standardize](/guides/what-agentic-ad-protocols-dont-standardize/).

## A registry listing is a catalog entry, not a grant of authority

Both stacks take self-registration: `POST /api/me/agents` in AdCP, bearer-authenticated, and `POST
/api/agents` in AAMP, where the JWT's company domain must match the submitted `primary_domain`. What
the listing buys you is the difference. An AdCP entry is a catalog record and the publisher's file
still decides; an AAMP entry is the trust record the table above already priced.

The failure modes are not the same size either. Get an `adagents.json` wrong and one publisher's
inventory stops being sellable by one agent until somebody edits one static file, and nobody else
notices, because there is no shared object to corrupt. Break the registry and the blast radius is
every participant at once: a seller agent that cannot reach it has no path to `registered`, which
drops its counterparties back to public tier and rate card. In AAMP the registry going down is a
pricing event, and one bad `verification_status` record travels just as far. Price that difference
before you decide which layer your revenue depends on.
