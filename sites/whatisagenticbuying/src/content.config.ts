import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { glossaryTermSchema, guideSchema } from '@agenticbrief/content-utils/schemas'

// A single-answer site. It carries one canonical definition page plus the
// handful of supporting pages a reader needs to trust it, and nothing else --
// the value of an exact-match answer domain is that it is not a content farm.
export const collections = {
  glossary: defineCollection({
    loader: glob({
      pattern: '{agentic-buying,agentic-advertising,buyer-agent,seller-agent}.{md,mdx}',
      base: '../../content/glossary',
    }),
    schema: glossaryTermSchema,
  }),
  guides: defineCollection({
    loader: glob({ pattern: 'agentic-buying-*.{md,mdx}', base: '../../content/guides' }),
    schema: guideSchema,
  }),
}
