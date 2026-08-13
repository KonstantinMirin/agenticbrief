---
title: 'How Agentic Buying Works, Step by Step'
description: "One media buy traced from the brief to the booking: how a buyer's agent finds a publisher's agent, what it clears before money moves, and where the sequence trips clients up."
answer: "How agentic buying works, step by step: a buyer's agent finds the publisher's agent through a file on the publisher's own domain, asks what it can sell, clears the spend against a budget policy, books the campaign, then reads delivery back."
pubDate: 2026-08-09
updatedDate: 2026-08-12
cluster: 'wiab-mechanics'
keywords:
  [
    'how does agentic buying work',
    'agentic buying process',
    'agentic buying step by step',
    'sales agent seller agent naming mismatch',
  ]
steps:
  [
    {
      name: 'Find the seller',
      text: 'Read the file the publisher serves at /.well-known/adagents.json on its own domain, which names the agents authorised to sell its inventory.',
    },
    {
      name: 'Handshake',
      text: 'Ask the seller what it supports: protocols, version, signing posture, feature blocks. The call is get_adcp_capabilities and its request has no required fields.',
    },
    {
      name: 'Discover inventory',
      text: 'Describe the campaign and read back what is on offer. The call is get_products and its only required field is buying_mode: brief, wholesale or refine.',
    },
    {
      name: 'Sort out creative',
      text: 'Find out which ad formats the seller accepts with list_creative_formats, build the ad with build_creative, upload it with sync_creatives.',
    },
    {
      name: 'Register the plan',
      text: 'Push the budget limits, channels, flight dates and authorised markets the campaign runs under to the buyer-side governance agent, using sync_plans.',
    },
    {
      name: 'Validate',
      text: 'Ask whether this caller may spend against this plan. The call is check_governance and it comes before any campaign action.',
    },
    {
      name: 'Place the buy',
      text: 'Book it with create_media_buy, which requires a retry key, an account, a brand and start and end dates, plus either line items or a finalised proposal.',
    },
    {
      name: 'Close the loop',
      text: 'Read pacing and spend with get_media_buy_delivery, and send outcomes back with provide_performance_feedback.',
    },
  ]
citations:
  [
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/latest.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/index.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/adagents.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/protocol/get-adcp-capabilities-response.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/get-products-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/list-creative-formats-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/creative/list-creative-formats-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/media-buy/create-media-buy-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/media-buy-status.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/sync-plans-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/governance/check-governance-request.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/error.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/enums/error-code.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/proposal.json',
    'https://github.com/adcontextprotocol/adcp/blob/a0fd0b5f97e9297acbd4b234f27fb440bf22d31e/dist/schemas/3.1.13/core/performance-standard.json',
    'https://docs.adcontextprotocol.org/docs/reference/glossary',
    'https://docs.adcontextprotocol.org/docs/faq',
    'https://docs.adcontextprotocol.org/docs/trust',
    'https://github.com/IABTechLab/seller-agent',
    'https://github.com/IABTechLab/buyer-agent',
    'https://github.com/IABTechLab/iab-agentic-primitives',
    'https://digiday.com/media-buying/butler-tills-first-agentic-media-buying-tests-cut-media-and-supply-chain-costs/',
    'https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/',
    'https://www.freewheel.com/news/nbcuniversal-rpa-freewheel-and-newton-research-introduce-agentic-ai-buying-across-linear-and-digital-for-premium-video',
    'https://www.einpresswire.com/article/916606885/boostr-and-vox-media-execute-landmark-agentic-adcp-media-buy-signaling-a-new-era-for-automated-advertising',
    'https://tensorops.ai/labs/research/agentic-ai-advertising-2026-field-guide',
  ]
