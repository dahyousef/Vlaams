/* Full user journey with a Dutch voice installed.
   Walks every screen and every flow the way a person would, and reports
   anything that throws, renders empty, or contradicts itself. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];
const VOICE = process.argv[3] || 'nl-BE';
const BROWSER = process.argv[4] || 'OPR';

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('   ✗ ' + m); fails++; } };
const head = s => console.log('\n' + s);

/* ---------- a browser, roughly ---------- */

/* Générateur déterministe : un test qui échoue au hasard vaut moins que pas de
   test du tout. La graine rend chaque exécution reproductible, en local comme
   en CI, et un échec devient donc un vrai signal. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const RAND = rng(Number(process.env.SEED || 20260917));
const SafeMath = Object.create(Math);
SafeMath.random = RAND;

const store = {};
const listeners = {};
function mkEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), innerHTML: '', value: '', disabled: false,
    scrollTop: 0, dataset: {}, files: [], style: {}, children: [],
    classList: { _s: new Set(), contains(n) { return this._s.has(n); }, add(n) { this._s.add(n); }, remove(n) { this._s.delete(n); } },
    addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
    removeEventListener() {}, setSelectionRange() {}, focus() {}, select() {}, click() {},
    setAttribute() {}, removeAttribute() {}, remove() {}, appendChild() {},
    insertAdjacentHTML() {}, matches: () => false, closest: () => null,
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
  };
  return el;
}
const app = mkEl('div');

const voices = VOICE === 'none' ? [{ name: 'Microsoft Hazel', lang: 'en-GB' }]
  : VOICE === 'nl-NL' ? [{ name: 'Microsoft Frank', lang: 'nl-NL' }, { name: 'Microsoft Hazel', lang: 'en-GB' }]
    : [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE' },
       { name: 'Microsoft Frank', lang: 'nl-NL' }, { name: 'Microsoft Hazel', lang: 'en-GB' }];

const spoken = [];
const ctx = {
  console,
  setTimeout: (f) => { try { f(); } catch (e) { console.log('   ✗ timer threw: ' + e.message); fails++; } return 0; },
  clearTimeout() {}, setInterval() {}, clearInterval() {}, requestAnimationFrame: f => f(),
  Math: SafeMath, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
  Blob: function (parts) { this.size = (parts && parts[0] || '').length; },
  Audio: function () { return { play: () => Promise.resolve(), onended: null }; },
  FileReader: function () { this.readAsText = () => { this.onload && this.onload(); }; },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
  },
  navigator: {
    onLine: true,
    userAgent: BROWSER === 'OPR'
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 OPR/106.0'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36 Edg/120.0',
    mediaDevices: { getUserMedia: () => Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) },
    clipboard: { writeText: () => Promise.resolve() }
  },
  MediaRecorder: function () {},
  location: { hash: '', protocol: 'https:', origin: 'https://claude.ai', href: 'https://claude.ai/x' },
  speechSynthesis: {
    getVoices: () => voices,
    speak: u => { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); if (u.onend) u.onend(); },
    cancel() {}, addEventListener() {}
  },
  SpeechSynthesisUtterance: function (t) { this.text = t; },
  document: {
    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
    getElementById: id => (id === 'app' ? app : mkEl('input')),
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
    activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} },
    execCommand: () => true
  }
};
if (BROWSER !== 'OPR') {
  ctx.webkitSpeechRecognition = function () {
    this.start = () => {
      const said = ctx.__saidNext || '';
      if (this.onresult) this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: said }], { isFinal: true, length: 1 })] });
      if (this.onend) this.onend();
    };
    this.abort = () => {};
  };
}
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = ctx;
ctx.addEventListener = (t, f) => { (listeners[t] = listeners[t] || []).push(f); };
vm.createContext(ctx);

const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);
for (const f of FILES) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
}
const NL = ctx.NL, U = NL.util;

/* Drives a screen's click handler the way the shell would. */
function tap(screen, data) {
  const S = NL.screens[screen];
  if (!S || !S.click) return;
  try { S.click({ dataset: data }, data); }
  catch (e) { console.log('   ✗ click ' + screen + ' ' + JSON.stringify(data) + ' threw: ' + e.message); fails++; }
}
function view(screen, arg) {
  try {
    const html = NL.screens[screen].render(arg);
    ok(typeof html === 'string' && html.length > 200, screen + ' rendered almost nothing');
    ok(html.indexOf('undefined') < 0, screen + ' printed the word "undefined"');
    ok(html.indexOf('[object Object]') < 0, screen + ' printed [object Object]');
    ok(html.indexOf('NaN') < 0, screen + ' printed NaN');
    return html;
  } catch (e) { console.log('   ✗ ' + screen + ' render threw: ' + e.message); fails++; return ''; }
}

