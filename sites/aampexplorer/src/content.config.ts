import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { protocolPageSchema, guideSchema } from '@agenticbrief/content-utils/schemas'

export const collections = {
  aamp: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/aamp' }),
    schema: protocolPageSchema,
  }),
  guides: defineCollection({
    loader: glob({ pattern: 'aamp-*.{md,mdx}', base: '../../content/guides' }),
    schema: guideSchema,
  }),
}
