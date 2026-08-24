## MODIFIED Requirements

### Requirement: Adoption grows with reliable affordable supply
The share of connected households SHALL increase per quarter when there are no blackouts and the tariff is at or below the wealth segment's willingness-to-pay. Shares SHALL be tracked per current type: every segment's share is a pair `{ dc, ac }` with `dc + ac ≤ 1`. AC shares SHALL start at 0 and grow only when AC capacity is available in the region and the AC tariff is at or below the segment's willingness-to-pay; existing DC shares SHALL NOT migrate to AC automatically while `dcAcceptingNew` is enabled.

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
- **WHEN** AC capacity and an affordable AC tariff exist for several quarters and `dcAcceptingNew` is enabled
- **THEN** DC shares remain and only total adoption (dc + ac) can approach 1

## ADDED Requirements

### Requirement: DC acceptance can be phased out by the player
A player control `dcAcceptingNew` (default enabled) SHALL exist; when disabled, no new DC adoption SHALL occur. While disabled, existing DC shares SHALL move to AC at a fixed quarterly phase-out rate per segment, but only in quarters where AC capacity is available and the AC tariff is strictly below the DC tariff; the migrated amount SHALL be added to the segment's AC share so that `dc + ac` stays constant during migration.

#### Scenario: Freeze new DC customers
- **WHEN** `dcAcceptingNew` is disabled and a quarter without blackout would otherwise grow the DC share
- **THEN** the DC share stays unchanged and no new adoption accrues to DC

#### Scenario: Existing customers drift when AC is cheaper
- **WHEN** `dcAcceptingNew` is disabled, AC capacity is available, AC tariff < DC tariff, and the wealthy segment's DC share is 0.71
- **THEN** the wealthy segment's DC share decreases and its AC share increases by the same amount in that quarter

#### Scenario: No drift without price advantage
- **WHEN** `dcAcceptingNew` is disabled but the AC tariff is at or above the DC tariff
- **THEN** existing DC shares do not move to AC

#### Scenario: Migration needs AC headroom
- **WHEN** `dcAcceptingNew` is disabled and AC tariff < DC tariff but AC capacity is exhausted
- **THEN** existing DC shares do not move to AC in that quarter
