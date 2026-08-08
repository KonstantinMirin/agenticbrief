/**
 * The shape the spec parsers emit into data/adcp-specs.json and
 * data/aamp-specs.json, and that the explorer sites render.
 *
 * Deliberately protocol-neutral: AdCP tasks and AAMP operations are both
 * `ProtocolTask`, so the comparison page can diff two arrays of the same type
 * instead of special-casing each stack.
 *
 * This file is the contract between scripts/spec-parser and sites/. If a parser
 * starts emitting a field, declare it here — the sites consume these as typed
 * JSON, so an undeclared field type-checks as absent while rendering fine, and
 * that divergence is exactly how a page ends up printing `undefined`.
 */

export interface SpecProvenance {
  /** repo the data was parsed from */
  repo: string
  /** commit sha at parse time — printed on every generated page */
  commit: string
  /** ISO timestamp of the parse run */
  parsedAt: string
  /** upstream URL for the file this record came from */
  sourceUrl?: string
  /** path within the repo */
  sourcePath?: string
}

export interface SchemaField {
  name: string
  type: string
  required: boolean
  description?: string
  /** enum values, if the field is constrained */
  enumValues?: string[]
  /** for nested objects/arrays, the referenced schema id */
  ref?: string
}

export interface CodeExample {
  title: string
  language: string
  code: string
}

export interface ProtocolTask {
  /** canonical machine name, e.g. get_products */
  name: string
  /** display title, e.g. "Get Products" */
  title: string
  /** the sub-protocol / domain area, e.g. media-buy, signals, creative */
  area: string
  /** one-sentence description, sourced from the spec. Empty if the spec has none. */
  summary: string
  /** longer description if the spec provides one */
  description?: string
  requestFields: SchemaField[]
  responseFields: SchemaField[]
  /** JSON examples pulled from the spec repo */
  examples: CodeExample[]
  provenance: SpecProvenance
  /** slug used for the page URL */
  slug: string

  /** AdCP: the operation writes state (x-mutates-state) */
  mutatesState?: boolean
  /** AdCP: x-status, one of stable | experimental | deprecated */
  status?: string
  requestSchemaId?: string
  responseSchemaId?: string
  /** path of the upstream doc page, relative to its docs root */
  docSlug?: string

  /** AAMP: operations sourced from an OpenAPI document carry their route */
  httpMethod?: string
  httpPath?: string
}

export interface ProtocolObject {
  name: string
  title: string
  summary: string
  fields: SchemaField[]
  provenance: SpecProvenance
  slug: string
  /** AAMP: which plane this object belongs to */
  plane?: string
  /** AAMP: the upstream standard it comes from, e.g. OpenDirect, AdCOM */
  standard?: string
}

export interface ProtocolEnum {
  name: string
  summary: string
  values: { name: string; value: number; description?: string }[]
  plane?: string
  slug: string
  provenance: SpecProvenance
}

export interface ProtocolArea {
  /** e.g. media-buy */
  key: string
  title: string
  summary: string
  taskNames: string[]
  /** which protocol layer / plane this area sits in */
  layer?: string
  provenance?: SpecProvenance
}

export interface ProtocolLayer {
  id: string
  title: string
  description: string
  /** area keys in this layer. May name a schema group with no operations. */
  areaKeys: string[]
}

export interface DiscoveryFileVariant {
  name: string
  summary: string
  fields: SchemaField[]
}

export interface DiscoveryFile {
  /** e.g. adagents.json */
  name: string
  purpose: string
  location: string
  /** populated only when the file is a single object rather than a union */
  fields: SchemaField[]
  /**
   * Alternative shapes, when the schema is a `oneOf`. These are mutually
   * exclusive — merging their fields would describe a document that cannot
   * exist — so they are surfaced separately rather than flattened.
   */
  variants?: DiscoveryFileVariant[]
  examples?: CodeExample[]
  provenance: SpecProvenance
}

export interface GlossaryTerm {
  term: string
  definition: string
  slug: string
}

export interface ProtocolComponent {
  name: string
  repo: string
  purpose: string
  kind: 'specification' | 'reference-implementation' | 'hub' | 'example'
  commit?: string
  version?: string
  /** false for repos the umbrella project does not list */
  listedInHub?: boolean
}

/** Operations present on the working branch but in no published release. */
export interface UnreleasedDelta {
  addedInMain: string[]
  removedInMain: string[]
  /** the version the working tree claims, which may be stale */
  sourceStamp: string | null
}

export interface ProtocolSpec {
  /** adcp | aamp */
  id: string
  name: string
  fullName: string
  /** note when the corpus disagrees with itself about the name */
  fullNameNote?: string
  version: string
  /** stable | unreleased-main | per-repository */
  versionChannel?: string
  /** what a page should print next to the version, verbatim */
  versionLabel?: string
  stability?: string
  lastUpdated?: string
  unreleased?: UnreleasedDelta
  governance: string
  license: string
  homepage: string
  docsHomepage?: string
  repository: string
  /** one-paragraph neutral summary */
  summary: string
  layers: ProtocolLayer[]
  areas: ProtocolArea[]
  tasks: ProtocolTask[]
  objects: ProtocolObject[]
  enums?: ProtocolEnum[]
  discoveryFiles: DiscoveryFile[]
  glossary?: GlossaryTerm[]
  /** component repos, for AAMP's multi-repo structure */
  components: ProtocolComponent[]
  counts?: Record<string, number>
  provenance: SpecProvenance
  /** anything the parser could not resolve — surfaced so pages never invent it */
  gaps: string[]
}
