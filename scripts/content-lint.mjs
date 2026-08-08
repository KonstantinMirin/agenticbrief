#!/usr/bin/env node
/**
 * Content quality gate.
 *
 * This is the mechanical half of the blog's editorial pipeline, ported and made
 * executable. The blog runs three LLM passes (humanization, AI-pattern
 * detection, CTO review); an LLM has to do the judgement calls, but a large
 * part of what those passes catch is a fixed list of words, phrases and
 * structures. Those are checked here, in CI, for free.
 *
 * Rules are sourced from:
 *   .claude/skills/blog-writing/SKILL.md            banned words / phrases / structures
 *   drafts/workflows/WRITING-PROCESS.md             em dash spacing, no time estimates
 * in /srv/ws/mirinblog/main, plus the answer-first and citation requirements
 * that the GEO research adds for reference content.
 *
 * Exit codes: 0 clean, 1 errors present. Warnings never fail the build.
 *
 *   node scripts/content-lint.mjs                 # all content
 *   node scripts/content-lint.mjs content/adcp    # a subtree
 *   node scripts/content-lint.mjs --warnings-as-errors
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ---------------------------------------------------------------- rule sets

/** "The Worst Offenders" plus the per-category watchlists, verbatim. */
const BANNED_WORDS = [
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
  'renowned',
  'breathtaking',
  'garner',
  'profound',
]

/** Figurative only — "the competitive landscape" is banned, "landscape" is not. */
const CONTEXTUAL_WORDS = [
  { word: 'landscape', ok: /\b(landscape\s+(orientation|mode|format))\b/i },
  { word: 'realm', ok: null },
  { word: 'leverage', ok: /\bleverage\s+ratio\b/i },
]

const BANNED_PHRASES = [
  { find: /\bserves as an?\b/gi, fix: 'use "is"' },
  { find: /\bstands as an?\b/gi, fix: 'use "is"' },
  { find: /\bit'?s not just\b[^.]*\bit'?s\b/gi, fix: 'delete the parallelism' },
  { find: /\bnot only\b[^.]*\bbut also\b/gi, fix: 'delete the parallelism' },
  { find: /\breflects broader\b/gi, fix: 'be specific about what it reflects' },
  { find: /\bin today'?s rapidly evolving\b/gi, fix: 'delete' },
  { find: /\bat its core\b/gi, fix: 'delete' },
  { find: /\bthe interplay between\b/gi, fix: 'describe what actually happens' },
  { find: /\bthe key insight is\b/gi, fix: 'just state the insight' },
  { find: /\bit is important to note that\b/gi, fix: 'delete' },
  { find: /\bit'?s worth noting\b/gi, fix: 'delete' },
  { find: /\bin conclusion\b/gi, fix: 'delete' },
  { find: /\bindustry reports (say|suggest|show)\b/gi, fix: 'name the report' },
  { find: /\bexperts (argue|say|agree)\b/gi, fix: 'name the expert' },
  { find: /\bobservers cite\b/gi, fix: 'name the observer' },
  { find: /\bin order to\b/gi, fix: 'use "to"' },
  { find: /\bdue to the fact that\b/gi, fix: 'use "because"' },
  { find: /\bat this point in time\b/gi, fix: 'use "now"' },
  { find: /\bhas the ability to\b/gi, fix: 'use "can"' },
  { find: /\bgame[- ]changer\b/gi, fix: 'say what actually changed' },
  { find: /\brevolutioni[sz]e[sd]?\b/gi, fix: 'pundit voice — say what it does' },
]

/** Numbers that need a source. A reference site trades on being checkable. */
const UNSOURCED_STAT = /(?<![\w$])(\d{1,3}(?:\.\d+)?%|\d+x\b)/g

// ------------------------------------------------------------------ helpers

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.mdx?$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { fm: '', body: text, bodyOffset: 0 }
  return { fm: m[1], body: text.slice(m[0].length), bodyOffset: m[0].split('\n').length - 1 }
}

/** Strip code fences and inline code so a banned word inside a schema field is not a hit. */
function stripCode(body) {
  return body
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length))
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length
}

