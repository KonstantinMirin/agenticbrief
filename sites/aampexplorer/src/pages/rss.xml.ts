import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { aamp } from '@agenticbrief/protocol-data'
import { componentsByMaturity, MATURITY } from '../lib/site'

export function GET(context: APIContext) {
  const pubDate = new Date(aamp.provenance.parsedAt)
  return rss({
    title: 'AAMP Explorer',
    description:
      "What IAB Tech Lab's AAMP repositories actually contain, component by component, including where the specification has holes.",
    site: context.site!,
    items: [
      {
        title: 'What does AAMP stand for?',
        description:
          'Agentic Advertising Management Protocols, and the other expansions of the acronym written into the same repositories.',
        link: '/what-does-aamp-stand-for/',
        pubDate,
      },
      {
        title: 'AAMP version matrix',
        description:
          'There is no single AAMP version. Here is what each repository is actually at.',
        link: '/versions/',
        pubDate,
      },
      {
        title: 'Quote, negotiate, book — price negotiation in AAMP',
        description:
          'The only quantified agent-negotiation model published by an advertising standards body.',
        link: '/negotiation/',
        pubDate,
      },
      ...componentsByMaturity().map((c) => ({
        title: `${c.name} (${c.version})`,
        description: MATURITY[c.name]?.note ?? c.purpose,
        link: `/repos/${c.name}/`,
        pubDate,
      })),
    ],
    customData: '<language>en-us</language>',
  })
}
