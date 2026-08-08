import { siteUrl } from '@agenticbrief/shared-ui/sites'
import { toFeedItems } from '@agenticbrief/content-utils/feeds'

export const BASE = siteUrl('whatisagenticbuying')

/**
 * Routing constants for the answer site.
 *
 * These live here rather than in the route file because Astro's getStaticPaths
 * runs in an isolated module scope and cannot see component-level consts. That
 * turns out to be the better arrangement anyway: the router, the RSS feed and
 * llms.txt all import the same functions, so a URL is defined once and the
 * three can never disagree about where a page lives.
 */
export const PREFIX = 'agentic-buying-'
export const ROOT = 'agentic-buying-answer'

/** Entry id -> URL slug. The 'vs-programmatic' page keeps its full phrase. */
export function slugFor(id: string): string {
  if (id === 'agentic-buying-vs-programmatic') return 'agentic-buying-vs-programmatic'
  return id.slice(PREFIX.length)
}

/** Entry id -> site-relative path. */
export function pathFor(id: string): string {
  if (id === ROOT) return '/'
  return `/${slugFor(id)}/`
}

export async function feedPaths(getCollection: any, publishedOnly: any, byDateDesc: any) {
  const entries = byDateDesc(
    publishedOnly(await getCollection('guides')).filter((e: any) => e.id.startsWith(PREFIX)),
  )
  return toFeedItems(entries, pathFor, BASE)
}
