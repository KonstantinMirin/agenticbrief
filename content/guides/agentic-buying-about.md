---
title: 'About This Site and Who Pays for It'
description: 'What this site answers, who writes it, what he sells, and why neither of the two organisations writing the agentic advertising standards has any say over what appears here.'
answer: 'This site answers one question in plain English for people who buy or sell advertising: what agentic buying is, how it works, and how much of it is real. It is written by an operator who sells work in the field he writes about.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'wiab-trust'
keywords:
  ['whatisagenticbuying sources', 'agentic buying methodology', 'agentic buying non-affiliation']
citations:
  [
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/main/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/main/package.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx',
    'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md',
    'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/guides/agent-management.md',
    'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/agent_interface.schema.json',
    'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md',
    'https://agenticadvertising.org/',
    'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/',
    'https://iabtechlab.com/press-releases/iab-tech-lab-releases-aamp-2-3-bringing-enterprise-grade-infrastructure-and-privacy-diligence-to-agentic-advertising/',
    'https://www.dynatrace.com/news/press-release/pulse-of-agentic-ai-2026/',
  ]
related:
  [
    '/',
    '/maturity/',
    '/how-it-works/',
    '/agentic-buying-vs-programmatic/',
    'https://agenticadlab.com/about/',
    'https://agenticadlab.com/services/',
    'https://adtechglossary.com/about/sources-and-versions/',
  ]
reviewState: cto-reviewed
---

## What this site answers

[What agentic buying is](/), [how a buy actually runs](/how-it-works/), [how it differs from programmatic](/agentic-buying-vs-programmatic/), and [how much of it is real yet](/maturity/). It is written for someone who buys or sells advertising and heard the phrase at a conference.

Two figures get quoted everywhere with Dynatrace's name on them: 59% for security, 55% for accuracy. Neither is in Dynatrace's [own release](https://www.dynatrace.com/news/press-release/pulse-of-agentic-ai-2026/), and neither traces to any primary source. The [maturity page](/maturity/) prints the real numbers next to the phantom ones.

Where a primary source and the press coverage of it disagree here, the primary source wins, and no page on this site predicts a date. Where a specification says nothing on a point, the page says so and stops. Guessing produces a plausible sentence with nothing behind it.

## I sell work in this field

Constantine Mirin, chief executive of Postindustria, where I build agentic systems that have to survive production. That is how I ended up reading two advertising standards line by line.

I also sell work in this field, and that is the disclosure worth leading with. Agentic Ad Lab, the sister site to this one and the technical half of it, publishes [what that work is](https://agenticadlab.com/services/): integration and readiness reviews for companies deciding whether to expose a buying or a selling agent. That includes an audit of which of the 64 operations in AdCP — the protocol most live deployments run on — a given role actually needs. A sales agent selling media is required to implement seven of them, and a buy-side orchestrator implements none and calls them instead.

Non-affiliation costs me nothing. An invoice could bend a page.

## Neither standards body has any say over this

Two organisations are writing the rules. AgenticAdvertising.org maintains AdCP under Apache 2.0 and claims 123+ members on [its homepage](https://agenticadvertising.org/), Yahoo, PubMatic and Scope3 among them. IAB Tech Lab publishes [AAMP](https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/) and the reference implementations under it.

Neither is a client. I am a member of neither, and nobody at either has read a word of this, let alone approved it. Trademarks belong to their owners.

There is no AdCP-versus-AAMP table on this site. That comparison lives at [Agentic Ad Lab](https://agenticadlab.com/protocols/adcp-vs-aamp/) with the payloads attached, and a thinner copy of it here would make both worse.

## How to report an error

Send the page, the sentence, and what it should say instead, to hello@agenticadlab.com. If the defect is upstream and the specification itself is wrong, an issue on that repository fixes more than a correction here does.