(async () => {
  await NL.state.open();
  NL.content.refresh();
  /* app.js has already bound the shell on load — binding again would double every click. */

  console.log('USER JOURNEY — voice ' + VOICE + ', browser ' + (BROWSER === 'OPR' ? 'Opera' : 'Edge'));

  /* ---------------------------------------------------------- 1. voice */
  head('1. Voice and microphone');
  const v = NL.speech.voiceInfo();
  console.log('   quality=' + v.quality + '  name=' + (v.name || '—') + '  tier=' + NL.speech.tier().id);
  if (VOICE === 'nl-BE') {
    ok(v.quality === 'be', 'a Flemish voice is installed but the app did not select it');
    ok(v.name && /Belgium/.test(v.name), 'wrong voice chosen: ' + v.name);
  }
  NL.speech.say('Goeiedag');
  ok(spoken.length > 0, 'nothing was spoken');
  ok(spoken[0].lang === (VOICE === 'nl-BE' ? 'nl-BE' : 'nl-NL'), 'wrong utterance language: ' + spoken[0].lang);
  ok(NL.speech.listenBlocked() === (BROWSER === 'OPR' ? 'browser' : null), 'wrong recogniser verdict');

  /* home must not nag about the voice once a Flemish one exists */
  const home0 = view('vandaag');
  if (VOICE === 'nl-BE') ok(home0.indexOf('notice') < 0, 'still warning about the voice after a Flemish one is installed');
  else ok(home0.indexOf('notice') >= 0, 'not warning about a missing/northern voice');

  /* ---------------------------------------------------------- 2. every screen */
  head('2. Every screen renders');
  ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek',
   'register', 'klanken', 'dehet', 'doctor'].forEach(s => view(s));
  NL.content.sheets.forEach(sh => view('spiek', sh.id));
  console.log('   ' + (11 + NL.content.sheets.length) + ' screens drawn');

  /* ---------------------------------------------------------- 3. placement */
  head('3. Placement test, answered honestly');
  const P = NL.screens.placement;
  view('placement');
  let guard = 0;
  while (guard++ < 40) {
    const html = P.render();
    if (html.indexOf('done-stage') >= 0) break;
    tap('placement', { opt: '0' });          // whatever is first, like a real guess
    tap('placement', { act: 'next' });
  }
  ok(P.render().indexOf('done-stage') >= 0, 'placement never finished');
  console.log('   finished in ' + guard + ' questions, seeded ' + NL.srs.counts().seen + ' items');
  ok(NL.state.meta().placed === true, 'placement did not mark itself done');

  /* ---------------------------------------------------------- 4. every exercise */
  head('4. Every exercise type, driven to a correct answer');
  const S = NL.screens.sessie;
  const seen = {};
  for (let round = 0; round < 14; round++) {
    /* Push items up the ladder so later rungs actually appear. */
    NL.content.allItems().forEach(it => {
      const r = NL.state.rec(it.id);
      if (r) { r.stage = Math.min(NL.srs.MAX_STAGE, round % (NL.srs.MAX_STAGE + 1)); r.due = 0; NL.state.setRec(r); }
      else NL.srs.seed(it, round % (NL.srs.MAX_STAGE + 1));
    });
    NL.state.allRecs().forEach(r => { r.due = 0; NL.state.setRec(r); });
    if (!S.begin('vandaag')) continue;
    let turns = 0;
    while (turns++ < 40) {
      const c = S.peek();
      if (!c) break;
      seen[c.ex] = (seen[c.ex] || 0) + 1;
      let html = '';
      try { html = S.render(); } catch (e) { console.log('   ✗ ' + c.ex + ' render threw: ' + e.message); fails++; break; }
      if (html.indexOf('done-stage') >= 0) break;
      ok(html.indexOf('undefined') < 0, c.ex + ' printed "undefined"');

      const ex = NL.ex.get(c.ex), task = c.task;
      if (c.ex === 'match') {
        for (let k = 0; k < task.pairs.length; k++) {
          tap('sessie', { match: 'l' + k, k: String(k), side: 'l' });
          tap('sessie', { match: 'r' + k, k: String(k), side: 'r' });
        }
        continue;
      }
      if (task.opts) {
        const i = task.opts.findIndex(o => o.ok);
        tap('sessie', { opt: String(i < 0 ? 0 : i) });
      }
      if (task.bank) {
        const want = U.tiles(ex.answer(task)), used = new Set();
        want.forEach(w => {
          const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
          if (i >= 0) { used.add(i); tap('sessie', { pick: String(i) }); }
        });
      }
      if (c.ex === 'corrige') tap('sessie', { opt: String(task.faulty) });
      if (c.ex === 'open') S.input({ classList: { contains: n => n === 'textin' }, value: task.task.model });
      if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) {
        S.input({ classList: { contains: n => n === 'textin' }, value: ex.answer(task) });
      }
      if (c.ex === 'speak') {
        if (NL.speech.listenBlocked()) { tap('sessie', { rec: 'start' }); tap('sessie', { self: '1' }); }
        else { ctx.__saidNext = ex.answer(task); tap('sessie', { mic: 'start' }); }
      }
      tap('sessie', { check: '1' });
      const after = S.render();
      if (c.ex !== 'match') ok(after.indexOf('foot ok') >= 0 || after.indexOf('foot no') >= 0, c.ex + ' gave no verdict');
      if (c.ex !== 'match') ok(after.indexOf('foot no') < 0, c.ex + ' rejected a correct answer');
      tap('sessie', { next: '1' });
    }
    S.abandon();
  }
  Object.keys(seen).sort().forEach(k => console.log('   ' + k.padEnd(12) + seen[k]));
  ['pick', 'article', 'bank', 'cloze', 'dictation', 'type', 'speak', 'order'].forEach(k =>
    ok(seen[k] > 0, 'exercise type never appeared: ' + k));

  /* ---------------------------------------------------------- 5. scenario */
  head('5. A scenario, all the way through');
  NL.content.scenarios.forEach(scn => {
    NL.ui.go('scenario', scn.id);
    let g = 0, said = 0;
    while (g++ < 60) {
      const html = NL.screens.scenario.render(scn.id);
      if (html.indexOf('scn-done') >= 0) break;
      ok(html.indexOf('undefined') < 0, scn.id + ' printed "undefined"');
      if (html.indexOf('data-step="next"') >= 0) { tap('scenario', { step: 'next' }); continue; }
      if (html.indexOf('data-choice=') >= 0) { tap('scenario', { choice: '0' }); continue; }
      tap('scenario', { self: '1' }); said++;
    }
    ok(NL.screens.scenario.render(scn.id).indexOf('scn-done') >= 0, scn.id + ' never reached the end');
    console.log('   ' + scn.id.padEnd(12) + g + ' steps, ' + said + ' spoken turns');
  });
  ok((NL.state.meta().scenariosDone || []).length === NL.content.scenarios.length, 'not every scenario was recorded as done');

  /* ---------------------------------------------------------- 6. listening */
  head('6. Listening, both modes');
  ['begrijpen', 'nazeggen'].forEach(mode => {
    tap('luisteren', { act: 'menu' });
    tap('luisteren', { act: mode });
    let g = 0;
    while (g++ < 40) {
      const html = NL.screens.luisteren.render();
      if (html.indexOf('done-stage') >= 0) break;
      ok(html.indexOf('undefined') < 0, 'listening ' + mode + ' printed "undefined"');
      if (mode === 'begrijpen' && html.indexOf('data-act="next"') < 0) tap('luisteren', { opt: '0' });
      tap('luisteren', { act: 'next' });
    }
    ok(NL.screens.luisteren.render().indexOf('done-stage') >= 0, 'listening ' + mode + ' never finished');
    console.log('   ' + mode.padEnd(12) + g + ' clips');
  });

  /* ---------------------------------------------------------- 7. own words */
  head('7. Word list: search, add, delete');
  tap('woorden', { act: 'addform' });
  const before = NL.state.customs().length;
  ctx.document.getElementById = id => {
    const e = mkEl('input');
    if (id === 'add-nl') e.value = 'de vergaderzaal';
    if (id === 'add-en') e.value = 'la salle de réunion';
    if (id === 'add-be') e.value = '';
    if (id === 'app') return app;
    return e;
  };
  tap('woorden', { act: 'addsave' });
  ok(NL.state.customs().length === before + 1, 'adding a word did nothing');
  const mine = NL.state.customs()[0];
  ok(NL.content.byId(mine.id), 'the added word never reached the scheduler');
  ok(view('woorden').indexOf('vergaderzaal') >= 0, 'the added word is not in the list');
  NL.screens.woorden.input({ id: 'wsearch', value: 'vergader' });
  ok(view('woorden').indexOf('vergaderzaal') >= 0, 'search cannot find the word just added');
  NL.screens.woorden.input({ id: 'wsearch', value: '' });
  tap('woorden', { del: mine.id });
  ok(NL.state.customs().length === before, 'deleting a word did nothing');
  console.log('   add, find, delete all work');

  /* ---------------------------------------------------------- 8. settings */
  head('8. Settings');
  const fire = data => {
    const el = { dataset: data, closest: () => ({ dataset: data }) };
    (listeners.click || []).forEach(f => { try { f({ target: { closest: () => el } }); } catch (e) { console.log('   ✗ settings ' + JSON.stringify(data) + ' threw: ' + e.message); fails++; } });
  };
  NL.ui.openSheet('instellingen');
  ['system', 'light', 'dark'].forEach(th => { fire({ theme: th }); ok(NL.state.meta().theme === th, 'theme ' + th + ' did not stick'); });
  const wasFlemish = NL.state.meta().showFlemish !== false;
  fire({ toggle: 'showFlemish' });
  ok((NL.state.meta().showFlemish !== false) !== wasFlemish, 'the Flemish toggle did nothing');
  fire({ toggle: 'showFlemish' });
  fire({ export: '1' });
  console.log('   theme, toggles and export all respond');

  /* ---------------------------------------------------------- 9. backup */
  head('9. Backup round trip');
  const dump = JSON.stringify(NL.state.exportAll());
  const n = NL.srs.counts().seen, xp = NL.state.meta().xp;
  NL.state.clearAll();
  ok(NL.srs.counts().seen === 0, 'wipe left data behind');
  ok(NL.state.importAll(JSON.parse(dump)), 'import refused its own export');
  ok(NL.srs.counts().seen === n, 'restore lost items: ' + NL.srs.counts().seen + ' of ' + n);
  ok(NL.state.meta().xp === xp, 'restore lost XP');
  ok(NL.state.importAll({ app: 'something-else' }) === false, 'import accepted a foreign file');
  ok(NL.state.importAll(null) === false, 'import accepted null');
  console.log('   ' + n + ' items and ' + xp + ' XP survived a wipe');

  /* ---------------------------------------------------------- 10. doctor */
  head('10. Audio doctor');
  const d0 = view('doctor');
  if (VOICE === 'nl-BE') ok(d0.indexOf('Voix flamande installée') >= 0, 'doctor does not confirm the installed Flemish voice');
  else ok(d0.indexOf('docFix') >= 0 || d0.indexOf('Paramètres') >= 0, 'doctor does not offer the install steps');
  tap('doctor', { act: 'play' });
  tap('doctor', { act: 'heard-yes' });
  tap('doctor', { act: 'recheck' });
  tap('doctor', { act: 'rec' });
  await new Promise(r => setImmediate(r));
  const d1 = view('doctor');
  ok(d1.indexOf('cadre') >= 0 || d1.indexOf('Autorisation') >= 0, 'doctor did not explain the blocked microphone');
  console.log('   browser=' + NL.speech.browserName() + ', tier=' + NL.speech.tier().id + ', mic refusal explained');

  /* ---------------------------------------------------------- 11. keyboard */
  head('11. Keyboard');
  S.begin('vandaag');
  ['1', '2', 'Enter', 'r', 'm', 'Backspace', 'Escape'].forEach(k => {
    try { S.key({ key: k, preventDefault() {} }); }
    catch (e) { console.log('   ✗ key "' + k + '" threw: ' + e.message); fails++; }
  });
  S.abandon();
  console.log('   no key throws');

  /* ---------------------------------------------------------- 12. streak */
  head('12. Streak across days');
  NL.state.clearAll();
  const day = d => U.dayKey(Date.now() - d * U.DAY);
  NL.state.setMeta({ lastDay: day(1), streak: 3, best: 3 });
  NL.state.creditDay(5);
  ok(NL.state.meta().streak === 4, 'a consecutive day did not extend the streak (got ' + NL.state.meta().streak + ')');
  NL.state.setMeta({ lastDay: day(3), streak: 9, best: 9 });
  NL.state.creditDay(5);
  ok(NL.state.meta().streak === 1, 'a three-day gap did not reset the streak (got ' + NL.state.meta().streak + ')');
  ok(NL.state.meta().best >= 9, 'best streak was lost');
  const t0 = NL.state.meta().doneToday;
  NL.state.creditDay(3);
  ok(NL.state.meta().doneToday === t0 + 3, 'the daily counter is not counting new items');
  console.log('   consecutive extends, gap resets, best kept, counter counts items');

  /* ---------------------------------------------------------- 13. promise vs delivery */
  head('13. What the home screen promises is what the session gives');
  NL.state.clearAll(); NL.content.refresh();
  const plan = NL.srs.plan();
  S.begin('vandaag');
  const real = S.peek() ? NL.screens.sessie.render().match(/class="pill">\d+\/(\d+)</) : null;
  const delivered = real ? +real[1] : 0;
  console.log('   promised ' + plan.total + ', session holds ' + delivered);
  ok(Math.abs(plan.total - delivered) <= 1, 'home promises ' + plan.total + ' but the session holds ' + delivered);
  S.abandon();

  console.log('\n' + checks + ' checks, ' + (fails === 0 ? 'NO PROBLEMS' : fails + ' PROBLEM(S)'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
