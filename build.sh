#!/bin/sh
# Concatenates the sources into the two distributable files.
#   index.html    - standalone page; open it directly, or serve it for the PWA
#   artifact.html - same app without the doctype/head/body skeleton, for publishing
#   dist/         - what Vercel serves (index.html plus the PWA files)
#
# SUPABASE_URL and SUPABASE_ANON_KEY, when set, switch on accounts and sync in
# index.html. The anon key is public by design; row-level security protects the
# data. Without them the app is local-only, which is what the tests and the
# artifact use.
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
src/core/sync.js
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
src/ui/account.js
src/app.js"

# Keep only characters a URL or a key can contain, so nothing can break out of the quotes.
clean() { printf %s "$1" | tr -cd "A-Za-z0-9._:/=+_-"; }
SB_URL=$(clean "${SUPABASE_URL:-}")
SB_KEY=$(clean "${SUPABASE_ANON_KEY:-}")

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
  printf '<script>window.NL_CONFIG={supabaseUrl:"%s",supabaseAnonKey:"%s"};</script>
' "$SB_URL" "$SB_KEY"
  if [ -n "$SB_URL" ]; then
    printf '<script>
'; cat vendor/supabase.js; printf '
</script>
'
  fi
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

# ---- dist/ : the deployable site ----
rm -rf dist
mkdir -p dist
cp index.html manifest.webmanifest sw.js dist/
cp -r icons dist/

words=$(grep -c "^      W(\|W('" src/content/lexicon.a1.js src/content/lexicon.a1b.js 2>/dev/null | awk -F: '{s+=$2} END {print s}')
[ -n "$SB_URL" ] && sync="sync on" || sync="local only"
echo "built ($sync) index.html ($(wc -c < index.html) bytes), artifact.html ($(wc -c < artifact.html) bytes)"
