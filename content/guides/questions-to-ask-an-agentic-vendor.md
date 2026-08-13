---
title: 'Questions to Ask an Agentic Advertising Vendor, and the Answers That Disqualify'
description: 'Seven diligence questions for an agentic advertising vendor, each with the answer that ends the conversation and a check you can run yourself before the second meeting.'
answer: 'Diligence questions for an agentic advertising vendor work only if the vendor can fail them on the wire. Three AdCP sales agents answered anonymously on 12 August 2026: one honoured a structured channel filter, none honoured a plain-English exclusion.'
pubDate: 2026-08-12
cluster: 'vendor-diligence'
keywords:
  - 'questions to ask agentic advertising vendor'
  - 'how to tell real agentic from api wrapper'
  - 'agentic ai value proposition programmatic'
  - 'agentic advertising roi proof'
citations:
  - 'https://reddit.com/r/programmatic/comments/1p1dffj/yahoo_is_testing_six_ai_agents_that_will_live/'
  - 'https://reddit.com/r/adops/comments/1r8jfob/will_claude_code_replace_performance_marketers/'
  - 'https://infillion.com/resources/15-questions-to-ask-your-dsp-for-the-agentic-era/'
  - 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027'
  - 'https://agenticadvertising.org/api/registry/agents'
  - 'https://agenticadvertising.org/api/registry/stats'
  - 'https://github.com/adcontextprotocol/adcp/blob/main/docs/registry/registering-an-agent.mdx'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/core/product-filters.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/protocol/get-adcp-capabilities-response.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/adagents.json'
  - 'https://github.com/adcontextprotocol/adcp/blob/f1a35aba734befa809e1fa780ad77c7edd614e96/dist/schemas/3.1.10/media-buy/get-products-request.json'
  - 'https://github.com/adcontextprotocol/adcp/issues/2902'
  - 'https://github.com/adcontextprotocol/adcp/issues/5495'
  - 'https://github.com/adcontextprotocol/adcp/issues/6374'
  - 'https://github.com/IABTechLab/seller-agent/issues/44'
  - 'https://github.com/IABTechLab/seller-agent/issues/51'
  - 'https://github.com/IABTechLab/seller-agent/issues/57'
  - 'https://github.com/IABTechLab/iab-agentic-primitives/blob/main/CONFORMANCE.md'
  - 'https://www.vox.com/.well-known/adagents.json'
  - 'https://www.straitstimes.com/.well-known/adagents.json'
related:
  - 'https://adcpexplorer.com/guides/adcp-registry-measured/'
  - '/guides/who-is-running-agentic-buys/'
  - '/guides/autonomy-ladder/'
  - '/guides/agent-discovery-files/'
  - '/protocols/adcp-vs-aamp/'
  - 'https://adcpexplorer.com/operations/get-products/'
  - 'https://adtechglossary.com/agents/sales-agent/'
faq:
  - question: 'What is the fastest way to check whether an agentic advertising vendor has a real agent?'
    answer: 'Ask for the agent endpoint URL and the credentials to call it, then run the same product request twice with one constraint changed. If both calls return the same inventory, the constraint is decoration.'
  - question: 'Does an AdCP compliance badge prove a sales agent honours a buyer brief?'
    answer: 'No. AdCP compliance storyboards validate response shape and schema conformance. Two open issues, 2902 and 5495, record that filter parameters can be ignored, or stripped before they reach the agent, while the run still passes.'
reviewState: cto-reviewed
---

A diligence question is only worth asking if the vendor can fail it, and almost none of the questions being published this year can be failed. The ones below can, because each resolves to an artifact on the wire rather than to a claim in a deck.

Three sales agents in the AdCP registry answered an anonymous call on 12 August 2026. The public catalogue is 18; the other 15 demanded credentials, exposed no media-buy surface, or never completed a handshake. One of the three emptied its whole catalogue when I sent a structured `filters.channels: ["audio"]`. None of the three dropped a single product when the brief told it, in plain English, to exclude the inventory it was about to return, and two of them asserted a match against `"purple monkey dishwasher quantum bicycle"`. Three agents is not a rate and nothing below treats it as one. It is a wiring observation, and the wiring is lopsided in a way that three samples are enough to show: the structured half of the request did something on one agent, and the prose half did nothing anywhere.

Compare that with Infillion's [15 Questions to Ask Your DSP for the Agentic Era](https://infillion.com/resources/15-questions-to-ask-your-dsp-for-the-agentic-era/), the list most buyers are working from. It is gated behind an email form, and two of its questions are visible on the page:

