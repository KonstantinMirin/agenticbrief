---
title: 'State of the AdCP and AAMP Repositories'
description: 'A dated observation of what is actually committed to the agentic advertising repositories on 9 August 2026, with tags, commit dates and the adoption numbers that have named sources.'
answer: 'State of the AdCP and AAMP repositories on 9 August 2026: AdCP has a stable release, 3.1.10, registering 64 operations. AAMP has eight repositories, four untagged and four zero-byte spec files. IAB reports 21% of video buyers live.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
cluster: 'wiab-maturity'
keywords:
  [
    'is agentic buying real',
    'agentic buying adoption',
    'agentic advertising hype',
    'agentic buying production ready',
    'adcp maturity',
    'aamp maturity',
  ]
citations:
  [
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json',
    'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/CHANGELOG.md',
    'https://github.com/IABTechLab/AAMP',
    'https://github.com/IABTechLab/seller-agent',
    'https://github.com/IABTechLab/buyer-agent',
    'https://github.com/IABTechLab/agentic-rtb-framework',
    'https://github.com/IABTechLab/agentic-audiences',
    'https://github.com/IABTechLab/iab-agentic-primitives',
    'https://www.iab.com/news/u-s-digital-video-ad-spend-to-surpass-80b-in-2026/',
    'https://www.iab.com/insights/video-ad-spend-report-2026/',
    'https://www.dynatrace.com/news/press-release/pulse-of-agentic-ai-2026/',
    'https://digiday.com/podcasts/ces-2026-agentic-ai-hype-vs-media-buyers-pragmatism/',
    'https://digiday.com/marketing/digiday-programmatic-marketing-summit-may-recap-how-marketers-are-navigating-agentic-ad-buying/',
  ]
related:
  [
    '/',
    '/how-it-works/',
    '/agentic-buying-vs-programmatic/',
    '/about/',
    'https://agenticadlab.noetis.dev/protocols/aamp/',
    'https://aampexplorer.noetis.dev/versions/',
    'https://adcpexplorer.noetis.dev/',
  ]
reviewState: cto-reviewed
---

## Is agentic buying real yet?

Partly. One stack has a published, versioned schema registry. The other has reference implementations that work, a spec tagged `v1.0`, and four files that are literally empty. Buyer adoption is a real minority: not a rounding error, not a majority.

That is an observation, not a verdict. Everything below was read off local clones of the repositories on 9 August 2026. Where a number comes from a survey rather than a file, the survey is named and dated, and where I think the figure circulating in the trade press is wrong, I say so and give the primary one.

## What is actually in the AdCP repository on 9 August 2026?

AdCP's current published stable release is **3.1.10**. The version oracle is `dist/schemas/latest.json`, which reads `{"latest":"3.1.10","latest_stable":"3.1.10","channel":"stable"}`. The registry at `dist/schemas/3.1.10/index.json` stamps `lastUpdated` as 2026-08-04, declares `stability: stable`, and registers **64 operations**.

Watch out for the working branch. `package.json` and `static/schemas/source/index.json` on `main` still carry a `3.1.1` stamp, because the release tooling only bumps them at publish time. A 65th operation, `sync_agent_notification_configs`, exists on `main` and appears in no published release. Anyone quoting 65 operations, or a version of 3.1.1, has read the branch instead of the release.

Other things the repository says about itself:

- `dist/schemas/` holds 63 published version directories, from 2.5.0 up.
- Release 3.1.3 was **withdrawn**. The changelog describes 3.1.4 as "the corrective successor to withdrawn 3.1.3", restoring the 3.1.2 contract by removing a patch-ineligible field, with "exact 3.1.3 artifacts remain available as an immutable withdrawn release record". A standards body that withdraws a bad patch and keeps the record is behaving like a standards body.
- 7 of the 64 operations publish async response arms (`-async-response-submitted`, `-working`, `-input-required`): `build_creative`, `create_media_buy`, `get_products`, `get_signals`, `sync_catalogs`, `sync_creatives` and `update_media_buy`. Everything else is expected to answer inline.
- HEAD of the clone I read is `f1a35aba`, dated 2026-08-06.

## What is actually in the AAMP repositories on 9 August 2026?

There is no single AAMP version. The hub README states that each repository uses independent semantic versioning and that cross-repository alignment happens through governance coordination. Anyone printing "AAMP 2.3" as a version of the whole umbrella is quoting a press release, not an artifact.

| Repository               | Tag at HEAD                    | HEAD commit | Date       | What it contains                                                                                            |
| ------------------------ | ------------------------------ | ----------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `AAMP`                   | none                           | `3b20e67`   | 2026-04-16 | A README and a licence. That is the whole repository.                                                       |
| `agentic-direct`         | none                           | `915bda9`   | 2026-01-27 | An MCP manifest, `opendirect.json`, wrapping IAB OpenDirect 2.1. Handlers return mock data.                 |
| `buyer-agent`            | `v2.3.0` (HEAD is ahead of it) | `0c3a154`   | 2026-08-05 | Demand-side reference implementation. The largest documentation set in the corpus.                          |
| `seller-agent`           | `v2.4.1`                       | `2bb7ebc`   | 2026-08-05 | Supply-side reference implementation. 74 paths and 91 component schemas in its OpenAPI file.                |
| `registry-agent-example` | none                           | `1ff8dda`   | 2026-02-24 | One commit. `agent.ts` is 22 lines. It consumes a registry it does not specify.                             |
| `agentic-rtb-framework`  | `v1.0`                         | `7f48161`   | 2026-07-21 | A prose specification plus protobuf plus Go and Rust implementations. The most spec-shaped repository here. |
| `agentic-audiences`      | none                           | `106ebd6`   | 2026-07-27 | A draft embedding-exchange spec, a taxonomy, a scoring service. Contributed by LiveRamp.                    |
| `iab-agentic-primitives` | `v0.5.0` (HEAD is ahead of it) | `2fc7029`   | 2026-07-28 | The shared wire contract both agents depend on.                                                             |

