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
  url: 'https://agenticadlab.com',
  logo: '/assets/agenticadlab-logo.png',
  description:
    'Independent, protocol-neutral reference for agentic advertising — covering the Ad Context Protocol (AdCP) and IAB Tech Lab AAMP.',
  email: 'hello@agenticadlab.com',
  sameAs: [
    'https://agenticadlab.com',
    'https://briefgateway.com',
    'https://adcpexplorer.com',
    'https://aampexplorer.com',
  ],
  editorialPolicy:
    'Every protocol claim on these sites is generated from, or checked against, the public specification repositories, and carries the commit it was derived from.',
} as const

/**
 * Where "built by" points.
 *
 * The services index rather than the home page, and deliberately: the persona
 * study found the same unresolved question in two independent readings — the
 * About page says "Staff of one" while also saying "CEO of Postindustria", and
 * one buyer said which of those is true is most of her decision. A link to a
 * company home page does not answer it. A link to the practice, with its adtech
 * line and its delivery record on the page, does.
 */
export const POSTINDUSTRIA = 'https://postindustria.com/services/'

/** The build capability specifically, for the places that talk about shipping agents. */
export const POSTINDUSTRIA_BUILD = 'https://postindustria.com/services/ai-development/'

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