related:
  [
    '/',
    '/agentic-buying-vs-programmatic/',
    '/maturity/',
    '/about/',
    'https://adcpexplorer.com/operations/get-products/',
    'https://adcpexplorer.com/discovery/',
    'https://adcpexplorer.com/areas/governance/',
    'https://adcpexplorer.com/guides/adcp-registry-measured/',
    'https://briefgateway.com/spec/brief-vs-filters/',
    'https://aampexplorer.com/negotiation/',
    'https://adtechglossary.com/agents/sales-agent/',
    'https://adtechglossary.com/agents/seller-agent/',
    'https://agenticadlab.com/guides/how-a-machine-buys-media/',
    'https://agenticadlab.com/guides/who-is-running-agentic-buys/',
  ]
reviewState: cto-reviewed
---

A brand wants connected-TV inventory from a publisher it has never bought from. Nobody sends an email, nobody fills in a booking form, and no salesperson picks up the phone. Software on the brand's side holds a budget, a set of dates and a description of who the campaign is for. Software on the publisher's side knows what inventory exists, what it costs, and what is already committed. Getting from there to a booked, serving campaign takes eight steps.

Each of those steps is a message with a name, a defined request and a defined answer, agreed by both sides in advance. That is the point of a standard here: no person sits in the middle translating, so the translation has to be written down first.

The sequence below follows AdCP, the Ad Context Protocol, which is the only one of the two competing stacks publishing versioned schemas and the one named in the Boostr and Vox Media buy further down. Its current release is 3.1.13. IAB Tech Lab's rival programme, AAMP, covers the same ground across eight separately versioned repositories of reference code, and the places where the two disagree are marked, because those are the places a client breaks.

## The eight steps

| Step | What happens                                                                                         | Who answers                              | Can a first version skip it?            |
| ---- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| 1    | The buyer's agent reads a public file on the publisher's domain listing which agents may sell for it | the publisher's own web server           | only if someone handed you the endpoint |
| 2    | It asks that agent what it supports                                                                  | the publisher's selling agent            | no                                      |
| 3    | It describes the campaign and reads back what is on offer                                            | the selling agent                        | no                                      |
| 4    | It finds out which ad formats are accepted, builds the ad, uploads it                                | a creative agent, then the selling agent | not if the buy has to serve             |
| 5    | It registers the budget and the policy the campaign runs under                                       | the buyer's own policy agent             | yes, unless the account has one         |
| 6    | It asks whether this campaign, this caller and this spend are allowed                                | the buyer's own policy agent             | same                                    |
| 7    | It books the buy                                                                                     | the selling agent                        | no                                      |
| 8    | It reads delivery, and sends performance back                                                        | the selling agent                        | the performance half, yes               |

Running that in order is straightforward. Knowing which agent answers each call is not, and one call name carries two different contracts depending on which agent you point it at. Step 4 also puts a third party in the transaction: a creative agent is software that holds the full specifications for an ad format and can build the ad to them, and it is not the same software as the agent selling you the inventory. It may belong to your creative shop, to a specialist vendor or to the publisher.

Twenty-three agents were publicly listed on the AdCP registry on 12 August 2026, and three of them will show a catalogue to a caller with no credentials. Everything past that point needs a relationship, so most of the sequence below is what the other twenty are building towards rather than something you can try this morning. The measured detail is at the end.

## What a first version can skip

Steps 5 and 6 are conditional. An account with no policy agent attached never needs a plan, so a first client can leave both out and nothing on the wire will complain, which is also the problem with them.

Step 1 goes only if somebody handed you the endpoint directly, which is how every pilot starts. Skipping it means you have taken the seller's word for it that it may sell what it is selling.

Creative is skippable at buy time and not at serve time. A buy created with no creatives sits in a pending state where "the buyer must attach creatives via `sync_creatives` before the buy can serve", which is a buyer obligation rather than a seller-side approval queue. Performance feedback is the one call nothing else depends on: the campaign runs whether or not you ever send an outcome back.

That leaves the spine. Ask the agent what it supports, ask what it can sell, book it, read delivery back. All of that is what the schemas allow, and the endpoint on the other end is free to be stricter than the schema; the only way to find out which is to call it.

## Where Performance Max stops and this starts

