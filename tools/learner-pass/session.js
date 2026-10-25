/* Une séance jouée comme un apprenant la joue : de vrais touchers, de vraies frappes.
   playSession() est utilisé par days.js, corners.js et sweep.js. */
const path = require('path');
const { sleep, SHOTS } = require('./common');
const shot = (p, name, full) => p.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: !!full });

/* Ce que ferait un apprenant qui connaît la réponse, lu sur la carte à l'écran. Tourne dans la page. */
function planFor() {
  const S = NL.screens.sessie, c = S.peek(), U = NL.util;
  if (!c) return null;
  const t = c.task, ex = NL.ex.get(c.ex), acts = [];
  if (c.ex === 'match') {
    t.pairs.forEach((p, k) => { acts.push({ click: '[data-match="l' + k + '"]' }, { click: '[data-match="r' + k + '"]' }); });
    return { ex: c.ex, answer: '(pairs)', acts, match: true };
  }
  if (c.ex === 'corrige') acts.push({ click: '[data-opt="' + t.faulty + '"]' });
  else if (t.opts) acts.push({ click: '[data-opt="' + t.opts.findIndex(o => o.ok) + '"]' });
  if (t.bank) {
    const used = new Set();
    U.tiles(ex.answer(t)).forEach(w => {
      const i = t.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
      if (i >= 0) { used.add(i); acts.push({ click: '[data-pick="' + i + '"]' }); }
    });
  }
  if (c.ex === 'open') acts.push({ fill: ['textarea.textin', t.task.model] });
  if (c.ex === 'type' || (c.ex === 'dictation' && !t.bank)) acts.push({ fill: ['input.textin', ex.answer(t)] });
  if (c.ex === 'speak') acts.push({ speak: ex.answer(t) });
  return { ex: c.ex, answer: String(ex.answer(t)), acts };
}

/* Ce qui distingue une carte de la suivante. Tourne dans la page. */
function cardKey() {
  const c = NL.screens.sessie.peek();
  return c ? c.ex + '|' + JSON.stringify(c.task.target || c.task.item && c.task.item.id || '') : null;
}

/* Les résultats qu'une passe signale : une carte qui bloque, un toucher sans effet. */
const STUCK = /NOTHING|NO VERDICT|ERROR|DID NOT/;

/* Joue la séance ouverte par `opts.startSel` (« Commencer » par défaut) jusqu'à son écran de fin.
   opts.wrongEvery : passe une carte écrite sur n ;
   opts.speakModes : pour chaque carte parlée, dans l'ordre, 'mic-right', 'mic-wrong', 'self-end'
     ou 'quiet' (« Je ne peux pas parler ») ; au-delà de la liste, 'mic-right' ;
   opts.speakCount : { n } partagé entre plusieurs séances. */