function fmValue(fm, key) {
  const m = fm.match(new RegExp(`^${key}\\s*:\\s*(.*)$`, 'm'))
  if (!m) return undefined
  return m[1].trim().replace(/^["']|["']$/g, '')
}

// -------------------------------------------------------------------- linter

function lint(file) {
  const raw = readFileSync(file, 'utf8')
  const { fm, body, bodyOffset } = splitFrontmatter(raw)
  const prose = stripCode(body)
  const issues = []

  const add = (severity, line, rule, message) => issues.push({ severity, line, rule, message })

  // --- frontmatter completeness -------------------------------------------
  if (!fm) add('error', 1, 'frontmatter', 'No frontmatter block')

  const title = fmValue(fm, 'title')
  const description = fmValue(fm, 'description')
  const answer = fmValue(fm, 'answer')
  const reviewState = fmValue(fm, 'reviewState')

  if (!title) add('error', 1, 'frontmatter', 'Missing title')
  if (!description) {
    add('error', 1, 'frontmatter', 'Missing description')
  } else if (description.length < 50 || description.length > 200) {
    add(
      'error',
      1,
      'frontmatter',
      `description is ${description.length} chars; the collection schema requires 50-200`,
    )
  }

  // --- answer-first --------------------------------------------------------
  // The single most-supported GEO finding: an extractable answer near the top
  // is what gets quoted. Enforced structurally rather than left to discipline.
  if (answer) {
    const words = answer.trim().split(/\s+/).length
    if (words > 45) {
      add('warn', 1, 'answer-first', `answer is ${words} words; aim for 40 or fewer`)
    }
    if (title && !new RegExp(`\\b${escapeRe(firstNoun(title))}`, 'i').test(answer)) {
      add(
        'warn',
        1,
        'answer-first',
        'answer does not repeat the page subject — retrieval chunks lose the referent',
      )
    }
  } else {
    add(
      'warn',
      1,
      'answer-first',
      'No `answer` field; the page opens without an extractable definition',
    )
  }

  // --- banned vocabulary ---------------------------------------------------
  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    for (const m of prose.matchAll(re)) {
      add(
        'error',
        bodyOffset + lineOf(prose, m.index),
        'banned-word',
        `"${m[0]}" is on the banned list`,
      )
    }
  }

  for (const { word, ok } of CONTEXTUAL_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    for (const m of prose.matchAll(re)) {
      const context = prose.slice(Math.max(0, m.index - 40), m.index + 40)
      if (ok && ok.test(context)) continue
      add(
        'warn',
        bodyOffset + lineOf(prose, m.index),
        'banned-word',
        `"${m[0]}" — banned in the figurative sense; confirm this use is literal`,
      )
    }
  }

  for (const { find, fix } of BANNED_PHRASES) {
    for (const m of prose.matchAll(find)) {
      add(
        'error',
        bodyOffset + lineOf(prose, m.index),
        'banned-phrase',
        `"${m[0].trim()}" — ${fix}`,
      )
    }
  }

  // --- mechanical style ----------------------------------------------------
  // Em dashes must be spaced on both sides. The blog ships this exact check.
  for (const m of prose.matchAll(/[^ \n]—|—[^ \n]/g)) {
    add(
      'error',
      bodyOffset + lineOf(prose, m.index),
      'em-dash-spacing',
      'em dash must be spaced on both sides: "word — word"',
    )
  }

  for (const m of prose.matchAll(/[“”‘’]/g)) {
    add('warn', bodyOffset + lineOf(prose, m.index), 'curly-quote', 'use straight quotes')
  }

  // No time estimates — a blog rule that applies doubly to protocol content,
  // where "this takes about a week to implement" ages badly and is unverifiable.
  const DURATION_QUANTIFIER =
    '(?:\\d+|a|an|a\\s+few|a\\s+couple\\s+of|several|one|two|three|four|five|six|seven|eight|nine|ten)'
  for (const m of prose.matchAll(
    new RegExp(
      `\\b(?:takes?|taking|in|within|under|about|roughly|around|approximately)\\s+` +
        `(?:(?:about|roughly|around|approximately|less\\s+than|up\\s+to)\\s+)?` +
        `${DURATION_QUANTIFIER}\\s+(?:minutes?|hours?|days?|weeks?|months?|quarters?)\\b`,
      'gi',
    ),
  )) {
    add(
      'warn',
      bodyOffset + lineOf(prose, m.index),
      'time-estimate',
      `"${m[0].trim()}" — the style guide forbids predicting how long work takes`,
    )
  }

  // --- structure -----------------------------------------------------------
  const headings = [...body.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => m[2].trim())
  if (headings.length === 0) {
    add('warn', 1, 'structure', 'No H2/H3 headings — nothing for retrieval to chunk on')
  }
  const questionish = headings.filter((h) =>
    /\?$|^(what|why|how|when|which|who|can|does|is)\b/i.test(h),
  )
  if (headings.length >= 3 && questionish.length === 0) {
    add(
      'warn',
      1,
      'structure',
      'No question-shaped headings; headings are matched against query fan-out sub-queries',
    )
  }

  // --- sourcing ------------------------------------------------------------
  const citations = /citations\s*:/.test(fm)
  const stats = [...prose.matchAll(UNSOURCED_STAT)]
  if (stats.length > 0 && !citations) {
    add(
      'warn',
      bodyOffset + lineOf(prose, stats[0].index),
      'unsourced-stat',
      `${stats.length} numeric claim(s) but no citations[] in frontmatter`,
    )
  }

  // --- review workflow -----------------------------------------------------
  const VALID_STATES = ['draft', 'language-checked', 'cto-reviewed', 'published']
  if (reviewState && !VALID_STATES.includes(reviewState)) {
    add(
      'error',
      1,
      'review-state',
      `reviewState "${reviewState}" is not one of ${VALID_STATES.join(', ')}`,
    )
  }

  return issues
}

function firstNoun(title) {
  return title.replace(/^(what is|how to|the|a|an)\s+/i, '').split(/\s+/)[0] ?? title
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------- main

const args = process.argv.slice(2)
const strict = args.includes('--warnings-as-errors')
const targets = args.filter((a) => !a.startsWith('--'))
const dirs = targets.length ? targets.map((t) => resolve(ROOT, t)) : [join(ROOT, 'content')]

const files = dirs.flatMap((d) => (existsSync(d) && statSync(d).isFile() ? [d] : walk(d)))

let errors = 0
let warnings = 0
let clean = 0

for (const file of files.sort()) {
  const issues = lint(file)
  if (issues.length === 0) {
    clean++
    continue
  }
  const rel = relative(ROOT, file)
  console.log(`\n${rel}`)
  for (const i of issues.sort((a, b) => a.line - b.line)) {
    const tag = i.severity === 'error' ? 'ERROR' : 'warn '
    console.log(`  ${tag} ${String(i.line).padStart(4)}  [${i.rule}] ${i.message}`)
    if (i.severity === 'error') errors++
    else warnings++
  }
}

console.log(
  `\ncontent-lint: ${files.length} file(s) — ${clean} clean, ${errors} error(s), ${warnings} warning(s)`,
)

if (files.length === 0) {
  console.log('Nothing to lint.')
}

process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0)
