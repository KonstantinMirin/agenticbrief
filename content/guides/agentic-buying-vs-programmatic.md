---
title: 'Agentic Buying vs Programmatic Buying'
description: 'Programmatic clears one impression per auction. An agentic buy settles a whole campaign. What actually changes, what does not, and how both differ from Performance Max.'
answer: 'Agentic buying negotiates a whole media buy over an agent protocol while programmatic clears one impression per auction in milliseconds, and whether that counts as a real difference depends on which specification you point at.'
pubDate: 2026-08-09
updatedDate: 2026-08-12
cluster: 'wiab-vs-prog'
keywords:
  [
    'agentic buying vs programmatic',
    'is agentic buying just programmatic',
    'agentic vs rtb',
    'programmatic media buying automation',
    'agentic buying vs performance max',
    'agentic buying vs advantage plus',
  ]
citations:
  [
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/design-principles.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/calling-an-agent.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/protocol/required-tasks.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/governance/campaign/specification.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/media-buy/task-reference/get_products.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/task-status.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/protocol-envelope.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/performance-standard.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/reference/known-limitations.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/faq.mdx',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/docs/trusted-match/specification.mdx',
    'https://github.com/IABTechLab/agentic-rtb-framework/blob/7f481614ba228f8fab5b08df2e13ed540d4a1954/proto/agenticrtbframework.proto',
    'https://github.com/IABTechLab/seller-agent/blob/2bb7ebce45891e3bdddd7a43198cb81d710b0916/docs/integration/negotiation.md',
    'https://github.com/IABTechLab/AAMP/blob/3b20e67b568235d86c4025bec7c1301edd7466a0/README.md',
    'https://github.com/InteractiveAdvertisingBureau/openrtb2.x',
    'https://docs.adcontextprotocol.org/docs/building/concepts/adcp-vs-openrtb',
    'https://www.iab.com/news/u-s-digital-video-ad-spend-to-surpass-80b-in-2026/',
    'https://digiday.com/media-buying/the-case-against-ai-agents-for-programmatic-ad-buying/',
    'https://tensorops.ai/labs/research/agentic-ai-advertising-2026-field-guide',
    'https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/',
    'https://digiday.com/media-buying/butler-tills-first-agentic-media-buying-tests-cut-media-and-supply-chain-costs/',
    'https://ppc.land/programmatic-buyers-gain-13-4-cpm-edge-over-ai-agents-databeat-finds/',
    'https://www.investing.com/news/transcripts/earnings-call-transcript-magnite-tops-q2-2026-forecasts-and-lifts-outlook-93CH-4839547',
  ]
related:
  [
    '/',
    '/how-it-works/',
    '/maturity/',
    'https://agenticadlab.com/guides/who-is-running-agentic-buys/',
    'https://agenticadlab.com/protocols/adcp-vs-aamp/',
    'https://agenticadlab.com/guides/what-agentic-ad-protocols-dont-standardize/',
    'https://adcpexplorer.com/operations/get-products/',
    'https://aampexplorer.com/repos/agentic-rtb-framework/',
  ]
reviewState: cto-reviewed
---

## Is agentic buying just programmatic with a chat box on top?

Two standards bodies have already answered that question in writing, and they contradict each other. Before the answer, the difference the argument turns on.

Programmatic buys one impression at a time. A page loads, an auction runs, a winner is picked, an ad renders, and the whole thing finishes in about a tenth of a second. Repeat a few billion times a day. Nothing in that loop knows what campaign it belongs to or what the campaign was for.

Agentic buying moves the unit of trade up a level, to the thing a human buyer would recognise as a deal: a budget, a flight, a set of placements, terms both sides agreed. Software on the buyer's side describes what it wants, software on the seller's side proposes what it has, and the two settle it between them without a person retyping a media plan into a booking form. The impressions still clear through the old machinery afterwards.

So the honest version of the sceptic's question is not "is there a chat box" but "did the unit of trade actually change". One of the two standards says yes and the other says no, in their own repositories, on the record.

