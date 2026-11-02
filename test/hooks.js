/* Les deux crochets de SessionStart et l'ordre du vérificateur. Le rappel de reprise : .claude/settings.json le
   branche sur SessionStart (compact|resume), et ce qu'il imprime entre dans le contexte de la session. Le crochet
   du transcript (startup|clear) imprime le chemin que Claude Code lui donne sur stdin. verifier.md remet les
   sorties du build avant de vérifier l'arbre. Le texte du kit ne porte aucun caractère de contrôle, et sa commande
   de lancement nomme claude.exe en entier. Le kit dit comment un agent en attend un autre, et wait-suite.sh attend
   la fin de la suite. On lance les commandes telles que Claude Code les lance. */
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = process.argv[2];
let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL: ' + msg); fails++; } };

const settings = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude/settings.json'), 'utf8'));
const hooks = settings.hooks || {};
const entry = (hooks.SessionStart || []).find(e => e.matcher === 'compact|resume');
ok(entry, 'SessionStart a une entrée compact|resume');
const cmd = entry ? entry.hooks[0].command : 'true';

// Sans CLAUDE_PROJECT_DIR (la CI, un autre shell) : le repli sur « . » doit suffire.
const env = Object.assign({}, process.env);
delete env.CLAUDE_PROJECT_DIR;
const r = spawnSync('sh', ['-c', cmd], { cwd: ROOT, env, encoding: 'utf8' });
const out = (r.stdout || '').trim();

console.log('HOOK');
console.log('  status          ' + r.status);
console.log('  output          ' + out.slice(0, 90));
ok(r.status === 0, 'le rappel sort avec 0');
ok(/re-read docs\/agents\/plan-runs\/run-controller\.md/.test(out), 'le rappel nomme run-controller.md');
ok(/status table/.test(out), 'le rappel nomme le tableau d\'état du registre');
ok(/batches table/.test(out), 'le rappel nomme le tableau des lots du registre');
ok(/rulings/.test(out), 'le rappel nomme les décisions du registre');

// Le crochet du transcript : il copie le chemin que Claude Code lui passe, au lieu de le deviner.
const tEntry = (hooks.SessionStart || []).find(e => e.matcher === 'startup|clear');
ok(tEntry && /transcript-path.js/.test(tEntry.hooks[0].command), 'SessionStart a une entrée startup|clear qui nomme transcript-path.js');
const tCmd = tEntry ? tEntry.hooks[0].command : 'true';
const runT = input => spawnSync('sh', ['-c', tCmd], { cwd: ROOT, env, encoding: 'utf8', input });
const t1 = runT(JSON.stringify({ source: 'startup', transcript_path: 'C:/x/projects/p/0000-test.jsonl' }));
const t2 = runT('');
const t3 = runT('not json');
console.log('TRANSCRIPT');
console.log('  status          ' + t1.status);
console.log('  output          ' + (t1.stdout || '').trim().slice(0, 90));
ok(t1.status === 0, 'le crochet du transcript sort avec 0');
ok((t1.stdout || '').includes("This session's transcript: C:/x/projects/p/0000-test.jsonl"), 'le crochet imprime le chemin reçu');
ok(t2.status === 0 && (t2.stdout || '').trim() === '', 'sans stdin : sortie 0 et rien n\'est imprimé');
ok(t3.status === 0 && (t3.stdout || '').trim() === '', 'avec un JSON invalide : sortie 0 et rien n\'est imprimé');

const rc = fs.readFileSync(path.join(ROOT, 'docs/agents/plan-runs/run-controller.md'), 'utf8');
ok(rc.includes("This session's transcript"), 'run-controller.md nomme la ligne du crochet');
ok(!rc.includes('newest `.jsonl`'), 'run-controller.md ne devine plus le transcript par le .jsonl le plus récent');

