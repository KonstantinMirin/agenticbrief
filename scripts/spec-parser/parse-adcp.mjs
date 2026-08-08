#!/usr/bin/env node
/**
 * Parse the AdCP spec repo into data/adcp-specs.json.
 *
 * WHICH TREE THIS READS, AND WHY IT MATTERS
 *
 * The repo has two schema trees and they disagree:
 *
 *   dist/schemas/<version>/    the PUBLISHED releases. dist/schemas/latest.json
 *                              names the current stable one.
 *   static/schemas/source/     the working tree on `main`. Its index.json carries
 *                              a stale version stamp because changesets only bumps
 *                              it at release time.
 *
 * Reading `static/` and believing its stamp produces a reference site that
 * confidently states the wrong version and documents operations that exist in no
 * shipped release. This parser therefore reads the published release by default,
 * and separately diffs it against `main` so the unreleased delta can be reported
 * as exactly that — a preview, labelled.
 *
 * Set ADCP_TREE=source to parse the working tree instead.
 *
 * Sources, in order of authority:
 *   dist/schemas/latest.json           which release is current
 *   dist/schemas/<v>/index.json        the operation registry for that release
 *   dist/schemas/<v>/**.json           the schemas those operations reference
 *   docs/**.mdx                        prose title + description per task
 *   docs/reference/glossary.mdx        curated term definitions
 *
 * Two rules the parser holds to:
 *   1. Nothing is invented. Every summary string comes from a file; where the
 *      spec has no description, the field is empty and the page says so rather
 *      than filling the gap with generated prose.
 *   2. Everything carries provenance — repo, commit, path — so a generated page
 *      can be checked against the source it claims to describe.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SchemaStore, firstSentence, slugify, toWireName } from './lib/jsonschema.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const REPO = process.env.ADCP_REPO ?? '/srv/ws/salesagent/adcp'
const TREE = process.env.ADCP_TREE ?? 'released'
const DOCS = join(REPO, 'docs')
const OUT = join(ROOT, 'data/adcp-specs.json')
const GITHUB = 'https://github.com/adcontextprotocol/adcp'

const SOURCE_ROOT = join(REPO, 'static/schemas/source')

/** Resolve which schema tree to read. */
function resolveSchemaRoot() {
  if (TREE === 'source') {
    return { root: SOURCE_ROOT, channel: 'unreleased-main', releaseVersion: null }
  }
  const latestFile = join(REPO, 'dist/schemas/latest.json')
  if (!existsSync(latestFile)) {
    return { root: SOURCE_ROOT, channel: 'unreleased-main', releaseVersion: null, fellBack: true }
  }
  const latest = JSON.parse(readFileSync(latestFile, 'utf8'))
  const version = latest.latest_stable ?? latest.latest
  const root = join(REPO, 'dist/schemas', version)
  if (!existsSync(join(root, 'index.json'))) {
    return { root: SOURCE_ROOT, channel: 'unreleased-main', releaseVersion: null, fellBack: true }
  }
  return { root, channel: latest.channel ?? 'stable', releaseVersion: version }
}

const {
  root: SCHEMA_ROOT,
  channel: CHANNEL,
  releaseVersion: RELEASE,
  fellBack,
} = resolveSchemaRoot()
const store = new SchemaStore(SCHEMA_ROOT)

function git(args) {
  try {
    return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

const COMMIT = git(['rev-parse', 'HEAD'])
const PARSED_AT = new Date().toISOString()

function provenance(sourcePath) {
  const rel = sourcePath ? relative(REPO, sourcePath) : undefined
  return {
    repo: GITHUB,
    commit: COMMIT,
    parsedAt: PARSED_AT,
    ...(rel ? { sourcePath: rel, sourceUrl: `${GITHUB}/blob/${COMMIT}/${rel}` } : {}),
  }
}

/** Recursively list files under a dir, tolerating absence. */
function walk(dir, filter = () => true, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, filter, acc)
    else if (filter(full)) acc.push(full)
  }
  return acc
}

/**
 * Frontmatter reader.
 *
 * AdCP doc pages carry a quoted "og:title" key whose value contains a colon,
 * so a naive `split(':')` mangles it. This handles quoted keys and quoted
 * values without pulling in a YAML dependency, which is all these files need.
 */
function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { data: {}, body: text }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*(?:"([^"]+)"|'([^']+)'|([\w.:-]+))\s*:\s*(.*)$/)
    if (!kv) continue
    const key = kv[1] ?? kv[2] ?? kv[3]
    let value = kv[4].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (value === 'true') value = true
    else if (value === 'false') value = false
    data[key] = value
  }
  return { data, body: text.slice(match[0].length) }
}