Most marketers meet this idea and reach for the nearest thing they already run: Google's Performance Max, or Meta's Advantage+. Those optimisers belong to the seller and reach the seller's own inventory, so there is no second party in the conversation and nothing to negotiate. Steps 1, 3 and 7 have no equivalent inside one, because each assumes a counterparty: find out who may sell, ask a named seller what it has, book terms both sides can read back afterwards. Step 6 is the difference that matters at budget-approval time, because the policy sits on the buyer's side and the seller cannot overrule it, where inside a walled platform the rules belong to the platform. Programmatic still spends the money. Agentic buying is a pilot line, which is the argument in [agentic buying versus programmatic](/agentic-buying-vs-programmatic/).

## One campaign that ran this way

Butler/Till and PubMatic ran connected TV for Geloso Beverage Group's Clubtails brand across two flights, December 2025 into January 2026, on Samsung, Paramount, Vizio and Tubi. Agents did the planning and the execution from a written brief, and a person at the agency signed off the curated inventory before anything served.

The savings everyone quotes came from the vendor that sold the campaign: PubMatic's own [case study](https://pubmatic.com/case-studies/butler-till-unlocks-greater-efficiency-and-performance-with-pubmatic-agenticos/) puts the result at roughly an 80% cut in buy-side costs. One thing was checked from outside, and it was not the money: the verification firm Jounce audited inventory quality. The full set of figures, and [who produced each one](/agentic-buying-vs-programmatic/), is worth more than the headline.

