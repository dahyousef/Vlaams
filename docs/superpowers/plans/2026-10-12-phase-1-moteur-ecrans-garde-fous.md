# Phase 1 — Engine, Screens and Guards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** New vocabulary reaches the learner every day, the screens report progress as two counts, and mechanical guards stop the same faults returning. Since 12 October 2026 it also brings the first spoken exercise forward, from about five weeks after an item is met to about one (Tasks 5b and 9b).

**Architecture:** One function, `NL.srs.compose()`, decides what a session contains, and both the home screen and the session ask it. Reinforcement a few minutes after meeting an item happens inside the running session, as a reserved place in its queue, so nothing is ever scheduled less than a day out. A unit opens the next when three quarters of its items have been met. Everything else in this phase is display, deletion, or a guard around those three decisions.

**Tech Stack:** Plain browser JavaScript hanging off the `NL.*` namespace, concatenated by `build.sh`; no dependencies, no bundler. Tests are Node scripts that load the sources into a `vm` context. Supabase for sync.

**Spec:** GitHub issue #12 on `dahyousef/Vlaams` (`gh issue view 12`). Read it with `GLOSSARY.md` and `docs/adr/0001`–`0007`. The two files under `docs/superpowers/` dated 2026-10-08 are superseded: do not implement from them.

## How this plan was produced, and how far to trust it

Every change below was built and run in a scratch copy of the repository before being written down. At the end of Task 11 the complete suite (`sh test/run-all.sh`, about six minutes) passes with no failure. The new tests were also run against today's engine and fail there, for the reasons each task states.

Task 2 was also applied alone, exactly as written here, and its tests pass on that tree. The failing output quoted in Tasks 2, 3 and 4 was measured on the tree each of those tasks starts from.

What was **not** run is each later intermediate commit on its own. Tasks 3, 6, 7, 9 and 11 touch the same files, and a note in each says which lines belong to a later task. If the suite is red after a task, the cause is almost certainly one of those boundaries: fix it in the task you are in, and keep one commit per task.

Tasks 5b and 9b were added on 12 October 2026, when the open question was settled. They were built on the end state of the other eleven, and the whole suite passes there with them. They were then placed where their dependencies put them: 5b after the simulation of Task 5, 9b after the mistakes session of Task 9. So the trees they start from here are not the tree they were measured on, and the failing output each quotes was measured on that end state with the task's own change left out. The full run of step 3b exists to check all of this before any ticket is written.

Eight points were decided while writing this plan or found to differ from the spec. The maintainer reviewed them on 12 October 2026; they are recorded at the end, under **Decisions, as settled on 12 October 2026**. The first of them corrects what the spec says stopped the new words.

## The order of work, and what the maintainer types

An agent runs this plan, but these moments are yours. Each step waits for the one before it.

**Where we are.** This table is the one place the state of the work is kept. Whoever finishes a step changes its line, with the date, before doing anything else. A session that starts cold reads this table first.

| Step | State |
| --- | --- |
| Plan written and reviewed; eight decisions settled; issue #12 corrected | done, 12 October 2026 |
| 1. Settle the open question, with a prototype | done, 12 October 2026: five weeks is too late, and Tasks 5b and 9b change it. See *The open question, as settled on 12 October 2026*. The addition to issue #12 was applied the same day |
| 2. Commit the plan, with its pointer in `CLAUDE.md` | done, 12 October 2026: committed and pushed on `phase-1-engine`, ahead of step 1 at the maintainer's request. No pull request is open yet |
| 3. Glossary and ADRs | done, 12 October 2026: eight terms added to `GLOSSARY.md`, *reinforcement* kept and *recall* retired; ADR 0006 (the reset) and ADR 0007 (the reserved share); the two candidates from Tasks 5b and 9b fail the first test and get none |
| 3a. Rewrite Tasks 5b and 9b: a first right spoken answer leaves the rung alone, and a writing exercise in the same session decides the climb | in progress. Decided on 12 October 2026, while defining *produced*: as written below, Task 5b lets reading an item aloud take it past rung 3, so the count of items the learner can produce stops meaning that they wrote it. **Until this line says done, Tasks 5b and 9b below describe the earlier design** |
| 3b. One full run of the thirteen tasks in a scratch copy, before any ticket | not started. It also renames the flag `recall` that Task 3 gives a queue entry, which the glossary now retires |
| 4. `/to-tickets` | not started |
| 5. Guardrail hook, then the run of the thirteen tasks | not started |
| 6. `/code-review main`, PR body, PR out of draft | not started |
| 7. The two-day check | not started |
| 8. Merge | not started |
| 9. `/retro`, then `/improve-codebase-architecture` | not started |

Three things live outside the repository on purpose. The verified end state of the eleven original tasks is one patch, at `../vlaams-phase-1-prototype.patch`. What Tasks 5b and 9b add to it is a second patch, `../vlaams-phase-1-5b-9b.patch`, applied after the first. Each header says how to use it and why it is not the way to implement. And `../vlaams-PROTOTYPE-when-first-spoken/` holds the prototype that settled the open question, with the scripts and the raw output behind every figure quoted for it.

1. **Review this plan, and settle the open question.** The eight points at the end were settled on 12 October 2026, and issue #12 was corrected the same day. The open question, on when a session first asks you to speak, was settled later that day: five weeks is too late, and Tasks 5b and 9b change it.

   It was settled with the **`prototype`** skill: one HTML file compared four ladders side by side, and each candidate was then measured on the engine of this plan with the whole course, for a learner who takes one session a day. What was measured, what was chosen and what was declined are in *The open question, as settled on 12 October 2026*.

2. **Have the plan committed** on `phase-1-engine` and pushed, so the tickets can link to it.

   The same commit adds one line to `CLAUDE.md`, under *Where the thinking is written down*. An agent that opens the repository reads `CLAUDE.md` first, and today it names only the superseded plan. Write the line with the **`writing-for-agents`** skill: a pointer says what the document is and when to reach for it, and nothing else.

   ```md
   - `docs/superpowers/plans/2026-10-12-phase-1-moteur-ecrans-garde-fous.md` — **the phase 1 plan**, in progress. Start at its table *Where we are*, which says which step is next. Execute phase 1 from it; its last sections record what was decided while writing it
   ```

3. **Bring the glossary up to date**, with the **`domain-modeling`** skill, before any ticket is written. Tickets share `GLOSSARY.md`, and this plan uses words it does not define:

   - *Place*: what a session has 22 of, one per item.
   - *Reserved share*: the places kept for items never met.
   - *Produced*: said of an item that has passed the writing rung. The glossary already says progress is "a count the learner can produce" without saying what that is.
   - *Reinforcement*: the second exercise an item gets in the session where it is met. This plan also called it a *recall*, which is already the name of an exercise on the first rung. *Reinforcement* is kept, as in ADR 0001 and the spec, and *recall* is retired.
   - *Said*: of an item the learner has answered aloud, correctly, at least once. Task 5b makes a rule depend on it.
   - *Spoken exercise*: the exercise that asks the learner to say an item aloud. The code calls it `speak`.
   - *Put off*: of a spoken exercise taken out of a session by « Je ne peux pas parler ». Not the same as skipped, which is a wrong answer.
   - *Backlog*: the items due and not yet served.

   The glossary holds definitions only, never implementation. By the skill's three tests (hard to reverse, surprising without context, a real trade-off), two decisions of this plan earn an ADR and the others do not: the reset as a timestamp with a fixed migration date (Task 8), and a reserved share that never yields (Task 3 and decision 7). The settlement of the open question adds two candidates to put to the same three tests: that an item's first spoken exercise is certain and costs no rung (Task 5b), and that « je ne peux pas parler » belongs to the session and is deliberately not a setting (Task 9b). Put to them on 12 October 2026, both fail the first: nothing stored depends on either, and each is a few lines to change back. That is the reason tiers got no ADR. Their reasoning stays in issue #12 and in the comments the two tasks write where someone about to change them will read it. Commit the glossary and the ADRs on the branch.

3b. **Run the whole plan once, in a scratch copy, before any ticket exists.** Tasks 5b and 9b were measured on the end state and then placed in the middle; see *How this plan was produced*. So before step 4 every task is executed in order, in a worktree that is thrown away afterwards: 1, 2, 3, 4, 5, 5b, 6, 7, 8, 9, 9b, 10, 11. Each step is done as written, and what it prints is compared with what the step expects.

   ```bash
   git worktree add ../vlaams-full-run phase-1-engine
   ```

   Where a step does not apply or an output differs, the fault is in this plan. Correct the plan, not the scratch copy, and carry on. Nothing from that worktree is pushed. When Task 11 ends green there, remove the worktree and commit the corrected plan. Only then are the tickets written, so that no ticket points at a task known to be wrong.

4. **Type `/to-tickets`.** Once, here, before any code is written. Point it at this plan and at issue #12.

   It should produce **thirteen tickets, one per task below, with the same titles**, as sub-issues of #12, labelled `ready-for-agent`, with GitHub's native dependencies for the blocking edges. Keep each ticket thin: what it delivers, how to tell it is done, and "Plan: Task N". "Done" is a completion criterion in the sense of `writing-for-agents`: something an agent can check, here the output its task's last step expects. The code stays in this plan and nowhere else; the skill itself asks for no file paths and no code in a ticket. It shows you the list and waits for your approval before it publishes anything.

   | Ticket | Same title as | Blocked by |
   | --- | --- | --- |
   | 1 | Task 1, one fake browser | nothing |
   | 2 | Task 2, the gate | 1 |
   | 3 | Task 3, composer, reservation, reinforcement in the session | 2 |
   | 4 | Task 4, cognates | 3 |
   | 5 | Task 5, the simulation | 4 |
   | 5b | Task 5b, said aloud from rung 3 | 5 |
   | 6 | Task 6, placement test removed | 1 |
   | 7 | Task 7, counts and unit names | 5 and 6 |
   | 8 | Task 8, reset and migration | 1 |
   | 9 | Task 9, mistakes screen | 7 and 8 |
   | 9b | Task 9b, « je ne peux pas parler » | 5b and 9 |
   | 10 | Task 10, content guards and stale build | 7 |
   | 11 | Task 11, error log | 7 |

   The edges say what genuinely gates what. The run itself takes the tasks in the order of this plan, 1, 2, 3, 4, 5, 5b, 6, 7, 8, 9, 9b, 10, 11, which respects every edge. The eleven original tasks were cut in that order; 5b and 9b were placed in it afterwards, which is what step 3b checks.

