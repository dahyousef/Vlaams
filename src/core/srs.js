/* Le planificateur. C'est lui, et pas un arbre de leçons, qui décide.
   rung   = position sur l'échelle de production
   due    = quand l'élément revient
   budget = ce qui empêche la dette de révisions d'exploser */
NL.srs = (function () {
  'use strict';
  const { clamp, DAY } = NL.util;

  const MAX_TASKS = 22;             // les places d'une séance : un élément par place
  const MAX_STAGE = 6;
  const PRODUCE = 4;                // l'échelon de l'écrit est passé : l'élément se produit
  /* La part de chaque séance réservée à ce qui n'a jamais été rencontré. Sans
     elle, les révisions finissent par occuper toutes les places et plus rien de
     neuf n'arrive. Elle se calcule sur la SÉANCE, jamais sur le budget du jour :
     le budget vaut plusieurs séances, et en réserver 30 % dépasserait la séance. */
  const NEW_SHARE = 0.3, NEW_MIN = 4;
  /* Un élément rencontré revient une fois dans la même séance : il coûte donc
     deux exercices. Au-delà de la moitié des places, la séance doublerait. */
  const NEW_MAX = MAX_TASKS / 2;
  const RETIRE_AT = 200 * DAY;
  const MAX_INTERVAL = 365 * DAY;   // au-delà, l'élément est acquis, pas oublié      // au-delà, l'élément sort du paquet quotidien

  /* Tous les mots ne méritent pas la même montée. Le vocabulaire compris est
     toujours plus large que le vocabulaire produit : on comprend 4 000 mots, on
     en produit 1 500. Le palier dit jusqu'où un élément doit grimper.

     AUCUN élément ne déclare de palier, et c'est VOULU. Deux règles ont été
     étudiées et rejetées :
       - par fréquence : le corpus de sous-titres classe « de bakker », « de
         apotheek », « trager » et « goeiedag » comme rares. Ce sont exactement
         les mots qu'il faut savoir DIRE en Flandre ;
       - par ressemblance écrite : « speciaal », « de trein », « het water » ont
         l'air offerts et ne se prononcent pas du tout comme leur traduction.
         Se ressembler à l'écrit ne dit rien du son, et c'est le son que le
         barreau « à voix haute » travaille.
     Le mécanisme reste en place : il redeviendra utile quand il y aura de la
     lecture, donc du vocabulaire qu'on doit comprendre sans devoir le produire.
     Voir la spécification (issue #12) avant de le remplir. */
  const TIER_MAX = { produce: 6, write: 4, recognise: 2 };
  const maxRung = item => TIER_MAX[(item && item.tier) || 'produce'];

  /* Un rythme, et le prix honnête qui va avec. */
  const PACE = {
    calme:     { cap: 70,  mins: 15 },
    normal:    { cap: 120, mins: 25 },
    intensif:  { cap: 200, mins: 45 }
  };
  const pace = () => PACE[NL.state.meta().pace || 'normal'] || PACE.normal;

  /* Chaque échelon propose un ENSEMBLE de types, pas un seul. Avec quatorze
     passages par élément, la variété n'est pas un ornement : c'est la seule
     chose qui rend 26 000 exercices supportables. */
  /* Un cran plus exigeant : la découverte alterne les deux sens, et l'oreille
     (la dictée) arrive dès le deuxième barreau au lieu d'attendre le troisième. */
  /* « Dis-le » dès l'échelon 3 pour les mots, les phrases et les expressions :
     au seul échelon 5, la première demande à voix haute tombait cinq semaines
     après la rencontre. Voir exerciseFor() pour qui y a droit d'office, et
     firstAloud() pour ce que vaut cette première fois. */
  /* À l'échelon 3, l'exercice écrit se tape. C'est lui qui mène à l'échelon 4,
     où l'élément compte parmi ceux que l'on sait produire : choisir un trou,
     toucher la faute ou ranger des tuiles ne le prouve pas. La dictée d'un mot
     se tape, et le mot la garde à côté d'« écrire » : avec « écrire » seul, les
     exercices se suivaient pareils et l'étalement ne faisait plus mieux que le
     hasard (test/pace.js). Celle d'une phrase ou d'une expression se range en
     tuiles : les phrases empruntent donc « écrire » à l'échelon 4, et une
     règle de grammaire n'y garde qu'« écrire ». « Dis-le » reste où il était. */
  const RUNGS = {
    word: [
      ['pick', 'recall'],
      ['article', 'intrus', 'dictation'],
      ['dictation', 'type'],
      ['type', 'dictation', 'speak'],
      ['type', 'cloze', 'dictation'],
      ['speak'],
      ['speak', 'type', 'dictation', 'cloze']
    ],
    phrase: [
      ['pick', 'recall'],
      ['bank', 'vlaams', 'cloze'],
      ['cloze', 'corrige', 'dictation'],
      ['speak', 'type'],
      ['type', 'cloze', 'corrige'],
      ['speak'],
      ['speak', 'type', 'open', 'corrige', 'dictation']
    ],
    chunk: [
      ['pick', 'recall'],
      ['bank', 'vlaams'],
      ['cloze'],
      ['type', 'speak'],
      ['type', 'dictation', 'cloze'],
      ['speak'],
      ['speak', 'type', 'cloze']
    ],
    pattern: [
      ['order'],
      ['order', 'corrige'],
      ['cloze', 'corrige'],
      ['type'],
      ['speak', 'open'],
      ['speak'],
      ['open', 'speak']
    ]
  };

  /* Aucun intervalle enregistré ne descend sous un jour. Le renforcement quelques
     minutes après la rencontre existe toujours, mais c'est la séance en cours
     qui le fait (src/ui/session.js) : enregistré comme une échéance, il
     disputait les places de la séance à tout le reste. Voir docs/adr/0001. */
  const STEP = [1 * DAY, 1 * DAY, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY];

  const blank = (id, kind) => ({
    id, kind: kind || 'word', stage: 0, due: 0, interval: 0,
    ease: 2.5, reps: 0, lapses: 0, last: 0, said: false, retired: false, lastEx: null
  });
  const recOf = item => NL.state.rec(item.id) || blank(item.id, item.kind);

  /* ---------------- choix de l'exercice ---------------- */
  /* `avoid` = les types déjà servis dans cette séance. Le gouverneur évite ce que
     l'élément a eu la dernière fois, puis ce qui vient de passer.
     `quiet` = une séance où l'on ne peut pas parler : rien à voix haute. */
  function exerciseFor(item, avoid, quiet) {
    const r = recOf(item);
    /* Un mot transparent n'a pas besoin qu'on lui enseigne son sens : sa
       première rencontre se fait à l'échelon suivant. Rien d'autre n'est sauté —
       ressembler à un mot connu ne dit ni son article ni comment il sonne. */
    const rung = (r.reps === 0 && item.cognate) ? 1 : clamp(r.stage, 0, 6);
    const set = (RUNGS[item.kind] || RUNGS.word)[rung] || ['pick'];
    let usable = set.filter(n => supports(item, n));
    if (quiet) usable = usable.filter(n => n !== 'speak');
    if (!usable.length) usable = [fallback(item)];
    /* Un élément jamais dit à voix haute l'est dès que son échelon le propose.
       Tiré au sort parmi les exercices de l'échelon, « dis-le » ne tombait qu'une
       fois sur deux ou trois, et le reste attendait l'échelon 5. */
    if (!r.said && usable.indexOf('speak') >= 0) return 'speak';

    let pick = usable.filter(n => n !== r.lastEx);
    if (!pick.length) pick = usable;
    if (avoid && avoid.size) {
      const fresher = pick.filter(n => !avoid.has(n));
      if (fresher.length) pick = fresher;
    }
    return pick[(Math.random() * pick.length) | 0];
  }

  /* Un type n'est proposé que si l'élément peut réellement le porter. */
  function supports(item, name) {
    /* Un mot muni d'une phrase d'exemple peut porter les exercices de phrase :
       c'est la phrase qu'on remet en ordre, pas le mot tout seul. */
    const carrier = (item.drills && item.drills.length) ? item.drills[0].nl : (item.nl || '');
    const words = NL.util.tiles(carrier).length;
    switch (name) {
      case 'article': return !!item.art;
      case 'vlaams': return !!item.be && NL.util.norm(item.be) !== NL.util.norm(item.nl);
      case 'bank': case 'cloze': case 'order': case 'corrige': return words >= 3;
      case 'open': return !!item.open;
      case 'intrus': return item.kind === 'word' && !!item.art;
      default: return true;
    }
  }
  const fallback = item => (NL.util.tiles(item.nl || '').length >= 3 ? 'type' : 'pick');

  /* Vrai quand le prochain exercice de l'élément ne peut être que parlé : son
     échelon n'offre rien d'autre, ou bien il n'a jamais été dit et son échelon
     propose de le dire. Une séance où l'on ne peut pas parler laisse ces
     éléments attendre plutôt que de leur donner autre chose. */
  function needsVoice(item) {
    const r = recOf(item);
    const usable = ((RUNGS[item.kind] || RUNGS.word)[clamp(r.stage, 0, 6)] || []).filter(n => supports(item, n));
    return usable.indexOf('speak') >= 0 && (!r.said || usable.length === 1);
  }

  /* Vrai quand l'élément n'a jamais été dit et que son échelon propose de le
     dire à côté d'un autre exercice. Le dire ne déplace alors rien : réussi, il
     est dit et garde son échelon, et c'est l'exercice écrit qui suit, dans la
     même séance, qui le fait monter. Sans cela, lire un mot à voix haute
     suffirait à le compter parmi ceux que l'on sait produire. */
  function firstAloud(item) {
    const r = recOf(item);
    const usable = ((RUNGS[item.kind] || RUNGS.word)[clamp(r.stage, 0, 6)] || []).filter(n => supports(item, n));
    return !r.said && usable.length > 1 && usable.indexOf('speak') >= 0;
  }

  /* ---------------- notation ---------------- */
  function grade(item, ok, opts) {
    const r = recOf(item);
    const now = Date.now();
    const top = maxRung(item);
    r.kind = item.kind || r.kind;
    r.reps++; r.last = now;
    if (opts && opts.ex) r.lastEx = opts.ex;

    /* Dit pour la première fois, là où l'échelon propose aussi autre chose :
       l'élément est dit, et rien d'autre ne bouge. Un second exercice, en fin de
       séance, le redemande par écrit, et c'est cette réponse-là qui le fait
       monter. Si la séance s'arrête avant, il revient demain, par écrit. */
    const first = !!opts && opts.ex === 'speak' && firstAloud(item);
    if (ok && first && opts.spoken) {
      r.said = true;
      r.interval = STEP[0];
    } else if (ok) {
      if (opts && opts.spoken) r.said = true;
      /* Un transparent (de tram, de garage, direct) a été rencontré à l'échelon 1 :
         sa première réussite le mène donc à l'échelon 2. Un seul échelon sauté,
         celui du sens. Voir docs/adr/0004. */
      const jump = (r.reps === 1 && item.cognate) ? 2 : 1;
      r.stage = clamp(r.stage + jump, 0, top);
      /* Le défi ne fait pas passer à un élément jamais dit à voix haute le premier
         échelon où son genre le fait dire — le 3, et le 4 pour une règle de
         grammaire : son premier exercice parlé y vient encore. */
      const aloudAt = (RUNGS[item.kind] || RUNGS.word).findIndex(set => set.indexOf('speak') >= 0);
      if (opts && opts.defi && !r.said && aloudAt >= 0 && r.stage > aloudAt) r.stage = Math.max(aloudAt, r.stage - jump);
      r.ease = clamp(r.ease + 0.05, 1.3, 2.9);
      /* PIÈGE 1 — au sommet de son palier, l'intervalle doit continuer de croître.
         Figé sur STEP[rung], l'élément revient tous les jours, à vie. */
      r.interval = r.stage >= top
        ? Math.min(MAX_INTERVAL, Math.round((r.interval || STEP[Math.min(top, STEP.length - 1)]) * r.ease))
        : STEP[r.stage];
      if (r.stage >= top && r.interval > RETIRE_AT) r.retired = true;
    } else {
      r.lapses++;
      /* PIÈGE 2 — une rechute rentre dans l'échelle, elle ne repart pas du bas
         pour remonter en multipliant : sinon l'élément oscille sous son
         plafond sans jamais en sortir. */
      /* Jamais en dessous de l'échelon 1 : on ne te REPRÉSENTE pas un mot que tu
         connais depuis des mois, on te le redemande autrement. */
      /* Un exercice parlé raté tant que l'élément n'a jamais été dit ne coûte
         aucun échelon. La phrase est à l'écran : ce n'est pas un oubli, c'est la
         prononciation ou le micro, et redescendre de deux échelons renverrait
         l'élément se faire reconnaître. Il garde sa place et revient demain. */
      const unsaid = !r.said && !!opts && opts.ex === 'speak';
      if (!unsaid) {
        /* Un transparent ne tombe jamais à l'échelon 0 non plus : il serait alors
           interrogé sur le sens qu'on lui avait épargné (docs/adr/0004). */
        r.stage = clamp(r.stage - 2, (r.reps > 1 || item.cognate) ? 1 : 0, top);
        r.ease = clamp(r.ease - 0.2, 1.3, 2.9);
      }
      r.interval = unsaid ? STEP[0] : STEP[Math.min(r.stage, STEP.length - 1)];
      r.retired = false;
    }
    r.due = now + r.interval;
    NL.state.setRec(r);
    NL.state.logReview({ id: item.id, t: now, ok: !!ok, stage: r.stage, kind: r.kind, ex: (opts && opts.ex) || null });
    return r;
  }

  /* Place un élément directement sur un échelon : c'est ainsi que les tests posent un état. */
  function seed(item, stage) {
    const r = blank(item.id, item.kind);
    r.stage = clamp(stage, 0, maxRung(item));
    r.reps = 1;
    r.interval = STEP[Math.min(r.stage, STEP.length - 1)];
    r.due = Date.now() + r.interval;
    NL.state.setRec(r);
    return r;
  }

  const isSeen = item => !!NL.state.rec(item.id);
  const stageOf = item => { const r = NL.state.rec(item.id); return r ? r.stage : -1; };
  const atTop = item => { const r = NL.state.rec(item.id); return !!r && r.stage >= maxRung(item); };

  /* Les vrais retards passent devant. Un arriéré tombé au même instant est
     départagé par un tirage qui dépend de l'élément et du nombre d'exercices
     faits aujourd'hui : il change d'une séance à l'autre, mais pas entre l'écran
     qui annonce la séance et la séance elle-même. */
  const tieBreak = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function dueItems(now) {
    now = now || Date.now();
    const m = NL.state.meta();
    const salt = ':' + (m.exDay || '') + ':' + (m.exToday || 0);
    return NL.content.allItems()
      .filter(it => { const r = NL.state.rec(it.id); return r && !r.retired && r.due <= now; })
      .map(it => ({ it, due: NL.state.rec(it.id).due, k: tieBreak(it.id + salt) }))
      .sort((a, b) => a.due - b.due || a.k - b.k)
      .map(x => x.it);
  }

  function counts() {
    const now = Date.now();
    let due = 0, said = 0, retired = 0;
    NL.state.allRecs().forEach(r => {
      if (r.retired) { retired++; return; }
      if (r.due <= now) due++;
      if (r.said) said++;
    });
    return { due, said, retired, seen: NL.state.seenCount() };
  }

  /* ---------------- ce qui résiste ---------------- */
  /* Chaque réponse est enregistrée depuis le premier jour, et aucun écran ne
     l'avait jamais relue. Les éléments sont classés par nombre de réponses
     fausses sur les deux derniers mois, le plus raté d'abord. Un élément
     toujours réussi n'y figure pas ; une réponse qui nomme un élément disparu
     du cours est ignorée plutôt que de casser l'écran. */
  const MISS_WINDOW = 62 * DAY;
  function mistakes(now) {
    now = now || Date.now();
    const by = new Map();
    NL.state.logs().forEach(l => {
      if (!l || !l.id || l.t < now - MISS_WINDOW) return;
      const item = NL.content.byId(l.id);
      if (!item) return;
      /* Un refus de la reconnaissance vocale ne dit rien de la mémoire. */
      if (l.ex === 'speak') return;
      const x = by.get(l.id) || { item, wrong: 0, right: 0, last: 0 };
      if (l.ok) x.right++; else { x.wrong++; x.last = Math.max(x.last, l.t); }
      by.set(l.id, x);
    });
    return [...by.values()].filter(x => x.wrong > 0).sort((a, b) => b.wrong - a.wrong || b.last - a.last);
  }

  /* ---------------- budget quotidien ---------------- */
  /* Le seul mécanisme qui empêche la dette de révisions de transformer le mois six
     en deux heures par jour. Ce qui déborde attend, et ne s'affiche jamais comme
     un arriéré culpabilisant. */
  function budgetLeft() {
    const m = NL.state.meta();
    const today = NL.util.dayKey();
    const done = m.exDay === today ? (m.exToday || 0) : 0;
    return Math.max(0, pace().cap - done);
  }
  function spend(n) {
    const m = NL.state.meta();
    const today = NL.util.dayKey();
    NL.state.setMeta({ exDay: today, exToday: (m.exDay === today ? (m.exToday || 0) : 0) + (n || 1) });
  }

  /* Les n premiers éléments jamais rencontrés des unités ouvertes, dans l'ordre
     du cours. `uid` restreint à une unité. */
  function freshItems(n, uid) {
    const out = [];
    if (n <= 0) return out;
    const open = NL.content.frontier();
    const at = {};
    NL.content.units.forEach((u, i) => { at[u.id] = i; });
    /* Les mots que la personne a ajoutés passent devant le cours : rangés en fin
       de liste, ils attendaient que tout le reste ait été rencontré. */
    const all = NL.content.allItems();
    for (const it of all.filter(x => x.unit === 'eigen').concat(all.filter(x => x.unit !== 'eigen'))) {
      if (out.length >= n) break;
      if (NL.state.rec(it.id)) continue;
      if (uid && it.unit !== uid) continue;
      if (it.unit !== 'eigen' && !(at[it.unit] <= open)) continue;
      out.push(it);
    }
    return out;
  }

  /* LE seul endroit qui décide de ce qu'une séance contient. L'écran qui
     l'annonce et la séance elle-même posent tous deux la question ici : ils ne
     peuvent donc pas se contredire.
       source   'vandaag' (défaut) ou l'identifiant d'une unité
       opts     { quiet, without } : une séance où l'on ne peut pas parler laisse
                attendre ce qui ne peut être que dit, et ne reprend pas les
                éléments (`without`, un Set d'identifiants) qu'elle contient déjà
       → { due, fresh, left }   deux listes d'éléments, et le budget restant */
  function compose(source, now, opts) {
    const uid = source && source !== 'vandaag' ? source : null;
    /* Travailler une unité précise est un choix : le budget du jour ne la bride pas. */
    const left = uid ? Infinity : budgetLeft();
    const places = Math.min(MAX_TASKS, left);
    if (places <= 0) return { due: [], fresh: [], left };

    let due = dueItems(now);
    if (uid) due = due.filter(it => it.unit === uid);
    if (opts && opts.quiet) due = due.filter(it => !needsVoice(it) && !(opts.without && opts.without.has(it.id)));
    const unmet = freshItems(MAX_TASKS, uid);

    /* La réserve sort AVANT que les révisions remplissent le reste, et elle
       disparaît d'elle-même quand il ne reste rien à rencontrer. */
    const reserve = Math.min(unmet.length, places, Math.max(NEW_MIN, Math.ceil(places * NEW_SHARE)));
    let nDue = Math.min(due.length, places - reserve);
    let nNew = Math.min(unmet.length, Math.max(reserve, Math.min(NEW_MAX, Math.floor((places + reserve - nDue) / 2))));
    /* Les règles de grammaire sont neuf parmi quatre cents : sans siège garanti,
       une semaine entière peut passer sans en revoir une. */
    const pick = n => {
      const pats = due.filter(it => it.kind === 'pattern').slice(0, Math.min(2, n));
      return pats.concat(due.filter(it => pats.indexOf(it) < 0).slice(0, n - pats.length));
    };
    /* Budget presque épuisé : on rabote les révisions d'abord. La réserve survit
       au rabotage — c'est précisément ce qu'elle doit faire. Le coût se compte
       sur la séance servie : une rencontre, ou un élément dit pour la première
       fois, en vaut deux quand son second exercice trouve sa place (voir
       lace()), un seul sinon. */
    while (exercises(pick(nDue), unmet.slice(0, nNew)) > left && nDue > 0) nDue--;
    while (exercises(pick(nDue), unmet.slice(0, nNew)) > left && nNew > 1) nNew--;
    /* Le rabotage a pu prendre trop : les rencontres gardées, une révision de
       plus pèse parfois moins que ce qu'elle rend possible (le renforcement de
       chaque rencontre). On les rend une à une tant que la séance servie tient
       dans ce qui reste du jour. La réserve n'y est pas touchée. */
    while (nDue < due.length && nDue + nNew < places && exercises(pick(nDue + 1), unmet.slice(0, nNew)) <= left) nDue++;
    return { due: pick(nDue), fresh: unmet.slice(0, nNew), left };
  }

  /* ---------------- la disposition d'une séance ---------------- */
  /* Un second exercice — le renforcement d'une rencontre, ou l'écrit qui suit une
     première réponse à voix haute — ne vient qu'avec au moins SECOND_GAP exercices
     entre lui et le dernier exercice de son élément : écrire un mot qu'on vient
     de voir à l'écran ne prouve rien. Là où cet écart ne tient pas, il n'est pas
     servi, et l'élément reste comme après une séance quittée entre les deux :
     il revient le lendemain. Une reprise après une réponse fausse est une
     correction, non un second exercice : cet écart ne la lie pas. */
  const SECOND_GAP = 3;
  const apart = (first, at) => at - first > SECOND_GAP;

  /* Tresse les rencontres, les révisions et les seconds exercices. C'est LA
     disposition d'une séance : plan() la compte sur les éléments, la séance la
     remplit avec leurs exercices.
       meetings, reviews  les premiers exercices, dans l'ordre
       toSay(x)           vrai pour une première réponse à voix haute
       second(x)          ce qui tient la place du second exercice de x
     Les renforcements se glissent à intervalles réguliers dans ce qui suit leur
     rencontre : groupés en fin de séance, ils formeraient une longue file du même
     exercice. L'écrit qui suit une première réponse à voix haute ferme la séance,
     le plus loin possible d'elle ; trois révisions ordinaires sont gardées pour la
     fin, afin qu'il ne la suive jamais aussitôt. Ce qui n'a pas trouvé sa place à
     la fin n'est pas servi. La longueur ne dépend que du nombre de rencontres, de
     premières fois et de révisions ordinaires, jamais de leur ordre : l'annonce
     et la séance comptent donc la même chose. */
  function lace(meetings, reviews, toSay, second) {
    const plain = reviews.filter(x => !toSay(x)).slice(-SECOND_GAP);
    const base = meetings.concat(reviews.filter(x => plain.indexOf(x) < 0), plain);
    const every = Math.max(1, Math.floor(base.length / Math.max(1, meetings.length)));
    const out = [], waiting = [], aloud = [];
    let i = 0, since = 0;
    while (i < base.length || waiting.length) {
      if (waiting.length && apart(waiting[0].at, out.length) && (i >= base.length || since >= every)) {
        out.push(second(waiting.shift().x)); since = 0;
        continue;
      }
      if (i >= base.length) break;
      const x = base[i];
      if (i < meetings.length) waiting.push({ at: out.length, x });
      else if (toSay(x)) aloud.push({ at: out.length, x });
      out.push(x); i++; since++;
    }
    aloud.forEach(a => { if (apart(a.at, out.length)) out.push(second(a.x)); });
    return out;
  }

  /* Ce qu'une séance coûte en exercices : la longueur de sa disposition. Une
     rencontre en coûte deux, une première fois à voix haute aussi, quand leur
     second exercice trouve sa place ; une seule sinon. */
  const exercises = (due, fresh) => lace(fresh, due, firstAloud, x => x).length;

  /* Ce que l'écran d'accueil annonce : les comptes de compose(), rien d'autre.
       total = éléments ; tasks = exercices, comptés par exercises() */
  function plan() {
    const c = compose('vandaag');
    const tasks = exercises(c.due, c.fresh);
    return {
      due: c.due.length, fresh: c.fresh.length, total: c.due.length + c.fresh.length,
      tasks, left: c.left, mins: Math.max(1, Math.round(tasks * 0.22)),
      units: unitSpan(c.due.concat(c.fresh))
    };
  }

  /* Les unités que couvre une liste d'éléments : la première et la dernière. */
  function unitSpan(items) {
    const ns = [];
    items.forEach(it => { const u = NL.content.unit(it.unit); if (u) ns.push(u.n); });
    return ns.length ? { from: Math.min.apply(null, ns), to: Math.max.apply(null, ns) } : null;
  }

  return {
    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, PRODUCE, NEW_SHARE, NEW_MIN, NEW_MAX, TIER_MAX, RETIRE_AT,
    maxRung, pace, exerciseFor, firstAloud, needsVoice, supports, grade, seed, isSeen, stageOf, atTop,
    dueItems, counts, freshItems, compose, plan, unitSpan, mistakes, recOf, budgetLeft, spend,
    SECOND_GAP, apart, lace
  };
})();