Two more have transacted and published no numbers at all. NBCUniversal, RPA, FreeWheel and Newton Research [announced an agent-led buy](https://www.freewheel.com/news/nbcuniversal-rpa-freewheel-and-newton-research-introduce-agentic-ai-buying-across-linear-and-digital-for-premium-video) across linear and streaming in January 2026, including NFL playoff inventory. Boostr and Vox Media [closed a campaign-level buy](https://www.einpresswire.com/article/916606885/boostr-and-vox-media-execute-landmark-agentic-adcp-media-buy-signaling-a-new-era-for-automated-advertising) through a seller-side agent in June 2026, and a Vox staffer accepted it in the ad server before it launched. The dated list of everyone else who has transacted is [the deployment ledger](https://agenticadlab.com/guides/who-is-running-agentic-buys/).

In both campaigns described as fully agentic, a person approved something before it ran.

## Step 1: who may sell this publisher's inventory

The publisher puts a file at a fixed address on its own domain, `/.well-known/adagents.json`, naming the agents allowed to sell its inventory. It is the same idea as `ads.txt` and `sellers.json`, which do this for seller IDs, moved up a level to agent endpoints. A publisher can list the authorisations in that file or point at one central file elsewhere, which is how a network of a thousand sites manages it without editing a thousand files.

The central-file option is the one with a threat model attached, and the schema writes the attack and the defence into a single field description. One deploy can change authorisation across every publisher in a network, so anything reading the file has to cap its size, refuse redirects, time out fast, and keep serving the last good copy when a fetch fails.

An empty list is legal. A reader "MUST NOT read it as deny-all, authorize-all, or a revocation", because a catalog-only mirror publishes formats for a platform that never adopted the protocol. Fail closed on an empty list and you drop inventory nobody was selling.

AdCP's own walkthrough skips this step and opens at discovery. What belongs in the file is covered in [agent discovery files](https://agenticadlab.com/guides/agent-discovery-files/), with the [field list](https://adcpexplorer.com/discovery/) alongside it.

## Step 2: the handshake

The buyer's agent opens the conversation with an empty request. The call whose job is finding out what the other side speaks requires no fields at all, and the answer carries everything: which protocols the seller supports, out of a closed list of seven, and which releases it speaks. The call is `get_adcp_capabilities`.

Two things in that answer decide work you do before the first real call. The first is versioning. Send a release number like `"3.1"` and treat the endpoint's answer as the version you are talking to, rather than pinning the major version on its own, which the protocol is retiring.

The second is authentication, and there is no single field for it. The floor is a bearer token per counterparty. Signed requests are an upgrade both sides negotiate, optional in 3.0 and required for spend-committing operations in 4.0, and sellers turn them on "selectively during per-counterparty pilots". Holding tokens for a hundred publisher agents, and knowing which one just expired, is an operations problem the protocol hands straight to you before you have made a single call.

## Step 3: describing the campaign

The call that asks a publisher what it can sell has exactly one required field. It is `buying_mode`, and which of its three values you send decides the conversation that follows. `brief` is curated discovery: the buyer describes the campaign in plain English and the seller proposes against it. `wholesale` skips the conversation and hands over raw feed access against structured filters. `refine` is another pass over products and proposals you already hold.

The brief text itself is conditionally required: mandatory when the mode is `brief`, forbidden when the mode is `wholesale` or `refine`. That rule lives in the field descriptions and in nothing a validator enforces. So brief mode does not actually require a brief, and a request saying "curate for me" with nothing to curate against passes validation and goes on the wire.

Deciding what belongs in the brief text and what belongs in the structured filters is a real job with money attached, and [Brief Gateway](https://briefgateway.com/spec/brief-vs-filters/) works through it. Everything else on the request is context the seller may use: the brand, the account, delivery preferences, a list of properties, and performance thresholds, which sit lower down than most people look. The call is `get_products`.

## Step 4: the creative call that exists twice

The buyer's agent now needs creative formats, so it calls `list_creative_formats`. There are two calls by that name, registered once under media buy and once under creative, pointing at two request schemas that are not the same object.

|                 | The media-buy one                                   | The creative one               |
| --------------- | --------------------------------------------------- | ------------------------------ |
| Who answers     | the selling agent                                   | the creative agent             |
| What comes back | format IDs, plus which creative agents provide them | the full format specifications |
| What it is for  | finding out what this publisher accepts             | finding out how to build it    |

The registry says it plainly once you are on the right entry: "Buyers query creative agents for full format specifications." Learn the call from the creative documentation, point it at the publisher's selling agent, and you send fields that schema has never heard of. The split is documented nowhere. That is how the trap works.

## Steps 5 and 6: the spend check

The gate is `check_governance`, and it needs a plan to check against. A plan does not exist until the buyer has pushed one to a policy agent, so the two come as a pair and the first is easy to miss. A plan "defines the authorized parameters for a campaign", which it lists as budget limits, channels, flight dates and authorised markets. The gate takes that plan and the caller's identity and decides whether this agent, on this plan, may do this thing.

The endpoint belongs to the buyer. AdCP describes the governance agent as an external service the advertiser configures on its own account. The seller receives the endpoint and credentials at account sync, calls it the way the buy-side orchestrator does, and cannot override the verdict. Policy sits with the party spending the money.

Enforced is a stronger word than the protocol has earned. A buy with no plan behind it is still a legal buy, because the plan reference is required only "when the account has governance_agents". No policy agent on the account, no plan, no gate. AdCP's own [trust documentation](https://docs.adcontextprotocol.org/docs/trust) calls it "a seam, not an enforcer". Steps 5 and 6 are policy you impose on your own agent, not a lock the wire holds shut.

Neither approval in the two campaigns above went through this call. They were people in a user interface, which is what most governance is today.

Permission is still where this protocol spent its surface area. The [permission machinery](https://adcpexplorer.com/areas/governance/) is about twice the size of the machinery that books the buy, which tells you what the people writing it were worried about. Programmatic has no equivalent, because there is nothing to validate a plan against when the unit of trade is one impression.

## Step 7: booking the buy

Booking requires five things, and each one is an argument about how media should work. It wants a retry key, because retries are assumed and double-spending is not the buyer's problem to solve by hand. It wants an account, because a billing relationship exists before the buy does. Then it wants the brand and the start and end dates, which rule out anonymous buying and open-ended commitments.

A sixth requirement is written in prose rather than in the schema, and a validator will not catch it: the buy needs either explicit line items or a reference to a proposal the seller already made, and a referenced proposal has to have been finalised first. That is the sort of rule that passes validation and fails at the counterparty. [The wire-level trace](https://agenticadlab.com/guides/how-a-machine-buys-media/) has the field names and the three shapes the response can take.

The rest of the request is the media plan plus paperwork: the budget, the plan reference, a purchase order number, an agency estimate number, an invoice recipient, an insertion-order acceptance record, the advertiser's industry. Nobody invents a purchase-order-number field from first principles. The call is `create_media_buy`.

## Some answers arrive days later

Seven operations can accept a request, say "submitted", and finish hours or days afterwards: discovery, signals, creative build, creative sync, catalog sync, the buy and its updates. Everything else answers inline, so the slow set is short and known, and the buyer's agent either polls or registers a webhook.

One of those slow answers will bite you. Alongside "still working" there is a state meaning a human or an upstream system has to supply something before the buy can proceed. A client that treats it as an error hangs on its first real campaign, and the human it is waiting for is usually on your own side.

## Step 8: reading delivery back

Reading delivery is easy. One call returns impressions, spend and pacing, and requires nothing at all.

Sending outcomes the other way is where the protocol makes a choice. The feedback call carries a single normalised performance index rather than raw conversions, and that index is the entire outcome channel from buyer to seller at 3.1.13. I think that is deliberate. The buyer normalises its own measurement and hands over one comparable number instead of a conversion definition the seller has to interpret. What travels the other way is richer: a performance standard attached to the buy names a metric, a threshold and a measurement vendor, so the vendor goes into the contract rather than the protocol trying to define measurement itself. The call is `provide_performance_feedback`.

## The vendor's diagram will use different words

The two stacks do not agree on what to call the software on the sell side, and not in the harmless way where two words point at one thing. AdCP's noun is "[sales agent](https://adtechglossary.com/agents/sales-agent/)", and it is the noun that governs who may sell; AAMP's repositories never use it. AAMP says "[seller agent](https://adtechglossary.com/agents/seller-agent/)", which AdCP uses in prose and never defines. AdCP has a governance agent holding the buyer's policy and AAMP has nothing in that role at all. So a slide reading "buyer agent talks to seller agent" is compatible with both stacks and commits to neither, and when the diagram is the only artefact in the room, ask which of the two words is in their code.

The same buy on the AAMP side runs differently in one respect that ends up in a contract. The buyer's agent finds the seller through an agent card listing skills, asks for availability against a media kit, and gets a quote the documentation is blunt about: "Quotes are non-binding price offers from the seller. They have a 24-hour TTL." Then the two bargain, with accept, counter, final offer and reject as the moves and with round limits and concession caps keyed off the buyer's [access tier](https://aampexplorer.com/negotiation/), and agreement turns the quote into a deal. AdCP has none of that on the wire at 3.1.13, where the nearest thing is a proposal moving from draft to committed. Every AAMP term here comes from reference-implementation code rather than a ratified specification, which is the weaker claim, and the published state diagram for an order no longer matches the code that implements it, so do not build against the diagram. [Agentic Ad Lab](https://agenticadlab.com/guides/how-a-machine-buys-media/) puts the two side by side, payload by payload.

## How much of this is running today?

Twenty-three agents were publicly listed on the AdCP registry on 12 August 2026. Three of them returned an actual product list to a caller with no credentials: Cora AI, Equativ and No Fluff Advisory. Two of those three send back the same catalogue no matter what the brief says.

So the sequence above is what the specification defines, and the part a stranger can exercise this morning is step 3, on three endpoints. Everything after it needs credentials, which is right for a protocol that moves money and also why nobody outside a deal can verify the interesting half. The agent-by-agent results are [on AdCP Explorer](https://adcpexplorer.com/guides/adcp-registry-measured/), and they make a better opening question for a vendor call than anything in a deck: which of these eight steps does your agent implement, and against which version.
