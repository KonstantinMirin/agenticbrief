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
 * of the set, not of any one file. An unmapped published term fails the build
 * rather than rendering at an untitled path.
 */

export const SECTIONS = {
  concepts: {
    title: 'Concepts and standards',
    summary:
      'The protocols themselves, the transports they run on, and the names the category is given.',
  },
  agents: {
    title: 'Agent roles, identity and discovery',
    summary:
      'The parties to an agentic trade, the identity each one publishes, and the directories that list them.',
  },
  'media-buying': {
    title: 'Buying objects and campaign lifecycle',
    summary:
      'A bought campaign breaks into a media buy, its packages and the products behind them.',
  },
  signals: {
    title: 'Signals, audiences and identity',
    summary: 'Targeting data, who owns it, and the call that makes it usable on a destination.',
  },
  realtime: {
    title: 'Real-time execution and bidstream agents',
    summary: 'These terms run at serve time, while an impression is being decided.',
  },
  negotiation: {
    title: 'Deals, pricing and negotiation',
    summary:
      'How a price is agreed and booked: quotes, deals, negotiation rounds, access tiers and trust status.',
  },
  governance: {
    title: 'Governance, privacy and compliance',
    summary: 'The constraints a buy has to satisfy before it is allowed to run.',
  },
  about: {
    title: 'About',
    summary:
      'Which specification each definition comes from, and the terms this glossary leaves out on purpose.',
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

export function sectionFor(slug: string): SectionKey {
  const section = SECTION_OF[slug]
  if (!section) throw new Error(`glossary term "${slug}" has no section in SECTION_OF`)
  return section
}

export function pathFor(slug: string): string {
  return `/${sectionFor(slug)}/${slug}/`
}
