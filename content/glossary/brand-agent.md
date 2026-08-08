---
title: 'Brand Agent'
description: "A brand agent serves brand identity and licensable rights in AdCP. It is one of five brand.json variants and a role in two protocols, but it is not an entry in AdCP's own glossary."
answer: 'A brand agent is the AdCP agent that serves brand identity and licensable rights. It is a brand.json variant and a role in the Brand and Sponsored Intelligence protocols. AAMP has no brand agent.'
pubDate: 2026-08-09
term: 'Brand Agent'
alternateNames: ['brand identity agent', 'rights agent']
category: 'agentic'
cluster: 'gl-roles'
keywords:
  - 'brand agent advertising'
  - 'what is a brand agent'
  - 'adcp brand protocol agent'
  - 'brand.json brand agent'
citations:
  - 'https://docs.adcontextprotocol.org/docs/brand-protocol/key-concepts'
  - 'https://docs.adcontextprotocol.org/docs/protocol/required-tasks'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/brand-protocol/key-concepts.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/protocol/required-tasks.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/brand.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/index.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/reference/glossary.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/docs/learning/specialist/brand.mdx'
related:
  - '/agents/agent/'
  - '/agents/discovery-files/'
  - '/agents/governance-agent/'
  - '/concepts/sponsored-intelligence/'
  - 'https://adcpexplorer.noetis.dev/areas/brand/'
  - 'https://adcpexplorer.noetis.dev/areas/sponsored-intelligence/'
seeAlso: ['brand.json', 'Agent', 'Sponsored Intelligence', 'Governance Agent']
reviewState: cto-reviewed
---

## What is a brand agent?

A brand agent is the AdCP agent that answers questions about a brand: who it is, what it looks like, what may be said about it, and what talent likeness or voice may be generated on its behalf.

AdCP's own architecture table puts it in one line: "Brand agent — manages brand identity and guidelines via `brand.json`."

Worth knowing before you cite it: **brand agent is not an entry in AdCP's glossary**. `docs/reference/glossary.mdx` has bolded entries for Agent, Sales Agent and Signal Agent, and none for Brand Agent. The term is defined by the Brand Protocol documentation, by the `brand.json` schema, and by the role headings in `docs/protocol/required-tasks.mdx`. If you need a citable definition, cite those, not the glossary.

Version pin: AdCP **3.1.10**, per `dist/schemas/latest.json`, repository at commit `f1a35ab`.

## How does a brand agent get discovered?

Through `brand.json`, hosted at `https://example.com/.well-known/brand.json` under RFC 8615. The 3.1.10 schema (`$id: /schemas/3.1.10/brand.json`, title "Brand Discovery") defines five variants, and one of them is the brand agent:

| #   | Variant                         | What it means                                                 |
| --- | ------------------------------- | ------------------------------------------------------------- |
| 1   | Authoritative Location Redirect | The canonical document is at another URL                      |
| 2   | House Redirect                  | This brand domain rolls up to a larger house                  |
| 3   | **Brand Agent**                 | "Brand represented by agents that provide brand info via MCP" |
| 4   | House Portfolio                 | A house publishes its brands, inline or by pointer            |
| 5   | Brand Canonical Document        | A brand self-publishes its own identity                       |

The Brand Agent variant carries `agents`, `brand_agent`, `contact`, `data_subject_contestation`, `version` and `last_updated`. Variants 1 to 3 are mutually exclusive with each other and with 4 and 5. Variants 4 and 5 compose: a house portfolio can point at brand-owned canonical documents through `brand_refs[]`, and a brand document can point back up through `house_domain`.

The design reason is stated in the specification itself. Putting every subsidiary in the parent's file means "if Converse wants to update its logo, someone edits Nike, Inc.'s file." The pointer variants exist so a brand team owns its own identity without a corporate ops choke point.

Full treatment of both discovery files is on our [discovery files page](/agents/discovery-files/).

## What operations does a brand agent implement?

AdCP 3.1.10 registers **six** brand-protocol operations:

| Operation             | What it does                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `get_brand_identity`  | Retrieve brand identity data. Core identity is public; authorised callers get more            |
| `verify_brand_claim`  | Verify one claim (subsidiary, parent, property, trademark) against a brand agent              |
| `verify_brand_claims` | Bulk variant, results returned positionally aligned with the request                          |
| `get_rights`          | Search licensable rights across a brand agent's roster, natural-language first                |
| `acquire_rights`      | Binding acquisition. Parallels `create_media_buy`: pick a `pricing_option_id`, get terms back |
| `update_rights`       | Lifecycle management of an existing grant                                                     |

`docs/protocol/required-tasks.mdx` marks `get_brand_identity` Required and the three rights operations Conditional, "required when the agent manages brand rights."

That same table also lists `creative_approval` as conditional, and this is the one place the documentation and the released registry pull apart. In 3.1.10, `creative_approval` is not one of the six registered brand-protocol operations. It exists as a pair of supporting schemas, `creative-approval-request` and `creative-approval-response`, described in the registry as the "payload the buyer submits to the `approval_webhook` from `acquire_rights` for rights-holder creative review." So it is a webhook contract, not a task you call. Both facts are true; they just live in different shapes.

### Sponsored Intelligence adds a second job

`docs/protocol/required-tasks.mdx` names the brand agent again under the Sponsored Intelligence Protocol, with `si_initiate_session`, `si_send_message` and `si_terminate_session` Required and `si_get_offering` Optional. Brand agents doing this work "MUST declare `sponsored_intelligence` in `supported_protocols`."

This is a different function from identity service. Here the brand agent holds a conversation with a user inside an AI assistant, and hands off to a commerce protocol once purchase intent exists. The comparison against the Agentic Commerce Protocol is covered on [AdCP Explorer](https://adcpexplorer.noetis.dev/areas/sponsored-intelligence/).

## The rights-licensing loop, and why it is labelled experimental

`acquire_rights` can issue scoped `generation_credentials` that specific providers verify at generation time, with named examples of Midjourney for likeness and ElevenLabs for voice. The grant carries a `rights_constraint` covering uses, countries and an impression cap, plus required disclosure text, and generation stops when the cap is hit. Generated assets go back to the brand agent for review through the approval webhook.

AdCP labels this path "a second, experimental path" in `docs/learning/specialist/brand.mdx`. It only applies when generating with licensed-talent likeness or voice. Do not present it as the default brand agent flow, because the specification does not.

## Does AAMP have a brand agent?

No. The string "brand agent" returns zero files across all eight IAB Tech Lab agentic repositories.

The single trace of the concept is one enum value. `agentic-audiences` defines `producer.agent_role` with six values, one of which is `brand`, in a draft embedding schema whose sibling agent-interface file is zero bytes. That is an enum member, not a role with operations.

So brand identity is a place where the two stacks are not comparable rather than merely different. AdCP has a discovery file, a six-operation protocol, a rights model and a disclosure obligation. AAMP has one string in a JSON Schema enum.

## Sources and version pins

- AdCP 3.1.10, repository `adcontextprotocol/adcp` at commit `f1a35ab`. Operation registry from `dist/schemas/3.1.10/index.json`; variants from `dist/schemas/3.1.10/brand.json`; role assignments from `docs/protocol/required-tasks.mdx`; concepts and rights flow from `docs/brand-protocol/key-concepts.mdx` and `docs/learning/specialist/brand.mdx`.
- Absence of a glossary entry verified against `docs/reference/glossary.mdx` at the same commit.
- `IABTechLab/agentic-audiences` at commit `106ebd6`, untagged and draft-grade.
