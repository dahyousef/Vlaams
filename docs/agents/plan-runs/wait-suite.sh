export PATH="/usr/bin:/bin:/mingw64/bin:$PATH"
# A task controller runs this with `run_in_background`, right after dispatching its verifier: it is one wait that
# exits when the suite ends, and it keeps the controller from having nothing of its own running meanwhile.
# See « Waiting » in task-controller.md. Usage: sh wait-suite.sh <suite file> [grace seconds] [silence seconds]
# With --running it waits for nothing: it says whether a suite runs, which verifier.md asks before it starts one.
if [ -z "$1" ] || { [ "$1" = "--running" ] && [ -z "$2" ]; }; then
  echo "usage: sh wait-suite.sh <suite file> [grace seconds] [silence seconds]"
  echo "       sh wait-suite.sh --running <suite file>"
  exit 2
fi
# verify.sh leaves the suite's process id beside the suite file. A suite that hangs still runs, and a second one beside
# it would mix the file and the build outputs. The id alone is not enough: after a reboot another program can hold it.
# It sees the suite's shell, not a test: kill that shell and the test it was running goes on to its own end, while this
# says `no suite runs`, so a new suite can start beside it. That test can garble the file, but it writes neither `exit=`
# nor the suite's last line, so it cannot make a pass.
suite_state() {
  if [ -f "$1.pid" ] && ps -ef | awk -v p="$(cat "$1.pid")" '$2 == p && /run-all/ { found = 1 } END { exit !found }'; then
    echo "a suite still runs"
  else
    echo "no suite runs"
  fi
}
if [ "$1" = "--running" ]; then
  suite_state "$2"
  exit 0
fi
F="$1"
GRACE="${2:-120}"    # after the suite's end, so that the verifier's line comes first
SILENCE="${3:-900}"  # with no write to the file for this long, the suite hangs or was cut off
START=$(date +%s)
while true; do
  now=$(date +%s)
  m=$(stat -c %Y "$F" 2>/dev/null || echo 0)
  # Only a suite started after this script counts: the file may still hold the last run's exit= line.
  if [ "$m" -gt "$START" ] && grep -q '^exit=' "$F"; then
    sleep "$GRACE"
    echo "FINISHED"
    exit 0
  fi
  last=$m
  [ "$START" -gt "$last" ] && last=$START
  if [ $(( now - last )) -ge "$SILENCE" ]; then
    echo "STALE: no exit= and no write for $(( now - last ))s; $(suite_state "$F")"
    exit 0
  fi
  sleep 5
done
