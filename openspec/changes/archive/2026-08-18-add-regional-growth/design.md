## Context

Vision: growth loop is the game's engine but also its biggest balance risk (positive feedback). M1 needs the loop present but tamed: small rates, clamped, data-driven. Open README question tracks calibration.

## Goals / Non-Goals

**Goals:**
- Closed loop: reliability + affordability → adoption → demand growth
- All rates in one balance file
- Clamped monotone behavior (shares stay in [0,1], populations non-negative)

**Non-Goals:**
- Industry settlement choices (that's the deal mechanic, game-events)
- Migration between regions
- Detailed demographics (age structure etc.)

## Decisions

- **Per-segment adoption** (not one region number): poor adopt late — matches vision's wealth targeting and gives tariff decisions strategic depth.
- **Yearly population drift, quarterly adoption**: adoption feels responsive quarterly; household counts change on year boundaries to match annual newspaper rhythm.
- **Clamp everything**: shares to [0,1], segment moves exchange counts so totals are conserved.

## Risks / Trade-offs

- Positive-feedback blowup: rates conservative, counters clamped; playtest gate before tuning up.
- Linear drift is coarse; acceptable for M1.
