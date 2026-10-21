/* The helpers of test/lib that every suite counts on without seeing them, checked on their own:
   the fake browser's timers and its prepare, and joined() beside text() in test/lib/langs.js.
   A fault there would pass unseen in every suite that uses them. These pages load no source,
   only timers, except the one prepare needs. */
const path = require('path');
const browser = require('./lib/browser');
const langs = require('./lib/langs');
const ROOT = process.argv[2] || path.join(__dirname, '..');
let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL: ' + msg); fails++; } };

console.log('FAKE BROWSER');

/* The fake browser's 'held' timers keep a real tick's rules, which lang.js's 5b counts on:
   nothing runs before B.tick(), then every timer runs in the order it was set; clearTimeout
   takes one out, before the tick or during it; a timer set during the tick waits for the
   next. B.waiting() counts the timers that wait. An unknown mode fails and names itself. */
{
  const H = browser.open({ root: ROOT, files: [], timers: 'held' });
  const ran = [];
  H.ctx.setTimeout(() => { ran.push('a'); H.ctx.setTimeout(() => ran.push('next'), 0); }, 0);
  const b = H.ctx.setTimeout(() => ran.push('b'), 0);
  H.ctx.setTimeout(() => { ran.push('c'); H.ctx.clearTimeout(d); }, 0);
  const d = H.ctx.setTimeout(() => ran.push('d'), 0);
  H.ctx.clearTimeout(b);
  const before = ran.join(' '), waitedBefore = H.waiting();
  H.tick();
  const first = ran.join(' '), waitedFirst = H.waiting();
  H.tick();
  ok(before === '' && first === 'a c' && ran.join(' ') === 'a c next', 'test/lib/browser.js: held timers ran « ' + before + ' » before B.tick(), « ' + first + ' » at the first tick and « ' + ran.join(' ') + ' » by the second; wanted « », « a c » and « a c next »');
  ok(waitedBefore === 3 && waitedFirst === 1 && H.waiting() === 0, 'test/lib/browser.js: B.waiting() counted ' + waitedBefore + ', ' + waitedFirst + ' and ' + H.waiting() + ' held timers; wanted 3 before the first tick, 1 after it and 0 after the second');
  let unknown = '';
  try { browser.open({ root: ROOT, files: [], timers: 'hold' }); } catch (e) { unknown = e.message; }
  ok(unknown.indexOf('hold') >= 0, 'test/lib/browser.js: an unknown timers mode fails without naming itself: « ' + unknown + ' »');
  /* An error in a held timer comes out of B.tick(), the suite's own call, once the tick's other
     timers have run. */
  const E = browser.open({ root: ROOT, files: [], timers: 'held' });
  const after = [];
  E.ctx.setTimeout(() => { throw new Error('boom'); }, 0);
  E.ctx.setTimeout(() => after.push('next'), 0);
  let thrown = '';
  try { E.tick(); } catch (e) { thrown = e.message; }
  ok(thrown === 'boom' && after.join(' ') === 'next', 'test/lib/browser.js: an error in a held timer came out of B.tick() as « ' + thrown + ' » and the timer after it ran « ' + after.join(' ') + ' »; wanted « boom » and « next »');
}
console.log('  held timers     wait for B.tick(), run in order, can be cleared and are counted, and their errors come out of B.tick(); an unknown mode names itself');

/* A 'sync' timer runs inside the call to setTimeout: an error thrown there would fall into the
   app's code, which a real timer never does. It is dropped, or handed to onTimerError when the
   suite gives one. onTimerError serves no other mode: beside one, it fails and names itself,
   rather than wait for an error that never reaches it. */
{
  const caught = [];
  const S = browser.open({ root: ROOT, files: [], onTimerError: e => caught.push(e.message) });
  let out = '';
  try { S.ctx.setTimeout(() => { throw new Error('boom'); }, 0); } catch (e) { out = e.message; }
  ok(out === '' && caught.join(' ') === 'boom', 'test/lib/browser.js: with onTimerError, a sync timer\'s error came out of setTimeout as « ' + out + ' » and reached the handler as « ' + caught.join(' ') + ' »; wanted « » and « boom »');
  const Q = browser.open({ root: ROOT, files: [] });
  let dropped = '';
  try { Q.ctx.setTimeout(() => { throw new Error('boom'); }, 0); } catch (e) { dropped = e.message; }
  ok(dropped === '', 'test/lib/browser.js: without onTimerError, a sync timer\'s error came out of setTimeout as « ' + dropped + ' »; wanted it dropped');
  ['held', 'real'].forEach(mode => {
    let given = '';
    try { browser.open({ root: ROOT, files: [], timers: mode, onTimerError: () => {} }); } catch (e) { given = e.message; }
    ok(given.indexOf('onTimerError') >= 0 && given.indexOf(mode) >= 0, 'test/lib/browser.js: onTimerError beside ' + mode + ' timers fails without naming itself: « ' + given + ' »');
  });
}
console.log('  onTimerError    takes the error of a sync timer, and fails, naming itself, beside held or real timers');

/* prepare(NL) runs once every other source is loaded, just before src/app.js starts the
   app: test/lang.js changes its course there. A page that does not load src/app.js has no
   such moment, and asking for one fails. */
{
  const ran = [];
  browser.open({ root: ROOT, seed: browser.SEED, byId: 'stub', prepare: N => {
    ran.push(N.ui && N.content ? 'prepare' : 'prepare before the sources');
    const watch = N.errlog.watch;
    N.errlog.watch = () => { ran.push('app.js'); watch(); };
  } });
  ok(ran.join(' ') === 'prepare app.js', 'test/lib/browser.js: prepare ran « ' + ran.join(' ') + ' »; wanted « prepare app.js », once the other sources were loaded and just before src/app.js');
  let without = '';
  try { browser.open({ root: ROOT, files: [], prepare: () => {} }); } catch (e) { without = e.message; }
  ok(without.indexOf(browser.APP) >= 0, 'test/lib/browser.js: prepare on a page without src/app.js fails without saying so: « ' + without + ' »');
}
console.log('  prepare         runs just before src/app.js, and fails on a page that does not load it');

console.log('\nLANGS');
ok(typeof langs.joined === 'function' && langs.joined('<b>al</b>, <i>zo</i>') === 'al, zo' && langs.text('<b>al</b>, <i>zo</i>') === 'al , zo',
  'test/lib/langs.js: joined() does not take each tag out with nothing in its place, beside text(), which puts a blank there');
console.log('  joined()        takes each tag out with nothing in its place; text() puts a blank there');

console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
process.exit(fails ? 1 : 0);
