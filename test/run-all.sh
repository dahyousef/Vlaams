#!/bin/sh
# Toute la suite, en une commande : sh test/run-all.sh
# C'est exactement ce que lance la CI, pour qu'il n'y ait qu'une seule liste.
#   sh test/run-all.sh           build, puis tout
#   PACE_DAYS=400 sh test/run-all.sh   simulation de charge plus longue
set -e
cd "$(dirname "$0")/.."
# « . » et non « $(pwd) » : sous Git Bash, node veut C:/… et le shell ne
# convertit /c/… pour lui que si rien ne le lui interdit. Une session d'agent
# le lui interdit (MSYS_NO_PATHCONV). Toutes les suites acceptent « . ».
ROOT=.

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
