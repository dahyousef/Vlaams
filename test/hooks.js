/* Les deux crochets de SessionStart et l'ordre du vérificateur. Le rappel de reprise : .claude/settings.json le
   branche sur SessionStart (compact|resume), et ce qu'il imprime entre dans le contexte de la session. Le crochet
   du transcript (startup|clear) imprime le chemin que Claude Code lui donne sur stdin. verifier.md remet les
   sorties du build avant de vérifier l'arbre. On lance les commandes telles que Claude Code les lance. */
const path = require('path'), fs = require('fs'), { spawnSync } = require('child_process');
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

const ver = fs.readFileSync(path.join(ROOT, 'docs/agents/plan-runs/verifier.md'), 'utf8');
const iCo = ver.indexOf('git checkout -- index.html artifact.html'), iSt = ver.indexOf('`git status --short`');
ok(iCo >= 0 && iSt >= 0 && iCo < iSt, 'verifier.md remet index.html et artifact.html avant la vérification de l\'arbre entier');

// Le garde-fou git reste branché, pour les deux shells.
const guard = (hooks.PreToolUse || []).find(e => e.matcher === 'Bash|PowerShell');
ok(guard && /block-dangerous-git\.js/.test(guard.hooks[0].command), 'le garde-fou git est toujours branché');

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails ? 1 : 0);