IAB Tech Lab's Agentic RTB Framework says no, it did not change. Line 6 of its protocol definition imports the OpenRTB 2.6 bid request, before ARTF defines anything of its own. What an ARTF agent emits is a change applied to that bid request or its response, on the exchange's millisecond clock. That is programmatic with an agent holding the knob, and the sceptic is right about this half.

The Ad Context Protocol says yes, it changed, and it says so by refusal. AdCP is governed by AgenticAdvertising.org rather than IAB Tech Lab, which trips up almost everyone who meets it second: a pending 501(c)(6) trade association whose interim board of four directors holds two seats affiliated with Scope3, an ad-tech company and founding contributor to the protocol. Half the interim board of the body writing the rules works for one company building on them, and that is a governance risk to price into a build decision rather than a scandal. Someone proposed a price-quote step to that working group, sitting between discovery and commitment: submit targeting, get a firm rate back, then buy. It was turned down twice over, in the published design principles and again at the top of the product-discovery reference. A protocol that was really programmatic with a chat box on the front would have taken that proposal without blinking.

Neither corpus acknowledges the other: not one file across the eight repositories under IAB Tech Lab's AAMP umbrella (Agentic Advertising Management Protocols, the initiative ARTF ships under) names AdCP at all. They sit at different layers all the same. ARTF lives inside your bidder, mutating a request you were already handling. AdCP lives in front of your inventory, as an agent a buyer's agent calls before any auction exists. A seller running both a direct business and an exchange plausibly ships both, and neither corpus publishes a word on how the two reconcile.

Then there is the size of the thing. Magnite, which processes about 9 billion dollars of ad spend a year, told its August 2026 earnings call it had transacted "a handful of millions of dollars" agentically to date. The public AdCP agent registry listed 23 agents on 12 August 2026, and three of them would hand a product catalogue to a caller with no credentials.

## Which one should you be running today?

Programmatic, at scale, still. Agentic buying is a pilot line everywhere it exists, and what it asks of you differs by which side of the wire you sit on. AdCP's required-tasks page is direct about the floor, and the floor is different on each side.

- Publisher or SSP selling direct, you ship a sales agent: seven required Media Buy tasks (`get_products`, `get_adcp_capabilities`, `create_media_buy`, `update_media_buy`, `get_media_buys`, `get_media_buy_delivery`, `provide_performance_feedback`), served over at least one transport, with `media_buy` declared in the protocols it says it supports. That is a real server, not a route on an existing one.
- DSP or buying desk: you are the orchestrator, and orchestrators "are not MCP/A2A servers — they call sales agent tasks." Conformance is five behaviours. The one that costs engineering is handling the three long-running states plus webhook delivery of completion artifacts, because everything you own already assumes a synchronous auction.
- Exchange or bidder, there is nothing to conform to yet. ARTF is your surface, and its proto file defines messages and enums with no service and no remote calls in it, so how a mutation actually reaches you is still the exchange's problem to define.
- Brand with an agency in between: nothing this quarter. What changes it is your agency's orchestrator shipping, not either spec moving.

## The difference, row by row

|                        | Programmatic (OpenRTB / RTB)                 | Agentic buying (AdCP 3.1.13)                                                                                                    |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Unit of exchange       | One impression, one auction                  | A media buy containing packages                                                                                                 |
| Wire format            | OpenRTB 2.6 bid request / bid response       | A JSON Schema registry, 64 registered operations at 3.1.13                                                                      |
| Transport              | HTTP POST to a bidder endpoint               | MCP `tools/call` or A2A `message/send`                                                                                          |
| The clock, declared    | `tmax`, "maximum time in milliseconds"       | `status: submitted` is "queued for long-running execution (hours to days)"; `working` is "expect completion within 120 seconds" |
| The clock, buyer-side  | The exchange sets `tmax`                     | The buyer sets `time_budget` and the seller "does not start processes... that cannot complete in time"                          |
| How intent is stated   | Targeting parameters attached to a seat      | `buying_mode` of `brief`, `wholesale` or `refine`, plus a conditionally required free-text `brief`                              |
| Iteration              | Rebid                                        | `buying_mode: "refine"` with a typed array of change requests                                                                   |
| Finding counterparties | `ads.txt`, `sellers.json`                    | `/.well-known/adagents.json`                                                                                                    |
| Negotiation            | The auction is the negotiation               | Proposals move draft to committed; AAMP's seller-agent defines `accept`, `counter`, `final_offer`, `reject`                     |
| Idempotency            | Fire and forget                              | `idempotency_key` required on `create_media_buy`, minimum 16 characters                                                         |
| Governance             | Post-hoc blocklists and verification vendors | `check_governance` before any spend-commit request, with a required `caller` URL                                                |

