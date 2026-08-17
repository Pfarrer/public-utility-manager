## Context

Predecessor lessons: `-0` float poisoning on money, transactions itemized per kind, bankruptcy counter in state (serialize-safe). Fuel crisis factor arrives via game-events; economy only reads a fuelPrice input computed per tick.

## Goals / Non-Goals

**Goals:**
- One settlement function per quarter producing a transaction list
- Annual aggregation trivially derived from quarters
- All money rounded to cents, normalized (`+ 0`)

**Non-Goals:**
- Loans, taxes, subsidies
- Different tariffs per customer class (later)
- Coal contracts / hedging (open question, README)

## Decisions

- **Prices in data**: tariff default, fuel price, wage, crisis factor all in a balance JSON — balancable without code.
- **Bankruptcy counter in GameState** (`negativeCashQuarters`) — survives save/load.
- **Crisis factor as tick input**: economy itself is crisis-agnostic; events change the input.

## Risks / Trade-offs

- Flat tariff per quarter (no time-of-use) matches M1 simplicity; may feel crude — acceptable.
- Bankruptcy threshold 4 quarters is a guess; tune in playtest.
