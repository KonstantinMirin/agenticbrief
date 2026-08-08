---
title: 'Sources and Versions — How These Definitions Are Sourced'
description: 'Every definition on this glossary names a repository, a commit and a file. The AdCP and AAMP version pins, the reference-implementation caveat, and what is deliberately excluded.'
answer: 'Ad Tech Glossary sources every definition from a named specification repository at a pinned commit. AdCP terms come from published release 3.1.10; AAMP terms come from reference implementations, not ratified specifications.'
pubDate: 2026-08-09
term: 'Sources and Versions'
alternateNames: ['glossary methodology', 'editorial policy', 'version pinning']
category: protocol
cluster: gl-sources
keywords:
  - 'agentic advertising glossary sources'
  - 'adcp version pinning'
  - 'aamp repo versions'
  - 'glossary methodology advertising'
  - 'adcp 3.1.10 operations'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/latest.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://docs.adcontextprotocol.org/'
  - 'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/README.md'
  - 'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/pyproject.toml'
  - 'https://github.com/IABTechLab/buyer-agent/blob/0c3a1545e334a0dc6acf0a6722b554cc4a4503d6/pyproject.toml'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/embedding-exchange.md'
  - 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/'
related:
  - '/concepts/adcp/'
  - '/concepts/aamp/'
  - '/negotiation/quote/'
  - '/governance/policy-category/'
  - 'https://aampexplorer.noetis.dev/versions/'
  - 'https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/'
seeAlso: ['Ad Context Protocol', 'AAMP', 'Quote', 'Policy Category']
reviewState: cto-reviewed
---

## Why does a glossary need a sources page?

Because a definition without a source is an opinion, and this site is competing against two specification bodies that can define their own terms by fiat. The only thing an independent glossary can offer that they cannot is a definition that names the exact file it came from, at a commit you can check, including the places where the file contradicts itself.

Every entry here carries a version pin and a file path. If a definition on this site disagrees with the file it cites, the file wins and the page is wrong. That rule is what makes the rest of the glossary citable.

## Which AdCP version do these definitions use?

