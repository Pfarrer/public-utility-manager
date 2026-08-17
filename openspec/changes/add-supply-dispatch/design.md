## Context

M1 has one plant type, no storage, no transmission. Dispatch is therefore per-region capacity vs curve — merit order unnecessary. Satisfaction couples to growth in a later change; here it only updates.

## Goals / Non-Goals

**Goals:**
- Simple, auditable coverage math (per-hour min/diff)
- Satisfaction as stable 0–100 signal for UI + growth
- Era expectation factor as data hook for later decades

**Non-Goals:**
- Merit order, multiple plants bidding, storage
- Frequency/regulation mechanics (open question in README)
- Per-settlement outages (region granularity in M1)

## Decisions

- **Representative day per quarter**: demand curve evaluated once (24 samples); unserved = Σ max(0, demand−capacity) — matches quarterly tick granularity.
- **Era factor as constant in data** (`expectationFactor: 0.2` early era); the scaling-decades feature later modifies this spec.
- **Satisfaction lives in region state**, updated each tick by dispatch result.

## Risks / Trade-offs

- Single representative day underestimates extreme days — fine for M1; seasonal multipliers later.
- Linear satisfaction model is transparent but coarse; playtest and adjust constants via data.
