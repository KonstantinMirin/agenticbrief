import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import { publishedOnly, byDateDesc } from '@agenticbrief/content-utils'
import { SITES } from '@agenticbrief/shared-ui/sites'
import { feedPaths } from '../lib/feed'

export async function GET(context: APIContext) {
  const items = await feedPaths(getCollection, publishedOnly, byDateDesc)
  return rss({
    title: SITES['adtechglossary'].name,
    description: SITES['adtechglossary'].tagline,
    site: context.site!,
    items: items.map((i) => ({
      title: i.title,
      description: i.note,
      link: i.path,
      pubDate: i.pubDate,
    })),
    customData: '<language>en-us</language>',
  })
}
