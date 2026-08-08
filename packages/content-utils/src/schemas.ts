/**
 * Shared content-collection schemas.
 *
 * The blog defines one collection with a five-field schema. The portfolio has
 * six content types across six sites, so the common fields are factored into a
 * base schema and each type extends it. Keeping `draft` and `pubDate` in the
 * base means the publication workflow (draft -> review -> publish) is
 * identical everywhere, exactly as it is on the blog.
 */

import { z } from 'astro:content'

/**
 * Fields every publishable document carries.
 *
 * `answer` is the GEO-critical one: a single sentence, under ~40 words, that
 * defines or answers the page subject. It is rendered as the first paragraph
 * and reused verbatim in meta description and FAQ schema, so the definition a
 * model extracts is the definition we wrote.
 */
export const baseFields = {
  title: z.string().min(3).max(120),
  description: z.string().min(50).max(200),
  answer: z.string().max(400).optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().optional().default(false),
  /** target keyword cluster id from data/seo-keywords.json */
  cluster: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  /** absolute URLs of sources cited in the body — mirrored into JSON-LD */
  citations: z.array(z.string().url()).default([]),
  /** internal links this page must carry, as site-relative or absolute URLs */
  related: z.array(z.string()).default([]),
  /** review workflow state, mirrors the blog's draft -> reviewed -> published */
  reviewState: z.enum(['draft', 'language-checked', 'cto-reviewed', 'published']).default('draft'),
}

export const faqEntrySchema = z.object({
  question: z.string(),
  answer: z.string(),
})

/** Protocol reference page generated from a spec repo. */
export const protocolPageSchema = z.object({
  ...baseFields,
  protocol: z.enum(['adcp', 'aamp']),
  /** e.g. "media-buy", "signals", "creative" */
  domainArea: z.string().optional(),
  /** canonical task/operation name, e.g. get_products */
  taskName: z.string().optional(),
  specVersion: z.string().optional(),
  /** commit sha of the spec repo this page was generated from */
  sourceCommit: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  generated: z.boolean().default(false),
  faq: z.array(faqEntrySchema).default([]),
})

/** One glossary term, one page. */
export const glossaryTermSchema = z.object({
  ...baseFields,
  term: z.string(),
  /** the <=40-word definition; required for glossary entries */
  answer: z.string().min(20).max(400),
  alternateNames: z.array(z.string()).default([]),
  category: z.enum([
    'agentic',
    'protocol',
    'programmatic',
    'measurement',
    'identity',
    'creative',
    'commerce',
    'privacy',
  ]),
  seeAlso: z.array(z.string()).default([]),
})

/** Editorial comparison / analysis page. */
export const comparisonSchema = z.object({
  ...baseFields,
  subjects: z.array(z.string()).min(2),
  faq: z.array(faqEntrySchema).default([]),
  verdict: z.string().optional(),
})

/** Guide / how-to page. */
export const guideSchema = z.object({
  ...baseFields,
  steps: z.array(z.object({ name: z.string(), text: z.string() })).default([]),
  totalTime: z.string().optional(),
  faq: z.array(faqEntrySchema).default([]),
})

/** Downloadable template or worked example. */
export const templateSchema = z.object({
  ...baseFields,
  channel: z.string().optional(),
  vertical: z.string().optional(),
  formats: z.array(z.string()).default([]),
  worked: z.boolean().default(false),
})

export type ReviewState = z.infer<typeof baseFields.reviewState>
