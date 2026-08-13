#!/usr/bin/env node
/**
 * Parse the IAB Tech Lab AAMP corpus into data/aamp-specs.json.
 *
 * AAMP is not one repository and not one version. It is an umbrella over
 * independently versioned projects across three planes that share no types, so
 * this parser reads eight repos and reconciles them rather than walking a
 * single registry the way the AdCP parser does.
 *
 *   Control plane   iab-agentic-primitives  canonical wire contract (JSON Schema)
 *                   seller-agent            OpenAPI 3.1, 74 paths
 *                   buyer-agent             OpenAPI 3.1, 13 paths
 *                   agentic-direct          MCP manifest over OpenDirect 2.1
 *   Real-time plane agentic-rtb-framework   prose spec + protobuf (ARTF)
 *   Data plane      agentic-audiences       embedding exchange JSON Schema (draft)
 *
 * The parser is written to report absence as loudly as presence. Several files
 * in the corpus are zero bytes, the hub README contradicts its own children on
 * what AAMP stands for, and the registry contract is explicitly unfinalised.
 * Those land in `gaps` and get rendered on the site, because a reference that
 * quietly papers over a hole in the spec is worse than no reference.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SchemaStore, firstSentence, slugify } from './lib/jsonschema.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const IAB = process.env.AAMP_ROOT ?? '/srv/ws/iab'
const OUT = join(ROOT, 'data/aamp-specs.json')
const PARSED_AT = new Date().toISOString()
const gaps = []

/** One line per repo, sourced from that repo's own README. */
const COMPONENT_PURPOSE = {
  AAMP: 'Umbrella index repository. Lists the component repos and states the release and governance model. README only.',
  'agentic-direct':
    'A2A and MCP wrapper over IAB OpenDirect 2.1, with a demo executor and browser client.',
  'buyer-agent':
    'Demand-side reference implementation: campaign brief intake, channel specialists, negotiation, booking.',
  'seller-agent':
    'Supply-side reference implementation: media kit, avails, quotes, negotiation, deals, order lifecycle.',
  'registry-agent-example':
    'A 22-line sample chat agent that talks to an external agent-registry MCP server. Defines nothing itself.',
  'agentic-rtb-framework':
    'ARTF: prose specification plus protobuf contract and Go and Rust implementations for serve-time bid mutations.',
  'agentic-audiences':
    'Draft embedding-exchange specification and taxonomy, contributed by LiveRamp, with a scoring service and a Prebid RTD example.',
  'iab-agentic-primitives':
    'The canonical shared wire contract imported by both reference agents. Not listed in the AAMP hub README.',
}

const REPOS = {
  AAMP: { gh: 'https://github.com/IABTechLab/AAMP', kind: 'hub' },
  'agentic-direct': {
    gh: 'https://github.com/IABTechLab/agentic-direct',
    kind: 'reference-implementation',
  },
  'buyer-agent': {
    gh: 'https://github.com/IABTechLab/buyer-agent',
    kind: 'reference-implementation',
  },
  'seller-agent': {
    gh: 'https://github.com/IABTechLab/seller-agent',
    kind: 'reference-implementation',
  },
  'registry-agent-example': {
    gh: 'https://github.com/IABTechLab/registry-agent-example',
    kind: 'example',
  },
  'agentic-rtb-framework': {
    gh: 'https://github.com/IABTechLab/agentic-rtb-framework',
    kind: 'specification',
  },
  'agentic-audiences': {
    gh: 'https://github.com/IABTechLab/agentic-audiences',
    kind: 'specification',
  },
  'iab-agentic-primitives': {
    gh: 'https://github.com/IABTechLab/iab-agentic-primitives',
    kind: 'specification',
  },
}

