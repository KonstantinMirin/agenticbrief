/**
 * Typed accessors over the parsed spec data.
 *
 * Sites import from here rather than reading data/*.json directly, so that a
 * change in the on-disk layout is a one-file change.
 */

import adcpRaw from '../../../data/adcp-specs.json' with { type: 'json' }
import aampRaw from '../../../data/aamp-specs.json' with { type: 'json' }
import type { ProtocolSpec, ProtocolTask, ProtocolArea } from './types'

export * from './types'

export const adcp = adcpRaw as unknown as ProtocolSpec
export const aamp = aampRaw as unknown as ProtocolSpec

export const specs: Record<string, ProtocolSpec> = { adcp, aamp }

export function getSpec(id: 'adcp' | 'aamp'): ProtocolSpec {
  return specs[id]!
}

export function tasksByArea(spec: ProtocolSpec): Map<string, ProtocolTask[]> {
  const map = new Map<string, ProtocolTask[]>()
  for (const task of spec.tasks) {
    const list = map.get(task.area) ?? []
    list.push(task)
    map.set(task.area, list)
  }
  return map
}

export function findTask(spec: ProtocolSpec, slug: string): ProtocolTask | undefined {
  return spec.tasks.find((t) => t.slug === slug)
}

export function findArea(spec: ProtocolSpec, key: string): ProtocolArea | undefined {
  return spec.areas.find((a) => a.key === key)
}

/**
 * Cross-protocol mapping used by the comparison pages.
 *
 * Returns AdCP tasks alongside the AAMP capability that covers the same job,
 * where one exists. `null` on either side is meaningful — it is the finding.
 */
export interface CapabilityRow {
  capability: string
  adcp: string | null
  aamp: string | null
  note: string
}

export function capabilityMatrix(): CapabilityRow[] {
  return CAPABILITY_MATRIX
}

/**
 * Hand-maintained, deliberately.
 *
 * A mapping between two protocols is an editorial judgement, not something a
 * parser can derive — the research calls this out as the credibility asset, so
 * it must not be auto-generated. Each row is checked against both spec repos.
 */
const CAPABILITY_MATRIX: CapabilityRow[] = []
