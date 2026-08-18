## 1. Catalog & Entities

- [x] 1.1 Author `buildings.json` (engine: cost/build-time/staffing/generatorsDriven; generator: capacity/cost/build-time/staffing) + valibot schema
- [x] 1.2 Plant entity types + capacity computation from components
- [x] 1.3 Unit tests: capacity from 2×6 config, engine-backed counting

## 2. Construction & Staffing

- [x] 2.1 Construction queue: order, per-tick progress, completion debit
- [x] 2.2 Reject orders exceeding cash projection
- [x] 2.3 Staffing: required crew, player-set crew, availability factor
- [x] 2.4 Unit tests: build-time delivery quarters, debit-on-completion, understaffed capacity, order rejection