5. **Install the guardrail, then start the run.**

   The run is unattended, and `main` deploys to production; with this phase a deploy also runs the migration. `CLAUDE.md` says to work on a branch, and a sentence is not a lock. So before the run, in the session that wrote the tickets, install a hook that stops the git commands that cannot be taken back. It is adapted from the **`git-guardrails-claude-code`** skill, with two changes: that skill blocks every push, and the run must push the phase branch for CI; and it reads its input with `jq`, which is not installed in Git Bash on this machine, so as shipped it would block nothing and say nothing.

   Create `.claude/hooks/block-dangerous-git.js`:

   ````js
   #!/usr/bin/env node
   /* Stops the git commands that cannot be taken back, before they run.

      Claude Code calls this before every shell command (a PreToolUse hook) and
      passes the command as JSON on stdin. Exit code 2 blocks the command and shows
      the message to the agent; exit code 0 lets it through.

      Adapted from the git-guardrails-claude-code skill, with two changes for this
      repository. That skill blocks every push; here an agent must be able to push
      the phase branch, because CI only runs on pull requests, so only pushes that
      reach `main` are blocked: `main` deploys to production. And the skill reads
      its input with jq, which is not installed on the machine this runs on; a
      missing jq blocks nothing and says nothing. Node is always there. */
   const { execSync } = require('child_process');

   const PROTECTED = /^(main|master)$/;
   const names = cmd => /(^|[\s:+])(main|master)(\s|$)/.test(cmd);
   const branch = () => { try { return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } };

   function verdict(cmd) {
     /* One shell line can chain several commands: judge each on its own. */
     for (const part of cmd.split(/&&|\|\||;|\n/)) {
       const c = part.trim();
       if (/\bgit\b.*\bpush\b/.test(c)) {
         if (/\s(--force|-f|--force-with-lease)\b/.test(c)) return 'a forced push rewrites history that is already shared';
         if (/\s(--all|--mirror)\b/.test(c)) return 'this push would include main';
         if (names(c)) return 'a push to main deploys to production';
         const bare = !/\bpush\b\s+(-\S+\s+)*\S+\s+\S+/.test(c);          // no branch named: git pushes the current one
         if (bare && PROTECTED.test(branch())) return 'the current branch is main, and a push to main deploys to production';
       }
       if (/\bgh\s+pr\s+merge\b/.test(c)) return 'merging the pull request deploys to production: that step is the maintainer\'s';
       if (/\bgit\b.*\breset\b.*--hard\b/.test(c)) return 'git reset --hard throws away uncommitted work';
       if (/\bgit\b.*\bclean\b\s+-\w*f/.test(c)) return 'git clean -f deletes untracked files, the plan\'s progress ledger among them';
       if (/\bgit\b.*\bbranch\b\s+(-D|--delete\s+--force)\b/.test(c)) return 'git branch -D deletes a branch that may not be merged';
       if (/\bgit\b.*\b(checkout|restore)\b\s+(--\s+)?\.(\s|$)/.test(c)) return 'this discards every uncommitted change';
     }
     return null;
   }

   if (require.main === module) {
     let raw = '';
     process.stdin.on('data', d => { raw += d; });
     process.stdin.on('end', () => {
       let cmd = '';
       try { cmd = String((JSON.parse(raw).tool_input || {}).command || ''); } catch (e) { process.exit(0); }
       const why = verdict(cmd);
       if (why) {
         process.stderr.write('BLOCKED: ' + why + '. Ask the maintainer; do not look for another way to run it.\n');
         process.exit(2);
       }
       process.exit(0);
     });
   }
   module.exports = { verdict };
   ````

   Create `.claude/settings.json`. The matcher names both shells, because on Windows a session has a PowerShell tool as well as Bash, and a hook on Bash alone would be walked around without anyone meaning to:

   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Bash|PowerShell",
           "hooks": [
             { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/block-dangerous-git.js\"" }
           ]
         }
       ]
     }
   }
   ```

   The script was tested on 12 October 2026 against thirty commands, fourteen it must let through and sixteen it must block, and got all thirty right. What was **not** tested is the hook running inside Claude Code on this machine: whether that command line resolves on Windows, and whether the hook also covers subagents. So check it for real, twice, with a command that is harmless even if the hook does nothing:

   ```bash
   echo '{"tool_input":{"command":"git push origin main"}}' | node .claude/hooks/block-dangerous-git.js; echo "exit $?"
   ```

   Expected: `BLOCKED: a push to main deploys to production.` and `exit 2`. Then, in the fresh session of the run, before Task 1, ask it to run `git push --dry-run origin main`, and have one subagent try the same. Both must be refused by the hook. If either goes through, stop: fix the hook before any task starts.

   Commit the two files on the branch (`chore: a hook that stops pushes to main and other git commands that cannot be taken back`). A session reads its hooks when it starts, which is one more reason the run gets a session of its own.

   **Then start a fresh session** and paste this, with the ticket numbers GitHub gave:

   ```text
   Use superpowers:subagent-driven-development to execute
   docs/superpowers/plans/2026-10-12-phase-1-moteur-ecrans-garde-fous.md,
   every task in order (1 to 5, 5b, 6 to 9, 9b, 10, 11), on branch phase-1-engine.

   You may, without asking: push to phase-1-engine, open the draft PR, and comment
   on the phase 1 tickets (sub-issues of #12). Never push to main.

   Before Task 1, check the guardrail hook: run "git push --dry-run origin main"
   yourself and have one subagent run it too. Both must be blocked. If either is
   not, stop and tell me.

   Each task has a ticket with the same title. End each task's commit message with
   "Refs #<its ticket>", and list "Closes #<ticket>" for all thirteen in the PR body.
   ```

   From there the thirteen tasks run without stopping. **Between tasks you type nothing.** A fresh reviewer checks each task before the next one starts, and a review of the whole branch closes the run. That is the review between tickets, and it is part of the skill.

6. **Type `/code-review main`**, and say the spec is issue #12. Once, when Task 11 is pushed and CI is green on the draft PR.

   It reports on two axes, kept apart: whether the branch follows this repository's written standards, and whether it does what issue #12 asked. What it finds is fixed on the branch in one pass, each fix with a test that failed first, and the suite is run again.

   It comes **before** your own check, not after. The two days must test the code that will be merged; a fix made afterwards would start them again.

   When its findings are fixed, the pull request leaves draft with a body written by the **`pr`** skill. See *After the last task*.

7. **Your own check.** Two sessions on two consecutive days, on the preview deployment of the PR, on the phone and the desktop. See *After the last task*.

8. **Merge the PR** once the check passes. That deploys to production and closes the thirteen tickets.

9. **Type `/retro`, then `/improve-codebase-architecture`.** Type `/retro` in the session that ran step 5, before clearing it; from another session, point it at that session's log.

Two more skills are held for later phases, so that they are not forgotten: `wayfinder` and `wizard`. See *What comes after phase 1*.

## Global Constraints

- Branch `phase-1-engine`. Never commit to `main`: it deploys to production. One commit per task. Open a **draft PR** after Task 1, because CI runs only on pull requests and on pushes to `main`.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with the change. Both are committed build outputs.
- A new source file loads only if it is listed in `SRC` in `build.sh`. A new test runs only if it is listed in `test/run-all.sh`.
- Every fix leaves a test that fails on the old code. Write it, watch it fail, then fix.
- User-facing text lives in `src/core/fr.js` and stays **French** in this phase. `test/smoke.js` fails the build if an English interface string reaches `index.html`. English arrives in phase 2.
- Code comments are French in the files that are French; match the file you edit.
- `const` and arrow functions throughout. **No optional chaining.**
- Storage keys keep their spelling: `vlaams-onderweg`, `vlaams/fallback`, `vlaams/outbox`, `vlaams/owner`. This phase adds one, `vlaams/errors`.
- **Never rename a field inside a stored record**: `stage`, `due`, `interval`, `ease`, `reps`, `lapses`, `said`, `retired`. Records are stored and synchronised whole. `GLOSSARY.md` says *rung* in prose and in new names; the stored field stays `stage`.
- Vocabulary is `GLOSSARY.md`'s: item, rung, tier, met, due, lapse, session, day, budget, pace, unit, gate, frontier. *Mastered* is retired and must not appear on a screen.
- Progress is reported as **counts, never percentages**. No mastery metric and no placement test come back.
- Tiers stay unpopulated. The comment at `TIER_MAX` in `src/core/srs.js` says why; leave it.
- The repository is public. No personal data in tracked files, issues or commit messages.
- The suite takes about six minutes on this machine, most of it `test/pace.js` and the eight journeys. Run the one test you are working on while iterating, and the whole suite before each commit.
- On Windows the working tree has CRLF sources and the commit has LF. `git diff` hides the difference; an exact-string search in an editor may not. Match on content, not on line endings.

## Review Focus

Five things the spec does not mention and a learner will meet, and a sixth that it mentions since 12 October 2026. Each has a test in the task that owns the code.

1. **A session abandoned before its reinforcements.** Items met and then left must come back the next day, and must not fall due again the same day. → Task 3, block *Ce que la spécification ne dit pas*.
2. **Midnight passes during a session.** The session finishes and the new day's budget opens. → Task 3, same block.
3. **A word the learner added by hand.** It must be met in the next session, not after the whole course: own words sat at the end of the list. → Task 3, same block.
4. **A second device that is signed in, offline and stale when the reset happens.** Its queued answers must not put deleted progress back on the server. → Task 8, block *Remise à zéro*.
5. **Nothing left to do**: a unit with nothing new and nothing due, or a day budget already spent (including after the pace is lowered mid-day). No session, no error, and the home screen promises nothing. → Task 3, same block; Task 7 renders every screen in that state.
6. **A place where the learner cannot talk.** A spoken exercise put off must cost nothing, must not come back in the same session, and must come back as a spoken exercise in the next one. → Task 9b, block *Je ne peux pas parler*, and the third learner of `test/pace.js`.

---

### Task 1: One fake browser for every suite

Six test files each carry their own stub of the browser, and they have diverged: one knows speech recognition, one knows tab visibility, two fake the clock in different ways. This task replaces the six with one, and adds the helper every later test uses to answer an exercise through the screen. It changes no behaviour: the proof is that every suite reports exactly what it reported before.

**Files:**
- Create: `test/lib/browser.js`, `test/lib/answer.js`
- Modify: `test/smoke.js`, `test/sim.js`, `test/firstrun.js`, `test/sync.js`, `test/journey.js`, `test/pace.js`

**Interfaces:**
- Produces: `require('./lib/browser').open(opts)` → `{ ctx, NL, app, store, listeners, spoken, clock, mkEl, random }`; also `rng`, `sources`, `UA`, `SEED`. Options are documented at the top of the file. `clock` has `now()`, `set(ms)`, `advance(ms)` and only fakes `Date` when `opts.now` is given.
- Produces: `require('./lib/answer')(B)` → `{ right(), wrong(), next(wasMatch), click(d), type(value) }`, driving `NL.screens.sessie` by clicks and typing.

- [ ] **Step 1: Record what the suites report today**

Run: `sh test/run-all.sh > /tmp/before.txt 2>&1; echo $?`
Expected: `0`. Keep the file: it is the reference for Step 5.

- [ ] **Step 2: Write the shared browser**

Create `test/lib/browser.js`:

````js
/* Le faux navigateur, en UN exemplaire.

   Il y en avait six, un par suite, et ils avaient divergé : un seul connaissait
   la reconnaissance vocale, un seul la visibilité de l'onglet, deux truquaient
   l'horloge chacun à sa façon. Un test qui passe parce que SON navigateur ne
   sait pas faire ce que le vrai fait ne prouve rien.

   Tout est éteint par défaut : chaque suite allume ce dont elle a besoin, et ce
   qu'elle allume se lit en tête de fichier.

     const B = require('./lib/browser').open({ root: ROOT, seed: SEED, now: T0 });
     B.NL            l'application chargée
     B.app           l'élément #app (lire B.app.innerHTML)
     B.store         le localStorage
     B.listeners     tous les écouteurs posés, par type d'événement
     B.clock         l'horloge : now(), set(ms), advance(ms) — si `now` est donné
     B.spoken        ce que la synthèse vocale a prononcé — si `voices` est donné */
const fs = require('fs'), path = require('path'), vm = require('vm');

/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
   test du tout. La graine rend chaque exécution reproductible, en local comme
   en CI, et un échec devient donc un vrai signal. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = Number(process.env.SEED || 20260917);

const UA = {
  OPR: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 OPR/106.0',
  EDG: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 Edg/120.0',
  /* iPhone : Chrome est Safari par-dessous et n'a pas de reconnaissance. */
  IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120 Mobile/15E148 Safari/604.1',
  SAF: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
};

/* L'ordre de chargement est celui de build.sh, lu dans build.sh : une seule liste. */
const sources = root => fs.readFileSync(path.join(root, 'build.sh'), 'utf8')
  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);

/* opts :
     root       dossier du dépôt (obligatoire)
     files      liste de sources à charger ; par défaut, celle de build.sh
     skip       sources à ne pas charger (ex. ['src/app.js'])
     seed       graine de Math.random ; absente, le hasard est le vrai
     now        horloge de départ en ms ; absente, l'horloge est la vraie
     timers     'sync' (défaut) : setTimeout s'exécute tout de suite ; 'real' : le vrai
     onTimerError  ce que devient une erreur dans un minuteur 'sync' (défaut : ignorée)
     ua         navigator.userAgent
     voices     tableau de voix → speechSynthesis existe ; absent, il n'existe pas
     recogniser true → webkitSpeechRecognition existe (ctx.__saidNext, ctx.__denyNext)
     media      true → micro (refusé), MediaRecorder, presse-papiers, FileReader
     blobs      true → Blob, URL, Audio
     framed     true → la page tourne dans un cadre (window.top n'est pas window)
     byId       'stub' : getElementById rend un élément pour tout identifiant ; défaut : null
     location   champs ajoutés à location
     store      un localStorage existant (rechargement de page)
     config     window.NL_CONFIG ; supabase : window.supabase */
function open(opts) {
  const store = opts.store || {};
  const listeners = {};
  const spoken = [];
  const listen = (t, f) => { (listeners[t] = listeners[t] || []).push(f); };

  function mkEl(tag) {
    return {
      tagName: (tag || 'div').toUpperCase(), innerHTML: '', value: '', disabled: false,
      scrollTop: 0, dataset: {}, files: [], style: {}, children: [],
      classList: { _s: new Set(), contains(n) { return this._s.has(n); }, add(n) { this._s.add(n); }, remove(n) { this._s.delete(n); } },
      addEventListener: listen,
      removeEventListener() {}, setSelectionRange() {}, focus() {}, select() {}, click() {},
      setAttribute() {}, removeAttribute() {}, remove() {}, appendChild() {},
      insertAdjacentHTML() {}, matches: () => false, closest: () => null, contains: () => true,
      querySelector: () => null, querySelectorAll: () => [],
      getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
    };
  }
  const app = mkEl('div');

  const fakeClock = opts.now != null;
  const clock = {
    t: fakeClock ? opts.now : 0,
    now() { return fakeClock ? clock.t : Date.now(); },
    set(ms) { clock.t = ms; },
    advance(ms) { clock.t += ms; }
  };
  class FakeDate extends Date {
    constructor(...a) { if (!a.length) super(clock.t); else super(...a); }
    static now() { return clock.t; }
  }

  let M = Math;
  if (opts.seed != null) { M = Object.create(Math); M.random = rng(opts.seed); }

  const onTimerError = opts.onTimerError || (() => {});
  const syncTimers = opts.timers !== 'real';

  const ctx = {
    console,
    setTimeout: syncTimers ? f => { try { f(); } catch (e) { onTimerError(e); } return 0; } : setTimeout,
    clearTimeout: syncTimers ? () => {} : clearTimeout,
    setInterval: () => 0, clearInterval() {}, requestAnimationFrame: f => f(),
    Math: M, Date: fakeClock ? FakeDate : Date,
    JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    navigator: { onLine: true },
    location: Object.assign({ hash: '', protocol: 'https:', origin: 'https://vlaams.example', pathname: '/' }, opts.location || {}),
    document: {
      readyState: 'complete', visibilityState: 'visible',
      documentElement: { setAttribute() {}, removeAttribute() {} },
      getElementById: id => (id === 'app' ? app : opts.byId === 'stub' ? mkEl('input') : null),
      querySelector: () => null, querySelectorAll: () => [],
      addEventListener: listen,
      activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} },
      execCommand: () => true
    },
    addEventListener: listen, removeEventListener() {}
  };
  if (opts.ua) ctx.navigator.userAgent = opts.ua;

  if (opts.voices) {
    ctx.speechSynthesis = {
      getVoices: () => opts.voices,
      speak: u => { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); if (u.onend) u.onend(); },
      cancel() {}, addEventListener() {}
    };
    ctx.SpeechSynthesisUtterance = function (t) { this.text = t; };
  }
  if (opts.blobs || opts.media) {
    ctx.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
    ctx.Blob = function (parts) { this.size = (parts && parts[0] || '').length; };
    ctx.Audio = function () { return { play: () => Promise.resolve(), onended: null }; };
  }
  if (opts.media) {
    ctx.FileReader = function () { this.readAsText = () => { if (this.onload) this.onload(); }; };
    ctx.navigator.mediaDevices = { getUserMedia: () => Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) };
    ctx.navigator.clipboard = { writeText: () => Promise.resolve() };
    ctx.MediaRecorder = function () {};
  }
  /* iOS expose l'API même là où elle ne marche pas : le stub aussi. */
  if (opts.recogniser) {
    ctx.webkitSpeechRecognition = function () {
      this.start = () => {
        /* Le navigateur refuse le micro : erreur puis fin, comme Chrome et Edge. */
        if (ctx.__denyNext) {
          ctx.__denyNext = false;
          if (this.onerror) this.onerror({ error: 'not-allowed' });
          if (this.onend) this.onend();
          return;
        }
        const said = ctx.__saidNext || '';
        if (this.onresult) this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: said }], { isFinal: true, length: 1 })] });
        if (this.onend) this.onend();
      };
      this.abort = () => {};
    };
  }
  if (opts.config) ctx.NL_CONFIG = opts.config;
  if (opts.supabase) ctx.supabase = opts.supabase;

  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  ctx.top = opts.framed ? {} : ctx;
  vm.createContext(ctx);

  const skip = opts.skip || [];
  (opts.files || sources(opts.root)).filter(f => skip.indexOf(f) < 0).forEach(f => {
    try { vm.runInContext(fs.readFileSync(path.join(opts.root, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
  });

  return { ctx, NL: ctx.NL, app, store, listeners, spoken, clock, mkEl, random: M.random };
}

module.exports = { open, rng, sources, UA, SEED };
````

- [ ] **Step 3: Write the answering helper**

Create `test/lib/answer.js`:

````js
/* Répondre à l'exercice en cours comme le ferait une personne : par les clics
   et la saisie que l'écran attend, jamais en appelant le planificateur dans son
   dos. Une suite qui note elle-même les réponses ne traverse pas la séance — et
   c'est dans la séance que vivent les reprises et le rappel des rencontres.

     const answer = require('./lib/answer')(B);
     answer.right();   répond juste, puis laisse l'écran sur le verdict
     answer.wrong();   passe l'exercice : c'est la faute la plus simple à produire
     answer.next();    « Continuer »                                            */
module.exports = function (B) {
  const NL = B.NL, U = NL.util, S = NL.screens.sessie;
  const click = d => S.click({ dataset: d }, d);
  const type = value => S.input({ classList: { contains: n => n === 'textin' }, value });

  function right() {
    const c = S.peek();
    if (!c) return false;
    const task = c.task, ex = NL.ex.get(c.ex);
    if (c.ex === 'match') {
      /* La dernière paire fait avancer la séance d'elle-même. */
      for (let k = 0; k < task.pairs.length; k++) {
        click({ match: 'l' + k, k: String(k), side: 'l' });
        click({ match: 'r' + k, k: String(k), side: 'r' });
      }
      return true;
    }
    if (c.ex === 'corrige') click({ opt: String(task.faulty) });
    else if (task.opts) click({ opt: String(task.opts.findIndex(o => o.ok)) });
    if (task.bank) {
      const used = new Set();
      U.tiles(ex.answer(task)).forEach(w => {
        const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
        if (i >= 0) { used.add(i); click({ pick: String(i) }); }
      });
    }
    if (c.ex === 'open') type(task.task.model);
    if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) type(ex.answer(task));
    if (c.ex === 'speak') {
      if (NL.speech.listenBlocked()) click({ self: '1' });
      else { B.ctx.__saidNext = ex.answer(task); click({ mic: 'start' }); }
    }
    click({ check: '1' });
    return true;
  }

  const wrong = () => { if (!S.peek()) return false; click({ skip: '1' }); return true; };
  /* Après les paires, la séance a déjà avancé : il n'y a pas de verdict à quitter. */
  const next = wasMatch => { if (!wasMatch) click({ next: '1' }); };

  return { right, wrong, next, click, type };
};
````

Nothing uses `right()` for the pairs warm-up before Task 3; `firstrun.js` starts using the rest in Step 4.

- [ ] **Step 4: Move the six suites onto it**

Each suite loses its private stub and gains a call to `open()`. Nothing below the header changes, except where noted.

In `test/smoke.js`:

````diff
@@ -1,57 +1,18 @@
 /* Headless smoke test: loads every module into a stubbed browser and exercises
    the content model, the scheduler and all ten exercise types. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const path = require('path'), fs = require('fs');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 
-/* Même graine que les autres suites : une mesure statistique qui échoue une fois
-   sur dix ne dit rien. SEED=... pour rejouer une autre distribution. */
-function rng(seed) {
-  let a = seed >>> 0;
-  return () => {
-    a = (a + 0x6D2B79F5) >>> 0;
-    let t = Math.imul(a ^ (a >>> 15), 1 | a);
-    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
-    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
-  };
-}
-const SafeMath = Object.create(Math);
-SafeMath.random = rng(Number(process.env.SEED || 20260917));
-
-const store = {};
-const ctx = {
-  console,
-  setTimeout, clearTimeout, setInterval, clearInterval,
-  Math: SafeMath, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error,
-  localStorage: {
-    getItem: k => (k in store ? store[k] : null),
-    setItem: (k, v) => { store[k] = String(v); },
-    removeItem: k => { delete store[k]; }
-  },
-  navigator: { onLine: true },
-  location: { hash: '', protocol: 'file:' },
-  document: {
-    readyState: 'complete',
-    documentElement: { setAttribute() {}, removeAttribute() {} },
-    getElementById: () => null,
-    querySelector: () => null,
-    querySelectorAll: () => [],
-    addEventListener() {},
-    activeElement: { tagName: 'BODY' }
-  }
-};
-ctx.window = ctx;
-ctx.globalThis = ctx;
-vm.createContext(ctx);
-
-const FILES = `src/core/util.js src/core/fr.js src/core/state.js src/core/srs.js src/core/speech.js src/core/audio.js
-src/content/lexicon.a1.js src/content/lexicon.a1b.js src/content/grammar.js src/content/open.js src/content/reference.js
-src/content/scenarios.js src/content/index.js src/ex/index.js`.split(/\s+/).filter(Boolean);
-
-for (const f of FILES) {
-  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
-  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
-}
-
-const NL = ctx.NL;
+/* Le contenu, le planificateur et les exercices : ni interface, ni synchro, ni
+   phrases d'exemple. */
+const B = browser.open({
+  root: ROOT, seed: browser.SEED, timers: 'real', location: { protocol: 'file:' },
+  files: ['src/core/util.js', 'src/core/fr.js', 'src/core/state.js', 'src/core/srs.js', 'src/core/speech.js',
+    'src/core/audio.js', 'src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js', 'src/content/grammar.js',
+    'src/content/open.js', 'src/content/reference.js', 'src/content/scenarios.js', 'src/content/index.js',
+    'src/ex/index.js']
+});
+const NL = B.NL;
 let fails = 0;
 const ok = (cond, msg) => { if (!cond) { console.log('  FAIL: ' + msg); fails++; } };
````

In `test/sim.js`:

````diff
@@ -1,44 +1,12 @@
 /* Drives the real UI headlessly: renders every screen, then runs a whole session
    and a whole scenario, so any crash in a render path shows up here. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 
-const store = {};
-const mkEl = () => ({
-  innerHTML: '', value: '', disabled: false, scrollTop: 0, tagName: 'DIV',
-  dataset: {}, classList: { contains: () => false, add() {}, remove() {} },
-  addEventListener() {}, setSelectionRange() {}, focus() {}, click() {},
-  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
-  insertAdjacentHTML() {}, matches: () => false, getBoundingClientRect: () => ({ width: 400, height: 400, top: 0, left: 0 })
+const B = browser.open({
+  root: ROOT, location: { protocol: 'file:', origin: 'file://' },
+  onTimerError: e => { throw e; }
 });
-const app = mkEl();
-
-const ctx = {
-  console, setTimeout: (f) => { try { f(); } catch (e) { throw e; } }, clearTimeout, setInterval, clearInterval,
-  requestAnimationFrame: f => f(),
-  Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
-  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
-  navigator: { onLine: true, serviceWorker: undefined },
-  location: { hash: '', protocol: 'file:', origin: 'file://' },
-  document: {
-    readyState: 'complete',
-    documentElement: { setAttribute() {}, removeAttribute() {} },
-    getElementById: id => (id === 'app' ? app : null),
-    querySelector: () => null, querySelectorAll: () => [],
-    addEventListener() {}, activeElement: { tagName: 'BODY' }, createElement: mkEl
-  }
-};
-ctx.addEventListener = function(){}; ctx.removeEventListener = function(){}; ctx.window = ctx; ctx.globalThis = ctx;
-vm.createContext(ctx);
-
-const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
-  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);
-
-for (const f of FILES) {
-  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
-  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
-}
-
-const NL = ctx.NL;
+const NL = B.NL, app = B.app;
 let fails = 0;
 const fail = m => { console.log('  FAIL: ' + m); fails++; };
````

In `test/firstrun.js`:

````diff
@@ -1,58 +1,14 @@
 /* Cold start: empty database, first screen, first session answered CORRECTLY
    (not skipped), and the credit that should follow. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 
-
-/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
-   test du tout. La graine rend chaque exécution reproductible, en local comme
-   en CI, et un échec devient donc un vrai signal. */
-function rng(seed) {
-  let a = seed >>> 0;
-  return () => {
-    a = (a + 0x6D2B79F5) >>> 0;
-    let t = Math.imul(a ^ (a >>> 15), 1 | a);
-    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
-    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
-  };
-}
-const RAND = rng(Number(process.env.SEED || 20260917));
-const SafeMath = Object.create(Math);
-SafeMath.random = RAND;
-
-const store = {};
-const mkEl = () => ({
-  innerHTML: '', value: '', disabled: false, scrollTop: 0, tagName: 'DIV', dataset: {},
-  classList: { contains: () => false, add() {}, remove() {} },
-  addEventListener() {}, setSelectionRange() {}, focus() {}, click() {}, select() {},
-  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
-  insertAdjacentHTML() {}, matches: () => false, remove() {},
-  getBoundingClientRect: () => ({ width: 400, height: 400, top: 0, left: 0 })
+/* Opera, dans un cadre : ni reconnaissance vocale, ni voix. */
+const B = browser.open({
+  root: ROOT, seed: browser.SEED, ua: browser.UA.OPR, framed: true, blobs: true,
+  location: { origin: 'https://claude.ai' }
 });
-const app = mkEl();
-const ctx = {
-  console, setTimeout: f => { try { f(); } catch (e) {} }, clearTimeout, setInterval, clearInterval,
-  requestAnimationFrame: f => f(),
-  Math: SafeMath, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean, Blob: function () {},
-  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
-  navigator: { onLine: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120 OPR/106' },
-  location: { hash: '', protocol: 'https:', origin: 'https://claude.ai' },
-  document: {
-    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
-    getElementById: id => (id === 'app' ? app : null),
-    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
-    activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} }
-  }
-};
-ctx.addEventListener = () => {}; ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = {};
-vm.createContext(ctx);
-
-const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
-  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);
-for (const f of FILES) {
-  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
-  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
-}
-const NL = ctx.NL, U = NL.util;
+const NL = B.NL, U = NL.util, app = B.app;
+const answer = require('./lib/answer')(B);
 let fails = 0;
 const ok = (c, m) => { if (!c) { console.log('  FAIL: ' + m); fails++; } };
@@ -127,28 +83,6 @@ NL.state.open().then(() => {
       continue;
     }
-    /* Answer it properly, using the live task. */
-    const c = S.peek();
-    const task = c && c.task, ex = NL.ex.get(c ? c.ex : 'pick');
-    if (task) {
-      if (task.opts) {
-        const i = task.opts.findIndex(o => o.ok);
-        S.click({ dataset: {} }, { opt: String(i < 0 ? 0 : i) });
-      }
-      if (task.bank) {
-        const want = U.tiles(ex.answer(task)), used = new Set();
-        want.forEach(w => {
-          const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
-          if (i >= 0) { used.add(i); S.click({ dataset: {} }, { pick: String(i) }); }
-        });
-      }
-      if (c.ex === 'corrige') tap('sessie', { opt: String(task.faulty) });
-      if (c.ex === 'open') S.input({ classList: { contains: n => n === 'textin' }, value: task.task.model });
-      if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) {
-        S.input({ classList: { contains: n => n === 'textin' }, value: ex.answer(task) });
-      }
-      if (c.ex === 'speak') S.click({ dataset: {} }, { self: '1' });
-    }
-    S.click({ dataset: {} }, { check: '1' });
-    S.click({ dataset: {} }, { next: '1' });
+    answer.right();
+    answer.next(false);
   }
   console.log('  turns           ' + turns + (twins ? ', ' + twins + ' twin translation(s) matched crosswise' : ''));
@@ -165,20 +99,4 @@ NL.state.open().then(() => {
   ok(NL.srs.counts().seen > 0, 'nothing recorded in the scheduler');
 
-  /* Répond juste à la tâche en cours, par les mêmes clics qu'un utilisateur. */
-  function answerRight() {
-    const c = S.peek(), task = c.task, ex = NL.ex.get(c.ex);
-    if (task.opts && c.ex !== 'corrige') S.click({ dataset: {} }, { opt: String(task.opts.findIndex(o => o.ok)) });
-    if (task.bank) {
-      const used = new Set();
-      U.tiles(ex.answer(task)).forEach(w => {
-        const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
-        if (i >= 0) { used.add(i); S.click({ dataset: {} }, { pick: String(i) }); }
-      });
-    }
-    if (c.ex === 'corrige') S.click({ dataset: {} }, { opt: String(task.faulty) });
-    if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) S.input({ classList: { contains: n => n === 'textin' }, value: ex.answer(task) });
-    S.click({ dataset: {} }, { check: '1' });
-  }
-
   console.log('\nLE DÉFI');
   {
@@ -195,5 +113,5 @@ NL.state.open().then(() => {
       kinds[S.peek().ex] = 1;
       ok(['pick', 'recall', 'match', 'speak', 'article', 'intrus'].indexOf(S.peek().ex) < 0, 'recognition or self-rated exercise in the challenge: ' + S.peek().ex);
-      answerRight();
+      answer.right();
       ok(app.innerHTML.includes('foot ok'), 'the challenge rejected a correct answer (' + S.peek().ex + ')');
       if (i === 5) ok(/class="combo[^"]*"[^>]*>[^<]*6</.test(app.innerHTML), 'the combo counter is not shown after six in a row');
````

The old loop in `firstrun.js` called a function `tap` that the file never defined; it only survived because that branch was never reached.

In `test/sync.js`:

````diff
@@ -4,11 +4,7 @@
    réglages, la boîte d'envoi qui survit à une panne réseau, l'effacement quand un
    autre compte se connecte, et l'inertie totale sans configuration. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 
-const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
-  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean)
-  .filter(f => f !== 'src/app.js');
-
 let fails = 0, checks = 0;
 const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };
@@ -95,40 +97,14 @@ function fakeLib(device) {
 /* ---------------- un appareil ---------------- */
 function device(name, withConfig, store) {
-  const dev = { name, store: store || {}, winHandlers: {} };
-  const ctx = {
-    console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
-    Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
-    localStorage: {
-      getItem: k => (k in dev.store ? dev.store[k] : null),
-      setItem: (k, v) => { dev.store[k] = String(v); },
-      removeItem: k => { delete dev.store[k]; }
-    },
-    navigator: { onLine: true, userAgent: 'Mozilla/5.0 Chrome/120' },
-    location: { hash: '', protocol: 'https:', origin: 'https://vlaams.example', pathname: '/' },
-    document: {
-      readyState: 'complete', visibilityState: 'visible',
-      documentElement: { setAttribute() {}, removeAttribute() {} },
-      getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
-      addEventListener() {}, activeElement: { tagName: 'BODY' }
-    },
-    addEventListener: (ev, fn) => { (dev.winHandlers[ev] = dev.winHandlers[ev] || []).push(fn); },
-    removeEventListener() {}
-  };
-  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
-  if (withConfig) {
-    ctx.NL_CONFIG = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' };
-    ctx.supabase = fakeLib(dev);
-  }
-  vm.createContext(ctx);
-  for (const f of FILES) {
-    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
-    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
-  }
-  dev.ctx = ctx; dev.NL = ctx.NL;
-  const root = {
-    innerHTML: "", dataset: {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
-    classList: { add() {}, remove() {}, contains: () => false }
-  };
-  dev.root = root;
+  const dev = { name, store: store || {} };
+  /* Des minuteurs réels : la boîte d'envoi se vide après un délai, et c'est ce
+     délai que le test attend. app.js est laissé de côté, le test démarre lui-même. */
+  const B = browser.open({
+    root: ROOT, timers: 'real', skip: ['src/app.js'], store: dev.store, ua: 'Mozilla/5.0 Chrome/120',
+    config: withConfig ? { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' } : null,
+    supabase: withConfig ? fakeLib(dev) : null
+  });
+  const ctx = B.ctx, root = B.app;
+  dev.ctx = ctx; dev.NL = B.NL; dev.root = root;
   dev.boot = async () => {
     await dev.NL.state.open(); dev.NL.content.refresh();
@@ -142,5 +118,5 @@ function device(name, withConfig, store) {
     return r;
   };
-  dev.offline = v => { ctx.navigator.onLine = !v; (dev.winHandlers[v ? 'offline' : 'online'] || []).forEach(f => f()); };
+  dev.offline = v => { ctx.navigator.onLine = !v; (B.listeners[v ? 'offline' : 'online'] || []).forEach(f => f()); };
   return dev;
 }
````

In `test/journey.js`:

````diff
@@ -2,5 +2,5 @@
    Walks every screen and every flow the way a person would, and reports
    anything that throws, renders empty, or contradicts itself. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 const VOICE = process.argv[3] || 'nl-BE';
@@ -11,40 +11,4 @@ const ok = (c, m) => { checks++; if (!c) { console.log('   ✗ ' + m); fails++;
 const head = s => console.log('\n' + s);
 
-/* ---------- a browser, roughly ---------- */
-
-/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
-   test du tout. La graine rend chaque exécution reproductible, en local comme
-   en CI, et un échec devient donc un vrai signal. */
-function rng(seed) {
-  let a = seed >>> 0;
-  return () => {
-    a = (a + 0x6D2B79F5) >>> 0;
-    let t = Math.imul(a ^ (a >>> 15), 1 | a);
-    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
-    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
-  };
-}
-const RAND = rng(Number(process.env.SEED || 20260917));
-const SafeMath = Object.create(Math);
-SafeMath.random = RAND;
-
-const store = {};
-const listeners = {};
-function mkEl(tag) {
-  const el = {
-    tagName: (tag || 'div').toUpperCase(), innerHTML: '', value: '', disabled: false,
-    scrollTop: 0, dataset: {}, files: [], style: {}, children: [],
-    classList: { _s: new Set(), contains(n) { return this._s.has(n); }, add(n) { this._s.add(n); }, remove(n) { this._s.delete(n); } },
-    addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
-    removeEventListener() {}, setSelectionRange() {}, focus() {}, select() {}, click() {},
-    setAttribute() {}, removeAttribute() {}, remove() {}, appendChild() {},
-    insertAdjacentHTML() {}, matches: () => false, closest: () => null, contains: () => true,
-    querySelector: () => null, querySelectorAll: () => [],
-    getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
-  };
-  return el;
-}
-const app = mkEl('div');
-
 const voices = VOICE === 'none' ? [{ name: 'Microsoft Hazel', lang: 'en-GB' }]
   : VOICE === 'nl-NL' ? [{ name: 'Microsoft Frank', lang: 'nl-NL' }, { name: 'Microsoft Hazel', lang: 'en-GB' }]
@@ -53,76 +17,12 @@ const voices = VOICE === 'none' ? [{ name: 'Microsoft Hazel', lang: 'en-GB' }]
        { name: 'Microsoft Frank', lang: 'nl-NL', localService: true }, { name: 'Microsoft Hazel', lang: 'en-GB' }];
 
-const spoken = [];
-const ctx = {
-  console,
-  setTimeout: (f) => { try { f(); } catch (e) { console.log('   ✗ timer threw: ' + e.message); fails++; } return 0; },
-  clearTimeout() {}, setInterval() {}, clearInterval() {}, requestAnimationFrame: f => f(),
-  Math: SafeMath, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
-  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
-  Blob: function (parts) { this.size = (parts && parts[0] || '').length; },
-  Audio: function () { return { play: () => Promise.resolve(), onended: null }; },
-  FileReader: function () { this.readAsText = () => { this.onload && this.onload(); }; },
-  localStorage: {
-    getItem: k => (k in store ? store[k] : null),
-    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
-  },
-  navigator: {
-    onLine: true,
-    userAgent: {
-      OPR: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 OPR/106.0',
-      EDG: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 Edg/120.0',
-      /* iPhone : Chrome est Safari par-dessous et n'a pas de reconnaissance. */
-      IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120 Mobile/15E148 Safari/604.1',
-      SAF: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
-    }[BROWSER],
-    mediaDevices: { getUserMedia: () => Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) },
-    clipboard: { writeText: () => Promise.resolve() }
-  },
-  MediaRecorder: function () {},
-  location: { hash: '', protocol: 'https:', origin: 'https://claude.ai', href: 'https://claude.ai/x' },
-  speechSynthesis: {
-    getVoices: () => voices,
-    speak: u => { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); if (u.onend) u.onend(); },
-    cancel() {}, addEventListener() {}
-  },
-  SpeechSynthesisUtterance: function (t) { this.text = t; },
-  document: {
-    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
-    getElementById: id => (id === 'app' ? app : mkEl('input')),
-    querySelector: () => null, querySelectorAll: () => [],
-    addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
-    activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} },
-    execCommand: () => true
-  }
-};
-/* iOS expose l'API même là où elle ne marche pas : le stub aussi. */
-if (BROWSER !== 'OPR') {
-  ctx.webkitSpeechRecognition = function () {
-    this.start = () => {
-      /* Le navigateur refuse le micro : erreur puis fin, comme Chrome et Edge. */
-      if (ctx.__denyNext) {
-        ctx.__denyNext = false;
-        if (this.onerror) this.onerror({ error: 'not-allowed' });
-        if (this.onend) this.onend();
-        return;
-      }
-      const said = ctx.__saidNext || '';
-      if (this.onresult) this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: said }], { isFinal: true, length: 1 })] });
-      if (this.onend) this.onend();
-    };
-    this.abort = () => {};
-  };
-}
-ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = ctx;
-ctx.addEventListener = (t, f) => { (listeners[t] = listeners[t] || []).push(f); };
-vm.createContext(ctx);
-
-const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
-  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);
-for (const f of FILES) {
-  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
-  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
-}
-const NL = ctx.NL, U = NL.util;
+/* Opera définit l'API de reconnaissance sans service derrière : pas de stub. */
+const B = browser.open({
+  root: ROOT, seed: browser.SEED, ua: browser.UA[BROWSER], voices, media: true, byId: 'stub',
+  recogniser: BROWSER !== 'OPR',
+  location: { origin: 'https://claude.ai', href: 'https://claude.ai/x' },
+  onTimerError: e => { console.log('   ✗ timer threw: ' + e.message); fails++; }
+});
+const NL = B.NL, U = NL.util, ctx = B.ctx, app = B.app, listeners = B.listeners, spoken = B.spoken, mkEl = B.mkEl;
 
 /* Drives a screen's click handler the way the shell would. */
````

In `test/pace.js`:

````diff
@@ -3,71 +3,22 @@
    la dette de révisions, l'oscillation sous plafond, la monotonie des types,
    et le contenu épuisé au jour 27. */
-const fs = require('fs'), path = require('path'), vm = require('vm');
+const browser = require('./lib/browser');
 const ROOT = process.argv[2];
 const DAYS = Number(process.argv[3] || 400);
+const T0 = Date.parse('2026-01-05T08:00:00Z');
 
-let NOW = Date.parse('2026-01-05T08:00:00Z');
 let fails = 0, checks = 0;
 const ok = (c, m) => { checks++; if (!c) { console.log('   ✗ ' + m); fails++; } };
 const P = (l, v) => console.log('  ' + String(l).padEnd(38) + v);
 
-
-/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
-   test du tout. La graine rend chaque exécution reproductible, en local comme
-   en CI, et un échec devient donc un vrai signal. */
-function rng(seed) {
-  let a = seed >>> 0;
-  return () => {
-    a = (a + 0x6D2B79F5) >>> 0;
-    let t = Math.imul(a ^ (a >>> 15), 1 | a);
-    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
-    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
-  };
-}
-const RAND = rng(Number(process.env.SEED || 20260917));
-const SafeMath = Object.create(Math);
-SafeMath.random = RAND;
-
-const store = {};
-const mk = () => ({
-  tagName: 'DIV', innerHTML: '', value: '', dataset: {}, files: [],
-  classList: { contains: () => false, add() {}, remove() {} },
-  addEventListener() {}, setSelectionRange() {}, focus() {}, click() {}, select() {},
-  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
-  matches: () => false, remove() {}, appendChild() {}, setAttribute() {}, removeAttribute() {},
-  getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
+const B = browser.open({
+  root: ROOT, seed: browser.SEED, now: T0, ua: 'Chrome/120 OPR/106', blobs: true, byId: 'stub',
+  voices: [{ name: 'Bart', lang: 'nl-BE' }]
 });
-const app = mk();
-class FakeDate extends Date {
-  constructor(...a) { if (!a.length) super(NOW); else super(...a); }
-  static now() { return NOW; }
-}
-const ctx = {
-  console, setTimeout: f => { try { f(); } catch (e) {} return 0; },
-  clearTimeout() {}, setInterval() {}, clearInterval() {}, requestAnimationFrame: f => f(),
-  Math: SafeMath, Date: FakeDate, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
-  URL: { createObjectURL: () => 'b', revokeObjectURL() {} },
-  Blob: function () {}, Audio: function () { return { play: () => Promise.resolve() }; },
-  localStorage: {
-    getItem: k => (k in store ? store[k] : null),
-    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
-  },
-  navigator: { onLine: true, userAgent: 'Chrome/120 OPR/106' },
-  location: { hash: '', protocol: 'https:' },
-  speechSynthesis: { getVoices: () => [{ name: 'Bart', lang: 'nl-BE' }], speak(u) { if (u.onend) u.onend(); }, cancel() {}, addEventListener() {} },
-  SpeechSynthesisUtterance: function (t) { this.text = t; },
-  document: {
-    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
-    getElementById: id => (id === 'app' ? app : mk()),
-    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
-    activeElement: { tagName: 'BODY' }, createElement: mk, body: { appendChild() {} }
-  }
-};
-ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = ctx; ctx.addEventListener = () => {};
-vm.createContext(ctx);
-fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/SRC="([\s\S]*?)"/)[1]
-  .split('\n').map(s => s.trim()).filter(Boolean)
-  .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
-const NL = ctx.NL, U = NL.util;
+const NL = B.NL, U = NL.util, RAND = B.random;
+const answer = require('./lib/answer')(B);
+const MIN = 60000, DAY = 86400000;
+/* Un deuxième apprenant, moins assidu : une seule séance par jour. */
+const ONE_A_DAY = process.argv[4] === 'one';
 
 /* Combien de secondes coûte chaque type — pour traduire la charge en minutes. */
````

The three constants `answer`, `MIN`/`DAY` and `ONE_A_DAY` in that header are used from Task 5 on. In the same file, replace the one line that sets the clock:

````js
    NOW = Date.parse('2026-01-05T08:00:00Z') + (day - 1) * 86400000;
````

with:

````js
    B.clock.set(T0 + (day - 1) * 86400000);
````

- [ ] **Step 5: Check that nothing moved**

Run: `sh test/run-all.sh > /tmp/after.txt 2>&1; echo $?; diff /tmp/before.txt /tmp/after.txt`
Expected: `0`, and a diff confined to the `SCREENS`…`OWN WORDS` section of `sim.js`. That suite has never seeded its random numbers, so its exercise mix differs from run to run; every other line, including every check count, is identical.

- [ ] **Step 6: Commit, and open the draft PR**

````bash
git add test/lib test/smoke.js test/sim.js test/firstrun.js test/sync.js test/journey.js test/pace.js
git commit -m "test: one fake browser for every suite, and a helper that answers through the screen"
git push -u origin phase-1-engine
gh pr create --draft --title "Phase 1: engine, screens and guards" --body "Implements phase 1 of #12. Draft: opened early so CI runs on every push."
````

---

### Task 2: A unit opens the next when three quarters of it have been met

On 6 October the session had nothing new to serve. The gate measured items at the third rung, which takes at least two days of correct answers to reach, so once unit five was fully met the only unmet items in open units were six grammar rules. This task makes the next unit's words available. The regression test rebuilds the state measured on the learner's own account.

It repairs one of three defects, and the other two are Task 3's. With this task alone the session serves new words again, while the home screen still announces "0 nouveaux": that figure comes from a separate calculation. A reserved share without this task would be no better, because it would find six items to reserve.

**Files:**
- Create: `test/engine.js`
- Modify: `src/content/index.js`, `test/smoke.js`, `test/run-all.sh`

**Interfaces:**
- Consumes: `test/lib/browser.js`, `test/lib/answer.js` (Task 1).
- Produces: `NL.content.unitComplete(uid)` true when `ceil(0.75 × items)` are met; `NL.content.unitProgress(uid).toOpen`, the number of items still to meet before the next unit opens. Task 7 displays it.

- [ ] **Step 1: Write the failing test**

Create `test/engine.js`:

````js
/* Le moteur, vu de l'extérieur : ce qu'une séance contient, et quand un élément
   revient. Chaque bloc reproduit une situation réelle et regarde ce que la
   personne aurait devant elle — jamais les rouages du planificateur.

   L'horloge AVANCE pendant chaque séance. C'est tout l'enjeu : figée, un retour
   prévu dans douze minutes n'arrive jamais, et le défaut que cette suite garde
   est invisible. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-05T08:00:00Z');
const MIN = 60000, DAY = 86400000;
/* Ce que la spécification promet, écrit ici plutôt que relu dans le code : au
   moins 30 % des 22 places d'une séance, et jamais moins de quatre, vont au neuf. */
const FEW = 4, RESERVED = Math.max(FEW, Math.ceil(22 * 0.3));

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.OPR, byId: 'stub' });
const NL = B.NL, S = NL.screens.sessie;
const answer = require('./lib/answer')(B);

const met = it => !!NL.state.rec(it.id);
const isWord = it => it.kind !== 'pattern';
/* Place un élément sur un échelon, dû à l'instant donné. */
const put = (it, stage, due) => { NL.srs.seed(it, stage); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
const fresh = () => { NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };

/* Joue une séance entière, vingt secondes par exercice. `right(c)` dit si la
   réponse est juste. Rend ce qui a été servi, dans l'ordre. */
function play(right) {
  const served = [];
  if (!S.begin('vandaag')) return served;
  let guard = 0;
  while (S.peek() && guard++ < 120) {
    const c = S.peek();
    const wasMatch = c.ex === 'match';
    served.push({ ex: c.ex, id: c.items[0].id, item: c.items[0], unmet: !wasMatch && !met(c.items[0]), recall: !!c.recall, retry: !!c.retry });
    B.clock.advance(20000);
    if (wasMatch || !right || right(c)) answer.right(); else answer.wrong();
    answer.next(wasMatch);
    if (NL.ui.route === 'sessie' && B.app.innerHTML.indexOf('done-stage') >= 0) break;
  }
  S.abandon();
  return served;
}

NL.state.open().then(() => {
  NL.content.refresh();
  NL.ui.go('sessie');
  const units = NL.content.units;

  /* ------------------------------------------------------------------ */
  console.log('LA PANNE RÉELLE — une unité entièrement rencontrée, la suivante fermée');
  /* L'état mesuré sur le compte : quatre unités créditées par l'ancien test de
     niveau (pas encore dues), et l'unité 5 entièrement rencontrée la veille —
     une vingtaine d'éléments au premier échelon, le reste au deuxième, tous dus.
     Ce jour-là l'écran disait « 22 à revoir, 0 nouveaux » et aucun mot neuf n'est
     arrivé. Le chiffre de 430 éléments du rapport d'origine ne reproduit PAS la
     panne : ces éléments n'étaient pas dus. */
  {
    fresh();
    units.slice(0, 4).forEach(u => NL.content.itemsOf(u.id).forEach(it => put(it, 3, T0 + 2 * DAY)));
    const u5 = NL.content.itemsOf(units[4].id);
    u5.slice(0, 20).forEach(it => put(it, 1, T0 - MIN));
    u5.slice(20).forEach(it => put(it, 2, T0 - MIN));
    const waiting = NL.content.itemsOf(units[5].id).filter(isWord).length;
    ok(waiting > 20, 'the fixture is wrong: unit 6 should be entirely unmet');

    const p = NL.srs.plan();
    const served = play();
    const newWords = served.filter(x => x.unmet && isWord(x.item));
    console.log('  annoncé : ' + p.due + ' à revoir, ' + p.fresh + ' nouveaux — servi : ' +
      served.length + ' exercices, dont ' + newWords.length + ' mots jamais rencontrés');
    ok(newWords.length >= FEW,
      'a session served ' + newWords.length + ' never-met words while ' + waiting + ' wait in the next unit');
    ok(newWords.some(x => x.item.unit === units[5].id), 'none of the new words comes from the next unit');
  }
  /* ------------------------------------------------------------------ */
  console.log('\nLE SEUIL — trois quarts RENCONTRÉS ouvrent l’unité suivante');
  {
    fresh();
    const u1 = NL.content.itemsOf(units[0].id);
    const need = Math.ceil(u1.length * 0.75);
    ok(!NL.content.unitOpen(units[1].id), 'unit 2 is open on a blank account');
    ok(NL.content.unitProgress(units[0].id).toOpen === need, 'a blank unit should count down from ' + need + ', says ' + NL.content.unitProgress(units[0].id).toOpen);
    /* Rencontrés, pas plus : au tout premier échelon, répondus une seule fois. */
    u1.slice(0, need - 1).forEach(it => put(it, 0, T0 + DAY));
    ok(!NL.content.unitOpen(units[1].id), 'unit 2 opened one item short of three quarters');
    ok(NL.content.unitProgress(units[0].id).toOpen === 1, 'the countdown should read 1, reads ' + NL.content.unitProgress(units[0].id).toOpen);
    put(u1[need - 1], 0, T0 + DAY);
    ok(NL.content.unitOpen(units[1].id), need + ' of ' + u1.length + ' items met and unit 2 is still shut');
    ok(NL.content.unitProgress(units[0].id).toOpen === 0, 'the countdown did not reach zero');
    ok(!NL.content.unitOpen(units[2].id), 'unit 3 opened over a unit nobody has started');
    console.log('  unité 1 : ' + need + ' éléments rencontrés sur ' + u1.length + ' ouvrent l’unité 2, et pas la 3');

    /* La frontière ne recule pas. */
    NL.state.clearAll(); NL.content.refresh();
    NL.state.setMeta({ reached: 3 });
    ok(NL.content.unitOpen(units[3].id), 'a unit that had been opened is shut again');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'ENGINE OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
````

The figure of 430 credited items quoted in `docs/CONSTATS-2026-10-06.md` came from an automated browser pass, not from the account, and those items were not due during the stall. A test built on it passes on the broken code.

- [ ] **Step 2: Run it and watch it fail**

Run: `node test/engine.js "$(pwd)"`
Expected, as measured on `main`, with the home screen quoted exactly as the learner saw it:

```
LA PANNE RÉELLE — une unité entièrement rencontrée, la suivante fermée
  annoncé : 22 à revoir, 0 nouveaux — servi : 22 exercices, dont 0 mots jamais rencontrés
  FAIL: a session served 0 never-met words while 32 wait in the next unit
  FAIL: none of the new words comes from the next unit

LE SEUIL — trois quarts RENCONTRÉS ouvrent l’unité suivante
  FAIL: a blank unit should count down from 30, says undefined
  FAIL: the countdown should read 1, reads undefined
  FAIL: 30 of 39 items met and unit 2 is still shut
  FAIL: the countdown did not reach zero

11 checks, 6 FAILED
```

- [ ] **Step 3: Move the gate**

In `src/content/index.js`, replace:

````js
  const GATE = 0.8;

  const unitComplete = uid => {
    const items = itemsOf(uid);
    return !items.length || items.filter(READY).length / items.length >= GATE;
  };
````

with:

````js
  const MET = it => NL.srs.stageOf(it) >= 0;

  /* Une unité ouvre la suivante quand les trois quarts de ses éléments ont été
     RENCONTRÉS. Le seuil portait sur un échelon qui demande au moins deux jours
     de bonnes réponses : une unité entièrement rencontrée n'ouvrait pas la
     suivante, et il ne restait alors rien de neuf à servir. */
  const GATE = 0.75;
  const gateSize = n => Math.ceil(n * GATE);

  const unitComplete = uid => {
    const items = itemsOf(uid);
    return items.filter(MET).length >= gateSize(items.length);
  };
````

`READY` and `MASTERED` stay for now: the screens still print the figures built on them, and Task 7 removes both.

The catch-up loop in `frontier()` re-derived the same condition and goes:

In `src/content/index.js`:

````diff
@@ -93,13 +100,6 @@ NL.content = NL.content || {};
     let i = 0;
     while (i < us.length - 1 && unitComplete(us[i].id)) i++;
-    /* Une unité ouverte le reste. Sans cette mémoire, quelques rechutes dans
-       l'unité 1 la font repasser sous 80 % et referment les onze suivantes,
-       même entièrement rencontrées. Le maximum atteint reste contigu. */
-    /* Rattrapage pour les progressions d'avant : on ne rencontre les éléments
-       que d'une unité ouverte, donc une unité rencontrée à 80 % l'a été. */
-    for (let j = us.length - 1; j > i; j--) {
-      const items = itemsOf(us[j].id);
-      if (items.length && items.filter(it => NL.srs.stageOf(it) >= 0).length / items.length >= GATE) { i = j; break; }
-    }
+    /* Une unité ouverte le reste : la frontière ne recule jamais, et le
+       maximum atteint reste contigu. */
     const reached = Math.min(NL.state.meta().reached || 0, us.length - 1);
     if (i > reached) { NL.state.setMeta({ reached: i }); return i; }
````

In `unitProgress`, add the countdown. Replace:

````js
    if (!items.length) return { pct: 0, met: 0, ready: 0, mastered: 0, total: 0, gate: 0, level: 0 };
````

with:

````js
    if (!items.length) return { pct: 0, met: 0, ready: 0, mastered: 0, total: 0, gate: 0, level: 0, toOpen: 0 };
````

and replace:

````js
      level: Math.min(5, Math.floor(pct / 20))
    };
````

with:

````js
      level: Math.min(5, Math.floor(pct / 20)),
      toOpen: Math.max(0, gateSize(items.length) - met)
    };
````

- [ ] **Step 4: Bring the two frontier checks in `test/smoke.js` up to date**

Both built their fixture with `seed(it, 0)`, which now counts as met.

In `test/smoke.js`:

````diff
@@ -186,12 +147,13 @@ NL.state.open().then(() => {
     NL.state.setRec({ id: cog.id, kind: 'word', stage: 0, due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: 0, said: false, retired: false, lastEx: null });
     NL.srs.grade(cog, true);
-    ok(NL.srs.stageOf(cog) >= 3, 'un mot transparent devrait sauter les premiers échelons');
-    console.log('  transparent     « ' + cog.nl + ' » démarre à l’échelon ' + NL.srs.stageOf(cog));
+    ok(NL.srs.stageOf(cog) === 2, 'a cognate skips one rung, the meaning drill, and no more — it sits on rung ' + NL.srs.stageOf(cog));
+    console.log('  transparent     « ' + cog.nl + ' » saute le sens, et rien d’autre : échelon ' + NL.srs.stageOf(cog));
   }
 
-  /* La frontière est contiguë : impossible d'ouvrir une unité par-dessus un trou. */
-  NL.content.units.forEach(u => NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)));
+  /* La frontière est contiguë : impossible d'ouvrir une unité par-dessus un trou.
+     Le trou, c'est une unité dont rien n'a été RENCONTRÉ. */
+  NL.state.clearAll();
   const gapUnit = NL.content.units[3];
-  NL.content.itemsOf(gapUnit.id).forEach(it => NL.srs.seed(it, 0));
+  NL.content.units.forEach(u => { if (u !== gapUnit) NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)); });
   const opened = NL.content.units.map(u => NL.content.unitOpen(u.id));
   const firstShut = opened.indexOf(false);
@@ -200,16 +162,13 @@ NL.state.open().then(() => {
   console.log('  frontière       ' + (firstShut < 0 ? 'tout ouvert' : firstShut + ' unités ouvertes, puis fermé') + ' — contigu');
 
-  /* Une unité ouverte ne se referme pas : quelques rechutes dans l'unité 1
-     refermaient les onze suivantes, pourtant déjà rencontrées. */
+  /* Une unité ouverte ne se referme pas : la frontière est gardée en mémoire,
+     et des rechutes dans l'unité 1 ne referment rien. */
   {
-    NL.state.setMeta({ reached: 0 });
+    NL.state.clearAll();
     NL.content.units.forEach(u => NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)));
-    ok(NL.content.units.every(u => NL.content.unitOpen(u.id)), 'a fully worked course is not fully open');
-    NL.content.itemsOf(NL.content.units[0].id).forEach(it => NL.srs.seed(it, 1));
+    ok(NL.content.units.every(u => NL.content.unitOpen(u.id)), 'a fully met course is not fully open');
+    NL.content.itemsOf(NL.content.units[0].id).forEach(it => NL.srs.grade(it, false));
     const stillOpen = NL.content.units.filter(u => NL.content.unitOpen(u.id)).length;
     ok(stillOpen === NL.content.units.length, 'lapses in unit 1 closed ' + (NL.content.units.length - stillOpen) + ' unit(s) that were already open');
-    /* Rattrapage : sans mémoire enregistrée, une unité rencontrée à 80 % compte comme ouverte. */
-    NL.state.setMeta({ reached: 0 });
-    ok(NL.content.unitOpen(NL.content.units[NL.content.units.length - 1].id), 'an older profile with every unit met stays locked');
     console.log('  frontière       une unité ouverte le reste, même après des rechutes');
   }
````

The first hunk also changes the two lines about the cognate. **Leave those two lines as they are**: they belong to Task 4.

- [ ] **Step 5: List the test**

In `test/run-all.sh`, after the `dehet.js` line, add:

````sh
node test/engine.js   "$ROOT"
````

- [ ] **Step 6: Run and commit**

Run: `node test/engine.js "$(pwd)" && sh test/run-all.sh`
Expected: `11 checks, ENGINE OK`, then `TOUTE LA SUITE EST PASSÉE`. The first line of the engine test now reads:

```
  annoncé : 22 à revoir, 0 nouveaux — servi : 23 exercices, dont 18 mots jamais rencontrés
```

Eighteen new words served, and a home screen that still announces none. That contradiction is not a fault in this task: it is the allocation defect, and Task 3 removes it.

````bash
sh build.sh
git add src/content/index.js test/engine.js test/smoke.js test/run-all.sh index.html artifact.html
git commit -m "fix: a unit opens the next when three quarters of it have been met"
````

---

### Task 3: One composer, room reserved for new items, reinforcement inside the session

**The defect this task repairs is the allocation.** New items were given whatever was left once the reviews had been served, and two places computed that leftover differently:

- The home screen (`plan()`) subtracted reviews from the 22 places of a session. From 22 items due it announced "0 nouveaux", whatever remained to be met. Its own comment says the choice was deliberate: shave the new, not the reviews.
- The session (`start()`) subtracted reviews from the **day's** budget. It went on serving new items until 120 were due, then served none.

Measured on the tree Task 2 leaves, with unmet items available:

| Items due | Announced new | Served new |
| --- | --- | --- |
| 22 | 0 | 9 |
| 33 | 0 | 13 |
| 60 | 0 | 11 |
| 120 | 0 | 0 |
| 200 | 0 | 0 |

Neither calculation guaranteed anything new, and the two disagreed in between. **The reserved share is the repair**, not insurance for later: new items are taken out first, in one place, and reviews fill what is left. Two other changes ride with it because all three share one cost model, in which an item never met costs two exercises, its meeting and its reinforcement later in the same session.

- **Reservation.** Thirty per cent of a session's places, never fewer than four, go to items never met. It is computed from the session, comes out before reviews fill the rest, survives the trim when the day budget is nearly spent, and collapses when nothing is left to meet.
- **One composer.** `NL.srs.compose()` decides the contents; the home screen and the session both call it, so they cannot disagree again.
- **Scheduling.** No stored interval is under a day (ADR 0001). The twelve-minute return did not zero the new words. What it did was make an item due again as soon as it had been answered, so the same items filled every session all day and the review count stayed inflated.
- **Reinforcement.** Each item met in a session gets a second, reserved place later in that session, at least three exercises on. Answered right it climbs a rung, exactly as the twelve-minute return used to do.

A session has 22 places, one per item. With reviews waiting it holds 15 reviews and 7 meetings, so 29 exercises; with none it holds 11 meetings, so 22. That is the "roughly constant" the spec asks for. **A session therefore gets longer in time, not only in count**: the second exercise for each new item is the reinforcement this design adds, and it asks for more than recognition. For the simulated learner who does one session a day, a session runs between five and eleven minutes, where 22 exercises used to take about five.

**Files:**
- Modify: `src/core/srs.js`, `src/ui/session.js`, `test/engine.js`, `test/journey.js`

**Interfaces:**
- Consumes: the gate from Task 2.
- Produces: `NL.srs.compose(source, now)` → `{ due: Item[], fresh: Item[], left }`, `source` being `'vandaag'` or a unit id. `NL.srs.plan()` → `{ due, fresh, total, tasks, left, mins, units }` where `total` counts items, `tasks` counts exercises, and `units` is `{ from, to }` unit numbers or `null`. `NL.srs.unitSpan(items)`. Constants `NEW_SHARE`, `NEW_MIN`, `NEW_MAX`. `NL.srs.freshItems(n, uid)`.
- Produces: a session queue entry may carry `recall: true`; its `task` is built when its turn comes. `NL.screens.sessie.peek()` always returns a built entry.

- [ ] **Step 1: Write the failing tests**

In `test/engine.js`, insert these six blocks between the block *La panne réelle* and the block *Le seuil*, and the seventh after *Le seuil*, just before the final `console.log`. The fourth, *L'arithmétique*, is the regression test for the allocation: 22 or more items due, unmet items available, and both the announcement and the session must hold new items.

````js
  /* ------------------------------------------------------------------ */
  console.log('\nDEUX JOURS DE SUITE — un compte neuf');
  /* Le contrôle qu'une seule séance ne peut pas faire : le défaut ne se voit
     que le lendemain. */
  {
    fresh();
    const day1 = [play(), play(), play()].map(s => s.filter(x => x.unmet).length);
    B.clock.set(T0 + DAY);
    NL.state.touchDay();
    const first = play().filter(x => x.unmet).length;
    console.log('  jour 1 : ' + day1.join(', ') + ' rencontres par séance — jour 2, première séance : ' + first);
    ok(day1[0] >= FEW, 'day one met nothing');
    ok(first >= FEW, 'day two opened with ' + first + ' never-met items: the course stopped moving after day one');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE RAPPEL VIT DANS LA SÉANCE, PAS DANS LE CALENDRIER');
  {
    fresh();
    const served = play();
    const meetings = served.filter(x => x.unmet);
    const gaps = meetings.map(m => {
      const a = served.indexOf(m);
      const b = served.findIndex((x, i) => i > a && x.id === m.id && x.ex !== 'match');
      return b < 0 ? -1 : b - a;
    });
    ok(meetings.length >= FEW, 'a blank account met only ' + meetings.length + ' items');
    ok(gaps.every(g => g > 0), gaps.filter(g => g < 0).length + ' item(s) met in the session never came back in it');
    ok(gaps.every(g => g < 0 || g >= 3), 'an item came back only ' + Math.min.apply(null, gaps.filter(g => g > 0)) + ' exercise(s) after it was met');
    console.log('  ' + meetings.length + ' rencontres, chacune revue dans la séance, ' + Math.min.apply(null, gaps) + ' exercices plus tard au minimum');

    /* Rien de ce qui vient d'être répondu ne retombe dû dans la journée. */
    const soon = NL.state.allRecs().filter(r => r.due - B.clock.now() < DAY - 30 * MIN);
    ok(soon.length === 0, soon.length + ' item(s) are scheduled to return in less than a day (soonest: ' +
      Math.round(Math.min.apply(null, soon.map(r => r.due - B.clock.now())) / MIN) + ' min)');
    B.clock.advance(13 * MIN);
    ok(NL.srs.plan().due === 0, 'thirteen minutes after a session, ' + NL.srs.plan().due + ' items are due again');
    console.log('  treize minutes plus tard : ' + NL.srs.plan().due + ' à revoir');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nAUCUN INTERVALLE SOUS UN JOUR, À AUCUN ÉCHELON');
  {
    fresh();
    const it = NL.content.allItems().find(i => i.kind === 'word' && !i.cognate);
    let shortest = Infinity, where = '';
    for (let stage = 0; stage <= NL.srs.MAX_STAGE; stage++) {
      [true, false].forEach(right => {
        put(it, stage, T0);
        const r = NL.srs.grade(it, right, { ex: 'type' });
        if (r.due - B.clock.now() < shortest) { shortest = r.due - B.clock.now(); where = 'rung ' + stage + (right ? ', right' : ', wrong'); }
      });
    }
    /* Une toute première réponse fausse aussi. */
    fresh();
    const first = NL.srs.grade(it, false, { ex: 'pick' });
    shortest = Math.min(shortest, first.due - B.clock.now());
    ok(shortest >= DAY, 'an answer schedules a return in ' + Math.round(shortest / MIN) + ' min (' + where + ')');
    console.log('  intervalle le plus court après une réponse : ' + Math.round(shortest / 3600000) + ' h');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’ARITHMÉTIQUE — des révisions en nombre n’annulent plus le neuf');
  /* Le défaut tenait en deux soustractions qui ne disaient pas la même chose.
     L'écran d'accueil comptait le neuf comme ce qui reste des 22 places une fois
     les révisions servies : dès 22 éléments dus il annonçait « 0 nouveaux », quoi
     qu'il reste à rencontrer. La séance, elle, comptait sur le budget du JOUR :
     elle servait encore du neuf jusqu'à 120 éléments dus, puis plus rien. Deux
     calculs, deux réponses, et aucun ne garantissait du neuf. */
  {
    [22, 33, 60, 120, 200].forEach(n => {
      fresh();
      const all = NL.content.allItems();
      all.slice(0, n).forEach(it => put(it, 3, T0 - DAY));
      const p = NL.srs.plan();
      const served = play().filter(x => x.unmet).length;
      console.log('  ' + String(n).padStart(3) + ' dus, ' + (all.length - n) + ' à rencontrer : ' + p.fresh + ' nouveaux annoncés, ' + served + ' servis');
      ok(p.fresh >= RESERVED, n + ' items due, ' + (all.length - n) + ' unmet: the home screen announces ' + p.fresh + ' new');
      ok(served >= RESERVED, n + ' items due, ' + (all.length - n) + ' unmet: the session met ' + served + ' new item(s)');
      ok(served === p.fresh, n + ' items due: ' + p.fresh + ' new announced, ' + served + ' served');
    });
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLA RÉSERVE — du neuf même quand les révisions débordent');
  {
    /* Le quarantième jour : bien plus d'éléments dus qu'une séance n'a de places. */
    fresh();
    const all = NL.content.allItems();
    all.slice(0, 200).forEach(it => put(it, 3, T0 - DAY));
    const served = play();
    const news = served.filter(x => x.unmet).length;
    const reviews = served.filter(x => !x.unmet && !x.recall && !x.retry && x.ex !== 'match').length;
    console.log('  200 éléments dus : ' + reviews + ' révisions, ' + news + ' rencontres');
    ok(news >= RESERVED, 'with 200 items due, a session met only ' + news + ' new item(s)');
    ok(reviews + news <= NL.srs.MAX_TASKS, 'the session holds ' + (reviews + news) + ' items, more than its ' + NL.srs.MAX_TASKS + ' places');

    /* La réserve survit au rabotage : presque plus de budget, et pourtant du neuf. */
    fresh();
    all.slice(0, 200).forEach(it => put(it, 3, T0 - DAY));
    NL.srs.spend(NL.srs.pace().cap - 5);
    const tight = NL.srs.compose('vandaag');
    console.log('  cinq exercices de budget : ' + tight.due.length + ' révision(s), ' + tight.fresh.length + ' rencontre(s)');
    ok(tight.fresh.length >= 1, 'a nearly spent day budget squeezed out every new item');
    ok(tight.due.length + 2 * tight.fresh.length <= 5, 'the session costs more exercises than the day has left');
    NL.srs.spend(5);
    ok(NL.srs.plan().total === 0, 'a spent day budget still offers a session');

    /* Plus rien à rencontrer : la réserve disparaît, les révisions prennent tout. */
    fresh();
    all.forEach((it, i) => put(it, 3, i < 60 ? T0 - DAY : T0 + 30 * DAY));
    const full = NL.srs.compose('vandaag');
    ok(full.fresh.length === 0 && full.due.length === NL.srs.MAX_TASKS,
      'with nothing left to meet, the session holds ' + full.due.length + ' reviews and ' + full.fresh.length + ' new');
    console.log('  plus rien à rencontrer : ' + full.due.length + ' révisions, ' + full.fresh.length + ' rencontre');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’ANNONCE ET LA SÉANCE DISENT LA MÊME CHOSE');
  {
    const states = {
      'compte neuf': () => {},
      'quelques révisions': () => NL.content.allItems().slice(0, 9).forEach(it => put(it, 2, T0 - DAY)),
      'révisions qui débordent': () => NL.content.allItems().slice(0, 120).forEach(it => put(it, 3, T0 - DAY))
    };
    Object.keys(states).forEach(name => {
      fresh(); states[name]();
      const p = NL.srs.plan();
      const again = NL.srs.plan();
      ok(p.due === again.due && p.fresh === again.fresh, name + ': asking twice gives two answers');
      ok(S.begin('vandaag'), name + ': the session did not start');
      const q = [];
      /* La séance entière, répondue juste : aucune reprise ne vient gonfler le compte. */
      let guard = 0;
      while (S.peek() && guard++ < 120) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        q.push({ unmet: !wasMatch && !met(c.items[0]), match: wasMatch, recall: !!c.recall });
        answer.right(); answer.next(wasMatch);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      S.abandon();
      const news = q.filter(x => x.unmet).length;
      const reviews = q.filter(x => !x.unmet && !x.match && !x.recall).length;
      const tasks = q.filter(x => !x.match).length;
      console.log('  ' + name.padEnd(26) + 'annoncé ' + p.due + ' + ' + p.fresh + ' (' + p.tasks + ' exercices) — servi ' + reviews + ' + ' + news + ' (' + tasks + ')');
      ok(news === p.fresh, name + ': home announced ' + p.fresh + ' new, the session met ' + news);
      ok(reviews === p.due, name + ': home announced ' + p.due + ' to review, the session reviewed ' + reviews);
      ok(tasks === p.tasks, name + ': home announced ' + p.tasks + ' exercises, the session held ' + tasks);
    });
  }
````

````js
  /* ------------------------------------------------------------------ */
  console.log('\nCE QUE LA SPÉCIFICATION NE DIT PAS, ET QUI ARRIVE');
  {
    /* Séance quittée en route, avant le rappel des rencontres : rien n'est perdu,
       tout revient demain, et rien ne retombe dû aujourd'hui. */
    fresh();
    ok(S.begin('vandaag'), 'the session did not start');
    let n = 0;
    while (S.peek() && n < 6) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); n++; }
    S.abandon();
    const half = NL.state.allRecs();
    ok(half.length >= 4, 'the fixture is wrong: an abandoned session should have met a few items');
    ok(half.every(r => r.due - B.clock.now() >= DAY - 30 * MIN), 'an item met in an abandoned session is due again today');
    B.clock.advance(DAY);
    NL.state.touchDay();
    const back = NL.srs.compose('vandaag').due.length;
    ok(back === half.length, 'of ' + half.length + ' items met before quitting, only ' + back + ' come back the next day');
    console.log('  séance quittée après ' + half.length + ' rencontres : toutes reviennent le lendemain');

    /* Minuit passe pendant la séance : elle se termine, et le budget repart de zéro. */
    fresh();
    B.clock.set(Date.parse('2026-10-05T21:58:00Z'));      // 23 h 58 à Bruxelles
    NL.state.touchDay();
    const before = play().length;
    ok(before >= 20, 'a session that crosses midnight stopped after ' + before + ' exercises');
    ok(NL.srs.plan().total > 0, 'after midnight the new day offers nothing');
    console.log('  minuit pendant la séance : ' + before + ' exercices servis, et la journée suivante s’ouvre');

    /* Un mot ajouté à la main est rencontré à la séance suivante, pas après tout le cours. */
    fresh();
    const mine = NL.state.addCustom({ nl: 'de vergaderzaal', fr: 'la salle de réunion', kind: 'word' });
    NL.content.refresh();
    ok(NL.srs.compose('vandaag').fresh.some(it => it.id === mine.id), 'a word the learner added is not in the next session');
    NL.state.delCustom(mine.id); NL.content.refresh();

    /* Une unité où il ne reste rien à faire : pas de séance, et pas d'erreur. */
    fresh();
    NL.content.itemsOf(units[0].id).forEach(it => put(it, 3, T0 + 5 * DAY));
    ok(S.begin(units[0].id) === false, 'a unit with nothing new and nothing due still starts a session');
    ok(NL.screens.sessie.render(units[0].id).indexOf(NL.t.nothingDue) >= 0, 'the empty unit session does not say there is nothing to do');
    S.abandon();

    /* Budget du jour épuisé (ou rythme baissé en cours de journée) : rien n'est promis. */
    fresh();
    NL.srs.spend(NL.srs.pace().cap);
    NL.state.setMeta({ pace: 'calme' });
    const p = NL.srs.plan();
    ok(p.total === 0 && p.tasks === 0 && p.units === null, 'with the day budget spent the home screen still promises ' + JSON.stringify(p));
    ok(S.begin('vandaag') === false, 'a session starts although the day budget is spent');
    NL.state.setMeta({ pace: 'normal' });
    console.log('  mot ajouté à la main servi d’abord ; unité vide et budget épuisé : pas de séance, pas d’erreur');
  }
````

- [ ] **Step 2: Run them and watch them fail**

Run: `node test/engine.js "$(pwd)"`
Expected, as measured on the tree Task 2 leaves:

```
LA PANNE RÉELLE — une unité entièrement rencontrée, la suivante fermée
  annoncé : 22 à revoir, 0 nouveaux — servi : 23 exercices, dont 18 mots jamais rencontrés

DEUX JOURS DE SUITE — un compte neuf
  jour 1 : 22, 17, 20 rencontres par séance — jour 2, première séance : 11

LE RAPPEL VIT DANS LA SÉANCE, PAS DANS LE CALENDRIER
  FAIL: 22 item(s) met in the session never came back in it
  FAIL: 22 item(s) are scheduled to return in less than a day (soonest: 5 min)
  FAIL: thirteen minutes after a session, 22 items are due again

AUCUN INTERVALLE SOUS UN JOUR, À AUCUN ÉCHELON
  FAIL: an answer schedules a return in 2 min (rung 0, right)

L’ARITHMÉTIQUE — des révisions en nombre n’annulent plus le neuf
   22 dus, 417 à rencontrer : 0 nouveaux annoncés, 9 servis
  FAIL: 22 items due, 417 unmet: the home screen announces 0 new
  FAIL: 22 items due: 0 new announced, 9 served
   33 dus, 406 à rencontrer : 0 nouveaux annoncés, 13 servis
   60 dus, 379 à rencontrer : 0 nouveaux annoncés, 11 servis
  120 dus, 319 à rencontrer : 0 nouveaux annoncés, 0 servis
  FAIL: 120 items due, 319 unmet: the home screen announces 0 new
  FAIL: 120 items due, 319 unmet: the session met 0 new item(s)
  200 dus, 239 à rencontrer : 0 nouveaux annoncés, 0 servis

LA RÉSERVE — du neuf même quand les révisions débordent
  FAIL: with 200 items due, a session met only 0 new item(s)
CRASH TypeError: NL.srs.compose is not a function
```

(The failures at 33, 60 and 200 due are left out above; they repeat the pattern.) Read the block *L'arithmétique* closely, because it is the one that pins the defect:

- **Announced: zero at every row.** That is the home screen's subtraction, and it fails for the right reason.
- **Served: nine to thirteen new items up to 60 due, none from 120.** That is the session's own subtraction, on the day budget.

*Deux jours de suite* already passes here. It is a guard for the whole chain, not a failing test for this task: with the gate fixed and fewer than 120 items due, the old session still serves new items. An assertion written only as "with 22 or more items due and unmet items available, the session contains new items" would pass on the old code for the same reason.

- [ ] **Step 3: The scheduler: intervals, the composer, the reservation**

In `src/core/srs.js`:

````diff
@@ -5,9 +5,17 @@
 NL.srs = (function () {
   'use strict';
-  const { clamp, MIN, DAY } = NL.util;
+  const { clamp, DAY } = NL.util;
 
-  const MAX_TASKS = 22;
+  const MAX_TASKS = 22;             // les places d'une séance : un élément par place
   const MAX_STAGE = 6;
-  const GRADUATED = 5;              // atteint uniquement en disant l'élément à voix haute
+  const PRODUCE = 4;                // l'échelon de l'écrit est passé : l'élément se produit
+  /* La part de chaque séance réservée à ce qui n'a jamais été rencontré. Sans
+     elle, les révisions finissent par occuper toutes les places et plus rien de
+     neuf n'arrive. Elle se calcule sur la SÉANCE, jamais sur le budget du jour :
+     le budget vaut plusieurs séances, et en réserver 30 % dépasserait la séance. */
+  const NEW_SHARE = 0.3, NEW_MIN = 4;
+  /* Un élément rencontré revient une fois dans la même séance : il coûte donc
+     deux exercices. Au-delà de la moitié des places, la séance doublerait. */
+  const NEW_MAX = MAX_TASKS / 2;
   const RETIRE_AT = 200 * DAY;
   const MAX_INTERVAL = 365 * DAY;   // au-delà, l'élément est acquis, pas oublié      // au-delà, l'élément sort du paquet quotidien
@@ -5,9 +5,17 @@
 NL.srs = (function () {
   'use strict';
-  const { clamp, MIN, DAY } = NL.util;
+  const { clamp, DAY } = NL.util;
 
-  const MAX_TASKS = 22;
+  const MAX_TASKS = 22;             // les places d'une séance : un élément par place
   const MAX_STAGE = 6;
-  const GRADUATED = 5;              // atteint uniquement en disant l'élément à voix haute
+  const PRODUCE = 4;                // l'échelon de l'écrit est passé : l'élément se produit
+  /* La part de chaque séance réservée à ce qui n'a jamais été rencontré. Sans
+     elle, les révisions finissent par occuper toutes les places et plus rien de
+     neuf n'arrive. Elle se calcule sur la SÉANCE, jamais sur le budget du jour :
+     le budget vaut plusieurs séances, et en réserver 30 % dépasserait la séance. */
+  const NEW_SHARE = 0.3, NEW_MIN = 4;
+  /* Un élément rencontré revient une fois dans la même séance : il coûte donc
+     deux exercices. Au-delà de la moitié des places, la séance doublerait. */
+  const NEW_MAX = MAX_TASKS / 2;
   const RETIRE_AT = 200 * DAY;
   const MAX_INTERVAL = 365 * DAY;   // au-delà, l'élément est acquis, pas oublié      // au-delà, l'élément sort du paquet quotidien
@@ -84,6 +92,9 @@ NL.srs = (function () {
   };
 
-  /* Sous la journée, l'élément reste dans la même séance ; au-dessus, SM-2 prend le relais. */
-  const STEP = [2 * MIN, 12 * MIN, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY];
+  /* Aucun intervalle enregistré ne descend sous un jour. Le rappel quelques
+     minutes après la rencontre existe toujours, mais c'est la séance en cours
+     qui le fait (src/ui/session.js) : enregistré comme une échéance, il
+     disputait les places de la séance à tout le reste. Voir docs/adr/0001. */
+  const STEP = [1 * DAY, 1 * DAY, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY];
 
   const blank = (id, kind) => ({
@@ -183,14 +199,18 @@ NL.srs = (function () {
   const atTop = item => { const r = NL.state.rec(item.id); return !!r && r.stage >= maxRung(item); };
 
+  /* Les vrais retards passent devant. Un arriéré tombé au même instant est
+     départagé par un tirage qui dépend de l'élément et du nombre d'exercices
+     faits aujourd'hui : il change d'une séance à l'autre, mais pas entre l'écran
+     qui annonce la séance et la séance elle-même. */
+  const tieBreak = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
   function dueItems(now) {
     now = now || Date.now();
-    const list = NL.content.allItems().filter(it => {
-      const r = NL.state.rec(it.id);
-      return r && !r.retired && r.due <= now;
-    });
-    /* Mélange puis tri stable par échéance : les vrais retards passent devant,
-       mais un arriéré tombé au même instant est puisé uniformément au lieu de
-       rendre la même tranche à chaque séance. */
-    return NL.util.shuffle(list).sort((a, b) => NL.state.rec(a.id).due - NL.state.rec(b.id).due);
+    const m = NL.state.meta();
+    const salt = ':' + (m.exDay || '') + ':' + (m.exToday || 0);
+    return NL.content.allItems()
+      .filter(it => { const r = NL.state.rec(it.id); return r && !r.retired && r.due <= now; })
+      .map(it => ({ it, due: NL.state.rec(it.id).due, k: tieBreak(it.id + salt) }))
+      .sort((a, b) => a.due - b.due || a.k - b.k)
+      .map(x => x.it);
   }
 
@@ -223,11 +264,20 @@ NL.srs = (function () {
   }
 
-  /* Du nouveau seulement si la journée a de la place une fois les révisions faites. */
-  function freshItems(n) {
+  /* Les n premiers éléments jamais rencontrés des unités ouvertes, dans l'ordre
+     du cours. `uid` restreint à une unité. */
+  function freshItems(n, uid) {
     const out = [];
-    for (const it of NL.content.allItems()) {
+    if (n <= 0) return out;
+    const open = NL.content.frontier();
+    const at = {};
+    NL.content.units.forEach((u, i) => { at[u.id] = i; });
+    /* Les mots que la personne a ajoutés passent devant le cours : rangés en fin
+       de liste, ils attendaient que tout le reste ait été rencontré. */
+    const all = NL.content.allItems();
+    for (const it of all.filter(x => x.unit === 'eigen').concat(all.filter(x => x.unit !== 'eigen'))) {
       if (out.length >= n) break;
       if (NL.state.rec(it.id)) continue;
-      if (!NL.content.unitOpen(it.unit)) continue;
+      if (uid && it.unit !== uid) continue;
+      if (it.unit !== 'eigen' && !(at[it.unit] <= open)) continue;
       out.push(it);
     }
@@ -235,22 +285,60 @@ NL.srs = (function () {
   }
 
+  /* LE seul endroit qui décide de ce qu'une séance contient. L'écran qui
+     l'annonce et la séance elle-même posent tous deux la question ici : ils ne
+     peuvent donc pas se contredire.
+       source   'vandaag' (défaut) ou l'identifiant d'une unité
+       → { due, fresh, left }   deux listes d'éléments, et le budget restant */
+  function compose(source, now) {
+    const uid = source && source !== 'vandaag' ? source : null;
+    /* Travailler une unité précise est un choix : le budget du jour ne la bride pas. */
+    const left = uid ? Infinity : budgetLeft();
+    const places = Math.min(MAX_TASKS, left);
+    if (places <= 0) return { due: [], fresh: [], left };
+
+    let due = dueItems(now);
+    if (uid) due = due.filter(it => it.unit === uid);
+    const unmet = freshItems(MAX_TASKS, uid);
+
+    /* La réserve sort AVANT que les révisions remplissent le reste, et elle
+       disparaît d'elle-même quand il ne reste rien à rencontrer. */
+    const reserve = Math.min(unmet.length, places, Math.max(NEW_MIN, Math.ceil(places * NEW_SHARE)));
+    let nDue = Math.min(due.length, places - reserve);
+    let nNew = Math.min(unmet.length, Math.max(reserve, Math.min(NEW_MAX, Math.floor((places + reserve - nDue) / 2))));
+    /* Budget presque épuisé : on rabote les révisions d'abord. La réserve survit
+       au rabotage — c'est précisément ce qu'elle doit faire. */
+    while (nDue + 2 * nNew > left && nDue > 0) nDue--;
+    while (nDue + 2 * nNew > left && nNew > 1) nNew--;
+
+    /* Les règles de grammaire sont neuf parmi quatre cents : sans siège garanti,
+       une semaine entière peut passer sans en revoir une. */
+    const pats = due.filter(it => it.kind === 'pattern').slice(0, Math.min(2, nDue));
+    const rest = due.filter(it => pats.indexOf(it) < 0).slice(0, nDue - pats.length);
+    return { due: pats.concat(rest), fresh: unmet.slice(0, nNew), left };
+  }
+
+  /* Ce que l'écran d'accueil annonce : les comptes de compose(), rien d'autre.
+       total = éléments ; tasks = exercices (un nouveau en coûte deux) */
   function plan() {
-    const left = budgetLeft();
-    const due = Math.min(dueItems().length, left);
-    const room = Math.max(0, left - due);
-    const found = freshItems(Math.min(room, pace().fresh)).length;
-    /* Les parties doivent faire le tout : la séance est plafonnée à MAX_TASKS,
-       donc on rabote le nouveau, pas les révisions — sinon l'écran affiche
-       « -3 à revoir » en soustrayant un nouveau non plafonné d'un total plafonné. */
-    const total = Math.min(due + found, MAX_TASKS);
-    const dueShown = Math.min(due, total);
-    const fresh = total - dueShown;
-    return { due: dueShown, fresh, total, left, mins: Math.max(1, Math.round(total * 0.22)) };
+    const c = compose('vandaag');
+    const tasks = c.due.length + 2 * c.fresh.length;
+    return {
+      due: c.due.length, fresh: c.fresh.length, total: c.due.length + c.fresh.length,
+      tasks, left: c.left, mins: Math.max(1, Math.round(tasks * 0.22)),
+      units: unitSpan(c.due.concat(c.fresh))
+    };
+  }
+
+  /* Les unités que couvre une liste d'éléments : la première et la dernière. */
+  function unitSpan(items) {
+    const ns = [];
+    items.forEach(it => { const u = NL.content.unit(it.unit); if (u) ns.push(u.n); });
+    return ns.length ? { from: Math.min.apply(null, ns), to: Math.max.apply(null, ns) } : null;
   }
 
   return {
-    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, GRADUATED, TIER_MAX, RETIRE_AT,
+    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, PRODUCE, NEW_SHARE, NEW_MIN, NEW_MAX, TIER_MAX, RETIRE_AT,
     maxRung, pace, exerciseFor, supports, grade, seed, isSeen, stageOf, atTop,
-    dueItems, counts, freshItems, plan, recOf, budgetLeft, spend
+    dueItems, counts, freshItems, compose, plan, unitSpan, mistakes, recOf, budgetLeft, spend
   };
 })();
````

Three lines in those hunks belong to later tasks. For this task:

- keep `const GRADUATED = 5;` and do **not** add `const PRODUCE = 4;` (Task 7);
- in the export list at the bottom, keep `GRADUATED`, leave out `PRODUCE` and `mistakes` (Tasks 7 and 9). The list for this task is:
````js
    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, GRADUATED, NEW_SHARE, NEW_MIN, NEW_MAX, TIER_MAX, RETIRE_AT,
    maxRung, pace, exerciseFor, supports, grade, seed, isSeen, stageOf, atTop,
    dueItems, counts, freshItems, compose, plan, unitSpan, recOf, budgetLeft, spend
````

- [ ] **Step 4: The session: three strands laced together**

In `src/ui/session.js`:

````diff
@@ -47,76 +47,152 @@ NL.screens.sessie = (function () {
   }
 
-  function start(source) {
-    NL.state.touchDay();
-    if (source === 'defi') return startDefi();
-    const m = NL.state.meta();
-    const due = NL.srs.dueItems();
-    let fresh, pool;
-
-    if (source && source !== 'vandaag') {
-      const items = NL.content.itemsOf(source);
-      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
-      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
-    } else {
-      const left = NL.srs.budgetLeft();
-      pool = due.slice(0, left);
-      fresh = NL.srs.freshItems(Math.min(Math.max(0, left - pool.length), NL.srs.pace().fresh));
-    }
-
-    const queue = [];
-    /* Brand-new items get met as a matching warm-up before anything is demanded. */
-    const newWords = fresh.filter(it => it.kind !== 'pattern');
-    if (newWords.length >= 4) {
-      queue.push({ ex: 'match', task: EX.registry.match.build(newWords.slice(0, 5)), items: newWords.slice(0, 5) });
-    }
-    /* Grammar rules are nine items among four hundred, so uniform sampling buries
-       them — a whole week could pass without one. Give them a guaranteed seat. */
-    const pats = pool.filter(it => it.kind === 'pattern').slice(0, 2);
-    const others = pool.filter(it => pats.indexOf(it) < 0).slice(0, MAX_TASKS - pats.length);
-    /* Le gouverneur : on retient les deux derniers types servis pour qu'aucun
-       ne se répète coup sur coup. */
-    const rest = U.shuffle(pats.concat(others, fresh));
-    const recent = [];
-    rest.forEach(it => {
+  /* Un exercice par élément. Le gouverneur retient les deux derniers types
+     servis pour qu'aucun ne se répète coup sur coup. */
+  function build(items, recent) {
+    const out = [];
+    items.forEach(it => {
       const name = NL.srs.exerciseFor(it, new Set(recent));
-      const ex = EX.get(name);
       try {
-        queue.push({ ex: name, task: ex.build(it), items: [it] });
+        out.push({ ex: name, task: EX.get(name).build(it), items: [it] });
         recent.push(name);
         if (recent.length > 2) recent.shift();
-      } catch (e) { /* un élément mal formé est simplement sauté */ }
+      } catch (e) {
+        /* Un élément mal formé est sauté — mais plus en silence : sans trace,
+           il pouvait n'être jamais drillé sans que personne le sache. */
+        NL.errlog.note(e, 'exercice ' + name + ' · ' + it.id);
+      }
     });
+    return out;
+  }
 
-    /* Étalement optimal. Choisir « le premier qui diffère » ne suffit pas : quand
-       un type domine la file, il faut le répartir activement. On puise donc à
-       tour de rôle dans le plus gros paquet restant, ce qui est l'ordonnancement
-       qui minimise réellement les voisins identiques. La mémoire traverse aussi
-       les séances : sans elle, chaque nouvelle séance repart aveugle. */
-    const head = queue.length && queue[0].ex === 'match' ? [queue.shift()] : [];
+  /* Étalement optimal. Choisir « le premier qui diffère » ne suffit pas : quand
+     un type domine la file, il faut le répartir activement. On puise donc à
+     tour de rôle dans le plus gros paquet restant, ce qui est l'ordonnancement
+     qui minimise réellement les voisins identiques. */
+  function spread(list, last) {
     const bucket = {};
-    queue.forEach(x => { (bucket[x.ex] = bucket[x.ex] || []).push(x); });
-    queue.length = 0;                      // la file est vidée : on la reconstruit étalée
-    const spread = [];
-    let last = head.length ? head[0].ex : NL.state.meta().lastEx || null;
+    list.forEach(x => { (bucket[x.ex] = bucket[x.ex] || []).push(x); });
+    const out = [];
     const left = () => Object.keys(bucket).filter(k => bucket[k].length);
     while (left().length) {
       const keys = left().sort((a, b) => bucket[b].length - bucket[a].length);
       const k = keys.find(x => x !== last) || keys[0];
-      spread.push(bucket[k].shift());
+      out.push(bucket[k].shift());
       last = k;
     }
-    queue.push.apply(queue, head.concat(spread));
-    if (queue.length) NL.state.setMeta({ lastEx: queue[queue.length - 1].ex });
+    return out;
+  }
+
+  /* Trois temps : les rencontres, les révisions, puis le rappel de chaque
+     rencontre. C'est ce rappel qui remplace l'ancien retour à douze minutes :
+     l'élément revient quelques minutes plus tard, dans la même séance, sans
+     jamais devenir une échéance. Sa place est réservée dès le départ, pour que
+     le compteur de la séance ne s'allonge pas en cours de route. */
+  function start(source) {
+    NL.state.touchDay();
+    if (source === 'defi') return startDefi();
+    if (source === 'fouten') return startMistakes();
+    /* Ce que la séance contient, c'est compose() qui le décide — le même appel
+       que l'écran d'accueil. */
+    const c = NL.srs.compose(source);
+
+    const queue = [];
+    /* Brand-new items get met as a matching warm-up before anything is demanded. */
+    const newWords = c.fresh.filter(it => it.kind !== 'pattern');
+    if (newWords.length >= 4) {
+      queue.push({ ex: 'match', task: EX.registry.match.build(newWords.slice(0, 5)), items: newWords.slice(0, 5) });
+    }
+    /* La mémoire du dernier type traverse les séances : sans elle, chaque
+       nouvelle séance repart aveugle. */
+    const recent = [];
+    const meetings = spread(build(c.fresh, recent), queue.length ? 'match' : NL.state.meta().lastEx || null);
+    const reviews = spread(build(U.shuffle(c.due), recent), meetings.length ? meetings[meetings.length - 1].ex : NL.state.meta().lastEx || null);
+    queue.push.apply(queue, lace(meetings, reviews));
+    queue.forEach((x, i) => { if (x.recall) x.metAt = queue.findIndex(y => !y.recall && y.ex !== 'match' && y.items[0] === x.items[0]); });
 
     if (queue.length === 0) { L = null; return false; }
+    const built = meetings.concat(reviews);
+    if (built.length) NL.state.setMeta({ lastEx: built[built.length - 1].ex });
 
     L = Object.assign(blankTurn(), {
-      source: source || 'vandaag', queue: queue.slice(0, MAX_TASKS + 1), at: 0,
+      source: source || 'vandaag', queue, at: 0, cap: queue.length + 6,
       phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
-      newCount: fresh.length, combo: 0, bestCombo: 0, lives: null
+      newCount: c.fresh.length, combo: 0, bestCombo: 0, lives: null
+    });
+    arm();
+    return !!L.queue.length;
+  }
+
+  /* Un rappel ne revient jamais à moins de trois exercices de sa rencontre. */
+  const RECALL_GAP = 3;
+
+  /* Tresse les rencontres, les révisions et le rappel de chaque rencontre. Les
+     rappels se glissent à intervalles réguliers dans ce qui suit leur rencontre :
+     groupés en fin de séance, ils formeraient une longue file du même exercice. */
+  function lace(meetings, reviews) {
+    const base = meetings.concat(reviews);
+    const every = Math.max(1, Math.floor(base.length / Math.max(1, meetings.length)));
+    const out = [], waiting = [];
+    let i = 0, since = 0;
+    while (i < base.length || waiting.length) {
+      const ripe = waiting.length && out.length - waiting[0].after > RECALL_GAP;
+      if (waiting.length && (i >= base.length || (ripe && since >= every))) {
+        out.push(waiting.shift().slot); since = 0;
+        continue;
+      }
+      if (i < meetings.length) waiting.push({ after: out.length, slot: { ex: null, task: null, items: base[i].items, recall: true } });
+      out.push(base[i++]); since++;
+    }
+    return out;
+  }
+
+  /* Une séance sur ce qui résiste : les éléments le plus souvent ratés, chacun à
+     l'échelon où il se trouve. Comme le défi, elle ne compte pas dans le budget
+     du jour qu'elle n'a pas à attendre, et ses réponses sont de vraies révisions. */
+  function startMistakes() {
+    const items = NL.srs.mistakes().slice(0, MAX_TASKS).map(x => x.item);
+    const queue = spread(build(items, []), NL.state.meta().lastEx || null);
+    if (!queue.length) { L = null; return false; }
+    L = Object.assign(blankTurn(), {
+      source: 'fouten', queue, at: 0, cap: queue.length + 6,
+      phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
+      newCount: 0, combo: 0, bestCombo: 0, lives: null
     });
     return true;
   }
 
+  /* Le rappel d'une rencontre se construit quand son tour arrive : son exercice
+     dépend de l'échelon que l'élément vient d'atteindre. Raté à la rencontre, il
+     est redemandé au même échelon ; réussi, à l'échelon suivant.
+     Quand plusieurs rappels se suivent, on sert d'abord celui dont l'exercice
+     diffère du précédent — sans jamais rapprocher un rappel de sa rencontre. */
+  function arm() {
+    while (L && L.at < L.queue.length && !L.queue[L.at].task) {
+      const prev = L.at > 0 ? L.queue[L.at - 1].ex : null;
+      const after = L.queue[L.at + 1] && L.queue[L.at + 1].task ? L.queue[L.at + 1].ex : null;
+      const avoid = new Set([prev, after].filter(Boolean));
+      let at = L.at, name = NL.srs.exerciseFor(L.queue[L.at].items[0], avoid);
+      for (let j = L.at + 1; name === prev && j < L.queue.length && !L.queue[j].task; j++) {
+        if (L.at - L.queue[j].metAt < RECALL_GAP) continue;
+        const n = NL.srs.exerciseFor(L.queue[j].items[0], avoid);
+        if (n !== prev) { at = j; name = n; }
+      }
+      const c = L.queue[at];
+      L.queue[at] = L.queue[L.at];
+      L.queue[L.at] = c;
+      try {
+        c.ex = name;
+        c.task = EX.get(name).build(c.items[0]);
+      } catch (e) { L.queue.splice(L.at, 1); }
+    }
+  }
+
+  /* Une faute sur un élément dont le rappel attend plus loin n'ajoute pas de
+     reprise : le rappel EST sa seconde chance. */
+  function again(c) {
+    const waiting = L.queue.slice(L.at + 1).some(x => x.recall && !x.task && x.items[0] === c.items[0]);
+    if (!waiting && L.queue.length < L.cap) L.queue.push(retryOf(c));
+  }
+
   const cur = () => L && L.queue[L.at];
   const active = () => !!(L && !L.finished);
````

Three things in that hunk belong to later tasks. For this task:

- leave out the line `if (source === 'fouten') return startMistakes();` and the whole function `startMistakes` (Task 9);
- in `build()`, keep the original one-line `catch (e) { /* un élément mal formé est simplement sauté */ }` instead of the `NL.errlog.note` version (Task 11).

Then the three places that queued a retry or advanced the queue:
In `src/ui/session.js`:

````diff
@@ -154,5 +230,5 @@ NL.screens.sessie = (function () {
       NL.audio.no();
       if (L.source === 'defi') L.lives--;
-      else if (L.queue.length < MAX_TASKS + 6) L.queue.push(retryOf(c));
+      else again(c);
     }
     NL.ui.render();
@@ -182,4 +258,6 @@ NL.screens.sessie = (function () {
     L.phase = 'ask';
     if (L.at >= L.queue.length || (L.source === 'defi' && L.lives <= 0)) return finish();
+    arm();
+    if (L.at >= L.queue.length) return finish();
     NL.ui.render();
     autoplay();
@@ -154,5 +230,5 @@ NL.screens.sessie = (function () {
       NL.audio.no();
       if (L.source === 'defi') L.lives--;
-      else if (L.queue.length < MAX_TASKS + 6) L.queue.push(retryOf(c));
+      else again(c);
     }
     NL.ui.render();
````

and the label that says an exercise is a second look. Replace:

````js
      (c.retry ? ' · ' + NL.t.again2 : '') +
````

with:

````js
      (c.retry || c.recall ? ' · ' + NL.t.again2 : '') +
````

- [ ] **Step 5: The journey test compared the promise with the delivery to within one; make it exact**

In `test/journey.js`:

````diff
@@ -449,8 +311,9 @@ function view(screen, arg) {
   const plan = NL.srs.plan();
   S.begin('vandaag');
+  const warmup = S.peek() && S.peek().ex === 'match' ? 1 : 0;
   const real = S.peek() ? NL.screens.sessie.render().match(/class="pill">\d+\/(\d+)</) : null;
   const delivered = real ? +real[1] : 0;
-  console.log('   promised ' + plan.total + ', session holds ' + delivered);
-  ok(Math.abs(plan.total - delivered) <= 1, 'home promises ' + plan.total + ' but the session holds ' + delivered);
+  console.log('   promised ' + plan.tasks + ' exercises (' + plan.due + ' to review, ' + plan.fresh + ' new), session holds ' + (delivered - warmup) + (warmup ? ' after its warm-up' : ''));
+  ok(delivered - warmup === plan.tasks, 'home promises ' + plan.tasks + ' exercises but the session holds ' + (delivered - warmup));
   S.abandon();
 
````

- [ ] **Step 6: Run and commit**

Run: `node test/engine.js "$(pwd)" && sh test/run-all.sh`
Expected: `ENGINE OK`, with lines such as `compte neuf  annoncé 0 + 11 (22 exercices) — servi 0 + 11 (22)` and `200 éléments dus : 15 révisions, 7 rencontres`; then the whole suite passes. `test/pace.js` still drives the session the old way and Task 5 rewrites that loop: if one of its figures has moved, do Task 5 next and keep the two commits in order.

````bash
sh build.sh
git add src/core/srs.js src/ui/session.js test/engine.js test/journey.js index.html artifact.html
git commit -m "fix: one composer, room reserved for new items, reinforcement inside the session"
````

---

### Task 4: A cognate skips the meaning drill, and nothing else

The jump skipped three rungs on the first right answer, which also skipped the de/het drill and both dictation drills. That is wrong today, with French glosses: resembling *garage* never said whether the word is *de* or *het*, nor how it sounds. Doing it now also keeps phase 2 out of the scheduler. See ADR 0004.

**Files:**
- Modify: `src/core/srs.js`, `test/engine.js`, `test/smoke.js`

**Interfaces:**
- Produces: for an item with `cognate: true` and no answer yet, `NL.srs.exerciseFor(item)` draws from rung 1; its first right answer puts it on rung 2. Which items are cognates is unchanged here; letting that set follow the display language is phase 2.

- [ ] **Step 1: Write the failing test**

In `test/engine.js`, insert before the block *Ce que la spécification ne dit pas*:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nLES TRANSPARENTS — le sens est offert, rien d’autre');
  {
    fresh();
    const cog = NL.content.allItems().filter(i => i.cognate);
    ok(cog.length > 10, 'the fixture is gone: only ' + cog.length + ' cognates');
    const seen = {};
    cog.forEach(it => { for (let k = 0; k < 12; k++) seen[NL.srs.exerciseFor(it)] = 1; });
    ok(!seen.pick && !seen.recall, 'a never-met cognate is still asked what it means (' + Object.keys(seen).join(', ') + ')');
    ok(seen.dictation, 'a never-met cognate is never asked by ear');
    ok(seen.article, 'a never-met cognate noun is never asked its article');
    const noun = cog.find(i => i.art);
    NL.srs.grade(noun, true, { ex: 'article' });
    ok(NL.srs.stageOf(noun) === 2, 'one right answer puts a cognate on rung ' + NL.srs.stageOf(noun) + ', not 2');
    const next = {};
    for (let k = 0; k < 20; k++) next[NL.srs.exerciseFor(noun)] = 1;
    ok(next.dictation || next.type, 'after its first answer a cognate skips the ear and the pen');
    console.log('  ' + cog.length + ' transparents : première rencontre par ' + Object.keys(seen).join(', ') + ' — puis ' + Object.keys(next).join(', '));
  }
````

- [ ] **Step 2: Run it and watch it fail**

Run: `node test/engine.js "$(pwd)"`
Expected, as measured on the tree Task 3 leaves:

```
LES TRANSPARENTS — le sens est offert, rien d’autre
  FAIL: a never-met cognate is still asked what it means (pick, recall)
  FAIL: a never-met cognate is never asked by ear
  FAIL: a never-met cognate noun is never asked its article
  FAIL: one right answer puts a cognate on rung 3, not 2
```

- [ ] **Step 3: Narrow the jump**

In `src/core/srs.js`:

````diff
@@ -98,5 +109,9 @@ NL.srs = (function () {
   function exerciseFor(item, avoid) {
     const r = recOf(item);
-    const set = (RUNGS[item.kind] || RUNGS.word)[clamp(r.stage, 0, 6)] || ['pick'];
+    /* Un mot transparent n'a pas besoin qu'on lui enseigne son sens : sa
+       première rencontre se fait à l'échelon suivant. Rien d'autre n'est sauté —
+       ressembler à un mot connu ne dit ni son article ni comment il sonne. */
+    const rung = (r.reps === 0 && item.cognate) ? 1 : clamp(r.stage, 0, 6);
+    const set = (RUNGS[item.kind] || RUNGS.word)[rung] || ['pick'];
     let usable = set.filter(n => supports(item, n));
     if (!usable.length) usable = [fallback(item)];
@@ -139,7 +154,8 @@ NL.srs = (function () {
     if (ok) {
       if (opts && opts.spoken) r.said = true;
-      /* Les transparents (de tram, de garage, direct) ne méritent pas douze
-         passages : la première réussite en saute deux. */
-      const jump = (r.reps === 1 && item.cognate) ? 3 : 1;
+      /* Un transparent (de tram, de garage, direct) a été rencontré à l'échelon 1 :
+         sa première réussite le mène donc à l'échelon 2. Un seul échelon sauté,
+         celui du sens. Voir docs/adr/0004. */
+      const jump = (r.reps === 1 && item.cognate) ? 2 : 1;
       r.stage = clamp(r.stage + jump, 0, top);
       r.ease = clamp(r.ease + 0.05, 1.3, 2.9);
````

- [ ] **Step 4: Update the old assertion in `test/smoke.js`**

Replace:

````js
    ok(NL.srs.stageOf(cog) >= 3, 'un mot transparent devrait sauter les premiers échelons');
    console.log('  transparent     « ' + cog.nl + ' » démarre à l’échelon ' + NL.srs.stageOf(cog));
````

with:

````js
    ok(NL.srs.stageOf(cog) === 2, 'a cognate skips one rung, the meaning drill, and no more — it sits on rung ' + NL.srs.stageOf(cog));
    console.log('  transparent     « ' + cog.nl + ' » saute le sens, et rien d’autre : échelon ' + NL.srs.stageOf(cog));
````

- [ ] **Step 5: Run and commit**

Run: `node test/engine.js "$(pwd)" && sh test/run-all.sh`
Expected: `31 transparents : première rencontre par intrus, dictation, article — puis type, dictation`, and the suite passes.

````bash
sh build.sh
git add src/core/srs.js test/engine.js test/smoke.js index.html artifact.html
git commit -m "fix: a cognate skips the meaning drill and nothing else"
````

---

### Task 5: The long-run simulation moves its clock, and fails on a day with nothing new

`test/pace.js` set the clock once per simulated day and held it. A return due in twelve minutes never arrived, so two hundred simulated days looked healthy while real day two served nothing new. It also graded answers by calling the scheduler directly, which skips the session, and the session is where retries and reinforcements live.

**Files:**
- Modify: `test/pace.js`, `test/run-all.sh`, `TESTING.md`

**Interfaces:**
- Consumes: `test/lib/answer.js`; the engine of Tasks 2–4.
- Produces: `node test/pace.js <root> <days> [one]`. The third argument simulates a learner who does one session a day.

- [ ] **Step 1: Rewrite the loop and add the check**

````diff
@@ -79,25 +30,28 @@ NL.state.open().then(() => {
   const S = NL.screens.sessie;
   const total = NL.content.allItems().length;
+  NL.ui.go('sessie');
 
-  const perDay = [], mix = {}, seenOnDay = {};
+  const perDay = [], mix = {}, seenOnDay = {}, dry = [];
   let backToBack = 0, prevEx = null, exhausted = null, maxBacklog = 0, tasks = 0, lateRecog = 0;
 
   for (let day = 1; day <= DAYS; day++) {
-    NOW = Date.parse('2026-01-05T08:00:00Z') + (day - 1) * 86400000;
+    B.clock.set(T0 + (day - 1) * DAY);
     NL.state.touchDay();
     maxBacklog = Math.max(maxBacklog, NL.srs.dueItems().length);
+    const unmetAtDawn = total - NL.srs.counts().seen;
 
-    let dayTasks = 0, daySecs = 0, guard = 0;
-    /* Autant de séances que le budget du jour l'autorise. */
-    while (NL.srs.budgetLeft() > 0 && guard++ < 12 && S.begin('vandaag')) {
+    let dayTasks = 0, daySecs = 0, dayNew = 0, guard = 0;
+    /* Autant de séances que le budget du jour l'autorise — ou une seule. */
+    while (NL.srs.budgetLeft() > 0 && guard++ < (ONE_A_DAY ? 1 : 12) && S.begin('vandaag')) {
       let n = 0;
-      while (n++ < 40) {
-        const c = S.peek(); if (!c) break;
+      while (S.peek() && n++ < 80) {
+        const c = S.peek(), wasMatch = c.ex === 'match';
         tasks++; dayTasks++;
         daySecs += SECS[c.ex] || 15;
         mix[c.ex] = (mix[c.ex] || 0) + 1;
         const wasAt = NL.srs.stageOf(c.items[0]);
+        if (!wasMatch && wasAt < 0) dayNew++;
         if (wasAt >= 1 && (c.ex === 'pick' || c.ex === 'recall' || c.ex === 'match')) lateRecog++;
-        if (c.ex === prevEx && c.ex !== 'match') backToBack++;
+        if (c.ex === prevEx && c.ex !== 'match' && !c.retry) backToBack++;
         prevEx = c.ex;
         c.items.forEach(it => {
````

````diff
@@ -105,36 +59,49 @@ NL.state.open().then(() => {
           seenOnDay[it.id].add(day);
         });
-        const right = RAND() < 0.85;
-        c.items.forEach(it => NL.srs.grade(it, right, { spoken: c.ex === 'speak' && right, ex: c.ex }));
-        NL.srs.spend(1);
-        const before = S.peek();
-        try { S.click({ dataset: {} }, { next: '1' }); } catch (e) { break; }
-        if (S.peek() === before) break;
+        /* L'horloge avance PENDANT la journée, du temps que coûte chaque
+           exercice. Figée à huit heures, un retour prévu dans douze minutes
+           n'arrivait jamais : deux cents jours simulés avaient l'air sains
+           pendant que le deuxième jour réel ne servait rien de neuf. */
+        B.clock.advance((SECS[c.ex] || 15) * 1000);
+        /* Et la réponse passe par l'écran, pas par le planificateur : c'est la
+           séance qui porte les reprises et le rappel des rencontres. */
+        if (wasMatch || RAND() < 0.85) answer.right(); else answer.wrong();
+        answer.next(wasMatch);
+        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
       }
       S.abandon();
+      B.clock.advance(10 * MIN);          // une pause entre deux séances
     }
+    if (unmetAtDawn > 0 && dayNew === 0) dry.push(day);
+    const spent = NL.state.meta().exToday || 0;
     const met = NL.srs.counts().seen;
     if (!exhausted && met >= total) exhausted = day;
-    perDay.push({ day, tasks: dayTasks, mins: Math.round(daySecs / 60), met,
-      mastered: NL.content.courseProgress().mastered });
+    perDay.push({ day, tasks: dayTasks, spent, mins: Math.round(daySecs / 60), met,
+      produce: NL.content.courseProgress().produce });
   }
 
   const cap = NL.srs.pace().cap;
-  const over = perDay.filter(d => d.tasks > cap + 2);
+  /* Une séance commencée avec du budget se termine : ses reprises (six au plus)
+     et son échauffement par paires peuvent déborder le plafond, jamais plus. */
+  const over = perDay.filter(d => d.spent > cap + 7);
   const peak = Math.max(...perDay.map(d => d.mins));
-  const busiest = Math.max(...perDay.map(d => d.tasks));
+  const busiest = Math.max(...perDay.map(d => d.spent));
 
   console.log('\nCHARGE SUR ' + DAYS + ' JOURS   (rythme ' + (NL.state.meta().pace || 'normal') +
     ', plafond ' + cap + ' exercices)');
   console.log('='.repeat(70));
-  console.log('  jour   exercices   minutes   rencontrés   maîtrisés');
+  console.log('  jour   exercices   minutes   rencontrés   produits');
   [1, 7, 30, 90, 180, 300, DAYS].filter(d => d <= DAYS).forEach(d => {
     const r = perDay[d - 1];
     console.log('  ' + String(r.day).padStart(4) + String(r.tasks).padStart(12) +
-      String(r.mins).padStart(10) + String(r.met).padStart(13) + String(r.mastered).padStart(12));
+      String(r.mins).padStart(10) + String(r.met).padStart(13) + String(r.produce).padStart(11));
   });
 
   console.log('\nCE QUE LA SIMULATION VÉRIFIE');
   console.log('='.repeat(70));
+  /* Le défaut que tout ce travail répare : une journée sans rien de neuf alors
+     qu'il reste du cours à rencontrer. */
+  ok(dry.length === 0, dry.length + ' jour(s) sans aucun élément nouveau alors qu’il en restait à rencontrer — le premier : jour ' + dry[0]);
+  P('jours sans rien de neuf', dry.length === 0 ? 'aucun' : dry.length + ' (jours ' + dry.slice(0, 8).join(', ') + '…)');
   ok(over.length === 0, over.length + ' jours dépassent le plafond quotidien — la dette explose');
   P('plafond quotidien respecté', over.length === 0 ? 'oui, ' + busiest + ' au maximum' : 'NON');
````

````diff
@@ -180,7 +147,7 @@ NL.state.open().then(() => {
   P('éléments au catalogue', total);
   P('tout rencontré le jour', exhausted || 'pas encore');
-  P('maîtrisé au jour ' + DAYS, perDay[DAYS - 1].mastered + ' / ' + total);
+  P('produits au jour ' + DAYS, perDay[DAYS - 1].produce + ' / ' + total);
   if (exhausted && exhausted < 200) {
-    console.log('  → le contenu s’épuise : c’est la phase 2 qui le règle, pas le moteur.');
+    console.log('  → le contenu s’épuise : c’est la phase 4 qui le règle, pas le moteur.');
   }
 
````

`NL.content.courseProgress().produce` arrives in Task 7. Until then keep `.mastered` in the three lines of this file that read it; Task 7 switches them.

The last hunk also corrects a message that named the wrong phase: it printed that phase 2 fixes the content running out, and in issue #12 that is phase 4.

- [ ] **Step 2: Prove the new check fails on the old engine**

The check was written after the fix, so it has to be shown failing some other way. Run this task's `pace.js` against the commit before Task 2:

````bash
BASE=$(git log --format=%H --grep="one fake browser for every suite" -1)
git worktree add ../vlaams-before "$BASE"
cp test/pace.js ../vlaams-before/test/pace.js
sed -i "s/courseProgress().produce/courseProgress().mastered/" ../vlaams-before/test/pace.js
(cd ../vlaams-before && sh build.sh > /dev/null && node test/pace.js "$(pwd)" 60)
git worktree remove --force ../vlaams-before
````

Expected, as measured while writing this plan: `✗ 12 jour(s) sans aucun élément nouveau alors qu’il en restait à rencontrer — le premier : jour 2`, and exit code 1. If it passes there, the check is not testing what it claims: stop and find out why.

- [ ] **Step 3: Run both learners**

Run: `node test/pace.js "$(pwd)" 200 && node test/pace.js "$(pwd)" 200 one`
Expected: both end `6 vérifications, AUCUN PROBLÈME`, with `jours sans rien de neuf  aucun`. The eager learner meets everything around day 15 and the daily cap holds at about 126 exercises; the one-session learner meets everything around day 61.

- [ ] **Step 4: List the second learner**

In `test/run-all.sh`, replace the `pace.js` line with:

````sh
# Deux apprenants : celui qui épuise le budget du jour, et celui qui ne fait
# qu'une séance. Le défaut d'octobre ne se voyait que chez le second.
node test/pace.js "$ROOT" "${PACE_DAYS:-200}"
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one
````

In `TESTING.md`, in the table, replace the `pace.js` row with:

````md
| `pace.js` | 200 jours simulés, pour deux apprenants (budget épuisé chaque jour ; une seule séance par jour) : charge quotidienne, variété, exigence — et aucune journée sans élément nouveau tant qu’il en reste. L’horloge avance pendant la journée |
````

- [ ] **Step 5: Commit**

````bash
git add test/pace.js test/run-all.sh TESTING.md
git commit -m "test: the long-run simulation moves its clock and fails on a day with nothing new"
````

---

### Task 5b: An item is said aloud from rung 3, and its first spoken answer costs no rung

Added on 12 October 2026, when the open question at the end of this plan was settled. Until this task a session first asks for an item aloud once the item stands on rung 5, after that rung's 21-day wait: day 35 for a learner who takes every session, day 48 to 51 for one who takes one session a day. Three changes to one file bring it into the second week.

Rung 3 offers `speak` for words, phrases and chunks, beside its writing exercises. That alone is not enough: the engine draws one exercise among those a rung offers, so the spoken one would come up for about half the items and the others would still wait for rung 5. So an item that has never been said aloud gets `speak` whenever its rung offers it. `said` is a field every stored record already has; nothing new is stored. For a grammar rule the same rule acts one rung higher, where `speak` already was beside `open`.

And a wrong spoken answer on an item never yet said costs no rung. The spoken exercise shows the Dutch on the screen, so failing it says something about pronunciation or about the recogniser and nothing about memory. Dropping two rungs would send the item back to be recognised again, which is the wrong remedy. The item keeps its rung, is asked again before the session ends like any wrong answer, and is due the next day. Once an item has been said, a wrong spoken answer drops two rungs like any other.

Measured with one session a day and 85 answers right in 100, on the end state of this plan: an item met on day 1 is first asked aloud between day 7 and day 13, and the learner can produce 233 items at day 60, against 201 on the ladder Task 4 leaves. The answer that costs no rung is what keeps that count from depending on the recogniser: with spoken answers right only 60 times in 100 it reads 212 with the rule and 160 without.

**Files:**
- Modify: `src/core/srs.js`, `test/engine.js`, `test/pace.js`, `TESTING.md`

**Interfaces:**
- Consumes: the engine of Tasks 2–4; the simulation of Task 5.
- Produces: `RUNGS.word[3]`, `RUNGS.phrase[3]` and `RUNGS.chunk[3]` include `'speak'`. For an item whose record has `said: false`, `NL.srs.exerciseFor(item)` returns `'speak'` whenever its rung offers it. `NL.srs.grade(item, false, { ex: 'speak' })` on such an item keeps `stage` and `ease` and schedules it one day out. Task 9b builds on both.
- Produces: `test/pace.js` prints `première demande à voix haute` and makes two more checks, eight in all.

From this task on a session holds spoken exercises from the first week. Every suite answers them through `test/lib/answer.js`, which has known how since Task 1.

- [ ] **Step 1: Write the failing tests**

In `test/engine.js`, insert before the final `console.log`:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nÀ VOIX HAUTE — dès le troisième échelon, et la première fois ne coûte rien');
  {
    fresh();
    const words = NL.content.allItems().filter(isWord);
    const it = words.find(i => !i.cognate);
    const draw = n => { const seen = {}; for (let k = 0; k < n; k++) seen[NL.srs.exerciseFor(it)] = 1; return Object.keys(seen); };

    /* Jamais dit : dès que l'échelon le propose, c'est ce qui est demandé. */
    const mute = words.filter(w => { put(w, 3, T0); return NL.srs.exerciseFor(w) !== 'speak'; });
    ok(mute.length === 0, mute.length + ' of ' + words.length + ' never-said items on rung 3 are not asked aloud, e.g. « ' + (mute[0] && mute[0].nl) + ' »');
    put(it, 2, T0);
    ok(draw(30).indexOf('speak') < 0, 'an item is asked aloud on rung 2, before its rung offers it');

    /* Raté sans avoir jamais été dit : l'échelon est gardé, et il revient demain, à voix haute. */
    put(it, 3, T0);
    let r = NL.srs.grade(it, false, { ex: 'speak' });
    ok(r.stage === 3, 'a wrong first spoken answer sends the item from rung 3 to rung ' + r.stage);
    ok(r.due - B.clock.now() === DAY, 'after a wrong first spoken answer the item is due in ' + Math.round((r.due - B.clock.now()) / DAY * 10) / 10 + ' day(s), not 1');
    ok(draw(20).join() === 'speak', 'after a wrong first spoken answer the item is asked: ' + draw(20).join(', '));
    /* Une faute à l'écrit, elle, coûte toujours deux échelons. */
    put(it, 3, T0);
    ok(NL.srs.grade(it, false, { ex: 'type' }).stage === 1, 'a wrong written answer on rung 3 no longer drops two rungs');

    /* Dit : il monte. Ensuite l'échelon tire au sort comme avant, et une faute à
       voix haute coûte comme une autre. */
    put(it, 3, T0);
    r = NL.srs.grade(it, true, { ex: 'speak', spoken: true });
    ok(r.stage === 4 && r.said === true, 'a right spoken answer should leave the item said and on rung 4: it is on rung ' + r.stage + ', said ' + r.said);
    r.stage = 3; r.lastEx = null; NL.state.setRec(r);
    const after = draw(60);
    ok(after.length > 1 && after.indexOf('speak') >= 0, 'once said, rung 3 offers only: ' + after.join(', '));
    ok(NL.srs.grade(it, false, { ex: 'speak' }).stage === 1, 'once said, a wrong spoken answer no longer drops two rungs');
    console.log('  ' + words.length + ' mots et phrases dits dès l’échelon 3 ; raté la première fois : échelon gardé, retour le lendemain ; une fois dit : ' + after.sort().join(', '));
  }
````

In `test/pace.js`, replace:

````js
  const perDay = [], mix = {}, seenOnDay = {}, dry = [];
````

with:

````js
  const perDay = [], mix = {}, seenOnDay = {}, dry = [], aloud = {};
````

In `test/pace.js`, replace:

````js
        prevEx = c.ex;
````

with:

````js
        prevEx = c.ex;
        /* Le jour où chaque élément est demandé à voix haute pour la première fois. */
        if (c.ex === 'speak' && !aloud[c.items[0].id]) aloud[c.items[0].id] = day;
````

In `test/pace.js`, insert before the line that begins `ok(over.length === 0, `:

````js
  /* Dire tôt : un mot ou une phrase rencontré le premier jour est demandé à voix
     haute en une dizaine de jours, et jamais après trois semaines. Avec « dis-le »
     au seul échelon 5, c'était cinq semaines. */
  const firstDay = Object.keys(seenOnDay).filter(id => seenOnDay[id].has(1) && NL.content.byId(id).kind !== 'pattern');
  const waits = firstDay.map(id => aloud[id] || Infinity).sort((a, b) => a - b);
  const typical = waits[Math.floor(waits.length / 2)], latest = waits[waits.length - 1];
  ok(typical <= 10, 'un élément du premier jour est typiquement demandé à voix haute le jour ' + typical + ' : plus de dix jours');
  ok(latest <= 21, 'un élément du premier jour attend le jour ' + latest + ' pour être demandé à voix haute : plus de trois semaines');
  P('première demande à voix haute', 'jours ' + waits[0] + ' à ' + latest + ', pour les ' + waits.length + ' éléments du premier jour');
````

- [ ] **Step 2: Run them and watch them fail**

Run: `node test/engine.js "$(pwd)"; node test/pace.js "$(pwd)" 200; node test/pace.js "$(pwd)" 200 one`

Expected from `test/engine.js`:

```
À VOIX HAUTE — dès le troisième échelon, et la première fois ne coûte rien
  FAIL: 430 of 430 never-said items on rung 3 are not asked aloud, e.g. « hallo »
  FAIL: a wrong first spoken answer sends the item from rung 3 to rung 1
  FAIL: after a wrong first spoken answer the item is asked: dictation
  FAIL: once said, rung 3 offers only: type

81 checks, 4 FAILED
```

Expected from the simulation, for the learner who takes every session:

```
   ✗ un élément du premier jour est typiquement demandé à voix haute le jour 38 : plus de dix jours
   ✗ un élément du premier jour attend le jour 74 pour être demandé à voix haute : plus de trois semaines
8 vérifications, 2 PROBLÈME(S)
```

and for one session a day the same two lines with day 50 and day 83.

These were measured on the end state of the other eleven tasks, with this task's tests added and its change to `src/core/srs.js` left out. The tree Task 5 leaves has the same `test/engine.js` and the same functions in `src/core/srs.js`, so the lines should be the same there; the full run of step 3b checks it. The exercise named in the third line is a draw: `type` in its place means the same thing.

- [ ] **Step 3: Offer the spoken exercise on rung 3, make the first one certain, and make it cost nothing**

In `src/core/srs.js`, replace:

````js
     (la dictée) arrive dès le deuxième barreau au lieu d'attendre le troisième. */
  const RUNGS = {
````

with:

````js
     (la dictée) arrive dès le deuxième barreau au lieu d'attendre le troisième. */
  /* « Dis-le » dès l'échelon 3 pour les mots, les phrases et les expressions :
     au seul échelon 5, la première demande à voix haute tombait cinq semaines
     après la rencontre. Voir exerciseFor() pour qui y a droit d'office. */
  const RUNGS = {
````

In `src/core/srs.js`, replace:

````js
      ['dictation', 'type'],
      ['type', 'cloze'],
````

with:

````js
      ['dictation', 'type'],
      ['type', 'cloze', 'speak'],
````

In `src/core/srs.js`, replace:

````js
      ['dictation', 'corrige'],
````

with:

````js
      ['dictation', 'corrige', 'speak'],
````

In `src/core/srs.js`, replace:

````js
      ['cloze'],
      ['type', 'dictation'],
````

with:

````js
      ['cloze'],
      ['type', 'dictation', 'speak'],
````

In `src/core/srs.js`, replace:

````js
    if (!usable.length) usable = [fallback(item)];
````

with:

````js
    if (!usable.length) usable = [fallback(item)];
    /* Un élément jamais dit à voix haute l'est dès que son échelon le propose.
       Tiré au sort parmi les exercices de l'échelon, « dis-le » ne tombait qu'une
       fois sur deux ou trois, et le reste attendait l'échelon 5. */
    if (!r.said && usable.indexOf('speak') >= 0) return 'speak';
````

In `src/core/srs.js`, replace:

````js
      r.stage = clamp(r.stage - 2, r.reps > 1 ? 1 : 0, top);
      r.ease = clamp(r.ease - 0.2, 1.3, 2.9);
      r.interval = STEP[Math.min(r.stage, STEP.length - 1)];
      r.retired = false;
````

with:

````js
      /* Un exercice parlé raté tant que l'élément n'a jamais été dit ne coûte
         aucun échelon. La phrase est à l'écran : ce n'est pas un oubli, c'est la
         prononciation ou le micro, et redescendre de deux échelons renverrait
         l'élément se faire reconnaître. Il garde sa place et revient demain. */
      const unsaid = !r.said && !!opts && opts.ex === 'speak';
      if (!unsaid) {
        r.stage = clamp(r.stage - 2, r.reps > 1 ? 1 : 0, top);
        r.ease = clamp(r.ease - 0.2, 1.3, 2.9);
      }
      r.interval = unsaid ? STEP[0] : STEP[Math.min(r.stage, STEP.length - 1)];
      r.retired = false;
````

- [ ] **Step 4: Say what the simulation now holds**

In `TESTING.md`, in the table, replace the `pace.js` row with:

````md
| `pace.js` | 200 jours simulés, pour deux apprenants (budget épuisé chaque jour ; une seule séance par jour) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste, et un élément du premier jour demandé à voix haute en dix jours, jamais après trois semaines. L’horloge avance pendant la journée |
````

- [ ] **Step 5: Run and commit**

Run: `node test/engine.js "$(pwd)" && sh test/run-all.sh`

Expected: `430 mots et phrases dits dès l’échelon 3 ; raté la première fois : échelon gardé, retour le lendemain ; une fois dit : speak, type`. In the simulation, `première demande à voix haute  jours 5 à 11, pour les 56 éléments du premier jour` for the learner who takes every session and `jours 7 à 13, pour les 11 éléments du premier jour` for one session a day, each ending `8 vérifications, AUCUN PROBLÈME`. Then the suite passes.

````bash
sh build.sh
git add src/core/srs.js test/engine.js test/pace.js TESTING.md index.html artifact.html
git commit -m "feat: an item is said aloud from rung 3, and its first spoken answer costs no rung"
````

---

### Task 6: The placement test is removed

Not as a defect: on the learner's own data its credits were not due until after the stall and played no part in it. It is removed because it caused more confusion than it saved time.

**Files:**
- Delete: `src/ui/placement.js`
- Modify: `build.sh`, `src/app.js`, `src/ui/shell.js`, `src/ui/home.js`, `src/core/fr.js`, `src/core/srs.js`, `test/sim.js`, `test/journey.js`, `test/firstrun.js`, `README.md`

**Interfaces:**
- Removes: `NL.screens.placement`, the route `placement`, and every `NL.t` key starting with `place` or `first`.
- Keeps: the `placed` field in the stored settings and in `mergeMeta`, and `NL.srs.seed()`. `placed` is a field inside a stored record; the tests use `seed`.

- [ ] **Step 1: Make the tests say so**

In `test/firstrun.js`:

````diff
@@ -65,8 +21,8 @@ NL.state.open().then(() => {
   NL.ui.go('vandaag');
   const home = app.innerHTML;
-  ok(home.includes('test de niveau') || home.includes('Test de niveau'), 'no placement offer on a blank account');
+  ok(!/test de niveau/i.test(home) && home.indexOf('placement') < 0, 'a blank account is still offered the placement test');
   ok(home.includes('Démarrer la session'), 'no session button on a blank account');
   ok(!/[^a-z]the [a-z]/.test(home), 'English leaked onto the home screen');
-  console.log('  home screen     ' + home.length + ' chars, placement offered, session offered');
+  console.log('  home screen     ' + home.length + ' chars, session offered');
   console.log('  voice report    ' + NL.speech.voiceInfo().note.slice(0, 60) + '…');
   console.log('  mic verdict     listenBlocked=' + NL.speech.listenBlocked() + ', tier=' + NL.speech.tier().id);
````

In `test/sim.js`:

````diff
@@ -70,17 +38,4 @@ NL.state.open().then(() => {
   NL.ui.closeSheet();
 
-  console.log('\nPLACEMENT');
-  try {
-    NL.ui.go('placement');
-    let guard = 0;
-    while (app.innerHTML.indexOf('done-stage') < 0 && guard++ < 40) {
-      NL.screens.placement.click({ dataset: {} }, { opt: '0' });
-      NL.screens.placement.click({ dataset: {} }, { act: 'dunno' });   // the typed question has no options
-      NL.screens.placement.click({ dataset: {} }, { act: 'next' });
-    }
-    console.log('  ran ' + guard + ' questions, summary rendered: ' + (app.innerHTML.indexOf('done-stage') >= 0));
-    if (guard >= 40) fail('placement never finished');
-  } catch (e) { fail('placement threw: ' + e.message); }
-
   console.log('\nSESSION');
   try {
````

In `test/journey.js`:

````diff
@@ -183,53 +84,13 @@ function view(screen, arg) {
   head('2. Every screen renders');
   ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek',
-   'register', 'klanken', 'dehet', 'doctor'].forEach(s => view(s));
+   'register', 'klanken', 'dehet', 'doctor', 'fouten'].forEach(s => view(s));
   NL.content.sheets.forEach(sh => view('spiek', sh.id));
-  console.log('   ' + (11 + NL.content.sheets.length) + ' screens drawn');
+  console.log('   ' + (12 + NL.content.sheets.length) + ' screens drawn');
 
-  /* ---------------------------------------------------------- 3. placement */
-  head('3. Placement test, answered honestly');
-  const P = NL.screens.placement;
-  view('placement');
-  let guard = 0, dupOpts = 0;
-  while (guard++ < 40) {
-    const html = P.render();
-    if (html.indexOf('done-stage') >= 0) break;
-    /* Deux options identiques, dont une comptée fausse, feraient échouer une unité à tort. */
-    const labels = (html.match(/<span class="opt-key">\d<\/span><span>([^<]*)<\/span>/g) || []).map(s => U.norm(s.replace(/<[^>]+>/g, '').slice(1)));
-    if (new Set(labels).size !== labels.length) dupOpts++;
-    tap('placement', { opt: '0' });          // whatever is first, like a real guess
-    if (html.indexOf('id="place-in"') >= 0) tap('placement', { act: 'dunno' });
-    tap('placement', { act: 'next' });
-  }
-  ok(P.render().indexOf('done-stage') >= 0, 'placement never finished');
-  ok(dupOpts === 0, 'placement showed the same option twice in ' + dupOpts + ' question(s)');
-  console.log('   finished in ' + guard + ' questions, seeded ' + NL.srs.counts().seen + ' items');
-  ok(NL.state.meta().placed === true, 'placement did not mark itself done');
-
-  /* Répondu juste, y compris la question à taper : toutes les unités passent.
-     Et une question à taper ratée coûte bien un point. */
-  {
-    NL.state.clearAll(); NL.content.refresh(); P.reset();
-    NL.ui.go('placement');
-    let g = 0, typedSeen = 0, missTyped = true;
-    while (g++ < 80) {
-      const html = P.render();
-      if (html.indexOf('done-stage') >= 0) break;
-      const q = P.peek();
-      if (q.typed) {
-        typedSeen++;
-        ok(html.indexOf('data-opt=') < 0, 'the typed placement question still shows options');
-        /* Unité 1 : on rate exprès la question tapée, les trois autres justes. */
-        const want = missTyped ? 'zzzz' : U.bare(q.item.nl);
-        P.input({ id: 'place-in', value: want });
-        tap('placement', { act: 'submit' });
-        if (missTyped) { ok(P.peek().hits === 3, 'a wrong typed answer still counted'); missTyped = false; }
-      } else tap('placement', { opt: String(q.opts.findIndex(o => o.ok)) });
-      tap('placement', { act: 'next' });
-    }
-    ok(typedSeen >= NL.content.units.length, 'not every unit asked a typed question (' + typedSeen + ')');
-    ok(P.render().indexOf('Les 12 unités sont passées') >= 0, 'answering everything right did not pass all twelve units');
-    console.log('   answered right: ' + typedSeen + ' typed questions, all units passed');
-  }
+  /* ---------------------------------------------------------- 3. no placement */
+  head('3. No placement test');
+  ok(!NL.screens.placement, 'the placement screen still exists');
+  ok(view('vandaag').indexOf('placement') < 0 && view('meer').indexOf('placement') < 0, 'a screen still leads to the placement test');
+  console.log('   nothing asks the learner to prove what they know before starting');
 
   /* ---------------------------------------------------------- 4. every exercise */
````

That last hunk also adds `'fouten'` to the list of screens and changes 11 to 12 in the count. **Leave both as they were** until Task 9 creates that screen.

- [ ] **Step 2: Run them and watch them fail**

Run: `node test/firstrun.js "$(pwd)"; node test/journey.js "$(pwd)" nl-BE EDG | grep "✗"`
Expected: `FAIL: a blank account is still offered the placement test`, and `✗ the placement screen still exists`.

- [ ] **Step 3: Delete the screen and everything that leads to it**

````bash
git rm src/ui/placement.js
````

In `build.sh`, delete the line `src/ui/placement.js` from `SRC`.

In `src/app.js`, replace:

````js
        if (r === 'sessie' || r === 'scenario' || r === 'placement') return;
````

with:

````js
        if (r === 'sessie' || r === 'scenario') return;
````

In `src/ui/shell.js`, replace:

````js
  const FULLSCREEN = { sessie: 1, scenario: 1, placement: 1, doctor: 1, compte: 1 };
````

with:

````js
  const FULLSCREEN = { sessie: 1, scenario: 1, doctor: 1, compte: 1 };
````

In `src/ui/home.js`, delete the first-run card:

````js
      if (!m.placed && c.seen === 0) {
        html += '<section class="card lead">' +
          '<h1>' + t.firstTitle + '</h1>' +
          '<p>' + t.firstBody + '</p>' +
          '<div class="lead-actions">' +
          '<button class="btn btn-primary" data-go="placement">' + t.firstDoTest + '</button>' +
          '<button class="btn btn-ghost" data-act="skip-place">' + t.firstSkip + '</button>' +
          '</div></section>';
      }


````

In `src/ui/home.js`, replace:

````js
      if (d.act === 'skip-place') { NL.state.setMeta({ placed: true }); NL.ui.render(); return; }
````

with nothing (delete it).

In `src/ui/home.js`, replace:

````js
        tile('\u{1F4CF}', 'Test de niveau', m.placed ? 'Le refaire' : 'Pas encore fait', 'go', 'placement') +
````

with nothing (delete it).

In `src/core/fr.js`, replace:

````js
  /* --- accueil, premier lancement --- */
  firstTitle: 'Ce que tu entends déjà compte.',
  firstBody: 'Tu entends du néerlandais depuis des années. Commencer à « de man eet brood » gaspillerait des semaines. Un test de cinq minutes te place là où tu es vraiment.',
  firstDoTest: 'Faire le test de niveau',
  firstSkip: 'Commencer de zéro',

````

with nothing (delete it).

In `src/core/fr.js`, replace:

````js
  /* --- test de niveau --- */
  placeEyebrow: 'Test de niveau · aucune pénalité',
  placeQ: 'Qu’est-ce que ça veut dire ?',
  placeHigh: 'Tu comprends déjà bien plus que tu ne crois.',
  placeMid: 'Il y a déjà une base, surtout passive.',
  placeLow: 'On commence au début — et c’est très bien.',
  placeSeeded: n => n === 0
    ? 'Tout ce que ces unités contiennent était déjà en cours d’apprentissage : le test ne change rien à ta progression.'
    : 'Reconnaître un mot n’est pas savoir le dire, donc rien n’a été marqué comme acquis : ' + n + ' éléments ont simplement été placés plus haut dans l’échelle, en sautant les présentations dont tu n’as clairement pas besoin. Ils doivent encore atteindre l’étape orale.',
  placeNone: 'Rien n’a été avancé, donc tu pars propre. C’est le point de départ honnête.',
  placeRecognised: 'Reconnus', placeAdvanced: 'Avancés',
  placeUnits: 'Unités', placeAsked: 'Questions',
  placeRule: (a, b) => a + ' bonnes réponses sur ' + b + ', dont une à écrire, pour créditer l’unité et passer à la suivante.',
  placeTypeQ: 'Écris-le en néerlandais',
  placeSubmit: 'Valider',
  placeStops: n => 'Le test s’arrête à « ' + n + ' » : c’est de là que tu pars.',
  placeAll: n => 'Les ' + n + ' unités sont passées : tout le niveau A1 est avancé. Il reste à faire monter chaque élément jusqu’à l’oral.',
  placeFirst: 'Commence ta première session',
  placeLater: 'Plus tard',

````

with nothing (delete it).

In `src/core/srs.js`:

````diff
@@ -168,5 +184,5 @@ NL.srs = (function () {
   }
 
-  /* Place un élément directement sur un échelon — test de placement, mots transparents. */
+  /* Place un élément directement sur un échelon : c'est ainsi que les tests posent un état. */
   function seed(item, stage) {
     const r = blank(item.id, item.kind);
````

- [ ] **Step 4: Bring `README.md` up to date**

Four places mention the test. In the table of screens, the **Plus** row ends "le docteur audio, le test de niveau.": end it at "le docteur audio." In the file tree, remove `placement` from the `src/ui/` line. In the closing paragraph that lists what the engine does, remove "test de placement en échelle (4 questions dont une à taper, 3 bonnes, arrêt à la première échouée)" and the clause around it. Leave the rung table for Task 7.

- [ ] **Step 5: Run and commit**

Run: `sh test/run-all.sh`
Expected: passes. `grep -c placement index.html` prints `0`.

````bash
sh build.sh
git add -A src build.sh test README.md index.html artifact.html
git commit -m "feat: remove the placement test"
````

---

### Task 7: Counts replace every percentage; the session names its unit; the rung markers go

Two counts and no third: items **met**, and items the learner can **produce**. An item counts as produced once it has passed the writing rung, that is `stage >= 4`, capped by its tier. No screen shows a percentage, including the pronunciation score and the session summary, and the word *maîtrisé* disappears.

**Files:**
- Create: `test/screens.js`
- Modify: `src/core/srs.js`, `src/content/index.js`, `src/ui/home.js`, `src/ui/session.js`, `src/ui/library.js`, `src/ui/listen.js`, `src/ui/scenario.js`, `src/ex/index.js`, `src/core/fr.js`, `test/smoke.js`, `test/journey.js`, `test/pace.js`, `test/run-all.sh`, `README.md`

**Interfaces:**
- Consumes: `NL.srs.plan().units` (Task 3), `unitProgress().toOpen` (Task 2).
- Produces: `NL.srs.PRODUCE = 4`, replacing `GRADUATED`. `NL.content.unitProgress(uid)` → `{ met, produce, total, toOpen }`; `NL.content.courseProgress()` → `{ met, produce, total, current }`. The fields `pct`, `ready`, `mastered`, `gate`, `level`, `unitsDone` are gone. `NL.ex.wordScore(parts)` → "4 mots sur 5".

- [ ] **Step 1: Write the failing test**

Create `test/screens.js`:

````js
/* Chaque écran, rendu dans plusieurs états, puis relu comme le lirait la
   personne : le texte, sans les balises. C'est ici que se voient un compte qui
   se lit mal, une chaîne manquante, un chiffre qui ne veut rien dire — et tout
   ce qui est resté d'un écran supprimé. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-05T08:00:00Z');
const DAY = 86400000;

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({
  root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.EDG, byId: 'stub', media: true,
  voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }]
});
const NL = B.NL, S = NL.screens.sessie, t = NL.t;
const answer = require('./lib/answer')(B);

const text = html => String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const put = (it, stage, due) => { NL.srs.seed(it, stage); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
const fresh = () => { NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };
const SCREENS = ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor'];

/* Ce qu'aucun écran ne doit montrer, quel que soit l'état. */
function read(name, html, state) {
  const txt = text(html), where = name + ' (' + state + ')';
  ok(txt.length > 60, where + ' rendered almost nothing');
  ok(!/undefined|NaN|\[object/.test(txt), where + ' printed a hole: ' + (txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [''])[0]);
  ok(!/\d\s?%/.test(txt), where + ' shows a percentage: « ' + (txt.match(/.{0,40}\d\s?%.{0,15}/) || [''])[0] + ' »');
  ok(!/ma[iî]tris/i.test(txt), where + ' still speaks of mastery: « ' + (txt.match(/.{0,30}ma[iî]tris.{0,20}/i) || [''])[0] + ' »');
  ok(!/test de niveau/i.test(txt) && html.indexOf('placement') < 0, where + ' still offers the placement test');
  return txt;
}
const sweep = state => SCREENS.forEach(name => {
  try { read(name, NL.screens[name].render(), state); }
  catch (e) { ok(false, name + ' (' + state + ') threw: ' + e.message); }
});

NL.state.open().then(() => {
  NL.content.refresh();
  const units = NL.content.units, all = NL.content.allItems();

  /* ------------------------------------------------------------------ */
  console.log('CHAQUE ÉCRAN, TROIS ÉTATS');
  fresh(); sweep('compte neuf');
  /* À mi-parcours : trois unités entamées, tous les échelons, une part due. */
  fresh();
  all.filter(it => units.indexOf(NL.content.unit(it.unit)) < 3)
    .forEach((it, i) => put(it, i % 7, i % 3 === 0 ? T0 - DAY : T0 + 5 * DAY));
  sweep('mi-parcours');
  /* Tout rencontré, tout produit. */
  fresh(); all.forEach(it => put(it, 6, T0 + 30 * DAY)); sweep('cours fini');
  /* Budget du jour épuisé : l'accueil n'a plus de séance à annoncer. */
  fresh(); NL.srs.spend(NL.srs.pace().cap); sweep('budget épuisé');
  NL.content.sheets.forEach(sh => read('spiek/' + sh.id, NL.screens.spiek.render(sh.id), 'fiche'));
  ['instellingen', 'reset-confirm'].forEach(s => { NL.ui.go('vandaag'); NL.ui.openSheet(s); read('panneau ' + s, B.app.innerHTML, 'ouvert'); });
  NL.ui.closeSheet();
  ok(!NL.screens.placement, 'the placement screen still exists');
  console.log('  ' + SCREENS.length + ' écrans × 4 états, ' + NL.content.sheets.length + ' fiches, 2 panneaux : ni pourcentage, ni maîtrise, ni test de niveau');
  /* ------------------------------------------------------------------ */
  console.log('\nDES COMPTES, ET LE NOM DE L’UNITÉ');
  {
    fresh();
    const home = text(NL.screens.vandaag.render());
    ok(home.indexOf(t.unitOne(1)) >= 0, 'on a blank account the session card does not name unit 1: « ' + home.slice(0, 90) + ' »');
    ok(home.indexOf(units[0].name) >= 0, 'the session card gives the unit number without its name');

    /* Une séance à cheval sur deux unités les nomme toutes les deux. */
    const u1 = NL.content.itemsOf(units[0].id);
    u1.slice(0, u1.length - 3).forEach(it => put(it, 2, T0 + 5 * DAY));
    const span = NL.srs.plan().units;
    ok(span && span.from === 1 && span.to === 2, 'the fixture is wrong: the plan should span units 1–2, spans ' + JSON.stringify(span));
    const two = text(NL.screens.vandaag.render());
    ok(two.indexOf(t.unitsRange(1, 2)) >= 0, 'a session spanning two units names only one: « ' + two.slice(0, 90) + ' »');

    /* Le parcours : des comptes, et un compte à rebours vers l'unité suivante. */
    fresh();
    const n = NL.content.itemsOf(units[0].id).length, need = Math.ceil(n * 0.75);
    NL.content.itemsOf(units[0].id).slice(0, need - 4).forEach(it => put(it, 4, T0 + 5 * DAY));
    const path = text(NL.screens.leerpad.render());
    ok(path.indexOf(t.unitGate(4)) >= 0, 'the unit card does not count down the 4 items left before the next unit');
    ok(path.indexOf(t.unitCounts(need - 4, need - 4, n)) >= 0, 'the unit card does not report ' + (need - 4) + ' met and produced out of ' + n);
    ok(path.indexOf(t.courseCounts(need - 4, need - 4, all.length)) >= 0, 'the course header does not report its two counts');
    put(NL.content.itemsOf(units[0].id)[need - 4], 0, T0 + DAY);
    ok(text(NL.screens.leerpad.render()).indexOf(t.unitGate(3)) >= 0, 'meeting one more item did not move the countdown');
    console.log('  accueil : « ' + t.unitsRange(1, 2) + ' » ; parcours : « ' + t.unitGate(3) + ' »');
  }
  /* ------------------------------------------------------------------ */
  console.log('\nLA SÉANCE — plus de rangée de repères, et un score qui se compte');
  {
    fresh();
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    let guard = 0, pips = 0, asked = 0;
    while (S.peek() && guard++ < 80) {
      const wasMatch = S.peek().ex === 'match';
      const html = B.app.innerHTML;
      asked++;
      if (html.indexOf('class="pips"') >= 0) pips++;
      read('sessie/' + S.peek().ex, html, 'question');
      answer.right();
      if (!wasMatch) read('sessie/verdict', B.app.innerHTML, 'réponse');
      answer.next(wasMatch);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    ok(pips === 0, pips + ' of ' + asked + ' exercises still show the row of rung markers under the progress bar');
    const done = read('sessie/fin', B.app.innerHTML, 'bilan');
    const tally = (done.match(/\b(\d+)\/\1\b/) || [''])[0];
    ok(tally, 'the summary does not count the right answers out of the total: « ' + done.slice(0, 160) + ' »');
    S.abandon();
    console.log('  ' + asked + ' exercices lus, bilan en « ' + tally + ' »');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'SCREENS OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
````

Add it to `test/run-all.sh` after the `engine.js` line:

````sh
node test/screens.js  "$ROOT"
````

- [ ] **Step 2: Run it and watch it fail**

Run: `node test/screens.js "$(pwd)" | head -30`
Expected: dozens of failures of the form `vandaag (compte neuf) shows a percentage: « … 0% du cours »`, `leerpad (…) still speaks of mastery`, and `the session card does not name unit 1`.

- [ ] **Step 3: The two counts**

In `src/core/srs.js`, replace:

````js
  const GRADUATED = 5;              // atteint uniquement en disant l'élément à voix haute
````

with:

````js
  const PRODUCE = 4;                // l'échelon de l'écrit est passé : l'élément se produit
````

replace `GRADUATED` with `PRODUCE` in the export list, and:

In `src/core/srs.js`:

````diff
@@ -201,5 +221,5 @@ NL.srs = (function () {
       if (r.retired) { retired++; mature++; return; }
       if (r.due <= now) due++;
-      if (r.stage >= GRADUATED) mature++; else learning++;
+      if (r.stage >= PRODUCE) mature++; else learning++;
       if (r.said) said++;
     });
````

In `src/content/index.js`, the two predicates and the two progress functions. Task 2 already changed the gate inside the first hunk; what this task adds there is the `PRODUCED` line and the removal of `READY` and `MASTERED`.

In `src/content/index.js`:

````diff
@@ -74,13 +74,20 @@ NL.content = NL.content || {};
   const itemsOf = uid => allItems().filter(it => it.unit === uid);
 
-  /* Deux seuils, tenant compte du palier de chaque élément : un mot du palier
-     « reconnaître » plafonne à l'échelon 2 et ne peut pas atteindre l'échelon 5. */
-  const READY = it => NL.srs.stageOf(it) >= Math.min(3, NL.srs.maxRung(it));
-  const MASTERED = it => NL.srs.stageOf(it) >= Math.min(NL.srs.GRADUATED, NL.srs.maxRung(it));
-  const GATE = 0.8;
+  /* Deux comptes, et pas de troisième. Rencontré : l'élément a été vu au moins
+     une fois. Produit : il a passé l'échelon de l'écrit — en tenant compte du
+     palier, puisqu'un mot du palier « reconnaître » plafonne à l'échelon 2. */
+  const MET = it => NL.srs.stageOf(it) >= 0;
+  const PRODUCED = it => NL.srs.stageOf(it) >= Math.min(NL.srs.PRODUCE, NL.srs.maxRung(it));
+
+  /* Une unité ouvre la suivante quand les trois quarts de ses éléments ont été
+     RENCONTRÉS. Le seuil portait sur un échelon qui demande au moins deux jours
+     de bonnes réponses : une unité entièrement rencontrée n'ouvrait pas la
+     suivante, et il ne restait alors rien de neuf à servir. */
+  const GATE = 0.75;
+  const gateSize = n => Math.ceil(n * GATE);
 
   const unitComplete = uid => {
     const items = itemsOf(uid);
-    return !items.length || items.filter(READY).length / items.length >= GATE;
+    return items.filter(MET).length >= gateSize(items.length);
   };
 
@@ -113,18 +113,13 @@ NL.content = NL.content || {};
   }
 
-  /* Le pourcentage ne compte QUE la maîtrise : ce que tu as dit à voix haute et
-     réussi. Il affiche 0% pendant des jours. C'est la vérité — 33% alors que
-     rien n'est appris est pire. */
+  /* Des comptes, jamais de pourcentage : un compte bouge tous les jours, et ne
+     peut pas être exact et muet à la fois. Voir docs/adr/0002.
+       toOpen = combien d'éléments restent à rencontrer avant l'unité suivante */
   function unitProgress(uid) {
     const items = itemsOf(uid);
-    if (!items.length) return { pct: 0, met: 0, ready: 0, mastered: 0, total: 0, gate: 0, level: 0 };
-    const met = items.filter(it => NL.srs.stageOf(it) >= 0).length;
-    const ready = items.filter(READY).length;
-    const mastered = items.filter(MASTERED).length;
-    const pct = Math.round(mastered / items.length * 100);
+    const met = items.filter(MET).length;
     return {
-      pct, met, ready, mastered, total: items.length,
-      gate: Math.round(ready / items.length * 100),
-      level: Math.min(5, Math.floor(pct / 20))
+      met, produce: items.filter(PRODUCED).length, total: items.length,
+      toOpen: Math.max(0, gateSize(items.length) - met)
     };
   }
@@ -132,10 +127,6 @@ NL.content = NL.content || {};
   function courseProgress() {
     const items = allItems().filter(it => it.unit !== 'eigen');
-    const mastered = items.filter(MASTERED).length;
-    const ready = items.filter(READY).length;
     return {
-      pct: Math.round(mastered / items.length * 100),
-      mastered, ready, total: items.length,
-      unitsDone: NL.content.units.filter(u => unitComplete(u.id)).length,
+      met: items.filter(MET).length, produce: items.filter(PRODUCED).length, total: items.length,
       current: NL.content.units[frontier()] || null
     };
````

- [ ] **Step 4: The home screen, the course and the unit cards**

In `src/ui/home.js`, replace:

````js
  const pct = n => Math.max(0, Math.min(100, Math.round(n)));
  const bar = (p, cls) => '<span class="bar"><span class="bar-fill ' + (cls || '') + '" style="width:' + pct(p) + '%"></span></span>';

````

with nothing (delete it).

The session card names its unit. Replace:

````js
      /* The one thing this screen is for. */
      html += '<section class="card session-card">' +
        '<span class="eyebrow">' + t.todayEyebrow + '</span>' +
````

with:

````js
      /* The one thing this screen is for. Elle nomme l'unité — ou les deux, quand
         la séance en couvre plusieurs : un libellé ne dit jamais une demi-vérité. */
      html += '<section class="card session-card">' +
        '<span class="eyebrow">' + t.todayEyebrow + (p.units ? ' · ' + esc(unitLabel(p.units)) : '') + '</span>' +
````

In `NL.screens.vandaag.render`, delete the line `const c = NL.srs.counts();`: nothing there reads it any more.

In `src/ui/home.js`, replace:

````js
        stat(c.said, t.statSaid) +
        stat(cp.pct + '%', t.statCourse) +
````

with:

````js
        stat(cp.met, t.statMet) +
        stat(cp.produce, t.statProduce) +
````

In `src/ui/home.js`, replace:

````js
  const stat = (n, l) =>
````

with:

````js
  /* « Unité 5 · Chez le boulanger », ou « Unités 4–5 ». */
  function unitLabel(span) {
    if (span.from !== span.to) return t.unitsRange(span.from, span.to);
    const u = NL.content.units.find(x => x.n === span.from);
    return t.unitOne(span.from) + (u ? ' · ' + u.name : '');
  }

  const stat = (n, l) =>
````

In `src/ui/home.js`, replace:

````js
        '<div class="prog-line">' + bar(cp.pct) + '<b>' + cp.pct + '%</b></div>' +
        '<p class="muted small">' + t.masteredOf(cp.mastered, cp.total) + '</p>' +
````

with:

````js
        '<p class="muted small">' + t.courseCounts(cp.met, cp.produce, cp.total) + '</p>' +
````

In `src/ui/home.js`, replace:

````js
          '<span class="uc-pct" title="' + t.unitLevel(p.level) + '">' + p.pct + '%</span>' +
          '</div>' +
          '<p class="uc-blurb">' + esc(u.blurb) + '</p>' +
          '<div class="prog-line">' + bar(p.pct) + '<span class="muted small">' + t.metOf(p.met, p.total) + '</span></div>' +
          (open && !NL.content.unitComplete(u.id)
            ? '<p class="uc-gate">' + t.unitGate(p.gate, 80) + '</p>' : '') +
````

with:

````js
          '<span class="uc-pct">' + p.met + '/' + p.total + '</span>' +
          '</div>' +
          '<p class="uc-blurb">' + esc(u.blurb) + '</p>' +
          '<p class="muted small">' + t.unitCounts(p.met, p.produce, p.total) + '</p>' +
          /* Le seuil est un compte à rebours, pas un mystère. */
          (open && p.toOpen > 0 && u !== NL.content.units[NL.content.units.length - 1]
            ? '<p class="uc-gate">' + t.unitGate(p.toOpen) + '</p>' : '') +
````

On the **Plus** screen, replace:

````js
        tile('\u{1F4D2}', t.wordsEyebrow, c.seen + ' vus, ' + c.mature + ' solides', 'go', 'woorden') +
````

with:

````js
        tile('\u{1F4D2}', t.wordsEyebrow, t.wordsTile(c.seen, c.mature), 'go', 'woorden') +
````

- [ ] **Step 5: The session: no rung markers, and a summary that counts**

In `src/ui/session.js`, replace:

````js
    const stage = NL.srs.stageOf(it);

````

with nothing (delete it).

In `src/ui/session.js`, replace:

````js
      '</span>' + esc(ex.kicker) + stagePips(stage, it) + '</div>' +
````

with:

````js
      '</span>' + esc(ex.kicker) + '</div>' +
````

In `src/ui/session.js`, replace:

````js
  function stagePips(stage, item) {
    const top = NL.srs.maxRung(item);
    const r = Math.max(0, stage);
    let s = '<span class="pips">';
    for (let i = 0; i < top; i++) s += '<i class="' + (i <= stage ? 'on' : '') + '"></i>';
    s += '<b>' + NL.t.rungs[Math.min(r, NL.t.rungs.length - 1)] + '</b>';
    return s + '</span>';
  }

````

with nothing (delete it).

In `src/ui/session.js`, replace:

````js
    const acc = (L.right + L.wrong) ? Math.round(L.right / (L.right + L.wrong) * 100) : 100;
````

with nothing (delete it).

In `src/ui/session.js`, replace:

````js
box(acc + '%', NL.t.tallyRight, 'blue')
````

with:

````js
box(L.right + '/' + (L.right + L.wrong), NL.t.tallyRight, 'blue')
````

The markers in the dictionary rows stay: there they show where an item stands, and nothing sits above them that they could be mistaken for.

- [ ] **Step 6: Pronunciation scores, the listening summary and the dictionary filter**

In `src/ex/index.js`, replace:

````js
          '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
````

with:

````js
          '<div class="score-row"><span class="score">' + wordScore(sp.parts) + '</span>' +
````

In `src/ex/index.js`, replace:

````js
  const said = (task, L) => L.picked.map(i => task.bank[i]).join(' ');
````

with:

````js
  const said = (task, L) => L.picked.map(i => task.bank[i]).join(' ');

  /* Une note de prononciation se dit en mots reconnus, pas en pourcentage. */
  const wordScore = parts => NL.t.wordsHeard((parts || []).filter(p => p.ok).length, (parts || []).length);
````

In `src/ex/index.js`, replace:

````js
  return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, recordPanel, selfRate, sameSense };
````

with:

````js
  return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, recordPanel, selfRate, sameSense, wordScore };
````

In `src/ui/listen.js`, replace:

````js
        '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
````

with:

````js
        '<div class="score-row"><span class="score">' + NL.ex.wordScore(sp.parts) + '</span>' +
````

In `src/ui/listen.js`, replace:

````js
'<div class="tally-box blue"><div class="t-n">' + pct + '%</div>
````

with:

````js
'<div class="tally-box blue"><div class="t-n">' + S.right + '/' + S.clips.length + '</div>
````

In `src/ui/scenario.js`, replace:

````js
          (b.pct != null ? '<p class="bub-score">' + b.pct + '% prononcé</p>' : '') + '</div></div>';
````

with:

````js
          (b.score ? '<p class="bub-score">' + esc(b.score) + '</p>' : '') + '</div></div>';
````

In `src/ui/scenario.js`, replace:

````js
      if (d.act === 'accept') { commit(!!P.speech.ok, P.speech.pct); return; }
````

with:

````js
      if (d.act === 'accept') { commit(!!P.speech.ok, NL.ex.wordScore(P.speech.parts)); return; }
````

In `src/ui/scenario.js`, replace:

````js
  function commit(ok, pct) {
````

with:

````js
  function commit(ok, score) {
````

In `src/ui/scenario.js`, replace:

````js
    P.log.push({ who: 'you', nl: c.nl, fr: c.fr, pct: pct });
````

with:

````js
    P.log.push({ who: 'you', nl: c.nl, fr: c.fr, score: score });
````

In `src/ui/scenario.js`, replace:

````js
        '<div class="score-row"><span class="score">' + sp.pct + '%</span>' +
````

with:

````js
        '<div class="score-row"><span class="score">' + NL.ex.wordScore(sp.parts) + '</span>' +
````

In `src/ui/library.js`, replace:

````js
          : filter === 'sterk' ? seen.filter(it => NL.srs.stageOf(it) >= NL.srs.GRADUATED)
````

with:

````js
          : filter === 'sterk' ? seen.filter(it => NL.srs.stageOf(it) >= NL.srs.PRODUCE)
````

- [ ] **Step 7: The strings**

In `src/core/fr.js`, replace:

````js
  todaySplit: (due, fresh, mins) => due + ' à revoir, ' + fresh + ' nouveaux · environ ' + mins + ' minutes.',
````

with:

````js
  todaySplit: (due, fresh, mins) => due + ' à revoir, ' + fresh + (fresh === 1 ? ' nouveau' : ' nouveaux') + ' · environ ' + mins + ' minutes.',
  unitOne: n => 'Unité ' + n,
  unitsRange: (a, b) => 'Unités ' + a + '–' + b,
````

In `src/core/fr.js`, replace:

````js
  statSaid: 'dits à voix haute',
  statCourse: 'du cours',
````

with:

````js
  statMet: 'rencontrés',
  statProduce: 'que tu sais produire',
````

In `src/core/fr.js`, replace:

````js
  pathSolid: (a, b) => a + ' éléments sur ' + b + ' sont bien ancrés.',
  unitSeen: (a, b) => a + '/' + b + ' vus',
````

with:

````js
  courseCounts: (met, produce, total) => met + ' rencontrés sur ' + total + ', dont ' + produce + ' que tu sais produire.',
  unitCounts: (met, produce, total) => met + ' rencontrés sur ' + total + ' · ' + produce + ' que tu sais produire',
````

In `src/core/fr.js`, replace:

````js
  rungs: ['découverte', 'reconnaissance', 'à l’oreille', 'à l’écrit', 'à voix haute', 'maîtrisé', 'ancré'],
````

with nothing (delete it).

In `src/core/fr.js`, replace:

````js
  micHeard: 'Entendu :',
````

with:

````js
  micHeard: 'Entendu :',
  wordsHeard: (a, b) => a + (a === 1 ? ' mot' : ' mots') + ' sur ' + b,
````

Replace:

````js
  wordsAll: 'tous', wordsWeak: 'fragiles', wordsStrong: 'solides', wordsMine: 'à moi',
````

with:

````js
  wordsAll: 'tous', wordsWeak: 'fragiles', wordsStrong: 'produits', wordsMine: 'à moi',
  wordsTile: (met, produce) => met + ' rencontrés, ' + produce + ' que tu sais produire',
````

Replace:

````js
  unitGate: (a, b) => 'L’unité suivante s’ouvre à ' + b + '% travaillés — tu es à ' + a + '%.',
  unitLevel: n => 'Niveau ' + n + ' / 5',
  masteredOf: (a, b) => a + ' maîtrisés sur ' + b,
  metOf: (a, b) => a + ' rencontrés sur ' + b,
````

with:

````js
  unitGate: n => n === 1 ? 'Encore un élément à rencontrer avant l’unité suivante.' : 'Encore ' + n + ' éléments à rencontrer avant l’unité suivante.',
````

and, because a reference page may not show a percentage either, replace in `dehetBody` the words `Environ 70% des mots het suivent une règle.` with `Environ sept mots het sur dix suivent une règle.`

- [ ] **Step 8: The tests that printed the old figures**

In `test/smoke.js`:

````diff
@@ -439,9 +398,9 @@ NL.state.open().then(() => {
   });
 
-  console.log('\nPLACEMENT / PROGRESS');
+  console.log('\nPROGRESS');
   const before = NL.content.unitProgress('overleven');
   NL.content.itemsOf('tijd').forEach(i => { if (i.kind !== 'pattern') NL.srs.seed(i, 2); });
-  console.log('  unit progress   overleven ' + before.pct + '%, tijd ' + NL.content.unitProgress('tijd').pct + '%');
-  console.log('  course          ' + NL.content.courseProgress().pct + '%');
+  console.log('  unit progress   overleven ' + before.met + '/' + before.total + ' met, tijd ' + NL.content.unitProgress('tijd').met + '/' + NL.content.unitProgress('tijd').total);
+  console.log('  course          ' + NL.content.courseProgress().met + ' met, ' + NL.content.courseProgress().produce + ' produced');
   console.log('  unit 2 open?    ' + NL.content.unitOpen('ikengij'));
   console.log('  counts          ' + JSON.stringify(NL.srs.counts()));
````

In `test/journey.js`:

````diff
@@ -140,4 +40,5 @@ function view(screen, arg) {
     ok(html.indexOf('[object Object]') < 0, screen + ' printed [object Object]');
     ok(html.indexOf('NaN') < 0, screen + ' printed NaN');
+    ok(!/\d\s?%/.test(html.replace(/<[^>]*>/g, ' ')), screen + ' shows a percentage');
     return html;
   } catch (e) { console.log('   ✗ ' + screen + ' render threw: ' + e.message); fails++; return ''; }
@@ -288,4 +149,5 @@ function view(screen, arg) {
       if (c.ex !== 'match') ok(after.indexOf('foot ok') >= 0 || after.indexOf('foot no') >= 0, c.ex + ' gave no verdict');
       if (c.ex !== 'match') ok(after.indexOf('foot no') < 0, c.ex + ' rejected a correct answer');
+      ok(!/\d\s?%/.test(after.replace(/<[^>]*>/g, ' ')), c.ex + ' shows a percentage after the answer');
       tap('sessie', { next: '1' });
     }
````

In `test/pace.js`, switch the three `.mastered` kept in Task 5 to `.produce`.

- [ ] **Step 9: Bring `README.md` up to date**

In the rung table, the row for rung 5 is labelled "maîtrisé": rename the label to "consolidé". In the closing paragraph, replace "pourcentage de maîtrise seule" with "deux comptes, rencontrés et produits, sans pourcentage". Where the unit card is described, say it counts down the items left before the next unit opens.

- [ ] **Step 10: Run and commit**

Run: `node test/screens.js "$(pwd)" && sh test/run-all.sh`
Expected: `SCREENS OK` with `accueil : « Unités 1–2 » ; parcours : « Encore 3 éléments à rencontrer avant l’unité suivante. »` and a summary in `23/23`; then the suite passes.

````bash
sh build.sh
git add src test README.md index.html artifact.html
git commit -m "feat: counts replace every percentage, the session names its unit, the rung markers go"
````

---

### Task 8: A reset that clears the server before the sync reads it, and the one-time migration

Today "Tout effacer" wipes the device, settings and own words included, and leaves the server untouched, so the next synchronisation puts everything back. The reset now clears **progress only**, on the device and on the server, and the server is cleared before it is read. Progress means the items, the answer history, the frontier, and the conversations and listening series ticked as done: starting from zero while still showing six conversations completed is not starting from zero. Settings, score and own words stay.

The mechanism is one timestamp, `resetAt`, kept in the settings document, which already travels between devices. A device that finds a later `resetAt` on the server than its own knows its copy is stale: it drops what is older and sends none of it back. The same call does the one-time migration, with a **fixed** cut-off instead of "now": a second device migrating a day later would otherwise erase what the first had learned in between.

Restoring a backup counts as a reset followed by a reload, with the restored records stamped "now"; otherwise other devices would take them for erased progress.

**Files:**
- Modify: `src/core/state.js`, `src/core/sync.js`, `src/ui/shell.js`, `src/core/fr.js`, `test/sync.js`

**Interfaces:**
- Produces: `NL.state.resetProgress(before, silent)`; `NL.state.ENGINE_EPOCH`; `NL.state.migrate()` returns true when it removed something; the settings field `resetAt` (a new field, not a rename); the event `'reset'` on `NL.state.onWrite`.
- Changes: `dataVersion` 2 → 3. `mergeMeta` takes the larger `resetAt`. Where the two sides differ on it, `reached`, `scenariosDone` and `listenDone` come from the side that carries the later one; where they agree, `reached` takes the maximum and the lists unite, as before. (`listenDone` is declared and merged but nothing writes it today; it follows the same rule so that it is right when something does.)
- Server: no schema change. The policy in `supabase/schema.sql` is `for all`, so the two deletes are allowed. The backup robot in `dahyousef/vlaams-backup` copies the settings document whole and needs nothing.

- [ ] **Step 1: Teach the fake server to delete, and write the failing tests**

In `test/sync.js`:

````diff
@@ -42,4 +38,8 @@ function fakeLib(device) {
           let rows = rowsFor(table, uid());
           q.filters.forEach(f => { rows = rows.filter(f); });
+          if (q.del) {
+            rows.forEach(r => server.tables[table].delete(keyOf(table, r)));
+            return Promise.resolve({ error: null });
+          }
           return Promise.resolve({ data: clone(rows.slice(q.from, q.to + 1)), error: null });
         };
@@ -47,4 +47,6 @@ function fakeLib(device) {
           select() { return b; },
           gte(col, v) { q.filters.push(r => r[col] >= v); return b; },
+          lt(col, v) { q.filters.push(r => r[col] < v); return b; },
+          delete() { q.del = true; return b; },
           range(a, z) { q.from = a; q.to = z; return b; },
           then(res, rej) { return run().then(res, rej); },
@@ -252,4 +228,10 @@ const items = NL => NL.content.allItems();
   ok(m1.doneToday === 7, 'same-day counter should take the max');
   ok(m1.placed === true, 'placement should never be undone');
+  /* Remise à zéro : ce qui relève de la progression suit le côté qui la porte,
+     même si l'autre appareil a été modifié plus tard. */
+  const m4 = M({ resetAt: 500, reached: 0, scenariosDone: [], xp: 9, updatedAt: 500 },
+               { resetAt: 0, reached: 3, scenariosDone: ['a', 'b'], xp: 4, updatedAt: 900 });
+  ok(m4.reached === 0 && m4.scenariosDone.length === 0, 'a stale device gave back what the reset erased: ' + JSON.stringify([m4.reached, m4.scenariosDone]));
+  ok(m4.resetAt === 500 && m4.xp === 9, 'the reset stamp or the score was lost in the merge');
   /* Le robot de sauvegarde écrit lastBackup sans toucher à updated_at : la
      fusion doit le garder même quand l'autre côté est « plus récent ». */
@@ -308,4 +290,123 @@ const items = NL => NL.content.allItems();
   console.log('  aucun mélange entre comptes');
 
+  console.log('\nREMISE À ZÉRO');
+  {
+    /* Deux appareils connectés au même compte, tous deux avec de la progression. */
+    const R1 = device('R1', true), R2 = device('R2', true);
+    await R1.boot(); await R1.signIn('reset@example.com');
+    const rid = R1.NL.sync.user.id, ri = items(R1.NL);
+    ri.slice(0, 10).forEach(it => R1.NL.srs.grade(it, true, { ex: 'type' }));
+    R1.NL.state.setMeta({ xp: 77, theme: 'dark', reached: 2, scenariosDone: ['bakker', 'dokter'] });
+    R1.NL.state.addCustom({ nl: 'de koffiekoek', fr: 'la viennoiserie' });
+    await R1.NL.sync.flush();
+    await R2.boot(); await R2.signIn('reset@example.com');
+    ok(R2.NL.state.seenCount() === 10 && rowsFor('srs_records', rid).length === 10, 'the fixture is wrong: both devices should hold 10 records');
+
+    /* R2, hors ligne, répond encore à un élément : la réponse attend dans sa boîte. */
+    R2.offline(true);
+    R2.NL.srs.grade(ri[0], true, { ex: 'type' });
+    await wait(5);
+
+    R1.NL.state.resetProgress();
+    await R1.NL.sync.flush();
+    ok(R1.NL.state.seenCount() === 0 && R1.NL.state.logs().length === 0, 'the reset left progress on the device that asked for it');
+    ok(rowsFor('srs_records', rid).length === 0, 'the reset left ' + rowsFor('srs_records', rid).length + ' records on the server');
+    ok(rowsFor('review_log', rid).length === 0, 'the reset left the answer history on the server');
+    ok(R1.NL.state.meta().xp === 77 && R1.NL.state.meta().theme === 'dark', 'the reset took the score or the settings with it');
+    ok(R1.NL.state.customs().length === 1 && rowsFor('custom_words', rid).length === 1, 'the reset took the learner’s own words with it');
+    ok(R1.NL.state.meta().reached === 0, 'the frontier survived the reset');
+    ok(R1.NL.state.meta().scenariosDone.length === 0, 'after the reset the device still claims ' + R1.NL.state.meta().scenariosDone.length + ' conversations done');
+    ok(rowsFor('user_meta', rid)[0].data.scenariosDone.length === 0, 'after the reset the server still lists conversations as done');
+
+    /* La synchro suivante ne doit rien rendre. */
+    await R1.NL.sync.pull();
+    ok(R1.NL.state.seenCount() === 0, 'the next synchronisation restored ' + R1.NL.state.seenCount() + ' deleted records');
+
+    /* R2 revient en ligne avec sa copie périmée et une réponse en attente. */
+    R2.offline(false);
+    await R2.NL.sync.flush();
+    ok(rowsFor('srs_records', rid).length === 0, 'a stale device pushed ' + rowsFor('srs_records', rid).length + ' deleted record(s) back to the server');
+    await R2.NL.sync.pull();
+    ok(R2.NL.state.seenCount() === 0, 'the second device still shows ' + R2.NL.state.seenCount() + ' records after the reset');
+    ok(R2.NL.state.meta().reached === 0, 'the second device kept its frontier');
+    ok(R2.NL.state.meta().scenariosDone.length === 0, 'the second device still claims ' + R2.NL.state.meta().scenariosDone.length + ' conversations done');
+    ok(R2.NL.state.meta().xp === 77 && R2.NL.state.customs().length === 1, 'the second device lost the score or the own words');
+
+    /* Ce qui est appris APRÈS la remise à zéro circule normalement. */
+    await wait(3);
+    R2.NL.srs.grade(ri[3], true, { ex: 'type' });
+    await R2.NL.sync.flush();
+    await R1.NL.sync.pull();
+    ok(R1.NL.state.seenCount() === 1 && rowsFor('srs_records', rid).length === 1, 'progress made after the reset did not travel');
+    R2.NL.state.setMeta({ scenariosDone: ['bakker'] });
+    await R2.NL.sync.flush();
+    await R1.NL.sync.pull();
+    ok(R1.NL.state.meta().scenariosDone.join() === 'bakker', 'a conversation done after the reset did not travel: ' + JSON.stringify(R1.NL.state.meta().scenariosDone));
+
+    /* Un appareil neuf qui se connecte ne voit que l'après. */
+    const R3 = device('R3', true);
+    await R3.boot(); await R3.signIn('reset@example.com');
+    ok(R3.NL.state.seenCount() === 1, 'a new device sees ' + R3.NL.state.seenCount() + ' records, expected the single one made since the reset');
+    console.log('  effacé ici, sur le serveur et sur le second appareil ; réglages, score et mots gardés');
+
+    /* Hors ligne au moment de la remise à zéro, puis page rechargée : le serveur
+       est effacé AVANT d'être relu. */
+    await wait(3);
+    R1.offline(true);
+    R1.NL.state.resetProgress();
+    await wait(450);
+    const R1b = device('R1b', true, JSON.parse(JSON.stringify(R1.store)));
+    await R1b.boot();
+    await wait(20);
+    ok(rowsFor('srs_records', rid).length === 0, 'a reset made offline never reached the server');
+    ok(R1b.NL.state.seenCount() === 0, 'after an offline reset and a reload, the server gave the progress back');
+    console.log('  remise à zéro hors ligne : envoyée au rechargement, avant toute lecture');
+
+    /* Restaurer une sauvegarde après coup reste possible, et se propage. */
+    const dump = JSON.parse(JSON.stringify(R3.NL.state.exportAll()));
+    ok(R3.NL.state.importAll(dump), 'import refused');
+    R3.NL.sync.queueAll(); await R3.NL.sync.flush();
+    ok(rowsFor('srs_records', rid).length === 1, 'a backup restored after a reset did not reach the server');
+    await R2.NL.sync.pull();
+    ok(R2.NL.state.seenCount() === 1, 'a backup restored after a reset did not reach the other device');
+    console.log('  une sauvegarde restaurée ensuite se propage');
+  }
+
+  console.log('\nMIGRATION — l’ancien moteur');
+  {
+    const M1 = device('M1', true);
+    await M1.boot(); await M1.signIn('old@example.com');
+    const mid = M1.NL.sync.user.id, mi = items(M1.NL), EPOCH = M1.NL.state.ENGINE_EPOCH;
+    /* De la progression datée d'avant le nouveau moteur, sur l'appareil et le serveur. */
+    mi.slice(0, 6).forEach(it => M1.NL.state.setRec({ id: it.id, kind: it.kind, stage: 3, due: EPOCH, interval: 0, ease: 2.5, reps: 1, lapses: 0, last: 0, said: false, retired: false, lastEx: null, updatedAt: EPOCH - 5000 }, true));
+    M1.NL.sync.queueAll(); await M1.NL.sync.flush();
+    M1.NL.state.setMeta({ dataVersion: 2, xp: 40 });
+    await M1.NL.sync.flush();
+    ok(rowsFor('srs_records', mid).length === 6, 'the fixture is wrong: 6 old records should be on the server');
+    await wait(450);
+    const M2 = device('M2', true, JSON.parse(JSON.stringify(M1.store)));
+    await M2.NL.state.open();
+    ok(M2.NL.state.seenCount() === 6, 'the fixture is wrong: the reloaded device should hold 6 old records');
+    ok(M2.NL.state.migrate() === true, 'a device carrying old progress did not migrate');
+    ok(M2.NL.state.seenCount() === 0, 'the migration left old progress on the device');
+    ok(M2.NL.state.meta().xp === 40, 'the migration took the score');
+    ok(M2.NL.state.migrate() === false, 'the migration ran twice');
+    M2.NL.content.refresh(); M2.NL.ui.bind(M2.root);
+    await M2.NL.sync.init(); await wait(20);
+    ok(rowsFor('srs_records', mid).length === 0, 'the migration left ' + rowsFor('srs_records', mid).length + ' old records on the server');
+    ok(M2.NL.state.seenCount() === 0, 'the synchronisation gave the old progress back');
+    /* Un second appareil qui migre plus tard n'efface pas ce qui a été appris depuis. */
+    M2.NL.srs.grade(mi[0], true, { ex: 'type' });
+    await M2.NL.sync.flush();
+    const M3 = device('M3', true);
+    await M3.NL.state.open();
+    M3.NL.state.setMeta({ dataVersion: 2 });
+    M3.NL.state.migrate(); M3.NL.content.refresh(); M3.NL.ui.bind(M3.root);
+    await M3.NL.sync.init(); await M3.signIn('old@example.com');
+    ok(rowsFor('srs_records', mid).length === 1, 'a second device migrating later deleted what had been learned since');
+    ok(M3.NL.state.seenCount() === 1, 'the second device did not receive the new progress');
+    console.log('  ancienne progression effacée partout, une seule fois ; la nouvelle survit à la migration d’un second appareil');
+  }
+
   console.log('\nÉCRAN COMPTE');
   {
````

- [ ] **Step 2: Run them and watch them fail**

Run: `node test/sync.js "$(pwd)" | tail -5`
Expected: `CRASH TypeError: R1.NL.state.resetProgress is not a function`. The existing 71 checks before it still pass.

- [ ] **Step 3: The device: `resetProgress`, the migration, the longer answer history**

In `src/core/state.js`, replace:

````js
    pace: 'normal', exDay: null, exToday: 0, dataVersion: 2, lastEx: null,
    reached: 0                 // index of the furthest unit ever opened; never goes back
  });
  let meta = defaults();

  /* Une seule fois : la progression fabriquée par l'ancien test de placement
     — des unités entières créditées sur une réponse chanceuse — est effacée.
     XP, série, réglages et mots personnels survivent. */
  function migrate() {
    if ((meta.dataVersion || 1) >= 2) return false;
    mem.srs.clear();
    if (useIDB) { try { db.transaction('srs', 'readwrite').objectStore('srs').clear(); } catch (e) {} }
    setMeta({ dataVersion: 2, placed: false, exDay: null, exToday: 0 });
    return true;
  }
````

with:

````js
    pace: 'normal', exDay: null, exToday: 0, dataVersion: 3, lastEx: null,
    reached: 0,                // index of the furthest unit ever opened; never goes back
    resetAt: 0                 // l'instant de la dernière remise à zéro ; tout ce qui est plus ancien est effacé
  });
  let meta = defaults();

  /* Le journal garde deux mois de réponses au rythme le plus soutenu : c'est ce
     que l'écran des fautes relit. */
  const LOG_KEEP = 12000;

  /* Tout ce qui a été appris avec l'ancien moteur — retours à douze minutes,
     unités créditées par le test de niveau — est antérieur à cet instant. La
     date est FIXE, et non « maintenant » : un second appareil qui migre un jour
     plus tard effacerait sinon ce que le premier a appris entre-temps. */
  const ENGINE_EPOCH = Date.UTC(2026, 9, 12);

  /* Une seule fois par appareil : la progression de l'ancien moteur est effacée,
     ici et sur le serveur. Réglages, score et mots personnels survivent. */
  function migrate() {
    if ((meta.dataVersion || 1) >= 3) return false;
    const had = [...mem.srs.values()].some(r => (r.updatedAt || 0) < ENGINE_EPOCH);
    resetProgress(ENGINE_EPOCH);
    setMeta({ dataVersion: 3 });
    return had;
  }

  /* Remet la PROGRESSION à zéro : les fiches, le journal des réponses, la
     frontière, et les conversations et écoutes cochées — repartir de zéro en
     gardant « six conversations faites », ce n'est pas repartir de zéro.
     Réglages, score et mots personnels restent.
       before   n'efface que ce qui est antérieur à cet instant (défaut : tout)
       silent   la remise à zéro vient du serveur : elle n'y repart pas
     L'instant est gardé dans les réglages (resetAt) : c'est lui qui dit aux
     autres appareils que leur copie est périmée. */
  function resetProgress(before, silent) {
    const cut = before || Date.now();
    [...mem.srs.values()].forEach(r => { if ((r.updatedAt || 0) < cut) mem.srs.delete(r.id); });
    mem.log = mem.log.filter(l => l.t >= cut);
    if (useIDB) {
      try {
        const s = db.transaction('srs', 'readwrite').objectStore('srs');
        s.clear(); mem.srs.forEach(r => s.put(r));
        const l = db.transaction('log', 'readwrite').objectStore('log');
        l.clear(); mem.log.forEach(e => l.put(e));
      } catch (e) {}
    }
    setMeta({
      resetAt: Math.max(meta.resetAt || 0, cut), reached: 0, exDay: null, exToday: 0,
      scenariosDone: [], listenDone: []
    }, silent);
    if (!silent) emit('reset', cut);
  }
````

In `src/core/state.js`, replace:

````js
          mem.log = (l || []).slice(-4000);
````

with:

````js
          mem.log = (l || []).slice(-LOG_KEEP);
````

In `src/core/state.js`, replace:

````js
    if (mem.log.length > 4000) mem.log.shift();
````

with:

````js
    if (mem.log.length > LOG_KEEP) mem.log.shift();
````

In `src/core/state.js`, replace:

````js
    mem.srs.clear(); mem.custom.clear();
    data.srs.forEach(r => { if (r && r.id) { mem.srs.set(r.id, r); put('srs', r); } });
    (data.custom || []).forEach(r => { if (r && r.id) { mem.custom.set(r.id, r); put('custom', r); } });
    if (data.meta) { meta = Object.assign(defaults(), data.meta); put('meta', { k: 'meta', v: meta }); }
    mem.log = Array.isArray(data.log) ? data.log : [];
    saveLS();
    return true;
````

with:

````js
    /* Restaurer une sauvegarde est une remise à zéro suivie d'un rechargement :
       les fiches sont datées de maintenant, sinon les autres appareils les
       prendraient pour de la progression effacée. */
    const stamp = Date.now();
    mem.srs.clear(); mem.custom.clear();
    data.srs.forEach(r => { if (r && r.id) { r.updatedAt = stamp; mem.srs.set(r.id, r); put('srs', r); } });
    (data.custom || []).forEach(r => { if (r && r.id) { mem.custom.set(r.id, r); put('custom', r); } });
    if (data.meta) meta = Object.assign(defaults(), data.meta);
    meta.resetAt = stamp; meta.updatedAt = stamp;
    put('meta', { k: 'meta', v: meta });
    mem.log = Array.isArray(data.log) ? data.log : [];
    saveLS();
    emit('reset', stamp);
    return true;
````

In `src/core/state.js`, replace:

````js
return { open, migrate, onWrite,
````

with:

````js
return { open, migrate, resetProgress, ENGINE_EPOCH, onWrite,
````

Set `ENGINE_EPOCH` to the day this task is implemented, at midnight UTC, if that is later than 12 October 2026: it must fall after the last answer given on the old engine and before the first given on the new one.

- [ ] **Step 4: The sync: resets settle first, in both directions**

In `src/core/sync.js`, replace:

````js
  const LOG_DAYS = 45;
````

with:

````js
  const LOG_DAYS = 62;            // deux mois : ce que l'écran des fautes relit
````

In `src/core/sync.js`, replace:

````js
  const empty = () => ({ recs: {}, customs: {}, meta: false, logs: [] });
````

with:

````js
  const empty = () => ({ recs: {}, customs: {}, meta: false, logs: [], reset: 0 });
````

In `src/core/sync.js`, replace:

````js
    (box.meta ? 1 : 0) + box.logs.length;
````

with:

````js
    (box.meta ? 1 : 0) + box.logs.length + (box.reset ? 1 : 0);
````

In `src/core/sync.js`, replace:

````js
    else if (type === 'log') { box.logs.push(v); if (box.logs.length > 5000) box.logs.shift(); }
````

with:

````js
    else if (type === 'log') { box.logs.push(v); if (box.logs.length > 5000) box.logs.shift(); }
    /* Une remise à zéro : ce qui attendait d'être envoyé n'existe plus, et le
       serveur devra effacer la même chose avant d'être relu. */
    else if (type === 'reset') {
      box.reset = Math.max(box.reset || 0, v);
      box.recs = {}; box.logs = box.logs.filter(l => l.t >= v); box.meta = true;
    }
````

In `src/core/sync.js`, replace:

````js
  async function pull() {
    if (!user) return;
    state = 'syncing'; notify();
    try {
      const recs = await selectAll('srs_records');
      recs.forEach(row => {
        const local = NL.state.rec(row.item_id);
````

with:

````js
  /* Les remises à zéro passent AVANT tout le reste, dans les deux sens.
     La nôtre d'abord : le serveur efface ce que cet appareil a effacé, sinon la
     lecture qui suit le lui rendrait. Puis celle des autres : si le serveur
     porte une remise à zéro plus récente, la copie locale est périmée et rien
     d'elle ne doit repartir. Rend les réglages du serveur, déjà lus. */
  async function settleResets() {
    if (box.reset) {
      let r = await client.from('srs_records').delete().lt('updated_at', box.reset);
      if (r.error) throw r.error;
      r = await client.from('review_log').delete().lt('t', box.reset);
      if (r.error) throw r.error;
      box.reset = 0; box.meta = true; persist();
    }
    const { data, error } = await client.from('user_meta').select('*').range(0, 0);
    if (error) throw error;
    const remote = data && data[0] ? data[0].data : null;
    if (remote && (remote.resetAt || 0) > (NL.state.meta().resetAt || 0)) {
      NL.state.resetProgress(remote.resetAt, true);
      box.recs = {}; box.logs = box.logs.filter(l => l.t >= remote.resetAt); persist();
      NL.content.refresh();
    }
    return remote;
  }

  async function pull() {
    if (!user) return;
    state = 'syncing'; notify();
    try {
      const remoteMeta = await settleResets();
      const cut = NL.state.meta().resetAt || 0;
      const recs = await selectAll('srs_records');
      recs.forEach(row => {
        if (row.updated_at < cut) return;      // antérieur à la remise à zéro : en cours d'effacement
        const local = NL.state.rec(row.item_id);
````

In `src/core/sync.js`, replace:

````js
      const metaRows = await selectAll('user_meta');
      if (metaRows[0]) {
        const merged = mergeMeta(NL.state.meta(), metaRows[0].data);
        NL.state.setMeta(merged, true);
        if (JSON.stringify(merged) !== JSON.stringify(metaRows[0].data)) { box.meta = true; persist(); }
      } else {
````

with:

````js
      if (remoteMeta) {
        const merged = mergeMeta(NL.state.meta(), remoteMeta);
        NL.state.setMeta(merged, true);
        if (JSON.stringify(merged) !== JSON.stringify(remoteMeta)) { box.meta = true; persist(); }
      } else {
````

In `src/core/sync.js`, replace:

````js
  async function doFlush() {
    if (!pending()) { done(); return; }
    state = 'syncing'; notify();
    /* On prend un instantané et on vide la boîte : ce qui s'écrit PENDANT
       l'envoi repart dans une boîte neuve au lieu d'être effacé par erreur. */
    const snap = box; box = empty(); persist();
    try {
      const uid = user.id;
````

with:

````js
  async function doFlush() {
    if (!pending()) { done(); return; }
    state = 'syncing'; notify();
    let remoteMeta = null;
    try { remoteMeta = await settleResets(); }
    catch (e) { fail(e); schedule(30000); return; }
    if (!pending()) { done(); return; }
    /* On prend un instantané et on vide la boîte : ce qui s'écrit PENDANT
       l'envoi repart dans une boîte neuve au lieu d'être effacé par erreur. */
    const snap = box; box = empty(); persist();
    try {
      const uid = user.id;
````

In `src/core/sync.js`, replace:

````js
        const { data: remote, error: readErr } = await client.from('user_meta').select('*').range(0, 0);
        if (readErr) throw readErr;
        if (remote && remote[0]) NL.state.setMeta(mergeMeta(NL.state.meta(), remote[0].data), true);
        const m = NL.state.meta();
````

with:

````js
        if (remoteMeta) NL.state.setMeta(mergeMeta(NL.state.meta(), remoteMeta), true);
        const m = NL.state.meta();
````

In `src/core/sync.js`, replace:

````js
    ['scenariosDone', 'listenDone'].forEach(k => {
      out[k] = Array.from(new Set([].concat(a[k] || [], b[k] || [])));
    });
    out.placed = !!(a.placed || b.placed);
    out.reached = Math.max(a.reached || 0, b.reached || 0);
````

with:

````js
    out.placed = !!(a.placed || b.placed);
    /* La frontière ne recule jamais et les listes de choses faites s'unissent —
       sauf remise à zéro : tout ce qui relève de la progression suit alors le
       côté qui porte la plus récente, sinon l'autre appareil rendrait ce qu'on
       vient d'effacer. */
    const ra = a.resetAt || 0, rb = b.resetAt || 0;
    const later = ra > rb ? a : b;
    out.resetAt = Math.max(ra, rb);
    out.reached = ra === rb ? Math.max(a.reached || 0, b.reached || 0) : (later.reached || 0);
    ['scenariosDone', 'listenDone'].forEach(k => {
      out[k] = ra === rb ? Array.from(new Set([].concat(a[k] || [], b[k] || []))) : (later[k] || []).slice();
    });
````

The two lists were united unconditionally, which is right between two devices at the same reset and wrong across a reset: the stale device's list would come straight back.

- [ ] **Step 5: The button and its words**

In `src/ui/shell.js`, replace:

````js
          Promise.resolve(NL.state.clearAll()).then(() => {
            NL.content.refresh(); sheet = null; route = 'vandaag'; render(); toast(t.wiped);
          });
          return;
````

with:

````js
          /* La progression seulement : réglages, score et mots personnels
             restent. Connecté, le serveur est effacé avant d'être relu — sinon
             la synchro suivante rendrait tout ce qu'on vient d'effacer. */
          NL.state.resetProgress();
          NL.content.refresh(); sheet = null; route = 'vandaag'; render(); toast(t.wiped);
          if (NL.sync.user) NL.sync.flush();
          return;
````

In `src/core/fr.js`, replace:

````js
  setReset: 'Tout effacer',
  setResetTitle: 'Effacer toute la progression ?',
  setResetBody: 'Chaque révision, chaque série, chaque mot ajouté. C’est définitif.',
  setResetYes: 'Oui, tout effacer',
````

with:

````js
  setReset: 'Remettre la progression à zéro',
  setResetTitle: 'Remettre la progression à zéro ?',
  setResetBody: 'Chaque élément rencontré, l’historique de tes réponses et les conversations déjà faites, sur tous tes appareils. Tes réglages, ton score et tes mots à toi restent. C’est définitif.',
  setResetYes: 'Oui, repartir de zéro',
````

In `src/core/fr.js`, replace:

````js
  wiped: 'Tout est effacé.',
````

with:

````js
  wiped: 'Progression remise à zéro.',
````

and the toast shown once after the migration. Replace:

````js
  migrated: 'Progression remise à zéro — l’ancien test de niveau créditait des unités entières sans preuve.',
````

with:

````js
  migrated: 'Progression remise à zéro : le moteur a changé, et l’ancienne ne pouvait pas le suivre. Tes réglages, ton score et tes mots sont restés.',
````

- [ ] **Step 6: Run, then break it on purpose**

Run: `node test/sync.js "$(pwd)" | tail -3`
Expected: `106 checks, SYNC OK`.

Then check the tests would notice. In `doFlush`, change `remoteMeta = await settleResets();` to `remoteMeta = null;` and run again.

Expected: five failures, among them `the reset left 10 records on the server` and `a stale device pushed 10 deleted record(s) back to the server`. Put the line back.

- [ ] **Step 7: Run the suite and commit**

Run: `sh test/run-all.sh`
Expected: passes.

````bash
sh build.sh
git add src/core/state.js src/core/sync.js src/ui/shell.js src/core/fr.js test/sync.js index.html artifact.html
git commit -m "fix: a reset clears the server before the sync reads it, and old-engine progress is migrated away once"
````

---

### Task 9: A screen for what you keep getting wrong

Every answer has been recorded since September and no screen has ever read the record. The dictionary's "fragiles" filter meant "on a low rung", which is something else: an item met yesterday is on a low rung and is not fragile.

**Files:**
- Create: `src/ui/mistakes.js`
- Modify: `build.sh`, `src/core/srs.js`, `src/ui/session.js`, `src/ui/home.js`, `src/ui/shell.js`, `src/ui/library.js`, `src/core/fr.js`, `test/screens.js`, `test/sim.js`, `test/journey.js`

**Interfaces:**
- Consumes: the answer history kept for two months (Task 8 raised `LOG_KEEP` and `LOG_DAYS`).
- Produces: `NL.srs.mistakes(now)` → `[{ item, wrong, right, last }]`, most-missed first, over the last 62 days, skipping answers whose item no longer exists. `NL.screens.fouten`. `NL.screens.sessie.begin('fouten')` starts a session on the 22 most-missed items; like the challenge it is outside the day budget, and its answers are real reviews.

- [ ] **Step 1: Write the failing test**

In `test/screens.js`, add `'fouten'` to the end of the `SCREENS` list, and insert before the final `console.log`:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nCE QUI RÉSISTE');
  {
    fresh();
    const [a, b, c, d] = all.filter(it => it.kind === 'word').slice(0, 4);
    [a, b, c, d].forEach(it => put(it, 2, T0 + 5 * DAY));
    const log = (it, okAns, ago) => NL.state.logReview({ id: it.id, t: T0 - ago, ok: okAns, stage: 1, kind: it.kind, ex: 'type' });
    log(a, false, 3 * DAY); log(a, false, 2 * DAY); log(a, true, DAY);      // raté deux fois
    log(b, false, DAY);                                                    // raté une fois
    log(c, true, DAY); log(c, true, 2 * DAY);                              // toujours juste
    log(d, false, 70 * DAY);                                               // raté, mais il y a plus de deux mois
    NL.state.logReview({ id: 'disparu:w99', t: T0 - DAY, ok: false, stage: 1, kind: 'word', ex: 'type' });

    const list = NL.srs.mistakes();
    ok(list.length === 2, 'expected 2 missed items, got ' + list.length + ' (' + list.map(x => x.item.nl).join(', ') + ')');
    ok(list[0] && list[0].item.id === a.id && list[0].wrong === 2 && list[0].right === 1, 'the most-missed item is not first, or is miscounted');
    ok(!list.some(x => x.item.id === c.id), 'an item answered right every time is listed');
    ok(!list.some(x => x.item.id === d.id), 'a miss older than two months is still counted');

    const screen = read('fouten', NL.screens.fouten.render(), 'deux ratés');
    ok(screen.indexOf(t.missTitle(2)) >= 0, 'the screen does not announce 2 items');
    ok(screen.indexOf(t.missRow(2, 3)) >= 0, 'the screen does not say « ' + t.missRow(2, 3) + ' »');
    ok(screen.indexOf(NL.util.bare(a.nl)) < screen.indexOf(NL.util.bare(b.nl)), 'the list is not ordered most-missed first');
    ok(text(NL.screens.meer.render()).indexOf(t.missTile(2)) >= 0, 'the Plus screen does not lead to the mistakes');

    /* « Fragile », dans le dictionnaire, veut maintenant dire raté. */
    NL.screens.woorden.click({ dataset: { f: 'zwak' } }, { act: 'filter' });
    const weak = NL.screens.woorden.render();
    const rows = (weak.match(/class="vrow"/g) || []).length;
    ok(rows === 2, 'the fragile filter lists ' + rows + ' items: it should list the 2 that were missed, not the 4 sitting on a low rung');
    NL.screens.woorden.click({ dataset: { f: 'alles' } }, { act: 'filter' });

    /* Une séance sur exactement ces éléments. */
    NL.screens.fouten.click({ dataset: {} }, { act: 'start' });
    const served = [];
    let guard = 0;
    while (S.peek() && guard++ < 20) { served.push(S.peek().items[0].id); answer.right(); answer.next(false); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    S.abandon();
    ok(served.length === 2 && served.indexOf(a.id) >= 0 && served.indexOf(b.id) >= 0, 'the mistakes session served ' + JSON.stringify(served));

    /* Rien de raté : l'écran le dit, et n'offre pas de séance vide. */
    fresh();
    const none = NL.screens.fouten.render();
    ok(text(none).indexOf(t.missNone) >= 0 && none.indexOf('data-act="start"') < 0, 'with nothing missed the screen still offers a session');
    console.log('  classés du plus raté au moins raté, séance sur ces éléments, filtre « fragiles » aligné');
  }
````

- [ ] **Step 2: Run it and watch it fail**

Run: `node test/screens.js "$(pwd)" | grep -m3 "FAIL\|CRASH"`
Expected: `fouten (compte neuf) threw: Cannot read properties of undefined (reading 'render')`.

- [ ] **Step 3: The ranking**

In `src/core/srs.js`:

````diff
@@ -207,4 +227,25 @@ NL.srs = (function () {
   }
 
+  /* ---------------- ce qui résiste ---------------- */
+  /* Chaque réponse est enregistrée depuis le premier jour, et aucun écran ne
+     l'avait jamais relue. Les éléments sont classés par nombre de réponses
+     fausses sur les deux derniers mois, le plus raté d'abord. Un élément
+     toujours réussi n'y figure pas ; une réponse qui nomme un élément disparu
+     du cours est ignorée plutôt que de casser l'écran. */
+  const MISS_WINDOW = 62 * DAY;
+  function mistakes(now) {
+    now = now || Date.now();
+    const by = new Map();
+    NL.state.logs().forEach(l => {
+      if (!l || !l.id || l.t < now - MISS_WINDOW) return;
+      const item = NL.content.byId(l.id);
+      if (!item) return;
+      const x = by.get(l.id) || { item, wrong: 0, right: 0, last: 0 };
+      if (l.ok) x.right++; else { x.wrong++; x.last = Math.max(x.last, l.t); }
+      by.set(l.id, x);
+    });
+    return [...by.values()].filter(x => x.wrong > 0).sort((a, b) => b.wrong - a.wrong || b.last - a.last);
+  }
+
   /* ---------------- budget quotidien ---------------- */
   /* Le seul mécanisme qui empêche la dette de révisions de transformer le mois six
````

and add `mistakes` to the export list, after `unitSpan`.

- [ ] **Step 4: The screen**

Create `src/ui/mistakes.js`:

````js
/* Ce qui résiste : les éléments le plus souvent ratés, et une séance pour les
   attaquer. Tout vient du journal des réponses, enregistré depuis le premier
   jour et qu'aucun écran n'avait jamais relu. */
NL.screens.fouten = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;
  const SHOWN = 40;

  function render() {
    const list = NL.srs.mistakes();
    let html = '<div class="wrap">' +
      '<section class="card lead slim"><span class="eyebrow">' + t.missEyebrow + '</span>' +
      '<h1>' + (list.length ? t.missTitle(list.length) : t.missEyebrow) + '</h1>' +
      '<p>' + (list.length ? t.missBody : t.missNone) + '</p>' +
      (list.length ? '<button class="btn btn-primary" data-act="start">' +
        t.missStart(Math.min(list.length, NL.srs.MAX_TASKS)) + '</button>' : '') +
      '</section>';

    list.slice(0, SHOWN).forEach(x => {
      const it = x.item;
      html += '<div class="vrow">' +
        '<button class="speaker tiny" data-say="' + esc(U.bare(it.nl)) + '" aria-label="' + t.listen + '">' + NL.ex.ICON.speaker(17) + '</button>' +
        '<span class="v-nl">' + (it.art ? '<span class="art ' + it.art + '">' + it.art + '</span>' : '') + esc(U.bare(it.nl)) + '</span>' +
        '<span class="v-en">' + esc(U.bareFr(it.fr)) + '</span>' +
        '<span class="muted small">' + t.missRow(x.wrong, x.wrong + x.right) + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  return {
    render,
    click(el, d) {
      if (d.act !== 'start') return;
      if (NL.screens.sessie.begin('fouten')) NL.ui.go('sessie');
    }
  };
})();
````

In `build.sh`, add `src/ui/mistakes.js` to `SRC` on the line after `src/ui/library.js`.

- [ ] **Step 5: The session on those items, and the ways in**

In `src/ui/session.js`, replace:

````js
    if (source === 'defi') return startDefi();
    /* Ce que la séance contient
````

with:

````js
    if (source === 'defi') return startDefi();
    if (source === 'fouten') return startMistakes();
    /* Ce que la séance contient
````

In `src/ui/session.js`, replace:

````js
  /* Le rappel d'une rencontre se construit quand son tour arrive
````

with:

````js
  /* Une séance sur ce qui résiste : les éléments le plus souvent ratés, chacun à
     l'échelon où il se trouve. Comme le défi, elle ne compte pas dans le budget
     du jour qu'elle n'a pas à attendre, et ses réponses sont de vraies révisions. */
  function startMistakes() {
    const items = NL.srs.mistakes().slice(0, MAX_TASKS).map(x => x.item);
    const queue = spread(build(items, []), NL.state.meta().lastEx || null);
    if (!queue.length) { L = null; return false; }
    L = Object.assign(blankTurn(), {
      source: 'fouten', queue, at: 0, cap: queue.length + 6,
      phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
      newCount: 0, combo: 0, bestCombo: 0, lives: null
    });
    return true;
  }

  /* Le rappel d'une rencontre se construit quand son tour arrive
````

In `src/ui/shell.js`, add `'fouten'` to `UNDER_MEER`:

````js
  const UNDER_MEER = ['woorden', 'spiek', 'register', 'klanken', 'doctor', 'dehet', 'fouten'];
````

In `src/ui/home.js`, on the **Plus** screen, add a tile after the `woorden` tile:

````js
        tile('\u{1F3AF}', t.missEyebrow, t.missTile(NL.srs.mistakes().length), 'go', 'fouten') +
````

In `src/ui/library.js`:

````diff
@@ -18,7 +18,10 @@
       const seen = all.filter(it => NL.srs.stageOf(it) >= 0 || it.unit === 'eigen');
       const q = U.norm(query);
+      /* « Fragile » veut dire raté, pas récent : un mot rencontré hier est sur un
+         échelon bas et n'a rien de fragile. */
+      const missed = new Set(NL.srs.mistakes().map(x => x.item.id));
       let list = (filter === 'eigen' ? all.filter(it => it.unit === 'eigen')
-        : filter === 'zwak' ? seen.filter(it => NL.srs.stageOf(it) < 3)
-          : filter === 'sterk' ? seen.filter(it => NL.srs.stageOf(it) >= NL.srs.GRADUATED)
+        : filter === 'zwak' ? seen.filter(it => missed.has(it.id))
+          : filter === 'sterk' ? seen.filter(it => NL.srs.stageOf(it) >= NL.srs.PRODUCE)
             : seen);
       if (q) list = all.filter(it => U.norm(it.nl).indexOf(q) >= 0 || U.norm(it.fr).indexOf(q) >= 0 || (it.be && U.norm(it.be).indexOf(q) >= 0));
````

(the `PRODUCE` line in that hunk was already changed in Task 7).

In `src/core/fr.js`, after the `wordsTile` line:

````js
  /* --- ce qui résiste --- */
  missEyebrow: 'Ce qui résiste',
  missTitle: n => n === 1 ? 'Un élément te résiste' : n + ' éléments te résistent',
  missBody: 'Classés par nombre de réponses fausses sur les deux derniers mois, le plus raté d’abord. Une séance ici les attaque directement, sans attendre qu’ils reviennent.',
  missNone: 'Rien ne te résiste pour l’instant : aucune réponse fausse sur les deux derniers mois.',
  missTile: n => n === 0 ? 'Rien pour l’instant' : n === 1 ? 'Un élément souvent raté' : n + ' éléments souvent ratés',
  missRow: (wrong, total) => 'raté ' + wrong + ' fois sur ' + total,
  missStart: n => n === 1 ? 'Travailler cet élément' : 'Travailler les ' + n + ' plus ratés',
````

- [ ] **Step 6: The suites that list every screen**

In `test/sim.js`:

````diff
@@ -50,5 +18,5 @@ NL.state.open().then(() => {
 
   console.log('SCREENS');
-  ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor']
+  ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor', 'fouten']
     .forEach(r => {
       try {
````

and in `test/journey.js`, add `'fouten'` to the list in section 2 and change the count beside it from 11 to 12.

- [ ] **Step 7: Run and commit**

Run: `node test/screens.js "$(pwd)" && sh test/run-all.sh`
Expected: `classés du plus raté au moins raté, séance sur ces éléments, filtre « fragiles » aligné`, and the suite passes.

````bash
sh build.sh
git add src build.sh test index.html artifact.html
git commit -m "feat: a screen for what you keep getting wrong, and a session on exactly those items"
````

---

### Task 9b: « Je ne peux pas parler »: a session without its spoken exercises, and a way past a recogniser that will not hear

Added on 12 October 2026 with Task 5b. Since that task a session holds spoken exercises from the first week, and the learner cannot always talk where he studies. Until now there were two ways past a spoken exercise: answer it, or skip it, and skipping is a wrong answer.

This task puts one button on the spoken exercise. One tap takes every spoken exercise still to come out of that session. The items concerned are not graded and use none of the day's budget. They stay due and come back as spoken exercises in the next session, and in the one after, until they have been said: Task 5b's rule sees to that, because they still have never been said. `NL.srs.compose()` fills their places with other due items, leaving out those whose next exercise can only be spoken, so a session without speaking is not a shorter one. Nothing is stored: the next session asks again.

It is not a setting, for two reasons. Settings travel between devices, and the phone on a train is not the desktop at home. And a setting left off would bring back, without a word, the fault Task 5b removes.

The same task gives a way past a recogniser that will not hear. After three refused tries the exercise offers the two buttons it already shows where there is no recogniser: said it, or not yet. Without that, an item the recogniser cannot hear would be asked aloud every day and never climb.

Measured with one session a day, 85 answers right in 100, and one session in five in a place where the learner cannot talk: the typical item is first asked aloud on day 28, against day 25 when he can always talk; an exercise put off waits one day, two at most; a session with a tap holds as many exercises as any other. Two limits were measured and accepted. A full week without talking leaves the count of items the learner can produce standing still for that week, because items never yet said wait on rung 3, and is absorbed in about five sessions. Two full weeks, at the moment the backlog is highest, are followed by six sessions that are entirely spoken.

**Files:**
- Modify: `src/core/srs.js`, `src/ui/session.js`, `src/ex/index.js`, `src/core/fr.js`, `test/lib/answer.js`, `test/engine.js`, `test/screens.js`, `test/journey.js`, `test/pace.js`, `test/run-all.sh`, `TESTING.md`

**Interfaces:**
- Consumes: Task 5b's rule that an item never said is asked aloud; `NL.srs.compose` (Task 3); the mistakes session (Task 9).
- Produces: `NL.srs.needsVoice(item)`, true when the item's next exercise can only be spoken. `NL.srs.exerciseFor(item, avoid, quiet)`. `NL.srs.compose(source, now, { quiet, without })`, where `without` is a `Set` of item ids. In the session, a click that carries `data-quiet`; the flag `quiet` lives in the running session and nowhere else.
- Produces: `require('./lib/answer')(B).cantSpeak()`; `node test/pace.js <root> <days> one quiet`, a third learner; the strings `cantSpeak` and `quietOnly`.

- [ ] **Step 1: Teach the test helper the button, and write the failing tests**

In `test/lib/answer.js`, replace:

````js
     answer.next();    « Continuer »                                            */
````

with:

````js
     answer.next();    « Continuer »
     answer.cantSpeak();  « Je ne peux pas parler », sur un exercice à voix haute  */
````

In `test/lib/answer.js`, replace:

````js
  const next = wasMatch => { if (!wasMatch) click({ next: '1' }); };

  return { right, wrong, next, click, type };
````

with:

````js
  const next = wasMatch => { if (!wasMatch) click({ next: '1' }); };
  const cantSpeak = () => { const c = S.peek(); if (!c || c.ex !== 'speak') return false; click({ quiet: '1' }); return true; };

  return { right, wrong, next, cantSpeak, click, type };
````

In `test/engine.js`, insert before the final `console.log`:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nJE NE PEUX PAS PARLER — la séance continue, sans rien à voix haute');
  {
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    /* Huit éléments jamais dits, à l'échelon qui demande de les dire, et une
       cinquantaine d'autres qui n'ont rien à dire. Tous dus. */
    const voice = words.slice(0, 8), other = words.slice(8, 60);
    fresh();
    voice.forEach(it => put(it, 3, T0 - 2 * DAY));
    other.forEach(it => put(it, 2, T0 - DAY));
    const kept = () => JSON.stringify(voice.map(it => NL.state.rec(it.id)));
    const size = () => Number((S.render().match(/class="pill">\d+\/(\d+)</) || [0, 0])[1]);

    ok(voice.every(it => NL.srs.needsVoice(it)) && !other.some(it => NL.srs.needsVoice(it)), 'needsVoice() does not tell the items that can only be spoken from the others');
    const without = NL.srs.compose('vandaag', undefined, { quiet: true }).due;
    ok(without.length > 0 && !without.some(it => NL.srs.needsVoice(it)), 'a session composed without speaking still holds ' + without.filter(it => NL.srs.needsVoice(it)).length + ' item(s) that can only be spoken');

    ok(S.begin('vandaag'), 'the session did not start');
    let guard = 0;
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: the session holds no spoken exercise');
    const before = kept(), left = NL.srs.budgetLeft(), held = size();

    ok(answer.cantSpeak(), 'a spoken exercise cannot be put off');
    ok(kept() === before, 'putting a spoken exercise off changed a stored record');
    ok(NL.srs.budgetLeft() === left, 'putting a spoken exercise off spent ' + (left - NL.srs.budgetLeft()) + ' of the day budget');
    ok(size() === held, 'the session went from ' + held + ' exercises to ' + size() + ' although other items were due');

    /* La suite de la séance : rien à voix haute, et aucun des éléments mis de côté. */
    const rest = [];
    guard = 0;
    while (S.peek() && guard++ < 80) {
      const c = S.peek(), m = c.ex === 'match';
      rest.push({ ex: c.ex, id: c.items[0].id });
      B.clock.advance(20000); answer.right(); answer.next(m);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(rest.length > 0 && !rest.some(x => x.ex === 'speak'), rest.filter(x => x.ex === 'speak').length + ' spoken exercise(s) were served after « je ne peux pas parler »');
    ok(!rest.some(x => voice.some(it => it.id === x.id)), 'an item put off came back in the same session');
    ok(kept() === before, 'an item put off was graded before the session ended');

    /* La séance suivante : ils reviennent, et à voix haute. */
    B.clock.advance(DAY);
    NL.state.touchDay();
    const back = play().filter(x => !x.retry && voice.some(it => it.id === x.id));
    ok(back.length === voice.length, 'of ' + voice.length + ' items put off, ' + back.length + ' came back in the next session');
    ok(back.every(x => x.ex === 'speak'), back.filter(x => x.ex !== 'speak').length + ' item(s) put off came back as something other than a spoken exercise');
    console.log('  ' + voice.length + ' exercices parlés mis de côté : rien de noté, budget intact, séance toujours de ' + held + ' exercices ; le lendemain les ' + back.length + ' reviennent à voix haute');

    /* Il ne reste que du parlé : la séance s'arrête là, sans bilan et sans journée comptée. */
    fresh();
    const all = NL.content.allItems();
    all.forEach((it, i) => put(it, 5, i < 5 ? T0 - DAY : T0 + 30 * DAY));
    ok(S.begin('vandaag') && S.peek().ex === 'speak', 'the fixture is wrong: the session should hold only spoken exercises');
    const streak = NL.state.meta().streak;
    answer.cantSpeak();
    ok(!S.peek() && NL.ui.route === 'vandaag', 'with only spoken exercises left, « je ne peux pas parler » does not close the session');
    ok(B.app.innerHTML.indexOf('done-stage') < 0 && NL.state.meta().streak === streak, 'a session in which nothing was answered is summed up, or counted as a day');
    fresh(); NL.ui.go('sessie'); S.abandon();

    /* La séance sur les fautes est une liste fixe : le parlé en sort, rien n'y entre. */
    fresh();
    const [a, b, c] = words;
    put(a, 3, T0 + 5 * DAY); put(b, 3, T0 + 5 * DAY); put(c, 2, T0 + 5 * DAY);
    other.slice(0, 20).forEach(it => put(it, 2, T0 - DAY));
    [a, b, c].forEach(it => NL.state.logReview({ id: it.id, t: T0 - DAY, ok: false, stage: 1, kind: it.kind, ex: 'type' }));
    ok(S.begin('fouten'), 'the mistakes session did not start');
    const fixed = [];
    guard = 0;
    while (S.peek() && guard++ < 20) {
      if (S.peek().ex === 'speak') { answer.cantSpeak(); continue; }
      fixed.push(S.peek().items[0].id);
      answer.right(); answer.next(false);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(fixed.length === 1 && fixed[0] === c.id, 'after « je ne peux pas parler » the mistakes session served ' + JSON.stringify(fixed) + ' instead of its one item that is not spoken');
    console.log('  rien que du parlé : retour à l’accueil sans bilan ; séance sur les fautes : le parlé en sort, rien n’y entre');
  }
````

In `test/screens.js`, insert before the final `console.log`:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nÀ VOIX HAUTE — le bouton « ' + t.cantSpeak + ' »');
  {
    fresh();
    const words = all.filter(it => it.kind !== 'pattern' && !it.cognate);
    words.slice(0, 4).forEach(it => put(it, 3, T0 - 2 * DAY));      // jamais dits : à dire
    words.slice(4, 30).forEach(it => put(it, 2, T0 - DAY));         // rien à dire
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    let guard = 0, stray = 0, asked = 0;
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) {
      const wasMatch = S.peek().ex === 'match';
      asked++;
      if (S.render().indexOf('data-quiet') >= 0) stray++;
      answer.right(); answer.next(wasMatch);
    }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: the session holds no spoken exercise');
    ok(stray === 0, stray + ' of ' + asked + ' exercises that are not spoken carry the button');
    const q = read('sessie/speak', S.render(), 'question');
    ok(S.render().indexOf('data-quiet="1"') >= 0 && q.indexOf(t.cantSpeak) >= 0, 'the spoken exercise does not offer « ' + t.cantSpeak + ' »');

    /* Une fois la réponse donnée, c'est une réponse : le bouton s'en va. */
    answer.click({ self: '1' });
    ok(S.render().indexOf('data-quiet') < 0, 'the button is still offered after the answer was given');
    answer.click({ check: '1' }); answer.next(false);

    /* Appuyé : l'écran suivant se lit, et il n'y a plus rien à voix haute. */
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 120) { const wasMatch = S.peek().ex === 'match'; answer.right(); answer.next(wasMatch); }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: no second spoken exercise');
    ok(answer.cantSpeak(), 'the button does nothing');
    if (S.peek()) read('sessie/' + S.peek().ex, S.render(), 'sans parler');
    let spoken = 0;
    while (S.peek() && guard++ < 200) { const wasMatch = S.peek().ex === 'match'; if (S.peek().ex === 'speak') spoken++; answer.right(); answer.next(wasMatch); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    ok(spoken === 0, spoken + ' spoken exercise(s) after the button was pressed');
    S.abandon();
    console.log('  présent sur l’exercice parlé, absent des ' + asked + ' autres, retiré une fois la réponse donnée ; appuyé : plus rien à voix haute');
  }
````

In `test/journey.js`, insert before the final `console.log`:

````js
  /* ---------------------------------------------------------- 15. the recogniser refuses three times */
  head('15. The recogniser refuses three times');
  if (noRecogniser) {
    console.log('   skipped: no recogniser here, a spoken exercise is already self-rated');
  } else {
    NL.state.clearAll(); NL.content.refresh();
    /* Everything met and not due, except one word on the rung that asks for it aloud. */
    NL.content.allItems().forEach(it => NL.srs.seed(it, 2));
    const word = NL.content.allItems().find(it => it.kind === 'word' && !it.cognate);
    NL.srs.seed(word, 3);
    const due = NL.state.rec(word.id); due.due = 0; NL.state.setRec(due);
    ok(S.begin('vandaag') && S.peek().ex === 'speak', 'a never-said item on rung 3 is not asked aloud');
    for (let k = 0; k < 3; k++) {
      ok(S.render().indexOf('data-self=') < 0, 'self-rating offered after ' + k + ' refusal(s), before the third');
      ctx.__saidNext = 'iets heel anders';
      tap('sessie', { mic: 'start' });
    }
    ok(S.render().indexOf('data-self="1"') >= 0, 'after three refusals there is still no way to say « ' + NL.t.micSaidIt + ' »');
    tap('sessie', { self: '1' });
    tap('sessie', { check: '1' });
    ok(S.render().indexOf('foot ok') >= 0, 'rating yourself right after three refusals is counted as wrong');
    const now = NL.state.rec(word.id);
    ok(now.said === true && now.stage === 4, 'the item should be said and on rung 4: it is said ' + now.said + ', on rung ' + now.stage);
    S.abandon();
    console.log('   three refusals, then « ' + NL.t.micSaidIt + ' » is offered and counts');
  }
````

In `test/pace.js`, replace:

````js
const ONE_A_DAY = process.argv[4] === 'one';
````

with:

````js
const ONE_A_DAY = process.argv[4] === 'one';
/* Un troisième : une séance sur cinq se passe là où l'on ne peut pas parler. */
const QUIET = process.argv[5] === 'quiet';
````

In `test/pace.js`, replace:

````js
  let backToBack = 0, prevEx = null, exhausted = null, maxBacklog = 0, tasks = 0, lateRecog = 0;
````

with:

````js
  let backToBack = 0, prevEx = null, exhausted = null, maxBacklog = 0, tasks = 0, lateRecog = 0;
  const owed = {};
  let sessions = 0, taps = 0, touched = 0, spokeAfter = 0, detour = 0;
````

In `test/pace.js`, replace:

````js
      let n = 0;
      while (S.peek() && n++ < 80) {
        const c = S.peek(), wasMatch = c.ex === 'match';
````

with:

````js
      let n = 0;
      const cantTalk = QUIET && ++sessions % 5 === 0;
      let tapped = false;
      while (S.peek() && n++ < 80) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        /* Là où l'on ne peut pas parler : « je ne peux pas parler » au premier
           exercice à voix haute, et la séance continue sans. */
        if (c.ex === 'speak' && tapped) spokeAfter++;
        if (c.ex === 'speak' && cantTalk && !tapped) {
          const it = c.items[0], before = JSON.stringify(NL.state.rec(it.id)), left = NL.srs.budgetLeft();
          if (NL.srs.needsVoice(it)) owed[it.id] = true;
          answer.cantSpeak();
          tapped = true; taps++;
          if (JSON.stringify(NL.state.rec(it.id)) !== before || NL.srs.budgetLeft() !== left) touched++;
          continue;
        }
        /* Ce qui a été mis de côté revient à voix haute, pas autrement. */
        if (!wasMatch && owed[c.items[0].id]) { if (c.ex !== 'speak') detour++; delete owed[c.items[0].id]; }
````

In `test/pace.js`, insert before the line that begins `ok(over.length === 0, `:

````js
  /* L'apprenant qui ne peut pas toujours parler : mettre de côté ne coûte rien,
     ne laisse rien passer à voix haute, et ne fait rien sauter. */
  if (QUIET) {
    ok(taps > 0, 'aucune séance sans parler n’a rencontré d’exercice à voix haute : la simulation ne vérifie rien');
    ok(touched === 0, touched + ' « je ne peux pas parler » ont modifié un enregistrement ou entamé le budget du jour');
    ok(spokeAfter === 0, spokeAfter + ' exercice(s) à voix haute servis après « je ne peux pas parler »');
    ok(detour === 0, detour + ' élément(s) mis de côté sont revenus autrement qu’à voix haute');
    P('séances sans parler', taps + ' : rien de noté, rien à voix haute ensuite, tout revient à voix haute');
  }
````

- [ ] **Step 2: Run them and watch them fail**

Run: `node test/engine.js "$(pwd)"; node test/screens.js "$(pwd)"; node test/journey.js "$(pwd)" nl-BE EDG; node test/pace.js "$(pwd)" 200 one quiet`

Expected, as measured on the end state of this plan with this task's tests added and its changes under `src/` left out:

- `test/engine.js`: `CRASH TypeError: NL.srs.needsVoice is not a function`, right after the heading `JE NE PEUX PAS PARLER`.
- `test/screens.js`: `FAIL: the spoken exercise does not offer « undefined »` and `FAIL: 3 spoken exercise(s) after the button was pressed`.
- `test/journey.js`: `✗ after three refusals there is still no way to say « Je l’ai dit »`.
- `test/pace.js`: `BOOT FAIL: TypeError: NL.srs.needsVoice is not a function`.

- [ ] **Step 3: Let the engine tell what can only be spoken, and compose a session without it**

In `src/core/srs.js`, replace:

````js
  /* `avoid` = les types déjà servis dans cette séance. Le gouverneur évite ce que
     l'élément a eu la dernière fois, puis ce qui vient de passer. */
  function exerciseFor(item, avoid) {
````

with:

````js
  /* `avoid` = les types déjà servis dans cette séance. Le gouverneur évite ce que
     l'élément a eu la dernière fois, puis ce qui vient de passer.
     `quiet` = une séance où l'on ne peut pas parler : rien à voix haute. */
  function exerciseFor(item, avoid, quiet) {
````

In `src/core/srs.js`, replace:

````js
    let usable = set.filter(n => supports(item, n));
    if (!usable.length) usable = [fallback(item)];
````

with:

````js
    let usable = set.filter(n => supports(item, n));
    if (quiet) usable = usable.filter(n => n !== 'speak');
    if (!usable.length) usable = [fallback(item)];
````

In `src/core/srs.js`, replace:

````js
  const fallback = item => (NL.util.tiles(item.nl || '').length >= 3 ? 'type' : 'pick');
````

with:

````js
  const fallback = item => (NL.util.tiles(item.nl || '').length >= 3 ? 'type' : 'pick');

  /* Vrai quand le prochain exercice de l'élément ne peut être que parlé : son
     échelon n'offre rien d'autre, ou bien il n'a jamais été dit et son échelon
     propose de le dire. Une séance où l'on ne peut pas parler laisse ces
     éléments attendre plutôt que de leur donner autre chose. */
  function needsVoice(item) {
    const r = recOf(item);
    const usable = ((RUNGS[item.kind] || RUNGS.word)[clamp(r.stage, 0, 6)] || []).filter(n => supports(item, n));
    return usable.indexOf('speak') >= 0 && (!r.said || usable.length === 1);
  }
````

In `src/core/srs.js`, replace:

````js
       source   'vandaag' (défaut) ou l'identifiant d'une unité
       → { due, fresh, left }   deux listes d'éléments, et le budget restant */
  function compose(source, now) {
````

with:

````js
       source   'vandaag' (défaut) ou l'identifiant d'une unité
       opts     { quiet, without } : une séance où l'on ne peut pas parler laisse
                attendre ce qui ne peut être que dit, et ne reprend pas les
                éléments (`without`, un Set d'identifiants) qu'elle contient déjà
       → { due, fresh, left }   deux listes d'éléments, et le budget restant */
  function compose(source, now, opts) {
````

In `src/core/srs.js`, replace:

````js
    if (uid) due = due.filter(it => it.unit === uid);
````

with:

````js
    if (uid) due = due.filter(it => it.unit === uid);
    if (opts && opts.quiet) due = due.filter(it => !needsVoice(it) && !(opts.without && opts.without.has(it.id)));
````

In `src/core/srs.js`, replace:

````js
maxRung, pace, exerciseFor, supports,
````

with:

````js
maxRung, pace, exerciseFor, needsVoice, supports,
````

- [ ] **Step 4: The tap, in the session**

In `src/ui/session.js`, replace:

````js
  function build(items, recent) {
    const out = [];
    items.forEach(it => {
      const name = NL.srs.exerciseFor(it, new Set(recent));
````

with:

````js
  function build(items, recent, quiet) {
    const out = [];
    items.forEach(it => {
      const name = NL.srs.exerciseFor(it, new Set(recent), quiet);
````

In `src/ui/session.js`, replace:

````js
name = NL.srs.exerciseFor(L.queue[L.at].items[0], avoid);
````

with:

````js
name = NL.srs.exerciseFor(L.queue[L.at].items[0], avoid, L.quiet);
````

In `src/ui/session.js`, replace:

````js
const n = NL.srs.exerciseFor(L.queue[j].items[0], avoid);
````

with:

````js
const n = NL.srs.exerciseFor(L.queue[j].items[0], avoid, L.quiet);
````

In `src/ui/session.js`, insert before the line that begins `const cur = () => L &&`:

````js
  /* « Je ne peux pas parler » : plus rien à voix haute jusqu'à la fin de la
     séance. Les exercices parlés qui restaient sont retirés sans être notés et
     sans rien prendre au budget du jour : leurs éléments restent dus, et
     reviendront à voix haute à la séance suivante. D'autres éléments dus
     prennent leur place, choisis par compose() comme pour toute séance. Rien
     n'est retenu au-delà : la séance suivante redemande. Ce n'est pas un
     réglage, parce qu'un réglage suit l'appareil et s'oublie éteint. */
  function quiet() {
    const c = cur();
    if (!c || c.ex !== 'speak' || L.phase !== 'ask') return;
    NL.speech.abort(); NL.speech.clearRecording();
    L.quiet = true;
    const head = L.queue.slice(0, L.at), rest = L.queue.slice(L.at);
    const kept = rest.filter(x => x.ex !== 'speak');
    /* Les séances à liste fixe, les fautes et le défi, ne se complètent pas. */
    let more = [];
    if (L.source !== 'fouten' && L.source !== 'defi') {
      const here = new Set();
      L.queue.forEach(x => x.items.forEach(it => here.add(it.id)));
      more = NL.srs.compose(L.source, undefined, { quiet: true, without: here }).due.slice(0, rest.length - kept.length);
    }
    L.queue = head.concat(kept, spread(build(more, [], true), kept.length ? kept[kept.length - 1].ex : null));
    L.queue.forEach(x => { if (x.recall) x.metAt = L.queue.findIndex(y => !y.recall && y.ex !== 'match' && y.items[0] === x.items[0]); });
    Object.assign(L, blankTurn());
    L.phase = 'ask';
    /* Il ne restait que du parlé, et rien n'a encore été répondu : il n'y a pas
       de séance à conclure, ni de journée à compter. */
    if (L.at >= L.queue.length && L.right + L.wrong === 0) { L = null; NL.ui.go('vandaag'); NL.ui.toast(NL.t.quietOnly); return; }
    if (L.at >= L.queue.length) return finish();
    arm();
    if (L.at >= L.queue.length) return finish();
    NL.ui.render();
    autoplay();
  }
````

In `src/ui/session.js`, replace:

````js
    if (d.skip !== undefined) return skip();
````

with:

````js
    if (d.skip !== undefined) return skip();
    if (d.quiet !== undefined) return quiet();
````

The mistakes session and the challenge are fixed lists, so nothing is brought in to replace what the tap removes there. The challenge holds no spoken exercise in any case.

- [ ] **Step 5: The button, and the way past the recogniser**

In `src/ex/index.js`, replace:

````js
          (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
          '</div>';
````

with:

````js
          (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
          /* Trois refus : le micro n'entend peut-être simplement pas ce mot-là.
             Sans cette issue, l'élément serait redemandé chaque jour sans jamais monter. */
          (!sp.ok && sp.tries >= 3 ? selfRate(sp) : '') +
          '</div>';
````

In `src/ex/index.js`, replace:

````js
      return '<div class="sentence prompt">' + esc(t.target) + flemish(t.item.be, t.target) + '</div>' +
        '<div class="gloss-line">' + esc(t.prompt) + '</div>' +
        speakerRow(t.target, {}) + panel;
    },
    ready(t, L) {
      const sp = L.speech;
      return sp.phase === 'done' || sp.selfRated != null;
````

with:

````js
      /* « Je ne peux pas parler » : proposé tant que rien n'a été tenté. Une fois
         la réponse donnée, c'est une réponse. */
      const untried = phase === 'ask' && sp.selfRated == null && sp.phase !== 'done' && sp.phase !== 'listening' &&
        sp.recState !== 'rec' && sp.recState !== 'done';
      const hush = untried ? '<div class="mic-actions"><button class="btn btn-ghost" data-quiet="1">' + NL.t.cantSpeak + '</button></div>' : '';

      return '<div class="sentence prompt">' + esc(t.target) + flemish(t.item.be, t.target) + '</div>' +
        '<div class="gloss-line">' + esc(t.prompt) + '</div>' +
        speakerRow(t.target, {}) + panel + hush;
    },
    ready(t, L) {
      const sp = L.speech;
      return sp.phase === 'done' || sp.selfRated != null;
````

In `src/core/fr.js`, replace:

````js
  micNotYet: 'Pas encore',
````

with:

````js
  micNotYet: 'Pas encore',
  cantSpeak: 'Je ne peux pas parler',
  quietOnly: 'Il ne reste que des exercices à voix haute. Ils t’attendent à la prochaine séance.',
````

The button reuses the classes `mic-actions` and `btn-ghost`: `styles.css` does not change. It is offered until an answer has been attempted, and not after: once the learner has tried, it is an answer.

- [ ] **Step 6: List the third learner**

In `test/run-all.sh`, replace:

````sh
# Deux apprenants : celui qui épuise le budget du jour, et celui qui ne fait
# qu'une séance. Le défaut d'octobre ne se voyait que chez le second.
node test/pace.js "$ROOT" "${PACE_DAYS:-200}"
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one
````

with:

````sh
# Trois apprenants : celui qui épuise le budget du jour, celui qui ne fait
# qu'une séance, et celui qui, une séance sur cinq, ne peut pas parler. Le
# défaut d'octobre ne se voyait que chez le deuxième.
node test/pace.js "$ROOT" "${PACE_DAYS:-200}"
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one quiet
````

In `TESTING.md`, in the table, replace the `pace.js` row with:

````md
| `pace.js` | 200 jours simulés, pour trois apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste, un élément du premier jour demandé à voix haute en dix jours et jamais après trois semaines, et « je ne peux pas parler » qui ne note rien, ne coûte rien et ne fait rien sauter. L’horloge avance pendant la journée |
````

- [ ] **Step 7: Run and commit**

Run: `node test/engine.js "$(pwd)" && node test/screens.js "$(pwd)" && node test/journey.js "$(pwd)" nl-BE EDG && sh test/run-all.sh`

Expected:

- `test/engine.js`: `8 exercices parlés mis de côté : rien de noté, budget intact, séance toujours de 30 exercices ; le lendemain les 8 reviennent à voix haute`, then `rien que du parlé : retour à l’accueil sans bilan ; séance sur les fautes : le parlé en sort, rien n’y entre`.
- `test/screens.js`: `présent sur l’exercice parlé, absent des 11 autres, retiré une fois la réponse donnée ; appuyé : plus rien à voix haute`.
- `test/journey.js`: `three refusals, then « Je l’ai dit » is offered and counts`. Under Opera and on the iPhone outside Safari it prints `skipped: no recogniser here, a spoken exercise is already self-rated`.
- the third learner of the simulation: `séances sans parler  37 : rien de noté, rien à voix haute ensuite, tout revient à voix haute`, ending `12 vérifications, AUCUN PROBLÈME`.

Then the suite passes.

````bash
sh build.sh
git add src test/lib/answer.js test/engine.js test/screens.js test/journey.js test/pace.js test/run-all.sh TESTING.md index.html artifact.html
git commit -m "feat: « je ne peux pas parler » takes the spoken exercises out of a session, at no cost"
````

---

### Task 10: Content guards, and a build that cannot go stale

Four mechanical checks on the course, run with every change, and one on the committed build. Where today's content already breaks a rule, the guard states a budget that may only ever go down.

The spelling guard found a real error while this plan was being written: `tweeenveertig` in a grammar drill, which should be `tweeënveertig`. The fix is part of this task.

**Files:**
- Create: `test/content.js`, `test/tools/build-wordlist.js`, `test/data/nl-words.txt.gz`
- Modify: `src/content/grammar.js`, `test/run-all.sh`, `TESTING.md`, `ATTRIBUTION.md`

**Interfaces:**
- Consumes: `test/lib/browser.js`.
- Produces: nothing other code depends on. Budgets in `test/content.js`: `AHEAD_BUDGET = 62`, `DUPE_BUDGET = 9`, `HOLLOW_BUDGET = 4`. Each fails when the count rises **and** when it falls, so an improvement has to be locked in by lowering the number.

- [ ] **Step 1: Build the word list**

Create `test/tools/build-wordlist.js`:

````js
/* Construit la liste de formes néerlandaises que `test/content.js` consulte pour
   l'orthographe.

   On n'en tire que des FAITS — une forme existe, ou non — et jamais une
   définition : la liste n'impose donc aucune licence au dépôt. (Voir
   ATTRIBUTION.md.)

     node test/tools/build-wordlist.js

   Télécharge la liste d'OpenTaal (414 000 formes, flexions comprises), la met en
   minuscules, la trie et la compresse : 1,4 Mo versionné au lieu de 5. Elle ne
   se régénère que si le cours emploie un mot que le test ne connaît pas encore. */
const fs = require('fs'), path = require('path'), zlib = require('zlib'), https = require('https');
const SOURCE = 'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt';
const OUT = path.join(__dirname, '..', 'data', 'nl-words.txt.gz');

https.get(SOURCE, res => {
  if (res.statusCode !== 200) { console.log('FAIL: ' + SOURCE + ' → ' + res.statusCode); process.exit(1); }
  const chunks = [];
  res.on('data', c => chunks.push(c)).on('end', () => {
    const words = new Set();
    Buffer.concat(chunks).toString('utf8').split(/\r?\n/).forEach(w => { w = w.trim().toLowerCase(); if (w) words.add(w); });
    const sorted = [...words].sort();
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, zlib.gzipSync(Buffer.from(sorted.join('\n'), 'utf8'), { level: 9 }));
    console.log('formes : ' + sorted.length);
    console.log('écrit  : ' + OUT + '  (' + Math.round(fs.statSync(OUT).size / 1024) + ' Ko)');
  });
}).on('error', e => { console.log('FAIL: ' + e.message); process.exit(1); });
````

Run: `node test/tools/build-wordlist.js`
Expected: `formes : 409487` and about 1.3 MB written to `test/data/nl-words.txt.gz`.

- [ ] **Step 2: Write the guards**

Create `test/content.js`:

````js
/* Quatre contrôles mécaniques sur le contenu. Le cours va être multiplié par dix
   et il n'y a pas de relecteur néerlandophone : tout ce qu'une machine peut
   vérifier, elle le vérifie, à chaque changement.

   Ce que ces contrôles NE voient PAS : l'idiome, le registre, l'ordre des mots,
   si une phrase vaut la peine d'être apprise, et l'article devant un autre nom
   que le mot drillé. Voir TESTING.md. */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const browser = require('./lib/browser');
const ROOT = process.argv[2] || path.join(__dirname, '..');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, skip: ['src/app.js'] });
const NL = B.NL, U = NL.util;
const tokens = s => String(s || '').toLowerCase().replace(/\{[a-z]+\}/g, ' ').split(/[^a-zà-ÿ'’-]+/)
  .map(t => t.replace(/^[-'’]+|[-'’]+$/g, '')).filter(t => t.length > 1);

NL.state.open().then(() => {
  NL.content.refresh();
  const units = NL.content.units, items = NL.content.allItems();
  console.log('CONTENU — ' + items.length + ' éléments');

  /* ======================================================== 1. orthographe */
  /* Les formes flamandes voulues, une par une, chacune avec sa raison. Sans la
     raison, cette liste devient l'endroit où l'on enterre les fautes. */
  const FLEMISH = {
    asteblieft:    'contraction parlée de « alstublieft »',
    bancontact:    'le système de paiement belge : un nom propre',
    da:            'flamand parlé pour « dat », dans « da’s »',
    hey:           'salutation flamande, pour bonjour comme pour au revoir',
    jaja:          'redoublement parlé de « ja »',
    neenee:        'redoublement parlé de « nee »',
    nie:           'flamand parlé pour « niet »',
    recyclagepark: 'belgicisme ; le nord dit « milieupark »',
    spreekte:      'forme dialectale de « spreekt ge », assumée dans la variante flamande'
  };
  const TSV = path.join(__dirname, 'data', 'nl-words.txt.gz');
  if (!fs.existsSync(TSV)) { console.log('FAIL: ' + TSV + ' est absent. Régénérer : node test/tools/build-wordlist.js'); process.exit(1); }
  const forms = new Set(zlib.gunzipSync(fs.readFileSync(TSV)).toString('utf8').split('\n'));

  const texts = [];
  units.forEach(u => {
    (u.words || []).forEach((w, i) => {
      texts.push([w.nl, u.id + ':w' + i]);
      if (w.be) texts.push([w.be, u.id + ':w' + i + ' (variante)']);
      (w.drills || []).forEach((d, j) => texts.push([d.nl, u.id + ':w' + i + ' phrase ' + (j + 1)]));
    });
    (u.phrases || []).forEach((p, i) => {
      texts.push([p.nl, u.id + ':p' + i]);
      if (p.be) texts.push([p.be, u.id + ':p' + i + ' (variante)']);
    });
  });
  (NL.content.patterns || []).forEach(g => (g.drills || []).forEach((d, j) => texts.push([d.nl, g.id + ' phrase ' + (j + 1)])));

  /* Le prénom, la commune et l'employeur par défaut ne sont pas du néerlandais. */
  const NAMES = new Set(Object.keys(NL.content.DEFAULTS).map(k => NL.content.DEFAULTS[k].toLowerCase()));
  const stem = t => t.replace(/[’']s$/, '');                                // collega’s, auto’s, da’s
  const known = t => forms.has(t) || NAMES.has(t) || forms.has(stem(t)) || !!FLEMISH[stem(t)] ||
    (t.indexOf('-') >= 0 && t.split('-').every(p => p.length < 2 || forms.has(p)));   // java-ontwikkelaar
  const unknown = new Map(), used = new Set();
  let count = 0;
  texts.forEach(([text, where]) => tokens(text).forEach(t => {
    count++;
    if (FLEMISH[stem(t)]) used.add(stem(t));
    if (!known(t) && !unknown.has(t)) unknown.set(t, where);
  }));
  unknown.forEach((where, t) => ok(false, '« ' + t + ' » n’est pas une forme néerlandaise connue   [' + where +
    '] — corriger, ou l’inscrire dans FLEMISH avec sa raison'));
  /* Une exception qui ne sert plus ne protège plus rien. */
  Object.keys(FLEMISH).forEach(t => ok(used.has(t), '« ' + t + ' » est dans FLEMISH mais plus dans le cours : retirer l’exception'));
  ok(count > 3000, 'only ' + count + ' tokens were checked: the content did not load');
  console.log('  orthographe     ' + count + ' formes vérifiées contre ' + forms.size + ', ' + unknown.size + ' inconnue(s), ' +
    Object.keys(FLEMISH).length + ' flamandes assumées');

  /* ============================== 2. tout exercice promis se construit */
  /* La séance saute en silence un élément dont l'exercice échoue : un mot peut
     donc n'être jamais drillé sans que rien ne le dise. */
  const blank = () => ({ sel: null, picked: [], input: '', matchSel: null, matchGone: [], matchBad: null, speech: { phase: 'idle', tries: 0, selfRated: null } });
  let pairs = 0, broken = 0, hollow = 0;
  items.forEach(it => {
    (NL.srs.RUNGS[it.kind] || NL.srs.RUNGS.word).forEach((rung, r) => {
      const claimed = rung.filter(n => NL.srs.supports(it, n));
      if (!claimed.length) hollow++;
      claimed.forEach(name => {
        pairs++;
        try {
          const ex = NL.ex.get(name), task = ex.build(it);
          if (!task) throw new Error('build n’a rien rendu');
          if (typeof ex.view(task, blank(), 'ask') !== 'string') throw new Error('view n’a rien rendu');
          if (!ex.answer(task)) throw new Error('aucune réponse attendue');
        } catch (e) {
          broken++;
          ok(false, 'l’échelon ' + r + ' promet « ' + name + ' » pour ' + it.id + ' « ' + it.nl + ' » et ne le construit pas : ' + e.message);
        }
      });
    });
  });
  /* Un échelon où rien n'est possible retombe sur un exercice de secours : toléré,
     mais compté, et le compte ne peut que baisser. */
  const HOLLOW_BUDGET = 4;
  ok(hollow <= HOLLOW_BUDGET, hollow + ' échelons sans aucun exercice possible, budget ' + HOLLOW_BUDGET + ' — baisser le budget, jamais le lever');
  ok(pairs > 5000, 'only ' + pairs + ' exercises were built: the content did not load');
  console.log('  exercices       ' + pairs + ' construits, ' + broken + ' échec(s), ' + hollow + ' échelon(s) de secours');

  /* ================= 3. une phrase d'exemple n'emprunte pas en avant */
  /* src/content/examples.js s'impose « du vocabulaire déjà rencontré ». Non
     vérifiée, la règle était tenue six fois sur sept. Les mots-outils ne
     comptent pas : on ne peut pas écrire une phrase sans eux. */
  const GRAMMAR = new Set(('ik ge gij je jij u hij ze zij we wij het de een is ben bent zijn was heb hebt ' +
    'heeft had kan kunt kun wil wilt moet mag ga gaat gaan doe doet niet nie geen en of maar want dat dit ' +
    'die deze er hier daar ook nog al wel te in op van met voor aan bij naar uit om over door tot me mijn ' +
    'uw zo heel veel wat wie waar hoe nu dan als zich eens even graag ja nee').split(' '));
  const firstUnit = new Map();
  units.forEach((u, ui) => (u.words || []).concat(u.phrases || []).forEach(it =>
    tokens(it.nl).forEach(t => { if (!firstUnit.has(t)) firstUnit.set(t, ui); })));
  let ahead = 0, sentences = 0;
  units.forEach((u, ui) => (u.words || []).forEach(w => (w.drills || []).forEach(d => {
    sentences++;
    if (tokens(d.nl).some(t => !GRAMMAR.has(t) && firstUnit.has(t) && firstUnit.get(t) > ui)) ahead++;
  })));
  const AHEAD_BUDGET = 62;
  ok(ahead <= AHEAD_BUDGET, ahead + ' phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget ' + AHEAD_BUDGET +
    ' — baisser le budget quand on en corrige, jamais le lever');
  ok(ahead >= AHEAD_BUDGET, 'seulement ' + ahead + ' phrases empruntent en avant : baisser AHEAD_BUDGET à ' + ahead + ' pour verrouiller le gain');
  console.log('  séquence        ' + ahead + ' / ' + sentences + ' phrases empruntent en avant (budget ' + AHEAD_BUDGET + ')');

  /* ======================================================= 4. doublons */
  /* Un élément enseigné dans deux unités est drillé deux fois en parallèle, et
     compte deux fois pour le seuil qui ouvre l'unité suivante. La phase 3 en
     fera des alias ; d'ici là, leur nombre ne peut que baisser. On compare le
     néerlandais sans casse ni ponctuation, dans un même genre d'élément —
     jamais l'identifiant, qui change dès qu'on insère un mot. */
  const seen = new Map();
  let dupes = 0;
  items.filter(it => it.unit !== 'eigen' && it.kind !== 'pattern').forEach(it => {
    const key = it.kind + '|' + U.norm(it.nl);
    if (seen.has(key)) dupes++; else seen.set(key, it.id);
  });
  const DUPE_BUDGET = 9;
  ok(dupes <= DUPE_BUDGET, dupes + ' éléments enseignés deux fois, budget ' + DUPE_BUDGET + ' — baisser le budget quand on en retire, jamais le lever');
  ok(dupes >= DUPE_BUDGET, 'seulement ' + dupes + ' doublons : baisser DUPE_BUDGET à ' + dupes + ' pour verrouiller le gain');
  console.log('  doublons        ' + dupes + ' (budget ' + DUPE_BUDGET + ')');

  console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'CONTENU CONFORME' : fails + ' ÉCHEC(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
````

- [ ] **Step 3: Run them and watch the spelling guard fail**

Run: `node test/content.js "$(pwd)"`
Expected: one failure, `« tweeenveertig » n’est pas une forme néerlandaise connue   [g-getallen phrase 2]`, and otherwise `séquence 62 / 414` and `doublons 9`.

- [ ] **Step 4: Fix the word**

In `src/content/grammar.js`:

````diff
@@ -58,5 +58,5 @@ NL.content.patterns = (function () {
       drills: [
         D('Het kost eenentwintig euro.', 'Ça coûte vingt-et-un euros.', 'eenentwintig'),
-        D('Ik ben tweeenveertig jaar.', 'J’ai quarante-deux ans.', 'tweeenveertig'),
+        D('Ik ben tweeënveertig jaar.', 'J’ai quarante-deux ans.', 'tweeënveertig'),
         D('Dat is vijfenzestig euro.', 'Ça fait soixante-cinq euros.', 'vijfenzestig'),
         D('Zij is zeventig jaar.', 'Elle a septante ans.', 'zeventig')
````

- [ ] **Step 5: Check each budget bites**

Lower `AHEAD_BUDGET` to 61 and run: expect `62 phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget 61`. Raise it to 63: expect `seulement 62 phrases empruntent en avant : baisser AHEAD_BUDGET à 62`. Restore 62. Do the same with `DUPE_BUDGET`. Then add a made-up word to any example sentence in `src/content/examples.js`, run, see it named, and remove it.

- [ ] **Step 6: List the test, and guard the committed build**

Replace `test/run-all.sh` with:

````sh
#!/bin/sh
# Toute la suite, en une commande : sh test/run-all.sh
# C'est exactement ce que lance la CI, pour qu'il n'y ait qu'une seule liste.
#   sh test/run-all.sh           build, puis tout
#   PACE_DAYS=400 sh test/run-all.sh   simulation de charge plus longue
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

sh build.sh

node test/smoke.js    "$ROOT"
node test/dehet.js    "$ROOT"
node test/content.js  "$ROOT"
node test/engine.js   "$ROOT"
node test/screens.js  "$ROOT"
node test/sim.js      "$ROOT"
node test/firstrun.js "$ROOT"
node test/sync.js     "$ROOT"

# Une voix et un navigateur par ligne : c'est là que vivent les vrais problèmes.
for c in "nl-BE OPR" "nl-NL OPR" "none OPR" "nl-BE EDG" "nl-NL EDG" "none EDG" "nl-BE IOS" "nl-BE SAF"; do
  set -- $c
  echo "--- journey $1 $2 ---"
  node test/journey.js "$ROOT" "$1" "$2"
done

# Trois apprenants : celui qui épuise le budget du jour, celui qui ne fait
# qu'une séance, et celui qui, une séance sur cinq, ne peut pas parler. Le
# défaut d'octobre ne se voyait que chez le deuxième.
node test/pace.js "$ROOT" "${PACE_DAYS:-200}"
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one quiet

# Le build versionné doit correspondre à ses sources : index.html et
# artifact.html sont ce que Vercel et l'artefact servent. En CI, un écart est
# une erreur ; en local, c'est simplement ce qu'il reste à versionner.
if ! git diff --quiet -- index.html artifact.html; then
  if [ -n "$CI" ]; then
    echo "FAIL: index.html ou artifact.html ne correspond pas à src/. Lancer « sh build.sh » et versionner les deux."
    git diff --stat -- index.html artifact.html
    exit 1
  fi
  echo "(note) index.html ou artifact.html diffère du dernier commit : à versionner avec ce changement."
fi

echo
echo "TOUTE LA SUITE EST PASSÉE"
````

GitHub Actions sets `CI`, so the last block fails there and only informs locally, where a difference just means the build is not committed yet. To see it bite: change a comment in any file under `src/`, do not rebuild, and run `CI=1 sh test/run-all.sh`. It rebuilds, finds `index.html` different from the commit, and exits 1. Undo the change.

- [ ] **Step 7: Say where the data comes from, and what the guards cannot see**

In `ATTRIBUTION.md`, add a section:

````md
## OpenTaal — formes de mots

`test/data/nl-words.txt.gz` est la liste de mots d'[OpenTaal](https://github.com/OpenTaal/opentaal-wordlist),
mise en minuscules, triée et compressée : environ 410 000 formes, flexions
comprises. Elle ne contient que des **faits** — une forme existe, ou non — et
sert au contrôle d'orthographe de `test/content.js`. Aucune définition n'en est
tirée.

Régénérer :

```sh
node test/tools/build-wordlist.js
```

La liste est publiée sous licence BSD révisée et CC BY 3.0, au choix. Le crédit
est donné ici pour la même raison que ci-dessus.
````

In `TESTING.md`, add three rows to the table:

````md
| `content.js` | L'orthographe contre 410 000 formes néerlandaises, que chaque exercice promis se construise vraiment, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, et les éléments enseignés deux fois |
| `engine.js` | Ce qu'une séance contient et quand un élément revient, horloge en marche : la panne d'octobre, deux jours de suite, le rappel dans la séance, la réserve de nouveautés, le seuil des unités, la première demande à voix haute, « je ne peux pas parler » |
| `screens.js` | Chaque écran dans quatre états, relu comme du texte : ni pourcentage, ni maîtrise ; les comptes, le nom de l'unité, ce qui résiste, le bouton « je ne peux pas parler », le journal d'erreurs |
````

and under **Ce que les tests ne voient pas**, add:

````md
Trois de ces contrôles portent un budget plutôt qu'une exigence de zéro, parce
que le contenu actuel enfreint déjà la règle : 62 phrases d'exemple empruntent du
vocabulaire à une unité ultérieure, 9 éléments sont enseignés deux fois, 4
échelons n'ont aucun exercice possible. Un budget ne peut que baisser.

Et ce qu'aucun d'eux ne voit : l'idiome, le registre, l'ordre des mots, si une
phrase vaut la peine d'être apprise. Les scénarios et les antisèches ne passent
pas par le contrôle d'orthographe.
````

Also replace the sentence "Ils tournent sans navigateur." paragraph's third bullet, "la **série de jours**, sur plusieurs jours réels", with "**deux séances, deux jours de suite**, sur un vrai appareil : la simulation avance son horloge, mais elle ne remplace pas ça".

- [ ] **Step 8: Run and commit**

Run: `sh test/run-all.sh`
Expected: passes, ending with the note that the build differs from the last commit until you commit it.

````bash
sh build.sh
git add test/content.js test/tools/build-wordlist.js test/data/nl-words.txt.gz src/content/grammar.js test/run-all.sh TESTING.md ATTRIBUTION.md index.html artifact.html
git commit -m "test: content guards with budgets that only go down, and a build that cannot go stale"
git push
````

Then look at the CI run on the draft PR. It is the first run of the stale-build check on Linux, where the sources have LF endings: if it fails there and not locally, the committed `index.html` was built from a different tree.

---

### Task 11: A local error log in the doctor screen

Kept in phase 1 for one reason: the learner's two-day check happens on a phone, where there is no console, and it is the one moment a silent failure costs most. If a screen dies there, "it stopped working" is all that can be reported, and the check has to start again. Twenty entries, on the device only, never synchronised and never sent.

**Files:**
- Create: `src/core/errlog.js`
- Modify: `build.sh`, `src/app.js`, `src/ui/doctor.js`, `src/ui/session.js`, `src/core/fr.js`, `test/screens.js`
- Modify, as the closing step of the phase: `CLAUDE.md`, `README.md`

**Interfaces:**
- Produces: `NL.errlog.note(err, where)`, `all()`, `text()`, `clear()`, `watch()`, `KEEP`. Storage key `vlaams/errors`, local only. Each entry is `{ t, where, route, msg, stack }`, the stack cut to four lines.

- [ ] **Step 1: Write the failing test**

In `test/screens.js`, insert before the final `console.log`:

````js
  /* ------------------------------------------------------------------ */
  console.log('\nCE QUI A CASSÉ SUR CET APPAREIL');
  {
    fresh(); NL.errlog.clear();
    ok(text(NL.screens.doctor.render()).indexOf(t.errNone) >= 0, 'with no error recorded the doctor screen does not say so');
    ok((B.listeners.error || []).length > 0 && (B.listeners.unhandledrejection || []).length > 0, 'the app does not listen for errors');
    NL.ui.go('leerpad');
    B.listeners.error.forEach(f => f({ error: new Error('boum dans le parcours') }));
    B.listeners.unhandledrejection.forEach(f => f({ reason: new Error('promesse perdue') }));
    const doc = read('doctor', NL.screens.doctor.render(), 'deux erreurs');
    ok(doc.indexOf('boum dans le parcours') >= 0 && doc.indexOf('promesse perdue') >= 0, 'a recorded error is not shown');
    ok(doc.indexOf('[leerpad') >= 0, 'the error does not say which screen it happened on');
    ok(Object.keys(B.store).some(k => k === 'vlaams/errors'), 'the errors are not kept across a reload');
    for (let i = 0; i < 40; i++) NL.errlog.note(new Error('n° ' + i), 'essai');
    ok(NL.errlog.all().length === NL.errlog.KEEP, 'the log keeps ' + NL.errlog.all().length + ' errors instead of the last ' + NL.errlog.KEEP);
    NL.screens.doctor.click({ dataset: {} }, { act: 'errclear' });
    ok(NL.errlog.all().length === 0, 'the list cannot be emptied');
    console.log('  erreur de fenêtre et promesse rejetée enregistrées avec leur écran, vingt au plus, vidables');
  }
````

- [ ] **Step 2: Run it and watch it fail**

Run: `node test/screens.js "$(pwd)" | tail -3`
Expected: `CRASH TypeError: Cannot read properties of undefined (reading 'clear')`.

- [ ] **Step 3: The log**

Create `src/core/errlog.js`:

````js
/* Le journal d'erreurs local.

   Sur un téléphone il n'y a pas de console : quand un écran meurt, tout ce qu'on
   peut rapporter est « ça ne marche plus ». Ce journal garde les vingt dernières
   erreurs, sur l'appareil et nulle part ailleurs — il n'est ni synchronisé ni
   envoyé. L'écran « Son et micro » les affiche et permet de les copier. */
NL.errlog = (function () {
  'use strict';
  const KEY = 'vlaams/errors', KEEP = 20;

  const all = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };

  /* `where` dit d'où vient l'erreur quand ce n'est pas la fenêtre elle-même. */
  function note(err, where) {
    const list = all();
    list.push({
      t: Date.now(), where: where || '', route: (NL.ui && NL.ui.route) || '',
      msg: String((err && err.message) || err).slice(0, 300),
      stack: String((err && err.stack) || '').split('\n').slice(0, 4).join('\n').slice(0, 600)
    });
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-KEEP))); } catch (e) {}
  }

  const clear = () => { try { localStorage.removeItem(KEY); } catch (e) {} };

  /* Le texte à copier : une erreur par paragraphe, la plus récente en dernier. */
  const text = () => all().map(e =>
    new Date(e.t).toISOString() + ' [' + (e.route || '?') + (e.where ? ' · ' + e.where : '') + '] ' + e.msg +
    (e.stack ? '\n' + e.stack : '')).join('\n\n');

  function watch() {
    window.addEventListener('error', e => note((e && e.error) || (e && e.message), 'fenêtre'));
    window.addEventListener('unhandledrejection', e => note(e && e.reason, 'promesse'));
  }

  return { note, all, clear, text, watch, KEEP };
})();
````

In `build.sh`, add `src/core/errlog.js` to `SRC` on the line after `src/core/util.js`. It must load before anything that might call it.

In `src/app.js`, replace:

````js
    const root = document.getElementById('app');
````

with:

````js
    const root = document.getElementById('app');
    NL.errlog.watch();
````

- [ ] **Step 4: Show it, and stop one silent failure**

In `src/ui/doctor.js`, replace:

````js
  function render() {
    const v = NL.speech.voiceInfo();
````

with:

````js
  /* Ce que l'app a vu casser sur CET appareil. Sur un téléphone il n'y a pas de
     console : sans cette liste, tout ce qu'on peut rapporter est « ça ne marche
     plus ». Rien ne quitte l'appareil — c'est à copier et à envoyer soi-même. */
  function errorBlock() {
    const list = NL.errlog.all();
    if (!list.length) return '<p class="muted small">' + t.errNone + '</p>';
    return '<p class="muted small">' + t.errCount(list.length) + '</p>' +
      '<textarea class="backup-box" id="err-out" readonly spellcheck="false">' + esc(NL.errlog.text()) + '</textarea>' +
      '<div class="row"><button class="btn btn-blue" data-act="errcopy">' + t.errCopy + '</button>' +
      '<button class="btn btn-ghost" data-act="errclear">' + t.errClear + '</button></div>';
  }

  function render() {
    const v = NL.speech.voiceInfo();
````

In `src/ui/doctor.js`, replace:

````js
      (v.quality !== 'be'
        ? '<section class="doc-fix">' +
````

with:

````js
      '<section class="doc-block"><h4>' + t.errTitle + '</h4>' + errorBlock() + '</section>' +

      (v.quality !== 'be'
        ? '<section class="doc-fix">' +
````

In `src/ui/doctor.js`, replace:

````js
      if (d.act === 'playrec') { NL.speech.playRecording(); return; }
````

with:

````js
      if (d.act === 'playrec') { NL.speech.playRecording(); return; }
      if (d.act === 'errclear') { NL.errlog.clear(); NL.ui.render(); return; }
      if (d.act === 'errcopy') {
        const box = document.getElementById('err-out');
        if (box) box.select();
        const done = navigator.clipboard
          ? navigator.clipboard.writeText(NL.errlog.text()).then(() => true).catch(() => false)
          : Promise.resolve(!!(document.execCommand && document.execCommand('copy')));
        Promise.resolve(done).then(good => NL.ui.toast(good ? t.errCopied : t.errCopyByHand));
        return;
      }
````

In `src/ui/session.js`, replace:

````js
      } catch (e) { /* un élément mal formé est simplement sauté */ }
    });
    return out;
  }
````

with:

````js
      } catch (e) {
        /* Un élément mal formé est sauté — mais plus en silence : sans trace,
           il pouvait n'être jamais drillé sans que personne le sache. */
        NL.errlog.note(e, 'exercice ' + name + ' · ' + it.id);
      }
    });
    return out;
  }
````

In `src/core/fr.js`, replace:

````js
  docTierTitle: 'Ton niveau actuel',
````

with:

````js
  docTierTitle: 'Ton niveau actuel',
  errTitle: 'Ce qui a cassé sur cet appareil',
  errNone: 'Aucune erreur enregistrée.',
  errCount: n => n === 1 ? 'Une erreur enregistrée. Rien ne quitte cet appareil : copie le texte pour l’envoyer.' : n + ' erreurs enregistrées. Rien ne quitte cet appareil : copie le texte pour l’envoyer.',
  errCopy: 'Copier', errClear: 'Vider la liste',
  errCopied: 'Copié.', errCopyByHand: 'Sélectionne le texte et copie-le à la main.',
````

- [ ] **Step 5: Run and commit**

Run: `node test/screens.js "$(pwd)" && sh test/run-all.sh`
Expected: `erreur de fenêtre et promesse rejetée enregistrées avec leur écran, vingt au plus, vidables`, and the suite passes.

````bash
sh build.sh
git add src build.sh test/screens.js index.html artifact.html
git commit -m "feat: a local error log in the doctor screen"
````

- [ ] **Step 6: Bring `CLAUDE.md` and `README.md` up to date**

`CLAUDE.md` is read by every agent that opens the repository, so it changes last, when the phase is real. Write it with the **`writing-for-agents`** skill: keep only what an agent cannot find by looking, one line each, and nothing the code or a config already says.

In `README.md`, add one sentence to the description of the doctor screen: it also lists the last errors seen on the device, to copy and send.

In `CLAUDE.md`, under **Tests**, after the sentence about `TESTING.md`, add:

```md
The suite takes about six minutes. While working, run the one file you are changing, for
example `node test/engine.js "$(pwd)"`. A new suite loads the app through
`test/lib/browser.js` and answers exercises through `test/lib/answer.js`, never by calling
the scheduler itself.
```

Under **Conventions you can't infer from the code**, add three bullets:

```md
- One function decides what a session contains, `NL.srs.compose()`, and it takes new items
  out before reviews. The home screen and the session both ask it. A second calculation
  anywhere is the fault phase 1 removed.
- `resetAt` in the stored settings is the moment of the last reset, and other devices compare
  against it. It only ever grows. `ENGINE_EPOCH` in `src/core/state.js` is a fixed date and
  must stay one: changing it wipes progress again, or stops wiping it.
- `said` on a stored record is what makes an item's first spoken exercise certain and free of
  a rung. « Je ne peux pas parler » lives in the running session and is deliberately not a
  setting; issue #12 says why.
```

Under **Where the thinking is written down**, change the line added before Task 1 so that it reads as history:

```md
- `docs/superpowers/plans/2026-10-12-phase-1-moteur-ecrans-garde-fous.md` — the phase 1
  plan, implemented. Its last sections record why the engine is as it is
```

Nothing changes under **Decisions already taken**: that paragraph already says there is no placement test and no mastery metric.

````bash
git add CLAUDE.md README.md
git commit -m "docs: CLAUDE.md and README after phase 1"
````

This is the one task that makes two commits.

---

## After the last task

- Push, and wait for CI on the draft PR.
- **This is when the maintainer types `/code-review main`**, with issue #12 as the spec (step 6 of *The order of work*). Fix what it finds on the branch in one pass, each fix with a test that failed first, and run the suite again.
- **Write the PR body with the `pr` skill, then mark the PR ready.** Its template asks for three things, and this phase has a clear answer to each. *Summary*: the smallest picture of the change, which here is the allocation, before and after: new items given what the reviews leave, against new items taken out first. *Evidence*: the block *L'arithmétique* of `test/engine.js`, as it prints on `main` and as it prints on the branch. *Merge danger*: say it plainly. This merge is a **one-way door**. On first load every device erases the progress made on the old engine, on the device and on the server, and reverting the commit does not bring it back. The blast radius is every device that has ever used the app. Keep the thirteen `Closes #N` lines under the template.
- **Remind the maintainer** that phase 1 ends with his own check, which no test can replace: **two sessions on two consecutive days**, on the deployed preview, on the phone and the desktop. One session cannot detect the fault: it only shows on day two. `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set for Preview as well as Production (checked with `vercel env ls` on 12 October 2026), so a preview build has sync and the reset can be tried across two devices.
- **The two-day check cannot reach a spoken exercise.** With one session a day the first ones arrive around day 7. Until then they are held by `test/engine.js` and by the simulation. The day a session first asks him to speak, and the first time he taps « Je ne peux pas parler », are worth a word back from the maintainer.
- On first load after the deploy, each device shows the migration toast once and starts from zero. That is intended.
- If a screen dies during the check, the doctor screen (**Plus → Son et micro**) lists what broke on that device, to copy and send. That is what Task 11 is for.
- A bug the maintainer reports from the check is worked with the **`diagnosing-bugs`** skill: a command that fails on his exact symptom first, then several ranked hypotheses. Inside the run of step 5 the implementers keep `superpowers:systematic-debugging`, which that pipeline names; one debugging procedure per context, never both.
- Once the check passes: merge the PR, then `/retro`, then `/improve-codebase-architecture`.

## What comes after phase 1

Phase 2 is not planned here. It gets its own plan, written with `superpowers:writing-plans` once phase 1 is merged and the two-day check has passed. Its spec is the same issue #12. In short:

- **English becomes the display language, and French a toggle.** The interface, the glosses, the translations of example sentences, the scenarios and the grammar explanations exist in both.
- **A gloss resolver comes first**: one place that answers what an item means in the language being read. Every screen and exercise reads the French gloss directly today, including the mistakes screen this phase adds.
- The checks that keep two right answers out of one question work in the language the learner reads.
- Reference pages are translated according to what they are anchored to. The pronunciation page, the French words Flemish kept and the French false friends stay in French; a page of Dutch words that trick English speakers is added; each page says which language it helps.
- The page declares its language, and Dutch text declares Dutch.
- Translations are checked by something other than what produced them.
- It ends with the maintainer's second check: one session, judging whether the English reads naturally.

What phase 1 leaves ready for it:

- The cognate jump is already narrow (Task 4), so the set of cognates can follow the display language without touching the scheduler.
- `test/screens.js` reads every screen as text. That is the place to check that nothing is left in the other language.
- `test/smoke.js` still asserts that no item carries an English gloss. Phase 2 inverts that assertion; it does not delete it.
- Task 9b adds two interface strings, `cantSpeak` and `quietOnly`. In English the button reads "Can't speak now".
- Phase 1 changes the interface strings: about thirty go with the placement test and the percentages, about twenty arrive. The counts taken on 9 October have to be taken again.

Before the phase 2 plan is written:

- **Look at Sandcastle again** as the way to run it. It was evaluated on 12 October 2026 and left out of phase 1: its Windows support had open blocking bugs, and phase 1's tasks share files and must run in order, which wastes what it is built for. Phase 2's work splits into independent tickets, which is its case. Check its Windows issues first, or plan to run it under WSL2 or in CI.

Phases 3 and 4, content repair and then expansion to B1, follow in that order, each with its own plan.

**Two skills held for later, so that they are not forgotten.** Both are installed and were looked at on 12 October 2026; neither has work to do in phase 1.

- **`wayfinder`**, for planning phase 4, and perhaps phase 2. It charts work too big for one session as a map of decision tickets on the tracker and resolves them one at a time. Phase 4 has that shape: the content factory, audio hosting, the choice of sources, the backlog risk below. Phase 1 does not: nothing here is still foggy. Two things to know before using it. Its tickets are decisions and never carry `ready-for-agent`, so its map is a separate issue, not #12. And its five labels (`wayfinder:map`, `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`) do not exist on the repository yet.
- **`wizard`**, for the steps only the maintainer can take. It writes a bash script that opens each page, says what to click, and stores each value where it belongs. Phase 4 will have such steps (audio hosting, keys for the content factory), and so will Sandcastle if it is adopted for phase 2 (Docker, a token, a label). Phase 1 has none: the migration runs in the app, Vercel deploys by itself, and no schema changes.

**A named risk for phase 4: the review backlog has no ceiling.** This phase reserves a share of every session for new items and never lets it yield, against a daily budget that is fixed. With 439 items the backlog peaks at 172 for a learner who spends the whole budget, or 309 for one session a day, and then drains. With the several thousand items of B1 it will not drain. Before that content lands, either the reservation has to shrink as the backlog grows or the budget has to follow it. See decision 7.

## The open question, as settled on 12 October 2026

**When does a session first ask him to say a Dutch word aloud?** On the ladder as it stood, about five weeks after the word is met. He works surrounded by Dutch speakers. *Decided on 12 October 2026:* five weeks is too late. Tasks 5b and 9b change it, and issue #12 carries the decisions.

**What the ladder gave.** Measured on both engines, with a learner who answers everything right and takes every session the day offers. Each cell is the first day a word met on day one gets there:

| | On rung 3 | On rung 4 | On rung 5 | First spoken exercise, word or phrase | First spoken exercise, grammar rule |
| --- | --- | --- | --- | --- | --- |
| Old intervals (`main`) | day 3 | day 6 | day 14 | day 36 | day 19 |
| New intervals (this plan, before Task 5b) | day 2 | day 5 | day 13 | day 35 | day 14 or day 35 |

`speak` was the exercise an item got once it stood **on** rung 5, and the wait before that exercise is the longest of the ladder, 21 days. This was never a side effect of the interval decision: the ladder of this plan is no slower at any rung than the one on `main`, because the reinforcement inside the session climbs the rung the twelve-minute return used to climb.

**Two corrections to that table, found by running the engine.** For a grammar rule, rung 4 offers `speak` beside `open` and the engine draws one, so about half the rules were first spoken around day 14 and the rest around day 35. And "five weeks" is the figure for a learner who takes every session. The maintainer takes one session a day, two at most. With one, an item met on day 1 was first asked aloud on day 48 to 51, and the typical item on day 74, because an item also has to wait for a place in a session.

**What was compared.** One session a day, 85 answers right in 100, 200 simulated days, the whole course of 439 items. Days are counted from the day an item is met; the typical item is the median one.

| Ladder | An item met on day 1 is first asked aloud | The typical item |
| --- | --- | --- |
| As it stood | day 48 to 51 | day 74 |
| `speak` added to rung 4, drawn like any exercise | day 17 to 19 for about half, day 29 or later for the rest | day 67 |
| `speak` added to rung 3, drawn like any exercise | day 7 or 8 for most, day 52 or later for the rest | day 42 |
| Shorter middle waits, 2, 5 and 13 days | day 34 to 39 | day 71 |
| `speak` on rung 4 and certain the first time, waits of 2, 4 and 21 days | day 12 to 14 | day 46 |
| **`speak` on rung 3, certain the first time and free the first time (Tasks 5b and 9b)** | **day 7 to 13** | **day 26** |

**What was decided, and why.**

1. *Rung 3 offers the spoken exercise, and an item never yet said gets it.* Adding `speak` to a rung only puts it beside that rung's other exercises, and the engine draws one: it reached about a third of the items on rung 4 and a bit over half on rung 3, and the others waited for rung 5 as before. Shorter waits moved every item, but hardly the learner who takes one session a day: there an item is held back by the queue for a place, not by its wait.
2. *A wrong spoken answer costs no rung while the item has never been said.* Without this, bringing the spoken exercise forward made progress depend on the recogniser. Items the learner can produce at day 60, with spoken answers right 85, 60 and 40 times in 100: 201, 209 and 201 on the ladder as it stood; 200, 160 and 93 with the first two decisions alone; 230, 212 and 180 with this one. The maintainer expects to be right about 75 times in 100.
3. *« Je ne peux pas parler » belongs to the session, not to the settings.* He cannot always talk where he studies. With one session in five in such a place, the typical item is first asked aloud on day 28 against day 25, an exercise put off waits one day and two at most, and a session with a tap is as long as any other. A tap changes no stored record and spends none of the day's budget.
4. *After three refusals the learner rates himself*, so that an item the recogniser cannot hear does not stay on rung 3 and get asked aloud every day.

The waits are unchanged, and so is rung 5, which still offers only the spoken exercise: every item is said a second time there.

**What it costs.** About 29 exercises in 100 become spoken, where there were 14. A session takes about a minute longer a day in the first two months. The backlog does not rise: it peaks at 295 against 309.

**Limits measured and accepted.** A full week without talking leaves the count of items he can produce standing still for that week, because items never yet said wait on rung 3; it is absorbed in about five sessions and nothing is lost by day 30. Two full weeks without talking, at the moment the backlog is highest, are followed by six sessions that are entirely spoken, and the count has recovered by day 100.

**Declined on 12 October 2026.** A setting that turns the spoken exercises off: settings travel between devices, and one left off would bring the fault back without a word. A ceiling on spoken exercises in one session. A count of spoken exercises on the home screen or at the end of a session. Letting an item count as due a few hours early: it moves the first spoken exercises from day 7 to day 5 and nothing else that matters.

**What already existed and still does.** The conversations (**Parler**) use speech recognition and are open from day one, and so is **Écouter → Répéter après**, which scores what is said.

**Where the evidence is.** Outside the repository, in `../vlaams-PROTOTYPE-when-first-spoken/`: the prototype that compared the first four ladders, `measure.js`, and under `option-2-measurement/` the scripts and the raw output behind every figure in this section. The figures of decisions 2 and 3 were measured on scratch builds of the design before it was written as Tasks 5b and 9b; the engine those tasks produce was then measured again and gives the last row of the table above.

## Decisions, as settled on 12 October 2026

Things this plan decided because the spec does not, and things found while writing it that the spec states differently. The maintainer reviewed all eight; what he decided is recorded with each.

**1. What stopped new words: three defects, measured apart.** The spec's Problem Statement blames the twelve-minute return. A first reading of the code blamed the gate alone, and a second the allocation alone. Rebuilding 6 October on `main` (credited units at rung 3 and not yet due, unit five's 33 items at rungs 1 and 2 and all due) and measuring both what the home screen announces and what the session serves gives this:

| | Unmet items available | Announced | Served |
| --- | --- | --- | --- |
| `main` | 6 | 22 to review, 0 new | 0 new words (5 grammar rules) |
| gate forced open | 249 | 22 to review, 0 new | 11 new words |
| intervals of a day | 6 | 22 to review, 0 new | 0 new words |
| both | 249 | 22 to review, 0 new | 11 new words |

So:

- **The announcement** "0 nouveaux" comes from the allocation in `plan()`: new items get what the reviews leave of 22 places. It reads zero from 22 items due, whatever is available, in all four rows.
- **The session** served no new word on 6 October because none was available: the gate left six grammar rules. With the gate open it serves eleven while the screen still announces none. The session has its own allocation, on the day budget, and it reaches zero only from 120 items due.
- **The intervals** change neither column. A twelve-minute return makes an item due again as soon as it is answered, so the same items fill every session all day.

All three fixes are required, each for its own reason, and each has its own failing test: the gate in Task 2, the allocation and the intervals in Task 3. *Decided:* the reserved share is the primary fix, not insurance for later. Issue #12 was corrected on 12 October 2026 in the four passages that stated the mechanism: the first paragraph of the Problem Statement, the first paragraph of the Solution, "Reproduce the real failure" under Testing Decisions, and the last sentence of the note on the measured state.

**2. "Places" are items, and a new item costs two exercises.** The spec reserves "30% of a session's places, never fewer than four" without saying whether the reinforcement takes a place. Here a session has 22 places for items, the reservation is 7 items, and each new item adds one reinforcement: 22 to 29 exercises a session. New items are capped at 11 a session so that a session with no reviews does not double. *Accepted.* The second exercise is the reinforcement this design adds, so a session gets longer in time as well as in count; Task 3 says so.

**3. "Can produce" means the writing rung is passed** (`stage >= 4`, capped by tier). The spec uses the phrase without defining it. The alternative was the speaking rung. Writing was chosen because it is the first rung where the learner produces the word from memory instead of recognising it. An item is first asked aloud about a month after it is met (the ladder's intervals put that exercise on day 34), so a count based on speaking would read zero for the first month, which is the fault ADR 0002 exists to remove. That same figure raised a question of its own, kept apart from the count and settled on 12 October 2026: see *The open question, as settled on 12 October 2026*. Task 5b has since brought the first spoken exercise to rung 3; the count stays on the writing rung, which every item still has to pass. On the simulated one-session-a-day learner the count starts moving on day 5. *Accepted.*

**4. The duplicates budget is 9, not 8.** Compared without case or punctuation, as the alias matching of phase 3 will compare, "Tot maandag." and "Tot maandag!" are the same phrase taught twice. An exact string comparison misses that pair, which is where 8 came from. `TESTING.md` already says nine. *Accepted: 9.*

**5. Own words are met first.** They sat at the end of the item list, so a word the learner added waited until the whole course had been met. Not in the spec; one line in `freshItems`, with a test. *Accepted.*

**6. The reset also clears the scenario and listening checkmarks.** *Changed by the maintainer:* starting from zero while still showing six conversations completed is not starting from zero. The settings merge used to unite those lists across devices, which would have brought them straight back, so the same `resetAt` rule now governs them: across a reset they follow the side that carries it. Task 8 has the code and the tests. One limit, of the same kind as point 8: a conversation completed on a second device after the reset but before that device has heard of it is cleared with the rest, because the list carries no dates.

**7. A named risk for phase 4: the review backlog has no ceiling.** A reservation that never yields, against a fixed daily budget, means the backlog grows without limit once the course is much larger than the budget can turn over. With 439 items it peaks at 172 (eager learner) or 309 (one session a day) and then drains. With several thousand items it will not drain. The engine is right for phases 1 to 3. *Accepted and deferred:* the reservation or the budget must be looked at again before B1 content lands, and *What comes after phase 1* carries it so that it is not rediscovered then.

**8. Clock skew between devices.** The reset compares timestamps written by different devices. A device whose clock runs behind could have a post-reset answer taken for a pre-reset one and dropped. Phone and desktop clocks are set by the network and agree to within seconds. *Accepted: noted, not handled.*

