---
title: 'Agentic Ad Lab: independent analysis of AdCP and AAMP'
description: 'Independent analysis of the two agentic advertising stacks, AdCP and AAMP, written for agency leads and publishers with budget authority. What it argues, and who pays for it.'
answer: 'Agentic Ad Lab is an independent analysis site covering the two agentic advertising protocol stacks, AdCP and IAB Tech Lab AAMP, for buyers and publishers deciding which one to fund. It is published by Postindustria and affiliated with neither body.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: hub-entity
keywords:
  - agentic ad lab
  - independent adcp aamp analysis
  - agentic advertising reference sources
  - adcp aamp editorial policy
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/versions.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/intro.mdx'
  - 'https://adcontextprotocol.org/schemas/latest.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/versions'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://iabtechlab.com/agentic-advertising-matures-with-aamp-2-3/'
  - 'https://github.com/IABTechLab/buyer-agent/releases'
  - 'https://github.com/IABTechLab/seller-agent/releases'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/SANDBOX_REGISTRY.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/agent_interface.schema.json'
  - 'https://agenticadvertising.org/'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
  - 'https://adgentek.ai/blog/adcp-vs-aamp/'
  - 'https://www.crunchbase.com/person/konstantin-mirin-ce8f'
  - 'https://www.linkedin.com/in/konstantinmirin/'
  - 'https://github.com/KonstantinMirin'
  - 'https://postindustria.com/'
related:
  - '/'
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/services/'
  - 'https://adtechglossary.com/about/sources-and-versions/'
  - 'https://adcpexplorer.com/'
  - 'https://aampexplorer.com/'
  - 'https://whatisagenticbuying.com/about/'
  - 'https://briefgateway.com/'
reviewState: cto-reviewed
---

Two organisations are writing the rules for how software buys advertising, and neither one
acknowledges the other. If you hold a budget, that is a procurement question rather than a standards
question, and it has an answer this quarter: AdCP is the only one of the two publishing a released
contract you can write code against, so a pilot there is fundable now. AAMP's one finished
specification, ARTF, governs bid mutation inside a live auction. Everything else under the label is
code without a contract, and I would keep it on a watch list instead of a roadmap.

If you are scoping Q1, that is one integration to fund and one to leave off the roadmap, and
[the side-by-side](/protocols/adcp-vs-aamp/) prices both. What moves AAMP off the watch list is a
versioned AAMP release with a schema behind it. Until a tag exists at the AAMP level, there is
nothing to conform to.

Calling the two equally documented would be a lie. IAB Tech Lab announced AAMP 2.3 on 30 July 2026
and the string appears in no file in any of the eight AAMP repositories, which makes 2.3 a programme
milestone, not an artefact you can pin; [the version matrix](https://aampexplorer.com/versions/)
shows what does exist instead. `agentic-audiences` ships
`specs/v1.0/schema/agent_interface.schema.json` at zero bytes, the file whose name promises to define
the interface between buyer and seller agents. It defines nothing.

## Who writes Agentic Ad Lab

Constantine Mirin. I am CEO of [Postindustria](https://postindustria.com/) and I build agentic systems
that run in production. That is the qualification and the conflict, both. Public trail:
[LinkedIn](https://www.linkedin.com/in/konstantinmirin/),
[GitHub](https://github.com/KonstantinMirin),
[Crunchbase](https://www.crunchbase.com/person/konstantin-mirin-ce8f). The name appears as both
Constantine and Konstantin depending on which profile you land on. Same person, and the
transliterated spelling is what the LinkedIn and Crunchbase slugs use.

Staff of one. When a page here says "I", it means me, and it names the thing that would prove the
judgement wrong.

## Postindustria pays for this

Postindustria does protocol integration and agent-readiness work, and this site is the showroom for
it. The site sells nothing and takes no money from anyone it writes about, including for a place in a
comparison. The paid work is described at [/services/](/services/).

The comparison is where a commercial interest could most plausibly bend the writing, so it is the
page that carries the file paths and the linked sources. Adgentek, which publishes its own
AdCP-versus-AAMP piece, opens by disclosing that it is a founding member of the Ad Context Protocol,
which is the right way round to do it.

## The comparison is the page to read first

I run six sites on this subject, and this is the one that takes a side.

Fund one integration and watch the other, and [AdCP vs AAMP](/protocols/adcp-vs-aamp/) is where that
call gets made, with the licence and governance risk priced in. If you want the evidence that anyone
has done this for money before you sign off on it, [who is running agentic
buys](/guides/who-is-running-agentic-buys/) is the dated ledger of named deployments.

A publisher needs to know what to put on their own origin before a buying agent arrives. That turns
out to be one static file, and [agent discovery files](/guides/agent-discovery-files/) is the whole
of it, including the part of the schema that survives an agent domain being compromised. An
implementer needs field names instead: every registered AdCP operation has a page at
[AdCP Explorer](https://adcpexplorer.com/), [AAMP Explorer](https://aampexplorer.com/)
does the same across the eight AAMP repositories, holes included,
[the ad tech glossary](https://adtechglossary.com/) takes one term per page, and
[Brief Gateway](https://briefgateway.com/) turns a campaign brief into a validated
`get_products` request. [What Is Agentic Buying](https://whatisagenticbuying.com/) answers
that one question without assuming you care how it is specified.

## The builders already exist, so this documents their output

Both sides already run a standards body, a registry and a certification programme, and nobody needs a
third of each. AgenticAdvertising.org publishes a `brand.json` builder and an `adagents.json` builder,
both linked from AdCP's own intro page, and they are good. Documenting the fields they emit is more
useful than rebuilding them.

The subject is those two advertising stacks and the transports underneath them.
[MCP and A2A](https://adtechglossary.com/concepts/mcp-and-a2a/) are in scope, because AdCP
defines its planning-time operations over both and AAMP's `agentic-direct` puts OpenDirect 2.1 over
MCP. The commerce protocols are not. ACP and UCP standardise checkout, payments and fulfilment inside
an assistant, and AdCP's own glossary files them as the layer next to advertising rather than inside
it. Nothing here covers them.

AdCP is maintained by AgenticAdvertising.org, which its FAQ describes as "an independent specification
body — not a subsidiary or working group of IAB Tech Lab", and AAMP is published by IAB Tech Lab.

This site is affiliated with neither and endorsed by neither. "AdCP" belongs to
AgenticAdvertising.org, "AAMP" and "IAB" to IAB Tech Lab.

Both corpora move; every claim here is pinned to a commit. If something is wrong, point at the file
that contradicts it and mail **hello@agenticadlab.com**. The page gets edited.
