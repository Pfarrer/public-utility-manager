# Delta Spec: power-plant

## REMOVED Requirements

### Requirement: Staffing scales with components
Reason: Employee management does not add anything to the grid simulation — plant capacity is already fully determined by the installed operational components, and crew micro-management distracts from the grid loop.
Migration: Available capacity equals the installed capacity of operational components (full staffing implied). The `crew` field disappears from the plant state; saves from versions that still carry crew data are rejected via the SAVE_VERSION bump to 3.
