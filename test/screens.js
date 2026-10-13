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

const text = html => String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const put = (it, stage, due) => { NL.srs.seed(it, stage); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
const fresh = () => { NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };
const SCREENS = ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor', 'fouten'];

/* Ce qu'aucun écran ne doit montrer, quel que soit l'état. */
function read(name, html, state) {
  const txt = text(html), where = name + ' (' + state + ')';
  ok(txt.length > 60, where + ' rendered almost nothing');
  ok(!/undefined|NaN|\[object/.test(txt), where + ' printed a hole: ' + (txt.match(/.{0,30}(undefined|NaN|\[object).{0,20}/) || [''])[0]);
  ok(!/\d\s?%/.test(txt), where + ' shows a percentage: « ' + (txt.match(/.{0,40}\d\s?%.{0,15}/) || [''])[0] + ' »');
  ok(!/ma[iî]tris/i.test(txt), where + ' still speaks of mastery: « ' + (txt.match(/.{0,30}ma[iî]tris.{0,20}/i) || [''])[0] + ' »');
  ok(!/test de niveau/i.test(txt) && html.indexOf('placement') < 0, where + ' still offers the placement test');
  return txt;
}
const sweep = state => SCREENS.forEach(name => {
  try { read(name, NL.screens[name].render(), state); }
  catch (e) { ok(false, name + ' (' + state + ') threw: ' + e.message); }
});

NL.state.open().then(() => {
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
    ok(home.indexOf(units[0].name) >= 0, 'the session card gives the unit number without its name');

    /* Une séance à cheval sur deux unités les nomme toutes les deux. */
    const u1 = NL.content.itemsOf(units[0].id);
    u1.slice(0, u1.length - 3).forEach(it => put(it, 2, T0 + 5 * DAY));
    const span = NL.srs.plan().units;
    ok(span && span.from === 1 && span.to === 2, 'the fixture is wrong: the plan should span units 1–2, spans ' + JSON.stringify(span));
    const two = text(NL.screens.vandaag.render());
    ok(two.indexOf(t.unitsRange(1, 2)) >= 0, 'a session spanning two units names only one: « ' + two.slice(0, 90) + ' »');

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
    console.log('  accueil : « ' + t.unitsRange(1, 2) + ' » ; parcours : « ' + t.unitGate(3) + ' »');
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

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'SCREENS OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
