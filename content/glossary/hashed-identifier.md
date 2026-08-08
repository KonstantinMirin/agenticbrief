---
title: 'Hashed Identifier — SHA-256, Pseudonymous, and Never Cleartext'
description: 'A hashed identifier in AdCP is a SHA-256 hash of a normalized email or phone number. The spec calls it pseudonymous PII, not anonymous, and forbids calling it otherwise.'
answer: 'A hashed identifier is a SHA-256 hash of a normalized email address or E.164 phone number, sent instead of the cleartext value. AdCP classifies it as pseudonymous PII, explicitly not anonymous and not privacy-preserving.'
pubDate: 2026-08-09
term: 'Hashed Identifier'
category: 'privacy'
cluster: 'gl-signals'
alternateNames: ['hashed email', 'hashed phone', 'hashed PII']
keywords:
  - 'hashed identifier advertising'
  - 'hashed email adcp'
  - 'sha-256 hashed email advertising'
  - 'pseudonymous vs anonymous identifier'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/audience-member.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/enums/uid-type.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/privacy-considerations'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/privacy-architecture'
  - 'https://docs.adcontextprotocol.org/docs/reference/glossary'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
related:
  - '/signals/audience-vs-signal/'
  - '/realtime/trusted-match-protocol/'
  - '/signals/signal-definition/'
  - 'https://adcpexplorer.noetis.dev/areas/trusted-match/'
seeAlso: ['audience-vs-signal', 'trusted-match-protocol']
reviewState: cto-reviewed
---

## What is a hashed identifier in AdCP?

A hashed identifier is a SHA-256 hash of a normalized email address or phone number, sent in place of the cleartext value. AdCP's glossary defines it as "buyer-normalized personally identifiable information (PII) hashed with SHA-256 before transmission".

Two fields carry them on `audience-member.json`:

| Field          | Input                                                    | Schema pattern   |
| -------------- | -------------------------------------------------------- | ---------------- |
| `hashed_email` | Lowercase, trimmed email address                         | `^[a-f0-9]{64}$` |
| `hashed_phone` | E.164-formatted phone number, for example `+12065551234` | `^[a-f0-9]{64}$` |

The pattern is lowercase hex only. Uppercase hex fails validation, which catches one of the two classic interoperability bugs in hashed matching. The other one, inconsistent normalization, is handled by the schema stating the normalization rules in the field descriptions rather than leaving them to a partner integration guide.

There is no cleartext branch. `sync_audiences` has no plaintext email or phone field anywhere. If you want to upload a customer list to an AdCP seller, you hash first.

## Are hashed identifiers anonymous?

No, and AdCP says so in the schema itself, not just in a policy page. The `hashed_email` description reads:

> Pseudonymous PII, not anonymous — the email namespace is small enough that an unsalted SHA-256 is recoverable via precomputed dictionaries. Treat as PII for retention, consent, and access-control purposes.

The reasoning is worth stating plainly because it is often waved away. SHA-256 is not reversible in the mathematical sense. That is irrelevant here. The set of real email addresses is small enough to enumerate and precompute, and commercial reverse-lookup services exist. Hashing an email is obfuscation at the transport boundary, not anonymization.

AdCP's privacy considerations page turns this into normative language:

> Operator documentation, data-processing agreements, and compliance disclosures MUST NOT describe unsalted `hashed_email` or `hashed_phone` as "privacy-preserving", "anonymous", or "de-identified". Hashing is data minimization at the transport boundary, not anonymization.

It then adds the GDPR consequences: hashed identifiers MUST be treated as PII for retention, consent, access control, subject access under Article 15 and erasure under Article 17. A subject-access request for an email address MUST resolve to records keyed by its hash where the operator retains the corresponding record. An operator can invoke Article 11 only if it genuinely cannot re-identify, and the page notes "that bar is higher than 'we hashed it'". Matching hashes against a seller's identity graph is itself a processing activity that needs its own lawful basis.

I have read a lot of ad tech specifications. This is the most direct language on the subject I have found in one.

## Does AdCP define a salted or HMAC variant?

Not in the current line. The privacy considerations page states:

> AdCP 3.0 does not define a salted or HMAC variant of `hashed_email`/`hashed_phone`; a standardized salted variant is tracked for a future minor release.

The version reference in that sentence is stale relative to the released schemas, which are at 3.1.10 per `dist/schemas/latest.json`. The substance holds: no salted variant appears in the 3.1.10 schema set.

