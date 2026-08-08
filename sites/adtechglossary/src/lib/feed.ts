import { siteUrl } from '@agenticbrief/shared-ui/sites'
import { toFeedItems } from '@agenticbrief/content-utils/feeds'
import { pathFor } from './sections'

export const BASE = siteUrl('adtechglossary')

/** Every published glossary term, at the section path the router actually generates. */
export async function feedPaths(getCollection: any, publishedOnly: any, byDateDesc: any) {
  const entries = byDateDesc(publishedOnly(await getCollection('glossary')))
  return toFeedItems(entries, pathFor, BASE)
}
