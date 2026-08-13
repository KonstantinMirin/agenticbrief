import type { APIRoute } from 'astro'
import { renderLlmsFullTxt } from '@agenticbrief/seo/llms'
import { adcp } from '@agenticbrief/protocol-data'
import { BASE, orderedAreas, tasksForArea } from '../lib/site'

/**
 * llms-full.txt — the whole reference as one plain-text fetch.
 *
 * Not part of the llmstxt.org spec (it is a Mintlify convention), but it is the
 * variant with a concrete use: one request puts the entire operation reference
 * into a context window, which is exactly what someone implementing against
 * AdCP wants.
 */
export const GET: APIRoute = () => {
  const entries = orderedAreas().map((area) => {
    const tasks = tasksForArea(area.key)
    const body = tasks
      .map((task) => {
        const fields = (label: string, list: typeof task.requestFields) =>
          list.length === 0
            ? `${label}: none declared`
            : `${label}:\n` +
              list
                .map(
                  (f) =>
                    `  - ${f.name} (${f.type})${f.required ? ' [required]' : ''}${f.description ? `: ${f.description}` : ''}`,
                )
                .join('\n')
        return [
          `## ${task.name}`,
          '',
          task.summary,
          '',
          fields('Request fields', task.requestFields),
          '',
          fields('Response fields', task.responseFields),
          '',
          `Source: ${task.provenance.sourcePath ?? task.provenance.repo} @ ${String(task.provenance.commit).slice(0, 8)}`,
        ].join('\n')
      })
      .join('\n\n')

    return {
      title: `AdCP ${area.title}`,
      url: `${BASE}/areas/${area.key}/`,
      description: area.summary,
      body,
    }
  })

  const doc = renderLlmsFullTxt({
    siteName: `AdCP Explorer — Ad Context Protocol ${adcp.version}`,
    summary: `Every request and response field of all ${adcp.tasks.length} operations in Ad Context Protocol release ${adcp.version}, grouped by protocol area.`,
    generatedAt: adcp.provenance.parsedAt.slice(0, 10),
    entries,
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
