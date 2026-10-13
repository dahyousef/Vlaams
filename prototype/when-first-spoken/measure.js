/* THROWAWAY, like the prototype beside it. Not part of the Vlaams repository.

   It produced the figures in the section "Measured on the real engine" of
   PROTOTYPE-when-first-spoken.html. It runs the phase 1 engine under one
   ladder, with the whole course and real sessions, and records for every item
   the day it is met and the day a session first serves it as `speak`.

   It needs the phase 1 end state, which lives in the saved patch. Once:
     git worktree add ../vlaams-prototype 0dbacdb
     cd ../vlaams-prototype && git apply ../vlaams-phase-1-prototype.patch
   Then, from anywhere:
     node measure.js <that folder> <ladder> [days] [eager|one] [p(right)] [w3,w4,w5]

     ladder    A   the plan as written
               B   `speak` added to rung 4, words and phrases
               C   `speak` added to rung 3
               D   shorter middle waits (default 2,5,13; or the last argument,
                   which also changes the waits of any other ladder)
               B! C!  the same, plus a rule the engine does not have: an item
                      never yet said aloud gets `speak` when its rung offers it
     days      default 200
     eager     every session the day offers (default); one = one session a day;
               two = two sessions a day
     p(right)  default 1; the suite's own simulation uses 0.85

   SEED=7 changes the draw. SPEAK_RIGHT=0.6 gives spoken exercises their own
   chance of a right answer. DRIFT_MIN=15 starts each day 15 minutes later than
   the last. JSON=1 prints every item and every day instead of the summary.
   Example:  node measure.js ../vlaams-prototype C! 200 one 0.85 */
const path = require('path');
const ROOT = path.resolve(process.argv[2] || '.');
const LADDER = process.argv[3] || 'A';
const DAYS = Number(process.argv[4] || 200);
const ONE = process.argv[5] === 'one', TWO = process.argv[5] === 'two';
const SESSIONS = ONE ? 1 : TWO ? 2 : 12;
const WHO = ONE ? 'one session a day' : TWO ? 'two sessions a day' : 'every session the day offers';
const P_RIGHT = Number(process.argv[6] || 1);
const WAITS = (process.argv[7] || '2,5,13').split(',').map(Number);
const DRIFT = Number(process.env.DRIFT_MIN || 0);
const SPEAK_RIGHT = process.env.SPEAK_RIGHT ? Number(process.env.SPEAK_RIGHT) : P_RIGHT;

const browser = require(path.join(ROOT, 'test/lib/browser'));
const T0 = Date.parse('2026-01-05T08:00:00Z');
const MIN = 60000, DAY = 86400000;
const B = browser.open({
  root: ROOT, seed: browser.SEED, now: T0, ua: 'Chrome/120 OPR/106', blobs: true, byId: 'stub',
  voices: [{ name: 'Bart', lang: 'nl-BE' }]
});
const NL = B.NL, RAND = B.random;
const answer = require(path.join(ROOT, 'test/lib/answer'))(B);
/* Seconds per exercise, as test/pace.js counts them. */
const SECS = { match: 22, pick: 7, recall: 7, intrus: 9, article: 6, vlaams: 9,
  cloze: 12, bank: 16, order: 16, corrige: 14, dictation: 20, type: 20, speak: 26, open: 55 };

/* The ladder under test. RUNGS and STEP are the engine's own objects. */
const R = NL.srs.RUNGS, STEP = NL.srs.STEP;
const BASE = LADDER.replace('!', ''), SURE = LADDER.indexOf('!') >= 0;
const add = rung => ['word', 'phrase', 'chunk'].forEach(k => { if (R[k][rung].indexOf('speak') < 0) R[k][rung].push('speak'); });
if (BASE === 'B') add(4);
if (BASE === 'C') add(3);
/* The three middle waits: ladder D's by default, or any ladder's when given. */
if (BASE === 'D' || process.argv[7]) { STEP[3] = WAITS[0] * DAY; STEP[4] = WAITS[1] * DAY; STEP[5] = WAITS[2] * DAY; }
if (SURE) {
  const draw = NL.srs.exerciseFor;
  NL.srs.exerciseFor = (item, avoid) => {
    const r = NL.srs.recOf(item);
    const set = (R[item.kind] || R.word)[Math.max(0, Math.min(6, r.stage))] || [];
    return (!r.said && r.reps > 0 && set.indexOf('speak') >= 0) ? 'speak' : draw(item, avoid);
  };
}

