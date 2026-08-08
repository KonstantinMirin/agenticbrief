import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { glossaryTermSchema } from '@agenticbrief/content-utils/schemas'

export const collections = {
  glossary: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/glossary' }),
    schema: glossaryTermSchema,
  }),
}
