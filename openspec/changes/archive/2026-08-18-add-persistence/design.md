## Context

Predecessor pattern proven: storage injection for tests, version guard, deep-equal roundtrip as test. `-0`/id-counter pitfalls already handled upstream by sim-core/economy conventions.

## Goals / Non-Goals

**Goals:**
- Minimal robust localStorage persistence
- Tests run in node (no DOM) via injection

**Non-Goals:**
- Multiple save slots, export/import, cloud
- Migration between versions (reject, don't migrate, in M1)

## Decisions

- **JSON serialize whole GameState** — single key `pum-save-v1`.
- **Reject, not migrate**: M1 has one version; migration logic deferred until a real breaking change happens.
- **Autosave after full Q4 tick** so the save is a clean year boundary (clock already at next Q1).

## Risks / Trade-offs

- Single slot loses progress on careless restart — acceptable M1; slots later.
- localStorage size limits irrelevant at this state size.
