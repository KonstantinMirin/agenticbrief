---
title: 'AAMP (Agentic Advertising Management Protocols)'
description: "AAMP is IAB Tech Lab's umbrella over nine separately versioned agentic advertising repositories: a control plane, a bidstream mutation framework and an embedding exchange. It has no version."
answer: "AAMP is IAB Tech Lab's umbrella label for nine separately versioned agentic advertising repositories, spanning a control plane, a bidstream mutation framework and an embedding exchange. It has no version: each repository tags independently."
pubDate: 2026-08-09
term: 'AAMP'
alternateNames:
  - 'Agentic Advertising Management Protocols'
  - 'Agentic Advertising Marketplace Protocol'
  - 'IAB Agent & API Management Protocol'
  - 'Agent-to-Agent Marketplace Protocol'
category: protocol
cluster: 'gl-stacks'
keywords:
  - 'aamp protocol'
  - 'what is aamp in advertising'
  - 'aamp definition'
  - 'aamp components'
  - 'iab tech lab aamp'
citations:
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://github.com/IABTechLab/iab-agentic-primitives'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/src/iab_agentic_primitives/registry_client.py'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/src/ad_seller/clients/agent_registry_client.py'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/pyproject.toml'
  - 'https://github.com/IABTechLab/agentic-real-time-framework'
  - 'https://github.com/IABTechLab/agentic-real-time-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-audiences'
  - 'https://github.com/IABTechLab/agentic-direct'
  - 'https://github.com/IABTechLab/agentic-mobile'
  - 'https://github.com/IABTechLab/registry-agent-example'
related:
  - '/concepts/adcp/'
  - '/concepts/adcp-vs-aamp-terminology/'
  - '/concepts/opendirect/'
  - '/concepts/mcp-and-a2a/'
  - '/negotiation/quote/'
  - '/realtime/artf-intent/'
  - '/agents/agent-registry/'
  - '/about/sources-and-versions/'
  - 'https://aampexplorer.com/what-does-aamp-stand-for/'
  - 'https://aampexplorer.com/versions/'
  - 'https://aampexplorer.com/repos/'
  - 'https://agenticadlab.com/protocols/aamp/'
  - 'https://agenticadlab.com/protocols/adcp-vs-aamp/'
seeAlso:
  [
    'Ad Context Protocol',
    'OpenDirect 2.1',
    'ARTF',
    'Agentic Audiences',
    'Seller Agent',
    'Buyer Agent',
  ]
updatedDate: 2026-08-09
reviewState: cto-reviewed
---

AAMP is IAB Tech Lab's umbrella label over nine separately versioned repositories of agentic advertising work. The repositories describe one media transaction carried out machine to machine: a buyer's agent finds a seller, asks what inventory is available (avails), negotiates a quote across several rounds and books the deal.

The control plane — everything that happens before a campaign runs: discovery, negotiation and booking — is defined by the wire contract in `iab-agentic-primitives` and implemented by the reference agents and the OpenDirect wrapper that speak it. [ARTF](/realtime/artf-intent/) is the bidstream mutation framework, the one part that runs at serve time. `agentic-audiences` is the embedding exchange.

The hub repository, `github.com/IABTechLab/AAMP`, holds a README and a licence file, and that README carries the release model: "Each repository uses independent semantic versioning." There is no AAMP version number, so a dependency declaration names one repository at a tag and the others move on their own schedule.

