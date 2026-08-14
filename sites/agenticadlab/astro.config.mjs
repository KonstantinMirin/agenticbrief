import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import rehypeExternalLinks from 'rehype-external-links'
import { sitemapConfig } from '@agenticbrief/seo/sitemap'

// Mirrors the blog's astro.config.mjs: mdx + sitemap, gfm + smartypants on the
// markdown pipeline, external links opened in a new tab. Differences from the
// blog are deliberate and noted:
//  - sitemap() is configured (priority curve + endpoint exclusions) rather than
//    called bare, because these are reference sites with a real page hierarchy.
//  - no partytown/analytics: nothing is loaded from a third party until the
//    portfolio has an analytics decision of its own.
export default defineConfig({
  site: 'https://agenticadlab.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap(sitemapConfig())],
  markdown: {
    // css-variables mode: Shiki's inline background/color read design-tokens'
    // --astro-code-* custom properties (packages/shared-ui/src/styles/global.css)
    // instead of a hardcoded theme, so syntax colour follows this site's own
    // --bg-subtle/--fg/--accent (spec ruling 12; dark mode is removed portfolio-wide,
    // so there is no cascade to follow any more — light values only).
    shikiConfig: { theme: 'css-variables' },
    remarkPlugins: [remarkGfm, remarkSmartypants],
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'nofollow'] }]],
  },
})
