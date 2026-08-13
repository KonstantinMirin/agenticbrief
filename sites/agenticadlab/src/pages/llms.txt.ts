import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { renderLlmsTxt } from '@agenticbrief/seo/llms'
import { publishedOnly, byDateDesc } from '@agenticbrief/content-utils'
import { SITES, SITE_KEYS, siteUrl } from '@agenticbrief/shared-ui/sites'
import { feedPaths, BASE } from '../lib/feed'

export const GET: APIRoute = async () => {
  const items = await feedPaths(getCollection, publishedOnly, byDateDesc)
  const doc = renderLlmsTxt({
    siteName: SITES['agenticadlab'].name,
    summary: SITES['agenticadlab'].tagline,
    details: [
      'Opinionated analysis of the two agentic advertising standards, written for people with budget authority. Every page takes a position on what to build, what to defer and what to put in a contract, and says where a standard is silent rather than filling the gap.',
    ],
    sections: [
      { title: 'Pages', links: items.map((i) => ({ title: i.title, url: i.url, note: i.note })) },
      {
        title: 'Optional',
        links: [
          {
            title: 'Full text corpus',
            url: `${BASE}/llms-full.txt`,
            note: 'every page as one markdown file',
          },
          ...SITE_KEYS.filter((k) => k !== 'agenticadlab').map((k) => ({
            title: SITES[k].name,
            url: siteUrl(k),
            note: SITES[k].tagline,
          })),
        ],
      },
    ],
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
