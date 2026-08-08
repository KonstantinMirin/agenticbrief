import { siteUrl } from '@agenticbrief/shared-ui/sites'
import { toFeedItems } from '@agenticbrief/content-utils/feeds'

export const BASE = siteUrl('briefgateway')

const EXPLICIT: Record<string, string> = {
  'index-generator': '/',
  spec: '/spec/',
  'brief-vs-filters': '/spec/brief-vs-filters/',
  'creative-brief-to-adcp': '/crosswalk/creative-brief-to-adcp/',
  'adcp-brief-vs-aamp-campaign-brief': '/compare/adcp-brief-vs-aamp-campaign-brief/',
}

export function pathFor(id: string): string {
  return EXPLICIT[id] ?? `/examples/${id}/`
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