// Une commande du kit est copiée telle quelle. Un fichier écrit par une chaîne JS aux barres obliques inverses
// non doublées change « \b » en caractère de contrôle et efface les autres : la commande ne trouve plus claude.exe.
const kit = path.join(ROOT, 'docs/agents/plan-runs');
for (const f of fs.readdirSync(kit).filter(f => f.endsWith('.md'))) {
  ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(fs.readFileSync(path.join(kit, f), 'utf8')), f + ' ne contient aucun caractère de contrôle');
}
const launches = rc.split('$env:USERPROFILE').slice(1);
ok(launches.length >= 2 && launches.every(s => s.startsWith('\\.local\\bin\\claude.exe')), 'run-controller.md nomme claude.exe par son chemin entier, au lancement et dans la fenêtre');

// Les agents tournent en arrière-plan : « au premier plan » ne se suit pas, et « ne termine jamais ton tour » défend
// ce qui les fait attendre. La règle qui a tenu en phase 4a se lit dans le kit, avec son script.
const page = f => fs.readFileSync(path.join(kit, f), 'utf8');
for (const f of fs.readdirSync(kit).filter(f => f.endsWith('.md'))) {
  ok(!/[Dd]ispatch[^.]*\bforeground\b/.test(page(f)), f + ' ne demande aucun agent au premier plan');
  ok(!/never\s+end\s+your\s+turn/.test(page(f)), f + ' ne défend plus de terminer son tour');
}
for (const f of ['task-controller.md', 'batch-controller.md', 'closing-review.md']) {
  ok(/end your turn: that is how you wait/.test(page(f).replace(/\s+/g, ' ')), f + ' dit comment attendre un agent');
}
ok(/wait-suite\.sh "<WS>\/tmp\/suite\.txt"[\s\S]{0,40}`run_in_background`/.test(page('task-controller.md')), 'task-controller.md nomme wait-suite.sh et run_in_background');
ok(/same controller/.test(page('run-controller.md')) && /same controller/.test(page('one-session.md')), 'un contrôleur rendu avant son agent reprend, il n\'a pas échoué');
// Ce que le contrôleur fait de chaque réveil : la ligne du vérificateur seule est un résultat ; STALE veut dire une suite
// coupée, donc un vérificateur neuf (décision du 2026-11-01, en phase 4a), et une seconde fois une question.
const oneLine = f => page(f).replace(/\s+/g, ' ');
const tc = oneLine('task-controller.md');
ok(/Only a line starting `VERIFIER:` is the verifier's result/.test(tc), 'task-controller.md dit ce qu\'est un résultat');
ok(/send it on with `SendMessage`/.test(tc), 'task-controller.md dit quoi faire d\'un vérificateur arrêté sans sa ligne');
ok(/dispatch a new one with a new wait/.test(tc), 'task-controller.md relance un vérificateur après STALE');
ok(/A second cut-off on the same commit: return `needs ruling`/.test(tc), 'task-controller.md s\'arrête à la seconde suite coupée');
ok(/`a suite still runs`: [^.]*`needs ruling`/.test(tc), 'task-controller.md ne lance pas de seconde suite à côté d\'une suite qui tourne');
ok(/`VERIFIER: fail — suite cut off`/.test(tc) && /`VERIFIER: fail — suite cut off`/.test(oneLine('verifier.md')), 'une suite coupée n\'est pas un échec du code, pour le vérificateur comme pour son contrôleur');
ok(/suite\.txt\.pid/.test(oneLine('verifier.md')), 'verifier.md écrit le pid de sa suite, que wait-suite.sh lit');
ok(/`ToolSearch`/.test(tc), 'task-controller.md dit que TaskStop et SendMessage se chargent d\'abord');
ok(/`<WS>` out[^.]*absolute path/.test(oneLine('closing-review.md')) && /`<WS>` out[^.]*absolute path/.test(oneLine('batch-controller.md')) && /`<WS>` out[^.]*absolute path/.test(oneLine('run-controller.md')), 'chaque page qui envoie un agent écrit <WS> en chemin absolu');
ok(!/has no `exit=` line/.test(tc), 'task-controller.md dit STALE comme le script le calcule');
ok(/left over/.test(tc), 'task-controller.md dit quoi faire d\'une attente restée après la ligne du vérificateur');
ok(/`<WS>` out[^.]*absolute path/.test(tc), 'task-controller.md écrit <WS> en chemin absolu dans chaque envoi');
ok(/UNFINISHED: /.test(tc) && /`UNFINISHED:`/.test(oneLine('run-controller.md')), 'un retour forcé se reconnaît à sa ligne UNFINISHED');
ok(/forced hand-back/.test(oneLine('batch-controller.md')) && /forced hand-back/.test(oneLine('one-session.md')), 'un lot rendu de force se reconnaît à sa raison');
ok(/Write no `VERIFIER:` line before step 4/.test(oneLine('verifier.md')), 'verifier.md n\'écrit sa ligne qu\'à la fin');
for (const f of ['task-controller.md', 'batch-controller.md', 'closing-review.md', 'verifier.md']) {
  ok(/naming what you wait for, never in your return's form/.test(oneLine(f)), f + ' dit avec quoi terminer son tour');
}
ok(/Step 4 starts once all of them have returned/.test(oneLine('closing-review.md')), 'closing-review.md attend tous ses relecteurs');
ok(/^\*\.sh text eol=lf$/m.test(fs.readFileSync(path.join(ROOT, '.gitattributes'), 'utf8')), '.gitattributes garde les scripts en LF');

// wait-suite.sh : une suite finie après son lancement rend FINISHED ; le `exit=` de la suite d'avant ne compte pas.
const waitSuite = path.join(kit, 'wait-suite.sh').replace(/\\/g, '/');
const waitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wait-suite-'));
const suiteFile = path.join(waitDir, 'suite.txt').replace(/\\/g, '/');
const waitFor = script => (spawnSync('sh', ['-c', script], { cwd: ROOT, env, encoding: 'utf8' }).stdout || '').trim();
fs.writeFileSync(suiteFile, 'exit=0\n');
ok(/^STALE: /.test(waitFor(`sh "${waitSuite}" "${suiteFile}" 0 1`)), 'wait-suite.sh ne prend pas le exit= de la suite d\'avant');
// STALE dit si la suite tourne encore : une seconde suite à côté mêlerait le fichier et les sorties du build.
ok(/no suite runs$/.test(waitFor(`sh "${waitSuite}" "${suiteFile}" 0 1`)), 'wait-suite.sh dit qu\'aucune suite ne tourne');
ok(/a suite still runs$/.test(waitFor(`sleep 8 >/dev/null 2>&1 & echo $! > "${suiteFile}.pid"; sh "${waitSuite}" "${suiteFile}" 0 1`)), 'wait-suite.sh dit qu\'une suite tourne encore');
fs.rmSync(suiteFile + '.pid');
fs.writeFileSync(suiteFile, 'FAIL: la suite d\'avant\nexit=1\n');
ok(waitFor(`(sleep 2; echo exit=0 >> "${suiteFile}") & sh "${waitSuite}" "${suiteFile}" 0 900`) === 'FINISHED', 'wait-suite.sh rend FINISHED quand la suite finit');
ok(waitFor(`sh "${waitSuite}"`).indexOf('usage') === 0, 'wait-suite.sh sans fichier dit son usage au lieu d\'attendre quinze minutes');
fs.rmSync(waitDir, { recursive: true, force: true });

const ver = fs.readFileSync(path.join(ROOT, 'docs/agents/plan-runs/verifier.md'), 'utf8');
const iCo = ver.indexOf('git checkout -- index.html artifact.html'), iSt = ver.indexOf('`git status --short`');
ok(iCo >= 0 && iSt >= 0 && iCo < iSt, 'verifier.md remet index.html et artifact.html avant la vérification de l\'arbre entier');

// Le garde-fou git reste branché, pour les deux shells.
const guard = (hooks.PreToolUse || []).find(e => e.matcher === 'Bash|PowerShell');
ok(guard && /block-dangerous-git\.js/.test(guard.hooks[0].command), 'le garde-fou git est toujours branché');

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails ? 1 : 0);
