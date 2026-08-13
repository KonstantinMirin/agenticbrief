#!/usr/bin/env node
/**
 * Rasterise Open Graph cards.
 *
 * Reads a manifest of {site, path, title, eyebrow} records, composes each as
 * SVG via @agenticbrief/seo/og, and writes a PNG into the site's
 * public/og/ directory. sharp is already in the tree (Astro depends on it for
 * image optimisation), so this needs no extra dependency.
 *
 * Idempotent: a card is only rewritten if its source SVG changed, so repeated
 * builds do not churn the working tree.
 *
 * Usage:
 *   node scripts/og-generator/generate.mjs            # all sites
 *   node scripts/og-generator/generate.mjs adcpexplorer
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const MANIFEST = join(ROOT, 'data', 'og-manifest.json')

/** Rebuild-skip cache, kept out of any directory that gets published. */
async function cacheDirFor(site) {
  const dir = join(ROOT, '.cache', 'og', site)
  await mkdir(dir, { recursive: true })
  return dir
}

// Inlined rather than imported: this is a plain Node script and the package
// exports are TypeScript. Keep in sync with packages/seo/src/og.ts.
const WIDTH = 1200
const HEIGHT = 630

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrap(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/)
  const lines = []
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
  return lines
}

function ogCardSvg({ title, eyebrow, siteName, domain, accent = '#5c8ab8' }) {
  const titleLines = wrap(title, 30, 4)
  const fontSize = titleLines.length > 3 ? 62 : titleLines.length > 2 ? 70 : 80
  const lineHeight = Math.round(fontSize * 1.18)
  const blockHeight = titleLines.length * lineHeight
  const startY = Math.round((HEIGHT - blockHeight) / 2) + fontSize - 10
  const tspans = titleLines
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
    eyebrow
      ? `<text x="80" y="120" font-family="DejaVu Sans, Verdana, sans-serif" font-size="26" font-weight="600" letter-spacing="3" fill="${accent}">${escapeXml(String(eyebrow).toUpperCase())}</text>`
      : ''
  }
  <text font-family="DejaVu Serif, Georgia, serif" font-size="${fontSize}" font-weight="700" fill="#f4f6f8">${tspans}</text>
  <line x1="80" y1="${HEIGHT - 106}" x2="${WIDTH - 80}" y2="${HEIGHT - 106}" stroke="#33465a" stroke-width="2"/>
  <text x="80" y="${HEIGHT - 58}" font-family="DejaVu Sans, Verdana, sans-serif" font-size="28" font-weight="600" fill="#c6d3de">${escapeXml(siteName)}</text>
  <text x="${WIDTH - 80}" y="${HEIGHT - 58}" text-anchor="end" font-family="DejaVu Sans, Verdana, sans-serif" font-size="26" fill="#7e93a6">${escapeXml(domain)}</text>
</svg>`
}

function ogFileName(pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index'
  return `og-${slug.toLowerCase()}.png`
}

async function main() {
  const only = process.argv[2]

  if (!existsSync(MANIFEST)) {
    console.error(`No manifest at ${MANIFEST}. Run the content build first.`)
    process.exit(1)
  }

  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const entries = only ? manifest.filter((e) => e.site === only) : manifest

  let written = 0
  let skipped = 0

  for (const entry of entries) {
    const svg = ogCardSvg(entry)
    const outDir = join(ROOT, 'sites', entry.site, 'public', 'og')
    await mkdir(outDir, { recursive: true })
    const outPath = join(outDir, ogFileName(entry.path))
    // The rebuild-skip cache lives outside public/, because everything under
    // public/ is copied verbatim into dist/ and served. Kept alongside the
    // image it guards, ninety-nine .hash sidecars shipped to the web root.
    const hashPath = join(await cacheDirFor(entry.site), `${ogFileName(entry.path)}.hash`)
    const hash = createHash('sha1').update(svg).digest('hex')

    if (existsSync(outPath) && existsSync(hashPath)) {
      const prev = await readFile(hashPath, 'utf8')
      if (prev.trim() === hash) {
        skipped++
        continue
      }
    }

    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath)
    await writeFile(hashPath, hash)
    written++
  }

  // Every site also needs a fallback card for pages not in the manifest.
  const sites = [...new Set(manifest.map((e) => e.site))]
  for (const site of sites) {
    const fallbackEntry = manifest.find((e) => e.site === site && e.path === '/')
    if (!fallbackEntry) continue
    const outDir = join(ROOT, 'sites', site, 'public')
    await mkdir(outDir, { recursive: true })
    await sharp(Buffer.from(ogCardSvg(fallbackEntry)))
      .png({ compressionLevel: 9 })
      .toFile(join(outDir, 'og-default.png'))
  }

  console.log(`OG cards: ${written} written, ${skipped} unchanged, ${sites.length} fallbacks.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
