# Running a plan — the verifier

You run the project's whole test suite once and report the result. You change nothing except the restores in
steps 2 and 3.

Your dispatch names the run file and the commit to verify. In the worktree named in `<WS>/run.md`:

1. `git rev-parse HEAD` must equal `git rev-parse <the commit you were given>`, whatever length the hash was
   given in. If not, return `VERIFIER: fail — HEAD is <x>, expected <y>` and stop.
2. Run `git update-index -q --refresh` first: it clears files git lists as modified though their content is
   unchanged, which failed phase 2's follow-ups' first verify. Then run
   `git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html`: a suite left
   running by a sitting that was cut off can rebuild them in line endings only (`core.autocrlf`). Then run
   `git status --short` on the whole tree. Any line is a fail: return
   `VERIFIER: fail — tree not clean` with those lines, and stop. A pass would otherwise be credited to the
   commit for uncommitted changes.
3. Write `<WS>/tmp/verify.sh` with the Write tool:

       sh test/run-all.sh > "<WS>/tmp/suite.txt" 2>&1
       echo "exit=$?" >> "<WS>/tmp/suite.txt"
       git update-index -q --refresh
       git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html
       git status --short -- index.html artifact.html >> "<WS>/tmp/suite.txt"

   and run `sh "<WS>/tmp/verify.sh"` with a timeout of 600000 ms: the suite takes three to six minutes.
   Its third line puts back `index.html` and `artifact.html` when the suite's rebuild differs from the commit
   in line endings only (`core.autocrlf`). A real difference stays, and the check below fails on it.
4. Read the last 40 lines of `<WS>/tmp/suite.txt`.
   - Pass: `exit=0`, and no line after it naming `index.html` or `artifact.html`.
   - Anything else is a fail. Search the file for `FAIL` to find the failing lines.

Your final message, at most 10 lines:

    VERIFIER: pass — <the suite's last summary line>

or

    VERIFIER: fail — exit=<n> | build outputs not committed | tree not clean
    <up to 8 failing lines, verbatim>
