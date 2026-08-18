## Context

Vision: player interacts at region level, not per settlement; regions are rectangles with distinct traits. M1 shows all four but plays one. Data-driven buildings/profiles pattern from predecessor: JSON + valibot, editable without code changes.

## Goals / Non-Goals

**Goals:**
- One static, schema-validated scenario file for M1
- Selectors pure and unit-testable
- Types stable enough for demand/growth/UI changes to build on

**Non-Goals:**
- Multiple scenarios, scenario picker, procedural generation
- Locking/unlocking logic beyond the static flag (progression comes later)
- Geography beyond the terrain tag (map layout is UI concern)

## Decisions

- **Wealth categories fixed to 3** (wealthy / average / poor) per vision; represented as a record keyed by category.
- **Households, not persons, as demand unit** — demand profiles attach to households; population stays as flavor stat for circle size.
- **valibot schema colocated** with data loader (`app/src/lib/game/scenario.ts`), thrown at load time, fail-fast.

## Risks / Trade-offs

- Fixed 3 categories may later need refinement (e.g. craftsmen) — record keying keeps extension non-breaking.
- Static lock flag hardcodes M1; progression change will modify this spec (expected, tracked as modified capability later).
