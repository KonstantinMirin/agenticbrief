import type { APIRoute } from 'astro'
import { renderLlmsTxt } from '@agenticbrief/seo/llms'
import { adcp } from '@agenticbrief/protocol-data'
import { BASE, orderedAreas, tasksForArea, featuredTasks, operationUrl } from '../lib/site'

/**
 * llms.txt — a table of contents for agents, in the llmstxt.org format.
 *
 * Generated from the same data the pages are generated from, so it cannot drift
 * out of sync with what actually exists. Every URL here resolves to a real page.
 */
export const GET: APIRoute = () => {
  const doc = renderLlmsTxt({
    siteName: 'AdCP Explorer',
    summary: `Field-level reference for all ${adcp.tasks.length} operations in Ad Context Protocol release ${adcp.version}, generated from the published schema registry.`,
    details: [
      `AdCP is an open standard, governed by AgenticAdvertising.org and licensed Apache 2.0, that lets advertising software agents discover, buy and measure media over MCP or A2A transports.`,
      `Every page on this site names the release, the commit and the schema file it was generated from. Current release: ${adcp.version}, last updated ${adcp.lastUpdated}.`,
    ],
    sections: [
      {
        title: 'Start here',
        links: [
          {
            title: 'All operations by area',
            url: `${BASE}/`,
            note: `the ${adcp.tasks.length} operations in ${adcp.version}`,
          },
          {
            title: 'Schema registry',
            url: `${BASE}/schemas/`,
            note: 'how the schemas are organised and referenced',
          },
          {
            title: 'Discovery files',
            url: `${BASE}/discovery/`,
            note: 'adagents.json and brand.json',
          },
        ],
      },
      {
        title: 'Protocol areas',
        links: orderedAreas().map((area) => ({
          title: area.title,
          url: `${BASE}/areas/${area.key}/`,
          note: `${tasksForArea(area.key).length} operations — ${area.summary}`,
        })),
      },
      {
        title: 'Operation references',
        links: featuredTasks().map((task) => ({
          title: task.name,
          url: `${BASE}${operationUrl(task)}`,
          note: task.summary,
        })),
      },
      {
        title: 'Optional',
        links: [
          {
            title: 'Full text corpus',
            url: `${BASE}/llms-full.txt`,
            note: 'every page as one markdown file',
          },
          {
            title: 'AAMP Explorer',
            url: 'https://aampexplorer.noetis.dev/',
            note: 'the other agentic advertising stack',
          },
          {
            title: 'AdCP specification',
            url: adcp.docsHomepage ?? adcp.homepage,
            note: 'the normative source this site is generated from',
          },
        ],
      },
    ],
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