The page names what would actually qualify as privacy-preserving, and it is a short list: salted hashing with operator-held secrets, HMAC with a cross-party shared secret, PSI (private set intersection), or a TEE with attested separation. Until one of those is standardized in the protocol, implementers that need a privacy-preserving match are told to layer it above AdCP — clean-room processing, PAIR, or identity-graph tokenization of the kind UID2 and RampID operators perform.

## What else can identify a person in an AdCP audience?

`audience-member.json` requires `external_id`, a buyer-assigned stable identifier such as a CRM record ID, and then requires at least one of three matchable identifiers:

- `hashed_email`
- `hashed_phone`
- `uids[]`, an array of universal ID objects with a `type` and a `value`

The `uid-type` enum has 11 values: `rampid`, `rampid_derived`, `id5`, `uid2`, `euid`, `pairid`, `maid`, `hashed_email`, `publisher_first_party`, `world_id_nullifier`, `other`.

Note that `hashed_email` appears twice in the protocol: as a dedicated field on the audience member, and as a value of the UID type enum. The enum entry repeats the same warning verbatim, calling it "pseudonymous PII, not anonymous". The duplication is a modelling wart, but at least the caveat travels with both copies.

Two enum entries deserve a note of their own. `world_id_nullifier` is described as "a Sybil-resistant, relying-party-scoped, unlinkable pseudonym" that "carries NO personhood or age assertion on its own". And composite identifiers, the hashed first name plus last name plus zip pattern used by Google Customer Match, are explicitly out of scope: "not yet standardized — use the `ext` field for platform-specific extensions".

## How are hashed identifiers treated at serve time?

More cautiously than at planning time, and the caution is written down.

The Trusted Match Protocol carries identity in `identity_match` requests as an `identities[]` array. The TMP privacy architecture page singles out strongly re-identifying tokens:

> `hashed_email` and similar strongly-reidentifying tokens carry higher re-identification risk than opaque provider IDs. Publishers SHOULD treat inclusion as a deployment decision, not a default.

It goes further and tells buyers to prefer opaque provider IDs over `hashed_email` when a request carries several identity types, so that a misbehaving router that discards everything except the hashed email gains nothing by doing so. The same page describes what TEE attestation does and does not fix: it "does not eliminate the disclosure but it closes the offline-retention vector".

That is the practical hierarchy. A hashed email is the most matchable identifier and the most dangerous one, and the specification treats those two facts as the same fact.

## Does AAMP handle hashed identifiers the same way?

AAMP's control plane does not carry per-person identifiers at all. There is no CRM upload, no audience member object, and no hashed field in `iab-agentic-primitives`.

The one place a hash appears is the embedding message in `agentic-audiences`, whose `identity` block has exactly three properties:

| Property     | Type   | Constraint |
| ------------ | ------ | ---------- |
| `namespace`  | string | none       |
| `value_hash` | string | none       |
| `confidence` | number | 0 to 1     |

No hashing algorithm is named. No pattern constrains the format. No normalization rule is given. The `identity` block is not in the schema's `required` array, so a conformant embedding message can omit identity entirely.

The contrast is the useful part. AdCP names SHA-256, pins the encoding with a regex, states the normalization for both input types, and writes three paragraphs of normative language about what you may not call the result. AAMP's draft names a field called `value_hash` and stops. Any implementer bridging the two has to invent the missing half themselves, and there is no interoperability guarantee waiting for them on the other side.

## How is this term sourced?

AdCP side, at commit `f1a35ab`: `dist/schemas/3.1.10/core/audience-member.json` and `dist/schemas/3.1.10/enums/uid-type.json` from release 3.1.10, the published stable release per `dist/schemas/latest.json`. Normative prose quoted from `docs/reference/privacy-considerations.mdx`, `docs/trusted-match/privacy-architecture.mdx` and `docs/reference/glossary.mdx` at the same commit. Those documentation pages sit on the repository's `main` branch, which is why one of them still refers to "AdCP 3.0".

AAMP side: `specs/v1.0/schema/embedding_format.schema.json` in `IABTechLab/agentic-audiences` at commit `106ebd6`. That specification is self-labelled "Draft v0.1", its README describes it as "LiveRamp's initial proposal", and its schema `$id` still points at the pre-donation `LiveRamp/user-context-protocol` repository. It is a draft contribution, not a ratified IAB specification.

Nothing on this page is legal advice. It is a reading of two specifications at a recorded commit.
