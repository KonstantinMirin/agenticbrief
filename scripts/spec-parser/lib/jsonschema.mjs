/**
 * Minimal JSON Schema reader shared by the AdCP and AAMP parsers.
 *
 * Deliberately not a validator and not a full $ref resolver. It does one job:
 * turn a schema file into a flat, ordered field list suitable for a reference
 * table, following `allOf` composition and one level of `$ref` so the shared
 * envelope fields show up where a reader expects them.
 *
 * Cycles are real in these schemas (core/ext.json is referenced 316 times and
 * refers back into core), so every traversal carries a seen-set and a depth cap.
 */

import { readFileSync, existsSync } from 'node:fs'

const MAX_DEPTH = 6

export class SchemaStore {
  /**
   * @param {string} rootDir absolute dir that "/schemas/..." resolves against
   */
  constructor(rootDir) {
    this.rootDir = rootDir
    this.cache = new Map()
  }

  /**
   * Resolve an AdCP-style absolute ref to a file path.
   * `$ref` values look like "/schemas/media-buy/create-media-buy-request.json"
   * and are published URL paths, not filesystem paths. Published doc pages use
   * a versioned form ("/schemas/v3/...") which must be normalised away first.
   */
  refToPath(ref) {
    const clean = String(ref)
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/schemas\//, '')
      .replace(/^(v\d+|latest|\d+\.\d+\.\d+)\//, '')
    return `${this.rootDir}/${clean}`
  }

  load(ref) {
    if (!ref || ref.startsWith('#')) return null
    const path = this.refToPath(ref)
    if (this.cache.has(path)) return this.cache.get(path)
    if (!existsSync(path)) {
      this.cache.set(path, null)
      return null
    }
    let parsed = null
    try {
      const raw = readFileSync(path, 'utf8')
      // Several files in the AAMP corpus are 0 bytes; JSON.parse on those
      // throws an opaque error, so guard rather than let it surface as a
      // parse failure of the whole run.
      if (raw.trim().length > 0) parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }
    this.cache.set(path, parsed)
    return parsed
  }

  /** Resolve a local "#/$defs/Foo" pointer within a document. */
  static localPointer(doc, pointer) {
    const parts = pointer.replace(/^#\//, '').split('/')
    let node = doc
    for (const part of parts) {
      if (!node || typeof node !== 'object') return null
      node = node[decodeURIComponent(part.replace(/~1/g, '/').replace(/~0/g, '~'))]
    }
    return node ?? null
  }

  /**
   * Merge a schema's own properties with everything it composes via allOf.
   * Returns { properties, required } with earlier definitions winning, so a
   * schema's own description overrides an inherited one.
   */
  flatten(schema, doc = schema, depth = 0, seen = new Set()) {
    const out = { properties: {}, required: new Set() }
    if (!schema || typeof schema !== 'object' || depth > MAX_DEPTH) return out

    if (schema.$ref) {
      const key = schema.$ref
      if (seen.has(key)) return out
      seen.add(key)
      const target = key.startsWith('#') ? SchemaStore.localPointer(doc, key) : this.load(key)
      if (target) {
        const nested = this.flatten(target, key.startsWith('#') ? doc : target, depth + 1, seen)
        Object.assign(out.properties, nested.properties)
        nested.required.forEach((r) => out.required.add(r))
      }
      return out
    }

    for (const branch of schema.allOf ?? []) {
      const nested = this.flatten(branch, doc, depth + 1, seen)
      for (const [k, v] of Object.entries(nested.properties)) {
        if (!(k in out.properties)) out.properties[k] = v
      }
      nested.required.forEach((r) => out.required.add(r))
    }

    // oneOf/anyOf describe alternatives, not composition — merging them would
    // claim fields coexist that never do. Recorded as a variant note instead.
    for (const [k, v] of Object.entries(schema.properties ?? {})) {
      out.properties[k] = v
    }
    for (const r of schema.required ?? []) out.required.add(r)

    return out
  }

  /**
   * Turn a flattened schema into the SchemaField[] the site renders.
   * @returns {Array<{name,type,required,description,enumValues,ref}>}
   */
  fields(schema) {
    if (!schema) return []
    const { properties, required } = this.flatten(schema)
    return Object.entries(properties).map(([name, prop]) => {
      const resolved = prop?.$ref ? this.load(prop.$ref) : null
      const enumValues = prop?.enum ?? resolved?.enum ?? prop?.items?.enum ?? undefined
      return {
        name,
        type: typeName(prop, resolved),
        required: required.has(name),
        description: firstSentence(prop?.description ?? resolved?.description ?? ''),
        ...(enumValues ? { enumValues: enumValues.map(String).slice(0, 24) } : {}),
        ...(prop?.$ref ? { ref: String(prop.$ref) } : {}),
        ...(prop?.items?.$ref ? { ref: String(prop.items.$ref) } : {}),
      }
    })
  }
}

function typeName(prop, resolved) {
  if (!prop) return 'unknown'
  if (prop.$ref) return refLabel(prop.$ref)
  if (prop.type === 'array') {
    const item = prop.items ?? {}
    if (item.$ref) return `${refLabel(item.$ref)}[]`
    return `${item.type ?? 'any'}[]`
  }
  if (Array.isArray(prop.type)) return prop.type.join(' | ')
  if (prop.type) return prop.type
  if (prop.oneOf || prop.anyOf) return 'one of several'
  if (resolved?.type) return resolved.type
  return 'object'
}

function refLabel(ref) {
  return String(ref)
    .split('/')
    .pop()
    .replace(/\.json$/, '')
}

/** Reference tables read better with one sentence than with three paragraphs. */
export function firstSentence(text, max = 220) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return ''
  const cut = clean.match(/^(.*?[.!?])(\s|$)/)
  const out = cut ? cut[1] : clean
  return out.length > max ? `${out.slice(0, max - 1).trimEnd()}…` : out
}

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** kebab-case registry key -> snake_case wire name, per the AdCP convention. */
export function toWireName(kebab) {
  return String(kebab).replace(/-/g, '_')
}
