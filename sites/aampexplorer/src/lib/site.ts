/**
 * Site-local helpers for AAMP Explorer.
 *
 * AAMP is not shaped like AdCP and the site should not pretend otherwise. AdCP
 * has one registry, one version and a uniform operation set. AAMP is eight
 * repositories at eight versions across three planes that share no types, with
 * several normative files that are literally empty.
 *
 * So the organising axis here is the COMPONENT, not the operation. The most
 * useful thing this site can do is state accurately what exists, what version
 * it is, and where the holes are — which is precisely what the hub README does
 * not do.
 */

import { aamp } from '@agenticbrief/protocol-data'
import { siteUrl } from '@agenticbrief/shared-ui/sites'

export const SITE = 'aampexplorer' as const
export const BASE = siteUrl(SITE)
export const HUB = siteUrl('agenticadlab')
export const ADCP_SITE = siteUrl('adcpexplorer')

interface AampExtras {
  fullNameNote?: string
  enums?: {
    name: string
    summary: string
    values: { name: string; value: number; description?: string }[]
    slug: string
    provenance: unknown
  }[]
  counts?: Record<string, number>
}

export const extras = aamp as unknown as AampExtras

/**
 * Maturity assessment per component.
 *
 * This is an editorial judgement, made once, here, from the file-level evidence
 * the parser records — not something a parser can derive. It drives which
 * components get a full page and which get a paragraph, so that page depth
 * tracks source substance instead of flattening everything into a uniform
 * template.
 */
export type Maturity = 'substantial' | 'partial' | 'thin'

export const MATURITY: Record<string, { level: Maturity; note: string }> = {
  'iab-agentic-primitives': {
    level: 'substantial',
    note: 'The wire contract both reference agents pin: 48 versioned JSON Schemas for the shared objects and the request/response protocol, plus an OpenAPI document. Its own README opens with WORK IN PROGRESS — NOT YET RELEASED.',
  },
  'seller-agent': {
    level: 'substantial',
    note: 'The largest machine-readable surface in the corpus: an OpenAPI 3.1 document with 74 paths carrying 87 operations, 91 component schemas, a changelog, and tags through v2.4.1. Its prose guides contradict the OpenAPI and each other.',
  },
  'agentic-rtb-framework': {
    level: 'substantial',
    note: 'The only specification here that is tagged and marked FINAL: a v1.0 prose document, a protobuf contract, Go and Rust implementations, and five worked request samples.',
  },
  'buyer-agent': {
    level: 'partial',
    note: "58 files of documentation, the largest prose set in AAMP, over an OpenAPI that describes only the buyer's own 13 inbound paths. The buyer-to-seller protocol it implements is specified somewhere else.",
  },
  'agentic-direct': {
    level: 'partial',
    note: 'One real artifact inside a demo: opendirect.json, a manifest of 40 OpenDirect, AdCOM and OpenRTB object definitions. Its README calls that file an OpenAPI spec twice, the file has no openapi key, and the MCP server it feeds answers every tool call with generateMockResponse.',
  },
  'agentic-audiences': {
    level: 'partial',
    note: "A readable draft and a detailed embedding taxonomy, described by its own README as LiveRamp's initial proposal. The schema that would connect it to the rest of AAMP is a zero-byte file, and so are the two example payloads and the roadmap.",
  },
  AAMP: {
    level: 'thin',
    note: 'A 270-word README. It lists six of the eight repositories, omits the wire contract, and gives an expansion of the acronym that two of the repositories it lists contradict.',
  },
  'registry-agent-example': {
    level: 'thin',
    note: 'A 22-line agent that points an MCP client at the registry defined in agent-registry, a repository outside AAMP.',
  },
}

export const PLANE_ORDER = ['control', 'real-time', 'data'] as const

export function componentsByMaturity() {
  const rank: Record<Maturity, number> = { substantial: 0, partial: 1, thin: 2 }
  return [...aamp.components].sort((a, b) => {
    const ra = rank[MATURITY[a.name]?.level ?? 'thin']
    const rb = rank[MATURITY[b.name]?.level ?? 'thin']
    return ra - rb || a.name.localeCompare(b.name)
  })
}

export function areasForPlane(plane: string) {
  const layer = aamp.layers.find((l) => l.id === plane)
  if (!layer) return []
  return aamp.areas.filter((a) => layer.areaKeys.includes(a.key))
}

export function tasksForArea(areaKey: string) {
  return aamp.tasks.filter((t) => t.area === areaKey)
}

/** Objects grouped by the plane they belong to. */
export function objectsForPlane(plane: string) {
  return aamp.objects.filter((o) => (o as { plane?: string }).plane === plane)
}

/**
 * The file-level gaps, separated from parser bookkeeping.
 *
 * Four entries are dropped here because they are tallies or restatements
 * rather than gaps in a file, and each is already carried in prose by the page
 * that owns the subject: the acronym expansions belong to
 * /what-does-aamp-stand-for/ (which lists four with file and line, where the
 * parser sees three), the per-repository version dump belongs to /versions/,
 * and the hub README's omission of the wire contract is stated on / and
 * /repos/.
 */
export function editorialGaps(): string[] {
  return aamp.gaps.filter(
    (g) =>
      !/^package\.json is at|^Repo not present locally|^The corpus expands the AAMP acronym|^AAMP has no single version number|^The AAMP hub README does not list/.test(
        g,
      ),
  )
}
