import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { renderLlmsFullTxt } from '@agenticbrief/seo/llms'
import { publishedOnly, byDateDesc, stripMarkdown } from '@agenticbrief/content-utils'
import { SITES } from '@agenticbrief/shared-ui/sites'
import { feedPaths } from '../lib/feed'

export const GET: APIRoute = async () => {
  const items = await feedPaths(getCollection, publishedOnly, byDateDesc)
  const doc = renderLlmsFullTxt({
    siteName: SITES['adtechglossary'].name,
    summary: SITES['adtechglossary'].tagline,
    generatedAt: new Date().toISOString().slice(0, 10),
    entries: items.map((i) => ({
      title: i.title,
      url: i.url,
      description: i.note,
      body: stripMarkdown(i.body),
    })),
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
