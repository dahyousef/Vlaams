/* Le rappel de reprise : .claude/settings.json le branche sur SessionStart (compact|resume), et ce qu'il
   imprime entre dans le contexte de la session. On lance la commande telle que Claude Code la lance. */
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

// Le garde-fou git reste branché, pour les deux shells.
const guard = (hooks.PreToolUse || []).find(e => e.matcher === 'Bash|PowerShell');
ok(guard && /block-dangerous-git\.js/.test(guard.hooks[0].command), 'le garde-fou git est toujours branché');

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails ? 1 : 0);
