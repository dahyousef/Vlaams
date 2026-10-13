/* Drives the real UI headlessly: renders every screen, then runs a whole session
   and a whole scenario, so any crash in a render path shows up here. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];

const B = browser.open({
  root: ROOT, location: { protocol: 'file:', origin: 'file://' },
  onTimerError: e => { throw e; }
});
const NL = B.NL, app = B.app;
let fails = 0;
const fail = m => { console.log('  FAIL: ' + m); fails++; };
const sizeOf = () => app.innerHTML.length;

NL.state.open().then(() => {
  NL.content.refresh();
  NL.ui.bind(app);

  console.log('SCREENS');
  ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor']
    .forEach(r => {
      try {
        NL.ui.go(r);
        const n = sizeOf();
        if (n < 400) fail(r + ' rendered only ' + n + ' chars');
        else console.log('  ' + r.padEnd(12) + n + ' chars');
      } catch (e) { fail(r + ' threw: ' + e.message); }
    });

  try { NL.ui.go('spiek', 'standup'); console.log('  spiek/standup ' + sizeOf() + ' chars'); }
  catch (e) { fail('cheat sheet detail threw: ' + e.message); }

  console.log('\nSHEETS');
  ['instellingen', 'reset-confirm'].forEach(s => {
    try { NL.ui.go('vandaag'); NL.ui.openSheet(s); if (app.innerHTML.indexOf('sheet-card') < 0) fail(s + ' not rendered'); else console.log('  ' + s.padEnd(14) + 'ok'); }
    catch (e) { fail(s + ' threw: ' + e.message); }
  });
  NL.ui.closeSheet();

  console.log('\nSESSION');
  try {
    NL.state.clearAll();
    NL.content.refresh();
    /* Spread items across every rung AND make them due, so the session has to
       render each exercise type on the ladder. */
    NL.content.allItems().forEach((it, i) => {
      if (i % 2 === 0) return;
      NL.srs.seed(it, i % (NL.srs.MAX_STAGE + 1));
      const r = NL.state.rec(it.id); r.due = Date.now() - 1000; NL.state.setRec(r);
    });
    const began = NL.screens.sessie.begin('vandaag');
    if (!began) fail('session would not start');
    NL.ui.go('sessie');
    const seen = {};
    let guard = 0;
    while (app.innerHTML.indexOf('done-stage') < 0 && guard++ < 80) {
      const html = app.innerHTML;
      const k = (html.match(/class="kicker"><span class="sub">[^<]*<\/span>([^<]*)/) || [])[1] || '?';
      seen[k.trim()] = (seen[k.trim()] || 0) + 1;
      /* exercise every branch: choose an option, tap tiles, type, self-rate, then move on */
      NL.screens.sessie.click({ dataset: {} }, { opt: '0' });
      NL.screens.sessie.click({ dataset: {} }, { pick: '0' });
      NL.screens.sessie.click({ dataset: {} }, { unpick: '0' });
      NL.screens.sessie.click({ dataset: {} }, { ins: 'a' });
      NL.screens.sessie.click({ dataset: {} }, { self: '1' });
      NL.screens.sessie.click({ dataset: { match: 'l0', k: '0', side: 'l' } }, { match: 'l0', k: '0', side: 'l' });
      NL.screens.sessie.click({ dataset: {} }, { skip: '1' });
      NL.screens.sessie.click({ dataset: {} }, { next: '1' });
    }
    console.log('  ran ' + guard + ' turns; kickers seen:');
    Object.keys(seen).forEach(k => console.log('    ' + (k || '(match)').padEnd(34) + seen[k]));
    if (guard >= 80) fail('session never finished');
    if (app.innerHTML.indexOf('done-stage') < 0) fail('no summary screen');
    else console.log('  summary rendered, ' + sizeOf() + ' chars');
  } catch (e) { fail('session threw: ' + e.message + '\n' + e.stack.split('\n')[1]); }

  console.log('\nSCENARIO');
  try {
    const s = NL.content.scenarios[3];
    NL.ui.go('scenario', s.id);
    let guard = 0;
    while (app.innerHTML.indexOf('scn-done') < 0 && guard++ < 40) {
      NL.screens.scenario.click({ dataset: {} }, { step: 'next' });
      NL.screens.scenario.click({ dataset: {} }, { choice: '0' });
      NL.screens.scenario.click({ dataset: {} }, { self: '1' });
      NL.screens.scenario.click({ dataset: {} }, { act: 'accept' });
    }
    console.log('  "' + s.title + '" ran ' + guard + ' turns, finished: ' + (app.innerHTML.indexOf('scn-done') >= 0));
    if (guard >= 40) fail('scenario never finished');
  } catch (e) { fail('scenario threw: ' + e.message + '\n' + e.stack.split('\n')[1]); }

  console.log('\nLISTENING');
  try {
    NL.ui.go('luisteren');
    NL.screens.luisteren.click({ dataset: {} }, { act: 'begrijpen' });
    let guard = 0;
    while (app.innerHTML.indexOf('done-stage') < 0 && guard++ < 20) {
      NL.screens.luisteren.click({ dataset: {} }, { opt: '0' });
      NL.screens.luisteren.click({ dataset: {} }, { act: 'next' });
    }
    console.log('  begrijpen ran ' + guard + ' clips, finished: ' + (app.innerHTML.indexOf('done-stage') >= 0));
    if (guard >= 20) fail('listening never finished');
    NL.screens.luisteren.click({ dataset: {} }, { act: 'menu' });
    NL.screens.luisteren.click({ dataset: {} }, { act: 'nazeggen' });
    NL.ui.render();
    console.log('  nazeggen rendered ' + sizeOf() + ' chars');
  } catch (e) { fail('listening threw: ' + e.message + '\n' + e.stack.split('\n')[1]); }

  console.log('\nOWN WORDS');
  try {
    const rec = NL.state.addCustom({ nl: 'de vergaderzaal', en: 'the meeting room', be: null, kind: 'word' });
    NL.content.refresh();
    const found = NL.content.byId(rec.id);
    if (!found) fail('custom word not in the item list');
    else console.log('  added "' + found.nl + '", schedulable: ' + (NL.srs.exerciseFor(found) || 'no'));
    NL.ui.go('woorden');
    console.log('  woordenboek ' + sizeOf() + ' chars');
    NL.state.delCustom(rec.id); NL.content.refresh();
    if (NL.content.byId(rec.id)) fail('custom word survived deletion');
  } catch (e) { fail('custom words threw: ' + e.message); }

  console.log('\n' + (fails === 0 ? 'ALL FLOWS OK' : fails + ' FAILURE(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
