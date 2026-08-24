# AGENTS.md

Guidance for AI agents and humans working in this repository.

## Language

- The primary language of the project is **English**. Code, identifiers, comments, commit messages, documentation, and OpenSpec artifacts are written in English.
- **All specs MUST be phrased in English.** This applies to `openspec/specs/`, change deltas under `openspec/changes/<change>/specs/`, and the archive under `openspec/changes/archive/`. Requirements use RFC 2119 keywords (SHALL, MUST, SHOULD).
- Change docs (`proposal.md`, `design.md`, `tasks.md`) are English as well.
- Exception: in-game UI strings are German (the game itself is German-language). German appears only in user-facing strings and their tests, never in specs or docs.

## Conventions

- valibot (not zod) for all schema validation.
- Conventional Commits. Agent work is authored as `glm-hermes <glm-hermes@users.noreply.github.com>`.
- Never commit `*.tsbuildinfo`, `.hermes/`, or test logs.
- OpenSpec: MODIFIED requirements must carry over every existing scenario name. Validate every change with `openspec validate <change> --strict`.
- Commands: `npm run check` (svelte-check, use `--output human`), `npm test` (vitest), `npm run build`.
