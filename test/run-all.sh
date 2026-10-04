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
node test/sim.js      "$ROOT"
node test/firstrun.js "$ROOT"
node test/sync.js     "$ROOT"

# Une voix et un navigateur par ligne : c'est là que vivent les vrais problèmes.
for c in "nl-BE OPR" "nl-NL OPR" "none OPR" "nl-BE EDG" "nl-NL EDG" "none EDG" "nl-BE IOS" "nl-BE SAF"; do
  set -- $c
  echo "--- journey $1 $2 ---"
  node test/journey.js "$ROOT" "$1" "$2"
done

node test/pace.js "$ROOT" "${PACE_DAYS:-200}"

echo
echo "TOUTE LA SUITE EST PASSÉE"
