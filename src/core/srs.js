/* Le planificateur. C'est lui, et pas un arbre de leçons, qui décide.
   rung   = position sur l'échelle de production
   due    = quand l'élément revient
   budget = ce qui empêche la dette de révisions d'exploser */
NL.srs = (function () {
  'use strict';
  const { clamp, DAY } = NL.util;

  const MAX_TASKS = 22;             // les places d'une séance : un élément par place
  const MAX_STAGE = 6;
  const GRADUATED = 5;              // atteint uniquement en disant l'élément à voix haute
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
    calme:     { cap: 70,  fresh: 15, mins: 15 },
    normal:    { cap: 120, fresh: 25, mins: 25 },
    intensif:  { cap: 200, fresh: 40, mins: 45 }
  };
  const pace = () => PACE[NL.state.meta().pace || 'normal'] || PACE.normal;

  /* Chaque échelon propose un ENSEMBLE de types, pas un seul. Avec quatorze
     passages par élément, la variété n'est pas un ornement : c'est la seule
     chose qui rend 26 000 exercices supportables. */
  /* Un cran plus exigeant : la découverte alterne les deux sens, et l'oreille
     (la dictée) arrive dès le deuxième barreau au lieu d'attendre le troisième. */
  const RUNGS = {
    word: [
      ['pick', 'recall'],
      ['article', 'intrus', 'dictation'],
      ['dictation', 'type'],
      ['type', 'cloze'],
      ['type', 'cloze', 'dictation'],
      ['speak'],
      ['speak', 'type', 'dictation', 'cloze']
    ],
    phrase: [
      ['pick', 'recall'],
      ['bank', 'vlaams', 'cloze'],
      ['cloze', 'corrige', 'dictation'],
      ['dictation', 'corrige'],
      ['type', 'cloze', 'corrige'],
      ['speak'],
      ['speak', 'type', 'open', 'corrige', 'dictation']
    ],
    chunk: [
      ['pick', 'recall'],
      ['bank', 'vlaams'],
      ['cloze'],
      ['type', 'dictation'],
      ['type', 'dictation', 'cloze'],
      ['speak'],
      ['speak', 'type', 'cloze']
    ],
    pattern: [
      ['order'],
      ['order', 'corrige'],
      ['cloze', 'corrige'],
      ['type', 'order'],
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
     l'élément a eu la dernière fois, puis ce qui vient de passer. */
  function exerciseFor(item, avoid) {
    const r = recOf(item);
    /* Un mot transparent n'a pas besoin qu'on lui enseigne son sens : sa
       première rencontre se fait à l'échelon suivant. Rien d'autre n'est sauté —
       ressembler à un mot connu ne dit ni son article ni comment il sonne. */
    const rung = (r.reps === 0 && item.cognate) ? 1 : clamp(r.stage, 0, 6);
    const set = (RUNGS[item.kind] || RUNGS.word)[rung] || ['pick'];
    let usable = set.filter(n => supports(item, n));
    if (!usable.length) usable = [fallback(item)];

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

  /* ---------------- notation ---------------- */
  function grade(item, ok, opts) {
    const r = recOf(item);
    const now = Date.now();
    const top = maxRung(item);
    r.kind = item.kind || r.kind;
    r.reps++; r.last = now;
    if (opts && opts.ex) r.lastEx = opts.ex;

    if (ok) {
      if (opts && opts.spoken) r.said = true;
      /* Un transparent (de tram, de garage, direct) a été rencontré à l'échelon 1 :
         sa première réussite le mène donc à l'échelon 2. Un seul échelon sauté,
         celui du sens. Voir docs/adr/0004. */
      const jump = (r.reps === 1 && item.cognate) ? 2 : 1;
      r.stage = clamp(r.stage + jump, 0, top);
      r.ease = clamp(r.ease + 0.05, 1.3, 2.9);
      /* PIÈGE 1 — au sommet de son palier, l'intervalle doit continuer de croître.
         Figé sur STEP[rung], l'élément revient tous les jours, à vie. */
      r.interval = r.stage >= top
        ? Math.min(MAX_INTERVAL, Math.round((r.interval || STEP[Math.min(top, STEP.length - 1)]) * r.ease))
        : STEP[r.stage];
      if (r.stage >= top && r.interval > RETIRE_AT) r.retired = true;
    } else {
      r.lapses++;
      /* PIÈGE 2 — une rechute rentre dans l'échelle, elle ne repart pas de deux
         minutes pour remonter en multipliant : sinon l'élément oscille sous son
         plafond sans jamais en sortir. */
      /* Jamais en dessous de l'échelon 1 : on ne te REPRÉSENTE pas un mot que tu
         connais depuis des mois, on te le redemande autrement. */
      r.stage = clamp(r.stage - 2, r.reps > 1 ? 1 : 0, top);
      r.ease = clamp(r.ease - 0.2, 1.3, 2.9);
      r.interval = STEP[Math.min(r.stage, STEP.length - 1)];
      r.retired = false;
    }
    r.due = now + r.interval;
    NL.state.setRec(r);
    NL.state.logReview({ id: item.id, t: now, ok: !!ok, stage: r.stage, kind: r.kind, ex: (opts && opts.ex) || null });
    return r;
  }

  /* Place un élément directement sur un échelon — test de placement, mots transparents. */
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
    let due = 0, learning = 0, mature = 0, said = 0, retired = 0;
    NL.state.allRecs().forEach(r => {
      if (r.retired) { retired++; mature++; return; }
      if (r.due <= now) due++;
      if (r.stage >= GRADUATED) mature++; else learning++;
      if (r.said) said++;
    });
    return { due, learning, mature, said, retired, seen: NL.state.seenCount() };
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
       → { due, fresh, left }   deux listes d'éléments, et le budget restant */
  function compose(source, now) {
    const uid = source && source !== 'vandaag' ? source : null;
    /* Travailler une unité précise est un choix : le budget du jour ne la bride pas. */
    const left = uid ? Infinity : budgetLeft();
    const places = Math.min(MAX_TASKS, left);
    if (places <= 0) return { due: [], fresh: [], left };

    let due = dueItems(now);
    if (uid) due = due.filter(it => it.unit === uid);
    const unmet = freshItems(MAX_TASKS, uid);

    /* La réserve sort AVANT que les révisions remplissent le reste, et elle
       disparaît d'elle-même quand il ne reste rien à rencontrer. */
    const reserve = Math.min(unmet.length, places, Math.max(NEW_MIN, Math.ceil(places * NEW_SHARE)));
    let nDue = Math.min(due.length, places - reserve);
    let nNew = Math.min(unmet.length, Math.max(reserve, Math.min(NEW_MAX, Math.floor((places + reserve - nDue) / 2))));
    /* Budget presque épuisé : on rabote les révisions d'abord. La réserve survit
       au rabotage — c'est précisément ce qu'elle doit faire. */
    while (nDue + 2 * nNew > left && nDue > 0) nDue--;
    while (nDue + 2 * nNew > left && nNew > 1) nNew--;

    /* Les règles de grammaire sont neuf parmi quatre cents : sans siège garanti,
       une semaine entière peut passer sans en revoir une. */
    const pats = due.filter(it => it.kind === 'pattern').slice(0, Math.min(2, nDue));
    const rest = due.filter(it => pats.indexOf(it) < 0).slice(0, nDue - pats.length);
    return { due: pats.concat(rest), fresh: unmet.slice(0, nNew), left };
  }

  /* Ce que l'écran d'accueil annonce : les comptes de compose(), rien d'autre.
       total = éléments ; tasks = exercices (un nouveau en coûte deux) */
  function plan() {
    const c = compose('vandaag');
    const tasks = c.due.length + 2 * c.fresh.length;
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
    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, GRADUATED, NEW_SHARE, NEW_MIN, NEW_MAX, TIER_MAX, RETIRE_AT,
    maxRung, pace, exerciseFor, supports, grade, seed, isSeen, stageOf, atTop,
    dueItems, counts, freshItems, compose, plan, unitSpan, recOf, budgetLeft, spend
  };
})();