async function playSession(page, label, opts) {
  const p = page, log = [];
  opts.speakCount = opts.speakCount || { n: 0 };
  let stuck = 0;
  await p.click(opts.startSel || '[data-act="start"]');
  await sleep(200);
  for (let step = 0; step < 120; step++) {
    if (await p.evaluate(() => NL.ui.route) !== 'sessie') break;
    /* L'écran de fin (défi perdu, séance finie) : plus aucune carte à jouer, même si peek() en garde une. */
    if (!(await p.$('[data-skip], [data-check], [data-match], [data-quiet], [data-mic], [data-next]'))) break;
    const plan = await p.evaluate(planFor);
    if (!plan) break;
    let mode = 'right';
    if (plan.ex === 'speak' && (opts.speakModes || [])[opts.speakCount.n] === 'quiet') { opts.speakCount.n++; mode = 'quiet'; }
    else if (plan.ex !== 'speak' && opts.wrongEvery && step % opts.wrongEvery === opts.wrongEvery - 1) mode = 'skip';
    const before = await p.evaluate(cardKey);
    const entry = { step, ex: plan.ex, mode, answer: plan.answer.slice(0, 60) };
    try {
      if (mode === 'quiet') {
        await p.click('[data-quiet]');
        await sleep(250);
        entry.result = (await p.evaluate(cardKey)) !== before ? 'moved on' : 'NOTHING HAPPENED';
        if (STUCK.test(entry.result)) { stuck++; await shot(p, label + '-stuck-quiet'); }
        log.push(entry);
        continue;
      }
      if (mode === 'skip') await p.click('[data-skip]');
      else {
        for (const a of plan.acts) {
          if (a.click) await p.click(a.click, { timeout: 3000 });
          if (a.fill) await p.fill(a.fill[0], a.fill[1], { timeout: 3000 });
          if (a.speak) await speak(p, label, opts, entry, a.speak);
        }
        if (!plan.match) {
          const check = await p.$('[data-check]:not([disabled])');
          if (check) await check.click();
          else entry.checkDisabled = true;
        }
      }
      await sleep(120);
      if (plan.match && mode === 'right') {
        /* La dernière paire fait avancer la séance après son animation : attendre la carte suivante. */
        await p.waitForFunction(b => {
          const c = NL.screens.sessie.peek();
          return !c || (c.ex + '|' + JSON.stringify(c.task.target || c.task.item && c.task.item.id || '')) !== b;
        }, before, { timeout: 3000 })
          .then(() => { entry.result = 'pairs done'; }, () => { entry.result = 'BOARD DID NOT ADVANCE'; stuck++; });
        log.push(entry);
        continue;
      }
      const next = await p.waitForSelector('[data-next]', { timeout: 3000 }).catch(() => null);
      if (!next) {
        entry.result = 'NO VERDICT'; stuck++;
        await shot(p, label + '-stuck-' + step);
        log.push(entry);
        await p.click('[data-skip]').catch(() => {});
        await p.click('[data-next]').catch(() => {});
        continue;
      }
      entry.result = (await next.getAttribute('class')).indexOf('btn-good') >= 0 ? 'right' : 'wrong';
      await next.click();
    } catch (e) {
      entry.result = 'ERROR ' + e.message.split('\n')[0]; stuck++;
      await shot(p, label + '-error-' + step);
      await p.click('[data-skip]').catch(() => {});
      await p.click('[data-next]').catch(() => {});
    }
    log.push(entry);
    if (stuck > 5) break;
  }
  await sleep(200);
  await shot(p, label + '-end', true);
  const endText = await p.evaluate(() => document.querySelector('main, #app, body').innerText.slice(0, 600));
  return { log, endText };
}

/* Une carte parlée : toucher le micro, « dire » la réponse (ou autre chose), toucher pour finir. */
async function speak(p, label, opts, entry, answer) {
  const how = (opts.speakModes || [])[opts.speakCount.n] || 'mic-right';
  const tag = label + '-speak' + opts.speakCount.n + '-' + how;
  opts.speakCount.n++;
  entry.speakMode = how;
  const sayOnce = async (said, selfEnd) => {
    await p.evaluate(([s, e]) => { window.__say = s; window.__selfEnd = e; }, [said, selfEnd]);
    await p.click('[data-mic="start"]', { timeout: 3000 });
    await sleep(450);
    /* Le micro pulse sans fin : sans force, Playwright attend qu'il soit immobile. */
    if (!selfEnd) { await shot(p, tag + '-listening'); await p.click('[data-mic="stop"]', { timeout: 3000, force: true }); }
    const scored = await p.waitForSelector('.mic-panel.good, .mic-panel.bad', { timeout: 4000 }).then(() => true, () => false);
    await p.evaluate(() => { window.__selfEnd = false; });
    if (!scored) return { panel: 'NEVER SCORED' };
    return {
      panel: await p.evaluate(() => document.querySelector('.mic-panel').className),
      heard: await p.evaluate(() => { const h = document.querySelector('.mic-panel .heard'); return h ? h.textContent.trim() : null; })
    };
  };
  if (how === 'mic-wrong') {
    entry.first = await sayOnce('appelflap kermis', false);
    await shot(p, tag + '-wrong');
    entry.retry = !!(await p.$('.mic-panel.bad [data-mic="start"]'));
    entry.second = await sayOnce(answer, false);
  } else Object.assign(entry, await sayOnce(answer, how === 'self-end'));
  await shot(p, tag + '-scored');
}

/* Ce qu'une carte parlée aurait dû donner, ou null si elle l'a donné. */
function speakProblem(e) {
  if (e.ex !== 'speak' || e.mode === 'quiet') return null;
  const good = r => r && /\bgood\b/.test(r.panel);
  if (e.speakMode === 'mic-wrong') {
    if (!e.first || !/\bbad\b/.test(e.first.panel)) return 'a wrong answer said out loud was not marked wrong: ' + JSON.stringify(e.first);
    if (!e.retry) return 'no retry offered after a wrong answer said out loud';
    return good(e.second) ? null : 'the retry, said right, was not marked right: ' + JSON.stringify(e.second);
  }
  return good(e) ? null : 'said right (' + e.speakMode + '), not marked right: ' + JSON.stringify({ panel: e.panel, heard: e.heard });
}

module.exports = { playSession, speakProblem, STUCK, shot };
