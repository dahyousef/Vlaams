/* Le moteur, vu de l'extérieur : ce qu'une séance contient, et quand un élément
   revient. Chaque bloc reproduit une situation réelle et regarde ce que la
   personne aurait devant elle — jamais les rouages du planificateur.

   L'horloge AVANCE pendant chaque séance. C'est tout l'enjeu : figée, un retour
   prévu dans douze minutes n'arrive jamais, et le défaut que cette suite garde
   est invisible. */
const browser = require('./lib/browser');
const { inZone, offsets } = require('./lib/zone');
const ROOT = process.argv[2];
const T0 = Date.parse('2026-10-05T08:00:00Z');
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
/* Ce que la spécification promet, écrit ici plutôt que relu dans le code : au
   moins 30 % des 22 places d'une séance, et jamais moins de quatre, vont au neuf. */
const FEW = 4, RESERVED = Math.max(FEW, Math.ceil(22 * 0.3));

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.OPR, byId: 'stub' });
const NL = B.NL, S = NL.screens.sessie;
const answer = require('./lib/answer')(B);

/* Un retour prévu par une réponse tombe un autre jour que la réponse, et au
   moins huit heures après elle (#28). Le jour se lit à l'heure locale, comme
   l'appli le lit ; `last` est l'instant de la réponse. */
const dayOf = t => NL.util.dayKey(t);
const dayAfter = t => { const d = new Date(t); return dayOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()); };
const laterDay = r => !!r && dayOf(r.due) > dayOf(r.last) && r.due - r.last >= 8 * HOUR;
const tomorrow = r => laterDay(r) && dayOf(r.due) === dayAfter(r.last);

