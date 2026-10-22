/* Chaque écran, rendu dans plusieurs états, puis relu comme le lirait la
   personne : le texte, sans les balises. C'est ici que se voient un compte qui
   se lit mal, une chaîne manquante, un chiffre qui ne veut rien dire — et tout
   ce qui est resté d'un écran supprimé. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-05T08:00:00Z');
const DAY = 86400000;

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({
  root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.EDG, byId: 'stub', media: true,
  voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }]
});
const NL = B.NL, S = NL.screens.sessie, t = NL.t;
const answer = require('./lib/answer')(B);

const { text } = require('./lib/langs');
const put = (it, rung, due) => { NL.srs.seed(it, rung); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
const fresh = () => { NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };
const { SCREENS } = require('./lib/screens');

/* Ce qu'aucun écran ne doit montrer, quel que soit l'état. */
function read(name, html, state) {
  const txt = text(html), where = name + ' (' + state + ')';
  /* La dictée d'un mot nu se tape dans un champ (src/ex/index.js, R.dictation : pas de tuiles) :
     sa page est courte par construction. Une phrase garde le plancher de 60. */
  const bareDictation = name === 'sessie/dictation' && html.indexOf('class="textin"') >= 0;
  ok(txt.length > (bareDictation ? 40 : 60), where + ' rendered almost nothing');
  ok(!/undefined|NaN|\[object/.test(txt), where + ' printed a hole: ' + (txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [''])[0]);
  ok(!/\d\s?%/.test(txt), where + ' shows a percentage: « ' + (txt.match(/.{0,40}\d\s?%.{0,15}/) || [''])[0] + ' »');
  ok(!/ma[iî]tris|\bmaster/i.test(txt), where + ' still speaks of mastery: « ' + (txt.match(/.{0,30}(ma[iî]tris|\bmaster).{0,20}/i) || [''])[0] + ' »');
  ok(!/test de niveau/i.test(txt) && html.indexOf('placement') < 0, where + ' still offers the placement test');
  return txt;
}
const sweep = state => SCREENS.forEach(name => {
  try { read(name, NL.screens[name].render(), state); }
  catch (e) { ok(false, name + ' (' + state + ') threw: ' + e.message); }
});

NL.state.open().then(async () => {
  NL.content.refresh();
  const units = NL.content.units, all = NL.content.allItems();

  /* ------------------------------------------------------------------ */
  console.log('CHAQUE ÉCRAN, QUATRE ÉTATS');
  fresh(); sweep('compte neuf');
  /* À mi-parcours : trois unités entamées, tous les échelons, une part due. */
  fresh();
  all.filter(it => units.indexOf(NL.content.unit(it.unit)) < 3)
    .forEach((it, i) => put(it, i % 7, i % 3 === 0 ? T0 - DAY : T0 + 5 * DAY));
  sweep('mi-parcours');
  /* Tout rencontré, tout produit. */
  fresh(); all.forEach(it => put(it, 6, T0 + 30 * DAY)); sweep('cours fini');
  /* Budget du jour épuisé : l'accueil n'a plus de séance à annoncer. */
  fresh(); NL.srs.spend(NL.srs.pace().cap); sweep('budget épuisé');
  NL.content.sheets.forEach(sh => read('spiek/' + sh.id, NL.screens.spiek.render(sh.id), 'fiche'));
  ['instellingen', 'reset-confirm'].forEach(s => { NL.ui.go('vandaag'); NL.ui.openSheet(s); read('panneau ' + s, B.app.innerHTML, 'ouvert'); });
  NL.ui.closeSheet();
  ok(!NL.screens.placement, 'the placement screen still exists');
  console.log('  ' + SCREENS.length + ' écrans × 4 états, ' + NL.content.sheets.length + ' fiches, 2 panneaux : ni pourcentage, ni maîtrise, ni test de niveau');

  /* ------------------------------------------------------------------ */
  console.log('\nDES COMPTES, ET LE NOM DE L’UNITÉ');
  {
    fresh();
    const home = text(NL.screens.vandaag.render());
    ok(home.indexOf(t.unitOne(1)) >= 0, 'on a blank account the session card does not name unit 1: « ' + home.slice(0, 90) + ' »');
    ok(home.indexOf(NL.gloss.of(units[0].name)) >= 0, 'the session card gives the unit number without its name');
    /* L'écran de la séance dit la même chose que la carte. */
    const label = t.unitOne(1) + ' · ' + NL.gloss.of(units[0].name);
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    const first = text(B.app.innerHTML);
    S.abandon();
    ok(first.indexOf(label) >= 0, 'on a blank account the session screen does not say « ' + label + ' »: « ' + first.slice(0, 90) + ' »');

    /* Une séance à cheval sur deux unités les nomme toutes les deux. */
    const u1 = NL.content.itemsOf(units[0].id);
    u1.slice(0, u1.length - 3).forEach(it => put(it, 2, T0 + 5 * DAY));
    const span = NL.srs.plan().units;
    ok(span && span.from === 1 && span.to === 2, 'the fixture is wrong: the plan should span units 1–2, spans ' + JSON.stringify(span));
    const two = text(NL.screens.vandaag.render());
    ok(two.indexOf(t.unitsRange(1, 2)) >= 0, 'a session spanning two units names only one: « ' + two.slice(0, 90) + ' »');
    /* Et l'écran de la séance aussi, à chaque exercice, pas seulement la carte. */
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    let asked = 0, named = 0;
    while (S.peek() && asked < 80) {
      const wasMatch = S.peek().ex === 'match';
      asked++;
      if (text(B.app.innerHTML).indexOf(t.unitsRange(1, 2)) >= 0) named++;
      answer.right();
      answer.next(wasMatch);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(asked > 0 && named === asked, 'the session screen leaves out « ' + t.unitsRange(1, 2) + ' » on ' + (asked - named) + ' of ' + asked + ' exercises');

    /* Le parcours : des comptes, et un compte à rebours vers l'unité suivante. */
    fresh();
    const n = NL.content.itemsOf(units[0].id).length, need = Math.ceil(n * 0.75);
    NL.content.itemsOf(units[0].id).slice(0, need - 4).forEach(it => put(it, 4, T0 + 5 * DAY));
    const path = text(NL.screens.leerpad.render());
    ok(path.indexOf(t.unitGate(4)) >= 0, 'the unit card does not count down the 4 items left before the next unit');
    ok(path.indexOf(t.unitCounts(need - 4, need - 4, n)) >= 0, 'the unit card does not report ' + (need - 4) + ' met and produced out of ' + n);
    ok(path.indexOf(t.courseCounts(need - 4, need - 4, all.length)) >= 0, 'the course header does not report its two counts');
    put(NL.content.itemsOf(units[0].id)[need - 4], 0, T0 + DAY);
    ok(text(NL.screens.leerpad.render()).indexOf(t.unitGate(3)) >= 0, 'meeting one more item did not move the countdown');
    console.log('  accueil et séance : « ' + t.unitsRange(1, 2) + ' » ; parcours : « ' + t.unitGate(3) + ' »');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLA SÉANCE — plus de rangée de repères, et un score qui se compte');
  {
    fresh();
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    let guard = 0, pips = 0, asked = 0;
    while (S.peek() && guard++ < 80) {
      const wasMatch = S.peek().ex === 'match';
      const html = B.app.innerHTML;
      asked++;
      if (html.indexOf('class="pips"') >= 0) pips++;
      read('sessie/' + S.peek().ex, html, 'question');
      answer.right();
      if (!wasMatch) read('sessie/verdict', B.app.innerHTML, 'réponse');
      answer.next(wasMatch);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    ok(pips === 0, pips + ' of ' + asked + ' exercises still show the row of rung markers under the progress bar');
    const done = read('sessie/fin', B.app.innerHTML, 'bilan');
    const tally = (done.match(/\b(\d+)\/\1\b/) || [''])[0];
    ok(tally, 'the summary does not count the right answers out of the total: « ' + done.slice(0, 160) + ' »');
    S.abandon();
    console.log('  ' + asked + ' exercices lus, bilan en « ' + tally + ' »');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLA SÉRIE');
  {
    /* Jours locaux, comme NL.util.dayKey() les compte : tirés de l'horloge du test. */
    const day = n => NL.util.dayKey(T0 + n * DAY);
    const streakOnHome = () => {
      const h = text(NL.screens.vandaag.render());
      return (h.match(new RegExp('(\\d+)\\s+(?:' + t.statStreak(1) + '|' + t.statStreak(2) + ')')) || [])[1];
    };
    fresh();
    NL.state.setMeta({ lastDay: day(-10), streak: 2 });
    ok(streakOnHome() === '0', 'la série est coupée depuis dix jours mais l\'accueil lit « ' + streakOnHome() + ' jours d\'affilée »');
    ok(NL.state.meta().streak === 2 && NL.state.meta().lastDay === day(-10), 'lire l\'accueil a modifié la série ou le dernier jour enregistrés');
    NL.state.setMeta({ lastDay: day(-1), streak: 2 });
    ok(streakOnHome() === '2', 'étudié hier : l\'accueil devrait garder la série de 2, il lit « ' + streakOnHome() + ' »');
    NL.state.setMeta({ lastDay: day(0), streak: 2 });
    ok(streakOnHome() === '2', 'étudié aujourd\'hui : l\'accueil devrait garder la série de 2, il lit « ' + streakOnHome() + ' »');
    NL.state.setMeta({ lastDay: day(-2), streak: 2 });
    ok(streakOnHome() === '0', 'avant-hier : la série est coupée, l\'accueil lit « ' + streakOnHome() + ' »');
    NL.state.setMeta({ lastDay: null, streak: 0 });
    ok(streakOnHome() === '0', 'jamais étudié : l\'accueil devrait lire 0');

    /* Le bilan : « 1 Jour », « 2 Jours ». */
    fresh();
    ok(S.begin('vandaag'), 'la séance n\'a pas démarré');
    NL.ui.go('sessie');
    let guard = 0;
    while (S.peek() && guard++ < 80) { const wm = S.peek().ex === 'match'; answer.right(); answer.next(wm); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    ok(B.app.innerHTML.indexOf('done-stage') >= 0, 'la séance n\'est pas arrivée au bilan');
    NL.state.setMeta({ streak: 1 });
    NL.ui.render();
    const one = text(B.app.innerHTML);
    ok(one.indexOf('1 ' + t.tallyDays(1)) >= 0 && one.indexOf('1 ' + t.tallyDays(2)) < 0, 'le bilan avec une série de 1 ne lit pas « 1 ' + t.tallyDays(1) + ' » : « ' + (one.match(new RegExp('.{0,20}' + t.tallyDays(1) + '.{0,10}')) || [''])[0] + ' »');
    NL.state.setMeta({ streak: 2 });
    NL.ui.render();
    const two = text(B.app.innerHTML);
    ok(two.indexOf('2 ' + t.tallyDays(2)) >= 0, 'le bilan avec une série de 2 ne lit pas « 2 ' + t.tallyDays(2) + ' »');
    S.abandon();
  }

  /* ------------------------------------------------------------------ */
  console.log('\nCE QUI RÉSISTE');
  {
    fresh();
    const [a, b, c, d] = all.filter(it => it.kind === 'word').slice(0, 4);
    [a, b, c, d].forEach(it => put(it, 2, T0 + 5 * DAY));
    const log = (it, okAns, ago) => NL.state.logReview({ id: it.id, t: T0 - ago, ok: okAns, stage: 1, kind: it.kind, ex: 'type' });
    log(a, false, 3 * DAY); log(a, false, 2 * DAY); log(a, true, DAY);      // raté deux fois
    log(b, false, DAY);                                                    // raté une fois
    log(c, true, DAY); log(c, true, 2 * DAY);                              // toujours juste
    log(d, false, 70 * DAY);                                               // raté, mais il y a plus de deux mois
    NL.state.logReview({ id: 'disparu:w99', t: T0 - DAY, ok: false, stage: 1, kind: 'word', ex: 'type' });

    const list = NL.srs.mistakes();
    ok(list.length === 2, 'expected 2 missed items, got ' + list.length + ' (' + list.map(x => x.item.nl).join(', ') + ')');
    ok(list[0] && list[0].item.id === a.id && list[0].wrong === 2 && list[0].right === 1, 'the most-missed item is not first, or is miscounted');
    ok(!list.some(x => x.item.id === c.id), 'an item answered right every time is listed');
    ok(!list.some(x => x.item.id === d.id), 'a miss older than two months is still counted');

    const screen = read('fouten', NL.screens.fouten.render(), 'deux ratés');
    ok(screen.indexOf(t.missTitle(2)) >= 0, 'the screen does not announce 2 items');
    ok(screen.indexOf(t.missRow(2, 3)) >= 0, 'the screen does not say « ' + t.missRow(2, 3) + ' »');
    ok(screen.indexOf(NL.util.bare(a.nl)) < screen.indexOf(NL.util.bare(b.nl)), 'the list is not ordered most-missed first');
    ok(text(NL.screens.meer.render()).indexOf(t.missTile(2)) >= 0, 'the Plus screen does not lead to the mistakes');

    /* « Fragile », dans le dictionnaire, veut maintenant dire raté. */
    NL.screens.woorden.click({ dataset: { f: 'zwak' } }, { act: 'filter' });
    const weak = NL.screens.woorden.render();
    const rows = (weak.match(/class="vrow"/g) || []).length;
    ok(rows === 2, 'the fragile filter lists ' + rows + ' items: it should list the 2 that were missed, not the 4 sitting on a low rung');
    NL.screens.woorden.click({ dataset: { f: 'alles' } }, { act: 'filter' });

    /* Une séance sur exactement ces éléments. */
    NL.screens.fouten.click({ dataset: {} }, { act: 'start' });
    const served = [];
    let guard = 0;
    while (S.peek() && guard++ < 20) { served.push(S.peek().items[0].id); answer.right(); answer.next(false); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    S.abandon();
    ok(served.length === 2 && served.indexOf(a.id) >= 0 && served.indexOf(b.id) >= 0, 'the mistakes session served ' + JSON.stringify(served));

    /* Rien de raté : l'écran le dit, et n'offre pas de séance vide. */
    fresh();
    const none = NL.screens.fouten.render();
    ok(text(none).indexOf(t.missNone) >= 0 && none.indexOf('data-act="start"') < 0, 'with nothing missed the screen still offers a session');
    console.log('  classés du plus raté au moins raté, séance sur ces éléments, filtre « fragiles » aligné');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nÀ VOIX HAUTE — le bouton « ' + t.cantSpeak + ' »');
  {
    fresh();
    const words = all.filter(it => it.kind !== 'pattern' && !it.cognate);
    words.slice(0, 4).forEach(it => put(it, 3, T0 - 2 * DAY));      // jamais dits : à dire
    words.slice(4, 30).forEach(it => put(it, 2, T0 - DAY));         // rien à dire
    ok(S.begin('vandaag'), 'the session did not start');
    NL.ui.go('sessie');
    let guard = 0, stray = 0, asked = 0;
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) {
      const wasMatch = S.peek().ex === 'match';
      asked++;
      if (S.render().indexOf('data-quiet') >= 0) stray++;
      answer.right(); answer.next(wasMatch);
    }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: the session holds no spoken exercise');
    ok(stray === 0, stray + ' of ' + asked + ' exercises that are not spoken carry the button');
    const q = read('sessie/speak', S.render(), 'question');
    ok(S.render().indexOf('data-quiet="1"') >= 0 && q.indexOf(t.cantSpeak) >= 0, 'the spoken exercise does not offer « ' + t.cantSpeak + ' »');

    /* Une fois la réponse donnée, c'est une réponse : le bouton s'en va. */
    answer.click({ self: '1' });
    ok(S.render().indexOf('data-quiet') < 0, 'the button is still offered after the answer was given');
    answer.click({ check: '1' }); answer.next(false);

    /* Appuyé : l'écran suivant se lit, et il n'y a plus rien à voix haute. */
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 120) { const wasMatch = S.peek().ex === 'match'; answer.right(); answer.next(wasMatch); }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: no second spoken exercise');
    ok(answer.cantSpeak(), 'the button does nothing');
    if (S.peek()) read('sessie/' + S.peek().ex, S.render(), 'sans parler');
    let spoken = 0;
    while (S.peek() && guard++ < 200) { const wasMatch = S.peek().ex === 'match'; if (S.peek().ex === 'speak') spoken++; answer.right(); answer.next(wasMatch); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    ok(spoken === 0, spoken + ' spoken exercise(s) after the button was pressed');
    S.abandon();
    console.log('  présent sur l’exercice parlé, absent des ' + asked + ' autres, retiré une fois la réponse donnée ; appuyé : plus rien à voix haute');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nCE QUI A CASSÉ SUR CET APPAREIL');
  {
    fresh(); NL.errlog.clear();
    ok(text(NL.screens.doctor.render()).indexOf(t.errNone) >= 0, 'with no error recorded the doctor screen does not say so');
    ok((B.listeners.error || []).length > 0 && (B.listeners.unhandledrejection || []).length > 0, 'the app does not listen for errors');
    NL.ui.go('leerpad');
    B.listeners.error.forEach(f => f({ error: new Error('boum dans le parcours') }));
    B.listeners.unhandledrejection.forEach(f => f({ reason: new Error('promesse perdue') }));
    const doc = read('doctor', NL.screens.doctor.render(), 'deux erreurs');
    ok(doc.indexOf('boum dans le parcours') >= 0 && doc.indexOf('promesse perdue') >= 0, 'a recorded error is not shown');
    ok(doc.indexOf('[leerpad') >= 0, 'the error does not say which screen it happened on');
    ok(Object.keys(B.store).some(k => k === 'vlaams/errors'), 'the errors are not kept across a reload');
    for (let i = 0; i < 40; i++) NL.errlog.note(new Error('n° ' + i), 'essai');
    ok(NL.errlog.all().length === NL.errlog.KEEP, 'the log keeps ' + NL.errlog.all().length + ' errors instead of the last ' + NL.errlog.KEEP);
    NL.screens.doctor.click({ dataset: {} }, { act: 'errclear' });
    ok(NL.errlog.all().length === 0, 'the list cannot be emptied');
    console.log('  erreur de fenêtre et promesse rejetée enregistrées avec leur écran, vingt au plus, vidables');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nPLUS COMPTE COMME L’ACCUEIL — rencontrés, produits, et « à toi »');
  {
    fresh();
    const course = all.filter(it => it.unit !== 'eigen');
    course.slice(0, 12).forEach((it, i) => put(it, i % 7, T0 + 5 * DAY));
    /* Un élément du palier « reconnaître » plafonne à l'échelon 2 : produit sans passer l'échelon PRODUCE. */
    const mine = [1, 2, 3].map(i => NL.state.addCustom({ id: 'x-test' + i, nl: 'het eigen' + i, fr: 'le mien ' + i }));
    NL.content.refresh();
    const low = NL.content.byId(course[20].id); low.tier = 'recognise'; put(low, 2, T0 + 5 * DAY);
    mine.forEach((w, i) => put(NL.content.byId(w.id), i === 0 ? 6 : 0, T0 + 5 * DAY));
    const cp = NL.content.courseProgress();
    const home = text(NL.screens.vandaag.render()), more = NL.screens.meer.render(), plus = text(more);
    ok(plus.indexOf(t.wordsTile(cp.met, cp.produce)) >= 0, 'the Plus tile does not give the course counts « ' + t.wordsTile(cp.met, cp.produce) + ' »: « ' + (plus.match(/Mon dictionnaire.{0,80}|\d+ rencontrés,.{0,40}/) || [''])[0] + ' »');
    const strip = (more.match(/<div class="mini-stats">[\s\S]*?<\/div>/) || [''])[0];
    const cell = label => { const m = strip.match(new RegExp('<b>([0-9]+)</b> ' + label + '<')); return m ? +m[1] : null; };
    ok(cell(t.statMet) === cp.met, 'the strip does not give ' + cp.met + ' « ' + t.statMet + ' », it gives ' + cell(t.statMet));
    ok(cell(t.statProduced) === cp.produce, 'the strip does not give ' + cp.produce + ' « ' + t.statProduced + ' », it gives ' + cell(t.statProduced));
    ok(home.indexOf(cp.met + ' ' + t.statMet) >= 0 && home.indexOf(cp.produce + ' ' + t.statProduce) >= 0, 'the home screen does not give the same two numbers');
    ok(cell(t.statMine) === 3 && plus.split(t.statMine).length - 1 === 1, 'the own words do not appear once as « 3 ' + t.statMine + ' »: ' + cell(t.statMine) + ' / ' + (plus.split(t.statMine).length - 1));
    const want = [t.statMet, t.statProduced, t.statMine, t.statSpoken, t.statBest, t.statCombo, t.statDefi, t.tallyXp].join(' | ');
    const got = (strip.match(/<b>[0-9]+<\/b> [^<]*/g) || []).map(c => c.replace(/^<b>[0-9]+<\/b> /, '')).join(' | ');
    ok(got === want, 'the Plus strip shows « ' + got + ' » instead of « ' + want + ' »');
    SCREENS.forEach(n => { let err = null; try { NL.screens[n].render(); } catch (e) { err = e; } ok(!err, n + ' throws: ' + (err && err.message)); });
    NL.screens.woorden.click({ dataset: { f: 'sterk' } }, { act: 'filter' });
    const rows = (NL.screens.woorden.render().match(/class="vrow"/g) || []).length;
    const expect = cp.produce;
    ok(rows === expect && expect > 0, 'the « produits » filter lists ' + rows + ' items, the count says ' + expect);
    ok(NL.content.allItems().some(it => it.unit !== 'eigen' && NL.content.produced(it) && NL.srs.stageOf(it) < NL.srs.PRODUCE), 'the fixture is wrong: no item is produced below the PRODUCE rung');
    NL.screens.woorden.click({ dataset: { f: 'alles' } }, { act: 'filter' });
    delete low.tier;
    /* Sans mot à soi, la case disparaît. */
    fresh(); NL.content.refresh();
    ok(!/à toi/.test(text(NL.screens.meer.render())), 'with no own words the strip still shows « à toi »');
    console.log('  tuile et bandeau de Plus = ' + cp.met + ' rencontrés, ' + cp.produce + ' produits, 3 à toi ; filtre « produits » : ' + rows + ' lignes');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nQUOTA ATTEINT, DES RÉVISIONS DUES — l’accueil le dit');
  {
    fresh();
    all.slice(0, 200).forEach(it => put(it, 3, T0 - DAY));
    NL.srs.spend(NL.srs.pace().cap);
    ok(NL.srs.plan().total === 0 && NL.srs.dueItems().length === 200, 'the fixture is wrong: expected nothing planned and 200 due');
    const spent = text(NL.screens.vandaag.render());
    ok(spent.indexOf(text(t.budgetDone)) >= 0, 'with the budget spent and 200 items due the home screen does not say « ' + t.budgetDone + ' »: « ' + spent.slice(0, 120) + ' »');
    ok(spent.indexOf(t.todayAllDone) < 0, 'with 200 items due the home screen says « ' + t.todayAllDone + ' »');
    /* Rien de dû : « Tout est à jour » reste. */
    fresh(); all.slice(0, 20).forEach(it => put(it, 3, T0 + 5 * DAY)); NL.srs.spend(NL.srs.pace().cap);
    const idle = text(NL.screens.vandaag.render());
    ok(idle.indexOf(t.todayAllDone) >= 0 && idle.indexOf(text(t.budgetDone)) < 0, 'with nothing due the home screen no longer says « ' + t.todayAllDone + ' »');
    console.log('  200 dus, quota atteint : « ' + t.budgetDone + ' » ; rien de dû : « ' + t.todayAllDone + ' »');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE TEXTE, S’IL Y EN A UN — NL.ui.ifText');
  {
    /* Sans texte, rien ; un texte sort échappé dans sa balise, avec sa classe s'il en a une. Un
       sens qui n'a rien à dire dans aucune langue ne donne rien non plus. #77 : un sens qui vaut
       null dans la langue lue n'a rien à dire à ce lecteur, même quand l'autre langue a un
       texte, en anglais comme en français ; un sens qui a un texte dans les deux sort dans
       celle qui est lue. La page est celle de ce bloc : aucun autre contrôle ne lit la langue
       où il la laisse. */
    const P = browser.open({ root: ROOT, seed: browser.SEED, byId: 'stub' });
    [
      [['', 'p'], 'en', ''],
      [[null, 'p', 'heard'], 'en', ''],
      [[undefined, 'div', 'toast'], 'en', ''],
      [['a', 'p'], 'en', '<p>a</p>'],
      [['3/4', 'p', 'bub-score'], 'en', '<p class="bub-score">3/4</p>'],
      [['<b> & "x"', 'em'], 'en', '<em>&lt;b&gt; &amp; &quot;x&quot;</em>'],
      [[{ fr: null, en: null }, 'p', 'v-note'], 'en', ''],
      [[{ fr: 'texte', en: null }, 'p'], 'en', ''],
      [[{ fr: null, en: 'text' }, 'p'], 'fr', ''],
      [[{ fr: 'texte', en: 'text' }, 'p'], 'en', '<p>text</p>'],
      [[{ fr: 'texte', en: 'text' }, 'p'], 'fr', '<p>texte</p>']
    ].forEach(([args, l, want]) => {
      P.NL.gloss.use(l);
      const got = P.NL.ui.ifText(...args);
      ok(got === want, 'NL.ui.ifText(' + JSON.stringify(args).slice(1, -1) + '), read in ' + l + ', gave « ' + got + ' »; wanted « ' + want + ' »');
    });
    console.log('  rien sans texte, ni pour un sens qui vaut null dans la langue lue ; sinon le texte échappé, dans sa balise, avec sa classe');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nCOPIER — la sauvegarde et le journal d’erreurs');
  {
    /* Les deux copies vont de la même façon : par le presse-papiers s'il existe, sinon par
       l'ancienne commande du navigateur, et le toast dit « Copié » si l'un ou l'autre a copié,
       « copie-le à la main » sinon. Une page à elle, aux minuteurs retenus : le toast reste à
       lire jusqu'à P.tick(), qui l'efface avant le cas suivant. La sauvegarde se copie depuis
       n'importe quel écran ; le journal, depuis le sien. */
    const P = browser.open({ root: ROOT, seed: browser.SEED, byId: 'stub', media: true, timers: 'held' });
    const settle = () => new Promise(r => setImmediate(r));
    await settle();
    P.NL.errlog.note('boum', 'essai');
    P.fields['backup-out'] = '{"sauvegarde":1}';
    P.NL.ui.go('doctor');
    const t = P.NL.t;
    const acts = [
      ['copy-backup', 'backup-out', () => P.fields['backup-out'], t.backupCopied, t.backupCopyByHand],
      ['errcopy', 'err-out', () => P.NL.errlog.text(), t.errCopied, t.errCopyByHand]
    ];
    /* Le presse-papiers : true l'accepte, false le refuse, null l'ôte ; de même l'ancienne commande. */
    const ways = [
      ['the clipboard', true, null],
      ['the clipboard refusing', false, null],
      ['the old command', null, true],
      ['the old command refusing', null, false],
      ['neither', null, null]
    ];
    /* Le champ copié est sélectionné avant toute copie : l'ancienne commande copie la sélection.
       P.events garde, dans l'ordre, le « select <id> » que le champ de la page y écrit et les
       appels des faux (presse-papiers, ancienne commande) : le contrôle compare cette suite. */
    for (const [act, box, text, copied, byHand] of acts) {
      for (const [way, clip, cmd] of ways) {
        P.events.length = 0;
        P.ctx.navigator.clipboard = clip === null ? undefined : { writeText: s => { P.events.push('writeText ' + s); return clip ? Promise.resolve() : Promise.reject(new Error('refused')); } };
        P.ctx.document.execCommand = cmd === null ? undefined : c => { P.events.push('execCommand ' + c); return cmd; };
        P.tap({ act });
        await settle();
        const wrote = 'select ' + box + (clip !== null ? ' | writeText ' + text() : cmd !== null ? ' | execCommand copy' : '');
        const toast = (P.app.innerHTML.match(/<div class="toast">([^<]*)<\/div>/) || [])[1];
        const said = clip === true || cmd === true ? copied : byHand;
        ok(P.events.join(' | ') === wrote, act + ' with ' + way + ' did « ' + P.events.join(' | ') + ' »; wanted « ' + wrote + ' »');
        ok(toast === said, act + ' with ' + way + ' showed « ' + toast + ' »; wanted « ' + said + ' »');
        P.tick();
      }
    }
    /* Sans presse-papiers ni champ à sélectionner, l'ancienne commande copierait une sélection
       qui n'est pas la nôtre : copy() rend false et ne la lance pas. */
    {
      P.events.length = 0;
      P.ctx.navigator.clipboard = undefined;
      P.ctx.document.execCommand = c => { P.events.push('execCommand ' + c); return true; };
      const got = await P.NL.ui.copy('x', null);
      ok(got === false, 'NL.ui.copy(\'x\', null) with only the old command gave ' + got + '; wanted false');
      ok(P.events.join(' | ') === '', 'NL.ui.copy(\'x\', null) with only the old command did « ' + P.events.join(' | ') + ' »; wanted nothing');
    }
    console.log('  sauvegarde et journal : le presse-papiers, sinon l’ancienne commande ; « ' + t.backupCopied + ' » si l’un a copié, sinon « ' + t.backupCopyByHand + ' »');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'SCREENS OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
