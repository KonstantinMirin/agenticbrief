/**
 * Shared @astrojs/sitemap configuration.
 *
 * The blog calls sitemap() with no arguments, which emits every route at
 * default settings. Two changes here:
 *
 *  1. Machine endpoints (llms.txt, robots.txt, RSS) are filtered out — they are
 *     not pages and should not be offered for indexing.
 *  2. `lastmod` comes from real content dates, supplied per-site via
 *     `lastmodByPath`. Stamping every URL with the build time would be a
 *     fabricated freshness signal: it tells crawlers the whole site changed on
 *     every deploy, which is both false and self-defeating once they notice.
 *     A path with no known date gets no lastmod at all, which is the honest
 *     answer.
 *
 * `changefreq` and `priority` are set but deliberately not relied on — Google's
 * own sitemap documentation states it ignores both. They are kept because Bing
 * and several smaller crawlers still read them, and they cost nothing.
 */

export interface SitemapOptions {
  /** paths (starting with /) that must never appear in the sitemap */
  exclude?: string[]
  /**
   * Map of site-relative path -> ISO date string of last real content change.
   * Built by each site from its content collections.
   */
  lastmodByPath?: Record<string, string>
}

const ALWAYS_EXCLUDE = ['/llms.txt', '/llms-full.txt', '/robots.txt', '/404', '/rss.xml']

/** Priority curve: homepage 1.0, one-segment sections 0.8, leaves 0.6. */
export function priorityFor(pathname: string): number {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 1.0
  if (segments.length === 1) return 0.8
  if (segments.length === 2) return 0.7
  return 0.6
}

function normalise(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.replace(/\/+$/, '')
}

export function sitemapConfig(opts: SitemapOptions = {}) {
  const exclude = [...ALWAYS_EXCLUDE, ...(opts.exclude ?? [])]
  const lastmods = opts.lastmodByPath ?? {}

  return {
    filter: (page: string) => {
      const { pathname } = new URL(page)
      const p = normalise(pathname)
      return !exclude.some((e) => p === normalise(e))
    },
    serialize(item: { url: string; changefreq?: string; priority?: number; lastmod?: string }) {
      const { pathname } = new URL(item.url)
      const lastmod = lastmods[normalise(pathname)]
      return {
        ...item,
        changefreq: 'weekly',
        priority: priorityFor(pathname),
        // Only emit lastmod when we actually know it.
        ...(lastmod ? { lastmod } : {}),
      }
    },
  }
}
