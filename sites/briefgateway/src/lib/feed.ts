import { siteUrl } from '@agenticbrief/shared-ui/sites'
import { toFeedItems } from '@agenticbrief/content-utils/feeds'

export const BASE = siteUrl('briefgateway')

export const EXPLICIT: Record<string, string> = {
  'index-generator': '/',
  spec: '/spec/',
  'brief-vs-filters': '/spec/brief-vs-filters/',
  'creative-brief-to-adcp': '/crosswalk/creative-brief-to-adcp/',
  'adcp-brief-vs-aamp-campaign-brief': '/compare/adcp-brief-vs-aamp-campaign-brief/',
}

/**
 * Two collections share this function. The guides collection globs `brief-*`
 * out of content/guides and renders under /guides/; the briefs collection holds
 * worked examples and renders under /examples/. The prefix is the discriminator
 * because it is also the glob, so the two cannot drift apart.
 */
export function pathFor(id: string): string {
  if (id in EXPLICIT) return EXPLICIT[id]
  return id.startsWith('brief-') ? `/guides/${id}/` : `/examples/${id}/`
}

export async function feedPaths(getCollection: any, publishedOnly: any, byDateDesc: any) {
  const briefs = publishedOnly(await getCollection('briefs'))
  const guides = publishedOnly(await getCollection('guides')).filter((e: any) =>
    e.id.startsWith('brief-'),
  )
  const comparisons = publishedOnly(await getCollection('comparisons')).filter(
    (e: any) => e.id in EXPLICIT,
  )
  return toFeedItems(byDateDesc([...briefs, ...guides, ...comparisons]), pathFor, BASE)
}
