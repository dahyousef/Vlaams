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
require.cache[common] = { id: common, filename: common, loaded: true, exports: { sleep: () => Promise.resolve(), SHOTS: os.tmpdir(), open: () => Promise.reject(new Error('pas de navigateur')), verdict: () => {} } };
const { playSession, playConversation, STUCK } = require(path.join(ROOT, 'tools', 'learner-pass', 'session.js'));
const rules = require(path.join(ROOT, 'tools', 'learner-pass', 'rules.js'));

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

/* Une conversation à l'écran : `spec` donne, dans l'ordre, 'them' ou le nombre de choix d'un tour « vous ».
   Avec `stuck`, toucher un choix ne fait rien : la conversation ne finit jamais. */
function fakeConversation(spec, stuck) {
  const picks = [];
  let at = 0, phase = '';
  const settle = () => { phase = at >= spec.length ? 'done' : spec[at] === 'them' ? 'them' : 'choose'; };
  settle();
  global.window = {};
  global.document = {
    querySelectorAll: () => new Array(spec[at]),
    querySelector: () => ({ dataset: { say: 'hallo' } })
  };
  const el = { click: () => Promise.resolve() };
  const when = { '[data-step="again"]': 'done', '[data-step="next"]': 'them', '[data-choice]': 'choose', '[data-act="accept"]': 'scored', '[data-mic="start"]': 'speak' };
  return {
    picks,
    screenshot: () => Promise.resolve(),
    evaluate: (f, a) => Promise.resolve(f(a)),
    $: sel => Promise.resolve(when[sel] === phase ? el : null),
    click: sel => {
      if (sel === '[data-step="next"]' || sel === '[data-act="accept"]') { at++; settle(); }
      else if (/^\[data-choice="\d+"\]$/.test(sel)) { picks.push(+sel.match(/\d+/)[0]); if (!stuck) phase = 'speak'; }
      else if (sel === '[data-mic="stop"]') phase = 'scored';
      return Promise.resolve();
    },
    waitForSelector: () => Promise.resolve({ getAttribute: () => Promise.resolve('mic-panel good') })
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

  console.log('\nUNE CONVERSATION, PUIS CHACUNE');
  const three = fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]);
  const r1 = await playConversation(three, 's-test', {});
  ok(r1.finished && r1.problems.length === 0, 'a conversation that ends: finished=' + r1.finished + ', problems ' + JSON.stringify(r1.problems));
  ok(JSON.stringify(r1.picks) === '[0,0,0,0]', 'at pass 0, choice 0 at every you step: expected [0,0,0,0], tapped ' + JSON.stringify(r1.picks));
  ok(r1.turns === 4, 'four spoken turns, played ' + r1.turns);
  const r2 = await playConversation(fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]), 's-test', { pass: 1 });
  const r3 = await playConversation(fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]), 's-test', { pass: 2 });
  ok(JSON.stringify([r2.picks, r3.picks]) === '[[1,1,1,1],[2,0,2,0]]', 'pass 1: choice 1 everywhere; pass 2: choice 2 on the 3-choice steps, 0 on the 2-choice ones: expected [[1,1,1,1],[2,0,2,0]], tapped ' + JSON.stringify([r2.picks, r3.picks]));
  ok([0, 1, 2].every(k => [r1, r2, r3].some(r => r.picks[0] === k)), 'the three passes together tap all three choices of the 3-choice step');
  ok(r3.lines.indexOf('  you step 0: choice 2 of 3') >= 0, 'pass 2 prints "you step 0: choice 2 of 3"');
  const stuck = await playConversation(fakeConversation(['them', 2, 'them'], true), 's-bloquee', {});
  ok(!stuck.finished && stuck.problems.some(x => /^conversation s-bloquee did not reach its end$/.test(x)), 'a conversation that never ends must be reported, got ' + JSON.stringify(stuck.problems));
  ok(stuck.lines.indexOf('  NOT FINISHED') >= 0, 'a conversation that never ends prints NOT FINISHED');
  console.log('  touches : ' + JSON.stringify([r1.picks, r2.picks, r3.picks]) + ' ; bloquée : ' + stuck.problems.length + ' problème(s)');

  const corners = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'corners.js'), 'utf8');
  ok(/NL\.content\.scenarios\.map/.test(corners) && /'\\nCONVERSATION ' \+ ids\[c\]/.test(corners) && !/s-bakker/.test(corners),
    'corners.js must play every scenario of NL.content.scenarios, print one CONVERSATION <id> line each, and name none');
  ok(/pass: q/.test(corners) && /Math.max.apply/.test(corners), 'corners.js must play one pass per choice position, q from 0 to the largest choice count of a you step');

  console.log('\nLES FICHES DE RÈGLE');
  const good = { title: 'Titre', rule: 'La règle', explain: 'Pourquoi', rows: 3, sw: 390, cardOver: 0, wide: [] };
  ok(rules.judgeSheet('g-x', good, { rows: 3 }).length === 0, 'a sheet with title, rule, explanation, 3 rows and no overflow has no fault');
  ok(rules.judgeSheet('g-x', null, { rows: 3 }).join() === 'g-x: no sheet opened', 'a tap that opens no sheet is a fault');
  const lack = rules.judgeSheet('g-x', Object.assign({}, good, { title: '', rule: '', explain: '', rows: 1 }), { rows: 3 });
  ok(lack.length === 4, 'no title, rule or explanation and 1 row of 3 should be 4 faults, got ' + JSON.stringify(lack));
  ok(rules.judgeSheet('g-x', Object.assign({}, good, { sw: 420 }), { rows: 3 }).length === 1, 'a page wider than 390 px is a fault');
  ok(rules.judgeSheet('g-x', Object.assign({}, good, { cardOver: 30 }), { rows: 3 }).length === 1, 'a sheet that scrolls sideways is a fault');
  ok(rules.judgeSheet('g-x', Object.assign({}, good, { wide: ['B.nl long'] }), { rows: 3 }).length === 1, 'an element sticking out of the sheet is a fault');
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'rules.js'), 'utf8');
  ok(/querySelectorAll\('\[data-act="gram"\]'\)/.test(src) && /NL\.content\.units\.forEach/.test(src) && !/g-v2|g-present|g-dehet/.test(src),
    'rules.js reads the chips from the page and the expected count from the content, and names no rule');

  const sweep = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'sweep.js'), 'utf8');
  ok(/const n = await p\.evaluate\([^\n]*\.length, \[CAND, SKIP\]\);/.test(sweep) && /for \(let i = 0; i < n; i\+\+\)/.test(sweep) && !/Math\.(min|max)\(/.test(sweep),
    'sweep.js must walk every tappable thing: the count is the whole list, the loop runs to it, and no Math.min caps it');

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'LEARNER PASS TOOLS OK'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL: ' + e.stack); process.exit(1); });
