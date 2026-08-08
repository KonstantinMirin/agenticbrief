import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { adcp } from '@agenticbrief/protocol-data'
import { orderedAreas, tasksForArea, featuredTasks, operationUrl } from '../lib/site'

/**
 * A feed of the reference pages.
 *
 * These are generated documents rather than posts, so `pubDate` is the date the
 * spec release they describe was published — not the build time. Stamping every
 * item with "now" on each rebuild would make the feed re-announce unchanged
 * pages forever.
 */
export function GET(context: APIContext) {
  const pubDate = new Date(adcp.lastUpdated ?? '2026-08-04')

  const items = [
    ...orderedAreas().map((area) => ({
      title: `AdCP ${area.title} — ${tasksForArea(area.key).length} operations`,
      description: area.summary,
      link: `/areas/${area.key}/`,
      pubDate,
    })),
    ...featuredTasks().map((task) => ({
      title: `${task.name} — AdCP operation reference`,
      description: task.summary,
      link: operationUrl(task),
      pubDate,
    })),
  ]

  return rss({
    title: `AdCP Explorer — Ad Context Protocol ${adcp.version}`,
    description: `Field-level reference for all ${adcp.tasks.length} AdCP operations, generated from the published schema registry.`,
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  })
}
