import type { APIRoute } from 'astro'
import { renderLlmsTxt } from '@agenticbrief/seo/llms'
import { aamp } from '@agenticbrief/protocol-data'
import { BASE, componentsByMaturity, MATURITY, editorialGaps } from '../lib/site'

export const GET: APIRoute = () => {
  const components = componentsByMaturity()
  const doc = renderLlmsTxt({
    siteName: 'AAMP Explorer',
    summary:
      "IAB Tech Lab's AAMP: eight independently versioned repositories across three planes, what each one defines, and where the specification has holes.",
    details: [
      'AAMP has no single version. Each repository versions independently, which is stated policy in the hub README. A single AAMP version number does not resolve to any one artifact.',
      `Known gaps in the specification: ${editorialGaps().length}, listed on the homepage.`,
    ],
    sections: [
      {
        title: 'Start here',
        links: [
          {
            title: 'What AAMP actually contains',
            url: `${BASE}/`,
            note: 'repositories, versions, planes and gaps',
          },
          {
            title: 'Every component',
            url: `${BASE}/repos/`,
            note: 'ranked by substance, not billing order',
          },
        ],
      },
      {
        title: 'Findings',
        links: [
          {
            title: 'What does AAMP stand for?',
            url: `${BASE}/what-does-aamp-stand-for/`,
            note: 'Agentic Advertising Management Protocols, and the other expansions in the corpus',
          },
          {
            title: 'AAMP version matrix',
            url: `${BASE}/versions/`,
            note: 'there is no single AAMP version',
          },
          {
            title: 'Price negotiation in AAMP',
            url: `${BASE}/negotiation/`,
            note: 'the only quantified agent-negotiation model any advertising standard publishes',
          },
        ],
      },
      {
        title: 'Components',
        links: components.map((c) => ({
          title: `${c.name} (${c.version})`,
          url: `${BASE}/repos/${c.name}/`,
          note: MATURITY[c.name]?.note ?? c.purpose,
        })),
      },
      {
        title: 'Optional',
        links: [
          {
            title: 'Full text corpus',
            url: `${BASE}/llms-full.txt`,
            note: 'every component page as one markdown file',
          },
          {
            title: 'AdCP Explorer',
            url: 'https://adcpexplorer.com/',
            note: 'the other agentic advertising stack',
          },
          { title: 'IAB Tech Lab AAMP', url: aamp.homepage, note: 'the official landing page' },
        ],
      },
    ],
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