The hub expands the acronym as Agentic Advertising Management Protocols. Three other expansions appear inside the corpus, including in the wire contract both reference agents import; [AAMP Explorer has the file and line for each](https://aampexplorer.com/what-does-aamp-stand-for/).

## Nine repositories carry the label

Nine repositories carry the label: the hub, the six the hub lists, and two named only in the code or on the standards page. Supporting AAMP means a different thing in each one.

| Repository                     | What it publishes                                                                                                                           | What supporting it means                                                                                 | On the hub README?                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `AAMP`                         | The umbrella README and a licence                                                                                                           | Nothing to implement                                                                                     | it is the hub                           |
| `iab-agentic-primitives`       | 48 JSON Schemas and a 13-operation OpenAPI, the wire contract both agents import                                                            | Speaking the buyer-to-seller wire contract, at v0.5.0, unreleased                                        | **no**                                  |
| `seller-agent`                 | Supply-side reference implementation; 74 OpenAPI paths, 87 operations                                                                       | Answering for a publisher: avails, quotes, negotiation, booking                                          | yes                                     |
| `buyer-agent`                  | Demand-side reference implementation, Python                                                                                                | Running the same control plane from the demand side                                                      | yes                                     |
| `agentic-direct`               | MCP/A2A wrapper over OpenDirect 2.1; handlers call `generateMockResponse`                                                                   | Booking against [OpenDirect 2.1](/concepts/opendirect/) over [MCP, A2A and REST](/concepts/mcp-and-a2a/) | yes                                     |
| `agentic-rtb-framework` (ARTF) | The released v1.0 specification and a protobuf contract                                                                                     | Changing a bid at serve time: ARTF v1.0, protobuf, one entry point                                       | yes, under its old name                 |
| `agentic-audiences`            | Draft v0.1 embedding exchange from LiveRamp, filed under `specs/v1.0/`, where `specs/v1.0/schema/agent_interface.schema.json` is zero bytes | Exchanging audience embeddings                                                                           | yes                                     |
| `registry-agent-example`       | Example client that registers an agent and verifies it                                                                                      | Registering and verifying an agent against an API with no published specification                        | yes                                     |
| `agentic-mobile`               | `spec v1.0.0-draft` over MCP and A2A, untagged                                                                                              | Mobile in-app workflows                                                                                  | **no**, but named on the standards page |

ARTF v1.0 was released on 12 November 2025 as a Tech Lab standard, and it is the only ratified standard among the repositories with published code. The rest publish drafts or reference implementations; `agentic-direct`'s MCP handlers call `generateMockResponse`. No repository records a production adopter. ARTF's contributor list names Index Exchange, The Trade Desk, OpenX and Chalice, and `agentic-audiences` arrived as LiveRamp's proposal.

Those repositories publish 143 operations. One runs at serve time, `GetMutations` in ARTF; the other 142 sit in the control plane: discovery, avails, quotes, multi-round negotiation and deal booking. AdCP's FAQ [characterises AAMP as agentic bidding](https://agenticadlab.com/protocols/adcp-vs-aamp/).

## The official lists and the code name different repositories

The standards page names Agentic Mobile, Agentic Ad Object and Agentic Guardrails. Two of those three have no public repository: `IABTechLab/agentic-ad-object` and `IABTechLab/agentic-guardrails` return 404 on GitHub, and neither string appears in the published code. Agentic Mobile is real and public, since 18 November 2025, and the hub README does not mention it.

`seller-agent/pyproject.toml` and `buyer-agent/pyproject.toml` share a line.

```toml
"iab-agentic-primitives[client] @ git+https://github.com/IABTechLab/iab-agentic-primitives.git@v0.5.0",
```

Both reference agents hard-pin `iab-agentic-primitives` at an exact tag, and it appears on neither official list. Its own README states that it is unreleased, unstable and subject to change without notice.

The hub README has not been edited since 16 April 2026, and the two agents it lists have since diverged: seller-agent v2.4.1 landed on 5 August, and buyer-agent's newest tag is v2.3.0 from 22 July. The [version matrix](https://aampexplorer.com/versions/) tracks the drift.

The [agent registry](/agents/agent-registry/) has no published specification behind it either. Seller-agent v2.4.1 ships two registry clients: `AampApiRegistryClient`, which talks to a live IAB registry over Bearer JWT when `AAMP_REGISTRY_URL` is set, and a legacy stub, "stubbed pending the public AAMP API specification", which is what an unconfigured deployment gets.

Terms taken from AAMP — [quote](/negotiation/quote/), negotiation round, [trust status](/negotiation/trust-status/) — describe how IAB Tech Lab's own agents behave at a tag, and any of them can change on the next minor without deprecation.

[AdCP](/concepts/adcp/) is the other stack rather than a counterpart to the umbrella: one repository, one stable release, 64 registered operations. AAMP is a label over repositories that share no type with each other, so there is nothing to line up at the umbrella level. AdCP's FAQ names AAMP, and [no file published under AAMP names AdCP](https://agenticadlab.com/protocols/adcp-vs-aamp/); object by object the comparison is tractable, which is what the [terminology lookup](/concepts/adcp-vs-aamp-terminology/) does.

Repository-by-repository detail is in [AAMP Explorer](https://aampexplorer.com/repos/). Related terms: [quote](/negotiation/quote/), [deal](/negotiation/deal/), [agent registry](/agents/agent-registry/), [OpenDirect 2.1](/concepts/opendirect/), [ARTF intent](/realtime/artf-intent/).
