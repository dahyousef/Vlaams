# Running a plan — the verifier

You run the project's whole test suite once and report the result. You change nothing except the restores in
steps 2 and 3.

Your dispatch names the run file and the commit to verify. In the worktree named in `<WS>/run.md`:

1. `git rev-parse HEAD` must equal `git rev-parse <the commit you were given>`, whatever length the hash was
   given in. If not, return `VERIFIER: fail — HEAD is <x>, expected <y>` and stop. If `<WS>/tmp/suite.txt.pid` exists
   and `kill -0 "$(cat "<WS>/tmp/suite.txt.pid")"` succeeds, an earlier suite still runs, and a second one beside it
   would mix the file and the build outputs: return `VERIFIER: fail — a suite still runs` and stop.
2. Run `git update-index -q --refresh` first: it clears files git lists as modified though their content is
   unchanged, which failed phase 2's follow-ups' first verify. Then run
   `git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html`: a suite left
   running by a sitting that was cut off can rebuild them in line endings only (`core.autocrlf`). Then run
   `git status --short` on the whole tree. Any line is a fail: return
   `VERIFIER: fail — tree not clean` with those lines, and stop. A pass would otherwise be credited to the
   commit for uncommitted changes.
3. Write `<WS>/tmp/verify.sh` with the Write tool:

       sh test/run-all.sh > "<WS>/tmp/suite.txt" 2>&1 &
       echo $! > "<WS>/tmp/suite.txt.pid"
       wait $!
       echo "exit=$?" >> "<WS>/tmp/suite.txt"
       rm -f "<WS>/tmp/suite.txt.pid"
       git update-index -q --refresh
       git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html
       git status --short -- index.html artifact.html >> "<WS>/tmp/suite.txt"

   and run `sh "<WS>/tmp/verify.sh"` in the background, then end your turn: the suite can take more than half an
   hour, past the ten a foreground command may run, and its exit notice wakes you. End it with one line naming what
   you wait for, never in your return's form. Do not poll, sleep or use Monitor. Write no `VERIFIER:` line before
   step 4: your controller takes it as the result.
   Its pid file names the suite, not this script's shell, which can be killed while the suite goes on: step 1 and
   `wait-suite.sh` read it to tell a suite that runs from one that was cut off. Its `git checkout` line puts back `index.html` and `artifact.html` when the suite's rebuild differs from the commit in line endings only
   (`core.autocrlf`). A real difference stays, and the check below fails on it.
4. Read the last 40 lines of `<WS>/tmp/suite.txt`.
   - Pass: `exit=0`, and no line after it naming `index.html` or `artifact.html`.
   - No `exit=` line at all: the suite was killed, which says nothing of the commit. Return
     `VERIFIER: fail — suite cut off`.
   - Anything else is a fail. Search the file for `FAIL` to find the failing lines.

Your final message, at most 10 lines:

    VERIFIER: pass — <the suite's last summary line>

or

    VERIFIER: fail — exit=<n> | build outputs not committed | tree not clean | suite cut off | a suite still runs
    <up to 8 failing lines, verbatim>