function git(repo, args) {
  try {
    return execFileSync('git', ['-C', join(IAB, repo), ...args], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

const COMMITS = {}
const TAGS = {}
for (const repo of Object.keys(REPOS)) {
  if (!existsSync(join(IAB, repo))) {
    gaps.push(`Repo not present locally: ${repo}`)
    continue
  }
  COMMITS[repo] = git(repo, ['rev-parse', 'HEAD'])
  TAGS[repo] = git(repo, ['describe', '--tags', '--always'])
}

function provenance(repo, absPath) {
  const commit = COMMITS[repo] ?? ''
  const rel = absPath ? relative(join(IAB, repo), absPath) : undefined
  return {
    repo: REPOS[repo]?.gh ?? repo,
    commit,
    parsedAt: PARSED_AT,
    ...(rel ? { sourcePath: rel, sourceUrl: `${REPOS[repo].gh}/blob/${commit}/${rel}` } : {}),
  }
}

/** Read + parse JSON, refusing zero-byte files rather than throwing on them. */
function readJson(path, label) {
  if (!existsSync(path)) {
    gaps.push(`Missing file: ${label ?? path}`)
    return null
  }
  if (statSync(path).size === 0) {
    gaps.push(`File is zero bytes and defines nothing: ${label ?? path}`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    gaps.push(`Unparseable JSON at ${label ?? path}: ${err.message}`)
    return null
  }
}

function listJson(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => join(dir, f))
}

// ------------------------------------------------- control plane: primitives

const PRIM = join(IAB, 'iab-agentic-primitives')
const primStore = new SchemaStore(join(PRIM, 'spec/jsonschema'))

const objects = []
for (const file of listJson(join(PRIM, 'spec/jsonschema'))) {
  const schema = readJson(file)
  if (!schema) continue
  const name = file
    .split('/')
    .pop()
    .replace(/\.json$/, '')
  objects.push({
    name,
    title: schema.title ?? name,
    summary: firstSentence(schema.description ?? ''),
    fields: primStore.fields(schema),
    plane: 'control',
    slug: slugify(name),
    provenance: provenance('iab-agentic-primitives', file),
  })
}

/**
 * The protocol/ directory pairs Request and Response schemas the same way
 * AdCP does, so the same request/response task model applies. Anything that is
 * not half of a pair is an envelope or a standalone message, and is recorded as
 * an object rather than invented into an operation.
 */
const tasks = []
const protocolFiles = listJson(join(PRIM, 'spec/jsonschema/protocol'))
const byBase = new Map()

for (const file of protocolFiles) {
  const base = file
    .split('/')
    .pop()
    .replace(/\.json$/, '')
  const m = base.match(/^(.*?)(Request|Response)$/)
  if (!m) {
    const schema = readJson(file)
    if (schema) {
      objects.push({
        name: base,
        title: schema.title ?? base,
        summary: firstSentence(schema.description ?? ''),
        fields: primStore.fields(schema),
        plane: 'control',
        slug: slugify(base),
        provenance: provenance('iab-agentic-primitives', file),
      })
    }
    continue
  }
  const entry = byBase.get(m[1]) ?? {}
  entry[m[2].toLowerCase()] = file
  byBase.set(m[1], entry)
}

for (const [base, pair] of byBase) {
  const request = pair.request ? readJson(pair.request) : null
  const response = pair.response ? readJson(pair.response) : null
  if (!request && !response) continue
  if (!request) gaps.push(`${base} has a Response but no Request schema`)
  if (!response) gaps.push(`${base} has a Request but no Response schema`)

  const summary = firstSentence(request?.description ?? response?.description ?? '')
  if (!summary) gaps.push(`No description for control-plane operation ${base}`)

  tasks.push({
    name: base,
    title: base.replace(/([a-z])([A-Z])/g, '$1 $2'),
    area: 'control-plane',
    summary,
    requestFields: primStore.fields(request),
    responseFields: primStore.fields(response),
    examples: [],
    slug: slugify(base),
    provenance: provenance('iab-agentic-primitives', pair.request ?? pair.response),
  })
}

// --------------------------------------------- control plane: seller / buyer

/** Turn an OpenAPI document into operations. */
function operationsFromOpenApi(repo, path, area) {
  const doc = readJson(path)
  if (!doc) return { ops: [], info: null }
  const store = new SchemaStore(dirname(path))
  const ops = []

  const resolveRef = (ref) => {
    if (!ref?.startsWith('#/')) return null
    const parts = ref.slice(2).split('/')
    let node = doc
    for (const p of parts) node = node?.[p]
    return node ?? null
  }

  const fieldsFromSchema = (schema, depth = 0) => {
    if (!schema || depth > 3) return []
    if (schema.$ref) return fieldsFromSchema(resolveRef(schema.$ref), depth + 1)
    const required = new Set(schema.required ?? [])
    return Object.entries(schema.properties ?? {}).map(([name, prop]) => {
      const target = prop.$ref ? resolveRef(prop.$ref) : null
      return {
        name,
        type: prop.$ref
          ? prop.$ref.split('/').pop()
          : prop.type === 'array'
            ? `${prop.items?.$ref?.split('/').pop() ?? prop.items?.type ?? 'any'}[]`
            : (prop.type ?? target?.type ?? 'object'),
        required: required.has(name),
        description: firstSentence(prop.description ?? target?.description ?? ''),
        ...(prop.enum ? { enumValues: prop.enum.map(String).slice(0, 24) } : {}),
      }
    })
  }

  for (const [route, methods] of Object.entries(doc.paths ?? {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue
      const name = op.operationId ?? `${method}${route.replace(/[^a-z0-9]+/gi, '_')}`
      const requestSchema = op.requestBody?.content?.['application/json']?.schema ?? null
      const okResponse =
        op.responses?.['200'] ?? op.responses?.['201'] ?? op.responses?.default ?? null
      const responseSchema = okResponse?.content?.['application/json']?.schema ?? null

      const summary = firstSentence(op.summary ?? op.description ?? '')
      ops.push({
        name,
        title: op.summary || name,
        area,
        summary,
        httpMethod: method.toUpperCase(),
        httpPath: route,
        requestFields: fieldsFromSchema(requestSchema),
        responseFields: fieldsFromSchema(responseSchema),
        examples: [],
        slug: slugify(`${method}-${route}`),
        provenance: provenance(repo, path),
      })
    }
  }
  return { ops, info: doc.info ?? null }
}

const seller = operationsFromOpenApi(
  'seller-agent',
  join(IAB, 'seller-agent/docs/api/openapi.json'),
  'seller-agent',
)
const buyer = operationsFromOpenApi(
  'buyer-agent',
  join(IAB, 'buyer-agent/docs/api/openapi.json'),
  'buyer-agent',
)
tasks.push(...seller.ops, ...buyer.ops)

// ------------------------------------------ control plane: agentic-direct MCP

const directManifest = readJson(join(IAB, 'agentic-direct/opendirect.json'))
const directTools = []
if (directManifest) {
  for (const [name, tool] of Object.entries(directManifest.tools ?? {})) {
    directTools.push({
      name,
      title: name.replace(/_/g, ' '),
      area: 'agentic-direct',
      summary: firstSentence(tool.description ?? ''),
      requestFields: Object.entries(tool.inputSchema?.properties ?? {}).map(([f, prop]) => ({
        name: f,
        type: prop.type ?? 'object',
        required: (tool.inputSchema?.required ?? []).includes(f),
        description: firstSentence(prop.description ?? ''),
      })),
      responseFields: [],
      examples: [],
      slug: slugify(name),
      provenance: provenance('agentic-direct', join(IAB, 'agentic-direct/opendirect.json')),
    })
  }
  for (const [name, schema] of Object.entries(directManifest.schemas ?? {})) {
    objects.push({
      name,
      title: schema.title ?? name,
      summary: firstSentence(schema.description ?? ''),
      fields: Object.entries(schema.properties ?? {}).map(([f, prop]) => ({
        name: f,
        type: prop.type ?? 'object',
        required: (schema.required ?? []).includes(f),
        description: firstSentence(prop.description ?? ''),
      })),
      plane: 'control',
      standard: name.split('.')[0],
      slug: slugify(name),
      provenance: provenance('agentic-direct', join(IAB, 'agentic-direct/opendirect.json')),
    })
  }
}
tasks.push(...directTools)

// ------------------------------------------------- real-time plane: ARTF

/**
 * Minimal protobuf reader.
 *
 * Only messages, enums and their fields are needed, so this is a line scanner
 * rather than a real parser. It reads the rust/ copy deliberately: the root
 * copy declares `edition = "2023"`, which most tooling rejects, and its
 * OpenRTB import path does not resolve.
 */
function parseProto(path, repo) {
  if (!existsSync(path)) {
    gaps.push(`ARTF proto not found: ${path}`)
    return { messages: [], enums: [] }
  }
  const src = readFileSync(path, 'utf8')
  const messages = []
  const enums = []
  const lines = src.split('\n')
  let current = null
  let pendingComment = []

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('//')) {
      pendingComment.push(line.replace(/^\/\/\s?/, ''))
      continue
    }
    const msg = line.match(/^message\s+(\w+)\s*\{/)
    const enm = line.match(/^enum\s+(\w+)\s*\{/)
    if (msg) {
      current = { kind: 'message', name: msg[1], doc: pendingComment.join(' '), fields: [] }
      messages.push(current)
      pendingComment = []
      continue
    }
    if (enm) {
      current = { kind: 'enum', name: enm[1], doc: pendingComment.join(' '), values: [] }
      enums.push(current)
      pendingComment = []
      continue
    }
    if (line === '}') {
      current = null
      pendingComment = []
      continue
    }
    if (!current) {
      pendingComment = []
      continue
    }
    if (current.kind === 'message') {
      const f = line.match(/^(repeated\s+|optional\s+)?([\w.]+)\s+(\w+)\s*=\s*\d+\s*;/)
      if (f) {
        current.fields.push({
          name: f[3],
          type: `${f[2]}${f[1]?.trim() === 'repeated' ? '[]' : ''}`,
          required: false,
          description: firstSentence(pendingComment.join(' ')),
        })
      }
    } else {
      const v = line.match(/^(\w+)\s*=\s*(\d+)\s*;/)
      if (v)
        current.values.push({
          name: v[1],
          value: Number(v[2]),
          description: firstSentence(pendingComment.join(' ')),
        })
    }
    pendingComment = []
  }
  return { messages, enums }
}

const ARTF_PROTO = join(IAB, 'agentic-rtb-framework/rust/proto/agenticrtbframework.proto')
const artf = parseProto(ARTF_PROTO, 'agentic-rtb-framework')

for (const msg of artf.messages) {
  objects.push({
    name: msg.name,
    title: msg.name,
    summary: firstSentence(msg.doc),
    fields: msg.fields,
    plane: 'real-time',
    slug: slugify(msg.name),
    provenance: provenance('agentic-rtb-framework', ARTF_PROTO),
  })
}

const enums = artf.enums.map((e) => ({
  name: e.name,
  summary: firstSentence(e.doc),
  values: e.values,
  plane: 'real-time',
  slug: slugify(e.name),
  provenance: provenance('agentic-rtb-framework', ARTF_PROTO),
}))

// ARTF has exactly one RPC. It is an operation, so it belongs with the tasks.
const rtbRequest = artf.messages.find((m) => m.name === 'RTBRequest')
if (rtbRequest) {
  tasks.push({
    name: 'GetMutations',
    title: 'Get Mutations',
    area: 'artf',
    summary:
      'The single ARTF RPC: a host platform passes a bid request or response to an in-path agent, which returns mutations to apply.',
    requestFields: rtbRequest.fields,
    responseFields: artf.messages.find((m) => m.name === 'RTBResponse')?.fields ?? [],
    examples: [],
    slug: 'get-mutations',
    provenance: provenance(
      'agentic-rtb-framework',
      join(IAB, 'agentic-rtb-framework/rust/proto/agenticrtbframeworkservices.proto'),
    ),
  })
} else {
  gaps.push('Could not read RTBRequest from the ARTF protobuf')
}

// ARTF worked examples are the best in the corpus — attach them to the RPC.
const artfSamples = join(IAB, 'agentic-rtb-framework/samples')
if (existsSync(artfSamples)) {
  const rpc = tasks.find((t) => t.name === 'GetMutations')
  for (const file of listJson(artfSamples).slice(0, 5)) {
    const sample = readJson(file)
    if (sample && rpc) {
      rpc.examples.push({
        title: file
          .split('/')
          .pop()
          .replace(/\.json$/, ''),
        language: 'json',
        code: JSON.stringify(sample, null, 2).slice(0, 6000),
      })
    }
  }
}

// ------------------------------------------------ data plane: agentic-audiences

const EMBED = join(IAB, 'agentic-audiences/specs/v1.0/schema/embedding_format.schema.json')
const embedSchema = readJson(EMBED, 'agentic-audiences embedding_format.schema.json')
if (embedSchema) {
  const store = new SchemaStore(dirname(EMBED))
  objects.push({
    name: 'EmbeddingExchangeMessage',
    title: embedSchema.title ?? 'Embedding exchange message',
    summary: firstSentence(embedSchema.description ?? ''),
    fields: store.fields(embedSchema),
    plane: 'data',
    slug: 'embedding-exchange-message',
    provenance: provenance('agentic-audiences', EMBED),
  })
}

// Named explicitly so the gap is reported even though the file "exists".
for (const rel of [
  'specs/v1.0/schema/agent_interface.schema.json',
  'specs/v1.0/examples/buyer_agent_request.json',
  'specs/v1.0/examples/seller_agent_response.json',
  'specs/roadmap.md',
]) {
  const p = join(IAB, 'agentic-audiences', rel)
  if (existsSync(p) && statSync(p).size === 0) {
    gaps.push(`agentic-audiences/${rel} exists but is zero bytes — it defines nothing`)
  }
}

// -------------------------------------------------------------- areas / planes

const areas = [
  {
    key: 'control-plane',
    title: 'Control plane — canonical wire contract',
    summary:
      'The shared buyer-to-seller object and message contract, published as JSON Schema in iab-agentic-primitives and imported by both reference agents.',
    layer: 'control',
    taskNames: tasks.filter((t) => t.area === 'control-plane').map((t) => t.name),
    provenance: provenance('iab-agentic-primitives', join(PRIM, 'spec/jsonschema/protocol')),
  },
  {
    key: 'seller-agent',
    title: 'Seller agent API',
    summary: firstSentence(
      seller.info?.description ?? 'Supply-side reference implementation REST API.',
    ),
    layer: 'control',
    taskNames: seller.ops.map((t) => t.name),
    provenance: provenance('seller-agent', join(IAB, 'seller-agent/docs/api/openapi.json')),
  },
  {
    key: 'buyer-agent',
    title: 'Buyer agent API',
    summary: firstSentence(
      buyer.info?.description ?? 'Demand-side reference implementation REST API.',
    ),
    layer: 'control',
    taskNames: buyer.ops.map((t) => t.name),
    provenance: provenance('buyer-agent', join(IAB, 'buyer-agent/docs/api/openapi.json')),
  },
  {
    key: 'agentic-direct',
    title: 'Agentic Direct (OpenDirect over MCP)',
    summary: firstSentence(
      directManifest?.description ?? 'MCP tool surface over IAB OpenDirect 2.1.',
    ),
    layer: 'control',
    taskNames: directTools.map((t) => t.name),
    provenance: provenance('agentic-direct', join(IAB, 'agentic-direct/opendirect.json')),
  },
  {
    key: 'artf',
    title: 'Agentic Real-Time Framework (ARTF)',
    summary:
      'Serve-time plane: a host platform synchronously calls in-path agents, which return JSON-Patch-like mutations to a bid request or response.',
    layer: 'real-time',
    taskNames: ['GetMutations'],
    provenance: provenance(
      'agentic-rtb-framework',
      join(IAB, 'agentic-rtb-framework/Agentic_Real_Time_Framework_Version_1_0_FINAL.md'),
    ),
  },
  {
    key: 'agentic-audiences',
    title: 'Agentic Audiences',
    summary:
      'Data plane: agents exchange embeddings carrying identity, contextual and reinforcement signals, with consent and attestation in the envelope.',
    layer: 'data',
    taskNames: [],
    provenance: provenance('agentic-audiences', EMBED),
  },
]

// ------------------------------------------------------------------ components

const components = Object.entries(REPOS).map(([name, meta]) => ({
  name,
  repo: meta.gh,
  kind: meta.kind,
  purpose: COMPONENT_PURPOSE[name] ?? '',
  commit: COMMITS[name],
  version: TAGS[name] || 'untagged',
  listedInHub: name !== 'iab-agentic-primitives',
}))

// ------------------------------------------------------- corpus-level findings

const hubReadme = join(IAB, 'AAMP/README.md')
if (existsSync(hubReadme)) {
  const text = readFileSync(hubReadme, 'utf8')
  if (!/iab-agentic-primitives/i.test(text)) {
    gaps.push(
      'The AAMP hub README does not list iab-agentic-primitives, even though both reference agents pin it as their canonical wire contract.',
    )
  }
}
gaps.push(
  'AAMP has no single version number. Each repository versions independently: ' +
    Object.entries(TAGS)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ') +
    '.',
)
gaps.push(
  'The corpus expands the AAMP acronym three different ways: "Agentic Advertising Management Protocols" (hub README), "IAB Agent & API Management Protocol" (seller-agent architecture docs), and "Agent-to-Agent Marketplace Protocol" (seller-agent and buyer-agent guides).',
)

const spec = {
  id: 'aamp',
  name: 'AAMP',
  fullName: 'Agentic Advertising Management Protocols',
  fullNameNote:
    'The expansion above is the one used by the AAMP hub README. Two other expansions appear elsewhere in the same corpus.',
  version: 'per-repository; see components',
  governance: 'IAB Tech Lab',
  license: 'Mixed — Apache-2.0, AGPL-3.0, CC BY; one repo ships no licence file',
  homepage: 'https://iabtechlab.com/standards/aamp-agentic-advertising-management-protocols/',
  repository: REPOS.AAMP.gh,
  summary:
    'An IAB Tech Lab umbrella over independently versioned agentic advertising projects spanning three planes: a control plane derived from OpenDirect 2.1, a serve-time bidstream mutation framework (ARTF), and an embedding-exchange data plane (Agentic Audiences).',
  layers: [
    {
      id: 'control',
      title: 'Control plane',
      description:
        'Planning and transaction time: discovery, avails, quotes, negotiation, deal booking and change requests between buyer and seller agents.',
      areaKeys: ['control-plane', 'seller-agent', 'buyer-agent', 'agentic-direct'],
    },
    {
      id: 'real-time',
      title: 'Real-time plane',
      description: 'Serve time: in-path agents mutate an OpenRTB bid request or response.',
      areaKeys: ['artf'],
    },
    {
      id: 'data',
      title: 'Data plane',
      description: 'Signal exchange: embeddings with consent, TTL and attestation metadata.',
      areaKeys: ['agentic-audiences'],
    },
  ],
  areas,
  tasks,
  objects,
  enums,
  discoveryFiles: [],
  glossary: [],
  components,
  counts: {
    repos: components.length,
    areas: areas.length,
    tasks: tasks.length,
    objects: objects.length,
    enums: enums.length,
  },
  provenance: provenance('AAMP', hubReadme),
  gaps,
}

writeFileSync(OUT, `${JSON.stringify(spec, null, 2)}\n`)

console.log(
  `aamp-specs.json: ${spec.counts.repos} repos — ${spec.counts.tasks} operations in ` +
    `${spec.counts.areas} areas, ${spec.counts.objects} objects, ${spec.counts.enums} enums, ` +
    `${gaps.length} gaps`,
)
for (const g of gaps.slice(0, 10)) console.log('  -', g.slice(0, 150))
if (gaps.length > 10) console.log(`  … and ${gaps.length - 10} more`)
