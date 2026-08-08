# Agentic Brief — website portfolio

Six static Astro sites documenting agentic advertising protocols from their source repositories.
Built on the patterns of the mirin.pro blog (see `/srv/ws/out/blog-process-summary.md` §13), with the
gaps that blog leaves open filled in: JSON-LD, per-page OG cards, `llms.txt`, and a content linter that
enforces the blog's voice rules in CI.

| Site                   | Staging                          | Role                                                           | Pages |
| ---------------------- | -------------------------------- | -------------------------------------------------------------- | ----- |
| Agentic Ad Lab         | `agenticadlab.noetis.dev`        | Hub. Protocol-neutral. Owns the AdCP-vs-AAMP comparison.       | 10    |
| Brief Gateway          | `briefgateway.noetis.dev`        | What an agent-readable campaign brief is.                      | 7     |
| AdCP Explorer          | `adcpexplorer.noetis.dev`        | All 64 AdCP operations, generated from the published registry. | 22    |
| AAMP Explorer          | `aampexplorer.noetis.dev`        | What IAB Tech Lab has actually published, including the holes. | 14    |
| What Is Agentic Buying | `whatisagenticbuying.noetis.dev` | One question, answered honestly.                               | 6     |
| Ad Tech Glossary       | `adtechglossary.noetis.dev`      | 36 terms, each traced to a spec file and version-pinned.       | 46    |

## Layout

```
sites/<site>/          one Astro app per site; content comes from ../../content
packages/shared-ui/    layouts, nav, answer box, field tables, the site registry
packages/seo/          JSON-LD builders, <head>, sitemap config, llms.txt, OG cards
packages/content-utils/ collection schemas, the publish gate, feed helpers
packages/protocol-data/ typed accessors over data/*.json
content/               markdown, shared across sites — one page, one home
data/                  parsed spec data + the semantic core
scripts/               spec parsers, OG generator, content linter, deploy
```

## Commands

```bash
npm install
npm run data:all        # re-parse AdCP + AAMP into data/*.json
npm run build           # turbo, all six sites
npm run lint:content    # the voice + GEO linter
npm run quality         # format check + content lint + typecheck
npm run deploy          # build, generate OG cards, publish, reload Caddy
```

## Three things that will bite you

**1. Parse the published AdCP release, not the working tree.** `/srv/ws/salesagent/adcp` has two schema
trees. `dist/schemas/latest.json` names the current stable release (3.1.10, 64 operations).
`static/schemas/source/` is the branch, and its `index.json` still says 3.1.1 because changesets only
bumps it at release. Reading the branch and trusting its stamp produces a site that confidently states
the wrong version and documents an operation that has never shipped. `parse-adcp.mjs` reads the
release by default and reports the branch delta separately; `ADCP_TREE=source` overrides.

**2. AAMP has no version.** Eight repositories, eight version schemes, three expansions of the acronym,
and four zero-byte files in its specification tree. Any page stating an umbrella AAMP version is wrong.
`parse-aamp.mjs` records every gap it finds in `gaps[]`, and the sites render them.

**3. Caddy on this box is 2.6.2.** The `{args[N]}` snippet placeholder does not exist before 2.7. Under
2.6 it is not substituted, `caddy validate` passes, and `root` silently becomes a literal path that
serves nothing. The Caddyfile therefore uses explicit per-host blocks. If you refactor it into a
snippet, verify with `curl -s http://127.0.0.1:2019/config/ | jq '..|objects|select(.root?)|.root'`
rather than trusting `validate`.

## The publication workflow

Mirrors the blog's, with the mechanical half automated:

1. **Draft** into `content/<collection>/<slug>.md` with `reviewState: draft`.
2. **Language correction** — `npm run lint:content` enforces the blog's banned words, banned phrases,
   em-dash spacing, description length and the 40-word answer rule. Errors fail the build.
3. **CTO review** — the rubric in `/srv/ws/out/blog-process-summary.md` §7, run with fresh context.
   Set `reviewState: cto-reviewed`.
4. **Publish** — only `cto-reviewed` and `published` entries render in production. Same predicate as
   the blog's `draft: true`, in one place (`packages/content-utils/src/index.ts`) rather than four.

## Deployment

Static files served from `/srv/www/<site>` by Caddy, behind Authelia (`one_factor`), with
`X-Robots-Tag: noindex` — these are staging previews of sites intended for their own `.com` domains,
and an indexed staging host would compete with the production domain later.

Related documents: `/srv/ws/out/content-framework.md` (the plan), `/srv/ws/out/semantic-core-reviewed.md`
(the plan after adversarial review, plus the kill list), `/srv/ws/inbox/e2e-testing-brief.md` (how to
test this).