`tmax` and `time_budget` are the same idea about six orders of magnitude apart: whoever is waiting declares how long they will wait. The agentic one spells out the consequence, too. The seller "does not start processes (human approvals, expensive external queries) that cannot complete in time." An exchange with a 120ms `tmax` never had to write that sentence, because no human was ever going to be in that loop.

Transport moves a build estimate more than anything else here. Adopting AdCP means standing up an agent server. Its transport page binds it to MCP `tools/call` or A2A `message/send` and says the two are interchangeable: "If a call works on one, the equivalent call works on the other." That page also says AdCP MCP servers no longer publish per-tool parameter schemas when a client lists the available tools, where "every tool shows `{type: 'object', properties: {}}`". Runtime introspection will not tell you the shape of anything, so you validate against the registry version you pinned at build time and ask the agent on the other end what it supports.

The free-text `brief` is conditionally required rather than optional: required when `buying_mode` is `brief`, forbidden when the mode is `wholesale` or `refine`. That mutual exclusion is written into the field descriptions and into no validated conditional, so a validator will pass a request that breaks it either way. The only unconditionally required field in the whole [`get_products` request](https://adcpexplorer.com/operations/get-products/) is `buying_mode` itself. A buyer in wholesale mode still never writes a sentence, which is the interesting half.

## Performance Max is a different kind of automation

Most marketers reach past programmatic for a closer comparison: Google's Performance Max, or Meta's Advantage+. Set a budget and an objective, and the platform's optimiser picks the placement, the audience and often the creative. If software already decides where the money goes, what does an agent add?

Nothing you would call intelligence. The optimiser belongs to the seller and it reaches the seller's own inventory. It has no counterparty, so there is nobody to describe a campaign to, nobody to send terms back, and no record of what was agreed, because nothing was agreed. And it does not travel. Take Performance Max off Google and nothing is left to run.

An agentic buy inverts the ownership. The deciding software is yours or your agency's, it talks to any publisher's agent that publishes an endpoint, and the terms are fields on a wire you can log: budget, dates, brand, placements, the price accepted. TensorOps' [2026 field guide](https://tensorops.ai/labs/research/agentic-ai-advertising-2026-field-guide) draws the same line, black-box optimisers confined to a single platform against a layer that can reason across several.

An agent decides inside limits you set, and if you set none you have swapped one black box for another with your own logo on it. What you gain is the record: Performance Max tells you what the campaign spent, while an agentic buy leaves you what was asked, what was offered and what was accepted. Where that record stops is [what neither protocol standardises](https://agenticadlab.com/guides/what-agentic-ad-protocols-dont-standardize/).

## AdCP turned down the price-quote step and published its reasoning

The proposal was a firm price quote sitting between discovery and commitment. AdCP's design principles say no on the grounds that rate cards, firm prices and an iteration mode already exist, so "the 'new task' framing assumes targeting and pricing are missing from discovery; they aren't." The product-discovery reference restates it in one line: the split "splits one expert decision into two underspecified ones and breaks the brief→curation contract."

That is an argument about who knows what. It never mentions latency, or whether a language model belongs in the loop. How convincing it is depends on what you sell. On premium supply it holds: the seller knows things about its own inventory the buyer cannot infer, so making the buyer specify targeting first and receive a price second forces both parties to guess at the half they cannot see. On commodity supply it does not, because the price is knowable up front and the refusal costs a round trip to learn what the rate card already knew.

The same section then concedes three real gaps: pricing that depends on flight dates and a total budget the buyer has not committed yet, a time-bound firm rate issued before commitment, and an auditable account of what drove the price. The refusal and the concession sit in the same file, which is the opposite of the position ARTF took.

## IAB Tech Lab's answer is in the protobuf

ARTF's agentic unit is a mutation: an intent, an operation, a path and a payload. The operations are add, remove and replace, and the paths are JSON pointers into the bid object — a user's segment list, one impression, a deal inside a private marketplace, a bid from a seat. This is JSON Patch against OpenRTB with a taxonomy of reasons attached.

What those mutations are for is the interesting part. Eight named intents ship in v1.0, and in English they are: turn segments on, turn deals on, turn deals off, move a floor, move a margin, shade a bid, attach metrics, attach campaign IDs. That is the whole vocabulary, and all but two of them adjust the terms of trade on inventory that already exists. No brief anywhere in it, no product, no proposal, no counterparty to negotiate with. The lifecycle has exactly two stages, publisher bid request and DSP bid response, with the comment "More to be added" sitting under them. There is a [file-by-file breakdown of that repository](https://aampexplorer.com/repos/agentic-rtb-framework/) and a [full AdCP-versus-AAMP side-by-side](https://agenticadlab.com/protocols/adcp-vs-aamp/) on the other sites.

If the definition of agentic buying is "software decides instead of a human," ARTF qualifies and always did. If the definition is "the unit of exchange changed," it does not come close. Vendor decks routinely use the first definition while showing diagrams of the second, and that is where most of the confusion in this category comes from.

## Where the clean two-layer story breaks down

The tidy version, where programmatic owns the impression and agentic owns the campaign, is repeated everywhere including here. It survives until you reach Trusted Match, which is AdCP's decisioning surface at ad-call time. A publisher's router fans a request out to buyer agents and asks two uncorrelated questions: which of the packages already bought against this property fit this page, carrying no user identity, and which fit this user, carrying no page context. The spec "targets sub-50ms end-to-end latency (publisher → router → agents → router → publisher)," with agent-side p95 under 30ms and a per-provider timeout defaulting to 50ms. AdCP's own FAQ prints a timing row calling agentic "Asynchronous (seconds to days)" — true of most of the surface, false of the part built to sit next to the auction.

The asynchrony on the other side of the line is thinner than advertised too. The documentation says every mutating task ships a long-running path; seven operations actually publish one, and the mutating calls that publish none of them include the plan, account, property-list, signal-activation and rights calls you need before you can spend anything. The generic envelope carries asynchrony everywhere instead: every response requires a top-level status, and the description is blunt that agents shipping without one are non-conformant. The envelope is the real mechanism and the documentation describes an intention, which stops being an academic distinction the moment somebody picks a stack on the strength of what the documentation promised.

## Does agentic buying replace real-time bidding?

No. Both specs say so on their own pages, from opposite directions. AdCP's FAQ describes a publisher's agent accepting a `create_media_buy` from a buyer agent and then using OpenRTB internally: "AdCP handles the workflow; OpenRTB handles the auction." The same page notes that one `create_media_buy` can spawn thousands of impression-layer events. ARTF mutates a bid request, and there is no version of that proto in which the bid request goes away.

If someone tells you agentic buying kills RTB, ask which schema field they are pointing at. There is not one.

## Measurement, fraud and reconciliation are left to you

Measurement gets delegated and then contracted. A performance standard requires a metric, a threshold and a vendor, with an optional named standard because MRC and GroupM define materially different viewability thresholds. Buyers screen on those standards inside the filters on the discovery call, and once a package is confirmed the creative has to carry that vendor's tracker script or pixel. Programmatic runs the measurement itself. AdCP writes the measurement vendor into the purchase order and leaves the running to them.

The feedback call centres on a normalised performance index where 1.0 is expected. Everything else in the request is metadata about what that number means. One number is the entire quantitative signal a buyer sends a seller about whether the buy worked.

Invalid traffic sits outside both stacks, but not equally. AdCP names IVT across its documentation, invalid traffic is one of five values in its performance-metric list, and its known-limitations page is explicit that "GIVT/SIVT filtration (per MRC), viewability measurement (per the MRC Viewable Ad Impression standard), and brand-safety verification execute in the delivery stack or the chosen vendor layer." Across all eight IAB Tech Lab agentic repositories, invalid traffic is not mentioned once, and neither is AdCP.

Reconciliation is the largest of the gaps, and the running list of the others lives [on the hub](https://agenticadlab.com/guides/what-agentic-ad-protocols-dont-standardize/). The delivery call returns the seller's own numbers against a reporting period and a currency, and that is where the registry stops. No operation compares them to what the buyer's ad server counted, none raises a discrepancy, and neither corpus says whose number wins when the two disagree. So the discrepancy lands where it lands today, in a spreadsheet and a thread between two ops teams, and whoever builds against AdCP writes that matching layer themselves before the first invoice.

## The money that has actually moved

IAB's [2026 digital video release](https://www.iab.com/news/u-s-digital-video-ad-spend-to-surpass-80b-in-2026/), dated 5 May 2026, puts 21% of digital video buyers live with agentic AI, 20% testing and 25% planning. Read that 21% against the definitional problem the ARTF proto exposes: roughly 400 decision-makers self-reporting against a term the two standards bodies cannot agree on, so a chat interface driving an existing DSP counts as live and so does a bid shader. The survey also closed in March.

What has been transacted is smaller than the survey sounds, and named. Butler/Till and PubMatic ran connected TV for Geloso Beverage Group across two flights from December 2025, and the results everyone quotes came from PubMatic: roughly an 80% cut in buy-side costs in its own [case study](https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/), 82% of demand-side platform tech fees [as Digiday reported it](https://digiday.com/media-buying/butler-tills-first-agentic-media-buying-tests-cut-media-and-supply-chain-costs/), plus 40% more impressions than planned and about 30% lower effective CPM. The verification firm Jounce audited inventory quality, and that is the only part an outside party checked.

One comparison exists that no party to the campaigns produced. The analytics firm DataBeat, using May 2026 data from one ad network, put average CPMs at $6.95 for conventional demand against [$6.13 for agentic demand](https://ppc.land/programmatic-buyers-gain-13-4-cpm-edge-over-ai-agents-databeat-finds/), a 13.4% premium paid by conventional buyers, alongside 86% fewer auctions entered. Which way that cuts is unclear: agents clearing cheaper is consistent with avoiding overpayment and equally consistent with winning inventory conventional demand had already declined, and entering far fewer auctions says they were bidding on a much narrower slice of the same supply either way. It is one network and one month, and DataBeat sells analytics into this market. Everything else in circulation came from the vendor that sold the campaign, and [the deployment ledger](https://agenticadlab.com/guides/who-is-running-agentic-buys/) marks each figure with who produced it. The [step-by-step trace](/how-it-works/) walks one buy from discovery through to the performance report, and the [running tally of what has shipped](/maturity/) is kept separately.

The strongest objection is about trust. At Digiday's Programmatic Marketing Summit in New Orleans in December 2025, [the buyers Digiday quoted](https://digiday.com/media-buying/the-case-against-ai-agents-for-programmatic-ad-buying/) named hallucination as the reason they were not handing activation to language-model agents: an agent that slips a decimal place spends money that is not coming back, and as one of them put it, that is "a fireable offense." AdCP does have a pre-commit gate and it does not close this. A buyer agent MUST call `check_governance` before sending any spend-commit request, but that call establishes whether this caller is allowed to spend against this plan, which is authorisation rather than arithmetic. Nothing in either registry checks whether the number the model just produced is sane, and neither specification pretends otherwise.