NL.state.open().then(() => {
  NL.content.refresh();
  const S = NL.screens.sessie;
  const all = NL.content.allItems();
  NL.ui.go('sessie');

  const rec = {};       // id → { kind, cognate, met, spoke, spokeAt }
  const perDay = [];
  let maxBacklog = 0;

  for (let day = 1; day <= DAYS; day++) {
    B.clock.set(T0 + (day - 1) * DAY + (day - 1) * DRIFT * MIN);
    NL.state.touchDay();
    const backlog = NL.srs.dueItems().length;
    maxBacklog = Math.max(maxBacklog, backlog);
    let tasks = 0, secs = 0, speak = 0, guard = 0;
    while (NL.srs.budgetLeft() > 0 && guard++ < SESSIONS && S.begin('vandaag')) {
      let n = 0;
      while (S.peek() && n++ < 80) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        tasks++; secs += SECS[c.ex] || 15;
        if (c.ex === 'speak') speak++;
        if (!wasMatch) {
          const it = c.items[0];
          if (!rec[it.id]) rec[it.id] = { kind: it.kind, cognate: !!it.cognate, met: day };
          if (c.ex === 'speak' && !rec[it.id].spoke) { rec[it.id].spoke = day; rec[it.id].spokeAt = Math.max(0, NL.srs.stageOf(it)); }
        }
        B.clock.advance((SECS[c.ex] || 15) * 1000);
        if (wasMatch || RAND() < (c.ex === 'speak' ? SPEAK_RIGHT : P_RIGHT)) answer.right(); else answer.wrong();
        answer.next(wasMatch);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      S.abandon();
      B.clock.advance(10 * MIN);
    }
    perDay.push({ day, tasks, mins: Math.round(secs / 60), speak, backlog, produce: NL.content.courseProgress().produce, met: NL.srs.counts().seen });
  }

  if (process.env.JSON) { console.log(JSON.stringify({ ladder: LADDER, days: DAYS, learner: WHO, pRight: P_RIGHT, waits: STEP.map(x => x / DAY), maxBacklog, perDay, rec })); return; }

  /* Days are counted from the day an item is met, which is day 1. */
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const v = s[Math.min(s.length - 1, Math.floor(p * s.length))]; return v === Infinity ? 'not in ' + DAYS + ' days' : v; };
  const own = x => x.spoke ? x.spoke - x.met + 1 : Infinity;
  const line = g => g.length ? 'typical day ' + q(g.map(own), 0.5) + ' (eight in ten: ' + q(g.map(own), 0.1) + ' to ' + q(g.map(own), 0.9) + ')' : 'none';
  const items = Object.keys(rec).map(id => rec[id]);
  const wp = items.filter(x => x.kind !== 'pattern'), rules = items.filter(x => x.kind === 'pattern');
  const early = wp.filter(x => x.spoke && x.spokeAt < 5), rest = wp.filter(x => !x.spoke || x.spokeAt >= 5);
  const day1 = {};
  wp.filter(x => x.met === 1 && !x.cognate).forEach(x => { const k = x.spoke || 'never'; day1[k] = (day1[k] || 0) + 1; });
  const first60 = perDay.filter(x => x.day <= 60);
  const P = (l, v) => console.log('  ' + String(l).padEnd(46) + v);
  console.log('\nLADDER ' + LADDER + ' · waits ' + STEP.map(x => x / DAY).join('/') + ' · ' + WHO + ' · ' + P_RIGHT * 100 + ' right in 100' + (SPEAK_RIGHT !== P_RIGHT ? ' (spoken: ' + SPEAK_RIGHT * 100 + ')' : '') + ' · ' + DAYS + ' days · seed ' + browser.SEED);
  P('words and phrases met', wp.length + ' of ' + all.filter(x => x.kind !== 'pattern').length);
  P('first asked aloud, all of them', line(wp));
  P('  asked aloud before rung 5', early.length + ' items · ' + line(early));
  P('  asked aloud on rung 5', rest.length + ' items · ' + line(rest));
  P('a word or phrase met on day 1', Object.keys(day1).map(k => 'day ' + k + ' ×' + day1[k]).join(' · '));
  P('grammar rules, own day', rules.map(own).sort((a, b) => a - b).join(', '));
  P('items the learner can produce, day 30/60/100', [30, 60, 100].filter(d => d <= DAYS).map(d => perDay[d - 1].produce).join(' / '));
  P('highest backlog at the start of a day', maxBacklog);
  P('minutes a day, first 60 days', (first60.reduce((s, x) => s + x.mins, 0) / first60.length).toFixed(1));
  P('exercises in ' + DAYS + ' days', perDay.reduce((s, x) => s + x.tasks, 0) + ' · spoken ' + perDay.reduce((s, x) => s + x.speak, 0));
  P('most spoken exercises in one day', Math.max.apply(null, perDay.map(x => x.speak)));
  const span = (a, b) => perDay.filter(x => x.day >= a && x.day <= b);
  const avg = (a, b) => { const d = span(a, b); return (d.reduce((s, x) => s + x.speak, 0) / d.length).toFixed(1) + ' of ' + (d.reduce((s, x) => s + x.tasks, 0) / d.length).toFixed(0); };
  P('first day with a spoken exercise', (perDay.find(x => x.speak > 0) || {}).day || 'none');
  P('spoken a day: week 1 / 2 / 3 / 4 / 5 to 8', [[1, 7], [8, 14], [15, 21], [22, 28], [29, 56]].map(w => avg(w[0], w[1])).join(' · '));
  P('days with no spoken exercise, weeks 2 to 4', span(8, 28).filter(x => x.speak === 0).length + ' of 21');
  /* DAILY=28 also prints the first 28 days, one by one. */
  if (process.env.DAILY) perDay.slice(0, Number(process.env.DAILY)).forEach(x => console.log('    day ' + String(x.day).padStart(3) + ' · met so far ' + String(x.met).padStart(3) + ' · exercises ' + String(x.tasks).padStart(3) + ' · of which spoken ' + String(x.speak).padStart(3)));
}).catch(e => { console.error(e); process.exit(1); });
