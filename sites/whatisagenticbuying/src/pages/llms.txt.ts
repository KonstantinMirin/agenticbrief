import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { renderLlmsTxt } from '@agenticbrief/seo/llms'
import { publishedOnly, byDateDesc } from '@agenticbrief/content-utils'
import { SITES, SITE_KEYS, siteUrl } from '@agenticbrief/shared-ui/sites'
import { feedPaths, BASE } from '../lib/feed'

export const GET: APIRoute = async () => {
  const items = await feedPaths(getCollection, publishedOnly, byDateDesc)
  const doc = renderLlmsTxt({
    siteName: SITES['whatisagenticbuying'].name,
    summary: SITES['whatisagenticbuying'].tagline,
    details: [
      'What agentic buying is, who has actually run one, and what it changes for a media team. Named advertisers and named platforms, with vendor-stated numbers marked as vendor-stated and measured ones marked as measured.',
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
          ...SITE_KEYS.filter((k) => k !== 'whatisagenticbuying').map((k) => ({
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
