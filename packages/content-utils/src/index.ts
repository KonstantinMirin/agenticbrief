/**
 * Content helpers shared by every site.
 */

export * from './schemas'

export interface PublishableEntry {
  data: { draft?: boolean; reviewState?: string; pubDate: Date; updatedDate?: Date }
}

/**
 * The publish gate.
 *
 * Mirrors the blog's `draft: true` convention and adds the review-state
 * check: nothing ships until it has been through language correction and CTO
 * review. In production both must pass; in dev everything is visible so
 * drafts can be previewed.
 */
export function isPublished(entry: PublishableEntry, isProduction = import.meta.env.PROD): boolean {
  if (!isProduction) return true
  if (entry.data.draft) return false
  return entry.data.reviewState === 'published' || entry.data.reviewState === 'cto-reviewed'
}

export function publishedOnly<T extends PublishableEntry>(entries: T[]): T[] {
  return entries.filter((e) => isPublished(e))
}

export function byDateDesc<T extends PublishableEntry>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) =>
      (b.data.updatedDate ?? b.data.pubDate).valueOf() -
      (a.data.updatedDate ?? a.data.pubDate).valueOf(),
  )
}

/** Reading time in whole minutes, at 220 wpm. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

/** Strip markdown to plain prose — used for llms-full.txt and descriptions. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * First-40-words check.
 *
 * The GEO research is consistent that an extractable definition early in the
 * document is what gets quoted. This is used by the build-time content lint so
 * a page cannot ship with a meandering opening.
 */
export function firstNWords(text: string, n = 40): string {
  return stripMarkdown(text).split(/\s+/).slice(0, n).join(' ')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Format a Date as YYYY-MM-DD without timezone drift. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
