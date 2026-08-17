## 1. Profile Math & Data

- [ ] 1.1 Implement `demand.ts` profile evaluation (constant + harmonics, non-negative clamp)
- [ ] 1.2 Author `profiles.json` (household base per wealth, business) + zod schema
- [ ] 1.3 Unit tests: non-negativity, morning/evening peaks, wealth ordering

## 2. Variation & Aggregation

- [ ] 2.1 Implement seeded jitter (amplitude/phase bounds) per group
- [ ] 2.2 Implement region aggregation → 24h curve, peak kW, energy kWh
- [ ] 2.3 Unit tests: jitter reproducibility/bounds, aggregate = element-wise sum, industry shape
