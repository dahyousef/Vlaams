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
node test/helpers.js  "$ROOT"
node test/dehet.js    "$ROOT"
node test/content.js  "$ROOT"
node test/engine.js   "$ROOT"
node test/screens.js  "$ROOT"
node test/lang.js     "$ROOT"
node test/typed.js    "$ROOT"
node test/sim.js      "$ROOT"
node test/firstrun.js "$ROOT"
node test/sync.js     "$ROOT"
node test/hooks.js    "$ROOT"
# Les contrôles de l'outil de la séance de contrôle de l'anglais, sans écrire ses fichiers :
# une glose que owed() ne compte pas, ou un côté vide que le contenu n'explique pas.
node test/tools/check-files.js "$ROOT"
# Le kit de répartition (tools/content/) : Split, Check et Merge, les tables et le cache
# épinglé, dans une copie du dépôt et sans réseau.
node test/tools/fanout.js "$ROOT"

# Une voix et un navigateur par ligne : c'est là que vivent les vrais problèmes.
for c in "nl-BE OPR" "nl-NL OPR" "none OPR" "nl-BE EDG" "nl-NL EDG" "none EDG" "nl-BE IOS" "nl-BE SAF"; do
  set -- $c
  echo "--- journey $1 $2 ---"
  node test/journey.js "$ROOT" "$1" "$2"
done

# Quatre apprenants : celui qui épuise le budget du jour, celui qui ne fait
# qu'une séance, celui qui, une séance sur cinq, ne peut pas parler, et celui
# dont la séance commence chaque jour vingt minutes plus tôt, de 21 h à 7 h,
# puis remonte. Le défaut d'octobre ne se voyait que chez le deuxième. Le
# quatrième voit ce qu'aucun autre ne voit : un lendemain qui dépendrait de
# l'heure à laquelle on commence (#32).
node test/pace.js "$ROOT" "${PACE_DAYS:-200}"
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one quiet
node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one drift
# Un seul jour, comme les tâches d'un plan la lancent : ce qui ne se juge que
# sur la durée dit « non jugé », et ne compte pas comme un problème.
node test/pace.js "$ROOT" 1

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
