/* Le planificateur. C'est lui, et pas un arbre de leçons, qui décide.
   rung   = position sur l'échelle de production
   due    = quand l'élément revient
   budget = ce qui empêche la dette de révisions d'exploser */
NL.srs = (function () {
  'use strict';
  const { clamp, MIN, DAY } = NL.util;

  const MAX_TASKS = 22;
  const MAX_STAGE = 6;
  const GRADUATED = 5;              // atteint uniquement en disant l'élément à voix haute
  const RETIRE_AT = 200 * DAY;
  const MAX_INTERVAL = 365 * DAY;   // au-delà, l'élément est acquis, pas oublié      // au-delà, l'élément sort du paquet quotidien

  /* Tous les mots ne méritent pas la même montée. Le vocabulaire compris est
     toujours plus large que le vocabulaire produit : on comprend 4 000 mots, on
     en produit 1 500. Le palier dit jusqu'où un élément doit grimper. */
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
  const RUNGS = {
    word: [
      ['pick'],
      ['article', 'recall', 'intrus'],
      ['dictation', 'type'],
      ['type', 'cloze'],
      ['type', 'cloze', 'dictation'],
      ['speak'],
      ['speak', 'type', 'dictation', 'cloze']
    ],
    phrase: [
      ['pick'],
      ['bank', 'vlaams'],
      ['cloze', 'corrige'],
      ['dictation', 'corrige'],
      ['type', 'cloze', 'corrige'],
      ['speak'],
      ['speak', 'type', 'open', 'corrige', 'dictation']
    ],
    chunk: [
      ['pick'],
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

  /* Sous la journée, l'élément reste dans la même séance ; au-dessus, SM-2 prend le relais. */
  const STEP = [2 * MIN, 12 * MIN, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY];

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
    const set = (RUNGS[item.kind] || RUNGS.word)[clamp(r.stage, 0, 6)] || ['pick'];
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
    const words = NL.util.tiles(item.nl || '').length;
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
      /* Les transparents (de tram, de garage, direct) ne méritent pas douze
         passages : la première réussite en saute deux. */
      const jump = (r.reps === 1 && item.cognate) ? 3 : 1;
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

  function dueItems(now) {
    now = now || Date.now();
    const list = NL.content.allItems().filter(it => {
      const r = NL.state.rec(it.id);
      return r && !r.retired && r.due <= now;
    });
    /* Mélange puis tri stable par échéance : les vrais retards passent devant,
       mais un arriéré tombé au même instant est puisé uniformément au lieu de
       rendre la même tranche à chaque séance. */
    return NL.util.shuffle(list).sort((a, b) => NL.state.rec(a.id).due - NL.state.rec(b.id).due);
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

  /* Du nouveau seulement si la journée a de la place une fois les révisions faites. */
  function freshItems(n) {
    const out = [];
    for (const it of NL.content.allItems()) {
      if (out.length >= n) break;
      if (NL.state.rec(it.id)) continue;
      if (!NL.content.unitOpen(it.unit)) continue;
      out.push(it);
    }
    return out;
  }

  function plan() {
    const left = budgetLeft();
    const due = Math.min(dueItems().length, left);
    const room = Math.max(0, left - due);
    const fresh = freshItems(Math.min(room, pace().fresh)).length;
    const total = Math.min(due + fresh, MAX_TASKS);
    return { due, fresh, total, left, mins: Math.max(1, Math.round(total * 0.22)) };
  }

  return {
    RUNGS, STEP, PACE, MAX_STAGE, MAX_TASKS, GRADUATED, TIER_MAX, RETIRE_AT,
    maxRung, pace, exerciseFor, supports, grade, seed, isSeen, stageOf, atTop,
    dueItems, counts, freshItems, plan, recOf, budgetLeft, spend
  };
})();
