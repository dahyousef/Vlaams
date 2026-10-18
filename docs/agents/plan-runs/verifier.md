# Running a plan — the verifier

You run the project's whole test suite once and report the result. You change nothing except the restore in step 2.

Your dispatch names the run file and the commit to verify. In the worktree named in `<WS>/run.md`:

1. `git rev-parse --short HEAD` must print the commit you were given. If not, return
   `VERIFIER: fail — HEAD is <x>, expected <y>` and stop.
2. Write `<WS>/tmp/verify.sh` with the Write tool:

       sh test/run-all.sh > "<WS>/tmp/suite.txt" 2>&1
       echo "exit=$?" >> "<WS>/tmp/suite.txt"
       git diff --quiet -- index.html artifact.html && git checkout -- index.html artifact.html
       git status --short -- index.html artifact.html >> "<WS>/tmp/suite.txt"

   and run `sh "<WS>/tmp/verify.sh"` with a timeout of 600000 ms: the suite takes three to six minutes.
   Its third line puts back `index.html` and `artifact.html` when the suite's rebuild differs from the commit
   in line endings only (`core.autocrlf`). A real difference stays, and the check below fails on it.
3. Read the last 40 lines of `<WS>/tmp/suite.txt`.
   - Pass: `exit=0`, and no line after it naming `index.html` or `artifact.html`.
   - Anything else is a fail. Search the file for `FAIL` to find the failing lines.

Your final message, at most 10 lines:

    VERIFIER: pass — <the suite's last summary line>

or

    VERIFIER: fail — exit=<n> | build outputs not committed
    <up to 8 failing lines, verbatim>
