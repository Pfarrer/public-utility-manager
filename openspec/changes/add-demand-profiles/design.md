## Context

Vision decision: Fourier-synthesis load curves. Open question (README) recommends group aggregation over per-household simulation — identical aggregate curve, far less compute. Groups = wealth category × settlement, jitter per group, seeded.

## Goals / Non-Goals

**Goals:**
- Analytic curves (evaluable at any hour, cheap to sum)
- Data-driven profile definitions (JSON + zod), balancable without code
- Peak + energy outputs that dispatch/economy consume

**Non-Goals:**
- Per-household storage or simulation
- Seasonal/annual harmonics (quarter granularity fixed for M1)
- Weather or temperature effects

## Decisions

- **Group = wealth category × settlement**; jitter drawn once per group per quarter from the sim RNG — deterministic replay preserved.
- **24 hourly samples** per quarter-day curve; M1 evaluates one representative day per quarter (peak of season applies as multiplier constant per quarter).
- **Non-negativity clamp** after evaluation (harmonic sums can dip negative for extreme jitter).
- **Quarter season multiplier**: flat 1.0 for M1 in data; hook exists for winter/summer later.

## Risks / Trade-offs

- Hourly resolution hides sub-hour peaks — acceptable at quarter ticks.
- Jitter bounds (±10% amplitude, ±1h phase) are initial guesses; balance later via data.
