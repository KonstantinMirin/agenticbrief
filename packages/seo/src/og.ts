/**
 * Open Graph card generation.
 *
 * The blog ships one static social-v2.png for every page. That is fine for a
 * single-author blog and wrong for a reference site, where the shared link is
 * usually to a specific task or term and the card should say which.
 *
 * Rather than pull in a wasm canvas at build time, cards are composed as SVG
 * here and rasterised to PNG by scripts/og-generator/generate.mjs. The SVG is
 * deterministic, diffable, and renders identically without a font server
 * because it uses a generic font stack.
 */

export interface OgCardOptions {
  title: string
  /** small label above the title, e.g. "AdCP Task" or "Glossary" */
  eyebrow?: string
  /** site name shown bottom-left */
  siteName: string
  /** domain shown bottom-right */
  domain: string
  accent?: string
}

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Naive width-aware wrap. Character-count wrapping is imprecise for a
 * proportional font, but the card has generous margins and a hard 4-line cap,
 * so an approximate break is safe and avoids shipping a font metrics table.
 */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
    if (lines.length === maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current)
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1]
    if (last && text.length > lines.join(' ').length) {
      lines[maxLines - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`
    }
  }
  return lines
}

export function ogCardSvg(opts: OgCardOptions): string {
  const accent = opts.accent ?? '#5c8ab8'
  const titleLines = wrap(opts.title, 30, 4)
  const fontSize = titleLines.length > 3 ? 62 : titleLines.length > 2 ? 70 : 80
  const lineHeight = Math.round(fontSize * 1.18)
  const blockHeight = titleLines.length * lineHeight
  const startY = Math.round((HEIGHT - blockHeight) / 2) + fontSize - 10

  const titleTspans = titleLines
    .map((line, i) => `<tspan x="80" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1720"/>
      <stop offset="100%" stop-color="#1a2a3a"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="${HEIGHT}" fill="${accent}"/>
  ${
    opts.eyebrow
      ? `<text x="80" y="120" font-family="Verdana, DejaVu Sans, sans-serif" font-size="26" font-weight="600" letter-spacing="3" fill="${accent}">${escapeXml(
          opts.eyebrow.toUpperCase(),
        )}</text>`
      : ''
  }
  <text font-family="Georgia, DejaVu Serif, serif" font-size="${fontSize}" font-weight="700" fill="#f4f6f8">${titleTspans}</text>
  <line x1="80" y1="${HEIGHT - 106}" x2="${WIDTH - 80}" y2="${HEIGHT - 106}" stroke="#33465a" stroke-width="2"/>
  <text x="80" y="${HEIGHT - 58}" font-family="Verdana, DejaVu Sans, sans-serif" font-size="28" font-weight="600" fill="#c6d3de">${escapeXml(opts.siteName)}</text>
  <text x="${WIDTH - 80}" y="${HEIGHT - 58}" text-anchor="end" font-family="Verdana, DejaVu Sans, sans-serif" font-size="26" fill="#7e93a6">${escapeXml(opts.domain)}</text>
</svg>`
}

/** Deterministic filename for a page's card. */
export function ogFileName(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index'
  return `og-${slug.toLowerCase()}.png`
}

export function ogUrl(siteUrl: string, pathname: string): string {
  return `${siteUrl}/og/${ogFileName(pathname)}`
}
