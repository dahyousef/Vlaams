# Vlaams

Flemish Dutch for French speakers. One static page, no runtime dependencies, no bundler.
Deployed on Vercel from `main`; progress syncs to Supabase.

Written in English because every agent-facing doc here is. The app's own text and most
code comments are French — match the file you're editing.

## Build

`build.sh` concatenates the files listed in its `SRC` variable into `index.html` and
`artifact.html`. The order in `SRC` is the only thing that sequences the code: a new
source file that isn't listed there loads nothing, and nothing says so.

`index.html` and `artifact.html` are **committed build outputs**. After changing anything
under `src/`, run `sh build.sh` and commit both.

## Tests

`sh test/run-all.sh` runs everything, and it is the same list CI runs. A new test file
goes in that list or it never runs. `TESTING.md` says what each suite covers — and what
the suite cannot see.

The suite takes three to six minutes. While working, run the one file you are changing, for
example `node test/engine.js .`. A new suite loads the app through
`test/lib/browser.js` and answers exercises through `test/lib/answer.js`, as a learner
would. Grading through `NL.srs.grade()` directly is for `test/engine.js`, the scheduler's
own suite; the older `test/smoke.js` and `test/sync.js` do it too. Any suite may call
`NL.srs` to set up or read state, as `test/pace.js` calls `compose()` and `needsVoice()`.

Every fix leaves a test that fails on the old code. Write it, watch it fail, then fix it.
A refactor (a name, a layout, a duplicate folded, a repeated run removed) changes no
behaviour, so no test can fail on the old code: the suite staying green is its check.

## Running a plan

A plan runs with `docs/agents/plan-runs/`. Each sitting is a new session started with the
prompt in `run-controller.md`: never `--resume` a run. The run controller hands one task at
a time to a task controller and reads only the ledger's status table and rulings, and
returns of at most 10 lines. Every task in a plan carries `Class: engine` or
`Class: mechanical`, which sets the models. Design never happens inside an implementer: it
goes to a design sitting (`design-sitting.md`). Phase 3 alone runs as one session, with a
drafting lane beside the code lane (`one-session.md`); the maintainer decides at its end
whether that stays.

## Conventions you can't infer from the code

- User-facing text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys; `test/lang.js`
  fails the build if one lacks a key or a screen mixes languages.
- Meanings and prose are read through `NL.gloss`; the display language through `NL.lang`.
- Storage keys keep their spelling: `vlaams-onderweg`, `vlaams/fallback`,
  `vlaams/outbox`, `vlaams/owner`, `vlaams/errors` (the local error log) and
  `vlaams/noaccount` (« continue without an account »). Renaming one orphans every
  database already on a device and every backup already written.
- The same goes for **field names inside a stored record** — `stage`, `due`, `interval`,
  `ease`, `reps`, `lapses`, `said`, `retired`, `base`, `folded`, and `displayLang` in the
  stored meta. Records are stored and synced whole, so a rename orphans them exactly as a key
  rename would (a missing `displayLang` means English: renaming it puts every learner back in
  English without a word; a missing `folded` means a record not yet folded: renaming it folds
  every word listed in two units again, over the misses made since, ADR 0006). `GLOSSARY.md`
  says to call a stage a **rung** in prose and in new names; it is not an instruction to
  rename the stored field.
- `const`, or `let` where it changes; no optional chaining (`test/smoke.js` checks both).
  Arrows for short helpers and callbacks, `function` declarations for longer named
  functions; existing code is not converted.
- The repo is **public**. Personal data stays out of tracked files; content personalises
  through `{naam}`, `{stad}` and `{bedrijf}`, substituted once at load.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` must exist for **Production and Preview**.
  Without them `build.sh` ships the local-only page and sync quietly does nothing.
- The Supabase anon key is public by design; row-level security protects the data.
- One function decides what a session contains, `NL.srs.compose()`, and it takes new items
  out before reviews. The home screen and the session both ask it. A second calculation
  anywhere is the fault phase 1 removed.
- Before touching a reset, `resetAt`, `base`, `ENGINE_EPOCH` or sync, read ADR 0006: the server's
  `keep_reset` trigger enforces part of it, and `ENGINE_EPOCH` must stay a fixed date.
- `said` on a stored record is what makes an item's first spoken exercise certain. That
  exercise never moves the item's rung: a written one, later in the same session, decides.
  « Je ne peux pas parler » lives in the running session and is deliberately not a
  setting. Issue #12 says why, for all three.

## Decisions already taken

Progress is reported as **counts, never percentages**. There is no mastery metric and no
placement test; both were removed deliberately after a week of real study, not lost.
The spec lists what else is deliberately not a goal.

## Where the thinking is written down

**The current spec is GitHub issue #12**, "New vocabulary every day, English by default, and
content to B1". Read it before planning or implementing anything. Tickets hang off it as
sub-issues. `GLOSSARY.md` holds the vocabulary it uses.


- `docs/superpowers/plans/2026-10-12-phase-1-moteur-ecrans-garde-fous.md` — the phase 1
  plan, implemented. Its last sections record why the engine is as it is
- `docs/CONSTATS-2026-10-06.md` — what a week of real study found, and how it was found
- `TESTING.md` — how this app is tested
- `ATTRIBUTION.md` — where the Dutch reference data comes from, and why it imposes no licence

## Agent skills

### Issue tracker

Issues live as GitHub issues on `dahyousef/Vlaams`, driven by the `gh` CLI, with GitHub's
native issue dependencies carrying the blocking edges. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical labels, unrenamed: `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Ask me first

- Pushing to `main` deploys to production. Work on a branch.
- The spec and the plan record decisions, not drafts. Propose a change rather than editing them.
