## Why

Narrative and pressure layer of M1: the annual newspaper with curated real headlines, an announced coal crisis (telegraph mechanic: warning one year ahead, effect the next), and the scripted tram deal as first industry offer with accept/reject and one possible re-offer.

## What Changes

- Historical events dataset: year → headline(s) (+ optional load effects), curated minimal set 1890–1900
- Annual newspaper assembly: historical headlines + game messages (blackouts, milestones) into one model
- Coal crisis: announced in year N newspaper (rising tensions), fuel factor active in year N+1
- Tram deal: scripted offer in year 2 (80 kW @ 70% tariff, 5 years); accept adds obligation (must serve) + growth boost; reject leaves tram company buying at normal tariff; possible one-time re-offer at 80% in the following year (seeded chance)

## Capabilities

### New Capabilities
- `game-events`: annual newspaper, announced coal crisis, scripted industry deal with negotiation outcome

## Impact

- New `app/src/lib/game/events.ts`, `app/src/lib/data/history.json`
- Depends on sim-core (clock/RNG), economy (fuel factor input, deal revenue), supply-dispatch (deal obligation), regional-growth (boost)
- Consumed by game-ui (newspaper modal)
