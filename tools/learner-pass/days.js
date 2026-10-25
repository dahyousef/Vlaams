/* Plusieurs jours d'étude, l'horloge avancée, pour que des éléments montent jusqu'au rung où
   ils se disent à voix haute. Chaque façon de parler y passe une fois : juste, faux puis juste,
   une écoute qui finit seule, et « Je ne peux pas parler ».
     node tools/learner-pass/days.js [dossier] */
const { open, verdict, sleep } = require('./common');
const { playSession, speakProblem, STUCK } = require('./session');
const DAY = 86400000;

(async () => {
  const A = await open();
  const p = A.page, problems = [];
  const t0 = new Date('2026-10-26T08:00:00').getTime();
  const shared = { speakModes: ['mic-right', 'quiet', 'mic-wrong', 'self-end', 'mic-right', 'mic-right'], speakCount: { n: 0 }, wrongEvery: 7 };
  for (const d of [0, 1, 2, 3, 5, 7, 10, 14, 20]) {
    await p.clock.setFixedTime(t0 + d * DAY);
    await p.click('[data-go="vandaag"]').catch(() => {});
    await sleep(200);
    const head = await p.evaluate(() => (document.body.innerText.match(/[^\n]*(waiting|Nothing|done|rest)[^\n]*/i) || [''])[0] + ' / ' +
      (document.body.innerText.match(/\d+ to review[^\n]*/) || [''])[0]);
    if (!(await p.$('[data-act="start"]'))) { console.log('DAY ' + d + ' no session offered: ' + head); continue; }
    const s = await playSession(p, 'd' + d, shared);
    const kinds = s.log.reduce((m, e) => { m[e.ex] = (m[e.ex] || 0) + 1; return m; }, {});
    console.log('DAY ' + d + ' ' + head + ' | cards ' + s.log.length + ' ' + JSON.stringify(kinds));
    s.log.filter(e => e.ex === 'speak').forEach(e => console.log('    ' + JSON.stringify(e)));
    s.log.forEach(e => {
      if (STUCK.test(e.result)) problems.push('day ' + d + ', card ' + e.step + ' (' + e.ex + ', ' + e.mode + '): ' + e.result);
      const why = speakProblem(e);
      if (why) problems.push('day ' + d + ', card ' + e.step + ': ' + why);
    });
    /* « Je ne peux pas parler » vaut pour le reste de la séance. */
    const quiet = s.log.findIndex(e => e.mode === 'quiet');
    if (quiet >= 0) {
      const after = s.log.slice(quiet + 1).filter(e => e.ex === 'speak').length;
      console.log('    spoken cards after « Je ne peux pas parler »: ' + after);
      if (after) problems.push('day ' + d + ': ' + after + ' spoken card(s) after « Je ne peux pas parler »');
    }
    console.log('    end: ' + s.endText.replace(/\s+/g, ' ').slice(0, 160));
    if (shared.speakCount.n >= shared.speakModes.length) break;
  }
  if (shared.speakCount.n < shared.speakModes.length)
    problems.push('only ' + shared.speakCount.n + ' spoken card(s) in 20 days, ' + shared.speakModes.length + ' wanted');
  A.errors.forEach(e => problems.push('console ' + e));
  await A.close();
  verdict(problems, 'THE STUDY DAYS PLAY THROUGH');
})().catch(e => { console.error(e); process.exit(1); });
