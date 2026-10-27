/* Chaque écran, chaque chose qu'on peut toucher : la toucher, et signaler celles qui ne
   changent rien, celles qu'un doigt ne peut pas atteindre, ce qui déborde à 390 px et toute
   erreur de console.
     node tools/learner-pass/sweep.js [dossier] */
const path = require('path'), fs = require('fs');
const { open, verdict, sleep, SHOTS } = require('./common');
const { playSession } = require('./session');
const DIR = path.join(SHOTS, 'sweep');
fs.mkdirSync(DIR, { recursive: true });
const CAND = 'button, a[href], select, input[type=checkbox], input[type=radio], [data-go], [data-act], [data-sheet], [data-unit], [data-scn], [data-clip], [data-sheetid], [data-say], [data-theme], [data-pace], [data-toggle], [data-display-lang], [data-step], [data-choice], [data-del], [data-add], [data-rec], [data-close]';
/* Ce qui effacerait la base ou quitterait la page : pas touché. */
const SKIP = '[data-reset-yes], [data-import], [data-quit-yes]';

(async () => {
  const A = await open();
  const p = A.page;
  /* Un peu d'histoire d'abord : des éléments rencontrés, quelques fautes. */
  await playSession(p, 'sweep-history', { wrongEvery: 4 });
  await p.evaluate(() => { NL.screens.sessie.abandon(); NL.ui.go('vandaag'); });

  const contexts = ['vandaag', 'leerpad', 'meer', 'praten', 'luisteren', 'woorden', 'spiek', 'register', 'dehet', 'klanken', 'fouten', 'doctor', 'compte']
    .map(r => ({ name: r, setup: 'NL.ui.go(' + JSON.stringify(r) + ')' }));
  contexts.push({ name: 'scenario', setup: "NL.ui.go('scenario', 's-bakker')" });
  contexts.push({ name: 'sheet-instellingen', setup: "NL.ui.go('vandaag'); NL.ui.openSheet('instellingen')" });
  contexts.push({ name: 'spiek-redden', setup: "NL.ui.go('spiek', 'redden')" });

  /* L'empreinte de tout ce qu'un toucher peut changer : la page, l'adresse, la voix, le focus. */
  const sig = () => p.evaluate(() => {
    const s = document.documentElement.outerHTML + '|' + location.hash + '|' + window.__log.length + '|' + (document.activeElement && document.activeElement.outerHTML.slice(0, 80));
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  });
  /* Chaque toucher part d'un écran propre : le toast du toucher précédent (2,4 s) parti.
     Une feuille ouverte couvre l'écran derrière elle : seul ce qu'elle contient se touche. */
  const reset = async c => {
    await p.waitForFunction(() => !document.querySelector('.toast'), null, { timeout: 4000 }).catch(() => {});
    await p.evaluate(() => { NL.screens.sessie.abandon(); NL.speech.abort(); window.__say = 'ja'; NL.ui.go('vandaag'); });
    await sleep(150);
    await p.evaluate(s => eval(s), c.setup);
    await sleep(250);
  };
  const problems = A.errors.map(e => 'console, before the sweep: ' + e), counts = {};

  for (const c of contexts) {
    await reset(c);
    await p.screenshot({ path: path.join(DIR, c.name + '.png'), fullPage: true });
    const ov = await p.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      wide: Array.from(document.querySelectorAll('body *')).filter(e => {
        const r = e.getBoundingClientRect();
        return r.width && r.right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed';
      }).slice(0, 5).map(e => e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 30))
    }));
    if (ov.sw > 391 || ov.wide.length) problems.push(c.name + ': wider than 390 px (' + ov.sw + ') ' + JSON.stringify(ov.wide));
    const n = await p.evaluate(([q, s]) => Array.from((document.querySelector('.sheet') || document).querySelectorAll(q)).filter(e => !e.matches(s) && e.getClientRects().length).length, [CAND, SKIP]);
    counts[c.name] = n;
    for (let i = 0; i < Math.min(n, 120); i++) {
      await reset(c);
      const info = await p.evaluate(([q, s, i]) => {
        const e = Array.from((document.querySelector('.sheet') || document).querySelectorAll(q)).filter(e => !e.matches(s) && e.getClientRects().length)[i];
        if (!e) return null;
        e.setAttribute('data-sweep', '1');
        return { tag: e.tagName, data: Object.assign({}, e.dataset), text: (e.textContent || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40), href: e.getAttribute('href'), disabled: e.disabled === true };
      }, [CAND, SKIP, i]);
      if (!info || info.disabled) continue;
      if (info.href && /^https?:|^mailto:/.test(info.href)) continue;   // sort de l'app
      delete info.data.sweep;
      const what = c.name + ': ' + info.tag + ' « ' + info.text + ' » ' + JSON.stringify(info.data);
      /* Un doigt ne touche que ce qui est dessus : centré à l'écran, l'élément doit être le premier sous le point. */
      const hit = await p.evaluate(() => {
        const e = document.querySelector('[data-sweep]');
        if (!e) return 'gone: the screen re-rendered by itself';
        e.scrollIntoView({ block: 'center' });
        const r = e.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return top && (e === top || e.contains(top)) ? null : (top ? top.tagName + '.' + top.className + ' ' + (top.textContent || '').trim().slice(0, 30) : 'nothing');
      });
      if (hit) { problems.push(what + ' is covered, even centred, by ' + hit); continue; }
      /* La feuille ouverte, par son titre, et l'endroit où on l'a fait défiler : un toucher qui la
         redessine la laisse là (#103). */
      const place = () => p.evaluate(() => {
        const c = document.querySelector('.sheet-card');
        return c ? { title: c.querySelector('h3').textContent, top: Math.round(c.scrollTop) } : null;
      });
      const sheetBefore = await place();
      const before = await sig();
      const errsBefore = A.errors.length;
      try {
        if (info.tag === 'SELECT') {
          await p.evaluate(() => {
            const e = document.querySelector('[data-sweep]');
            e.selectedIndex = (e.selectedIndex + 1) % e.options.length;
            e.dispatchEvent(new Event('change', { bubbles: true }));
          });
        } else await p.click('[data-sweep]', { force: true, timeout: 2000 });
      } catch (e) { problems.push(what + ': tap failed: ' + e.message.split('\n')[0]); continue; }
      await sleep(300);
      if (A.errors.length > errsBefore) problems.push(what + ': console ' + A.errors.slice(errsBefore).join(' | '));
      if ((await sig()) === before) problems.push(what + ': nothing changed');
      const sheetAfter = sheetBefore ? await place() : null;
      if (sheetAfter && sheetAfter.title === sheetBefore.title && Math.abs(sheetAfter.top - sheetBefore.top) > 1) problems.push(what + ': the sheet scrolled to ' + sheetBefore.top + ' px went to ' + sheetAfter.top + ' px');
    }
  }
  const total = Object.keys(counts).reduce((s, k) => s + counts[k], 0);
  console.log('TAPPABLE PER SCREEN (' + total + ') ' + JSON.stringify(counts));
  await A.close();
  verdict(problems, 'EVERY TAP DOES SOMETHING');
})().catch(e => { console.error(e); process.exit(1); });
