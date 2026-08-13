---
title: 'Hashed Identifier: SHA-256 email and phone as pseudonymous PII'
description: 'A hashed identifier is a SHA-256 hash of a normalized email or phone address. What AdCP requires, why it classifies the result as pseudonymous PII, and where cleartext still travels.'
answer: 'A hashed identifier is a SHA-256 digest of a normalized email address or E.164 phone number sent in place of the cleartext value, which AdCP classifies as pseudonymous PII rather than anonymous or privacy-preserving.'
pubDate: 2026-08-09
updatedDate: 2026-08-09
term: 'Hashed Identifier'
alternateNames: ['hashed email', 'hashed phone', 'hashed PII']
category: 'privacy'
cluster: 'gl-signals'
keywords:
  - 'hashed identifier advertising'
  - 'hashed email adcp'
  - 'sha-256 hashed email advertising'
  - 'hashed email pseudonymous pii'
citations:
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/audience-member.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/user-match.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/uid-type.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/trusted-match/identity-match-request.json'
  - 'https://docs.adcontextprotocol.org/docs/reference/privacy-considerations'
  - 'https://docs.adcontextprotocol.org/docs/trusted-match/privacy-architecture'
  - 'https://docs.adcontextprotocol.org/docs/reference/known-limitations'
  - 'https://github.com/IABTechLab/agentic-audiences/blob/106ebd645668677ff8be458877a5684a5d229961/specs/v1.0/schema/embedding_format.schema.json'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/2fc7029fb9eca801bc94586aec398906aa6af6c0/spec/jsonschema/ConsentContext.json'
  - 'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/proto/com/iabtechlab/openrtb/v2/openrtb.proto'
related:
  - '/signals/audience-vs-signal/'
  - '/realtime/trusted-match-protocol/'
  - '/signals/signal-definition/'
  - '/about/sources-and-versions/'
  - 'https://adcpexplorer.com/areas/trusted-match/'
  - 'https://aampexplorer.com/repos/agentic-audiences/'
seeAlso: ['audience-vs-signal', 'trusted-match-protocol', 'signal-definition']
reviewState: cto-reviewed
---

A hashed identifier is a SHA-256 digest of a normalized email address or phone number, sent in place of the cleartext value. The practice is older than either protocol: buyers and sellers have exchanged hashed email for years to match a customer list against a seller's audience without moving the addresses themselves. AdCP defines two such fields, and the buyer does the normalizing.

| Field          | What the buyer must hash                          | Schema pattern   |
| -------------- | ------------------------------------------------- | ---------------- |
| `hashed_email` | Lowercase, trimmed email address                  | `^[a-f0-9]{64}$` |
| `hashed_phone` | E.164-formatted phone number, e.g. `+12065551234` | `^[a-f0-9]{64}$` |

The buyer hashes its customer list, the seller hashes the identifiers it already holds, and the people whose digests collide are the matched audience. The share the seller finds is the match rate.

Match rates depend on both sides normalizing identically before hashing. The pattern is lowercase hex, so a case-mismatched hash fails validation instead of silently failing to match, and the normalization rule itself sits in the field description rather than in a partner integration guide.

Both fields also sit on `core/user-match.json`, which attributes conversions through `log_event`, so the term reaches measurement as well as the [audience-versus-signal](/signals/audience-vs-signal/) question.

## A hashed identifier is still personal data

The `hashed_email` description says so in the schema:

> Pseudonymous PII, not anonymous — the email namespace is small enough that an unsalted SHA-256 is recoverable via precomputed dictionaries. Treat as PII for retention, consent, and access-control purposes.

The set of real email addresses is small enough to enumerate, so tables of addresses and their hashes are cheap to build and already exist. Against such a table an unsalted digest is a lookup key for the address rather than a barrier to it.

The normative version is in `privacy-considerations.mdx`:

> Operator documentation, data-processing agreements, and compliance disclosures MUST NOT describe unsalted `hashed_email` or `hashed_phone` as "privacy-preserving", "anonymous", or "de-identified". Hashing is data minimization at the transport boundary, not anonymization.

AdCP's privacy documentation names the specific GDPR obligations it considers engaged. Art. 15 access and Art. 17 erasure both apply: a request arrives as an email address and has to resolve to records keyed by that address's hash. Art. 11 relieves only a controller that genuinely cannot identify the person, and AdCP's gloss is that "that bar is higher than 'we hashed it'". Matching against a seller's graph is a processing activity in its own right, with its own lawful basis to find.

