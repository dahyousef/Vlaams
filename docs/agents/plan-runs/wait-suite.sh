export PATH="/usr/bin:/bin:/mingw64/bin:$PATH"
# A task controller runs this with `run_in_background`, right after dispatching its verifier: it is one wait that
# exits when the suite ends, and it keeps the controller from having nothing of its own running meanwhile.
# See « Waiting » in task-controller.md. Usage: sh wait-suite.sh <suite file> [grace seconds] [silence seconds]
if [ -z "$1" ]; then
  echo "usage: sh wait-suite.sh <suite file> [grace seconds] [silence seconds]"
  exit 2
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
    # verify.sh leaves its process id beside the suite file. A suite that hangs still runs, and a second one
    # beside it would mix the file and the build outputs.
    if [ -f "$F.pid" ] && kill -0 "$(cat "$F.pid")" 2>/dev/null; then state="a suite still runs"; else state="no suite runs"; fi
    echo "STALE: no exit= and no write for $(( now - last ))s; $state"
    exit 0
  fi
  sleep 5
done
