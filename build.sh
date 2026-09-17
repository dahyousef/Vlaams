#!/bin/sh
# Concatenates the sources into the two distributable files.
#   index.html    - standalone page; open it directly, or serve it for the PWA
#   artifact.html - same app without the doctype/head/body skeleton, for publishing
# No bundler: every source file is a plain script that hangs off the NL.* namespace,
# so the only thing that matters is the order below.
set -e
cd "$(dirname "$0")"

SRC="src/core/util.js
src/core/fr.js
src/core/state.js
src/core/srs.js
src/core/speech.js
src/core/audio.js
src/content/lexicon.a1.js
src/content/lexicon.a1b.js
src/content/grammar.js
src/content/open.js
src/content/reference.js
src/content/scenarios.js
src/content/index.js
src/ex/index.js
src/ui/shell.js
src/ui/session.js
src/ui/home.js
src/ui/scenario.js
src/ui/listen.js
src/ui/library.js
src/ui/placement.js
src/ui/doctor.js
src/app.js"

FONTS='https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap'

emit_scripts() {
  for f in $SRC; do
    printf '<script>\n'
    cat "$f"
    printf '</script>\n'
  done
}

# ---- index.html : the real page ----
{
  echo '<!doctype html>'
  echo '<html lang="nl-BE">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<meta name="description" content="Vlaams leren in het Frans: gespreide herhaling, hardop spreken, en de taal zoals ze in Vlaanderen echt gesproken wordt.">'
  echo '<meta name="theme-color" content="#1F4B3F">'
  echo '<meta name="apple-mobile-web-app-capable" content="yes">'
  echo '<title>Vlaams</title>'
  echo '<link rel="manifest" href="manifest.webmanifest">'
  echo '<link rel="icon" href="icons/icon.svg" type="image/svg+xml">'
  echo "<link rel=\"stylesheet\" href=\"$FONTS\">"
  echo '<style>'
  cat styles.css
  echo '</style>'
  echo '</head>'
  echo '<body>'
  echo '<div id="app"></div>'
  emit_scripts
  echo '</body>'
  echo '</html>'
} > index.html

# ---- artifact.html : head/body skeleton supplied by the host ----
{
  echo '<title>Vlaams</title>'
  echo "<link rel=\"stylesheet\" href=\"$FONTS\">"
  echo '<style>'
  cat styles.css
  echo '</style>'
  echo '<div id="app"></div>'
  emit_scripts
} > artifact.html

words=$(grep -c "^      W(\|W('" src/content/lexicon.a1.js src/content/lexicon.a1b.js 2>/dev/null | awk -F: '{s+=$2} END {print s}')
echo "built index.html ($(wc -c < index.html) bytes), artifact.html ($(wc -c < artifact.html) bytes)"
