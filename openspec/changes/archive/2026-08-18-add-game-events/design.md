## Context

Newspaper is the vision's signature feature; M1 proves it with a minimal curated set (one headline per year 1890–1900, energy/industry focus). Deal mechanic mirrors the vision's industry-offer loop in its simplest scripted form.

## Goals / Non-Goals

**Goals:**
- Newspaper model as pure data assembly (UI renders later)
- Crisis as data-scheduled event with announce-year and effect-year
- Tram deal as explicit state machine (offered → accepted/rejected → optional re-offered → closed)

**Non-Goals:**
- Multiple concurrent deals, generic deal generation
- Player-initiated negotiations
- Wars, multi-year crisis chains

## Decisions

- **history.json curated minimal**: year → { headline, optional loadEffect }; loadEffect as simple multiplier hook, unused in M1 data except crisis.
- **Tram load as flat 80 kW added to every hour** of the curve (continuous industrial load) — simple, honest.
- **Re-offer chance seeded via sim RNG** (probability in data), decided once at rejection time — deterministic replay.

## Risks / Trade-offs

- Scripted single deal narrows replay value — fine for M1 concept proof.
- Headline curation is editorial work; keep to one per year now.
