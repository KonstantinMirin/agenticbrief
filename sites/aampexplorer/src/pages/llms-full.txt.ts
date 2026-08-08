import type { APIRoute } from 'astro'
import { renderLlmsFullTxt } from '@agenticbrief/seo/llms'
import { aamp } from '@agenticbrief/protocol-data'
import { BASE, componentsByMaturity, MATURITY, tasksForArea, editorialGaps } from '../lib/site'

export const GET: APIRoute = () => {
  const entries = componentsByMaturity().map((c) => {
    const areas = aamp.areas.filter((a) => a.provenance?.repo === c.repo)
    const objects = aamp.objects.filter((o) => o.provenance?.repo === c.repo)
    const tasks = areas.flatMap((a) => tasksForArea(a.key))

    const body = [
      `Version: ${c.version}`,
      `Commit: ${String(c.commit).slice(0, 12)}`,
      `Kind: ${c.kind.replace(/-/g, ' ')}`,
      `Substance: ${MATURITY[c.name]?.level ?? 'unassessed'}`,
      `Listed in the AAMP hub README: ${c.listedInHub ? 'yes' : 'no'}`,
      '',
      MATURITY[c.name]?.note ?? c.purpose,
      '',
      tasks.length
        ? `## Operations (${tasks.length})\n` +
          tasks
            .map(
              (t) =>
                `  - ${t.httpMethod ? `${t.httpMethod} ${t.httpPath}` : t.name}${t.summary ? `: ${t.summary}` : ''}`,
            )
            .join('\n')
        : '## Operations\n  none defined in this repository',
      '',
      objects.length
        ? `## Objects (${objects.length})\n` +
          objects
            .map(
              (o) =>
                `  - ${o.name} (${o.fields.length} fields)${o.summary ? `: ${o.summary}` : ''}`,
            )
            .join('\n')
        : '## Objects\n  none defined in this repository',
    ].join('\n')

    return {
      title: c.name,
      url: `${BASE}/repos/${c.name}/`,
      description: c.purpose,
      body,
    }
  })

  entries.push({
    title: 'Known gaps in the AAMP corpus',
    url: `${BASE}/`,
    description:
      'Found by reading the repositories, each checkable against the commit recorded above.',
    body: editorialGaps()
      .map((g) => `- ${g}`)
      .join('\n'),
  })

  const doc = renderLlmsFullTxt({
    siteName: 'AAMP Explorer — the full corpus map',
    summary:
      "What each of IAB Tech Lab's eight AAMP repositories defines, at the commit it was read from.",
    generatedAt: aamp.provenance.parsedAt.slice(0, 10),
    entries,
  })
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
