---
title: 'Protocol Integration and Agent Readiness Work'
description: 'What Agentic Ad Lab does for hire: AdCP and AAMP integration reviews, agent readiness audits, discovery-file validation, and buyer or seller agent builds.'
answer: 'Agentic Ad Lab does protocol integration work: AdCP and AAMP implementation reviews, agent readiness audits, discovery-file validation, and buyer or seller agent builds. Contact hello@agenticadlab.com.'
pubDate: 2026-08-09
cluster: 'hub-services'
keywords:
  - 'agentic advertising consulting'
  - 'adcp implementation partner'
  - 'buyer agent development'
  - 'agentic readiness audit'
citations:
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/IABTechLab/seller-agent'
related:
  - '/protocols/adcp-vs-aamp/'
  - '/protocols/aamp/'
  - '/guides/agent-discovery-files/'
  - '/guides/what-agentic-ad-protocols-dont-standardize/'
  - '/about/'
reviewState: cto-reviewed
---

## What is the work?

Four things, all of which start from reading the specifications rather than from a deck.

**Implementation review.** You have started an AdCP or AAMP integration and want a second reader on it. I check the payloads against the released schemas, flag deprecated fields, and check that the operations you have implemented match the requirement level for your role in `docs/protocol/required-tasks.mdx`.

**Agent readiness audit.** A written assessment of what a publisher, agency or platform would have to change to expose or consume an agent interface. It covers discovery files, transport choice, authorization scope, and which of the 64 AdCP operations your role actually needs.

**Discovery file work.** Writing and validating `adagents.json` and `brand.json`, including delegation scoping and managed-network cases. This is the cheapest useful thing most publishers can do, and it is frequently wrong on the first attempt.

**Buyer or seller agent builds.** Building against the protocol rather than against a vendor SDK, so the result survives the next release.

## Who is it for?

Publishers and platforms deciding whether to expose a sales agent. Agencies and buy-side platforms deciding whether to build a buyer agent or wait. Ad tech vendors who need someone outside the standards process to read the specifications and tell them what is actually in scope.

The common case is an organisation that has read both stacks' marketing, can't tell how much of either is real, and needs that answered before it commits engineering time. That is the same question this site answers in public; the paid version is answered against your architecture.

## What this is not

Not affiliated with AgenticAdvertising.org or IAB Tech Lab, and not a certification. Neither organisation has reviewed or endorsed this work.

Not media buying. I don't plan, buy or resell inventory, and I take no commission on spend.

Not a recommendation to adopt. On several engagements the honest answer is that AAMP's registry contract is not finalized and AdCP's operation set for your role is small enough to wait a release. If that is what the files say, that is what the report says.

Not a retainer product with tiers. Each engagement is scoped to a question and a deliverable.

## How to get in touch

Email **hello@agenticadlab.com** with what you are building and which stack you are looking at. A short description of your role in the transaction and your current integration state is enough to tell you whether this is worth a call.

If you want to check the work first, [AdCP vs AAMP](/protocols/adcp-vs-aamp/) and [what neither stack standardises](/guides/what-agentic-ad-protocols-dont-standardize/) are the two pages that show the method.
