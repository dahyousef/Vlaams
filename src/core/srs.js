/* The scheduler. This, not a lesson tree, decides what you see.
   Stage = position on the production ladder; due/interval/ease = when it returns. */
NL.srs = (function () {
  'use strict';
  const { clamp, MIN, HOUR, DAY } = NL.util;

  const MAX_TASKS = 18;            // most exercises in one sitting
  const NEW_PER_SESSION = 8;       // meeting more than this at once does not stick
  const MAX_STAGE = 6;              // 6 = mature: alternates typing and speaking forever
  const GRADUATED = 5;              // reached only by passing a spoken exercise

  /* Three ladders. The exercise is chosen by the item's kind and stage, so an item
     physically cannot leave the ladder without having been said out loud. */
  const LADDER = {
    word:    ['pick',  'article', 'dictation', 'type', 'speak', 'speak', 'mixed'],
    phrase:  ['pick',  'bank',    'cloze',     'dictation', 'type', 'speak', 'mixed'],
    pattern: ['order', 'order',   'cloze',     'type', 'speak', 'speak', 'mixed']
  };

  /* Steps below a day keep an item inside the same sitting; above it, SM-2 takes over. */
  const STEP = [2 * MIN, 12 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY];

  const blank = (id, kind) => ({
    id, kind: kind || 'word', stage: 0, due: 0, interval: 0,
    ease: 2.5, reps: 0, lapses: 0, last: 0, said: false
  });

  function recOf(item) {
    return NL.state.rec(item.id) || blank(item.id, item.kind);
  }

  /* Which exercise this item is owed right now. */
  function exerciseFor(item) {
    const r = recOf(item);
    const ladder = LADDER[item.kind] || LADDER.word;
    let name = ladder[clamp(r.stage, 0, ladder.length - 1)];

    if (name === 'mixed') name = Math.random() < 0.5 ? 'speak' : 'type';
    /* Fall back gracefully when an item cannot support its rung. */
    if (name === 'article' && !item.art) name = item.kind === 'word' ? 'recall' : 'cloze';
    if (name === 'speak' && !NL.speech.canListen()) name = 'speak';   // becomes self-rated inside the exercise
    if ((name === 'bank' || name === 'cloze' || name === 'order') && NL.util.tiles(item.nl).length < 3) name = 'type';
    return name;
  }

  function grade(item, ok, opts) {
    const r = recOf(item);
    const now = Date.now();
    r.kind = item.kind || r.kind;
    r.reps++;
    r.last = now;

    if (ok) {
      if (opts && opts.spoken) r.said = true;
      r.stage = clamp(r.stage + 1, 0, MAX_STAGE);
      r.ease = clamp(r.ease + 0.05, 1.3, 2.9);
      r.interval = r.stage < STEP.length ? STEP[r.stage] : Math.round((r.interval || DAY) * r.ease);
    } else {
      r.lapses++;
      r.stage = clamp(r.stage - 1, 0, MAX_STAGE);
      r.ease = clamp(r.ease - 0.2, 1.3, 2.9);
      r.interval = 2 * MIN;                     // back inside this session
    }
    r.due = now + r.interval;
    NL.state.setRec(r);
    NL.state.logReview({ id: item.id, t: now, ok: !!ok, stage: r.stage, kind: r.kind });
    return r;
  }

  /* Seeds an item straight onto a rung — used by the placement check. */
  function seed(item, stage) {
    const r = blank(item.id, item.kind);
    r.stage = clamp(stage, 0, MAX_STAGE);
    r.reps = 1;
    r.interval = STEP[Math.min(r.stage, STEP.length - 1)];
    r.due = Date.now() + r.interval;
    NL.state.setRec(r);
    return r;
  }

  const isSeen = item => !!NL.state.rec(item.id);
  const stageOf = item => { const r = NL.state.rec(item.id); return r ? r.stage : -1; };

  function dueItems(now) {
    now = now || Date.now();
    const list = NL.content.allItems()
      .filter(it => { const r = NL.state.rec(it.id); return r && r.due <= now; });
    /* Shuffle, then a stable sort by due date: genuinely overdue items still come
       first, but a backlog that all fell due at the same moment is drawn from
       evenly instead of returning the same slice every single session. */
    return NL.util.shuffle(list)
      .sort((a, b) => NL.state.rec(a.id).due - NL.state.rec(b.id).due);
  }

  function counts() {
    const now = Date.now();
    let due = 0, learning = 0, mature = 0, said = 0;
    NL.state.allRecs().forEach(r => {
      if (r.due <= now) due++;
      if (r.stage >= GRADUATED) { mature++; } else { learning++; }
      if (r.said) said++;
    });
    return { due, learning, mature, said, seen: NL.state.seenCount() };
  }

  /* Next items never met, in curriculum order, from units that are open. */
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

  /* What the next session will actually contain. Both the home screen and the
     runner read this, so the promise and the delivery agree. */
  function plan() {
    const m = NL.state.meta();
    const due = dueItems().length;
    const room = Math.max(0, (m.dailyGoal || 20) - (m.doneToday || 0));
    const fresh = freshItems(Math.min(room, NEW_PER_SESSION)).length;
    const warmup = fresh >= 4 ? 1 : 0;   // new items get met as a matching round first
    const total = Math.min(due + fresh + warmup, MAX_TASKS + 1);
    return { due, fresh, total, mins: Math.max(2, Math.round(total * 0.6)) };
  }

  return { LADDER, MAX_STAGE, MAX_TASKS, NEW_PER_SESSION, GRADUATED, exerciseFor, grade, seed, isSeen, stageOf, dueItems, counts, freshItems, recOf, plan, STEP };
})();
