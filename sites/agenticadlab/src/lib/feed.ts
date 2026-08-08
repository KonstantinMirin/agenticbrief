import { siteUrl } from '@agenticbrief/shared-ui/sites'
import { toFeedItems } from '@agenticbrief/content-utils/feeds'

export const BASE = siteUrl('agenticadlab')

/**
 * Guides whose canonical home is a satellite site.
 *
 * Exported so the router imports the same predicate the feeds use — publishing a
 * page on two owned domains is the cannibalisation the semantic core exists to
 * prevent, and one shared regex is how that stays true.
 *
 * Also: getStaticPaths runs in an isolated module scope and cannot see
 * component-level consts, so this has to be an import regardless.
 */
export const ELSEWHERE = /^(agentic-buying-|brief-|adcp-|aamp-)/

/** Guides that have their own explicit route rather than living under /guides/. */
export const EXPLICIT_ROUTES: Record<string, string> = {
  'agentic-advertising-standards-landscape': '/protocols/',
  'aamp-what-iab-has-published': '/protocols/aamp/',
  'protocol-integration-services': '/services/',
  'about-agentic-ad-lab': '/about/',
}

export async function feedPaths(getCollection: any, publishedOnly: any, byDateDesc: any) {
  const comparisons = publishedOnly(await getCollection('comparisons')).filter(
    (e: any) => e.id === 'adcp-vs-aamp',
  )
  const guides = publishedOnly(await getCollection('guides')).filter(
    (e: any) => !ELSEWHERE.test(e.id),
  )
  return [
    ...toFeedItems(byDateDesc(comparisons), (id: string) => `/protocols/${id}/`, BASE),
    ...toFeedItems(
      byDateDesc(guides),
      (id: string) => EXPLICIT_ROUTES[id] ?? `/guides/${id}/`,
      BASE,
    ),
  ]
}
