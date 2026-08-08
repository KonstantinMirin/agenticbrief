/**
 * Publisher / organisation identity.
 *
 * Mirrors the blog's src/config/author.ts pattern: one file, imported
 * everywhere, so schema.org `publisher`, footer bylines and OG `site_name`
 * can never drift apart.
 *
 * Entity consistency is a first-order GEO signal — the same name, URL and
 * sameAs set must appear on every site in the portfolio.
 */

export const org = {
  name: 'Agentic Ad Lab',
  legalNote:
    'An independent editorial project. Not affiliated with, or endorsed by, AgenticAdvertising.org (AAO) or IAB Tech Lab.',
  url: 'https://agenticadlab.noetis.dev',
  logo: '/assets/agenticadlab-logo.png',
  description:
    'Independent, protocol-neutral reference for agentic advertising — covering the Ad Context Protocol (AdCP) and IAB Tech Lab AAMP.',
  email: 'hello@agenticadlab.com',
  sameAs: [
    'https://agenticadlab.noetis.dev',
    'https://briefgateway.noetis.dev',
    'https://adcpexplorer.noetis.dev',
    'https://aampexplorer.noetis.dev',
  ],
  editorialPolicy:
    'Every protocol claim on these sites is generated from, or checked against, the public specification repositories, and carries the commit it was derived from.',
} as const

export const author = {
  name: 'Constantine Mirin',
  role: 'CEO',
  company: {
    name: 'Postindustria',
    url: 'https://postindustria.com',
  },
  url: 'https://mirin.pro',
  sameAs: [
    'https://mirin.pro',
    'https://github.com/KonstantinMirin',
    'https://www.linkedin.com/in/konstantinmirin/',
    'https://x.com/ConstMirin',
  ],
} as const

export type Org = typeof org
export type Author = typeof author
