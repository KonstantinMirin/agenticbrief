import type { APIRoute } from 'astro'
import { renderRobotsTxt } from '@agenticbrief/seo/llms'
import { siteUrl } from '@agenticbrief/shared-ui/sites'

// Generated rather than kept static in public/ (the blog's approach) so the
// AI-crawler allow-list lives in one place and cannot drift between six sites.
export const GET: APIRoute = () =>
  new Response(renderRobotsTxt({ siteUrl: siteUrl('adcpexplorer') }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