Four findings from that table are worth stating plainly.

**Four files in `agentic-audiences` are zero bytes.** `specs/roadmap.md`, `specs/v1.0/schema/agent_interface.schema.json`, `specs/v1.0/examples/buyer_agent_request.json` and `specs/v1.0/examples/seller_agent_response.json` all have a length of zero. The second of those is the buyer/seller agent interface schema, which is the file that would connect the data plane to the rest of AAMP. It does not exist. Its own exchange spec is self-labelled "Draft v0.1" while living in a directory named `specs/v1.0/`.

**The canonical wire contract is unreleased.** `buyer-agent/pyproject.toml` and `seller-agent/pyproject.toml` both hard-pin `iab-agentic-primitives` at `v0.5.0`. That library defines the shared `Product`, `Money`, `Deal`, `Quote`, `Negotiation` and `Avails` types. Its README opens with: "WORK IN PROGRESS — NOT YET RELEASED. This library is under active construction... APIs, schemas, and package layout are unstable and will change without notice. It is not yet an official IAB Tech Lab release." It is also not listed in the AAMP hub README, so a reader working from the hub would not know it exists.

**The registry protocol is not finalised.** `seller-agent/docs/guides/agent-management.md` says the `AAMPRegistryClient` "will be updated once the AAMP spec is finalized".

**Every AAMP term comes from a reference implementation.** The trust lifecycle, the access tiers, the quote TTL, the negotiation actions: all of them are documented in the seller-agent and buyer-agent repositories, which are working code with generated docs, not ratified specifications. The full per-repo version matrix lives on [AAMP Explorer](https://aampexplorer.noetis.dev/versions/), and the acronym problem — the corpus expands AAMP four different ways — is documented at [what does AAMP stand for](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/).

## How many buyers are actually using agentic AI?

The best-sourced number I have found comes from IAB's own research. From the 2026 IAB Digital Video Ad Spend and Strategy Report: Part One, published 5 May 2026 and produced with Advertiser Perceptions and Guideline:

> Two in three buyers are live (21%), testing (20%), or planning to use (25%) agentic AI for digital video campaigns in 2026.

Read the composition, not the headline. Live is 21%. Testing and planning are intent, and intent converts unevenly. The report also notes a further 28% investigating. That framing supports "most of the market is looking at this", and it does not support "most of the market is doing this".

Scope matters too. The number covers digital video buyers using agentic AI in some capacity for campaigns, which is a wider claim than "buying media over an agent protocol". Nothing in the report says those 21% are sending `create_media_buy` calls.

## What is stopping agentic AI from reaching production?

Here I have a correction to make, and it is the reason this section exists.

Secondary coverage circulating in early 2026 attributes to a January 2026 Dynatrace report the claim that the top production barriers are security and data privacy at 59% and accuracy and reliability at 55%. I went to Dynatrace's own press release for The Pulse of Agentic AI 2026, published 22 January 2026. Those two figures do not appear in it. What appears is:

| Barrier to moving agentic AI into production                    | Share |
| --------------------------------------------------------------- | ----- |
| Security, privacy or compliance concerns                        | 52%   |
| Technical challenges to managing and monitoring agents at scale | 51%   |
| Shortage of skilled staff or training                           | 44%   |

The study surveyed 919 senior leaders and decision makers at enterprises with revenues above $100M, fielded by Y2 Analytics during November and December 2025. It also reports that roughly half of agentic AI projects are still at proof-of-concept or pilot stage, that 69% of agentic decisions are still verified by a human, and that only 13% of organisations run fully autonomous agents.

The themes in the secondary version were right. The numbers were not. If you have seen 59% and 55% quoted, they did not come from Dynatrace's own materials, and I could not trace them to a primary source. This is a general-purpose enterprise study rather than an advertising one, so treat it as background on why autonomous systems stall, not as a measure of ad-buying agents specifically.

## What did the buy side say at CES 2026?

Digiday's podcast episode of 13 January 2026, "CES 2026: Agentic AI hype vs. media buyers' pragmatism", is the cleanest summary of the gap between the stage and the desk. Digiday's executive editor of news, Seb Joseph, described buyers as finding agentic AI "more interesting than urgent", and added: "Everyone wants to do things faster, cheaper, better. But ultimately, that is about everything up until an ad is bought."

At Digiday's Programmatic Marketing Summit in May 2026, agency executives said they were not trusting programmatic activations to language-model agents, naming hallucination as the specific hesitation, and describing a decimal-point error in a live buy as a career-level risk. Agents were being kept to brainstorming and insight summarisation.

That is the honest state of the buy side: interested, funded, and not yet handing over the card.

## What would change this page?

I would rewrite it, not patch it, if any of the following happened.

If `agentic-audiences` fills its four zero-byte files, the claim that AAMP's data plane has no agent interface inverts. If `iab-agentic-primitives` is renamed, absorbed into another repository, or given a release, the unlisted-unreleased-dependency finding disappears. If IAB Tech Lab publishes a ratified specification distinct from the reference implementations, the "every AAMP term comes from working code" line stops being true. If AdCP publishes a 3.2 line, every operation count on this page needs re-deriving against `dist/schemas/latest.json`.

The [method page](/about/) explains how these checks are re-run and what happens when the repositories move under this page. The definition problem behind all of it is on [what is agentic buying](/).