## Salting and HMAC

`privacy-considerations.mdx` names four primitives that would qualify as privacy-preserving: salted hashing with operator-held secrets, HMAC with a shared secret, private set intersection, an attested TEE. None is in the protocol, and implementers who need one are told to layer it on top.

Salting defeats the dictionary attack. It also defeats the match, unless both parties hold the same salt — which makes it a key-management problem, and AdCP specifies no key exchange. On the TEE option, AdCP's position is that attestation "does not eliminate the disclosure but it closes the offline-retention vector".

## Cleartext identifiers AdCP accepts

| Carrier                                      | What it accepts                                                | Caveat in the spec                                                        |
| -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `audience_member.external_id`                | Cleartext CRM or loyalty ID, required on every member          | buyer-assigned and buyer-scoped; the seller cannot resolve it to a person |
| `user_match.client_ip` + `client_user_agent` | Cleartext IP and UA, and that pair alone satisfies the `anyOf` | "for probabilistic matching"                                              |

Five `anyOf` branches sit on `user-match.json`. Two are the hashed fields. One is `client_ip` plus `client_user_agent`, accepted in cleartext as an alternative to either hashed field and described only as probabilistic matching; the privacy page never mentions `client_ip`.

A third cleartext CRM identifier is declared with nowhere to put it. `get_adcp_capabilities` lets a seller advertise that it matches `platform_customer_id`, an ID in a namespace it already shares with the buyer, and describes buyers putting those values into `AudienceMember.identifiers`. There is no `identifiers` container: the properties on `audience-member.json` are flat, and the field appears in exactly one schema file in the release.

`known-limitations.mdx` says "If you need cleartext PII on the wire, AdCP is not the right carrier", then scopes the claim to email and phone.

## What counts as a UID

Every audience member needs an `external_id`, plus at least one of `hashed_email`, `hashed_phone` or `uids[]`. The `uid-type` enum behind that third branch holds `rampid`, `rampid_derived`, `id5`, `uid2`, `euid`, `pairid`, `maid`, `hashed_email`, `publisher_first_party`, `world_id_nullifier` and `other`. AdCP's glossary lists six of them, omitting `hashed_email`, and calls a UID "an already-resolved, privacy-preserving user token from an identity graph", a description the privacy page forbids for `hashed_email`, which is itself one of the `uid_type` values.

`world_id_nullifier` carries a narrower claim than its name suggests: an unlinkable pseudonym scoped to one relying party, which "carries NO personhood or age assertion on its own". Composite identifiers are not modelled at all: the hashed-name-plus-postcode pattern Google Customer Match uses has no field here and is "not yet standardized — use the `ext` field for platform-specific extensions", so a buyer that matches on name and postcode is outside the schema.

In [Trusted Match](/realtime/trusted-match-protocol/), `identities[].user_token` is documented as something the buyer cannot reverse to PII, while its sibling `identities[].uid_type` `$ref`s the enum whose `hashed_email` entry says the opposite.

The privacy-architecture page patches that in prose rather than in the enum, telling publishers that strongly-reidentifying tokens "carry higher re-identification risk than opaque provider IDs" and that including them is "a deployment decision, not a default". It tells buyers to prefer opaque provider IDs when a request carries several identity types, so that a misbehaving router discarding everything except the hashed email gains nothing by doing so.

## Hashed identifiers in AAMP

AAMP's control-plane schemas define no per-person identifier. The one place a person is hashed is the `identity` block in `agentic-audiences`: `namespace` and `value_hash`, both bare strings with no constraint, plus a `confidence` number. The schema names no algorithm and sets no pattern, and requires neither the `identity` block nor the `consent` block beside it, so a conformant message can carry a person-hash with no consent attached. That repository is self-labelled Draft v0.1, "LiveRamp's initial proposal", with a schema `$id` still pointing at the pre-donation `LiveRamp/user-context-protocol` repository.

AAMP regulates consent at the deal instead of at the identifier. `ConsentContext.json` carries GPP and TCF strings, `us_privacy`, and an SGP diligence status, all "carried opaque: no decoding/vendor-list validation is claimed." The one person-level ID it moves is inherited: OpenRTB v2's `user.eids` and `buyeruid` are vendored whole into the Agentic RTB Framework, and the framework adds no hashing rule of its own.
