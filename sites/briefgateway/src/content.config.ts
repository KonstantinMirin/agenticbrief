import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import {
  templateSchema,
  guideSchema,
  comparisonSchema,
  baseFields,
} from '@agenticbrief/content-utils/schemas'
import { z } from 'astro:content'

export const collections = {
  briefs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/briefs' }),
    schema: z.object({
      ...baseFields,
      channel: z.string().optional(),
      worked: z.boolean().default(false),
    }),
  }),
  templates: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/templates' }),
    schema: templateSchema,
  }),
  guides: defineCollection({
    loader: glob({ pattern: 'brief-*.{md,mdx}', base: '../../content/guides' }),
    schema: guideSchema,
  }),
  comparisons: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/comparisons' }),
    schema: comparisonSchema,
  }),
}