AdCP terms come from the published stable release **3.1.10**, parsed from the `dist/` tree of [`github.com/adcontextprotocol/adcp`](https://github.com/adcontextprotocol/adcp) at commit `f1a35aba734befa809e1fa780ad77c7edd614e96` (2026-08-06).

The version oracle is `dist/schemas/latest.json`, which reads:

```json
{ "latest": "3.1.10", "latest_stable": "3.1.10", "channel": "stable" }
```

The operation registry is `dist/schemas/3.1.10/index.json`, stamped `lastUpdated: 2026-08-04`, `published_version: 3.1.10`, `stability: stable`. It registers **64 operations** across ten protocol areas:

| Area                   | Operations |
| ---------------------- | ---------: |
| Governance             |         22 |
| Media Buy              |         11 |
| Creative               |          8 |
| Brand Protocol         |          6 |
| Account                |          5 |
| Sponsored Intelligence |          4 |
| Protocol               |          3 |
| Signals                |          2 |
| Trusted Match          |          2 |
| Compliance             |          1 |
| **Total**              |     **64** |

Three pitfalls in that repository, named here so no page on this site falls into them:

- **`static/schemas/source/` is not a release.** It is unreleased `main`, and its index carries a stale `3.1.1` stamp because the changesets tool only bumps it at release time. So does `package.json`. Neither is a version statement.
- **`sync_agent_notification_configs` exists on `main` and in no published release.** Where this site mentions it, it is labelled unreleased.
- **Counts are re-derived from `dist/`, never quoted from prose.** The number 64 above comes from summing the `tasks` and `operations` collections in `index.json`, not from a documentation page.

AdCP is published by AgenticAdvertising.org under Apache 2.0. Rendered documentation is at [docs.adcontextprotocol.org](https://docs.adcontextprotocol.org/).

## Which AAMP version do these definitions use?

There is no such thing as an AAMP version. AAMP is an umbrella over independently versioned repositories, and its own hub README states the model: "Each repository uses independent semantic versioning" with "Cross-repository alignment… via governance coordination."

Anyone writing "AAMP 2.3" is quoting a press number that matches no artifact. Here is what actually exists, at the commits every AAMP definition on this site was derived from:

| Repository               | Version at HEAD      | Commit    | HEAD date  | Kind                              |
| ------------------------ | -------------------- | --------- | ---------- | --------------------------------- |
| `AAMP` (hub)             | untagged             | `3b20e67` | 2026-04-16 | README index, 270 words           |
| `iab-agentic-primitives` | `v0.5.0-1-g2fc7029`  | `2fc7029` | 2026-07-28 | Shared wire contract, unreleased  |
| `seller-agent`           | `v2.4.1`             | `2bb7ebc` | 2026-08-05 | Reference implementation          |
| `buyer-agent`            | `v2.3.0-24-g0c3a154` | `0c3a154` | 2026-08-05 | Reference implementation          |
| `agentic-rtb-framework`  | `v1.0-1-g7f48161`    | `7f48161` | 2026-07-21 | Prose specification plus protobuf |
| `agentic-audiences`      | untagged             | `106ebd6` | 2026-07-27 | Draft specification               |
| `agentic-direct`         | untagged             | `915bda9` | 2026-01-27 | Demo implementation               |
| `registry-agent-example` | untagged             | `1ff8dda` | 2026-02-24 | 22-line sample                    |

Four of the eight carry no tag at all. `buyer-agent`'s `pyproject.toml` still declares `version = "0.1.0"` while its git tag says `v2.3.0`, so this site uses the tag.

The per-repository version matrix is maintained in full on [AAMP Explorer](https://aampexplorer.noetis.dev/versions/); the table above is the pin set these definitions were derived from.

## Why do AAMP definitions carry a reference-implementation warning?

Because almost none of them come from a ratified specification.

Of the eight repositories, one ships a prose specification (`agentic-rtb-framework`, whose spec file is named `Agentic_Real_Time_Framework_Version_1_0_FINAL.md`), one ships a draft (`agentic-audiences`, self-labelled "Draft v0.1" while living in a `specs/v1.0/` directory, and described in its own README as "LiveRamp's initial proposal"), and the rest are implementations or samples.

The vocabulary this glossary cares about most — Quote, Deal, Negotiation Round, Access Tier, Trust Status, Avails, Media Kit — is defined in `iab-agentic-primitives`, which both agent repositories pin at `v0.5.0` and which is **not listed in the AAMP hub README at all**. Its own README opens with:

> ⚠️ **WORK IN PROGRESS — NOT YET RELEASED.** This library is under active construction as part of the buyer/seller agent remediation. APIs, schemas, and package layout are unstable and will change without notice. It is **not yet an official IAB Tech Lab release** and should not be depended on for production use until this notice is removed.

That is the canonical wire contract for AAMP's control plane, describing itself. Every AAMP term page on this site repeats the caveat rather than burying it here, because a definition read in isolation should carry its own provenance.

Two further disclosures the corpus forces:

- **The acronym is not settled.** The AAMP corpus expands AAMP three different ways across the hub README and the agent repositories. This site does not pick a winner; the expansions and their file locations are documented at [AAMP Explorer](https://aampexplorer.noetis.dev/what-does-aamp-stand-for/).
- **Four files in the `agentic-audiences` specification tree are zero bytes**: `specs/roadmap.md`, `specs/v1.0/schema/agent_interface.schema.json` — the file that would connect that plane to the rest of AAMP — and both example payloads, `buyer_agent_request.json` and `seller_agent_response.json`. Where a term would depend on those files, this site says the specification does not define it.

## How are AdCP and AAMP compared here?

Carefully, and from outside both.

I grepped all eight IAB AAMP repositories for `adcp`, `adcontextprotocol`, `ad context protocol`, `sales agent`, `media_buy` and `get_products` across markdown, Python, JSON, TypeScript and YAML. Two hits, both coincidental: a Python method named `get_products()` in a seller-agent flow, and a test name. **Nothing in the AAMP corpus references AdCP.** The AdCP corpus is likewise not a source for claims about AAMP.

So every "AdCP has no X" or "AAMP has no Y" statement on this site is an absence I checked directly against a pinned tree, not a claim either body makes about the other. The full architectural comparison lives on [Agentic Ad Lab](https://agenticadlab.noetis.dev/protocols/adcp-vs-aamp/); this glossary handles term-to-term mapping.

## Which terms does this glossary deliberately exclude?

Commodity programmatic vocabulary gets no page here. CPM, CPC, DSP, SSP, GRP, reach, frequency and the generic programmatic deal types are defined competently by every ad-tech vendor, IAB, and by AdCP's own 123-entry glossary. Adding a 124th definition of CPM would be noise.

The exclusion is a policy, not an oversight, and it has a boundary. A commodity term appears here when a specification gives it a non-obvious encoding, and then it appears inside the entry that owns that encoding rather than as a page of its own. Two examples: money on the AAMP wire is an integer count of micros with float explicitly banned, which is covered on [Quote](/negotiation/quote/); AAMP's `PG`, `PD` and `PA` deal types map to specific OpenRTB `at` values, which is covered on [Deal](/negotiation/deal/).

The same rule kills a term that a source does not actually use. This glossary does not coin vocabulary. If a construct has no name in the file, it gets described, not named.

## How are corrections handled?

Corrections are welcome and are handled as re-derivation, not as patching prose.

1. A correction must name a file path and a commit. "This is wrong" without a source cannot be actioned; "at commit X, file Y says Z" can.
2. If the upstream file changed, the page is regenerated against the new pin and its version stamp moves. If the page misread a file that has not changed, the page is fixed and the pin stays.
3. Structural corrections — a term that lost its source, a repository that was renamed or absorbed — trigger a rewrite of the entry rather than an edit, because the finding itself has changed.
4. Every page carries a visible last-updated date that matches its JSON-LD `dateModified` and its sitemap `lastmod`. Those three agree or the build is wrong.

Send corrections to `hello@agenticadlab.com` with the file path and commit. Where the defect is upstream rather than here — a documentation table that disagrees with its own count, a schema pair with a missing half — the better fix is an issue on the specification repository, and this site links the file so that is easy to raise.

## Non-affiliation

Agentic Ad Lab is an independent editorial project. It is not affiliated with, sponsored by, or endorsed by AgenticAdvertising.org (AAO), IAB Technology Laboratory, or any of the companies contributing to their repositories. AdCP, AAMP, OpenRTB, OpenDirect, AdCOM and the IAB name are the property of their respective owners and are used here nominatively, to identify the specifications being described.

Specification text quoted on this site is quoted, attributed and linked to its source. This site does not republish upstream documentation; where a definition is short enough that quoting it is the honest thing to do, it is quoted with the file it came from.
