# Running a plan — the verifier

You run the project's whole test suite once and report the result. You change nothing except the restores in
steps 2 and 3.

Write `<WS>/tmp/verifier.txt` first, with the one line `verifying <commit>`, the commit as your dispatch gave it
(Read the file first when it exists: the Write tool refuses to overwrite a file it has not read). It ends an earlier
verifier's file, so your controller never takes that one for yours.

Your dispatch names the run file and the commit to verify. In the worktree named in `<WS>/run.md`:

1. `git rev-parse HEAD` must equal `git rev-parse <the commit you were given>`, whatever length the hash was
   given in. If not, return `VERIFIER: fail — HEAD is <x>, expected <y>` and stop. Then run
   `sh docs/agents/plan-runs/wait-suite.sh --running "<WS>/tmp/suite.txt"`. If it prints `a suite still runs`, an
   earlier suite would mix the file and the build outputs with a second one: return
   `VERIFIER: fail — a suite still runs` and stop.
2. Run `git update-index -q --refresh` first: it clears files git lists as modified though their content is
   unchanged, which failed phase 2's follow-ups' first verify. Then run
   `git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html`: a suite left
   running by a sitting that was cut off can rebuild them in line endings only (`core.autocrlf`). Then run
   `git status --short` on the whole tree. Any line is a fail: return
   `VERIFIER: fail — tree not clean` with those lines, and stop. A pass would otherwise be credited to the
   commit for uncommitted changes.
3. Write `<WS>/tmp/verify.sh` with the Write tool:

       sh -c 'echo $$ > "<WS>/tmp/suite.txt.pid"; exec sh test/run-all.sh' > "<WS>/tmp/suite.txt" 2>&1
       echo "exit=$?" >> "<WS>/tmp/suite.txt"
       rm -f "<WS>/tmp/suite.txt.pid"
       git update-index -q --refresh
       git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html
       git status --short -- index.html artifact.html >> "<WS>/tmp/suite.txt"

   and run `sh "<WS>/tmp/verify.sh"` in the background, then end your turn: the suite can take more than half an
   hour, past the ten a foreground command may run, and its exit notice wakes you. End it with one line naming what
   you wait for, never in your return's form. Do not poll, sleep or use Monitor. Write no `VERIFIER:` line before
   step 4: your controller takes it as the result.
   Its first line leaves the suite's own process id, not that of this script's shell, which can be killed while the
   suite goes on: `wait-suite.sh` reads it to tell a suite that runs from one that was cut off. Its `git checkout`
   line puts back `index.html` and `artifact.html` when the suite's rebuild differs from the commit in line endings
   only (`core.autocrlf`). A real difference stays, and the check below fails on it.
4. Read the last 40 lines of `<WS>/tmp/suite.txt`.
   - Pass: `exit=0`, the line `TOUTE LA SUITE EST PASSÉE` just above it, and no line after it naming `index.html` or
     `artifact.html`.
   - No `exit=` line, `exit=0` without that line (what a force-kill from Windows leaves), or `exit=129`, `130`, `137`
     or `143` (the signals that stop a process from outside): it was killed or goes on without its shell, which says
     nothing of the commit. Run step 1's `--running` check. Return `VERIFIER: fail — a suite still runs` if it says
     so, `VERIFIER: fail — suite cut off` otherwise.
   - Anything else is a fail, a test that crashed included (`exit=134` or `139`). Search the file for `FAIL` and for
     `DÉLAI DÉPASSÉ` to find the failing lines: the second is `test/tools/fanout.js`'s time limit, and its line goes in
     your return as it stands, so that your controller reruns you instead of opening a fix round.

Your final message, at most 10 lines, goes first to `<WS>/tmp/verifier.txt`, written with the Write tool over your
`verifying` line: a first line `verified <commit>`, the commit as your dispatch gave it, then the lines below. Then
return the same lines. Every return goes through the file, those of steps 1 and 2 included: in plan 4b's run three
verifiers of ten handed back without their line, and their controllers read the suite's file instead; now they read
this one.

    VERIFIER: pass — <the suite's last summary line>

or

    VERIFIER: fail — exit=<n> | build outputs not committed | tree not clean | suite cut off | a suite still runs
    <up to 8 failing lines, verbatim>
