/**
 * URL sections for the glossary.
 *
 * The reviewed plan gives every term a sectioned path (/agents/sales-agent/,
 * /signals/activation/, and so on) rather than a flat /terms/ namespace,
 * because the section is a real navigational grouping and it puts a second
 * keyword in the URL.
 *
 * The mapping lives here rather than in frontmatter for one reason: it must be
 * exhaustive and collision-free across the whole site, and that is a property
 * of the set, not of any one file. A term the map does not know about still
 * renders — under /terms/ — instead of vanishing from the build.
 */

export const SECTIONS = {
  concepts: {
    title: 'Concepts and standards',
    summary: 'The protocols themselves, what they run on, and what the category is called.',
  },
  agents: {
    title: 'Agent roles, identity and discovery',
    summary: 'The actors: who buys, who sells, who vouches for whom, and how they find each other.',
  },
  'media-buying': {
    title: 'Buying objects and campaign lifecycle',
    summary: 'The things a campaign is made of once an agent has agreed to buy it.',
  },
  signals: {
    title: 'Signals, audiences and identity',
    summary: 'Targeting data: where it comes from, who owns it, and how it is activated.',
  },
  realtime: {
    title: 'Real-time execution and bidstream agents',
    summary: 'What happens at serve time, in the milliseconds an impression is decided.',
  },
  negotiation: {
    title: 'Deals, pricing and negotiation',
    summary:
      'How price is agreed. Almost entirely AAMP vocabulary — AdCP has no negotiation protocol.',
  },
  governance: {
    title: 'Governance, privacy and compliance',
    summary: 'The constraints a buy has to satisfy before it is allowed to run.',
  },
  about: {
    title: 'About',
    summary: 'How these definitions are sourced and version-pinned.',
  },
} as const

export type SectionKey = keyof typeof SECTIONS

/** slug -> section. Derived from the reviewed page plan. */
export const SECTION_OF: Record<string, SectionKey> = {
  // concepts
  adcp: 'concepts',
  aamp: 'concepts',
  'agentic-advertising': 'concepts',
  'agentic-buying': 'concepts',
  'mcp-and-a2a': 'concepts',
  opendirect: 'concepts',
  'sponsored-intelligence': 'concepts',
  ucp: 'concepts',
  'adcp-vs-aamp-terminology': 'concepts',
  // agents
  'sales-agent': 'agents',
  'seller-agent': 'agents',
  'buyer-agent': 'agents',
  agent: 'agents',
  'signal-agent': 'agents',
  'brand-agent': 'agents',
  'governance-agent': 'agents',
  'agent-card': 'agents',
  'agent-registry': 'agents',
  'discovery-files': 'agents',
  specialism: 'agents',
  // media buying
  'media-buy': 'media-buying',
  package: 'media-buying',
  product: 'media-buying',
  account: 'media-buying',
  'creative-manifest': 'media-buying',
  // signals
  'audience-vs-signal': 'signals',
  'signal-definition': 'signals',
  'signal-ref': 'signals',
  'signal-type': 'signals',
  activation: 'signals',
  'hashed-identifier': 'signals',
  'embedding-space-id': 'signals',
  'embedding-taxonomy': 'signals',
  // real time
  'trusted-match-protocol': 'realtime',
  'rtb-mutation': 'realtime',
  'artf-intent': 'realtime',
  // negotiation
  quote: 'negotiation',
  deal: 'negotiation',
  'negotiation-round': 'negotiation',
  'access-tier': 'negotiation',
  'trust-status': 'negotiation',
  'media-kit': 'negotiation',
  avails: 'negotiation',
  'change-request': 'negotiation',
  'pricing-option': 'negotiation',
  // governance
  'policy-category': 'governance',
  'audience-constraints': 'governance',
  'property-list': 'governance',
  'content-standards': 'governance',
  // about
  'sources-and-versions': 'about',
}

export function sectionFor(slug: string): SectionKey | 'terms' {
  return SECTION_OF[slug] ?? 'terms'
}

export function pathFor(slug: string): string {
  return `/${sectionFor(slug)}/${slug}/`
}
