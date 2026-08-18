# Tasks: tune-newspaper-presentation

## 1. Sim core — content gate
- [x] 1.1 In `runEvents` (events.ts), gate the newspaper push: only create a newspaper for a closed year when `headlineFor(year) !== ''` or the year has game messages
- [x] 1.2 Add tests in `events.test.ts`: year with headline → newspaper; year without headline and without messages → no newspaper; year with messages only → newspaper with messages and empty headline

## 2. UI — non-blocking presentation
- [x] 2.1 In `GameShell.svelte`: remove the `year-close` overlay and the `unseenPaper` auto-open branch; add a topbar badge `newspaper-notice` with unseen count that opens the latest unseen paper on click
- [x] 2.2 `dismissPaper` keeps counter semantics (`papersSeen = length`); ensure a loaded save surfaces its unseen paper via the badge only

## 3. Verification
- [x] 3.1 `npm run check` and `npm test` green in `app/`; `npm run build` succeeds
- [x] 3.2 Verified in browser: finish Q4 with content → badge appears, no overlay/modal; play 3 quarters without interaction → no modal; open via badge → modal opens and dismisses; year without content → no badge, no history entry
- [x] 3.3 Tick tasks.md checkboxes `[x]`, then commit `feat(newspaper): tune newspaper presentation` and push; verify CI green via `gh run list`

## 4. Archive
- [ ] 4.1 `openspec archive tune-newspaper-presentation -y`, sweep `TBD` purpose placeholders if any, `openspec validate --specs --strict`, commit
