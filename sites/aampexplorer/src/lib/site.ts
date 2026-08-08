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
    note: 'The canonical wire contract: versioned JSON Schema for the shared objects and the request/response protocol, imported by both reference agents. Not listed in the AAMP hub README.',
  },
  'seller-agent': {
    level: 'substantial',
    note: 'The largest machine-readable surface in the corpus: an OpenAPI 3.1 document with 74 paths and 91 component schemas, plus a changelog and tagged releases.',
  },
  'agentic-rtb-framework': {
    level: 'substantial',
    note: 'The only component that is unambiguously a specification: a prose document plus a protobuf contract, with two independent implementations and five worked request samples.',
  },
  'buyer-agent': {
    level: 'partial',
    note: 'Large prose documentation set, but its OpenAPI covers only the buyer’s own inbound API rather than the buyer-to-seller protocol.',
  },
  'agentic-direct': {
    level: 'partial',
    note: 'One rich artifact — a manifest carrying 40 OpenDirect, AdCOM and OpenRTB object definitions — inside a demo-grade repository whose own README misdescribes that file as OpenAPI.',
  },
  'agentic-audiences': {
    level: 'partial',
    note: 'A readable draft specification and a detailed taxonomy, but the schema that would connect it to the rest of AAMP is a zero-byte file, and it is self-described as one vendor’s initial proposal.',
  },
  AAMP: {
    level: 'thin',
    note: 'A README listing six repositories. It omits the wire-contract repository and gives an expansion of the acronym that two of its own children contradict.',
  },
  'registry-agent-example': {
    level: 'thin',
    note: 'A 22-line sample agent that consumes an external registry. It defines no registry contract, and the repositories that describe one state it is not finalised.',
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

/** The gaps worth putting on a page, separated from parser bookkeeping. */
export function editorialGaps(): string[] {
  return aamp.gaps.filter((g) => !/^package\.json is at|^Repo not present locally/.test(g))
}
