import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import {
  comparisonSchema,
  glossaryTermSchema,
  guideSchema,
  protocolPageSchema,
  templateSchema,
} from '@agenticbrief/content-utils/schemas'

// The hub is the only site that mounts every collection. Where a page also
// lives on a satellite, the satellite carries the canonical URL and the hub
// links to it -- authority is pooled here by linking, not by duplication.
export const collections = {
  comparisons: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/comparisons' }),
    schema: comparisonSchema,
  }),
  guides: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/guides' }),
    schema: guideSchema,
  }),
  glossary: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/glossary' }),
    schema: glossaryTermSchema,
  }),
  templates: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/templates' }),
    schema: templateSchema,
  }),
  adcp: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/adcp' }),
    schema: protocolPageSchema,
  }),
  aamp: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/aamp' }),
    schema: protocolPageSchema,
  }),
}