// ---------------------------------------------------------------- docs index

const DOC_FILES = walk(DOCS, (f) => f.endsWith('.mdx') || f.endsWith('.md'))

/** wire task name -> { path, title, description, body } */
const docsByTask = new Map()
const docsBySlug = new Map()

for (const file of DOC_FILES) {
  const raw = readFileSync(file, 'utf8')
  const { data, body } = frontmatter(raw)
  const slug = relative(DOCS, file).replace(/\.mdx?$/, '')
  const record = {
    file,
    slug,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    body,
  }
  docsBySlug.set(slug, record)
  // A task doc's frontmatter title IS the snake_case wire name.
  if (/^[a-z][a-z0-9_]*$/.test(record.title)) {
    docsByTask.set(record.title, record)
  }
}

/**
 * Some pages document several tasks at once (property_lists.mdx covers five).
 * Register those by scanning their headings for task names.
 */
for (const record of docsBySlug.values()) {
  for (const m of record.body.matchAll(/^#{2,3}\s+`?([a-z][a-z0-9_]{3,})`?\s*$/gm)) {
    const name = m[1]
    if (!docsByTask.has(name)) docsByTask.set(name, record)
  }
}

/** Pull fenced code blocks out of a doc body as worked examples. */
function examplesFromDoc(record, limit = 3) {
  if (!record) return []
  const out = []
  for (const m of record.body.matchAll(/```(\w+)[^\n]*\n([\s\S]*?)```/g)) {
    const language = m[1].toLowerCase()
    if (!['json', 'javascript', 'js', 'typescript', 'ts', 'python', 'bash'].includes(language))
      continue
    const code = m[2].trim()
    if (code.length < 40 || code.length > 4000) continue
    out.push({ title: `Example (${language})`, language, code })
    if (out.length >= limit) break
  }
  return out
}

// -------------------------------------------------------------- the registry

const index = JSON.parse(readFileSync(join(SCHEMA_ROOT, 'index.json'), 'utf8'))
const gaps = []

const AREA_TITLES = {
  'media-buy': 'Media Buy',
  creative: 'Creative',
  signals: 'Signals',
  protocol: 'Protocol',
  account: 'Accounts',
  governance: 'Governance',
  brand: 'Brand',
  'brand-protocol': 'Brand Protocol',
  'sponsored-intelligence': 'Sponsored Intelligence',
  'trusted-match': 'Trusted Match',
  compliance: 'Compliance',
  adagents: 'Agent Authorization',
}

const areas = []
const tasks = []

for (const [groupKey, group] of Object.entries(index.schemas ?? {})) {
  const operations = group.tasks ?? group.operations
  if (!operations) continue

  const taskNames = []

  for (const [key, entry] of Object.entries(operations)) {
    const wireName = toWireName(key)
    const requestRef = entry.request?.$ref
    const responseRef = entry.response?.$ref
    const requestSchema = requestRef ? store.load(requestRef) : null
    const responseSchema = responseRef ? store.load(responseRef) : null

    if (requestRef && !requestSchema) {
      gaps.push(`Unresolved request schema for ${wireName}: ${requestRef}`)
    }

    const doc = docsByTask.get(wireName)

    // Description precedence: the doc page's own description, then the request
    // schema's title/description. Never generated.
    const summary =
      firstSentence(doc?.description) ||
      firstSentence(requestSchema?.description) ||
      firstSentence(requestSchema?.title) ||
      ''

    if (!summary) gaps.push(`No description available for ${wireName}`)

    const sourcePath = requestRef ? store.refToPath(requestRef) : doc?.file

    tasks.push({
      name: wireName,
      title: wireName
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      area: groupKey,
      summary,
      description: doc?.description || requestSchema?.description || undefined,
      requestFields: store.fields(requestSchema),
      responseFields: store.fields(responseSchema),
      examples: examplesFromDoc(doc),
      mutatesState: Boolean(requestSchema?.['x-mutates-state']),
      status: requestSchema?.['x-status'] ?? undefined,
      requestSchemaId: requestSchema?.$id ?? requestRef ?? undefined,
      responseSchemaId: responseSchema?.$id ?? responseRef ?? undefined,
      docSlug: doc?.slug ?? undefined,
      slug: slugify(wireName),
      provenance: provenance(sourcePath),
    })
    taskNames.push(wireName)
  }

  const layer = (index.protocol_layers ?? []).find((l) => l.schema_groups?.includes(groupKey))

  areas.push({
    key: groupKey,
    title: AREA_TITLES[groupKey] ?? groupKey,
    summary: firstSentence(group.description ?? ''),
    layer: layer?.id,
    taskNames,
    provenance: provenance(join(SCHEMA_ROOT, 'index.json')),
  })
}

// ------------------------------------------------------------- core objects

const CORE_OBJECTS = [
  'core/product.json',
  'core/media-buy.json',
  'core/package.json',
  'core/creative-asset.json',
  'core/targeting.json',
  'core/format.json',
  'core/pricing-option.json',
  'core/error.json',
  'core/brand-ref.json',
  'core/account-ref.json',
]

const objects = []
for (const rel of CORE_OBJECTS) {
  const file = join(SCHEMA_ROOT, rel)
  if (!existsSync(file)) {
    gaps.push(`Expected core object missing: ${rel}`)
    continue
  }
  const schema = JSON.parse(readFileSync(file, 'utf8'))
  const name = rel
    .split('/')
    .pop()
    .replace(/\.json$/, '')
  objects.push({
    name,
    title: schema.title ?? name,
    summary: firstSentence(schema.description ?? ''),
    fields: store.fields(schema),
    slug: slugify(name),
    provenance: provenance(file),
  })
}

// ---------------------------------------------------------- discovery files

const discoveryFiles = []
for (const [name, rel, purpose] of [
  [
    'adagents.json',
    'adagents.json',
    'Publisher-hosted file declaring which sales agents are authorised to sell a property’s inventory.',
  ],
  [
    'brand.json',
    'brand.json',
    'Brand-hosted file declaring brand identity, agents and rights for buy-side discovery.',
  ],
]) {
  const file = join(SCHEMA_ROOT, rel)
  if (!existsSync(file)) {
    gaps.push(`Discovery file schema missing: ${rel}`)
    continue
  }
  const schema = JSON.parse(readFileSync(file, 'utf8'))

  // Both discovery files are `oneOf` unions rather than a single object — the
  // file has a different shape depending on what the host is declaring. The
  // flattener deliberately refuses to merge oneOf branches (that would claim
  // fields coexist when they never do), so each branch is surfaced as a named
  // variant instead.
  const variants = (schema.oneOf ?? []).map((branch, i) => {
    const resolved = branch.$ref ? store.load(branch.$ref) : branch
    return {
      name: resolved?.title ?? branch.title ?? `Variant ${i + 1}`,
      summary: firstSentence(resolved?.description ?? branch.description ?? ''),
      fields: store.fields(resolved),
    }
  })

  const fields = variants.length === 0 ? store.fields(schema) : []
  if (variants.length === 0 && fields.length === 0) {
    gaps.push(`Could not extract fields for discovery file ${name}`)
  }

  discoveryFiles.push({
    name,
    purpose: firstSentence(schema.description) || purpose,
    location: `https://<domain>/.well-known/${name}`,
    fields,
    variants,
    examples: (schema.examples ?? []).slice(0, 2).map((ex, i) => ({
      title: `${name} example ${i + 1}`,
      language: 'json',
      code: JSON.stringify(ex, null, 2),
    })),
    provenance: provenance(file),
  })
}

// ------------------------------------------------------------------ glossary

const glossary = []
const glossaryFile = join(DOCS, 'reference/glossary.mdx')
if (existsSync(glossaryFile)) {
  const { body } = frontmatter(readFileSync(glossaryFile, 'utf8'))

  // Entries open with "**Term**" at the start of a line. Some carry a
  // qualifier after the bold — "**Agent** (AdCP Context)" — so anchoring the
  // match to end-of-line drops them: that undercounted the glossary by 13.
  // Match the bold run at line start and keep any trailing qualifier as part of
  // the term.
  const matches = [...body.matchAll(/^\*\*([^*\n]+)\*\*([^\n]*)$/gm)]
  const seen = new Set()

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const qualifier = m[2].trim().replace(/[:—-]\s*$/, '')
    const term = `${m[1].trim()}${qualifier ? ` ${qualifier}` : ''}`.trim()

    // Body runs from the end of this heading to the start of the next entry or
    // the next section heading, whichever comes first.
    const start = m.index + m[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length
    const definition = firstSentence(
      body
        .slice(start, end)
        .split(/\n#{2,3}\s/)[0]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .trim(),
      400,
    )

    // A letter heading like "## A" is not a term, and a repeat is a formatting
    // artifact rather than a second entry.
    if (!term || term.length > 90 || !definition) continue
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    glossary.push({ term, definition, slug: slugify(term) })
  }
} else {
  gaps.push('docs/reference/glossary.mdx not found')
}

// ------------------------------------------------------------------- version

const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'))

if (fellBack) {
  gaps.push(
    'No published release tree found under dist/schemas — parsed the unreleased working tree instead. Every version number below is provisional.',
  )
}

/**
 * The unreleased delta.
 *
 * `main` runs ahead of the last release, so its operation set is a superset (or,
 * occasionally, a different set). Computing the difference explicitly means the
 * site can say "3.1.10 ships 64 operations; main adds one that has not shipped"
 * instead of quietly publishing an unreleased operation as though it were stable.
 * Nobody else tracks this, and getting it wrong is the fastest way to lose a
 * reference site's credibility.
 */
const unreleased = { addedInMain: [], removedInMain: [], sourceStamp: null }
if (RELEASE && existsSync(join(SOURCE_ROOT, 'index.json'))) {
  const sourceIndex = JSON.parse(readFileSync(join(SOURCE_ROOT, 'index.json'), 'utf8'))
  unreleased.sourceStamp = sourceIndex.published_version ?? null

  const namesIn = (idx) => {
    const set = new Set()
    for (const group of Object.values(idx.schemas ?? {})) {
      for (const key of Object.keys(group.tasks ?? group.operations ?? {})) {
        set.add(toWireName(key))
      }
    }
    return set
  }
  const releasedNames = namesIn(index)
  const mainNames = namesIn(sourceIndex)
  unreleased.addedInMain = [...mainNames].filter((n) => !releasedNames.has(n)).sort()
  unreleased.removedInMain = [...releasedNames].filter((n) => !mainNames.has(n)).sort()

  if (unreleased.sourceStamp && unreleased.sourceStamp !== RELEASE) {
    gaps.push(
      `The working tree's schema registry is stamped ${unreleased.sourceStamp} while the current published release is ${RELEASE}. The source stamp is stale — changesets only bumps it at release. Do not quote it as a version.`,
    )
  }
  for (const name of unreleased.addedInMain) {
    gaps.push(
      `${name} exists on main but is in no published release. It must be labelled unreleased wherever it appears.`,
    )
  }
}

if (pkg.version !== index.published_version) {
  gaps.push(
    `package.json is at ${pkg.version} while the parsed registry is ${index.published_version}. Expected when parsing a published release from dist/ — package.json tracks main.`,
  )
}

const spec = {
  id: 'adcp',
  name: 'AdCP',
  fullName: 'Ad Context Protocol',
  version: RELEASE ?? index.published_version ?? pkg.version,
  versionChannel: CHANNEL,
  /** what the site should print next to the version, verbatim */
  versionLabel: RELEASE
    ? `${RELEASE} (published ${CHANNEL})`
    : `${index.published_version} (unreleased working tree — not a shipped version)`,
  stability: index.stability,
  lastUpdated: index.lastUpdated,
  unreleased,
  governance: 'AgenticAdvertising.org (AAO)',
  license: 'Apache-2.0',
  homepage: 'https://adcontextprotocol.org/',
  docsHomepage: 'https://docs.adcontextprotocol.org/',
  repository: GITHUB,
  summary: firstSentence(index.description ?? '', 400),
  layers: (index.protocol_layers ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    description: firstSentence(l.description ?? '', 300),
    areaKeys: l.schema_groups ?? [],
  })),
  areas,
  tasks,
  objects,
  discoveryFiles,
  glossary,
  components: [],
  counts: {
    areas: areas.length,
    tasks: tasks.length,
    objects: objects.length,
    glossaryTerms: glossary.length,
    schemaFiles: walk(SCHEMA_ROOT, (f) => f.endsWith('.json')).length,
    docPages: DOC_FILES.length,
  },
  provenance: provenance(join(SCHEMA_ROOT, 'index.json')),
  gaps,
}

writeFileSync(OUT, `${JSON.stringify(spec, null, 2)}\n`)

console.log(
  `adcp-specs.json: v${spec.version} @ ${COMMIT.slice(0, 8)} — ` +
    `${spec.counts.tasks} tasks in ${spec.counts.areas} areas, ` +
    `${spec.counts.objects} core objects, ${spec.counts.glossaryTerms} glossary terms, ` +
    `${gaps.length} gaps`,
)
if (gaps.length) {
  console.log('gaps:')
  for (const g of gaps.slice(0, 12)) console.log('  -', g)
  if (gaps.length > 12) console.log(`  … and ${gaps.length - 12} more`)
}
