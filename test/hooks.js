/* Les deux crochets de SessionStart et l'ordre du vérificateur. Le rappel de reprise : .claude/settings.json le
   branche sur SessionStart (compact|resume), et ce qu'il imprime entre dans le contexte de la session. Le crochet
   du transcript (startup|clear) imprime le chemin que Claude Code lui donne sur stdin. verifier.md remet les
   sorties du build avant de vérifier l'arbre et laisse son retour dans un fichier que son contrôleur lit. Le texte
   du kit ne porte aucun caractère de contrôle, et sa commande de lancement nomme claude.exe en entier. Le kit dit
   comment un agent en attend un autre, wait-suite.sh attend la fin de la suite, et fanout.js s'arrête à sa limite
   de temps. On lance les commandes telles que Claude Code les lance. */
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
// Le vérificateur laisse son retour dans un fichier avant de le rendre, et son contrôleur le lit là quand le retour n'a
// pas sa ligne : en plan 4b, trois vérificateurs sur dix ont rendu la main sans elle, et leurs contrôleurs ont lu tmp/suite.txt.
ok(/with the one line `verifying <commit>`/.test(oneLine('verifier.md')) && /goes first to `<WS>\/tmp\/verifier\.txt`[^.]*`verified <commit>`/.test(oneLine('verifier.md')), 'verifier.md ouvre tmp/verifier.txt sur « verifying », puis y écrit son retour sous le commit vérifié');
ok(/stopped without that line, read `<WS>\/tmp\/verifier\.txt`[^.]*\. When its first line is `verified <the commit you gave it>`/.test(tc), 'task-controller.md lit tmp/verifier.txt quand le retour n\'a pas sa ligne, et vérifie le commit');
ok(/`DÉLAI DÉPASSÉ`[^.]*dispatch a new verifier with a new wait, once/.test(tc), 'task-controller.md relance le vérificateur, une fois, quand fanout.js a passé sa limite de temps');
ok(/Search the file for `FAIL` and for `DÉLAI DÉPASSÉ`/.test(oneLine('verifier.md')), 'verifier.md relève la ligne DÉLAI DÉPASSÉ, que FAIL ne trouve pas');
// La limite de temps de test/tools/fanout.js : relancé sous un délai d'un millième de seconde, il imprime sa ligne et sort en 1.
const cut = spawnSync(process.execPath, [path.join(ROOT, 'test/tools/fanout.js'), ROOT], { encoding: 'utf8', env: Object.assign({}, env, { FANOUT_LIMIT: '0.001' }) });
ok(cut.status === 1 && /^DÉLAI DÉPASSÉ : test\/tools\/fanout\.js n'a pas fini en 0\.001 s ; à relancer$/m.test(cut.stdout), 'fanout.js coupe son passage à sa limite de temps et le dit');
for (const f of ['task-controller.md', 'batch-controller.md', 'closing-review.md', 'verifier.md']) {
  ok(/naming what you wait for, never in your return's form/.test(oneLine(f)), f + ' dit avec quoi terminer son tour');
}
ok(/Step 4 starts once all of them have returned/.test(oneLine('closing-review.md')), 'closing-review.md attend tous ses relecteurs');
ok(/^\*\.sh text eol=lf$/m.test(fs.readFileSync(path.join(ROOT, '.gitattributes'), 'utf8')), '.gitattributes garde les scripts en LF');

// wait-suite.sh : une suite finie après son lancement rend FINISHED ; le `exit=` de la suite d'avant ne compte pas.
const waitSuite = path.join(kit, 'wait-suite.sh').replace(/\\/g, '/');
const waitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wait-suite-'));
const suiteFile = path.join(waitDir, 'suite.txt').replace(/\\/g, '/');
const waitFor = script => (spawnSync('sh', ['-c', script], { cwd: ROOT, env, encoding: 'utf8', timeout: 60000 }).stdout || '').trim();
fs.writeFileSync(suiteFile, 'exit=0\n');
ok(/^STALE: /.test(waitFor(`sh "${waitSuite}" "${suiteFile}" 0 1`)), 'wait-suite.sh ne prend pas le exit= de la suite d\'avant');
// STALE dit si la suite tourne encore : une seconde suite à côté mêlerait le fichier et les sorties du build.
ok(/no suite runs$/.test(waitFor(`sh "${waitSuite}" "${suiteFile}" 0 1`)), 'wait-suite.sh dit qu\'aucune suite ne tourne');
ok(waitFor(`sh "${waitSuite}" --running "${suiteFile}"`) === 'no suite runs', 'wait-suite.sh --running sans pid : aucune suite');
const standIn = path.join(waitDir, 'run-all.sh').replace(/\\/g, '/');
// Une fausse suite finit quand le test le lui dit (au plus une minute), pas après un temps deviné : sur une machine
// chargée, un `sleep` court finirait avant le contrôle, et le contrôle dirait qu'aucune suite ne tourne.
const fakeSuite = dir => `for i in $(seq 60); do [ -f "${dir}/stop" ] && break; sleep 1; done\n`;
fs.writeFileSync(standIn, fakeSuite(waitDir));
ok(/^a suite still runs\nSTALE: .*a suite still runs$/.test(waitFor(`sh "${standIn}" >/dev/null 2>&1 & echo $! > "${suiteFile}.pid"; sh "${waitSuite}" --running "${suiteFile}"; sh "${waitSuite}" "${suiteFile}" 0 1; touch "${waitDir}/stop"; wait`)), 'wait-suite.sh dit qu\'une suite tourne encore, avec --running comme après STALE');
// Le numéro seul ne suffit pas : après un redémarrage, un autre programme peut le porter.
ok(waitFor(`sleep 60 >/dev/null 2>&1 & P=$!; echo $P > "${suiteFile}.pid"; sh "${waitSuite}" --running "${suiteFile}"; kill $P`) === 'no suite runs', 'wait-suite.sh ne prend pas un autre programme, au même numéro, pour la suite');
ok(waitFor(`sh "${waitSuite}" --running`).indexOf('usage') === 0, 'wait-suite.sh --running sans fichier dit son usage');
fs.rmSync(suiteFile + '.pid');
fs.writeFileSync(suiteFile, 'FAIL: la suite d\'avant\nexit=1\n');
ok(waitFor(`(sleep 2; echo exit=0 >> "${suiteFile}") & sh "${waitSuite}" "${suiteFile}" 0 900`) === 'FINISHED', 'wait-suite.sh rend FINISHED quand la suite finit');
ok(waitFor(`sh "${waitSuite}"`).indexOf('usage') === 0, 'wait-suite.sh sans fichier dit son usage au lieu d\'attendre quinze minutes');
// Une fausse suite peut vivre un instant après son dernier fichier, et Windows refuse d'effacer ce qu'un processus tient.
fs.rmSync(waitDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });

const ver = fs.readFileSync(path.join(ROOT, 'docs/agents/plan-runs/verifier.md'), 'utf8');
const iCo = ver.indexOf('git checkout -- index.html artifact.html'), iSt = ver.indexOf('`git status --short`');
ok(iCo >= 0 && iSt >= 0 && iCo < iSt, 'verifier.md remet index.html et artifact.html avant la vérification de l\'arbre entier');

// verify.sh tel que verifier.md l'écrit, sur une fausse suite. Arrêter le shell d'un agent n'arrête pas sa suite (mesuré
// le 2026-11-02) : le pid laissé doit rester celui de la suite une fois ce shell tué, ou une seconde suite part à côté.
const verifyBlock = (ver.match(/Write `<WS>\/tmp\/verify\.sh` with the Write tool:\s*\n([\s\S]*?)\n\s*\n\s*and run/) || [])[1] || '';
const verifyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-sh-')).replace(/\\/g, '/');
fs.mkdirSync(path.join(verifyDir, 'tmp'));
fs.mkdirSync(path.join(verifyDir, 'test'));
fs.writeFileSync(path.join(verifyDir, 'tmp/verify.sh'), verifyBlock.replace(/^\s+/gm, '').split('<WS>').join(verifyDir) + '\n');
const inVerifyDir = script => waitFor(`cd "${verifyDir}" && git init -q && ${script}`);
fs.writeFileSync(path.join(verifyDir, 'test/run-all.sh'), `echo $$ > "${verifyDir}/own.pid"\n${fakeSuite(verifyDir)}touch "${verifyDir}/ended"\nexit 3\n`);
const untilFile = file => `i=0; while [ ! -f "${file}" ] && [ $i -lt 30 ]; do sleep 1; i=$((i+1)); done`;
ok(/a suite still runs$/.test(inVerifyDir(`{ sh tmp/verify.sh & V=$!; ${untilFile(`${verifyDir}/own.pid`)}; kill -9 $V; sh "${path.resolve(waitSuite).replace(/\\/g, '/')}" "${verifyDir}/tmp/suite.txt" 0 1; cp tmp/suite.txt.pid left.pid; touch stop; ${untilFile(`${verifyDir}/ended`)}; }`)), 'le pid de verify.sh reste celui de la suite une fois son shell tué');
ok(fs.readFileSync(path.join(verifyDir, 'left.pid'), 'utf8').trim() === fs.readFileSync(path.join(verifyDir, 'own.pid'), 'utf8').trim(), 'le pid de verify.sh est celui de la suite elle-même, pas du shell qui la lance');
// Une garde, pas une preuve : le code de sortie passait déjà ; il doit survivre à la forme que prend le lancement.
fs.writeFileSync(path.join(verifyDir, 'test/run-all.sh'), 'exit 3\n');
inVerifyDir('sh tmp/verify.sh');
ok(/^exit=3$/m.test(fs.readFileSync(path.join(verifyDir, 'tmp/suite.txt'), 'utf8')), 'verify.sh écrit le code de sortie de la suite');
ok(!fs.existsSync(path.join(verifyDir, 'tmp/suite.txt.pid')), 'verify.sh retire son pid quand la suite finit : un numéro réutilisé ne se prend pas pour elle');
fs.rmSync(verifyDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });

