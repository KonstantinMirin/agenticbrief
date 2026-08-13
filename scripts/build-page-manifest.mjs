#!/usr/bin/env node
/**
 * Build the per-page manifest the content-rewrite workflow runs over.
 *
 * One entry per publishable page: where its markdown lives, what URL it gets on
 * which site, and the keyword cluster from data/seo-keywords.json that it owns.
 * The cluster is looked up from the semantic core rather than trusted from the
 * page's own frontmatter -- several pages carry cluster ids that were renamed
 * during the adversarial review and no longer exist in the core.
 *
 *   node scripts/build-page-manifest.mjs            # all sites
 *   node scripts/build-page-manifest.mjs agenticadlab
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const core = JSON.parse(readFileSync(join(ROOT, 'data/seo-keywords.json'), 'utf8'))

/** cluster id -> the cluster object, across every site. */
const CLUSTERS = new Map()
for (const [site, sv] of Object.entries(core.sites)) {
  for (const c of sv.clusters) CLUSTERS.set(c.id, { ...c, site })
}

/**
 * Cluster ids that drifted. Frontmatter on the left, the semantic core on the
 * right. Left untouched in the content files -- the rewrite fixes them there.
 */
const CLUSTER_ALIASES = {
  'gl-aamp': 'gl-stacks',
  'gl-adcp': 'gl-stacks',
  'hub-brand': 'hub-entity',
  'hub-discovery': 'hub-discovery-trust',
  'hub-standards-index': 'hub-landscape',
}

const glossarySections = {
  // section -> terms, mirroring sites/adtechglossary/src/lib/sections.ts
}

function fm(file, key) {
  const raw = readFileSync(join(ROOT, file), 'utf8')
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return undefined
  const m = block[1].match(new RegExp(`^${key}\\s*:\\s*(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined
}

/** Pages whose frontmatter cluster is simply wrong about which cluster they own. */
const CLUSTER_OVERRIDES = {
  'content/guides/agentic-buying-about.md': 'wiab-trust',
}

function clusterFor(file) {
  if (CLUSTER_OVERRIDES[file]) return CLUSTER_OVERRIDES[file]
  const raw = fm(file, 'cluster')
  const id = CLUSTER_ALIASES[raw] ?? raw
  return CLUSTERS.get(id) ? id : raw
}

/** Compact, promptable rendering of a cluster: what this page has to rank for. */
function clusterBrief(id) {
  const c = CLUSTERS.get(id)
  if (!c) return `Cluster "${id}" is not in the semantic core. Target the page subject directly.`
  const lines = [
    `Cluster: ${c.id} — ${c.label}`,
    `Pillar path: ${c.pillarPath}`,
    `Primary keyword: "${c.primary.keyword}" (${c.primary.intent} intent) -> owned by ${c.primary.ownedBy}`,
  ]
  if (c.primary.competitors?.length)
    lines.push(`Ranking incumbents: ${c.primary.competitors.join(', ')}`)
  if (c.supporting?.length) {
    lines.push('Supporting keywords:')
    for (const s of c.supporting) lines.push(`  - "${s.keyword}" (${s.intent}) -> ${s.ownedBy}`)
  }
  if (c.note) lines.push(`Strategy note: ${c.note}`)
  return lines.join('\n')
}

const glossaryPath = (slug) => {
  const sections = JSON.parse(readFileSync(join(ROOT, 'scripts/.glossary-sections.json'), 'utf8'))
  return sections[slug] ?? `/concepts/${slug}/`
}

// --------------------------------------------------------------- page tables

const HUB_ROUTES = {
  'adcp-vs-aamp': '/protocols/adcp-vs-aamp/',
  'agentic-advertising-standards-landscape': '/protocols/',
  'aamp-what-iab-has-published': '/protocols/aamp/',
  'protocol-integration-services': '/services/',
  'about-agentic-ad-lab': '/about/',
}

const BG_ROUTES = {
  'index-generator': '/',
  spec: '/spec/',
  'brief-vs-filters': '/spec/brief-vs-filters/',
  'creative-brief-to-adcp': '/crosswalk/creative-brief-to-adcp/',
  'adcp-brief-vs-aamp-campaign-brief': '/compare/adcp-brief-vs-aamp-campaign-brief/',
}

function page(site, file, route, type) {
  const id = file.split('/').pop().replace(/\.md$/, '')
  const cluster = clusterFor(file)
  return {
    site,
    id,
    contentPath: file,
    route,
    type,
    title: fm(file, 'title'),
    cluster,
    clusterBrief: clusterBrief(cluster),
    draftDir: `drafts/${site}/${id}`,
  }
}

const md = (dir) =>
  readdirSync(join(ROOT, 'content', dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `content/${dir}/${f}`)

const pages = []

// hub
pages.push(
  page(
    'agenticadlab',
    'content/comparisons/adcp-vs-aamp.md',
    HUB_ROUTES['adcp-vs-aamp'],
    'comparison',
  ),
)
for (const f of md('guides')) {
  const id = f.split('/').pop().replace(/\.md$/, '')
  if (/^(agentic-buying-|brief-)/.test(id)) continue
  if (id === 'adcp-brief-vs-aamp-campaign-brief') continue
  pages.push(page('agenticadlab', f, HUB_ROUTES[id] ?? `/guides/${id}/`, 'guide'))
}

// briefgateway
for (const f of md('briefs')) {
  const id = f.split('/').pop().replace(/\.md$/, '')
  pages.push(page('briefgateway', f, BG_ROUTES[id] ?? `/examples/${id}/`, 'brief'))
}
for (const f of [
  'content/comparisons/creative-brief-to-adcp.md',
  'content/comparisons/adcp-brief-vs-aamp-campaign-brief.md',
]) {
  const id = f.split('/').pop().replace(/\.md$/, '')
  pages.push(page('briefgateway', f, BG_ROUTES[id], 'comparison'))
}
pages.push(
  page(
    'briefgateway',
    'content/guides/brief-vs-filters.md',
    BG_ROUTES['brief-vs-filters'],
    'guide',
  ),
)

// whatisagenticbuying
for (const f of md('guides')) {
  const id = f.split('/').pop().replace(/\.md$/, '')
  if (!id.startsWith('agentic-buying-')) continue
  const slug = id === 'agentic-buying-vs-programmatic' ? id : id.slice('agentic-buying-'.length)
  const route = id === 'agentic-buying-answer' ? '/' : `/${slug}/`
  pages.push(page('whatisagenticbuying', f, route, 'guide'))
}

// adtechglossary
const sectionMap = JSON.parse(readFileSync(join(ROOT, 'scripts/.glossary-sections.json'), 'utf8'))
for (const f of md('glossary')) {
  const id = f.split('/').pop().replace(/\.md$/, '')
  pages.push(page('adtechglossary', f, sectionMap[id] ?? `/concepts/${id}/`, 'glossary'))
}

const only = process.argv[2]
const out = only ? pages.filter((p) => p.site === only) : pages

writeFileSync(join(ROOT, 'drafts/page-manifest.json'), JSON.stringify(pages, null, 2))
console.log(JSON.stringify(out, null, 2))
console.error(
  `\n${out.length} page(s)${only ? ` for ${only}` : ''}; manifest written to drafts/page-manifest.json`,
)
