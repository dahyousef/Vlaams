/* The session runner. Builds a queue from whatever the scheduler says is owed,
   runs it, grades it, and puts failures back on the end. */
NL.screens.sessie = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, EX = NL.ex;
  let L = null;

  const MAX_TASKS = NL.srs.MAX_TASKS;

  function blankTurn() {
    return { sel: null, picked: [], input: '', close: false, matchSel: null, matchGone: [], matchBad: null, speech: { phase: 'idle', tries: 0, selfRated: null } };
  }

  /* ---------------- le défi ----------------
     Vingt exercices de PRODUCTION tirés de ce que tu as déjà rencontré, trois
     vies, pas de reprise. Parler en est exclu : l'auto-évaluation n'a pas sa
     place dans un score. Les réponses comptent comme de vraies révisions. */
  const DEFI_SIZE = 20, DEFI_LIVES = 3, DEFI_MIN = 10;
  const DEFI_TYPES = {
    word: ['type', 'dictation', 'cloze'],
    phrase: ['type', 'dictation', 'corrige', 'cloze'],
    chunk: ['type', 'dictation', 'cloze'],
    pattern: ['order', 'corrige', 'type']
  };
  const defiPool = () => NL.content.allItems().filter(it => NL.srs.stageOf(it) >= 1);
  const defiReady = () => defiPool().length >= DEFI_MIN;

  function startDefi() {
    const pool = defiPool();
    if (pool.length < DEFI_MIN) { L = null; return false; }
    const queue = [];
    let last = null;
    U.shuffle(pool).forEach(it => {
      if (queue.length >= DEFI_SIZE) return;
      let names = (DEFI_TYPES[it.kind] || DEFI_TYPES.word).filter(n => NL.srs.supports(it, n));
      if (!names.length) names = ['type'];
      const fresh = names.filter(n => n !== last);
      const name = U.one(fresh.length ? fresh : names);
      try { queue.push({ ex: name, task: EX.get(name).build(it), items: [it] }); last = name; } catch (e) {}
    });
    if (!queue.length) { L = null; return false; }
    L = Object.assign(blankTurn(), {
      source: 'defi', queue, at: 0, phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0,
      started: Date.now(), finished: false, newCount: 0, combo: 0, bestCombo: 0, lives: DEFI_LIVES
    });
    return true;
  }

  /* Un exercice par élément. Le gouverneur retient les deux derniers types
     servis pour qu'aucun ne se répète coup sur coup. */
  function build(items, recent, quiet) {
    const out = [];
    items.forEach(it => {
      const name = NL.srs.exerciseFor(it, new Set(recent), quiet);
      try {
        out.push({ ex: name, task: EX.get(name).build(it), items: [it] });
        recent.push(name);
        if (recent.length > 2) recent.shift();
      } catch (e) {
        /* Un élément mal formé est sauté — mais plus en silence : sans trace,
           il pouvait n'être jamais drillé sans que personne le sache. */
        NL.errlog.note(e, 'exercice ' + name + ' · ' + it.id);
      }
    });
    return out;
  }

  /* Étalement optimal. Choisir « le premier qui diffère » ne suffit pas : quand
     un type domine la file, il faut le répartir activement. On puise donc à
     tour de rôle dans le plus gros paquet restant, ce qui est l'ordonnancement
     qui minimise réellement les voisins identiques. */
  function spread(list, last) {
    const bucket = {};
    list.forEach(x => { (bucket[x.ex] = bucket[x.ex] || []).push(x); });
    const out = [];
    const left = () => Object.keys(bucket).filter(k => bucket[k].length);
    while (left().length) {
      const keys = left().sort((a, b) => bucket[b].length - bucket[a].length);
      const k = keys.find(x => x !== last) || keys[0];
      out.push(bucket[k].shift());
      last = k;
    }
    return out;
  }

  /* Trois temps : les rencontres, les révisions, puis le renforcement de chaque
     rencontre. C'est ce renforcement qui remplace l'ancien retour à douze minutes :
     l'élément revient quelques minutes plus tard, dans la même séance, sans
     jamais devenir une échéance. Quand il trouve sa place, elle est réservée dès
     le départ, pour que le compteur de la séance ne s'allonge pas en cours de
     route ; sinon il n'est pas servi, et l'élément revient le lendemain. */
  function start(source) {
    NL.state.touchDay();
    if (source === 'defi') return startDefi();
    if (source === 'fouten') return startMistakes();
    /* Ce que la séance contient, c'est compose() qui le décide — le même appel
       que l'écran d'accueil. */
    const c = NL.srs.compose(source);

    const queue = [];
    /* Brand-new items get met as a matching warm-up before anything is demanded. */
    const newWords = c.fresh.filter(it => it.kind !== 'pattern');
    if (newWords.length >= 4) {
      queue.push({ ex: 'match', task: EX.registry.match.build(newWords.slice(0, 5)), items: newWords.slice(0, 5) });
    }
    /* La mémoire du dernier type traverse les séances : sans elle, chaque
       nouvelle séance repart aveugle. */
    const recent = [];
    const meetings = spread(build(c.fresh, recent), queue.length ? 'match' : NL.state.meta().lastEx || null);
    const reviews = spread(build(U.shuffle(c.due), recent), meetings.length ? meetings[meetings.length - 1].ex : NL.state.meta().lastEx || null);
    queue.push.apply(queue, NL.srs.lace(meetings, reviews, toSay, secondOf));
    queue.forEach((x, i) => { if (x.second) x.metAt = queue.findIndex(y => !y.second && y.ex !== 'match' && y.items[0] === x.items[0]); });

    if (queue.length === 0) { L = null; return false; }
    const built = meetings.concat(reviews);
    if (built.length) NL.state.setMeta({ lastEx: built[built.length - 1].ex });

    L = Object.assign(blankTurn(), {
      source: source || 'vandaag', queue, at: 0, cap: queue.length + 6,
      phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
      newCount: c.fresh.length, combo: 0, bestCombo: 0, lives: null
    });
    arm();
    return !!L.queue.length;
  }

  /* Un second exercice ne revient jamais à moins de SECOND_GAP exercices de son
     élément : la règle et la disposition de la séance sont dans NL.srs.lace().

     Un élément qu'on dit à voix haute pour la première fois revient lui aussi
     une seconde fois, et c'est ce second exercice qui décide de son échelon :
     par écrit s'il vient d'être dit, de nouveau à voix haute sinon. */
  const SECOND_GAP = NL.srs.SECOND_GAP;
  const toSay = x => x.ex === 'speak' && NL.srs.firstAloud(x.items[0]);
  const secondOf = x => ({ ex: null, task: null, items: x.items, second: true });

  /* Une séance sur ce qui résiste : les éléments le plus souvent ratés, chacun à
     l'échelon où il se trouve. Comme le défi, elle ne compte pas dans le budget
     du jour qu'elle n'a pas à attendre, et ses réponses sont de vraies révisions. */
  function startMistakes() {
    const items = NL.srs.mistakes().slice(0, MAX_TASKS).map(x => x.item);
    const queue = spread(build(items, []), NL.state.meta().lastEx || null);
    if (!queue.length) { L = null; return false; }
    L = Object.assign(blankTurn(), {
      source: 'fouten', queue, at: 0, cap: queue.length + 6,
      phase: 'ask', right: 0, wrong: 0, spoken: 0, xp: 0, started: Date.now(), finished: false,
      newCount: 0, combo: 0, bestCombo: 0, lives: null
    });
    return true;
  }

  /* Le renforcement d'une rencontre se construit quand son tour arrive : son exercice
     dépend de l'échelon que l'élément vient d'atteindre. Raté à la rencontre, il
     est redemandé au même échelon ; réussi, à l'échelon suivant.
     Quand plusieurs renforcements se suivent, on sert d'abord celui dont l'exercice
     diffère du précédent — sans jamais rapprocher un renforcement de sa rencontre. */
  function arm() {
    while (L && L.at < L.queue.length && !L.queue[L.at].task) {
      const prev = L.at > 0 ? L.queue[L.at - 1].ex : null;
      const after = L.queue[L.at + 1] && L.queue[L.at + 1].task ? L.queue[L.at + 1].ex : null;
      const avoid = new Set([prev, after].filter(Boolean));
      let at = L.at, name = NL.srs.exerciseFor(L.queue[L.at].items[0], avoid, L.quiet);
      for (let j = L.at + 1; name === prev && j < L.queue.length && !L.queue[j].task; j++) {
        if (!NL.srs.apart(L.queue[j].metAt, L.at)) continue;
        const n = NL.srs.exerciseFor(L.queue[j].items[0], avoid, L.quiet);
        if (n !== prev) { at = j; name = n; }
      }
      const c = L.queue[at];
      L.queue[at] = L.queue[L.at];
      L.queue[L.at] = c;
      try {
        c.ex = name;
        c.task = EX.get(name).build(c.items[0]);
      } catch (e) { L.queue.splice(L.at, 1); }
    }
  }

  /* Une faute sur un élément dont le renforcement attend plus loin n'ajoute pas de
     reprise : le renforcement EST sa seconde chance.

     Sauf à voix haute, tant que l'élément n'a jamais été dit : son second
     exercice doit rester libre pour l'écrire. On le redemande donc à voix haute
     sans l'attendre, quelques exercices plus loin. Dit cette fois, il est écrit
     dans la séance ; sinon c'est ce second exercice qui le redemande à voix
     haute, et l'écrit attend le lendemain. */
  function again(c) {
    const at = L.queue.findIndex((x, i) => i > L.at && x.second && !x.task && x.items[0] === c.items[0]);
    if (at < 0) { if (L.queue.length < L.cap) L.queue.push(retryOf(c)); return; }
    if (c.ex !== 'speak' || c.retry || L.queue.length >= L.cap || !NL.srs.firstAloud(c.items[0])) return;
    const pos = Math.max(L.at + 1, Math.min(L.at + 1 + SECOND_GAP, at - SECOND_GAP));
    L.queue.forEach(x => { if (x.second && x.metAt >= pos) x.metAt++; });
    L.queue.splice(pos, 0, retryOf(c));
    L.queue[at + 1].metAt = pos;
  }

  /* « Je ne peux pas parler » : plus rien à voix haute jusqu'à la fin de la
     séance. Les exercices parlés qui restaient sont retirés sans être notés et
     sans rien prendre au budget du jour : leurs éléments restent dus. Ceux que
     needsVoice() désigne, dont le prochain exercice ne peut être que parlé,
     reviendront à voix haute ; pour les autres, l'exercice sera tiré de
     nouveau, et ils pourront être demandés par écrit. D'autres éléments dus
     prennent leur place, choisis par compose() comme pour toute séance. Rien
     n'est retenu au-delà : la séance suivante redemande. Ce n'est pas un
     réglage, parce qu'un réglage suit l'appareil et s'oublie éteint. */
  function quiet() {
    const c = cur();
    if (!c || c.ex !== 'speak' || L.phase !== 'ask') return;
    NL.speech.abort(); NL.speech.clearRecording();
    L.quiet = true;
    /* Le bilan dira combien d'exercices parlés sont gardés pour la séance suivante. */
    L.putOff = (L.putOff || 0) + L.queue.slice(L.at).filter(x => x.ex === 'speak').length;
    const head = L.queue.slice(0, L.at), rest = L.queue.slice(L.at);
    const spoken = rest.filter(x => x.ex === 'speak').length;
    /* Le second exercice d'un élément qui ne peut être que dit part avec son
       exercice parlé : servi sans parler, il le ferait monter par écrit sans
       qu'il ait jamais été dit. Sa place, elle, est reprise ; la séance
       raccourcit donc d'un exercice par élément mis de côté. */
    const kept = rest.filter(x => x.ex !== 'speak' && !(!x.task && NL.srs.needsVoice(x.items[0])));
    /* Les séances à liste fixe, les fautes et le défi, ne se complètent pas. */
    let more = [];
    if (L.source !== 'fouten' && L.source !== 'defi') {
      const here = new Set();
      L.queue.forEach(x => x.items.forEach(it => here.add(it.id)));
      more = NL.srs.compose(L.source, undefined, { quiet: true, without: here }).due.slice(0, spoken);
    }
    L.queue = settle(head.concat(kept, spread(build(more, [], true), kept.length ? kept[kept.length - 1].ex : null)), L.at);
    Object.assign(L, blankTurn());
    L.phase = 'ask';
    /* Il ne restait que du parlé, et rien n'a encore été répondu : il n'y a pas
       de séance à conclure, ni de journée à compter. */
    if (L.at >= L.queue.length && L.right + L.wrong === 0) { L = null; NL.ui.go('vandaag'); NL.ui.toast(NL.t.quietOnly); return; }
    if (L.at >= L.queue.length) return finish();
    arm();
    if (L.at >= L.queue.length) return finish();
    NL.ui.render();
    autoplay();
  }

  /* Resserrée, la file peut rapprocher un second exercice de son élément : il
     attend alors que SECOND_GAP exercices l'en séparent de nouveau, comme dans
     NL.srs.lace(), et n'est pas servi s'il n'y arrive pas avant la fin. */
  function settle(queue, from) {
    const out = queue.slice(0, from), waiting = [];
    const ripe = () => waiting.findIndex(x => NL.srs.apart(x.metAt, out.length));
    const flush = () => { for (let k = ripe(); k >= 0; k = ripe()) out.push(waiting.splice(k, 1)[0]); };
    queue.slice(from).forEach(x => {
      flush();
      if (x.second) {
        let k = out.length - 1;
        while (k >= 0 && (out[k].second || out[k].ex === 'match' || out[k].items[0] !== x.items[0])) k--;
        x.metAt = k;
        if (!NL.srs.apart(k, out.length)) { waiting.push(x); return; }
      }
      out.push(x);
    });
    flush();
    return out;
  }

  const cur = () => L && L.queue[L.at];
  const active = () => !!(L && !L.finished);
  const abandon = () => { NL.speech.abort(); L = null; };

  function autoplay() {
    const c = cur();
    if (!c || NL.state.meta().autoplay === false) return;
    const ex = EX.get(c.ex);
    if (ex.auto) { const txt = ex.auto(c.task); if (txt) setTimeout(() => NL.speech.say(txt), 150); }
  }

  /* ---------------- grading ---------------- */
  function check() {
    const c = cur(); if (!c) return;
    const ex = EX.get(c.ex);
    if (!ex.ready(c.task, L)) return;
    const v = ex.judge(c.task, L);
    L.phase = v.ok ? 'ok' : 'no';
    L.lastSpoken = !!v.spoken;
    L.close = !!v.close;

    c.items.forEach(it => NL.srs.grade(it, v.ok, { spoken: v.spoken, ex: c.ex, defi: L.source === 'defi' }));
    /* La séance sur les fautes est hors du budget du jour. */
    if (L.source !== 'fouten') NL.srs.spend(1);

    if (v.ok) {
      L.right++;
      L.xp += c.ex === 'speak' ? 4 : L.source === 'defi' ? 3 : 2;
      L.xp += comboUp();
      if (c.ex === 'speak') L.spoken++;
      NL.audio.ok();
    } else {
      L.wrong++;
      L.combo = 0;
      NL.audio.no();
      if (L.source === 'defi') L.lives--;
      else again(c);
    }
    NL.ui.render();
  }

  /* La série : chaque bonne réponse d'affilée la fait monter, la première faute
     la remet à zéro. Au-delà de 5, chaque réponse rapporte un point de plus ;
     au-delà de 10, deux. De quoi avoir une raison de ne pas relâcher. */
  function comboUp() {
    L.combo++;
    L.bestCombo = Math.max(L.bestCombo, L.combo);
    return L.combo >= 10 ? 2 : L.combo >= 5 ? 1 : 0;
  }

  /* La reprise se reconstruit : servie telle quelle, elle garde les mêmes
     options au même endroit, et on y répond de mémoire de position. */
  function retryOf(c) {
    let task = c.task;
    if (c.ex !== 'match') { try { task = EX.get(c.ex).build(c.items[0]); } catch (e) {} }
    return { ex: c.ex, task, items: c.items, retry: true };
  }

  function next() {
    NL.speech.abort(); NL.speech.clearRecording();
    L.at++;
    Object.assign(L, blankTurn());
    L.phase = 'ask';
    if (L.at >= L.queue.length || (L.source === 'defi' && L.lives <= 0)) return finish();
    arm();
    if (L.at >= L.queue.length) return finish();
    NL.ui.render();
    autoplay();
  }

  function skip() {
    const c = cur(); if (!c) return;
    /* Passer le plateau de paires n'enregistre rien : ses éléments ne sont ni
       notés, ni comptés, et la rencontre se fait dans leurs propres exercices. */
    const board = c.ex === 'match';
    if (!board) {
      c.items.forEach(it => NL.srs.grade(it, false, { ex: c.ex }));
      if (L.source !== 'fouten') NL.srs.spend(1);
      L.wrong++;
    }
    L.combo = 0;
    L.close = false;
    L.phase = 'no';
    /* Un plateau passé n'est ni une faute ni une reprise : on le laisse. */
    if (!board) { if (L.source === 'defi') L.lives--; else again(c); }
    NL.audio.no();
    NL.ui.render();
  }

  function finish() {
    L.finished = true;
    const m = NL.state.meta();
    /* Les records se retiennent pour qu'il y ait quelque chose à battre. */
    L.comboRecord = L.bestCombo > (m.bestCombo || 0) && L.bestCombo >= 5;
    L.defiRecord = L.source === 'defi' && L.right > (m.defiBest || 0);
    const patch = { xp: m.xp + L.xp };
    if (L.comboRecord) patch.bestCombo = L.bestCombo;
    if (L.defiRecord) patch.defiBest = L.right;
    L.prevDefiBest = m.defiBest || 0;
    NL.state.setMeta(patch);
    NL.state.creditDay(L.newCount);
    NL.audio.win();
    NL.ui.render();
  }

  /* ---------------- view ---------------- */
  function view() {
    const c = cur();
    const ex = EX.get(c.ex);
    const pct = Math.round(L.at / L.queue.length * 100);
    /* Les unités de toute la séance, lues dans sa file, et non celle de
       l'exercice en cours : à cheval sur deux unités, elle les nomme toutes
       les deux, comme la carte de l'accueil. */
    const span = NL.srs.unitSpan([].concat.apply([], L.queue.map(x => x.items)));

    return '<div class="lesson">' +
      '<div class="lesson-head">' +
      '<button class="iconbtn" data-act="quit" aria-label="' + NL.t.quitYes + '">' + NL.ui.I.x + '</button>' +
      '<div class="rail"><div class="rail-fill" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
      (L.source === 'defi' ? '<span class="lives" aria-label="' + NL.t.defiLives(L.lives) + '">' +
        '❤️'.repeat(Math.max(0, L.lives)) + '<i>' + '♡'.repeat(Math.max(0, DEFI_LIVES - L.lives)) + '</i></span>' : '') +
      (L.combo >= 3 ? '<span class="combo' + (L.combo >= 10 ? ' hot' : '') + '" title="' + NL.t.comboTitle + '">\u{1F525} ' + L.combo + '</span>' : '') +
      '<span class="pill">' + (L.at + 1) + '/' + L.queue.length + '</span>' +
      '</div>' +

      '<div class="lesson-body"><div class="stage">' +
      '<div class="kicker"><span class="sub">' +
      esc(span ? NL.ui.unitLabel(span) : NL.t.wordsEyebrow) +
      (c.retry || c.second ? ' · ' + NL.t.again2 : '') +
      '</span>' + esc(ex.kicker) + '</div>' +
      ex.view(c.task, L, L.phase) +
      '</div></div>' +
      foot(c, ex) +
      '</div>';
  }

  function foot(c, ex) {
    /* Seulement pendant qu'on joue : après « Passer », le pied normal avec
       « Continuer » doit apparaître. Sinon on restait bloqué sur le plateau, et
       chaque nouveau « Passer » ajoutait une reprise et recomptait cinq échecs. */
    if (c.ex === 'match' && L.phase === 'ask') {
      return '<div class="foot"><div class="foot-in">' +
        '<p class="foot-hint">' + NL.t.matchHint + '</p>' +
        '<button class="btn btn-ghost" data-skip="1">' + NL.t.skip + '</button></div></div>';
    }
    if (L.phase === 'ask') {
      const ready = ex.ready(c.task, L);
      return '<div class="foot"><div class="foot-in">' +
        '<button class="btn btn-ghost" data-skip="1">' + NL.t.skip + '</button>' +
        '<button class="btn btn-primary push" data-check="1"' + (ready ? '' : ' disabled') + '>' + NL.t.check + '</button>' +
        '</div></div>';
    }
    const ok = L.phase === 'ok';
    const ans = ex.answer(c.task);
    const it = c.items[0];
    /* Les paliers de la série se fêtent ; une faute d'une seule lettre se dit. */
    const note = ok ? (L.combo === 5 || L.combo === 10 || (L.combo > 10 && L.combo % 5 === 0) ? NL.t.comboMilestone(L.combo) : U.one(NL.t.praise))
      : L.close ? NL.t.almost
        : L.source === 'defi' && L.lives <= 0 ? NL.t.defiOut
          : NL.t.wrongTitle;
    const be = (it && it.be && NL.state.meta().showFlemish !== false) ? it.be : null;
    return '<div class="foot ' + (ok ? 'ok' : 'no') + '"><div class="foot-in">' +
      '<div class="verdict ' + (ok ? 'ok' : 'no') + '">' +
      '<span class="v-icon">' + (ok
        ? '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>') + '</span>' +
      '<div><h5>' + note + '</h5>' +
      (ans ? '<p><b>' + esc(ans) + '</b></p>' : '') +
      (be ? '<p class="v-be">' + NL.t.hereThey + ' <b>' + esc(be) + '</b></p>' : '') +
      (it && it.note ? '<p class="v-note">' + esc(it.note) + '</p>' : '') +
      '</div></div>' +
      '<button class="btn ' + (ok ? 'btn-good' : 'btn-bad') + ' push" data-next="1">' + NL.t.next + '</button>' +
      '</div></div>';
  }

  function emptyState() {
    return '<div class="lesson"><div class="lesson-head">' +
      '<button class="iconbtn" data-act="quit" aria-label="' + NL.t.back + '">' + NL.ui.I.x + '</button></div>' +
      '<div class="lesson-body"><div class="stage empty-stage">' +
      '<h2>' + NL.t.nothingDue + '</h2>' +
      '<p>' + NL.t.nothingDueBody + '</p>' +
      '<button class="btn btn-primary" data-go="leerpad">' + NL.t.nothingDueGo + '</button>' +
      '</div></div></div>';
  }

  function done() {
    const mins = Math.max(1, Math.round((Date.now() - L.started) / 60000));
    const m = NL.state.meta();
    if (L.source === 'defi') return defiDone(mins);
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">' + (L.wrong === 0 ? '\u{1F3AF}' : '\u{2713}') + '</div>' +
      '<h2>' + (L.wrong === 0 ? NL.t.doneFlawless : NL.t.doneOk) + '</h2>' +
      '<p class="done-sub">' + (L.spoken > 0
        ? NL.t.doneSpoken(L.spoken) + (L.putOff > 0 ? ' ' + NL.t.doneSpokenKept(L.putOff) : '')
        : L.putOff > 0 ? NL.t.doneSpokenKept(L.putOff) : NL.t.doneNoSpoken) + '</p>' +
      '<div class="tally">' +
      box('+' + L.xp, NL.t.tallyXp, 'gold') + box(L.right + '/' + (L.right + L.wrong), NL.t.tallyRight, 'blue') +
      box(m.streak, NL.t.tallyDays(m.streak), 'green') + box(mins + 'm', NL.t.tallyTime, '') +
      (L.bestCombo >= 3 ? box('\u{1F525} ' + L.bestCombo, NL.t.tallyCombo, L.comboRecord ? 'gold' : '') : '') +
      '</div>' +
      (L.comboRecord ? '<p class="record">' + NL.t.comboRecord(L.bestCombo) + '</p>' : '') +
      '<div class="done-actions">' +
      '<button class="btn btn-primary wide" data-act="again">' + NL.t.sessionMore + '</button>' +
      (defiReady() ? '<button class="btn btn-blue wide" data-act="defi">⚡ ' + NL.t.defiTitle + '</button>' : '') +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + NL.t.sessionBack + '</button>' +
      '</div></div></div></div>';
  }
  const box = (n, l, c) => '<div class="tally-box ' + c + '"><div class="t-n">' + n + '</div><div class="t-l">' + l + '</div></div>';

  function defiDone(mins) {
    const out = L.lives <= 0, flawless = L.wrong === 0;
    return '<div class="lesson"><div class="lesson-body"><div class="stage done-stage">' +
      '<div class="done-mark">' + (flawless ? '\u{1F3C6}' : out ? '\u{1F494}' : '⚡') + '</div>' +
      '<h2>' + (flawless ? NL.t.defiFlawless : out ? NL.t.defiOver : NL.t.defiSurvived) + '</h2>' +
      '<p class="done-sub">' + NL.t.defiScoreLine(L.right, L.queue.length) + '</p>' +
      '<div class="tally">' +
      box(L.right, NL.t.tallyScore, L.defiRecord ? 'gold' : 'blue') +
      box(Math.max(L.right, L.prevDefiBest), NL.t.tallyRecord, '') +
      box('+' + L.xp, NL.t.tallyXp, 'gold') +
      box('\u{1F525} ' + L.bestCombo, NL.t.tallyCombo, L.comboRecord ? 'gold' : '') +
      '</div>' +
      (L.defiRecord ? '<p class="record">' + NL.t.defiRecord(L.right, L.prevDefiBest) + '</p>'
        : '<p class="done-sub">' + NL.t.defiToBeat(L.prevDefiBest) + '</p>') +
      '<div class="done-actions">' +
      '<button class="btn btn-primary wide" data-act="defi">' + NL.t.defiAgain + '</button>' +
      '<button class="btn btn-ghost wide" data-go="vandaag">' + NL.t.sessionBack + '</button>' +
      '</div></div></div></div>';
  }

  /* ---------------- interaction ---------------- */
  function click(el, d) {
    if (d.act === 'quit') { if (L && !L.finished) NL.ui.openSheet('quit-session'); else { L = null; NL.ui.go('vandaag'); } return; }
    if (d.act === 'again') { L = null; start('vandaag'); NL.ui.render(); autoplay(); return; }
    if (d.act === 'defi') { L = null; if (!start('defi')) { NL.ui.go('vandaag'); NL.ui.toast(NL.t.defiLocked(DEFI_MIN)); return; } NL.ui.render(); autoplay(); return; }
    if (d.check !== undefined) return check();
    if (d.next !== undefined) return next();
    if (d.skip !== undefined) return skip();
    if (d.quiet !== undefined) return quiet();
    if (!L || L.phase !== 'ask') return;

    const c = cur();
    if (d.opt !== undefined) {
      const i = +d.opt;
      if (c.task.opts && !c.task.opts[i]) return;   // no such option on screen
      L.sel = { i };
      NL.ui.render(); return;
    }
    if (d.pick !== undefined) { L.picked.push(+d.pick); NL.ui.render(); return; }
    if (d.unpick !== undefined) { L.picked = L.picked.filter(x => x !== +d.unpick); NL.ui.render(); return; }
    if (d.ins !== undefined) { L.input += d.ins; NL.ui.render(); return; }
    if (d.match !== undefined) return matchTap(d, c.task);
    if (d.mic !== undefined) return mic(d.mic, c.task);
    if (d.rec !== undefined) return recAction(d.rec, c.task);
    if (d.self !== undefined) {
      L.speech.selfRated = d.self === '1';
      NL.ui.render();
      return;
    }
  }

  function matchTap(d, task) {
    const id = d.match, k = +d.k, side = d.side;
    if (!L.matchSel) { L.matchSel = { id, k, side }; L.matchBad = null; NL.ui.render(); return; }
    if (L.matchSel.id === id) { L.matchSel = null; NL.ui.render(); return; }
    if (L.matchSel.side === side) { L.matchSel = { id, k, side }; NL.ui.render(); return; }
    const lk = side === 'l' ? k : L.matchSel.k, rk = side === 'r' ? k : L.matchSel.k;
    if (EX.registry.match.fits(task, lk, rk)) {
      L.matchGone.push('l' + lk, 'r' + rk); L.matchSel = null; NL.audio.ok();
      NL.speech.say(task.pairs[lk].nl);
      if (EX.registry.match.ready(task, L)) { L.right++; L.xp += 2; setTimeout(next, 500); }
      NL.ui.render();
    } else {
      L.matchBad = id; L.matchSel = null; NL.audio.no();
      NL.ui.render();
      setTimeout(() => { if (L) { L.matchBad = null; NL.ui.render(); } }, 340);
    }
  }

  /* Record-and-compare: the speaking path when no recogniser exists. */
  function recAction(action, task) {
    const sp = L.speech;
    if (action === 'stop') { NL.speech.stopRecord(); return; }
    if (action === 'play') { NL.speech.playRecording(); return; }
    if (action === 'both') { NL.speech.playBoth(task.target); return; }

    sp.recState = 'rec'; sp.recErr = null;
    NL.audio.mic(); NL.ui.render();
    NL.speech.record({
      onstart: () => { sp.recTimer = setTimeout(() => NL.speech.stopRecord(), 7000); },
      onstop: () => {
        if (!L) return;
        clearTimeout(L.speech.recTimer);
        L.speech.recState = 'done';
        NL.ui.render();
      },
      onerror: kind => {
        if (!L) return;
        L.speech.recState = 'idle'; L.speech.recErr = kind;
        NL.ui.render();
      }
    });
  }

  function mic(action, task) {
    const sp = L.speech;
    if (action === 'stop') { NL.speech.abort(); sp.phase = 'idle'; NL.ui.render(); return; }
    sp.phase = 'listening'; sp.partial = ''; sp.error = null;
    NL.audio.mic();
    NL.ui.render();
    NL.speech.listen({
      onpartial: txt => { if (L && L.speech.phase === 'listening') { L.speech.partial = txt; NL.ui.render(); } },
      onerror: kind => {
        if (!L) return;
        L.speech.phase = 'idle'; L.speech.error = kind; L.speech.tries++;
        if (kind === 'denied' || kind === 'network' || kind === 'browser') L.speech.selfRated = null;
        NL.ui.render();
      },
      onend: (text, alts) => {
        if (!L || L.speech.phase !== 'listening') return;
        const res = NL.speech.score(alts && alts.length ? alts : [text], task.target);
        L.speech.phase = 'done';
        L.speech.tries++;
        L.speech.pct = res.pct;
        L.speech.parts = res.parts;
        L.speech.heard = res.heard;
        L.speech.ok = res.pass;
        if (res.pass) NL.audio.ok();
        NL.ui.render();
      }
    });
  }

  function input(el) {
    if (!el.classList.contains('textin') || !L) return;
    const c = cur(), ex = EX.get(c.ex);
    const before = ex.ready(c.task, L);
    L.input = el.value;
    const after = ex.ready(c.task, L);
    if (before !== after) {
      const btn = document.querySelector('[data-check]');
      if (btn) btn.disabled = !after;
    }
  }

  function key(e) {
    if (!L || L.finished) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (L.phase === 'ask') check(); else next();
      return;
    }
    if (L.phase !== 'ask') return;
    const c = cur(); if (!c) return;
    const typing = document.activeElement && document.activeElement.tagName === 'INPUT';
    if (/^[1-9]$/.test(e.key) && !typing) {
      const i = +e.key - 1;
      const b = document.querySelector('[data-opt="' + i + '"]') || document.querySelectorAll('.bank .tile')[i];
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    }
    if (e.key === 'Backspace' && !typing && L.picked.length) { e.preventDefault(); L.picked.pop(); NL.ui.render(); }
    if (e.key === 'r' && !typing) { const s = document.querySelector('[data-say]'); if (s) { e.preventDefault(); s.click(); } }
    if (e.key === 'm' && !typing) { const s = document.querySelector('[data-mic]'); if (s) { e.preventDefault(); s.click(); } }
  }

  function after(a) {
    const inp = document.querySelector('.textin');
    if (inp && L && L.phase === 'ask') { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }

  return {
    render(a) {
      if (!L) {
        if (!start(a)) return emptyState();
        setTimeout(autoplay, 80);
      }
      if (L.finished) return done();
      return view();
    },
    click, input, key, after, active, abandon, defiReady, DEFI_MIN,
    /* Read-only, for the headless tests: they need the live task to answer it. */
    peek: () => cur(),
    begin(source) { L = null; if (start(source)) { setTimeout(autoplay, 60); return true; } return false; }
  };
})();
