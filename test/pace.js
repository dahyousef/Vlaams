/* 400 jours d'utilisation quotidienne contre le VRAI moteur.
   C'est la suite qui aurait attrapé chacun des défauts trouvés jusqu'ici :
   la dette de révisions, l'oscillation sous plafond, la monotonie des types,
   et le contenu épuisé au jour 27. */
const browser = require('./lib/browser');
const ROOT = process.argv[2];
const DAYS = Number(process.argv[3] || 400);
const T0 = Date.parse('2026-01-05T08:00:00Z');
/* Chaque apprenant tourne dans son propre processus (test/run-all.sh) : les
   mots qui suivent le nombre de jours disent lequel. */
const MODE = process.argv.slice(4);
/* Le quatrième compte son lendemain à l'heure de Bruxelles (#28). Le fuseau
   vaut pour tout le processus : contrairement au bloc de test/engine.js, rien
   ne tourne après lui qui devrait retrouver le sien. */
const DRIFT = MODE.indexOf('drift') >= 0;
if (DRIFT) process.env.TZ = 'Europe/Brussels';

let fails = 0, checks = 0, unjudged = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('   ✗ ' + m); fails++; } };
/* Ce qui ne se voit qu'avec le temps — un lendemain, une première demande à voix haute,
   une séance sans parler qui croise un exercice à voix haute, une fréquence, un étalement —
   n'est pas jugé sous HORIZON jours : sur un seul jour, ces contrôles échouent sans rien
   dire du moteur. */
const HORIZON = 30;
const okLong = (c, m) => {
  if (DAYS >= HORIZON) { ok(c, m); return; }
  unjudged++;
  if (!c) console.log('   · non jugé, il faut au moins ' + HORIZON + ' jours : ' + m);
};
const P = (l, v) => console.log('  ' + String(l).padEnd(38) + v);
const B = browser.open({
  root: ROOT, seed: browser.SEED, now: T0, ua: 'Chrome/120 OPR/106', blobs: true, byId: 'stub',
  voices: [{ name: 'Bart', lang: 'nl-BE' }]
});
const NL = B.NL, U = NL.util, RAND = B.random;
const answer = require('./lib/answer')(B);
const MIN = 60000, DAY = 86400000;
/* Un deuxième apprenant, moins assidu : une seule séance par jour. */
const ONE_A_DAY = MODE.indexOf('one') >= 0;
/* Un troisième : une séance sur cinq se passe là où l'on ne peut pas parler. */
const QUIET = MODE.indexOf('quiet') >= 0;
/* Un quatrième, une seule séance aussi, commence sa journée à 21 h, puis vingt
   minutes plus tôt chaque jour jusqu'à 7 h, et remonte : douze semaines par
   aller-retour. Les autres commencent chaque jour au même instant. */
const startMin = day => { const k = (day - 1) % 84; return k <= 42 ? 21 * 60 - 20 * k : 7 * 60 + 20 * (k - 42); };
const startOf = day => DRIFT ? new Date(2026, 0, 5 + day - 1, 0, startMin(day)).getTime() : T0 + (day - 1) * DAY;

/* Combien de secondes coûte chaque type — pour traduire la charge en minutes. */
const SECS = { match: 22, pick: 7, recall: 7, intrus: 9, article: 6, vlaams: 9,
  cloze: 12, bank: 16, order: 16, corrige: 14, dictation: 20, type: 20, speak: 26, open: 55 };

