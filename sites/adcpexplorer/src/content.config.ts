import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { protocolPageSchema, guideSchema } from '@agenticbrief/content-utils/schemas'

// Content lives in the monorepo's shared /content tree, not inside the site,
// so a page can be surfaced by more than one site without being duplicated on
// disk. Same glob-loader pattern as the blog, different base.
export const collections = {
  adcp: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/adcp' }),
    schema: protocolPageSchema,
  }),
  guides: defineCollection({
    loader: glob({ pattern: 'adcp-*.{md,mdx}', base: '../../content/guides' }),
    schema: guideSchema,
  }),
}
