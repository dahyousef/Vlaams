/* Les outils de la passe d'apprenant, sans navigateur : une page qui fait semblant, et assez de
   NL pour qu'une carte se joue. Une passe qui s'arrête en route doit le dire : elle plafonnait
   ses cartes en silence, et sweep.js ses touchers.
     node test/tools/learner-pass.js . */
const fs = require('fs'), os = require('os'), path = require('path');
const ROOT = path.resolve(process.argv[2] || '.');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

/* common.js charge Playwright et ouvre un navigateur : session.js n'en veut que ces deux noms. */
const common = path.join(ROOT, 'tools', 'learner-pass', 'common.js');
require.cache[common] = { id: common, filename: common, loaded: true, exports: { sleep: () => Promise.resolve(), SHOTS: os.tmpdir() } };
const { playSession, STUCK } = require(path.join(ROOT, 'tools', 'learner-pass', 'session.js'));

/* Une séance de `cards` cartes à un seul bouton ; sans limite, elle ne finit jamais. */
function fakeSession(cards) {
  let played = 0;
  const route = () => (played < cards ? 'sessie' : 'vandaag');
  global.NL = {
    ui: { get route() { return route(); } },
    util: {},
    ex: { get: () => ({ answer: () => 'hallo' }) },
    screens: { sessie: { peek: () => ({ ex: 'pick', task: { opts: [{ ok: true }], item: { id: 'w' + played } } }) } }
  };
  global.document = { querySelector: () => ({ innerText: 'fin' }) };
  const button = { click: () => Promise.resolve() };
  return {
    click: () => Promise.resolve(),
    fill: () => Promise.resolve(),
    screenshot: () => Promise.resolve(),
    evaluate: (f, a) => Promise.resolve(f(a)),
    $: () => Promise.resolve(button),
    waitForSelector: () => Promise.resolve({ getAttribute: () => Promise.resolve('btn-good'), click: () => { played++; return Promise.resolve(); } })
  };
}

(async () => {
  console.log('UNE PASSE QUI S\'ARRÊTE EN ROUTE');
  const never = await playSession(fakeSession(Infinity), 'cap', {});
  const said = never.log.filter(e => STUCK.test(e.result));
  ok(said.length === 1, 'a session that never ends: the pass stopped after ' + never.log.length + ' cards and reported ' + said.length + ' problem(s)');
  const ended = await playSession(fakeSession(3), 'fin', {});
  ok(ended.log.length === 3 && !ended.log.some(e => STUCK.test(e.result)), 'a session of 3 cards: ' + ended.log.length + ' cards logged, or a problem reported on an ending session');
  const exact = await playSession(fakeSession(120), 'exact', {});
  ok(!exact.log.some(e => STUCK.test(e.result)), 'a session that ends on its 120th card was reported as not ending');
  console.log('  jamais finie : ' + never.log.length + ' lignes, dont ' + said.length + ' qui le dit ; finie : ' + ended.log.length + ' cartes');

  const sweep = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'sweep.js'), 'utf8');
  ok(/const n = await p\.evaluate\([^\n]*\.length, \[CAND, SKIP\]\);/.test(sweep) && /for \(let i = 0; i < n; i\+\+\)/.test(sweep) && !/Math\.(min|max)\(/.test(sweep),
    'sweep.js must walk every tappable thing: the count is the whole list, the loop runs to it, and no Math.min caps it');

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'LEARNER PASS TOOLS OK'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL: ' + e.stack); process.exit(1); });
