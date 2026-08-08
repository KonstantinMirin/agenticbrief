---
title: 'About, Method and Non-Affiliation'
description: 'How this site checks its claims, which repository commits it reads, what it deliberately refuses to do, and its relationship to AgenticAdvertising.org and IAB Tech Lab, which is none.'
answer: 'About, method and non-affiliation: this site is written from local clones of the AdCP and IAB Tech Lab repositories, pinned to named commits. It is independent of AgenticAdvertising.org and IAB Tech Lab.'
pubDate: 2026-08-09
cluster: 'wiab-term'
keywords:
  [
    'whatisagenticbuying sources',
    'agentic buying methodology',
    'agentic buying non-affiliation',
    'adcp source of truth',
  ]
citations:
  [
    'https://github.com/adcontextprotocol/adcp',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json',
    'https://github.com/IABTechLab/AAMP',
    'https://adcontextprotocol.org/',
    'https://agenticadvertising.org/',
    'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/',
    'https://www.dynatrace.com/news/press-release/pulse-of-agentic-ai-2026/',
  ]
related:
  [
    '/',
    '/maturity/',
    '/how-it-works/',
    '/agentic-buying-vs-programmatic/',
    'https://agenticadlab.noetis.dev/about/',
    'https://adtechglossary.noetis.dev/about/sources-and-versions/',
  ]
reviewState: cto-reviewed
---

## What is this site for?

One question, answered as well as I can answer it: what is agentic buying?

That is the whole scope. Four content pages and this one. The domain is an exact-match answer domain, and the only reason such a domain deserves to exist is if it holds the single best answer to its own question. Adding a blog would make it worse.

The reason the question needs a site at all is that the honest answer is uncomfortable. The term is contested, the only formal definition comes from one of the two competing standards camps, and that camp's own glossary declines to include it. Most writing about agentic buying opens with a confident definition. A confident definition is the wrong answer here, and being right about that is the point of the site.

## How are the claims on this site checked?

By reading files, on disk, at a named commit.

The AdCP claims come from a clone of `github.com/adcontextprotocol/adcp` at commit `f1a35aba734befa809e1fa780ad77c7edd614e96`, dated 2026-08-06. The AAMP claims come from clones of the eight IAB Tech Lab agentic repositories, with each repository's tag and HEAD commit printed in the table on the [maturity page](/maturity/).

Three rules govern how those files are read.

**The version oracle is `dist/schemas/latest.json`.** For AdCP, that file names the current published stable release, and `dist/schemas/<version>/index.json` is the operation registry. The working branch is not the release. `package.json` and `static/schemas/source/index.json` on `main` carry a stale `3.1.1` stamp because the release tooling only bumps them at publish time, and a 65th operation exists on `main` that has never shipped. Every operation count on this site is re-derived from `dist/` before publication. If you see a page anywhere claiming AdCP 3.1.1 or 65 operations, it read the branch.

**AAMP has no umbrella version.** Each repository versions independently, which the AAMP hub README states as its release model. Per-repo tags and commit dates are printed instead. "AAMP 2.3" is a press-release number with no corresponding artifact, and it does not appear on this site as a version.

**Every AAMP term is sourced from a reference implementation, not a ratified specification.** The trust lifecycle, the access tiers, the quote TTL, the negotiation actions: all of them are documented inside working code repositories with generated documentation. They describe what IAB Tech Lab's reference agents do. They are not normative standards text, and this site never presents them as such.

## What are the rules for numbers on this site?

Every numeric claim carries a named, dated source, and the source URL is in the page's citations. Where the number is a survey figure rather than something I read out of a file, the page says which survey, who ran it, when it was fielded, and what the sample was.

When a number circulating in secondary coverage does not match its primary source, this site prints the primary figure and flags the discrepancy. That already happened once. Trade coverage credited a January 2026 Dynatrace report with production-barrier figures of 59% and 55%. Dynatrace's own press release gives 52% and 51%, against different question wording, from a survey of 919 senior leaders fielded by Y2 Analytics. The [maturity page](/maturity/) shows the correction with both sources.

Nothing here carries a search-volume figure, a market-size projection or a growth forecast that I have not traced to a named publisher.

## What does this site refuse to do?

It does not invent protocol facts. If a claim can't be traced to a file, a schema, a commit or a named publication, either it isn't written or the page says "the specification does not say". That phrase appears in these pages on purpose.

Contradictions that belong to the source stay unresolved here. The AAMP corpus expands its own acronym four different ways across its repositories. This site discloses that and points at the [full evidence](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/) rather than picking a winner. Deciding which expansion is correct is IAB Tech Lab's job.

No page here predicts how long anything takes: no implementation timelines, no adoption forecasts, no "by the end of the year" claims.

And there is no AdCP-versus-AAMP comparison table. That comparison belongs to [Agentic Ad Lab](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/), which publishes it in full with payloads. Duplicating it here would make both worse.

## Is this site affiliated with AgenticAdvertising.org or IAB Tech Lab?

No. This site is independent of both.

AdCP, the Ad Context Protocol, is a specification maintained by AgenticAdvertising.org and published under Apache 2.0. AAMP and the agentic repositories referenced here are published by IAB Tech Lab. Neither organisation has reviewed, endorsed, sponsored or approved anything on this site. All trademarks and specification content belong to their respective owners, and are used here nominatively, to refer to the specifications being described.

Where this site quotes a specification, it quotes it, with a file path and a link to the source, rather than paraphrasing it into something that reads like our own claim. Where it disagrees with a specification's framing — as it does with the FAQ sentence that defines agentic buying — it says which document it is disagreeing with and why.

## How do I report an error?

Tell me which file, which line, and what it actually says. That is the only correction format that is faster to act on than to argue about.

Corrections are made in place, and any page whose factual basis changes gets its `updatedDate` moved and, where the underlying finding has inverted rather than shifted, gets rewritten rather than patched. The [maturity page](/maturity/) lists the specific repository changes that would trigger a rewrite of that page: the four zero-byte files in `agentic-audiences` gaining content, `iab-agentic-primitives` being released or absorbed, IAB Tech Lab publishing ratified specification text, or AdCP shipping a 3.2 line.

Because the repositories move faster than any publishing schedule, treat every claim here as stamped with the date at the top of its page. If you are making a purchasing or engineering decision, re-run the checks. All of them are `git clone`, `grep` and reading a JSON file. That is the whole method, and it is deliberately cheap to repeat.
