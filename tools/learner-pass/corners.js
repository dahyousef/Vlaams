/* Ce qu'une séance ne montre pas : l'écoute (Comprendre, Répéter), une conversation
   (chacune du cours) et le défi, joués en touchant l'écran.
     node tools/learner-pass/corners.js [dossier] */
const { open, verdict, sleep } = require('./common');
const { playSession, playConversation, shot, STUCK } = require('./session');

(async () => {
  const A = await open();
  const p = A.page, problems = [];
  p.setDefaultTimeout(4000);
  const lastTts = () => p.evaluate(() => { const t = window.__log.filter(l => l.indexOf('tts:') === 0).pop(); return t ? t.slice(4) : ''; });
  const screenText = () => p.evaluate(() => document.querySelector('.screen, main, body').innerText.replace(/\s+/g, ' ').slice(0, 140));

  /* 1. Comprendre : huit phrases entendues, une option touchée pour chacune. */
  console.log('COMPRENDRE');
  await p.click('[data-go="luisteren"]');
  await sleep(200);
  await p.click('[data-act="begrijpen"]');
  for (let i = 0; i < 8; i++) {
    await sleep(350);
    const heard = await lastTts();
    await p.click('[data-opt="0"]', { timeout: 3000 });
    const shown = !!(await p.waitForSelector('[data-act="next"]', { timeout: 3000 }).catch(() => null));
    console.log('  ' + i + ' heard ' + JSON.stringify(heard) + (shown ? '' : ' -> NO VERDICT'));
    if (!heard) problems.push('Comprendre ' + i + ': nothing was spoken');
    if (!shown) { problems.push('Comprendre ' + i + ': no verdict after an option'); break; }
    if (i === 0) await shot(p, 'comprendre');
    await p.click('[data-act="next"]');
  }
  await sleep(250);
  console.log('  end: ' + await screenText());

  /* 2. Répéter : la phrase entendue, redite telle quelle ; toucher le micro pour finir, comme sur Safari. */
  console.log('\nRÉPÉTER');
  await p.click('[data-act="menu"]').catch(() => {});
  await sleep(150);
  await p.click('[data-act="nazeggen"]');
  for (let i = 0; i < 8; i++) {
    await sleep(350);
    const said = await lastTts();
    await p.evaluate(s => { window.__say = s; }, said);
    await p.click('[data-act="mic"]', { timeout: 3000 });
    await sleep(450);
    if (i === 0) await shot(p, 'repeter-listening');
    await p.click('[data-act="micstop"]', { force: true, timeout: 3000 });
    const panel = await p.waitForSelector('.mic-panel.good, .mic-panel.bad', { timeout: 4000 }).then(e => e.getAttribute('class'), () => 'NEVER SCORED');
    const score = await p.evaluate(() => (document.querySelector('.score') || {}).textContent || '');
    console.log('  ' + i + ' said ' + JSON.stringify(said) + ' -> ' + panel + ' ' + score);
    if (!/\bgood\b/.test(panel)) problems.push('Répéter: « ' + said + ' », said as heard -> ' + panel + ' ' + score);
    if (i === 0) await shot(p, 'repeter-scored');
    if (panel === 'NEVER SCORED') break;
    await p.click('[data-act="next"]');
  }
  await sleep(250);
  console.log('  end: ' + await screenText());

  /* 3. Chaque conversation du cours : chaque réplique à dire est dite telle qu'elle s'affiche ;
     une passe par rang de choix : à la passe q, le choix q % n à chaque tour « vous » (playConversation),
     de 0 au plus grand nombre de choix d'un tour, moins un. */
  const ids = await p.evaluate(() => NL.content.scenarios.map(s => s.id));
  const passes = await p.evaluate(() => NL.content.scenarios.map(s => Math.max.apply(null, s.steps.filter(x => x.you).map(x => x.you.choices.length))));
  for (let c = 0; c < ids.length; c++) {
    console.log('\nCONVERSATION ' + ids[c]);
    for (let q = 0; q < passes[c]; q++) {
      console.log('  pass ' + (q + 1) + ' of ' + passes[c]);
      await p.evaluate(() => NL.ui.go('praten'));
      await sleep(150);
      await p.click('[data-scn="' + ids[c] + '"]');
      const r = await playConversation(p, ids[c], { pass: q, firstShots: c === 0 && q === 0 });
      r.lines.forEach(l => console.log(l));
      r.problems.forEach(x => problems.push(x));
      await p.click('[data-step="back"]').catch(() => {});
    }
  }

  /* 4. Le défi : d'abord une séance, pour rencontrer des éléments, puis le défi, une faute toutes les trois cartes. */
  console.log('\nDÉFI');
  await p.evaluate(() => NL.ui.go('vandaag'));
  await playSession(p, 'defi-day', { wrongEvery: 0 });
  await p.evaluate(() => NL.ui.go('vandaag'));
  await sleep(200);
  const defi = await playSession(p, 'defi', { startSel: '[data-act="defi"]', wrongEvery: 3 });
  const tally = defi.log.reduce((m, e) => { m[e.result] = (m[e.result] || 0) + 1; return m; }, {});
  console.log('  cards ' + defi.log.length + ' ' + JSON.stringify(tally));
  console.log('  end: ' + defi.endText.replace(/\s+/g, ' ').slice(0, 200));
  defi.log.filter(e => STUCK.test(e.result)).forEach(e => problems.push('défi card ' + e.step + ' (' + e.ex + '): ' + e.result));
  /* Le résumé compte les cartes jouées, pas la longueur du défi. */
  const line = await p.evaluate(([n, of]) => NL.t.defiScoreLine(n, of), [tally.right || 0, (tally.right || 0) + (tally.wrong || 0)]);
  if (defi.endText.replace(/\s+/g, ' ').indexOf(line) < 0) problems.push('the challenge summary should say « ' + line + ' »');

  A.errors.forEach(e => problems.push('console ' + e));
  await A.close();
  verdict(problems, 'LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH');
})().catch(e => { console.error(e); process.exit(1); });
