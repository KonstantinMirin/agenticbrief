/**
 * schema.org / JSON-LD builders.
 *
 * The blog emits a single hand-rolled BlogPosting object (src/components/
 * ArticleSchema.astro). The portfolio needs a wider surface — the research
 * calls out Organization, Article/TechArticle, FAQPage, HowTo,
 * SoftwareApplication and DefinedTerm as the types that matter for AI
 * citation — so these are factored into typed builders instead.
 *
 * Two rules encoded here:
 *  1. Every page emits a @graph, not a bare object, so entities can @id-
 *     reference each other (WebSite -> Organization -> WebPage -> Article).
 *  2. Every @id is an absolute URL with a fragment, so the same entity
 *     referenced from two pages resolves to one node.
 */

import { org, author } from '@agenticbrief/shared-ui/org'

export type JsonLdNode = Record<string, unknown>

const ORG_ID = `${org.url}/#organization`
const AUTHOR_ID = `${author.url}/#person`

export function organizationNode(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: org.name,
    url: org.url,
    description: org.description,
    sameAs: [...org.sameAs],
    founder: { '@id': AUTHOR_ID },
  }
}

export function personNode(): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: author.name,
    jobTitle: author.role,
    url: author.url,
    sameAs: [...author.sameAs],
    worksFor: {
      '@type': 'Organization',
      name: author.company.name,
      url: author.company.url,
    },
  }
}

export function webSiteNode(opts: {
  siteUrl: string
  name: string
  description: string
}): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': `${opts.siteUrl}/#website`,
    url: opts.siteUrl,
    name: opts.name,
    description: opts.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  }
}

export function webPageNode(opts: {
  url: string
  siteUrl: string
  title: string
  description: string
  datePublished?: string
  dateModified?: string
  breadcrumb?: JsonLdNode
}): JsonLdNode {
  return {
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': `${opts.siteUrl}/#website` },
    inLanguage: 'en',
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.breadcrumb ? { breadcrumb: { '@id': `${opts.url}#breadcrumb` } } : {}),
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbNode(pageUrl: string, items: BreadcrumbItem[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * TechArticle for protocol reference pages, Article for editorial.
 * TechArticle carries `dependencies` and `proficiencyLevel`, which are the
 * fields that tell a model this is a spec-derived reference rather than an
 * opinion piece.
 */
export function articleNode(opts: {
  url: string
  title: string
  description: string
  datePublished: string
  dateModified?: string
  technical?: boolean
  dependencies?: string
  proficiencyLevel?: 'Beginner' | 'Expert'
  keywords?: string[]
  citations?: string[]
  section?: string
}): JsonLdNode {
  return {
    '@type': opts.technical ? 'TechArticle' : 'Article',
    '@id': `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
    ...(opts.dependencies ? { dependencies: opts.dependencies } : {}),
    ...(opts.proficiencyLevel ? { proficiencyLevel: opts.proficiencyLevel } : {}),
    ...(opts.citations?.length
      ? { citation: opts.citations.map((c) => ({ '@type': 'CreativeWork', url: c })) }
      : {}),
  }
}

export interface FaqEntry {
  question: string
  answer: string
}

/**
 * FAQPage earns no rich result any more. Google restricted it to government and
 * health domains in August 2023, stopped rendering it entirely on 2026-05-07,
 * and removed it from Search Console reporting in June 2026.
 *
 * It is kept because the type is still valid, still carries no penalty, and is
 * still parsed by Bing and by retrieval crawlers as a clean question-to-answer
 * mapping. It is emitted only where the page genuinely is Q&A-shaped and the
 * questions are visible in the HTML — decorative FAQ blocks added purely for
 * markup are the exact pattern that got the rich result killed.
 */
export function faqPageNode(pageUrl: string, entries: FaqEntry[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  }
}

export function howToNode(opts: {
  url: string
  name: string
  description: string
  steps: { name: string; text: string; url?: string }[]
  totalTime?: string
}): JsonLdNode {
  return {
    '@type': 'HowTo',
    '@id': `${opts.url}#howto`,
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  }
}

export function softwareApplicationNode(opts: {
  url: string
  name: string
  description: string
  category?: string
  operatingSystem?: string
}): JsonLdNode {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${opts.url}#app`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: opts.category ?? 'BusinessApplication',
    operatingSystem: opts.operatingSystem ?? 'Any (web)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORG_ID },
  }
}

/**
 * DefinedTerm / DefinedTermSet is the correct type for a glossary. It is not a
 * rich-result type; it exists so a retrieval system can extract "term X means Y,
 * defined by organisation Z" without parsing prose.
 */
export function definedTermSetNode(opts: {
  url: string
  name: string
  description: string
}): JsonLdNode {
  return {
    '@type': 'DefinedTermSet',
    '@id': `${opts.url}#termset`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    publisher: { '@id': ORG_ID },
  }
}

export function definedTermNode(opts: {
  url: string
  term: string
  definition: string
  termSetUrl: string
  alternateNames?: string[]
}): JsonLdNode {
  return {
    '@type': 'DefinedTerm',
    '@id': `${opts.url}#term`,
    name: opts.term,
    description: opts.definition,
    url: opts.url,
    ...(opts.alternateNames?.length ? { alternateName: opts.alternateNames } : {}),
    inDefinedTermSet: { '@id': `${opts.termSetUrl}#termset` },
  }
}

export function datasetNode(opts: {
  url: string
  name: string
  description: string
  distributionUrl?: string
  license?: string
  version?: string
}): JsonLdNode {
  return {
    '@type': 'Dataset',
    '@id': `${opts.url}#dataset`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    creator: { '@id': ORG_ID },
    ...(opts.version ? { version: opts.version } : {}),
    ...(opts.license ? { license: opts.license } : {}),
    ...(opts.distributionUrl
      ? {
          distribution: {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: opts.distributionUrl,
          },
        }
      : {}),
  }
}

/** Wrap a set of nodes into a single @graph document. */
export function graph(nodes: (JsonLdNode | null | undefined)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  })
}
