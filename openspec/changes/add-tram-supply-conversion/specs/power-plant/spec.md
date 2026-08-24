## ADDED Requirements

### Requirement: Converter station is buildable
The building catalog SHALL contain a converter station (`converter-station`, kind converter) that converts three-phase AC to 600 V DC for the tram overhead line; at most one converter station per region SHALL be allowed; it SHALL contribute no generation capacity; its staffing SHALL be derived implicitly and shown read-only, like plant components. The catalog entry SHALL be orderable only while the tram conversion phase is `accepted`: not before acceptance (phases `none`, `offered`) and not after completion (`converted` — the one station already exists; `rejected` — never).

#### Scenario: Catalog entry available after acceptance
- **WHEN** the conversion phase is `accepted` and the region has no converter station
- **THEN** the order succeeds and construction begins

#### Scenario: Second station blocked
- **WHEN** the player tries to order a second converter station in the same region
- **THEN** the order is blocked and the catalog entry shows a disabled state with a hint

#### Scenario: Not available before acceptance
- **WHEN** the conversion phase is `none` or `offered`
- **THEN** the converter station is not orderable (hidden or disabled with a hint)

#### Scenario: No generation capacity
- **WHEN** a converter station is operational
- **THEN** neither DC nor AC generation capacity changes
