## 1. Spec delta + implementation
- [x] 1.1 Write the MODIFIED delta for `city-view`: illumination condition = region grid live (any operational plant), distribution lines to every lit settlement
- [x] 1.2 CityView: compute region-live state (any operational plant) once; glow requires region-live, not local plant presence
- [x] requires: city-view
- [x] 1.3 CityView: glow circle centered on settlement centroid (households live in the settlement, not in the plant)
- [x] 1.4 CityView: flow lines from nearest running plant anchor to each lit settlement centroid (share > 0)
- [x] 1.5 Tests: village lights up when the city plant runs; no light when no plant in the region runs; flow line to the village exists; glow centered on centroid
- [x] 1.6 Green suite: vitest, svelte-check, build; browser spot-check with two settlements
- [x] requires: city-view
