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

Every fix leaves a test that fails on the old code. Write it, watch it fail, then fix it.

## Conventions you can't infer from the code

- User-facing text lives in `src/core/fr.js`. `test/smoke.js` fails the build if an
  English interface string reaches `index.html`.
- Storage keys keep their spelling: `vlaams-onderweg`, `vlaams/fallback`,
  `vlaams/outbox`, `vlaams/owner`. Renaming one orphans every database already on a
  device and every backup already written.
- The codebase uses `const` and arrow functions throughout and no optional chaining.
- The repo is **public**. Personal data stays out of tracked files; content personalises
  through `{naam}`, `{stad}` and `{bedrijf}`, substituted once at load.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` must exist for **Production and Preview**.
  Without them `build.sh` ships the local-only page and sync quietly does nothing.
- The Supabase anon key is public by design; row-level security protects the data.

## Decisions already taken

Progress is reported as **counts, never percentages**. There is no mastery metric and no
placement test; both were removed deliberately after a week of real study, not lost.
The spec lists what else is deliberately not a goal.

## Where the thinking is written down

- `docs/CONSTATS-2026-10-06.md` — what a week of real study found, and how it was found
- `docs/superpowers/specs/2026-10-08-moteur-et-contenu-design.md` — the current spec
- `docs/superpowers/plans/2026-10-08-moteur-ecrans-garde-fous.md` — the implementation plan
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
