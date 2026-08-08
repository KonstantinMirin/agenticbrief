/**
 * llms.txt generation.
 *
 * The convention (llmstxt.org, Jeremy Howard, Sep 2024) is a markdown file at
 * /llms.txt: an H1 with the site name, an optional blockquote summary, then
 * H2 sections containing link lists with one-line descriptions.
 *
 * Shipped as a table of contents for coding agents, not as a ranking lever.
 * The evidence for the latter is bad: log studies put AI-crawler requests for
 * llms.txt at a fraction of a percent of AI bot traffic, no lab has committed
 * to consuming it, and Google's June 2026 documentation states it has no
 * effect on Search or AI Overviews either way. What does demonstrably read it
 * is a developer pointing their editor or MCP host at a docs URL — which is a
 * real use for a protocol reference site, and reason enough at zero cost.
 *
 * /llms-full.txt is a Mintlify convention, not part of the llmstxt.org spec
 * (the spec's own tooling emits llms-ctx.txt). It is emitted here because
 * "give me this whole site in one fetch" is genuinely useful for a corpus this
 * small.
 *
 * Both are served as text/plain — serving text/html is the most common way
 * these files are silently broken.
 */

export interface LlmsSection {
  title: string
  links: { title: string; url: string; note?: string }[]
}

export interface LlmsDoc {
  siteName: string
  summary: string
  /** free-form paragraphs rendered after the summary, before the sections */
  details?: string[]
  sections: LlmsSection[]
}

export function renderLlmsTxt(doc: LlmsDoc): string {
  const out: string[] = []
  out.push(`# ${doc.siteName}`)
  out.push('')
  out.push(`> ${doc.summary}`)
  out.push('')
  for (const p of doc.details ?? []) {
    out.push(p)
    out.push('')
  }
  for (const section of doc.sections) {
    if (!section.links.length) continue
    out.push(`## ${section.title}`)
    out.push('')
    for (const link of section.links) {
      out.push(`- [${link.title}](${link.url})${link.note ? `: ${link.note}` : ''}`)
    }
    out.push('')
  }
  return out.join('\n')
}

export interface LlmsFullEntry {
  title: string
  url: string
  description?: string
  body: string
}

export function renderLlmsFullTxt(opts: {
  siteName: string
  summary: string
  generatedAt: string
  entries: LlmsFullEntry[]
}): string {
  const out: string[] = []
  out.push(`# ${opts.siteName} — full text corpus`)
  out.push('')
  out.push(`> ${opts.summary}`)
  out.push('')
  out.push(`Generated ${opts.generatedAt}. ${opts.entries.length} documents.`)
  out.push('')
  out.push('---')
  out.push('')
  for (const e of opts.entries) {
    out.push(`# ${e.title}`)
    out.push('')
    out.push(`Source: ${e.url}`)
    if (e.description) {
      out.push('')
      out.push(e.description)
    }
    out.push('')
    out.push(e.body.trim())
    out.push('')
    out.push('---')
    out.push('')
  }
  return out.join('\n')
}

/**
 * robots.txt.
 *
 * Every crawler is allowed, and each token is named explicitly rather than
 * left to the wildcard, because the tokens are exact-match and a typo fails
 * silently. Three deliberate positions:
 *
 *  - Retrieval and user-triggered agents (OAI-SearchBot, Claude-SearchBot,
 *    PerplexityBot, …) are what produce citations. Blocking any of them is the
 *    one reliable way to become uncitable.
 *  - bingbot is listed by name because ChatGPT Search is Bing-backed; without
 *    Bing indexing there is no ChatGPT citation.
 *  - Training crawlers are allowed too. For a definitional reference site that
 *    is the point: we want these definitions in the corpus. That is a choice,
 *    not a default — a commercial site would reasonably decide otherwise.
 *
 * Google-Extended and Applebot-Extended are control tokens, not crawlers.
 * Allowing them opts in to Gemini grounding and Apple Intelligence rather than
 * permitting any additional fetching.
 */

/** Retrieval / search indexing — these are the citation path. */
export const RETRIEVAL_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'DuckAssistBot',
  'MistralAI-User',
  'Applebot',
  'bingbot',
  'Googlebot',
] as const

/** Training corpora and model-grounding control tokens. */
export const TRAINING_AGENTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
  'meta-externalagent',
] as const

export const AI_CRAWLER_AGENTS = [...RETRIEVAL_AGENTS, ...TRAINING_AGENTS] as const

export function renderRobotsTxt(opts: { siteUrl: string; disallow?: string[] }): string {
  const out: string[] = []
  out.push('User-agent: *')
  out.push('Allow: /')
  for (const d of opts.disallow ?? []) out.push(`Disallow: ${d}`)
  out.push('')
  out.push('# Retrieval and assistant user-agents. These are how a page gets cited;')
  out.push('# blocking them is the one reliable way to become uncitable.')
  for (const agent of RETRIEVAL_AGENTS) {
    out.push(`User-agent: ${agent}`)
    out.push('Allow: /')
    out.push('')
  }
  out.push('# Training crawlers and model-grounding control tokens.')
  out.push('# Allowed deliberately: this is a reference site, and having these')
  out.push('# definitions in the corpus is the objective.')
  for (const agent of TRAINING_AGENTS) {
    out.push(`User-agent: ${agent}`)
    out.push('Allow: /')
    out.push('')
  }
  out.push(`Sitemap: ${opts.siteUrl}/sitemap-index.xml`)
  out.push('')
  return out.join('\n')
}