// La suite ne part qu'à un endroit, et il regarde d'abord : c'est ce qui couvre une suite orpheline, après une coupure.
const verLine = ver.replace(/\s+/g, ' ');
ok(/wait-suite\.sh --running "<WS>\/tmp\/suite\.txt"/.test(verLine) && verLine.indexOf('--running') < verLine.indexOf('git update-index'), 'verifier.md regarde si une suite tourne avant de toucher à l\'arbre');
ok(/`VERIFIER: fail — a suite still runs`/.test(verLine) && /`VERIFIER: fail — a suite still runs`: stop its wait with `TaskStop` and return `needs ruling`/.test(tc), 'une suite qui tourne déjà va en question, pas en seconde suite');
ok(/No `exit=` line, `exit=0` without that line[^.]*, or `exit=129`, `130`, `137` or `143`[^.]*commit\. Run step 1's `--running` check/.test(verLine), 'une suite qu\'on a tuée n\'est pas un échec du code, et le vérificateur regarde si elle tourne encore');
// Tuée depuis Windows (taskkill /F, mesuré le 2026-11-02), une suite rend exit=0 sans sa dernière ligne : exit=0 seul serait un faux succès.
const lastEcho = fs.readFileSync(path.join(ROOT, 'test/run-all.sh'), 'utf8').trim().split('\n').pop().replace(/^echo "|"$/g, '');
ok(verLine.indexOf('Pass: `exit=0`, the line `' + lastEcho + '` just above it') >= 0, 'verifier.md ne compte un succès qu\'avec la dernière ligne de run-all.sh');
// Un test qui plante (134, 139) arrête la suite aussi, mais c'est un résultat : `suite cut off` la relancerait sans rien corriger.
ok(!/above 128/.test(verLine), 'verifier.md ne prend pas le plantage d\'un test pour une coupure');
ok(!/kill -0/.test(verLine), 'verifier.md n\'a qu\'une façon de regarder, utilisable depuis PowerShell');
ok(/both count as a cut-off/.test(tc), 'STALE et suite cut off comptent tous deux pour une coupure');
ok(/`<WS>` out[^.]*absolute path/.test(oneLine('one-session.md')), 'one-session.md écrit <WS> en chemin absolu dans ses envois');
ok(/`UNFINISHED:`/.test(oneLine('closing-review.md')) && /UNFINISHED: /.test(oneLine('closing-review.md')), 'la revue de clôture dit un retour forcé par sa ligne UNFINISHED');

// Le garde-fou git reste branché, pour les deux shells.
const guard = (hooks.PreToolUse || []).find(e => e.matcher === 'Bash|PowerShell');
ok(guard && /block-dangerous-git\.js/.test(guard.hooks[0].command), 'le garde-fou git est toujours branché');

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails ? 1 : 0);
