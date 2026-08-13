/**
 * Single source of truth for the site portfolio.
 *
 * Every site in the monorepo reads its identity from here so that nav,
 * cross-site links, JSON-LD `sameAs`, llms.txt and the deploy script all agree.
 *
 * `productionDomain` is the domain the portfolio owns and publishes on.
 * `deployDomain` is the noetis.dev host the same build is also served from.
 *
 * Canonical URLs, cross-site links and JSON-LD all use `productionDomain` as of
 * the August 2026 launch. Until then they used `deployDomain`, on the rule that
 * a canonical must never name a host that does not resolve; the .com domains
 * are registered and delegated, so that rule now points the other way. Both
 * hostnames serve the same files, and naming the .com in the canonical is what
 * stops the two from competing for the same page.
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
  /** the domain this site publishes on, and the one every canonical names */
  productionDomain: string
  /** the noetis.dev host the same build is mirrored to for development */
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

/** Canonical base URL for a site, e.g. https://adcpexplorer.com */
export function siteUrl(key: SiteKey): string {
  return `https://${SITES[key].productionDomain}`
}

/** The noetis.dev host the same build is also reachable at. Staging and diffing only. */
export function stagingUrl(key: SiteKey): string {
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
