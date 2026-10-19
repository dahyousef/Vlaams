# Run notes — read before your brief

For every implementer of a plan run. They say what your brief cannot know about this machine and this run.
Where they differ from a command in your brief, these notes win.

## Where you work

- In the run's worktree, named in `<WS>/run.md`, and nowhere else. It lies inside the clone at
  `%USERPROFILE%\dev\vlaams-phase-2`, whose own checkout stays on `main`: never read, write or run anything
  outside the run's worktree.
- `<WS>` is the run's workspace, `.superpowers/sdd/<plan name>/` inside the worktree, git-ignored. Scratch
  files (shell scripts, captured output, commit message files) go in `<WS>/tmp/`. Nothing stray under `src/`
  or `test/`. Where the brief writes `/tmp/x`, use `<WS>/tmp/x`.

## The shell

- PowerShell is the shell; `sh`, `node` and `git` are on PATH. The brief's commands are `sh` commands.
- PowerShell mangles double quotes inside an argument and non-ASCII characters in a pipe. For anything beyond
  a plain command (a pipe, a redirection, quotes, `;`, `$?`, an accent), write the command lines to a `.sh`
  file in `<WS>/tmp/` with the Write tool and run `sh "<that file>"`. A risky git command (`git push`,
  `reset`, `clean`, `checkout --`, `restore`, `branch -D`) always runs as a plain command, never inside a `.sh` file: the guardrail reads only the command
  string.
- Name the repository root `.`, never `"$(pwd)"`.
- Sources in the working tree have CRLF line endings and commits have LF (`core.autocrlf=true`). Match on
  content, not on line endings; `git diff` is the judge of what you changed.

## Tests

- After changing anything under `src/`, run `sh build.sh`.
- Run the test file your brief names (`node test/<name>.js .`) as often as you need. Do not run the whole
  suite (`sh test/run-all.sh`): a verifier runs it after your commit.
- Where a step says "Run … Expected …", run it and compare. For a step that says to watch a test fail, really
  run it and see it fail before you make the change; that output goes in your report.

## How to follow the brief

- Do every step, in order, as written. Transcribe the brief's code: do not improve, rename, reformat or
  reorder it, and add nothing the brief does not ask for.
- If a step does not apply, or prints something other than what is expected, suspect your own transcription
  first. If it still differs, stop and report: status `BLOCKED`, or `DONE_WITH_CONCERNS` if everything else
  holds. Never weaken a test to make it pass.
- If the brief leaves a decision open, do not decide it: stop with status `NEEDS_RULING` and the question in
  one or two lines.
- Comments match the file you edit (mostly French). User-facing text lives in
  `src/core/fr.js` and `src/core/en.js`, under the same keys; one is never changed without the other. `const`, or `let` where a value changes, never `var`; no optional chaining;
  arrows for short helpers and callbacks, `function` declarations for longer named functions.

## Git

- You commit. You do not push, open a pull request, run `gh` or comment on issues: the task controller does.
- Commit with a message file: write it with the Write tool to `<WS>/tmp/`, then `git commit -F "<file>"`.
  The message is the subject exactly as the brief's `git commit -m "…"` gives it; then, if your dispatch
  names a ticket, a blank line and `Refs #<ticket>`; then any attribution trailers your own instructions ask
  for, after one blank line. Never write it with `Set-Content` or `Out-File` (they add a BOM).
- Stage exactly what the brief's `git add` line stages. If you ran `sh build.sh` and the brief's `git add`
  does not name `index.html` and `artifact.html`, stage them too.
- One commit for the task; one more per fix round. Never amend or rewrite a commit.
- No `git stash`. A hook refuses `git reset --hard`, `git clean -f`, `git checkout -- .`, `git restore .`,
  `git branch -D` and any push to `main`. A refused command is never retried, in any form. A push or `gh` step
  in your brief is the task controller's: skip it and say so in your report.
- The repository is public: no personal data in files or commit messages.
- Do not edit the plan, `GLOSSARY.md`, `docs/adr/`, or any file your brief does not name.

## Your report and your final message

- Write your full report to the path your dispatch names: each step, the commands you ran and what they
  printed (the failing run included), anything that differed from the brief.
- Your final message is at most 10 lines: status (`DONE`, `DONE_WITH_CONCERNS`, `BLOCKED` or
  `NEEDS_RULING`), commit hash, the test command and its result line, the report path, and — for `BLOCKED`
  or `NEEDS_RULING` — the question.

## The plan's global constraints

`<WS>/global-constraints.md` holds them word for word. Read it.
