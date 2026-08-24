## MODIFIED Requirements

### Requirement: Adoption grows with reliable affordable supply
The share of connected households SHALL increase per quarter when there are no blackouts and the tariff is at or below the wealth segment's willingness-to-pay. Shares SHALL be tracked per current type: every segment's share is a pair `{ dc, ac }` with `dc + ac ≤ 1`. AC shares SHALL start at 0 and grow only when AC capacity is available in the region and the AC tariff is at or below the segment's willingness-to-pay; existing DC shares SHALL NOT migrate to AC automatically.

#### Scenario: Good service
- **WHEN** a quarter has no blackout and tariff ≤ willingness-to-pay for a segment
- **THEN** that segment's electrification share increases

#### Scenario: AC adoption starts from zero
- **WHEN** the first AC generator becomes operational and the AC tariff is affordable for the wealthy segment
- **THEN** the wealthy segment's AC share grows from 0 while its DC share is unaffected

#### Scenario: No AC without AC capacity
- **WHEN** the region has AC tariff ≤ willingness-to-pay but no operational AC capacity
- **THEN** AC shares do not grow

#### Scenario: DC does not migrate automatically
- **WHEN** AC capacity and an affordable AC tariff exist for several quarters
- **THEN** DC shares remain and only total adoption (dc + ac) can approach 1
