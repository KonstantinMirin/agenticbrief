/**
 * Build llms.txt / llms-full.txt / RSS input from content collections.
 *
 * Four of the six sites are collection-driven and would otherwise repeat the
 * same mapping four times. Keeping it here means a page that exists always
 * appears in the feeds, and a feed can never advertise a page that does not —
 * which is the failure the E2E suite checks for explicitly.
 */

export interface FeedEntry {
  id: string
  data: {
    title: string
    description: string
    answer?: string
    term?: string
    pubDate: Date
    updatedDate?: Date
  }
  body?: string
}

export interface FeedItem {
  title: string
  url: string
  note: string
  path: string
  pubDate: Date
  body: string
}

/**
 * @param entries collection entries
 * @param pathFor maps an entry id to its site-relative path
 * @param baseUrl absolute site origin
 */
export function toFeedItems(
  entries: FeedEntry[],
  pathFor: (id: string) => string,
  baseUrl: string,
): FeedItem[] {
  return entries.map((e) => {
    const path = pathFor(e.id)
    return {
      title: e.data.term ?? e.data.title,
      url: `${baseUrl}${path}`,
      note: e.data.answer ?? e.data.description,
      path,
      pubDate: e.data.updatedDate ?? e.data.pubDate,
      body: e.body ?? '',
    }
  })
}
