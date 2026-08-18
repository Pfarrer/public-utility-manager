## Why

Economic loop of M1: revenue from served energy × tariff, fuel and staff costs, construction debits, itemized annual report and bankruptcy as game-over condition. Makes "cover your costs" from the vision playable.

## What Changes

- Tariff setting (player-adjustable €/kWh)
- Quarterly settlement: revenue = served kWh × tariff; fuel cost ∝ generated kWh; wages ∝ staffed crew; construction debits from plant orders
- Transaction ledger (kind: revenue/fuel/wages/construction) per quarter
- Annual report: itemized P&L per game year
- Bankruptcy: negative cash for 4 consecutive quarters → game over

## Capabilities

### New Capabilities
- `economy`: tariff, quarterly settlement with itemized transactions, annual P&L and bankruptcy

## Impact

- New `app/src/lib/game/economy.ts`
- Depends on supply-dispatch (served kWh), power-plant (fuel, wages via staffing, construction)
- Consumed by game-ui (report, tariff control), sim-core (game-over flag)
