/**
 * Site-local helpers for AdCP Explorer.
 *
 * The page tree deliberately does NOT put every one of the 64 operations on its
 * own page. Measured across the published 3.1.10 registry, the median operation
 * carries 25 request+response fields and much of that is the shared envelope,
 * so per-operation pages would be 64 near-identical documents differing by a
 * filter object. That is the thin-content pattern the strategy explicitly rules
 * out.
 *
 * Instead:
 *   - Area pages carry the full reference for every operation in that area,
 *     inline, each under a stable anchor.
 *   - A small set of operations gets a dedicated page: the ones a person types
 *     into a search box by name, because they appear in the trade press and in
 *     the protocol's own marketing.
 */

import { adcp, type ProtocolTask } from '@agenticbrief/protocol-data'
import { siteUrl } from '@agenticbrief/shared-ui/sites'

export const SITE = 'adcpexplorer' as const
export const BASE = siteUrl(SITE)
export const HUB = siteUrl('agenticadlab')

/**
 * Operations that earn a standalone page.
 *
 * Chosen because each is named in third-party coverage of AdCP or is a required
 * entry point, not because of field count. `get_adcp_capabilities` is here
 * because it is the one operation every conforming agent must implement.
 */
export const FEATURED_OPERATIONS = [
  'get_products',
  'create_media_buy',
  'get_signals',
  'activate_signal',
  'build_creative',
  'get_adcp_capabilities',
  'context_match',
  'identity_match',
] as const

export const AREA_ORDER = [
  'media-buy',
  'creative',
  'signals',
  'protocol',
  'account',
  'brand-protocol',
  'governance',
  'sponsored-intelligence',
  'trusted-match',
  'compliance',
] as const

export function orderedAreas() {
  const byKey = new Map(adcp.areas.map((a) => [a.key, a]))
  const ordered = AREA_ORDER.map((k) => byKey.get(k)).filter(Boolean)
  // Anything the spec adds that this list has not been updated for still shows
  // up, at the end, rather than silently disappearing from the site.
  const extra = adcp.areas.filter((a) => !AREA_ORDER.includes(a.key as never))
  return [...ordered, ...extra] as typeof adcp.areas
}

export function tasksForArea(areaKey: string): ProtocolTask[] {
  return adcp.tasks.filter((t) => t.area === areaKey).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Where an operation is documented.
 *
 * Featured operations have their own page; everything else lives at an anchor
 * on its area page. One function so no link in the site can point at a page
 * that does not exist.
 */
export function operationUrl(task: ProtocolTask, absolute = false): string {
  const path = (FEATURED_OPERATIONS as readonly string[]).includes(task.name)
    ? `/operations/${task.slug}/`
    : `/areas/${task.area}/#${task.slug}`
  return absolute ? `${BASE}${path}` : path
}

export function featuredTasks(): ProtocolTask[] {
  return FEATURED_OPERATIONS.map((name) => adcp.tasks.find((t) => t.name === name)).filter(
    (t): t is ProtocolTask => Boolean(t),
  )
}

export function areaTitle(key: string): string {
  return adcp.areas.find((a) => a.key === key)?.title ?? key
}

/** Operations present on `main` but in no published release. */
export const UNRELEASED: string[] =
  (adcp as { unreleased?: { addedInMain?: string[] } }).unreleased?.addedInMain ?? []

export const VERSION_LABEL = (adcp as { versionLabel?: string }).versionLabel ?? adcp.version
