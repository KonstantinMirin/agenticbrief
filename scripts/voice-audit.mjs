#!/usr/bin/env node
/**
 * Mechanical AI-pattern audit over the published prose.
 *
 * The humanization pass is done by agents that grade their own work, so this
 * counts the tells that can be counted: banned vocabulary, the setup phrases,
 * negative parallelism, copula avoidance, and em dash density. It cannot judge
 * whether a paragraph sounds human -- it can only prove the mechanical markers
 * are gone.
 *
 *   node scripts/voice-audit.mjs              # content/ plus the astro templates
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const WORDS = [
  'delve',
  'crucial',
  'pivotal',
  'vibrant',
  'tapestry',
  'foster',
  'enhance',
  'underscore',
  'underscores',
  'intricate',
  'testament',
  'nestled',
  'boasts',
  'showcasing',
  'multifaceted',
  'groundbreaking',
  'seamlessly',
  'robust',
  'leverage',
  'myriad',
  'realm',
  'delves',
  'renowned',
  'breathtaking',
]

const PHRASES = [
  "here's the thing",
  "here's the key insight",
  'the key insight is',
  'what this means is',
  'the short answer is',
  'let me explain',
  'it turns out that',
  "it's worth noting",
  'it is worth noting',
  'at its core',
  'in today’s rapidly evolving',
  "in today's rapidly evolving",
  'serves as a',
  'stands as a',
  'functions as a',
  'acts as a',
  'plays a vital role',
  'reflects broader',
  'the interplay between',
  'some argue',
  'many implementers',
  'experts say',
  'may potentially',
  'a testament to',
]

// "it isn't X, it's Y" / "not just X but Y" / "your job isn't X, your job is Y"
const NEG_PARALLEL = [
  /\bit'?s not just [^.,;]{2,60}[,;] it'?s\b/gi,
  /\bnot only [^.,;]{2,60}\bbut also\b/gi,
  /\bisn'?t (?:just )?(?:about )?[^.,;]{2,60}[,;] it'?s\b/gi,
]

const INFLATED = /\b(notably|importantly|significantly|fundamentally|critically)\b/gi
const HOLLOW = /(^|\n)\s*(Additionally|Furthermore|Moreover|That said)\b/g

/** Strip frontmatter, fenced code, inline code, tables and link targets. */
function prose(text, isAstro) {
  let t = text
  if (!isAstro) t = t.replace(/^---\n[\s\S]*?\n---\n/, '')
  t = t.replace(/```[\s\S]*?```/g, ' ')
  t = t.replace(/`[^`\n]*`/g, ' ')
  t = t.replace(/^\|.*\|\s*$/gm, ' ') // table rows
  t = t.replace(/\]\([^)]*\)/g, '] ') // link targets
  t = t.replace(/https?:\/\/\S+/g, ' ')
  if (isAstro) {
    t = t.replace(/^---\n[\s\S]*?\n---/, (m) => m.replace(/\{[\s\S]*?\}/g, ' '))
    t = t.replace(/<[^>]+>/g, ' ') // jsx tags, keep the text between them
    t = t.replace(/\{[^{}]*\}/g, ' ') // interpolations
    t = t.replace(/&[a-z]+;|&#\d+;/g, ' ')
  }
  return t
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = [
  ...walk(join(ROOT, 'content')).filter((f) => f.endsWith('.md')),
  ...walk(join(ROOT, 'sites')).filter((f) => f.endsWith('.astro') && f.includes(`${'src'}/pages/`)),
]

let totals = { word: 0, phrase: 0, negparallel: 0, inflated: 0, hollow: 0, emdash: 0 }
const hits = []

for (const f of files) {
  const raw = readFileSync(f, 'utf8')
  const isAstro = f.endsWith('.astro')
  const t = prose(raw, isAstro)
  const lower = t.toLowerCase()
  const rel = relative(ROOT, f)
  const local = []

  for (const w of WORDS) {
    const m = lower.match(new RegExp(`\\b${w}\\b`, 'g'))
    if (m) {
      local.push(`word:${w}×${m.length}`)
      totals.word += m.length
    }
  }
  for (const p of PHRASES) {
    let i = 0,
      n = 0
    while ((i = lower.indexOf(p, i)) !== -1) {
      n++
      i += p.length
    }
    if (n) {
      local.push(`phrase:"${p}"×${n}`)
      totals.phrase += n
    }
  }
  for (const re of NEG_PARALLEL) {
    const m = t.match(re)
    if (m) {
      local.push(`negparallel×${m.length}`)
      totals.negparallel += m.length
    }
  }
  const inf = t.match(INFLATED)
  if (inf) {
    local.push(`inflated×${inf.length}`)
    totals.inflated += inf.length
  }
  const hol = t.match(HOLLOW)
  if (hol) {
    local.push(`hollow-transition×${hol.length}`)
    totals.hollow += hol.length
  }

  const words = t.split(/\s+/).filter(Boolean).length
  const em = (t.match(/—/g) || []).length
  totals.emdash += em
  const per1k = words ? (em / words) * 1000 : 0
  if (per1k > 6) local.push(`em-dash density ${per1k.toFixed(1)}/1k (${em} in ${words}w)`)

  if (local.length) hits.push([rel, local])
}

for (const [rel, local] of hits.sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${rel}\n    ${local.join('\n    ')}`)
}

const sum = totals.word + totals.phrase + totals.negparallel + totals.inflated + totals.hollow
console.log(
  `\nvoice-audit: ${files.length} file(s) — ${sum} marker(s) ` +
    `(vocab ${totals.word}, phrase ${totals.phrase}, neg-parallel ${totals.negparallel}, ` +
    `inflated ${totals.inflated}, hollow ${totals.hollow}); ${totals.emdash} em dashes total`,
)
process.exit(sum > 0 ? 1 : 0)
