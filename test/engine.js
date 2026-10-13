/* Le moteur, vu de l'extérieur : ce qu'une séance contient, et quand un élément
   revient. Chaque bloc reproduit une situation réelle et regarde ce que la
   personne aurait devant elle — jamais les rouages du planificateur.

   L'horloge AVANCE pendant chaque séance. C'est tout l'enjeu : figée, un retour
   prévu dans douze minutes n'arrive jamais, et le défaut que cette suite garde
   est invisible. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-05T08:00:00Z');
const MIN = 60000, DAY = 86400000;
/* Ce que la spécification promet, écrit ici plutôt que relu dans le code : au
   moins 30 % des 22 places d'une séance, et jamais moins de quatre, vont au neuf. */
const FEW = 4, RESERVED = Math.max(FEW, Math.ceil(22 * 0.3));

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.OPR, byId: 'stub' });
const NL = B.NL, S = NL.screens.sessie;
const answer = require('./lib/answer')(B);

const met = it => !!NL.state.rec(it.id);
const isWord = it => it.kind !== 'pattern';
/* Place un élément sur un échelon, dû à l'instant donné. */
const put = (it, stage, due) => { NL.srs.seed(it, stage); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
const fresh = () => { NL.state.clearAll(); NL.content.refresh(); B.clock.set(T0); };

/* Joue une séance entière, vingt secondes par exercice. `right(c)` dit si la
   réponse est juste. Rend ce qui a été servi, dans l'ordre. */
function play(right) {
  const served = [];
  if (!S.begin('vandaag')) return served;
  let guard = 0;
  while (S.peek() && guard++ < 120) {
    const c = S.peek();
    const wasMatch = c.ex === 'match';
    served.push({ ex: c.ex, id: c.items[0].id, item: c.items[0], unmet: !wasMatch && !met(c.items[0]), second: !!c.second, retry: !!c.retry });
    B.clock.advance(20000);
    if (wasMatch || !right || right(c)) answer.right(); else answer.wrong();
    answer.next(wasMatch);
    if (NL.ui.route === 'sessie' && B.app.innerHTML.indexOf('done-stage') >= 0) break;
  }
  S.abandon();
  return served;
}

NL.state.open().then(() => {
  NL.content.refresh();
  NL.ui.go('sessie');
  const units = NL.content.units;

  /* ------------------------------------------------------------------ */
  console.log('LA PANNE RÉELLE — une unité entièrement rencontrée, la suivante fermée');
  /* L'état mesuré sur le compte : quatre unités créditées par l'ancien test de
     niveau (pas encore dues), et l'unité 5 entièrement rencontrée la veille —
     une vingtaine d'éléments au premier échelon, le reste au deuxième, tous dus.
     Ce jour-là l'écran disait « 22 à revoir, 0 nouveaux » et aucun mot neuf n'est
     arrivé. Le chiffre de 430 éléments du rapport d'origine ne reproduit PAS la
     panne : ces éléments n'étaient pas dus. */
  {
    fresh();
    units.slice(0, 4).forEach(u => NL.content.itemsOf(u.id).forEach(it => put(it, 3, T0 + 2 * DAY)));
    const u5 = NL.content.itemsOf(units[4].id);
    u5.slice(0, 20).forEach(it => put(it, 1, T0 - MIN));
    u5.slice(20).forEach(it => put(it, 2, T0 - MIN));
    const waiting = NL.content.itemsOf(units[5].id).filter(isWord).length;
    ok(waiting > 20, 'the fixture is wrong: unit 6 should be entirely unmet');

    const p = NL.srs.plan();
    const served = play();
    const newWords = served.filter(x => x.unmet && isWord(x.item));
    console.log('  annoncé : ' + p.due + ' à revoir, ' + p.fresh + ' nouveaux — servi : ' +
      served.length + ' exercices, dont ' + newWords.length + ' mots jamais rencontrés');
    ok(newWords.length >= FEW,
      'a session served ' + newWords.length + ' never-met words while ' + waiting + ' wait in the next unit');
    ok(newWords.some(x => x.item.unit === units[5].id), 'none of the new words comes from the next unit');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nDEUX JOURS DE SUITE — un compte neuf');
  /* Le contrôle qu'une seule séance ne peut pas faire : le défaut ne se voit
     que le lendemain. */
  {
    fresh();
    const day1 = [play(), play(), play()].map(s => s.filter(x => x.unmet).length);
    B.clock.set(T0 + DAY);
    NL.state.touchDay();
    const first = play().filter(x => x.unmet).length;
    console.log('  jour 1 : ' + day1.join(', ') + ' rencontres par séance — jour 2, première séance : ' + first);
    ok(day1[0] >= FEW, 'day one met nothing');
    ok(first >= FEW, 'day two opened with ' + first + ' never-met items: the course stopped moving after day one');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE RENFORCEMENT VIT DANS LA SÉANCE, PAS DANS LE CALENDRIER');
  {
    fresh();
    const served = play();
    const meetings = served.filter(x => x.unmet);
    const gaps = meetings.map(m => {
      const a = served.indexOf(m);
      const b = served.findIndex((x, i) => i > a && x.id === m.id && x.ex !== 'match');
      return b < 0 ? -1 : b - a;
    });
    ok(meetings.length >= FEW, 'a blank account met only ' + meetings.length + ' items');
    ok(gaps.every(g => g > 0), gaps.filter(g => g < 0).length + ' item(s) met in the session never came back in it');
    ok(gaps.every(g => g < 0 || g >= 3), 'an item came back only ' + Math.min.apply(null, gaps.filter(g => g > 0)) + ' exercise(s) after it was met');
    console.log('  ' + meetings.length + ' rencontres, chacune revue dans la séance, ' + Math.min.apply(null, gaps) + ' exercices plus tard au minimum');

    /* Rien de ce qui vient d'être répondu ne retombe dû dans la journée. */
    const soon = NL.state.allRecs().filter(r => r.due - B.clock.now() < DAY - 30 * MIN);
    ok(soon.length === 0, soon.length + ' item(s) are scheduled to return in less than a day (soonest: ' +
      Math.round(Math.min.apply(null, soon.map(r => r.due - B.clock.now())) / MIN) + ' min)');
    B.clock.advance(13 * MIN);
    ok(NL.srs.plan().due === 0, 'thirteen minutes after a session, ' + NL.srs.plan().due + ' items are due again');
    console.log('  treize minutes plus tard : ' + NL.srs.plan().due + ' à revoir');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nAUCUN INTERVALLE SOUS UN JOUR, À AUCUN ÉCHELON');
  {
    fresh();
    const it = NL.content.allItems().find(i => i.kind === 'word' && !i.cognate);
    let shortest = Infinity, where = '';
    for (let stage = 0; stage <= NL.srs.MAX_STAGE; stage++) {
      [true, false].forEach(right => {
        put(it, stage, T0);
        const r = NL.srs.grade(it, right, { ex: 'type' });
        if (r.due - B.clock.now() < shortest) { shortest = r.due - B.clock.now(); where = 'rung ' + stage + (right ? ', right' : ', wrong'); }
      });
    }
    /* Une toute première réponse fausse aussi. */
    fresh();
    const first = NL.srs.grade(it, false, { ex: 'pick' });
    shortest = Math.min(shortest, first.due - B.clock.now());
    ok(shortest >= DAY, 'an answer schedules a return in ' + Math.round(shortest / MIN) + ' min (' + where + ')');
    console.log('  intervalle le plus court après une réponse : ' + Math.round(shortest / 3600000) + ' h');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’ARITHMÉTIQUE — des révisions en nombre n’annulent plus le neuf');
  /* Le défaut tenait en deux soustractions qui ne disaient pas la même chose.
     L'écran d'accueil comptait le neuf comme ce qui reste des 22 places une fois
     les révisions servies : dès 22 éléments dus il annonçait « 0 nouveaux », quoi
     qu'il reste à rencontrer. La séance, elle, comptait sur le budget du JOUR :
     elle servait encore du neuf jusqu'à 120 éléments dus, puis plus rien. Deux
     calculs, deux réponses, et aucun ne garantissait du neuf. */
  {
    [22, 33, 60, 120, 200].forEach(n => {
      fresh();
      const all = NL.content.allItems();
      all.slice(0, n).forEach(it => put(it, 3, T0 - DAY));
      const p = NL.srs.plan();
      const served = play().filter(x => x.unmet).length;
      console.log('  ' + String(n).padStart(3) + ' dus, ' + (all.length - n) + ' à rencontrer : ' + p.fresh + ' nouveaux annoncés, ' + served + ' servis');
      ok(p.fresh >= RESERVED, n + ' items due, ' + (all.length - n) + ' unmet: the home screen announces ' + p.fresh + ' new');
      ok(served >= RESERVED, n + ' items due, ' + (all.length - n) + ' unmet: the session met ' + served + ' new item(s)');
      ok(served === p.fresh, n + ' items due: ' + p.fresh + ' new announced, ' + served + ' served');
    });
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLA RÉSERVE — du neuf même quand les révisions débordent');
  {
    /* Le quarantième jour : bien plus d'éléments dus qu'une séance n'a de places. */
    fresh();
    const all = NL.content.allItems();
    all.slice(0, 200).forEach(it => put(it, 3, T0 - DAY));
    const served = play();
    const news = served.filter(x => x.unmet).length;
    const reviews = served.filter(x => !x.unmet && !x.second && !x.retry && x.ex !== 'match').length;
    console.log('  200 éléments dus : ' + reviews + ' révisions, ' + news + ' rencontres');
    ok(news >= RESERVED, 'with 200 items due, a session met only ' + news + ' new item(s)');
    ok(reviews + news <= NL.srs.MAX_TASKS, 'the session holds ' + (reviews + news) + ' items, more than its ' + NL.srs.MAX_TASKS + ' places');

    /* La réserve survit au rabotage : presque plus de budget, et pourtant du neuf. */
    fresh();
    all.slice(0, 200).forEach(it => put(it, 3, T0 - DAY));
    NL.srs.spend(NL.srs.pace().cap - 5);
    const tight = NL.srs.compose('vandaag');
    console.log('  cinq exercices de budget : ' + tight.due.length + ' révision(s), ' + tight.fresh.length + ' rencontre(s)');
    ok(tight.fresh.length >= 1, 'a nearly spent day budget squeezed out every new item');
    ok(tight.due.length + 2 * tight.fresh.length <= 5, 'the session costs more exercises than the day has left');
    NL.srs.spend(5);
    ok(NL.srs.plan().total === 0, 'a spent day budget still offers a session');

    /* Plus rien à rencontrer : la réserve disparaît, les révisions prennent tout. */
    fresh();
    all.forEach((it, i) => put(it, 3, i < 60 ? T0 - DAY : T0 + 30 * DAY));
    const full = NL.srs.compose('vandaag');
    ok(full.fresh.length === 0 && full.due.length === NL.srs.MAX_TASKS,
      'with nothing left to meet, the session holds ' + full.due.length + ' reviews and ' + full.fresh.length + ' new');
    console.log('  plus rien à rencontrer : ' + full.due.length + ' révisions, ' + full.fresh.length + ' rencontre');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’ANNONCE ET LA SÉANCE DISENT LA MÊME CHOSE');
  {
    const states = {
      'compte neuf': () => {},
      'quelques révisions': () => NL.content.allItems().slice(0, 9).forEach(it => put(it, 2, T0 - DAY)),
      'révisions qui débordent': () => NL.content.allItems().slice(0, 120).forEach(it => put(it, 3, T0 - DAY))
    };
    Object.keys(states).forEach(name => {
      fresh(); states[name]();
      const p = NL.srs.plan();
      const again = NL.srs.plan();
      ok(p.due === again.due && p.fresh === again.fresh, name + ': asking twice gives two answers');
      ok(S.begin('vandaag'), name + ': the session did not start');
      const q = [];
      /* La séance entière, répondue juste : aucune reprise ne vient gonfler le compte. */
      let guard = 0;
      while (S.peek() && guard++ < 120) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        q.push({ unmet: !wasMatch && !met(c.items[0]), match: wasMatch, second: !!c.second });
        answer.right(); answer.next(wasMatch);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      S.abandon();
      const news = q.filter(x => x.unmet).length;
      const reviews = q.filter(x => !x.unmet && !x.match && !x.second).length;
      const tasks = q.filter(x => !x.match).length;
      console.log('  ' + name.padEnd(26) + 'annoncé ' + p.due + ' + ' + p.fresh + ' (' + p.tasks + ' exercices) — servi ' + reviews + ' + ' + news + ' (' + tasks + ')');
      ok(news === p.fresh, name + ': home announced ' + p.fresh + ' new, the session met ' + news);
      ok(reviews === p.due, name + ': home announced ' + p.due + ' to review, the session reviewed ' + reviews);
      ok(tasks === p.tasks, name + ': home announced ' + p.tasks + ' exercises, the session held ' + tasks);
    });
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE SEUIL — trois quarts RENCONTRÉS ouvrent l’unité suivante');
  {
    fresh();
    const u1 = NL.content.itemsOf(units[0].id);
    const need = Math.ceil(u1.length * 0.75);
    ok(!NL.content.unitOpen(units[1].id), 'unit 2 is open on a blank account');
    ok(NL.content.unitProgress(units[0].id).toOpen === need, 'a blank unit should count down from ' + need + ', says ' + NL.content.unitProgress(units[0].id).toOpen);
    /* Rencontrés, pas plus : au tout premier échelon, répondus une seule fois. */
    u1.slice(0, need - 1).forEach(it => put(it, 0, T0 + DAY));
    ok(!NL.content.unitOpen(units[1].id), 'unit 2 opened one item short of three quarters');
    ok(NL.content.unitProgress(units[0].id).toOpen === 1, 'the countdown should read 1, reads ' + NL.content.unitProgress(units[0].id).toOpen);
    put(u1[need - 1], 0, T0 + DAY);
    ok(NL.content.unitOpen(units[1].id), need + ' of ' + u1.length + ' items met and unit 2 is still shut');
    ok(NL.content.unitProgress(units[0].id).toOpen === 0, 'the countdown did not reach zero');
    ok(!NL.content.unitOpen(units[2].id), 'unit 3 opened over a unit nobody has started');
    console.log('  unité 1 : ' + need + ' éléments rencontrés sur ' + u1.length + ' ouvrent l’unité 2, et pas la 3');

    /* La frontière ne recule pas. */
    NL.state.clearAll(); NL.content.refresh();
    NL.state.setMeta({ reached: 3 });
    ok(NL.content.unitOpen(units[3].id), 'a unit that had been opened is shut again');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLES TRANSPARENTS — le sens est offert, rien d’autre');
  {
    fresh();
    const cog = NL.content.allItems().filter(i => i.cognate);
    ok(cog.length > 10, 'the fixture is gone: only ' + cog.length + ' cognates');
    const seen = {};
    cog.forEach(it => { for (let k = 0; k < 12; k++) seen[NL.srs.exerciseFor(it)] = 1; });
    ok(!seen.pick && !seen.recall, 'a never-met cognate is still asked what it means (' + Object.keys(seen).join(', ') + ')');
    ok(seen.dictation, 'a never-met cognate is never asked by ear');
    ok(seen.article, 'a never-met cognate noun is never asked its article');
    const noun = cog.find(i => i.art);
    NL.srs.grade(noun, true, { ex: 'article' });
    ok(NL.srs.stageOf(noun) === 2, 'one right answer puts a cognate on rung ' + NL.srs.stageOf(noun) + ', not 2');
    const next = {};
    for (let k = 0; k < 20; k++) next[NL.srs.exerciseFor(noun)] = 1;
    ok(next.dictation || next.type, 'after its first answer a cognate skips the ear and the pen');
    console.log('  ' + cog.length + ' transparents : première rencontre par ' + Object.keys(seen).join(', ') + ' — puis ' + Object.keys(next).join(', '));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nCE QUE LA SPÉCIFICATION NE DIT PAS, ET QUI ARRIVE');
  {
    /* Séance quittée en route, avant le renforcement des rencontres : rien n'est perdu,
       tout revient demain, et rien ne retombe dû aujourd'hui. */
    fresh();
    ok(S.begin('vandaag'), 'the session did not start');
    let n = 0;
    while (S.peek() && n < 6) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); n++; }
    S.abandon();
    const half = NL.state.allRecs();
    ok(half.length >= 4, 'the fixture is wrong: an abandoned session should have met a few items');
    ok(half.every(r => r.due - B.clock.now() >= DAY - 30 * MIN), 'an item met in an abandoned session is due again today');
    B.clock.advance(DAY);
    NL.state.touchDay();
    const back = NL.srs.compose('vandaag').due.length;
    ok(back === half.length, 'of ' + half.length + ' items met before quitting, only ' + back + ' come back the next day');
    console.log('  séance quittée après ' + half.length + ' rencontres : toutes reviennent le lendemain');

    /* Minuit passe pendant la séance : elle se termine, et le budget repart de zéro.
       23 h 58 à l'heure de la machine, et non à celle de Bruxelles : la CI tourne
       en UTC, où l'instant écrit en dur ne passait aucun minuit. Et le budget du
       jour est presque dépensé avant : sinon rien ne distingue un budget qui
       repart d'un budget qui continue. */
    fresh();
    B.clock.set(new Date(2026, 9, 5, 23, 58).getTime());
    NL.state.touchDay();
    NL.srs.spend(NL.srs.pace().cap - 30);
    const eve = NL.util.dayKey();
    const before = play().length;
    const crossed = NL.util.dayKey() !== eve;
    ok(crossed && before >= 20, crossed ? 'a session that crosses midnight stopped after ' + before + ' exercises' : 'the fixture is wrong: no midnight passed during the session');
    ok(NL.srs.budgetLeft() > 30 && NL.srs.plan().total > 0, 'after midnight the new day offers nothing: ' + NL.srs.budgetLeft() + ' exercises left of the day');
    console.log('  minuit pendant la séance : ' + before + ' exercices servis, et la journée suivante s’ouvre');

    /* Un mot ajouté à la main est rencontré à la séance suivante, pas après tout le cours. */
    fresh();
    const mine = NL.state.addCustom({ nl: 'de vergaderzaal', fr: 'la salle de réunion', kind: 'word' });
    NL.content.refresh();
    ok(NL.srs.compose('vandaag').fresh.some(it => it.id === mine.id), 'a word the learner added is not in the next session');
    NL.state.delCustom(mine.id); NL.content.refresh();

    /* Une unité où il ne reste rien à faire : pas de séance, et pas d'erreur. */
    fresh();
    NL.content.itemsOf(units[0].id).forEach(it => put(it, 3, T0 + 5 * DAY));
    ok(S.begin(units[0].id) === false, 'a unit with nothing new and nothing due still starts a session');
    ok(NL.screens.sessie.render(units[0].id).indexOf(NL.t.nothingDue) >= 0, 'the empty unit session does not say there is nothing to do');
    S.abandon();

    /* Budget du jour épuisé (ou rythme baissé en cours de journée) : rien n'est promis. */
    fresh();
    NL.srs.spend(NL.srs.pace().cap);
    NL.state.setMeta({ pace: 'calme' });
    const p = NL.srs.plan();
    ok(p.total === 0 && p.tasks === 0 && p.units === null, 'with the day budget spent the home screen still promises ' + JSON.stringify(p));
    ok(S.begin('vandaag') === false, 'a session starts although the day budget is spent');
    NL.state.setMeta({ pace: 'normal' });
    console.log('  mot ajouté à la main servi d’abord ; unité vide et budget épuisé : pas de séance, pas d’erreur');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'ENGINE OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