NL.state.open().then(() => {
  NL.content.refresh();
  const S = NL.screens.sessie;
  const total = NL.content.allItems().length;
  NL.ui.go('sessie');

  const perDay = [], mix = {}, seenOnDay = {}, dry = [], aloud = {}, passedOn = {};
  /* Passé l'échelon 3, un élément compte parmi ceux que l'on sait produire. */
  const PAST = 4;
  let backToBack = 0, prevEx = null, exhausted = null, maxBacklog = 0, tasks = 0, lateRecog = 0;
  const owed = {};
  let sessions = 0, taps = 0, touched = 0, spokeAfter = 0, detour = 0, putOff = 0, early = 0;
  /* Ce que la veille a laissé à un jour, et ce qui en revient le lendemain. */
  let oneDay = [], leftOneDay = 0, nextDay = 0, leftEarlier = 0, nextEarlier = 0;

  for (let day = 1; day <= DAYS; day++) {
    B.clock.set(startOf(day));
    NL.state.touchDay();
    maxBacklog = Math.max(maxBacklog, NL.srs.dueItems().length);
    const unmetAtDawn = total - NL.srs.counts().seen;
    const asked = new Set();

    let dayTasks = 0, daySecs = 0, dayNew = 0, guard = 0;
    /* Autant de séances que le budget du jour l'autorise — ou une seule. */
    while (NL.srs.budgetLeft() > 0 && guard++ < (ONE_A_DAY ? 1 : 12)) {
      /* Ce que la séance contient, demandé à compose() avant qu'elle commence :
         c'est parmi ces éléments qu'un « je ne peux pas parler » met de côté,
         ceux qui ne pouvaient déjà qu'être dits. Un élément qui monte à
         l'échelon 3 pendant la séance n'avait aucun exercice parlé à perdre. */
      const planned = NL.srs.compose('vandaag');
      const voiceAtStart = planned.due.concat(planned.fresh).filter(NL.srs.needsVoice);
      if (!S.begin('vandaag')) break;
      let n = 0;
      const cantTalk = QUIET && ++sessions % 5 === 0;
      let tapped = false;
      /* Ce que la séance a déjà servi avant le geste : le geste ne leur retire rien. */
      const answeredHere = new Set();
      while (S.peek() && n++ < 80) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        /* Là où l'on ne peut pas parler : « je ne peux pas parler » au premier
           exercice à voix haute, et la séance continue sans. Ce seul geste met
           de côté tous les exercices parlés qui restaient, pas seulement celui
           qui est à l'écran : chaque élément de la séance qui ne peut être que
           dit doit revenir à voix haute, et le geste ne doit rien toucher, ni
           un enregistrement, ni le journal, ni le budget du jour. */
        if (c.ex === 'speak' && tapped) spokeAfter++;
        if (c.ex === 'speak' && cantTalk && !tapped) {
          voiceAtStart.forEach(it => { if (!owed[it.id]) { owed[it.id] = true; putOff++; if (answeredHere.has(it.id)) early++; } });
          const before = JSON.stringify(NL.state.allRecs()), logged = NL.state.logs().length, left = NL.srs.budgetLeft();
          answer.cantSpeak();
          tapped = true; taps++;
          if (JSON.stringify(NL.state.allRecs()) !== before || NL.state.logs().length !== logged || NL.srs.budgetLeft() !== left) touched++;
          continue;
        }
        /* Ce qui a été mis de côté revient à voix haute, pas autrement. */
        if (!wasMatch && owed[c.items[0].id]) { if (c.ex !== 'speak') detour++; delete owed[c.items[0].id]; }
        if (!wasMatch) { answeredHere.add(c.items[0].id); asked.add(c.items[0].id); }
        tasks++; dayTasks++;
        daySecs += SECS[c.ex] || 15;
        mix[c.ex] = (mix[c.ex] || 0) + 1;
        const wasAt = NL.srs.stageOf(c.items[0]);
        if (!wasMatch && wasAt < 0) dayNew++;
        if (wasAt >= 1 && (c.ex === 'pick' || c.ex === 'recall' || c.ex === 'match')) lateRecog++;
        if (c.ex === prevEx && c.ex !== 'match' && !c.retry) backToBack++;
        prevEx = c.ex;
        /* Le jour où chaque élément est demandé à voix haute pour la première fois. */
        if (c.ex === 'speak' && !aloud[c.items[0].id]) aloud[c.items[0].id] = day;
        c.items.forEach(it => {
          seenOnDay[it.id] = seenOnDay[it.id] || new Set();
          seenOnDay[it.id].add(day);
        });
        /* L'horloge avance PENDANT la journée, du temps que coûte chaque
           exercice. Figée à huit heures, un retour prévu dans douze minutes
           n'arrivait jamais : deux cents jours simulés avaient l'air sains
           pendant que le deuxième jour réel ne servait rien de neuf. */
        B.clock.advance((SECS[c.ex] || 15) * 1000);
        /* Et la réponse passe par l'écran, pas par le planificateur : c'est la
           séance qui porte les reprises et le renforcement des rencontres. */
        if (wasMatch || RAND() < 0.85) answer.right(); else answer.wrong();
        /* L'exercice sur lequel chaque élément passe l'échelon de l'écrit. */
        if (!wasMatch && wasAt < PAST && NL.srs.stageOf(c.items[0]) >= PAST && !passedOn[c.items[0].id]) passedOn[c.items[0].id] = c.ex;
        answer.next(wasMatch);
        if (B.app.innerHTML.indexOf('done-stage') >= 0) break;
      }
      S.abandon();
      B.clock.advance(10 * MIN);          // une pause entre deux séances
    }
    if (unmetAtDawn > 0 && dayNew === 0) dry.push(day);
    /* Un élément répondu aujourd'hui et laissé à un jour doit pouvoir revenir
       demain, à quelque heure que l'on étudie (#28). */
    leftOneDay += oneDay.length;
    nextDay += oneDay.filter(id => asked.has(id)).length;
    /* Le jour qui commence plus tôt que la veille est celui que la règle d'avant
       #28 privait de tout : rien de la veille n'était encore dû quand la séance
       se composait. */
    if (DRIFT && day > 1 && startMin(day) < startMin(day - 1)) {
      leftEarlier += oneDay.length;
      nextEarlier += oneDay.filter(id => asked.has(id)).length;
    }
    const today = U.dayKey(startOf(day));
    oneDay = NL.state.allRecs().filter(r => r.interval === DAY && U.dayKey(r.last) === today).map(r => r.id);
    const spent = NL.state.meta().exToday || 0;
    const met = NL.srs.counts().seen;
    if (!exhausted && met >= total) exhausted = day;
    perDay.push({ day, tasks: dayTasks, spent, mins: Math.round(daySecs / 60), met,
      produce: NL.content.courseProgress().produce });
  }

  const cap = NL.srs.pace().cap;
  /* Une séance commencée avec du budget se termine : ses reprises (six au plus)
     et son échauffement par paires peuvent déborder le plafond, jamais plus. */
  const over = perDay.filter(d => d.spent > cap + 7);
  const peak = Math.max(...perDay.map(d => d.mins));
  const busiest = Math.max(...perDay.map(d => d.spent));

  console.log('\nCHARGE SUR ' + DAYS + ' JOURS   (rythme ' + (NL.state.meta().pace || 'normal') +
    ', plafond ' + cap + ' exercices)');
  console.log('='.repeat(70));
  console.log('  jour   exercices   minutes   rencontrés   produits');
  [1, 7, 30, 90, 180, 300, DAYS].filter(d => d <= DAYS).forEach(d => {
    const r = perDay[d - 1];
    console.log('  ' + String(r.day).padStart(4) + String(r.tasks).padStart(12) +
      String(r.mins).padStart(10) + String(r.met).padStart(13) + String(r.produce).padStart(11));
  });

  console.log('\nCE QUE LA SIMULATION VÉRIFIE');
  console.log('='.repeat(70));
  /* Le défaut que tout ce travail répare : une journée sans rien de neuf alors
     qu'il reste du cours à rencontrer. */
  ok(dry.length === 0, dry.length + ' jour(s) sans aucun élément nouveau alors qu’il en restait à rencontrer — le premier : jour ' + dry[0]);
  P('jours sans rien de neuf', dry.length === 0 ? 'aucun' : dry.length + ' (jours ' + dry.slice(0, 8).join(', ') + '…)');
  /* Un élément rencontré aujourd'hui revient demain. Quand chaque retour tombait
     vingt-quatre heures pile après la réponse, celui qui étudie à la même heure
     chaque jour n'en revoyait aucun le lendemain : rien n'était encore dû quand
     sa séance se composait. Cette suite ne voit pas l'oubli : elle compte. */
  okLong(nextDay > 0, 'aucun des ' + leftOneDay + ' éléments laissés à un jour n’est revenu le lendemain');
  P('revenus le lendemain', nextDay + ' sur ' + leftOneDay + ' laissés à un jour');
  /* L'apprenant qui dérive : son lendemain se compte à l'heure locale, et les
     jours où il commence plus tôt que la veille sont ceux qu'aucun autre ne
     voit. */
  if (DRIFT) {
    const offsets = [Date.UTC(2026, 0, 15), Date.UTC(2026, 6, 15)].map(t => new Date(t).getTimezoneOffset()).join(' / ');
    ok(offsets === '-60 / -120', 'l’apprenant qui dérive tourne aux décalages ' + offsets + ' (janvier / juillet), pas à ceux de Bruxelles (-60 / -120) : son lendemain ne se compte pas à l’heure locale');
    okLong(nextEarlier > 0,'aucun des ' + leftEarlier + ' éléments laissés à un jour n’est revenu le lendemain, les jours où la séance commence plus tôt que la veille');
    P('  dont les jours commencés plus tôt', nextEarlier + ' sur ' + leftEarlier);
  }
  /* Dire tôt : un mot ou une phrase rencontré le premier jour est demandé à voix
     haute en une dizaine de jours, et jamais après trois semaines. Avec « dis-le »
     au seul échelon 5, c'était cinq semaines. */
  const firstDay = Object.keys(seenOnDay).filter(id => seenOnDay[id].has(1) && NL.content.byId(id).kind !== 'pattern');
  const waits = firstDay.map(id => aloud[id] || Infinity).sort((a, b) => a - b);
  const typical = waits[Math.floor(waits.length / 2)], latest = waits[waits.length - 1];
  okLong(typical <= 10,'un élément du premier jour est typiquement demandé à voix haute le jour ' + typical + ' : plus de dix jours');
  okLong(latest <= 21,'un élément du premier jour attend le jour ' + latest + ' pour être demandé à voix haute : plus de trois semaines');
  P('première demande à voix haute', 'jours ' + waits[0] + ' à ' + latest + ', pour les ' + waits.length + ' éléments du premier jour');
  /* Et dire tôt ne doit pas se payer sur le sens du second compte : un élément
     que l'on « sait produire » a passé l'échelon de l'écrit en étant écrit. Lu à
     voix haute, il a le mot sous les yeux. Quand la première réponse parlée
     faisait monter, c'était 97 éléments sur 100 ; il en reste quelques-uns, ceux
     qui, déjà dits, retombent puis tirent « dis-le » en revenant à l'échelon 3. */
  const passed = Object.keys(passedOn), read = passed.filter(id => passedOn[id] === 'speak');
  ok(read.length <= passed.length / 5, read.length + ' des ' + passed.length + ' éléments qui ont passé l’échelon de l’écrit l’ont passé en étant lus à voix haute');
  P('échelon de l’écrit passé par écrit', (passed.length - read.length) + ' sur ' + passed.length);
  /* L'apprenant qui ne peut pas toujours parler : mettre de côté ne coûte rien,
     ne laisse rien passer à voix haute, et ne fait rien sauter. */
  if (QUIET) {
    okLong(taps > 0,'aucune séance sans parler n’a rencontré d’exercice à voix haute : la simulation ne vérifie rien');
    ok(touched === 0, touched + ' « je ne peux pas parler » ont modifié un enregistrement, écrit au journal ou entamé le budget du jour');
    ok(spokeAfter === 0, spokeAfter + ' exercice(s) à voix haute servis après « je ne peux pas parler »');
    ok(detour === 0, detour + ' élément(s) mis de côté sont revenus autrement qu’à voix haute');
    ok(early === 0, early + ' élément(s) comptés mis de côté avaient déjà été servis plus tôt dans la séance : le geste ne leur a rien retiré');
    P('séances sans parler', taps + ', ' + putOff + ' éléments mis de côté : rien de noté, rien à voix haute ensuite, tout revient à voix haute');
  }
  ok(over.length === 0, over.length + ' jours dépassent le plafond quotidien — la dette explose');
  P('plafond quotidien respecté', over.length === 0 ? 'oui, ' + busiest + ' au maximum' : 'NON');
  P('pic de charge', peak + ' min');
  ok(peak <= 60, 'le pic dépasse une heure par jour : ce n’est plus compact');

  /* Aucun élément ne doit revenir tous les jours — le piège du plafond. */
  let worst = 0, worstId = '';
  Object.keys(seenOnDay).forEach(id => {
    const f = seenOnDay[id].size / DAYS;
    if (f > worst) { worst = f; worstId = id; }
  });
  okLong(worst <= 0.4,'un élément revient ' + Math.round(worst * 100) + '% des jours (' + worstId + ') — il oscille sous son plafond');
  P('élément le plus fréquent', Math.round(worst * 100) + '% des jours');

  const pc = k => Math.round((mix[k] || 0) / tasks * 100);
  const recog = pc('pick') + pc('recall') + pc('match');
  /* Le vrai seuil n'est pas un chiffre rond : avec une distribution donnée, un
     ordre aléatoire produit déjà Σp² de répétitions dos à dos. On exige donc que
     l'étalement fasse NETTEMENT mieux que le hasard, pas qu'il descende sous un
     plancher mathématiquement inatteignable. */
  const floor = Object.keys(mix).reduce((a2, k) => a2 + Math.pow(mix[k] / tasks, 2), 0);
  const actual = backToBack / tasks;
  okLong(actual < floor * 0.85,
    "l etalement n apporte rien : " + Math.round(actual * 100) + "% contre " +
    Math.round(floor * 100) + '% au hasard');
  P('répétitions dos à dos', Math.round(actual * 100) + '%  (hasard : ' + Math.round(floor * 100) + '%)');
  /* Hors première rencontre, qui est forcément de la reconnaissance. */
  const late = Math.round(lateRecog / tasks * 100);
  ok(late < 12, 'trop de reconnaissance après la première rencontre : ' + late + '%');
  P('reconnaissance (1re rencontre exclue)', late + '%');
  P('dont premières rencontres', (recog - late) + '%');
  P('production (parler, écrire, ouvert)', (pc('speak') + pc('type') + pc('open')) + '%');
  P('arriéré maximum', maxBacklog);

  console.log('\nMÉLANGE DES TYPES');
  console.log('='.repeat(70));
  Object.keys(mix).sort((a, b) => mix[b] - mix[a]).forEach(k =>
    console.log('  ' + k.padEnd(12) + String(mix[k]).padStart(7) + '  ' + pc(k) + '%  ' + '█'.repeat(pc(k))));

  console.log('\nPLAFOND DE CONTENU');
  console.log('='.repeat(70));
  P('éléments au catalogue', total);
  P('tout rencontré le jour', exhausted || 'pas encore');
  P('produits au jour ' + DAYS, perDay[DAYS - 1].produce + ' / ' + total);
  if (exhausted && exhausted < 200) {
    console.log('  → le contenu s’épuise : c’est la phase 4 qui le règle, pas le moteur.');
  }

  console.log('\n' + checks + ' vérifications, ' + (fails === 0 ? 'AUCUN PROBLÈME' : fails + ' PROBLÈME(S)') +
    (unjudged ? ' ; ' + unjudged + ' non jugée(s) : il faut au moins ' + HORIZON + ' jours' : ''));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
