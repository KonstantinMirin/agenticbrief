---
title: 'About Agentic Ad Lab, our sources, and what we are not'
description: 'Who publishes this, how every protocol claim on these sites is sourced and version-pinned, how corrections work, and an explicit statement of non-affiliation with both standards bodies.'
answer: 'About Agentic Ad Lab: an independent editorial project documenting agentic advertising protocols from their source repositories. It is not affiliated with, or endorsed by, AgenticAdvertising.org or IAB Tech Lab.'
pubDate: 2026-08-09
cluster: hub-brand
keywords:
  - agentic ad lab
  - agentic advertising reference sources
  - adcp aamp editorial policy
citations:
  - 'https://github.com/adcontextprotocol/adcp'
  - 'https://github.com/IABTechLab/AAMP'
  - 'https://agenticadvertising.org/'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
related:
  - '/protocols/adcp-vs-aamp/'
  - 'https://adcpexplorer.noetis.dev/'
  - 'https://aampexplorer.noetis.dev/'
  - 'https://adtechglossary.noetis.dev/about/sources-and-versions/'
reviewState: cto-reviewed
---

## Who publishes this?

Agentic Ad Lab is written by Constantine Mirin, CEO of Postindustria, who builds agentic systems for
production use. The project exists because two groups are simultaneously defining how software agents
buy advertising, neither references the other, and there was no neutral place to read both.

## How is every claim sourced?

Every protocol statement on these sites is generated from, or checked against, the public
specification repositories, and each page prints the commit it was derived from. If a page says AdCP
has 64 operations, that number was counted in a file, and the page names the file.

Three rules govern what gets published:

**Read the published release, not the working branch.** AdCP ships releases under `dist/schemas/` and
develops on a branch whose version stamp is only bumped at release time. Reading the branch and
trusting its stamp produces a confidently wrong version number. Our pipeline reads
`dist/schemas/latest.json` and treats anything on the branch as an explicitly labelled preview.

**Say when a specification is silent.** Several AAMP files that would define the contract between its
components are zero bytes. The registry contract is documented as not finalised. Pages say so. A
reference that quietly fills a hole in a specification is worse than one that leaves it visible.

**Distinguish specification from implementation.** Most of what AAMP publishes lives in reference
implementations rather than ratified specifications. Every AAMP term page states which it is, because
that difference decides whether an implementer is obliged to match it.

## What are we not?

Not affiliated with AgenticAdvertising.org, which stewards AdCP, or with IAB Tech Lab, which publishes
AAMP. Nothing here is endorsed by either. "AdCP" belongs to AgenticAdvertising.org and "AAMP" and
"IAB" to IAB Tech Lab; they are used here to refer to those protocols, which is what the words are for.

Not a standards body, not a certification programme, and not a registry. All three already exist on
both sides, and competing with them would be both futile and unhelpful.

Not neutral about accuracy. Being even-handed between the two stacks does not mean reporting them as
equally documented when they are not, or treating a press-release version number as equivalent to a
git tag.

## How do corrections work?

These specifications move fast. AdCP's `dist/schemas/` already holds 63 published version directories,
and AAMP's repositories tag independently of each other, so any page here can go stale between a
release and our next parse.

If something is wrong, the fastest fix is to point at the file that contradicts it. Every page carries
the commit it was generated from, which makes disagreements resolvable rather than a matter of
opinion. Corrections are applied to the page, not appended to it.

## Is there a commercial interest?

Yes, and it is worth stating plainly rather than burying. Postindustria does protocol integration and
agent-readiness work, and this project makes that capability visible. That is the entire business
model here: no advertising, no affiliate links, no gated downloads, no sponsored placement in any
comparison.

The comparison pages are the place where that interest could most plausibly distort the writing, so
they are the ones written most carefully — from files, with the sources linked, and with the gaps in
both stacks named.
