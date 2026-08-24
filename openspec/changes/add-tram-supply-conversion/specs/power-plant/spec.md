## ADDED Requirements

### Requirement: Converter station is buildable
The building catalog SHALL contain a converter station (`converter-station`, kind converter) that converts three-phase AC to 600 V DC for the tram overhead line; at most one converter station per region SHALL be allowed; it SHALL contribute no generation capacity; its staffing SHALL be derived implicitly and shown read-only, like plant components.

#### Scenario: Catalog entry with region limit
- **WHEN** the player builds a converter station in a region that has none
- **THEN** the order succeeds and construction begins

#### Scenario: Second station blocked
- **WHEN** the player tries to order a second converter station in the same region
- **THEN** the order is blocked and the catalog entry shows a disabled state with a hint

#### Scenario: No generation capacity
- **WHEN** a converter station is operational
- **THEN** neither DC nor AC generation capacity changes