> "Is your platform built for AI-driven buying, or layered onto legacy infrastructure?"
>
> "Do you own any of your supply, and does your system prioritize it?"

Read the first one as a vendor. You say "built for AI-driven buying", and so does the vendor after you, and so does the one after that, so the question separates nobody. Gartner has a name for what you are actually screening for: [agent washing](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027), estimated in June 2025 at roughly 130 real builders among the thousands of vendors claiming agentic AI. That number is Gartner's own and isn't independently audited, but its direction matches what buyers say in public: the highest-scoring reply under an [r/programmatic thread](https://reddit.com/r/programmatic/comments/1p1dffj/yahoo_is_testing_six_ai_agents_that_will_live/) on Yahoo's six new agents is that "having an OpenAI API wrapper doesn't make things agentic".

Three checks are worth more than the four that follow them, in this order:

| Check                                                          | What it costs you                                               | What it proves                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Send the same product request twice, one constraint changed    | An hour of an engineer's time, or a screen-share in the meeting | Whether a constraint you supply changes what comes back          |
| Ask for the agent's URL and call it                            | An email, then an hour                                          | Whether the agent exists anywhere outside the vendor's own login |
| Open the publisher's `/.well-known/adagents.json` in a browser | Thirty seconds                                                  | Whether the publisher has authorised this vendor to sell it      |

Seven checks in all, each with an answer that ends the conversation. Three you can run in a browser, three need someone who can call an endpoint — the registry lookup and the A/B belong to both groups — and two are conversations with nothing to run. Both stacks are in scope: AdCP, the Ad Context Protocol, which has a public agent registry and one machine endpoint per agent, and AAMP, IAB Tech Lab's competing stack, which has neither.

## Three agents answered an anonymous call. Nine correctly refused.

Ask for the agent's URL and the credentials to call it, before the meeting rather than after: a URL ending in `/mcp`, the authentication scheme, and either a sandbox tenant or a test key. Vendors who have built the thing send that by email the same day. Any version of "the agent is available inside our platform" ends the conversation, because an agent that only exists behind the vendor's own login is a feature of their UI, and the premise of both stacks is that somebody else's software calls it.

Half of this runs in a browser. Open [`https://agenticadvertising.org/api/registry/agents`](https://agenticadvertising.org/api/registry/agents) and search the page for the vendor's name. That is the AdCP registry, and it returned 23 agents on 12 August 2026: 18 typed `sales`, 3 `signals`, 1 `creative`, 1 `buying`. Enrolment runs through an AgenticAdvertising.org member profile, there is no self-registration, and the same API reported 68 further agents discovered by crawling `adagents.json` files, a set the registry does not publish and which may overlap the 23. A vendor who isn't listed goes straight to the URL request above. What the registry gives you is the shortlist you can test today, covered agent by agent in [the AdCP registry, measured](https://adcpexplorer.com/guides/adcp-registry-measured/).

The other half needs an engineer for an hour. Every registry agent speaks MCP, so a call is an HTTP POST and a session header. Here is what an anonymous handshake plus a `get_products` call returned across all 18:

| Result                                                   | Count | Agents                                                                         |
| -------------------------------------------------------- | ----- | ------------------------------------------------------------------------------ |
| Returned products to an anonymous caller                 | 3     | Cora AI, Equativ, No Fluff Advisory                                            |
| Handshake succeeded, `get_products` requires credentials | 3     | goTom Sandbox, Adzymic (SPH), Adzymic (Mediacorp)                              |
| Credentials required at the handshake                    | 6     | AdCP Test Agent, InMobi (prod and non-prod), LoopMe, Purrsonality Seller, Pubx |
| Typed `sales`, exposes no `get_products` tool            | 3     | Advertible, Dstillery, vastlint                                                |
| Transport failure before any protocol ran                | 3     | BidMachine (503), Content Ignite (500), Rediads (522 from Cloudflare)          |

Rows two and three, the nine agents that demand credentials at one layer or the other, are the healthy ones. An agent that refuses an anonymous stranger is behaving correctly, and the protocol's own public test agent is in that group: it answers `401 Missing bearer token`, the HTTP code for absent credentials. The last two rows are the ones worth pausing on. Three agents are registered as `sales` and expose no media-buy surface at all: Advertible answers `unknown tool "get_products"`, Dstillery offers `get_signals` only, and vastlint's 14 tools are VAST validation and content-standards management. Three more never completed a handshake on any attempt. Any of those rows can belong to a vendor worth buying from. Not being able to tell you which row they are in disqualifies them.

## One structured filter excluded anything. No English sentence did.

This is the highest-yield check here, and if you only get one thing into the meeting, get this one. Send a product discovery request. Send it again with a constraint that should exclude most of the catalogue. Compare the two sets of products. That is the whole test, and it is the one thing a demo cannot fake, because you supply the second input.

Three agents answered anonymously, so the A/B ran against all three:

| Request                                                                                     | Cora AI                                                                                 | Equativ                                                                             | No Fluff Advisory                                                       |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| US-only CPG brief, CTV and online video                                                     | 4 products, all Korean FAST CTV and Korean news                                         | 1 product, "High CTR APAC Video"                                                    | 5 products: 4 fixed, 1 generated ("US market entry & GTM operators")    |
| Same brief plus "Exclude all non-US inventory. Exclude Korean-language and APAC inventory." | same 4                                                                                  | same 1                                                                              | same 5, generated product on the same topic                             |
| `"purple monkey dishwasher quantum bicycle"`                                                | same 4                                                                                  | same 1                                                                              | same 5, generated product switches to "Clean room & data collaboration" |
| `filters.countries: ["US"]`                                                                 | same 4 — but all four declare `countries: ["KR","US"]`, so returning them is defensible | same 1                                                                              | same 5                                                                  |
| `filters.channels: ["audio"]`                                                               | **0 products**                                                                          | same 1 — the product describes itself as `"Synthetic data for demo purposes only."` | same 5                                                                  |

Two of the three also asserted a match. Cora's response carries `filter_diagnostics: {total_candidates: 4, matched_candidates: 4, no_match_targeting: false, semantics: "approximate"}` for the nonsense string, and each product's `brief_relevance` reads "Matched against buyer brief:" followed by the brief echoed back. Equativ returned `brief_relevance: "Matches video campaign requirements for APAC market with CTR optimization segment"` against a brief that says United States, and again against the nonsense.

Six structured attempts across the three agents produced exactly one exclusion, Cora's `filters.channels`. No English sentence excluded anything anywhere. Prose was not entirely inert — No Fluff Advisory generates its fifth product per brief from a corpus of essays, and that topic did follow the brief — but it could change what a product slot was about and never take a product away. Cora's catalogue is four products and No Fluff's is five, sizes at which returning everything and matching everything look identical from outside, and Equativ's endpoint is a demo tenant by its own description. What survives those caveats is the shape of the wiring: the structured half of `get_products` is where the implementation is, thin as it is, and the natural-language brief that every deck opens with came back on two of three agents as an echo with a match assertion attached.

A real answer runs the A/B live and the sets differ, or names which fields are hard filters and which are hints. "The agent interprets the brief holistically" is the answer that ends it, and the follow-up that exposes it is to ask what changes in the response when you remove a requirement. If nothing changes, the requirement was never applied. When the credentials do not arrive before the second meeting, which is the usual outcome, have them screen-share the two calls and read the product IDs off the screen with you. You still supply the second input, which is the only property that matters here.

## Adzymic declares three honoured filter fields out of twenty-eight

AdCP 3.1.13 puts campaign prose in a `brief` string with no schema and no validation, and puts everything a seller can filter on in a sibling [`filters` object](https://adcontextprotocol.org/schemas/3.1.13/core/product-filters.json): 30 properties, of which 29 are filters and one is an `ext` escape hatch, and one of the 29, `required_axe_integrations`, is marked deprecated. Twenty-eight live filters, then: `countries`, `regions`, `metros`, `postal_areas`, `geo_proximity`, `channels`, `format_ids`, `delivery_type`, `exclusivity`, `budget_range`, `signal_targeting`, `required_performance_standards` and the rest. "We support AdCP" says nothing about how many of the 28 do anything.

Adzymic publishes the answer this question is looking for. Its live capabilities response declares exactly three targeting dimensions as true, `geo_countries`, `geo_regions` and `device_platform`, alongside `content_standards: false`. I would onboard the vendor who published three honoured fields over the one claiming twenty-eight in a deck, because only one of those two numbers can be checked.

**A real answer** names which fields cause a product to be excluded from the response and which are advisory. **The disqualifying answer** is "we are fully compliant with the spec". A vendor who can't split the list either hasn't implemented filtering, or has implemented it without knowing which fields went live.

**Run it yourself, with an engineer.** One call to `get_adcp_capabilities` returns the declaration, and Adzymic's is public.

## Idempotency decides whether a retry buys twice

IAB Tech Lab's own reference seller agent shipped two bugs of exactly this class. [Issue 44](https://github.com/IABTechLab/seller-agent/issues/44) is duplicate quotes on replay: the same request arrives twice, the agent prices it twice. [Issue 51](https://github.com/IABTechLab/seller-agent/issues/51) is worse in kind, because `POST /api/v1/negotiations/messages` requires an `idempotency_key`, never honours it, and a retried counter-offer burns a round from a negotiation's `max_rounds` budget, so "enough retries can push a legitimate negotiation past `max_rounds` into an unintended REJECT". A required field that the handler never reads is worse than no field, because it buys the caller a guarantee that doesn't exist.

Neither issue documents a duplicated `create_media_buy` landing against a live insertion order, so size the money exposure as theoretical for now and bounded by your daily cap: a retry doesn't create budget, it creates a second commitment against the same one. That is still a commercial question rather than a technical annex, because the person who eats a double booking is not the person who wrote the retry loop.

In AdCP the declaration lives in `get_adcp_capabilities`, as an `idempotency` object alongside `adcp.supported_versions`. The schema's own language is unusually direct: clients MUST NOT assume a default, and a seller without the declaration "is non-compliant and should be treated as unsafe for retry-sensitive operations". Cora declares `{supported: true, replay_ttl_seconds: 86400}`. goTom declares request signing as supported and required for `create_media_buy`.

**A real answer** is the declaration itself, with the replay window in seconds. **The disqualifying answer** is a description of the retry policy with no `idempotency` object behind it, or a protocol version quoted from a slide with no `supported_versions` on the wire.

**Run it yourself, with an engineer.** Fetching the declaration takes one call, so ask them to make it while you are in the room.

## Vox's authorisation file is missing two required fields

If a vendor says your inventory is discoverable by buying agents, or that they are authorised to sell somebody else's, the assertion lives in a file at `https://<domain>/.well-known/adagents.json`. Anyone can open it in a browser. I opened four on the same day: `straitstimes.com` serves a pointer file naming `sales-agent.adzymic.ai` as the authoritative location, `vox.com` serves a full file naming `https://salesagent.voxmedia.com` as its authorised agent, and `cnn.com` and `theguardian.com` return 404.

Look for the vendor's endpoint in `authorized_agents[].url`, then look at the entry itself, because Vox's has a defect worth knowing about. It carries `url`, `name` and `properties`, and omits `authorization_type` and `authorized_for`. Both were required on every authorized-agent entry as of AdCP 2.5.3, and all six entry shapes the 3.1.13 schema allows still require `authorization_type`. A buyer agent validating that file against the published schema has grounds to reject the authorisation outright. Most clients don't validate today, which is why nobody has caught it, and "most clients don't validate today" is not a sentence you want load-bearing in a contract.

"Discovery is handled through our integration" ends the conversation. Discovery is a file on a domain the publisher controls, and the publisher-side page on [agent discovery files](/guides/agent-discovery-files/) covers what belongs in it.

## The reference seller agent invents a price when the product doesn't exist

Ask what the agent does when it hits something it can't answer: a product that isn't in the catalogue, or a brief it can't parse. The reference implementations answer that in public, and their answer isn't reassuring. On 11 August 2026 an external contributor filed [seller-agent issue 57](https://github.com/IABTechLab/seller-agent/issues/57) against IAB Tech Lab's seller agent: `POST /api/v1/deals/curated` accepts an arbitrary `product_id` with no existence check, and when the ID matches nothing it falls back to a hardcoded `base_cpm = 12.0` and mints a persisted, `confirmed`, bookable deal at that price. The function's own docstring says the opposite: "A known-but-unpriced product (no base/floor CPM) is a 422 — never a fabricated price." The guarantee is implemented for products that exist without pricing and skipped for products that do not exist, which is the failure mode to interrogate in both stacks: a confident, bookable number standing where an error belonged.

**A real answer** names the error code and shows you the response body. **The disqualifying answer** is "it falls back to a sensible default".

**Nothing to run here.** Unless the vendor gives you write access to a sandbox, this one is a conversation, and the two issues above are the vocabulary for having it.

## Ask which field records that a human was asked

Amy Porter of RPA told Digiday that agents could obscure critical decision-making if advertisers lean on AI for bidding, optimisation and performance assessment without human oversight. She is right, and the remedy is narrower than the warning suggests. The obscurity nobody can fix sits in the model's reasoning, which nobody was ever going to read. The obscurity you can fix is whether a protocol field records that a human was asked and what they said. AdCP has `check_governance` and the `submitted` and `input-required` async states; AAMP's buyer agent has an `ApprovalConfig` with separate switches for plan review, booking, creative and pacing adjustment. Those are the things that leave a trace.

So ask which specific operations require a second human, and which field enforces that, rather than which ones the vendor's policy says require one. A role in the vendor's UI is a setting their own staff can change on a Friday afternoon; the field is what the log shows on Monday. The [autonomy ladder](/guides/autonomy-ladder/) maps each rung to the mechanism that implements it.

A real answer names the field and the state the buy sits in while it waits. Nothing to run here either, until you have a live integration and can read your own logs.

## Does an AdCP compliance badge prove the agent honours a brief?

AdCP runs a hosted compliance programme with storyboards, tracks and a badge. It is the most developed conformance apparatus in agentic advertising, and it doesn't test the thing the A/B tests. Two issues, both filed by outside implementers, say so directly.

[Issue 2902](https://github.com/adcontextprotocol/adcp/issues/2902), open since April:

> "An endpoint can accept `start_date`/`end_date`, return a correctly-shaped response, pass all compliance checks — and silently return the same data regardless of what dates were passed. The schema is valid. The contract is broken."

[Issue 5495](https://github.com/adcontextprotocol/adcp/issues/5495) found the same hole from the runner's side: when a storyboard sends a spec-defined field that the agent's own tool schema does not declare, the runner strips the field, logs a console warning that never reaches the report, and scores the step as a pass. "A conformance tool reporting 'pass' for a capability the agent never exercised is a false positive." And [issue 6374](https://github.com/adcontextprotocol/adcp/issues/6374) records that the public compliance API exposes `verified` as a bare boolean, with three unrelated possible causes for a false and no field distinguishing them.

The AAMP side has no badge to weaken. Its [conformance kit](https://github.com/IABTechLab/iab-agentic-primitives/blob/main/CONFORMANCE.md) is a script the vendor runs in their own CI, emitting a `gap_report.json`, and there is no third-party register of who passed. So on that stack, ask for the gap report. "AAMP-compliant" is, today, entirely self-asserted.

Rank the badge accordingly: it is a tiebreak between two vendors who both passed the A/B, it is evidence of effort and I would weight it above a case study, and it is not a substitute for running the A/B yourself.

## Where these checks stop working

They verify mechanism. They say nothing about whether the buy performed better, which is the objection carrying the most weight in both threads I read. On value, from r/programmatic:

> "so far there's not a good value preposition [sic] that can't be addressed by a bulk sheet or API."
> — u/GreenFlyingSauce, [r/programmatic](https://reddit.com/r/programmatic/comments/1p1dffj/yahoo_is_testing_six_ai_agents_that_will_live/)

And on proof, from r/adops:

> "I have yet to see any agentic experience that you can actually trust to execute, the ones that work don't save enough time nor have any proof of improved performance because attributed metrics don't mean incremental performance. AI has no absolute accountability either."
> — u/Toast687, [r/adops](https://reddit.com/r/adops/comments/1r8jfob/will_claude_code_replace_performance_marketers/)

Both are practitioner sentiment rather than measurement, and nothing on the wire answers either. No field in either protocol carries incrementality, and a vendor who passes all seven checks has demonstrated that the integration works. Whether it buys better is a separate claim, and none of these checks touch it. The named deployments and their reported numbers are tracked separately in [who is running agentic buys](/guides/who-is-running-agentic-buys/), and most of those numbers are vendor-stated.

The window is narrow too. Eighteen sales agents is the whole public catalogue and a fraction of the market: the registry lists only agents an AAO member has enrolled at public visibility, and anonymous access shows only what these systems do for a stranger. Which is why the check that generalises is the endpoint call, and why a vendor who says plainly which parts are not built yet can still be the right pilot partner.

When one of them fails the A/B and you want them anyway, put the fix in the pilot contract rather than in the minutes. Name the filter fields that must hard-exclude, the three or four your planning actually depends on out of the twenty-eight, and a date by which `get_adcp_capabilities` declares them true. That declaration is the reporting obligation and the acceptance test at once: it is public, it is machine-readable, and you can rerun the A/B against it on the date without asking anybody's permission.
