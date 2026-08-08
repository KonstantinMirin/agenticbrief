/**
 * Single source of truth for the site portfolio.
 *
 * Every site in the monorepo reads its identity from here so that nav,
 * cross-site links, JSON-LD `sameAs`, llms.txt and the deploy script all agree.
 *
 * `productionDomain` is the domain the portfolio will eventually own.
 * `deployDomain` is where it is served today (a noetis.dev subdomain).
 * Canonical URLs use `deployDomain` until the .com domains are live, so that
 * we never emit a canonical pointing at a host that does not resolve.
 */

export type SiteRole = 'hub' | 'tool' | 'explorer' | 'answer' | 'glossary'

export interface SiteDefinition {
  /** workspace directory name under sites/ */
  key: string
  /** human name used in nav + og:site_name */
  name: string
  /** one-line positioning, used for meta description fallback and llms.txt */
  tagline: string
  role: SiteRole
  /** the domain we intend to own */
  productionDomain: string
  /** the domain we serve from today */
  deployDomain: string
  /** whether this site appears in the shared cross-portfolio nav */
  inNav: boolean
  /** short nav label */
  navLabel: string
}

export const SITES = {
  agenticadlab: {
    key: 'agenticadlab',
    name: 'Agentic Ad Lab',
    tagline:
      'Protocol-neutral reference for agentic advertising: AdCP, AAMP, and how machines buy media.',
    role: 'hub',
    productionDomain: 'agenticadlab.com',
    deployDomain: 'agenticadlab.noetis.dev',
    inNav: true,
    navLabel: 'Lab',
  },
  briefgateway: {
    key: 'briefgateway',
    name: 'Brief Gateway',
    tagline: 'Turn a campaign brief into a structured object a seller agent can actually consume.',
    role: 'tool',
    productionDomain: 'briefgateway.com',
    deployDomain: 'briefgateway.noetis.dev',
    inNav: true,
    navLabel: 'Brief Gateway',
  },
  adcpexplorer: {
    key: 'adcpexplorer',
    name: 'AdCP Explorer',
    tagline: 'Every Ad Context Protocol task, schema and discovery file, browsable and linkable.',
    role: 'explorer',
    productionDomain: 'adcpexplorer.com',
    deployDomain: 'adcpexplorer.noetis.dev',
    inNav: true,
    navLabel: 'AdCP Explorer',
  },
  aampexplorer: {
    key: 'aampexplorer',
    name: 'AAMP Explorer',
    tagline:
      "Reference for IAB Tech Lab's Agentic Advertising Management Protocols and their component repos.",
    role: 'explorer',
    productionDomain: 'aampexplorer.com',
    deployDomain: 'aampexplorer.noetis.dev',
    inNav: true,
    navLabel: 'AAMP Explorer',
  },
  whatisagenticbuying: {
    key: 'whatisagenticbuying',
    name: 'What Is Agentic Buying',
    tagline: 'A single, definitive, citable answer to one question.',
    role: 'answer',
    productionDomain: 'whatisagenticbuying.com',
    deployDomain: 'whatisagenticbuying.noetis.dev',
    inNav: true,
    navLabel: 'Agentic Buying',
  },
  adtechglossary: {
    key: 'adtechglossary',
    name: 'Ad Tech Glossary',
    tagline:
      'Plain-language definitions for the vocabulary of agentic and programmatic advertising.',
    role: 'glossary',
    productionDomain: 'adtechglossary.com',
    deployDomain: 'adtechglossary.noetis.dev',
    inNav: true,
    navLabel: 'Glossary',
  },
} as const satisfies Record<string, SiteDefinition>

export type SiteKey = keyof typeof SITES

export const SITE_KEYS = Object.keys(SITES) as SiteKey[]

/** Base URL a site is currently served from, e.g. https://adcpexplorer.noetis.dev */
export function siteUrl(key: SiteKey): string {
  return `https://${SITES[key].deployDomain}`
}

/** Absolute URL for a path on a given site. Always trailing-slash normalised. */
export function absoluteUrl(key: SiteKey, path = '/'): string {
  const base = siteUrl(key)
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function getSite(key: SiteKey): SiteDefinition {
  return SITES[key]
}