const met = it => !!NL.state.rec(it.id);
const isWord = it => it.kind !== 'pattern';
/* Place un élément sur un échelon, dû à l'instant donné. */
const put = (it, rung, due) => { NL.srs.seed(it, rung); const r = NL.state.rec(it.id); r.due = due; NL.state.setRec(r); };
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
  console.log('\nÀ LA MÊME HEURE LE LENDEMAIN — ce qui revient demain est dû (#28)');
  /* Une séance à l'heure habituelle, et celle du lendemain à la même heure. Un
     retour prévu vingt-quatre heures pile après chaque réponse tombait quelques
     minutes après le début de la séance du lendemain, l'horloge ayant avancé
     pendant celle de la veille : rien de la veille n'était dû quand la séance se
     composait, et un élément rencontré aujourd'hui revenait après-demain. */
  {
    fresh();
    play();
    const oneDay = NL.state.allRecs().filter(r => r.interval === DAY).map(r => r.id);
    B.clock.set(T0 + DAY);
    NL.state.touchDay();
    const due = new Set(NL.srs.compose('vandaag').due.map(it => it.id));
    const missed = oneDay.filter(id => !due.has(id));
    console.log('  ' + oneDay.length + ' élément(s) laissés à un jour, ' + (oneDay.length - missed.length) + ' dus le lendemain à la même heure');
    ok(oneDay.length > 0, 'the fixture is wrong: a first session left nothing on a one-day step');
    ok(missed.length === 0, 'at the same hour the next day, ' + missed.length + ' of ' + oneDay.length + ' items left on a one-day step are not in the session');
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
    const soon = NL.state.allRecs().filter(r => !laterDay(r));
    ok(soon.length === 0, soon.length + ' item(s) are scheduled to return the day they were answered or within 8 hours (soonest: ' +
      Math.round(Math.min.apply(null, soon.map(r => r.due - r.last)) / MIN) + ' min after the answer)');
    B.clock.advance(13 * MIN);
    ok(NL.srs.plan().due === 0, 'thirteen minutes after a session, ' + NL.srs.plan().due + ' items are due again');
    console.log('  treize minutes plus tard : ' + NL.srs.plan().due + ' à revoir');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nAUCUN RETOUR LE JOUR DE LA RÉPONSE, À AUCUN ÉCHELON');
  {
    fresh();
    const it = NL.content.allItems().find(i => i.kind === 'word' && !i.cognate);
    let shortest = Infinity;
    const early = [];
    const look = (r, where) => {
      shortest = Math.min(shortest, r.due - r.last);
      if (!laterDay(r)) early.push(where + ' : ' + Math.round((r.due - r.last) / MIN) + ' min, ' + dayOf(r.due));
    };
    for (let rung = 0; rung <= NL.srs.MAX_STAGE; rung++) {
      [true, false].forEach(right => {
        put(it, rung, T0);
        look(NL.srs.grade(it, right, { ex: 'type' }), 'rung ' + rung + (right ? ', right' : ', wrong'));
      });
    }
    /* Une toute première réponse fausse aussi. */
    fresh();
    look(NL.srs.grade(it, false, { ex: 'pick' }), 'first answer, wrong');
    ok(early.length === 0, 'an answer schedules a return the day it was given or within 8 hours: ' + early.join(' ; '));
    console.log('  attente la plus courte après une réponse : ' + Math.round(shortest / HOUR) + ' h');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’HEURE DE LA RÉPONSE — à Bruxelles, changements d’heure compris (#28)');
  /* Un élément revient au début du jour local situé `interval` jours après la
     réponse, et jamais moins de huit heures après elle. Les instants sont écrits
     en UTC, et ce qu'on en attend aussi, relevé sur le calendrier de Bruxelles.
     Le fuseau est fixé pour ce bloc seul (test/lib/zone.js) : la CI, qui tourne
     en UTC, voit ainsi les mêmes nuits de changement d'heure, et le reste de la
     suite tourne là où il a commencé. */
  {
    const before = offsets();
    inZone('Europe/Brussels', () => {
      fresh();
      const it = NL.content.allItems().find(i => i.kind === 'word' && !i.cognate);
      [
        ['10 March 2026, 08:00', '2026-03-10T07:00:00Z', 0, '2026-03-10T23:00:00Z'],      // minuit, le 11
        ['10 March 2026, 23:50', '2026-03-10T22:50:00Z', 0, '2026-03-11T06:50:00Z'],      // 7 h 50, le 11
        ['25 October 2026, 00:30', '2026-10-24T22:30:00Z', 0, '2026-10-25T23:00:00Z'],    // minuit, le 26 : on recule d'une heure la nuit du 25
        ['28 March 2026, 23:50', '2026-03-28T22:50:00Z', 0, '2026-03-29T06:50:00Z'],      // 8 h 50, le 29 : on avance d'une heure cette nuit-là
        ['20 October 2026, 08:00, rung 3', '2026-10-20T06:00:00Z', 3, '2026-10-27T23:00:00Z'] // huit jours : minuit, le 28
      ].forEach(([when, at, rung, want]) => {
        B.clock.set(Date.parse(at));
        put(it, rung, Date.parse(at));
        const r = NL.srs.grade(it, true, { ex: 'type' });
        ok(r.due === Date.parse(want), 'answered on ' + when + ' in Brussels, an item is due ' + new Date(r.due).toISOString() + ', not ' + want);
      });
    });
    ok(offsets() === before, 'after the Brussels block the rest of the suite runs at UTC offsets ' + offsets() + ' (January / July), not ' + before + ' as before it');
    console.log('  8 h → minuit ; 23 h 50 → huit heures plus tard ; les deux nuits de changement d’heure ; huit jours → minuit');
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
    /* Ce qu'elle coûte, c'est ce qu'elle sert : un second exercice qui ne tient
       pas à trois exercices du premier n'est pas servi, et ne coûte rien. */
    const spent = play().filter(x => x.ex !== 'match').length;
    console.log('  cinq exercices de budget : ' + tight.due.length + ' révision(s), ' + tight.fresh.length + ' rencontre(s), ' + spent + ' exercice(s) servi(s)');
    ok(tight.fresh.length >= 1, 'a nearly spent day budget squeezed out every new item');
    ok(spent <= 5, 'the session served ' + spent + ' exercises, more than the 5 the day has left');
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
  console.log('\n« COMMENT LE DIT-ON ICI ? » POUR UN MOT — à l’échelon 1, s’il a sa forme d’ici');
  /* Un mot qui a sa forme flamande la rencontre à l'échelon 1, comme une phrase : l'exercice
     montre le néerlandais standard et propose la première forme de sa liste (« hey » pour hallo,
     dont la liste est « hey, salut »). Quand cette première forme est le néerlandais même
     (« ja, jaja » pour ja), il n'y a rien à demander, et l'exercice ne se propose pas. */
  {
    fresh();
    const word = nl => NL.content.allItems().find(i => i.kind === 'word' && i.nl === nl);
    [['hallo', true], ['natuurlijk', true], ['de vergadering', true], ['ja', false], ['de dokter', false]].forEach(([nl, want]) => {
      const it = word(nl);
      if (!it) { ok(false, 'the fixture is gone: no word « ' + nl + ' »'); return; }
      ok(NL.srs.supports(it, 'vlaams') === want, '« ' + nl + ' » (be « ' + it.be + ' ») ' + (want ? 'cannot carry' : 'carries') + ' « Comment le dit-on ici ? »');
    });
    const phrase = NL.content.allItems().find(i => i.nl === 'Is dat alles?');
    ok(!!phrase && NL.srs.supports(phrase, 'vlaams'), 'the phrase « Is dat alles? » no longer carries « Comment le dit-on ici ? »');
    ok(NL.srs.RUNGS.word[1].indexOf('vlaams') >= 0, 'word rung 1 offers ' + NL.srs.RUNGS.word[1].join(', ') + ', not « Comment le dit-on ici ? »');
    const hallo = word('hallo'), seen = {};
    put(hallo, 1, T0);
    for (let k = 0; k < 40; k++) seen[NL.srs.exerciseFor(hallo)] = 1;
    ok(seen.vlaams, 'hallo on rung 1 is asked ' + Object.keys(seen).join(', ') + ', never « Comment le dit-on ici ? »');
    const words = NL.content.allItems().filter(i => i.kind === 'word' && NL.srs.supports(i, 'vlaams'));
    console.log('  ' + words.length + ' mots le portent, dont hallo à l’échelon 1 (' + Object.keys(seen).sort().join(', ') + ') ; ni ja ni de dokter');
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
    ok(half.every(laterDay), 'an item met in an abandoned session is due again the same day or within 8 hours');
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

  /* ------------------------------------------------------------------ */
  console.log('\nÀ VOIX HAUTE — dès le troisième échelon, et la première fois ne déplace rien');
  {
    fresh();
    const words = NL.content.allItems().filter(isWord);
    const it = words.find(i => !i.cognate);
    const draw = n => { const seen = {}; for (let k = 0; k < n; k++) seen[NL.srs.exerciseFor(it)] = 1; return Object.keys(seen); };

    /* Jamais dit : dès que l'échelon le propose, c'est ce qui est demandé. */
    const mute = words.filter(w => { put(w, 3, T0); return NL.srs.exerciseFor(w) !== 'speak'; });
    ok(mute.length === 0, mute.length + ' of ' + words.length + ' never-said items on rung 3 are not asked aloud, e.g. « ' + (mute[0] && mute[0].nl) + ' »');
    put(it, 2, T0);
    ok(draw(30).indexOf('speak') < 0, 'an item is asked aloud on rung 2, before its rung offers it');

    /* Raté sans avoir jamais été dit : l'échelon est gardé, et il revient demain, à voix haute. */
    put(it, 3, T0);
    let r = NL.srs.grade(it, false, { ex: 'speak' });
    ok(r.stage === 3, 'a wrong first spoken answer sends the item from rung 3 to rung ' + r.stage);
    ok(tomorrow(r), 'after a wrong first spoken answer on ' + dayOf(r.last) + ' the item is due on ' + dayOf(r.due) + ', not the next day');
    ok(draw(20).join() === 'speak', 'after a wrong first spoken answer the item is asked: ' + draw(20).join(', '));
    /* Une faute à l'écrit, elle, coûte toujours deux échelons. */
    put(it, 3, T0);
    ok(NL.srs.grade(it, false, { ex: 'type' }).stage === 1, 'a wrong written answer on rung 3 no longer drops two rungs');

    /* Dit pour la première fois : il est dit, et il ne monte pas. Lire un mot à
       voix haute ne dit pas qu'on sait l'écrire : c'est l'exercice suivant qui
       en décide, et celui-là n'est pas parlé. */
    put(it, 3, T0);
    r = NL.srs.grade(it, true, { ex: 'speak', spoken: true });
    ok(r.said === true && r.stage === 3, 'a first right spoken answer should leave the item said and on rung 3: it is on rung ' + r.stage + ', said ' + r.said);
    ok(tomorrow(r), 'after a first right spoken answer on ' + dayOf(r.last) + ' the item is due on ' + dayOf(r.due) + ', not the next day');
    const then = draw(30);
    ok(then.indexOf('speak') < 0, 'an item that has just been said for the first time is asked: ' + then.join(', '));
    r = NL.srs.grade(it, true, { ex: then[0] });
    ok(r.stage === 4, 'the written answer that follows should take the item to rung 4: it is on rung ' + r.stage);

    /* Une fois dit, l'échelon tire au sort comme avant, et une réponse à voix
       haute compte comme une autre, juste ou fausse. */
    r.stage = 3; r.lastEx = null; NL.state.setRec(r);
    const after = draw(60);
    ok(after.length > 1 && after.indexOf('speak') >= 0, 'once said, rung 3 offers only: ' + after.join(', '));
    ok(NL.srs.grade(it, true, { ex: 'speak', spoken: true }).stage === 4, 'once said, a right spoken answer no longer climbs a rung');
    r = NL.state.rec(it.id); r.stage = 3; NL.state.setRec(r);
    ok(NL.srs.grade(it, false, { ex: 'speak' }).stage === 1, 'once said, a wrong spoken answer no longer drops two rungs');
    console.log('  ' + words.length + ' mots et phrases dits dès l’échelon 3 ; raté la première fois : échelon gardé, retour le lendemain ; dit la première fois : échelon gardé, puis ' + then.sort().join(' ou ') + ' ; une fois dit : ' + after.sort().join(', '));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nL’ÉCHELON 3, UNE FOIS DIT — ce qui fait monter par écrit se tape');
  /* Passer l'échelon 3, c'est compter parmi les éléments que l'on sait
     produire. Choisir un trou, toucher la faute ou ranger des tuiles ne le
     prouve pas : à cet échelon, tout exercice qui n'est pas parlé se tape. La
     dictée d'un mot se tape, celle d'une phrase se range en tuiles. */
  {
    fresh();
    const typed = (n, it) => n === 'type' || n === 'open' || (n === 'dictation' && it.kind === 'word');
    const label = { word: 'mots', phrase: 'phrases', chunk: 'expressions', pattern: 'règles' };
    const byKind = {};
    NL.content.allItems().forEach(it => {
      put(it, 3, T0);
      const r = NL.state.rec(it.id); r.said = true; r.lastEx = null; NL.state.setRec(r);
      const k = byKind[it.kind] = byKind[it.kind] || { n: 0, untyped: 0, wrong: {}, offered: {} };
      k.n++;
      let untyped = false;
      for (let j = 0; j < 40; j++) {
        const n = NL.srs.exerciseFor(it);
        k.offered[n] = 1;
        if (n !== 'speak' && !typed(n, it)) { untyped = true; k.wrong[n] = 1; }
      }
      if (untyped) k.untyped++;
    });
    Object.keys(byKind).forEach(kind => {
      const k = byKind[kind];
      ok(k.untyped === 0, 'on rung 3, ' + k.untyped + ' of ' + k.n + ' ' + kind + ' items already said can climb to rung 4 on an exercise not typed: ' + Object.keys(k.wrong).join(', '));
    });
    console.log('  une fois dits, à l’échelon 3 : ' + Object.keys(byKind).map(kind => label[kind] + ' ' + Object.keys(byKind[kind].offered).sort().join(' ou ')).join(' ; '));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nDIT POUR LA PREMIÈRE FOIS — un second exercice dans la séance, et c’est l’écrit qui fait monter');
  {
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    /* Six éléments jamais dits, à l'échelon qui demande de les dire, et une
       trentaine d'autres qui n'ont rien à dire. Tous dus. */
    const voice = words.slice(0, 6), other = words.slice(6, 40);
    const set = () => { fresh(); voice.forEach(it => put(it, 3, T0 - 2 * DAY)); other.forEach(it => put(it, 2, T0 - DAY)); };
    const of = (served, it) => served.filter(x => x.id === it.id && x.ex !== 'match');
    const toSay = it => voice.some(v => v.id === it.id);
    const cost = c => c.due.length + c.due.filter(it => NL.srs.firstAloud(it)).length + 2 * c.fresh.length;

    /* L'annonce compte ce second exercice, comme elle compte celui d'une rencontre. */
    set();
    const c = NL.srs.compose('vandaag'), p = NL.srs.plan();
    ok(c.due.filter(toSay).length === voice.length, 'the fixture is wrong: the session should hold the six items to be said');
    ok(p.tasks === cost(c), 'the home screen announces ' + p.tasks + ' exercises for a session that costs ' + cost(c));

    /* Tout juste : chacun est dit, puis écrit plus loin, et c'est l'écrit qui le fait monter. */
    const served = play();
    const held = served.filter(x => x.ex !== 'match').length;
    ok(held === p.tasks, 'home announced ' + p.tasks + ' exercises, the session held ' + held);
    const gaps = [];
    voice.forEach(it => {
      const s = of(served, it), rec = NL.state.rec(it.id);
      ok(s.length === 2 && s[0].ex === 'speak' && s[1].ex !== 'speak', '« ' + it.nl + ' » was asked: ' + s.map(x => x.ex).join(', ') + ' — it should be said, then written');
      ok(rec.said === true && rec.stage === 4, '« ' + it.nl + ' », said then written, is said ' + rec.said + ' and on rung ' + rec.stage + ', not 4');
      if (s.length === 2) gaps.push(served.indexOf(s[1]) - served.indexOf(s[0]));
    });
    ok(gaps.length > 0 && Math.min.apply(null, gaps) > 3, 'an item was written only ' + Math.min.apply(null, gaps) + ' exercise(s) after it was read aloud');
    console.log('  ' + voice.length + ' éléments dits puis écrits dans la séance, ' + Math.min.apply(null, gaps) + ' exercices plus tard au minimum : ' + held + ' exercices annoncés et servis');

    /* Raté à voix haute : redemandé à voix haute avant son second exercice, qui
       reste ainsi libre pour l'écrire. Dit cette fois, il est écrit le jour même. */
    set();
    const tries = {};
    const missing = n => x => !(x.ex === 'speak' && toSay(x.items[0]) && (tries[x.items[0].id] = (tries[x.items[0].id] || 0) + 1) <= n);
    const once = play(missing(1)), regaps = [];
    voice.forEach(it => {
      const s = of(once, it), rec = NL.state.rec(it.id);
      ok(s.length === 3 && s[0].ex === 'speak' && s[1].ex === 'speak' && s[2].ex !== 'speak', '« ' + it.nl + ' », missed aloud, was then asked: ' + s.slice(1).map(x => x.ex).join(', ') + ' — it should be said again, then written');
      ok(rec.said === true && rec.stage === 4, '« ' + it.nl + ' », missed, said, then written, is said ' + rec.said + ' and on rung ' + rec.stage + ', not 4');
      if (s.length === 3) regaps.push(once.indexOf(s[2]) - once.indexOf(s[1]));
    });
    ok(regaps.length > 0 && Math.min.apply(null, regaps) > 3, 'an item said at the second try was written only ' + Math.min.apply(null, regaps) + ' exercise(s) later');

    /* Raté deux fois : son second exercice le redemande à voix haute. Dit enfin,
       il garde son échelon, et l'écrit attend le lendemain. */
    set();
    Object.keys(tries).forEach(id => { delete tries[id]; });
    const twice = play(missing(2));
    voice.forEach(it => {
      const s = of(twice, it), rec = NL.state.rec(it.id);
      ok(s.length === 3 && s.every(x => x.ex === 'speak'), '« ' + it.nl + ' », missed aloud twice, was asked: ' + s.map(x => x.ex).join(', '));
      ok(rec.said === true && rec.stage === 3, '« ' + it.nl + ' », said at the third try, is said ' + rec.said + ' and on rung ' + rec.stage + ', not 3');
    });
    B.clock.advance(DAY);
    NL.state.touchDay();
    const morrow = voice.filter(it => NL.srs.exerciseFor(it) === 'speak');
    ok(morrow.length === 0, morrow.length + ' item(s) said yesterday are asked aloud again today instead of being written');

    /* Séance quittée entre les deux exercices : dit, pas monté, et demain c'est l'écrit. */
    set();
    ok(S.begin('vandaag'), 'the session did not start');
    let guard = 0;
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); }
    const left = S.peek() && S.peek().items[0];
    ok(left && toSay(left), 'the fixture is wrong: the session holds no spoken exercise');
    answer.right(); answer.next(false);
    S.abandon();
    const half = NL.state.rec(left.id);
    ok(half.said === true && half.stage === 3 && laterDay(half), 'an item said in a session left before its second exercise is said ' + half.said + ', on rung ' + half.stage + ', due ' + Math.round((half.due - half.last) / HOUR) + ' h after the answer, on ' + dayOf(half.due));
    B.clock.advance(DAY);
    NL.state.touchDay();
    ok(NL.srs.exerciseFor(left) !== 'speak', 'the day after it was said, the item is asked aloud again');

    /* Budget presque épuisé : le second exercice compte dans ce qu'il reste. */
    set();
    NL.srs.spend(NL.srs.pace().cap - 7);
    const tight = NL.srs.compose('vandaag');
    const spent = play().filter(x => x.ex !== 'match').length;
    ok(spent <= 7, 'with seven exercises left in the day, the session served ' + spent);
    ok(tight.fresh.length >= 1, 'a nearly spent day budget squeezed out every new item');
    console.log('  raté une fois : redit ' + Math.min.apply(null, regaps) + ' exercices au moins avant d’être écrit ; raté deux fois : dit à la troisième, écrit le lendemain ; séance quittée : dit, échelon gardé ; sept exercices de budget : ' + tight.due.length + ' révision(s), ' + tight.fresh.length + ' rencontre(s), ' + spent + ' exercice(s) servi(s)');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nJE NE PEUX PAS PARLER — la séance continue, sans rien à voix haute');
  {
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    /* Huit éléments jamais dits, à l'échelon qui demande de les dire, et une
       cinquantaine d'autres qui n'ont rien à dire. Tous dus. */
    const voice = words.slice(0, 8), other = words.slice(8, 60);
    fresh();
    voice.forEach(it => put(it, 3, T0 - 2 * DAY));
    other.forEach(it => put(it, 2, T0 - DAY));
    const kept = () => JSON.stringify(voice.map(it => NL.state.rec(it.id)));
    const size = () => Number((S.render().match(/class="pill">\d+\/(\d+)</) || [0, 0])[1]);

    ok(voice.every(it => NL.srs.needsVoice(it)) && !other.some(it => NL.srs.needsVoice(it)), 'needsVoice() does not tell the items that can only be spoken from the others');
    const without = NL.srs.compose('vandaag', undefined, { quiet: true }).due;
    ok(without.length > 0 && !without.some(it => NL.srs.needsVoice(it)), 'a session composed without speaking still holds ' + without.filter(it => NL.srs.needsVoice(it)).length + ' item(s) that can only be spoken');

    ok(S.begin('vandaag'), 'the session did not start');
    let guard = 0;
    while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); }
    ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: the session holds no spoken exercise');
    const before = kept(), left = NL.srs.budgetLeft(), held = size();

    ok(answer.cantSpeak(), 'a spoken exercise cannot be put off');
    ok(kept() === before, 'putting a spoken exercise off changed a stored record');
    ok(NL.srs.budgetLeft() === left, 'putting a spoken exercise off spent ' + (left - NL.srs.budgetLeft()) + ' of the day budget');
    /* Les places sont reprises par d'autres éléments dus ; seul part le second
       exercice de chacun de ceux qu'on a mis de côté. */
    ok(size() === held - voice.length, 'the session went from ' + held + ' exercises to ' + size() + ': it should lose the second exercise of each of the ' + voice.length + ' items put off, and nothing else');

    /* La suite de la séance : rien à voix haute, et aucun des éléments mis de côté. */
    const rest = [];
    guard = 0;
    while (S.peek() && guard++ < 80) {
      const c = S.peek(), m = c.ex === 'match';
      rest.push({ ex: c.ex, id: c.items[0].id });
      B.clock.advance(20000); answer.right(); answer.next(m);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(rest.length > 0 && !rest.some(x => x.ex === 'speak'), rest.filter(x => x.ex === 'speak').length + ' spoken exercise(s) were served after « je ne peux pas parler »');
    ok(!rest.some(x => voice.some(it => it.id === x.id)), 'an item put off came back in the same session');
    ok(kept() === before, 'an item put off was graded before the session ended');

    /* La séance suivante : ils reviennent, à voix haute d'abord, puis par écrit. */
    B.clock.advance(DAY);
    NL.state.touchDay();
    const next = play().filter(x => !x.retry && voice.some(it => it.id === x.id));
    const back = next.filter(x => !x.second), written = next.filter(x => x.second);
    ok(back.length === voice.length, 'of ' + voice.length + ' items put off, ' + back.length + ' came back in the next session');
    ok(back.every(x => x.ex === 'speak'), back.filter(x => x.ex !== 'speak').length + ' item(s) put off came back as something other than a spoken exercise');
    ok(written.length === voice.length && written.every(x => x.ex !== 'speak'), 'of ' + voice.length + ' items said at last, ' + written.filter(x => x.ex !== 'speak').length + ' were then asked in writing');
    console.log('  ' + voice.length + ' exercices parlés mis de côté : rien de noté, budget intact, séance de ' + held + ' exercices ramenée à ' + (held - voice.length) + ' ; le lendemain les ' + back.length + ' reviennent à voix haute, puis par écrit');

    /* Il ne reste que du parlé : la séance s'arrête là, sans bilan et sans journée comptée. */
    fresh();
    const all = NL.content.allItems();
    all.forEach((it, i) => put(it, 5, i < 5 ? T0 - DAY : T0 + 30 * DAY));
    ok(S.begin('vandaag') && S.peek().ex === 'speak', 'the fixture is wrong: the session should hold only spoken exercises');
    const streak = NL.state.meta().streak;
    answer.cantSpeak();
    ok(!S.peek() && NL.ui.route === 'vandaag', 'with only spoken exercises left, « je ne peux pas parler » does not close the session');
    ok(B.app.innerHTML.indexOf('done-stage') < 0 && NL.state.meta().streak === streak, 'a session in which nothing was answered is summed up, or counted as a day');
    fresh(); NL.ui.go('sessie'); S.abandon();

    /* La séance sur les fautes est une liste fixe : le parlé en sort, rien n'y entre. */
    fresh();
    const [a, b, c] = words;
    put(a, 3, T0 + 5 * DAY); put(b, 3, T0 + 5 * DAY); put(c, 2, T0 + 5 * DAY);
    other.slice(0, 20).forEach(it => put(it, 2, T0 - DAY));
    [a, b, c].forEach(it => NL.state.logReview({ id: it.id, t: T0 - DAY, ok: false, stage: 1, kind: it.kind, ex: 'type' }));
    ok(S.begin('fouten'), 'the mistakes session did not start');
    const fixed = [];
    guard = 0;
    while (S.peek() && guard++ < 20) {
      if (S.peek().ex === 'speak') { answer.cantSpeak(); continue; }
      fixed.push(S.peek().items[0].id);
      answer.right(); answer.next(false);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(fixed.length === 1 && fixed[0] === c.id, 'after « je ne peux pas parler » the mistakes session served ' + JSON.stringify(fixed) + ' instead of its one item that is not spoken');
    console.log('  rien que du parlé : retour à l’accueil sans bilan ; séance sur les fautes : le parlé en sort, rien n’y entre');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nCE QUI RÉSISTE — un refus à voix haute n’est pas une faute de mémoire');
  {
    fresh();
    const [spoken, written] = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    for (let k = 0; k < 8; k++) NL.state.logReview({ id: spoken.id, t: T0 - k * MIN, ok: false, stage: 3, kind: spoken.kind, ex: 'speak' });
    NL.state.logReview({ id: spoken.id, t: T0 - 20 * MIN, ok: true, stage: 3, kind: spoken.kind, ex: 'speak' });
    NL.state.logReview({ id: written.id, t: T0 - MIN, ok: false, stage: 2, kind: written.kind, ex: 'type' });
    NL.state.logReview({ id: written.id, t: T0 - 2 * MIN, ok: false, stage: 2, kind: written.kind, ex: 'type' });
    NL.state.logReview({ id: written.id, t: T0 - 3 * MIN, ok: true, stage: 2, kind: written.kind, ex: 'speak' });
    const m = NL.srs.mistakes(T0);
    ok(!m.some(x => x.item.id === spoken.id), 'an item refused aloud eight times is listed among the mistakes');
    const w = m.find(x => x.item.id === written.id);
    ok(!!w && w.wrong === 2 && w.right === 0, 'an item missed twice in writing counts ' + (w ? w.wrong + ' wrong, ' + w.right + ' right' : 'nowhere') + ', not 2 wrong, 0 right');
    console.log('  ' + m.length + ' élément(s) qui résistent : le refusé à voix haute n’y est pas, l’autre : raté ' + (w ? w.wrong : '?') + ' fois sur ' + (w ? w.wrong + w.right : '?'));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nUN TRANSPARENT NE DESCEND JAMAIS SOUS L’ÉCHELON 1');
  {
    fresh();
    const cog = NL.content.allItems().filter(i => i.cognate);
    const noun = cog.find(i => i.art);
    NL.srs.grade(noun, false, { ex: 'article' });
    ok(NL.srs.stageOf(noun) === 1, 'a never-met cognate, first answer wrong, is on rung ' + NL.srs.stageOf(noun) + ' when it should be on rung 1');
    const seen = {};
    for (let k = 0; k < 40; k++) seen[NL.srs.exerciseFor(noun)] = 1;
    ok(!seen.pick && !seen.recall, 'after a wrong first answer a cognate is taught its meaning (' + Object.keys(seen).join(', ') + ')');
    /* Plus tard, à l’échelon 3, une faute le ramène à 1 et non à 0. */
    const later = cog.filter(i => i !== noun)[0];
    put(later, 3, T0 - MIN);
    const r = NL.state.rec(later.id); r.reps = 5; NL.state.setRec(r);
    NL.srs.grade(later, false, { ex: 'type' });
    ok(NL.srs.stageOf(later) === 1, 'a cognate on rung 3, wrong, lands on rung ' + NL.srs.stageOf(later));
    /* Un mot qui n’est pas transparent garde la règle d’avant : échelon 0 possible à la première réponse. */
    const plain = NL.content.allItems().find(i => i.kind === 'word' && !i.cognate);
    NL.srs.grade(plain, false, { ex: 'pick' });
    ok(NL.srs.stageOf(plain) === 0, 'a plain word wrong at its first answer is on rung ' + NL.srs.stageOf(plain) + ', not 0');
    console.log('  transparent raté dès la première réponse : échelon ' + NL.srs.stageOf(noun) + ', ensuite ' + Object.keys(seen).join(', '));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE BILAN APRÈS « JE NE PEUX PAS PARLER » — il dit ce qui est gardé');
  {
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    const run = n => {
      fresh();
      words.slice(0, n).forEach(it => put(it, 3, T0 - 2 * DAY));
      words.slice(n, n + 30).forEach(it => put(it, 2, T0 - DAY));
      S.begin('vandaag');
      let guard = 0;
      while (S.peek() && S.peek().ex !== 'speak' && guard++ < 60) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); }
      answer.cantSpeak();
      guard = 0;
      while (S.peek() && guard++ < 80) {
        const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      const html = B.app.innerHTML;
      S.abandon();
      return html;
    };
    const many = run(3), one = run(1);
    ok(many.includes(NL.t.doneSpokenKept(3)), 'after putting 3 spoken exercises off the summary does not say they were kept: « ' + (many.match(/done-sub">[^<]*/) || [''])[0] + ' »');
    ok(one.includes(NL.t.doneSpokenKept(1)), 'after putting 1 spoken exercise off the summary does not say so in the singular: « ' + (one.match(/done-sub">[^<]*/) || [''])[0] + ' »');
    ok(many.indexOf(NL.t.doneNoSpoken) < 0 && one.indexOf(NL.t.doneNoSpoken) < 0, 'the summary still says pronunciation exercises are yet to come');
    /* Mixte : un élément dit, puis le bouton sur le suivant. */
    {
      fresh();
      words.slice(0, 3).forEach(it => put(it, 3, T0 - 2 * DAY));
      words.slice(3, 33).forEach(it => put(it, 2, T0 - DAY));
      S.begin('vandaag');
      let guard = 0;
      const toSpeak = () => { while (S.peek() && S.peek().ex !== 'speak' && guard++ < 80) { const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m); } };
      toSpeak(); answer.right(); answer.next(false);
      toSpeak();
      ok(S.peek() && S.peek().ex === 'speak', 'the fixture is wrong: no second spoken exercise');
      answer.cantSpeak();
      while (S.peek() && guard++ < 160) {
        const m = S.peek().ex === 'match'; B.clock.advance(20000); answer.right(); answer.next(m);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      const mixed = (B.app.innerHTML.match(/done-sub">[^<]*/) || [''])[0];
      S.abandon();
      ok(mixed.includes(NL.t.doneSpoken(1)), 'the mixed summary does not say what was said: « ' + mixed + ' »');
      ok(Array.from({ length: 40 }, (_, i) => NL.t.doneSpokenKept(i + 1)).some(s => mixed.includes(s)), 'the mixed summary does not say what was kept: « ' + mixed + ' »');
      console.log('  dit puis mis de côté : « ' + mixed.slice(10) + ' »');
    }
    console.log('  3 mis de côté : « ' + (many.match(/done-sub">([^<]*)/) || ['', '?'])[1] + ' »');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLA SÉANCE SUR LES FAUTES — des révisions réelles, hors du budget du jour');
  {
    fresh();
    const [a, b] = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    [a, b].forEach(it => { put(it, 2, T0 + 5 * DAY); [1, 2].forEach(k => NL.state.logReview({ id: it.id, t: T0 - k * DAY, ok: false, stage: 1, kind: it.kind, ex: 'type' })); });
    const left = NL.srs.budgetLeft(), reps = [a, b].map(it => NL.state.rec(it.id).reps), logged = NL.state.logs().length;
    ok(S.begin('fouten'), 'the mistakes session did not start');
    let guard = 0, n = 0;
    while (S.peek() && guard++ < 20) { n++; B.clock.advance(20000); answer.right(); answer.next(false); if (B.app.innerHTML.indexOf('done-stage') >= 0) break; }
    S.abandon();
    ok(n === 2, 'the mistakes session served ' + n + ' exercises instead of 2');
    ok(NL.srs.budgetLeft() === left, 'a mistakes session spent ' + (left - NL.srs.budgetLeft()) + ' of the day budget');
    ok([a, b].every((it, i) => NL.state.rec(it.id).reps === reps[i] + 1), 'the answers of a mistakes session did not reach the records');
    ok(NL.state.logs().length === logged + 2, 'the answers of a mistakes session were not logged');
    console.log('  budget du jour ' + left + ' avant, ' + NL.srs.budgetLeft() + ' après ; ' + n + ' réponses notées et journalisées');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nDIT POUR LA PREMIÈRE FOIS DANS LA SÉANCE SUR LES FAUTES — l’écrit attend le lendemain');
  /* La séance sur les fautes est une liste fixe : elle n'ajoute pas de second
     exercice. Un élément qui y est dit pour la première fois garde son échelon,
     et c'est le lendemain qu'il est demandé par écrit. */
  {
    fresh();
    const it = NL.content.allItems().find(i => isWord(i) && !i.cognate);
    put(it, 3, T0 + 5 * DAY);
    [1, 2].forEach(k => NL.state.logReview({ id: it.id, t: T0 - k * DAY, ok: false, stage: 3, kind: it.kind, ex: 'type' }));
    ok(S.begin('fouten') && S.peek().ex === 'speak', 'the fixture is wrong: the mistakes session should open on a spoken exercise');
    const served = [];
    let guard = 0;
    while (S.peek() && guard++ < 20) {
      served.push(S.peek().ex);
      B.clock.advance(20000);
      answer.right();
      answer.next(false);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    const r = NL.state.rec(it.id);
    ok(served.join(', ') === 'speak', 'an item said for the first time in the mistakes session was asked: ' + served.join(', ') + ' when it should be said once and nothing more');
    ok(r.said === true && r.stage === 3, 'an item said for the first time in the mistakes session is said ' + r.said + ' and on rung ' + r.stage + ' when it should be said and on rung 3');
    B.clock.set(T0 + DAY + MIN);
    NL.state.touchDay();
    const due = NL.srs.compose('vandaag').due.some(x => x.id === it.id), next = NL.srs.exerciseFor(it);
    ok(due && next !== 'speak', 'the next day, an item said for the first time in the mistakes session is ' + (due ? 'asked ' + next : 'not due') + ' when it should be asked in writing');
    console.log('  dit dans la séance sur les fautes : ' + served.join(', ') + ', échelon ' + r.stage + ' ; le lendemain : ' + next);
  }

  /* ------------------------------------------------------------------ */
  console.log('\nPASSER SUR LES PAIRES — rien n’est noté, les éléments sont rencontrés plus loin');
  {
    fresh();
    const p = NL.srs.plan();
    ok(S.begin('vandaag') && S.peek().ex === 'match', 'the fixture is wrong: the session should open on the pairs board');
    const board = S.peek(), ids = board.items.map(it => it.id);
    B.clock.advance(20000);
    answer.wrong();
    ok(NL.state.logs().length === 0, 'skipping the pairs board logged ' + NL.state.logs().length + ' answer(s)');
    ok(!ids.some(id => NL.state.rec(id)), 'skipping the pairs board made ' + ids.filter(id => NL.state.rec(id)).length + ' of its ' + ids.length + ' items met');
    ok(NL.srs.budgetLeft() === NL.srs.pace().cap, 'skipping the pairs board spent ' + (NL.srs.pace().cap - NL.srs.budgetLeft()) + ' of the day budget');
    if (S.peek() === board) answer.next(false);
    const served = [];
    let guard = 0;
    while (S.peek() && guard++ < 120) {
      const c = S.peek(), m = c.ex === 'match';
      served.push({ id: c.items[0].id, ex: c.ex, unmet: !m && !met(c.items[0]), second: !!c.second });
      B.clock.advance(20000); answer.right(); answer.next(m);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    ok(ids.every(id => served.some(x => x.id === id && x.unmet)), 'of the ' + ids.length + ' items of the skipped board, ' + ids.filter(id => served.some(x => x.id === id && x.unmet)).length + ' were met in their own first exercise');
    const tasks = served.filter(x => x.ex !== 'match').length, news = served.filter(x => x.unmet).length;
    ok(news === p.fresh && tasks === p.tasks, 'home announced ' + p.fresh + ' new / ' + p.tasks + ' exercises, the session after the skip held ' + news + ' / ' + tasks);
    console.log('  paires passées : rien noté, ' + ids.length + ' éléments rencontrés ensuite ; annoncé ' + p.tasks + ' exercices, servi ' + tasks);
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE DÉFI — un élément jamais dit s’arrête à l’échelon 3');
  {
    fresh();
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate).slice(0, 24);
    const never = words.slice(0, 12), said = words.slice(12);
    words.forEach(it => put(it, 3, T0 + 5 * DAY));
    said.forEach(it => { const r = NL.state.rec(it.id); r.said = true; NL.state.setRec(r); });
    ok(S.begin('defi'), 'the challenge did not start');
    const seen = new Set();
    let guard = 0;
    while (S.peek() && guard++ < 40) {
      const c = S.peek(); seen.add(c.items[0].id);
      B.clock.advance(20000); answer.right(); answer.next(false);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    const nv = never.filter(it => seen.has(it.id)), sd = said.filter(it => seen.has(it.id));
    ok(nv.length > 0 && sd.length > 0, 'the fixture is wrong: the challenge served ' + nv.length + ' never-said and ' + sd.length + ' said items');
    const up = nv.filter(it => NL.srs.stageOf(it) !== 3);
    ok(up.length === 0, up.length + ' of ' + nv.length + ' never-said items left rung 3 in the challenge');
    const stuck = sd.filter(it => NL.srs.stageOf(it) !== 4);
    ok(stuck.length === 0, stuck.length + ' of ' + sd.length + ' said items did not climb to rung 4 in the challenge');
    console.log('  défi : ' + nv.length + ' jamais dits restent à l’échelon 3, ' + sd.length + ' déjà dits montent à 4');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nLE DÉFI — jamais dit, un élément s’arrête à son premier échelon parlé, et pas avant');
  /* Une règle de grammaire ne se dit qu'à l'échelon 4 : le défi la mène de 3 à 4,
     et l'y arrête tant qu'elle n'a pas été dite. */
  {
    fresh();
    const pats = NL.content.allItems().filter(i => i.kind === 'pattern');
    const ws = NL.content.allItems().filter(i => isWord(i) && !i.cognate).slice(0, 8);
    const p3 = pats.slice(0, 4), p4 = pats.slice(4, 7), pSaid = pats.slice(7, 9);
    const w3 = ws.slice(0, 4), wSaid = ws.slice(4, 8);
    ok(pats.length >= 9, 'the fixture is wrong: only ' + pats.length + ' patterns');
    p3.concat(w3, wSaid).forEach(it => put(it, 3, T0 + 5 * DAY));
    p4.concat(pSaid).forEach(it => put(it, 4, T0 + 5 * DAY));
    pSaid.concat(wSaid).forEach(it => { const r = NL.state.rec(it.id); r.said = true; NL.state.setRec(r); });
    ok(S.begin('defi'), 'the challenge did not start');
    const seen = new Set();
    let guard = 0;
    while (S.peek() && guard++ < 40) {
      seen.add(S.peek().items[0].id);
      B.clock.advance(20000); answer.right(); answer.next(false);
      if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
    }
    S.abandon();
    const all = p3.concat(p4, pSaid, w3, wSaid);
    ok(all.every(it => seen.has(it.id)), 'the fixture is wrong: the challenge served ' + all.filter(it => seen.has(it.id)).length + ' of its ' + all.length + ' items');
    const rungs = list => list.map(it => NL.srs.stageOf(it)).join(',');
    ok(p3.every(it => NL.srs.stageOf(it) === 4), 'never-said patterns on rung 3, right in the challenge, are on rungs ' + rungs(p3) + ', not 4');
    ok(p4.every(it => NL.srs.stageOf(it) === 4), 'never-said patterns on rung 4, right in the challenge, are on rungs ' + rungs(p4) + ', not 4');
    ok(pSaid.every(it => NL.srs.stageOf(it) === 5), 'said patterns on rung 4, right in the challenge, are on rungs ' + rungs(pSaid) + ', not 5');
    ok(w3.every(it => NL.srs.stageOf(it) === 3), 'never-said words on rung 3, right in the challenge, are on rungs ' + rungs(w3) + ', not 3');
    ok(wSaid.every(it => NL.srs.stageOf(it) === 4), 'said words on rung 3, right in the challenge, are on rungs ' + rungs(wSaid) + ', not 4');
    console.log('  défi : règles jamais dites ' + rungs(p3) + ' (depuis 3) et ' + rungs(p4) + ' (depuis 4), dites ' + rungs(pSaid) + ' ; mots jamais dits ' + rungs(w3) + ', dits ' + rungs(wSaid));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nUN SECOND EXERCICE SE TIENT À TROIS EXERCICES DU PRÉCÉDENT, OU N’EST PAS SERVI');
  /* Le renforcement d'une rencontre, et l'écrit qui suit une première réponse à
     voix haute : servis aussitôt, ils ne prouvent rien. Là où trois exercices ne
     peuvent pas les séparer du précédent de leur élément, ils attendent le
     lendemain, et l'annonce ne les compte pas. */
  {
    const words = NL.content.allItems().filter(i => isWord(i) && !i.cognate);
    const size = () => { const m = S.render().match(/class="pill">\d+\/(\d+)</); return m ? +m[1] : 0; };
    /* Ce qui sépare chaque second exercice de l'exercice précédent de son élément. */
    const gaps = served => served.map((x, i) => {
      if (!x.second) return null;
      let j = i - 1;
      while (j >= 0 && (served[j].id !== x.id || served[j].ex === 'match')) j--;
      return i - j - 1;
    }).filter(g => g !== null);
    const shape = served => served.map(x => x.ex === 'match' ? 'B' : x.second ? '2' : x.retry ? 'x' : x.unmet ? 'M' : x.ex === 'speak' ? 'S' : 'R').join('');
    const held = served => served.filter(x => x.ex !== 'match').length;
    /* Tout est rencontré et loin, sauf `unmet` ; `say` éléments jamais dits à
       l'échelon 3 et `plain` ordinaires à l'échelon 2 sont dus. */
    const only = (unmet, say, plain) => {
      fresh();
      const keep = new Set(unmet.map(i => i.id));
      NL.content.allItems().forEach(it => { if (!keep.has(it.id)) put(it, 2, T0 + 30 * DAY); });
      say.forEach(it => put(it, 3, T0 - 2 * DAY));
      plain.forEach(it => put(it, 2, T0 - DAY));
    };

    /* Le budget presque épuisé, de 1 à 30 exercices, sur le banc de « Dit pour la
       première fois » : rien n'est servi trop près, rien n'est annoncé de trop. */
    const close = [], differ = [], over = [];
    for (let left = 1; left <= 30; left++) {
      fresh();
      words.slice(0, 6).forEach(it => put(it, 3, T0 - 2 * DAY));
      words.slice(6, 36).forEach(it => put(it, 2, T0 - DAY));
      NL.srs.spend(NL.srs.pace().cap - left);
      const p = NL.srs.plan();
      ok(S.begin('vandaag'), left + ' exercises left: the session did not start');
      const at = size() - (S.peek() && S.peek().ex === 'match' ? 1 : 0);
      S.abandon();
      const s = play();
      if (gaps(s).some(g => g < 3)) close.push(left + ' : ' + shape(s));
      if (held(s) !== p.tasks || at !== p.tasks) differ.push(left + ' : ' + p.tasks + ' annoncés, ' + at + ' tenus, ' + held(s) + ' servis');
      if (held(s) > left) over.push(left + ' : ' + held(s));
    }
    ok(close.length === 0, 'a second exercise came back fewer than 3 exercises after its item, with this budget left: ' + close.join(' ; '));
    ok(differ.length === 0, 'home announced another session than the one held and served: ' + differ.join(' ; '));
    ok(over.length === 0, 'a session served more exercises than the day had left: ' + over.join(' ; '));

    /* Une séance de une à trois rencontres, sans rien d'autre : aucun
       renforcement ne peut se tenir à trois exercices ; chacun attend demain. A
       quatre, tous se tiennent. */
    const lone = [];
    [1, 2, 3, 4].forEach(n => {
      const unmet = words.slice(0, n);
      only(unmet, [], []);
      const p = NL.srs.plan(), s = play();
      const seconds = s.filter(x => x.second).length;
      lone.push(n + ' : ' + shape(s));
      ok(seconds === (n < 4 ? 0 : n), n + ' new item(s) alone: ' + seconds + ' second exercise(s) served (' + shape(s) + ')');
      ok(gaps(s).every(g => g >= 3), n + ' new item(s) alone: a second exercise came back ' + Math.min.apply(null, gaps(s)) + ' exercise(s) later');
      ok(p.fresh === n && held(s) === p.tasks, n + ' new item(s) alone: home announced ' + p.fresh + ' new / ' + p.tasks + ' exercises, the session served ' + held(s));
      if (n < 4) {
        const recs = unmet.map(it => NL.state.rec(it.id));
        ok(recs.every(r => r && r.stage === 1 && tomorrow(r)), n + ' new item(s) met without their second exercise should be on rung 1, due tomorrow: ' + JSON.stringify(recs.map(r => r && [r.stage, dayOf(r.last), dayOf(r.due)])));
      }
    });

    /* Sept exercices de budget, trente révisions dues et du neuf à rencontrer :
       la réserve donne les trois rencontres, et les révisions reprennent ce que le
       rabotage a pris tant que la séance servie tient dans le budget. Ici une
       révision et les trois seconds : sept exercices, pas trois. */
    {
      fresh();
      words.slice(0, 30).forEach(it => put(it, 2, T0 - DAY));
      NL.srs.spend(NL.srs.pace().cap - 7);
      const p = NL.srs.plan(), c = NL.srs.compose('vandaag'), s = play(), unmet = s.filter(x => x.unmet).map(x => x.item);
      const seconds = s.filter(x => x.second).length, reviews = s.filter(x => !x.unmet && !x.second && !x.retry && x.ex !== 'match').length;
      ok(held(s) === 7, 'seven exercises left, reviews due, three new items: the session served ' + held(s) + ' exercises (' + shape(s) + '), not 7');
      ok(reviews === 1 && c.due.length === 1, 'seven exercises left: ' + reviews + ' review(s) served and ' + c.due.length + ' composed, not 1 (' + shape(s) + ')');
      ok(seconds === 3 && unmet.every(it => s.some(x => x.second && x.id === it.id)), 'seven exercises left: ' + seconds + ' second exercise(s) served for ' + unmet.length + ' meeting(s), every meeting should get its own (' + shape(s) + ')');
      ok(held(s) <= 7 && p.tasks === held(s), 'seven exercises left: home announced ' + p.tasks + ' exercises, the session served ' + held(s));
      console.log('  sept exercices de budget, des révisions dues : ' + shape(s));
    }

    /* Rien de neuf, quelques éléments à dire pour la première fois et moins de
       trois révisions ordinaires : l'écrit ne peut pas venir trois exercices
       après, il vient demain. Avec quatre exercices au moins, il vient. */
    const aloud = [];
    [[1, 0], [1, 2], [2, 1], [3, 0], [1, 3], [3, 1]].forEach(([k, n]) => {
      const say = words.slice(0, k);
      only([], say, words.slice(k, k + n));
      const p = NL.srs.plan(), s = play();
      const fits = k + n > 3, seconds = s.filter(x => x.second).length;
      aloud.push(k + '+' + n + ' : ' + shape(s));
      ok(seconds === (fits ? k : 0), k + ' to say + ' + n + ' plain: ' + seconds + ' second exercise(s) served (' + shape(s) + ')');
      ok(gaps(s).every(g => g >= 3), k + ' to say + ' + n + ' plain: an item was written ' + Math.min.apply(null, gaps(s)) + ' exercise(s) after it was said');
      ok(held(s) === p.tasks, k + ' to say + ' + n + ' plain: home announced ' + p.tasks + ' exercises, the session served ' + held(s));
      if (!fits) {
        const recs = say.map(it => NL.state.rec(it.id));
        ok(recs.every(r => r.said && r.stage === 3 && tomorrow(r)), k + ' to say + ' + n + ' plain: said without its written exercise, an item should be said, on rung 3, due tomorrow: ' + JSON.stringify(recs.map(r => [r.said, r.stage])));
        B.clock.advance(DAY);
        NL.state.touchDay();
        ok(say.every(it => NL.srs.exerciseFor(it) !== 'speak'), k + ' to say + ' + n + ' plain: the day after, an item said is asked aloud again');
      }
    });

    /* Un renforcement ne passe pas devant un autre second exercice qui serait
       alors à deux exercices du sien. Quatre mots sans article : leur
       renforcement est forcément une dictée, et le dernier, pour ne pas suivre
       une dictée, cherchait plus loin l'écrit d'un élément dit trois places avant. */
    const plainWords = words.filter(i => i.kind === 'word' && !i.art);
    only(plainWords.slice(0, 4), plainWords.slice(4, 5), []);
    const p = NL.srs.plan(), swapped = play();
    ok(gaps(swapped).every(g => g >= 3), 'a second exercise moved up to ' + Math.min.apply(null, gaps(swapped)) + ' exercise(s) after its item (' + shape(swapped) + ')');
    ok(held(swapped) === p.tasks, 'home announced ' + p.tasks + ' exercises, the session served ' + held(swapped));

    /* « Je ne peux pas parler » resserre la séance : l'écrit d'un élément déjà dit
       se tient encore à trois exercices, en attendant derrière ce qui suit, ou il
       n'est pas servi. Dire le premier, mettre de côté le suivant, tout le reste juste. */
    const tapSecond = () => {
      const s = [];
      let spoken = 0, tapped = false, after = 0, guard = 0;
      if (!S.begin('vandaag')) return { s, after, done: false };
      while (S.peek() && guard++ < 120) {
        const c = S.peek(), m = c.ex === 'match';
        if (c.ex === 'speak' && !tapped && spoken === 1) { answer.cantSpeak(); tapped = true; after = size() || s.length; continue; }
        if (c.ex === 'speak') spoken++;
        s.push({ ex: c.ex, id: c.items[0].id, unmet: !m && !met(c.items[0]), second: !!c.second, retry: !!c.retry });
        B.clock.advance(20000); answer.right(); answer.next(m);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      const done = B.app.innerHTML.indexOf('done-stage') >= 0;
      S.abandon();
      return { s, after, done };
    };
    /* Rien de neuf, quatre éléments à dire et rien d'autre : l'écrit du premier
       n'a plus rien pour le séparer de lui, il attend demain. */
    const four = words.slice(0, 4);
    only([], four, []);
    const q1 = tapSecond(), first = four.find(it => q1.s.some(x => x.id === it.id && !x.second));
    ok(gaps(q1.s).every(g => g >= 3), 'after « je ne peux pas parler » an item was written ' + Math.min.apply(null, gaps(q1.s)) + ' exercise(s) after it was said (' + shape(q1.s) + ')');
    ok(q1.done && q1.s.length === 1, 'after « je ne peux pas parler » with nothing else to do the session should end after the one exercise said: ended ' + q1.done + ', ' + q1.s.length + ' exercise(s) served (' + shape(q1.s) + ')');
    const r1 = first && NL.state.rec(first.id);
    ok(r1 && r1.said && r1.stage === 3 && tomorrow(r1), 'said before « je ne peux pas parler » and not written, an item should be said, on rung 3, due tomorrow: ' + JSON.stringify(r1 && [r1.said, r1.stage]));
    /* Du neuf et trois éléments à dire : l'écrit du premier attend derrière les
       renforcements qui le suivaient, et vient trois exercices après lui. */
    fresh();
    words.slice(0, 3).forEach(it => put(it, 3, T0 - 2 * DAY));
    const q2 = tapSecond(), said2 = words.slice(0, 3).find(it => q2.s.some(x => x.id === it.id && !x.second && x.ex === 'speak'));
    const written = said2 && q2.s.filter(x => x.id === said2.id && x.second);
    ok(gaps(q2.s).every(g => g >= 3), 'after « je ne peux pas parler » a second exercise came back ' + Math.min.apply(null, gaps(q2.s)) + ' exercise(s) after its item (' + shape(q2.s) + ')');
    ok(!!written && written.length === 1 && written[0].ex !== 'speak', 'an item said before « je ne peux pas parler » was not written later in the session (' + shape(q2.s) + ')');
    ok(q2.after === q2.s.length, 'after « je ne peux pas parler » the session said ' + q2.after + ' exercises and served ' + q2.s.length);
    console.log('  budget de 1 à 30 : rien de trop près, annoncé = tenu = servi ; seuls : ' + lone.join(', ') + ' ; à dire + ordinaires : ' + aloud.join(', '));
    console.log('  sans échange : ' + shape(swapped) + ' ; je ne peux pas parler : ' + shape(q1.s) + ', puis ' + shape(q2.s));
  }

  /* ------------------------------------------------------------------ */
  console.log('\nUN MOT LISTÉ DANS DEUX UNITÉS — servi une fois');
  /* « meenemen » est listé dans l'unité 4 (bakker:w22), puis dans l'unité 9 (dedag:w4). Le
     second listage est un alias : son id trouve le mot. Un compte qui a appris le mot sous
     les deux ids, avant les alias, les a dus tous les deux ; la séance sert le mot une fois. */
  {
    fresh();
    ['bakker:w22', 'dedag:w4'].forEach(id => put({ id, kind: 'word' }, 3, T0 - DAY));
    const word = NL.content.byId('bakker:w22');
    ok(!!word && word.nl === 'meenemen', 'the fixture is wrong: bakker:w22 is ' + (word && word.nl) + ', not meenemen');
    ok(NL.content.byId('dedag:w4') === word, 'the id dedag:w4 reads as ' + (NL.content.byId('dedag:w4') || {}).id + ', not as the word it lists again, bakker:w22');
    const c = NL.srs.compose('vandaag');
    const served = c.due.concat(c.fresh).filter(it => it.nl === 'meenemen').map(it => it.id);
    ok(served.join() === 'bakker:w22', 'a word due under its two listings is in the session as ' + (served.join(', ') || 'nothing') + ', not once as bakker:w22');
    console.log('  « meenemen », dû sous bakker:w22 et dedag:w4 : dans la séance ' + served.length + ' fois');
  }

  /* ------------------------------------------------------------------ */
  console.log('\nUN MOT LISTÉ DANS DEUX UNITÉS — sa progression passe au premier listage, une fois');
  /* Avant les alias, « meenemen » s'apprenait sous bakker:w22 et sous dedag:w4. NL.srs.fold()
     donne au mot la fiche la plus avancée des deux, entière, et le mot est dit si l'une des
     deux l'a été. Le repli date de la plus récente des fiches qu'il replie, pas de l'instant
     du repli : une écriture plus récente, faite ailleurs, passe encore devant. Il ne replie
     qu'une fois : un raté d'après tient, même quand un tirage ramène la fiche de l'alias. */
  {
    const fold = () => typeof NL.srs.fold === 'function' ? NL.srs.fold() : 'no NL.srs.fold';
    fresh();
    const word = NL.content.byId('bakker:w22');
    put({ id: 'dedag:w4', kind: 'word' }, 4, T0 + 3 * DAY);
    const ahead = NL.state.rec('dedag:w4'); ahead.said = true; NL.state.setRec(ahead);
    const was = Object.assign({}, ahead);
    /* La fiche du mot, en retard, est la plus récente des deux : ni celle qui gagne, ni l'instant
       du repli. */
    B.clock.advance(MIN);
    put(word, 1, T0 + DAY);
    const newest = NL.state.rec('bakker:w22').updatedAt;
    B.clock.advance(HOUR);
    const n = fold();
    const r = Object.assign({}, NL.state.rec('bakker:w22'));
    ok(n === 1, 'fold() with one alias record ahead folded ' + n + ' item(s), not 1');
    ok(r.stage === 4 && r.due === was.due && r.interval === was.interval && r.reps === was.reps,
      'after fold() bakker:w22 is at rung ' + r.stage + ', due ' + new Date(r.due).toISOString() + ': not the alias record whole, rung 4, due ' + new Date(was.due).toISOString());
    ok(r.said === true && r.folded === true, 'after fold() bakker:w22 has said ' + r.said + ' and folded ' + r.folded + ', not both true');
    ok(r.folded === true && r.base === NL.state.meta().resetAt && r.updatedAt === newest,
      'fold() wrote bakker:w22 folded ' + r.folded + ', with base ' + r.base + ' and updatedAt ' + r.updatedAt + ': not folded with base = resetAt ' + NL.state.meta().resetAt + ' and updatedAt = the newest write of its group ' + newest + ' (the alias record’s is ' + was.updatedAt + ', now is ' + B.clock.now() + ')');
    NL.srs.grade(word, false, { ex: 'type' });
    const lapsed = NL.state.rec('bakker:w22').stage;
    /* Un tirage ramène la fiche de l'alias, telle que l'ancienne version l'a écrite. */
    B.clock.advance(MIN);
    NL.state.setRec(Object.assign({}, was, { updatedAt: B.clock.now() }), true);
    const again = fold();
    const r2 = NL.state.rec('bakker:w22');
    ok(again === 0 && r2.stage === lapsed, 'a second fold() folded ' + again + ' item(s) and moved bakker:w22 from rung ' + lapsed + ' to ' + r2.stage + ': the miss after the first fold did not hold');

    /* À égalité, la fiche du mot reste la sienne ; dit sous l'alias, il est dit. */
    fresh();
    put(word, 3, T0 + DAY);
    put({ id: 'dedag:w4', kind: 'word' }, 3, T0 + DAY);
    const level = NL.state.rec('dedag:w4'); level.ease = 1.3; level.said = true; NL.state.setRec(level);
    fold();
    const r3 = NL.state.rec('bakker:w22');
    ok(r3.ease === 2.5 && r3.said === true && r3.folded === true,
      'two records level at rung 3 folded to ease ' + r3.ease + ', said ' + r3.said + ', folded ' + r3.folded + ': not the word’s own record, said under its alias');
    /* Au même échelon, l'intervalle départage avant la dernière réponse : la fiche de l'alias,
       à l'intervalle plus long, passe devant celle du mot, plus récemment répondue. */
    fresh();
    put(word, 3, T0 + DAY);
    put({ id: 'dedag:w4', kind: 'word' }, 3, T0 + DAY);
    B.clock.advance(HOUR);
    const longer = NL.state.rec('dedag:w4'); longer.interval = 2 * DAY; longer.due = T0 + 2 * DAY; longer.last = B.clock.now() - DAY; NL.state.setRec(longer);
    const recent = NL.state.rec('bakker:w22'); recent.interval = DAY; recent.last = B.clock.now(); NL.state.setRec(recent);
    fold();
    const r4 = NL.state.rec('bakker:w22');
    ok(r4.interval === 2 * DAY && r4.due === T0 + 2 * DAY && r4.folded === true,
      'two records level at rung 3, the alias record with the longer interval, folded to interval ' + r4.interval + ' and due ' + new Date(r4.due).toISOString() + ': not the alias record’s, interval ' + 2 * DAY + ' and due ' + new Date(T0 + 2 * DAY).toISOString());
    /* Sans fiche d'alias, rien à replier : le mot n'est pas marqué. */
    fresh();
    put(word, 2, T0 + DAY);
    const none = fold();
    ok(none === 0 && !NL.state.rec('bakker:w22').folded, 'fold() with no alias record folded ' + none + ' item(s) and marked bakker:w22 ' + NL.state.rec('bakker:w22').folded);
    console.log('  « meenemen » : échelon 1, alias à l’échelon 4 → ' + r.stage + ' ; un raté → ' + lapsed + ' ; second repli → ' + r2.stage + ' ; à égalité, facilité ' + r3.ease);
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'ENGINE OK'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
